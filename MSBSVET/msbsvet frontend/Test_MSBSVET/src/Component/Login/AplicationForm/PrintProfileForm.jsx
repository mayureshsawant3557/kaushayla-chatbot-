//import { useState, useEffect } from 'react';
//import agent from '../../../lib/api/agent';
//import { Edit, Check, X, Lock, Unlock, FileText } from 'lucide-react';
//import { useNavigate } from "react-router-dom";
//import Swal from 'sweetalert2';
//import ReactDOM from 'react-dom/client';
//import ProgressTracker from '../CandidateAndStaff/ProgressTracker';
//import { useLoading } from '../../../Hooks/useLoading';
//import Staff_PrintApplicationForm from '../../PrintApplicationForm/Staff_PrintApplicationForm';
//import Candidate_PrintApplicationForm from '../../PrintApplicationForm/Candidate_PrintApplicationForm';
//import {
//    GetCandidateSummary,
//    LockCandidateForm,
//    UnlockCandidateForm
//} from '../../../Endpoints_All/Candidate/summary';
//import {
//    GetStaffSummary,
//    RequestStaffVerification,
//    WithdrawStaffVerification,
//    GetStaffSectorialExpertiseList
//} from '../../../Endpoints_All/Staff/summary';
//import {
//    CheckStaffFormLock,
//    CheckCandidateFormLock
//} from '../../../Endpoints_All/Base/formLock';
//import { maskString } from "../../../utils/CommonHelper";

//// API endpoints configuration
//const API_ENDPOINTS = {
//    Candidate: {
//        checkLock: CheckCandidateFormLock,
//        getSummary: GetCandidateSummary,
//        lock: LockCandidateForm,
//        unlock: UnlockCandidateForm,
//        userTypeIDName: 'CandidateID',
//        idParam: 'candidateId'
//    },
//    Staff: {
//        checkLock: CheckStaffFormLock,
//        getSummary: GetStaffSummary,
//        requestVerification: RequestStaffVerification,
//        withdrawVerification: WithdrawStaffVerification,
//        getSectorialExpertise: GetStaffSectorialExpertiseList,
//        userTypeIDName: 'StaffID',
//        idParam: 'staffId'
//    }
//};

//const UnifiedLockProfileForm = () => {
//    const navigate = useNavigate();

//    const [summaryData, setSummaryData] = useState(null);
//    const [isLocked, setIsLocked] = useState(false);
//    const [verificationStatus, setVerificationStatus] = useState("Not Requested");
//    const [isDeclarationChecked, setIsDeclarationChecked] = useState(false);
//    const [userInfo, setUserInfo] = useState(null);
//    const [endpoints, setEndpoints] = useState(null);
//    const [userType, setUserType] = useState(null);
//    const { startLoading, stopLoading } = useLoading();
//    const [error, setError] = useState(null);
//    const [sectorialExpertiseData, setSectorialExpertiseData] = useState(null);

//    const getCurrentUserInfo = () => {
//        const userInfoData = sessionStorage.getItem("userInfoAll");
//        if (!userInfoData) return null;

//        try {
//            return JSON.parse(userInfoData);
//        } catch (e) {
//            console.error("Error parsing user info:", e);
//            return null;
//        }
//    };

//    useEffect(() => {
//        const currentUserInfo = getCurrentUserInfo();

//        if (!currentUserInfo) {
//            console.error("No user info found in session");
//            Swal.fire({
//                icon: 'error',
//                title: 'Session Error',
//                text: 'Please login again',
//            }).then(() => navigate('/login'));
//            return;
//        }

//        const userTypeID = currentUserInfo.UserTypeID;
//        const determinedUserType = userTypeID === 91 ? 'Candidate' : 'Staff';

//        setUserInfo(currentUserInfo);
//        setUserType(determinedUserType);
//        setEndpoints(API_ENDPOINTS[determinedUserType]);

//        setSummaryData(null);
//        setIsLocked(false);
//        setVerificationStatus("Not Requested");
//        setIsDeclarationChecked(false);
//        setError(null);
//        setSectorialExpertiseData(null);
//    }, []);

//    useEffect(() => {
//        if (userInfo && endpoints && userType) {
//            Promise.all([checkLockStatus(), fetchSummaryData(), fetchSectorialExpertise()]);
//        }
//    }, [userInfo, endpoints, userType]);

//    const refreshUserInfo = () => {
//        const currentUserInfo = getCurrentUserInfo();
//        if (currentUserInfo) {
//            const userTypeID = currentUserInfo.UserTypeID;
//            const determinedUserType = userTypeID === 91 ? 'Candidate' : 'Staff';
//            setUserInfo(currentUserInfo);
//            setUserType(determinedUserType);
//            setEndpoints(API_ENDPOINTS[determinedUserType]);
//        } else {
//            setUserInfo(null);
//            setUserType(null);
//            setEndpoints(null);
//            setSummaryData(null);
//            setError("Session expired. Please login again.");
//        }
//    };

//    const checkLockStatus = async () => {
//        if (!userInfo || !endpoints) return;

//        try {
//            const response = await agent.get(`${endpoints.checkLock}?${endpoints.userTypeIDName}=${userInfo.UserID}`);

//            if (response.data.Status === "Success") {
//                const lockData = response.data.Data;

//                if (userType === 'Staff') {
//                    let staffIsLocked = false;
//                    let staffVerificationStatus = "Not Requested";

//                    if (typeof lockData === 'boolean') {
//                        staffIsLocked = lockData;
//                        staffVerificationStatus = lockData ? "Requested" : "Not Requested";
//                    } else {
//                        staffIsLocked = lockData?.IsLocked ?? false;
//                        staffVerificationStatus = lockData?.VerificationStatus ?? "Not Requested";
//                    }

//                    console.log("Staff Lock Status:", staffIsLocked, staffVerificationStatus);
//                    setIsLocked(staffIsLocked);
//                    setVerificationStatus(staffVerificationStatus);

//                    if (['Pending', 'Verified', 'Requested'].includes(staffVerificationStatus)) {
//                        setIsDeclarationChecked(true);
//                    }
//                } else {
//                    const lockStatus = Boolean(lockData);
//                    setIsLocked(lockStatus);
//                    if (lockStatus) {
//                        setIsDeclarationChecked(true);
//                    }
//                }
//            }
//        } catch (err) {
//            console.error("Error checking lock status:", err);
//            if (err.response?.status === 401 || err.response?.status === 403) {
//                refreshUserInfo();
//            }
//        }
//    };

//    const fetchSummaryData = async () => {
//        if (!userInfo || !endpoints || !userType) return;

//        try {
//            startLoading();

//            if (userType === 'Staff') {
//                const requestBody = {
//                    StaffID: userInfo.UserID,
//                    UserLoginID: userInfo.UserLoginID,
//                    PageCode: "1",
//                    IPAddress: "1"
//                };

//                const response = await agent.post(endpoints.getSummary, requestBody);
//                console.log("Summary data response:", response.data.Data);

//                if (response.data.Status === "Success") {
//                    setSummaryData(response.data.Data);
//                } else {
//                    setError(response.data.Message);
//                }
//            } else {
//                const url = `${endpoints.getSummary}?${endpoints.idParam}=${userInfo.UserID}&pageCode=1`;
//                const response = await agent.get(url);

//                if (response.data.Status === "Success") {
//                    setSummaryData(response.data.Data);
//                } else {
//                    setError(response.data.Message);
//                }
//            }
//        } catch (err) {
//            setError("Failed to fetch summary data");
//            console.error("Error fetching summary:", err);
//            if (err.response?.status === 401 || err.response?.status === 403) {
//                refreshUserInfo();
//            }
//        } finally {
//            stopLoading();
//        }
//    };

//    const fetchSectorialExpertise = async () => {
//        if (!userInfo || userType !== 'Staff') return;

//        try {
//            const response = await agent.get(`${GetStaffSectorialExpertiseList}?StaffID=${userInfo.UserID}`);
//            console.log("Sectorial Expertise Response:", response.data);

//            if (response.data.Status === "Success" && Array.isArray(response.data.Data) && response.data.Data.length > 0) {
//                const firstItem = response.data.Data[0];
//                const isSectorialExp = (firstItem.IsSectorialExperience || "").toString().trim();

//                if (isSectorialExp === "0" || isSectorialExp === "-1") {
//                    setSectorialExpertiseData("NA");
//                } else if (isSectorialExp === "1") {
//                    setSectorialExpertiseData(response.data.Data);
//                } else {
//                    setSectorialExpertiseData(null);
//                }
//            } else {
//                setSectorialExpertiseData(null);
//            }
//        } catch (err) {
//            console.error("Error fetching sectorial expertise:", err);
//            setSectorialExpertiseData(null);
//        }
//    };

//    const handleLockForm = async () => {
//        if (!userInfo || !endpoints) return;

//        try {
//            const result = await Swal.fire({
//                title: 'Are you sure?',
//                text: 'You want to lock the form? This action will prevent editing.',
//                icon: 'warning',
//                showCancelButton: true,
//                confirmButtonColor: '#3085d6',
//                cancelButtonColor: '#d33',
//                confirmButtonText: 'Yes, lock it!'
//            });

//            if (!result.isConfirmed) return;

//            const requestData = {
//                [endpoints.userTypeIDName]: userInfo.UserID,
//                UserLoginID: userInfo.UserLoginID,
//                IPAddress: "1",
//                PageCode: "1"
//            };

//            const response = await agent.post(endpoints.lock, requestData);
//            console.log("Lock form response:", response.data);

