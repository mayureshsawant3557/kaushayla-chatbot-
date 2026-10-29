using Microsoft.Practices.EnterpriseLibrary.Data;
using Portal.Data.Source;
using Portal.Entities;
using Portal.Entities.Exam;
using System;
using System.Collections.Generic;
using System.Data;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static System.Net.Mime.MediaTypeNames;

namespace Portal.Data
{
    public partial class Repository
    {

        public DataSet GetExamCenterMapping(Int64 DistrictID, Int32 ExaminationID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@DistrictID", DistrictID);
            param.Add("@ExaminationID", ExaminationID);
            return _dbAccess.GetDataSet("Exam_GetExamCenterMapping", param);
        }
        public DataSet GetEvaluationCenterMapping(Int64 DistrictID, Int32 ExaminationID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@DistrictID", DistrictID);
            param.Add("@ExaminationID", ExaminationID);
            return _dbAccess.GetDataSet("Exam_GetEvaluationCenterMapping", param);
        }
        public DataTable GetExamCenterMappingByCollegeID(Int64 InstituteID, Int32 ExaminationID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@CollegeID", InstituteID);
            param.Add("@ExaminationID", ExaminationID);
            return _dbAccess.GetDataTable("Exam_GetExamCenterMappingByCollegeID", param);
        }
        public string SaveExamCenters(string xmldoc)
        {
            var param = new Dictionary<string, object>();
            param.Add("@CenterXML", xmldoc);

            return Convert.ToString(_dbAccess.ExecuteScalar("Exam_SaveExamCenters", param));
        }
        public DataTable GetEvaluationCenterMappingByCollegeID(Int64 InstituteID, Int32 ExaminationID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@CollegeID", InstituteID);
            param.Add("@ExaminationID", ExaminationID);
            return _dbAccess.GetDataTable("Exam_GetEvaluationCenterMappingByCollegeID", param);
        }
        //public DataTable GetCertificateList(long instituteId, long courseId)
        //{
        //    var param = new Dictionary<string, object>();

        //    param.Add("@InstituteId", instituteId);
        //    param.Add("@CourseId", courseId);

        //    return _dbAccess.GetDataTable(
        //        "usp_BCLSCertificate_GetForPrinting",
        //        param);
        //}
        public DataTable GetCertificateList(long instituteId, long courseId)
        {
            var param = new Dictionary<string, object>();

            // Old ASPX had params commented out = no filter = NULL
            // Pass DBNull when 0 so SP behaves same as old ASPX
            param.Add("@InstituteId", instituteId == 0 ? (object)DBNull.Value : instituteId);
            param.Add("@CourseId", courseId == 0 ? (object)DBNull.Value : courseId);

            return _dbAccess.GetDataTable("usp_BCLSCertificate_GetForPrinting", param);
        }

        public string SaveEvaluationCenters(string xmldoc)
        {
            var param = new Dictionary<string, object>();
            param.Add("@CenterXML", xmldoc);

            return Convert.ToString(_dbAccess.ExecuteScalar("Exam_SaveEvaluationCenters", param));
        }
        public DataTable GetBatchesForAssessment(Int64 InstituteID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@InstituteID", InstituteID);

            return _dbAccess.GetDataTable("Exam_GetBatchesForAssessment", param);
        }
        public DataSet GetCandidatebyBatchID(Int64 BatchID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@BatchID", BatchID);

            return _dbAccess.GetDataSet("Exam_GetCandidatebyBatchID", param);
        }
        public DataTable GetBatchesForExamFees(Int64 InstituteID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@InstituteID", InstituteID);

            return _dbAccess.GetDataTable("Exam_GetBatchesForExamFees", param);
        }
        public DataSet GetCandidateForExamFeesByBatchID(Int64 BatchID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@BatchID", BatchID);

            return _dbAccess.GetDataSet("Exam_GetCandidateForExamFeesByBatchID", param);
        }

        public DataTable GetBatchesForHallTicket(Int64 InstituteID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@InstituteID", InstituteID);

            return _dbAccess.GetDataTable("Exam_GetBatchesForHallTicket", param);
        }
        public DataSet GetCandidateForHallTicketByBatchID(Int64 BatchID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@BatchID", BatchID);

            return _dbAccess.GetDataSet("Exam_GetCandidateForHallTicketByBatchID", param);
        }

        public DataSet GetHallTicket(Int64 ApplicationID, Int64 BatchID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@ApplicationID", ApplicationID);
            param.Add("@BatchID", BatchID);

            return _dbAccess.GetDataSet("Exam_GetHallTicket", param);
        }


        public DataTable GetBatchesForAttendance(Int64 InstituteID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@InstituteID", InstituteID);

            return _dbAccess.GetDataTable("Exam_GetBatchesForAttendance", param);
        }

        public DataSet GetCandidateForAttendanceByBatchID(Int64 BatchID, string SubjectType)
        {
            var param = new Dictionary<string, object>();
            param.Add("@BatchID", BatchID);
            //param.Add("@SubjectType", SubjectType);

            return _dbAccess.GetDataSet("Exam_GetCandidateForAttendanceByBatchID", param);
        }

