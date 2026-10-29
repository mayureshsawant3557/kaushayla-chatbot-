import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SwalHelper } from "../../utils/swalHelper";
import agent from '../../lib/api/agent';
import Loader from '../../Component/formcomponent/Loader';
import {
    GetInspectionUnitDetails,
    GetInstituteInspectionDateRange,
    SaveInstituteInspectionDateRange,
} from '../../Endpoints_All/NewInstituteApprovalProcess/NewInstituteApprovalProcess';
import { TransactionHistory } from '../../Endpoints_All/Fee/feeManagement';
import { PromotingOrgGetProposedInstituteDetails } from '../../Endpoints_All/Base/Institute';
import { DateInput } from '../../Component/formcomponent/DateInputComponent';
import Staff_PrintApplicationForm from '../../Component/PrintApplicationForm/Staff_PrintApplicationForm';
import OTPService from '../../Component/formcomponent/OTPService';
import { useContext } from "react";
import { ThemeContext } from "../../Component/Context/ThemeContext";
import FilteredTableComponent from "../../Component/formcomponent/FilteredTableComponent";
import { DVETOGetDvetoManagementTypeByDvetoID } from "../../Endpoints_All/Base/DVETO";
import { useAuth } from '../../Hooks/AuthContext';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (v) => (v ?? '') || '—';

