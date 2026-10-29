using Newtonsoft.Json;
using Portal.Data.Source;
using Portal.Entities;
using Portal.Entities.Base;
using Portal.Entities.Institute;
using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Security.Cryptography.X509Certificates;
using System.Text;
using System.Threading.Tasks;
using System.Xml;
using System.Xml.Linq;
using System.Xml.Serialization;
using static System.Net.Mime.MediaTypeNames;

namespace Portal.Data
{
    public partial class Repository
    {
        protected readonly DatabaseAccess _dbAccess;
        public Repository(DatabaseAccess dbAccess) // ✅ Inject dependency via constructor
        {
            _dbAccess = dbAccess ?? throw new ArgumentNullException(nameof(dbAccess));
        }
        public DataTable GetMasterTableList(string TableName, string DataValueField, string DataTextField, string ParentField = "", string ParentFieldValue = "", string orderByText = "")
        {
            var param = new Dictionary<string, object>();

            param.Add("@TableName", TableName);
            param.Add("@DataValueField", DataValueField);
            param.Add("@DataTextField", DataTextField);
            param.Add("@ParentField", ParentField);
            param.Add("@ParentFieldValue", ParentFieldValue);
            param.Add("@OrderByFields", orderByText);

            return _dbAccess.GetDataTable("Base_GetMasterTableList", param);
        }
        public DataTable GetMasterRegion()
        {
            return _dbAccess.GetDataTable("Base_GetMasterRegion");
        }
        public DataTable GetMasterRegionDistrict()
        {
            return _dbAccess.GetDataTable("Base_GetMasterRegionDistrict");
        }
        public DataTable GetMasterDistrictTalukas()
        {
            return _dbAccess.GetDataTable("Base_GetMasterDistrictTalukas");
        }
        public DataTable GetMasterDistrict()
        {
            return _dbAccess.GetDataTable("Base_GetMasterDistrict");
        }
        public DataTable GetMasterTaluka()
        {
            return _dbAccess.GetDataTable("Base_GetMasterTaluka");
        }
        public DataTable GetMasterCity()
        {
            return _dbAccess.GetDataTable("Base_GetMasterCity");
        }
        public DataTable GetMasterCaste()
        {
            return _dbAccess.GetDataTable("Base_GetMasterCaste");
        }
        public DataTable GetMasterQualification(Int64 CandidateID, string QualificationGroup)
        {
            var param = new Dictionary<string, object>();

            param.Add("@CandidateID", CandidateID);
            param.Add("@QualificationGroup", QualificationGroup);

            return _dbAccess.GetDataTable("Base_GetMasterQualification", param);
        }
        public DataTable GetMasterSector()
        {
            return _dbAccess.GetDataTable("Base_GetMasterSector");
        }
        public DataTable GetMasterCourseType()
        {
            return _dbAccess.GetDataTable("Base_GetMasterCourseType");
        }
        //public DataTable GetMasterCourse(Int16 SectorID, Int16 CourseTypeID)
        //{
        //    var param = new Dictionary<string, object>();

        //    param.Add("@SectorID", SectorID);
        //    param.Add("@CourseTypeID", CourseTypeID);

        //    return _dbAccess.GetDataTable("Base_GetMasterCourse", param);

