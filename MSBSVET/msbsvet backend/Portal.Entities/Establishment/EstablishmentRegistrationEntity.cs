using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Establishment
{
    public class EstablishmentRegistrationEntity
    {
        public Int64 EstablishmentID { get; set; }
        public string TAN { get; set; }
        public string TIN { get; set; }
        public string GST { get; set; }
        public string UdyogAadhaar { get; set; }
        public string UserLoginID { get; set; }
        public string IPAddress { get; set; }
        public string PageCode { get; set; }
        public string ReasonForRejection { get; set; }
    }
}
