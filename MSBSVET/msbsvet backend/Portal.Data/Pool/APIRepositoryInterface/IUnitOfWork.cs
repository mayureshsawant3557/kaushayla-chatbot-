namespace Portal.Data
{
    public interface IUnitOfWork
    {
        IAPIBaseRepository baseRepository { get; }
    }
}