//            if (response.data.Status === "Success") {
//                setIsLocked(true);
//                await checkLockStatus();
//                await fetchSummaryData();

//                Swal.fire('Locked!', 'Your form has been locked successfully.', 'success')
//                    .then(() => {
//                        window.location.reload();
//                    });
//            } else {
//                setError(response.data.Message);
//                Swal.fire('Error!', response.data.Message || 'Failed to lock form', 'error');
//            }
//        } catch (err) {
//            setError("Failed to lock form");
//            console.error("Error locking form:", err);
//            if (err.response?.status === 401 || err.response?.status === 403) {
//                refreshUserInfo();
//            }
//            Swal.fire('Error!', 'Failed to lock form. Please try again.', 'error');
//        }
//    };

//    const handleUnlockForm = async () => {
//        if (!userInfo || !endpoints) return;

//        try {
//            const result = await Swal.fire({
//                title: 'Are you sure?',
//                text: 'You want to unlock the form? This will allow editing again.',
//                icon: 'warning',
//                showCancelButton: true,
//                confirmButtonColor: '#3085d6',
//                cancelButtonColor: '#d33',
//                confirmButtonText: 'Yes, unlock it!'
//            });

//            if (!result.isConfirmed) return;

//            const requestData = {
//                [endpoints.userTypeIDName]: userInfo.UserID,
//                UserLoginID: userInfo.UserLoginID,
//                IPAddress: "1",
//                PageCode: "1"
//            };

//            const response = await agent.post(endpoints.unlock, requestData);
//            console.log("Unlock form response:", response.data);

//            if (response.data.Status === "Success") {
//                setIsLocked(false);
//                setIsDeclarationChecked(false);
//                await checkLockStatus();
//                await fetchSummaryData();

//                Swal.fire('Unlocked!', 'Your form has been unlocked successfully.', 'success')
//                    .then(() => {
//                        window.location.reload();
//                    });
//            } else {
//                setError(response.data.Message);
//                Swal.fire('Error!', response.data.Message || 'Failed to unlock form', 'error')
//                    .then(() => {
//                        window.location.reload();
//                    });
//            }
//        } catch (err) {
//            setError("Failed to unlock form");
//            console.error("Error unlocking form:", err);
//            if (err.response?.status === 401 || err.response?.status === 403) {
//                refreshUserInfo();
//            }
//            Swal.fire('Error!', 'Failed to unlock form. Please try again.', 'error');
//        }
//    };

//    const handleRequestVerification = async () => {
//        if (!userInfo || !endpoints) return;

//        try {
//            const result = await Swal.fire({
//                title: 'Information',
//                html: `
//                    <div style="text-align: left; padding: 10px;">
//                        <ul style="color: red; list-style-position: inside;">
//                            <li>Once Request for Verification is submitted, the information on previous pages shall be locked.</li>
//                            <li>To edit information on previous pages, withdraw Request for Verification.</li>
//                            <li>Request for Verification cannot be withdrawn after Verification by Board</li>
//                        </ul>
//                        <p style="color: red; font-weight: bold; margin-top: 15px;">Are you sure you want to Request for Verification</p>
//                    </div>
//                `,
//                icon: 'warning',
//                showCancelButton: true,
//                confirmButtonColor: '#28a745',
//                cancelButtonColor: '#dc3545',
//                confirmButtonText: 'Yes',
//                cancelButtonText: 'No',
//                customClass: {
//                    popup: 'swal-wide',
//                    htmlContainer: 'swal-text-left'
//                }
//            });

//            if (!result.isConfirmed) return;

//            const requestData = {
//                [endpoints.userTypeIDName]: userInfo.UserID,
//                UserLoginID: userInfo.UserLoginID,
//                IPAddress: "1",
//                PageCode: "1"
//            };

//            const response = await agent.post(endpoints.requestVerification, requestData);
//            console.log("Request verification response:", response.data);

//            if (response.data.Status === "Success") {
//                await checkLockStatus();
//                await fetchSummaryData();

//                Swal.fire('Success!', 'Your verification request has been submitted successfully.', 'success')
//                    .then(() => {
//                        window.location.reload();
//                    });
//            } else {
//                setError(response.data.Message);
//                Swal.fire('Error!', response.data.Message || 'Failed to request verification', 'error');
//            }
//        } catch (err) {
//            setError("Failed to request verification");
//            console.error("Error requesting verification:", err);
//            if (err.response?.status === 401 || err.response?.status === 403) {
//                refreshUserInfo();
//            }
//            Swal.fire('Error!', 'Failed to request verification. Please try again.', 'error');
//        }
//    };

//    const handleWithdrawVerification = async () => {
//        if (!userInfo || !endpoints) return;

//        try {
//            const result = await Swal.fire({
//                title: 'Are you sure?',
//                text: 'You want to withdraw the verification request? This will unlock the form for editing.',
//                icon: 'warning',
//                showCancelButton: true,
//                confirmButtonColor: '#3085d6',
//                cancelButtonColor: '#d33',
//                confirmButtonText: 'Yes, withdraw it!'
//            });

//            if (!result.isConfirmed) return;

//            const requestData = {
//                [endpoints.userTypeIDName]: userInfo.UserID,
//                UserLoginID: userInfo.UserLoginID,
//                IPAddress: "1",
//                PageCode: "1"
//            };

//            const response = await agent.post(endpoints.withdrawVerification, requestData);
//            console.log("Withdraw verification response:", response.data);

//            if (response.data.Status === "Success") {
//                await checkLockStatus();
//                await fetchSummaryData();

//                Swal.fire('Withdrawn!', 'Your verification request has been withdrawn successfully.', 'success')
//                    .then(() => {
//                        window.location.reload();
//                    });
//            } else {
//                setError(response.data.Message);
//                Swal.fire('Error!', response.data.Message || 'Failed to withdraw verification', 'error')
//                    .then(() => {
//                        window.location.reload();
//                    });
//            }
//        } catch (err) {
//            setError("Failed to withdraw verification");
//            console.error("Error withdrawing verification:", err);
//            if (err.response?.status === 401 || err.response?.status === 403) {
//                refreshUserInfo();
//            }
//            Swal.fire('Error!', 'Failed to withdraw verification. Please try again.', 'error');
//        }
//    };

//    const handleEdit = (route) => {
//        if (userType === 'Candidate') {
//            if (isLocked) {
//                Swal.fire({
//                    icon: 'error',
//                    title: 'Form Locked',
//                    text: 'Please unlock the form first before editing.',
//                });
//                return;
//            }
//        } else {
//            if (isLocked || verificationStatus !== "Not Requested") {
//                Swal.fire({
//                    icon: 'error',
//                    title: 'Form Locked',
//                    text: 'Please withdraw verification request first before editing.',
//                });
//                return;
//            }
//        }

//        navigate(route);
//    };

//    // ✅ UPDATED handlePrintProfile with your exact code structure
//    const handlePrintProfile = () => {
//        // Get profileID from userInfo
//        const profileID = userInfo?.UserLoginID;

//        if (!profileID) {
//            Swal.fire("Info", "No Profile ID available", "info");
//            return;
//        }

//        // ✅ Get StaffID from session storage (UserID)
//        const staffID = JSON.parse(sessionStorage.getItem("userInfoAll"))?.UserID;
//        const candidateID = JSON.parse(sessionStorage.getItem("userInfoAll"))?.UserID;
//        const userInfoAll = JSON.parse(sessionStorage.getItem("userInfoAll")) || {};

//        if (!staffID) {
//            Swal.fire("Error", "Staff ID not found", "error");
//            return;
//        }

//        // Open new window
//        const printWindow = window.open('', '_blank', 'width=1200,height=800,left=100,top=100');

//        if (!printWindow) {
//            Swal.fire("Error", "Please allow pop-ups for this website", "error");
//            return;
//        }

//        // Write initial HTML structure
//        printWindow.document.write(`
//            <!DOCTYPE html>
//            <html lang="en">
//            <head>
//                <meta charset="UTF-8">
//                <meta name="viewport" content="width=device-width, initial-scale=1.0">
//                <title>Staff Application Form - ${profileID}</title>
//                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet">
//                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
//                <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@100;200;300;400;500;600;700;800;900&display=swap" rel="stylesheet">
//                <style>
//                    body { font-family: 'Poppins', sans-serif; margin: 0; padding: 0; }
//                    #root { width: 100%; }
//                    /* Staff_PrintApplicationForm.css */

//body {
//    line-height: normal;
//}

//.staff-print-application-form {
//    font-family: 'Poppins', sans-serif;
//    padding: 20px;
//    background-color: #fff;
//}

//.application-form {
//    width: 100%;
//    font-size: 12px;
//    border: 1px solid #c5d3d3;
//    margin-bottom: 0px;
//}

//    .application-form th {
//        background-color: #f0f1f4;
//        border: 1px solid #c5d3d3;
//        font-weight: 600;
//        color: #000;
//        padding: 0.25rem;
//    }

//    .application-form td {
//        border: 1px solid #c5d3d3;
//        vertical-align: middle;
//        color: #000;
//        padding: 0.25rem;
//    }

//.table {
//    margin: 0px;
//}

//    .table th {
//        padding: 0.25rem;
//    }

//    .table td {
//        padding: 0.25rem;
//    }

//.GridView {
//    margin: 0px;
//    width: 100%;
//}

//    .GridView th {
//        border: 1px solid #eeeeee;
//        padding: 3px;
//        font-size: 12px;
//        font-weight: 500;
//        vertical-align: middle;
//        background-color: #f0f1f4;
//    }

