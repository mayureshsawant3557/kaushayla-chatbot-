using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Exam
{
    public class ExamTimeTableEntity
    {
        public int YearId { get; set; }
        public string ExamYear { get; set; }
        public long ExaminationID { get; set; }
        public int ExaminationYearID { get; set; }
        public string ExaminationName { get; set; }
        public int CourseID { get; set; }
        public string CourseCode { get; set; }
        public string CourseName { get; set; }
        public string Duration { get; set; }
        public string DurationUnit { get; set; }

        public string SubjectCode { get; set; }
        public string SubjectName { get; set; }
        public string SubjectType { get; set; }
        public int SubjectTypeID { get; set; }
        public string ExaminationDate { get; set; }
        public string StartTime { get; set; }
        public string EndTime { get; set; }

        public string UserLoginID { get; set; }
        public string IPAddress { get; set; }
        //public int? OldCourseId { get; set; }
        //public string OldSubjectCodeId { get; set; }
    }

    public class SubjectCourseMarksEntity
    {
        public int SubjectId { get; set; }
        public int CourseId { get; set; }
        public int SubjectTypeId { get; set; }
        public decimal OutOfMarks { get; set; }
        public decimal PassingMarks { get; set; }

        public string UserLoginID { get; set; }   // ✅ NEW — maps to ModifiedBy
        public string IPAddress { get; set; }     // ✅ NEW — maps to ModifiedByIPAddress
    }



}
