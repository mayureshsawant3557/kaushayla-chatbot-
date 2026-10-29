import { baseURL } from '../config/baseConfig';

export const send_otp = `${baseURL}/api/OTP/send-mobile-otp`;
export const verify_otp = `${baseURL}/api/OTP/verify-mobile-otp`;
export const resend_otp = `${baseURL}/api/OTP/resend-mobile-otp`;
export const save_otp_status = `${baseURL}/Base/SaveOTPVerificationStatus`;
export const check_duplicate_mobile = `${baseURL}/api/OTP/check-mobile-duplicate`;
export const send_message = `${baseURL}/api/OTP/send-message`;    
export const IsStaffAlreadyRegisteredUsingThisMobileNo =
    `${baseURL}/api/Registration/IsStaffAlreadyRegisteredUsingThisMobileNo`;