//    .GridView td {
//        border: 1px solid #eeeeee;
//        padding: 3px;
//        font-size: 12px;
//    }

//.sub-title {
//    font-size: 12px;
//}

//.main-title {
//    font-size: 14px;
//}

//.main-title1 {
//    font-size: 18px;
//    font-weight: 600;
//}

//.labelFont {
//    font-weight: 600 !important;
//}

//.text-lg {
//    font-size: 16px;
//}

//.empty-data {
//    text-align: center;
//    padding: 20px;
//    font-size: 14px;
//    font-weight: 600;
//    color: #666;
//}

///* Action Buttons */
//.action-buttons {
//    display: flex;
//    justify-content: center;
//    gap: 15px;
//    margin-bottom: 20px;
//    padding: 15px;
//    background-color: #f8f9fa;
//    border-radius: 8px;
//}

//    .action-buttons .btn {
//        padding: 10px 20px;
//        font-size: 14px;
//        font-weight: 500;
//        border-radius: 6px;
//        display: flex;
//        align-items: center;
//        gap: 8px;
//        transition: all 0.3s ease;
//    }

//        .action-buttons .btn:hover {
//            transform: translateY(-2px);
//            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
//        }

//    .action-buttons .btn-secondary {
//        background-color: #6c757d;
//        border-color: #6c757d;
//        color: #fff;
//    }

//    .action-buttons .btn-primary {
//        background-color: #0d6efd;
//        border-color: #0d6efd;
//        color: #fff;
//    }

//    .action-buttons .btn-danger {
//        background-color: #dc3545;
//        border-color: #dc3545;
//        color: #fff;
//    }

///* Loading and Error States */
//.loading-container,
//.error-container {
//    display: flex;
//    justify-content: center;
//    align-items: center;
//    min-height: 400px;
//    padding: 20px;
//}

//    .error-container .alert {
//        max-width: 600px;
//        width: 100%;
//    }

///* Print Styles */
//@media print {
//    .no-print {
//        display: none !important;
//    }

//    .staff-print-application-form {
//        padding: 0;
//    }

//    body {
//        margin: 0;
//        padding: 0;
//    }

//    .application-form {
//        page-break-inside: avoid;
//    }

//    table {
//        page-break-inside: auto;
//    }

//    tr {
//        page-break-inside: avoid;
//        page-break-after: auto;
//    }
//}
//.sub-title {
//    font-size: 12px;
//}.main-title {
//    font-size: 14px;
//}.main-title1 {
//    font-size: 18px;
//}
//.logo-image {
//    width: 90px;
//}
//.india-logo {
//    width: 60px;
//}
//.me-3 {
//    margin-right: 1rem !important;
//}
///* Responsive adjustments */
//@media screen and (max-width: 768px) {
//    .application-form {
//        font-size: 10px;
//    }

//    .action-buttons {
//        flex-direction: column;
//    }

//        .action-buttons .btn {
//            width: 100%;
//            justify-content: center;
//        }
//}

//                </style>
//            </head>
//           <body>
//                <div id="root">Loading...</div>
//            </body>
//            </html>
//        `);

//        printWindow.document.close();

//        // Wait for window to load
//        printWindow.onload = () => {
//            const container = printWindow.document.getElementById('root');
//            const root = ReactDOM.createRoot(container);

//            const handleReadyToPrint = () => {
//                setTimeout(() => {
//                    printWindow.focus();
//                    printWindow.print();
//                }, 300);
//            };

//            if (userInfoAll?.UserTypeID === 91) {
//                // Candidate
//                root.render(
//                    <Candidate_PrintApplicationForm
//                        candidateID={candidateID}
//                        userLoginID={profileID}
//                        pageCode="CANDIDATE_PRINT"
//                        onReadyToPrint={handleReadyToPrint}
//                    />
//                );
//            } else if (userInfoAll?.UserTypeID === 95) {
//                // Staff
//                root.render(
//                    <Staff_PrintApplicationForm
//                        staffID={staffID}
//                        userLoginID={profileID}
//                        pageCode="STAFF_PRINT"
//                        onReadyToPrint={handleReadyToPrint}
//                    />
//                );
//            }
//        };

//    };

//    if (error) {
//        return <div className="text-red-600 text-center p-4">{error}</div>;
//    }

//    if (!userInfo || !endpoints || !userType) {
//        return <div className="text-center p-4">Loading user information...</div>;
//    }

//    if (!summaryData) {
//        return <div className="text-center p-4">Loading summary data...</div>;
//    }

//    const isCandidate = userType === 'Candidate';

//    const {
//        CandidateApplicationStatusSummary,
//        CandidatePrimarySummary,
//        CandidateAddressSummary,
//        CandidateParentSummary,
//        CandidateCategorySummary,
//        CandidateQualificationSummaryList,
//        CandidateAdditionalSummary,
//        CandidateLanguageSummaryList,
//        CandidateBankSummary,
//        CandidateWorkExperienceSummaryList
//    } = summaryData;

//    const {
//        StaffApplicationStatusSummary,
//        StaffPrimarySummary,
//        StaffAddressSummary,
//        StaffParentSummary,
//        StaffCategorySummary,
//        StaffQualificationSummaryList,
//        StaffAdditionalSummary,
//        StaffLanguageSummaryList,
//        StaffBankSummary,
//        StaffWorkExperienceSummaryList,
//        StaffSectoralExpertiseSummaryList,
//        StaffTrainingSummaryList
//    } = summaryData;

//    const primaryData = isCandidate ? CandidatePrimarySummary : StaffPrimarySummary;
//    const applicationStatusData = isCandidate ? CandidateApplicationStatusSummary : StaffApplicationStatusSummary;
//    const addressData = isCandidate ? CandidateAddressSummary : StaffAddressSummary;
//    const parentData = isCandidate ? CandidateParentSummary : StaffParentSummary;
//    const categoryData = isCandidate ? CandidateCategorySummary : StaffCategorySummary;
//    const qualificationData = isCandidate ? CandidateQualificationSummaryList : StaffQualificationSummaryList;
//    const additionalData = isCandidate ? CandidateAdditionalSummary : StaffAdditionalSummary;
//    const languageData = isCandidate ? CandidateLanguageSummaryList : StaffLanguageSummaryList;
//    const bankData = isCandidate ? CandidateBankSummary : StaffBankSummary;
//    const workExperienceData = isCandidate ? CandidateWorkExperienceSummaryList : StaffWorkExperienceSummaryList;

//    const renderSectionHeader = (title, filled, editRoute) => (
//        <div className="flex items-center justify-between mb-4">
//            <div className="flex items-center gap-2">
//                {((isCandidate && !isLocked) || (!isCandidate && !isLocked && verificationStatus === "Not Requested")) && (
//                    <button
//                        onClick={() => handleEdit(editRoute)}
//                        className="text-blue-600 mr-3"
//                    >
//                        <Edit size={20} />
//                    </button>
//                )}

//                {((isCandidate && !isLocked) || (!isCandidate && !isLocked && verificationStatus === "Not Requested")) && (
//                    filled ? <Check className="text-blue-600" size={20} /> : <X className="text-gray-400" size={20} />
//                )}

//                <h2 className="text-lg font-semibold">{title}</h2>
//            </div>
//        </div>
//    );

//    return (
//        <div className="max-w-full mx-auto p-6 bg-white">
//            {/* ProgressTracker */}
//            {((isCandidate && !isLocked) || (!isCandidate && verificationStatus === "Not Requested" && !isLocked)) && (
//                <div className="mb-6">
//                    <ProgressTracker />
//                </div>
//            )}

//            {/* VERIFICATION SECTION - Only this uses fieldset/legend */}
//            <fieldset className="mb-4 rounded-md border p-4">
//                <legend className="flex items-center gap-2 rounded-md border border-gray-400 bg-gray-500 px-4 py-2 text-lg font-semibold text-white">
//                    Verification
//                </legend>

//                <div className="mt-4 flex flex-col items-center gap-3">

//                    <button
//                        onClick={handlePrintProfile}
//                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md font-medium text-sm hover:bg-green-700 transition-colors"
//                    >
//                        <FileText size={18} />
//                        Print Profile
//                    </button>


//                    <div className="text-center">
//                        <span className="text-gray-900 text-base">
//                            Profile ID : <span className="font-bold">{userInfo.UserLoginID}</span>
//                        </span>
//                    </div>

//                    {/* Lock Status */}
//                    {isCandidate ? (
//                        isLocked && (
//                            <div className="flex items-center gap-2 mt-2">
//                                <Lock className="text-red-500" size={18} />
//                                <span className="text-red-500 font-medium text-sm">Form is locked</span>
//                            </div>
//                        )
//                    ) : (
//                        isLocked || verificationStatus !== "Not Requested" ? (
//                            <div className="flex flex-col items-center gap-2 mt-2">
//                                <div className="flex items-center gap-2">
//                                    <Lock className="text-red-500" size={18} />
//                                    <span className="text-red-500 font-medium text-sm">
//                                        {verificationStatus === "Verified"
//                                            ? "Form is verified and locked"
//                                            : "Verification request pending - Form is locked"}
//                                    </span>
//                                </div>
//                                {verificationStatus === "Pending" && (
//                                    <div className="text-orange-600 text-xs font-medium mt-1">
//                                        To edit information, please withdraw verification request
//                                    </div>
//                                )}
//                            </div>
//                        ) : null
//                    )}
//                </div>


