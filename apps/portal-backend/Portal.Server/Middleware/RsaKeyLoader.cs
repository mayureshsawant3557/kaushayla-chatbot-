using System.Security.Cryptography;
using System.Text.RegularExpressions;

namespace Portal.Server.Middleware;

public static class RsaKeyLoader
{
    /// <summary>
    /// Load an RSA private key from a PEM string (PKCS#1 or PKCS#8)
    /// </summary>
    public static RSA LoadPrivateKey(string pem)
    {
        if (string.IsNullOrWhiteSpace(pem))
            throw new ArgumentException("PEM string is null or empty");

        pem = pem.Trim();

        // Remove surrounding quotes if present
        if (pem.StartsWith("\"") && pem.EndsWith("\""))
            pem = pem[1..^1];

        // Convert escaped newlines to real newlines
        pem = pem
            .Replace("\\r\\n", "\n")
            .Replace("\\n", "\n")
            .Replace("\\r", "\n");

        Console.WriteLine("---- RAW PEM START ----");
        Console.WriteLine(pem);
        Console.WriteLine("---- RAW PEM END ----");
        var rsa = RSA.Create();
        try
        {
            Console.WriteLine($"RSA KeySize: {rsa.KeySize}");
            rsa.ImportFromPem(pem);
            return rsa;
        }
        catch (ArgumentException ex)
        {
            // Debug: This helps identify if the string is a path or missing headers
            throw new Exception($"PEM Import failed. Ensure headers are present. Start: {pem.Substring(0, Math.Min(20, pem.Length))}", ex);
        }
    }
}
