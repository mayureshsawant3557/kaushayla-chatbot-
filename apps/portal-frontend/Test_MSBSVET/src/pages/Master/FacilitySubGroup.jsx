import React, { useState, useEffect, useCallback, useMemo, useContext } from "react";
import { MasterTableService } from "../../lib/services/MasterTableService";
import FilteredTableComponent from "../../Component/formcomponent/FilteredTableComponent";
import { ThemeContext } from "../../Component/Context/ThemeContext";
import Loader from "../../Component/formcomponent/Loader";

const EMPTY_FORM = {
  FacilityGroupId:    "",
  SubFacilityGroupId: "",
  SubFacilityGroup:   "",
  RequiredNumber:     "",
  RequiredSpace:      "",
  HasMultiplyFactor:  0,
  IsActive:           1,
};

// ── helpers ──────────────────────────────────────────────────────────────────
const buildPayload = (form) => ({
  FacilityGroupId:    Number(form.FacilityGroupId) || 0,
  SubFacilityGroupId: Number(form.SubFacilityGroupId) || 0,
  SubFacilityGroup:   (form.SubFacilityGroup ?? "").trim(),
  RequiredNumber:     Number(form.RequiredNumber) || 0,
  RequiredSpace:      Number(form.RequiredSpace) || 0,
  HasMultiplyFactor:  form.HasMultiplyFactor === true || form.HasMultiplyFactor === 1,
  IsActive:           form.IsActive === true || form.IsActive === 1,
});

const normalise = (raw) =>
  raw.map((item, i) => ({
    _rowKey:             `row-${i}`,
    FacilityGroupId:     Number(item.FacilityGroupId) || 0,
    SubFacilityGroupId:  Number(item.SubFacilityGroupId) || 0,
    SubFacilityGroup:    item.SubFacilityGroup ?? "",
    RequiredNumber:      item.RequiredNumber != null ? Number(item.RequiredNumber) : 0,
    RequiredSpace:       item.RequiredSpace != null ? Number(item.RequiredSpace) : 0,
    HasMultiplyFactor:   item.HasMultiplyFactor != null ? Number(item.HasMultiplyFactor) : 0,
    IsActive:            item.IsActive != null ? Number(item.IsActive) : 1,
  }));

const normaliseGroups = (raw) =>
  raw.map((item) => ({
    FacilityGroupId: Number(item.FacilityGroupId) || 0,
    FacilityGroup:   item.FacilityGroup ?? "",
  }));

// ── small inline icons ─────────────────────────────────────────────────────
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

