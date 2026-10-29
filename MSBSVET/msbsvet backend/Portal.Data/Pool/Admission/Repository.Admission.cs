using System;
using System.Collections.Generic;
using System.Data;
using Portal.Entities;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static System.Net.Mime.MediaTypeNames;
//using System.Web.UI.WebControls;
using System.Net;
using Portal.Entities.Candidate;
using Portal.Entities.Admission;

namespace Portal.Data
{
	public partial class Repository
	{
		public DataTable GetRoundList(Int32 UserTypeID, string Flag, string UserLoginID)
		{
			var param = new Dictionary<string, object>();

			param.Add("@UserTypeID", UserTypeID);
			param.Add("@Flag", Flag);
			param.Add("@UserLoginID", UserLoginID);

			return _dbAccess.GetDataTable("CAP_GetRoundList", param);
		}
		public Int16 GetCurrentRoundID()
		{
			return Convert.ToInt16(_dbAccess.ExecuteScalar("Admission_GetCurrentRoundID").ToString());
		}
		public DataTable GetMeritStatus(Int16 RoundID, string MeritType, Int64 CandidateID)
		{
			var param = new Dictionary<string, object>();

			param.Add("@RoundID", RoundID);
			param.Add("@MeritType", MeritType);
			param.Add("@CandidateID", CandidateID);

			return _dbAccess.GetDataTable("CAP_GetMeritStatus", param);
		}
		public DataTable GetAllotmentStatus(Int16 RoundID, Int64 CandidateID)
		{
			var param = new Dictionary<string, object>();

			param.Add("@RoundID", RoundID);
			param.Add("@CandidateID", CandidateID);

			return _dbAccess.GetDataTable("CAP_GetAllotmentStatus", param);
		}
		public DataTable GetAllotmentStatusApi(Int16 RoundID, Int64 CandidateID)
		{
			var param = new Dictionary<string, object>();

			param.Add("@RoundID", RoundID);
			param.Add("@CandidateID", CandidateID);

			return _dbAccess.GetDataTable("CAP_GetAllotmentStatusApi", param);
		}
		public string SaveConsentForAdmission(Int16 RoundID, Int64 CandidateID, Int64 ChoiceCode, string UserLoginID, string IPAddress)
		{
			var param = new Dictionary<string, object>();

			param.Add("@RoundID", RoundID);
			param.Add("@CandidateID", CandidateID);
			param.Add("@ChoiceCode", ChoiceCode);
			param.Add("@UserLoginID", UserLoginID);
			param.Add("@IPAddress", IPAddress);

			return _dbAccess.ExecuteScalar("CAP_SaveConsentForAdmission", param).ToString();
		}
		public DataTable GetAllotmentSummary(Int64 CandidateID, string EncryptedCandidateID)
		{
			var param = new Dictionary<string, object>();

			param.Add("@CandidateID", CandidateID);
			param.Add("@EncryptedCandidateID", EncryptedCandidateID);

			return _dbAccess.GetDataTable("CAP_GetAllotmentSummary", param);
		}
		public DataTable GetReportingDetails(Int64 CandidateID, Int64 ApplicationID, string EncryptedApplicationID, Int16 RoundID, string ReportingStatus, string UserLoginID, string Flag)
		{
			var param = new Dictionary<string, object>();

			param.Add("@CandidateID", CandidateID);
			param.Add("@ApplicationID", ApplicationID);
			param.Add("@EncryptedCandidateID", EncryptedApplicationID);
			param.Add("@RoundID", RoundID);
			param.Add("@ReportingStatus", ReportingStatus);
			param.Add("@UserLoginID", UserLoginID);
			param.Add("@Flag", Flag);

			return _dbAccess.GetDataTable("Admission_GetReportingDetails", param);
		}
		public string GetAdmissionDetails(Int64 CandidateID)
		{
			var param = new Dictionary<string, object>();

			param.Add("@CandidateID", CandidateID);

			return _dbAccess.ExecuteScalar("Admission_GetAdmissionDetails", param).ToString();
		}
		public DataSet GetAdmissionSummary(Int64 CandidateID, Int64 ApplicationID, Int64 CourseID, Int64 CollegeID, Int16 RoundID, string UserLoginID, string ReportingStatus, string Flag)
		{
			var param = new Dictionary<string, object>();

			param.Add("@CandidateID", CandidateID);
			param.Add("@ApplicationID", ApplicationID);
			param.Add("@CourseID", CourseID);
			param.Add("@CollegeID", CollegeID);
			param.Add("@RoundID", RoundID);
			param.Add("@UserLoginID", UserLoginID);
			param.Add("@ReportingStatus", ReportingStatus);
			param.Add("@Flag", Flag);

			return _dbAccess.GetDataSet("Admission_GetAdmissionSummary", param);
		}
		public string ConfirmAdmission(Int64 CandidateID, Int64 ApplicationID, Int64 CourseID, Int64 CollegeID, Int16 RoundID, string xmldoc, string AdmissionComments, string ReportedBy, string ReportedByIPAddress, double CourseFee, double CourseFeePay, DateTime StartCourseDate, Int16 UnitNo, Int16 ShiftID, Int64 BatchID)
		{
			var param = new Dictionary<string, object>();

			param.Add("@CandidateID", CandidateID);
			param.Add("@ApplicationID", ApplicationID);
			param.Add("@CourseID", CourseID);
			param.Add("@CollegeID", CollegeID);
			param.Add("@RoundID", RoundID);
			param.Add("@RequiredDocumentsXML", xmldoc);
			param.Add("@AdmissionComments", AdmissionComments);
			param.Add("@ReportedBy", ReportedBy);
			param.Add("@ReportedByIPAddress", ReportedByIPAddress);
			param.Add("@CourseFee", CourseFee);
			param.Add("@PaidCourseFee", CourseFeePay);
			param.Add("@CourseStartDate", StartCourseDate);
			param.Add("@UnitNo", UnitNo);
			param.Add("@ShiftID", ShiftID);
			param.Add("@BatchID", BatchID);

			return _dbAccess.ExecuteScalar("Admission_ConfirmAdmission", param).ToString();
		}
		public string ConfirmAdmissionFCFS(Int64 CandidateID, Int64 ChoiceCode, Int16 RoundID, List<RequiredDocumentEntity> ListRequiredDocuments, string AdmissionComments, string ReportedBy, string ReportedByIPAddress)
		{
			var param = new Dictionary<string, object>();

			param.Add("@CandidateID", CandidateID);
			param.Add("@ChoiceCode", ChoiceCode);
			param.Add("@RoundID", RoundID);
			param.Add("@RequiredDocumentsXML", GetXML(ListRequiredDocuments));
			param.Add("@AdmissionComments", AdmissionComments);
			param.Add("@ReportedBy", ReportedBy);
			param.Add("@ReportedByIPAddress", ReportedByIPAddress);

			return _dbAccess.ExecuteScalar("CAP_ConfirmAdmissionFCFS", param).ToString();
		}
		public string RejectAdmission(Int64 CandidateID, Int64 ApplicationID, Int64 CourseID, Int64 CollegeID, Int16 RoundID, string XMLString, string RejectionComments, string RejectedBy, string RejectedByIPAddress, string ReasonForRejection)
		{
			var param = new Dictionary<string, object>();

			param.Add("@CandidateID", CandidateID);
			param.Add("@ApplicationID", ApplicationID);
			param.Add("@CourseID", CourseID);
			param.Add("@CollegeID", CollegeID);
			param.Add("@RoundID", RoundID);
			param.Add("@RequiredDocumentsXML", XMLString);
			param.Add("@RejectionComments", RejectionComments);
			param.Add("@ReasonForRejection", ReasonForRejection);
			param.Add("@ReportedBy", RejectedBy);
			param.Add("@ReportedByIPAddress", RejectedByIPAddress);


			return _dbAccess.ExecuteScalar("Admission_RejectAdmission", param).ToString();
		}
		public string CancelAdmission(Int64 CandidateID, Int64 ApplicationID, Int64 CourseID, Int64 CollegeID, Int16 RoundID, string XMLString, string CancellationComments, double RefundFee, string CancelledBy, string CancelledByIPAddress)
		{
			var param = new Dictionary<string, object>();

			param.Add("@CandidateID", CandidateID);
			param.Add("@ApplicationID", ApplicationID);
			param.Add("@CourseID", CourseID);
			param.Add("@CollegeID", CollegeID);
			param.Add("@RoundID", RoundID);
			param.Add("@RequiredDocumentsXML", XMLString);
			param.Add("@CancellationComments", CancellationComments);
			param.Add("@RefundFee", RefundFee);
			param.Add("@CancelledBy", CancelledBy);
			param.Add("@CancelledByIPAddress", CancelledByIPAddress);

			return _dbAccess.ExecuteScalar("Admission_CancelAdmission", param).ToString();
		}
		public DataTable GetOptionalDocuments(Int64 CandidateID)
		{
			var param = new Dictionary<string, object>();

			param.Add("@CandidateID", CandidateID);

			return _dbAccess.GetDataTable("CAP_GetOptionalDocuments", param);
		}
		public void SaveOptionalDocumentUploadStatus(Int64 CandidateID, int DocumentID, string DocumentUploadedURL, int TrainingRowID, int QualificationRowID, string UserLoginID, string IPAddress, string IsOk, out bool result)
		{
			var param = new Dictionary<string, object>();

			param.Add("@CandidateID", CandidateID);
			param.Add("@DocumentID", DocumentID);
			param.Add("@DocumentUrl", DocumentUploadedURL);
			param.Add("@TrainingRowID", TrainingRowID);
			param.Add("@QualificationRowID", QualificationRowID);
			param.Add("@UserLoginID", UserLoginID);
			param.Add("@IPAddress", IPAddress);
			//param.Add("@IsOk", false);
			_dbAccess.ExecuteNonQuery("Candidate_SaveDocuments", param, "IsOK", out result);
		}
		public DataTable GetMasterCollege(Int16 ZoneID, Int16 AreaID)
		{
			var param = new Dictionary<string, object>();

			param.Add("@ZoneID", ZoneID);
			param.Add("@AreaID", AreaID);

			return _dbAccess.GetDataTable("CAP_GetMasterCollege", param);
		}
		public DataSet GetCutOff(string ChoiceCode, string RoundID)
		{
			var param = new Dictionary<string, object>();

			param.Add("@ChoiceCode", ChoiceCode);
			param.Add("@RoundID", RoundID);

			return _dbAccess.GetDataSet("CAP_GetCutOff", param);
		}
		public DataSet GetReasonForNotAllotted(Int16 RoundID, Int64 CandidateID)
		{
			var param = new Dictionary<string, object>();

			param.Add("@RoundID", RoundID);
			param.Add("@CandidateID", CandidateID);

			return _dbAccess.GetDataSet("CAP_GetReasonForNotAllotted", param);
		}
		public string UndoConsentForAdmission(Int16 RoundID, Int64 CandidateID, Int64 ChoiceCode, string UserLoginID, string IPAddress)
		{
			var param = new Dictionary<string, object>();

			param.Add("@RoundID", RoundID);
			param.Add("@CandidateID", CandidateID);
			param.Add("@ChoiceCode", ChoiceCode);
			param.Add("@UserLoginID", UserLoginID);
			param.Add("@IPAddress", IPAddress);

			return _dbAccess.ExecuteScalar("CAP_UndoConsentForAdmission", param).ToString();
		}
		public DataTable GetVacancy(Int64 CourseID, Int64 CollegeID, Int16 UnitNo, Int16 Shift)
		{
			var param = new Dictionary<string, object>();

			param.Add("@CourseID", CourseID);
			param.Add("@CollegeID", CollegeID);
			param.Add("@UnitNo", UnitNo);
			param.Add("@Shift", Shift);

			return _dbAccess.GetDataTable("Admission_GetCollegeCourseVacancy", param);
		}
		public string SendRequestForForcedAdmissionCancellation(Int64 CandidateID, Int64 ChoiceCode, Int16 RoundID, Int16 QuotaID, string ReasonForCancellation, string CancellationRequestedBy, string CancellationRequestedByIPAddress)
		{
			var param = new Dictionary<string, object>();

			param.Add("@CandidateID", CandidateID);
			param.Add("@ChoiceCode", ChoiceCode);
			param.Add("@RoundID", RoundID);
			param.Add("@QuotaID", QuotaID);
			param.Add("@ReasonForCancellation", ReasonForCancellation);
			param.Add("@CancellationRequestedBy", CancellationRequestedBy);
			param.Add("@CancellationRequestedByIPAddress", CancellationRequestedByIPAddress);

			return _dbAccess.ExecuteScalar("CAP_SendRequestForForcedAdmissionCancellation", param).ToString();
		}
		public DataTable GetRequestedForForcedAdmissionCancellationList()
		{
			return _dbAccess.GetDataTable("CAP_GetRequestedForForcedAdmissionCancellationList");
		}
		public DataSet GetCutOffPreviousYear(string ChoiceCode, string RoundID)
		{
			var param = new Dictionary<string, object>();

			param.Add("@ChoiceCode", ChoiceCode);
			param.Add("@RoundID", RoundID);

			return _dbAccess.GetDataSet("CAP_GetCutOffPreviousYear", param);
		}
		public bool IsAllotted27211008404(Int64 CandidateID)
		{
			var param = new Dictionary<string, object>();

			param.Add("@CandidateID", CandidateID);

			return Convert.ToBoolean(_dbAccess.ExecuteScalar("CAP_IsAllotted27211008404", param));
		}
		public string SaveConsentFor27211008404(Int64 CandidateID, string SeatAcceptanceStatus, string UserLoginID, string IPAddress)
		{
			var param = new Dictionary<string, object>();

			param.Add("@CandidateID", CandidateID);
			param.Add("@SeatAcceptanceStatus", SeatAcceptanceStatus);
			param.Add("@UserLoginID", UserLoginID);
			param.Add("@IPAddress", IPAddress);

			return _dbAccess.ExecuteScalar("CAP_SaveConsentFor27211008404", param).ToString();
		}

