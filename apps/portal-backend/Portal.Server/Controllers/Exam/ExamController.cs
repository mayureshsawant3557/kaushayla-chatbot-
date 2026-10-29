using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authorization;
//using Microsoft.AspNetCore.Mvc;
//using Portal.Business.Interface.Exam;
//using Portal.Entities.Exam;
//using System;
//using System.Data;
//using Portal.Entities.ResponseBody;
//using Portal.Business.Worker.Base;
//using Microsoft.AspNetCore.Authorization;
//namespace Portal.API.Controllers
//{
//    [ApiController]
//    [Route("api/[controller]")]
//    public class ExamController : ControllerBase
//    {
//        private readonly IExam _examWorker;
//        private readonly IVerificationCertificate _verificationWorker;

//        public ExamController(IExam examWorker, IVerificationCertificate verificationWorker)
//        {
//            _examWorker = examWorker ?? throw new ArgumentNullException(nameof(examWorker));
//            _verificationWorker = verificationWorker ?? throw new ArgumentNullException(nameof(verificationWorker));


//        }


//        #region Exam Center Mapping

//        [HttpGet("exam-center-mapping")]
//        public IActionResult GetExamCenterMapping(long districtId, int examinationId)
//        {
//            try
//            {
//                if (districtId <= 0 || examinationId <= 0)
//                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid district ID or examination ID.", 400));

//                var result = _examWorker.GetExamCenterMapping(districtId, examinationId);
//                return Ok(ApiResponse<DataSet>.SuccessResponse(result, "Exam center mapping retrieved successfully.", 200));
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
//            }
//        }

//        [HttpGet("exam-center-mapping-by-college")]
//        public IActionResult GetExamCenterMappingByCollegeID(long instituteId, int examinationId)
//        {
//            try
//            {
//                if (instituteId <= 0 || examinationId <= 0)
//                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid institute ID or examination ID.", 400));

//                var result = _examWorker.GetExamCenterMappingByCollegeID(instituteId, examinationId);
//                var serializableData = BaseWorker.ConvertDataTableToList(result);
//                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Exam center mapping by college retrieved successfully.", 200));
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
//            }
//        }

//        [HttpPost("save-exam-centers")]
//        public IActionResult SaveExamCenters([FromBody] string xmldoc)
//        {
//            try
//            {
//                if (string.IsNullOrWhiteSpace(xmldoc))
//                    return BadRequest(ApiResponse<string>.ErrorResponse("XML document cannot be empty.", 400));

//                var result = _examWorker.SaveExamCenters(xmldoc);
//                return Ok(ApiResponse<string>.SuccessResponse(result, "Exam centers saved successfully.", 201));
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
//            }
//        }

//        #endregion

//        #region Evaluation Center Mapping

//        [HttpGet("evaluation-center-mapping")]
//        public IActionResult GetEvaluationCenterMapping(long districtId, int examinationId)
//        {
//            try
//            {
//                if (districtId <= 0 || examinationId <= 0)
//                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid district ID or examination ID.", 400));

//                var result = _examWorker.GetEvaluationCenterMapping(districtId, examinationId);
//                return Ok(ApiResponse<DataSet>.SuccessResponse(result, "Evaluation center mapping retrieved successfully.", 200));
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
//            }
//        }

//        [HttpGet("evaluation-center-mapping-by-college")]
//        public IActionResult GetEvaluationCenterMappingByCollegeID(long instituteId, int examinationId)
//        {
//            try
//            {
//                if (instituteId <= 0 || examinationId <= 0)
//                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid institute ID or examination ID.", 400));

//                var result = _examWorker.GetEvaluationCenterMappingByCollegeID(instituteId, examinationId);
//                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Evaluation center mapping by college retrieved successfully.", 200));
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
//            }
//        }

//        [HttpPost("save-evaluation-centers")]
//        public IActionResult SaveEvaluationCenters([FromBody] string xmldoc)
//        {
//            try
//            {
//                if (string.IsNullOrWhiteSpace(xmldoc))
//                    return BadRequest(ApiResponse<string>.ErrorResponse("XML document cannot be empty.", 400));

//                var result = _examWorker.SaveEvaluationCenters(xmldoc);
//                return Ok(ApiResponse<string>.SuccessResponse(result, "Evaluation centers saved successfully.", 201));
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
//            }
//        }

//        [HttpGet("evaluation-center-mapping-all")]
//        public IActionResult GetEvaluationCenterMappingAll(int examType, long instituteId, long districtId, int examinationId)
//        {
//            try
//            {
//                var result = _examWorker.GetEvaluationCenterMappingAll(examType, instituteId, districtId, examinationId);
//                return Ok(ApiResponse<DataSet>.SuccessResponse(result, "All evaluation center mappings retrieved successfully.", 200));
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
//            }
//        }

//        #endregion

//        #region Assessment and Batches

//        [HttpGet("batches-for-assessment")]
//        public IActionResult GetBatchesForAssessment(long instituteId)
//        {
//            try
//            {
//                if (instituteId <= 0)
//                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid institute ID.", 400));

//                var result = _examWorker.GetBatchesForAssessment(instituteId);
//                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Batches for assessment retrieved successfully.", 200));
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
//            }
//        }

//        [HttpGet("candidate-by-batch")]
//        public IActionResult GetCandidatebyBatchID(long batchId)
//        {
//            try
//            {
//                if (batchId <= 0)
//                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid batch ID.", 400));

//                var result = _examWorker.GetCandidatebyBatchID(batchId);
//                return Ok(ApiResponse<DataSet>.SuccessResponse(result, "Candidates by batch retrieved successfully.", 200));
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
//            }
//        }

//        #endregion

//        #region Exam Fees

//        [HttpGet("batches-for-exam-fees")]
//        public IActionResult GetBatchesForExamFees(long instituteId)
//        {
//            try
//            {
//                if (instituteId <= 0)
//                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid institute ID.", 400));

//                var result = _examWorker.GetBatchesForExamFees(instituteId);
//                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Batches for exam fees retrieved successfully.", 200));
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
//            }
//        }

//        [HttpGet("candidate-for-exam-fees")]
//        public IActionResult GetCandidateForExamFeesByBatchID(long batchId)
//        {
//            try
//            {
//                if (batchId <= 0)
//                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid batch ID.", 400));

//                var result = _examWorker.GetCandidateForExamFeesByBatchID(batchId);
//                return Ok(ApiResponse<DataSet>.SuccessResponse(result, "Candidates for exam fees retrieved successfully.", 200));
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
//            }
//        }

//        #endregion

//        #region Hall Ticket

//        [HttpGet("batches-for-hall-ticket")]
//        public IActionResult GetBatchesForHallTicket(long instituteId)
//        {
//            try
//            {
//                if (instituteId <= 0)
//                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid institute ID.", 400));

//                var result = _examWorker.GetBatchesForHallTicket(instituteId);
//                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Batches for hall ticket retrieved successfully.", 200));
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
//            }
//        }

//        [HttpGet("candidate-for-hall-ticket")]
//        public IActionResult GetCandidateForHallTicketByBatchID(long batchId)
//        {
//            try
//            {
//                if (batchId <= 0)
//                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid batch ID.", 400));

//                var result = _examWorker.GetCandidateForHallTicketByBatchID(batchId);
//                return Ok(ApiResponse<DataSet>.SuccessResponse(result, "Candidates for hall ticket retrieved successfully.", 200));
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
//            }
//        }

//        [HttpGet("hall-ticket")]
//        public IActionResult GetHallTicket(long applicationId, long batchId)
//        {
//            try
//            {
//                if (applicationId <= 0 || batchId <= 0)
//                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid application ID or batch ID.", 400));

//                var result = _examWorker.GetHallTicket(applicationId, batchId);
//                return Ok(ApiResponse<DataSet>.SuccessResponse(result, "Hall ticket retrieved successfully.", 200));
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
//            }
//        }

//        #endregion

//        #region Attendance

//        [HttpGet("batches-for-attendance")]
//        public IActionResult GetBatchesForAttendance(long instituteId)
//        {
//            try
//            {
//                if (instituteId <= 0)
//                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid institute ID.", 400));

//                var result = _examWorker.GetBatchesForAttendance(instituteId);
//                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Batches for attendance retrieved successfully.", 200));
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
//            }
//        }

//        [HttpGet("candidate-for-attendance")]
//        public IActionResult GetCandidateForAttendanceByBatchID(long batchId)
//        {
//            try
//            {
//                if (batchId <= 0)
//                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid batch ID.", 400));

//                var result = _examWorker.GetCandidateForAttendanceByBatchID(batchId);
//                return Ok(ApiResponse<DataSet>.SuccessResponse(result, "Candidates for attendance retrieved successfully.", 200));
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
//            }
//        }

//        [HttpGet("attendance")]
//        public IActionResult GetAttendance(long batchId)
//        {
//            try
//            {
//                if (batchId <= 0)
//                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid batch ID.", 400));

//                var result = _examWorker.GetAttendance(batchId);
//                //var serializableData = BaseWorker.ConvertDataSetToList(result);
//                return Ok(ApiResponse<DataSet>.SuccessResponse(result, "Attendance retrieved successfully.", 200));
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
//            }
//        }

//        [HttpGet("attendance-subjects")]
//        public IActionResult GetAttendanceSubjects(long batchId)
//        {
//            try
//            {
//                if (batchId <= 0)
//                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid batch ID.", 400));

//                var result = _examWorker.GetAttendanceSubjects(batchId);
//                return Ok(ApiResponse<DataSet>.SuccessResponse(result, "Attendance subjects retrieved successfully.", 200));
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
//            }
//        }

//        #endregion

//        #region Evaluation Report

//        [HttpGet("batches-for-evaluation-report")]
//        public IActionResult GetBatchesForEvaluationReport(long instituteId)
//        {
//            try
//            {
//                if (instituteId <= 0)
//                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid institute ID.", 400));

//                var result = _examWorker.GetBatchesForEvaluationReport(instituteId);
//                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Batches for evaluation report retrieved successfully.", 200));
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
//            }
//        }

//        [HttpGet("candidate-for-evaluation-report")]
//        public IActionResult GetCandidateForEvaluationReportByBatchID(long batchId, string examSubjectType)
//        {
//            try
//            {
//                if (batchId <= 0 || string.IsNullOrWhiteSpace(examSubjectType))
//                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid batch ID or exam subject type.", 400));

//                var result = _examWorker.GetCandidateForEvaluationReportByBatchID(batchId, examSubjectType);
//                return Ok(ApiResponse<DataSet>.SuccessResponse(result, "Candidates for evaluation report retrieved successfully.", 200));
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
//            }
//        }

//        [HttpGet("candidate-for-evaluation-report-download")]
//        public IActionResult GetCandidateForEvaluationReportByBatchIDDownload(long batchId, string examSubjectType, string subjectCode, int electiveSubjectId)
//        {
//            try
//            {
//                if (batchId <= 0)
//                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid batch ID.", 400));

//                var result = _examWorker.GetCandidateForEvaluationReportByBatchIDDownload(batchId, examSubjectType, subjectCode, electiveSubjectId);
//                return Ok(ApiResponse<DataSet>.SuccessResponse(result, "Evaluation report download data retrieved successfully.", 200));
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
//            }
//        }

//        [HttpGet("candidate-for-evaluation-marks")]
//        public IActionResult GetCandidateForEvaluationMArksByBatchID(long batchId, string examSubjectType, string subjectCode, int evaluationSubjectId)
//        {
//            try
//            {
//                if (batchId <= 0)
//                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid batch ID.", 400));

//                var result = _examWorker.GetCandidateForEvaluationMArksByBatchID(batchId, examSubjectType, subjectCode, evaluationSubjectId);
//                return Ok(ApiResponse<DataSet>.SuccessResponse(result, "Evaluation marks retrieved successfully.", 200));
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
//            }
//        }

//        [HttpGet("candidate-for-evaluation-blank-report-download")]
//        public IActionResult GetCandidateForEvaluationBlankReportByBatchIDDownload(long batchId, string examSubjectType, string subjectCode, int electiveSubjectId)
//        {
//            try
//            {
//                if (batchId <= 0)
//                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid batch ID.", 400));

//                var result = _examWorker.GetCandidateForEvaluationBlankReportByBatchIDDownload(batchId, examSubjectType, subjectCode, electiveSubjectId);
//                return Ok(ApiResponse<DataSet>.SuccessResponse(result, "Blank evaluation report download data retrieved successfully.", 200));
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
//            }
//        }

//        [HttpGet("candidate-for-evaluation-marks-report-download")]
//        public IActionResult GetCandidateForEvaluationMarksReportByBatchIDDownload(long batchId, string examSubjectType, string subjectCode, int evaluationSubjectId)
//        {
//            try
//            {
//                if (batchId <= 0)
//                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid batch ID.", 400));

//                var result = _examWorker.GetCandidateForEvaluationMarksReportByBatchIDDownload(batchId, examSubjectType, subjectCode, evaluationSubjectId);
//                return Ok(ApiResponse<DataSet>.SuccessResponse(result, "Evaluation marks report download data retrieved successfully.", 200));
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
//            }
//        }

//        [HttpPost("save-marks")]
//        public IActionResult SaveMarks([FromBody] ExamMarksEntity entity)
//        {
//            try
//            {
//                if (entity == null)
//                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid request data.", 400));

//                var result = _examWorker.SaveMarks(entity);
//                return Ok(ApiResponse<string>.SuccessResponse(result, "Marks saved successfully.", 201));
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
//            }
//        }

//        #endregion

//        #region Results

//        [HttpGet("result-status")]
//        public IActionResult GetResultStatus(int userTypeId, int examTypeId, int examinationId, int marksSubmissionStatus,
//            long instituteId, long evaluationCenterId, long courseId, string subjectCode, int subjectTypeId, string userLoginId)
//        {
//            try
//            {
//                var result = _examWorker.GetResultStatus(userTypeId, examTypeId, examinationId, marksSubmissionStatus,
//                    instituteId, evaluationCenterId, courseId, subjectCode, subjectTypeId, userLoginId);
//                return Ok(ApiResponse<DataSet>.SuccessResponse(result, "Result status retrieved successfully.", 200));
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
//            }
//        }

//        [HttpGet("result-status-by-batch")]
//        public IActionResult GetResultStatusByBatchID(long batchId)
//        {
//            try
//            {
//                if (batchId <= 0)
//                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid batch ID.", 400));

//                var result = _examWorker.GetResultStatusByBatchID(batchId);
//                return Ok(ApiResponse<DataSet>.SuccessResponse(result, "Result status by batch retrieved successfully.", 200));
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
//            }
//        }

//        [HttpGet("candidate-result-certificate")]
//        public IActionResult CandidateResultCertificate(long candidateId)
//        {
//            try
//            {
//                if (candidateId <= 0)
//                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid candidate ID.", 400));

//                var result = _examWorker.CandidateResultCertificate(candidateId);
//                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Candidate result certificate retrieved successfully.", 200));
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
//            }
//        }

//        [HttpGet("candidate-print-result-certificate")]
//        public IActionResult CandidatePrintResultCertificate(long candidateId, long applicationId, int examinationId, string isResultFresh)
//        {
//            try
//            {
//                if (candidateId <= 0 || applicationId <= 0 || examinationId <= 0)
//                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid parameters.", 400));

//                var result = _examWorker.CandidatePrintResultCertificate(candidateId, applicationId, examinationId, isResultFresh);
//                return Ok(ApiResponse<DataSet>.SuccessResponse(result, "Print result certificate retrieved successfully.", 200));
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
//            }
//        }

//        #endregion

//        #region Elective Subjects

//        [HttpGet("batches-for-elective-subject-assign")]
//        public IActionResult GetBatchesForElectiveSubjectAssing(long instituteId)
//        {
//            try
//            {
//                if (instituteId <= 0)
//                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid institute ID.", 400));

//                var result = _examWorker.GetBatchesForElectiveSubjectAssing(instituteId);
//                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Batches for elective subject assignment retrieved successfully.", 200));
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
//            }
//        }

//        [HttpGet("candidate-for-elective-assign")]
//        public IActionResult GetCandidateForElectiveAssignByBatchID(long batchId)
//        {
//            try
//            {
//                if (batchId <= 0)
//                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid batch ID.", 400));

//                var result = _examWorker.GetCandidateForElectiveAssignByBatchID(batchId);
//                return Ok(ApiResponse<DataSet>.SuccessResponse(result, "Candidates for elective assignment retrieved successfully.", 200));
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
//            }
//        }

//        [HttpPost("save-elective-subjects")]
//        public IActionResult SaveElectiveSubjects([FromBody] SaveElectiveSubjectsRequest request)
//        {
//            try
//            {
//                if (request == null || string.IsNullOrWhiteSpace(request.XmlDoc))
//                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid request data.", 400));

//                var result = _examWorker.SaveElectiveSubjects(request.XmlDoc, request.ReportedBy, request.ReportedByIPAddress, request.BatchId);
//                return Ok(ApiResponse<string>.SuccessResponse(result, "Elective subjects saved successfully.", 201));
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
//            }
//        }

//        #endregion

//        #region Dropdown Data

//        [HttpGet("evolution-center-examination")]
//        public IActionResult GetEvolutionCenterExamination()
//        {
//            try
//            {
//                var result = _examWorker.GetEvolutionCenterExamination();
//                return Ok(ApiResponse<object>.SuccessResponse(result, "Evolution center examination data retrieved successfully.", 200));
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
//            }
//        }

//        [HttpGet("exam-center-examination")]
//        public IActionResult GetExamCenterExamination()
//        {
//            try
//            {
//                var result = _examWorker.GetExamCenterExamination();
//                return Ok(ApiResponse<object>.SuccessResponse(result, "Exam center examination data retrieved successfully.", 200));
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
//            }
//        }

//        #endregion

//        #region Result Correction

//        [HttpGet("candidate-results")]
//        public IActionResult GetCandidateResults(long candidateId)
//        {
//            try
//            {
//                if (candidateId <= 0)
//                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid candidate ID.", 400));

//                var result = _examWorker.GetCandidateResults(candidateId);

//                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Candidate results retrieved successfully.", 200));
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
//            }
//        }

//        [HttpGet("candidate-results-details")]
//        public IActionResult GetCandidateResultsDetails(long applicationId, long courseId, int examinationId)
//        {
//            try
//            {
//                if (applicationId <= 0 || courseId <= 0 || examinationId <= 0)
//                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid parameters.", 400));

//                var result = _examWorker.GetCandidateResultsDetails(applicationId, courseId, examinationId);
//                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Candidate results details retrieved successfully.", 200));
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
//            }
//        }

//        [HttpGet("candidate-results-details-for-approve")]
//        public IActionResult GetCandidateResultsDetailsForApprove(long applicationId, int examinationId)
//        {
//            try
//            {
//                if (applicationId <= 0 || examinationId <= 0)
//                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid parameters.", 400));

//                var result = _examWorker.GetCandidateResultsDetailsForApprove(applicationId, examinationId);
//                return Ok(ApiResponse<DataSet>.SuccessResponse(result, "Candidate results details for approval retrieved successfully.", 200));
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
//            }
//        }

//        [HttpPost("save-result-correction")]
//        public IActionResult SaveResultCorrection([FromBody] SaveResultCorrectionRequest request)
//        {
//            try
//            {
//                if (request == null || string.IsNullOrWhiteSpace(request.XMLString))
//                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid request data.", 400));

//                var result = _examWorker.SaveResultCorrection(request.XMLString, request.UserLoginID, request.IPAddress);
//                return Ok(ApiResponse<string>.SuccessResponse(result, "Result correction saved successfully.", 201));
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
//            }
//        }

//        [HttpGet("candidate-list-for-approve")]
//        public IActionResult GetCandidateListForApprove()
//        {
//            try
//            {
//                var result = _examWorker.GetCandidateListForApprove();
//                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Candidate list for approval retrieved successfully.", 200));
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
//            }
//        }

//        [HttpPut("update-candidate-result")]
//        public IActionResult UpdateCandidateResult([FromBody] UpdateCandidateResultRequest request)
//        {
//            try
//            {
//                if (request == null || request.ApplicationID <= 0 || request.ExaminationID <= 0)
//                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid request data.", 400));

//                var result = _examWorker.UpdateCandidateResult(request.ApplicationID, request.ExaminationID, request.UserLoginID, request.IPAddress);
//                return Ok(ApiResponse<string>.SuccessResponse(result, "Candidate result updated successfully.", 200));
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
//            }
//        }

//        [HttpPut("update-candidate-result-reject")]
//        public IActionResult UpdateCandidateResultReject([FromBody] UpdateCandidateResultRejectRequest request)
//        {
//            try
//            {
//                if (request == null || request.ApplicationID <= 0 || request.ExaminationID <= 0)
//                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid request data.", 400));

//                var result = _examWorker.UpdateCandidateResultReject(request.ApplicationID, request.ExaminationID, request.UserLoginID, request.IPAddress, request.RejectRemark);
//                return Ok(ApiResponse<string>.SuccessResponse(result, "Candidate result rejected successfully.", 200));
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
//            }
//        }

//        [HttpGet("approved-result-candidate-list")]
//        public IActionResult GetApprovedResultCandidateList()
//        {
//            try
//            {
//                var result = _examWorker.GetApprovedResultCandidateList();
//                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Approved result candidate list retrieved successfully.", 200));
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
//            }
//        }

//        [HttpGet("candidate-print-result")]
//        public IActionResult CandidatePrintResult(int examinationId, long applicationId, string isResultFresh, char resCertificate)
//        {
//            try
//            {
//                if (examinationId <= 0 || applicationId <= 0)
//                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid parameters.", 400));

//                var result = _examWorker.CandidatePrintResult(examinationId, applicationId, isResultFresh, resCertificate);
//                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Candidate print result retrieved successfully.", 200));
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
//            }
//        }

//        #endregion

//        #region Additional Result Methods

