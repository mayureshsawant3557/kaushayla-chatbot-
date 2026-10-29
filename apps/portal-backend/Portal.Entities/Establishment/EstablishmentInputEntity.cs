using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Establishment
{
    public class EstablishmentInput
    {
        public Int64 EstablishmentID { get; set; }
        public string UserLoginID { get; set; }
        public string PageCode { get; set; }
        public Int16 RegionID { get; set; }
    }
}
