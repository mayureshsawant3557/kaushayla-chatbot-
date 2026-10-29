using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Portal.Business.Interface.Staff;
using Portal.Entities.ResponseBody;
using Portal.Entities.Staff;

namespace Portal.Server.Controllers.Staff
{
    [Route("api/[controller]")]
    [ApiController]
    public class StaffQualificationController : ControllerBase
    {
        private readonly IStaffQualification _staff;
        public StaffQualificationController(IStaffQualification staffService)
        {
            _staff = staffService;
        }

        [HttpGet]
        [Route("GetStaffQualificationList")]
        public IActionResult GetStaffQualificationList(long StaffID)
        {
            try
            {
                var result = _staff.GetStaffQualificationList(StaffID);
                if (result == null || result.Count == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No qualification details found for the given Staff ID.", 404));
                }
                return Ok(ApiResponse<List<StaffQualificationEntity>>.SuccessResponse(result, "Staff qualification details retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetStaffQualification")]
        public IActionResult GetStaffQualification(long QualificationRowID)
        {
            try
            {
                var result = _staff.GetStaffQualification(QualificationRowID);
                if (result == null)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No qualification details found for the given Qualification Row ID.", 404));
                }
                return Ok(ApiResponse<StaffQualificationEntity>.SuccessResponse(result, "Staff qualification details retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("DeleteStaffQualification")]
        public IActionResult DeleteStaffQualification([FromBody] StaffQualificationEntity entity)
        {
            try
            {
                var result = _staff.DeleteStaffQualification(entity);
                return Ok(ApiResponse<string>.SuccessResponse(result, "Staff qualification deleted successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("SaveStaffQualification")]
        public IActionResult SaveStaffQualification([FromBody] StaffQualificationEntity entity)
        {
            try
            {
                var result = _staff.SaveStaffQualification(entity);
                if(result == "Y")
                return Ok(ApiResponse<string>.SuccessResponse(result, "Staff qualification saved successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to save qualification. Please try again.", 201));

            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

    }
}