        public DataSet GetAttendance(Int64 BatchID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@BatchID", BatchID);

            return _dbAccess.GetDataSet("Exam_GetAttendance", param);
        }
        public DataSet GetAttendanceSubjects(Int64 BatchID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@BatchID", BatchID);

            return _dbAccess.GetDataSet("Exam_GetAttendanceSubjects", param);
        }
        public DataTable GetBatchesForEvaluationReport(Int64 InstituteID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@InstituteID", InstituteID);

            return _dbAccess.GetDataTable("Exam_GetBatchesForEvaluationReport", param);
        }
        public DataSet GetEvaluationReportForBatch(Int64 BatchID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@BatchID", BatchID);

            return _dbAccess.GetDataSet("Exam_GetAttendance", param);
        }
        public DataSet GetCandidateForEvaluationReportByBatchID(Int64 BatchID, string ExamSubjectType)
        {
            var param = new Dictionary<string, object>();
            param.Add("@BatchID", BatchID);
            param.Add("@ExamSubjectType", ExamSubjectType);
            return _dbAccess.GetDataSet("Exam_GetCandidateForEvaluationReportByBatchID", param);
        }
        public DataSet GetCandidateForEvaluationReportByBatchIDDownload(Int64 BatchID, string ExamSubjectType, string SubjectCode, int ElectiveSubjectID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@BatchID", BatchID);
            param.Add("@ExamSubjectType", ExamSubjectType);
            param.Add("@SubjectCode", SubjectCode);
            param.Add("@ElectiveSubjectID", ElectiveSubjectID);
            return _dbAccess.GetDataSet("Exam_GetCandidateForEvaluationReportByBatchIDDownload", param);
        }
        public DataSet GetCandidateForEvaluationBlankReportByBatchIDDownload(Int64 BatchID, string ExamSubjectType, string SubjectCode, int ElectiveSubjectID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@BatchID", BatchID);
            param.Add("@ExamSubjectType", ExamSubjectType);
            param.Add("@SubjectCode", SubjectCode);
            param.Add("@ElectiveSubjectID", ElectiveSubjectID);
            return _dbAccess.GetDataSet("Exam_GetCandidateForEvaluationBlankReportByBatchIDDownload", param);
        }
        public DataSet GetCandidateForEvaluationMArksByBatchID(Int64 BatchID, string ExamSubjectType, string SubjectCode, int EvalutionSubjectID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@BatchID", BatchID);
            param.Add("@ExamSubjectType", ExamSubjectType);
            param.Add("@SubjectCode", SubjectCode);
            param.Add("@EvalutionSubjectID", EvalutionSubjectID);
            return _dbAccess.GetDataSet("Exam_GetCandidateForEvaluationMArksByBatchID", param);
        }
        public string SaveMarks(ExamMarksEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@BatchID", entity.BatchID);
            param.Add("@CourseID", entity.CourseID);
            param.Add("@ExaminationID", entity.ExaminationID);
            param.Add("@EvlutionCenterID", entity.EvlutionCenterID);
            param.Add("@TraningInstituteID", entity.TraningInstituteID);
            param.Add("@CourseCode", entity.CourseCode);
            param.Add("@SubjectCode", entity.SubjectCode);
            param.Add("@SubjectType", entity.SubjectType);
            param.Add("@EvaluationReportPath", entity.EvaluationReportPath);
            param.Add("@AttendanceReportPath", entity.AttendanceReportPath);
            param.Add("@IsSubmitted", entity.IsSubmitted);
            param.Add("@Marks", entity.Marks);

            param.Add("@TitleInternalExaminer", entity.TitleInternalExaminer);
            param.Add("@FirstNameInternalExaminer", entity.FirstNameInternalExaminer);
            param.Add("@MiddleNameInternalExaminer", entity.MiddleNameInternalExaminer);
            param.Add("@LastNameInternalExaminer", entity.LastNameInternalExaminer);
            param.Add("@MobileNoInternalExaminer", entity.MobileNoInternalExaminer);

            param.Add("@TitleExternalExaminer", entity.TitleExternalExaminer);
            param.Add("@FirstNameExternalExaminer", entity.FirstNameExternalExaminer);
            param.Add("@MiddleNameExternalExaminer", entity.MiddleNameExternalExaminer);
            param.Add("@LastNameExternalExaminer", entity.LastNameExternalExaminer);
            param.Add("@MobileNoExternalExaminer", entity.MobileNoExternalExaminer);

            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);

            return _dbAccess.ExecuteScalar("Exam_SaveMarks", param).ToString();
        }

        public DataSet GetVerificationCertificateRequests(string status)
        {
            var param = new Dictionary<string, object>();
            param.Add("@Status", status);
            param.Add("@PaymentStatus", "completed"); // Only get completed payment records

            return _dbAccess.GetDataSet("VerificationCertificate_GetRequests", param);
        }

        public DataSet CheckIsPreviouslyVerified(string certificateNo, string profileID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@CertificateNo", certificateNo);
            param.Add("@ProfileID", profileID);

            return _dbAccess.GetDataSet("Verification_CheckIsPreviouslyVerified", param);
        }

        public int UpdateCertificateStatus(String profileID, string status, string updatedBy, DateTime? printedOn)
        {
            var param = new Dictionary<string, object>();
            param.Add("@ProfileID", profileID);
            param.Add("@Status", status);
            param.Add("@UpdatedBy", updatedBy);
            if (printedOn.HasValue)
                param.Add("@PrintedOn", printedOn.Value);
            else
                param.Add("@PrintedOn", DBNull.Value);

            return _dbAccess.ExecuteNonQuery("VerificationCertificate_UpdateStatus", param);
        }


