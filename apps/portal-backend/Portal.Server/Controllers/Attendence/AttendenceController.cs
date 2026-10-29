using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Portal.Business.Interface.Attendance;
using Portal.Entities.Attendance;
using Portal.Entities.Attendence;
using Portal.Entities.FirebaseNotification;
using Portal.Entities.ResponseBody;
using System.Security.Claims;
using System.Text;

namespace Portal.Server.Controllers.Attendance
{
    [Route("api/[controller]")]
    [ApiController]
    //[Authorize]
    public class AttendanceController : ControllerBase
    {
        private readonly IAttendance _attendanceService;
        private readonly IPythonService _pythonService;

        public AttendanceController(IAttendance attendanceService, IPythonService pythonService)
        {
            _attendanceService = attendanceService ?? throw new ArgumentNullException(nameof(attendanceService));
            _pythonService = pythonService;
        }

        [HttpPost("pycheck")]
        public async Task<IActionResult> PyCheck([FromForm] PunchInRequest request)
        {
                var userId = GetCurrentUserId();
                var userTypeId = GetUserTypeId();
                if (userId <= 0)
                {
                    return BadRequest(ApiResponse<object>.ErrorResponse("Invalid User ID.", 400));
                }
                try
                {
                    //var ImageUrlResponse = await _pythonService.GetFaceEncodingFromImageUrl(ImageUrl);
                    //var ImageResponse = await _pythonService.GetFaceEncodingFromImage(Image);
                    //var RCompareesponse = await _pythonService.CompareEncodings(ImageUrlResponse.Data.ToString(), ImageResponse.Data.ToString());

                    //var response = await _pythonService.CheckIsHumanFace(Image);
                    var response = await _attendanceService.PunchIn(userId, request, GetClientIpAddress());
                    if (response.IsSuccess == false)
                    {
                        return StatusCode(response.StatusCode, ApiResponse<string>.ErrorResponse(response.Message, response.StatusCode));
                    }
                    return Ok(ApiResponse<object>.SuccessResponse(response.Data, "Face Re-enrolled successfully"));
                }
                catch (Exception ex)
                {
                    return StatusCode(500, ApiResponse<object>.ErrorResponse($"Pyheck failed: {ex.Message}", 500));
                }
        }

        #region Attendance Management

        [HttpPost("punch-in")]
        public async Task<IActionResult> PunchIn([FromForm] PunchInRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == 0)
                {
                    return BadRequest("User ID is required");
                }

