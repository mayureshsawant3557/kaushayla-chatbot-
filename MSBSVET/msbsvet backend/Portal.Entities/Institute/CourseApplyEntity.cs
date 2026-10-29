using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Institute
{
    public class CourseApplyEntity
    {
        public Int64 CandidateID { get; set; }
        public Int64 CourseID { get; set; }
        public Int64 CollegeID { get; set; }
        public Int64 ApplicationID { get; set; }
		public Int16 AdmissionYearID { get; set; }
		public string UserLoginID { get; set; }

        public string IPAddress { get; set; }
        public string PageCode { get; set; }
    }
}
