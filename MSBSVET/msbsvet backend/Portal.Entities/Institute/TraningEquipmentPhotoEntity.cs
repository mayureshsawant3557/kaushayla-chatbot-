using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
//using System.Web.UI.WebControls;

namespace Portal.Entities.Institute
{
    public class TraningEquipmentPhotoEntity
    {
        public Int64 ID { get; set; }
        public Int64 InstituteID { get; set; }
        public Int64 srno { get; set; }
        public Int64 CourseID { get; set; }
        public string PhotoPath { get; set; }
      
        public bool IsEditAllowed { get; set; }
        public string LastModifiedOn { get; set; }
        public string UserLoginID { get; set; }
        public string IPAddress { get; set; }
        public string PageCode { get; set; }

    }
}
