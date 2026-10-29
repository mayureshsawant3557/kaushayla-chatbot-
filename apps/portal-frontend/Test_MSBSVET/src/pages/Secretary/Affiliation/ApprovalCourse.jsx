import React, { useState, useEffect, useContext, useRef } from "react";

import { useSearchParams } from "react-router-dom";

import agent from "../../../lib/api/agent";

import Swal from "sweetalert2";

import FilteredTableComponent from "../../../Component/formcomponent/FilteredTableComponent";

// import { DateInput } from "../../../Component/formcomponent/DateInputComponent";

import { useLoading } from "../../../Hooks/useLoading";

import { FiSave, FiEye } from "react-icons/fi";

import { ThemeContext } from "../../../Component/Context/ThemeContext";
import { createPortal } from "react-dom";
import { FiSearch } from "react-icons/fi";

import {
   
    GetPromoterDetailsByInstituteID
} from "../../../Endpoints_All/Base/Institute";

import {
    GetCourseDetailsWithApprovalOrder,
    GetApprovalOrdersByYear,
    SaveCourseApprovalOrder,
    GetInstituteCodeDetails,
} from "../../../Endpoints_All/Institute/institute";

import { getIp } from "../../../Endpoints_All/Utils/fileUpload";
import { send_message } from "../../../Endpoints_All/OTP/otp";

/* ============================================================
   YEAR OPTIONS
============================================================ */

const buildYearOptions = () => {
    const currentYear = new Date().getFullYear();

    const years = [];

    for (let y = currentYear + 1; y >= currentYear - 26; y--) {
        years.push({
            value: y.toString(),
            label: y.toString(),
        });
    }

    return years;
};

/* ============================================================
   DATE FORMAT
============================================================ */

const formatDisplayDate = (isoDateString) => {
    if (!isoDateString) return "-";

    const d = new Date(isoDateString);

    if (isNaN(d.getTime())) return "-";

    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();

    return `${dd}-${mm}-${yyyy}`;
};

/* ============================================================
   ISO -> DD/MM/YYYY
============================================================ */

const isoToDDMMYYYY = (isoDateString) => {
    if (!isoDateString) return "";

    const d = new Date(isoDateString);

    if (isNaN(d.getTime())) return "";

    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();

    return `${dd}/${mm}/${yyyy}`;
};

/* ============================================================
   DD/MM/YYYY -> YYYY-MM-DD
============================================================ */

const ddmmyyyyToISO = (ddmmyyyy) => {
    if (!ddmmyyyy || !/^\d{2}\/\d{2}\/\d{4}$/.test(ddmmyyyy)) {
        return null;
    }

    const [dd, mm, yyyy] = ddmmyyyy.split("/");

    return `${yyyy}-${mm}-${dd}`;
};

/* ============================================================
   APPROVED CATEGORY VALIDATION
============================================================ */

const isApprovedCategoryInvalid = (category) => {
    if (category === null || category === undefined) {
        return true;
    }

    const str = String(category).trim().toLowerCase();

    return (
        str === "" ||
        str === "na" ||
        str === "n/a" ||
        str === "null" ||
        str === "undefined" ||
        str === "-"
    );
};

/* ============================================================
   ROW KEY
============================================================ */

const getRowKey = (row, index) => {
    if (row?.UnitCode) {
        return `${row.CourseID}-${row.UnitCode}`;
    }

    if (row?.id) {
        return row.id;
    }

    return `${row?.CourseID || 0}-${row?.ShiftID || 0}-${row?.UnitNo || 0}-${index}`;
};

/* ============================================================
   SEARCHABLE NORMAL DROPDOWN
============================================================ */

// const NormalDropWithSearch = ({
//   value,
//   options = [],
//   onChange,
//   placeholder = "Select",
//   disabled = false,
//   loading = false,
// }) => {
//   const [open, setOpen] = useState(false);
//   const [search, setSearch] = useState("");

//   const wrapperRef = useRef(null);

//   const selectedOption = options.find(
//     (option) => String(option.value) === String(value),
//   );

//   const filteredOptions = options.filter((option) =>
//     String(option.label || "")
//       .toLowerCase()
//       .includes(search.toLowerCase()),
//   );

//   /* ========================================================
//        CLOSE DROPDOWN WHEN CLICKING OUTSIDE
//     ======================================================== */

//   useEffect(() => {
//     const handleOutsideClick = (event) => {
//       if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
//         setOpen(false);
//         setSearch("");
//       }
//     };

