using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Exam
{
	public class ExamCenterMappingEntity
	{
		public Int64 ID { get; set; }

		public Int64 CollegeID { get; set; }
		public Int64 CenterCollegeID { get; set; }
		public Int64 ExamTypeID { get; set; }
		public Int32 SubjectTypeExamID { get; set; }
		public Int32 AdmissionYear { get; set; }
		public bool IsAvtive { get; set; }
		public string UserLoginID { get; set; }
		public string IPAddress { get; set; }
	}

	
}
