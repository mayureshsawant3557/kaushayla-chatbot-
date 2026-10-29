using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Institute
{
    public class PromotingOrganisationVerificationSave
    {
        // Basic Info
        public long PromotingOrganisationID { get; set; }

        // Basic Info
        public string NameOfPromotingOrganization { get; set; }
        public DateTime? PromotingOrganizationRegistrationDate { get; set; }
        public string OrganizatioRegistrationNumber { get; set; }
        public int PromoterStatus { get; set; }
        public int PromotingOrganizationType { get; set; }
        public string PromotingOrganizationTypeOther { get; set; }

        // Address
        public string PromotingOrganizationAddress { get; set; }
        public string PromotingOrganizationPincode { get; set; }
        public int PromotingOrganizationStateID { get; set; }
        public int PromotingOrganizationDistrictID { get; set; }
        public int PromotingOrganizationTalukaID { get; set; }
        public string PromotingOrganizationCityName { get; set; }
        public string PromotingOrganizationCityID { get; set; }

        // Contact
        public string PromotingOrganizationPhoneNumber { get; set; }
        public string AuthorizedRepresentativeEMailID { get; set; }

        // Documents
        public string RegistrationCertificatePath { get; set; }
        public string PAN { get; set; }
        public string PANPath { get; set; }

        // Audit
        public string UserLoginID { get; set; }
        public string IPAddress { get; set; }

        // Approval Flags
        public string IsApprovedOrganizatioName { get; set; }
        public string IsApprovedPromotingOrganisationOtherType { get; set; }
        public string IsApprovedPromotingOrganisationStatus { get; set; }
        public string IsApprovedOrganizatioRegistrationNumber { get; set; }
        public string IsApprovedAuthorizedRepresentativeRegistrationNumber { get; set; }
        public string IsApprovedRegistrationCertificatePath { get; set; }
        public string IsApprovedAddress { get; set; }
        public string IsApprovedPinCode { get; set; }
        public string IsApprovedStateId { get; set; }
        public string IsApprovedTalukaId { get; set; }
        public string IsApprovedDistrictId { get; set; }
        public string IsApprovedCityVillage { get; set; }
        public string IsApprovedOtherCityVillage { get; set; }
        public string IsApprovedPAN { get; set; }
        public string IsApprovedPANPath { get; set; }
        public string IsApprovedPromotingOrganisationType { get; set; }
        public string IsApprovedEstablishmentDate { get; set; }

        // Reject Reasons
        public string RejectResionPromotingOrganisationType { get; set; }
        public string RejectResionPromotingOrganisationOtherType { get; set; }
        public string RejectResionPromotingOrganisationStatus { get; set; }
        public string RejectResionOrganizatioName { get; set; }
        public string RejectResionOrganizatioRegistrationNumber { get; set; }
        public string RejectResionAddress { get; set; }
        public string RejectResionPinCode { get; set; }
        public string RejectResionStateId { get; set; }
        public string RejectResionDistrictId { get; set; }
        public string RejectResionTalukaId { get; set; }
        public string RejectResionOtherCityVillage { get; set; }
        public string RejectResionCityVillage { get; set; }
        public string RejectResionRegistrationCertificatePath { get; set; }
        public string RejectResionPAN { get; set; }
        public string RejectResionPANPath { get; set; }
        public string RejectResionEstablishmentDate { get; set; }
    }
}
