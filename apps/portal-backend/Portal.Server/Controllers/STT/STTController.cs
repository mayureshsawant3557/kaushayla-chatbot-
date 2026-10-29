using Microsoft.AspNetCore.Mvc;
using Portal.Business;
using Portal.Business.Interface.Abstractions.Authentication;
using Portal.Entities;
using Portal.Entities.ResponseBody;
using System.Data;
using System.Security.Claims;

namespace Portal.Server.Controllers.STT
{
    [Route("api/[controller]")]
    [ApiController]
    public class STTController : ControllerBase
    {
        private readonly ISTTExam _service;

        public STTController(ISTTExam service)
        {
            _service = service;
        }

        [HttpGet("filters")]
        public IActionResult GetFilters([FromQuery] long? userId)
        {
            try
            {
                var effectiveUserId = (userId.HasValue && userId.Value > 0) ? userId.Value : GetUserId();
                if (effectiveUserId <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("A valid User is required.", 400));

                var result = _service.GetFilters(effectiveUserId);
                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Filters retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpGet("candidates/{batchId:long}")]
        public IActionResult GetCandidates(long batchId)
        {
            try
            {
                if (batchId <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("A valid Batch is required.", 400));

                var result = _service.GetCandidatesByBatch(batchId);
                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Candidates retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpGet("assessment/{batchId:long}")]
        public IActionResult GetAssessment(long batchId)
        {
            try
            {
                if (batchId <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("A valid Batch is required.", 400));

                // DataSet: Tables[0] = header, Tables[1] = details.
                var result = _service.GetAssessmentByBatch(batchId);
                return Ok(ApiResponse<DataSet>.SuccessResponse(result, "Assessment retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpPost("save")]
        public IActionResult Save([FromBody] STTSaveRequest request)
        {
            return Persist(request, isSubmit: false);
        }

        [HttpPost("submit")]
        public IActionResult Submit([FromBody] STTSaveRequest request)
        {
            return Persist(request, isSubmit: true);
        }

        [HttpGet("dashboard/{batchId:long}")]
        public IActionResult GetDashboard(long batchId)
        {
            try
            {
                if (batchId <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("A valid Batch is required.", 400));

                var result = _service.GetDashboardSummary(batchId);
                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Dashboard summary retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        // ---------------------------------------------------------------------
        //  Shared Save / Submit handler
        // ---------------------------------------------------------------------
        private IActionResult Persist(STTSaveRequest request, bool isSubmit)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Validation failed.", 400));

                EnsureIpAddress(request);
                var userId = GetUserId();

                var result = isSubmit
                    ? _service.Submit(request, userId)
                    : _service.SaveDraft(request, userId);

                var message = isSubmit
                    ? "Assessment submitted successfully."
                    : "Assessment saved as draft successfully.";

                return Ok(ApiResponse<DataTable>.SuccessResponse(result, message, 200));
            }
            catch (ArgumentException ax)
            {
                // Validation failure raised by the service.
                return BadRequest(ApiResponse<string>.ErrorResponse(ax.Message, 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        /// <summary>Falls back to the connection's remote IP when the client did
        /// not supply one in the payload.</summary>
        private void EnsureIpAddress(STTSaveRequest request)
        {
            if (request != null && string.IsNullOrWhiteSpace(request.IpAddress))
                request.IpAddress = HttpContext?.Connection?.RemoteIpAddress?.ToString();
        }

        /// <summary>Resolves the logged-in UserId from the JWT claims.
        /// Adjust the claim type to match the project's token issuer.</summary>
        private int GetUserId()
        {
            var claim = User.FindFirstValue("UserID")
                        ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
            return int.TryParse(claim, out var id) ? id : 0;
        }
        [HttpGet("institute-course-active-batches")]
        public IActionResult GetInstituteCourseActiveBatches()
        {
            try
            {
                var result = _service.GetInstituteCourseActiveBatches();

                return Ok(
                    ApiResponse<DataSet>.SuccessResponse(
                        result,
                        "Institute, course and active batches retrieved successfully.",
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
        [HttpGet("course-subjects")]
        public IActionResult GetCourseSubjects(
    [FromQuery] string courseCode)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(courseCode))
                {
                    return BadRequest(
                        ApiResponse<string>.ErrorResponse(
                            "Course code is required.",
                            400
                        )
                    );
                }

                var result = _service.GetCourseSubjects(courseCode);

                return Ok(
                    ApiResponse<DataSet>.SuccessResponse(
                        result,
                        "Course subjects retrieved successfully.",
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

        [HttpGet("BatchAgencies")]
        public IActionResult GetBatchAgencies(
    [FromQuery] long BatchID)
        {
            try
            {
                if (BatchID <= 0)
                {
                    return BadRequest(
                        ApiResponse<string>.ErrorResponse(
                            "Invalid Batch ID.", 400));
                }

                var result = _service.GetBatchAgencies(BatchID);

                return Ok(
                    ApiResponse<DataSet>.SuccessResponse(
                        result,
                        "Agencies retrieved successfully.",
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
        [HttpGet("CandidatesByBatchWithFeeStatus")]
        public IActionResult GetCandidatesByBatchWithFeeStatus(
    [FromQuery] long BatchID)
        {
            try
            {
                if (BatchID <= 0)
                {
                    return BadRequest(
                        ApiResponse<string>.ErrorResponse(
                            "Invalid Batch ID.", 400));
                }

                var result = _service.GetCandidatesByBatchWithFeeStatus(BatchID);

                return Ok(
                    ApiResponse<DataSet>.SuccessResponse(
                        result,
                        "Candidates with fee status retrieved successfully.",
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
        [HttpPost("save-batch-agency-mapping")]
        public IActionResult SaveBatchAgencyMapping(
    [FromBody] SaveBatchAgencyMappingRequest request)
        {
            try
            {
                if (request == null)
                {
                    return BadRequest(
                        ApiResponse<string>.ErrorResponse(
                            "Request is required.",
                            400
                        )
                    );
                }

                if (request.BatchID <= 0)
                {
                    return BadRequest(
                        ApiResponse<string>.ErrorResponse(
                            "Valid BatchID is required.",
                            400
                        )
                    );
                }

                if (request.UserID <= 0)
                {
                    return BadRequest(
                        ApiResponse<string>.ErrorResponse(
                            "Valid UserID is required.",
                            400
                        )
                    );
                }

                var result = _service.SaveBatchAgencyMapping(request);

                return Ok(
                    ApiResponse<DataSet>.SuccessResponse(
                        result,
                        "Batch agency mapping saved successfully.",
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
        [HttpGet("AgenciesForReassign")]
        public IActionResult GetAgenciesForReassign(
    [FromQuery] long BatchID)
        {
            try
            {
                if (BatchID <= 0)
                {
                    return BadRequest(
                        ApiResponse<string>.ErrorResponse(
                            "Invalid Batch ID.", 400));
                }

                var result = _service.GetAgenciesForReassign(BatchID);

                return Ok(
                    ApiResponse<DataSet>.SuccessResponse(
                        result,
                        "Agencies retrieved successfully for reassignment.",
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
        [HttpGet("assessment-courses")]
public IActionResult GetAssessmentCourses([FromQuery] long batchId)
{
    try
    {
        if (batchId <= 0)
        {
            return BadRequest(
                ApiResponse<string>.ErrorResponse(
                    "Invalid Batch ID.", 400));
        }

        var result = _service.GetAssessmentCourses(batchId);

        return Ok(
            ApiResponse<DataSet>.SuccessResponse(
                result,
                "Assessment courses retrieved successfully.",
                200));
    }
    catch (Exception ex)
    {
        return StatusCode(
            500,
            ApiResponse<string>.ErrorResponse(
                $"Internal server error: {ex.Message}", 500));
    }
}
    }
}
