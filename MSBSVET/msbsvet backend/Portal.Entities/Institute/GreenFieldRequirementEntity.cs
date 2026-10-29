using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Institute
{
    public class GreenFieldRequirementEntity
    {
        public long ID { get; set; }

        public long InstituteID { get; set; }

        public long CourseID { get; set; }

        public int FinancialYearID { get; set; }

        public int ApprovedUnit { get; set; }

        public int ProposedUnitForGreenReq { get; set; }

        public string? UserLoginID { get; set; }

        public string? IPAddress { get; set; }
    }

    public class InstituteInputEntityForGreen
    {
        public Int64 InstituteId { get; set; }
        public Int64 FinancialYearID { get; set; }
        

    }

    public class StatusGreenRequirementRequest
    {
        public int InstituteID { get; set; }
        public int YearID { get; set; }
        public string UserLoginID { get; set; }
        public string IPAddress { get; set; }
        public string FormStatus { get; set; }
    }

    //bulk save 

    public class GreenFieldRequirementBulkEntity
    {
        public long InstituteID { get; set; }

        public int FinancialYearID { get; set; }

        public string UserLoginID { get; set; }

        public string IPAddress { get; set; }

        public List<GreenFieldRequirementRow> Rows { get; set; }
            = new List<GreenFieldRequirementRow>();
    }

    public class GreenFieldRequirementRow
    {
        public long CourseID { get; set; }

        public int ApprovedUnit { get; set; }

        public int ProposedUnitForGreenReq { get; set; }
    }
}
