
using Portal.Entities.Establishment;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Business.Interface.Establishment
{
    public interface IEstablishmentEmployee
    {
        EstablishmentEmployeeEntity GetEstablishmentEmployee(EstablishmentInput entity);
        string SaveEstablishmentEmployee(EstablishmentEmployeeEntity entity);
    }
}
