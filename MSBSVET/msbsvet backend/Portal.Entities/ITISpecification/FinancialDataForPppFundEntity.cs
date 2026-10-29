using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.ITISpecification
{
    public  class FinancialDataForPppFundEntity
    {

       public  int Id { get; set; }
        public int FinancialYearID { get; set; }
        public int InstituteID { get; set; }
        public DateTime AsonDate { get; set; }
        public decimal FundsReceived { get; set; }
        public decimal InterestEarned { get; set; }
        public decimal RevenueGenerated {  get; set; }
        public decimal TotalExpenditure { get; set; }
        public decimal Repayment { get; set; }
        public decimal BalanceasonDate { get; set;}
        public int UserID { get; set; }
        public string UserIpAddress { get; set; }

    }
}
