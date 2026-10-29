using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Staff
{
    public class StaffBankEntity
    {
        public Int64 StaffID { get; set; }
        public string AccountType { get; set; }
        public string AccountNo { get; set; }
        public string AccountHolderName { get; set; }
        public string IFSCCode { get; set; }
        public string BankName { get; set; }
        public string BranchName { get; set; }
        public string CancelChequePath { get; set; }
        public string PANNo { get; set; }
        public string PANPath { get; set; }
        public string UserLoginID { get; set; }
        public string IPAddress { get; set; }
        public string PageCode { get; set; }
        public string IsBankAcount { get; set; }
        public string IsPANDetails { get; set; }    
    }
}
