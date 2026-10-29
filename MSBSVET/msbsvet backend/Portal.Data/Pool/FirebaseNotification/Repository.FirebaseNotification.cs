using FirebaseAdmin.Messaging;
using Microsoft.Practices.EnterpriseLibrary.Data;
using NPOI.XWPF.UserModel;
using Portal.Entities.AttendanceDbResponse;
using Portal.Entities.FirebaseNotification;
using System.Data;

namespace Portal.Data
{
    public partial class Repository
    {
        public DbResponse<object> RegisterFcmToken(FcmTokenRequest entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            var param = new Dictionary<string, object>
            {
                { "@UserId", entity.userId },
                { "@FcmToken", entity.fcmToken ?? (object)DBNull.Value },
                { "@DeviceId", entity.deviceId ?? (object)DBNull.Value },
                { "@DeviceType", entity.deviceType ?? (object)DBNull.Value },
                { "@IPAddress", entity.ipAddress ?? (object)DBNull.Value }
            };

            var dt = _dbAccess.GetDataTable("App_RegisterOrUpdateFcmToken", param);

            if (dt == null || dt.Rows.Count == 0)
            {
                return new DbResponse<object>
                {
                    Result = "N",
                    Message = "No response from database"
                };
            }

            return new DbResponse<object>
            {
                Result = dt.Rows[0]["Result"]?.ToString() ?? "N",
                Message = dt.Rows[0]["Message"]?.ToString() ?? "Unknown error"
            };
        }

        public DbResponse<object> RemoveFcmToken(FcmTokenRequest entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            var param = new Dictionary<string, object>
            {
                { "@UserId", entity.userId },
                { "@FcmToken", entity.fcmToken ?? (object)DBNull.Value },
                { "@DeviceId", entity.deviceId ?? (object)DBNull.Value },
                { "@IPAddress", entity.ipAddress ?? (object)DBNull.Value }
            };

            var dt = _dbAccess.GetDataTable("App_RemoveFcmToken", param);

            if (dt == null || dt.Rows.Count == 0)
            {
                return new DbResponse<object>
                {
                    Result = "N",
                    Message = "No response from database"
                };
            }

            return new DbResponse<object>
            {
                Result = dt.Rows[0]["Result"]?.ToString() ?? "N",
                Message = dt.Rows[0]["Message"]?.ToString() ?? "Unknown error"
            };
        }

        public DbResponse<object> ScheduleNotification(ScheduleNotificationRequest request)
        {
            var param = new Dictionary<string, object>
                    {
                        { "@TargetType", request.TargetType },
                        { "@UserId", request.UserId },
                        { "@TopicId", request.TopicId },

                        { "@Title", request.Title },
                        { "@Body", request.Body },
                        { "@Payload", request.Payload },       //nullable
                        { "@ImageUrl", request.ImageUrl },     //nullable

                        { "@ScheduledAt", request.ScheduledAt },
                        { "@CreatedBy", request.CreatedBy }    //nullable
                    };

            var ds = _dbAccess.GetDataSet("Firebase_ScheduleNotification", param);

            if (ds == null || ds.Tables.Count == 0 || ds.Tables[0].Rows.Count == 0)
            {
                return new DbResponse<object>
                {
                    Result = "N",
                    Message = "No response from database"
                };
            }

            var row = ds.Tables[0].Rows[0];

            return new DbResponse<object>
            {
                Result = row["Result"]?.ToString() ?? "N",
                Message = row["Message"]?.ToString() ?? string.Empty,

                Data = row["NotificationId"] == DBNull.Value
                        ? null
                        : Convert.ToInt64(row["NotificationId"])
            };
        }
        
