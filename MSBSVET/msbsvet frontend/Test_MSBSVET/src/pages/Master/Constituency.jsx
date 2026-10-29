import React, { useState, useEffect, useCallback, useMemo, useContext } from "react";
import { MasterTableService } from "../../lib/services/MasterTableService";
import FilteredTableComponent from "../../Component/formcomponent/FilteredTableComponent";
import { ThemeContext } from "../../Component/Context/ThemeContext";
import Loader from "../../Component/formcomponent/Loader";
import DropdownComponent from "../../Component/formcomponent/DropdownComponent";

const EMPTY_FORM = {
  ConstituencyID: "",
  Constituency: "",
  ConstituencyMarathi: "",
  DistrictID: "",
  IsActive: true,
};

// ── icons ──────────────────────────────────────────────────────────────────
const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <path d="M3 6h18" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
  </svg>
);

const BackIcon = ({ className = "h-3.5 w-3.5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M19 12H5" />
    <path d="M12 19l-7-7 7-7" />
  </svg>
);

const CloseIcon = ({ className = "h-3.5 w-3.5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 6L6 18" />
    <path d="M6 6l12 12" />
  </svg>
);

export default function MasterConstituency() {
  const { color } = useContext(ThemeContext);

  // ── STATE ────────────────────────────────────────────────────────────────
  const [constituencies, setConstituencies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentConstituency, setCurrentConstituency] = useState(EMPTY_FORM);

  const [deleteTarget, setDeleteTarget] = useState(null);

  const [allStates, setAllStates] = useState([]);
  const [allDistricts, setAllDistricts] = useState([]);
  const [masterLoading, setMasterLoading] = useState(false);
  const [selectedStateID, setSelectedStateID] = useState("");

  // ── helpers ──────────────────────────────────────────────────────────────
  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };
  const showError = (msg) => {
    setError(msg);
    setTimeout(() => setError(null), 4000);
  };

  const extractErrorMessage = (err, fallback) => {
    const data = err?.response?.data;
    if (data?.errors) {
      return Object.values(data.errors).flat().join(", ");
    }
    return data?.Message || data?.message || err?.message || fallback;
  };

  // ── auth guard ──────────────────────────────────────────────────────────
  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem("userInfoAll"));
    if (!user || Number(user.UserTypeID) !== 11) {
      window.location.href = "http://localhost:5173/react";
    }
  }, []);

  // ── fetch constituencies ────────────────────────────────────────────────
  const fetchConstituencies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await MasterTableService.getAllConstituencies();
      const raw = Array.isArray(data) ? data : (data?.Data ?? data?.data ?? []);
      const mapped = raw.map((item) => ({
        ConstituencyID:      item.ConstituencyID ?? item.Id,
        Constituency:        item.Constituency ?? "",
        ConstituencyMarathi: item.ConstituencyMarathi ?? "",
        DistrictID:          item.DistrictID ?? "",
        DistrictName:        item.DistrictName ?? "",
        StateName:           item.StateName ?? "",
        IsActive:            item.IsActive ?? true,
      }));
      setConstituencies(mapped);
    } catch (err) {
      showError(err?.response?.data?.message || "Failed to load constituencies");
      setConstituencies([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── fetch master data ──────────────────────────────────────────────────
  useEffect(() => {
    const fetchMasterData = async () => {
      setMasterLoading(true);
      try {
        const [statesRes, districtsRes] = await Promise.all([
          MasterTableService.getAllStates(),
          MasterTableService.getAllDistricts(),
        ]);
        const rawStates = Array.isArray(statesRes) ? statesRes : statesRes?.Data ?? statesRes?.data ?? [];
        const rawDistricts = Array.isArray(districtsRes) ? districtsRes : districtsRes?.Data ?? districtsRes?.data ?? [];
        setAllStates(rawStates);
        setAllDistricts(rawDistricts);
      } catch (err) {
        console.error("Failed to load state/district master data:", err);
      } finally {
        setMasterLoading(false);
      }
    };
    fetchMasterData();
    fetchConstituencies();
  }, [fetchConstituencies]);

  // ── next ID ─────────────────────────────────────────────────────────────
  const nextConstituencyID = useMemo(() => {
    if (!constituencies || constituencies.length === 0) return 1;
    const maxId = Math.max(...constituencies.map((c) => Number(c.ConstituencyID) || 0));
    return maxId + 1;
  }, [constituencies]);

  // ── dropdown options ────────────────────────────────────────────────────
  const stateOptions = allStates.map((s) => ({
    value: String(s.StateID),
    label: s.State ?? s.StateName ?? "",
  }));

  const districtOptions = allDistricts
    .filter((d) => String(d.StateID) === String(selectedStateID))
    .map((d) => ({ value: String(d.DistrictID), label: d.District ?? "" }));

  const selectedStateLabel = stateOptions.find((s) => s.value === selectedStateID)?.label || "";
  const selectedDistrictLabel = districtOptions.find((d) => d.value === String(currentConstituency.DistrictID))?.label || "";

  const resolveStateDistrictNames = (districtID) => {
    const matchedDistrict = allDistricts.find((d) => String(d.DistrictID) === String(districtID));
    const matchedState = allStates.find((s) => String(s.StateID) === String(matchedDistrict?.StateID));
    return {
      districtName: matchedDistrict?.District ?? "",
      stateName: matchedState?.State ?? matchedState?.StateName ?? "",
    };
  };

  // ── CRUD ─────────────────────────────────────────────────────────────────
  const handleInsert = async (payload) => {
    setActionLoading(true);
    try {
      const { districtName, stateName } = resolveStateDistrictNames(payload.DistrictID);
      const response = await MasterTableService.insertConstituency({
        ConstituencyID:      Number(payload.ConstituencyID),
        Constituency:        payload.Constituency,
        ConstituencyMarathi: payload.ConstituencyMarathi || "",
        DistrictID:          Number(payload.DistrictID),
        DistrictName:        districtName || selectedDistrictLabel,
        StateName:           stateName || selectedStateLabel,
        IsActive:            payload.IsActive,
      });
      showSuccess(response?.message || response?.data?.message || "Constituency added successfully");
      setIsPanelOpen(false);
      await fetchConstituencies();
    } catch (err) {
      showError(extractErrorMessage(err, "Failed to add constituency"));
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async (payload) => {
    setActionLoading(true);
    try {
      const { districtName, stateName } = resolveStateDistrictNames(payload.DistrictID);
      const data = await MasterTableService.updateConstituency({
        ConstituencyID:      Number(payload.ConstituencyID),
        Constituency:        payload.Constituency,
        ConstituencyMarathi: payload.ConstituencyMarathi || "",
        DistrictID:          Number(payload.DistrictID),
        DistrictName:        districtName || selectedDistrictLabel,
        StateName:           stateName || selectedStateLabel,
        IsActive:            payload.IsActive,
      });
      showSuccess(data?.message || data?.data?.message || "Constituency updated successfully");
      setIsPanelOpen(false);
      await fetchConstituencies();
    } catch (err) {
      showError(extractErrorMessage(err, "Failed to update constituency"));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteClick = (item) => {
    setDeleteTarget(item);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      const data = await MasterTableService.softDeleteConstituency(deleteTarget.ConstituencyID);
      showSuccess(data?.message || "Constituency deleted successfully");
      setDeleteTarget(null);
      await fetchConstituencies();
    } catch (err) {
      showError(err?.response?.data?.message || "Failed to delete constituency");
    } finally {
      setActionLoading(false);
    }
  };

  const toggleStatusInline = async (item) => {
    const updated = { ...item, IsActive: !item.IsActive };
    setConstituencies((prev) => prev.map((c) => (c.ConstituencyID === item.ConstituencyID ? updated : c)));
    try {
      const { districtName, stateName } = resolveStateDistrictNames(updated.DistrictID);
      await MasterTableService.updateConstituency({
        ConstituencyID:      Number(updated.ConstituencyID),
        Constituency:        updated.Constituency,
        ConstituencyMarathi: updated.ConstituencyMarathi || "",
        DistrictID:          Number(updated.DistrictID),
        DistrictName:        districtName || updated.DistrictName || "",
        StateName:           stateName || updated.StateName || "",
        IsActive:            updated.IsActive,
      });
      showSuccess(`Status updated to ${updated.IsActive ? "Active" : "Inactive"}`);
    } catch (err) {
      setConstituencies((prev) => prev.map((c) => (c.ConstituencyID === item.ConstituencyID ? item : c)));
      showError(extractErrorMessage(err, "Failed to update status"));
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!currentConstituency.Constituency) { showError("Constituency Name is required"); return; }
    if (!selectedStateID)                  { showError("State is required"); return; }
    if (!currentConstituency.DistrictID)   { showError("District is required"); return; }
    isEditing ? handleUpdate(currentConstituency) : handleInsert(currentConstituency);
  };

  const handleOpenPanel = (constituency = EMPTY_FORM, editMode = false) => {
    setCurrentConstituency({
      ...constituency,
      ConstituencyID: editMode ? constituency.ConstituencyID : nextConstituencyID,
      IsActive: constituency.IsActive ?? true,
    });
    setIsEditing(editMode);
    
    // Fix: Properly set the state ID when editing
    if (editMode && constituency.DistrictID) {
      const matchedDistrict = allDistricts.find(
        (d) => String(d.DistrictID) === String(constituency.DistrictID)
      );
      if (matchedDistrict) {
        setSelectedStateID(String(matchedDistrict.StateID));
      } else {
        setSelectedStateID("");
      }
    } else {
      setSelectedStateID("");
    }
    
    setIsPanelOpen(true);
  };

  // ── filter ──────────────────────────────────────────────────────────────
  const filteredConstituencies = constituencies.filter((c) => {
    const matchStatus = selectedFilter === "All" ? true : selectedFilter === "Active" ? c.IsActive : !c.IsActive;
    const term = searchTerm.trim().toLowerCase();
    const matchSearch = term
      ? [c.ConstituencyID, c.Constituency, c.ConstituencyMarathi, c.DistrictName, c.StateName, c.IsActive ? "active" : "inactive"]
          .filter((v) => v !== null && v !== undefined)
          .some((v) => String(v).toLowerCase().includes(term))
      : true;
    return matchStatus && matchSearch;
  });

  const stats = {
    TotalCount:    constituencies.length,
    ActiveCount:   constituencies.filter((c) => c.IsActive).length,
    InactiveCount: constituencies.filter((c) => !c.IsActive).length,
  };

  // ── table columns ──────────────────────────────────────────────────────
  const columns = [
    { key: "ConstituencyID", header: "ID", width: "90px", headerClassName: "text-center", className: "text-center font-mono" },
    { key: "Constituency", header: "Constituency Name", className: "font-medium" },
    { key: "ConstituencyMarathi", header: "Name (Marathi)" },
    { key: "DistrictName", header: "District" },
    { key: "IsActive", header: "Status", sortable: false },
    { key: "actions", header: "Actions", headerClassName: "text-right", className: "text-right", sortable: false, excludeFromExport: true, width: "90px" },
  ];

  const renderCell = (item, column) => {
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
            <span className={`h-1.5 w-1.5 rounded-full ${item.IsActive ? "bg-emerald-500" : "bg-rose-500"}`} />
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
              className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-violet-600 bg-violet-50 hover:bg-violet-600 hover:text-white transition-all active:scale-95"
            >
              <EditIcon />
            </button>
            <button
              type="button"
              onClick={() => handleDeleteClick(item)}
              disabled={actionLoading}
              title="Delete"
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

  return (
    <>
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
            <div className={`h-9 w-9 rounded-xl ${color} flex items-center justify-center font-bold shadow-md text-white`}>
              C
            </div>
            <h1 className="text-md font-bold tracking-tight text-slate-900">Master Constituency</h1>
          </div>
        </header>

        <div className="flex flex-1 relative overflow-hidden">
          <main className="flex-1 p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full">

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
                <div>
                  <p className="text-xs text-slate-500 font-medium">Total Registered</p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.TotalCount.toLocaleString()}</h3>
                </div>
                <span className="p-2 bg-slate-100 rounded-lg text-xl">📊</span>
              </div>
              <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
                <div>
                  <p className="text-xs text-emerald-600 font-medium">Active Constituencies</p>
                  <h3 className="text-2xl font-bold text-emerald-600 mt-1">{stats.ActiveCount.toLocaleString()}</h3>
                </div>
                <span className="p-2 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold">● Live</span>
              </div>
              <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
                <div>
                  <p className="text-xs text-rose-600 font-medium">Disabled</p>
                  <h3 className="text-2xl font-bold text-rose-600 mt-1">{stats.InactiveCount.toLocaleString()}</h3>
                </div>
                <span className="p-2 bg-rose-50 text-rose-700 rounded-lg text-xs font-bold">○ Down</span>
              </div>
            </div>

            {/* Status tabs + Back/Close */}
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
                  onClick={() => { window.location.href = "http://localhost:5173/react"; }}
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

            {/* Search + Add */}
            <div className="flex items-center gap-3">
              <div className="flex-1 flex justify-center">
                {/* <div className="relative w-full max-w-sm">
                  <input
                    type="text"
                    placeholder="🔍 Search by ID, Name, Marathi, District, State..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2">
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
              data={filteredConstituencies}
              columns={columns}
              renderCell={renderCell}
              loading={loading}
              tableId="constituency-table"
              emptyStateMessage="No constituencies found"
              emptyStateSubMessage="Try adjusting your search or filters"
            />

          </main>

          {/* Modal */}
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
                      {isEditing ? "✏️ Edit Constituency" : "✨ Add New Constituency"}
                    </h3>
                    <p className="text-xs text-violet-100 mt-0.5">
                      {isEditing ? "Update the constituency record below" : "Fill in all fields to create a new constituency"}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsPanelOpen(false)}
                    className="opacity-80 hover:opacity-100 text-xl p-2 hover:bg-white/20 rounded-lg transition-all"
                  >✕</button>
                </div>

                <form onSubmit={handleFormSubmit} className="p-6 flex-1 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Constituency ID
                        <span className="text-slate-400 font-normal ml-1">{isEditing ? "(RO)" : "(auto)"}</span>
                      </label>
                      <input
                        type="text"
                        value={currentConstituency.ConstituencyID}
                        disabled
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-mono bg-slate-50 text-slate-500 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Constituency Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={currentConstituency.Constituency}
                        onChange={(e) => setCurrentConstituency({ ...currentConstituency, Constituency: e.target.value })}
                        placeholder="e.g., Akkalkuwa, Dhule Rural, Raver"
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all placeholder:text-slate-300"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Constituency Name (Marathi)
                      </label>
                      <input
                        type="text"
                        value={currentConstituency.ConstituencyMarathi}
                        onChange={(e) => setCurrentConstituency({ ...currentConstituency, ConstituencyMarathi: e.target.value })}
                        placeholder="e.g., अक्कलकुवा, धुळे ग्रामीण"
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all placeholder:text-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        State <span className="text-rose-500">*</span>
                      </label>
                      <DropdownComponent
                        options={stateOptions}
                        value={selectedStateID}
                        onChange={(val) => {
                          setSelectedStateID(val);
                          setCurrentConstituency((prev) => ({ ...prev, DistrictID: "" }));
                        }}
                        loading={masterLoading}
                        placeholder="Select State"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        District <span className="text-rose-500">*</span>
                      </label>
                      <DropdownComponent
                        options={districtOptions}
                        value={String(currentConstituency.DistrictID ?? "")}
                        onChange={(val) => setCurrentConstituency({ ...currentConstituency, DistrictID: val })}
                        disabled={!selectedStateID}
                        loading={masterLoading}
                        placeholder={!selectedStateID ? "Select State First" : "Select District"}
                      />
                      {!selectedStateID && (
                        <p className="text-[11px] text-slate-400 mt-1">↑ Select a state first</p>
                      )}
                      {selectedStateID && districtOptions.length === 0 && !masterLoading && (
                        <p className="text-[11px] text-amber-500 mt-1">No districts found for this state</p>
                      )}
                    </div>

                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl col-span-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-semibold text-slate-800 block select-none">Status</label>
                          <span className="text-[11px] text-slate-500 block mt-0.5">
                            {currentConstituency.IsActive ? "Active & visible" : "Disabled & hidden"}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCurrentConstituency({ ...currentConstituency, IsActive: !currentConstituency.IsActive })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 shrink-0 ${
                            currentConstituency.IsActive ? "bg-violet-600" : "bg-slate-300"
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                            currentConstituency.IsActive ? "translate-x-6" : "translate-x-1"
                          }`} />
                        </button>
                      </div>
                    </div>

                    <div className="col-span-2 bg-gradient-to-br from-violet-50 to-purple-100/50 border border-violet-200 rounded-xl p-4">
                      <p className="text-[10px] font-bold text-violet-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <span>👁️</span> Record Preview
                      </p>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                        {[
                          ["ID", `#${currentConstituency.ConstituencyID}`],
                          ["Name", currentConstituency.Constituency || "—"],
                          ["Marathi Name", currentConstituency.ConstituencyMarathi || "—"],
                          ["State", selectedStateLabel || "—"],
                          ["District", selectedDistrictLabel || "—"],
                        ].map(([label, val]) => (
                          <div key={label} className="flex justify-between text-sm py-1 border-b border-violet-100">
                            <span className="text-slate-500">{label}</span>
                            <span className="font-mono font-semibold text-slate-800 text-right max-w-[60%] truncate">{val}</span>
                          </div>
                        ))}
                        <div className="flex justify-between text-sm py-1 col-span-2">
                          <span className="text-slate-500">Status</span>
                          <span className={`font-semibold ${currentConstituency.IsActive ? "text-emerald-600" : "text-rose-600"}`}>
                            {currentConstituency.IsActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button type="submit" className="hidden" aria-hidden="true" />
                </form>

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
                    {isEditing ? "💾 Save Changes" : "➕ Add Constituency"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirmation */}
          {deleteTarget && (
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[80] flex items-center justify-center p-4"
              onClick={() => !actionLoading && setDeleteTarget(null)}
            >
              <div className="bg-white border border-slate-200 shadow-2xl rounded-2xl w-full max-w-sm overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="p-5 border-b border-slate-200 flex items-center gap-3 bg-rose-50">
                  <span className="h-10 w-10 flex items-center justify-center rounded-full bg-rose-100 text-rose-600 text-xl shrink-0">🗑️</span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Delete Constituency</h3>
                    <p className="text-xs text-slate-500 mt-0.5">This action cannot be undone.</p>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-sm text-slate-600">
                    Are you sure you want to delete{" "}
                    <span className="font-semibold text-slate-900">#{deleteTarget.ConstituencyID} — {deleteTarget.Constituency}</span>?
                  </p>
                </div>
                <div className="p-4 border-t border-slate-200 bg-slate-50 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(null)}
                    disabled={actionLoading}
                    className="flex-1 px-4 py-2.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmDelete}
                    disabled={actionLoading}
                    className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold rounded-xl shadow-md transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {actionLoading && (
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    )}
                    🗑️ Delete
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