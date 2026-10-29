using Microsoft.AspNetCore.Mvc;
using Microsoft.Reporting.NETCore;
using Portal.Business.Interface.Admission;
using Portal.Business.Interface.Exam;
using Portal.Business.Worker.Utility;
using Portal.Entities.ResponseBody;
using Portal.Server.Controllers.ReportGenerator;
using QRCoder;
using System.Data;
using System.Net;

namespace Portal.Server.Controllers.Candidate
{
    [Route("api/[controller]")]
    [ApiController]
    public class CandidateBCLSController : ControllerBase
    {
        private readonly IExam _exam;
        private readonly IAdmission _admission;

        public CandidateBCLSController(IExam exam, IAdmission admission)
        {
            _exam = exam;
            _admission = admission;
        }

        [HttpGet("GetBCLSByCandidateIDCourseMappings")]
        public IActionResult GetBCLSByCandidateIDCourseMappings([FromQuery] long candidateID)
        {
            if (candidateID <= 0)
            {
                return BadRequest(ApiResponse<object>.ErrorResponse("Invalid CandidateID.", 400));
            }
            try
            {
                var result = _admission.GetBCLSByCandidateIDCourseMappings(candidateID);

                if (result == null)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No course mappings found for the given CandidateID.", 404));
                }

                return Ok(ApiResponse<object>.SuccessResponse(result, "Course mappings retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, nameof(GetBCLSByCandidateIDCourseMappings), candidateID.ToString());

                return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<object>.ErrorResponse("An unexpected error occurred while processing the request.", 500));
            }
        }
        [HttpGet("BCLSCandidatePrintResultCertificateByCandidateID")]
        public IActionResult BCLSCandidatePrintResultCertificateByCandidateID([FromQuery] long candidateID)
        {
            if (candidateID <= 0)
            {
                return BadRequest(ApiResponse<object>.ErrorResponse("Invalid CandidateID.", 400));
            }
            try
            {
                var result = _exam.BCLSCandidatePrintResultCertificateByCandidateID(candidateID);
                if (result == null)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No result certificate found for the given CandidateID.", 404));
                }
                return Ok(ApiResponse<object>.SuccessResponse(result, "Result certificate retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(
                    ex.Message,
                    nameof(BCLSCandidatePrintResultCertificateByCandidateID),
                    candidateID.ToString()
                );

                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    ApiResponse<object>.ErrorResponse("An unexpected error occurred while processing the request.", 500)
                );
            }

        }

        [HttpGet("GenerateCertificatepdf")]
        public IActionResult GenerateCertificatepdf([FromQuery] long candidateId, [FromQuery] long applicationId)
        {
            if (candidateId <= 0)
                return BadRequest(ApiResponse<object>.ErrorResponse("Invalid CandidateId.", 400));

            var candidateResultData = GetCandidateResultData(candidateId);
            if (candidateResultData.ErrorResult != null)
                return candidateResultData.ErrorResult;

            var candidateRow = candidateResultData.Data.Rows[0];
            var extractedIds = ExtractRequiredIds(candidateRow, candidateId);

            var subjectData = _exam.GetCandidatePrintBulkSubject(
                extractedIds.ApplicationID,
                extractedIds.ExaminationID,
                "F"
            );

            if (subjectData == null)
                return StatusCode(500, new { message = "No subject marks data found" });

            candidateResultData.Data.Rows[0]["QRcode"] =
                GetQRCodeo(candidateResultData.Data.Rows[0]["QRcodeText"].ToString());

            return GenerateCertificatespdf(
                candidateResultData.Data,
                subjectData,
                extractedIds.ExaminationID,
                "F",
                extractedIds.UserLoginID
            );
        }
        private (DataTable Data, IActionResult ErrorResult) GetCandidateResultData(long candidateID)
        {
            try
            {
                var candidateData = _exam.BCLSCandidatePrintResultCertificateByCandidateID(candidateID);

                if (candidateData == null)
                    return (null, NotFound(new
                    {
                        message = "No candidate result data found",
                        candidateID = candidateID,
                        suggestion = "Verify that the candidate ID exists and has result data available"
                    }));

                if (candidateData.Rows.Count == 0)
                    return (null, NotFound(new
                    {
                        message = "Candidate result data is empty",
                        candidateID = candidateID
                    }));

                // Validate essential columns exist - separate mandatory from optional
                var mandatoryColumns = new[] { "ApplicationID", "TotalMarksMax", "TotalMarksMin",
                    "TotalMarksObt", "ResultStatus", "Percentage", "Grade", "ResultDate" };

                // Include IDs that we need for subject details
                var neededForSubjects = new[] { "CourseID", "ExaminationID" };

                // Optional columns
                var optionalColumns = new[] { "Grace", "CandidatePhoto", "CandidateSign" };

                var missingMandatoryColumns = mandatoryColumns.Where(col => !candidateData.Columns.Contains(col)).ToList();
                if (missingMandatoryColumns.Any())
                    return (null, StatusCode(500, new
                    {
                        message = "Required mandatory columns missing from candidate data",
                        missingColumns = missingMandatoryColumns
                    }));

                // Check for columns needed for subject details (warn but don't fail)
                var missingSubjectIdColumns = neededForSubjects.Where(col => !candidateData.Columns.Contains(col)).ToList();
                if (missingSubjectIdColumns.Any())
                {
                    Console.WriteLine($"Warning: Missing columns for subject details: {string.Join(", ", missingSubjectIdColumns)}");
                    Console.WriteLine("Subject details will be fetched using request parameters");
                }

                // Add missing optional columns with default values
                foreach (var optionalCol in optionalColumns)
                {
                    if (!candidateData.Columns.Contains(optionalCol))
                    {
                        if (optionalCol == "Grace")
                        {
                            candidateData.Columns.Add(optionalCol, typeof(decimal));
                            foreach (DataRow row in candidateData.Rows)
                            {
                                row[optionalCol] = 0; // Default grace marks to 0
                            }
                        }
                        else
                        {
                            // For image path columns, add as string type
                            candidateData.Columns.Add(optionalCol, typeof(string));
                            foreach (DataRow row in candidateData.Rows)
                            {
                                row[optionalCol] = string.Empty; // Default to empty string for image paths
                            }
                        }
                    }
                }

                return (candidateData, null);
            }
            catch (InvalidOperationException ex)
            {
                return (null, StatusCode(500, new
                {
                    message = "Database operation failed - connection or configuration issue",
                    error = ex.Message,
                    suggestion = "Check database connection and accessibility"
                }));
            }
            catch (Exception ex)
            {
                return (null, StatusCode(500, new
                {
                    message = "Error retrieving candidate result data",
                    error = ex.Message,
                    candidateID = candidateID
                }));
            }
        }