//     document.addEventListener("mousedown", handleOutsideClick);

//     return () => {
//       document.removeEventListener("mousedown", handleOutsideClick);
//     };
//   }, []);

//   const handleSelect = (option) => {
//     onChange(option.value);

//     setOpen(false);
//     setSearch("");
//   };

//   return (
//     <div
//       ref={wrapperRef}
//       className="relative w-full min-w-[100px] max-w-[150px]"
//     >
//       {/* =================================================
//                SELECT BUTTON
//             ================================================= */}

//       <button
//         type="button"
//         disabled={disabled}
//         onClick={() => {
//           if (!disabled) {
//             setOpen((prev) => !prev);
//           }
//         }}
//         className={`
//                     w-full
//                     min-h-[38px]
//                     px-3
//                     py-2
//                     text-left
//                     text-sm
//                     border
//                     rounded-md
//                     bg-white
//                     flex
//                     items-center
//                     justify-between
//                     gap-2
//                     ${
//                       disabled
//                         ? "bg-gray-100 text-gray-400 cursor-not-allowed"
//                         : "border-gray-300 hover:border-gray-400"
//                     }
//                 `}
//       >
//         <span className="truncate">
//           {loading ? "Loading..." : selectedOption?.label || placeholder}
//         </span>

//         <span className="text-gray-500 text-xs">{open ? "▲" : "▼"}</span>
//       </button>

//       {/* =================================================
//                DROPDOWN
//             ================================================= */}

//       {open && !disabled && (
//         <div
//           className="
//                         absolute
//                         z-[9999]
//                         left-0
//                         right-0
//                         mt-1
//                         bg-white
//                         border
//                         border-gray-300
//                         rounded-md
//                         shadow-lg
//                         overflow-hidden
//                     "
//         >
//           {/* SEARCH */}

//           <div className="p-2 border-b bg-gray-50">
//             <input
//               type="text"
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               autoFocus
//               placeholder="Search..."
//               className="
//                                 w-full
//                                 px-3
//                                 py-2
//                                 text-sm
//                                 border
//                                 border-gray-300
//                                 rounded-md
//                                 outline-none
//                                 focus:ring-2
//                                 focus:ring-blue-200
//                             "
//             />
//           </div>

//           {/* OPTIONS */}

//           <div className="max-h-[220px] overflow-y-auto">
//             {loading ? (
//               <div className="px-3 py-3 text-sm text-gray-500 text-center">
//                 Loading...
//               </div>
//             ) : filteredOptions.length === 0 ? (
//               <div className="px-3 py-3 text-sm text-gray-500 text-center">
//                 No options found
//               </div>
//             ) : (
//               filteredOptions.map((option) => (
//                 <button
//                   key={option.value}
//                   type="button"
//                   onClick={() => handleSelect(option)}
//                   className={`
//                                         w-80px
//                                         text-left
//                                         px-3
//                                         py-2
//                                         text-sm
//                                         hover:bg-gray-100
//                                         ${
//                                           String(option.value) === String(value)
//                                             ? "bg-blue-50 font-semibold"
//                                             : ""
//                                         }
//                                     `}
//                 >
//                   {option.label}
//                 </button>
//               ))
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

/* ============================================================
   SIMPLE DROPDOWN WITH SEARCH
============================================================ */

