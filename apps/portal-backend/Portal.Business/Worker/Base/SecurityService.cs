 
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Portal.Business.Exceptions;
using Portal.Business.Interface.Base;
using Portal.Entities;
using System.Management;
using System.Net;
using System.Net.NetworkInformation;
using System.Runtime.InteropServices;
using System.Runtime.Versioning;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace Portal.Business.Worker.Base;

public class SecurityService : ISecurityService
{
    private readonly HttpContext _httpContext;
    private readonly byte[] _key;
    private readonly byte[] _iv;

    // Cached values for this request (optimization)
    private string? _cachedClientIP = null;
    private string? _cachedUserAgent = null;
    private ClientInfo? _cachedClientInfo = null;
    private string? _cachedMachineId = null;
    private bool? _cachedIsLocalNetwork = null;
    private static readonly Random _random = new Random();

    public SecurityService(IHttpContextAccessor httpContextAccessor, IConfiguration configuration)
    {
        _httpContext = httpContextAccessor.HttpContext ?? throw new ArgumentNullException(nameof(httpContextAccessor.HttpContext));

        var keyBase64 = configuration["Encryption:AesKey"];
        var ivBase64 = configuration["Encryption:AesIV"];

        if (string.IsNullOrEmpty(keyBase64) || string.IsNullOrEmpty(ivBase64))
        {
            throw new ArgumentException("Encryption:AesKey configuration value is missing or empty");
        }

        _key = Convert.FromBase64String(keyBase64);
        _iv = Convert.FromBase64String(ivBase64);

        if (_key.Length != 32 || _iv.Length != 16)
        {
            throw new ArgumentException("AES key must be 32 bytes (256 bits)");
        }
    }

    public string EncryptString(string plainText)
    {
        if (string.IsNullOrEmpty(plainText))
            throw new ArgumentNullException(nameof(plainText));

        byte[] plainBytes = Encoding.UTF8.GetBytes(plainText);

        // Random 12-byte IV (96 bits — optimal for GCM, same as client)
        byte[] iv = new byte[12];
        RandomNumberGenerator.Fill(iv);

        byte[] cipherBytes = new byte[plainBytes.Length];
        byte[] tag = new byte[16]; // 128-bit authentication tag

        using var aesGcm = new AesGcm(_key, 16);
        aesGcm.Encrypt(iv, plainBytes, cipherBytes, tag);

        // Return same structure as client: { encryptedData, iv, tag }
        return JsonSerializer.Serialize(new
        {
            encryptedData = Convert.ToBase64String(cipherBytes),
            iv = Convert.ToBase64String(iv),
            tag = Convert.ToBase64String(tag)
        });
    }
    public string DecryptString(string encryptedData, string iv, string tag)
    {
        // Decode base64 inputs
        byte[] encryptedBytes = Convert.FromBase64String(encryptedData);
        byte[] ivBytes = Convert.FromBase64String(iv);
        byte[] tagBytes = Convert.FromBase64String(tag);

        // Combine ciphertext + tag (same as client expects)
        byte[] cipherWithTag = new byte[encryptedBytes.Length + tagBytes.Length];
        Buffer.BlockCopy(encryptedBytes, 0, cipherWithTag, 0, encryptedBytes.Length);
        Buffer.BlockCopy(tagBytes, 0, cipherWithTag, encryptedBytes.Length, tagBytes.Length);

        // Decrypt using AES-GCM
        byte[] plainBytes = new byte[encryptedBytes.Length];
        using var aesGcm = new AesGcm(_key, 16); // 16 = tag length (128 bits)
        aesGcm.Decrypt(ivBytes, encryptedBytes, tagBytes, plainBytes);

        return Encoding.UTF8.GetString(plainBytes);
    }
    public string EncryptStringFixIV(string plainText)
    {
        if (string.IsNullOrEmpty(plainText))
            throw new ArgumentNullException(nameof(plainText));

        using (Aes aes = Aes.Create())
        {
            aes.Key = _key;
            aes.IV = _iv;
            aes.Mode = CipherMode.CBC;
            aes.Padding = PaddingMode.PKCS7;

            using (ICryptoTransform encryptor = aes.CreateEncryptor(aes.Key, aes.IV))
            using (MemoryStream msEncrypt = new MemoryStream())
            {
                // Prepend IV to encrypted data
                msEncrypt.Write(aes.IV, 0, aes.IV.Length);

                using (CryptoStream csEncrypt = new CryptoStream(msEncrypt, encryptor, CryptoStreamMode.Write))
                using (StreamWriter swEncrypt = new StreamWriter(csEncrypt))
                {
                    swEncrypt.Write(plainText);
                }

                return Convert.ToBase64String(msEncrypt.ToArray());
            }
        }
    }
    public string DecryptStringFixIV(string encryptedText)
    {
        if (string.IsNullOrEmpty(encryptedText))
            throw new ArgumentNullException(nameof(encryptedText));

        byte[] buffer = Convert.FromBase64String(encryptedText);

        using (Aes aes = Aes.Create())
        {
            aes.Key = _key;
            aes.IV = _iv;
            aes.Mode = CipherMode.CBC;
            aes.Padding = PaddingMode.PKCS7;

            using (ICryptoTransform decryptor = aes.CreateDecryptor(aes.Key, aes.IV))
            using (MemoryStream msDecrypt = new MemoryStream(buffer))
            using (CryptoStream csDecrypt = new CryptoStream(msDecrypt, decryptor, CryptoStreamMode.Read))
            using (StreamReader srDecrypt = new StreamReader(csDecrypt))
            {
                return srDecrypt.ReadToEnd();
            }
        }
    }
    public string GenerateEncryptionKey(int keySize = 32)
    {
        using (var rng = RandomNumberGenerator.Create())
        {
            byte[] key = new byte[keySize];
            rng.GetBytes(key);
            return Convert.ToBase64String(key);
        }
    }
    public JsonElement DecryptParams(string encryptedParams)
    {
        if (string.IsNullOrEmpty(encryptedParams))
            throw new NotFoundException("Invalid payload.");

        var decoded = Uri.UnescapeDataString(encryptedParams);

        var envelope = JsonSerializer.Deserialize<EncryptedRequest>(decoded, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        }) ?? throw new NotFoundException("Invalid payload.");