		public DataTable GetReportingDetailsByInstituteID(Int64 InstituteID, string Flag)
		{
			var param = new Dictionary<string, object>();

			param.Add("@InstituteID", @InstituteID);
			param.Add("@Flag", Flag);


			return _dbAccess.GetDataTable("Admission_GetReportingDetailsByInstituteID", param);
		}

		public DataTable GetCollegeCourseUnitMaster(Int64 CourseID, Int64 CollegeID)
		{
			var param = new Dictionary<string, object>();

			param.Add("@CourseID", CourseID);
			param.Add("@CollegeID", CollegeID);

			return _dbAccess.GetDataTable("Admission_GetCollegeCourseUnitMaster", param);
		}
		public DataTable GetCollegeCourseShiftMaster(Int64 CourseID, Int64 CollegeID)
		{
			var param = new Dictionary<string, object>();

			param.Add("@CourseID", CourseID);
			param.Add("@CollegeID", CollegeID);

			return _dbAccess.GetDataTable("Admission_GetCollegeCourseShiftMaster", param);
		}

		public DataTable GetCourseByCollogeID(Int64 CollegeID,Int64 admissionYearID, string flag="A")
		{
			var param = new Dictionary<string, object>();

			param.Add("@CollegeID", CollegeID);
			param.Add("@AdmissionYearID", admissionYearID);
			param.Add("@Flag", flag);

			return _dbAccess.GetDataTable("Admission_GetCourseByCollogeID", param);

		}
		public string GetAdmissionApplicationStatus(Int64 ApplicationID, Int64 CollegeID, Int32 UserTypeID)
		{
			var param = new Dictionary<string, object>();
			param.Add("@ApplicationID", ApplicationID);
			param.Add("@CollegeID", CollegeID);
			param.Add("@UserTypeID", UserTypeID);

			return Convert.ToString(_dbAccess.ExecuteScalar("Admission_GetAdmissionApplicationStatus", param));
		}

