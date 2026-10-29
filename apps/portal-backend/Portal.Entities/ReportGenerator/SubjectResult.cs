using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.ReportGenerator
{
    public class SubjectResult
    {
        public int ID { get; set; }
        public int ResultCandidateFlatID { get; set; }
        public string CourseCode { get; set; }
        public string CourseName { get; set; }
        public string SubjectName { get; set; }
        public string SubjectCode { get; set; }
        public string THPR { get; set; }
        public string SubjectType { get; set; }
        public int SubjectTypeID { get; set; }
        public string max { get; set; }
        public string min { get; set; }
        public string obt { get; set; }
        public string Result { get; set; }
        public int Attendance { get; set; }
        public int ExamMarksID { get; set; }
        public int ExamMarksDetailsID { get; set; }
        public long ApplicationID { get; set; }
        public string Remark { get; set; }
        public int ExaminationID { get; set; }
        public string ExaminationName { get; set; }
        public string SymbolExtraMarks { get; set; }
        public string ExtraMarks { get; set; }
        public string SubjectNameCode { get; set; }
        public string IsResultFresh { get; set; }
        public string GraceMarks { get; set; }
    }
}
