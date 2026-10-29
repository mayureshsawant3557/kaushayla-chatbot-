using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.ITISpecification
{
    public class RequirementItemRequest
    {
        public int ItemID { get; set; }
        public int SectorID { get; set; }
        public int CategoryID { get; set; }
        public decimal DistrictFund { get; set; }
        public decimal PPP { get; set; }
        public decimal StateFund { get; set; }
        public decimal RequiredAsPerNorms { get; set; }  
        public decimal Available { get; set; }
    }
}
