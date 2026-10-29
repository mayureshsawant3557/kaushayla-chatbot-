public class UserFcmTokenResponse
{
    public int UserId { get; set; }

    public string FcmToken { get; set; } = string.Empty;
}

public class PendingNotificationResponse
{
    public long NotificationId { get; set; }

    public string Title { get; set; }

    public string Body { get; set; }

    public string Data { get; set; }

    public string ImageUrl { get; set; }

    public string DeviceType { get; set; }

    public string TargetType { get; set; }

    public long? TopicId { get; set; }

    public string TopicName { get; set; }

    public DateTime ScheduledAt { get; set; }
}

public class PendingNotificationResponseNew
{
    public long NotificationId { get; set; }

    public string Title { get; set; }

    public string Body { get; set; }

    public string Data { get; set; }

    public string ImageUrl { get; set; }

    public string AdditionalPayload { get; set; }

    public string DeviceType { get; set; }

    public string TargetType { get; set; }

    public long? TopicId { get; set; }

    public string TopicName { get; set; }

    public DateTime ScheduledAt { get; set; }

    public long? UserId { get; set; }
    public string FcmToken { get; set; }
    public string DeviceId { get; set; }
    public string MessageStatus { get; set; }
    public string FcmMessageId { get; set; }
    public string ErrorMessage { get; set; }
    public DateTime? SentAt { get; set; }
    public DateTime? DeliveredAt { get; set; }
    public DateTime? ReadAt { get; set; }
}

public class NotificationRecipientResponse
{
    public long RecipientsNotificationId { get; set; }

    public int UserId { get; set; }

    public string FcmToken { get; set; } = string.Empty;
}


public class PendingScheduledNotificationResponse
{
    public long RecipientsNotificationId { get; set; }
    public int UserId { get; set; }
    public long NotificationId { get; set; }
    public string Title { get; set; }
    public string Body { get; set; }
    public string Data { get; set; }
    public string ImageUrl { get; set; }
    public string DeviceType { get; set; }
    public string FcmToken { get; set; }
}