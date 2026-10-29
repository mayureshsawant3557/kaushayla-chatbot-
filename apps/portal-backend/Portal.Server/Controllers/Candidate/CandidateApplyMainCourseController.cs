using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Portal.Business.Interface.Candidate;
using Portal.Entities.Candidate;
using Portal.Entities.ResponseBody;
using System;

namespace Portal.Server.Controllers.Candidate
{
    [Route("api/[controller]")]
    [ApiController]
    public class CandidateApplyMainCourseController : ControllerBase
    {
        private readonly ICandidateApplyMainCourse _candidateApplyMainCourse;
        private readonly ILogger<CandidateApplyMainCourseController> _logger;

        public CandidateApplyMainCourseController(
            ICandidateApplyMainCourse candidateApplyMainCourse,
            ILogger<CandidateApplyMainCourseController> logger)
        {
            _candidateApplyMainCourse = candidateApplyMainCourse ?? throw new ArgumentNullException(nameof(candidateApplyMainCourse));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Get a list of applied main courses for a candidate.
        /// </summary>
        /// <param name="candidateId">Candidate ID</param>
        /// <returns>List of applied main courses</returns>
        [HttpGet("GetAppliedMainCourse")]
        public IActionResult GetAppliedMainCourse([FromQuery] long candidateId)
        {
            if (candidateId <= 0)
            {
                _logger.LogWarning("Invalid Candidate ID: {CandidateId}", candidateId);
                return BadRequest(ApiResponse<string>.ErrorResponse("Invalid Candidate ID.", 400));
            }

            try
            {
                var result = _candidateApplyMainCourse.GetAppliedMainCourse(candidateId);

                if (result == null || result.Count == 0)
                {
                    _logger.LogWarning("No applied main courses found for Candidate ID: {CandidateId}", candidateId);
                    return NotFound(ApiResponse<string>.ErrorResponse("No applied main courses found.", 404));
                }

                _logger.LogInformation("Returning {Count} applied main courses for Candidate ID: {CandidateId}", result.Count, candidateId);
                return Ok(ApiResponse<object>.SuccessResponse(result, "Applied main courses retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while retrieving applied main courses.");
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        /// <summary>
        /// Save applied main course data.
        /// </summary>
        /// <param name="entity">MainCourseApplyEntity</param>
        /// <returns>Save status message</returns>
        [HttpPost("SaveAppliedMainCourse")]
        public IActionResult SaveAppliedMainCourse([FromBody] MainCourseApplyEntity entity)
        {
            if (entity == null)
            {
                _logger.LogWarning("Received a null request body for SaveAppliedMainCourse.");
                return BadRequest(ApiResponse<string>.ErrorResponse("Invalid request data.", 400));
            }

            try
            {
                var result = _candidateApplyMainCourse.SaveAppliedMainCourse(entity);
                if (result == "Y")
                {
                    return CreatedAtAction(
                        nameof(GetAppliedMainCourse),
                        new { candidateId = entity.CandidateID },
                        ApiResponse<object>.SuccessResponse(
                            result,
                            "Applied main course saved successfully.",
                            StatusCodes.Status201Created
                        )
                    );
                }

                // ❌ FAILURE / BUSINESS MESSAGE FROM DB
                return Ok(
                    ApiResponse<object>.ErrorResponse(
                        
                        result?.ToString() ?? "Unable to save applied main course."
                        //StatusCodes.Status200OK
                    )
                );
            
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while saving applied main course.");
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }
        [HttpGet("GetMainCourseAppliedFor")]
        public IActionResult GetMainCourseAppliedFor(int applicationID)
        {
            if(applicationID==0)
            {
                _logger.LogWarning("Invalid Application ID: {ApplicationID}", applicationID);
                return BadRequest(ApiResponse<string>.ErrorResponse("Invalid Application ID.", 400));
            }
            try
            {
                var result = _candidateApplyMainCourse.GetMainCourseAppliedFor(applicationID);
                _logger.LogInformation("Candidate Get Applied Main Course Status", result, applicationID);
                return Ok(ApiResponse<object>.SuccessResponse(result, "Candidate Get Applied Main Course Status.", 200));
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "Error while saving applied main course.");
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }
    }
}