		public DataTable GetPendingCandidateSendForDEVTO(Int64 CourseID, Int64 CollegeID, int AdmissionYearID)
		{
			var param = new Dictionary<string, object>();

			param.Add("@CourseID", CourseID);
			param.Add("@CollegeID", CollegeID);
			param.Add("@AdmissionYearID", AdmissionYearID);

			return _dbAccess.GetDataTable("Admission_GetPendingCandidateSendForDEVTO", param);
		}
		public DataTable GetRejectedCandidatebyDEVTO(Int64 CourseID, Int64 CollegeID, int AdmissionYearID)
		{
			var param = new Dictionary<string, object>();

			param.Add("@CourseID", CourseID);
			param.Add("@CollegeID", CollegeID);
			param.Add("@AdmissionYearID", AdmissionYearID);

			return _dbAccess.GetDataTable("Admission_GetRejectedCandidatebyDEVTO", param);
		}
		public string SaveCandidateSendForDEVTOStatus(string UserLoginID, string IPAddress, string xmldoc)
		{
			var param = new Dictionary<string, object>();
			param.Add("@UserLoginID", UserLoginID);
			param.Add("@IPAddress", IPAddress);
			param.Add("@RequiredDocumentsXML", xmldoc);

			return Convert.ToString(_dbAccess.ExecuteScalar("Admission_SaveCandidateSendForDEVTOStatus", param));
		}
		public string SaveCandidateSendForDEVTOStatusRecall(string UserLoginID, string IPAddress, string xmldoc)
		{
			var param = new Dictionary<string, object>();
			param.Add("@UserLoginID", UserLoginID);
			param.Add("@IPAddress", IPAddress);
			param.Add("@RequiredDocumentsXML", xmldoc);

			return Convert.ToString(_dbAccess.ExecuteScalar("Admission_SaveCandidateSendForDEVTOStatusRecall", param));
		}
		public DataTable GetPendingCandidateSendForDEVTOApproval(Int64 CourseID, Int64 CollegeID, int AdmissionYearID, Int32 RegionID, Int32 UserTypeID)
		{
			var param = new Dictionary<string, object>();

			param.Add("@CourseID", CourseID);
			param.Add("@CollegeID", CollegeID);
			param.Add("@AdmissionYearID", AdmissionYearID);
			param.Add("@RegionID", RegionID);
			param.Add("@UserTypeID", UserTypeID);

			return _dbAccess.GetDataTable("Admission_GetPendingCandidateSendForDEVTOApproval", param);
		}
		public string SaveCandidateDEVTOStatus(string UserLoginID, string IPAddress, string xmldoc)
		{
			var param = new Dictionary<string, object>();
			param.Add("@UserLoginID", UserLoginID);
			param.Add("@IPAddress", IPAddress);
			param.Add("@RequiredDocumentsXML", xmldoc);

			return Convert.ToString(_dbAccess.ExecuteScalar("Admission_SaveCandidateDEVTOStatus", param));
		}

