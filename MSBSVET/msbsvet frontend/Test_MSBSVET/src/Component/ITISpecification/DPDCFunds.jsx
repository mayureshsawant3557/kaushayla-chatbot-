//import React, { useContext, useState, useEffect } from "react";
//import agent from '../../../lib/api/agent';
//import { ThemeContext } from "../Context/ThemeContext";
//import { useLoading } from "../../Hooks/useLoading";
//import { GetDPDCDetailsByCollegeRegNo } from "../../Endpoints_All/Base/Institute";

//const DPDCFunds = () => {
//    const { color } = useContext(ThemeContext);
//    const { startLoading, stopLoading, isLoading } = useLoading();
//    const [fundData, setFundData] = useState([]);
//    const [instituteInfo, setInstituteInfo] = useState(null);
//    const [error, setError] = useState(null);

//    // Dummy data for fund name and logo
//    const fund = {
//        name: "DPDC Fund",
//        logo: "https://cdn-icons-png.flaticon.com/512/2903/2903077.png",
//    };



//    // Get CollegeRegistrationNo from session storage with safety checks
//    const getCollegeRegistrationNo = () => {
//        try {
//            const userInfoAll = sessionStorage.getItem("userInfoAll");
//            if (!userInfoAll) {
//                console.error("userInfoAll not found in session storage");
//                return null;
//            }

//            const parsedUserInfo = JSON.parse(userInfoAll);

//            if (!parsedUserInfo || !parsedUserInfo.UserLoginID) {
//                console.error("UserLoginID not found in userInfoAll");
//                return null;
//            }

//            return parsedUserInfo.UserLoginID;
//        } catch (error) {
//            console.error("Error parsing userInfoAll from session storage:", error);
//            return null;
//        }
//    };

//    const collegeRegistrationNo = getCollegeRegistrationNo();

//    useEffect(() => {
//        if (collegeRegistrationNo) {
//            fetchDPDCDetails();
//        } else {
//            stopLoading();
//            setError("College Registration Number not found. Please login again.");
//        }
//    }, []);

//    const fetchDPDCDetails = async () => {
//        try {
//            startLoading();
//            setError(null);

//            const response = await agent.get(
//                GetDPDCDetailsByCollegeRegNo,
//                {
//                    params: {
//                        CollegeRegistrationNo: collegeRegistrationNo
//                    },
//                    headers: {
//                        'accept': '*/*',
//                        'Content-Type': 'application/json',
//                    }
//                }
//            );

//            console.log("API Response:", response.data);

//            // Check for Success status and Data array
//            if (response.data && response.data.Status === "Success" && response.data.Data) {
//                const data = response.data.Data;

//                if (data && data.length > 0) {
//                    // Set institute information from first record
//                    setInstituteInfo({
//                        instituteName: data[0].InstituteName,
//                        districtName: data[0].DistrictName,
//                        collegeRegistrationNo: data[0].CollegeRegistrationNo
//                    });

//                    // Set fund data (all records)
//                    setFundData(data);
//                } else {
//                    setError("No DPDC fund details found for this institute.");
//                }
//            } else {
//                setError(response.data?.Message || "Failed to fetch data");
//            }
//        } catch (err) {
//            console.error("Error fetching DPDC details:", err);

//            // Better error message handling
//            if (err.response) {
//                // Server responded with error
//                const errorMessage = err.response.data?.Message ||
//                    err.response.data?.message ||
//                    `Server Error: ${err.response.status}`;
//                setError(errorMessage);
//            } else if (err.request) {
//                // Request made but no response
//                setError("No response from server. Please check your connection.");
//            } else {
//                // Something else happened
//                setError(err.message || "An error occurred while fetching data");
//            }
//        } finally {
//            stopLoading();
//        }
//    };

//    // Format currency
//    const formatCurrency = (value) => {
//        if (!value || isNaN(value)) return '₹ 0';
//        return `₹ ${parseFloat(value).toLocaleString('en-IN', {
//            minimumFractionDigits: 2,
//            maximumFractionDigits: 2
//        })}`;
//    };

//    // Format date
//    const formatDate = (dateString) => {
//        if (!dateString) return 'N/A';
//        const date = new Date(dateString);
//        return date.toLocaleDateString('en-IN', {
//            year: 'numeric',
//            month: 'short',
//            day: '2-digit',
//            hour: '2-digit',
//            minute: '2-digit'
//        });
//    };

//    if (isLoading) {
//        return (
//            <div className="max-w-full mx-auto p-6 bg-white rounded shadow">
//                <div className="flex justify-center items-center h-64">
//                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
//                    <span className="ml-3 text-gray-600">Loading DPDC Fund Details...</span>
//                </div>
//            </div>
//        );
//    }

//    if (error) {
//        return (
//            <div className="max-w-full mx-auto p-6 bg-white rounded shadow">
//                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
//                    <strong className="font-bold">Error!</strong>
//                    <span className="block sm:inline"> {error}</span>
//                </div>
//                {collegeRegistrationNo && (
//                    <button
//                        onClick={fetchDPDCDetails}
//                        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
//                    >
//                        Retry
//                    </button>
//                )}
//            </div>
//        );
//    }

