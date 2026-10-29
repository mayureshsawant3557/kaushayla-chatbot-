using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace Portal.Server.Middleware;

public class HybridDecryptMiddleware
{
    private readonly RequestDelegate _next;
    private readonly RSA _rsa;

    public HybridDecryptMiddleware(RequestDelegate next, RSA rsa)
    {
        _next = next;
        _rsa = rsa;
    }

    public async Task Invoke(HttpContext context)
    {
        if (context.Request.Method == HttpMethods.Get)
        {
            await _next(context);
            return;
        }
        // Only JSON requests
        if (!context.Request.ContentType?.Contains("application/json") ?? true)
        {
            await _next(context);
            return;
        }

        // Required headers
        if (!context.Request.Headers.TryGetValue("X-Encrypted-Key", out var encryptedKey) ||
            !context.Request.Headers.TryGetValue("X-Encrypted-IV", out var encryptedIV))
        {
            if (context.Request.Path.StartsWithSegments("/api/PromotionalOrganisation/VerifyDocumentOcr", StringComparison.OrdinalIgnoreCase) ||
                context.Request.Path.StartsWithSegments("/api/chatbot", StringComparison.OrdinalIgnoreCase) ||
                context.Request.Path.StartsWithSegments("/api/chat", StringComparison.OrdinalIgnoreCase) ||
                context.Request.Path.StartsWithSegments("/api/tts", StringComparison.OrdinalIgnoreCase))
            {
                await _next(context);
                return;
            }

            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            await context.Response.WriteAsync("Missing encryption headers");
            return;
        }

        try
        {
            // 🔓 RSA decrypt AES key & IV
            var aesKey = _rsa.Decrypt(
                Convert.FromBase64String(encryptedKey!),
                RSAEncryptionPadding.OaepSHA256
            );

            //var aesIV = _rsa.Decrypt(
            //    Convert.FromBase64String(encryptedIV!),
            //    RSAEncryptionPadding.OaepSHA256
            //);
            var aesIV = Convert.FromBase64String(encryptedIV!);
            Console.WriteLine(aesKey.Length); // 32
            Console.WriteLine(aesIV.Length);  // 16
            // 📥 Read encrypted body
            context.Request.EnableBuffering();

            using var reader = new StreamReader(context.Request.Body, Encoding.UTF8, leaveOpen: true);
            var encryptedBody = await reader.ReadToEndAsync();
            context.Request.Body.Position = 0;

            if (string.IsNullOrWhiteSpace(encryptedBody))
            {
                await _next(context);
                return;
            }

            // 🔐 AES decrypt body
            //var decryptedJson = DecryptAes(encryptedBody, aesKey, aesIV);
            var payload = JsonSerializer.Deserialize<JsonElement>(encryptedBody);

            var cipherText = payload.GetProperty("cipherText").GetString();

            var decryptedJson = DecryptAes(cipherText!, aesKey, aesIV);

            // 🔄 Replace request body
            var decryptedBytes = Encoding.UTF8.GetBytes(decryptedJson);
            context.Request.Body = new MemoryStream(decryptedBytes);
            context.Request.ContentLength = decryptedBytes.Length;
            context.Items["AES_KEY"] = aesKey;
            context.Items["AES_IV"] = aesIV;

            await _next(context);
        }
        catch (CryptographicException)
        {
            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            await context.Response.WriteAsync("Invalid encrypted payload");
        }
    }

    private static string DecryptAes(string cipherTextBase64, byte[] key, byte[] iv)
    {
        using var aes = Aes.Create();
        aes.Key = key;
        aes.IV = iv;
        aes.Padding = PaddingMode.PKCS7;
        aes.Mode = CipherMode.CBC;

        var cipherBytes = Convert.FromBase64String(cipherTextBase64);

        using var decryptor = aes.CreateDecryptor();
        using var ms = new MemoryStream(cipherBytes);
        using var cs = new CryptoStream(ms, decryptor, CryptoStreamMode.Read);
        using var sr = new StreamReader(cs, Encoding.UTF8);

        return sr.ReadToEnd();
    }
}