//        [HttpGet("candidate-print-bulk-result-certificate")]
//        public IActionResult GetCandidatePrintBulkResultCertificate()
//        {
//            try
//            {
//                var result = _examWorker.GetCandidatePrintBulkResultCertificate();
//                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Bulk result certificate data retrieved successfully.", 200));
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
//            }
//        }

//        [HttpGet("candidate-print-bulk-subject")]
//        public IActionResult GetCandidatePrintBulkSubject(long applicationId, int examinationId, string isResultFresh)
//        {
//            try
//            {
//                if (applicationId <= 0 || examinationId <= 0)
//                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid parameters.", 400));

//                var result = _examWorker.GetCandidatePrintBulkSubject(applicationId, examinationId, isResultFresh);
//                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Bulk subject data retrieved successfully.", 200));
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
//            }
//        }

//        [HttpGet("result-batch-wise")]
//        public IActionResult GetResultBatchWise(int examinationId, int examTypeId, int userTypeId, long instituteId, long courseId, int districtId, string userLoginId, string isResultFresh)
//        {
//            try
//            {
//                var result = _examWorker.GetResultBatchWise(examinationId, examTypeId, userTypeId, instituteId, courseId, districtId, userLoginId, isResultFresh);
//                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Result batch wise data retrieved successfully.", 200));
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
//            }
//        }

//        [HttpGet("batch-print-result-certificate")]
//        public IActionResult BatchPrintResultCertificate(int examinationId, long batchId, string isResultFresh)
//        {
//            try
//            {
//                if (examinationId <= 0 || batchId <= 0)
//                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid parameters.", 400));

//                var result = _examWorker.BatchPrintResultCertificate(examinationId, batchId, isResultFresh);
//                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Batch print result certificate retrieved successfully.", 200));
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
//            }
//        }

//        [HttpGet("result-institute-wise")]
//        public IActionResult GetResultInstituteWise(int examinationId, int examTypeId, int userTypeId, long instituteId, int districtId, string userLoginId, string isResultFresh)
//        {
//            try
//            {
//                var result = _examWorker.GetResultInstituteWise(examinationId, examTypeId, userTypeId, instituteId, districtId, userLoginId, isResultFresh);
//                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Result institute wise data retrieved successfully.", 200));
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
//            }
//        }

//        [HttpGet("result-exam-wise")]
//        public IActionResult GetResultExamWise(int examinationId, int examTypeId)
//        {
//            try
//            {
//                if (examinationId <= 0 || examTypeId <= 0)
//                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid parameters.", 400));

//                var result = _examWorker.GetResultExamWise(examinationId, examTypeId);
//                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Result exam wise data retrieved successfully.", 200));
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
//            }
//        }

//        [AllowAnonymous]
//        [HttpGet("institute-print-result-certificate")]
//        public IActionResult InstitutePrintResultCertificate(int examinationId, long instituteId, string isResultFresh)
//        {
//            try
//            {
//                if (examinationId <= 0 || instituteId <= 0)
//                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid parameters.", 400));

//                var result = _examWorker.InstitutePrintResultCertificate(examinationId, instituteId, isResultFresh);
//                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Institute print result certificate retrieved successfully.", 200));
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
//            }
//        }

//        [HttpGet("print-result-certificate-bulk")]
//        public IActionResult PrintResultCertificateBulk(int examinationId, string isResultFresh)
//        {
//            try
//            {
//                if (examinationId <= 0)
//                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid examination ID.", 400));

//                var result = _examWorker.PrintResultCertificateBulk(examinationId, isResultFresh);
//                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Bulk result certificates retrieved successfully.", 200));
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
//            }
//        }

//        [HttpGet("institute-bulk-print-result")]
//        public IActionResult InstituteBulkPrintResult(int examinationId, long instituteId, string isResultFresh, char resCertificate)
//        {
//            try
//            {
//                if (examinationId <= 0 || instituteId <= 0)
//                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid parameters.", 400));

//                var result = _examWorker.InstituteBulkPrintResult(examinationId, instituteId, isResultFresh, resCertificate);
//                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Institute bulk print result retrieved successfully.", 200));
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
//            }
//        }

//        [HttpGet("institute-bulk-print-result-21century")]
//        public IActionResult InstituteBulkPrintResult21Century(int examinationId, long instituteId, string isResultFresh, char resCertificate)
//        {
//            try
//            {
//                if (examinationId <= 0 || instituteId <= 0)
//                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid parameters.", 400));

//                var result = _examWorker.InstituteBulkPrintResult21Century(examinationId, instituteId, isResultFresh, resCertificate);
//                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Institute bulk print result 21st century retrieved successfully.", 200));
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
//            }
//        }

//        [HttpGet("institute-bulk-print-result-long")]
//        public IActionResult InstituteBulkPrintResultLong(int examinationId, long instituteId, string isResultFresh, char resCertificate)
//        {
//            try
//            {
//                if (examinationId <= 0 || instituteId <= 0)
//                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid parameters.", 400));

//                var result = _examWorker.InstituteBulkPrintResultLong(examinationId, instituteId, isResultFresh, resCertificate);
//                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Institute bulk print result long format retrieved successfully.", 200));
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
//            }
//        }

//        [HttpGet("GetVerificationCertificateRequests")]
//        public IActionResult GetVerificationCertificateRequests(string status = null)
//        {
//            try
//            {
//                var result = _verificationWorker.GetVerificationCertificateRequests(status);
//                return Ok(ApiResponse<DataSet>.SuccessResponse(result, "Verification certificate requests retrieved successfully.", 200));
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
//            }
//        }

//        [HttpPut("UpdateCertificateStatus")]
//        public IActionResult UpdateCertificateStatus([FromBody] UpdateCertificateStatusRequest request)
//        {
//            try
//            {
//                var result = _verificationWorker.UpdateCertificateStatus(
//                    request.ProfileID,
//                    request.Status,
//                    request.UpdatedBy,
//                    request.PrintedOn
//                );
//                return Ok(ApiResponse<int>.SuccessResponse(result, "Certificate status updated successfully.", 200));
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
//            }
//        }

//        [HttpGet("CheckIsPreviouslyVerified")]
//        public IActionResult CheckIsPreviouslyVerified([FromQuery] string certificateNo, string profileID)
//        {
//            try
//            {
//                if (string.IsNullOrWhiteSpace(certificateNo))
//                {
//                    return BadRequest(ApiResponse<string>.ErrorResponse("Certificate number is required", 400));
//                }

//                var result = _verificationWorker.CheckIsPreviouslyVerified(certificateNo, profileID);

//                if (result != null && result.Tables.Count > 0 && result.Tables[0].Rows.Count > 0)
//                {
//                    var row = result.Tables[0].Rows[0];
//                    bool isVerified = Convert.ToBoolean(row["IsVerified"]);
//                    string message = row["Message"].ToString();

//                    var response = new
//                    {
//                        IsVerified = isVerified,
//                        Message = message,
//                        CertificateDetails = isVerified ? new
//                        {
//                            RequestNo = row["RequestNo"].ToString(),
//                            ProfileID = row["ProfileID"].ToString(),
//                            Name = row["Name"].ToString(),
//                            Status = row["Status"].ToString(),
//                            PrintedOn = row["PrintedOn"] != DBNull.Value ? Convert.ToDateTime(row["PrintedOn"]) : (DateTime?)null
//                        } : null
//                    };

//                    return Ok(ApiResponse<object>.SuccessResponse(response, message, 200));
//                }

//                return Ok(ApiResponse<object>.ErrorResponse("Unable to verify certificate", 404));
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
//            }
//        }



//        #endregion
//    }

//    #region Request Models

//    public class SaveElectiveSubjectsRequest
//    {
//        public string XmlDoc { get; set; }
//        public string ReportedBy { get; set; }
//        public string ReportedByIPAddress { get; set; }
//        public long BatchId { get; set; }
//    }

//    public class UpdateCertificateStatusRequest
//    {
//        public string ProfileID { get; set; }
//        public string Status { get; set; }
//        public string UpdatedBy { get; set; }
//        public DateTime? PrintedOn { get; set; }
//    }


//    public class SaveResultCorrectionRequest
//    {
//        public string XMLString { get; set; }
//        public string UserLoginID { get; set; }
//        public string IPAddress { get; set; }
//    }

//    public class UpdateCandidateResultRequest
//    {
//        public long ApplicationID { get; set; }
//        public int ExaminationID { get; set; }
//        public string UserLoginID { get; set; }
//        public string IPAddress { get; set; }
//    }

//    public class UpdateCandidateResultRejectRequest
//    {
//        public long ApplicationID { get; set; }
//        public int ExaminationID { get; set; }
//        public string UserLoginID { get; set; }
//        public string IPAddress { get; set; }
//        public string RejectRemark { get; set; }
//    }

//    #endregion

//    #region ApiResponse Class (if not already defined)



//    #endregion
//}


using Microsoft.AspNetCore.Mvc;
using Microsoft.Reporting.NETCore;
using Portal.Business.Interface.Exam;
using Portal.Business.Worker.Base;
using Portal.Business.Worker.Base;
using Portal.Business.Worker.Utility;
using Portal.Entities;
using Portal.Entities.Account;
using Portal.Entities.Exam;
using Portal.Entities.Exam;
using Portal.Entities.ResponseBody;
using QRCoder;
using System;
using System.Data;
using System.Drawing;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO.Compression;
using System.Net;
using System.Security;
using System.Text;
using System.Xml;

