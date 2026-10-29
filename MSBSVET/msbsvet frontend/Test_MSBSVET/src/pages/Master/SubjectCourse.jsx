import React, { useState, useEffect, useCallback, useContext } from "react";
import { MasterTableService } from "../../lib/services/MasterTableService";
import FilteredTableComponent from "../../Component/formcomponent/FilteredTableComponent";
import { ThemeContext } from "../../Component/Context/ThemeContext";
import Loader from "../../Component/formcomponent/Loader";

const EMPTY_FORM = {
  SubjectCourseID: "",
  CourseID: "",
  CourseCode: "",
  SubjectName: "",
  SubjectCode: "",
  SubjectType: "THEORY",
  IsActive: 1,
};

const SUBJECT_TYPES = ["THEORY", "PRACTICAL"];

// ── helpers ──────────────────────────────────────────────────────────────────
const numOrEmpty = (val) => (val != null && val !== "" ? Number(val) : "");

const normalise = (raw) =>
  raw.map((item, i) => ({
    _rowKey: `row-${i}`,
    SubjectCourseID: numOrEmpty(item.SubjectCourseID),
    CourseID: numOrEmpty(item.CourseID),
    CourseCode: item.CourseCode ?? "",
    SubjectName: item.SubjectName ?? "",
    SubjectCode: item.SubjectCode ?? "",
    SubjectType: item.SubjectType ?? "THEORY",
    IsActive: item.IsActive !== undefined && item.IsActive !== null ? Number(item.IsActive) : 1,
  }));

const buildPayload = (form, isUpdate = false) => {
  const payload = {
    CourseID: Number(form.CourseID),
    CourseCode: (form.CourseCode ?? "").trim(),
    SubjectName: (form.SubjectName ?? "").trim(),
    SubjectCode: (form.SubjectCode ?? "").trim(),
    SubjectType: form.SubjectType || "THEORY",
    IsActive: form.IsActive === 1 || form.IsActive === true,
  };

  if (isUpdate) {
    payload.OldCourseID = Number(form.OldCourseID || form.CourseID);
    payload.OldSubjectCode = form.OldSubjectCode || form.SubjectCode;
  }

  return payload;
};

// ── small inline icons ──────────────────────────────────────────────────────
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

