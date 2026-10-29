// //import React, { useState, useEffect } from 'react';
// //import { Search, FileDown, FileSpreadsheet } from 'lucide-react';
// //import { GetInstituteIDByInstituteCode, batchesforhallticket } from '../../../Endpoints_All/Examination/Exam';


// //const HallTicket = () => {
// //    const [batches, setBatches] = useState([]);
// //    const [filteredBatches, setFilteredBatches] = useState([]);
// //    const [loading, setLoading] = useState(true);
// //    const [error, setError] = useState(null);
// //    const [searchTerm, setSearchTerm] = useState('');

// //    useEffect(() => {
// //        fetchBatches();
// //    }, []);

// //    useEffect(() => {
// //        if (searchTerm.trim() === '') {
// //            setFilteredBatches(batches);
// //        } else {
// //            const filtered = batches.filter(batch =>
// //                batch.BatchID?.toLowerCase().includes(searchTerm.toLowerCase()) ||
// //                batch.CourseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
// //                batch.ExamType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
// //                batch.BatchStatusName?.toLowerCase().includes(searchTerm.toLowerCase())
// //            );
// //            setFilteredBatches(filtered);
// //        }
// //    }, [searchTerm, batches]);

// //    const fetchBatches = async () => {
// //        try {
// //            setLoading(true);
// //            setError(null);

// //            // Get user login ID from session storage
// //            const userInfoAll = JSON.parse(sessionStorage.getItem("userInfoAll"));
// //            const userLoginID = userInfoAll?.UserLoginID;

// //            if (!userLoginID) {
// //                throw new Error("User login ID not found in session storage");
// //            }

// //            // First API call to get Institute ID
// //            const instituteResponse = await fetch(
// //                `${GetInstituteIDByInstituteCode}?InstituteCode=${userLoginID}`
// //            );

// //            if (!instituteResponse.ok) {
// //                throw new Error("Failed to fetch Institute ID");
// //            }

// //            const instituteData = await instituteResponse.json();

// //            if (instituteData.Status !== "Success" || !instituteData.Data) {
// //                throw new Error(instituteData.Message || "Failed to retrieve Institute ID");
// //            }

// //            const instituteId = instituteData.Data;

// //            // Second API call to get batches for hall ticket
// //            const batchesResponse = await fetch(
// //                `${batchesforhallticket}?instituteId=${instituteId}`
// //            );
// //            if (!batchesResponse.ok) {
// //                throw new Error("Failed to fetch batches");
// //            }

// //            const batchesData = await batchesResponse.json();

// //            if (batchesData.Status === "Success" && Array.isArray(batchesData.Data)) {
// //                setBatches(batchesData.Data);
// //                setFilteredBatches(batchesData.Data);
// //            } else {
// //                setBatches([]);
// //                setFilteredBatches([]);
// //            }
// //        } catch (err) {
// //            setError(err.message);
// //            setBatches([]);
// //            setFilteredBatches([]);
// //        } finally {
// //            setLoading(false);
// //        }
// //    };

// //    const exportToExcel = () => {
// //        if (filteredBatches.length === 0) return;

// //        const headers = ['Sr. No.', 'Batch ID', 'Course Name', 'Exam Type', 'Batch Start Date', 'Batch End Date', 'Admitted', 'Approved', 'Examinee', 'BatchStatusName'];
// //        const rows = filteredBatches.map((batch, index) => [
// //            index + 1,
// //            batch.BatchID || '',
// //            batch.CourseName || '',
// //            batch.ExamType || '',
// //            batch.BatchStartDate || '',
// //            batch.BatchEndDate || '',
// //            batch.Admitted || 0,
// //            batch.Approved || 0,
// //            batch.Examinee || 0,
// //            batch.BatchStatusName || ''
// //        ]);

// //        const csvContent = [
// //            headers.join(','),
// //            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
// //        ].join('\n');

// //        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
// //        const link = document.createElement('a');
// //        link.href = URL.createObjectURL(blob);
// //        link.download = 'hall_ticket.csv';
// //        link.click();
// //    };

// //    const exportToPDF = () => {
// //        alert('PDF export functionality would require a PDF library. For now, please use Excel export.');
// //    };

// //    if (loading) {
// //        return (
// //            <div className="min-h-screen bg-gray-50 p-6">
// //                <div className="max-w-7xl mx-auto">
// //                    <div className="flex items-center justify-center h-64">
// //                        <div className="text-center">
// //                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
// //                            <p className="text-gray-600">Loading batches...</p>
// //                        </div>
// //                    </div>
// //                </div>
// //            </div>
// //        );
// //    }

// //    if (error) {
// //        return (
// //            <div className="min-h-screen bg-gray-50 p-6">
// //                <div className="max-w-7xl mx-auto">
// //                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
// //                        <p className="text-red-600 font-medium">Error: {error}</p>
// //                        <button
// //                            onClick={fetchBatches}
// //                            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
// //                        >
// //                            Retry
// //                        </button>
// //                    </div>
// //                </div>
// //            </div>
// //        );
// //    }

