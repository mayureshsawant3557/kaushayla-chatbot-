using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Base
{
    public class ApprovalOrderEntity
    {
        public Int64 ID { get; set; }
        public string ApprovalOrderNo { get; set; }
        public DateTime ApprovalOrderDate { get; set; }
        public string ApprovalOrderDateDisplay { get; set; }
        public string ApprovalOrder { get; set; }
        public string ApprovalOrderRemakr { get; set; }
        public string UserLoginID { get; set; }
        public string IPAddress { get; set; }
    }
}