        public DbResponse<List<PendingNotificationResponseNew>> GetPendingNotifications()
        {
            var ds = _dbAccess.GetDataSet("Firebase_GetPendingNotifications");

            if (ds == null || ds.Tables.Count == 0)
            {
                return new DbResponse<List<PendingNotificationResponseNew>>
                {
                    Result = "N",
                    Message = "No response from database"
                };
            }

            var statusTable = ds.Tables[0];

            var result = statusTable.Rows[0]["Result"]?.ToString() ?? "N";
            var message = statusTable.Rows[0]["Message"]?.ToString() ?? "";

            var notificationList = new List<PendingNotificationResponseNew>();

            if (result == "Y" &&
                ds.Tables.Count > 1 &&
                ds.Tables[1].Rows.Count > 0)
            {
                var dataTable = ds.Tables[1];

                notificationList = dataTable.AsEnumerable()
                    .Select(row => new PendingNotificationResponseNew
                    {
                        NotificationId = Convert.ToInt64(row["NotificationId"]),

                        TargetType = row["TargetType"]?.ToString() ?? string.Empty,

                        UserId = row["UserId"] == DBNull.Value ? null : Convert.ToInt64(row["UserId"]),
                        FcmToken = row["FcmToken"]?.ToString() ?? string.Empty,

                        TopicId = row["TopicId"] == DBNull.Value ? null : Convert.ToInt64(row["TopicId"]),
                        TopicName = row["TopicName"]?.ToString() ?? string.Empty,


                        Title = row["Title"]?.ToString() ?? string.Empty,
                        Body = row["Body"]?.ToString() ?? string.Empty,
                        Data = row["Payload"]?.ToString() ?? string.Empty,
                        ImageUrl = row["ImageUrl"]?.ToString() ?? string.Empty,
                        AdditionalPayload = row["Payload"]?.ToString() ?? string.Empty,
                        DeviceType = row["DeviceType"]?.ToString() ?? string.Empty,
                        DeviceId = row["DeviceId"]?.ToString() ?? string.Empty,
                        ScheduledAt = Convert.ToDateTime(row["ScheduledAt"])
                    })
                    .ToList();
            }

            return new DbResponse<List<PendingNotificationResponseNew>>
            {
                Result = result,
                Message = message,
                Data = notificationList
            };
        }

        public DbResponse<object> UpdateNotificationStatus(long recipientsNotificationsId, string status, string deviceId, string firebaseMessageId, string errorMessage)
        {
            var param = new Dictionary<string, object>
                            {
                                { "@NotificationId", recipientsNotificationsId },
                                { "@Status", status },
                                { "@DeviceId", (object)deviceId ?? DBNull.Value },
                                { "@FcmMessageId", (object)firebaseMessageId ?? DBNull.Value },
                                { "@ErrorMessage", (object)errorMessage ?? DBNull.Value }
                            };

            var ds = _dbAccess.GetDataSet("Firebase_UpdateNotificationStatus", param);

            if (ds == null || ds.Tables.Count == 0)
            {
                return new DbResponse<object>
                {
                    Result = "N",
                    Message = "No response from database"
                };
            }

            var resultTable = ds.Tables[0];

            var result = resultTable.Rows[0]["Result"]?.ToString() ?? "N";
            var message = resultTable.Rows[0]["Message"]?.ToString() ?? "";

            return new DbResponse<object>
            {
                Result = result,
                Message = message,
                Data = null
            };
        }

        public DbResponse<object> CreateTopicNotificationEntries(long notificationId,string firebaseMessageId)
        {
            var param = new Dictionary<string, object>
                            {
                                { "@NotificationId", notificationId },
                                { "@FcmMessageId", (object)firebaseMessageId ?? DBNull.Value }
                            };

            var ds = _dbAccess.GetDataSet("Firebase_CreateTopicNotificationEntries",param);

            if (ds == null || ds.Tables.Count == 0 || ds.Tables[0].Rows.Count == 0)
            {
                return new DbResponse<object>
                {
                    Result = "N",
                    Message = "No response from database"
                };
            }

            var row = ds.Tables[0].Rows[0];

            return new DbResponse<object>
            {
                Result = row["Result"]?.ToString() ?? "N",
                Message = row["Message"]?.ToString() ?? string.Empty
            };
        }

