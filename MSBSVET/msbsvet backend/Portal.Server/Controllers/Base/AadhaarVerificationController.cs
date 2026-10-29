using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Portal.Business.Interface.Base;
using Portal.Entities;
using Portal.Entities.ResponseBody;
using ZXing;

namespace Portal.Server.Controllers.Base
{
    [Route("api/[controller]")]
    [ApiController]
    [AllowAnonymous]
    public class AadhaarVerificationController : ControllerBase
    {
        private readonly IAadhaarVerificationService _service;

        public AadhaarVerificationController(IAadhaarVerificationService service)
        {
            _service = service;
        }

        [HttpPost("verify")]
        public async Task<IActionResult> Verify([FromBody] AadhaarVerifyRequest request, CancellationToken ct)
        {
            if ( request.AadhaarNo.Length == 0 || request.FirstName.Length == 0)
                throw new ArgumentException("Invalid request.");

            AadhaarVerifyResponse response = await _service.VerifyAsync(request, ct);
            return Ok(ApiResponse<object>.SuccessResponse(response, "Aadhare Validate Completed."));

        }
        [HttpPost("reverify")]
        public async Task<IActionResult> ReVerify([FromBody] AadhaarReVerifyRequest request, CancellationToken ct)
        {
            if ( request.AadhaarNo.Length == 0 || request.FirstName.Length == 0)
                throw new ArgumentException("Invalid request.");

            AadhaarReVerifyResponse response = await _service.ReVerifyAsync(request, ct);
            return Ok(ApiResponse<object>.SuccessResponse(response, "Aadhare Validate Completed."));

        }
    }
}
