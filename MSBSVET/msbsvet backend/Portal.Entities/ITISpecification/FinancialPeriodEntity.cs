using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.ITISpecification
{
    public class FinancialPeriodEntity
    {
        public int FinancialPeriodID { get; set; }
        public string FinancialYear { get; set; }
        public DateTime AsOnDate { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedDateTime { get; set; }
        public string CreatedBy { get; set; }
        public string PeriodStatus { get; set; }
        public int LinkedRecordsCount { get; set; }
    }
}
