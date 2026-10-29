import { baseURL } from '../config/baseConfig';

export const GetCandidateSummary = `${baseURL}/api/CandidateSummary/getsummary`;
export const LockCandidateForm = `${baseURL}/api/CandidateSummary/lockform`;
export const UnlockCandidateForm = `${baseURL}/api/CandidateSummary/unlockform`;
export const CheckCandidateURL = `${baseURL}/api/CandidateSummary/checkurl`;