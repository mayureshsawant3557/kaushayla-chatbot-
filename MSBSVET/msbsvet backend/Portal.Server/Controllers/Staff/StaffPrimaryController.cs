using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Portal.Business.Interface.Staff;
using Portal.Business.Worker.Candidate;
using Portal.Entities.ResponseBody;
using Portal.Entities.Staff;

namespace Portal.Server.Controllers.Staff
{
    [Route("api/[controller]")]
    [ApiController]
    public class StaffPrimaryController : ControllerBase
    {
        private readonly IStaffPrimary _staff;
        public StaffPrimaryController(IStaffPrimary staffService)
        {
            _staff = staffService;
        }

        [HttpPost]
        [Route("GetStaffPrimary")]
        public IActionResult GetStaffPrimary([FromBody] StaffInput entity)
        {
            try
            {
                var result = _staff.GetStaffPrimary(entity);
                if (result == null)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No staff primary details found.", 404));
                }
                return Ok(ApiResponse<StaffPrimaryEntity>.SuccessResponse(result, "Staff primary details retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("SaveStaffPrimary")]
        public IActionResult SaveStaffPrimary([FromBody] StaffPrimaryEntity entity)
        {
            try
            {
                var result = _staff.SaveStaffPrimary(entity);
                return Ok(ApiResponse<string>.SuccessResponse(result, "Staff primary details saved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }
        [HttpGet("GetStaffDashboard")]
        public IActionResult GetCandidateDashboard([FromQuery] long staffId)
        {
            if (staffId <= 0)
                return BadRequest(ApiResponse<object>.ErrorResponse("Invalid staffId ID.", 400));

            var result = _staff.GetStaffDashboard(staffId);

            if (result == null)
                return NotFound(ApiResponse<object>.ErrorResponse("staffId dashboard not found.", 404));

            return Ok(ApiResponse<object>.SuccessResponse(result, "staffId dashboard retrieved successfully.", 200));
        }

    }
}
