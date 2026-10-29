import React, { useState, useEffect, useCallback, useMemo, useRef, useContext } from "react";
import { MasterTableService } from "../../lib/services/MasterTableService";
import FilteredTableComponent from "../../Component/formcomponent/FilteredTableComponent";
import { ThemeContext } from "../../Component/Context/ThemeContext";
import Loader from "../../Component/formcomponent/Loader";

// ─── Constants ────────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  TalukaID:      "",
  Taluka:        "",
  DistrictID:    "",
  StateID:       "",
  IsActive:      true,
  TalukaMarathi: "",
};

// ─── small inline icons ──────────────────────────────────────────────────────────────────
const EditIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const TrashIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4"
  >
    <path d="M3 6h18" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
  </svg>
);

const BackIcon = ({ className = "h-3.5 w-3.5" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M19 12H5" />
    <path d="M12 19l-7-7 7-7" />
  </svg>
);

const CloseIcon = ({ className = "h-3.5 w-3.5" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M18 6L6 18" />
    <path d="M6 6l12 12" />
  </svg>
);

// ─── Component ────────────────────────────────────────────────────────────────

export default function MasterTaluka() {
  const { color } = useContext(ThemeContext); // e.g. "bg-[#002060]" — drives the T avatar below

  const [allTalukas, setAllTalukas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTaluka, setCurrentTaluka] = useState(EMPTY_FORM);

  const [stateOptions, setStateOptions] = useState([]);
  const [allDistricts, setAllDistricts] = useState([]);
  const allDistrictsRef = useRef([]);

  // ── Auth Guard ─────────────────────────────────────────────────────────────

  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem("userInfoAll"));
    if (!user || Number(user.UserTypeID) !== 11) {
      window.location.href = "http://localhost:5173/react";
    }
  }, []);

  // ── Notifications ──────────────────────────────────────────────────────────

  const showSuccess = useCallback((msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  }, []);

  const showError = useCallback((msg) => {
    setError(msg);
    setTimeout(() => setError(null), 4000);
  }, []);

  // ── Auto-assigned next ID ───────────────────────────────────────────────

  const nextID = useMemo(() => {
    const ids = allTalukas
      .map(t => Number(t.TalukaID))
      .filter(id => !isNaN(id) && id > 0);
    return ids.length > 0 ? Math.max(...ids) + 1 : 1;
  }, [allTalukas]);

  // ── Build Payload ──────────────────────────────────────────────────────────

  const buildPayload = useCallback((form) => {
    const talukaID = Number(form.TalukaID);
    const districtID = Number(form.DistrictID);

    return {
      TalukaID: isNaN(talukaID) ? 0 : talukaID,
      Taluka: String(form.Taluka || "").trim(),
      DistrictID: isNaN(districtID) ? 0 : districtID,
      IsActive: Boolean(form.IsActive),
      TalukaMarathi: form.TalukaMarathi ? String(form.TalukaMarathi).trim() : "",
    };
  }, []);

  // ── Fetch Talukas ─────────────────────────────────────────────────────────

  const fetchTalukas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await MasterTableService.getAllTalukas(1, 99999, "");
      const raw = Array.isArray(data) ? data : (data?.Data ?? data?.data ?? []);

      const districtMap = new Map(
        allDistrictsRef.current.map(d => [String(d.DistrictID), d.District ?? ""])
      );

      const mapped = raw.map(item => ({
        TalukaID: item.TalukaID,
        Taluka: item.Taluka ?? "",
        DistrictID: item.DistrictID ?? "",
        DistrictName: districtMap.get(String(item.DistrictID)) ?? "",
        IsActive: item.IsActive ?? true,
        TalukaMarathi: item.TalukaMarathi ?? "",
      }));

      setAllTalukas(mapped);
    } catch (err) {
      console.error("[Taluka] fetch error:", err);
      showError(
        err?.response?.data?.message ||
        err?.response?.data?.Message ||
        "Failed to load talukas"
      );
      setAllTalukas([]);
    } finally {
      setLoading(false);
    }
  }, [showError]);

  // ── Init: load master data THEN fetch talukas ─────────────────────────────

  useEffect(() => {
    const init = async () => {
      try {
        const [stateData, districtData] = await Promise.all([
          MasterTableService.getAllStates(),
          MasterTableService.getAllDistricts(),
        ]);

        const rawStates = Array.isArray(stateData) ? stateData : (stateData?.Data ?? stateData?.data ?? []);
        const rawDistricts = Array.isArray(districtData) ? districtData : (districtData?.Data ?? districtData?.data ?? []);

        setStateOptions(rawStates.map(s => ({
          value: String(s.StateID),
          label: s.State ?? s.StateName ?? ""
        })));
        setAllDistricts(rawDistricts);
        allDistrictsRef.current = rawDistricts;

        await fetchTalukas();
      } catch (err) {
        console.error("Init failed:", err);
        showError("Failed to load initial data");
      }
    };
    init();
  }, [fetchTalukas, showError]);

  // ── CRUD Operations ───────────────────────────────────────────────────────

  const handleInsert = async (form) => {
    setActionLoading(true);
    setError(null);
    try {
      if (!form.Taluka || String(form.Taluka).trim() === "") {
        showError("Taluka Name is required");
        return;
      }

      if (!form.DistrictID || form.DistrictID === "" || isNaN(Number(form.DistrictID))) {
        showError("Please select a District");
        return;
      }

      const payload = buildPayload(form);
      const res = await MasterTableService.insertTaluka(payload);

      showSuccess(res?.message || res?.Data?.Message || "Taluka added successfully");
      setIsPanelOpen(false);
      setCurrentTaluka(EMPTY_FORM);
      await fetchTalukas();
    } catch (err) {
      let errorMessage = "Failed to add taluka";
      if (err?.response?.data?.Message) {
        errorMessage = err.response.data.Message;
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      }

      if (errorMessage.toLowerCase().includes("duplicate") || errorMessage.toLowerCase().includes("already exists")) {
        errorMessage = "Taluka ID already exists. Please try adding again.";
      } else if (errorMessage.toLowerCase().includes("foreign key")) {
        errorMessage = "Invalid District selected. Please select a valid district.";
      }

      showError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async (form) => {
    setActionLoading(true);
    setError(null);
    try {
      if (!form.TalukaID || isNaN(Number(form.TalukaID))) {
        showError("Valid Taluka ID is required");
        return;
      }

      if (!form.Taluka || String(form.Taluka).trim() === "") {
        showError("Taluka Name is required");
        return;
      }

      if (!form.DistrictID || isNaN(Number(form.DistrictID))) {
        showError("Please select a District");
        return;
      }

      const payload = buildPayload(form);
      const res = await MasterTableService.updateTaluka(payload);

      showSuccess(res?.message || res?.Data?.Message || "Taluka updated successfully");
      setIsPanelOpen(false);
      setCurrentTaluka(EMPTY_FORM);
      await fetchTalukas();
    } catch (err) {
      let errorMessage = err?.response?.data?.message || "Failed to update taluka";
      showError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (talukaID, talukaName) => {
    if (!window.confirm(`Are you sure you want to delete Taluka "${talukaName}"?`)) return;
    setActionLoading(true);
    try {
      const res = await MasterTableService.softDeleteTaluka(talukaID);
      showSuccess(res?.message || res?.Data?.Message || "Taluka deleted successfully");
      await fetchTalukas();
    } catch (err) {
      showError(err?.response?.data?.message || "Failed to delete taluka");
    } finally {
      setActionLoading(false);
    }
  };

  const toggleStatusInline = async (item) => {
    const updated = { ...item, IsActive: !item.IsActive };
    setAllTalukas(prev => prev.map(t => t.TalukaID === item.TalukaID ? updated : t));

    try {
      await MasterTableService.updateTaluka(buildPayload(updated));
      showSuccess(`Status updated to ${updated.IsActive ? "Active" : "Inactive"}`);
    } catch (err) {
      setAllTalukas(prev => prev.map(t => t.TalukaID === item.TalukaID ? item : t));
      showError(err?.response?.data?.message || "Failed to update status");
      await fetchTalukas();
    }
  };

  // ── Form Handlers ──────────────────────────────────────────────────────────

  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (!currentTaluka.Taluka || String(currentTaluka.Taluka).trim() === "") {
      showError("Taluka Name is required");
      return;
    }

    if (!currentTaluka.DistrictID || currentTaluka.DistrictID === "") {
      showError("Please select a District");
      return;
    }

    isEditing ? handleUpdate(currentTaluka) : handleInsert(currentTaluka);
  };

  const handleOpenPanel = (taluka = EMPTY_FORM, editMode = false) => {
    if (editMode && taluka.DistrictID) {
      const match = allDistrictsRef.current.find(d => String(d.DistrictID) === String(taluka.DistrictID));
      setCurrentTaluka({ ...taluka, StateID: match ? String(match.StateID) : "" });
    } else {
      setCurrentTaluka({ ...EMPTY_FORM, TalukaID: nextID });
    }
    setIsEditing(editMode);
    setIsPanelOpen(true);
  };

  // ── Status filter ──────────────────────────────────────────────────────────

  const statusFilteredTalukas = allTalukas
    .filter((t) => {
      if (selectedFilter === "Active") return t.IsActive;
      if (selectedFilter === "Inactive") return !t.IsActive;
      return true;
    })
    .filter((t) => {
      if (!searchTerm.trim()) return true;
      const q = searchTerm.trim().toLowerCase();
      return (
        t.Taluka.toLowerCase().includes(q) ||
        (t.TalukaMarathi || "").toLowerCase().includes(q) ||
        (t.DistrictName || "").toLowerCase().includes(q) ||
        String(t.TalukaID).includes(q)
      );
    });

  const stats = {
    TotalCount: allTalukas.length,
    ActiveCount: allTalukas.filter(t => t.IsActive).length,
    InactiveCount: allTalukas.filter(t => !t.IsActive).length,
  };

  // ── TABLE COLUMNS FOR FilteredTableComponent ──────────────────────────────

  const columns = [
    {
      key: "TalukaID",
      header: "Taluka ID",
      width: "90px",
      headerClassName: "text-center",
      className: "text-center font-mono",
    },
    { key: "Taluka", header: "Taluka Name", className: "font-medium" },
    { key: "TalukaMarathi", header: "Taluka (Marathi)" },
    { key: "DistrictName", header: "District", className: "font-mono" },
    { key: "IsActive", header: "Status", sortable: false },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "text-right",
      className: "text-right",
      sortable: false,
      excludeFromExport: true,
      width: "90px",
    },
  ];

  const renderTalukaCell = (item, column) => {
    switch (column.key) {
      case "IsActive":
        return (
          <button
            onClick={() => toggleStatusInline(item)}
            disabled={actionLoading}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium border text-xs transition-all active:scale-95 disabled:opacity-50 ${
              item.IsActive
                ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                : "bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${item.IsActive ? "bg-emerald-500" : "bg-rose-500"}`}
            />
            {item.IsActive ? "Active" : "Inactive"}
          </button>
        );

      case "actions":
        return (
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <button
              type="button"
              onClick={() => handleOpenPanel(item, true)}
              title="Edit"
              aria-label={`Edit ${item.Taluka}`}
              className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-violet-600 bg-violet-50 hover:bg-violet-600 hover:text-white transition-all active:scale-95"
            >
              <EditIcon />
            </button>
            <button
              type="button"
              onClick={() => handleDelete(item.TalukaID, item.Taluka)}
              disabled={actionLoading}
              title="Delete"
              aria-label={`Delete ${item.Taluka}`}
              className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white transition-all active:scale-95 disabled:opacity-50"
            >
              <TrashIcon />
            </button>
          </span>
        );

      default:
        return undefined;
    }
  };

  // District options for modal dropdown
  const districtOptions = useMemo(() => {
    const filtered = currentTaluka.StateID
      ? allDistricts.filter(d => String(d.StateID) === String(currentTaluka.StateID))
      : allDistricts;
    return filtered.map(d => ({ value: String(d.DistrictID), label: d.District ?? "" }));
  }, [currentTaluka.StateID, allDistricts]);

  const selectedStateName = useMemo(() =>
    stateOptions.find(s => s.value === String(currentTaluka.StateID))?.label || "—",
    [stateOptions, currentTaluka.StateID]
  );

  const selectedDistrictName = useMemo(() =>
    districtOptions.find(d => d.value === String(currentTaluka.DistrictID))?.label || "—",
    [districtOptions, currentTaluka.DistrictID]
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Loader - shows when loading or actionLoading is true */}
      {(loading || actionLoading) && <Loader />}

      <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased flex flex-col">
        {/* Toast */}
        {successMsg && (
          <div className="fixed top-4 right-4 z-[9999] bg-emerald-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2">
            ✓ {successMsg}
          </div>
        )}
        {error && (
          <div className="fixed top-4 right-4 z-[9999] bg-rose-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2">
            ✕ {error}
          </div>
        )}

        {/* Header */}
        <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-70 px-6 py-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div
              className={`h-9 w-9 rounded-xl ${color} flex items-center justify-center font-bold shadow-md text-white`}
            >
              T
            </div>
            <h1 className="text-md font-bold tracking-tight text-slate-900">
              Master Taluka
            </h1>
          </div>
        </header>

        <div className="flex flex-1 relative overflow-hidden">
          <main className="flex-1 p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full">
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
                <div>
                  <p className="text-xs text-slate-500 font-medium">
                    Total Talukas
                  </p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">
                    {stats.TotalCount.toLocaleString()}
                  </h3>
                </div>
                <span className="p-2 bg-slate-100 rounded-lg text-xl">📊</span>
              </div>
              <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
                <div>
                  <p className="text-xs text-emerald-600 font-medium">
                    Active Talukas
                  </p>
                  <h3 className="text-2xl font-bold text-emerald-600 mt-1">
                    {stats.ActiveCount.toLocaleString()}
                  </h3>
                </div>
                <span className="p-2 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold">
                  ● Live
                </span>
              </div>
              <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
                <div>
                  <p className="text-xs text-rose-600 font-medium">
                    Inactive Talukas
                  </p>
                  <h3 className="text-2xl font-bold text-rose-600 mt-1">
                    {stats.InactiveCount.toLocaleString()}
                  </h3>
                </div>
                <span className="p-2 bg-rose-50 text-rose-700 rounded-lg text-xs font-bold">
                  ○ Down
                </span>
              </div>
            </div>

            {/* Status tabs row — Back / Close live here */}
            <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-xs flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.history.back()}
                  title="Back"
                  className="flex items-center gap-2 pl-2 pr-2 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-full transition-all active:scale-95 shadow-sm"
                >
                  <span className="h-4 w-4 flex items-center justify-center rounded-full bg-white/20 text-white">
                    <BackIcon className="h-3 w-3" />
                  </span>
                  Back
                </button>

                <button
                  type="button"
                  onClick={() => {
                    window.location.href = "http://localhost:5173/react";
                  }}
                  title="Close"
                  className="flex items-center gap-2 pl-2 pr-2 py-2 bg-rose-600 hover:bg-rose-600 text-white text-xs font-semibold rounded-full transition-all active:scale-95 shadow-sm"
                >
                  <span className="h-4 w-4 flex items-center justify-center rounded-full bg-white/20 text-white">
                    <CloseIcon className="h-3 w-3" />
                  </span>
                  Close
                </button>
              </div>

              <div className="flex bg-slate-100 p-1 border border-slate-200 rounded-lg w-full md:w-fit">
                {["All", "Active", "Inactive"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setSelectedFilter(tab)}
                    className={`text-xs px-4 py-1.5 font-medium rounded-md transition-all w-full md:w-auto ${
                      selectedFilter === tab
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Toolbar — Search and Add New Record */}
            <div className="flex items-center gap-3">
              <div className="flex gap-2 shrink-0"></div>

              <div className="flex-1 flex justify-center">
                {/* <div className="relative w-full max-w-sm">
                  <input
                    type="text"
                    placeholder="🔍 Search talukas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#94a3b8"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                </div> */}
              </div>

              <button
                onClick={() => handleOpenPanel(EMPTY_FORM, false)}
                className={`shrink-0 ${color} text-white text-xs font-semibold px-4 py-2 rounded-xl active:scale-95 transition-all shadow-md whitespace-nowrap hover:opacity-90`}
              >
                + Add New Record
              </button>
            </div>

            {/* Table */}
            <FilteredTableComponent
              data={statusFilteredTalukas}
              columns={columns}
              renderCell={renderTalukaCell}
              loading={loading}
              tableId="talukas-table"
              emptyStateMessage="No talukas found"
              emptyStateSubMessage="Try adjusting your search or filters"
            />
          </main>

          {/* Fullscreen Square Modal */}
          {isPanelOpen && (
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4 sm:p-8"
              onClick={() => setIsPanelOpen(false)}
            >
              <div
                className="bg-white border border-slate-200 shadow-2xl rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className={`p-5 border-b border-slate-200 flex items-center justify-between shrink-0 text-white ${color}`}>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {isEditing
                        ? "✏️ Edit Taluka"
                        : "✨ Add New Taluka"}
                    </h3>
                    <p className="text-xs text-violet-100 mt-0.5">
                      {isEditing
                        ? "Update the taluka record below"
                        : "Fill in all fields to create a new taluka"}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsPanelOpen(false)}
                    className="opacity-80 hover:opacity-100 text-xl p-2 hover:bg-white/20 rounded-lg transition-all"
                  >✕</button>
                </div>

                <form
                  onSubmit={handleFormSubmit}
                  className="p-6 flex-1 overflow-y-auto"
                >
                  <div className="grid grid-cols-2 gap-4">
                    {/* Taluka ID */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Taluka ID
                        <span className="text-slate-400 font-normal ml-1">
                          {isEditing ? "(RO)" : "(auto)"}
                        </span>
                      </label>
                      <input
                        type="text"
                        value={currentTaluka.TalukaID ?? ""}
                        disabled
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-mono bg-slate-50 text-slate-500 cursor-not-allowed"
                      />
                    </div>

                    {/* Taluka Name */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Taluka Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={currentTaluka.Taluka}
                        onChange={(e) =>
                          setCurrentTaluka({
                            ...currentTaluka,
                            Taluka: e.target.value,
                          })
                        }
                        placeholder="e.g., Haveli, Mulshi, Maval"
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all placeholder:text-slate-300"
                      />
                    </div>

                    {/* Taluka Name (Marathi) */}
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Taluka Name (Marathi)
                      </label>
                      <input
                        type="text"
                        value={currentTaluka.TalukaMarathi || ""}
                        onChange={(e) =>
                          setCurrentTaluka({
                            ...currentTaluka,
                            TalukaMarathi: e.target.value,
                          })
                        }
                        placeholder="e.g., हवेली, मुळशी, मावळ"
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all placeholder:text-slate-300"
                      />
                    </div>

                    {/* State */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        State <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={currentTaluka.StateID ? String(currentTaluka.StateID) : ""}
                        onChange={(e) => {
                          setCurrentTaluka(prev => ({ ...prev, StateID: e.target.value, DistrictID: "" }));
                        }}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all bg-white"
                      >
                        <option value="">Select State</option>
                        {stateOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* District */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        District <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={currentTaluka.DistrictID ? String(currentTaluka.DistrictID) : ""}
                        onChange={(e) =>
                          setCurrentTaluka({
                            ...currentTaluka,
                            DistrictID: e.target.value,
                          })
                        }
                        disabled={districtOptions.length === 0 || !currentTaluka.StateID}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all bg-white disabled:bg-slate-50 disabled:cursor-not-allowed"
                      >
                        <option value="">Select District</option>
                        {districtOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      {!currentTaluka.StateID && (
                        <p className="text-[11px] text-slate-400 mt-1">↑ Select a state first</p>
                      )}
                      {currentTaluka.StateID && districtOptions.length === 0 && (
                        <p className="text-[11px] text-rose-400 mt-1">No districts found for selected state</p>
                      )}
                    </div>

                    {/* IsActive Toggle */}
                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl col-span-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-semibold text-slate-800 block select-none">
                            Status
                          </label>
                          <span className="text-[11px] text-slate-500 block mt-0.5">
                            {currentTaluka.IsActive
                              ? "Taluka is active and visible"
                              : "Taluka is disabled and hidden"}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setCurrentTaluka({
                              ...currentTaluka,
                              IsActive: !currentTaluka.IsActive,
                            })
                          }
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 shrink-0 ${
                            currentTaluka.IsActive
                              ? "bg-violet-600"
                              : "bg-slate-300"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                              currentTaluka.IsActive
                                ? "translate-x-6"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Record Preview */}
                    <div className="col-span-2 bg-gradient-to-br from-violet-50 to-purple-100/50 border border-violet-200 rounded-xl p-4">
                      <p className="text-[10px] font-bold text-violet-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <span>👁️</span> Record Preview
                      </p>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                        {[
                          ["Taluka ID", isEditing ? `#${currentTaluka.TalukaID}` : `#${nextID ?? "…"}`],
                          ["Taluka Name", currentTaluka.Taluka || "—"],
                          ["Marathi Name", currentTaluka.TalukaMarathi || "—"],
                          ["State", selectedStateName],
                          ["District", selectedDistrictName],
                        ].map(([label, val]) => (
                          <div
                            key={label}
                            className="flex justify-between text-sm py-1 border-b border-violet-100"
                          >
                            <span className="text-slate-500">{label}</span>
                            <span className="font-mono font-semibold text-slate-800 text-right max-w-[60%] truncate">
                              {val}
                            </span>
                          </div>
                        ))}
                        <div className="flex justify-between text-sm py-1 col-span-2">
                          <span className="text-slate-500">Status</span>
                          <span
                            className={`font-semibold ${currentTaluka.IsActive ? "text-emerald-600" : "text-rose-600"}`}
                          >
                            {currentTaluka.IsActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit (kept inside form so Enter key still works) */}
                  <button type="submit" className="hidden" aria-hidden="true" />
                </form>

                {/* Bottom action bar: Back / Save */}
                <div className="p-4 border-t border-slate-200 bg-slate-50 flex gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsPanelOpen(false)}
                    disabled={actionLoading}
                    className="flex-1 px-4 py-2.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
                  >
                    ⬅ Back
                  </button>
                  <button
                    type="button"
                    onClick={handleFormSubmit}
                    disabled={actionLoading}
                    className={`flex-1 px-4 py-2.5 text-sm font-bold rounded-xl shadow-md transition-all disabled:opacity-70 flex items-center justify-center gap-2 hover:opacity-90 text-white ${color}`}
                  >
                    {actionLoading && (
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    )}
                    {isEditing ? "💾 Save Changes" : "➕ Add Taluka"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}