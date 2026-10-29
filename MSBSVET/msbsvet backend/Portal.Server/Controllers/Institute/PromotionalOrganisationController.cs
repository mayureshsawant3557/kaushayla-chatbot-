using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Portal.Business.Interface.Institute;
using Portal.Business.Worker.Utility;
using Portal.Entities.Institute;
using Portal.Entities.Registration;
using Portal.Entities.ResponseBody;
using System.Data;
using Portal.Business.Interface.Base;
using System.Threading.Tasks;

namespace Portal.Server.Controllers.Institute
{
    [Route("api/[controller]")]
    [ApiController]
    public class PromotionalOrganisationController : ControllerBase
    {
        private readonly IPromotionalOrganisation _IPromotionalOrganisation;
        private readonly IOcrVerificationService _ocrVerificationService;

        public PromotionalOrganisationController(IPromotionalOrganisation iPromotionalOrganisation, IOcrVerificationService ocrVerificationService)
        {
            _IPromotionalOrganisation = iPromotionalOrganisation ?? throw new ArgumentNullException(nameof(iPromotionalOrganisation));
            _ocrVerificationService = ocrVerificationService ?? throw new ArgumentNullException(nameof(ocrVerificationService));
        }

        [HttpPost("GetPromotionalOrganisationDetails")]
        public IActionResult GetPromotionalOrganisationDetails([FromBody] InstituteInputEntity input)
        {
            try
            {
                if (input == null)
                    return BadRequest(ApiResponse<object>.ErrorResponse("Input data is missing.", 400));

                var result = _IPromotionalOrganisation.GetPromotionalOrganisationDetails(input);
                return Ok(ApiResponse<PromotingOrganisationEntity>.SuccessResponse(result, "Promotional organisation details retrieved successfully."));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetPromotionalOrganisationDetails");
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }



        [HttpPost("VerifyDocumentOcr")]
        [AllowAnonymous]
        public async Task<IActionResult> VerifyDocumentOcr([FromBody] VerifyDocumentOcrRequest request)
        {
            try
            {
                if (request == null)
                    return BadRequest(ApiResponse<object>.ErrorResponse("Request data is missing.", 400));

                if (string.IsNullOrWhiteSpace(request.FilePath))
                    return BadRequest(ApiResponse<object>.ErrorResponse("Document path is required.", 400));

                if (string.IsNullOrWhiteSpace(request.ExpectedNumber))
                    return BadRequest(ApiResponse<object>.ErrorResponse("Expected document number is required for verification.", 400));

                var result = await _ocrVerificationService.VerifyDocumentDetailedAsync(request.FilePath, request.DocumentType, request.ExpectedNumber);

                if (!result.Success)
                {
                    return BadRequest(ApiResponse<object>.ErrorResponse(result.Message, 400));
                }

                if (result.Verified)
                {
                    return Ok(ApiResponse<object>.SuccessResponse(new { verified = true, message = "VERIFIED" }, "VERIFIED"));
                }
                else
                {
                    return Ok(ApiResponse<object>.SuccessResponse(new { verified = false, message = "NOT VERIFIED — Document number does not match" }, "NOT VERIFIED — Document number does not match"));
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "VerifyDocumentOcr");
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"OCR verification error: {ex.Message}", 500));
            }
        }

        [HttpPost("SavePromotionalOrganisationDetails")]
        public async Task<IActionResult> SavePromotionalOrganisationDetails([FromBody] PromotingOrganisationEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<object>.ErrorResponse("Organisation data is missing.", 400));

                // --- OCR Validation Step ---
                
                // 1. Verify Registration Certificate
                if (!string.IsNullOrWhiteSpace(entity.RegistrationCertificatePath) && !string.IsNullOrWhiteSpace(entity.RegistrationNumber))
                {
                    var regResult = await _ocrVerificationService.VerifyDocumentDetailedAsync(entity.RegistrationCertificatePath, "registration_certificate", entity.RegistrationNumber);
                    if (!regResult.Verified)
                    {
                        return BadRequest(ApiResponse<object>.ErrorResponse(regResult.Message, 400));
                    }
                }

