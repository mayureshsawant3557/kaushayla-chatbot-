//using Microsoft.Extensions.Configuration;

using Microsoft.Extensions.Configuration;
using System.Configuration;

namespace Portal.Data
{
    public class UnitOfWork : IUnitOfWork
    {
        public IAPIBaseRepository baseRepository { get; private set; }
        public UnitOfWork(IConfiguration configuration)
        {
            baseRepository = new APIBaseRepository(configuration);
        }

       
    }
}