        //}
        public DataTable GetMasterCourse(Int16 SectorID, Int16 CourseTypeID, string Flag = "")
        {
            var param = new Dictionary<string, object>();

            param.Add("@SectorID", SectorID);
            param.Add("@CourseTypeID", CourseTypeID);
            param.Add("@Flag", Flag);
            return _dbAccess.GetDataTable("Base_GetMasterCourse", param);

        }
        public DataTable GetMasterInstitute()
        {
            //var param = new Dictionary<string, object>();

            //param.Add("@SectorID", SectorID);
            //param.Add("@CourseTypeID", CourseTypeID);

            return _dbAccess.GetDataTable("Base_GetMasterInstitute");

        }
        public DataTable GetMasterEntryQualification()
        {
            return _dbAccess.GetDataTable("Base_GetMasterEntryQualification");
        }
        public void SaveLog(LogEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@LogSource", entity.LogSource);
            param.Add("@URL", entity.BrowserInfo.URL);
            param.Add("@BrowserName", entity.BrowserInfo.BrowserName);
            param.Add("@BrowserVersion", entity.BrowserInfo.BrowserVersion);
            param.Add("@UserHostAddress", entity.BrowserInfo.UserHostAddress);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@ErrorMessage", entity.ErrorMessage);
         _dbAccess.ExecuteNonQuery("Log_SaveLog", param);
        }
        public Task<Int32> SaveMessageContent(MessagingEntity me)
        {
            var param = new Dictionary<string, object>();

            param.Add("@MessageType", me.MessageType);
            param.Add("@Purpose", me.Purpose);
            param.Add("@MessageSubject", me.MessageSubject);
            param.Add("@MessageText", me.MessageText);
            param.Add("@MobileNo", me.MobileNo);
            param.Add("@EMailID", me.EMailID);
            param.Add("@SentBy", me.SentBy);
            param.Add("@IPAddress", me.IPAddress);


            Int32 i = _dbAccess.ExecuteNonQuery("Message_SaveMessageContent", param);

            return Task.FromResult(i);
        }
        public bool IsNewRegistrationStarted(Int16 UserTypeID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@UserTypeID", UserTypeID);

            return Convert.ToBoolean(_dbAccess.ExecuteScalar("Base_IsNewRegistrationStarted", param));
        }
        public string GetOTP(string MobileNo, string Purpose, string OTP)
        {
            var param = new Dictionary<string, object>();

            param.Add("@MobileNo", MobileNo);
            param.Add("@Purpose", Purpose);
            param.Add("@OTP", OTP);

            return _dbAccess.ExecuteScalar("Base_GetOTP", param).ToString();
        }
        public void SaveOTPVerificationStatus(string MobileNo, string Purpose, string OTP, bool IsOTPVerified)
        {
            var prams = new Dictionary<string, object>();

            prams.Add("@MobileNo", MobileNo);
            prams.Add("@Purpose", Purpose);
            prams.Add("@OTP", OTP);
            prams.Add("@IsOTPVerified", IsOTPVerified);

            _dbAccess.ExecuteNonQuery("Base_SaveOTPVerificationStatus", prams);
        }
        public DataTable GetPincodeData(string Pincode)
        {
            var param = new Dictionary<string, object>();

            param.Add("@Pincode", Pincode);

            return _dbAccess.GetDataTable("Base_GetPincodeData", param);
        }
        public bool IsCandidateFormLocked(Int64 CandidateID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@CandidateID", CandidateID);

            return Convert.ToBoolean(_dbAccess.ExecuteScalar("Base_IsCandidateFormLocked", param));
        }
        public DataTable GetEMailSMS(string Purpose, string MessageType, string Param1 = "", string Param2 = "", string Param3 = "", string Param4 = "", string Param5 = "")
        {
            var param = new Dictionary<string, object>();

            param.Add("@Purpose", Purpose);
            param.Add("@MessageType", MessageType);
            param.Add("@Param1", Param1);      
            param.Add("@Param2", Param2);      
            param.Add("@Param3", Param3);
            param.Add("@Param4", Param4);
            param.Add("@Param5", Param5);

            return _dbAccess.GetDataTable("Base_GetEMailSMS", param); // Base_GetEMailSMS
        }


        public Int64 GetApprovedInstituteIDByInstituteCode(string InstituteCode)
        {
            var param = new Dictionary<string, object>();

            param.Add("@InstituteCode", InstituteCode);

            return Convert.ToInt64(_dbAccess.ExecuteScalar("Base_GetApprovedInstituteIDByInstituteCode", param).ToString());
        }


        public DataTable CheckExistingInstituteSDIApplicationExists(Int64 InstituteID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@InstituteID", InstituteID);
            return _dbAccess.GetDataTable("Institute_CheckExistingInstituteSDIApplicationExists", param);
        } 


