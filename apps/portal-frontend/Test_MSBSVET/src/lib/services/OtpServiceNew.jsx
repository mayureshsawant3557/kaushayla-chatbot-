import Swal from "sweetalert2";
import agent from "../api/agent";
import {
    send_otp,
    verify_otp,
    resend_otp,
    save_otp_status
} from "../../Endpoints_All/OTP/otp";
import { openOtpSwal } from "../../utils/openOtpSwal";

const DEFAULT_CONFIG = {
    OTP_LENGTH: 4,
    MAX_ATTEMPTS: 3,
    RESEND_COOLDOWN: 30,
    TIMEOUT: 15000
};

const validateMobile = (mobile) => {
    if (!/^[6-9]\d{9}$/.test(mobile)) {
        throw new Error("Enter a valid 10-digit mobile number.");
    }
};

const checkDuplicateMobile = async (url, mobile) => {
    if (!url) return false;
    try {
        const res = await agent.get(`${url}/${mobile}`);
        return res.data?.Data?.length > 0;
    } catch (e) {
        if (e.response?.status === 404) return false;
        throw e;
    }
};

const sendOTP = async (mobile, purpose, timeout) => {
    const res = await agent.post(send_otp, {
        MobileNo: mobile,
        Purpose: purpose
    }, { timeout });

    if (!res.data.success) {
        throw new Error(res.data.message || "Failed to send OTP");
    }
};

const verifyOTP = async (mobile, otp, purpose, timeout) => {
    try {
        const res = await agent.post(
            verify_otp,
            {
                MobileNo: mobile,
                OTP: otp,
                Purpose: purpose
            },
            {
                timeout,
                silent: true // 👈 suppress global popup
            }
        );

        return res.data?.success === true;
    } catch (err) {
        // ❗ Wrong OTP lands here
        if (err.response?.status === 400 || err.response?.status === 401) {
            return false;
        }

        // real failure (network / server)
        throw err;
    }
};

const saveStatus = async (mobile, purpose, otp, verified) => {
    try {
        
        await agent.post(save_otp_status, {
            MobileNo: mobile,
            Purpose: purpose,
            OTP: otp,
            IsOTPVerified: verified
        });
    } catch {
        // silent
    }
};

const openOtpDialog = ({ mobile, config, purpose, messege }) => {
    let attempts = 0;
    let cooldown = 0;
    let timer;

    const updateAttemptsUI = () => {
        const el = document.getElementById("attempts-remaining");
        if (el) {
            el.innerText = config.MAX_ATTEMPTS - attempts;
        }
    };

    const startCooldown = () => {
        cooldown = config.RESEND_COOLDOWN;
        timer = setInterval(() => cooldown--, 1000);
    };

    return openOtpSwal({
        title: "OTP Verification",
        //html: `
        //    <p class="mb-2">OTP sent to ******${mobile.slice(-4)}</p>
        //    <input id="otp-input" class="swal2-input" maxlength="${config.OTP_LENGTH}" />
        //    <div id="otp-error" class="text-red-600 text-sm hidden"></div>
        //`,
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
        placeholder="Enter ${config.OTP_LENGTH}-digit OTP" 
        maxlength="${config.OTP_LENGTH}" 
    />

    <div id="otp-error" class="text-red-600 text-sm mt-2 hidden"></div>

    <div class="mt-4 text-sm text-gray-500">
        Attempts remaining: <span id="attempts-remaining">${config.MAX_ATTEMPTS}</span>
    </div>
`,
        showCancelButton: true,
        showDenyButton: true,
        confirmButtonText: "Verify",
        denyButtonText: "Resend OTP",
        allowOutsideClick: false,
        preConfirm: async () => {
            const otp = document.getElementById("otp-input").value;
            if (otp.length !== config.OTP_LENGTH) {
                Swal.showValidationMessage("Invalid OTP");
                return false;
            }

            const ok = await verifyOTP(mobile, otp, purpose, config.TIMEOUT);
            attempts++;
            updateAttemptsUI();
            
            await saveStatus(mobile, purpose, otp, ok);
            
            if (!ok) {
                if (attempts >= config.MAX_ATTEMPTS) {
                    Swal.showValidationMessage("Maximum attempts exceeded");
                    return false;
                }
                Swal.showValidationMessage("Incorrect OTP");
                return false;
            }

            clearInterval(timer);
            return true;
        }
    }).then(async (res) => {
        clearInterval(timer);

        if (res.isConfirmed) {
            return { verified: true, cancelled: false };
        }

        if (res.isDenied) {
            if (cooldown > 0) {
                Swal.fire("Wait", `Retry in ${cooldown}s`, "info");
                return openOtpDialog({ mobile, config, purpose, messege });
            }
            await sendOTP(mobile, purpose, config.TIMEOUT);
            startCooldown();
            return openOtpDialog({ mobile, config, purpose, messege });
        }

        return { verified: false, cancelled: true };
    });
};

const OTPService = {
    async verify({
        mobileNo,
        purpose = "Verification",
        messege = 'Your OTP code is {OTP}',
        isDuplicateCheck = false,
        duplicateCheckUrl = "",
        config = {}
    }) {
        const OTP_CONFIG = { ...DEFAULT_CONFIG, ...config };
        
        validateMobile(mobileNo);

        if (isDuplicateCheck) {
            const duplicate = await checkDuplicateMobile(
                duplicateCheckUrl,
                mobileNo
            );
            if (duplicate) {
                await Swal.fire("Duplicate", "Mobile already registered", "warning");
                return { verified: false, cancelled: true };
            }
        }

        await sendOTP(mobileNo, purpose, OTP_CONFIG.TIMEOUT);

        return openOtpDialog({
            mobile: mobileNo,
            config: OTP_CONFIG,
            purpose,
            messege
        });
    }
};

export default OTPService;