        public DbResponse<object> UpdateUserNotificationStatus(UserNotificationStatusRequest request)
        {
            var param = new Dictionary<string, object>
                            {
                                { "@UserId", request.userId },
                                { "@Status", request.status },
                                { "@NotificationId", request.notificationId}  //not fcm its notification id
                            };

            var ds = _dbAccess.GetDataSet("Firebase_UpdateUserNotificationStatus", param);

            if (ds == null || ds.Tables.Count == 0)
            {
                return new DbResponse<object>
                {
                    Result = "N",
                    Message = "No response from database"
                };
            }

            var resultTable = ds.Tables[0];

            var result = resultTable.Rows[0]["Result"]?.ToString() ?? "N";
            var message = resultTable.Rows[0]["Message"]?.ToString() ?? "";

            return new DbResponse<object>
            {
                Result = result,
                Message = message,
                Data = null
            };
        }

        //public DbResponse<object> SchedulePersonalizedNotification(UserNotificationRequest notification, String deviceType)
        //{
        //    if (notification == null)
        //        throw new ArgumentNullException(nameof(notification));

        //    var param = new Dictionary<string, object>
        //                    {
        //                        { "@UserId", notification.userId },
        //                        { "@Title", notification.title },
        //                        { "@Body", notification.body },
        //                        { "@Data", notification.data ?? (object)DBNull.Value },
        //                        { "@ImageUrl", notification.imageUrl ?? (object)DBNull.Value },
        //                        { "@ScheduledAt", notification.scheduledAt },
        //                        { "@DeviceType", deviceType },
        //                        { "@CreatedBy", notification.createdBy ?? (object)DBNull.Value }
        //                    };

        //    var ds = _dbAccess.GetDataSet("App_SchedulePersonalizedNotification", param);

        //    if (ds == null || ds.Tables.Count == 0)
        //    {
        //        return new DbResponse<object>
        //        {
        //            Result = "N",
        //            Message = "No response from database"
        //        };
        //    }

        //    var resultTable = ds.Tables[0];

        //    var result = resultTable.Rows[0]["Result"]?.ToString() ?? "N";
        //    var message = resultTable.Rows[0]["Message"]?.ToString() ?? "";
        //    var data = resultTable.Rows[0]["RecipientsNotificationId"] ?? 0;


        //    return new DbResponse<object>
        //    {
        //        Result = result,
        //        Message = message,
        //        Data = data
        //    };
        //}

        //public DbResponse<object> ScheduleTopicNotification(ScheduledGroupNotificationsRequest notification)
        //{
        //    if (notification == null)
        //        throw new ArgumentNullException(nameof(notification));

        //    var param = new Dictionary<string, object>
        //                    {
        //                        { "@Topic", notification.topic },
        //                        { "@Title", notification.title },
        //                        { "@Body", notification.body },
        //                        { "@Data", notification.data ?? (object)DBNull.Value },
        //                        { "@ImageUrl", notification.imageUrl ?? (object)DBNull.Value },
        //                        { "@ScheduledAt", notification.scheduledAt },
        //                        { "@CreatedBy", notification.createdBy ?? (object)DBNull.Value },
        //                    };

        //    var ds = _dbAccess.GetDataSet("App_ScheduleTopicNotification", param);

        //    if (ds == null || ds.Tables.Count == 0 || ds.Tables[0].Rows.Count == 0)
        //    {
        //        return new DbResponse<object>
        //        {
        //            Result = "N",
        //            Message = "No response from database"
        //        };
        //    }

        //    var resultTable = ds.Tables[0];

        //    var result = resultTable.Rows[0]["Result"]?.ToString() ?? "N";
        //    var message = resultTable.Rows[0]["Message"]?.ToString() ?? "";

        //    var data = resultTable.Rows[0]["NotificationId"] ?? 0;

        //    return new DbResponse<object>
        //    {
        //        Result = result,
        //        Message = message,
        //        Data = data
        //    };
        //}

        //public DbResponse<List<PendingNotificationResponse>> GetPendingNotifications()
        //{
        //    var ds = _dbAccess.GetDataSet("App_GetPendingNotifications");

        //    if (ds == null || ds.Tables.Count == 0)
        //    {
        //        return new DbResponse<List<PendingNotificationResponse>>
        //        {
        //            Result = "N",
        //            Message = "No response from database"
        //        };
        //    }

