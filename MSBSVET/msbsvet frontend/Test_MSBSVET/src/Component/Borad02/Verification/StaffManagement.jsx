import React, { useState, useEffect } from 'react';
import { CheckCircle, Eye, Download, FileSpreadsheet } from 'lucide-react';

import { GetMasterRegion, GetMasterDistrict, GetMasterTaluka } from '../../../Endpoints_All/Base/location'
import { SearchStaffManagement } from '../../../Endpoints_All/Base/masterData'
// Dropdown Component
const DropdownComponent = ({
    label,
    options = [],
    value,
    onChange,
    loading = false,
    disabled = false,
    required = false
}) => (
    <div className="flex flex-col">
        {label && (
            <label className="text-sm font-medium text-gray-700 mb-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
        )}
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled || loading}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
            <option value="">Select {label}</option>
            {options.map((option) =>
                <option key={option.value} value={option.value}>{option.label}</option>
            )}
        </select>
        {loading && <div className="text-xs text-gray-500 mt-1">Loading {label?.toLowerCase()}...</div>}
    </div>
);

// Loading Spinner Component
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

// Main Staff Management Component
const StaffManagement = () => {
    // Master data states
    const [regions, setRegions] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [talukas, setTalukas] = useState([]);

    // Staff data state
    const [staffData, setStaffData] = useState([]);

    // Loading states
    const [loading, setLoading] = useState(false);
    const [loadingRegions, setLoadingRegions] = useState(false);
    const [loadingDistricts, setLoadingDistricts] = useState(false);
    const [loadingTalukas, setLoadingTalukas] = useState(false);

    // Error states
    const [error, setError] = useState(null);
    const [regionsError, setRegionsError] = useState(null);

    // Search form state
    const [searchForm, setSearchForm] = useState({
        regionID: '',
        districtID: '',
        talukaID: '',
        verificationStatus: '',
        profileID: ''
    });

    // Pagination and filter state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');

    // --- Fetch regions on mount ---
    useEffect(() => {
        loadRegions();
    }, []);

    // --- API call functions ---
    const loadRegions = async () => {
        setLoadingRegions(true);
        setRegionsError(null);
        try {
            const response = await fetch(GetMasterRegion);
            if (!response.ok) throw new Error(`Failed to load regions: ${response.status} ${response.statusText}`);
            const data = await response.json();
            if (Array.isArray(data)) {
                const regionOptions = data.map((region) => ({
                    value: region.id || region.regionID,
                    label: region.name || region.regionName
                }));
                setRegions(regionOptions);
            } else throw new Error('Invalid data format for regions');
        } catch (error) {
            setRegionsError(error.message);
            setRegions([]);
        } finally {
            setLoadingRegions(false);
        }
    };

    const loadDistricts = async (regionID) => {
        if (!regionID) {
            setDistricts([]);
            return;
        }
        setLoadingDistricts(true);
        try {
            const response = await fetch(`${GetMasterDistrict}?regionID=${regionID}`);
            if (!response.ok) throw new Error(`Failed to load districts: ${response.status} ${response.statusText}`);
            const data = await response.json();
            if (Array.isArray(data)) {
                const districtOptions = data.map((d) => ({
                    value: d.id || d.districtID,
                    label: d.name || d.districtName
                }));
                setDistricts(districtOptions);
            } else setDistricts([]);
        } catch {
            setDistricts([]);
        } finally {
            setLoadingDistricts(false);
        }
    };

    const loadTalukas = async (districtID) => {
        if (!districtID) {
            setTalukas([]);
            return;
        }
        setLoadingTalukas(true);
        try {
            const response = await fetch(`${GetMasterTaluka}?districtID=${districtID}`);
            if (!response.ok) throw new Error(`Failed to load talukas: ${response.status} ${response.statusText}`);
            const data = await response.json();
            if (Array.isArray(data)) {
                const talukaOptions = data.map((t) => ({
                    value: t.id || t.talukaID,
                    label: t.name || t.talukaName
                }));
                setTalukas(talukaOptions);
            } else setTalukas([]);
        } catch {
            setTalukas([]);
        } finally {
            setLoadingTalukas(false);
        }
    };

    // --- Search staff data (no auto load, only on search) ---
    const handleSearch = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({
                DistrictID: searchForm.districtID || '-1',
                TalukaID: searchForm.talukaID || '-1',
                RegionID: searchForm.regionID || '-1',
                FormStatus: searchForm.verificationStatus || '',
                ProfileID: searchForm.profileID || ''
            });
            const response = await fetch(`${SearchStaffManagement}?${params}`);
            if (!response.ok) throw new Error(`Search failed: ${response.status} ${response.statusText}`);
            const result = await response.json();
            if (result && Array.isArray(result.Data)) {
                setStaffData(result.Data);
                setCurrentPage(1);
            } else setStaffData([]);
        } catch (err) {
            setError(err.message);
            setStaffData([]);
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setSearchForm({
            regionID: '',
            districtID: '',
            talukaID: '',
            verificationStatus: '',
            profileID: ''
        });
        setDistricts([]);
        setTalukas([]);
        setStaffData([]); // Clear table
        setCurrentPage(1);
    };

    // --- Dropdown change handlers ---
    const handleRegionChange = (value) => {
        setSearchForm((prev) => ({
            ...prev,
            regionID: value,
            districtID: '',
            talukaID: ''
        }));
        if (value) loadDistricts(value); else setDistricts([]);
        setTalukas([]);
    };

    const handleDistrictChange = (value) => {
        setSearchForm((prev) => ({
            ...prev,
            districtID: value,
            talukaID: ''
        }));
        if (value) loadTalukas(value); else setTalukas([]);
    };

    const handleTalukaChange = (value) => {
        setSearchForm((prev) => ({
            ...prev,
            talukaID: value
        }));
    };

    // --- Export to Excel ---
    const filteredData = staffData.filter((staff) => {
        const searchLower = searchTerm.toLowerCase();
        return (
            (staff.StaffName || '').toLowerCase().includes(searchLower) ||
            (staff.ApplicationID || '').toLowerCase().includes(searchLower) ||
            (staff.Region || '').toLowerCase().includes(searchLower) ||
            (staff.District || '').toLowerCase().includes(searchLower) ||
            (staff.Taluka || '').toLowerCase().includes(searchLower)
        );
    });

    const handleExportExcel = () => {
        const csvContent = [
            ['Sr. No.', 'Region', 'District', 'Taluka', 'Profile ID', 'Name', 'Verification Status'],
            ...filteredData.map((staff, index) => [
                index + 1,
                staff.Region || '',
                staff.District || '',
                staff.Taluka || '',
                staff.ApplicationID || '',
                staff.StaffName || '',
                staff.FormStatus || staff.VerifyStatus || ''
            ])
        ].map((row) => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'staff_management_data.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    };

    // --- Export PDF: print current page ---
    const handleExportPDF = () => {
        window.print();
    };

    // --- View Profile handler ---
    const handleViewProfile = (staff) => {
        alert(`Profile Details:
Name: ${staff.StaffName}
Profile ID: ${staff.ApplicationID}
Region: ${staff.Region}
District: ${staff.District}
Taluka: ${staff.Taluka}
Status: ${staff.FormStatus || staff.VerifyStatus || 'Unknown'}`);
    };

    // --- Verification Status Display ---
    const getVerificationStatusDisplay = (status) => {
        switch (status?.toUpperCase()) {
            case 'V':
            case 'VERIFIED':
            case 'S':
            case 'Send for Verification':
                return <CheckCircle className="text-green-600" size={20} title="Verified" />;
            case 'R':
            case 'REJECTED':
                return <span className="text-red-600 text-sm font-medium">Rejected</span>;
            case 'P':
            case 'PENDING':
                return <span className="text-yellow-600 text-sm font-medium">Pending</span>;
            case 'N':
            case 'NOT VERIFIED':
                return <span className="text-gray-600 text-sm font-medium">Not Verified</span>;
            default:
                return <span className="text-gray-600 text-sm font-medium">Unknown</span>;
        }
    };

    // --- Pagination logic ---
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentData = filteredData.slice(startIndex, endIndex);

    // --- Verification Status dropdown options ---
    const verificationStatusOptions = [
        { value: 'V', label: 'Verified' },
        { value: 'N', label: 'Not Verified' },
        { value: 'R', label: 'Rejected' },
        { value: 'P', label: 'Pending' },
        { value: 'S', label: 'Send for Verification' },
        { value: '', label: 'All' }
    ];

    // --- Main render ---
    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="bg-white rounded-lg shadow-md p-6">
                {/* Header */}
                <div className="bg-gray-600 text-white px-4 py-3 rounded-t-lg -mx-6 -mt-6 mb-6">
                    <h1 className="text-lg font-medium">≡ Staff Management</h1>
                </div>
                {/* Search Form */}
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <h2 className="text-md font-semibold text-gray-700 mb-4">Search Filters</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
                        <div>
                            <DropdownComponent
                                label="Region"
                                options={regions}
                                value={searchForm.regionID}
                                loading={loadingRegions}
                                onChange={handleRegionChange}
                            />
                            {regionsError && (
                                <div className="text-red-600 text-xs mt-1">Error loading regions</div>
                            )}
                        </div>
                        <div>
                            <DropdownComponent
                                label="District"
                                options={districts}
                                value={searchForm.districtID}
                                loading={loadingDistricts}
                                onChange={handleDistrictChange}
                                disabled={!searchForm.regionID}
                            />
                        </div>
                        <div>
                            <DropdownComponent
                                label="Taluka"
                                options={talukas}
                                value={searchForm.talukaID}
                                loading={loadingTalukas}
                                onChange={handleTalukaChange}
                                disabled={!searchForm.districtID}
                            />
                        </div>
                        <div>
                            <DropdownComponent
                                label="Verification Status"
                                options={verificationStatusOptions}
                                value={searchForm.verificationStatus}
                                onChange={(value) => setSearchForm(prev => ({ ...prev, verificationStatus: value }))}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Profile ID</label>
                            <input
                                type="text"
                                value={searchForm.profileID}
                                onChange={(e) => setSearchForm(prev => ({ ...prev, profileID: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter Profile ID"
                            />
                        </div>
                    </div>
                    <div className="flex justify-center gap-4">
                        <button
                            onClick={handleSearch}
                            className="bg-green-600 text-white px-8 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            disabled={loading}
                        >
                            {loading && <LoadingSpinner size="small" />}
                            {loading ? 'Searching...' : 'Search'}
                        </button>
                        <button
                            onClick={handleClear}
                            className="bg-gray-500 text-white px-8 py-2 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                            disabled={loading}
                        >
                            Clear
                        </button>
                    </div>
                </div>
                {/* Error Display */}
                {error && (
                    <div className="mb-4">
                        <ErrorMessage message={error} onRetry={handleSearch} />
                    </div>
                )}
                {/* Export Options */}
                <div className="flex gap-2 mb-4">
                    <button
                        onClick={handleExportExcel}
                        className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 flex items-center gap-2"
                        disabled={filteredData.length === 0}
                    >
                        <FileSpreadsheet size={16} />
                        Excel
                    </button>
                    <button
                        onClick={handleExportPDF}
                        className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 flex items-center gap-2"
                        disabled={filteredData.length === 0}
                    >
                        <Download size={16} />
                        PDF
                    </button>
                </div>
                {/* Table and Pagination */}
                {staffData.length > 0 && (
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
                                        <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold">Sr. No.</th>
                                        <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold">Region</th>
                                        <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold">District</th>
                                        <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold">Taluka</th>
                                        <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold">Profile ID</th>
                                        <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold">Name</th>
                                        <th className="border border-gray-300 px-4 py-3 text-center text-sm font-semibold">Verification Status</th>
                                        <th className="border border-gray-300 px-4 py-3 text-center text-sm font-semibold">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="8" className="text-center py-12">
                                                <LoadingSpinner size="large" />
                                                <p className="mt-2 text-gray-600">Loading staff data...</p>
                                            </td>
                                        </tr>
                                    ) : currentData.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" className="text-center py-12 text-gray-500">
                                                <div className="flex flex-col items-center">
                                                    <p className="text-lg font-medium">No data available</p>
                                                    <p className="text-sm mt-1">Try adjusting your search criteria</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        currentData.map((staff, index) => (
                                            <tr key={staff.StaffID || index} className="hover:bg-gray-50 transition-colors">
                                                <td className="border border-gray-300 px-4 py-3 text-sm">{startIndex + index + 1}</td>
                                                <td className="border border-gray-300 px-4 py-3 text-sm">{staff.Region || '-'}</td>
                                                <td className="border border-gray-300 px-4 py-3 text-sm">{staff.District || '-'}</td>
                                                <td className="border border-gray-300 px-4 py-3 text-sm">{staff.Taluka || '-'}</td>
                                                <td className="border border-gray-300 px-4 py-3 text-sm">
                                                    <span className="text-blue-600 underline cursor-pointer hover:text-blue-800">
                                                        {staff.ApplicationID || '-'}
                                                    </span>
                                                </td>
                                                <td className="border border-gray-300 px-4 py-3 text-sm font-medium">
                                                    {staff.StaffName || '-'}
                                                </td>
                                                <td className="border border-gray-300 px-4 py-3 text-center">
                                                    <div className="flex justify-center">
                                                        {getVerificationStatusDisplay(staff.FormStatus || staff.VerifyStatus)}
                                                    </div>
                                                </td>
                                                <td className="border border-gray-300 px-4 py-3 text-center">
                                                    <button
                                                        onClick={() => handleViewProfile(staff)}
                                                        className="text-blue-600 underline hover:text-blue-800 text-sm flex items-center gap-1 mx-auto transition-colors"
                                                    >
                                                        <Eye size={14} />
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination */}
                        {filteredData.length > 0 && (
                            <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
                                <div className="text-sm text-gray-700">
                                    Showing {startIndex + 1} to {Math.min(endIndex, filteredData.length)} of {filteredData.length} entries
                                    {filteredData.length !== staffData.length && (
                                        <span className="text-gray-500"> (filtered from {staffData.length} total entries)</span>
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
                        {/* Summary Information */}
                        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                            <h3 className="text-sm font-semibold text-blue-800 mb-2">Summary</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                    <span className="text-blue-600 font-medium">Total Records:</span>
                                    <span className="ml-1 text-blue-800">{staffData.length}</span>
                                </div>
                                <div>
                                    <span className="text-blue-600 font-medium">Filtered Records:</span>
                                    <span className="ml-1 text-blue-800">{filteredData.length}</span>
                                </div>
                                <div>
                                    <span className="text-blue-600 font-medium">Current Page:</span>
                                    <span className="ml-1 text-blue-800">{currentPage} of {totalPages}</span>
                                </div>
                                <div>
                                    <span className="text-blue-600 font-medium">Items Per Page:</span>
                                    <span className="ml-1 text-blue-800">{itemsPerPage}</span>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default StaffManagement;
