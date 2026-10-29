using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Institute
{
    public class InstituteMemberEntity
    {
        public Int16 MemberTypeID { get; set; }
        public string MemberType { get; set; }
        public string MemberName { get; set; }
        public string Designation { get; set; }        
        public string MobileNo { get; set; }
        public string AltMobileNo { get; set; }
        public string EMailiD { get; set; }        
        public string PhoneNo { get; set; }
    }
}
