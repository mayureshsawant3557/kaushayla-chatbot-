using Portal.Entities;
using Portal.Entities.Institute;
using Portal.Entities.Registration;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Business.Interface.Institute
{
    public interface IPromotionalOrganisation
    {
        PromotingOrganisationEntity GetPromotionalOrganisationDetails(InstituteInputEntity input);
        string SavePromotionalOrganisationDetails(PromotingOrganisationEntity entity);
        string SavePromotersDetails(PromotersDetailsEntity entity);
        PromotersDetailsEntity GetPromoterDetailsByID(long PromoterID);
        List<PromotersDetailsEntity> GetPromoterDetailsByInstituteID(InstituteInputEntity input);
        InstituteInfoEntity GetProposedInstituteDetails(long InstituteID, string userloginId);
        string SaveProposedInstituteDetails(InstituteInfoEntity entity);

        string SaveInstitute_PromoterStaffMappingDetails(PromotersDetailsEntity entity);
        string Delete_PromoterStaffMappingDetails(PromotersDetailsEntity entity);

        /// <summary>
        /// //////////////////////
        /// </summary>
        /// <param></param>
        /// <returns></returns>

        PromotingOrganizationRegistrationEntity GetPromotingOrganisationDetails(InstituteInputEntity entity);
        string SaveInstitute_AssociatedInstituteMappingDetails(PromotersDetailsMappingRequest entity);
        List<AssociatedInstituteEntity> GetAssociatedInstituteByPromotingOrganisationID(InstituteInputEntity input);
        string Delete_AssociatedInstituteMappingDetails(long Id, string UserLoginID, string IPAddress);
        string GetStatusProposedOrganisation(long ProposedOrganisationID);
        string UpdateProposedOrganisationStatus(long ProposedOrganisationID, string UserLoginID, string IPAddress, char StatusCode);
        DataTable SearchPromotingOrganization(int DistrictID, int TalukaID, int RegionID, string FormStatus, long InstituteID);
        DataSet GetPromotingOrganizationSearch(long InstituteId, string InstituteCode, char FormStatus);
        string SavePromotionalOrganisationDetailsVerification(PromotingOrganisationVerificationSave entity);
        string Update_AssociatedInstituteMappingDetails(List<AssociatedInstituteEntity> entity);
        string Update_PromoterStaffMappingDetails(List<PromotersDetailsEntity> entity);
        DataSet PromotingOrganizationDashboardRejectStatusCounts(string TableName, long PromotingOrganisationID, char StatusParam);
        string ConfirmPromotionalOrganisationDetails(long PromotingOrganisationId, string UserLoginID, string IpAddress);
        long GetPromotingOrganisationIDBYInstituteID(long InstituteID);

        //Add for the Checking the Duplicate Registration/ Incorporation Number/ GR Number in a 
        //promoting organization registration page.
        DuplicateCheckResultEntity CheckDuplicatePromotingOrganisation(CheckDuplicatePromotingOrganisationRequestEntity entity);
    }
}