        //    var statusTable = ds.Tables[0];

        //    var result = statusTable.Rows[0]["Result"]?.ToString() ?? "N";
        //    var message = statusTable.Rows[0]["Message"]?.ToString() ?? "";

        //    var notificationList = new List<PendingNotificationResponse>();

        //    if (result == "Y" && ds.Tables.Count > 1 && ds.Tables[1].Rows.Count > 0)
        //    {
        //        var dataTable = ds.Tables[1];

        //        notificationList = dataTable.AsEnumerable()
        //            .Select(row => new PendingNotificationResponse
        //            {
        //                NotificationId = Convert.ToInt64(row["NotificationId"]),
        //                Title = row["Title"]?.ToString() ?? string.Empty,
        //                Body = row["Body"]?.ToString() ?? string.Empty,
        //                Data = row["Data"]?.ToString() ?? string.Empty,
        //                ImageUrl = row["ImageUrl"]?.ToString() ?? string.Empty,
        //                DeviceType = row["DeviceType"]?.ToString() ?? string.Empty,
        //                TargetType = row["TargetType"]?.ToString() ?? string.Empty,

        //                TopicId = row["TopicId"] == DBNull.Value
        //                    ? null
        //                    : Convert.ToInt32(row["TopicId"]),

        //                TopicName = row["TopicName"]?.ToString() ?? string.Empty,

        //                ScheduledAt = Convert.ToDateTime(row["ScheduledAt"])
        //            })
        //            .ToList();
        //    }

        //    return new DbResponse<List<PendingNotificationResponse>>
        //    {
        //        Result = result,
        //        Message = message,
        //        Data = notificationList
        //    };
        //}

        //public DbResponse<List<NotificationRecipientResponse>> GetNotificationRecipients(long notificationId)
        //{
        //    if (notificationId <= 0)
        //        throw new ArgumentException("Invalid notification id", nameof(notificationId));

        //    var param = new Dictionary<string, object>
        //        {
        //            { "@NotificationId", notificationId }
        //        };

        //    var ds = _dbAccess.GetDataSet( "App_GetNotificationRecipients", param);

        //    return MapRecipients(ds);
        //}

        //public DbResponse<List<NotificationRecipientResponse>> GetAllNotificationRecipients(Int64 notificationId, string deviceType)
        //{
        //    if (string.IsNullOrWhiteSpace(deviceType))
        //        throw new ArgumentException("Device type required",nameof(deviceType));

        //    var param = new Dictionary<string, object>
        //        {
        //            { "@NotificationId", notificationId },
        //            { "@DeviceType", deviceType }
        //        };

        //    var ds = _dbAccess.GetDataSet("App_GetAllNotificationRecipients", param);

        //    return MapRecipients(ds);
        //}

        //public DbResponse<List<NotificationRecipientResponse>> GetGroupNotificationRecipients(Int64 notificationId, int topicId,string deviceType)
        //{
        //    if (topicId <= 0)
        //        throw new ArgumentException("Invalid topic id", nameof(topicId));

        //    if (string.IsNullOrWhiteSpace(deviceType))
        //        throw new ArgumentException("Device type required",nameof(deviceType));

        //    var param = new Dictionary<string, object>
        //        {
        //            { "@NotificationId", notificationId },
        //            { "@TopicId", topicId },
        //            { "@DeviceType", deviceType }
        //        };

        //    var ds = _dbAccess.GetDataSet("App_GetGroupNotificationRecipients", param);

        //    return MapRecipients(ds);
        //}

        //Use to update notification log and then update recipient log with sucess or failure based on response from firebase after sending notification
        //public DbResponse<object> UpdateNotificationProcessingStatus(long notificationId,string processingStatus, string firebaseMessageId, string errorMessage)
        //{
        //    if (notificationId <= 0)
        //        throw new ArgumentException("Invalid notification id",nameof(notificationId));

        //    if (string.IsNullOrWhiteSpace(processingStatus))
        //        throw new ArgumentException("Status is required",nameof(processingStatus));

