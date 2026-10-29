using Microsoft.Practices.EnterpriseLibrary.Data;
using Portal.Entities;
using Portal.Entities.ExistingInstitute;
using Portal.Entities.Institute;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Data
{
    public partial class Repository
    {
        public DataTable GetPromotionalOrganisationDetails_ExistingInstitute(InstituteInputEntity entity)
        {

            var param = new Dictionary<string, object>();
            param.Add("@InstituteID", entity.InstituteId);
            param.Add("@UserLoginId", entity.UserLoginID);
            param.Add("@PageCode", entity.PageCode);

            //return _dbAccess.GetDataTable("Institute_GetPromotingOrganizationDetailsByOrganisationID", param);

            return _dbAccess.GetDataTable("ExistingInstitute_GetPromotingOrganizationDetails", param);

        }
        public string SavePromotionalOrganisationDetails_ExistingInstitute(PromotingOrganisationEntity entity)
        {
            var param = new Dictionary<string, object>();
            param.Add("@InstituteID", entity.InstituteID);
            param.Add("@OrganisationID", entity.OrganisationID);
            param.Add("@OrganizatioName", entity.PromotingOrganisationName);
            param.Add("@EstablishmentDate", entity.RegistrationDate);
            param.Add("@RegistrationNumber", entity.RegistrationNumber);
            param.Add("@PromotingOrganisationStatus", entity.PromotingOrganisationStatus);
            param.Add("@PromotingOrganisationType", entity.PromotingOrganisationType);
            param.Add("@OtherPromotingOrganisationType", entity.OtherPromotingOrganisationType);
            param.Add("@Address", entity.PAddress);
            param.Add("@PinCode", entity.PPincode);
            param.Add("@StateId", entity.PStateID);
            param.Add("@DistrictId", entity.PDistrictID);
            param.Add("@TalukaId", entity.PTalukaID);
            param.Add("@OtherCityVillage", entity.POtherCity);
            param.Add("@CityVillage", entity.PCityID);
            param.Add("@PhoneNo", entity.MobileNo);
            param.Add("@EmailId", entity.EMailID);
            param.Add("@RegistrationCertificatePath", entity.RegistrationCertificatePath);
            param.Add("@PAN", entity.PANNo);
            param.Add("@PANPath", entity.PANPath);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);
            //param.Add("@PageCode", entity.PageCode);

            return _dbAccess.ExecuteScalar("ExistingInstitute_SavePromotingOrganizationDetails", param).ToString();
        }
        public string SaveInstitute_PromoterStaffMappingDetails_ExistingInstitute(PromotersDetailsEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@PromoterID", entity.PromoterID);
            param.Add("@StaffProfileId", entity.StaffProfileId);
            param.Add("@InstituteID", entity.InstituteID);
            param.Add("@PromoterTypeID", entity.PromoterTypeID);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);

            return _dbAccess.ExecuteScalar("ExistingInstitute_SaveInstitute_PromoterStaffMappingDetails", param).ToString();

        }

        public string Delete_PromoterStaffMappingDetails_ExistingInstitute(PromotersDetailsEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@PromoterID", entity.PromoterID);
            param.Add("@InstituteID", entity.InstituteID);
            param.Add("@PromoterTypeID", entity.PromoterTypeID);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);
            param.Add("@PageCode", entity.PageCode);

            return _dbAccess.ExecuteScalar("ExistingInstitute_Delete_PromoterStaffMappingDetails", param).ToString();

        }
        public string SavePromotersDetails_ExistingInstitute(PromotersDetailsEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@PromoterID", entity.PromoterID);

            param.Add("@InstituteID", entity.InstituteID);
            param.Add("@PromoterTypeID", entity.PromoterTypeID);
            //param.Add("@IsPromoterAuthorisedRepresentive", entity.IsPromoterAuthorisedRepresentive);
            param.Add("@TitleID", entity.TitleID);
            param.Add("@FirstName", entity.FirstName);

            param.Add("@MiddleName", entity.MiddleName);
            param.Add("@LastName", entity.LastName);
            param.Add("@GenderCode", entity.GenderCode);
            param.Add("@DOB", entity.DOB);
            param.Add("@AadhaarNo", entity.AadhaarNo);
            param.Add("@Designation", entity.Designation);
            param.Add("@MobileNo", entity.MobileNo);

            param.Add("@AltMobileNo", entity.AltMobileNo);
            param.Add("@EmailId", entity.EMailID);
            param.Add("@PhoneNo", entity.PhoneNo == null ? "0" : entity.PhoneNo);
            param.Add("@AadhaarPath", entity.AadhaarPath);
            param.Add("@PhotoPath", entity.PhotoPath);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);
            //param.Add("@PageCode", entity.PageCode);

            return _dbAccess.ExecuteScalar("ExistingInstitute_SaveInstitute_PromoterDetails", param).ToString();
        }
        public DataTable GetPromoterDetailsByID_ExistingInstitute(Int64 PromoterID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@PromoterID", PromoterID);

            return _dbAccess.GetDataTable("ExistingInstitute_GetInstitute_PromoterDetailsByID", param);
        }
        public DataTable GetPromoterDetailsByInstituteID_ExistingInstitute(InstituteInputEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@InstituteID", entity.InstituteId);
            param.Add("@UserLoginId", entity.UserLoginID);
            param.Add("@PageCode", entity.PageCode);

            return _dbAccess.GetDataTable("ExistingInstitute_GetInstitute_PromoterDetailsByInstituteID", param);
        }

        public DataSet GetProposedInstituteDetails_ExistingInstitute(Int64 InstituteID, string userloginId)
        {
            var param = new Dictionary<string, object>();

            param.Add("@InstituteID", InstituteID);
            param.Add("@userloginId", userloginId);

            return _dbAccess.GetDataSet("ExistingInstitute_GetProposedInstituteDetails", param);
        }

        public string SaveProposedInstituteDetails_ExistingInstitute(ProposedInstituteInfoEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@InstituteID", entity.InstituteID);
            param.Add("@InstituteName", entity.InstituteName);
            param.Add("@EstablishmentDate", entity.EstablishmentDate);
            param.Add("@InstituteAddress", entity.InstituteAddress);
            param.Add("@StateID", entity.StateID);
            param.Add("@DistrictID", entity.DistrictID);
            param.Add("@TalukaID", entity.TalukaID);
            param.Add("@CityID", entity.CityID);
            param.Add("@OtherCity", entity.OtherCity);
            param.Add("@PinCode", entity.PinCode);
            param.Add("@LocationCategoryID", entity.LocationCategoryID);
            param.Add("@STD", entity.STD);
            param.Add("@PhoneNo", entity.PhoneNo);
            param.Add("@EMailID", entity.EMailID);
            param.Add("@ResolutionPath", entity.ResolutionPath);
            param.Add("@Website", entity.Website);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);

            param.Add("@VTPRegistrationNumber", entity.VTPRegistrationNumber);
            param.Add("@VTPApprovalDate", entity.VTPApprovalDate);// string.IsNullOrEmpty(entity.VTPApprovalDate) ? new DateTime(1900, 1, 1): DateTime.Parse(entity.VTPApprovalDate));
            param.Add("@VTPApprovalLetterPath", entity.VTPApprovalLetterPath);

            param.Add("@SmartTPRegistrationNumber", entity.SmartTPRegistrationNumber);
            param.Add("@SmartTPApprovalDate", entity.SmartTPApprovalDate);// string.IsNullOrEmpty(entity.SmartTPApprovalDate) ? new DateTime(1900, 1, 1) : DateTime.Parse(entity.SmartTPApprovalDate));

            param.Add("@SmartTPApprovalLetterPath", entity.SmartTPApprovalLetterPath);

            param.Add("@SmartTCRegistrationNumber", entity.SmartTCRegistrationNumber);
            param.Add("@SmartTCApprovalDate", entity.SmartTCApprovalDate);// string.IsNullOrEmpty(entity.SmartTCApprovalDate) ? new DateTime(1900, 1, 1) : DateTime.Parse(entity.SmartTCApprovalDate));
            param.Add("@SmartTCApprovalLetterPath", entity.SmartTCApprovalLetterPath);
            param.Add("@MSBSVETRegistrationNumber", entity.MSBSVETRegistrationNumber);
            param.Add("@MSBSVETApprovalDate", entity.MSBSVETApprovalDate); // string.IsNullOrEmpty(entity.MSBSVETApprovalDate) ? new DateTime(1900, 1, 1) : DateTime.Parse(entity.MSBSVETApprovalDate));
            param.Add("@MSBSVETApprovalLetterPath", entity.MSBSVETApprovalLetterPath);

            param.Add("@Latitude", entity.Latitude);
            param.Add("@Longitude", entity.Longitude);
            param.Add("@OtherRegistrationDetailsXML", GetXML(entity.lstOtherRegistrationDetailsEntity));

            return _dbAccess.ExecuteScalar("ExistingInstitute_SaveProposedInstituteDetails", param).ToString();
        }
        public DataSet GetInstituteHeaderDashboard(Int64 InstituteId, string InstituteCode)
        {
            var param = new Dictionary<string, object>();

            param.Add("@InstituteId", InstituteId);
            param.Add("@InstituteCode", InstituteCode);

            return _dbAccess.GetDataSet("ExistingInstitute_GetInstituteHeader", param);
        }

        // Proposed Course of New Institute
        public DataSet GetProposedCourseUnitRequirementDetails_ExistingInstitute(Int64 InstituteID, Int64 CourseId, string UserLoginID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@InstituteID", InstituteID);
            param.Add("@UserLoginID", UserLoginID);
            param.Add("@CourseID", CourseId);

            return _dbAccess.GetDataSet("ExistingInstitute_GetProposedCourseUnitRequirementDetails", param);
        }

        public DataSet GetProposedCourseUnitDetails_ExistingInstitute(InstituteInputEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@InstituteID", entity.InstituteId);
            param.Add("@CourseId", Convert.ToInt64(entity.ItemId));
            param.Add("@UserLoginId", entity.UserLoginID ?? string.Empty);
            param.Add("@PageCode", entity.PageCode ?? string.Empty);

            return _dbAccess.GetDataSet("ExistingInstitute_GetProposedCourseUnitDetails", param);
        }
        public DataSet Institute_GetCourseUnitDetailsForNationalTrade(InstituteInputEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@InstituteID", entity.InstituteId);
            param.Add("@CourseId", Convert.ToInt64(entity.ItemId));
            param.Add("@UserLoginId", entity.UserLoginID ?? string.Empty);
            param.Add("@PageCode", entity.PageCode ?? string.Empty);

            return _dbAccess.GetDataSet("Institute_GetCourseUnitDetailsForNationalTrade", param);
        }
        