		public DataTable GetBatch(Int64 CourseID, Int64 CollegeID)
		{
			var param = new Dictionary<string, object>();

			param.Add("@CourseID", CourseID);
			param.Add("@CollegeID", CollegeID);


			return _dbAccess.GetDataTable("Admission_GetBatch", param);
		}
		public DataTable GetCollegeCourseBatchDetailsByBatchID(Int64 CourseID, Int64 CollegeID, Int64 BatchID)
		{
			var param = new Dictionary<string, object>();

			param.Add("@CourseID", CourseID);
			param.Add("@CollegeID", CollegeID);
			param.Add("@BatchID", BatchID);

			return _dbAccess.GetDataTable("Admission_GetCollegeCourseBatchDetailsByBatchID", param);
		}
		public bool IsAdmissionLastDateOver(Int64 CourseID, Int64 CollegeID)
		{
			var param = new Dictionary<string, object>();
			param.Add("@CourseID", CourseID);
			param.Add("@CollegeID", CollegeID);
			return Convert.ToBoolean(_dbAccess.ExecuteScalar("Admission_IsAdmissionOver", param));
		}
		public string  TransferBatch(string UserLoginID, string IPAddress, string xmldoc)
		{
            var param = new Dictionary<string, object>();
            param.Add("@UserLoginID", UserLoginID);
            param.Add("@IPAddress", IPAddress);
            param.Add("@RequiredDocumentsXML", xmldoc);

            return Convert.ToString(_dbAccess.ExecuteScalar("Admission_TransferBatch", param));
        }

