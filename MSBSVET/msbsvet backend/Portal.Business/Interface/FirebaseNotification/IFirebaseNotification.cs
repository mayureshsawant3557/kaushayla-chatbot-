using Portal.Entities.FirebaseNotification;
using Portal.Entities.ResponseBody;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Business.Interface.FirebaseNotification
{
    public interface IFirebaseNotification
    {
        Task<ServiceResponse<object>> RegisterFcmToken(FcmTokenRequest request);
        Task<ServiceResponse<object>> RemoveFcmToken(FcmTokenRequest request);
        Task<ServiceResponse<object>> UpdateUserNotificationStatus(UserNotificationStatusRequest request);
          

        Task<ServiceResponse<object>> SendToTokenAsync(SendNotificationToUserRequest request);
        Task<string> SendToTopicAsync(SendNotificationToSubscribersRequest request);
        Task<string> SendToMultipleTokensAsync(SendNotificationToMultipleUsersRequest request);

        //Task<ServiceResponse<object>> SchedulePersonalizedNotificationAsync(ScheduledPersonalizedNotificationsRequest request);
        //Task<ServiceResponse<object>> ScheduleGroupNotificationAsync(ScheduledGroupNotificationsRequest request);
    }
}
