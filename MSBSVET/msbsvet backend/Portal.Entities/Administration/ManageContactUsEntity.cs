using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities
{
    public class ManageContactUsEntity
    {
        public Int64 ID { get; set; }
        public Int32 OfficeID { get; set; }
        public Int32 RegionID { get; set; }
        public Int32 DistrictID { get; set; }
        public string GeoLocation { get; set; }
        public string Website { get; set; }
        public string PhoneNo { get; set; }
        public string Emailid { get; set; }
        public string HelplineNumber { get; set; }
        public string Address { get; set; }
        public string JointDirectorName { get; set; }
        public bool IsActive { get; set; }
        public string ContactUsType { get; set; }
        public string Region { get; set; }
        public string RegionMarathi { get; set; }
        public string District { get; set; }
        public string DistrictMarathi { get; set; }
        public string WebsiteMarathi { get; set; }
        public string PhoneNoMarathi { get; set; }
        public string EmailidMarathi { get; set; }
        public string HelplineNumberMarathi { get; set; }
        public string AddressMarathi { get; set; }
        public string JointDirectorNameMarathi { get; set; }
        public string GeoLocationUrl { get; set; }
        public string UserLoginID { get; set; }
        public string IPAddress { get; set; }
    }
}
