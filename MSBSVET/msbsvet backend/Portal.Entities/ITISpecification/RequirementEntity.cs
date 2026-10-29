using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.ITISpecification
{
    public class RequirementEntity
    {
        public long ID { get; set; }
        public long UserID { get; set; }
        public string? CollegeID { get; set; }
        public int ItemID { get; set; }
        public int SectorID { get; set; }
        public int CategoryID { get; set; }
        public decimal DistrictFund { get; set; }
        public decimal PPP { get; set; }
        public decimal StateFund { get; set; }
        public decimal RequiredAsPerNorms { get; set; }
        public decimal Available { get; set; }

        public decimal Total { get; set; }
        public string FinancialYear { get; set; }
        public string Status { get; set; }
        public DateTime? SubmittedDate { get; set; }
        public DateTime? ApprovedDate { get; set; }
        public long? ApprovedBy { get; set; }
        public string Remarks { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedDateTime { get; set; }
        public string CreatedBy { get; set; }
        public string CreatedByIPAddress { get; set; }
        public DateTime? ModifiedDateTime { get; set; }
        public string? ModifiedBy { get; set; }
        public string ModifiedByIPAddress { get; set; }

        // Display properties
        public string ItemName { get; set; }
        public string ItemCode { get; set; }
        public string SectorName { get; set; }
        public string CategoryName { get; set; }
        public string CollegeName { get; set; }
        public string CollegeRegistrationNo { get; set; }
        public decimal EstimatedPrice { get; set; }
        public string SpecificationDocument { get; set; }
        public string CreatedByName { get; set; }
        public string ModifiedByName { get; set; }
        public string ApprovedByName { get; set; }
    }

}
