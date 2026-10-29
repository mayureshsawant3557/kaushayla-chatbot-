import { useContext, useState, useEffect, useCallback } from "react";
import { ThemeContext } from "../../Component/Context/ThemeContext";
import FilteredTableComponent from "../../Component/formcomponent/FilteredTableComponent";
import { DateInput } from "../../Component/formcomponent/DateInputComponent";
import verified from "../../assets/VerifiedIcon.jpg";
import agent from "../../lib/api/agent";
import {
    GetInstituteInspectionDateRange,
    SaveInstituteInspectionDateRange,
    SubmitInspectionRequest,
    WithdrawInspectionRequest,
    CheckInspectionEligibility,
    WithdrawVerification,
    RequestVerification,
    CheckVerificationEligibility,
} from '../../Endpoints_All/NewInstituteApprovalProcess/NewInstituteApprovalProcess';
import { GetInstituteInspectionDash, DVETOGetDvetoManagementTypeByDvetoID } from "../../Endpoints_All/Base/DVETO";
import { useLocation, useNavigate } from "react-router-dom";
import rejected from "../../assets/NotVerifiedIcon.jpg";
import pending from "../../assets/QuestionMark.png";
import Swal from "sweetalert2";
import OTPService from '../../Component/formcomponent/OTPService';
import InstituteDetailsCard from "../../Component/formcomponent/InstituteDetailsCard";
import { useInspectionLock } from "../../Hooks/useInspectionLock";
import { getDeviceIP } from "../../utils/CommonHelper";
import { useAuth } from "../../Hooks/AuthContext";

// ─── Helpers (pure functions — no session reads here) ────────────────────────
const fmtDate = (d) => {
    if (!d) return "";
    if (d instanceof Date) {
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        return `${day}/${month}/${d.getFullYear()}`;
    }
    if (typeof d === "string" && d.includes("/")) {
        const [day, month, year] = d.split("/");
        return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
    }
    const dt = new Date(d);
    if (isNaN(dt)) return "";
    const day = String(dt.getDate()).padStart(2, "0");
    const month = String(dt.getMonth() + 1).padStart(2, "0");
    return `${day}/${month}/${dt.getFullYear()}`;
};

const formatDateForApi = (d) => {
    if (!d) return "";
    if (typeof d === "string" && d.includes("/")) return d;
    const dt = new Date(d);
    if (isNaN(dt)) return "";
    const day = String(dt.getDate()).padStart(2, "0");
    const month = String(dt.getMonth() + 1).padStart(2, "0");
    return `${day}/${month}/${dt.getFullYear()}`;
};

const parseDate = (dateStr) => {
    if (!dateStr) return null;
    const [day, month, year] = dateStr.split("/");
    return new Date(Number(year), Number(month) - 1, Number(day));
};

