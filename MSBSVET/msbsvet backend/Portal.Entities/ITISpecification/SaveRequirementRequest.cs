using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.ITISpecification
{
    public class SaveRequirementRequest
    {
        public long UserID { get; set; }
        public long CollegeID { get; set; } // Updated to long
        public string FinancialYear { get; set; }
        public List<RequirementItemRequest> Requirements { get; set; }
        public string IPAddress { get; set; }
    }

}
