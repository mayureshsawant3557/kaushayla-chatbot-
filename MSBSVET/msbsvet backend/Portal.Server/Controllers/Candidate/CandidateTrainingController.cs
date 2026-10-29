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
    public class CandidateTrainingController : ControllerBase
    {
        private readonly ICandidateTraining _candidateTraining;

        // Constructor Dependency Injection
        public CandidateTrainingController(ICandidateTraining candidateTraining)
        {
            _candidateTraining = candidateTraining ?? throw new ArgumentNullException(nameof(candidateTraining));
        }

        // GET api/candidatetraining/{CandidateID}
        [HttpGet]
        [Route("GetCandidateTrainingList")]
        public ActionResult<ApiResponse<List<CandidateTrainingEntity>>> GetCandidateTrainingList(long candidateId)
        {
            try
            {
                var result = _candidateTraining.GetCandidateTrainingList(candidateId);
                if (result == null || result.Count == 0)
                {
                    return NotFound(ApiResponse<string>.ErrorResponse("No training records found for the specified candidate.", 404));
                }

                return Ok(ApiResponse<List<CandidateTrainingEntity>>.SuccessResponse(result, "Training records retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        // GET api/candidatetraining/{TrainingRowID}
        [HttpGet]
        [Route("GetCandidateTraining")]
        public ActionResult<ApiResponse<CandidateTrainingEntity>> GetCandidateTraining(long trainingRowId)
        {
            try
            {
                var result = _candidateTraining.GetCandidateTraining(trainingRowId);
                if (result == null)
                {
                    return NotFound(ApiResponse<string>.ErrorResponse("Training record not found.", 404));
                }

                return Ok(ApiResponse<CandidateTrainingEntity>.SuccessResponse(result, "Training record retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        // POST api/candidatetraining
        [HttpPost]
        [Route("SaveCandidateTraining")]
        public ActionResult<ApiResponse<string>> SaveCandidateTraining([FromBody] CandidateTrainingEntity entity)
        {
            if (entity == null)
            {
                return BadRequest(ApiResponse<string>.ErrorResponse("Training entity cannot be null.", 400));
            }
            try
            {
                var result = _candidateTraining.SaveCandidateTraining(entity);
                if (result.ToUpper() == "N")
                {
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to save training data. Please try again.", 400));
                }
                return Ok(ApiResponse<string>.SuccessResponse("Training data saved successfully.", "Training data saved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        // DELETE api/candidatetraining/{TrainingRowID}
        [HttpPost]
        [Route("DeleteCandidateTraining")]
        public ActionResult<ApiResponse<string>> DeleteCandidateTraining(long trainingRowId, [FromBody] CandidateTrainingEntity entity)
        {
            if (entity == null)
            {
                return BadRequest(ApiResponse<string>.ErrorResponse("Training entity cannot be null.", 400));
            }
            try
            {
                var result = _candidateTraining.DeleteCandidateTraining(entity);
                if (result.ToUpper() == "N")
                {
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to delete training record. Please try again.", 400));
                }
                return Ok(ApiResponse<string>.SuccessResponse("Training record deleted successfully.", "Training record deleted successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }
    }
}
