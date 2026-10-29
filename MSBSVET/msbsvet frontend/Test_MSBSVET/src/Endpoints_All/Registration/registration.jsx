import { baseURL } from '../config/baseConfig';

export const CandidateRegistration = `${baseURL}/api/Registration/RegisterCandidate`;
export const StaffRegistration = `${baseURL}/api/Registration/RegisterStaff`;
export const IsMobileNoDuplicate = `${baseURL}/api/Registration/IsMobileNoDuplicate`;
export const RegisterPromotorOrganisation = `${baseURL}/api/Registration/RegisterPromotorOrganisation`;
export const RegisterComplaint =
    `${baseURL}/api/Registration/RegisterComplaint`; 
export const IsInstituteEligibleForApplyWithPromotingOgranisation = `${baseURL}/api/Registration/IsInstituteEligibleForApplyWithPromotingOgranisation`;

export const IsNewRegistrationStarted = `${baseURL}/Base/IsNewRegistrationStarted`;

export const CheckDuplicatePromotingOrganisation =
    `${baseURL}/api/PromotionalOrganisation/CheckDuplicatePromotingOrganisation`;