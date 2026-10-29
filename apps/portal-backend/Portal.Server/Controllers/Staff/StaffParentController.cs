using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Portal.Business.Interface.Staff;
using Portal.Entities.ResponseBody;
using Portal.Entities.Staff;

namespace Portal.Server.Controllers.Staff
{
    [Route("api/[controller]")]
    [ApiController]
    public class StaffParentController : ControllerBase
    {
        private readonly IStaffParent _staff;
        public StaffParentController(IStaffParent staffService)
        {
            _staff = staffService;
        }

        [HttpPost]
        [Route("GetStaffParent")]
        public IActionResult GetStaffParent([FromBody] StaffInput entity)
        {
            try
            {
                var result = _staff.GetStaffParent(entity);
                if (result == null)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No staff parent details found.", 404));
                }
                return Ok(ApiResponse<StaffParentEntity>.SuccessResponse(result, "Staff parent details retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("SaveStaffParent")]
        public IActionResult SaveStaffParent([FromBody] StaffParentEntity entity)
        {
            try
            {
                var result = _staff.SaveStaffParent(entity);
                return Ok(ApiResponse<string>.SuccessResponse(result, "Staff parent details saved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

    }
}
