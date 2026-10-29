using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Institute
{
    public class CoursewisePowerRequirementEntity
    {
        public Int64 InstituteId { get; set; }
        public Int64 CourseID { get; set; }
        public string CourseCode { get; set; }
        public string CourseCodeName { get; set; }
        public string Course { get; set; }
        public int ApprovedUnits { get; set; }
        public int ProposedUnits { get; set; }
        public int TotalUnits { get; set; }
        public int RequiredPerUnit { get; set; }
        public string PhaseType { get; set; }
        public int RequiredPowerForApprovedUnits { get; set; }
        public int RequiredPowerForProposedUnits { get; set; }
        public int RequiredPowerForTotalUnits { get; set; }
        public int MaxTraningSetupRequired { get; set; }
        public int PerSetupPowerNorm { get; set; }
        public int InspectionUnits { get; set; }
        public int RequiredPower { get; set; }
        public string ModelCurriculum { get; set; }
    }

}