                var response = await _attendanceService.PunchIn(userId, request, GetClientIpAddress());
                if (response.IsSuccess == false)
                {
                    return StatusCode(response.StatusCode, ApiResponse<string>.ErrorResponse(response.Message, response.StatusCode));
                }
                return Ok(ApiResponse<object>.SuccessResponse(response.Data, "PunchIn Sucessfull."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"Punch in failed: {ex.Message}", 500));
            }
        }

        [HttpPost("punch-out")]
        public async Task<IActionResult> PunchOut([FromForm] PunchOutRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == 0)
                {
                    return BadRequest("User ID is required");
                }

                var response = await _attendanceService.PunchOut(userId, request, GetClientIpAddress());
                if (response.IsSuccess == false)
                {
                    return StatusCode(response.StatusCode, ApiResponse<string>.ErrorResponse(response.Message, response.StatusCode));
                }
                return Ok(ApiResponse<object>.SuccessResponse(response.Data, "PunchOut SuccessFull"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"Punch out failed: {ex.Message}", 500));
            }
        }

        [HttpGet("today")]
        public IActionResult GetTodayAttendance()
        {
            var userId = GetCurrentUserId();
            if (userId == 0)
            {
                return BadRequest("User ID is required");
            }
            try
            {
                var result = _attendanceService.GetTodayAttendance(userId);
                if (result.IsSuccess == false)
                {
                    return BadRequest(ApiResponse<string>.ErrorResponse(result.Message, 404));
                }
                return Ok(ApiResponse<object>.SuccessResponse(result.Data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"Error: {ex.Message}", 500));
            }
        }

        [HttpGet("history")]
        public IActionResult GetAttendanceHistory([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == 0)
                {
                    return BadRequest("User ID is required");
                }
                var result = _attendanceService.GetAttendanceHistory(userId, startDate, endDate);
                return Ok(ApiResponse<object>.SuccessResponse(result, "Attendance history retrieved"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"Error: {ex.Message}", 500));
            }
        }

        [HttpGet("statistics/monthly")]
        public IActionResult GetMonthlyStatistics([FromQuery] int? year, [FromQuery] int? month)
        {
            var userId = GetCurrentUserId();
            if (userId == 0)
            {
                return BadRequest("User ID is required");
            }
            try
            {
                var result = _attendanceService.GetMonthlyStatistics(userId, year, month);
                if (result.IsSuccess == false)
                {
                    return BadRequest(ApiResponse<string>.ErrorResponse(result.Message, 404));
                }
                return Ok(ApiResponse<object>.SuccessResponse(result.Data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"Error: {ex.Message}", 500));
            }
        }

        [HttpGet("calendar")]
        public IActionResult GetAttendanceCalendar([FromQuery] int? year, [FromQuery] int? month)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == 0)
                {
                    return BadRequest("User ID is required");
                }
                var result = _attendanceService.GetAttendanceCalendar(userId, year, month);
                return Ok(ApiResponse<object>.SuccessResponse(result, "Attendance calendar retrieved"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"Error: {ex.Message}", 500));
            }
        }

        [HttpGet("statistics/weekly")]
        public IActionResult GetWeeklyStatistics()
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == 0)
                {
                    return BadRequest("User ID is required");
                }
                var result = _attendanceService.GetWeeklyStatistics(userId);
                return Ok(ApiResponse<object>.SuccessResponse(result, "Weekly statistics retrieved"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"Error: {ex.Message}", 500));
            }
        }


        [HttpGet("user-institute-location")]
        public IActionResult GetUserInstituteLocation()
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == 0)
                {
                    return BadRequest("User ID is required");
                }
                var result = _attendanceService.GetUserInstituteLocation(userId);
                return Ok(ApiResponse<object>.SuccessResponse(result, "Institute location retrieved"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"Error: {ex.Message}", 500));
            }
        }

        #endregion

        #region Face Recognition

        [HttpPost("face/enroll")]
        public async Task<IActionResult> EnrollFace([FromBody] FaceEnrollmentRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == 0)
                {
                    return BadRequest(ApiResponse<object>.ErrorResponse("Invalid User ID.", 400));
                }
                var response = await _attendanceService.EnrollFace(userId, request);
                if (response.IsSuccess == false)
                {
                    return StatusCode(response.StatusCode, ApiResponse<string>.ErrorResponse(response.Message, response.StatusCode));
                }
                return Ok(ApiResponse<object>.SuccessResponse(response.Data, "Face enrolled successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"Face enrollment failed: {ex.Message}", 500));
            }
        }

        [HttpPost("face/re-enroll")]
        public async Task<IActionResult> ReEnrollFace([FromBody] FaceEnrollmentRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == 0)
                {
                    return BadRequest("User ID is required");
                }
                var response = await _attendanceService.ReEnrollFace(userId, request);
                if (response.IsSuccess == false)
                {
                    return StatusCode(response.StatusCode, ApiResponse<string>.ErrorResponse(response.Message, response.StatusCode));
                }
                return Ok(ApiResponse<object>.SuccessResponse(response.Data, "Face Re-enrolled successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"Face re-enrollment failed: {ex.Message}", 500));
            }
        }


        [HttpGet("face/status")]
        public IActionResult GetFaceStatus()
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == 0)
                {
                    return BadRequest("User ID is required");
                }
                var result = _attendanceService.GetFaceEnrollmentStatus(userId);
                return Ok(ApiResponse<object>.SuccessResponse(result, "Face status retrieved"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"Error: {ex.Message}", 500));
            }
        }

        [HttpDelete("face/enrollment")]
        public IActionResult DeleteFaceEnrollment()
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == 0)
                {
                    return BadRequest("User ID is required");
                }
                _attendanceService.DeleteFaceEnrollment(userId);
                return Ok(ApiResponse<object>.SuccessResponse(null, "Face enrollment deleted"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"Error: {ex.Message}", 500));
            }
        }

        #endregion

        #region User Profile

        [HttpGet("dashboard")]
        public IActionResult GetUserProfile()
        {
            var userId = GetCurrentUserId();
            var userTypeId = GetUserTypeId();
            if (userId <= 0 || userTypeId <= 0)
            {
                return BadRequest(ApiResponse<object>.ErrorResponse("Invalid Candidate ID or User Type ID.", 400));
            }
            try
            {
                var response = _attendanceService.Dashboard(userId, userTypeId);
                if (response.IsSuccess == false)
                {
                    return BadRequest(ApiResponse<string>.ErrorResponse(response.Message, 400));
                }
                return Ok(ApiResponse<object>.SuccessResponse(response.Data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"Error: {ex.Message}", 500));
            }
        }

        [HttpPost("photo-upload")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadPhoto([FromForm] PhotoUploadDto request)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == 0)
                {
                    return BadRequest(ApiResponse<object>.ErrorResponse("Invalid Candidate ID.", 400));
                }

                var response = await _attendanceService.UploadPhoto(userId, request.Photo);
                if (response.IsSuccess == false)
                {
                    return StatusCode(response.StatusCode, ApiResponse<string>.ErrorResponse(response.Message, response.StatusCode));
                }
                return Ok(ApiResponse<object>.SuccessResponse(response.Data, "Photo uploaded successfully"));                
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"Upload failed: {ex.Message}", 500));
            }
        }
        #endregion

        #region Regularization
        [HttpPost("regularization-create")]
        public async Task<IActionResult> CreateRegularization([FromForm] RegularizationCreateRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == 0)
                {
                    return BadRequest("User ID is required");
                }

                var response = await _attendanceService.CreateRegularization(userId, request);
                if (response.IsSuccess == false)
                {
                    return StatusCode(response.StatusCode, ApiResponse<string>.ErrorResponse(response.Message, response.StatusCode));
                }
                return Ok(ApiResponse<object>.SuccessResponse(response.Data, "Regularization Request Submitted Successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"Regularization request failed: {ex.Message}", 500));
            }
        }
        [HttpPost("regularization-process")]
        public async Task<IActionResult> ProcessRegularization(List<long> requestId, int action, string approvalRemark = "")   // action 1-accept -1-reject
        {
            try
            {
                //var userId = GetCurrentUserId();
                //if (userId == 0)
                //{
                //    return BadRequest("User ID is required");
                //}
                var approveBy = GetUserLoginId();
                if (string.IsNullOrWhiteSpace(approveBy))
                {
                    return BadRequest(ApiResponse<object>.ErrorResponse("Login Id Required", 400));
                }

                var response = await _attendanceService.ProcessRegularization(requestId, action, approveBy, approvalRemark);
                if (response.IsSuccess == false)
                {
                    return StatusCode(response.StatusCode, ApiResponse<string>.ErrorResponse(response.Message, response.StatusCode));
                }
                return Ok(ApiResponse<object>.SuccessResponse(response.Data, "Action Saved."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"Regularization processing failed: {ex.Message}", 500));
            }
        }
        [HttpGet("get-user-regularization")]
        public async Task<IActionResult> GetUserRegularization(int? approvalStatus)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == 0)
                {
                    return BadRequest("User ID is required");
                }

                var response = await _attendanceService.GetUserRegularization(userId, approvalStatus);
                if (response.IsSuccess == false)
                {
                    return StatusCode(response.StatusCode, ApiResponse<string>.ErrorResponse(response.Message, response.StatusCode));
                }
                return Ok(ApiResponse<object>.SuccessResponse(response.Data, "Pending regularization requests fetched successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"Regularization fetch failed: {ex.Message}", 500));
            }
        }
        [HttpGet("get-institute-regularization")]
        public async Task<IActionResult> GetInstituteRegularization(long userTypeId, int? approvalStatus)
        {
            try
            {
                var userType = GetUserTypeId();
                if (userType != 61)
                {
                    return BadRequest(ApiResponse<object>.ErrorResponse("Portal is accessible to institute only.", 400));
                }
                var collegeLoginId = GetUserLoginId();
                if (string.IsNullOrWhiteSpace(collegeLoginId))
                {
                    return BadRequest(ApiResponse<object>.ErrorResponse("Login Id Required", 400));
                }
                var response = await _attendanceService.GetInstituteRegularization(collegeLoginId, userTypeId, approvalStatus);
                if (response.IsSuccess == false)
                {
                    return StatusCode(response.StatusCode, ApiResponse<string>.ErrorResponse(response.Message, response.StatusCode));
                }
                return Ok(ApiResponse<object>.SuccessResponse(response.Data, "Regularization requests fetched successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"Regularization fetch failed: {ex.Message}", 500));
            }
        }
        #endregion


        [HttpGet("GetInstituteSummaryByDate")]
        public async Task<IActionResult> GetInstituteSummaryByDate(long userTypeId,long CourseID, long BatchID,DateTime? attendanceDate = null)
        {
            var userType = GetUserTypeId();
            if (userType != 61)
            {
                return BadRequest(ApiResponse<object>.ErrorResponse("Portal is accessible to institute only.", 400));
            }
            var userLoginId = GetUserLoginId();
            if (string.IsNullOrWhiteSpace(userLoginId))
            {
                return BadRequest(ApiResponse<object>.ErrorResponse("Login Id Required", 400));
            }
            try
            {
                var response = await _attendanceService.GetInstituteSummaryByDate(
                    userLoginId, userTypeId, CourseID, BatchID, attendanceDate);

                if (response.IsSuccess == false)
                {
                    return BadRequest(ApiResponse<string>.ErrorResponse(response.Message, 404));
                }

                return Ok(ApiResponse<object>.SuccessResponse(response.Data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"Error: {ex.Message}", 500));
            }
        }

        
        
        
        #region Helper Functions
        private long GetCurrentUserId()
        {
            foreach (var claim in User.Claims)
            {
                Console.WriteLine($"Type: {claim.Type} -->  Value: {claim.Value}");
            }

            var userId1 = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userId = User
                .FindAll(ClaimTypes.NameIdentifier)
                .Select(c => c.Value)
                .LastOrDefault(v => long.TryParse(v, out _));
            Console.WriteLine("UserId in Token ", userId);
            return long.TryParse(userId, out var id) ? id : 0;
        }
        private int GetUserTypeId()
        {
            var claim = User.FindFirst("userTypeID")?.Value;
            return int.TryParse(claim, out var userTypeId) ? userTypeId : 0;
        }
        private string GetUserLoginId()
        {
            return User.FindFirst("userLoginId")?.Value ?? string.Empty;
        }
        private string GetClientIpAddress()
        {
            return HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
        }
        #endregion
    }
}
