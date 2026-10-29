using Portal.Entities.Registration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Staff
{
    public class StaffPrimaryEntity
    {
        public Int64 StaffID { get; set; }
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
        public List<JobRole> ListJobRole { get; set; }
        public string JobRole { get; set; }
        public int SteppID { get; set; }

        public string IsFirstNameVerify { get; set; }
        public string IsMiddleNameVerify { get; set; }
        public string IsLastNameVerify { get; set; }
        public string IsPhotoFilePathVerify { get; set; }
        public string IsSignFilePathVerify { get; set; }
        public string IsGenderCodeVerify { get; set; }
        public string IsDOBVerify { get; set; }
        public string IsDOBFilePathVerify { get; set; }
        public string IsAadhaarNoVerify { get; set; }
        public string IsAadhaarFilePathVerify { get; set; }
        public string FirstNameVerifyRemark { get; set; }
        public string MiddleNameVerifyRemark { get; set; }
        public string LastNameVerifyRemark { get; set; }
        public string PhotoFilePathVerifyRemark { get; set; }
        public string SignFilePathVerifyRemark { get; set; }
        public string GenderCodeVerifyRemark { get; set; }
        public string DOBVerifyRemark { get; set; }
        public string DOBFilePathVerifyRemark { get; set; }
        public string AadhaarNoVerifyRemark { get; set; }
        public string AadhaarFilePathVerifyRemark { get; set; }

        public string RejectCnt { get; set; }
        public string VerifyCnt { get; set; }

        public bool IsAddhareVerify { get; set; }
    }
}
