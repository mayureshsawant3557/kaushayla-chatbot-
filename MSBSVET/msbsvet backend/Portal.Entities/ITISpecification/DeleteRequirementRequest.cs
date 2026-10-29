using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.ITISpecification
{
    public class DeleteRequirementRequest
    {
        public string RequirementIDs { get; set; }
        public long UserID { get; set; }
        public string IPAddress { get; set; }
        public string Reason { get; set; }
    }
}
