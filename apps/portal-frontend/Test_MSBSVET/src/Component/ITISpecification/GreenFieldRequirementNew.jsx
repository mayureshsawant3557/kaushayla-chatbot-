
import React, { useState, useEffect, useContext, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import agent from "../../lib/api/agent";
import { FiEdit } from "react-icons/fi";
import { FaTrash } from "react-icons/fa";
import { ThemeContext } from "../Context/ThemeContext";
import { useLoading } from "../../Hooks/useLoading";
import { useAuth } from "../../Hooks/AuthContext";

import { GetCoursesWiseRequirementDetails } from "../../Endpoints_All/Institute/existinginstitute";
import { GetInstituteIDByInstituteCode } from "../../Endpoints_All/Base/Institute";
import { getIp } from "../../Endpoints_All/Utils/fileUpload";
import {
    GetMasterSectorByITISTT,
    GetCourseType,
    GetMasterCourseByITISTT,
    GetShortTermApprovedCourseUnitDetails,
} from "../../Endpoints_All/Institute/shortTermCourse";

const ITISTT_FLAG = 2;

const DECLARATION_POINTS = [
    "Instructor Post is sanctioned for the above Units/ shall be provided through Institute Management Committee (IMC) under PPP Scheme",
    "Required constructed/ built-up space is available for the proposed course/ trade/ units.",
    "The demand has been proposed for sanctioned affiliated and to be affiliated CTS units.",
    "The demand covers 652 units sanctioned vide Government of Maharashtra resolution dated 22.06.2023.",
    "The institute has planned to create common facilities as CNC Lab, Computer Lab, Drawing Hall, Library, Class Room, Store Room, Office, Conference Room, Seminar Hall, etc. for optimum utilization of resources.",
    "The demand is placed after utilization of existing available training infrastructure.",
];

const NOTE_POINTS = [
    'Click on "Submit" button to submit information to Regional Office and Head Office.',
];

const cleanOptions = (data) =>
    (data || [])   
        .filter((item) => item.Value != null && Number(item.Value) !== 0 && item.Text && item.Text !== "Select")
        .map((item) => ({ value: item.Value, label: item.Text }));


const SearchableDropdown = ({ options = [], value, placeholder, onChange, disabled }) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 260 });
    const btnRef = useRef(null);
    const panelRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                panelRef.current &&
                !panelRef.current.contains(e.target) &&
                btnRef.current &&
                !btnRef.current.contains(e.target)
            ) {
                setOpen(false);
                setSearch("");
            }
        };
        const closeOnScroll = () => setOpen(false);
        document.addEventListener("mousedown", handleClickOutside);
        window.addEventListener("scroll", closeOnScroll, true);
        window.addEventListener("resize", closeOnScroll);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            window.removeEventListener("scroll", closeOnScroll, true);
            window.removeEventListener("resize", closeOnScroll);
        };
    }, []);

    const toggleOpen = () => {
        if (disabled) return;
        if (!open && btnRef.current) {
            const rect = btnRef.current.getBoundingClientRect();
            setCoords({
                top: rect.bottom + 4,
                left: rect.left,
                width: Math.max(rect.width, 260),
            });
        }
        setOpen((o) => !o);
    };

    const filtered = (options || []).filter((o) => (o.label || "").toLowerCase().includes(search.toLowerCase()));
    const selected = (options || []).find((o) => o.value === value);

    return (
        <>
            <button
                ref={btnRef}
                type="button"
                disabled={disabled}
                onClick={toggleOpen}
                className={`w-full text-left px-2 py-1.5 border rounded text-xs truncate ${
                    disabled
                        ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                        : "bg-white text-gray-800 border-gray-300 hover:border-blue-400"
                }`}
            >
                {selected ? selected.label : placeholder}
            </button>

            {open && !disabled && (
                <div
                    ref={panelRef}
                    style={{ position: "fixed", top: coords.top, left: coords.left, width: coords.width, zIndex: 9999 }}
                    className="bg-white border border-gray-300 rounded shadow-lg"
                >
                    <input
                        autoFocus
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search..."
                        className="w-full px-3 py-2 border-b border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                    />
                    <ul className="max-h-48 overflow-y-auto">
                        {filtered.length === 0 && <li className="px-3 py-2 text-xs text-gray-400">No results</li>}
                        {filtered.map((o) => (
                            <li
                                key={o.value}
                                onClick={() => {
                                    onChange(o.value);
                                    setOpen(false);
                                    setSearch("");
                                }}
                                className={`px-3 py-2 text-xs cursor-pointer hover:bg-blue-50 ${
                                    o.value === value ? "bg-blue-100 font-semibold text-blue-800" : "text-gray-700"
                                }`}
                            >
                                {o.label}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </>
    );
};

const GreenFieldRequirement = () => {
    const { color } = useContext(ThemeContext);
    const { startLoading, stopLoading, isLoading } = useLoading();
    const navigate = useNavigate();
    const { userInfo } = useAuth();
    const loginID = userInfo?.UserLoginID;
    const userTypeID = userInfo?.UserTypeID;
    const userLoginID = userInfo?.UserLoginID || "";

    const [instituteId, setInstituteId] = useState(null);
    const [ipAddress, setIpAddress] = useState("0.0.0.0");

    // Flat list of rows — base rows from the SP + any rows added via "+".
    const [rows, setRows] = useState([]);

    // Dropdown master data (loaded once, same pattern as ProposedCourse.jsx)
    const [sectorOptions, setSectorOptions] = useState([]);
    const [courseTypeOptions, setCourseTypeOptions] = useState([]);
    // Course options are scoped per row being edited, since different rows can have different Sector/CourseType.
    const [courseOptionsByRow, setCourseOptionsByRow] = useState({}); // { [rowKey]: options[] }

    // Which single row (if any) is currently in "edit" mode (Sector/CourseType/Course shown as dropdowns).
    const [editingRowKey, setEditingRowKey] = useState(null);

    const [declarationChecked, setDeclarationChecked] = useState(false);

    // Simple per-column text filters (plain inputs — no popover, so nothing to clip)
    const [filters, setFilters] = useState({ Sector: "", CourseType: "", CourseName: "" });

    const params = new URLSearchParams(window.location.search);
    const p1 = params.get("P1");

    // -------------------- Fetch IP --------------------
    const fetchIP = async () => {
        try {
            const response = await agent.get(getIp, { headers: { accept: "*/*" } });
            console.log("[GreenField] getIp response:", response?.data);
            setIpAddress(response?.data?.ip || "");
        } catch (error) {
            console.error("[GreenField] getIp failed:", error);
            setIpAddress("");
        }
    };

    // -------------------- Fetch Institute ID --------------------
    useEffect(() => {
        const fetchInstituteId = async () => {
            try {
                startLoading();
                const response = await agent.get(GetInstituteIDByInstituteCode, {
                    params: { InstituteCode: loginID },
                });
                console.log("[GreenField] GetInstituteIDByInstituteCode response:", response?.data);
                if (response?.data?.Status === "Success") {
                    setInstituteId(response.data.Data);
                }
            } catch (error) {
                console.error("[GreenField] GetInstituteIDByInstituteCode failed:", error);
            } finally {
                stopLoading();
            }
        };

        if ((userTypeID === 14 || userTypeID === 81) && p1) {
            setInstituteId(p1);
        } else if (loginID) {
            fetchInstituteId();
        }
        fetchIP();
        loadSectors();
        loadCourseTypes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loginID]);

    // -------------------- Sector / Course Type master data (same as ProposedCourse.jsx) --------------------
    const loadSectors = async () => {
        try {
            const response = await agent.get(`${GetMasterSectorByITISTT}?ITISTT=${ITISTT_FLAG}`);
            console.log("[GreenField] GetMasterSectorByITISTT response:", response?.data);
            const options = cleanOptions(response?.data?.Data);
            setSectorOptions(options);
        } catch (error) {
            console.error("[GreenField] GetMasterSectorByITISTT failed:", error);
            setSectorOptions([]);
        }
    };

    const loadCourseTypes = async () => {
        try {
            const response = await agent.get(GetCourseType);
            console.log("[GreenField] GetCourseType response:", response?.data);
            const options =
                response?.data?.Data?.filter((item) => item.CourseTypeID && item.CourseType && item.CourseType !== "Select")
                    .map((item) => ({ value: item.CourseTypeID, label: item.CourseType })) || [];
            setCourseTypeOptions(options);
        } catch (error) {
            console.error("[GreenField] GetCourseType failed:", error);
            setCourseTypeOptions([]);
        }
    };

    // Course dropdown for a specific row — called only when that row is being
    // edited AND both Sector + Course Type are already chosen. Same call
    // shape ProposedCourse.jsx's loadCourses makes.
    const loadCoursesForRow = async (rowKey, sectorId, courseTypeId) => {
        if (!sectorId || !courseTypeId) {
            setCourseOptionsByRow((prev) => ({ ...prev, [rowKey]: [] }));
            return;
        }
        try {
            const response = await agent.get(
                `${GetMasterCourseByITISTT}?SectorID=${sectorId}&CourseTypeID=${courseTypeId}&ITISTT=${ITISTT_FLAG}`
            );
            console.log(
                `[GreenField] GetMasterCourseByITISTT (row=${rowKey}, sector=${sectorId}, courseType=${courseTypeId}) response:`,
                response?.data
            );
            const options = cleanOptions(response?.data?.Data).map((o) => ({ ...o, value: Number(o.value) }));
            setCourseOptionsByRow((prev) => ({ ...prev, [rowKey]: options }));
        } catch (error) {
            console.error("[GreenField] GetMasterCourseByITISTT failed:", error);
            setCourseOptionsByRow((prev) => ({ ...prev, [rowKey]: [] }));
        }
    };

    // -------------------- Compute Required Training Setups --------------------
    const computeRequiredSetups = (approvedUnits, proposedUnits, maxBatchesPerDay) => {
        const total = (Number(approvedUnits) || 0) + (Number(proposedUnits) || 0);
        if (!maxBatchesPerDay || Number(maxBatchesPerDay) <= 0) return total;
        return Math.ceil(total / Number(maxBatchesPerDay));
    };

    // -------------------- Build CourseID -> Sector map from the Proposed Course page's own endpoint --------------------
    // Same call ProposedCourse.jsx's fetchApprovedCourses makes (same payload
    // casing — that endpoint expects PascalCase fields, unlike
    // GetCoursesWiseRequirementDetails which expects camelCase).
    const buildSectorMapFromApprovedCourses = async () => {
        try {
            const payload = {
                InstituteId: instituteId,
                ExitInstituteID: 0,
                UserLoginID: userInfo?.UserLoginID,
                PageCode: "COURSE_LIST",
                ItemId: 0,
                IPAddress: ipAddress,
            };
            const response = await agent.post(GetShortTermApprovedCourseUnitDetails, payload);
            console.log("[GreenField] GetShortTermApprovedCourseUnitDetails (for Sector map) response:", response?.data);

            const apiData = response?.data?.Data?.Table || [];
            const map = {};
            apiData.forEach((item) => {
                // Field name isn't guaranteed here — ProposedCourse.jsx never
                // reads CourseID off this particular response, so check the
                // console log above for the actual key if this comes back empty.
                const courseId = item.CourseID ?? item.CourseId ?? item.courseId;
                if (courseId != null && item.Sector) {
                    map[Number(courseId)] = item.Sector;
                }
            });
            console.log("[GreenField] CourseID -> Sector map built from GetShortTermApprovedCourseUnitDetails:", map);
            return map;
        } catch (error) {
            console.error("[GreenField] GetShortTermApprovedCourseUnitDetails failed:", error);
            return {};
        }
    };

    // -------------------- Fetch base course-wise data --------------------
    const fetchBaseCourseData = async () => {
        if (!instituteId) return;
        try {
            startLoading();
            const payload = {
                instituteId,
                userLoginID: "0",
                pageCode: "GreenFieldRequirement",
                itemId: "0",
                ipAddress,
            };
            const response = await agent.post(GetCoursesWiseRequirementDetails, payload);
            console.log("[GreenField] GetCoursesWiseRequirementDetails response:", response?.data);

            if (response?.data?.Status === "Success") {
                const apiData = response?.data?.Data?.Table || [];

                const baseRows = apiData.map((item) => ({
                    rowKey: `base-${item.CourseID}`,
                    CourseID: item.CourseID,
                    // Not returned by this SP — filled in below from
                    // GetShortTermApprovedCourseUnitDetails where available,
                    // otherwise left blank and pickable from the dropdown.
                    SectorId: "",
                    Sector: "",
                    CourseTypeID: item.CourseTypeID,
                    CourseType: item.CourseType || "",
                    CourseName: item.CourseName || "",
                    ApprovedUnits: item.ApprovedUnits || 0,
                    MaxBatchesPerDay: item.MaxBatchesPerDay || 0,
                    ProposedUnits: 0,
                    isBase: true,
                }));

                console.log("[GreenField] Mapped base rows (before Sector fill):", baseRows);

                const sectorMap = await buildSectorMapFromApprovedCourses();

                // sectorOptions may not have finished loading yet (it's
                // fetched in a separate effect) — fetch it directly here if so.
                let sectorsForMatch = sectorOptions;
                if (sectorsForMatch.length === 0) {
                    const sectorResponse = await agent.get(`${GetMasterSectorByITISTT}?ITISTT=${ITISTT_FLAG}`);
                    sectorsForMatch = cleanOptions(sectorResponse?.data?.Data);
                }
                const sectorObjByLabel = (label) => sectorsForMatch.find((s) => s.label === label);

                const withSector = baseRows.map((r) => {
                    const sectorLabel = sectorMap[Number(r.CourseID)] || "";
                    const sectorObj = sectorLabel ? sectorObjByLabel(sectorLabel) : null;
                    return {
                        ...r,
                        Sector: sectorLabel,
                        SectorId: sectorObj?.value || "",
                    };
                });

                console.log("[GreenField] Final base rows (with Sector filled where available):", withSector);
                setRows(withSector);
            } else {
                setRows([]);
            }
        } catch (error) {
            console.error("[GreenField] GetCoursesWiseRequirementDetails failed:", error);
            setRows([]);
        } finally {
            stopLoading();
        }
    };

    useEffect(() => {
        fetchBaseCourseData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [instituteId]);

    // -------------------- Fetch a single course's Approved Units / Max Batches --------------------
    // Reuses the same SP/endpoint, filtered by itemId = courseId, since
    // Institute_GetCoursesWiseRequirementDetails already accepts @CourseId.
    const fetchCourseDetailsById = async (courseId) => {
        try {
            const payload = {
                instituteId,
                userLoginID: "0",
                pageCode: "GreenFieldRequirement",
                itemId: courseId,
                ipAddress,
            };
            const response = await agent.post(GetCoursesWiseRequirementDetails, payload);
            console.log(`[GreenField] GetCoursesWiseRequirementDetails (single course=${courseId}) response:`, response?.data);
            if (response?.data?.Status === "Success") {
                return (response?.data?.Data?.Table || [])[0] || null;
            }
            return null;
        } catch (error) {
            console.error("[GreenField] fetchCourseDetailsById failed:", error);
            return null;
        }
    };

    const updateRow = (rowKey, patch) => {
        setRows((prev) => prev.map((r) => (r.rowKey === rowKey ? { ...r, ...patch } : r)));
    };

    // -------------------- Add a new row (starts in edit mode, same as the reference "+") --------------------
    const handleAddRow = () => {
        const rowKey = `added-${Date.now()}`;
        const newRow = {
            rowKey,
            CourseID: "",
            SectorId: "",
            Sector: "",
            CourseTypeID: "",
            CourseType: "",
            CourseName: "",
            ApprovedUnits: 0,
            MaxBatchesPerDay: 0,
            ProposedUnits: 0,
            isBase: false,
        };
        setRows((prev) => [...prev, newRow]);
        setEditingRowKey(rowKey);
    };

    // -------------------- Edit / Confirm / Cancel --------------------
    const handleEditRow = (row) => {
        setEditingRowKey(row.rowKey);
        if (row.SectorId && row.CourseTypeID) {
            loadCoursesForRow(row.rowKey, row.SectorId, row.CourseTypeID);
        }
    };

    const handleConfirmRow = (row) => {
        if (!row.CourseID) {
            Swal.fire({
                icon: "warning",
                title: "Incomplete",
                text: "Please select Sector, Course Type and Course before confirming this row.",
                confirmButtonColor: "#3085d6",
            });
            return;
        }
        setEditingRowKey(null);
    };

    const handleCancelRow = (row) => {
        // A brand-new, never-completed row gets removed on cancel; an
        // existing row just exits edit mode with whatever it already had.
        if (!row.isBase && !row.CourseID) {
            setRows((prev) => prev.filter((r) => r.rowKey !== row.rowKey));
        }
        setEditingRowKey(null);
    };

    const handleRowSectorChange = (rowKey, sectorId) => {
        const sectorObj = sectorOptions.find((s) => s.value === sectorId);
        const row = rows.find((r) => r.rowKey === rowKey);
        updateRow(rowKey, {
            SectorId: sectorId,
            Sector: sectorObj?.label || "",
        });
        if (row?.CourseTypeID) {
            loadCoursesForRow(rowKey, sectorId, row.CourseTypeID);
        }
    };

    const handleRowCourseTypeChange = (rowKey, courseTypeId) => {
        const courseTypeObj = courseTypeOptions.find((c) => c.value === courseTypeId);
        const row = rows.find((r) => r.rowKey === rowKey);
        updateRow(rowKey, {
            CourseTypeID: courseTypeId,
            CourseType: courseTypeObj?.label || "",
            CourseID: "",
            CourseName: "",
            ApprovedUnits: 0,
            MaxBatchesPerDay: 0,
        });
        if (row?.SectorId) {
            loadCoursesForRow(rowKey, row.SectorId, courseTypeId);
        }
    };

    const handleRowCourseChange = async (rowKey, courseId) => {
        const options = courseOptionsByRow[rowKey] || [];
        const courseObj = options.find((c) => c.value === Number(courseId));

        const alreadyExists = rows.some((r) => r.rowKey !== rowKey && Number(r.CourseID) === Number(courseId));
        if (alreadyExists) {
            Swal.fire({
                icon: "warning",
                title: "Already Added",
                text: "This course is already present in the Green Field Requirement list.",
                confirmButtonColor: "#3085d6",
            });
            return;
        }

        updateRow(rowKey, { CourseID: courseId, CourseName: courseObj?.label || "" });

        const details = await fetchCourseDetailsById(courseId);
        updateRow(rowKey, {
            ApprovedUnits: details?.ApprovedUnits || 0,
            MaxBatchesPerDay: details?.MaxBatchesPerDay || 0,
        });
    };

    // -------------------- Delete a row --------------------
    const handleDeleteRow = async (row) => {
        const confirm = await Swal.fire({
            icon: "warning",
            title: "Delete Trade?",
            text: `Remove "${row.CourseName || "this row"}" from Green Field Requirement?`,
            showCancelButton: true,
            confirmButtonText: "Yes, Delete",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#d33",
        });
        if (!confirm.isConfirmed) return;

        // TODO: if this row was already saved on your backend (carries a
        // persisted id), call your own delete API here before removing it
        // from local state.

        setRows((prev) => prev.filter((r) => r.rowKey !== row.rowKey));
        if (editingRowKey === row.rowKey) setEditingRowKey(null);
    };

    // -------------------- Proposed Units change --------------------
    const handleProposedUnitsChange = (rowKey, value) => {
        if (value !== "" && !/^\d+$/.test(value)) return;
        updateRow(rowKey, { ProposedUnits: value === "" ? "" : Number(value) });
    };

    // -------------------- Filtering + totals --------------------
    const filteredRows = useMemo(() => {
        return rows.filter((r) => {
            const sectorMatch = (r.Sector || "").toLowerCase().includes(filters.Sector.toLowerCase());
            const typeMatch = (r.CourseType || "").toLowerCase().includes(filters.CourseType.toLowerCase());
            const courseMatch = (r.CourseName || "").toLowerCase().includes(filters.CourseName.toLowerCase());
            return sectorMatch && typeMatch && courseMatch;
        });
    }, [rows, filters]);

    const totals = useMemo(
        () =>
            filteredRows.reduce(
                (acc, r) => {
                    const required = computeRequiredSetups(r.ApprovedUnits, r.ProposedUnits, r.MaxBatchesPerDay);
                    acc.approved += Number(r.ApprovedUnits) || 0;
                    acc.proposed += Number(r.ProposedUnits) || 0;
                    acc.total += (Number(r.ApprovedUnits) || 0) + (Number(r.ProposedUnits) || 0);
                    acc.required += required;
                    return acc;
                },
                { approved: 0, proposed: 0, total: 0, required: 0 }
            ),
        [filteredRows]
    );

    // -------------------- Build Payload (for you to send yourself) --------------------
    const buildPayload = (status) => {
        const lstGreenFieldRequirement = rows.map((row) => ({
            instituteId: parseInt(instituteId) || 0,
            courseId: parseInt(row.CourseID) || 0,
            courseTypeId: parseInt(row.CourseTypeID) || 0,
            sector: row.Sector || "",
            courseName: row.CourseName || "",
            approvedUnits: Number(row.ApprovedUnits) || 0,
            proposedUnits: Number(row.ProposedUnits) || 0,
            totalUnits: (Number(row.ApprovedUnits) || 0) + (Number(row.ProposedUnits) || 0),
            requiredTrainingSetups: computeRequiredSetups(row.ApprovedUnits, row.ProposedUnits, row.MaxBatchesPerDay),
            isBaseCourse: !!row.isBase,
            userLoginID,
            ipAddress,
            pageCode: "GreenFieldRequirement",
        }));

        return {
            instituteId: parseInt(instituteId) || 0,
            status, // "Draft" | "Submitted"
            declarationAccepted: declarationChecked,
            userLoginID,
            ipAddress,
            lstGreenFieldRequirement,
        };
    };

    // -------------------- Save and Next / Submit (NOT wired to an API — add your own call) --------------------
    const handleSaveAndNext = () => {
        const incomplete = rows.some((r) => !r.CourseID);
        if (incomplete) {
            Swal.fire({
                icon: "warning",
                title: "Incomplete Row",
                text: "Please finish selecting Sector / Course Type / Course for every row before saving.",
                confirmButtonColor: "#3085d6",
            });
            return;
        }

        const payload = buildPayload("Draft");
        // TODO: replace this with your own API call, e.g.
        // await agent.post(YourSaveEndpoint, payload);
        console.log("[GreenField] Save and Next payload:", payload);

        Swal.fire({
            icon: "info",
            title: "Payload Ready",
            text: "Payload has been built and logged to the console — wire it up to your save API.",
            confirmButtonColor: "#3085d6",
        });
    };

    const handleSubmit = () => {
        if (!declarationChecked) {
            Swal.fire({
                icon: "warning",
                title: "Declaration Required",
                text: "Please accept the declaration before submitting.",
                confirmButtonColor: "#3085d6",
            });
            return;
        }

        const payload = buildPayload("Submitted");
        // TODO: replace this with your own API call.
        console.log("[GreenField] Submit payload:", payload);

        Swal.fire({
            icon: "info",
            title: "Payload Ready",
            text: "Submit payload has been built and logged to the console — wire it up to your API.",
            confirmButtonColor: "#3085d6",
        });
    };

    const handleBack = () => navigate(-1);
    const handleClose = () => navigate("/institute/dashboard");

    // -------------------- Loader --------------------
    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-white/60 flex items-center justify-center z-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#00c3f9]" />
            </div>
        );
    }

    return (
        <div className="p-6">
            <fieldset className="border border-gray-300 rounded px-4 pt-3 pb-4">
                <legend
                    className={`flex items-center gap-2 rounded-md border border-gray-300 ${color} px-4 py-2 text-xl font-bold text-white shadow-md`}
                >
                    Green Field Requirement
                </legend>

                <div className="mt-4 overflow-x-auto border border-gray-300 rounded">
                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr className="bg-blue-900 text-white">
                                <th className="border border-gray-300 px-2 py-2 w-20 text-center">
                                    <button
                                        type="button"
                                        onClick={handleAddRow}
                                        className="w-7 h-7 flex items-center justify-center bg-blue-500 hover:bg-blue-400 rounded font-bold"
                                        title="Add Trade"
                                    >
                                        +
                                    </button>
                                </th>
                                <th className="border border-gray-300 px-3 py-2 w-16 text-center">S.N.</th>
                                <th className="border border-gray-300 px-3 py-2 text-left">Sector</th>
                                <th className="border border-gray-300 px-3 py-2 text-left">Course Type</th>
                                <th className="border border-gray-300 px-3 py-2 text-left">Course</th>
                                <th className="border border-gray-300 px-3 py-2 w-28 text-center">Approved Units (A)</th>
                                <th className="border border-gray-300 px-3 py-2 w-28 text-center">Proposed Units (B)</th>
                                <th className="border border-gray-300 px-3 py-2 w-28 text-center">Total Units (C=A+B)</th>
                                <th className="border border-gray-300 px-3 py-2 w-32 text-center">Required Training Setups</th>
                            </tr>
                            <tr className="bg-blue-50">
                                <th className="border border-gray-300 px-2 py-1" colSpan={2} />
                                <th className="border border-gray-300 px-2 py-1">
                                    <input
                                        type="text"
                                        value={filters.Sector}
                                        onChange={(e) => setFilters((f) => ({ ...f, Sector: e.target.value }))}
                                        placeholder="Filter..."
                                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                    />
                                </th>
                                <th className="border border-gray-300 px-2 py-1">
                                    <input
                                        type="text"
                                        value={filters.CourseType}
                                        onChange={(e) => setFilters((f) => ({ ...f, CourseType: e.target.value }))}
                                        placeholder="Filter..."
                                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                    />
                                </th>
                                <th className="border border-gray-300 px-2 py-1">
                                    <input
                                        type="text"
                                        value={filters.CourseName}
                                        onChange={(e) => setFilters((f) => ({ ...f, CourseName: e.target.value }))}
                                        placeholder="Filter..."
                                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                    />
                                </th>
                                <th className="border border-gray-300" colSpan={4} />
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRows.length === 0 && (
                                <tr>
                                    <td colSpan={9} className="border border-gray-300 px-3 py-6 text-center text-gray-500 text-sm">
                                        No courses found under Infrastructure &gt; Course/Trade for this institute.
                                    </td>
                                </tr>
                            )}
                            {filteredRows.map((row, idx) => {
                                const isEditing = editingRowKey === row.rowKey;
                                const requiredSetups = computeRequiredSetups(row.ApprovedUnits, row.ProposedUnits, row.MaxBatchesPerDay);
                                const totalUnits = (Number(row.ApprovedUnits) || 0) + (Number(row.ProposedUnits) || 0);

                                return (
                                    <tr key={row.rowKey} className={idx % 2 === 1 ? "bg-gray-50" : ""}>
                                        <td className="border border-gray-300 px-2 py-2 text-center">
                                            {isEditing ? (
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleConfirmRow(row)}
                                                        className="text-green-600 hover:text-green-800 font-bold"
                                                        title="Confirm"
                                                    >
                                                        ✓
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCancelRow(row)}
                                                        className="text-gray-500 hover:text-gray-700 font-bold"
                                                        title="Cancel"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex justify-center gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleEditRow(row)}
                                                        className="text-blue-600 hover:text-blue-800"
                                                        title="Edit"
                                                    >
                                                        <FiEdit size={16} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteRow(row)}
                                                        className="text-red-600 hover:text-red-800"
                                                        title="Delete"
                                                    >
                                                        <FaTrash size={14} />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                        <td className="border border-gray-300 px-3 py-2 text-center">{idx + 1}</td>

                                        <td className="border border-gray-300 px-3 py-2">
                                            {isEditing ? (
                                                <SearchableDropdown
                                                    options={sectorOptions}
                                                    value={row.SectorId}
                                                    placeholder="Select Sector"
                                                    onChange={(val) => handleRowSectorChange(row.rowKey, val)}
                                                />
                                            ) : (
                                                row.Sector || <span className="text-gray-400 text-xs">—</span>
                                            )}
                                        </td>

                                        <td className="border border-gray-300 px-3 py-2">
                                            {isEditing ? (
                                                <SearchableDropdown
                                                    options={courseTypeOptions}
                                                    value={row.CourseTypeID}
                                                    placeholder="Select Course Type"
                                                    onChange={(val) => handleRowCourseTypeChange(row.rowKey, val)}
                                                />
                                            ) : (
                                                row.CourseType || <span className="text-gray-400 text-xs">—</span>
                                            )}
                                        </td>

                                        <td className="border border-gray-300 px-3 py-2">
                                            {isEditing ? (
                                                <SearchableDropdown
                                                    options={courseOptionsByRow[row.rowKey] || []}
                                                    value={row.CourseID}
                                                    placeholder="Select Course"
                                                    disabled={!row.SectorId || !row.CourseTypeID}
                                                    onChange={(val) => handleRowCourseChange(row.rowKey, val)}
                                                />
                                            ) : (
                                                row.CourseName || <span className="text-gray-400 text-xs">—</span>
                                            )}
                                        </td>

                                        <td className="border border-gray-300 px-3 py-2 text-center">{row.ApprovedUnits}</td>

                                        <td className="border border-gray-300 px-3 py-2 text-center">
                                            <input
                                                type="number"
                                                min="0"
                                                step="1"
                                                value={row.ProposedUnits ?? ""}
                                                onChange={(e) => handleProposedUnitsChange(row.rowKey, e.target.value)}
                                                className="w-20 px-2 py-1 border border-gray-300 rounded text-center text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </td>

                                        <td className="border border-gray-300 px-3 py-2 text-center">{totalUnits}</td>
                                        <td className="border border-gray-300 px-3 py-2 text-center">{requiredSetups}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot>
                            <tr className="bg-gray-100 font-bold">
                                <td className="border border-gray-300 px-3 py-2" colSpan={5} style={{ textAlign: "right" }}>
                                    Total
                                </td>
                                <td className="border border-gray-300 px-3 py-2 text-center">{totals.approved}</td>
                                <td className="border border-gray-300 px-3 py-2 text-center">{totals.proposed}</td>
                                <td className="border border-gray-300 px-3 py-2 text-center">{totals.total}</td>
                                <td className="border border-gray-300 px-3 py-2 text-center">{totals.required}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </fieldset>

            <div className="flex justify-center gap-4 mt-6">
                <button
                    type="button"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold text-sm"
                    onClick={handleBack}
                >
                    Back
                </button>
                <button
                    type="button"
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-semibold text-sm"
                    onClick={handleSaveAndNext}
                >
                    Save and Next
                </button>
                <button
                    type="button"
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-semibold text-sm"
                    onClick={handleClose}
                >
                    Close
                </button>
            </div>

            {/* Declaration */}
            <fieldset className="border border-gray-300 rounded px-4 pt-3 pb-4 mt-6">
                <label className="flex items-start gap-2 text-sm text-gray-800">
                    <input
                        type="checkbox"
                        checked={declarationChecked}
                        onChange={(e) => setDeclarationChecked(e.target.checked)}
                        className="mt-1"
                    />
                    <span className="font-medium">
                        I hereby declare that the above information is true and correct to the best of my knowledge.
                    </span>
                </label>
                <ol className="list-decimal list-inside mt-2 space-y-1 text-sm text-gray-700 pl-6">
                    {DECLARATION_POINTS.map((point, idx) => (
                        <li key={idx}>{point}</li>
                    ))}
                </ol>

                <div className="flex justify-center gap-4 mt-6">
                    <button
                        type="button"
                        className="bg-[#00c3f9] hover:bg-[#00a8d6] text-white px-6 py-2 rounded font-semibold text-sm"
                        onClick={handleSaveAndNext}
                    >
                        Save
                    </button>
                    <button
                        type="button"
                        className="bg-[#28a745] hover:bg-[#218838] text-white px-6 py-2 rounded font-semibold text-sm"
                        onClick={handleSubmit}
                    >
                        Submit
                    </button>
                </div>
            </fieldset>

            {/* Notes — placed below the Save/Submit buttons as requested */}
            <div className="mt-4 rounded-md border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm text-blue-700">
                    <span className="font-medium">Note:</span>
                </p>
                <ol className="list-decimal list-inside mt-1 space-y-1 text-sm text-blue-700">
                    {NOTE_POINTS.map((point, idx) => (
                        <li key={idx}>{point}</li>
                    ))}
                </ol>
            </div>
        </div>
    );
};

export default GreenFieldRequirement;