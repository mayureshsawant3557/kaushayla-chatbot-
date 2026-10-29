using Portal.Entities;
using Portal.Entities.Registration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Business.Interface.UnauthorizedInstitute
{
    public interface IUnauthorizedInstitute
    {
        RegisterComplaintEntity GetUnauthorizedInstituteDetails(string ComplaintNo);
    }
}