                // 2. Verify PAN Card
                if (!string.IsNullOrWhiteSpace(entity.PANPath) && !string.IsNullOrWhiteSpace(entity.PANNo))
                {
                    var panResult = await _ocrVerificationService.VerifyDocumentDetailedAsync(entity.PANPath, "pan", entity.PANNo);
                    if (!panResult.Verified)
                    {
                        return BadRequest(ApiResponse<object>.ErrorResponse(panResult.Message, 400));
                    }
                }

                // --- Test Phase: Bypass Database Save ---
                // var result = _IPromotionalOrganisation.SavePromotionalOrganisationDetails(entity);
                // return Ok(ApiResponse<string>.SuccessResponse(result, "Promotional organisation details saved successfully."));
                
                return Ok(ApiResponse<string>.SuccessResponse("TEST PHASE: OCR verification passed successfully! Database save is bypassed.", "Success"));
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

                var result = _IPromotionalOrganisation.SavePromotersDetails(entity);
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

                var result = _IPromotionalOrganisation.GetPromoterDetailsByID(promoterId);
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

                var result = _IPromotionalOrganisation.GetPromoterDetailsByInstituteID(input);
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

                var result = _IPromotionalOrganisation.GetProposedInstituteDetails(instituteId, userLoginId);
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
        public IActionResult SaveProposedInstituteDetails([FromBody] InstituteInfoEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<object>.ErrorResponse("Institute data is missing.", 400));

