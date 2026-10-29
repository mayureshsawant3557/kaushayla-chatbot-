import { baseURL } from '../config/baseConfig';

export const AdmissionAPI = `${baseURL}/api/Admission`;
export const GetCurrentAdmissionYearForApplication = `${baseURL}/Base/GetCurrentAdmissionYearForApplication`;
export const GetCurrentAdmissionYear = `${baseURL}/Base/GetCurrentAdmissionYear`;
export const GetApplicationIDByApplicationIDDisplay = `${baseURL}/Base/GetApplicationIDByApplicationIDDisplay`;
export const reportingDetailsAPI = `${baseURL}/api/Admission/reporting-details`;
export const admissionApplicationStatus = `${baseURL}/api/Admission/admission-application-status`;
export const admissionDetailsAPI = `${baseURL}/api/Admission/admission-details`;
export const reportingDetailsByInstitute = `${baseURL}/api/Admission/reporting-details-by-institute`;
export const getAdmissionSummary = "/api/Admission/admission-summary"; 
export const getCourseDetails = "/api/InstituteBase/GetCourseDetails";
export const getCandidateIDByApplication = "/Base/GetCandidateIDByApplicationID";
export const getCandidateID = "/Base/GetCandidateID";
export const GetAdmissionApplicationStatus =
  "/api/Admission/admission-application-status";
  export const getApplicationIDByApplicationIDDisplay =
  "/Base/GetApplicationIDByApplicationIDDisplay";
  export const getReportingDetails =
  "/api/Admission/reporting-details";
export const GetUnitByInstitute = `${baseURL}/api/InstituteBase/GetUnitByInstitute`;
export const GetBatchDetailsByInstitute = `${baseURL}/api/InstituteBase/GetBatchDetailsByInstitute`;
export const GETBatchDetails = `${baseURL}/api/InstituteBase/GETBatchDetails`;
export const UpdateBatchDetails = `${baseURL}/api/InstituteBase/UpdateBatchDetails`;
export const IsAdmissionDateOver = `${baseURL}/api/Admission/is-admission-date-over`;
export const GetNewBatchDetails =  `${baseURL}/api/InstituteBase/GetNewBatchDetails`;
export const SaveBatchDetails =  `${baseURL}/api/InstituteBase/SaveBatchDetails`;