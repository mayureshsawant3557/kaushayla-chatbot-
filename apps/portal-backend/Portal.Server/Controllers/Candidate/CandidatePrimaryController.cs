using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Portal.Business.Interface.Candidate;
using Portal.Entities.Candidate;
using Portal.Entities.ResponseBody;  // Ensure you're using the correct namespace for ApiResponse
using System;
using System.Data;

namespace Portal.Server.Controllers.Candidate
{
    [Route("api/[controller]")]
    [ApiController]
    public class CandidatePrimaryController : ControllerBase
    {
        private readonly ICandidatePrimary _candidatePrimaryWorker;

        // ✅ Constructor Dependency Injection
        public CandidatePrimaryController(ICandidatePrimary candidatePrimaryWorker)
        {
            _candidatePrimaryWorker = candidatePrimaryWorker ?? throw new ArgumentNullException(nameof(candidatePrimaryWorker));
        }

        // ✅ Get Candidate Primary Details (GET)
        [HttpGet("GetCandidatePrimary")]
        public IActionResult GetCandidatePrimary([FromQuery] long candidateId)
        {
            if (candidateId <= 0)
                return BadRequest(ApiResponse<object>.ErrorResponse("Invalid Candidate ID.", 400));

            var entity = new CandidateInput { CandidateID = candidateId };
            var result = _candidatePrimaryWorker.GetCandidatePrimary(entity);

            if (result == null)
                return NotFound(ApiResponse<object>.ErrorResponse("Candidate primary details not found.", 404));

            return Ok(ApiResponse<object>.SuccessResponse(result, "Candidate primary details retrieved successfully.", 200));
        }

        // ✅ Save Candidate Primary Details (POST)
        [HttpPost("SaveCandidatePrimary")]
        public IActionResult SaveCandidatePrimary([FromBody] CandidatePrimaryEntity entity)
        {
            if (entity == null)
                return BadRequest(ApiResponse<object>.ErrorResponse("Candidate primary entity cannot be null.", 400));

            var result = _candidatePrimaryWorker.SaveCandidatePrimary(entity);

            if (string.IsNullOrEmpty(result) || result == "N")
                return BadRequest(ApiResponse<object>.ErrorResponse("Failed to save candidate primary details.", 400));

            var responseData = new { Message = "Candidate primary details saved successfully.", CandidateID = result };
            return Ok(ApiResponse<object>.SuccessResponse(responseData, "Candidate primary details saved successfully.", 200));
        }

        // ✅ Check if Aadhaar Number is Duplicate (GET)
        [AllowAnonymous]
        [HttpGet("IsAadharNoDuplicate")]
        public IActionResult IsAadharNoDuplicate([FromQuery] string aadharNo, [FromQuery] long candidateId)
        {
            if (string.IsNullOrEmpty(aadharNo))
                return BadRequest(ApiResponse<object>.ErrorResponse("Aadhaar number cannot be null or empty.", 400));

            var result = _candidatePrimaryWorker.IsAadharNoDuplicate(aadharNo, candidateId);

            //if (result == null || result.Rows.Count == 0)
            //    return Ok(ApiResponse<object>.SuccessResponse(new { IsDuplicate = false }, "Aadhaar number is not duplicate.", 200));

            //return Ok(ApiResponse<object>.SuccessResponse(new { IsDuplicate = true }, "Aadhaar number is duplicate.", 200));
            if (result == null || result.Rows.Count == 0)
            {
                return Ok(ApiResponse<object>.SuccessResponse(
                    new { IsDuplicate = false },
                    "Aadhaar number is not duplicate.",
                    200));
            }

            var row = result.Rows[0];

            string candidateName = row["CandidateName"]?.ToString();
            string applicationId = row["ApplicationID"]?.ToString();

            if (string.IsNullOrWhiteSpace(candidateName) &&
                string.IsNullOrWhiteSpace(applicationId))
            {
                return Ok(ApiResponse<object>.SuccessResponse(
                    new { IsDuplicate = false },
                    "Aadhaar number is not duplicate.",
                    200));
            }

           
            return Ok(ApiResponse<object>.SuccessResponse(
                new
                {
                    IsDuplicate = true,
                    CandidateName = candidateName,
                    ApplicationID = applicationId
                },
                "Aadhaar number is duplicate.",
                200));
        }

            // ✅ Update Aadhaar Number (PUT)
            [HttpPut("UpdateAadharNo")]
        public IActionResult UpdateAadharNo([FromQuery] string aadhaarNo, [FromBody] CandidateInput entity, [FromQuery] string aadhaarFilePath)
        {
            if (entity == null)
                return BadRequest(ApiResponse<object>.ErrorResponse("Candidate input cannot be null.", 400));

            if (string.IsNullOrEmpty(aadhaarNo))
                return BadRequest(ApiResponse<object>.ErrorResponse("Aadhaar number cannot be null or empty.", 400));

            var result = _candidatePrimaryWorker.UpdateAadharNo(aadhaarNo, entity, aadhaarFilePath);

            if (string.IsNullOrEmpty(result) || result == "N")
                return BadRequest(ApiResponse<object>.ErrorResponse("Failed to update Aadhaar number.", 400));

            var responseData = new { Message = "Aadhaar number updated successfully.", CandidateID = entity.CandidateID };
            return Ok(ApiResponse<object>.SuccessResponse(responseData, "Aadhaar number updated successfully.", 200));
        }

        [HttpGet("GetCandidateDashboard")]
        public IActionResult GetCandidateDashboard([FromQuery] long candidateId)
        {
            if (candidateId <= 0)
                return BadRequest(ApiResponse<object>.ErrorResponse("Invalid Candidate ID.", 400));

            var result = _candidatePrimaryWorker.GetCandidateDashboard(candidateId);

            if (result == null)
                return NotFound(ApiResponse<object>.ErrorResponse("Candidate dashboard not found.", 404));

            return Ok(ApiResponse<object>.SuccessResponse(result, "Candidate dashboard retrieved successfully.", 200));
        }
    }
}
