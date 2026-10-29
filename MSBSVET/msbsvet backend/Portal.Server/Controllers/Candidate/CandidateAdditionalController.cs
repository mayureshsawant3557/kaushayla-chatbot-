using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Portal.Business.Interface.Candidate;
using Portal.Entities.Candidate;
using Portal.Entities.ResponseBody;
using Portal.Entities.Staff;


namespace Portal.Server.Controllers.Candidate
{
    [Route("api/[controller]")]
    [ApiController]
    public class CandidateAdditionalController : ControllerBase
    {
        private readonly ICandidateAdditional _candidateAdditional;

        public CandidateAdditionalController(ICandidateAdditional candidateAdditional)
        {
            _candidateAdditional = candidateAdditional ?? throw new ArgumentNullException(nameof(candidateAdditional));
        }

        [HttpGet]
        [Route("GetCandidateAdditional")]
        public IActionResult GetCandidateAdditional([FromQuery] long candidateId)
        {
            Console.WriteLine($"Received request for CandidateID: {candidateId}");

            if (candidateId <= 0)
                return BadRequest(ApiResponse<string>.ErrorResponse("Invalid Candidate ID.", 400));

            var entity = new CandidateInput { CandidateID = candidateId };
            var result = _candidateAdditional.GetCandidateAdditional(entity);

            if (result == null)
            {
                Console.WriteLine($"No data found for CandidateID: {candidateId}");
                return NotFound(ApiResponse<string>.ErrorResponse("Candidate additional details not found.", 404));
            }

            Console.WriteLine($"Returning data for CandidateID: {candidateId}");
            return Ok(ApiResponse<object>.SuccessResponse(result, "Candidate additional details retrieved successfully.", 200));
        }

        [HttpPost]
        [Route("SaveCandidateAdditional")]
        public IActionResult SaveCandidateAdditional([FromBody] CandidateAdditionalEntity entity)
        {
            if (entity == null)
                return BadRequest(ApiResponse<string>.ErrorResponse("Invalid request data.", 400));

            var result = _candidateAdditional.SaveCandidateAdditional(entity);
            return Ok(ApiResponse<object>.SuccessResponse(result, "Candidate additional details saved successfully.", 201));
        }

        [HttpGet]
        [Route("GetCandidateLanguageList")]
        public IActionResult GetCandidateLanguageList([FromQuery] long CandidateID)
        {
            if (CandidateID <= 0)
                return BadRequest(ApiResponse<string>.ErrorResponse("Invalid Candidate ID.", 400));

            var result = _candidateAdditional.GetCandidateLanguageList(CandidateID);

            if (result == null || !result.Any())
                return NotFound(ApiResponse<string>.ErrorResponse("No languages found for the given candidate.", 404));

            return Ok(ApiResponse<object>.SuccessResponse(result, "Candidate language list retrieved successfully.", 200));
        }

        [HttpPost]
        [Route("SaveCandidateLanguage")]
        public IActionResult SaveCandidateLanguage([FromBody] CandidateLanguageEntity entity)
        {
            if (entity == null)
                return BadRequest(ApiResponse<string>.ErrorResponse("Invalid request data.", 400));

            var result = _candidateAdditional.SaveCandidateLanguage(entity);
            return Ok(ApiResponse<object>.SuccessResponse(result, "Candidate language details saved successfully.", 201));
        }
        [HttpPost]
        [Route("DeleteCandidateLanguage")]
        public IActionResult DeleteCandidateLanguage([FromBody] CandidateLanguageEntity entity)
        {
            try
            {
                var result = _candidateAdditional.DeleteCandidateLanguage(entity);
                return Ok(ApiResponse<string>.SuccessResponse(result, "Candidate language data deleted successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }
    }
}