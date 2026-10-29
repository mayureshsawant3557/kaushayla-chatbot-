import React, { useState, useEffect, useCallback, useContext } from "react";
import { MasterTableService } from "../../lib/services/MasterTableService";
import FilteredTableComponent from "../../Component/formcomponent/FilteredTableComponent";
import { ThemeContext } from "../../Component/Context/ThemeContext";

const EMPTY_FORM = {
  PageId:          "",
  PageName:        "",
  PageUrl:         "",
  IsActive:        true,
  PageGrop:        "",
  PageCode:        "",
  BGColur:         "",
  AnchorTagTarget: "_self",
  ReactPageUrl:    "",
};

const ANCHOR_TARGET_OPTIONS = ["_self", "_blank", "_parent", "_top"];

// ── helpers ──────────────────────────────────────────────────────────────────
const buildPayload = (form) => ({
  PageId:          Number(form.PageId),
  PageName:        (form.PageName        ?? "").trim(),
  PageUrl:         (form.PageUrl         ?? "").trim() || null,
  IsActive:        form.IsActive === true || form.IsActive === 1,
  PageGrop:        form.PageGrop !== "" && form.PageGrop != null && form.PageGrop !== 0
                     ? Number(form.PageGrop)
                     : null,
  PageCode:        (form.PageCode        ?? "").trim() || null,
  BGColur:         (form.BGColur         ?? "").trim() || null,
  AnchorTagTarget: (form.AnchorTagTarget ?? "").trim() || null,
  ReactPageUrl:    (form.ReactPageUrl    ?? "").trim() || null,
});

// Derive a readable swatch from BGColur; return null if invalid
const isValidHex = (val) => /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test((val ?? "").trim());

// Next Page ID = (max existing PageId) + 1, or 1 if the table is empty.
// NOTE: this is computed client-side from already-loaded records. If two
// admins can add a record at the same time, both could compute the same
// next ID. Guard against that with a UNIQUE constraint on PageId in SQL
// Server (so a collision fails loudly), or better, move to a server-side
// "next id" endpoint / IDENTITY column if concurrent admin usage is a
// realistic scenario for this screen.
const getNextPageId = (list) =>
  list.length ? Math.max(...list.map((p) => Number(p.PageId) || 0)) + 1 : 1;

// ── small inline icons (kept dependency-free, consistent with Back/Close icons) ─
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

