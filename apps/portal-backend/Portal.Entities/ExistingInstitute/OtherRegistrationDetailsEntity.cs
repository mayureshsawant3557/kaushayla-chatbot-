using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.ExistingInstitute
{
    public class OtherRegistrationDetailsEntity
    {
        public Int64 InstituteID { get; set; }
        public Int64 ParticularID { get; set; }
        public Int64 ID { get; set; }
        public string Particular { get; set; }
        public string InstituteCode { get; set; }

        public string RegisteredName { get; set; }

        public DateTime ApprovalDate { get; set; }

        public string ApprovalOrderPath { get; set; }

        public string UserLoginID { get; set; }
        public string IPAddress { get; set; }
        public string IsVerified { get; set; }
        public string Remark { get; set;}
 

    }
}
