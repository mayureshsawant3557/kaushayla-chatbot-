using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.TrainingMgmt
{
    public class StaffAllocationEntity
    {
        public Int64 AssignmentId { get; set; }
        public Int64 InstituteId { get; set; }
        public string InstituteName { get; set; }
        public string InstituteCode { get; set; }
        public Int64 CourseId { get; set; }
        public string CourseName { get; set; }
        public string CourseCode { get; set; }
        public Int64 BatchId { get; set; }
        public string Batch { get; set; }
        public string StaffId { get; set; }
        public string StaffProfileId { get; set; }
        public string StaffFullName { get; set; }
        public string StaffApprovalStatus { get;set;}
        public Int64 SubjectId { get; set; }
        public string SubjectName { get; set; }
        public string SubjectCode{ get; set; }      
        public bool IsDeleteAllowed { get; set; }


    }
}
