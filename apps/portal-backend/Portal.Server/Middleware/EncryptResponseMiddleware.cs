using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace Portal.Server.Middleware;

public class EncryptResponseMiddleware
{
    private readonly RequestDelegate _next;

    public EncryptResponseMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task Invoke(HttpContext context)
    {
        // Capture original response body
        var content = context.Response.ContentType;
        var originalBody = context.Response.Body;

        using var memStream = new MemoryStream();
        context.Response.Body = memStream;

        await _next(context);

        //added   new code  by our side to chake pdf , Zip 
        if (string.IsNullOrEmpty(context.Response.ContentType) ||
    !context.Response.ContentType.Contains("application/json"))
        {
            memStream.Position = 0;
            await memStream.CopyToAsync(originalBody);
            return;
        }

        // Encrypt only if request was encrypted
        if (!context.Request.Headers.ContainsKey("X-Encrypted"))
        {
            memStream.Position = 0;
            await memStream.CopyToAsync(originalBody);
            return;
        }

        // Read AES key & IV stored by request middleware
        if (!context.Items.TryGetValue("AES_KEY", out var keyObj) ||
            !context.Items.TryGetValue("AES_IV", out var ivObj))
        {
            memStream.Position = 0;
            await memStream.CopyToAsync(originalBody);
            return;
        }

        var key = (byte[])keyObj!;
        var iv = (byte[])ivObj!;

        

        memStream.Position = 0;
        var responseText = await new StreamReader(memStream).ReadToEndAsync();

        // 🔒 Ensure JSON before encryption
        string jsonToEncrypt;

        try
        {
            // If already JSON → keep it
            JsonDocument.Parse(responseText);
            jsonToEncrypt = responseText;
        }
        catch
        {
            // If plain text → wrap it
            jsonToEncrypt = JsonSerializer.Serialize(new
            {
                error = responseText
            });
        }

        var encrypted = EncryptAes(jsonToEncrypt, key, iv);

        context.Response.Headers["X-Encrypted"] = "true";
        context.Response.ContentType = "application/json";

        var payload = JsonSerializer.Serialize(new
        {
            cipherText = encrypted
        });

        var bytes = Encoding.UTF8.GetBytes(payload);
        context.Response.ContentLength = bytes.Length;

        await originalBody.WriteAsync(bytes);
    }

    private static string EncryptAes(string plainText, byte[] key, byte[] iv)
    {
        using var aes = Aes.Create();
        aes.Key = key;
        aes.IV = iv;
        aes.Mode = CipherMode.CBC;
        aes.Padding = PaddingMode.PKCS7;

        using var encryptor = aes.CreateEncryptor();
        var inputBytes = Encoding.UTF8.GetBytes(plainText);
        var cipherBytes = encryptor.TransformFinalBlock(inputBytes, 0, inputBytes.Length);

        return Convert.ToBase64String(cipherBytes);
    }
}
