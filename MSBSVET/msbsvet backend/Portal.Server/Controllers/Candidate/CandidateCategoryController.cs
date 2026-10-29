using Microsoft.AspNetCore.Mvc;
using Portal.Business.Interface.Candidate;
using Portal.Entities.Candidate;
using Portal.Entities.ResponseBody;  // Ensure you're using the correct namespace for ApiResponse
using System;

namespace Portal.Server.Controllers.Candidate
{
    [Route("api/[controller]")]
    [ApiController]
    public class CandidateCategoryController : ControllerBase
    {
        private readonly ICandidateCategory _candidateCategoryService;

        // Dependency Injection: The ICandidateCategory service is injected via constructor
        public CandidateCategoryController(ICandidateCategory candidateCategoryService)
        {
            _candidateCategoryService = candidateCategoryService
                ?? throw new ArgumentNullException(nameof(candidateCategoryService));
        }

        [HttpGet("GetCandidateCategory")]
        public IActionResult GetCandidateCategory([FromQuery] CandidateInput candidateInput)
        {
            if (candidateInput == null)
            {
                return BadRequest(ApiResponse<object>.ErrorResponse("CandidateInput cannot be null.", 400));
            }

            var candidateCategory = _candidateCategoryService.GetCandidateCategory(candidateInput);
            if (candidateCategory == null)
            {
                return NotFound(ApiResponse<object>.ErrorResponse("Candidate category not found.", 404));
            }

            return Ok(ApiResponse<object>.SuccessResponse(candidateCategory, "Candidate category retrieved successfully.", 200));
        }

        [HttpPost("SaveCandidateCategory")]
        public IActionResult SaveCandidateCategory([FromBody] CandidateCategoryEntity candidateCategory)
        {
            if (candidateCategory == null)
            {
                return BadRequest(ApiResponse<object>.ErrorResponse("CandidateCategoryEntity cannot be null.", 400));
            }

            var result = _candidateCategoryService.SaveCandidateCategory(candidateCategory);
            if (string.IsNullOrEmpty(result))
            {
                return BadRequest(ApiResponse<object>.ErrorResponse("Failed to save candidate category.", 400));
            }

            return Ok(ApiResponse<object>.SuccessResponse(new { Message = "Candidate category saved successfully.", CandidateCategoryId = result }));
        }

    }
}
