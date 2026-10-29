import { useState, useEffect, useContext } from 'react';
import Swal from "sweetalert2";
import {
    getSecurityQuestionsApi,
    loadSecurityQuestion
} from '../../Endpoints_All/Account/securityQuestions';
import OTPService from '../formcomponent/OTPService'
import { FiEye } from 'react-icons/fi'

import {
    forgotPasswordApi,
    forgotPasswordByOTPApi,
    verifyOTPAndResetPasswordApi,
    getUserLoginIdApi
} from '../../Endpoints_All/Account/authentication';
import agent from '../../lib/api/agent';
import { GetUserName } from '../../Endpoints_All/Account/userManagement';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from '../Context/ThemeContext';
import { getDeviceIP } from '../../utils/CommonHelper';


// Define API endpoints
const endpoints = {
    getSecurityQuestions: getSecurityQuestionsApi,
    getUserSecurityQuestions: (userId) => `${loadSecurityQuestion}/${userId}`,
    forgotPassword: forgotPasswordApi,
    forgotPasswordByOTP: forgotPasswordByOTPApi,
    verifyOTPAndResetPassword: verifyOTPAndResetPasswordApi,
    getUserLoginId: getUserLoginIdApi
};


// Password validation function
const validatePassword = (password) => {

    const regex =
        /^.*(?=^.{8,15}$)(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!*@#$%^&+=]).*$/;

    if (!password) {
        return 'Password is required';
    }

    if (!regex.test(password)) {
        return 'Password must contain uppercase, lowercase, number and special character';
    }

    return '';
};

// FormComponent remains the same
const FormComponent = ({
    label,
    type = "text",
    value,
    onChange,
    error,
    required = false,
    placeholder = "",
    options = [],
    isSelect = false,
    disabled = false,
    extraClass = "",
    icon = null
}) => {

    return (
        <div className={`mb-2 mt-2 ${extraClass}`}>
            <label className="mb-1 block text-xs font-medium text-gray-700">                {label} {required && <span className="text-lg text-red-500">*</span>}
                {error && <span className="ml-2 text-sm text-red-500">{error}</span>}
            </label>
            {isSelect ? (
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={`w-full rounded-md p-2 border ${error ? "border-red-500" : "border-gray-300"}`}
                    disabled={disabled}
                >
                    <option value="">Select</option>
                    {options.map((option, index) => (
                        <option key={index} value={option.value}>{option.label}</option>
                    ))}
                </select>
            ) : (
                <div className="relative">

                    <input
                        type={type}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className={`w-full rounded-md p-2 border pr-10 ${error ? "border-red-500" : "border-gray-300"}`}
                        placeholder={placeholder}
                        disabled={disabled}
                    />

                    {icon && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                            {icon}
                        </div>
                    )}

                </div>
            )}
        </div>
    );
};

