using FirebaseAdmin;
using FirebaseAdmin.Messaging;
using Google.Apis.Auth.OAuth2;
using NuGet.Protocol;
using Portal.Business.Interface.FirebaseNotification;
using Portal.Data;
using Portal.Entities.FirebaseNotification;
using Portal.Entities.ResponseBody;

namespace Portal.Business.Worker.FirebaseNotification
{
    public class FirebaseNotificationWorker : IFirebaseNotification
    {
        private readonly Repository _objData;
        public FirebaseNotificationWorker(Repository objData)
        {
            _objData = objData ?? throw new ArgumentNullException(nameof(objData), "Repository instance cannot be null");
            
        }

        public async Task<ServiceResponse<object>> RegisterFcmToken(FcmTokenRequest entity)
        {
            var dbResponse = _objData.RegisterFcmToken(entity);

            if (dbResponse.Result == "Y")
            {
                return ServiceResponse<object>.SuccessResponse(dbResponse.Message);
            }

            return ServiceResponse<object>.FailureResponse(dbResponse.Message);
        }

        public async Task<ServiceResponse<object>> RemoveFcmToken(FcmTokenRequest entity)
        {
            var dbResponse = _objData.RemoveFcmToken(entity);

            if (dbResponse.Result == "Y")
            {
                return ServiceResponse<object>.SuccessResponse(dbResponse.Message);
            }

            return ServiceResponse<object>.FailureResponse(dbResponse.Message);
        }

        public async Task<ServiceResponse<object>> UpdateUserNotificationStatus(UserNotificationStatusRequest entity)
        {
            var dbResponse = _objData.UpdateUserNotificationStatus(entity);

            if (dbResponse.Result == "Y")
            {
                return ServiceResponse<object>.SuccessResponse(dbResponse.Message);
            }

            return ServiceResponse<object>.FailureResponse(dbResponse.Message);
        }




       

        
        public async Task<ServiceResponse<object>> SendToTokenAsync(SendNotificationToUserRequest request)
        {
            try
            {
                var message = new Message()
                {
                    Token = request.Token,
                    Notification = new Notification()
                    {
                        Title = request.Title,
                        Body = request.Body
                    },
                    //Android = new AndroidConfig()
                    //{
                    //    Priority = Priority.High,
                    //    Notification = new AndroidNotification()
                    //    {
                    //        Sound = "custom_sound" // NO .mp3 here
                    //    }
                    //},
                    Data = BuildNotificationData(request)
                };

                var response = await FirebaseMessaging.DefaultInstance.SendAsync(message);
                return ServiceResponse<object>.SuccessResponse(response);
            }
            catch (FirebaseMessagingException ex)
            {
                return ServiceResponse<object>.FailureResponse(ex.Message, ex.MessagingErrorCode.ToString());
            }
        }
        private Dictionary<string, string> BuildNotificationData(SendNotificationToUserRequest request)
        {
            var data =
                new Dictionary<string, string>
                {
                    //{"notificationId",  notification.NotificationId.ToString()},
                    // title + body must be in data so Flutter handler can show heads-up
                    { "title", request.Title?.ToString() ?? string.Empty },
                    { "body",  request.Body?.ToString()  ?? string.Empty }
                };

            if (!string.IsNullOrWhiteSpace(request.AdditionalPayload?.ToString()))
            {
                data.Add("payload", request.AdditionalPayload.ToString());
            }

            if (!string.IsNullOrWhiteSpace(request.ImageUrl?.ToString()))
            {
                data.Add("imageUrl", request.ImageUrl.ToString());
            }

            return data;
        }
        public async Task<string> SendToTopicAsync(SendNotificationToSubscribersRequest request)
        {
            try
            {
                var message = new Message()
                {
                    Topic = request.topic,
                    Notification = new Notification()
                    {
                        Title = request.title,
                        Body = request.body
                    },
                    //Android = new AndroidConfig()
                    //{
                    //    Priority = Priority.High,
                    //    Notification = new AndroidNotification()
                    //    {
                    //        Sound = "custom_sound" // NO .mp3 here
                    //    }
                    //},
                    Data = new Dictionary<string, string>()
                    {
                        { "click_action", "FLUTTER_NOTIFICATION_CLICK" }
                    }
                };

                var response = await FirebaseMessaging.DefaultInstance.SendAsync(message);
                return response;
            }
            catch (Exception ex)
            {
                throw new Exception($"Topic Notification Send Error: {ex.Message}");
            }
        }
        
