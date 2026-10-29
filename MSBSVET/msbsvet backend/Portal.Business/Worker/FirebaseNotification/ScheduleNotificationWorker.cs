using FirebaseAdmin.Messaging;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Org.BouncyCastle.Cms;
using Portal.Data;

namespace Portal.Business.Worker.FirebaseNotification
{
    public class ScheduledNotificationWorker : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly Repository _objData;
        private readonly IConfiguration _configuration;

        public ScheduledNotificationWorker(IServiceScopeFactory scopeFactory, IConfiguration configuration)
        {
            _scopeFactory = scopeFactory;
            _configuration = configuration;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            Console.WriteLine("ScheduledNotificationWorker started");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    Console.WriteLine($"Worker running at: {DateTime.Now}");
                    await ProcessScheduledNotifications();
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Worker error: {ex.Message}");
                }
                int delayedMinutes = int.Parse(_configuration["Firebase:DelayMinutes"]); // Default delay
                int delaySeconds = delayedMinutes * 60;
                await Task.Delay(TimeSpan.FromSeconds(delaySeconds), stoppingToken);
            }
        }
        
        private async Task ProcessScheduledNotifications()
        {
            using var scope = _scopeFactory.CreateScope();

            var db = scope.ServiceProvider.GetRequiredService<Repository>();

            var dbResponse = db.GetPendingNotifications();

            if (dbResponse == null || dbResponse.Result != "Y")
                return;

            var notifications = dbResponse.Data;

            if (notifications == null || !notifications.Any())
                return;

            Console.WriteLine($"Notifications fetched: {notifications.Count}");

            foreach (var notification in notifications)
            {
                try
                {
                    switch (notification.TargetType?.Trim().ToUpper())
                    {
                        //case "USER":
                        //    await ProcessUserNotification(db, notification);
                        //    break;

                        //case "ALL":
                        //    await ProcessAllNotification(db, notification);
                        //    break;

                        //case "GROUP":
                        //    await ProcessGroupNotification(db, notification);
                        //    break;

                        case "TOKEN":
                            await ProcessTokenNotification(db, notification);
                            break;

                        case "TOPIC":
                            await ProcessTopicNotification(db, notification);
                            break;

                        default:
                            Console.WriteLine($"Unknown TargetType : {notification.TargetType}");
                            break;
                    }

                    //db.UpdateNotificationProcessingStatus(
                    //    notification.NotificationId,
                    //    "COMPLETED",
                    //    null
                    //);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Notification Processing Error : {ex.Message}");
                }
            }
        }

        private async Task ProcessTokenNotification(Repository db, dynamic notification)
        {
            if (string.IsNullOrWhiteSpace(notification.FcmToken))
            {
                db.UpdateNotificationStatus(notification.NotificationId, "FAILED", null, null, "FCM token not found");
                return;
            }
            Console.WriteLine($"Processing Token Notification: {notification.NotificationId}");

            try
            {
                var message = new Message
                {
                    Token = notification.FcmToken,
                    //Notification = new Notification
                    //{
                    //    Title = notification.Title,
                    //    Body = notification.Body
                    //},
                    // No Notification object — title/body go into Data instead
                    Android = new AndroidConfig
                    {
                        Priority = Priority.High,           // wakes device immediately
                        TimeToLive = TimeSpan.FromHours(24) // drop if undelivered after 24h
                    },
                    Data = BuildNotificationData(notification)
                };

                var messageId = await FirebaseMessaging.DefaultInstance.SendAsync(message);
                var firebaseMessageId = messageId?.Substring(messageId.LastIndexOf('/') + 1);
                Console.WriteLine($"Firebase ID: {firebaseMessageId} Message Id: {messageId}");


                db.UpdateNotificationStatus(notification.NotificationId, "SENT", notification.DeviceId, firebaseMessageId, null);
            }
            catch (FirebaseMessagingException ex)
            {
                db.UpdateNotificationStatus(notification.NotificationId, "FAILED", null, null, $"{ex.Message}_{ex.MessagingErrorCode}");
            }
            catch (Exception ex)
            {
                db.UpdateNotificationStatus(notification.NotificationId, "FAILED", null, null, ex.Message);
            }

        }

        private async Task ProcessTopicNotification(Repository db, dynamic notification)
        {
            if (string.IsNullOrWhiteSpace(notification.TopicName))
            {
                db.UpdateNotificationStatus(notification.NotificationId, "FAILED", null, null, "Topic not found");
                return;
            }
            Console.WriteLine($"Processing Topic Notification: {notification.NotificationId}");
            try
            {
                var message = new Message
                {
                    Topic = notification.TopicName,
                    //Notification = new Notification
                    //{
                    //    Title = notification.Title,
                    //    Body = notification.Body
                    //},
                    Android = new AndroidConfig
                    {
                        Priority = Priority.High,
                        TimeToLive = TimeSpan.FromHours(24)
                    },
                    Data = BuildNotificationData(notification)
                };

                var messageId = await FirebaseMessaging.DefaultInstance.SendAsync(message);
                var firebaseMessageId = messageId?.Substring(messageId.LastIndexOf('/') + 1);
                Console.WriteLine($"Firebase ID: {firebaseMessageId} Message Id: {messageId}");
                // db.UpdateNotificationStatus(notification.NotificationId, "SENT", deviceId, firebaseMessageId, null);
                db.CreateTopicNotificationEntries(notification.NotificationId, firebaseMessageId);
            }
            catch (FirebaseMessagingException ex)
            {
                db.UpdateNotificationStatus(notification.NotificationId, "FAILED", null, null, $"{ex.Message}_{ex.MessagingErrorCode}");
            }
            catch (Exception ex)
            {
                db.UpdateNotificationStatus(notification.NotificationId, "FAILED", null, null, ex.Message);
            }
        }


        private Dictionary<string, string> BuildNotificationData(dynamic notification)
        {
            var data =
                new Dictionary<string, string>
                {
                    {"notificationId",  notification.NotificationId.ToString()},
                    // title + body must be in data so Flutter handler can show heads-up
                    { "title", notification.Title?.ToString() ?? string.Empty },
                    { "body",  notification.Body?.ToString()  ?? string.Empty }
                };

            if (!string.IsNullOrWhiteSpace(notification.AdditionalPayload?.ToString()) )
            {
                data.Add("payload", notification.AdditionalPayload.ToString() );
            }

            if (!string.IsNullOrWhiteSpace(notification.ImageUrl?.ToString()))
            {
                data.Add("imageUrl", notification.ImageUrl.ToString() );
            }

            return data;
        }

















































        //private async Task ProcessUserNotification(Repository db, dynamic notification)
        //{
        //    var recipients = db.GetNotificationRecipients( notification.NotificationId );

        //    if (recipients?.Data == null)
        //        return;

        //    foreach (var recipient in recipients.Data)
        //    {
        //        await SendToRecipient(db, notification, recipient);
        //    }
        //}

        //private async Task ProcessAllNotification(Repository db, dynamic notification)
        //{
        //    var users = db.GetAllNotificationRecipients( notification.NotificationId, notification.DeviceType);

        //    if (users?.Data == null)
        //    {
        //        db.UpdateNotificationProcessingStatus(notification.NotificationId, "FAILED",null, "User Not Found");
        //    }

        //    await SendToTopic(db, notification);
        //}

        //private async Task ProcessGroupNotification(Repository db, dynamic notification)
        //{
        //    var users = db.GetGroupNotificationRecipients(notification.NotificationId, notification.TopicId, notification.DeviceType);

        //    if (users?.Data == null)
        //    {
        //        db.UpdateNotificationProcessingStatus(notification.NotificationId, "FAILED",null, "User Not Found");
        //    }

        //    await SendToTopic(db, notification);
        //}

        //private async Task SendToRecipient(Repository db, dynamic notification,dynamic recipient)
        //{
        //    if (string.IsNullOrWhiteSpace(recipient.FcmToken))
        //    {
        //        db.UpdateRecipientsNotificationsStatus( recipient.RecipientsNotificationId, "FAILED",null,"FCM token not found");
        //        return;
        //    }

        //    try
        //    {
        //        var message = new Message
        //        {
        //            Token = recipient.FcmToken,
        //            Notification = new Notification
        //            {
        //                Title = notification.Title,
        //                Body = notification.Body
        //            }
        //        };

        //        var firebaseMessageId = await FirebaseMessaging.DefaultInstance.SendAsync(message);

        //        db.UpdateRecipientsNotificationsStatus( recipient.RecipientsNotificationId,"SENT",firebaseMessageId,null);
        //    }
        //    catch (FirebaseMessagingException ex)
        //    {
        //        db.UpdateRecipientsNotificationsStatus( recipient.RecipientsNotificationId,"FAILED",null,$"{ex.Message}_{ex.MessagingErrorCode}");
        //    }
        //    catch (Exception ex)
        //    {
        //        db.UpdateRecipientsNotificationsStatus( recipient.RecipientsNotificationId,"FAILED",null,ex.Message);
        //    }
        //}

        //private async Task SendToTopic(Repository db, dynamic notification)
        //{
        //    if (string.IsNullOrWhiteSpace(notification.TopicName))
        //    {
        //        db.UpdateNotificationProcessingStatus(notification.NotificationId, "FAILED",null, "Topic not found");
        //        return;
        //    }
        //    try
        //    {
        //        var message = new Message
        //        {
        //            Topic = notification.TopicName,
        //            Notification = new Notification
        //            {
        //                Title = notification.Title,
        //                Body = notification.Body
        //            }
        //        };

        //        var firebaseMessageId = await FirebaseMessaging.DefaultInstance.SendAsync(message);

        //        db.UpdateNotificationProcessingStatus(notification.NotificationId, "SENT" , firebaseMessageId, null);
        //    }
        //    catch (FirebaseMessagingException ex)
        //    {
        //        db.UpdateNotificationProcessingStatus(notification.NotificationId, "FAILED",null, $"{ex.Message}_{ex.MessagingErrorCode}");
        //    }
        //    catch (Exception ex)
        //    {
        //        db.UpdateNotificationProcessingStatus(notification.NotificationId, "FAILED",null, ex.Message);
        //    }
        //}

    }
}