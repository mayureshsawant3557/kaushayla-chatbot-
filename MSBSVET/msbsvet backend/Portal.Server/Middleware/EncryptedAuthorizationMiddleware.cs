using global::Portal.Entities.Authorization;
using Org.BouncyCastle.Crypto;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace Portal.Server.Middleware
{ 
    public class EncryptedAuthorizationMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly RSA _rsa;
        public EncryptedAuthorizationMiddleware(RequestDelegate next, RSA rsa)
        {
            _next = next;
            _rsa = rsa;
        }

        public async Task Invoke(HttpContext context)
        {
            // 🔓 Skip anonymous
            var endpoint = context.GetEndpoint();
            if (endpoint?.Metadata.GetMetadata<Microsoft.AspNetCore.Authorization.AllowAnonymousAttribute>() != null)
            {
                await _next(context);
                return;
            }

            if (!context.Request.Headers.TryGetValue("X-Encrypted-Token", out var encryptedToken))
            {
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                return;
            }

            //var aesKey = context.Items["AES_KEY"] as byte[];
            //var aesIV = context.Items["AES_IV"] as byte[];

            //if (aesKey == null || aesIV == null)
            //{
            //    context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            //    return;
            //}

            //var decryptedToken = DecryptAes(encryptedToken!, aesKey, aesIV);

            string decryptedToken;
            try
            {
                decryptedToken = Encoding.UTF8.GetString(
                    _rsa.Decrypt(
                        Convert.FromBase64String(encryptedToken!),
                        RSAEncryptionPadding.OaepSHA256
                    )
                );
            }
            catch
            {
                context.Response.StatusCode = 401;
                return;
            }
            var payload = ValidateToken(decryptedToken);

            if (payload == null)
            {
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                return;
            }

            context.Items["UserId"] = payload.UserId;
            await _next(context);
        }

        private static AccessTokenPayload? ValidateToken(string token)
        {
            try
            {
                var json = Encoding.UTF8.GetString(Convert.FromBase64String(token));
                var payload = JsonSerializer.Deserialize<AccessTokenPayload>(json);

                var now = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
                return payload?.Exp > now ? payload : null;
            }
            catch
            {
                return null;
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

}