const fmtDate = (d) => {
    if (!d) return '—';
    const dt = new Date(d);
    if (isNaN(dt)) return String(d);
    return dt.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatDateForApi = (d) => {
    if (!d) return '';
    if (typeof d === "string" && d.includes("/")) return d;
    const dt = new Date(d);
    if (isNaN(dt)) return '';
    const day = String(dt.getDate()).padStart(2, '0');
    const month = String(dt.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}/${dt.getFullYear()}`;
};

const parseDate = (dateStr) => {
    if (!dateStr) return null;
    const [day, month, year] = dateStr.split('/');
    return new Date(Number(year), Number(month) - 1, Number(day));
};

const normalizeDate = (date) => {
    if (!date) return null;
    const d = typeof date === "string" ? parseDate(date) : new Date(date);
    if (isNaN(d)) return null;
    d.setHours(0, 0, 0, 0);
    return d;
};



//     useEffect(() => {
       
//         // If already found on mount, no polling needed
//         if (userID) return;

//         // Poll sessionStorage until UserID appears (populated by async auth)
//         const interval = setInterval(() => {
//             try {
//                const { userInfo } = useAuth();
//                 if (userInfo?.UserID) {
//                     setUserID(userInfo?.UserID);
//                     clearInterval(interval);
//                 }
//             } catch {
//                 // malformed JSON — keep waiting
//             }
//         }, 200); // check every 200ms

//         // Safety timeout: stop polling after 10 seconds
//         const timeout = setTimeout(() => {
//             clearInterval(interval);
//         }, 10_000);

//         return () => {
//             clearInterval(interval);
//             clearTimeout(timeout);
//         };
//     }, [userID]);

//     return userID;
// };

// ─── Main Component ───────────────────────────────────────────────────────────
const SDIScheduleInspectionForm = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { userInfo } = useAuth();
    const params = new URLSearchParams(location.search);

    const userLoginID = params.get('p1');
    const instituteID = params.get('p2');

    // ✅ Reactive UserID — updates when sessionStorage is populated
   const UserID = userInfo?.UserID;

    // ── State ─────────────────────────────────────────────────────────────────
    const [instituteProfile, setInstituteProfile] = useState(null);
    const [courseData, setCourseData] = useState([]);
    const [transactionData, setTransactionData] = useState([]);
    const [inspectionDateRange, setInspectionDateRange] = useState(null);
    const [userMobile, setUserMobile] = useState('');

    // Loading state broken into two phases:
    // Phase 1 — core institute data (blocks render)
    // Phase 2 — mobile fetch (runs independently, doesn't block UI)
    const [coreLoading, setCoreLoading] = useState(true);
    const [printData, setPrintData] = useState(null);

    const [scheduledDate, setScheduledDate] = useState(null);
    const [remark, setRemark] = useState('');
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const { color } = useContext(ThemeContext);

    // ── Authorized rep — parsed from API ──────────────────────────────────────
    const p = instituteProfile;
    const rawValue = p?.AuthorizedPersonFirstName || '';
    const nameMatch = rawValue.match(/^[^<]+/);
    const name = nameMatch ? nameMatch[0].trim() : '';
    const codeMatch = rawValue.match(/\(([^)]+)\)/);
    const code = codeMatch ? codeMatch[1] : '';
    const staffid = code ? code.slice(-6) : '';
    const imgMatch = rawValue.match(/src="([^"]+)"/);
    const logoUrl = imgMatch ? imgMatch[1] : null;

    const handleCodeClick = () => setPrintData({ staffID: staffid, userLoginID: code });
    const handleReadyToPrint = (pw) => { setTimeout(() => { pw.focus(); pw.print(); }, 300); };
    const handleClosePopup = () => setPrintData(null);

    // ── Date boundaries ───────────────────────────────────────────────────────
    const fromDate = inspectionDateRange?.InspectionRequestStartDate
        ? parseDate(inspectionDateRange.InspectionRequestStartDate) : null;
    const toDate = inspectionDateRange?.InspectionRequestEndDate
        ? parseDate(inspectionDateRange.InspectionRequestEndDate) : null;

    const maxAllowedDate = new Date(2099, 11, 31);
    const scheduled = normalizeDate(scheduledDate);
    const end = normalizeDate(toDate);
    const isDateAfterRange = !!(scheduled && end && scheduled > end);

    // ── Course totals ─────────────────────────────────────────────────────────
    const totals = courseData.reduce(
        (acc, c) => ({
            ApprovedUnits: acc.ApprovedUnits + (c.ApprovedUnits ?? 0),
            LOIProposedUnits: acc.LOIProposedUnits + (c.LOIProposedUnits ?? 0),
            TotalUnits: acc.TotalUnits + (c.TotalUnits ?? 0),
            InspectionUnits: acc.InspectionUnits + (c.InspectionUnits ?? 0),
            InspectionFee: acc.InspectionFee + (c.InspectionFee ?? 0),
            SecurityDeposit: acc.SecurityDeposit + (c.SecurityDeposit ?? 0),
        }),
        { ApprovedUnits: 0, LOIProposedUnits: 0, TotalUnits: 0, InspectionUnits: 0, InspectionFee: 0, SecurityDeposit: 0 }
    );

    // ── Individual fetch functions (isolated — one failure won't block others) ─
    const fetchInstituteProfile = useCallback(async () => {
        try {
            const res = await agent.get(`${PromotingOrgGetProposedInstituteDetails}/${instituteID}/${userLoginID}`);
            if (res.data?.Status === 'Success' && res.data?.Data)
                setInstituteProfile(res.data.Data);
        } catch (err) {
        }
    }, [instituteID, userLoginID]);

    const fetchCourseData = useCallback(async () => {
        try {
            const res = await agent.get(GetInspectionUnitDetails, { params: { instituteId: instituteID } });
            if (res.data?.Status === 'Success')
                setCourseData(res.data.Data.map((item, idx) => ({ ...item, SN: idx + 1 })));
        } catch (err) {
        }
    }, [instituteID]);

    const fetchTransactionHistory = useCallback(async () => {
        try {
            const res = await agent.get(`${TransactionHistory}/${instituteID}`, {
                params: { userTypeId: 64 },
                timeout: 15000,
            });
            if (res.data?.Status === 'Success')
                setTransactionData((res.data.Data || []).filter(x => x.PhaseID === 7));
        } catch (err) {
        }
    }, [instituteID]);

    const fetchInspectionDateRange = useCallback(async () => {
        try {
            const res = await agent.post(GetInstituteInspectionDateRange, {
                instituteId: instituteID,
                exitInstituteID: 0,
                userLoginID,
                pageCode: 'InspectionRequest',
                itemId: 0,
                ipAddress: '',
            });
            if (res.data?.Status === 'Success' && res.data?.Data?.Table?.length > 0)
                setInspectionDateRange(res.data.Data.Table[0]);
        } catch (err) {
        }
    }, [instituteID, userLoginID]);

    // ── Mobile fetch — depends on UserID, runs independently ─────────────────
    const fetchUserMobile = useCallback(async () => {
        if (!UserID) return;
        try {
            const url = `${DVETOGetDvetoManagementTypeByDvetoID}/${UserID}/5`;
            const response = await agent.get(url);
            const data = response?.data;
            if (data?.Status === "Success" && data?.Data?.length > 0) {
                setUserMobile(String(data.Data[0]?.MobileNo || ""));
            } else {
                setUserMobile("");
            }
        } catch (error) {
            setUserMobile("");
        }
    }, [UserID]); // ✅ UserID is now reactive — this recreates when UserID arrives

    // ── Effect 1: Core data — depends only on route params ───────────────────
    // Does NOT include fetchUserMobile — mobile is independent
    useEffect(() => {
        if (!instituteID || !userLoginID) return;

        let cancelled = false; // cleanup guard for strict mode / fast nav

        const loadCoreData = async () => {
            setCoreLoading(true);
            try {
                // ✅ allSettled — each fetch is independent; one failure won't block others
                await Promise.allSettled([
                    fetchInstituteProfile(),
                    fetchCourseData(),
                    fetchTransactionHistory(),
                    fetchInspectionDateRange(),
                ]);
            } finally {
                if (!cancelled) setCoreLoading(false);
            }
        };

        loadCoreData();
        return () => { cancelled = true; };
    }, [
        instituteID, userLoginID,
        fetchInstituteProfile, fetchCourseData,
        fetchTransactionHistory, fetchInspectionDateRange,
    ]);

    // ── Effect 2: Mobile — runs whenever UserID becomes available ─────────────
    // Completely decoupled from core loading so it never blocks the loader
    useEffect(() => {
        if (!UserID) return;
        fetchUserMobile();
    }, [UserID, fetchUserMobile]); // ✅ Runs once when UserID is first set

    // ── Pre-fill fields when inspection date range loads ──────────────────────
    useEffect(() => {
        if (!inspectionDateRange) return;
        if (inspectionDateRange.InspectionScheduledDateByDVETO) {
            setScheduledDate(inspectionDateRange.InspectionScheduledDateByDVETO);
        }
        if (inspectionDateRange.DelayRemark) {
            setRemark(inspectionDateRange.DelayRemark);
        }
    }, [inspectionDateRange]);

    // ── Validation ────────────────────────────────────────────────────────────
    const validate = () => {
        const errs = {};
        const scheduled = normalizeDate(scheduledDate);
        const loiExpiry = inspectionDateRange?.LoIExpiryDate
            ? parseDate(inspectionDateRange.LoIExpiryDate) : null;

        if (!scheduledDate) {
            errs.scheduledDate = "Inspection Scheduled Date is required.";
        }
        if (scheduled && loiExpiry && scheduled > loiExpiry) {
            errs.scheduledDate = "Inspection cannot be scheduled after LoI expiry date.";
        }
        if (isDateAfterRange && !remark.trim()) {
            errs.remark = "Remark is mandatory when the scheduled date is after the requested date range.";
        }
        if (remark.length > 500) {
            errs.remark = "Remark cannot exceed 500 characters.";
        }
        return errs;
    };

    // ── Save (called after OTP success) ───────────────────────────────────────
    const saveDatesAndSubmitRequest = async () => {
        try {
            const payload = {
                entity: {
                    instituteId: instituteID,
                    exitInstituteID: 0,
                    userLoginID,
                    pageCode: 'InspectionSchedule',
                    itemId: 0,
                    ipAddress: '',
                },
                startDate: inspectionDateRange?.InspectionRequestStartDate,
                endDate: inspectionDateRange?.InspectionRequestEndDate,
                submissionDate: inspectionDateRange?.InspectionRequestSubmissionDate,
                delayRemark: isDateAfterRange ? remark.trim() : '',
                InspectionScheduledDateByDVETO: formatDateForApi(scheduledDate),
                DelayRemarkForActual: '',
                ActualInspectionDateByDVETO: '',
                inspectionReportSubmissionDate: '',
                SignedInspectionReportSubmissionDate: '',
            };

            SwalHelper.loading("Submitting", "Saving inspection date...");
            const saveResponse = await agent.post(SaveInstituteInspectionDateRange, payload);
            SwalHelper.close();

            if (saveResponse.data?.Status !== 'Success') {
                await SwalHelper.error("Error", "Failed to save inspection date.");
                navigate("/DVETO/ScheduleInspection");
                return;
            }

            await SwalHelper.success("Success", "Inspection date confirmed successfully!");
            navigate("/DVETO/ScheduleInspection");
        } catch (err) {
            SwalHelper.close();
            await SwalHelper.error("Error", "Failed to confirm date. Please try again.");
            navigate("/DVETO/ScheduleInspection");
        } finally {
            setSubmitting(false);
        }
    };

    // ── Confirm Date — validates then triggers OTP ────────────────────────────
    const handleConfirmDate = async () => {
        const errs = validate();
        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            return;
        }
        setErrors({});
        setSubmitting(true);

        const result = await SwalHelper.confirm({
            title: "Confirm",
            text: "Submit Inspection Date?",
            confirmText: "Yes Submit",
            cancelText: "Cancel"
        });

        if (!result.isConfirmed) {
            setSubmitting(false);
            return;
        }

        if (!userMobile) {
            setSubmitting(false);
            SwalHelper.error("Mobile Not Found", "User mobile number not available for OTP.");
            return;
        }

        otpServiceVerification.sendOTP();
    };

    const otpServiceVerification = OTPService({
        mobileNo: String(userMobile),
        purpose: 'InspectionScheduledDateByDVETOSubmit',
        isVerifyRequired: true,
        messege: 'OTP verification required by DVETO for Inspection Date Submission',
        isDuplicateCheck: false,
        onSuccess: async (data) => {
            await saveDatesAndSubmitRequest();
        },
        onError: (error) => {
            setSubmitting(false);
            SwalHelper.error("Verification Failed", error.message || "OTP verification failed.");
        },
        onCancel: () => {
            setSubmitting(false);
        }
    });

    const openInspectionPopup = () => {
        const popup = window.open(
            `${window.location.origin}/React/InspectionApplication?P1=${instituteID}&P2=${userLoginID}`,
            "InspectionApplication",
            `width=1000,height=750,left=${(window.screen.width - 1000) / 2},top=${(window.screen.height - 750) / 2},resizable=yes,scrollbars=yes`
        );
        if (!popup) SwalHelper.warning("Popup Blocked", "Please allow popups for this website.");
    };

    const openLoIPopup = () => {
        const popup = window.open(
            `${window.location.origin}/React/LOIApplicationPrintForm?P1=${instituteID}&P2=${userLoginID}`,
            "InspectionApplication",
            `width=1000,height=700,left=${(window.screen.width - 1000) / 2},top=${(window.screen.height - 700) / 2},resizable=yes,scrollbars=yes`
        );
        if (!popup) SwalHelper.warning("Popup Blocked", "Please allow popups for this website.");
    };

    const openLoIPdf = () => {
        const popup = window.open(
            `${window.location.origin}/React/PrintLOI?P1=${instituteID}&P2=${userLoginID}`,
            "LetterOfIntent",
            `width=1000,height=700,left=${(window.screen.width - 1000) / 2},top=${(window.screen.height - 700) / 2},resizable=yes,scrollbars=yes`
        );
        if (!popup) SwalHelper.warning("Popup Blocked", "Please allow popups for this website.");
    };

    const InstituteDetailsPopUp = (instituteId, userLoginID) => {
        if (!instituteId) return;
        const popup = window.open(
            //`${window.location.origin}/React/InstituteDetailsPrint?instituteId=${instituteId}&courseCode=${courseCode}`,
            `${window.location.origin}/React/InspectionApplication?P1=${instituteId}&P2=${userLoginID}`,
            "InstituteDetailsPrint",
            `width=1000,height=750,left=${(window.screen.width - 1000) / 2},top=${(window.screen.height - 750) / 2},resizable=yes,scrollbars=yes`
        );
        if (!popup) SwalHelper.warning("Popup Blocked", "Please allow popups.");
    };

    const courseColumns = [
        { key: "SN", header: "Sr.No", width: "60px", sortable: false, className: "text-center" },
        { key: "CourseWithCourseCode", header: "Course", className: "text-center" },
        { key: "ApprovedUnits", header: "Approved Units", className: "text-center" },
        { key: "LOIProposedUnits", header: "LoI Units", className: "text-center" },
        { key: "TotalUnits", header: "Total Units", className: "text-center" },
        { key: "InspectionUnits", header: "Inspection Units", className: "text-center" },
        { key: "InspectionFee", header: "Inspection Fee", className: "text-center" },
        { key: "SecurityDeposit", header: "Security Deposit", className: "text-center" }
    ];

    const feeColumns = [
        { key: "SN", header: "Sr.No", width: "60px", sortable: false, className: "text-center" },
        { key: "Purpose", header: "Purpose", className: "text-center" },
        { key: "TotalAmount", header: "Amount Paid", className: "text-center" },
        { key: "PaymentDate", header: "Payment Date", className: "text-center" },
        { key: "TransactionID", header: "Transaction ID", className: "text-center" },
        { key: "BankRefereneceNo", header: "Payment ID", className: "text-center" }
    ];

    if (coreLoading) return <Loader />;

    // ── JSX (unchanged from original) ────────────────────────────────────────
    return (
        <div className="w-full p-6 bg-white min-h-screen">
            <fieldset className="rounded-xl border border-gray-200 bg-white">
                <legend className={`flex ${color} items-center text-base font-semibold text-white border-2 border-gray-300 px-3 py-1.5 rounded-md ml-4`}>
                    Schedule Inspection
                </legend>

                <div className="p-6 max-w-7xl mx-auto">
                    <div className="mb-6 rounded-xl border border-gray-200 bg-white">
                        <table className="w-full text-sm">
                            <tbody className="divide-y divide-gray-200">

                                <tr>
                                    <td className="px-4 py-3 font-semibold w-48 border-r border-gray-200">Institute Type</td>
                                    <td className="px-4 py-3" colSpan={3}>
                                        {p?.IsNewInst === 1 ? 'New Institute' : 'Existing Institute'}
                                    </td>
                                </tr>

                                <tr className="bg-white">
                                    <td className="px-4 py-3 font-semibold border-r border-gray-200">Institute Name</td>
                                    <td className="px-4 py-3 font-bold" colSpan={3}>
                                        <span>{fmt(p?.InstituteName)} SKILL DEVELOPMENT INSTITUTE</span>
                                        <span
                                            onClick={() => InstituteDetailsPopUp(instituteID, userLoginID)}
                                            className="ml-2 text-blue-600 cursor-pointer underline"
                                        >
                                            ({p?.InstituteCode ?? ''})
                                        </span>
                                    </td>
                                </tr>

                                <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                                    <td colSpan={4} className="px-4 py-2">
                                        <span className="font-semibold tracking-wider text-large">Institute Details</span>
                                    </td>
                                </tr>

                                <tr className="bg-white hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 font-semibold border-r border-gray-200">Address</td>
                                    <td className="px-4 py-3" colSpan={3}>{fmt(p?.InstituteAddress)}</td>
                                </tr>

                                <tr className="bg-white hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 font-semibold border-r border-gray-200">Pin Code</td>
                                    <td className="px-4 py-3 border-r border-gray-200">{fmt(p?.PinCode)}</td>
                                    <td className="px-4 py-3 font-semibold bg-gray-50/50">City/Village</td>
                                    <td className="px-4 py-3">{fmt(p?.City)}</td>
                                </tr>

                                <tr className="bg-white hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 font-semibold border-r border-gray-200">Taluka</td>
                                    <td className="px-4 py-3 border-r border-gray-200">{fmt(p?.Taluka)}</td>
                                    <td className="px-4 py-3 font-semibold bg-gray-50/50">District</td>
                                    <td className="px-4 py-3">{fmt(p?.District)}</td>
                                </tr>

                                <tr className="bg-white hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 font-semibold border-r border-gray-200">State</td>
                                    <td className="px-4 py-3 border-r border-gray-200">{fmt(p?.State)}</td>
                                    <td className="px-4 py-3 font-semibold bg-gray-50/50">Location Category</td>
                                    <td className="px-4 py-3">{fmt(p?.LocationCategory)}</td>
                                </tr>

                                <tr className="bg-white hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 font-semibold border-r border-gray-200">Phone No.</td>
                                    <td className="px-4 py-3 border-r border-gray-200">{fmt(p?.PhoneNo)}</td>
                                    <td className="px-4 py-3 font-semibold bg-gray-50/50">E-Mail ID</td>
                                    <td className="px-4 py-3">{fmt(p?.EMailID)}</td>
                                </tr>

                                <tr className="bg-white hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 font-semibold border-r border-gray-200">Website</td>
                                    <td className="px-4 py-3 border-r border-gray-200">{fmt(p?.WebSite)}</td>
                                    <td className="px-4 py-3 font-semibold bg-gray-50/50">Latitude, Longitude</td>
                                    <td className="px-4 py-3">
                                        {p?.Latitude && p?.Longitude ? `${p.Latitude}, ${p.Longitude}` : '—'}
                                    </td>
                                </tr>

                                <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                                    <td colSpan={4} className="px-4 py-3 font-semibold">Authorized Representative</td>
                                </tr>
                                <tr className="bg-white">
                                    <td colSpan={4} className="px-4 py-3">
                                        <div className="flex items-center gap-3 p-2">
                                            <span className="font-medium">{name}</span>
                                            {code && (
                                                <span
                                                    onClick={handleCodeClick}
                                                    className="text-blue-600 hover:text-blue-800 cursor-pointer font-semibold"
                                                >
                                                    ({code})
                                                </span>
                                            )}
                                            {logoUrl && <img src={logoUrl} alt="Verified" className="w-5 h-5" />}
                                        </div>
                                    </td>
                                </tr>

                                <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                                    <td colSpan={4} className="px-4 py-2">
                                        <span className="font-semibold tracking-wider">Proposed Course</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan={4} className="p-4">
                                        <FilteredTableComponent
                                            data={courseData}
                                            columns={courseColumns}
                                            searchable={false}
                                            sortable={true}
                                            exportable={true}
                                            showSearch={false}
                                            showExport={false}
                                            title="Proposed Course"
                                            customFooter={
                                                <tr className="bg-gray-100 font-semibold text-center">
                                                    <td className="border px-2 py-2 text-center" colSpan={2}>Total</td>
                                                    <td className="border px-2 py-2 text-center">{totals.ApprovedUnits}</td>
                                                    <td className="border px-2 py-2 text-center">{totals.LOIProposedUnits}</td>
                                                    <td className="border px-2 py-2 text-center">{totals.TotalUnits}</td>
                                                    <td className="border px-2 py-2 text-center">{totals.InspectionUnits}</td>
                                                    <td className="border px-2 py-2 text-center">{totals.InspectionFee}</td>
                                                    <td className="border px-2 py-2 text-center">{totals.SecurityDeposit}</td>
                                                </tr>
                                            }
                                        />
                                    </td>
                                </tr>

                                <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                                    <td colSpan={4} className="px-4 py-2">
                                        <span className="font-semibold tracking-wider">Inspection Fees Details</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan={4} className="p-4">
                                        <FilteredTableComponent
                                            data={transactionData.map((item, index) => ({ ...item, SN: index + 1 }))}
                                            columns={feeColumns}
                                            searchable={false}
                                            sortable={true}
                                            exportable={false}
                                            showSearch={false}
                                            showExport={true}
                                            maxHeight="300px"
                                            title="Inspection Fees Details"
                                            emptyStateMessage="No fee payment details found"
                                        />
                                    </td>
                                </tr>

                                <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                                    <td colSpan={4} className="px-4 py-2">
                                        <span className="font-semibold tracking-wider">Applications</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan={4} className="px-4 py-5">
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
                                        </div>
                                    </td>
                                </tr>

                                <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                                    <td colSpan={4} className="px-4 py-2">
                                        <span className="font-semibold tracking-wider">Important Dates</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan={4} className="p-4">
                                        <div className="border border-gray-300 rounded-lg overflow-visible">
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
                                                                ? `${inspectionDateRange?.InspectionRequestStartDate} to ${inspectionDateRange?.InspectionRequestEndDate}`
                                                                : "-"}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td className="border border-gray-300 px-3 py-2 font-medium">Inspection Date Scheduled</td>
                                                        <td className="border border-gray-300 px-3 py-2">
                                                            <div className="space-y-1">
                                                                <DateInput
                                                                    label="Select Scheduled Date"
                                                                    value={scheduledDate}
                                                                    onChange={(date) => {
                                                                        setScheduledDate(date);
                                                                        if (toDate && date && date <= toDate) setRemark('');
                                                                        setErrors(prev => ({ ...prev, scheduledDate: undefined, remark: undefined }));
                                                                    }}
                                                                    required
                                                                    minDate={parseDate(inspectionDateRange?.InspectionRequestSubmissionDate)}
                                                                    maxDate={maxAllowedDate}
                                                                    position="top"
                                                                />
                                                                {errors.scheduledDate && (
                                                                    <p className="text-red-500 text-xs flex items-center gap-1">
                                                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                                        </svg>
                                                                        {errors.scheduledDate}
                                                                    </p>
                                                                )}
                                                                {scheduledDate && fromDate && toDate && isDateAfterRange && (
                                                                    <p className="text-orange-600 text-xs flex items-center gap-1 font-medium">
                                                                        ⚠ Selected date is after the requested range (up to {fmtDate(toDate)}). Remark is mandatory.
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </td>
                                </tr>

                                {isDateAfterRange && (
                                    <tr className="bg-white">
                                        <td className="px-4 py-3 font-semibold border-r border-gray-200 align-top">
                                            <span className="flex items-center gap-1">
                                                Reason for Delay
                                                <span className="text-red-500 text-lg">*</span>
                                            </span>
                                        </td>
                                        <td className="px-4 py-3" colSpan={3}>
                                            <div className="space-y-1">
                                                <textarea
                                                    value={remark}
                                                    onChange={(e) => {
                                                        setRemark(e.target.value);
                                                        setErrors(prev => ({ ...prev, remark: undefined }));
                                                    }}
                                                    rows={3}
                                                    placeholder="Please provide reason for scheduling beyond requested date range..."
                                                    className={`w-full border ${errors.remark ? 'border-red-300' : 'border-gray-200'} rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-gray-50`}
                                                />
                                                {errors.remark && (
                                                    <p className="text-red-500 text-xs flex items-center gap-1">
                                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                        </svg>
                                                        {errors.remark}
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}

                            </tbody>
                        </table>
                    </div>

                    <div className="mt-8 flex items-center justify-between gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/DVETO/ScheduleInspection')}
                            className="inline-flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                            Back
                        </button>

                        <button
                            type="button"
                            onClick={handleConfirmDate}
                            disabled={submitting}
                            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                        >
                            {submitting ? 'Processing...' : 'Confirm Date'}
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate('/Dashboard/DashboardDVET')}
                            className="inline-flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                            Close
                        </button>
                    </div>

                    {printData && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                            <div className="bg-white w-[95%] h-[95%] rounded-xl shadow-2xl relative overflow-hidden">
                                <button
                                    onClick={handleClosePopup}
                                    className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 z-10 transition-all hover:scale-110"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                                <div className="h-full overflow-auto p-6">
                                    <Staff_PrintApplicationForm
                                        staffID={printData.staffID}
                                        userLoginID={printData.userLoginID}
                                        pageCode="STAFF_PRINT"
                                        onReadyToPrint={handleReadyToPrint}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </fieldset>
        </div>
    );
};

export default SDIScheduleInspectionForm;