        public DataSet GetCandidateForEvaluationMarksReportByBatchIDDownload(Int64 BatchID, string ExamSubjectType, string SubjectCode, int EvalutionSubjectID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@BatchID", BatchID);
            param.Add("@ExamSubjectType", ExamSubjectType);
            param.Add("@SubjectCode", SubjectCode); param.Add("@EvalutionSubjectID", EvalutionSubjectID);
            return _dbAccess.GetDataSet("Exam_GetCandidateForEvaluationMarksReportByBatchIDDownload", param);
        }

        public DataSet GetResultStatus(Int32 UserTypeID, Int32 ExamTypeID, Int32 ExaminationID, Int32 MarksSubmissionStatus, Int64 InstituteID, Int64 EvaluationCenterID, Int64 CourseID, string SubjectCode, Int32 SubjectTypeID, string UserLoginID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@UserTypeID", UserTypeID);
            param.Add("@ExamTypeID", ExamTypeID);
            param.Add("@ExaminationID", ExaminationID);

            param.Add("@MarksSubmissionStatus", MarksSubmissionStatus);
            param.Add("@InstituteID", InstituteID);
            param.Add("@EvaluationCenterID", EvaluationCenterID);
            param.Add("@CourseID", CourseID);
            param.Add("@SubjectCode", SubjectCode);
            param.Add("@SubjectTypeID", SubjectTypeID);
            param.Add("@UserLoginID", UserLoginID);

            return _dbAccess.GetDataSet("Exam_GetResultStatus", param);
        }
        public DataSet GetResultStatusByBatchID(Int64 BatchID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@BatchID", BatchID);
            return _dbAccess.GetDataSet("Exam_GetResultStatusByBatchID", param);
        }
        public DataTable CandidateResultCertificate(Int64 CandidateID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@CandidateID", CandidateID);
            return _dbAccess.GetDataTable("Result_CandidateResultCertificate", param);
        }
        public DataSet CandidatePrintResultCertificate(Int64 CandidateID, Int64 ApplicationID, Int32 ExaminationID, string IsResultFresh)
        {
            var param = new Dictionary<string, object>();
            param.Add("@CandidateID", CandidateID);
            param.Add("@ApplicationID", @ApplicationID);
            param.Add("@ExaminationID", @ExaminationID);
            //param.Add("@IsResultFresh", IsResultFresh);   // added for test 
            return _dbAccess.GetDataSet("Result_CandidatePrintResultCertificate", param);
        }
        public DataTable GetCandidatePrintBulkResultCertificate()
        {
            //var param = new Dictionary<string, object>();
            //param.Add("@CandidateID", CandidateID);
            return _dbAccess.GetDataTable("Result_CandidatePrintBulkResultCertificate");
        }
        public DataTable GetCandidatePrintBulkSubject(Int64 ApplicationID, Int32 ExaminationID, string IsResultFresh)
        {
            var param = new Dictionary<string, object>();
            param.Add("@ApplicationID", ApplicationID);
            param.Add("@ExaminationID", ExaminationID);
            param.Add("@IsResultFresh", IsResultFresh);
            return _dbAccess.GetDataTable("Result_CandidatePrintBulkSubject", param);
        }
        public DataTable GetResultBatchWise(Int32 ExaminationID, Int32 ExamTypeID, Int32 UserTypeID, Int64 InstituteID, Int64 CourseID, Int32 DistrictID, string UserLoginID, string IsResultFresh)
        {
            var param = new Dictionary<string, object>();
            param.Add("@ExaminationID", ExaminationID);
            param.Add("@ExamTypeID", ExamTypeID);
            param.Add("@UserTypeID", UserTypeID);
            param.Add("@InstituteID", InstituteID);
            param.Add("@CourseID", CourseID);
            param.Add("@DistrictID", DistrictID);
            param.Add("@UserLoginID", UserLoginID);
            return _dbAccess.GetDataTable("Result_GetResultBatchWise", param);
        }
        public DataTable BatchPrintResultCertificate(Int32 ExaminationID, Int64 BatchID, string IsResultFresh)
        {
            var param = new Dictionary<string, object>();
            param.Add("@ExaminationID", ExaminationID);
            param.Add("@BatchID", BatchID);
            param.Add("@IsResultFresh", IsResultFresh);
            return _dbAccess.GetDataTable("Result_BatchPrintResultCertificate", param);
        }
        public DataTable GetResultInstituteWise(Int32 ExaminationID, Int32 ExamTypeID, Int32 UserTypeID, Int64 InstituteID, Int32 DistrictID, string UserLoginID, string IsResultFresh)
        {
            var param = new Dictionary<string, object>();
            param.Add("@ExaminationID", ExaminationID);
            param.Add("@ExamTypeID", ExamTypeID);
            param.Add("@UserTypeID", UserTypeID);
            param.Add("@InstituteID", InstituteID);
            param.Add("@DistrictID", DistrictID);
            param.Add("@UserLoginID", UserLoginID);
            return _dbAccess.GetDataTable("Result_GetResultInstituteWise", param);
        }
        public DataTable GetResultExamWise(Int32 ExaminationID, Int32 ExamTypeID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@ExaminationID", ExaminationID);
            param.Add("@ExamTypeID", ExamTypeID);
            return _dbAccess.GetDataTable("Result_GetResultExamWise", param);
        }
        public DataTable InstitutePrintResultCertificate(Int32 ExaminationID, Int64 InstituteID, string IsResultFresh)
        {
            var param = new Dictionary<string, object>();
            param.Add("@ExaminationID", ExaminationID);
            param.Add("@InstituteID", InstituteID);
            param.Add("@IsResultFresh", IsResultFresh);
            return _dbAccess.GetDataTable("Result_InstitutePrintResultCertificate", param);
        }
        public DataTable PrintResultCertificateBulk(Int32 ExaminationID, string IsResultFresh)
        {
            var param = new Dictionary<string, object>();
            param.Add("@ExaminationID", ExaminationID);
            param.Add("@IsResultFresh", IsResultFresh);
            return _dbAccess.GetDataTable("Result_PrintResultCertificateBulk", param);
        }
        public DataTable InstituteBulkPrintResult(Int32 ExaminationID, Int64 InstituteID, string IsResultFresh, char ResCertificate)
        {
            var param = new Dictionary<string, object>();
            param.Add("@ExaminationID", ExaminationID);
            param.Add("@InstituteID", InstituteID);
            param.Add("@IsResultFresh", IsResultFresh);
            param.Add("@ResCertificate", ResCertificate);
            return _dbAccess.GetDataTable("Result_InstituteBulkPrintResult", param);
        }
        public DataTable InstituteBulkPrintResultLong(Int32 ExaminationID, Int64 InstituteID, string IsResultFresh, char ResCertificate)
        {
            var param = new Dictionary<string, object>();
            param.Add("@ExaminationID", ExaminationID);
            param.Add("@InstituteID", InstituteID);
            param.Add("@IsResultFresh", IsResultFresh);
            param.Add("@ResCertificate", ResCertificate);
            return _dbAccess.GetDataTable("Result_InstituteBulkPrintResultLong", param);
        }
        public DataTable InstituteBulkPrintResult21Century(Int32 ExaminationID, Int64 InstituteID, string IsResultFresh, char ResCertificate)
        {
            var param = new Dictionary<string, object>();
            param.Add("@ExaminationID", ExaminationID);
            param.Add("@InstituteID", InstituteID);
            param.Add("@IsResultFresh", IsResultFresh);
            param.Add("@ResCertificate", ResCertificate);
            return _dbAccess.GetDataTable("Result_InstituteBulkPrintResult21Century", param);
        }
        public DataTable GetBatchesForElectiveSubjectAssing(Int64 InstituteID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@InstituteID", InstituteID);
            param.Add("@BatchTypeID", 4);
            return _dbAccess.GetDataTable("Exam_GetBatchesForElectiveSubjectAssing", param);
        }
        public DataSet GetCandidateForElectiveAssignByBatchID(Int64 BatchID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@BatchID", BatchID);

            return _dbAccess.GetDataSet("Exam_GetCandidateForElectiveAssignByBatchID", param);
        }

