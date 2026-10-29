using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Certificate
{
    public class VerificationCertificateRequestEntity
    {
        public long ID { get; set; }
        public string RequestNo { get; set; }
        public string Designation { get; set; }
        public string OrganizationName { get; set; }
        public string OrganizationAddress { get; set; }
        public string PinCode { get; set; }
        public int? StateID { get; set; }
        public int? DistrictID { get; set; }
        public int? TalukaID { get; set; }
        public int? CityID { get; set; }
        public string PrimaryMobile { get; set; }
        public bool? OtpVerified { get; set; }
        public string PaymentStatus { get; set; }
        public string TransactionID { get; set; }
        public decimal? FeeAmount { get; set; }
        public string Status { get; set; }
        public DateTime? CreatedDate { get; set; }
        public long? CreatedBy { get; set; }
        public DateTime? PrintedOn { get; set; }
        public long? UpdatedBy { get; set; }
        public string IPAddress { get; set; }
        public string PageCode { get; set; }
        public int? ProfileID { get; set; }
        public bool? IsActive { get; set; }
        public string Name { get; set; }
    }


}