        public Int16 GetCandidateStepID(Int64 CandidateID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@CandidateID", CandidateID);

            return Convert.ToInt16(_dbAccess.ExecuteScalar("Base_GetCandidateStepID", param));
        }
        public string GetCandidateMobileNo(Int64 CandidateID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@CandidateID", CandidateID);

            return Convert.ToString(_dbAccess.ExecuteScalar("Base_GetCandidateMobileNo", param));
        }
        public DataTable IsStaffAadharNoDuplicate(string AadharNo, Int64 StaffID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@AadharNo", AadharNo);
            param.Add("@StaffID", StaffID);

            return _dbAccess.GetDataTable("Staff_IsAadharNoDuplicate", param);
        }
        public DataTable IsCandidateAadharNoDuplicate(string AadharNo, Int64 CandidateID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@AadharNo", AadharNo);
            param.Add("@CandidateID", CandidateID);
            return _dbAccess.GetDataTable("Candidate_IsAadharNoDuplicate", param);
        }
        public string GetXML<T>(List<T> objData)
        {
            var dataToSerialize = objData ?? new List<T>();
            XmlSerializer xmlSerializer = new XmlSerializer(dataToSerialize.GetType());


            // Create XmlWriterSettings to omit the XML declaration
            var settings = new XmlWriterSettings
            {
                OmitXmlDeclaration = true,
                Encoding = Encoding.UTF8,
                Indent = false
            };

            using (var stringWriter = new StringWriter())
            using (var xmlWriter = XmlWriter.Create(stringWriter, settings))
            {
                xmlSerializer.Serialize(xmlWriter, objData);
                return stringWriter.ToString();
            }
        }

        public Int64 GetCandidateID(string ApplicationID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@ApplicationID", ApplicationID);

            return Convert.ToInt64(_dbAccess.ExecuteScalar("Base_GetCandidateID", param).ToString());
        }
        public string GetCandidateName(Int64 CandidateID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@CandidateID", CandidateID);

            return _dbAccess.ExecuteScalar("Base_GetCandidateName", param).ToString();
        }
        public void SaveUserActionDetails(string Module, string UserLoginID, string ApplicationID, string ActionTaken, string IPAddress, string PageURL)
        {
            var prams = new Dictionary<string, object>();

            prams.Add("@Module", Module);
            prams.Add("@UserLoginID", UserLoginID);
            prams.Add("@ApplicationID", ApplicationID);
            prams.Add("@ActionTaken", ActionTaken);
            prams.Add("@IPAddress", IPAddress);
            prams.Add("@PageURL", PageURL);

            _dbAccess.ExecuteNonQuery("Log_SaveUserActionDetails", prams);
        }
        public DataTable GetMasterPromoterType(string group = "")
        {
            var prams = new Dictionary<string, object>();

            prams.Add("@Group", group);

            return _dbAccess.GetDataTable("Base_GetMasterPromoterType", prams);
        }
        public DataTable GetMasterPromoterStatus()
        {
            return _dbAccess.GetDataTable("Base_GetMasterPromoterStatus");
        }
        public DataTable GetMasterLocationCategory()
        {
            return _dbAccess.GetDataTable("Base_GetMasterLocationCategory");
        }

        public Int64 GetInstituteIDByInstituteCode(string InstituteCode)
        {
            var param = new Dictionary<string, object>();

            param.Add("@InstituteCode", InstituteCode);

            return Convert.ToInt64(_dbAccess.ExecuteScalar("Base_GetInstituteIDByInstituteCode", param).ToString());
        }

        public bool IsPasswordValid(string UserLoginID, string UserPassword)
        {
            var param = new Dictionary<string, object>();

            param.Add("@UserLoginID", UserLoginID);
            param.Add("@UserPassword", UserPassword);

            return Convert.ToBoolean(_dbAccess.ExecuteScalar("Base_IsPasswordValid", param));
        }
        public bool IsAdmissionConfirmationStarted()
        {
            return Convert.ToBoolean(_dbAccess.ExecuteScalar("Base_IsAdmissionConfirmationStarted"));
        }
        public DataTable GetCurrentAdmissionYear()
        {
            return _dbAccess.GetDataTable("Base_GetCurrentAdmissionYear");
        }
        public DataTable GetCurrentFinancialYear()
        {
            return _dbAccess.GetDataTable("Base_GetCurrentFinancialYear");
        }
        public DataTable GetCurrentAdmissionYearForApplication()
        {
            return _dbAccess.GetDataTable("Base_GetCurrentAdmissionYearForApplication");
        }
        public DataTable GetAdmissionYear()
        {
            return _dbAccess.GetDataTable("Base_GetAdmissionYear");
        }
        public DataTable GetMasterMainCourse()
        {
            return _dbAccess.GetDataTable("Base_GetMasterMainCourse");
        }
        public Int64 GetApplicationIDByApplicationIDDisplay(string ApplicationIDDisplay)
        {
            var param = new Dictionary<string, object>();

            param.Add("@ApplicationIDDisplay", ApplicationIDDisplay);

            return Convert.ToInt64(_dbAccess.ExecuteScalar("Base_GetApplicationIDByApplicationIDDisplay", param));

        }
        public Int64 GetCandidateIDByApplicationID(Int64 ApplicationID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@ApplicationID", ApplicationID);

            return Convert.ToInt64(_dbAccess.ExecuteScalar("Base_GetCandidateIDByApplicationID", param));

        }