const NormalDropWithSearch = ({
    value,
    options = [],
    onChange,
    placeholder = "Select",
    disabled = false,
    loading = false,
}) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

    const wrapperRef = useRef(null);
    const buttonRef = useRef(null);

    const selectedOption = options.find(
        (option) => String(option.value) === String(value),
    );

    const filteredOptions = options.filter((option) =>
        String(option.label || "")
            .toLowerCase()
            .includes(search.toLowerCase()),
    );

    useEffect(() => {
        if (!open || !buttonRef.current) return;

        const updatePosition = () => {
            const rect = buttonRef.current.getBoundingClientRect();
            setCoords({
                top: rect.bottom + window.scrollY + 4,
                left: rect.left + window.scrollX,
                width: rect.width,
            });
        };

        updatePosition();

        window.addEventListener("scroll", updatePosition, true);
        window.addEventListener("resize", updatePosition);

        return () => {
            window.removeEventListener("scroll", updatePosition, true);
            window.removeEventListener("resize", updatePosition);
        };
    }, [open]);

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target) &&
                !event.target.closest("[data-dropdown-panel]")
            ) {
                setOpen(false);
                setSearch("");
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, []);

    const handleSelect = (option) => {
        onChange(option.value);
        setOpen(false);
        setSearch("");
    };

    return (
        <div
            ref={wrapperRef}
            className="relative w-full min-w-[100px] max-w-[150px]"
        >
            <button
                ref={buttonRef}
                type="button"
                disabled={disabled || loading}
                onClick={() => !disabled && !loading && setOpen((prev) => !prev)}
                className={`
          w-full min-h-[38px] px-3 py-2 text-left text-sm
          border rounded-md bg-white flex items-center justify-between gap-2
          ${disabled || loading
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "border-gray-300 hover:border-gray-400"
                    }
        `}
            >
                <span className="truncate">
                    {loading ? "Loading..." : selectedOption?.label || placeholder}
                </span>
                <span className="text-gray-500 text-xs">{open ? "▲" : "▼"}</span>
            </button>

            {open &&
                !disabled &&
                !loading &&
                createPortal(
                    <div
                        data-dropdown-panel
                        style={{
                            position: "absolute",
                            top: coords.top,
                            left: coords.left,
                            width: coords.width,
                            zIndex: 99999,
                        }}
                        className="bg-white border border-gray-300 rounded-md shadow-lg overflow-hidden"
                    >
                        <div className="flex items-center gap-2 px-3 py-2 border-b bg-white">
                            <FiSearch size={14} className="text-gray-400 shrink-0" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                autoFocus
                                placeholder="Search..."
                                className="w-full text-sm outline-none"
                            />
                        </div>

                        <div className="max-h-[200px] overflow-y-auto">
                            {filteredOptions.length === 0 ? (
                                <div className="px-3 py-2 text-sm text-gray-500 text-center">
                                    No options found
                                </div>
                            ) : (
                                filteredOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => handleSelect(option)}
                                        className={`
                      w-full text-left px-3 py-2 text-sm hover:bg-blue-50
                      ${String(option.value) === String(value)
                                                ? "bg-blue-50 font-semibold"
                                                : ""
                                            }
                    `}
                                    >
                                        {option.label}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>,
                    document.body,
                )}
        </div>
    );
};
/* ============================================================
   FULL PAGE LOADER
============================================================ */

const ApprovalPageLoader = () => {
    return (
        <div
            className="
                fixed
                inset-0
                z-[99999]
                bg-white
                flex
                items-center
                justify-center
            "
        >
            <div className="flex flex-col items-center justify-center">
                {/* Spinner */}

                <div
                    className="
                        w-14
                        h-14
                        border-4
                        border-gray-200
                        border-t-blue-600
                        rounded-full
                        animate-spin
                    "
                />

                <div className="mt-5 text-lg font-semibold text-gray-700">
                    Loading Approval Course Details...
                </div>

                <div className="mt-2 text-sm text-gray-500 text-center max-w-md px-4">
                    Please wait while course, shift and unit details are being prepared.
                </div>

                <div className="mt-1 text-xs text-gray-400">
                    This may take a little time.
                </div>
            </div>
        </div>
    );
};

/* ============================================================
   MAIN COMPONENT
============================================================ */

