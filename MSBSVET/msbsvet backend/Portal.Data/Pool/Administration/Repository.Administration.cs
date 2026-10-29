using Portal.Entities;
using Portal.Entities.Administration;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Data
{
    public partial class Repository
    {
        public DataTable GetAllExamFees()
        {
            return _dbAccess.GetDataTable("Administration_GetAllExamFees");
        }
        public DataTable GetExamFees(Int32 CourseTypeID, Int32 ExamTypeID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@CourseTypeID", CourseTypeID);
            param.Add("@ExamTypeID", ExamTypeID);
            return _dbAccess.GetDataTable("Administration_GetExamFees", param);
        }
        public DataTable GetExamFeesByID(Int32 ID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@ID", ID);

            return _dbAccess.GetDataTable("Administration_GetExamFeesByID", param);
        }
        public string SaveExamFees(Int32 CourseTypeID, Int32 ExamTypeID, Int32 BoardFees, Int32 AssessmentFees, Int32 ExamFees, DateTime? ImplementationDate, string UserLoginID, string IpAddress)
        {
            var param = new Dictionary<string, object>();

            param.Add("@CourseTypeID", CourseTypeID);
            param.Add("@ExamTypeID", ExamTypeID);
            param.Add("@BoardFees", BoardFees);
            param.Add("@AssessmentFees", AssessmentFees);
            param.Add("@ExamFees", ExamFees);
            param.Add("@ImplementationDate", ImplementationDate);
            param.Add("@UserLoginID", UserLoginID);
            param.Add("@IpAddress", IpAddress);

            return _dbAccess.ExecuteScalar("Administration_SaveExamFees", param).ToString();
        }
        public DataTable GetEvaluationForUnlock(Int64 BatchID, string SubjectCode, string subjectType)
        {
            var param = new Dictionary<string, object>();

            param.Add("@BatchID", BatchID);
            param.Add("@SubjectCode", SubjectCode);
           param.Add("@subjectType", subjectType);
            return _dbAccess.GetDataTable("Exam_GetEvaluationForUnlock", param);
        }
        public string UpdateEvaluationMarksUnlock(Int64 BatchID, string SubjectCode, string UserLoginID, string IpAddress, string subjectType)
        {
            var param = new Dictionary<string, object>();

            param.Add("@BatchID", BatchID);
            param.Add("@SubjectCode", SubjectCode);
            param.Add("@UserLoginID", UserLoginID);
            param.Add("@IpAddress", IpAddress);
            param.Add("@subjectType", subjectType);
            return _dbAccess.ExecuteScalar("Exam_UpdateEvaluationMarksUnlock", param).ToString();
        }
        public DataTable GetInstituteCourseBatche(Int64 InstituteID, Int64 CourseID, Int32 AdmissionYearID, bool isAttendanceDashboard = false)
        {
            var param = new Dictionary<string, object>();

            param.Add("@InstituteID", InstituteID);
            param.Add("@CourseID", CourseID);
            param.Add("@AdmissionYearID", AdmissionYearID);
            param.Add("@IsAttendanceDashboard", isAttendanceDashboard);
            return _dbAccess.GetDataTable("Base_GetInstituteCourseBatche", param);

        }
        public DataTable GetBatchWiseAdmittedCandidate(Int64 BatchID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@BatchID", BatchID);
            return _dbAccess.GetDataTable("Base_GetBatchWiseAdmittedCandidate", param);
        }
        public DataTable GetManageContactUs()
        {
            return _dbAccess.GetDataTable("Administration_GetManageContactUs");
        }
        public string SaveUpdateManageContactUs(Int64 ID, Int32 OfficeID, Int32 RegionID, Int32 DistrictID, string GeoLOcation, string Website, string PhoneNo, string Emailid, string HelplineNumber, string Address, string JointDirectorName, string UserLoginID, string IpAddress)
        {
            var param = new Dictionary<string, object>();

            param.Add("@ID", ID);
            param.Add("@OfficeID", OfficeID);
            param.Add("@RegionID", RegionID);
            param.Add("@DistrictID", DistrictID);
            param.Add("@GeoLOcation", GeoLOcation);
            param.Add("@Website", Website);
            param.Add("@PhoneNo", PhoneNo);
            param.Add("@Emailid", Emailid);
            param.Add("@HelplineNumber", HelplineNumber);
            param.Add("@Address", Address);
            param.Add("@JointDirectorName", JointDirectorName);
            param.Add("@IsActive", true);
            param.Add("@UserLoginID", UserLoginID);
            param.Add("@IpAddress", IpAddress);

            return _dbAccess.ExecuteScalar("Administration_SaveUpdateManageContactUs", param).ToString();
        }
        public DataTable GetCandidatePhotoDetails(string ProfileId)
        {
            var param = new Dictionary<string, object>();
            param.Add("@ProfileId", ProfileId);

            return _dbAccess.GetDataTable("CMS_GetCandidatePhotoDetails", param);
        }
        public string UpdateFixedOrientationIssueImage(CandidateUpdatedImageEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@ProfileId", entity.ProfileId);
            param.Add("@CandidateId", entity.CandidateId);
            param.Add("@UpdatedProfilePhoto", entity.UpdatedProfilePhoto);
            param.Add("@UpdatedSignPhoto", entity.UpdatedSignPhoto);
            param.Add("@IPAddress", entity.IPAddress);
            param.Add("@UserLoginID", entity.UserLoginId);

            return _dbAccess.ExecuteScalar("CMS_UpdateFixedOrientationIssueImage", param).ToString();
        }
    }
}
