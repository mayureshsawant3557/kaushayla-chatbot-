using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Menu
{
    public class MenuEntity
    {
        public Int32 MenuID { get; set; }
        public Int32 UserTypeID { get; set; }
        public Int32 ParentMenuID { get; set; }
        public Int32 LinkID { get; set; }
        public DateTime DisplayStartDateTime { get; set; }
        public DateTime DisplayEndDateTime { get; set; }
        public string CSSClass { get; set; }
        public string GroupName { get; set; }
        public string Target { get; set; }
        public Int32 SeqNo { get; set; }
        public Int16 IsNew { get; set; }
        public Int16 IsActive { get; set; }
        public Int16 RegionID { get; set; }
        public string UserLoginID { get; set; }
        public string IPAddress { get; set; }
    }
}
