using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Establishment
{
    public class EstablishmentRequestForInspectionEntity
    {
        public Int64 EstablishmentID { get; set; }
        public Int64 BTRIID { get; set; }
        public DateTime InspectionFromDate { get; set; }
        public DateTime InspectionToDate { get; set; }        
        public string UserLoginID { get; set; }
        public string IPAddress { get; set; }
        public string PageCode { get; set; }
        public string ReasonForRejection { get; set; }
    }    
}
