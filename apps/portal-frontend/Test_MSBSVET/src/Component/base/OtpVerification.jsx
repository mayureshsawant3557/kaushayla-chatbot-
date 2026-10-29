/*
 * Reusable OTP Verification Component supports both modal and inline modes
 
 * @param {boolean} show - Show/hide the modal (only for modal mode)
 * @param {function} onClose - Callback when modal is closed
 * @param {function} onSuccess - Callback when OTP is verified successfully
 * @param {object} config - Configuration object
 * @param {number} config.otpLength - Length of OTP (4 or 6)
 * @param {string} config.method - 'both' | 'email' | 'sms' - Which methods to show
 * @param {boolean} config.autoNavigate - If true, navigates on success
 * @param {string} config.navigateUrl - URL to navigate to on success
 * @param {number} config.resendTimeout - Seconds before allowing resend
 * @param {string} config.title - Custom title for the modal
 * @param {string} config.description - Custom description text
 * @param {string} config.mode - 'modal' | 'inline' - Display mode
 * @param {object} userData - User data for OTP verification
 * @param {string} userData.userId - User ID
 * @param {string} userData.userName - User name for display
 * @param {string} userData.sessionToken - Temporary session token
 * @param {string} userData.email - User's email (optional, for display)
 * @param {string} userData.phone - User's phone (optional, for display)
 * @param {string} contact - The contact (email/phone) to verify in inline mode
 */

import { useEffect, useState, useRef } from 'react';
import { Shield, Mail, Smartphone, X, AlertCircle, RefreshCw, CheckCircle } from 'lucide-react';
import Button from '../base/Button';
import Loader from "../base/Loader";
import { useNotification } from "../../hooks/NotificationProvider";
import { useNavigate } from "react-router-dom";
import useOtp from '../../api/hooks/base/useOtp';

