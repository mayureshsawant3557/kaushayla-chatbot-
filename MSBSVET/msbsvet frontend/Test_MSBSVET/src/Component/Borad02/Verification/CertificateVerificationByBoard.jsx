import React, { useState, useEffect, useMemo } from 'react';

import DropdownComponent from '../../formcomponent/DropdownComponent';
import Swal from 'sweetalert2';

import { GenerateCertificate, GetVerificationCertificateRequests, UpdateCertificateStatus } from '../../../Endpoints_All/Examination/VerificationCertificate';
import agent from '../../../lib/api/agent';

const CertificateVerificationByBoard = () => {
    // State management
    const [searchForm, setSearchForm] = useState({
        status: 'Pending'
    });
    const [certificateData, setCertificateData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [updatingStatus, setUpdatingStatus] = useState({});
    const [selectedDates, setSelectedDates] = useState({});
    const [downloadingCerts, setDownloadingCerts] = useState({});

    // Status options for dropdown
    const statusOptions = [
        { value: 'Pending', label: 'Pending' },
        { value: 'Issued', label: 'Issued' }
    ];

    const LoadingSpinner = ({ size = 'medium' }) => {
        const sizeClasses = {
            small: 'h-4 w-4',
            medium: 'h-8 w-8',
            large: 'h-12 w-12'
        };
        return (
            <div className="flex items-center justify-center">
                <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]}`}></div>
            </div>
        );
    };

    // Error Message Component
    const ErrorMessage = ({ message, onRetry }) => (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-center">
            <p className="text-red-700 mb-2">{message}</p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="text-red-600 underline hover:text-red-800 text-sm"
                >Try Again</button>
            )}
        </div>
    );

    // MOST RELIABLE APPROACH - Create local date
    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        try {
            // Parse the date string and create a local date
            const utcDate = new Date(dateString);
            const localDate = new Date(utcDate.getTime() - (utcDate.getTimezoneOffset() * 60000));

            const year = localDate.getFullYear();
            const month = String(localDate.getMonth() + 1).padStart(2, '0');
            const day = String(localDate.getDate()).padStart(2, '0');

            return `${year}-${month}-${day}`;
        } catch {
            return '';
        }
    };

    const formatDateForDisplay = (dateString) => {
        if (!dateString) return '-';
        try {
            // Parse the date string and create a local date
            const utcDate = new Date(dateString);
            const localDate = new Date(utcDate.getTime() - (utcDate.getTimezoneOffset() * 60000));

            const day = String(localDate.getDate()).padStart(2, '0');
            const month = String(localDate.getMonth() + 1).padStart(2, '0');
            const year = localDate.getFullYear();

            return `${day}/${month}/${year}`;
        } catch {
            return '-';
        }
    };


    // Convert date to ISO string for API - UPDATED
    const formatDateForAPI = (dateString) => {
        if (!dateString) return null;
        try {
            // Create a date at local midnight to avoid timezone conversion
            const [year, month, day] = dateString.split('-');

            // Create date in local timezone at noon to avoid any DST issues
            const localDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 12, 0, 0);

            // Convert to ISO string which will be sent to API
            return localDate.toISOString();
        } catch {
            return null;
        }
    };

    // Add this handler function before the return statement
    const handleSaveAndClose = () => {
        Swal.fire({
            icon: 'success',
            title: 'Information Saved Successfully',
            text: 'All changes have been saved successfully.',
            confirmButtonColor: '#28a745',
            confirmButtonText: 'OK'
        }).then((result) => {
            // Optional: Add any additional logic after user clicks OK
            if (result.isConfirmed) {
                // You can add navigation logic here if needed
                // For example: navigate to another page or close modal
            }
        });
    };



    // Extract last 6 digits of ProfileID for candidateID (for certificate download)
    const getCandidateID = (profileID) => {
        if (!profileID) return null;
        const profileStr = profileID.toString();

        // Remove all non-numeric characters and get last 6 digits
        const numericOnly = profileStr.replace(/\D/g, '');
        const last6Digits = numericOnly.slice(-6);
        return parseInt(last6Digits);
    };

    // API functions
    const getVerificationRequests = async (status = null) => {
        try {
            const response = await agent.get(`${GetVerificationCertificateRequests}${status ? `?status=${status}` : ''}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    };

    // Updated API call to match Swagger specification [memory:3]
    const updateCertificateStatus = async (profileID, status, updatedBy, printedOn = null) => {
        try {
            // Validate inputs
            if (!profileID || !status || !updatedBy) {
                throw new Error('Missing required parameters');
            }

            // API expects camelCase parameters as shown in Swagger
            const requestBody = {
                profileID: profileID.toString(), // Send full alphanumeric ProfileID as string
                status: status,
                updatedBy: updatedBy.toString(),
                printedOn: printedOn ? formatDateForAPI(printedOn) : null
            };


            const response = await agent.put(UpdateCertificateStatus, requestBody);
            return response.data;
        } catch (error) {
            if (error.response) {
            }
            throw error;
        }
    };

    // Certificate download API
    const downloadCertificate = async (candidateID) => {
        try {
            const response = await agent.post(`${GenerateCertificate}?candidateID=${candidateID}`, {}, {
                responseType: 'blob',
                timeout: 60000
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Certificate_${candidateID}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            return { success: true };
        } catch (error) {
            throw error;
        }
    };

    // Handle certificate download with SweetAlert
    const handleCertificateDownload = async (profileID, requestNo) => {
        const candidateID = getCandidateID(profileID);
        if (!candidateID) {
            Swal.fire({
                icon: 'error',
                title: 'Invalid Profile ID',
                text: 'Unable to extract candidate ID from Profile ID',
                confirmButtonColor: '#dc3545'
            });
            return;
        }

        setDownloadingCerts(prev => ({ ...prev, [profileID]: true }));

        try {
            await downloadCertificate(candidateID);
            Swal.fire({
                icon: 'success',
                title: 'Download Successful',
                text: `Certificate downloaded for candidate ID: ${candidateID}`,
                confirmButtonColor: '#28a745',
                timer: 3000,
                timerProgressBar: true
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Download Failed',
                text: `Failed to download certificate: ${error.message}`,
                confirmButtonColor: '#dc3545'
            });
        } finally {
            setDownloadingCerts(prev => ({ ...prev, [profileID]: false }));
        }
    };

    // Load certificates data and set default dates
    const loadCertificates = async (status) => {
        setLoading(true);
        setError('');
        try {
            const result = await getVerificationRequests(status);

            if (result.Status === 'Success') {
                let data = [];
                if (result.Data && result.Data.Table && Array.isArray(result.Data.Table)) {
                    data = result.Data.Table;
                } else if (result.data && result.data.Tables && result.data.Tables[0] && result.data.Tables[0].Rows) {
                    data = result.data.Tables[0].Rows;
                } else if (result.Data && Array.isArray(result.Data)) {
                    data = result.Data;
                } else if (Array.isArray(result)) {
                    data = result;
                }

                setCertificateData(data);

                // Set default dates from backend data
                const defaultDates = {};
                data.forEach(cert => {
                    if (cert.PrintedOn) {
                        defaultDates[cert.ProfileID] = formatDateForInput(cert.PrintedOn);
                    }
                });
                setSelectedDates(defaultDates);
            } else {
                setError(result.Message || 'Failed to load certificates');
            }
        } catch (err) {
            setError('Failed to load certificate data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Load data when status changes
    useEffect(() => {
        loadCertificates(searchForm.status);
    }, [searchForm.status]);

    // Handle status change in dropdown
    const handleStatusChange = (status) => {
        setSearchForm(prev => ({ ...prev, status }));
        setCurrentPage(1);
    };

    // Handle individual certificate status update with SweetAlert [memory:2]
    const handleStatusUpdateInTable = async (profileID, newStatus) => {
        setUpdatingStatus(prev => ({ ...prev, [profileID]: true }));
        setError('');

        try {
            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
            const printedOnDate = newStatus === 'Issued' ?
                (selectedDates[profileID] || new Date().toISOString().split('T')[0]) : null;


            const result = await updateCertificateStatus(
                profileID, // Send full alphanumeric ProfileID
                newStatus,
                currentUser.loginId || currentUser.userName || 'System',
                printedOnDate
            );

            if (result.Status === 'Success' || result.StatusCode === 200) {
                await loadCertificates(searchForm.status);

                // Show success alert
                Swal.fire({
                    icon: 'success',
                    title: 'Status Updated',
                    text: `Certificate status updated to ${newStatus}`,
                    confirmButtonColor: '#28a745',
                    timer: 2000,
                    timerProgressBar: true
                });

            } else {
                throw new Error(result.Message || 'Failed to update certificate status');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.Message ||
                error.response?.data?.message ||
                error.message ||
                'Failed to update certificate status';

            // Show error alert
            Swal.fire({
                icon: 'error',
                title: 'Update Failed',
                text: errorMessage,
                confirmButtonColor: '#dc3545'
            });

            setError(errorMessage);
        } finally {
            setUpdatingStatus(prev => ({ ...prev, [profileID]: false }));
        }
    };

    // Handle date change with SweetAlert
    const handleDateChange = async (profileID, selectedDate) => {
        const cert = certificateData.find(c => c.ProfileID == profileID);

        // Don't allow date change if status is Pending
        if (cert && cert.Status === 'Pending') {
            Swal.fire({
                icon: 'warning',
                title: 'Cannot Update Date',
                text: 'Date can only be updated when status is "Issued"',
                confirmButtonColor: '#ffc107'
            });
            return;
        }

        setSelectedDates(prev => ({ ...prev, [profileID]: selectedDate }));

        // If status is already 'Issued', update the PrintedOn date immediately
        if (cert && cert.Status === 'Issued') {
            setUpdatingStatus(prev => ({ ...prev, [profileID]: true }));
            try {
                const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                await updateCertificateStatus(
                    profileID, // Send full alphanumeric ProfileID
                    'Issued',
                    currentUser.loginId || currentUser.userName || 'System',
                    selectedDate
                );
                await loadCertificates(searchForm.status);
                // Add this temporarily to debug

                // Show success alert
                Swal.fire({
                    icon: 'success',
                    title: 'Date Updated',
                    text: 'Printed date updated successfully',
                    confirmButtonColor: '#28a745',
                    timer: 2000,
                    timerProgressBar: true
                });
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Update Failed',
                    text: 'Failed to update printed date',
                    confirmButtonColor: '#dc3545'
                });
            } finally {
                setUpdatingStatus(prev => ({ ...prev, [profileID]: false }));
            }
        }
    };

    // Handle search and clear
    const handleSearch = () => {
        loadCertificates(searchForm.status);
    };

    const handleClear = () => {
        setSearchForm({ status: 'Pending' });
        setSearchTerm('');
        setCurrentPage(1);
    };

    // Filter data based on search term
    const filteredData = useMemo(() => {
        if (!Array.isArray(certificateData)) return [];
        return certificateData.filter(cert =>
            Object.values(cert || {}).some(value =>
                value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [certificateData, searchTerm]);

    // Pagination calculations
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentData = filteredData.slice(startIndex, endIndex);

    // Safe data access helper
    const getSafeValue = (obj, key, defaultValue = '-') => {
        return obj && obj[key] !== undefined && obj[key] !== null ? obj[key] : defaultValue;
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="bg-white rounded-lg shadow-md p-6">
                {/* Header */}
                <div className="bg-gray-600 text-white px-4 py-3 rounded-t-lg -mx-6 -mt-6 mb-6">
                    <h1 className="text-lg font-medium">≡ Certificate Verification by Board</h1>
                </div>

                <div className="flex justify-center">
                    {/* Search Form */}
                    <div className="bg-gray-50 p-4 rounded-lg mb-6 w-full max-w-md shadow-sm">
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <DropdownComponent
                                    label="Status"
                                    options={statusOptions}
                                    value={searchForm.status}
                                    onChange={handleStatusChange}
                                />
                            </div>
                        </div>
                    </div>
                </div>


                {/* Error Display */}
                {error && (
                    <div className="mb-4">
                        <ErrorMessage message={error} onRetry={handleSearch} />
                    </div>
                )}

                {/* Show table only if we have data or are not loading */}
                {(certificateData.length > 0 || !loading) && (
                    <>
                        {/* Table Controls */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-700">Show</span>
                                <select
                                    value={itemsPerPage}
                                    onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                                >
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                                <span className="text-sm text-gray-700">entries</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-700">Search:</span>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="px-3 py-1 border border-gray-300 rounded text-sm w-48"
                                    placeholder="Search in table..."
                                />
                            </div>
                        </div>

                        {/* Data Table */}
                        <div className="overflow-x-auto border border-gray-300 rounded-lg">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-blue-900 text-white">
                                        <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold">S.N</th>
                                        <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold">Name</th>
                                        <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold">Profile ID</th>
                                        <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold">Certificate Verification No.</th>
                                        <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold">Date</th>
                                        <th className="border border-gray-300 px-4 py-3 text-center text-sm font-semibold">Status</th>
                                        <th className="border border-gray-300 px-4 py-3 text-center text-sm font-semibold">Printed on</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="7" className="text-center py-12">
                                                <LoadingSpinner size="large" />
                                                <p className="mt-2 text-gray-600">Loading certificate data...</p>
                                            </td>
                                        </tr>
                                    ) : currentData.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="text-center py-12 text-gray-500">
                                                <div className="flex flex-col items-center">
                                                    <p className="text-lg font-medium">No data available</p>
                                                    <p className="text-sm mt-1">Try adjusting your search criteria</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        currentData.map((cert, index) => (
                                            <tr key={getSafeValue(cert, 'ProfileID', index)} className="hover:bg-gray-50 transition-colors">
                                                <td className="border border-gray-300 px-4 py-3 text-sm">{startIndex + index + 1}</td>
                                                <td className="border border-gray-300 px-4 py-3 text-sm font-medium">
                                                    {getSafeValue(cert, 'Name')}
                                                </td>
                                                <td className="border border-gray-300 px-4 py-3 text-sm">
                                                    {getSafeValue(cert, 'ProfileID')}
                                                </td>
                                                <td className="border border-gray-300 px-4 py-3 text-sm">
                                                    <button
                                                        onClick={() => handleCertificateDownload(getSafeValue(cert, 'ProfileID'), getSafeValue(cert, 'RequestNo'))}
                                                        disabled={downloadingCerts[getSafeValue(cert, 'ProfileID')] || updatingStatus[getSafeValue(cert, 'ProfileID')]}
                                                        className={`text-blue-600 underline hover:text-blue-800 transition-colors ${downloadingCerts[getSafeValue(cert, 'ProfileID')] || updatingStatus[getSafeValue(cert, 'ProfileID')]
                                                            ? 'opacity-50 cursor-not-allowed'
                                                            : 'cursor-pointer'
                                                            }`}
                                                    >
                                                        {downloadingCerts[getSafeValue(cert, 'ProfileID')] ? (
                                                            <div className="flex items-center gap-1">
                                                                <LoadingSpinner size="small" />
                                                                <span>Downloading...</span>
                                                            </div>
                                                        ) : (
                                                            getSafeValue(cert, 'RequestNo')
                                                        )}
                                                    </button>
                                                </td>
                                                <td className="border border-gray-300 px-4 py-3 text-sm">
                                                    {formatDateForDisplay(getSafeValue(cert, 'CreatedDate'))}
                                                </td>
                                                <td className="border border-gray-300 px-4 py-3 text-center">
                                                    <select
                                                        value={getSafeValue(cert, 'Status', 'Pending')}
                                                        onChange={(e) => handleStatusUpdateInTable(getSafeValue(cert, 'ProfileID'), e.target.value)}
                                                        className="appearance-none text-xs px-2 py-1 border border-gray-300 rounded w-full"
                                                        disabled={updatingStatus[getSafeValue(cert, 'ProfileID')] || downloadingCerts[getSafeValue(cert, 'ProfileID')]}
                                                    >
                                                        <option value="Pending">Pending</option>
                                                        <option value="Issued">Issued</option>
                                                    </select>
                                                    {updatingStatus[getSafeValue(cert, 'ProfileID')] && (
                                                        <div className="mt-1">
                                                            <LoadingSpinner size="small" />
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="border border-gray-300 px-4 py-3 text-center">
                                                    <div className="flex flex-col gap-2">
                                                        {/*<div className="text-xs text-gray-600">*/}
                                                        {/*    {formatDateForDisplay(getSafeValue(cert, 'PrintedOn'))}*/}
                                                        {/*</div>*/}

                                                        <input
                                                            type="date"
                                                            value={selectedDates[getSafeValue(cert, 'ProfileID')] || formatDateForInput(getSafeValue(cert, 'PrintedOn'))}
                                                            onChange={(e) => handleDateChange(getSafeValue(cert, 'ProfileID'), e.target.value)}
                                                            className={`text-xs px-2 py-1 border border-gray-300 rounded w-full ${getSafeValue(cert, 'Status') === 'Pending' ? 'bg-gray-100 cursor-not-allowed' : ''
                                                                }`}
                                                            disabled={
                                                                updatingStatus[getSafeValue(cert, 'ProfileID')] ||
                                                                downloadingCerts[getSafeValue(cert, 'ProfileID')] ||
                                                                getSafeValue(cert, 'Status') === 'Pending'
                                                            }
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>


                        <div className="flex justify-center mt-6">
                            <button
                                onClick={handleSaveAndClose}
                                className="bg-green-600 text-white px-8 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                            >
                                Save and Close
                            </button>
                        </div>


                        {/* Pagination */}
                        {filteredData.length > 0 && totalPages > 1 && (
                            <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
                                <div className="text-sm text-gray-700">
                                    Showing {startIndex + 1} to {Math.min(endIndex, filteredData.length)} of {filteredData.length} entries
                                    {filteredData.length !== certificateData.length && (
                                        <span className="text-gray-500"> (filtered from {certificateData.length} total entries)</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="px-3 py-2 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                                    >
                                        Previous
                                    </button>
                                    <div className="flex gap-1">
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            let pageNum;
                                            if (totalPages <= 5) pageNum = i + 1;
                                            else if (currentPage <= 3) pageNum = i + 1;
                                            else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                                            else pageNum = currentPage - 2 + i;
                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => setCurrentPage(pageNum)}
                                                    className={`px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors ${currentPage === pageNum ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700' : ''}`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-2 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default CertificateVerificationByBoard;
