using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Registration
{
	public class RegistrationEntity
	{
		public string ITIRegistrationNo { get; set; }
		public string FirstName { get; set; }
		public string MiddleName { get; set; }
		public string LastName { get; set; }
		public string GenderCode { get; set; }
		public DateTime DOB { get; set; }
		public string MobileNo { get; set; }
		public string AltMobileNo { get; set; }
		public string EMailID { get; set; }
		public Int16 SecurityQuestionID { get; set; }
		public string SecurityQuestionAnswer { get; set; }
		public string Password { get; set; }
		public string UserLoginID { get; set; }
		public string IPAddress { get; set; }
		public string PageCode { get; set; }
		public Int16 IsAdmissionDataFetch { get; set; }
		public List<JobRole> ListJobRole { get; set; }


        public string DOBFilePath { get; set; }
        public string AadhaarNo { get; set; }
        public string AadhaarFilePath { get; set; }
        public string PhotoFilePath { get; set; }
        public string SignFilePath { get; set; }

        public bool IsAddhareVerify { get; set; }
    }
	public class JobRole
	{
		public int ID { get; set; }
		public Int64 CandidateID {get;set;}
		public string JobRoleName { get; set; }
	}
}