                var result = _IPromotionalOrganisation.SaveProposedInstituteDetails(entity);
                return Ok(ApiResponse<string>.SuccessResponse(result, "Proposed institute details saved successfully."));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveProposedInstituteDetails");
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("SaveInstitute_PromoterStaffMappingDetails")]
        public IActionResult SaveInstitute_PromoterStaffMappingDetails([FromBody] PromotersDetailsMappingRequest request)
        {
            PromotersDetailsEntity entity = new PromotersDetailsEntity();
            entity.PromoterID = request.ID;
            entity.InstituteID = request.InstituteID;
            entity.StaffProfileId = request.StaffID;
            entity.PromoterTypeID = request.ManagementType;
            entity.UserLoginID = request.CreateBy;
            entity.IPAddress = request.IPAddress;
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<object>.ErrorResponse("Mapping data is missing.", 400));

                var result = _IPromotionalOrganisation.SaveInstitute_PromoterStaffMappingDetails(entity);
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

                var result = _IPromotionalOrganisation.Delete_PromoterStaffMappingDetails(entity);
                return Ok(ApiResponse<string>.SuccessResponse(result, "Promoter staff mapping deleted successfully."));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "Delete_PromoterStaffMappingDetails");
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }
        [AllowAnonymous]
        [HttpPost("GetPromotingOrganisationDetails")]
        public IActionResult GetPromotingOrganisationDetails([FromBody] InstituteInputEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<object>.ErrorResponse("Input data is missing.", 400));

                var result = _IPromotionalOrganisation.GetPromotingOrganisationDetails(entity);
                return Ok(ApiResponse<PromotingOrganizationRegistrationEntity>.SuccessResponse(result, "Promoting organisation details retrieved successfully."));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetPromotingOrganisationDetails");
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("SaveInstitute_AssociatedInstituteMappingDetails")]
        public IActionResult SaveInstitute_AssociatedInstituteMappingDetails([FromBody] PromotersDetailsMappingRequest entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<object>.ErrorResponse("Mapping data is missing.", 400));

                var result = _IPromotionalOrganisation.SaveInstitute_AssociatedInstituteMappingDetails(entity);
                return Ok(ApiResponse<string>.SuccessResponse(result, "Associated institute mapping saved successfully."));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveInstitute_AssociatedInstituteMappingDetails");
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("GetAssociatedInstituteByPromotingOrganisationID")]
        public IActionResult GetAssociatedInstituteByPromotingOrganisationID([FromBody] InstituteInputEntity input)
        {
            try
            {
                if (input == null)
                    return BadRequest(ApiResponse<object>.ErrorResponse("Input data is missing.", 400));

                var result = _IPromotionalOrganisation.GetAssociatedInstituteByPromotingOrganisationID(input);
                return Ok(ApiResponse<List<AssociatedInstituteEntity>>.SuccessResponse(result, "Associated institutes retrieved successfully."));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetAssociatedInstituteByPromotingOrganisationID");
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("Delete_AssociatedInstituteMappingDetails")]
        public IActionResult Delete_AssociatedInstituteMappingDetails(long Id, string UserLoginID, string IPAddress)
        {
            try
            {

                var result = _IPromotionalOrganisation.Delete_AssociatedInstituteMappingDetails(Id, UserLoginID, IPAddress);
                return Ok(ApiResponse<string>.SuccessResponse(result, "Associated institute mapping deleted successfully."));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "Delete_AssociatedInstituteMappingDetails");
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet("GetStatusProposedOrganisation/{proposedOrganisationId}")]
        public IActionResult GetStatusProposedOrganisation(long proposedOrganisationId)
        {
            try
            {
                if (proposedOrganisationId <= 0)
                    return BadRequest(ApiResponse<object>.ErrorResponse("Invalid proposed organisation ID.", 400));

                var result = _IPromotionalOrganisation.GetStatusProposedOrganisation(proposedOrganisationId);
                return Ok(ApiResponse<string>.SuccessResponse(result, "Proposed organisation status retrieved successfully."));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetStatusProposedOrganisation");
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPut("UpdateProposedOrganisationStatus")]
        public IActionResult UpdateProposedOrganisationStatus(
            [FromQuery] long proposedOrganisationId,
            [FromQuery] string userLoginId,
            [FromQuery] string ipAddress,
            [FromQuery] char statusCode)
        {
            try
            {
                if (proposedOrganisationId <= 0)
                    return BadRequest(ApiResponse<object>.ErrorResponse("Invalid proposed organisation ID.", 400));

                if (string.IsNullOrEmpty(userLoginId) || string.IsNullOrEmpty(ipAddress))
                    return BadRequest(ApiResponse<object>.ErrorResponse("User login ID and IP address are required.", 400));

                var result = _IPromotionalOrganisation.UpdateProposedOrganisationStatus(proposedOrganisationId, userLoginId, ipAddress, statusCode);
                return Ok(ApiResponse<string>.SuccessResponse(result, "Proposed organisation status updated successfully."));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UpdateProposedOrganisationStatus");
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet("SearchPromotingOrganization")]
        public IActionResult SearchPromotingOrganization(
            [FromQuery] int districtId,
            [FromQuery] int talukaId,
            [FromQuery] int regionId,
            [FromQuery] string formStatus,
            [FromQuery] long instituteId)
        {
            try
            {
                var result = _IPromotionalOrganisation.SearchPromotingOrganization(districtId, talukaId, regionId, formStatus, instituteId);
                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Promoting organizations retrieved successfully."));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SearchPromotingOrganization");
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet("GetPromotingOrganizationSearch")]
        public IActionResult GetPromotingOrganizationSearch(
            [FromQuery] long instituteId,
            [FromQuery] string instituteCode,
            [FromQuery] char formStatus)
        {
            try
            {
                var result = _IPromotionalOrganisation.GetPromotingOrganizationSearch(instituteId, instituteCode, formStatus);
                return Ok(ApiResponse<DataSet>.SuccessResponse(result, "Promoting organization search results retrieved successfully."));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetPromotingOrganizationSearch");
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("SavePromotionalOrganisationDetailsVerification")]
        public IActionResult SavePromotionalOrganisationDetailsVerification([FromBody] PromotingOrganisationVerificationSave entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<object>.ErrorResponse("Verification data is missing.", 400));

                var result = _IPromotionalOrganisation.SavePromotionalOrganisationDetailsVerification(entity);
                return Ok(ApiResponse<string>.SuccessResponse(result, "Promotional organisation verification details saved successfully."));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SavePromotionalOrganisationDetailsVerification");
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("Update_AssociatedInstituteMappingDetails")]
        public IActionResult Update_AssociatedInstituteMappingDetails([FromBody] List<AssociatedInstituteEntity> entity)
        {
            try
            {
                if (entity == null || entity.Count == 0)
                    return BadRequest(ApiResponse<object>.ErrorResponse("Mapping data is missing.", 400));

                var result = _IPromotionalOrganisation.Update_AssociatedInstituteMappingDetails(entity);
                return Ok(ApiResponse<string>.SuccessResponse(result, "Associated institute mapping updated successfully."));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "Update_AssociatedInstituteMappingDetails");
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPut("Update_PromoterStaffMappingDetails")]
        public IActionResult Update_PromoterStaffMappingDetails([FromBody] List<PromotersDetailsEntity> entity)
        {
            try
            {
                if (entity == null || entity.Count == 0)
                    return BadRequest(ApiResponse<object>.ErrorResponse("Mapping data is missing.", 400));

                var result = _IPromotionalOrganisation.Update_PromoterStaffMappingDetails(entity);
                return Ok(ApiResponse<string>.SuccessResponse(result, "Promoter staff mapping updated successfully."));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "Update_PromoterStaffMappingDetails");
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet("PromotingOrganizationDashboardRejectStatusCounts")]
        public IActionResult PromotingOrganizationDashboardRejectStatusCounts(
            [FromQuery] string tableName,
            [FromQuery] long promotingOrganisationId,
            [FromQuery] char statusParam)
        {
            try
            {
                var result = _IPromotionalOrganisation.PromotingOrganizationDashboardRejectStatusCounts(tableName, promotingOrganisationId, statusParam);
                return Ok(ApiResponse<DataSet>.SuccessResponse(result, "Dashboard reject status counts retrieved successfully."));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "PromotingOrganizationDashboardRejectStatusCounts");
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("ConfirmPromotionalOrganisationDetails")]
        public IActionResult ConfirmPromotionalOrganisationDetails(
            [FromQuery] long promotingOrganisationId,
            [FromQuery] string userLoginId,
            [FromQuery] string ipAddress)
        {
            try
            {
                if (promotingOrganisationId <= 0)
                    return BadRequest(ApiResponse<object>.ErrorResponse("Invalid promoting organisation ID.", 400));

                if (string.IsNullOrEmpty(userLoginId) || string.IsNullOrEmpty(ipAddress))
                    return BadRequest(ApiResponse<object>.ErrorResponse("User login ID and IP address are required.", 400));

                var result = _IPromotionalOrganisation.ConfirmPromotionalOrganisationDetails(promotingOrganisationId, userLoginId, ipAddress);
                return Ok(ApiResponse<string>.SuccessResponse(result, "Promotional organisation details confirmed successfully."));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "ConfirmPromotionalOrganisationDetails");
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet("GetPromotingOrganisationIDByInstituteID/{instituteId}")]
        public IActionResult GetPromotingOrganisationIDByInstituteID(long instituteId)
        {
            try
            {
                if (instituteId <= 0)
                    return BadRequest(ApiResponse<object>.ErrorResponse("Invalid institute ID.", 400));

                var result = _IPromotionalOrganisation.GetPromotingOrganisationIDBYInstituteID(instituteId);
                return Ok(ApiResponse<long>.SuccessResponse(result, "Promoting organisation ID retrieved successfully."));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetPromotingOrganisationIDByInstituteID");
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }


        //Add for the Checking the Duplicate Registration/ Incorporation Number/ GR Number in a 
        //promoting organization registration page.

        [HttpPost("CheckDuplicatePromotingOrganisation")]
        [AllowAnonymous] // public registration page; remove if your controller handles this differently
        public IActionResult CheckDuplicatePromotingOrganisation([FromBody] CheckDuplicatePromotingOrganisationRequestEntity entity)
        {
            try
            {
                if (entity == null || string.IsNullOrWhiteSpace(entity.OrganizatioRegistrationNumber))
                    return BadRequest(ApiResponse<object>.ErrorResponse("Registration number is required.", 400));

                var result = _IPromotionalOrganisation.CheckDuplicatePromotingOrganisation(entity);

                return Ok(ApiResponse<DuplicateCheckResultEntity>.SuccessResponse(result, result.Message));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "CheckDuplicatePromotingOrganisation");
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }
    }

    public class VerifyDocumentOcrRequest
    {
        public string FilePath { get; set; } = string.Empty;
        public string DocumentType { get; set; } = string.Empty;
        public string ExpectedNumber { get; set; } = string.Empty;
    }
}
