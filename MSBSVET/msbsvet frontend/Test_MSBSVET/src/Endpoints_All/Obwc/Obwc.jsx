import { baseURL } from "../config/baseConfig";

export const GetBatchData = `${baseURL}/api/Obwc/GetBatchData`;
export const GetSaveUpdateOBWCResult = `${baseURL}/api/Obwc/GetSaveUpdateOBWCResult`;
export const UpdateBatchDate = `${baseURL}/api/Obwc/UpdateBatchDate`;
export const GetBatchOBWCResult = `${baseURL}/api/Obwc/GetBatchOBWCResult`;
export const GetBatchStatusOBWCResult = `${baseURL}/api/Obwc/GetBatchStatusOBWCResult`;
export const GetCourseOBWCResult = `${baseURL}/api/Obwc/GetCourseOBWCResult`;
export const GetDistrictOBWCResult = `${baseURL}/api/Obwc/GetDistrictOBWCResult`;
export const GetTraningPartnerOBWCResult = `${baseURL}/api/Obwc/GetTraningPartnerOBWCResult`;
export const GetResultByCandidate = `${baseURL}/api/Obwc/GetResultByCandidate`;
export const GetResultByBatchID = `${baseURL}/api/Obwc/GetResultByBatchID`;
export const GetSearchResult = `${baseURL}/api/Obwc/GetSearchResult`;
export const GetSearchResultExport = `${baseURL}/api/Obwc/GetSearchResultExport`;
export const GetResultByBatchIDExport = `${baseURL}/api/Obwc/GetResultByBatchIDExport`;
export const GetTraningPartnerOBWCResultForInstiutte = `${baseURL}/api/Obwc/GetTraningPartnerOBWCResultForInstiutte`;
export const GetBatchOBWCResultForInstiutte = `${baseURL}/api/Obwc/GetBatchOBWCResultForInstiutte`;
export const GetDistrictOBWCResultForInstitute = `${baseURL}/api/Obwc/GetDistrictOBWCResultForInstitute`;
export const GetCourseOBWCResultForInstitute = `${baseURL}/api/Obwc/GetCourseOBWCResultForInstitute`;
export const GetBatchTypeOBWCResult = `${baseURL}/api/Obwc/GetBatchTypeOBWCResult`;
export const GetResultSheetBatchCode = `${baseURL}/api/Obwc/GetResultSheetBatchCode`;
export const GetTraningPartnerOBWCResultMasters = `${baseURL}/api/Obwc/GetTraningPartnerOBWCResultMasters`;

// -- file-generating endpoints (return actual PDF/zip, use responseType: "blob") --
export const DownloadCertificate = `${baseURL}/api/Obwc/DownloadCertificate`;
export const DownloadPreCertificate = `${baseURL}/api/Obwc/DownloadPreCertificate`;
export const DownloadResultSheet = `${baseURL}/api/Obwc/DownloadResultSheet`;
export const DownloadDispatchSlip = `${baseURL}/api/Obwc/DownloadDispatchSlip`;
export const DownloadCertificateSingle = `${baseURL}/api/Obwc/DownloadCertificateSingle`;
