import { useState, useEffect, useContext } from 'react';
import agent from '../../../lib/api/agent';
import { Edit, Check, X, Lock, Unlock, FileText } from 'lucide-react';
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import Swal from 'sweetalert2';
import ReactDOM from 'react-dom/client';
import ProgressTracker from './ProgressTracker';
import { useLoading } from '../../../Hooks/useLoading';
import Staff_PrintApplicationForm from '../../PrintApplicationForm/Staff_PrintApplicationForm';
import Candidate_PrintApplicationForm from '../../PrintApplicationForm/Candidate_PrintApplicationForm';
import {
  CheckCandidateURL,
  GetCandidateSummary,
  LockCandidateForm,
  UnlockCandidateForm
} from '../../../Endpoints_All/Candidate/summary';
import {
  GetStaffSummary,
  RequestStaffVerification,
  WithdrawStaffVerification,
  GetStaffSectorialExpertiseList,
  CheckStaffURL
} from '../../../Endpoints_All/Staff/summary';
import {
  CheckStaffFormLock,
  CheckCandidateFormLock,
  IsCandidategeteligibilityflag,
  GetEligibilityFlagForUnlockStaffForm
} from '../../../Endpoints_All/Base/formLock';
import { getDeviceIP, maskString } from "../../../utils/CommonHelper";
import { useAuth } from '../../../Hooks/AuthContext';
import { ThemeContext } from "../../../Component/Context/ThemeContext";


// API endpoints configuration
const API_ENDPOINTS = {
  Candidate: {
    checkLock: CheckCandidateFormLock,
    getSummary: GetCandidateSummary,
    lock: LockCandidateForm,
    unlock: UnlockCandidateForm,
    userTypeIDName: 'CandidateID',
    idParam: 'candidateId',
    geteligibilityflag: IsCandidategeteligibilityflag
  },
  Staff: {
    checkLock: CheckStaffFormLock,
    getSummary: GetStaffSummary,
    requestVerification: RequestStaffVerification,
    withdrawVerification: WithdrawStaffVerification,
    getSectorialExpertise: GetStaffSectorialExpertiseList,
    userTypeIDName: 'StaffID',
    idParam: 'staffId',
    geteligibilityflag: GetEligibilityFlagForUnlockStaffForm
  }
};

