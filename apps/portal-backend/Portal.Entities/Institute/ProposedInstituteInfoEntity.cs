//using AjaxControlToolkit;
using Portal.Entities.ExistingInstitute;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Institute
{
    public class ProposedInstituteInfoEntity
    {

        public Int64 InstituteID { get; set; }
        public string InstituteName { get; set; }
        public string InstituteAddress { get; set; }
        public Int16 StateID { get; set; }
        public string State { get; set; }
        public Int16 RegionID { get; set; }
        public string Region { get; set; }
        public Int32 DistrictID { get; set; }
        public string District { get; set; }
        public Int32 TalukaID { get; set; }
        public string Taluka { get; set; }
        public string City { get; set; }
        public Int32 CityID { get; set; }
        public string OtherCity { get; set; }

        public string PinCode { get; set; }
        public string STD { get; set; }
        public string PhoneNo { get; set; }
        public string FaxNo { get; set; }
        public string EMailID { get; set; }
        public string LocationCategory { get; set; }
        public int LocationCategoryID { get; set; }
        public string LastModifiedOn { get; set; }
        public DateTime? EstablishmentDate { get; set; }
        public string ResolutionPath { get; set; }
        public string Website { get; set; }
        public short InstituteStatusID { get; set; }
        public bool IsActive { get; set; }
        public string UserLoginID { get; set; }
        public string IPAddress { get; set; }
        public string PageCode { get; set; }

        public string MSBSVETRegistrationNumber { get; set; }
        public string MSBSVETApprovalDate { get; set; }
        public string MSBSVETApprovalLetterPath { get; set; }

        public string VTPRegistrationNumber { get; set; }
        public string VTPApprovalDate { get; set; }
        public string VTPApprovalLetterPath { get; set; }

        public string SmartTPRegistrationNumber { get; set; }
        public string SmartTPApprovalDate { get; set; }
        public string SmartTPApprovalLetterPath { get; set; }

        public string SmartTCRegistrationNumber { get; set; }
        public string SmartTCApprovalDate { get; set; }
        public string SmartTCApprovalLetterPath { get; set; }

        public string Latitude { get; set; }
        public string Longitude { get; set; }
        public string FrormStatus { get; set; }
        public string InstituteProfileVerificationRemark { get; set; }

        public List<OtherRegistrationDetailsEntity> lstOtherRegistrationDetailsEntity;
        public ProposedInstituteInfoEntity()
        {
            lstOtherRegistrationDetailsEntity = new List<OtherRegistrationDetailsEntity>();
        }

    }
}