export default function MasterAffiliationPages() {
  const { color } = useContext(ThemeContext); // e.g. "bg-[#002060]" — drives the P avatar below

  const [pages, setPages]                 = useState([]);
  const [loading, setLoading]             = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm]       = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [error, setError]                 = useState(null);
  const [successMsg, setSuccessMsg]       = useState(null);

  const [isPanelOpen, setIsPanelOpen]     = useState(false);
  const [isEditing, setIsEditing]         = useState(false);
  const [currentRecord, setCurrentRecord] = useState(EMPTY_FORM);

  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem("userInfoAll"));
    if (!user || Number(user.UserTypeID) !== 11) {
      window.location.href = "http://localhost:5173/react";
    }
  }, []);

  const showSuccess = (msg) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(null), 3000); };
  const showError   = (msg) => { setError(msg);      setTimeout(() => setError(null),      4000); };

  // ── FETCH ─────────────────────────────────────────────────────────────────
  const fetchPages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await MasterTableService.getAllAffiliationPages();
      const raw  = data?.Data ?? data?.data ?? (Array.isArray(data) ? data : []);
      setPages(
        raw
          .filter((item) => Number(item.PageId ?? -2) > -1)
          .map((item) => ({
            PageId:          Number(item.PageId),
            PageName:        item.PageName        ?? "",
            PageUrl:         item.PageUrl         ?? "",
            IsActive:        item.IsActive === true || item.IsActive === 1,
            PageGrop:        item.PageGrop        ?? "",
            PageCode:        item.PageCode        ?? "",
            BGColur:         item.BGColur         ?? "",
            AnchorTagTarget: item.AnchorTagTarget ?? "_self",
            ReactPageUrl:    item.ReactPageUrl    ?? "",
          })),
      );
    } catch (err) {
      showError(
        err?.response?.data?.Message ||
        err?.response?.data?.message ||
        "Failed to load affiliation pages",
      );
      setPages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPages(); }, [fetchPages]);

  // ── INSERT ────────────────────────────────────────────────────────────────
  const handleInsert = async (form) => {
    setActionLoading(true);
    try {
      const response = await MasterTableService.insertAffiliationPage(buildPayload(form));
      showSuccess(response?.Data?.Message || response?.message || response?.data?.message || "Page added successfully");
      setIsPanelOpen(false);
      await fetchPages();
    } catch (err) {
      showError(err?.response?.data?.Message || err?.response?.data?.message || err.message || "Failed to add page");
    } finally { setActionLoading(false); }
  };

  // ── UPDATE ────────────────────────────────────────────────────────────────
  const handleUpdate = async (form) => {
    setActionLoading(true);
    try {
      const data = await MasterTableService.updateAffiliationPage(buildPayload(form));
      showSuccess(data?.Data?.Message || data?.message || data?.data?.message || "Page updated successfully");
      setIsPanelOpen(false);
      await fetchPages();
    } catch (err) {
      showError(err?.response?.data?.Message || err?.response?.data?.message || err.message || "Failed to update page");
    } finally { setActionLoading(false); }
  };

  // ── DELETE ────────────────────────────────────────────────────────────────
  const handleDelete = async (pageId, pageName) => {
    if (!window.confirm(`Are you sure you want to delete "${pageName}"?`)) return;
    setActionLoading(true);
    try {
      const data = await MasterTableService.softDeleteAffiliationPage(Number(pageId));
      showSuccess(data?.message || data?.Data?.Message || "Page deleted successfully");
      await fetchPages();
    } catch (err) {
      showError(err?.response?.data?.Message || err?.response?.data?.message || "Failed to delete page");
    } finally { setActionLoading(false); }
  };

  // ── TOGGLE STATUS ─────────────────────────────────────────────────────────
  const toggleStatusInline = async (item) => {
    const updated = { ...item, IsActive: !item.IsActive };
    setPages((prev) => prev.map((p) => (p.PageId === item.PageId ? updated : p)));
    try {
      await MasterTableService.updateAffiliationPage(buildPayload(updated));
      showSuccess(`Status set to ${updated.IsActive ? "Active" : "Inactive"}`);
    } catch (err) {
      setPages((prev) => prev.map((p) => (p.PageId === item.PageId ? item : p)));
      showError(err?.response?.data?.Message || err?.response?.data?.message || "Failed to update status");
    }
  };

  // ── FORM SUBMIT ───────────────────────────────────────────────────────────
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!currentRecord.PageName?.trim()) { showError("Page Name is required"); return; }
    isEditing ? handleUpdate(currentRecord) : handleInsert(currentRecord);
  };

  // Page ID is always auto-generated / read-only now:
  // - Add mode: computed as (max existing PageId) + 1
  // - Edit mode: kept as the existing record's PageId (still read-only)
  const handleOpenPanel = (record = EMPTY_FORM, editMode = false) => {
    const initial = editMode
      ? { ...record, IsActive: record.IsActive ?? true }
      : { ...EMPTY_FORM, PageId: getNextPageId(pages), IsActive: true };
    setCurrentRecord(initial);
    setIsEditing(editMode);
    setIsPanelOpen(true);
  };

  const set = (field) => (e) => setCurrentRecord((p) => ({ ...p, [field]: e.target.value }));

  // ── STATUS TAB + SEARCH FILTER (sort/pagination/export handled inside FilteredTableComponent) ──
  const statusFilteredPages = pages
    .filter((p) => {
      if (selectedFilter === "Active") return p.IsActive;
      if (selectedFilter === "Inactive") return !p.IsActive;
      return true;
    })
    .filter((p) => {
      if (!searchTerm.trim()) return true;
      const term = searchTerm.trim().toLowerCase();
      return [
        p.PageId,
        p.PageName,
        p.PageCode,
        p.PageGrop !== "" && p.PageGrop != null ? `Group ${p.PageGrop}` : "",
        p.BGColur,
        p.PageUrl,
        p.ReactPageUrl,
        p.AnchorTagTarget,
        p.IsActive ? "active" : "inactive",
      ]
        .filter((v) => v !== null && v !== undefined && v !== "")
        .some((v) => String(v).toLowerCase().includes(term));
    });

  const stats = {
    TotalCount:    pages.length,
    ActiveCount:   pages.filter((p) =>  p.IsActive).length,
    InactiveCount: pages.filter((p) => !p.IsActive).length,
  };

  // ── TABLE COLUMNS FOR FilteredTableComponent ──────────────────────────────
  const columns = [
    { key: "PageId", header: "Page ID", width: "90px", headerClassName: "text-center", className: "text-center font-mono" },
    { key: "PageName", header: "Page Name", className: "font-medium" },
    { key: "PageCode", header: "Page Code", className: "font-mono text-xs" },
    { key: "PageGrop", header: "Group", sortable: false },
    { key: "BGColur", header: "BG Color", sortable: false },
    { key: "PageUrl", header: "Page URL", sortable: false },
    { key: "ReactPageUrl", header: "React URL", sortable: false },
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

  const renderPageCell = (item, column) => {
    switch (column.key) {
      case "PageGrop":
        return item.PageGrop !== "" && item.PageGrop != null ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 border border-indigo-200 text-indigo-700">
            Group {item.PageGrop}
          </span>
        ) : "—";

      case "BGColur":
        return item.BGColur && isValidHex(item.BGColur) ? (
          <div className="flex items-center gap-2">
            <span className="h-5 w-5 rounded border border-slate-200 shadow-sm shrink-0" style={{ backgroundColor: item.BGColur }} />
            <span className="font-mono text-xs text-slate-500">{item.BGColur}</span>
          </div>
        ) : (
          <span className="text-slate-400 text-xs">{item.BGColur || "—"}</span>
        );

      case "PageUrl":
        return (
          <span className="text-slate-500 text-xs max-w-[160px] truncate block" title={item.PageUrl}>
            {item.PageUrl || "—"}
          </span>
        );

      case "ReactPageUrl":
        return (
          <span className="text-slate-500 text-xs max-w-[160px] truncate block" title={item.ReactPageUrl}>
            {item.ReactPageUrl || "—"}
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
              aria-label={`Edit ${item.PageName}`}
              className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white transition-all active:scale-95"
            >
              <EditIcon />
            </button>
            <button
              type="button"
              onClick={() => handleDelete(item.PageId, item.PageName)}
              disabled={actionLoading}
              title="Delete"
              aria-label={`Delete ${item.PageName}`}
              className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white transition-all active:scale-95 disabled:opacity-50"
            >
              <TrashIcon />
            </button>
          </span>
        );

      default:
        return undefined; // fall through to default value rendering
    }
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
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-70 px-6 py-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className={`h-9 w-9 rounded-xl ${color} flex items-center justify-center font-bold shadow-md text-white`}>
            P
          </div>
          <h1 className="text-md font-bold tracking-tight text-slate-900">Master Affiliation Pages</h1>
        </div>
      </header>

      <div className="flex flex-1 relative overflow-hidden">
        <main className="flex-1 p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
              <div>
                <p className="text-xs text-slate-500 font-medium">Total Pages</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.TotalCount.toLocaleString()}</h3>
              </div>
              <span className="p-2 bg-slate-100 rounded-lg text-xl">🗂️</span>
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
              <div>
                <p className="text-xs text-emerald-600 font-medium">Active Pages</p>
                <h3 className="text-2xl font-bold text-emerald-600 mt-1">{stats.ActiveCount.toLocaleString()}</h3>
              </div>
              <span className="p-2 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold">● Live</span>
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
              <div>
                <p className="text-xs text-rose-600 font-medium">Inactive Pages</p>
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

          {/* Toolbar — search + Add New Record */}
          <div className="flex items-center gap-3">
            <div className="flex-1 flex justify-center">
              {/* <div className="relative w-full max-w-sm">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400 text-sm">🔍</span>
                <input
                  type="text"
                  placeholder="Search by name, code, URL, group, color, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
                />
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
            data={statusFilteredPages}
            columns={columns}
            renderCell={renderPageCell}
            loading={loading}
            tableId="affiliation-pages-table"
            emptyStateMessage="No affiliation page records found"
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
                    {isEditing ? "✏️ Edit Affiliation Page" : "✨ Add New Affiliation Page"}
                  </h3>
                  <p className="text-xs text-indigo-100 mt-0.5">
                    {isEditing ? "Update the page record below" : "Fill in the fields to create a new page"}
                  </p>
                </div>
                <button
                  onClick={() => setIsPanelOpen(false)}
                  className="text-white/80 hover:text-white text-xl p-2 hover:bg-white/20 rounded-lg transition-all"
                >✕</button>
              </div>

              <form onSubmit={handleFormSubmit} className="p-6 flex-1 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">

                  {/* Page ID — always auto-generated / read-only */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      Page ID <span className="text-slate-400 font-normal">(Auto-generated)</span>
                    </label>
                    <input
                      type="number"
                      required
                      value={currentRecord.PageId}
                      disabled
                      placeholder="Auto"
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-mono bg-slate-50 text-slate-500 cursor-not-allowed"
                    />
                  </div>

                  {/* Page Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      Page Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={currentRecord.PageName}
                      onChange={set("PageName")}
                      placeholder="e.g., Registration Fee"
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-300"
                    />
                  </div>

                  {/* Page Code */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      Page Code
                    </label>
                    <input
                      type="text"
                      value={currentRecord.PageCode}
                      onChange={set("PageCode")}
                      placeholder="e.g., InstitutePayment"
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-mono text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-300"
                    />
                  </div>

                  {/* Page Group */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      Page Group
                    </label>
                    <input
                      type="number"
                      value={currentRecord.PageGrop}
                      onChange={set("PageGrop")}
                      placeholder="e.g., 1"
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-mono text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-300"
                    />
                  </div>

                  {/* BG Color */}
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      BG Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={isValidHex(currentRecord.BGColur) ? currentRecord.BGColur : "#ffffff"}
                        onChange={(e) => setCurrentRecord((p) => ({ ...p, BGColur: e.target.value }))}
                        className="h-10 w-12 rounded-lg border border-slate-200 cursor-pointer p-0.5 bg-white shrink-0"
                      />
                      <input
                        type="text"
                        value={currentRecord.BGColur}
                        onChange={set("BGColur")}
                        placeholder="#fef3cd"
                        maxLength={7}
                        className="flex-1 px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-mono text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-300"
                      />
                      {isValidHex(currentRecord.BGColur) ? (
                        <div
                          className="h-10 w-10 rounded-lg border border-slate-200 shadow-sm shrink-0"
                          style={{ backgroundColor: currentRecord.BGColur }}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-lg border border-dashed border-slate-300 bg-slate-50 shrink-0 flex items-center justify-center text-slate-300 text-xs">?</div>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Enter a valid hex color (e.g. #fef3cd)</p>
                  </div>

                  {/* Page URL */}
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      Page URL
                    </label>
                    <input
                      type="text"
                      value={currentRecord.PageUrl}
                      onChange={set("PageUrl")}
                      placeholder="../Institute/InstitutePayment.aspx"
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-mono text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-300"
                    />
                  </div>

                  {/* React Page URL */}
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      React Page URL
                    </label>
                    <input
                      type="text"
                      value={currentRecord.ReactPageUrl}
                      onChange={set("ReactPageUrl")}
                      placeholder="/React/Institute/InstitutePayment"
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-mono text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-300"
                    />
                  </div>

                  {/* Anchor Tag Target */}
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      Anchor Tag Target
                    </label>
                    <select
                      value={currentRecord.AnchorTagTarget}
                      onChange={set("AnchorTagTarget")}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                    >
                      {ANCHOR_TARGET_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  {/* IsActive Toggle */}
                  <div className="col-span-2 bg-slate-50 border border-slate-200 p-3 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-semibold text-slate-800 block select-none">Status</label>
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                          {currentRecord.IsActive ? "Page is active and visible" : "Page is disabled and hidden"}
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
                  </div>

                  {/* Record Preview */}
                  <div className="col-span-2 bg-gradient-to-br from-indigo-50 to-blue-100/50 border border-indigo-200 rounded-xl p-4">
                    <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <span>👁️</span> Record Preview
                    </p>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                      {[
                        ["Page ID",   currentRecord.PageId ? `#${currentRecord.PageId}` : "—"],
                        ["Page Name", currentRecord.PageName    || "—"],
                        ["Page Code", currentRecord.PageCode    || "—"],
                        ["Group",     currentRecord.PageGrop !== "" ? `Group ${currentRecord.PageGrop}` : "—"],
                        ["React URL", currentRecord.ReactPageUrl || "—"],
                      ].map(([label, val]) => (
                        <div key={label} className="flex justify-between text-sm py-1 border-b border-indigo-100">
                          <span className="text-slate-500">{label}</span>
                          <span className="font-mono font-semibold text-slate-800 text-right max-w-[60%] truncate" title={String(val)}>{val}</span>
                        </div>
                      ))}
                      <div className="flex justify-between text-sm py-1 items-center">
                        <span className="text-slate-500">BG Color</span>
                        <div className="flex items-center gap-2">
                          {isValidHex(currentRecord.BGColur) && (
                            <span className="h-4 w-4 rounded border border-indigo-100" style={{ backgroundColor: currentRecord.BGColur }} />
                          )}
                          <span className="font-mono font-semibold text-slate-800">{currentRecord.BGColur || "—"}</span>
                        </div>
                      </div>
                      <div className="flex justify-between text-sm py-1 col-span-2">
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
                  className={`flex-1 px-4 py-2.5 text-sm font-bold rounded-xl shadow-md transition-all disabled:opacity-70 flex items-center justify-center gap-2 hover:opacity-90 text-white ${color}`}
                >
                  {actionLoading && (
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  )}
                  {isEditing ? "💾 Save Changes" : "➕ Add Link"}
                </button>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}