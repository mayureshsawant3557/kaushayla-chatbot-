using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Institute
{
    public class DPDCDetailsEntity
    {
        public int CollegeID { get; set; }
        public string CollegeRegistrationNo { get; set; }
        public string InstituteName { get; set; }
        public string DistrictName { get; set; }
        public int CollegeDistrictID { get; set; }
        public int? FundID { get; set; }
        public string FinancialYear { get; set; }
        public decimal? Available_2203_District { get; set; }
        public decimal? Allotted_2203_Institute { get; set; }
        public decimal? Available_2230_District { get; set; }
        public decimal? Allotted_2230_Institute { get; set; }
        public decimal? TotalAvailable { get; set; }
        public decimal? TotalAllottedToInstitute { get; set; }
        public bool? FundIsActive { get; set; }
        public DateTime? CreatedDateTime { get; set; }
        public string CreatedBy { get; set; }
        public string CreatedByIPAddress { get; set; }
        public DateTime? ModifiedDateTime { get; set; }
        public string ModifiedBy { get; set; }
        public string ModifiedByIPAddress { get; set; }
    }

}