        public string GetCandidateProfileIDByCandidateId(Int64 CandidateID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@CandidateID", CandidateID);

            return Convert.ToString(_dbAccess.ExecuteScalar("Base_GetCandidateProfileIDByCandidateId", param));

        }
        public string GetCandidateProfileIDByApplicationID(Int64 ApplicationID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@ApplicationID", ApplicationID);

            return Convert.ToString(_dbAccess.ExecuteScalar("Base_GetCandidateProfileIDByApplicationID", param));

        }
        public string GetApplicationIDDisplayByApplicationID(Int64 ApplicationID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@ApplicationID", ApplicationID);

            return Convert.ToString(_dbAccess.ExecuteScalar("Base_GetApplicationIDDisplayByApplicationID", param));

        }
        public DataTable GetIsGovCollege(long CollegeID, string UserLoginID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@CollegeID", CollegeID);
            param.Add("@UserLoginID", UserLoginID);
            return _dbAccess.GetDataTable("Base_GetIsGovCollege", param);
        }

        public DataTable GetIsActivityValid(string ActivityName)
        {
            var param = new Dictionary<string, object>();
            param.Add("@ActivityName", ActivityName);

            return _dbAccess.GetDataTable("Administration_GetIsActivityValid", param);
        }

        public DataSet GetHomeDashboard()
        {
            return _dbAccess.GetDataSet("Basic_GetHomeDashboard");
        }
        public DataSet GetHomeSTTDashboard()
        {
            return _dbAccess.GetDataSet("Basic_GetHomeSTTDashboard");
        }
        public DataTable GetBaseCourseByCollogeID(Int64 CollegeID , Int16 isnewadmission)
        {
            var param = new Dictionary<string, object>();

            param.Add("@CollegeID", CollegeID);
            param.Add("@IsNewAdmission", isnewadmission);


            return _dbAccess.GetDataTable("Base_GetCourseByCollogeID", param);

        }
        public DataTable GetRegionInstitute(int RegionID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@RegionID", RegionID);

            return _dbAccess.GetDataTable("Base_GetRegionInstitute", param);

        }
        public Int32 GetDistrictIDByDistrictUser(string UserLoginID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@LoginID", UserLoginID);
            return Convert.ToInt32(_dbAccess.ExecuteScalar("Base_GetDistrictIDByDistrictUser", param).ToString());
        }
        public DataTable GetInstiuteInfo(Int64 InstituteID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@InstituteID", InstituteID);
            return _dbAccess.GetDataTable("Base_GetInstiuteInfo", param);

        }

        public DataTable GetCourseType()
        {
            return _dbAccess.GetDataTable("Base_GetCourseType");
        }

        public DataTable GetExamType()
        {
            return _dbAccess.GetDataTable("Base_GetExamType");
        }

        public DataTable GetMasterInstituteForExamCerter()
        {
            return _dbAccess.GetDataTable("Base_GetMasterInstituteForExamCerter");

        }
        public Int16 GetStaffStepID(Int64 StaffID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@StaffID", StaffID);

            return Convert.ToInt16(_dbAccess.ExecuteScalar("Base_GetStaffStepID", param));
        }
        public bool IsStaffFormLocked(Int64 StaffID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@StaffID", StaffID);

            return Convert.ToBoolean(_dbAccess.ExecuteScalar("Base_IsStaffFormLocked", param));
        }
        public Int64 GetStaffID(string ApplicationID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@ApplicationID", ApplicationID);

            return Convert.ToInt64(_dbAccess.ExecuteScalar("Base_GetStaffID", param).ToString());
        }
        public DataTable GetMasterPromotingType()
        {
            return _dbAccess.GetDataTable("Base_GetMasterPromotingType");
        }
        public bool ISSectorialExpertiseRequired(Int64 StaffID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@StaffID", StaffID);

            return Convert.ToBoolean(_dbAccess.ExecuteScalar("Base_ISSectorialExpertiseRequired", param));
        }
        public DataTable GetMasterMainCourseApply()
        {
            return _dbAccess.GetDataTable("Base_GetMasterMaster_MainCourseApply");
        }
        public DataTable GetExamination()
        {
            return _dbAccess.GetDataTable("Base_GetExamination");
        }

