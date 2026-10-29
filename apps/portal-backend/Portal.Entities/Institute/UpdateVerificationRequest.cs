using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Institute
{
    public class UpdateVerificationRequest
    {
        public long InstituteID { get; set; }
        public string Remark { get; set; }
        public string Status { get; set; }    
        public string PageCode { get; set; }  
        public string CreatedBy { get; set; }
        public string IpAddress { get; set; }
    }

    
}
