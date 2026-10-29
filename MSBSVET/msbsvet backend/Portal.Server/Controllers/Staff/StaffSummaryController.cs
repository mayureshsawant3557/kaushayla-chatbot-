using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Portal.Business.Interface.Staff;
using Portal.Business.Worker.Base;
using Portal.Entities.Base;
using Portal.Entities.ResponseBody;
using Portal.Entities.Staff;
using System.Data;

namespace Portal.Server.Controllers.Staff
{
    [Route("api/[controller]")]
    [ApiController]
    public class StaffSummaryController : ControllerBase
    {
        private readonly IStaffSummary _staff;
        public StaffSummaryController(IStaffSummary staffService)
        {
            _staff = staffService;
        }
        [HttpPost]
        [Route("CheckStaffURL")]
        public IActionResult CheckStaffURL([FromBody] StaffInput entity)
        {
            try
            {
                var result = _staff.CheckStaffURL(entity);
                if (result == null)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No URL details found for the given staff input.", 404));
                }
                return Ok(ApiResponse<CheckURLEntity>.SuccessResponse(result, "Staff URL checked successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }
        
        [AllowAnonymous]
        [HttpPost]
        [Route("GetStaffSummary")]
        public IActionResult GetStaffSummary([FromBody] StaffInput entity)
        {
            try
            {
                var result = _staff.GetStaffSummary(entity);
                if (result == null)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No summary details found for the given staff input.", 404));
                }
                return Ok(ApiResponse<StaffSummaryEntity>.SuccessResponse(result, "Staff summary retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            } 
        }

        [HttpPost]
        [Route("LockStaffForm")]
        public IActionResult LockStaffForm([FromBody] StaffFormLockEntity entity)
        {
            try
            {
                var result = _staff.LockStaffForm(entity);
                return Ok(ApiResponse<string>.SuccessResponse(result, "Staff form locked successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("UnlockStaffForm")]
        public IActionResult UnlockStaffForm([FromBody] StaffFormUnlockEntity entity)
        {
            try
            {
                var result = _staff.UnlockStaffForm(entity);
                return Ok(ApiResponse<string>.SuccessResponse(result, "Staff form unlocked successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetEligibilityFlagForUnlockStaffForm")]
        public IActionResult GetEligibilityFlagForUnlockStaffForm(long StaffID, string UserLoginID)
        {
            try
            {
                var result = _staff.GetEligibilityFlagForUnlockStaffForm(StaffID, UserLoginID);
                var serializableData = BaseWorker.ConvertDataTableToList(result);
                if (result == null || result.Rows.Count == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No eligibility flag data found for unlocking the staff form.", 404));
                }
                return Ok(ApiResponse<object>.SuccessResponse(serializableData, "Eligibility flag data retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

    }
}
