using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Portal.Business.Interface.Base;
using Portal.Business.Interface.Institute;
using Portal.Business.Worker.Base;
using Portal.Business.Worker.Utility;
using Portal.Entities.Base;
using Portal.Entities.Institute;
using Portal.Entities.ResponseBody;
using System.ComponentModel.DataAnnotations;
using System.Data;

namespace Portal.Server.Controllers.Base
{
    [AllowAnonymous]
    [ApiController]
    [Route("[controller]")]  
    public class BaseController : ControllerBase
    {
        private readonly IBase _base;
        public BaseController(IBase baseService)
        {
            _base = baseService;
        }
        [HttpGet]
        [Route("Testing")]
        public IActionResult Testing()
        {
            try
            {
                var result = "True";
                return Ok(ApiResponse<object>.SuccessResponse(result, "Testing completed successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }
        [HttpGet]
        [Route("GetMasterTableList")]
        public IActionResult GetMasterTableList(string TableName, string DataValueField, string DataTextField, bool HasSelect = true, string ParentField = "", string ParentFieldValue = "", string orderByText = "")
        {
            try
            {
                var result = _base.GetMasterTableList(TableName, DataValueField, DataTextField, HasSelect, ParentField, ParentFieldValue, orderByText);

                if (result == null || !result.Any())
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No data found for the specified table.", 404));
                }

                return Ok(ApiResponse<object>.SuccessResponse(result, "Master table list retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet("GetMasterRegion")]
        //[Route("GetMasterRegion")]
        public IActionResult GetMasterRegion()
        {
            try
            {
                var result = _base.GetMasterRegion();

                if (result == null || !result.Any())
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No regions found.", 404));
                }

                return Ok(ApiResponse<object>.SuccessResponse(result, "Master region list retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetMasterRegionDistrict")]
        public IActionResult GetMasterRegionDistrict()
        {
            try
            {
                var result = _base.GetMasterRegionDistrict();

                if (result == null || !result.Any())
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No region districts found.", 404));
                }

                return Ok(ApiResponse<object>.SuccessResponse(result, "Master region district list retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }
        [HttpGet]
        [Route("GetMasterDistrictTalukas")]
        public IActionResult GetMasterDistrictTalukas()
        {
            try
            {
                var result = _base.GetMasterDistrictTalukas();

                if (result == null || !result.Any())
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No region districts found.", 404));
                }

                return Ok(ApiResponse<object>.SuccessResponse(result, "Master region district list retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetExamType")]
        public IActionResult GetExamType()
        {
            try
            {
                var result = _base.GetExamType();

                if (result == null)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No exam type found.", 404));
                }

                return Ok(ApiResponse<object>.SuccessResponse(result, "exam type  list retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetMasterDistrict")]
        public IActionResult GetMasterDistrict()
        {
            try
            {
                var result = _base.GetMasterDistrict();

                if (result == null || !result.Any())
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No districts found.", 404));
                }

                return Ok(ApiResponse<object>.SuccessResponse(result, "Master district list retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetMasterTaluka")]
        public IActionResult GetMasterTaluka()
        {
            try
            {
                var result = _base.GetMasterTaluka();

                if (result == null || !result.Any())
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No talukas found.", 404));
                }

                return Ok(ApiResponse<object>.SuccessResponse(result, "Master taluka list retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetMasterCity")]
        public IActionResult GetMasterCity()
        {
            try
            {
                var result = _base.GetMasterCity();

                if (result == null || !result.Any())
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No cities found.", 404));
                }

                return Ok(ApiResponse<object>.SuccessResponse(result, "Master city list retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetMasterCaste")]
        public IActionResult GetMasterCaste()
        {
            try
            {
                var result = _base.GetMasterCaste();

                if (result == null || !result.Any())
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No castes found.", 404));
                }

                return Ok(ApiResponse<object>.SuccessResponse(result, "Master caste list retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetMasterQualification")]
        public IActionResult GetMasterQualification(long CandidateID, string QualificationGroup)
        {
            try
            {
                var result = _base.GetMasterQualification(CandidateID, QualificationGroup);

                if (result == null || !result.Any())
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No qualifications found.", 404));
                }

                return Ok(ApiResponse<object>.SuccessResponse(result, "Master qualification list retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetMasterSector")]
        public IActionResult GetMasterSector()
        {
            try
            {
                var result = _base.GetMasterSector();

                if (result == null || !result.Any())
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No sectors found.", 404));
                }

                return Ok(ApiResponse<object>.SuccessResponse(result, "Master sector list retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetMasterCourseType")]
        public IActionResult GetMasterCourseType()
        {
            try
            {
                var result = _base.GetMasterCourseType();

                if (result == null || !result.Any())
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No course types found.", 404));
                }

                return Ok(ApiResponse<object>.SuccessResponse(result, "Master course type list retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetMasterCourse")]
        public IActionResult GetMasterCourse(short SectorID, short CourseTypeID, string Flag = "")
        {
            try
            {
                var result = _base.GetMasterCourse(SectorID, CourseTypeID, Flag);

                if (result == null || !result.Any())
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No courses found for the given criteria.", 404));
                }

                return Ok(ApiResponse<object>.SuccessResponse(result, "Master course list retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetMasterInstitute")]
        public IActionResult GetMasterInstitute()
        {
            try
            {
                var result = _base.GetMasterInstitute();

                if (result == null || !result.Any())
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No institutes found.", 404));
                }

                return Ok(ApiResponse<object>.SuccessResponse(result, "Master institute list retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetMasterEntryQualification")]
        public IActionResult GetMasterEntryQualification()
        {
            try
            {
                var result = _base.GetMasterEntryQualification();

                if (result == null || !result.Any())
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No entry qualifications found.", 404));
                }

                return Ok(ApiResponse<object>.SuccessResponse(result, "Master entry qualification list retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("SaveLog")]
        public IActionResult SaveLog([FromBody] LogEntity entity)
        {
            try
            {
                _base.SaveLog(entity);
                return Ok(ApiResponse<object>.SuccessResponse(null, "Log saved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("SaveMessageContent")]
        public IActionResult SaveMessageContent([FromBody] MessagingEntity me)
        {
            try
            {
                _base.SaveMessageContent(me);
                return Ok(ApiResponse<object>.SuccessResponse(null, "Message content saved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("IsNewRegistrationStarted")]
        public IActionResult IsNewRegistrationStarted(short UserTypeID)
        {
            try
            {
                var result = _base.IsNewRegistrationStarted(UserTypeID);
                return Ok(ApiResponse<bool>.SuccessResponse(result, "Registration status retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetOTP")]
        public IActionResult GetOTP(string MobileNo, string Purpose, string OTP)
        {
            try
            {
                var result = _base.GetOTP(MobileNo, Purpose, OTP);
                if (string.IsNullOrEmpty(result))
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("OTP not found.", 404));
                }
                return Ok(ApiResponse<string>.SuccessResponse(result, "OTP retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("SaveOTPVerificationStatus")]
        public IActionResult SaveOTPVerificationStatus([FromBody] OTPVerificationRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ApiResponse<object>.ErrorResponse("Invalid input data", 400));
                }

                _base.SaveOTPVerificationStatus(
                    request.MobileNo,
                    request.Purpose,
                    request.OTP,
                    request.IsOTPVerified
                );

                return Ok(ApiResponse<object>.SuccessResponse(null, "OTP verification status saved successfully", 200));
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ApiResponse<object>.ErrorResponse(ex.Message, 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse("An error occurred while saving OTP verification status", 500));
            }
        }


        [HttpGet]
        [Route("GetPincodeData")]
        public IActionResult GetPincodeData(string Pincode)
        {
            try
            {
                var result = _base.GetPincodeData(Pincode);
                if (result == null)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("Pincode data not found.", 404));
                }
                return Ok(ApiResponse<PincodeEntity>.SuccessResponse(result, "Pincode data retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("IsCandidateFormLocked")]
        public IActionResult IsCandidateFormLocked(long CandidateID)
        {
            try
            {
                var result = _base.IsCandidateFormLocked(CandidateID);
                return Ok(ApiResponse<bool>.SuccessResponse(result, "Candidate form lock status retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetEMailSMS")]
        public IActionResult GetEMailSMS(string Purpose, string MessageType, string Param1 = "", string Param2 = "", string Param3 = "", string Param4 = "", string Param5 = "")
        {
            try
            {
                var result = _base.GetEMailSMS(Purpose, MessageType, Param1, Param2, Param3, Param4, Param5);
                var serializableData = BaseWorker.ConvertDataTableToList(result); // Convert only when needed
                if (result == null || result.Rows.Count == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No email/SMS data found.", 404));
                }
                return Ok(ApiResponse<object>.SuccessResponse(serializableData, "Email/SMS data retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }


        [HttpGet]
        [Route("GetCandidateStepID")]
        public IActionResult GetCandidateStepID(long CandidateID)
        {
            try
            {
                var result = _base.GetCandidateStepID(CandidateID);
                return Ok(ApiResponse<short>.SuccessResponse(result, "Candidate step ID retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetCandidateMobileNo")]
        public IActionResult GetCandidateMobileNo(long CandidateID)
        {
            try
            {
                var result = _base.GetCandidateMobileNo(CandidateID);
                if (string.IsNullOrEmpty(result))
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("Candidate mobile number not found.", 404));
                }
                return Ok(ApiResponse<string>.SuccessResponse(result, "Candidate mobile number retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetCandidateID")]
        public IActionResult GetCandidateID(string ApplicationID)
        {
            try
            {
                var result = _base.GetCandidateID(ApplicationID);
                if (result == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("Candidate ID not found.", 404));
                }
                return Ok(ApiResponse<long>.SuccessResponse(result, "Candidate ID retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetCandidateName")]
        public IActionResult GetCandidateName(long CandidateID)
        {
            try
            {
                var result = _base.GetCandidateName(CandidateID);
                if (string.IsNullOrEmpty(result))
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("Candidate name not found.", 404));
                }
                return Ok(ApiResponse<string>.SuccessResponse(result, "Candidate name retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("SaveUserActionDetails")]
        public IActionResult SaveUserActionDetails(string Module, string UserLoginID, string ApplicationID, string ActionTaken, string IPAddress, string PageURL)
        {
            try
            {
                _base.SaveUserActionDetails(Module, UserLoginID, ApplicationID, ActionTaken, IPAddress, PageURL);
                return Ok(ApiResponse<object>.SuccessResponse(null, "User action details saved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetMasterPromoterType")]
        public IActionResult GetMasterPromoterType(string Group = "")
        {
            try
            {
                var result = _base.GetMasterPromoterType(Group);
                if (result == null || !result.Any())
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No promoter types found.", 404));
                }
                return Ok(ApiResponse<List<DropdownEntity>>.SuccessResponse(result, "Master promoter type list retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetMasterPromoterStatus")]
        public IActionResult GetMasterPromoterStatus()
        {
            try
            {
                var result = _base.GetMasterPromoterStatus();
                if (result == null || !result.Any())
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No promoter statuses found.", 404));
                }
                return Ok(ApiResponse<List<DropdownEntity>>.SuccessResponse(result, "Master promoter status list retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetMasterLocationCategory")]
        public IActionResult GetMasterLocationCategory()
        {
            try
            {
                var result = _base.GetMasterLocationCategory();
                if (result == null || !result.Any())
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No location categories found.", 404));
                }
                return Ok(ApiResponse<List<DropdownEntity>>.SuccessResponse(result, "Master location category list retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetInstituteIDByInstituteCode")]
        public IActionResult GetInstituteIDByInstituteCode(string InstituteCode)
        {
            try
            {
                var result = _base.GetInstituteIDByInstituteCode(InstituteCode);
                if (result == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("Institute ID not found.", 404));
                }
                return Ok(ApiResponse<long>.SuccessResponse(result, "Institute ID retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("IsPasswordValid")]
        public IActionResult IsPasswordValid(string UserLoginID, string UserPassword)
        {
            try
            {
                var result = _base.IsPasswordValid(UserLoginID, UserPassword);
                return Ok(ApiResponse<bool>.SuccessResponse(result, "Password validation completed."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("IsAdmissionConfirmationStarted")]
        public IActionResult IsAdmissionConfirmationStarted()
        {
            try
            {
                var result = _base.IsAdmissionConfirmationStarted();
                return Ok(ApiResponse<bool>.SuccessResponse(result, "Admission confirmation status retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetCurrentAdmissionYear")]
        public IActionResult GetCurrentAdmissionYear()
        {
            try
            {
                var result = _base.GetCurrentAdmissionYear();
                var serializableData = BaseWorker.ConvertDataTableToList(result);
                if (result == null || result.Rows.Count == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No admission year data found.", 404));
                }
                return Ok(ApiResponse<object>.SuccessResponse(serializableData, "Current admission year retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }
        [HttpGet]
        [Route("GetCurrentFinancialYear")]
        public IActionResult GetCurrentFinancialYear()
        {
            try
            {
                var result = _base.GetCurrentFinancialYear();
                var serializableData = BaseWorker.ConvertDataTableToList(result);
                if (result == null || result.Rows.Count == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No Financial year data found.", 404));
                }
                return Ok(ApiResponse<object>.SuccessResponse(serializableData, "Current Financial year retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetCurrentAdmissionYearForApplication")]
        public IActionResult GetCurrentAdmissionYearForApplication()
        {
            try
            {
                var result = _base.GetCurrentAdmissionYearForApplication();
                var serializableData = BaseWorker.ConvertDataTableToList(result);
                if (result == null || result.Rows.Count == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No admission year data found for application.", 404));
                }
                return Ok(ApiResponse<object>.SuccessResponse(serializableData, "Current admission year for application retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetMasterMainCourse")]
        public IActionResult GetMasterMainCourse()
        {
            try
            {
                var result = _base.GetMasterMainCourse();
                var serializableData = BaseWorker.ConvertDataTableToList(result);
                if (result == null || result.Rows.Count == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No main course data found.", 404));
                }
                return Ok(ApiResponse<object>.SuccessResponse(serializableData, "Master main course data retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetIsGovCollege")]
        public IActionResult GetIsGovCollege(long CollegeID,string UserLoginID)
        {
            try
            {
                var result = _base.GetIsGovCollege(CollegeID, UserLoginID);
                var serialized = BaseWorker.ConvertDataTableToList(result);

                return Ok(ApiResponse<object>.SuccessResponse(serialized, "Status retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse(ex.Message, 500));
            }
        }

        [HttpGet]
        [Route("GetIsActivityValid")]
        public IActionResult GetIsActivityValid(string ActivityName)
        {
            try
            {
                var result = _base.GetIsActivityValid(ActivityName);
                var serialized = BaseWorker.ConvertDataTableToList(result);

                return Ok(ApiResponse<object>.SuccessResponse(serialized, "Activity validity retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse(ex.Message, 500));
            }
        }

        [HttpGet]
        [Route("GetApplicationIDByApplicationIDDisplay")]
        public IActionResult GetApplicationIDByApplicationIDDisplay(string ApplicationIDDisplay)
        {
            try
            {
                var result = _base.GetApplicationIDByApplicationIDDisplay(ApplicationIDDisplay);
                if (result == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("Application ID not found.", 404));
                }
                return Ok(ApiResponse<long>.SuccessResponse(result, "Application ID retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetCandidateIDByApplicationID")]
        public IActionResult GetCandidateIDByApplicationID(long ApplicationID)
        {
            try
            {
                var result = _base.GetCandidateIDByApplicationID(ApplicationID);
                if (result == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("Candidate ID not found for the given Application ID.", 404));
                }
                return Ok(ApiResponse<long>.SuccessResponse(result, "Candidate ID retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetApplicationIDDisplayByApplicationID")]
        public IActionResult GetApplicationIDDisplayByApplicationID(long ApplicationID)
        {
            try
            {
                var result = _base.GetApplicationIDDisplayByApplicationID(ApplicationID);
                if (string.IsNullOrEmpty(result))
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("Application ID display value not found.", 404));
                }
                return Ok(ApiResponse<string>.SuccessResponse(result, "Application ID display retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetCandidateProfileIDByApplicationID")]
        public IActionResult GetCandidateProfileIDByApplicationID(long ApplicationID)
        {
            try
            {
                var result = _base.GetCandidateProfileIDByApplicationID(ApplicationID);
                if (string.IsNullOrEmpty(result))
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("Candidate profile ID not found.", 404));
                }
                return Ok(ApiResponse<string>.SuccessResponse(result, "Candidate profile ID retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetCandidateProfileIDByCandidateId")]
        public IActionResult GetCandidateProfileIDByCandidateId(long CandidateID)
        {
            try
            {
                var result = _base.GetCandidateProfileIDByCandidateId(CandidateID);
                if (string.IsNullOrEmpty(result))
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("Candidate profile ID not found.", 404));
                }
                return Ok(ApiResponse<string>.SuccessResponse(result, "Candidate profile ID retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetHomeDashboard")]
        public IActionResult GetHomeDashboard()
        {
            try
            {
                var result = _base.GetHomeDashboard();
                //var serializableData = BaseWorker.ConvertDataTableToList(result);
                //if (result == null || result.Rows.Count == 0)
                //{
                //    return NotFound(ApiResponse<object>.ErrorResponse("No dashboard data found.", 404));
                //}
                return Ok(ApiResponse<object>.SuccessResponse(result, "Home dashboard data retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetHomeSTTDashboard")]
        public IActionResult GetHomeSTTDashboard()
        {
            try
            {
                var result = _base.GetHomeSTTDashboard();
                //  var serializableData = BaseWorker.ConvertDataTableToList(result);
                //if (result == null || result.Rows.Count == 0)
                //{
                //    return NotFound(ApiResponse<object>.ErrorResponse("No dashboard data found.", 404));
                //}
                return Ok(ApiResponse<object>.SuccessResponse(result, "Home dashboard data retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }


        [HttpGet]
        [Route("GetCourseByCollogeID")]
        public IActionResult GetCourseByCollogeID(long CollegeID, short isnewadmission=1)
        {
            try
            {
                var result = _base.GetCourseByCollogeID(CollegeID, isnewadmission);
                var serializableData = BaseWorker.ConvertDataTableToList(result);
                if (result == null || result.Rows.Count == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No course data found for the given College ID.", 404));
                }
                return Ok(ApiResponse<object>.SuccessResponse(serializableData, "Course data retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetRegionInstitute")]
        public IActionResult GetRegionInstitute(int RegionID)
        {
            try
            {
                var result = _base.GetRegionInstitute(RegionID);
                if (result == null || result.Rows.Count == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No institute data found for the given Region ID.", 404));
                }
                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Institute data retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetDistrictIDByDistrictUser")]
        public IActionResult GetDistrictIDByDistrictUser(string UserLoginID)
        {
            try
            {
                var result = _base.GetDistrictIDByDistrictUser(UserLoginID);
                if (result == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("District ID not found for the given User Login ID.", 404));
                }
                return Ok(ApiResponse<int>.SuccessResponse(result, "District ID retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetAdmissionYear")]
        public IActionResult GetAdmissionYear()
        {
            try
            {
                var result = _base.GetAdmissionYear();
                if (result == null || result.Rows.Count == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No admission year data found.", 404));
                }
                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Admission year data retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetInstiuteInfo")]
        public IActionResult GetInstiuteInfo(long InstituteID)
        {
            try
            {
                var result = _base.GetInstiuteInfo(InstituteID);
                if (result == null || result.Rows.Count == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No institute info found for the given Institute ID.", 404));
                }
                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Institute info retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetMasterInstituteForExamCerter")]
        public IActionResult GetMasterInstituteForExamCerter()
        {
            try
            {
                var result = _base.GetMasterInstituteForExamCerter();
                if (result == null || result.Count == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No institute data found for exam centers.", 404));
                }
                return Ok(ApiResponse<List<DropdownEntity>>.SuccessResponse(result, "Exam center institute data retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetStaffStepID")]
        public IActionResult GetStaffStepID(long StaffID)
        {
            try
            {
                var result = _base.GetStaffStepID(StaffID);
                if (result == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No step ID found for the given Staff ID.", 404));
                }
                return Ok(ApiResponse<short>.SuccessResponse(result, "Staff step ID retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("IsStaffFormLocked")]
        public IActionResult IsStaffFormLocked(long StaffID)
        {
            try
            {
                var result = _base.IsStaffFormLocked(StaffID);
                return Ok(ApiResponse<bool>.SuccessResponse(result, "Staff form lock status retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetStaffID")]
        public IActionResult GetStaffID(string ApplicationID)
        {
            try
            {
                var result = _base.GetStaffID(ApplicationID);
                if (result == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("Staff ID not found for the given Application ID.", 404));
                }
                return Ok(ApiResponse<long>.SuccessResponse(result, "Staff ID retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetMasterPromotingType")]
        public IActionResult GetMasterPromotingType()
        {
            try
            {
                var result = _base.GetMasterPromotingType();
                if (result == null || result.Count == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No promoting type data found.", 404));
                }
                return Ok(ApiResponse<List<DropdownEntity>>.SuccessResponse(result, "Promoting type data retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("ISSectorialExpertiseRequired")]
        public IActionResult ISSectorialExpertiseRequired(long StaffID)
        {
            try
            {
                var result = _base.ISSectorialExpertiseRequired(StaffID);
                return Ok(ApiResponse<bool>.SuccessResponse(result, "Sectorial expertise requirement status retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetMasterMainCourseApply")]
        public IActionResult GetMasterMainCourseApply()
        {
            try
            {
                var result = _base.GetMasterMainCourseApply();
                var serializableData = BaseWorker.ConvertDataTableToList(result);
                if (result == null || result.Rows.Count == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No main course data found.", 404));
                }
                return Ok(ApiResponse<object>.SuccessResponse(serializableData, "Master main course data retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }


        [HttpGet]
        [Route("GetExamination")]
        public IActionResult GetExamination(long? examTypeId, long? yearId)
        {
            try
            {
                var result = _base.GetExamination(examTypeId, yearId);

                if (result == null || result.Rows.Count == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No examination data found.", 404));
                }

                return Ok(ApiResponse<object>.SuccessResponse(result, "Examination data retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }
        [HttpGet]
        [Route("GetExaminationByInstitute")]
        public IActionResult GetExamination(long InstituteID)
        {
            try
            {
                var result = _base.GetExamination(InstituteID);
                if (result == null || result.Rows.Count == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No examination data found for the given Institute ID.", 404));
                }
                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Examination data retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetTimeTableSubject")]
        public IActionResult GetTimeTableSubject(int ExaminationID)
        {
            try
            {
                var result = _base.GetTimeTableSubject(ExaminationID);
                var serializableData = BaseWorker.ConvertDataTableToList(result);
                if (result == null || result.Rows.Count == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No timetable subject data found for the given Examination ID.", 404));
                }
                return Ok(ApiResponse<object>.SuccessResponse(serializableData, "Timetable subject data retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("IsEvaluationReportDate")]
        public IActionResult IsEvaluationReportDate(string SubjectType)
        {
            try
            {
                var result = _base.IsEvaluationReportDate(SubjectType);
                return Ok(ApiResponse<bool>.SuccessResponse(result, "Evaluation report date status retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetElectiveSubjects")]
        public IActionResult GetElectiveSubjects()
        {
            try
            {
                var result = _base.GetElectiveSubjectes();
                if (result == null || result.Count == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No elective subjects found.", 404));
                }
                return Ok(ApiResponse<List<DropdownEntity>>.SuccessResponse(result, "Elective subjects retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetCurrentExamination")]
        public IActionResult GetCurrentExamination()
        {
            try
            {
                var result = _base.GetCurrentExamination();
                var serializableData = BaseWorker.ConvertDataTableToList(result);
                if (result == null || result.Rows.Count == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No current examination data found.", 404));
                }
                return Ok(ApiResponse<object>.SuccessResponse(serializableData, "Current examination data retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("IsEstablishmentFormLocked")]
        public IActionResult IsEstablishmentFormLocked(long EstablishmentID)
        {
            try
            {
                var result = _base.IsEstablishmentFormLocked(EstablishmentID);
                return Ok(ApiResponse<bool>.SuccessResponse(result, "Establishment form lock status retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetMasterBTRI")]
        public IActionResult GetMasterBTRI()
        {
            try
            {
                var result = _base.GetMasterBTRI();
                if (result == null || result.Count == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No BTRI master data found.", 404));
                }
                return Ok(ApiResponse<List<DropdownEntity>>.SuccessResponse(result, "BTRI master data retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetMasterBTRIByEstablishment")]
        public IActionResult GetMasterBTRI(long EstablishmentID)
        {
            try
            {
                var result = _base.GetMasterBTRI(EstablishmentID);
                if (result == null || result.Count == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No BTRI master data found for the given Establishment ID.", 404));
                }
                return Ok(ApiResponse<List<DropdownEntity>>.SuccessResponse(result, "BTRI master data retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetTimeTableCourseWise")]
        public IActionResult GetTimeTableCourseWise(long CourseID, int ExaminationID)
        {
            try
            {
                var result = _base.GetTimeTableCourseWise(CourseID, ExaminationID);
                var serializableData = BaseWorker.ConvertDataTableToList(result);
                if (result == null || result.Rows.Count == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No timetable data found for the given Course ID and Examination ID.", 404));
                }
                return Ok(ApiResponse<object>.SuccessResponse(serializableData, "Timetable course-wise data retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetMasterOtherInfraDetails")]
        public IActionResult GetMasterOtherInfraDetails()
        {
            try
            {
                var result = _base.GetMasterOtherInfraDetails();
                if (result == null || result.Count == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No other infrastructure details found.", 404));
                }
                return Ok(ApiResponse<List<OtherInfraEntity>>.SuccessResponse(result, "Other infrastructure details retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("IsEditingAllowed")]
        public IActionResult IsEditingAllowed([FromBody] InstituteInputEntity entity)
        {
            try
            {
                var result = _base.IsEditingAllowed(entity);
                var serializableData = BaseWorker.ConvertDataTableToList(result);
                if (result == null || result.Rows.Count == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("Editing status could not be determined.", 404));
                }
                return Ok(ApiResponse<object>.SuccessResponse(serializableData, "Editing permission status retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetExaminationDetails")]
        public IActionResult GetExaminationDetails(int ExamID)
        {
            try
            {
                var result = _base.GetExaminationDetails(ExamID);
                var serializableData = BaseWorker.ConvertDataTableToList(result);
                if (result == null || result.Rows.Count == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No examination details found for the given Exam ID.", 404));
                }
                return Ok(ApiResponse<object>.SuccessResponse(serializableData, "Examination details retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetCourseSearch")]
        public IActionResult GetCourseSearch(short SectorID, short CourseCategoryID, string CourseType, short EntryQualificationID, int CourseID)
        {
            try
            {
                var result = _base.GetCourseSearch(SectorID, CourseCategoryID, CourseType, EntryQualificationID, CourseID);
                if (result == null || result.Rows.Count == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No course search results found.", 404));
                }
                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Course search results retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetCourseSearchForAdmission")]
        public IActionResult GetCourseSearchForAdmission(short SectorID, short CourseCategoryID, string CourseType, short EntryQualificationID, int CourseID)
        {
            try
            {
                var result = _base.GetCourseSearchForAdmission(SectorID, CourseCategoryID, CourseType, EntryQualificationID, CourseID);
                if (result == null || result.Rows.Count == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No course search results found for admission.", 404));
                }
                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Course search results for admission retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetMasterSubSector")]
        public IActionResult GetMasterSubSector(short SectorID)
        {
            try
            {
                var result = _base.GetMasterSubSector(SectorID);
                if (result == null || result.Count == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No sub-sector data found for the given Sector ID.", 404));
                }
                return Ok(ApiResponse<List<DropdownEntity>>.SuccessResponse(result, "Sub-sector data retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }


        //Master Mapping

        [HttpGet]
        [Route("GetMappingMasterDetails")]
        public IActionResult GetMappingMasterDetails(int mappingId, int parentId)
        {
            try
            {
                var result = _base.GetMappingMasterDetails(mappingId, parentId);
                if (result == null || result.Tables.Count == 0 || result.Tables[0].Rows.Count == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No mapping master details found.", 404));
                }
                return Ok(ApiResponse<DataSet>.SuccessResponse(result, "Mapping master details retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("SetMappingMasterDetails")]
        public IActionResult SetMappingMasterDetails([FromBody] MappingMasterEntity entity)
        {
            try
            {
                var result = _base.SetMappingMasterDetails(entity);
                return Ok(ApiResponse<string>.SuccessResponse(result, "Mapping master details set successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetMasterCourseFilter")]
        public IActionResult GetMasterCourseFilter(short SectorID, short CourseCategoryID, string CourseType, short EntryQualificationID)
        {
            try
            {
                var result = _base.GetMasterCourseFilter(SectorID, CourseCategoryID, CourseType, EntryQualificationID);
                if (result == null || result.Count == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No master course filter data found.", 404));
                }
                return Ok(ApiResponse<List<DropdownEntity>>.SuccessResponse(result, "Master course filter data retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("IsDuplicateCourseCode")]
        public IActionResult IsDuplicateCourseCode(string CourseCode)
        {
            try
            {
                var result = _base.IsDuplicateCourseCode(CourseCode);
                return Ok(ApiResponse<string>.SuccessResponse(result, "Duplicate course code check completed."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }



        [HttpGet]
        [Route("GetApprovedInstituteIDByInstituteCode")]
        public IActionResult GetApprovedInstituteIDByInstituteCode(string InstituteCode)
        {
            try
            {
                if (string.IsNullOrEmpty(InstituteCode))
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "InstituteCode is required"
                    });
                }

                var result = _base.GetApprovedInstituteIDByInstituteCode(InstituteCode);

                if (result <= 0)
                {
                    return Ok(new
                    {
                        success = false,
                        message = "No data found",
                        Data = 0
                    });
                }

                return Ok(new
                {
                    success = true,
                    Data = result
                });
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetApprovedInstituteIDByInstituteCode", InstituteCode);

                return StatusCode(500, new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }


        [HttpGet]
        [Route("CheckExistingInstituteSDIApplicationExists")]
        public IActionResult CheckExistingInstituteSDIApplicationExists(long InstituteID)
        {
            try
            {
                if (InstituteID <= 0)
                {
                    return BadRequest(ApiResponse<object>.ErrorResponse(
                        "Invalid Institute ID.", 400));
                }

                var result = _base.CheckExistingInstituteSDIApplicationExists(InstituteID);

                var serializableData = BaseWorker.ConvertDataTableToList(result);

                // IMPORTANT FIX
                if (result == null || result.Rows.Count == 0)
                {
                    return Ok(ApiResponse<object>.SuccessResponse(
                        new List<object>(),
                        "No existing application found."));
                }

                return Ok(ApiResponse<object>.SuccessResponse(
                    serializableData,
                    "Data retrieved successfully."));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(
                    ex.Message,
                    "CheckExistingInstituteSDIApplicationExists",
                    InstituteID.ToString());

                return StatusCode(500,
                    ApiResponse<object>.ErrorResponse(
                        $"An error occurred: {ex.Message}", 500));
            }
        }





        [HttpGet]
        [Route("IsDuplicateCourseName")]
        public IActionResult IsDuplicateCourseName(string CourseName)
        {
            try
            {
                var result = _base.IsDuplicateCourseName(CourseName);
                return Ok(ApiResponse<string>.SuccessResponse(result, "Duplicate course name check completed."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetMasterTrainingNameofItem")]
        public IActionResult GetMasterTrainingNameofItem()
        {
            try
            {
                var result = _base.GetMasterTrainingNameofItem();
                if (result == null || result.Count == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No training name of item data found.", 404));
                }
                return Ok(ApiResponse<List<DropdownEntity>>.SuccessResponse(result, "Training name of item data retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetApprovalOrder")]
        public IActionResult GetApprovalOrder()
        {
            try
            {
                var result = _base.GetApprovalOrder();
                var serializableData = BaseWorker.ConvertDataTableToList(result);
                if (result == null || result.Rows.Count == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No approval orders found.", 404));
                }
                return Ok(ApiResponse<object>.SuccessResponse(serializableData, "Approval orders retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetApprovalOrderByID")]
        public IActionResult GetApprovalOrderByID(long ID)
        {
            try
            {
                var result = _base.GetApprovalOrderByID(ID);
                return Ok(ApiResponse<ApprovalOrderEntity>.SuccessResponse(result, "Approval order details retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("SaveApprovalOrder")]
        public IActionResult SaveApprovalOrder([FromBody] ApprovalOrderEntity entity)
        {
            try
            {
                var result = _base.SaveApprovalOrder(entity);
                return Ok(ApiResponse<string>.SuccessResponse(result, "Approval order saved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpDelete]
        [Route("DeleteApprovalOrder")]
        public IActionResult DeleteApprovalOrder(long ID, string UserLoginID, string IPAddress)
        {
            try
            {
                var result = _base.DeleteApprovalOrder(ID, UserLoginID, IPAddress);
                return Ok(ApiResponse<string>.SuccessResponse(result, "Approval order deleted successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetMasterInstituteFilter")]
        public IActionResult GetMasterInstituteFilter(int RegionID, int DistrictID, int TalukaID, long ExaminationID=-1)
        {
            try
            {
                var result = _base.GetMasterInstituteFilter(RegionID, DistrictID, TalukaID, ExaminationID);
                return Ok(ApiResponse<List<DropdownEntity>>.SuccessResponse(result, "Master institute filter data retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("IsStaffAadharNoDuplicate")]
        public IActionResult IsStaffAadharNoDuplicate(string AadharNo, long StaffID)
        {
            try
            {
                var result = _base.IsStaffAadharNoDuplicate(AadharNo, StaffID);
                var serializableData = BaseWorker.ConvertDataTableToList(result);
                return Ok(ApiResponse<object>.SuccessResponse(serializableData, "Staff Aadhar number duplication check completed."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetMasterIgnoreWords")]

        public IActionResult GetMasterIgnoreWords()
        {
            try
            {
                var result = _base.GetMasterIgnoreWords();

                return Ok(ApiResponse<object>.SuccessResponse(result, "words data get"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }
        [HttpGet]
        [Route("IsCandidateAadharNoDuplicate")]
        public IActionResult IsCandidateAadharNoDuplicate(string AadharNo, long CandidateID)
        {
            try
            {
                var result = _base.IsCandidateAadharNoDuplicate(AadharNo, CandidateID);
                var serializableData = BaseWorker.ConvertDataTableToList(result);
                return Ok(ApiResponse<object>.SuccessResponse(serializableData, "Candidate Aadhar number duplication check completed."));
            } 
            catch(Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }




        [HttpGet]
        [Route("GetMasterSectorByITISTT")]
        public IActionResult GetMasterSectorByITISTT(short ITISTT)
        {
            try
            {
                var result = _base.GetMasterSectorByITISTT(ITISTT);

                if (result == null || !result.Any())
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No sector data found.", 404));
                }

                return Ok(ApiResponse<List<DropdownEntity>>.SuccessResponse(result, "Sector list retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetSectorwiseCourseType")]
        public IActionResult GetSectorwiseCourseType(int sectorId)
        {
            try
            {
                var result = _base.GetSectorwiseCourseTypes(sectorId);
                if (result == null || !result.Any())
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No CourseType Data found.", 404));
                }
                return Ok(ApiResponse<List<DropdownEntity>>.SuccessResponse(result, "Course Type Data retrieved successfully."));
            }
            catch(Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }




        [HttpGet]
        [Route("GetMasterCourseByITISTT")]
        public IActionResult GetMasterCourseByITISTT(short SectorID, short CourseTypeID, short ITISTT)
        {
            try
            {
                var result = _base.GetMasterCourseByITISTT(SectorID, CourseTypeID, ITISTT);

                if (result == null || !result.Any())
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No courses found.", 404));
                }

                return Ok(ApiResponse<List<DropdownEntity>>.SuccessResponse(result, "Course list retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }


        [HttpGet]
        [Route("GetCourseType")]
        public IActionResult GetCourseType()
        {
            try
            {
                var result = _base.GetCourseType();

                var serializableData = BaseWorker.ConvertDataTableToList(result);

                if (result == null || result.Rows.Count == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No course types found.", 404));
                }

                return Ok(ApiResponse<object>.SuccessResponse(serializableData, "Course type list retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet("GetUserRegionDistrictTaluka")]
        public IActionResult GetUserRegionDistrictTaluka(string userLoginID)
        {
            try
            {
                if (string.IsNullOrEmpty(userLoginID))
                {
                    return BadRequest(ApiResponse<string>.ErrorResponse(
                        "Invalid UserLoginID.", 400));
                }

                DataTable result = _base.GetUserRegionDistrictTaluka(userLoginID);

                if (result == null || result.Rows.Count == 0)
                {
                    return NotFound(ApiResponse<string>.ErrorResponse(
                        "No data found.", 404));
                }

                return Ok(new
                {
                    Status = "Success",
                    StatusCode = 200,
                    Message = "Data retrieved successfully.",
                    Data = result
                });
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetUserRegionDistrictTaluka");

                return StatusCode(500, ApiResponse<string>.ErrorResponse(
                    ex.Message, 500));
            }
        }
        [HttpGet("GetPromotingOrganisationIDByTempInstituteID/{instituteId}")]
        public IActionResult GetPromotingOrganisationID(long instituteId)
        {
            try
            {
                var result = _base.GetPromotingOrganisationIDByTempInstituteID(instituteId);

                return Ok(new
                {
                    Status = true,
                    Data = result
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    Status = false,
                    Message = ex.Message
                });
            }
        }
        [HttpGet]
        [Route("GetPromotingOrganisationIDByInstituteCode/{instituteCode}")]
        public IActionResult GetPromotingOrganisationIDByInstituteCode(string instituteCode)
        {
            try
            {
                if (string.IsNullOrEmpty(instituteCode))
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "InstituteCode is required"
                    });
                }

                var result = _base.GetPromotingOrganisationIDByInstituteCode(instituteCode);

                if (result <= 0)
                {
                    return Ok(new
                    {
                        success = false,
                        message = "No data found",
                        Data = 0
                    });
                }
                return Ok(new
                {
                    success = true,
                    Data = result
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }

        [HttpGet("GetExistingInstituteID/{instituteId}")]
        public IActionResult GetExistingInstituteID(long instituteId)
        {
            try
            {
                if (instituteId <= 0)
                {
                    return BadRequest(new
                    {
                        Status = "Error",
                        Message = "Invalid Institute ID"
                    });
                }

                long existingInstituteId = _base.GetExistingInstituteID(instituteId);

                return Ok(new
                {
                    Status = "Success",
                    StatusCode = 200,
                    Message = "Existing Institute ID fetched successfully",
                    Data = existingInstituteId
                });
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetExistingInstituteID");

                return StatusCode(500, new
                {
                    Status = "Error",
                    StatusCode = 500,
                    Message = "An error occurred while fetching Existing Institute ID",
                    Error = ex.Message
                });
            }
        }

        //stt

        
        [HttpGet]
        [Route("GetCourseSearchForAdmissionSTT")]
        public IActionResult GetCourseSearchForAdmissionSTT(short SectorID, short CourseCategoryID, string CourseType, short EntryQualificationID, int CourseID)
        {
            try
            {
                var result = _base.GetCourseSearchForAdmissionSTT(SectorID, CourseCategoryID, CourseType, EntryQualificationID, CourseID);
                if (result == null || result.Rows.Count == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No course search results found for admission.", 404));
                }
                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Course search results for  stt admission retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }
        [HttpGet]
        [Route("GetCoursesForAdmissionITISTT")]
        public IActionResult GetCoursesForAdmissionITISTT(short SectorID, short CourseCategoryID, string CourseType, short EntryQualificationID, int CourseID)
        {
            try
            {
                var result = _base.GetCoursesForAdmissionITISTT(SectorID, CourseCategoryID, CourseType, EntryQualificationID, CourseID);
                if (result == null || result.Rows.Count == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No course search results found for admission.", 404));
                }
                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Course search results for  stt admission retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        //newly added for the ExamTimeTable page 

        [HttpGet]
        [Route("GetExamTimetableCourses")]
        public IActionResult GetExamTimetableCourses()
        {
            try
            {
                var result = _base.GetExamTimetableCourses();

                if (result == null || result.Rows.Count == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No exam timetable courses found.", 404));
                }

                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Exam timetable courses retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetCourseSearchForExamTimeTable")]
        public IActionResult GetCourseSearchForExamTimeTable([FromQuery] string courseCode, [FromQuery] long examinationId)
        {
            // Basic validation to check if course code and examination id were passed
            if (string.IsNullOrEmpty(courseCode))
            {
                return BadRequest(ApiResponse<object>.ErrorResponse("Course code is required.", 400));
            }

            if (examinationId <= 0)
            {
                return BadRequest(ApiResponse<object>.ErrorResponse("Examination id is required.", 400));
            }

            try
            {
                var result = _base.GetCourseSearchForExamTimeTable(courseCode, examinationId);

                if (result == null || result.Rows.Count == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No details found for the specified course code.", 404));
                }

                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Course timetable details retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetVisitorStatistics")]
        public IActionResult GetVisitorStatistics()
        {
            try
            {
                var result = _base.GetVisitorStatistics();
                var serializableData = BaseWorker.ConvertDataTableToList(result);

                if (result == null || result.Rows.Count == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No visitor statistics found.", 404));
                }

                return Ok(ApiResponse<object>.SuccessResponse(serializableData, "Visitor statistics retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500,
                    ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }




        [HttpGet]
        [Route("GetSecretaryDashboard")]
        public IActionResult GetSecretaryDashboard()
        {
            try
            {
                var result = _base.GetSecretaryDashboard();

                if (result == null )
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No regions found.", 404));
                }

                return Ok(ApiResponse<object>.SuccessResponse(result, "Master region list retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetInspectionCommitteeByApplicantDate")]
        public IActionResult GetInspectionCommitteeByApplicantDate([FromQuery] string applicantDate)
        {
            // 1. Basic validation
            if (string.IsNullOrEmpty(applicantDate))
            {
                return BadRequest(ApiResponse<object>.ErrorResponse("Date is required.", 400));
            }

            try
            {
                
                DateTime parsedDate;
                bool isValidDate = DateTime.TryParseExact(applicantDate, "dd/MM/yyyy",
                                    System.Globalization.CultureInfo.InvariantCulture,
                                    System.Globalization.DateTimeStyles.None, out parsedDate);

                if (!isValidDate)
                {
                    return BadRequest(ApiResponse<object>.ErrorResponse("Invalid date format. Please use DD/MM/YYYY.", 400));
                }

                // 3. Call the base layer with the converted DateTime
                var result = _base.GetInspectionCommitteeByApplicantDate(parsedDate);

                if (result == null || result.Rows.Count == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No details found for the specified date.", 404));
                }

                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Details retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }
       
        [HttpGet]
        [Route("GetMasterCourses")]
        public ActionResult<ApiResponse<DataTable>> GetMasterCourse(int CourseID, string CourseCode, int PageNumber, int PageSize
    )
        {
            //if (entity == null)
            //{
            //    return BadRequest(
            //        ApiResponse<DataTable>.ErrorResponse(
            //            "Master course request cannot be null.",
            //            400));
            //}

            try
            {
                var result =
                    _base.GetMasterCourseData( CourseID,  CourseCode,  PageNumber,  PageSize);

                if (result == null || result.Rows.Count == 0)
                {
                    return Ok(
                        ApiResponse<DataTable>.SuccessResponse(
                            result,
                            "No course data found.",
                            200));
                }

                return Ok(
                    ApiResponse<DataTable>.SuccessResponse(
                        result,
                        "Master course data retrieved successfully.",
                        200));
            }
            catch (Exception ex)
            {
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    ApiResponse<DataTable>.ErrorResponse(
                        $"Internal server error: {ex.Message}",
                        500));
            }
        }
    //    [HttpPost]
    //    [Route("SaveMasterCourse")]
    //    public ActionResult<ApiResponse<string>> SaveMasterCourse(
    //[FromBody] MasterCourseEntity entity)
    //    {
    //        if (entity == null)
    //        {
    //            return BadRequest(
    //                ApiResponse<string>.ErrorResponse(
    //                    "Master course entity cannot be null.",
    //                    400));
    //        }

    //        if (string.IsNullOrWhiteSpace(entity.CourseCode))
    //        {
    //            return BadRequest(
    //                ApiResponse<string>.ErrorResponse(
    //                    "Course code is required.",
    //                    400));
    //        }

    //        if (string.IsNullOrWhiteSpace(entity.CourseName))
    //        {
    //            return BadRequest(
    //                ApiResponse<string>.ErrorResponse(
    //                    "Course name is required.",
    //                    400));
    //        }

    //        try
    //        {
    //            var result =
    //                _base.SaveMasterCourse(entity);

    //            if (string.IsNullOrWhiteSpace(result) ||
    //                result.ToUpper() != "Y")
    //            {
    //                return BadRequest(
    //                    ApiResponse<string>.ErrorResponse(
    //                        "Failed to save master course.",
    //                        400));
    //            }

    //            return Ok(
    //                ApiResponse<string>.SuccessResponse(
    //                    result,
    //                    entity.CourseID > 0
    //                        ? "Master course updated successfully."
    //                        : "Master course saved successfully.",
    //                    200));
    //        }
    //        catch (Exception ex)
    //        {
    //            return StatusCode(
    //                StatusCodes.Status500InternalServerError,
    //                ApiResponse<string>.ErrorResponse(
    //                    $"Internal server error: {ex.Message}",
    //                    500));
    //        }
    //    }
    }
}
