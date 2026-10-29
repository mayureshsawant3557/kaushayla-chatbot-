using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.ITISpecification
{
    //public class PPPFundStatusEntity
    //{

    //    public int SerialNo { get; set; }
    //    public string FinancialYear { get; set; }
    //    public DateTime AsOnDate { get; set; }
    //    public decimal Funds { get; set; }
    //    public decimal Interest { get; set; }
    //    public decimal Revenue { get; set; }
    //    public decimal Expenditure { get; set; }
    //    public decimal Repayment { get; set; }
    //    public decimal Balance { get; set; }
    //    public decimal InterestEarnedTillDate { get; set; }
    //    public decimal RevenueEarnedTillDate { get; set; }
    //    public decimal ExpenditureIncurredTillDate { get; set; }
    //    public decimal TotalRepaymentDone { get; set; }
    //}


    // PPPFundStatusEntity.cs
    public class PPPFundStatusEntity
    {
        public int SerialNo { get; set; }
        public string FinancialYear { get; set; }
        public DateTime AsOnDate { get; set; }

       
        public decimal Funds { get; set; }
        public decimal Interest { get; set; }  // InterestEarnedTillDate
        public decimal Revenue { get; set; }   // RevenueEarnedTillDate
        public decimal Expenditure { get; set; }  // ExpenditureIncurredTillDate
        public decimal Repayment { get; set; }  // TotalRepaymentDone
        public decimal Balance { get; set; }
    }

}