        public string SaveElectiveSubjects(string xmldoc, string ReportedBy, string ReportedByIPAddress, Int64 BatchID)
        {
            var param = new Dictionary<string, object>();


            param.Add("@ElectiveSubjectXML", xmldoc);
            param.Add("@ReportedBy", ReportedBy);
            param.Add("@ReportedByIPAddress", ReportedByIPAddress);
            param.Add("@BatchID", BatchID);

            return _dbAccess.ExecuteScalar("Exam_SaveElectiveSubjects", param).ToString();
        }
        public string MarkCertificatePrinted(
    long certificateId,
    string printedBy,
    string printedIpAddress)
        {
            var param = new Dictionary<string, object>();

            param.Add("@CertificateId", certificateId);
            param.Add("@PrintedBy", printedBy);
            param.Add("@PrintedIpAddress", printedIpAddress);

            return _dbAccess.ExecuteScalar(
                "Result_MarkCertificatePrinted",
                param).ToString();
        }
        public DataSet GetEvaluationCenterMappingAll(Int32 ExamType, Int64 InstituteID, Int64 DistrictID, Int32 ExaminationID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@DistrictID", DistrictID);
            param.Add("@ExaminationID", ExaminationID);
            param.Add("@ExamType", ExamType);
            param.Add("@InstituteID", InstituteID);
            return _dbAccess.GetDataSet("Exam_GetEvaluationCenterMappingAll", param);
        }
        public DataTable GetEvolutionCenterExamination()
        {

            return _dbAccess.GetDataTable("Exam_GetEvolutionCenterExamination");
        }
        public DataTable GetExamCenterExamination()
        {

            return _dbAccess.GetDataTable("Exam_GetExamCenterExamination");
        }
        #region  Result Correcion
        public DataTable GetCandidateResults(Int64 CandidateID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@CandidateID", CandidateID);
            return _dbAccess.GetDataTable("Exam_GetCandidateResults", param);

        }
        public DataTable GetCandidateResultsDetails(Int64 ApplicationID, Int64 CourseID, Int32 ExaminationID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@ApplicationID", ApplicationID);
            param.Add("@CourseID", CourseID);
            param.Add("@ExaminationID", ExaminationID);
            return _dbAccess.GetDataTable("Exam_GetCandidateResultsDetails", param);
        }
        public string SaveResultCorrection(string XMLString, string UserLoginID, string IPAddress)
        {
            var param = new Dictionary<string, object>();

            param.Add("@XMLString", XMLString);
            param.Add("@UserLoginID", UserLoginID);
            param.Add("@IPAddress", IPAddress);
            return _dbAccess.ExecuteScalar("Exam_SaveResultCorrection", param).ToString();

        }
        public DataTable GetCandidateListForApprove()
        {
            return _dbAccess.GetDataTable("Exam_GetCandidateListForApprove");
        }
        public DataSet GetCandidateResultsDetailsForApprove(Int64 ApplicationID, Int32 ExaminationID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@ApplicationID", ApplicationID);
            param.Add("@ExaminationID", ExaminationID);
            return _dbAccess.GetDataSet("Exam_GetCandidateResultsDetailsForApprove", param);
        }

