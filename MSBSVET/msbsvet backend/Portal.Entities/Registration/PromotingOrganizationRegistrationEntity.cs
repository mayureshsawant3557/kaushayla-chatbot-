using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Registration
{
    public class PromotingOrganizationRegistrationEntity
    {
        public Int64 PromotingOrganisationID { get; set; }  
        public string OrganizatioRegistrationNumber { get; set; }
        public Int16 PromotingOrganizationRegistrationFor { get; set; }
        public Int32 PromotingOrganizationType { get; set; }
        public string PromotingType { get; set; }
        public string PromotingOrganisationTypeName { get; set; }
        public string PromoterStatus { get; set; }
        public string PromotingOrganizationTypeOther { get; set; }
        public Int32 PromotingOrganizationStatusID { get; set; }

        public string NameOfPromotingOrganization { get; set; }

        public DateTime PromotingOrganizationRegistrationDate { get; set; }
        public string PromotingOrganizationAddress { get; set; }
        public string PromotingOrganizationPincode { get; set; }

        public Int32 PromotingOrganizationStateID { get; set; }
        public string PromotingOrganizationState { get; set; }
        public Int32 PromotingOrganizationDistrictID { get; set; }
        public string PromotingOrganizationDistrict { get; set; }
        public Int32 PromotingOrganizationTalukaID { get; set; }
        public string PromotingOrganizationTaluka { get; set; }

        public Int32 PromotingOrganizationCityID { get; set; }

        public string PromotingOrganizationCityName { get; set; } 
        public string PromotingOrganizationPhoneNumber { get; set; }
        public string ProfileIDforAuthorizedRepresentative { get; set; }
        public string AuthorizedRepresentativeTitle { get; set; }

        public string AuthorizedRepresentativeFirstName { get; set; }
        public string AuthorizedRepresentativeMiddleName { get; set; }
        public string AuthorizedRepresentativeLastName { get; set; }
        public string AuthorizedRepresentativeGenderCode { get; set; }
        public DateTime AuthorizedRepresentativeDOB { get; set; }
        public string AuthorizedRepresentativeAadharNo { get; set; }
        public string AuthorizedRepresentativeMobileNo { get; set; }
        public string AuthorizedRepresentativeAltMobileNo { get; set; }
        public string AuthorizedRepresentativeEMailID { get; set; }
        public Int16 AuthorizedRepresentativeSecurityQuestionID { get; set; }
        public string AuthorizedRepresentativeSecurityQuestionAnswer { get; set; }
        public string AuthorizedRepresentativePassword { get; set; }
        public string AuthorizedRepresentativeConfirmPassword { get; set; }
        public string UserLoginID { get; set; }
        public string IPAddress { get; set; }
        public string PageCode { get; set; }
        public Int16 IsAdmissionDataFetch { get; set; }

        public string ApplicationID { get; set; }
        public string RegistrationCertificatePath { get; set; }
        public string PAN { get; set; }
        public string PANPath { get; set; }

        public string IsApprovedOrganizatioName { get; set; }
        public string IsApprovedOrganizatioRegistrationNumber { get; set; }
        public string IsApprovedPromotingOrganisationType { get; set; }
        public string IsApprovedPromotingOrganisationOtherType { get; set; }
        public string IsApprovedPromotingOrganisationStatus { get; set; }
        public string IsApprovedEstablishmentDate { get; set; }
        public string IsApprovedAddress { get; set; }
        public string IsApprovedPinCode { get; set; }
        public string IsApprovedStateId { get; set; }
        public string IsApprovedDistrictId { get; set; }
        public string IsApprovedTalukaId { get; set; }
        public string IsApprovedOtherCityVillage { get; set; }
        public string IsApprovedCityVillage { get; set; }
        public string IsApprovedPhoneNo { get; set; }
        public string IsApprovedEmailId { get; set; }
        public string IsApprovedAuthorizedRepresentativeRegistrationNumber { get; set; }
        public string IsApprovedRegistrationCertificatePath { get; set; }
        public string IsApprovedPAN { get; set; }
        public string IsApprovedPANPath { get; set; }
        public string RejectResionOrganizatioName { get; set; }
        public string RejectResionOrganizatioRegistrationNumber { get; set; }
        public string RejectResionPromotingOrganisationType { get; set; }
        public string RejectResionPromotingOrganisationOtherType { get; set; }
        public string RejectResionPromotingOrganisationStatus { get; set; }
        public string RejectResionEstablishmentDate { get; set; }
        public string RejectResionAddress { get; set; }
        public string RejectResionPinCode { get; set; }
        public string RejectResionStateId { get; set; }
        public string RejectResionDistrictId { get; set; }
        public string RejectResionTalukaId { get; set; }
        public string RejectResionOtherCityVillage { get; set; }
        public string RejectResionCityVillage { get; set; }
        public string RejectResionPhoneNo { get; set; }
        public string RejectResionEmailId { get; set; }
        public string RejectResionAuthorizedRepresentativeRegistrationNumber { get; set; }
        public string RejectResionRegistrationCertificatePath { get; set; }
        public string RejectResionPANPath { get; set; }
        public string RejectResionPAN { get; set; }
    }


    public class CheckDuplicatePromotingOrganisationRequestEntity
    {
        public string OrganizatioRegistrationNumber { get; set; }
    }

    public class DuplicateCheckResultEntity
    {
        public Int32 IsDuplicate { get; set; }
        public string Message { get; set; }
    }

}
