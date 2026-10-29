using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Portal.Business.Interface.Administration;
using Portal.Business.Worker.Base;
using Portal.Entities.Administration;
using Portal.Entities.ResponseBody;
using System.Data;

namespace Portal.Server.Controllers.Administration
{
    [AllowAnonymous]
    [Route("api/[controller]")]
    [ApiController]
    public class ManageNotificationController : ControllerBase
    {
        private readonly IManageNotification _notification;

        public ManageNotificationController(IManageNotification notification)
        {
            _notification = notification;
        }

        [HttpGet]
        [Route("GetNotificationListForDisplay")]
        public IActionResult GetNotificationListForDisplay(short RegionID, string Language = "")
        {
            try
            {
                var result = _notification.GetNotificationListForDisplay(RegionID, Language);
                var serializableData = BaseWorker.ConvertDataTableToList(result);
                return Ok(ApiResponse<object>.SuccessResponse(serializableData, "Notification list retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetArchivedNotificationListForDisplay")]
        public IActionResult GetArchivedNotificationListForDisplay(short RegionID, string Language = "")
        {
            try
            {
                var result = _notification.GetArchivedNotificationListForDisplay(RegionID, Language);
                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Archived notification list retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetNotificationList")]
        public IActionResult GetNotificationList(short RegionID, short NotificationCategoryID)
        {
            try
            {
                var result = _notification.GetNotificationList(RegionID, NotificationCategoryID);
                var serializableData = BaseWorker.ConvertDataTableToList(result);
                return Ok(ApiResponse<object>.SuccessResponse(serializableData, "Notification list by category retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetNotificationDetails")]
        public IActionResult GetNotificationDetails(long NotificationID)
        {
            try
            {
                var result = _notification.GetNotificationsDetails(NotificationID);
                if (result == null)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("Notification not found.", 404));
                }
                return Ok(ApiResponse<NotificationEntity>.SuccessResponse(result, "Notification details retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("SaveNotification")]
        public IActionResult SaveNotification([FromBody] NotificationEntity entity)
        {
            try
            {
                var result = _notification.SaveNotification(entity);
                return Ok(ApiResponse<string>.SuccessResponse(result, "Notification saved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpDelete]
        [Route("DeleteNotification")]
        public IActionResult DeleteNotification(long NotificationID, string UserLoginID, string IPAddress)
        {
            try
            {
                var result = _notification.DeleteNotification(NotificationID, UserLoginID, IPAddress);
                return Ok(ApiResponse<string>.SuccessResponse(result, "Notification deleted successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

    }
}
