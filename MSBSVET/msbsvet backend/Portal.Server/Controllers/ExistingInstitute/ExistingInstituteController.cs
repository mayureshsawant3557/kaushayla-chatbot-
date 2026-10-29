using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Portal.Business.Interface.Base;
using Portal.Business.Interface.ExistingInstitute;
using Portal.Business.Interface.Institute;
using Portal.Business.Worker.Base;
using Portal.Business.Worker.Utility;
using Portal.Entities.ExistingInstitute;
using Portal.Entities.Institute;
using Portal.Entities.ResponseBody;
using System.Data;
using System.Xml;
using System.Xml.Serialization;

namespace Portal.Server.Controllers.Institute
{
    [Route("api/[controller]")]
    [ApiController]
    public class ExistingInstituteController : ControllerBase
    {
        private readonly IExistingInstitute _IExistingInstitute;

        public ExistingInstituteController(IExistingInstitute iExistingInstitute)
        {
            _IExistingInstitute = iExistingInstitute ?? throw new ArgumentNullException(nameof(iExistingInstitute));
        }

        [HttpPost("GetPromotionalOrganisationDetails")]
        public IActionResult GetPromotionalOrganisationDetails([FromBody] InstituteInputEntity input)
        {
            try
            {
                if (input == null)
                    return BadRequest(ApiResponse<object>.ErrorResponse("Input data is missing.", 400));

                var result = _IExistingInstitute.GetPromotionalOrganisationDetails(input);
                return Ok(ApiResponse<PromotingOrganisationEntity>.SuccessResponse(result, "Promotional organisation details retrieved successfully."));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetPromotionalOrganisationDetails");
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("SavePromotionalOrganisationDetails")]
        public IActionResult SavePromotionalOrganisationDetails([FromBody] PromotingOrganisationEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<object>.ErrorResponse("Organisation data is missing.", 400));

                var result = _IExistingInstitute.SavePromotionalOrganisationDetails(entity);
                return Ok(ApiResponse<string>.SuccessResponse(result, "Promotional organisation details saved successfully."));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SavePromotionalOrganisationDetails");
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("SavePromotersDetails")]
        public IActionResult SavePromotersDetails([FromBody] PromotersDetailsEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<object>.ErrorResponse("Promoter data is missing.", 400));

