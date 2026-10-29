import React, { useState, useEffect, useCallback, useMemo, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { MasterTableService } from "../../lib/services/MasterTableService";
import FilteredTableComponent from "../../Component/formcomponent/FilteredTableComponent";
import { ThemeContext } from "../../Component/Context/ThemeContext";
import Loader from "../../Component/formcomponent/Loader";

const EMPTY_FORM = { 
  StateID: '', 
  State: '', 
  CountryID: '77', 
  IsActive: true 
};

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// ── small inline icons ─
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

export default function StateDashboard() {
  const { color } = useContext(ThemeContext); // e.g. "bg-[#002060]" — drives the S avatar below

  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentState, setCurrentState] = useState(EMPTY_FORM);

  const navigate = useNavigate();

  // ── Authentication Check ──────────────────────────────────────────────────
  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem("userInfoAll"));
    if (!user || Number(user.UserTypeID) !== 11) {
      window.location.href = "http://localhost:5173/react";
    }
  }, []);

  // ── Toast Helpers ─────────────────────────────────────────────────────────
  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const showError = (msg) => {
    setError(msg);
    setTimeout(() => setError(null), 4000);
  };

  // ── FETCH STATES ─────────────────────────────────────────────────────────
  const fetchStates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await MasterTableService.getAll();
      const raw = Array.isArray(data)
        ? data
        : (data?.Data ?? data?.data ?? []);

      setStates(raw.map(item => ({
        StateID: item.StateID ?? item.Id,
        State: item.State ?? item.Name,
        CountryID: item.CountryID ?? item.Code ?? '',
        IsActive: item.IsActive ?? true,
      })));
    } catch (err) {
      showError(
        err?.response?.data?.message ||
        err?.response?.data?.Message ||
        'Failed to load states'
      );
      setStates([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStates(); }, [fetchStates]);
  useEffect(() => { setCurrentPage(1); }, [searchTerm, selectedFilter]);

  // ── NEXT ID ──────────────────────────────────────────────────────────────
  const nextStateID = useMemo(() => {
    if (!states || states.length === 0) return 1;
    const maxId = Math.max(...states.map(s => Number(s.StateID) || 0));
    return maxId + 1;
  }, [states]);

  // ── INSERT ────────────────────────────────────────────────────────────────
  const handleInsert = async (payload) => {
    setActionLoading(true);
    try {
      const response = await MasterTableService.insert({
        StateID: Number(payload.StateID),
        State: payload.State,
        CountryID: Number(payload.CountryID),
        IsActive: payload.IsActive,
      });

      showSuccess(
        response?.Data?.Message ||
        response?.message ||
        response?.data?.message ||
        'State added successfully'
      );
      setIsPanelOpen(false);
      await fetchStates();
    } catch (err) {
      showError(
        err?.response?.data?.Message ||
        err?.response?.data?.message ||
        err.message ||
        'Failed to add state'
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ── UPDATE ────────────────────────────────────────────────────────────────
  const handleUpdate = async (payload) => {
    setActionLoading(true);
    try {
      const data = await MasterTableService.update({
        StateID: Number(payload.StateID),
        State: payload.State,
        CountryID: Number(payload.CountryID),
        IsActive: payload.IsActive,
      });

      showSuccess(
        data?.Data?.Message ||
        data?.message ||
        data?.data?.message ||
        'State updated successfully'
      );
      setIsPanelOpen(false);
      await fetchStates();
    } catch (err) {
      showError(
        err?.response?.data?.Message ||
        err?.response?.data?.message ||
        'Failed to update state'
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ── DELETE ────────────────────────────────────────────────────────────────
  const handleDelete = async (stateID, stateName) => {
    if (!window.confirm(`Are you sure you want to delete "${stateName}"?`)) return;
    setActionLoading(true);
    try {
      const data = await MasterTableService.softDelete(stateID);
      showSuccess(data?.message || data?.Data?.Message || 'State deleted successfully');
      await fetchStates();
    } catch (err) {
      showError(
        err?.response?.data?.Message ||
        err?.response?.data?.message ||
        'Failed to delete state'
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ── TOGGLE STATUS ─────────────────────────────────────────────────────────
  const toggleStatusInline = async (item) => {
    const updated = { ...item, IsActive: !item.IsActive };
    setStates(prev =>
      prev.map(s => s.StateID === item.StateID ? updated : s)
    );
    try {
      await MasterTableService.update({
        StateID: Number(updated.StateID),
        State: updated.State,
        CountryID: Number(updated.CountryID),
        IsActive: updated.IsActive,
      });
      showSuccess(`Status updated to ${updated.IsActive ? 'Active' : 'Inactive'}`);
    } catch (err) {
      setStates(prev =>
        prev.map(s => s.StateID === item.StateID ? item : s)
      );
      showError(
        err?.response?.data?.Message ||
        err?.response?.data?.message ||
        'Failed to update status'
      );
    }
  };

  // ── FORM SUBMIT ───────────────────────────────────────────────────────────
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!currentState.StateID) { 
      showError('State ID is required'); 
      return; 
    }
    if (!currentState.State?.trim()) { 
      showError('State Name is required'); 
      return; 
    }
    if (!currentState.CountryID) { 
      showError('Country ID is required'); 
      return; 
    }
    isEditing ? handleUpdate(currentState) : handleInsert(currentState);
  };

  const handleOpenPanel = (state = EMPTY_FORM, editMode = false) => {
    setCurrentState({
      ...state,
      StateID: editMode ? state.StateID : nextStateID,
      CountryID: state.CountryID || '77',
      IsActive: state.IsActive ?? true,
    });
    setIsEditing(editMode);
    setIsPanelOpen(true);
  };

  // ── FILTERING ─────────────────────────────────────────────────────────────
  const filteredStates = states.filter(s => {
    const matchStatus =
      selectedFilter === "All" ? true :
      selectedFilter === "Active" ? s.IsActive : !s.IsActive;

    const term = searchTerm.trim().toLowerCase();
    const matchSearch = term
      ? [
          s.StateID,
          s.State,
          s.CountryID,
          s.IsActive ? "active" : "inactive",
        ]
          .filter(v => v !== null && v !== undefined)
          .some(v => String(v).toLowerCase().includes(term))
      : true;

    return matchStatus && matchSearch;
  });

  const stats = {
    TotalCount: states.length,
    ActiveCount: states.filter(s => s.IsActive).length,
    InactiveCount: states.filter(s => !s.IsActive).length,
  };

  // ── TABLE COLUMNS FOR FilteredTableComponent ──────────────────────────────
  const columns = [
    {
      key: "StateID",
      header: "State ID",
      width: "90px",
      headerClassName: "text-center",
      className: "text-center font-mono",
    },
    { key: "State", header: "State Name", className: "font-medium" },
    { 
      key: "CountryID", 
      header: "Country ID",
      headerClassName: "text-center",
      className: "text-center",
    },
    {
      key: "IsActive",
      header: "Status",
      sortable: false,
      headerClassName: "text-center",
      className: "text-center",
    },
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

  const renderStateCell = (item, column) => {
    switch (column.key) {
      case "CountryID":
        return (
          <span className="bg-slate-100 border border-slate-200 text-slate-600 font-mono px-2 py-1 rounded text-xs">
            CID-{item.CountryID}
          </span>
        );

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
              aria-label={`Edit ${item.State}`}
              className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-violet-600 bg-violet-50 hover:bg-violet-600 hover:text-white transition-all active:scale-95"
            >
              <EditIcon />
            </button>
            <button
              type="button"
              onClick={() => handleDelete(item.StateID, item.State)}
              disabled={actionLoading}
              title="Delete"
              aria-label={`Delete ${item.State}`}
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

  // ── RENDER ────────────────────────────────────────────────────────────────
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
        <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className={`h-9 w-9 rounded-xl ${color} flex items-center justify-center font-bold shadow-md text-white`}>
              S
            </div>
            <h1 className="text-md font-bold tracking-tight text-slate-900">Master State</h1>
          </div>
        </header>

        <div className="flex flex-1 relative overflow-hidden">
          <main className="flex-1 p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full">
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
                <div>
                  <p className="text-xs text-slate-500 font-medium">Total States</p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.TotalCount.toLocaleString()}</h3>
                </div>
                <span className="p-2 bg-slate-100 rounded-lg text-xl">🌍</span>
              </div>
              <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
                <div>
                  <p className="text-xs text-emerald-600 font-medium">Active States</p>
                  <h3 className="text-2xl font-bold text-emerald-600 mt-1">{stats.ActiveCount.toLocaleString()}</h3>
                </div>
                <span className="p-2 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold">● Live</span>
              </div>
              <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
                <div>
                  <p className="text-xs text-rose-600 font-medium">Inactive States</p>
                  <h3 className="text-2xl font-bold text-rose-600 mt-1">{stats.InactiveCount.toLocaleString()}</h3>
                </div>
                <span className="p-2 bg-rose-50 text-rose-700 rounded-lg text-xs font-bold">○ Down</span>
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

            {/* Toolbar — Search and Add New Record */}
            <div className="flex items-center gap-3">
              <div className="flex-1 flex justify-center">
                {/* <div className="relative w-full max-w-sm">
                  <input
                    type="text"
                    placeholder="🔍 Search states..."
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
              data={filteredStates}
              columns={columns}
              renderCell={renderStateCell}
              loading={loading}
              tableId="states-table"
              emptyStateMessage="No states found"
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
                      {isEditing ? "✏️ Edit State" : "✨ Add New State"}
                    </h3>
                    <p className="text-xs text-indigo-100 mt-0.5">
                      {isEditing ? "Update the state record below" : "Fill in all fields to create a new state"}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsPanelOpen(false)}
                    className="opacity-80 hover:opacity-100 text-xl p-2 hover:bg-white/20 rounded-lg transition-all"
                  >✕</button>
                </div>

                <form onSubmit={handleFormSubmit} className="p-6 flex-1 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4">
                    {/* State ID */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        State ID
                        <span className="text-slate-400 font-normal ml-1">
                          {isEditing ? "(RO)" : "(auto)"}
                        </span>
                      </label>
                      <input
                        type="text"
                        value={currentState.StateID}
                        disabled
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-mono bg-slate-50 text-slate-500 cursor-not-allowed"
                      />
                    </div>

                    {/* Country ID */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Country ID <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={currentState.CountryID}
                        onChange={(e) => setCurrentState({ ...currentState, CountryID: e.target.value })}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all cursor-pointer"
                      >
                        <option value="77">🇮🇳 India (ID: 77)</option>
                        <option value="1">🇺🇸 United States (ID: 1)</option>
                        <option value="2">🇬🇧 United Kingdom (ID: 2)</option>
                        <option value="3">🇨🇦 Canada (ID: 3)</option>
                        <option value="4">🇦🇺 Australia (ID: 4)</option>
                      </select>
                    </div>

                    {/* State Name */}
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        State Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={currentState.State}
                        onChange={(e) => setCurrentState({ ...currentState, State: e.target.value })}
                        placeholder="e.g., Goa, Delhi, Maharashtra"
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-300"
                      />
                    </div>

                    {/* IsActive Toggle */}
                    <div className="col-span-2 bg-slate-50 border border-slate-200 p-3 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-semibold text-slate-800 block select-none">Status</label>
                          <span className="text-[11px] text-slate-500 block mt-0.5">
                            {currentState.IsActive ? "Active & visible" : "Disabled & hidden"}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCurrentState({ ...currentState, IsActive: !currentState.IsActive })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shrink-0 ${
                            currentState.IsActive ? "bg-indigo-600" : "bg-slate-300"
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                            currentState.IsActive ? "translate-x-6" : "translate-x-1"
                          }`} />
                        </button>
                      </div>
                      <div className="mt-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 ${
                          currentState.IsActive ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${currentState.IsActive ? "bg-emerald-500" : "bg-rose-500"}`} />
                          {currentState.IsActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>

                    {/* Record Preview */}
                    <div className="col-span-2 bg-gradient-to-br from-indigo-50 to-purple-100/50 border border-indigo-200 rounded-xl p-4">
                      <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <span>👁️</span> Record Preview
                      </p>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                        {[
                          ["State ID", `#${currentState.StateID}`],
                          ["State Name", currentState.State || "—"],
                          ["Country ID", `CID-${currentState.CountryID}`],
                        ].map(([label, val]) => (
                          <div key={label} className="flex justify-between text-sm py-1 border-b border-indigo-100">
                            <span className="text-slate-500">{label}</span>
                            <span className="font-mono font-semibold text-slate-800 text-right max-w-[60%] truncate">{val}</span>
                          </div>
                        ))}
                        <div className="flex justify-between text-sm py-1 col-span-2">
                          <span className="text-slate-500">Status</span>
                          <span className={`font-semibold ${currentState.IsActive ? "text-emerald-600" : "text-rose-600"}`}>
                            {currentState.IsActive ? "Active" : "Inactive"}
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
                    {isEditing ? "💾 Save Changes" : "➕ Add State"}
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