const ApprovalCourseSummary = () => {
    const [searchParams] = useSearchParams();

    const p1 = searchParams.get("p1");

    const p2 = searchParams.get("p2");

    const { color } = useContext(ThemeContext);

    const { startLoading, stopLoading, isLoading } = useLoading();

    /* ========================================================
         STATES
      ======================================================== */

    const [ipAddress, setIpAddress] = useState("0.0.0.0");

    const [collegeID, setCollegeID] = useState(null);

    const [tableData, setTableData] = useState([]);

    const [rowEdits, setRowEdits] = useState({});

    const [pageReady, setPageReady] = useState(false);

    const yearOptions = buildYearOptions();

    const [authorizedRepresentative, setAuthorizedRepresentative] = useState(null);
    const [authorizedRepresentativeMobile, setAuthorizedRepresentativeMobile] = useState("");

    /* ========================================================
         REFS
      ======================================================== */

    const isFetchingRef = useRef(false);

    const isFetchingCollegeIdRef = useRef(false);

    /* ========================================================
         FETCH IP
      ======================================================== */

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

    /* ========================================================
         FETCH COLLEGE ID
      ======================================================== */


    //sms
    

    const fetchPromotersData = async (p2) => {
        try {
            const payload = {
                instituteId: p2,
                userLoginID:  "",
                pageCode: "",
                itemId: "0",
                ipAddress: ipAddress
            };
            console.log(payload);

            const response = await agent.post(
                GetPromoterDetailsByInstituteID,
                payload
            );

            if (
                response.data?.Status === "Success" &&
                response.data?.Data &&
                response.data.Data.length > 0
            ) {
                const promotersData = response.data.Data;

                const authRep = promotersData.find(
                    p =>
                        p.PromoterType === "Authorized Representative" ||
                        p.PromoterTypeID === 5
                );

                if (authRep) {
                    setAuthorizedRepresentative(authRep);

                    // Get MobileNo from Authorized Representative
                    setAuthorizedRepresentativeMobile(
                        String(authRep.MobileNo || "").trim()
                    );
                } else {
                    setAuthorizedRepresentative(null);
                    setAuthorizedRepresentativeMobile("");
                }
               
            } else {
                setAuthorizedRepresentative(null);
                setAuthorizedRepresentativeMobile("");
            }
        } catch (error) {
            console.error("Error fetching promoter details:", error);

            setAuthorizedRepresentative(null);
            setAuthorizedRepresentativeMobile("");
        }
    };
    const sendSMSForCourseApproval = async () => {
        try {
            startLoading();

            const saveResponse = await agent.post(send_message, {
                userID: p2,
                userLoginID: p1,
                purpose: "InspectionRequestDveto",
                messageType: "S",
                mobileNo: authorizedRepresentativeMobile || '', //String(userMobile || "")
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
    const fetchCollegeID = async () => {
        if (!p2) {
            return null;
        }

        if (isFetchingCollegeIdRef.current) {
            return null;
        }

        try {
            isFetchingCollegeIdRef.current = true;

            const response = await agent.get(
                `${GetInstituteCodeDetails}?InstituteID=${p2}`,
            );

            if (response.data?.Status === "Success" && response.data?.Data) {
                const data = Array.isArray(response.data.Data)
                    ? response.data.Data[0]
                    : response.data.Data;

                const resolvedCollegeID = data?.CollegeID || data?.CollegeId;

                if (resolvedCollegeID) {
                    setCollegeID(resolvedCollegeID);

                    return resolvedCollegeID;
                }
            }

            return null;
        } catch (error) {
            console.error("Error fetching CollegeID:", error);

            return null;
        } finally {
            isFetchingCollegeIdRef.current = false;
        }
    };

    /* ========================================================
         FETCH APPROVAL ORDER OPTIONS
      ======================================================== */

    const fetchApprovalOrderOptions = async (year) => {
        if (!year) {
            return [];
        }

        try {
            const response = await agent.get(`${GetApprovalOrdersByYear}/${year}`);

            if (response.data?.Status === "Success" && response.data?.Data) {
                return response.data.Data.map((o) => ({
                    value: o.ApprovalOrderID.toString(),

                    label: o.ApprovalOrderNo,

                    approvalOrderText: o.ApprovalOrder,

                    approvalOrderDate: o.ApprovalOrderDate || o.OrderDate || "",
                }));
            }

            return [];
        } catch (error) {
            console.error("Error fetching approval orders:", error);

            return [];
        }
    };

    /* ========================================================
         BUILD EDIT DATA
      ======================================================== */

    const buildRowEdits = async (rows) => {
        const edits = {};

        rows.forEach((row, index) => {
            const rKey = getRowKey(row, index);

            const savedYear = row.ApprovalOrderYear
                ? row.ApprovalOrderYear.toString()
                : "";

            edits[rKey] = {
                year: savedYear,

                approvalOrderId: row.ApprovalOrderID
                    ? row.ApprovalOrderID.toString()
                    : "",

                approvalOrderNo: row.ApprovalOrderNo || "",

                approvalOrderText: row.ApprovalOrder || "",

                approvalOrderDate: row.ApprovalOrderDate || "",

                effectiveDate: isoToDDMMYYYY(row.EffectiveDate),

                options: [],

                loadingOptions: false,

                dirty: false,
            };
        });

        /* =====================================================
               PRELOAD APPROVAL ORDERS
            ===================================================== */

        const keysWithYear = Object.keys(edits).filter((k) => edits[k].year);

        const yearOptionsCache = {};

        for (const k of keysWithYear) {
            const yr = edits[k].year;

            if (!yearOptionsCache[yr]) {
                yearOptionsCache[yr] = await fetchApprovalOrderOptions(yr);
            }

            edits[k].options = yearOptionsCache[yr] || [];
        }

        return edits;
    };

    /* ========================================================
         FETCH COURSE DETAILS
         
         BACKEND API MUST:
         
         1. usp_GenerateCourseUnitDetails
         2. WAIT
         3. usp_GetCourseDetailsWithApprovalOrder
      ======================================================== */

    const fetchCourseDetails = async (force = false) => {
        if (!p2) {
            return;
        }

        if (isFetchingRef.current && !force) {
            console.log("Course details request already running.");

            return;
        }

        try {
            isFetchingRef.current = true;

            /* =============================================
                         HIDE PAGE
                      ============================================= */

            setPageReady(false);

            /* =============================================
                         SHOW FULL PAGE LOADER
                      ============================================= */

            startLoading();

            /* =============================================
                         API CALL
                         
                         This waits for:
                         
                         GenerateCourseUnitDetails
                         +
                         GetCourseDetailsWithApprovalOrder
                      ============================================= */

            const response = await agent.get(
                `${GetCourseDetailsWithApprovalOrder}/${p2}/${ipAddress}`,
            );

            console.log("Course details response:", response.data);

            /* =============================================
                         PROCESS RESPONSE
                      ============================================= */

            if (response.data?.Status === "Success" && response.data?.Data) {
                const rows = Array.isArray(response.data.Data)
                    ? response.data.Data
                    : [];

                setTableData(rows);

                const edits = await buildRowEdits(rows);

                setRowEdits(edits);
            } else {
                setTableData([]);

                setRowEdits({});
            }

            /* =============================================
                         PAGE READY
                      ============================================= */

            setPageReady(true);
        } catch (error) {
            console.error("Error fetching course details:", error);

            setTableData([]);

            setRowEdits({});

            Swal.fire({
                icon: "error",
                title: "Unable to Load Data",
                text:
                    error?.Error ||
                    "Unable to load approval course details.",
                confirmButtonColor: "#d33",
            });

            setPageReady(true);
        } finally {
            isFetchingRef.current = false;

            stopLoading();
        }
    };

    /* ========================================================
         INITIAL PAGE LOAD
      ======================================================== */

    useEffect(() => {
        if (!p2) {
            setPageReady(true);

            return;
        }

        let cancelled = false;

        const initializePage = async () => {
            try {
                setPageReady(false);

                /*
                 * Fetch IP and CollegeID.
                 * They do not control the main course
                 * data request.
                 */

                await Promise.all([fetchIP(), fetchCollegeID(), fetchPromotersData(p2)]);

                if (cancelled) {
                    return;
                }

                /*
                 * IMPORTANT:
                 *
                 * This waits until backend has completed:
                 *
                 * GenerateCourseUnitDetails
                 *             ↓
                 * GetCourseDetailsWithApprovalOrder
                 */

                await fetchCourseDetails();
               
            } catch (error) {
                console.error("Page initialization error:", error);

                if (!cancelled) {
                    setPageReady(true);
                }
            }
        };

        initializePage();

        return () => {
            cancelled = true;
        };
    }, [p2]);

    /* ========================================================
         YEAR CHANGE
      ======================================================== */

    const handleYearChange = async (rowKey, year) => {
        setRowEdits((prev) => ({
            ...prev,

            [rowKey]: {
                ...prev[rowKey],

                year,

                approvalOrderId: "",

                approvalOrderNo: "",

                approvalOrderText: "",

                approvalOrderDate: "",

                options: [],

                loadingOptions: true,

                dirty: true,
            },
        }));

        if (!year) {
            setRowEdits((prev) => ({
                ...prev,

                [rowKey]: {
                    ...prev[rowKey],

                    loadingOptions: false,
                },
            }));

            return;
        }

        const options = await fetchApprovalOrderOptions(year);

        setRowEdits((prev) => ({
            ...prev,

            [rowKey]: {
                ...prev[rowKey],

                options,

                loadingOptions: false,
            },
        }));
    };

    /* ========================================================
         APPROVAL ORDER CHANGE
      ======================================================== */

    const handleApprovalOrderChange = (rowKey, approvalOrderId) => {
        setRowEdits((prev) => {
            const current = prev[rowKey] || {};

            const selected = (current.options || []).find(
                (o) => String(o.value) === String(approvalOrderId),
            );

            return {
                ...prev,

                [rowKey]: {
                    ...current,

                    approvalOrderId,

                    approvalOrderNo: selected?.label || "",

                    approvalOrderText: selected?.approvalOrderText || "",

                    approvalOrderDate: selected?.approvalOrderDate || "",

                    dirty: true,
                },
            };
        });
    };

    /* ========================================================
         EFFECTIVE DATE CHANGE
      ======================================================== */

    const handleEffectiveDateChange = (rowKey, value) => {
        setRowEdits((prev) => ({
            ...prev,

            [rowKey]: {
                ...prev[rowKey],

                effectiveDate: value,

                dirty: true,
            },
        }));
    };

    /* ========================================================
         SAVE APPROVAL ORDER
      ======================================================== */

    const handleSaveCourseApproval = async (row) => {
        const rKey = row.id;

        const edit = rowEdits[rKey] || {};

        /* =============================================
                   CATEGORY VALIDATION
                ============================================= */

        if (isApprovedCategoryInvalid(row.ApprovedCategory)) {
            Swal.fire(
                "Validation",
                "Cannot save for rows with invalid or null Approved Category.",
                "warning",
            );

            return;
        }

        /* =============================================
                   COLLEGE ID
                ============================================= */

        let targetCollegeID = collegeID;

        if (!targetCollegeID) {
            targetCollegeID = await fetchCollegeID();
        }

        if (!targetCollegeID) {
            Swal.fire(
                "Error",
                "CollegeID not resolved yet for this Institute.",
                "error",
            );

            return;
        }

        /* =============================================
                   YEAR
                ============================================= */

        if (!edit?.year) {
            Swal.fire("Validation", "Please select Year first", "warning");

            return;
        }

        /* =============================================
                   APPROVAL ORDER
                ============================================= */

        if (!edit?.approvalOrderId) {
            Swal.fire("Validation", "Please select Approval Order No.", "warning");

            return;
        }

        /* =============================================
                   EFFECTIVE DATE
                ============================================= */

        if (edit?.effectiveDate && !ddmmyyyyToISO(edit.effectiveDate)) {
            Swal.fire(
                "Validation",
                "Please enter a valid Effective Date (dd/mm/yyyy)",
                "warning",
            );

            return;
        }

        try {
            startLoading();

            const payload = {
                CollegeID: parseInt(targetCollegeID),

                CourseID: parseInt(row.CourseID),

                ApprovalOrderID: parseInt(edit.approvalOrderId),

                EffectiveDate: ddmmyyyyToISO(edit.effectiveDate) || null,

                UserLoginID: p1 || "",

                IPAddress: ipAddress || "0.0.0.0",

                UnitCode: row.UnitCode ? parseInt(row.UnitCode) : 0,
            };

            const response = await agent.post(SaveCourseApprovalOrder, payload, {
                headers: {
                    "Content-Type": "application/json-patch+json",

                    accept: "text/plain",
                },
            });

            if (response.data?.Status === "Success") {
                await Swal.fire({
                    icon: "success",
                    title: "Success",
                    text: "Approval order saved successfully!",
                    confirmButtonColor: "#3085d6",
                });

                /*
                 * Reload:
                 *
                 * Generate
                 *      ↓
                 * Get approval data
                 */

                await fetchCourseDetails(true);
                
               
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: response.data?.Message || "Error saving approval order.",
                    confirmButtonColor: "#d33",
                });
            }
        } catch (error) {
            console.error("Save approval error:", error);

            const apiMessage =
                error?.response?.data?.Message || "Error saving approval order.";

            Swal.fire({
                icon: "error",
                title: "Error",
                text: apiMessage,
                confirmButtonColor: "#d33",
            });
        } finally {
            stopLoading();
        }
    };

    /* ========================================================
         VIEW APPROVAL ORDER
      ======================================================== */

    const handleViewApprovalOrder = (approvalOrderText) => {
        if (!approvalOrderText) {
            Swal.fire({
                title: "No Approval Order",

                text: "No approval order available to view.",

                icon: "info",
            });

            return;
        }

        const isFilePath = /\.(pdf|jpg|jpeg|png)$/i.test(approvalOrderText);

        if (isFilePath) {
            const popupWidth = 900;

            const popupHeight = 700;

            const left = (window.screen.width - popupWidth) / 2;

            const top = (window.screen.height - popupHeight) / 2;

            const popup = window.open(
                "",
                "ApprovalOrder_Viewer",
                `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes`,
            );

            if (popup) {
                popup.document.write(`
                        <html>
                            <head>
                                <title>
                                    Approval Order
                                </title>

                                <style>
                                    body {
                                        margin: 0;
                                    }

                                    iframe {
                                        border: none;
                                        width: 100vw;
                                        height: 100vh;
                                    }
                                </style>
                            </head>

                            <body>

                                <iframe
                                    src="${approvalOrderText}"
                                ></iframe>

                            </body>
                        </html>
                    `);

                popup.document.close();

                popup.focus();
            }
        } else {
            Swal.fire({
                title: "Approval Order",

                text: approvalOrderText,

                icon: "info",

                confirmButtonColor: "#3085d6",
            });
        }
    };

    /* ========================================================
         DISPLAY DATA
      ======================================================== */

    const displayData = tableData.map((row, index) => {
        const rKey = getRowKey(row, index);

        return {
            ...row,

            id: rKey,

            sn: index + 1,

            rowIndex: index,
        };
    });

    /* ========================================================
         TABLE COLUMNS
      ======================================================== */

    const columns = [
        {
            key: "sn",
            header: "S.N.",
            className: "text-center",
            width: "50px",
            sortable: false,
        },

        {
            key: "CourseName",
            header: "Course",
            width: "220px",
            searchable: true,
            sortable: false,
        },

        {
            key: "ShiftID",
            header: "Shift",
            className: "text-center",
            width: "70px",
            sortable: false,
        },

        {
            key: "UnitNo",
            header: "Unit",
            className: "text-center",
            width: "70px",
            sortable: false,
        },

        {
            key: "UnitCode",
            header: "Unit ID",
            className: "text-center",
            width: "100px",
            sortable: false,
        },

        {
            key: "ApprovedCategory",
            header: "Approved Category",
            className: "text-center",
            width: "140px",
            sortable: false,
        },

        {
            key: "year",
            header: "Approval Year",
            className: "text-center",
            width: "150px",
            sortable: false,
        },

        {
            key: "approvalOrderNo",
            header: "Approval Order No.",
            className: "text-center",
            width: "100px",
            sortable: false,
        },

        {
            key: "approvalOrderDate",
            header: "Approval Order Date",
            className: "text-center",
            width: "150px",
            sortable: false,
        },

        {
            key: "effectiveDate",
            header: "Effective Date",
            className: "text-center",
            width: "190px",
            sortable: false,
        },

        {
            key: "approvalOrder",
            header: "Approval Order",
            className: "text-center",
            width: "160px",
            sortable: false,
        },
    ];

    const ddmmyyyyToInputDate = (ddmmyyyy) => {
        if (!ddmmyyyy || !/^\d{2}\/\d{2}\/\d{4}$/.test(ddmmyyyy)) return "";
        const [dd, mm, yyyy] = ddmmyyyy.split("/");
        return `${yyyy}-${mm}-${dd}`;
    };

    const inputDateToDDMMYYYY = (inputDate) => {
        if (!inputDate) return "";
        const [yyyy, mm, dd] = inputDate.split("-");
        return `${dd}/${mm}/${yyyy}`;
    };

    const formatDDMMYYYY_today = () => {
        const d = new Date();
        const dd = String(d.getDate()).padStart(2, "0");
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const yyyy = d.getFullYear();
        return `${dd}/${mm}/${yyyy}`;
    };
    /* ========================================================
         RENDER CELL
      ======================================================== */

    const renderCell = (row, column) => {
        const rKey = row.id || getRowKey(row, row.rowIndex);

        const edit = rowEdits[rKey] || {};

        const isRowDisabled = isApprovedCategoryInvalid(row.ApprovedCategory);

        /* =============================================
                   APPROVED CATEGORY
                ============================================= */

        if (column.key === "ApprovedCategory") {
            return row.ApprovedCategory || "NA";
        }

        /* =============================================
                   YEAR
                ============================================= */

        if (column.key === "year") {
            return (
                <NormalDropWithSearch
                    options={yearOptions}
                    value={edit.year || ""}
                    onChange={(value) => handleYearChange(rKey, value)}
                    placeholder="Select Year"
                    disabled={isRowDisabled || isLoading}
                />
            );
        }

        /* =============================================
                   APPROVAL ORDER
                ============================================= */

        if (column.key === "approvalOrderNo") {
            return (
                <NormalDropWithSearch
                    options={edit.options || []}
                    value={edit.approvalOrderId || ""}
                    onChange={(value) => handleApprovalOrderChange(rKey, value)}
                    placeholder="Select Approval Order"
                    disabled={isRowDisabled || !edit.year || isLoading}
                    loading={edit.loadingOptions}
                />
            );
        }

        /* =============================================
                   APPROVAL ORDER DATE
                ============================================= */

        if (column.key === "approvalOrderDate") {
            return formatDisplayDate(edit.approvalOrderDate);
        }

        /* =============================================
                   EFFECTIVE DATE
                ============================================= */

        if (column.key === "effectiveDate") {
            return (
                <input
                    type="date"
                    value={ddmmyyyyToInputDate(edit.effectiveDate)}
                    onChange={(e) =>
                        handleEffectiveDateChange(rKey, inputDateToDDMMYYYY(e.target.value))
                    }
                    max={ddmmyyyyToInputDate(formatDDMMYYYY_today())}
                    disabled={isRowDisabled || isLoading}
                    className={`
        w-full min-h-[38px] px-3 py-2 text-sm border rounded-md bg-white
        ${isRowDisabled || isLoading
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "border-gray-300 hover:border-gray-400"
                        }
      `}
                />
            );
        }

        /* =============================================
                   APPROVAL ORDER / SAVE
                ============================================= */

        if (column.key === "approvalOrder") {
            const text = edit.approvalOrderText;

            return (
                <div
                    className="
                            flex
                            items-center
                            justify-center
                            gap-2
                        "
                >
                    {/* VIEW */}

                    <button
                        type="button"
                        onClick={() => handleViewApprovalOrder(text)}
                        disabled={!text}
                        className={`
                                flex
                                items-center
                                gap-1
                                text-sm
                                font-medium

                                ${text
                                ? "text-blue-600 hover:text-blue-800"
                                : "text-gray-400 cursor-not-allowed"
                            }
                            `}
                    >
                        <FiEye size={16} />

                        {text ? "View" : "NA"}
                    </button>

                    {/* SAVE */}

                    <button
                        type="button"
                        onClick={() => handleSaveCourseApproval(row)}
                        disabled={isRowDisabled || isLoading || !edit.dirty}
                        className={`
                                flex
                                items-center
                                gap-1
                                text-sm
                                font-semibold
                                rounded
                                px-3
                                py-1.5
                                transition-colors

                                ${!isRowDisabled && edit.dirty
                                ? "bg-[#28a745] hover:bg-[#218838] text-white cursor-pointer"
                                : "bg-gray-200 text-gray-400 cursor-not-allowed"
                            }
                            `}
                    >
                        <FiSave size={16} />
                        Save
                    </button>
                </div>
            );
        }

        return row[column.key] || "";
    };

    /* ========================================================
         FULL PAGE LOADER
         
         IMPORTANT:
         Do this BEFORE rendering the main page.
      ======================================================== */

    if (!pageReady || isLoading) {
        return <ApprovalPageLoader />;
    }

    
    

    /* ========================================================
         MAIN PAGE
      ======================================================== */

    return (
        <div
            className="
                w-full
                p-4
            "
        >
            <fieldset
                className="
                    rounded-lg
                    border
                    border-gray-300
                    bg-white
                    shadow-lg
                    p-4
                "
            >
                <legend
                    className={`
                        flex
                        ${color}
                        items-center
                        text-base
                        font-semibold
                        text-white
                        border-2
                        border-gray-300
                        px-3
                        py-1.5
                        rounded-md
                        ml-4
                    `}
                >
                    Approval Course Details
                </legend>

                <div
                    className="
                        mt-4
                    "
                >
                    {/* <div className="flex justify-end mt-4">
                        <button
                            type="button"
                            onClick={async () => {
                                await sendSMSForCourseApproval();
                            }}
                            className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-5 py-2 rounded-md shadow-sm transition-colors duration-200"
                        >
                            Send SMS
                        </button>
                    </div> */}
                    <FilteredTableComponent
                        data={displayData}
                        columns={columns}
                        filterColumns={["CourseName"]}
                        title=""
                        exportFileName="Approval_Course_Details"
                        tableId="approval-course-table"
                        searchable={true}
                        sortable={false}
                        showExcelTemplate={false}
                        exportable={false}
                        showSearch={true}
                        showExcel={false}
                        showPDF={false}
                        showExport={false}
                        maxHeight="600px"
                        stickyHeader={true}
                        readOnly={false}
                        renderCell={renderCell}
                        emptyMessage="No course/unit data available"
                    />
                </div>
            </fieldset>
        </div>
    );
};

export default ApprovalCourseSummary;
