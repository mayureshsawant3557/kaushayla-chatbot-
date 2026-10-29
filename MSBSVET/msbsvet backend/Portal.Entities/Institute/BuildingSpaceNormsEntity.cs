using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Institute
{
    public class BuildingSpaceNormsEntity
    {
        public long CourseID { get; set; }
        public long InstituteID { get; set; }
        public string CourseNameCode { get; set; }
        public string ModelCurriculum { get; set; }


        public int InspectionUnits { get; set; }
        public int MaxTraningSetupRequired { get; set; }

        public int ApprovedUnits { get; set; }
        public int LOIProposedUnits { get; set; }
        public int LOITotalUnits { get; set; }
        public decimal PerUnitNorms { get; set; }
        public int FloorPreference { get; set; }
        public decimal AreaOnGroundFloor { get; set; }
        public decimal AreaonOtherthanGroundFloor { get; set; }
    }
}