// //    return (
// //        <div className="min-h-screen bg-gray-50 p-6">
// //            <div className="max-w-full mx-auto">
// //                <fieldset className="border-2 border-gray-300 rounded p-4 bg-white shadow-sm">
// //                    <legend className="px-4 py-2 bg-gray-500 text-white rounded text-sm font-medium flex items-center gap-2">
// //                        <span className="text-base">☰</span>
// //                        <span>Hall Ticket</span>
// //                    </legend>

// //                    {filteredBatches.length === 0 ? (
// //                        <div className="p-12 text-center">
// //                            <div className="text-gray-400 mb-4">
// //                                <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// //                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
// //                                </svg>
// //                            </div>
// //                            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Batches Available</h3>
// //                            <p className="text-gray-500">There are no batches available for hall ticket generation at this time.</p>
// //                        </div>
// //                    ) : (
// //                        <div>
// //                            <div className="flex items-center justify-between gap-4 mb-4">
// //                                <div className="flex gap-2">
// //                                    <button
// //                                        onClick={exportToExcel}
// //                                        className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded hover:bg-green-700"
// //                                    >
// //                                        Excel
// //                                    </button>
// //                                    <button
// //                                        onClick={exportToPDF}
// //                                        className="px-4 py-2 bg-cyan-400 text-white text-sm font-semibold rounded hover:bg-cyan-500"
// //                                    >
// //                                        PDF
// //                                    </button>
// //                                </div>

// //                                <div className="flex items-center gap-2">
// //                                    <label className="text-sm text-gray-700">Search:</label>
// //                                    <input
// //                                        type="text"
// //                                        value={searchTerm}
// //                                        onChange={(e) => setSearchTerm(e.target.value)}
// //                                        className="border border-gray-300 rounded px-3 py-1 text-sm w-64 focus:outline-none focus:ring-1 focus:ring-gray-400"
// //                                        placeholder=""
// //                                    />
// //                                </div>
// //                            </div>

// //                            <div className="border border-gray-300 rounded overflow-hidden">
// //                                <div className="overflow-x-auto">
// //                                    <table className="w-full border-collapse">
// //                                        <thead>
// //                                            <tr className="bg-white">
// //                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 border-b border-gray-300">Sr. No.</th>
// //                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 border-b border-gray-300">Batch ID</th>
// //                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 border-b border-gray-300">Course Name</th>
// //                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 border-b border-gray-300">Exam Type</th>
// //                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 border-b border-gray-300">Batch Start Date</th>
// //                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 border-b border-gray-300">Batch End Date</th>
// //                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 border-b border-gray-300">Admitted</th>
// //                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 border-b border-gray-300">Approved</th>
// //                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 border-b border-gray-300">Examinee</th>
// //                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 border-b border-gray-300">BatchStatusName</th>
// //                                            </tr>
// //                                        </thead>
// //                                        <tbody className="bg-white">
// //                                            {filteredBatches.map((batch, index) => (
// //                                                <tr key={batch.BatchID || index} className="hover:bg-gray-50">
// //                                                    <td className="px-4 py-3 text-sm text-gray-700 border-b border-gray-200">{index + 1}.</td>
// //                                                    <td className="px-4 py-3 text-sm border-b border-gray-200">
// //                                                        <span className="bg-cyan-400 text-white px-2 py-1 rounded text-xs font-medium inline-block">
// //                                                            {batch.BatchID}
// //                                                        </span>
// //                                                    </td>
// //                                                    <td className="px-4 py-3 text-sm text-gray-700 border-b border-gray-200">{batch.CourseName}</td>
// //                                                    <td className="px-4 py-3 text-sm text-gray-700 border-b border-gray-200">{batch.ExamType}</td>
// //                                                    <td className="px-4 py-3 text-sm text-gray-700 border-b border-gray-200">{batch.BatchStartDate}</td>
// //                                                    <td className="px-4 py-3 text-sm text-gray-700 border-b border-gray-200">{batch.BatchEndDate}</td>
// //                                                    <td className="px-4 py-3 text-sm text-gray-700 text-center border-b border-gray-200">{batch.Admitted}</td>
// //                                                    <td className="px-4 py-3 text-sm text-gray-700 text-center border-b border-gray-200">{batch.Approved}</td>
// //                                                    <td className="px-4 py-3 text-sm text-gray-700 text-center border-b border-gray-200">{batch.Examinee}</td>
// //                                                    <td className="px-4 py-3 text-sm text-gray-700 border-b border-gray-200">{batch.BatchStatusName}</td>
// //                                                </tr>
// //                                            ))}
// //                                        </tbody>
// //                                    </table>
// //                                </div>
// //                            </div>

// //                            <div className="mt-3 text-xs text-gray-600">
// //                                Showing {filteredBatches.length} of {batches.length} batches
// //                            </div>
// //                        </div>
// //                    )}
// //                </fieldset>
// //            </div>
// //        </div>
// //    );
// //};

// //export default HallTicket;




