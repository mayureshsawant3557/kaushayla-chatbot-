using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Reporting.NETCore;
using Portal.Business.Interface.Candidate;
using Portal.Business.Worker.Candidate;
using Portal.Entities;
using Portal.Entities.Base;
using Portal.Entities.Candidate;
using Portal.Entities.Institute;
using Portal.Entities.ResponseBody;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;

namespace Portal.Server.Controllers.Candidate
{
    [Route("api/[controller]")]
    [ApiController]
    public class CandidateSummaryController : ControllerBase
    {
        private readonly ICandidateSummary _candidateSummaryService;

        // Constructor Dependency Injection
        public CandidateSummaryController(ICandidateSummary candidateSummaryService)
        {
            _candidateSummaryService = candidateSummaryService ?? throw new ArgumentNullException(nameof(candidateSummaryService));
        }

        /// <summary>
        /// Checks if the candidate URL is valid
       
        [HttpGet("checkurl")]
        public ActionResult<ApiResponse<CheckURLEntity>> CheckCandidateURL(long candidateId, string pageCode, string userLoginId)
        {
            if (candidateId <= 0)
            {
                return BadRequest(ApiResponse<string>.ErrorResponse("Invalid candidate ID.", 400));
            }

            try
            {
                //var userLoginId = User.Identity.Name;

                var input = new CandidateInput
                {
                    CandidateID = candidateId,
                    UserLoginID = userLoginId,
                    PageCode = pageCode
                };

                var result = _candidateSummaryService.CheckCandidateURL(input);

                if (result == null)
                {
                    return NotFound(ApiResponse<string>.ErrorResponse("URL check result not found.", 404));
                }

                return Ok(ApiResponse<CheckURLEntity>.SuccessResponse(result, "URL check completed successfully", 200));
            }
            catch (Exception ex)
            {
                // Log the exception
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>.ErrorResponse($"Error: {ex.Message}", 500));
            }
        }

        /// <summary>
        /// Gets the candidate summary information
      
