import React, { useState, useEffect, useCallback } from "react";
import { MasterTableService } from "../../lib/services/MasterTableService";

const EMPTY_FORM = {
  ID:          "",
  NSQFLEVEL:   "",
  IsActive:    true,
};

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// ── Helpers ───────────────────────────────────────────────────────────────────

const normalise = (raw) =>
  raw.map((item, i) => ({
    _rowKey:    `row-${i}`,
    ID:          item.ID != null ? Number(item.ID) : null,
    NSQFLEVEL:   item.NSQFLEVEL ?? "",
    IsActive:    item.IsActive === true || item.IsActive === 1 || item.isactive === true || item.isactive === 1,
  }));

// ID is a clean sequential identity column here, so unlike UserType the ID
// field is auto-computed on insert (next available) rather than typed in.
const buildPayload = (form) => {
  return {
    ID:          Number(form.ID),
    NSQFLEVEL:   (form.NSQFLEVEL ?? "").trim(),
    IsActive:    form.IsActive === true || form.IsActive === 1,
  };
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function MasterNSQFLevel() {
  const [items, setItems]                 = useState([]);
  const [loading, setLoading]             = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm]       = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [error, setError]                 = useState(null);
  const [successMsg, setSuccessMsg]       = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize]       = useState(25);

  const [isPanelOpen, setIsPanelOpen]     = useState(false);
  const [isEditing, setIsEditing]         = useState(false);
  const [currentRecord, setCurrentRecord] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors]       = useState({});

  const showSuccess = (msg) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(null), 3000); };
  const showError   = (msg) => { setError(msg);      setTimeout(() => setError(null),      4000); };

  // ── FETCH: NSQF Levels ───────────────────────────────────────────────────
  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await MasterTableService.getAllNSQFLevels();
      const raw  = data?.Data ?? data?.data ?? (Array.isArray(data) ? data : []);
      setItems(normalise(raw));
    } catch (err) {
      showError(err?.response?.data?.Message || err?.message || "Failed to load NSQF level records");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);
  useEffect(() => { setCurrentPage(1); }, [searchTerm, selectedFilter]);

  // ── INSERT ────────────────────────────────────────────────────────────────
  const handleInsert = async (form) => {
    setActionLoading(true);
    try {
      const payload  = buildPayload(form);
      const response = await MasterTableService.insertNSQFLevel(payload);
      showSuccess(response?.Data?.Message || response?.message || "NSQF level added successfully");
      setIsPanelOpen(false);
      await fetchItems();
    } catch (err) {
      showError(err?.response?.data?.Message || err?.message || "Failed to add NSQF level");
    } finally { setActionLoading(false); }
  };

  // ── UPDATE ────────────────────────────────────────────────────────────────
  const handleUpdate = async (form) => {
    setActionLoading(true);
    try {
      const data = await MasterTableService.updateNSQFLevel(buildPayload(form));
      showSuccess(data?.Data?.Message || data?.message || "NSQF level updated successfully");
      setIsPanelOpen(false);
      await fetchItems();
    } catch (err) {
      showError(err?.response?.data?.Message || err?.message || "Failed to update NSQF level");
    } finally { setActionLoading(false); }
  };

  // ── DELETE ────────────────────────────────────────────────────────────────
  const handleDelete = async (item) => {
    if (!window.confirm(`Delete NSQF Level "${item.NSQFLEVEL}" (ID ${item.ID})?`)) return;
    setActionLoading(true);
    try {
      const data = await MasterTableService.softDeleteNSQFLevel(Number(item.ID));
      showSuccess(data?.message || data?.Data?.Message || "NSQF level deleted successfully");
      await fetchItems();
    } catch (err) {
      showError(err?.response?.data?.Message || err?.message || "Failed to delete NSQF level");
    } finally { setActionLoading(false); }
  };

  // ── TOGGLE STATUS ─────────────────────────────────────────────────────────
  const toggleStatusInline = async (item) => {
    const updated = { ...item, IsActive: !item.IsActive };
    setItems((prev) => prev.map((f) => (f._rowKey === item._rowKey ? updated : f)));
    try {
      await MasterTableService.updateNSQFLevel(buildPayload(updated));
      showSuccess(`Status set to ${updated.IsActive ? "Active" : "Inactive"}`);
    } catch (err) {
      setItems((prev) => prev.map((f) => (f._rowKey === item._rowKey ? item : f)));
      showError(err?.response?.data?.Message || err?.message || "Failed to update status");
    }
  };

  // ── FORM SUBMIT ───────────────────────────────────────────────────────────
  const handleFormSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!isEditing && (currentRecord.ID !== "" && currentRecord.ID !== null && Number.isNaN(Number(currentRecord.ID)))) errs.ID = true;
    if (!currentRecord.NSQFLEVEL?.trim()) errs.NSQFLEVEL = true;
    setFormErrors(errs);
    if (Object.keys(errs).length > 0) { showError("Please fill all required fields"); return; }
    isEditing ? handleUpdate(currentRecord) : handleInsert(currentRecord);
  };

  const handleOpenPanel = (record = EMPTY_FORM, editMode = false) => {
    setFormErrors({});
    setCurrentRecord({
      ...EMPTY_FORM,
      ...record,
      IsActive: record.IsActive ?? true,
    });
    setIsEditing(editMode);
    setIsPanelOpen(true);
  };

  const set = (field) => (e) => setCurrentRecord((p) => ({ ...p, [field]: e.target.value }));

  // ── FILTERING ─────────────────────────────────────────────────────────────
  const filteredItems = items.filter((f) => {
    const matchStatus =
      selectedFilter === "All"    ? true :
      selectedFilter === "Active" ? f.IsActive : !f.IsActive;
    const matchSearch = searchTerm
      ? f.NSQFLEVEL.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(f.ID).includes(searchTerm)
      : true;
    return matchStatus && matchSearch;
  });

  const sortedItems = [...filteredItems].sort((a, b) => (a.ID ?? 0) - (b.ID ?? 0));

  // ── PAGINATION ────────────────────────────────────────────────────────────
  const isFilterActive = searchTerm !== "" || selectedFilter !== "All";
  const totalPages     = Math.ceil(sortedItems.length / pageSize);
  const paginatedItems = isFilterActive
    ? sortedItems
    : sortedItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const goToPage = (page) => { if (page >= 1 && page <= totalPages) setCurrentPage(page); };
  const getPageNumbers = () => {
    const arr = [], start = Math.max(1, currentPage - 2), end = Math.min(totalPages, currentPage + 2);
    for (let i = start; i <= end; i++) arr.push(i);
    return arr;
  };

  const stats = {
    Total:    items.length,
    Active:   items.filter((f) =>  f.IsActive).length,
    Inactive: items.filter((f) => !f.IsActive).length,
  };

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased flex flex-col">

      {/* Toasts */}
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
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-bold shadow-md text-white text-sm">
            R
          </div>
          <h1 className="text-sm font-bold tracking-tight text-slate-900">Master NSQF Level</h1>
        </div>
        <button
          onClick={() => handleOpenPanel(EMPTY_FORM, false)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-xl active:scale-95 transition-all shadow-md"
        >
          + Add New Record
        </button>
      </header>

      {isPanelOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setIsPanelOpen(false)} />
      )}

      <div className="flex flex-1 relative overflow-hidden">
        <main className="flex-1 p-6 space-y-5 overflow-y-auto w-full">

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
              <div>
                <p className="text-xs text-slate-500 font-medium">Total Records</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.Total.toLocaleString()}</h3>
              </div>
              <span className="p-2 bg-slate-100 rounded-lg text-xl">📊</span>
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
              <div>
                <p className="text-xs text-emerald-600 font-medium">Active</p>
                <h3 className="text-2xl font-bold text-emerald-600 mt-1">{stats.Active.toLocaleString()}</h3>
              </div>
              <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold">● Live</span>
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
              <div>
                <p className="text-xs text-rose-500 font-medium">Inactive</p>
                <h3 className="text-2xl font-bold text-rose-500 mt-1">{stats.Inactive.toLocaleString()}</h3>
              </div>
              <span className="px-2 py-1 bg-rose-50 text-rose-600 rounded-lg text-xs font-bold">● Off</span>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-sm space-y-3">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="relative w-full md:w-72">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400 text-sm">🔍</span>
                <input
                  type="text"
                  placeholder="Search by level or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
                />
              </div>

              <div className="flex bg-slate-100 p-1 border border-slate-200 rounded-lg w-full md:w-auto md:ml-auto">
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
            {isFilterActive && (
              <div className="flex items-center gap-2 flex-wrap pt-1">
                <span className="text-xs text-slate-400">Filters:</span>
                {selectedFilter !== "All" && (
                  <span className="text-xs text-slate-500">
                    Showing <span className="font-semibold text-indigo-700">{selectedFilter} Records</span>
                  </span>
                )}
                {searchTerm && (
                  <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 text-xs font-medium px-2 py-0.5 rounded-full">
                    "{searchTerm}"
                    <button onClick={() => setSearchTerm("")} className="hover:text-slate-900 font-bold">✕</button>
                  </span>
                )}
                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full">
                    {filteredItems.length} of {items.length} Total
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            {loading ? (
              <div className="p-16 text-center text-sm text-slate-400 tracking-widest animate-pulse">
                LOADING RECORDS...
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                        <th className="py-3 px-4 w-16">ID</th>
                        <th className="py-3 px-4">NSQF Level</th>
                        <th className="py-3 px-4 w-28">Status</th>
                        <th className="py-3 px-4 text-right w-36">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {paginatedItems.map((item) => (
                        <tr key={item._rowKey} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-4 font-mono text-slate-500 font-medium">{item.ID}</td>
                          <td className="py-3 px-4 text-slate-800 font-medium font-mono">{item.NSQFLEVEL || "—"}</td>
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
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenPanel(item, true)}
                                className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-white bg-indigo-50 hover:bg-indigo-600 border border-indigo-200 hover:border-indigo-600 px-3 py-1.5 rounded-lg transition-all text-xs font-medium"
                              >
                                ✏️ Edit
                              </button>
                              <button
                                onClick={() => handleDelete(item)}
                                disabled={actionLoading}
                                className="inline-flex items-center gap-1.5 text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 hover:border-rose-600 px-3 py-1.5 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium"
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {paginatedItems.length === 0 && (
                        <tr>
                          <td colSpan="4" className="py-12 text-center text-slate-400 text-sm">
                            No NSQF level records found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {sortedItems.length > 0 && !isFilterActive && (
                  <div className="px-4 py-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>
                        Showing{" "}
                        <span className="font-semibold text-slate-700">
                          {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, sortedItems.length)}
                        </span>{" "}
                        of{" "}
                        <span className="font-semibold text-slate-700">{sortedItems.length}</span>
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
                        <button key={`page-${page}`} onClick={() => goToPage(page)}
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

        {/* ── Flyout Drawer ── */}
        <div className={`fixed inset-y-0 right-0 w-full max-w-md bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${isPanelOpen ? "translate-x-0" : "translate-x-full"}`}>

          <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white shrink-0">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isEditing ? "✏️ Edit NSQF Level" : "✨ Add New NSQF Level"}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isEditing ? "Update the record below" : "Fill in the fields to create a new record"}
              </p>
            </div>
            <button
              onClick={() => setIsPanelOpen(false)}
              className="text-slate-400 hover:text-slate-600 text-xl p-2 hover:bg-slate-100 rounded-lg transition-all"
            >✕</button>
          </div>

          <form onSubmit={handleFormSubmit} className="p-6 flex-1 space-y-5 overflow-y-auto">

            {/* ID – shown read-only on edit; blank/auto on insert since the table is a
                clean sequential identity (1,2,3...17). */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                ID
              </label>
              <input
                type="text"
                value={isEditing ? currentRecord.ID : (currentRecord.ID || "auto-assigned")}
                disabled
                className="w-full px-3 py-2.5 border rounded-lg text-sm font-mono bg-slate-50 text-slate-400 cursor-not-allowed border-slate-200"
              />
            </div>

            {/* NSQF Level */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                NSQF Level <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={currentRecord.NSQFLEVEL}
                onChange={set("NSQFLEVEL")}
                placeholder="e.g., 4.5 or NA"
                className={`w-full px-3 py-2.5 border rounded-lg text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-300 ${
                  formErrors.NSQFLEVEL ? "border-rose-400" : "border-slate-200 focus:border-indigo-500"
                }`}
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Stored as text — supports values like "NA" as well as numeric levels.
              </p>
            </div>

            {/* Toggle: IsActive */}
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-semibold text-slate-800 block select-none">Status</label>
                  <span className="text-xs text-slate-500 block mt-0.5">
                    {currentRecord.IsActive ? "Record is active and available" : "Record is disabled"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentRecord((p) => ({ ...p, IsActive: !p.IsActive }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shrink-0 ${
                    currentRecord.IsActive ? "bg-indigo-600" : "bg-slate-300"
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    currentRecord.IsActive ? "translate-x-6" : "translate-x-1"
                  }`} />
                </button>
              </div>
              <div className="pt-1">
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
              <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-3">
                👁️ Record Preview
              </p>
              <div className="space-y-0">
                {[
                  ["ID",    currentRecord.ID !== "" && currentRecord.ID != null ? `#${currentRecord.ID}` : "auto"],
                  ["Level", currentRecord.NSQFLEVEL || "—"],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between text-sm py-1.5 border-b border-indigo-100 last:border-0">
                    <span className="text-slate-500 shrink-0">{label}</span>
                    <span className="font-mono font-semibold text-slate-800 text-right ml-2 truncate max-w-[200px]">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex gap-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsPanelOpen(false)}
                disabled={actionLoading}
                className="flex-1 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
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

          </form>
        </div>
      </div>
    </div>
  );
}