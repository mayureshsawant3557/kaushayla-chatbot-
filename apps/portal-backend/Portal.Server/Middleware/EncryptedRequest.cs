namespace Portal.Server.Middleware;

public class EncryptedRequest
{
    public string EncryptedKey { get; set; } = "";
    public string EncryptedData { get; set; } = "";
    public string Tag { get; set; } = "";
}
