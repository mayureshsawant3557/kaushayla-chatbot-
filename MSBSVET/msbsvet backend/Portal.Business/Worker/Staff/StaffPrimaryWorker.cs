using Portal.Business.Interface.Staff;
using Portal.Business.Worker.Utility;
using Portal.Data;
using Portal.Entities.Registration;
using Portal.Entities.Staff;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Business.Worker.Staff
{
    public class StaffPrimaryWorker : IStaffPrimary
    {
        private readonly Repository objData;
        //Inject Repository via Constructor 
        public StaffPrimaryWorker(Repository repository)
        {
            objData = repository ?? throw new ArgumentNullException(nameof(repository));
        }

        public StaffPrimaryEntity GetStaffPrimary(StaffInput entity)
        {
            StaffPrimaryEntity obj = new StaffPrimaryEntity();
            try
            {
                DataSet ds = objData.GetStaffPrimary(entity);

                if (ds != null && ds.Tables[0].Rows.Count > 0)
                {
                    DataRow dr = ds.Tables[0].Rows[0];
                    obj.ITIRegistrationNo = Convert.ToString(dr["ApplicationID"]);
                    obj.StaffID = Convert.ToInt64(dr["StaffID"]);
                    obj.FirstName = Convert.ToString(dr["FirstName"]);
                    obj.MiddleName = Convert.ToString(dr["MiddleName"]);
                    obj.LastName = Convert.ToString(dr["LastName"]);
                    obj.PhotoFilePath = Convert.ToString(dr["PhotoFilePath"]);
                    obj.SignFilePath = Convert.ToString(dr["SignFilePath"]);
                    obj.GenderCode = Convert.ToString(dr["GenderCode"]);
                    obj.DOB = Convert.ToDateTime(dr["DOB"]);
                    obj.DOBFilePath = Convert.ToString(dr["DOBFilePath"]);
                    obj.AadhaarNo = Convert.ToString(dr["AadhaarNo"]);
                    obj.AadhaarFilePath = Convert.ToString(dr["AadhaarFilePath"]);
                    obj.MobileNo = Convert.ToString(dr["MobileNo"]);
                    obj.AltMobileNo = Convert.ToString(dr["AltMobileNo"]);
                    obj.EMailID = Convert.ToString(dr["EMailID"]);
                    obj.JobRole = Convert.ToString(dr["JobRole"]);


                    obj.IsFirstNameVerify = Convert.ToString(dr["IsFirstNameVerify"]);
                    obj.IsMiddleNameVerify = Convert.ToString(dr["IsMiddleNameVerify"]);
                    obj.IsLastNameVerify = Convert.ToString(dr["IsLastNameVerify"]);
                    obj.IsPhotoFilePathVerify = Convert.ToString(dr["IsPhotoFilePathVerify"]);
                    obj.IsSignFilePathVerify = Convert.ToString(dr["IsSignFilePathVerify"]);
                    obj.IsGenderCodeVerify = Convert.ToString(dr["IsGenderCodeVerify"]);
                    obj.IsDOBVerify = Convert.ToString(dr["IsDOBVerify"]);
                    obj.IsDOBFilePathVerify = Convert.ToString(dr["IsDOBFilePathVerify"]);
                    obj.IsAadhaarNoVerify = Convert.ToString(dr["IsAadhaarNoVerify"]);
                    obj.IsAadhaarFilePathVerify = Convert.ToString(dr["IsAadhaarFilePathVerify"]);
                    obj.FirstNameVerifyRemark = Convert.ToString(dr["FirstNameVerifyRemark"]);
                    obj.MiddleNameVerifyRemark = Convert.ToString(dr["MiddleNameVerifyRemark"]);
                    obj.LastNameVerifyRemark = Convert.ToString(dr["LastNameVerifyRemark"]);
                    obj.PhotoFilePathVerifyRemark = Convert.ToString(dr["PhotoFilePathVerifyRemark"]);
                    obj.SignFilePathVerifyRemark = Convert.ToString(dr["SignFilePathVerifyRemark"]);
                    obj.GenderCodeVerifyRemark = Convert.ToString(dr["GenderCodeVerifyRemark"]);
                    obj.DOBVerifyRemark = Convert.ToString(dr["DOBVerifyRemark"]);
                    obj.DOBFilePathVerifyRemark = Convert.ToString(dr["DOBFilePathVerifyRemark"]);
                    obj.AadhaarNoVerifyRemark = Convert.ToString(dr["AadhaarNoVerifyRemark"]);
                    obj.AadhaarFilePathVerifyRemark = Convert.ToString(dr["AadhaarFilePathVerifyRemark"]);
                    obj.IsAddhareVerify = Convert.ToBoolean(dr["IsAddhareVerify"]);

                    obj.RejectCnt = Convert.ToString(dr["RejectCnt"]);
                    obj.VerifyCnt = Convert.ToString(dr["VerifyCnt"]);
                }
                if (ds.Tables[1].Rows.Count > 0)
                {
                    List<JobRole> jobRoles = new List<JobRole>();
                    foreach (DataRow dr in ds.Tables[1].Rows)
                    {
                        JobRole jobRole = new JobRole();
                        jobRole.ID = Convert.ToInt32(dr["JobRoleID"]);
                        jobRole.CandidateID = Convert.ToInt64(dr["StaffID"]);
                        jobRole.JobRoleName = dr["JobRoleName"].ToString();
                        jobRoles.Add(jobRole);
                    }
                    if (jobRoles.Count > 0)
                    {
                        obj.ListJobRole = jobRoles;
                    }
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetStaffPrimary", entity.UserLoginID);
                throw ex;
            }
            return obj;
        }
        public string SaveStaffPrimary(StaffPrimaryEntity entity)
        {
            string retVal = "";
            try
            {
                retVal = objData.SaveStaffPrimary(entity);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveStaffPrimary", entity.UserLoginID);
                retVal = ex.Message;
            }
            return retVal;
        }

        public DataTable GetStaffDashboard(long StaffID)
        {
            try
            {
                return objData.GetStaffDashboard(StaffID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetStaffDashboard", StaffID.ToString());
                throw;
            }
        }
    }
}
