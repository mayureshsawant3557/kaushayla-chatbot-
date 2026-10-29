import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import publicAgent from '../../lib/api/publicAgent';
import { CheckGrievanceStatus } from '../../Endpoints_All/Administration/admin';
import OTPService from '../formcomponent/OTPService';
import { send_message } from '../../Endpoints_All/OTP/otp';
import Swal from 'sweetalert2';

const TrackGrievance = ({ onBack, color, initialGrievanceId, initialMobileNo }) => {
    const { t } = useTranslation('contact');
    const [loading, setLoading] = useState(false);
    const [grievanceData, setGrievanceData] = useState(null);
    const [formData, setFormData] = useState({
        grievanceId: initialGrievanceId || '',
        mobileNo: initialMobileNo || ''
    });
    const [recentGrievances, setRecentGrievances] = useState([]);
    const grievanceRef = useRef(null);

    const otpServiceVerification = OTPService({
        mobileNo: String(formData.mobileNo || ""),
        purpose: 'VerifyCandidateMobileNo',
        isVerifyRequired: true,
        messege: t('OTP verification required to view grievance details'),
        isDuplicateCheck: false,
        onSuccess: async () => {
            setGrievanceData(grievanceRef.current);
        },
        onError: (error) => {
            Swal.fire({
                title: t('Verification Failed'),
                text: error.message || t('OTP verification failed'),
                icon: "error",
                showConfirmButton: false,
                showCancelButton: true,
                cancelButtonText: t('Cancel'),
            });
        }
    });

    useEffect(() => {
        // Load recent grievances from localStorage
        const saved = localStorage.getItem('recentGrievances');
        if (saved) {
            setRecentGrievances(JSON.parse(saved));
        }
    }, []);

    // Auto-search if initial values are provided
    useEffect(() => {
        if (initialGrievanceId && initialMobileNo) {
            handleSearch(new Event('submit'));
        }
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear previous results when user starts typing
        setGrievanceData(null);
    };

    const validateForm = () => {
        if (!formData.grievanceId || formData.grievanceId.trim() === '') {
            Swal.fire({
                icon: 'warning',
                title: t('Validation Error'),
                text: t('Grievance Number is required'),
                showConfirmButton: false,
                showCancelButton: true,
                cancelButtonText: t('Cancel'),
            });
            return false;
        }

        if (!formData.mobileNo || formData.mobileNo.length !== 10 || !/^\d+$/.test(formData.mobileNo)) {
            Swal.fire({
                icon: 'warning',
                title: t('Validation Error'),
                text: t('Valid 10-digit Mobile Number is required'),
                showConfirmButton: false,
                showCancelButton: true,
                cancelButtonText: t('Cancel'),
            });
            return false;
        }

        return true;
    };

    const handleSearch = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setGrievanceData(null);

        try {
            // First API call to check if grievance exists
            const response = await publicAgent.get(
                `${CheckGrievanceStatus}?GrievanceID=${formData.grievanceId}&MobileNo=${formData.mobileNo}`
            );


            if (response.data && response.data.Status === "Success" && response.data.Data) {
                const grievanceData = response.data.Data;

                // Store the mobile number from the response
                const mobileFromDB = String(grievanceData?.MobileNo || '').trim();
                const enteredMobile = String(formData.mobileNo || '').trim();


                if (mobileFromDB && mobileFromDB === enteredMobile) {
                    grievanceRef.current = grievanceData;
                    otpServiceVerification.sendOTP();
                } else {
                    Swal.fire({
                        icon: 'warning',
                        title: t('Mobile Number Mismatch'),
                        text: t('The mobile number does not match the grievance record.'),
                        showConfirmButton: false,
                        showCancelButton: true,
                        cancelButtonText: t('Cancel'),
                    });
                    setLoading(false);
                }
            } else {
                Swal.fire({
                    icon: 'info',
                    title: t('Not Found'),
                    text: response.data?.Message || t('No grievance found with the provided details.'),
                    showConfirmButton: false,
                    showCancelButton: true,
                    cancelButtonText: t('Cancel'),
                });
                setLoading(false);
            }
        } catch (error) {

            if (error.response?.status === 404) {
                Swal.fire({
                    icon: 'info',
                    title: t('Not Found'),
                    text: t('No grievance found with the provided details.'),
                    showConfirmButton: false,
                    showCancelButton: true,
                    cancelButtonText: t('Cancel'),
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: t('Error'),
                    text: error.response?.data?.message || t('Failed to track grievance. Please try again.'),
                    showConfirmButton: false,
                    showCancelButton: true,
                    cancelButtonText: t('Cancel'),
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        return dateStr;
    };

    const formatTime = (timeStr) => {
        if (!timeStr) return 'N/A';
        return timeStr;
    };

    // Get full name
    const getFullName = () => {
        if (!grievanceData) return '';
        const parts = [
            grievanceData.FirstName || '',
            grievanceData.MiddleName || '',
            grievanceData.LastName || ''
        ].filter(p => p.trim() !== '');
        return parts.join(' ');
    };

    return (
        <div className="bg-white">
            <div className="relative">
                <div className="border border-gray-300 rounded-md pt-8 pb-6 px-6 bg-gray-50 relative">
                    {/* Badge */}
                    <div className="absolute top-0 left-6 transform -translate-y-1/2 
                        bg-gray-600 text-white px-6 py-2 text-base font-semibold rounded-md shadow">
                        {t('Track Grievance Title')}
                    </div>

                    {/* Recent Grievances */}
                    {recentGrievances.length > 0 && !grievanceData && (
                        <div className="mb-6">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">{t('Recent Grievances')}:</h4>
                            <div className="flex flex-wrap gap-2">
                                {recentGrievances.map((g, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            setFormData({
                                                grievanceId: g.id,
                                                mobileNo: g.mobileNo
                                            });
                                            // Auto search after setting
                                            setTimeout(() => {
                                                handleSearch(new Event('submit'));
                                            }, 100);
                                        }}
                                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-sm border border-gray-300"
                                    >
                                        #{g.id} ({g.mobileNo})
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSearch}>
                        <div className="flex flex-col items-center space-y-6">
                            {/* Inputs */}
                            <div className="flex flex-col md:flex-row gap-8">
                                {/* Grievance Number */}
                                <div className="w-[420px]">
                                    <label className="text-sm font-medium">
                                        {t('Grievance Number')} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="grievanceId"
                                        value={formData.grievanceId}
                                        onChange={handleInputChange}
                                        className="w-full border border-gray-400 px-3 py-2 text-sm bg-white mt-1"
                                        disabled={loading}
                                        placeholder={t('Enter grievance number')}
                                        required
                                    />
                                </div>

                                {/* Mobile Number */}
                                <div className="w-[420px]">
                                    <label className="text-sm font-medium">
                                        {t('Mobile Number')} <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex mt-1">
                                        <span className="px-3 py-2 bg-gray-200 border border-gray-400 border-r-0 text-sm">
                                            +91
                                        </span>
                                        <input
                                            type="tel"
                                            name="mobileNo"
                                            value={formData.mobileNo}
                                            onChange={handleInputChange}
                                            className="w-full border border-gray-400 px-3 py-2 text-sm bg-white"
                                            disabled={loading}
                                            placeholder={t('Enter 10-digit mobile number')}
                                            pattern="[0-9]{10}"
                                            maxLength="10"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-4 mt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-10 py-2 bg-yellow-400 text-black font-semibold rounded hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? t('Searching...') : t('Search')}
                                </button>

                                <button
                                    type="button"
                                    onClick={onBack}
                                    disabled={loading}
                                    className="px-10 py-2 bg-cyan-500 text-black font-semibold rounded hover:bg-cyan-600 disabled:opacity-50"
                                >
                                    {t('Back')}
                                </button>
                            </div>
                        </div>
                    </form>

                    {/* Display Grievance Details - Only after OTP verification */}
                    {grievanceData && (
                        <div className="mt-8 border-t border-gray-300 pt-6">
                            <h3 className="text-lg font-semibold mb-4 text-gray-800">{t('Grievance Details')}</h3>

                            <div className="bg-white p-6 border border-gray-200">
                                <div className="space-y-3">
                                    <div className="text-base">
                                        <span className="font-bold">{t('Grievance No.')}:</span> {grievanceData.GrievanceID}
                                    </div>

                                    <div className="text-base">
                                        <span className="font-bold">{t('Complainant')}:</span> {getFullName()}
                                    </div>

                                    <div className="text-base">
                                        <span className="font-bold">{t('Date')}:</span> {formatDate(grievanceData.GrievanceDate)}
                                    </div>

                                    <div className="text-base">
                                        <span className="font-bold">{t('Time')}:</span> {formatTime(grievanceData.GrievanceTime)}
                                    </div>

                                    <div className="text-base">
                                        <span className="font-bold">{t('Grievance')}:</span> {grievanceData.Grievance}
                                    </div>

                                    {/* Reply by Board - Only if exists */}
                                    {grievanceData.RepliedGrievance && (
                                        <div className="text-base">
                                            <span className="font-bold">{t('Reply by Board')}:</span> {grievanceData.RepliedGrievance}
                                        </div>
                                    )}

                                    {/* Grievance Attachment */}
                                    {grievanceData.GrievanceFileURL && (
                                        <div className="mt-4">
                                            <a
                                                href={grievanceData.GrievanceFileURL}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                </svg>
                                                {t('View Attached Document')}
                                            </a>
                                        </div>
                                    )}

                                    {/* Reply Attachment - Only if exists */}
                                    {grievanceData.RepliedGrievanceFileURL && (
                                        <div className="mt-2">
                                            <a
                                                href={grievanceData.RepliedGrievanceFileURL}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                </svg>
                                                {t('View Reply Document')}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TrackGrievance;