export default function MasterSubjectCourse() {
  const { color } = useContext(ThemeContext);

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
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
  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await MasterTableService.getAllSubjectCourses();
      const raw = data?.Data ?? data?.data ?? (Array.isArray(data) ? data : []);
      setRecords(normalise(raw));
    } catch (err) {
      showError(
        err?.response?.data?.Message ||
        err?.response?.data?.message ||
        err.message ||
        "Failed to load subject courses"
      );
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);
  useEffect(() => { setCurrentPage(1); }, [searchTerm, selectedFilter, typeFilter]);

  // ── INSERT ────────────────────────────────────────────────────────────────
  const handleInsert = async (form) => {
    setActionLoading(true);
    try {
      const payload = buildPayload(form, false);
      await MasterTableService.insertSubjectCourse(payload);
      showSuccess("Subject course added successfully");
      setIsPanelOpen(false);
      await fetchRecords();
    } catch (err) {
      showError(
        err?.response?.data?.Message ||
        err?.response?.data?.message ||
        err.message ||
        "Failed to add subject course"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ── UPDATE ────────────────────────────────────────────────────────────────
  const handleUpdate = async (form) => {
    setActionLoading(true);
    try {
      const payload = buildPayload(form, true);
      await MasterTableService.updateSubjectCourse(payload);
      showSuccess("Subject course updated successfully");
      setIsPanelOpen(false);
      await fetchRecords();
    } catch (err) {
      showError(
        err?.response?.data?.Message ||
        err?.response?.data?.message ||
        err.message ||
        "Failed to update subject course"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ── DELETE ────────────────────────────────────────────────────────────────
  const handleDelete = async (item) => {
    if (!item.CourseID || !item.SubjectCode) {
      showError("Missing CourseID or SubjectCode for deletion");
      return;
    }
    if (!window.confirm(`Delete "${item.SubjectName}" (Course ID: ${item.CourseID})?`)) return;

    setActionLoading(true);
    try {
      await MasterTableService.softDeleteSubjectCourse(Number(item.CourseID), item.SubjectCode);
      showSuccess("Subject course deleted successfully");
      await fetchRecords();
    } catch (err) {
      showError(
        err?.response?.data?.Message ||
        err?.response?.data?.message ||
        err.message ||
        "Failed to delete subject course"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ── TOGGLE STATUS ─────────────────────────────────────────────────────────
  const toggleStatusInline = async (item) => {
    const updated = { ...item, IsActive: item.IsActive === 1 ? 0 : 1 };

    setRecords((prev) =>
      prev.map((r) => (r._rowKey === item._rowKey ? updated : r))
    );

    try {
      const payload = {
        OldCourseID: Number(item.CourseID),
        OldSubjectCode: item.SubjectCode,
        CourseID: Number(item.CourseID),
        CourseCode: item.CourseCode,
        SubjectName: item.SubjectName,
        SubjectCode: item.SubjectCode,
        SubjectType: item.SubjectType,
        IsActive: updated.IsActive === 1,
      };
      await MasterTableService.updateSubjectCourse(payload);
      showSuccess(`Status updated to ${updated.IsActive === 1 ? "Active" : "Inactive"}`);
    } catch (err) {
      setRecords((prev) =>
        prev.map((r) => (r._rowKey === item._rowKey ? item : r))
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
    if (!currentRecord.SubjectName?.trim()) {
      showError("Subject Name is required");
      return;
    }
    if (!currentRecord.SubjectCode?.trim()) {
      showError("Subject Code is required");
      return;
    }
    if (currentRecord.CourseID === "" || currentRecord.CourseID == null) {
      showError("Course ID is required");
      return;
    }
    if (!currentRecord.CourseCode?.trim()) {
      showError("Course Code is required");
      return;
    }
    isEditing ? handleUpdate(currentRecord) : handleInsert(currentRecord);
  };

  const handleOpenPanel = (record = EMPTY_FORM, editMode = false) => {
    setCurrentRecord(
      editMode
        ? {
            ...record,
            OldCourseID: record.CourseID,
            OldSubjectCode: record.SubjectCode,
          }
        : { ...EMPTY_FORM }
    );
    setIsEditing(editMode);
    setIsPanelOpen(true);
  };

  const setField = (field) => (e) =>
    setCurrentRecord((p) => ({ ...p, [field]: e.target.value }));

  const setNumField = (field) => (e) =>
    setCurrentRecord((p) => ({
      ...p,
      [field]: e.target.value === "" ? "" : Number(e.target.value),
    }));

  // ── FILTERING ─────────────────────────────────────────────────────────────
  const filteredRecords = records.filter((r) => {
    const matchStatus =
      selectedFilter === "All"
        ? true
        : selectedFilter === "Active"
        ? r.IsActive === 1
        : r.IsActive === 0;

    const matchType = typeFilter === "All" ? true : r.SubjectType === typeFilter;

    const term = searchTerm.trim().toLowerCase();
    const matchSearch = term
      ? [
          r.SubjectCourseID,
          r.CourseID,
          r.CourseCode,
          r.SubjectName,
          r.SubjectCode,
          r.SubjectType,
          r.IsActive === 1 ? "active" : "inactive",
        ]
          .filter((v) => v !== null && v !== undefined)
          .some((v) => String(v).toLowerCase().includes(term))
      : true;

    return matchStatus && matchType && matchSearch;
  });

  // ── PAGINATION ────────────────────────────────────────────────────────────
  const isFilterActive = searchTerm !== "" || selectedFilter !== "All" || typeFilter !== "All";
  const totalPages = Math.ceil(filteredRecords.length / pageSize);
  const paginatedRecords = isFilterActive
    ? filteredRecords
    : filteredRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const getPageNumbers = () => {
    const pages = [];
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, currentPage + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const stats = {
    TotalCount: records.length,
    ActiveCount: records.filter((r) => r.IsActive === 1).length,
    InactiveCount: records.filter((r) => r.IsActive === 0).length,
    TheoryCount: records.filter((r) => r.SubjectType === "THEORY").length,
    PracticalCount: records.filter((r) => r.SubjectType === "PRACTICAL").length,
  };

  // ── TABLE COLUMNS FOR FilteredTableComponent ──────────────────────────────
  const columns = [
    {
      key: "CourseID",
      header: "Course ID",
      width: "90px",
      headerClassName: "text-center",
      className: "text-center font-mono",
    },
    { key: "CourseCode", header: "Course Code", className: "font-mono text-blue-600 font-semibold" },
    { key: "SubjectName", header: "Subject Name", className: "font-medium" },
    { key: "SubjectCode", header: "Subject Code", className: "font-mono" },
    {
      key: "SubjectType",
      header: "Type",
      headerClassName: "text-center",
      className: "text-center",
      sortable: false,
    },
    {
      key: "IsActive",
      header: "Status",
      headerClassName: "text-center",
      className: "text-center",
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
      case "SubjectType":
        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
            item.SubjectType === "THEORY"
              ? "bg-blue-50 border-blue-200 text-blue-700"
              : "bg-purple-50 border-purple-200 text-purple-700"
          }`}>
            {item.SubjectType === "THEORY" ? "📖" : "🔬"} {item.SubjectType}
          </span>
        );

      case "IsActive":
        return (
          <button
            onClick={() => toggleStatusInline(item)}
            disabled={actionLoading}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium border text-xs transition-all active:scale-95 disabled:opacity-50 ${
              item.IsActive === 1
                ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                : "bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100"
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${item.IsActive === 1 ? "bg-emerald-500" : "bg-rose-500"}`} />
            {item.IsActive === 1 ? "Active" : "Inactive"}
          </button>
        );

      case "actions":
        return (
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <button
              type="button"
              onClick={() => handleOpenPanel(item, true)}
              title="Edit"
              aria-label={`Edit ${item.SubjectName}`}
              className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-violet-600 bg-violet-50 hover:bg-violet-600 hover:text-white transition-all active:scale-95"
            >
              <EditIcon />
            </button>
            <button
              type="button"
              onClick={() => handleDelete(item)}
              disabled={actionLoading}
              title="Delete"
              aria-label={`Delete ${item.SubjectName}`}
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
        <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-70 px-6 py-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className={`h-9 w-9 rounded-xl ${color} flex items-center justify-center font-bold shadow-md text-white`}>
              SC
            </div>
            <h1 className="text-md font-bold tracking-tight text-slate-900">
              Master Subject Course
            </h1>
          </div>
        </header>

        <div className="flex flex-1 relative overflow-hidden">
          <main className="flex-1 p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full">
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
              <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
                <div>
                  <p className="text-xs text-slate-500 font-medium">Total Records</p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.TotalCount.toLocaleString()}</h3>
                </div>
                <span className="p-2 bg-slate-100 rounded-lg text-xl">📊</span>
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
              <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
                <div>
                  <p className="text-xs text-blue-600 font-medium">Theory</p>
                  <h3 className="text-2xl font-bold text-blue-600 mt-1">{stats.TheoryCount.toLocaleString()}</h3>
                </div>
                <span className="p-2 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold">📖</span>
              </div>
              <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
                <div>
                  <p className="text-xs text-purple-600 font-medium">Practical</p>
                  <h3 className="text-2xl font-bold text-purple-600 mt-1">{stats.PracticalCount.toLocaleString()}</h3>
                </div>
                <span className="p-2 bg-purple-50 text-purple-700 rounded-lg text-xs font-bold">🔬</span>
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

              <div className="flex bg-slate-100 p-1 border border-slate-200 rounded-lg w-full md:w-fit">
                {["All", "THEORY", "PRACTICAL"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setTypeFilter(tab)}
                    className={`text-xs px-4 py-1.5 font-medium rounded-md transition-all w-full md:w-auto ${
                      typeFilter === tab
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {tab === "All" ? "All Types" : tab.charAt(0) + tab.slice(1).toLowerCase()}
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
                    placeholder="🔍 Search subject courses..."
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
              data={paginatedRecords}
              columns={columns}
              renderCell={renderCell}
              loading={loading}
              tableId="subject-course-table"
              emptyStateMessage="No subject course records found"
              emptyStateSubMessage="Try adjusting your search or filters"
            />

            {/* Pagination (kept outside FilteredTableComponent to preserve existing logic) */}
            {filteredRecords.length > 0 && !isFilterActive && (
              <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span>
                    Showing{" "}
                    <span className="font-semibold text-slate-700">
                      {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredRecords.length)}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-slate-700">{filteredRecords.length}</span>
                  </span>
                  <select
                    value={pageSize}
                    onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                    className="border border-slate-200 rounded-lg px-2 py-1 text-xs bg-white focus:outline-none focus:border-blue-400"
                  >
                    {[10, 25, 50, 100].map((s) => (
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
                          ? "bg-blue-600 border-blue-600 text-white shadow-sm"
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
                      {isEditing ? "✏️ Edit Subject Course" : "✨ Add New Subject Course"}
                    </h3>
                    <p className="text-xs text-violet-100 mt-0.5">
                      {isEditing ? "Update the subject course record below" : "Fill in all fields to create a new subject course"}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsPanelOpen(false)}
                    className="opacity-80 hover:opacity-100 text-xl p-2 hover:bg-white/20 rounded-lg transition-all"
                  >✕</button>
                </div>

                <form onSubmit={handleFormSubmit} className="p-6 flex-1 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Record ID — read-only */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Record ID
                        <span className="text-slate-400 font-normal ml-1">
                          {isEditing ? "(RO)" : "(auto)"}
                        </span>
                      </label>
                      <input
                        type="text"
                        value={isEditing ? currentRecord.SubjectCourseID : "Auto-generated"}
                        disabled
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-mono bg-slate-50 text-slate-500 cursor-not-allowed"
                      />
                    </div>

                    {/* Course ID */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Course ID <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={currentRecord.CourseID ?? ""}
                        onChange={setNumField("CourseID")}
                        placeholder="e.g., 101"
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all placeholder:text-slate-300"
                      />
                    </div>

                    {/* Course Code */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Course Code <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={currentRecord.CourseCode ?? ""}
                        onChange={setField("CourseCode")}
                        placeholder="e.g., 101101"
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all placeholder:text-slate-300"
                      />
                    </div>

                    {/* Subject Name */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Subject Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={currentRecord.SubjectName ?? ""}
                        onChange={setField("SubjectName")}
                        placeholder="e.g., Computer Fundamentals"
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all placeholder:text-slate-300"
                      />
                    </div>

                    {/* Subject Code */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Subject Code <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={currentRecord.SubjectCode ?? ""}
                        onChange={setField("SubjectCode")}
                        placeholder="e.g., 10110121"
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all placeholder:text-slate-300"
                      />
                    </div>

                    {/* Subject Type */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Subject Type <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={currentRecord.SubjectType ?? "THEORY"}
                        onChange={setField("SubjectType")}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all appearance-none cursor-pointer bg-white"
                      >
                        {SUBJECT_TYPES.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>

                    {/* IsActive Toggle */}
                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl col-span-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-semibold text-slate-800 block select-none">Status</label>
                          <span className="text-[11px] text-slate-500 block mt-0.5">
                            {currentRecord.IsActive === 1 ? "Active & visible" : "Disabled & hidden"}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCurrentRecord((p) => ({ ...p, IsActive: p.IsActive === 1 ? 0 : 1 }))}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 shrink-0 ${
                            currentRecord.IsActive === 1 ? "bg-violet-600" : "bg-slate-300"
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                            currentRecord.IsActive === 1 ? "translate-x-6" : "translate-x-1"
                          }`} />
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
                          ["ID", isEditing ? `#${currentRecord.SubjectCourseID}` : "Auto-generated"],
                          ["Course ID", currentRecord.CourseID || "—"],
                          ["Course Code", currentRecord.CourseCode || "—"],
                          ["Subject Name", currentRecord.SubjectName || "—"],
                          ["Subject Code", currentRecord.SubjectCode || "—"],
                          ["Type", currentRecord.SubjectType || "—"],
                        ].map(([label, val]) => (
                          <div key={label} className="flex justify-between text-sm py-1 border-b border-violet-100">
                            <span className="text-slate-500">{label}</span>
                            <span className="font-mono font-semibold text-slate-800 text-right max-w-[60%] truncate">{val}</span>
                          </div>
                        ))}
                        <div className="flex justify-between text-sm py-1 col-span-2">
                          <span className="text-slate-500">Status</span>
                          <span className={`font-semibold ${currentRecord.IsActive === 1 ? "text-emerald-600" : "text-rose-600"}`}>
                            {currentRecord.IsActive === 1 ? "Active" : "Inactive"}
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
                    {isEditing ? "💾 Save Changes" : "➕ Add Subject Course"}
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