using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Reporting.NETCore;
using Portal.Business.Interface.Obwc;
using Portal.Business.Worker.Utility;
using Portal.Entities.Base;
using Portal.Entities.Obwc;
using Portal.Entities.ResponseBody;
using QRCoder;
using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.IO.Compression;
using System.Net;

namespace Portal.Server.Controllers.Obwc
{
    [Route("api/[controller]")]
    [ApiController]
    public class ObwcController : ControllerBase
    {
        private readonly IObwc _IObwc;

        public ObwcController(IObwc iObwc)
        {
            _IObwc = iObwc ?? throw new ArgumentNullException(nameof(iObwc));
        }

        [HttpGet]
        [Route("GetBatchData")]
        public IActionResult GetBatchData()
        {
            try
            {
                var result = _IObwc.GetBatchData();

                if (result != null && result.Count > 0)
                {
                    return Ok(ApiResponse<List<ObwcResultEntity>>.SuccessResponse(
                        result,
                        "Batch data retrieved successfully."));
                }
                else
                {
                    return Ok(ApiResponse<List<ObwcResultEntity>>.SuccessResponse(
                        new List<ObwcResultEntity>(),
                        "No batch data found."));
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetBatchData", "");
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("GetSaveUpdateOBWCResult")]
        public IActionResult GetSaveUpdateOBWCResult(
            [FromBody] List<ObwcResultEntity> ResultDetails,
            [FromQuery] DateTime CreatedDateTime,
            [FromQuery] string CreatedBy,
            [FromQuery] string CreatedByIPAddress)
        {
            try
            {
                if (ResultDetails == null || ResultDetails.Count == 0)
                    return BadRequest(ApiResponse<object>.ErrorResponse("Result details are missing.", 400));

                var result = _IObwc.GetSaveUpdateOBWCResult(ResultDetails, CreatedDateTime, CreatedBy, CreatedByIPAddress);
                return Ok(ApiResponse<string>.SuccessResponse(result, "OBWC result saved successfully."));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetSaveUpdateOBWCResult", CreatedBy);
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("UpdateBatchDate")]
        public IActionResult UpdateBatchDate(
            [FromQuery] string BatchID,
            [FromQuery] string Types,
            [FromQuery] DateTime SelectedDate,
            [FromQuery] string CreatedBy,
            [FromQuery] string CreatedByIPAddress,
            [FromQuery] string BatchType)
        {
            try
            {
                var result = _IObwc.UpdateBatchDate(BatchID, Types, SelectedDate, CreatedBy, CreatedByIPAddress, BatchType);
                return Ok(ApiResponse<string>.SuccessResponse(result, "Batch date updated successfully."));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UpdateBatchDate", BatchID);
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetBatchOBWCResult")]
        public IActionResult GetBatchOBWCResult()
        {
            try
            {
                var result = _IObwc.GetBatchOBWCResult();

                if (result != null && result.Count > 0)
                {
                    return Ok(ApiResponse<List<DropdownEntity>>.SuccessResponse(
                        result,
                        "Batch list retrieved successfully."));
                }
                else
                {
                    return Ok(ApiResponse<List<DropdownEntity>>.SuccessResponse(
                        new List<DropdownEntity>(),
                        "No batch data found."));
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetBatchOBWCResult", "");
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetBatchStatusOBWCResult")]
        public IActionResult GetBatchStatusOBWCResult()
        {
            try
            {
                var result = _IObwc.GetBatchStatusOBWCResult();

                if (result != null && result.Count > 0)
                {
                    return Ok(ApiResponse<List<DropdownEntity>>.SuccessResponse(
                        result,
                        "Batch status list retrieved successfully."));
                }
                else
                {
                    return Ok(ApiResponse<List<DropdownEntity>>.SuccessResponse(
                        new List<DropdownEntity>(),
                        "No batch status data found."));
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetBatchStatusOBWCResult", "");
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetCourseOBWCResult")]
        public IActionResult GetCourseOBWCResult()
        {
            try
            {
                var result = _IObwc.GetCourseOBWCResult();

                if (result != null && result.Count > 0)
                {
                    return Ok(ApiResponse<List<DropdownEntity>>.SuccessResponse(
                        result,
                        "Course list retrieved successfully."));
                }
                else
                {
                    return Ok(ApiResponse<List<DropdownEntity>>.SuccessResponse(
                        new List<DropdownEntity>(),
                        "No course data found."));
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetCourseOBWCResult", "");
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetDistrictOBWCResult")]
        public IActionResult GetDistrictOBWCResult()
        {
            try
            {
                var result = _IObwc.GetDistrictOBWCResult();

                if (result != null && result.Count > 0)
                {
                    return Ok(ApiResponse<List<DropdownEntity>>.SuccessResponse(
                        result,
                        "District list retrieved successfully."));
                }
                else
                {
                    return Ok(ApiResponse<List<DropdownEntity>>.SuccessResponse(
                        new List<DropdownEntity>(),
                        "No district data found."));
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetDistrictOBWCResult", "");
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetTraningPartnerOBWCResult")]
        public IActionResult GetTraningPartnerOBWCResult()
        {
            try
            {
                var result = _IObwc.GetTraningPartnerOBWCResult();

                if (result != null && result.Count > 0)
                {
                    return Ok(ApiResponse<List<DropdownEntity>>.SuccessResponse(
                        result,
                        "Training partner list retrieved successfully."));
                }
                else
                {
                    return Ok(ApiResponse<List<DropdownEntity>>.SuccessResponse(
                        new List<DropdownEntity>(),
                        "No training partner data found."));
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetTraningPartnerOBWCResult", "");
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetResultByCandidate")]
        public IActionResult GetResultByCandidate(
            [FromQuery] string BatchID,
            [FromQuery] string SiteID,
            [FromQuery] string CandidateID,
            [FromQuery] string BatchType)
        {
            try
            {
                var result = _IObwc.GetResultByCandidate(BatchID, SiteID, CandidateID, BatchType);

                if (result == null || result.Rows.Count == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No result found for the given candidate.", 404));
                }

                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Candidate result retrieved successfully."));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetResultByCandidate", BatchID);
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetResultByBatchID")]
        public IActionResult GetResultByBatchID([FromQuery] string BatchID, [FromQuery] string BatchType)
        {
            try
            {
                var result = _IObwc.GetResultByBatchID(BatchID, BatchType);

                if (result != null && result.Count > 0)
                {
                    return Ok(ApiResponse<List<ObwcResultEntity>>.SuccessResponse(
                        result,
                        "Result retrieved successfully."));
                }
                else
                {
                    return Ok(ApiResponse<List<ObwcResultEntity>>.SuccessResponse(
                        new List<ObwcResultEntity>(),
                        "No result found for the given batch."));
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetResultByBatchID", BatchID);
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetSearchResult")]
        public IActionResult GetSearchResult(
            [FromQuery] Int64 InstituteID,
            [FromQuery] Int64 CoureseID,
            [FromQuery] string District,
            [FromQuery] string batch_id,
            [FromQuery] string batch_status,
            [FromQuery] string batch_type)
        {
            try
            {
                var result = _IObwc.GetSearchResult(InstituteID, CoureseID, District, batch_id, batch_status, batch_type);

                if (result != null && result.Count > 0)
                {
                    return Ok(ApiResponse<List<ObwcResultEntity>>.SuccessResponse(
                        result,
                        "Search result retrieved successfully."));
                }
                else
                {
                    return Ok(ApiResponse<List<ObwcResultEntity>>.SuccessResponse(
                        new List<ObwcResultEntity>(),
                        "No search result found."));
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetSearchResult", $"{batch_id} {InstituteID}");
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetSearchResultExport")]
        public IActionResult GetSearchResultExport(
            [FromQuery] Int64 InstituteID,
            [FromQuery] Int64 CoureseID,
            [FromQuery] string District,
            [FromQuery] string batch_id,
            [FromQuery] string batch_status,
            [FromQuery] string batch_type)
        {
            try
            {
                var result = _IObwc.GetSearchResultExport(InstituteID, CoureseID, District, batch_id, batch_status, batch_type);

                if (result == null || result.Rows.Count == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No export data found.", 404));
                }

                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Search result export retrieved successfully."));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetSearchResultExport", InstituteID.ToString());
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetResultByBatchIDExport")]
        public IActionResult GetResultByBatchIDExport([FromQuery] string BatchID, [FromQuery] string BatchType)
        {
            try
            {
                var result = _IObwc.GetResultByBatchIDExport(BatchID, BatchType);

                if (result == null || result.Rows.Count == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No export data found for the given batch.", 404));
                }

                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Batch result export retrieved successfully."));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetResultByBatchIDExport", BatchID);
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetTraningPartnerOBWCResultForInstiutte")]
        public IActionResult GetTraningPartnerOBWCResultForInstiutte([FromQuery] string InstituteCode)
        {
            try
            {
                var result = _IObwc.GetTraningPartnerOBWCResultForInstiutte(InstituteCode);

                if (result != null && result.Count > 0)
                {
                    return Ok(ApiResponse<List<DropdownEntity>>.SuccessResponse(
                        result,
                        "Training partner list retrieved successfully."));
                }
                else
                {
                    return Ok(ApiResponse<List<DropdownEntity>>.SuccessResponse(
                        new List<DropdownEntity>(),
                        "No training partner data found."));
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetTraningPartnerOBWCResultForInstiutte", InstituteCode);
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetBatchOBWCResultForInstiutte")]
        public IActionResult GetBatchOBWCResultForInstiutte([FromQuery] string InstituteCode)
        {
            try
            {
                var result = _IObwc.GetBatchOBWCResultForInstiutte(InstituteCode);

                if (result != null && result.Count > 0)
                {
                    return Ok(ApiResponse<List<DropdownEntity>>.SuccessResponse(
                        result,
                        "Batch list retrieved successfully."));
                }
                else
                {
                    return Ok(ApiResponse<List<DropdownEntity>>.SuccessResponse(
                        new List<DropdownEntity>(),
                        "No batch data found."));
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetBatchOBWCResultForInstiutte", InstituteCode);
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetDistrictOBWCResultForInstitute")]
        public IActionResult GetDistrictOBWCResultForInstitute([FromQuery] string InstituteCode)
        {
            try
            {
                var result = _IObwc.GetDistrictOBWCResultForInstitute(InstituteCode);

                if (result != null && result.Count > 0)
                {
                    return Ok(ApiResponse<List<DropdownEntity>>.SuccessResponse(
                        result,
                        "District list retrieved successfully."));
                }
                else
                {
                    return Ok(ApiResponse<List<DropdownEntity>>.SuccessResponse(
                        new List<DropdownEntity>(),
                        "No district data found."));
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetDistrictOBWCResultForInstitute", InstituteCode);
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetCourseOBWCResultForInstitute")]
        public IActionResult GetCourseOBWCResultForInstitute([FromQuery] string InstituteCode)
        {
            try
            {
                var result = _IObwc.GetCourseOBWCResultForInstitute(InstituteCode);

                if (result != null && result.Count > 0)
                {
                    return Ok(ApiResponse<List<DropdownEntity>>.SuccessResponse(
                        result,
                        "Course list retrieved successfully."));
                }
                else
                {
                    return Ok(ApiResponse<List<DropdownEntity>>.SuccessResponse(
                        new List<DropdownEntity>(),
                        "No course data found."));
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetCourseOBWCResultForInstitute", InstituteCode);
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetBatchTypeOBWCResult")]
        public IActionResult GetBatchTypeOBWCResult()
        {
            try
            {
                var result = _IObwc.GetBatchTypeOBWCResult();

                if (result != null && result.Count > 0)
                {
                    return Ok(ApiResponse<List<DropdownEntity>>.SuccessResponse(
                        result,
                        "Batch type list retrieved successfully."));
                }
                else
                {
                    return Ok(ApiResponse<List<DropdownEntity>>.SuccessResponse(
                        new List<DropdownEntity>(),
                        "No batch type data found."));
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetBatchTypeOBWCResult", "");
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetResultSheetBatchCode")]
        public IActionResult GetResultSheetBatchCode([FromQuery] string BatchCode)
        {
            try
            {
                var result = _IObwc.GetResultSheetBatchCode(BatchCode);

                if (result == null || result.Tables.Count == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No result sheet found for the given batch code.", 404));
                }

                return Ok(ApiResponse<DataSet>.SuccessResponse(result, "Result sheet retrieved successfully."));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetResultSheetBatchCode", BatchCode);
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetTraningPartnerOBWCResultMasters")]
        public IActionResult GetTraningPartnerOBWCResultMasters(
            [FromQuery] Int64 InstituteID,
            [FromQuery] Int64 CourseID,
            [FromQuery] string District,
            [FromQuery] string batch_status)
        {
            try
            {
                var result = _IObwc.GetTraningPartnerOBWCResultMasters(InstituteID, CourseID, District, batch_status);

                if (result == null || result.Tables.Count == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No training partner master data found.", 404));
                }

                return Ok(ApiResponse<DataSet>.SuccessResponse(result, "Training partner master data retrieved successfully."));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetTraningPartnerOBWCResultMasters", InstituteID.ToString());
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

  
        [HttpGet]
        [Route("DownloadCertificate")]
        public IActionResult DownloadCertificate(
            [FromQuery] string BatchID,
            [FromQuery] string SiteID,
            [FromQuery] string CandidateID,
            [FromQuery] string BatchType)
        {
            try
            {
                DataTable maidt = _IObwc.GetResultByCandidate(BatchID, SiteID, CandidateID, BatchType);
                if (maidt == null || maidt.Rows.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No result found for the given candidate.", 404));

                string reportPath = Path.Combine(Directory.GetCurrentDirectory(), "RDLCReports", "OBWCCertificateSystem.rdlc");
                if (!System.IO.File.Exists(reportPath))
                    return NotFound(ApiResponse<object>.ErrorResponse("Report template 'OBWCCertificateSystem.rdlc' not found.", 404));

                var pdfList = new List<PdfEntry>();

                foreach (DataRow sourceRow in maidt.Rows)
                {
                    if (sourceRow["result_of_worker"]?.ToString() != "Passed")
                        continue;

                    DataTable candidateDt = maidt.Clone();
                    candidateDt.ImportRow(sourceRow);
                    candidateDt.Rows[0]["QRcode"] = GetQRCode(candidateDt.Rows[0]["QRcodeText"].ToString());

                    byte[] pdfBytes = RenderReportToPdf(
                        reportPath,
                        new[] { new ReportDataSource("OBWCCertificate", candidateDt) },
                        new[] { new ReportParameter("UserLoginID", candidateDt.Rows[0]["registration_no"].ToString()) }
                    );

                    pdfList.Add(new PdfEntry
                    {
                        FileName = candidateDt.Rows[0]["registration_no"].ToString().Replace("/", "_")
                            + $"_Certificate_{DateTime.Now:ddMMyyyyhhmmss}.pdf",
                        Bytes = pdfBytes
                    });
                }

                if (pdfList.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No passed candidates found to generate certificates.", 404));

                byte[] zipBytes = BuildZip(pdfList);
                return File(zipBytes, "application/zip", $"{BatchID}_Certificates_{DateTime.Now:ddMMyyyyhhmmss}.zip");
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "DownloadCertificate", BatchID);
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

       
        [HttpGet]
        [Route("DownloadPreCertificate")]
        public IActionResult DownloadPreCertificate(
            [FromQuery] string BatchID,
            [FromQuery] string SiteID,
            [FromQuery] string CandidateID,
            [FromQuery] string BatchType)
        {
            try
            {
                DataTable maidt = _IObwc.GetResultByCandidate(BatchID, SiteID, CandidateID, BatchType);
                if (maidt == null || maidt.Rows.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No result found for the given candidate.", 404));

                string reportPath = Path.Combine(Directory.GetCurrentDirectory(), "RDLCReports", "BulkOBWCCertificatePrepinted.rdlc");
                if (!System.IO.File.Exists(reportPath))
                    return NotFound(ApiResponse<object>.ErrorResponse("Report template 'BulkOBWCCertificatePrepinted.rdlc' not found.", 404));

                foreach (DataRow row in maidt.Rows)
                    row["QRcode"] = GetQRCode(row["QRcodeText"].ToString());

                byte[] pdfBytes = RenderReportToPdf(
                    reportPath,
                    new[] { new ReportDataSource("OBWCCertificate", maidt) },
                    leftMargin: "1.5cm", rightMargin: "1.5cm"
                );

                string fileName = maidt.Rows[0]["batch_code"] + $"_Certificate_{DateTime.Now:ddMMyyyyhhmmss}.pdf";
                return File(pdfBytes, "application/pdf", fileName);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "DownloadPreCertificate", BatchID);
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        
        [HttpGet]
        [Route("DownloadResultSheet")]
        public IActionResult DownloadResultSheet([FromQuery] string BatchCode)
        {
            try
            {
                DataSet ds = _IObwc.GetResultSheetBatchCode(BatchCode);
                if (ds == null || ds.Tables.Count < 2)
                    return NotFound(ApiResponse<object>.ErrorResponse("No result sheet data found for this batch code.", 404));

                string reportPath = Path.Combine(Directory.GetCurrentDirectory(), "RDLCReports", "MOBWCResultSheet.rdlc");
                if (!System.IO.File.Exists(reportPath))
                    return NotFound(ApiResponse<object>.ErrorResponse("Report template 'MOBWCResultSheet.rdlc' not found.", 404));

                byte[] pdfBytes = RenderReportToPdf(
                    reportPath,
                    new[]
                    {
                        new ReportDataSource("OBWCAttendanceResult", ds.Tables[0]),
                        new ReportDataSource("OBWCAttendanceResultCandidates", ds.Tables[1])
                    }
                );

                string fileName = BatchCode.Replace("/", "_") + $"_ResultSheet_{DateTime.Now:ddMMyyyyhhmmss}.pdf";
                return File(pdfBytes, "application/pdf", fileName);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "DownloadResultSheet", BatchCode);
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }




        [HttpGet]
        [Route("DownloadDispatchSlip")]
        public IActionResult DownloadDispatchSlip(
                    [FromQuery] string BatchID,
                    [FromQuery] string SiteID,
                    [FromQuery] string CandidateID,
                    [FromQuery] string BatchType)
        {
            try
            {
                DataTable maidt = _IObwc.GetResultByCandidate(BatchID, SiteID, CandidateID, BatchType);
                if (maidt == null || maidt.Rows.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No data found for this batch.", 404));

                DataTable candidateDt = maidt.Clone();
                candidateDt.ImportRow(maidt.Rows[0]);
                candidateDt.Rows[0]["QRcode"] = GetQRCode(candidateDt.Rows[0]["QRcodeText"].ToString());

                string reportPath = Path.Combine(Directory.GetCurrentDirectory(), "RDLCReports", "MOBWCDispatchSlip.rdlc");
                if (!System.IO.File.Exists(reportPath))
                    return NotFound(ApiResponse<object>.ErrorResponse("Report template 'MOBWCDispatchSlip.rdlc' not found.", 404));

                byte[] pdfBytes = RenderReportToPdf(
                    reportPath,
                    new[] { new ReportDataSource("OBWCCertificate", candidateDt) }
                );

                string fileName = candidateDt.Rows[0]["batch_code"].ToString().Replace("/", "_")
                    + $"_DispatchSlip_{DateTime.Now:ddMMyyyyhhmmss}.pdf";
                return File(pdfBytes, "application/pdf", fileName);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "DownloadDispatchSlip", BatchID);
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }


        // ---- 5. Single Certificate PDF (batch-detail page's "System Certificate")
        // mirrors old GenerateCertificatepdf() in MBOCWBatchwiseResult.aspx.cs -
        // streams ONE pdf directly (no zip), since it's already scoped to one candidate
        [HttpGet]
        [Route("DownloadCertificateSingle")]
        public IActionResult DownloadCertificateSingle(
            [FromQuery] string BatchID,
            [FromQuery] string SiteID,
            [FromQuery] string CandidateID,
            [FromQuery] string BatchType)
        {
            try
            {
                DataTable maidt = _IObwc.GetResultByCandidate(BatchID, SiteID, CandidateID, BatchType);
                if (maidt == null || maidt.Rows.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No result found for the given candidate.", 404));

                DataRow row = null;
                foreach (DataRow r in maidt.Rows)
                {
                    if (r["result_of_worker"]?.ToString() == "Passed")
                    {
                        row = r;
                        break;
                    }
                }

                if (row == null)
                    return NotFound(ApiResponse<object>.ErrorResponse("Candidate has not passed - certificate not available.", 404));

                string reportPath = Path.Combine(Directory.GetCurrentDirectory(), "RDLCReports", "OBWCCertificateSystem.rdlc");
                if (!System.IO.File.Exists(reportPath))
                    return NotFound(ApiResponse<object>.ErrorResponse("Report template 'OBWCCertificateSystem.rdlc' not found.", 404));

                DataTable candidateDt = maidt.Clone();
                candidateDt.ImportRow(row);
                candidateDt.Rows[0]["QRcode"] = GetQRCode(candidateDt.Rows[0]["QRcodeText"].ToString());

                byte[] pdfBytes = RenderReportToPdf(
                    reportPath,
                    new[] { new ReportDataSource("OBWCCertificate", candidateDt) },
                    new[] { new ReportParameter("UserLoginID", candidateDt.Rows[0]["registration_no"].ToString()) }
                );

                string fileName = candidateDt.Rows[0]["registration_no"].ToString().Replace("/", "_")
                    + $"_Certificate_{DateTime.Now:ddMMyyyyhhmmss}.pdf";
                return File(pdfBytes, "application/pdf", fileName);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "DownloadCertificateSingle", BatchID);
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
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

        internal sealed class PdfEntry
        {
            public string FileName { get; set; }
            public byte[] Bytes { get; set; }
        }
    }
}