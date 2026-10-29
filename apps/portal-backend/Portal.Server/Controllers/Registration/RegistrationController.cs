using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Portal.Business.Interface.Registration;
using Portal.Business.Worker.Base;
using Portal.Entities.Registration;
using Portal.Entities.ResponseBody;
using Portal.Server.Dto;

namespace Portal.Server.Controllers.Registration
{
    [AllowAnonymous]
    [Route("api/[controller]")]
    [ApiController]
    public class RegistrationController : ControllerBase
    {
        private readonly IRegistration _registrationWorker;

        public RegistrationController(IRegistration registrationWorker)
        {
            _registrationWorker = registrationWorker ?? throw new ArgumentNullException(nameof(registrationWorker));
        }

        [HttpGet("IsMobileNoDuplicate/{mobileNo}")]
        public IActionResult IsMobileNoDuplicate(string mobileNo)
        {
            try
            {
                var dataTable = _registrationWorker.Registration_IsMobileNoDuplicate(mobileNo);

                // Transform DataTable to a list of dictionaries (safe for JSON serialization)
                var serializableData = BaseWorker.ConvertDataTableToList(dataTable);

                return Ok(ApiResponse<List<Dictionary<string, object>>>.SuccessResponse(serializableData, "Mobile number verification completed"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.ErrorResponse($"Error: {ex.Message}"));
            }
        }


        [HttpGet("IsCandidateRegisteredByMobile")]
        public IActionResult IsCandidateRegisteredByMobile(long candidateId, string mobileNo)
        {
            try
            {
                bool isRegistered = _registrationWorker.IsCandidateAlreadyRegisteredUsingThisMobileNo(candidateId, mobileNo);
                string message = isRegistered ? "Candidate is already registered with this Mobile Number."
                                              : "Candidate is not registered with this Mobile Number.";

                return Ok(ApiResponse<bool>.SuccessResponse(isRegistered, message));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.ErrorResponse($"Error: {ex.Message}"));
            }
        }


        [HttpGet("IsCandidateRegisteredByEmail")]
        public IActionResult IsCandidateRegisteredByEmail(long candidateId, string emailId)
        {
            try
            {
                bool isRegistered = _registrationWorker.IsCandidateAlreadyRegisteredUsingThisEMailID(candidateId, emailId);
                return Ok(ApiResponse<bool>.SuccessResponse(isRegistered, "Email verification completed"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.ErrorResponse($"Error: {ex.Message}"));
            }
        }

        //[HttpPost("RegisterCandidate")]
        //public IActionResult RegisterCandidate([FromBody] RegistrationEntity entity)
        //{
        //    if (entity == null)
        //        return BadRequest(ApiResponse<string>.ErrorResponse("Invalid input"));

        //    try
        //    {
        //        string result = _registrationWorker.RegisterCandidate(entity);
        //        return Ok(ApiResponse<string>.SuccessResponse(result, "Candidate registered successfully"));
        //    }
        //    catch (Exception ex)
        //    {
        //        return BadRequest(ApiResponse<string>.ErrorResponse($"Error: {ex.Message}"));
        //    }
        //}


        [HttpPost("RegisterCandidate")]
        public IActionResult RegisterCandidate([FromBody] RegistrationEntity entity)
        {
            if (entity == null)
                return BadRequest(ApiResponse<string>.ErrorResponse("Invalid input"));

            try
            {
                string result = _registrationWorker.RegisterCandidate(entity);

                return Ok(ApiResponse<string>.SuccessResponse(result, "Candidate registered successfully."));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.ErrorResponse($"Error: {ex.Message}"));
            }
        }

