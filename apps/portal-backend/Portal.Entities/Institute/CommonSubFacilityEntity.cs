using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Institute
{
    public class CommonSubFacilityEntity
    {
        public Int64 InstituteId { get; set; }
        public int FacilityGroupId { get; set; }
        public string FacilityGroup { get; set; }
        public int SubFacilityGroupId { get; set; }
        public string SubFacilityGroup { get; set; }
        public int RequiredNumber { get; set; }
        public decimal RequiredSpace { get; set; }

        public int AvailableNumber { get; set; }
        public decimal AvailableSpace { get; set; }

        public int NumberVariation { get; set; }
        public decimal SpaceVariation { get; set; }
        public bool HasMultiplyFactor { get; set; }
        public decimal RequiredFinalSpace { get; set; }
        public bool IsActive { get; set; }
        public bool IsEditAllowed { get; set; }
        public string LastModifiedOn { get; set; }
        public string UserLoginID { get; set; }
        public string IPAddress { get; set; }

        public string PhotoPath { get; set; }
        public string FacilityXml { get; set; }

        public string TrainingEquipmentPhoto { get; set; }



    }
    public class CommonFacilityEntity
    {
        public List<CommonSubFacilityEntity> lstcommonSubFacilityEntities { get; set; }
        public List<TraningEquipmentPhotoEntity> lstTraningEquipmentPhoto { get; set; }

        public CommonFacilityEntity()
        {
            lstTraningEquipmentPhoto = new List<TraningEquipmentPhotoEntity>();
            lstcommonSubFacilityEntities = new List<CommonSubFacilityEntity>();
        }
    }
}
