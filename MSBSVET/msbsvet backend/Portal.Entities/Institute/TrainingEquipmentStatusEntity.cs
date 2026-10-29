using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Institute
{
    public class TrainingEquipmentStatusEntity
    {
        public Int64 InstituteId { get; set; }
        public Int64 CourseID { get; set; }
        public string CourseCode { get; set; } 
        public string CourseCodeName { get; set; }
        public string Course { get; set; }
        public int ApprovedUnits { get; set; }
        public int ProposedUnits { get; set; }
        public int TotalUnits { get; set; }
        public int InspectionUnits { get; set; }
        public int MaxBatchPerDay { get; set; }
        public int MaxRequiredTrainingSetup { get; set; }
        public decimal PercentageAvailability { get; set; }

        public bool IsEditAllowed { get; set; } 
        public bool IsDeleteAllowed { get; set;}
        public string MOUApplicableStatus { get; set; }
        public string ModelCurriculum { get; set; }


    }
    public class TrainingEquipmentStatusResponse
    {
        public List<TrainingEquipmentStatusEntity> Items { get; set; } = new List<TrainingEquipmentStatusEntity>();
        public string Remarks { get; set; } = string.Empty;
    }
}
