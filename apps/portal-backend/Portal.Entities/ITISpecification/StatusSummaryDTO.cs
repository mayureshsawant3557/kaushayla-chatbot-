using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.ITISpecification
{
    public class StatusSummaryDTO
    {
        public string Status { get; set; }
        public int TotalUsers { get; set; }
        public int TotalRequirements { get; set; }
        public int TotalDistrictFund { get; set; }
        public int TotalPPP { get; set; }
        public int TotalStateFund { get; set; }
        public int GrandTotal { get; set; }
    }
}