        [HttpGet("getsummary")]
        public ActionResult<ApiResponse<CandidateSummaryEntity>> GetCandidateSummary(long candidateId, string pageCode)
        {
            if (candidateId <= 0)
            {
                return BadRequest(ApiResponse<string>.ErrorResponse("Invalid candidate ID.", 400));
            }

            try
            {
                var userLoginId = User.Identity.Name;

                var input = new CandidateInput
                {
                    CandidateID = candidateId,
                    UserLoginID = userLoginId,
                    PageCode = pageCode
                };

                var result = _candidateSummaryService.GetCandidateSummary(input);

                if (result == null)
                {
                    return NotFound(ApiResponse<string>.ErrorResponse("Candidate summary not found.", 404));
                }

                return Ok(ApiResponse<CandidateSummaryEntity>.SuccessResponse(result, "Candidate summary retrieved successfully", 200));
            }
            catch (Exception ex)
            {
                // Log the exception
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>.ErrorResponse($"Error: {ex.Message}", 500));
            }
        }

        /// <summary>
        /// Locks the candidate form
        
        [HttpPost("lockform")]
        public ActionResult<ApiResponse<string>> LockCandidateForm([FromBody] CandidateFormLockEntity entity)
        {
            if (entity == null || entity.CandidateID <= 0)
            {
                return BadRequest(ApiResponse<string>.ErrorResponse("Invalid form lock request.", 400));
            }

            try
            {
                //entity.UserLoginID = User.Identity.Name;
                //entity.IPAddress = GetClientIpAddress();

                var result = _candidateSummaryService.LockCandidateForm(entity);

                //if (string.Equals(result, "N", StringComparison.OrdinalIgnoreCase) ||
                //    result.Contains("not been saved", StringComparison.OrdinalIgnoreCase))
                //{
                //    return BadRequest(ApiResponse<string>.ErrorResponse(result, 400));
                //}

                return Ok(ApiResponse<string>.SuccessResponse(result, "Form locked successfully", 200));
            }
            catch (Exception ex)
            {
                // Log the exception
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>.ErrorResponse($"Error: {ex.Message}", 500));
            }
        }

       
        /// Unlocks the candidate form
       
        [HttpPost("unlockform")]
        public ActionResult<ApiResponse<string>> UnlockCandidateForm([FromBody] CandidateFormUnlockEntity entity)
        {
            //if (entity == null || entity.CandidateID <= 0)
            //{
            //    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid form unlock request.", 400));
            //}

            try
            {
                //entity.UserLoginID = User.Identity.Name;
                //entity.IPAddress = GetClientIpAddress();

                var result = _candidateSummaryService.UnlockCandidateForm(entity);

                //if (string.Equals(result, "N", StringComparison.OrdinalIgnoreCase) ||
                //    result.Contains("not been saved", StringComparison.OrdinalIgnoreCase))
                //{
                //    return BadRequest(ApiResponse<string>.ErrorResponse(result, 400));
                //}

                return Ok(ApiResponse<string>.SuccessResponse(result, "Form unlocked successfully", 200));
            }
            catch (Exception ex)
            {
                // Log the exception
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>.ErrorResponse($"Error: {ex.Message}", 500));
            }
        }

       
        /// Gets eligibility flag for unlock candidate form
       
        [HttpGet("geteligibilityflag")]
        public ActionResult<ApiResponse<List<Dictionary<string, object>>>> GetEligibilityFlagForUnlockCandidateForm(long candidateId, string UserLoginID)
        {
            if (candidateId <= 0)
            {
                return BadRequest(ApiResponse<string>.ErrorResponse("Invalid candidate ID.", 400));
            }

            try
            {
               

                var result = _candidateSummaryService.GetEligibilityFlagForUnlockCandidateForm(candidateId, UserLoginID);

                if (result == null || result.Rows.Count == 0)
                {
                    return NotFound(ApiResponse<string>.ErrorResponse("Eligibility flags not found.", 404));
                }

                // Convert DataTable to a list of dictionaries for JSON serialization
                var eligibilityData = ConvertDataTableToList(result);

                return Ok(ApiResponse<List<Dictionary<string, object>>>.SuccessResponse(eligibilityData, "Eligibility flags retrieved successfully", 200));
            }
            catch (Exception ex)
            {
                // Log the exception
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>.ErrorResponse($"Error: {ex.Message}", 500));
            }
        }

       
        /// Gets applied institute details summary
       
        [HttpGet("getinstitutedetails")]
        public ActionResult<ApiResponse<InstituteInfoEntity>> GetAppliedInstituteDetailsSummary(long candidateId, string pageCode)
        {
            if (candidateId <= 0)
            {
                return BadRequest(ApiResponse<string>.ErrorResponse("Invalid candidate ID.", 400));
            }

            try
            {
                var userLoginId = User.Identity.Name;

                var input = new CandidateInput
                {
                    CandidateID = candidateId,
                    UserLoginID = userLoginId,
                    PageCode = pageCode
                };

                var result = _candidateSummaryService.GetAppliedInstituteDetailsSummary(input);

                if (result == null)
                {
                    return NotFound(ApiResponse<string>.ErrorResponse("Institute details not found.", 404));
                }

                return Ok(ApiResponse<InstituteInfoEntity>.SuccessResponse(result, "Institute details retrieved successfully", 200));
            }
            catch (Exception ex)
            {
                // Log the exception
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>.ErrorResponse($"Error: {ex.Message}", 500));
            }
        }

        #region Helper Methods

        /// <summary>
        /// Gets the client IP address
        /// </summary>
        /// <returns>IP address string</returns>
        private string GetClientIpAddress()
        {
            try
            {
                return HttpContext?.Connection?.RemoteIpAddress?.ToString() ?? "127.0.0.1";
            }
            catch
            {
                return "127.0.0.1";
            }
        }

       
        private List<Dictionary<string, object>> ConvertDataTableToList(DataTable dt)
        {
            var list = new List<Dictionary<string, object>>();

            foreach (DataRow row in dt.Rows)
            {
                var dict = new Dictionary<string, object>();

                foreach (DataColumn col in dt.Columns)
                {
                    dict[col.ColumnName] = row[col] == DBNull.Value ? null : row[col];
                }

                list.Add(dict);
            }

            return list;
        }












        [HttpPost("generate")]
        public ActionResult GenerateICard(long candidateId, string pageCode = "ICARD")
        {
            if (candidateId <= 0)
            {
                return BadRequest(ApiResponse<string>.ErrorResponse("Invalid candidate ID.", 400));
            }

            try
            {
                var userLoginId = User.Identity.Name;

                var input = new CandidateInput
                {
                    CandidateID = candidateId,
                    UserLoginID = userLoginId,
                    PageCode = pageCode
                };

                // Get candidate summary data using existing service
                var candidateSummary = _candidateSummaryService.GetCandidateSummary(input);

                if (candidateSummary == null)
                {
                    return NotFound(ApiResponse<string>.ErrorResponse("Candidate data not found.", 404));
                }

                // Convert candidate summary to DataTable for RDLC
                DataTable candidateData = ConvertCandidateSummaryToDataTable(candidateSummary);

                // Generate PDF
                byte[] pdfBytes = GenerateICardPdf(candidateData, candidateId);

                if (pdfBytes == null || pdfBytes.Length == 0)
                {
                    return StatusCode(500, ApiResponse<string>.ErrorResponse("Failed to generate I-Card PDF.", 500));
                }

                string fileName = $"{candidateId}_ICard.pdf";

                return File(pdfBytes, "application/pdf", fileName);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>.ErrorResponse($"Error generating I-Card: {ex.Message}", 500));
            }
        }

        //[HttpGet("preview")]
        //public ActionResult<ApiResponse<CandidateSummaryEntity>> PreviewICardData(long candidateId, string pageCode = "ICARD_PREVIEW")
        //{
        //    if (candidateId <= 0)
        //    {
        //        return BadRequest(ApiResponse<string>.ErrorResponse("Invalid candidate ID.", 400));
        //    }

        //    try
        //    {
        //        var userLoginId = User.Identity.Name;

        //        var input = new CandidateInput
        //        {
        //            CandidateID = candidateId,
        //            UserLoginID = userLoginId,
        //            PageCode = pageCode
        //        };

        //        var result = _candidateSummaryService.GetCandidateSummary(input);

        //        if (result == null)
        //        {
        //            return NotFound(ApiResponse<string>.ErrorResponse("Candidate data not found.", 404));
        //        }

        //        return Ok(ApiResponse<CandidateSummaryEntity>.SuccessResponse(result, "I-Card preview data retrieved successfully", 200));
        //    }
        //    catch (Exception ex)
        //    {
        //        return StatusCode(StatusCodes.Status500InternalServerError,
        //            ApiResponse<string>.ErrorResponse($"Error: {ex.Message}", 500));
        //    }
        //}


        private DataTable ConvertCandidateSummaryToDataTable(CandidateSummaryEntity candidateSummary)
        {
            DataTable dt = new DataTable();

            // Define columns
            dt.Columns.Add("CandidateID", typeof(long));
            dt.Columns.Add("ApplicationID", typeof(string));
            dt.Columns.Add("Name", typeof(string));
            dt.Columns.Add("FirstName", typeof(string));
            dt.Columns.Add("MiddleName", typeof(string));
            dt.Columns.Add("LastName", typeof(string));
            dt.Columns.Add("Gender", typeof(string));
            dt.Columns.Add("DateOfBirth", typeof(string));
            dt.Columns.Add("MobileNo", typeof(string));
            dt.Columns.Add("EMailID", typeof(string));
            dt.Columns.Add("AadhaarNo", typeof(string));
            dt.Columns.Add("Address", typeof(string));
            dt.Columns.Add("City", typeof(string));
            dt.Columns.Add("District", typeof(string));
            dt.Columns.Add("State", typeof(string));
            dt.Columns.Add("Pincode", typeof(string));
            dt.Columns.Add("PhotoFilePath", typeof(string));
            dt.Columns.Add("PhotoBase64", typeof(string));
            dt.Columns.Add("SignFilePath", typeof(string));
            dt.Columns.Add("ValidUpto", typeof(string));
            dt.Columns.Add("IssueDate", typeof(string));
            dt.Columns.Add("FormStatus", typeof(string));
            dt.Columns.Add("ITIRegistrationNo", typeof(string));

            // Create data row
            DataRow row = dt.NewRow();

            // Primary details
            if (candidateSummary.CandidatePrimarySummary != null)
            {
                var primary = candidateSummary.CandidatePrimarySummary;
                row["CandidateID"] = primary.CandidateID;
                row["ApplicationID"] = primary.ApplicationID ?? "";
                row["FirstName"] = primary.FirstName ?? "";
                row["MiddleName"] = primary.MiddleName ?? "";
                row["LastName"] = primary.LastName ?? "";
                row["Name"] = $"{primary.FirstName} {primary.MiddleName} {primary.LastName}".Trim();
                row["Gender"] = primary.Gender ?? "";
                row["DateOfBirth"] = primary.DOB ?? "";
                row["MobileNo"] = primary.MobileNo ?? "";
                row["EMailID"] = primary.EMailID ?? "";
                row["AadhaarNo"] = MaskAadhaarNumber(primary.AadhaarNo ?? "");
                row["PhotoFilePath"] = primary.PhotoFilePath ?? "";
                row["SignFilePath"] = primary.SignFilePath ?? "";
                row["ITIRegistrationNo"] = primary.ITIRegistrationNo ?? "";

                // Convert photo URL to Base64 if available
                if (!string.IsNullOrEmpty(primary.PhotoFilePath))
                {
                    row["PhotoBase64"] = ConvertImageUrlToBase64(primary.PhotoFilePath);
                }
                else
                {
                    row["PhotoBase64"] = "";
                }

                //if (!string.IsNullOrEmpty(primary.PhotoFilePath))
                //{
                //    row["PhotoBase64"] = ConvertImageToByteArray(primary.PhotoFilePath);
                //   // row["PhotoFilePath"] = new Uri(primary.PhotoFilePath).AbsoluteUri;
                //}

            }

            // Address details
            if (candidateSummary.CandidateAddressSummary != null)
            {
                var address = candidateSummary.CandidateAddressSummary;
                row["Address"] = address.PAddress ?? "";
                row["City"] = address.PCity ?? "";
                row["District"] = address.PDistrict ?? "";
                row["State"] = address.PState ?? "";
                row["Pincode"] = address.PPincode ?? "";
            }

            // Application status
            if (candidateSummary.CandidateApplicationStatusSummary != null)
            {
                var status = candidateSummary.CandidateApplicationStatusSummary;
                row["FormStatus"] = GetFormStatusText(status.FormStatus);
            }

            // Additional info
            row["ValidUpto"] = DateTime.Now.AddYears(1).ToString("dd/MM/yyyy");
            row["IssueDate"] = DateTime.Now.ToString("dd/MM/yyyy");

            dt.Rows.Add(row);
            return dt;
        }


        private byte[] GenerateICardPdf(DataTable candidateData, long candidateID)
        {
            LocalReport localReport = new LocalReport();
            byte[] renderedBytes = null;

            try
            {
                string reportPath = Path.Combine(Directory.GetCurrentDirectory(), "RDLCReports", "ICardTemplate.rdlc"); 

                if (!System.IO.File.Exists(reportPath))
                {
                    throw new FileNotFoundException($"I-Card template file not found at: {reportPath}");
                }

                localReport.ReportPath = reportPath;

                // Add data source
                localReport.DataSources.Clear();
                localReport.DataSources.Add(new ReportDataSource("CandidateDataSet", candidateData));

                // Enable external images
                localReport.EnableExternalImages = true;
                localReport.EnableHyperlinks = false;

                // Set report parameters
                ReportParameter[] parameters = new ReportParameter[]
                {
                    new ReportParameter("ReportTitle", "STUDENT I-CARD"),
                    new ReportParameter("InstituteName", "Maharashtra State Board of Skill Development"),
                    new ReportParameter("AcademicYear", DateTime.Now.Year.ToString()),
                    new ReportParameter("IssueDate", DateTime.Now.ToString("dd/MM/yyyy"))
                };

                localReport.SetParameters(parameters);
                localReport.Refresh();

                // Configure PDF settings for I-Card
                string deviceInfo = @"<DeviceInfo>
                    <OutputFormat>PDF</OutputFormat>
                    <PageWidth>10.16cm</PageWidth>
                    <PageHeight>15.24cm</PageHeight>
                    <MarginTop>0.2cm</MarginTop>
                    <MarginLeft>0.2cm</MarginLeft>
                    <MarginRight>0.2cm</MarginRight>
                    <MarginBottom>0.2cm</MarginBottom>
                    <DpiX>300</DpiX>
                    <DpiY>300</DpiY>
                </DeviceInfo>";

                string mimeType;
                string encoding;
                string fileNameExtension;
                Warning[] warnings;
                string[] streams;

                renderedBytes = localReport.Render("PDF", deviceInfo, out mimeType, out encoding,
                                                 out fileNameExtension, out streams, out warnings);

                return renderedBytes;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error generating I-Card PDF for Candidate {candidateID}: {ex.Message}", ex);
            }
            finally
            {
                localReport?.Dispose();
            }
        }


        private string ConvertImageUrlToBase64(string imageUrl)
        {
            try
            {
                if (string.IsNullOrEmpty(imageUrl))
                    return "";

                using (var httpClient = new System.Net.Http.HttpClient())
                {
                    var imageBytes = httpClient.GetByteArrayAsync(imageUrl).Result;
                    return "data:image/jpeg;base64," + Convert.ToBase64String(imageBytes);
                }
            }
            catch (Exception ex)
            {
                // Log the exception and return empty string
                Console.WriteLine($"Error converting image URL to Base64: {ex.Message}");
                return "";
            }
        }


        private byte[] ConvertImageToByteArray(string imagePath)
        {
            try
            {
                if (System.IO.File.Exists(imagePath)) // Ensure System.IO.File is used to avoid ambiguity
                {
                    return System.IO.File.ReadAllBytes(imagePath); // Ensure System.IO.File is used to avoid ambiguity
                }
                return null;
            }
            catch (Exception ex)
            {
                // Log the exception if necessary
                Console.WriteLine($"Error reading image file: {ex.Message}");
                return null;
            }
        }


        /// <summary>
        /// Masks Aadhaar number for privacy
        /// </summary>
        private string MaskAadhaarNumber(string aadhaarNo)
        {
            if (string.IsNullOrEmpty(aadhaarNo) || aadhaarNo.Length < 12)
                return aadhaarNo;

            return "XXXX XXXX " + aadhaarNo.Substring(aadhaarNo.Length - 4);
        }

        /// <summary>
        /// Gets form status text
        /// </summary>
        private string GetFormStatusText(string formStatus)
        {
            return formStatus switch
            {
                "A" => "Active",
                "S" => "Submitted",
                "C" => "Confirmed",
                "L" => "Locked",
                _ => "Unknown"
            };
        }
























































        #endregion
    }
}