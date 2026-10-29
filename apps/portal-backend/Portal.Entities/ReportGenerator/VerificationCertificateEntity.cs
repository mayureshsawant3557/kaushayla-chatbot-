using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.ReportGenerator
{
    public class VerificationCertificateEntity
    {
        public string ProfileID { get; set; }
        public string Name { get; set; }
        public string Designation { get; set; }
        public string OrganizationName { get; set; }
        public string OrganizationAddress { get; set; }
        public string PinCode { get; set; }
        public int StateID { get; set; }
        public int DistrictID { get; set; }
        public int TalukaID { get; set; }
        public int CityID { get; set; }
        public string PrimaryMobile { get; set; }
        public bool OtpVerified { get; set; }
        public int UserLoginID { get; set; }
        public string IPAddress { get; set; }
        public string PageCode { get; set; }

        // Update-specific properties (nullable for initial requests)
        public string RequestNo { get; set; }
        public string PaymentStatus { get; set; }
        public string TransactionID { get; set; }
        public decimal? FeeAmount { get; set; }
        public string Status { get; set; }
        public bool IsUpdate { get; set; } = false;
    }

}