const OtpVerification = ({
    show = false,
    onClose,
    onSuccess,
    config = {},
    userData,
    contact // For inline mode
}) => {

    // Default configuration
    const defaultConfig = {
        otpLength: 6,
        method: 'both', // 'both' | 'email' | 'sms'
        autoNavigate: false,
        navigateUrl: '/dashboard',
        resendTimeout: 60,
        title: 'OTP Verification',
        description: null,
        mode: 'modal', // 'modal' | 'inline'
    };

    // Merge with provided config
    const finalConfig = { ...defaultConfig, ...config };

    const [otpMethod, setOtpMethod] = useState('');
    const [showMethodSelection, setShowMethodSelection] = useState(true);
    const [otp, setOtp] = useState(Array(finalConfig.otpLength).fill(''));
    const [isClosing, setIsClosing] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [error, setError] = useState('');
    const [resendTimer, setResendTimer] = useState(0);
    const [otpSent, setOtpSent] = useState(false);

    const { sendOtp, verifyOtp } = useOtp();
    const { notify } = useNotification();
    const navigate = useNavigate();
    const inputRefs = useRef([]);

    // Determine if we should skip method selection
    const skipMethodSelection = finalConfig.method !== 'both';
    const isInlineMode = finalConfig.mode === 'inline';

    // Initialize input refs
    useEffect(() => {
        inputRefs.current = inputRefs.current.slice(0, finalConfig.otpLength);
    }, [finalConfig.otpLength]);

    // Reset state when modal opens or inline mode activates
    useEffect(() => {
        if (show || isInlineMode) {
            // If only one method available, auto-select it
            if (skipMethodSelection) {
                const method = finalConfig.method;
                setOtpMethod(method);
                setShowMethodSelection(false);

                // Auto-send OTP when modal opens with single method
                if (show && !isInlineMode) {
                    handleSendOtp(method);
                }
            } else {
                setOtpMethod('');
                setShowMethodSelection(true);
            }

            setOtp(Array(finalConfig.otpLength).fill(''));
            setIsClosing(false);
            setIsVerifying(false);
            setIsSendingOtp(false);
            setError('');
            setResendTimer(0);
            setOtpSent(false);
        }
    }, [show, isInlineMode, skipMethodSelection, finalConfig.method, finalConfig.otpLength]);

    // Prevent body scroll while modal is open (only for modal mode)
    useEffect(() => {
        if (!isInlineMode && show) {
            document.body.style.overflow = 'hidden';
        } else if (!isInlineMode) {
            document.body.style.overflow = 'unset';
        }
        return () => {
            if (!isInlineMode) {
                document.body.style.overflow = 'unset';
            }
        };
    }, [show, isInlineMode]);

    // Resend timer countdown
    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => {
                setResendTimer(resendTimer - 1);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer]);

    // Send OTP function
    const handleSendOtp = async (method, contactValue) => {
        setIsSendingOtp(true);
        setError('');
        debugger;
        const userContactValue = (method === "email" ? userData.UserEMailId : userData.UserMobileNo) || contactValue;
        debugger;
        try {
            const response = await sendOtp({
                UserId: null,
                ContactType: method,
                ContactValue: userContactValue || contact, // Use provided contact for inline mode
                Purpose: finalConfig.purpose,
                UserLoginId: userData.UserLoginId,
            });

            if (response.Success && response.Data.Success) {
                setOtpSent(true);
                setResendTimer(finalConfig.resendTimeout);
                notify(`OTP sent to your ${method === 'email' ? 'email' : 'phone'}`, 'success');

                setTimeout(() => {
                    inputRefs.current[0]?.focus();
                }, 100);
                return true;
            } else {
                setError(response.Message || 'Failed to send OTP');
                notify(response.Message || 'Failed to send OTP', 'error');
                return false;
            }
        } catch (error) {
            setError(error.message || 'Failed to send OTP');
            notify('Failed to send OTP', 'error');
            return false;
        } finally {
            setIsSendingOtp(false);
        }
    };

    // Handle OTP method selection (for modal mode)
    const handleMethodSelect = async (method) => {
        setOtpMethod(method);
        setError('');
        const success = await handleSendOtp(method);

        if (success) {
            setShowMethodSelection(false);
        } else {
            setOtpMethod('');
        }
    };

    // Handle OTP input change
    const handleOtpChange = (index, value) => {
        // Only allow numbers
        if (value && !/^\d$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setError('');

        // Auto-focus next input
        if (value && index < finalConfig.otpLength - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    // Handle backspace
    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    // Handle paste
    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, finalConfig.otpLength);

        if (/^\d+$/.test(pastedData)) {
            const newOtp = [...otp];
            pastedData.split('').forEach((char, index) => {
                if (index < finalConfig.otpLength) {
                    newOtp[index] = char;
                }
            });
            setOtp(newOtp);

            // Focus last filled input or last input
            const lastIndex = Math.min(pastedData.length, finalConfig.otpLength - 1);
            inputRefs.current[lastIndex]?.focus();
        }
    };

    // Verify OTP
    const handleVerify = async () => {
        const otpValue = otp.join('');

        if (otpValue.length !== finalConfig.otpLength) {
            setError(`Please enter all ${finalConfig.otpLength} digits`);
            return;
        }

        setIsVerifying(true);
        setError('');

        try {
            const userContactValue = otpMethod === 'email' ? userData.UserEMailId : userData.UserMobileNo;

            const response = await verifyOtp({
                UserId: null,
                ContactType: otpMethod,
                ContactValue: userContactValue || contact, // Use provided contact for inline mode
                OtpCode: otpValue,
                UserLoginId: userData.UserLoginId,
            });

            if (response.Data.Success) {
                if (onSuccess) {
                    onSuccess(response.Data);
                }

                if (!isInlineMode && finalConfig.autoNavigate && finalConfig.navigateUrl) {
                    setTimeout(() => {
                        navigate(finalConfig.navigateUrl);
                    }, 500);
                }

                if (!isInlineMode) {
                    handleClose();
                }
            } else {
                setError(response.Data.Message || 'Invalid OTP. Please try again.');
                setOtp(Array(finalConfig.otpLength).fill(''));
                inputRefs.current[0]?.focus();
            }
        } catch (error) {
            setError(error.message || 'Verification failed. Please try again.');
            setOtp(Array(finalConfig.otpLength).fill(''));
            inputRefs.current[0]?.focus();
        } finally {
            setIsVerifying(false);
        }
    };

    // Resend OTP
    const handleResend = async () => {
        setOtp(Array(finalConfig.otpLength).fill(''));
        setError('');
        await handleSendOtp(otpMethod, contact);
    };

    // Change verification method
    const handleChangeMethod = () => {
        setShowMethodSelection(true);
        setOtpMethod('');
        setOtp(Array(finalConfig.otpLength).fill(''));
        setOtpSent(false);
        setError('');
    };

    // Close modal
    const handleClose = () => {
        if (isInlineMode) return; // Don't close in inline mode

        setIsClosing(true);
        setTimeout(() => {
            if (onClose) onClose();
        }, 500);
    };

    // Check if OTP is complete
    const isOtpComplete = otp.every(digit => digit !== '');

    // Get masked contact for display
    const getMaskedContact = () => {
        if (otpMethod === 'email') {
            const email = contact || userData?.UserEMailId || '';
            const [local, domain] = email.split('@');
            if (local && domain) {
                return `${local.slice(0, 2)}***@${domain}`;
            }
            return email;
        } else {
            const phone = contact || userData?.UserMobileNo || '';
            return phone.replace(/(\d{2})\d+(\d{2})/, '$1****$2');
        }
    };

    // Render inline mode
    if (isInlineMode) {
        return (
            <div className="space-y-4">
                {!otpSent ? (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleSendOtp(otpMethod, contact)}
                        loading={isSendingOtp}
                        disabled={isSendingOtp || !contact}
                        className="w-full"
                    >
                        {isSendingOtp ? 'Sending OTP...' : 'Send OTP'}
                    </Button>
                ) : (
                    <>
                        {/* Success message */}
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                            <p className="text-xs text-green-700">
                                OTP sent to {getMaskedContact()}
                            </p>
                        </div>

                        {/* Error message */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                                <p className="text-xs text-red-700">{error}</p>
                            </div>
                        )}

                        {/* OTP Input */}
                        <div className="flex justify-center gap-2">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => (inputRefs.current[index] = el)}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    onPaste={handlePaste}
                                    disabled={isVerifying}
                                    className="w-10 h-10 text-center text-xl font-bold border-2 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    style={{
                                        borderColor: digit ? '#3b82f6' : '#d1d5db'
                                    }}
                                />
                            ))}
                        </div>

                        {/* Verify Button */}
                        <Button
                            type="button"
                            variant="primary"
                            size="sm"
                            fullWidth
                            onClick={handleVerify}
                            loading={isVerifying}
                            disabled={!isOtpComplete || isVerifying}
                        >
                            {isVerifying ? 'Verifying...' : 'Verify OTP'}
                        </Button>

                        {/* Resend */}
                        <div className="flex justify-center">
                            {resendTimer > 0 ? (
                                <p className="text-xs text-gray-600">
                                    Resend in {resendTimer}s
                                </p>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleResend}
                                    disabled={isSendingOtp}
                                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium disabled:text-gray-400"
                                >
                                    <RefreshCw className={`w-3 h-3 ${isSendingOtp ? 'animate-spin' : ''}`} />
                                    Resend OTP
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>
        );
    }

    // Render modal mode (original implementation)
    if (!show) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-9998 transition-opacity duration-500 ${isClosing ? 'opacity-0' : 'opacity-100'
                    }`}
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 flex items-center justify-center p-3 z-9999 pointer-events-none">
                <div
                    className={`relative w-full max-w-md bg-white rounded-lg shadow-2xl pointer-events-auto overflow-hidden ${isClosing ? 'animate-modalSlideOut' : 'animate-modalSlideIn'
                        }`}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between gap-3 px-3 py-2 md:py-2.5 bg-linear-to-r from-amber-500 to-orange-600">
                        {/* Icon and Title */}
                        <div className="flex items-center gap-3">
                            <div className="relative shrink-0">
                                <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-amber-50 flex items-center justify-center">
                                    <Shield className="w-4 h-4 md:w-5 md:h-5 text-amber-600" />
                                </div>
                            </div>
                            <h3 className="text-base md:text-lg font-bold text-white">
                                {finalConfig.title}
                            </h3>
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={handleClose}
                            disabled={isVerifying || isSendingOtp}
                            className="shrink-0 text-white/60 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Close"
                        >
                            <X className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="px-4 py-4 overflow-y-auto max-h-[calc(100vh-150px)]">
                        {/* Icon with animated ring (centered in body) */}
                        <div className="flex justify-center mb-3">
                            <div className="relative">
                                <div className="absolute inset-0 rounded-full bg-amber-50 animate-ping opacity-75" />
                                <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-full bg-amber-50 ring-4 ring-amber-500/20 flex items-center justify-center">
                                    <Shield className="w-7 h-7 md:w-8 md:h-8 text-amber-600" />
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        {finalConfig.description && (
                            <div className="text-center mb-2">
                                <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                                    {finalConfig.description}
                                </p>
                            </div>
                        )}
                        {userData?.UserName && (
                            <p className="text-sm text-gray-500 text-center mb-2">
                                Welcome, {userData.UserName}!
                            </p>
                        )}

                        {/* Method Selection */}
                        {showMethodSelection && !skipMethodSelection && (
                            <div className="space-y-4">
                                <p className="text-center text-gray-700 mb-4">
                                    Choose how you'd like to receive your OTP
                                </p>

                                <button
                                    type="button"
                                    onClick={() => handleMethodSelect('email')}
                                    disabled={isSendingOtp}
                                    className="w-full flex items-center justify-center gap-3 p-3 border-2 border-blue-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Mail className="w-6 h-6 text-blue-600 group-hover:scale-110 transition-transform" />
                                    <div className="text-left">
                                        <p className="font-semibold text-gray-900">E-Mail</p>
                                        <p className="text-sm text-gray-600">
                                            Send OTP to your registered e-mail
                                        </p>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleMethodSelect('sms')}
                                    disabled={isSendingOtp}
                                    className="w-full flex items-center justify-center gap-3 p-3 border-2 border-green-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Smartphone className="w-6 h-6 text-green-600 group-hover:scale-110 transition-transform" />
                                    <div className="text-left">
                                        <p className="font-semibold text-gray-900">SMS</p>
                                        <p className="text-sm text-gray-600">
                                            Send OTP to your registered mobile
                                        </p>
                                    </div>
                                </button>
                            </div>
                        )}

                        {/* OTP Input */}
                        {(!showMethodSelection || skipMethodSelection) && otpSent && (
                            <div className="space-y-4">

                                {/* Success message */}
                                <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                                    <p className="text-sm text-green-700">
                                        OTP sent to your {getMaskedContact()}
                                    </p>
                                </div>

                                {/* Error message */}
                                {error && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                                        <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                                        <p className="text-sm text-red-700">{error}</p>
                                    </div>
                                )}

                                <div className="space-y-3">
                                    <p className="text-center text-gray-700">
                                        Enter the {finalConfig.otpLength}-digit code
                                    </p>

                                    {/* OTP Input Boxes */}
                                    <div className="flex justify-center gap-2 md:gap-3">
                                        {otp.map((digit, index) => (
                                            <input
                                                key={index}
                                                ref={(el) => (inputRefs.current[index] = el)}
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={1}
                                                value={digit}
                                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                                onKeyDown={(e) => handleKeyDown(index, e)}
                                                onPaste={handlePaste}
                                                disabled={isVerifying}
                                                className="w-10 h-10 md:w-12 md:h-12 text-center text-xl font-bold border-2 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                style={{
                                                    borderColor: digit ? '#3b82f6' : '#d1d5db'
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer - Only show when OTP is sent */}
                    {(!showMethodSelection || skipMethodSelection) && otpSent && (
                        <div className="px-4 pb-4 pt-2 border-t border-gray-100">
                            {/* Verify Button */}
                            <Button
                                type="button"
                                variant="primary"
                                size="md"
                                fullWidth
                                onClick={handleVerify}
                                loading={isVerifying}
                                disabled={!isOtpComplete || isVerifying}
                                className="mb-3 text-base! md:text-lg! py-1! md:py-1.5! bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            >
                                {isVerifying ? 'Verifying...' : 'Verify OTP'}
                            </Button>

                            {/* Resend Section */}
                            <div className="flex items-center justify-between mt-2">
                                {/* Only show change method if in 'both' mode */}
                                {!skipMethodSelection && (
                                    <button
                                        type="button"
                                        onClick={handleChangeMethod}
                                        className="text-sm text-violet-600 hover:text-violet-700 font-medium"
                                    >
                                        Change Method
                                    </button>
                                )}

                                {resendTimer > 0 ? (
                                    <p className="text-sm text-gray-600 ml-auto">
                                        Resend in {resendTimer}s
                                    </p>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleResend}
                                        disabled={isSendingOtp}
                                        className="flex items-center gap-1 text-sm text-violet-600 hover:text-violet-700 font-medium disabled:text-gray-400 ml-auto"
                                    >
                                        <RefreshCw className={`w-4 h-4 ${isSendingOtp ? 'animate-spin' : ''}`} />
                                        Resend OTP
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {(isSendingOtp || isVerifying) && (
                <Loader text={isSendingOtp ? "Sending OTP..." : "Verifying..."} />
            )}

            <style>{`
                @keyframes modalSlideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-40px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes modalSlideOut {
                    from {
                        opacity: 1;
                        transform: translateY(0);
                    }
                    to {
                        opacity: 0;
                        transform: translateY(-40px);
                    }
                }

                .animate-modalSlideIn {
                    animation: modalSlideIn 0.5s ease-out forwards;
                }

                .animate-modalSlideOut {
                    animation: modalSlideOut 0.5s ease-in forwards;
                }

                @keyframes ping {
                    75%, 100% {
                        transform: scale(1.1);
                        opacity: 0;
                    }
                }
                
                .animate-ping {
                    animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
                }
            `}</style>
        </>
    );
};

export default OtpVerification;