//                {/* PRIMARY DETAILS SECTION */}
//                {primaryData && (
//                    <div className="mb-6">
//                        <div className={`flex items-center gap-2 mb-2 ${!isLocked ? 'cursor-pointer' : 'cursor-default'}`} onClick={!isLocked ? () => navigate(`/${userType}/Primary`) : undefined}>
//                            {!isLocked && (
//                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
//                                    <path d="M21,12a1,1,0,0,0-1,1v6a1,1,0,0,1-1,1H5a1,1,0,0,1-1-1V5A1,1,0,0,1,5,4h6a1,1,0,0,0,0-2H5A3,3,0,0,0,2,5V19a3,3,0,0,0,3,3H19a3,3,0,0,0,3-3V13A1,1,0,0,0,21,12ZM6,12.76V17a1,1,0,0,0,1,1h4.24a1,1,0,0,0,.71-.29l6.92-6.93h0L21.71,8a1,1,0,0,0,0-1.42L17.47,2.29a1,1,0,0,0-1.42,0L13.23,5.12h0L6.29,12.05A1,1,0,0,0,6,12.76ZM16.76,4.41l2.83,2.83L18.17,8.66,15.34,5.83ZM8,13.17l5.93-5.93,2.83,2.83L10.83,16H8Z" />
//                                </svg>
//                            )}
//                            <h2 className="text-blue-600 font-semibold text-base">Primary Details</h2>
//                        </div>

//                        <hr className="border-gray-300 mb-4" />

//                        <div className="relative">

//                            <div className="absolute right-8 top-0 flex flex-col gap-4">
//                                <div className="text-center">
//                                    <img
//                                        src={primaryData.PhotoFilePath}
//                                        alt="Photo"
//                                        style={{ width: '133px', height: '171px' }}
//                                        className="object-cover"
//                                        onError={(e) => { e.target.src = "/no-photo.png"; }}
//                                    />
//                                </div>
//                                <div className="text-center">
//                                    <img
//                                        src={primaryData.SignFilePath}
//                                        alt="Signature"
//                                        style={{ width: '133px', height: '57px' }}
//                                        className="object-contain bg-white mb-2"
//                                        onError={(e) => { e.target.src = "/no-sign.png"; }}
//                                    />
//                                </div>
//                            </div>


//                            <div className="mr-52 flex flex-col items-center space-y-1">
//                                <div className="flex items-center justify-center text-sm">
//                                    <span className="text-gray-700 text-right" style={{ minWidth: '220px' }}>{isCandidate ? "Candidate's" : "Staff's"} Name</span>
//                                    <span className="text-gray-700 mx-2">:</span>
//                                    <span className="font-bold text-gray-900 text-left" style={{ minWidth: '250px' }}>
//                                        {primaryData.FirstName} {primaryData.MiddleName} {primaryData.LastName}
//                                    </span>
//                                </div>
//                                {!isCandidate && (
//                                    <div className="flex items-center justify-center text-sm">
//                                        <span className="text-gray-700 text-right" style={{ minWidth: '220px' }}>Job Role</span>
//                                        <span className="text-gray-700 mx-2">:</span>
//                                        <span className="font-bold text-gray-900 text-left" style={{ minWidth: '250px' }}>{primaryData.JobRoles || '-'}</span>
//                                    </div>
//                                )}
//                                <div className="flex items-center justify-center text-sm">
//                                    <span className="text-gray-700 text-right" style={{ minWidth: '220px' }}>Gender</span>
//                                    <span className="text-gray-700 mx-2">:</span>
//                                    <span className="font-bold text-gray-900 text-left" style={{ minWidth: '250px' }}>{primaryData.Gender}</span>
//                                </div>
//                                <div className="flex items-center justify-center text-sm">
//                                    <span className="text-gray-700 text-right" style={{ minWidth: '220px' }}>Date Of Birth (DD/MM/YYYY)</span>
//                                    <span className="text-gray-700 mx-2">:</span>
//                                    <span className="font-bold text-gray-900 text-left" style={{ minWidth: '250px' }}>{primaryData.DOB}</span>
//                                </div>
//                                <div className="flex items-center justify-center text-sm">
//                                    <span className="text-gray-700 text-right" style={{ minWidth: '220px' }}>Aadhaar Number</span>
//                                    <span className="text-gray-700 mx-2">:</span>
//                                    <span className="font-bold text-gray-900 text-left" style={{ minWidth: '250px' }}>{maskString(primaryData.AadhaarNo)}</span>
//                                </div>
//                                <div className="flex items-center justify-center text-sm">
//                                    <span className="text-gray-700 text-right" style={{ minWidth: '220px' }}>Primary Mobile Number</span>
//                                    <span className="text-gray-700 mx-2">:</span>
//                                    <span className="font-bold text-gray-900 text-left" style={{ minWidth: '250px' }}>{primaryData.MobileNo}</span>
//                                </div>
//                                <div className="flex items-center justify-center text-sm">
//                                    <span className="text-gray-700 text-right" style={{ minWidth: '220px' }}>Secondary Mobile Number</span>
//                                    <span className="text-gray-700 mx-2">:</span>
//                                    <span className="font-bold text-gray-900 text-left" style={{ minWidth: '250px' }}>{primaryData.AltMobileNo || '-'}</span>
//                                </div>
//                                <div className="flex items-center justify-center text-sm">
//                                    <span className="text-gray-700 text-right" style={{ minWidth: '220px' }}>E-Mail ID</span>
//                                    <span className="text-gray-700 mx-2">:</span>
//                                    <span className="font-bold text-gray-900 text-left" style={{ minWidth: '250px' }}>{primaryData.EMailID}</span>
//                                </div>
//                            </div>
//                        </div>
//                    </div>
//                )}





//                {addressData && (
//                    <div className="mb-6">
//                        <div className={`flex items-center gap-2 mb-2 ${!isLocked ? 'cursor-pointer' : 'cursor-default'}`} onClick={!isLocked ? () => navigate(`/${userType}/address`) : undefined}>
//                            {!isLocked && (
//                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
//                                    <path d="M21,12a1,1,0,0,0-1,1v6a1,1,0,0,1-1,1H5a1,1,0,0,1-1-1V5A1,1,0,0,1,5,4h6a1,1,0,0,0,0-2H5A3,3,0,0,0,2,5V19a3,3,0,0,0,3,3H19a3,3,0,0,0,3-3V13A1,1,0,0,0,21,12ZM6,12.76V17a1,1,0,0,0,1,1h4.24a1,1,0,0,0,.71-.29l6.92-6.93h0L21.71,8a1,1,0,0,0,0-1.42L17.47,2.29a1,1,0,0,0-1.42,0L13.23,5.12h0L6.29,12.05A1,1,0,0,0,6,12.76ZM16.76,4.41l2.83,2.83L18.17,8.66,15.34,5.83ZM8,13.17l5.93-5.93,2.83,2.83L10.83,16H8Z" />
//                                </svg>
//                            )}
//                            <h2 className="text-blue-600 font-semibold text-base">Permanent Address</h2>
//                        </div>

//                        <hr className="border-gray-300 mb-4" />

//                        <div className="flex flex-col items-center justify-center space-y-1">

//                            <div className="flex items-center  text-sm">
//                                <span className="text-gray-700 text-right" style={{ minWidth: '20px' }}>Address</span>
//                                <span className="text-gray-700 mx-2">:</span>
//                                <span className="font-bold text-gray-900 text-left" style={{ minWidth: '650px' }}>{addressData.PAddress}</span>
//                            </div>


//                            <div className="flex items-center justify-center text-sm">
//                                <span className="text-gray-700 text-right" style={{ minWidth: '120px' }}>State</span>
//                                <span className="text-gray-700 mx-2">:</span>
//                                <span className="font-bold text-gray-900 text-left" style={{ minWidth: '250px' }}>{addressData.PState}</span>

//                                <span className="text-gray-700 text-right" style={{ minWidth: '120px' }}>District</span>
//                                <span className="text-gray-700 mx-2">:</span>
//                                <span className="font-bold text-gray-900 text-left" style={{ minWidth: '250px' }}>{addressData.PDistrict}</span>
//                            </div>


//                            <div className="flex items-center justify-center text-sm">
//                                <span className="text-gray-700 text-right" style={{ minWidth: '120px' }}>Taluka</span>
//                                <span className="text-gray-700 mx-2">:</span>
//                                <span className="font-bold text-gray-900 text-left" style={{ minWidth: '250px' }}>{addressData.PTaluka}</span>

//                                <span className="text-gray-700 text-right" style={{ minWidth: '120px' }}>City / Village</span>
//                                <span className="text-gray-700 mx-2">:</span>
//                                <span className="font-bold text-gray-900 text-left" style={{ minWidth: '250px' }}>{addressData.PCity}</span>
//                            </div>


//                            <div className="flex items-center justify-center text-sm">
//                                <span className="text-gray-700 text-right" style={{ minWidth: '120px' }}>Pin Code</span>
//                                <span className="text-gray-700 mx-2">:</span>
//                                <span className="font-bold text-gray-900 text-left" style={{ minWidth: '650px' }}>{addressData.PPincode}</span>
//                            </div>
//                        </div>
//                    </div>
//                )}



