using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Portal.Business.Interface.Base;
using Portal.Business.Interface.Staff;
using Portal.Entities.ResponseBody;
using Portal.Entities.Staff;

namespace Portal.Server.Controllers.Staff
{
    [Route("api/[controller]")]
    [ApiController]
    public class StaffAdditionalController : ControllerBase
    {
        private readonly IStaffAdditional _staff;
        public StaffAdditionalController(IStaffAdditional staffService)
        {
            _staff = staffService;
        }
        [HttpPost]
        [Route("GetStaffAdditional")]
        public IActionResult GetStaffAdditional([FromBody] StaffInput entity)
        {
            try
            {
                var result = _staff.GetStaffAdditional(entity);
                if (result == null)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No staff additional data found.", 404));
                }
                return Ok(ApiResponse<StaffAdditionalEntity>.SuccessResponse(result, "Staff additional data retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("SaveStaffAdditional")]
        public IActionResult SaveStaffAdditional([FromBody] StaffAdditionalEntity entity)
        {
            try
                {
                var result = _staff.SaveStaffAdditional(entity);
                return Ok(ApiResponse<string>.SuccessResponse(result, "Staff additional data saved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetStaffLanguageList")]
        public IActionResult GetStaffLanguageList(long StaffID)
        {
            try
            {
                var result = _staff.GetStaffLanguageList(StaffID);
                if (result == null || result.Count == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No staff language data found.", 404));
                }
                return Ok(ApiResponse<List<StaffLanguageEntity>>.SuccessResponse(result, "Staff language data retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetStaffLanguage")]
        public IActionResult GetStaffLanguage(long LanguageRowID)
        {
            try
            {
                var result = _staff.GetStaffLanguage(LanguageRowID);
                if (result == null)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No staff language data found for the given LanguageRowID.", 404));
                }
                return Ok(ApiResponse<StaffLanguageEntity>.SuccessResponse(result, "Staff language data retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("DeleteStaffLanguage")]
        public IActionResult DeleteStaffLanguage([FromBody] StaffLanguageEntity entity)
        {
            try
            {
                var result = _staff.DeleteStaffLanguage(entity);
                return Ok(ApiResponse<string>.SuccessResponse(result, "Staff language data deleted successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("SaveStaffLanguage")]
        public IActionResult SaveStaffLanguage([FromBody] StaffLanguageEntity entity)
        {
            try
            {
                var result = _staff.SaveStaffLanguage(entity);
                return Ok(ApiResponse<string>.SuccessResponse(result, "Staff language data saved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }


    }
}
