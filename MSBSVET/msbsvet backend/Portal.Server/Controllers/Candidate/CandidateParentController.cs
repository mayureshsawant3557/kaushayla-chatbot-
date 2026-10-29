using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Portal.Business.Interface.Candidate;
using Portal.Entities.Candidate;
using Portal.Entities.ResponseBody;  // Ensure you're using the correct namespace for ApiResponse
using System;

namespace Portal.Server.Controllers.Candidate
{
    [Route("api/[controller]")]
    [ApiController]
    public class CandidateParentController : ControllerBase
    {
        private readonly ICandidateParent _candidateParentService;

        // Dependency Injection to ensure that the service instance is provided
        public CandidateParentController(ICandidateParent candidateParentService)
        {
            _candidateParentService = candidateParentService
                ?? throw new ArgumentNullException(nameof(candidateParentService));
        }

        // ✅ Get Candidate Parent Details (GET)
        [HttpGet]
        [Route("GetCandidateParent")]
        public IActionResult GetCandidateParent([FromQuery] CandidateInput candidateInput)
        {
            if (candidateInput == null)
            {
                return BadRequest(ApiResponse<object>.ErrorResponse("CandidateInput cannot be null.", 400));
            }

            var candidateParent = _candidateParentService.GetCandidateParent(candidateInput);
            if (candidateParent == null)
            {
                return NotFound(ApiResponse<object>.ErrorResponse("Candidate parent details not found.", 404));
            }

            return Ok(ApiResponse<object>.SuccessResponse(candidateParent, "Candidate parent details retrieved successfully.", 200));
        }

        // ✅ Save Candidate Parent Details (POST)
        [HttpPost]
        [Route("SaveCandidateParent")]
        public IActionResult SaveCandidateParent([FromBody] CandidateParentEntity candidateParent)
        {
            if (candidateParent == null)
            {
                return BadRequest(ApiResponse<object>.ErrorResponse("CandidateParentEntity cannot be null.", 400));
            }

            var result = _candidateParentService.SaveCandidateParent(candidateParent);
            if (string.IsNullOrEmpty(result))
            {
                return BadRequest(ApiResponse<object>.ErrorResponse("Failed to save candidate parent details.", 400));
            }

            return Ok(ApiResponse<object>.SuccessResponse(new { Message = "Candidate parent details saved successfully.", CandidateParentId = result }));
            

        }

    }
}