namespace Portal.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ExamController : ControllerBase
    {
        private readonly IExam _examWorker;
        private readonly IVerificationCertificate _verificationWorker;

        public ExamController(IExam examWorker, IVerificationCertificate verificationWorker)
        {
            _examWorker = examWorker ?? throw new ArgumentNullException(nameof(examWorker));
            _verificationWorker = verificationWorker ?? throw new ArgumentNullException(nameof(verificationWorker));
        }

        #region Exam Center Mapping

        [HttpGet("exam-center-mapping")]
        public IActionResult GetExamCenterMapping(long districtId, int examinationId)
        {
            try
            {
                if (districtId <= 0 || examinationId <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid district ID or examination ID.", 400));

                var result = _examWorker.GetExamCenterMapping(districtId, examinationId);
                return Ok(ApiResponse<DataSet>.SuccessResponse(result, "Exam center mapping retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpGet("exam-center-mapping-by-college")]
        public IActionResult GetExamCenterMappingByCollegeID(long instituteId, int examinationId)
        {
            try
            {
                if (instituteId <= 0 || examinationId <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid institute ID or examination ID.", 400));

                var result = _examWorker.GetExamCenterMappingByCollegeID(instituteId, examinationId);
                var serializableData = BaseWorker.ConvertDataTableToList(result);
                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Exam center mapping by college retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpPost("save-exam-centers")]
        public IActionResult SaveExamCenters([FromBody] string xmldoc)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(xmldoc))
                    return BadRequest(ApiResponse<string>.ErrorResponse("XML document cannot be empty.", 400));

                var result = _examWorker.SaveExamCenters(xmldoc);
                return Ok(ApiResponse<string>.SuccessResponse(result, "Exam centers saved successfully.", 201));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        #endregion

        #region Evaluation Center Mapping

        [HttpGet("evaluation-center-mapping")]
        public IActionResult GetEvaluationCenterMapping(long districtId, int examinationId)
        {
            try
            {
                if (districtId <= 0 || examinationId <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid district ID or examination ID.", 400));

                var result = _examWorker.GetEvaluationCenterMapping(districtId, examinationId);
                return Ok(ApiResponse<DataSet>.SuccessResponse(result, "Evaluation center mapping retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpGet("evaluation-center-mapping-by-college")]
        public IActionResult GetEvaluationCenterMappingByCollegeID(long instituteId, int examinationId)
        {
            try
            {
                if (instituteId <= 0 || examinationId <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid institute ID or examination ID.", 400));

                var result = _examWorker.GetEvaluationCenterMappingByCollegeID(instituteId, examinationId);
                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Evaluation center mapping by college retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }
   
        [HttpGet("certificate-list")]
        public IActionResult GetCertificateList(long instituteId, long courseId)
        {
            try
            {
                var result = _examWorker.GetCertificateList(instituteId, courseId);

                return Ok(ApiResponse<DataTable>.SuccessResponse(
                    result,
                    "Certificate list retrieved successfully.",
                    200));
            }
            catch (Exception ex)
            {
                return StatusCode(500,
                    ApiResponse<string>.ErrorResponse(
                        $"Internal server error: {ex.Message}",
                        500));
            }
        }

        [HttpPost("save-evaluation-centers")]
        public IActionResult SaveEvaluationCenters([FromBody] string xmldoc)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(xmldoc))
                    return BadRequest(ApiResponse<string>.ErrorResponse("XML document cannot be empty.", 400));

                var result = _examWorker.SaveEvaluationCenters(xmldoc);
                return Ok(ApiResponse<string>.SuccessResponse(result, "Evaluation centers saved successfully.", 201));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpGet("evaluation-center-mapping-all")]
        public IActionResult GetEvaluationCenterMappingAll(int examType, long instituteId, long districtId, int examinationId)
        {
            try
            {
                var result = _examWorker.GetEvaluationCenterMappingAll(examType, instituteId, districtId, examinationId);
                return Ok(ApiResponse<DataSet>.SuccessResponse(result, "All evaluation center mappings retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        #endregion

        #region Assessment and Batches

        [HttpGet("batches-for-assessment")]
        public IActionResult GetBatchesForAssessment(long instituteId)
        {
            try
            {
                if (instituteId <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid institute ID.", 400));

                var result = _examWorker.GetBatchesForAssessment(instituteId);
                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Batches for assessment retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpGet("candidate-by-batch")]
        public IActionResult GetCandidatebyBatchID(long batchId)
        {
            try
            {
                if (batchId <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid batch ID.", 400));

                var result = _examWorker.GetCandidatebyBatchID(batchId);
                return Ok(ApiResponse<DataSet>.SuccessResponse(result, "Candidates by batch retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        #endregion

        #region Exam Fees

        [HttpGet("batches-for-exam-fees")]
        public IActionResult GetBatchesForExamFees(long instituteId)
        {
            try
            {
                if (instituteId <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid institute ID.", 400));

                var result = _examWorker.GetBatchesForExamFees(instituteId);
                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Batches for exam fees retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpGet("candidate-for-exam-fees")]
        public IActionResult GetCandidateForExamFeesByBatchID(long batchId)
        {
            try
            {
                if (batchId <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid batch ID.", 400));

                var result = _examWorker.GetCandidateForExamFeesByBatchID(batchId);
                return Ok(ApiResponse<DataSet>.SuccessResponse(result, "Candidates for exam fees retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        #endregion

        #region Hall Ticket

        [HttpGet("batches-for-hall-ticket")]
        public IActionResult GetBatchesForHallTicket(long instituteId)
        {
            try
            {
                if (instituteId <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid institute ID.", 400));

                var result = _examWorker.GetBatchesForHallTicket(instituteId);
                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Batches for hall ticket retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpGet("candidate-for-hall-ticket")]
        public IActionResult GetCandidateForHallTicketByBatchID(long batchId)
        {
            try
            {
                if (batchId <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid batch ID.", 400));

                var result = _examWorker.GetCandidateForHallTicketByBatchID(batchId);
                return Ok(ApiResponse<DataSet>.SuccessResponse(result, "Candidates for hall ticket retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpGet("hall-ticket")]
        public IActionResult GetHallTicket(long applicationId, long batchId)
        {
            try
            {
                if (applicationId <= 0 || batchId <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid application ID or batch ID.", 400));

                var result = _examWorker.GetHallTicket(applicationId, batchId);
                return Ok(ApiResponse<DataSet>.SuccessResponse(result, "Hall ticket retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        #endregion

        #region Attendance

        [HttpGet("batches-for-attendance")]
        public IActionResult GetBatchesForAttendance(long instituteId)
        {
            try
            {
                if (instituteId <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid institute ID.", 400));

                var result = _examWorker.GetBatchesForAttendance(instituteId);
                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Batches for attendance retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpGet("candidate-for-attendance")]
        public IActionResult GetCandidateForAttendanceByBatchID(long batchId, string subjectType)
        {
            try
            {
                if (batchId <= 0 || subjectType == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid batch ID or subject type.", 400));

                var result = _examWorker.GetCandidateForAttendanceByBatchID(batchId, subjectType);
                return Ok(ApiResponse<DataSet>.SuccessResponse(result, "Candidates for attendance retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpGet("attendance")]
        public IActionResult GetAttendance(long batchId)
        {
            try
            {
                if (batchId <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid batch ID.", 400));

                var result = _examWorker.GetAttendance(batchId);
                return Ok(ApiResponse<DataSet>.SuccessResponse(result, "Attendance retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpGet("attendance-subjects")]
        public IActionResult GetAttendanceSubjects(long batchId)
        {
            try
            {
                if (batchId <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid batch ID.", 400));

                var result = _examWorker.GetAttendanceSubjects(batchId);
                return Ok(ApiResponse<DataSet>.SuccessResponse(result, "Attendance subjects retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        #endregion

        #region Evaluation Report

        [HttpGet("batches-for-evaluation-report")]
        public IActionResult GetBatchesForEvaluationReport(long instituteId)
        {
            try
            {
                if (instituteId <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid institute ID.", 400));

                var result = _examWorker.GetBatchesForEvaluationReport(instituteId);
                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Batches for evaluation report retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpGet("candidate-for-evaluation-report")]
        public IActionResult GetCandidateForEvaluationReportByBatchID(long batchId, string examSubjectType)
        {
            try
            {
                if (batchId <= 0 || string.IsNullOrWhiteSpace(examSubjectType))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid batch ID or exam subject type.", 400));

                var result = _examWorker.GetCandidateForEvaluationReportByBatchID(batchId, examSubjectType);
                return Ok(ApiResponse<DataSet>.SuccessResponse(result, "Candidates for evaluation report retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpGet("candidate-for-evaluation-report-download")]
        public IActionResult GetCandidateForEvaluationReportByBatchIDDownload(long batchId, string examSubjectType, string subjectCode, int electiveSubjectId)
        {
            try
            {
                if (batchId <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid batch ID.", 400));

                var result = _examWorker.GetCandidateForEvaluationReportByBatchIDDownload(batchId, examSubjectType, subjectCode, electiveSubjectId);
                return Ok(ApiResponse<DataSet>.SuccessResponse(result, "Evaluation report download data retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpGet("candidate-for-evaluation-marks")]
        public IActionResult GetCandidateForEvaluationMArksByBatchID(long batchId, string examSubjectType, string subjectCode, int evaluationSubjectId)
        {
            try
            {
                if (batchId <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid batch ID.", 400));

                var result = _examWorker.GetCandidateForEvaluationMArksByBatchID(batchId, examSubjectType, subjectCode, evaluationSubjectId);
                return Ok(ApiResponse<DataSet>.SuccessResponse(result, "Evaluation marks retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpGet("candidate-for-evaluation-blank-report-download")]
        public IActionResult GetCandidateForEvaluationBlankReportByBatchIDDownload(long batchId, string examSubjectType, string subjectCode, int electiveSubjectId)
        {
            try
            {
                if (batchId <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid batch ID.", 400));

                var result = _examWorker.GetCandidateForEvaluationBlankReportByBatchIDDownload(batchId, examSubjectType, subjectCode, electiveSubjectId);
                return Ok(ApiResponse<DataSet>.SuccessResponse(result, "Blank evaluation report download data retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpGet("candidate-for-evaluation-marks-report-download")]
        public IActionResult GetCandidateForEvaluationMarksReportByBatchIDDownload(long batchId, string examSubjectType, string subjectCode, int evaluationSubjectId)
        {
            try
            {
                if (batchId <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid batch ID.", 400));

                var result = _examWorker.GetCandidateForEvaluationMarksReportByBatchIDDownload(batchId, examSubjectType, subjectCode, evaluationSubjectId);
                return Ok(ApiResponse<DataSet>.SuccessResponse(result, "Evaluation marks report download data retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpPost("save-marks")]
        public IActionResult SaveMarks([FromBody] ExamMarksEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid request data.", 400));

                var result = _examWorker.SaveMarks(entity);
                return Ok(ApiResponse<string>.SuccessResponse(result, "Marks saved successfully.", 201));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        #endregion

        #region Results

        [HttpGet("result-status")]
        public IActionResult GetResultStatus(int userTypeId, int examTypeId, int examinationId, int marksSubmissionStatus,
            long instituteId, long evaluationCenterId, long courseId, string subjectCode, int subjectTypeId, string userLoginId)
        {
            try
            {
                var result = _examWorker.GetResultStatus(userTypeId, examTypeId, examinationId, marksSubmissionStatus,
                    instituteId, evaluationCenterId, courseId, subjectCode, subjectTypeId, userLoginId);
                return Ok(ApiResponse<DataSet>.SuccessResponse(result, "Result status retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpGet("result-status-by-batch")]
        public IActionResult GetResultStatusByBatchID(long batchId)
        {
            try
            {
                if (batchId <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid batch ID.", 400));

                var result = _examWorker.GetResultStatusByBatchID(batchId);
                return Ok(ApiResponse<DataSet>.SuccessResponse(result, "Result status by batch retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpGet("candidate-result-certificate")]
        public IActionResult CandidateResultCertificate(long candidateId)
        {
            try
            {
                if (candidateId <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid candidate ID.", 400));

                var result = _examWorker.CandidateResultCertificate(candidateId);
                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Candidate result certificate retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }



        [HttpGet("candidate-print-result-certificate")]
        public IActionResult CandidatePrintResultCertificate(
    long candidateId,
    long applicationId,
    int examinationId,
    string isResultFresh
)
        {
            LocalReport localReport = new LocalReport();

            try
            {
                // Step 1: Validation
                if (candidateId <= 0 ||
                    applicationId <= 0 ||
                    examinationId <= 0)
                {
                    return BadRequest(
                        ApiResponse<string>.ErrorResponse(
                            "Invalid parameters.",
                            400
                        )
                    );
                }

                // Step 2: RDLC Path
                localReport.ReportPath = Path.Combine(
                    Directory.GetCurrentDirectory(),
                    "RDLCReports",
                    "StatementofMarksSystem.rdlc"
                );

                // Step 3: Main Dataset
                DataSet ds =
                    _examWorker.CandidatePrintResultCertificate(
                        candidateId,
                        applicationId,
                        examinationId,
                        isResultFresh
                    );

                // Step 4: Subject Dataset
                DataTable dt =
                    _examWorker.GetCandidatePrintBulkSubject(
                        applicationId,
                        examinationId,
                        isResultFresh
                    );

                // Step 5: Validate Dataset
                if (ds == null ||
                    ds.Tables.Count == 0 ||
                    ds.Tables[0].Rows.Count == 0)
                {
                    return NotFound(
                        ApiResponse<string>.ErrorResponse(
                            "No result data found.",
                            404
                        )
                    );
                }

                // Step 6: Generate QR Code
                ds.Tables[0].Rows[0]["QRcode"] =
                    GetQRCode(
                        ds.Tables[0]
                        .Rows[0]["QRcodeText"]
                        .ToString()
                    );

                // Step 7: Add RDLC Datasources
                localReport.DataSources.Add(
                    new ReportDataSource(
                        "Candidate",
                        ds.Tables[0]
                    )
                );

                localReport.DataSources.Add(
                    new ReportDataSource(
                        "SubjectMarks",
                        dt
                    )
                );

                localReport.EnableExternalImages = true;
                localReport.EnableHyperlinks = true;

                // Step 8: RDLC Parameters
                ReportParameter[] para =
                    new ReportParameter[9];

                para[0] = new ReportParameter(
                    "TotalMax",
                    ds.Tables[0]
                    .Rows[0]["TotalMarksMax"]
                    .ToString()
                );

                para[1] = new ReportParameter(
                    "Totalmin",
                    ds.Tables[0]
                    .Rows[0]["TotalMarksMin"]
                    .ToString()
                );

                para[2] = new ReportParameter(
                    "TotalObt",
                    ds.Tables[0]
                    .Rows[0]["TotalMarksObt"]
                    .ToString()
                );

                para[3] = new ReportParameter(
                    "TotalGrace",
                    ds.Tables[0]
                    .Rows[0]["Grace"]
                    .ToString()
                );

                para[4] = new ReportParameter(
                    "OverallResult",
                    ds.Tables[0]
                    .Rows[0]["ResultStatus"]
                    .ToString()
                );

                para[5] = new ReportParameter(
                    "Percentage",
                    ds.Tables[0]
                    .Rows[0]["Percentage"]
                    .ToString()
                );

                para[6] = new ReportParameter(
                    "Grade",
                    ds.Tables[0]
                    .Rows[0]["Grade"]
                    .ToString()
                );

                para[7] = new ReportParameter(
                    "ResultDate",
                    ds.Tables[0]
                    .Rows[0]["ResultDate"]
                    .ToString()
                );

                para[8] = new ReportParameter(
    "UserLoginID",  
    candidateId.ToString()
);


                localReport.SetParameters(para);

                localReport.Refresh();

                //// Step 9: Render RDLC PDF
                //string mimeType;
                //string encoding;
                //string fileNameExtension;

                //Warning[] warnings;
                //string[] streams;

                //byte[] renderedBytes =
                //    localReport.Render(
                //        "PDF",
                //        null,
                //        out mimeType,
                //        out encoding,
                //        out fileNameExtension,
                //        out streams,
                //        out warnings
                //    );
                // Step 9: Render RDLC PDF

                string mimeType;
                string encoding;
                string fileNameExtension;

                Warning[] warnings;
                string[] streams;

                // PDF Margin Fix
                string deviceInfo =
                    "<DeviceInfo>" +
                    "<OutputFormat>PDF</OutputFormat>" +
                    "<PageWidth>21cm</PageWidth>" +
                    "<PageHeight>29.7cm</PageHeight>" +
                    "<MarginTop>0.2cm</MarginTop>" +
                    "<MarginLeft>0.2cm</MarginLeft>" +
                    "<MarginRight>0.2cm</MarginRight>" +
                    "<MarginBottom>0.2cm</MarginBottom>" +
                    "</DeviceInfo>";

                byte[] renderedBytes =
                    localReport.Render(
                        "PDF",
                        deviceInfo,
                        out mimeType,
                        out encoding,
                        out fileNameExtension,
                        out streams,
                        out warnings
                    );

                // Step 10: File Name
                string fileName =
                    $"StatementofMarks_{candidateId}_{DateTime.Now:ddMMyyyyHHmmss}.pdf";

                // Step 11: Return RDLC PDF
                return File(
                    renderedBytes,
                    "application/pdf",
                    fileName
                );
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    ApiResponse<string>.ErrorResponse(
                        $"Internal server error: {ex.Message}",
                        500
                    )
                );
            }
            finally
            {
                localReport.Dispose();

                GC.SuppressFinalize(localReport);
            }
        }
        [HttpGet("candidate-print-notice")]
        public IActionResult CandidatePrintNotice(
    long candidateId,
    long applicationId,
    int examinationId,
    string isResultFresh
)
        {
            LocalReport localReport = new LocalReport();

            try
            {
                
                if (candidateId <= 0 ||
                    applicationId <= 0 ||
                    examinationId <= 0)
                {
                    return BadRequest(
                        ApiResponse<string>.ErrorResponse(
                            "Invalid parameters.",
                            400
                        )
                    );
                }

                
                localReport.ReportPath = Path.Combine(
                    Directory.GetCurrentDirectory(),
                    "RDLCReports",
                    "CandidateNotice.rdlc"
                );

               
                DataSet ds =
                    _examWorker.CandidatePrintResultCertificate(
                        candidateId,
                        applicationId,
                        examinationId,
                        isResultFresh
                    );

                
                DataTable dt =
                    _examWorker.GetCandidatePrintBulkSubject(
                        applicationId,
                        examinationId,
                        isResultFresh
                    );

                // Step 5: Validate Dataset
                if (ds == null ||
                    ds.Tables.Count == 0 ||
                    ds.Tables[0].Rows.Count == 0)
                {
                    return NotFound(
                        ApiResponse<string>.ErrorResponse(
                            "No notice data found.",
                            404
                        )
                    );
                }

                // Step 6: Generate QR Code
                ds.Tables[0].Rows[0]["QRcode"] =
                    GetQRCode(
                        ds.Tables[0]
                        .Rows[0]["QRcodeText"]
                        .ToString()
                    );

                // Step 7: Add RDLC Datasources
                localReport.DataSources.Add(
                    new ReportDataSource(
                        "Candidate",
                        ds.Tables[0]
                    )
                );

                localReport.DataSources.Add(
                    new ReportDataSource(
                        "SubjectMarks",
                        dt
                    )
                );

                localReport.EnableExternalImages = true;
                localReport.EnableHyperlinks = true;

                // Step 8: RDLC Parameters
                ReportParameter[] para =
                    new ReportParameter[1];

                para[0] = new ReportParameter(
                    "UserLoginID",
                    applicationId.ToString()
                );

                localReport.SetParameters(para);

                localReport.Refresh();

                //// Step 9: Render RDLC PDF
                //string mimeType;
                //string encoding;
                //string fileNameExtension;

                //Warning[] warnings;
                //string[] streams;

                //byte[] renderedBytes =
                //    localReport.Render(
                //        "PDF",
                //        null,
                //        out mimeType,
                //        out encoding,
                //        out fileNameExtension,
                //        out streams,
                //        out warnings
                //    );
                // Step 9: Render RDLC PDF
                string mimeType;
                string encoding;
                string fileNameExtension;

                Warning[] warnings;
                string[] streams;

                // ADD: PDF device info with page size and margins
                string deviceInfo = "<DeviceInfo>" +
                                    "  <OutputFormat>PDF</OutputFormat>" +
                                    "  <PageWidth>21cm</PageWidth>" +
                                    "  <PageHeight>29.7cm</PageHeight>" +
                                    "  <MarginTop>0.5cm</MarginTop>" +
                                    "  <MarginLeft>0.5cm</MarginLeft>" +
                                    "  <MarginRight>0.5cm</MarginRight>" +
                                    "  <MarginBottom>0.5cm</MarginBottom>" +
                                    "</DeviceInfo>";

                byte[] renderedBytes =
                    localReport.Render(
                        "PDF",
                        deviceInfo,      // CHANGED: was null, now passes margin/page settings
                        out mimeType,
                        out encoding,
                        out fileNameExtension,
                        out streams,
                        out warnings
                    );

                // Step 10: File Name
                string fileName =
                    $"Notice_{candidateId}_{DateTime.Now:ddMMyyyyHHmmss}.pdf";

                // Step 11: Return PDF
                return File(
                    renderedBytes,
                    "application/pdf",
                    fileName
                );
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    ApiResponse<string>.ErrorResponse(
                        $"Internal server error: {ex.Message}",
                        500
                    )
                );
            }
            finally
            {
                localReport.Dispose();

                GC.SuppressFinalize(localReport);
            }
        }
        [HttpGet("candidate-print-certificate")]
        public IActionResult CandidatePrintCertificate(
    long candidateId,
    long applicationId,
    int examinationId,
    string isResultFresh
)
        {
            LocalReport localReport = new LocalReport();

            try
            {
                // Step 1: Validation
                if (candidateId <= 0 ||
                    applicationId <= 0 ||
                    examinationId <= 0)
                {
                    return BadRequest(
                        ApiResponse<string>.ErrorResponse(
                            "Invalid parameters.",
                            400
                        )
                    );
                }

                // Step 2: RDLC Path
                localReport.ReportPath = Path.Combine(
                    Directory.GetCurrentDirectory(),
                    "RDLCReports",
                    "CertificateSystem.rdlc"
                );

                // Step 3: Main Dataset
                DataSet ds =
                    _examWorker.CandidatePrintResultCertificate(
                        candidateId,
                        applicationId,
                        examinationId,
                        isResultFresh
                    );

                // Step 4: Subject Dataset
                DataTable dtSubject =
                    _examWorker.GetCandidatePrintBulkSubject(
                        applicationId,
                        examinationId,
                        isResultFresh
                    );

                // Step 5: Validate Dataset
                if (ds == null ||
                    ds.Tables.Count == 0 ||
                    ds.Tables[0].Rows.Count == 0)
                {
                    return NotFound(
                        ApiResponse<string>.ErrorResponse(
                            "No certificate data found.",
                            404
                        )
                    );
                }

                // Step 6: Generate QR Code
                ds.Tables[0].Rows[0]["QRcode"] =
                    GetQRCode(
                        ds.Tables[0]
                        .Rows[0]["QRcodeText"]
                        .ToString()
                    );

                // Step 7: Add RDLC Datasources
                localReport.DataSources.Add(
                    new ReportDataSource(
                        "Candidate",
                        ds.Tables[0]
                    )
                );

                localReport.DataSources.Add(
                    new ReportDataSource(
                        "SubjectMarks",
                        dtSubject
                    )
                );

                localReport.EnableExternalImages = true;
                localReport.EnableHyperlinks = true;

                // Step 8: RDLC Parameters
                ReportParameter[] para =
                    new ReportParameter[1];

                para[0] = new ReportParameter(
                    "UserLoginID",
                    applicationId.ToString()
                );

                localReport.SetParameters(para);

                localReport.Refresh();

                //// Step 9: Render RDLC PDF
                //string mimeType;
                //string encoding;
                //string fileNameExtension;

                //Warning[] warnings;
                //string[] streams;

                //byte[] renderedBytes =
                //    localReport.Render(
                //        "PDF",
                //        null,
                //        out mimeType,
                //        out encoding,
                //        out fileNameExtension,
                //        out streams,
                //        out warnings
                //    );
                // Step 9: Render RDLC PDF

string mimeType;
string encoding;
string fileNameExtension;

Warning[] warnings;
string[] streams;

// PDF Margin Fix
string deviceInfo =
    "<DeviceInfo>" +
    "<OutputFormat>PDF</OutputFormat>" +
    "<PageWidth>21cm</PageWidth>" +
    "<PageHeight>29.7cm</PageHeight>" +
    "<MarginTop>0.2cm</MarginTop>" +
    "<MarginLeft>0.2cm</MarginLeft>" +
    "<MarginRight>0.2cm</MarginRight>" +
    "<MarginBottom>0.2cm</MarginBottom>" +
    "</DeviceInfo>";

byte[] renderedBytes =
    localReport.Render(
        "PDF",
        deviceInfo,
        out mimeType,
        out encoding,
        out fileNameExtension,
        out streams,
        out warnings
    );

                // Step 10: File Name
                string fileName =
                    $"Certificate_{candidateId}_{DateTime.Now:ddMMyyyyHHmmss}.pdf";

                // Step 11: Return PDF
                return File(
                    renderedBytes,
                    "application/pdf",
                    fileName
                );
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    ApiResponse<string>.ErrorResponse(
                        $"Internal server error: {ex.Message}",
                        500
                    )
                );
            }
            finally
            {
                localReport.Dispose();

                GC.SuppressFinalize(localReport);
            }
        }
        #endregion

        #region Elective Subjects

        [HttpGet("batches-for-elective-subject-assign")]
        public IActionResult GetBatchesForElectiveSubjectAssing(long instituteId)
        {
            try
            {
                if (instituteId <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid institute ID.", 400));

                var result = _examWorker.GetBatchesForElectiveSubjectAssing(instituteId);
                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Batches for elective subject assignment retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpGet("candidate-for-elective-assign")]
        public IActionResult GetCandidateForElectiveAssignByBatchID(long batchId)
        {
            try
            {
                if (batchId <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid batch ID.", 400));

                var result = _examWorker.GetCandidateForElectiveAssignByBatchID(batchId);
                return Ok(ApiResponse<DataSet>.SuccessResponse(result, "Candidates for elective assignment retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpPost("save-elective-subjects")]
        public IActionResult SaveElectiveSubjects([FromBody] SaveElectiveSubjectsRequest request)
        {
            try
            {
                if (request == null || string.IsNullOrWhiteSpace(request.XmlDoc))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid request data.", 400));

                var result = _examWorker.SaveElectiveSubjects(request.XmlDoc, request.ReportedBy, request.ReportedByIPAddress, request.BatchId);
                return Ok(ApiResponse<string>.SuccessResponse(result, "Elective subjects saved successfully.", 201));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        //    [HttpPost("mark-certificate-printed")]
        //    public IActionResult MarkCertificatePrinted(
        //[FromBody] long certificateId)
        //    {
        //        var result =
        //            _examWorker.MarkCertificatePrinted(
        //                certificateId);

        //        return Ok(result);
        //    }
        //[HttpPost("mark-certificate-printed")]
        //public IActionResult MarkCertificatePrinted(
        //[FromBody] long certificateId)
        //{
        //    try
        //    {
        //        if (certificateId <= 0)
        //            return BadRequest(
        //                ApiResponse<string>.ErrorResponse(
        //                    "Invalid Certificate ID.", 400));

        //        string result = _examWorker
        //            .MarkCertificatePrinted(certificateId);

        //        if (result == "Y")
        //            return Ok(
        //                ApiResponse<string>.SuccessResponse(
        //                    result, "Marked as printed successfully."));

        //        return BadRequest(
        //            ApiResponse<string>.ErrorResponse(
        //                "Failed to mark as printed."));
        //    }
        //    catch (Exception ex)
        //    {
        //        CommonHelper.SaveException(
        //            ex.Message,
        //            "MarkCertificatePrinted");

        //        return StatusCode(500,
        //            ApiResponse<string>.ErrorResponse(
        //                $"Internal server error: {ex.Message}", 500));
        //    }
        //}
        public class MarkCertificatePrintedRequest
        {
            public long CertificateId { get; set; }
            public string PrintedBy { get; set; }
            public string PrintedIpAddress { get; set; }
        }

        [HttpPost("mark-certificate-printed")]
        public IActionResult MarkCertificatePrinted([FromBody] MarkCertificatePrintedRequest req)
        {
            try
            {
                if (req.CertificateId <= 0)
                    return BadRequest(
                        ApiResponse<string>.ErrorResponse("Invalid Certificate ID.", 400));

                string result = _examWorker.MarkCertificatePrinted(
                    req.CertificateId,
                    req.PrintedBy,
                    req.PrintedIpAddress);

                if (result == "Y")
                    return Ok(
                        ApiResponse<string>.SuccessResponse(
                            result, "Marked as printed successfully."));

                return BadRequest(
                    ApiResponse<string>.ErrorResponse("Failed to mark as printed."));
            }
            catch (Exception ex)
            {
                return StatusCode(500,
                    ApiResponse<string>.ErrorResponse(ex.Message, 500));
            }
        }

        #endregion

        #region Dropdown Data

        [HttpGet("evolution-center-examination")]
        public IActionResult GetEvolutionCenterExamination()
        {
            try
            {
                var result = _examWorker.GetEvolutionCenterExamination();
                return Ok(ApiResponse<object>.SuccessResponse(result, "Evolution center examination data retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpGet("exam-center-examination")]
        public IActionResult GetExamCenterExamination()
        {
            try
            {
                var result = _examWorker.GetExamCenterExamination();
                return Ok(ApiResponse<object>.SuccessResponse(result, "Exam center examination data retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        #endregion

        #region Result Correction
        [AllowAnonymous]
        [HttpGet("candidate-results")]
        public IActionResult GetCandidateResults(long candidateId)
        {
            try
            {
                if (candidateId <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid candidate ID.", 400));

                var result = _examWorker.GetCandidateResults(candidateId);
                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Candidate results retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }
        [AllowAnonymous]
        [HttpGet("candidate-results-details")]
        public IActionResult GetCandidateResultsDetails(long applicationId, long courseId, int examinationId)
        {
            try
            {
                if (applicationId <= 0 || courseId <= 0 || examinationId <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid parameters.", 400));

                var result = _examWorker.GetCandidateResultsDetails(applicationId, courseId, examinationId);
                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Candidate results details retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpGet("candidate-results-details-for-approve")]
        public IActionResult GetCandidateResultsDetailsForApprove(long applicationId, int examinationId)
        {
            try
            {
                if (applicationId <= 0 || examinationId <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid parameters.", 400));

                var result = _examWorker.GetCandidateResultsDetailsForApprove(applicationId, examinationId);
                return Ok(ApiResponse<DataSet>.SuccessResponse(result, "Candidate results details for approval retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        //[HttpPost("save-result-correction")]
        //public IActionResult SaveResultCorrection([FromBody] SaveResultCorrectionRequest request)
        //{
        //    try
        //    {
        //        if (request == null || string.IsNullOrWhiteSpace(request.XMLString))
        //            return BadRequest(ApiResponse<string>.ErrorResponse("Invalid request data.", 400));

        //        var result = _examWorker.SaveResultCorrection(request.XMLString, request.UserLoginID, request.IPAddress);
        //        return Ok(ApiResponse<string>.SuccessResponse(result, "Result correction saved successfully.", 201));
        //    }
        //    catch (Exception ex)
        //    {
        //        return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
        //    }
        //}

        //[HttpPost("save-result-correction")]
        //public IActionResult SaveResultCorrection([FromBody] SaveResultCorrectionRequest request)
        //{
        //    try
        //    {
        //        if (request == null || request.Marks == null || !request.Marks.Any())
        //            return BadRequest(ApiResponse<string>.ErrorResponse("Invalid request data.", 400));

        //        // Build XML string from JSON payload (same structure SP expects)
        //        var xml = new StringBuilder("<MarksList>");
        //        foreach (var item in request.Marks)
        //        {
        //            xml.Append("<Marks>");
        //            xml.Append($"<ApplicationID>{request.ApplicationID}</ApplicationID>");
        //            xml.Append($"<CandidateID>{request.CandidateID}</CandidateID>");
        //            xml.Append($"<ExaminationID>{request.ExaminationID}</ExaminationID>");
        //            xml.Append($"<CourseID>{request.CourseID}</CourseID>");
        //            xml.Append($"<ApplicationIDDisplay>{SecurityElement.Escape(request.ApplicationIDDisplay ?? "")}</ApplicationIDDisplay>");
        //            xml.Append($"<ExaminationName>{SecurityElement.Escape(item.ExaminationName ?? "")}</ExaminationName>");
        //            xml.Append($"<Remark>{SecurityElement.Escape(item.Remark ?? "")}</Remark>");
        //            xml.Append($"<Result>{SecurityElement.Escape(item.Result ?? "")}</Result>");
        //            xml.Append($"<Attendance>{item.Attendance ?? "-1"}</Attendance>");
        //            xml.Append($"<MinMarks>{item.MinMarks}</MinMarks>");
        //            xml.Append($"<MaxMarks>{item.MaxMarks}</MaxMarks>");
        //            xml.Append($"<ObtainedMarks>{item.ObtainedMarks}</ObtainedMarks>");
        //            xml.Append($"<SubjectTypeCode>{SecurityElement.Escape(item.SubjectTypeCode ?? "")}</SubjectTypeCode>");
        //            xml.Append($"<SubjectName>{SecurityElement.Escape(item.SubjectName ?? "")}</SubjectName>");
        //            xml.Append($"<SubjectCode>{SecurityElement.Escape(item.SubjectCode ?? "")}</SubjectCode>");
        //            xml.Append($"<AttendanceSheetURL>{SecurityElement.Escape(item.AttendanceSheetURL ?? "")}</AttendanceSheetURL>");
        //            xml.Append($"<EvalutionSheetURL>{SecurityElement.Escape(item.EvaluationSheetURL ?? "")}</EvalutionSheetURL>");
        //            xml.Append($"<DocumentURL>{SecurityElement.Escape(item.DocumentURL ?? "")}</DocumentURL>");
        //            xml.Append($"<PhotoFilePath>{SecurityElement.Escape(request.PhotoFilePath ?? "")}</PhotoFilePath>");
        //            xml.Append($"<SignFilePath>{SecurityElement.Escape(request.SignFilePath ?? "")}</SignFilePath>");
        //            xml.Append($"<FirstCandidateName>{SecurityElement.Escape(request.FirstName ?? "")}</FirstCandidateName>");
        //            xml.Append($"<MiddleCandidateName>{SecurityElement.Escape(request.MiddleName ?? "")}</MiddleCandidateName>");
        //            xml.Append($"<LastCandidateName>{SecurityElement.Escape(request.LastName ?? "")}</LastCandidateName>");
        //            xml.Append($"<DateofBirth>{SecurityElement.Escape(request.DateOfBirth ?? "")}</DateofBirth>");
        //            xml.Append($"<MotherName>{SecurityElement.Escape(request.MotherName ?? "")}</MotherName>");
        //            xml.Append($"<ExamMarksID>{item.ExamMarksID}</ExamMarksID>");
        //            xml.Append($"<ExamMarksDetilID>{item.ExamMarksDetilID}</ExamMarksDetilID>");
        //            xml.Append($"<CommonDocument>{SecurityElement.Escape(request.CommonDocument ?? "")}</CommonDocument>");
        //            xml.Append($"<ResultID>{item.ResultID}</ResultID>");
        //            xml.Append("</Marks>");
        //        }
        //        xml.Append("</MarksList>");

        //        var result = _examWorker.SaveResultCorrection(xml.ToString(), request.UserLoginID, request.IPAddress);
        //        Console.WriteLine($"SP Result: {result}");
        //        return Ok(ApiResponse<string>.SuccessResponse(result, "Result correction saved successfully.", 201));
        //    }
        //    catch (Exception ex)
        //    {
        //        return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
        //    }
        //}

        [HttpPost("save-result-correction")]
        public IActionResult SaveResultCorrection([FromBody] SaveResultCorrectionRequest request)
        {
            try
            {
                if (request == null || request.Marks == null || !request.Marks.Any())
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid request data.", 400));

                string formattedDOB = "";
                if (!string.IsNullOrEmpty(request.DateOfBirth))
                {
                    if (DateTime.TryParse(request.DateOfBirth, out DateTime parsedDate))
                    {
                        formattedDOB = parsedDate.ToString("dd/MM/yyyy");
                    }
                    else if (DateTime.TryParseExact(request.DateOfBirth, "dd/MM/yyyy",
                        System.Globalization.CultureInfo.InvariantCulture,
                        System.Globalization.DateTimeStyles.None, out DateTime parsedDate2))
                    {
                        formattedDOB = parsedDate2.ToString("dd/MM/yyyy");
                    }
                    else
                    {
                        return BadRequest(ApiResponse<string>.ErrorResponse("Invalid DateOfBirth format. Expected dd/MM/yyyy or ISO format.", 400));
                    }
                }

                var xml = new StringBuilder("<MarksList>");

                foreach (var item in request.Marks)
                {
                    decimal obtainedMarks = item.ObtainedMarks;
                    decimal minMarks = item.MinMarks;
                    decimal maxMarks = item.MaxMarks;

                    string result = "";
                    string remark = "";
                    string attendanceValue = item.Attendance?.Trim() ?? "-1";

                    if (attendanceValue == "-1")
                    {
                        result = obtainedMarks >= minMarks ? "Pass" : "Fail";
                        remark = "";
                    }
                    else if (attendanceValue == "1")
                    {
                        result = obtainedMarks >= minMarks ? "Pass" : "Fail";
                        remark = "";
                    }
                    else if (attendanceValue == "2")
                    {
                        result = "";
                        remark = "";
                    }
                    else if (attendanceValue == "3")
                    {
                        result = obtainedMarks >= minMarks ? "Pass" : "Fail";
                        remark = item.Remark ?? "";
                    }
                    else
                    {
                        result = obtainedMarks >= minMarks ? "Pass" : "Fail";
                        remark = "";
                    }

                    if (item.ResultID <= 0)
                    {
                        return BadRequest(ApiResponse<string>.ErrorResponse(
                            $"ResultID is missing or invalid for subject {item.SubjectCode}. Cannot proceed.", 400));
                    }

                    xml.Append("<Marks>");
                    xml.Append($"<ApplicationID>{request.ApplicationID}</ApplicationID>");
                    xml.Append($"<CandidateID>{request.CandidateID}</CandidateID>");
                    xml.Append($"<ExaminationID>{request.ExaminationID}</ExaminationID>");
                    xml.Append($"<CourseID>{request.CourseID}</CourseID>");
                    xml.Append($"<ApplicationIDDisplay>{SecurityElement.Escape(request.ApplicationIDDisplay ?? "")}</ApplicationIDDisplay>");
                    xml.Append($"<ExaminationName>{SecurityElement.Escape(item.ExaminationName ?? "")}</ExaminationName>");
                    xml.Append($"<Remark>{SecurityElement.Escape(remark)}</Remark>");
                    xml.Append($"<Result>{SecurityElement.Escape(result)}</Result>");
                    xml.Append($"<Attendance>{attendanceValue}</Attendance>");
                    xml.Append($"<MinMarks>{minMarks}</MinMarks>");
                    xml.Append($"<MaxMarks>{maxMarks}</MaxMarks>");
                    xml.Append($"<ObtainedMarks>{obtainedMarks}</ObtainedMarks>");
                    xml.Append($"<SubjectTypeCode>{SecurityElement.Escape(item.SubjectTypeCode ?? "")}</SubjectTypeCode>");

                    string encodedSubjectName = !string.IsNullOrEmpty(item.SubjectName)
                        ? XmlConvert.EncodeName(item.SubjectName)
                        : "0";
                    xml.Append($"<SubjectName>{encodedSubjectName}</SubjectName>");

                    xml.Append($"<SubjectCode>{SecurityElement.Escape(item.SubjectCode ?? "")}</SubjectCode>");
                    xml.Append($"<AttendanceSheetURL>{SecurityElement.Escape(item.AttendanceSheetURL ?? "")}</AttendanceSheetURL>");
                    xml.Append($"<EvalutionSheetURL>{SecurityElement.Escape(item.EvaluationSheetURL ?? "")}</EvalutionSheetURL>");
                    xml.Append($"<DocumentURL>{SecurityElement.Escape(item.DocumentURL ?? "")}</DocumentURL>");
                    xml.Append($"<PhotoFilePath>{SecurityElement.Escape(request.PhotoFilePath ?? "")}</PhotoFilePath>");
                    xml.Append($"<SignFilePath>{SecurityElement.Escape(request.SignFilePath ?? "")}</SignFilePath>");
                    xml.Append($"<FirstCandidateName>{SecurityElement.Escape(request.FirstName ?? "")}</FirstCandidateName>");
                    xml.Append($"<MiddleCandidateName>{SecurityElement.Escape(request.MiddleName ?? "")}</MiddleCandidateName>");
                    xml.Append($"<LastCandidateName>{SecurityElement.Escape(request.LastName ?? "")}</LastCandidateName>");
                    xml.Append($"<DateofBirth>{SecurityElement.Escape(formattedDOB)}</DateofBirth>");
                    xml.Append($"<MotherName>{SecurityElement.Escape(request.MotherName ?? "")}</MotherName>");
                    xml.Append($"<ExamMarksID>{item.ExamMarksID}</ExamMarksID>");
                    xml.Append($"<ExamMarksDetilID>{item.ExamMarksDetilID}</ExamMarksDetilID>");
                    xml.Append($"<CommonDocument>{SecurityElement.Escape(request.CommonDocument ?? "")}</CommonDocument>");
                    xml.Append($"<ResultID>{item.ResultID}</ResultID>");
                    xml.Append("</Marks>");
                }

                xml.Append("</MarksList>");

                string spResult = _examWorker.SaveResultCorrection(
                    xml.ToString(),
                    request.UserLoginID,
                    request.IPAddress
                );

                if (spResult == "Y")
                {
                    return Ok(ApiResponse<string>.SuccessResponse(spResult, "Result correction saved successfully.", 200));
                }
                else if (spResult == "N")
                {
                    return Ok(ApiResponse<string>.ErrorResponse(
                        "Save failed: Not all subject records could be matched. Please verify SubjectCode, CourseID and ResultID are correct.", 400));
                }
                else if (spResult == "Z")
                {
                    return Ok(ApiResponse<string>.ErrorResponse(
                        "Save failed due to a database error. Please check Log_ErrorDetails table for details.", 500));
                }
                else
                {
                    return Ok(ApiResponse<string>.ErrorResponse($"Unexpected SP response: {spResult}", 500));
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpGet("candidate-list-for-approve")]
        public IActionResult GetCandidateListForApprove()
        {
            try
            {
                var result = _examWorker.GetCandidateListForApprove();
                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Candidate list for approval retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpPost("update-candidate-result")]
        public IActionResult UpdateCandidateResult([FromBody] UpdateCandidateResultRequest request)
        {
            try
            {
                if (request == null || request.ApplicationID <= 0 || request.ExaminationID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid request data.", 400));

                var result = _examWorker.UpdateCandidateResult(request.ApplicationID, request.ExaminationID, request.UserLoginID, request.IPAddress);
                return Ok(ApiResponse<string>.SuccessResponse(result, "Candidate result updated successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpPost("update-candidate-result-reject")]
        public IActionResult UpdateCandidateResultReject([FromBody] UpdateCandidateResultRejectRequest request)
        {
            try
            {
                if (request == null || request.ApplicationID <= 0 || request.ExaminationID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid request data.", 400));

                var result = _examWorker.UpdateCandidateResultReject(request.ApplicationID, request.ExaminationID, request.UserLoginID, request.IPAddress, request.RejectRemark);
                return Ok(ApiResponse<string>.SuccessResponse(result, "Candidate result rejected successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpGet("approved-result-candidate-list")]
        public IActionResult GetApprovedResultCandidateList()
        {
            try
            {
                var result = _examWorker.GetApprovedResultCandidateList();
                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Approved result candidate list retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        //[HttpGet("candidate-print-result")]
        //public IActionResult CandidatePrintResult(int examinationId, long applicationId, string isResultFresh, char resCertificate)
        //{
        //    try
        //    {
        //        if (examinationId <= 0 || applicationId <= 0)
        //            return BadRequest(ApiResponse<string>.ErrorResponse("Invalid parameters.", 400));

        //        var result = _examWorker.CandidatePrintResult(examinationId, applicationId, isResultFresh, resCertificate);
        //        return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Candidate print result retrieved successfully.", 200));
        //    }
        //    catch (Exception ex)
        //    {
        //        return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
        //    }
        //}
        [HttpGet("candidate-print-result")]
        public IActionResult CandidatePrintResult(
    int examinationId,
    long applicationId,
    string isResultFresh,
    char resCertificate)
        {
            try
            {
               
                if (examinationId <= 0 || applicationId <= 0)
                {
                    return BadRequest(
                        ApiResponse<string>.ErrorResponse(
                            "Invalid parameters.",
                            400));
                }

                
                DataTable candidateDt =
                    _examWorker.CandidatePrintResult(
                        examinationId,
                        applicationId,
                        isResultFresh,
                        resCertificate);

               
                if (candidateDt == null || candidateDt.Rows.Count == 0)
                {
                    return NotFound(
                        ApiResponse<string>.ErrorResponse(
                            "Certificate data not found.",
                            404));
                }
                
                foreach (DataRow row in candidateDt.Rows)
                {
                    if (candidateDt.Columns.Contains("QRcode") &&
                        candidateDt.Columns.Contains("QRcodeText"))
                    {
                        if (row["QRcodeText"] != DBNull.Value)
                        {
                            row["QRcode"] =
                                GetQRCode(
                                    row["QRcodeText"].ToString());
                        }
                    }
                }

               
                LocalReport localReport = new LocalReport();

                try
                {
                   
                    string reportPath = Path.Combine(
                        Directory.GetCurrentDirectory(),
                        "RDLCReports",
                        "BulkCertificatePrepinted.rdlc"
                    );

                    Console.WriteLine(
                        $"RDLC Path: {reportPath}");

                    if (!System.IO.File.Exists(reportPath))
                    {
                        return StatusCode(
                            500,
                            ApiResponse<string>.ErrorResponse(
                                "RDLC file not found: " + reportPath,
                                500));
                    }

                    localReport.ReportPath = reportPath;

                   
                    localReport.DataSources.Add(
                        new ReportDataSource(
                            "CandidateSubject",
                            candidateDt)
                    );

                    
                    localReport.EnableExternalImages = true;
                    localReport.EnableHyperlinks = true;

                    
                    localReport.Refresh();

                    
                    string deviceInfo =
                        "<DeviceInfo>" +
                        "  <OutputFormat>PDF</OutputFormat>" +
                        "  <PageWidth>21cm</PageWidth>" +
                        "  <PageHeight>29.7cm</PageHeight>" +
                        "  <MarginTop>0.5cm</MarginTop>" +
                        "  <MarginLeft>1.5cm</MarginLeft>" +
                        "  <MarginRight>1.5cm</MarginRight>" +
                        "  <MarginBottom>0.5cm</MarginBottom>" +
                        "</DeviceInfo>";

                    
                    Warning[] warnings;
                    string[] streams;
                    string mimeType;
                    string encoding;
                    string fileNameExtension;

                    byte[] renderedBytes =
                        localReport.Render(
                            "PDF",
                            deviceInfo,
                            out mimeType,
                            out encoding,
                            out fileNameExtension,
                            out streams,
                            out warnings
                        );

                   
                    if (renderedBytes == null ||
                        renderedBytes.Length == 0)
                    {
                        return StatusCode(
                            500,
                            ApiResponse<string>.ErrorResponse(
                                "PDF generation returned empty data.",
                                500));
                    }

                    Console.WriteLine(
                        $"PDF Generated Successfully. Size: {renderedBytes.Length} bytes");

                   
                    string applicationDisplay =
                        candidateDt.Rows[0]["ApplicationIDDisplay"]
                            ?.ToString()
                            ?.Replace("/", "_")
                            ?? applicationId.ToString();

                    string fileName =
                        $"{applicationDisplay}_Certificate_{DateTime.Now:ddMMyyyyHHmmss}.pdf";

                    
                    return File(
                        renderedBytes,
                        "application/pdf",
                        fileName
                    );
                }
                finally
                {
                    localReport.Dispose();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(
                    "CandidatePrintResult PDF ERROR:");
                Console.WriteLine(ex.ToString());

                return StatusCode(
                    500,
                    ApiResponse<string>.ErrorResponse(
                        $"Internal server error: {ex.Message}",
                        500));
            }
        }

        #endregion

        #region Additional Result Methods

        [HttpGet("candidate-print-bulk-result-certificate")]
        public IActionResult GetCandidatePrintBulkResultCertificate()
        {
            try
            {
                var result = _examWorker.GetCandidatePrintBulkResultCertificate();
                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Bulk result certificate data retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpGet("candidate-print-bulk-subject")]
        public IActionResult GetCandidatePrintBulkSubject(long applicationId, int examinationId, string isResultFresh)
        {
            try
            {
                if (applicationId <= 0 || examinationId <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid parameters.", 400));

                var result = _examWorker.GetCandidatePrintBulkSubject(applicationId, examinationId, isResultFresh);
                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Bulk subject data retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpGet("result-batch-wise")]
        public IActionResult GetResultBatchWise(int examinationId, int examTypeId, int userTypeId, long instituteId, long courseId, int districtId, string userLoginId, string isResultFresh)
        {
            try
            {
                var result = _examWorker.GetResultBatchWise(examinationId, examTypeId, userTypeId, instituteId, courseId, districtId, userLoginId, isResultFresh);
                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Result batch wise data retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

       
        [HttpGet("batch-print-result-certificate")]
        public IActionResult BatchPrintResultCertificate(
            int examinationId,
            long batchId,
            int examTypeId,        // ✅ ADD THIS
            int userTypeId,        // ✅ ADD THIS
            long instituteId,      // ✅ ADD THIS
            long courseId,         // ✅ ADD THIS
            int districtId,        // ✅ ADD THIS
            string userLoginId,    // ✅ ADD THIS
            string isResultFresh = "F",
            string commandName = "Result")
        {
            if (examinationId <= 0 || batchId <= 0)
                return BadRequest(ApiResponse<string>.ErrorResponse("Invalid parameters.", 400));

            try
            {
                // ✅ ADD THIS BLOCK — Get ResultHold count from GetResultBatchWise
                int resultHoldCount = 0;
                DataTable batchSummary = _examWorker.GetResultBatchWise(
                    examinationId, examTypeId, userTypeId,
                    instituteId, courseId, districtId, userLoginId, isResultFresh);

                if (batchSummary != null && batchSummary.Rows.Count > 0)
                {
                    DataRow batchRow = batchSummary.AsEnumerable()
                        .FirstOrDefault(r => r["BatchID"].ToString() == batchId.ToString());

                    if (batchRow != null)
                        resultHoldCount = Convert.ToInt32(batchRow["ResultHold"]);
                }
                // ✅ END OF ADDED BLOCK

                DataTable maidt = _examWorker.BatchPrintResultCertificate(examinationId, batchId, isResultFresh);

                if (maidt == null || maidt.Rows.Count == 0)
                    return NotFound(ApiResponse<string>.ErrorResponse("No candidate data found.", 404));

                // Remove duplicate QRcode columns if present
                while (maidt.Columns.Cast<DataColumn>()
                       .Count(c => c.ColumnName == "QRcode") > 1)
                {
                    maidt.Columns.RemoveAt(
                        maidt.Columns.Cast<DataColumn>()
                        .Select((c, i) => new { c, i })
                        .Last(x => x.c.ColumnName == "QRcode").i
                    );
                }

                var pdfList = new List<PdfEntry>();

                foreach (DataRow row in maidt.Rows)
                {
                    DataTable candidateDt = maidt.Clone();
                    candidateDt.ImportRow(row);

                    // Generate QR Code
                    candidateDt.Rows[0]["QRcode"] =
                        GetQRCode(candidateDt.Rows[0]["QRcodeText"].ToString());

                    // ✅ ADD THIS — skip Result Hold candidates when count > 0
                    string resultStatus = candidateDt.Rows[0]["ResultStatus"]
                        .ToString().Trim().ToUpper();

                    if (resultHoldCount > 0 && resultStatus == "RESULT HOLD")
                        continue;
                    // ✅ END OF ADDED

                    if (commandName == "Certificate" &&
                        candidateDt.Rows[0]["ResultStatus"]
                            .ToString().Trim().ToUpper() != "PASS")
                    {
                        continue;
                    }

                    long applicationId = Convert.ToInt64(candidateDt.Rows[0]["ApplicationID"]);

                    DataTable dtSubject =
                        _examWorker.GetCandidatePrintBulkSubject(
                            applicationId,
                            examinationId,
                            isResultFresh);

                    // ✅ commandName decides which RDLC to use
                    string rdlcName = commandName == "Certificate"
                        ? "CertificateSystem.rdlc"
                        : "StatementofMarksSystem.rdlc";

                    string reportPath = Path.Combine("RDLCReports", rdlcName);

                    if (!System.IO.File.Exists(reportPath))
                    {
                        return NotFound(
                            ApiResponse<string>.ErrorResponse(
                                $"Report template '{rdlcName}' not found.", 404));
                    }

                    byte[] pdfBytes = RenderReportToPdf(
                        reportPath,
                        new[]
                        {
                    new ReportDataSource("Candidate", candidateDt),
                    new ReportDataSource("SubjectMarks", dtSubject)
                        },
                        commandName == "Certificate"
                        ? new[]
                        {
                    new ReportParameter(
                        "UserLoginID",
                        candidateDt.Rows[0]["ApplicationID"].ToString()
                    )
                        }
                        : new[]
                        {
                    new ReportParameter(
                        "UserLoginID",
                        commandName == "Certificate"
                            ? candidateDt.Rows[0]["ApplicationID"].ToString()
                            : batchId.ToString()
                    ),
                    new ReportParameter("TotalMax",      candidateDt.Rows[0]["TotalMarksMax"].ToString()),
                    new ReportParameter("Totalmin",      candidateDt.Rows[0]["TotalMarksMin"].ToString()),
                    new ReportParameter("TotalObt",      candidateDt.Rows[0]["TotalMarksObt"].ToString()),
                    new ReportParameter("TotalGrace",    candidateDt.Rows[0]["Grace"].ToString()),
                    new ReportParameter("OverallResult", candidateDt.Rows[0]["ResultStatus"].ToString()),
                    new ReportParameter("Percentage",    candidateDt.Rows[0]["Percentage"].ToString()),
                    new ReportParameter("Grade",         candidateDt.Rows[0]["Grade"].ToString()),
                    new ReportParameter("ResultDate",    candidateDt.Rows[0]["ResultDate"].ToString())
                        }
                    );

                    pdfList.Add(new PdfEntry
                    {
                        FileName = candidateDt.Rows[0]["ApplicationIDDisplay"]
                                       .ToString()
                                       .Replace("/", "_")
                                   + $"_{commandName}_{DateTime.Now:ddMMyyyyhhmmss}.pdf",
                        Bytes = pdfBytes
                    });
                }

                // ✅ THIS IS THE MISSING PART — ZIP all PDFs and return as file download
                using var zipStream = new MemoryStream();
                using (var archive = new ZipArchive(zipStream, ZipArchiveMode.Create, leaveOpen: true))
                {
                    foreach (var pdf in pdfList)
                    {
                        var entry = archive.CreateEntry(pdf.FileName, CompressionLevel.Fastest);
                        using var entryStream = entry.Open();
                        entryStream.Write(pdf.Bytes, 0, pdf.Bytes.Length);
                    }
                }

                zipStream.Position = 0;

                string zipFileName = $"BatchResult_{batchId}_{commandName}_{DateTime.Now:ddMMyyyyHHmmss}.zip";

                return File(zipStream.ToArray(), "application/zip", zipFileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal error: {ex.Message}", 500));
            }
        }

        [HttpGet("result-institute-wise")]
        public IActionResult GetResultInstituteWise(int examinationId, int examTypeId, int userTypeId, long instituteId, int districtId, string userLoginId, string isResultFresh)
        {
            try
            {
                var result = _examWorker.GetResultInstituteWise(examinationId, examTypeId, userTypeId, instituteId, districtId, userLoginId, isResultFresh);
                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Result institute wise data retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpGet("result-exam-wise")]
        public IActionResult GetResultExamWise(int examinationId, int examTypeId)
        {
            try
            {
                if (examinationId <= 0 || examTypeId <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid parameters.", 400));

                var result = _examWorker.GetResultExamWise(examinationId, examTypeId);
                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Result exam wise data retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [AllowAnonymous]
        [HttpGet("institute-print-result-certificate")]
        public IActionResult InstitutePrintResultCertificate(int examinationId, long instituteId, string isResultFresh)
        {
            try
            {
                if (examinationId <= 0 || instituteId <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid parameters.", 400));

                var result = _examWorker.InstitutePrintResultCertificate(examinationId, instituteId, isResultFresh);
                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Institute print result certificate retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpGet("print-result-certificate-bulk")]
        public IActionResult PrintResultCertificateBulk(int examinationId, string isResultFresh)
        {
            try
            {
                if (examinationId <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid examination ID.", 400));

                var result = _examWorker.PrintResultCertificateBulk(examinationId, isResultFresh);
                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Bulk result certificates retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpGet("institute-bulk-print-result")]
        public IActionResult InstituteBulkPrintResult(int examinationId, long instituteId, string isResultFresh, char resCertificate)
        {
            try
            {
                if (examinationId <= 0 || instituteId <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid parameters.", 400));

                var result = _examWorker.InstituteBulkPrintResult(examinationId, instituteId, isResultFresh, resCertificate);
                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Institute bulk print result retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpGet("institute-bulk-print-result-21century")]
        public IActionResult InstituteBulkPrintResult21Century(int examinationId, long instituteId, string isResultFresh, char resCertificate)
        {
            try
            {
                if (examinationId <= 0 || instituteId <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid parameters.", 400));

                var result = _examWorker.InstituteBulkPrintResult21Century(examinationId, instituteId, isResultFresh, resCertificate);
                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Institute bulk print result 21st century retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpGet("institute-bulk-print-result-long")]
        public IActionResult InstituteBulkPrintResultLong(int examinationId, long instituteId, string isResultFresh, char resCertificate)
        {
            try
            {
                if (examinationId <= 0 || instituteId <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid parameters.", 400));

                var result = _examWorker.InstituteBulkPrintResultLong(examinationId, instituteId, isResultFresh, resCertificate);
                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Institute bulk print result long format retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }
        [AllowAnonymous]
        [HttpGet("GetVerificationCertificateRequests")]
        public IActionResult GetVerificationCertificateRequests(string status = null)
        {
            try
            {
                var result = _verificationWorker.GetVerificationCertificateRequests(status);
                return Ok(ApiResponse<DataSet>.SuccessResponse(result, "Verification certificate requests retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpPut("UpdateCertificateStatus")]
        public IActionResult UpdateCertificateStatus([FromBody] UpdateCertificateStatusRequest request)
        {
            try
            {
                var result = _verificationWorker.UpdateCertificateStatus(
                    request.ProfileID,
                    request.Status,
                    request.UpdatedBy,
                    request.PrintedOn
                );
                return Ok(ApiResponse<int>.SuccessResponse(result, "Certificate status updated successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }
        [AllowAnonymous]
        [HttpGet("CheckIsPreviouslyVerified")]
        public IActionResult CheckIsPreviouslyVerified([FromQuery] string certificateNo, string profileID)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(certificateNo))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Certificate number is required", 400));

                var result = _verificationWorker.CheckIsPreviouslyVerified(certificateNo, profileID);

                if (result != null && result.Tables.Count > 0 && result.Tables[0].Rows.Count > 0)
                {
                    var row = result.Tables[0].Rows[0];
                    bool isVerified = Convert.ToBoolean(row["IsVerified"]);
                    string message = row["Message"].ToString();

                    var response = new
                    {
                        IsVerified = isVerified,
                        Message = message,
                        CertificateDetails = isVerified ? new
                        {
                            RequestNo = row["RequestNo"].ToString(),
                            ProfileID = row["ProfileID"].ToString(),
                            Name = row["Name"].ToString(),
                            Status = row["Status"].ToString(),
                            PrintedOn = row["PrintedOn"] != DBNull.Value
                                ? Convert.ToDateTime(row["PrintedOn"])
                                : (DateTime?)null
                        } : null
                    };

                    return Ok(ApiResponse<object>.SuccessResponse(response, message, 200));
                }

                return Ok(ApiResponse<object>.ErrorResponse("Unable to verify certificate", 404));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpGet("generate-result-pdf-zip")]
        public IActionResult GenerateResultPdfZip(
      int examinationId,
      long instituteId,
      string isResultFresh = "F",
      string commandName = "Result")
        {
            if (examinationId <= 0 || instituteId <= 0)
                return BadRequest(ApiResponse<string>.ErrorResponse("Invalid parameters.", 400));
            try
            {
                DataTable maidt = _examWorker.InstitutePrintResultCertificate(examinationId, instituteId, isResultFresh);
                if (maidt == null || maidt.Rows.Count == 0)
                    return NotFound(ApiResponse<string>.ErrorResponse("No candidate data found.", 404));

                while (maidt.Columns.Cast<DataColumn>()
                       .Count(c => c.ColumnName == "QRcode") > 1)
                {
                    maidt.Columns.RemoveAt(
                        maidt.Columns.Cast<DataColumn>()
                        .Select((c, i) => new { c, i })
                        .Last(x => x.c.ColumnName == "QRcode").i
                    );
                }

                var pdfList = new List<PdfEntry>();
                foreach (DataRow row in maidt.Rows)
                {
                    DataTable candidateDt = maidt.Clone();
                    candidateDt.ImportRow(row);
                    candidateDt.Rows[0]["QRcode"] = GetQRCode(candidateDt.Rows[0]["QRcodeText"].ToString());

                    long applicationId = Convert.ToInt64(candidateDt.Rows[0]["ApplicationID"]);
                    DataTable dtSubject = _examWorker.GetCandidatePrintBulkSubject(applicationId, examinationId, isResultFresh);

                    string rdlcName = commandName == "PreResult"
                        ? "PrePrintedStatementofMarks.rdlc"
                        : "StatementofMarksSystem.rdlc";

                    string reportPath = Path.Combine("RDLCReports", rdlcName);
                    if (!System.IO.File.Exists(reportPath))
                        return NotFound(ApiResponse<string>.ErrorResponse($"Report template '{rdlcName}' not found.", 404));

                    byte[] pdfBytes = RenderReportToPdf(
                        reportPath,
                        new[]
                        {
                    new ReportDataSource("Candidate",    candidateDt),
                    new ReportDataSource("SubjectMarks", dtSubject)
                        },
                        new[]
                        {
                    new ReportParameter("UserLoginID",   instituteId.ToString()),
                    new ReportParameter("TotalMax",      candidateDt.Rows[0]["TotalMarksMax"].ToString()),
                    new ReportParameter("Totalmin",      candidateDt.Rows[0]["TotalMarksMin"].ToString()),
                    new ReportParameter("TotalObt",      candidateDt.Rows[0]["TotalMarksObt"].ToString()),
                    new ReportParameter("TotalGrace",    candidateDt.Rows[0]["Grace"].ToString()),
                    new ReportParameter("OverallResult", candidateDt.Rows[0]["ResultStatus"].ToString()),
                    new ReportParameter("Percentage",    candidateDt.Rows[0]["Percentage"].ToString()),
                    new ReportParameter("Grade",         candidateDt.Rows[0]["Grade"].ToString()),
                    new ReportParameter("ResultDate",    candidateDt.Rows[0]["ResultDate"].ToString())
                        }
                    );

                    pdfList.Add(new PdfEntry
                    {
                        FileName = candidateDt.Rows[0]["ApplicationIDDisplay"]
                                       .ToString().Replace("/", "_")
                                   + $"_StatementofMarks_{DateTime.Now:ddMMyyyyhhmmss}.pdf",
                        Bytes = pdfBytes
                    });
                }

                byte[] zipBytes = BuildZip(pdfList);
                return File(zipBytes, "application/zip",
                    $"{instituteId}_Result_{DateTime.Now:ddMMyyyyhhmmss}.zip");
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }
        ///   Newly ADD API For Corrected Result certificate to generate System result withouth tuch previous api ... create new 
        ///   
        [HttpGet("generate-system-result-pdf")]
        public IActionResult GenerateSystemResultPdf(
    int examinationId,
    long applicationId,
    string isResultFresh)
        {
            if (examinationId <= 0 || applicationId <= 0)
            {
                return BadRequest(
                    ApiResponse<string>.ErrorResponse(
                        "Invalid examination ID or application ID.",
                        400));
            }

            try
            {
                // Get ONLY the selected candidate
                DataTable candidateDt =
                    _examWorker.CandidatePrintResultCertificate(
                        examinationId,
                        applicationId,
                        isResultFresh);

                if (candidateDt == null || candidateDt.Rows.Count == 0)
                {
                    return NotFound(
                        ApiResponse<string>.ErrorResponse(
                            "No candidate result data found.",
                            404));
                }

                // Generate QR Code
                if (candidateDt.Columns.Contains("QRcode") &&
                    candidateDt.Columns.Contains("QRcodeText"))
                {
                    candidateDt.Rows[0]["QRcode"] =
                        GetQRCode(
                            candidateDt.Rows[0]["QRcodeText"]?.ToString() ?? "");
                }

                // Get subject marks for ONLY this candidate
                DataTable dtSubject =
                    _examWorker.GetCandidatePrintBulkSubject(
                        applicationId,
                        examinationId,
                        isResultFresh);

                // System Result RDLC
                string reportPath = Path.Combine(
                    AppDomain.CurrentDomain.BaseDirectory,
                    "RDLCReports",
                    "StatementofMarksSystem.rdlc");

                if (!System.IO.File.Exists(reportPath))
                {
                    return NotFound(
                        ApiResponse<string>.ErrorResponse(
                            "Report template 'StatementofMarksSystem.rdlc' not found.",
                            404));
                }

                // Generate PDF
                byte[] pdfBytes = RenderReportToPdf(
                    reportPath,
                    new[]
                    {
                new ReportDataSource(
                    "Candidate",
                    candidateDt),

                new ReportDataSource(
                    "SubjectMarks",
                    dtSubject)
                    },
                    new[]
                    {
                new ReportParameter(
                    "UserLoginID",
                    applicationId.ToString()),

                new ReportParameter(
                    "TotalMax",
                    candidateDt.Rows[0]["TotalMarksMax"]?.ToString() ?? ""),

                new ReportParameter(
                    "Totalmin",
                    candidateDt.Rows[0]["TotalMarksMin"]?.ToString() ?? ""),

                new ReportParameter(
                    "TotalObt",
                    candidateDt.Rows[0]["TotalMarksObt"]?.ToString() ?? ""),

                new ReportParameter(
                    "TotalGrace",
                    candidateDt.Rows[0]["Grace"]?.ToString() ?? ""),

                new ReportParameter(
                    "OverallResult",
                    candidateDt.Rows[0]["ResultStatus"]?.ToString() ?? ""),

                new ReportParameter(
                    "Percentage",
                    candidateDt.Rows[0]["Percentage"]?.ToString() ?? ""),

                new ReportParameter(
                    "Grade",
                    candidateDt.Rows[0]["Grade"]?.ToString() ?? ""),

                new ReportParameter(
                    "ResultDate",
                    candidateDt.Rows[0]["ResultDate"]?.ToString() ?? "")
                    });

                // File name
                string applicationDisplay =
                    candidateDt.Rows[0]["ApplicationIDDisplay"]?
                        .ToString()?
                        .Replace("/", "_");

                string fileName =
                    $"{applicationDisplay}_StatementofMarks.pdf";

                // Return ONE PDF
                return File(
                    pdfBytes,
                    "application/pdf",
                    fileName);
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    ApiResponse<string>.ErrorResponse(
                        $"Internal server error: {ex.Message}",
                        500));
            }
        }
        ///   Corrected result certificate seprate api for perticular System Certificate... created for correct result 
        [HttpGet("generate-system-certificate-pdf")]
        public IActionResult GenerateSystemCertificatePdf(
    int examinationId,
    long instituteId,
    long applicationId,
    string isResultFresh)
        {
            if (examinationId <= 0 || instituteId <= 0 || applicationId <= 0)
            {
                return BadRequest(
                    ApiResponse<string>.ErrorResponse(
                        "Invalid parameters.", 400));
            }

            try
            {
                // Get candidate data for the institute/examination
                DataTable maidt = _examWorker.InstitutePrintResultCertificate(
                    examinationId,
                    instituteId,
                    isResultFresh);

                if (maidt == null || maidt.Rows.Count == 0)
                {
                    return NotFound(
                        ApiResponse<string>.ErrorResponse(
                            "No candidate data found.", 404));
                }

                // Select ONLY the requested candidate
                DataRow[] candidateRows = maidt.Select(
                    $"ApplicationID = {applicationId}");

                if (candidateRows.Length == 0)
                {
                    return NotFound(
                        ApiResponse<string>.ErrorResponse(
                            "Candidate data not found.", 404));
                }

                DataTable candidateDt = maidt.Clone();
                candidateDt.ImportRow(candidateRows[0]);

                // Check result status
                if (candidateDt.Rows[0]["ResultStatus"]?.ToString() != "Pass")
                {
                    return BadRequest(
                        ApiResponse<string>.ErrorResponse(
                            "Candidate has not passed. Certificate cannot be generated.", 400));
                }

                // Generate QR Code
                string qrCodeText =
                    candidateDt.Rows[0]["QRcodeText"]?.ToString() ?? "";

                candidateDt.Rows[0]["QRcode"] = GetQRCode(qrCodeText);

                // Get subject marks for this candidate
                DataTable dtSubject =
                    _examWorker.GetCandidatePrintBulkSubject(
                        applicationId,
                        examinationId,
                        isResultFresh);

                if (dtSubject == null)
                {
                    dtSubject = new DataTable();
                }

                // System Certificate RDLC
                string rdlcName = "CertificateSystem.rdlc";

                string reportPath = Path.Combine(
                    "RDLCReports",
                    rdlcName);

                if (!System.IO.File.Exists(reportPath))
                {
                    return NotFound(
                        ApiResponse<string>.ErrorResponse(
                            $"Report template '{rdlcName}' not found.", 404));
                }

                // Generate ONE PDF
                byte[] pdfBytes = RenderReportToPdf(
                    reportPath,
                    new[]
                    {
                new ReportDataSource(
                    "Candidate",
                    candidateDt),

                new ReportDataSource(
                    "SubjectMarks",
                    dtSubject)
                    },
                    new[]
                    {
                new ReportParameter(
                    "UserLoginID",
                    applicationId.ToString())
                    }
                );

                string applicationIdDisplay =
                    candidateDt.Rows[0]["ApplicationIDDisplay"]
                        ?.ToString()
                        ?.Replace("/", "_")
                    ?? applicationId.ToString();

                string fileName =
                    $"{applicationIdDisplay}_Certificate_{DateTime.Now:ddMMyyyyHHmmss}.pdf";

                // Return SINGLE PDF
                return File(
                    pdfBytes,
                    "application/pdf",
                    fileName);
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    ApiResponse<string>.ErrorResponse(
                        $"Internal server error: {ex.Message}", 500));
            }
        }

        //  Corrected Result = Priprint Result Working API ........ newly created 
        [HttpGet("generate-preprinted-result-pdf")]
        public IActionResult GeneratePrePrintedResultPdf(
    int examinationId,
    long applicationId,
    string isResultFresh,
    char resCertificate = 'R')
        {
            if (examinationId <= 0 || applicationId <= 0)
            {
                return BadRequest(
                    ApiResponse<string>.ErrorResponse(
                        "Invalid examination ID or application ID.",
                        400));
            }

            try
            {
                // 1. Get candidate result data
                DataTable maidt = _examWorker.CandidatePrintResult(
                    examinationId,
                    applicationId,
                    isResultFresh,
                    resCertificate
                    );

                if (maidt == null || maidt.Rows.Count == 0)
                {
                    return NotFound(
                        ApiResponse<string>.ErrorResponse(
                            "No result data found.",
                            404));
                }

                // 2. Generate QR Code
                foreach (DataRow row in maidt.Rows)
                {
                    row["QRcode"] = GetQRCode(
                        row["QRcodeText"]?.ToString() ?? "");
                }

                // 3. Select RDLC according to ResultType
                string reportName;

                if (maidt.Rows[0]["ResultType"]?.ToString() == "Long")
                {
                    reportName = "BulkMarkSheetPrepintedLong.rdlc";
                }
                else
                {
                    reportName = "BulkMarkSheetPrepinted.rdlc";
                }

                // 4. RDLC physical path
                string reportPath = Path.Combine(
                    AppDomain.CurrentDomain.BaseDirectory,
                    "RDLCReports",
                    reportName);

                if (!System.IO.File.Exists(reportPath))
                {
                    return NotFound(
                        ApiResponse<string>.ErrorResponse(
                            $"RDLC file not found: {reportName}",
                            404));
                }

                // 5. Create LocalReport
                LocalReport localReport = new LocalReport();

                try
                {
                    localReport.ReportPath = reportPath;

                    // 6. Bind RDLC DataSource
                    localReport.DataSources.Add(
                        new ReportDataSource(
                            "CandidateSubject",
                            maidt));

                    // Same as old ASPX code
                    localReport.EnableExternalImages = true;
                    localReport.EnableHyperlinks = true;

                    // 7. Report Parameter
                    string userLoginId =
                        User.FindFirst("UserLoginID")?.Value ?? "CMSAdmin";

                    ReportParameter[] parameters =
                    {
                new ReportParameter(
                    "UserLoginID",
                    userLoginId)
            };

                    localReport.SetParameters(parameters);

                    // 8. PDF formatting / margins
                    string deviceInfo =
                        "<DeviceInfo>" +
                        "  <OutputFormat>PDF</OutputFormat>" +
                        "  <PageWidth>21cm</PageWidth>" +
                        "  <PageHeight>29.7cm</PageHeight>" +
                        "  <MarginTop>0.5cm</MarginTop>" +
                        "  <MarginLeft>1.5cm</MarginLeft>" +
                        "  <MarginRight>1.5cm</MarginRight>" +
                        "  <MarginBottom>0.5cm</MarginBottom>" +
                        "</DeviceInfo>";

                    // 9. Render RDLC → PDF
                    Warning[] warnings;
                    string[] streams;
                    string mimeType;
                    string encoding;
                    string fileNameExtension;

                    byte[] renderedBytes = localReport.Render(
                        "PDF",
                        deviceInfo,
                        out mimeType,
                        out encoding,
                        out fileNameExtension,
                        out streams,
                        out warnings);

                    // 10. File name
                    string instituteCode =
                        maidt.Rows[0]["InstituteCode"]?.ToString() ?? "Result";

                    string fileName =
                        instituteCode +
                        "_StatementofMarks_" +
                        DateTime.Now.ToString("ddMMyyyyHHmmss") +
                        ".pdf";

                    // 11. Return PDF to React
                    return File(
                        renderedBytes,
                        "application/pdf",
                        fileName);
                }
                finally
                {
                    localReport.Dispose();
                }
            }
            catch (Exception ex)
            {
                var detail = ex.InnerException?.InnerException?.Message
                             ?? ex.InnerException?.Message
                             ?? ex.Message;

                return StatusCode(500, ApiResponse<string>.ErrorResponse(detail, 500));
            }
        }



        [HttpGet("generate-certificate-pdf-zip")]
        public IActionResult GenerateCertificatePdfZip(
            int examinationId,
            long instituteId,
            string isResultFresh = "F",
            string commandName = "Certificate")
        {
            if (examinationId <= 0 || instituteId <= 0)
                return BadRequest(ApiResponse<string>.ErrorResponse("Invalid parameters.", 400));
            try
            {
                DataTable maidt = _examWorker.InstitutePrintResultCertificate(examinationId, instituteId, isResultFresh);
                if (maidt == null || maidt.Rows.Count == 0)
                    return NotFound(ApiResponse<string>.ErrorResponse("No candidate data found.", 404));

                var pdfList = new List<PdfEntry>();
                foreach (DataRow row in maidt.Rows)
                {
                    if (row["ResultStatus"]?.ToString() != "Pass") continue;

                    DataTable candidateDt = maidt.Clone();
                    candidateDt.ImportRow(row);
                    candidateDt.Rows[0]["QRcode"] = GetQRCode(candidateDt.Rows[0]["QRcodeText"].ToString());

                    long applicationId = Convert.ToInt64(candidateDt.Rows[0]["ApplicationID"]);
                    DataTable dtSubject = _examWorker.GetCandidatePrintBulkSubject(applicationId, examinationId, isResultFresh);

                    string rdlcName = commandName == "PreCertificate"
                        ? "PrePrintedCertificateSystem.rdlc"
                        : "CertificateSystem.rdlc";

                    string reportPath = Path.Combine("RDLCReports", rdlcName);
                    if (!System.IO.File.Exists(reportPath))
                        return NotFound(ApiResponse<string>.ErrorResponse($"Report template '{rdlcName}' not found.", 404));

                    byte[] pdfBytes = RenderReportToPdf(
                        reportPath,
                        new[]
                        {
                            new ReportDataSource("Candidate",    candidateDt),
                            new ReportDataSource("SubjectMarks", dtSubject)
                        },
                        new[] { new ReportParameter("UserLoginID", applicationId.ToString()) }
                    );

                    pdfList.Add(new PdfEntry
                    {
                        FileName = candidateDt.Rows[0]["ApplicationIDDisplay"]
                                       .ToString().Replace("/", "_")
                                   + $"_Certificate_{DateTime.Now:ddMMyyyyhhmmss}.pdf",
                        Bytes = pdfBytes
                    });
                }

                if (pdfList.Count == 0)
                    return NotFound(ApiResponse<string>.ErrorResponse("No passing candidates found.", 404));

                byte[] zipBytes = BuildZip(pdfList);
                return File(zipBytes, "application/zip",
                    $"{instituteId}_Certificate_{DateTime.Now:ddMMyyyyhhmmss}.zip");
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        //[HttpGet("bulk-statement-of-marks-pdf")]
        //public IActionResult BulkStatementOfMarksPdf(
        //    int examinationId,
        //    long instituteId,
        //    string isResultFresh = "F")
        //{
        //    if (examinationId <= 0 || instituteId <= 0)
        //        return BadRequest(ApiResponse<string>.ErrorResponse("Invalid parameters.", 400));
        //    try
        //    {
        //        DataTable maidt = _examWorker.InstituteBulkPrintResult(examinationId, instituteId, isResultFresh, 'R');
        //        if (maidt == null || maidt.Rows.Count == 0)
        //            return NotFound(ApiResponse<string>.ErrorResponse("No candidate data found.", 404));

        //        foreach (DataRow row in maidt.Rows)
        //            row["QRcode"] = GetQRCode(row["QRcodeText"].ToString());

        //        string rdlcName = maidt.Rows[0]["ResultType"]?.ToString() == "Long"
        //            ? "BulkMarkSheetPrepintedLong.rdlc"
        //            : "BulkMarkSheetPrepinted.rdlc";

        //        string reportPath = Path.Combine("RDLCReports", rdlcName);
        //        if (!System.IO.File.Exists(reportPath))
        //            return NotFound(ApiResponse<string>.ErrorResponse($"Report template '{rdlcName}' not found.", 404));

        //        string userLoginId = maidt.Rows[0]["InstituteCode"]?.ToString() ?? instituteId.ToString();

        //        byte[] pdfBytes = RenderReportToPdf(
        //            reportPath,
        //            new[] { new ReportDataSource("CandidateSubject", maidt) },
        //            new[] { new ReportParameter("UserLoginID", userLoginId) },
        //            leftMargin: "1.5cm", rightMargin: "1.5cm"
        //        );

        //        return File(pdfBytes, "application/pdf",
        //            $"{userLoginId}_StatementofMarks_{DateTime.Now:ddMMyyyyhhmmss}.pdf");
        //    }
        //    catch (Exception ex)
        //    {
        //        return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
        //    }
        //}
        //   [HttpGet("bulk-statement-of-marks-pdf")]
        //   public IActionResult BulkStatementOfMarksPdf(
        //int examinationId,
        //long instituteId,
        //string isResultFresh = "F")
        //   {
        //       if (examinationId <= 0 || instituteId <= 0)
        //           return BadRequest(ApiResponse<string>.ErrorResponse("Invalid parameters.", 400));
        //       try
        //       {
        //           DataTable maidt = _examWorker.InstituteBulkPrintResult(examinationId, instituteId, isResultFresh, 'R');
        //           if (maidt == null || maidt.Rows.Count == 0)
        //               return NotFound(ApiResponse<string>.ErrorResponse("No candidate data found.", 404));


        //           while (maidt.Columns.Cast<DataColumn>()
        //                  .Count(c => c.ColumnName == "QRcode") > 1)
        //           {
        //               maidt.Columns.RemoveAt(
        //                   maidt.Columns.Cast<DataColumn>()
        //                   .Select((c, i) => new { c, i })
        //                   .Last(x => x.c.ColumnName == "QRcode").i
        //               );
        //           }

        //           foreach (DataRow row in maidt.Rows)
        //               row["QRcode"] = GetQRCode(row["QRcodeText"].ToString());


        //           string rdlcName = "BulkMarkSheetPrepinted.rdlc";

        //           string reportPath = Path.Combine("RDLCReports", rdlcName);
        //           if (!System.IO.File.Exists(reportPath))
        //               return NotFound(ApiResponse<string>.ErrorResponse($"Report template '{rdlcName}' not found.", 404));

        //           string userLoginId = maidt.Rows[0]["InstituteCode"]?.ToString() ?? instituteId.ToString();

        //           byte[] pdfBytes = RenderReportToPdf(
        //               reportPath,
        //               new[] { new ReportDataSource("CandidateSubject", maidt) },
        //               new[] { new ReportParameter("UserLoginID", userLoginId) },
        //               leftMargin: "1.5cm", rightMargin: "1.5cm"
        //           );

        //           return File(pdfBytes, "application/pdf",
        //               $"{userLoginId}_StatementofMarks_{DateTime.Now:ddMMyyyyhhmmss}.pdf");
        //       }
        //       catch (Exception ex)
        //       {
        //           return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
        //       }
        //   }

        [HttpGet("bulk-statement-of-marks-pdf")]
        public IActionResult BulkStatementOfMarksPdf(
    int examinationId,
    long instituteId,
    int examTypeId,
    int userTypeId,
    int courseId = 0,
    int districtId = 0,
    string userLoginId = "",
    string isResultFresh = "F")
        {
            if (examinationId <= 0 || instituteId <= 0)
                return BadRequest(ApiResponse<string>.ErrorResponse("Invalid parameters.", 400));

            try
            {
                // ✅ STEP 1 — Get Result Hold count
                int resultHoldCount = 0;

                DataTable batchSummary = _examWorker.GetResultBatchWise(
                    examinationId,
                    examTypeId,
                    userTypeId,
                    instituteId,
                    courseId,
                    districtId,
                    userLoginId,
                    isResultFresh);

                if (batchSummary != null && batchSummary.Rows.Count > 0)
                {
                    resultHoldCount = batchSummary.AsEnumerable()
                        .Sum(r => Convert.ToInt32(r["ResultHold"]));
                }

                Console.WriteLine("RESULT HOLD COUNT = " + resultHoldCount);

                // ✅ STEP 2 — Load candidate data
                DataTable maidt = _examWorker.InstituteBulkPrintResult(
                    examinationId,
                    instituteId,
                    isResultFresh,
                    'R');

                if (maidt == null || maidt.Rows.Count == 0)
                {
                    return NotFound(
                        ApiResponse<string>.ErrorResponse(
                            "No candidate data found.",
                            404));
                }

                // ✅ DEBUG — Print all column names
                foreach (DataColumn col in maidt.Columns)
                {
                    Console.WriteLine("COLUMN = " + col.ColumnName);
                }

                Console.WriteLine("TOTAL BEFORE REMOVE = " + maidt.Rows.Count);

                // ✅ STEP 3 — Remove duplicate QRcode columns if present
                while (maidt.Columns.Cast<DataColumn>()
                       .Count(c => c.ColumnName == "QRcode") > 1)
                {
                    maidt.Columns.RemoveAt(
                        maidt.Columns.Cast<DataColumn>()
                        .Select((c, i) => new { c, i })
                        .Last(x => x.c.ColumnName == "QRcode").i
                    );
                }

                // ✅ STEP 4 — Generate QR Codes
                foreach (DataRow row in maidt.Rows)
                {
                    row["QRcode"] = GetQRCode(
                        row["QRcodeText"]?.ToString());
                }

                // ✅ STEP 5 — Remove Result Hold records
                if (resultHoldCount > 0)
                {
                    var rowsToRemove = maidt.AsEnumerable()
                        .Where(r =>
                        {
                            // ✅ print actual status value
                            string status = r["ResultStatus"]?
                                                .ToString()
                                                .Trim();

                            Console.WriteLine("STATUS = " + status);

                            return status.Equals(
                                "Result Hold",
                                StringComparison.OrdinalIgnoreCase);
                        })
                        .ToList();

                    Console.WriteLine("ROWS TO REMOVE = " + rowsToRemove.Count);

                    foreach (var row in rowsToRemove)
                    {
                        maidt.Rows.Remove(row);
                    }

                    maidt.AcceptChanges();
                }

                Console.WriteLine("TOTAL AFTER REMOVE = " + maidt.Rows.Count);

                if (maidt.Rows.Count == 0)
                {
                    return NotFound(
                        ApiResponse<string>.ErrorResponse(
                            "No printable data found after excluding Result Hold.",
                            404));
                }

                // ✅ STEP 6 — RDLC Path
                string rdlcName = "BulkMarkSheetPrepinted.rdlc";

                string reportPath = Path.Combine(
                    "RDLCReports",
                    rdlcName);

                if (!System.IO.File.Exists(reportPath))
                {
                    return NotFound(
                        ApiResponse<string>.ErrorResponse(
                            $"Report template '{rdlcName}' not found.",
                            404));
                }

                // ✅ STEP 7 — User Login
                string userLogin = maidt.Rows[0]["InstituteCode"]?
                                       .ToString()
                                   ?? instituteId.ToString();

                // ✅ STEP 8 — Generate PDF
                byte[] pdfBytes = RenderReportToPdf(
                    reportPath,
                    new[]
                    {
                new ReportDataSource(
                    "CandidateSubject",
                    maidt)
                    },
                    new[]
                    {
                new ReportParameter(
                    "UserLoginID",
                    userLogin)
                    },
                    leftMargin: "1.5cm",
                    rightMargin: "1.5cm"
                );

                // ✅ STEP 9 — Return PDF
                return File(
                    pdfBytes,
                    "application/pdf",
                    $"{userLogin}_StatementofMarks_{DateTime.Now:ddMMyyyyhhmmss}.pdf");
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    ApiResponse<string>.ErrorResponse(
                        $"Internal server error: {ex.Message}",
                        500));
            }
        }

        [HttpGet("bulk-certificate-pdf")]
        public IActionResult BulkCertificatePdf(
            int examinationId,
            long instituteId,
            string isResultFresh = "F")
        {
            if (examinationId <= 0 || instituteId <= 0)
                return BadRequest(ApiResponse<string>.ErrorResponse("Invalid parameters.", 400));
            try
            {
                DataTable maidt = _examWorker.InstituteBulkPrintResult(examinationId, instituteId, isResultFresh, 'C');
                if (maidt == null || maidt.Rows.Count == 0)
                    return NotFound(ApiResponse<string>.ErrorResponse("No candidate data found.", 404));

                foreach (DataRow row in maidt.Rows)
                    row["QRcode"] = GetQRCode(row["QRcodeText"].ToString());

                string reportPath = Path.Combine("RDLCReports", "BulkCertificatePrepinted.rdlc");
                if (!System.IO.File.Exists(reportPath))
                    return NotFound(ApiResponse<string>.ErrorResponse("Report template not found.", 404));

                string instituteCode = maidt.Rows[0]["InstituteCode"]?.ToString() ?? instituteId.ToString();

                byte[] pdfBytes = RenderReportToPdf(
                    reportPath,
                    new[] { new ReportDataSource("CandidateSubject", maidt) },
                    parameters: null,
                    leftMargin: "1.5cm", rightMargin: "1.5cm"
                );

                return File(pdfBytes, "application/pdf",
                    $"{instituteCode}_Certificate_{DateTime.Now:ddMMyyyyhhmmss}.pdf");
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }
        [HttpPost("AcadmisthanPrintResultCertificate")]
        public IActionResult AcadmisthanPrintResultCertificate([FromQuery] int examinationId, [FromQuery] long instituteId, [FromQuery] string isResultFresh)
        {
            if (examinationId <= 0 || instituteId <= 0)
            {
                return BadRequest(ApiResponse<string>.ErrorResponse("Invalid examination id or institute id"));
            }
            try
            {
                var result = _examWorker.AcadmisthanPrintResultCertificate(examinationId, instituteId, isResultFresh);
                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Acadmisthan print result certificate retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }



        //[HttpGet("bulk-statement-of-marks-pdf-long")]
        //public IActionResult BulkStatementOfMarksPdfLong(
        //    int examinationId,
        //    long instituteId,
        //    string isResultFresh = "F")
        //{
        //    if (examinationId <= 0 || instituteId <= 0)
        //        return BadRequest(ApiResponse<string>.ErrorResponse("Invalid parameters.", 400));
        //    try
        //    {

        //        DataTable maidt = _examWorker.InstituteBulkPrintResultLong
        //            examinationId, instituteId, isResultFresh, 'R');

        //        if (maidt == null || maidt.Rows.Count == 0)
        //            return NotFound(ApiResponse<string>.ErrorResponse("No candidate data found.", 404));


        //        var longRows = maidt.AsEnumerable()
        //            .Where(r => r.Field<string>("ResultType") == "Long")
        //            .ToList();

        //        if (longRows.Count == 0)
        //            return NotFound(ApiResponse<string>.ErrorResponse(
        //                "No 'Long' result type candidates found for this institute.", 404));

        //        DataTable tblFiltered = longRows.CopyToDataTable();


        //        foreach (DataRow row in tblFiltered.Rows)
        //            row["QRcode"] = GetQRCode(row["QRcodeText"].ToString());

        //        string reportPath = Path.Combine("RDLCReports", "BulkMarkSheetPrepintedLong.rdlc");
        //        if (!System.IO.File.Exists(reportPath))
        //            return NotFound(ApiResponse<string>.ErrorResponse(
        //                "Report template 'BulkMarkSheetPrepintedLong.rdlc' not found.", 404));

        //        string userLoginId = tblFiltered.Rows[0]["InstituteCode"]?.ToString()
        //                             ?? instituteId.ToString();


        //        byte[] pdfBytes = RenderReportToPdf(
        //            reportPath,
        //            new[] { new ReportDataSource("CandidateSubject", tblFiltered) },
        //            new[] { new ReportParameter("UserLoginID", userLoginId) },
        //            leftMargin: "1.5cm",
        //            rightMargin: "1.5cm"
        //        );

        //        return File(pdfBytes, "application/pdf",
        //            $"{userLoginId}_StatementofMarks_{DateTime.Now:ddMMyyyyhhmmss}.pdf");
        //    }
        //    catch (Exception ex)
        //    {
        //        return StatusCode(500, ApiResponse<string>.ErrorResponse(
        //            $"Internal server error: {ex.Message}", 500));
        //    }
        //}


        [HttpGet("bulk-statement-of-marks-pdf-long")]
        public IActionResult BulkStatementOfMarksPdfLong(
    int examinationId,
    long instituteId,
    string isResultFresh = "F")
        {
            if (examinationId <= 0 || instituteId <= 0)
                return BadRequest(ApiResponse<string>.ErrorResponse("Invalid parameters.", 400));
            try
            {
                DataTable maidt = _examWorker.InstituteBulkPrintResultLong(
                    examinationId, instituteId, isResultFresh, 'R');

                if (maidt == null || maidt.Rows.Count == 0)
                    return NotFound(ApiResponse<string>.ErrorResponse("No candidate data found.", 404));

                while (maidt.Columns.Cast<DataColumn>()
                       .Count(c => c.ColumnName == "QRcode") > 1)
                {
                    maidt.Columns.RemoveAt(
                        maidt.Columns.Cast<DataColumn>()
                        .Select((c, i) => new { c, i })
                        .Last(x => x.c.ColumnName == "QRcode").i
                    );
                }


                var longRows = maidt.Columns.Contains("ResultType")
                    ? maidt.AsEnumerable()
                           .Where(r => r.Field<string>("ResultType") == "Long")
                           .ToList()
                    : maidt.AsEnumerable().ToList();

                if (longRows.Count == 0)
                    return NotFound(ApiResponse<string>.ErrorResponse(
                        "No 'Long' result type candidates found for this institute.", 404));

                DataTable tblFiltered = longRows.CopyToDataTable();

                foreach (DataRow row in tblFiltered.Rows)
                    row["QRcode"] = GetQRCode(row["QRcodeText"].ToString());

                string reportPath = Path.Combine("RDLCReports", "BulkMarkSheetPrepintedLong.rdlc");
                if (!System.IO.File.Exists(reportPath))
                    return NotFound(ApiResponse<string>.ErrorResponse(
                        "Report template 'BulkMarkSheetPrepintedLong.rdlc' not found.", 404));

                string userLoginId = tblFiltered.Rows[0]["InstituteCode"]?.ToString()
                                     ?? instituteId.ToString();

                byte[] pdfBytes = RenderReportToPdf(
                    reportPath,
                    new[] { new ReportDataSource("CandidateSubject", tblFiltered) },
                    new[] { new ReportParameter("UserLoginID", userLoginId) },
                    leftMargin: "1.5cm",
                    rightMargin: "1.5cm"
                );

                return File(pdfBytes, "application/pdf",
                    $"{userLoginId}_StatementofMarks_{DateTime.Now:ddMMyyyyhhmmss}.pdf");
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse(
                    $"Internal server error: {ex.Message}", 500));
            }
        }


        [HttpGet("bulk-certificate-pdf-long")]
        public IActionResult BulkCertificatePdfLong(
            int examinationId,
            long instituteId,
            string isResultFresh = "F")
        {
            if (examinationId <= 0 || instituteId <= 0)
                return BadRequest(ApiResponse<string>.ErrorResponse("Invalid parameters.", 400));
            try
            {

                DataTable maidt = _examWorker.InstituteBulkPrintResultLong(
                    examinationId, instituteId, isResultFresh, 'C');

                if (maidt == null || maidt.Rows.Count == 0)
                    return NotFound(ApiResponse<string>.ErrorResponse("No candidate data found.", 404));

                foreach (DataRow row in maidt.Rows)
                    row["QRcode"] = GetQRCode(row["QRcodeText"].ToString());


                string reportPath = Path.Combine("RDLCReports", "BulkCertificatePrepinted.rdlc");
                if (!System.IO.File.Exists(reportPath))
                    return NotFound(ApiResponse<string>.ErrorResponse(
                        "Report template 'BulkCertificatePrepinted.rdlc' not found.", 404));

                string instituteCode = maidt.Rows[0]["InstituteCode"]?.ToString()
                                       ?? instituteId.ToString();


                byte[] pdfBytes = RenderReportToPdf(
                    reportPath,
                    new[] { new ReportDataSource("CandidateSubject", maidt) },
                    parameters: null,
                    leftMargin: "1.5cm",
                    rightMargin: "1.5cm"
                );

                return File(pdfBytes, "application/pdf",
                    $"{instituteCode}_Certificate_{DateTime.Now:ddMMyyyyhhmmss}.pdf");
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse(
                    $"Internal server error: {ex.Message}", 500));
            }
        }



        private string GetQRCode(string qrText)
        {
            if (string.IsNullOrWhiteSpace(qrText)) return string.Empty;
            try
            {
                ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;
                using QRCodeGenerator generator = new QRCodeGenerator();
                QRCodeData data = generator.CreateQrCode(qrText, QRCodeGenerator.ECCLevel.Q);
                Base64QRCode base64Code = new Base64QRCode(data);
                return base64Code.GetGraphic(7);
            }
            catch { return string.Empty; }
        }

        private byte[] RenderReportToPdf(
            string reportPath,
            IEnumerable<ReportDataSource> dataSources,
            IEnumerable<ReportParameter> parameters = null,
            string topMargin = "0.5cm",
            string bottomMargin = "0.5cm",
            string leftMargin = "0.5cm",
            string rightMargin = "0.5cm")
        {
            using LocalReport localReport = new LocalReport();
            localReport.ReportPath = reportPath;
            localReport.EnableExternalImages = true;
            localReport.EnableHyperlinks = true;

            foreach (var ds in dataSources)
                localReport.DataSources.Add(ds);

            if (parameters != null)
                localReport.SetParameters(parameters);

            localReport.Refresh();

            string deviceInfo =
                $"<DeviceInfo>" +
                $"  <OutputFormat>PDF</OutputFormat>" +
                $"  <PageWidth>21cm</PageWidth>" +
                $"  <PageHeight>29.7cm</PageHeight>" +
                $"  <MarginTop>{topMargin}</MarginTop>" +
                $"  <MarginLeft>{leftMargin}</MarginLeft>" +
                $"  <MarginRight>{rightMargin}</MarginRight>" +
                $"  <MarginBottom>{bottomMargin}</MarginBottom>" +
                $"</DeviceInfo>";

            return localReport.Render("PDF", deviceInfo, out _, out _, out _, out _, out _);
        }

        private byte[] BuildZip(IEnumerable<PdfEntry> entries)
        {
            var memoryStream = new MemoryStream();
            using (var archive = new ZipArchive(memoryStream, ZipArchiveMode.Create, leaveOpen: true))
            {
                foreach (var entry in entries)
                {
                    string safeName = entry.FileName.Replace("/", "_").Replace("\\", "_");
                    if (!safeName.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase))
                        safeName += ".pdf";

                    var zipEntry = archive.CreateEntry(safeName, CompressionLevel.Fastest);
                    using var zipStream = zipEntry.Open();
                    zipStream.Write(entry.Bytes, 0, entry.Bytes.Length);
                }
            }
            return memoryStream.ToArray();
        }
        // =====================================================================
        #region PDF Generation – Table Format (ResultAndCertificateInstituteTable)
        // =====================================================================

        [HttpGet("bulk-statement-of-marks-pdf-table")]
        public IActionResult BulkStatementOfMarksPdfTable(
            int examinationId,
            long instituteId,
            string isResultFresh = "F")
        {
            if (examinationId <= 0 || instituteId <= 0)
                return BadRequest(ApiResponse<string>.ErrorResponse("Invalid parameters.", 400));

            try
            {
                DataTable maidt = _examWorker.InstituteBulkPrintResult21Century(
                    examinationId, instituteId, isResultFresh, 'R');

                if (maidt == null || maidt.Rows.Count == 0)
                    return NotFound(ApiResponse<string>.ErrorResponse("No candidate data found.", 404));

                foreach (DataRow row in maidt.Rows)
                    row["QRcode"] = GetQRCode(row["QRcodeText"].ToString());

                string reportPath = Path.Combine("RDLCReports", "BulkMarkSheetPrepintedTable.rdlc");

                if (!System.IO.File.Exists(reportPath))
                    return NotFound(ApiResponse<string>.ErrorResponse(
                        "BulkMarkSheetPrepintedTable.rdlc not found.", 404));

                string userLoginId = maidt.Rows[0]["InstituteCode"]?.ToString()
                                     ?? instituteId.ToString();

                byte[] pdfBytes = RenderReportToPdf(
                    reportPath,
                    new[] { new ReportDataSource("CandidateSubject", maidt) },
                    new[] { new ReportParameter("UserLoginID", userLoginId) },
                    leftMargin: "1.5cm",
                    rightMargin: "1.5cm"
                );

                return File(pdfBytes, "application/pdf",
                    $"{userLoginId}_StatementofMarks_{DateTime.Now:ddMMyyyyhhmmss}.pdf");
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse(
                    $"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpGet("bulk-certificate-pdf-table")]
        public IActionResult BulkCertificatePdfTable(
            int examinationId,
            long instituteId,
            string isResultFresh = "F")
        {
            if (examinationId <= 0 || instituteId <= 0)
                return BadRequest(ApiResponse<string>.ErrorResponse("Invalid parameters.", 400));

            try
            {
                DataTable maidt = _examWorker.InstituteBulkPrintResultLong(
                    examinationId, instituteId, isResultFresh, 'C');

                if (maidt == null || maidt.Rows.Count == 0)
                    return NotFound(ApiResponse<string>.ErrorResponse("No candidate data found.", 404));

                foreach (DataRow row in maidt.Rows)
                    row["QRcode"] = GetQRCode(row["QRcodeText"].ToString());

                string reportPath = Path.Combine("RDLCReports", "BulkCertificatePrepintedTable.rdlc");

                if (!System.IO.File.Exists(reportPath))
                    return NotFound(ApiResponse<string>.ErrorResponse(
                        "BulkCertificatePrepintedTable.rdlc not found.", 404));

                string instituteCode = maidt.Rows[0]["InstituteCode"]?.ToString()
                                       ?? instituteId.ToString();

                byte[] pdfBytes = RenderReportToPdf(
                    reportPath,
                    new[] { new ReportDataSource("CandidateSubject", maidt) },
                    parameters: null,
                    leftMargin: "1.5cm",
                    rightMargin: "1.5cm"
                );

                return File(pdfBytes, "application/pdf",
                    $"{instituteCode}_Certificate_{DateTime.Now:ddMMyyyyhhmmss}.pdf");
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse(
                    $"Internal server error: {ex.Message}", 500));
            }
        }


        #endregion

        #endregion


        //[HttpGet("AcademisthanCertificate_GetForPrinting")] //cms login
        //public IActionResult AcademisthanCertificate_GetForPrinting()
        //{
        //    //if (courseId < 0 || instituteId < 0)
        //    //{
        //    //    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid examination id or institute id"));
        //    //}
        //    try
        //    {
        //        var result = _examWorker.AcademisthanCertificate_GetForPrinting();
        //        return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Academisthan certificate data for printing retrieved successfully.", 200));
        //    }
        //    catch (Exception ex)
        //    {
        //        return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
        //    }
        //}

        //[HttpPut("MarkCertificateAsPrinted")]  // cms login
        //public IActionResult MarkCertificateAsPrinted([FromQuery] int id, [FromQuery] long candidate, [FromQuery] long applicationId)
        //{
        //    if (id <= 0 || candidate <= 0 || applicationId <= 0)
        //    {
        //        return BadRequest(ApiResponse<string>.ErrorResponse("Invalid parameters"));
        //    }
        //    try
        //    {
        //        var result = _examWorker.MarkCertificateAsPrinted(id, candidate, applicationId);
        //        return Ok(ApiResponse<string>.SuccessResponse(result, "Certificate marked as printed successfully.", 200));
        //    }
        //    catch (Exception ex)
        //    {
        //        return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
        //    }
        //}

        //BCLS -----
        //[HttpPost("BCLSPrintResultCertificate")]
        //public IActionResult BCLSPrintResultCertificate([FromQuery] int examinationId, [FromQuery] long institudeId, [FromQuery] string isResultFresh)
        //{
        //    if (examinationId <= 0 || institudeId <= 0)
        //    {
        //        return BadRequest(ApiResponse<string>.ErrorResponse("Invalid examination id or institute id"));
        //    }
        //    try
        //    {
        //        var result = _examWorker.BCLSPrintResultCertificate(examinationId, institudeId, isResultFresh);
        //        return Ok(ApiResponse<DataTable>.SuccessResponse(result, "BCLS print result certificate retrieved successfully.", 200));
        //    }
        //    catch (Exception ex)
        //    {
        //        return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
        //    }
        //}
        
        //public class BCLSPrintRequestCertificate
        //{
        //    public List<long> CertificateIds { get; set; }
        //    public int ExaminationId { get; set; } = 0;
        //    public string IsResultFresh { get; set; } = "F";
        //}

        [HttpPost("btnPrintSelected_Click")]
        public IActionResult BCLSPrintResultCertificate([FromBody] BCLSPrintRequestCertificate request)
        {
            if (request?.CertificateIds == null || !request.CertificateIds.Any())
                return BadRequest(ApiResponse<string>.ErrorResponse(
                    "Please select at least one certificate."));

            try
            {
                int count = 0;
                var lst = new List<PDFEntity>();

                foreach (var certId in request.CertificateIds)
                {
                    DataTable maidt = _examWorker.BCLSPrintResultCertificate(
                        request.ExaminationId,
                        certId,
                        request.IsResultFresh);

                    if (maidt == null || maidt.Rows.Count == 0)
                        continue;

                    LocalReport localReport = new LocalReport();
                    string format = "PDF";
                    byte[] renderedBytes = null;

                    try
                    {
                        if (maidt.Rows[0]["CourseID"].ToString() == "1564")
                            localReport.ReportPath = Path.Combine(
                                AppDomain.CurrentDomain.BaseDirectory,
                                "RDLCReports",
                                "BCLSCertificatePrePrinted.rdlc");

                        if (maidt.Rows[0]["CourseID"].ToString() == "2778")
                            localReport.ReportPath = Path.Combine(
                                AppDomain.CurrentDomain.BaseDirectory,
                                "RDLCReports",
                                "BirlaWhiteCertificatePrePrinted.rdlc");

                       
                        foreach (DataRow row in maidt.Rows)
                        {
                            row["QRcode"] = GenerateQRCode(row["QRcodeText"].ToString());
                        }

                        localReport.DataSources.Add(
                            new ReportDataSource("CandidateSubject", maidt));
                        localReport.EnableExternalImages = true;
                        localReport.EnableHyperlinks = true;
                        localReport.Refresh();

                        string reportType;
                        string deviceInfo;
                        format = format.ToUpperInvariant();

                        if (format == "PDF")
                        {
                            reportType = "PDF";
                            deviceInfo =
                                "<DeviceInfo>" +
                                "  <OutputFormat>PDF</OutputFormat>" +
                                "  <PageWidth>21cm</PageWidth>" +
                                "  <PageHeight>29.7cm</PageHeight>" +
                                "  <MarginTop>0.5cm</MarginTop>" +
                                "  <MarginLeft>1.5cm</MarginLeft>" +
                                "  <MarginRight>1.5cm</MarginRight>" +
                                "  <MarginBottom>0.5cm</MarginBottom>" +
                                "</DeviceInfo>";
                        }
                        else if (format == "EXCEL")
                        {
                            reportType = "EXCELOPENXML";
                            deviceInfo = null;
                        }
                        else
                        {
                            reportType = "Image";
                            deviceInfo =
                                "<DeviceInfo>" +
                                "  <OutputFormat>jpeg</OutputFormat>" +
                                "  <PageWidth>8.5in</PageWidth>" +
                                "  <PageHeight>11in</PageHeight>" +
                                "  <MarginTop>0.5in</MarginTop>" +
                                "  <MarginLeft>0.5in</MarginLeft>" +
                                "  <MarginRight>0.5in</MarginRight>" +
                                "  <MarginBottom>0.5in</MarginBottom>" +
                                "</DeviceInfo>";
                        }

                        string mimeType;
                        string encoding;
                        string fileNameExtension;
                        Warning[] warnings;
                        string[] streams;

                        renderedBytes = localReport.Render(
                            reportType,
                            deviceInfo,
                            out mimeType,
                            out encoding,
                            out fileNameExtension,
                            out streams,
                            out warnings);

                        string FileName =
                            maidt.Rows[0]["ApplicationIDDisplay"].ToString()
                            + "_Certificate_"
                            + DateTime.Now.ToString("ddMMyyyyhhmmss")
                            + ".pdf";

                        PDFEntity pDFEntity = new PDFEntity();
                        pDFEntity.FileName = FileName.Replace("/", "_");
                        pDFEntity.PDFByte = renderedBytes;

                        if (pDFEntity != null)
                            lst.Add(pDFEntity);

                        count++;
                    }
                    catch (Exception ex)
                    {
                        CommonHelper.SaveException(
                            ex.Message,
                            "BulkCetrificatepreprintedZip CertId:" + certId);
                        continue;
                    }
                    finally
                    {
                        localReport.Dispose();
                        GC.SuppressFinalize(localReport);
                    }
                }

                if (count == 0 || !lst.Any())
                    return BadRequest(ApiResponse<string>.ErrorResponse(
                        "Please select at least one certificate to print."));

                if (lst.Count == 1)
                    return File(lst[0].PDFByte, "application/pdf", lst[0].FileName);

                using var zipStream = new MemoryStream();
                using (var archive = new ZipArchive(zipStream, ZipArchiveMode.Create, true))
                {
                    foreach (var pdf in lst)
                    {
                        var entry = archive.CreateEntry(pdf.FileName);
                        using var entryStream = entry.Open();
                        entryStream.Write(pdf.PDFByte, 0, pdf.PDFByte.Length);
                    }
                }

                return File(
                    zipStream.ToArray(),
                    "application/zip",
                    $"Certificates_{DateTime.Now:ddMMyyyyhhmmss}.zip");
            }
            catch (Exception ex)
            {
                return StatusCode(500,
                    ApiResponse<string>.ErrorResponse(
                        $"Internal server error: {ex.Message}", 500));
            }
        }
        
        [HttpPost("btnPrintAll_Click")]
        public IActionResult BCLSPrintAllCertificates(
    [FromBody] BCLSPrintAllRequest request)
        {
            try
            {
                List<PDFEntity> pdfList = new List<PDFEntity>();

                DataTable allCerts = _examWorker.GetCertificateList(
                    request.InstituteId,
                    request.CourseId);

                if (allCerts == null || allCerts.Rows.Count == 0)
                    return BadRequest("No certificates found.");

                foreach (DataRow certRow in allCerts.Rows)
                {
                    long certificateId =
                        Convert.ToInt64(certRow["CertificateId"]);

                    DataTable maidt =
                        _examWorker.BCLSPrintResultCertificate(
                            request.ExaminationId,
                            certificateId,
                            request.IsResultFresh ?? "F");

                    if (maidt == null || maidt.Rows.Count == 0)
                        continue;

                    PDFEntity pdf = BulkCetrificatepreprintedZip(maidt);

                    if (pdf?.PDFByte != null)
                        pdfList.Add(pdf);
                }

                if (pdfList.Count == 0)
                    return BadRequest("No certificates found.");

                using (MemoryStream memoryStream = new MemoryStream())
                {
                    using (ZipArchive zipArchive =
                        new ZipArchive(
                            memoryStream,
                            ZipArchiveMode.Create,
                            true))
                    {
                        foreach (PDFEntity item in pdfList)
                        {
                            ZipArchiveEntry zipItem =
                                zipArchive.CreateEntry(item.FileName);

                            using (MemoryStream originalFileStream =
                                new MemoryStream(item.PDFByte))
                            {
                                using (Stream zipStream = zipItem.Open())
                                {
                                    originalFileStream.CopyTo(zipStream);
                                }
                            }
                        }
                    }

                    return File(
                        memoryStream.ToArray(),
                        "application/zip",
                        $"AllCertificates_{DateTime.UtcNow.Ticks}.zip");
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(
                    ex.Message,
                    "BCLSPrintAllCertificates");

                return StatusCode(500, ex.Message);
            }
        }
        private PDFEntity BulkCetrificatepreprintedZip(DataTable maidt)
        {
            LocalReport localReport = new LocalReport();

            try
            {
                if (maidt == null || maidt.Rows.Count == 0)
                    return null;

                string courseId = maidt.Rows[0]["CourseID"]?.ToString();

                if (courseId == "1564")
                {
                    localReport.ReportPath = Path.Combine(
                        Directory.GetCurrentDirectory(),
                        "RDLCReports",
                        "BCLSCertificatePrePrinted.rdlc");
                }
                else if (courseId == "2778")
                {
                    localReport.ReportPath = Path.Combine(
                        Directory.GetCurrentDirectory(),
                        "RDLCReports",
                        "BirlaWhiteCertificatePrePrinted.rdlc");
                }

                foreach (DataRow row in maidt.Rows)
                {
                    row["QRcode"] =
                        GenerateQRCode(row["QRcodeText"]?.ToString() ?? "");
                }

                localReport.DataSources.Clear();

                localReport.DataSources.Add(
                    new ReportDataSource(
                        "CandidateSubject",
                        maidt));

                localReport.EnableExternalImages = true;
                localReport.EnableHyperlinks = true;

                localReport.Refresh();

                string fileName =
                    maidt.Rows[0]["ApplicationIDDisplay"].ToString() +
                    "_Certificate_" +
                    DateTime.Now.ToString("ddMMyyyyHHmmss") +
                    ".pdf";

                string mimeType;
                string encoding;
                string fileNameExtension;
                string[] streams;
                Warning[] warnings;

                string deviceInfo =
                    "<DeviceInfo>" +
                    "<OutputFormat>PDF</OutputFormat>" +
                    "<PageWidth>21cm</PageWidth>" +
                    "<PageHeight>29.7cm</PageHeight>" +
                    "<MarginTop>0.5cm</MarginTop>" +
                    "<MarginLeft>1.5cm</MarginLeft>" +
                    "<MarginRight>1.5cm</MarginRight>" +
                    "<MarginBottom>0.5cm</MarginBottom>" +
                    "</DeviceInfo>";

                byte[] renderedBytes = localReport.Render(
                    "PDF",
                    deviceInfo,
                    out mimeType,
                    out encoding,
                    out fileNameExtension,
                    out streams,
                    out warnings);

                return new PDFEntity
                {
                    FileName = fileName.Replace("/", "_"),
                    PDFByte = renderedBytes
                };
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(
                    ex.ToString(),
                    "BulkCetrificatepreprintedZip");

                return null;
            }
            finally
            {
                localReport.Dispose();
            }
        }

       
        private string GenerateQRCode(string candidateQRCode)
        {
            string traineePhoto = "";

            try
            {
                byte[] newFileData;

                try
                {
                    
                    QRCodeGenerator qrCodeGenerator = new QRCodeGenerator();
                    QRCodeData qrCodeData = qrCodeGenerator.CreateQrCode(candidateQRCode,QRCodeGenerator.ECCLevel.Q);

                    Base64QRCode base64Code = new Base64QRCode(qrCodeData);

                   
                    string base64String = base64Code.GetGraphic(7);

                    newFileData = Convert.FromBase64String(base64String);

                    //using (var ms = new MemoryStream())
                    //{
                    //    resized.Save(ms, ImageFormat.Jpeg);
                    //    newFileData = ms.ToArray();
                    //}
                }
                catch (Exception ex)
                {
                    
                    CommonHelper.SaveException(
                        ex.Message,
                        "GenerateQRCode Inner CandidateQRCode:" + candidateQRCode);

                    newFileData = GetBlankImageBytes();
                }

                
                traineePhoto = Convert.ToBase64String(newFileData);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(
                    ex.Message,
                    "GenerateQRCode Outer CandidateQRCode:" + candidateQRCode);
            }

            return traineePhoto;
        }

        
        private byte[] GetBlankImageBytes()
        {
            using var ms = new MemoryStream();
            using var bitmap = new Bitmap(3000, 900);
            using var g = Graphics.FromImage(bitmap);

            g.Clear(Color.White);
            bitmap.Save(ms, ImageFormat.Jpeg);

            return ms.ToArray();
        }

       
        [HttpPost("print-selected-certificates")]
        public IActionResult PrintSelectedCertificates(
     [FromBody] List<long> certificateIds)
        {
            try
            {
                List<PDFEntity> pdfList = new List<PDFEntity>();

                foreach (long certificateId in certificateIds)
                {
                    DataTable maidt = _examWorker
                        .BCLSPrintResultCertificate(
                            0,
                            certificateId,
                            "F");

                    if (maidt == null || maidt.Rows.Count == 0)
                        continue;

                    LocalReport localReport = new LocalReport();

                    string reportPath = string.Empty;

                    if (maidt.Rows[0]["CourseID"].ToString() == "1564")
                    {
                        reportPath = Path.Combine(
                            Directory.GetCurrentDirectory(),
                            "RDLCReports",
                            "BCLSCertificatePrePrinted.rdlc");
                    }
                    else if (maidt.Rows[0]["CourseID"].ToString() == "2778")
                    {
                        reportPath = Path.Combine(
                            Directory.GetCurrentDirectory(),
                            "RDLCReports",
                            "BirlaWhiteCertificatePrePrinted.rdlc");
                    }

                    localReport.ReportPath = reportPath;

                    foreach (DataRow row in maidt.Rows)
                    {
                        row["QRcode"] =
                            GetQRCode(
                                row["QRcodeText"].ToString());
                    }

                    localReport.DataSources.Add(
                        new ReportDataSource(
                            "CandidateSubject",
                            maidt));

                    localReport.EnableExternalImages = true;
                    localReport.EnableHyperlinks = true;

                    localReport.Refresh();

                    string mimeType;
                    string encoding;
                    string fileNameExtension;

                    Warning[] warnings;
                    string[] streams;

                    byte[] renderedBytes =
                        localReport.Render(
                            "PDF",
                            "<DeviceInfo>" +
                            "<OutputFormat>PDF</OutputFormat>" +
                            "<PageWidth>21cm</PageWidth>" +
                            "<PageHeight>29.7cm</PageHeight>" +
                            "<MarginTop>0.5cm</MarginTop>" +
                            "<MarginLeft>1.5cm</MarginLeft>" +
                            "<MarginRight>1.5cm</MarginRight>" +
                            "<MarginBottom>0.5cm</MarginBottom>" +
                            "</DeviceInfo>",
                            out mimeType,
                            out encoding,
                            out fileNameExtension,
                            out streams,
                            out warnings);

                    PDFEntity pdfEntity =
                        new PDFEntity();

                    pdfEntity.FileName =
                        maidt.Rows[0]["ApplicationIDDisplay"]
                        .ToString()
                        .Replace("/", "_")
                        + "_Certificate.pdf";

                    pdfEntity.PDFByte =
                        renderedBytes;

                    pdfList.Add(pdfEntity);

                    localReport.Dispose();
                }

                if (pdfList.Count == 0)
                {
                    return BadRequest(
                        "No certificate found.");
                }

                using (MemoryStream memoryStream =
                    new MemoryStream())
                {
                    using (ZipArchive zipArchive =
                        new ZipArchive(
                            memoryStream,
                            ZipArchiveMode.Create,
                            true))
                    {
                        foreach (PDFEntity item in pdfList)
                        {
                            ZipArchiveEntry zipItem =
                                zipArchive.CreateEntry(
                                    item.FileName);

                            using (MemoryStream originalFileStream =
                                new MemoryStream(item.PDFByte))
                            {
                                using (Stream zipStream =
                                    zipItem.Open())
                                {
                                    originalFileStream.CopyTo(
                                        zipStream);
                                }
                            }
                        }
                    }

                    return File(
                        memoryStream.ToArray(),
                        "application/zip",
                        "Certificates.zip");
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(
                    ex.Message,
                    "PrintSelectedCertificates");

                return StatusCode(
                    500,
                    ex.Message);
            }
        }

        
        [HttpPost("bcls-print-result-certificate")]
        public IActionResult BCLSPrintResultCertificatePost(  
    [FromBody] BCLSPrintRequestCertificate request)
        {
            try
            {
                if (request?.CertificateIds == null || !request.CertificateIds.Any())
                    return BadRequest(ApiResponse<string>.ErrorResponse("Please select at least one certificate.", 400));

                if (request.CertificateIds.Count == 1)
                {
                    long instituteId = request.CertificateIds[0];

                    if (instituteId <= 0)
                        return BadRequest(ApiResponse<string>.ErrorResponse("Invalid Institute ID.", 400));

                    DataTable maidt = _examWorker.BCLSPrintResultCertificate(
                        request.ExaminationId,
                        instituteId,
                        request.IsResultFresh);

                    if (maidt == null || maidt.Rows.Count == 0)
                        return NotFound(ApiResponse<string>.ErrorResponse("No certificate data found.", 404));

                    PDFEntity pdf = BulkCetrificatepreprintedZip(maidt);

                    if (pdf == null || pdf.PDFByte == null)
                        return StatusCode(500, ApiResponse<string>.ErrorResponse("Failed to generate certificate PDF.", 500));

                    return File(pdf.PDFByte, "application/pdf", pdf.FileName);
                }

               
                List<PDFEntity> pdfList = new List<PDFEntity>();

                foreach (long certificateId in request.CertificateIds)
                {
                    DataTable maidt = _examWorker.BCLSPrintResultCertificate(
                        request.ExaminationId,
                        certificateId,
                        request.IsResultFresh ?? "F");

                    if (maidt == null || maidt.Rows.Count == 0)
                        continue;

                    PDFEntity pdf = BulkCetrificatepreprintedZip(maidt);

                    if (pdf?.PDFByte != null)
                        pdfList.Add(pdf);
                }

                if (pdfList.Count == 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("No certificate found.", 400));

                using (MemoryStream memoryStream = new MemoryStream())
                {
                    using (ZipArchive zipArchive = new ZipArchive(memoryStream, ZipArchiveMode.Create, true))
                    {
                        foreach (PDFEntity item in pdfList)
                        {
                            ZipArchiveEntry zipItem = zipArchive.CreateEntry(item.FileName);

                            using (MemoryStream originalFileStream = new MemoryStream(item.PDFByte))
                            using (Stream zipStream = zipItem.Open())
                            {
                                originalFileStream.CopyTo(zipStream);
                            }
                        }
                    }

                    return File(
                        memoryStream.ToArray(),
                        "application/zip",
                        $"Certificates_{DateTime.Now:ddMMyyyyhhmmss}.zip");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }
        private PDFEntity GenerateBulkCertificateSystempdf(DataTable maidt)
        {
            LocalReport localReport = new LocalReport();
            byte[] renderedBytes = null;

            try
            {
                long applicationID = Convert.ToInt64(
                    maidt.Rows[0]["CandidateID"].ToString());

                DataTable dt =
                    _examWorker.BCLSCandidatePrintResultCertificateByCandidateID(
                        applicationID);

                if (dt == null || dt.Rows.Count == 0)
                    return null;

                if (dt.Rows[0]["CourseID"].ToString() == "1564")
                {
                    localReport.ReportPath = Path.Combine(
                        Directory.GetCurrentDirectory(),
                        "RDLCReports",
                        "BCLSCertificateSystem.rdlc");
                }
                else if (dt.Rows[0]["CourseID"].ToString() == "2778")
                {
                    localReport.ReportPath = Path.Combine(
                        Directory.GetCurrentDirectory(),
                        "RDLCReports",
                        "BirlaWhiteCertificateSystem.rdlc");
                }

                dt.Rows[0]["QRcode"] =
                    GetQRCode(dt.Rows[0]["QRcodeText"].ToString());

                localReport.DataSources.Add(
                    new ReportDataSource("Candidate", dt));

                DataTable dtSubjectnew =
                    _examWorker.GetCandidatePrintBulkSubject(
                        applicationID,
                        0,
                        "");

                localReport.DataSources.Add(
                    new ReportDataSource("SubjectMarks", dtSubjectnew));

                localReport.EnableExternalImages = true;
                localReport.EnableHyperlinks = true;

                string userLoginId = "1";

                ReportParameter[] para = new ReportParameter[1];
                para[0] = new ReportParameter(
                    "UserLoginID",
                    userLoginId);

                localReport.SetParameters(para);

                localReport.Refresh();

                string fileName =
                    userLoginId +
                    "_Certificate_" +
                    DateTime.Now.ToString("ddMMyyyyHHmmss") +
                    ".pdf";

                string mimeType;
                string encoding;
                string fileNameExtension;
                Warning[] warnings;
                string[] streams;

                string deviceInfo =
                    "<DeviceInfo>" +
                    "<OutputFormat>PDF</OutputFormat>" +
                    "<PageWidth>21cm</PageWidth>" +
                    "<PageHeight>29.7cm</PageHeight>" +
                    "<MarginTop>0.5cm</MarginTop>" +
                    "<MarginLeft>0.5cm</MarginLeft>" +
                    "<MarginRight>0.5cm</MarginRight>" +
                    "<MarginBottom>0.5cm</MarginBottom>" +
                    "</DeviceInfo>";

                renderedBytes = localReport.Render(
                    "PDF",
                    deviceInfo,
                    out mimeType,
                    out encoding,
                    out fileNameExtension,
                    out streams,
                    out warnings);

                return new PDFEntity
                {
                    FileName = fileName.Replace("/", "_"),
                    PDFByte = renderedBytes
                };
            }
            catch
            {
                throw;
            }
            finally
            {
                localReport.Dispose();
                GC.SuppressFinalize(localReport);
            }
        }

       
        [HttpPost("print-selected-system")]
        public IActionResult PrintSelectedSystemCertificates(
    [FromBody] BCLSPrintSelectedSystemRequest request)
        {
            try
            {
                if (request?.CertificateIds == null || !request.CertificateIds.Any())
                    return BadRequest("Please select at least one certificate.");

                List<PDFEntity> pdfList = new List<PDFEntity>();

                foreach (long certificateId in request.CertificateIds)
                {
                    DataTable maidt = _examWorker.BCLSPrintResultCertificate(
                        request.ExaminationId,
                        certificateId,
                        request.IsResultFresh ?? "F");

                    if (maidt == null || maidt.Rows.Count == 0)
                        continue;

                    PDFEntity pdf = GenerateBulkCertificateSystempdf(maidt);

                    if (pdf?.PDFByte != null)
                        pdfList.Add(pdf);
                }

                if (pdfList.Count == 0)
                    return BadRequest("No certificate found.");

                
                using (MemoryStream memoryStream = new MemoryStream())
                {
                    using (ZipArchive zipArchive = new ZipArchive(
                        memoryStream, ZipArchiveMode.Create, true))
                    {
                        foreach (PDFEntity item in pdfList)
                        {
                            ZipArchiveEntry zipItem =
                                zipArchive.CreateEntry(item.FileName);

                            using (MemoryStream originalFileStream =
                                new MemoryStream(item.PDFByte))
                            {
                                using (Stream zipStream = zipItem.Open())
                                {
                                    originalFileStream.CopyTo(zipStream);
                                }
                            }
                        }
                    }

                    return File(
                        memoryStream.ToArray(),
                        "application/zip",
                        "SystemCertificates.zip");
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "PrintSelectedSystemCertificates");
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("GetBCLSPendingCandidates")]
        public IActionResult GetBCLSPendingCandidates([FromQuery] Int64 InstituteID)
        {
            try
            {
                var result = _examWorker.GetBCLSPendingCandidates(InstituteID);
                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "BCLS print result certificate retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }


        [HttpGet("institute-result-pdf-zip")]
        public IActionResult InstituteResultPdfZip(
            int examinationId,
            long instituteId,
            string isResultFresh = "F")
        {
            if (examinationId <= 0 || instituteId <= 0)
                return BadRequest(ApiResponse<string>.ErrorResponse("Invalid parameters.", 400));

            try
            {
                DataTable maidt = _examWorker.InstitutePrintResultCertificate(examinationId, instituteId, isResultFresh);

                if (maidt == null || maidt.Rows.Count == 0)
                    return NotFound(ApiResponse<string>.ErrorResponse("No data found.", 404));


                while (maidt.Columns.Cast<DataColumn>().Count(c => c.ColumnName == "QRcode") > 1)
                {
                    maidt.Columns.RemoveAt(
                        maidt.Columns.Cast<DataColumn>()
                        .Select((c, i) => new { c, i })
                        .Last(x => x.c.ColumnName == "QRcode").i
                    );
                }

                var pdfList = new List<PdfEntry>();

                foreach (DataRow row in maidt.Rows)
                {
                    DataTable candidateDt = maidt.Clone();
                    candidateDt.ImportRow(row);

                    candidateDt.Rows[0]["QRcode"] =
                        GetQRCode(candidateDt.Rows[0]["QRcodeText"].ToString());

                    long applicationId = Convert.ToInt64(candidateDt.Rows[0]["ApplicationID"]);

                    DataTable dtSubject =
                        _examWorker.GetCandidatePrintBulkSubject(applicationId, examinationId, isResultFresh);

                    string reportPath = Path.Combine("RDLCReports", "StatementofMarksSystem.rdlc");

                    byte[] pdfBytes = RenderReportToPdf(
                        reportPath,
                        new[]
                        {
                            new ReportDataSource("Candidate", candidateDt),
                            new ReportDataSource("SubjectMarks", dtSubject)
                        },
                        new[]
                        {
                            new ReportParameter("UserLoginID", instituteId.ToString()),
                            new ReportParameter("TotalMax", candidateDt.Rows[0]["TotalMarksMax"].ToString()),
                            new ReportParameter("Totalmin", candidateDt.Rows[0]["TotalMarksMin"].ToString()),
                            new ReportParameter("TotalObt", candidateDt.Rows[0]["TotalMarksObt"].ToString()),
                            new ReportParameter("TotalGrace", candidateDt.Rows[0]["Grace"].ToString()),
                            new ReportParameter("OverallResult", candidateDt.Rows[0]["ResultStatus"].ToString()),
                            new ReportParameter("Percentage", candidateDt.Rows[0]["Percentage"].ToString()),
                            new ReportParameter("Grade", candidateDt.Rows[0]["Grade"].ToString()),
                            new ReportParameter("ResultDate", candidateDt.Rows[0]["ResultDate"].ToString())
                        }
                    );

                    pdfList.Add(new PdfEntry
                    {
                        FileName = candidateDt.Rows[0]["ApplicationIDDisplay"].ToString().Replace("/", "_")
                                  + $"_Result_{DateTime.Now:ddMMyyyyhhmmss}.pdf",
                        Bytes = pdfBytes
                    });
                }

                byte[] zipBytes = BuildZip(pdfList);

                return File(zipBytes, "application/zip",
                    $"{instituteId}_Result_{DateTime.Now:ddMMyyyyhhmmss}.zip");
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse(ex.Message, 500));
            }


        }


        [HttpGet("institute-certificate-pdf-zip")]
        public IActionResult InstituteCertificatePdfZip(
                int examinationId,
                long instituteId,
                string isResultFresh = "F")
        {
            try
            {
                DataTable maidt = _examWorker.InstitutePrintResultCertificate(
                    examinationId, instituteId, isResultFresh);

                var pdfList = new List<PdfEntry>();

                string reportPath = Path.Combine(
                    Directory.GetCurrentDirectory(),
                    "RDLCReports",
                    "CertificateSystem.rdlc"
                );

                foreach (DataRow row in maidt.Rows)
                {
                    if (row["ResultStatus"]?.ToString() != "Pass")
                        continue;

                    DataTable candidateDt = maidt.Clone();
                    candidateDt.ImportRow(row);

                    if (candidateDt.Rows.Count == 0)
                        continue;


                    var qrText = candidateDt.Rows[0]["QRcodeText"]?.ToString();
                    if (!string.IsNullOrEmpty(qrText))
                    {
                        candidateDt.Rows[0]["QRcode"] = GetQRCode(qrText);
                    }


                    DataTable subjectDt = _examWorker.GetCandidatePrintBulkSubject(
                        Convert.ToInt64(candidateDt.Rows[0]["ApplicationID"]),
                        examinationId,
                        isResultFresh
                    );

                    byte[] pdfBytes = RenderReportToPdf(
                        reportPath,
                        new[]
                        {
                new ReportDataSource("Candidate", candidateDt),
                new ReportDataSource("SubjectMarks", subjectDt)
                        },
                        new[]
                        {
                new ReportParameter(
                    "UserLoginID",
                    candidateDt.Rows[0]["ApplicationID"]?.ToString()
                )
                        }
                    );

                    pdfList.Add(new PdfEntry
                    {
                        FileName = candidateDt.Rows[0]["ApplicationIDDisplay"]
                                    .ToString()
                                    .Replace("/", "_")
                                    + $"_Certificate_{DateTime.Now:ddMMyyyyhhmmss}.pdf",

                        Bytes = pdfBytes
                    });
                }

                if (pdfList.Count == 0)
                {
                    return BadRequest(ApiResponse<string>.ErrorResponse(
                        "No passed candidates found.", 400));
                }

                byte[] zipBytes = BuildZip(pdfList);

                return File(
                    zipBytes,
                    "application/zip",
                    $"{instituteId}_Certificate_{DateTime.Now:ddMMyyyyhhmmss}.zip"
                );
            }
            catch (Exception ex)
            {
                return StatusCode(500,
                    ApiResponse<string>.ErrorResponse(
                        ex.InnerException?.Message ?? ex.Message,
                        500
                    ));
            }
        }
        [HttpGet("institute-pre-result-pdf")]
        public IActionResult InstitutePreResultPdf(int examinationId, long instituteId, string isResultFresh = "F")
        {
            try
            {
                DataTable maidt = _examWorker.InstituteBulkPrintResult21Century(
                    examinationId, instituteId, isResultFresh, 'R');

                if (maidt == null || maidt.Rows.Count == 0)
                    return NotFound("No data found");

                foreach (DataRow row in maidt.Rows)
                {
                    var qrText = row["QRcodeText"]?.ToString() ?? "";
                    row["QRcode"] = GetQRCode(qrText);
                }

                byte[] pdfBytes = RenderReportToPdf(
                    Path.Combine("RDLCReports", "BulkMarkSheetPrepintedTable.rdlc"),
                    new[]
                    {
                new ReportDataSource("CandidateSubject", maidt)
                    },
                    new[]
                    {
                new ReportParameter("UserLoginID", instituteId.ToString())
                    },
                    "1.5cm",
                    "1.5cm"
                );

                return File(pdfBytes, "application/pdf", "PreResult.pdf");
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("institute-pre-certificate-pdf")]
        public IActionResult InstitutePreCertificatePdf(int examinationId, long instituteId, string isResultFresh = "F")
        {
            try
            {
                DataTable maidt = _examWorker.InstituteBulkPrintResultLong(examinationId, instituteId, isResultFresh, 'C');

                foreach (DataRow row in maidt.Rows)
                    row["QRcode"] = GetQRCode(row["QRcodeText"].ToString());

                string reportPath = Path.Combine("RDLCReports", "BulkCertificatePrepintedTable.rdlc");

                byte[] pdfBytes = RenderReportToPdf(
                    reportPath,
                    new[] { new ReportDataSource("CandidateSubject", maidt) },
                    null,
                    "1.5cm", "1.5cm"
                );

                return File(pdfBytes, "application/pdf", "PreCertificate.pdf");
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse(ex.Message, 500));
            }
        }


        #region Supporting Types

        internal sealed class PdfEntry
        {
            public string FileName { get; set; }
            public byte[] Bytes { get; set; }
        }

        [HttpPut("UpdateSingleCandidateResultDate")]
        public IActionResult UpdateSingleCandidateResultDate([FromBody] UpdateCandidateResultDateRequest req)
        {
            if (req.CandidateId <= 0 || req.ApplicationId <= 0)
            {
                return BadRequest(ApiResponse<string>.ErrorResponse("Invalid candidate id or application id"));
            }
            try
            {
                var result = _examWorker.UpdateSingleCandidateResultDate(req.CandidateId, req.ApplicationId, req.CourseCompletionDate, req.CreatedBy, req.CreatedIpAddress);
                return Ok(ApiResponse<string>.SuccessResponse(result, "Candidate result date updated successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpPut("UpdateMultipleCandidatesResultDate")]
        public IActionResult UpdateMultipleCandidateResultDate([FromBody] UpdateMultipleCandidateResultDateRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.CandidateIds))
            {
                return BadRequest(ApiResponse<string>.ErrorResponse("Invalid candidate ids"));
            }
            try
            {
                var result = _examWorker.UpdateMultipleCandidateResultDate(
                    req.CandidateIds,
                    req.ApplicationId,
                    req.CourseCompletionDate,
                    req.CreatedBy,
                    req.CreatedIpAddress
                );
                return Ok(ApiResponse<int>.SuccessResponse(result, "Multiple candidate result dates updated successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }





        [HttpGet("batches-for-elective-subject-assign-previous")]
        public IActionResult GetBatchesForElectiveSubjectAssingForPreviousCandiates(long instituteId)
        {
            try
            {
                if (instituteId <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid institute ID.", 400));

                var result = _examWorker.GetBatchesForElectiveSubjectAssingForPreviousCandiates(instituteId);

                return Ok(ApiResponse<DataTable>.SuccessResponse(
                    result,
                    "Batches for elective subject assignment (previous candidates) retrieved successfully.",
                    200
                ));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse(
                    $"Internal server error: {ex.Message}",
                    500
                ));
            }
        }



        [HttpGet("backlog-candidate-for-elective-assign")]
        public IActionResult GetBacklogCandidateForElectiveAssignByBatchID(long batchId)
        {
            try
            {
                if (batchId <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid batch ID.", 400));

                var result = _examWorker.GetBacklogCandidateForElectiveAssignByBatchID(batchId);

                return Ok(ApiResponse<DataSet>.SuccessResponse(
                    result,
                    "Backlog candidates for elective assignment retrieved successfully.",
                    200
                ));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse(
                    $"Internal server error: {ex.Message}",
                    500
                ));
            }
        }

        //newly added for the Examination page 

        [HttpPost("save-examination-timetable")]
        public IActionResult SaveExaminationTimeTable([FromBody] List<ExamTimeTableEntity> entities)
        {
            try
            {
                if (entities == null || entities.Count == 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid request data.", 400));

                var result = _examWorker.SaveExaminationTimeTable(entities);
                return Ok(ApiResponse<string>.SuccessResponse(result, "Examination timetable saved successfully.", 201));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpGet("GetSavedExaminationTimeTable")]
        public IActionResult GetSavedExaminationTimeTable(long examinationId, long? examinationYearId, string courseCodes = null, string subjectCodes = null)   // ✅ default value makes it optional again
        {
            try
            {
                var result = _examWorker.GetSavedExaminationTimeTable(examinationId, examinationYearId, courseCodes, subjectCodes);

                if (result == null || result.Rows.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No records found.", 404));

                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Saved timetable retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal error: {ex.Message}", 500));
            }
        }

        [HttpPost("save-master-examination")]
        public IActionResult SaveMasterExamination([FromBody] MasterExaminationEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid request data.", 400));

                var result = _examWorker.SaveMasterExamination(entity);

                return Ok(
                    ApiResponse<string>.SuccessResponse(
                        result,
                        entity.IsUpdate
                            ? "Examination updated successfully."
                            : "Examination saved successfully.",
                        201
                    )
                );
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    ApiResponse<string>.ErrorResponse(
                        $"Internal server error: {ex.Message}",
                        500
                    )
                );
            }
        }
        [HttpPost("update-master-examination")]
        public IActionResult UpdateMasterExamination(
    [FromBody] MasterExaminationEntity entity)
        {
            try
            {
                if (entity == null || entity.ID <= 0)
                {
                    return BadRequest(
                        ApiResponse<string>.ErrorResponse(
                            "Invalid examination data.",
                            400
                        )
                    );
                }

                // Force update mode
                entity.IsUpdate = true;

                var result = _examWorker.SaveMasterExamination(entity);

                if (result == "-1")
                {
                    return Ok(
                        ApiResponse<string>.SuccessResponse(
                            result,
                            "Examination with the same name, year and exam type already exists.",
                            200
                        )
                    );
                }

                if (result == "0")
                {
                    return Ok(
                        ApiResponse<string>.SuccessResponse(
                            result,
                            "Examination record not found or not updated.",
                            200
                        )
                    );
                }

                return Ok(
                    ApiResponse<string>.SuccessResponse(
                        result,
                        "Examination updated successfully.",
                        200
                    )
                );
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    ApiResponse<string>.ErrorResponse(
                        $"Internal server error: {ex.Message}",
                        500
                    )
                );
            }
        }
    }




    #region Request Models
    #endregion

    #region Request Models

        public class SaveElectiveSubjectsRequest
    {
        public string XmlDoc { get; set; }
        public string ReportedBy { get; set; }
        public string ReportedByIPAddress { get; set; }
        public long BatchId { get; set; }
    }
    public class UpdateCandidateResultDateRequest
    {
        public long CandidateId { get; set; }
        public long ApplicationId { get; set; }
        public DateTime CourseCompletionDate { get; set; }
        public string CreatedBy { get; set; }
        public string CreatedIpAddress { get; set; }
    }

    public class UpdateMultipleCandidateResultDateRequest
    {
        public string CandidateIds { get; set; }
        public long ApplicationId { get; set; }
        public DateTime CourseCompletionDate { get; set; }
        public string CreatedBy { get; set; }
        public string CreatedIpAddress { get; set; }
    }
    //public class SaveElectiveSubjectsRequest
    //{
    //    public string XmlDoc { get; set; }
    //    public string ReportedBy { get; set; }
    //    public string ReportedByIPAddress { get; set; }
    //    public long BatchId { get; set; }
    //}

    public class UpdateCertificateStatusRequest
    {
        public string ProfileID { get; set; }
        public string Status { get; set; }
        public string UpdatedBy { get; set; }
        public DateTime? PrintedOn { get; set; }
    }


    public class SaveResultCorrectionRequest
    {
        public string UserLoginID { get; set; }
        public string IPAddress { get; set; }
        public long ApplicationID { get; set; }
        public long CandidateID { get; set; }
        public long ExaminationID { get; set; }
        public long CourseID { get; set; }
        public string ApplicationIDDisplay { get; set; }  // ← ADD THIS
        public string PhotoFilePath { get; set; }
        public string SignFilePath { get; set; }
        public string CommonDocument { get; set; }
        public string FirstName { get; set; }
        public string MiddleName { get; set; }
        public string LastName { get; set; }
        public string DateOfBirth { get; set; }
        public string MotherName { get; set; }
        public List<MarkItem> Marks { get; set; }
    }

    public class MarkItem
    {
        public string SubjectCode { get; set; }
        public string SubjectName { get; set; }
        public string SubjectTypeCode { get; set; }
        public decimal MaxMarks { get; set; }
        public decimal MinMarks { get; set; }
        public decimal ObtainedMarks { get; set; }
        public string Attendance { get; set; }
        public string Result { get; set; }
        public string Remark { get; set; }
        public long ExamMarksID { get; set; }
        public long ExamMarksDetilID { get; set; }
        public long ResultID { get; set; }
        public string DocumentURL { get; set; }
        public string AttendanceSheetURL { get; set; }
        public string EvaluationSheetURL { get; set; }
        public string ExaminationName { get; set; }
    }
    //public class SaveResultCorrectionRequest
    //{
    //    public string XMLString { get; set; }
    //    public string UserLoginID { get; set; }
    //    public string IPAddress { get; set; }
    //}

    public class UpdateCandidateResultRequest
    {
        public long ApplicationID { get; set; }
        public int ExaminationID { get; set; }
        public string UserLoginID { get; set; }
        public string IPAddress { get; set; }
    }

    public class UpdateCandidateResultRejectRequest
    {
        public long ApplicationID { get; set; }
        public int ExaminationID { get; set; }
        public string UserLoginID { get; set; }
        public string IPAddress { get; set; }
        public string RejectRemark { get; set; }
    }


}

    #endregion

    #region ApiResponse Class (if not already defined)



    #endregion







        #endregion
    