const UnifiedLockProfileForm = () => {


  const [summaryData, setSummaryData] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState("Not Requested");
  const [isDeclarationChecked, setIsDeclarationChecked] = useState(false);
  const [endpoints, setEndpoints] = useState(null);
  const [userType, setUserType] = useState(null);
  const { startLoading, stopLoading } = useLoading();
  const [error, setError] = useState(null);
  const [sectorialExpertiseData, setSectorialExpertiseData] = useState(null);
  const navigate = useNavigate();
  const { userInfo } = useAuth();
  const [searchParams] = useSearchParams();
  const [ipAddress, setIpAddress] = useState("");

  const candidateIdFromUrl = searchParams.get("candidateId");
  const effectiveUserId =
    candidateIdFromUrl || userInfo?.UserID;
  const isInstituteUser = Number(userInfo?.UserTypeID) === 61;
  const canEdit = isInstituteUser || !isLocked;
  const { color } = useContext(ThemeContext);



  // ✅ NEW STATE FOR ELIGIBILITY CHECK
  const [isUnlockAllowed, setIsUnlockAllowed] = useState(true);
  const [unlockNotAllowedReason, setUnlockNotAllowedReason] = useState("");

  const [qualificationGropup, setQualificationGroup] = useState('');
  const [pageCode, setPageCode] = useState('');

  const [candidateRequiredFieldError, setCandidateRequiredFieldError] = useState("");
  const [candidateRequiredFieldInvalid, setCandidateRequiredFieldInvalid] = useState(false);

  const location = useLocation();


  useEffect(() => {


    if (!userInfo) {
      console.error("No user info found in session");
      Swal.fire({
        icon: 'error',
        title: 'Session Error',
        text: 'Please login again',
      }).then(() => navigate('/login'));
      return;
    }
    const userTypeID = Number(userInfo?.UserTypeID);

    const determinedUserType =
      userTypeID === 61 || userTypeID === 91
        ? "Candidate"
        : "Staff";


    setUserType(determinedUserType);
    setEndpoints(API_ENDPOINTS[determinedUserType]);

    setSummaryData(null);
    setIsLocked(false);
    setVerificationStatus("Not Requested");
    setIsDeclarationChecked(false);
    setError(null);
    setSectorialExpertiseData(null);
    // ✅ RESET ELIGIBILITY FLAGS
    setIsUnlockAllowed(true);
    setUnlockNotAllowedReason("");
  }, []);

  useEffect(() => {
    if (userInfo && endpoints && userType) {
      Promise.all([
        checkLockStatus(),
        fetchSummaryData(),
        fetchSectorialExpertise(),
        checkUnlockEligibility(),// ✅ NEW API CALL
        fetchIP(),
        checkCandidateStaffURL()
      ]);
    }
  }, [userInfo, endpoints, userType]);

  const fetchIP = async () => {
    try {
      const ip = await getDeviceIP();
      setIpAddress(ip);
    } catch (err) {
      console.error("Failed to get IP:", err);
    }
  };

  const getPageCode = (pathname) => {
    // if (pathname === '/Candidate/ApplicationForm') {
    //   return 'PrintAdmissionLetter';
    // }

    // if (pathname === '/Candidate/VerifyToUnlock') {
    //   return 'UnlockApplicationForm';
    // }

    if (pathname === '/Candidate/LockApplicationForm') {
      return 'LockApplicationForm';
    }

    return '';
  };

  const checkCandidateStaffURL = async () => {
    if (!userInfo?.UserID) {
      return;
    }
    if (Number(userInfo.UserTypeID) === 61) {
      return;
    }
    let response;
    const pageCode = getPageCode(location.pathname);
    if (userInfo?.UserTypeID == 91) {
      response = await agent.get(`${CheckCandidateURL}?candidateId=${userInfo.UserID}&pageCode=${pageCode}&userLoginId=${userInfo?.UserLoginID}`);
    } else if (userInfo?.UserTypeID == 95) {
      const payLoad = {
        staffID: userInfo.UserID,
        userLoginID: userInfo.UserLoginID,
        pageCode: pageCode,
        ipAddress: ipAddress

      }
      response = await agent.post(CheckStaffURL, payLoad);
    }

    let IsRightURL;
    let RightURL;
    if (response?.data?.Status == 'Success' && response?.data?.Data) {
      IsRightURL = response?.data?.Data?.IsRightURL;
      RightURL = response?.data?.Data?.RightURL;
    }
    if (IsRightURL === false && RightURL) {
      navigate(RightURL);
    }
  }

  const refreshUserInfo = () => {
    if (!userInfo) {
      setUserType(null);
      setEndpoints(null);
      setSummaryData(null);
      setError("Session expired. Please login again.");
      return;
    }

    const determinedUserType =
      candidateIdFromUrl
        ? "Candidate"
        : userInfo.UserTypeID === 91
          ? "Candidate"
          : "Staff";

    setUserType(determinedUserType);
    setEndpoints(API_ENDPOINTS[determinedUserType]);
  };
  const applicationId = searchParams.get("applicationId");

  const navigateWithCandidateId = (path) => {
    if (isInstituteUser && candidateIdFromUrl) {
      let url = `${path}?candidateId=${candidateIdFromUrl}`;

      if (applicationId) {
        url += `&applicationId=${applicationId}`;
      }

      navigate(url);
    } else {
      navigate(path);
    }
  };

  const checkLockStatus = async () => {
    if (!userInfo || !endpoints) return;

    try {
      const response = await agent.get(`${endpoints.checkLock}?${endpoints.userTypeIDName}=${effectiveUserId}`);

      if (response.data.Status === "Success") {
        const lockData = response.data.Data;
        if (userType === 'Staff') {
          let staffIsLocked = false;
          let staffVerificationStatus = "Not Requested";

          if (typeof lockData === 'boolean') {
            staffIsLocked = lockData;
            staffVerificationStatus = lockData ? "Requested" : "Not Requested";
          } else {
            staffIsLocked = lockData?.IsLocked ?? false;
            staffVerificationStatus = lockData?.VerificationStatus ?? "Not Requested";
          }
          setIsLocked(staffIsLocked);
          setVerificationStatus(staffVerificationStatus);

          if (['Pending', 'Verified', 'Requested'].includes(staffVerificationStatus)) {
            setIsDeclarationChecked(true);
          }
        } else {
          const lockStatus = Boolean(lockData);
          setIsLocked(lockStatus);
          if (lockStatus) {
            setIsDeclarationChecked(true);
          }
        }
      }
    } catch (err) {
      console.error("Error checking lock status:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        refreshUserInfo();
      }
    }
  };

  // ✅ NEW FUNCTION TO CHECK UNLOCK ELIGIBILITY
  const checkUnlockEligibility = async () => {
    if (!userInfo || !endpoints) return;

    try {
      let url = '';

      if (userType === 'Candidate') {
        url = `${endpoints.geteligibilityflag}?candidateId=${effectiveUserId}&UserLoginID=${userInfo.UserLoginID}`;
      } else {
        url = `${endpoints.geteligibilityflag}?StaffID=${userInfo.UserID}&UserLoginID=${userInfo.UserLoginID}`;
      }

      const response = await agent.get(url);

      if (response.data.Status === "Success" && response.data.Data && response.data.Data.length > 0) {
        const eligibilityData = response.data.Data[0];
        const isAllowed = eligibilityData.IsApplicationFormUnlockAllowed ?? true;
        const reason = eligibilityData.ReasonForApplicationFormUnlockNotAllowed ?? "";

        setIsUnlockAllowed(isAllowed);
        setUnlockNotAllowedReason(reason);

      } else {
        // Default to allowed if API fails or returns no data
        setIsUnlockAllowed(true);
        setUnlockNotAllowedReason("");
      }
    } catch (err) {
      console.error("Error checking unlock eligibility:", err);
      // Default to allowed on error to prevent blocking legitimate users
      setIsUnlockAllowed(true);
      setUnlockNotAllowedReason("");

      if (err.response?.status === 401 || err.response?.status === 403) {
        refreshUserInfo();
      }
    }
  };

  const checkCandidateRequiredFields = (data) => {
    if (userType !== "Candidate") {
      return {
        isAllowed: true,
        reason: ""
      };
    }

    const requiredFields = data?.CandidateCheckRequiredFields;

    if (!requiredFields) {
      return {
        isAllowed: true,
        reason: ""
      };
    }

    const isEligible = requiredFields.IsEligible === true ||
      requiredFields.IsEligible === 1;

    return {
      isAllowed: isEligible,
      reason: requiredFields.ErrorMsg || ""
    };
  };

  const fetchSummaryData = async () => {
    if (!userInfo || !endpoints || !userType) return;

    try {
      startLoading();

      if (userType === 'Staff') {
        const requestBody = {
          StaffID: userInfo.UserID,
          UserLoginID: userInfo.UserLoginID,
          PageCode: "1",
          IPAddress: ipAddress
        };

        const response = await agent.post(endpoints.getSummary, requestBody);

        if (response.data.Status === "Success") {
          setSummaryData(response.data.Data);
        } else {
          setError(response.data.Message);
        }
      } else {
        const url = `${endpoints.getSummary}?${endpoints.idParam}=${effectiveUserId}&pageCode=1`;
        const response = await agent.get(url);



        if (response.data.Status === "Success") {
          const summary = response.data.Data;

          setSummaryData(summary);

          if (userType === "Candidate") {
            const requiredFields = summary?.CandidateCheckRequiredFields;

            if (requiredFields) {
              const isEligible =
                requiredFields.IsEligible === true ||
                requiredFields.IsEligible === 1;

              setCandidateRequiredFieldInvalid(!isEligible);

              setCandidateRequiredFieldError(
                isEligible ? "" : (requiredFields.ErrorMsg || "")
              );

              // Required fields should control Candidate unlock
              // if (!isEligible) {
              //   setIsUnlockAllowed(false);
              // }
            }
          }
          const qualificationList =
            response.data.Data?.CandidateQualificationSummaryList;

          if (qualificationList?.length > 0) {

            setQualificationGroup(qualificationList[0].QualificationGroup);
          } else {
            setQualificationGroup(null);
          }
        } else {
          setError(response.data.Message);
        }
      }
    } catch (err) {
      setError("Failed to fetch summary data");
      console.error("Error fetching summary:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        refreshUserInfo();
      }
    } finally {
      stopLoading();
    }
  };

  const fetchSectorialExpertise = async () => {
    if (!userInfo || userType !== 'Staff') return;

    try {
      const response = await agent.get(`${GetStaffSectorialExpertiseList}?StaffID=${userInfo.UserID}`);


      if (response.data.Status === "Success" && Array.isArray(response.data.Data) && response.data.Data.length > 0) {
        const firstItem = response.data.Data[0];
        const isSectorialExp = (firstItem.IsSectorialExperience || "").toString().trim();

        if (isSectorialExp === "0" || isSectorialExp === "-1") {
          setSectorialExpertiseData("NA");
        } else if (isSectorialExp === "1") {
          setSectorialExpertiseData(response.data.Data);
        } else {
          setSectorialExpertiseData(null);
        }
      } else {
        setSectorialExpertiseData(null);
      }
    } catch (err) {
      console.error("Error fetching sectorial expertise:", err);
      setSectorialExpertiseData(null);
    }
  };

  const handleLockForm = async () => {
    if (!userInfo || !endpoints) return;

    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'You want to lock the form? This action will prevent editing.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, lock it!'
      });

      if (!result.isConfirmed) return;

      const requestData = {
        [endpoints.userTypeIDName]: userInfo.UserID,
        UserLoginID: userInfo.UserLoginID,
        IPAddress: ipAddress,
        PageCode: "1"
      };

      const response = await agent.post(endpoints.lock, requestData);

      if (response.data.Status === "Success") {
        setIsLocked(true);
        await checkLockStatus();
        await checkUnlockEligibility(); // ✅ Refresh eligibility after locking
        await fetchSummaryData();

        Swal.fire('Locked!', 'Your form has been locked successfully.', 'success')
          .then(() => {
            window.location.reload();
          });
      } else {
        setError(response.data.Message);
        Swal.fire('Error!', response.data.Message || 'Failed to lock form', 'error');
      }
    } catch (err) {
      setError("Failed to lock form");
      console.error("Error locking form:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        refreshUserInfo();
      }
      Swal.fire('Error!', 'Failed to lock form. Please try again.', 'error');
    }
  };

  const handleUnlockForm = async () => {
    if (!userInfo || !endpoints) return;

    // ✅ CHECK ELIGIBILITY BEFORE ALLOWING UNLOCK
    if (!isUnlockAllowed) {
      Swal.fire({
        icon: 'error',
        title: 'Unlock Not Allowed',
        text: unlockNotAllowedReason || 'You are not eligible to unlock the application form.',
      });
      return;
    }

    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'You want to unlock the form? This will allow editing again.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, unlock it!'
      });

      if (!result.isConfirmed) return;

      const requestData = {
        [endpoints.userTypeIDName]: userInfo.UserID,
        UserLoginID: userInfo.UserLoginID,
        IPAddress: ipAddress,
        PageCode: "1"
      };

      const response = await agent.post(endpoints.unlock, requestData);

      if (response.data.Status === "Success") {
        setIsLocked(false);
        setIsDeclarationChecked(false);
        await checkLockStatus();
        await checkUnlockEligibility(); // ✅ Refresh eligibility after unlocking
        await fetchSummaryData();

        Swal.fire('Unlocked!', 'Your form has been unlocked successfully.', 'success')
          .then(() => {
            window.location.reload();
          });
      } else {
        setError(response.data.Message);
        Swal.fire('Error!', response.data.Message || 'Failed to unlock form', 'error')
          .then(() => {
            window.location.reload();
          });
      }
    } catch (err) {
      setError("Failed to unlock form");
      console.error("Error unlocking form:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        refreshUserInfo();
      }
      Swal.fire('Error!', 'Failed to unlock form. Please try again.', 'error');
    }
  };

  const handleRequestVerification = async () => {
    if (!userInfo || !endpoints) return;

    try {
      const result = await Swal.fire({
        title: 'Information',
        html: `
                    <div style="text-align: left; padding: 10px;">
                        <ul style="color: red; list-style-position: inside;">
                            <li>Once Request for Verification is submitted, the information on previous pages shall be locked.</li>
                            <li>To edit information on previous pages, withdraw Request for Verification.</li>
                            <li>Request for Verification cannot be withdrawn after Verification by Board</li>
                        </ul>
                        <p style="color: red; font-weight: bold; margin-top: 15px;">Are you sure you want to Request for Verification</p>
                    </div>
                `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#28a745',
        cancelButtonColor: '#dc3545',
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        customClass: {
          popup: 'swal-wide',
          htmlContainer: 'swal-text-left'
        }
      });

      if (!result.isConfirmed) return;

      const requestData = {
        [endpoints.userTypeIDName]: userInfo.UserID,
        UserLoginID: userInfo.UserLoginID,
        IPAddress: ipAddress,
        PageCode: "1"
      };

      const response = await agent.post(endpoints.requestVerification, requestData);

      if (response.data.Status === "Success") {
        await checkLockStatus();
        await checkUnlockEligibility(); // ✅ Refresh eligibility after requesting verification
        await fetchSummaryData();

        Swal.fire('Success!', 'Your verification request has been submitted successfully.', 'success')
          .then(() => {
            window.location.reload();
          });
      } else {
        setError(response.data.Message);
        Swal.fire('Error!', response.data.Message || 'Failed to request verification', 'error');
      }
    } catch (err) {
      setError("Failed to request verification");
      console.error("Error requesting verification:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        refreshUserInfo();
      }
      Swal.fire('Error!', 'Failed to request verification. Please try again.', 'error');
    }
  };

  const handleWithdrawVerification = async () => {
    if (!userInfo || !endpoints) return;

    // ✅ CHECK ELIGIBILITY BEFORE ALLOWING WITHDRAW
    if (!isUnlockAllowed) {
      Swal.fire({
        icon: 'error',
        title: 'Withdraw Not Allowed',
        text: unlockNotAllowedReason || 'You are not eligible to withdraw the verification request.',
      });
      return;
    }

    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'You want to withdraw the verification request? This will unlock the form for editing.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, withdraw it!'
      });

      if (!result.isConfirmed) return;

      const requestData = {
        [endpoints.userTypeIDName]: userInfo.UserID,
        UserLoginID: userInfo.UserLoginID,
        IPAddress: ipAddress,
        PageCode: "1"
      };

      const response = await agent.post(endpoints.withdrawVerification, requestData);

      if (response.data.Status === "Success") {
        await checkLockStatus();
        await checkUnlockEligibility(); // ✅ Refresh eligibility after withdrawing
        await fetchSummaryData();

        Swal.fire('Withdrawn!', 'Your verification request has been withdrawn successfully.', 'success')
          .then(() => {
            window.location.reload();
          });
      } else {
        setError(response.data.Message);
        Swal.fire('Error!', response.data.Message || 'Failed to withdraw verification', 'error')
          .then(() => {
            window.location.reload();
          });
      }
    } catch (err) {
      setError("Failed to withdraw verification");
      console.error("Error withdrawing verification:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        refreshUserInfo();
      }
      Swal.fire('Error!', 'Failed to withdraw verification. Please try again.', 'error');
    }
  };

  const handleEdit = (route) => {
    if (isInstituteUser) {
      navigateWithCandidateId(route);
      return;
    }
    if (userType === 'Candidate') {
      if (isLocked) {
        Swal.fire({
          icon: 'error',
          title: 'Form Locked',
          text: 'Please unlock the form first before editing.',
        });
        return;
      }
    } else {
      if (isLocked || verificationStatus !== "Not Requested") {
        Swal.fire({
          icon: 'error',
          title: 'Form Locked',
          text: 'Please withdraw verification request first before editing.',
        });
        return;
      }
    }

    navigate(route);
  };

  const handlePrintProfile = () => {
    const profileID = userInfo?.UserLoginID;

    if (!profileID) {
      Swal.fire("Info", "No Profile ID available", "info");
      return;
    }

    const staffID = userInfo?.UserID;
    const candidateID = userInfo?.UserID;


    if (!staffID) {
      Swal.fire("Error", "Staff ID not found", "error");
      return;
    }

    const printWindow = window.open('', '_blank', 'width=1200,height=800,left=100,top=100');

    if (!printWindow) {
      Swal.fire("Error", "Please allow pop-ups for this website", "error");
      return;
    }

    printWindow.document.write(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Profile - ${profileID}</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet">
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
                <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@100;200;300;400;500;600;700;800;900&display=swap" rel="stylesheet">
                <style>
                    body { font-family: 'Poppins', sans-serif; margin: 0; padding: 0; }
                    #root { width: 100%; }
                    /* Staff_PrintApplicationForm.css */

body {
    line-height: normal;
}

.staff-print-application-form {
    font-family: 'Poppins', sans-serif;
    padding: 20px;
    background-color: #fff;
}

.application-form {
    width: 100%;
    font-size: 12px;
    border: 1px solid #c5d3d3;
    margin-bottom: 0px;
}

    .application-form th {
        background-color: #f0f1f4;
        border: 1px solid #c5d3d3;
        font-weight: 600;
        color: #000;
        padding: 0.25rem;
    }

    .application-form td {
        border: 1px solid #c5d3d3;
        vertical-align: middle;
        color: #000;
        padding: 0.25rem;
    }

.table {
    margin: 0px;
}

    .table th {
        padding: 0.25rem;
    }

    .table td {
        padding: 0.25rem;
    }

.GridView {
    margin: 0px;
    width: 100%;
}

    .GridView th {
        border: 1px solid #eeeeee;
        padding: 3px;
        font-size: 12px;
        font-weight: 500;
        vertical-align: middle;
        background-color: #f0f1f4;
    }

    .GridView td {
        border: 1px solid #eeeeee;
        padding: 3px;
        font-size: 12px;
    }

.sub-title {
    font-size: 12px;
}

.main-title {
    font-size: 14px;
}

.main-title1 {
    font-size: 18px;
    font-weight: 600;
}

.labelFont {
    font-weight: 600 !important;
}

.text-lg {
    font-size: 16px;
}

.empty-data {
    text-align: center;
    padding: 20px;
    font-size: 14px;
    font-weight: 600;
    color: #666;
}

/* Action Buttons */
.action-buttons {
    display: flex;
    justify-content: center;
    gap: 15px;
    margin-bottom: 20px;
    padding: 15px;
    background-color: #f8f9fa;
    border-radius: 8px;
}

    .action-buttons .btn {
        padding: 10px 20px;
        font-size: 14px;
        font-weight: 500;
        border-radius: 6px;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: all 0.3s ease;
    }

        .action-buttons .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }

    .action-buttons .btn-secondary {
        background-color: #6c757d;
        border-color: #6c757d;
        color: #fff;
    }

    .action-buttons .btn-primary {
        background-color: #0d6efd;
        border-color: #0d6efd;
        color: #fff;
    }

    .action-buttons .btn-danger {
        background-color: #dc3545;
        border-color: #dc3545;
        color: #fff;
    }

/* Loading and Error States */
.loading-container,
.error-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 400px;
    padding: 20px;
}

    .error-container .alert {
        max-width: 600px;
        width: 100%;
    }