                var result = _IExistingInstitute.SavePromotersDetails(entity);
                return Ok(ApiResponse<string>.SuccessResponse(result, "Promoter details saved successfully."));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SavePromotersDetails");
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet("GetPromoterDetailsByID/{promoterId}")]
        public IActionResult GetPromoterDetailsByID(long promoterId)
        {
            try
            {
                if (promoterId <= 0)
                    return BadRequest(ApiResponse<object>.ErrorResponse("Invalid promoter ID.", 400));

                var result = _IExistingInstitute.GetPromoterDetailsByID(promoterId);
                if (result == null)
                    return NotFound(ApiResponse<object>.ErrorResponse("Promoter details not found.", 404));

                return Ok(ApiResponse<PromotersDetailsEntity>.SuccessResponse(result, "Promoter details retrieved successfully."));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetPromoterDetailsByID");
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("GetPromoterDetailsByInstituteID")]
        public IActionResult GetPromoterDetailsByInstituteID([FromBody] InstituteInputEntity input)
        {
            try
            {
                if (input == null)
                    return BadRequest(ApiResponse<object>.ErrorResponse("Input data is missing.", 400));

                var result = _IExistingInstitute.GetPromoterDetailsByInstituteID(input);
                return Ok(ApiResponse<List<PromotersDetailsEntity>>.SuccessResponse(result, "Promoter details retrieved successfully."));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetPromoterDetailsByInstituteID");
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet("GetProposedInstituteDetails/{instituteId}/{userLoginId}")]
        public IActionResult GetProposedInstituteDetails(long instituteId, string userLoginId)
        {
            try
            {
                if (instituteId <= 0)
                    return BadRequest(ApiResponse<object>.ErrorResponse("Invalid institute ID.", 400));

                var result = _IExistingInstitute.GetProposedInstituteDetails(instituteId, userLoginId);
                if (result == null)
                    return NotFound(ApiResponse<object>.ErrorResponse("Proposed institute details not found.", 404));

                return Ok(ApiResponse<InstituteInfoEntity>.SuccessResponse(result, "Proposed institute details retrieved successfully."));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetProposedInstituteDetails");
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("SaveProposedInstituteDetails")]
        public IActionResult SaveProposedInstituteDetails([FromBody] ProposedInstituteInfoEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<object>.ErrorResponse("Institute data is missing.", 400));

                var result = _IExistingInstitute.SaveProposedInstituteDetails(entity);
                return Ok(ApiResponse<string>.SuccessResponse(result, "Proposed institute details saved successfully."));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveProposedInstituteDetails");
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("SaveInstitute_PromoterStaffMappingDetails")]
        public IActionResult SaveInstitute_PromoterStaffMappingDetails([FromBody] PromotersDetailsEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<object>.ErrorResponse("Mapping data is missing.", 400));

                var result = _IExistingInstitute.SaveInstitute_PromoterStaffMappingDetails(entity);
                return Ok(ApiResponse<string>.SuccessResponse(result, "Promoter staff mapping saved successfully."));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveInstitute_PromoterStaffMappingDetails");
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpDelete("Delete_PromoterStaffMappingDetails")]
        public IActionResult Delete_PromoterStaffMappingDetails([FromBody] PromotersDetailsEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<object>.ErrorResponse("Mapping data is missing.", 400));

                var result = _IExistingInstitute.Delete_PromoterStaffMappingDetails(entity);
                return Ok(ApiResponse<string>.SuccessResponse(result, "Promoter staff mapping deleted successfully."));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "Delete_PromoterStaffMappingDetails");
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet("GetInstituteHeaderDashboard/{instituteId}/{instituteCode}")]
        public IActionResult GetInstituteHeaderDashboard(long instituteId, string instituteCode)
        {
            try
            {
                if (instituteId <= 0)
                    return BadRequest(ApiResponse<object>.ErrorResponse("Invalid institute ID.", 400));

                var result = _IExistingInstitute.GetInstituteHeaderDashboard(instituteId, instituteCode);
                return Ok(ApiResponse<DataSet>.SuccessResponse(result, "Institute header dashboard retrieved successfully."));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetInstituteHeaderDashboard");
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet("GetProposedCourseUnitRequirementDetails/{instituteId}/{courseId}/{userLoginId}")]
        public IActionResult GetProposedCourseUnitRequirementDetails(long instituteId, long courseId, string userLoginId)
        {
            try
            {
                if (instituteId <= 0 || courseId <= 0)
                    return BadRequest(ApiResponse<object>.ErrorResponse("Invalid institute or course ID.", 400));

                var result = _IExistingInstitute.GetProposedCourseUnitRequirementDetails(instituteId, courseId, userLoginId);
                return Ok(ApiResponse<List<ProposedCourseUnitDetailsEntity>>.SuccessResponse(result, "Proposed course unit requirement details retrieved successfully."));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetProposedCourseUnitRequirementDetails");
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("GetProposedCourseUnitDetails")]
        public IActionResult GetProposedCourseUnitDetails([FromBody] InstituteInputEntity en)
        {
            try
            {
                if (en == null)
                    return BadRequest(ApiResponse<object>.ErrorResponse("Input data is missing.", 400));

                var result = _IExistingInstitute.GetProposedCourseUnitDetails(en);
                return Ok(ApiResponse<DataSet>.SuccessResponse(result, "Proposed course unit details retrieved successfully."));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetProposedCourseUnitDetails");
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }
        [HttpPost("GetProposedCourseUnitDetailsForNationalTrade")]
        public IActionResult Institute_GetCourseUnitDetailsForNationalTrade([FromBody] InstituteInputEntity en)
        {
            try
            {
                if (en == null)
                    return BadRequest(ApiResponse<object>.ErrorResponse("Input data is missing.", 400));

                var result = _IExistingInstitute.Institute_GetCourseUnitDetailsForNationalTrade(en);
                return Ok(ApiResponse<DataSet>.SuccessResponse(result, "Proposed course unit details retrieved successfully."));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetProposedCourseUnitDetails");
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }
        [HttpPost("GetCoursesWiseRequirementDetails")]
        public IActionResult Institute_GetCoursesWiseRequirementDetails([FromBody] InstituteInputEntity en)
        {
            try
            {
                if (en == null)
                    return BadRequest(ApiResponse<object>.ErrorResponse("Input data is missing.", 400));

                var result = _IExistingInstitute.Institute_GetCoursesWiseRequirementDetails(en);
                return Ok(ApiResponse<DataSet>.SuccessResponse(result, "Proposed course unit details retrieved successfully."));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetProposedCourseUnitDetails");
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("SaveProposedCourseUnitDetails")]
        public IActionResult SaveProposedCourseUnitDetails([FromBody] ProposedCourseUnitDetailsEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<object>.ErrorResponse("Course unit data is missing.", 400));

                var result = _IExistingInstitute.SaveProposedCourseUnitDetails(entity);
                return Ok(ApiResponse<string>.SuccessResponse(result, "Proposed course unit details saved successfully."));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveProposedCourseUnitDetails");
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpDelete("DeleteProposedCourseUnitDetails")]
        public IActionResult DeleteProposedCourseUnitDetails([FromBody] ProposedCourseUnitDetailsEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<object>.ErrorResponse("Course unit data is missing.", 400));

                var result = _IExistingInstitute.DeleteProposedCourseUnitDetails(entity);
                return Ok(ApiResponse<string>.SuccessResponse(result, "Proposed course unit details deleted successfully."));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "DeleteProposedCourseUnitDetails");
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("SaveCourseUnitDetails")]
        public IActionResult SaveCourseUnitDetails([FromBody] CourseUnitDetailsEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<object>.ErrorResponse("Course unit data is missing.", 400));

                var result = _IExistingInstitute.SaveCourseUnitDetails(entity);
                return Ok(ApiResponse<string>.SuccessResponse(result, "Course unit details saved successfully."));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveCourseUnitDetails");
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpDelete("DeleteCourseUnitDetails")]
        public IActionResult DeleteCourseUnitDetails([FromBody] RenewalDetailsEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<object>.ErrorResponse("Renewal data is missing.", 400));

                var result = _IExistingInstitute.DeleteCourseUnitDetails(entity);
                return Ok(ApiResponse<string>.SuccessResponse(result, "Course unit details deleted successfully."));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "DeleteCourseUnitDetails");
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("GetCourseUnitDetails")]
        public IActionResult GetCourseUnitDetails([FromBody] CourseUnitDetailsEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<object>.ErrorResponse("Course unit data is missing.", 400));

                var result = _IExistingInstitute.GetCourseUnitDetails(entity);
                return Ok(ApiResponse<CourseUnitDetailsEntity>.SuccessResponse(result, "Course unit details retrieved successfully."));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetCourseUnitDetails");
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }
        // Additional methods for LockInstituteForm, UnlockInstituteForm, CheckInstituteFormFillingEligibility, and CheckInstituteRequestEligibility can be added here following the same pattern.


        [HttpPost("lockform")]
        public ActionResult<ApiResponse<string>> LockInstituteForm([FromBody] InstituteFormLockEntity entity)
        {
            if (entity == null || entity.InstituteID <= 0)
            {
                return BadRequest(ApiResponse<string>.ErrorResponse("Invalid form lock request.", 400));
            }

            try
            {
                //entity.UserLoginID = User.Identity.Name;
                //entity.IPAddress = GetClientIpAddress();

                var result = _IExistingInstitute.LockInstituteForm(entity);

                //if (string.Equals(result, "N", StringComparison.OrdinalIgnoreCase) ||
                //    result.Contains("not been saved", StringComparison.OrdinalIgnoreCase))
                //{
                //    return BadRequest(ApiResponse<string>.ErrorResponse(result, 400));
                //}

                return Ok(ApiResponse<string>.SuccessResponse(result, "Form locked successfully", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>.ErrorResponse($"Error: {ex.Message}", 500));
            }
        }

        [HttpPost("unlockform")]
        public ActionResult<ApiResponse<string>> UnlockInstituteForm([FromBody] InstituteFormLockEntity entity)
        {
            if (entity == null || entity.InstituteID <= 0)
            {
                return BadRequest(ApiResponse<string>.ErrorResponse("Invalid form unlock request.", 400));
            }

            try
            {
                //entity.UserLoginID = User.Identity.Name;
                //entity.IPAddress = GetClientIpAddress();

                var result = _IExistingInstitute.UnlockInstituteForm(entity);

                //if (string.Equals(result, "N", StringComparison.OrdinalIgnoreCase) ||
                //    result.Contains("not been saved", StringComparison.OrdinalIgnoreCase))
                //{
                //    return BadRequest(ApiResponse<string>.ErrorResponse(result, 400));
                //}

                return Ok(ApiResponse<string>.SuccessResponse(result, "Form unlocked successfully", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>.ErrorResponse($"Error: {ex.Message}", 500));
            }
        }

        [HttpPost("check-form-eligibility")]
        public ActionResult<ApiResponse<DataTable>> CheckFormFillingEligibility([FromBody] InstituteFormEligibilityEntity entity)
        {
            if (entity == null || entity.InstituteID <= 0)
            {
                return BadRequest(ApiResponse<DataTable>.ErrorResponse("Invalid eligibility check request.", 400));
            }

            try
            {
                var result = _IExistingInstitute.CheckInstituteFormFillingEligibility(entity);

                if (result == null || result.Rows.Count == 0)
                {
                    return BadRequest(ApiResponse<DataTable>.ErrorResponse("Unable to check eligibility.", 400));
                }

                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Eligibility checked successfully", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<DataTable>.ErrorResponse($"Error: {ex.Message}", 500));
            }
        }

        [HttpPost("check-request-eligibility")]
        public ActionResult<ApiResponse<DataTable>> CheckRequestEligibility([FromBody] InstituteFormEligibilityEntity entity)
        {
            if (entity == null || entity.InstituteID <= 0)
            {
                return BadRequest(ApiResponse<DataTable>.ErrorResponse("Invalid request eligibility check.", 400));
            }

            try
            {
                var result = _IExistingInstitute.CheckInstituteRequestEligibility(entity);

                if (result == null || result.Rows.Count == 0)
                {
                    return BadRequest(ApiResponse<DataTable>.ErrorResponse("Unable to check request eligibility.", 400));
                }

                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Request eligibility checked successfully", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<DataTable>.ErrorResponse($"Error: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("GetInventoryEquipmentListDetails")]
        public ActionResult<ApiResponse<TraningEquiplemntEntity>> GetInstituteTrainingEquipmentListDetails(
            [FromBody] InstituteInputEntity entity)
        {
            if (entity == null)
                return BadRequest(ApiResponse<TraningEquiplemntEntity>.ErrorResponse(
                    "Institute input entity cannot be null.", 400));

            if (entity.InstituteId <= 0)
                return BadRequest(ApiResponse<TraningEquiplemntEntity>.ErrorResponse(
                    "Institute ID must be greater than zero.", 400));

            if (entity.ItemId <= 0)
                return BadRequest(ApiResponse<TraningEquiplemntEntity>.ErrorResponse(
                    "Course ID must be greater than zero.", 400));

            try
            {
                var result = _IExistingInstitute.Inventory_GetEquipmentListDetails(entity);

                if (result == null)
                    return NotFound(ApiResponse<TraningEquiplemntEntity>.ErrorResponse(
                        "No Inventory equipment list details found.", 404));

                return Ok(ApiResponse<TraningEquiplemntEntity>.SuccessResponse(
                    result, "Inventory equipment list details retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<TraningEquiplemntEntity>.ErrorResponse(
                        $"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("UpdateInventoryEquipmentAvailability")]
        public ActionResult<ApiResponse<string>> UpdateTrainingEquipmentAvailability(
    [FromBody] TraningEquiplemntEntity request)
        {
            if (request.lstTrainingEquipmentListEntity == null || !request.lstTrainingEquipmentListEntity.Any())
                return BadRequest("Equipment list required");
            try
            {


                var result = _IExistingInstitute.Inventory_UpdateEquipmentAvailability(
                    request.lstTrainingEquipmentListEntity,
                    request.lstEquipmentPhoto,
                    request.lstTrainingEquipmentListEntity.First().PageCode
                );
                if (result == null)
                {
                    return NotFound(ApiResponse<string>.ErrorResponse("No data found.", 404));
                }
                if (result.Equals("Editing not allowed.  request is pending.", StringComparison.OrdinalIgnoreCase))
                {
                    return BadRequest(ApiResponse<string>.ErrorResponse(
                        result, 403)); // Forbidden
                }
                if (result.Equals("N", StringComparison.OrdinalIgnoreCase))
                {
                    return BadRequest(ApiResponse<string>.ErrorResponse(
                        "Failed to save Training Equipment. Please try again.", 400));
                }
                //if (result.Equals("Generate LOI in order to complete inspection stage.", StringComparison.OrdinalIgnoreCase))
                //{
                //    return BadRequest(ApiResponse<string>.ErrorResponse(
                //        result, 403)); // Forbidden
                //}

                // return Ok(result);
                return Ok(ApiResponse<string>.SuccessResponse(result, "Inventory Equipment Saved successfully.", 200));
            }


            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UpdateTrainingEquipmentAvailability");
                return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }



        [HttpPost("SaveInstituteVerificationDetails")]
        public IActionResult SaveInstituteVerificationDetails([FromBody] ProposedInstituteInfoEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<object>.ErrorResponse("Verification data is missing.", 400));

                if (entity.InstituteID <= 0)
                    return BadRequest(ApiResponse<object>.ErrorResponse("Invalid Institute ID.", 400));

                if (string.IsNullOrEmpty(entity.FrormStatus))
                    return BadRequest(ApiResponse<object>.ErrorResponse("Verification status is required.", 400));

                if (entity.FrormStatus == "R" && string.IsNullOrEmpty(entity.InstituteProfileVerificationRemark))
                    return BadRequest(ApiResponse<object>.ErrorResponse("Remark is required for rejection.", 400));

                var result = _IExistingInstitute.SaveInstituteVerificationDetails(entity);

                if (result != null && result.ToUpper() == "Y")
                {
                    return Ok(ApiResponse<string>.SuccessResponse(result, "Verification saved successfully."));
                }
                else
                {
                    return BadRequest(ApiResponse<string>.ErrorResponse(result, 400));
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveInstituteVerificationDetails");
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }



    }

}
