using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.ITISpecification
{
    public class ProposedTotalsEntity
    {
        public int DistrictItemsCount { get; set; }
        public decimal DistrictFund { get; set; }
        public int PPPItemsCount { get; set; }
        public decimal PPPFund { get; set; }
        public int StateItemsCount { get; set; }
        public decimal StateFund { get; set; }
    }

}