const formatDate = (date) => {
    if (!date) return "";
    if (typeof date === "string") return date;
    if (!(date instanceof Date) || isNaN(date.getTime())) return "";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${day}/${month}/${date.getFullYear()}`;
};

const getCurrentDate = () => formatDate(new Date());

// ─── Reactive session hook — the KEY fix shared with SDIScheduleInspectionForm ─
/**
 * Reads sessionStorage on mount (lazy init), then polls every 200ms
 * until all three fields are present. This handles the case where
 * sessionStorage is populated asynchronously after the module loads.
 */
const useSessionInfo = () => {
    const [sessionInfo, setSessionInfo] = useState(() => {
        try {
            const { userInfo } = useAuth();

            return {
                id: userInfo?.UserLoginID || null,         // used in submit/withdraw payloads
                UserID: userInfo?.UserID || null,           // used for mobile fetch
                UserTypeID: userInfo?.UserTypeID || null,   // used for API filters & UI conditionals
            };
        } catch {
            return { id: null, UserID: null, UserTypeID: null };
        }
    });

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        // All three values already available — skip polling
        if (sessionInfo.id && sessionInfo.UserID && sessionInfo.UserTypeID) return;

        const interval = setInterval(() => {
            try {
                const { userInfo } = useAuth();
                const next = {
                    id: userInfo?.UserLoginID || null,
                    UserID: userInfo?.UserID || null,
                    UserTypeID: userInfo?.UserTypeID || null,
                };
                // Only trigger re-render when values actually change
                if (next.id && next.UserID && next.UserTypeID) {
                    setSessionInfo(next);
                    clearInterval(interval);
                }
            } catch {
                // malformed JSON — keep waiting
            }
        }, 200);

        const timeout = setTimeout(() => {
            clearInterval(interval);
        }, 10_000);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [sessionInfo.id, sessionInfo.UserID, sessionInfo.UserTypeID]);

    return sessionInfo;
};

// ─── Main Component ───────────────────────────────────────────────────────────
const InspectionReport = () => {
    const { color } = useContext(ThemeContext);
    const navigate = useNavigate();
    const { userInfo } = useAuth();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const userLoginID = params.get("p1");
    const instituteID = params.get("p2");

    // ✅ All session values are now reactive state — not frozen module-scope constants
    const { id, UserID, UserTypeID } = useSessionInfo();

    const { isLocked, } = useInspectionLock(instituteID, userLoginID);

    // ── State ─────────────────────────────────────────────────────────────────
    const [scheduledDate, setScheduledDate] = useState(null);
    const [actualInspectionDate, setActualInspectionDate] = useState(null);
    const [signedInspectionDate, setSignedInspectionDate] = useState(null);
    const [remark, setRemark] = useState("");
    const [errors, setErrors] = useState({});
    const [inspectionDateRange, setInspectionDateRange] = useState(null);
    const [userMobile, setUserMobile] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [verificationData, setVerificationData] = useState([]);
    const [eligibilityData, setEligibilityData] = useState(null);
    const [verificationStatus, setVerificationStatus] = useState("");

    // ── Derived values ────────────────────────────────────────────────────────
    const fromDate = parseDate(inspectionDateRange?.InspectionRequestStartDate);
    const toDate = parseDate(inspectionDateRange?.InspectionRequestEndDate);
    const maxAllowedDate = new Date(2099, 11, 31);
    const isInspectionCompleted = eligibilityData?.InspectionStatus === "S";
    const inspectionStatus = eligibilityData?.InspectionStatus;
    const VerificationStatus = verificationStatus?.VerificationStatus || "";
    const [ipAddress, setIpAddress] = useState("0.0.0.0");

    const [pageVerifiedCount, setPageVerifiedCount] = useState(0);


    useEffect(() => {
        fetchIP();
    }, []);


    const fetchIP = async () => {
        try {
            const ip = await getDeviceIP();
            setIpAddress(ip);
        } catch (err) {
            console.error("Failed to fetch IP:", err);
            setIpAddress("");
        }
    };

    // ── Individual fetches wrapped in useCallback ─────────────────────────────
    // Each is isolated — a failure in one won't affect the others
    const fetchInspectionDateRange = useCallback(async () => {
        if (!instituteID || !userLoginID) return;
        try {
            const res = await agent.post(GetInstituteInspectionDateRange, {
                instituteId: instituteID,
                exitInstituteID: 0,
                userLoginID,
                pageCode: "InspectionRequest",
                itemId: 0,
                ipAddress: ipAddress,
            });
            if (res.data?.Status === "Success" && res.data?.Data?.Table?.length > 0) {
                const data = res.data.Data.Table[0];
                setInspectionDateRange(data);
                // Pre-fill date fields from saved values
                if (data.InspectionScheduledDateByDVETO)
                    setScheduledDate(parseDate(data.InspectionScheduledDateByDVETO));
                if (data.ActualInspectionDateByDVETO)
                    setActualInspectionDate(parseDate(data.ActualInspectionDateByDVETO));
                if (data.SignedInspectionReportSubmissionDate)
                    setSignedInspectionDate(parseDate(data.SignedInspectionReportSubmissionDate));
                if (data.DelayRemarkForActual)
                    setRemark(data.DelayRemarkForActual);
            }
        } catch (err) {
        }
    }, [instituteID, userLoginID]);

    const fetchVerificationDash = useCallback(async () => {
        // ✅ UserTypeID is now reactive — this won't run with a stale null
        if (!instituteID || !UserTypeID) return;
        try {
            const effectiveUserTypeID = UserTypeID === 501 ? 81 : UserTypeID;
            const res = await agent.get(`${GetInstituteInspectionDash}/${instituteID}/${effectiveUserTypeID}`);
            if (res.data?.Status === "Success") {
                const tableData = res.data.Data.map((item, index) => {
                    let status = "pending";
                    if (item.PageStatus === "V") status = "verified";
                    else if (item.PageStatus === "R") status = "rejected";
                    return { SN: index + 1, Seqno: item.Seqno, Section: item.PageCode, Status: status, Remark: item.Remark || "" };
                });
                setVerificationData(tableData);
            }
        } catch (err) {
        }
    }, [instituteID, UserTypeID]); // ✅ depends on reactive UserTypeID

    // to retune count board verification count
    const fetchVerifiedCount = useCallback(async () => {
        // ✅ UserTypeID is now reactive — this won't run with a stale null
        if (!instituteID) return;
        try {
            const res = await agent.get(`${GetInstituteInspectionDash}/${instituteID}/${81}`);
            if (res.data?.Status === "Success") {


                const data = res.data.Data || [];

                // ✅ Count verified pages (V/v)
                const verifiedCount = data.filter(
                    item => item.PageStatus?.toUpperCase() === "V"
                ).length;

                // ✅ Set verified count state
                setPageVerifiedCount(verifiedCount);
                // const tableData = res.data.Data.map((item, index) => {
                //     let status = "pending";
                //     if (item.PageStatus === "V") status = "verified";
                //     else if (item.PageStatus === "R") status = "rejected";
                //     return { SN: index + 1, Section: item.PageCode, Status: status, Remark: item.Remark || "" };
                // });
                // setVerificationData(tableData);
            }
        } catch (err) {
        }
    }, [instituteID]);

    const checkEligibility = useCallback(async () => {
        if (!instituteID || !userLoginID) return;
        try {
            const response = await agent.get(CheckInspectionEligibility, {
                params: { instituteId: instituteID, userLoginId: userLoginID },
            });
            if (response.data?.Status === "Success")
                setEligibilityData(response.data.Data);
        } catch (err) {
        }
    }, [instituteID, userLoginID]);


    const checkEligibilityForVerification = useCallback(async () => {
        if (!instituteID || !userLoginID) return;
        try {
            const response = await agent.get(CheckVerificationEligibility, {
                params: { instituteId: instituteID },
            });
            if (response.data?.Status === "Success")
                setVerificationStatus(response.data.Data);
        } catch (err) {
        }
    }, [instituteID]);


    // ✅ Mobile fetch depends on UserID — useCallback re-creates when UserID arrives
    // const fetchUserMobile = useCallback(async () => {
    //     if (!UserID) return;
    //     try {
    //         const response = await agent.get(
    //             `${DVETOGetDvetoManagementTypeByDvetoID}/${UserID}/5`
    //         );
    //         const data = response?.data;
    //         if (data?.Status === "Success" && data?.Data?.length > 0) {
    //             setUserMobile(String(data.Data[0]?.MobileNo || ""));
    //         } else {
    //             setUserMobile("");
    //         }
    //     } catch (err) {
    //         setUserMobile("");
    //     }
    // }, [UserID]); // ✅ re-created when UserID becomes non-null
    const fetchUserMobile = useCallback(async () => {
        if (!UserID) return;

        try {
            // For UserTypeID = 81
            if (UserTypeID === 81) {
                const res = await agent.get(`/api/UserManagement/GetUserDetails/${UserID}`);
                const userData = res?.data;

                setUserMobile(String(userData?.UserMobileNo || ""));
            }
            // For all other user types
            else {
                const response = await agent.get(
                    `${DVETOGetDvetoManagementTypeByDvetoID}/${UserID}/5`
                );

                const data = response?.data;

                if (data?.Status === "Success" && data?.Data?.length > 0) {
                    setUserMobile(String(data.Data[0]?.MobileNo || ""));
                } else {
                    setUserMobile("");
                }
            }
        } catch (err) {
            setUserMobile("");
        }
    }, [UserID, UserTypeID]);

    // ── Effect 1: Core data — fires when route params AND UserTypeID are ready ─
    // UserTypeID is a dependency because fetchVerificationDash needs it.
    // Using allSettled so one slow/failing fetch never blocks the others.
    useEffect(() => {
        if (!instituteID || !userLoginID || !UserTypeID) return;

        let cancelled = false;

        const loadCoreData = async () => {
            await Promise.allSettled([
                fetchInspectionDateRange(),
                fetchVerificationDash(),
                checkEligibility(),
                fetchVerifiedCount(),
                checkEligibilityForVerification(),
            ]);
            if (!cancelled) {
                // Nothing to set here — each fetch manages its own state.
                // allSettled guarantees we reach this line even if one fetch throws.
            }
        };

        loadCoreData();
        return () => { cancelled = true; };
    }, [
        instituteID, userLoginID, UserTypeID,
        fetchInspectionDateRange, fetchVerificationDash, checkEligibility, fetchVerifiedCount, checkEligibilityForVerification
    ]);

    // ── Effect 2: Mobile — fires independently when UserID becomes available ──
    // Completely decoupled so a slow mobile API never delays the page.
    useEffect(() => {
        if (!UserID) return;
        fetchUserMobile();
    }, [UserID, fetchUserMobile]);

    // ── Popup helpers ─────────────────────────────────────────────────────────
    const openPopup = (path, name, w = 1000, h = 750) => {
        const left = (window.screen.width - w) / 2;
        const top = (window.screen.height - h) / 2;
        const popup = window.open(
            `${window.location.origin}${path}`,
            name,
            `width=${w},height=${h},left=${left},top=${top},resizable=yes,scrollbars=yes`
        );
        if (!popup) Swal.fire("Popup Blocked", "Please allow popups for this website.", "warning");
    };

    const openInspectionPopup = () =>
        openPopup(`/React/InspectionApplication?P1=${instituteID}&P2=${userLoginID}`, "InspectionApplication");
    const openLoIPopup = () =>
        openPopup(`/React/LOIApplicationPrintForm?P1=${instituteID}&P2=${userLoginID}`, "LOIApplication", 1000, 700);
    const openLoIPdf = () =>
        openPopup(`/React/PrintLOI?P1=${instituteID}&P2=${userLoginID}`, "LetterOfIntent", 1000, 700);
    const openInspectionReportPopup = () =>
        openPopup(`/React/InspectionReportForm?P1=${instituteID}&P2=${userLoginID}`, "InspectionReportForm");
    const openVerificationReportPopup = () =>
        openPopup(`/React/VerificationReport?P1=${instituteID}&P2=${userLoginID}&P3=3`, "VerificationReport");

    // ── Withdrawal flow ───────────────────────────────────────────────────────
    const executeWithdrawal = async () => {
        try {
            const res = await agent.post(WithdrawInspectionRequest, {
                instituteID,
                userLoginID: id, // ✅ reactive — was module-scope before
                ipAddress: ipAddress,
                remarks: "Inspection request Withdraw",
            });
            Swal.close();
            if (res.data?.Status === "Success") {
                await Swal.fire("Success", "Inspection report withdrawn successfully.", "success");
                await Promise.allSettled([fetchInspectionDateRange(), checkEligibility()]);
                navigate("/DVETO/Inspection");
            } else {
                await Swal.fire("Partial Success", "Withdrawal failed.", "warning");
            }
        } catch (err) {
            await Swal.fire("Error", err?.response?.data?.message || "Something went wrong.", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const otpServiceWithdrawal = OTPService({
        mobileNo: String(userMobile),
        purpose: "WithdrawInspectionReport",
        isVerifyRequired: true,
        messege: "OTP verification required for withdrawing inspection report",
        isDuplicateCheck: false,
        onSuccess: async () => { await executeWithdrawal(); },
        onError: (error) => {
            setSubmitting(false);
            Swal.fire("Verification Failed", error.message || "OTP verification failed.", "error");
        },
        onCancel: () => { setSubmitting(false); },
    });

    const handleWithdrawInspection = async () => {
        if (!actualInspectionDate) {
            Swal.fire("Validation", "Actual Inspection Date is required.", "warning");
            return;
        }
        const result = await Swal.fire({
            title: "Confirm Withdrawal",
            text: "Are you sure you want to withdraw the inspection report?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, Withdraw",
        });
        if (!result.isConfirmed) return;
        if (!userMobile) {
            Swal.fire("Mobile Not Found", "User mobile number not available for OTP.", "error");
            return;
        }
        setSubmitting(true);
        otpServiceWithdrawal.sendOTP();
    };

    // ── Submit inspection report date (no OTP) ────────────────────────────────
    const handleSubmitInspectionReportDate = async () => {
        try {
            const payload = {
                entity: { instituteId: instituteID, exitInstituteID: 0, userLoginID, pageCode: "InspectionReport", itemId: 0, ipAddress: ipAddress },
                startDate: inspectionDateRange?.InspectionRequestStartDate,
                endDate: inspectionDateRange?.InspectionRequestEndDate,
                submissionDate: inspectionDateRange?.InspectionRequestSubmissionDate,
                delayRemark: inspectionDateRange?.DelayRemark || "",
                InspectionScheduledDateByDVETO: formatDateForApi(scheduledDate),
                DelayRemarkForActual: remark || "",
                ActualInspectionDateByDVETO: formatDateForApi(actualInspectionDate),
                inspectionReportSubmissionDate: getCurrentDate(),
                SignedInspectionReportSubmissionDate: formatDateForApi(signedInspectionDate) || "",
            };
            Swal.fire({ title: "Saving...", text: "Submitting inspection report date", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
            const res = await agent.post(SaveInstituteInspectionDateRange, payload);
            Swal.close();
            if (res.data?.Status === "Success") {
                await Swal.fire("Success", "Inspection report date submitted successfully.", "success");
                await Promise.allSettled([fetchInspectionDateRange(), checkEligibility()]);
                navigate("/DVETO/OngoingInspection");
            }
        } catch (err) {
            await Swal.fire("Error", err?.response?.data?.message || "Something went wrong.", "error");
        } finally {
            setSubmitting(false);
        }
    };

    // ── Submit inspection report (with OTP) ───────────────────────────────────
    const executeSubmit = async () => {
        try {
            const payload = {
                entity: { instituteId: instituteID, exitInstituteID: 0, userLoginID, pageCode: "InspectionReport", itemId: 0, ipAddress: ipAddress },
                startDate: inspectionDateRange?.InspectionRequestStartDate,
                endDate: inspectionDateRange?.InspectionRequestEndDate,
                submissionDate: inspectionDateRange?.InspectionRequestSubmissionDate,
                delayRemark: inspectionDateRange?.DelayRemark || "",
                InspectionScheduledDateByDVETO: formatDateForApi(scheduledDate),
                DelayRemarkForActual: remark || "",
                ActualInspectionDateByDVETO: formatDateForApi(actualInspectionDate),
                inspectionReportSubmissionDate: getCurrentDate(),
                SignedInspectionReportSubmissionDate: "",
            };
            Swal.fire({ title: "Saving...", text: "Submitting inspection report", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
            const res = await agent.post(SaveInstituteInspectionDateRange, payload);
            Swal.close();
            if (res.data?.Status === "Success") {
                const submitRes = await agent.post(SubmitInspectionRequest, {
                    instituteID,
                    userLoginID: id, // ✅ reactive
                    ipAddress: ipAddress,
                    remarks: "Inspection report submitted",
                });
                Swal.close();
                if (submitRes.data?.Status === "Success") {
                    await Swal.fire("Success", "Inspection report submitted successfully.", "success");
                    await Promise.allSettled([fetchInspectionDateRange(), checkEligibility()]);
                    navigate("/DVETO/Inspection");
                } else {
                    await Swal.fire("Partial Success", "Report saved but submission failed.", "warning");
                }
            } else {
                await Swal.fire("Error", "Failed to save inspection report.", "error");
            }
        } catch (err) {
            await Swal.fire("Error", err?.response?.data?.message || "Something went wrong.", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const otpServiceSubmission = OTPService({
        mobileNo: String(userMobile),
        purpose: "SubmitInspectionReport",
        isVerifyRequired: true,
        messege: "OTP verification required for submitting inspection report",
        isDuplicateCheck: false,
        onSuccess: async () => { await executeSubmit(); },
        onError: (error) => {
            setSubmitting(false);
            Swal.fire("Verification Failed", error.message || "OTP verification failed.", "error");
        },
        onCancel: () => { setSubmitting(false); },
    });

    const handleSubmitInspectionReport = async () => {
        if (!scheduledDate) {
            Swal.fire("Validation", "Inspection Date Scheduled by DVETO required.", "warning");
            return;
        }
        if (verificationData.some(item => item.Status === "pending")) {
            Swal.fire("Validation", "Please complete all section verifications before submitting.", "warning");
            return;
        }
        if (!actualInspectionDate) {
            Swal.fire("Validation", "Actual Inspection Date is required.", "warning");
            return;
        }
        const result = await Swal.fire({
            title: "Confirm Submission",
            text: "Are you sure you want to submit the inspection report?",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, Submit",
        });
        if (!result.isConfirmed) return;
        if (!userMobile) {
            Swal.fire("Mobile Not Found", "User mobile number not available for OTP.", "error");
            return;
        }
        setSubmitting(true);
        otpServiceSubmission.sendOTP();
    };

    // ── Table cell renderer ───────────────────────────────────────────────────
    const extractUrl = (html) => {
        const match = html.match(/href="([^"]*)"/);
        return match ? match[1] : "#";
    };

    const renderCell = (item, column) => {
        if (column.key === "Section") {
            const url = extractUrl(item.Section);
            const text = item.Section.replace(/<[^>]*>/g, "");

            const handleSectionClick = () => {
                // Gate check: Seqno 12 can only open when ALL pages above (Seqno 1–11) are verified
                // This restriction applies only for UserTypeID === 81
                if (UserTypeID === 81 && item.Seqno === 12) {
                    const allAboveVerified = verificationData
                        .filter(row => row.Seqno < 12)
                        .every(row => row.Status === "verified");

                    if (!allAboveVerified) {
                        Swal.fire({
                            icon: "warning",
                            title: "Verification Incomplete",
                            text: "Please verify all above pages before accessing this page.",
                            confirmButtonColor: "#3085d6",
                            confirmButtonText: "OK",
                        });
                        return;
                    }
                }
                navigate(url);
            };

            return (
                <span onClick={handleSectionClick} className="text-blue-600 hover:underline cursor-pointer">
                    {text}
                </span>
            );
        }
        if (column.key === "Status") {
            let icon = pending;
            if (item.Status === "verified") icon = verified;
            if (item.Status === "rejected") icon = rejected;
            return <div className="flex justify-center"><img src={icon} alt={item.Status} className="w-8 h-8" /></div>;
        }
        return <span>{item[column.key] || ""}</span>;
    };

    const verificationColumns = [
        { key: "SN", header: "S.N.", width: "80px", className: "text-center" },
        { key: "Section", header: "Section", className: "text-left" },
        { key: "Status", header: "Verification Status", className: "text-center" },
        { key: "Remark", header: "Reason for Rejection / Remark", className: "text-left" },
    ];
    const handleLockVerification = async () => {
        const result = await Swal.fire({
            title: "Lock Verification?",
            text: "Are you sure you want to submit the verification request? After submission, editing will be locked.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, Lock",
            cancelButtonText: "Cancel",
        });
        if (pageVerifiedCount < 12) {
            Swal.fire({
                icon: "warning",
                title: "Verification Incomplete",
                text: "Please verify all pages before locking the verification.",
                confirmButtonColor: "#3085d6",
                confirmButtonText: "OK",
            });
            return;
        }
        if (!result.isConfirmed) return;
        if (!userMobile) {
            Swal.fire("Mobile Not Found", "User mobile number not available for OTP.", "error");
            return;
        }


        otpServiceVerification.sendOTP();
    };

    const otpServiceVerification = OTPService({
        mobileNo: String(userMobile),
        purpose: "SubmitVerificationReport",
        isVerifyRequired: true,
        messege: "OTP verification required for submitting verification report",
        isDuplicateCheck: false,

        onSuccess: async () => {
            setSubmitting(true);

            try {
                const res = await agent.post(RequestVerification, {
                    instituteID,
                    userLoginID: id,
                    ipAddress,
                    remarks: "Verification request submitted."
                });

                if (res.data?.Status === "Success") {
                    await Swal.fire(
                        "Success",
                        "Verification request submitted successfully.",
                        "success"
                    );

                    await Promise.allSettled([
                        fetchInspectionDateRange(),
                        checkEligibilityForVerification()
                    ]);

                    // navigate("/SDILOI/InspectionVerification");
                } else {
                    await Swal.fire(
                        "Warning",
                        res.data?.Message || "Failed to submit verification request.",
                        "warning"
                    );
                }
            } catch (err) {
                await Swal.fire(
                    "Error",
                    err?.Message || "Something went wrong.",
                    "error"
                );
            } finally {
                setSubmitting(false);
            }
        },

        onError: (error) => {
            setSubmitting(false);
            Swal.fire(
                "Verification Failed",
                error.message || "OTP verification failed.",
                "error"
            );
        },

        onCancel: () => {
            setSubmitting(false);
        },
    });

    const handleUnlockVerification = async () => {
        const result = await Swal.fire({
            title: "Unlock Verification?",
            text: "Are you sure you want to withdraw the verification request?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, Unlock",
            cancelButtonText: "Cancel",
        });

        if (!result.isConfirmed) return;
        if (!userMobile) {
            Swal.fire("Mobile Not Found", "User mobile number not available for OTP.", "error");
            return;
        }

        otpServiceWithdrawVerification.sendOTP();
    };

    const otpServiceWithdrawVerification = OTPService({
        mobileNo: String(userMobile),
        purpose: "WithdrawVerificationRequest",
        isVerifyRequired: true,
        messege: "OTP verification required for Unlock verification",
        isDuplicateCheck: false,

        onSuccess: async () => {
            setSubmitting(true);

            try {
                const res = await agent.post(WithdrawVerification, {
                    instituteID,
                    userLoginID: id,
                    ipAddress,
                    remarks: "Verification request withdrawn."
                });

                if (res.data?.Status === "Success") {
                    await Swal.fire(
                        "Success",
                        "Verification request withdrawn successfully.",
                        "success"
                    );

                    await Promise.allSettled([
                        fetchInspectionDateRange(),
                        checkEligibilityForVerification()
                    ]);

                    //navigate("/SDILOI/InspectionVerification");
                } else {
                    await Swal.fire(
                        "Warning",
                        res.data?.Message || "Failed to withdraw verification request.",
                        "warning"
                    );
                }
            } catch (err) {
                await Swal.fire(
                    "Error",
                    err?.response?.data?.Message || "Something went wrong.",
                    "error"
                );
            } finally {
                setSubmitting(false);
            }
        },

        onError: (error) => {
            setSubmitting(false);
            Swal.fire(
                "Verification Failed",
                error.Message || "OTP verification failed.",
                "error"
            );
        },

        onCancel: () => {
            setSubmitting(false);
        },
    });

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="p-4">
            <fieldset className="rounded border border-gray-300 p-4 mb-6 bg-white shadow-sm">
                <legend className={`rounded border border-gray-300 ${color} px-4 py-1 text-xl font-bold text-white`}>
                    Inspection Report
                </legend>

                <div className="p-4">
                    <InstituteDetailsCard instituteCode={userLoginID} />
                </div>

                {/* Applications */}
                <div className="mt-6 border border-gray-300 rounded-lg">
                    <div className="bg-gray-100 px-4 py-2 font-semibold">Applications</div>
                    <div className="p-4">
                        <div className="flex items-center gap-6 flex-wrap">
                            <button onClick={openLoIPopup} className="px-6 py-2 bg-[#658bf5] text-white text-base rounded-lg font-semibold hover:bg-blue-600 transition shadow-md">
                                LoI Application
                            </button>
                            <button onClick={openLoIPdf} className="px-6 py-2 bg-[#1db981] text-white text-base rounded-lg font-semibold hover:bg-green-600 transition shadow-md">
                                Letter of Intent
                            </button>
                            <button onClick={openInspectionPopup} className="px-6 py-2 bg-[#f5a32e] text-white text-base rounded-lg font-semibold hover:bg-orange-500 transition shadow-md">
                                Inspection Application
                            </button>
                            {isInspectionCompleted && (
                                <button onClick={openInspectionReportPopup} className="px-6 py-2 bg-purple-600 text-white text-base rounded-lg font-semibold hover:bg-purple-700 transition shadow-md">
                                    Inspection Report
                                </button>
                            )}
                            {(VerificationStatus === "V" && (UserTypeID == 81 || UserTypeID == 501)) && (
                                <button onClick={openVerificationReportPopup} className="px-6 py-2 bg-pink-600 text-white text-base rounded-lg font-semibold hover:bg-pink-700 transition shadow-md">
                                    Verification Report
                                </button>

                            )}
                        </div>
                    </div>
                </div>

                {/* Important Dates */}
                <div className="border border-gray-300 rounded-lg overflow-visible mt-4">
                    <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Important Date</th>
                                <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border border-gray-300 px-3 py-2">LoI Issuance Date</td>
                                <td className="border border-gray-300 px-3 py-2">{inspectionDateRange?.LoIIssuanceDate || "-"}</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-300 px-3 py-2">LoI Expiry Date</td>
                                <td className="border border-gray-300 px-3 py-2">{inspectionDateRange?.LoIExpiryDate || "-"}</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-300 px-3 py-2">Inspection Request Submission Date</td>
                                <td className="border border-gray-300 px-3 py-2">{inspectionDateRange?.InspectionRequestSubmissionDate || "-"}</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-300 px-3 py-2">Inspection Request Date Range</td>
                                <td className="border border-gray-300 px-3 py-2">
                                    {fromDate && toDate
                                        ? `${fmtDate(inspectionDateRange?.InspectionRequestStartDate)} to ${fmtDate(inspectionDateRange?.InspectionRequestEndDate)}`
                                        : "-"}
                                </td>
                            </tr>
                            <tr>
                                <td className="border border-gray-300 px-3 py-2 font-medium">Inspection Date Scheduled by DVETO</td>
                                <td className="border border-gray-300 px-3 py-2">
                                    <span className="font-semibold text-gray-700">
                                        {scheduledDate ? fmtDate(scheduledDate) : "—"}
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <td className="border border-gray-300 px-3 py-2 font-medium">Actual Inspection Date by DVETO</td>
                                <td className="border border-gray-300 px-3 py-2">
                                    {inspectionStatus === "S" ? (
                                        <span className="font-semibold text-gray-700">
                                            {inspectionDateRange?.ActualInspectionDateByDVETO || "-"}
                                        </span>
                                    ) : (
                                        <DateInput
                                            label="Select Actual Inspection Date"
                                            value={actualInspectionDate ? fmtDate(actualInspectionDate) : ""}
                                            onChange={(date) => setActualInspectionDate(date)}
                                            minDate={parseDate(inspectionDateRange?.InspectionRequestSubmissionDate)}
                                            maxDate={maxAllowedDate}
                                            disabled={Boolean(isLocked)}
                                        />
                                    )}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Delay Remark */}
                <div className="mt-6 border border-gray-300 rounded">
                    <div className="bg-[#f3f4f6] px-3 py-2 font-semibold">Reason for delay in Inspection</div>
                    <div className="p-4">
                        <textarea
                            value={remark}
                            onChange={(e) => { setRemark(e.target.value); setErrors(prev => ({ ...prev, remark: undefined })); }}
                            rows={3}
                            className="w-full border border-gray-300 rounded p-2"
                            placeholder="Please provide reason..."
                            disabled={Boolean(isLocked) || UserTypeID === 81}
                        />
                    </div>
                </div>

                {/* Verification table */}
                <div className="mt-6">
                    <FilteredTableComponent
                        data={verificationData}
                        columns={verificationColumns}
                        searchable={false}
                        sortable={false}
                        exportable={false}
                        showSearch={false}
                        showExport={false}
                        renderCell={renderCell}
                        maxHeight="900px"
                        title="Verification Details"
                    />
                </div>

                {/* Post-submission signed report section */}
                {inspectionStatus === "S" && (
                    <>
                        <div className="mt-4 rounded-md border border-blue-200 bg-blue-50 p-4 mb-2">
                            <p className="text-sm text-blue-700"><span className="font-medium">Note:</span></p>
                            <ol className="list-decimal list-inside mt-1 space-y-1 text-sm text-blue-700">
                                <li>Download the Inspection Report in 3 Copies.</li>
                                <li>Inspection Chairman and Members shall sign on all 3 Copies.</li>
                                <li>1st and 2nd Signed Copy to be sent to Board and respective Regional Office via Speed Post and 3rd copy to be retained by respective District Office.</li>
                                <li>Board shall review only those Institutes for which signed inspection report is received from District Office.</li>
                                <li>During review process, Board may call for additional information from Institute, District Office and/or Inspection Committee.</li>
                            </ol>
                        </div>
                        <div className="mt-3">
                            <div className="flex gap-4">
                                <div className="w-1/2">
                                    <DateInput
                                        label="Select Date on which Signed Inspection Report sent to Board and Regional Office"
                                        value={signedInspectionDate ? fmtDate(signedInspectionDate) : ""}
                                        onChange={(date) => setSignedInspectionDate(date)}
                                        minDate={parseDate(inspectionDateRange?.ActualInspectionDateByDVETO)}
                                        maxDate={maxAllowedDate}
                                        position="top"
                                        disabled={UserTypeID === 81}
                                    />
                                </div>

                                {VerificationStatus === "V" && (
                                    <div className="w-1/2">
                                        <DateInput
                                            label="Board Verification Date"
                                            value={
                                                inspectionDateRange.BoardVerificationDate
                                                    ? fmtDate(inspectionDateRange.BoardVerificationDate)
                                                    : ""
                                            }
                                            position="top"
                                            disabled
                                        />
                                    </div>
                                )}
                            </div>

                            {UserTypeID === 14 && (
                                <button
                                    onClick={handleSubmitInspectionReportDate}
                                    className="px-6 py-2 bg-green-600 text-white rounded disabled:opacity-50 mt-3"
                                >
                                    {submitting ? "Processing..." : "Submit Report Date"}
                                </button>
                            )}
                        </div>
                    </>
                )}


                {/* Action buttons */}
                <div className="flex justify-center gap-6 mt-8">
                    {UserTypeID != 501 &&
                        <button
                            onClick={() => navigate(UserTypeID === 81 ? "/SDILOI/InspectionVerification" : "/DVETO/Inspection")}
                            className="px-6 py-3 bg-cyan-500 text-white rounded text-sm"
                            disabled={submitting}
                        >
                            Back
                        </button>
                    }
                    {UserTypeID == 14 &&
                        pageVerifiedCount !== verificationData.length && (
                            inspectionStatus === "S" && UserTypeID === 14 ? (
                                <button onClick={handleWithdrawInspection} className="px-6 py-2 bg-red-600 text-white rounded disabled:opacity-50" disabled={submitting}>
                                    {submitting ? "Processing..." : "Withdraw Inspection Report"}
                                </button>
                            ) : inspectionStatus === "WD" || inspectionStatus === "I" ? (
                                <button onClick={handleSubmitInspectionReport} className="px-6 py-2 bg-green-600 text-white rounded disabled:opacity-50" disabled={submitting}>
                                    {submitting ? "Processing..." : "Submit Inspection Report"}
                                </button>
                            ) : null
                        )}
                    {UserTypeID == 81 && (
                        <>
                            {VerificationStatus === "V" ? (
                                <button
                                    onClick={handleUnlockVerification}
                                    className="px-6 py-2 bg-red-600 text-white rounded disabled:opacity-50"
                                    disabled={submitting}
                                >
                                    {submitting ? "Processing..." : "Unlock Verification"}
                                </button>
                            ) : (
                                <button
                                    onClick={handleLockVerification}
                                    className="px-6 py-2 bg-green-600 text-white rounded disabled:opacity-50"
                                    disabled={submitting}
                                >
                                    {submitting ? "Processing..." : "Lock Verification"}
                                </button>  
                            )}
                        </>
                    )}

                    <button onClick={() => {
                        if(UserTypeID==14){
                            navigate("/DVETO/OngoingInspection")
                        } else {
                            navigate("/SDILOI/InspectionVerification")
                        }
                    }} className="bg-gray-500 px-6 py-2 text-white rounded" disabled={submitting}>
                        Close
                    </button>
                </div>
            </fieldset>
        </div>
    );
};

export default InspectionReport;