using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.ITISpecification
{
    public class TradeWiseItemEntity
    {
        public long TradeID { get; set; }
        public string TradeName { get; set; }
        public long UsagesID { get; set; }
        public string Usage { get; set; }
        public string SNAsperDGT { get; set; }
        public long ItemAsperDGTID { get; set; }
        public string ItemAsperDGT { get; set; }
        public long SpecificationDGTID { get; set; }
        public string SpecificationDGT { get; set; }
        public string QTYAsPerDGT { get; set; }
        public string SNAsperDVET { get; set; }
        public long ItemAsperDVETID { get; set; }
        public string ItemAsperDVET { get; set; }
        public string RevisedQtyAsperDVET { get; set; }
        public string SpecificationDocument { get; set; }
    }
}