        public DataTable GetExamination(long InstituteID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@InstituteID", InstituteID);

            return _dbAccess.GetDataTable("Base_GetExaminationByInstituteID", param);
        }

        public DataTable GetTimeTableSubject(Int32 ExaminationID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@ExaminationID", ExaminationID);
            return _dbAccess.GetDataTable("Base_GetTimeTableSubject", param);
        }
        public bool IsEvaluationReportDate(string Type)
        {
            var param = new Dictionary<string, object>();
            param.Add("@Type", Type);
            return Convert.ToBoolean(_dbAccess.ExecuteScalar("Base_IsEvaluationReportDate", param));
        }
        public DataTable GetElectiveSubjectes()
        {
            return _dbAccess.GetDataTable("Base_GetElectiveSubjectes");
        }
        public DataTable GetCurrentExamination()
        {
            return _dbAccess.GetDataTable("Base_GetCurrentExamination");
        }
        public DataTable GetExaminationDetails(Int32 ExamID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@ExamID", ExamID);
            return _dbAccess.GetDataTable("Base_GetExaminationDetails", param);
        }

        public DataTable GetTimeTableCourseWise(Int64 CourseID, Int32 ExaminationID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@CourseID", CourseID);
            param.Add("@ExaminationID", ExaminationID);
            return _dbAccess.GetDataTable("Base_GetTimeTable", param);

        }

        public DataTable IsEditingAllowed(InstituteInputEntity entity)
        {
            var param = new Dictionary<string, object>();
            param.Add("@InstituteID", entity.InstituteId);
            param.Add("@UserLoginId", entity.UserLoginID);
            param.Add("@PageCode", entity.PageCode);

            return _dbAccess.GetDataTable("Institute_IsEditingAllowed", param);
        }

        // Master Mapping

        public DataSet GetMappingMasterDetails(int mappingId, int ParentId)
        {
            var param = new Dictionary<string, object>();
            param.Add("@MappingId", mappingId);
            param.Add("@ParentId", ParentId);

            return _dbAccess.GetDataSet("Base_GetMappingMasterDetails", param);
        }

        public string SetMappingMasterDetails(MappingMasterEntity entity)
        {
            var param = new Dictionary<string, object>();
            param.Add("@MappingId", entity.MappingId);
            param.Add("@ColumnValueEnglish", entity.ColumnValueEnglish);
            param.Add("@ColumnValueMarathi", entity.ColumnValueMarathi);
            param.Add("@ParentColumnValue", entity.ParentColumnValue);
            param.Add("@IsActive", entity.IsActive);
            param.Add("@UserLoginId", entity.UserLoginId);
            param.Add("@IPAddress", entity.IPAddress);
            param.Add("@ExtraColumn1Value", entity.ExtraColumn1Value);
            param.Add("@ExtraColumn2Value", entity.ExtraColumn2Value);
            param.Add("@ExtraColumn3Value", entity.ExtraColumn3Value);
            param.Add("@ExtraColumn4Value", entity.ExtraColumn4Value);

            return _dbAccess.ExecuteScalar("Base_SetMappingMasterDetails", param).ToString();

        }


