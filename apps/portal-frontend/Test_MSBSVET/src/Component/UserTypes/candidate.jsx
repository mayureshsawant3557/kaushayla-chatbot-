import { useState, useRef, useEffect } from "react";
import FormComponent from "../formcomponent/FormComponent";
import DropdownComponent from "../formcomponent/DropdownComponent";
import SecurityQuestion from "../formcomponent/SecurityQuestion";
import CaptchaComponent from "../formcomponent/CaptchaComponent";
import { MdOutlinePersonAdd } from "react-icons/md";
import Swal from 'sweetalert2';
import { AiOutlineCheckCircle } from 'react-icons/ai';
import { useNavigate } from "react-router-dom";
import { CandidateRegistration, IsMobileNoDuplicate } from '../../Endpoints_All/Registration/registration';
import { GetIITIAdmissionData } from '../../Endpoints_All/ITIAdmission/itiAdmission';
import { getGender } from '../../Endpoints_All/Base/masterData';
import { useLoading } from "../../Hooks/useLoading";
import { send_otp, verify_otp, resend_otp, save_otp_status } from "../../Endpoints_All/OTP/otp";
import { DateInput } from "../formcomponent/DateInputComponent";
import agent from "../../lib/api/agent";
import { getDeviceIP } from "../../utils/CommonHelper";
import Captcha from "../base/Captcha";
import publicAgent from "../../lib/api/publicAgent";