export default function MasterFacilitySubGroup() {
  const { color } = useContext(ThemeContext);

  const [records, setRecords] = useState([]);
  const [facilityGroups, setFacilityGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

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

  // ── FETCH: sub-facility groups ───────────────────────────────────────────
  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await MasterTableService.getAllFacilitySubGroups();
      const raw = data?.Data ?? data?.data ?? (Array.isArray(data) ? data : []);
      setRecords(normalise(raw));
    } catch (err) {
      showError(
        err?.response?.data?.Message ||
        err?.response?.data?.message ||
        "Failed to load facility sub groups"
      );
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── FETCH: parent facility groups (for dropdown + display) ──────────────
  const fetchFacilityGroups = useCallback(async () => {
    try {
      const data = await MasterTableService.getAllFacilityGroups();
      const raw = data?.Data ?? data?.data ?? (Array.isArray(data) ? data : []);
      setFacilityGroups(normaliseGroups(raw));
    } catch (err) {
      showError(
        err?.response?.data?.Message ||
        err?.response?.data?.message ||
        "Failed to load facility groups"
      );
      setFacilityGroups([]);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
    fetchFacilityGroups();
  }, [fetchRecords, fetchFacilityGroups]);

  const groupNameById = useMemo(() => {
    const map = {};
    facilityGroups.forEach((g) => { map[g.FacilityGroupId] = g.FacilityGroup; });
    return map;
  }, [facilityGroups]);

  // ── NEXT ID (client-side derived, non-IDENTITY PK) ───────────────────────
  const nextSubGroupId = useMemo(() => {
    if (!records || records.length === 0) return 1;
    const maxId = Math.max(...records.map((r) => Number(r.SubFacilityGroupId) || 0));
    return maxId + 1;
  }, [records]);

  // ── INSERT ────────────────────────────────────────────────────────────────
  const handleInsert = async (form) => {
    setActionLoading(true);
    try {
      const payload = buildPayload(form);
      const response = await MasterTableService.insertFacilitySubGroup(payload);
      showSuccess(
        response?.Data?.Message ||
        response?.message ||
        response?.data?.message ||
        "Facility sub group added successfully"
      );
      setIsPanelOpen(false);
      await fetchRecords();
    } catch (err) {
      showError(
        err?.response?.data?.Message ||
        err?.response?.data?.message ||
        err.message ||
        "Failed to add facility sub group"
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
      const data = await MasterTableService.updateFacilitySubGroup(payload);
      showSuccess(
        data?.Data?.Message ||
        data?.message ||
        data?.data?.message ||
        "Facility sub group updated successfully"
      );
      setIsPanelOpen(false);
      await fetchRecords();
    } catch (err) {
      showError(
        err?.response?.data?.Message ||
        err?.response?.data?.message ||
        err.message ||
        "Failed to update facility sub group"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ── DELETE ────────────────────────────────────────────────────────────────
  const handleDelete = async (subGroupId, subGroupName) => {
    if (!subGroupId) { showError("Missing ID for deletion"); return; }
    if (!window.confirm(`Are you sure you want to delete "${subGroupName}"?`)) return;
    setActionLoading(true);
    try {
      const data = await MasterTableService.softDeleteFacilitySubGroup(Number(subGroupId));
      showSuccess(data?.message || data?.Data?.Message || "Facility sub group deleted successfully");
      await fetchRecords();
    } catch (err) {
      showError(
        err?.response?.data?.Message ||
        err?.response?.data?.message ||
        "Failed to delete facility sub group"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ── TOGGLE STATUS ─────────────────────────────────────────────────────────
  const toggleStatusInline = async (item) => {
    const updated = { ...item, IsActive: item.IsActive ? 0 : 1 };
    setRecords((prev) =>
      prev.map((r) => (r._rowKey === item._rowKey ? updated : r))
    );
    try {
      const payload = buildPayload(updated);
      await MasterTableService.updateFacilitySubGroup(payload);
      showSuccess(`Status updated to ${updated.IsActive ? "Active" : "Inactive"}`);
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
    if (!currentRecord.SubFacilityGroup?.trim()) {
      showError("Sub Facility Group Name is required");
      return;
    }
    if (!currentRecord.FacilityGroupId) {
      showError("Facility Group is required");
      return;
    }
    isEditing ? handleUpdate(currentRecord) : handleInsert(currentRecord);
  };

  const handleOpenPanel = (record = EMPTY_FORM, editMode = false) => {
    setCurrentRecord({
      ...record,
      SubFacilityGroupId: editMode ? record.SubFacilityGroupId : nextSubGroupId,
      HasMultiplyFactor:  record.HasMultiplyFactor ?? 0,
      IsActive:           record.IsActive ?? 1,
    });
    setIsEditing(editMode);
    setIsPanelOpen(true);
  };

  // ── FILTERING ─────────────────────────────────────────────────────────────
  const filteredRecords = records.filter((r) => {
    const matchStatus =
      selectedFilter === "All"    ? true :
      selectedFilter === "Active" ? r.IsActive === 1 : r.IsActive === 0;

    const term = searchTerm.trim().toLowerCase();
    const matchSearch = term
      ? [
          r.SubFacilityGroupId,
          r.SubFacilityGroup,
          groupNameById[r.FacilityGroupId],
          r.IsActive === 1 ? "active" : "inactive",
        ]
          .filter((v) => v !== null && v !== undefined)
          .some((v) => String(v).toLowerCase().includes(term))
      : true;

    return matchStatus && matchSearch;
  });

  const stats = {
    TotalCount:    records.length,
    ActiveCount:   records.filter((r) => r.IsActive === 1).length,
    InactiveCount: records.filter((r) => r.IsActive === 0).length,
  };

  // ── TABLE COLUMNS FOR FilteredTableComponent ──────────────────────────────
  const columns = [
    {
      key: "SubFacilityGroupId",
      header: "ID",
      width: "80px",
      headerClassName: "text-center",
      className: "text-center font-mono",
    },
    {
      key: "FacilityGroupId",
      header: "Facility Group",
      className: "text-slate-600",
    },
    {
      key: "SubFacilityGroup",
      header: "Sub Facility Group",
      className: "font-medium",
    },
    {
      key: "RequiredNumber",
      header: "Req. Number",
      headerClassName: "text-center",
      className: "text-center font-mono",
      width: "100px",
    },
    {
      key: "RequiredSpace",
      header: "Req. Space",
      headerClassName: "text-center",
      className: "text-center font-mono",
      width: "100px",
    },
    {
      key: "HasMultiplyFactor",
      header: "Multiply Factor",
      sortable: false,
      width: "110px",
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
      case "FacilityGroupId":
        return <span>{groupNameById[item.FacilityGroupId] ?? `#${item.FacilityGroupId}`}</span>;

      case "RequiredSpace":
        return <span>{Number(item.RequiredSpace).toFixed(2)}</span>;

      case "HasMultiplyFactor":
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium border text-xs ${
              item.HasMultiplyFactor
                ? "bg-violet-50 border-violet-200 text-violet-700"
                : "bg-slate-50 border-slate-200 text-slate-500"
            }`}
          >
            {item.HasMultiplyFactor ? "Yes" : "No"}
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
              aria-label={`Edit ${item.SubFacilityGroup}`}
              className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-violet-600 bg-violet-50 hover:bg-violet-600 hover:text-white transition-all active:scale-95"
            >
              <EditIcon />
            </button>
            <button
              type="button"
              onClick={() => handleDelete(item.SubFacilityGroupId, item.SubFacilityGroup)}
              disabled={actionLoading}
              title="Delete"
              aria-label={`Delete ${item.SubFacilityGroup}`}
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
        <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className={`h-9 w-9 rounded-xl ${color} flex items-center justify-center font-bold shadow-md text-white text-sm`}>
              SFG
            </div>
            <h1 className="text-md font-bold tracking-tight text-slate-900">Master Facility Sub Group</h1>
          </div>
        </header>

        <div className="flex flex-1 relative overflow-hidden">
          <main className="flex-1 p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full">
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
                <div>
                  <p className="text-xs text-slate-500 font-medium">Total Sub Groups</p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.TotalCount.toLocaleString()}</h3>
                </div>
                <span className="p-2 bg-slate-100 rounded-lg text-xl">🏗️</span>
              </div>
              <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
                <div>
                  <p className="text-xs text-emerald-600 font-medium">Active Sub Groups</p>
                  <h3 className="text-2xl font-bold text-emerald-600 mt-1">{stats.ActiveCount.toLocaleString()}</h3>
                </div>
                <span className="p-2 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold">● Live</span>
              </div>
              <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
                <div>
                  <p className="text-xs text-rose-600 font-medium">Inactive Sub Groups</p>
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

            {/* Toolbar — Search and Add New Record */}
            <div className="flex items-center gap-3">
              <div className="flex-1 flex justify-center">
                {/* <div className="relative w-full max-w-sm">
                  <input
                    type="text"
                    placeholder="🔍 Search sub facility groups..."
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

            {/* Table - FilteredTableComponent handles everything */}
            <FilteredTableComponent
              data={filteredRecords}
              columns={columns}
              renderCell={renderCell}
              loading={loading}
              tableId="facility-sub-groups-table"
              emptyStateMessage="No facility sub groups found"
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
                      {isEditing ? "✏️ Edit Sub Facility Group" : "✨ Add New Sub Facility Group"}
                    </h3>
                    <p className="text-xs text-violet-100 mt-0.5">
                      {isEditing ? "Update the sub facility group record below" : "Fill in all fields to create a new sub facility group"}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsPanelOpen(false)}
                    className="opacity-80 hover:opacity-100 text-xl p-2 hover:bg-white/20 rounded-lg transition-all"
                  >✕</button>
                </div>

                <form onSubmit={handleFormSubmit} className="p-6 flex-1 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Sub Group ID */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Sub Group ID
                        <span className="text-slate-400 font-normal ml-1">
                          {isEditing ? "(RO)" : "(auto)"}
                        </span>
                      </label>
                      <input
                        type="text"
                        value={currentRecord.SubFacilityGroupId}
                        disabled
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-mono bg-slate-50 text-slate-500 cursor-not-allowed"
                      />
                    </div>

                    {/* Parent Facility Group */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Facility Group <span className="text-rose-500">*</span>
                      </label>
                      <select
                        required
                        value={currentRecord.FacilityGroupId}
                        onChange={(e) => setCurrentRecord({ ...currentRecord, FacilityGroupId: e.target.value })}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 bg-white focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all"
                      >
                        <option value="">Select group…</option>
                        {facilityGroups.map((g) => (
                          <option key={g.FacilityGroupId} value={g.FacilityGroupId}>
                            {g.FacilityGroup}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Sub Facility Group Name */}
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Sub Facility Group Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={currentRecord.SubFacilityGroup}
                        onChange={(e) => setCurrentRecord({ ...currentRecord, SubFacilityGroup: e.target.value })}
                        placeholder="e.g., Common Computer Lab"
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all placeholder:text-slate-300"
                      />
                    </div>

                    {/* Required Number */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Required Number
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={currentRecord.RequiredNumber}
                        onChange={(e) => setCurrentRecord({ ...currentRecord, RequiredNumber: e.target.value })}
                        placeholder="1"
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all placeholder:text-slate-300"
                      />
                    </div>

                    {/* Required Space */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Required Space (sq.m)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={currentRecord.RequiredSpace}
                        onChange={(e) => setCurrentRecord({ ...currentRecord, RequiredSpace: e.target.value })}
                        placeholder="20.00"
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all placeholder:text-slate-300"
                      />
                    </div>

                    {/* Has Multiply Factor Toggle */}
                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl col-span-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-semibold text-slate-800 block select-none">Has Multiply Factor</label>
                          <span className="text-[11px] text-slate-500 block mt-0.5">
                            {currentRecord.HasMultiplyFactor ? "Space scales with required number" : "Fixed space, no scaling"}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCurrentRecord({ ...currentRecord, HasMultiplyFactor: currentRecord.HasMultiplyFactor ? 0 : 1 })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 shrink-0 ${
                            currentRecord.HasMultiplyFactor ? "bg-violet-600" : "bg-slate-300"
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                            currentRecord.HasMultiplyFactor ? "translate-x-6" : "translate-x-1"
                          }`} />
                        </button>
                      </div>
                    </div>

                    {/* Status Toggle */}
                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl col-span-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-semibold text-slate-800 block select-none">Status</label>
                          <span className="text-[11px] text-slate-500 block mt-0.5">
                            {currentRecord.IsActive ? "Active & visible" : "Disabled & hidden"}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCurrentRecord({ ...currentRecord, IsActive: currentRecord.IsActive ? 0 : 1 })}
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
                          ["ID", `#${currentRecord.SubFacilityGroupId}`],
                          ["Facility Group", groupNameById[Number(currentRecord.FacilityGroupId)] || "—"],
                          ["Sub Group Name", currentRecord.SubFacilityGroup || "—"],
                          ["Req. Number", currentRecord.RequiredNumber || "—"],
                          ["Req. Space", currentRecord.RequiredSpace || "—"],
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
                    {isEditing ? "💾 Save Changes" : "➕ Add Sub Group"}
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