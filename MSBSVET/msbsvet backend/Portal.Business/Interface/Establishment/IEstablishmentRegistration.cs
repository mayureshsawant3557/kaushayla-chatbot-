
using Portal.Entities.Establishment;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Business.Interface.Establishment
{
    public interface IEstablishmentRegistration
    {
        EstablishmentRegistrationEntity GetEstablishmentRegistration(EstablishmentInput entity);
        string SaveEstablishmentRegistration(EstablishmentRegistrationEntity entity);
    }
}
