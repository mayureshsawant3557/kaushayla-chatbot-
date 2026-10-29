using Microsoft.AspNetCore.Mvc;
using Microsoft.Reporting.NETCore;
using System.Data;
using Portal.Entities.ResponseBody;
using Admission.Business;
using Portal.Business.Worker.Certificate;
using Portal.Business.Interface.Certificate;
using Portal.Business.Interface.Exam;

[ApiController]
[Route("api/[controller]")]
public class CertificateVerificationController : ControllerBase
{
    private readonly IVerificationCertificateRequest _verificationCertificateRequestWorker;
    private readonly IExam _examWorker;
    private readonly IWebHostEnvironment _webHostEnvironment;
    public CertificateVerificationController(
        IVerificationCertificateRequest verificationCertificateRequestWorker,
        IExam examWorker,
        IWebHostEnvironment webHostEnvironment)
    {
        _verificationCertificateRequestWorker = verificationCertificateRequestWorker;
        _examWorker = examWorker;
        _webHostEnvironment = webHostEnvironment;
    }

    [HttpGet("download-certificate")]
    public IActionResult DownloadCertificateVerification([FromQuery] string requestNo)
    {
        try
        {
            // Validate input parameter
            if (string.IsNullOrWhiteSpace(requestNo))
                return BadRequest(ApiResponse<object>.ErrorResponse("Request Number is required.", 400));

            // Extract candidateId from last 6 digits of requestNo
            string trimmedRequestNo = requestNo.Trim();
            if (trimmedRequestNo.Length < 6 || !long.TryParse(trimmedRequestNo[^6..], out long candidateId))
                return BadRequest(ApiResponse<object>.ErrorResponse("Invalid Request Number format. Unable to extract Candidate ID.", 400));

            // Get verification request data
            var verificationRequest = _verificationCertificateRequestWorker.GetVerificationCertificateRequestByRequestNo(trimmedRequestNo);
            if (verificationRequest == null || verificationRequest.ID == 0)
                return NotFound(ApiResponse<object>.ErrorResponse($"Verification certificate request not found for RequestNo: {requestNo}", 404));

            // Get candidate results
            var candidateResults = _examWorker.GetCandidateResults(candidateId);
            if (candidateResults == null || candidateResults.Rows.Count == 0)
                return NotFound(ApiResponse<object>.ErrorResponse($"Candidate results not found for CandidateID: {candidateId}", 404));

            // Prepare data for RDLC report
            var reportData = PrepareReportData(verificationRequest, candidateResults);

            // Generate PDF from RDLC
            return GenerateVerificationCertificatePdf(reportData, requestNo);
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<object>.ErrorResponse($"Internal server error: {ex.Message}", 500));
        }
    }


    private DataTable PrepareReportData(dynamic verificationRequest, DataTable candidateResults)
    {
        DataTable reportDataTable = new DataTable("CertificateDataSet");

        // Define columns for the report
        reportDataTable.Columns.Add("LetterNo", typeof(string));
        reportDataTable.Columns.Add("RequestDate", typeof(DateTime));
        reportDataTable.Columns.Add("Designation", typeof(string));
        reportDataTable.Columns.Add("OrganizationName", typeof(string));
        reportDataTable.Columns.Add("OrganizationAddress", typeof(string));
        reportDataTable.Columns.Add("MobileNumber", typeof(string));
        reportDataTable.Columns.Add("ApplicationID", typeof(string));
        reportDataTable.Columns.Add("CandidateName", typeof(string));
        reportDataTable.Columns.Add("MotherName", typeof(string));
        reportDataTable.Columns.Add("Course", typeof(string));
        reportDataTable.Columns.Add("Duration", typeof(string));
        reportDataTable.Columns.Add("Institute", typeof(string));
        reportDataTable.Columns.Add("Percentage", typeof(string));
        reportDataTable.Columns.Add("Grade", typeof(string));
        reportDataTable.Columns.Add("ResultDate", typeof(DateTime));
        reportDataTable.Columns.Add("StatementOfMarksIssueDate", typeof(DateTime));
        reportDataTable.Columns.Add("CertificateIssueDate", typeof(DateTime));
        reportDataTable.Columns.Add("PhotoPath", typeof(string));
        reportDataTable.Columns.Add("ProfileNo", typeof(string));
        reportDataTable.Columns.Add("DateOfBirth", typeof(string));
        reportDataTable.Columns.Add("Examination", typeof(string));
        reportDataTable.Columns.Add("ResultStatus", typeof(string));
        reportDataTable.Columns.Add("Sector", typeof(string));
        reportDataTable.Columns.Add("District", typeof(string));
        reportDataTable.Columns.Add("City", typeof(string));
        reportDataTable.Columns.Add("OverallResult", typeof(string));

        // Get candidate result row
        var candidateRow = candidateResults.Rows[0];

        // Add row with combined data
        DataRow row = reportDataTable.NewRow();

        // From Verification Request
        row["LetterNo"] = verificationRequest.RequestNo ?? "";
        row["RequestDate"] = verificationRequest.CreatedDate ?? DateTime.Now;
        row["Designation"] = verificationRequest.Designation ?? "";
        row["OrganizationName"] = verificationRequest.OrganizationName ?? "";

        // Combine full address
        var fullAddress = $"{verificationRequest.OrganizationAddress ?? ""}, " +
                         $"{(verificationRequest.PinCode != null ? "Pin: " + verificationRequest.PinCode : "")}";
        row["OrganizationAddress"] = fullAddress.Trim().TrimEnd(',');

        row["MobileNumber"] = verificationRequest.PrimaryMobile ?? "";

        // From Candidate Results
        row["ApplicationID"] = candidateRow["ApplicationIDDisplay"]?.ToString() ?? "";
        row["CandidateName"] = candidateRow["CandidateName"]?.ToString() ?? "";
        row["MotherName"] = candidateRow["MotherName"]?.ToString() ?? "";
        row["Course"] = candidateRow["CourseNameCode"]?.ToString() ?? "";
        row["Duration"] = candidateRow["Duration"]?.ToString() ?? "";
        row["Institute"] = candidateRow["InstituteNameCode"]?.ToString() ?? "";
        row["Percentage"] = candidateRow["Percentage"]?.ToString() ?? "0";
        row["Grade"] = candidateRow["Grade"]?.ToString() ?? "";
        row["OverallResult"] = candidateRow["ResultStatus"]?.ToString() ?? "";

        // Parse Result Date
        if (candidateRow["ResultDate"] != DBNull.Value)
            row["ResultDate"] = Convert.ToDateTime(candidateRow["ResultDate"]).Date;
        else
            row["ResultDate"] = DateTime.Now.Date;


        
        row["StatementOfMarksIssueDate"] = ((DateTime)row["ResultDate"]).AddDays(7);
        row["CertificateIssueDate"] = ((DateTime)row["ResultDate"]).AddDays(14);

        row["PhotoPath"] = candidateRow["CandidatePhoto"]?.ToString() ?? "";
        //row["PhotoPath"] = File.ReadAllBytes(@"path/to/photo.jpg");
        row["ProfileNo"] = candidateRow["ProfileNo"]?.ToString() ?? "";

        if (candidateRow["DateofBirth"] != DBNull.Value)
            row["DateOfBirth"] = Convert.ToDateTime(candidateRow["DateofBirth"]).ToString("dd/MM/yyyy");
        else
            row["DateOfBirth"] = "";

        row["Examination"] = candidateRow["Examination"]?.ToString() ?? "";
        row["ResultStatus"] = candidateRow["ResultStatus"]?.ToString() ?? "";
        row["Sector"] = candidateRow["Sector"]?.ToString() ?? "";
        row["District"] = candidateRow["District"]?.ToString() ?? "";
        row["City"] = candidateRow["City"]?.ToString() ?? "";

        reportDataTable.Rows.Add(row);
        return reportDataTable;
    }

    private IActionResult GenerateVerificationCertificatePdf(DataTable reportData, string requestNo)
    {
        LocalReport localReport = new LocalReport();
        string format = "PDF";
        byte[] renderedBytes = null;

        try
        {
            // Get RDLC file path
            string reportPath = Path.Combine("RDLCReports", "CertificateOfSigned.rdlc");

            if (!System.IO.File.Exists(reportPath))
                return NotFound(new { message = "Certificate verification template file not found" });

            localReport.ReportPath = reportPath;

            // Add data source
            localReport.DataSources.Add(new ReportDataSource("CertificateDataSet", reportData));

            // Enable external images (for logos, photos, signatures)
           localReport.EnableExternalImages = true;
            localReport.EnableHyperlinks = true;

            // Refresh report
            localReport.Refresh();

            // Generate filename
            string fileName = $"Certificate_Verification_{requestNo}.pdf";

            // Configure device info for PDF
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
                             "  <MarginTop>1cm</MarginTop>" +
                             "  <MarginLeft>1cm</MarginLeft>" +
                             "  <MarginRight>1cm</MarginRight>" +
                             "  <MarginBottom>1cm</MarginBottom>" +
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

            // Render the report
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
                out warnings
            );

            // Validate rendered output
            if (renderedBytes == null || renderedBytes.Length == 0)
                return StatusCode(500, new { message = "Failed to generate certificate verification PDF - rendered bytes are empty" });

            // Return PDF file
            return File(renderedBytes, "application/pdf", fileName);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error generating certificate verification PDF", error = ex.Message, stackTrace = ex.StackTrace });
        }
        finally
        {
            localReport.Dispose();
            GC.SuppressFinalize(localReport);
        }
    }
}


// with two parameter 

