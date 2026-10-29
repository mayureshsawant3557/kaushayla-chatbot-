namespace Portal.Entities.Authorization;

public class RefreshToken
{
    public long Id { get; set; }
    public long UserId { get; set; }

    public string Token { get; set; } = null!;
    public Int64 RefreshTokenID { get; set; }
    public DateTime ExpiresAt { get; set; }

    public bool IsRevoked { get; set; }
    public DateTime CreatedAt { get; set; }

    public string? ReplacedByToken { get; set; }
    public string? UserLoginID { get; set; }
    public int UserTypeID { get; set; }
}
