import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import Swal from "sweetalert2";
import FilteredTableComponent from "../../formcomponent/FilteredTableComponent";
import { DateInput } from "../../formcomponent/DateInputComponent";
import OTPService from "../../formcomponent/OTPService";
import {
  GetInspectionUnitDetails,
  GetInstituteInspectionAgencyList,
  GetInstituteInspectionDateRange,
  SaveInstituteInspectionDateRange,
  CheckInspectionEligibility,
  RequestInspection,
  WithdrawInspection,
} from "../../../Endpoints_All/NewInstituteApprovalProcess/NewInstituteApprovalProcess";
import { GetInstituteIDByInstituteCode } from "../../../Endpoints_All/Base/Institute";
import { GetInstitutePromoterTypeByInstituteID } from "../../../Endpoints_All/NewInstituteApprovalProcess/NewInstituteApprovalProcess";
import { ThemeContext } from "../../Context/ThemeContext";
import { useLoading } from "../../../Hooks/useLoading";
import { getIp } from "../../../Endpoints_All/Utils/fileUpload";
import agent from "../../../lib/api/agent";
import TransactionDetailsPage from "../../formcomponent/SDIFeeTransactionTableComponent";
import { CheckFeePaid } from "../../../Endpoints_All/Fee/feeManagement";
//import { TransactionHistory } from '../../../Endpoints_All/Fee/feeManagement';

import { send_message } from "../../../Endpoints_All/OTP/otp";

import DocumentLink from "../../formcomponent/OpenDocumentComponent";
import { useAuth } from "../../../Hooks/AuthContext";

