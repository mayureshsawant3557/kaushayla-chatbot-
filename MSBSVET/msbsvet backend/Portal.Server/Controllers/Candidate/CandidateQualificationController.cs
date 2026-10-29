using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Portal.Business.Interface.Candidate;
using Portal.Entities.Candidate;
using Portal.Entities.ResponseBody;
using System;
using System.Collections.Generic;

namespace Portal.Server.Controllers.Candidate
{
    [Route("api/[controller]")]
    [ApiController]
    public class CandidateQualificationController : ControllerBase
    {
        private readonly ICandidateQualification _candidateQualification;

        // Constructor Dependency Injection
        public CandidateQualificationController(ICandidateQualification candidateQualification)
        {
            _candidateQualification = candidateQualification ?? throw new ArgumentNullException(nameof(candidateQualification));
        }

        // GET: api/CandidateQualification/{candidateId}
        [HttpGet("{candidateId}")]
        public ActionResult<ApiResponse<List<CandidateQualificationEntity>>> GetCandidateQualificationList(long candidateId)
        {
            if (candidateId <= 0)
            {
                return BadRequest(ApiResponse<string>.ErrorResponse("Invalid candidate ID.", 400));
            }

            try
            {
                var qualifications = _candidateQualification.GetCandidateQualificationList(candidateId);
                if (qualifications == null || qualifications.Count == 0)
                {
                    return NotFound(ApiResponse<string>.ErrorResponse("No qualifications found for the given candidate ID.", 404));
                }

                return Ok(ApiResponse<List<CandidateQualificationEntity>>.SuccessResponse(qualifications, "Qualifications retrieved successfully.", 200));  // Return list of qualifications with 200 OK
            }
            catch (Exception ex)
            {
                // Log the exception and return a server error
                return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<string>.ErrorResponse($"Error: {ex.Message}", 500));
            }
        }

        // GET: api/CandidateQualification/qualification/{qualificationRowId}
        [HttpGet("qualification/{qualificationRowId}")]
        public ActionResult<ApiResponse<CandidateQualificationEntity>> GetCandidateQualification(long qualificationRowId)
        {
            if (qualificationRowId <= 0)
            {
                return BadRequest(ApiResponse<string>.ErrorResponse("Invalid qualification row ID.", 400));
            }

            try
            {
                var qualification = _candidateQualification.GetCandidateQualification(qualificationRowId);
                if (qualification == null)
                {
                    return NotFound(ApiResponse<string>.ErrorResponse("Qualification not found.", 404));
                }

                return Ok(ApiResponse<CandidateQualificationEntity>.SuccessResponse(qualification, "Qualification retrieved successfully.", 200));  // Return qualification with 200 OK
            }
            catch (Exception ex)
            {
                // Log the exception and return a server error
                return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<string>.ErrorResponse($"Error: {ex.Message}", 500));
            }
        }

        // POST: api/CandidateQualification
        [HttpPost]
        public ActionResult<ApiResponse<string>> SaveCandidateQualification([FromBody] CandidateQualificationEntity entity)
        {
            if (entity == null)
            {
                return BadRequest(ApiResponse<string>.ErrorResponse("Qualification entity cannot be null.", 400));
            }

            try
            {
                var result = _candidateQualification.SaveCandidateQualification(entity);
                if (string.Equals(result, "N", StringComparison.OrdinalIgnoreCase))
                {
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to save qualification. Please try again.", 400));
                }

                return Ok(ApiResponse<string>.SuccessResponse("Qualification saved successfully.", "Qualification saved successfully.", 200));
            }
            catch (Exception ex)
            {
                // Log the exception and return a server error
                return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<string>.ErrorResponse($"Error: {ex.Message}", 500));
            }
        }



        [HttpDelete("{qualificationRowId}")]
        public ActionResult<ApiResponse<string>> DeleteCandidateQualification(
    long qualificationRowId,
    [FromQuery] long candidateId,
    [FromQuery] string userLoginId,
    [FromQuery] string pageCode)
        {
            if (qualificationRowId <= 0 ||
                candidateId <= 0 ||
                string.IsNullOrWhiteSpace(userLoginId) ||
                string.IsNullOrWhiteSpace(pageCode))
            {
                return BadRequest(ApiResponse<string>.ErrorResponse(
                    "Invalid input parameters.", 400));
            }

            try
            {
                var entity = new CandidateQualificationEntity
                {
                    QualificationRowID = qualificationRowId,
                    CandidateID = candidateId,
                    UserLoginID = userLoginId,  
                    PageCode = pageCode,
                    IPAddress = HttpContext.Connection.RemoteIpAddress?.ToString()
                };

                var result = _candidateQualification.DeleteCandidateQualification(entity);

                if (string.Equals(result, "N", StringComparison.OrdinalIgnoreCase))
                {
                    return BadRequest(ApiResponse<string>.ErrorResponse(
                        "Failed to delete qualification. Please try again.", 400));
                }

                return Ok(ApiResponse<string>.SuccessResponse(
                    result, "Qualification deleted successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>.ErrorResponse(ex.Message, 500));
            }
        }


    }
}