/* Print Styles */
@media print {
    .no-print {
        display: none !important;
    }

    .staff-print-application-form {
        padding: 0;
    }

    body {
        margin: 0;
        padding: 0;
    }

    .application-form {
        page-break-inside: avoid;
    }

    table {
        page-break-inside: auto;
    }

    tr {
        page-break-inside: avoid;
        page-break-after: auto;
    }
}
.sub-title {
    font-size: 12px;
}.main-title {
    font-size: 14px;
}.main-title1 {
    font-size: 18px;
}
.logo-image {
    width: 90px;
}
.india-logo {
    width: 60px;
}
.me-3 {
    margin-right: 1rem !important;
}
/* Responsive adjustments */
@media screen and (max-width: 768px) {
    .application-form {
        font-size: 10px;
    }

    .action-buttons {
        flex-direction: column;
    }

        .action-buttons .btn {
            width: 100%;
            justify-content: center;
        }
}

                </style>
            </head>
           <body>
                <div id="root">Loading...</div>
            </body>
            </html>
        `);

    printWindow.document.close();

    printWindow.onload = () => {
      const container = printWindow.document.getElementById('root');
      const root = ReactDOM.createRoot(container);

      const handleReadyToPrint = () => {
        setTimeout(() => {
          printWindow.focus();
          printWindow.print();
        }, 300);
      };

      if (userInfo?.UserTypeID === 91) {
        root.render(
          <Candidate_PrintApplicationForm
            candidateID={candidateID}
            userLoginID={profileID}
            pageCode="CANDIDATE_PRINT"
            onReadyToPrint={handleReadyToPrint}
          />
        );
      } else if (userInfo?.UserTypeID === 95) {
        root.render(
          <Staff_PrintApplicationForm
            staffID={staffID}
            userLoginID={profileID}
            pageCode="STAFF_PRINT"
            onReadyToPrint={handleReadyToPrint}
          />
        );
      }
    };
  };

  const handleStaffPrintProfile = () => {
    const profileID = userInfo?.UserLoginID;

    if (!profileID) {
      Swal.fire("Info", "No Profile ID available", "info");
      return;
    }

    const staffID = userInfo?.UserID;
    const candidateID = userInfo?.UserID;

    if (!staffID && !candidateID) {
      Swal.fire("Error", "User ID not found", "error");
      return;
    }

    // Determine the route based on user type
    let route;
    if (userInfo?.UserTypeID === 91) {
      route = `/React/Candidate_PrintApplicationForm?candidateID=${candidateID}&userLoginID=${profileID}`;
    } else if (userInfo?.UserTypeID === 95) {
      route = `/React/StaffPrintApplicationForm?staffID=${staffID}&userLoginID=${profileID}`;
    } else {
      Swal.fire("Error", "Unsupported user type", "error");
      return;
    }

    // Open in new window using URL approach (works with Router context)
    window.open(
      route,
      "PrintWindow",
      "width=900,height=700,top=100,left=200,scrollbars=yes,resizable=yes"
    );
  };

  if (error) {
    return <div className="text-red-600 text-center p-4">{error}</div>;
  }

  if (!userInfo || !endpoints || !userType) {
    return <div className="text-center p-4">Loading user information...</div>;
  }

  if (!summaryData) {
    return <div className="text-center p-4">Loading summary data...</div>;
  }

  const isCandidate = userType === 'Candidate';


  const {
    CandidateApplicationStatusSummary,
    CandidatePrimarySummary,
    CandidateAddressSummary,
    CandidateParentSummary,
    CandidateCategorySummary,
    CandidateQualificationSummaryList,
    CandidateAdditionalSummary,
    CandidateLanguageSummaryList,
    CandidateBankSummary,
    CandidateWorkExperienceSummaryList,
    CandidateTrainingSummaryList
  } = summaryData;


  const {
    StaffApplicationStatusSummary,
    StaffPrimarySummary,
    StaffAddressSummary,
    StaffParentSummary,
    StaffCategorySummary,
    StaffQualificationSummaryList,
    StaffAdditionalSummary,
    StaffLanguageSummaryList,
    StaffBankSummary,
    StaffWorkExperienceSummaryList,
    StaffSectoralExpertiseSummaryList,
    StaffTrainingSummaryList
  } = summaryData;

  const primaryData = isCandidate ? CandidatePrimarySummary : StaffPrimarySummary;
  const applicationStatusData = isCandidate ? CandidateApplicationStatusSummary : StaffApplicationStatusSummary;
  const addressData = isCandidate ? CandidateAddressSummary : StaffAddressSummary;
  const parentData = isCandidate ? CandidateParentSummary : StaffParentSummary;
  const categoryData = isCandidate ? CandidateCategorySummary : StaffCategorySummary;
  const qualificationData = isCandidate ? CandidateQualificationSummaryList : StaffQualificationSummaryList;
  const additionalData = isCandidate ? CandidateAdditionalSummary : StaffAdditionalSummary;
  const languageData = isCandidate ? CandidateLanguageSummaryList : StaffLanguageSummaryList;
  const bankData = isCandidate ? CandidateBankSummary : StaffBankSummary;
  const workExperienceData = isCandidate ? CandidateWorkExperienceSummaryList : StaffWorkExperienceSummaryList;
  const trainingData = isCandidate ? CandidateTrainingSummaryList : StaffTrainingSummaryList;



  const renderSectionHeader = (title, filled, editRoute) => (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        {!isInstituteUser && ((isCandidate && !isLocked) || (!isCandidate && !isLocked && verificationStatus === "Not Requested")) && (
          <button
            onClick={() => handleEdit(editRoute)}
            className="text-blue-600 mr-3"
          >
            <Edit size={20} />
          </button>
        )}

        {isInstituteUser || ((isCandidate && !isLocked) || (!isCandidate && !isLocked && verificationStatus === "Not Requested")) && (
          filled ? <Check className="text-blue-600" size={20} /> : <X className="text-gray-400" size={20} />
        )}

        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
    </div>
  );

  const hasBankData = [
    bankData?.AccountType,
    bankData?.AccountNo,
    bankData?.AccountHolderName,
    bankData?.IFSCCode,
    bankData?.BankName,
    bankData?.BranchName,
    bankData?.PANNo
  ].some(value => value && value.toString().trim() !== "");

  const validTrainingData = Array.isArray(trainingData)
    ? trainingData.filter((training) => {
      const values = [
        training?.Course,
        training?.CourseConductedBy,
        training?.CertificatePath
      ];

      return values.some((value) => {
        if (value === null || value === undefined) return false;

        const text = value.toString().trim().toLowerCase();

        return text !== "" && text !== "na" && text !== "n/a" && text !== "-";
      });
    })
    : [];

  const validWorkExperienceData = Array.isArray(workExperienceData)
    ? workExperienceData.filter((exp) => {
      const values = [
        exp?.EstablishmentName,
        exp?.Address,
        exp?.JobRole
      ];

      return values.some((value) => {
        if (value === null || value === undefined) return false;

        const text = value.toString().trim().toLowerCase();

        return (
          text !== "" &&
          text !== "na" &&
          text !== "n/a" &&
          text !== "-"
        );
      });
    })
    : [];

  return (
    <div className="max-w-full mx-auto p-6 bg-white">
      {/* ProgressTracker */}
      {(isInstituteUser ||
        (isCandidate && !isLocked) ||
        (!isCandidate &&
          verificationStatus === "Not Requested" &&
          !isLocked)) && (
          <div className="mb-6">
            <ProgressTracker />
          </div>
        )}

      {!isInstituteUser && userInfo?.UserTypeID != 95 &&
        isLocked &&
        !isUnlockAllowed &&
        unlockNotAllowedReason && (
          <div className="mt-4 rounded-md border border-blue-200 bg-blue-50 p-4 mb-2">
            <div className="alert alert-warning" role="alert">
              <strong className="text-blue-700">Unlock Not Allowed: </strong>
              <span className="text-sm text-blue-600">
                {unlockNotAllowedReason}
              </span>
            </div>
          </div>
        )}

      {userType === "Candidate" &&
        isLocked &&
        candidateRequiredFieldInvalid &&
        candidateRequiredFieldError && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-4 mb-2">
            <div className="alert alert-danger" role="alert">
              <strong className="text-red-700">
                Required Details Missing:
              </strong>

              <div
                className="text-sm text-red-600 mt-1"
                dangerouslySetInnerHTML={{
                  __html: candidateRequiredFieldError
                }}
              />
            </div>
          </div>
        )}

      {/* VERIFICATION SECTION - Only this uses fieldset/legend */}
      <fieldset className="mb-4 rounded-md border p-4">
        <legend
          className={`flex ${color} items-center text-base font-semibold text-white border-2 border-gray-300 px-3 py-1.5 rounded-md ml-4`}
        >
          {location.pathname === '/Candidate/ApplicationForm'
            ? 'Profile Form'
            : location.pathname === '/Candidate/VerifyToUnlock'
              ? 'Unlock Profile Form'
              : 'Verification'}
        </legend>

        <div className="mt-4 flex flex-col items-center gap-3">

          {!isInstituteUser && (
            <button
              onClick={userInfo?.UserTypeID == 91 ? handlePrintProfile : handleStaffPrintProfile}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md font-medium text-sm hover:bg-green-700 transition-colors"
            >
              <FileText size={18} />
              Print Profile
            </button>
          )}


          <div className="w-full flex justify-center items-center">
            <span className="text-gray-900 text-base">
              Profile ID :
              <span className="font-bold ml-1">
                {isInstituteUser
                  ? primaryData?.ApplicationID ||
                  applicationStatusData?.ConfirmedBy
                  : userInfo?.UserLoginID}
              </span>
            </span>
          </div>

          {/* Lock Status */}
          {!isInstituteUser &&
            (isCandidate
              ? isLocked && (
                <div className="flex items-center gap-2 mt-2">
                  <Lock className="text-red-500" size={18} />
                  <span className="text-red-500 font-medium text-sm">
                    Form is locked
                  </span>
                </div>
              )
              : (isLocked || verificationStatus !== "Not Requested") && userInfo?.UserTypeID != 95 && (
                <div className="flex flex-col items-center gap-2 mt-2">
                  <div className="flex items-center gap-2">
                    <Lock className="text-red-500" size={18} />
                    <span className="text-red-500 font-medium text-sm">
                      {verificationStatus === "Verified"
                        ? "Form is verified and locked"
                        : "Verification request pending - Form is locked"}
                    </span>
                  </div>

                  {verificationStatus === "Pending" && (
                    <div className="text-orange-600 text-xs font-medium mt-1">
                      To edit information, please withdraw verification
                      request
                    </div>
                  )}
                </div>
              ))}
        </div>

        {/* PRIMARY DETAILS SECTION */}
        {primaryData && (
          <div className="mb-6">
            <div
              className={`flex items-center gap-2 mb-2 ${!isLocked ? "cursor-pointer" : "cursor-default"}`}
              onClick={
                !isLocked || isInstituteUser
                  ? () => navigateWithCandidateId(`/${userType}/Primary`)
                  : undefined
              }
            >
              {canEdit && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-blue-600"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M21,12a1,1,0,0,0-1,1v6a1,1,0,0,1-1,1H5a1,1,0,0,1-1-1V5A1,1,0,0,1,5,4h6a1,1,0,0,0,0-2H5A3,3,0,0,0,2,5V19a3,3,0,0,0,3,3H19a3,3,0,0,0,3-3V13A1,1,0,0,0,21,12ZM6,12.76V17a1,1,0,0,0,1,1h4.24a1,1,0,0,0,.71-.29l6.92-6.93h0L21.71,8a1,1,0,0,0,0-1.42L17.47,2.29a1,1,0,0,0-1.42,0L13.23,5.12h0L6.29,12.05A1,1,0,0,0,6,12.76ZM16.76,4.41l2.83,2.83L18.17,8.66,15.34,5.83ZM8,13.17l5.93-5.93,2.83,2.83L10.83,16H8Z" />
                </svg>
              )}
              <h2 className="text-blue-600 font-semibold text-base">
                Primary Details
              </h2>
            </div>

            <hr className="border-gray-300 mb-4" />

            <div className="relative">
              <div className="absolute right-8 top-0 flex flex-col gap-4">
                <div className="text-center">
                  <img
                    src={primaryData.PhotoFilePath}
                    alt="Photo"
                    style={{ width: "110px", height: "140px" }}
                    className="object-cover"
                    onError={(e) => {
                      e.target.src = "/no-photo.png";
                    }}
                  />
                </div>
                <div className="text-center">
                  <img
                    src={primaryData.SignFilePath}
                    alt="Signature"
                    style={{ width: "110px", height: "57px" }}
                    className="object-contain bg-white mb-2"
                    onError={(e) => {
                      e.target.src = "/no-sign.png";
                    }}
                  />
                </div>
              </div>

              <div className="mr-52 flex flex-col items-center space-y-1">
                <div className="flex items-center justify-center text-sm">
                  <span
                    className="text-gray-700 text-right"
                    style={{ minWidth: "220px" }}
                  >
                    {isCandidate ? "Candidate's" : "Staff's"} Name
                  </span>
                  <span className="text-gray-700 mx-2">:</span>
                  <span
                    className="font-bold text-gray-900 text-left"
                    style={{ minWidth: "250px" }}
                  >
                    {primaryData.FirstName} {primaryData.MiddleName}{" "}
                    {primaryData.LastName}
                  </span>
                </div>
                {!isCandidate && (
                  <div className="flex items-center justify-center text-sm">
                    <span
                      className="text-gray-700 text-right"
                      style={{ minWidth: "220px" }}
                    >
                      Job Role
                    </span>
                    <span className="text-gray-700 mx-2">:</span>
                    <span
                      className="font-bold text-gray-900 text-left"
                      style={{ minWidth: "250px" }}
                    >
                      {primaryData.JobRoles || "-"}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-center text-sm">
                  <span
                    className="text-gray-700 text-right"
                    style={{ minWidth: "220px" }}
                  >
                    Gender
                  </span>
                  <span className="text-gray-700 mx-2">:</span>
                  <span
                    className="font-bold text-gray-900 text-left"
                    style={{ minWidth: "250px" }}
                  >
                    {primaryData.Gender}
                  </span>
                </div>
                <div className="flex items-center justify-center text-sm">
                  <span
                    className="text-gray-700 text-right"
                    style={{ minWidth: "220px" }}
                  >
                    Date Of Birth (DD/MM/YYYY)
                  </span>
                  <span className="text-gray-700 mx-2">:</span>
                  <span
                    className="font-bold text-gray-900 text-left"
                    style={{ minWidth: "250px" }}
                  >
                    {primaryData.DOB}
                  </span>
                </div>
                <div className="flex items-center justify-center text-sm">
                  <span
                    className="text-gray-700 text-right"
                    style={{ minWidth: "220px" }}
                  >
                    Aadhaar Number
                  </span>
                  <span className="text-gray-700 mx-2">:</span>
                  <span
                    className="font-bold text-gray-900 text-left"
                    style={{ minWidth: "250px" }}
                  >
                    {maskString(primaryData.AadhaarNo)}
                  </span>
                </div>
                <div className="flex items-center justify-center text-sm">
                  <span
                    className="text-gray-700 text-right"
                    style={{ minWidth: "220px" }}
                  >
                    Primary Mobile Number
                  </span>
                  <span className="text-gray-700 mx-2">:</span>
                  <span
                    className="font-bold text-gray-900 text-left"
                    style={{ minWidth: "250px" }}
                  >
                    {primaryData.MobileNo}
                  </span>
                </div>
                <div className="flex items-center justify-center text-sm">
                  <span
                    className="text-gray-700 text-right"
                    style={{ minWidth: "220px" }}
                  >
                    Secondary Mobile Number
                  </span>
                  <span className="text-gray-700 mx-2">:</span>
                  <span
                    className="font-bold text-gray-900 text-left"
                    style={{ minWidth: "250px" }}
                  >
                    {primaryData.AltMobileNo || "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-center text-sm">
                  <span
                    className="text-gray-700 text-right"
                    style={{ minWidth: "220px" }}
                  >
                    E-Mail ID
                  </span>
                  <span className="text-gray-700 mx-2">:</span>
                  <span
                    className="font-bold text-gray-900 text-left"
                    style={{ minWidth: "250px" }}
                  >
                    {primaryData.EMailID}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {addressData && (
          <div className="mb-6">
            <div
              className={`flex items-center gap-2 mb-2 ${!isLocked || isInstituteUser
                ? "cursor-pointer"
                : "cursor-default"
                }`}
              onClick={
                canEdit
                  ? () => navigateWithCandidateId(`/${userType}/Address`)
                  : undefined
              }
            >
              {canEdit && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-blue-600"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M21,12a1,1,0,0,0-1,1v6a1,1,0,0,1-1,1H5a1,1,0,0,1-1-1V5A1,1,0,0,1,5,4h6a1,1,0,0,0,0-2H5A3,3,0,0,0,2,5V19a3,3,0,0,0,3,3H19a3,3,0,0,0,3-3V13A1,1,0,0,0,21,12ZM6,12.76V17a1,1,0,0,0,1,1h4.24a1,1,0,0,0,.71-.29l6.92-6.93h0L21.71,8a1,1,0,0,0,0-1.42L17.47,2.29a1,1,0,0,0-1.42,0L13.23,5.12h0L6.29,12.05A1,1,0,0,0,6,12.76ZM16.76,4.41l2.83,2.83L18.17,8.66,15.34,5.83ZM8,13.17l5.93-5.93,2.83,2.83L10.83,16H8Z" />
                </svg>
              )}
              <h2 className="text-blue-600 font-semibold text-base">
                Permanent Address
              </h2>
            </div>

            <hr className="border-gray-300 mb-4" />

            <div className="flex flex-col items-center space-y-1 text-sm">
              <div className="grid grid-cols-[120px_20px_250px_120px_20px_250px] items-center">
                <span className="text-gray-700 text-right">Address</span>
                <span className="text-gray-700 text-center">:</span>
                <span className="font-bold text-gray-900 text-left col-span-4">
                  {addressData.PAddress}
                </span>
              </div>

              <div className="grid grid-cols-[120px_20px_250px_120px_20px_250px] items-center">
                <span className="text-gray-700 text-right">State</span>
                <span className="text-gray-700 text-center">:</span>
                <span className="font-bold text-gray-900 text-left">
                  {addressData.PState}
                </span>

                <span className="text-gray-700 text-right">District</span>
                <span className="text-gray-700 text-center">:</span>
                <span className="font-bold text-gray-900 text-left">
                  {addressData.PDistrict}
                </span>
              </div>

              <div className="grid grid-cols-[120px_20px_250px_120px_20px_250px] items-center">
                <span className="text-gray-700 text-right">Taluka</span>
                <span className="text-gray-700 text-center">:</span>
                <span className="font-bold text-gray-900 text-left">
                  {addressData.PTaluka}
                </span>

                <span className="text-gray-700 text-right">City / Village</span>
                <span className="text-gray-700 text-center">:</span>
                <span className="font-bold text-gray-900 text-left">
                  {addressData.PCity}
                </span>
              </div>

              <div className="grid grid-cols-[120px_20px_250px_120px_20px_250px] items-center">
                <span className="text-gray-700 text-right">Pin Code</span>
                <span className="text-gray-700 text-center">:</span>
                <span className="font-bold text-gray-900 text-left">
                  {addressData.PPincode}
                </span>
              </div>
            </div>
          </div>
        )}

        {addressData && (
          <div className="mb-6">
            <div
              className={`flex items-center gap-2 mb-2 ${!isLocked ? "cursor-pointer" : "cursor-default"}`}
              onClick={
                canEdit
                  ? () => navigateWithCandidateId(`/${userType}/address`)
                  : undefined
              }
            >
              {canEdit && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-blue-600"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M21,12a1,1,0,0,0-1,1v6a1,1,0,0,1-1,1H5a1,1,0,0,1-1-1V5A1,1,0,0,1,5,4h6a1,1,0,0,0,0-2H5A3,3,0,0,0,2,5V19a3,3,0,0,0,3,3H19a3,3,0,0,0,3-3V13A1,1,0,0,0,21,12ZM6,12.76V17a1,1,0,0,0,1,1h4.24a1,1,0,0,0,.71-.29l6.92-6.93h0L21.71,8a1,1,0,0,0,0-1.42L17.47,2.29a1,1,0,0,0-1.42,0L13.23,5.12h0L6.29,12.05A1,1,0,0,0,6,12.76ZM16.76,4.41l2.83,2.83L18.17,8.66,15.34,5.83ZM8,13.17l5.93-5.93,2.83,2.83L10.83,16H8Z" />
                </svg>
              )}
              <h2 className="text-blue-600 font-semibold text-base">
                Correspondence Address
              </h2>
            </div>

            <hr className="border-gray-300 mb-4" />

            <div className="flex flex-col items-center space-y-1 text-sm">
              <div className="grid grid-cols-[120px_20px_250px_120px_20px_250px] items-center">
                <span className="text-gray-700 text-right">Address</span>
                <span className="text-gray-700 text-center">:</span>
                <span className="font-bold text-gray-900 text-left col-span-4">
                  {addressData.CAddress}
                </span>
              </div>

              <div className="grid grid-cols-[120px_20px_250px_120px_20px_250px] items-center">
                <span className="text-gray-700 text-right">State</span>
                <span className="text-gray-700 text-center">:</span>
                <span className="font-bold text-gray-900 text-left">
                  {addressData.CState}
                </span>

                <span className="text-gray-700 text-right">District</span>
                <span className="text-gray-700 text-center">:</span>
                <span className="font-bold text-gray-900 text-left">
                  {addressData.CDistrict}
                </span>
              </div>

              <div className="grid grid-cols-[120px_20px_250px_120px_20px_250px] items-center">
                <span className="text-gray-700 text-right">Taluka</span>
                <span className="text-gray-700 text-center">:</span>
                <span className="font-bold text-gray-900 text-left">
                  {addressData.CTaluka}
                </span>

                <span className="text-gray-700 text-right">City / Village</span>
                <span className="text-gray-700 text-center">:</span>
                <span className="font-bold text-gray-900 text-left">
                  {addressData.CCity}
                </span>
              </div>

              <div className="grid grid-cols-[120px_20px_250px_120px_20px_250px] items-center">
                <span className="text-gray-700 text-right">Pin Code</span>
                <span className="text-gray-700 text-center">:</span>
                <span className="font-bold text-gray-900 text-left">
                  {addressData.CPincode}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* PARENT/GUARDIAN DETAILS SECTION */}
        {parentData && (
          <div className="mb-6">
            {/* Header */}
            <div
              className={`flex items-center gap-2 mb-2 ${!isLocked ? "cursor-pointer" : "cursor-default"}`}
              onClick={
                canEdit
                  ? () => navigateWithCandidateId(`/${userType}/parent`)
                  : undefined
              }
            >
              {canEdit && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-blue-600"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M21,12a1,1,0,0,0-1,1v6a1,1,0,0,1-1,1H5a1,1,0,0,1-1-1V5A1,1,0,0,1,5,4h6a1,1,0,0,0,0-2H5A3,3,0,0,0,2,5V19a3,3,0,0,0,3,3H19a3,3,0,0,0,3-3V13A1,1,0,0,0,21,12ZM6,12.76V17a1,1,0,0,0,1,1h4.24a1,1,0,0,0,.71-.29l6.92-6.93h0L21.71,8a1,1,0,0,0,0-1.42L17.47,2.29a1,1,0,0,0-1.42,0L13.23,5.12h0L6.29,12.05A1,1,0,0,0,6,12.76ZM16.76,4.41l2.83,2.83L18.17,8.66,15.34,5.83ZM8,13.17l5.93-5.93,2.83,2.83L10.83,16H8Z" />
                </svg>
              )}
              <h2 className="text-blue-600 font-semibold text-base">
                Parent / Guardian Details
              </h2>
            </div>

            <hr className="border-gray-300 mb-4" />

            <div className="flex flex-col items-center space-y-2 text-sm">
              <div className="grid grid-cols-[180px_20px_200px_180px_20px_200px] items-center">
                <span className="text-gray-700 text-right">
                  Are you Orphan?
                </span>
                <span className="text-gray-700 text-center">:</span>
                <span className="font-bold text-gray-900 text-left col-span-4">
                  {parentData.IsOrphan}
                </span>
              </div>

              <div className="grid grid-cols-[180px_20px_200px_180px_20px_200px] items-center">
                <span className="text-gray-700 text-right">
                  Father's Name
                </span>
                <span className="text-gray-700 text-center">:</span>
                <span className="font-bold text-gray-900 text-left">
                  {parentData.FatherTitle} {parentData.FatherFirstName}{" "}
                  {parentData.FatherMiddleName} {parentData.FatherLastName}
                </span>

                <span className="text-gray-700 text-right">
                  Mother's Name
                </span>
                <span className="text-gray-700 text-center">:</span>
                <span className="font-bold text-gray-900 text-left">
                  {parentData.MotherTitle} {parentData.MotherFirstName}{" "}
                  {parentData.MotherMiddleName} {parentData.MotherLastName}
                </span>
              </div>

              {!isCandidate && (
                <div className="grid grid-cols-[180px_20px_200px_180px_20px_200px] items-center">
                  <span className="text-gray-700 text-right">
                    Marital Status
                  </span>
                  <span className="text-gray-700 text-center">:</span>
                  <span className="font-bold text-gray-900 text-left">
                    {parentData.MaritalStatus}
                  </span>

                  {parentData.MaritalStatus === "Married" ? (
                    <>
                      <span className="text-gray-700 text-right">
                        Spouse Name
                      </span>
                      <span className="text-gray-700 text-center">:</span>
                      <span className="font-bold text-gray-900 text-left">
                        {parentData.SpouseTitle} {parentData.SpouseFirstName}{" "}
                        {parentData.SpouseMiddleName} {parentData.SpouseLastName}
                      </span>
                    </>
                  ) : (
                    <>
                      <span></span>
                      <span></span>
                      <span></span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* CATEGORY DETAILS SECTION */}
        {categoryData && (
          <div className="mb-6">
            <div
              className={`flex items-center gap-2 mb-2 ${!isLocked ? "cursor-pointer" : "cursor-default"}`}
              onClick={
                canEdit
                  ? () => navigateWithCandidateId(`/${userType}/category`)
                  : undefined
              }
            >
              {canEdit && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-blue-600"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M21,12a1,1,0,0,0-1,1v6a1,1,0,0,1-1,1H5a1,1,0,0,1-1-1V5A1,1,0,0,1,5,4h6a1,1,0,0,0,0-2H5A3,3,0,0,0,2,5V19a3,3,0,0,0,3,3H19a3,3,0,0,0,3-3V13A1,1,0,0,0,21,12ZM6,12.76V17a1,1,0,0,0,1,1h4.24a1,1,0,0,0,.71-.29l6.92-6.93h0L21.71,8a1,1,0,0,0,0-1.42L17.47,2.29a1,1,0,0,0-1.42,0L13.23,5.12h0L6.29,12.05A1,1,0,0,0,6,12.76ZM16.76,4.41l2.83,2.83L18.17,8.66,15.34,5.83ZM8,13.17l5.93-5.93,2.83,2.83L10.83,16H8Z" />
                </svg>
              )}
              <h2 className="text-blue-600 font-semibold text-base">
                Category Details
              </h2>
            </div>

            <hr className="border-gray-300 mb-4" />

            <div className="flex flex-col items-center space-y-1 text-sm">
              <div className="grid grid-cols-[280px_20px_180px_280px_20px_180px] items-center">
                <span className="text-gray-700 text-right">
                  Nationality
                </span>
                <span className="text-gray-700 text-center">:</span>
                <span className="font-bold text-gray-900 text-left">
                  {categoryData.Nationality}
                </span>

                <span className="text-gray-700 text-right">
                  Are you Maharashtra Domiciled?
                </span>
                <span className="text-gray-700 text-center">:</span>
                <span className="font-bold text-gray-900 text-left">
                  {categoryData.IsMHDomiciled}
                </span>
              </div>

              <div className="grid grid-cols-[280px_20px_180px_280px_20px_180px] items-center">
                <span className="text-gray-700 text-right">
                  Religion
                </span>
                <span className="text-gray-700 text-center">:</span>
                <span className="font-bold text-gray-900 text-left">
                  {categoryData.Religion}
                </span>

                <span className="text-gray-700 text-right">
                  Caste Category
                </span>
                <span className="text-gray-700 text-center">:</span>
                <span className="font-bold text-gray-900 text-left">
                  {categoryData.Category}
                </span>
              </div>

              <div className="grid grid-cols-[280px_20px_180px_280px_20px_180px] items-center">
                <span className="text-gray-700 text-right">
                  Do you belong to Person with Disability Category?
                </span>
                <span className="text-gray-700 text-center">:</span>
                <span className="font-bold text-gray-900 text-left">
                  {categoryData.IsBelongToPWD}
                </span>

                <span></span>
                <span></span>
                <span></span>
              </div>

              {categoryData.IsBelongToPWD === "Yes" && (
                <>
                  <div className="grid grid-cols-[280px_20px_180px_280px_20px_180px] items-center">
                    <span className="text-gray-700 text-right">
                      Disability Percentage
                    </span>
                    <span className="text-gray-700 text-center">:</span>
                    <span className="font-bold text-gray-900 text-left">
                      {categoryData.DisabilityPercentage}
                    </span>

                    <span className="text-gray-700 text-right">
                      Person With Disability Category
                    </span>
                    <span className="text-gray-700 text-center">:</span>
                    <span className="font-bold text-gray-900 text-left">
                      {categoryData.DisabilityType}
                    </span>
                  </div>

                  <div className="grid grid-cols-[280px_20px_180px_280px_20px_180px] items-center">
                    <span className="text-gray-700 text-right">
                      Type of Disability As Per Certificate
                    </span>
                    <span className="text-gray-700 text-center">:</span>
                    <span className="font-bold text-gray-900 text-left col-span-4">
                      {categoryData.Disability}
                    </span>
                  </div>

                  <div className="grid grid-cols-[280px_20px_180px_280px_20px_180px] items-center">
                    <span className="text-gray-700 text-right">
                      Unique Disability ID Number
                    </span>
                    <span className="text-gray-700 text-center">:</span>
                    <span className="font-bold text-gray-900 text-left col-span-4">
                      {categoryData.UniqueDisabilityIDNo}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* QUALIFICATION DETAILS SECTION */}
        {qualificationData && qualificationData.length > 0 && (
          <div className="mb-6">
            <div
              className={`flex items-center gap-2 mb-2 ${!isLocked ? "cursor-pointer" : "cursor-default"}`}
              onClick={
                canEdit
                  ? () =>
                    navigateWithCandidateId(`/${userType}/Qualification`)
                  : undefined
              }
            >
              {canEdit && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-blue-600"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M21,12a1,1,0,0,0-1,1v6a1,1,0,0,1-1,1H5a1,1,0,0,1-1-1V5A1,1,0,0,1,5,4h6a1,1,0,0,0,0-2H5A3,3,0,0,0,2,5V19a3,3,0,0,0,3,3H19a3,3,0,0,0,3-3V13A1,1,0,0,0,21,12ZM6,12.76V17a1,1,0,0,0,1,1h4.24a1,1,0,0,0,.71-.29l6.92-6.93h0L21.71,8a1,1,0,0,0,0-1.42L17.47,2.29a1,1,0,0,0-1.42,0L13.23,5.12h0L6.29,12.05A1,1,0,0,0,6,12.76ZM16.76,4.41l2.83,2.83L18.17,8.66,15.34,5.83ZM8,13.17l5.93-5.93,2.83,2.83L10.83,16H8Z" />
                </svg>
              )}
              <h2 className="text-blue-600 font-semibold text-base">
                Qualification Details
              </h2>
            </div>

            <hr className="border-gray-300 mb-4" />

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  {qualificationGropup && qualificationGropup !== "B" ? (
                    <tr className="bg-gray-200 border-b border-gray-400">
                      <th className="border border-gray-400 px-3 py-2 text-left font-semibold text-gray-900">
                        {isCandidate
                          ? "Highest Standard Attended"
                          : "Qualification Type"}
                      </th>
                      <th className="border border-gray-400 px-3 py-2 text-left font-semibold text-gray-900">
                        Name Of Degree
                      </th>
                      <th className="border border-gray-400 px-3 py-2 text-left font-semibold text-gray-900">
                        Subject / Branch / Trade
                      </th>
                      <th className="border border-gray-400 px-3 py-2 text-left font-semibold text-gray-900">
                        Board / University
                      </th>
                      <th className="border border-gray-400 px-3 py-2 text-left font-semibold text-gray-900">
                        Marks Obtained
                      </th>
                      <th className="border border-gray-400 px-3 py-2 text-left font-semibold text-gray-900">
                        Maximum Marks
                      </th>
                      <th className="border border-gray-400 px-3 py-2 text-left font-semibold text-gray-900">
                        Class / Grade
                      </th>
                    </tr>
                  ) : (
                    <tr className="bg-gray-200 border-b border-gray-400">
                      <th className="border border-gray-400 px-3 py-2 text-left font-semibold text-gray-900">
                        {isCandidate
                          ? "Highest Standard Attended"
                          : "Qualification Type"}
                      </th>
                      <th className="border border-gray-400 px-3 py-2 text-left font-semibold text-gray-900">
                        Year Of Appearing
                      </th>
                      <th className="border border-gray-400 px-3 py-2 text-left font-semibold text-gray-900">
                        Marks Obtained
                      </th>
                      <th className="border border-gray-400 px-3 py-2 text-left font-semibold text-gray-900">
                        Maximum Marks
                      </th>
                      <th className="border border-gray-400 px-3 py-2 text-left font-semibold text-gray-900">
                        Result
                      </th>
                    </tr>
                  )}
                </thead>
                <tbody>
                  {qualificationData.map((qual, index) => (
                    <tr key={index}>
                      {qualificationGropup && qualificationGropup !== "B" ? (
                        <>
                          <td className="border border-gray-400 px-3 py-2 text-gray-900">
                            {qual.Qualification || qual.Degree}
                          </td>
                          <td className="border border-gray-400 px-3 py-2 text-gray-900">
                            {qual.Degree}
                          </td>
                          <td className="border border-gray-400 px-3 py-2 text-gray-900">
                            {qual.Subject}
                          </td>
                          <td className="border border-gray-400 px-3 py-2 text-gray-900">
                            {qual.University}
                          </td>
                          <td className="border border-gray-400 px-3 py-2 text-gray-900">
                            {qual.MarksObtained}
                          </td>
                          <td className="border border-gray-400 px-3 py-2 text-gray-900">
                            {qual.MaximumMarks}
                          </td>
                          <td className="border border-gray-400 px-3 py-2 text-gray-900">
                            {qual.Class}
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="border border-gray-400 px-3 py-2 text-gray-900">
                            {qual.Qualification || qual.Degree}
                          </td>
                          <td className="border border-gray-400 px-3 py-2 text-gray-900">
                            {qual.AppearingYear}
                          </td>
                          <td className="border border-gray-400 px-3 py-2 text-gray-900">
                            {qual.MarksObtained}
                          </td>
                          <td className="border border-gray-400 px-3 py-2 text-gray-900">
                            {qual.MaximumMarks}
                          </td>
                          <td className="border border-gray-400 px-3 py-2 text-gray-900">
                            {qual.Class}
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TRAINING DETAILS SECTION - STAFF ONLY */}
        {trainingData && (
          <div className="mb-6">
            <div
              className={`flex items-center gap-2 mb-2 ${!isLocked ? "cursor-pointer" : "cursor-default"
                }`}
              onClick={
                canEdit
                  ? () => navigateWithCandidateId(`/${userType}/training`)
                  : undefined
              }
            >
              {canEdit && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-blue-600"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M21,12a1,1,0,0,0-1,1v6a1,1,0,0,1-1,1H5a1,1,0,0,1-1-1V5A1,1,0,0,1,5,4h6a1,1,0,0,0,0-2H5A3,3,0,0,0,2,5V19a3,3,0,0,0,3,3H19a3,3,0,0,0,3-3V13A1,1,0,0,0,21,12ZM6,12.76V17a1,1,0,0,0,1,1h4.24a1,1,0,0,0,.71-.29l6.92-6.93h0L21.71,8a1,1,0,0,0,0-1.42L17.47,2.29a1,1,0,0,0-1.42,0L13.23,5.12h0L6.29,12.05A1,1,0,0,0,6,12.76ZM16.76,4.41l2.83,2.83L18.17,8.66,15.34,5.83ZM8,13.17l5.93-5.93,2.83,2.83L10.83,16H8Z" />
                </svg>
              )}
              <h2 className="text-blue-600 font-semibold text-base">
                Training Details
              </h2>
            </div>

            <hr className="border-gray-300 mb-4" />
            {validTrainingData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-200 border-b border-gray-400">
                      <th className="border px-3 py-2 text-left">Course</th>
                      <th className="border px-3 py-2 text-left">
                        Conducted By
                      </th>
                      <th className="border px-3 py-2 text-left">
                        From Date
                      </th>
                      <th className="border px-3 py-2 text-left">To Date</th>
                      <th className="border px-3 py-2 text-left">
                        Certificate
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {validTrainingData.map((training, index) => (
                      <tr key={index}>
                        <td className="border px-3 py-2">
                          {training.Course}
                        </td>
                        <td className="border px-3 py-2">
                          {training.CourseConductedBy}
                        </td>
                        <td className="border px-3 py-2">
                          {training.FromDate}
                        </td>
                        <td className="border px-3 py-2">
                          {training.ToDate}
                        </td>
                        <td className="border px-3 py-2">
                          {training.CertificatePath &&
                            training.CertificatePath !== "NA" ? (
                            <a
                              href={training.CertificatePath}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              View Certificate
                            </a>
                          ) : (
                            "-"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center text-gray-700 py-3 text-base font-bold border border-gray-400">
                NA
              </div>
            )}
          </div>
        )}

        {/* ADDITIONAL DETAILS SECTION */}
        {additionalData && (
          <div className="mb-6">
            <div
              className={`flex items-center gap-2 mb-2 ${!isLocked ? "cursor-pointer" : "cursor-default"}`}
              onClick={
                canEdit
                  ? () => navigateWithCandidateId(`/${userType}/additional`)
                  : undefined
              }
            >
              {canEdit && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-blue-600"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M21,12a1,1,0,0,0-1,1v6a1,1,0,0,1-1,1H5a1,1,0,0,1-1-1V5A1,1,0,0,1,5,4h6a1,1,0,0,0,0-2H5A3,3,0,0,0,2,5V19a3,3,0,0,0,3,3H19a3,3,0,0,0,3-3V13A1,1,0,0,0,21,12ZM6,12.76V17a1,1,0,0,0,1,1h4.24a1,1,0,0,0,.71-.29l6.92-6.93h0L21.71,8a1,1,0,0,0,0-1.42L17.47,2.29a1,1,0,0,0-1.42,0L13.23,5.12h0L6.29,12.05A1,1,0,0,0,6,12.76ZM16.76,4.41l2.83,2.83L18.17,8.66,15.34,5.83ZM8,13.17l5.93-5.93,2.83,2.83L10.83,16H8Z" />
                </svg>
              )}
              <h2 className="text-blue-600 font-semibold text-base">
                Additional Details
              </h2>
            </div>

            <hr className="border-gray-300 mb-4" />

            <div className="text-center space-y-1 mb-4">
              <div>
                <span className="text-gray-700 text-sm">Blood Group : </span>
                <span className="font-bold text-gray-900 text-sm">
                  {additionalData.BloodGroup}
                </span>
                <span className="ml-12 text-gray-700 text-sm">
                  Mother Tongue :{" "}
                </span>
                <span className="font-bold text-gray-900 text-sm">
                  {additionalData.MotherTongue}
                </span>
              </div>
            </div>

            {languageData && languageData.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-200 border-b border-gray-400">
                      <th className="border border-gray-400 px-3 py-2 text-left font-semibold text-gray-900">
                        Language
                      </th>
                      <th className="border border-gray-400 px-3 py-2 text-left font-semibold text-gray-900">
                        Read
                      </th>
                      <th className="border border-gray-400 px-3 py-2 text-left font-semibold text-gray-900">
                        Write
                      </th>
                      <th className="border border-gray-400 px-3 py-2 text-left font-semibold text-gray-900">
                        Speak
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {languageData.map((lang, index) => (
                      <tr key={index}>
                        <td className="border border-gray-400 px-3 py-2 text-gray-900">
                          {lang.Language}
                        </td>
                        <td className="border border-gray-400 px-3 py-2 text-gray-900">
                          {lang.Read}
                        </td>
                        <td className="border border-gray-400 px-3 py-2 text-gray-900">
                          {lang.Write}
                        </td>
                        <td className="border border-gray-400 px-3 py-2 text-gray-900">
                          {lang.Speak}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* BANK DETAILS SECTION */}
        {bankData && (
          <div className="mb-6">
            <div
              className={`flex items-center gap-2 mb-2 ${!isLocked ? "cursor-pointer" : "cursor-default"}`}
              onClick={
                canEdit
                  ? () => navigateWithCandidateId(`/${userType}/Bank`)
                  : undefined
              }
            >
              {canEdit && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-blue-600"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M21,12a1,1,0,0,0-1,1v6a1,1,0,0,1-1,1H5a1,1,0,0,1-1-1V5A1,1,0,0,1,5,4h6a1,1,0,0,0,0-2H5A3,3,0,0,0,2,5V19a3,3,0,0,0,3,3H19a3,3,0,0,0,3-3V13A1,1,0,0,0,21,12ZM6,12.76V17a1,1,0,0,0,1,1h4.24a1,1,0,0,0,.71-.29l6.92-6.93h0L21.71,8a1,1,0,0,0,0-1.42L17.47,2.29a1,1,0,0,0-1.42,0L13.23,5.12h0L6.29,12.05A1,1,0,0,0,6,12.76ZM16.76,4.41l2.83,2.83L18.17,8.66,15.34,5.83ZM8,13.17l5.93-5.93,2.83,2.83L10.83,16H8Z" />
                </svg>
              )}
              <h2 className="text-blue-600 font-semibold text-base">
                Bank Details
              </h2>
            </div>

            <hr className="border-gray-300 mb-4" />

            <div className="overflow-x-auto">
              {!hasBankData ? (
                <table className="w-full border-collapse text-sm">
                  <tbody>
                    <tr>
                      <td
                        colSpan="6"
                        className="border border-gray-400 px-3 py-3 text-center font-semibold text-gray-900"
                      >
                        N/A
                      </td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <div className="flex flex-col items-center space-y-1">
                  <div className="grid grid-cols-[180px_20px_200px_180px_20px_200px] items-center text-sm">
                    <span className="text-gray-700 text-right">Type Of Account</span>
                    <span className="text-gray-700 text-center">:</span>
                    <span className="font-bold text-gray-900 text-left">
                      {bankData?.AccountType || "N/A"}
                    </span>

                    <span className="text-gray-700 text-right">Account Number</span>
                    <span className="text-gray-700 text-center">:</span>
                    <span className="font-bold text-gray-900 text-left">
                      {bankData?.AccountNo || "N/A"}
                    </span>
                  </div>

                  <div className="grid grid-cols-[180px_20px_200px_180px_20px_200px] items-center text-sm">
                    <span className="text-gray-700 text-right">Name Of Account Holder</span>
                    <span className="text-gray-700 text-center">:</span>
                    <span className="font-bold text-gray-900 text-left">
                      {bankData?.AccountHolderName || "N/A"}
                    </span>

                    <span className="text-gray-700 text-right">Bank IFSC Code</span>
                    <span className="text-gray-700 text-center">:</span>
                    <span className="font-bold text-gray-900 text-left">
                      {bankData?.IFSCCode || "N/A"}
                    </span>
                  </div>

                  <div className="grid grid-cols-[180px_20px_200px_180px_20px_200px] items-center text-sm">
                    <span className="text-gray-700 text-right">Bank Name</span>
                    <span className="text-gray-700 text-center">:</span>
                    <span className="font-bold text-gray-900 text-left">
                      {bankData?.BankName || "N/A"}
                    </span>

                    <span className="text-gray-700 text-right">Branch Name</span>
                    <span className="text-gray-700 text-center">:</span>
                    <span className="font-bold text-gray-900 text-left">
                      {bankData?.BranchName || "N/A"}
                    </span>
                  </div>

                  <div className="grid grid-cols-[180px_20px_200px_180px_20px_200px] items-center text-sm">
                    <span className="text-gray-700 text-right">PAN Number</span>
                    <span className="text-gray-700 text-center">:</span>
                    <span className="font-bold text-gray-900 text-left col-span-4">
                      {bankData?.PANNo || "N/A"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* WORK EXPERIENCE SECTION - STAFF ONLY */}

        <div className="mb-6">
          <div
            className={`flex items-center gap-2 mb-2 ${!isLocked ? "cursor-pointer" : "cursor-default"}`}
            onClick={
              canEdit
                ? () => navigateWithCandidateId(`/${userType}/workexperience`)
                : undefined
            }
          >
            {canEdit && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-blue-600"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M21,12a1,1,0,0,0-1,1v6a1,1,0,0,1-1,1H5a1,1,0,0,1-1-1V5A1,1,0,0,1,5,4h6a1,1,0,0,0,0-2H5A3,3,0,0,0,2,5V19a3,3,0,0,0,3,3H19a3,3,0,0,0,3-3V13A1,1,0,0,0,21,12ZM6,12.76V17a1,1,0,0,0,1,1h4.24a1,1,0,0,0,.71-.29l6.92-6.93h0L21.71,8a1,1,0,0,0,0-1.42L17.47,2.29a1,1,0,0,0-1.42,0L13.23,5.12h0L6.29,12.05A1,1,0,0,0,6,12.76ZM16.76,4.41l2.83,2.83L18.17,8.66,15.34,5.83ZM8,13.17l5.93-5.93,2.83,2.83L10.83,16H8Z" />
              </svg>
            )}
            <h2 className="text-blue-600 font-semibold text-base">
              Work Experience Details
            </h2>
          </div>

          <hr className="border-gray-300 mb-4" />

          {validWorkExperienceData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-200 border-b border-gray-400">
                    <th className="border border-gray-400 px-3 py-2 text-left font-semibold text-gray-900">
                      Name of Establishment
                    </th>
                    <th className="border border-gray-400 px-3 py-2 text-left font-semibold text-gray-900">
                      Address
                    </th>
                    <th className="border border-gray-400 px-3 py-2 text-left font-semibold text-gray-900">
                      Job Role
                    </th>
                    <th className="border border-gray-400 px-3 py-2 text-left font-semibold text-gray-900">
                      From Date
                    </th>
                    <th className="border border-gray-400 px-3 py-2 text-left font-semibold text-gray-900">
                      To Date
                    </th>
                    <th className="border border-gray-400 px-3 py-2 text-left font-semibold text-gray-900">
                      Stipend / Salary Per Month in Rs.
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {validWorkExperienceData.map((exp, index) => (
                    <tr key={index}>
                      <td className="border border-gray-400 px-3 py-2 text-gray-900">
                        {exp.EstablishmentName}
                      </td>
                      <td className="border border-gray-400 px-3 py-2 text-gray-900">
                        {exp.Address}
                      </td>
                      <td className="border border-gray-400 px-3 py-2 text-gray-900">
                        {exp.JobRole}
                      </td>
                      <td className="border border-gray-400 px-3 py-2 text-gray-900">
                        {exp.FromDate}
                      </td>
                      <td className="border border-gray-400 px-3 py-2 text-gray-900">
                        {exp.ToDate}
                      </td>
                      <td className="border border-gray-400 px-3 py-2 text-gray-900">
                        {exp.SalaryPerMonth}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center text-gray-700 py-3 text-base font-bold border border-gray-400">
              NA
            </div>
          )}
        </div>

        {/* SECTORIAL EXPERTISE SECTION - STAFF ONLY */}
        {!isCandidate && (
          <div className="mb-6">
            <div
              className={`flex items-center gap-2 mb-2 ${!isLocked ? "cursor-pointer" : "cursor-default"}`}
              onClick={
                !isLocked
                  ? () => navigateWithCandidateId(`/Staff/SectorialExpertise`)
                  : undefined
              }
            >
              {canEdit && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-blue-600"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M21,12a1,1,0,0,0-1,1v6a1,1,0,0,1-1,1H5a1,1,0,0,1-1-1V5A1,1,0,0,1,5,4h6a1,1,0,0,0,0-2H5A3,3,0,0,0,2,5V19a3,3,0,0,0,3,3H19a3,3,0,0,0,3-3V13A1,1,0,0,0,21,12ZM6,12.76V17a1,1,0,0,0,1,1h4.24a1,1,0,0,0,.71-.29l6.92-6.93h0L21.71,8a1,1,0,0,0,0-1.42L17.47,2.29a1,1,0,0,0-1.42,0L13.23,5.12h0L6.29,12.05A1,1,0,0,0,6,12.76ZM16.76,4.41l2.83,2.83L18.17,8.66,15.34,5.83ZM8,13.17l5.93-5.93,2.83,2.83L10.83,16H8Z" />
                </svg>
              )}
              <h2 className="text-blue-600 font-semibold text-base">
                Sectorial Expertise
              </h2>
            </div>

            <hr className="border-gray-300 mb-4" />

            {sectorialExpertiseData === "NA" ||
              !sectorialExpertiseData ||
              (Array.isArray(sectorialExpertiseData) &&
                sectorialExpertiseData.length === 0) ? (
              <div className="text-center text-gray-700 py-3 text-base font-bold border border-gray-400">
                NA
              </div>
            ) : (
              <div className="text-left px-4">
                <p className="text-sm text-gray-900">
                  {sectorialExpertiseData.map((expertise, index) => (
                    <span key={index}>
                      {expertise.SectorialExpertiseName}
                      {index < sectorialExpertiseData.length - 1 ? ", " : ""}
                    </span>
                  ))}
                </p>
              </div>
            )}
          </div>
        )}

        {/* DECLARATION SECTION */}
        {!isInstituteUser && (
          <div className="mb-6 p-6 border border-gray-400 rounded">
            <h2 className="text-base font-bold mb-3 text-gray-900">
              Declaration
            </h2>
            <div className="flex items-start gap-3">
              {canEdit && (
                <input
                  type="checkbox"
                  checked={isDeclarationChecked}
                  onChange={(e) => setIsDeclarationChecked(e.target.checked)}
                  className="mt-1 w-4 h-4 cursor-pointer"
                />
              )}
              <div className="text-sm text-gray-700 leading-relaxed">
                I hereby declare & understand that,
                <ol className="list-decimal ml-5 mt-2 space-y-1">
                  <li>
                    All the information furnished by me in this profile is
                    true, complete and correct to the best of my knowledge and
                    belief.
                  </li>
                  <li>
                    Entire information furnished by me in this profile is
                    final and binding to me.
                  </li>
                  <li>
                    If any information furnished by me here, is found to be
                    false or incorrect, I shall be liable for appropriate
                    legal action and my application will be cancelled as per
                    rules.
                  </li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* ACTION BUTTON */}
        {!isInstituteUser && (
          <div className="flex justify-center mt-6">
            {isCandidate ? (
              <>
                {canEdit && (
                  <button
                    onClick={handleLockForm}
                    disabled={!isDeclarationChecked}
                    className={`flex items-center gap-2 px-6 py-2 rounded-md font-medium text-sm ${!isDeclarationChecked
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                      } transition-colors duration-200`}
                  >
                    <Lock size={18} />
                    Lock Form
                  </button>
                )}

                {isLocked && isUnlockAllowed && (
                  <button
                    onClick={handleUnlockForm}
                    className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-md font-medium text-sm hover:bg-green-700 transition-colors duration-200"
                  >
                    <Unlock size={18} />
                    Unlock Form
                  </button>
                )}
              </>
            ) : (
              <>
                {verificationStatus === "Verified" ? (
                  <div className="flex items-center gap-2 px-6 py-2 bg-green-100 border-2 border-green-500 text-green-700 rounded-md font-medium text-sm">
                    <Check size={18} />
                    <span>Verified by Board</span>
                  </div>
                ) : verificationStatus === "Pending" ||
                  verificationStatus === "Requested" ? (
                  isUnlockAllowed && (
                    <button
                      onClick={handleWithdrawVerification}
                      className="flex items-center gap-2 px-6 py-2 bg-orange-600 text-white rounded-md font-medium text-sm hover:bg-orange-700 transition-colors duration-200"
                    >
                      <X size={18} />
                      Withdraw Verification Request
                    </button>
                  )
                ) : (
                  <button
                    onClick={handleRequestVerification}
                    disabled={!isDeclarationChecked}
                    className={`flex items-center gap-2 px-6 py-2 rounded-md font-medium text-sm ${!isDeclarationChecked
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                      } transition-colors duration-200`}
                  >
                    <Check size={18} />
                    Request for Verification
                  </button>
                )}
              </>
            )}
          </div>
        )}
        {/* Back Button for Institute User Only */}
        {isInstituteUser && (
          <div className="flex justify-center mt-6">
            <button
              onClick={() =>
                navigate("/Admission/CandidateListRejectedbyDveto")
              }
              className="px-6 py-2 bg-green-600 text-white rounded-md font-medium text-sm hover:bg-blue-700 transition-colors duration-200"
            >
              Back to Rejected Candidate List
            </button>
          </div>
        )}
      </fieldset>
    </div>
  );

};

export default UnifiedLockProfileForm;