const InspectionRequest = () => {
  const { color } = useContext(ThemeContext);
  const { startLoading, stopLoading, isLoading } = useLoading();
  const navigate = useNavigate();
  const { userInfo } = useAuth();
  const loginID = userInfo?.UserLoginID;
  const userTypeId = userInfo?.UserTypeID;
  const userId = userInfo?.UserID;

  const [searchParams] = useSearchParams();
  const p1 = searchParams.get("P1");
  const p2 = searchParams.get("P2"); // optional

  const [instituteId, setInstituteId] = useState(null);
  const [ipAddress, setIpAddress] = useState("0.0.0.0");
  const [courseData, setCourseData] = useState([]);
  const [inspectionAgency, setInspectionAgency] = useState(null);
  const [dateRangeInfo, setDateRangeInfo] = useState(null);
  const [inspectionStartDate, setInspectionStartDate] = useState(null);
  const [inspectionEndDate, setInspectionEndDate] = useState(null);
  const [errors, setErrors] = useState({});
  const [userMobile, setUserMobile] = useState("");
  const [eligibilityData, setEligibilityData] = useState(null);
  const [feeStaus, setFeeStatus] = useState();
  const [transactionID, setTransactionID] = useState(null);

  const [touched, setTouched] = useState({ startDate: false, endDate: false });

  //test

  const toDateObject = (dateInput) => {
    if (!dateInput) return null;

    if (dateInput instanceof Date) {
      const date = new Date(dateInput);
      date.setHours(0, 0, 0, 0);
      return date;
    }

    if (typeof dateInput === "string") {
      const parts = dateInput.split("/");
      if (parts.length === 3) {
        const date = new Date(
          parseInt(parts[2], 10),
          parseInt(parts[1], 10) - 1,
          parseInt(parts[0], 10),
        );
        date.setHours(0, 0, 0, 0);
        return date;
      }
    }

    return null;
  };

  const getMinStartDate = () => {
    const minDate = new Date();
    minDate.setDate(minDate.getDate()); //+15
    minDate.setHours(0, 0, 0, 0);
    return minDate;
  };

  const getMaxEndDate = () => {
    if (!inspectionStartDate) return null;

    const startDate = toDateObject(inspectionStartDate);
    if (!startDate) return null;

    const maxDate = new Date(startDate);
    maxDate.setDate(maxDate.getDate() + 60);
    maxDate.setHours(0, 0, 0, 0);
    return maxDate;
  };

  const getMinEndDate = () => {
    if (!inspectionStartDate) return getMinStartDate();

    const startDate = toDateObject(inspectionStartDate);
    if (!startDate) return getMinStartDate();

    const minDate = new Date(startDate);
    minDate.setDate(minDate.getDate() + 1);
    minDate.setHours(0, 0, 0, 0);
    return minDate;
  };

  const parseDate = (dateString) => {
    if (!dateString || dateString === "") return null;

    if (dateString instanceof Date) {
      const date = new Date(dateString);
      date.setHours(0, 0, 0, 0);
      return date;
    }

    const parts = dateString.trim().split("/");
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      date.setHours(0, 0, 0, 0);
      return date;
    }
    return null;
  };

  const formatDate = (date) => {
    if (!date) return "";

    if (typeof date === "string") {
      return date;
    }

    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return "";
    }

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const validateField = (fieldName, value) => {
    switch (fieldName) {
      case "startDate":
        if (!value) {
          return "Inspection Request Start Date is required";
        }

        const startDate = toDateObject(value);
        if (!startDate) return "Invalid date format";

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const minDate = getMinStartDate();
        minDate.setHours(0, 0, 0, 0);

        if (startDate < minDate) {
          return "Start Date must be at least 15 days from today";
        }
        return "";

      case "endDate":
        if (!value) {
          return "Inspection Request End Date is required";
        }

        if (!inspectionStartDate) {
          return "Please select start date first";
        }

        // Convert to Date objects
        const end = toDateObject(value);
        const start = toDateObject(inspectionStartDate);

        if (!end || !start) return "Invalid date format";

        // Check if end date is after start date
        if (end <= start) {
          return "End Date must be after Start Date";
        }

        const maxAllowedDate = new Date(start);
        maxAllowedDate.setDate(maxAllowedDate.getDate() + 60);
        maxAllowedDate.setHours(0, 0, 0, 0);

        if (end > maxAllowedDate) {
          return "End Date cannot be more than 60 days from Start Date";
        }

        return "";

      default:
        return "";
    }
  };

  const validateDates = () => {
    const newErrors = {
      startDate: validateField("startDate", inspectionStartDate),
      endDate: validateField("endDate", inspectionEndDate),
    };

    setErrors(newErrors);
    return !newErrors.startDate && !newErrors.endDate;
  };

  const handleStartDateChange = (date) => {
    setInspectionStartDate(date);
    setInspectionEndDate(null); // Reset end date
    setTouched({ ...touched, startDate: true });

    setErrors({
      ...errors,
      startDate: "",
      endDate: "",
    });

    if (date) {
      const startError = validateField("startDate", date);
      if (startError) {
        setErrors((prev) => ({ ...prev, startDate: startError }));
      }
    }
  };

  // Handle end date change
  const handleEndDateChange = (val) => {
    setInspectionEndDate(val);
    setTouched({ ...touched, endDate: true });

    setErrors({ ...errors, endDate: "" });

    if (inspectionStartDate && val) {
      const endError = validateField("endDate", val);
      if (endError) {
        setErrors((prev) => ({ ...prev, endDate: endError }));
      }
    }
  };

  // Fetch IP Address
  const fetchIP = async () => {
    try {
      const response = await agent.get(getIp, {
        headers: { accept: "*/*" },
      });
      if (response.data?.ip) {
        setIpAddress(response.data.ip);
      } else {
        setIpAddress("0.0.0.0");
      }
    } catch (error) {
      console.error("Error fetching IP:", error);
      setIpAddress("0.0.0.0");
    }
  };

  const fetchIsFeePaid = async (instituteID) => {
    try {
      if (!instituteID) {
        console.warn("Institute ID is null.");
        return;
      }
      const feeStatus = await agent.get(`${CheckFeePaid}/${instituteID}/7`);
      const response = feeStatus;

      setFeeStatus(response.data?.Data);
    } catch (error) {
      console.error("Error fetching fee details:", error);
      throw error;
    }
  };

  //const fetchTransactionHistory = async (instituteID) => {
  //    try {
  //        const transactionStatus = await agent.get(`${TransactionHistory}/${instituteID}?userTypeId=${userTypeId}`);
  //        const response = transactionStatus;
  //        console.log(".....................................", response);

  //        const txnId = response.data?.Data?.TransactionID;

  //        setTransactionID(txnId);
  //        return txnId;
  //    }
  //    catch (error) {
  //        console.error("Error fetching fee details:", error);
  //        throw error;
  //    }

  //};
  //const fetchTransactionHistory = async (instituteID) => {
  //    if (!instituteID) {
  //        console.warn("fetchTransactionHistory: instituteID is falsy, skipping request");
  //        return null;
  //    }

  //    try {

  //        console.log('Fetching transaction history', { url: TransactionHistory, instituteID, userTypeId });
  //        const response = await agent.get(TransactionHistory, {
  //            params: {
  //                instituteID,
  //                userTypeId
  //            },
  //            headers: { accept: '*/*' },
  //            timeout: 15000
  //        });

  //        console.log('Transaction history response:', response);

  //        const txnId = response?.data?.Data?.TransactionID ?? response?.data?.Data?.TransactionId ?? null;

  //        if (!txnId) {
  //            console.warn('Transaction ID not found in response.data.Data:', response?.data);
  //        }

  //        setTransactionID(txnId);
  //        return txnId;
  //    } catch (error) {

  //        console.error('Error fetching transaction history:', error?.response?.data ?? error.message ?? error);

  //        return null;
  //    }
  //};

  //useEffect(() => {
  //    if (feeStaus === true && instituteId) {  // feeStaus === true &&
  //        fetchTransactionHistory(instituteId);
  //    }
  //}, [instituteId, feeStaus]); //feeStaus

  useEffect(() => {
  window.scrollTo(0, 0);
}, []);

  // Fetch Institute ID
  useEffect(() => {
    const fetchInstituteId = async () => {
      try {
        startLoading();

        const response = await agent.get(GetInstituteIDByInstituteCode, {
          params: { InstituteCode: loginID },
        });

        if (response.data.Status === "Success") {
          setInstituteId(response.data.Data);
        }
      } catch (error) {
        console.error("Error fetching Institute ID:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to fetch Institute ID",
        });
      } finally {
        stopLoading();
      }
    };

    if (userTypeId === 14 || (userTypeId === 81 && p1) || (userTypeId === 501 && p1)) {
      setInstituteId(p1);
    } else if (loginID) {
      fetchInstituteId();
    }

    fetchIP();
  }, [loginID, userTypeId, p1]);

  // Fetch Management Mobile Number
  const fetchManagementMobile = async () => {
    if (!instituteId) {
      console.warn("Institute ID not available yet");
      return;
    }

    try {
      const url = `${GetInstitutePromoterTypeByInstituteID}/${instituteId}/5`;

      const response = await agent.get(url, {
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
        },
      });

      if (
        response.data &&
        response.data.Status === "Success" &&
        response.data.Data?.length > 0
      ) {
        const mobileNo = response.data.Data[0].MobileNo;
        const mobileString = mobileNo ? String(mobileNo) : "";
        setUserMobile(mobileString);
      } else {
        console.warn("No mobile number found for management");
        setUserMobile("");
      }
    } catch (error) {
      console.error("Error fetching management mobile:", error);
    }
  };

  // Check Inspection Eligibility
  const checkEligibility = async () => {
    if (!instituteId) return;

    try {
      const response = await agent.get(CheckInspectionEligibility, {
        params: {
          instituteId: instituteId,
          userLoginId: loginID,
        },
      });
      if (response.data.Status === "Success") {
        setEligibilityData(response.data.Data);
      }
    } catch (error) {
      console.error("Error checking eligibility:", error);
    }
  };

  // Fetch Inspection Unit Details
  useEffect(() => {
    const fetchInspectionUnitDetails = async () => {
      if (!instituteId) return;

      try {
        startLoading();
        const response = await agent.get(GetInspectionUnitDetails, {
          params: { instituteId: instituteId },
        });

        if (response.data.Status === "Success") {
          const data = response.data.Data.map((item, index) => ({
            ...item,
            SN: index + 1,
            InspectionUnits: item.InspectionUnits,
            MaxTraningSetupRequired: Math.ceil(
              (item.InspectionUnits || item.TotalUnits) / item.MaxBatchesPerDay,
            ),
          }));
          setCourseData(data);
        }
      } catch (error) {
        console.error("Error fetching Inspection Unit Details:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to fetch Inspection Unit Details",
        });
      } finally {
        stopLoading();
      }
    };
    if (instituteId) {
      fetchInspectionUnitDetails();
      fetchManagementMobile();
      checkEligibility();
      fetchIsFeePaid(instituteId);
      //fetchTransactionHistory(instituteId);
    }
  }, [instituteId]);

  // Fetch Inspection Agency Details
  useEffect(() => {
    const fetchInspectionAgency = async () => {
      if (!instituteId || !ipAddress) return;

      try {
        const response = await agent.post(GetInstituteInspectionAgencyList, {
          instituteId: instituteId,
          exitInstituteID: 0,
          userLoginID: loginID,
          pageCode: "InspectionRequest",
          itemId: 0,
          ipAddress: ipAddress,
        });

        if (
          response.data.Status === "Success" &&
          response.data.Data.Table.length > 0
        ) {
          setInspectionAgency(response.data.Data.Table[0]);
        }
      } catch (error) {
        console.error("Error fetching Inspection Agency:", error);
      }
    };

    fetchInspectionAgency();
  }, [instituteId, ipAddress]);

  // Fetch Inspection Date Range
  const fetchDateRange = async () => {
    if (!instituteId || !ipAddress) return;

    try {
      const response = await agent.post(GetInstituteInspectionDateRange, {
        instituteId: instituteId,
        exitInstituteID: 0,
        userLoginID: loginID,
        pageCode: "InspectionRequest",
        itemId: 0,
        ipAddress: ipAddress,
      });

      if (
        response.data.Status === "Success" &&
        response.data.Data.Table.length > 0
      ) {
        const existingData = response.data.Data.Table[0];
        setDateRangeInfo(existingData);

        // Parse and set existing dates if available
        if (existingData.InspectionRequestStartDate) {
          const startDate = parseDate(existingData.InspectionRequestStartDate);
          setInspectionStartDate(startDate ? formatDate(startDate) : null);
        }
        if (existingData.InspectionRequestEndDate) {
          const endDate = parseDate(existingData.InspectionRequestEndDate);
          setInspectionEndDate(endDate ? formatDate(endDate) : null);
        }
      }
    } catch (error) {
      console.error("Error fetching Date Range:", error);
    }
  };

  useEffect(() => {
    fetchDateRange();
  }, [instituteId, ipAddress]);

  // Get current date in DD/MM/YYYY format
  const getCurrentDate = () => {
    return formatDate(new Date());
  };

  // Prepare table data for inspection units
  const prepareInspectionUnitsData = () => {
    const data = courseData.map((item) => ({
      SN: item.SN,
      //Course: item.CourseWithCourseCode || '',
      Course: item.ModelCurriculum ? (
        <DocumentLink
          documentUrl={item.ModelCurriculum}
          itemName={item.CourseWithCourseCode || "Course"}
          label={item.CourseWithCourseCode || ""}
        />
      ) : (
        item.CourseWithCourseCode || ""
      ),

      ApprovedUnits: item.ApprovedUnits || 0,
      LoIUnits: item.LOIProposedUnits || 0,
      TotalUnits: item.LOITotalUnits || 0, // ADDED LOITotalUnits
      InspectionUnits: item.InspectionUnits || 0,
      InspectionFee: item.InspectionFee || 0,
      SecurityDeposit: item.SecurityDeposit || 0,
    }));

    const totals = calculateTotals();
    data.push({
      SN: "",
      Course: "Total",
      ApprovedUnits: totals.ApprovedUnits,
      LoIUnits: totals.LOIProposedUnits,
      TotalUnits: totals.LOITotalUnits,
      InspectionUnits: totals.InspectionUnits,
      InspectionFee: totals.InspectionFee,
      SecurityDeposit: totals.SecurityDeposit,
      isTotalRow: true,
    });

    return data;
  };

  // Calculate totals
  const calculateTotals = () => {
    return courseData.reduce(
      (acc, item) => ({
        ApprovedUnits: acc.ApprovedUnits + (item.ApprovedUnits || 0),
        LOIProposedUnits: acc.LOIProposedUnits + (item.LOIProposedUnits || 0),
        LOITotalUnits: acc.LOITotalUnits + (item.LOITotalUnits || 0),
        InspectionUnits: acc.InspectionUnits + (item.InspectionUnits || 0),
        InspectionFee: acc.InspectionFee + (item.InspectionFee || 0),
        SecurityDeposit: acc.SecurityDeposit + (item.SecurityDeposit || 0),
      }),
      {
        ApprovedUnits: 0,
        LOIProposedUnits: 0,
        LOITotalUnits: 0,
        InspectionUnits: 0,
        InspectionFee: 0,
        SecurityDeposit: 0,
      },
    );
  };

  // Inspection Units Table columns
  const inspectionUnitsColumns = [
    { header: "S.N.", accessor: "SN", width: "40px" },
    { header: "Course", accessor: "Course", width: "3000px" },
    { header: "Approved Units", accessor: "ApprovedUnits", width: "100px" },
    { header: "LoI Units", accessor: "LoIUnits", width: "100px" },
    { header: "Total Units", accessor: "TotalUnits", width: "120px" },
    { header: "Inspection Units", accessor: "InspectionUnits", width: "100px" },
    { header: "Inspection Fee", accessor: "InspectionFee", width: "140px" },
    { header: "Security Deposit", accessor: "SecurityDeposit", width: "150px" },
  ];

  // Custom render for inspection units table
  const renderInspectionUnitsCell = (row, column) => {
    if (row.isTotalRow) {
      return <span className="font-bold">{row[column.accessor]}</span>;
    }
    return row[column.accessor];
  };

  // Submit Inspection Request (Called after OTP verification and date save)
  const submitInspectionRequest = async () => {
    try {
      startLoading();

      const response = await agent.post(RequestInspection, {
        instituteId: instituteId,

        userLoginID: loginID,
        //pageCode: "InspectionRequest",
        remarks: "Inspection Request",
        ipAddress: ipAddress,
      });

      if (response.data.Status === "Success") {
        await checkEligibility();
        await fetchDateRange();

        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Inspection request submitted successfully!",
        });
        return true;
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response.data.Message || "Failed to submit inspection request",
        });
      }
    } catch (error) {
      console.error("Error submitting inspection request:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to submit inspection request",
      });
    } finally {
      stopLoading();
    }
  };

  // Save dates and submit request after OTP verification
  const saveDatesAndSubmitRequest = async () => {
    // added for check
    if (
      !inspectionStartDate ||
      !inspectionEndDate ||
      !formatDate(inspectionStartDate) ||
      !formatDate(inspectionEndDate)
    ) {
      Swal.fire({
        icon: "error",
        title: "Invalid Dates",
        text: "Start Date and End Date are required.",
      });
      return;
    }

    const formattedStartDate = formatDate(inspectionStartDate);
    const formattedEndDate = formatDate(inspectionEndDate);

    // FINAL FORMAT CHECK
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;

    if (
      !dateRegex.test(formattedStartDate) ||
      !dateRegex.test(formattedEndDate)
    ) {
      Swal.fire({
        icon: "error",
        title: "Invalid Date Format",
        text: "Date format must be dd/MM/yyyy",
      });
      return;
    }
    try {
      startLoading();

      const saveResponse = await agent.post(SaveInstituteInspectionDateRange, {
        entity: {
          instituteId: instituteId,
          exitInstituteID: 0,
          userLoginID: loginID,
          pageCode: "InspectionRequest",
          itemId: 0,
          ipAddress: ipAddress,
        },
        startDate: formattedStartDate, //formatDate(inspectionStartDate),
        endDate: formattedEndDate, // formatDate(inspectionEndDate),
        submissionDate: getCurrentDate(),
        delayRemark: "", // added for remark
        InspectionScheduledDateByDVETO: "",
        DelayRemarkForActual: "",
        ActualInspectionDateByDVETO: "",
        inspectionReportSubmissionDate: "",
        SignedInspectionReportSubmissionDate: "",
      });
      if (saveResponse.data.Status !== "Success") {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to save date range",
        });
        stopLoading();
        return;
      }

      stopLoading();
      const isSubmitted = await submitInspectionRequest();
      if (isSubmitted) {
        await sendSMSInspectionRequest();
        await sendSMSInspectionRequestDveto();
      } // ADDED FOR SMS AFTER SUCCESSFUL SUBMISSION
    } catch (error) {
      console.error("Error saving dates:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to save date range",
      });
      stopLoading();
    }
  };

  // 	SMS to Authorized Representative Update SMS

  const sendSMSInspectionRequest = async () => {
    try {
      startLoading();

      const saveResponse = await agent.post(send_message, {
        userID: instituteId,
        userLoginID: loginID,
        purpose: "InspectionRequestSubmit",
        messageType: "S",
        mobileNo: String(userMobile || ""),
        name: "",
      });

      stopLoading();
    } catch (error) {
      console.error("Error saving dates:", error);

      stopLoading();
    }
  };
  const sendSMSInspectionRequestDveto = async () => {
    try {
      startLoading();

      const saveResponse = await agent.post(send_message, {
        userID: 102,
        userLoginID: loginID,
        purpose: "InspectionRequestDveto",
        messageType: "S",
        mobileNo: inspectionAgency.PhoneNo, //String(userMobile || "")
        name: "",
      });

      if (
        saveResponse?.data?.Status !== "Success" &&
        saveResponse?.status !== 200
      ) {
        Swal.fire({
          icon: "error",
          title: "SMS Failed",
          text: saveResponse?.data?.message || "Failed to send SMS(DVETO)",
        });

        return;
      }

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "SMS sent successfully",
      });

      //stopLoading();
    } catch (error) {
      console.error("Error saving dates:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error?.message || "Something went wrong while sending SMS",
      });
      //stopLoading();
    } finally {
      stopLoading();
    }
  };

  // OTP Service Configuration
  const otpServiceVerification = OTPService({
    mobileNo: String(userMobile || ""),
    purpose: "InspectionRequestVerification",
    isVerifyRequired: true,
    messege:
      "OTP verification required by Authorized Representative of Institute for Inspection Request",
    isDuplicateCheck: false,
    onSuccess: async (data) => {
      await saveDatesAndSubmitRequest();
    },
    onError: (error) => {
      console.error("OTP Verification Error:", error);
      Swal.fire({
        title: "Verification Failed",
        text: error.message || "OTP verification failed. Please try again.",
        icon: "error",
      });
    },
    onCancel: () => {},
  });

  // Handle Request Inspection Button Click
  const handleRequestInspection = async () => {
    if (!validateDates()) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please provide valid Inspection Request Start Date and End Date",
      });
      return;
    }

    if (!eligibilityData) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Unable to verify eligibility. Please try again.",
      });
      return;
    }

    if (!eligibilityData.CanRequestInspection) {
      const missingPages =
        eligibilityData.MissingPages || "Some required information";
      Swal.fire({
        icon: "warning",
        title: "Cannot Request Inspection",
        html: `<p>${eligibilityData.Message}</p><p><strong>Missing Pages:</strong> ${missingPages}</p>`,
      });
      return;
    }

    if (!eligibilityData.IsAllDataFilled) {
      Swal.fire({
        icon: "warning",
        title: "Incomplete Data",
        text: "Please complete all required information before requesting inspection.",
      });
      return;
    }

    if (!userMobile || userMobile === "") {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Mobile number not found. Please update your profile.",
      });
      return;
    }

    const mobileString = String(userMobile);
    if (mobileString.length < 10) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Invalid mobile number. Please update your profile.",
      });
      return;
    }

    otpServiceVerification.sendOTP();
  };

  // Submit Withdraw Request (Called after OTP verification)
  const submitWithdrawRequest = async () => {
    try {
      startLoading();

      const response = await agent.post(WithdrawInspection, {
        instituteId: instituteId,
        // exitInstituteID: 0,
        userLoginID: loginID,
        remarks: "Withdraw Inspection",

        ipAddress: ipAddress,
      });

      if (response.data.Status === "Success") {
        await checkEligibility();
        await fetchDateRange();

        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Inspection request withdrawn successfully!",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text:
            response.data.Message || "Failed to withdraw inspection request",
        });
      }
    } catch (error) {
      console.error("Error withdrawing inspection request:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to withdraw inspection request",
      });
    } finally {
      stopLoading();
    }
  };

  // OTP Service for Withdraw
  const otpServiceWithdraw = OTPService({
    mobileNo: String(userMobile || ""),
    purpose: "InspectionWithdrawVerification",
    isVerifyRequired: true,
    messege:
      "OTP verification required by Authorized Representative of Institute for Withdrawing Inspection Request",
    isDuplicateCheck: false,
    onSuccess: async (data) => {
      await submitWithdrawRequest();
    },
    onError: (error) => {
      console.error("OTP Verification Error:", error);
      Swal.fire({
        title: "Verification Failed",
        text: error.message || "OTP verification failed. Please try again.",
        icon: "error",
      });
    },
    onCancel: () => {},
  });

  // Handle Withdraw Inspection
  const handleWithdrawInspection = async () => {
    if (!eligibilityData || !eligibilityData.CanWithdrawInspection) {
      Swal.fire({
        icon: "warning",
        title: "Cannot Withdraw",
        text: "You cannot withdraw the inspection request at this time.",
      });
      return;
    }

    const result = await Swal.fire({
      title: "Confirm Withdrawal",
      text: "Are you sure you want to withdraw the inspection request?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, Withdraw",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      if (!userMobile || userMobile === "") {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Mobile number not found. Please update your profile.",
        });
        return;
      }

      const mobileString = String(userMobile);
      if (mobileString.length < 10) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Invalid mobile number. Please update your profile.",
        });
        return;
      }

      otpServiceWithdraw.sendOTP();
    }
  };

  // Determine inspection status - with proper undefined checks
  const isInspectionCompleted = eligibilityData?.InspectionStatus === "S"; //|| eligibilityData?.InspectionStatus === 'WD'
  // Removed isRequestSubmitted check as per requirement
  const canRequestInspection =
    eligibilityData?.CanRequestInspection === true &&
    eligibilityData?.IsAllDataFilled === true;
  const canWithdrawInspection = eligibilityData?.CanWithdrawInspection === true;

  // Check if status is W or I for withdraw button visibility
  const showWithdrawButton =
    canWithdrawInspection &&
    (eligibilityData?.InspectionStatus === "W" ||
      eligibilityData?.InspectionStatus === "I");

  // Determine if dates should be editable
  // Show input fields only when canRequestInspection is true
  // After withdraw (canWithdrawInspection true) or status S, show only display
  const areDatesEditable =
    canRequestInspection && !canWithdrawInspection && !isInspectionCompleted;

  const IncompletePages = eligibilityData?.MissingPages?.trim()
    ? eligibilityData.MissingPages.split(",").map((page) => page.trim())
    : [];

  const hasIncompletePages = IncompletePages.length > 0;

  //test application
  const openInspectionPopup = () => {
    const popupWidth = 1000;
    const popupHeight = 750;

    const left = (window.screen.width - popupWidth) / 2;
    const top = (window.screen.height - popupHeight) / 2;

    const popup = window.open(
      `${window.location.origin}/React/InspectionApplication?P1=${instituteId}&P2=${loginID}`,
      "InspectionApplication",
      `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes`,
    );

    if (!popup) {
      Swal.fire({
        title: "Popup Blocked",
        text: "Please allow popups for this website.",
        icon: "error",
      });
    }
  };

  //const extractValue = (label, text) => {
  //    const regex = new RegExp(`${label}:\\s*([^,]+)`);
  //    const match = text.match(regex);
  //    return match ? match[1].trim() : '';
  //};
  //const agencyAddress = inspectionAgency?.AgencyAddress || '';

  //const office = agencyAddress.split('<br>')[0]?.trim() || '';
  //const address = agencyAddress
  //    .split('<br>')
  //    .slice(1)
  //    .filter(line =>
  //        !/Pin Code:/i.test(line) &&
  //        !/Taluka:/i.test(line) &&
  //        !/District:/i.test(line)
  //    )
  //    .join('<br>')
  //    .trim();
  //const pinCode = extractValue('Pin Code', agencyAddress);
  //const taluka = extractValue('Taluka', agencyAddress);
  //const district = extractValue('District', agencyAddress);

  return (
    <div className="p-6">
      {/* Units for Inspection Section */}
      <fieldset className="border border-gray-300 rounded mb-6 px-4 pt-3 pb-4">
        <legend
          className={`flex items-center gap-2 rounded-md border border-gray-300 ${color} px-4 py-2 text-xl font-bold text-white shadow-md`}
        >
          Inspection Request
        </legend>

        <FilteredTableComponent
          data={prepareInspectionUnitsData()}
          columns={inspectionUnitsColumns}
          filterColumns={[]}
          customButtons={[]}
          title=""
          exportFileName="Units_For_Inspection"
          tableId="inspection-units-table"
          searchable={false}
          sortable={false}
          showExcelTemplate={false}
          exportable={false}
          showSearch={false}
          showExport={false}
          className="mt-3"
          renderCell={renderInspectionUnitsCell}
          maxHeight="500px"
          stickyHeader={true}
          readOnly={true}
        />
      </fieldset>

      <div>
        <TransactionDetailsPage
          instituteID={instituteId}
          userTypeID={userTypeId}
        />
      </div>

      {/* Inspecting Agency Section */}
      {inspectionAgency && (
        <fieldset className="border border-gray-300 rounded mb-6 px-4 pt-3 pb-4">
          <legend
            className={`flex items-center gap-2 rounded-md border border-gray-300 ${color} px-4 py-2 text-xl font-bold text-white shadow-md`}
          >
            Inspecting Agency/ District Office
          </legend>

          <div className="mt-4">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">
                Office:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 ml-4">
                <div className="flex">
                  <span className="font-medium text-gray-600 w-40">
                    Office:
                  </span>
                  <span className="text-gray-800 flex-1">
                    {/*District Vocational Education and Training Office {district}*/}
                    <span className="text-gray-800 flex-1">
                      {inspectionAgency.OfficeName}
                    </span>
                  </span>
                  {/*<span className="text-gray-800 flex-1"> {office || '-'}</span>  */}
                </div>
                <div className="flex">
                  <span className="font-medium text-gray-600 w-40">
                    Address:
                  </span>
                  <span className="text-gray-800 flex-1">
                    {inspectionAgency.AgencyAddress}
                  </span>
                  {/*<span className="text-gray-800 flex-1">{address}</span>*/}
                </div>
                <div className="flex">
                  <span className="font-medium text-gray-600 w-40">
                    Pin Code:
                  </span>
                  <span className="text-gray-800 flex-1">
                    {inspectionAgency.AgencyPincode}
                  </span>
                  {/*<span className="text-gray-800 flex-1"> {pinCode || '-'}</span>  */}
                </div>
                <div className="flex">
                  <span className="font-medium text-gray-600 w-40">
                    City/ Village:
                  </span>
                  <span className="text-gray-800 flex-1">
                    {inspectionAgency.AgencyCity || "-"}
                  </span>
                </div>
                <div className="flex">
                  <span className="font-medium text-gray-600 w-40">
                    Taluka:
                  </span>
                  <span className="text-gray-800 flex-1">
                    {inspectionAgency.AgencyTaluka}
                  </span>
                  {/*<span className="text-gray-800 flex-1"> {taluka || '-'}</span>  */}
                </div>
                <div className="flex">
                  <span className="font-medium text-gray-600 w-40">
                    District:
                  </span>
                  <span className="text-gray-800 flex-1">
                    {inspectionAgency.AgencyDistrict}
                  </span>
                  {/*<span className="text-gray-800 flex-1"> {district || '-'}</span>  */}
                </div>
                <div className="flex">
                  <span className="font-medium text-gray-600 w-40">State:</span>
                  <span className="text-gray-800 flex-1">
                    {inspectionAgency.AgencyState}
                  </span>
                </div>
                <div className="flex">
                  <span className="font-medium text-gray-600 w-40">
                    Phone Number:
                  </span>
                  <span className="text-gray-800 flex-1">
                    {inspectionAgency.PhoneNo}
                  </span>
                </div>
                <div className="flex">
                  <span className="font-medium text-gray-600 w-40">
                    E-Mail:
                  </span>
                  <span className="text-gray-800 flex-1">
                    {inspectionAgency.EMailID}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">
                Contact Person:
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 ml-4">
                <div className="flex items-center">
                  <span className="font-medium text-gray-600 w-48">Name:</span>
                  <span className="text-gray-800">
                    {inspectionAgency.Title} {inspectionAgency.FName}{" "}
                    {inspectionAgency.MName} {inspectionAgency.LName}
                  </span>
                </div>

                <div className="flex items-center">
                  <span className="font-medium text-gray-600 w-48">
                    Designation:
                  </span>
                  <span className="text-gray-800">
                    District Vocational Education and Training Officer
                  </span>
                </div>

                <div className="flex items-center">
                  <span className="font-medium text-gray-600 w-48">
                    Primary Mobile No:
                  </span>
                  <span className="text-gray-800">
                    {inspectionAgency.MobileNo}
                  </span>
                </div>

                <div className="flex items-center">
                  <span className="font-medium text-gray-600 w-48">
                    Alternate Mobile No:
                  </span>
                  <span className="text-gray-800">
                    {inspectionAgency.AlternateMobileNo}
                  </span>
                </div>

                <div className="flex items-center">
                  <span className="font-medium text-gray-600 w-48">
                    Email ID:
                  </span>
                  <span className="text-gray-800 break-all">
                    {inspectionAgency.EmailId1}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </fieldset>
      )}

      {/* Important Dates Section - Always Show */}
      {dateRangeInfo && (
        <fieldset className="border border-gray-300 rounded mb-6 px-4 pt-3 pb-4">
          <legend
            className={`flex items-center gap-2 rounded-md border border-gray-300 ${color} px-4 py-2 text-xl font-bold text-white shadow-md`}
          >
            Important Dates
          </legend>

          <div className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <div className="flex">
                <span className="font-medium text-gray-600 w-64">
                  LoI Issuance Date:
                </span>
                <span className="text-gray-800 flex-1">
                  {dateRangeInfo.LoIIssuanceDate || "-"}
                </span>
              </div>
              <div className="flex">
                <span className="font-medium text-gray-600 w-64">
                  LoI Expiry Date:
                </span>
                <span className="text-gray-800 flex-1">
                  {dateRangeInfo.LoIExpiryDate || "-"}
                </span>
              </div>
              <div className="flex">
                <span className="font-medium text-gray-600 w-64">
                  Inspection Request Submission Date:{" "}
                </span>
                <span className="text-gray-800 flex-1">
                  {dateRangeInfo.InspectionRequestSubmissionDate || "-"}
                </span>
              </div>
              <div className="flex">
                <span className="font-medium text-gray-600 w-64">
                  Inspection Request Date Range:
                </span>
                <span className="text-gray-800 flex-1">
                  {inspectionStartDate && inspectionEndDate
                    ? `${formatDate(inspectionStartDate)} To ${formatDate(inspectionEndDate)}`
                    : "-"}
                </span>
              </div>
              <div className="flex">
                <span className="font-medium text-gray-600 w-64">
                  Inspection Scheduled Date by DVETO:
                </span>
                <span className="text-gray-800 flex-1">
                  {dateRangeInfo.InspectionScheduledDateByDVETO || "-"}
                </span>
              </div>
              <div className="flex">
                <span className="font-medium text-gray-600 w-64">
                  Actual Inspection Date by DVETO:
                </span>
                <span className="text-gray-800 flex-1">
                  {dateRangeInfo.ActualInspectionDateByDVETO || "-"}
                </span>
              </div>
            </div>
          </div>
        </fieldset>
      )}

      {/* Date Selection Section - Show only when dates are editable */}
      {areDatesEditable && (
        <fieldset className="border border-gray-300 rounded mb-6 px-4 pt-3 pb-4">
          <legend
            className={`flex items-center gap-2 rounded-md border border-gray-300 ${color} px-4 py-2 text-xl font-bold text-white shadow-md`}
          >
            Select Inspection Request Date Range
          </legend>

          <div className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <DateInput
                  label="Inspection Request Start Date"
                  value={inspectionStartDate}
                  onChange={handleStartDateChange}
                  required
                  minDate={getMinStartDate()}
                  maxDate={new Date(2099, 11, 31)}
                  dateFormat="dd/MM/yyyy"
                />
                {/*error={errors.startDate}*/}
                {errors.startDate && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.startDate}
                  </p>
                )}
              </div>
              <div>
                <DateInput
                  label="Inspection Request End Date"
                  value={inspectionEndDate}
                  onChange={handleEndDateChange}
                  required
                  minDate={getMinEndDate()}
                  maxDate={getMaxEndDate()}
                  disabled={!inspectionStartDate}
                  dateFormat="dd/MM/yyyy"
                />
                {errors.endDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>
                )}
              </div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-blue-300">
            <p className="text-sm text-blue-700 italic">
              <strong>Note:</strong> Inspection Request Start Date should be at
              least <strong>15 days from today and </strong>
              Inspection Request End Date should not be more than{" "}
              <strong>60 days from the Start Date</strong>.
              {/*Inspection Request Start Date should be at least 15 days from today and Inspection Request End Date should not be more than 60 days from the Start Date.*/}
            </p>
          </div>
        </fieldset>
      )}

      {hasIncompletePages && IncompletePages?.length > 0 && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">
            <span className="font-medium">Remark:</span>
          </p>

          <div className="text-red-500 text-sm mt-2">
            Please complete the following pages: {IncompletePages.join(", ")}
          </div>
        </div>
      )}

      <div className="mt-4 rounded-md border border-blue-200 bg-blue-50 p-4">
        <p className="text-sm text-blue-700">
          <span className="font-medium">Note:</span>
        </p>

        {/*Before Request / Can Request */}
        {canRequestInspection &&
          !canWithdrawInspection &&
          !isInspectionCompleted && (
            <>
              <ol className="list-decimal list-inside mt-1 space-y-1 text-sm text-blue-700">
                <li>Select date range for scheduling physical inspection.</li>
                <li>
                  Click on <strong>"Request Inspection"</strong> to submit
                  request for inspection.
                </li>
                <li>
                  Once Request for Inspection is submitted, the information on
                  all previous pages shall be locked for editing.
                </li>
                <li>
                  Applicant can Withdraw Inspection Request to edit information
                  on previous pages.
                </li>
                <li>
                  Applicant cannot Withdraw Inspection Request after Inspection.
                </li>
                <li>
                  Inspection Request shall be forwarded to respective Inspecting
                  Agency/ District Vocational Education and Training Office.
                </li>
                <li>
                  District Office shall schedule inspection and inspection date
                  shall be informed to Authorized Representative of Training
                  Institute through SMS.
                </li>
                <li>
                  Applicant may contact Board Helpline for any assistance.
                </li>
              </ol>
            </>
          )}

        {/*After Request Submission (Can Withdraw) */}
        {canWithdrawInspection && !isInspectionCompleted && (
          <ol className="list-decimal list-inside mt-1 space-y-1 text-sm text-blue-700">
            <li>Request for Inspection is submitted.</li>
            <li>
              Request has been forwarded to above mentioned Inspecting Agency/
              District Office for physical inspection.
            </li>
            <li>
              Applicant can Withdraw Inspection Request and edit information on
              previous pages.
            </li>
            <li>
              Applicant cannot Withdraw Inspection Request after Inspection.
            </li>
            <li>
              District Office shall schedule inspection and inspection date
              shall be informed to Authorized Representative of Training
              Institute through SMS.
            </li>
            <li>Applicant may contact Board Helpline for any assistance.</li>
          </ol>
        )}

        {/*After Inspection Completed (Status S) */}
        {isInspectionCompleted && (
          <ol className="list-decimal list-inside mt-1 space-y-1 text-sm text-blue-700">
            <li>District Office has submitted Inspection Report to Board.</li>
            <li>Information on all previous pages is locked for editing.</li>
            <li>
              Approval Process is initiated and Institute shall be informed.
            </li>
            <li>Applicant may contact Board Helpline for any assistance.</li>
          </ol>
        )}
      </div>
      {userTypeId !== 14 &&
        ["I", "S", "WD"].includes(eligibilityData?.InspectionStatus) && (
          <button
            onClick={openInspectionPopup}  
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-md font-medium shadow-md transition duration-200 mt-2"
          >
            Inspection Application
          </button>
        )}

      {/* Action Buttons */}
      <div className="flex justify-center items-center gap-6 mt-6">
        {/* LEFT: Back */}
        <div className="flex justify-start">
          <button
            type="button"
            onClick={() => {
              if (userTypeId === 14 || userTypeId === 81 || userTypeId === 501) {
                let url = "/Institute/InspectionFee";
                if (p1) {
                  url += `?P1=${p1}`;
                  if (p2) url += `&P2=${p2}`;
                }
                navigate(url);
              } else {
                navigate("/Institute/InspectionFee");
              }
            }}
            className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
            disabled={isLoading}
          >
            Back
          </button>
        </div>

        <div className="flex justify-center gap-4">
          {userTypeId === 14 || userTypeId === 81 || userTypeId === 501 ? (
            <button
              type="button"
              onClick={() => {
                let url = `/Institute/RecommendedUnits?P1=${p1 || instituteId}&P2=${p2 || ""}`;
                navigate(url);
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-semibold text-sm transition"
            >
              Save and Next
            </button>
          ) : (
            <>
              {feeStaus && canRequestInspection && !isInspectionCompleted && (
                <button
                  type="button"
                  onClick={handleRequestInspection}
                  className="bg-[#dc3545] hover:bg-[#c82333] text-white px-6 py-2 rounded font-semibold text-sm transition"
                  disabled={isLoading} //|| !inspectionStartDate || !inspectionEndDate
                >
                  {isLoading ? "Processing..." : "Request Inspection"}
                </button>
              )}

              {showWithdrawButton && !isInspectionCompleted && (
                <button
                  type="button"
                  onClick={handleWithdrawInspection}
                  className="px-6 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition"
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : "Withdraw Inspection Request"}
                </button>
              )}
            </>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => {
              if (userTypeId === 14 || userTypeId === 81 || userTypeId === 501) {
                 navigate(`/DVETO/InspectionReport?p1=${p2}&p2=${p1}`);
              } else {
                navigate("/tinstitute/dashboard");
              }
            }}
            className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
            disabled={isLoading}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default InspectionRequest;
