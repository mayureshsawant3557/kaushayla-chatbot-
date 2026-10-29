import React, { useState, useEffect, useCallback, useContext } from "react";
import { MasterTableService } from "../../lib/services/MasterTableService";
import FilteredTableComponent from "../../Component/formcomponent/FilteredTableComponent";
import { ThemeContext } from "../../Component/Context/ThemeContext";
import Loader from "../../Component/formcomponent/Loader";

// ── Constants ────────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  BatchID: "",
  CollegeID: "",
  CourseID: "",
  ShiftID: "",
  UnitNo: "",
  UnitID: "",
  BatchStartDate: "",
  BatchEndDate: "",
  AdmissionEndDate: "",
  IsSystemCreated: 1,
  BatchStatus: 4,
  IsDeleted: 0,
  AdmissionYearID: "",
  BatchTypeID: "",
  ExaminationID1: "",
  ExaminationID2: "",
  Intake: "",
};

const BATCH_STATUS_OPTIONS = [
  { value: 4, label: "Active", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { value: 6, label: "Closed", badge: "bg-slate-100 text-slate-600 border-slate-200" },
  { value: 1, label: "Open", badge: "bg-cyan-50 text-cyan-700 border-cyan-200" },
  { value: 0, label: "Draft", badge: "bg-amber-50 text-amber-700 border-amber-200" },
  { value: 2, label: "Pending", badge: "bg-purple-50 text-purple-700 border-purple-200" },
  { value: 3, label: "Inactive", badge: "bg-slate-100 text-slate-500 border-slate-200" },
  { value: 5, label: "Archived", badge: "bg-orange-50 text-orange-700 border-orange-200" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const toDateInput = (val) => {
  if (!val) return "";
  const d = new Date(val);
  if (isNaN(d)) return "";
  return d.toISOString().split("T")[0];
};

const numOrEmpty = (val) => (val != null && val !== "" ? Number(val) : "");

const normalise = (raw) =>
  raw.map((item, i) => ({
    _rowKey: `row-${i}`,
    ID: item.ID != null ? Number(item.ID) : null,
    BatchID: item.BatchID ?? "",
    CollegeID: numOrEmpty(item.CollegeID),
    CourseID: numOrEmpty(item.CourseID),
    ShiftID: numOrEmpty(item.ShiftID),
    UnitNo: numOrEmpty(item.UnitNo),
    UnitID: numOrEmpty(item.UnitID),
    BatchStartDate: toDateInput(item.BatchStartDate),
    BatchEndDate: toDateInput(item.BatchEndDate),
    AdmissionEndDate: toDateInput(item.AdmissionEndDate),
    IsSystemCreated: item.IsSystemCreated != null ? Number(item.IsSystemCreated) : 1,
    BatchStatus: item.BatchStatus != null ? Number(item.BatchStatus) : 4,
    IsDeleted: item.IsDeleted != null ? Number(item.IsDeleted) : 0,
    AdmissionYearID: numOrEmpty(item.AdmissionYearID),
    BatchTypeID: numOrEmpty(item.BatchTypeID),
    ExaminationID1: numOrEmpty(item.ExaminationID1),
    ExaminationID2: numOrEmpty(item.ExaminationID2),
    Intake: numOrEmpty(item.Intake),
  }));

const buildPayload = (form) => ({
  BatchID: form.BatchID !== "" ? Number(form.BatchID) : null,
  CollegeID: form.CollegeID !== "" ? Number(form.CollegeID) : null,
  CourseID: form.CourseID !== "" ? Number(form.CourseID) : null,
  ShiftID: form.ShiftID !== "" ? Number(form.ShiftID) : null,
  UnitNo: form.UnitNo !== "" ? Number(form.UnitNo) : null,
  UnitID: form.UnitID !== "" ? Number(form.UnitID) : null,
  BatchStartDate: form.BatchStartDate || null,
  BatchEndDate: form.BatchEndDate || null,
  AdmissionEndDate: form.AdmissionEndDate || null,
  IsSystemCreated: Number(form.IsSystemCreated),
  BatchStatus: Number(form.BatchStatus),
  IsDeleted: Number(form.IsDeleted),
  AdmissionYearID: form.AdmissionYearID !== "" ? Number(form.AdmissionYearID) : null,
  BatchTypeID: form.BatchTypeID !== "" ? Number(form.BatchTypeID) : null,
  ExaminationID1: form.ExaminationID1 !== "" ? Number(form.ExaminationID1) : null,
  ExaminationID2: form.ExaminationID2 !== "" ? Number(form.ExaminationID2) : null,
  Intake: form.Intake !== "" ? Number(form.Intake) : null,
  ...(form.ID != null ? { ID: Number(form.ID) } : {}),
});

const getStatusMeta = (val) => {
  const num = Number(val);
  return (
    BATCH_STATUS_OPTIONS.find((o) => o.value === num) ?? {
      label: `Status ${num}`,
      badge: "bg-slate-100 text-slate-500 border-slate-200",
    }
  );
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

// ── Form sub-components (unchanged from original — still needed inside the modal) ─

const Field = ({ label, required, children, className }) => (
  <div className={className}>
    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    {children}
  </div>
);

const NumField = ({ label, required, placeholder, className, value, onChange }) => (
  <Field label={label} required={required} className={className}>
    <input
      type="number"
      min="0"
      value={value ?? ""}
      onChange={onChange}
      placeholder={placeholder ?? "—"}
      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all placeholder:text-slate-300"
    />
  </Field>
);

const DateField = ({ label, required, className, value, onChange }) => (
  <Field label={label} required={required} className={className}>
    <input
      type="date"
      value={value ?? ""}
      onChange={onChange}
      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all"
    />
  </Field>
);

const SectionDivider = ({ children }) => (
  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest my-3">
    {children}
    <div className="flex-1 h-px bg-slate-100" />
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────

export default function MasterBatch() {
  const { color } = useContext(ThemeContext); // e.g. "bg-[#002060]" — drives the MB avatar + accent buttons

  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(EMPTY_FORM);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };
  const showError = (msg) => {
    setError(msg);
    setTimeout(() => setError(null), 4000);
  };

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchBatches = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await MasterTableService.getAllBatches();
      const raw = data?.Data ?? data?.data ?? (Array.isArray(data) ? data : []);
      setBatches(normalise(raw));
    } catch (err) {
      showError(err?.response?.data?.Message || err?.message || "Failed to load batches");
      setBatches([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  // ── CRUD ───────────────────────────────────────────────────────────────────
  const handleInsert = async (form) => {
    setActionLoading(true);
    try {
      const response = await MasterTableService.insertBatch(buildPayload(form));
      showSuccess(response?.Data?.Message || "Batch added successfully");
      setIsPanelOpen(false);
      await fetchBatches();
    } catch (err) {
      showError(err?.response?.data?.Message || err?.message || "Failed to add batch");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async (form) => {
    setActionLoading(true);
    try {
      const data = await MasterTableService.updateBatch(buildPayload(form));
      showSuccess(data?.Data?.Message || "Batch updated successfully");
      setIsPanelOpen(false);
      await fetchBatches();
    } catch (err) {
      showError(err?.response?.data?.Message || err?.message || "Failed to update batch");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id, batchIdLabel) => {
    if (!window.confirm(`Are you sure you want to delete Batch "${batchIdLabel}" (ID ${id})?`)) return;
    setActionLoading(true);
    try {
      const data = await MasterTableService.softDeleteBatch(Number(id));
      showSuccess(data?.message || data?.Data?.Message || "Batch deleted successfully");
      await fetchBatches();
    } catch (err) {
      showError(err?.response?.data?.Message || err?.message || "Failed to delete batch");
    } finally {
      setActionLoading(false);
    }
  };

  // ── TOGGLE DELETED / ACTIVE (inline, click the badge) ───────────────────────
  const toggleDeletedInline = async (item) => {
    const newVal = item.IsDeleted ? 0 : 1;
    setBatches((prev) =>
      prev.map((b) => (b.ID === item.ID ? { ...b, IsDeleted: newVal } : b)),
    );
    setActionLoading(true);
    try {
      const data = await MasterTableService.updateBatch(buildPayload({ ...item, IsDeleted: newVal }));
      showSuccess(data?.Data?.Message || `Batch marked as ${newVal ? "Deleted" : "Active"}`);
    } catch (err) {
      setBatches((prev) =>
        prev.map((b) => (b.ID === item.ID ? { ...b, IsDeleted: item.IsDeleted } : b)),
      );
      showError(err?.response?.data?.Message || err?.message || "Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!currentRecord.BatchID) { showError("Batch ID is required"); return; }
    if (!currentRecord.CollegeID) { showError("College ID is required"); return; }
    if (!currentRecord.CourseID) { showError("Course ID is required"); return; }
    if (!currentRecord.BatchStartDate) { showError("Batch Start Date is required"); return; }
    if (!currentRecord.BatchEndDate) { showError("Batch End Date is required"); return; }
    if (!currentRecord.AdmissionEndDate) { showError("Admission End Date is required"); return; }
    isEditing ? handleUpdate(currentRecord) : handleInsert(currentRecord);
  };

  const handleOpenPanel = (record = EMPTY_FORM, editMode = false) => {
    setCurrentRecord({ ...record });
    setIsEditing(editMode);
    setIsPanelOpen(true);
  };

  const set = (field) => (e) => setCurrentRecord((p) => ({ ...p, [field]: e.target.value }));
  const setNum = (field) => (e) =>
    setCurrentRecord((p) => ({ ...p, [field]: e.target.value === "" ? "" : Number(e.target.value) }));

  // ── Status tab + Batch-status + search filter (sort/pagination/export live inside FilteredTableComponent) ──
  const statusFilteredBatches = batches
    .filter((b) => {
      if (selectedFilter === "Active") return b.IsDeleted === 0;
      if (selectedFilter === "Deleted") return b.IsDeleted === 1;
      return true;
    })
    .filter((b) => (selectedStatus === "All" ? true : b.BatchStatus === Number(selectedStatus)))
    .filter((b) => {
      if (!searchTerm.trim()) return true;
      const term = searchTerm.trim().toLowerCase();
      return [
        b.ID,
        b.BatchID,
        b.CollegeID,
        b.CourseID,
        b.ShiftID,
        b.UnitNo,
        b.UnitID,
        b.BatchStartDate,
        b.BatchEndDate,
        b.AdmissionEndDate,
        b.IsSystemCreated ? "yes" : "no",
        getStatusMeta(b.BatchStatus).label,
        b.IsDeleted ? "deleted" : "active",
        b.AdmissionYearID,
        b.BatchTypeID,
        b.ExaminationID1,
        b.ExaminationID2,
        b.Intake,
      ]
        .filter((v) => v !== null && v !== undefined && v !== "")
        .some((v) => String(v).toLowerCase().includes(term));
    });

  const stats = {
    total: batches.length,
    active: batches.filter((b) => b.IsDeleted === 0).length,
    deleted: batches.filter((b) => b.IsDeleted === 1).length,
  };

  // ── TABLE COLUMNS FOR FilteredTableComponent ──────────────────────────────
  const columns = [
    { key: "ID", header: "ID", width: "70px", headerClassName: "text-center", className: "text-center font-mono" },
    { key: "BatchID", header: "Batch ID", className: "font-mono text-cyan-700 font-semibold whitespace-nowrap" },
    { key: "CollegeID", header: "College" },
    { key: "CourseID", header: "Course" },
    { key: "ShiftID", header: "Shift" },
    { key: "UnitNo", header: "Unit No" },
    { key: "UnitID", header: "Unit ID" },
    { key: "BatchStartDate", header: "Start Date", className: "font-mono text-xs whitespace-nowrap" },
    { key: "BatchEndDate", header: "End Date", className: "font-mono text-xs whitespace-nowrap" },
    { key: "AdmissionEndDate", header: "Adm. End", className: "font-mono text-xs whitespace-nowrap" },
    { key: "IsSystemCreated", header: "Sys Created", headerClassName: "text-center", className: "text-center", sortable: false },
    { key: "BatchStatus", header: "Status", sortable: false },
    { key: "IsDeleted", header: "Deleted", sortable: false },
    { key: "AdmissionYearID", header: "Adm. Year" },
    { key: "BatchTypeID", header: "Batch Type" },
    { key: "ExaminationID1", header: "Exam ID1" },
    { key: "ExaminationID2", header: "Exam ID2" },
    { key: "Intake", header: "Intake" },
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

  const renderBatchCell = (item, column) => {
    switch (column.key) {
      case "IsSystemCreated":
        return item.IsSystemCreated ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-50 border border-cyan-200 text-cyan-700">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" /> Yes
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 border border-slate-200 text-slate-500">
            No
          </span>
        );

      case "BatchStatus": {
        const meta = getStatusMeta(item.BatchStatus);
        return (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${meta.badge}`}>
            {meta.label}
          </span>
        );
      }

      case "IsDeleted":
        return (
          <button
            type="button"
            onClick={() => toggleDeletedInline(item)}
            disabled={actionLoading}
            title="Click to toggle"
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium border text-xs transition-all active:scale-95 disabled:opacity-50 ${
              item.IsDeleted
                ? "bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100"
                : "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${item.IsDeleted ? "bg-rose-500" : "bg-emerald-500"}`} />
            {item.IsDeleted ? "Deleted" : "Active"}
          </button>
        );

      case "actions":
        return (
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <button
              type="button"
              onClick={() => handleOpenPanel(item, true)}
              title="Edit"
              aria-label={`Edit ${item.BatchID}`}
              className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-violet-600 bg-violet-50 hover:bg-violet-600 hover:text-white transition-all active:scale-95"
            >
              <EditIcon />
            </button>
            <button
              type="button"
              onClick={() => handleDelete(item.ID, item.BatchID)}
              disabled={actionLoading}
              title="Delete"
              aria-label={`Delete ${item.BatchID}`}
              className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white transition-all active:scale-95 disabled:opacity-50"
            >
              <TrashIcon />
            </button>
          </span>
        );

      default:
        return undefined; // fall through to default value rendering (handles "—" for empty numerics etc.)
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased flex flex-col">

      {/* Loader - Shows when loading data */}
      {loading && <Loader />}

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
          <div className={`h-9 w-9 rounded-xl ${color} flex items-center justify-center font-bold shadow-md text-white text-xs`}>
            MB
          </div>
          <h1 className="text-md font-bold tracking-tight text-slate-900">Master Batch</h1>
        </div>
      </header>

      <div className="flex flex-1 relative overflow-hidden">
        <main className="flex-1 p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full">

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
              <div>
                <p className="text-xs text-slate-500 font-medium">Total Batches</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.total.toLocaleString()}</h3>
              </div>
              <span className="p-2 bg-slate-100 rounded-lg text-xl">📊</span>
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
              <div>
                <p className="text-xs text-emerald-600 font-medium">Active</p>
                <h3 className="text-2xl font-bold text-emerald-600 mt-1">{stats.active.toLocaleString()}</h3>
              </div>
              <span className="p-2 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold">● Live</span>
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
              <div>
                <p className="text-xs text-rose-600 font-medium">Deleted</p>
                <h3 className="text-2xl font-bold text-rose-600 mt-1">{stats.deleted.toLocaleString()}</h3>
              </div>
              <span className="p-2 bg-rose-50 text-rose-700 rounded-lg text-xs font-bold">○ Down</span>
            </div>
          </div>

          {/* Status tabs row — Back / Close + Batch Status filter live here */}
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

              <div className="relative">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="appearance-none bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-7 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  {BATCH_STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <span className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-slate-400 text-[10px]">▼</span>
              </div>
            </div>

            <div className="flex bg-slate-100 p-1 border border-slate-200 rounded-lg w-full md:w-fit">
              {["All", "Active", "Deleted"].map((tab) => (
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#9aa2b8"
                  strokeWidth="2"
                  className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by ID, Batch ID, College, Course, Dates, Status…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all placeholder:text-slate-400"
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
            data={statusFilteredBatches}
            columns={columns}
            renderCell={renderBatchCell}
            loading={loading}
            tableId="master-batch-table"
            emptyStateMessage="No batch records found"
            emptyStateSubMessage="Try adjusting your search or filters"
          />
        </main>

        {/* Fullscreen Square Modal (Add/Edit) */}
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
                    {isEditing ? "✏️ Edit Batch" : "✨ Add New Batch"}
                  </h3>
                  <p className="text-xs text-violet-100 mt-0.5">
                    {isEditing ? `Editing record #${currentRecord.ID}` : "Fill in all required fields to create a new batch"}
                  </p>
                </div>
                <button
                  onClick={() => setIsPanelOpen(false)}
                  className="opacity-80 hover:opacity-100 text-xl p-2 hover:bg-white/20 rounded-lg transition-all"
                >✕</button>
              </div>

              <form onSubmit={handleFormSubmit} className="p-6 flex-1 overflow-y-auto">

                <SectionDivider>Identifiers</SectionDivider>
                <div className={isEditing ? "grid grid-cols-2 gap-4" : "grid grid-cols-1 gap-4"}>
                  {isEditing && (
                    <Field label="ID">
                      <input
                        type="text"
                        value={currentRecord.ID ?? ""}
                        disabled
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-mono bg-slate-50 text-slate-500 cursor-not-allowed"
                      />
                    </Field>
                  )}
                  <Field label="Batch ID" required>
                    <input
                      type="number"
                      value={currentRecord.BatchID ?? ""}
                      onChange={setNum("BatchID")}
                      placeholder="e.g. 11599138411005"
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all placeholder:text-slate-300"
                    />
                  </Field>
                </div>

                <SectionDivider>Institute Details</SectionDivider>
                <div className="grid grid-cols-2 gap-4 mb-2">
                  <NumField label="College ID" required placeholder="e.g. 10003" value={currentRecord.CollegeID} onChange={setNum("CollegeID")} />
                  <NumField label="Course ID" required placeholder="e.g. 357" value={currentRecord.CourseID} onChange={setNum("CourseID")} />
                </div>
                <div className="grid grid-cols-3 gap-4 mb-2">
                  <NumField label="Shift ID" placeholder="e.g. 1" value={currentRecord.ShiftID} onChange={setNum("ShiftID")} />
                  <NumField label="Unit No" placeholder="e.g. 5" value={currentRecord.UnitNo} onChange={setNum("UnitNo")} />
                  <NumField label="Unit ID" placeholder="e.g. 1" value={currentRecord.UnitID} onChange={setNum("UnitID")} />
                </div>
                <div className="grid grid-cols-2 gap-4 mb-2">
                  <NumField label="Admission Year" placeholder="—" value={currentRecord.AdmissionYearID} onChange={setNum("AdmissionYearID")} />
                  <NumField label="Batch Type ID" placeholder="—" value={currentRecord.BatchTypeID} onChange={setNum("BatchTypeID")} />
                </div>

                <SectionDivider>Dates</SectionDivider>
                <div className="grid grid-cols-3 gap-4 mb-2">
                  <DateField label="Batch Start Date" required value={currentRecord.BatchStartDate} onChange={set("BatchStartDate")} />
                  <DateField label="Batch End Date" required value={currentRecord.BatchEndDate} onChange={set("BatchEndDate")} />
                  <DateField label="Admission End Date" required value={currentRecord.AdmissionEndDate} onChange={set("AdmissionEndDate")} />
                </div>

                <SectionDivider>Configuration</SectionDivider>
                <div className="grid grid-cols-2 gap-4 mb-2">
                  <NumField label="Intake" placeholder="—" value={currentRecord.Intake} onChange={setNum("Intake")} />
                  <NumField label="Examination ID1" placeholder="—" value={currentRecord.ExaminationID1} onChange={setNum("ExaminationID1")} />
                  <NumField label="Examination ID2" placeholder="—" value={currentRecord.ExaminationID2} onChange={setNum("ExaminationID2")} />
                </div>

                <SectionDivider>Status</SectionDivider>
                <Field label="Batch Status" className="mb-4">
                  <select
                    value={currentRecord.BatchStatus}
                    onChange={setNum("BatchStatus")}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all bg-white"
                  >
                    {BATCH_STATUS_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </Field>

                <div className="grid grid-cols-2 gap-4 mb-2">
                  {/* System Created toggle */}
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-semibold text-slate-800 block select-none">System Created</label>
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                          {currentRecord.IsSystemCreated ? "Yes" : "No"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCurrentRecord((p) => ({ ...p, IsSystemCreated: p.IsSystemCreated ? 0 : 1 }))}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shrink-0 ${
                          currentRecord.IsSystemCreated ? "bg-blue-600" : "bg-slate-300"
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                          currentRecord.IsSystemCreated ? "translate-x-6" : "translate-x-1"
                        }`} />
                      </button>
                    </div>
                  </div>

                  {/* Is Deleted toggle */}
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-semibold text-slate-800 block select-none">Is Deleted</label>
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                          {currentRecord.IsDeleted ? "Yes" : "No"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCurrentRecord((p) => ({ ...p, IsDeleted: p.IsDeleted ? 0 : 1 }))}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 shrink-0 ${
                          currentRecord.IsDeleted ? "bg-rose-600" : "bg-slate-300"
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                          currentRecord.IsDeleted ? "translate-x-6" : "translate-x-1"
                        }`} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Record Preview */}
                <div className="bg-gradient-to-br from-violet-50 to-purple-100/50 border border-violet-200 rounded-xl p-4 mt-2">
                  <p className="text-[10px] font-bold text-violet-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <span>👁️</span> Record Preview
                  </p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                    {[
                      ["ID", isEditing ? `#${currentRecord.ID}` : "Auto-generated"],
                      ["Batch ID", currentRecord.BatchID || "—"],
                      ["College ID", currentRecord.CollegeID || "—"],
                      ["Course ID", currentRecord.CourseID || "—"],
                    ].map(([label, val]) => (
                      <div key={label} className="flex justify-between text-sm py-1 border-b border-violet-100">
                        <span className="text-slate-500">{label}</span>
                        <span className="font-mono font-semibold text-slate-800 text-right max-w-[60%] truncate">{val}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-sm py-1 col-span-2">
                      <span className="text-slate-500">Status</span>
                      <span className={`font-semibold ${currentRecord.IsDeleted ? "text-rose-600" : "text-emerald-600"}`}>
                        {currentRecord.IsDeleted ? "Deleted" : "Active"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Hidden submit so Enter key still works */}
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
                  {isEditing ? "💾 Save Changes" : "➕ Add Batch"}
                </button>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}