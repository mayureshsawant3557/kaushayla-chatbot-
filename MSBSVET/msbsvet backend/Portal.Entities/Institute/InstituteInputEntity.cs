using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Institute
{
    public class InstituteInputEntity
    {
        public Int64 InstituteId { get; set; }
        public Int64 ExitInstituteID { get; set; }
        public string UserLoginID { get; set; }
        public string PageCode { get; set; }
        public int ItemId { get; set; }
        public string IPAddress { get; set; }
        public int ApprovalIDFlag { get; set; } = -1;

    }

    public class SaveInspectionDateRangeRequest
    {
        public InstituteInputEntity Entity { get; set; }
        public string StartDate { get; set; }
        public string EndDate { get; set; }
        public string InspectionScheduledDateByDVETO { get; set; }
        public string SubmissionDate { get; set; }
        public string DelayRemarkForActual { get; set; }
        public string DelayRemark { get; set; }
        public string ActualInspectionDateByDVETO { get; set; }
        public string InspectionReportSubmissionDate { get; set; }
        public string SignedInspectionReportSubmissionDate { get; set; }
    }

    public class SaveSelfDeclarationRequest
    {
        public Int64 InstituteId { get; set; }
        public string SelfDeclarationPath { get; set; }
        public string UserLoginID { get; set; }
        public string IPAddress { get; set; }
        public string PageCode { get; set; }
    }

    public class SaveLOIStatus
    {
        public Int64 InstituteId { get; set; }
        public Int64 ExitInstituteID { get; set; }
        public string UserLoginID { get; set; }
        public string PageCode { get; set; }
        public string ItemId { get; set; }
        public string IPAddress { get; set; }

    }
}
