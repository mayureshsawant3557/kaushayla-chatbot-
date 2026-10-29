using Microsoft.AspNetCore.Mvc;
using Portal.Business.Interface.Certificate;
using Portal.Entities.Certificate;
using Portal.Entities.ResponseBody;

namespace Portal.Server.Controllers.ReportGenerator
{
    [Route("api/[controller]")]
    [ApiController]
    public class VerificationCertificateRequestController : ControllerBase
    {
        private readonly IVerificationCertificateRequest _verificationCertificateRequestWorker;

        public VerificationCertificateRequestController(IVerificationCertificateRequest verificationCertificateRequestWorker)
        {
            _verificationCertificateRequestWorker = verificationCertificateRequestWorker ?? throw new ArgumentNullException(nameof(verificationCertificateRequestWorker));
        }

        
        [HttpGet("GetByRequestNo")]
        public IActionResult GetVerificationCertificateRequestByRequestNo([FromQuery] string requestNo)
        {
            if (string.IsNullOrWhiteSpace(requestNo))
                return BadRequest(ApiResponse<object>.ErrorResponse("Request Number is required.", 400));

            try
            {
                var result = _verificationCertificateRequestWorker.GetVerificationCertificateRequestByRequestNo(requestNo.Trim());

                if (result == null || result.ID == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse($"Verification certificate request not found for RequestNo: {requestNo}", 404));

                return Ok(ApiResponse<object>.SuccessResponse(result, "Verification certificate request retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        
    }


}
