using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Portal.Business.Interface.Staff;
using Portal.Entities.ResponseBody;
using Portal.Entities.Staff;

namespace Portal.Server.Controllers.Staff
{
    [Route("api/[controller]")]
    [ApiController]
    public class StaffTrainingController : ControllerBase
    {
        private readonly IStaffTraining _staff;
        public StaffTrainingController(IStaffTraining staffService)
        {
            _staff = staffService;
        }
        [HttpGet]
        [Route("GetStaffTrainingList")]
        public IActionResult GetStaffTrainingList(long StaffID)
        {
            try
            {
                var result = _staff.GetStaffTrainingList(StaffID);
                if (result == null || !result.Any())
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No training records found for the given staff ID.", 404));
                }
                return Ok(ApiResponse<List<StaffTrainingEntity>>.SuccessResponse(result, "Staff training list retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetStaffTraining")]
        public IActionResult GetStaffTraining(long TrainingRowID)
        {
            try
            {
                var result = _staff.GetStaffTraining(TrainingRowID);
                if (result == null)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("Training record not found.", 404));
                }
                return Ok(ApiResponse<StaffTrainingEntity>.SuccessResponse(result, "Staff training record retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("SaveStaffTraining")]
        public IActionResult SaveStaffTraining([FromBody] StaffTrainingEntity entity)
        {
            try
            {
                var result = _staff.SaveStaffTraining(entity);
                return Ok(ApiResponse<string>.SuccessResponse(result, "Staff training record saved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("DeleteStaffTraining")]
        public IActionResult DeleteStaffTraining([FromBody] StaffTrainingEntity entity)
        {
            try
            {
                var result = _staff.DeleteStaffTraining(entity);
                return Ok(ApiResponse<string>.SuccessResponse(result, "Staff training record deleted successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

    }
}
