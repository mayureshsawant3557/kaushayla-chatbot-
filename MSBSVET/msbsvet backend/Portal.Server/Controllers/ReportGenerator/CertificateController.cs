using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Portal.Business.Interface.Exam;
using Portal.Entities.ReportGenerator;
using Portal.Entities.ResponseBody;

namespace Portal.Server.Controllers.ReportGenerator
{
    [Route("api/[controller]")]
    [ApiController]
    public class CertificateController : ControllerBase
    {

        private readonly IVerificationCertificate _verificationCertificate;

        public CertificateController(IVerificationCertificate verificationCertificateWorker)
        {
            _verificationCertificate = verificationCertificateWorker ?? throw new ArgumentNullException(nameof(verificationCertificateWorker));
        }

        [AllowAnonymous]
        [HttpPost]
        [Route("RequestSignedVerificationCertificate")]
        public IActionResult RequestSignedVerificationCertificate([FromBody] VerificationCertificateEntity entity)
        {
            try
            {
                var result = _verificationCertificate.SaveVerificationCertificateRequest(entity);
                return Ok(ApiResponse<string>.SuccessResponse(result, "Verification certificate request saved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }


        //test

    }
}
