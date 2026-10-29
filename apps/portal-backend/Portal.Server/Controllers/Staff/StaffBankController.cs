using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Portal.Business.Interface.Staff;
using Portal.Entities.ResponseBody;
using Portal.Entities.Staff;

namespace Portal.Server.Controllers.Staff
{
    [Route("api/[controller]")]
    [ApiController]
    public class StaffBankController : ControllerBase
    {

        private readonly IStaffBank _staff;
        public StaffBankController(IStaffBank staffService)
        {
            _staff = staffService;
        }
        [HttpPost]
        [Route("GetStaffBank")]
        public IActionResult GetStaffBank([FromBody] StaffInput entity)
        {
            try
            {
                var result = _staff.GetStaffBank(entity);
                if (result == null)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No staff bank details found.", 404));
                }
                return Ok(ApiResponse<StaffBankEntity>.SuccessResponse(result, "Staff bank details retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("SaveStaffBank")]
        public IActionResult SaveStaffBank([FromBody] StaffBankEntity entity)
        {
            try
            {
                var result = _staff.SaveStaffBank(entity);
                return Ok(ApiResponse<string>.SuccessResponse(result, "Staff bank details saved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

    }
}
