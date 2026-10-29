using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.CodeAnalysis.VisualBasic.Syntax;
using Microsoft.Exchange.WebServices.Data;
using Portal.Business.Interface.Base;
using Portal.Business.Interface.ExistingInstitute;
using Portal.Business.Interface.Fee;
using Portal.Business.Interface.Institute;
using Portal.Business.Worker.Base;
using Portal.Business.Worker.Institute;
using Portal.Business.Worker.Utility;
using Portal.Entities.Base;
using Portal.Entities.ElectionDuty;
using Portal.Entities.Institute;
using Portal.Entities.ITISpecification;
using Portal.Entities.ResponseBody;
using Razorpay.Api;
using System.Data;
using System.Drawing;
using System.Text.Json;
using System.Xml;
using System.Xml.Serialization;
using ZXing;
using static Portal.Entities.Institute.ProposedCourseUnitDetailsEntity;

namespace Portal.Server.Controllers.Institute
{
    [Route("api/[controller]")]
    [ApiController]

    public class InstituteBaseController : ControllerBase
    {
        private readonly IInstituteBase _IInstituteBase;
        private readonly IFee _feeService;
        public InstituteBaseController(IInstituteBase iInstituteBase, IFee feeService)
        {
            _IInstituteBase = iInstituteBase ?? throw new ArgumentNullException(nameof(iInstituteBase));
            _feeService = feeService ?? throw new ArgumentNullException(nameof(feeService));
        }


        [HttpPost("SearchInstitute")]
        public IActionResult SearchInstitute([FromBody] InstituteSearchCriteriaEntity criteria)
        {
            try
            {
                if (criteria == null)
                    return BadRequest(new { Status = "Error", Message = "Search criteria is missing." });

                List<InstituteListEntity> result = _IInstituteBase.SearchInstitute(criteria);

                return Ok(new
                {
                    Status = "Success",
                    StatusCode = 200,
                    Message = "Institutes retrieved successfully.",
                    Data = result
                });
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SearchInstitute");
                return StatusCode(500, new
                {
                    Status = "Error",
                    StatusCode = 500,
                    Message = "An error occurred while searching for institutes.",
                    Error = ex.Message
                });
            }
        }
        [AllowAnonymous]
        [HttpPost("SearchInstitutePublic")]
        public IActionResult SearchInstitutePublic([FromBody] InstituteSearchCriteriaEntity criteria)
        {
            try
            {
                if (criteria == null)
                    return BadRequest(new { Status = "Error", Message = "Search criteria is missing." });
                List<InstituteListEntity> result = _IInstituteBase.SearchInstitutePublic(criteria);
                return Ok(new
                {
                    Status = "Success",
                    StatusCode = 200,
                    Message = "Institutes retrieved successfully.",
                    Data = result
                });
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SearchInstitutePublic");
                return StatusCode(500, new
                {
                    Status = "Error",
                    StatusCode = 500,
                    Message = "An error occurred while searching for institutes.",
                    Error = ex.Message
                });
            }




        }

        [HttpPost("SearchCourseDetails")]
        public IActionResult SearchCourseDetails([FromBody] InstituteSearchCriteriaEntity criteria)
        {
            try
            {
                if (criteria == null)
                    return BadRequest(new { Status = "Error", Message = "Search criteria is missing." });
                List<CourseInfoEntity> result = _IInstituteBase.SearchCourseDetails(criteria);
                return Ok(new
                {
                    Status = "Success",
                    StatusCode = 200,
                    Message = "Courses retrieved successfully.",
                    Data = result
                });
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SearchCourseDetails");
                return StatusCode(500, new
                {
                    Status = "Error",
                    StatusCode = 500,
                    Message = "An error occurred while searching for courses.",
                    Error = ex.Message
                });
            }
        }
        [AllowAnonymous]
        [HttpGet("GetInstituteDetails/{instituteId}/{courseId}")]
        public IActionResult GetInstituteDetails(long instituteId, long courseId)
        {
            try
            {
                //if (instituteId <= 0 || courseId <= 0)
                //    return BadRequest(new { Status = "Error", Message = "Invalid institute or course ID." });
                InstituteInfoEntity result = _IInstituteBase.GetInstituteDetails(instituteId, courseId);
                if (result == null)
                    return NotFound(new { Status = "Error", Message = "Institute details not found." });
                return Ok(new
                {
                    Status = "Success",
                    StatusCode = 200,
                    Message = "Institute details retrieved successfully.",
                    Data = result
                });
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetInstituteDetails");
                return StatusCode(500, new
                {
                    Status = "Error",
                    StatusCode = 500,
                    Message = "An error occurred while retrieving institute details.",
                    Error = ex.Message
                });
            }

        }
        [AllowAnonymous]
        [HttpGet("GetCourseDetails/{courseId}")]
        public IActionResult GetCourseDetails(long courseId)
        {
            try
            {
                if (courseId <= 0)
                    return BadRequest(new { Status = "Error", Message = "Invalid course ID." });
                CourseInfoEntity result = _IInstituteBase.GetCourseDetails(courseId);
                if (result == null)
                    return NotFound(new { Status = "Error", Message = "Course details not found." });
                return Ok(new
                {
                    Status = "Success",
                    StatusCode = 200,
                    Message = "Course details retrieved successfully.",
                    Data = result
                });
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetCourseDetails");
                return StatusCode(500, new
                {
                    Status = "Error",
                    StatusCode = 500,
                    Message = "An error occurred while retrieving course details.",
                    Error = ex.Message
                });
            }
        }

        [HttpGet("GetSuccessStoryResult/{candidateId}/{instituteId}")]
        public IActionResult GetSuccessStoryResult(long candidateId, long instituteId)
        {
            try
            {
                if (candidateId <= 0 || instituteId <= 0)
                    return BadRequest(new { Status = "Error", Message = "Invalid candidate or institute ID." });

                DataTable result = _IInstituteBase.GetSuccessStoryResult(candidateId, instituteId);

                if (result == null || result.Rows.Count == 0)
                    return NotFound(new { Status = "Error", Message = "Success story result not found." });

                return Ok(new
                {
                    Status = "Success",
                    StatusCode = 200,
                    Message = "Success story result retrieved successfully.",
                    Data = result
                });
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetSuccessStoryResult");
                return StatusCode(500, new
                {
                    Status = "Error",
                    StatusCode = 500,
                    Message = "An error occurred while retrieving success story result.",
                    Error = ex.Message
                });
            }
        }

        [HttpPost("SaveSuccessStory")]
        public IActionResult SaveSuccessStory([FromBody] SucessStoryEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(new { Status = "Error", Message = "Success story data is missing." });

                string result = _IInstituteBase.SaveSuccessStory(entity);

                return Ok(new
                {
                    Status = "Success",
                    StatusCode = 200,
                    Message = "Success story saved successfully.",
                    Data = result
                });
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveSuccessStory");
                return StatusCode(500, new
                {
                    Status = "Error",
                    StatusCode = 500,
                    Message = "An error occurred while saving success story.",
                    Error = ex.Message
                });
            }
        }

