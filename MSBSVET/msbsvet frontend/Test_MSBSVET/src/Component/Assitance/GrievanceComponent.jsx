import React, { useState } from 'react';
import agentPublic from '../../lib/api/publicAgent';
import Swal from 'sweetalert2';
import { AiOutlineCheckCircle } from 'react-icons/ai';

import { send_otp, verify_otp } from '../../Endpoints_All/OTP/otp'
export default function GrievanceSubmissionForm() {
    const [userData, setUserData] = useState({
        name: '',
        email: '',
        primaryNumber: '',
        grievanceType: '',
        subject: '',
        description: '',
        attachments: []
    });

    const [errors, setErrors] = useState({});
    const [isVerified, setIsVerified] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Handle input changes
    const handleInputChange = (field, value) => {
        setUserData(prevState => ({
            ...prevState,
            [field]: value
        }));

        // Clear specific field error when typing
        if (errors[field]) {
            setErrors(prevErrors => {
                const updatedErrors = { ...prevErrors };
                delete updatedErrors[field];
                return updatedErrors;
            });
        }
    };

    // Handle file attachments
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const validFiles = files.filter(file => {
            // Validate file size (max 5MB) and type
            const isValidSize = file.size <= 5 * 1024 * 1024;
            const isValidType = ['image/jpeg', 'image/png', 'application/pdf'].includes(file.type);
            return isValidSize && isValidType;
        });

        setUserData(prevState => ({
            ...prevState,
            attachments: validFiles
        }));

        // Clear any previous attachment errors
        if (errors.attachments) {
            setErrors(prevErrors => {
                const updatedErrors = { ...prevErrors };
                delete updatedErrors.attachments;
                return updatedErrors;
            });
        }
    };

    // Mobile Number Verification
    const handleVerifyClick = async () => {
        // Validate mobile number
        if (!userData.primaryNumber || userData.primaryNumber.length !== 10) {
            setErrors(prevErrors => ({
                ...prevErrors,
                primaryNumber: "Please enter a valid 10-digit mobile number."
            }));
            return;
        }

        setIsLoading(true);
        try {
            // Send OTP API Call
            const response = await agentPublic.post(send_otp, {
                mobileNumber: userData.primaryNumber,
            });

            const otp = response.data.otp;

            Swal.fire({
                title: "OTP Sent",
                html: `
                    <p>OTP has been sent to ******${userData.primaryNumber.slice(-4)}.</p>
                    <p>OTP: <strong>${otp}</strong></p>
                    <input type="text" id="otp-input" class="swal2-input" placeholder="Enter OTP" />
                `,
                showCancelButton: true,
                confirmButtonText: "Verify OTP",
                cancelButtonText: "Close",
                showDenyButton: true,
                denyButtonText: "Resend OTP",
                preConfirm: async () => {
                    const enteredOtp = document.getElementById("otp-input").value;
                    if (!enteredOtp) {
                        Swal.showValidationMessage("Please enter the OTP.");
                        return false;
                    }

                    try {
                        // Verify OTP API Call
                        const verifyResponse = await agentPublic.post(
                            verify_otp,
                            {
                                mobileNumber: userData.primaryNumber,
                                otp: enteredOtp
                            }
                        );

                        if (verifyResponse.data.success) {
                            setIsVerified(true);
                            Swal.fire({
                                title: "Verified ✅",
                                text: "Your mobile number has been verified successfully!",
                                icon: "success",
                                timer: 2000,
                                showConfirmButton: false,
                            });
                            return true;
                        } else {
                            Swal.showValidationMessage(verifyResponse.data.message);
                            return false;
                        }
                    } catch (error) {
                        Swal.showValidationMessage("Invalid OTP or server error.");
                        return false;
                    }
                },
            }).then((result) => {
                if (result.isDenied) {
                    handleVerifyClick();
                }
                setIsLoading(false);
            });
        } catch (error) {
            Swal.fire("Error", "Something went wrong, please try again!", "error");
            setIsLoading(false);
        }
    };

    // Form Validation
    const validateForm = () => {
        const newErrors = {};

        // Validate Name
        if (!userData.name.trim()) {
            newErrors.name = 'Name is required';
        } else if (userData.name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters long';
        }

        // Validate Email
        if (!userData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(userData.email)) {
            newErrors.email = 'Email is invalid';
        }

        // Validate Primary Mobile Number
        if (!userData.primaryNumber.trim()) {
            newErrors.primaryNumber = 'Primary mobile number is required';
        } else if (!/^\d{10}$/.test(userData.primaryNumber)) {
            newErrors.primaryNumber = 'Mobile number must be 10 digits';
        }

        // Validate Grievance Type
        if (!userData.grievanceType) {
            newErrors.grievanceType = 'Please select a grievance type';
        }

        // Validate Subject
        if (!userData.subject.trim()) {
            newErrors.subject = 'Subject is required';
        } else if (userData.subject.trim().length < 10) {
            newErrors.subject = 'Subject must be at least 10 characters long';
        }

        // Validate Description
        if (!userData.description.trim()) {
            newErrors.description = 'Description is required';
        } else if (userData.description.trim().length < 50) {
            newErrors.description = 'Description must be at least 50 characters long';
        }

        // Validate Attachments (optional)
        if (userData.attachments.length > 3) {
            newErrors.attachments = 'Maximum 3 attachments allowed';
        }

        // Verify mobile number
        if (!isVerified) {
            newErrors.primaryNumber = 'Please verify your mobile number';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Form Submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form
        if (!validateForm()) return;

        setIsLoading(true);

        // Prepare form data for submission
        const formData = new FormData();
        formData.append('name', userData.name);
        formData.append('email', userData.email);
        formData.append('primaryNumber', userData.primaryNumber);
        formData.append('grievanceType', userData.grievanceType);
        formData.append('subject', userData.subject);
        formData.append('description', userData.description);

        // Append attachments
        userData.attachments.forEach((file, index) => {
            formData.append(`attachments`, file);
        });

        try {
            // Submit Grievance API Call
            const response = await agentPublic.post(
                "https://yourapi.com/api/Grievance/submit",
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            // Handle successful submission
            Swal.fire({
                title: "Grievance Submitted",
                text: "Your grievance has been successfully submitted!",
                icon: "success",
                confirmButtonText: "OK"
            });

            // Reset form
            setUserData({
                name: '',
                email: '',
                primaryNumber: '',
                grievanceType: '',
                subject: '',
                description: '',
                attachments: []
            });
            setIsVerified(false);
            setErrors({});
        } catch (error) {
            // Handle submission error
            Swal.fire({
                title: "Submission Failed",
                text: error.response?.data?.message || "Something went wrong. Please try again.",
                icon: "error",
                confirmButtonText: "OK"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container  mx-auto px-4 py-8">
            <div className="bg-white shadow-md rounded-lg p-6 max-w-full mx-auto">
                <h2 className="text-2xl font-bold text-blue-600 mb-6 text-center">Grievance Submission Form</h2>

                <form onSubmit={handleSubmit}>
                    {/* Name and Email in one row */}
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Full Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={userData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                className={`w-full p-2 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="Enter your full name"
                            />
                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                value={userData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                className={`w-full p-2 border rounded-md ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="Enter your email address"
                            />
                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                        </div>
                    </div>

                    {/* Mobile Number and Grievance Type in one row */}
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Primary Mobile Number <span className="text-red-500">*</span>
                            </label>
                            <div className="flex items-center gap-2">
                                <span className="rounded-md border border-gray-300 bg-gray-100 p-2">+91</span>
                                <input
                                    type="text"
                                    value={userData.primaryNumber}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, '');
                                        handleInputChange('primaryNumber', value);
                                    }}
                                    className={`w-full rounded-md p-2 border ${errors.primaryNumber ? "border-red-500" : "border-gray-300"}`}
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
                                        className="rounded-md bg-red-500 px-3 py-2 text-white disabled:opacity-50"
                                        onClick={handleVerifyClick}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Verifying...' : 'Verify'}
                                    </button>
                                )}
                            </div>
                            {errors.primaryNumber && <p className="text-red-500 text-sm mt-1">{errors.primaryNumber}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Grievance Type <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={userData.grievanceType}
                                onChange={(e) => handleInputChange('grievanceType', e.target.value)}
                                className={`w-full p-2 border rounded-md ${errors.grievanceType ? 'border-red-500' : 'border-gray-300'}`}
                            >
                                <option value="">Select Grievance Type</option>
                                <option value="technical">Technical Issue</option>
                                <option value="billing">Billing Concern</option>
                                <option value="service">Service Complaint</option>
                                <option value="other">Other</option>
                            </select>
                            {errors.grievanceType && <p className="text-red-500 text-sm mt-1">{errors.grievanceType}</p>}
                        </div>
                    </div>

                    {/* Subject */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Subject <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={userData.subject}
                            onChange={(e) => handleInputChange('subject', e.target.value)}
                            className={`w-full p-2 border rounded-md ${errors.subject ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="Enter grievance subject"
                        />
                        {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject}</p>}
                    </div>

                    {/* Description */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={userData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            className={`w-full p-2 border rounded-md ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                            rows="4"
                            placeholder="Provide a detailed description of your grievance"
                        ></textarea>
                        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                    </div>

                    {/* File Attachments */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Attachments (Optional, Max 3 files)
                        </label>
                        <input
                            type="file"
                            multiple
                            accept=".jpg,.jpeg,.png,.pdf"
                            onChange={handleFileChange}
                            className="w-full p-2 border rounded-md"
                        />
                        {errors.attachments && <p className="text-red-500 text-sm mt-1">{errors.attachments}</p>}
                        {userData.attachments.length > 0 && (
                            <div className="mt-2">
                                <p className="text-sm text-gray-600">
                                    Selected files: {userData.attachments.map(file => file.name).join(', ')}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="text-center mt-6">
                        <button
                            type="submit"
                            className="bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600 transition duration-300 disabled:opacity-50"
                            disabled={!isVerified || isLoading}
                        >
                            {isLoading ? 'Submitting...' : 'Submit Grievance'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}