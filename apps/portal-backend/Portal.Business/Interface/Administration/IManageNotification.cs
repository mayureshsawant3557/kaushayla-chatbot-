using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Data;
using Portal.Entities;
using Portal.Entities.Administration;

namespace Portal.Business.Interface.Administration
{
    public interface IManageNotification
    {
        DataTable GetNotificationListForDisplay(Int16 RegionID, string Language = "");
        DataTable GetArchivedNotificationListForDisplay(Int16 RegionID, string Language = "");
        DataTable GetNotificationList(Int16 RegionID, Int16 NotificationCategoryID);
        NotificationEntity GetNotificationsDetails(Int64 NotificationID);
        string SaveNotification(NotificationEntity entity);
        string DeleteNotification(Int64 NotificationID, string UserLoginID, string IPAddress);
    }
}
