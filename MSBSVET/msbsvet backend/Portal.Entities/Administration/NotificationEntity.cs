using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Administration

{
    public class NotificationEntity
    {
        public Int64 NotificationID { get; set; }
        public Int32 NotificationCategoryID { get; set; }
        public string NotificationCategory { get; set; }
        public string NotificationTitle { get; set; }
        public string NotificationTitleMarathi { get; set; }
        public DateTime DisplayStartDateTime { get; set; }     
        public DateTime DisplayEndDateTime { get; set; }
        public DateTime PublishDateTime { get; set; }

        public string DisplayStartDateTimeF { get; set; }
        public string DisplayEndDateTimeF { get; set; }
        public string PublishDateTimeF { get; set; }
        
        public string ContentType { get; set; }
        public string TextContent { get; set; }
        public string TextContentMarathi { get; set; }
        public string FileContentName { get; set; }
        public string FileContentURL { get; set; }
        public Int16 OpenInNewPage { get; set; }
        public Int16 DisplayNewImage { get; set; }
        public Int16 IsActive { get; set; }
        public Int16 RegionID { get; set; }
        public string UserLoginID { get; set; }
        public string IPAddress { get; set; }
    }
}
