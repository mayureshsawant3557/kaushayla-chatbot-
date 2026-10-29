namespace Portal.Entities.Authorization
{
    public class AccessTokenPayload
    {
        public int UserId { get; set; }
        public long Exp { get; set; }
    }
}
