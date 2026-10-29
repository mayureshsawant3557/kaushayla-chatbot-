import React, { useState, useEffect, useCallback, useMemo, useContext } from "react";
import { MasterTableService } from "../../lib/services/MasterTableService";
import FilteredTableComponent from "../../Component/formcomponent/FilteredTableComponent";
import { ThemeContext } from "../../Component/Context/ThemeContext";
import Loader from "../../Component/formcomponent/Loader";

const EMPTY_FORM = {
  ID:                    null,
  FirstName:             "",
  MiddleName:            "",
  LastName:              "",
  CandidateProfileID:    "",
  PhotoPath:             "",
  CourseID:              null,
  InstituteID:           null,
  PassingYearID:         null,
  PresentDesignation:    "",
  PresentOrganization:   "",
  SelectionYearID:       null,
  SelectionYear:         "",
  IsPublished:           false,
  IsProfile:             false,
  DocumentPath:          "",
  CandidateMobileNo:     "",
  IsActive:              true,
};

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// ── Helpers ───────────────────────────────────────────────────────────────────
const fullName = (item) =>
  [item.FirstName, item.MiddleName, item.LastName].filter(Boolean).join(" ") || "—";

const normalise = (raw) =>
  raw.map((item, i) => ({
    _rowKey:                 `row-${i}`,
    ID:                      item.ID != null ? Number(item.ID) : null,
    FirstName:               item.FirstName ?? "",
    MiddleName:              item.MiddleName ?? "",
    LastName:                item.LastName ?? "",
    CandidateProfileID:      item.CandidateProfileID ?? "",
    PhotoPath:               item.PhotoPath ?? "",
    CourseID:                item.CourseID != null ? Number(item.CourseID) : null,
    InstituteID:             item.InstituteID != null ? Number(item.InstituteID) : null,
    PassingYearID:           item.PassingYearID != null ? Number(item.PassingYearID) : null,
    PresentDesignation:      item.PresentDesignation ?? "",
    PresentOrganization:     item.PresentOrganization ?? "",
    SelectionYearID:         item.SelectionYearID != null ? Number(item.SelectionYearID) : null,
    SelectionYear:           item.SelectionYear ?? "",
    IsPublished:             item.IsPublished === true || item.IsPublished === 1,
    IsActive:                item.IsActive === true || item.IsActive === 1,
    CreatedDateTime:         item.CreatedDateTime ?? null,
    CreatedBy:               item.CreatedBy ?? "",
    CreatedByIPAddress:      item.CreatedByIPAddress ?? "",
    ModifiedDateTime:        item.ModifiedDateTime ?? null,
    ModifiedBy:              item.ModifiedBy ?? "",
    ModifiedByIPAddress:     item.ModifiedByIPAddress ?? "",
    DocumentPath:            item.DocumentPath ?? "",
    IsProfile:               item.IsProfile === true || item.IsProfile === 1,
    CandidateMobileNo:       item.CandidateMobileNo ?? "",
  }));

const buildInsertPayload = (form) => ({
  FirstName:             (form.FirstName ?? "").trim(),
  MiddleName:            (form.MiddleName ?? "").trim(),
  LastName:              (form.LastName ?? "").trim(),
  CandidateProfileID:    (form.CandidateProfileID ?? "").trim(),
  PhotoPath:             (form.PhotoPath ?? "").trim(),
  CourseID:              form.CourseID === "" || form.CourseID === null ? null : Number(form.CourseID),
  InstituteID:           form.InstituteID === "" || form.InstituteID === null ? null : Number(form.InstituteID),
  PassingYearID:         form.PassingYearID === "" || form.PassingYearID === null ? null : Number(form.PassingYearID),
  PresentDesignation:    (form.PresentDesignation ?? "").trim(),
  PresentOrganization:   (form.PresentOrganization ?? "").trim(),
  SelectionYearID:       form.SelectionYearID === "" || form.SelectionYearID === null ? null : Number(form.SelectionYearID),
  SelectionYear:         (form.SelectionYear ?? "").trim(),
  IsPublished:           form.IsPublished === true || form.IsPublished === 1,
  IsProfile:             form.IsProfile === true || form.IsProfile === 1,
  DocumentPath:          (form.DocumentPath ?? "").trim(),
  CandidateMobileNo:     (form.CandidateMobileNo ?? "").trim(),
  IsActive:              form.IsActive === true || form.IsActive === 1,
});

