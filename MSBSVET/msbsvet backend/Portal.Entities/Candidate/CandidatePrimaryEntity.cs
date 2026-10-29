using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Candidate
{
    public class CandidatePrimaryEntity
    {
        public Int64 CandidateID { get; set; }
        public string ITIRegistrationNo { get; set; }
        public string FirstName { get; set; }
        public string MiddleName { get; set; }
        public string LastName { get; set; }
        public string PhotoFilePath { get; set; }
        public string SignFilePath { get; set; }
        public string GenderCode { get; set; }
        public DateTime DOB { get; set; }
        public string DOBFilePath { get; set; }
        public string AadhaarNo { get; set; }
        public string AadhaarFilePath { get; set; }
        public string MobileNo { get; set; }
        public string AltMobileNo { get; set; }
        public string EMailID { get; set; }
        public string UserLoginID { get; set; }
        public string IPAddress { get; set; }
        public string PageCode { get; set; }
        public bool IsAadhaarVerified { get; set; }

        public bool IsForReverification { get; set; } = false;
    }
}
