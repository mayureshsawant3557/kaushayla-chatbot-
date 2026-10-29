import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import publicAgent from '../../lib/api/publicAgent';
import { SendGrievance } from '../../Endpoints_All/Administration/admin';
import Swal from 'sweetalert2';
import UploadPhoto from '../formcomponent/UploadPhoto';
import UploadPdf from '../formcomponent/UploadPdf';
import OTPService from '../formcomponent/OTPService';
import { CheckGrievanceStatus } from '../../Endpoints_All/Administration/admin';
import { send_message } from '../../Endpoints_All/OTP/otp';
import { getDeviceIP } from '../../utils/CommonHelper';


const GrievanceForm = ({ onBack, color }) => {
    const { t, i18n } = useTranslation('contact');
    const [isRegistered, setIsRegistered] = useState(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        middleName: '',
        lastName: '',
        profileID: '',
        emailID: '',
        mobileNo: '',
        grievanceCategoryID: 1,
        otherGrievanceCategory: '',
        grievance: '',
        grievanceFileURL: '',
        userLoginID: '',
        ipAddress: '',
        document: null
    });
    const [isOtpVerified, setIsOtpVerified] = useState(false);
    const [grievanceData, setGrievanceData] = useState(null);
    const [ipAddress, setIpAddress] = useState("0.0.0.0");



    const otpServiceVerification = OTPService({
        mobileNo: String(formData.mobileNo || ""),
        purpose: 'VerifyCandidateMobileNo',
        isVerifyRequired: true,
        messege: t('OTP verification required for registration'),
        isDuplicateCheck: false,

        onSuccess: async () => {
            setIsOtpVerified(true);

            Swal.fire({
                icon: "success",
                title: t('Verified'),
                text: t('Mobile number verified successfully. You can now submit grievance.'),
                showConfirmButton: true,
                confirmButtonText: t('OK'),
            });
        },
        onError: (error) => {
            Swal.fire({
                title: t('Verification Failed'),
                text: error.message || t('OTP verification failed'),
                icon: "error",
                showCancelButton: true,
                cancelButtonText: t('Cancel'),
            });
        }
    });

    // Get IP Address function
    const fetchIP = async () => {
        try {
            const ip = await getDeviceIP();
            setIpAddress(ip);
        } catch (err) {
        }
        };

        
    useEffect (() =>{
        fetchIP();
    },[]);

    useEffect(() => {
        setIsOtpVerified(false); // reset OTP when switching

        if (isRegistered === true) {
            setFormData(prev => ({ ...prev, profileID: '', userLoginID: '' }));
        } else if (isRegistered === false) {
            setFormData(prev => ({ ...prev, profileID: '', userLoginID: 'PUBLIC_USER' }));
        }
    }, [isRegistered]);
    useEffect(() => {
        setIsOtpVerified(false);
    }, [formData.mobileNo]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Convert only name fields to uppercase
        if (name === "firstName" || name === "middleName" || name === "lastName") {
            setFormData(prev => ({
                ...prev,
                [name]: value.toUpperCase()
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handlePdfUpload = (fileData) => {

        setFormData(prev => ({
            ...prev,
            document: fileData.file,
            grievanceFileURL: fileData.filePath
        }));
    };

    const fetchGrievanceDetails = async (grievanceId, mobileNo) => {
        try {
            const response = await publicAgent.get(
                `${CheckGrievanceStatus}?GrievanceID=${grievanceId}&MobileNo=${mobileNo}`
            );

            if (response.data?.Status === "Success" && response.data.Data) {
                setGrievanceData(response.data.Data);
            } else {
                Swal.fire(t('Error'), t('Unable to fetch grievance details'), "error");
            }
        } catch (error) {
            Swal.fire(t('Error'), t('Failed to fetch grievance details'), "error");
        }
    };


    const maxSize = 1 * 1024 * 1024; // 1 MB
    const validateForm = () => {
        if (!formData.firstName || formData.firstName.trim() === '') {
            Swal.fire({
                icon: 'warning',
                title: t('Validation Error'),
                text: t('First Name is required'),
                confirmButtonColor: color?.replace('bg-', '#') || '#1e3a8a',
                showConfirmButton: true,
                confirmButtonText: t('OK')
            });
            return false;
        }

        if (!formData.mobileNo || formData.mobileNo.length !== 10 || !/^\d+$/.test(formData.mobileNo)) {
            Swal.fire({
                icon: 'warning',
                title: t('Validation Error'),
                text: t('Valid 10-digit Mobile Number is required'),
                confirmButtonColor: color?.replace('bg-', '#') || '#1e3a8a',
                showCancelButton: true,
                cancelButtonText: t('Cancel'),
            });
            return false;
        }

        if (!formData.grievance || formData.grievance.trim() === '') {
            Swal.fire({
                icon: 'warning',
                title: t('Validation Error'),
                text: t('Grievance description is required'),
                confirmButtonColor: color?.replace('bg-', '#') || '#1e3a8a',
                showCancelButton: true,
                cancelButtonText: t('Cancel'),
            });
            return false;
        }

        if (formData.grievance.length > 500) {
            Swal.fire({
                icon: 'warning',
                title: t('Validation Error'),
                text: t('Grievance description cannot exceed 500 characters'),
                confirmButtonColor: color?.replace('bg-', '#') || '#1e3a8a',
                showCancelButton: true,
                cancelButtonText: t('Cancel'),
            });
            return false;
        }

        if (isRegistered === true && (!formData.profileID || formData.profileID.trim() === '')) {
            Swal.fire({
                icon: 'warning',
                title: t('Validation Error'),
                text: t('Profile ID is required for registered users'),
                confirmButtonColor: color?.replace('bg-', '#') || '#1e3a8a',
                showCancelButton: true,
                cancelButtonText: t('Cancel'),
            });
            return false;
        }

        // Email validation if provided
        if (formData.emailID && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailID)) {
            Swal.fire({
                icon: 'warning',
                title: t('Validation Error'),
                text: t('Please enter a valid email address'),
                confirmButtonColor: color?.replace('bg-', '#') || '#1e3a8a',
                showCancelButton: true,
                cancelButtonText: t('Cancel'),
            });
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            

            // Prepare data exactly as expected by the backend
            const grievanceData = {
                firstName: formData.firstName.trim(),
                middleName: formData.middleName || "",
                lastName: formData.lastName || "",
                profileID: formData.profileID || "",
                emailID: formData.emailID || "",
                mobileNo: formData.mobileNo,
                grievanceCategoryID: 1,

                // REQUIRED EXTRA FIELDS 
                grievanceCategory: "General",
                grievanceDate: new Date().toISOString(),
                grievanceTime: new Date().toLocaleTimeString(),

                otherGrievanceCategory: formData.otherGrievanceCategory || "",

                grievance: formData.grievance,

                grievanceFileURL: formData.grievanceFileURL || "",

                // REQUIRED EXTRA FIELDS 
                repliedGrievance: "",
                repliedGrievanceDate: "",
                repliedGrievanceTime: "",
                repliedGrievanceFileURL: "",

                userLoginID: isRegistered ? "REGISTERED_USER" : "PUBLIC_USER",
                ipAddress: ipAddress
            };


            const response = await publicAgent.post(SendGrievance, grievanceData);


            if (response?.data) {
                const grievanceId = response?.data?.Data || '';

                try {
                    const messagePayload = {
                        UserLoginID: grievanceId,
                        Name: formData.firstName,
                        UserID: 0,
                        mobileNo: formData.mobileNo,
                        Purpose: "MSBVGrievanceRegistration",
                        MessageType: "S"
                    };

                    const smsResponse = await publicAgent.post('/api/OTP/send-message', messagePayload);

                } catch (smsError) {
                }

                Swal.fire({
                    icon: 'success',
                    title: t('Success!'),
                    html: `
                        <div>
                            <p>${t('Grievance submitted successfully!')}</p>
                            <p class="font-bold text-lg mt-2">${t('Grievance ID')}: ${grievanceId}</p>
                            <p class="text-sm text-gray-600 mt-2">${t('Please save this ID for tracking your grievance.')}</p>
                        </div>
                    `,
                    showConfirmButton: true,
                    confirmButtonText: t('OK'),
                }).then(async () => {
                    await fetchGrievanceDetails(grievanceId, formData.mobileNo);
                    // Reset form and go back
                    setFormData({
                        firstName: '',
                        middleName: '',
                        lastName: '',
                        profileID: '',
                        emailID: '',
                        mobileNo: '',
                        grievanceCategoryID: 1,
                        otherGrievanceCategory: '',
                        grievance: '',
                        grievanceFileURL: '',
                        userLoginID: '',
                        ipAddress: '',
                        document: null
                    });
                    setIsRegistered(null);
                    // onBack();
                });
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (error) {

            // Log the error response details
            if (error.response) {

                // Show specific error message from server if available
                const errorMessage = error.response.data?.message ||
                    error.response.data?.Message ||
                    error.response.data?.title ||
                    error.response.data ||
                    t('Failed to submit grievance. Please check all fields and try again.');

                Swal.fire({
                    icon: 'error',
                    title: t('Submission Failed'),
                    text: errorMessage,
                    confirmButtonColor: color?.replace('bg-', '#') || '#1e3a8a'
                });
            } else if (error.request) {
                Swal.fire({
                    icon: 'error',
                    title: t('Network Error'),
                    text: t('Could not connect to the server. Please check your internet connection.'),
                    confirmButtonColor: color?.replace('bg-', '#') || '#1e3a8a',
                    showCancelButton: true,
                    cancelButtonText: t('Cancel'),
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: t('Error'),
                    text: error.message || t('An unexpected error occurred'),
                    confirmButtonColor: color?.replace('bg-', '#') || '#1e3a8a',
                    showCancelButton: true,
                    cancelButtonText: t('Cancel'),
                });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white">
            <div className="relative mb-6">
                <div className="border border-gray-300 rounded-md pt-8 pb-6 px-6 bg-gray-50 relative">
                    <div className="absolute top-0 left-6 transform -translate-y-1/2 
                                bg-gray-600 text-white px-6 py-2 
                                text-base font-semibold rounded-md shadow">
                        {t('Post Grievance Title')}
                    </div>

                    {!grievanceData && (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Registration */}
                            <div>
                                <div className="text-sm mb-2 font-medium">
                                    {t('Are you registered on Board Portal?')} *
                                </div>
                                <div className="flex gap-10">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="registration"
                                            checked={isRegistered === true}
                                            onChange={() => setIsRegistered(true)}
                                            disabled={loading}
                                        />
                                        {t('Yes')}
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="registration"
                                            checked={isRegistered === false}
                                            onChange={() => setIsRegistered(false)}
                                            disabled={loading}
                                        />
                                        {t('No')}
                                    </label>
                                </div>
                            </div>

                            {/* Profile ID */}
                            {isRegistered === true && (
                                <div className="max-w-md">
                                    <label className="text-sm">{t('Profile ID')} <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        name="profileID"
                                        value={formData.profileID}
                                        onChange={handleInputChange}
                                        className="w-full border border-gray-300 px-3 py-2 text-sm bg-white mt-1"
                                        disabled={loading}
                                        required
                                    />
                                </div>
                            )}

                            {isRegistered !== null && (
                                <>
                                    {/* Name Row */}
                                    <div className="grid grid-cols-3 gap-6">
                                        <div>
                                            <label className="text-sm">
                                                {t('First Name')} <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleInputChange}
                                                className="w-full border border-gray-300 px-3 py-2 text-sm bg-white mt-1"
                                                disabled={loading}
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="text-sm">{t('Middle / Father / Husband Name')}</label>
                                            <input
                                                type="text"
                                                name="middleName"
                                                value={formData.middleName}
                                                onChange={handleInputChange}
                                                className="w-full border border-gray-300 px-3 py-2 text-sm bg-white mt-1"
                                                disabled={loading}
                                            />
                                        </div>

                                        <div>
                                            <label className="text-sm">{t('Last / Surname')}</label>
                                            <input
                                                type="text"
                                                name="lastName"
                                                value={formData.lastName}
                                                onChange={handleInputChange}
                                                className="w-full border border-gray-300 px-3 py-2 text-sm bg-white mt-1"
                                                disabled={loading}
                                            />
                                        </div>
                                    </div>

                                    {/* Email + Mobile */}
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-sm">{t('E-Mail ID')}</label>
                                            <input
                                                type="email"
                                                name="emailID"
                                                value={formData.emailID}
                                                onChange={handleInputChange}
                                                className="w-full border border-gray-300 px-3 py-2 text-sm bg-white mt-1"
                                                disabled={loading}
                                            />
                                        </div>

                                        <div>
                                            <label className="text-sm">
                                                {t('Mobile Number')} <span className="text-red-500">*</span>
                                            </label>
                                            <div className="flex mt-1">
                                                <span className="px-3 py-2 bg-gray-200 border border-gray-300 border-r-0 text-sm">
                                                    +91
                                                </span>
                                                <input
                                                    type="tel"
                                                    name="mobileNo"
                                                    value={formData.mobileNo}
                                                    onChange={handleInputChange}
                                                    className="w-full border border-gray-300 px-3 py-2 text-sm bg-white"
                                                    disabled={loading}
                                                    required
                                                    pattern="[0-9]{10}"
                                                    maxLength="10"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Grievance + Upload */}
                                    <div className="grid grid-cols-3 gap-6">
                                        <div className="col-span-2">
                                            <label className="text-sm">
                                                {t('Grievance Description')} <span className="text-red-500">*</span>
                                            </label>
                                            <textarea
                                                name="grievance"
                                                value={formData.grievance}
                                                onChange={handleInputChange}
                                                rows={5}
                                                className="w-full border border-gray-300 px-3 py-2 text-sm bg-white mt-1"
                                                disabled={loading}
                                                required
                                                maxLength="500"
                                            />
                                            <div className="text-xs text-gray-500 mt-1">
                                                {formData.grievance.length}/500 {t('characters')}
                                            </div>
                                        </div>

                                        <div className="col-span-3">
                                            <UploadPdf
                                                file={formData.document}
                                                onFileChange={handlePdfUpload}
                                                allowedFileTypes="pdf, jpg, jpeg"
                                                maxFileSize="1 MB"
                                                label={t('Upload Grievance Document')}
                                                required={false}
                                                userTypeId="91"
                                                userLoginID={formData.mobileNo || "public"}
                                                linkName={t('View Document')}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-center gap-4 pt-6">
                                        {isRegistered === true && (
                                            <button
                                                type={isOtpVerified ? "submit" : "button"}
                                                onClick={() => {
                                                    if (!isOtpVerified) {
                                                        if (!validateForm()) {
                                                            return;
                                                        }
                                                        otpServiceVerification.sendOTP();
                                                    }
                                                }}
                                                disabled={loading}
                                                className="px-8 py-2 bg-green-600 text-white font-semibold rounded hover:bg-green-700 disabled:opacity-50"
                                            >
                                                {loading
                                                    ? t('Searching...')
                                                    : isOtpVerified
                                                        ? t('Submit Grievance')
                                                        : t('Verify OTP')}
                                            </button>
                                        )}
                                        {isRegistered === false && (
                                            <button
                                                type={isOtpVerified ? "submit" : "button"}
                                                onClick={() => {
                                                    if (!isOtpVerified) {
                                                        if (!validateForm()) return;
                                                        otpServiceVerification.sendOTP();
                                                    }
                                                }}
                                                className="px-8 py-2 bg-green-600 text-white font-semibold rounded hover:bg-green-700"
                                                disabled={loading}
                                            >
                                                {isOtpVerified ? t('Submit Grievance') : t('Register')}
                                            </button>
                                        )}

                                        <button
                                            type="button"
                                            onClick={onBack}
                                            disabled={loading}
                                            className="px-8 py-2 bg-yellow-400 text-black font-semibold rounded hover:bg-yellow-500"
                                        >
                                            {t('Back')}
                                        </button>

                                    </div>
                                </>
                            )}

                            {/* Only Back */}
                            {isRegistered === null && (
                                <div className="pt-4 flex justify-center">
                                    <button
                                        type="button"
                                        onClick={onBack}
                                        className="px-6 py-2 bg-yellow-400 text-black font-semibold rounded hover:bg-yellow-500"
                                    >
                                        {t('Back')}
                                    </button>
                                </div>
                            )}
                        </form>
                    )}
                    {grievanceData && (
                        <div className="mt-8 border-t pt-6">
                            <h3 className="text-lg font-semibold mb-4">{t('Grievance Details')}</h3>

                            <div className="bg-white p-6 border space-y-3">
                                <p><b>{t('Grievance No.')}:</b> {grievanceData.GrievanceID}</p>

                                <p><b>{t('Complainant')}:</b> {[
                                    grievanceData.FirstName,
                                    grievanceData.MiddleName,
                                    grievanceData.LastName
                                ].filter(Boolean).join(" ")}</p>

                                <p><b>{t('Date')}:</b> {grievanceData.GrievanceDate}</p>
                                <p><b>{t('Time')}:</b> {grievanceData.GrievanceTime}</p>

                                <p><b>{t('Grievance')}:</b> {grievanceData.Grievance}</p>

                                {grievanceData.RepliedGrievance && (
                                    <p><b>{t('Reply by Board')}:</b> {grievanceData.RepliedGrievance}</p>
                                )}

                                {grievanceData.GrievanceFileURL && (
                                    <a
                                        href={grievanceData.GrievanceFileURL}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 underline"
                                    >
                                        {t('View Document')}
                                    </a>
                                )}
                            </div>

                            {/* Back / Reset */}
                            <div className="mt-4 text-center">
                                <button
                                    onClick={() => {
                                        setGrievanceData(null);
                                    }}
                                    className="px-6 py-2 bg-yellow-400 rounded"
                                >
                                    {t('Submit Another')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GrievanceForm;