        public string UpdateCandidateResult(Int64 ApplicationID, Int32 ExaminationID, string UserLoginID, string IPAddress)
        {
            var param = new Dictionary<string, object>();

            param.Add("@ApplicationID", ApplicationID);
            param.Add("@ExaminationID", ExaminationID);
            param.Add("@UserLoginID", UserLoginID);
            param.Add("@IPAddress", IPAddress);
            return _dbAccess.ExecuteScalar("Exam_UpdateCandidateResult", param).ToString();

        }
        public string UpdateCandidateResultReject(Int64 ApplicationID, Int32 ExaminationID, string UserLoginID, string IPAddress, string RejectRemark)
        {
            var param = new Dictionary<string, object>();

            param.Add("@ApplicationID", ApplicationID);
            param.Add("@ExaminationID", ExaminationID);
            param.Add("@UserLoginID", UserLoginID);
            param.Add("@IPAddress", IPAddress);
            param.Add("@RejectRemark", RejectRemark);
            return _dbAccess.ExecuteScalar("Exam_UpdateCandidateResultReject", param).ToString();

        }
        public DataTable GetApprovedResultCandidateList()
        {
            return _dbAccess.GetDataTable("Exam_GetApprovedResultCandidateList");
        }
        public DataTable GetApprovedResultCandidateList(Int32 ExaminationID, Int32 ExamTypeID, Int64 InstituteID, string UserLoginID, Int32 DistrictID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@ExaminationID", ExaminationID);
            param.Add("@ExamTypeID", ExamTypeID);
            param.Add("@InstituteID", InstituteID);
            param.Add("@UserLoginID", UserLoginID);
            param.Add("@DistrictID", DistrictID);
            return _dbAccess.GetDataTable("Exam_GetApprovedResultCandidateListByFilter");
        }

        public DataTable CandidatePrintResultCertificate(Int32 ExaminationID, Int64 ApplicationID, string IsResultFresh)
        {
            var param = new Dictionary<string, object>();
            param.Add("@ExaminationID", ExaminationID);
            param.Add("@ApplicationID", ApplicationID);
            param.Add("@IsResultFresh", IsResultFresh);
            return _dbAccess.GetDataTable("Result_CandidatePrintResultCertificate", param);
        }
        public DataTable CandidatePrintResult(Int32 ExaminationID, Int64 ApplicationID, string IsResultFresh, char ResCertificate)
        {
            var param = new Dictionary<string, object>();
            param.Add("@ExaminationID", ExaminationID);
            param.Add("@ApplicationID", ApplicationID);
            param.Add("@IsResultFresh", IsResultFresh);
            param.Add("@ResCertificate", ResCertificate.ToString()); // char → string fix
            return _dbAccess.GetDataTable("Result_CandidatePrintResult", param);
        }
        #endregion
        public DataTable AcadmisthanPrintResultCertificate(Int32 ExaminationID, Int64 InstituteID, string IsResultFresh)
        {
            var param = new Dictionary<string, object>();
            param.Add("@ExaminationID", ExaminationID);
            param.Add("@InstituteID", InstituteID);
            param.Add("@IsResultFresh", IsResultFresh);
            return _dbAccess.GetDataTable("Result_AcadmisthanPrintResultCertificate", param);
        }
        public DataSet AcadmisthanCandidatePrintResultCertificate(Int64 CandidateID, Int64 ApplicationID, Int32 ExaminationID, string IsResultFresh)
        {
            var param = new Dictionary<string, object>();
            //param.Add("@CandidateID", CandidateID);
            param.Add("@ApplicationID", @ApplicationID);
            param.Add("@ExaminationID", @ExaminationID);
            param.Add("@IsResultFresh", IsResultFresh);
            return _dbAccess.GetDataSet("Result_AcadmisthanCandidatePrintResultCertificate", param);
        }
        public DataTable AcadmisthanCandidatePrintResultCertificateByCandidateID(Int64 CandidateID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@CandidateID", CandidateID);

            return _dbAccess.GetDataTable("Result_AcadmisthanCandidatePrintResultCertificateByCandidateID", param);
        }


        public DataTable AcademisthanCertificate_GetForPrinting()
        {
            return _dbAccess.GetDataTable("usp_AcademisthanCertificate_GetForPrinting");
        }

        public string MarkCertificateAsPrinted(Int32 ID, Int64 CandidateID, Int64 ApplicationID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@ID", ID);
            param.Add("@CandidateID", CandidateID);
            param.Add("@ApplicationID", ApplicationID);
            return _dbAccess.ExecuteScalar("usp_AcademisthanMarkCertificatePrinted", param).ToString();
        }


