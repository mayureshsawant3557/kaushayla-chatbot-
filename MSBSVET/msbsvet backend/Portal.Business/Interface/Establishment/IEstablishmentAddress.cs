
using Portal.Entities.Establishment;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Business.Interface.Establishment
{
    public interface IEstablishmentAddress
    {
        EstablishmentAddressEntity GetEstablishmentAddress(EstablishmentInput entity);
        string SaveEstablishmentAddress(EstablishmentAddressEntity entity);
    }
}
