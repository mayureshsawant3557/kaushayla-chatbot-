import React, { useState, useEffect, useCallback, useMemo } from "react";
import { MasterTableService } from "../../lib/services/MasterTableService";

const EMPTY_FORM = {
  ID:            null,
  VCApplication: "",
  IsActive:      true,
};

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// ── helpers ──────────────────────────────────────────────────────────────────
const buildPayload = (form) => ({
  VCApplication: (form.VCApplication ?? "").trim(),
  IsActive:      form.IsActive === true || form.IsActive === 1,
});

export default function MasterVCApplication() {
  const [vcApps, setVcApps]                 = useState([]);
  const [loading, setLoading]               = useState(false);
  const [actionLoading, setActionLoading]   = useState(false);
  const [searchTerm, setSearchTerm]         = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [error, setError]                   = useState(null);
  const [successMsg, setSuccessMsg]         = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize]       = useState(25);

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isEditing, setIsEditing]     = useState(false);
  const [currentRecord, setCurrentRecord] = useState(EMPTY_FORM);

  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem("userInfoAll"));
    if (!user || Number(user.UserTypeID) !== 11) {
      window.location.href = "http://localhost:5173/react";
    }
  }, []);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };
  const showError = (msg) => {
    setError(msg);
    setTimeout(() => setError(null), 4000);
  };

  // ── FETCH ─────────────────────────────────────────────────────────────────
  const fetchVCApps = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await MasterTableService.getAllVCApplications();
      const raw = data?.Data ?? data?.data ?? (Array.isArray(data) ? data : []);
      setVcApps(
        raw
          .filter((item) => item.ID != null && Number(item.ID) > 0)
          .map((item) => ({
            ID:            Number(item.ID),
            VCApplication: item.VCApplication ?? "",
            IsActive:      item.IsActive === true || item.IsActive === 1,
          }))
      );
    } catch (err) {
      showError(
        err?.response?.data?.Message ||
        err?.response?.data?.message ||
        "Failed to load VC applications"
      );
      setVcApps([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchVCApps(); }, [fetchVCApps]);
  useEffect(() => { setCurrentPage(1); }, [searchTerm, selectedFilter]);

  // ── INSERT ────────────────────────────────────────────────────────────────
  const handleInsert = async (form) => {
    setActionLoading(true);
    try {
      const payload = buildPayload(form);
      const response = await MasterTableService.insertVCApplication(payload);
      showSuccess(
        response?.Data?.Message ||
        response?.message ||
        response?.data?.message ||
        "VC Application added successfully"
      );
      setIsPanelOpen(false);
      await fetchVCApps();
    } catch (err) {
      showError(
        err?.response?.data?.Message ||
        err?.response?.data?.message ||
        err.message ||
        "Failed to add VC application"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ── UPDATE ────────────────────────────────────────────────────────────────
  const handleUpdate = async (form) => {
    setActionLoading(true);
    try {
      const payload = buildPayload(form);
      payload.ID = Number(form.ID);
      const data = await MasterTableService.updateVCApplication(payload);
      showSuccess(
        data?.Data?.Message ||
        data?.message ||
        data?.data?.message ||
        "VC Application updated successfully"
      );
      setIsPanelOpen(false);
      await fetchVCApps();
    } catch (err) {
      showError(
        err?.response?.data?.Message ||
        err?.response?.data?.message ||
        err.message ||
        "Failed to update VC application"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ── DELETE ────────────────────────────────────────────────────────────────
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    setActionLoading(true);
    try {
      const data = await MasterTableService.softDeleteVCApplication(id);
      showSuccess(data?.message || data?.Data?.Message || "VC Application deleted successfully");
      await fetchVCApps();
    } catch (err) {
      showError(
        err?.response?.data?.Message ||
        err?.response?.data?.message ||
        "Failed to delete VC application"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ── TOGGLE STATUS ─────────────────────────────────────────────────────────
  const toggleStatusInline = async (item) => {
    const updated = { ...item, IsActive: !item.IsActive };
    setVcApps((prev) =>
      prev.map((f) => (f.ID === item.ID ? updated : f))
    );
    try {
      const payload = buildPayload(updated);
      payload.ID = Number(item.ID);
      await MasterTableService.updateVCApplication(payload);
      showSuccess(`Status updated to ${updated.IsActive ? "Active" : "Inactive"}`);
    } catch (err) {
      setVcApps((prev) =>
        prev.map((f) => (f.ID === item.ID ? item : f))
      );
      showError(
        err?.response?.data?.Message ||
        err?.response?.data?.message ||
        "Failed to update status"
      );
    }
  };

  // ── FORM SUBMIT ───────────────────────────────────────────────────────────
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!currentRecord.VCApplication?.trim()) {
      showError("VC Application name is required");
      return;
    }
    isEditing ? handleUpdate(currentRecord) : handleInsert(currentRecord);
  };

  const handleOpenPanel = (record = EMPTY_FORM, editMode = false) => {
    setCurrentRecord({
      ...record,
      ID:        editMode ? record.ID : null,
      IsActive:  record.IsActive ?? true,
    });
    setIsEditing(editMode);
    setIsPanelOpen(true);
  };

  // ── FILTERING ─────────────────────────────────────────────────────────────
  const filteredVCApps = vcApps.filter((f) => {
    const matchStatus =
      selectedFilter === "All"    ? true :
      selectedFilter === "Active" ? f.IsActive : !f.IsActive;

    const term = searchTerm.trim().toLowerCase();
    const matchSearch = term
      ? [
          f.ID,
          f.VCApplication,
          f.IsActive ? "active" : "inactive",
        ]
          .filter((v) => v !== null && v !== undefined)
          .some((v) => String(v).toLowerCase().includes(term))
      : true;

    return matchStatus && matchSearch;
  });

  // ── PAGINATION ────────────────────────────────────────────────────────────
  const isFilterActive = searchTerm !== "" || selectedFilter !== "All";
  const totalPages     = Math.ceil(filteredVCApps.length / pageSize);
  const paginatedVCApps = isFilterActive
    ? filteredVCApps
    : filteredVCApps.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const getPageNumbers = () => {
    const pages = [];
    const start = Math.max(1, currentPage - 2);
    const end   = Math.min(totalPages, currentPage + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const stats = {
    TotalCount:    vcApps.length,
    ActiveCount:   vcApps.filter((f) => f.IsActive).length,
    InactiveCount: vcApps.filter((f) => !f.IsActive).length,
  };

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
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
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-bold shadow-md text-white">
            V
          </div>
          <h1 className="text-md font-bold tracking-tight text-slate-900">Master VC Application</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => window.history.back()}
            title="Back"
            className="group flex items-center gap-2 pl-2 pr-4 py-2 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 text-xs font-semibold rounded-full transition-all shadow-sm hover:shadow-md active:scale-95"
          >
            <span className="h-6 w-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                <path d="M19 12H5" />
                <path d="M12 19l-7-7 7-7" />
              </svg>
            </span>
            Back
          </button>

          <button
            type="button"
            onClick={() => { window.location.href = "http://localhost:5173/react"; }}
            title="Close"
            className="group flex items-center gap-2 pl-2 pr-4 py-2 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-slate-700 text-xs font-semibold rounded-full transition-all shadow-sm hover:shadow-md active:scale-95"
          >
            <span className="h-6 w-6 flex items-center justify-center rounded-full bg-rose-100 text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                <path d="M18 6L6 18" />
                <path d="M6 6l12 12" />
              </svg>
            </span>
            Close
          </button>

          <button
            onClick={() => handleOpenPanel(EMPTY_FORM, false)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-xl active:scale-95 transition-all shadow-md"
          >
            + Add New Record
          </button>
        </div>
      </header>

      <div className="flex flex-1 relative overflow-hidden">
        <main className="flex-1 p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full">

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
              <div>
                <p className="text-xs text-slate-500 font-medium">Total VC Applications</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.TotalCount.toLocaleString()}</h3>
              </div>
              <span className="p-2 bg-slate-100 rounded-lg text-xl">💻</span>
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
              <div>
                <p className="text-xs text-emerald-600 font-medium">Active</p>
                <h3 className="text-2xl font-bold text-emerald-600 mt-1">{stats.ActiveCount.toLocaleString()}</h3>
              </div>
              <span className="p-2 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold">● Live</span>
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
              <div>
                <p className="text-xs text-rose-600 font-medium">Inactive</p>
                <h3 className="text-2xl font-bold text-rose-600 mt-1">{stats.InactiveCount.toLocaleString()}</h3>
              </div>
              <span className="p-2 bg-rose-50 text-rose-700 rounded-lg text-xs font-bold">○ Down</span>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="relative w-full md:w-72">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400 text-sm">🔍</span>
                <input
                  type="text"
                  placeholder="Search by ID or application name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
                />
              </div>
              <div className="flex bg-slate-100 p-1 border border-slate-200 rounded-lg w-full md:w-auto ml-auto">
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

            {(searchTerm || selectedFilter !== "All") && (
              <div className="flex items-center gap-2 flex-wrap pt-1">
                <span className="text-xs text-slate-400">Filters:</span>
                {selectedFilter !== "All" && (
                  <span className="text-xs text-slate-500">
                    Showing{" "}
                    <span className="font-semibold text-indigo-700">
                      {selectedFilter === "Active" ? "Active Records" : "Inactive Records"}
                    </span>
                  </span>
                )}
                {searchTerm && (
                  <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 text-xs font-medium px-2 py-0.5 rounded-full">
                    "{searchTerm}"
                    <button onClick={() => setSearchTerm("")} className="hover:text-slate-900 font-bold">✕</button>
                  </span>
                )}
                <div className="flex items-center gap-2 ml-auto">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
                    {filteredVCApps.filter((f) => f.IsActive).length} Active
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500 inline-block" />
                    {filteredVCApps.filter((f) => !f.IsActive).length} Inactive
                  </span>
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full">
                    {filteredVCApps.length} of {vcApps.length} Total
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            {loading ? (
              <div className="p-16 text-center text-sm text-slate-400 tracking-widest animate-pulse">
                LOADING RECORDS...
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                        <th className="py-3 px-4">ID</th>
                        <th className="py-3 px-4">VC Application</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {paginatedVCApps.map((item) => (
                        <tr key={item.ID} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="py-3 px-4 font-mono text-slate-600 font-medium">{item.ID}</td>
                          <td className="py-3 px-4 text-slate-800 font-medium">{item.VCApplication}</td>
                          <td className="py-3 px-4">
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
                          </td>
                          <td className="py-3 px-4 text-right space-x-2">
                            <button
                              onClick={() => handleOpenPanel(item, true)}
                              className="text-indigo-600 hover:text-white bg-indigo-50 hover:bg-indigo-600 px-3 py-1.5 rounded-lg transition-all text-xs font-medium"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => handleDelete(item.ID, item.VCApplication)}
                              disabled={actionLoading}
                              className="text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50 text-xs font-medium"
                            >
                              🗑️ Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                      {paginatedVCApps.length === 0 && (
                        <tr>
                          <td colSpan="4" className="py-12 text-center text-slate-400 text-sm">
                            No VC application records found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {filteredVCApps.length > 0 && !isFilterActive && (
                  <div className="px-4 py-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>
                        Showing{" "}
                        <span className="font-semibold text-slate-700">
                          {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredVCApps.length)}
                        </span>{" "}
                        of{" "}
                        <span className="font-semibold text-slate-700">{filteredVCApps.length}</span>
                      </span>
                      <select
                        value={pageSize}
                        onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                        className="border border-slate-200 rounded-lg px-2 py-1 text-xs bg-white focus:outline-none focus:border-indigo-400"
                      >
                        {PAGE_SIZE_OPTIONS.map((s) => (
                          <option key={s} value={s}>{s} / page</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => goToPage(1)} disabled={currentPage === 1}
                        className="px-2 py-1 text-xs rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed">«</button>
                      <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}
                        className="px-2 py-1 text-xs rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed">‹</button>
                      {getPageNumbers().map((page) => (
                        <button key={page} onClick={() => goToPage(page)}
                          className={`px-3 py-1 text-xs rounded-lg border font-medium transition-all ${
                            page === currentPage
                              ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                              : "border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}>
                          {page}
                        </button>
                      ))}
                      <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}
                        className="px-2 py-1 text-xs rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed">›</button>
                      <button onClick={() => goToPage(totalPages)} disabled={currentPage === totalPages}
                        className="px-2 py-1 text-xs rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed">»</button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>

        {/* Fullscreen Square Modal (matches MasterAcademicYear popup UI) */}
        {isPanelOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4 sm:p-8"
            onClick={() => setIsPanelOpen(false)}
          >
            <div
              className="bg-white border border-slate-200 shadow-2xl rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >

              <div className="p-5 border-b border-slate-200 flex items-center justify-between shrink-0" style={{ backgroundColor: "#7C5CFC" }}>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {isEditing ? "✏️ Edit VC Application" : "✨ Add New VC Application"}
                  </h3>
                  <p className="text-xs text-indigo-100 mt-0.5">
                    {isEditing ? "Update the record below" : "Fill in all fields to create a new record"}
                  </p>
                </div>
                <button
                  onClick={() => setIsPanelOpen(false)}
                  className="text-white/80 hover:text-white text-xl p-2 hover:bg-white/20 rounded-lg transition-all"
                >✕</button>
              </div>

              <form onSubmit={handleFormSubmit} className="p-6 flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 gap-4">

                  {/* ID – IDENTITY column, DB-generated */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      ID{" "}
                      {isEditing
                        ? <span className="text-slate-400 font-normal normal-case">(Read-only)</span>
                        : <span className="inline-flex items-center gap-1 text-indigo-600 font-normal normal-case bg-indigo-50 px-2 py-0.5 rounded-full text-[10px]">⚡ Auto (DB Identity)</span>}
                    </label>
                    <input
                      type="text"
                      value={isEditing ? (currentRecord.ID ?? "") : "Auto"}
                      disabled
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-mono bg-slate-50 text-slate-400 cursor-not-allowed focus:outline-none"
                    />
                  </div>

                  {/* VC Application Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      VC Application <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={currentRecord.VCApplication}
                      onChange={(e) => setCurrentRecord({ ...currentRecord, VCApplication: e.target.value })}
                      placeholder="e.g., Microsoft Teams"
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-300"
                    />
                  </div>

                  {/* IsActive Toggle */}
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-semibold text-slate-800 block select-none">Status</label>
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                          {currentRecord.IsActive ? "Application is active and available" : "Application is disabled"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCurrentRecord({ ...currentRecord, IsActive: !currentRecord.IsActive })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shrink-0 ${
                          currentRecord.IsActive ? "bg-indigo-600" : "bg-slate-300"
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                          currentRecord.IsActive ? "translate-x-6" : "translate-x-1"
                        }`} />
                      </button>
                    </div>
                    <div className="mt-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 ${
                        currentRecord.IsActive ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${currentRecord.IsActive ? "bg-emerald-500" : "bg-rose-500"}`} />
                        {currentRecord.IsActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>

                  {/* Record Preview */}
                  <div className="bg-gradient-to-br from-sky-50 to-indigo-100/50 border border-indigo-200 rounded-xl p-4">
                    <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <span>👁️</span> Record Preview
                    </p>
                    <div className="space-y-0">
                      {[
                        ["ID",            isEditing ? (currentRecord.ID != null ? `#${currentRecord.ID}` : "—") : "#Auto"],
                        ["VC Application", currentRecord.VCApplication || "—"],
                      ].map(([label, val]) => (
                        <div key={label} className="flex justify-between text-sm py-1.5 border-b border-indigo-100 last:border-0">
                          <span className="text-slate-500 shrink-0">{label}</span>
                          <span className="font-mono font-semibold text-slate-800 text-right ml-2 truncate max-w-[200px]">{val}</span>
                        </div>
                      ))}
                      <div className="flex justify-between text-sm py-1.5">
                        <span className="text-slate-500">Status</span>
                        <span className={`font-semibold ${currentRecord.IsActive ? "text-emerald-600" : "text-rose-600"}`}>
                          {currentRecord.IsActive ? "Active" : "Inactive"}
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
                  className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-md transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {actionLoading && (
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  )}
                  {isEditing ? "💾 Save Changes" : "➕ Add Record"}
                </button>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}