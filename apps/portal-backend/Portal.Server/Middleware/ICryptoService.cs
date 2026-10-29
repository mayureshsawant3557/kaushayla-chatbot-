namespace Portal.Server.Middleware;

public interface ICryptoService
{
    (string json, byte[] key, byte[] iv) DecryptRequest(
        string encryptedKey,
        string encryptedData,
        string tag
    );
    object EncryptResponse(object data, byte[] key, byte[] iv);
    //(byte[] key, byte[] iv) DecryptKey(string encryptedKey);
    //object EncryptResponse(object data, byte[] key, byte[] iv);
    //string DecryptAes(string cipherBase64, string tagBase64, byte[] key, byte[] iv);
}