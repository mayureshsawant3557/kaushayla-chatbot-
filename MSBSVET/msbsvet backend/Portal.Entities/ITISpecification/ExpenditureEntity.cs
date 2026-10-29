using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.ITISpecification
{
    public class ExpenditureEntity
    {
        public int ExpenditureID { get; set; }
        public string InstituteID { get; set; }
        public int FinancialPeriodID { get; set; }
        public string FinancialYear { get; set; }
        public DateTime AsOnDate { get; set; }
        public decimal CivilWorks { get; set; }
        public decimal Equipment { get; set; }
        public decimal Furniture { get; set; }
        public decimal LearningResources { get; set; }
        public decimal AdditionalManpower { get; set; }
        public decimal Consumable { get; set; }
        public decimal Miscellaneous { get; set; }
        public decimal Total { get; set; }
        public decimal ExpenditureIncurredTillDate { get; set; }
        public string FieldStatus { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedDateTime { get; set; }
        public string CreatedBy { get; set; }
        public DateTime? ModifiedDateTime { get; set; }
        public string ModifiedBy { get; set; }
        public long UserLoginID { get; set; }
        public string IPAddress { get; set; }
    }
}
