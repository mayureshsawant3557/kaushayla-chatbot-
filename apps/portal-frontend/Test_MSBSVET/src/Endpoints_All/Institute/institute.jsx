import { baseURL } from "../config/baseConfig";

export const GetInstituteIDByInstituteCode = `${baseURL}/Base/GetInstituteIDByInstituteCode`;
export const CheckLOIGenerated = `${baseURL}/api/InstituteBase/CheckLOIGenerated`;
export const GetInstituteDetails = `${baseURL}/api/InstituteBase/GetInstituteDetails`;
export const SearchInstitutePublic = `${baseURL}/api/InstituteBase/SearchInstitutePublic`;
export const SearchInstitute = `${baseURL}/api/InstituteBase/SearchInstitute`;
export const GetCourseDetails = `${baseURL}/api/InstituteBase/GetCourseDetails`;
export const GetDPDCDetailsByCollegeRegNo = `${baseURL}/api/InstituteBase/GetDPDCDetailsByCollegeRegNo`;
export const GetProposedInstituteStatus = `${baseURL}/api/InstituteBase/GetProposedInstituteStatus`;

export const GetAdmissionYear = `${baseURL}/Base/GetAdmissionYear`;

export const SearchSDILOI = `${baseURL}/api/InstituteBase/SearchSDILOI`;
export const UpdateInstituteVerificationStatus = `${baseURL}/api/InstituteBase/UpdateInstituteVerificationStatus`;

export const SearchInstitutes = `${baseURL}/api/InstituteBase/SearchInstitutes`;
//export const GetInstituteTodaySummary = `${baseURL}/api/Attendance/GetInstituteTodaySummary`;
export const GetInstituteSummaryByDate = `${baseURL}/api/Attendance/GetInstituteSummaryByDate`;

// Approval Order
export const GetApprovalOrdersByYear = `${baseURL}/api/InstituteBase/GetApprovalOrdersByYear`;
export const SaveCourseApprovalOrder = `${baseURL}/api/InstituteBase/SaveCourseApprovalOrder`;
export const GetCourseDetailsWithApprovalOrder = `${baseURL}/api/InstituteBase/GetCourseDetailsWithApprovalOrder`;
export const GetInstituteCodeDetails = `${baseURL}/api/InstituteBase/GetInstituteCodeDetails`;


export const GetInstituteRenewalDetails = `${baseURL}/api/InstituteBase/GetInstituteRenewalDetails`;