        //BCLS -------
        //public DataTable BCLSPrintResultCertificate(Int32 ExaminationID, Int64 InstituteID, string IsResultFresh)
        //{
        //    var param = new Dictionary<string, object>();
        //    param.Add("@ExaminationID", ExaminationID);
        //    param.Add("@InstituteID", InstituteID);
        //    param.Add("@IsResultFresh", IsResultFresh);
        //    return _dbAccess.GetDataTable("Result_BCLSPrintResultCertificate", param);
        //}
        public DataTable BCLSPrintResultCertificate(int examinationId, long instituteId, string isResultFresh)
        {
            var param = new Dictionary<string, object>();
            param.Add("@ExaminationID", examinationId);
            param.Add("@IsResultFresh", isResultFresh);   // ← match SP param order exactly
            param.Add("@InstituteID", instituteId);
            return _dbAccess.GetDataTable("Result_BCLSPrintResultCertificate", param);
        }
        public DataSet BCLSCandidatePrintResultCertificate(Int64 CandidateID, Int64 ApplicationID, Int32 ExaminationID, string IsResultFresh)
        {
            var param = new Dictionary<string, object>();
            //param.Add("CandidateID", CandidateID);
            param.Add("@ApplicationID", ApplicationID);
            param.Add("@ExaminationID", @ExaminationID);
            param.Add("@IsResultFresh", IsResultFresh);
            return _dbAccess.GetDataSet("Result_BCLSCandidatePrintResultCertificate", param);
        }
        public DataTable BCLSCandidatePrintResultCertificateByCandidateID(Int64 CandidateID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@CandidateID", CandidateID);
            return _dbAccess.GetDataTable("Result_BCLSCandidatePrintResultCertificateByCandidateID", param);
        }
        public DataTable GetBCLSPendingCandidates(Int64 InstituteID)
        {
            var param = new Dictionary<string, object>();
            //param.Add("CandidateID", CandidateID);
            param.Add("@InstituteID", InstituteID);

            return _dbAccess.GetDataTable("sp_GetBCLSPendingCandidates", param);
        }

        public string UpdateSingleCandidateResultDate(Int64 CandidateID, Int64 ApplicationID, DateTime CourseCompletionDate, string CreatedBy, string CreatedIpAddress)
        {
            var param = new Dictionary<string, object>();
            param.Add("@CandidateId", CandidateID);
            param.Add("@ApplicationId", ApplicationID);
            param.Add("@CourseCompletionDate", CourseCompletionDate);
            param.Add("@CreatedBy", CreatedBy);
            param.Add("@CreatedIpAddress", CreatedIpAddress);
            return _dbAccess.ExecuteScalar("usp_BCLSCertificate_Save", param).ToString();
        }

        public int UpdateMultipleCandidateResultDate(string CandidateIDs, Int64 ApplicationID, DateTime CourseCompletionDate, string CreatedBy, string CreatedIpAddress)
        {
            var param = new Dictionary<string, object>();

            param.Add("@CandidateIds", CandidateIDs);
            param.Add("@ApplicationId", ApplicationID);
            param.Add("@CourseCompletionDate", CourseCompletionDate);
            param.Add("@CreatedBy", CreatedBy);
            param.Add("@CreatedIpAddress", CreatedIpAddress);

            var result = _dbAccess.ExecuteScalar("sp_UpdateBCLSMultipleCandidatesResultDate", param);

            return result != null ? Convert.ToInt32(result) : 0;
        }


        //elective subjects and backlog subjects APIs

        public DataTable GetBatchesForElectiveSubjectAssingForPreviousCandiates(Int64 InstituteID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@InstituteID", InstituteID);
            param.Add("@BatchTypeID", 4);
            return _dbAccess.GetDataTable("Exam_GetBatchesForElectiveSubjectAssingForPreviousCandiates", param);
        }

        public DataSet GetBacklogCandidateForElectiveAssignByBatchID(Int64 BatchID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@BatchID", BatchID);

            return _dbAccess.GetDataSet("Exam_GetBacklogCandidateForElectiveAssignByBatchID", param);
        }

        //newly added for the CMS Examination page
        public DataTable GetExaminationDuration()
        {
            return _dbAccess.GetDataTable("GetExaminationDuration");
        }

        public DataTable GetExaminationCoursesByDuration(string fullDuration)
        {
            // Prepare the parameter dictionary
            var param = new Dictionary<string, object>
                {
                    { "@FullDuration", fullDuration }
                };

            // Call the stored procedure using your internal dictionary-based method
            return _dbAccess.GetDataTable("GetExaminationCoursesByDuration", param);
        }

        public DataTable GetCourseSearchForExamination(string courseCode)
        {
            var param = new Dictionary<string, object>
                {
                    { "@CourseCode", courseCode }
                };

            return _dbAccess.GetDataTable("Exam_GetCourseSearchForExamination", param);
        }
        public DataTable GetExaminationSubjectType()
        {
            return _dbAccess.GetDataTable("Exam_GetExaminationSubjectType");
        }

        public DataTable GetExaminationByCourseAndSubjectType(string courseCodes, int? subjectTypeId)
        {
            var param = new Dictionary<string, object>
                {
                    { "@CourseCodeList", courseCodes }, // Pass the whole string here
                    { "@SubjectTypeID", (object)subjectTypeId ?? DBNull.Value }
                };

            return _dbAccess.GetDataTable("Exam_GetExaminationByCourseAndSubjectType", param);
        }

        public DataTable GetExaminationSubjects(string courseCode, string subjectTypeId = null)
        {
            var param = new Dictionary<string, object>
        {
            { "@CourseCode", courseCode },
            { "@SubjectTypeID", string.IsNullOrWhiteSpace(subjectTypeId) ? (object)DBNull.Value : subjectTypeId }
        };

            return _dbAccess.GetDataTable("Exam_GetExaminationSubjects", param);
        }

