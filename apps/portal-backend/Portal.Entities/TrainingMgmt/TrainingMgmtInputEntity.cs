using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.TrainingMgmt
{
    public class TrainingMgmtInputEntity
    {
        public Int64 InstituteId { get; set; }
        public Int32 DistrictId { get; set; }
        public Int32 RegionId { get; set; }
        public Int64 CourseID { get; set; }
        public string BatchType { get; set; }
        public string StaffProfileId { get; set; }
        public Int64 BatchId { get; set; }
        public Int64 SubjectId { get; set; }
        public string UserLoginID { get; set; }
        public string PageCode { get; set; }
        public string ItemId { get; set; }
        public string IPAddress { get; set; }
        public string ReportDate { get; set; }
        public Int64 CandidateId { get; set; }
        public TrainingMgmtInputEntity() {

            InstituteId = 0;
            DistrictId = 0;
            RegionId = 0;
            CandidateId = 0;
            CourseID = 0;
            BatchType = "";
            StaffProfileId = "";
            BatchId = 0;
            SubjectId = 0;
            UserLoginID = "";
            ItemId = "";
            IPAddress = "";
            ReportDate = "";
        }

    }
}
