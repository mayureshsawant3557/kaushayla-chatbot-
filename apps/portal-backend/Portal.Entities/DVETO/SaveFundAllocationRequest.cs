using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.DVETO
{
    public class SaveFundAllocationRequest
    {
        public List<FundAllocationEntity> Data { get; set; }

        public int UserID { get; set; }
    }

    public class FundAllocationEntity
    {
        public int FinancialYearID { get; set; }

        public int DistrictID { get; set; }

        public string SectionCode { get; set; }

        public string HeadCode { get; set; }

        public string AllocationTypeCode { get; set; }

        public int? InstituteID { get; set; }

        public decimal Amount { get; set; }

        public string Remarks { get; set; }
    }

    public class FundAllocationSaveEntity
    {
        public string JsonData { get; set; }

        public int UserID { get; set; }
    }
}
