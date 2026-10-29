using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Serialization;

namespace Portal.Entities.Institute
{
    public class ProposedCourseUnitDetailsEntityInspectionUnits
    {
        public long InstituteId { get; set; }
        public long CourseId { get; set; }
        public int ProposedUnits { get; set; }
        public int ApprovedUnits { get; set; }
        public int TotalUnits { get; set; }
        public int LOIProposedUnits { get; set; }
        public int LOITotalUnits { get; set; }
        public long SecurityDeposit { get; set; }
        public long InspectionFee { get; set; }
        public int InspectionUnits { get; set; }
        public int MaxBatchesPerDay { get; set; }
        public int MaxTraningSetupRequired { get; set; }
        public int RecommendedUnits { get; set; }
        public int RecommendedUnitsByBoard { get; set; }
        public int ApprovedCategoryID { get; set; }
        public string ApprovedCategory { get; set; }
    }

    public class UpdateInspectionUnitsRequest
    {
        public long InstituteID { get; set; }
        public List<ProposedCourseUnitDetailsEntityInspectionUnits> ProposedCourses { get; set; }
        public string CreatedBy { get; set; }
        public string IpAddress { get; set; }
    }




}
