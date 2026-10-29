using Microsoft.SqlServer.Server;
using Portal.Business.Interface.Base;
using Portal.Business.Worker.Utility;
using Portal.Data;
using Portal.Entities;
using Portal.Entities.Base;

using Portal.Entities.Institute;
using System;
using System.Collections.Generic;
using System.Data;
using System.Runtime.InteropServices;
using System.Threading.Tasks;
using static System.Net.Mime.MediaTypeNames;

namespace Portal.Business.Worker.Base
{
    public class BaseWorker : IBase
    {
        private readonly Repository objData;


        //private readonly CommonHelper _commonHelper;
        //Inject Repository via Constructor 
        public BaseWorker(Repository repository)
        {
            objData = repository ?? throw new ArgumentNullException(nameof(repository));
            //_commonHelper = commonHelper ?? throw new ArgumentNullException(nameof(commonHelper));
        }

        public List<DropdownEntity> GetMasterTableList(string TableName, string DataValueField, string DataTextField, bool HasSelect = true, string ParentField = "", string ParentFieldValue = "", string orderByText = "")
        {
            List<DropdownEntity> objList = new List<DropdownEntity>();
            try
            {
                DataTable dt = objData.GetMasterTableList(TableName, DataValueField, DataTextField, ParentField, ParentFieldValue, orderByText);
                objList = DataTableToList(dt, HasSelect);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetMasterTableList");
                throw ex;
            }
            return objList;
        }

        public List<DropdownEntity> GetMasterRegion()
        {
            List<DropdownEntity> objList = new List<DropdownEntity>();
            try
            {
                DataTable dt = objData.GetMasterRegion();
                objList = DataTableToList(dt, true);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetMasterRegion");
                throw ex;
            }
            return objList;
        }
        public List<DropdownEntity> GetMasterRegionDistrict()
        {
            List<DropdownEntity> objList = new List<DropdownEntity>();
            try
            {
                DataTable dt = objData.GetMasterRegionDistrict();
                objList = DataTableToList(dt, true);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetMasterRegionDistrict");
                throw ex;
            }
            return objList;
        }
        public List<DropdownEntity> GetMasterDistrictTalukas()
        {
            List<DropdownEntity> objList = new List<DropdownEntity>();
            try
            {
                DataTable dt = objData.GetMasterDistrictTalukas();
                objList = DataTableToList(dt, true);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetMasterDistrictTalukas");
                throw ex;
            }
            return objList;
        }

        public List<DropdownEntity> GetMasterDistrict()
        {
            List<DropdownEntity> objList = new List<DropdownEntity>();
            try
            {
                DataTable dt = objData.GetMasterDistrict();
                objList = DataTableToList(dt, true);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetMasterDistrict");
                throw ex;
            }
            return objList;
        }


       
        public List<DropdownEntity> GetMasterCity()
        {
            List<DropdownEntity> objList = new List<DropdownEntity>();
            try
            {
                DataTable dt = objData.GetMasterCity();
                objList = DataTableToList(dt, true);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetMasterCity");
                throw ex;
            }
            return objList;
        }
        public List<DropdownEntity> GetMasterCaste()
        {
            List<DropdownEntity> objList = new List<DropdownEntity>();
            try
            {
                DataTable dt = objData.GetMasterCaste();
                objList = DataTableToList(dt, true);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetMasterCaste");
                throw ex;
            }
            return objList;
        }
        public List<DropdownEntity> GetMasterQualification(long CandidateID, string QualificationGroup)
        {
            List<DropdownEntity> objList = new List<DropdownEntity>();
            try
            {
                DataTable dt = objData.GetMasterQualification(CandidateID, QualificationGroup);
                objList = DataTableToList(dt, true);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetMasterQualification");
                throw ex;
            }
            return objList;
        }
        public List<DropdownEntity> GetMasterSector()
        {
            List<DropdownEntity> objList = new List<DropdownEntity>();
            try
            {
                DataTable dt = objData.GetMasterSector();
                objList = DataTableToList(dt, true);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetMasterSector");
                throw ex;
            }
            return objList;
        }
        public List<DropdownEntity> GetMasterCourseType()
        {
            List<DropdownEntity> objList = new List<DropdownEntity>();
            try
            {
                DataTable dt = objData.GetMasterCourseType();
                objList = DataTableToList(dt, true);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetMasterCourseType");
                throw ex;
            }
            return objList;
        }
        public List<DropdownEntity> GetMasterCourse(short SectorID, short CourseTypeID, string Flag = "")
        {
            List<DropdownEntity> objList = new List<DropdownEntity>();
            try
            {
                DataTable dt = objData.GetMasterCourse(SectorID, CourseTypeID, Flag);
                objList = DataTableToList(dt, true);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetMasterCourse");
                throw ex;
            }
            return objList;


        }



