using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.FirebaseNotification
{
    public class ScheduledPersonalizedNotificationsRequest
    {
        public List<UserNotificationRequest> Notifications { get; set; }
        public string deviceType { get; set; }
    }

    public class UserNotificationRequest
    {
        public int userId { get; set; }

        public string title { get; set; }

        public string body { get; set; }

        public string? data { get; set; }

        public string? imageUrl { get; set; }

        public DateTime scheduledAt { get; set; }

        public string? createdBy { get; set; }
    }

    public class ScheduledGroupNotificationsRequest
    {
        public string topic { get; set; }

        public string title { get; set; }

        public string body { get; set; }

        public string? data { get; set; }

        public string? imageUrl { get; set; }

        public DateTime scheduledAt { get; set; }

        public string? createdBy { get; set; }

    }

    public class ScheduleNotificationRequest
    {
        public string TargetType { get; set; }

        public long? UserId { get; set; }

        public long? TopicId { get; set; }

        public string Title { get; set; }

        public string Body { get; set; }

        public string Payload { get; set; }

        public string ImageUrl { get; set; }

        public DateTime ScheduledAt { get; set; }

        public string CreatedBy { get; set; }
    }
}
