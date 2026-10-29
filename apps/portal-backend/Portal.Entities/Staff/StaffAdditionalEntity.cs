using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Staff
{
    public class StaffAdditionalEntity
    {
        public Int64 StaffID { get; set; }
        public Int16 BloodGroupID { get; set; }
        public Int16 MotherTongueID { get; set; }
        public string UserLoginID { get; set; }
        public string IPAddress { get; set; }
        public string PageCode { get; set; }
    }
}