const Candidate = () => {
    // Initial form state - moved to a constant for reuse in reset
    const initialFormState = {
        firstName: "",
        middleName: "",
        lastName: "",
        dob: "",
        gender: "",
        email: "",
        aadhaarNo: "",
        primaryMobile: "",
        secondaryMobile: "",
        itiRegistered: "",
        registrationNumber: "",
        dobFile: "",
        photoFilePath: "",
        signFilePath: "",
        dobFilePath: "",
        aadhaarFilePath: "",
    };

    // Initialize useLoading hook
    const { startLoading, stopLoading, isLoading } = useLoading();

    const navigate = useNavigate();
    const [formData, setFormData] = useState(initialFormState);
    const [genderOptions, setGenderOptions] = useState([]);
    const [isVerified, setIsVerified] = useState(false);
    const [errors, setErrors] = useState({});
    const [captchaVerified, setCaptchaVerified] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [currentOtp, setCurrentOtp] = useState(null);
    const [otpAttempts, setOtpAttempts] = useState(0);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [dob, setDob] = useState("");
    const [ipAddress, setIpAddress] = useState("");


    // New states for ITI registration flow
    const [showItiFields, setShowItiFields] = useState(false);
    const [showRemainingFields, setShowRemainingFields] = useState(false);
    const [registrationVerified, setRegistrationVerified] = useState(false);

    const SecurityQuestionRef = useRef();
    const CaptchaRef = useRef();

    // OTP Configuration
    const OTP_CONFIG = {
        MAX_ATTEMPTS: 3,
        RESEND_COOLDOWN: 60, // 60 seconds
        OTP_EXPIRY: 300, // 5 minutes
        MAX_RESEND_ATTEMPTS: 5
    };
    useEffect(() => {
        fetchIP();
    })

    // Cooldown timer effect
    useEffect(() => {
        let timer;
        if (resendCooldown > 0) {
            timer = setTimeout(() => {
                setResendCooldown(resendCooldown - 1);
            }, 1000);
        }
        return () => clearTimeout(timer);
    }, [resendCooldown]);

    // Safe AI Assistant Autofill event listener
    useEffect(() => {
        const handleAutofill = (e) => {
            if (e && e.detail) {
                const d = e.detail;
                
                // ITI registration flow control
                if (d.itiRegistered === "yes") {
                    setShowItiFields(true);
                    setShowRemainingFields(false);
                } else {
                    // Reveal remaining fields on form so user can immediately see and verify values
                    setShowRemainingFields(true);
                    setShowItiFields(false);
                }

                // Normalize gender if provided
                let normalizedGender = d.gender;
                if (normalizedGender) {
                    const g = String(normalizedGender).toLowerCase().trim();
                    if (g === 'm' || g === 'male' || g.includes('पुरुष') || g.includes('purush') || g.includes('boy') || g.includes('man')) {
                        normalizedGender = 'M';
                    } else if (g === 'f' || g === 'female' || g.includes('महिला') || g.includes('स्त्री') || g.includes('mahila') || g.includes('girl') || g.includes('woman')) {
                        normalizedGender = 'F';
                    } else if (g === 'o' || g === 'other' || g.includes('इतर')) {
                        normalizedGender = 'O';
                    }
                }

                // Normalize DOB to DD/MM/YYYY for DateInput component
                let normalizedDob = d.dob;
                if (normalizedDob && /^\d{4}-\d{2}-\d{2}$/.test(normalizedDob)) {
                    const [y, m, day] = normalizedDob.split('-');
                    normalizedDob = `${day}/${m}/${y}`;
                }

                // Filter out filler words like "आहे", "हो", "नाही" from name fields
                const STOP_WORDS = new Set(['आहे', 'हे', 'हो', 'होय', 'नाही', 'नको', 'skip', 'cancel', 'wait', 'stop']);
                const validFirstName = d.firstName && !STOP_WORDS.has(d.firstName.trim().toLowerCase()) ? d.firstName : null;
                const validMiddleName = d.middleName && !STOP_WORDS.has(d.middleName.trim().toLowerCase()) ? d.middleName : null;
                const validLastName = d.lastName && !STOP_WORDS.has(d.lastName.trim().toLowerCase()) ? d.lastName : null;

                setFormData(prev => ({
                    ...prev,
                    itiRegistered: d.itiRegistered || prev.itiRegistered || "no",
                    ...(d.registrationNumber && { registrationNumber: d.registrationNumber }),
                    ...(validFirstName && { firstName: validFirstName }),
                    ...(validMiddleName && { middleName: validMiddleName }),
                    ...(validLastName && { lastName: validLastName }),
                    ...(d.email && { email: d.email }),
                    ...(d.primaryMobile && { primaryMobile: d.primaryMobile }),
                    ...(d.secondaryMobile && { secondaryMobile: d.secondaryMobile }),
                    ...(normalizedGender && { gender: normalizedGender }),
                    ...(normalizedDob && { dob: normalizedDob }),
                }));
                if (normalizedDob) {
                    setDob(normalizedDob);
                }

                // Clear validation errors for newly filled fields
                setErrors(prev => {
                    const next = { ...prev };
                    if (d.firstName) delete next.firstName;
                    if (d.middleName) delete next.middleName;
                    if (d.lastName) delete next.lastName;
                    if (d.email) delete next.email;
                    if (d.primaryMobile) delete next.primaryMobile;
                    if (d.secondaryMobile) delete next.secondaryMobile;
                    if (normalizedDob) delete next.dob;
                    if (normalizedGender) delete next.gender;
                    if (d.registrationNumber) delete next.registrationNumber;
                    delete next.itiRegistered;
                    return next;
                });
            }
        };
        window.addEventListener('msbsvet:autofill', handleAutofill);
        return () => window.removeEventListener('msbsvet:autofill', handleAutofill);
    }, []);

    // Get gender options from API
    useEffect(() => {
        const fetchGenderOptions = async () => {
            try {
                const response = await agent.get(getGender);
                const formattedGenders = response.data.map((g) => ({
                    value: g.GenderCode,
                    label: g.Gender,
                }));
                setGenderOptions(formattedGenders);
            } catch (error) {
                console.error("Error fetching genders:", error);
                // Fallback gender options
                setGenderOptions([
                    { value: "M", label: "Male" },
                    { value: "F", label: "Female" },
                    { value: "O", label: "Other" }
                ]);
            }
        };

        fetchGenderOptions();
    }, []);
    const fetchIP = async () => {
        try {
            const ip = await getDeviceIP();
            setIpAddress(ip);
        } catch (err) {
            console.error("Failed to get IP:", err);
        }
    };


    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));

        // Clear specific field error
        setErrors((prevErrors) => ({
            ...prevErrors,
            [name]: "",
        }));

        // Reset verification if mobile number changes
        if (name === "primaryMobile" && isVerified) {
            setIsVerified(false);
            setCurrentOtp(null);
            setOtpAttempts(0);
        }
    };

    // Handle ITI registration selection
    const handleItiRegistrationChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));

        // Clear specific field error
        setErrors((prevErrors) => ({
            ...prevErrors,
            [name]: "",
        }));

        // Show/hide fields based on selection
        if (value === "yes") {
            setShowItiFields(true);
            setShowRemainingFields(false);
            setRegistrationVerified(false);
        } else if (value === "no") {
            setShowItiFields(false);
            setShowRemainingFields(true);
            setRegistrationVerified(false);
            // Clear registration-related data
            setFormData(prev => ({
                ...prev,
                registrationNumber: ""
            }));
        }
    };

    // Reset form to initial state
    const resetForm = () => {
        setFormData(initialFormState);
        setIsVerified(false);
        setErrors({});
        setCaptchaVerified(false);
        setCurrentOtp(null);
        setOtpAttempts(0);
        setResendCooldown(0);
        setShowItiFields(false);
        setShowRemainingFields(false);
        setRegistrationVerified(false);

        if (SecurityQuestionRef.current) {
            SecurityQuestionRef.current.resetForm();
        }
        if (CaptchaRef.current) {
            CaptchaRef.current.refresh();
        }
    };

    // Enhanced form validation
    const validateForm = () => {
        let newErrors = {};

        // ITI registration validation
        if (!formData.itiRegistered) {
            newErrors.itiRegistered = "Please select Yes or No for ITI registration.";
        }

        // Name validation
        if (!formData.firstName.trim()) {
            newErrors.firstName = "First name is required.";
        } else if (formData.firstName.trim().length < 2) {
            newErrors.firstName = "First name must be at least 2 characters.";
        }

        // Date of birth validation
        if (!formData.dob) {
            newErrors.dob = "Date of birth is required.";
        } else {
            let dobDate;
            if (/^\d{2}\/\d{2}\/\d{4}$/.test(formData.dob)) {
                const [d, m, y] = formData.dob.split("/").map(Number);
                dobDate = new Date(y, m - 1, d);
            } else {
                dobDate = new Date(formData.dob);
            }
            const today = new Date();
            const age = today.getFullYear() - dobDate.getFullYear();
            if (isNaN(age) || age < 14 || age > 100) {
                newErrors.dob = "Please enter a valid date of birth (minimum 14 years).";
            }
        }

        // Gender validation
        if (!formData.gender && showRemainingFields) {
            newErrors.gender = "Gender selection is required.";
        }

        // Email validation (only for remaining fields)
        if (showRemainingFields) {
            if (!formData.email) {
                newErrors.email = "Email is required.";
            } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)) {
                newErrors.email = "Enter a valid email address.";
            }

            // Primary mobile validation
            if (!formData.primaryMobile) {
                newErrors.primaryMobile = "Primary mobile number is required.";
            } else if (!/^[6-9]\d{9}$/.test(formData.primaryMobile)) {
                newErrors.primaryMobile = "Enter a valid 10-digit mobile number starting with 6-9.";
            }

            // Mobile verification check
            if (!isVerified) {
                newErrors.primaryMobile = "Please verify your mobile number.";
            }

            // Secondary mobile validation (if provided)
            if (formData.secondaryMobile) {
                if (!/^[6-9]\d{9}$/.test(formData.secondaryMobile)) {
                    newErrors.secondaryMobile = "Enter a valid 10-digit mobile number starting with 6-9.";
                }
                if (formData.secondaryMobile === formData.primaryMobile) {
                    newErrors.secondaryMobile = "Secondary mobile must be different from primary mobile.";
                }
            }
        }

        // Registration number validation for ITI registered users
        if (formData.itiRegistered === "yes" && showItiFields) {
            if (!formData.registrationNumber) {
                newErrors.registrationNumber = "ITI Registration Number is required.";
            } else if (!/^202[1-5]/.test(formData.registrationNumber)) {
                newErrors.registrationNumber =
                    "Registration Number must start with a year from 2021 to 2025.";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Enhanced form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        const isFormValid = validateForm();
        const isSecurityValid = SecurityQuestionRef.current?.validateSecurity();
        const securityDetails = SecurityQuestionRef.current?.getSecurityDetails();
        const captchaIsValid = await CaptchaRef.current?.validate();

        setCaptchaVerified(captchaIsValid);

        if (!captchaIsValid) {
            setErrors(prev => ({ ...prev, captcha: "Please complete the CAPTCHA verification." }));
            setTimeout(() => {
                CaptchaRef.current?.refresh();
            }, 1000);
        }

        if (!isFormValid || !isSecurityValid || !captchaIsValid) {
            Swal.fire({
                title: "Validation Error",
                text: "Please check the form and fill in all required fields correctly.",
                icon: "error",
                confirmButtonText: "OK"
            });
            return;
        }

        const submissionData = {
            itiRegistrationNo: formData.itiRegistered === "yes" ? formData.registrationNumber : "",
            firstName: formData.firstName || "",
            middleName: formData.middleName || "",
            lastName: formData.lastName || "",
            genderCode: formData.gender || "",
            dob: formData.dob.includes('-') ?
                formData.dob : // If it's already in YYYY-MM-DD format, keep it
                formData.dob.split('/').reverse().join('-'),
            mobileNo: formData.primaryMobile || "",
            altMobileNo: formData.secondaryMobile || "",
            eMailID: formData.email,
            securityQuestionID: securityDetails.securityQuestionId || 0,
            securityQuestionAnswer: securityDetails.securityAnswer || "",
            password: securityDetails.password || "",
            userLoginID: "",
            ipAddress: ipAddress,
            pageCode: "Registration",
            isAdmissionDataFetch: 0,
            listJobRole: (formData.jobRoles || []).map(role => ({
                id: 0,
                candidateID: 0,
                jobRoleName: role || ""
            })),
            dobFilePath: formData.dobFile || "",
            aadhaarNo: formData.aadhaarNo || "",
            aadhaarFilePath: formData.aadhaarFile || "",
            photoFilePath: formData.photoFile || "",
            signFilePath: formData.signFile || ""
        };
        try {
            Swal.fire({
                title: "Submitting...",
                text: "Please wait while we process your registration",
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });


            const response = await agent.post(CandidateRegistration, submissionData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                timeout: 30000
            });


            Swal.close();

            if (response.data.success || response.status === 200 || response.status === 201) {
                Swal.fire({
                    title: "Registration Successful!",
                    text: "Your details have been submitted successfully.",
                    icon: "success",
                    confirmButtonText: "OK"
                }).then((result) => {
                    if (result.isConfirmed) {
                        resetForm();
                        navigate("/after-register", { state: { profileId: response.data.Data } });
                    }
                });
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            Swal.fire({
                title: "Submission Error",
                text: error.response?.data?.message || "Failed to submit registration. Please try again later.",
                icon: "error",
                confirmButtonText: "OK"
            });
        }
    };

    // Enhanced mobile number verification with improved error handling
    const handleVerifyClick = async () => {
        // Validation
        if (!formData.primaryMobile) {
            setErrors(prev => ({ ...prev, primaryMobile: "Please enter a mobile number." }));
            return;
        }

        if (!/^[6-9]\d{9}$/.test(formData.primaryMobile)) {
            setErrors(prev => ({ ...prev, primaryMobile: "Enter a valid 10-digit mobile number starting with 6-9." }));
            return;
        }

        // Clear mobile error
        setErrors(prev => {
            const { primaryMobile, ...rest } = prev;
            return rest;
        });

        setOtpLoading(true);

        try {
            // Check for duplicate mobile number
            const duplicateCheckUrl = `${IsMobileNoDuplicate}/${formData.primaryMobile}`;
            const duplicateResponse = await agent.get(duplicateCheckUrl, {
                headers: { 'Accept': 'application/json' },
                timeout: 10000
            });

            if (duplicateResponse.data?.Data?.length > 0) {
                const registeredData = duplicateResponse.data.Data[0];
                if (registeredData.ApplicationID || registeredData.CandidateName) {
                    setOtpLoading(false);
                    Swal.fire({
                        title: "Mobile Number Already Registered",
                        html: `
                            <div style="background-color: #fef2f2; border-left: 5px solid #dc2626; padding: 16px; border-radius: 8px; text-align: left;">
                                <p style="color: #dc2626; font-size: 15px; font-weight: 500; margin-bottom: 12px;">
                                    ⚠️ This mobile number is already registered.
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
                    return;
                }
            }

            // Proceed with OTP
            await sendOTP();

        } catch (error) {
            console.error("Error in verification process:", error);
            setOtpLoading(false);

            if (error.response?.status === 404) {
                // No duplicate found, proceed with OTP
                await sendOTP();
            } else {
                Swal.fire({
                    title: "Error",
                    text: "Failed to verify mobile number. Please try again.",
                    icon: "error"
                });
            }
        }
    };

    // Enhanced OTP sending function
    const sendOTP = async () => {
        startLoading();
        try {
            const response = await agent.post(send_otp, {
                MobileNo: formData.primaryMobile,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                timeout: 15000
            });

            setOtpLoading(false);

            if (response.data.success) {
                const otp = response.data.otp || response.data.OTP;
                setCurrentOtp(otp);
                setOtpAttempts(0);

                showOTPDialog(otp);
            } else {
                throw new Error(response.data.message || "Failed to send OTP");
            }

        } catch (error) {
            console.error("OTP Send Error:", error);
            setOtpLoading(false);

            Swal.fire({
                title: "OTP Error",
                text: error.response?.data?.message || "Failed to send OTP. Please try again.",
                icon: "error"
            });
        }
        stopLoading();
    };

    // Enhanced OTP dialog with better UX
    const showOTPDialog = (otp) => {
        Swal.fire({
            title: "OTP Verification",
            html: `
        <div style="text-align: left; margin-bottom: 20px;">
            <div style="background-color: #d1fae5; padding: 10px; border-radius: 5px; color: #065f46;">
                OTP has been sent to Mobile No. ******${formData.primaryMobile.slice(-4)}.
            </div>
            
        </div>
        <input type="text" id="otp-input" class="swal2-input" placeholder="Enter 4-digit OTP" maxlength="4" style="text-align: center; font-size: 18px; letter-spacing: 2px;" />
        <div id="otp-error" style="color: #dc2626; font-size: 14px; margin-top: 10px; display: none;"></div>
        <div style="margin-top: 15px; font-size: 14px; color: #6b7280;">
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

                // Auto-format OTP input
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

                if (enteredOtp.length !== 4) {
                    errorDiv.textContent = "OTP must be 4 digits.";
                    errorDiv.style.display = "block";
                    return false;
                }

                try {
                    const verifyResponse = await agent.post(
                        verify_otp,
                        {
                            MobileNo: formData.primaryMobile,
                            OTP: enteredOtp
                        },
                        {
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept': 'application/json'
                            },
                            timeout: 15000
                        }
                    );

                    if (verifyResponse.data.success) {
                        await saveOTPVerificationStatus(formData.primaryMobile, enteredOtp, true);
                        setIsVerified(true);
                        setCurrentOtp(null);
                        setOtpAttempts(0);

                        Swal.fire({
                            title: "Verified ✅",
                            text: "Mobile number verified successfully!",
                            icon: "success",
                            timer: 2000,
                            showConfirmButton: false,
                        });
                        return true;
                    } else {
                        throw new Error(verifyResponse.data.message || "Invalid OTP");
                    }
                } catch (error) {
                    console.error("OTP Verification Error:", error);

                    const newAttempts = otpAttempts + 1;
                    setOtpAttempts(newAttempts);

                    await saveOTPVerificationStatus(formData.primaryMobile, enteredOtp, false);

                    if (newAttempts >= OTP_CONFIG.MAX_ATTEMPTS) {
                        errorDiv.textContent = "Maximum attempts exceeded. Please request a new OTP.";
                        errorDiv.style.display = "block";
                        return false;
                    }

                    const remainingAttempts = OTP_CONFIG.MAX_ATTEMPTS - newAttempts;
                    attemptsSpan.textContent = remainingAttempts;

                    if (error.response?.data?.message?.includes("expired")) {
                        errorDiv.textContent = "OTP has expired. Please request a new OTP.";
                    } else {
                        errorDiv.textContent = `Invalid OTP. `;
                    }
                    errorDiv.style.display = "block";
                    return false;
                }
            },
        }).then((result) => {
            if (result.isDenied && resendCooldown === 0) {
                handleResendOTP();
            } else if (result.isDenied && resendCooldown > 0) {
                Swal.fire({
                    title: "Please Wait",
                    text: `Please wait ${resendCooldown} seconds before requesting another OTP.`,
                    icon: "info"
                });
            }
        });
    };

    // Enhanced OTP resend function
    const handleResendOTP = async () => {
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
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const response = await agent.post(resend_otp, {
                MobileNo: formData.primaryMobile,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                timeout: 15000
            });

            Swal.close();

            if (response.data.success) {
                const newOtp = response.data.otp || response.data.OTP;
                setCurrentOtp(newOtp);
                setOtpAttempts(0);
                setResendCooldown(OTP_CONFIG.RESEND_COOLDOWN);

                showOTPDialog(newOtp);
            } else {
                throw new Error(response.data.message || "Failed to resend OTP");
            }
        } catch (error) {
            console.error("Resend OTP Error:", error);
            Swal.fire({
                title: "Resend Failed",
                text: error.response?.data?.message || "Failed to resend OTP. Please try again.",
                icon: "error"
            });
        }
    };

    // Enhanced OTP verification status saving
    const saveOTPVerificationStatus = async (mobileNo, otp, isVerified) => {
        try {
            const response = await agent.post(
                save_otp_status,
                {
                    MobileNo: mobileNo,
                    Purpose: 'VerifyCandidateMobileNo',
                    OTP: otp,
                    IsOTPVerified: isVerified
                },
                {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    timeout: 10000
                }
            );
            return response.data;
        } catch (error) {
            console.error("Error saving OTP verification status:", error);
            return null;
        }
    };

    const formatDOB = (value) => {
        let v = value.replace(/\D/g, "").slice(0, 8);

        if (v.length > 4) return `${v.slice(0, 2)}/${v.slice(2, 4)}/${v.slice(4)}`;
        if (v.length > 2) return `${v.slice(0, 2)}/${v.slice(2)}`;
        return v;
    };

    // Enhanced admission data fetching with matching validation
    // Enhanced admission data fetching with matching validation
    const handleGetRegistrationDetails = async () => {
        // Validate required fields
        if (!formData.registrationNumber) {
            Swal.fire({
                title: "Registration Number Required",
                text: "Please enter your ITI Registration Number.",
                icon: "warning"
            });
            setErrors(prev => ({ ...prev, registrationNumber: "ITI Registration Number is required." }));
            return;
        }

        if (!formData.firstName.trim()) {
            Swal.fire({
                title: "First Name Required",
                text: "Please enter your First Name.",
                icon: "warning"
            });
            setErrors(prev => ({ ...prev, firstName: "First name is required." }));
            return;
        }

        if (!formData.dob) {
            Swal.fire({
                title: "Date of Birth Required",
                text: "Please enter your Date of Birth.",
                icon: "warning"
            });
            setErrors(prev => ({ ...prev, dob: "Date of birth is required." }));
            return;
        }

        if (!/^202[1-5]/.test(formData.registrationNumber)) {
            Swal.fire({
                title: "Invalid Registration Number",
                text: "Registration Number must start with 2021 or 2025.",
                icon: "error"
            });
            setErrors(prev => ({ ...prev, registrationNumber: "Registration Number must start with 2021 or 2025." }));
            return;
        }




        try {
            Swal.fire({
                title: "Fetching Data",
                text: "Please wait while we retrieve your admission data...",
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            // Format date for API call (DD/MM/YYYY format)
            const formatDateForAPI = (dateString) => {
                if (!dateString) return "";

                if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
                    return dateString;
                }

                if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
                    const [year, month, day] = dateString.split("-");
                    return `${day}/${month}/${year}`;
                }

                return "";
            };

            const formattedDOB = formatDateForAPI(formData.dob);

            // Updated API call with all three parameters
            const apiUrl = `${GetIITIAdmissionData}?ITIRegistrationNo=${encodeURIComponent(formData.registrationNumber)}&ITIFirstName=${encodeURIComponent(formData.firstName)}&ITIDOBITI=${encodeURIComponent(formattedDOB)}`;
            const response = await publicAgent.get(apiUrl, {
                headers: { 'Accept': 'application/json' },
                timeout: 30000
            });

            Swal.close();

            if (response.data?.Status === "Success" && response.data.Data) {
                const userData = response.data.Data;

                // Since backend now validates all three parameters, if we get data back, it means all details match
                // Show confirmation dialog
                let gender = userData.Gender || '';
                if (!gender && userData.GenderCode) {
                    gender = userData.GenderCode === "M" ? "Male" :
                        userData.GenderCode === "F" ? "Female" : userData.GenderCode;
                }

                const fullName = [userData.CandidateFirstName, userData.CandidateLastName]
                    .filter(Boolean).join(' ');

                Swal.fire({
                    title: "Verify your ITI Registration Details",
                    html: `
                    <div style="text-align: left; background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 10px 0;">
                        <p><strong>Name of the Applicant:</strong> ${fullName}</p>
                        <p><strong>Applicant's Father Name:</strong> ${userData.FatherName || 'N/A'}</p>
                    </div>
                    <p style="margin-top: 20px; font-weight: 500;">Are you sure your ITI Registration details are correct?</p>
                `,
                    icon: "question",
                    showCancelButton: true,
                    confirmButtonText: "Yes, Details are Correct",
                    cancelButtonText: "No, Cancel",
                    width: '500px'
                }).then((result) => {
                    if (result.isConfirmed) {
                        // Clear any previous errors
                        setErrors({});

                        // Update form data with retrieved information
                        setFormData(prevData => ({
                            ...prevData,
                            firstName: userData.CandidateFirstName || prevData.firstName,
                            lastName: userData.CandidateLastName || prevData.lastName,
                            gender: userData.GenderCode || prevData.gender,
                            email: userData.Email || "",
                            primaryMobile: userData.PrimaryMobileNo || "",
                            secondaryMobile: userData.SecondaryMobileNo || "",
                            middleName: userData.FatherName || ""
                        }));

                        setRegistrationVerified(true);
                        setShowRemainingFields(true);

                        Swal.fire({
                            title: "Success ✅",
                            text: "ITI Registration verified successfully! Please fill in the remaining details.",
                            icon: "success",
                            timer: 2000,
                            showConfirmButton: false
                        });
                    }
                });
            } else {
                // No data found or validation failed at database level
                Swal.fire({
                    title: "Verification Failed",
                    html: `
                    <div style="text-align: left; background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 10px 0;">
                        <p style="color: #dc2626; font-weight: 600; margin-bottom: 15px;">⚠️ No matching record found</p>
                        <p>The combination of:</p>
                        <ul style="margin: 10px 0; padding-left: 20px;">
                            <li>Registration Number: ${formData.registrationNumber}</li>
                            <li>First Name: ${formData.firstName}</li>
                            <li>Date of Birth: ${formattedDOB}</li>
                        </ul>
                        <p style="margin-top: 15px; color: #dc2626;">does not match our records. Please verify your details and try again.</p>
                    </div>
                `,
                    icon: "warning",
                    confirmButtonText: "OK"
                });
            }
        } catch (error) {
            console.error("Error fetching admission data:", error);
            Swal.close();

            if (error.response?.status === 400) {
                // Bad request - validation error
                Swal.fire({
                    title: "Validation Error",
                    text: error.response.data?.Message || "Please check your input data and try again.",
                    icon: "error"
                });
            } else {
                Swal.fire({
                    title: "Error",
                    text: "Failed to retrieve admission data. Please check your details and try again.",
                    icon: "error"
                });
            }
        }
    };


    // Handle captcha verification
    // const handleCaptchaVerify = (isValid) => {
    //     setCaptchaVerified(isValid);
    //     if (isValid) {
    //         setErrors(prev => {
    //             const { captcha, ...rest } = prev;
    //             return rest;
    //         });
    //     }
    // };

    const handleCaptchaValidation = (name, validationError) => {
        setCaptchaVerified(!validationError);
        setErrors(prev => ({
            ...prev,
            captcha: validationError || "",
        }));
    };

    return (
        <div className="mx-auto w-full rounded-lg bg-white p-6 shadow-md">
            <fieldset className="mb-4 rounded-md border p-4">
                <legend className="flex items-center gap-2 rounded-md border border-gray-400 bg-gray-500 px-4 py-2 text-lg font-semibold text-white">
                    <MdOutlinePersonAdd className="text-xl" /> Registration Details
                </legend>

                <form onSubmit={handleSubmit} className="mt-4">
                    {/* ITI Registration Question */}
                    <div className="mb-6">
                        <label htmlFor="itiRegistered" className="font-semibold">
                            Have you registered for ITI Admission Previously on
                            <a
                                href="https://admission.dvet.gov.in/"
                                className="ml-1 text-blue-600"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                https://admission.dvet.gov.in/
                            </a>?
                            <span className="text-red-500"> * </span>
                            {errors.itiRegistered && (
                                <span className="mt-1 block text-sm font-normal text-red-500">{errors.itiRegistered}</span>
                            )}
                        </label>
                        <p className="mt-1 text-sm text-gray-600">
                            (Only ITI Admission Seat Number starts with 2021 to 2025)
                        </p>

                        <div className="mt-2 flex items-center space-x-6">
                            {["yes", "no"].map((option) => (
                                <label key={option} className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        name="itiRegistered"
                                        value={option}
                                        checked={formData.itiRegistered === option}
                                        onChange={handleItiRegistrationChange}
                                        className="h-4 w-4 text-blue-600"
                                    />
                                    <span>{option.charAt(0).toUpperCase() + option.slice(1)}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* ITI Registration Fields (Show when Yes is selected) */}
                    {showItiFields && (
                        <div className="mb-6 rounded-lg bg-gray-50 p-4">
                            <h3 className="mb-4 text-lg font-semibold text-gray-700">ITI Registration Details</h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                {/* ITI Registration Number */}
                                <div>
                                    <FormComponent
                                        label="Enter ITI Registration Number"
                                        type="text"
                                        name="registrationNumber"
                                        value={formData.registrationNumber}
                                        onChange={(value) => handleChange({ target: { name: "registrationNumber", value } })}
                                        required
                                        error={errors.registrationNumber}
                                    />
                                </div>

                                {/* First Name */}
                                <div>
                                    <FormComponent
                                        label="First Name"
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={(value) => handleChange({ target: { name: "firstName", value } })}
                                        required
                                        error={errors.firstName}
                                    />
                                </div>

                                {/* Date of Birth */}
                                <div>
                                    <label className="font-normal">
                                        Date of Birth (DD/MM/YYYY) <span className="text-red-500">*</span>
                                        {errors.dob && (
                                            <span className="ml-1 text-sm text-red-500">{errors.dob}</span>
                                        )}
                                    </label>

                                    <DateInput
                                        label=""
                                        value={formData.dob}
                                        onChange={(val) =>
                                            handleChange({
                                                target: {
                                                    name: "dob",
                                                    value: val,
                                                },
                                            })
                                        }
                                        required
                                        minDate={new Date(1900, 0, 1)}
                                        maxDate={new Date()}
                                    // error={errors.dob}
                                    />

                                </div>


                            </div>

                            <div className="text-center">
                                <button
                                    type="button"
                                    className="rounded-md bg-red-500 px-6 py-2 text-white hover:bg-red-600"
                                    onClick={handleGetRegistrationDetails}
                                >
                                    Get Registration Details
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Remaining Fields (Show when No is selected OR when registration is verified) */}
                    {showRemainingFields && (
                        <div>
                            <div className="grid grid-cols-3 gap-4">
                                {/* First Name */}
                                <div>
                                    <label className="font-normal">
                                        First Name <span className="text-red-500">*</span>
                                        {errors.firstName && (
                                            <span className="ml-1 text-sm text-red-500"> {errors.firstName}</span>
                                        )}
                                    </label>
                                    <FormComponent
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={(value) => handleChange({ target: { name: "firstName", value } })}
                                        disabled={registrationVerified}
                                    />
                                </div>

                                {/* Middle Name */}
                                <div>
                                    <label className="font-normal">Middle/ Father/ Husband Name</label>
                                    <FormComponent
                                        type="text"
                                        name="middleName"
                                        value={formData.middleName}
                                        onChange={(value) => handleChange({ target: { name: "middleName", value } })}
                                    />
                                </div>

                                {/* Last Name */}
                                <div>
                                    <label className="font-normal">Last Name</label>
                                    <FormComponent
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={(value) => handleChange({ target: { name: "lastName", value } })}
                                        disabled={registrationVerified}
                                    />
                                </div>
                            </div>

                            <div className="mt-4 grid grid-cols-3 gap-4">
                                {/* Date of Birth */}
                                <div className="relative">
                                    <label className="font-normal">
                                        Date of Birth (DD/MM/YYYY) <span className="text-red-500">*</span>
                                        {errors.dob && (
                                            <span className="ml-1 text-sm text-red-500">{errors.dob}</span>
                                        )}
                                    </label>

                                    <DateInput
                                        label=""
                                        value={formData.dob}
                                        onChange={(val) =>
                                            handleChange({
                                                target: {
                                                    name: "dob",
                                                    value: val,
                                                },
                                            })
                                        }
                                        required
                                        minDate={new Date(1900, 0, 1)}
                                        maxDate={new Date()}
                                        //  error={errors.dob}
                                        disabled={registrationVerified}
                                    />
                                </div>


                                {/* Gender Dropdown */}
                                <div>
                                    <DropdownComponent
                                        label="Gender"
                                        options={genderOptions}
                                        value={formData.gender}
                                        onChange={(value) => handleChange({ target: { name: "gender", value } })}
                                        required={true}
                                        disabled={registrationVerified}
                                        loading={false}
                                        error={errors.gender}
                                    />
                                </div>


                                <div className="mb-3">
                                    <label className="block font-normal text-gray-700">
                                        E-Mail ID <span className="text-red-500">*</span>
                                        {errors.email && (
                                            <span className="ml-1 text-sm text-red-500">
                                                {errors.email}
                                            </span>
                                        )}
                                    </label>

                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}

                                        placeholder="Enter email address"
                                        className={`mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1
            ${errors.email
                                                ? "border-red-500 focus:ring-red-500"
                                                : "border-gray-300 focus:ring-black"
                                            }`}
                                    />
                                </div>

                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-4">
                                {/* Primary Mobile Number */}
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Primary Mobile Number <span className="text-lg text-red-500">*</span>
                                        {errors.primaryMobile && (
                                            <span className="ml-2 text-sm text-red-500">{errors.primaryMobile}</span>
                                        )}
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <span className="rounded-md border border-gray-300 bg-gray-100 p-2">+91</span>
                                        <input
                                            type="text"
                                            name="primaryMobile"
                                            value={formData.primaryMobile}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/\D/g, ""); // Only allow digits
                                                handleChange({
                                                    target: { name: "primaryMobile", value }
                                                });
                                            }}
                                            className={`w-full rounded-md p-2 border ${errors.primaryMobile ? "border-red-500" : "border-gray-300"}`}
                                            placeholder="Enter 10-digit number"
                                            maxLength="10"
                                            disabled={isVerified}
                                        />
                                        {isVerified ? (
                                            <span className="flex items-center text-green-600">
                                                Verified <AiOutlineCheckCircle className="ml-1 text-xl" />
                                            </span>
                                        ) : (
                                            <button
                                                type="button"
                                                className="rounded-md bg-red-500 px-3 py-2 text-white"
                                                onClick={handleVerifyClick}
                                            >
                                                Verify
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Secondary Mobile Number */}
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Secondary Mobile Number
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <span className="rounded-md border border-gray-300 bg-gray-100 p-2">+91</span>
                                        <input
                                            type="text"
                                            name="secondaryMobile"
                                            value={formData.secondaryMobile}
                                            onChange={(e) => {
                                                const numericValue = e.target.value.replace(/\D/g, ""); // Only allow digits
                                                handleChange({
                                                    target: { name: "secondaryMobile", value: numericValue }
                                                });
                                            }}
                                            className="w-full rounded-md border border-gray-300 p-2"
                                            placeholder="Enter 10-digit number"
                                            maxLength="10"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Security Question Component */}
                            <div className="mt-4 w-full">
                                <SecurityQuestion ref={SecurityQuestionRef} />
                            </div>

                            {/* Captcha & Register Button */}
                            <div className="max-w-md mx-auto">
                                <div className="mt-4 flex flex-col items-center justify-center">
                                    <Captcha
                                        ref={CaptchaRef}
                                        name="captcha"
                                        label=""
                                        type="alphanumeric"
                                        difficulty="easy"
                                        required
                                        clearable
                                        enableVoice
                                        onChange={(value) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                captcha: value,
                                            }))
                                        }
                                        onValidationChange={handleCaptchaValidation}
                                    />
                                    <div className="mt-4">
                                        <button type="submit" className="rounded-full bg-[#bc460b] px-8 py-3 text-white">
                                            Register
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </form>
            </fieldset>
        </div>
    );
};

export default Candidate;
