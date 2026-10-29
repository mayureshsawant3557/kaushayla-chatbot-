using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Portal.Business.Interface.Report;
using Portal.Entities.ResponseBody;
using System;
using System.Data;

namespace Portal.Server.Controllers.Report
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReportByInstituteController : ControllerBase
    {
        private readonly IReport _reportWorker;

        public ReportByInstituteController(IReport reportWorker)
        {
            _reportWorker = reportWorker ?? throw new ArgumentNullException(nameof(reportWorker));
        }

        #region Reports List and Generation

        [HttpGet("reports-list")]
        public IActionResult GetReportsList()
        {
            try
            {
                var result = _reportWorker.GetReportsList();
                return Ok(ApiResponse<DataSet>.SuccessResponse(result, "Reports list retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpGet("generate-report/{reportId}/{userTypeId}")]
        public IActionResult GenerateReport(int reportId, int userTypeId)
        {
            try
            {
                if (reportId <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid report ID.", 400));

                var result = _reportWorker.GenerateReport(reportId, userTypeId);
                return Ok(ApiResponse<DataSet>.SuccessResponse(result, "Report generated successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }
        [HttpGet("GetGreenFieldReportData")]
        public IActionResult GetGreenFieldReportData(
        int financialYearID,
        int regionID,
        int districtID,
        int talukaID,
        int UserTypeID,
        string userLoginID)
        {
            try
            {
                if (financialYearID <= 0)
                {
                    return BadRequest(
                        ApiResponse<string>.ErrorResponse(
                            "Invalid financial year ID.", 400));
                }

                if (string.IsNullOrWhiteSpace(userLoginID))
                {
                    return BadRequest(
                        ApiResponse<string>.ErrorResponse(
                            "User login ID is required.", 400));
                }

                var result = _reportWorker.GetGreenFieldReportData(
                    financialYearID,
                    regionID,
                    districtID,
                    talukaID,
                    UserTypeID,
                    userLoginID
                );

                return Ok(
                    ApiResponse<DataTable>.SuccessResponse(
                        result,
                        "Green Field Report Data retrieved successfully.",
                        200));
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    ApiResponse<string>.ErrorResponse(
                        $"Internal Server Error: {ex.Message}", 500));
            }
        }

        #endregion

        #region Candidate Reports

        [HttpGet("candidate-list")]
        public IActionResult GetCandidateList(long courseId, long collegeId, int admissionYearId, string flag, int regionId)
        {
            try
            {
                if (courseId <= 0 || collegeId <= 0 || admissionYearId <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid course ID, college ID, or admission year ID.", 400));

                var result = _reportWorker.GetCandidateList(courseId, collegeId, admissionYearId, flag, regionId);
                return Ok(ApiResponse<DataSet>.SuccessResponse(result, "Candidate list retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpGet("iti-principal-details")]
        public IActionResult GetITIPrincipalDetails(
      int managementType,
      string instType1,
      string instType2)
        {
            try
            {
                var result = _reportWorker.GetITIPrincipalDetails(
                    managementType,
                    instType1,
                    instType2);

                return Ok(ApiResponse<DataSet>.SuccessResponse(
                    result,
                    "ITI Principal details retrieved successfully.",
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

        [HttpGet("management-types")]
        public IActionResult GetManagementTypes()
        {
            try
            {
                var result = _reportWorker.GetManagementTypes();

                return Ok(ApiResponse<DataSet>.SuccessResponse(
                    result,
                    "Management types retrieved successfully.",
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

        #endregion

        #region Composite Reports

        [HttpGet("composite-report")]
        public IActionResult GetCompositReport(int userTypeId, string userLoginId, int admissionSessionId)
        {
            try
            {
                if (userTypeId <= 0 || admissionSessionId <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid user type ID or admission session ID.", 400));

                if (string.IsNullOrWhiteSpace(userLoginId))
                    return BadRequest(ApiResponse<string>.ErrorResponse("User login ID cannot be empty.", 400));

                var result = _reportWorker.GetCompositReport(userTypeId, userLoginId, admissionSessionId);
                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Composite report retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpGet("composite-report-by-district")]
        public IActionResult GetCompositReportByDistrict(int userTypeId, int regionId, int admissionSessionId)
        {
            try
            {
                if (userTypeId <= 0 || regionId <= 0 || admissionSessionId <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid user type ID, region ID, or admission session ID.", 400));

                var result = _reportWorker.GetCompositReportByDistrict(userTypeId, regionId, admissionSessionId);
                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Composite report by district retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpGet("composite-report-by-institute")]
        public IActionResult GetCompositeReportByInstitute(int userTypeId, long districtId, int admissionSessionId)
        {
            try
            {
                if (userTypeId <= 0 || districtId <= 0 || admissionSessionId <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid user type ID, district ID, or admission session ID.", 400));

                var result = _reportWorker.GetCompositeReportByInstitute(userTypeId, districtId, admissionSessionId);
                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Composite report by institute retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpGet("composite-report-by-course")]
        public IActionResult GetCompositeReportByCourse(int userTypeId, long instituteId, int admissionSessionId)
        {
            try
            {
                if (userTypeId <= 0 || instituteId <= 0 || admissionSessionId <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid user type ID, institute ID, or admission session ID.", 400));

                var result = _reportWorker.GetCompositeReportByCourse(userTypeId, instituteId, admissionSessionId);
                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Composite report by course retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpGet("composite-report-by-batch")]
        public IActionResult GetCompositeReportByBatch(int userTypeId, long instituteId, long courseId, int admissionSessionId)
        {
            try
            {
                if (userTypeId <= 0 || instituteId <= 0 || courseId <= 0 || admissionSessionId <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid user type ID, institute ID, course ID, or admission session ID.", 400));

                var result = _reportWorker.GetCompositeReportByBatch(userTypeId, instituteId, courseId, admissionSessionId);
                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Composite report by batch retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        #endregion

        #region District and Statistics Reports

        [HttpGet("district-wise-marksheet-certificate-statistic")]
        public IActionResult DistrictWiseMarkSheetCertificateStatistic(int districtId, int examinationId)
        {
            try
            {
                if (districtId <= 0 || examinationId <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid district ID or examination ID.", 400));

                var result = _reportWorker.DistrictWiseMarkSheetCertificateStatistic(districtId, examinationId);
                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "District wise marksheet certificate statistics retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        #endregion

        #region Attendance Reports

        [HttpGet("attendance-subjects-by-center")]
        public IActionResult GetAttendanceSubjectsByCenterWise(long centerId, int examinationId)
        {
            try
            {
                if (centerId <= 0 || examinationId <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid center ID or examination ID.", 400));

                var result = _reportWorker.GetAttendanceSubjectsByCenterWise(centerId, examinationId);
                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Attendance subjects by center retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }
        
        [HttpGet("step-coordinators-list")]
        public IActionResult GetSTEPCoordinatorsList()
        {
            try
            {
                var result = _reportWorker.GetSTEPCoordinatorsList();
                return Ok(ApiResponse<DataSet>.SuccessResponse(result, "STEP Coordinators list retrieved successfully.", 200)); 
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }


        #endregion


        [HttpGet("GetReportGazette")]
        public IActionResult GetGazetteReportData(int examinationId, char isResultFresh, long instituteId, char gazetteType, int districtId)
        {
            try
            {
                if(examinationId<=0)
                {
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid examination ID.", 400));
                }
                var result = _reportWorker.GetGazetteReportData(examinationId, isResultFresh, instituteId, gazetteType, districtId);
                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Gazette Report Data retrieved successfully.", 200));
            }
            catch(Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal Server Error: {ex.Message}", 500));
            }
        }
    }
}