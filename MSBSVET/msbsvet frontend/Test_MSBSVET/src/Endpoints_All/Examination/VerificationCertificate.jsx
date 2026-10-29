import { baseURL } from '../config/baseConfig';

export const RequestSignedVerificationCertificate = `${baseURL}/api/Certificate/RequestSignedVerificationCertificate`;
export const CandidateResultsDetails = `${baseURL}/api/Exam/candidate-results-details`;
export const CandidateResults = `${baseURL}/api/Exam/candidate-results`;
export const SaveResultCorrection = `${baseURL}/api/Exam/save-result-correction`;
export const GetResultCorrectionsForApproval = `${baseURL}/api/Exam/candidate-list-for-approve`;
export const GetCandidateResultsDetailsForApprove = `${baseURL}/api/Exam/candidate-results-details-for-approve`;
export const ApproveCandidateResult = `${baseURL}/api/Exam/update-candidate-result`;
export const RejectCandidateResult = `${baseURL}/api/Exam/update-candidate-result-reject`
export const GenerateResult = `${baseURL}/api/SystemResultPDF/GenerateResult`;
export const GenerateCertificate = `${baseURL}/api/SystemResultPDF/GenerateCertificate`;
export const CheckIsPreviouslyVerified = `${baseURL}/api/Exam/CheckIsPreviouslyVerified`;
export const GenerateSignedVerificationCertificate = `${baseURL}/api/SystemResultPDF/GenerateSignedVerificationCertificate`;
export const GetVerificationCertificateRequests = `${baseURL}/api/Exam/GetVerificationCertificateRequests`;
export const UpdateCertificateStatus = `${baseURL}/api/Exam/UpdateCertificateStatus`;