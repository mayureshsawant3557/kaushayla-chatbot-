using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Portal.Business.Interface.Staff;
using Portal.Entities.ResponseBody;
using Portal.Entities.Staff;

namespace Portal.Server.Controllers.Staff
{
    [Route("api/[controller]")]
    [ApiController]
    public class StaffCategoryController : ControllerBase
    {
        private readonly IStaffCategory _staff;
        public StaffCategoryController(IStaffCategory staffService)
        {
            _staff = staffService;
        }
        [HttpPost]
        [Route("GetStaffCategory")]
        public IActionResult GetStaffCategory([FromBody] StaffInput entity)
        {
            try
            {
                var result = _staff.GetStaffCategory(entity);
                if (result == null)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No staff category details found.", 404));
                }
                return Ok(ApiResponse<StaffCategoryEntity>.SuccessResponse(result, "Staff category details retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("SaveStaffCategory")]
        public IActionResult SaveStaffCategory([FromBody] StaffCategoryEntity entity)
        {
            try
            {
                var result = _staff.SaveStaffCategory(entity);

                return Ok(ApiResponse<string>.SuccessResponse(result, "Staff category details saved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

    }
}
