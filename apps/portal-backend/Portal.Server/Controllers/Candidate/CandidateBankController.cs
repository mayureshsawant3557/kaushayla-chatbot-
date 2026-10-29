using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Portal.Business.Interface.Candidate;
using Portal.Entities.Base;
using Portal.Entities.Candidate;
using Portal.Entities.ResponseBody;
using Portal.Business.Worker.Utility;

using System;
using Portal.Business.Worker.Utility;

namespace Portal.Server.Controllers.Candidate
{
    [Route("api/[controller]")]
    [ApiController]
    public class CandidateBankController : ControllerBase
    {
        private readonly ICandidateBank _candidateBankService;
        private readonly ILogger<CandidateBankController> _logger;

        public CandidateBankController(ICandidateBank candidateBankService, ILogger<CandidateBankController> logger)
        {
            _candidateBankService = candidateBankService ?? throw new ArgumentNullException(nameof(candidateBankService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        // ✅ Save Candidate Bank Details (POST)
        [HttpPost("save")]
        public IActionResult SaveCandidateBank([FromBody] CandidateBankEntity entity)
        {
            if (entity == null)
            {
                _logger.LogWarning("Invalid input: Candidate bank details are null.");
                return BadRequest(ApiResponse<string>.ErrorResponse("Invalid input data. Candidate bank details cannot be null.", 400));
            }

            try
            {
                string result = _candidateBankService.SaveCandidateBank(entity);

                if (string.IsNullOrEmpty(result) || result == "0")
                {
                    _logger.LogError("Failed to save bank details.");
                    return StatusCode(500, ApiResponse<string>.ErrorResponse("Failed to save bank details. Please try again later.", 500));
                }

               // _logger.LogInformation("Bank details saved successfully for Candidate ID: {CandidateId}", entity.CandidateId);
                return Ok(ApiResponse<string>.SuccessResponse(result, "Bank details saved successfully.", 200));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception occurred while saving bank details.");
                return StatusCode(500, ApiResponse<string>.ErrorResponse(ex.Message, 500));
            }
        }

        // ✅ Get Candidate Bank Details (GET)
        [HttpGet("get/{candidateID}")]
        public IActionResult GetCandidateBank(int candidateID)
        {
            if (candidateID <= 0)
            {
                _logger.LogWarning("Invalid Candidate ID: {CandidateId}", candidateID);
                return BadRequest(ApiResponse<string>.ErrorResponse("Invalid Candidate ID. It must be greater than zero.", 400));
            }

            try
            {
                var entity = new CandidateInput { CandidateID = candidateID };
                CandidateBankEntity candidateBank = _candidateBankService.GetCandidateBank(entity);

                if (candidateBank == null)
                {
                    _logger.LogInformation("No bank details found for Candidate ID: {CandidateId}", candidateID);
                    return NotFound(ApiResponse<string>.ErrorResponse($"No bank details found for Candidate ID {candidateID}.", 404));
                }

                _logger.LogInformation("Returning bank details for Candidate ID: {CandidateId}", candidateID);
                return Ok(ApiResponse<CandidateBankEntity>.SuccessResponse(candidateBank, "Bank details retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception occurred while retrieving bank details.");
                return StatusCode(500, ApiResponse<string>.ErrorResponse(ex.Message, 500));
            }
        }
        [HttpGet("details/{ifscCode}")]
        public IActionResult GetBankDetailsByIFSC(string ifscCode)
        {
            // Validate IFSC code
            if (string.IsNullOrWhiteSpace(ifscCode))
            {
                _logger.LogWarning("Invalid IFSC code: IFSC code is null or empty.");
                return BadRequest(ApiResponse<string>.ErrorResponse("IFSC code cannot be null or empty.", 400));
            }

            try
            {
                // Call your helper method
                //BankEntity bankDetails = CommonHelper.GetBankDetails(ifscCode);
                BankEntity bankDetails = CommonHelper.GetBankDetails(ifscCode);

                if (bankDetails == null || string.IsNullOrEmpty(bankDetails.BANK))
                {
                    _logger.LogWarning("No bank details found for IFSC code: {IfscCode}", ifscCode);
                    return NotFound(ApiResponse<string>.ErrorResponse($"No bank details found for IFSC code: {ifscCode}.", 404));
                }

                _logger.LogInformation("Bank details retrieved successfully for IFSC: {IfscCode}", ifscCode);
                return Ok(ApiResponse<BankEntity>.SuccessResponse(bankDetails, "Bank details retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception occurred while fetching bank details for IFSC: {IfscCode}", ifscCode);
                return StatusCode(500, ApiResponse<string>.ErrorResponse("An error occurred while fetching bank details. Please try again later.", 500));
            }
        }
    }
}
