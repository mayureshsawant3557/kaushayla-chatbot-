using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.FirebaseNotification
{
    public class FcmTokenRequest
    {
        public Int64 userId { get; set; }
        public string fcmToken { get; set; }
        public string deviceId { get; set; }
        public string? ipAddress { get; set; }
        public string deviceType { get; set; }
    }

    public class UserNotificationStatusRequest
    {
        public Int64 userId { get; set; }
        public string status { get; set; }
        public string notificationId { get; set; }
    }



    public class PersonalizedNotificationRequest
    {
        public List<UserNotificationItem> Notifications { get; set; } = new();
        public string deviceType { get; set; }
    }

    public class UserNotificationItem
    {
        public int UserId { get; set; }

        public string Title { get; set; } = string.Empty;

        public string Body { get; set; } = string.Empty;
    }

    public class SendNotificationToUserRequest
    {
        public string Token { get; set; }
        public string Title { get; set; }
        public string Body { get; set; }
        public string AdditionalPayload { get; set; }
        public string ImageUrl { get; set; }
    }
    public class SendNotificationToSubscribersRequest
    {
        public string topic { get; set; }
        public string title { get; set; }
        public string body { get; set; }
    }
    public class SendNotificationToMultipleUsersRequest
    {
        public List<string> tokens { get; set; }
        public string title { get; set; }
        public string body { get; set; }
    }
}
