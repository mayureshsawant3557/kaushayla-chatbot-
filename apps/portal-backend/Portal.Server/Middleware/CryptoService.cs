using Portal.Server.Middleware;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

public class CryptoService : ICryptoService
{
    private readonly RSA _rsa;

    public CryptoService(RSA rsa)
    {
        _rsa = rsa;
    }

    public (string json, byte[] key, byte[] iv) DecryptRequest(
        string encryptedKey,
        string encryptedData,
        string tag)
    {
        encryptedKey = Uri.UnescapeDataString(encryptedKey);
        encryptedData = Uri.UnescapeDataString(encryptedData);
        tag = Uri.UnescapeDataString(tag);

        // 🔓 RSA decrypt → base64(key+iv)
        var encryptedKeyBytes = Convert.FromBase64String(encryptedKey);

        var keyIvBase64 = Encoding.UTF8.GetString(
            _rsa.Decrypt(encryptedKeyBytes, RSAEncryptionPadding.OaepSHA256)
        );

        // 🔓 base64 → raw bytes
        var keyIvBytes = Convert.FromBase64String(keyIvBase64);

        var key = keyIvBytes[..32];   // AES-256
        var iv = keyIvBytes[32..44]; // 12 bytes for GCM

        // 🔓 AES-GCM decrypt payload
        var cipherText = Convert.FromBase64String(encryptedData);
        var tagBytes = Convert.FromBase64String(tag);

        var plainBytes = new byte[cipherText.Length];

        using var aes = new AesGcm(key);
        aes.Decrypt(iv, cipherText, tagBytes, plainBytes);

        return (Encoding.UTF8.GetString(plainBytes), key, iv);
    }

    public object EncryptResponse(object data, byte[] key, byte[] iv)
    {
        var json = JsonSerializer.Serialize(data);
        var plainBytes = Encoding.UTF8.GetBytes(json);

        var cipherText = new byte[plainBytes.Length];
        var tag = new byte[16];

        using var aes = new AesGcm(key);
        aes.Encrypt(iv, plainBytes, cipherText, tag);

        return new
        {
            encryptedData = Convert.ToBase64String(cipherText),
            tag = Convert.ToBase64String(tag)
        };
    }
}

//using Portal.Server.Middleware;
//using System.Security.Cryptography;
//using System.Text;

//public class CryptoService : ICryptoService
//{
//    private readonly RSA _rsa;

//    public CryptoService(RSA rsa)
//    {
//        _rsa = rsa;
//    }

//    public (byte[] key, byte[] iv) DecryptKey(string encryptedKey)
//    {
//        var rsaBytes = Convert.FromBase64String(
//            Uri.UnescapeDataString(encryptedKey)
//        );

//        var keyIv = _rsa.Decrypt(
//            rsaBytes,
//            RSAEncryptionPadding.OaepSHA256
//        );

//        return (keyIv[..32], keyIv[32..44]);
//    }

//    public string DecryptAes(string cipherBase64, string tagBase64, byte[] key, byte[] iv)
//    {
//        var cipher = Convert.FromBase64String(cipherBase64);
//        var tag = Convert.FromBase64String(tagBase64);

//        var plain = new byte[cipher.Length];
//        using var aes = new AesGcm(key);
//        aes.Decrypt(iv, cipher, tag, plain);

//        return Encoding.UTF8.GetString(plain);
//    }

//    public object EncryptResponse(object data, byte[] key, byte[] iv)
//    {
//        var json = JsonSerializer.Serialize(data);
//        var plainBytes = Encoding.UTF8.GetBytes(json);

//        var cipher = new byte[plainBytes.Length];
//        var tag = new byte[16];

//        using var aes = new AesGcm(key);
//        aes.Encrypt(iv, plainBytes, cipher, tag);

//        return new
//        {
//            encryptedData = Convert.ToBase64String(cipher),
//            tag = Convert.ToBase64String(tag)
//        };
//    }
//}
