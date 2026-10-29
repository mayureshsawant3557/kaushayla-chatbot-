using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Portal.Business.Interface.Staff;
using Portal.Entities.ResponseBody;
using Portal.Entities.Staff;
using System.Data;

namespace Portal.Server.Controllers.Staff
{
    [Route("api/[controller]")]
    [ApiController]
    public class StaffApprovalController : ControllerBase
    {
        private readonly IStaffApproval _staff;
        public StaffApprovalController(IStaffApproval staffService)
        {
            _staff = staffService;
        }

        [HttpGet]
        [Route("SearchStaffManagement")]
        public IActionResult SearchStaffManagement(int DistrictID, int TalukaID, int RegionID, string FormStatus, string ProfileID="")
        {
            try
            {
                var result = _staff.SearchStaffManagement(DistrictID, TalukaID, RegionID, FormStatus, ProfileID);
                if (result == null || result.Rows.Count == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No staff management data found.", 404));
                }
                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Staff management data retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("SaveStaffPrimaryVerification")]
        public IActionResult SaveStaffPrimaryVerification([FromBody] StaffPrimaryEntity entity)
        {
            try
            {
                var result = _staff.SaveStaffPrimaryVerification(entity);
                return Ok(ApiResponse<string>.SuccessResponse(result, "Staff primary verification saved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

    }
}
