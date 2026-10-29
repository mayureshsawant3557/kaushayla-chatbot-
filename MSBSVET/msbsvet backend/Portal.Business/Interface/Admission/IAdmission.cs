using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using NPOI.OpenXmlFormats.Wordprocessing;
using Portal.Entities;
using Portal.Entities.Admission;
using Portal.Entities.Base;
using Portal.Entities.Candidate;

namespace Portal.Business.Interface.Admission
{
    public interface IAdmission
    {
        List<DropdownEntity> GetRoundList(int UserTypeID, string Flag, string UserLoginID = "");
        short GetCurrentRoundID();
        DataTable GetMeritStatus(short RoundID, string MeritType, long CandidateID);
        DataTable GetAllotmentStatus(short RoundID, long CandidateID);
        DataTable GetAllotmentStatusApi(short RoundID, long CandidateID);
        string SaveConsentForAdmission(short RoundID, long CandidateID, long ChoiceCode, string UserLoginID, string IPAddress);
        DataTable GetAllotmentSummary(long CandidateID, string EncryptedCandidateID);
        DataTable GetReportingDetails(long CandidateID, long ApplicationID, string EncryptedApplicationID, short RoundID, string ReportingStatus, string UserLoginID, string Flag);
        string GetAdmissionDetails(long CandidateID);
        AdmissionSummaryEntity GetAdmissionSummary(long CandidateID, long ApplicationID, long CourseID, long CollegeID, short RoundID, string UserLoginID, string ReportingStatus, string Flag);
        string ConfirmAdmission(long CandidateID, long ApplicationID, long CourseID, long CollegeID, short RoundID, string xmldoc, string AdmissionComments, string ReportedBy, string ReportedByIPAddress,
            double CourseFee, double CourseFeePay, DateTime StartCourseDate, short UnitNo, short ShiftID, long BatchID);

        string CancelAdmission(long CandidateID, long ApplicationID, long CourseID, long CollegeID, short RoundID, string XMLString, string CancellationComments, double RefundFee, string CancelledBy, string CancelledByIPAddress);

        string RejectAdmission(long CandidateID, long ApplicationID, long CourseID, long CollegeID, short RoundID, string XMLString, string RejectionComments, string RejectedBy, string RejectedByIPAddress, string ReasonForRejection);
        List<RequiredDocumentEntity> GetOptionalDocuments(long CandidateID);
        string SaveOptionalDocumentUploadStatus(long CandidateID, int DocumentID, string DocumentUploadedURL, int TrainingRowID, int QualificationRowID, string UserLoginID, string IPAddress);

        List<DropdownEntity> GetMasterCollege(short ZoneID, short AreaID);
        DataSet GetCutOff(string ChoiceCode, string RoundID);
        DataSet GetReasonForNotAllotted(short RoundID, long CandidateID);
        string UndoConsentForAdmission(short RoundID, long CandidateID, long ChoiceCode, string UserLoginID, string IPAddress);
        DataTable GetVacancy(long CourseID, long CollegeID, short UnitNo, short Shift);

        string SendRequestForForcedAdmissionCancellation(long CandidateID, long ChoiceCode, short RoundID, short QuotaID, string ReasonForCancellation, string CancellationRequestedBy, string CancellationRequestedByIPAddress);
        DataTable GetRequestedForForcedAdmissionCancellationList();
        DataSet GetCutOffPreviousYear(string ChoiceCode, string RoundID);
        DataSet GetAdmissionSummaryForPDF(long CandidateID, long ApplicationID, long CourseID, long CollegeID, short RoundID, string UserLoginID, string ReportingStatus, string Flag);
        bool IsAllotted27211008404(long CandidateID);
        string SaveConsentFor27211008404(long CandidateID, string SeatAcceptanceStatus, string UserLoginID, string IPAddress);
        DataTable GetReportingDetailsByInstituteID(long InstituteID, string Flag);
        List<DropdownEntity> GetCollegeCourseUnitMaster(long CourseID, long CollegeID);
        List<DropdownEntity> GetCollegeCourseShiftMaster(long CourseID, long CollegeID);
        DataTable GetCourseByCollogeID(long collegeID, int admissionYearID, string flag = "A");
        string GetAdmissionApplicationStatus(long ApplicationID, long CollegeID, int userTypeID);
        DataTable GetPendingCandidateSendForDEVTO(long CourseID, long CollegeID, int AdmissionYearID);
        string SaveCandidateSendForDEVTOStatus(string xmldoc, string UserLoginID, string IPAddress);
        string SaveCandidateSendForDEVTOStatusRecall(string UserLoginID, string IPAddress, string xmldoc);
        DataTable GetPendingCandidateSendForDEVTOApproval(long CourseID, long CollegeID, int AdmissionYearID, int RegionID, int UserTypeID);
        string SaveCandidateDEVTOStatus(string UserLoginID, string IPAddress, string xmldoc);
        DataTable GetRejectedCandidatebyDEVTO(long CourseID, long CollegeID, int AdmissionYearID);
        DataTable GetBatch(long CourseID, long CollegeID);
        DataTable GetCollegeCourseBatchDetailsByBatchID(long CourseID, long CollegeID, long BatchID);
        bool IsAdmissionLastDateOver(long CourseID, long CollegeID);
        string TransferBatch(string UserLoginID, string IPAddress, string xmldoc);
        string SaveAcadmisthanRegistration(AcadmisthanStudentEntity acadmisthanStudent);
        DataTable GetAcadmisthanRegistration(AcadmisthanStudentEntity acadmisthanStudent);
        string AcadmisthanInsertCourseMapping(AcadmisthanStudentEntity entity);
        bool UpdateCourseMapping(AcadmisthanStudentEntity entity);
        AcadmisthanStudentEntity GetByCandidateIDCourseMappings(long candidateID);

        //BCLS Interface--
        string SaveBCLSRegistration(AcadmisthanStudentEntity acadmisthanStudent);
        DataTable GetBCLSRegistration(AcadmisthanStudentEntity acadmisthanStudent);
        string BCLSInsertCourseMapping(AcadmisthanStudentEntity acadmisthanStudent);
        bool UpdateBCLSCourseMapping(AcadmisthanStudentEntity acadmisthanStudent);
        AcadmisthanStudentEntity GetBCLSByCandidateIDCourseMappings(long candidateID);
        //BCLSStudentEntity GetBCLSByCandidateIDCourseMappings(long candidateID);

    }
}
