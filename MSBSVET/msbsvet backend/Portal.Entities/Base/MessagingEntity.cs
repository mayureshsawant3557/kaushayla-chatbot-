using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Base
{
    public class MessagingEntity
    {
        public string MessageType { get; set; }
        public string Purpose { get; set; }
        public string MessageSubject { get; set; }
        public string MessageText { get; set; }
        public string MobileNo { get; set; }
        public string EMailID { get; set; }
        public string SentBy { get; set; }
        public string IPAddress { get; set; }
    }
}
