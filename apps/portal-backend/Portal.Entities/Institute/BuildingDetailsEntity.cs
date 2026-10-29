using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Institute
{
    public class BuildingDetailsEntity
    {
        public Int64 InstituteID { get; set; }
        public string InstituteCode { get; set; }
        public Int64 BuildingID { get; set; }
        public int BuildingNameTypeId { get; set; }
        public string BuildingNameType { get; set; }
        public int OwnerShipTypeid { get; set; }
        public string OwnerShipType { get; set; }
        public int BuildingStatusId { get; set; }
        public string BuildingStatus { get; set; }
        public int ConstructionTypeId { get; set; }
        public string ConstructionType { get; set; }
        public int UsageTypeId { get; set; }
        public string UsageType { get; set; }
        public int FloorId { get; set; }
        public string FloorName { get; set; }
        public int ConstructionYearId { get; set; }
        public string ConstructionYear { get; set; }
        public decimal RoadWidth { get; set; }
        public decimal GroundFloorArea { get; set; }
        public decimal OtherFloorArea { get; set; }
        public decimal TotalFloorArea { get; set; }
        public decimal CelingHeight { get; set; }
        public string LeaseDate { get; set; }
        public string LeaseExpiryDate { get; set; }
        public string Building712FilePath { get; set; }
        public string LeaseFilePath { get; set; }
        public string FloorPlanFilePath { get; set; }
        public string GoogleMapPath { get; set; }
        public string RoadDocPath { get; set; }
        public string BuildingPhotoPath { get; set; }

        public Decimal Latitude { get; set; }
        public Decimal Longitude { get; set; }

        public int BuildingOtherUsestatusId { get; set; }
        public string BuildingOtherUsestatus { get; set; }
        public string BuildingOtherUsestatusText { get; set; }
        public bool IsBuildingReady { get; set; }
        public bool IsDedicated { get; set; }
        public bool HasApproachRoad { get; set; }

        public bool IsActive { get; set; }
        public string UserLoginID { get; set; }
        public string IPAddress { get; set; }
        public string PageCode { get; set; }

        public bool IsEditAllowed { get; set; }

        public bool IsDeleteAllowed { get; set; }

    }
}
