using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.ITISpecification
{
    public class RequirementInstitutionFundingSummaryEntity
    {
        // Requirement Details
        public long RequirementID { get; set; }
        public long UserID { get; set; }
        public string CollegeID { get; set; }
        public string CollegeName { get; set; }
        public string CollegeRegistrationNo { get; set; }
        public long ItemID { get; set; }
        public string ItemName { get; set; }
        public string ItemCode { get; set; }
        public long SectorID { get; set; }
        public string SectorName { get; set; }
        public long CategoryID { get; set; }
        public string CategoryName { get; set; }
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
        public string ApprovedBy { get; set; }
        public string Remarks { get; set; }
        public DateTime CreatedDateTime { get; set; }
        public DateTime? ModifiedDateTime { get; set; }
        public decimal EstimatedPrice { get; set; }
        public string SpecificationDocument { get; set; }

        // College Location Details
        public string CollegeStateID { get; set; }
        public string CollegeDistrictID { get; set; }
        public string CollegeTalukaID { get; set; }
    }

    public class RequirementFundingTotalsEntity
    {
        public int TotalRequirements { get; set; }
        public int TotalInstitutes { get; set; }
        public decimal DPDC_TotalAllottedToInstitute_Sum { get; set; }
        public decimal PPP_BalanceAsOnDate_Sum { get; set; }
        public decimal StateFund_Total_Sum { get; set; }
        public decimal GrandTotal_Sum { get; set; }



        public string AppliedFinancialYear { get; set; }
        public string AppliedStateFilter { get; set; }
        public string AppliedDistrictFilter { get; set; }
        public string AppliedTalukaFilter { get; set; }
    }

    public class RequirementInstitutionFundingResponse
    {
        public List<RequirementInstitutionFundingSummaryEntity> Requirements { get; set; }
        public RequirementFundingTotalsEntity Summary { get; set; }
    }

}
