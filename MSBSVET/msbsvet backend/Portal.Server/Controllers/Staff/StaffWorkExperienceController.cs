using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Portal.Business.Interface.Staff;
using Portal.Entities.ResponseBody;
using Portal.Entities.Staff;

namespace Portal.Server.Controllers.Staff
{
    [Route("api/[controller]")]
    [ApiController]
    public class StaffWorkExperienceController : ControllerBase
    {
        private readonly IStaffWorkExperience _staff;
        public StaffWorkExperienceController(IStaffWorkExperience staffService)
        {
            _staff = staffService;
        }

        [HttpGet]
        [Route("GetStaffWorkExperienceList")]
        public IActionResult GetStaffWorkExperienceList(long StaffID)
        {
            try
            {
                var result = _staff.GetStaffWorkExperienceList(StaffID);
                if (result == null || !result.Any())
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No work experience records found for the given staff ID.", 404));
                }
                return Ok(ApiResponse<List<StaffWorkExperienceEntity>>.SuccessResponse(result, "Staff work experience list retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetStaffWorkExperience")]
        public IActionResult GetStaffWorkExperience(long WorkExperienceRowID)
        {
            try
            {
                var result = _staff.GetStaffWorkExperience(WorkExperienceRowID);
                if (result == null)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("Work experience record not found.", 404));
                }
                return Ok(ApiResponse<StaffWorkExperienceEntity>.SuccessResponse(result, "Staff work experience record retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("SaveStaffWorkExperience")]
        public IActionResult SaveStaffWorkExperience([FromBody] StaffWorkExperienceEntity entity)
        {
            try
            {
                var result = _staff.SaveStaffWorkExperience(entity);
                return Ok(ApiResponse<string>.SuccessResponse(result, "Staff work experience saved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("DeleteStaffWorkExperience")]
        public IActionResult DeleteStaffWorkExperience([FromBody] StaffWorkExperienceEntity entity)
        {
            try
            {
                var result = _staff.DeleteStaffWorkExperience(entity);
                return Ok(ApiResponse<string>.SuccessResponse(result, "Staff work experience deleted successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("SaveSectorialExpertise")]
        public IActionResult SaveSectorialExpertise([FromBody] List<SectorialExpertiseEntity> entity, long StaffID, string UserLoginID, string IPAddress)
        {
            try
            {
                var result = _staff.SaveSectorialExpertise(entity, StaffID, UserLoginID, IPAddress);
                if (result == null || !result.Any())
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No sectorial expertise records found for the given staff ID.", 404));
                }
                return Ok(ApiResponse<string>.SuccessResponse(result, "Sectorial expertise saved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetStaffSectorialExpertiseList")]
        public IActionResult GetStaffSectorialExpertiseList(long StaffID)
        {
            try
            {
                var result = _staff.GetStaffSectorialExpertiseList(StaffID);
                if (result == null || !result.Any())
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No sectorial expertise records found for the given staff ID.", 404));
                }
                return Ok(ApiResponse<List<SectorialExpertiseEntity>>.SuccessResponse(result, "Sectorial expertise list retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

    }
}
