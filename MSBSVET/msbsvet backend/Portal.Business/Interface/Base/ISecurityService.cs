
using Portal.Entities;
using System.Text.Json;

namespace Portal.Business.Interface.Base;

public interface ISecurityService
{
    string EncryptString(string plainText);
    string DecryptString(string encryptedData, string iv, string tag);
    string EncryptStringFixIV(string plainText);
    string DecryptStringFixIV(string encryptedText);
    string GenerateEncryptionKey(int keySize = 32);
    JsonElement DecryptParams(string encryptedParams);
    string GeneratePassword(int length = 8, bool includeUppercase = true, bool includeLowercase = true, bool includeNumbers = true);

    string HashString(string input);
    string GenerateSecureToken(int length = 32);
    string MaskContact(string contactType, string contactValue);

    string SanitizeInput(string input);
    bool IsValidIpAddress(string ipAddress);

    string GetClientIpAddress();
    string GetUserAgent();
    string GetMachineId();
    string GetHostName(string ipAddress);
    string GetBrowserInfo(string userAgent);
    string GetOperatingSystem(string userAgent);
    ClientInfo GetClientInfo();
    bool IsLocalNetwork();
}