import React, { useState, useEffect, useCallback, useMemo, useContext } from "react";
import { MasterTableService } from "../../lib/services/MasterTableService";
import FilteredTableComponent from "../../Component/formcomponent/FilteredTableComponent";
import { ThemeContext } from "../../Component/Context/ThemeContext";
import Loader from "../../Component/formcomponent/Loader";

const EMPTY_FORM = {
  NotificationCategoryID: "",
  NotificationCategory:   "",
  IsActive:                true,
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const normalise = (raw) =>
  raw.map((item, i) => ({
    _rowKey:                 `row-${i}`,
    NotificationCategoryID:  item.NotificationCategoryID != null ? Number(item.NotificationCategoryID) : null,
    NotificationCategory:    item.NotificationCategory ?? "",
    IsActive:                item.IsActive === true || item.IsActive === 1 || item.isactive === true || item.isactive === 1,
  }));

// NotificationCategoryID is NOT an identity column -> frontend computes next ID
// and sends it explicitly on insert. Existing data has a sentinel-style spacing
// (e.g. -1 reserved for "NA"), so we only look at positive IDs when projecting next.
const getNextID = (items) => {
  if (!items || items.length === 0) return 1;
  const positiveIDs = items.map((c) => Number(c.NotificationCategoryID) || 0).filter((n) => n > 0);
  if (positiveIDs.length === 0) return 1;
  return Math.max(...positiveIDs) + 1;
};

// Non-IDENTITY PK -> ID always included in payload, both insert and update.
const buildPayload = (form) => {
  return {
    NotificationCategoryID: Number(form.NotificationCategoryID),
    NotificationCategory:   (form.NotificationCategory ?? "").trim(),
    IsActive:                form.IsActive === true || form.IsActive === 1,
  };
};

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

// ── Component ─────────────────────────────────────────────────────────────────
export default function MasterNotificationCategory() {
  const { color } = useContext(ThemeContext); // e.g. "bg-[#002060]" — drives the N avatar below

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

  // ── Auth Check ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem("userInfoAll"));
    if (!user || Number(user.UserTypeID) !== 11) {
      window.location.href = "http://localhost:5173/react";
    }
  }, []);

  const showSuccess = (msg) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(null), 3000); };
  const showError   = (msg) => { setError(msg);      setTimeout(() => setError(null),      4000); };

  // ── FETCH: Notification Categories ─────────────────────────────────────────
  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await MasterTableService.getAllNotificationCategories();
      const raw  = data?.Data ?? data?.data ?? (Array.isArray(data) ? data : []);
      setItems(normalise(raw));
    } catch (err) {
      showError(err?.response?.data?.Message || err?.message || "Failed to load notification category records");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);
  useEffect(() => { setCurrentPage(1); }, [searchTerm, selectedFilter]);

  // ── NEXT ID ────────────────────────────────────────────────────────────────
  const nextId = useMemo(() => getNextID(items), [items]);

  // ── INSERT ────────────────────────────────────────────────────────────────
  const handleInsert = async (form) => {
    setActionLoading(true);
    try {
      const payload  = buildPayload(form);
      const response = await MasterTableService.insertNotificationCategory(payload);
      showSuccess(response?.Data?.Message || response?.message || "Notification category added successfully");
      setIsPanelOpen(false);
      await fetchItems();
    } catch (err) {
      showError(err?.response?.data?.Message || err?.message || "Failed to add notification category");
    } finally { setActionLoading(false); }
  };

  // ── UPDATE ────────────────────────────────────────────────────────────────
  const handleUpdate = async (form) => {
    setActionLoading(true);
    try {
      const data = await MasterTableService.updateNotificationCategory(buildPayload(form));
      showSuccess(data?.Data?.Message || data?.message || "Notification category updated successfully");
      setIsPanelOpen(false);
      await fetchItems();
    } catch (err) {
      showError(err?.response?.data?.Message || err?.message || "Failed to update notification category");
    } finally { setActionLoading(false); }
  };

  // ── DELETE ────────────────────────────────────────────────────────────────
  const handleDelete = async (item) => {
    if (item.NotificationCategoryID === -1) {
      showError("This is a protected system record and cannot be deleted");
      return;
    }
    if (!window.confirm(`Delete Notification Category "${item.NotificationCategory}" (ID ${item.NotificationCategoryID})?`)) return;
    setActionLoading(true);
    try {
      const data = await MasterTableService.softDeleteNotificationCategory(Number(item.NotificationCategoryID));
      showSuccess(data?.message || data?.Data?.Message || "Notification category deleted successfully");
      await fetchItems();
    } catch (err) {
      showError(err?.response?.data?.Message || err?.message || "Failed to delete notification category");
    } finally { setActionLoading(false); }
  };

  // ── TOGGLE STATUS ─────────────────────────────────────────────────────────
  const toggleStatusInline = async (item) => {
    const updated = { ...item, IsActive: !item.IsActive };
    setItems((prev) => prev.map((f) => (f._rowKey === item._rowKey ? updated : f)));
    try {
      await MasterTableService.updateNotificationCategory(buildPayload(updated));
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
    if (!currentRecord.NotificationCategory?.trim()) errs.NotificationCategory = true;
    setFormErrors(errs);
    if (Object.keys(errs).length > 0) { showError("Please fill all required fields"); return; }
    isEditing ? handleUpdate(currentRecord) : handleInsert(currentRecord);
  };

  // Non-IDENTITY PK: ID computed as max(existing positive IDs) + 1, editable
  // only in principle — kept read-only here to match caller-supplied convention
  const handleOpenPanel = (record = EMPTY_FORM, editMode = false) => {
    setFormErrors({});
    if (editMode) {
      setCurrentRecord({
        ...record,
        IsActive: record.IsActive ?? true,
      });
    } else {
      setCurrentRecord({
        ...EMPTY_FORM,
        NotificationCategoryID: nextId,
      });
    }
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
      ? f.NotificationCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(f.NotificationCategoryID).includes(searchTerm)
      : true;
    return matchStatus && matchSearch;
  });

  const sortedItems = [...filteredItems].sort((a, b) => (a.NotificationCategoryID ?? 0) - (b.NotificationCategoryID ?? 0));

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

  // ── TABLE COLUMNS FOR FilteredTableComponent ──────────────────────────────
  const columns = [
    {
      key: "NotificationCategoryID",
      header: "ID",
      width: "90px",
      headerClassName: "text-center",
      className: "text-center font-mono",
    },
    { 
      key: "NotificationCategory", 
      header: "Notification Category", 
      className: "font-medium" 
    },
    {
      key: "IsActive",
      header: "Status",
      sortable: false,
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
              aria-label={`Edit ${item.NotificationCategory}`}
              className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-violet-600 bg-violet-50 hover:bg-violet-600 hover:text-white transition-all active:scale-95"
            >
              <EditIcon />
            </button>
            <button
              type="button"
              onClick={() => handleDelete(item)}
              disabled={actionLoading || item.NotificationCategoryID === -1}
              title="Delete"
              aria-label={`Delete ${item.NotificationCategory}`}
              className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
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

        {/* Header - Matching MasterAcademicYear style */}
        <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-70 px-6 py-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className={`h-9 w-9 rounded-xl ${color} flex items-center justify-center font-bold shadow-md text-white text-sm`}>
              N
            </div>
            <h1 className="text-md font-bold tracking-tight text-slate-900">Master Notification Category</h1>
          </div>

          <div className="flex items-center gap-3">
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
              className="flex items-center gap-2 pl-2 pr-2 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-full transition-all active:scale-95 shadow-sm"
            >
              <span className="h-4 w-4 flex items-center justify-center rounded-full bg-white/20 text-white">
                <CloseIcon className="h-3 w-3" />
              </span>
              Close
            </button>

            <button
              onClick={() => handleOpenPanel(EMPTY_FORM, false)}
              className={`${color} text-white text-xs font-semibold px-4 py-2 rounded-xl active:scale-95 transition-all shadow-md hover:opacity-90`}
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
                  <p className="text-xs text-slate-500 font-medium">Total Categories</p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.Total.toLocaleString()}</h3>
                </div>
                <span className="p-2 bg-slate-100 rounded-lg text-xl">🔔</span>
              </div>
              <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
                <div>
                  <p className="text-xs text-emerald-600 font-medium">Active</p>
                  <h3 className="text-2xl font-bold text-emerald-600 mt-1">{stats.Active.toLocaleString()}</h3>
                </div>
                <span className="p-2 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold">● Live</span>
              </div>
              <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
                <div>
                  <p className="text-xs text-rose-500 font-medium">Inactive</p>
                  <h3 className="text-2xl font-bold text-rose-500 mt-1">{stats.Inactive.toLocaleString()}</h3>
                </div>
                <span className="p-2 bg-rose-50 text-rose-600 rounded-lg text-xs font-bold">● Off</span>
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
                  className="flex items-center gap-2 pl-2 pr-2 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-full transition-all active:scale-95 shadow-sm"
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

            {/* Toolbar — Excel/PDF, search, and Add New Record */}
            <div className="flex items-center gap-3">
              <div className="flex gap-2 shrink-0"></div>

              <div className="flex-1 flex justify-center">
                {/* <div className="relative w-full max-w-sm">
                  <input
                    type="text"
                    placeholder="🔍 Search by category or ID..."
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
              data={filteredItems}
              columns={columns}
              renderCell={renderCell}
              loading={loading}
              tableId="notification-categories-table"
              emptyStateMessage="No notification category records found"
              emptyStateSubMessage="Try adjusting your search or filters"
            />

          </main>

          {/* ── Fullscreen Square Modal (matching MasterAcademicYear style) ── */}
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
                      {isEditing ? "✏️ Edit Notification Category" : "✨ Add New Notification Category"}
                    </h3>
                    <p className="text-xs text-violet-100 mt-0.5">
                      {isEditing ? "Update the record below" : "Fill in all fields to create a new record"}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsPanelOpen(false)}
                    className="opacity-80 hover:opacity-100 text-xl p-2 hover:bg-white/20 rounded-lg transition-all"
                  >✕</button>
                </div>

                <form onSubmit={handleFormSubmit} className="p-6 flex-1 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4">

                    {/* ID – NON-IDENTITY column; frontend computes it and it IS sent on insert. */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        ID <span className="text-slate-400 font-normal normal-case">
                          {isEditing ? "(RO)" : "(auto)"}
                        </span>
                      </label>
                      <input
                        type="text"
                        value={currentRecord.NotificationCategoryID ?? ""}
                        disabled
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-mono bg-slate-50 text-slate-500 cursor-not-allowed"
                      />
                    </div>

                    {/* Notification Category Name */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Category <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={currentRecord.NotificationCategory}
                        onChange={set("NotificationCategory")}
                        placeholder="e.g., Important Notices"
                        className={`w-full px-3 py-2.5 border rounded-lg text-sm text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all placeholder:text-slate-300 ${
                          formErrors.NotificationCategory ? "border-rose-400" : "border-slate-200"
                        }`}
                      />
                    </div>

                    {/* IsActive Toggle - Full width */}
                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl col-span-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-semibold text-slate-800 block select-none">Status</label>
                          <span className="text-[11px] text-slate-500 block mt-0.5">
                            {currentRecord.IsActive ? "Category is active and available" : "Category is disabled"}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCurrentRecord((p) => ({ ...p, IsActive: !p.IsActive }))}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 shrink-0 ${
                            currentRecord.IsActive ? "bg-violet-600" : "bg-slate-300"
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
                    <div className="col-span-2 bg-gradient-to-br from-violet-50 to-purple-100/50 border border-violet-200 rounded-xl p-4">
                      <p className="text-[10px] font-bold text-violet-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <span>👁️</span> Record Preview
                      </p>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                        {[
                          ["ID", `#${currentRecord.NotificationCategoryID}`],
                          ["Category", currentRecord.NotificationCategory || "—"],
                        ].map(([label, val]) => (
                          <div key={label} className="flex justify-between text-sm py-1 border-b border-violet-100">
                            <span className="text-slate-500">{label}</span>
                            <span className="font-mono font-semibold text-slate-800 text-right max-w-[60%] truncate">{val}</span>
                          </div>
                        ))}
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
                    {isEditing ? "💾 Save Changes" : "➕ Add Category"}
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