//    return (
//        <div className="max-w-full mx-auto p-6 bg-white rounded shadow">
//            <fieldset className="border border-gray-300 rounded mb-6 px-4 pt-3 pb-1">
//                <legend
//                    className={`flex items-center gap-2 rounded-md border border-gray-300 ${color} px-4 py-2 text-xl font-bold text-white shadow-md`}
//                >
//                    <img
//                        src={fund.logo}
//                        alt="Fund Logo"
//                        className="w-7 h-7 mr-2 rounded-full bg-blue-50 border border-blue-200 shadow-sm"
//                    />
//                    {fund.name}
//                </legend>

//                {/* District Fund Status Section */}
//                {instituteInfo && (
//                    <div className=" px-4 py-3 mt-4 shadow-sm">
//                        {/*bg-blue-50 border border-blue-200 rounded-md*/}
//                        <h3 className="text-lg font-semibold text-blue-700  mb-3">
//                            District Fund Status
//                        </h3>
//                        <div className="space-y-2">

//                            <div className="flex items-start gap-2 text-gray-800">
//                                <span className="font-semibold min-w-[180px]">Institute Name:</span>
//                                <span className=" px-3 py-1  flex-1">
//                                    {instituteInfo.instituteName}
//                                </span>
//                            </div>
//                            <div className="flex items-start gap-2 text-gray-800">
//                                <span className="font-semibold min-w-[180px]">District:</span>
//                                <span className=" px-3 py-1 ">
//                                    {instituteInfo.districtName}
//                                </span>
//                            </div>
//                        </div>
//                    </div>
//                )}

//                {/* Table Section */}
//                <div className="overflow-x-auto mt-4">
//                    <table className="table-auto w-full border border-gray-300 mb-4">
//                        <thead>
//                            <tr className="bg-gray-100">
//                                <th className="border px-4 py-2 text-sm font-semibold">S.N.</th>
//                                <th className="border px-4 py-2 text-sm font-semibold">Financial Year</th>
//                                <th className="border px-4 py-2 text-sm font-semibold">2203: Available for District</th>
//                                <th className="border px-4 py-2 text-sm font-semibold">2203: Allotted to Institute</th>
//                                <th className="border px-4 py-2 text-sm font-semibold">2230: Available for District</th>
//                                <th className="border px-4 py-2 text-sm font-semibold">2230: Allotted to Institute</th>
//                                <th className="border px-4 py-2 text-sm font-semibold bg-blue-100">Total Available</th>
//                                <th className="border px-4 py-2 text-sm font-semibold bg-green-100">Total Allotted to Institute</th>
//                            </tr>
//                        </thead>
//                        <tbody>
//                            {fundData.length > 0 ? (
//                                fundData.map((item, index) => (
//                                    <tr key={item.FundID || index} className="hover:bg-gray-50">
//                                        <td className="border px-4 py-2 text-center">{index + 1}</td>
//                                        <td className="border px-4 py-2 text-center font-medium">
//                                            {item.FinancialYear || 'N/A'}
//                                        </td>
//                                        <td className="border px-4 py-2 text-right">
//                                            {formatCurrency(item.Available_2203_District)}
//                                        </td>
//                                        <td className="border px-4 py-2 text-right">
//                                            {formatCurrency(item.Allotted_2203_Institute)}
//                                        </td>
//                                        <td className="border px-4 py-2 text-right">
//                                            {formatCurrency(item.Available_2230_District)}
//                                        </td>
//                                        <td className="border px-4 py-2 text-right">
//                                            {formatCurrency(item.Allotted_2230_Institute)}
//                                        </td>
//                                        <td className="border px-4 py-2 text-right font-semibold bg-blue-50">
//                                            {formatCurrency(item.TotalAvailable)}
//                                        </td>
//                                        <td className="border px-4 py-2 text-right font-semibold bg-green-50">
//                                            {formatCurrency(item.TotalAllottedToInstitute)}
//                                        </td>
//                                    </tr>
//                                ))
//                            ) : (
//                                <tr>
//                                    <td colSpan="8" className="border px-4 py-8 text-center text-gray-500">
//                                        <div className="flex flex-col items-center">
//                                            <svg className="w-16 h-16 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                                            </svg>
//                                            <p>No fund records available</p>
//                                        </div>
//                                    </td>
//                                </tr>
//                            )}
//                        </tbody>
//                    </table>
//                </div>


//            </fieldset>

//            {/* Note Section */}
//            <div className="mt-4 rounded-md border border-blue-200 bg-blue-50 p-4">
//                <p className="text-sm text-blue-700">
//                    <span className="font-medium">Note:</span>
//                    <ol className="list-decimal list-inside mt-1 space-y-1">
//                        <li>
//                            <span className="font-semibold">2203:</span> माध्यमिक शाळांत प्रमाणपत्र परीक्षा पूर्व व्यावसायिक शिक्षणासाठी सुविधा विकास करणे
//                        </li>
//                        <li>
//                            <span className="font-semibold">2230:</span> विद्यमान औद्योगिक प्रशिक्षण संस्थामधील उपकरणांची तुट दूर करणे
//                        </li>
//                    </ol>
//                </p>
//            </div>

//        </div>
//    );
//};

//export default DPDCFunds;