// import React, { useEffect, useState } from 'react';
// import agent from '../../../lib/api/agent';
// import { AccountPassword, generateToken } from '../../../Endpoints_All/Account/authentication';
// import { ASPXbaseURL } from '../../../Endpoints_All/Config/baseConfig';
// import { getAccessToken } from '../../../lib/api/authService';

// const ExamFees = () => {
//     const [status, setStatus] = useState('Initializing...');
//     const [error, setError] = useState(null);

//     useEffect(() => {
//         const handleRedirect = async () => {
//             try {
//                 //// Step 1: Get user info from sessionStorage
//                 //setStatus('Retrieving user information...');
//                 //const userInfoAll = JSON.parse(sessionStorage.getItem("userInfoAll")) || {};
//                 //const userID = userInfoAll.UserID;
//                 //const userLoginID = userInfoAll.UserLoginID;

//                 //if (!userID || !userLoginID) {
//                 //    throw new Error('User information not found in session storage');
//                 //}

//                 //// Step 2: Get password from API
//                 //setStatus('Fetching user credentials...');
//                 //const passwordResponse = await agent.get(
//                 //    `${AccountPassword}/${userID}`
//                 //);
//                 //const password = passwordResponse.data?.Password;

//                 //if (!password) {
//                 //    throw new Error('Failed to retrieve password');
//                 //}

//                 //// Step 3: Generate token
//                 //setStatus('Generating authentication token...');
//                 //const tokenResponse = await agent.get(
//                 //    generateToken,
//                 //    {
//                 //        params: {
//                 //            userLoginId: userLoginID,
//                 //            password: password
//                 //        }
//                 //    }
//                 //);

//                 //const token = tokenResponse.data.token || tokenResponse.data;
//                 const token = getAccessToken();

//                 if (!token) {
//                     throw new Error('Failed to generate token');
//                 }

//                 // Step 4: Redirect to the target URL with token
//                 setStatus('Redirecting to application...');
//                 const targetUrl = `${ASPXbaseURL}/Exam/HallTicket.aspx?token=${token}`;

//                 // Redirect to the URL with token as query parameter
//                 window.location.href = targetUrl;

//             } catch (err) {
//                 console.error('Redirect error:', err);
//                 setError(err.message || 'An error occurred during redirect');
//                 setStatus('Error occurred');
//             }
//         };

//         handleRedirect();
//     }, []); // Empty dependency array ensures this runs once on mount

//     return (
//         <div style={styles.container}>
//             <div style={styles.card}>
//                 <div style={styles.spinner}></div>
//                 <h2 style={styles.title}>Redirecting...</h2>
//                 <p style={styles.status}>{status}</p>
//                 {error && (
//                     <div style={styles.errorContainer}>
//                         <p style={styles.errorText}>Error: {error}</p>
//                         <button
//                             style={styles.retryButton}
//                             onClick={() => window.location.reload()}
//                         >
//                             Retry
//                         </button>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// // Inline styles for the redirect page
// const styles = {
//     container: {
//         display: 'flex',
//         justifyContent: 'center',
//         alignItems: 'center',
//         minHeight: '100vh',
//         backgroundColor: '#f5f5f5',
//         fontFamily: 'Arial, sans-serif'
//     },
//     card: {
//         backgroundColor: 'white',
//         padding: '40px',
//         borderRadius: '8px',
//         boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
//         textAlign: 'center',
//         maxWidth: '400px',
//         width: '100%'
//     },
//     spinner: {
//         border: '4px solid #f3f3f3',
//         borderTop: '4px solid #3498db',
//         borderRadius: '50%',
//         width: '50px',
//         height: '50px',
//         animation: 'spin 1s linear infinite',
//         margin: '0 auto 20px'
//     },
//     title: {
//         color: '#333',
//         marginBottom: '10px',
//         fontSize: '24px'
//     },
//     status: {
//         color: '#666',
//         fontSize: '16px',
//         marginTop: '10px'
//     },
//     errorContainer: {
//         marginTop: '20px',
//         padding: '15px',
//         backgroundColor: '#fee',
//         borderRadius: '4px'
//     },
//     errorText: {
//         color: '#c33',
//         margin: '0 0 10px 0'
//     },
//     retryButton: {
//         backgroundColor: '#3498db',
//         color: 'white',
//         border: 'none',
//         padding: '10px 20px',
//         borderRadius: '4px',
//         cursor: 'pointer',
//         fontSize: '14px',
//         transition: 'background-color 0.3s'
//     }
// };

// // Add CSS for spinner animation
// const styleSheet = document.createElement("style");
// styleSheet.textContent = `
//     @keyframes spin {
//         0% { transform: rotate(0deg); }
//         100% { transform: rotate(360deg); }
//     }
// `;
// document.head.appendChild(styleSheet);

// export default ExamFees;

import RedirectToOld from "../../formcomponent/RedirectToOld";
const ExamFees = () =>{
    return <RedirectToOld targetPath="/Exam/HallTicket.aspx" />;
}

export default ExamFees;