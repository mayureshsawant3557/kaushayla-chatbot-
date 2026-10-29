import React, { useState, useEffect, useCallback, useContext } from "react";
import { MasterTableService } from "../../lib/services/MasterTableService";
import FilteredTableComponent from "../../Component/formcomponent/FilteredTableComponent";
import { ThemeContext } from "../../Component/Context/ThemeContext";

const EMPTY_FORM = {
  LinkID: "",
  LinkType: "C",
  LinkName: "",
  LinkDescription: "",
  LinkURL: "",
  PageCode: "",
  IsActive: true,
  LinkURLReact: "",
};

const LINK_TYPE_OPTIONS = [
  { value: "C", label: "C — Candidate" },
  { value: "E", label: "E — Establishment" },
];

const LINK_TYPE_META = {
  C: { label: "Candidate", bg: "bg-violet-50", border: "border-violet-200", text: "text-violet-700" },
  E: { label: "Establishment", bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700" },
};

// ── helpers ──────────────────────────────────────────────────────────────────
/**
 * FIX: Use index as fallback key to prevent duplicate-key warnings when
 * the API returns rows with null / duplicate LinkID values.
 */
const normalise = (raw) =>
  raw.map((item, i) => ({
    _rowKey: `row-${i}`, // always index-based → guaranteed unique
    LinkID: item.LinkID != null ? Number(item.LinkID) : "",
    LinkType: item.LinkType ?? "C",
    LinkName: item.LinkName ?? "",
    LinkDescription: item.LinkDescription ?? "",
    LinkURL: item.LinkURL ?? "",
    PageCode: item.PageCode ?? "",
    IsActive: item.IsActive === true || item.IsActive === 1,
    LinkURLReact: item.LinkURLReact ?? "",
  }));

const buildPayload = (form) => ({
  LinkID: Number(form.LinkID),
  OldLinkType: (form._originalLinkType ?? form.LinkType).trim(), // ← original
  LinkType: (form.LinkType ?? "C").trim(),
  LinkName: (form.LinkName ?? "").trim(),
  LinkDescription: (form.LinkDescription ?? "").trim() || null,
  LinkURL: (form.LinkURL ?? "").trim(),
  PageCode: (form.PageCode ?? "").trim() || null,
  IsActive: form.IsActive === true || form.IsActive === 1,
  LinkURLReact: (form.LinkURLReact ?? "").trim() || null,
});

// ── small inline icons (kept dependency-free, consistent with Back/Close icons) ─
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

const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#9aa2b8"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
);

