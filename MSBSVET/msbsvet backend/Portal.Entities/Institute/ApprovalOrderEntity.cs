using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Institute
{
    public class ApprovalOrderSummaryEntity
    {
        public long ApprovalOrderID { get; set; }
        public string ApprovalOrderNo { get; set; }
        public DateTime? ApprovalOrderDate { get; set; }
        public string ApprovalOrder { get; set; }
        public bool IsActive { get; set; }
    }

    public class SaveCourseApprovalOrderEntity
    {
        public long CollegeID { get; set; }
        public long CourseID { get; set; }
        public long UnitCode { get; set; }
        public long ApprovalOrderID { get; set; }
        public DateTime? EffectiveDate { get; set; }
        public string UserLoginID { get; set; }
        public string IPAddress { get; set; }
    }

    public class CourseApprovalOrderDetailEntity
    {
        public long CollegeID { get; set; }
        public long CourseID { get; set; }
       

        public string CourseName { get; set; }
        public short ShiftID { get; set; }
        public short UnitNo { get; set; }
        public string UnitCode { get; set; }
        public short Intake { get; set; }
        public string ApprovedCategory { get; set; }
        public long? ApprovalOrderID { get; set; }
        public string ApprovalOrderNo { get; set; }
        public string ApprovalOrder { get; set; }

        //public int? ApprovalOrderYear { get; set; }
        public DateTime? EffectiveDate { get; set; }
    }

    public class CourseDetailsWithApprovalOrderEntity
    {
        public long CourseID { get; set; }
        public string CourseName { get; set; }
        public short ShiftID { get; set; }
        public short UnitNo { get; set; }
        public string UnitCode { get; set; }
        public short Intake { get; set; }
        public string ApprovedCategory { get; set; }
        public string ApprovalOrderNo { get; set; }
        public long? ApprovalOrderID { get; set; }
        public string ApprovalOrder { get; set; }
        public DateTime? ApprovalOrderDate { get; set; }
        public int? ApprovalOrderYear { get; set; }
        public DateTime? EffectiveDate { get; set; }
    }
}
