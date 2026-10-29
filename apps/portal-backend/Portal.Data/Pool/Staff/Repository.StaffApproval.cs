using Portal.Entities;
using Portal.Entities.Staff;
using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Serialization;

namespace Portal.Data
{
    public partial class Repository
    {
        public DataTable SearchStaffManagement(Int32 DistrictID, Int32 TalukaID, Int32 RegionID, string FormStatus, string ProfileID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@DistrictID", DistrictID);
            param.Add("@TalukaID", TalukaID);
            param.Add("@RegionID", RegionID);
            param.Add("@FormStatus", FormStatus);
            param.Add("@ProfileID", ProfileID);

            return _dbAccess.GetDataTable("Staff_SearchStaffManagement", param);
        }
        public string SaveStaffPrimaryVerification(StaffPrimaryEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@StaffID", entity.StaffID);
            param.Add("@FirstName", entity.FirstName);
            param.Add("@MiddleName", entity.MiddleName);
            param.Add("@LastName", entity.LastName);
            param.Add("@PhotoFilePath", entity.PhotoFilePath);
            param.Add("@SignFilePath", entity.SignFilePath);
            param.Add("@GenderCode", entity.GenderCode);
            param.Add("@DOB", entity.DOB);
            param.Add("@DOBFilePath", entity.DOBFilePath);
            param.Add("@AadhaarNo", entity.AadhaarNo);
            param.Add("@AadhaarFilePath", entity.AadhaarFilePath);
            param.Add("@MobileNo", entity.MobileNo);
            param.Add("@AltMobileNo", entity.AltMobileNo);
            param.Add("@EMailID", entity.EMailID);

            param.Add("@IsFirstNameVerify ", entity.IsFirstNameVerify);
            param.Add("@IsMiddleNameVerify", entity.IsMiddleNameVerify);
            param.Add("@IsLastNameVerify", entity.IsLastNameVerify);
            param.Add("@FirstNameVerifyRemark", entity.FirstNameVerifyRemark);
            param.Add("@MiddleNameVerifyRemark", entity.MiddleNameVerifyRemark);
            param.Add("@LastNameVerifyRemark", entity.LastNameVerifyRemark);
            param.Add("@IsPhotoFilePathVerify", entity.IsPhotoFilePathVerify);
            param.Add("@PhotoFilePathVerifyRemark", entity.PhotoFilePathVerifyRemark);
            param.Add("@IsDOBVerify", entity.IsDOBVerify);
            param.Add("@DOBVerifyRemark", entity.DOBVerifyRemark);
            param.Add("@IsDOBFilePathVerify", entity.IsDOBFilePathVerify);
            param.Add("@DOBFilePathVerifyRemark", entity.DOBFilePathVerifyRemark);
            param.Add("@IsGenderCodeVerify", entity.IsGenderCodeVerify);
            param.Add("@GenderCodeVerifyRemark", entity.GenderCodeVerifyRemark);
            param.Add("@IsAadhaarNoVerify", entity.IsAadhaarNoVerify);
            param.Add("@AadhaarNoVerifyRemark", entity.AadhaarNoVerifyRemark);
            param.Add("@IsAadhaarFilePathVerify", entity.IsAadhaarFilePathVerify);
            param.Add("@AadhaarFilePathVerifyRemark", entity.AadhaarFilePathVerifyRemark);


            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);
            param.Add("@PageCode", entity.PageCode);

            return _dbAccess.ExecuteScalar("Staff_SaveStaffPrimaryVerification", param).ToString();
        }
    }
}
