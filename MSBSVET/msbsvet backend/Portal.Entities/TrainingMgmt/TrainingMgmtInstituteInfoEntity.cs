using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.TrainingMgmt
{
    public class TrainingMgmtInstituteInfoEntity
    {
        public Int64 InstituteId { get; set; }
        public string InstituteCode { get; set; }
        public string InstituteName { get; set; }
        public string PromotingOrgName { get; set; }
        public string District { get; set; }
        public string Taluka { get; set; }
        public string Region { get; set; }
        public Int32 DistrictId { get; set; }
        public Int32 TalukadId { get; set; }
        public Int32 RegionId { get; set; }
        public string AuthPersonName { get; set; }
        public string AuthPersonMobileNo { get; set; }
        public string AuthPersonEmailId { get; set; }
        public string InstituteEmailId { get; set; }
        public List<CourseEntity> LstCourse { get; set; }
        public TrainingMgmtInstituteInfoEntity()
        {
            LstCourse = new List<CourseEntity>();
        }


    }
}
