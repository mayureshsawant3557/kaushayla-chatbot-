using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Institute
{
    public class RequiredLandDetailsEntity
    {
        public Int64 InstituteID { get; set; }
        public string InstituteCode { get; set; }
        public string CourseCode { get; set; }
        public string ModelCurriculum { get; set; }
        public string Course { get; set; }        
        public string? CourseCode_Course { get; set; }        
        public int ProposedUnits { get; set; }
        public int TotalUnits { get; set; }
        public int ApprovedUnits { get; set; }
        public decimal AgricultureLandArea { get; set; }
        public decimal OpenGroundArea { get; set; }
        public decimal InspectionUnits { get; set; }

       

    }
}