export default function MasterApplicationFormLinks() {
  const { color } = useContext(ThemeContext); // e.g. "bg-[#002060]" — drives the L avatar below

  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(EMPTY_FORM);

  // Delete-confirmation popup state (replaces window.confirm)
  const [deleteTarget, setDeleteTarget] = useState(null); // { LinkID, LinkName } | null

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };
  const showError = (msg) => {
    setError(msg);
    setTimeout(() => setError(null), 4000);
  };

  // ── FETCH ─────────────────────────────────────────────────────────────────
  const fetchLinks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await MasterTableService.getAllApplicationFormLinks();
      const raw = data?.Data ?? data?.data ?? (Array.isArray(data) ? data : []);
      setLinks(normalise(raw));
    } catch (err) {
      showError(
        err?.response?.data?.Message ||
          err?.response?.data?.message ||
          "Failed to load application form links",
      );
      setLinks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  // ── INSERT ────────────────────────────────────────────────────────────────
  const handleInsert = async (form) => {
    setActionLoading(true);
    try {
      const response = await MasterTableService.insertApplicationFormLink(buildPayload(form));
      showSuccess(
        response?.Data?.Message ||
          response?.message ||
          response?.data?.message ||
          "Link added successfully",
      );
      setIsPanelOpen(false);
      await fetchLinks();
    } catch (err) {
      showError(
        err?.response?.data?.Message ||
          err?.response?.data?.message ||
          err.message ||
          "Failed to add link",
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ── UPDATE ────────────────────────────────────────────────────────────────
  const handleUpdate = async (form) => {
    setActionLoading(true);
    try {
      const data = await MasterTableService.updateApplicationFormLink(buildPayload(form));
      showSuccess(
        data?.Data?.Message ||
          data?.message ||
          data?.data?.message ||
          "Link updated successfully",
      );
      setIsPanelOpen(false);
      await fetchLinks();
    } catch (err) {
      showError(
        err?.response?.data?.Message ||
          err?.response?.data?.message ||
          err.message ||
          "Failed to update link",
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ── DELETE (popup based, no window.confirm) ─────────────────────────────────
  const requestDelete = (item) => setDeleteTarget(item);
  const cancelDelete = () => {
    if (!actionLoading) setDeleteTarget(null);
  };
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      const data = await MasterTableService.softDeleteApplicationFormLink(Number(deleteTarget.LinkID));
      showSuccess(data?.message || data?.Data?.Message || "Link deleted successfully");
      setDeleteTarget(null);
      await fetchLinks();
    } catch (err) {
      showError(
        err?.response?.data?.Message ||
          err?.response?.data?.message ||
          "Failed to delete link",
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ── TOGGLE STATUS ─────────────────────────────────────────────────────────
  const toggleStatusInline = async (item) => {
    const updated = { ...item, IsActive: !item.IsActive };
    setLinks((prev) => prev.map((l) => (l._rowKey === item._rowKey ? updated : l)));
    try {
      await MasterTableService.updateApplicationFormLink(buildPayload(updated));
      showSuccess(`Status set to ${updated.IsActive ? "Active" : "Inactive"}`);
    } catch (err) {
      setLinks((prev) => prev.map((l) => (l._rowKey === item._rowKey ? item : l)));
      showError(
        err?.response?.data?.Message || err?.message || "Failed to update status",
      );
    }
  };

  // ── FORM SUBMIT ───────────────────────────────────────────────────────────
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (
      !isEditing &&
      (currentRecord.LinkID === "" ||
        currentRecord.LinkID === null ||
        isNaN(Number(currentRecord.LinkID)))
    ) {
      showError("Link ID is required");
      return;
    }
    if (!currentRecord.LinkName?.trim()) {
      showError("Link Name is required");
      return;
    }
    if (!currentRecord.LinkType?.trim()) {
      showError("Link Type is required");
      return;
    }
    if (!currentRecord.LinkURL?.trim()) {
      showError("Link URL is required");
      return;
    }
    isEditing ? handleUpdate(currentRecord) : handleInsert(currentRecord);
  };

  const handleOpenPanel = (record = EMPTY_FORM, editMode = false) => {
    setCurrentRecord({
      ...record,
      IsActive: record.IsActive ?? true,
      _originalLinkType: record.LinkType,
    });
    setIsEditing(editMode);
    setIsPanelOpen(true);
  };

  const set = (field) => (e) => setCurrentRecord((p) => ({ ...p, [field]: e.target.value }));

  // ── STATUS TAB + TYPE + SEARCH FILTER (sort/pagination/export live inside FilteredTableComponent) ──
  const statusFilteredLinks = links
    .filter((l) => {
      if (selectedFilter === "Active") return l.IsActive;
      if (selectedFilter === "Inactive") return !l.IsActive;
      return true;
    })
    .filter((l) => (typeFilter === "All" ? true : l.LinkType === typeFilter))
    .filter((l) => {
      if (!searchTerm.trim()) return true;
      const q = searchTerm.trim().toLowerCase();
      return [
        l.LinkID,
        l.LinkType,
        l.LinkName,
        l.LinkDescription,
        l.PageCode,
        l.LinkURL,
        l.LinkURLReact,
        l.IsActive ? "active" : "inactive",
      ]
        .filter((v) => v !== null && v !== undefined)
        .some((v) => String(v).toLowerCase().includes(q));
    });

  const stats = {
    TotalCount: links.length,
    ActiveCount: links.filter((l) => l.IsActive).length,
    InactiveCount: links.filter((l) => !l.IsActive).length,
  };

  // ── TABLE COLUMNS FOR FilteredTableComponent ──────────────────────────────
  const columns = [
    {
      key: "LinkID",
      header: "ID",
      width: "80px",
      headerClassName: "text-center",
      className: "text-center font-mono",
    },
    { key: "LinkType", header: "Type", width: "150px" },
    { key: "LinkName", header: "Link Name", className: "font-medium" },
    { key: "LinkDescription", header: "Description" },
    { key: "PageCode", header: "Page Code", className: "font-mono" },
    { key: "LinkURL", header: "Link URL", className: "font-mono" },
    { key: "LinkURLReact", header: "React URL", className: "font-mono" },
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

  const renderLinkCell = (item, column) => {
    switch (column.key) {
      case "LinkType": {
        const typeMeta = LINK_TYPE_META[item.LinkType] ?? LINK_TYPE_META["C"];
        return (
          <span
            className={`font-mono px-2 py-1 rounded text-xs border ${typeMeta.bg} ${typeMeta.border} ${typeMeta.text}`}
          >
            {item.LinkType} — {typeMeta.label}
          </span>
        );
      }

      case "LinkDescription":
        return (
          <span className="max-w-[220px] truncate block" title={item.LinkDescription}>
            {item.LinkDescription || "—"}
          </span>
        );

      case "PageCode":
        return item.PageCode || "—";

      case "LinkURL":
        return (
          <span className="max-w-[240px] truncate block" title={item.LinkURL}>
            {item.LinkURL || "—"}
          </span>
        );

      case "LinkURLReact":
        return (
          <span className="max-w-[240px] truncate block" title={item.LinkURLReact}>
            {item.LinkURLReact || "—"}
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
            <span
              className={`h-1.5 w-1.5 rounded-full ${item.IsActive ? "bg-emerald-500" : "bg-rose-500"}`}
            />
            {item.IsActive ? "Active" : "Inactive"}
          </button>
        );

      case "actions":
        // icon-only buttons: keeps the row compact and lets the column shrink to ~90px
        return (
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <button
              type="button"
              onClick={() => handleOpenPanel(item, true)}
              title="Edit"
              aria-label={`Edit ${item.LinkName}`}
              className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-violet-600 bg-violet-50 hover:bg-violet-600 hover:text-white transition-all active:scale-95"
            >
              <EditIcon />
            </button>
            <button
              type="button"
              onClick={() => requestDelete(item)}
              disabled={actionLoading}
              title="Delete"
              aria-label={`Delete ${item.LinkName}`}
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
            L
          </div>
          <h1 className="text-md font-bold tracking-tight text-slate-900">
            Master Application Form Links
          </h1>
        </div>
      </header>

      <div className="flex flex-1 relative overflow-hidden">
        <main className="flex-1 p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
              <div>
                <p className="text-xs text-slate-500 font-medium">Total Registered</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">
                  {stats.TotalCount.toLocaleString()}
                </h3>
              </div>
              <span className="p-2 bg-slate-100 rounded-lg text-xl">🔗</span>
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
              <div>
                <p className="text-xs text-emerald-600 font-medium">Active Links</p>
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
                <p className="text-xs text-rose-600 font-medium">Disabled Elements</p>
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

              {/* Type filter */}
              <div className="relative">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="appearance-none bg-slate-50 border border-slate-200 rounded-full pl-3 pr-7 py-2 text-xs font-semibold text-slate-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all cursor-pointer"
                >
                  <option value="All">All Types</option>
                  <option value="C">C — Candidate</option>
                  <option value="E">E — Establishment</option>
                </select>
                <span className="absolute inset-y-0 right-2.5 flex items-center pointer-events-none text-slate-400 text-[10px]">
                  ▼
                </span>
              </div>
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

          {/* Toolbar — search and Add New Record */}
          <div className="flex items-center gap-3">
            <div className="flex-1 flex justify-center">
              {/* <div className="relative w-full max-w-sm">
                <SearchIcon />
                <input
                  type="text"
                  placeholder="Search by ID, name, code, URL..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all placeholder:text-slate-400"
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
            data={statusFilteredLinks}
            columns={columns}
            renderCell={renderLinkCell}
            loading={loading}
            tableId="application-form-links-table"
            emptyStateMessage="No application form link records found"
            emptyStateSubMessage="Try adjusting your search or filters"
          />
        </main>

        {/* Fullscreen Square Modal (Add / Edit) */}
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
                    {isEditing ? "✏️ Edit Application Form Link" : "✨ Add New Application Form Link"}
                  </h3>
                  <p className="text-xs text-violet-100 mt-0.5">
                    {isEditing ? "Update the link record below" : "Fill in all fields to create a new link"}
                  </p>
                </div>
                <button
                  onClick={() => setIsPanelOpen(false)}
                  className="opacity-80 hover:opacity-100 text-xl p-2 hover:bg-white/20 rounded-lg transition-all"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="p-6 flex-1 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  {/* Link ID — editable on Add, read-only on Edit */}
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      Link ID <span className="text-rose-500">*</span>
                      {isEditing && <span className="text-slate-400 font-normal ml-1">(RO)</span>}
                    </label>
                    <input
                      type="number"
                      required={!isEditing}
                      disabled={isEditing}
                      value={currentRecord.LinkID}
                      onChange={set("LinkID")}
                      placeholder="e.g., 33"
                      className={`w-full px-3 py-2.5 border rounded-lg text-sm font-mono focus:outline-none transition-all ${
                        isEditing
                          ? "border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                          : "border-slate-200 text-slate-800 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 placeholder:text-slate-300"
                      }`}
                    />
                  </div>

                  {/* Link Type */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      Link Type <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={currentRecord.LinkType}
                      onChange={set("LinkType")}
                      required
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 bg-white focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all"
                    >
                      {LINK_TYPE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Link Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      Link Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={currentRecord.LinkName}
                      onChange={set("LinkName")}
                      placeholder="e.g., Registration Fees"
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all placeholder:text-slate-300"
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
                      placeholder="e.g., RegistrationFees"
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-mono text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all placeholder:text-slate-300"
                    />
                  </div>

                  {/* Link Description */}
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      Link Description
                    </label>
                    <input
                      type="text"
                      value={currentRecord.LinkDescription}
                      onChange={set("LinkDescription")}
                      placeholder="e.g., Registration Fees"
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all placeholder:text-slate-300"
                    />
                  </div>

                  {/* Link URL */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      Link URL <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={currentRecord.LinkURL}
                      onChange={set("LinkURL")}
                      placeholder="../Institute/InstitutePayment.aspx"
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-mono text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all placeholder:text-slate-300"
                    />
                  </div>

                  {/* React URL */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      React URL
                    </label>
                    <input
                      type="text"
                      value={currentRecord.LinkURLReact}
                      onChange={set("LinkURLReact")}
                      placeholder="/Institute/InstitutePayment"
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-mono text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all placeholder:text-slate-300"
                    />
                  </div>

                  {/* IsActive Toggle */}
                  <div className="col-span-2 bg-slate-50 border border-slate-200 p-3 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-semibold text-slate-800 block select-none">
                          Status
                        </label>
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                          {currentRecord.IsActive ? "Active & visible" : "Disabled & hidden"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCurrentRecord((p) => ({ ...p, IsActive: !p.IsActive }))}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 shrink-0 ${
                          currentRecord.IsActive ? color : "bg-slate-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                            currentRecord.IsActive ? "translate-x-6" : "translate-x-1"
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
                        ["ID", currentRecord.LinkID !== "" && currentRecord.LinkID !== null ? `#${currentRecord.LinkID}` : "—"],
                        ["Link Name", currentRecord.LinkName || "—"],
                        ["Page Code", currentRecord.PageCode || "—"],
                        ["Link URL", currentRecord.LinkURL || "—"],
                        ["React URL", currentRecord.LinkURLReact || "—"],
                      ].map(([label, val]) => (
                        <div
                          key={label}
                          className="flex justify-between text-sm py-1 border-b border-violet-100"
                        >
                          <span className="text-slate-500">{label}</span>
                          <span
                            className="font-mono font-semibold text-slate-800 text-right max-w-[60%] truncate"
                            title={String(val)}
                          >
                            {val}
                          </span>
                        </div>
                      ))}
                      <div className="flex justify-between text-sm py-1 items-center">
                        <span className="text-slate-500">Type</span>
                        {currentRecord.LinkType ? (
                          <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${LINK_TYPE_META[currentRecord.LinkType]?.bg} ${LINK_TYPE_META[currentRecord.LinkType]?.border} ${LINK_TYPE_META[currentRecord.LinkType]?.text}`}
                          >
                            {currentRecord.LinkType} — {LINK_TYPE_META[currentRecord.LinkType]?.label}
                          </span>
                        ) : (
                          "—"
                        )}
                      </div>
                      <div className="flex justify-between text-sm py-1 col-span-2">
                        <span className="text-slate-500">Status</span>
                        <span
                          className={`font-semibold ${currentRecord.IsActive ? "text-emerald-600" : "text-rose-600"}`}
                        >
                          {currentRecord.IsActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit (kept inside form so Enter key still works) */}
                <button type="submit" className="hidden" aria-hidden="true" />
              </form>

              {/* Bottom action bar: Back / Save — Save button themed via ThemeContext */}
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

        {/* Delete Confirmation Popup (replaces window.confirm) */}
        {deleteTarget && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={cancelDelete}
          >
            <div
              className="bg-white border border-slate-200 shadow-2xl rounded-2xl w-full max-w-sm overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 flex flex-col items-center text-center gap-3">
                <div className="h-12 w-12 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-2xl">
                  🗑️
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Delete this link?</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    You're about to delete{" "}
                    <span className="font-semibold text-slate-700">"{deleteTarget.LinkName}"</span>{" "}
                    (ID #{deleteTarget.LinkID}). This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex gap-3">
                <button
                  type="button"
                  onClick={cancelDelete}
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
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
  );
}