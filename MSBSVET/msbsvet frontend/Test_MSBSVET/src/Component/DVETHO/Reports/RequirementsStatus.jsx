
import React, { useState, useContext } from 'react';
import Swal from 'sweetalert2';
import agent from '../../../lib/api/agent';
import { GetInstituteIDByInstituteCode } from "../../../Endpoints_All/Base/Institute";
import { UpdateITIRequirementsStatusToDraft } from '../../../Endpoints_All/ITISpecification/itiSpecification';
import FormComponent from '../../formcomponent/FormComponent';
import { useLoading } from "../../../Hooks/useLoading";
import { ThemeContext } from "../../Context/ThemeContext";

const UnlockRequirements = () => {
    const [collegeRegistrationNo, setCollegeRegistrationNo] = useState('');
    const [errors, setErrors] = useState({});
    const { startLoading, stopLoading, isLoading } = useLoading();
    const { color } = useContext(ThemeContext);

    const handleUnlock = async () => {
        // Validation
        if (!collegeRegistrationNo.trim()) {
            setErrors({ collegeRegistrationNo: "College Registration Number is required" });
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'College Registration Number is required',
                confirmButtonColor: '#ef4444',
            });
            return;
        }

        // Confirmation dialog
        const confirmResult = await Swal.fire({
            title: 'Confirm Unlock',
            text: `Are you sure you want to unlock requirements for ${collegeRegistrationNo}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, unlock it!',
            cancelButtonText: 'Cancel'
        });

        if (!confirmResult.isConfirmed) return;

        startLoading();

        // Show loading dialog
        Swal.fire({
            title: 'Unlocking Requirements',
            text: 'Please wait...',
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            // Fetch Institute ID
            const resInstitute = await agent.get(
                `${GetInstituteIDByInstituteCode}?InstituteCode=${collegeRegistrationNo.trim()}`
            );

            if (!resInstitute.data?.Data) {
                Swal.fire({
                    icon: 'error',
                    title: 'Institute Not Found',
                    text: 'No institute found for the provided College Registration Number',
                    confirmButtonColor: '#ef4444',
                });
                stopLoading();
                return;
            }

            const instID = resInstitute.data.Data;

            // Unlock Requirements
            const response = await agent.post(
                `${UpdateITIRequirementsStatusToDraft}?collegeID=${instID}`
            );

            if (response.data?.Status ==='Success') {
                Swal.fire({
                    icon: 'success',
                    title: 'Unlocked Successfully',
                    text: response.data.Message || 'Requirements unlocked successfully!',
                    confirmButtonColor: '#10b981',
                });

                // Reset form
                setCollegeRegistrationNo('');
                setErrors({});
            } else {
                Swal.fire({
                    icon: 'warning',
                    title: 'Unlock Failed',
                    text: response.data?.Message || 'Failed to unlock requirements',
                    confirmButtonColor: '#f59e0b',
                });
            }
        } catch (error) {

            const errorMessage =
                error.response?.data?.Message ||
                error.response?.data?.message ||
                "An error occurred while unlocking requirements";

            Swal.fire({
                icon: 'error',
                title: 'Server Error',
                text: errorMessage,
                confirmButtonColor: '#ef4444',
            });
        } finally {
            stopLoading();
        }
    };

    return (
        <div className="container mx-auto p-4">
            <fieldset className="border border-gray-300 rounded mb-6 px-4 pt-3 pb-6 bg-white shadow-lg">
                <legend
                    className={`flex items-center gap-2 rounded-md border border-gray-300 ${color} px-4 py-2 text-xl font-bold text-white shadow-md`}
                >
                    Unlock Requirements
                </legend>

                <div className="max-w-md mx-auto mt-6">
                    <FormComponent
                        label="College Registration Number"
                        isSelect={false}
                        value={collegeRegistrationNo}
                        onChange={(val) => {
                            setCollegeRegistrationNo(val);
                            setErrors({ ...errors, collegeRegistrationNo: null });
                        }}
                        error={errors.collegeRegistrationNo}
                        required={true}
                        placeholder="e.g., GR27000012"
                    />

                    <div className="mt-6 text-center">
                        <button
                            onClick={handleUnlock}
                            disabled={isLoading}
                            className={`
                                px-6 py-2 rounded-md font-semibold text-white
                                transition-all duration-200
                                ${isLoading
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-green-600 hover:bg-green-700'
                                }
                            `}
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2 justify-center">
                                    <svg
                                        className="animate-spin h-5 w-5"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12" cy="12" r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>
                                    Processing...
                                </span>
                            ) : (
                                '🔓 Unlock'
                            )}
                        </button>
                    </div>

                    <p className="text-sm text-gray-600 text-center mt-4">
                        Changes status from "Submitted" to "Draft" for current financial year
                    </p>
                </div>
            </fieldset>
        </div>
    );
};

export default UnlockRequirements;
