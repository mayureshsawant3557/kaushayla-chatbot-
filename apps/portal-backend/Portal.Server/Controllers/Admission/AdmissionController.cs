using System;
using System.Collections.Generic;
using System.Data;

using Microsoft.AspNetCore.Mvc;
using Portal.Business.Interface.Admission;
using Portal.Entities.Base;
using Portal.Entities.Admission;
using Portal.Entities.Candidate;

namespace Portal.Server.Controllers.Admission
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdmissionController : ControllerBase
    {
        private readonly IAdmission _admissionService;

        public AdmissionController(IAdmission admissionService)
        {
            _admissionService = admissionService ?? throw new ArgumentNullException(nameof(admissionService));
        }

        [HttpGet("rounds")]
        public ActionResult<List<DropdownEntity>> GetRoundList(int userTypeID, string flag, string userLoginID = "")
        {
            try
            {
                var result = _admissionService.GetRoundList(userTypeID, flag, userLoginID);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving round list.", error = ex.Message });
            }
        }

        [HttpGet("current-round")]
        public ActionResult<short> GetCurrentRoundID()
        {
            try
            {
                var result = _admissionService.GetCurrentRoundID();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving current round ID.", error = ex.Message });
            }
        }

        [HttpGet("merit-status")]
        public ActionResult<DataTable> GetMeritStatus(short roundID, string meritType, long candidateID)
        {
            try
            {
                var result = _admissionService.GetMeritStatus(roundID, meritType, candidateID);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving merit status.", error = ex.Message });
            }
        }

        [HttpGet("allotment-status")]
        public ActionResult<DataTable> GetAllotmentStatus(short roundID, long candidateID)
        {
            try
            {
                var result = _admissionService.GetAllotmentStatus(roundID, candidateID);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving allotment status.", error = ex.Message });
            }
        }

        [HttpGet("allotment-status-api")]
        public ActionResult<DataTable> GetAllotmentStatusApi(short roundID, long candidateID)
        {
            try
            {
                var result = _admissionService.GetAllotmentStatusApi(roundID, candidateID);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving allotment status via API.", error = ex.Message });
            }
        }

        [HttpPost("save-consent")]
        public ActionResult<string> SaveConsentForAdmission([FromBody] ConsentRequest request)
        {
            try
            {
                var result = _admissionService.SaveConsentForAdmission(
                    request.RoundID,
                    request.CandidateID,
                    request.ChoiceCode,
                    request.UserLoginID,
                    request.IPAddress
                );
                return Ok(new { message = result });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while saving consent.", error = ex.Message });
            }
        }

        [HttpGet("allotment-summary")]
        public ActionResult<DataTable> GetAllotmentSummary(long candidateID, string encryptedCandidateID)
        {
            try
            {
                var result = _admissionService.GetAllotmentSummary(candidateID, encryptedCandidateID);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving allotment summary.", error = ex.Message });
            }
        }

        [HttpGet("reporting-details")]
        public ActionResult<DataTable> GetReportingDetails(long candidateID, long applicationID, string encryptedApplicationID,
            short roundID, string reportingStatus, string userLoginID, string flag)
        {
            try
            {
                var result = _admissionService.GetReportingDetails(candidateID, applicationID, encryptedApplicationID,
                    roundID, reportingStatus, userLoginID, flag);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving reporting details.", error = ex.Message });
            }
        }

        [HttpGet("admission-summary")]
        public ActionResult<AdmissionSummaryEntity> GetAdmissionSummary(long candidateID, long applicationID, long courseID,
            long collegeID, short roundID, string userLoginID, string reportingStatus, string flag)
        {
            try
            {
                var result = _admissionService.GetAdmissionSummary(candidateID, applicationID, courseID,
                    collegeID, roundID, userLoginID, reportingStatus, flag);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving admission summary.", error = ex.Message });
            }
        }

        [HttpPost("confirm-admission")]
        public ActionResult<string> ConfirmAdmission([FromBody] ConfirmAdmissionRequest request)
        {
            try
            {
                var result = _admissionService.ConfirmAdmission(
                    request.CandidateID,
                    request.ApplicationID,
                    request.CourseID,
                    request.CollegeID,
                    request.RoundID,
                    request.XmlDoc,
                    request.AdmissionComments,
                    request.ReportedBy,
                    request.ReportedByIPAddress,
                    request.CourseFee,
                    request.CourseFeePay,
                    request.StartCourseDate,
                    request.UnitNo,
                    request.ShiftID,
                    request.BatchID
                );
                return Ok(new { message = result });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while confirming admission.", error = ex.Message });
            }
        }

        [HttpPost("reject-admission")]
        public ActionResult<string> RejectAdmission([FromBody] RejectAdmissionRequest request)
        {
            try
            {
                var result = _admissionService.RejectAdmission(
                    request.CandidateID,
                    request.ApplicationID,
                    request.CourseID,
                    request.CollegeID,
                    request.RoundID,
                    request.XMLString,
                    request.RejectionComments,
                    request.RejectedBy,
                    request.RejectedByIPAddress,
                    request.ReasonForRejection
                );
                return Ok(new { message = result });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while rejecting admission.", error = ex.Message });
            }
        }

        [HttpPost("cancel-admission")]
        public ActionResult<string> CancelAdmission([FromBody] CancelAdmissionRequest request)
        {
            try
            {
                var result = _admissionService.CancelAdmission(
                    request.CandidateID,
                    request.ApplicationID,
                    request.CourseID,
                    request.CollegeID,
                    request.RoundID,
                    request.XMLString,
                    request.CancellationComments,
                    request.RefundFee,
                    request.CancelledBy,
                    request.CancelledByIPAddress
                );
                return Ok(new { message = result });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while cancelling admission.", error = ex.Message });
            }
        }

        [HttpGet("admission-details/{candidateID}")]
        public ActionResult<string> GetAdmissionDetails(long candidateID)
        {
            try
            {
                var result = _admissionService.GetAdmissionDetails(candidateID);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving admission details.", error = ex.Message });
            }
        }

        [HttpGet("optional-documents/{candidateID}")]
        public ActionResult<List<RequiredDocumentEntity>> GetOptionalDocuments(long candidateID)
        {
            try
            {
                var result = _admissionService.GetOptionalDocuments(candidateID);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving optional documents.", error = ex.Message });
            }
        }

        [HttpPost("save-optional-document")]
        public ActionResult<string> SaveOptionalDocumentUploadStatus([FromBody] OptionalDocumentRequest request)
        {
            try
            {
                var result = _admissionService.SaveOptionalDocumentUploadStatus(
                    request.CandidateID,
                    request.DocumentID,
                    request.DocumentUploadedURL,
                    request.TrainingRowID,
                    request.QualificationRowID,
                    request.UserLoginID,
                    request.IPAddress
                );
                return Ok(new { message = result });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while saving optional document.", error = ex.Message });
            }
        }

        [HttpGet("master-colleges")]
        public ActionResult<List<DropdownEntity>> GetMasterCollege(short zoneID, short areaID)
        {
            try
            {
                var result = _admissionService.GetMasterCollege(zoneID, areaID);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving master colleges.", error = ex.Message });
            }
        }

        [HttpGet("cut-off")]
        public ActionResult<DataSet> GetCutOff(string choiceCode, string roundID)
        {
            try
            {
                var result = _admissionService.GetCutOff(choiceCode, roundID);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving cut-off data.", error = ex.Message });
            }
        }

        [HttpGet("reason-not-allotted")]
        public ActionResult<DataSet> GetReasonForNotAllotted(short roundID, long candidateID)
        {
            try
            {
                var result = _admissionService.GetReasonForNotAllotted(roundID, candidateID);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving reason for not allotted.", error = ex.Message });
            }
        }

        [HttpPost("undo-consent")]
        public ActionResult<string> UndoConsentForAdmission([FromBody] ConsentRequest request)
        {
            try
            {
                var result = _admissionService.UndoConsentForAdmission(
                    request.RoundID,
                    request.CandidateID,
                    request.ChoiceCode,
                    request.UserLoginID,
                    request.IPAddress
                );
                return Ok(new { message = result });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while undoing consent.", error = ex.Message });
            }
        }

        [HttpGet("vacancy")]
        public ActionResult<DataTable> GetVacancy(long courseID, long collegeID, short unitNo, short shift)
        {
            try
            {
                var result = _admissionService.GetVacancy(courseID, collegeID, unitNo, shift);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving vacancy data.", error = ex.Message });
            }
        }

        [HttpPost("forced-cancellation-request")]
        public ActionResult<string> SendRequestForForcedAdmissionCancellation([FromBody] ForcedCancellationRequest request)
        {
            try
            {
                var result = _admissionService.SendRequestForForcedAdmissionCancellation(
                    request.CandidateID,
                    request.ChoiceCode,
                    request.RoundID,
                    request.QuotaID,
                    request.ReasonForCancellation,
                    request.CancellationRequestedBy,
                    request.CancellationRequestedByIPAddress
                );
                return Ok(new { message = result });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while sending forced cancellation request.", error = ex.Message });
            }
        }

        [HttpGet("forced-cancellation-list")]
        public ActionResult<DataTable> GetRequestedForForcedAdmissionCancellationList()
        {
            try
            {
                var result = _admissionService.GetRequestedForForcedAdmissionCancellationList();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving forced cancellation list.", error = ex.Message });
            }
        }

        [HttpGet("cut-off-previous-year")]
        public ActionResult<DataSet> GetCutOffPreviousYear(string choiceCode, string roundID)
        {
            try
            {
                var result = _admissionService.GetCutOffPreviousYear(choiceCode, roundID);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving previous year cut-off.", error = ex.Message });
            }
        }

        [HttpGet("is-allotted-special/{candidateID}")]
        public ActionResult<bool> IsAllotted27211008404(long candidateID)
        {
            try
            {
                var result = _admissionService.IsAllotted27211008404(candidateID);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while checking special allotment.", error = ex.Message });
            }
        }

        [HttpPost("save-consent-special")]
        public ActionResult<string> SaveConsentFor27211008404([FromBody] SpecialConsentRequest request)
        {
            try
            {
                var result = _admissionService.SaveConsentFor27211008404(
                    request.CandidateID,
                    request.SeatAcceptanceStatus,
                    request.UserLoginID,
                    request.IPAddress
                );
                return Ok(new { message = result });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while saving special consent.", error = ex.Message });
            }
        }

        [HttpGet("admission-summary-pdf")]
        public ActionResult<DataSet> GetAdmissionSummaryForPDF(long candidateID, long applicationID, long courseID,
            long collegeID, short roundID, string userLoginID, string reportingStatus, string flag)
        {
            try
            {
                var result = _admissionService.GetAdmissionSummaryForPDF(candidateID, applicationID, courseID,
                    collegeID, roundID, userLoginID, reportingStatus, flag);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving admission summary for PDF.", error = ex.Message });
            }
        }

        [HttpGet("reporting-details-by-institute")]
        public ActionResult<DataTable> GetReportingDetailsByInstituteID(long instituteID, string flag)
        {
            try
            {
                var result = _admissionService.GetReportingDetailsByInstituteID(instituteID, flag);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving reporting details by institute.", error = ex.Message });
            }
        }

        [HttpGet("college-course-units")]
        public ActionResult<List<DropdownEntity>> GetCollegeCourseUnitMaster(long courseID, long collegeID)
        {
            try
            {
                var result = _admissionService.GetCollegeCourseUnitMaster(courseID, collegeID);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving college course units.", error = ex.Message });
            }
        }

        [HttpGet("college-course-shifts")]
        public ActionResult<List<DropdownEntity>> GetCollegeCourseShiftMaster(long courseID, long collegeID)
        {
            try
            {
                var result = _admissionService.GetCollegeCourseShiftMaster(courseID, collegeID);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving college course shifts.", error = ex.Message });
            }
        }

        [HttpGet("courses-by-college/{collegeID}/{admissionYearID}")]
        public ActionResult<DataTable> GetCourseByCollogeID(long collegeID, int admissionYearID, string flag = "A")
        {
            try
            {
                var result = _admissionService.GetCourseByCollogeID(collegeID, admissionYearID,flag);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "An error occurred while retrieving courses by college.",
                    error = ex.Message
                });
            }
        }

        [HttpGet("admission-application-status")]
        public ActionResult<string> GetAdmissionApplicationStatus(long applicationID, long collegeID, int userTypeID)
        {
            try
            {
                var result = _admissionService.GetAdmissionApplicationStatus(applicationID, collegeID, userTypeID);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving admission application status.", error = ex.Message });
            }
        }

        [HttpGet("pending-candidates-devto")]
        public ActionResult<DataTable> GetPendingCandidateSendForDEVTO(long courseID, long collegeID, int admissionYearID)
        {
            try
            {
                var result = _admissionService.GetPendingCandidateSendForDEVTO(courseID, collegeID, admissionYearID);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving pending candidates for DEVTO.", error = ex.Message });
            }
        }

        [HttpGet("rejected-candidates-devto")]
        public ActionResult<DataTable> GetRejectedCandidatebyDEVTO(long courseID, long collegeID, int admissionYearID)
        {
            try
            {
                var result = _admissionService.GetRejectedCandidatebyDEVTO(courseID, collegeID, admissionYearID);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving rejected candidates by DEVTO.", error = ex.Message });
            }
        }

        [HttpPost("save-candidate-devto-status")]
        public ActionResult<string> SaveCandidateSendForDEVTOStatus([FromBody] DEVTOStatusRequest request)
        {
            try
            {
                var result = _admissionService.SaveCandidateSendForDEVTOStatus(
                    request.XmlDoc,
                    request.UserLoginID,
                    request.IPAddress
                );
                return Ok(new { message = result });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while saving candidate DEVTO status.", error = ex.Message });
            }
        }

        [HttpPost("save-candidate-devto-status-recall")]
        public ActionResult<string> SaveCandidateSendForDEVTOStatusRecall([FromBody] DEVTOStatusRequest request)
        {
            try
            {
                var result = _admissionService.SaveCandidateSendForDEVTOStatusRecall(
                    request.XmlDoc,
                    request.UserLoginID,
                    request.IPAddress
                );
                return Ok(new { message = result });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while saving candidate DEVTO status recall.", error = ex.Message });
            }
        }

        [HttpGet("pending-candidates-devto-approval")]
        public ActionResult<DataTable> GetPendingCandidateSendForDEVTOApproval(long courseID, long collegeID,
            int admissionYearID, int regionID, int userTypeID)
        {
            try
            {
                var result = _admissionService.GetPendingCandidateSendForDEVTOApproval(courseID, collegeID,
                    admissionYearID, regionID, userTypeID);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving pending candidates for DEVTO approval.", error = ex.Message });
            }
        }

        [HttpPost("save-candidate-devto-approval")]
        public ActionResult<string> SaveCandidateDEVTOStatus([FromBody] DEVTOApprovalRequest request)
        {
            try
            {
                var result = _admissionService.SaveCandidateDEVTOStatus(
                    request.UserLoginID,
                    request.IPAddress,
                    request.XmlDoc
                );
                return Ok(new { message = result });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while saving candidate DEVTO approval.", error = ex.Message });
            }
        }

        [HttpGet("batches")]
        public ActionResult<DataTable> GetBatch(long courseID, long collegeID)
        {
            try
            {
                var result = _admissionService.GetBatch(courseID, collegeID);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving batches.", error = ex.Message });
            }
        }

        [HttpGet("batch-details")]
        public ActionResult<DataTable> GetCollegeCourseBatchDetailsByBatchID(long courseID, long collegeID, long batchID)
        {
            try
            {
                var result = _admissionService.GetCollegeCourseBatchDetailsByBatchID(courseID, collegeID, batchID);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving batch details.", error = ex.Message });
            }
        }

        [HttpGet("is-admission-date-over")]
        public ActionResult<bool> IsAdmissionLastDateOver(long courseID, long collegeID)
        {
            try
            {
                var result = _admissionService.IsAdmissionLastDateOver(courseID, collegeID);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while checking admission date.", error = ex.Message });
            }
        }

        [HttpPost("transfer-batch")]
        public ActionResult<string> TransferBatch([FromBody] TransferBatchRequest request)
        {
            try
            {
                var result = _admissionService.TransferBatch(
                    request.UserLoginID,
                    request.IPAddress,
                    request.XmlDoc
                );
                return Ok(new { message = result });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while transferring batch.", error = ex.Message });
            }
        }
    }

    // Request Models
    public class ConsentRequest
    {
        public short RoundID { get; set; }
        public long CandidateID { get; set; }
        public long ChoiceCode { get; set; }
        public string UserLoginID { get; set; }
        public string IPAddress { get; set; }
    }

    public class ConfirmAdmissionRequest
    {
        public long CandidateID { get; set; }
        public long ApplicationID { get; set; }
        public long CourseID { get; set; }
        public long CollegeID { get; set; }
        public short RoundID { get; set; }
        public string XmlDoc { get; set; }
        public string AdmissionComments { get; set; }
        public string ReportedBy { get; set; }
        public string ReportedByIPAddress { get; set; }
        public double CourseFee { get; set; }
        public double CourseFeePay { get; set; }
        public DateTime StartCourseDate { get; set; }
        public short UnitNo { get; set; }
        public short ShiftID { get; set; }
        public long BatchID { get; set; }
    }

    public class RejectAdmissionRequest
    {
        public long CandidateID { get; set; }
        public long ApplicationID { get; set; }
        public long CourseID { get; set; }
        public long CollegeID { get; set; }
        public short RoundID { get; set; }
        public string XMLString { get; set; }
        public string RejectionComments { get; set; }
        public string RejectedBy { get; set; }
        public string RejectedByIPAddress { get; set; }
        public string ReasonForRejection { get; set; }
    }

    public class CancelAdmissionRequest
    {
        public long CandidateID { get; set; }
        public long ApplicationID { get; set; }
        public long CourseID { get; set; }
        public long CollegeID { get; set; }
        public short RoundID { get; set; }
        public string XMLString { get; set; }
        public string CancellationComments { get; set; }
        public double RefundFee { get; set; }
        public string CancelledBy { get; set; }
        public string CancelledByIPAddress { get; set; }
    }

    public class OptionalDocumentRequest
    {
        public long CandidateID { get; set; }
        public int DocumentID { get; set; }
        public string DocumentUploadedURL { get; set; }
        public int TrainingRowID { get; set; }
        public int QualificationRowID { get; set; }
        public string UserLoginID { get; set; }
        public string IPAddress { get; set; }
    }

    public class ForcedCancellationRequest
    {
        public long CandidateID { get; set; }
        public long ChoiceCode { get; set; }
        public short RoundID { get; set; }
        public short QuotaID { get; set; }
        public string ReasonForCancellation { get; set; }
        public string CancellationRequestedBy { get; set; }
        public string CancellationRequestedByIPAddress { get; set; }
    }

    public class SpecialConsentRequest
    {
        public long CandidateID { get; set; }
        public string SeatAcceptanceStatus { get; set; }
        public string UserLoginID { get; set; }
        public string IPAddress { get; set; }
    }

    public class DEVTOStatusRequest
    {
        public string XmlDoc { get; set; }
        public string UserLoginID { get; set; }
        public string IPAddress { get; set; }
    }

    public class DEVTOApprovalRequest
    {
        public string UserLoginID { get; set; }
        public string IPAddress { get; set; }
        public string XmlDoc { get; set; }
    }

    public class TransferBatchRequest
    {
        public string UserLoginID { get; set; }
        public string IPAddress { get; set; }
        public string XmlDoc { get; set; }
    }
}