        public string SaveAcadmisthanRegistration(AcadmisthanStudentEntity acadmisthanStudent)
        {
            var param = new Dictionary<string, object>();
            param.Add("@OperationType", "INSERT");
            param.Add("@CandidateID", acadmisthanStudent.CandidateID);
            param.Add("@ApplicationID", acadmisthanStudent.ApplicationID);
            param.Add("@UserID", acadmisthanStudent.ApiResponse.UserId);
            param.Add("@CourseID", acadmisthanStudent.ApiResponse.CourseId);
            param.Add("@LoginURL", acadmisthanStudent.ApiResponse.LoginUrl);
            param.Add("@Enrolled", acadmisthanStudent.ApiResponse.Enrolled);
            param.Add("@CreatedBy", acadmisthanStudent.CandidateID.ToString());
            return Convert.ToString(_dbAccess.ExecuteScalar("AcademisthanCourseMapping_CRUD", param));
        }
        public DataTable GetAcadmisthanRegistration(AcadmisthanStudentEntity acadmisthanStudent)
        {
            var param = new Dictionary<string, object>();
            param.Add("@OperationType", "SELECTBYCANDIDATEID");
            param.Add("@CandidateID", acadmisthanStudent.CandidateID);
            param.Add("@ApplicationID", acadmisthanStudent.ApplicationID);
            return _dbAccess.GetDataTable("AcademisthanCourseMapping_CRUD", param);
        }