        public DataTable GetCourseSearch(Int16 SectorID, Int16 CourseCategoryID, string CourseType, Int16 EntryQualificationID, Int32 CourseID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@SectorID", SectorID);
            param.Add("@CourseCategoryID", CourseCategoryID);
            param.Add("@CourseType", CourseType);
            param.Add("@EntryQualificationID", EntryQualificationID);
            param.Add("@CourseID", CourseID);

            return _dbAccess.GetDataTable("MasterMgmt_GetCourses", param);

        }
        public DataTable GetCourseSearchForAdmission(Int16 SectorID, Int16 CourseCategoryID, string CourseType, Int16 EntryQualificationID, Int32 CourseID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@SectorID", SectorID);
            param.Add("@CourseCategoryID", CourseCategoryID);
            param.Add("@CourseType", CourseType);
            param.Add("@EntryQualificationID", EntryQualificationID);
            param.Add("@CourseID", CourseID);
            return _dbAccess.GetDataTable("MasterMgmt_GetCoursesForAdmission", param);

        }
        public DataTable GetMasterSubSector(Int16 SectorID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@SectorID", SectorID);
            return _dbAccess.GetDataTable("Base_GetMasterSubSector", param);

        }
        public DataTable GetMasterCourseFilter(Int16 SectorID, Int16 CourseCategoryID, string CourseType, Int16 EntryQualificationID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@SectorID", SectorID);
            param.Add("@CourseCategoryID", CourseCategoryID);
            param.Add("@CourseType", CourseType);
            param.Add("@EntryQualificationID", EntryQualificationID);

            return _dbAccess.GetDataTable("Base_GetMasterCourseFilter", param);

        }
        public string IsDuplicateCourseCode(string CourseCode)
        {
            var param = new Dictionary<string, object>();

            param.Add("@CourseCode", CourseCode);

            return Convert.ToString(_dbAccess.ExecuteScalar("Base_IsDuplicateCourseCode", param));
        }
        public string IsDuplicateCourseName(string CourseName)
        {
            var param = new Dictionary<string, object>();

            param.Add("@CourseName", CourseName);

            return Convert.ToString(_dbAccess.ExecuteScalar("Base_IsDuplicateCourseName", param));
        }
        public DataTable GetMasterTrainingNameofItem()
        {
            return _dbAccess.GetDataTable("Base_GetMasterTrainingNameofItem");
        }

        public DataTable GetApprovalOrderByID(Int64 ID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@ID", ID);
            return _dbAccess.GetDataTable("Base_GetApprovalOrderByID", param);

        }
        public string DeleteApprovalOrder(Int64 ID, string UserLoginID, string IPAddress)
        {
            var param = new Dictionary<string, object>();
            param.Add("@ID", ID);
            param.Add("@UserLoginID", UserLoginID);
            param.Add("@IPAddress", IPAddress);
            return _dbAccess.ExecuteScalar("Base_DeleteApprovalOrder", param).ToString();

        }
        public DataTable GetApprovalOrder()
        {
            return _dbAccess.GetDataTable("Base_GetApprovalOrder");

        }
        public string SaveApprovalOrder(ApprovalOrderEntity entity)
        {
            var param = new Dictionary<string, object>();
            param.Add("@ID", entity.ID);
            param.Add("@ApprovalOrderNo", entity.ApprovalOrderNo);
            param.Add("@ApprovalOrderDate", entity.ApprovalOrderDate);
            param.Add("@ApprovalOrder", entity.ApprovalOrder);
            param.Add("@ApprovalOrderRemakr", entity.ApprovalOrderRemakr);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);
            return _dbAccess.ExecuteScalar("Base_SaveApprovalOrder", param).ToString();
        }
        public DataTable GetMasterInstituteFilter(Int32 RegionID, Int32 DistrictID, Int32 TalukaID, Int64 ExaminationID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@RegionID", RegionID);
            param.Add("@DistrictID", DistrictID);
            param.Add("@TalukaID", TalukaID);
            param.Add("@ExaminationID", ExaminationID);

            return _dbAccess.GetDataTable("Base_GetMasterInstituteFilter", param);

        }

        public DataTable GetRegionWiseInstitutes()
        {
            return _dbAccess.GetDataTable("Dashboard_GetRegionWiseInstitutes");
        }

        public DataTable GetDistrictWiseInstitutes(int regionId)
        {
            var parameters = new Dictionary<string, object>
        {
            { "@RegionID", regionId }
        };
            return _dbAccess.GetDataTable("Dashboard_GetDistrictWiseInstitutes", parameters);
        }

        public DataTable GetSectorWiseCourses()
        {
            return _dbAccess.GetDataTable("Dashboard_GetSectorWiseCourses");
        }

        public DataTable GetCandidateStatistics()
        {
            return _dbAccess.GetDataTable("Dashboard_GetCandidateStatistics");
        }

        public DataTable GetInstitutesByRegionAndDistrict(int regionId, int districtId)
        {
            var parameters = new Dictionary<string, object>
        {
            { "@RegionID", regionId },
            { "@DistrictID", districtId }
        };
            return _dbAccess.GetDataTable("Dashboard_GetInstitutesByRegionAndDistrict", parameters);
        }