        private RequiredIds ExtractRequiredIds(DataRow candidateRow, long candidateID)
        {
            // Extract IDs from candidate data first, then fallback to request
            var extractedIds = new RequiredIds
            {
                // Priority: Database data > Request data > 0
                ApplicationID = GetIdFromDataRow(candidateRow, "ApplicationID", 1),
                CourseID = GetIdFromDataRow(candidateRow, "CourseID", 1),
                ExaminationID = (int)GetIdFromDataRow(candidateRow, "ExaminationID", 1),
                UserLoginID = (int)GetIdFromDataRow(candidateRow, "ProfileNo", 1),
                CandidateID = candidateID // This should always come from request
            };

            return extractedIds;
        }

        private long GetIdFromDataRow(DataRow row, string columnName, long fallbackValue)
        {
            try
            {
                if (row.Table.Columns.Contains(columnName))
                {
                    var value = row[columnName];
                    if (value != null && value != DBNull.Value)
                    {
                        return Convert.ToInt64(value);
                    }
                }
                return fallbackValue > 0 ? fallbackValue : 0;
            }
            catch
            {
                return fallbackValue > 0 ? fallbackValue : 0;
            }
        }

        private string GetQRCodeo(string CandidateQRCode)
        {
            string TraineePhoto = "";
            WebClient request = new WebClient();
            try
            {
                ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;
                byte[] newFileData;
                try
                {
                    using (QRCodeGenerator qrGenerator = new QRCodeGenerator())
                    {
                        QRCodeData qrCodeData = qrGenerator.CreateQrCode(CandidateQRCode, QRCodeGenerator.ECCLevel.Q);
                        Base64QRCode base64QrCode = new QRCoder.Base64QRCode(qrCodeData);
                        TraineePhoto = base64QrCode.GetGraphic(7);
                    }
                }
                catch (WebException eep)
                {
                    String status = ((FtpWebResponse)eep.Response).StatusDescription;
                }
            }
            catch (WebException eep)
            {
                String status = ((FtpWebResponse)eep.Response).StatusDescription;
            }
            return TraineePhoto;
        }

        private IActionResult GenerateCertificatespdf(DataTable maidt, DataTable maidt2, Int32 ExaminationID, string IsResultFresh, long UserLoginID)
        {
            LocalReport localReport = new LocalReport();
            string format = "PDF";
            byte[] renderedBytes = null;

            try
            {
                string reportPath = Path.Combine("RDLCReports", "BCLSCertificateSystem.rdlc"); // change the name of rdlc file-----------------------
                if (!System.IO.File.Exists(reportPath))
                    return NotFound(new { message = "Certificate template file not found" });

                localReport.ReportPath = reportPath;
                ReportDataSource reportDataSource = new ReportDataSource();
                reportDataSource.Name = "StatementMarks";

                maidt.Rows[0]["QRcode"] = GetQRCodeo(maidt.Rows[0]["QRcodeText"].ToString());

                localReport.DataSources.Add(new ReportDataSource("Candidate", maidt));
                localReport.DataSources.Add(new ReportDataSource("SubjectMarks", maidt2));
                localReport.EnableExternalImages = true;
                localReport.EnableHyperlinks = true;

                ReportParameter[] para = new ReportParameter[1];
                para[0] = new ReportParameter("UserLoginID", UserLoginID.ToString());
                localReport.SetParameters(para);

                localReport.Refresh();

                string FileName = UserLoginID + "_Certificate_" + DateTime.Now.ToString("ddMMyyyyhhmmss") + ".pdf";
                format = format.ToUpperInvariant();
                string reportType;
                string deviceInfo;
                if (format == "PDF")
                {
                    reportType = "PDF";
                    deviceInfo = "<DeviceInfo>" +
                                 "  <OutputFormat>PDF</OutputFormat>" +
                                 "  <PageWidth>21cm</PageWidth>" +
                                 "  <PageHeight>29.7cm</PageHeight>" +
                                 "  <MarginTop>0.5cm</MarginTop>" +
                                 "  <MarginLeft>0.5cm</MarginLeft>" +
                                 "  <MarginRight>0.5cm</MarginRight>" +
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
                    deviceInfo = "<DeviceInfo>" +
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
                renderedBytes = localReport.Render(reportType, deviceInfo, out mimeType, out encoding, out fileNameExtension, out streams, out warnings);

                if (renderedBytes == null || renderedBytes.Length == 0)
                    return StatusCode(500, new { message = "Failed to generate certificate PDF - rendered bytes are empty" });

                return File(renderedBytes, "application/pdf", FileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error generating certificate PDF", error = ex.Message });
            }
            finally
            {
                localReport.Dispose();
                GC.SuppressFinalize(localReport);
            }
        }
    }
}
