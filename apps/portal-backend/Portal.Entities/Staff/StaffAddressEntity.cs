using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Staff
{
    public class StaffAddressEntity
    {
        public Int64 StaffID { get; set; }
        public string PAddress { get; set; }
        public Int16 PStateID { get; set; }
        public Int32 PDistrictID { get; set; }
        public Int32 PTalukaID { get; set; }
        public Int32 PCityID { get; set; }
        public string POtherCity { get; set; }
        public string PPincode { get; set; }
        public Int16 IsPPincodeCorrect { get; set; }
        public Int16 IsCAddressSameAsPAddress { get; set; }
        public string CAddress { get; set; }
        public Int16 CStateID { get; set; }
        public Int32 CDistrictID { get; set; }
        public Int32 CTalukaID { get; set; }
        public Int32 CCityID { get; set; }
        public string COtherCity { get; set; }
        public string CPincode { get; set; }
        public Int16 IsCPincodeCorrect { get; set; }
        public string UserLoginID { get; set; }
        public string IPAddress { get; set; }
        public string PageCode { get; set; }
    }
}
