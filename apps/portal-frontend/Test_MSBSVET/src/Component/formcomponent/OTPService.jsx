import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { send_otp, verify_otp, resend_otp, save_otp_status } from "../../Endpoints_All/OTP/otp";
import publicAgent from '../../lib/api/publicAgent';

const OTPService = ({
    mobileNo,
    purpose = 'Verification',
    messege = 'Your OTP code is {OTP}',
    isVerifyRequired = true,
    isDuplicateCheck = false,
    duplicateCheckUrl = '',
    onSuccess,
    onError,
    onCancel,
    config = {}


}) => {
    const [otpLoading, setOtpLoading] = useState(false);
    const [currentOtp, setCurrentOtp] = useState(null);
    const [otpAttempts, setOtpAttempts] = useState(0);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [isVerified, setIsVerified] = useState(false);

    // Default configuration
    const defaultConfig = {
        MAX_ATTEMPTS: 3,
        RESEND_COOLDOWN: 30,
        OTP_LENGTH: 4,
        TIMEOUT: 15000,
        showDemo: false
    };

    const OTP_CONFIG = { ...defaultConfig, ...config };

    // Cooldown timer effect
    useEffect(() => {
        let timer;
        if (resendCooldown > 0) {
            timer = setInterval(() => {
                setResendCooldown(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [resendCooldown]);

    // Validate mobile number
    const validateMobileNumber = (mobile) => {
        if (!mobile) {
            throw new Error("Please enter a mobile number.");
        }
        if (!/^[6-9]\d{9}$/.test(mobile)) {
            throw new Error("Enter a valid 10-digit mobile number starting with 6-9.");
        }
        return true;
    };

    // Check for duplicate mobile number
    const checkDuplicateMobile = async (mobile) => {
        if (!isDuplicateCheck || !duplicateCheckUrl) return false;

        try {
            const response = await publicAgent.get(`${duplicateCheckUrl}/${mobile}`, {
                headers: { 'Accept': 'application/json' },
                timeout: OTP_CONFIG.TIMEOUT
            });

            if (response.data?.Data?.length > 0) {
                const registeredData = response.data.Data[0];
                if (registeredData.ApplicationID || registeredData.CandidateName) {
                    Swal.fire({
                        title: "Mobile Number Already Registered",
                        html: `
                            <div style="background-color: #fef2f2; border-left: 5px solid #dc2626; padding: 16px; border-radius: 8px; text-align: left;">
                                <p style="color: #dc2626; font-size: 15px; font-weight: 500; margin-bottom: 12px;">
                                    ?? This mobile number is already registered.
                                </p>
                                <div style="font-size: 14px; color: #374151;">
                                    <p><strong>Profile ID:</strong> ${registeredData.ApplicationID || 'N/A'}</p>
                                    <p><strong>Name:</strong> ${registeredData.CandidateName || 'N/A'}</p>
                                </div>
                                <p style="margin-top: 16px; color: #dc2626; font-size: 14px; font-weight: 500;">
                                    Please use a different mobile number.
                                </p>
                            </div>
                        `,
                        icon: "warning",
                        confirmButtonText: "OK"
                    });
                    return true;
                }
            }
            return false;
        } catch (error) {
            if (error.response?.status === 404) {
                return false; // No duplicate found
            }
            throw error;
        }
    };

    // Send OTP
    const sendOTP = async (mobile = mobileNo) => {
        try {
            setOtpLoading(true);

            const response = await publicAgent.post(send_otp, {
                MobileNo: mobile,
                Purpose: purpose
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                timeout: OTP_CONFIG.TIMEOUT
            });

            if (response.data.success) {
                const otp = response.data.otp || response.data.OTP;
                setCurrentOtp(otp);
                setOtpAttempts(0);
                showOTPDialog(otp, mobile);
                return { success: true, otp };
            } else {
                throw new Error(response.data.message || "Failed to send OTP");
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Failed to send OTP. Please try again.";

            Swal.fire({
                title: "OTP Error",
                text: errorMessage,
                icon: "error"
            });

            if (onError) onError(error);
            return { success: false, error: errorMessage };
        } finally {
            setOtpLoading(false);
        }
    };

    // Resend OTP
    const resendOTP = async (mobile = mobileNo) => {
        if (resendCooldown > 0) {
            Swal.fire({
                title: "Please Wait",
                text: `Please wait ${resendCooldown} seconds before requesting another OTP.`,
                icon: "info"
            });
            return;
        }

        try {
            Swal.fire({
                title: "Resending OTP",
                text: "Please wait...",
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

            const response = await publicAgent.post(resend_otp, {
                MobileNo: mobile,
                Purpose: purpose
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                timeout: OTP_CONFIG.TIMEOUT
            });

            Swal.close();

            if (response.data.success) {
                const newOtp = response.data.otp || response.data.OTP;
                setCurrentOtp(newOtp);
                setOtpAttempts(0);
                setResendCooldown(OTP_CONFIG.RESEND_COOLDOWN);
                showOTPDialog(newOtp, mobile);
                return { success: true, otp: newOtp };
            } else {
                throw new Error(response.data.message || "Failed to resend OTP");
            }
        } catch (error) {
            Swal.fire({
                title: "Resend Failed",
                text: error.response?.data?.message || "Failed to resend OTP. Please try again.",
                icon: "error"
            });
            return { success: false, error: error.message };
        }
    };

    // Verify OTP
    const verifyOTP = async (enteredOtp, mobile = mobileNo) => {
        try {
            const verifyResponse = await publicAgent.post(verify_otp, {
                MobileNo: mobile,
                OTP: enteredOtp,
                Purpose: purpose
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                timeout: OTP_CONFIG.TIMEOUT
            });

            if (verifyResponse.data.success) {
                await saveOTPVerificationStatus(mobile, enteredOtp, true);
                setIsVerified(true);
                setCurrentOtp(null);
                setOtpAttempts(0);

                Swal.fire({
                    title: "Verified ?",
                    text: "Mobile number verified successfully!",
                    icon: "success",
                    timer: 2000,
                    showConfirmButton: false,
                });

                if (onSuccess) onSuccess({ mobile, otp: enteredOtp, verified: true });
                return { success: true, verified: true };
            } else {
                throw new Error(verifyResponse.data.message || "Invalid OTP");
            }
        } catch (error) {

            const newAttempts = otpAttempts + 1;
            setOtpAttempts(newAttempts);
            await saveOTPVerificationStatus(mobile, enteredOtp, false);

            const errorMessage = error.response?.data?.message?.includes("expired")
                ? "OTP has expired. Please request a new OTP."
                : "Invalid OTP.";

            return {
                success: false,
                error: errorMessage,
                attempts: newAttempts,
                maxAttemptsReached: newAttempts >= OTP_CONFIG.MAX_ATTEMPTS
            };
        }
    };

    // Show OTP Dialog
    const showOTPDialog = (otp, mobile) => {
        Swal.fire({
            title: "OTP Verification",
            html: `
    <div class="text-left mb-5">
       <div class="mb-2 text-sm text-gray-700 bg-yellow-100 border-l-4 border-yellow-400 p-3 rounded font-medium text-center">
         ${messege}
        
</div>


        <div class="bg-emerald-100 p-3 rounded text-emerald-800 font-medium">
            OTP has been sent to Mobile No. ******${mobile.slice(-4)}.
        </div>
    </div>

    <input 
        type="text" 
        id="otp-input" 
        class="swal2-input text-center text-lg tracking-wider" 
        placeholder="Enter ${OTP_CONFIG.OTP_LENGTH}-digit OTP" 
        maxlength="${OTP_CONFIG.OTP_LENGTH}" 
    />

    <div id="otp-error" class="text-red-600 text-sm mt-2 hidden"></div>

    <div class="mt-4 text-sm text-gray-500">
        Attempts remaining: <span id="attempts-remaining">${OTP_CONFIG.MAX_ATTEMPTS}</span>
    </div>
`,

            showCancelButton: true,
            showDenyButton: true,
            confirmButtonText: "Verify OTP",
            denyButtonText: resendCooldown > 0 ? `Resend OTP (${resendCooldown}s)` : 'Resend OTP',
            cancelButtonText: "Close",
            allowOutsideClick: false,
            didOpen: () => {
                const input = document.getElementById('otp-input');
                input.focus();

                input.addEventListener('input', (e) => {
                    e.target.value = e.target.value.replace(/\D/g, '');
                });
            },
            preConfirm: async () => {
                const enteredOtp = document.getElementById("otp-input").value;
                const errorDiv = document.getElementById("otp-error");
                const attemptsSpan = document.getElementById("attempts-remaining");

                if (!enteredOtp) {
                    errorDiv.textContent = "Please enter the OTP.";
                    errorDiv.style.display = "block";
                    return false;
                }

                if (enteredOtp.length !== OTP_CONFIG.OTP_LENGTH) {
                    errorDiv.textContent = `OTP must be ${OTP_CONFIG.OTP_LENGTH} digits.`;
                    errorDiv.style.display = "block";
                    return false;
                }

                const result = await verifyOTP(enteredOtp, mobile);
                
                if (!result.success) {
                    if (result.maxAttemptsReached) {
                        errorDiv.textContent = "Maximum attempts exceeded. Please request a new OTP.";
                    } else {
                        const remainingAttempts = OTP_CONFIG.MAX_ATTEMPTS - result.attempts;
                        attemptsSpan.textContent = remainingAttempts;
                        errorDiv.textContent = result.error;
                    }
                    errorDiv.style.display = "block";
                    return false;
                }

                return true;
            }
        }).then((result) => {
            if (result.isDenied && resendCooldown === 0) {
                resendOTP(mobile);
            } else if (result.isDenied && resendCooldown > 0) {
                Swal.fire({
                    title: "Please Wait",
                    text: `Please wait ${resendCooldown} seconds before requesting another OTP.`,
                    icon: "info"
                });
            } else if (result.isDismissed && onCancel) {
                onCancel();
            }
        });
    };

    // Save OTP verification status
    const saveOTPVerificationStatus = async (mobile, otp, isVerified) => {
        try {
            const response = await publicAgent.post(save_otp_status, {
                MobileNo: mobile,
                Purpose: purpose,
                OTP: otp,
                IsOTPVerified: isVerified
            }, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });

            return response.data;
        } catch (error) {
            return null;
        }
    };

    // Main verification function
    const startVerification = async (mobile = mobileNo) => {
        try {
            // Validate mobile number
            validateMobileNumber(mobile);
            
            // Check for duplicate if required
            if (isDuplicateCheck) {
                const isDuplicate = await checkDuplicateMobile(mobile);
                if (isDuplicate) {
                    return { success: false, error: "Mobile number already registered" };
                }
            }

            // Send OTP if verification is required
            if (isVerifyRequired) {
                return await sendOTP(mobile);
            } else {
                // If verification not required, just call success
                if (onSuccess) onSuccess({ mobile, verified: false });
                return { success: true, verified: false };
            }
        } catch (error) {

            Swal.fire({
                title: "Verification Error",
                text: error.message || "Verification failed. Please try again.",
                icon: "error"
            });

            if (onError) onError(error);
            return { success: false, error: error.message };
        }
    };

    return {
        startVerification,
        sendOTP,
        resendOTP,
        verifyOTP,
        otpLoading,
        isVerified,
        otpAttempts,
        resendCooldown,
        currentOtp
    };
};

export default OTPService;
