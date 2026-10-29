import { useContext, useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import { IoClose } from "react-icons/io5";
import { MdOutlineAssignmentInd } from "react-icons/md";
import { ThemeContext } from "../../Component/Context/ThemeContext";
import DropdownComponent from "../../Component/formcomponent/DropdownComponent";
import { DateInput } from "../../Component/formcomponent/DateInputComponent";
import FormComponent from "../../Component/formcomponent/FormComponent";
import agent from "../../lib/api/agent";
import OTPService from "../../Component/formcomponent/OTPService";
import Swal from "sweetalert2";
import { GetInstituteAndManagementMobile } from "../../Endpoints_All/ITISpecification/itiSpecification";
// import { DVETOGetDvetoManagementTypeByDvetoID } from "../../Endpoints_All/Base/masterData"; // User will provide endpoint path later
import { DVETOGetDvetoManagementTypeByDvetoID, ROGetRoManagementTypeByRoID } from "../../Endpoints_All/Base/DVETO";
import { GetInstituteIDByInstituteCode } from "../../Endpoints_All/Base/Institute";
import {

    GetMasterDistrict


} from '../../Endpoints_All/Base/location';


import {
    GetStaffID,
    GetMasterTableList,
} from "../../Endpoints_All/Base/masterData";
import { GetStaffSummary } from "../../Endpoints_All/Staff/summary";
import {
    GetElectionDutyList,
    GetConstituencyByDistrict,
    SaveElectionDutyStaff,
    UpdateElectionDutyDeputation,
    DeleteElectionDutyStaff,
    DeleteElectionDutyDeputation,
} from "../../Endpoints_All/Institute/ElectionDuty";
import { SwalHelper } from "../../utils/swalHelper";
import { getDeviceIP } from "../../utils/CommonHelper";
import { useAuth } from "../../Hooks/AuthContext";

const NATURE_OPTIONS = [
    { value: "Full Time", label: "Full Time" },
    { value: "Part Time", label: "Part Time" },
];

const EMPTY_DEPUTATION = {
    deputationID: 0,
    from: "",
    to: "",
    districtID: "",
    district: "",
    constituencyID: "",
    constituency: "",
    nature: "Full Time",
};

// ── Excel Export ───────────────────────────────────────────
const exportToExcel = (rows) => {
    const data = [];
    let sn = 1;

    rows.forEach((row) => {
        const fullName = `${row.title}`.trim();

        row.deputations.forEach((dep) => {
            data.push({
                "S.N.": sn,
                "Profile ID": row.profileId,
                Name: fullName,
                Designation: row.designation,
                "Deputation From": dep.from,
                "Deputation To": dep.to,
                District: dep.district,
                Constituency: dep.constituency,
                "Nature of Deputation": dep.nature,
            });
        });

        sn++;
    });

    const ws = XLSX.utils.json_to_sheet(data);

    ws["!cols"] = [
        { wch: 6 },
        { wch: 15 },
        { wch: 35 },
        { wch: 20 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 20 },
        { wch: 18 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Election Duty");
    XLSX.writeFile(wb, "Election_Duty.xlsx");
};

// ── Helper: get userLoginID from session ──────────────────
const getUserLoginID = () => {
   const { userInfo } = useAuth();
    return userInfo?.UserLoginID || "";
};

/* ══════════════════════════════════════════
   STEP 1 — Staff Search Popup
══════════════════════════════════════════ */
const StaffSearchPopup = ({ onClose, onStaffFetched, existingRows = [] }) => {
    const [searchID, setSearchID] = useState("");
    const [popupError, setPopupError] = useState("");
    const [loading, setLoading] = useState(false);
    const [fetched, setFetched] = useState(false);
    const [staffData, setStaffData] = useState(null);
    const [duplicateWarning, setDuplicateWarning] = useState(null);

    const handleSearch = async () => {
        setPopupError("");
        if (!searchID.trim()) {
            setPopupError("Staff / Management Profile ID is required.");
            return;
        }
        setLoading(true);
        try {
            const ipAddress = await getDeviceIP();
            const resStaffId = await agent.get(
                `${GetStaffID}?ApplicationID=${searchID.trim()}`,
            );
            if (resStaffId.data?.Status === "Success" && resStaffId.data?.Data) {
                const requestBody = {
                    StaffID: resStaffId.data.Data,
                    UserLoginID: "",
                    PageCode: "1",
                    IPAddress: ipAddress,
                };


                const res = await agent.post(GetStaffSummary, requestBody);
                if (res.data?.Status === "Success" && res.data?.Data) {
                    const fetchedProfile = res.data.Data.StaffPrimarySummary;
                    setStaffData(fetchedProfile);
                    setFetched(true);
                    const fetchedId = (
                        fetchedProfile.ApplicationID || searchID.trim()
                    ).toUpperCase();
                    const existing = existingRows.find(
                        (r) => (r.profileId || "").toUpperCase() === fetchedId,
                    );
                    setDuplicateWarning(existing || null);
                } else {
                    setPopupError("No profile found for this ID.");
                }
            } else {
                setPopupError("No profile found for this ID.");
            }
        } catch {
            setPopupError("Unable to fetch profile. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleProceed = () => {
        if (duplicateWarning) return;
        onStaffFetched({
            staffID: staffData.StaffID,
            profileId: staffData.ApplicationID || searchID.trim(),
            title: staffData.Title || "",
            firstName: staffData.FirstName || "",
            middleName: staffData.MiddleName || "",
            lastName: staffData.LastName || "",
            designation: staffData.Designation || "",
            gender: staffData.Gender || "",
            dob: staffData.DOB || "",
            mobile: staffData.MobileNo || "",
            email: staffData.EMailID || "",
            photo: staffData.PhotoFilePath || "",
        });
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 relative min-h-[300px] overflow-hidden">
                <div className="bg-[#062568] text-white px-4 py-3 flex items-center justify-between rounded-t-xl">
                    <span className="font-semibold text-base">
                        Add Member — Election Duty
                    </span>
                    <button
                        onClick={onClose}
                        className="rounded p-1 hover:bg-[#0a3a8a] transition"
                    >
                        <IoClose className="text-xl" />
                    </button>
                </div>

                <div className="p-4 pb-2">
                    <div className="rounded bg-red-100 border border-red-300 text-red-900 px-3 py-2 mb-3 text-sm">
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Enter the Staff Profile ID to fetch employee details.</li>
                            <li>
                                Profile ID must be a valid registered ID in the HRMS portal.
                            </li>
                            <li>Enter Sevarth ID as Staff/ Management Profile ID for Government Employees registered on DVET HRMS Portal</li>
                        </ul>
                    </div>
                </div>

                <div className="px-4 pb-3 flex flex-col items-center gap-3">
                    <div className="flex items-center gap-2 w-full justify-center">
                        <label className="text-sm text-gray-700 whitespace-nowrap font-medium">
                            Staff / Management Profile ID{" "}
                            <span className="text-red-600">*</span> :
                        </label>
                        <input
                            className="border border-gray-300 px-2 py-2 rounded text-sm w-56 focus:outline-none focus:ring-1 focus:ring-blue-400"
                            value={searchID}
                            onChange={(e) => {
                                setSearchID(e.target.value);
                                setPopupError("");
                                setFetched(false);
                                setStaffData(null);
                            }}
                            onKeyUp={(e) => setSearchID(e.target.value.toUpperCase())}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !fetched && !loading) handleSearch();
                            }}
                            disabled={fetched || loading}
                            placeholder="Enter Profile ID"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={handleSearch}
                        disabled={fetched || loading}
                        className="bg-[#ed3d3d] hover:bg-red-700 disabled:opacity-50 px-4 py-2 text-white rounded text-sm font-medium transition-colors"
                    >
                        Get Staff / Management Details
                    </button>
                </div>

                {popupError && (
                    <p className="text-xs text-red-600 px-4 mb-2">{popupError}</p>
                )}

                {fetched && staffData && (
                    <div className="px-4 pb-4 mt-1">
                        <div className="flex gap-6">
                            <div className="flex-1 space-y-2 text-sm">
                                <div className="flex">
                                    <span className="font-semibold min-w-[180px] text-gray-700">
                                        Staff / Management
                                    </span>
                                    <span className="mr-2 text-gray-500">:</span>
                                    <span className="text-gray-800">{`${staffData.FirstName} ${staffData.MiddleName} ${staffData.LastName} (${staffData.ApplicationID || searchID})`}</span>

                                </div>
                                <div className="flex">
                                    <span className="font-semibold min-w-[180px] text-gray-700">
                                        Date of Birth
                                    </span>
                                    <span className="mr-2 text-gray-500">:</span>
                                    <span className="text-gray-800">{staffData.DOB || "—"}</span>
                                </div>
                                <div className="flex">
                                    <span className="font-semibold min-w-[180px] text-gray-700">
                                        Gender
                                    </span>
                                    <span className="mr-2 text-gray-500">:</span>
                                    <span className="text-gray-800">
                                        {staffData.Gender || "—"}
                                    </span>
                                </div>
                                <div className="flex">
                                    <span className="font-semibold min-w-[180px] text-gray-700">
                                        Primary Mobile No
                                    </span>
                                    <span className="mr-2 text-gray-500">:</span>
                                    <span className="text-gray-800">
                                        {staffData.MobileNo || "—"}
                                    </span>
                                </div>
                                <div className="flex">
                                    <span className="font-semibold min-w-[180px] text-gray-700">
                                        E-mail ID
                                    </span>
                                    <span className="mr-2 text-gray-500">:</span>
                                    <span className="text-gray-800">
                                        {staffData.EMailID || "—"}
                                    </span>
                                </div>
                                {staffData.Designation && (
                                    <div className="flex">
                                        <span className="font-semibold min-w-[180px] text-gray-700">
                                            Designation
                                        </span>
                                        <span className="mr-2 text-gray-500">:</span>
                                        <span className="text-gray-800">
                                            {staffData.Designation}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="relative flex-shrink-0">
                                <img
                                    src={staffData.PhotoFilePath || "/images/default-avatar.jpg"}
                                    alt="Staff Photo"
                                    className="w-32 h-40 object-cover border-2 border-gray-300 rounded"
                                    onError={(e) => {
                                        e.target.src = "/images/default-avatar.jpg";
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {fetched && duplicateWarning && (
                    <div className="mx-4 mb-3 rounded-lg border border-orange-300 bg-orange-50 p-3">
                        <div className="flex items-start gap-2">
                            <span className="text-orange-500 text-lg mt-0.5">⚠️</span>
                            <div className="text-sm text-orange-800">
                                <p className="font-semibold mb-1">
                                    Employee already assigned to Election Duty!
                                </p>
                                <p className="text-xs">
                                    <span className="font-medium">
                                        {duplicateWarning.profileId}
                                    </span>{" "}
                                    — {duplicateWarning.title} {" "}
                                    already has{" "}
                                    <span className="font-medium">
                                        {duplicateWarning.deputations.length} deputation(s)
                                    </span>{" "}
                                    assigned.
                                </p>
                                <p className="text-xs mt-1">
                                    Please close this popup and use the{" "}
                                    <span className="font-semibold text-blue-700">Edit</span>{" "}
                                    button on the table to add a new deputation period for this
                                    employee.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-center gap-3 px-4 pb-5 mt-2">
                    {fetched && !duplicateWarning && (
                        <button
                            onClick={handleProceed}
                            className="bg-green-700 hover:bg-green-800 text-white px-6 py-2 rounded font-semibold text-sm transition-colors"
                        >
                            Proceed to Add Deputation →
                        </button>
                    )}
                    {fetched && duplicateWarning && (
                        <button
                            onClick={onClose}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold text-sm transition-colors"
                        >
                            Close &amp; Use Edit
                        </button>
                    )}
                </div>

                {loading && (
                    <div className="absolute inset-0 flex justify-center items-center bg-white bg-opacity-70 rounded-xl">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
                    </div>
                )}
            </div>
        </div>
    );
};

/* ══════════════════════════════════════════
   STEP 2 — Member Modal (Add / Edit)
══════════════════════════════════════════ */
const MemberModal = ({
    initial,
    mode,
    onClose,
    onSave,
    districtOptions,
    onDeputationDeleted,
}) => {
    const [form, setForm] = useState(
        initial
            ? {
                ...initial,
                deputations: initial.deputations
                    ? initial.deputations.map((d) => ({ ...d }))
                    : [{ ...EMPTY_DEPUTATION }],
            }
            : {
                staffID: 0,
                profileId: "",
                title: "Mr.",
                firstName: "",
                middleName: "",
                lastName: "",
                designation: "",
                deputations: [{ ...EMPTY_DEPUTATION }],
            },
    );
    const [errors, setErrors] = useState({});
    const [constituencyOptions, setConstituencyOptions] = useState({});
    const [loadingConstituency, setLoadingConstituency] = useState({});
    const [deletingIdx, setDeletingIdx] = useState(null); // tracks which deputation is being deleted
    const [editingIdx, setEditingIdx] = useState(null); // tracks which existing deputation row is being edited inline

    // Load constituencies for pre-filled districts on mount (Edit mode)
    useEffect(() => {
        if (mode === "edit" && form.deputations) {
            form.deputations.forEach((dep, idx) => {
                if (dep.districtID) fetchConstituencies(dep.districtID, idx);
            });
        }
        
    }, []);

    const fetchConstituencies = async (districtID, idx) => {
        if (!districtID) return;
        setLoadingConstituency((p) => ({ ...p, [idx]: true }));
        try {
            const res = await agent.get(
                `${GetConstituencyByDistrict}?districtID=${districtID}`,
            );
            if (res.data?.Status === "Success" && res.data?.Data) {
                const opts = res.data.Data.map((c) => ({
                    value: String(c.Value),
                    label: c.Text,
                }));
                setConstituencyOptions((p) => ({ ...p, [idx]: opts }));
            }
        } catch {
            setConstituencyOptions((p) => ({ ...p, [idx]: [] }));
        } finally {
            setLoadingConstituency((p) => ({ ...p, [idx]: false }));
        }
    };

    const setTop = (field, value) => {
        setForm((p) => ({ ...p, [field]: value }));
        setErrors((p) => ({ ...p, [field]: "" }));
    };

    const setDep = (idx, field, value) => {
        setForm((p) => {
            const deps = p.deputations.map((d, i) => {
                if (i !== idx) return d;
                const updated = { ...d, [field]: value };
                if (field === "districtID") {
                    updated.district =
                        districtOptions.find((o) => o.value === value)?.label || "";
                    updated.constituencyID = "";
                    updated.constituency = "";
                    fetchConstituencies(value, idx);
                }
                if (field === "constituencyID") {
                    updated.constituency =
                        constituencyOptions[idx]?.find((o) => o.value === value)?.label ||
                        "";
                }
                if (field === "from") updated.to = "";
                return updated;
            });
            return { ...p, deputations: deps };
        });
        setErrors((p) => ({ ...p, [`dep_${field}_${idx}`]: "" }));
    };

    //const addDeputation = () =>
    //  setForm((p) => ({
    //    ...p,
    //    deputations: [...p.deputations, { ...EMPTY_DEPUTATION }],
    //  }));
    const addDeputation = () => {
        const lastDeputation = form.deputations[form.deputations.length - 1];

        // Check if the last row is empty/incomplete
        const isIncomplete =
            lastDeputation &&
            (
                !lastDeputation.from ||
                !lastDeputation.districtID ||
                !lastDeputation.constituencyID ||
                !lastDeputation.nature
            );

        if (isIncomplete) {
            //alert("Please fill the current deputation details before adding a new one.");
            SwalHelper.warning("Please fill the current deputation details before adding a new one.");

            //toast("success", "Deputation deleted successfully.");
            return;
        }

        setForm((p) => ({
            ...p,
            deputations: [...p.deputations, { ...EMPTY_DEPUTATION }],
        }));
    };

    // ── Remove / Delete deputation ────────────────────────────
    // New (no deputationID) → remove from local state only
    // Existing (has deputationID) → confirm → call API → remove from state
    const handleRemoveDeputation = async (idx) => {
        const dep = form.deputations[idx];

        // New unsaved deputation — just remove locally, no confirm needed
        if (!dep.deputationID) {
            setForm((p) => ({
                ...p,
                deputations: p.deputations.filter((_, i) => i !== idx),
            }));
            return;
        }

        // Existing saved deputation — confirm first
        const result = await SwalHelper.confirm({
            title: "Delete Deputation?",
            text: `Remove Deputation ${idx + 1} (${dep.from} to ${dep.to}) permanently?`,
            confirmText: "Yes, delete it!",
            cancelText: "Cancel",
        });
        if (!result.isConfirmed) return;

        const userLoginID = getUserLoginID();
        const ipAddress = await getDeviceIP();

        setDeletingIdx(idx);
        try {
            const res = await agent.post(DeleteElectionDutyDeputation, {
                DeputationID: dep.deputationID,
                DeletedBy: userLoginID,
                IPAddress: ipAddress,
            });

            if (res.data?.Status === "Success") {
                SwalHelper.toast("success", "Deputation deleted successfully.");
                setForm((p) => ({
                    ...p,
                    deputations: p.deputations.filter((_, i) => i !== idx),
                }));
                // Re-index constituency options after removal
                setConstituencyOptions((prev) => {
                    const updated = {};
                    Object.keys(prev).forEach((key) => {
                        const k = parseInt(key);
                        if (k < idx) updated[k] = prev[key];
                        else if (k > idx) updated[k - 1] = prev[key];
                    });
                    return updated;
                });
                // Refresh main table data
                if (onDeputationDeleted) onDeputationDeleted();
            } else {
                SwalHelper.error(
                    "Error",
                    res.data?.Message || "Failed to delete deputation.",
                );
            }
        } catch {
            SwalHelper.error("Error", "An unexpected error occurred.");
        } finally {
            setDeletingIdx(null);
        }
    };

    const parseDMY = (str) => {
        if (!str || str.length !== 10) return null;
        const [dd, mm, yyyy] = str.split("/").map(Number);
        const d = new Date(yyyy, mm - 1, dd);
        return isNaN(d.getTime()) ? null : d;
    };

    const addDays = (date, n) => {
        const d = new Date(date);
        d.setDate(d.getDate() + n);
        return d;
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const getMinFrom = (idx) => {
        if (idx === 0) return today;
        const prevTo = parseDMY(form.deputations[idx - 1]?.to);
        return prevTo ? addDays(prevTo, 1) : today;
    };

    const getMinTo = (idx) => {
        const from = parseDMY(form.deputations[idx]?.from);
        return from ? addDays(from, 1) : addDays(today, 1);
    };

    const validate = () => {
        const e = {};
        if (!form.designation?.trim()) e.designation = "Required";
        form.deputations.forEach((d, i) => {
            if (!d.from) e[`dep_from_${i}`] = "Required";
            //if (!d.to) e[`dep_to_${i}`] = "Required";
            if (!d.districtID) e[`dep_districtID_${i}`] = "Required";
            if (!d.constituencyID) e[`dep_constituencyID_${i}`] = "Required";
        });
        return e;
    };

    const handleSave = () => {
        const e = validate();
        if (Object.keys(e).length) {
            setErrors(e);
            return;
        }
        onSave(form);
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center  "
            style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div
                className="bg-white rounded-xl shadow-2xl w-9xl max-w-8xl mx-4 overflow-visible flex flex-col"
                style={{ maxHeight: "95vh" }}
            >
                <div className="bg-[#062568] text-white px-5 py-3 flex items-center justify-between flex-shrink-0 rounded-t-xl"

                >
                    <h3 className="font-semibold text-base">
                        {mode === "add"
                            ? "Add Member — Deputation Details"
                            : "Edit Member"}
                    </h3>
                    <button
                        onClick={onClose}
                        className="rounded p-1 hover:bg-[#0a3a8a] transition"
                    >
                        <IoClose className="text-xl" />
                    </button>
                </div>

                <div className="p-5 overflow-y-auto   flex-1"

                    style={{
                        overflowY: "auto",
                        overflowX: "visible"
                    }}
                >
                    {/* Profile ID + Full Name — read-only */}
                    <div className="grid grid-cols-2 gap-4 mb-4 mt-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Profile ID <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={form.profileId}
                                readOnly
                                className="w-full rounded-md p-2 border border-gray-300 bg-gray-100 text-gray-700 text-sm cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Full Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={`${form.firstName || ""} ${form.middleName || ""} ${form.lastName || ""}`.trim()}

                                readOnly
                                className="w-full rounded-md p-2 border border-gray-300 bg-gray-100 text-gray-700 text-sm cursor-not-allowed"
                            />
                        </div>
                    </div>

                    {/* Designation */}
                    <div className="mb-4 w-1/2 mt-8 mb-8">
                        <FormComponent
                            label="Designation"
                            required
                            value={form.designation}
                            onChange={(v) => setTop("designation", v)}
                            placeholder="e.g. Clerk Grade II"
                            error={errors.designation}
                            autoUpperCase={true}
                        />
                    </div>

                    {/* Deputation Assignments — Table Format */}
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-700 pb-4">
                            Deputation Assignments
                        </span>
                        <button
                            onClick={addDeputation}
                            className="flex items-center gap-1 text-xs font-semibold text-white bg-blue-500 hover:bg-blue-600 px-2 py-1 rounded-md transition-colors"
                        >
                            <span className="text-sm leading-none">+</span> Add Additional Order
                        </button>
                    </div>

                    <div className="overflow-visible rounded-md border border-gray-200">
                        <table className="w-full border-collapse text-xs">
                            <thead>
                                <tr className="bg-gray-100 text-gray-600 text-center">
                                    <th className="border border-gray-200 px-2 py-2 font-semibold w-10">S.N.</th>
                                    <th className="border border-gray-200 px-2 py-2 font-semibold">From</th>
                                    <th className="border border-gray-200 px-2 py-2 font-semibold">To</th>
                                    <th className="border border-gray-200 px-2 py-2 font-semibold">District</th>
                                    <th className="border border-gray-200 px-2 py-2 font-semibold">Constituency</th>
                                    <th className="border border-gray-200 px-2 py-2 font-semibold">Deputation Type</th>
                                    <th className="border border-gray-200 px-2 py-2 font-semibold w-28">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {form.deputations.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="border border-gray-200 px-3 py-6 text-center text-gray-400 text-sm">
                                            No deputation records. Click "Add Additional Order" to add.
                                        </td>
                                    </tr>
                                ) : (
                                    form.deputations.map((dep, idx) => {
                                        const isEditable = !dep.deputationID || editingIdx === idx;

                                        const maxDate = new Date(
                                            new Date().getFullYear() + 1,
                                            11, // December
                                            31
                                        ).toISOString().split("T")[0];
                                        return (
                                            <tr key={dep.deputationID || `new-${idx}`} className={`hover:bg-gray-50 ${isEditable ? "bg-yellow-50" : ""}`}>
                                                {/* S.N. */}
                                                <td className="border border-gray-200 px-2 py-2 text-center text-gray-700 font-medium align-top">
                                                    {idx + 1}
                                                </td>
                                                {/* From */}
                                                <td className="border border-gray-200 px-1 py-1 align-top" style={{ minWidth: "130px" }}>
                                                    {isEditable ? (
                                                        <DateInput
                                                            value={dep.from}
                                                            onChange={(v) => setDep(idx, "from", v)}
                                                            error={errors[`dep_from_${idx}`]}
                                                            //minDate={getMinFrom(idx)}
                                                            minDate={new Date(2000, 0, 1)} // 01-Jan-2000
                                                            maxDate={new Date(new Date().getFullYear() + 1, 11, 31)} // 31-Dec next year
                                                            position="top"
                                                        />
                                                    ) : (
                                                        <span className="block text-center text-gray-700 font-medium py-1">{dep.from || "—"}</span>
                                                    )}
                                                </td>
                                                {/* To */}
                                                <td className="border border-gray-200 px-1 py-1 align-top" style={{ minWidth: "130px" }}>
                                                    {isEditable ? (
                                                        <DateInput
                                                            value={dep.to}
                                                            onChange={(v) => setDep(idx, "to", v)}
                                                            error={errors[`dep_to_${idx}`]}
                                                            minDate={getMinTo(idx) || new Date(2000, 0, 1)}
                                                            maxDate={new Date(new Date().getFullYear() + 1, 11, 31)}
                                                            position="top"
                                                        />
                                                    ) : (
                                                        <span className="block text-center text-gray-700 font-medium py-1">{dep.to || "Till Date"}</span>
                                                    )}
                                                </td>
                                                {/* District */}
                                                <td className="border border-gray-200 px-1 py-1 align-top" style={{ minWidth: "150px" }}>
                                                    {isEditable ? (
                                                        <DropdownComponent
                                                            options={districtOptions}
                                                            value={String(dep.districtID || "")}
                                                            onChange={(v) => setDep(idx, "districtID", v)}
                                                            error={errors[`dep_districtID_${idx}`]}
                                                            isForFilterTable={true}
                                                        />
                                                    ) : (
                                                        <span className="block text-center text-gray-700 font-medium py-1">{dep.district || "—"}</span>
                                                    )}
                                                </td>
                                                {/* Constituency */}
                                                <td className="border border-gray-200 px-1 py-1 align-top" style={{ minWidth: "150px" }}>
                                                    {isEditable ? (
                                                        <DropdownComponent
                                                            options={constituencyOptions[idx] || []}
                                                            value={String(dep.constituencyID || "")}
                                                            onChange={(v) => setDep(idx, "constituencyID", v)}
                                                            error={errors[`dep_constituencyID_${idx}`]}
                                                            disabled={!dep.districtID}
                                                            loading={loadingConstituency[idx]}
                                                            isForFilterTable={true}
                                                        />
                                                    ) : (
                                                        <span className="block text-center text-gray-700 font-medium py-1">{dep.constituency || "—"}</span>
                                                    )}
                                                </td>
                                                {/* Deputation Type / Nature */}
                                                <td className="border border-gray-200 px-1 py-1 mt-2 align-top" style={{ minWidth: "130px" }}>
                                                    {isEditable ? (
                                                        <DropdownComponent
                                                            options={NATURE_OPTIONS}
                                                            value={dep.nature}
                                                            onChange={(v) => setDep(idx, "nature", v)}
                                                            isForFilterTable={true}
                                                        />
                                                    ) : (
                                                        <span className="block text-center mt-2">
                                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${dep.nature === "Full Time" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                                                                {dep.nature}
                                                            </span>
                                                        </span>
                                                    )}
                                                </td>
                                                {/* Action */}
                                                <td className="border border-gray-200 px-1 py-1 text-center align-top">
                                                    <div className="flex items-center justify-center gap-1 py-1">
                                                        {dep.deputationID && editingIdx !== idx ? (
                                                            /* Saved row — show Edit / Delete */
                                                            <>
                                                                <button
                                                                    onClick={() => setEditingIdx(idx)}
                                                                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-2 py-1 rounded transition-colors"
                                                                >
                                                                    Edit
                                                                </button>
                                                                {form.deputations.length > 1 && (
                                                                    <button
                                                                        onClick={() => handleRemoveDeputation(idx)}
                                                                        disabled={deletingIdx === idx}
                                                                        className="bg-red-500 hover:bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded transition-colors disabled:opacity-50"
                                                                    >
                                                                        {deletingIdx === idx ? "..." : "Delete"}
                                                                    </button>
                                                                )}
                                                            </>
                                                        ) : dep.deputationID && editingIdx === idx ? (
                                                            /* Editing an existing row — show Done */
                                                            <button
                                                                onClick={() => setEditingIdx(null)}
                                                                className="bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-2 py-1 rounded transition-colors"
                                                            >
                                                                Done
                                                            </button>
                                                        ) : (
                                                            /* New unsaved row — show Remove */
                                                            form.deputations.length > 1 && (
                                                                <button
                                                                    onClick={() => handleRemoveDeputation(idx)}
                                                                    className="bg-gray-500 hover:bg-gray-600 text-white text-xs font-semibold px-2 py-1 rounded transition-colors"
                                                                >
                                                                    ✕ Remove
                                                                </button>
                                                            )
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-2 px-5 py-3 bg-gray-50 border-t border-gray-200 flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="px-4 py-1.5 text-xs font-semibold border border-gray-300 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-1.5 text-xs font-semibold bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors"
                    >
                        {mode === "add" ? "Save Member" : "Update Member"}
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ══════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════ */
const ElectionDuty = () => {
    const { color } = useContext(ThemeContext);
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [districtOptions, setDistrictOptions] = useState([]);
    const [step, setStep] = useState(null);
    const [editData, setEditData] = useState(null);
    const [prefillData, setPrefillData] = useState(null);
    const { userInfo } = useAuth();

    const UserID = userInfo?.UserID;
    const UserTypeID = userInfo?.UserTypeID;
    const [userMobile, setUserMobile] = useState("");
    //const [pendingForm, setPendingForm] = useState(null);
    const pendingFormRef = useRef(null);

    // Fallback placeholder for endpoint (User needs to replace this)
    //const endpointDveto = "master/DVETOGetDvetoManagementTypeByDvetoID";

    useEffect(() => {
        const fetchMobile = async () => {
            if (UserTypeID === 14) {
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
            } else if (UserTypeID === 61) {
                const UserLoginID = userInfo?.UserLoginID;
                let instId = null;
                try {

                    const instRes = await agent.get(GetInstituteIDByInstituteCode, {
                        params: { InstituteCode: UserLoginID },
                    });
                    instId = instRes?.data?.Data ?? instRes?.data?.InstituteID ?? null;

                } catch (err) {
                    setUserMobile("");

                }


                if (!instId) return;
                try {
                    const url = `${GetInstituteAndManagementMobile}/${instId}/2`;
                    const response = await agent.get(url, {
                        headers: { accept: "*/*", "Content-Type": "application/json" },
                    });
                    if (response.data?.Status === "Success" && response.data.Data?.length > 0) {
                        setUserMobile(response.data.Data[0].MobileNo || "");
                    } else {
                        setUserMobile("");
                    }
                } catch (err) {
                    setUserMobile("");
                }
            } else if (UserTypeID === 13) {

                if (!UserID) return;
                try {
                    const url = `${ROGetRoManagementTypeByRoID}/${UserID}/201`;
                    const response = await agent.get(url);
                    const data = response?.data;
                    if (data?.Status === "Success" && data?.Data?.length > 0) {
                        setUserMobile(String(data.Data[0]?.MobileNo || ""));
                    } else {
                        setUserMobile("");
                    }
                } catch (error) {
                    console.error("Error fetching management mobile:", error);
                    setUserMobile("");
                }

            }
        };
        fetchMobile();
        
    }, [UserTypeID, UserID, userInfo?.InstituteID, userInfo?.RefID]);

    const otpService = OTPService({
        mobileNo: userMobile,
        purpose: "SaveElectionDuty",
        isVerifyRequired: true,
        messege: "OTP verification required to save election duty",
        isDuplicateCheck: false,
        onSuccess: async () => {
            //if (pendingForm) {
            //    await processSaveMember(pendingForm);
            //    setPendingForm(null);
            //}
            if (pendingFormRef.current) {
                await processSaveMember(pendingFormRef.current);
                pendingFormRef.current = null;
            }
        },
        onError: (error) => {
            Swal.fire({
                title: "Verification Failed",
                text: error?.message || "OTP verification failed. Please try again.",
                icon: "error",
            });
        },
        onCancel: () => {
            // setPendingForm(null);
            pendingFormRef.current = null;
        },
    });

    //const fetchDistricts = async () => {
    //    try {
    //        const res = await agent.get(
    //            `${GetMasterTableList}?TableName=Master_District&DataValueField=DistrictID&DataTextField=District&HasSelect=false&orderByText=District`,
    //        );
    //        if (res.data?.Data) {
    //            const opts = res.data.Data
    //                .filter((d) => d.StateID === 27 && d.value > 0)
    //                .map((d) => ({
    //                value: String(d.Value),
    //                label: d.Text,
    //            }));
    //            setDistrictOptions(opts);
    //        }
    //    } catch {
    //        // fallback
    //    }
    //};

    const fetchDistricts = async () => {
        try {
            const response = await agent.get(GetMasterDistrict);

            if (response.data?.Status === "Success") {
                const opts = response.data.Data
                    .filter(
                        (d) =>
                            d.Value !== "-1" &&
                            Number(d.Group) === 27
                    )
                    .map((d) => ({
                        value: String(d.Value),
                        label: d.Text,
                    }));

                setDistrictOptions(opts);
            }
        } catch (err) {
            setDistrictOptions([]);
        }
    };
    const fetchElectionDutyList = async () => {
        setLoading(true);
        try {
            const res = await agent.get(`${GetElectionDutyList}?UserID=${UserID}`);
            if (res.data?.Status === "Success" && res.data?.Data?.length > 0) {
                const grouped = {};
                res.data.Data.forEach((item) => {
                    const id = item.ElectionDutyStaffID;
                    if (!grouped[id]) {
                        grouped[id] = {
                            id,
                            electionDutyStaffID: id,
                            staffID: item.StaffID,
                            profileId: item.ProfileID,
                            title: item.FullName,
                            firstName: item.FirstName,
                            middleName: item.MiddleName,
                            lastName: item.LastName,
                            designation: item.Designation,
                            gender: item.GenderCode,
                            mobile: item.MobileNo,
                            email: item.EMailID,
                            deputations: [],
                        };
                    }
                    grouped[id].deputations.push({
                        deputationID: item.DeputationID,
                        from: item.DeputationFrom,
                        to: item.DeputationTo,
                        districtID: String(item.DistrictID),
                        district: item.District,
                        constituencyID: String(item.ConstituencyID),
                        constituency: item.Constituency,
                        nature: item.NatureOfDeputation,
                    });
                });
                setRows(Object.values(grouped));
            } else {
                setRows([]);
            }
        } catch {
            setRows([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDistricts();
        fetchElectionDutyList();
    }, []);

    const handleStaffFetched = (staffInfo) => {
        setPrefillData({ ...staffInfo, deputations: [{ ...EMPTY_DEPUTATION }] });
        setStep("add");
    };

    const handleSaveMember = async (form) => {

        if (UserTypeID === 12) {
            const confirmResult = await Swal.fire({
                title: "Confirm Submission",
                html: `
                    <div class="text-center">
                        <p class="mb-3 font-semibold">
                            You are about to save Election Duty details.
                        </p>
                        <p class="text-sm text-gray-600 bg-yellow-50 p-2 rounded">
                            Please verify all details carefully before proceeding.
                        </p>
                    </div>
                `,
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Confirm & Save",
                cancelButtonText: "Cancel",
                confirmButtonColor: "#059669",
                cancelButtonColor: "#dc2626",
                width: "600px",
            });

            if (!confirmResult.isConfirmed) {
                pendingFormRef.current = null;
                return;
            }

            // Directly process save without OTP
            await processSaveMember(form);
            pendingFormRef.current = null;
            return;
        }

        //setPendingForm(form);
        pendingFormRef.current = form;
        if (!userMobile) {
            SwalHelper.error("Error", "Mobile number not found. Please contact administrator.");
            return;
        }

        const confirmResult = await Swal.fire({
            title: "Confirm Submission",
            html: `
                <div class="text-center">
                    <p class="mb-3 font-semibold">
                        You are about to save Election Duty details.
                    </p>
                    <p class="text-sm text-gray-600 bg-yellow-50 p-2 rounded">
                        Please verify all details carefully before proceeding.
                    </p>
                </div>
            `,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Proceed to OTP Verification",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#059669",
            cancelButtonColor: "#dc2626",
            width: "600px",
        });

        if (!confirmResult.isConfirmed) {
            // setPendingForm(null);
            pendingFormRef.current = null;
            return;
        }

        if (otpService && typeof otpService.startVerification === "function") {
            try {
                await otpService.startVerification(userMobile);
            } catch (error) {
                SwalHelper.error("Error", "Failed to start OTP verification. Please try again.");
                // setPendingForm(null);
                pendingFormRef.current = null;
            }
        } else {
            SwalHelper.error("Error", "OTP verification service is not available.");
            //setPendingForm(null);
            pendingFormRef.current = null;
        }
    };

    const processSaveMember = async (form) => {
        const userLoginID = getUserLoginID();
        const ipAddress = await getDeviceIP();

        try {
            if (step === "add") {
                // ADD
                const payload = {
                    userID: UserID,
                    StaffID: form.staffID,
                    Designation: form.designation,
                    CreatedBy: userLoginID,
                    IPAddress: ipAddress,
                    Deputations: form.deputations.map((dep) => ({
                        DeputationID: 0,
                        DeputationFrom: dep.from,
                        DeputationTo: dep.to,
                        DistrictID: parseInt(dep.districtID) || 0,
                        District: dep.district || "",
                        ConstituencyID: parseInt(dep.constituencyID) || 0,
                        Constituency: dep.constituency || "",
                        NatureOfDeputation: dep.nature,
                        ModifiedBy: userLoginID,
                        IPAddress: ipAddress,
                    })),
                };

                const res = await agent.post(SaveElectionDutyStaff, payload);

                if (res.data?.Status !== "Success") {
                    SwalHelper.error(
                        "Error",
                        res.data?.Message || "Failed to save."
                    );
                    return;
                }

                await SwalHelper.success(
                    "Success",
                    "Election duty saved successfully."
                );
            } else {
                // EDIT

                // 1. Get newly added deputations
                const newDeputations = form.deputations.filter((dep) => !dep.deputationID);

                // 2. Get existing deputations that have changed
                const changedExistingDeputations = form.deputations.filter((dep) => {
                    if (!dep.deputationID) return false;

                    const originalDep = editData?.deputations?.find(
                        (od) => od.deputationID === dep.deputationID
                    );

                    return !originalDep ||
                        originalDep.from !== dep.from ||
                        originalDep.to !== dep.to ||
                        String(originalDep.districtID) !== String(dep.districtID) ||
                        String(originalDep.constituencyID) !== String(dep.constituencyID) ||
                        originalDep.nature !== dep.nature;
                });

                // 3. Format new deputations for SaveElectionDutyStaff
                const newDeputationPayload = newDeputations.map((dep) => ({
                    DeputationFrom: dep.from,
                    DeputationTo: dep.to,
                    DistrictID: parseInt(dep.districtID) || 0,
                    District: dep.district || "",
                    ConstituencyID: parseInt(dep.constituencyID) || 0,
                    Constituency: dep.constituency || "",
                    NatureOfDeputation: dep.nature,
                    ModifiedBy: userLoginID,
                    IPAddress: ipAddress,
                }));

                const designationChanged = form.designation !== editData?.designation;
                // Only call SaveElectionDutyStaff if there are NEW deputations to insert
                if (newDeputationPayload.length > 0 || designationChanged) {
                    const savePayload = {
                        userID: UserID,
                        StaffID: form.staffID,
                        Designation: form.designation,
                        CreatedBy: userLoginID,
                        IPAddress: ipAddress,
                        Deputations: newDeputationPayload,
                    };

                    const saveRes = await agent.post(
                        SaveElectionDutyStaff,
                        savePayload
                    );

                    if (saveRes.data?.Status !== "Success") {
                        SwalHelper.error(
                            "Error",
                            saveRes.data?.Message ||
                            "Failed to update staff details."
                        );
                        return;
                    }
                }

                // 4. Loop over ONLY the changed existing deputations and update them
                for (const dep of changedExistingDeputations) {
                    const payload = {
                        DeputationID: dep.deputationID,
                        DeputationFrom: dep.from,
                        DeputationTo: dep.to,
                        DistrictID: parseInt(dep.districtID) || 0,
                        District: dep.district || "",
                        ConstituencyID: parseInt(dep.constituencyID) || 0,
                        Constituency: dep.constituency || "",
                        NatureOfDeputation: dep.nature,
                        ModifiedBy: userLoginID,
                        IPAddress: ipAddress,
                    };

                    const res = await agent.post(
                        UpdateElectionDutyDeputation,
                        payload
                    );

                    if (res.data?.Status !== "Success") {
                        SwalHelper.error(
                            "Error",
                            res.data?.Message ||
                            "Failed to update deputation."
                        );
                        return;
                    }
                }

                await SwalHelper.success(
                    "Success",
                    "Election duty updated successfully."
                );
            }

            fetchElectionDutyList();

            setStep(null);
            setEditData(null);
            setPrefillData(null);
        } catch (error) {
            SwalHelper.error(
                "Error",
                error?.Message ||
                "An unexpected error occurred."
            );
        }
    };

    const handleDelete = async (row) => {
        const result = await SwalHelper.confirm({
            title: "Are you sure?",
            text: `Remove ${row.firstName} ${row.lastName} from election duty? All deputation records will be deleted.`,
            confirmText: "Yes, delete it!",
            cancelText: "Cancel",
        });
        if (!result.isConfirmed) return;

        const userLoginID = getUserLoginID();
        const ipAddress = await getDeviceIP();
        try {
            const res = await agent.post(DeleteElectionDutyStaff, {
                ElectionDutyStaffID: row.electionDutyStaffID,
                DeletedBy: userLoginID,
                IPAddress: ipAddress,
            });
            if (res.data?.Status === "Success") {
                SwalHelper.success("Deleted!", "Staff removed from election duty.");
                fetchElectionDutyList();
            } else {
                SwalHelper.error("Error", res.data?.Message || "Failed to delete.");
            }
        } catch {
            SwalHelper.error("Error", "An unexpected error occurred.");
        }
    };

    const tableRows = rows.flatMap((row) =>
        row.deputations.map((dep, depIdx) => ({
            ...row,
            dep,
            depIdx,
            totalDeps: row.deputations.length,
        })),
    );

    return (
        <div className="w-full p-4">
            {step === "search" && (
                <StaffSearchPopup
                    onClose={() => setStep(null)}
                    onStaffFetched={handleStaffFetched}
                    existingRows={rows}
                />
            )}

            {(step === "add" || step === "edit") && (
                <MemberModal
                    mode={step}
                    initial={step === "edit" ? editData : prefillData}
                    onClose={() => {
                        setStep(null);
                        setEditData(null);
                        setPrefillData(null);
                    }}
                    onSave={handleSaveMember}
                    districtOptions={districtOptions}
                    onDeputationDeleted={fetchElectionDutyList}
                />
            )}

            <fieldset className="rounded-lg border border-gray-300 bg-white shadow-lg">
                <legend
                    className={`flex ${color} items-center gap-2 text-base font-semibold text-white border-2 border-gray-300 px-3 py-1.5 rounded-md ml-4`}
                >
                    {/*<MdOutlineAssignmentInd className="text-xl" />*/}
                    Election Duty
                </legend>

                <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                        <button
                            onClick={() => exportToExcel(rows)}
                            className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-3 py-1.5 rounded-md transition-colors"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3.5 w-3.5"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                            >
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM8.5 19l-2-3h1.2l1.3 2 1.3-2h1.2l-2 3H8.5zm7 0h-4v-5h1v4h3v1z" />
                            </svg>
                            Excel
                        </button>
                        <button
                            onClick={() => setStep("search")}
                            className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold px-3 py-1.5 rounded-md transition-colors"
                        >
                            <span className="text-base leading-none">+</span> Add Member
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-md border border-gray-200">
                            <table className="w-full border-collapse text-xs">
                                <thead>
                                    <tr className="bg-gray-100 text-gray-600 text-center">
                                        <th
                                            rowSpan={2}
                                            className="border border-gray-200 px-2 py-2 font-semibold w-8"
                                        >
                                            S.N.
                                        </th>
                                        <th
                                            rowSpan={2}
                                            className="border border-gray-200 px-2 py-2 font-semibold w-24"
                                        >
                                            Profile ID
                                        </th>
                                        <th
                                            rowSpan={2}
                                            className="border border-gray-200 px-2 py-2 font-semibold"
                                        >
                                            Name
                                        </th>
                                        <th
                                            rowSpan={2}
                                            className="border border-gray-200 px-2 py-2 font-semibold w-24"
                                        >
                                            Designation
                                        </th>
                                        <th
                                            colSpan={2}
                                            className="border border-gray-200 px-2 py-2 font-semibold"
                                        >
                                            Deputation Period
                                        </th>
                                        <th
                                            colSpan={2}
                                            className="border border-gray-200 px-2 py-2 font-semibold"
                                        >
                                            Constituency
                                        </th>
                                        <th
                                            rowSpan={2}
                                            className="border border-gray-200 px-2 py-2 font-semibold w-24"
                                        >
                                            Nature
                                        </th>
                                        <th
                                            rowSpan={2}
                                            className="border border-gray-200 px-2 py-2 font-semibold w-24"
                                        >
                                            Action
                                        </th>
                                    </tr>
                                    <tr className="bg-gray-100 text-gray-600 text-center">
                                        <th className="border border-gray-200 px-2 py-2 font-semibold w-24">
                                            From
                                        </th>
                                        <th className="border border-gray-200 px-2 py-2 font-semibold w-24">
                                            To
                                        </th>
                                        <th className="border border-gray-200 px-2 py-2 font-semibold">
                                            District
                                        </th>
                                        <th className="border border-gray-200 px-2 py-2 font-semibold">
                                            Constituency
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tableRows.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={10}
                                                className="border border-gray-200 px-3 py-8 text-center text-gray-400 text-sm"
                                            >
                                                No election duty records found.
                                            </td>
                                        </tr>
                                    ) : (
                                        tableRows.map((tr) => (
                                            <tr
                                                key={`${tr.id}-${tr.depIdx}`}
                                                className="hover:bg-gray-50"
                                            >
                                                {tr.depIdx === 0 && (
                                                    <>
                                                        <td
                                                            rowSpan={tr.totalDeps}
                                                            className="border border-gray-200 px-2 py-2 text-center text-gray-700 font-medium align-middle"
                                                        >
                                                            {rows.findIndex((r) => r.id === tr.id) + 1}
                                                        </td>
                                                        <td
                                                            rowSpan={tr.totalDeps}
                                                            className="border border-gray-200 px-2 py-2 text-center align-middle"
                                                        >
                                                            <span className="text-blue-600 font-medium cursor-pointer hover:underline">
                                                                {tr.profileId || "—"}
                                                            </span>
                                                        </td>
                                                        <td
                                                            rowSpan={tr.totalDeps}
                                                            className="border border-gray-200 px-2 py-2 align-middle"
                                                        >
                                                            {tr.firstName
                                                                ? ` ${tr.title}`
                                                                : "—"}

                                                        </td>
                                                        <td
                                                            rowSpan={tr.totalDeps}
                                                            className="border border-gray-200 px-2 py-2 text-center text-gray-700 font-medium align-middle"
                                                        >
                                                            {tr.designation || "—"}
                                                        </td>
                                                    </>
                                                )}
                                                <td className="border border-gray-200 px-2 py-2 text-center text-gray-700 font-medium">
                                                    {tr.dep.from || "—"}
                                                </td>
                                                <td className="border border-gray-200 px-2 py-2 text-center text-gray-700 font-medium">
                                                    {tr.dep.to || "Till Date"}
                                                </td>
                                                <td className="border border-gray-200 px-2 py-2 text-center text-gray-700 font-medium">
                                                    {tr.dep.district || "—"}
                                                </td>
                                                <td className="border border-gray-200 px-2 py-2 text-center text-gray-700 font-medium">
                                                    {tr.dep.constituency || "—"}
                                                </td>
                                                <td className="border border-gray-200 px-2 py-2 text-center">
                                                    <span
                                                        className={`px-2 py-0.5 rounded text-xs font-medium ${tr.dep.nature === "Full Time" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                                                    >
                                                        {tr.dep.nature}
                                                    </span>
                                                </td>
                                                {tr.depIdx === 0 && (
                                                    <td
                                                        rowSpan={tr.totalDeps}
                                                        className="border border-gray-200 px-2 py-2 text-center align-middle"
                                                    >
                                                        <div className="flex items-center justify-center gap-1">
                                                            <button
                                                                onClick={() => {
                                                                    setEditData(rows.find((r) => r.id === tr.id));
                                                                    setStep("edit");
                                                                }}
                                                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-2 py-1 rounded transition-colors"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    handleDelete(rows.find((r) => r.id === tr.id))
                                                                }
                                                                className="bg-red-500 hover:bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded transition-colors"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-gray-50">
                                        <td
                                            colSpan={10}
                                            className="border border-gray-200 px-3 py-2 text-center text-gray-500 text-xs"
                                        >
                                            Display — {rows.length} members · {tableRows.length}{" "}
                                            deputation(s)
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    )}

                    <div className="mt-4 rounded-md border border-blue-200 bg-blue-50 p-4">
                        <p className="text-sm text-blue-700">
                            <span className="font-medium">Note:</span>
                            <ol className="list-decimal list-inside mt-1 space-y-1">
                                <li>
                                    An employee can be assigned to multiple deputation periods.
                                </li>
                                <li>
                                    Use the Edit button to add or modify deputation assignments.
                                </li>
                                <li>
                                    District must be selected before Constituency becomes
                                    available.
                                </li>
                            </ol>
                        </p>
                    </div>
                </div>
            </fieldset>
        </div>
    );
};

export default ElectionDuty;
