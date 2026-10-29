using Portal.Entities;
using Portal.Entities.Administration;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Data
{
    public partial class Repository
    {
        public DataTable GetNotificationListForDisplay(Int16 RegionID, string Language)
        {
            var param = new Dictionary<string, object>();

            param.Add("@RegionID", RegionID);
            param.Add("@Language", Language);

            return _dbAccess.GetDataTable("Administration_GetNotificationListForDisplay", param);
        }
        public DataTable GetArchivedNotificationListForDisplay(Int16 RegionID, string Language)
        {
            var param = new Dictionary<string, object>();

            param.Add("@RegionID", RegionID);
            param.Add("@Language", Language);

            return _dbAccess.GetDataTable("Administration_GetArchivedNotificationListForDisplay", param);
        }
        public DataTable GetNotificationList(Int16 RegionID, Int16 NotificationCategoryID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@RegionID", RegionID);
            param.Add("@NotificationCategoryID", NotificationCategoryID);

            return _dbAccess.GetDataTable("Administration_GetNotificationList", param);
        }
        public DataTable GetNotificationsDetails(Int64 NotificationID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@NotificationID", NotificationID);

            return _dbAccess.GetDataTable("Administration_GetNotificationDetails", param);
        }
        public string SaveNotification(NotificationEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@NotificationID", entity.NotificationID);
            param.Add("@NotificationCategoryID", entity.NotificationCategoryID);
            param.Add("@NotificationTitle", entity.NotificationTitle);
            param.Add("@NotificationTitleMarathi", entity.NotificationTitleMarathi);
            param.Add("@DisplayStartDateTime", entity.DisplayStartDateTime);
            param.Add("@DisplayEndDateTime", entity.DisplayEndDateTime);
            param.Add("@PublishDateTime", entity.PublishDateTime);
            param.Add("@ContentType", entity.ContentType);
            param.Add("@TextContent", entity.TextContent);
            param.Add("@TextContentMarathi", entity.TextContentMarathi);
            param.Add("@FileContentName", entity.FileContentName);
            param.Add("@FileContentURL", entity.FileContentURL);
            param.Add("@OpenInNewPage", entity.OpenInNewPage);
            param.Add("@DisplayNewImage", entity.DisplayNewImage);
            param.Add("@IsActive", entity.IsActive);
            param.Add("@RegionID", entity.RegionID);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);

            return _dbAccess.ExecuteScalar("Administration_SaveNotification", param).ToString();
        }
        public string DeleteNotification(Int64 NotificationID, string UserLoginID, string IPAddress)
        {
            var param = new Dictionary<string, object>();

            param.Add("@NotificationID", NotificationID);
            param.Add("@UserLoginID", UserLoginID);
            param.Add("@IPAddress", IPAddress);

            return _dbAccess.ExecuteScalar("Administration_DeleteNotification", param).ToString();
        }
    }
}
