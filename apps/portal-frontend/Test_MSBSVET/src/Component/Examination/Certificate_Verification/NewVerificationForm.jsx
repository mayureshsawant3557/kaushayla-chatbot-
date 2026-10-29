import React, { useState } from 'react';
import { ArrowLeft, Calendar, Search } from 'lucide-react';

const NewVerificationForm = ({
    onBack = () => { },
    onSubmit = () => { },
    onReset = () => { },
    ResultsComponent = null,
    initialData = {},
    isLoading = false,
    error = null,
    formData = {},
    onFormDataChange = () => { },
    candidateResults = []
}) => {
    // Use external form data if provided, otherwise use internal state
    const [internalFormData, setInternalFormData] = useState({
        profileId: '',
        firstName: '',
        dateOfBirth: '',
        gender: '',
        ...initialData
    });

    const currentFormData = Object.keys(formData).length > 0 ? formData : internalFormData;

    const handleInputChange = (field, value) => {
        if (Object.keys(formData).length > 0) {
            // Use external form data handler
            onFormDataChange(field, value);
        } else {
            // Use internal state
            setInternalFormData(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };

    const handleSearch = () => {
        // Validate required fields
        const requiredFields = ['profileId', 'firstName', 'dateOfBirth', 'gender'];
        const missingFields = requiredFields.filter(field => !currentFormData[field]);

        if (missingFields.length > 0) {
            return;
        }

        onSubmit(currentFormData);
    };

    const handleReset = () => {
        const resetData = {
            profileId: '',
            firstName: '',
            dateOfBirth: '',
            gender: ''
        };

        if (Object.keys(formData).length > 0) {
            // Reset external form data
            Object.keys(resetData).forEach(field => {
                onFormDataChange(field, resetData[field]);
            });
        } else {
            // Reset internal state
            setInternalFormData(resetData);
        }

        onReset();
    };

    const isFormValid = currentFormData.profileId && currentFormData.firstName && currentFormData.dateOfBirth && currentFormData.gender;

    return (
        <div className="min-h-screen bg-white px-4 py-10">
            <fieldset className="mx-auto max-w-full rounded-lg border border-gray-300 bg-white p-6 shadow">
                <legend className="flex items-center gap-2 rounded border border-gray-300 bg-gray-500 px-4 py-2 text-base font-bold text-white">
                    New Certificate Verification
                </legend>

                <header className="mb-8">
                    <div className="mx-auto flex max-w-full items-center space-x-4">
                        <button
                            onClick={onBack}
                            className="rounded-md bg-white border border-gray-300 p-2 hover:bg-gray-200 transition-colors"
                            type="button"
                        >
                            <ArrowLeft className="h-5 w-5 text-gray-700" />
                        </button>
                        <div>
                            <h1 className="text-lg font-semibold text-gray-800">Enter Candidate Details</h1>
                            <p className="text-xs text-gray-500 mt-0.5">Generate a new verification certificate</p>
                        </div>
                    </div>
                </header>

                {/* Error Display */}
                {error && (
                    <div className="mb-6 rounded-lg border-l-4 border-red-400 bg-red-50 p-4">
                        <p className="font-medium text-red-800">{error}</p>
                    </div>
                )}

                <div className="space-y-6">
                    {/* Form Grid */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                        {/* Profile ID */}
                        <div>
                            <label htmlFor="profileId" className="mb-2 block text-sm font-medium text-gray-700">
                                Profile ID *
                            </label>
                            <input
                                id="profileId"
                                type="text"
                                value={formData.profileId}
                                onChange={(e) => handleInputChange('profileId', e.target.value)}
                                className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                                placeholder="Enter Profile ID"
                                disabled={isLoading}
                                autoComplete="off"
                            />
                        </div>

                        {/* First Name */}
                        <div>
                            <label htmlFor="firstName" className="mb-2 block text-sm font-medium text-gray-700">
                                First Name *
                            </label>
                            <input
                                id="firstName"
                                type="text"
                                value={formData.firstName}
                                onChange={(e) => handleInputChange('firstName', e.target.value)}
                                className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                                placeholder="Enter First Name"
                                disabled={isLoading}
                                autoComplete="given-name"
                            />
                        </div>

                        {/* Date of Birth */}
                        <div>
                            <label htmlFor="dateOfBirth" className="mb-2 block text-sm font-medium text-gray-700">
                                Date of Birth *
                            </label>
                            <input
                                id="dateOfBirth"
                                type="date"
                                value={formData.dateOfBirth}
                                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                                className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                                disabled={isLoading}
                                max={new Date().toISOString().split('T')[0]}
                                autoComplete="bday"
                            />
                        </div>
                        {/* Gender */}
                        <div className="">
                            <label htmlFor="gender" className="mb-2 block text-sm font-medium text-gray-700">
                                Gender *
                            </label>
                            <select
                                id="gender"
                                value={currentFormData.gender}
                                onChange={(e) => handleInputChange('gender', e.target.value)}
                                className="appearance-none w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                                disabled={isLoading}
                                autoComplete="sex"
                            >
                                <option value="" disabled>Select Gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>

                    {/* Info Note */}
                    <div className="rounded-md border-l-4 border-yellow-500 bg-yellow-50 p-4">
                        <div className="flex items-start">
                            <Calendar className="mr-2 h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <span className="font-semibold text-yellow-800">Important:</span>
                                <p className="mt-1 text-sm text-yellow-700">
                                    Date of Birth should match your official certificate records.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-center space-x-4 pt-4">
                        <button
                            onClick={handleSearch}
                            disabled={isLoading || !isFormValid}
                            className="flex items-center space-x-2 rounded-md bg-green-600 px-6 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            <Search className="h-4 w-4" />
                            <span>{isLoading ? 'Searching...' : 'Search & Verify'}</span>
                        </button>
                        <button
                            onClick={handleReset}
                            
                            disabled={isLoading}
                            className="rounded-md bg-gray-600 px-6 py-2 text-sm font-semibold text-white hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            Reset Form
                        </button>
                    </div>

                    {/* Search Results */}
                    {ResultsComponent && candidateResults.length > 0 && (
                        <ResultsComponent results={candidateResults} />
                    )}
                </div>
            </fieldset>
        </div>
    );
};

export default NewVerificationForm;