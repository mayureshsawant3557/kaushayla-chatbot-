using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Base
{
    public class BankEntity
    {
        public string DISTRICT { get; set; }
        public string CONTACT { get; set; }
        public bool NEFT { get; set; }
        public string MICR { get; set; }
        public bool RTGS { get; set; }
        public string ADDRESS { get; set; }
        public string CITY { get; set; }
        public string BRANCH { get; set; }
        public string STATE { get; set; }
        public bool IMPS { get; set; }
        public string CENTRE { get; set; }
        public string SWIFT { get; set; }
        public bool UPI { get; set; }
        public string BANK { get; set; }
        public string BANKCODE { get; set; }
        public string IFSC { get; set; }
    }
}