        public Int64 AcadmisthanInsertCourseMapping(AcadmisthanStudentEntity entity)
        {
            var param = new Dictionary<string, object>
        {
            {"@CandidateID", entity.CandidateID},
            {"@ApplicationID", entity.ApplicationID},
            {"@UserID", entity.UserID},
            {"@CourseID", entity.CourseID},
            {"@LoginURL", entity.LoginURL},
            {"@Enrolled", Convert.ToInt16(entity.Enrolled)},
            {"@IpAddress", entity.IpAddress},
            {"@CreatedBy", entity.CreatedBy},
            {"@MSBVCourseID", entity.MSBVCourseID},
            {"@Email", entity.Email},
            {"@Firstname", entity.Firstname},
            {"@Lastname", entity.Lastname},
            {"@Username", entity.Username},
            {"@TempPassword", entity.TempPassword},
            {"@UniqueId", entity.UniqueId},
            {"@Institution", entity.Institution},
            {"@Department", entity.Department},
            {"@WantsUrl", entity.WantsUrl},
            {"@Mode", entity.Mode},
            {"@Enrol", entity.Enrol.ToString()}
        };

            // Executes the insert procedure and returns new ID
            DataTable dt = _dbAccess.GetDataTable("sp_AcademisthanCourseMapping_Insert", param);

            if (dt.Rows.Count > 0 && Int64.TryParse(dt.Rows[0]["NewID"].ToString(), out Int64 newId))
                return newId;

            return 0;
        }

        // ✅ UPDATE
        public bool UpdateCourseMapping(AcadmisthanStudentEntity entity)
        {
            var param = new Dictionary<string, object>
        {
            {"@ID", entity.ID},
            {"@CandidateID", entity.CandidateID},
            {"@ApplicationID", entity.ApplicationID},
            {"@UserID", entity.UserID},
            {"@CourseID", entity.CourseID},
            {"@LoginURL", entity.LoginURL},
            {"@Enrolled", entity.Enrolled},
            {"@IpAddress", entity.IpAddress},
            {"@CreatedBy", entity.CreatedBy},
            {"@MSBVCourseID", entity.MSBVCourseID},
            {"@Email", entity.Email},
            {"@Firstname", entity.Firstname},
            {"@Lastname", entity.Lastname},
            {"@Username", entity.Username},
            {"@TempPassword", entity.TempPassword},
            {"@UniqueId", entity.UniqueId},
            {"@Institution", entity.Institution},
            {"@Department", entity.Department},
            {"@WantsUrl", entity.WantsUrl},
            {"@Mode", entity.Mode},
            {"@Enrol", entity.Enrol}
        };

            int rowsAffected = _dbAccess.ExecuteNonQuery("sp_AcademisthanCourseMapping_Update", param);
            return rowsAffected > 0;
        }

        // ✅ GET By CandidateID
        public DataTable GetByCandidateIDCourseMappings(Int64 CandidateID)
        {
            var param = new Dictionary<string, object>
            { {"@CandidateID", CandidateID} };
            return _dbAccess.GetDataTable("sp_AcademisthanCourseMapping_GetByCandidateID", param);
        }


