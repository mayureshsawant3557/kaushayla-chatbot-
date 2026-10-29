using Admission.Business;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Reporting.NETCore;
using Portal.Business.Interface.Administration;
using Portal.Business.Interface.Exam;
using Portal.Entities.Account;
using Portal.Entities.Exam;
using Portal.Entities.ResponseBody;
using QRCoder;
using Razorpay.Api;
using System.Data;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.IO.Compression;
using System.Net;

namespace Portal.Server.Controllers.Exam
{
    [ApiController]
    [Route("api/[controller]")]
    public class CMSExamController : ControllerBase
    {
        private readonly IExam _examWorker;
        private readonly IVerificationCertificate _verificationWorker;

        public CMSExamController(IExam examWorker, IVerificationCertificate verificationWorker)
        {
            _examWorker = examWorker ?? throw new ArgumentNullException(nameof(examWorker));
            _verificationWorker = verificationWorker ?? throw new ArgumentNullException(nameof(verificationWorker));


        }
        [HttpGet("AcademisthanCertificate_GetForPrinting")] //cms login
        public IActionResult AcademisthanCertificate_GetForPrinting()
        {
            //if (courseId < 0 || instituteId < 0)
            //{
            //    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid examination id or institute id"));
            //}
            try
            {
                var result = _examWorker.AcademisthanCertificate_GetForPrinting();
                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Academisthan certificate data for printing retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpPut("MarkCertificateAsPrinted")]  // cms login
        public IActionResult MarkCertificateAsPrinted([FromQuery] int id, [FromQuery] long candidate, [FromQuery] long applicationId)
        {
            if (id <= 0 || candidate <= 0 || applicationId <= 0)
            {
                return BadRequest(ApiResponse<string>.ErrorResponse("Invalid parameters"));
            }
            try
            {
                var result = _examWorker.MarkCertificateAsPrinted(id, candidate, applicationId);
                return Ok(ApiResponse<string>.SuccessResponse(result, "Certificate marked as printed successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }


        [HttpGet("GenerateCertificatePdf")]
        public IActionResult GenerateCertificatePdf([FromQuery] long applicationId, [FromQuery] long candidateId, [FromQuery] int examinationId, [FromQuery] string isResultFresh = "", [FromQuery] long userLoginId = 0)
        {
            if (applicationId <= 0)
                return BadRequest(ApiResponse<string>.ErrorResponse("Invalid applicationId"));

            try
            {
                DataSet ds = _examWorker.AcadmisthanCandidatePrintResultCertificate(candidateId, applicationId, examinationId, isResultFresh);

                if (ds == null || ds.Tables.Count == 0 || ds.Tables[0].Rows.Count == 0)
                    return NotFound(ApiResponse<string>.ErrorResponse("No certificate data found for the given parameters"));

                ds.Tables[0].Rows[0]["QRcode"] = GetQRCodeo(ds.Tables[0].Rows[0]["QRcodeText"].ToString());

                DataTable subjectData = _examWorker.GetCandidatePrintBulkSubject(applicationId, examinationId, isResultFresh);

                if (subjectData == null)
                    return StatusCode(500, ApiResponse<string>.ErrorResponse("No subject marks data found"));

                return GenerateCertificatespdf(ds.Tables[0], subjectData, userLoginId);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Error generating certificate PDF: {ex.Message}"));
            }
        }


        [HttpGet("BulkCertificatePdf")]
        public IActionResult BulkCertificatePdf([FromQuery] long certificateId, [FromQuery] string isResultFresh = "F")
        {
            if (certificateId <= 0)
                return BadRequest(ApiResponse<string>.ErrorResponse("Invalid certificateId"));

            try
            {
                DataTable maidt = _examWorker.AcadmisthanPrintResultCertificate(0, certificateId, isResultFresh);

                if (maidt == null || maidt.Rows.Count == 0)
                    return NotFound(ApiResponse<string>.ErrorResponse("No certificate data found"));

                return BulkCetrificateSystem(maidt);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}"));
            }
        }


        private IActionResult BulkCetrificateSystem(DataTable maidt)
        {
            LocalReport localReport = new LocalReport();
            try
            {
                string reportPath = Path.Combine( "RDLCReports","AcademisthanCertificatePrePrinted.rdlc");

                if (!System.IO.File.Exists(reportPath))
                    return StatusCode(500, ApiResponse<string>.ErrorResponse($"Report file not found: {reportPath}"));

                localReport.ReportPath = reportPath;

                foreach (DataRow row in maidt.Rows)
                    row["QRcode"] = GetQRCodeo(row["QRcodeText"].ToString());

                localReport.DataSources.Add(new ReportDataSource("CandidateSubject", maidt));
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

                byte[] renderedBytes = localReport.Render("PDF", deviceInfo);

                if (renderedBytes == null || renderedBytes.Length == 0)
                    return StatusCode(500, ApiResponse<string>.ErrorResponse("Failed to generate certificate PDF — rendered bytes are empty"));

                string fileName = maidt.Rows[0]["ApplicationIDDisplay"].ToString()
                                  + "_Certificate_"
                                  + DateTime.Now.ToString("ddMMyyyyhhmmss")
                                  + ".pdf";

                return File(renderedBytes, "application/pdf", fileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Error generating bulk certificate PDF: {ex.Message}"));
            }
            finally
            {
                localReport.Dispose();
                GC.SuppressFinalize(localReport);
            }
        }

        private IActionResult GenerateCertificatespdf(
            DataTable candidateData,
            DataTable subjectData,
            long userLoginId)
        {
            LocalReport localReport = new LocalReport();
            try
            {
                string reportPath = Path.Combine("RDLCReports","AcademisthanCertificateSystem.rdlc");

                if (!System.IO.File.Exists(reportPath))
                    return StatusCode(500, ApiResponse<string>.ErrorResponse($"Report file not found: {reportPath}"));

                localReport.ReportPath = reportPath;

                localReport.DataSources.Add(new ReportDataSource("Candidate", candidateData));
                localReport.DataSources.Add(new ReportDataSource("SubjectMarks", subjectData));
                localReport.EnableExternalImages = true;
                localReport.EnableHyperlinks = true;

                localReport.SetParameters(new[]
                {
                    new ReportParameter("UserLoginID", userLoginId.ToString())
                });

                localReport.Refresh();

                string deviceInfo =
                    "<DeviceInfo>" +
                    "  <OutputFormat>PDF</OutputFormat>" +
                    "  <PageWidth>21cm</PageWidth>" +
                    "  <PageHeight>29.7cm</PageHeight>" +
                    "  <MarginTop>0.5cm</MarginTop>" +
                    "  <MarginLeft>0.5cm</MarginLeft>" +
                    "  <MarginRight>0.5cm</MarginRight>" +
                    "  <MarginBottom>0.5cm</MarginBottom>" +
                    "</DeviceInfo>";

                byte[] renderedBytes = localReport.Render("PDF", deviceInfo);

                if (renderedBytes == null || renderedBytes.Length == 0)
                    return StatusCode(500, ApiResponse<string>.ErrorResponse("Failed to generate certificate PDF — rendered bytes are empty"));

                string fileName = userLoginId
                                  + "_Certificate_"
                                  + DateTime.Now.ToString("ddMMyyyyhhmmss")
                                  + ".pdf";

                return File(renderedBytes, "application/pdf", fileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse(
                    $"Error generating certificate PDF: {ex.Message}"));
            }
            finally
            {
                localReport.Dispose();
                GC.SuppressFinalize(localReport);
            }
        }


        private string GetQRCodeo(string candidateQRCode)
        {
            try
            {
                using QRCodeGenerator qrGenerator = new QRCodeGenerator();
                QRCodeData qrCodeData = qrGenerator.CreateQrCode(
                    candidateQRCode, QRCodeGenerator.ECCLevel.Q);
                Base64QRCode base64QrCode = new Base64QRCode(qrCodeData);
                return base64QrCode.GetGraphic(7);
            }
            catch
            {
                return string.Empty;
            }
        }

        private byte[] CreateZip(List<PDFEntity> pdfFiles)
        {
            using var compressedStream = new MemoryStream();
            using (var zip = new ZipArchive(compressedStream, ZipArchiveMode.Update, leaveOpen: true))
            {
                foreach (var pdf in pdfFiles)
                {
                    var entry = zip.CreateEntry(pdf.FileName + ".pdf");
                    using var original = new MemoryStream(pdf.PDFByte);
                    using var entryStream = entry.Open();
                    original.CopyTo(entryStream);
                }
            }
            return compressedStream.ToArray();
        }

        //newly added for the Examination page 

        [HttpGet("GetExaminationDuration")]
        public IActionResult GetExaminationDuration()
        {
            try

            {
                var result = _examWorker.GetExaminationDuration();

                if (result == null || result.Rows.Count == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No examination durations found.", 404));
                }

                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Examination durations retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpGet("GetExaminationCoursesByDuration")]
        public IActionResult GetExaminationCoursesByDuration(string fullDuration)
        {
            try
            {
                if (string.IsNullOrEmpty(fullDuration))
                {
                    return BadRequest(ApiResponse<object>.ErrorResponse("Duration parameter is required.", 400));
                }

                var result = _examWorker.GetExaminationCoursesByDuration(fullDuration);

                if (result == null || result.Rows.Count == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No courses found for this duration.", 404));
                }

                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Courses retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpGet("GetCourseSearchForExamination")]
        public IActionResult GetCourseSearchForExamination(string courseCode)
        {
            try
            {
                if (string.IsNullOrEmpty(courseCode))
                {
                    return BadRequest(ApiResponse<object>.ErrorResponse("CourseCode is required.", 400));
                }

                var result = _examWorker.GetCourseSearchForExamination(courseCode);

                if (result == null || result.Rows.Count == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No timetable found for this course.", 404));
                }

                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Timetable retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpGet("GetExaminationSubjectTypes")]
        public IActionResult GetExaminationSubjectTypes()
        {
            try
            {
                // Calling the repository method
                var result = _examWorker.GetExaminationSubjectType();

                // Check if the result is null or contains no rows
                if (result == null || result.Rows.Count == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No examination subject types found.", 404));
                }

                // Return the success response
                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Examination subject types retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                // Log the exception (recommended) and return a 500 error
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }


        [HttpGet("GetExaminationByCourseAndSubjectType")]
        public IActionResult GetExaminationByCourseAndSubjectType(string courseCodes, int? subjectTypeId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(courseCodes))
                    return BadRequest(ApiResponse<object>.ErrorResponse("CourseCode is required.", 400));

                // Now this passes the comma-separated string to the worker
                var result = _examWorker.GetExaminationByCourseAndSubjectType(courseCodes, subjectTypeId);

                if (result == null || result.Rows.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No records found.", 404));

                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Data retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal error: {ex.Message}", 500));
            }
        }

        [HttpGet("GetExaminationSubjectsName")]
        public IActionResult GetExaminationSubjects(string courseCode, string subjectTypeId = null)
        {
            try
            {
                if (string.IsNullOrEmpty(courseCode))
                {
                    return BadRequest(ApiResponse<object>.ErrorResponse("CourseCode is required.", 400));
                }

                var result = _examWorker.GetExaminationSubjects(courseCode, subjectTypeId);

                if (result == null || result.Rows.Count == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No subjects found for the given criteria.", 404));
                }

                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Examination subjects retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal error: {ex.Message}", 500));
            }
        }


        //[HttpGet("GetExaminationSubjectsName")]
        //public IActionResult GetExaminationSubjects(int examinationId, string courseCode, string subjectTypeId)
        //{
        //    try
        //    {
        //        if (examinationId <= 0 || string.IsNullOrEmpty(courseCode) || string.IsNullOrEmpty(subjectTypeId))
        //        {
        //            return BadRequest(ApiResponse<object>.ErrorResponse("ExaminationId, CourseCode and SubjectTypeID are required.", 400));
        //        }

        //        var result = _examWorker.GetExaminationSubjects(examinationId, courseCode, subjectTypeId);

        //        if (result == null || result.Rows.Count == 0)
        //        {
        //            return NotFound(ApiResponse<object>.ErrorResponse("No subjects found for the given criteria.", 404));
        //        }

        //        return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Examination subjects retrieved successfully.", 200));
        //    }
        //    catch (Exception ex)
        //    {
        //        return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal error: {ex.Message}", 500));
        //    }
        //}
        [HttpGet("GetExaminationsByYear")]
        public IActionResult GetExaminationsByYear(int yearId, int examTypeId)
        {
            try
            {
                if (yearId <= 0 || examTypeId <= 0)
                {
                    return BadRequest(ApiResponse<object>.ErrorResponse("Both YearId and ExamTypeID must be greater than 0.", 400));
                }

                var result = _examWorker.GetExaminationsByYear(yearId, examTypeId);

                if (result == null || result.Rows.Count == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No examinations found for the given criteria.", 404));
                }

                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Examinations retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpPost("save-subject-course-marks")]
        public IActionResult SaveSubjectCourseMarks([FromBody] List<SubjectCourseMarksEntity> entities)
        {
            try
            {
                if (entities == null || entities.Count == 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid request data.", 400));

                var result = _examWorker.SaveSubjectCourseMarks(entities);

                if (!string.Equals(result, "Updated", StringComparison.OrdinalIgnoreCase))
                    return Ok(ApiResponse<string>.ErrorResponse(result, 200));

                return Ok(ApiResponse<string>.SuccessResponse(result, "Subject course marks saved successfully.", 201));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpGet("GetSubjectMarksByCourseId")]
        public IActionResult GetSubjectMarksByCourseId(int courseId)
        {
            try
            {
                if (courseId <= 0)
                {
                    return BadRequest(ApiResponse<object>.ErrorResponse("CourseId is required.", 400));
                }

                var result = _examWorker.GetSubjectMarksByCourseId(courseId);

                if (result == null || result.Rows.Count == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No subject marks found for this course.", 404));
                }

                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Subject marks retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }


        [HttpPost("upload-examination-timetable")]
        public IActionResult UploadExaminationTimeTable([FromBody] List<ExamTimeTableUploadEntity> entities)
        {
            try
            {
                if (entities == null || entities.Count == 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid request data.", 400));

                // ✅ Read from the payload itself (same pattern as save-subject-course-marks),
                // instead of HttpContext.User / RemoteIpAddress which come back blank here.
                string userLoginID = entities.FirstOrDefault()?.UserLoginID ?? "";
                string ipAddress = entities.FirstOrDefault()?.IPAddress ?? "";

                var result = _examWorker.UploadExaminationTimeTable(entities, userLoginID, ipAddress);

                return Ok(ApiResponse<string>.SuccessResponse(result, "Examination timetable uploaded successfully.", 201));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpGet("GetExaminationRemainedToPublishResult")]
        public IActionResult GetExaminationRemainedToPublishResult([FromQuery] int examTypeID, [FromQuery] int examYearID, [FromQuery] long examinationID)
        {
            try
            {
                var result = _examWorker.GetExaminationRemainedToPublishResult(examTypeID, examYearID, examinationID);

                if (result == null)
                    return NotFound(ApiResponse<object>.ErrorResponse("No records found.", 404));

                return Ok(ApiResponse<DataSet>.SuccessResponse(result, "Data retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal error: {ex.Message}", 500));
            }
        }

        [HttpPost("PublishExamsResult")]
        public IActionResult PublishExamsResult([FromQuery] int examTypeID, [FromQuery] int examYearID, [FromQuery] long examinationID, [FromQuery] string resultDate, [FromQuery] string userLoginID, [FromQuery] string ipAddress)
        {
            try
            {
                if (examTypeID<=0 || examYearID<=0 || examinationID<=0)
                    return BadRequest(ApiResponse<object>.ErrorResponse("Invalid Parameters.", 400));

                var result = _examWorker.PublishExamsResult(examTypeID, examYearID, examinationID, resultDate, userLoginID, ipAddress);

                if (string.IsNullOrEmpty(result) || result == "N")
                    return BadRequest(ApiResponse<object>.ErrorResponse("Failed to Publish Result.", 400));

                return Ok(ApiResponse<object>.SuccessResponse(result, "Result Published successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal error: {ex.Message}", 500));
            }
        }

    }
}