        if (string.IsNullOrEmpty(envelope.EncryptedData)
            || string.IsNullOrEmpty(envelope.Iv)
            || string.IsNullOrEmpty(envelope.Tag))
            throw new NotFoundException("Invalid payload.");

        var decryptedJson = DecryptString(
            envelope.EncryptedData,
            envelope.Iv,
            envelope.Tag
        );

        return JsonDocument.Parse(decryptedJson).RootElement;
    }
    public string GeneratePassword(int length = 8, bool includeUppercase = true, bool includeLowercase = true, bool includeNumbers = true)
    {
        if (length <= 0)
            throw new ArgumentException("Password length must be greater than 0.", nameof(length));

        if (!includeUppercase && !includeLowercase && !includeNumbers)
            throw new ArgumentException("At least one character set must be selected.");

        const string uppercase = "ABCDEFGHJKLMNPQRSTUVWXYZ";
        const string lowercase = "abcdefghjklmnpqrstuvwxyz";
        const string numbers = "123456789";

        var charPool = new StringBuilder();
        var requiredChars = new StringBuilder();

        if (includeUppercase)
        {
            charPool.Append(uppercase);
            requiredChars.Append(uppercase[_random.Next(uppercase.Length)]);
        }
        if (includeLowercase)
        {
            charPool.Append(lowercase);
            requiredChars.Append(lowercase[_random.Next(lowercase.Length)]);
        }
        if (includeNumbers)
        {
            charPool.Append(numbers);
            requiredChars.Append(numbers[_random.Next(numbers.Length)]);
        }

        string pool = charPool.ToString();

        var passwordChars = new char[length];

        for (int i = 0; i < length; i++)
            passwordChars[i] = pool[_random.Next(pool.Length)];

        for (int i = 0; i < requiredChars.Length && i < length; i++)
        {
            int pos = _random.Next(length);
            passwordChars[pos] = requiredChars[i];
        }

        return new string(passwordChars);
    }

    public string HashString(string input)
    {
        if (string.IsNullOrEmpty(input))
            throw new ArgumentNullException(nameof(input));

        using (SHA256 sha256 = SHA256.Create())
        {
            byte[] bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(input));
            return BitConverter.ToString(bytes).Replace("-", "").ToLower();
        }
    }
    public string GenerateSecureToken(int length = 64)
    {
        using (var rng = RandomNumberGenerator.Create())
        {
            byte[] tokenBytes = new byte[length];
            rng.GetBytes(tokenBytes);
            return Convert.ToBase64String(tokenBytes);
        }
    }
    public string MaskContact(string contactType, string contactValue)
    {
        if (string.IsNullOrEmpty(contactValue))
            return contactValue;

        if (contactType.ToLower() == "email")
        {
            var parts = contactValue.Split('@');
            if (parts.Length == 2)
            {
                var local = parts[0];
                var domain = parts[1];
                var maskedLocal = local.Length > 2
                    ? local.Substring(0, 2) + "***"
                    : local;
                return $"{maskedLocal}@{domain}";
            }
        }
        else if (contactType.ToLower() == "sms")
        {
            if (contactValue.Length > 4)
            {
                return contactValue.Substring(0, 2) + "****" + contactValue.Substring(contactValue.Length - 2);
            }
        }

        return contactValue;
    }

    public string SanitizeInput(string input)
    {
        if (string.IsNullOrEmpty(input))
            return input;

        return System.Net.WebUtility.HtmlEncode(input);
    }
    public bool IsValidIpAddress(string ipAddress)
    {
        if (string.IsNullOrWhiteSpace(ipAddress))
            return false;

        return IPAddress.TryParse(ipAddress, out _);
    }



    public string GetClientIpAddress()
    {
        // Return cached value if already computed
        if (_cachedClientIP != null)
            return _cachedClientIP;

        _cachedClientIP = GetClientIpAddressInternal();
        return _cachedClientIP;
    }
    //private string GetClientIpAddressInternal()
    //{
    //    // Priority 1: Check X-Forwarded-For header (most common for proxies/load balancers)
    //    var forwardedFor = _httpContext.Request.Headers["X-Forwarded-For"].FirstOrDefault();
    //    if (!string.IsNullOrEmpty(forwardedFor))
    //    {
    //        // Take the first IP in the chain (original client IP)
    //        var ip = forwardedFor.Split(',').First().Trim();
    //        if (IsValidIpAddress(ip))
    //            return ip;
    //    }

    //    // Priority 2: Check X-Real-IP header (nginx and some other proxies)
    //    var realIP = _httpContext.Request.Headers["X-Real-IP"].FirstOrDefault();
    //    if (!string.IsNullOrEmpty(realIP) && IsValidIpAddress(realIP))
    //    {
    //        return realIP;
    //    }

    //    // Priority 3: Check CF-Connecting-IP (Cloudflare)
    //    var cloudflareIP = _httpContext.Request.Headers["CF-Connecting-IP"].FirstOrDefault();
    //    if (!string.IsNullOrEmpty(cloudflareIP) && IsValidIpAddress(cloudflareIP))
    //    {
    //        return cloudflareIP;
    //    }

    //    // Priority 4: Check X-Client-IP (rare but used by some proxies)
    //    var clientIP = _httpContext.Request.Headers["X-Client-IP"].FirstOrDefault();
    //    if (!string.IsNullOrEmpty(clientIP) && IsValidIpAddress(clientIP))
    //    {
    //        return clientIP;
    //    }

    //    // Priority 5: Check True-Client-IP (Akamai and other CDNs)
    //    var trueClientIP = _httpContext.Request.Headers["True-Client-IP"].FirstOrDefault();
    //    if (!string.IsNullOrEmpty(trueClientIP) && IsValidIpAddress(trueClientIP))
    //    {
    //        return trueClientIP;
    //    }

    //    // Priority 6: Check X-Forwarded (less common variant)
    //    var xForwarded = _httpContext.Request.Headers["X-Forwarded"].FirstOrDefault();
    //    if (!string.IsNullOrEmpty(xForwarded))
    //    {
    //        var ip = xForwarded.Split(',').First().Trim();
    //        if (IsValidIpAddress(ip))
    //            return ip;
    //    }

    //    // Priority 7: Check Forwarded header (RFC 7239 standard)
    //    var forwarded = _httpContext.Request.Headers["Forwarded"].FirstOrDefault();
    //    if (!string.IsNullOrEmpty(forwarded))
    //    {
    //        // Parse "Forwarded: for=192.0.2.60;proto=http;by=203.0.113.43"
    //        var forMatch = System.Text.RegularExpressions.Regex.Match(forwarded, @"for=([^;,\s]+)");
    //        if (forMatch.Success)
    //        {
    //            var ip = forMatch.Groups[1].Value.Trim('"', '[', ']');
    //            if (IsValidIpAddress(ip))
    //                return ip;
    //        }
    //    }

    //    // Priority 8: Check REMOTE_ADDR (Apache/IIS)
    //    var remoteAddr = _httpContext.Request.Headers["REMOTE_ADDR"].FirstOrDefault();
    //    if (!string.IsNullOrEmpty(remoteAddr) && IsValidIpAddress(remoteAddr))
    //    {
    //        return remoteAddr;
    //    }

    //    // Priority 9: Fall back to RemoteIpAddress from connection
    //    var remoteIP = _httpContext.Connection.RemoteIpAddress?.ToString();
    //    if (!string.IsNullOrEmpty(remoteIP))
    //    {
    //        // Handle IPv6 loopback
    //        if (remoteIP == "::1")
    //            return "127.0.0.1";

    //        // Handle IPv4-mapped IPv6 addresses (e.g., ::ffff:192.168.1.1)
    //        if (remoteIP.StartsWith("::ffff:") && remoteIP.Length > 7)
    //        {
    //            var ipv4 = remoteIP.Substring(7);
    //            if (IsValidIpAddress(ipv4))
    //                return ipv4;
    //        }

    //        return remoteIP;
    //    }

    //    return "Unknown";
    //}
   
   
    private string GetClientIpAddressInternal()
    {
        // Priority 1: Check CF-Connecting-IP (Cloudflare)
        var cloudflareIP = _httpContext.Request.Headers["CF-Connecting-IP"]
            .FirstOrDefault();

        if (!string.IsNullOrEmpty(cloudflareIP) &&
            TryExtractCleanIp(cloudflareIP, out var parsedCf))
        {
            return parsedCf;
        }

        // Priority 2: Check X-Forwarded-For header
        var forwardedFor = _httpContext.Request.Headers["X-Forwarded-For"]
            .FirstOrDefault();

        if (!string.IsNullOrEmpty(forwardedFor))
        {
            var firstIp = forwardedFor.Split(',').First().Trim();

            if (TryExtractCleanIp(firstIp, out var parsedFwd))
            {
                return parsedFwd;
            }
        }

        // Priority 3: Check X-Real-IP header
        var realIP = _httpContext.Request.Headers["X-Real-IP"]
            .FirstOrDefault();

        if (!string.IsNullOrEmpty(realIP) &&
            TryExtractCleanIp(realIP, out var parsedReal))
        {
            return parsedReal;
        }

        // Priority 4: Check X-Client-IP header
        var clientIP = _httpContext.Request.Headers["X-Client-IP"]
            .FirstOrDefault();

        if (!string.IsNullOrEmpty(clientIP) &&
            TryExtractCleanIp(clientIP, out var parsedClient))
        {
            return parsedClient;
        }

        // Priority 5: Fall back to RemoteIpAddress
        var remote = _httpContext.Connection.RemoteIpAddress;

        if (remote != null)
        {
            if (remote.IsIPv4MappedToIPv6)
            {
                remote = remote.MapToIPv4();
            }

            var ipStr = remote.ToString();

            if (ipStr == "::1")
            {
                return "127.0.0.1";
            }

            return ipStr;
        }

        return "127.0.0.1";
    }

    private static bool TryExtractCleanIp(string rawIp, out string cleanIp)
    {
        cleanIp = string.Empty;

        if (string.IsNullOrWhiteSpace(rawIp))
            return false;

        rawIp = rawIp.Trim();

        // IPv6 with port: [2001:db8::1]:50443
        if (rawIp.StartsWith("[") && rawIp.Contains("]"))
        {
            var closeIndex = rawIp.IndexOf(']');
            var ipv6 = rawIp.Substring(1, closeIndex - 1);

            if (IPAddress.TryParse(ipv6, out var parsedIpv6))
            {
                cleanIp = NormalizeLoopbackAndMapping(parsedIpv6);
                return true;
            }
        }

        // IPv4 with port: 103.21.244.2:51234
        if (rawIp.Contains(':') &&
            rawIp.IndexOf(':') == rawIp.LastIndexOf(':'))
        {
            var parts = rawIp.Split(':');

            if (IPAddress.TryParse(parts[0], out var parsedIpv4))
            {
                cleanIp = NormalizeLoopbackAndMapping(parsedIpv4);
                return true;
            }
        }

        // Normal IPv4 / IPv6
        if (IPAddress.TryParse(rawIp, out var parsed))
        {
            cleanIp = NormalizeLoopbackAndMapping(parsed);
            return true;
        }

        return false;
    }
    private static string NormalizeLoopbackAndMapping(IPAddress ip)
    {
        if (ip.IsIPv4MappedToIPv6)
            ip = ip.MapToIPv4();

        var ipStr = ip.ToString();

        return ipStr == "::1" ? "127.0.0.1" : ipStr;
    }

    public string GetUserAgent()
    {
        if (_cachedUserAgent != null)
            return _cachedUserAgent;

        _cachedUserAgent = _httpContext.Request.Headers["User-Agent"].FirstOrDefault() ?? "Unknown";
        return _cachedUserAgent;
    }
    public string GetMachineId()
    {
        // Cache machine ID as it doesn't change during request
        if (_cachedMachineId != null)
            return _cachedMachineId;

        _cachedMachineId = GetMachineIdInternal();
        return _cachedMachineId;
    }
    private string GetMachineIdInternal()
    {
        try
        {
            // Try to get MAC address first
            var macAddress = NetworkInterface
                .GetAllNetworkInterfaces()
                .Where(nic => nic.OperationalStatus == OperationalStatus.Up &&
                              nic.NetworkInterfaceType != NetworkInterfaceType.Loopback &&
                              nic.NetworkInterfaceType != NetworkInterfaceType.Tunnel)
                .Select(nic => nic.GetPhysicalAddress().ToString())
                .FirstOrDefault(address => !string.IsNullOrEmpty(address) &&
                                          address != "000000000000");

            if (!string.IsNullOrEmpty(macAddress))
                return macAddress;

            // Only call GetProcessorId if running on Windows
            if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
                return GetProcessorId();
        }
        catch
        {
            // Only call GetProcessorId if running on Windows
            if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
                return GetProcessorId();
        }

        return Environment.MachineName ?? "DEFAULT-MACHINE-ID";
    }
    [SupportedOSPlatform("windows")]
    private string GetProcessorId()
    {
        try
        {
            using (var searcher = new ManagementObjectSearcher("SELECT ProcessorId FROM Win32_Processor"))
            {
                foreach (var obj in searcher.Get())
                {
                    var processorId = obj["ProcessorId"]?.ToString();
                    if (!string.IsNullOrEmpty(processorId))
                        return processorId;
                }
            }
        }
        catch
        {
            // Fallback to machine name
        }

        return Environment.MachineName ?? "DEFAULT-MACHINE-ID";
    }
    public string GetHostName(string ipAddress)
    {
        try
        {
            if (!string.IsNullOrEmpty(ipAddress) && IPAddress.TryParse(ipAddress, out IPAddress ip))
            {
                var hostEntry = Dns.GetHostEntry(ip);
                return hostEntry.HostName;
            }
        }
        catch
        {
            // DNS resolution failed
        }

        return ipAddress;
    }
    public string GetBrowserInfo(string userAgent)
    {
        if (string.IsNullOrEmpty(userAgent))
            return "Unknown Browser";

        // Check for Edge (must come before Chrome check)
        if (userAgent.Contains("Edg/"))
            return "Microsoft Edge";

        // Check for Chrome (but not Edge)
        if (userAgent.Contains("Chrome/") && !userAgent.Contains("Edg/"))
            return "Google Chrome";

        // Check for Firefox
        if (userAgent.Contains("Firefox/"))
            return "Mozilla Firefox";

        // Check for Safari (but not Chrome, as Chrome contains Safari in UA)
        if (userAgent.Contains("Safari/") && !userAgent.Contains("Chrome/"))
            return "Safari";

        // Check for Opera
        if (userAgent.Contains("OPR/") || userAgent.Contains("Opera/"))
            return "Opera";

        // Check for Internet Explorer
        if (userAgent.Contains("MSIE") || userAgent.Contains("Trident/"))
            return "Internet Explorer";

        // Check for Brave (uses Chrome UA but has specific indicators)
        if (userAgent.Contains("Brave/"))
            return "Brave";

        return "Other Browser";
    }
    public string GetOperatingSystem(string userAgent)
    {
        if (string.IsNullOrEmpty(userAgent))
            return "Unknown OS";

        // Windows
        if (userAgent.Contains("Windows NT 10.0"))
            return "Windows 10/11";
        if (userAgent.Contains("Windows NT 6.3"))
            return "Windows 8.1";
        if (userAgent.Contains("Windows NT 6.2"))
            return "Windows 8";
        if (userAgent.Contains("Windows NT 6.1"))
            return "Windows 7";
        if (userAgent.Contains("Windows NT 6.0"))
            return "Windows Vista";
        if (userAgent.Contains("Windows NT 5.1"))
            return "Windows XP";

        // macOS
        if (userAgent.Contains("Mac OS X"))
            return "macOS";

        // Mobile
        if (userAgent.Contains("Android"))
            return "Android";
        if (userAgent.Contains("iPhone"))
            return "iOS (iPhone)";
        if (userAgent.Contains("iPad"))
            return "iOS (iPad)";

        // Linux
        if (userAgent.Contains("Linux"))
            return "Linux";

        // Other
        if (userAgent.Contains("CrOS"))
            return "Chrome OS";

        return "Other OS";
    }
    public ClientInfo GetClientInfo()
    {
        // Return cached client info if already built
        if (_cachedClientInfo != null)
            return _cachedClientInfo;

        var ipAddress = GetClientIpAddress();
        var userAgent = GetUserAgent();

        _cachedClientInfo = new ClientInfo
        {
            IpAddress = ipAddress,
            UserAgent = userAgent,
            HostName = GetHostName(ipAddress),
            Browser = GetBrowserInfo(userAgent),
            OperatingSystem = GetOperatingSystem(userAgent),
            MachineId = GetMachineId(),
            RequestUrl = $"{_httpContext.Request.Scheme}://{_httpContext.Request.Host}{_httpContext.Request.Path}",
            ReferrerUrl = _httpContext.Request.Headers["Referer"].FirstOrDefault() ?? "Direct",
            RequestMethod = _httpContext.Request.Method,
            IsSecureConnection = _httpContext.Request.IsHttps,
            AcceptLanguage = _httpContext.Request.Headers["Accept-Language"].FirstOrDefault() ?? "",
            IsLocalNetwork = IsLocalNetwork()
        };

        return _cachedClientInfo;
    }
    public bool IsLocalNetwork()
    {
        if (_cachedIsLocalNetwork.HasValue)
            return _cachedIsLocalNetwork.Value;

        var ipAddress = GetClientIpAddress();

        if (ipAddress == "Unknown")
        {
            _cachedIsLocalNetwork = false;
            return false;
        }

        _cachedIsLocalNetwork = IsPrivateIPAddress(ipAddress);
        return _cachedIsLocalNetwork.Value;
    }

    private bool IsPrivateIPAddress(string ipAddress)
    {
        if (!IPAddress.TryParse(ipAddress, out IPAddress ip))
            return false;

        // Check for localhost
        if (IPAddress.IsLoopback(ip))
            return true;

        var bytes = ip.GetAddressBytes();

        if (bytes.Length == 4) // IPv4
        {
            // 10.0.0.0/8 (10.0.0.0 - 10.255.255.255)
            if (bytes[0] == 10)
                return true;

            // 172.16.0.0/12 (172.16.0.0 - 172.31.255.255)
            if (bytes[0] == 172 && bytes[1] >= 16 && bytes[1] <= 31)
                return true;

            // 192.168.0.0/16 (192.168.0.0 - 192.168.255.255)
            if (bytes[0] == 192 && bytes[1] == 168)
                return true;

            // 169.254.0.0/16 (169.254.0.0 - 169.254.255.255) - Link-local
            if (bytes[0] == 169 && bytes[1] == 254)
                return true;

            // 127.0.0.0/8 (127.0.0.0 - 127.255.255.255) - Loopback
            if (bytes[0] == 127)
                return true;
        }
        else if (bytes.Length == 16) // IPv6
        {
            // Check for IPv6 private addresses
            // fc00::/7 - Unique Local Addresses
            if (bytes[0] >= 0xfc && bytes[0] <= 0xfd)
                return true;

            // fe80::/10 - Link-local
            if (bytes[0] == 0xfe && (bytes[1] & 0xc0) == 0x80)
                return true;
        }

        return false;
    }
}