const buildUpdatePayload = (form) => ({
  ID: Number(form.ID),
  ...buildInsertPayload(form),
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

export default function MasterSuccessStories() {
  const { color } = useContext(ThemeContext); // e.g. "bg-[#002060]" — drives the SS avatar below

  const [stories, setStories]             = useState([]);
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

  // ── Auth Check ──────────────────────────────────────────────────────────────
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
  const fetchStories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await MasterTableService.getAllSuccessStories();
      const raw = data?.Data ?? data?.data ?? (Array.isArray(data) ? data : []);
      setStories(normalise(raw));
    } catch (err) {
      showError(
        err?.response?.data?.Message ||
        err?.response?.data?.message ||
        err.message ||
        "Failed to load success stories"
      );
      setStories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStories(); }, [fetchStories]);
  useEffect(() => { setCurrentPage(1); }, [searchTerm, selectedFilter]);

  // ── INSERT ────────────────────────────────────────────────────────────────
  const handleInsert = async (form) => {
    setActionLoading(true);
    try {
      const response = await MasterTableService.insertSuccessStory(buildInsertPayload(form));
      showSuccess(
        response?.Data?.Message ||
        response?.message ||
        response?.data?.message ||
        "Success story added successfully"
      );
      setIsPanelOpen(false);
      await fetchStories();
    } catch (err) {
      showError(
        err?.response?.data?.Message ||
        err?.response?.data?.message ||
        err.message ||
        "Failed to add success story"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ── UPDATE ────────────────────────────────────────────────────────────────
  const handleUpdate = async (form) => {
    setActionLoading(true);
    try {
      const data = await MasterTableService.updateSuccessStory(buildUpdatePayload(form));
      showSuccess(
        data?.Data?.Message ||
        data?.message ||
        data?.data?.message ||
        "Success story updated successfully"
      );
      setIsPanelOpen(false);
      await fetchStories();
    } catch (err) {
      showError(
        err?.response?.data?.Message ||
        err?.response?.data?.message ||
        err.message ||
        "Failed to update success story"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ── DELETE ────────────────────────────────────────────────────────────────
  const handleDelete = async (item) => {
    if (!window.confirm(`Delete success story for "${fullName(item)}" (ID ${item.ID})?`)) return;
    setActionLoading(true);
    try {
      const data = await MasterTableService.softDeleteSuccessStory(Number(item.ID));
      showSuccess(
        data?.message ||
        data?.Data?.Message ||
        "Success story deleted successfully"
      );
      await fetchStories();
    } catch (err) {
      showError(
        err?.response?.data?.Message ||
        err?.response?.data?.message ||
        "Failed to delete success story"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ── TOGGLE STATUS ─────────────────────────────────────────────────────────
  const toggleStatusInline = async (item) => {
    const updated = { ...item, IsActive: !item.IsActive };
    setStories((prev) =>
      prev.map((s) => (s._rowKey === item._rowKey ? updated : s))
    );
    try {
      await MasterTableService.updateSuccessStory(buildUpdatePayload(updated));
      showSuccess(`Status updated to ${updated.IsActive ? "Active" : "Inactive"}`);
    } catch (err) {
      setStories((prev) =>
        prev.map((s) => (s._rowKey === item._rowKey ? item : s))
      );
      showError(
        err?.response?.data?.Message ||
        err?.response?.data?.message ||
        "Failed to update status"
      );
    }
  };

  // ── TOGGLE PUBLISH ────────────────────────────────────────────────────────
  const togglePublishInline = async (item) => {
    const updated = { ...item, IsPublished: !item.IsPublished };
    setStories((prev) =>
      prev.map((s) => (s._rowKey === item._rowKey ? updated : s))
    );
    try {
      await MasterTableService.updateSuccessStory(buildUpdatePayload(updated));
      showSuccess(`${updated.IsPublished ? "Published" : "Unpublished"}`);
    } catch (err) {
      setStories((prev) =>
        prev.map((s) => (s._rowKey === item._rowKey ? item : s))
      );
      showError(
        err?.response?.data?.Message ||
        err?.response?.data?.message ||
        "Failed to update publish state"
      );
    }
  };

  // ── TOGGLE PROFILE ────────────────────────────────────────────────────────
  const toggleProfileInline = async (item) => {
    const updated = { ...item, IsProfile: !item.IsProfile };
    setStories((prev) =>
      prev.map((s) => (s._rowKey === item._rowKey ? updated : s))
    );
    try {
      await MasterTableService.updateSuccessStory(buildUpdatePayload(updated));
      showSuccess(`${updated.IsProfile ? "Marked as" : "Removed from"} Profile`);
    } catch (err) {
      setStories((prev) =>
        prev.map((s) => (s._rowKey === item._rowKey ? item : s))
      );
      showError(
        err?.response?.data?.Message ||
        err?.response?.data?.message ||
        "Failed to update profile state"
      );
    }
  };

  // ── FORM SUBMIT ───────────────────────────────────────────────────────────
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!currentRecord.FirstName?.trim()) { showError("First Name is required"); return; }
    if (!currentRecord.LastName?.trim())  { showError("Last Name is required"); return; }
    if (!currentRecord.CandidateProfileID?.trim()) { showError("Candidate Profile ID is required"); return; }
    isEditing ? handleUpdate(currentRecord) : handleInsert(currentRecord);
  };

  const handleOpenPanel = (record = EMPTY_FORM, editMode = false) => {
    setCurrentRecord({
      ...EMPTY_FORM,
      ...record,
      IsActive: record.IsActive ?? true,
      IsPublished: record.IsPublished ?? false,
      IsProfile: record.IsProfile ?? false,
    });
    setIsEditing(editMode);
    setIsPanelOpen(true);
  };

  const set = (field) => (e) => {
    const val = e?.target?.type === "checkbox" ? e.target.checked : e.target.value;
    setCurrentRecord((p) => ({ ...p, [field]: val }));
  };

  const setNumber = (field) => (e) => {
    const val = e.target.value;
    setCurrentRecord((p) => ({ ...p, [field]: val === "" ? null : Number(val) }));
  };

  // ── FILTERING ─────────────────────────────────────────────────────────────
  const filteredStories = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return stories.filter((s) => {
      const matchStatus =
        selectedFilter === "All"         ? true :
        selectedFilter === "Active"      ? s.IsActive :
        selectedFilter === "Inactive"    ? !s.IsActive :
        selectedFilter === "Published"   ? s.IsPublished :
        selectedFilter === "Unpublished" ? !s.IsPublished : true;

      const matchSearch = term
        ? [
            s.ID,
            s.FirstName,
            s.MiddleName,
            s.LastName,
            s.CandidateProfileID,
            s.PresentDesignation,
            s.PresentOrganization,
            s.CandidateMobileNo,
            s.SelectionYear,
            s.IsPublished ? "published" : "draft",
            s.IsActive ? "active" : "inactive",
            s.IsProfile ? "profile" : "",
          ]
            .filter((v) => v !== null && v !== undefined && v !== "")
            .some((v) => String(v).toLowerCase().includes(term))
        : true;

      return matchStatus && matchSearch;
    });
  }, [stories, searchTerm, selectedFilter]);

  const isFilterActive = searchTerm !== "" || selectedFilter !== "All";
  const totalPages     = Math.ceil(filteredStories.length / pageSize);
  const paginatedStories = isFilterActive
    ? filteredStories
    : filteredStories.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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
    Total:       stories.length,
    Published:   stories.filter((s) => s.IsPublished).length,
    Unpublished: stories.filter((s) => !s.IsPublished).length,
    Inactive:    stories.filter((s) => !s.IsActive).length,
  };

  // ── TABLE COLUMNS FOR FilteredTableComponent ──────────────────────────────
  const columns = [
    {
      key: "ID",
      header: "ID",
      width: "60px",
      headerClassName: "text-center",
      className: "text-center font-mono",
    },
    {
      key: "Name",
      header: "Name",
      className: "font-medium",
    },
    {
      key: "CandidateProfileID",
      header: "Profile ID",
      className: "font-mono text-xs",
    },
    {
      key: "CourseID",
      header: "Course",
      className: "font-mono text-xs",
    },
    {
      key: "InstituteID",
      header: "Institute",
      className: "font-mono text-xs",
    },
    {
      key: "PassingYearID",
      header: "Passing Year",
      className: "font-mono text-xs",
    },
    {
      key: "PresentDesignation",
      header: "Designation",
      className: "text-xs",
    },
    {
      key: "PresentOrganization",
      header: "Organization",
      className: "text-xs",
    },
    {
      key: "SelectionYear",
      header: "Selection Year",
      className: "text-xs",
    },
    {
      key: "CandidateMobileNo",
      header: "Mobile",
      className: "font-mono text-xs",
    },
    {
      key: "IsProfile",
      header: "Profile",
      headerClassName: "text-center",
      className: "text-center",
      sortable: false,
    },
    {
      key: "IsPublished",
      header: "Published",
      headerClassName: "text-center",
      className: "text-center",
      sortable: false,
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

  const renderStoryCell = (item, column) => {
    switch (column.key) {
      case "ID":
        return item.ID !== null ? `#${item.ID}` : "—";

      case "Name":
        return (
          <span className="text-slate-800 font-medium whitespace-nowrap">
            {fullName(item)}
            {item.IsProfile && (
              <span className="ml-2 text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full align-middle">PROFILE</span>
            )}
          </span>
        );

      case "IsProfile":
        return (
          <button
            onClick={() => toggleProfileInline(item)}
            disabled={actionLoading}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium border text-xs transition-all active:scale-95 disabled:opacity-50 ${
              item.IsProfile
                ? "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
            }`}
          >
            {item.IsProfile ? "Yes" : "No"}
          </button>
        );

      case "IsPublished":
        return (
          <button
            onClick={() => togglePublishInline(item)}
            disabled={actionLoading}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium border text-xs transition-all active:scale-95 disabled:opacity-50 ${
              item.IsPublished
                ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                : "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${item.IsPublished ? "bg-emerald-500" : "bg-amber-500"}`} />
            {item.IsPublished ? "Published" : "Draft"}
          </button>
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
        return (
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <button
              type="button"
              onClick={() => handleOpenPanel(item, true)}
              title="Edit"
              aria-label={`Edit ${fullName(item)}`}
              className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-violet-600 bg-violet-50 hover:bg-violet-600 hover:text-white transition-all active:scale-95"
            >
              <EditIcon />
            </button>
            <button
              type="button"
              onClick={() => handleDelete(item)}
              disabled={actionLoading}
              title="Delete"
              aria-label={`Delete ${fullName(item)}`}
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
            <div
              className={`h-9 w-9 rounded-xl ${color} flex items-center justify-center font-bold shadow-md text-white`}
            >
              SS
            </div>
            <h1 className="text-md font-bold tracking-tight text-slate-900">
              Master Success Stories
            </h1>
          </div>
        </header>

        <div className="flex flex-1 relative overflow-hidden">
          <main className="flex-1 p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full">
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
                <div>
                  <p className="text-xs text-slate-500 font-medium">
                    Total Stories
                  </p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">
                    {stats.Total.toLocaleString()}
                  </h3>
                </div>
                <span className="p-2 bg-slate-100 rounded-lg text-xl">🏆</span>
              </div>
              <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
                <div>
                  <p className="text-xs text-emerald-600 font-medium">
                    Published
                  </p>
                  <h3 className="text-2xl font-bold text-emerald-600 mt-1">
                    {stats.Published.toLocaleString()}
                  </h3>
                </div>
                <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold">● Live</span>
              </div>
              <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
                <div>
                  <p className="text-xs text-amber-600 font-medium">
                    Unpublished
                  </p>
                  <h3 className="text-2xl font-bold text-amber-600 mt-1">
                    {stats.Unpublished.toLocaleString()}
                  </h3>
                </div>
                <span className="p-2 bg-amber-50 rounded-lg text-xl">📝</span>
              </div>
              <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
                <div>
                  <p className="text-xs text-rose-500 font-medium">
                    Inactive
                  </p>
                  <h3 className="text-2xl font-bold text-rose-500 mt-1">
                    {stats.Inactive.toLocaleString()}
                  </h3>
                </div>
                <span className="px-2 py-1 bg-rose-50 text-rose-600 rounded-lg text-xs font-bold">● Off</span>
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
                {["All", "Active", "Inactive", "Published", "Unpublished"].map((tab) => (
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
                  <input
                    type="text"
                    placeholder="🔍 Search success stories..."
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
              data={filteredStories}
              columns={columns}
              renderCell={renderStoryCell}
              loading={loading}
              tableId="success-stories-table"
              emptyStateMessage="No success stories found"
              emptyStateSubMessage="Try adjusting your search or filters"
            />
          </main>

          {/* ── Modal ── */}
          {isPanelOpen && (
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4 sm:p-8"
              onClick={() => setIsPanelOpen(false)}
            >
              <div
                className="bg-white border border-slate-200 shadow-2xl rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className={`p-5 border-b border-slate-200 flex items-center justify-between shrink-0 text-white ${color}`}>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {isEditing ? "✏️ Edit Success Story" : "✨ Add New Success Story"}
                    </h3>
                    <p className="text-xs text-indigo-100 mt-0.5">
                      {isEditing ? "Update the record below" : "Fill in the fields to create a new record"}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsPanelOpen(false)}
                    className="opacity-80 hover:opacity-100 text-xl p-2 hover:bg-white/20 rounded-lg transition-all"
                  >✕</button>
                </div>

                <form onSubmit={handleFormSubmit} className="p-6 flex-1 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4">
                    {/* ID — read-only */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        ID{" "}
                        <span className="text-slate-400 font-normal normal-case">
                          {isEditing ? "(RO)" : "(auto)"}
                        </span>
                      </label>
                      <input
                        type="text"
                        value={isEditing ? (currentRecord.ID !== null ? `#${currentRecord.ID}` : "—") : "Auto-generated"}
                        disabled
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-mono bg-slate-50 text-slate-500 cursor-not-allowed"
                      />
                    </div>

                    {/* First Name */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        First Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={currentRecord.FirstName}
                        onChange={set("FirstName")}
                        placeholder="e.g., Ganesh"
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all placeholder:text-slate-300"
                      />
                    </div>

                    {/* Middle Name */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Middle Name
                      </label>
                      <input
                        type="text"
                        value={currentRecord.MiddleName}
                        onChange={set("MiddleName")}
                        placeholder="e.g., Popat"
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all placeholder:text-slate-300"
                      />
                    </div>

                    {/* Last Name */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Last Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={currentRecord.LastName}
                        onChange={set("LastName")}
                        placeholder="e.g., Chothe"
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all placeholder:text-slate-300"
                      />
                    </div>

                    {/* Candidate Profile ID */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Candidate Profile ID <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={currentRecord.CandidateProfileID}
                        onChange={set("CandidateProfileID")}
                        placeholder="e.g., 202212C105817"
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-mono text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all placeholder:text-slate-300"
                      />
                    </div>

                    {/* Mobile No */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Mobile No
                      </label>
                      <input
                        type="text"
                        value={currentRecord.CandidateMobileNo}
                        onChange={set("CandidateMobileNo")}
                        placeholder="e.g., 9876543210"
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-mono text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all placeholder:text-slate-300"
                      />
                    </div>

                    {/* Course ID */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Course ID
                      </label>
                      <input
                        type="number"
                        value={currentRecord.CourseID ?? ""}
                        onChange={setNumber("CourseID")}
                        placeholder="e.g., 464"
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all placeholder:text-slate-300"
                      />
                    </div>

                    {/* Institute ID */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Institute ID
                      </label>
                      <input
                        type="number"
                        value={currentRecord.InstituteID ?? ""}
                        onChange={setNumber("InstituteID")}
                        placeholder="e.g., 10326"
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all placeholder:text-slate-300"
                      />
                    </div>

                    {/* Passing Year ID */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Passing Year ID
                      </label>
                      <input
                        type="number"
                        value={currentRecord.PassingYearID ?? ""}
                        onChange={setNumber("PassingYearID")}
                        placeholder="e.g., 1"
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all placeholder:text-slate-300"
                      />
                    </div>

                    {/* Present Designation */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Present Designation
                      </label>
                      <input
                        type="text"
                        value={currentRecord.PresentDesignation}
                        onChange={set("PresentDesignation")}
                        placeholder="e.g., TAX ASSISTANT"
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all placeholder:text-slate-300"
                      />
                    </div>

                    {/* Present Organization */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Present Organization
                      </label>
                      <input
                        type="text"
                        value={currentRecord.PresentOrganization}
                        onChange={set("PresentOrganization")}
                        placeholder="e.g., GOODS AND SERVICE TAX DEPARTMENT"
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all placeholder:text-slate-300"
                      />
                    </div>

                    {/* Selection Year */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Selection Year
                      </label>
                      <input
                        type="text"
                        value={currentRecord.SelectionYear}
                        onChange={set("SelectionYear")}
                        placeholder="e.g., 2023"
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all placeholder:text-slate-300"
                      />
                    </div>

                    {/* Selection Year ID */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Selection Year ID
                      </label>
                      <input
                        type="number"
                        value={currentRecord.SelectionYearID ?? ""}
                        onChange={setNumber("SelectionYearID")}
                        placeholder="e.g., 2023"
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all placeholder:text-slate-300"
                      />
                    </div>

                    {/* Photo Path */}
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Photo Path (URL)
                      </label>
                      <input
                        type="text"
                        value={currentRecord.PhotoPath}
                        onChange={set("PhotoPath")}
                        placeholder="https://msbsvet.blob.core.windows.net/..."
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all placeholder:text-slate-300"
                      />
                    </div>

                    {/* Document Path */}
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Document Path (URL)
                      </label>
                      <input
                        type="text"
                        value={currentRecord.DocumentPath}
                        onChange={set("DocumentPath")}
                        placeholder="https://msbsvet.blob.core.windows.net/..."
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all placeholder:text-slate-300"
                      />
                    </div>

                    {/* IsProfile Toggle */}
                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-semibold text-slate-800 block select-none">
                            Is Profile
                          </label>
                          <span className="text-[11px] text-slate-500 block mt-0.5">
                            {currentRecord.IsProfile ? "Featured as profile" : "Not featured"}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCurrentRecord((p) => ({ ...p, IsProfile: !p.IsProfile }))}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shrink-0 ${
                            currentRecord.IsProfile ? "bg-blue-600" : "bg-slate-300"
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                            currentRecord.IsProfile ? "translate-x-6" : "translate-x-1"
                          }`} />
                        </button>
                      </div>
                    </div>

                    {/* IsPublished Toggle */}
                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-semibold text-slate-800 block select-none">
                            Is Published
                          </label>
                          <span className="text-[11px] text-slate-500 block mt-0.5">
                            {currentRecord.IsPublished ? "Visible to public" : "Hidden as draft"}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCurrentRecord((p) => ({ ...p, IsPublished: !p.IsPublished }))}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 shrink-0 ${
                            currentRecord.IsPublished ? "bg-emerald-500" : "bg-slate-300"
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                            currentRecord.IsPublished ? "translate-x-6" : "translate-x-1"
                          }`} />
                        </button>
                      </div>
                    </div>

                    {/* IsActive Toggle */}
                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl col-span-2">
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
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 shrink-0 ${
                            currentRecord.IsActive ? "bg-violet-600" : "bg-slate-300"
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                            currentRecord.IsActive ? "translate-x-6" : "translate-x-1"
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
                          ["ID", isEditing ? (currentRecord.ID !== null ? `#${currentRecord.ID}` : "—") : "Auto"],
                          ["Name", fullName(currentRecord)],
                          ["Profile ID", currentRecord.CandidateProfileID || "—"],
                          ["Designation", currentRecord.PresentDesignation || "—"],
                          ["Organization", currentRecord.PresentOrganization || "—"],
                        ].map(([label, val]) => (
                          <div key={label} className="flex justify-between text-sm py-1 border-b border-violet-100">
                            <span className="text-slate-500">{label}</span>
                            <span className="font-mono font-semibold text-slate-800 text-right max-w-[60%] truncate">{val}</span>
                          </div>
                        ))}
                        <div className="flex justify-between text-sm py-1 border-b border-violet-100">
                          <span className="text-slate-500">Published</span>
                          <span className={`font-semibold ${currentRecord.IsPublished ? "text-emerald-600" : "text-amber-600"}`}>
                            {currentRecord.IsPublished ? "Published" : "Draft"}
                          </span>
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
                    {isEditing ? "💾 Save Changes" : "➕ Add Record"}
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