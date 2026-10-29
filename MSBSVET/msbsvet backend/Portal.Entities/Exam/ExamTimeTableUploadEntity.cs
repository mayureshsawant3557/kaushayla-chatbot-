using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Exam
{
    public class ExamTimeTableUploadEntity
    {
        public int RowNumber { get; set; }

        public string ExamYear { get; set; }
        public long? ExaminationID { get; set; }
        public string ExaminationName { get; set; }

        public string CourseCode { get; set; }
        public string CourseName { get; set; }

        public string SubjectName { get; set; }
        public string SubjectCode { get; set; }
        public string SubjectType { get; set; }
        public int? SubjectTypeID { get; set; }

        public string ExaminationDate { get; set; }
        public string StartTime { get; set; }
        public string EndTime { get; set; }

        public string UserLoginID { get; set; }
        public string IPAddress { get; set; }

    }

   

}
