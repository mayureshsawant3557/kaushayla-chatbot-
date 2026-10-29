using Admission.Business;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Reporting.NETCore;
using Microsoft.ReportingServices.ReportProcessing.ReportObjectModel;
using Portal.Business.Interface.Exam;
using Portal.Business.Worker.Utility;
using Portal.Entities.Account;
using Portal.Entities.Exam;
using Portal.Entities.ReportGenerator;
using Portal.Entities.ResponseBody;
using QRCoder;
using System;
using System.Data;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Net;
using System.Web;
using ZXing.QrCode.Internal;

namespace Portal.Server.Controllers.ReportGenerator
{
    [Route("api/[controller]")]
    [ApiController]
    public class SystemResultPDFController : ControllerBase
    {
        private readonly IExam _examWorker;

        public SystemResultPDFController(IExam examWorker)
        {
            _examWorker = examWorker ?? throw new ArgumentNullException(nameof(examWorker));
        }

        [AllowAnonymous]
        [HttpPost("GenerateResult")]
        public IActionResult GenerateResult(long candidateID)
        {
            try
            {
                // Step 2: Get candidate main result data
                var candidateResultData = GetCandidateResultData(candidateID);
                if (candidateResultData.ErrorResult != null)
                    return candidateResultData.ErrorResult;

                // Step 3: Extract essential IDs from candidate data for subject details
                var candidateRow = candidateResultData.Data.Rows[0];
                var extractedIds = ExtractRequiredIds(candidateRow, candidateID);

                // Step 4: Get subject-wise detailed marks
                var subjectDetailsData = GetSubjectDetailsData(extractedIds);
                if (subjectDetailsData.ErrorResult != null)
                    return subjectDetailsData.ErrorResult;

                // Step 5: Generate PDF report
                var ds = _examWorker.CandidatePrintResultCertificate(candidateID, extractedIds.ApplicationID, extractedIds.ExaminationID, "F");
                return GenerateResultpdf(ds.Tables[0], ds.Tables[1], extractedIds.ExaminationID, "F", extractedIds.UserLoginID);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "Unexpected error occurred during PDF generation",
                    error = ex.Message,
                    details = ex.InnerException?.Message,
                    timestamp = DateTime.Now
                });
            }
        }
        [AllowAnonymous]
        [HttpPost("GenerateCertificate")]
        public IActionResult GenerateCertificate(long candidateID)
        {
            try
            {
                // Get candidate main result data
                var candidateResultData = GetCandidateResultData(candidateID);
                if (candidateResultData.ErrorResult != null)
                    return candidateResultData.ErrorResult;

                // Extract essential IDs from candidate data for subject details
                var candidateRow = candidateResultData.Data.Rows[0];
                var extractedIds = ExtractRequiredIds(candidateRow, candidateID);

                // Generate PDF certificate
                var ds = _examWorker.CandidatePrintResultCertificate(candidateID, extractedIds.ApplicationID, extractedIds.ExaminationID, "F");
                return GenerateCertificatepdf(ds.Tables[0], ds.Tables[1], extractedIds.ExaminationID, "F", extractedIds.UserLoginID);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "Unexpected error occurred during certificate generation",
                    error = ex.Message,
                    details = ex.InnerException?.Message,
                    timestamp = DateTime.Now
                });
            }
        }

        #region Data Retrieval Methods

        private (DataTable Data, IActionResult ErrorResult) GetCandidateResultData(long candidateID)
        {
            try
            {
                var candidateData = _examWorker.GetCandidateResults(candidateID);

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

        private (DataTable Data, IActionResult ErrorResult) GetSubjectDetailsData(RequiredIds ids)
        {
            try
            {
                // Validate that we have the necessary IDs
                if (ids.ApplicationID <= 0)
                    return (null, BadRequest(new
                    {
                        message = "ApplicationID is required for subject details",
                        extractedIds = ids
                    }));

                if (ids.CourseID <= 0)
                    return (null, BadRequest(new
                    {
                        message = "CourseID is required for subject details",
                        extractedIds = ids
                    }));

                if (ids.ExaminationID <= 0)
                    return (null, BadRequest(new
                    {
                        message = "ExaminationID is required for subject details",
                        extractedIds = ids
                    }));

                // Log the IDs being used for debugging
                Console.WriteLine($"Getting subject details with ApplicationID: {ids.ApplicationID}, CourseID: {ids.CourseID}, ExaminationID: {ids.ExaminationID}");

                var subjectData = _examWorker.GetCandidateResultsDetails(
                    ids.ApplicationID,
                    ids.CourseID,
                    ids.ExaminationID);

                if (subjectData == null)
                {
                    return (null, NotFound(new
                    {
                        message = "No subject details found for the given parameters",
                        searchedWith = ids,
                        suggestion = "Check if the ApplicationID, CourseID, and ExaminationID combination exists in the database"
                    }));
                }

                if (subjectData.Rows.Count == 0)
                {
                    return (null, NotFound(new
                    {
                        message = "Subject details data is empty",
                        searchedWith = ids
                    }));
                }

                // Validate subject data columns
                var expectedSubjectColumns = new[] { "SubjectName", "SubjectCode", "MaxMarks", "ObtainedMarks" };
                var missingSubjectColumns = expectedSubjectColumns.Where(col => !subjectData.Columns.Contains(col)).ToList();

                if (missingSubjectColumns.Any())
                {
                    // Log warning but don't fail completely
                    Console.WriteLine($"Warning: Missing subject columns: {string.Join(", ", missingSubjectColumns)}");
                }

                Console.WriteLine($"Successfully retrieved {subjectData.Rows.Count} subject records");
                return (subjectData, null);
            }
            catch (Exception ex)
            {
                return (null, StatusCode(500, new
                {
                    message = "Error retrieving subject details",
                    error = ex.Message,
                    details = ex.InnerException?.Message,
                    parameters = new
                    {
                        ApplicationID = ids.ApplicationID,
                        CourseID = ids.CourseID,
                        ExaminationID = ids.ExaminationID,
                        CandidateID = ids.CandidateID
                    },
                    suggestion = "Verify that GetCandidateResultsDetails method works correctly with these parameters"
                }));
            }
        }

        #endregion

        #region PDF Generation Methods

        private IActionResult GenerateResultpdf(DataTable maidt, DataTable maidt2, Int32 ExaminationID, string IsResultFresh, long UserLoginID)
        {
            byte[] renderedBytes = Array.Empty<byte>();

            if (maidt.Rows.Count > 0)
            {
                for (int i = 0; i < maidt.Rows.Count; i++)
                {
                    DataTable CandidateDt = new DataTable();
                    CandidateDt = maidt.Clone();
                    CandidateDt.Rows.Add(maidt.Rows[i].ItemArray);

                    string format = "PDF";

                    LocalReport localReport = new LocalReport();
                    try
                    {
                        if (!SetupReport(localReport))
                            return NotFound(new { message = "Report template file not found" });

                        ReportDataSource reportDataSource = new ReportDataSource();
                        reportDataSource.Name = "StatementMarks";
                        (CandidateDt).Rows[0]["QRcode"] = GetQRCodeo(((CandidateDt).Rows[0]["QRcodeText"].ToString()));
                        localReport.DataSources.Add(new ReportDataSource("Candidate", CandidateDt));

                        localReport.DataSources.Add(new ReportDataSource("SubjectMarks", maidt2));
                        localReport.EnableExternalImages = true;
                        localReport.EnableHyperlinks = true;
                        ReportParameter[] para = new ReportParameter[9];
                        para[0] = new ReportParameter("UserLoginID", UserLoginID.ToString());
                        para[1] = new ReportParameter("TotalMax", CandidateDt.Rows[0]["TotalMarksMax"].ToString());
                        para[2] = new ReportParameter("Totalmin", CandidateDt.Rows[0]["TotalMarksMin"].ToString());
                        para[3] = new ReportParameter("TotalObt", CandidateDt.Rows[0]["TotalMarksObt"].ToString());
                        para[4] = new ReportParameter("TotalGrace", CandidateDt.Rows[0]["Grace"].ToString());
                        para[5] = new ReportParameter("OverallResult", CandidateDt.Rows[0]["ResultStatus"].ToString());
                        para[6] = new ReportParameter("Percentage", CandidateDt.Rows[0]["Percentage"].ToString());
                        para[7] = new ReportParameter("Grade", CandidateDt.Rows[0]["Grade"].ToString());
                        para[8] = new ReportParameter("ResultDate", CandidateDt.Rows[0]["ResultDate"].ToString());
                        localReport.SetParameters(para);

                        localReport.Refresh();

                        string FileName = CandidateDt.Rows[0]["ApplicationIDDisplay"] + "_StatementofMarks_" + DateTime.Now.ToString("ddMMyyyyhhmmss") + ".pdf";
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
                    }
                    catch (Exception ex)
                    {
                    }
                    finally
                    {
                        localReport.Dispose();
                        GC.SuppressFinalize(localReport);
                    }
                }
            }

            if (renderedBytes == null || renderedBytes.Length == 0)
                return StatusCode(500, new { message = "Failed to generate PDF - rendered bytes are empty" });

            string fileName = UserLoginID + "_StatementofMarks_" + DateTime.Now.ToString("ddMMyyyyhhmmss") + ".pdf";
            return File(renderedBytes, "application/pdf", fileName);
        }

        private IActionResult GenerateCertificatepdf(DataTable maidt, DataTable maidt2, Int32 ExaminationID, string IsResultFresh, long UserLoginID)
        {
            LocalReport localReport = new LocalReport();
            string format = "PDF";
            byte[] renderedBytes = null;

            try
            {
                string reportPath = Path.Combine("RDLCReports", "CertificateSystem.rdlc");
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
                           "  <MarginTop>0.3cm</MarginTop>" +
                           "  <MarginLeft>0.3cm</MarginLeft>" +
                           "  <MarginRight>0.3cm</MarginRight>" +
                           "  <MarginBottom>0.3cm</MarginBottom>" +
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

        private bool SetupReport(LocalReport localReport)
        {
            string reportPath = Path.Combine("RDLCReports", "StatementofMarksSystem.rdlc");

            if (!System.IO.File.Exists(reportPath))
                return false;

            localReport.ReportPath = reportPath;
            localReport.EnableExternalImages = true;
            localReport.EnableHyperlinks = true;

            return true;
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

        //

        //
        //
        //
        //
        [AllowAnonymous]
        [HttpPost("GenerateSignedVerificationCertificate")]
        public IActionResult GenerateSignedVerificationCertificate(long candidateID)
        {
            try
            {
                // Step 1: Get candidate main result data
                var candidateResultData = GetCandidateResultData(candidateID);
                if (candidateResultData.ErrorResult != null)
                    return candidateResultData.ErrorResult;

                // Step 2: Extract essential IDs from candidate data for subject details
                var candidateRow = candidateResultData.Data.Rows[0];
                var extractedIds = ExtractRequiredIds(candidateRow, candidateID);

                // Step 3: Get subject-wise detailed marks
                var subjectDetailsData = GetSubjectDetailsData(extractedIds);
                if (subjectDetailsData.ErrorResult != null)
                    return subjectDetailsData.ErrorResult;

                // Step 4: Get data for both result and certificate
                var ds = _examWorker.CandidatePrintResultCertificate(candidateID, extractedIds.ApplicationID, extractedIds.ExaminationID, "F");

                // Step 5: Generate individual PDF bytes
                var resultPdfBytes = GenerateResultPdfBytes(ds.Tables[0], ds.Tables[1], extractedIds.ExaminationID, "F", extractedIds.UserLoginID);
                if (resultPdfBytes == null || resultPdfBytes.Length == 0)
                    return StatusCode(500, new { message = "Failed to generate result PDF" });

                var certificatePdfBytes = GenerateCertificatePdfBytes(ds.Tables[0], ds.Tables[1], extractedIds.ExaminationID, "F", extractedIds.UserLoginID);
                if (certificatePdfBytes == null || certificatePdfBytes.Length == 0)
                    return StatusCode(500, new { message = "Failed to generate certificate PDF" });

                // Step 6: Merge PDFs into a single document
                var mergedPdfBytes = MergePdfDocuments(resultPdfBytes, certificatePdfBytes);
                if (mergedPdfBytes == null || mergedPdfBytes.Length == 0)
                    return StatusCode(500, new { message = "Failed to merge PDF documents" });

                // Step 7: Return the combined PDF
                string fileName = extractedIds.UserLoginID + "_SignedVerificationCertificate_" + DateTime.Now.ToString("ddMMyyyyhhmmss") + ".pdf";
                return File(mergedPdfBytes, "application/pdf", fileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "Unexpected error occurred during signed verification certificate generation",
                    error = ex.Message,
                    details = ex.InnerException?.Message,
                    timestamp = DateTime.Now
                });
            }
        }

        #region Helper Methods for Combined PDF Generation

        private byte[] GenerateResultPdfBytes(DataTable maidt, DataTable maidt2, Int32 ExaminationID, string IsResultFresh, long UserLoginID)
        {
            if (maidt.Rows.Count == 0)
                return null;

            DataTable CandidateDt = new DataTable();
            CandidateDt = maidt.Clone();
            CandidateDt.Rows.Add(maidt.Rows[0].ItemArray);

            LocalReport localReport = new LocalReport();
            try
            {
                if (!SetupReport(localReport))
                    return null;

                CandidateDt.Rows[0]["QRcode"] = GetQRCodeo(CandidateDt.Rows[0]["QRcodeText"].ToString());
                localReport.DataSources.Add(new ReportDataSource("Candidate", CandidateDt));
                localReport.DataSources.Add(new ReportDataSource("SubjectMarks", maidt2));

                ReportParameter[] para = new ReportParameter[9];
                para[0] = new ReportParameter("UserLoginID", UserLoginID.ToString());
                para[1] = new ReportParameter("TotalMax", CandidateDt.Rows[0]["TotalMarksMax"].ToString());
                para[2] = new ReportParameter("Totalmin", CandidateDt.Rows[0]["TotalMarksMin"].ToString());
                para[3] = new ReportParameter("TotalObt", CandidateDt.Rows[0]["TotalMarksObt"].ToString());
                para[4] = new ReportParameter("TotalGrace", CandidateDt.Rows[0]["Grace"].ToString());
                para[5] = new ReportParameter("OverallResult", CandidateDt.Rows[0]["ResultStatus"].ToString());
                para[6] = new ReportParameter("Percentage", CandidateDt.Rows[0]["Percentage"].ToString());
                para[7] = new ReportParameter("Grade", CandidateDt.Rows[0]["Grade"].ToString());
                para[8] = new ReportParameter("ResultDate", CandidateDt.Rows[0]["ResultDate"].ToString());
                localReport.SetParameters(para);

                localReport.Refresh();

                string deviceInfo = "<DeviceInfo>" +
                           "  <OutputFormat>PDF</OutputFormat>" +
                           "  <PageWidth>21cm</PageWidth>" +
                           "  <PageHeight>29.7cm</PageHeight>" +
                           "  <MarginTop>0.3cm</MarginTop>" +
                           "  <MarginLeft>0.3cm</MarginLeft>" +
                           "  <MarginRight>0.3cm</MarginRight>" +
                           "  <MarginBottom>0.3cm</MarginBottom>" +
                           "</DeviceInfo>";

                return localReport.Render("PDF", deviceInfo, out _, out _, out _, out _, out _);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error generating result PDF bytes: {ex.Message}");
                return null;
            }
            finally
            {
                localReport.Dispose();
                GC.SuppressFinalize(localReport);
            }
        }

        private byte[] GenerateCertificatePdfBytes(DataTable maidt, DataTable maidt2, Int32 ExaminationID, string IsResultFresh, long UserLoginID)
        {
            LocalReport localReport = new LocalReport();
            try
            {
                string reportPath = Path.Combine("RDLCReports", "CertificateSystem.rdlc");
                if (!System.IO.File.Exists(reportPath))
                    return null;

                localReport.ReportPath = reportPath;
                localReport.EnableExternalImages = true;
                localReport.EnableHyperlinks = true;

                maidt.Rows[0]["QRcode"] = GetQRCodeo(maidt.Rows[0]["QRcodeText"].ToString());

                localReport.DataSources.Add(new ReportDataSource("Candidate", maidt));
                localReport.DataSources.Add(new ReportDataSource("SubjectMarks", maidt2));

                ReportParameter[] para = new ReportParameter[1];
                para[0] = new ReportParameter("UserLoginID", UserLoginID.ToString());
                localReport.SetParameters(para);

                localReport.Refresh();

                string deviceInfo = "<DeviceInfo>" +
                                   "  <OutputFormat>PDF</OutputFormat>" +
                                   "  <PageWidth>21cm</PageWidth>" +
                                   "  <PageHeight>29.7cm</PageHeight>" +
                                   "  <MarginTop>0.3cm</MarginTop>" +
                                   "  <MarginLeft>0.3cm</MarginLeft>" +
                                   "  <MarginRight>0.3cm</MarginRight>" +
                                   "  <MarginBottom>0.3cm</MarginBottom>" +
                                   "</DeviceInfo>";

                return localReport.Render("PDF", deviceInfo, out _, out _, out _, out _, out _);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error generating certificate PDF bytes: {ex.Message}");
                return null;
            }
            finally
            {
                localReport.Dispose();
                GC.SuppressFinalize(localReport);
            }
        }

        private byte[] MergePdfDocuments(byte[] resultPdf, byte[] certificatePdf)
        {
            try
            {
                using (var outputStream = new MemoryStream())
                {
                    using (var resultDocument = new iTextSharp.text.Document())
                    {
                        using (var copy = new iTextSharp.text.pdf.PdfCopy(resultDocument, outputStream))
                        {
                            resultDocument.Open();

                            // Add result PDF
                            using (var resultReader = new iTextSharp.text.pdf.PdfReader(resultPdf))
                            {
                                copy.AddDocument(resultReader);
                                resultReader.Close();
                            }

                            // Add certificate PDF
                            using (var certificateReader = new iTextSharp.text.pdf.PdfReader(certificatePdf))
                            {
                                copy.AddDocument(certificateReader);
                                certificateReader.Close();
                            }

                            resultDocument.Close();
                        }
                    }
                    return outputStream.ToArray();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error merging PDF documents: {ex.Message}");
                return null;
            }
        }

        #endregion


        #endregion
    }

    public class RequiredIds
    {
        public long ApplicationID { get; set; }
        public long CourseID { get; set; }
        public int ExaminationID { get; set; }
        public long CandidateID { get; set; }
        public long UserLoginID { get; set; }
    }
}