// Main component
export default function PasswordResetFlow() {
    // Track navigation history
    const [screenHistory, setScreenHistory] = useState(['initial']);
    const [formData, setFormData] = useState({
        profileId: '',
        securityQuestion: '',
        securityAnswer: '',
        mobileNumber: '',
        fullName: '',
        newPassword: '',
        confirmPassword: '',
        otp: ''
    });
    const [errors, setErrors] = useState({});
    const [securityQuestions, setSecurityQuestions] = useState([]);
    const [userSecurityQuestions, setUserSecurityQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [selectedInitialOption, setSelectedInitialOption] = useState('');
    const [selectedResetOption, setSelectedResetOption] = useState('');
    const [recoveredProfileId, setRecoveredProfileId] = useState('');
    const [currentRecoveredId, setCurrentRecoveredId] = useState('');
    const [ipAddress, setIpAddress] = useState("");
    const navigate = useNavigate();
    const { color } = useContext(ThemeContext);


    // Get the current screen from history
    const currentScreen = screenHistory[screenHistory.length - 1];

    // Fetch security questions when component mounts
    useEffect(() => {
        fetchSecurityQuestions();
        fetchIP();
    }, []);

     const fetchIP = async () => {
        try {
            const ip = await getDeviceIP();
            setIpAddress(ip);
        } catch (err) {
            console.error("Failed to get IP:", err);
        }
        };

    const otpService = OTPService({
        mobileNo: formData.mobileNumber,
        purpose: 'ForgotPassword',
        isVerifyRequired: true,
        messege: 'OTP verification required',
        isDuplicateCheck: false,

        onSuccess: async () => {

            setOtpSent(true);

            const userName = await fetchUserName(formData.profileId);

            setFormData(prev => ({
                ...prev,
                fullName: userName || ''
            }));

            setMessage({
                text: 'OTP verified successfully!',
                type: 'success'
            });

            navigateTo('setNewPassword');
        },
        onError: (error) => {

            setMessage({
                text: error.message || 'OTP verification failed',
                type: 'error'
            });
        }
    });

    // Fetch security questions from API using agent
    const fetchSecurityQuestions = async () => {
        try {
            setLoading(true);
            const response = await agent.get(endpoints.getSecurityQuestions);
            setSecurityQuestions(response.data);
        } catch (error) {
            setMessage({
                text: 'Failed to load security questions. Please try again.',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };
    const handleOtpPasswordReset = async () => {

        if (validateForm(['newPassword', 'confirmPassword'])) {

            try {

                setLoading(true);

                const response = await agent.post(
                    endpoints.forgotPassword,
                    {
                        UserLoginID: formData.profileId,
                        NewPassword: passwordtohash(formData.newPassword),
                        ErrorMessage: "",
                        IPAddress: ipAddress
                    }
                );

                Swal.fire({
                    title: "Success",
                    text: "Password Changed Successfully.",
                    icon: "success",
                    confirmButtonColor: "#6b7280",
                    confirmButtonText: "OK"
                }).then(() => {

                    navigate('/');

                });

            } catch (error) {

                setMessage({
                    text:
                        error?.response?.data?.error ||
                        error?.response?.data?.ErrorMessage ||
                        'Something went wrong.',
                    type: 'error'
                });

            } finally {

                setLoading(false);
            }
        }
    };
    let recoveredId = '';

    const profileIdOtpService = OTPService({

        mobileNo: formData.mobileNumber,

        purpose: 'ForgotApplicationID',

        isVerifyRequired: true,

        messege: 'OTP verification required',

        isDuplicateCheck: false,

        onSuccess: async () => {
            Swal.fire({
                title: "Profile ID Recovered",
                text: `Your Login ID / Profile ID : ${recoveredId}`,
                icon: "success",
                confirmButtonColor: "#6b7280",
                confirmButtonText: "OK"
            }).then(() => {

                navigate('/');

            });
        },

        onError: (error) => {

            setMessage({
                text: error.message || 'OTP verification failed',
                type: 'error'
            });

        }
    });
    const fetchUserSecurityQuestions = async (profileId) => {

        try {

            if (!profileId || profileId.trim().length < 6) {

                setMessage({
                    text: 'Please enter valid Profile ID',
                    type: 'error'
                });

                return [];
            }

            // Extract numeric userId
            const userId = profileId.trim().slice(-6);


            const response = await agent.get(
                endpoints.getUserSecurityQuestions(userId)
            );


            if (!response.data || response.data.length === 0) {

                setMessage({
                    text: 'No security questions found for this Profile ID.',
                    type: 'error'
                });

                return [];
            }

            setUserSecurityQuestions(response.data);

            return response.data;

        } catch (error) {

            setMessage({
                text: 'Failed to fetch security questions.',
                type: 'error'
            });

            return [];
        }
    };
    const fetchUserName = async (profileId) => {

        try {

            const response = await agent.get(
                `${GetUserName}/${profileId}`
            );

            return response.data.UserName;

        } catch (error) {

            console.error("Error fetching username:", error);

            return '';
        }
    };
    // Navigate to a new screen and add it to history
    const navigateTo = (screen) => {
        setScreenHistory(prev => [...prev, screen]);
        // Clear any messages when changing screens
        setMessage({ text: '', type: '' });
    };

    // Go back to the previous screen
    const goBack = () => {
        if (screenHistory.length > 1) {
            setScreenHistory(prev => prev.slice(0, -1));
            // Clear any messages when going back
            setMessage({ text: '', type: '' });
        }
    };

    // Handle form input changes
    const handleChange = (field, value) => {
        setFormData({
            ...formData,
            [field]: value
        });

        // Clear error for this field when user types
        if (errors[field]) {
            setErrors({
                ...errors,
                [field]: ''
            });
        }

        // Real-time password validation
        // if (field === 'newPassword') {
        //     const passwordError = validatePassword(value);
        //     if (passwordError) {
        //         setErrors(prev => ({
        //             ...prev,
        //             newPassword: passwordError
        //         }));
        //     }
        // }

        // Real-time confirm password validation
        // if (field === 'confirmPassword') {
        //     if (value && formData.newPassword && value !== formData.newPassword) {
        //         setErrors(prev => ({
        //             ...prev,
        //             confirmPassword: 'Passwords do not match'
        //         }));
        //     }
        // }
    };

    // Reset form errors
    const validateForm = (fields) => {
        const newErrors = {};
        let isValid = true;

        fields.forEach(field => {
            if (!formData[field]) {
                newErrors[field] = 'This field is required';
                isValid = false;
            }
        });

        // Special validation for password
        if (fields.includes('newPassword')) {
            const passwordError = validatePassword(formData.newPassword);
            if (passwordError) {
                newErrors.newPassword = passwordError;
                isValid = false;
            }
        }

        // Special validation for password confirmation
        if (
            fields.includes('confirmPassword') &&
            formData.newPassword.trim() !== formData.confirmPassword.trim()
        ) {
            newErrors.confirmPassword =
                'New Password and Confirm New Password Should be Same.';
            isValid = false;
        }

        // Mobile number validation
        if (fields.includes('mobileNumber') && formData.mobileNumber && !/^\d{10}$/.test(formData.mobileNumber)) {
            newErrors.mobileNumber = 'Please enter a valid 10-digit mobile number';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    // Handle option selection on first screen
    const handleInitialSelection = (option) => {
        setSelectedInitialOption(option);
    };

    // Handle proceed button click on initial screen
    const handleInitialProceed = () => {
        if (!selectedInitialOption) {
            setMessage({
                text: 'Please select an option to proceed',
                type: 'error'
            });
            return;
        }

        if (selectedInitialOption === 'password') {
            navigateTo('resetOptions');
        } else if (selectedInitialOption === 'profileId') {
            navigateTo('forgotProfileId');
        }
    };

    // Handle reset option selection
    const handleResetOptionSelection = (option) => {
        setSelectedResetOption(option);
    };

    // Handle proceed button click on reset options screen
    const handleResetOptionProceed = () => {
        if (!selectedResetOption) {
            setMessage({
                text: 'Please select an option to proceed',
                type: 'error'
            });
            return;
        }

        if (selectedResetOption === 'security') {
            navigateTo('securityQuestion');
        } else if (selectedResetOption === 'otp') {
            navigateTo('otpVerification');
        }
    };

    // Handle security question submission
    const handleSecurityQuestionSubmit = async () => {
        if (validateForm(['profileId', 'securityQuestion', 'securityAnswer'])) {
            try {
                setLoading(true);

                // Fetch user's security questions first
                const userQuestions = await fetchUserSecurityQuestions(formData.profileId);

                // Find matching security question
                const matchingQuestion = userQuestions.find(q =>
                    q.SecurityQuestionID === parseInt(formData.securityQuestion)
                );

                if (!matchingQuestion) {
                    setErrors({
                        ...errors,
                        securityQuestion: 'This security question was not selected during registration'
                    });
                    setLoading(false);
                    return;
                }

                // Verify the answer (case-insensitive comparison)
                if (matchingQuestion.SecurityQuestionAnswer.toLowerCase().trim() !==
                    formData.securityAnswer.toLowerCase().trim()) {
                    setErrors({
                        ...errors,
                        securityAnswer: 'Incorrect security answer'
                    });
                    setLoading(false);
                    return;
                }

                // If verification successful, navigate to password reset
                setMessage({
                    text: 'Security question verified successfully!',
                    type: 'success'
                });

                const userName = await fetchUserName(formData.profileId);

                setFormData(prev => ({
                    ...prev,
                    fullName: userName || ''
                }));

                navigateTo('setNewPassword');

                setLoading(false);

            } catch (error) {
                console.error('Error verifying security question:', error);
                setMessage({
                    text: error.message || 'Failed to verify security question. Please check your Profile ID.',
                    type: 'error'
                });
                setLoading(false);
            }
        }
    };

    const handleSecurityPasswordReset = async () => {

        if (validateForm(['newPassword', 'confirmPassword'])) {

            try {

                setLoading(true);

                const response = await agent.post(endpoints.forgotPassword, {
                    UserLoginID: formData.profileId,
                    SecurityQuestionID: parseInt(formData.securityQuestion),
                    SecurityQuestionAnswer: formData.securityAnswer,
                    NewPassword: passwordtohash(formData.newPassword),
                    ErrorMessage: "",
                    IPAddress:ipAddress
                });

                const returnValue =
                    response?.data?.returnValue ||
                    response?.data?.error ||
                    response?.data;

                if (
                    response?.status === 200 ||
                    returnValue === "Y"
                ) {

                    Swal.fire({
                        title: "Success",
                        text: "Password Changed Successfully.",
                        icon: "success",
                        confirmButtonColor: "#6b7280",
                        confirmButtonText: "OK"
                    }).then(() => {

                        navigate('/');

                    });

                } else {

                    setMessage({
                        text: returnValue,
                        type: 'error'
                    });

                    return;
                }

            } catch (error) {


                const errorMessage =
                    error?.error ||
                    error?.response?.data?.error ||
                    error?.response?.data?.ErrorMessage ||
                    error?.message ||
                    'Something went wrong.';

                setMessage({
                    text: errorMessage,
                    type: 'error'
                });

            } finally {

                setLoading(false);
            }
        }
    };

    const handleOtpSubmit = async () => {

        if (validateForm(['profileId', 'mobileNumber'])) {

            try {

                setLoading(true);

                const response = await agent.post(
                    endpoints.forgotPasswordByOTP,
                    {
                        UserLoginID: formData.profileId,
                        MobileNo: formData.mobileNumber
                    }
                );

                const returnValue =
                    response?.data?.UserLoginID ||
                    response?.data?.returnValue ||
                    response?.data;

                if (
                    !returnValue ||
                    response?.data?.ErrorMessage
                ) {

                    setMessage({
                        text:
                            response?.data?.ErrorMessage ||
                            'Current Combination of Login ID / Profile ID and Primary Mobile Number not matched. Please enter valid details.',
                        type: 'error'
                    });

                    return;
                }

                await otpService.startVerification(
                    String(formData.mobileNumber)
                );

            } catch (error) {

                setMessage({
                    text:
                        error?.response?.data?.ErrorMessage ||
                        'Current Combination of Login ID / Profile ID and Primary Mobile Number not matched. Please enter valid details.',
                    type: 'error'
                });

            } finally {

                setLoading(false);
            }
        }
    };

    // Handle OTP verification and password reset
    const handleVerifyOtp = async () => {
        if (validateForm(['otp', 'newPassword', 'confirmPassword'])) {
            try {
                setLoading(true);
                const response = await agent.post(endpoints.verifyOTPAndResetPassword, {
                    UserLoginID: formData.profileId,
                    MobileNo: formData.mobileNumber,
                    OTP: formData.otp,
                    NewPassword: formData.newPassword
                });

                Swal.fire({
                    title: "Success",
                    text: "Password Changed Successfully.",
                    icon: "success",
                    confirmButtonColor: "#6b7280",
                    confirmButtonText: "OK"
                }).then(() => {

                    navigate('/');

                });

                setTimeout(() => {
                    setScreenHistory(['initial']);
                    setFormData({
                        profileId: '',
                        securityQuestion: '',
                        securityAnswer: '',
                        mobileNumber: '',
                        fullName: '',
                        newPassword: '',
                        confirmPassword: '',
                        otp: ''
                    });
                    setSelectedInitialOption('');
                    setSelectedResetOption('');
                }, 3000);

            } catch (error) {
                console.error('Error verifying OTP:', error);
                setMessage({
                    text: 'Failed to verify OTP. Please check your OTP and try again.',
                    type: 'error'
                });
            } finally {
                setLoading(false);
            }
        }
    };

    const handleProfileIdRecovery = async () => {

        if (validateForm(['fullName', 'mobileNumber'])) {

            try {

                setLoading(true);

                const params = {
                    userName: formData.fullName,
                    mobileNo: formData.mobileNumber
                };

                const response = await agent.get(
                    endpoints.getUserLoginId,
                    { params }
                );

                const userLoginId =
                    response?.data?.UserLoginID ||
                    response?.data?.userLoginID ||
                    response?.data?.ProfileID ||
                    '';

                if (
                    !userLoginId ||
                    String(userLoginId).trim() === '' ||
                    String(userLoginId).toLowerCase().includes('no record')
                ) {

                    setMessage({
                        text: 'No Record Found.',
                        type: 'error'
                    });

                    return;
                }

                recoveredId = String(userLoginId);
                setRecoveredProfileId(userLoginId);
                setCurrentRecoveredId(userLoginId);


                await profileIdOtpService.startVerification(
                    String(formData.mobileNumber)
                );

            } catch (error) {

                if (
                    error?.status === 404 ||
                    error?.response?.status === 404
                ) {

                    setMessage({
                        text: 'No Record Found.',
                        type: 'error'
                    });

                    return;
                }

                setMessage({
                    text:
                        error?.response?.data?.error ||
                        error?.error ||
                        'Failed to recover Profile ID.',
                    type: 'error'
                });

            } finally {

                setLoading(false);
            }
        }
    };
    // TO HASH PASSWORD
    function passwordtohash(str) {
        try {
            return btoa(str);
        } catch (error) {
            console.error("Password validation error:", error);
            return btoa(unescape(encodeURIComponent(str)));
        }
    }
    // Render header based on current screen
    const renderHeader = () => {
        const headerMap = {
            'initial': 'Having Trouble Signing In?',
            'resetOptions': 'Options for Reset Password',
            'securityQuestion': 'Reset Password using Security Question',
            'setNewPassword': 'Reset Password',
            'otpVerification': 'Reset Password using OTP',
            'enterOtp': 'Enter OTP and New Password',
            'forgotProfileId': 'Forgot Profile ID?'
        };

        return (
            <div className="bg-gray-500 text-white p-3 rounded-t-md flex items-center ">
                <div className="flex items-center">
                    <div className="h-6 w-6 rounded-full bg-white text-gray-500 flex items-center justify-center mr-2 font-bold">R</div>
                    <span className="font-medium">{headerMap[currentScreen] || 'Reset Flow'}</span>
                </div>
            </div>
        );
    };

    // Render system message (error or success)
    const renderMessage = () => {
        if (!message.text) return null;

        const bgColor = message.type === 'error'
            ? 'bg-red-100 border-red-500 text-red-700'
            : 'bg-green-100 border-green-500 text-green-700';
        return (
            <div
                className={`${bgColor} p-3 mb-4 border-l-4 rounded font-medium`}
            >
                {message.text}
            </div>
        );
    };

    // Render password requirements helper
    const renderPasswordRequirements = () => {
        return (
            <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Password Requirements:</h4>
                <ul className="text-xs text-blue-700 space-y-1">
                    <li>� 8-15 characters long</li>
                    <li>� At least 1 uppercase letter</li>
                    <li>� At least 1 number</li>
                    <li>� At least 1 special character (!@#$%^&*...)</li>
                </ul>
            </div>
        );
    };

    // Render content based on current screen
    const renderContent = () => {
        switch (currentScreen) {
            case 'initial':
                return (
                    <div className="pb-6 mr-20 ">
                        {renderMessage()}
                        <div className="mb-4 flex justify-center">
                            <input
                                type="radio"
                                id="forgotPassword"
                                name="forgotOption"
                                className="mr-2"
                                checked={selectedInitialOption === 'password'}
                                onChange={() => handleInitialSelection('password')}
                            />
                            <label htmlFor="forgotPassword">Forgot Password</label>
                        </div>
                        <div className="mb-4 flex justify-center">
                            <input
                                type="radio"
                                id="forgotProfileId"
                                name="forgotOption"
                                className="mr-2"
                                checked={selectedInitialOption === 'profileId'}
                                onChange={() => handleInitialSelection('profileId')}
                            />
                            <label htmlFor="forgotProfileId">Forgot Profile ID</label>
                        </div>
                        <div className="flex justify-center gap-4 mt-6">
                            {screenHistory.length > 1 && (
                                <button
                                    onClick={goBack}
                                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
                                    disabled={loading}
                                >
                                    Back
                                </button>
                            )}
                            <button
                                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md"
                                onClick={handleInitialProceed}
                                disabled={loading}
                            >
                                {loading ? 'Processing...' : 'Proceed >>>'}
                            </button>
                        </div>
                    </div>
                );

            case 'resetOptions':
                return (
                    <div className="p-6 mr-20">
                        {renderMessage()}
                        <div className="mb-4 flex justify-start">
                            <input
                                type="radio"
                                id="securityQuestion"
                                name="resetOption"
                                className="mr-2"
                                checked={selectedResetOption === 'security'}
                                onChange={() => handleResetOptionSelection('security')}
                            />
                            <label htmlFor="securityQuestion">Using Security Question selected in Candidate Registration</label>
                        </div>
                        <div className="mb-4 flex justify-start">
                            <input
                                type="radio"
                                id="otpOption"
                                name="resetOption"
                                className="mr-2"
                                checked={selectedResetOption === 'otp'}
                                onChange={() => handleResetOptionSelection('otp')}
                            />
                            <label htmlFor="otpOption">Using One Time Password (OTP) sent via SMS to Primary Mobile Number</label>
                        </div>
                        <div className="flex justify-center gap-4 mt-6">
                            {screenHistory.length > 1 && (
                                <button
                                    onClick={goBack}
                                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
                                    disabled={loading}
                                >
                                    Back
                                </button>
                            )}
                            <button
                                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md"
                                onClick={handleResetOptionProceed}
                                disabled={loading}
                            >
                                {loading ? 'Processing...' : 'Proceed >>>'}
                            </button>
                        </div>
                    </div>
                );

            case 'securityQuestion':
                return (
                    <div className="p-6">
                        {renderMessage()}
                        <FormComponent
                            label="Profile ID"
                            value={formData.profileId}
                            onChange={(value) => handleChange('profileId', value)}
                            error={errors.profileId}
                            required={true}
                        />

                        <div className="flex-1 mb-4">
                            <label className="block text-xs font-medium text-gray-700">
                                Security Question <span className="ml-1 text-red-500">*</span>
                                {errors.securityQuestion && (
                                    <span className="ml-2 text-sm text-red-500">
                                        {errors.securityQuestion}
                                    </span>
                                )}
                            </label>
                            <select
                                value={formData.securityQuestion}
                                onChange={(e) => handleChange('securityQuestion', e.target.value)}
                                className={`mt-1 w-full rounded-md border p-2 ${errors.securityQuestion ? "border-red-500" : "border-gray-300"}`}
                                disabled={loading}
                            >
                                <option value="">Select a Security Question</option>
                                {securityQuestions.map((question) => (
                                    <option key={question.Id} value={question.Id}>
                                        {question.Question}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <FormComponent
                            label="Security Question's Answer"

                            value={formData.securityAnswer}
                            onChange={(value) => handleChange('securityAnswer', value.toUpperCase())}
                            error={errors.securityAnswer}
                            required={true}
                        />
                        <div className="flex justify-center gap-4 mt-6">
                            {screenHistory.length > 1 && (
                                <button
                                    onClick={goBack}
                                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
                                    disabled={loading}
                                >
                                    Back
                                </button>
                            )}
                            <button
                                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md"
                                onClick={handleSecurityQuestionSubmit}
                                disabled={loading}
                            >
                                {loading ? 'Verifying...' : 'Proceed >>>'}
                            </button>
                        </div>
                    </div>
                );
            case 'setNewPassword':
                return (
                    <div className="p-6">

                        {renderMessage()}

                        <div className="bg-red-100 border border-red-300 text-red-700 p-3 rounded mb-4 text-sm">
                            <p>
                                <strong>Note :</strong> Password should have minimum 8 characters and maximum of 15 characters with 1 Capital Alphabet, 1 Number and 1 Special Character.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            <FormComponent
                                label="Profile ID"
                                value={formData.profileId}
                                disabled={true}
                            />

                            <FormComponent
                                label="User Name"
                                value={formData.fullName}
                                disabled={true}
                            />

                            <FormComponent
                                label="New Password"
                                type={passwordVisible ? "text" : "password"}
                                value={formData.newPassword}
                                onChange={(value) => handleChange('newPassword', value)}
                                error={errors.newPassword}
                                required={true}
                                icon={
                                    <FiEye
                                        className="cursor-pointer text-gray-500"
                                        onClick={() => setPasswordVisible(!passwordVisible)}
                                    />
                                }
                            />

                            <FormComponent
                                label="Confirm Password"
                                type={passwordVisible ? "text" : "password"}
                                value={formData.confirmPassword}
                                onChange={(value) => handleChange('confirmPassword', value)}
                                error={errors.confirmPassword}
                                required={true}
                                icon={
                                    <FiEye
                                        className="cursor-pointer text-gray-500"
                                        onClick={() => setPasswordVisible(!passwordVisible)}
                                    />
                                }
                            />

                        </div>




                        <div className="flex justify-center mt-6">
                            <button
                                className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-md"
                                onClick={
                                    selectedResetOption === 'otp'
                                        ? handleOtpPasswordReset
                                        : handleSecurityPasswordReset
                                }
                                disabled={loading}
                            >
                                {loading ? 'Changing Password...' : 'Change Password'}
                            </button>
                        </div>

                    </div>
                );
            case 'otpVerification':
                return (
                    <div className="p-6">
                        {renderMessage()}
                        <FormComponent
                            label="Profile ID"
                            value={formData.profileId}
                            onChange={(value) => handleChange('profileId', value)}
                            error={errors.profileId}
                            required={true}
                        />
                        <FormComponent
                            label="Primary Mobile Number"
                            value={formData.mobileNumber}
                            onChange={(value) => handleChange('mobileNumber', value)}
                            error={errors.mobileNumber}
                            required={true}
                            type="tel"
                            placeholder="10-digit mobile number"
                        />
                        <div className="flex justify-center gap-4 mt-6">
                            {screenHistory.length > 1 && (
                                <button
                                    onClick={goBack}
                                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
                                    disabled={loading}
                                >
                                    Back
                                </button>
                            )}
                            <button
                                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md"
                                onClick={handleOtpSubmit}
                                disabled={loading}
                            >
                                {loading ? 'Sending OTP...' : 'Send OTP'}
                            </button>
                        </div>
                    </div>
                );

            case 'enterOtp':
                return (
                    <div className="p-6">
                        {renderMessage()}
                        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4">
                            <p>OTP has been sent to your registered mobile number.</p>
                        </div>
                        <FormComponent
                            label="Enter OTP"
                            value={formData.otp}
                            onChange={(value) => handleChange('otp', value)}
                            error={errors.otp}
                            required={true}
                            type="text"
                            placeholder="Enter the OTP received on your mobile"
                        />
                        {renderPasswordRequirements()}
                        <div className="relative">
                            <FormComponent
                                label="New Password"
                                type={passwordVisible ? "text" : "password"}
                                value={formData.newPassword}
                                onChange={(value) => handleChange('newPassword', value)}
                                error={errors.newPassword}
                                required={true}
                              
                            />

                        </div>
                        <div className="relative">
                            <FormComponent
                                label="Confirm Password"
                                type={passwordVisible ? "text" : "password"}
                                value={formData.confirmPassword}
                                onChange={(value) => handleChange('confirmPassword', value)}
                                error={errors.confirmPassword}
                                required={true}
                            

                            />

                        </div>
                        <div className="mb-4 flex items-center">
                            <input
                                type="checkbox"
                                id="showPassword"
                                className="mr-2"
                                checked={passwordVisible}
                                onChange={() => setPasswordVisible(!passwordVisible)}
                            />
                            <label htmlFor="showPassword" className="text-sm">Show Password</label>
                        </div>
                        <div className="flex justify-center gap-4 mt-6">
                            {screenHistory.length > 1 && (
                                <button
                                    onClick={goBack}
                                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
                                    disabled={loading}
                                >
                                    Back
                                </button>
                            )}
                            <button
                                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md"
                                onClick={handleVerifyOtp}
                                disabled={loading}
                            >
                                {loading ? 'Verifying OTP...' : 'Reset Password'}
                            </button>
                        </div>
                    </div>
                );

            case 'forgotProfileId':
                return (
                    <div className="p-6">
                        {renderMessage()}
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
                            <p className="font-medium">Note: In case of Institute, Please Enter Authorized Representative Details.</p>
                        </div>
                        <FormComponent
                            label="Full Name"
                            value={formData.fullName}
                            onChange={(value) => handleChange('fullName', value.toUpperCase())}
                            error={errors.fullName}
                            required={true}
                            placeholder="Enter your full name as registered"
                        />
                        <FormComponent
                            label="Primary Mobile Number"
                            value={formData.mobileNumber}
                            onChange={(value) => handleChange('mobileNumber', value)}
                            error={errors.mobileNumber}
                            required={true}
                            type="tel"
                            placeholder="10-digit mobile number"
                        />
                        <div className="flex justify-center gap-4 mt-6">
                            {screenHistory.length > 1 && (
                                <button
                                    onClick={goBack}
                                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
                                    disabled={loading}
                                >
                                    Back
                                </button>
                            )}
                            <button
                                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md"
                                onClick={handleProfileIdRecovery}
                                disabled={loading}
                            >
                                {loading ? 'Processing...' : 'Get Profile ID'}
                            </button>
                        </div>
                    </div>
                );

            default:
                return <div>Unknown screen</div>;
        }
    };

    return (
        <div className="max-w-3xl mx-auto mt-16 mb-10 px-4">
            <div className="relative bg-white rounded-md shadow-lg w-full max-w-3xl mx-auto">

                {/* Floating Header */}
                {/* <div className=""> */}
                <fieldset className='mb-4 rounded-md'>
                    <legend
                        className={`flex ${color} items-center text-base font-semibold text-white border-2 border-gray-300 px-3 py-1.5 rounded-md ml-4`}
                    >
                        <div className="h-7 w-7 rounded-full bg-white text-gray-500 flex items-center justify-center mr-3 font-bold">
                            R
                        </div>

                        <span className="text-xl font-semibold">
                            {(() => {

                                const headerMap = {
                                    initial: 'Having Trouble Signing In ?',
                                    resetOptions: 'Options for Reset Password',
                                    securityQuestion: 'Reset Password using Security Question',
                                    setNewPassword: 'Reset Password',
                                    otpVerification: 'Reset Password using OTP',
                                    enterOtp: 'Enter OTP and New Password',
                                    forgotProfileId: 'Forgot Profile ID?'
                                };

                                return headerMap[currentScreen] || 'Reset Flow';

                            })()}
                        </span>
                    </legend>
                </fieldset>

                {/* </div> */}

                {/* Content */}
                <div className="pl-5">
                    {renderContent()}
                </div>

            </div>

            {loading && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-5 rounded-md flex items-center">
                        <div className="w-6 h-6 mr-3 border-t-2 border-b-2 border-orange-600 rounded-full animate-spin"></div>
                        <span>Processing...</span>
                    </div>
                </div>
            )}
        </div>
    );
}