using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Institute
{
    public class InstituteBankEntity
    {
        public int BankRowId { get; set; }
        public Int64 InstituteID { get; set; }
        public string AccountType { get; set; }
        public string AccountNo { get; set; }
        public string AccountHolderName { get; set; }
        public string IFSCCode { get; set; }
        public string BankName { get; set; }
        public string BranchName { get; set; }
        public string CancelChequePath { get; set; }     
        public string UserLoginID { get; set; }
        public string IPAddress { get; set; }
        public string PageCode { get; set; }
        public bool IsDeleteAllowed { get; set; }
        public bool IsEditAllowed { get; set; }
    }
}