        public List<DropdownEntity> GetMasterSectorByITISTT(Int16 ITISTT)
        {
            List<DropdownEntity> objList = new List<DropdownEntity>();
            try
            {
                DataTable dt = objData.GetMasterSectorByITISTT(ITISTT);
                objList = DataTableToList(dt, true);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetMasterSectorByITISTT");
                throw ex;
            }
            return objList;
        }
        public List<DropdownEntity> GetMasterCourseByITISTT(Int16 SectorID, Int16 CourseTypeID, Int16 ITISTT)
        {
            List<DropdownEntity> objList = new List<DropdownEntity>();
            try
            {
                DataTable dt = objData.GetMasterCourseByITISTT(SectorID, CourseTypeID, ITISTT);
                objList = DataTableToList(dt, true);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetMasterCourseByITISTT");
                throw ex;
            }
            return objList;
        }

        public DataTable GetCourseType()
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetCourseType();
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetCourseType");
                throw ex;
            }
            return dt;
        }

        public List<DropdownEntity> GetMasterInstitute()
        {
            List<DropdownEntity> objList = new List<DropdownEntity>();
            try
            {
                DataTable dt = objData.GetMasterInstitute();
                objList = DataTableToList(dt, true);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetMasterCourse");
                throw ex;
            }
            return objList;
        }
        public List<DropdownEntity> GetMasterEntryQualification()
        {
            List<DropdownEntity> objList = new List<DropdownEntity>();
            try
            {
                DataTable dt = objData.GetMasterEntryQualification();
                objList = DataTableToList(dt, true);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetMasterEntryQualification");
                throw ex;
            }
            return objList;
        }
        public void SaveLog(LogEntity entity)
        {
            try
            {
                objData.SaveLog(entity);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveLog");
                throw ex;
            }
        }



        public Int64 GetApprovedInstituteIDByInstituteCode(string InstituteCode)
        {
            Int64 retVal = 0;
            try
            {
                retVal = objData.GetApprovedInstituteIDByInstituteCode(InstituteCode);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetApprovedInstituteIDByInstituteCode", InstituteCode);
                throw ex;
            }
            return retVal;
        }



        public DataTable CheckExistingInstituteSDIApplicationExists(Int64 InstituteID)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.CheckExistingInstituteSDIApplicationExists(InstituteID);

            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "CheckExistingInstituteSDIApplicationExists", InstituteID.ToString());
                throw ex;
            }
            return dt;
        }


        public void SaveMessageContent(MessagingEntity me)
        {
            try
            {
                var task = SaveMessageContentAsync(me);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveMessageContent");
                throw ex;
            }
        }
        private async Task SaveMessageContentAsync(MessagingEntity me)
        {
            await objData.SaveMessageContent(me);
        }
        public bool IsNewRegistrationStarted(short UserTypeID)
        {
            bool retVal = false;
            try
            {
                retVal = objData.IsNewRegistrationStarted(UserTypeID);

            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "IsNewRegistrationStarted");
                throw ex;
            }
            return retVal;
        }
        public string GetOTP(string MobileNo, string Purpose, string OTP)
        {
            string retVal = "";
            try
            {
                retVal = objData.GetOTP(MobileNo, Purpose, OTP);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetOTP", MobileNo);
                throw ex;
            }
            return retVal;
        }
        public void SaveOTPVerificationStatus(string MobileNo, string Purpose, string OTP, bool IsOTPVerified)
        {
            try
            {
                // Add input validation
                if (string.IsNullOrWhiteSpace(MobileNo))
                    throw new ArgumentException("Mobile number cannot be empty", nameof(MobileNo));

                if (string.IsNullOrWhiteSpace(Purpose))
                    throw new ArgumentException("Purpose cannot be empty", nameof(Purpose));

                if (string.IsNullOrWhiteSpace(OTP))
                    throw new ArgumentException("OTP cannot be empty", nameof(OTP));

                objData.SaveOTPVerificationStatus(MobileNo, Purpose, OTP, IsOTPVerified);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveOTPVerificationStatus", MobileNo);
                throw ex;
            }
        }
        public PincodeEntity GetPincodeData(string Pincode)
        {
            PincodeEntity obj = new PincodeEntity();
            try
            {
                obj.Pincode = "";
                obj.StateID = -1;
                obj.DistrictID = -1;
                obj.TalukaID = -1;
                obj.CityID = -1;

                if (Pincode.Length == 6)
                {
                    DataTable dt = objData.GetPincodeData(Pincode);

                    if (dt != null && dt.Rows.Count > 0)
                    {
                        DataRow dr = dt.Rows[0];

                        obj.Pincode = Convert.ToString(dr["Pincode"]);
                        obj.StateID = Convert.ToInt16(dr["StateID"]);
                        obj.DistrictID = Convert.ToInt32(dr["DistrictID"]);
                        obj.TalukaID = Convert.ToInt32(dr["TalukaID"]);
                        obj.CityID = Convert.ToInt32(dr["CityID"]);
                    }
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetPincodeData", Pincode);
                throw ex;
            }
            return obj;
        }
        public bool IsCandidateFormLocked(long CandidateID)
        {
            bool retVal = false;
            try
            {
                retVal = objData.IsCandidateFormLocked(CandidateID);

            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "IsCandidateFormLocked");
                throw ex;
            }
            return retVal;
        }
        public DataTable GetEMailSMS(string Purpose, string MessageType, string Param1 = "", string Param2 = "", string Param3 = "", string Param4 = "", string Param5 = "")
        {
            DataTable dt = new DataTable();

            try
            {
                dt = objData.GetEMailSMS(Purpose, MessageType, Param1, Param2, Param3, Param4, Param5);

            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetEMailSMS", Purpose);
                throw ex;
            }
            return dt;
        }


        public static List<Dictionary<string, object>> ConvertDataTableToList(DataTable dt)
        {
            List<Dictionary<string, object>> result = new List<Dictionary<string, object>>();

            if (dt != null)
            {
                foreach (DataRow row in dt.Rows)
                {
                    Dictionary<string, object> rowData = new Dictionary<string, object>();
                    foreach (DataColumn col in dt.Columns)
                    {
                        rowData[col.ColumnName] = row[col] == DBNull.Value ? null : row[col];
                    }
                    result.Add(rowData);
                }
            }
            return result;
        }


        public static List<List<Dictionary<string, object>>> ConvertDataSetToList(DataSet ds)
        {
            List<List<Dictionary<string, object>>> result = new List<List<Dictionary<string, object>>>();

            if (ds != null && ds.Tables.Count > 0)
            {
                foreach (DataTable dt in ds.Tables)
                {
                    List<Dictionary<string, object>> tableData = new List<Dictionary<string, object>>();
                    foreach (DataRow row in dt.Rows)
                    {
                        Dictionary<string, object> rowData = new Dictionary<string, object>();
                        foreach (DataColumn col in dt.Columns)
                        {
                            rowData[col.ColumnName] = row[col] == DBNull.Value ? null : row[col];
                        }
                        tableData.Add(rowData);
                    }
                    result.Add(tableData);
                }
            }

            return result;
        }



        public short GetCandidateStepID(long CandidateID)
        {
            short retVal = 0;
            try
            {
                retVal = objData.GetCandidateStepID(CandidateID);

            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetCandidateStepID");
                throw ex;
            }
            return retVal;
        }
        public string GetCandidateMobileNo(long CandidateID)
        {
            string retVal = "";
            try
            {
                retVal = objData.GetCandidateMobileNo(CandidateID);

            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetCandidateMobileNo");
                throw ex;
            }
            return retVal;
        }
        public DataTable IsStaffAadharNoDuplicate(string AadharNo, long StaffID)
        {
            try
            {
                return objData.IsStaffAadharNoDuplicate(AadharNo, StaffID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "IsAadharNoDuplicate", AadharNo.ToString());
                throw ex;
            }
        }
        public DataTable IsCandidateAadharNoDuplicate(string AadharNo, long CandidateID)
        {
            try
            {
                return objData.IsCandidateAadharNoDuplicate(AadharNo, CandidateID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "IsAadharNoDuplicate", AadharNo.ToString());
                throw ex;
            }
        }
        public List<DropdownEntity> DataTableToList(DataTable table, bool hasSelect)
        {
            var list = new List<DropdownEntity>(table.Rows.Count);
            DropdownEntity ddl;

            if (hasSelect)
            {
                ddl = new DropdownEntity()
                {
                    Value = "-1",
                    Text = "Select",
                    Group = "-1",
                    Group2 = "-1"
                };
                list.Add(ddl);
            }
            if (table != null && table.Rows.Count > 0)
            {
                foreach (DataRow row in table.Rows)
                {
                    var values = row.ItemArray;
                    ddl = new DropdownEntity()
                    {
                        Value = values[0].ToString(),
                        Text = values[1].ToString(),
                        Group = values[2].ToString(),
                        Group2 = values.Length > 3 ? values[3].ToString() : "-1"
                    };
                    list.Add(ddl);
                }
            }
            return list;
        }
        public long GetCandidateID(string ApplicationID)
        {
            long retVal = 0;
            try
            {
                retVal = objData.GetCandidateID(ApplicationID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetCandidateID", ApplicationID);
                throw ex;
            }
            return retVal;
        }
        public string GetCandidateName(long CandidateID)
        {
            string retVal = "";
            try
            {
                retVal = objData.GetCandidateName(CandidateID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetCandidateName", CandidateID.ToString());
                throw ex;
            }
            return retVal;
        }
        public void SaveUserActionDetails(string Module, string UserLoginID, string ApplicationID, string ActionTaken, string IPAddress, string PageURL)
        {
            try
            {
                objData.SaveUserActionDetails(Module, UserLoginID, ApplicationID, ActionTaken, IPAddress, PageURL);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveUserActionDetails", UserLoginID);
                throw;
            }
        }

        public List<DropdownEntity> GetMasterPromoterType(string Group = "")
        {
            List<DropdownEntity> objList = new List<DropdownEntity>();
            try
            {
                DataTable dt = objData.GetMasterPromoterType(Group);
                objList = DataTableToList(dt, true);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetMasterPromoterType");
                throw ex;
            }
            return objList;
        }
        public List<DropdownEntity> GetMasterPromoterStatus()
        {
            List<DropdownEntity> objList = new List<DropdownEntity>();
            try
            {
                DataTable dt = objData.GetMasterPromoterStatus();
                objList = DataTableToList(dt, true);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetMasterPromoterStatus");
                throw ex;
            }
            return objList;
        }
        public List<DropdownEntity> GetMasterLocationCategory()
        {
            List<DropdownEntity> objList = new List<DropdownEntity>();
            try
            {
                DataTable dt = objData.GetMasterLocationCategory();
                objList = DataTableToList(dt, true);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetMasterLocationCategory");
                throw ex;
            }
            return objList;
        }
        public long GetInstituteIDByInstituteCode(string InstituteCode)
        {
            long retVal = 0;
            try
            {
                retVal = objData.GetInstituteIDByInstituteCode(InstituteCode);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetInstituteIDByInstituteCode", InstituteCode);
                throw ex;
            }
            return retVal;
        }

        public bool IsPasswordValid(string UserLoginID, string UserPassword)
        {
            bool retVal = false;
            try
            {
                retVal = objData.IsPasswordValid(UserLoginID, UserPassword);

            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "IsPasswordValid");
                throw ex;
            }
            return retVal;
        }
        public bool IsAdmissionConfirmationStarted()
        {
            bool retVal = false;
            try
            {
                retVal = objData.IsAdmissionConfirmationStarted();

            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "IsAdmissionConfirmationStarted");
                throw ex;
            }
            return retVal;
        }
        public DataTable GetCurrentAdmissionYear()
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetCurrentAdmissionYear();
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetCurrentAdmissionYear");
                throw ex;
            }
            return dt;

        }
        public DataTable GetCurrentFinancialYear()
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetCurrentFinancialYear();
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetCurrentAdmissionYear");
                throw ex;
            }
            return dt;

        }
        public DataTable GetCurrentAdmissionYearForApplication()
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetCurrentAdmissionYearForApplication();
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetCurrentAdmissionYearForApplication");
                throw ex;
            }
            return dt;

        }
        public DataTable GetAdmissionYear()
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetAdmissionYear();
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetAdmissionYear");
                throw ex;
            }
            return dt;

        }
        public DataTable GetMasterMainCourse()
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetMasterMainCourse();
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetMasterMainCourse");
                throw ex;
            }
            return dt;

        }
        public long GetApplicationIDByApplicationIDDisplay(string ApplicationIDDisplay)
        {
            long retVal = 0;
            try
            {
                retVal = objData.GetApplicationIDByApplicationIDDisplay(ApplicationIDDisplay);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetApplicationIDByApplicationIDDisplay", ApplicationIDDisplay);
                throw ex;
            }
            return retVal;
        }
        public long GetCandidateIDByApplicationID(long ApplicationID)
        {
            long retVal = 0;
            try
            {
                retVal = objData.GetCandidateIDByApplicationID(ApplicationID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetCandidateIDByApplicationID", ApplicationID.ToString());
                throw ex;
            }
            return retVal;
        }
        public string GetApplicationIDDisplayByApplicationID(long ApplicationID)
        {
            string retVal = "";
            try
            {
                retVal = objData.GetApplicationIDDisplayByApplicationID(ApplicationID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetApplicationIDDisplayByApplicationID", ApplicationID.ToString());
                throw ex;
            }
            return retVal;
        }
        public string GetCandidateProfileIDByApplicationID(long ApplicationID)
        {
            string retVal = "";
            try
            {
                retVal = objData.GetCandidateProfileIDByApplicationID(ApplicationID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetCandidateProfileIDByApplicationID", ApplicationID.ToString());
                throw ex;
            }
            return retVal;
        }
        public string GetCandidateProfileIDByCandidateId(long CandidateID)
        {
            string retVal = "";
            try
            {
                retVal = objData.GetCandidateProfileIDByCandidateId(CandidateID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetCandidateProfileIDByCandidateId", CandidateID.ToString());
                throw ex;
            }
            return retVal;
        }
        public DataSet GetHomeDashboard()
        {
            DataSet dt = new DataSet();
            try
            {
                dt = objData.GetHomeDashboard();
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetHomeDashboard");
                throw ex;
            }
            return dt;
        }
        public DataSet GetHomeSTTDashboard()
        {
            DataSet dt = new DataSet();
            try
            {
                dt = objData.GetHomeSTTDashboard();
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetHomeSTTDashboard");
                throw ex;
            }
            return dt;
        }
        public DataTable GetCourseByCollogeID(long CollegeID, short isnewadmission)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetBaseCourseByCollogeID(CollegeID, isnewadmission);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetCourseByCollogeID" + CollegeID.ToString());
                throw ex;
            }
            return dt;
        }
        public DataTable GetRegionInstitute(int RegionID)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetRegionInstitute(RegionID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetRegionInstitute" + RegionID.ToString());
                throw ex;
            }
            return dt;
        }
        public int GetDistrictIDByDistrictUser(string UserLoginID)
        {
            int retVal = 0;
            try
            {
                retVal = objData.GetDistrictIDByDistrictUser(UserLoginID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetDistrictIDByDistrictUser", UserLoginID.ToString());
                throw ex;
            }
            return retVal;

        }

        public DataTable GetInstiuteInfo(long InstituteID)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetInstiuteInfo(InstituteID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetInstiuteInfo" + InstituteID.ToString());
                throw ex;
            }
            return dt;
        }
        //public DataTable GetCourseType()
        //{
        //    DataTable dt = new DataTable();
        //    try
        //    {
        //        dt = objData.GetCourseType();
        //    }
        //    catch (Exception ex)
        //    {
        //        CommonHelper.SaveException(ex.Message, "GetCourseType");
        //        throw ex;
        //    }
        //    return dt;
        //}
        public DataTable GetExamType()
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetExamType();
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetExamType");
                throw ex;
            }
            return dt;
        }
        public List<DropdownEntity> GetMasterInstituteForExamCerter()
        {
            List<DropdownEntity> objList = new List<DropdownEntity>();
            try
            {
                DataTable dt = objData.GetMasterInstituteForExamCerter();
                objList = DataTableToList(dt, true);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetMasterInstituteForExamCerter");
                throw ex;
            }
            return objList;
        }

        public short GetStaffStepID(long StaffID)
        {
            short retVal = 0;
            try
            {
                retVal = objData.GetStaffStepID(StaffID);

            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetStaffStepID");
                throw ex;
            }
            return retVal;
        }
        public bool IsStaffFormLocked(long StaffID)
        {
            bool retVal = false;
            try
            {
                retVal = objData.IsStaffFormLocked(StaffID);

            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "IsStaffFormLocked");
                throw ex;
            }
            return retVal;
        }
        public long GetStaffID(string ApplicationID)
        {
            long retVal = 0;
            try
            {
                retVal = objData.GetStaffID(ApplicationID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetStaffID", ApplicationID);
                throw ex;
            }
            return retVal;
        }
        public List<DropdownEntity> GetMasterPromotingType()
        {
            List<DropdownEntity> objList = new List<DropdownEntity>();
            try
            {
                DataTable dt = objData.GetMasterPromotingType();
                objList = DataTableToList(dt, true);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetMasterPromotingType");
                throw ex;
            }
            return objList;
        }
        public bool ISSectorialExpertiseRequired(long StaffID)
        {
            bool retVal = false;
            try
            {
                retVal = objData.ISSectorialExpertiseRequired(StaffID);

            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "ISSectorialExpertiseRequired : " + StaffID.ToString());
                throw ex;
            }
            return retVal;
        }
        public DataTable GetMasterMainCourseApply()
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetMasterMainCourseApply();
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetMasterMainCourseApply");
                throw ex;
            }
            return dt;
        }
        public DataTable GetExamination()
        {
            try
            {
                return objData.GetExamination();
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetExamination");
                throw;
            }
        }

        // OLD METHOD 2
        public DataTable GetExamination(long InstituteID)
        {
            try
            {
                return objData.GetExamination(InstituteID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetExamination");
                throw;
            }
        }

        // 🔥 FIXED METHOD (FINAL)
        public DataTable GetExamination(long? examTypeId, long? yearId)
        {
            DataTable dt = new DataTable();

            try
            {
                dt = objData.GetExamination();

                if (dt != null && dt.Rows.Count > 0)
                {
                    var filteredRows = dt.AsEnumerable();

                    if (examTypeId.HasValue)
                    {
                        filteredRows = filteredRows.Where(x =>
                        {
                            if (x["ExamTypeID"] == DBNull.Value) return false;
                            return Convert.ToInt64(x["ExamTypeID"]) == examTypeId.Value;
                        });
                    }

                    if (yearId.HasValue)
                    {
                        filteredRows = filteredRows.Where(x =>
                        {
                            if (x["ExaminatioYearID"] == DBNull.Value) return false;
                            return Convert.ToInt64(x["ExaminatioYearID"]) == yearId.Value;
                        });
                    }

                    if (filteredRows.Any())
                        dt = filteredRows.CopyToDataTable();
                    else
                        dt = dt.Clone();
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetExamination_Filter");
                throw;
            }

            return dt;
        }
        public DataTable GetTimeTableSubject(int ExaminationID)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetTimeTableSubject(ExaminationID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetTimeTableSubject");
                throw ex;
            }
            return dt;
        }

        public bool IsEvaluationReportDate(string Subjecttype)
        {
            bool retVal = false;
            try
            {
                retVal = objData.IsEvaluationReportDate(Subjecttype);

            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "IsEvaluationReportDate");
                throw ex;
            }
            return retVal;
        }
        public List<DropdownEntity> GetElectiveSubjectes()
        {
            List<DropdownEntity> objList = new List<DropdownEntity>();
            try
            {
                DataTable dt = objData.GetElectiveSubjectes();
                objList = DataTableToList(dt, true);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetElectiveSubjectes");
                throw ex;
            }
            return objList;
        }
        public DataTable GetCurrentExamination()
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetCurrentExamination();

            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetCurrentExamination");
                throw ex;
            }
            return dt;
        }
        public DataTable GetExaminationDetails(int ExamID)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetExaminationDetails(ExamID);

            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetCurrentExamination");
                throw ex;
            }
            return dt;
        }
        public bool IsEstablishmentFormLocked(long EastablishmentID)
        {
            bool retVal = false;
            try
            {
                retVal = false;
            }
            catch (Exception ex)
            {

                CommonHelper.SaveException(ex.Message, "IsEstablishmentFormLocked");
                throw ex;
            }
            return retVal;
        }
        public List<DropdownEntity> GetMasterBTRI()
        {
            List<DropdownEntity> objList = new List<DropdownEntity>();
            try
            {
                DataTable dt = new DataTable();//objData.GetMasterBTRI();
                objList = DataTableToList(dt, true);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetMasterBTRI");
                throw ex;
            }
            return objList;
        }
        public List<DropdownEntity> GetMasterBTRI(long EstablishmentID)
        {
            List<DropdownEntity> objList = new List<DropdownEntity>();
            try
            {
                DataTable dt = new DataTable();//objData.GetMasterBTRI(EstablishmentID);
                objList = DataTableToList(dt, false);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetMasterBTRI");
                throw ex;
            }
            return objList;
        }
        public DataTable GetTimeTableCourseWise(long CourseID, int ExaminationID)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetTimeTableCourseWise(CourseID, ExaminationID);

            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetTimeTableCourseWise");
                throw ex;
            }
            return dt;
        }
        public List<OtherInfraEntity> GetMasterOtherInfraDetails()
        {
            List<OtherInfraEntity> ls = new List<OtherInfraEntity>();


            try
            {
                DataSet ds = objData.GetMasterOtherInfraDetails();


            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetMasterOtherInfraDetails");
                throw ex;
            }
            return ls;
        }

        public DataTable IsEditingAllowed(InstituteInputEntity entity)
        {
            DataTable dt;
            try
            {
                dt = objData.IsEditingAllowed(entity);

            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "IsEditingAllowed");
                throw ex;
            }
            return dt;
        }
        public DataTable GetCourseSearch(short SectorID, short CourseCategoryID, string CourseType, short EntryQualificationID, int CourseID)
        {
            DataTable dt;
            try
            {
                dt = objData.GetCourseSearch(SectorID, CourseCategoryID, CourseType, EntryQualificationID, CourseID);

            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetCourseSearch");
                throw ex;
            }
            return dt;
        }
        public DataTable GetCourseSearchForAdmission(short SectorID, short CourseCategoryID, string CourseType, short EntryQualificationID, int CourseID)
        {
            DataTable dt;
            try
            {
                dt = objData.GetCourseSearchForAdmission(SectorID, CourseCategoryID, CourseType, EntryQualificationID, CourseID);

            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetCourseSearchForAdmission");
                throw ex;
            }
            return dt;
        }
        public List<DropdownEntity> GetMasterSubSector(short SectorID)
        {
            List<DropdownEntity> objList = new List<DropdownEntity>();
            try
            {
                DataTable dt = objData.GetMasterSubSector(SectorID);
                objList = DataTableToList(dt, true);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetMasterSubSector");
                throw ex;
            }
            return objList;
        }

        // Master Mapping

        public DataSet GetMappingMasterDetails(int mappingId, int parentId)
        {
            DataSet dt;
            try
            {
                dt = objData.GetMappingMasterDetails(mappingId, parentId);

            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetMappingMasterDetails");
                throw ex;
            }
            return dt;
        }

        public string SetMappingMasterDetails(MappingMasterEntity entity)
        {
            string retVal = "N";
            try
            {
                retVal = objData.SetMappingMasterDetails(entity);
                if (retVal == "N")
                {
                    retVal = "Data has not been added.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SetMappingMasterDetails");
                throw ex;
            }
            return retVal;
        }

        public List<DropdownEntity> GetMasterCourseFilter(short SectorID, short CourseCategoryID, string CourseType, short EntryQualificationID)
        {
            List<DropdownEntity> objList = new List<DropdownEntity>();
            try
            {
                DataTable dt = objData.GetMasterCourseFilter(SectorID, CourseCategoryID, CourseType, EntryQualificationID);
                objList = DataTableToList(dt, true);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetMasterCourseFilter");
                throw ex;
            }
            return objList;
        }
        public string IsDuplicateCourseCode(string CourseCode)
        {
            string retVal = string.Empty;
            try
            {
                retVal = objData.IsDuplicateCourseCode(CourseCode);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "IsDuplicateCourseCode", CourseCode.ToString());

            }
            return retVal;
        }
        public string IsDuplicateCourseName(string CourseName)
        {
            string retVal = string.Empty;
            try
            {
                retVal = objData.IsDuplicateCourseName(CourseName);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "IsDuplicateCourseName", CourseName.ToString());
            }
            return retVal;
        }

        public List<DropdownEntity> GetMasterTrainingNameofItem()
        {
            List<DropdownEntity> objList = new List<DropdownEntity>();
            try
            {
                DataTable dt = objData.GetMasterTrainingNameofItem();
                objList = DataTableToList(dt, true);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetMasterRegionDistrict");
                throw ex;
            }
            return objList;
        }

        public DataTable GetApprovalOrder()
        {
            DataTable dt;
            try
            {
                dt = objData.GetApprovalOrder();

            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetApprovalOrder");
                throw ex;
            }
            return dt;
        }
        //public DataTable GetApprovalOrderByID(Int64 ID)
        //{
        //    DataTable dt;
        //    try
        //    {
        //        dt = objData.GetApprovalOrderByID(ID);

        //    }
        //    catch (Exception ex)
        //    {
        //        CommonHelper.SaveException(ex.Message, "GetApprovalOrderByID");
        //        throw ex;
        //    }
        //    return dt;
        //}
        public ApprovalOrderEntity GetApprovalOrderByID(long ID)
        {
            ApprovalOrderEntity entity = new ApprovalOrderEntity();
            try
            {
                DataTable dt = objData.GetApprovalOrderByID(ID);
                if (dt.Rows.Count > 0)
                {
                    DataRow dr = dt.Rows[0];
                    entity.ID = Convert.ToInt64(dr["ID"].ToString());
                    entity.ApprovalOrder = dr["ApprovalOrder"].ToString();
                    entity.ApprovalOrderDate = Convert.ToDateTime(dr["ApprovalOrderDate"].ToString());
                    entity.ApprovalOrderNo = dr["ApprovalOrderNo"].ToString();
                    entity.ApprovalOrderDateDisplay = dr["ApprovalOrderDateDisplay"].ToString();
                    entity.ApprovalOrderRemakr = dr["ApprovalOrderRemakr"] == null ? "" : dr["ApprovalOrderRemakr"].ToString();
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetApprovalOrderByID");
                throw ex;
            }
            return entity;
        }
        public string SaveApprovalOrder(ApprovalOrderEntity entity)
        {
            string retVal = "";
            try
            {
                retVal = objData.SaveApprovalOrder(entity);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveCandidateBank", entity.UserLoginID);
                retVal = ex.Message;
            }
            return retVal;
        }
        public string DeleteApprovalOrder(long ID, string UserLoginID, string IPAddress)
        {
            string retVal = "";
            try
            {
                retVal = objData.DeleteApprovalOrder(ID, UserLoginID, IPAddress);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveCandidateBank", UserLoginID);
                retVal = ex.Message;
            }
            return retVal;
        }
        public List<DropdownEntity> GetMasterInstituteFilter(int RegionID, int DistrictID, int TalukaID, long ExaminationID)
        {
            List<DropdownEntity> objList = new List<DropdownEntity>();
            try
            {
                DataTable dt = objData.GetMasterInstituteFilter(RegionID, DistrictID, TalukaID, ExaminationID);
                objList = DataTableToList(dt, true);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetMasterInstituteFilter");
                throw ex;
            }
            return objList;
        }


        public DataTable GetIsGovCollege(long CollegeID, string UserLoginID)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetIsGovCollege(CollegeID, UserLoginID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetIsGovCollege_" + CollegeID);
                throw;
            }
            return dt;
        }

        public DataTable GetIsActivityValid(string ActivityName)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetIsActivityValid(ActivityName);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetIsActivityValid_" + ActivityName);
                throw;
            }
            return dt;
        }

        // SDI
        public List<string> GetMasterIgnoreWords()
        {
            List<string> lst = new List<string>();
            DataTable dt;
            try
            {
                dt = objData.GetMasterIgnoreWords();
                foreach (DataRow dr in dt.Rows)
                {
                    lst.Add(dr["WordsName"].ToString());
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetCourseSearchForAdmission");
                throw ex;
            }
            return lst;
        }
        public List<DropdownEntity> GetMasterSkillInstitute()
        {
            List<DropdownEntity> objList = new List<DropdownEntity>();
            try
            {
                DataTable dt = objData.GetMasterSkillInstitute();
                objList = DataTableToList(dt, true);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetMasterSkillInstitute");
                throw ex;
            }
            return objList;
        }

        public DataTable GetUserRegionDistrictTaluka(string userLoginID)
        {
            DataTable dt = null;

            try
            {
                dt = objData.GetUserRegionDistrictTaluka(userLoginID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetUserRegionDistrictTaluka", userLoginID);
            }

            return dt;
        }

        public Int64 GetPromotingOrganisationIDByTempInstituteID(Int64 InstituteID)
        {
            Int64 retVal = 0;
            try
            {
                retVal = objData.GetPromotingOrganisationIDByTempInstituteID(InstituteID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetPromotingOrganisationIDByTempInstituteID", InstituteID.ToString());
                throw ex;
            }
            return retVal;
        }
        public Int64 GetPromotingOrganisationIDByInstituteCode(string InstituteCode)
        {
            Int64 retVal = 0;
            try
            {
                retVal = objData.GetPromotingOrganisationIDByInstituteCode(InstituteCode);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetPromotingOrganisationIDByInstituteCode", InstituteCode);
                throw ex;
            }
            return retVal;
        }

        public List<DropdownEntity> GetSectorwiseCourseTypes(Int32 SectorID)
        {
            List<DropdownEntity> objList = new List<DropdownEntity>();
            try
            {
                DataTable dt = objData.GetSectorwiseCourseType(SectorID);
                objList = DataTableToList(dt, true);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetSectorwiseCourseType");
                throw ex;
            }
            return objList;
        }

        public Int64 GetExistingInstituteID(Int64 InstituteID)
        {
            Int64 retVal = 0;
            try
            {
                retVal = objData.GetExistingInstituteID(InstituteID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetExistingInstituteID", InstituteID.ToString());
                throw ex;
            }
            return retVal;
        }

        // stt 

        public DataTable GetCourseSearchForAdmissionSTT(Int16 SectorID, Int16 CourseCategoryID, string CourseType, Int16 EntryQualificationID, Int32 CourseID)
        {
            DataTable dt;
            try
            {
                dt = objData.GetCourseSearchForAdmissionSTT(SectorID, CourseCategoryID, CourseType, EntryQualificationID, CourseID);

            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetCourseSearchForAdmissionSTT");
                throw ex;
            }
            return dt;

        }
        public DataTable GetCoursesForAdmissionITISTT(Int16 SectorID, Int16 CourseCategoryID, string CourseType, Int16 EntryQualificationID, Int32 CourseID)
        {
            DataTable dt;
            try
            {
                dt = objData.GetCoursesForAdmissionITISTT(SectorID, CourseCategoryID, CourseType, EntryQualificationID, CourseID);

            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetCoursesForAdmissionITISTT");
                throw ex;
            }
            return dt;
        }
        //newly added for the ExamTimeTable page 

        public DataTable GetExamTimetableCourses()
        {
            DataTable dt;
            try
            {
                dt = objData.GetExamTimetableCourses();
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetExamTimetableCourses");
                throw;
            }
            return dt;
        }

        public DataTable GetCourseSearchForExamTimeTable(string courseCode, long examinationId)
        {
            DataTable dt;
            try
            {
                dt = objData.GetCourseSearchForExamTimeTable(courseCode, examinationId);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetCourseSearchForExamTimeTable");
                throw;
            }
            return dt;
        }

        public List<DropdownEntity> GetMasterTaluka()
        {
            List<DropdownEntity> objList = new List<DropdownEntity>();
            try
            {
                DataTable dt = objData.GetMasterTaluka();
                objList = DataTableToList(dt, true);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetMasterTaluka");
                throw ex;
            }
            return objList;

        }

        public DataTable GetVisitorStatistics()
        {
            DataTable dt;
            try
            {
                dt = objData.GetVisitorStatistics();
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetVisitorStatistics");
                throw;
            }
            return dt;
        }


        public DataSet GetSecretaryDashboard()
        {
            DataSet ds = new DataSet();
            try
            {
                ds = objData.GetSecretaryDashboard();
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetSecretaryDashboard", "");
                throw ex;
            }
            return ds;
        }

        //  commiittee meneber for inspection 
        public DataTable GetInspectionCommitteeByApplicantDate(DateTime applicantDate)
        {
            DataTable dt;
            try
            {
                dt = objData.GetInspectionCommitteeByApplicantDate(applicantDate);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetInspectionCommitteeByApplicantDate");
                throw;
            }
            return dt;
        }
        //
        public DataTable GetMasterCourseData(int CourseID, string CourseCode, int PageNumber, int PageSize
     )
        {
            try
            {
                return objData.GetMasterCourseData( CourseID,  CourseCode,  PageNumber,  PageSize);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(
                    ex.Message,
                    "GetMasterCourse");

                throw;
            }
        }

    //    public string SaveMasterCourse(
    //MasterCourseEntity entity)
    //    {
    //        string returnval = "N";

    //        try
    //        {
    //            returnval =
    //                objData.SaveMasterCourse(entity);
    //        }
    //        catch (Exception ex)
    //        {
    //            CommonHelper.SaveException(
    //                ex.Message,
    //                "SaveMasterCourse");

    //            throw;
    //        }

    //        return returnval;
    //    }
    }
}
