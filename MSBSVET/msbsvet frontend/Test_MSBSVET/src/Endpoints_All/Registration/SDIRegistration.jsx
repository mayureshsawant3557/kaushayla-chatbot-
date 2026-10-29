import { baseURL } from "../config/baseConfig";

export const GetApprovedInstituteId = `${baseURL}/Base/GetApprovedInstituteIDByInstituteCode`;
    
export const IsInstituteExist = `${baseURL}/Base/GetInstiuteInfo`;

export const CheckExistingInstituteSDIApplication = `${baseURL}/Base/CheckExistingInstituteSDIApplicationExists`;

export const GetInstituteIdByCode = `${baseURL}/Base/GetInstituteIDByInstituteCode`;

export const GetPromotingOrganisationDetails = `${baseURL}/api/PromotionalOrganisation/GetPromotingOrganisationDetails`;

export const GetStaffSummary = `${baseURL}/api/StaffSummary/GetStaffSummary`;

export const SaveInstituteDraft = `${baseURL}/Registration/SaveInstituteDraft`;

export const SubmitInstituteRegistration = `${baseURL}/api/Registration/RegisterInstitute`;

export const GetMasterMainCourseApply = `${baseURL}/Base/GetMasterMainCourseApply`;

export const GetMasterIgnoreWords = `${baseURL}/Base/GetMasterIgnoreWords`;

export const IsNewRegistrationStarted = `${baseURL}/Base/IsNewRegistrationStarted`;
