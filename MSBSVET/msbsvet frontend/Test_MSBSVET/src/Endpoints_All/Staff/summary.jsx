import { baseURL } from '../config/baseConfig';

export const GetStaffSummary = `${baseURL}/api/StaffSummary/GetStaffSummary`;
export const RequestStaffVerification = `${baseURL}/api/StaffSummary/LockStaffForm`;
export const WithdrawStaffVerification = `${baseURL}/api/StaffSummary/UnlockStaffForm`;
export const GetStaffSectorialExpertiseList = `${baseURL}/api/StaffWorkExperience/GetStaffSectorialExpertiseList`;
export const CheckStaffURL = `${baseURL}/api/StaffSummary/CheckStaffURL`;