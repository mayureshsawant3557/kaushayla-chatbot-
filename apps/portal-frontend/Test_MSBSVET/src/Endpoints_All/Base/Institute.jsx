import { baseURL } from '../config/baseConfig';

export const GetMasterInstitute = `${baseURL}/Base/GetMasterInstitute`;
export const GetInstituteIDByInstituteCode = `${baseURL}/Base/GetInstituteIDByInstituteCode`;
export const GetCurrentAdmissionYear = `${baseURL}/Base/GetCurrentAdmissionYear`;
export const GetCurrentFinancialYear = `${baseURL}/Base/GetCurrentFinancialYear`;
export const StateFundSaveAllocation = `${baseURL}/api/DVET/StateFund_SaveAllocation`;

export const GetDPDCDetailsByCollegeRegNo = `${baseURL}/api/InstituteBase/GetDPDCDetailsByCollegeRegNo`;
export const SaveDPDCFund = `${baseURL}/api/InstituteBase/SaveDPDCFund`;
export const GetIsGovCollege = `${baseURL}/Base/GetIsGovCollege`;
export const SaveInstituteManagementDetails = `${baseURL}/api/InstituteBase/SaveInstituteManagementDetails`;
export const DeleteInstituteManagementDetails = `${baseURL}/api/InstituteBase/DeleteInstituteManagementDetails`;
export const GetInstituteManagementDetails = `${baseURL}/api/InstituteBase/GetInstituteManagementDetails`;
export const GetCourseDetails = `${baseURL}/api/InstituteBase/GetCourseDetails`;



export const GetProposedInstituteDetails = `${baseURL}/api/ExistingInstitute/GetProposedInstituteDetails`;
export const SaveProposedInstituteDetails = `${baseURL}/api/ExistingInstitute/SaveProposedInstituteDetails`;
export const LockInstituteProfileDetails = `${baseURL}/api/ExistingInstitute/lockform`;
export const UnLockInstituteProfileDetails = `${baseURL}/api/ExistingInstitute/unlockform`;
export const IsEligible = `${baseURL}/api/ExistingInstitute/check-form-eligibility`;
export const IsVerified = `${baseURL}/api/ExistingInstitute/check-request-eligibility`;
export const GetPromoterDetailsByInstituteID = `${baseURL}/api/PromotionalOrganisation/GetPromoterDetailsByInstituteID`;
export const GetPromoterDetailsExistingInstituteByInstituteID = `${baseURL}/api/ExistingInstitute/GetPromoterDetailsByInstituteID`;

export const GetPromotingOrganisationIDByInstituteID = `${baseURL}/api/PromotionalOrganisation/GetPromotingOrganisationIDByInstituteID`;
export const GetPromotingOrganisationDetails = `${baseURL}/api/PromotionalOrganisation/GetPromotingOrganisationDetails`;
export const SaveInstitutePromoterStaffMappingDetails = `${baseURL}/api/PromotionalOrganisation/SaveInstitute_PromoterStaffMappingDetails`;
export const GetAssociatedInstituteByPromotingOrganisationID = `${baseURL}/api/PromotionalOrganisation/GetAssociatedInstituteByPromotingOrganisationID`;
export const DeleteAssociatedInstituteMappingDetails = `${baseURL}/api/PromotionalOrganisation/Delete_AssociatedInstituteMappingDetails`;
export const SaveInstituteAssociatedInstituteMappingDetails = `${baseURL}/api/PromotionalOrganisation/SaveInstitute_AssociatedInstituteMappingDetails`;
export const GetInstiuteInfo = `${baseURL}/Base/GetInstiuteInfo`;

export const GetMasterTableList = `${baseURL}/Base/GetMasterTableList`;

//export const CheckLOIGenerated = `${baseURL}/api/InstituteBase/CheckLOIGenerated`;

//export const GetInstituteIDByInstituteCode = `${baseURL}/Base/GetInstituteIDByInstituteCode`;


export const PromotingOrgGetProposedInstituteDetails = `${baseURL}/api/PromotionalOrganisation/GetProposedInstituteDetails`;
export const PromotingOrgGetProposedExistingInstituteDetails = `${baseURL}/api/ExistingInstitute/GetProposedInstituteDetails`;
export const GetInspectionUnitDetails_ExistingInstitute = `${baseURL}/api/InstituteBase/GetInspectionUnitDetails_ExistingInstitute`;
export const GetProposedCourseUnitDetails = `${baseURL}/api/InstituteBase/GetProposedCourseUnitDetails`;

export const GetPromotingOrganisationIDByTempInstituteID = `${baseURL}/Base/GetPromotingOrganisationIDByTempInstituteID`;
export const IsEditingAllowed = `${baseURL}/Base/IsEditingAllowed`;
export const SaveProposedInstituteDetail = `${baseURL}/api/PromotionalOrganisation/SaveProposedInstituteDetails`;
export const DeleteProposedCourseUnitDetails =`${baseURL}/api/InstituteBase/DeleteProposedCourseUnitDetails`;
export const GetMasterSector = `${baseURL}/Base/GetMasterSector`;
export const GetProposedCourseofGroupCourseApprovalGroupWise = `${baseURL}/api/InstituteBase/GetProposedCourseofGroupCourseApprovalGroupWise`;
export const GetSectorwiseCourseType = `${baseURL}/Base/GetSectorwiseCourseType`;
export const SaveProposedCourseUnitDetails = `${baseURL}/api/InstituteBase/SaveProposedCourseUnitDetails`;
export const GetInstituteDash = `${baseURL}/api/InstituteBase/GetInstituteDash`;
export const SaveLOIStatus = `${baseURL}/api/InstituteBase/SaveLOIStatus`;
export const GetTempInstituteDashBoard = `${baseURL}/api/InstituteBase/GetTempInstituteDashBoard`;

export const GetTrainingEquipmentListDetails = `${baseURL}/api/ExistingInstitute/GetInventoryEquipmentListDetails`;
export const UpdateTrainingEquipmentAvailability = `${baseURL}/api/ExistingInstitute/UpdateInventoryEquipmentAvailability`;

export const SaveInstituteVerificationDetails = `${baseURL}/api/ExistingInstitute/SaveInstituteVerificationDetails`; 
export const IsCourseEligibleForApplication = `${baseURL}/api/InstituteBase/is-course-eligible-for-application`;

export const GetInspectionCommitteeByApplicantDate = `${baseURL}/Base/GetInspectionCommitteeByApplicantDate`;



export const GetGreenFieldRequirement = `${baseURL}/api/InstituteBase/GetGreenFieldRequirement`;
export const SaveGreenFieldRequirement = `${baseURL}/api/InstituteBase/SaveGreenFieldRequirement`;
export const SaveGreenFieldRequirementBulk = `${baseURL}/api/InstituteBase/SaveGreenFieldRequirementBulk`;


export const SaveStatusGreenRequirement = `${baseURL}/api/InstituteBase/SaveStatusGreenRequirement`;
export const GetStatusGreenRequirement = `${baseURL}/api/InstituteBase/GetStatusGreenRequirement`;
export const UnlockStatusGreenRequirement = `${baseURL}/api/InstituteBase/UnlockStatusGreenRequirement`;