using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.DVETO
{
    public class DVETOFundAllocationEntity
    {
        public int FinancialYearID { get; set; }
        public int DistrictID { get; set; }
        public int MajorHeadID { get; set; }

        public decimal Head1TotalAllocation { get; set; }
        public decimal Head2TotalAllocation { get; set; }
        public decimal Head3TotalAllocation { get; set; }
        public decimal Head4TotalAllocation { get; set; }
        public decimal Head5TotalAllocation { get; set; }
        public decimal Head6TotalAllocation { get; set; }
        public decimal Head7TotalAllocation { get; set; }
        public decimal Head8TotalAllocation { get; set; }

        public decimal DistrictFundForBooks { get; set; }
        public decimal DistrictFundForMET { get; set; }

        public string InstituteData { get; set; }

        public int CreatedBy { get; set; }
    }
}
