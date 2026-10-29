using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Establishment
{
    public class EstablishmentBankEntity
    {
        public Int64 EstablishmentID { get; set; }
        public string AccountType { get; set; }
        public string IFSCCode { get; set; }
        public string BankName { get; set; }
        public string BranchName { get; set; }
        public string AccountNo { get; set; }
        public string CancelChequePath { get; set; }
        public string UserLoginID { get; set; }
        public string IPAddress { get; set; }
        public string PageCode { get; set; }
        public string ReasonForRejection { get; set; }
    }
}
