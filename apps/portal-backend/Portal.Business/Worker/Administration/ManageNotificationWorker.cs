using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Data;

using Portal.Data;
using Portal.Business.Interface.Administration;
using Portal.Business.Worker.Utility;
using Portal.Entities.Administration;

namespace Portal.Business.Worker.Administration
{
    public class ManageNotificationWorker : IManageNotification
    {
        private readonly Repository objData;

        //Inject Repository via Constructor 
        public ManageNotificationWorker(Repository repository)
        {
            objData = repository ?? throw new ArgumentNullException(nameof(repository));
        }

        public DataTable GetNotificationListForDisplay(short RegionID, string Language = "")
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetNotificationListForDisplay(RegionID, Language);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetNotificationListForDisplay");
                throw ex;
            }
            return dt;
        }
        public DataTable GetArchivedNotificationListForDisplay(short RegionID, string Language = "")
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetArchivedNotificationListForDisplay(RegionID, Language);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetArchivedNotificationListForDisplay");
                throw ex;
            }
            return dt;
        }
        public DataTable GetNotificationList(short RegionID, short NotificationCategoryID)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetNotificationList(RegionID, NotificationCategoryID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetNotificationList");
                throw ex;
            }
            return dt;
        }
        public NotificationEntity GetNotificationsDetails(long NotificationID)
        {
            NotificationEntity obj = new NotificationEntity();
            try
            {
                DataTable dt = objData.GetNotificationsDetails(NotificationID);

                if (dt != null && dt.Rows.Count > 0)
                {
                    DataRow dr = dt.Rows[0];

                    obj.NotificationID = Convert.ToInt64(dr["NotificationID"]);
                    obj.NotificationCategoryID = Convert.ToInt32(dr["NotificationCategoryID"]);
                    obj.NotificationCategory = Convert.ToString(dr["NotificationCategory"]);
                    obj.NotificationTitle = Convert.ToString(dr["NotificationTitle"]);
                    obj.NotificationTitleMarathi = Convert.ToString(dr["NotificationTitleMarathi"]);
                    obj.DisplayStartDateTime = Convert.ToDateTime(dr["DisplayStartDateTime"]);
                    obj.DisplayEndDateTime = Convert.ToDateTime(dr["DisplayEndDateTime"]);
                    obj.PublishDateTime = Convert.ToDateTime(dr["PublishDateTime"]);

                    obj.DisplayStartDateTimeF = Convert.ToString(dr["DisplayStartDateTimeF"]);
                    obj.DisplayEndDateTimeF = Convert.ToString(dr["DisplayEndDateTimeF"]);
                    obj.PublishDateTimeF = Convert.ToString(dr["PublishDateTimeF"]);

                    obj.ContentType = Convert.ToString(dr["ContentType"]);
                    obj.TextContent = Convert.ToString(dr["TextContent"]);
                    obj.TextContentMarathi = Convert.ToString(dr["TextContentMarathi"]);
                    obj.FileContentName = Convert.ToString(dr["FileContentName"]);
                    obj.FileContentURL = Convert.ToString(dr["FileContentURL"]);
                    obj.OpenInNewPage = Convert.ToInt16(dr["OpenInNewPage"]);
                    obj.DisplayNewImage = Convert.ToInt16(dr["DisplayNewImage"]);
                    obj.IsActive = Convert.ToInt16(dr["IsActive"]);
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetNotificationsDetails");
                throw ex;
            }
            return obj;
        }
        public string SaveNotification(NotificationEntity entity)
        {
            string retVal = "";
            try
            {
                retVal = objData.SaveNotification(entity);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveNotification");
                retVal = ex.Message;
            }
            return retVal;
        }
        public string DeleteNotification(long NotificationID, string UserLoginID, string IPAddress)
        {
            string retVal = "";
            try
            {
                retVal = objData.DeleteNotification(NotificationID, UserLoginID, IPAddress);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "DeleteNotification");
                retVal = ex.Message;
            }
            return retVal;
        }
    }
}
