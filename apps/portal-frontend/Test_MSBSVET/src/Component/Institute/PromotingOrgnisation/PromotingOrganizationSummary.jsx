import React, { useState, useEffect, useContext, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { SwalHelper } from "../../../utils/swalHelper";
import { useAssociatedInstitutes } from "../../../lib/hooks/useAssociatedInstitutes";
import OTPService from "../../../Component/formcomponent/OTPService";
import FilteredTableComponent from "../../../Component/formcomponent/FilteredTableComponent";
import { ThemeContext } from "../../../Component/Context/ThemeContext";
import agent from "../../../lib/api/agent";
import { getDeviceIP, maskString } from "../../../utils/CommonHelper";
import Loader from "../../../Component/formcomponent/Loader";
import {
    GetPromotingOrganisationDetails,
    GetPromoterDetailsByInstituteID,
    GetAssociatedInstituteByPromotingOrganisationID,
    PromotingOrganizationDashboardRejectStatusCounts,
    GetStatusProposedOrganisation,
    UpdateProposedOrganisationStatus
} from "../../../Endpoints_All/Secretary/PromotingOrganisation";

import VerifiedIcon from "../../../assets/VerifiedIcon.jpg";
import PendingIcon from "../../../assets/QuestionMark.png";
import RejectedIcon from "../../../assets/NotVerifiedIcon.jpg";
import { useAuth } from "../../../Hooks/AuthContext";

/* Builds "Title FirstName MiddleName LastName", skipping empty parts */
const buildFullName = (p) =>
    [p?.Title, p?.FirstName, p?.MiddleName, p?.LastName]
        .filter(Boolean)
        .join(" ");

/* ─── Main Component ─── */
const PromotingOrganizationSummary = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(true);

    const [details, setDetails] = useState({});
    const [promoters, setPromoters] = useState({});
    const [institutes, setInstitutes] = useState({});

    const [statusCode, setStatusCode] = useState("");
    const [rejectCnt, setRejectCnt] = useState(0);
    const [verifyCnt, setVerifyCnt] = useState(0);

    // Separate show/hide state for each table so toggling one eye
    // does not affect the other tables.
    const [showMobile, setShowMobile] = useState({
        authorizedRep: false,
        principal: false,
        members: false,
    });

    const toggleMobile = (tableKey) =>
        setShowMobile((prev) => ({ ...prev, [tableKey]: !prev[tableKey] }));

    const { instituteId } = useAssociatedInstitutes();
    const [declarationChecked, setDeclarationChecked] = useState(false);
    const params = new URLSearchParams(location.search);
    const instituteIdFromUrl = params.get("instituteId");

    const { color } = useContext(ThemeContext);

    const { userInfo } = useAuth();

    const authorizedMobileNo = promoters?.authorizedPerson?.[0]?.MobileNo || "";

    const isVerificationMode = userInfo?.UserTypeID === 81;

    useEffect(() => {
        if (!instituteId && !instituteIdFromUrl) return;
        loadData();
    }, [instituteId, instituteIdFromUrl]);

    const loadData = async () => {
        const ipAddress = await getDeviceIP();
        try {
            setIsLoading(true);

            const instituteIdVal =
                instituteId || instituteIdFromUrl || userInfo?.InstituteID;

            const payload = {
                instituteId: Number(instituteIdVal),
                exitInstituteID: Number(instituteIdVal),
                userLoginID: userInfo?.UserLoginID || "",
                pageCode: "PromotingOrganizationSummary",
                itemId: Number(instituteIdVal),
                ipAddress: ipAddress || ""
            };

            // 🔹 DETAILS
            const detailsRes = await agent.post(
                GetPromotingOrganisationDetails,
                payload
            );
            if (detailsRes.data?.Status === "Success") {
                setDetails(detailsRes.data.Data);
            }

            // 🔹 PROMOTERS (adds FullName = Title + FirstName + MiddleName + LastName)
            const promoterRes = await agent.post(
                GetPromoterDetailsByInstituteID,
                payload
            );
            if (promoterRes.data?.Status === "Success") {
                const data = (promoterRes.data.Data || []).map((x) => ({
                    ...x,
                    FullName: buildFullName(x),
                }));

                const authorized = data.filter(x => x.PromoterTypeID === 5);
                const chairman = data.filter(x => x.PromoterTypeID === 8);
                const members = data.filter(
                    x => x.PromoterTypeID !== 5 && x.PromoterTypeID !== 8
                );

                setPromoters({
                    authorizedPerson: authorized,
                    chairman,
                    members
                });
            }

            // 🔹 INSTITUTES
            const instRes = await agent.post(
                GetAssociatedInstituteByPromotingOrganisationID,
                payload
            );

            if (instRes.data?.Status === "Success") {
                const data = instRes.data.Data;

                const affiliated = data.filter(x => x.PromoterTypeID === 1);
                const applied = data.filter(x => x.PromoterTypeID === 2);

                setInstitutes({
                    affiliated,
                    applied
                });
            }

            // 4. STATUS CODE
            const statusRes = await agent.get(
                GetStatusProposedOrganisation(instituteIdVal)
            );
            const code = statusRes?.data?.Data || "";

            setStatusCode(String(code).trim().toUpperCase());

            // 5. COUNTS
            const countRes = await agent.get(
                PromotingOrganizationDashboardRejectStatusCounts({
                    promotingOrganisationId: instituteIdVal
                })
            );
            const table = countRes?.data?.Data?.Table || [];

            let reject = 0;
            let verify = 0;

            table.forEach((row) => {
                const status = row?.StatusParam?.trim();

                if (row.ValidColumnCount > 0 && status === "R") {
                    reject++;
                }

                if (row.ValidColumnCount > 0 && status === "V") {
                    verify++;
                }
            });

            setRejectCnt(reject);
            setVerifyCnt(verify);

        } catch (error) {
        } finally {
            setIsLoading(false);
        }
    };

    /* ── OTP HANDLING ── */
    const otpActionRef = useRef(null);

    const otpService = OTPService({
        purpose: "VerifyCandidateMobileNo",
        messege: "Enter OTP to proceed",
        isVerifyRequired: true,
        onSuccess: () => {
            if (otpActionRef.current === "LOCK") {
                handleRequestVerification();
            }
            if (otpActionRef.current === "UNLOCK") {
                handleWithdrawVerification();
            }
        },
    });

    /* ── API ACTIONS ── */
    const handleRequestVerification = async () => {
        const ipAddress = await getDeviceIP();

        try {
            await agent.put(
                UpdateProposedOrganisationStatus({
                    proposedOrganisationId: instituteId,
                    userLoginId: userInfo?.UserLoginID,
                    ipAddress: ipAddress || "",
                    statusCode: "S",
                })
            );

            SwalHelper.success("Success", "Verification Requested Successfully");
            setDeclarationChecked(false);
            loadData();
        } catch (err) {
            SwalHelper.error("Error", "Failed to request verification");
        }
    };

    const handleWithdrawVerification = async () => {
        const ipAddress = await getDeviceIP();
        try {
            await agent.put(
                UpdateProposedOrganisationStatus({
                    proposedOrganisationId: instituteId,
                    userLoginId: userInfo?.UserLoginID,
                    ipAddress: ipAddress || " ",
                    statusCode: "U",
                })
            );

            SwalHelper.success("Success", "Verification Withdrawn");
            loadData();
        } catch (err) {
            SwalHelper.error("Error", "Failed to withdraw verification");
        }
    };

    /* ── BUTTON ACTIONS ── */
    const handleLockClick = () => {
        if (!declarationChecked) {
            SwalHelper.info("Information", "Please check the Declaration!");
            return;
        }

        if (!authorizedMobileNo || authorizedMobileNo.length !== 10) {
            SwalHelper.warning("Warning", "Invalid Mobile Number.");
            return;
        }
        SwalHelper.confirm({
            title: "<span style='font-size:20px; font-weight:600;'>Information</span>",

            html: `
        <div style="text-align:left; font-size:16px; font-weight:500; line-height:1.8; color:#f87171;">
            <ul style="list-style-type: disc; padding-left: 25px; margin:0;">
                <li>Once Request for Verification is submitted, the information will be locked.</li>
                <li>You can withdraw request before verification.</li>
            </ul>
        </div>

        <div style="text-align:center; font-size:18px; font-weight:600; margin-top:20px; ">
            Are you sure you want to request verification?
        </div>
    `,

            width: "600px",
        }).then((result) => {
            if (result.isConfirmed) {
                otpActionRef.current = "LOCK";
                otpService.startVerification(authorizedMobileNo);
            }
        });
    };

    const handleUnlockClick = () => {
        if (!authorizedMobileNo || authorizedMobileNo.length !== 10) {
            SwalHelper.warning("Warning", "Invalid Mobile Number.");
            return;
        }

        SwalHelper.confirm({
            title: "<span style='font-size:20px; font-weight:600;'>Information</span>",

            html: `
        <div style="text-align:left; font-size:16px; font-weight:500; line-height:1.8; color:#f87171;">
            <ul style="list-style-type: disc; padding-left: 25px;">
                <li>Request for Verification shall be withdrawn and information will be unlocked.</li>
                <li>You will be able to edit previous pages again.</li>

            </ul>


        </div>
        <div style="text-align:center; font-size:18px; font-weight:600;  margin-top:20px;">
        <h4 style="font-weight:600; text-align:center;">Are you sure you want to withdraw Request for Verification?</h4>
        </div>
    `,

            width: "600px",
        }).then((result) => {
            if (result.isConfirmed) {
                otpActionRef.current = "UNLOCK";
                otpService.startVerification(authorizedMobileNo);
            }
        });
    };

    const getStatusIcon = (status, sizeClass = "w-10 h-10") => {
        const s = (status || "").toString().trim().toUpperCase();

        if (s === "V") {
            return <img src={VerifiedIcon} alt="Verified" className={`${sizeClass} mx-auto`} />;
        }

        if (s === "R") {
            return <img src={RejectedIcon} alt="Rejected" className={`${sizeClass} mx-auto`} />;
        }

        return <img src={PendingIcon} alt="Pending" className={`${sizeClass} mx-auto`} />;
    };

    /* Status badge for the "Promoting Organization" header (same as the print page):
       V = Verified, R = Rejected, anything else = Not Verified */
    const renderOrgStatus = (statusParam) => {
        const s = (statusParam || "").toString().trim().toUpperCase();

        let icon;
        let label;
        let textColor;

        if (s === "V") {
            icon = VerifiedIcon;
            label = "Verified";
            textColor = "text-green-600";
        } else if (s === "R") {
            icon = RejectedIcon;
            label = "Rejected";
            textColor = "text-red-600";
        } else {
            icon = PendingIcon;
            label = "Not Verified";
            textColor = "text-blue-600";
        }

        return (
            <span className="inline-flex items-center gap-2">
                <img src={icon} alt={label} className="w-6 h-6" />
                <span className={`font-bold ${textColor}`}>{label}</span>
            </span>
        );
    };

    const getRemark = (remark, status) => {
        if (status === "V") return "";
        return remark || "-";
    };

    const handleCloseClick = () => {
        if (Number(userInfo?.UserTypeID) === 81) {
            navigate("/Dashboard/DashboardDVET");
        } else {
            navigate("/promotingorganization/dashboard");
        }
    };

    const status = (statusCode || "").toString().trim().toUpperCase();

    const isOrg66 = Number(userInfo?.UserTypeID) === 66;
    const isOrg61 = Number(userInfo?.UserTypeID) === 61;

    let showLock = false;
    let showUnlock = false;
    let showReverify = false;
    let showDeclaration = false;
    let showNext = false;

    if (isOrg66) {
        switch (status) {
            case "I":
                showLock = true;
                break;

            case "S":
                showUnlock = true;
                break;

            case "R":
                showReverify = true;
                break;

            case "U":
                showLock = true;
                break;

            case "V":
                showReverify = rejectCnt > 0;
                break;

            default:
                break;
        }

        showDeclaration = status !== "S";
    } else if (isOrg61) {
        showNext = true;
    }

    const handleBackClick = () => {
        if (userInfo?.UserTypeID === 81) {
            navigate(`/promotingorganization/AssociatedInstitutes?instituteId=${instituteIdFromUrl}`);
        } else {
            navigate("/promotingorganization/AssociatedInstitutes");
        }
    };

    /* ── Columns (Title + FirstName + MiddleName + LastName => FullName) ── */

    /* Mobile No column with an eye icon in the header:
       numbers visible -> open eye (FaEye)
       numbers hidden  -> crossed eye (FaEyeSlash) */
    const buildMobileColumn = (tableKey, isVisible) => ({
        key: "MobileNo",
        header: (
            <span className="inline-flex items-center justify-center gap-2">
                Mobile No
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation(); // don't trigger column sort
                        toggleMobile(tableKey);
                    }}
                    className="text-white hover:text-gray-300"
                    title={isVisible ? "Hide mobile numbers" : "Show mobile numbers"}
                    aria-label={isVisible ? "Hide mobile numbers" : "Show mobile numbers"}
                >
                    {isVisible ? <FaEye size={14} /> : <FaEyeSlash size={14} />}
                </button>
            </span>
        ),
        className: "text-center",
    });

    const buildPersonColumns = (tableKey, isVisible) => [
        { key: "StaffProfileId", header: "Profile ID", className: "text-center" },
        { key: "FullName", header: "Full Name", className: "text-center" },
        { key: "GenderCode", header: "Gender", className: "text-center" },
        buildMobileColumn(tableKey, isVisible),
    ];

    const buildMemberColumns = (tableKey, isVisible) => [
        { key: "SN", header: "Sr. No.", className: "text-center" },
        { key: "StaffProfileId", header: "Profile ID", className: "text-center" },

        { key: "FullName", header: "Full Name", className: "text-center" },
        { key: "GenderCode", header: "Gender", className: "text-center" },
        buildMobileColumn(tableKey, isVisible),
        { key: "PromoterType", header: "Promoter Type", className: "text-center" },
    ];

    /* Status column (verified / not verified / rejected icon), shown to every user */
    const statusColumn = {
        key: "IsapprovedPromoter",
        header: "Status",
        render: (row) => getStatusIcon(row.IsapprovedPromoter, "w-6 h-6"),
        className: "text-center"
    };

    const getTableColumns = (tableKey, isVisible) => {
        if (!isVerificationMode && tableKey === "members") {
            return [...buildMemberColumns(tableKey, isVisible), statusColumn];
        }
        return [...buildPersonColumns(tableKey, isVisible), statusColumn];
    };

    /* One memoized column set per table, so each eye toggles only its own table */
    const authorizedRepColumns = useMemo(
        () => getTableColumns("authorizedRep", showMobile.authorizedRep),
        // eslint-disable-next-line
        [showMobile.authorizedRep, isVerificationMode]
    );
    const principalColumns = useMemo(
        () => getTableColumns("principal", showMobile.principal),
        // eslint-disable-next-line
        [showMobile.principal, isVerificationMode]
    );
    const membersColumns = useMemo(
        () => getTableColumns("members", showMobile.members),
        // eslint-disable-next-line
        [showMobile.members, isVerificationMode]
    );

    const instituteColumns = [
        { key: "SN", header: "Sr. No.", className: "text-center" },
        { key: "InstituteCode", header: "Institute Code", className: "text-center" },
        { key: "NameofInstitute", header: "Name", className: "text-center" },
        { key: "District", header: "District", className: "text-center" },
        { key: "Taluka", header: "Taluka", className: "text-center" },
        { key: "CityorVillage", header: "City/Village", className: "text-center" },
    ];

    const instituteVerificationColumns = [
        ...instituteColumns,
        {
            key: "IsVerified",
            header: "Status",
            render: (row) => getStatusIcon(row.IsVerified),
            className: "text-center"
        },
        {
            key: "Remark",
            header: "Remark",
            render: (row) => getRemark(row.Remark, row.IsVerified),
        }
    ];

    /* Affiliated + Applied Institutes: Status column (verified / not verified) for every user.
       In verification mode the existing Status + Remark columns are kept. */
    const associatedInstituteColumns = isVerificationMode
        ? instituteVerificationColumns
        : [
            ...instituteColumns,
            {
                key: "IsVerified",
                header: "Status",
                render: (row) => getStatusIcon(row.IsVerified, "w-6 h-6"),
                className: "text-center"
            },
        ];

    /* SHARED HELPER: opens a popup whose address bar shows only "about:blank".
       The real page/file is displayed inside a full-size iframe, so no path or
       query string is ever visible in the address bar. */
    const openBlankPopup = ({
        src,
        title = "Document",
        windowName,
        width = 900,
        height = 700,
    }) => {
        const left = (window.screen.width - width) / 2;
        const top = (window.screen.height - height) / 2;

        const popup = window.open(
            "",
            windowName,
            `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,resizable=yes`
        );

        if (!popup) return;

        const safeSrc = new URL(src, window.location.origin).href.replace(/"/g, "&quot;");

        popup.document.open();
        popup.document.write(`<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <title>${title}</title>
    <style>
        html, body { margin: 0; height: 100%; overflow: hidden; }
        iframe { width: 100%; height: 100%; border: 0; }
    </style>
</head>
<body>
    <iframe src="${safeSrc}"></iframe>
</body>
</html>`);
        popup.document.close();
    };

    const extractInstituteData = (htmlString) => {
        if (!htmlString) return { code: "", id: "" };

        const codeMatch = htmlString.match(/>(.*?)</);
        const idMatch = htmlString.match(/P1=(\d+)/);

        return {
            code: codeMatch ? codeMatch[1] : htmlString,
            id: idMatch ? idMatch[1] : "",
        };
    };

    const handleInstituteClick = (row) => {
        const html =
            row?.InstituteCodeForAppliedInstitutes || row?.InstituteCode;

        const { id } = extractInstituteData(html);

        const finalId = id || row?.InstituteID;

        openBlankPopup({
            src: `/react/InstituteDetailsPrint?instituteId=${finalId}&courseCode=0`,
            title: "Institute Details",
            windowName: `InstitutePrint_${finalId}`,
        });
    };

    const handleProfilePrintClick = () => {
        const applicationId = details?.ApplicationID;

        if (!applicationId) return;

        // extract numeric ID
        const instituteId = applicationId.split("P")[1];

        openBlankPopup({
            src: `/React/PromotingOrganizationPrint?instituteId=${instituteId}&promotingOrgId=${applicationId}&userLoginID=${userInfo?.UserLoginID}`,
            title: "Promoting Organization Profile",
            windowName: "PromotingOrganizationPrint",
            width: 1000,
            height: 750,
        });
    };

    /* Staff profile popup (Authorized Representative, Principal Promoter, Promoters)
       opens with a clean address bar. */
    const handleProfileClick = (row) => {
        const applicationId =
            (row?.StaffProfileId || "").replace(/<[^>]*>/g, "") || "";

        if (!applicationId) return;

        const staffID = applicationId.slice(-6);
        const userLoginID = applicationId;

        openBlankPopup({
            src: `/react/StaffPrintApplicationForm?staffID=${staffID}&userLoginID=${userLoginID}`,
            title: "Staff Profile",
            windowName: `StaffPrint_${staffID}`,
        });
    };

    /* Registration Certificate "View File" */
    const handleViewFileClick = (e, filePath) => {
        e.preventDefault();
        if (!filePath) return;

        openBlankPopup({
            src: filePath,
            title: "Registration Certificate",
            windowName: "ViewFilePopup",
        });
    };

    const formatDate = (date) => {
        if (!date || date === "0001-01-01T00:00:00") return "—";
        return new Date(date).toLocaleDateString("en-GB");
    };

    const commonRenderCell = (row, column, tableKey) => {

        // 1. ALWAYS RESPECT COLUMN RENDER FIRST
        if (column.render) {
            return column.render(row);
        }

        // 2. PROFILE CLICK
        if (column.key === "StaffProfileId") {
            const cleanId = (row?.StaffProfileId || "").replace(/<[^>]*>/g, "");

            return (
                <span
                    onClick={() => handleProfileClick(row)}
                    className="text-blue-600 underline cursor-pointer"
                >
                    {cleanId || "-"}
                </span>
            );
        }

        // 3. MOBILE NO (masked unless this table's eye is open)
        if (column.key === "MobileNo") {
            const mobile = row?.MobileNo;
            if (!mobile) return "-";
            return showMobile[tableKey] ? mobile : maskString(mobile);
        }

        // 4. INSTITUTE CLICK (SAFE FOR BOTH TABLES)
        if (column.key === "InstituteCode") {

            const html =
                row?.InstituteCodeForAppliedInstitutes ??
                row?.InstituteCode ??
                "";

            const code = html.replace(/<[^>]*>/g, "");

            return code ? (
                <span
                    onClick={() => handleInstituteClick(row)}
                    className="text-blue-600 underline cursor-pointer"
                >
                    {code}
                </span>
            ) : "-";
        }

        // 5. SAFE DEFAULT (also handles FullName)
        if (!column.key) return "-";

        return row?.[column.key] || "-";
    };

    /* ── Render ── */
    return (
        <>
            {isLoading && <Loader />}
            <div className="p-3">
                <fieldset className="rounded-xl border border-gray-200 bg-white">
                    <legend
                        className={`flex ${color} items-center text-base font-semibold text-white border-2 border-gray-300 px-3 py-1.5 rounded-md ml-4`}
                    >
                        {isVerificationMode
                            ? "Promoting Organization Verification Summary"
                            : "Promoting Organization Summary"}
                    </legend>

                    {/* Print Profile Form button – top center */}
                    <div className="text-center mb-3">
                        <button
                            onClick={handleProfilePrintClick}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded"
                        >
                            <i className="fa fa-print" /> Print Profile Form
                        </button>
                    </div>

                    {/* Main white card */}
                    <div className="bg-white border border-gray-200 rounded p-3">

                        {/* Title */}
                        <div className="text-center mb-4">
                            <div className="text-sm text-gray-700">Promoting Organization</div>
                            <div className="text-sm text-gray-700">
                                Promoting Organization ID:{" "}
                                <span className="font-bold text-gray-900">
                                    {details?.ApplicationID || "N/A"}
                                </span>
                            </div>
                        </div>

                        {/* Details table */}
                        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                            <table className="w-full text-sm">
                                <tbody className="divide-y divide-gray-200">

                                    <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                                        <td colSpan={4} className="px-4 py-2 font-semibold">

                                            <div className="flex items-center gap-2">
                                                <span>Promoting Organization</span>

                                                {renderOrgStatus(details?.IsApprovedPromotingOrganisationStatus)}
                                            </div>

                                        </td>
                                    </tr>

                                    <tr>
                                        <td className="px-4 py-3 font-semibold border-r w-64">
                                            Type of Promoting Organization
                                        </td>
                                        <td className="px-4 py-3" colSpan={3}>
                                            {details?.PromotingOrganisationTypeName || "—"}
                                            {isVerificationMode && details?.IsApprovedPromotingOrganisationType === "R" && (
                                                <div className="mt-1 text-xs text-red-600">
                                                    {details?.RejectResionPromotingOrganisationType || "-"}
                                                </div>
                                            )}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td className="px-4 py-3 font-semibold border-r">
                                            Other Type of Promoting Organisation
                                        </td>
                                        <td className="px-4 py-3" colSpan={3}>
                                            {details?.PromotingOrganizationTypeOther || "—"}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td className="px-4 py-3 font-semibold border-r">
                                            Government / Private Status
                                        </td>
                                        <td className="px-4 py-3" colSpan={3}>
                                            {details?.PromoterStatus || "—"}
                                            {isVerificationMode && details?.IsApprovedPromoterStatus === "R" && (
                                                <div className="mt-1 text-xs text-red-600">
                                                    {details?.RejectResionPromoterStatus || "-"}
                                                </div>
                                            )}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td className="px-4 py-3 font-semibold border-r">
                                            Name of Promoting Organization
                                        </td>
                                        <td className="px-4 py-3 font-bold" colSpan={3}>
                                            {details?.NameOfPromotingOrganization || "—"}
                                            {isVerificationMode && details?.IsApprovedOrganizatioName === "R" && (
                                                <div className="mt-1 text-xs text-red-600">
                                                    {details?.RejectResionOrganizatioName || "-"}
                                                </div>
                                            )}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td className="px-4 py-3 font-semibold border-r">
                                            Registration Date
                                        </td>
                                        <td className="px-4 py-3" colSpan={3}>
                                            {formatDate(details?.PromotingOrganizationRegistrationDate)}
                                            {isVerificationMode && (
                                                <div className="mt-1 text-xs">
                                                    {details?.IsApprovedRegistrationDate === "V" && "✔"}
                                                    {details?.IsApprovedRegistrationDate === "R" && (
                                                        <>
                                                            ❓ <span className="text-red-600">{details?.RejectResionRegistrationDate || "-"}</span>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td className="px-4 py-3 font-semibold border-r">
                                            Registration Number
                                        </td>
                                        <td className="px-4 py-3" colSpan={3}>
                                            {details?.OrganizatioRegistrationNumber || "—"}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td className="px-4 py-3 font-semibold border-r">
                                            Upload Registration Certificate
                                        </td>
                                        <td className="px-4 py-3" colSpan={3}>
                                            {details?.RegistrationCertificatePath ? (
                                                <a
                                                    href={details.RegistrationCertificatePath}
                                                    onClick={(e) => handleViewFileClick(e, details.RegistrationCertificatePath)}
                                                    className="text-blue-600 underline cursor-pointer"
                                                >
                                                    View File
                                                </a>
                                            ) : "—"}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td className="px-4 py-3 font-semibold border-r">
                                            PAN
                                        </td>
                                        <td className="px-4 py-3" colSpan={3}>
                                            {details?.PAN || "—"}
                                            {isVerificationMode && details?.IsApprovedPAN === "R" && (
                                                <div className="mt-1 text-xs text-red-600">
                                                    {details?.RejectResionPAN || "-"}
                                                </div>
                                            )}
                                        </td>
                                    </tr>

                                    {/* SECTION: Address */}
                                    <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                                        <td colSpan={4} className="px-4 py-2 font-semibold">
                                            Address
                                        </td>
                                    </tr>

                                    <tr>
                                        <td className="px-4 py-3 font-semibold border-r">
                                            Address
                                        </td>
                                        <td className="px-4 py-3" colSpan={3}>
                                            {details?.PromotingOrganizationAddress || "—"}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td className="px-4 py-3 font-semibold border-r">
                                            Pin Code
                                        </td>
                                        <td className="px-4 py-3 border-r">
                                            {details?.PromotingOrganizationPincode || "—"}
                                        </td>

                                        <td className="px-4 py-3 font-semibold bg-gray-50/50">
                                            City / Village
                                        </td>
                                        <td className="px-4 py-3">
                                            {details?.PromotingOrganizationCityName || "—"}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td className="px-4 py-3 font-semibold border-r">
                                            Taluka
                                        </td>
                                        <td className="px-4 py-3 border-r">
                                            {details?.PromotingOrganizationTaluka || "—"}
                                        </td>

                                        <td className="px-4 py-3 font-semibold bg-gray-50/50">
                                            District
                                        </td>
                                        <td className="px-4 py-3">
                                            {details?.PromotingOrganizationDistrict || "—"}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td className="px-4 py-3 font-semibold border-r">
                                            State
                                        </td>
                                        <td className="px-4 py-3" colSpan={3}>
                                            {details?.PromotingOrganizationState || "—"}
                                        </td>
                                    </tr>

                                    {/* SECTION: Contact */}
                                    <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                                        <td colSpan={4} className="px-4 py-2 font-semibold">
                                            Contact Details
                                        </td>
                                    </tr>

                                    <tr>
                                        <td className="px-4 py-3 font-semibold border-r">
                                            Phone Number
                                        </td>
                                        <td className="px-4 py-3 border-r">
                                            {details?.AuthorizedRepresentativeMobileNo || "—"}
                                        </td>

                                        <td className="px-4 py-3 font-semibold bg-gray-50/50">
                                            Email ID
                                        </td>
                                        <td className="px-4 py-3">
                                            {details?.AuthorizedRepresentativeEMailID || "—"}
                                        </td>
                                    </tr>

                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* ── Authorized Representative ── */}
                    <div className="mt-4 rounded-xl border border-gray-200 overflow-hidden">

                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 font-semibold text-sm">
                            Authorized Representative
                        </div>

                        <div className="ml-2 mr-2">
                            <FilteredTableComponent
                                data={promoters?.authorizedPerson || []}
                                columns={authorizedRepColumns}
                                renderCell={(row, column) =>
                                    commonRenderCell(row, column, "authorizedRep")
                                }
                                exportable={false}
                                searchable={false}
                            />
                        </div>
                    </div>

                    {/* ── Principal Promoter ── */}
                    <div className="mt-4 rounded-xl border border-gray-200 overflow-hidden">

                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 font-semibold text-sm">
                            Principal Promoter
                        </div>
                        <div className="ml-2 mr-2">
                            <FilteredTableComponent
                                data={promoters?.chairman || []}
                                columns={principalColumns}
                                sortable
                                exportable={false}
                                searchable={false}
                                renderCell={(row, column) =>
                                    commonRenderCell(row, column, "principal")
                                }
                            />
                        </div>

                    </div>

                    {/* ── Promoters ── */}
                    <div className="mt-4 rounded-xl border border-gray-200 overflow-hidden">

                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 font-semibold text-sm">
                            Promoters
                        </div>
                        <div className="ml-2 mr-2">
                            <FilteredTableComponent
                                data={(promoters?.members || []).map((x, i) => ({
                                    ...x,
                                    SN: i + 1
                                }))}
                                columns={membersColumns}
                                sortable
                                exportable={false}
                                searchable={false}
                                renderCell={(row, column) =>
                                    commonRenderCell(row, column, "members")
                                }
                            />
                        </div>

                    </div>

                    {/* ── Affiliated Institutes ── */}
                    <div className="mt-4 rounded-xl border border-gray-200 overflow-hidden">

                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 font-semibold text-sm">
                            Affiliated Institutes
                        </div>
                        <div className="ml-2 mr-2">
                            <FilteredTableComponent
                                data={(institutes?.affiliated || []).map((x, i) => ({
                                    ...x,
                                    SN: i + 1
                                }))}
                                columns={associatedInstituteColumns}
                                sortable
                                exportable={false}
                                searchable={false}
                                renderCell={commonRenderCell}
                            />
                        </div>

                    </div>

                    {/* ── Applied Institutes ── */}
                    <div className="mt-4 rounded-xl border border-gray-200 overflow-hidden">

                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 font-semibold text-sm">
                            Applied Institutes
                        </div>
                        <div className="ml-2 mr-2">
                            <FilteredTableComponent
                                data={(institutes?.applied || []).map((x, i) => ({
                                    ...x,
                                    SN: i + 1
                                }))}
                                columns={associatedInstituteColumns}
                                sortable
                                exportable={false}
                                searchable={false}
                                renderCell={commonRenderCell}
                            />
                        </div>

                    </div>

                    <div className="ml-4">
                        {/* ── Declaration ── */}
                        {showDeclaration && (
                            <div className="mt-4">
                                <div className="text-sm font-bold text-gray-800 mb-2">Declaration</div>
                                <div className="px-3">
                                    <p className="text-sm text-gray-700" style={{ textAlign: "justify", marginBottom: 0 }}>
                                        <label className="inline-flex items-start gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={declarationChecked}
                                                onChange={(e) => setDeclarationChecked(e.target.checked)}
                                                className="mt-1 shrink-0"
                                            />
                                            <span>I hereby declare &amp; understand that,</span>
                                        </label>
                                        <ol className="list-decimal text-sm text-gray-700 mt-1" style={{ marginLeft: 30 }}>
                                            <li>All the information furnished by me in this profile is true, complete and correct to the best of my knowledge and belief.</li>
                                            <li>Entire information furnished by me in this profile is final and binding to me.</li>
                                            <li>If any information furnished by me here, is found to be false or incorrect, I shall be liable for appropriate legal action and my application will be cancelled as per rules.</li>
                                        </ol>
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-5 flex justify-center items-center gap-6 flex-wrap mb-5">

                        <button
                            onClick={handleBackClick}
                            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-medium rounded"
                        >
                            Back
                        </button>

                        {showNext && (
                            <button
                                onClick={() => navigate("../ExistingInstitute/InstituteDetails")}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded"
                            >
                                Next
                            </button>
                        )}

                        {showLock && (
                            <button
                                onClick={handleLockClick}
                                disabled={!declarationChecked}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-medium rounded"
                            >
                                Request Verification
                            </button>
                        )}

                        {showUnlock && (
                            <button
                                onClick={handleUnlockClick}
                                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded"
                            >
                                Withdraw Verification Request
                            </button>
                        )}

                        {showReverify && (
                            <button
                                onClick={handleLockClick}
                                disabled={!declarationChecked}
                                className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-medium rounded"
                            >
                                Request Re-Verification
                            </button>
                        )}

                        <button
                            onClick={() => { handleCloseClick() }}
                            className="px-4 py-2 bg-red-400 hover:bg-red-600 text-white text-sm font-medium rounded"
                        >
                            Close
                        </button>

                    </div>
                </fieldset>
            </div>
        </>
    );
};

export default PromotingOrganizationSummary;