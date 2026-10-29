using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Portal.Business.Interface.Staff;
using Portal.Entities.ResponseBody;
using Portal.Entities.Staff;

namespace Portal.Server.Controllers.Staff
{
    [Route("api/[controller]")]
    [ApiController]
    public class StaffAddressController : ControllerBase
    {

        private readonly IStaffAddress _staff;
        public StaffAddressController(IStaffAddress staffService)
        {
            _staff = staffService;
        }
        [HttpPost]
        [Route("GetStaffAddress")]
        public IActionResult GetStaffAddress([FromBody] StaffInput entity)
        {
            try
            {
                var result = _staff.GetStaffAddress(entity);
                if (result == null)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No staff address data found.", 404));
                }
                return Ok(ApiResponse<StaffAddressEntity>.SuccessResponse(result, "Staff address data retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("SaveStaffAddress")]
        public IActionResult SaveStaffAddress([FromBody] StaffAddressEntity entity)
        {
            try
            {
                var result = _staff.SaveStaffAddress(entity);
                return Ok(ApiResponse<string>.SuccessResponse(result, "Staff address data saved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

    }
}
