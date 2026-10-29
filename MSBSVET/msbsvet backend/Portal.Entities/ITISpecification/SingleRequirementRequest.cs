using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.ITISpecification
{
    public class SingleRequirementRequest
    {
        public long UserID { get; set; }
        public string CollegeID { get; set; }
        public int ItemID { get; set; }
        public int SectorID { get; set; }
        public int CategoryID { get; set; }
        public decimal DistrictFund { get; set; }
        public decimal PPP { get; set; }
        public decimal StateFund { get; set; }

        [JsonProperty("RequiredAsPerNorms")]
        public decimal RequiredAsPerNorms { get; set; }
        public decimal Available { get; set; }
        public string FinancialYear { get; set; }
        public string IPAddress { get; set; }
        public string Operation { get; set; } = "SAVE";
    }
}