        //    var param = new Dictionary<string, object>
        //        {
        //            { "@NotificationId", notificationId },
        //            { "@Status", processingStatus.Trim() },
        //            { "@FcmMessageId", (object)firebaseMessageId ?? DBNull.Value },
        //            { "@ErrorMessage", (object?)errorMessage ?? DBNull.Value }
        //        };

        //    var dt = _dbAccess.GetDataTable("App_UpdateNotificationProcessingStatus",param);

        //    if (dt == null || dt.Rows.Count == 0)
        //    {
        //        return new DbResponse<object>
        //        {
        //            Result = "N",
        //            Message = "No response from database"
        //        };
        //    }

        //    return new DbResponse<object>
        //    {
        //        Result =dt.Rows[0]["Result"]?.ToString()?? "N",
        //        Message =dt.Rows[0]["Message"]?.ToString()?? "Unknown error",

        //        Data = null
        //    };
        //}

        ////Use to update recipient log with sucess or failure based on response from firebase after sending notification and then preocess all reciptants and update notification log with final status like completed or completed with errors
        //public DbResponse<object> UpdateRecipientsNotificationsStatus(long recipientsNotificationsId, string status, string firebaseMessageId, string errorMessage)
        //{
        //    var param = new Dictionary<string, object>
        //                    {
        //                        { "@RecipientsNotificationId", recipientsNotificationsId },
        //                        { "@Status", status },
        //                        { "@FcmMessageId", (object)firebaseMessageId ?? DBNull.Value },
        //                        { "@ErrorMessage", (object)errorMessage ?? DBNull.Value }
        //                    };

        //    var ds = _dbAccess.GetDataSet("App_UpdateRecipientsNotificationsStatus", param);

        //    if (ds == null || ds.Tables.Count == 0)
        //    {
        //        return new DbResponse<object>
        //        {
        //            Result = "N",
        //            Message = "No response from database"
        //        };
        //    }

        //    var resultTable = ds.Tables[0];

        //    var result = resultTable.Rows[0]["Result"]?.ToString() ?? "N";
        //    var message = resultTable.Rows[0]["Message"]?.ToString() ?? "";

        //    return new DbResponse<object>
        //    {
        //        Result = result,
        //        Message = message,
        //        Data = null
        //    };
        //}

        //private DbResponse<List<NotificationRecipientResponse>> MapRecipients(DataSet ds)
        //{
        //    if (ds == null || ds.Tables.Count == 0)
        //    {
        //        return new DbResponse<List<NotificationRecipientResponse>>
        //        {
        //            Result = "N",
        //            Message = "No response from database"
        //        };
        //    }

        //    var statusTable = ds.Tables[0];

        //    if (statusTable.Rows.Count == 0)
        //    {
        //        return new DbResponse<List<NotificationRecipientResponse>>
        //        {
        //            Result = "N",
        //            Message = "Invalid database response"
        //        };
        //    }

        //    var result = statusTable.Rows[0]["Result"]?.ToString() ?? "N";
        //    var message = statusTable.Rows[0]["Message"]?.ToString() ?? "";

        //    var recipients = new List<NotificationRecipientResponse>();

        //    if (result == "Y" && ds.Tables.Count > 1 && ds.Tables[1].Rows.Count > 0)
        //    {
        //        recipients = ds.Tables[1]
        //            .AsEnumerable()
        //            .Select(row => new NotificationRecipientResponse
        //            {
        //                RecipientsNotificationId = row.Table.Columns.Contains("RecipientsNotificationId") && row["RecipientsNotificationId"] != DBNull.Value ? Convert.ToInt64(row["RecipientsNotificationId"]) : 0,

        //                UserId =  Convert.ToInt32(row["UserId"]),

        //                FcmToken = row.Table.Columns.Contains("FcmToken") && row["FcmToken"] != DBNull.Value ? row["FcmToken"].ToString() : string.Empty
        //            })
        //            .ToList();
        //    }

        //    return new DbResponse<List<NotificationRecipientResponse>>
        //    {
        //        Result = result,
        //        Message = message,
        //        Data = recipients
        //    };
        //}

    }
}