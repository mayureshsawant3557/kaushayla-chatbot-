using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.ITISpecification
{
    public class FundEntity
    {
        public int FundID { get; set; }
        public string InstituteID { get; set; }
        public int FinancialPeriodID { get; set; }
        public string FinancialYear { get; set; }
        public DateTime AsOnDate { get; set; }
        public decimal AllocatedFunds { get; set; }
        public decimal FundsAvailable { get; set; }
        public string AllocationYear { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedDateTime { get; set; }
        public string CreatedBy { get; set; }
    }
}
