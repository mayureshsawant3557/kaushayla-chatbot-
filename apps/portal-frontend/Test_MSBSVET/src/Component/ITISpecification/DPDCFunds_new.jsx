import React, { useContext, useState, useEffect } from "react";
import Swal from "sweetalert2";
import { ThemeContext } from "../Context/ThemeContext";
import { useLoading } from "../../Hooks/useLoading";
import OTPService from '../formcomponent/OTPService';
import {
    GetDPDCDetailsByCollegeRegNo,
    SaveDPDCFund,
    GetInstituteIDByInstituteCode,
} from "../../Endpoints_All/Base/Institute";
import { GetInstituteAndManagementMobile } from "../../Endpoints_All/ITISpecification/itiSpecification";
import FilteredTableComponent from '../formcomponent/FilteredTableComponent';
import agent from "../../lib/api/agent";
import { getIp } from "../../Endpoints_All/Utils/fileUpload";
import { useAuth } from "../../Hooks/AuthContext";



const DPDCFunds = () => {
    const { color } = useContext(ThemeContext);
    const { startLoading, stopLoading, isLoading } = useLoading();
    const [fundData, setFundData] = useState([]);
    const [instituteInfo, setInstituteInfo] = useState(null);
    const [error, setError] = useState(null);
    const [editableData, setEditableData] = useState({});
    const [userMobile, setUserMobile] = useState("");
    const [hasChanges, setHasChanges] = useState(false);
    const [f_year, setFYear] = useState(null);
    const [editableRows, setEditableRows] = useState({});
    const [instituteID, setInstituteID] = useState(null);

    const fund = {
        name: "DPDC Fund",
        logo: "https://cdn-icons-png.flaticon.com/512/2903/2903077.png",
    };

    // Initialize OTP Service hook
    const otpService = OTPService({
        mobileNo: userMobile,
        purpose: 'SubmitDPDCFund',
        isVerifyRequired: true,
        messege: 'OTP verification required by Head of Institute/ Principal/Director',
        isDuplicateCheck: false,
        onSuccess: async (data) => {
            await submitAllFunds();
        },
        onError: (error) => {
            Swal.fire({
                title: "Verification Failed",
                text: error.message || "OTP verification failed. Please try again.",
                icon: "error"
            });
        },
        onCancel: () => {
        }
    });

    const userInfo = useAuth();
    const collegeRegistrationNo = userInfo?.UserLoginID;
    const userID = userInfo?.UserID;


    useEffect(() => {
        if (collegeRegistrationNo && userID) {
            initializeComponent();
        } else {
            stopLoading();
            setError("College Registration Number or User ID not found. Please login again.");
        }
    }, []);

    // Initialize component - fetch institute ID first, then other data
    const initializeComponent = async () => {
        try {
            startLoading();

            // First fetch institute ID
            const instId = await fetchInstituteID();

            if (instId) {
                // Then fetch mobile number
                await fetchUserMobileNo(instId);

                // Finally fetch DPDC details
                await fetchDPDCDetails();
            } else {
                setError("Failed to retrieve Institute ID.");
            }
        } catch (err) {
            setError("Failed to initialize component.");
        } finally {
            stopLoading();
        }
    };

    // Fetch Institute ID using UserLoginID
    const fetchInstituteID = async () => {
        try {

            const response = await agent.get(GetInstituteIDByInstituteCode, {
                params: {
                    InstituteCode: collegeRegistrationNo
                },
                headers: {
                    'accept': '*/*',
                    'Content-Type': 'application/json',
                }
            });


            if (response.data && response.data.Status === "Success" && response.data.Data) {
                const instId = response.data.Data;
                setInstituteID(instId);
                return instId;
            } else {
                return null;
            }
        } catch (err) {
            return null;
        }
    };

    // Fetch user mobile number using institute ID
    const fetchUserMobileNo = async (instId) => {
        try {
            const idToUse = instId || instituteID;

            if (!idToUse) {
                return;
            }


            // Construct URL with path parameters instead of query parameters
            const url = `${GetInstituteAndManagementMobile}/${idToUse}/2`;

            const response = await agent.get(url, {
                headers: {
                    'accept': '*/*',
                    'Content-Type': 'application/json',
                }
            });


            if (response.data && response.data.Status === "Success" && response.data.Data?.length > 0) {
                const mobileNo = response.data.Data[0].MobileNo || "";
                setUserMobile(mobileNo);
            } else {
                setUserMobile("");
            }
        } catch (err) {
            setUserMobile("");
        }
    };

    const fetchDPDCDetails = async () => {
        try {
            setError(null);

            const response = await agent.get(GetDPDCDetailsByCollegeRegNo, {
                params: {
                    CollegeRegistrationNo: collegeRegistrationNo
                },
                headers: {
                    'accept': '*/*',
                    'Content-Type': 'application/json',
                }
            });


            if (response.data && response.data.Status === "Success" && response.data.Data) {
                const data = response.data.Data;

                if (data && data.length > 0) {
                    setFYear(data[0].FinancialYear || '');

                    setInstituteInfo({
                        instituteName: data[0].InstituteName,
                        districtName: data[0].DistrictName,
                        collegeRegistrationNo: data[0].CollegeRegistrationNo,
                        collegeID: data[0].CollegeID
                    });

                    setFundData(data);

                    // Initialize editable data and track editable rows
                    const initialEditableData = {};
                    const initialEditableRows = {};

                    data.forEach(item => {
                        initialEditableData[item.FinancialYearID] = {
                            allotted_2203: item.Allotted_2203_Institute || 0,
                            allotted_2230: item.Allotted_2230_Institute || 0,
                        };

                        // Row is NOT editable if either allotment has a value
                        const hasAllotted2203 = item.Allotted_2203_Institute && item.Allotted_2203_Institute > 0;
                        const hasAllotted2230 = item.Allotted_2230_Institute && item.Allotted_2230_Institute > 0;
                        initialEditableRows[item.FinancialYearID] = !(hasAllotted2203 || hasAllotted2230);
                    });

                    setEditableData(initialEditableData);
                    setEditableRows(initialEditableRows);
                    setHasChanges(false);
                } else {
                    setError("No DPDC fund details found for this institute.");
                }
            } else {
                setError(response.data?.Message || "Failed to fetch data");
            }
        } catch (err) {
            handleApiError(err);
        }
    };

    const handleApiError = (err) => {
        if (err.response) {
            const errorMessage = err.response.data?.Message ||
                err.response.data?.message ||
                `Server Error: ${err.response.status}`;
            setError(errorMessage);
        } else if (err.request) {
            setError("No response from server. Please check your connection.");
        } else {
            setError(err.message || "An error occurred while fetching data");
        }
    };

    // Handle edit button click
    const handleEditRow = (financialYearID) => {
        setEditableRows(prev => ({
            ...prev,
            [financialYearID]: true
        }));
        setHasChanges(true);
    };

    // Handle input change
    const handleInputChange = (rowIndex, columnKey, value) => {
        const item = fundData[rowIndex];
        if (!item) return;

        // Check if row is editable
        if (!editableRows[item.FinancialYearID]) {
            return;
        }

        const numericValue = parseFloat(value) ;

        setEditableData(prev => ({
            ...prev,
            [item.FinancialYearID]: {
                ...prev[item.FinancialYearID],
                [columnKey]: numericValue
            }
        }));

        setHasChanges(true);
    };

    // Validate all inputs
    const validateAllInputs = () => {
        const errors = [];

        fundData.forEach(item => {
            const editData = editableData[item.FinancialYearID];
            if (!editData || !editableRows[item.FinancialYearID]) return;

            if (editData.allotted_2203 > item.Available_2203_District) {
                errors.push(`FY ${item.FinancialYear}: 2203 allotment (₹${editData.allotted_2203.toLocaleString()}) exceeds available district funds (₹${item.Available_2203_District.toLocaleString()})`);
            }

            if (editData.allotted_2230 > item.Available_2230_District) {
                errors.push(`FY ${item.FinancialYear}: 2230 allotment (₹${editData.allotted_2230.toLocaleString()}) exceeds available district funds (₹${item.Available_2230_District.toLocaleString()})`);
            }

            if (editData.allotted_2203 < 0 || editData.allotted_2230 < 0) {
                errors.push(`FY ${item.FinancialYear}: Allotted amounts cannot be negative`);
            }
        });

        return {
            valid: errors.length === 0,
            errors: errors
        };
    };

    // Get client IP address
    //const getClientIPAddress = async () => {
    //    try {
    //        const response = await agent.get('https://api.ipify.org?format=json');
    //        return response.data.ip;
    //    } catch (error) {
    //        console.error("Error getting IP:", error);
    //        return "Unknown";
    //    }
    //};
    const fetchIP = async () => {
        try {
            const response = await agent.get(getIp, {
                headers: { accept: "*/*" }
            });

            const ip = response?.data?.ip || "0.0.0.0";

            //setIpAddress(ip);

            return ip;
        } catch (error) {
            //setIpAddress("0.0.0.0");
            return error;
        }
    };

    // Save all data after OTP verification
    const submitAllFunds = async () => {
        try {
            startLoading();

            const ipAddress = await fetchIP();
            const savePromises = [];

            for (const item of fundData) {
                const editData = editableData[item.FinancialYearID];
                if (!editData || !editableRows[item.FinancialYearID]) continue;

                const payload = {
                    id: item.InstituteFundID || 0,
                    instituteID: instituteInfo.collegeID,
                    collegeRegistrationNo: collegeRegistrationNo,
                    financialYearID: item.FinancialYearID,
                    financialYear: item.FinancialYear,
                    //allotted_2203_Institute: editData.allotted_2203,
                    //allotted_2230_Institute: editData.allotted_2230,
                    //totalAllottedToInstitute: editData.allotted_2203 + editData.allotted_2230,
                    allotted_2203_Institute: Number(editData.allotted_2203 || 0),
    allotted_2230_Institute: Number(editData.allotted_2230 || 0),
    totalAllottedToInstitute:
        Number(editData.allotted_2203 || 0) +
        Number(editData.allotted_2230 || 0),
                    userLoginID: userID,
                    ipAddress: ipAddress
                };


                savePromises.push(
                    agent.post(SaveDPDCFund, payload, {
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    })
                );
            }

            const responses = await Promise.all(savePromises);

            const allSuccess = responses.every(response =>
                response.data && response.data.Status === "Success"
            );

            if (allSuccess) {
                Swal.fire({
                    title: "Success!",
                    text: "All DPDC Fund data saved successfully.",
                    icon: "success",
                    timer: 2000
                });

                setHasChanges(false);

                // Re-fetch institute ID and then refresh data
                const instId = await fetchInstituteID();
                if (instId) {
                    await fetchUserMobileNo(instId);
                }
                await fetchDPDCDetails();
            } else {
                throw new Error("Some records failed to save");
            }

        } catch (err) {
            Swal.fire({
                title: "Error",
                text: err.response?.data?.Message || err.message || "Failed to save data",
                icon: "error"
            });
        } finally {
            stopLoading();
        }
    };

    // Handle save button click
    const handleSaveAll = async () => {
        // Validate before OTP
        const validation = validateAllInputs();
        if (!validation.valid) {
            Swal.fire({
                title: "Validation Error",
                html: validation.errors.join("<br>"),
                icon: "error"
            });
            return;
        }

        if (!userMobile) {
            Swal.fire({
                title: "Error",
                text: "Mobile number not found. Please Check Institute Management under Institute profile.",
                icon: "error"
            });
            return;
        }

        // Calculate total allocations for editable rows only
        let total2203 = 0;
        let total2230 = 0;

        fundData.forEach(item => {
            const editData = editableData[item.FinancialYearID];
            if (editData && editableRows[item.FinancialYearID]) {
                total2203 += editData.allotted_2203 || 0;
                total2230 += editData.allotted_2230 || 0;
            }
        });

        // Show confirmation with details
        const confirmResult = await Swal.fire({
            title: "Confirm Submission",
            html: `
                <div class="text-left">
                    <p class="mb-3 font-semibold">
                        You are about to submit DPDC Fund allocation for Financial Year: ${f_year || ""}
                    </p>
                    <div class="bg-blue-50 p-3 rounded mb-3">
                        <p class="font-medium">Total 2203 Allotment: <span class="text-blue-600">₹${total2203.toLocaleString()}</span></p>
                        <p class="font-medium">Total 2230 Allotment: <span class="text-blue-600">₹${total2230.toLocaleString()}</span></p>
                        <p class="font-bold text-lg mt-2">Grand Total: <span class="text-green-600">₹${(total2203 + total2230).toLocaleString()}</span></p>
                    </div>
                    <p class="text-sm text-gray-600 bg-yellow-50 p-2 rounded">
                        Once submitted, this information will be sent to the respective Regional Office and DVET. 
                        Please verify all amounts carefully before proceeding.
                    </p>
                    
                </div>
            `,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Proceed to OTP Verification",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#059669",
            cancelButtonColor: "#dc2626",
            width: '600px'
        });

        if (!confirmResult.isConfirmed) {
            return;
        }

        try {
            await otpService.startVerification(userMobile);
        } catch (error) {
            Swal.fire({
                title: "Error",
                text: "Failed to start OTP verification. Please try again.",
                icon: "error"
            });
        }
    };

    // Format currency
    const formatCurrency = (value) => {
        if (value == null || value === "" || isNaN(value)) return "0";
        return Math.trunc(Number(value)).toLocaleString("en-IN");
    };

    // Calculate total for display
    const calculateTotal = (item) => {
        const editData = editableData[item.FinancialYearID];
        if (!editData) return 0;
        return (editData.allotted_2203 || 0) + (editData.allotted_2230 || 0);
    };

    // Check if row should show edit button
    const shouldShowEditButton = (item) => {
        const hasAllotted2203 = item.Allotted_2203_Institute && item.Allotted_2203_Institute > 0;
        const hasAllotted2230 = item.Allotted_2230_Institute && item.Allotted_2230_Institute > 0;
        const isEditable = editableRows[item.FinancialYearID];

        // Show edit button only if row has allotted values AND is not currently editable
        return (hasAllotted2203 || hasAllotted2230) && !isEditable;
    };

    // Custom cell renderer
    const renderCell = (item, column, rowIndex) => {
        const editData = editableData[item.FinancialYearID];
        const isRowEditable = editableRows[item.FinancialYearID];

        switch (column.key) {
            case 'actions':
                return shouldShowEditButton(item) ? (
                    <button
                        type="button"
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        onClick={() => handleEditRow(item.FinancialYearID)}
                        title="Edit"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                ) : null;

            case 'financialYear':
                return item.FinancialYear || 'N/A';

            case 'available_2203':
                return (
                    <div className="text-right">
                        {formatCurrency(item.Available_2203_District)}
                    </div>
                );

            case 'allotted_2203':
                return (
                    <input
                        type="number"
                        min="0"
                        value={editData?.allotted_2203 ?? ''}
                        onChange={(e) => handleInputChange(rowIndex, 'allotted_2203', e.target.value)}
                        onBlur={(e) => {
                            if (e.target.value === '') {
                                handleInputChange(rowIndex, 'allotted_2203', '0');
                            }
                        }}
                        disabled={!isRowEditable}
                        className={`w-full px-2 py-1 border rounded text-left ${isRowEditable
                                ? 'border-gray-300 bg-white'
                                : 'border-gray-200 bg-gray-100 cursor-not-allowed'
                            }`}
                        placeholder="Enter amount"
                    />


                );

            case 'available_2230':
                return (
                    <div className="text-right">
                        {formatCurrency(item.Available_2230_District)}
                    </div>
                );

            case 'allotted_2230':
                return (
                    <input
                        type="number"
                        min="0"
                        value={editData?.allotted_2230 ?? ''}
                        onChange={(e) => handleInputChange(rowIndex, 'allotted_2230', e.target.value)}
                        onBlur={(e) => {
                            if (e.target.value === '') {
                                handleInputChange(rowIndex, 'allotted_2230', '0');
                            }
                        }}
                        disabled={!isRowEditable}
                        className={`w-full px-2 py-1 border rounded text-left ${isRowEditable
                                ? 'border-gray-300 bg-white'
                                : 'border-gray-200 bg-gray-100 cursor-not-allowed'
                            }`}
                        placeholder="Enter amount"
                    />

                );

            case 'totalAvailable':
                return (
                    <div className="text-right font-semibold">
                        {formatCurrency(item.TotalAvailableForDistrict)}
                    </div>
                );

            case 'totalAllotted':
                return (
                    <div className="text-right font-semibold">
                        {formatCurrency(calculateTotal(item))}
                    </div>
                );

            default:
                return item[column.key] || '-';
        }
    };

    // Table columns configuration
    const tableColumns = [
        {
            key: 'actions',
            header: 'Actions',
            headerClassName: 'text-center',
            className: 'text-center',
            sortable: false,
            width: '80px'
        },
        {
            key: 'financialYear',
            header: 'Financial Year',
            headerClassName: 'text-center',
            className: 'text-center font-medium',
            width: '120px',
            searchable: true
        },
        {
            key: 'available_2203',
            header: '2203: Available for District',
            headerClassName: 'text-center text-sm',
            className: 'text-right',
            width: '150px'
        },
        {
            key: 'allotted_2203',
            header: '2203: Allotted to Institute',
            headerClassName: 'text-center text-sm',
            className: 'text-left',
            width: '180px'
        },
        {
            key: 'available_2230',
            header: '2230: Available for District',
            headerClassName: 'text-center text-sm',
            className: 'text-right',
            width: '150px'
        },
        {
            key: 'allotted_2230',
            header: '2230: Allotted to Institute',
            headerClassName: 'text-center text-sm',
            className: 'text-left',
            width: '180px'
        },
        {
            key: 'totalAvailable',
            header: 'Total Available For District',
            headerClassName: 'text-center bg-blue-100 text-sm font-semibold',
            className: 'text-right',
            width: '130px'
        },
        {
            key: 'totalAllotted',
            header: 'Total Allotted to Institute',
            headerClassName: 'text-center bg-green-100 text-sm font-semibold',
            className: 'text-right',
            width: '130px'
        }
    ];

    if (isLoading) {
        return (
            <div className="max-w-full mx-auto p-6 bg-white rounded shadow">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    <span className="ml-3 text-gray-600">Loading DPDC Fund Details...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-full mx-auto p-6 bg-white rounded shadow">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <strong className="font-bold">Error!</strong>
                    <span className="block sm:inline"> {error}</span>
                </div>
                {collegeRegistrationNo && (
                    <button
                        onClick={initializeComponent}
                        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Retry
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="max-w-full mx-auto p-6 bg-white rounded shadow">
            <fieldset className="border border-gray-300 rounded mb-6 px-4 pt-3 pb-1">
                <legend
                    className={`flex items-center gap-2 rounded-md border border-gray-300 ${color} px-4 py-2 text-xl font-bold text-white shadow-md`}
                >
                    <img
                        src={fund.logo}
                        alt="Fund Logo"
                        className="w-7 h-7 mr-2 rounded-full bg-blue-50 border border-blue-200 shadow-sm"
                    />
                    {fund.name}
                </legend>

                {/* Institute Information */}
                {instituteInfo && (
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mt-4 shadow-sm">
                        <h3 className="text-lg font-semibold text-blue-700 mb-4">
                            District Fund Status
                        </h3>

                        <div className="space-y-3">
                            <div className="flex flex-wrap items-start gap-2 text-gray-800">
                                <span className="font-semibold min-w-[180px]">
                                    Institute Name:
                                </span>
                                <span className="px-3 py-1 flex-1">
                                    {instituteInfo.instituteName}
                                </span>
                            </div>

                            <div className="flex flex-wrap items-start gap-2 text-gray-800">
                                <span className="font-semibold min-w-[180px]">
                                    District:
                                </span>
                                <span className="px-3 py-1 flex-1">
                                    {instituteInfo.districtName}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Amounts Note */}
                <div className="flex justify-end px-4 mt-4">
                    <span className="text-sm font-semibold text-gray-700 bg-yellow-50 px-3 py-1 rounded border border-yellow-300">
                        All amounts in Rupees (₹)
                    </span>
                </div>

                {/* Table Component */}
                <FilteredTableComponent
                    data={fundData}
                    columns={tableColumns}
                    filterColumns={[]}
                    onRowChange={handleInputChange}
                    customButtons={[]}
                    title=""
                    exportFileName="DPDC_Fund_Allocation"
                    tableId="dpdc-fund-table"
                    searchable={false}
                    sortable={true}
                    showExcelTemplate={false}
                    exportable={false}
                    showSearch={false}
                    showExport={false}
                    className="mt-4"
                    renderCell={renderCell}
                    maxHeight="500px"
                    stickyHeader={true}
                    readOnly={false}
                />

                {/* Save Button */}
                {hasChanges && (
                    <div className="flex justify-center mt-6 mb-4">
                        <button
                            onClick={handleSaveAll}
                            disabled={otpService.otpLoading}
                            className={`px-4 py-2 rounded shadow font-semibold transition-colors ${
    otpService.otpLoading
        ? 'bg-gray-400 cursor-not-allowed'
        : 'bg-green-600 hover:bg-green-700 text-white'
}`}

                        >
                            {otpService.otpLoading ? 'Processing...' : 'Save'}
                        </button>
                    </div>
                )}
            </fieldset>

            {/* Note Section */}
            <div className="mt-4 rounded-md border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm text-blue-700">
                    <span className="font-medium">Note:</span>
                    <ol className="list-decimal list-inside mt-1 space-y-1">
                        <li>
                            <span className="font-semibold">2203:</span> माध्यमिक शाळांत प्रमाणपत्र परीक्षा पूर्व व्यावसायिक शिक्षणासाठी सुविधा विकास करणे
                        </li>
                        <li>
                            <span className="font-semibold">2230:</span> विद्यमान औद्योगिक प्रशिक्षण संस्थामधील उपकरणांची तुट दूर करणे
                        </li>
                    </ol>
                </p>
            </div>
        </div>
    );
};

export default DPDCFunds;
