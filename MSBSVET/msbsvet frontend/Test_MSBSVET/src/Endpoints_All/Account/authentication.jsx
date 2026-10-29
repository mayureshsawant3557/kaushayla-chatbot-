import { baseURL } from '../config/baseConfig';

export const CandidateLogin = `${baseURL}/api/Account/password`;
export const CandidateLoginDetails = `${baseURL}/api/Account/userDetails`;
export const AccountPassword = `${baseURL}/api/Account/password`;
export const AccountLogin = `${baseURL}/api/Account/login`;
export const AccountLogout = `${baseURL}/api/Account/logout`;
export const checkOldPasswordAPI = `${baseURL}/api/Account/password`;
export const updatePasswordAPI = `${baseURL}/api/Account/updatePassword`;
export const forgotPasswordApi = `${baseURL}/api/Account/resetPassword`;
export const forgotPasswordByOTPApi = `${baseURL}/api/Account/forgotPasswordByOTP`;
export const verifyOTPAndResetPasswordApi = `${baseURL}/api/Account/verifyOTPAndResetPassword`;
export const getUserLoginIdApi = `${baseURL}/api/Account/userLoginId`;
export const autoLogin = `${baseURL}/api/Account/auto-login`;
export const generateToken = `${baseURL}/api/Account/generate-token`;
export const GetUserByUserName = `${baseURL}/api/Account/username`;

//added 
export const GetCurrentUser = `${baseURL}/api/Account/me`;