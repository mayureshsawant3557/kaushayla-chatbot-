import React, { useState, useEffect, useCallback, useContext } from "react";
import { MasterTableService } from "../../lib/services/MasterTableService";
import FilteredTableComponent from "../../Component/formcomponent/FilteredTableComponent";
import { ThemeContext } from "../../Component/Context/ThemeContext";

const EMPTY_FORM = {
  SeqNo: "",
  RegionID: "",
  ActivityName: "",
  ActivityDetails: "",
  ActivityStartDateTime: "",
  ActivityEndDateTime: "",
  IsActive: true,
  ModifiedDateTime: "",
  ModifiedBy: "",
  ModifiedByIPAddress: "",
};

// ── helpers ───────────────────────────────────────────────────────────────────
const toDatetimeLocal = (val) => {
  if (!val) return "";
  try {
    const d = new Date(val);
    if (isNaN(d)) return "";
    return d.toISOString().slice(0, 16);
  } catch {
    return "";
  }
};

const formatDisplay = (val) => {
  if (!val) return "—";
  try {
    return new Date(val).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return val;
  }
};

// editing=false → Insert (SeqNo=0), editing=true → Update (real SeqNo)
const buildPayload = (form, editing = false) => ({
  SeqNo: editing ? Number(form.SeqNo) : 0,
  RegionID: Number(form.RegionID) || 0,
  ActivityName: (form.ActivityName ?? "").trim(),
  ActivityDetails: (form.ActivityDetails ?? "").trim() || null,
  ActivityStartDateTime: form.ActivityStartDateTime || null,
  ActivityEndDateTime: form.ActivityEndDateTime || null,
  IsActive: form.IsActive === true || form.IsActive === 1,
  ModifiedBy: (form.ModifiedBy ?? "").trim() || null,
  ModifiedByIPAddress: (form.ModifiedByIPAddress ?? "").trim() || null,
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

export default function MasterActivityStatus() {
  const { color } = useContext(ThemeContext); 

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentActivity, setCurrentActivity] = useState(EMPTY_FORM);

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

  // ── FETCH ──────────────────────────────────────────────────────────────────
  const fetchActivities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await MasterTableService.getAllActivityStatuses();
      const raw = data?.Data ?? data?.data ?? (Array.isArray(data) ? data : []);
      setActivities(
        raw
          .filter((item) => Number(item.SeqNo ?? -2) > -1)
          .map((item) => ({
            SeqNo: Number(item.SeqNo),
            RegionID: item.RegionID ?? "",
            ActivityName: item.ActivityName ?? "",
            ActivityDetails: item.ActivityDetails ?? "",
            ActivityStartDateTime: item.ActivityStartDateTime ?? "",
            ActivityEndDateTime: item.ActivityEndDateTime ?? "",
            IsActive: item.IsActive === true || item.IsActive === 1,
            ModifiedDateTime: item.ModifiedDateTime ?? "",
            ModifiedBy: item.ModifiedBy ?? "",
            ModifiedByIPAddress: item.ModifiedByIPAddress ?? "",
          })),
      );
    } catch (err) {
      showError(
        err?.response?.data?.Message ||
          err?.response?.data?.message ||
          "Failed to load activity statuses",
      );
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  // ── INSERT ─────────────────────────────────────────────────────────────────
  const handleInsert = async (form) => {
    setActionLoading(true);
    try {
      const payload = buildPayload(form, false); // SeqNo = 0
      delete payload.SeqNo; // let backend auto-generate the key
      const response = await MasterTableService.insertActivityStatus(payload);
      showSuccess(
        response?.Data?.Message ||
          response?.message ||
          response?.data?.message ||
          "Activity added successfully",
      );
      setIsPanelOpen(false);
      await fetchActivities();
    } catch (err) {
      showError(
        err?.response?.data?.Message ||
          err?.response?.data?.message ||
          err.message ||
          "Failed to add activity",
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ── UPDATE ─────────────────────────────────────────────────────────────────
  const handleUpdate = async (form) => {
    setActionLoading(true);
    try {
      const payload = buildPayload(form, true); // SeqNo = real ID
      const data = await MasterTableService.updateActivityStatus(payload);
      showSuccess(
        data?.Data?.Message ||
          data?.message ||
          data?.data?.message ||
          "Activity updated successfully",
      );
      setIsPanelOpen(false);
      await fetchActivities();
    } catch (err) {
      showError(
        err?.response?.data?.Message ||
          err?.response?.data?.message ||
          err.message ||
          "Failed to update activity",
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ── DELETE ─────────────────────────────────────────────────────────────────
  const handleDelete = async (seqNo, activityName) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${activityName}" (SeqNo ${seqNo})?`,
      )
    )
      return;
    setActionLoading(true);
    try {
      const data = await MasterTableService.softDeleteActivityStatus(
        Number(seqNo),
      );
      showSuccess(
        data?.message || data?.Data?.Message || "Activity deleted successfully",
      );
      await fetchActivities();
    } catch (err) {
      showError(
        err?.response?.data?.Message ||
          err?.response?.data?.message ||
          "Failed to delete activity",
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ── TOGGLE STATUS ──────────────────────────────────────────────────────────
  const toggleStatusInline = async (item) => {
    const updated = { ...item, IsActive: !item.IsActive };
    setActivities((prev) =>
      prev.map((a) => (a.SeqNo === item.SeqNo ? updated : a)),
    );
    try {
      await MasterTableService.updateActivityStatus(
        buildPayload(updated, true),
      ); // editing=true
      showSuccess(`Status set to ${updated.IsActive ? "Active" : "Inactive"}`);
    } catch (err) {
      setActivities((prev) =>
        prev.map((a) => (a.SeqNo === item.SeqNo ? item : a)),
      );
      showError(
        err?.response?.data?.Message ||
          err?.response?.data?.message ||
          "Failed to update status",
      );
    }
  };

  // ── FORM SUBMIT ────────────────────────────────────────────────────────────
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!currentActivity.ActivityName?.trim()) {
      showError("Activity Name is required");
      return;
    }
    if (!currentActivity.ActivityStartDateTime) {
      showError("Start Date & Time is required");
      return;
    }
    if (!currentActivity.ActivityEndDateTime) {
      showError("End Date & Time is required");
      return;
    }
    if (
      new Date(currentActivity.ActivityStartDateTime) >
      new Date(currentActivity.ActivityEndDateTime)
    ) {
      showError("End Date must be after Start Date");
      return;
    }
    isEditing ? handleUpdate(currentActivity) : handleInsert(currentActivity);
  };

  // ── OPEN PANEL ─────────────────────────────────────────────────────────────
  const handleOpenPanel = (activity = EMPTY_FORM, editMode = false) => {
    setCurrentActivity({
      ...activity,
      SeqNo: editMode ? Number(activity.SeqNo) : "", // preserve real ID in edit
      RegionID:
        activity.RegionID !== "" && activity.RegionID != null
          ? Number(activity.RegionID)
          : "",
      IsActive: activity.IsActive ?? true,
      ActivityStartDateTime: toDatetimeLocal(activity.ActivityStartDateTime),
      ActivityEndDateTime: toDatetimeLocal(activity.ActivityEndDateTime),
    });
    setIsEditing(editMode);
    setIsPanelOpen(true);
  };

  // shorthand onChange helpers
  const set = (field) => (e) =>
    setCurrentActivity((p) => ({ ...p, [field]: e.target.value }));
  const toggle = (field) => () =>
    setCurrentActivity((p) => ({ ...p, [field]: !p[field] }));

  // ── STATUS TAB + SEARCH FILTER (sort/pagination/export live inside FilteredTableComponent) ──
  const statusFilteredActivities = activities
    .filter((a) => {
      if (selectedFilter === "Active") return a.IsActive;
      if (selectedFilter === "Inactive") return !a.IsActive;
      return true;
    })
    .filter((a) => {
      const term = searchTerm.trim().toLowerCase();
      if (!term) return true;
      return [
        a.SeqNo,
        a.RegionID,
        a.ActivityName,
        a.ActivityDetails,
        formatDisplay(a.ActivityStartDateTime),
        formatDisplay(a.ActivityEndDateTime),
        a.IsActive ? "active" : "inactive",
      ]
        .filter((v) => v !== null && v !== undefined)
        .some((v) => String(v).toLowerCase().includes(term));
    });

  const stats = {
    TotalCount: activities.length,
    ActiveCount: activities.filter((a) => a.IsActive).length,
    InactiveCount: activities.filter((a) => !a.IsActive).length,
  };

  // ── TABLE COLUMNS FOR FilteredTableComponent ──────────────────────────────
  const columns = [
    {
      key: "SeqNo",
      header: "Seq No",
      width: "90px",
      headerClassName: "text-center",
      className: "text-center font-mono",
    },
    {
      key: "RegionID",
      header: "Region ID",
      headerClassName: "text-center",
      className: "text-center font-mono",
    },
    { key: "ActivityName", header: "Activity Name", className: "font-medium" },
    { key: "ActivityDetails", header: "Details" },
    { key: "ActivityStartDateTime", header: "Start Date" },
    { key: "ActivityEndDateTime", header: "End Date" },
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

  const renderActivityCell = (item, column) => {
    switch (column.key) {
      case "ActivityDetails":
        return (
          <span
            className="block max-w-[220px] truncate"
            title={item.ActivityDetails}
          >
            {item.ActivityDetails || "—"}
          </span>
        );

      case "ActivityStartDateTime":
        return (
          <span className="text-xs whitespace-nowrap">
            {formatDisplay(item.ActivityStartDateTime)}
          </span>
        );

      case "ActivityEndDateTime":
        return (
          <span className="text-xs whitespace-nowrap">
            {formatDisplay(item.ActivityEndDateTime)}
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
        return (
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <button
              type="button"
              onClick={() => handleOpenPanel(item, true)}
              title="Edit"
              aria-label={`Edit ${item.ActivityName}`}
              className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-teal-600 bg-teal-50 hover:bg-teal-600 hover:text-white transition-all active:scale-95"
            >
              <EditIcon />
            </button>
            <button
              type="button"
              onClick={() => handleDelete(item.SeqNo, item.ActivityName)}
              disabled={actionLoading}
              title="Delete"
              aria-label={`Delete ${item.ActivityName}`}
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

  // ── RENDER ─────────────────────────────────────────────────────────────────
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
            A
          </div>
          <h1 className="text-md font-bold tracking-tight text-slate-900">
            Master Activity Status
          </h1>
        </div>
      </header>

      <div className="flex flex-1 relative overflow-hidden">
        <main className="flex-1 p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
              <div>
                <p className="text-xs text-slate-500 font-medium">
                  Total Activities
                </p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">
                  {stats.TotalCount.toLocaleString()}
                </h3>
              </div>
              <span className="p-2 bg-slate-100 rounded-lg text-xl">🗂️</span>
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
              <div>
                <p className="text-xs text-emerald-600 font-medium">
                  Active Activities
                </p>
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
                <p className="text-xs text-rose-600 font-medium">
                  Inactive Activities
                </p>
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
            <div className="flex gap-2 shrink-0"></div>

            <div className="flex-1 flex justify-center">
          
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
            data={statusFilteredActivities}
            columns={columns}
            renderCell={renderActivityCell}
            loading={loading}
            tableId="activity-status-table"
            emptyStateMessage="No activity records found"
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
                    {isEditing
                      ? "✏️ Edit Activity Status"
                      : "✨ Add New Activity Status"}
                  </h3>
                  <p className="text-xs text-teal-100 mt-0.5">
                    {isEditing
                      ? "Update the activity record below"
                      : "Fill in the fields to create a new activity"}
                  </p>
                </div>
                <button
                  onClick={() => setIsPanelOpen(false)}
                  className="text-white/80 hover:text-white text-xl p-2 hover:bg-white/20 rounded-lg transition-all"
                >
                  ✕
                </button>
              </div>

              <form
                onSubmit={handleFormSubmit}
                className="p-6 flex-1 overflow-y-auto"
              >
                <div className="grid grid-cols-2 gap-4">
                  {/* Seq No — only shown in edit mode */}
                  {isEditing && (
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Seq No{" "}
                        <span className="text-slate-400 font-normal ml-1">
                          (RO)
                        </span>
                      </label>
                      <input
                        type="number"
                        value={currentActivity.SeqNo}
                        disabled
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-mono bg-slate-50 text-slate-500 cursor-not-allowed"
                      />
                    </div>
                  )}

                  {/* Region ID */}
                  <div className={isEditing ? "" : "col-span-2"}>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      Region ID
                    </label>
                    <input
                      type="number"
                      value={currentActivity.RegionID}
                      onChange={set("RegionID")}
                      placeholder="e.g., 1"
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-mono text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all placeholder:text-slate-300"
                    />
                  </div>

                  {/* Activity Name */}
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      Activity Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={currentActivity.ActivityName}
                      onChange={set("ActivityName")}
                      placeholder="e.g., Orientation Week"
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all placeholder:text-slate-300"
                    />
                  </div>

                  {/* Activity Details */}
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      Activity Details
                    </label>
                    <textarea
                      rows={3}
                      value={currentActivity.ActivityDetails}
                      onChange={set("ActivityDetails")}
                      placeholder="Describe the activity..."
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all placeholder:text-slate-300 resize-none"
                    />
                  </div>

                  {/* Start DateTime */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      Start Date & Time <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={currentActivity.ActivityStartDateTime}
                      onChange={set("ActivityStartDateTime")}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
                    />
                  </div>

                  {/* End DateTime */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      End Date & Time <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={currentActivity.ActivityEndDateTime}
                      onChange={set("ActivityEndDateTime")}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
                    />
                  </div>

                  {/* IsActive Toggle */}
                  <div className="col-span-2 bg-slate-50 border border-slate-200 p-4 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-semibold text-slate-800 block select-none">
                          Status
                        </label>
                        <span className="text-xs text-slate-500 block mt-0.5">
                          {currentActivity.IsActive
                            ? "Record is active and visible"
                            : "Record is disabled and hidden"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={toggle("IsActive")}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 shrink-0 ${
                          currentActivity.IsActive
                            ? "bg-teal-600"
                            : "bg-slate-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                            currentActivity.IsActive
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                    <div className="mt-3">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 ${
                          currentActivity.IsActive
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${currentActivity.IsActive ? "bg-emerald-500" : "bg-rose-500"}`}
                        />
                        {currentActivity.IsActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>

                  {/* Record Preview */}
                  <div className="col-span-2 bg-gradient-to-br from-teal-50 to-cyan-100/50 border border-teal-200 rounded-xl p-4">
                    <p className="text-[10px] font-bold text-teal-600 uppercase tracking-wider mb-3 flex items-center gap-1">
                      <span>👁️</span> Record Preview
                    </p>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                      {[
                        [
                          "Seq No",
                          isEditing
                            ? currentActivity.SeqNo
                              ? `#${currentActivity.SeqNo}`
                              : "—"
                            : "Auto-generated",
                        ],
                        ["Region ID", currentActivity.RegionID || "—"],
                        ["Activity Name", currentActivity.ActivityName || "—"],
                        [
                          "Start",
                          currentActivity.ActivityStartDateTime
                            ? new Date(
                                currentActivity.ActivityStartDateTime,
                              ).toLocaleString("en-IN")
                            : "—",
                        ],
                        [
                          "End",
                          currentActivity.ActivityEndDateTime
                            ? new Date(
                                currentActivity.ActivityEndDateTime,
                              ).toLocaleString("en-IN")
                            : "—",
                        ],
                      ].map(([label, val]) => (
                        <div
                          key={label}
                          className="flex justify-between text-sm py-1 border-b border-teal-100"
                        >
                          <span className="text-slate-500">{label}</span>
                          <span className="font-mono font-semibold text-slate-800 text-right max-w-[60%] truncate">
                            {val}
                          </span>
                        </div>
                      ))}
                      <div className="flex justify-between text-sm py-1 col-span-2">
                        <span className="text-slate-500">Status</span>
                        <span
                          className={`font-semibold ${currentActivity.IsActive ? "text-emerald-600" : "text-rose-600"}`}
                        >
                          {currentActivity.IsActive ? "Active" : "Inactive"}
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