//                {addressData && (
//                    <div className="mb-6">
//                        <div className={`flex items-center gap-2 mb-2 ${!isLocked ? 'cursor-pointer' : 'cursor-default'}`} onClick={!isLocked ? () => navigate(`/${userType}/address`) : undefined}>
//                            {!isLocked && (
//                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
//                                    <path d="M21,12a1,1,0,0,0-1,1v6a1,1,0,0,1-1,1H5a1,1,0,0,1-1-1V5A1,1,0,0,1,5,4h6a1,1,0,0,0,0-2H5A3,3,0,0,0,2,5V19a3,3,0,0,0,3,3H19a3,3,0,0,0,3-3V13A1,1,0,0,0,21,12ZM6,12.76V17a1,1,0,0,0,1,1h4.24a1,1,0,0,0,.71-.29l6.92-6.93h0L21.71,8a1,1,0,0,0,0-1.42L17.47,2.29a1,1,0,0,0-1.42,0L13.23,5.12h0L6.29,12.05A1,1,0,0,0,6,12.76ZM16.76,4.41l2.83,2.83L18.17,8.66,15.34,5.83ZM8,13.17l5.93-5.93,2.83,2.83L10.83,16H8Z" />
//                                </svg>
//                            )}
//                            <h2 className="text-blue-600 font-semibold text-base">Correspondence Address</h2>
//                        </div>

//                        <hr className="border-gray-300 mb-4" />

//                        <div className="flex flex-col items-center space-y-1">

//                            <div className="flex items-center justify-center text-sm">
//                                <span className="text-gray-700 text-right" style={{ minWidth: '120px' }}>Address</span>
//                                <span className="text-gray-700 mx-2">:</span>
//                                <span className="font-bold text-gray-900 text-left" style={{ minWidth: '650px' }}>{addressData.CAddress}</span>
//                            </div>

//                            {/* State and District - Two Column with aligned colons */}
//                            <div className="flex items-center justify-center text-sm">
//                                <span className="text-gray-700 text-right" style={{ minWidth: '120px' }}>State</span>
//                                <span className="text-gray-700 mx-2">:</span>
//                                <span className="font-bold text-gray-900 text-left" style={{ minWidth: '250px' }}>{addressData.CState}</span>

//                                <span className="text-gray-700 text-right" style={{ minWidth: '120px' }}>District</span>
//                                <span className="text-gray-700 mx-2">:</span>
//                                <span className="font-bold text-gray-900 text-left" style={{ minWidth: '250px' }}>{addressData.CDistrict}</span>
//                            </div>

//                            {/* Taluka and City/Village - Two Column with aligned colons */}
//                            <div className="flex items-center justify-center text-sm">
//                                <span className="text-gray-700 text-right" style={{ minWidth: '120px' }}>Taluka</span>
//                                <span className="text-gray-700 mx-2">:</span>
//                                <span className="font-bold text-gray-900 text-left" style={{ minWidth: '250px' }}>{addressData.CTaluka}</span>

//                                <span className="text-gray-700 text-right" style={{ minWidth: '120px' }}>City / Village</span>
//                                <span className="text-gray-700 mx-2">:</span>
//                                <span className="font-bold text-gray-900 text-left" style={{ minWidth: '250px' }}>{addressData.CCity}</span>
//                            </div>

//                            {/* Pin Code - Single */}
//                            <div className="flex items-center justify-center text-sm">
//                                <span className="text-gray-700 text-right" style={{ minWidth: '120px' }}>Pin Code</span>
//                                <span className="text-gray-700 mx-2">:</span>
//                                <span className="font-bold text-gray-900 text-left" style={{ minWidth: '650px' }}>{addressData.CPincode}</span>
//                            </div>
//                        </div>
//                    </div>
//                )}


//                {/* PARENT/GUARDIAN DETAILS SECTION */}
//                {parentData && (
//                    <div className="mb-6">
//                        <div className={`flex items-center gap-2 mb-2 ${!isLocked ? 'cursor-pointer' : 'cursor-default'}`} onClick={!isLocked ? () => navigate(`/${userType}/parent`) : undefined}>
//                            {!isLocked && (
//                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
//                                    <path d="M21,12a1,1,0,0,0-1,1v6a1,1,0,0,1-1,1H5a1,1,0,0,1-1-1V5A1,1,0,0,1,5,4h6a1,1,0,0,0,0-2H5A3,3,0,0,0,2,5V19a3,3,0,0,0,3,3H19a3,3,0,0,0,3-3V13A1,1,0,0,0,21,12ZM6,12.76V17a1,1,0,0,0,1,1h4.24a1,1,0,0,0,.71-.29l6.92-6.93h0L21.71,8a1,1,0,0,0,0-1.42L17.47,2.29a1,1,0,0,0-1.42,0L13.23,5.12h0L6.29,12.05A1,1,0,0,0,6,12.76ZM16.76,4.41l2.83,2.83L18.17,8.66,15.34,5.83ZM8,13.17l5.93-5.93,2.83,2.83L10.83,16H8Z" />
//                                </svg>
//                            )}
//                            <h2 className="text-blue-600 font-semibold text-base">Parent / Guardian Details</h2>
//                        </div>

//                        <hr className="border-gray-300 mb-4" />

//                        <div className="flex flex-col items-center space-y-1">
//                            {/* Are you Orphan - Full Width */}
//                            <div className="flex items-center justify-center text-sm">
//                                <span className="text-gray-700 text-right" style={{ minWidth: '180px' }}>Are you Orphan ?</span>
//                                <span className="text-gray-700 mx-2">:</span>
//                                <span className="font-bold text-gray-900 text-left" style={{ minWidth: '590px' }}>{parentData.IsOrphan}</span>
//                            </div>

//                            {/* Father's Name and Mother's Name - Two Column with aligned colons */}
//                            <div className="flex items-center justify-center text-sm">
//                                <span className="text-gray-700 text-right" style={{ minWidth: '180px' }}>Father's Name</span>
//                                <span className="text-gray-700 mx-2">:</span>
//                                <span className="font-bold text-gray-900 text-left" style={{ minWidth: '200px' }}>
//                                    {parentData.FatherTitle} {parentData.FatherFirstName} {parentData.FatherMiddleName} {parentData.FatherLastName}
//                                </span>

//                                <span className="text-gray-700 text-right" style={{ minWidth: '180px' }}>Mother's Name</span>
//                                <span className="text-gray-700 mx-2">:</span>
//                                <span className="font-bold text-gray-900 text-left" style={{ minWidth: '200px' }}>
//                                    {parentData.MotherTitle} {parentData.MotherFirstName} {parentData.MotherMiddleName} {parentData.MotherLastName}
//                                </span>
//                            </div>

//                            {/* Marital Status - Full Width */}
//                            <div className="flex items-center justify-center text-sm">
//                                <span className="text-gray-700 text-right" style={{ minWidth: '180px' }}>Marital Status</span>
//                                <span className="text-gray-700 mx-2">:</span>
//                                <span className="font-bold text-gray-900 text-left" style={{ minWidth: '590px' }}>{parentData.MaritalStatus}</span>
//                            </div>

//                            {/* Spouse Name - Show only if Married */}
//                            {parentData.MaritalStatus && parentData.MaritalStatus.toLowerCase() === 'married' && (
//                                <div className="flex items-center justify-center text-sm">
//                                    <span className="text-gray-700 text-right" style={{ minWidth: '180px' }}>Spouse Name</span>
//                                    <span className="text-gray-700 mx-2">:</span>
//                                    <span className="font-bold text-gray-900 text-left" style={{ minWidth: '590px' }}>
//                                        {parentData.SpouseTitle} {parentData.SpouseFirstName} {parentData.SpouseMiddleName} {parentData.SpouseLastName}
//                                    </span>
//                                </div>
//                            )}
//                        </div>
//                    </div>
//                )}


//                {/* CATEGORY DETAILS SECTION */}
//                {categoryData && (
//                    <div className="mb-6">
//                        <div className={`flex items-center gap-2 mb-2 ${!isLocked ? 'cursor-pointer' : 'cursor-default'}`} onClick={!isLocked ? () => navigate(`/${userType}/category`) : undefined}>
//                            {!isLocked && (
//                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
//                                    <path d="M21,12a1,1,0,0,0-1,1v6a1,1,0,0,1-1,1H5a1,1,0,0,1-1-1V5A1,1,0,0,1,5,4h6a1,1,0,0,0,0-2H5A3,3,0,0,0,2,5V19a3,3,0,0,0,3,3H19a3,3,0,0,0,3-3V13A1,1,0,0,0,21,12ZM6,12.76V17a1,1,0,0,0,1,1h4.24a1,1,0,0,0,.71-.29l6.92-6.93h0L21.71,8a1,1,0,0,0,0-1.42L17.47,2.29a1,1,0,0,0-1.42,0L13.23,5.12h0L6.29,12.05A1,1,0,0,0,6,12.76ZM16.76,4.41l2.83,2.83L18.17,8.66,15.34,5.83ZM8,13.17l5.93-5.93,2.83,2.83L10.83,16H8Z" />
//                                </svg>
//                            )}
//                            <h2 className="text-blue-600 font-semibold text-base">Category Details</h2>
//                        </div>

//                        <hr className="border-gray-300 mb-4" />

//                        <div className="flex flex-col items-center space-y-1">
//                            {/* Nationality and Are you Maharashtra Domiciled - Two Column */}
//                            <div className="flex items-center justify-center text-sm">
//                                <span className="text-gray-700 text-right" style={{ minWidth: '200px' }}>Nationality</span>
//                                <span className="text-gray-700 mx-2">:</span>
//                                <span className="font-bold text-gray-900 text-left" style={{ minWidth: '180px' }}>{categoryData.Nationality}</span>

