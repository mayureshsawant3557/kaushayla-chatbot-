using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Administration
{
    public class UserEntity
    {
        public Int64 UserID { get; set; }
        public Int32 UserTypeID { get; set; }
        public string UserType { get; set; }       
        public string UserLoginID { get; set; }
        public string UserPassword { get; set; }
        public string UserName { get; set; }
        public string UserMobileNo { get; set; }
        public string UserEMailID { get; set; }
        public Int32 DistrictID { get; set; }
        public string IsActive { get; set; }
        public string ActivOrDeactive { get; set; }
        public Int16 RegionID { get; set; }
        public string ModifiedBy { get; set; }
        public string ModifiedByIPAddress { get; set; }
    }
}
