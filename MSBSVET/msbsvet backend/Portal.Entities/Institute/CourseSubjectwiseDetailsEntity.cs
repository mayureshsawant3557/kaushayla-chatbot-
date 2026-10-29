using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Institute
{
    public class CourseSubjectwiseDetailsEntity
    {
        public Int64 InstituteId { get; set; }
        public Int64 CourseID { get; set; }
        public string CourseCode { get; set; }
        public string Course { get; set; }
        public int ShiftId { get; set; }
        public string Shift { get; set; }
        public string UnitNo { get; set; }
        public int SubjectId { get; set; }
        public string Subject { get; set; }
        public string SubjectCode { get; set; }

    }
}