//                                <span className="text-gray-700 text-right" style={{ minWidth: '200px' }}>Are you Maharashtra Domiciled?</span>
//                                <span className="text-gray-700 mx-2">:</span>
//                                <span className="font-bold text-gray-900 text-left" style={{ minWidth: '180px' }}>{categoryData.IsMHDomiciled}</span>
//                            </div>

//                            {/* Religion and Caste Category - Two Column */}
//                            <div className="flex items-center justify-center text-sm">
//                                <span className="text-gray-700 text-right" style={{ minWidth: '200px' }}>Religion</span>
//                                <span className="text-gray-700 mx-2">:</span>
//                                <span className="font-bold text-gray-900 text-left" style={{ minWidth: '180px' }}>{categoryData.Religion}</span>

//                                <span className="text-gray-700 text-right" style={{ minWidth: '200px' }}>Caste Category</span>
//                                <span className="text-gray-700 mx-2">:</span>
//                                <span className="font-bold text-gray-900 text-left" style={{ minWidth: '180px' }}>{categoryData.Category}</span>
//                            </div>

//                            {/* Do you belong to Person with Disability Category - Full Width */}
//                            <div className="flex items-center justify-center text-sm">
//                                <span className="text-gray-700 text-right" style={{ minWidth: '280px' }}>Do you belong to Person with Disability Category?</span>
//                                <span className="text-gray-700 mx-2">:</span>
//                                <span className="font-bold text-gray-900 text-left" style={{ minWidth: '490px' }}>{categoryData.IsBelongToPWD}</span>
//                            </div>

//                            {/* Conditional Disability Details */}
//                            {categoryData.IsBelongToPWD === "Yes" && (
//                                <>
//                                    {/* Disability Percentage and Person With Disability Category - Two Column */}
//                                    <div className="flex items-center justify-center text-sm">
//                                        <span className="text-gray-700 text-right" style={{ minWidth: '200px' }}>Disability Percentage</span>
//                                        <span className="text-gray-700 mx-2">:</span>
//                                        <span className="font-bold text-gray-900 text-left" style={{ minWidth: '180px' }}>{categoryData.DisabilityPercentage}</span>

//                                        <span className="text-gray-700 text-right" style={{ minWidth: '200px' }}>Person With Disability Category</span>
//                                        <span className="text-gray-700 mx-2">:</span>
//                                        <span className="font-bold text-gray-900 text-left" style={{ minWidth: '180px' }}>{categoryData.DisabilityType}</span>
//                                    </div>

//                                    {/* Type of Disability As Per Certificate - Full Width */}
//                                    <div className="flex items-center justify-center text-sm">
//                                        <span className="text-gray-700 text-right" style={{ minWidth: '280px' }}>Type of Disability As Per Certificate</span>
//                                        <span className="text-gray-700 mx-2">:</span>
//                                        <span className="font-bold text-gray-900 text-left" style={{ minWidth: '490px' }}>{categoryData.DisabilityTypeAsCertificate}</span>
//                                    </div>

//                                    {/* Unique Disability ID Number - Full Width */}
//                                    <div className="flex items-center justify-center text-sm">
//                                        <span className="text-gray-700 text-right" style={{ minWidth: '280px' }}>Unique Disability ID Number</span>
//                                        <span className="text-gray-700 mx-2">:</span>
//                                        <span className="font-bold text-gray-900 text-left" style={{ minWidth: '490px' }}>{categoryData.UniqueDisabilityID}</span>
//                                    </div>
//                                </>
//                            )}
//                        </div>
//                    </div>
//                )}


//                {/* QUALIFICATION DETAILS SECTION */}
//                {qualificationData && qualificationData.length > 0 && (
//                    <div className="mb-6">
//                        <div className={`flex items-center gap-2 mb-2 ${!isLocked ? 'cursor-pointer' : 'cursor-default'}`} onClick={!isLocked ? () => navigate(`/${userType}/qualification`) : undefined}>
//                            {!isLocked && (
//                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
//                                    <path d="M21,12a1,1,0,0,0-1,1v6a1,1,0,0,1-1,1H5a1,1,0,0,1-1-1V5A1,1,0,0,1,5,4h6a1,1,0,0,0,0-2H5A3,3,0,0,0,2,5V19a3,3,0,0,0,3,3H19a3,3,0,0,0,3-3V13A1,1,0,0,0,21,12ZM6,12.76V17a1,1,0,0,0,1,1h4.24a1,1,0,0,0,.71-.29l6.92-6.93h0L21.71,8a1,1,0,0,0,0-1.42L17.47,2.29a1,1,0,0,0-1.42,0L13.23,5.12h0L6.29,12.05A1,1,0,0,0,6,12.76ZM16.76,4.41l2.83,2.83L18.17,8.66,15.34,5.83ZM8,13.17l5.93-5.93,2.83,2.83L10.83,16H8Z" />
//                                </svg>
//                            )}
//                            <h2 className="text-blue-600 font-semibold text-base">Qualification Details</h2>
//                        </div>

//                        <hr className="border-gray-300 mb-4" />

//                        <div className="overflow-x-auto">
//                            <table className="w-full border-collapse text-sm">
//                                <thead>
//                                    <tr className="bg-gray-200 border-b border-gray-400">
//                                        <th className="border border-gray-400 px-3 py-2 text-left font-semibold text-gray-900">
//                                            {isCandidate ? 'Highest Standard Attended' : 'Qualification Type'}
//                                        </th>
//                                        <th className="border border-gray-400 px-3 py-2 text-left font-semibold text-gray-900">
//                                            Name Of Degree
//                                        </th>
//                                        <th className="border border-gray-400 px-3 py-2 text-left font-semibold text-gray-900">
//                                            Subject / Branch / Trade
//                                        </th>
//                                        <th className="border border-gray-400 px-3 py-2 text-left font-semibold text-gray-900">
//                                            Board / University
//                                        </th>
//                                        <th className="border border-gray-400 px-3 py-2 text-left font-semibold text-gray-900">
//                                            Marks Obtained
//                                        </th>
//                                        <th className="border border-gray-400 px-3 py-2 text-left font-semibold text-gray-900">
//                                            Maximum Marks
//                                        </th>
//                                        <th className="border border-gray-400 px-3 py-2 text-left font-semibold text-gray-900">
//                                            Class / Grade
//                                        </th>
//                                    </tr>
//                                </thead>
//                                <tbody>
//                                    {qualificationData.map((qual, index) => (
//                                        <tr key={index}>
//                                            <td className="border border-gray-400 px-3 py-2 text-gray-900">
//                                                {qual.Qualification || qual.Degree}
//                                            </td>
//                                            <td className="border border-gray-400 px-3 py-2 text-gray-900">
//                                                {qual.Degree}
//                                            </td>
//                                            <td className="border border-gray-400 px-3 py-2 text-gray-900">
//                                                {qual.Subject}
//                                            </td>
//                                            <td className="border border-gray-400 px-3 py-2 text-gray-900">
//                                                {qual.University}
//                                            </td>
//                                            <td className="border border-gray-400 px-3 py-2 text-gray-900">
//                                                {qual.MarksObtained}
//                                            </td>
//                                            <td className="border border-gray-400 px-3 py-2 text-gray-900">
//                                                {qual.MaximumMarks}
//                                            </td>
//                                            <td className="border border-gray-400 px-3 py-2 text-gray-900">
//                                                {qual.Class}
//                                            </td>
//                                        </tr>
//                                    ))}
//                                </tbody>
//                            </table>
//                        </div>
//                    </div>
//                )}

//                {/* TRAINING DETAILS SECTION - STAFF ONLY */}

//                <div className="mb-6">
//                    <div className={`flex items-center gap-2 mb-2 ${!isLocked ? 'cursor-pointer' : 'cursor-default'}`} onClick={!isLocked ? () => navigate(`/Staff/training`) : undefined}>
//                        {!isLocked && (
//                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
//                                <path d="M21,12a1,1,0,0,0-1,1v6a1,1,0,0,1-1,1H5a1,1,0,0,1-1-1V5A1,1,0,0,1,5,4h6a1,1,0,0,0,0-2H5A3,3,0,0,0,2,5V19a3,3,0,0,0,3,3H19a3,3,0,0,0,3-3V13A1,1,0,0,0,21,12ZM6,12.76V17a1,1,0,0,0,1,1h4.24a1,1,0,0,0,.71-.29l6.92-6.93h0L21.71,8a1,1,0,0,0,0-1.42L17.47,2.29a1,1,0,0,0-1.42,0L13.23,5.12h0L6.29,12.05A1,1,0,0,0,6,12.76ZM16.76,4.41l2.83,2.83L18.17,8.66,15.34,5.83ZM8,13.17l5.93-5.93,2.83,2.83L10.83,16H8Z" />
//                            </svg>
//                        )}
//                        <h2 className="text-blue-600 font-semibold text-base">Training Details</h2>
//                    </div>

//                    <hr className="border-gray-300 mb-4" />

