using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
//using System.Web.UI.WebControls;

namespace Portal.Entities.Institute
{
    public class WorkshopEntity
    {
        public Int64 InstituteId { get; set; }
        public Int64 WorkshopId { get; set; }
        public Int64 CourseID { get; set; }
        public string CourseCode { get; set; }
        public string Course { get; set; }
        public string CourseCodeName { get; set; }

        public int InspectionUnits { get; set; }
        public int MaxTraningSetupRequired { get; set; }
        public int PerSetupNorm { get; set; }
        public int RequiredSpace { get; set; }
        public int SpaceAvailable { get; set; }
        public int SpaceAvailability { get; set; }
        public int ApprovedUnits { get; set; }


        public int ProposedUnits { get; set; }
        public int TotalUnits { get; set; }
        public int FloorId { get; set; }
        public string FloorPref { get; set; }
        public Decimal WorkSpaceForApprovedUnits { get; set; }
        public Decimal WorkSpaceForProposedUnits { get; set; }
        public Decimal WorkSpaceForTotalUnits { get; set; }
        public Decimal AvailableWorkshopSpace { get; set; }
        public Decimal WorkshopSpaceVariation { get; set; }
        public int AvailableFloorId { get; set; }
        public string AvailableFloorPref { get; set; }
        public string FloorPrefVariation { get; set; }
        public string WorkshopPhotoPath { get; set; }
        public string Workshopxml { get; set; }

        public bool IsEditAllowed { get; set; }
        public string LastModifiedOn { get; set; }
        public string UserLoginID { get; set; }
        public string IPAddress { get; set; }
        public string PageCode { get; set; }
        public string ModelCurriculum { get; set; }
        

    }

    public class WorkshopStatusResponse
    {
        public List<WorkshopEntity> Items { get; set; } = new List<WorkshopEntity>();
        public string SpaceRemark { get; set; }
        public string FloorRemark { get; set; }
    }
}
