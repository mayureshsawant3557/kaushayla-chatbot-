using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.ITISpecification
{
    // Request Model
    public class UpdateStatusRequest
    {
        public long UserID { get; set; }
        public string FinancialYear { get; set; }
        public string NewStatus { get; set; } // Draft, Submitted, Approved, Rejected, Unlocked
        public long ModifiedBy { get; set; }
        public string Remarks { get; set; }
        public long? ApprovedBy { get; set; }
    }

}
