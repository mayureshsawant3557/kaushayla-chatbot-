using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Reporting.NETCore;
using Portal.Business;
using Portal.Entities;
using Portal.Entities.ResponseBody;
using QRCoder;
using System;
using System.Data;
using System.IO.Compression;
using System.Net;
using System.Security.Claims;

namespace Portal.Server.Controllers.STT
{
    /* =========================================================================
       Module : STT -> Batch Result Report
       File   : Portal.Server/Controllers/STT/STTBatchResultReportController.cs
       Route  : api/STTBatchResultReport/...   (JWT-protected by the global
                AuthorizeFilter; no [Authorize] needed).
       Pattern: mirrors STTController — IActionResult + ApiResponse<T>, claim
                fallback for the current user, filters via GET, data via POST.
       ========================================================================= */
    [Route("api/[controller]")]
    [ApiController]
    public class STTBatchResultReportController : ControllerBase
    {
        private readonly ISTTBatchResultReport _service;

        public STTBatchResultReportController(ISTTBatchResultReport service)
        {
            _service = service;
        }

        /// <summary>Cascading filter source rows (6 tables in one DataSet).</summary>
        [HttpGet("filters")]
        public IActionResult GetFilters([FromQuery] int userTypeID, [FromQuery] string userLoginID,
                                        [FromQuery] int regionID = 0, [FromQuery] int districtID = 0)
        {
            try
            {
                var typeId = userTypeID > 0 ? userTypeID : GetUserTypeId();
                var loginId = string.IsNullOrWhiteSpace(userLoginID) ? GetUserLoginId() : userLoginID;

                var result = _service.GetFilters(typeId, loginId, regionID, districtID);
                return Ok(ApiResponse<DataSet>.SuccessResponse(result, "Filters retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        /// <summary>KPI card values (single-row DataTable).</summary>
        [HttpPost("summary")]
        public IActionResult GetSummary([FromBody] STTBatchResultReportRequest request)
        {
            try
            {
                ApplyUserContext(request);
                var result = _service.GetSummary(request);
                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Summary retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        /// <summary>Paged / sorted / searched batch grid (rows + total count).</summary>
        [HttpPost("batch-list")]
        public IActionResult GetBatchList([FromBody] STTBatchResultReportRequest request)
        {
            try
            {
                ApplyUserContext(request);
                var result = _service.GetBatchList(request);
                return Ok(ApiResponse<DataSet>.SuccessResponse(result, "Batch list retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        /// <summary>Drill-down: candidates of a batch (lazy loaded on batch click).
        /// GET with a {batchId:long} route param — mirrors the proven STTController
        /// "candidates/{batchId:long}" pattern (avoids POST-body binding issues with
        /// large numeric ids).</summary>
        [HttpGet("batch-candidates/{batchId:long}")]
        public IActionResult GetBatchCandidates(long batchId,
                                                [FromQuery] string searchText = null,
                                                [FromQuery] string sortColumn = "CandidateName",
                                                [FromQuery] string sortDirection = "ASC",
                                                [FromQuery] int pageNumber = 1,
                                                [FromQuery] int pageSize = 0)
        {
            try
            {
                if (batchId <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("A valid Batch is required.", 400));

                var request = new STTBatchCandidateReportRequest
                {
                    BatchID = batchId,
                    UserTypeID = GetUserTypeId(),
                    UserLoginID = GetUserLoginId(),
                    SearchText = searchText,
                    SortColumn = sortColumn,
                    SortDirection = sortDirection,
                    PageNumber = pageNumber,
                    PageSize = pageSize
                };

                var result = _service.GetBatchCandidates(request);
                return Ok(ApiResponse<DataSet>.SuccessResponse(result, "Batch candidates retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        /// <summary>Save the certificate "Printed On" date for a batch
        /// (ExamSTT_AssessmentHeader.PrintDate). Body: { batchID, printedDate }.</summary>
        [HttpPost("UpdateBatchPrintedDate")]
        public IActionResult UpdateBatchPrintedDate([FromBody] STTBatchCertificateDateRequest request)
        {
            if (request == null || request.BatchID <= 0)
                return BadRequest(ApiResponse<string>.ErrorResponse("A valid Batch is required.", 400));
            if (!request.PrintedDate.HasValue)
                return BadRequest(ApiResponse<string>.ErrorResponse("Printed On date is required.", 400));

            try
            {
                request.DispatchDate = null;               // this endpoint touches only PrintDate
                ApplyAuditContext(request);
                var result = _service.UpdateBatchCertificateDates(request);
                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Printed On date saved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        /// <summary>Save the certificate "Dispatched On" date for a batch
        /// (ExamSTT_AssessmentHeader.DispatchDate). Body: { batchID, dispatchDate }.</summary>
        [HttpPost("UpdateBatchDispatchDate")]
        public IActionResult UpdateBatchDispatchDate([FromBody] STTBatchCertificateDateRequest request)
        {
            if (request == null || request.BatchID <= 0)
                return BadRequest(ApiResponse<string>.ErrorResponse("A valid Batch is required.", 400));
            if (!request.DispatchDate.HasValue)
                return BadRequest(ApiResponse<string>.ErrorResponse("Dispatched On date is required.", 400));

            try
            {
                request.PrintedDate = null;                // this endpoint touches only DispatchDate
                ApplyAuditContext(request);
                var result = _service.UpdateBatchCertificateDates(request);
                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Dispatched On date saved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        /// <summary>Result sheet PDF for a batch. Renders MOBWCResultSheet.rdlc
        /// (datasets "OBWCAttendanceResult" + "OBWCAttendanceResultCandidates")
        /// from ExamSTT_BatchResultReport_GetResultSheet. Body: { batchID }.</summary>
        [HttpPost("GetBatchWiseResultSheet")]
        public IActionResult GetBatchWiseResultSheet([FromBody] BatchCertificateRequest request)
        {
            if (request == null || request.BatchID <= 0)
                return BadRequest(ApiResponse<string>.ErrorResponse("Invalid BatchID.", 400));

            DataSet ds;
            try
            {
                ds = _service.GetBatchResultSheet(request.BatchID);
            }
            catch (Exception)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse("Internal server error.", 500));
            }

            if (ds == null || ds.Tables.Count < 2 || ds.Tables[0].Rows.Count == 0)
                return NotFound(ApiResponse<string>.ErrorResponse("No data found for this batch.", 404));

            string reportPath = Path.Combine("RDLCReports", "STEPResultSheet.rdlc");
            if (!System.IO.File.Exists(reportPath))
                return StatusCode(500, ApiResponse<string>.ErrorResponse("Result sheet template not found.", 500));

            try
            {
                using (LocalReport localReport = new LocalReport())
                {
                    localReport.ReportPath = reportPath;
                    localReport.DataSources.Add(new ReportDataSource("OBWCAttendanceResult", ds.Tables[0]));
                    localReport.DataSources.Add(new ReportDataSource("OBWCAttendanceResultCandidates", ds.Tables[1]));
                    localReport.EnableExternalImages = true;
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

                    byte[] pdfBytes = localReport.Render(
                        "PDF",
                        deviceInfo,
                        out string mimeType,
                        out string encoding,
                        out string fileNameExtension,
                        out string[] streams,
                        out Warning[] warnings);

                    return File(pdfBytes, "application/pdf", $"Batch_{request.BatchID}_ResultSheet.pdf");
                }
            }
            catch (Exception)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse("Failed to generate the result sheet.", 500));
            }
        }

        /// <summary>Dispatch slip PDF for a batch. Renders MOBWCDispatchSlip.rdlc
        /// (dataset "OBWCCertificate") from ExamSTT_BatchResultReport_GetDispatchSlip.
        /// Body: { batchID }. Returns a single PDF.</summary>
        [HttpPost("GetBatchDispatchSlip")]
        public IActionResult GetBatchDispatchSlip([FromBody] BatchCertificateRequest request)
        {
            if (request == null || request.BatchID <= 0)
                return BadRequest(ApiResponse<string>.ErrorResponse("Invalid BatchID.", 400));

            DataTable dt;
            try
            {
                dt = _service.GetBatchDispatchSlip(request.BatchID);
            }
            catch (Exception)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse("Internal server error.", 500));
            }

            if (dt == null || dt.Rows.Count == 0)
                return NotFound(ApiResponse<string>.ErrorResponse("No data found for this batch.", 404));

            string reportPath = Path.Combine("RDLCReports", "STEPDispatchSlip.rdlc");
            if (!System.IO.File.Exists(reportPath))
                return StatusCode(500, ApiResponse<string>.ErrorResponse("Dispatch slip template not found.", 500));

            try
            {
                using (LocalReport localReport = new LocalReport())
                {
                    localReport.ReportPath = reportPath;
                    localReport.DataSources.Add(new ReportDataSource("OBWCCertificate", dt));
                    localReport.EnableExternalImages = true;
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

                    byte[] pdfBytes = localReport.Render(
                        "PDF",
                        deviceInfo,
                        out string mimeType,
                        out string encoding,
                        out string fileNameExtension,
                        out string[] streams,
                        out Warning[] warnings);

                    return File(pdfBytes, "application/pdf", $"Batch_{request.BatchID}_DispatchSlip.pdf");
                }
            }
            catch (Exception)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse("Failed to generate the dispatch slip.", 500));
            }
        }

        // ---- helpers ---------------------------------------------------------

        /// <summary>Audit trail for the certificate date updates: who + from
        /// where, taken from the JWT and the connection (never the client body).</summary>
        private void ApplyAuditContext(STTBatchCertificateDateRequest request)
        {
            request.ModifiedBy = GetUserLoginId();
            request.ModifiedIP = HttpContext.Connection.RemoteIpAddress?.ToString();
        }

        /// <summary>Fill UserTypeID / UserLoginID from the JWT when the client
        /// did not supply them, so role scoping cannot be spoofed away.</summary>
        private void ApplyUserContext(STTBatchResultReportRequest request)
        {
            if (request == null) return;
            if (request.UserTypeID <= 0) request.UserTypeID = GetUserTypeId();
            if (string.IsNullOrWhiteSpace(request.UserLoginID)) request.UserLoginID = GetUserLoginId();
        }

        private int GetUserTypeId()
        {
            var claim = User.FindFirstValue("userTypeID") ?? User.FindFirstValue("UserTypeID");
            return int.TryParse(claim, out var id) ? id : 0;
        }

        private string GetUserLoginId()
        {
            return User.FindFirstValue("userLoginId")
                   ?? User.FindFirstValue(ClaimTypes.Name)
                   ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
        }

        //test 

        //[AllowAnonymous]
        //[HttpPost("GetBatchWiseSystemCertificate")]
        //public IActionResult GetBatchWiseSystemCertificate([FromBody] BatchCertificateRequest request)
        //{
        //    try
        //    {
        //        if (request.BatchID <= 0)
        //        {
        //            return BadRequest(ApiResponse<string>.ErrorResponse("Invalid BatchID.", 400));
        //        }

        //        // Get complete certificate da
        //        DataTable maindt = _service.GetBatchWiseSystemCertificate(request.BatchID);

        //        if (maindt == null || maindt.Rows.Count == 0)
        //        {
        //            return NotFound(ApiResponse<string>.ErrorResponse("No data found.", 404));
        //        }

        //        List<PDFEntity> pdfList = new List<PDFEntity>();

        //        foreach (DataRow row in maindt.Rows)
        //        {
        //            if (row["ResultStatus"]?.ToString() == "PASS")
        //            {
        //                DataTable candidateDt = maindt.Clone();
        //                candidateDt.Rows.Add(row.ItemArray);

        //                LocalReport localReport = new LocalReport();

        //                try
        //                {
        //                    // RDLC Path

        //                    string reportPath = Path.Combine(

        //                        "RDLCReports",
        //                        "CertificateSystem.rdlc"
        //                    );

        //                    localReport.ReportPath = reportPath;

        //                    // QR Code
        //                    candidateDt.Rows[0]["QRcode"] =
        //                        GetQRCodeo(candidateDt.Rows[0]["QRcodeText"].ToString());

        //                    // Candidate Dataset
        //                    localReport.DataSources.Add(
        //                        new ReportDataSource("Candidate", candidateDt)
        //                    );

        //                    // Subject Dataset
        //                    //DataTable dtSubject = _service.GetCandidatePrintBulkSubject(
        //                    //    Convert.ToInt64(candidateDt.Rows[0]["ApplicationID"]),
        //                    //    request.ExaminationID,
        //                    //    request.IsResultFresh
        //                    //);

        //                    //localReport.DataSources.Add(
        //                    //    new ReportDataSource("SubjectMarks", dtSubject)
        //                    //);

        //                    localReport.EnableExternalImages = true;
        //                    localReport.EnableHyperlinks = true;

        //                    // Parameters
        //                    ReportParameter[] para = new ReportParameter[1];
        //                    para[0] = new ReportParameter(
        //                        "UserLoginID",
        //                        candidateDt.Rows[0]["ApplicationID"].ToString()
        //                    );

        //                    localReport.SetParameters(para);

        //                    localReport.Refresh();

        //                    string mimeType;
        //                    string encoding;
        //                    string fileNameExtension;
        //                    Warning[] warnings;
        //                    string[] streams;

        //                    string deviceInfo =
        //                        "<DeviceInfo>" +
        //                        "  <OutputFormat>PDF</OutputFormat>" +
        //                        "  <PageWidth>21cm</PageWidth>" +
        //                        "  <PageHeight>29.7cm</PageHeight>" +
        //                        "  <MarginTop>0.5cm</MarginTop>" +
        //                        "  <MarginLeft>0.5cm</MarginLeft>" +
        //                        "  <MarginRight>0.5cm</MarginRight>" +
        //                        "  <MarginBottom>0.5cm</MarginBottom>" +
        //                        "</DeviceInfo>";

        //                    byte[] renderedBytes = localReport.Render(
        //                        "PDF",
        //                        deviceInfo,
        //                        out mimeType,
        //                        out encoding,
        //                        out fileNameExtension,
        //                        out streams,
        //                        out warnings
        //                    );

        //                    PDFEntity pdfEntity = new PDFEntity
        //                    {
        //                        FileName =
        //                            candidateDt.Rows[0]["ApplicationIDDisplay"]
        //                                .ToString()
        //                                .Replace("/", "_")
        //                            + "_Certificate.pdf",

        //                        PDFByte = renderedBytes
        //                    };

        //                    pdfList.Add(pdfEntity);
        //                }
        //                finally
        //                {
        //                    localReport.Dispose();
        //                    GC.SuppressFinalize(localReport);
        //                }
        //            }
        //        }

        //        // Create ZIP
        //        byte[] zipBytes = CreateZip(pdfList);

        //        return File(
        //            zipBytes,
        //            "application/zip",
        //            $"Batch_{request.BatchID}_Certificates.zip"
        //        );
        //    }
        //    catch (Exception ex)
        //    {
        //        return StatusCode(
        //            500,
        //            ApiResponse<string>.ErrorResponse(
        //                $"Internal server error : {ex.Message}",
        //                500
        //            )
        //        );
        //    }
        //}


        //private byte[] CreateZip(List<PDFEntity> pdfFiles)
        //{
        //    using (MemoryStream memoryStream = new MemoryStream())
        //    {
        //        using (ZipArchive archive = new ZipArchive(memoryStream, ZipArchiveMode.Create, true))
        //        {
        //            foreach (var file in pdfFiles)
        //            {
        //                var zipEntry = archive.CreateEntry(file.FileName);

        //                using (var entryStream = zipEntry.Open())
        //                {
        //                    entryStream.Write(file.PDFByte, 0, file.PDFByte.Length);
        //                }
        //            }
        //        }

        //        return memoryStream.ToArray();
        //    }
        //}

        //private string GetQRCodeo(string CandidateQRCode)
        //{
        //    string traineePhoto = "";

        //    try
        //    {
        //        ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;

        //        using (QRCodeGenerator qrGenerator = new QRCodeGenerator())
        //        {
        //            QRCodeData qrCodeData = qrGenerator.CreateQrCode(
        //                CandidateQRCode,
        //                QRCodeGenerator.ECCLevel.Q
        //            );

        //            Base64QRCode base64QrCode = new Base64QRCode(qrCodeData);

        //            traineePhoto = base64QrCode.GetGraphic(7);
        //        }
        //    }
        //    catch (Exception)
        //    {
        //    }

        //    return traineePhoto;
        //}


        [AllowAnonymous]
        [HttpPost("GetBatchWiseSystemCertificate")]
        public IActionResult GetBatchWiseSystemCertificate([FromBody] BatchCertificateRequest request)
        {
            if (request.BatchID <= 0)
            {
                return BadRequest(ApiResponse<string>.ErrorResponse("Invalid BatchID.", 400));
            }

            DataTable maindt;
            try
            {
                maindt = _service.GetBatchWiseSystemCertificate(request.BatchID);
            }
            catch (Exception ex)
            {
                //_logger.LogError(ex, "Failed to fetch certificate data for BatchID {BatchID}", request.BatchID);
                return StatusCode(500, ApiResponse<string>.ErrorResponse("Internal server error.", 500));
            }

            if (maindt == null || maindt.Rows.Count == 0)
            {
                return NotFound(ApiResponse<string>.ErrorResponse("No data found.", 404));
            }

            string reportPath = Path.Combine("RDLCReports", "STEPCertificateSystem.rdlc");

            if (!System.IO.File.Exists(reportPath))
            {
              //  _logger.LogError("RDLC report file not found at {Path}", reportPath);
                return StatusCode(500, ApiResponse<string>.ErrorResponse("Internal server error.", 500));
            }

            var pdfList = new List<PDFEntity>();
            var failedApplications = new List<string>();

            foreach (DataRow row in maindt.Rows)
            {
                if (row["ResultStatus"]?.ToString() != "PASS")
                {
                    continue;
                }

                // Per-candidate request: skip everyone except the requested candidate.
                if (request.ApplicationID.HasValue &&
                    Convert.ToInt64(row["ApplicationID"]) != request.ApplicationID.Value)
                {
                    continue;
                }

                string applicationIdDisplay = row["ApplicationIDDisplay"]?.ToString() ?? "Unknown";

                try
                {
                    DataTable candidateDt = maindt.Clone();
                    candidateDt.Rows.Add(row.ItemArray);

                    using (LocalReport localReport = new LocalReport())
                    {
                        localReport.ReportPath = reportPath;

                        string qrText = candidateDt.Rows[0]["QRcodeText"]?.ToString() ?? string.Empty;
                        candidateDt.Rows[0]["QRcode"] = GetQRCode(qrText, applicationIdDisplay);

                        localReport.DataSources.Add(new ReportDataSource("Candidate", candidateDt));
                        // After line 402, add:
                        var emptyDataTable = new DataTable("SubjectMarks");
                        localReport.DataSources.Add(new ReportDataSource("SubjectMarks", emptyDataTable));

                        localReport.EnableExternalImages = true;
                        localReport.EnableHyperlinks = true;

                        ReportParameter[] para = new ReportParameter[]
                        {
                    new ReportParameter("UserLoginID", candidateDt.Rows[0]["ApplicationID"].ToString())
                        };
                        localReport.SetParameters(para);

                        localReport.Refresh();

                        string deviceInfo =
                            "<DeviceInfo>" +
                            "  <OutputFormat>PDF</OutputFormat>" +
                            "  <PageWidth>21cm</PageWidth>" +
                            "  <PageHeight>29.7cm</PageHeight>" +
                            "  <MarginTop>0.3cm</MarginTop>" +
                            "  <MarginLeft>0.3cm</MarginLeft>" +
                            "  <MarginRight>0.3cm</MarginRight>" +
                            "  <MarginBottom>0.3cm</MarginBottom>" +
                            "</DeviceInfo>";

                        byte[] renderedBytes = localReport.Render(
                            "PDF",
                            deviceInfo,
                            out string mimeType,
                            out string encoding,
                            out string fileNameExtension,
                            out string[] streams,
                            out Warning[] warnings);

                        if (warnings != null)
                        {
                            foreach (var w in warnings)
                            {
                                //_logger.LogWarning(
                                //    "RDLC warning for ApplicationID {AppId}: {Message}",
                                //    applicationIdDisplay, w.Message);
                            }
                        }


                        pdfList.Add(new PDFEntity
                        {
                            FileName = MakeSafeFileName(applicationIdDisplay) + "_Certificate.pdf",
                            PDFByte = renderedBytes
                        });
                    }
                }
                catch (Exception ex)
                {
                    //_logger.LogError(ex,
                    //    "Failed to generate certificate for ApplicationID {AppId} in BatchID {BatchID}",
                    //    applicationIdDisplay, request.BatchID);
                    //failedApplications.Add(applicationIdDisplay);
                    // continue processing remaining candidates
                }
            }

            if (pdfList.Count == 0)
            {
                return StatusCode(500,
                    ApiResponse<string>.ErrorResponse("Failed to generate any certificates for this batch.", 500));
            }

            // Per-candidate request (drawer): return the single PDF directly, no zip.
            if (request.ApplicationID.HasValue && pdfList.Count == 1)
            {
                return File(pdfList[0].PDFByte, "application/pdf", pdfList[0].FileName);
            }

            byte[] zipBytes;
            try
            {
                zipBytes = CreateZip(pdfList);
            }
            catch (Exception ex)
            {
                //_logger.LogError(ex, "Failed to create zip for BatchID {BatchID}", request.BatchID);
                return StatusCode(500, ApiResponse<string>.ErrorResponse("Internal server error.", 500));
            }

            //if (failedApplications.Count > 0)
            //{
            //    _logger.LogWarning(
            //        "BatchID {BatchID} completed with {FailedCount} failed certificate(s): {Failed}",
            //        request.BatchID, failedApplications.Count, string.Join(", ", failedApplications));
            //}

            return File(zipBytes, "application/zip", $"Batch_{request.BatchID}_Certificates.zip");
        }

        [AllowAnonymous]
        [HttpPost("GetBatchWisePrePrintedCertificate")]
        public IActionResult GetBatchWisePrePrintedCertificate([FromBody] BatchCertificateRequest request)
        {
            if (request.BatchID <= 0)
            {
                return BadRequest(ApiResponse<string>.ErrorResponse("Invalid BatchID.", 400));
            }

            DataTable maindt;
            try
            {
                maindt = _service.GetBatchWiseSystemCertificate(request.BatchID);
            }
            catch (Exception ex)
            {
                //_logger.LogError(ex, "Failed to fetch certificate data for BatchID {BatchID}", request.BatchID);
                return StatusCode(500, ApiResponse<string>.ErrorResponse("Internal server error.", 500));
            }

            if (maindt == null || maindt.Rows.Count == 0)
            {
                return NotFound(ApiResponse<string>.ErrorResponse("No data found.", 404));
            }

            string reportPath = Path.Combine("RDLCReports", "STEPPrePrintedCertificateSystem.rdlc");

            if (!System.IO.File.Exists(reportPath))
            {
                //  _logger.LogError("RDLC report file not found at {Path}", reportPath);
                return StatusCode(500, ApiResponse<string>.ErrorResponse("Internal server error.", 500));
            }

            var pdfList = new List<PDFEntity>();
            var failedApplications = new List<string>();

            foreach (DataRow row in maindt.Rows)
            {
                if (row["ResultStatus"]?.ToString() != "PASS")
                {
                    continue;
                }

                // Per-candidate request: skip everyone except the requested candidate.
                if (request.ApplicationID.HasValue &&
                    Convert.ToInt64(row["ApplicationID"]) != request.ApplicationID.Value)
                {
                    continue;
                }

                string applicationIdDisplay = row["ApplicationIDDisplay"]?.ToString() ?? "Unknown";

                try
                {
                    DataTable candidateDt = maindt.Clone();
                    candidateDt.Rows.Add(row.ItemArray);

                    using (LocalReport localReport = new LocalReport())
                    {
                        localReport.ReportPath = reportPath;

                        string qrText = candidateDt.Rows[0]["QRcodeText"]?.ToString() ?? string.Empty;
                        candidateDt.Rows[0]["QRcode"] = GetQRCode(qrText, applicationIdDisplay);

                        localReport.DataSources.Add(new ReportDataSource("Candidate", candidateDt));
                        // After line 402, add:
                        var emptyDataTable = new DataTable("SubjectMarks");
                        localReport.DataSources.Add(new ReportDataSource("SubjectMarks", emptyDataTable));

                        localReport.EnableExternalImages = true;
                        localReport.EnableHyperlinks = true;

                        ReportParameter[] para = new ReportParameter[]
                        {
                    new ReportParameter("UserLoginID", candidateDt.Rows[0]["ApplicationID"].ToString())
                        };
                        localReport.SetParameters(para);

                        localReport.Refresh();

                        string deviceInfo =
                            "<DeviceInfo>" +
                            "  <OutputFormat>PDF</OutputFormat>" +
                            "  <PageWidth>21cm</PageWidth>" +
                            "  <PageHeight>29.7cm</PageHeight>" +
                            "  <MarginTop>0.3cm</MarginTop>" +
                            "  <MarginLeft>0.3cm</MarginLeft>" +
                            "  <MarginRight>0.3cm</MarginRight>" +
                            "  <MarginBottom>0.3cm</MarginBottom>" +
                            "</DeviceInfo>";

                        byte[] renderedBytes = localReport.Render(
                            "PDF",
                            deviceInfo,
                            out string mimeType,
                            out string encoding,
                            out string fileNameExtension,
                            out string[] streams,
                            out Warning[] warnings);

                        if (warnings != null)
                        {
                            foreach (var w in warnings)
                            {
                                //_logger.LogWarning(
                                //    "RDLC warning for ApplicationID {AppId}: {Message}",
                                //    applicationIdDisplay, w.Message);
                            }
                        }


                        pdfList.Add(new PDFEntity
                        {
                            FileName = MakeSafeFileName(applicationIdDisplay) + "_Certificate.pdf",
                            PDFByte = renderedBytes
                        });
                    }
                }
                catch (Exception ex)
                {
                    //_logger.LogError(ex,
                    //    "Failed to generate certificate for ApplicationID {AppId} in BatchID {BatchID}",
                    //    applicationIdDisplay, request.BatchID);
                    //failedApplications.Add(applicationIdDisplay);
                    // continue processing remaining candidates
                }
            }

            if (pdfList.Count == 0)
            {
                return StatusCode(500,
                    ApiResponse<string>.ErrorResponse("Failed to generate any certificates for this batch.", 500));
            }

            // Per-candidate request (drawer): return the single PDF directly, no zip.
            if (request.ApplicationID.HasValue && pdfList.Count == 1)
            {
                return File(pdfList[0].PDFByte, "application/pdf", pdfList[0].FileName);
            }

            byte[] zipBytes;
            try
            {
                zipBytes = CreateZip(pdfList);
            }
            catch (Exception ex)
            {
                //_logger.LogError(ex, "Failed to create zip for BatchID {BatchID}", request.BatchID);
                return StatusCode(500, ApiResponse<string>.ErrorResponse("Internal server error.", 500));
            }

            //if (failedApplications.Count > 0)
            //{
            //    _logger.LogWarning(
            //        "BatchID {BatchID} completed with {FailedCount} failed certificate(s): {Failed}",
            //        request.BatchID, failedApplications.Count, string.Join(", ", failedApplications));
            //}

            return File(zipBytes, "application/zip", $"Batch_{request.BatchID}_Certificates.zip");
        }

        private static string MakeSafeFileName(string name)
        {
            string safe = name.Replace("/", "_");
            foreach (char c in Path.GetInvalidFileNameChars())
            {
                safe = safe.Replace(c, '_');
            }
            return safe;
        }

        private byte[] CreateZip(List<PDFEntity> pdfFiles)
        {
            var usedNames = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

            using (var memoryStream = new MemoryStream())
            {
                using (var archive = new ZipArchive(memoryStream, ZipArchiveMode.Create, true))
                {
                    foreach (var file in pdfFiles)
                    {
                        string entryName = file.FileName;
                        int suffix = 1;
                        while (!usedNames.Add(entryName))
                        {
                            entryName = Path.GetFileNameWithoutExtension(file.FileName)
                                + $"_{suffix}"
                                + Path.GetExtension(file.FileName);
                            suffix++;
                        }

                        var zipEntry = archive.CreateEntry(entryName);
                        using (var entryStream = zipEntry.Open())
                        {
                            entryStream.Write(file.PDFByte, 0, file.PDFByte.Length);
                        }
                    }
                }

                return memoryStream.ToArray();
            }
        }

        private string GetQRCode(string candidateQRCode, string applicationIdDisplay)
        {
            try
            {
                ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;

                using (QRCodeGenerator qrGenerator = new QRCodeGenerator())
                {
                    QRCodeData qrCodeData = qrGenerator.CreateQrCode(candidateQRCode, QRCodeGenerator.ECCLevel.Q);
                    Base64QRCode base64QrCode = new Base64QRCode(qrCodeData);
                    return base64QrCode.GetGraphic(7);
                }
            }
            catch (Exception ex)
            {
                //_logger.LogWarning(ex, "QR code generation failed for ApplicationID {AppId}", applicationIdDisplay);
                return string.Empty;
            }
        }
    }
}

    // Request Model
    public class BatchCertificateRequest
    {
        public long BatchID { get; set; }

        // Optional: when supplied, only this candidate's certificate is
        // generated and the response is a single PDF instead of a zip
        // (used by the drawer's per-candidate download buttons).
        public long? ApplicationID { get; set; }

        //public int ExaminationID { get; set; }

        //public string IsResultFresh { get; set; }
    }

// PDF Entity
public class PDFEntity
{
    public string FileName { get; set; }

    public byte[] PDFByte { get; set; }
}






