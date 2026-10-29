import React, { useState, useEffect, useCallback, useMemo, useContext } from "react";
import { MasterTableService } from "../../lib/services/MasterTableService";
import FilteredTableComponent from "../../Component/formcomponent/FilteredTableComponent";
import { ThemeContext } from "../../Component/Context/ThemeContext";

const EMPTY_FORM = {
  CountryID: "",
  Country:   "",
  IsActive:  true,
};

// ── helpers ──────────────────────────────────────────────────────────────────
const buildPayload = (form) => ({
  CountryID: Number(form.CountryID) || 0,
  Country:   (form.Country ?? "").trim(),
  IsActive:  form.IsActive === true || form.IsActive === 1,
});

// ── small inline icons ──────────────────────────────────────────────────────
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

const ExcelIcon = () => (
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
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="M8 13l2 3 2-3" />
    <path d="M12 16l2-3 2 3" />
  </svg>
);

const PdfIcon = () => (
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
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="M12 18v-4" />
    <path d="M12 10h.01" />
  </svg>
);

export default function MasterCountry() {
  const { color } = useContext(ThemeContext); // e.g. "bg-[#002060]" — drives the C avatar and add button

  const [countries, setCountries]           = useState([]);
  const [loading, setLoading]               = useState(false);
  const [actionLoading, setActionLoading]   = useState(false);
  const [searchTerm, setSearchTerm]         = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [error, setError]                   = useState(null);
  const [successMsg, setSuccessMsg]         = useState(null);

  // Delete Popup State
  const [deletePopup, setDeletePopup]       = useState({ isOpen: false, id: null, name: "" });

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isEditing, setIsEditing]     = useState(false);
  const [currentCountry, setCurrentCountry] = useState(EMPTY_FORM);

  // ── TOASTS ──────────────────────────────────────────────────────────────────
  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };
  const showError = (msg) => {
    setError(msg);
    setTimeout(() => setError(null), 4000);
  };

  // ── FETCH ──────────────────────────────────────────────────────────────────
  const fetchCountries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await MasterTableService.getAllCountries();
      const raw = data?.Data ?? data?.data ?? (Array.isArray(data) ? data : []);
      setCountries(
        raw
          .filter((item) => Number(item.CountryID ?? -2) > -1)
          .map((item) => ({
            CountryID: item.CountryID,
            Country:   item.Country ?? "",
            IsActive:  item.IsActive === true || item.IsActive === 1,
          }))
      );
    } catch (err) {
      showError(
        err?.response?.data?.Message ||
        err?.response?.data?.message ||
        "Failed to load countries"
      );
      setCountries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCountries(); }, [fetchCountries]);

  // ── NEXT ID (client-side derived) ─────────────────────────────────────────
  const nextCountryId = useMemo(() => {
    if (!countries || countries.length === 0) return 1;
    const validIds = countries.map((c) => Number(c.CountryID)).filter(id => !isNaN(id) && id > 0);
    const maxId = validIds.length > 0 ? Math.max(...validIds) : 0;
    return maxId + 1;
  }, [countries]);

  // ── INSERT ─────────────────────────────────────────────────────────────────
  const handleInsert = async (form) => {
    setActionLoading(true);
    try {
      const payload = buildPayload(form);
      const response = await MasterTableService.insertCountry(payload);
      showSuccess(
        response?.Data?.Message ||
        response?.message ||
        response?.data?.message ||
        "Country added successfully"
      );
      setIsPanelOpen(false);
      await fetchCountries();
    } catch (err) {
      showError(
        err?.response?.data?.Message ||
        err?.response?.data?.message ||
        err.message ||
        "Failed to add country"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ── UPDATE ─────────────────────────────────────────────────────────────────
  const handleUpdate = async (form) => {
    setActionLoading(true);
    try {
      const payload = buildPayload(form);
      const data = await MasterTableService.updateCountry(payload);
      showSuccess(
        data?.Data?.Message ||
        data?.message ||
        data?.data?.message ||
        "Country updated successfully"
      );
      setIsPanelOpen(false);
      await fetchCountries();
    } catch (err) {
      showError(
        err?.response?.data?.Message ||
        err?.response?.data?.message ||
        err.message ||
        "Failed to update country"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ── DELETE ─────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    const { id, name } = deletePopup;
    if (!id) return;
    setActionLoading(true);
    setDeletePopup({ isOpen: false, id: null, name: "" });
    try {
      const data = await MasterTableService.softDeleteCountry(id);
      showSuccess(data?.message || data?.Data?.Message || "Country deleted successfully");
      await fetchCountries();
    } catch (err) {
      showError(
        err?.response?.data?.Message ||
        err?.response?.data?.message ||
        "Failed to delete country"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ── TOGGLE STATUS ──────────────────────────────────────────────────────────
  const toggleStatusInline = async (item) => {
    const updated = { ...item, IsActive: !item.IsActive };
    setCountries((prev) =>
      prev.map((c) => (c.CountryID === item.CountryID ? updated : c))
    );
    try {
      const payload = buildPayload(updated);
      await MasterTableService.updateCountry(payload);
      showSuccess(`Status updated to ${updated.IsActive ? "Active" : "Inactive"}`);
    } catch (err) {
      setCountries((prev) =>
        prev.map((c) => (c.CountryID === item.CountryID ? item : c))
      );
      showError(
        err?.response?.data?.Message ||
        err?.response?.data?.message ||
        "Failed to update status"
      );
    }
  };

  // ── FORM SUBMIT ────────────────────────────────────────────────────────────
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!currentCountry.Country?.trim()) { showError("Country Name is required"); return; }
    isEditing ? handleUpdate(currentCountry) : handleInsert(currentCountry);
  };

  const handleOpenPanel = (country = EMPTY_FORM, editMode = false) => {
    setCurrentCountry({
      ...country,
      CountryID: editMode ? country.CountryID : nextCountryId,
      IsActive:  country.IsActive ?? true,
    });
    setIsEditing(editMode);
    setIsPanelOpen(true);
  };

  // ── STATUS TAB + SEARCH FILTER ────────────────────────────────────────────
  const statusFilteredCountries = countries
    .filter((c) => {
      if (selectedFilter === "Active") return c.IsActive;
      if (selectedFilter === "Inactive") return !c.IsActive;
      return true;
    })
    .filter((c) => {
      if (!searchTerm.trim()) return true;
      const q = searchTerm.trim().toLowerCase();
      return (
        String(c.CountryID).toLowerCase().includes(q) ||
        c.Country.toLowerCase().includes(q)
      );
    });

  const stats = {
    TotalCount:    countries.length,
    ActiveCount:   countries.filter((c) => c.IsActive).length,
    InactiveCount: countries.filter((c) => !c.IsActive).length,
  };

  // ── TABLE COLUMNS FOR FilteredTableComponent ──────────────────────────────
  const columns = [
    {
      key: "CountryID",
      header: "ID",
      width: "90px",
      headerClassName: "text-center",
      className: "text-center font-mono",
    },
    { key: "Country", header: "Country Name", className: "font-medium" },
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

  const renderCountryCell = (item, column) => {
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
              aria-label={`Edit ${item.Country}`}
              className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-violet-600 bg-violet-50 hover:bg-violet-600 hover:text-white transition-all active:scale-95"
            >
              <EditIcon />
            </button>
            <button
              type="button"
              onClick={() => setDeletePopup({ isOpen: true, id: item.CountryID, name: item.Country })}
              disabled={actionLoading}
              title="Delete"
              aria-label={`Delete ${item.Country}`}
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

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased flex flex-col">

      {/* Toast Messages */}
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
          <h1 className="text-md font-bold tracking-tight text-slate-900">Master Country</h1>
        </div>
      </header>

      <div className="flex flex-1 relative overflow-hidden">
        <main className="flex-1 p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full">

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
              <div>
                <p className="text-xs text-slate-500 font-medium">Total Countries</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.TotalCount.toLocaleString()}</h3>
              </div>
              <span className="p-2 bg-slate-100 rounded-lg text-xl">🌍</span>
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
              <div>
                <p className="text-xs text-emerald-600 font-medium">Active Countries</p>
                <h3 className="text-2xl font-bold text-emerald-600 mt-1">{stats.ActiveCount.toLocaleString()}</h3>
              </div>
              <span className="p-2 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold">● Live</span>
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
              <div>
                <p className="text-xs text-rose-600 font-medium">Inactive Countries</p>
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
                className="flex items-center gap-2 pl-2 pr-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-full transition-all active:scale-95 shadow-sm"
              >
                <span className="h-6 w-6 flex items-center justify-center rounded-full bg-white/20 text-white">
                  <BackIcon className="h-3.5 w-3.5" />
                </span>
                Back
              </button>

              <button
                type="button"
                onClick={() => { window.location.href = "http://localhost:5173/react"; }}
                title="Close"
                className="flex items-center gap-2 pl-2 pr-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-full transition-all active:scale-95 shadow-sm"
              >
                <span className="h-6 w-6 flex items-center justify-center rounded-full bg-white/20 text-white">
                  <CloseIcon className="h-3.5 w-3.5" />
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

          {/* Toolbar — Search and Add New Record (Excel/PDF removed) */}
          <div className="flex items-center gap-3">
            <div className="flex-1 flex justify-center">
              {/* <div className="relative w-full max-w-sm">
                <input
                  type="text"
                  placeholder="Search countries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all"
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
            data={statusFilteredCountries}
            columns={columns}
            renderCell={renderCountryCell}
            loading={loading}
            tableId="countries-table"
            emptyStateMessage="No countries found"
            emptyStateSubMessage="Try adjusting your search or filters"
          />

        </main>

        {/* ========================================================== */}
        {/* ADD / EDIT MODAL                                            */}
        {/* ========================================================== */}
        {isPanelOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4 sm:p-8"
            onClick={() => setIsPanelOpen(false)}
          >
            <div
              className="bg-white border border-slate-200 shadow-2xl rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className={`p-5 border-b border-slate-200 flex items-center justify-between shrink-0 text-white ${color}`}>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    {isEditing ? "✏️ Edit Country" : "✨ Add New Country"}
                  </h3>
                  <p className="text-xs text-teal-100 mt-0.5">
                    {isEditing ? "Update the country record below" : "Fill in all fields to create a new country"}
                  </p>
                </div>
                <button
                  onClick={() => setIsPanelOpen(false)}
                  className="text-white/80 hover:text-white text-xl p-2 hover:bg-white/20 rounded-lg transition-all"
                >✕</button>
              </div>

              <form onSubmit={handleFormSubmit} className="p-6 flex-1 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">

                  {/* Country ID - Read Only & Auto Badge */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-2">
                      Country ID
                      {!isEditing && <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">⚡ Auto</span>}
                    </label>
                    <input
                      type="text"
                      value={currentCountry.CountryID}
                      disabled
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-mono bg-slate-50 text-slate-500 cursor-not-allowed"
                    />
                    {!isEditing && (
                      <p className="text-[10px] text-slate-400 mt-1">
                        Auto-assigned as <span className="font-bold text-emerald-600">{nextCountryId}</span> (max ID + 1)
                      </p>
                    )}
                  </div>

                  {/* Country Name */}
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      Country Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={currentCountry.Country}
                      onChange={(e) => setCurrentCountry({ ...currentCountry, Country: e.target.value })}
                      placeholder="e.g., India"
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all placeholder:text-slate-300"
                    />
                  </div>

                  {/* IsActive Toggle */}
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl col-span-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-semibold text-slate-800 block select-none">Status</label>
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                          {currentCountry.IsActive ? "Active & visible" : "Disabled & hidden"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCurrentCountry({ ...currentCountry, IsActive: !currentCountry.IsActive })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 shrink-0 ${
                          currentCountry.IsActive ? "bg-emerald-600" : "bg-slate-300"
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                          currentCountry.IsActive ? "translate-x-6" : "translate-x-1"
                        }`} />
                      </button>
                    </div>
                  </div>

                  {/* Record Preview */}
                  <div className="col-span-2 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4">
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <span>👁️</span> Record Preview
                    </p>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                      {[
                        ["ID",           `#${currentCountry.CountryID}`],
                        ["Country Name", currentCountry.Country || "—"],
                      ].map(([label, val]) => (
                        <div key={label} className="flex justify-between text-sm py-1 border-b border-emerald-100">
                          <span className="text-slate-500">{label}</span>
                          <span className="font-mono font-semibold text-slate-800 text-right max-w-[60%] truncate">{val}</span>
                        </div>
                      ))}
                      <div className="flex justify-between text-sm py-1 col-span-2">
                        <span className="text-slate-500">Status</span>
                        <span className={`font-semibold ${currentCountry.IsActive ? "text-emerald-600" : "text-rose-600"}`}>
                          {currentCountry.IsActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  </div>

                </div>
              </form>

              {/* Bottom action bar */}
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsPanelOpen(false)}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <span className="text-slate-400">←</span> Back
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
                  {isEditing ? "💾 Save Changes" : "➕ Add Country"}
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* DELETE CONFIRMATION POPUP                                   */}
        {/* ========================================================== */}
        {deletePopup.isOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[80] flex items-center justify-center p-4"
            onClick={() => setDeletePopup({ isOpen: false, id: null, name: "" })}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 text-center">
                <div className="mx-auto w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-4 text-red-600 text-3xl">
                  ⚠️
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Record?</h3>
                <p className="text-sm text-slate-500">
                  Are you sure you want to permanently delete <br />
                  <span className="font-semibold text-slate-700">"{deletePopup.name}"</span>?
                </p>
                <p className="text-xs text-rose-500 mt-2 font-medium">This action cannot be undone.</p>
              </div>
              
              <div className="flex border-t border-slate-200">
                <button
                  onClick={() => setDeletePopup({ isOpen: false, id: null, name: "" })}
                  className="flex-1 py-3.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors border-r border-slate-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 py-3.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition-colors"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}