        [HttpDelete("DeleteSuccessStory/{id}")]
        public IActionResult DeleteSuccessStory(long id, [FromQuery] string userLoginId, [FromQuery] string ipAddress)
        {
            try
            {
                if (id <= 0)
                    return BadRequest(new { Status = "Error", Message = "Invalid success story ID." });

                if (string.IsNullOrEmpty(userLoginId) || string.IsNullOrEmpty(ipAddress))
                    return BadRequest(new { Status = "Error", Message = "User login ID and IP address are required." });

                string result = _IInstituteBase.DeleteSuccessStoryByID(id, userLoginId, ipAddress);

                return Ok(new
                {
                    Status = "Success",
                    StatusCode = 200,
                    Message = "Success story deleted successfully.",
                    Data = result
                });
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "DeleteSuccessStory");
                return StatusCode(500, new
                {
                    Status = "Error",
                    StatusCode = 500,
                    Message = "An error occurred while deleting success story.",
                    Error = ex.Message
                });
            }
        }

        [HttpGet("GetSuccessStoryById/{id}")]
        public IActionResult GetSuccessStoryById(long id)
        {
            try
            {
                if (id <= 0)
                    return BadRequest(new { Status = "Error", Message = "Invalid success story ID." });

                SucessStoryEntity result = _IInstituteBase.GetSuccessStoryByID(id);

                if (result == null)
                    return NotFound(new { Status = "Error", Message = "Success story not found." });

                return Ok(new
                {
                    Status = "Success",
                    StatusCode = 200,
                    Message = "Success story retrieved successfully.",
                    Data = result
                });
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetSuccessStoryById");
                return StatusCode(500, new
                {
                    Status = "Error",
                    StatusCode = 500,
                    Message = "An error occurred while retrieving success story.",
                    Error = ex.Message
                });
            }
        }

        [HttpGet("GetSuccessStoryByInstituteID/{instituteId}")]
        public IActionResult GetSuccessStoryByInstituteID(long instituteId)
        {
            try
            {
                if (instituteId <= 0)
                {
                    return BadRequest(new
                    {
                        Status = "Error",
                        StatusCode = 400,
                        Message = "Invalid Institute ID."
                    });
                }

                var result = _IInstituteBase.GetSuccessStoryByInstituteID(instituteId);

                return Ok(new
                {
                    Status = "Success",
                    StatusCode = 200,
                    Message = "Success Story List retrieved successfully.",
                    Data = result
                });
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetSuccessStoryByInstituteID");

                return StatusCode(500, new
                {
                    Status = "Error",
                    StatusCode = 500,
                    Message = "An error occurred while retrieving Success Story List.",
                    Error = ex.Message
                });
            }
        }

        [AllowAnonymous]
        [HttpGet("GetPublishedSuccessStories")]
        public IActionResult GetPublishedSuccessStories()
        {
            try
            {
                List<SucessStoryEntity> result = _IInstituteBase.GetPublishedSuccessStory();

                return Ok(new
                {
                    Status = "Success",
                    StatusCode = 200,
                    Message = "Published success stories retrieved successfully.",
                    Data = result
                });
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetPublishedSuccessStories");
                return StatusCode(500, new
                {
                    Status = "Error",
                    StatusCode = 500,
                    Message = "An error occurred while retrieving published success stories.",
                    Error = ex.Message
                });
            }
        }

        [HttpGet("GetAllSuccessStories")]
        public IActionResult GetAllSuccessStories()
        {
            try
            {
                List<SucessStoryEntity> result = _IInstituteBase.GetAllSuccessStory();

                return Ok(new
                {
                    Status = "Success",
                    StatusCode = 200,
                    Message = "All success stories retrieved successfully.",
                    Data = result
                });
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetAllSuccessStories");
                return StatusCode(500, new
                {
                    Status = "Error",
                    StatusCode = 500,
                    Message = "An error occurred while retrieving all success stories.",
                    Error = ex.Message
                });
            }
        }

        [HttpGet("SearchSuccessStories")]
        public IActionResult SearchSuccessStories(
            [FromQuery] int? districtId = null,
            [FromQuery] int? sectorId = null,
            [FromQuery] long? instituteId = null,
            [FromQuery] long? courseId = null,
            [FromQuery] short? publishStatus = null)
        {
            try
            {
                List<SucessStoryEntity> result = _IInstituteBase.SearchSuccessStory(
                    districtId ?? 0,
                    sectorId ?? 0,
                    instituteId ?? 0,
                    courseId ?? 0,
                    publishStatus ?? 0);

                return Ok(new
                {
                    Status = "Success",
                    StatusCode = 200,
                    Message = "Success stories search completed successfully.",
                    Data = result
                });
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SearchSuccessStories");
                return StatusCode(500, new
                {
                    Status = "Error",
                    StatusCode = 500,
                    Message = "An error occurred while searching success stories.",
                    Error = ex.Message
                });
            }
        }

        [HttpGet]
        [Route("GetDPDCDetailsByCollegeRegNo")]
        public IActionResult GetDPDCDetailsByCollegeRegNo(string CollegeRegistrationNo)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(CollegeRegistrationNo))
                {
                    return BadRequest(ApiResponse<object>.ErrorResponse("College Registration Number is required.", 400));
                }

                var result = _IInstituteBase.GetDPDCDetailsByCollegeRegNo(CollegeRegistrationNo);
                var serializableData = BaseWorker.ConvertDataTableToList(result);

                if (result == null || result.Rows.Count == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No DPDC details found for the given College Registration Number.", 404));
                }

                return Ok(ApiResponse<object>.SuccessResponse(serializableData, "DPDC details retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }


        [HttpPost]
        [Route("SaveDPDCFund")]
        public IActionResult SaveDPDCFundData([FromBody] DPDCFundEntity entity)
        {
            try
            {
                if (entity == null)
                {
                    return BadRequest(ApiResponse<object>.ErrorResponse("Invalid DPDC Fund data.", 400));
                }

                // Validation
                if (string.IsNullOrWhiteSpace(entity.CollegeRegistrationNo))
                {
                    return BadRequest(ApiResponse<object>.ErrorResponse("College Registration Number is required.", 400));
                }

                if (entity.FinancialYearID <= 0)
                {
                    return BadRequest(ApiResponse<object>.ErrorResponse("Financial Year ID is required.", 400));
                }

                if (entity.Allotted_2203_Institute < 0 || entity.Allotted_2230_Institute < 0)
                {
                    return BadRequest(ApiResponse<object>.ErrorResponse("Allotted amounts cannot be negative.", 400));
                }

                var result = _IInstituteBase.SaveDPDCFundData(entity);

                if (result.Contains("Error") || result.Contains("not been saved") || result.Contains("exceeds"))
                {
                    return BadRequest(ApiResponse<object>.ErrorResponse(result, 400));
                }

                return Ok(ApiResponse<string>.SuccessResponse(result, "DPDC Fund data saved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetInstituteManagementDetails")]
        public IActionResult GetInstituteManagementDetails([FromQuery] long instituteID)
        {
            try
            {
                var result = _IInstituteBase.GetInstituteManagementDetails(instituteID);
                if (result != null && result.Count > 0)
                {
                    return Ok(ApiResponse<List<InstituteManagementDetailsEntity>>.SuccessResponse(result, "Institute management details retrieved successfully."));
                }
                else
                {
                    return Ok(ApiResponse<List<InstituteManagementDetailsEntity>>.SuccessResponse(new List<InstituteManagementDetailsEntity>(), "No management details found."));
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("SaveInstituteManagementDetails")]
        public IActionResult SaveInstituteManagementDetails([FromBody] InstituteManagementDetailsEntity entity)
        {
            try
            {
                var result = _IInstituteBase.SaveInstituteManagementDetails(entity);
                   if(result != "Data saved successfully.")
                    return   Ok(ApiResponse<object>.ErrorResponse(result, 404));
                return Ok(ApiResponse<string>.SuccessResponse(result, "Management details saved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("DeleteInstituteManagementDetails")]
        public IActionResult DeleteInstituteManagementDetails([FromBody] InstituteManagementDetailsEntity entity)
        {
            try
            {
                var result = _IInstituteBase.DeleteInstituteManagementDetails(entity);
                if (result != "Data saved successfully.")
                    return Ok(ApiResponse<object>.ErrorResponse(result, 404));
                return Ok(ApiResponse<string>.SuccessResponse(result, "Management details saved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        //Builiding 
        [HttpGet]
        [Route("GetBuildingDetails")]

        public ActionResult<ApiResponse<List<BuildingDetailsEntity>>> GetBuildingDetails(long InstituteID, long BuildingId = 0)
        {
            if (InstituteID <= 0)
            {
                return BadRequest(ApiResponse<List<BuildingDetailsEntity>>.ErrorResponse("Institute ID must be greater than zero.", 400));
            }

            try
            {
                var result = _IInstituteBase.GetBuildingDetails(InstituteID, BuildingId);

                if (result == null || result.Count == 0)
                {
                    return Ok(ApiResponse<List<BuildingDetailsEntity>>.ErrorResponse("No building details found.", 200));
                }

                return Ok(ApiResponse<List<BuildingDetailsEntity>>.SuccessResponse(result, "Building details retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<List<BuildingDetailsEntity>>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }


        [HttpPost]
        [Route("SaveBuildingDetails")]

        public ActionResult<ApiResponse<string>> SaveBuildingDetails([FromBody] BuildingDetailsEntity entity)
        {
            if (entity == null)
            {
                return BadRequest(ApiResponse<string>.ErrorResponse("Building details entity cannot be null.", 400));
            }

            try
            {
                var result = _IInstituteBase.SaveBuildingDetails(entity);

                if (result.ToUpper() == "N")
                {
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to save building details. Please try again.", 400));
                }
                if (result.Equals("Duplicate Building Details", StringComparison.OrdinalIgnoreCase))
                {
                    return BadRequest(ApiResponse<string>.ErrorResponse(
                        result, 403)); // Forbidden
                }
                if (result == null)
                {
                    return NotFound(ApiResponse<string>.ErrorResponse("No data found.", 404));
                }
                if (result.Equals("Editing is not allowed", StringComparison.OrdinalIgnoreCase))
                {
                    return BadRequest(ApiResponse<string>.ErrorResponse(
                        result)); // Forbidden
                }
                



                return Ok(ApiResponse<string>.SuccessResponse("Building details saved successfully.", result, 200));
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }


        [HttpPost]
        [Route("DeleteBuildingDetails")]

        public ActionResult<ApiResponse<string>> DeleteBuildingDetails(long InstituteID, long BuildingId, string UserLoginID, string IPAddress)
        {
            if (InstituteID <= 0 || BuildingId <= 0)
            {
                return BadRequest(ApiResponse<string>.ErrorResponse("Institute ID and Building ID must be greater than zero.", 400));
            }

            if (string.IsNullOrWhiteSpace(UserLoginID))
            {
                return BadRequest(ApiResponse<string>.ErrorResponse("User Login ID cannot be empty.", 400));
            }


            try
            {
                var result = _IInstituteBase.DeleteBuildingDetails(InstituteID, BuildingId, UserLoginID, IPAddress);

                if (result.ToUpper() == "N")
                {
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to delete building details. Please try again.", 400));
                }
                if (result == null)
                {
                    return NotFound(ApiResponse<string>.ErrorResponse("No data found.", 404));
                }
                if (result.Equals("Delete is not allowed", StringComparison.OrdinalIgnoreCase))
                {
                    return BadRequest(ApiResponse<string>.ErrorResponse(
                        result, 403)); // Forbidden
                }

                return Ok(ApiResponse<string>.SuccessResponse("Building details deleted successfully.", "Building details deleted successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }


        [HttpGet]
        [Route("GetBuildingSpaceasperNorms")]

        public ActionResult<ApiResponse<List<BuildingSpaceNormsEntity>>> GetBuildingSpaceasperNorms(long InstituteID)
        {
            if (InstituteID <= 0)
            {
                return BadRequest(
                    ApiResponse<List<BuildingSpaceNormsEntity>>
                    .ErrorResponse("Institute ID must be greater than zero.", 400));
            }

            try
            {
                var result = _IInstituteBase.GetBuildingSpaceasperNorms(InstituteID);

                if (result == null || result.Count == 0)
                {
                    return NotFound(
                        ApiResponse<List<BuildingSpaceNormsEntity>>
                        .ErrorResponse("No building space data found as per norms.", 404));
                }

                return Ok(
                    ApiResponse<List<BuildingSpaceNormsEntity>>
                    .SuccessResponse(result, "Building space data retrieved successfully as per norms.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    ApiResponse<List<BuildingSpaceNormsEntity>>
                    .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }


        [HttpGet]
        [Route("GetBuildingSpaceasperNormsAnalysis")]
        public ActionResult<ApiResponse<List<BuildingSpaceAnalysisEntity>>> GetBuildingSpaceasperNormsAnalysis(long InstituteID)
        {
            if (InstituteID <= 0)
            {
                return BadRequest(
                    ApiResponse<List<BuildingSpaceAnalysisEntity>>
                    .ErrorResponse("Institute ID must be greater than zero.", 400));
            }

            try
            {
                var result = _IInstituteBase.GetBuildingSpaceasperNormsAnalysis(InstituteID);

                if (result == null || result.Count == 0)
                {
                    return NotFound(
                        ApiResponse<List<BuildingSpaceAnalysisEntity>>
                        .ErrorResponse("No building space analysis data found as per norms.", 404));
                }

                return Ok(
                    ApiResponse<List<BuildingSpaceAnalysisEntity>>
                    .SuccessResponse(result, "Building space analysis data retrieved successfully as per norms.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    ApiResponse<List<BuildingSpaceAnalysisEntity>>
                    .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        // Land
        [HttpGet]
        [Route("GetLandDetails")]
        public ActionResult<ApiResponse<List<LandDetailsEntity>>> GetLandDetails(long InstituteID)
        {
            if (InstituteID <= 0)
            {
                return BadRequest(ApiResponse<List<LandDetailsEntity>>.ErrorResponse("Institute ID must be greater than zero.", 400));
            }
            try
            {
                var result = _IInstituteBase.GetLandDetails(InstituteID);
                if (result == null || result.Count == 0)
                {
                    return NotFound(ApiResponse<List<LandDetailsEntity>>.ErrorResponse("No land details found.", 404));
                }
                return Ok(ApiResponse<List<LandDetailsEntity>>.SuccessResponse(result, "Land details retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<List<LandDetailsEntity>>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetRequiredLandDetails")]
        public ActionResult<ApiResponse<List<RequiredLandDetailsEntity>>> GetRequiredLandDetails(long InstituteID, string userLoginId)
        {
            if (InstituteID <= 0)
            {
                return BadRequest(ApiResponse<List<RequiredLandDetailsEntity>>.ErrorResponse("Institute ID must be greater than zero.", 400));
            }
            try
            {
                var result = _IInstituteBase.GetRequiredLandDetails(InstituteID, userLoginId);
                if (result == null || result.Count == 0)
                {
                    return NotFound(ApiResponse<List<RequiredLandDetailsEntity>>.ErrorResponse("No required land details found.", 404));
                }
                return Ok(ApiResponse<List<RequiredLandDetailsEntity>>.SuccessResponse(result, "Required land details retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<List<RequiredLandDetailsEntity>>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }
        [HttpPost]
        [Route("SaveLandDetails")]
        public ActionResult<ApiResponse<string>> SaveLandDetails([FromBody] LandDetailsEntity entity)
        {
            if (entity == null)
            {
                return BadRequest(ApiResponse<string>.ErrorResponse("Land details entity cannot be null.", 400));
            }
            try
            {
                var result = _IInstituteBase.SaveLandDetails(entity);
                if (result.Equals("Editing is not allowed", StringComparison.OrdinalIgnoreCase))
                {
                    return BadRequest(ApiResponse<string>.ErrorResponse(
                        result, 403)); // Forbidden
                }

                
                if (result.ToUpper() == "Y")
                {
                    return Ok(ApiResponse<string>.SuccessResponse("Land details saved successfully.", "Land details saved successfully.", 200));

                }
                return BadRequest(ApiResponse<string>.ErrorResponse("Failed to save land details. Please try again.", 400));

            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }
        [HttpPost]
        [Route("DeleteLandDetails")]
        public ActionResult<ApiResponse<string>> DeleteLandDetails(long InstituteID, long LandId, string UserLoginID, string IPAddress)
        {
            if (InstituteID <= 0 || LandId <= 0)
            {
                return BadRequest(ApiResponse<string>.ErrorResponse("Institute ID and Land ID must be greater than zero.", 400));
            }
            if (string.IsNullOrWhiteSpace(UserLoginID))
            {
                return BadRequest(ApiResponse<string>.ErrorResponse("User Login ID cannot be empty.", 400));
            }
            try
            {
                var result = _IInstituteBase.DeleteLandDetails(InstituteID, LandId, UserLoginID, IPAddress);
                if (result.ToUpper() == "N")
                {
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to delete land details. Please try again.", 400));
                }
                return Ok(ApiResponse<string>.SuccessResponse("Land details deleted successfully.", "Land details deleted successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        // LoI

        [HttpPost]
        [Route("SaveLOIStatus")]
        public ActionResult<ApiResponse<string>> SaveLOIStatus([FromBody] SaveLOIStatus entity)
        {
            if (entity == null)
            {
                return BadRequest(ApiResponse<string>.ErrorResponse("Institute input entity cannot be null.", 400));
            }

            try
            {
                var result = _IInstituteBase.SaveLOIStatus(entity);

                if (result.ToUpper() == "N" || result.Contains("Data has not been saved"))
                {
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to save LOI status. Please try again.", 400));
                }

                return Ok(ApiResponse<string>.SuccessResponse("LOI status saved successfully.", result, 200));
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }


        [HttpPost]
        [Route("CheckLOIGenerated")]
        public ActionResult<ApiResponse<bool>> IsLOIGenerated([FromBody] InstituteInputEntity entity)
        {
            if (entity == null)
            {
                return BadRequest(ApiResponse<bool>.ErrorResponse("Institute input entity cannot be null.", 400));
            }

            try
            {
                var result = _IInstituteBase.IsLOIGenerated(entity);

                string message = result ? "LOI has been generated." : "LOI has not been generated.";

                return Ok(ApiResponse<bool>.SuccessResponse(result, message, 200));
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<bool>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }
        [HttpGet]
        [Route("GetBuildingCourse")]

        public ActionResult<ApiResponse<DataTable>> GetBuildingCourse(long InstituteID)
        {
            if (InstituteID <= 0)
            {
                return BadRequest(ApiResponse<DataTable>.ErrorResponse("Institute ID must be greater than zero.", 400));
            }

            try
            {
                var result = _IInstituteBase.GetBuildingCourse(InstituteID);

                if (result == null || result.Rows.Count == 0)
                {
                    return NotFound(ApiResponse<DataTable>.ErrorResponse("No building course data found.", 404));
                }

                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Building course data retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<DataTable>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }


        [HttpGet]
        [Route("GetAgricultureOpenGroudCourse")]
        public ActionResult<ApiResponse<DataTable>> GetAgricultureOpenGroudCourse(long InstituteID)
        {
            if (InstituteID <= 0)
            {
                return BadRequest(ApiResponse<DataTable>.ErrorResponse("Institute ID must be greater than zero.", 400));
            }

            try
            {
                var result = _IInstituteBase.GetAgricultureOpenGroudCourse(InstituteID);

                if (result == null || result.Rows.Count == 0)
                {
                    return NotFound(ApiResponse<DataTable>.ErrorResponse("No agriculture open ground course data found.", 404));
                }

                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Agriculture open ground course data retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<DataTable>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }
        // proposed course details

        [HttpGet]
        [Route("GetProposedCourseUnitRequirementDetails")]
        public ActionResult<ApiResponse<List<ProposedCourseUnitDetailsEntity>>> GetProposedCourseUnitRequirementDetails(
        long InstituteID, long CourseId, string UserLoginID)
        {
            if (InstituteID <= 0)
            {
                return BadRequest(ApiResponse<List<ProposedCourseUnitDetailsEntity>>.ErrorResponse(
                    "Institute ID must be greater than zero.", 400));
            }

            if (CourseId <= 0)
            {
                return BadRequest(ApiResponse<List<ProposedCourseUnitDetailsEntity>>.ErrorResponse(
                    "Course ID must be greater than zero.", 400));
            }

            if (string.IsNullOrWhiteSpace(UserLoginID))
            {
                return BadRequest(ApiResponse<List<ProposedCourseUnitDetailsEntity>>.ErrorResponse(
                    "User Login ID cannot be empty.", 400));
            }

            try
            {
                var result = _IInstituteBase.GetProposedCourseUnitRequirementDetails(InstituteID, CourseId, UserLoginID);

                if (result == null || result.Count == 0)
                {
                    return NotFound(ApiResponse<List<ProposedCourseUnitDetailsEntity>>.ErrorResponse(
                        "No requirement details found.", 404));
                }

                return Ok(ApiResponse<List<ProposedCourseUnitDetailsEntity>>.SuccessResponse(
                    result, "Requirement details retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<List<ProposedCourseUnitDetailsEntity>>.ErrorResponse(
                        $"Internal server error: {ex.Message}", 500));
            }
        }


        [HttpPost]
        [Route("GetCourseUnitDetailsForApprovalByCoureseID")]
        public ActionResult<ApiResponse<DataSet>> GetCourseUnitDetailsForApprovalByCoureseID(
            [FromBody] InstituteInputEntity entity)
        {
            if (entity == null)
            {
                return BadRequest(ApiResponse<DataSet>.ErrorResponse(
                    "Institute input entity cannot be null.", 400));
            }

            try
            {
                var result = _IInstituteBase.GetCourseUnitDetailsForApprovalByCoureseID(entity);

                if (result == null || result.Tables.Count == 0 || result.Tables[0].Rows.Count == 0)
                {
                    return NotFound(ApiResponse<DataSet>.ErrorResponse(
                        "No course unit details found for approval.", 404));
                }

                return Ok(ApiResponse<DataSet>.SuccessResponse(
                   result, "Course unit details for approval retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<DataSet>.ErrorResponse(
                        $"Internal server error: {ex.Message}", 500));
            }
        }


        //[HttpPost]
        //[Route("short-term/approval-details")]
        //public ActionResult<ApiResponse<DataSet>> GetShortTermCourseUnitDetailsForApprovalByCoureseID(
        //    [FromBody] InstituteInputEntity entity)
        //{
        //    if (entity == null)
        //    {
        //        return BadRequest(ApiResponse<DataSet>.ErrorResponse(
        //            "Institute input entity cannot be null.", 400));
        //    }

        //    try
        //    {
        //        var result = _IInstituteBase.GetShortTermCourseUnitDetailsForApprovalByCoureseID(entity);

        //        if (result == null || result.Tables.Count == 0 || result.Tables[0].Rows.Count == 0)
        //        {
        //            return NotFound(ApiResponse<DataSet>.ErrorResponse(
        //                "No short term course unit details found for approval.", 404));
        //        }

        //        return Ok(ApiResponse<DataSet>.SuccessResponse(
        //            "Short term course unit details for approval retrieved successfully.", result, 200));
        //    }
        //    catch (Exception ex)
        //    {
        //        return StatusCode(StatusCodes.Status500InternalServerError,
        //            ApiResponse<DataSet>.ErrorResponse(
        //                $"Internal server error: {ex.Message}", 500));
        //    }
        //}


        [HttpPost]
        [Route("GetProposedCourseUnitDetails")]
        public ActionResult<ApiResponse<DataSet>> GetProposedCourseUnitDetails(
            [FromBody] InstituteInputEntity entity)
        {
            if (entity == null)
            {
                return BadRequest(ApiResponse<DataSet>.ErrorResponse(
                    "Institute input entity cannot be null.", 400));
            }

            try
            {
                var result = _IInstituteBase.GetProposedCourseUnitDetails(entity);

                //if (result == null || result.Tables.Count == 0 || result.Tables[0].Rows.Count == 0)
                //{
                //    return NotFound(ApiResponse<DataSet>.ErrorResponse(
                //        "No proposed course unit details found.", 404));
                //}
                if (result == null || result.Tables.Count == 0 || result.Tables[0].Rows.Count == 0)
                {
                    return Ok(ApiResponse<DataSet>.SuccessResponse(
                        null, "No proposed course unit details found.", 200));
                }

                return Ok(ApiResponse<DataSet>.SuccessResponse(
                   result, "Proposed course unit details retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<DataSet>.ErrorResponse(
                        $"Internal server error: {ex.Message}", 500));
            }
        }

        /// <summary>
        /// Get Short Term Proposed Course Unit Details
        /// </summary>
        //[HttpPost]
        //[Route("short-term/proposed-details")]
        //public ActionResult<ApiResponse<DataSet>> GetShortTermProposedCourseUnitDetails(
        //    [FromBody] InstituteInputEntity entity)
        //{
        //    if (entity == null)
        //    {
        //        return BadRequest(ApiResponse<DataSet>.ErrorResponse(
        //            "Institute input entity cannot be null.", 400));
        //    }

        //    try
        //    {
        //        var result = _IInstituteBase.GetShortTermProposedCourseUnitDetails(entity);

        //        if (result == null || result.Tables.Count == 0 || result.Tables[0].Rows.Count == 0)
        //        {
        //            return NotFound(ApiResponse<DataSet>.ErrorResponse(
        //                "No short term proposed course unit details found.", 404));
        //        }

        //        return Ok(ApiResponse<DataSet>.SuccessResponse(
        //            "Short term proposed course unit details retrieved successfully.", result, 200));
        //    }
        //    catch (Exception ex)
        //    {
        //        return StatusCode(StatusCodes.Status500InternalServerError,
        //            ApiResponse<DataSet>.ErrorResponse(
        //                $"Internal server error: {ex.Message}", 500));
        //    }
        //}


        //[HttpPost]
        //[Route("short-term/approved-details")]
        //public ActionResult<ApiResponse<DataSet>> GetShortTermApprovedCourseUnitDetails(
        //    [FromBody] InstituteInputEntity entity)
        //{
        //    if (entity == null)
        //    {
        //        return BadRequest(ApiResponse<DataSet>.ErrorResponse(
        //            "Institute input entity cannot be null.", 400));
        //    }

        //    try
        //    {
        //        var result = _IInstituteBase.GetShortTermApprovedCourseUnitDetails(entity);

        //        if (result == null || result.Tables.Count == 0 || result.Tables[0].Rows.Count == 0)
        //        {
        //            return NotFound(ApiResponse<DataSet>.ErrorResponse(
        //                "No short term approved course unit details found.", 404));
        //        }

        //        return Ok(ApiResponse<DataSet>.SuccessResponse(
        //            "Short term approved course unit details retrieved successfully.", result, 200));
        //    }
        //    catch (Exception ex)
        //    {
        //        return StatusCode(StatusCodes.Status500InternalServerError,
        //            ApiResponse<DataSet>.ErrorResponse(
        //                $"Internal server error: {ex.Message}", 500));
        //    }
        //}


        [HttpPost]
        [Route("SaveProposedCourseUnitDetails")]
        public ActionResult<ApiResponse<string>> SaveProposedCourseUnitDetails(
            [FromBody] ProposedCourseUnitDetailsEntity entity)
        {
            if (entity == null)
            {
                return BadRequest(ApiResponse<string>.ErrorResponse(
                    "Proposed course unit details entity cannot be null.", 400));
            }

            try
            {
                var result = _IInstituteBase.SaveProposedCourseUnitDetails(entity);

                if (result.ToUpper() == "N")
                {
                    return BadRequest(ApiResponse<string>.ErrorResponse(
                        "Failed to save proposed course unit details. Please try again.", 400));
                }

                return Ok(ApiResponse<string>.SuccessResponse(
                    "Proposed course unit details saved successfully.", result, 200));
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>.ErrorResponse(
                        $"Internal server error: {ex.Message}", 500));
            }
        }


        //[HttpPost]
        //[Route("short-term/save")]
        //public ActionResult<ApiResponse<string>> SaveShortTermProposedCourseUnitDetails(
        //    [FromBody] ProposedCourseUnitDetailsEntity entity)
        //{
        //    if (entity == null)
        //    {
        //        return BadRequest(ApiResponse<string>.ErrorResponse(
        //            "Short term proposed course unit details entity cannot be null.", 400));
        //    }

        //    try
        //    {
        //        var result = _IInstituteBase.SaveShortTermProposedCourseUnitDetails(entity);

        //        if (result.ToUpper() == "N")
        //        {
        //            return BadRequest(ApiResponse<string>.ErrorResponse(
        //                "Failed to save short term proposed course unit details. Please try again.", 400));
        //        }

        //        return Ok(ApiResponse<string>.SuccessResponse(
        //            "Short term proposed course unit details saved successfully.", result, 200));
        //    }
        //    catch (Exception ex)
        //    {
        //        return StatusCode(StatusCodes.Status500InternalServerError,
        //            ApiResponse<string>.ErrorResponse(
        //                $"Internal server error: {ex.Message}", 500));
        //    }
        //}


        [HttpDelete]
        [Route("DeleteProposedCourseUnitDetails")]
        public ActionResult<ApiResponse<string>> DeleteProposedCourseUnitDetails(
            [FromBody] ProposedCourseUnitDetailsEntity entity)
        {
            if (entity == null)
            {
                return BadRequest(ApiResponse<string>.ErrorResponse(
                    "Proposed course unit details entity cannot be null.", 400));
            }

            try
            {
                var result = _IInstituteBase.DeleteProposedCourseUnitDetails(entity);

                if (result.ToUpper() == "N")
                {
                    return BadRequest(ApiResponse<string>.ErrorResponse(
                        "Failed to delete proposed course unit details. Please try again.", 400));
                }

                return Ok(ApiResponse<string>.SuccessResponse(
                    "Proposed course unit details deleted successfully.", result, 200));
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>.ErrorResponse(
                        $"Internal server error: {ex.Message}", 500));
            }
        }


        //[HttpDelete]
        //[Route("short-term/delete")]
        //public ActionResult<ApiResponse<string>> DeleteShortTermProposedCourseUnitDetails(
        //    [FromBody] ProposedCourseUnitDetailsEntity entity)
        //{
        //    if (entity == null)
        //    {
        //        return BadRequest(ApiResponse<string>.ErrorResponse(
        //            "Short term proposed course unit details entity cannot be null.", 400));
        //    }

        //    try
        //    {
        //        var result = _IInstituteBase.DeleteShortTermProposedCourseUnitDetails(entity);

        //        if (result.ToUpper() == "N")
        //        {
        //            return BadRequest(ApiResponse<string>.ErrorResponse(
        //                "Failed to delete short term proposed course unit details. Please try again.", 400));
        //        }

        //        return Ok(ApiResponse<string>.SuccessResponse(
        //            "Short term proposed course unit details deleted successfully.", result, 200));
        //    }
        //    catch (Exception ex)
        //    {
        //        return StatusCode(StatusCodes.Status500InternalServerError,
        //            ApiResponse<string>.ErrorResponse(
        //                $"Internal server error: {ex.Message}", 500));
        //    }

        //}


        // inspection units
        [HttpGet("GetInspectionUnitDetails")]
        public IActionResult GetInspectionUnitDetails(long instituteId, int? approvalIdFlag=-1)
        {
            try
            {
                if (instituteId <= 0)
                    return BadRequest(ApiResponse<object>.ErrorResponse("Invalid institute ID.", 400));

                var result = _IInstituteBase.GetInspectionUnitDetails(instituteId, approvalIdFlag);

                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("Inspection unit details not found.", 404));

                return Ok(ApiResponse<List<InspectionUnitDetailsEntity>>.SuccessResponse(result, "Inspection unit details retrieved successfully."));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetInspectionUnitDetails");
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("UpdateProposedCourseUnitDetailsForInspectionUnits")]
        public IActionResult UpdateProposedCourseUnitDetailsForInspectionUnits(
        [FromBody] UpdateInspectionUnitsRequest request)
        {
            try
            {
                if (request == null ||
                    request.InstituteID <= 0 ||
                    request.ProposedCourses == null ||
                    request.ProposedCourses.Count == 0)
                {
                    return BadRequest(ApiResponse<object>
                        .ErrorResponse("Invalid request data.", 400));
                }

                string xml = ConvertToXml(request.ProposedCourses);

                var result =
                    _IInstituteBase.UpdateProposedCourseUnitDetailsForInspectionUnits(
                        request.InstituteID,
                        xml,
                        request.CreatedBy,
                        request.IpAddress);

                return Ok(ApiResponse<DataTable>.SuccessResponse(
                    result,
                    "Inspection units updated successfully."));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(
                    ex.Message,
                    "UpdateProposedCourseUnitDetailsForInspectionUnits");

                return StatusCode(500,
                    ApiResponse<object>.ErrorResponse(
                        ex.Message, 500));
            }
        }

        private string ConvertToXml(
            List<ProposedCourseUnitDetailsEntityInspectionUnits> courses)
        {
            var serializer = new XmlSerializer(
                typeof(List<ProposedCourseUnitDetailsEntityInspectionUnits>),
                new XmlRootAttribute(
                    "ArrayOfProposedCourseUnitDetailsEntity"));

            var ns = new XmlSerializerNamespaces();
            ns.Add("", "");

            using var sw = new StringWriter();
            using var xw = XmlWriter.Create(sw,
                new XmlWriterSettings
                {
                    OmitXmlDeclaration = true
                });

            serializer.Serialize(xw, courses, ns);
            return sw.ToString();
        }




        // workshop

        [HttpGet]
        [Route("GetWorkshopDetails")]
        public ActionResult<ApiResponse<List<WorkshopEntity>>> GetWorkshopDetails(
    [FromQuery] long instituteId, string userloginid, int approvalIdFlag=-1)
        {
            if (instituteId <= 0)
            {
                return BadRequest(ApiResponse<List<WorkshopEntity>>.ErrorResponse(
                    "Institute ID must be a valid positive number.", 400));
            }

            try
            {
                var inputEntity = new InstituteInputEntity
                {
                    InstituteId = instituteId,
                    UserLoginID = userloginid,
                    ApprovalIDFlag = approvalIdFlag
                };

                var result = _IInstituteBase.GetWorkshopDetails(inputEntity);

                if (result == null || result.Count == 0)
                {
                    return Ok(ApiResponse<List<WorkshopEntity>>.ErrorResponse("No workshop details found.", 404));

                }

                return Ok(ApiResponse<List<WorkshopEntity>>.SuccessResponse(result, "Workshop details retrieved successfully.", 200));

            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<List<WorkshopEntity>>.ErrorResponse(
                        $"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("SaveWorkshopDetails")]
        public ActionResult<ApiResponse<string>> SaveWorkshopDetails(
            [FromBody] WorkshopEntity entity)
        {
            if (entity == null)
            {
                return BadRequest(ApiResponse<string>.ErrorResponse(
                    "Workshop entity cannot be null.", 400));
            }

            try
            {
                var result = _IInstituteBase.SaveWorkshopDetails(entity);

                
                if (result.Equals("Editing is not allowed", StringComparison.OrdinalIgnoreCase))
                {
                    return BadRequest(ApiResponse<string>.ErrorResponse(
                        result, 403)); // Forbidden
                }

                // ❌ Generic failure
                if (result.Equals("N", StringComparison.OrdinalIgnoreCase))
                {
                    return BadRequest(ApiResponse<string>.ErrorResponse(
                        "Failed to save workshop photo path. Please try again.", 400));
                }
                return Ok(ApiResponse<string>.SuccessResponse(
                    "Workshop details saved successfully.", result, 200));
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>.ErrorResponse(
                        $"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("SaveWorkshopPhotoPath")]
        public ActionResult<ApiResponse<string>> SaveWorkshopPhotoPath(
            [FromBody] WorkshopEntity entity)
        {
            if (entity == null)
            {
                return BadRequest(ApiResponse<string>.ErrorResponse(
                    "Workshop entity cannot be null.", 400));
            }

            if (string.IsNullOrEmpty(entity.WorkshopPhotoPath))
            {
                return BadRequest(ApiResponse<string>.ErrorResponse(
                    "Workshop photo path cannot be empty.", 400));
            }

            try
            {
                var result = _IInstituteBase.SaveWorkshopPhotoPath(entity);

                
                if (result.Equals("Editing is not allowed", StringComparison.OrdinalIgnoreCase))
                {
                    return BadRequest(ApiResponse<string>.ErrorResponse(
                        result, 403)); // Forbidden
                }

                // ❌ Generic failure
                if (result.Equals("N", StringComparison.OrdinalIgnoreCase))
                {
                    return BadRequest(ApiResponse<string>.ErrorResponse(
                        "Failed to save workshop photo path. Please try again.", 400));
                }

                return Ok(ApiResponse<string>.SuccessResponse(
                    "Workshop photo path saved successfully.", result, 200));
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>.ErrorResponse(
                        $"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("DeleteWorkshopPhotoPath")]
        public ActionResult<ApiResponse<string>> DeleteWorkshopPhotoPath(
            [FromBody] WorkshopEntity entity)
        {
            if (entity == null)
            {
                return BadRequest(ApiResponse<string>.ErrorResponse(
                    "Workshop entity cannot be null.", 400));
            }

            try
            {
                var result = _IInstituteBase.DeleteWorkshopPhotoPath(entity);

                if (result.ToUpper() == "N")
                {
                    return BadRequest(ApiResponse<string>.ErrorResponse(
                        "Failed to delete workshop photo path. Please try again.", 400));
                }

                return Ok(ApiResponse<string>.SuccessResponse(
                    "Workshop photo path deleted successfully.", result, 200));
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>.ErrorResponse(
                        $"Internal server error: {ex.Message}", 500));
            }
        }


        [HttpPost]
        [Route("GetWorkshopSpaceRemark")]
        public ActionResult<ApiResponse<WorkshopSpaceRemarkEntity>> GetWorkshopSpaceRemark(
            [FromBody] InstituteInputEntity entity)
        {
            if (entity == null)
                return BadRequest(ApiResponse<WorkshopSpaceRemarkEntity>.ErrorResponse(
                    "Institute input entity cannot be null.", 400));

            if (entity.InstituteId <= 0)
                return BadRequest(ApiResponse<WorkshopSpaceRemarkEntity>.ErrorResponse(
                    "Institute ID must be greater than zero.", 400));

            try
            {
                var result = _IInstituteBase.GetWorkshopSpaceRemark(entity.InstituteId);

                if (result == null)
                    return NotFound(ApiResponse<WorkshopSpaceRemarkEntity>.ErrorResponse(
                        "No workshop space remark found.", 404));

                return Ok(ApiResponse<WorkshopSpaceRemarkEntity>.SuccessResponse(
                    result, "Workshop space remark retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<WorkshopSpaceRemarkEntity>.ErrorResponse(
                        $"Internal server error: {ex.Message}", 500));
            }
        }

        // bank details
        [HttpGet]
        [Route("GetInstituteBankDetails")]
        public ActionResult<ApiResponse<List<InstituteBankEntity>>> GetInstituteBankDetails(long InstituteID)
        {
            if (InstituteID <= 0)
            {
                return BadRequest(ApiResponse<List<InstituteBankEntity>>.ErrorResponse("Institute ID must be greater than zero.", 400));
            }
            try
            {
                var result = _IInstituteBase.GetInstituteBank(InstituteID);
                if (result == null || result.Count == 0)
                {
                    return NotFound(ApiResponse<List<InstituteBankEntity>>.ErrorResponse("No bank details found.", 404));
                }
                return Ok(ApiResponse<List<InstituteBankEntity>>.SuccessResponse(result, "Bank details retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<List<InstituteBankEntity>>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }



        [HttpPost]
        [Route("SaveInstituteBankDetails")]
        public ActionResult<ApiResponse<string>> SaveInstituteBankDetails([FromBody] InstituteBankEntity entity)
        {
            if (entity == null)
            {
                return BadRequest(ApiResponse<string>.ErrorResponse("Institute bank entity cannot be null.", 400));
            }
            try
            {
                var result = _IInstituteBase.SaveInstituteBank(entity);
                // ❌ Editing not allowed
                if (result.Equals("Editing not allowed. Inspection request is pending.", StringComparison.OrdinalIgnoreCase))
                {
                    return BadRequest(ApiResponse<string>.ErrorResponse(
                        result, 403)); // Forbidden
                }

                // ❌ Generic failure
                if (result.Equals("N", StringComparison.OrdinalIgnoreCase))
                {
                    return BadRequest(ApiResponse<string>.ErrorResponse(
                        "Failed to save bank details. Please try again.", 400));
                }
                if (result.Equals("Generate LOI in order to complete inspection stage.", StringComparison.OrdinalIgnoreCase))
                {
                    return BadRequest(ApiResponse<string>.ErrorResponse(
                        result, 403)); // Forbidden
                }


                // ✅ Success
                return Ok(ApiResponse<string>.SuccessResponse(
                    result, "Bank details saved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }


        // power  details
        [HttpPost]
        [Route("GetInstitutePowerDetails")]
        public ActionResult<ApiResponse<PowerInfoEntity>> GetInstitutePowerDetails(
    [FromBody] InstituteInputEntity entity)
        {
            if (entity == null)
                return BadRequest(ApiResponse<string>.ErrorResponse(
                    "Institute input entity cannot be null.", 400));

            try
            {
                var result = _IInstituteBase.GetPowerDetails(entity);

                if (result == null)
                    return NotFound(ApiResponse<PowerInfoEntity>.ErrorResponse(
                        "No power details found.", 404));

                return Ok(ApiResponse<PowerInfoEntity>.SuccessResponse(
                    result, "Power details retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>.ErrorResponse(
                        $"Internal server error: {ex.Message}", 500));
            }
        }


        [HttpPost]
        [Route("SaveInstitutePowerDetails")]
        public ActionResult<ApiResponse<string>> SaveInstitutePowerDetails([FromBody] PowerInfoSaveRequest entity)
        {
            if (entity == null)
            {
                return BadRequest(ApiResponse<string>.ErrorResponse("Power info entity cannot be null.", 400));
            }
            try
            {
                var result = _IInstituteBase.SavePowerDetails(entity);
                if (result.ToUpper() == "N")
                {
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to save power details. Please try again.", 400));
                }
                if (result.Equals("Editing is not allowed", StringComparison.OrdinalIgnoreCase))
                {
                    return BadRequest(ApiResponse<string>.ErrorResponse(
                        result, 403)); // Forbidden
                }

                

                return Ok(ApiResponse<string>.SuccessResponse("Power details saved successfully.", "Power details saved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }

        }
        // Training Equipment
        //[HttpPost]
        //[Route("GetTrainingEquipmentDetails")]
        //public ActionResult<ApiResponse<List<TrainingEquipmentStatusEntity>>> GetInstituteTrainingEquipmentDetails(
        //     [FromBody] InstituteInputEntity entity)
        //{
        //    if (entity == null)
        //        return BadRequest(ApiResponse<List<TrainingEquipmentStatusEntity>>.ErrorResponse(
        //            "Institute input entity cannot be null.", 400));

        //    if (entity.InstituteId <= 0)
        //        return BadRequest(ApiResponse<List<TrainingEquipmentStatusEntity>>.ErrorResponse(
        //            "Institute ID must be greater than zero.", 400));

        //    try
        //    {
        //        var result = _IInstituteBase.GetTrainingEquipmentDetails(entity);

        //        if (result == null || result.Count == 0)
        //            return NotFound(ApiResponse<List<TrainingEquipmentStatusEntity>>.ErrorResponse(
        //                "No training equipment details found.", 404));

        //        return Ok(ApiResponse<List<TrainingEquipmentStatusEntity>>.SuccessResponse(
        //            result, "Training equipment details retrieved successfully.", 200));
        //    }
        //    catch (Exception ex)
        //    {
        //        return StatusCode(StatusCodes.Status500InternalServerError,
        //            ApiResponse<List<TrainingEquipmentStatusEntity>>.ErrorResponse(
        //                $"Internal server error: {ex.Message}", 500));
        //    }
        //}

        [HttpPost]
        [Route("GetTrainingEquipmentDetails")]
        public ActionResult<ApiResponse<object>> GetInstituteTrainingEquipmentDetails([FromBody] InstituteInputEntity entity)
        {
            if (entity == null)
            {
                return BadRequest(ApiResponse<object>.ErrorResponse("Institute input entity cannot be null.", 400));
            }

            if (entity.InstituteId <= 0)
            {
                return BadRequest(ApiResponse<object>.ErrorResponse("Institute ID must be greater than zero.", 400));
            }

            try
            {
                var result = _IInstituteBase.GetTrainingEquipmentDetails(entity);

                if ((result == null || result.Items == null || result.Items.Count == 0) &&
                    string.IsNullOrWhiteSpace(result?.Remarks))
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No training equipment details found.", 404));
                }

                var responseData = new
                {
                    Items = result?.Items ?? new List<TrainingEquipmentStatusEntity>(),
                    TrainingEquipmentRemark = result?.Remarks ?? string.Empty
                };

                return Ok(ApiResponse<object>.SuccessResponse(responseData, "Training equipment details retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetTrainingEquipmentDetails");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<object>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("GetTrainingEquipmentListDetails")]
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
                var result = _IInstituteBase.GetTrainingEquipmentListDetails(entity);

                if (result == null)
                    return NotFound(ApiResponse<TraningEquiplemntEntity>.ErrorResponse(
                        "No training equipment list details found.", 404));

                return Ok(ApiResponse<TraningEquiplemntEntity>.SuccessResponse(
                    result, "Training equipment list details retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<TraningEquiplemntEntity>.ErrorResponse(
                        $"Internal server error: {ex.Message}", 500));
            }
        }


        [HttpPost("GetSelfDeclarationPath")]
        public IActionResult GetSelfDeclarationPath([FromBody] InstituteInputEntity entity)
        {
            try
            {
                var result = _IInstituteBase.GetSelfDeclarationPath(entity);
                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Data retrieved successfully."));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.ErrorResponse(ex.Message, 400));
            }
        }

        [HttpGet("GetProposedInstituteStatus/{instituteId}")]
        public IActionResult GetProposedInstituteStatus(long instituteId)
        {
            try
            {
                if (instituteId <= 0)
                {
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid Institute ID", 400));
                }

                var result = _IInstituteBase.GetProposedInstituteStatus(instituteId);

                if (result != null && result.InstituteID > 0)
                {
                    return Ok(ApiResponse<InstituteStatusEntity>.SuccessResponse(result, "Data retrieved successfully."));
                }
                else
                {
                    return Ok(ApiResponse<InstituteStatusEntity>.SuccessResponse(null, "No data found."));
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.ErrorResponse(ex.Message, 500));
            }
        }

        //[HttpPost]
        //[Route("UpdateTrainingEquipmentAvailability")]
        //public ActionResult<ApiResponse<string>> UpdateTrainingEquipmentAvailability([FromBody] JsonElement payload)
        //{
        //    try
        //    {
        //        if (!payload.TryGetProperty("lstTrainingEquipmentList", out var equipmentListJson))
        //            return BadRequest(ApiResponse<string>.ErrorResponse("Training equipment list is required.", 400));

        //        if (!payload.TryGetProperty("PageCode", out var pageCodeJson))
        //            return BadRequest(ApiResponse<string>.ErrorResponse("Page code is required.", 400));

        //        var equipmentList = JsonSerializer.Deserialize<List<TrainingEquipmentListEntity>>(equipmentListJson.GetRawText());
        //        var photoList = new List<TraningEquipmentPhotoEntity>();
        //        if (payload.TryGetProperty("lstPhoto", out var photoListJson))
        //        {
        //            photoList = JsonSerializer.Deserialize<List<TraningEquipmentPhotoEntity>>(photoListJson.GetRawText())
        //                        ?? new List<TraningEquipmentPhotoEntity>();
        //        }

        //        var pageCode = pageCodeJson.GetString();

        //        if (equipmentList == null || equipmentList.Count == 0)
        //            return BadRequest(ApiResponse<string>.ErrorResponse("Training equipment list cannot be empty.", 400));

        //        if (string.IsNullOrWhiteSpace(pageCode))
        //            return BadRequest(ApiResponse<string>.ErrorResponse("Page code cannot be empty.", 400));

        //        var result = _IInstituteBase.UpdateTrainingEquipmentAvailability(equipmentList, photoList, pageCode);

        //        if (string.IsNullOrWhiteSpace(result) || result.ToUpper() == "N")
        //            return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<string>.ErrorResponse("Data has not been updated. Please try again.", 500));

        //        if (!string.IsNullOrWhiteSpace(result) && result.Contains("Exception"))
        //            return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<string>.ErrorResponse(result, 500));

        //        return Ok(ApiResponse<string>.SuccessResponse(result, "Training equipment availability updated successfully.", 200));
        //    }
        //    catch (JsonException jsonEx)
        //    {
        //        return BadRequest(ApiResponse<string>.ErrorResponse($"Invalid JSON format: {jsonEx.Message}", 400));
        //    }
        //    catch (Exception ex)
        //    {
        //        CommonHelper.SaveException(ex.Message, "UpdateTrainingEquipmentAvailability");
        //        return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
        //    }
        //}


        [HttpPost]
        [Route("UpdateTrainingEquipmentAvailability")]
        public ActionResult<ApiResponse<string>> UpdateTrainingEquipmentAvailability(
    [FromBody] TraningEquiplemntEntity request)
        {
            if (request.lstTrainingEquipmentListEntity == null || !request.lstTrainingEquipmentListEntity.Any())
                return BadRequest("Equipment list required");
            try
            {


                var result = _IInstituteBase.UpdateTrainingEquipmentAvailability(
                    request.lstTrainingEquipmentListEntity,
                    request.lstEquipmentPhoto,
                    request.lstTrainingEquipmentListEntity.First().PageCode
                );
                if (result == null)
                {
                    return NotFound(ApiResponse<string>.ErrorResponse("No data found.", 404));
                }
                if (result.Equals("Editing not allowed. Inspection request is pending.", StringComparison.OrdinalIgnoreCase))
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
                return Ok(ApiResponse<string>.SuccessResponse(result, "Training Equipment Saved successfully.", 200));
            }


            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UpdateTrainingEquipmentAvailability");
                return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }



        // Common Facility
        [HttpGet]
        [Route("GetMasterSubFacilityGroup")]
        public ActionResult<ApiResponse<CommonFacilityEntity>> GetMasterSubFacilityGroup([FromQuery] long InstituteID)
        {
            if (InstituteID <= 0)
            {
                return BadRequest(ApiResponse<CommonFacilityEntity>.ErrorResponse("Institute ID must be greater than zero.", 400));
            }

            try
            {
                var result = _IInstituteBase.GetMasterSubFacilityGroup(InstituteID);

                if (result == null)
                {
                    return NotFound(ApiResponse<CommonFacilityEntity>.ErrorResponse("No common facility data found.", 404));
                }

                return Ok(ApiResponse<CommonFacilityEntity>.SuccessResponse(result, "Master sub-facility group retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetMasterSubFacilityGroup");
                return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<CommonFacilityEntity>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetCommonFacilityCourseDetails")]
        public ActionResult<ApiResponse<DataSet>> GetCommonFacilityCourseDetails([FromQuery] long InstituteID)
        {
            if (InstituteID <= 0)
            {
                return BadRequest(ApiResponse<DataSet>.ErrorResponse("Institute ID must be greater than zero.", 400));
            }

            try
            {
                var result = _IInstituteBase.GetCommonFacilityCourseDetails(InstituteID);

                if (result == null || result.Tables.Count == 0)
                {
                    return NotFound(ApiResponse<DataSet>.ErrorResponse("No common facility course details found.", 404));
                }

                return Ok(ApiResponse<DataSet>.SuccessResponse(result, "Common facility course details retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetCommonFacilityCourseDetails");
                return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<DataSet>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("SaveFacilityDetails")]
        public ActionResult<ApiResponse<string>> SaveFacilityDetails([FromBody] CommonSubFacilityEntity entity)
        {
            if (entity == null)
            {
                return BadRequest(ApiResponse<string>.ErrorResponse("Facility details entity cannot be null.", 400));
            }

            try
            {
                var result = _IInstituteBase.SaveFacilityDetails(entity);

                if (string.IsNullOrWhiteSpace(result) || result.ToUpper() == "N" || result.Contains("Error") || result.Contains("not been saved"))
                {
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to save facility details. Please try again.", 400));
                }

                return Ok(ApiResponse<string>.SuccessResponse(result, "Facility details saved successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveFacilityDetails");
                return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("SaveCommonPhotoPath")]
        public ActionResult<ApiResponse<string>> SaveCommonPhotoPath([FromBody] WorkshopEntity entity)
        {
            if (entity == null)
            {
                return BadRequest(ApiResponse<string>.ErrorResponse("Workshop entity cannot be null.", 400));
            }

            if (string.IsNullOrEmpty(entity.WorkshopPhotoPath))
            {
                return BadRequest(ApiResponse<string>.ErrorResponse("Photo path cannot be empty.", 400));
            }

            try
            {
                var result = _IInstituteBase.SaveCommonPhotoPath(entity);

                if (result.ToUpper() == "N")
                {
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to save photo path. Please try again.", 400));
                }

                return Ok(ApiResponse<string>.SuccessResponse(result, "Photo path saved successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveCommonPhotoPath");
                return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("DeleteCommonPhotoPath")]
        public ActionResult<ApiResponse<string>> DeleteCommonPhotoPath([FromBody] WorkshopEntity entity)
        {
            if (entity == null)
            {
                return BadRequest(ApiResponse<string>.ErrorResponse("Workshop entity cannot be null.", 400));
            }

            try
            {
                var result = _IInstituteBase.DeleteCommonPhotoPath(entity);

                if (result.ToUpper() == "N")
                {
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to delete photo path. Please try again.", 400));
                }

                return Ok(ApiResponse<string>.SuccessResponse(result, "Photo path deleted successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "DeleteCommonPhotoPath");
                return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        // Other Infra 

        [HttpGet]
        [Route("GetOtherInfraDetails")]
        public ActionResult<ApiResponse<OtherInfraEntity>> GetOtherInfraDetails([FromQuery] long InstituteID)
        {
            if (InstituteID <= 0)
            {
                return BadRequest(ApiResponse<OtherInfraEntity>.ErrorResponse("Institute ID must be greater than zero.", 400));
            }

            try
            {
                var result = _IInstituteBase.GetOtherInfraDetails(InstituteID);

                if (result == null)
                {
                    return NotFound(ApiResponse<OtherInfraEntity>.ErrorResponse("No other infra details found.", 404));
                }

                return Ok(ApiResponse<OtherInfraEntity>.SuccessResponse(result, "Other infra details retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetOtherInfraDetails");
                return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<OtherInfraEntity>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("SaveOtherInfraPhotoPath")]
        public ActionResult<ApiResponse<string>> SaveOtherInfraPhotoPath([FromBody] OtherInfraEntity entity)
        {
            if (entity == null)
            {
                return BadRequest(ApiResponse<string>.ErrorResponse("Other infra entity cannot be null.", 400));
            }

            try
            {
                var result = _IInstituteBase.SaveOtherInfraPhotoPath(entity);

                if (string.IsNullOrWhiteSpace(result) || result.ToUpper() == "N" || result.Contains("Error") || result.Contains("not been saved"))
                {
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to save photo path. Please try again.", 400));
                }

                return Ok(ApiResponse<string>.SuccessResponse(result, "Photo path saved successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveOtherInfraPhotoPath");
                return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("SaveOtherInfraDetails")]
        public ActionResult<ApiResponse<string>> SaveOtherInfraDetails([FromBody] OtherInfraEntity entity)
        {
            if (entity == null)
            {
                return BadRequest(ApiResponse<string>.ErrorResponse("Other infra details entity cannot be null.", 400));
            }

            try
            {
                var result = _IInstituteBase.SaveOtherInfraDetails(entity);

                if (string.IsNullOrWhiteSpace(result) || result.ToUpper() == "N" || result.Contains("Error") || result.Contains("not been saved"))
                {
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to save other infra details. Please try again.", 400));
                }

                return Ok(ApiResponse<string>.SuccessResponse(result, "Other infra details saved successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveOtherInfraDetails");
                return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }


        // new common facility
        [HttpGet]
        [Route("GetSubFacilityDetails")]
        public ActionResult<ApiResponse<List<SubFacilityEntity>>> GetSubFacilityDetails(
        [FromQuery] long instituteId,
        [FromQuery] string userloginid)
        {
            if (instituteId <= 0)
            {
                return BadRequest(ApiResponse<List<SubFacilityEntity>>.ErrorResponse(
                    "Institute ID must be a valid positive number.", 400));
            }

            try
            {
                var inputEntity = new SubFacilityInputEntity
                {
                    InstituteId = instituteId,
                    UserLoginID = userloginid
                };

                var result = _IInstituteBase.GetSubFacilityDetails(inputEntity);

                if (result == null || result.Count == 0)
                {
                    return Ok(ApiResponse<List<SubFacilityEntity>>.ErrorResponse(
                        "No sub-facility details found.", 404));
                }

                return Ok(ApiResponse<List<SubFacilityEntity>>.SuccessResponse(
                    result, "Sub-facility details retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<List<SubFacilityEntity>>.ErrorResponse(
                        $"Internal server error: {ex.Message}", 500));
            }
        }


        [HttpPost]
        [Route("SaveSubFacilityDetail")]
        public ActionResult<ApiResponse<string>> SaveSubFacilityDetail(
            [FromBody] SubFacilitySaveEntity entity)
        {
            if (entity == null || entity.InstituteId <= 0)
            {
                return BadRequest(ApiResponse<string>.ErrorResponse(
                    "Invalid input data.", 400));
            }

            try
            {
              //  entity.UserIPAddress = HttpContext.Connection.RemoteIpAddress?.ToString();

                var result = _IInstituteBase.SaveSubFacilityDetail(entity);

                return Ok(ApiResponse<string>.SuccessResponse(
                    result, "Sub-facility detail saved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>.ErrorResponse(
                        $"Internal server error: {ex.Message}", 500));
            }
        }

        
        [HttpPost]
        [Route("SaveSubFacilityDetails")]
        public ActionResult<ApiResponse<string>> SaveSubFacilityDetails(
            [FromBody] SubFacilityBulkSaveEntity entity)
        {
            if (entity == null || entity.InstituteId <= 0 || entity.FacilityData == null || entity.FacilityData.Count == 0)
            {
                return BadRequest(ApiResponse<string>.ErrorResponse(
                    "Invalid input data.", 400));
            }

            try
            {
                //entity.UserIPAddress = HttpContext.Connection.RemoteIpAddress?.ToString();

                var result = _IInstituteBase.SaveSubFacilityDetails(entity);

                return Ok(ApiResponse<string>.SuccessResponse(
                    result, "Sub-facility details saved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>.ErrorResponse(
                        $"Internal server error: {ex.Message}", 500));
            }
        }

        
        [HttpPost]
        [Route("DeleteSubFacilityDetail")]
        public ActionResult<ApiResponse<string>> DeleteSubFacilityDetail(
            [FromQuery] long id,
            [FromQuery] long instituteId,
            [FromQuery] string userloginid)
        {
            if (id <= 0 || instituteId <= 0)
            {
                return BadRequest(ApiResponse<string>.ErrorResponse(
                    "Invalid input parameters.", 400));
            }

            try
            {
                var entity = new SubFacilityDeleteEntity
                {
                    Id = id,
                    InstituteId = instituteId,
                    UserLoginID = userloginid,
                    //UserIPAddress = UserIPAddress
                };

                var result = _IInstituteBase.DeleteSubFacilityDetail(entity);

                return Ok(ApiResponse<string>.SuccessResponse(
                    result, "Sub-facility detail deleted successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>.ErrorResponse(
                        $"Internal server error: {ex.Message}", 500));
            }
        }



        [HttpPost("GetInspectionFeeList")]
        public IActionResult GetInspectionFeeList([FromBody] InstituteInputEntity inputEntity)
        {
            try
            {
                var result = _IInstituteBase.GetInspectionFeeList(inputEntity);

                if (result == null || result.Count == 0)
                {
                    return NotFound(
                        ApiResponse<List<InspectionFeeEntity>>.ErrorResponse(
                            "No inspection fee data found.",
                            404
                        )
                    );
                }

                return Ok(
                    ApiResponse<List<InspectionFeeEntity>>.SuccessResponse(
                        result,
                        "Data retrieved successfully.",
                        200
                    )
                );
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(
                    ex.Message,
                    "GetInspectionFeeList",
                    inputEntity?.InstituteId.ToString()
                );

                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    ApiResponse<string>.ErrorResponse(
                        $"Internal server error: {ex.Message}",
                        500
                    )
                );
            }
        }

        // Inspection Request

        [HttpPost("GetInstituteInspectionAgencyList")]
        public ActionResult<ApiResponse<DataSet>> GetInstituteInspectionAgencyList([FromBody] InstituteInputEntity entity)
        {
            if (entity == null)
            {
                return BadRequest(ApiResponse<DataSet>.ErrorResponse("Institute input entity cannot be null.", 400));
            }

            if (entity.InstituteId <= 0)
            {
                return BadRequest(ApiResponse<DataSet>.ErrorResponse("Institute ID must be greater than zero.", 400));
            }

            try
            {
                var result = _IInstituteBase.GetInstituteInspectionAgencyList(entity);

                if (result == null || result.Tables.Count == 0)
                {
                    return NotFound(ApiResponse<DataSet>.ErrorResponse("No inspection agency data found.", 404));
                }

                return Ok(ApiResponse<DataSet>.SuccessResponse(result, "Inspection agency list retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetInstituteInspectionAgencyList", entity?.InstituteId.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<DataSet>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("GetInstituteInspectionDateRange")]
        public ActionResult<ApiResponse<DataSet>> GetInstituteInspectionDateRange([FromBody] InstituteInputEntity entity)
        {
            if (entity == null)
            {
                return BadRequest(ApiResponse<DataSet>.ErrorResponse("Institute input entity cannot be null.", 400));
            }

            if (entity.InstituteId <= 0)
            {
                return BadRequest(ApiResponse<DataSet>.ErrorResponse("Institute ID must be greater than zero.", 400));
            }

            try
            {
                var result = _IInstituteBase.GetInstituteInspectionDateRange(entity);

                if (result == null || result.Tables.Count == 0 || result.Tables[0].Rows.Count == 0)
                {
                    return NotFound(ApiResponse<DataSet>.ErrorResponse("No inspection date range found.", 404));
                }

                return Ok(ApiResponse<DataSet>.SuccessResponse(result, "Inspection date range retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetInstituteInspectionDateRange", entity?.InstituteId.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<DataSet>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        

        [HttpPost("SaveInstituteInspectionDateRange")]
        public ActionResult<ApiResponse<string>> SaveInstituteInspectionDateRange([FromBody] SaveInspectionDateRangeRequest request)
        {
            if (request == null || request.Entity == null)
            {
                return BadRequest(ApiResponse<string>.ErrorResponse("Request or entity cannot be null.", 400));
            }

            if (request.Entity.InstituteId <= 0)
            {
                return BadRequest(ApiResponse<string>.ErrorResponse("Institute ID must be greater than zero.", 400));
            }
            

            if (string.IsNullOrWhiteSpace(request.StartDate) || string.IsNullOrWhiteSpace(request.EndDate))
            {
                return BadRequest(ApiResponse<string>.ErrorResponse("StartDate and EndDate are required.", 400));
            }

            try
            {
               // var result = _IInstituteBase.SaveInstituteInspectionDateRange(request.Entity, request.StartDate, request.EndDate,request.SubmissionDate ,request.DelayRemark,request.InspectionScheduledDateByDVETO,request.DelayRemarkForActual,request.ActualInspectionDateByDVETO);
                var result = _IInstituteBase.SaveInstituteInspectionDateRange(request);

                if (string.IsNullOrWhiteSpace(result) || result.ToUpper() == "N" || result.Contains("Error"))
                {
                    return BadRequest(ApiResponse<string>.ErrorResponse(result ?? "Failed to save inspection date range.", 400));
                }

                return Ok(ApiResponse<string>.SuccessResponse(result, "Inspection date range saved successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveInstituteInspectionDateRange", request.Entity.InstituteId.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        // requirement funding summary
        [HttpGet("GetRequirementSummaryDetails")]
        public IActionResult GetRequirementFundingDetails(
        [FromQuery] string financialYear = null,
        [FromQuery] int? stateId = null,
        [FromQuery] int? districtId = null,
        [FromQuery] int? talukaId = null,
         [FromQuery] string Status = null, [FromQuery] int? RegionID = null)
        {
            try
            {
                // Normalize 0 values to null
                if (stateId == 0) stateId = null;
                if (districtId == 0) districtId = null;
                if (talukaId == 0) talukaId = null;
                if (RegionID == 0) RegionID = null;

                var result = _IInstituteBase.GetRequirementInstitutionFundingDetails(
                    financialYear,
                    stateId,
                    districtId,
                    talukaId,
                    Status,
                    RegionID

                );

                if (result == null || result.Requirements == null)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse(
                        "No requirement funding details found for the specified criteria.",
                        404
                    ));
                }

                if (result.Requirements.Count == 0)
                {
                    return Ok(ApiResponse<RequirementInstitutionFundingResponse>.SuccessResponse(
                        result,
                        "No requirements found matching the filters."
                    ));
                }

                return Ok(ApiResponse<RequirementInstitutionFundingResponse>.SuccessResponse(
                    result,
                    $"Successfully retrieved {result.Requirements.Count} requirements from {result.Summary.TotalInstitutes} institutes."
                ));
            }
            catch (Exception ex)
            {
               
                return StatusCode(500, ApiResponse<string>.ErrorResponse(ex.Message, 500));
            }
        }

        [HttpPost("RequestInspection")]
        public IActionResult RequestInspection([FromBody] InspectionRequestEntity entity)
        {
            if (entity == null)
            {

                return BadRequest(ApiResponse<string>.ErrorResponse(
                    "Request data is required.", 400));
            }

            if (entity.InstituteID <= 0)
            {

                return BadRequest(ApiResponse<string>.ErrorResponse(
                    "Invalid Institute ID. It must be greater than zero.", 400));
            }

            if (string.IsNullOrWhiteSpace(entity.UserLoginID))
            {

                return BadRequest(ApiResponse<string>.ErrorResponse(
                    "UserLoginID is required.", 400));
            }

            try
            {


                InspectionOperationResult result = _IInstituteBase.RequestInspection(entity);

                // Check if operation failed
                if (!result.IsSuccess)
                {




                    // Pattern 1: Check for "Editing not allowed" - 403 Forbidden
                    if (result.Message.Equals("Editing not allowed", StringComparison.OrdinalIgnoreCase) ||
                        result.Message.Contains("Editing not allowed", StringComparison.OrdinalIgnoreCase))
                    {
                        return BadRequest(ApiResponse<string>.ErrorResponse(result.Message, 403));
                    }

                    // Pattern 2: Check for already submitted/exists - 403 Forbidden
                    if (result.Message.Contains("already submitted", StringComparison.OrdinalIgnoreCase) ||
                        result.Message.Contains("already exists", StringComparison.OrdinalIgnoreCase) ||
                        result.Message.Contains("request is pending", StringComparison.OrdinalIgnoreCase))
                    {
                        return BadRequest(ApiResponse<string>.ErrorResponse(result.Message, 403));
                    }

                    // Pattern 3: Check for "complete all mandatory" - 400 Bad Request
                    if (result.Message.Contains("complete all mandatory", StringComparison.OrdinalIgnoreCase) ||
                        result.Message.Contains("Please complete", StringComparison.OrdinalIgnoreCase))
                    {
                        return BadRequest(ApiResponse<string>.ErrorResponse(result.Message, 400));
                    }

                    // Pattern 4: Check for database/operation failure - 400 Bad Request
                    if (result.Message.ToUpper() == "N")
                    {
                        return BadRequest(ApiResponse<string>.ErrorResponse(
                            "Failed to submit inspection request. Please try again.", 400));
                    }

                    // Default error - 400 Bad Request
                    return BadRequest(ApiResponse<string>.ErrorResponse(result.Message, 400));
                }



                return Ok(ApiResponse<string>.SuccessResponse(
                    result.Message, "Inspection requested successfully.", 200));
            }
            catch (Exception ex)
            {

                return StatusCode(500, ApiResponse<string>.ErrorResponse(ex.Message, 500));
            }
        }
        [HttpPost("WithdrawInspection")]
        public IActionResult WithdrawInspection([FromBody] InspectionRequestEntity entity)
        {
            if (entity == null)
            {
               
                return BadRequest(ApiResponse<string>.ErrorResponse(
                    "Withdraw data is required.", 400));
            }

            if (entity.InstituteID <= 0)
            {
                
                return BadRequest(ApiResponse<string>.ErrorResponse(
                    "Invalid Institute ID. It must be greater than zero.", 400));
            }

            if (string.IsNullOrWhiteSpace(entity.UserLoginID))
            {
               
                return BadRequest(ApiResponse<string>.ErrorResponse(
                    "UserLoginID is required.", 400));
            }

            try
            {
               

                InspectionOperationResult result = _IInstituteBase.WithdrawInspection(entity);

               
                if (!result.IsSuccess)
                {
                   

                   
                    if (result.Message.Contains("Cannot withdraw", StringComparison.OrdinalIgnoreCase) ||
                        result.Message.Contains("submitted by admin", StringComparison.OrdinalIgnoreCase) ||
                        result.Message.Contains("Not authorized", StringComparison.OrdinalIgnoreCase))
                    {
                        return BadRequest(ApiResponse<string>.ErrorResponse(result.Message, 403));
                    }

                    
                    if (result.Message.Contains("No active inspection", StringComparison.OrdinalIgnoreCase) ||
                        result.Message.Contains("no request to withdraw", StringComparison.OrdinalIgnoreCase))
                    {
                        return BadRequest(ApiResponse<string>.ErrorResponse(result.Message, 400));
                    }

                   
                    if (result.Message.ToUpper() == "N")
                    {
                        return BadRequest(ApiResponse<string>.ErrorResponse(
                            "Failed to withdraw inspection request. Please try again.", 400));
                    }

                   
                    return BadRequest(ApiResponse<string>.ErrorResponse(result.Message, 400));
                }

                

                return Ok(ApiResponse<string>.SuccessResponse(
                    result.Message, "Inspection withdrawn successfully.", 200));
            }
            catch (Exception ex)
            {
              
                   
                return StatusCode(500, ApiResponse<string>.ErrorResponse(ex.Message, 500));
            }
        }
        [HttpGet("CheckInspectionEligibility")]
        public IActionResult CheckInspectionEligibility(long instituteId, [FromQuery] string userLoginId)
        {
            if (instituteId <= 0)
            {

                return BadRequest(ApiResponse<string>.ErrorResponse(
                    "Invalid Institute ID. It must be greater than zero.", 400));
            }

            if (string.IsNullOrWhiteSpace(userLoginId))
            {

                return BadRequest(ApiResponse<string>.ErrorResponse(
                    "UserLoginId is required.", 400));
            }

            try
            {
                var entity = new InstituteInput
                {
                    InstituteID = instituteId,
                    UserLoginID = userLoginId
                };

                InspectionEligibilityEntity eligibility = _IInstituteBase.CheckInspectionEligibility(entity);

                if (eligibility == null)
                {

                    return NotFound(ApiResponse<string>.ErrorResponse(
                        $"No eligibility data found for Institute ID {instituteId}.", 404));
                }


                return Ok(ApiResponse<InspectionEligibilityEntity>.SuccessResponse(
                    eligibility, "Inspection eligibility checked successfully.", 200));
            }
            catch (Exception ex)
            {

                return StatusCode(500, ApiResponse<string>.ErrorResponse(ex.Message, 500));
            }
        }


        [HttpPost("SubmitInspectionRequest")]
        public IActionResult SubmitInspectionRequest([FromBody] InspectionRequestEntity entity)
        {
            if (entity == null)
            {
               
                return BadRequest(ApiResponse<string>.ErrorResponse(
                    "Submit data is required.", 400));
            }

            if (entity.InstituteID <= 0)
            {
             
                return BadRequest(ApiResponse<string>.ErrorResponse(
                    "Invalid Institute ID. It must be greater than zero.", 400));
            }

            if (string.IsNullOrWhiteSpace(entity.UserLoginID))
            {
              
                return BadRequest(ApiResponse<string>.ErrorResponse(
                    "Admin UserLoginID is required.", 400));
            }

            try
            {
                

                InspectionOperationResult result = _IInstituteBase.SubmitInspectionRequest(entity);

                // Check if operation failed
                if (!result.IsSuccess)
                {
                   

                    // Pattern 1: Check for "Not authorized" - 403 Forbidden
                    if (result.Message.Contains("Not authorized", StringComparison.OrdinalIgnoreCase) ||
                        result.Message.Contains("permission denied", StringComparison.OrdinalIgnoreCase))
                    {
                        return BadRequest(ApiResponse<string>.ErrorResponse(result.Message, 403));
                    }

                    // Pattern 2: Check for "No pending inspection" - 400 Bad Request
                    if (result.Message.Contains("No pending inspection", StringComparison.OrdinalIgnoreCase) ||
                        result.Message.Contains("not found", StringComparison.OrdinalIgnoreCase))
                    {
                        return BadRequest(ApiResponse<string>.ErrorResponse(result.Message, 400));
                    }

                    // Pattern 3: Check for database/operation failure
                    if (result.Message.ToUpper() == "N")
                    {
                        return BadRequest(ApiResponse<string>.ErrorResponse(
                            "Failed to submit inspection request. Please try again.", 400));
                    }

                    // Default error - 400 Bad Request
                    return BadRequest(ApiResponse<string>.ErrorResponse(result.Message, 400));
                }

               
               

                return Ok(ApiResponse<string>.SuccessResponse(
                    result.Message, "Inspection submitted successfully.", 200));
            }
            catch (Exception ex)
            {
              
                return StatusCode(500, ApiResponse<string>.ErrorResponse(ex.Message, 500));
            }
        }

        //withdraw inspection 

        [HttpPost("WithdrawInspectionRequest")]
        public IActionResult WithdrawInspectionRequest([FromBody] InspectionRequestEntity entity)
        {
            if (entity == null)
            {

                return BadRequest(ApiResponse<string>.ErrorResponse(
                    "Submit data is required.", 400));
            }

            if (entity.InstituteID <= 0)
            {

                return BadRequest(ApiResponse<string>.ErrorResponse(
                    "Invalid Institute ID. It must be greater than zero.", 400));
            }

            if (string.IsNullOrWhiteSpace(entity.UserLoginID))
            {

                return BadRequest(ApiResponse<string>.ErrorResponse(
                    "Admin UserLoginID is required.", 400));
            }

            try
            {


                InspectionOperationResult result = _IInstituteBase.WithdrawInspectionRequest(entity);

                // Check if operation failed
                if (!result.IsSuccess)
                {


                    // Pattern 1: Check for "Not authorized" - 403 Forbidden
                    if (result.Message.Contains("Not authorized", StringComparison.OrdinalIgnoreCase) ||
                        result.Message.Contains("permission denied", StringComparison.OrdinalIgnoreCase))
                    {
                        return BadRequest(ApiResponse<string>.ErrorResponse(result.Message, 403));
                    }

                    // Pattern 2: Check for "No pending inspection" - 400 Bad Request
                    if (result.Message.Contains("No pending inspection", StringComparison.OrdinalIgnoreCase) ||
                        result.Message.Contains("not found", StringComparison.OrdinalIgnoreCase))
                    {
                        return BadRequest(ApiResponse<string>.ErrorResponse(result.Message, 400));
                    }

                    // Pattern 3: Check for database/operation failure
                    if (result.Message.ToUpper() == "N")
                    {
                        return BadRequest(ApiResponse<string>.ErrorResponse(
                            "Failed to Withdraw inspection request. Please try again.", 400));
                    }

                    // Default error - 400 Bad Request
                    return BadRequest(ApiResponse<string>.ErrorResponse(result.Message, 400));
                }




                return Ok(ApiResponse<string>.SuccessResponse(
                    result.Message, "Inspection withdraw successfully.", 200));
            }
            catch (Exception ex)
            {

                return StatusCode(500, ApiResponse<string>.ErrorResponse(ex.Message, 500));
            }
        }

        // 
        [HttpGet("GetInstitutePromoterTypeByInstituteID/{instituteId}/{managementType}")]
        public IActionResult GetInstitute_PromoterTypeByInstituteID(long instituteId, int managementType)
        {
            try
            {
                if (instituteId <= 0 || managementType <= 0)
                    return BadRequest(new { Status = "Error", Message = "Invalid institute or management type." });

                DataTable result = _IInstituteBase.GetInstitute_PromoterTypeByInstituteID(instituteId, managementType);

                if (result == null || result.Rows.Count == 0)
                    return NotFound(new { Status = "Error", Message = "Data not found." });

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
                CommonHelper.SaveException(ex.Message, "GetInstitute_PromoterTypeByInstituteID");
                return StatusCode(500, new
                {
                    Status = "Error",
                    StatusCode = 500,
                    Message = "An error occurred while retrieving data.",
                    Error = ex.Message
                });
            }
        }

        // dashboard for LOI approved institutes
        [HttpGet]
        [Route("GetInstituteDashboard")]
        public ActionResult<ApiResponse<object>> GetInstituteDashboard(
     [FromQuery] long? instituteId = null,
     [FromQuery] string instituteCode = null)
        {
           
            if (!instituteId.HasValue && string.IsNullOrEmpty(instituteCode))
            {
                return BadRequest(ApiResponse<object>.ErrorResponse(
                    "Either Institute ID or Institute Code must be provided.", 400));
            }

            try
            {
                var result = _IInstituteBase.GetInstituteDashboard(instituteId, instituteCode);

              
                if (result == null || result.Tables.Count == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse(
                        "No institute dashboard data found.", 404));
                }

              
                var serializableData = BaseWorker.ConvertDataSetToList(result);

                return Ok(ApiResponse<object>.SuccessResponse(
                    serializableData,
                    "Institute dashboard data retrieved successfully.",
                    200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetInstituteDashboard");
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    ApiResponse<object>.ErrorResponse(
                        $"An error occurred: {ex.Message}", 500));
            }
        }

        // temp dashbaord 

        [HttpGet]
        [Route("GetTempInstituteDashboard")]
        public ActionResult<ApiResponse<object>> GetTempInstituteDashboard([FromQuery] long tempInstituteId)
        {
            if (tempInstituteId <= 0)
            {
                return BadRequest(ApiResponse<object>.ErrorResponse(
                    "Temp Institute ID must be greater than zero.", 400));
            }

            try
            {
                var result = _IInstituteBase.GetTempInstituteDashboard(tempInstituteId);

               
                if (result == null || result.Tables.Count == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse(
                        "No temp institute dashboard data found.", 404));
                }

              
                var serializableData = BaseWorker.ConvertDataSetToList(result);

                return Ok(ApiResponse<object>.SuccessResponse(
                    serializableData,
                    "Temp institute dashboard data retrieved successfully.",
                    200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetTempInstituteDashboard");
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        // SearchSDIInspection
        [HttpGet]
        [Route("SearchSDIInspection")]
        public ActionResult<ApiResponse<object>> SearchSDIInspection(
     [FromQuery] int DistrictID,
     [FromQuery] int TalukaID,
     [FromQuery] int RegionID,
     [FromQuery] string FormStatus,
     [FromQuery] long InstituteID,
     [FromQuery] long userID)
        {
            if (string.IsNullOrEmpty(FormStatus))
            {
                return BadRequest(ApiResponse<object>.ErrorResponse(
                    "Form Status is required.", 400));
            }

            try
            {
                var result = _IInstituteBase.SearchSDIInspection(
                                DistrictID,
                                TalukaID,
                                RegionID,
                                FormStatus,
                                InstituteID,
                                  userID);

                if (result == null || result.Rows.Count == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse(
                        "No inspection data found.", 404));
                }

                var serializableData = BaseWorker.ConvertDataTableToList(result);

                return Ok(ApiResponse<object>.SuccessResponse(
                    serializableData,
                    "Inspection data retrieved successfully.",
                    200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SearchSDIInspection");

                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    ApiResponse<object>.ErrorResponse(
                        $"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("SearchInstituteSDIInspection")]
        public ActionResult<ApiResponse<object>> SearchInstituteSDIInspection(
            [FromQuery] int DistrictID,
            [FromQuery] int TalukaID,
            [FromQuery] int RegionID,
            [FromQuery] string FormStatus,
            [FromQuery] long InstituteID,
            [FromQuery] long userID )
        {
            if (string.IsNullOrEmpty(FormStatus))
            {
                return BadRequest(ApiResponse<object>.ErrorResponse(
                    "Form Status is required.", 400));
            }

            try
            {
                var result = _IInstituteBase.SearchInstituteSDIInspection(
                                DistrictID,
                                TalukaID,
                                RegionID,
                                FormStatus,
                                InstituteID,
                                userID);

                if (result == null || result.Rows.Count == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse(
                        "No inspection data found.", 404));
                }

                var serializableData = BaseWorker.ConvertDataTableToList(result);

                return Ok(ApiResponse<object>.SuccessResponse(
                    serializableData,
                    "Inspection data retrieved successfully.",
                    200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SearchInstituteSDIInspection");

                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    ApiResponse<object>.ErrorResponse(
                        $"An error occurred: {ex.Message}", 500));
            }
        }
        [HttpGet]
        [Route("DVETOSubmittedInstituteSDIInspection")]
        public ActionResult<ApiResponse<object>> DVETOSubmittedInstituteSDIInspection(
            [FromQuery] int DistrictID,
            [FromQuery] int TalukaID,
            [FromQuery] int RegionID,
            [FromQuery] string FormStatus,
            [FromQuery] long InstituteID,
            [FromQuery] long userID)
        {
            if (string.IsNullOrEmpty(FormStatus))
            {
                return BadRequest(ApiResponse<object>.ErrorResponse(
                    "Form Status is required.", 400));
            }

            try
            {
                var result = _IInstituteBase.DVETOSubmittedInstituteSDIInspection(
                                DistrictID,
                                TalukaID,
                                RegionID,
                                FormStatus,
                                InstituteID,
                                userID);

                if (result == null || result.Rows.Count == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse(
                        "No inspection data found.", 404));
                }

                var serializableData = BaseWorker.ConvertDataTableToList(result);

                return Ok(ApiResponse<object>.SuccessResponse(
                    serializableData,
                    "Inspection data retrieved successfully.",
                    200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "DVETOSubmittedInstituteSDIInspection");

                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    ApiResponse<object>.ErrorResponse(
                        $"An error occurred: {ex.Message}", 500));
            }
        }




        [HttpGet]
        [Route("SecretaryInstituteSDIInspection")]
        public ActionResult<ApiResponse<object>> SecretaryInstituteSDIInspection(
     [FromQuery] int DistrictID,
     [FromQuery] int TalukaID,
     [FromQuery] int RegionID,
     [FromQuery] string FormStatus,
     [FromQuery] long InstituteID,
     [FromQuery] long userID,
        [FromQuery] int ResultTypeID
     )
        {
            if (string.IsNullOrEmpty(FormStatus))
            {
                return BadRequest(ApiResponse<object>.ErrorResponse(
                    "Form Status is required.", 400));
            }

            try
            {
                var result = _IInstituteBase.SecretaryInstituteSDIInspection(
                                DistrictID,
                                TalukaID,
                                RegionID,
                                FormStatus,
                                InstituteID,
                                userID,
                                ResultTypeID);

                if (result == null || result.Rows.Count == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse(
                        "No inspection data found.", 404));
                }

                var serializableData = BaseWorker.ConvertDataTableToList(result);

                return Ok(ApiResponse<object>.SuccessResponse(
                    serializableData,
                    "Inspection data retrieved successfully.",
                    200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SecretaryInstituteSDIInspection");

                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    ApiResponse<object>.ErrorResponse(
                        $"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("SecretaryInstituteSDIAffiliatio")]
        public ActionResult<ApiResponse<object>> SecretaryInstituteSDIAffiliatio(
     [FromQuery] int DistrictID,
     [FromQuery] int TalukaID,
     [FromQuery] int RegionID,
     [FromQuery] string FormStatus,
     [FromQuery] long InstituteID,
     [FromQuery] long userID,
     [FromQuery] int  ResultTypeID)
        {
            if (string.IsNullOrEmpty(FormStatus))
            {
                return BadRequest(ApiResponse<object>.ErrorResponse(
                    "Form Status is required.", 400));
            }

            try
            {
                var result = _IInstituteBase.SecretaryInstituteSDIAffiliatio(
                                DistrictID,
                                TalukaID,
                                RegionID,
                                FormStatus,
                                InstituteID,
                                userID,
                                ResultTypeID);

                if (result == null || result.Rows.Count == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse(
                        "No inspection data found.", 404));
                }

                var serializableData = BaseWorker.ConvertDataTableToList(result);

                return Ok(ApiResponse<object>.SuccessResponse(
                    serializableData,
                    "affiliation data retrieved successfully.",
                    200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SecretaryInstituteSDIAffiliation");

                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    ApiResponse<object>.ErrorResponse(
                        $"An error occurred: {ex.Message}", 500));
            }
        }













        [HttpPost]
        [Route("GetApprovedCourseUnitDetails")]
        public ActionResult<ApiResponse<DataSet>> GetApprovedCourseUnitDetails(
           [FromBody] InstituteInputEntity entity)
        {
            if (entity == null)
            {
                return BadRequest(ApiResponse<DataSet>.ErrorResponse(
                    "Request entity cannot be null.", 400));
            }

            try
            {
                var result = _IInstituteBase.GetCourseUnitDetailsForApprovalByCoureseID(entity);

                if (result == null || result.Tables.Count == 0)
                {
                    return NotFound(ApiResponse<DataSet>.ErrorResponse(
                        "No approved course data found.", 404));
                }

                return Ok(ApiResponse<DataSet>.SuccessResponse(
                    result, "Approved course list retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<DataSet>.ErrorResponse(
                        $"Internal server error: {ex.Message}", 500));
            }
        }

     

      

   

        [HttpPost]
        [Route("GetCourseUnitDetailsByCourseID")]
        public ActionResult<ApiResponse<DataSet>> GetCourseUnitDetailsByCourseID(
            [FromBody] InstituteInputEntity entity)
        {
            if (entity == null)
            {
                return BadRequest(ApiResponse<DataSet>.ErrorResponse(
                    "Request entity cannot be null.", 400));
            }

            try
            {
                var result = _IInstituteBase.GetCourseUnitDetailsForApprovalByCoureseID(entity);

                if (result == null || result.Tables.Count == 0)
                {
                    return NotFound(ApiResponse<DataSet>.ErrorResponse(
                        "No unit details found.", 404));
                }

                return Ok(ApiResponse<DataSet>.SuccessResponse(
                    result, "Course unit details retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<DataSet>.ErrorResponse(
                        $"Internal server error: {ex.Message}", 500));
            }
        }

      

        [HttpPost]
        [Route("SaveProposedCourse")]
        public ActionResult<ApiResponse<string>> SaveProposedCourse(
            [FromBody] ProposedCourseUnitDetailsEntity entity)
        {
            if (entity == null)
            {
                return BadRequest(ApiResponse<string>.ErrorResponse(
                    "Proposed course entity cannot be null.", 400));
            }

            try
            {
                var result = _IInstituteBase.SaveProposedCourseUnitDetails(entity);

                if (result.ToUpper() == "N")
                {
                    return BadRequest(ApiResponse<string>.ErrorResponse(
                        "Failed to save proposed course.", 400));
                }

                return Ok(ApiResponse<string>.SuccessResponse(
                    result, "Proposed course saved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>.ErrorResponse(
                        $"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("SaveSelfDeclarationPath")]
        public ActionResult<ApiResponse<string>> SaveSelfDeclarationPath(
            [FromBody] SaveSelfDeclarationRequest entity)
        {
            if (entity == null)
            {
                return BadRequest(ApiResponse<string>.ErrorResponse(
                    "self declaration entity cannot be null.", 400));
            }

            try
            {
                var result = _IInstituteBase.SaveSelfDeclarationPath(entity);

                if (result.ToUpper() == "N")
                {
                    return BadRequest(ApiResponse<string>.ErrorResponse(
                        "Failed to upload document.", 400));
                }

                return Ok(ApiResponse<string>.SuccessResponse(
                    result, "Upload document saved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>.ErrorResponse(
                        $"Internal server error: {ex.Message}", 500));
            }
        }


        [HttpDelete]
        [Route("DeleteProposedCourse")]
        public ActionResult<ApiResponse<string>> DeleteProposedCourse(
            [FromBody] ProposedCourseUnitDetailsEntity entity)
        {
            if (entity == null)
            {
                return BadRequest(ApiResponse<string>.ErrorResponse(
                    "Delete entity cannot be null.", 400));
            }

            try
            {
                var result = _IInstituteBase.DeleteProposedCourseUnitDetails(entity);

                if (result.ToUpper() == "N")
                {
                    return BadRequest(ApiResponse<string>.ErrorResponse(
                        "Failed to delete proposed course.", 400));
                }

                return Ok(ApiResponse<string>.SuccessResponse(
                    result, "Proposed course deleted successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>.ErrorResponse(
                        $"Internal server error: {ex.Message}", 500));
            }
        }


        [HttpPost]
        [Route("GetShortTermApprovedCourseUnitDetails")]
        public ActionResult<ApiResponse<DataSet>> GetShortTermApprovedCourseUnitDetails(
    [FromBody] InstituteInputEntity entity)
        {
            if (entity == null)
            {
                return BadRequest(ApiResponse<DataSet>.ErrorResponse(
                    "Institute input entity cannot be null.", 400));
            }

            try
            {
                var result = _IInstituteBase.GetShortTermApprovedCourseUnitDetails(entity);

                if (result == null || result.Tables.Count == 0 || result.Tables[0].Rows.Count == 0)
                {
                    return NotFound(ApiResponse<DataSet>.ErrorResponse(
                        "No short term approved course unit details found.", 404));
                }

                return Ok(ApiResponse<DataSet>.SuccessResponse(
                    result, "Short term approved course unit details retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<DataSet>.ErrorResponse(
                        $"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("GetSTTCourseUnitDetailsForApprovalByCoureseID")]
        public ActionResult<ApiResponse<DataSet>> GetSTTCourseUnitDetailsForApprovalByCoureseID(
    [FromBody] InstituteInputEntity entity)
        {
            if (entity == null)
            {
                return BadRequest(ApiResponse<DataSet>.ErrorResponse(
                    "Institute input entity cannot be null.", 400));
            }

            try
            {
                var result = _IInstituteBase.GetSTTCourseUnitDetailsForApprovalByCoureseID(entity);

                if (result == null || result.Tables.Count == 0 || result.Tables[0].Rows.Count == 0)
                {
                    return NotFound(ApiResponse<DataSet>.ErrorResponse(
                        "No STT course unit details found for approval.", 404));
                }

                return Ok(ApiResponse<DataSet>.SuccessResponse(
                    result,
                    "STT course unit details for approval retrieved successfully.",
                    200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetSTTCourseUnitDetailsForApprovalByCoureseID");

                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<DataSet>.ErrorResponse(
                        $"Internal server error: {ex.Message}", 500));
            }
        }


        [HttpPost]
        [Route("SaveShortTermProposedCourseUnitDetails")]
        public ActionResult<ApiResponse<string>> SaveShortTermProposedCourseUnitDetails(
    [FromBody] ProposedCourseUnitDetailsEntity entity)
        {
            if (entity == null)
            {
                return BadRequest(ApiResponse<string>.ErrorResponse(
                    "Short term proposed course entity cannot be null.", 400));
            }

            try
            {
                var result = _IInstituteBase.SaveShortTermProposedCourseUnitDetails(entity);

                if (result.ToUpper() == "N")
                {
                    return BadRequest(ApiResponse<string>.ErrorResponse(
                        "Failed to save short term proposed course unit details. Please try again.", 400));
                }

                return Ok(ApiResponse<string>.SuccessResponse(
                    result,
                    "Short term proposed course unit details saved successfully.",
                    200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveShortTermProposedCourseUnitDetails");

                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>.ErrorResponse(
                        $"Internal server error: {ex.Message}", 500));
            }
        }



        [HttpDelete]
        [Route("DeleteShortTermProposedCourseUnitDetails")]
        public ActionResult<ApiResponse<string>> DeleteShortTermProposedCourseUnitDetails(
    [FromBody] ProposedCourseUnitDetailsEntity entity)
        {
            if (entity == null)
            {
                return BadRequest(ApiResponse<string>.ErrorResponse(
                    "Short term proposed course entity cannot be null.", 400));
            }

            try
            {
                var result = _IInstituteBase.DeleteShortTermProposedCourseUnitDetails(entity);

                if (result.ToUpper() == "N")
                {
                    return BadRequest(ApiResponse<string>.ErrorResponse(
                        "Failed to delete short term proposed course unit details. Please try again.", 400));
                }

                return Ok(ApiResponse<string>.SuccessResponse(
                    result,
                    "Short term proposed course unit details deleted successfully.",
                    200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "DeleteShortTermProposedCourseUnitDetails");

                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>.ErrorResponse(
                        $"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("GetShortTermProposedCourseUnitDetails")]
        public ActionResult<ApiResponse<DataSet>> GetShortTermProposedCourseUnitDetails(
    [FromBody] InstituteInputEntity entity)
        {
            if (entity == null)
            {
                return BadRequest(ApiResponse<DataSet>.ErrorResponse(
                    "Institute input entity cannot be null.", 400));
            }

            try
            {
                var result = _IInstituteBase.GetShortTermProposedCourseUnitDetails(entity);

                if (result == null || result.Tables.Count == 0 || result.Tables[0].Rows.Count == 0)
                {
                    return NotFound(ApiResponse<DataSet>.ErrorResponse(
                        "No short term proposed course unit details found.", 404));
                }

                return Ok(ApiResponse<DataSet>.SuccessResponse(
                    result,
                    "Short term proposed course unit details retrieved successfully.",
                    200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetShortTermProposedCourseUnitDetails");

                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<DataSet>.ErrorResponse(
                        $"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("GetShortTermApprovedCourseFees")]
        public ActionResult<ApiResponse<DataTable>> GetShortTermApprovedCourseFees(
    [FromBody] InstituteInputEntity entity)
        {
            if (entity == null)
            {
                return BadRequest(ApiResponse<DataTable>.ErrorResponse(
                    "Institute input entity cannot be null.", 400));
            }

            try
            {
                var result = _IInstituteBase.GetShortTermApprovedCourseFees(entity);

                if (result == null || result.Rows.Count == 0)
                {
                    return NotFound(ApiResponse<DataTable>.ErrorResponse(
                        "No short term approved course fee details found.", 404));
                }

                return Ok(ApiResponse<DataTable>.SuccessResponse(
                    result,
                    "Short term approved course fee details retrieved successfully.",
                    200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetShortTermApprovedCourseFees");

                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<DataTable>.ErrorResponse(
                        $"Internal server error: {ex.Message}", 500));
            }
        }
        [HttpPost]
[Route("SaveCourseTrainingFee")]
public ActionResult<ApiResponse<string>> SaveCourseTrainingFee(
    [FromBody] TrainingFeeModel model)
{
    if (model == null)
    {
        return BadRequest(ApiResponse<string>.ErrorResponse(
            "Invalid input data.", 400));
    }

    try
    {
        var result = _IInstituteBase.SaveCourseTrainingFee(
            model.actionType,
            model.id,
            model.trainingFeeID,
            model.withPlacement,
            model.withoutPlacement,
            model.userName,
            model.userIpAddress
        );

        if (string.IsNullOrEmpty(result) || result.ToUpper() == "N")
        {
            return BadRequest(ApiResponse<string>.ErrorResponse(
                "Data has not been saved. Please try again.", 400));
        }

        return Ok(ApiResponse<string>.SuccessResponse(
            result,
            "Course training fee saved successfully.",
            200));
    }
    catch (Exception ex)
    {
        CommonHelper.SaveException(ex.Message, "SaveCourseTrainingFee");

        return StatusCode(StatusCodes.Status500InternalServerError,
            ApiResponse<string>.ErrorResponse(
                $"Internal server error: {ex.Message}", 500));
    }
}
        


        //Inspection page 
        [HttpGet("GetInstituteInspectionDash/{instituteId}/{UserTypeID}")]
        public IActionResult GetInstituteInspectionDash(long instituteId , int UserTypeID)
        {
            try
            {
                if (instituteId <= 0)
                {
                    return BadRequest(ApiResponse<string>.ErrorResponse(
                        "Invalid Institute ID.", 400));
                }

                DataTable result = _IInstituteBase.GetInstituteInspectionDash(instituteId, "", UserTypeID);

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
                CommonHelper.SaveException(ex.Message, "GetInstituteInspectionDash");

                return StatusCode(500, ApiResponse<string>.ErrorResponse(
                    ex.Message, 500));
            }
        }

        [HttpPost("UpdateInstituteInspectionVerificationStatus")]
        public IActionResult UpdateInstituteInspectionVerificationStatus(
        [FromBody] InspectionVerificationEntity entity)
        {
            if (entity == null)
            {
                return BadRequest(ApiResponse<string>.ErrorResponse(
                    "Input data is required.", 400));
            }

            try
            {
                string result = _IInstituteBase.UpdateInstituteInspectionVerificationStatus(entity);

                if (result.ToUpper() == "Y")
                {
                    return Ok(ApiResponse<string>.SuccessResponse(
                        result,
                        "Verification status updated successfully.",
                        200));
                }
                else if (result.ToUpper() == "N")
                {
                    return BadRequest(ApiResponse<string>.ErrorResponse(

                        "Inspection Date Scheduled by DVETO Needed."
                       ));
                }

                return BadRequest(ApiResponse<string>.ErrorResponse(
                    "Failed to update verification status.",
                    400));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UpdateInstituteInspectionVerificationStatus");

                return StatusCode(500, ApiResponse<string>.ErrorResponse(
                    ex.Message, 500));
            }
        }





        [HttpGet("SearchInstitutes")]
        public IActionResult SearchInstitutes(Int32 DistrictID, Int32 TalukaID, Int32 RegionID, string FormStatus, Int64 InstituteID)

        {
            try
            {
                if (string.IsNullOrEmpty(FormStatus))
                {
                    // default to 'A' (All) when form status is not supplied
                    FormStatus = "A";
                }

                DataTable result = _IInstituteBase.SearchInstitutes(DistrictID, TalukaID, RegionID, FormStatus, InstituteID);

                if (result == null || result.Rows.Count == 0)
                {
                    return Ok(ApiResponse<object>.SuccessResponse(new List<object>(), "No records found.", 200));
                }

                var serializableData = BaseWorker.ConvertDataTableToList(result);

                return Ok(ApiResponse<object>.SuccessResponse(serializableData, "Institute data retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SearchInstitutes", InstituteID.ToString());
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }

        }




        [HttpGet("SearchSDILOI")]
       public IActionResult SearchSDILOI(int DistrictID, int TalukaID, int RegionID, string FormStatus, long InstituteID)
{
    try
    {
        if (string.IsNullOrEmpty(FormStatus))
        {
            FormStatus = "A";
        }

        var result = _IInstituteBase.SearchSDILOI(DistrictID, TalukaID, RegionID, FormStatus, InstituteID);

        if (result == null || result.Rows.Count == 0)
        {
            return Ok(ApiResponse<object>.SuccessResponse(new List<object>(), "No records found.", 200));
        }

        var serializableData = BaseWorker.ConvertDataTableToList(result);

        return Ok(ApiResponse<object>.SuccessResponse(serializableData, "SDI LOI data retrieved successfully.", 200));
    }
    catch (Exception ex)
    {
        CommonHelper.SaveException(ex.Message, "SearchSDILOI", InstituteID.ToString());
        return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
    }
}

        [HttpGet("GetProposedCourseofGroupCourseApprovalGroupWise")]
        public IActionResult GetProposedCourseofGroupCourseApprovalGroupWise(int approvalGroupId)
        {
            try
            {
                //if(approvalGroupId==-1)
                //{
                //    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid approval group Id.", 400));
                //}
                var result = _IInstituteBase.GetProposedCourseofGroupCourseApprovalGroupWise(approvalGroupId);
                if (result == null || result.Rows.Count == 0)
                {
                    return Ok(ApiResponse<object>.SuccessResponse(new List<object>(), "No records found.", 200));
                }
                return Ok(ApiResponse<object>.SuccessResponse(result, "GroupWise courses fetched successfully"));

            }
            catch(Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetProposedCourseofGroupCourseApprovalGroupWise", approvalGroupId.ToString());
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet("GetInstituteDash")]
        public IActionResult GetInstituteDash(long InstituteID, string InstituteCode)
        {
            try
            {
                var result = _IInstituteBase.GetInstituteDash(InstituteID, InstituteCode);

                if (result == null || result.Tables.Count == 0)
                {
                    return NotFound(new { Message = "No data found" });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    Message = "Error while fetching institute dashboard",
                    Error = ex.Message
                });
            }
        }
        [HttpPost]
        [Route("update-verification-status")]
        public IActionResult UpdateVerificationStatus([FromBody] UpdateVerificationRequest request)
        {
            try
            {
                if (request == null || request.InstituteID <= 0)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Invalid request data"
                    });
                }

                var result = _IInstituteBase.UpdateInstituteVerificationStatus(
                    request.InstituteID,
                    request.Remark,
                    request.Status,          
                    request.PageCode,        
                    request.CreatedBy,
                    request.IpAddress
                );

                if (result == "Y")
                {
                    return Ok(new
                    {
                        success = true,
                        message = "Status updated successfully"
                    });
                }
                else
                {
                    return Ok(new
                    {
                        success = false,
                        message = result
                    });
                }
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
        [HttpPost]
        [Route("UpdateProposedCourseUnitDetails")]
        public IActionResult UpdateProposedCourseUnitDetails(
     [FromBody] UpdateProposedCourseUnitsRequest request)
        {
            try
            {
                if (request == null ||
                    request.InstituteID <= 0 ||
                    request.ProposedCourses == null ||
                    request.ProposedCourses.Count == 0)
                {
                    return BadRequest(ApiResponse<object>
                        .ErrorResponse("Invalid request data.", 400));
                }

                string xml = ConvertProposedCourseToXml(request.ProposedCourses);

                var result = _IInstituteBase.UpdateProposedCourseUnitDetails(
                    request.InstituteID,
                    xml,
                    request.CreatedBy,
                    request.IpAddress);

                if (result == "Y")
                {
                    return Ok(ApiResponse<string>.SuccessResponse(
                        result,
                        "Proposed course units updated successfully.", 200));
                }
                else
                {
                    return BadRequest(ApiResponse<string>.ErrorResponse(
                        result ?? "Failed to update.", 400));
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(
                    ex.Message,
                    "UpdateProposedCourseUnitDetails");

                return StatusCode(500,
                    ApiResponse<object>.ErrorResponse(
                        ex.Message, 500));
            }
        }

        private string ConvertProposedCourseToXml(
            List<ProposedCourseUnitDetailsEntity> courses)
        {
            var serializer = new XmlSerializer(
                typeof(List<ProposedCourseUnitDetailsEntity>),
                new XmlRootAttribute("ArrayOfProposedCourseUnitDetailsEntity"));

            var ns = new XmlSerializerNamespaces();
            ns.Add("", "");

            using var sw = new StringWriter();
            using var xw = XmlWriter.Create(sw,
                new XmlWriterSettings
                {
                    OmitXmlDeclaration = true
                });

            serializer.Serialize(xw, courses, ns);
            return sw.ToString();
        }
        [HttpGet]
        [Route("GetUnitByInstitute")]
        public IActionResult GetUnitByInstitute(long instituteId)
        {
            try
            {
                if (instituteId <= 0)
                {
                    return BadRequest(new { Status = "Error", Message = "Invalid Institute ID." });
                }
                DataSet ds = _IInstituteBase.GetUnitByInstitute(instituteId);
                if (ds == null || ds.Tables.Count == 0 || ds.Tables[0].Rows.Count == 0)
                {
                    return NotFound(new { Status = "Error", Message = "No units found for the given Institute ID." });
                }
                return Ok(new { Status = "Success", Message = "Units retrieved successfully.", Data = ds });
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetUnitByInstitute", instituteId.ToString());
                return StatusCode(500, new { Status = "Error", Message = $"An error occurred: {ex.Message}" });
            }

            }

        [HttpGet]
        [Route("GetBatchDetailsByInstitute")]
        public IActionResult GetBatchDetailsByInstitute(long instituteId)
        {
            try
            {
                if(instituteId<=0)
                {
                    return BadRequest(new { Status = "Error", Message = "Invalid Institute ID." });
                }
                DataTable result = _IInstituteBase.GetBatchDetailsByInstitute(instituteId);
                if (result == null || result.Rows.Count == 0)
                {
                    return Ok(new
                    {
                        Status = "Success",
                        Message = "Batch Details not found."
                    });
                }

                return Ok(new
                {
                    Status = "Success",
                    StatusCode = 200,
                    Message = "Batch Details retrieved successfully.",
                    Data = result
                });
            }
            catch(Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetBatchDetailsByInstitute", instituteId.ToString());
                return StatusCode(500, new { Status = "Error", Message = $"An error occurred: {ex.Message}" });
            }
        }

        [HttpGet]
        [Route("GETBatchDetails")]
        public IActionResult GETBatchDetails(long instituteId, long courseId, int shiftId, int unitNo)
        {
            try
            {
                if (instituteId <= 0)
                {
                    return BadRequest(new { Status = "Error", Message = "Invalid Institute ID." });
                }
                DataSet ds = _IInstituteBase.GETBatchDetails(instituteId, courseId, shiftId, unitNo);
                if (ds == null || ds.Tables.Count == 0 || ds.Tables[0].Rows.Count == 0)
                {
                    return NotFound(new { Status = "Error", Message = "No units found for the given Institute ID." });
                }
                return Ok(new { Status = "Success", Message = "Units retrieved successfully.", Data = ds });
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetUnitByInstitute", instituteId.ToString());
                return StatusCode(500, new { Status = "Error", Message = $"An error occurred: {ex.Message}" });
            }

        }

        [HttpPut]
        [Route("UpdateBatchDetails")]
        public IActionResult UpdateBatchDetails(BatchDetailsEntity entity)
        {
            try
            {
                if (entity == null)
                {
                    return BadRequest(new { Status = "Error", Message = "Search criteria is missing." });
                }
                string result = _IInstituteBase.UpdateBatchDetails(entity);
                return Ok(new
                {
                    Status = "Success",
                    StatusCode = 200,
                    Message = "Success story saved successfully.",
                    Data = result
                });

            }
            catch(Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UpdateBatchDetails");
                return StatusCode(500, new { Status = "Error", Message = $"An error occurred: {ex.Message}" });
            }
        }

        [HttpGet("is-course-eligible-for-application")]
        public IActionResult IsCourseEligibleForApplication(long courseId)
        {
            try
            {
                if (courseId <= 0)
                {
                    return BadRequest(new { Status = "Error", Message = "Course Id is missing," });
                }
                var result = _IInstituteBase.IsCourseEligibleForApplication(courseId);

                return Ok(new
                {
                    Status = "Success",
                    StatusCode = 200,
                    Message = "Eligibility status retrieved successfully.",
                    Data = result
                });
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "IsCourseEligible");
                return StatusCode(500, new { Status = "Error", Message = $"An error occurred: {ex.Message}" });
            }
        }









        // ══════════════════════════════════════════════════════
        // ELECTION DUTY  RO
        // ══════════════════════════════════════════════════════

        
        [HttpGet]
        [Route("GetElectionDutyList")]
        public ActionResult<ApiResponse<List<ElectionDutyListEntity>>> GetElectionDutyList([FromQuery] int UserID)
        {
            try
            {
                var result = _IInstituteBase.GetElectionDutyList(UserID);

                if (result == null || result.Count == 0)
                    return Ok(ApiResponse<List<ElectionDutyListEntity>>
                        .SuccessResponse(
                            new List<ElectionDutyListEntity>(),
                            "No election duty records found.", 200));

                return Ok(ApiResponse<List<ElectionDutyListEntity>>
                    .SuccessResponse(result,
                        "Election duty list retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetElectionDutyList");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<List<ElectionDutyListEntity>>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        
        [HttpGet]
        [Route("GetConstituencyByDistrict")]
        public ActionResult<ApiResponse<List<ConstituencyEntity>>> GetConstituencyByDistrict(
            [FromQuery] int districtID)
        {
            if (districtID <= 0)
                return BadRequest(ApiResponse<List<ConstituencyEntity>>
                    .ErrorResponse("District ID must be greater than zero.", 400));

            try
            {
                var result = _IInstituteBase.GetConstituencyByDistrict(districtID);

                if (result == null || result.Count == 0)
                    return Ok(ApiResponse<List<ConstituencyEntity>>
                        .SuccessResponse(
                            new List<ConstituencyEntity>(),
                            "No constituencies found for this district.", 200));

                return Ok(ApiResponse<List<ConstituencyEntity>>
                    .SuccessResponse(result,
                        "Constituencies retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetConstituencyByDistrict");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<List<ConstituencyEntity>>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        
        [HttpPost]
        [Route("SaveElectionDutyStaff")]
        public ActionResult<ApiResponse<string>> SaveElectionDutyStaff(
            [FromBody] ElectionDutyStaffEntity entity)
        {
            if (entity == null)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Election duty data cannot be null.", 400));

            if (entity.StaffID <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Staff ID must be greater than zero.", 400));

            //if (entity.Deputations == null || entity.Deputations.Count == 0)
            //    return BadRequest(ApiResponse<string>
            //        .ErrorResponse("At least one deputation period is required.", 400));

            try
            {
                var result = _IInstituteBase.SaveElectionDutyStaff(entity);

                if (result != "Success")
                    return BadRequest(ApiResponse<string>
                        .ErrorResponse(result, 400));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "Election duty saved successfully.",
                        "Election duty saved successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveElectionDutyStaff");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        
            [HttpPost]
            [Route("UpdateElectionDutyDeputation")]
            public ActionResult<ApiResponse<string>> UpdateElectionDutyDeputation(
                [FromBody] ElectionDutyDeputationEntity entity)
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>
                        .ErrorResponse("Deputation data cannot be null.", 400));

                if (entity.DeputationID <= 0)
                    return BadRequest(ApiResponse<string>
                        .ErrorResponse("Deputation ID must be greater than zero.", 400));

                try
                {
                    var result = _IInstituteBase.UpdateElectionDutyDeputation(entity);

                    if (result != "Success")
                        return BadRequest(ApiResponse<string>
                            .ErrorResponse(result, 400));

                    return Ok(ApiResponse<string>
                        .SuccessResponse(
                            "Deputation updated successfully.",
                            "Deputation updated successfully.", 200));
                }
                catch (Exception ex)
                {
                    CommonHelper.SaveException(ex.Message, "UpdateElectionDutyDeputation");
                    return StatusCode(StatusCodes.Status500InternalServerError,
                        ApiResponse<string>
                            .ErrorResponse($"Internal server error: {ex.Message}", 500));
                }
            }

        
            [HttpPost]
            [Route("DeleteElectionDutyStaff")]
            public ActionResult<ApiResponse<string>> DeleteElectionDutyStaff(
                [FromBody] DeleteElectionDutyStaffEntity entity)
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>
                        .ErrorResponse("Delete request cannot be null.", 400));

                if (entity.ElectionDutyStaffID <= 0)
                    return BadRequest(ApiResponse<string>
                        .ErrorResponse("Election Duty Staff ID must be greater than zero.", 400));

                try
                {
                    var result = _IInstituteBase.DeleteElectionDutyStaff(entity);

                    if (result != "Success")
                        return BadRequest(ApiResponse<string>
                            .ErrorResponse(result, 400));

                    return Ok(ApiResponse<string>
                        .SuccessResponse(
                            "Staff removed from election duty successfully.",
                            "Staff removed from election duty successfully.", 200));
                }
                catch (Exception ex)
                {
                    CommonHelper.SaveException(ex.Message, "DeleteElectionDutyStaff");
                    return StatusCode(StatusCodes.Status500InternalServerError,
                        ApiResponse<string>
                            .ErrorResponse($"Internal server error: {ex.Message}", 500));
                }
            }

       
        [HttpPost]
        [Route("DeleteElectionDutyDeputation")]
        public ActionResult<ApiResponse<string>> DeleteElectionDutyDeputation(
            [FromBody] DeleteElectionDutyDeputationEntity entity)
        {
            if (entity == null)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Delete request cannot be null.", 400));

            if (entity.DeputationID <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Deputation ID must be greater than zero.", 400));

            try
            {
                var result = _IInstituteBase.DeleteElectionDutyDeputation(entity);

                if (result != "Success")
                    return BadRequest(ApiResponse<string>
                        .ErrorResponse(result, 400));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "Deputation deleted successfully.",
                        "Deputation deleted successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "DeleteElectionDutyDeputation");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }


        //report 
        [HttpGet]
        [Route("ReportGetElectionDutyList")]
        public ActionResult<ApiResponse<List<ElectionDutyListEntity>>> Report_GetElectionDutyList(
            [FromQuery] int RegionID  ,
            [FromQuery] int DistrictID,
            [FromQuery] int TalukaID , 
            [FromQuery] int StaffID





            )
        {
            try
            {
                var result = _IInstituteBase.Report_GetElectionDutyList(
                    RegionID,
                    DistrictID,
                    TalukaID,
                    StaffID




                   );

                if (result == null || result.Count == 0)
                    return Ok(ApiResponse<List<ElectionDutyListEntity>>
                        .SuccessResponse(
                            new List<ElectionDutyListEntity>(),
                            "No election duty records found.", 200));

                return Ok(ApiResponse<List<ElectionDutyListEntity>>
                    .SuccessResponse(result,
                        "Election duty list retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "Report_GetElectionDutyList");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<List<ElectionDutyListEntity>>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetCourseSecurityFeeDetails")]
        public IActionResult Institute_GetCourseInspectionFeeDetails(int InstituteID, int CourseID, int ApprovalID)
        {
            try
            {
                if (InstituteID <= 0)
                {
                    return BadRequest(new { Status = "Error", Message = "Invalid Institute ID." });
                }
                DataTable result = _IInstituteBase.Institute_GetCourseInspectionFeeDetails(InstituteID, CourseID, ApprovalID);
                if (result == null || result.Rows.Count == 0)
                {
                    return Ok(new
                    {
                        Status = "Success",
                        Message = "Inspection  Details not found."
                    });
                }

                return Ok(new
                {
                    Status = "Success",
                    StatusCode = 200,
                    Message = "Inspection Details retrieved successfully.",
                    Data = result
                });
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetCourseInspectionFeeDetails", InstituteID.ToString());
                return StatusCode(500, new { Status = "Error", Message = $"An error occurred: {ex.Message}" });
            }
        }
        [HttpGet]
        [Route("GetCourseSecurityFeeDetail")]
        public IActionResult Institute_GetCourseSecurityFeeDetails(int InstituteID)
        {
            try
            {
                if (InstituteID <= 0)
                {
                    return BadRequest(new { Status = "Error", Message = "Invalid Institute ID." });
                }
                DataTable result = _IInstituteBase.Institute_GetCourseSecurityFeeDetails(InstituteID);
                _feeService.GetFailedTransactionForAPICheck(InstituteID);


                if (result == null || result.Rows.Count == 0)
                {
                    return Ok(new
                    {
                        Status = "Success",
                        Message = "SecurityFee Details not found."
                    });
                }

                return Ok(new
                {
                    Status = "Success",
                    StatusCode = 200,
                    Message = "SecurityFee Details retrieved successfully.",
                    Data = result
                });
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetCourseSecurityFeeDetails", InstituteID.ToString());
                return StatusCode(500, new { Status = "Error", Message = $"An error occurred: {ex.Message}" });
            }
        }

        // verification status for inspection
        [HttpGet("CheckVerificationEligibility")]
        public IActionResult CheckVerificationEligibility(long instituteId)
        {
            if (instituteId <= 0)
            {
                return BadRequest(ApiResponse<string>.ErrorResponse(
                    "Invalid Institute ID.", 400));
            }

            try
            {
                var entity = new InstituteInput
                {
                    InstituteID = instituteId
                };

                var eligibility = _IInstituteBase.CheckVerificationEligibility(entity);

                return Ok(ApiResponse<VerificationEligibilityEntity>.SuccessResponse(
                    eligibility,
                    "Verification eligibility checked successfully.",
                    200));
            }
            catch (Exception ex)
            {
                return StatusCode(500,
                    ApiResponse<string>.ErrorResponse(ex.Message, 500));
            }
        }

        [HttpPost("RequestVerification")]
        public IActionResult RequestVerification([FromBody] InspectionRequestEntity entity)
        {
            if (entity == null)
                return BadRequest(ApiResponse<string>.ErrorResponse("Request data is required.", 400));

            if (entity.InstituteID <= 0)
                return BadRequest(ApiResponse<string>.ErrorResponse("Invalid Institute ID.", 400));

            if (string.IsNullOrWhiteSpace(entity.UserLoginID))
                return BadRequest(ApiResponse<string>.ErrorResponse("UserLoginID is required.", 400));

            try
            {
                var result = _IInstituteBase.RequestVerification(entity);

                if (!result.IsSuccess)
                    return BadRequest(ApiResponse<string>.ErrorResponse(result.Message, 400));

                return Ok(ApiResponse<string>.SuccessResponse(
                    result.Message,
                    "Verification request submitted successfully.",
                    200));
            }
            catch (Exception ex)
            {
                return StatusCode(500,
                    ApiResponse<string>.ErrorResponse(ex.Message, 500));
            }
        }

        [HttpPost("WithdrawVerification")]
        public IActionResult WithdrawVerification([FromBody] InspectionRequestEntity entity)
        {
            if (entity == null)
                return BadRequest(ApiResponse<string>.ErrorResponse("Withdraw data is required.", 400));

            if (entity.InstituteID <= 0)
                return BadRequest(ApiResponse<string>.ErrorResponse("Invalid Institute ID.", 400));

            if (string.IsNullOrWhiteSpace(entity.UserLoginID))
                return BadRequest(ApiResponse<string>.ErrorResponse("UserLoginID is required.", 400));

            try
            {
                var result = _IInstituteBase.WithdrawVerification(entity);

                if (!result.IsSuccess)
                    return BadRequest(ApiResponse<string>.ErrorResponse(result.Message, 400));

                return Ok(ApiResponse<string>.SuccessResponse(
                    result.Message,
                    "Verification request withdrawn successfully.",
                    200));
            }
            catch (Exception ex)
            {
                return StatusCode(500,
                    ApiResponse<string>.ErrorResponse(ex.Message, 500));
            }
        }


        [HttpPost]
        [Route("GenerateInstituteCode")]
        public IActionResult SDI_GenerateInstituteCode(
    [FromQuery] long instituteID,
    [FromQuery] string msbvCollegeID,
    [FromQuery] string IpAddress
            
            )
        {
            try
            {
                if (instituteID <= 0 || string.IsNullOrWhiteSpace(msbvCollegeID))
                {
                    return BadRequest(
                        ApiResponse<string>.ErrorResponse(
                            "Invalid request data.",
                            400));
                }

                var result = _IInstituteBase.SDI_GenerateInstituteCode(
                    instituteID,
                    msbvCollegeID,
                    IpAddress);

                if (result == "Y")
                {
                    return Ok(
                        ApiResponse<string>.SuccessResponse(
                            result,
                            "Institute Code generated successfully.",
                            200));
                }

                return BadRequest(
                    ApiResponse<string>.ErrorResponse(
                        result,
                        400));
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    ApiResponse<string>.ErrorResponse(ex.Message, 500));
            }
        }

        [HttpGet]
        [Route("GetInstituteCodeDetails")]
        public IActionResult SDI_GetInstituteCodeDetails(int InstituteID)        {
            try
            {
                if (InstituteID <= 0)
                {
                    return BadRequest(new { Status = "Error", Message = "Invalid Institute ID." });
                }
                DataTable result = _IInstituteBase.SDI_GetInstituteCodeDetails(InstituteID);
                if (result == null || result.Rows.Count == 0)
                {
                    return Ok(new
                    {
                        Status = "Success",
                        Message = "InstituteCodeDetails Details not found."
                    });
                }

                return Ok(new
                {
                    Status = "Success",
                    StatusCode = 200,
                    Message = "GetInstituteCodeDetails Details retrieved successfully.",
                    Data = result
                });
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SDI_GetInstituteCodeDetails", InstituteID.ToString());
                return StatusCode(500, new { Status = "Error", Message = $"An error occurred: {ex.Message}" });
            }
        }








        [HttpGet]
        [Route("SecretaryDVETOInstituteStatus")]
        public ActionResult<ApiResponse<object>> SecretaryDVETOInstituteStatus(
    [FromQuery] int DistrictID,
    [FromQuery] int TalukaID,
    [FromQuery] int RegionID,
    [FromQuery] string FormStatus,
    [FromQuery] long InstituteID,
    [FromQuery] int ResultTypeID,
    [FromQuery] long userID = -1)
        {
            if (string.IsNullOrEmpty(FormStatus))
            {
                return BadRequest(ApiResponse<object>.ErrorResponse(
                    "Form Status is required.", 400));
            }

            try
            {
                var result = _IInstituteBase.SecretaryDVETOInstituteStatus(
                                DistrictID,
                                TalukaID,
                                RegionID,
                                FormStatus,
                                InstituteID,
                                ResultTypeID,
                                userID);

                if (result == null || result.Rows.Count == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse(
                        "No inspection data found.", 404));
                }

                var serializableData = BaseWorker.ConvertDataTableToList(result);

                return Ok(ApiResponse<object>.SuccessResponse(
                    serializableData,
                    "Inspection data retrieved successfully.",
                    200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SecretaryDVETOInstituteStatus");

                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    ApiResponse<object>.ErrorResponse(
                        $"An error occurred: {ex.Message}", 500));
            }
        }





        [HttpGet("GetApprovalOrdersByYear/{year}")]
        public IActionResult GetApprovalOrdersByYear(int year)
        {
            try
            {
                if (year <= 0)
                    return BadRequest(new { Status = "Error", Message = "Invalid year." });

                List<ApprovalOrderSummaryEntity> result = _IInstituteBase.GetApprovalOrdersByYear(year);

                return Ok(new
                {
                    Status = "Success",
                    StatusCode = 200,
                    Message = "Approval orders retrieved successfully.",
                    Data = result
                });
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetApprovalOrdersByYear");
                return StatusCode(500, new
                {
                    Status = "Error",
                    StatusCode = 500,
                    Message = "An error occurred while retrieving approval orders.",
                    Error = ex.Message
                });
            }
        }

        [HttpPost("SaveCourseApprovalOrder")]
        public IActionResult SaveCourseApprovalOrder([FromBody] SaveCourseApprovalOrderEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(new { Status = "Error", Message = "Request data is missing." });

                List<CourseApprovalOrderDetailEntity> result = _IInstituteBase.SaveCourseApprovalOrder(entity);

                return Ok(new
                {
                    Status = "Success",
                    StatusCode = 200,
                    Message = "Course approval order saved successfully.",
                    Data = result
                });
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveCourseApprovalOrder");
                return StatusCode(500, new
                {
                    Status = "Error",
                    StatusCode = 500,
                    Message = "An error occurred while saving the course approval order.",
                    Error = ex.Message
                });
            }
        }

        [HttpGet("GetCourseDetailsWithApprovalOrder/{collegeId}/{ipAddress}")]
        public IActionResult GetCourseDetailsWithApprovalOrder(long collegeId , string ipAddress)
        {
            try
            {
                if (collegeId <= 0)
                    return BadRequest(new { Status = "Error", Message = "Invalid CollegeID." });

                List<CourseDetailsWithApprovalOrderEntity> result = _IInstituteBase.GetCourseDetailsWithApprovalOrder(collegeId, ipAddress);

                return Ok(new
                {
                    Status = "Success",
                    StatusCode = 200,
                    Message = "Course details with approval order retrieved successfully.",
                    Data = result
                });
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetCourseDetailsWithApprovalOrder");
                return StatusCode(500, new
                {
                    Status = "Error",
                    StatusCode = 500,
                    Message = "An error occurred while retrieving course details.",
                    Error = ex.Message
                });
            }

          
        }

        [HttpGet("GetNewBatchDetails")]
        public IActionResult GetNewBatchDetails(
          long InstituteID,
          long CourseID,
          int ShiftID,
          int UnitNo)
        {
            try
            {
                var data = _IInstituteBase.GetNewBatchDetails(
                    InstituteID,
                    CourseID,
                    ShiftID,
                    UnitNo
                );

                if (data == null || data.Rows.Count == 0)
                {
                    return Ok(new
                    {
                        StatusCode = 200,
                        Message = "No batch details found.",
                        Data = new
                        {
                            Table = new List<object>()
                        }
                    });
                }

                return Ok(new
                {
                    StatusCode = 200,
                    Message = "Batch details fetched successfully.",
                    Data = new
                    {
                        Table = data
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    StatusCode = 500,
                    Message = ex.Message,
                    Data = (object)null
                });
            }
        }

        [HttpPost("SaveBatchDetails")]
        public IActionResult SaveBatchDetails([FromBody] BatchDetailsEntity entity)
        {
            try
            {
                if (entity == null)
                {
                    return BadRequest(new
                    {
                        Status = "Error",
                        Message = "Batch details cannot be null."
                    });
                }

                string result = _IInstituteBase.SaveBatchDetails(entity);

                return Ok(new
                {
                    Status = "Success",
                    StatusCode = 200,
                    Message = "Batch details saved successfully.",
                    Data = result
                });
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveBatchDetails");

                return StatusCode(500, new
                {
                    Status = "Error",
                    Message = $"An error occurred: {ex.Message}"
                });
            }
        }


        // green requirement 
        [HttpPost]
        [Route("SaveGreenFieldRequirement")]
        public ActionResult<ApiResponse<string>> SaveGreenFieldRequirement(
    [FromBody] GreenFieldRequirementEntity entity)
        {
            if (entity == null)
            {
                return BadRequest(ApiResponse<string>.ErrorResponse(
                    "Green field requirement entity cannot be null.", 400));
            }

            try
            {
                var result = _IInstituteBase.SaveGreenFieldRequirement(entity);

                if (result.ToUpper() == "N")
                {
                    return BadRequest(ApiResponse<string>.ErrorResponse(
                        "Failed to save green field requirement.", 400));
                }

                return Ok(ApiResponse<string>.SuccessResponse(
                    result,
                    "Green field requirement saved successfully.",
                    200));
            }
            catch (Exception ex)
            {
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    ApiResponse<string>.ErrorResponse(
                        $"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("GetGreenFieldRequirement")]
        public ActionResult<ApiResponse<DataSet>> GetGreenFieldRequirement(
    [FromBody] InstituteInputEntityForGreen entity)
        {
            if (entity == null)
            {
                return BadRequest(ApiResponse<DataSet>.ErrorResponse(
                    "Institute input entity cannot be null.", 400));
            }

            try
            {
                var result = _IInstituteBase.GetGreenFieldRequirement(entity);

                return Ok(ApiResponse<DataSet>.SuccessResponse(
                    result,
                    "Green field requirement fetched successfully.",
                    200));
            }
            catch (Exception ex)
            {
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    ApiResponse<DataSet>.ErrorResponse(
                        $"Internal server error: {ex.Message}", 500));
            }
        }

        //green lock status
        [HttpPost]
        [Route("SaveStatusGreenRequirement")]
        public ActionResult<ApiResponse<string>> SaveStatusGreenRequirement(
    [FromBody] StatusGreenRequirementRequest entity)
        {
            if (entity == null)
            {
                return BadRequest(
                    ApiResponse<string>.ErrorResponse(
                        "Status green requirement entity cannot be null.",
                        400));
            }

            try
            {
                var result =
                    _IInstituteBase.SaveStatusGreenRequirementAsync(entity);

                return Ok(
                    ApiResponse<string>.SuccessResponse(
                        result,
                        "Green field requirement status saved successfully.",
                        200));
            }
            catch (Exception ex)
            {
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    ApiResponse<string>.ErrorResponse(
                        $"Internal server error: {ex.Message}",
                        500));
            }
        }

        [HttpPost]
        [Route("GetStatusGreenRequirement")]
        public ActionResult<ApiResponse<DataTable>> GetStatusGreenRequirement(
    [FromBody] InstituteInputEntityForGreen entity)
        {
            if (entity == null)
            {
                return BadRequest(
                    ApiResponse<DataTable>.ErrorResponse(
                        "Institute input entity cannot be null.",
                        400));
            }

            try
            {
                var result =
                    _IInstituteBase.GetStatusGreenRequirementAsync(entity);

                return Ok(
                    ApiResponse<DataTable>.SuccessResponse(
                        result,
                        "Green field requirement status fetched successfully.",
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

        // unlock 
        [HttpPost]
        [Route("UnlockStatusGreenRequirement")]
        public ActionResult<ApiResponse<string>> UnlockStatusGreenRequirement(
    [FromBody] StatusGreenRequirementRequest entity)
        {
            if (entity == null)
            {
                return BadRequest(
                    ApiResponse<string>.ErrorResponse(
                        "Status green requirement entity cannot be null.",
                        400));
            }

            try
            {
                var result =
                    _IInstituteBase.UnlockStatusGreenRequirementAsync(entity);
                if (result == "N")
                {
                    return Ok(new
                    {
                        Result = 0,
                        Message = "No data found."
                    });
                }


                return Ok(
                    ApiResponse<string>.SuccessResponse(
                        result,
                        "Green field requirement status unlocked successfully.",
                        200));
            }
            catch (Exception ex)
            {
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    ApiResponse<string>.ErrorResponse(
                        $"Internal server error: {ex.Message}",
                        500));
            }
        }

        //bulk save data 

        [HttpPost]
        [Route("SaveGreenFieldRequirementBulk")]
        public ActionResult<ApiResponse<string>> SaveGreenFieldRequirementBulk(
    [FromBody] GreenFieldRequirementBulkEntity entity)
        {
            if (entity == null)
            {
                return BadRequest(
                    ApiResponse<string>.ErrorResponse(
                        "Green field requirement entity cannot be null.",
                        400));
            }

            if (entity.Rows == null || entity.Rows.Count == 0)
            {
                return BadRequest(
                    ApiResponse<string>.ErrorResponse(
                        "At least one course is required.",
                        400));
            }

            try
            {
                var result =
                    _IInstituteBase.SaveGreenFieldRequirementBulk(entity);

                if (string.IsNullOrWhiteSpace(result) ||
                    result.ToUpper() != "Y")
                {
                    return BadRequest(
                        ApiResponse<string>.ErrorResponse(
                            "Failed to save green field requirement.",
                            400));
                }

                return Ok(
                    ApiResponse<string>.SuccessResponse(
                        result,
                        "Green field requirement saved successfully.",
                        200));
            }
            catch (Exception ex)
            {
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    ApiResponse<string>.ErrorResponse(
                        $"Internal server error: {ex.Message}",
                        500));
            }
        }


        //  institute code details

        [HttpGet]
        [Route("GetInstituteRenewalDetails")]
        public IActionResult GetCourseRenewalDetails(int CollegeID)
        {
            try
            {
                if (CollegeID <= 0)
                {
                    return BadRequest(new { Status = "Error", Message = "Invalid College ID." });
                }
                DataTable result = _IInstituteBase.GetCourseRenewalDetails(CollegeID);
                if (result == null || result.Rows.Count == 0)
                {
                    return NotFound(new
                    {
                        Status = "Success",
                        Message = "No Active Course Renewal Details found."
                    });
                }

                return Ok(new
                {
                    Status = "Success",
                    StatusCode = 200,
                    Message = "GetCourseRenewalDetails Details retrieved successfully.",
                    Data = result
                });
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "Institute_GetCourseRenewalDetails", CollegeID.ToString());
                return StatusCode(500, new { Status = "Error", Message = $"An error occurred: {ex.Message}" });
            }
        }
    }

}

