using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Staff
{
    public class StaffParentEntity
    {
        public Int64 StaffID { get; set; }
        public Int16 IsOrphan { get; set; }
        public string FatherFirstName { get; set; }
        public string FatherMiddleName { get; set; }
        public string FatherLastName { get; set; }
        public string MotherFirstName { get; set; }
        public string MotherMiddleName { get; set; }
        public string MotherLastName { get; set; }
        public string MaritalStatus { get; set; }
        public string SpouseTitle { get; set; }
        public string SpouseFirstName { get; set; }
        public string SpouseMiddleName { get; set; }
        public string SpouseLastName { get; set; }
        public string UserLoginID { get; set; }
        public string IPAddress { get; set; }
        public string PageCode { get; set; }
        public string FatherTitle { get; set; }
        public string MotherTitle { get; set; }
    }
}
