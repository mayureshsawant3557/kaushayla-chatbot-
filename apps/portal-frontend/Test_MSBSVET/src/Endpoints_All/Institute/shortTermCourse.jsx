import { baseURL } from "../config/baseConfig";

export const GetShortTermApprovedCourseUnitDetails = `${baseURL}/api/InstituteBase/GetShortTermApprovedCourseUnitDetails`;

export const GetSTTCourseUnitDetailsForApprovalByCoureseID = `${baseURL}/api/InstituteBase/GetSTTCourseUnitDetailsForApprovalByCoureseID`;

export const GetShortTermProposedCourseUnitDetails = `${baseURL}/api/InstituteBase/GetShortTermProposedCourseUnitDetails`;

export const SaveShortTermProposedCourseUnitDetails = `${baseURL}/api/InstituteBase/SaveShortTermProposedCourseUnitDetails`;

export const DeleteShortTermProposedCourseUnitDetails = `${baseURL}/api/InstituteBase/DeleteShortTermProposedCourseUnitDetails`;

export const GetMasterSectorByITISTT = `${baseURL}/Base/GetMasterSectorByITISTT`;

export const GetCourseType = `${baseURL}/Base/GetCourseType`;

export const GetMasterCourseByITISTT = `${baseURL}/Base/GetMasterCourseByITISTT`;

export const GetShortTermApprovedCourseFees =
  "/api/InstituteBase/GetShortTermApprovedCourseFees";