//                    {StaffTrainingSummaryList && StaffTrainingSummaryList.length > 0 ? (
//                        <div className="overflow-x-auto">
//                            <table className="w-full border-collapse text-sm">
//                                <thead>
//                                    <tr className="bg-gray-200 border-b border-gray-400">
//                                        <th className="border border-gray-400 px-3 py-2 text-left font-semibold text-gray-900">
//                                            Course
//                                        </th>
//                                        <th className="border border-gray-400 px-3 py-2 text-left font-semibold text-gray-900">
//                                            Conducted By
//                                        </th>
//                                        <th className="border border-gray-400 px-3 py-2 text-left font-semibold text-gray-900">
//                                            From Date
//                                        </th>
//                                        <th className="border border-gray-400 px-3 py-2 text-left font-semibold text-gray-900">
//                                            To Date
//                                        </th>
//                                        <th className="border border-gray-400 px-3 py-2 text-left font-semibold text-gray-900">
//                                            Certificate
//                                        </th>
//                                    </tr>
//                                </thead>
//                                <tbody>
//                                    {StaffTrainingSummaryList.map((training, index) => (
//                                        <tr key={index}>
//                                            <td className="border border-gray-400 px-3 py-2 text-gray-900">
//                                                {training.Course}
//                                            </td>
//                                            <td className="border border-gray-400 px-3 py-2 text-gray-900">
//                                                {training.CourseConductedBy}
//                                            </td>
//                                            <td className="border border-gray-400 px-3 py-2 text-gray-900">
//                                                {training.FromDate}
//                                            </td>
//                                            <td className="border border-gray-400 px-3 py-2 text-gray-900">
//                                                {training.ToDate}
//                                            </td>
//                                            <td className="border border-gray-400 px-3 py-2">
//                                                {training.CertificatePath && training.CertificatePath !== "NA" ? (
//                                                    <a
//                                                        href={training.CertificatePath}
//                                                        target="_blank"
//                                                        rel="noopener noreferrer"
//                                                        className="text-blue-600 hover:underline"
//                                                    >
//                                                        View Certificate
//                                                    </a>
//                                                ) : (
//                                                    "-"
//                                                )}
//                                            </td>
//                                        </tr>
//                                    ))}
//                                </tbody>
//                            </table>
//                        </div>
//                    ) : (
//                        <div className="text-center text-gray-700 py-3 text-base font-bold border border-gray-400">
//                            NA
//                        </div>
//                    )}
//                </div>


//                {/* ADDITIONAL DETAILS SECTION */}
//                {additionalData && (
//                    <div className="mb-6">
//                        <div className={`flex items-center gap-2 mb-2 ${!isLocked ? 'cursor-pointer' : 'cursor-default'}`} onClick={!isLocked ? () => navigate(`/${userType}/additional`) : undefined}>
//                            {!isLocked && (
//                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
//                                    <path d="M21,12a1,1,0,0,0-1,1v6a1,1,0,0,1-1,1H5a1,1,0,0,1-1-1V5A1,1,0,0,1,5,4h6a1,1,0,0,0,0-2H5A3,3,0,0,0,2,5V19a3,3,0,0,0,3,3H19a3,3,0,0,0,3-3V13A1,1,0,0,0,21,12ZM6,12.76V17a1,1,0,0,0,1,1h4.24a1,1,0,0,0,.71-.29l6.92-6.93h0L21.71,8a1,1,0,0,0,0-1.42L17.47,2.29a1,1,0,0,0-1.42,0L13.23,5.12h0L6.29,12.05A1,1,0,0,0,6,12.76ZM16.76,4.41l2.83,2.83L18.17,8.66,15.34,5.83ZM8,13.17l5.93-5.93,2.83,2.83L10.83,16H8Z" />
//                                </svg>
//                            )}
//                            <h2 className="text-blue-600 font-semibold text-base">Additional Details</h2>
//                        </div>

//                        <hr className="border-gray-300 mb-4" />

//                        <div className="text-center space-y-1 mb-4">
//                            <div>
//                                <span className="text-gray-700 text-sm">Blood Group : </span>
//                                <span className="font-bold text-gray-900 text-sm">{additionalData.BloodGroup}</span>
//                                <span className="ml-12 text-gray-700 text-sm">Mother Tongue : </span>
//                                <span className="font-bold text-gray-900 text-sm">{additionalData.MotherTongue}</span>
//                            </div>
//                        </div>

//                        {languageData && languageData.length > 0 && (
//                            <div className="overflow-x-auto">
//                                <table className="w-full border-collapse text-sm">
//                                    <thead>
//                                        <tr className="bg-gray-200 border-b border-gray-400">
//                                            <th className="border border-gray-400 px-3 py-2 text-left font-semibold text-gray-900">
//                                                Language
//                                            </th>
//                                            <th className="border border-gray-400 px-3 py-2 text-left font-semibold text-gray-900">
//                                                Read
//                                            </th>
//                                            <th className="border border-gray-400 px-3 py-2 text-left font-semibold text-gray-900">
//                                                Write
//                                            </th>
//                                            <th className="border border-gray-400 px-3 py-2 text-left font-semibold text-gray-900">
//                                                Speak
//                                            </th>
//                                        </tr>
//                                    </thead>
//                                    <tbody>
//                                        {languageData.map((lang, index) => (
//                                            <tr key={index}>
//                                                <td className="border border-gray-400 px-3 py-2 text-gray-900">
//                                                    {lang.Language}
//                                                </td>
//                                                <td className="border border-gray-400 px-3 py-2 text-gray-900">
//                                                    {lang.Read}
//                                                </td>
//                                                <td className="border border-gray-400 px-3 py-2 text-gray-900">
//                                                    {lang.Write}
//                                                </td>
//                                                <td className="border border-gray-400 px-3 py-2 text-gray-900">
//                                                    {lang.Speak}
//                                                </td>
//                                            </tr>
//                                        ))}
//                                    </tbody>
//                                </table>
//                            </div>
//                        )}
//                    </div>
//                )}

//                {/* BANK DETAILS SECTION */}
//                {bankData && (
//                    <div className="mb-6">
//                        <div className={`flex items-center gap-2 mb-2 ${!isLocked ? 'cursor-pointer' : 'cursor-default'}`} onClick={!isLocked ? () => navigate(`/${userType}/Bank`) : undefined}>
//                            {!isLocked && (
//                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
//                                    <path d="M21,12a1,1,0,0,0-1,1v6a1,1,0,0,1-1,1H5a1,1,0,0,1-1-1V5A1,1,0,0,1,5,4h6a1,1,0,0,0,0-2H5A3,3,0,0,0,2,5V19a3,3,0,0,0,3,3H19a3,3,0,0,0,3-3V13A1,1,0,0,0,21,12ZM6,12.76V17a1,1,0,0,0,1,1h4.24a1,1,0,0,0,.71-.29l6.92-6.93h0L21.71,8a1,1,0,0,0,0-1.42L17.47,2.29a1,1,0,0,0-1.42,0L13.23,5.12h0L6.29,12.05A1,1,0,0,0,6,12.76ZM16.76,4.41l2.83,2.83L18.17,8.66,15.34,5.83ZM8,13.17l5.93-5.93,2.83,2.83L10.83,16H8Z" />
//                                </svg>
//                            )}
//                            <h2 className="text-blue-600 font-semibold text-base">Bank Details</h2>
//                        </div>

//                        <hr className="border-gray-300 mb-4" />

//                        <div className="flex flex-col items-center space-y-1">
//                            {/* Row 1: Type Of Account (Left) and Account Number (Right) */}
//                            <div className="flex items-center justify-center text-sm">
//                                <span className="text-gray-700 text-right" style={{ minWidth: '180px' }}>Type Of Account</span>
//                                <span className="text-gray-700 mx-2">:</span>
//                                <span className="font-bold text-gray-900 text-left" style={{ minWidth: '200px' }}>{bankData.AccountType}</span>

//                                <span className="text-gray-700 text-right" style={{ minWidth: '180px' }}>Account Number</span>
//                                <span className="text-gray-700 mx-2">:</span>
//                                <span className="font-bold text-gray-900 text-left" style={{ minWidth: '200px' }}>{bankData.AccountNo}</span>
//                            </div>

//                            {/* Row 2: Name Of Account Holder (Left) and Bank IFSC Code (Right) */}
//                            <div className="flex items-center justify-center text-sm">
//                                <span className="text-gray-700 text-right" style={{ minWidth: '180px' }}>Name Of Account Holder</span>
//                                <span className="text-gray-700 mx-2">:</span>
//                                <span className="font-bold text-gray-900 text-left" style={{ minWidth: '200px' }}>{bankData.AccountHolderName}</span>

//                                <span className="text-gray-700 text-right" style={{ minWidth: '180px' }}>Bank IFSC Code</span>
//                                <span className="text-gray-700 mx-2">:</span>
//                                <span className="font-bold text-gray-900 text-left" style={{ minWidth: '200px' }}>{bankData.IFSCCode}</span>
//                            </div>

//                            {/* Row 3: Bank Name (Left) and Branch Name (Right) */}
//                            <div className="flex items-center justify-center text-sm">
//                                <span className="text-gray-700 text-right" style={{ minWidth: '180px' }}>Bank Name</span>
//                                <span className="text-gray-700 mx-2">:</span>
//                                <span className="font-bold text-gray-900 text-left" style={{ minWidth: '200px' }}>{bankData.BankName}</span>

//                                <span className="text-gray-700 text-right" style={{ minWidth: '180px' }}>Branch Name</span>
//                                <span className="text-gray-700 mx-2">:</span>
//                                <span className="font-bold text-gray-900 text-left" style={{ minWidth: '200px' }}>{bankData.BranchName}</span>
//                            </div>

//                            {/* Row 4: PAN Number (Left only) */}
//                            <div className="flex items-center justify-center text-sm">
//                                <span className="text-gray-700 text-right" style={{ minWidth: '180px' }}>PAN Number</span>
//                                <span className="text-gray-700 mx-2">:</span>
//                                <span className="font-bold text-gray-900 text-left" style={{ minWidth: '590px' }}>{bankData.PANNo}</span>
//                            </div>
//                        </div>
//                    </div>
//                )}




