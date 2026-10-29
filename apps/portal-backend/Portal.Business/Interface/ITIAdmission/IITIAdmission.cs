using Portal.Entities;
using Portal.Entities.ITIAdmission;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Business.Interface.ITIAdmission
{
    public interface IITIAdmission
    {
        ITIAdmissionEntity GetIITIAdmissionData(string ITIRegistrationNo, string ITIFirstName, string ITIDOBITI);
        ITIAdmissionEntity GetMSBVAdmissionData(string ApplicationID, string FirstName, string DOB);
        ITIAdmissionEntity GetUserData(string ITIRegistrationNo);

    }
}
