using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Institute
{
    public class InstituteCourseEntity
    {
        public Int64 ChoiceCode { get; set; }
        public Int64 CourseID { get; set; }
        public string CourseCode { get; set; }
        public string Course { get; set; }
        public Int16 ShiftID { get; set; }
        public string Shift { get; set; }
        public Int16 CourseTypeID { get; set; }
        public string CourseType { get; set; }
        public string CourseBatchStartDate { get; set; }
        public string AdmissionLastDate { get; set; }
        public Int16 TotalIntake { get; set; }
        public Int16 CurrentVacancy { get; set; }
        public Int32 IsApplied { get; set; }
        public string FullTimePartTime { get; set; }
        public string Duration { get; set; }

	}
}
