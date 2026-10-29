using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Portal.Business.Interface.Candidate;
using Portal.Entities.Candidate;
using Portal.Entities.ResponseBody;

namespace Portal.Server.Controllers.Candidate
{
    [Route("api/[controller]")]
    [ApiController]
    public class CandidateAddressController : ControllerBase
    {
        private readonly ICandidateAddress _candidateAddress;

        public CandidateAddressController(ICandidateAddress candidateAddress)
        {
            _candidateAddress = candidateAddress ?? throw new ArgumentNullException(nameof(candidateAddress));
        }

        [HttpGet]
        [Route("GetCandidateAddress")]
        public IActionResult GetCandidateAddress([FromQuery] long candidateId)
        {
            Console.WriteLine($"Received request for CandidateID: {candidateId}");

            if (candidateId <= 0)
                return BadRequest(ApiResponse<string>.ErrorResponse("Invalid Candidate ID.", 400));

            var entity = new CandidateInput { CandidateID = candidateId };
            var result = _candidateAddress.GetCandidateAddress(entity);

            if (result == null)
            {
                Console.WriteLine($"No data found for CandidateID: {candidateId}");
                return NotFound(ApiResponse<string>.ErrorResponse("Candidate address details not found.", 404));
            }

            Console.WriteLine($"Returning data for CandidateID: {candidateId}");
            return Ok(ApiResponse<object>.SuccessResponse(result, "Candidate address retrieved successfully.", 200));
        }

        [HttpPost]
        [Route("SaveCandidateAddress")]
        public IActionResult SaveCandidateAddress([FromBody] CandidateAddressEntity entity)
        {
            if (entity == null)
                return BadRequest(ApiResponse<string>.ErrorResponse("Invalid request data.", 400));

            var result = _candidateAddress.SaveCandidateAddress(entity);
            return Ok(ApiResponse<object>.SuccessResponse(result, "Candidate address saved successfully.", 201));
        }
    }
}
