import { baseURL } from "../config/baseConfig";

export const SaveCandidatePrimary = `${baseURL}/api/CandidatePrimary/SaveCandidatePrimary`;
export const GetCandidatePrimary = `${baseURL}/api/CandidatePrimary/GetCandidatePrimary`;
export const GetDuplicateAadharCandidatePrimary = `${baseURL}/api/CandidatePrimary/IsAadharNoDuplicate`;
export const  GetcandidateresultcertificatenewAPI   = `${baseURL}/api/Exam/candidate-result-certificate`;
export const  GetcandidateprintresultcertificateAPI   = `${baseURL}/api/Exam/candidate-print-result-certificate`;
export const  GetcandidateprintcertificateAPI   = `${baseURL}/api/Exam/candidate-print-certificate`;
// fix it in your endpoints file
export const GetcandidateprintnoticeAPI = `${baseURL}/api/Exam/candidate-print-notice`;
export const GetCandidateDashboard = `${baseURL}/api/CandidatePrimary/GetCandidateDashboard`;
