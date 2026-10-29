using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Staff
{
    public class StaffQualificationEntity
	{
        public Int64 QualificationRowID { get; set; }
        public Int64 StaffID { get; set; }
        public Int16 QualificationID { get; set; }
        public string Qualification { get; set; }
        public string QualificationGroup { get; set; }
        public string Degree { get; set; }
        public string Subject { get; set; }
        public string University { get; set; }
        public DateTime ResultDate { get; set; }
        public string ResultDateStr { get; set; }
        public Int16 AppearingYear { get; set; }
        public string AppearingYearsStr { get; set; }
        public Int16 Attempts { get; set; }
        public Int32 MarksObtained { get; set; }
        public string MarksObtainedStr { get; set; }
        public Int32 MaximumMarks { get; set; }
        public string MaximumMarksStr { get; set; }
        public Int16 CourseDuration { get; set; }
        public string Class { get; set; }
        public string Mode { get; set; }
        public string CertificatePath { get; set; }
        public string UserLoginID { get; set; }
        public string IPAddress { get; set; }
        public string PageCode { get; set; }
    }
}
