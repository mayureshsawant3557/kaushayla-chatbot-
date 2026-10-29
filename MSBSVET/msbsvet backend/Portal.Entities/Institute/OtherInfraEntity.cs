using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Institute
{
    public class OtherInfraEntity
    {
        public Int64 InstituteId { get; set; }
        //public int OptionMappingId { get; set; }
        //public int OtherInfraId { get; set; }
        //public string OtherInfra { get; set; }
        //public int OtherInfraOptionId { get; set; }
        //public string OtherInfraOption { get; set; }
        //public string OtherInfraOptionText { get; set; }
        //public string OtherInfraxml { get; set; }
        //public string OtherInfraPhotoPath { get; set; }

        public int IsWaterSupply { get; set; }
        public int SourceofWaterSupplyID { get; set; }
        public string SourceofWaterSupply { get; set; }
        public string OtherSourceofWaterSupply { get; set; }
        public string WaterSupplyPhoto { get; set; }
        public int IsDisplayBoard { get; set; }
        public int IsBoardasperNorms { get; set; }
        public string BoardPhoto { get; set; }
        public bool IsEditAllowed { get; set; }
        public bool IsPhotoRequired { get; set; }
        public string LastModifiedOn { get; set; }
        public string UserLoginID { get; set; }
        public string IPAddress { get; set; }
        public string PageCode { get; set; }
        public int  InternetConnectivity { get; set; }
        public int CctvAvailable { get; set; }
    }
}
