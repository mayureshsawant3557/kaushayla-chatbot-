import { baseURL } from '../config/baseConfig';

 
export const GetPromotionalOrganisationDetails = `${baseURL}/api/ExistingInstitute/GetPromotionalOrganisationDetails`;
export const GetProposedCourseUnitDetailsForNationalTrade = `${baseURL}/api/ExistingInstitute/GetProposedCourseUnitDetailsForNationalTrade`;
export const GetCoursesWiseRequirementDetails = `${baseURL}/api/ExistingInstitute/GetCoursesWiseRequirementDetails`;
export const GetProposedCourseUnitDetails = `${baseURL}/api/ExistingInstitute/GetProposedCourseUnitDetails`;
export const GetSelfDeclarationPath = '/api/InstituteBase/GetSelfDeclarationPath'

// Approval Order
export const GetApprovalOrder = `${baseURL}/Base/GetApprovalOrder`;
export const GetApprovalOrderByID = `${baseURL}/Base/GetApprovalOrderByID`;
export const SaveApprovalOrder = `${baseURL}/Base/SaveApprovalOrder`;
export const DeleteApprovalOrder = `${baseURL}/Base/DeleteApprovalOrder`;