        public DataTable GetCoursesBySector(int sectorId)
        {
            var parameters = new Dictionary<string, object>
        {
            { "@SectorID", sectorId }
        };
            return _dbAccess.GetDataTable("Dashboard_GetCoursesBySector", parameters);
        }

        //SDI
        public DataTable GetMasterIgnoreWords()
        {
            return _dbAccess.GetDataTable("Base_GetMaster_IgnoreWords");
        }
        public DataTable GetMasterSkillInstitute()
        {
            return _dbAccess.GetDataTable("Skill_GetMasterInstitute");
        }


        public DataTable GetMasterSectorByITISTT(Int16 ITISTT)
        {
            var param = new Dictionary<string, object>();
            param.Add("@ITISTT", ITISTT);
            return _dbAccess.GetDataTable("Base_GetMasterSectorITISTT", param);
        }

        public DataTable GetSectorwiseCourseType(Int32 SectorID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@SectorID", SectorID);
            return _dbAccess.GetDataTable("Base_GetSectorwiseCourseType", param);
        }
        public DataTable GetMasterCourseByITISTT(Int16 SectorID, Int16 CourseTypeID, Int16 ITISTT)
        {
            var param = new Dictionary<string, object>();

            param.Add("@SectorID", SectorID);
            param.Add("@CourseTypeID", CourseTypeID);
            param.Add("@ITISTT", ITISTT);
            return _dbAccess.GetDataTable("Base_GetMasterCourseByITISTT", param);

        }
        public DataTable GetUserRegionDistrictTaluka(string userLoginID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@UserLoginID", userLoginID);

            return _dbAccess.GetDataTable("GetUserRegionDistrictTaluka", param);
        }

        public Int64 GetPromotingOrganisationIDByTempInstituteID(Int64 InstituteID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@InstituteID", InstituteID);

            return Convert.ToInt64(_dbAccess.ExecuteScalar("Base_GetPromotingOrganisationIDByInstituteID", param).ToString());
        }

        public Int64 GetPromotingOrganisationIDByInstituteCode(string InstituteCode)
        {
            var param = new Dictionary<string, object>();

            param.Add("@InstituteCode", InstituteCode);

            return Convert.ToInt64(_dbAccess.ExecuteScalar("Base_GetPromotingOrganisationIDByInstituteCode", param).ToString());
        }

        public Int64 GetExistingInstituteID(Int64 InstituteID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@InstituteID", InstituteID);

            return Convert.ToInt64(_dbAccess.ExecuteScalar("Base_GetExistingInstituteID", param).ToString());
        }
        //public DataTable GetCourseType()
        //{
        //    return _dbAccess.GetDataTable("Base_GetCourseType");
        //}

        public async Task SaveAadhaarVerificationDetailsAsync(LogAadhaarVerificationRequest request)
        {
            var param = new Dictionary<string, object>
            {
                { "@CandidateId", request.CandidateId },
                { "@FirstName", request.FirstName },
                { "@FatherName", request.FatherName },
                { "@LastName", request.LastName },
                { "@Dob", request.Dob },
                { "@Gender", request.Gender },
                { "@AadhaarNo", request.AadhaarNo },
                { "@IsVerified", request.IsVerified },
                { "@ReferenceNo", request.ReferenceNo },
                { "@SubAUAtransId", request.SubAUAtransId },
                { "@ResponseTs", request.ResponseTs },
                { "@ResponseMsg", request.ResponseMsg },
                { "@RawRet", request.RawRet },
                { "@RawResponse", request.RawResponse },
                { "@UserLoginId", request.UserLoginId },
                { "@IpAddress", request.IpAddress }
            };

              _dbAccess.ExecuteNonQuery("Log_SaveAadhaarVerificationDetails", param);
        }
        public async Task SaveAadhaarReVerificationDetailsAsync(LogAadhaarReVerificationRequest request)
        {
            var param = new Dictionary<string, object>
            {
                { "@CandidateId", request.CandidateId },
                { "@FirstName", request.FirstName },
                { "@FatherName", request.FatherName },
                { "@LastName", request.LastName },
                { "@Dob", request.Dob },
                { "@Gender", request.Gender },
                { "@AadhaarNo", request.AadhaarNo },
                { "@IsReVerified", request.IsReVerified },
                { "@ReferenceNo", request.ReferenceNo },
                { "@SubAUAtransId", request.SubAUAtransId },
                { "@ResponseTs", request.ResponseTs },
                { "@ResponseMsg", request.ResponseMsg },
                { "@RawRet", request.RawRet },
                { "@RawResponse", request.RawResponse },
                { "@UserLoginId", request.UserLoginId },
                { "@IpAddress", request.IpAddress }
            };

              _dbAccess.ExecuteNonQuery("Log_SaveAadhaarReVerificationDetails", param);
        }

