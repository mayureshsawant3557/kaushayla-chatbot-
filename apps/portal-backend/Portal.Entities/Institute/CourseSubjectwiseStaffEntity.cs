using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Institute
{
    public class CourseSubjectwiseStaffEntity : CourseSubjectwiseDetailsEntity
    {
        public Int64 CourseSubjectwiseStaffMappingId { get; set; }
        public string StaffProfileId { get; set; }
        public string StaffFullName { get; set; }
        public bool IsEditAllowed { get; set; }
        public bool IsDeleteAllowed { get; set; }
        public string LastModifiedOn { get; set; }
        public string UserLoginID { get; set; }
        public string IPAddress { get; set; }
        public string PageCode { get; set; }

    }

}