//                {/* WORK EXPERIENCE SECTION - STAFF ONLY */}

//                <div className="mb-6">
//                    <div className={`flex items-center gap-2 mb-2 ${!isLocked ? 'cursor-pointer' : 'cursor-default'}`} onClick={!isLocked ? () => navigate(`/${userType}/workexperience`) : undefined}>
//                        {!isLocked && (
//                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
//                                <path d="M21,12a1,1,0,0,0-1,1v6a1,1,0,0,1-1,1H5a1,1,0,0,1-1-1V5A1,1,0,0,1,5,4h6a1,1,0,0,0,0-2H5A3,3,0,0,0,2,5V19a3,3,0,0,0,3,3H19a3,3,0,0,0,3-3V13A1,1,0,0,0,21,12ZM6,12.76V17a1,1,0,0,0,1,1h4.24a1,1,0,0,0,.71-.29l6.92-6.93h0L21.71,8a1,1,0,0,0,0-1.42L17.47,2.29a1,1,0,0,0-1.42,0L13.23,5.12h0L6.29,12.05A1,1,0,0,0,6,12.76ZM16.76,4.41l2.83,2.83L18.17,8.66,15.34,5.83ZM8,13.17l5.93-5.93,2.83,2.83L10.83,16H8Z" />
//                            </svg>
//                        )}
//                        <h2 className="text-blue-600 font-semibold text-base">Work Experience Details</h2>
//                    </div>

//                    <hr className="border-gray-300 mb-4" />

//                    {workExperienceData && workExperienceData.length > 0 ? (
//                        <div className="overflow-x-auto">
//                            <table className="w-full border-collapse text-sm">
//                                <thead>
//                                    <tr className="bg-gray-200 border-b border-gray-400">
//                                        <th className="border border-gray-400 px-3 py-2 text-left font-semibold text-gray-900">
//                                            Name of Establishment
//                                        </th>
//                                        <th className="border border-gray-400 px-3 py-2 text-left font-semibold text-gray-900">
//                                            Address
//                                        </th>
//                                        <th className="border border-gray-400 px-3 py-2 text-left font-semibold text-gray-900">
//                                            Job Role
//                                        </th>
//                                        <th className="border border-gray-400 px-3 py-2 text-left font-semibold text-gray-900">
//                                            From Date
//                                        </th>
//                                        <th className="border border-gray-400 px-3 py-2 text-left font-semibold text-gray-900">
//                                            To Date
//                                        </th>
//                                        <th className="border border-gray-400 px-3 py-2 text-left font-semibold text-gray-900">
//                                            Stipend / Salary Per Month in Rs.
//                                        </th>
//                                    </tr>
//                                </thead>
//                                <tbody>
//                                    {workExperienceData.map((exp, index) => (
//                                        <tr key={index}>
//                                            <td className="border border-gray-400 px-3 py-2 text-gray-900">
//                                                {exp.EstablishmentName}
//                                            </td>
//                                            <td className="border border-gray-400 px-3 py-2 text-gray-900">
//                                                {exp.Address}
//                                            </td>
//                                            <td className="border border-gray-400 px-3 py-2 text-gray-900">
//                                                {exp.JobRole}
//                                            </td>
//                                            <td className="border border-gray-400 px-3 py-2 text-gray-900">
//                                                {exp.FromDate}
//                                            </td>
//                                            <td className="border border-gray-400 px-3 py-2 text-gray-900">
//                                                {exp.ToDate}
//                                            </td>
//                                            <td className="border border-gray-400 px-3 py-2 text-gray-900">
//                                                {exp.SalaryPerMonth}
//                                            </td>
//                                        </tr>
//                                    ))}
//                                </tbody>
//                            </table>
//                        </div>
//                    ) : (
//                        <div className="text-center text-gray-700 py-3 text-base font-bold border border-gray-400">
//                            NA
//                        </div>
//                    )}
//                </div>


//                {/* SECTORIAL EXPERTISE SECTION - STAFF ONLY */}
//                {!isCandidate && (
//                    <div className="mb-6">
//                        <div className={`flex items-center gap-2 mb-2 ${!isLocked ? 'cursor-pointer' : 'cursor-default'}`} onClick={!isLocked ? () => navigate(`/Staff/SectorialExpertise`) : undefined}>
//                            {!isLocked && (
//                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
//                                    <path d="M21,12a1,1,0,0,0-1,1v6a1,1,0,0,1-1,1H5a1,1,0,0,1-1-1V5A1,1,0,0,1,5,4h6a1,1,0,0,0,0-2H5A3,3,0,0,0,2,5V19a3,3,0,0,0,3,3H19a3,3,0,0,0,3-3V13A1,1,0,0,0,21,12ZM6,12.76V17a1,1,0,0,0,1,1h4.24a1,1,0,0,0,.71-.29l6.92-6.93h0L21.71,8a1,1,0,0,0,0-1.42L17.47,2.29a1,1,0,0,0-1.42,0L13.23,5.12h0L6.29,12.05A1,1,0,0,0,6,12.76ZM16.76,4.41l2.83,2.83L18.17,8.66,15.34,5.83ZM8,13.17l5.93-5.93,2.83,2.83L10.83,16H8Z" />
//                                </svg>
//                            )}
//                            <h2 className="text-blue-600 font-semibold text-base">Sectorial Expertise</h2>
//                        </div>

//                        <hr className="border-gray-300 mb-4" />

//                        {sectorialExpertiseData === "NA" || !sectorialExpertiseData || (Array.isArray(sectorialExpertiseData) && sectorialExpertiseData.length === 0) ? (
//                            <div className="text-center text-gray-700 py-3 text-base font-bold border border-gray-400">
//                                NA
//                            </div>
//                        ) : (
//                            <div className="text-left px-4">
//                                <p className="text-sm text-gray-900">
//                                    {sectorialExpertiseData.map((expertise, index) => (
//                                        <span key={index}>
//                                            {expertise.SectorialExpertiseName}
//                                            {index < sectorialExpertiseData.length - 1 ? ', ' : ''}
//                                        </span>
//                                    ))}
//                                </p>
//                            </div>
//                        )}
//                    </div>
//                )}


//                {/* DECLARATION SECTION */}
//                <div className="mb-6 p-6 border border-gray-400 rounded">
//                    <h2 className="text-base font-bold mb-3 text-gray-900">Declaration</h2>
//                    <div className="flex items-start gap-3">
//                        {!isLocked && (
//                            <input
//                                type="checkbox"
//                                checked={isDeclarationChecked}
//                                onChange={(e) => setIsDeclarationChecked(e.target.checked)}
//                                className="mt-1 w-4 h-4 cursor-pointer"
//                            />
//                        )}
//                        <div className="text-sm text-gray-700 leading-relaxed">
//                            I hereby declare & understand that,
//                            <ol className="list-decimal ml-5 mt-2 space-y-1">
//                                <li>All the information furnished by me in this profile is true, complete and correct to the best of my knowledge and belief.</li>
//                                <li>Entire information furnished by me in this profile is final and binding to me.</li>
//                                <li>If any information furnished by me here, is found to be false or incorrect, I shall be liable for appropriate legal action and my application will be cancelled as per rules.</li>
//                            </ol>
//                        </div>
//                    </div>
//                </div>


//                {/* ACTION BUTTON */}
//                <div className="flex justify-center mt-6">
//                    {isCandidate ? (
//                        <button
//                            onClick={isLocked ? handleUnlockForm : handleLockForm}
//                            disabled={!isLocked && !isDeclarationChecked}
//                            className={`flex items-center gap-2 px-6 py-2 rounded-md font-medium text-sm ${isLocked
//                                ? 'bg-green-600 text-white hover:bg-green-700'
//                                : !isDeclarationChecked
//                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
//                                    : 'bg-blue-600 text-white hover:bg-blue-700'
//                                } transition-colors duration-200`}
//                        >
//                            {isLocked ? (
//                                <>
//                                    <Unlock size={18} />
//                                    Unlock Form
//                                </>
//                            ) : (
//                                <>
//                                    <Lock size={18} />
//                                    Lock Form
//                                </>
//                            )}
//                        </button>
//                    ) : (
//                        verificationStatus === "Verified" ? (
//                            <div className="flex items-center gap-2 px-6 py-2 bg-green-100 border-2 border-green-500 text-green-700 rounded-md font-medium text-sm">
//                                <Check size={18} />
//                                <span>Verified by Board</span>
//                            </div>
//                        ) : verificationStatus === "Pending" || verificationStatus === "Requested" ? (
//                            <button
//                                onClick={handleWithdrawVerification}
//                                className="flex items-center gap-2 px-6 py-2 bg-orange-600 text-white rounded-md font-medium text-sm hover:bg-orange-700 transition-colors duration-200"
//                            >
//                                <X size={18} />
//                                Withdraw Verification Request
//                            </button>
//                        ) : (
//                            <button
//                                onClick={handleRequestVerification}
//                                disabled={!isDeclarationChecked}
//                                className={`flex items-center gap-2 px-6 py-2 rounded-md font-medium text-sm ${!isDeclarationChecked
//                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
//                                    : 'bg-blue-600 text-white hover:bg-blue-700'
//                                    } transition-colors duration-200`}
//                            >
//                                <Check size={18} />
//                                Request for Verification
//                            </button>
//                        )
//                    )}
//                </div>
//            </fieldset>
//        </div>

//    );



//};

//export default UnifiedLockProfileForm;
