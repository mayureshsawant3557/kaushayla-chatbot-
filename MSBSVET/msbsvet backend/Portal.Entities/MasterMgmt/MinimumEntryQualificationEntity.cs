using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.MasterMgmt
{
    public class MinimumEntryQualificationEntity
    {
        public Int64 CourseID { get; set; }
        public Int64 QualificationRowID {  get; set; }  
        public Int32 QualificationID { get; set; }
        public Int32 MandatoryCriteriaID { get; set; }
        public string ExperienceInMonth { get; set; }
        public string Remark { get; set; }

        public string Qualification { get; set; }
        public string MandatoryCriteria { get; set; }
    }
}