        //stt
        public DataTable GetCoursesForAdmissionITISTT(Int16 SectorID, Int16 CourseCategoryID, string CourseType, Int16 EntryQualificationID, Int32 CourseID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@SectorID", SectorID);
            param.Add("@CourseCategoryID", CourseCategoryID);
            param.Add("@CourseType", CourseType);
            param.Add("@EntryQualificationID", EntryQualificationID);
            param.Add("@CourseID", CourseID);
            return _dbAccess.GetDataTable("MasterMgmt_GetCoursesForAdmissionITISTT", param);

        }

        public DataTable GetCourseSearchForAdmissionSTT(Int16 SectorID, Int16 CourseCategoryID, string CourseType, Int16 EntryQualificationID, Int32 CourseID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@SectorID", SectorID);
            param.Add("@CourseCategoryID", CourseCategoryID);
            param.Add("@CourseType", CourseType);
            param.Add("@EntryQualificationID", EntryQualificationID);
            param.Add("@CourseID", CourseID);
            return _dbAccess.GetDataTable("MasterMgmt_GetCoursesForAdmission", param);

        }

        //newly added for the ExamTimeTable page 
        public DataTable GetExamTimetableCourses()
        {
            var param = new Dictionary<string, object>();

            return _dbAccess.GetDataTable("GetExamTimetableCourses", param);
        }

        public DataTable GetCourseSearchForExamTimeTable(string courseCode, long examinationId)
        {
            var param = new Dictionary<string, object>
            {
                { "@CourseCode", courseCode },
                { "@ExaminationID", examinationId }
            };

            return _dbAccess.GetDataTable("GetCourseSearchForExamTimeTable", param);
        }

        public DataTable GetVisitorStatistics()
        {
            var param = new Dictionary<string, object>();

            return _dbAccess.GetDataTable("Base_GetVisitorStatistics", param);
        }




        public DataSet GetSecretaryDashboard()
        {
            return _dbAccess.GetDataSet("Dashboard_GetSecretaryDashboard");
        }

        //committee menebre for inspection 
        public DataTable GetInspectionCommitteeByApplicantDate(DateTime applicantDate)
        {
            var param = new Dictionary<string, object>
    {
        // Passing a DateTime object ensures SQL Server receives it in a format it understands
        { "@ApplicantDate", applicantDate }
    };

            return _dbAccess.GetDataTable("GetInspectionCommitteeByApplicantDate", param);
        }


        //get master_course

        public DataTable GetMasterCourseData(
     int CourseID,
     string CourseCode,
     int PageNumber,
     int PageSize)
        {
            var param = new Dictionary<string, object>();

            param.Add(
                "@CourseID",
                CourseID > 0
                    ? (object)CourseID
                    : -1);

            param.Add(
                "@CourseCode",
                string.IsNullOrWhiteSpace(CourseCode)
                    ? (object)"-1"
                    : CourseCode);

            param.Add(
                "@PageNumber",
                PageNumber > 0 ? PageNumber : 1);

            param.Add(
                "@PageSize",
                PageSize > 0 ? PageSize : 1000);

            return _dbAccess.GetDataTable(
                "sp_Get_Master_Course",
                param);
        }

    //    public string SaveMasterCourse(
    //MasterCourseEntity entity)
    //    {
    //        var param = new Dictionary<string, object>();

    //        string courseJson = JsonConvert.SerializeObject(entity);

    //        param.Add("@CourseID", entity.CourseID);
    //        param.Add("@CourseData", courseJson);
    //        param.Add("@UserLoginID", entity.UserLoginID);
    //        param.Add("@IPAddress", entity.IPAddress);

    //        return _dbAccess
    //            .ExecuteScalar(
    //                "sp_Save_Master_Course",
    //                param)
    //            ?.ToString() ?? "N";
    //    }

    }
}
