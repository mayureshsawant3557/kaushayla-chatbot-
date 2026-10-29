using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.ITISpecification
{
    public class RepaymentEntity
    {
        public int RepaymentID { get; set; }
        public string InstituteID { get; set; }
        public int FinancialPeriodID { get; set; }
        public string FinancialYear { get; set; }
        public int FinancialYearDisplay { get; set; }
       // public string RepaymentSchedule { get; set; }
        public decimal RepaymentAmountAsPerSchedule { get; set; }
        public decimal? ActualRepaymentAmount { get; set; }
        public DateTime? DateOfRepayment { get; set; }
        public decimal TotalRepaymentDone { get; set; }
        public string PaymentMode { get; set; }
        public string TransactionReference { get; set; }
        public string Remarks { get; set; }
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
