using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Exchange.WebServices.Data;
using Portal.Business.Interface.FirebaseNotification;
using Portal.Entities.FirebaseNotification;
using Portal.Entities.ResponseBody;
using System.Net.NetworkInformation;
using System.Security.Claims;

namespace Portal.Server.Controllers.FirebaseNotification
{
    [Route("api/[controller]")]
    [ApiController]
    public class FirebaseNotification : ControllerBase
    {

        private readonly IFirebaseNotification _firebaseService;
        
        public FirebaseNotification(IFirebaseNotification firebaseService)
        {
            _firebaseService = firebaseService ?? throw new ArgumentNullException(nameof(firebaseService));
        }
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

        [HttpPost("register-fcm-token")]
        public async Task<IActionResult> RegisterToken([FromBody] FcmTokenRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return BadRequest(ApiResponse<object>.ErrorResponse("Invalid Candidate ID.", 400));
            }
            request.userId = userId;
            try
            {
                var response = await _firebaseService.RegisterFcmToken(request);
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


        [HttpDelete("remove-fcm-token")]
        public async Task<IActionResult> RemoveToken([FromBody] FcmTokenRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return BadRequest(ApiResponse<object>.ErrorResponse("Invalid Candidate ID.", 400));
            }
            request.userId = userId;
            try
            {
                var response = await _firebaseService.RemoveFcmToken(request);
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

        [HttpPut("update-user-notification-status")]
        public async Task<IActionResult> UpdateUserNotificationStatus(UserNotificationStatusRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return BadRequest(ApiResponse<object>.ErrorResponse("Invalid Candidate ID.", 400));
            }
            request.userId=userId;
            try
            {
                var response = await _firebaseService.UpdateUserNotificationStatus(request); ;
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



      
        // Single user/token single message to that user/token only
        [HttpPost("test-personalized")]
        public async Task<IActionResult> SendToToken([FromBody] SendNotificationToUserRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.Token))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Token is required", 400));

                var response = await _firebaseService.SendToTokenAsync(request);
                if(response.IsSuccess == false)
                {
                    return BadRequest(ApiResponse<string>.ErrorResponse($"{response.Message}_{response.ErrorCode}", 400));
                }

                return Ok(ApiResponse<object>.SuccessResponse(response.Data));
            }
            catch (Exception ex) {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"Error: {ex.Message}", 500));
            }

        }

        // message to suscribed users
        [HttpPost("test-group")]
        public async Task<IActionResult> SendToTopic([FromBody] SendNotificationToSubscribersRequest request)
        {
            if (string.IsNullOrEmpty(request.topic))
                return BadRequest("Topic is required");

            var response = await _firebaseService.SendToTopicAsync(request);

            return Ok(response);
        }

        // same message to all users/tokens
        [HttpPost("test-multiple-users")]
        public async Task<IActionResult> SendToMultipleUsers([FromBody] SendNotificationToMultipleUsersRequest request)
        {
            if (request.tokens == null || !request.tokens.Any())
                return BadRequest("Tokens are required");

            var response = await _firebaseService.SendToMultipleTokensAsync(request);

            return Ok(response);
        }

        //[HttpPost("schedule-personalized")]
        //public async Task<IActionResult> SchedulePersonalizedNotification([FromBody] ScheduledPersonalizedNotificationsRequest request)
        //{
        //    try
        //    {
        //        if (request?.Notifications == null || !request.Notifications.Any())
        //            return BadRequest(ApiResponse<string>.ErrorResponse("Notifications required", 400));

        //        var response = await _firebaseService.SchedulePersonalizedNotificationAsync(request);
        //        if (response.IsSuccess == false)
        //        {
        //            return BadRequest(ApiResponse<string>.ErrorResponse($"{response.Message}_{response.ErrorCode}", 400));
        //        }

        //        return Ok(ApiResponse<object>.SuccessResponse(response.Data));
        //    }
        //    catch (Exception ex)
        //    {
        //        return StatusCode(500, ApiResponse<object>.ErrorResponse($"Error: {ex.Message}", 500));
        //    }
        //}

        //[HttpPost("schedule-group")]
        //public async Task<IActionResult> ScheduleGroupNotification([FromBody] ScheduledGroupNotificationsRequest request)
        //{
        //    try
        //    {
        //        if (request?.topic == null || !request.topic.Any())
        //            return BadRequest(ApiResponse<string>.ErrorResponse("Topic is required", 400));

        //        var response = await _firebaseService.ScheduleGroupNotificationAsync(request);
        //        if (response.IsSuccess == false)
        //        {
        //            return BadRequest(ApiResponse<string>.ErrorResponse($"{response.Message}_{response.ErrorCode}", 400));
        //        }

        //        return Ok(ApiResponse<object>.SuccessResponse(response.Data));
        //    }
        //    catch (Exception ex)
        //    {
        //        return StatusCode(500, ApiResponse<object>.ErrorResponse($"Error: {ex.Message}", 500));
        //    }
        //}

    }

}