        //public DataTable GetExaminationSubjects(int examinationId, string courseCode, string subjectTypeId)
        //{
        //    var param = new Dictionary<string, object>
        //{
        //    { "@ExaminationId", examinationId },
        //    { "@CourseCode", courseCode },
        //    { "@SubjectTypeID", (object)subjectTypeId ?? DBNull.Value }
        //};

        //    return _dbAccess.GetDataTable("Exam_GetExaminationSubjects", param);
        //}
        public string SaveExaminationTimeTable(List<ExamTimeTableEntity> entities)
        {
            string retVal = "";
            try
            {
                foreach (var entity in entities)
                {
                    var param = new Dictionary<string, object>();

                    param.Add("@YearId", entity.YearId);
                    param.Add("@ExamYear", entity.ExamYear);
                    param.Add("@ExaminationID", entity.ExaminationID);
                    param.Add("@ExaminationYearID", entity.ExaminationYearID);
                    param.Add("@ExaminationName", entity.ExaminationName);

                    param.Add("@CourseID", entity.CourseID);
                    param.Add("@CourseCode", entity.CourseCode);
                    param.Add("@CourseName", entity.CourseName);

                    param.Add("@Duration", entity.Duration);
                    param.Add("@DurationUnit", (object)entity.DurationUnit ?? DBNull.Value);

                    param.Add("@SubjectCode", entity.SubjectCode);
                    param.Add("@SubjectName", entity.SubjectName);
                    param.Add("@SubjectType", entity.SubjectType);
                    param.Add("@SubjectTypeID", entity.SubjectTypeID);

                    param.Add("@ExaminationDate", (object)entity.ExaminationDate ?? DBNull.Value);
                    param.Add("@StartTime", (object)entity.StartTime ?? DBNull.Value);
                    param.Add("@EndTime", (object)entity.EndTime ?? DBNull.Value);


                    param.Add("@UserLoginID", entity.UserLoginID);   // ✅ MAKE SURE THIS LINE EXISTS
                    param.Add("@IPAddress", entity.IPAddress);

                    //param.Add("@OldCourseId", (object)entity.OldCourseId ?? DBNull.Value);
                    //param.Add("@OldSubjectCodeId", (object)entity.OldSubjectCodeId ?? DBNull.Value);

                    retVal = _dbAccess.ExecuteScalar("Exam_SaveExaminationTimeTable", param).ToString();

                    if (retVal.ToUpper() == "N") break;
                }
            }
            catch (Exception ex)
            {
                retVal = "Error: " + ex.Message;
            }
            return retVal;
        }

        public DataTable GetSavedExaminationTimeTable(long examinationId, long? examinationYearId, string courseCodes, string subjectCodes)
        {
            var param = new Dictionary<string, object>
            {
                { "@ExaminationID",     examinationId },
                { "@ExaminationYearID", (object)examinationYearId ?? DBNull.Value },  // ✅ NEW
                { "@CourseCodes",       (object)courseCodes  ?? DBNull.Value },
                { "@SubjectCodes",      (object)subjectCodes ?? DBNull.Value }
            };

            return _dbAccess.GetDataTable("Exam_GetSavedExaminationTimeTable", param);
        }

        public DataTable GetExaminationsByYear(int yearId, int examTypeId)
        {
            var param = new Dictionary<string, object>
            {
                { "@YearId", yearId },
                { "@ExamTypeID", examTypeId } // Ensure this matches your SP parameter name
            };

            return _dbAccess.GetDataTable("Exam_GetExaminationsByYear", param);
        }

        public string SaveSubjectCourseMarks(List<SubjectCourseMarksEntity> entities)
        {
            string retVal = "";
            try
            {
                foreach (var entity in entities)
                {
                    var param = new Dictionary<string, object>();

                    param.Add("@SubjectId", entity.SubjectId);
                    param.Add("@CourseId", entity.CourseId);
                    param.Add("@SubjectTypeId", entity.SubjectTypeId);
                    param.Add("@OutOfMarks", entity.OutOfMarks);
                    param.Add("@PassingMarks", entity.PassingMarks);
                    param.Add("@UserLoginID", (object)entity.UserLoginID ?? DBNull.Value);  // ✅ NEW
                    param.Add("@IPAddress", (object)entity.IPAddress ?? DBNull.Value);      // ✅ NEW

                    retVal = _dbAccess.ExecuteScalar("Exam_SaveSubjectCourseMarks", param).ToString();

                    if (!string.Equals(retVal, "Updated", StringComparison.OrdinalIgnoreCase))
                        break;
                }
            }
            catch (Exception ex)
            {
                retVal = "Error: " + ex.Message;
            }
            return retVal;
        }

        public DataTable GetSubjectMarksByCourseId(int courseId)
        {
            var param = new Dictionary<string, object>
            {
                { "@CourseId", courseId }
            };

            return _dbAccess.GetDataTable("Exam_GetSubjectMarksByCourseId", param);
        }