public DataSet Institute_GetCoursesWiseRequirementDetails(InstituteInputEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@InstituteID", entity.InstituteId);
            param.Add("@CourseId", Convert.ToInt64(entity.ItemId));
            param.Add("@UserLoginId", entity.UserLoginID ?? string.Empty);
            param.Add("@PageCode", entity.PageCode ?? string.Empty);

            return _dbAccess.GetDataSet("Institute_GetCoursesWiseRequirementDetails", param);
        }


        public string SaveProposedCourseUnitDetails_ExistingInstitute(ProposedCourseUnitDetailsEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@InstituteID", entity.InstituteId);
            param.Add("@CourseId", entity.CourseId);
            param.Add("@ProposedUnits", entity.ProposedUnits);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);

            return _dbAccess.ExecuteScalar("ExistingInstitute_SaveProposedCourseUnitDetails", param).ToString();
        }

        public string DeleteProposedCourseUnitDetails_ExistingInstitute(ProposedCourseUnitDetailsEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@InstituteID", entity.InstituteId);
            param.Add("@CourseId", entity.CourseId);
            //param.Add("@ProposedUnits", entity.ProposedUnits);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);

            return _dbAccess.ExecuteScalar("ExistingInstitute_DeleteProposedCourseUnitDetails", param).ToString();
        }

        public string SaveCourseUnitDetails(CourseUnitDetailsEntity entity)
        {
            var param = new Dictionary<string, object>();
            param.Add("@ID", entity.ID);
            param.Add("@InstituteID", entity.InstituteID);
            param.Add("@CourseID", entity.CourseID);
            param.Add("@UnitNo", entity.UnitNo);
            param.Add("@ApprovalOrderDate", entity.ApprovalOrderDate);
            param.Add("@ApprovalOrder", entity.ApprovalOrder);
            param.Add("@ApprovalInspectionFeesApplicableAmount", entity.ApprovalInspectionFeesApplicableAmount);
            param.Add("@ApprovalInspectionFeesAmountPaid", entity.ApprovalInspectionFeesAmountPaid);
            param.Add("@ApprovalInspectionFeesModeOfPayment", entity.ApprovalInspectionFeesModeOfPayment);
            param.Add("@ApprovalInspectionFeesTransactionSlipPath", entity.ApprovalInspectionFeesTransactionSlipPath);
            param.Add("@ApprovalInspectionFeesAccount", entity.ApprovalInspectionFeesAccount);
            param.Add("@ApprovalInspectionFeesPaymentDate", entity.ApprovalInspectionFeesPaymentDate);
            param.Add("@ApprovalInspectionFeesTransactionId", entity.ApprovalInspectionFeesTransactionId);
            param.Add("@ApprovalInspectionFeesPaymentId", entity.ApprovalInspectionFeesPaymentId);
            param.Add("@ApprovalInspectionFeesVariation", entity.ApprovalInspectionFeesVariation);
            param.Add("@SecurityDepositDetailsApplicableAmount", entity.SecurityDepositDetailsApplicableAmount);
            param.Add("@SecurityDepositDetailsAmountPaid", entity.SecurityDepositDetailsAmountPaid);
            param.Add("@SecurityDepositDetailsModeOfPayment", entity.SecurityDepositDetailsModeOfPayment);
            param.Add("@SecurityDepositDetailsTransactionSlipPath", entity.SecurityDepositDetailsTransactionSlipPath);
            param.Add("@SecurityDepositDetailsAccount", entity.SecurityDepositDetailsAccount);
            param.Add("@SecurityDepositDetailsPaymentDate", entity.SecurityDepositDetailsPaymentDate);
            param.Add("@SecurityDepositDetailsTransactionId", entity.SecurityDepositDetailsTransactionId);
            param.Add("@SecurityDepositDetailsPaymentId", entity.SecurityDepositDetailsPaymentId);
            param.Add("@SecurityDepositDetailsVariation", entity.SecurityDepositDetailsVariation);
            param.Add("@CreatedBy", entity.UserLoginID);
            param.Add("@CreatedByIPAddress", entity.IPAddress);
            param.Add("@RenewalDetailXML", GetXML(entity.lstRenewalDetails));

            return _dbAccess.ExecuteScalar("ExistingInstitute_SaveCourseUnitIDDetails", param).ToString();
        }

        public string DeleteCourseUnitDetails(RenewalDetailsEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@ID", entity.ID);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);

            return _dbAccess.ExecuteScalar("ExistingInstitute_DeleteExistingInstitute_CourseUnitIDDetails", param).ToString();
        }
        public DataSet GetCourseUnitDetails(CourseUnitDetailsEntity entity)
        {
            var param = new Dictionary<string, object>();
            param.Add("@InstituteID", entity.InstituteID);
            param.Add("@CourseID", entity.CourseID);
            param.Add("@UnitNo", entity.UnitNo);
            return _dbAccess.GetDataSet("ExistingInstitute_GetCourseUnitDetails", param);
        }

        // Institute Form Lock/Unlock and Eligibility
        public string LockInstituteForm(InstituteFormLockEntity entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            var param = new Dictionary<string, object>();
            param.Add("@InstituteID", entity.InstituteID);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);
            param.Add("@PageCode", entity.PageCode);

            object result = _dbAccess.ExecuteScalar("ExistingInstitute_LockForm", param);
            return result?.ToString() ?? string.Empty;
        }

        public string UnlockInstituteForm(InstituteFormLockEntity entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            var param = new Dictionary<string, object>();
            param.Add("@InstituteID", entity.InstituteID);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);
            param.Add("@PageCode", entity.PageCode);

            object result = _dbAccess.ExecuteScalar("ExistingInstitute_UnlockForm", param);
            return result?.ToString() ?? string.Empty;
        }

        public DataTable CheckInstituteFormFillingEligibility(InstituteFormEligibilityEntity entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            var param = new Dictionary<string, object>();
            param.Add("@InstituteID", entity.InstituteID);
            param.Add("@UserLoginID", entity.UserLoginID);

            return _dbAccess.GetDataTable("ExistingInstitute_CheckFormFillingEligibility", param);
        }

        public DataTable CheckInstituteRequestEligibility(InstituteFormEligibilityEntity entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            var param = new Dictionary<string, object>();
            param.Add("@InstituteID", entity.InstituteID);
            param.Add("@UserLoginID", entity.UserLoginID);

            return _dbAccess.GetDataTable("ExistingInstitute_CheckRequestEligibility", param);
        }

        public DataSet Inventory_GetEquipmentListDetails(InstituteInputEntity entity)
        {
            var param = new Dictionary<string, object>();
            param.Add("@InstituteID", entity.InstituteId);
            param.Add("@UserLoginId", entity.UserLoginID);
            param.Add("@PageCode", entity.PageCode);
            param.Add("@CourseId", Convert.ToInt64(entity.ItemId));
            return _dbAccess.GetDataSet("Inventory_GetCourseEquipmentListDetails", param);
        }


        public string Inventory_UpdateEquipmentAvailability(List<TrainingEquipmentListEntity> lstTrainingEquipmentList, List<TraningEquipmentPhotoEntity> lstPhoto, string PageCode)
        {
            var param = new Dictionary<string, object>();
            param.Add("@EquipmentDetails", GetXML(lstTrainingEquipmentList));
            param.Add("@TrainingEquipmentPhoto", GetXML(lstPhoto));
            param.Add("@PageCode", PageCode);

            return _dbAccess.ExecuteScalar("Inventory_UpdateEquipmentAvailability", param).ToString();
        }


        public string SaveInstituteVerificationDetails(ProposedInstituteInfoEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@InstituteID", entity.InstituteID);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);
            param.Add("@FrormStatus", entity.FrormStatus);
            param.Add("@InstituteProfileVerificationRemark", entity.InstituteProfileVerificationRemark);
            return _dbAccess.ExecuteScalar("ExistingInstitute_SaveInstituteVerificationDetails", param).ToString();
        }


    }

        
}
