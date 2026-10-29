using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Institute
{
    public class LandDetailsEntity
    {
        public Int64 InstituteID { get; set; }
        public string InstituteCode { get; set; }
        public Int64 LandID { get; set; }
        public string LandType { get; set; }
        public string LandTypeCode { get; set; }

        public decimal RequiredAgriLand { get; set; }
        public decimal RequiredOpenGroundLand { get; set; }

        public decimal RequiredLandArea { get; set; }        
        public decimal AvailableLandArea { get; set; }
        public decimal Variation { get; set; }
        public decimal DistanceToInstitute { get; set; }        
        public int OwnerShipTypeid { get; set; }
        public string OwnerShipType { get; set; }
        public string LeaseDate { get; set; }
        public string LeaseExpiryDate { get; set; }
        public string Land712FilePath { get; set; }
        public string LeaseFilePath { get; set; }
        public string GoogleMapPath { get; set; }
        public string LandPhotoPath { get; set; }
        public bool IsActive { get; set; }
        public string UserLoginID { get; set; }
        public string IPAddress { get; set; }
        public string PageCode { get; set; }
        public bool IsEditAllowed { get; set; }
        public bool IsDeleteAllowed { get; set; }
        public string Latitude { get; set; }
        public string Longitude { get; set; }

    }
}
