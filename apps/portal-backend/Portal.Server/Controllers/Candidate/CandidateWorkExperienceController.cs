using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Portal.Business.Interface.Candidate;
using Portal.Entities.Candidate;
using Portal.Entities.ResponseBody;
using System;
using System.Collections.Generic;
using System.Data;

namespace Portal.Server.Controllers.Candidate
{
    [Route("api/[controller]")]
    [ApiController]
    public class CandidateWorkExperienceController : ControllerBase
    {
        private readonly ICandidateWorkExperience _candidateWorkExperience;
        private readonly ILogger<CandidateWorkExperienceController> _logger;

        public CandidateWorkExperienceController(ICandidateWorkExperience candidateWorkExperience, ILogger<CandidateWorkExperienceController> logger)
        {
            _candidateWorkExperience = candidateWorkExperience ?? throw new ArgumentNullException(nameof(candidateWorkExperience));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        [HttpGet("GetWorkExperienceList")]
        public IActionResult GetWorkExperienceList([FromQuery] long candidateId)
        {
            if (candidateId <= 0)
            {
                return BadRequest(ApiResponse<string>.ErrorResponse("Invalid Candidate ID.", 400));
            }

            try
            {
                List<CandidateWorkExperienceEntity> result = _candidateWorkExperience.GetCandidateWorkExperienceList(candidateId);

                if (result == null || result.Count == 0)
                {
                    return NotFound(ApiResponse<string>.ErrorResponse("No work experience records found.", 404));
                }

                return Ok(ApiResponse<object>.SuccessResponse(result, "Work experience records retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving work experience records");
                return StatusCode(500, ApiResponse<string>.ErrorResponse("An error occurred while fetching data.", 500));
            }
        }

        [HttpGet("GetWorkExperience")]
        public IActionResult GetWorkExperience([FromQuery] long workExperienceRowId)
        {
            if (workExperienceRowId <= 0)
            {
                return BadRequest(ApiResponse<string>.ErrorResponse("Invalid Work Experience Row ID.", 400));
            }

            try
            {
                CandidateWorkExperienceEntity result = _candidateWorkExperience.GetCandidateWorkExperience(workExperienceRowId);
                if (result == null)
                {
                    return NotFound(ApiResponse<string>.ErrorResponse("Work experience not found.", 404));
                }
                return Ok(ApiResponse<object>.SuccessResponse(result, "Work experience details retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving work experience");
                return StatusCode(500, ApiResponse<string>.ErrorResponse("An error occurred.", 500));
            }
        }

        [HttpPost("SaveWorkExperience")]
        public IActionResult SaveWorkExperience([FromBody] CandidateWorkExperienceEntity entity)
        {
            if (entity == null)
            {
                return BadRequest(ApiResponse<string>.ErrorResponse("Invalid request data.", 400));
            }

            try
            {
                string result = _candidateWorkExperience.SaveCandidateWorkExperience(entity);
                if (result.ToUpper() == "N")
                {
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to save training data. Please try again.", 400));
                }
                return Ok(ApiResponse<string>.SuccessResponse(result, "Work experience saved successfully.", 200));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving work experience");
                return StatusCode(500, ApiResponse<string>.ErrorResponse("An error occurred.", 500));
            }
        }

        [HttpDelete("DeleteWorkExperience")]
        public IActionResult DeleteWorkExperience([FromBody] CandidateWorkExperienceEntity entity)
        {
            if (entity == null || entity.WorkExperienceRowID <= 0)
            {
                return BadRequest(ApiResponse<string>.ErrorResponse("Invalid request data.", 400));
            }

            try
            {
                string result = _candidateWorkExperience.DeleteCandidateWorkExperience(entity);
                if (result.ToUpper() == "N")
                {
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to save training data. Please try again.", 400));
                }
                return Ok(ApiResponse<string>.SuccessResponse(result, "Work experience deleted successfully.", 200));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting work experience");
                return StatusCode(500, ApiResponse<string>.ErrorResponse("An error occurred.", 500));
            }
        }
    }
}