		//BCLS ----
		public string SaveBCLSRegistration(AcadmisthanStudentEntity acadmisthanStudent)
		{
			var param = new Dictionary<string, object>();
			param.Add("@OperationType", "INSERT");
            param.Add("@CandidateID", acadmisthanStudent.CandidateID);
			param.Add("@ApplicationID", acadmisthanStudent.ApplicationID);
			param.Add("@UserID", acadmisthanStudent.UserID);
			param.Add("@CourseID", acadmisthanStudent.CourseID);
			param.Add("@LoginURL", acadmisthanStudent.LoginURL);
			param.Add("@Enrolled", acadmisthanStudent.Enrolled);
			param.Add("@CreatedBy", acadmisthanStudent.CreatedBy);
			return Convert.ToString(_dbAccess.ExecuteScalar("BCLSCourseMapping_CRUD", param));
        }
        public DataTable GetBCLSRegistration(AcadmisthanStudentEntity acadmisthanStudent)
		{
            var param = new Dictionary<string, object>();
            param.Add("@OperationType", "SELECTBYCANDIDATEID");
            param.Add("@CandidateID", acadmisthanStudent.CandidateID);
            param.Add("@ApplicationID", acadmisthanStudent.ApplicationID);
            return _dbAccess.GetDataTable("BCLSCourseMapping_CRUD", param);
        }
        public Int64 BCLSInsertCourseMapping(AcadmisthanStudentEntity entity)
		{
            var param = new Dictionary<string, object>
        {
            {"@CandidateID", entity.CandidateID},
            {"@ApplicationID", entity.ApplicationID},
            {"@UserID", entity.UserID},
            {"@CourseID", entity.CourseID},
            {"@LoginURL", entity.LoginURL},
            {"@Enrolled", Convert.ToInt16(entity.Enrolled)},
            {"@IpAddress", entity.IpAddress},
            {"@CreatedBy", entity.CreatedBy},
            {"@MSBVCourseID", entity.MSBVCourseID},
            {"@Email", entity.Email},
            {"@Firstname", entity.Firstname},
            {"@Lastname", entity.Lastname},
            {"@Username", entity.Username},
            {"@TempPassword", entity.TempPassword},
            {"@UniqueId", entity.UniqueId},
            {"@Institution", entity.Institution},
            {"@Department", entity.Department},
            {"@WantsUrl", entity.WantsUrl},
            {"@Mode", entity.Mode},
            {"@Enrol", entity.Enrol.ToString()}
        };

            // Executes the insert procedure and returns new ID
            DataTable dt = _dbAccess.GetDataTable("sp_BCLSCourseMapping_Insert", param);

            if (dt.Rows.Count > 0 && Int64.TryParse(dt.Rows[0]["NewID"].ToString(), out Int64 newId))
                return newId;

            return 0;
        }
        public bool UpdateBCLSCourseMapping(AcadmisthanStudentEntity entity)
		{
            var param = new Dictionary<string, object>
        {
            {"@ID", entity.ID},
            {"@CandidateID", entity.CandidateID},
            {"@ApplicationID", entity.ApplicationID},
            {"@UserID", entity.UserID},
            {"@CourseID", entity.CourseID},
            {"@LoginURL", entity.LoginURL},
            {"@Enrolled", entity.Enrolled},
            {"@IpAddress", entity.IpAddress},
            {"@CreatedBy", entity.CreatedBy},
            {"@MSBVCourseID", entity.MSBVCourseID},
            {"@Email", entity.Email},
            {"@Firstname", entity.Firstname},
            {"@Lastname", entity.Lastname},
            {"@Username", entity.Username},
            {"@TempPassword", entity.TempPassword},
            {"@UniqueId", entity.UniqueId},
            {"@Institution", entity.Institution},
            {"@Department", entity.Department},
            {"@WantsUrl", entity.WantsUrl},
            {"@Mode", entity.Mode},
            {"@Enrol", entity.Enrol}
        };

            int rowsAffected = _dbAccess.ExecuteNonQuery("sp_BCLSCourseMapping_Update", param);
            return rowsAffected > 0;
        }
        public DataTable GetBCLSByCandidateIDCourseMappings(long candidateID)
		{
            var param = new Dictionary<string, object>
            { {"@CandidateID", candidateID} };
            return _dbAccess.GetDataTable("sp_BCLSCourseMapping_GetByCandidateID", param);
        }

    }
}
