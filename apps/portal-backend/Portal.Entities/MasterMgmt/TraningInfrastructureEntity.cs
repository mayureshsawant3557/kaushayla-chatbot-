using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.MasterMgmt
{
    public class TraningInfrastructureEntity
    {
        public Int64 TraningInfrastructureRowID { get; set; }
        public Int64 CourseID { get; set; }
        public string NameofItem { get; set; }
        public int NameofItemID { get; set; }
        public string Category { get; set; }
        public int CategoryID { get; set; }
        public string RemarkforUtilization { get; set; }
        public int RemarkforUtilizationID { get; set; }
        public string DSRItem { get; set; }
        public string Mandatory { get; set; }
        public string AlliedCourseItem { get; set; }
        public string MoUItem { get; set; }
        public string RequirePerunit { get; set; }
        public int IsActive { get; set; }
    }
}
