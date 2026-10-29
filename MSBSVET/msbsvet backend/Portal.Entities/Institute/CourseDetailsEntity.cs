using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Institute
{
    public class CourseDetailsEntity
	{
        public Int64 CourseID { get; set; }
        public Int64 InstituteID { get; set; }
		public string InstituteCode { get; set; }
		public string CourseCode { get; set; }
		public string PartFullTime { get; set; }

		public Int16 ShiftID { get; set; }
		public Int16 UnitNo { get; set; }
		public string Shift { get; set; }
		public Int32 AdmissionSessionID { get; set; }
		public string UnitCode { get; set; }
		public DateTime AffilationDate { get; set; }
		public DateTime AffilationLastDate { get; set; }
		public string Course { get; set; }
		public string InstituteName { get; set; }
        public Int16 Intake { get; set; }
		public string UserLoginID { get; set; }
		public string IPAddress { get; set; }
		public string PageCode { get; set; }
		public bool IsActive { get; set; }
		

	}
}
