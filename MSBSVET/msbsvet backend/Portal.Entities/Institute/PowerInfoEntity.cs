using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Institute
{
    public class PowerInfoEntity
    {
        public Int64 InstituteId { get; set; }
        public int AvailablePower { get; set; }
        public string AvailablePhase { get; set; }
        public string ElectricityBillPath { get; set; }
        public bool IsEditAllowed { get; set; }
        public bool IsDeleteAllowed { get; set; }
      //  public string LastModifiedOn { get; set; }
        public string UserLoginID { get; set; }
        public string IPAddress { get; set; }
        public string PageCode { get; set; }
        public int? IsMeterConnectionProposedInstitute { get; set; }
        public int? IsMeterConnectionPromotingOrganization { get; set; }
        public string MeterNOCfromOwner { get; set; }
        public int PowerAvailability { get; set; }
        public string RequiredSupplyType { get; set; }
        public string PowerRemark { get; set; }
        public string SupplyTypeRemark { get; set; }
        public List<CoursewisePowerRequirementEntity> LstRequiredPowerDetails { get; set; }
        public PowerInfoEntity()
        {
            LstRequiredPowerDetails = new List<CoursewisePowerRequirementEntity>();
        }
    }

    public class PowerInfoSaveRequest
    {
        public long InstituteId { get; set; }
        public int AvailablePower { get; set; }
        public string AvailablePhase { get; set; }
        public string ElectricityBillPath { get; set; }
        public string UserLoginID { get; set; }
        public string IPAddress { get; set; }
        public string PageCode { get; set; }
        public int IsMeterConnectionProposedInstitute { get; set; }
        public int IsMeterConnectionPromotingOrganization { get; set; }
        public string MeterNOCfromOwner { get; set; }
        // added 
        public int RequiredPower { get; set; }
        public int PowerAvailability { get; set; }
        public string RequiredSupplyType { get; set; }
        public string SupplyTypeVariation { get; set; }






    }



}
