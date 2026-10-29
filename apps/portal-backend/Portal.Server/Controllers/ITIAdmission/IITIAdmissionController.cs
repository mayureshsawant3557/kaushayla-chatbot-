using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Portal.Business.Interface.ITIAdmission;
using Portal.Entities.ResponseBody;
using System;

namespace Portal.Server.Controllers.ITIAdmission
{
    [Route("api/[controller]")]
    [ApiController]
 
    public class IITIAdmissionController : ControllerBase
    {
        private readonly IITIAdmission _iitiAdmission;

        public IITIAdmissionController(IITIAdmission iitiAdmission)
        {
            _iitiAdmission = iitiAdmission ?? throw new ArgumentNullException(nameof(iitiAdmission));
        }

        [AllowAnonymous]
        [HttpGet("GetIITIAdmissionData")]
        public IActionResult GetIITIAdmissionData([FromQuery] string ITIRegistrationNo, [FromQuery] string ITIFirstName, [FromQuery] string ITIDOBITI)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(ITIRegistrationNo))
                    return BadRequest(ApiResponse<string>.ErrorResponse("ITI Registration Number is required."));

                if (string.IsNullOrWhiteSpace(ITIFirstName))
                    return BadRequest(ApiResponse<string>.ErrorResponse("ITI First Name is required."));

                if (string.IsNullOrWhiteSpace(ITIDOBITI))
                    return BadRequest(ApiResponse<string>.ErrorResponse("ITI Date of Birth is required."));

                var data = _iitiAdmission.GetIITIAdmissionData(ITIRegistrationNo, ITIFirstName, ITIDOBITI);
                return Ok(ApiResponse<object>.SuccessResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>.ErrorResponse(ex.Message, StatusCodes.Status500InternalServerError));
            }
        }


        [HttpGet("GetMSBSVETCandidateData")]
        public IActionResult GetMSBVAdmissionData([FromQuery] string ApplicationID, [FromQuery] string FirstName, [FromQuery] string DOB)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(ApplicationID))
                    return BadRequest(ApiResponse<string>.ErrorResponse("MSBSVET Registration Number is required."));

                if (string.IsNullOrWhiteSpace(FirstName))
                    return BadRequest(ApiResponse<string>.ErrorResponse("MSBSVET First Name is required."));

                if (string.IsNullOrWhiteSpace(DOB))
                    return BadRequest(ApiResponse<string>.ErrorResponse("MSBSVET Date of Birth is required."));

                var data = _iitiAdmission.GetMSBVAdmissionData(ApplicationID, FirstName, DOB);
                return Ok(ApiResponse<object>.SuccessResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>.ErrorResponse(ex.Message, StatusCodes.Status500InternalServerError));
            }
        }

        [AllowAnonymous]
        [HttpGet("GetUserData")]
        public IActionResult GetUserData([FromQuery] string ITIRegistrationNo)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(ITIRegistrationNo))
                    return BadRequest(ApiResponse<string>.ErrorResponse("ITI Registration Number is required."));

                var data = _iitiAdmission.GetUserData(ITIRegistrationNo);
                return Ok(ApiResponse<object>.SuccessResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>.ErrorResponse(ex.Message, StatusCodes.Status500InternalServerError));
            }
        }
    }
}