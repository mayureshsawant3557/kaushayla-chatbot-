using Portal.Entities;
using Portal.Entities.ExistingInstitute;
using Portal.Entities.Institute;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Business.Interface.ExistingInstitute
{
    public interface IExistingInstitute
    {
        PromotingOrganisationEntity GetPromotionalOrganisationDetails(InstituteInputEntity input);
        string SavePromotionalOrganisationDetails(PromotingOrganisationEntity entity);
        string SavePromotersDetails(PromotersDetailsEntity entity);
        PromotersDetailsEntity GetPromoterDetailsByID(long PromoterID);
        List<PromotersDetailsEntity> GetPromoterDetailsByInstituteID(InstituteInputEntity input);
        InstituteInfoEntity GetProposedInstituteDetails(long InstituteID, string userloginId);
        string SaveProposedInstituteDetails(ProposedInstituteInfoEntity entity);

        string SaveInstitute_PromoterStaffMappingDetails(PromotersDetailsEntity entity);
        string Delete_PromoterStaffMappingDetails(PromotersDetailsEntity entity);
        DataSet GetInstituteHeaderDashboard(long InstituteId, string InstituteCode);
        // Proposed Course details 
        List<ProposedCourseUnitDetailsEntity> GetProposedCourseUnitRequirementDetails(long InstituteID, long CourseId, string UserLoginID);

        DataSet GetProposedCourseUnitDetails(InstituteInputEntity entity);
        DataSet Institute_GetCourseUnitDetailsForNationalTrade(InstituteInputEntity entity);
        DataSet Institute_GetCoursesWiseRequirementDetails(InstituteInputEntity entity);
        string SaveProposedCourseUnitDetails(ProposedCourseUnitDetailsEntity entity);
        string DeleteProposedCourseUnitDetails(ProposedCourseUnitDetailsEntity entity);
        string SaveCourseUnitDetails(CourseUnitDetailsEntity entity);   
        string DeleteCourseUnitDetails(RenewalDetailsEntity entity);
        CourseUnitDetailsEntity GetCourseUnitDetails(CourseUnitDetailsEntity entity);

        string SaveInstituteVerificationDetails(ProposedInstituteInfoEntity entity);

        //institute profile 

        string LockInstituteForm(InstituteFormLockEntity entity);
        string UnlockInstituteForm(InstituteFormLockEntity entity);
        DataTable CheckInstituteFormFillingEligibility(InstituteFormEligibilityEntity entity);
        DataTable CheckInstituteRequestEligibility(InstituteFormEligibilityEntity entity);

        TraningEquiplemntEntity Inventory_GetEquipmentListDetails(InstituteInputEntity inputEntity);
        string Inventory_UpdateEquipmentAvailability(List<TrainingEquipmentListEntity> lstTrainingEquipmentList, List<TraningEquipmentPhotoEntity> lstPhoto, string PageCode);







    }
}