        [HttpGet]
        [Route("IsStaffAlreadyRegisteredUsingThisEMailID")]
        public IActionResult IsStaffAlreadyRegisteredUsingThisEMailID(long StaffID, string EMailID)
        {
            try
            {
                var result = _registrationWorker.IsStaffAlreadyRegisteredUsingThisEMailID(StaffID, EMailID);
                return Ok(ApiResponse<bool>.SuccessResponse(result, "Email verification completed."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("IsStaffAlreadyRegisteredUsingThisMobileNo")]
        public IActionResult IsStaffAlreadyRegisteredUsingThisMobileNo(long StaffID, string MobileNo)
        {
            try
            {
                var result = _registrationWorker.IsStaffAlreadyRegisteredUsingThisMobileNo(StaffID, MobileNo);
                return Ok(ApiResponse<bool>.SuccessResponse(result, "Mobile number verification completed."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("RegistrationStaff_IsMobileNoDuplicate")]
        public IActionResult RegistrationStaff_IsMobileNoDuplicate(string MobileNo)
        {
            try
            {
                var result = _registrationWorker.RegistrationStaff_IsMobileNoDuplicate(MobileNo);
                var serializableData = BaseWorker.ConvertDataTableToList(result);

                //return Ok(ApiResponse<DataTable>.SuccessResponse(serializableData, "Mobile number duplicate check completed."));
                return Ok(ApiResponse<List<Dictionary<string, object>>>.SuccessResponse(serializableData, "Mobile number duplicate check completed."));

            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("RegisterStaff")]
        public IActionResult RegisterStaff([FromBody] RegistrationEntity entity)
        {
            try
            {
                var result = _registrationWorker.RegisterStaff(entity);
                return Ok(ApiResponse<string>.SuccessResponse(result, "Staff registered successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("RegisterInstitute")]
        public IActionResult RegisterInstitute([FromBody] InstituteRegistraionEntity entity)
        {
            try
            {
                var result = _registrationWorker.RegisterInstitute(entity);
                if (result.ToUpper() == "N")
                {
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to Register details. Please try again.", 400));
                }
                if (result == null)
                {
                    return NotFound(ApiResponse<string>.ErrorResponse("No data found.", 404));
                }
                return Ok(ApiResponse<string>.SuccessResponse(result, "Institute  registered successfully."));


            }
            catch (Exception ex) {


                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));

            }
        }
        

        [HttpPost]
        [Route("RegisterPromotorOrganisation")]
        public IActionResult RegisterPromotorOrganisation([FromBody] PromotingOrganizationRegistrationDto entity)
        {
            try
            {
                var promotingOrganization = new PromotingOrganizationRegistrationEntity
                {
                    PromotingOrganizationRegistrationFor = (short)entity.RegistrationFor,
                    OrganizatioRegistrationNumber = entity.OrganizatioRegistrationNumber,
                    PromotingOrganizationType = entity.OrganisationTypeID,
                    PromotingOrganizationTypeOther = entity.PromotingOrganizationTypeOther,
                    PromotingOrganizationStatusID = entity.PromoterStatusID,
                    NameOfPromotingOrganization = entity.NameOfPromotingOrganization,
                    PromotingOrganizationRegistrationDate = entity.DateOfRegistration,
                    PromotingOrganizationAddress = entity.PromotingOrganizationAddress,
                    PromotingOrganizationPincode = entity.PinCode,

                    PromotingOrganizationStateID = entity.StateID,
                    PromotingOrganizationDistrictID = entity.DistrictID,
                    PromotingOrganizationTalukaID = entity.TalukaID,
                    PromotingOrganizationCityID = entity.CityID,
                    PromotingOrganizationCityName = entity.CityName,


                    // 🔹 Security
                    AuthorizedRepresentativeSecurityQuestionID = (short)entity.SecurityQuestionId,
                    AuthorizedRepresentativeSecurityQuestionAnswer = entity.SecurityAnswer,
                    AuthorizedRepresentativePassword = entity.Password,
                    UserLoginID = "Guest",
                    // 🔹 Metadata
                    //IPAddress = HttpContext.Connection.RemoteIpAddress?.ToString(),
                    IPAddress = entity.IpAddress,
                    PageCode = "PROMOTER_REG"
                };

                // 🔹 Authorized Representative Mapping
                if (entity.AuthorizedRepresentative != null)
                {
                    promotingOrganization.ProfileIDforAuthorizedRepresentative = entity.AuthorizedRepresentative.ApplicationID;
                    promotingOrganization.AuthorizedRepresentativeTitle = entity.AuthorizedRepresentative.Title;
                    promotingOrganization.AuthorizedRepresentativeFirstName =
                        entity.AuthorizedRepresentative.FirstName;

                    promotingOrganization.AuthorizedRepresentativeMiddleName =
                        entity.AuthorizedRepresentative.MiddleName;

                    promotingOrganization.AuthorizedRepresentativeLastName =
                        entity.AuthorizedRepresentative.LastName;

                    promotingOrganization.AuthorizedRepresentativeGenderCode =
                        entity.AuthorizedRepresentative.Gender;

                    promotingOrganization.AuthorizedRepresentativeDOB =
                        entity.AuthorizedRepresentative.DOB;

                    promotingOrganization.AuthorizedRepresentativeAadharNo =
                        entity.AuthorizedRepresentative.AadhaarNo;

                    promotingOrganization.AuthorizedRepresentativeMobileNo =
                        entity.AuthorizedRepresentative.MobileNo;

                    promotingOrganization.AuthorizedRepresentativeAltMobileNo =
                        entity.AuthorizedRepresentative.AltMobileNo;

                    promotingOrganization.AuthorizedRepresentativeEMailID =
                        entity.AuthorizedRepresentative.EMailID;
                }

                var result = _registrationWorker.RegisterProposedOrganisation(promotingOrganization);
                return Ok(ApiResponse<string>.SuccessResponse(result, "Staff registered successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }


        [HttpPost("RegisterCandidateStep")]
        public IActionResult RegisterCandidateSTEP([FromBody] RegistrationEntity entity)
        {
            if (entity == null)
                return BadRequest(ApiResponse<string>.ErrorResponse("Invalid input"));

            try
            {
                string result = _registrationWorker.RegisterCandidateStep(entity);

                return Ok(ApiResponse<string>.SuccessResponse(result, "Candidate registered successfully."));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.ErrorResponse($"Error: {ex.Message}"));
            }
        }




        [HttpPost]
        [Route("RegisterComplaint")]
        public IActionResult RegisterComplaint([FromBody] RegisterComplaintEntity entity)
        {
            if (entity == null)
            {
                return BadRequest(
                    ApiResponse<string>.ErrorResponse("Invalid input")
                );
            }

            try
            {
                var result = _registrationWorker.RegisterComplaint(entity);

                if (string.IsNullOrWhiteSpace(result))
                {
                    return BadRequest(
                        ApiResponse<string>.ErrorResponse(
                            "Failed to register complaint."
                        )
                    );
                }

                if (result.ToUpper() == "N")
                {
                    return BadRequest(
                        ApiResponse<string>.ErrorResponse(
                            "Data has not been saved. Please try again."
                        )
                    );
                }

                return Ok(
                    ApiResponse<string>.SuccessResponse(
                        result,
                        "Complaint registered successfully."
                    )
                );
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    ApiResponse<object>.ErrorResponse(
                        $"An error occurred: {ex.Message}",
                        500
                    )
                );
            }
        }
        [HttpGet]
        [Route("IsInstituteEligibleForApplyWithPromotingOgranisation")]
        public IActionResult IsInstituteEligibleForApplyWithPromotingOgranisation(long promotingOgranisationId)
        {
            try
            {
                if(promotingOgranisationId < 0)
                {
                    return BadRequest(
                    ApiResponse<string>.ErrorResponse("Invalid input")
                );
                }
                var result = _registrationWorker.IsInstituteEligibleForApplyWithPromotingOgranisation(promotingOgranisationId);
                return Ok(
                    ApiResponse<string>.SuccessResponse(
                        result.ToString(),
                        "Eligibility retrived successfully."
                    )
                );
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    ApiResponse<object>.ErrorResponse(
                        $"An error occurred: {ex.Message}",
                        500
                    )
                );
            }
        }
    }
}