        public async Task<string> SendToMultipleTokensAsync(SendNotificationToMultipleUsersRequest request)
        {
            var message = new MulticastMessage()
            {
                Tokens = request.tokens,
                Notification = new Notification()
                {
                    Title = request.title,
                    Body = request.body
                },
                //Android = new AndroidConfig()
                //{
                //    Priority = Priority.High,
                //    Notification = new AndroidNotification()
                //    {
                //        Sound = "custom_sound" // NO .mp3 here
                //    }
                //},
            };

            var response = await FirebaseMessaging.DefaultInstance.SendEachForMulticastAsync(message);
            
            return response.Responses.ToJson();
        }


        //public async Task<ServiceResponse<object>> SchedulePersonalizedNotificationAsync(ScheduledPersonalizedNotificationsRequest entity)
        //{
        //    try
        //    {
        //        if (entity == null ||  entity.Notifications == null || !entity.Notifications.Any())
        //        {
        //            return ServiceResponse<object>.FailureResponse("Notification data required");
        //        }

        //        var results = new List<object>();

        //        var successCount = 0;
        //        var failedCount = 0;

        //        foreach (var item in entity.Notifications)
        //        {
        //            try
        //            {
        //                var dbResponse = _objData.SchedulePersonalizedNotification(item, entity.deviceType);

        //                if (dbResponse.Result != "Y")
        //                {
        //                    failedCount++;

        //                    results.Add(new
        //                    {
        //                        UserId = item.userId,
        //                        IsSuccess = false,
        //                        Error = dbResponse.Message
        //                    });

        //                    continue;
        //                }

        //                successCount++;

        //                results.Add(new
        //                {
        //                    UserId = item.userId,
        //                    IsSuccess = true,
        //                    UserNotificationId = dbResponse.Data
        //                });
        //            }
        //            catch (Exception ex)
        //            {
        //                failedCount++;

        //                results.Add(new
        //                {
        //                    UserId = item.userId,
        //                    IsSuccess = false,
        //                    Error = ex.Message
        //                });
        //            }
        //        }

        //        return ServiceResponse<object>.SuccessResponse(new
        //        {
        //            TotalRequested = entity.Notifications.Count,
        //            SuccessCount = successCount,
        //            FailedCount = failedCount,
        //            Details = results
        //        });
        //    }
        //    catch (Exception ex)
        //    {
        //        return ServiceResponse<object>.FailureResponse(ex.Message);
        //    }
        //}

        //public async Task<ServiceResponse<object>> ScheduleGroupNotificationAsync(ScheduledGroupNotificationsRequest entity)
        //{
        //    try
        //    {
        //        if (entity == null)
        //        {
        //            return ServiceResponse<object>.FailureResponse( "Notification data required");
        //        }

        //        var dbResponse = _objData.ScheduleTopicNotification(entity);

        //        if (dbResponse.Result != "Y")
        //        {
        //            return ServiceResponse<object>.FailureResponse(dbResponse.Message);
        //        }

        //        return ServiceResponse<object>.SuccessResponse(
        //            new
        //            {
        //                Message = dbResponse.Message,
        //                Data = dbResponse.Data
        //            }
        //        );
        //    }
        //    catch (Exception ex)
        //    {
        //        return ServiceResponse<object>.FailureResponse(ex.Message);
        //    }
        //}
    }
}