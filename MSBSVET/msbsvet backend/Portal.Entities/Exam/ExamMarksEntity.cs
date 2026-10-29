using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Exam
{
	public class ExamMarksEntity
	{
		public Int64 ID { get; set; }

		public Int64 BatchID { get; set; }
		public Int64 CourseID { get; set; }
		public Int64 ExaminationID { get; set; }
		public Int64 EvlutionCenterID { get; set; }
		public Int64 TraningInstituteID { get; set; }
		public string CourseCode { get; set; }
		public string SubjectCode { get; set; }
		public string SubjectType { get; set; }
		public string EvaluationReportPath { get; set; }
		public string AttendanceReportPath { get; set; }
		public char IsSubmitted { get; set; }
		public string Marks { get; set; }
		public string UserLoginID { get; set; }
		public string IPAddress { get; set; }

		public string TitleInternalExaminer { get; set; }
		public string FirstNameInternalExaminer { get; set; }
		public string MiddleNameInternalExaminer { get; set; }
		public string LastNameInternalExaminer { get; set; }
		public string MobileNoInternalExaminer { get; set; }
		public string TitleExternalExaminer { get; set; }
		public string FirstNameExternalExaminer { get; set; }
		public string MiddleNameExternalExaminer { get; set; }
		public string LastNameExternalExaminer { get; set; }
		public string MobileNoExternalExaminer { get; set; }
		public int EvalutionSubjectID { get; set; }


	}


}