        public string UploadExaminationTimeTable(List<ExamTimeTableUploadEntity> entities, string userLoginID, string ipAddress)
        {
            string retVal = "";
            try
            {
                var tvp = new DataTable();
                tvp.Columns.Add("RowNumber", typeof(int));
                tvp.Columns.Add("ExamYear", typeof(string));
                tvp.Columns.Add("ExaminationID", typeof(long));
                tvp.Columns.Add("ExaminationName", typeof(string));
                tvp.Columns.Add("CourseCode", typeof(string));
                tvp.Columns.Add("CourseName", typeof(string));
                tvp.Columns.Add("SubjectName", typeof(string));
                tvp.Columns.Add("SubjectCode", typeof(string));
                tvp.Columns.Add("SubjectType", typeof(string));
                tvp.Columns.Add("SubjectTypeID", typeof(int));
                tvp.Columns.Add("ExaminationDate", typeof(DateTime));
                tvp.Columns.Add("StartTime", typeof(TimeSpan));
                tvp.Columns.Add("EndTime", typeof(TimeSpan));
                // ✅ 13 columns declared above - the Rows.Add below must pass
                // EXACTLY 13 values, in this exact order, since DataTable-based
                // TVPs are matched by ORDINAL POSITION against dbo.ExamTimeTableUploadType,
                // not by column name.

                foreach (var e in entities)
                {
                    tvp.Rows.Add(
                        e.RowNumber,
                        (object)e.ExamYear ?? DBNull.Value,
                        (object)e.ExaminationID ?? DBNull.Value,
                        (object)e.ExaminationName ?? DBNull.Value,
                        (object)e.CourseCode ?? DBNull.Value,
                        (object)e.CourseName ?? DBNull.Value,
                        (object)e.SubjectName ?? DBNull.Value,
                        (object)e.SubjectCode ?? DBNull.Value,
                        (object)e.SubjectType ?? DBNull.Value,
                        (object)e.SubjectTypeID ?? DBNull.Value,
                        DateTime.TryParseExact(e.ExaminationDate, new[] { "M/d/yy", "M/d/yyyy", "yyyy-MM-dd" },
                            CultureInfo.InvariantCulture, DateTimeStyles.None, out var dt) ? (object)dt : DBNull.Value,
                        // ✅ CHANGED: was TimeSpan.TryParse(e.StartTime, out var st) — that
                        // silently fails on "10:00:00 AM" because TimeSpan has no concept
                        // of AM/PM. Parse as a DateTime with an explicit 12-hour format
                        // instead, then take just the time-of-day part.
                        ParseTimeOfDay(e.StartTime),
                        ParseTimeOfDay(e.EndTime)
                    );
                }

                var param = new Dictionary<string, object>();
                param.Add("@Rows", tvp);   // ⚠️ see note below - confirm _dbAccess actually supports this
                param.Add("@UserLoginID", (object)userLoginID ?? DBNull.Value);
                param.Add("@IPAddress", (object)ipAddress ?? DBNull.Value);

                // ✅ Now safe to use ExecuteScalar: uploadTimetable.sql was updated
                // to always return exactly ONE row / ONE column ('Result') in every
                // branch - success ('Y'), validation failure (flattened multi-row
                // error string via STRING_AGG), and the CATCH block (the SQL error
                // message) - so there's no longer a second result set for
                // ExecuteScalar to miss.
                retVal = _dbAccess.ExecuteScalar("uploadTimetable", param).ToString();
            }
            catch (Exception ex)
            {
                retVal = "Error: " + ex.Message;
            }
            return retVal;
        }
        private static object ParseTimeOfDay(string value)
        {
            if (string.IsNullOrWhiteSpace(value))
                return DBNull.Value;

            // Covers "10:00:00 AM", "1:00 PM", "13:00:00", "13:00"
            string[] formats = { "h:mm:ss tt", "h:mm tt", "HH:mm:ss", "HH:mm" };

            return DateTime.TryParseExact(value.Trim(), formats,
                    CultureInfo.InvariantCulture, DateTimeStyles.None, out var t)
                ? (object)t.TimeOfDay
                : DBNull.Value;
        }
        public DataSet GetExaminationRemainedToPublishResult(Int32 examTypeID, Int32 examYearID, Int64 examinationID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@ExamTypeID", examTypeID);
            param.Add("@ExamYearID", examYearID);
            param.Add("@ExaminationID", examinationID);
            return _dbAccess.GetDataSet("Exam_GetExaminationRemainedToPublishResult", param);
        }

        public string PublishExamsResult(Int32 examTypeID, Int32 examYearID, Int64 examinationID, string resultDate, string userLoginID, string ipAddress)
        {
            var param = new Dictionary<string, object>();

            param.Add("@ExamTypeID", examTypeID);
            param.Add("@ExamYearID", examYearID);
            param.Add("@ExaminationID", examinationID);
            param.Add("@ResultDate", resultDate);
            param.Add("@UserLoginID", userLoginID);
            param.Add("@IPAddress", ipAddress);

            return _dbAccess.ExecuteScalar("Exam_PublishExamsResult", param).ToString();
        }


        public string SaveMasterExamination(MasterExaminationEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@ExaminationName", entity.ExaminationName);
            param.Add("@ExaminatioYearID", entity.ExaminatioYearID);
            param.Add("@HallTicketDate", entity.HallTicketDate);
            param.Add("@ResultExaminationName", entity.ResultExaminationName);
            param.Add("@ExamTypeID", entity.ExamTypeID);
            param.Add("@IsRepeater", entity.IsRepeater);
            param.Add("@ModifiedBy", entity.ModifiedBy);
            param.Add("@ModifiedByIPAddress", entity.ModifiedByIPAddress);
            param.Add("@ID", entity.ID);
            param.Add("@IsUpdate", entity.IsUpdate);

            return _dbAccess.ExecuteScalar("InsertMasterExamination",param ).ToString();
        }
    }



}
