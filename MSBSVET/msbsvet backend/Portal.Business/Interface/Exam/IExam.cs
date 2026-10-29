using Portal.Entities;
using Portal.Entities.Base;
using Portal.Entities.Exam;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
//using System.Runtime.Remoting.Messaging;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Business.Interface.Exam
{
    public interface IExam
    {
        DataSet GetExamCenterMapping(long DistrictID, int ExaminationID);
        DataSet GetEvaluationCenterMapping(long DistrictID, int ExaminationID);
        DataTable GetExamCenterMappingByCollegeID(long InstituteID, int ExaminationID);
        DataTable GetEvaluationCenterMappingByCollegeID(long InstituteID, int ExaminationID);
        DataTable GetCertificateList(long instituteId, long courseId);

        string SaveExamCenters(string xmldoc);
        string SaveEvaluationCenters(string xmldoc);

        DataTable GetBatchesForAssessment(long InstituteID);
        DataSet GetCandidatebyBatchID(long BatchID);
        DataTable GetBatchesForExamFees(long InstituteID);
        DataSet GetCandidateForExamFeesByBatchID(long BatchID);
        DataTable GetBatchesForHallTicket(long InstituteID);
        DataSet GetCandidateForHallTicketByBatchID(long BatchID);
        DataSet GetHallTicket(long ApplicationID, long BatchID);
        DataTable GetBatchesForAttendance(long InstituteID);
        DataSet GetCandidateForAttendanceByBatchID(long BatchID, string SubjectType);
        DataSet GetAttendance(long BatchID);



        DataSet GetAttendanceSubjects(long BatchID);
        DataTable GetBatchesForEvaluationReport(long InstituteID);
        DataSet GetCandidateForEvaluationReportByBatchID(long BatchID, string ExamSubjectType);
        DataSet GetCandidateForEvaluationReportByBatchIDDownload(long BatchID, string ExamSubjectType, string SubjectCode, int ElectiveSubjectID);
        DataSet GetCandidateForEvaluationMArksByBatchID(long BatchID, string ExamSubjectType, string SubjectCode, int ElectiveSubjectID);
        DataSet GetCandidateForEvaluationBlankReportByBatchIDDownload(long BatchID, string ExamSubjectType, string SubjectCode, int ElectiveSubjectID);
        string SaveMarks(ExamMarksEntity entity);
        DataSet GetCandidateForEvaluationMarksReportByBatchIDDownload(long BatchID, string ExamSubjectType, string SubjectCode, int EvalutionSubjectID);
        DataSet GetResultStatus(int UserTypeID, int ExamTypeID, int ExaminationID, int MarksSubmissionStatus, long InstituteID, long EvaluationCenterID, long CourseID, string SubjectCode, int SubjectTypeID, string UserLoginID);
        DataSet GetResultStatusByBatchID(long BatchID);
        DataTable CandidateResultCertificate(long CandidateID);
        DataSet CandidatePrintResultCertificate(long CandidateID, long ApplicationID, int ExaminationID, string IsResultFresh);
        DataTable GetCandidatePrintBulkResultCertificate();
        DataTable GetCandidatePrintBulkSubject(long ApplicationID, int ExaminationID, string IsResultFresh);
        DataTable GetResultBatchWise(int ExaminationID, int ExamTypeID, int UserTypeID, long InstituteID, long CourseID, int DistrictID, string UserLoginID, string IsResultFresh);
        DataSet CandidatePrintResultCertificate(long BranchID, int ExaminationID, string IsResultFresh);
        DataTable BatchPrintResultCertificate(int ExaminationID, long BatchID, string IsResultFresh);
        DataTable GetResultInstituteWise(int ExaminationID, int ExamTypeID, int UserTypeID, long InstituteID, int DistrictID, string UserLoginID, string IsResultFresh);
        DataTable InstitutePrintResultCertificate(int ExaminationID, long InstituteID, string IsResultFresh);
        DataTable InstituteBulkPrintResult(int ExaminationID, long InstituteID, string IsResultFresh, char ResCertificate);
        DataTable InstituteBulkPrintResult21Century(int ExaminationID, long InstituteID, string IsResultFresh, char ResCertificate);
        DataTable InstituteBulkPrintResultLong(int ExaminationID, long InstituteID, string IsResultFresh, char ResCertificate);
        DataTable GetBatchesForElectiveSubjectAssing(long InstituteID);
        DataSet GetCandidateForElectiveAssignByBatchID(long BatchID);
        string SaveElectiveSubjects(string xmldoc, string ReportedBy, string ReportedByIPAddress, long BatchID);
        string MarkCertificatePrinted(
     long certificateId,
     string printedBy,
     string printedIpAddress);
        DataTable PrintResultCertificateBulk(int ExaminationID, string IsResultFresh);
        DataTable GetResultExamWise(int ExaminationID, int ExamTypeID);
        DataSet GetEvaluationCenterMappingAll(int ExamType, long InstituteID, long DistrictID, int ExaminationID);

        List<DropdownEntity> GetEvolutionCenterExamination();
        List<DropdownEntity> GetExamCenterExamination();

        #region
        DataTable GetCandidateResults(long CandidateID);
        DataTable GetCandidateResultsDetails(long ApplicationID, long CourseID, int ExaminationID);
        string SaveResultCorrection(string XMLString, string UserLoginID, string IPAddress);
        DataTable GetCandidateListForApprove();
        DataSet GetCandidateResultsDetailsForApprove(long ApplicationID, int ExaminationID);
        string UpdateCandidateResult(long ApplicationID, int ExaminationID, string UserLoginID, string IPAddress);
        string UpdateCandidateResultReject(long ApplicationID, int ExaminationID, string UserLoginID, string IPAddress, string RejectRemark);
        DataTable GetApprovedResultCandidateList();
        DataTable CandidatePrintResultCertificate(int ExaminationID, long ApplicationID, string IsResultFresh);
        DataTable CandidatePrintResult(int ExaminationID, long ApplicationID, string IsResultFresh, char ResCertificate);
        #endregion
        DataTable AcadmisthanPrintResultCertificate(Int32 ExaminationID, Int64 InstituteID, string IsResultFresh);
        DataSet AcadmisthanCandidatePrintResultCertificate(Int64 CandidateID, Int64 ApplicationID, Int32 ExaminationID, string IsResultFresh);
        DataTable AcadmisthanCandidatePrintResultCertificateByCandidateID(Int64 CandidateID);

        DataTable AcademisthanCertificate_GetForPrinting();

        //BCLS--
        DataTable BCLSPrintResultCertificate(Int32 ExaminationID, Int64 InstituteID, string IsResultFresh);
        DataSet BCLSCandidatePrintResultCertificate(Int64 CandidateID, Int64 ApplicationID, Int32 ExaminationID, string IsResultFresh);
        DataTable BCLSCandidatePrintResultCertificateByCandidateID(Int64 CandidateID);
        DataTable GetBCLSPendingCandidates(Int64 InstituteID);
        string UpdateSingleCandidateResultDate(Int64 CandidateID, Int64 ApplicationID, DateTime CourseCompletionDate, string CreatedBy, string CreatedIpAddress);
        int UpdateMultipleCandidateResultDate(string CandidateIDs, Int64 ApplicationID, DateTime CourseCompletionDate, string CreatedBy, string CreatedIpAddress);
        string MarkCertificateAsPrinted(Int32 ID, Int64 CandidateID, Int64 ApplicationID);

        //elective subjects and backlog subjects APIs
        DataTable GetBatchesForElectiveSubjectAssingForPreviousCandiates(Int64 InstituteID);

        DataSet GetBacklogCandidateForElectiveAssignByBatchID(Int64 BatchID);

        //newly added for the Examination page 
        DataTable GetExaminationDuration();

        DataTable GetExaminationCoursesByDuration(string fullDuration);

        DataTable GetCourseSearchForExamination(string courseCode);

        DataTable GetExaminationSubjectType();

        DataTable GetExaminationByCourseAndSubjectType(string courseCodes, int? subjectTypeId);

        DataTable GetExaminationSubjects(string courseCode, string subjectTypeId = null);

        //DataTable GetExaminationSubjects(int examinationId, string courseCode, string subjectTypeId);

        string SaveExaminationTimeTable(List<ExamTimeTableEntity> entities);
        string  UploadExaminationTimeTable(List<ExamTimeTableUploadEntity> entities, string UserLoginID, string IPAddress);


        DataTable GetSavedExaminationTimeTable(long examinationId, long? examinationYearId, string courseCodes, string subjectCodes);
        DataTable GetExaminationsByYear(int yearId, int examTypeId);

        string SaveSubjectCourseMarks(List<SubjectCourseMarksEntity> entities);

        DataTable GetSubjectMarksByCourseId(int courseId);
        DataSet GetExaminationRemainedToPublishResult(int examTypeID, int examYearID, long examinationID);

        string PublishExamsResult(int examTypeID, int examYearID, long examinationID, string resultDate, string userLoginID, string ipAddress);

        string SaveMasterExamination(MasterExaminationEntity entity);


    }
}
