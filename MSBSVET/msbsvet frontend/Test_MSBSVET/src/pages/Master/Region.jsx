import React, { useState, useEffect, useCallback, useMemo, useContext } from "react";
import { MasterTableService } from "../../lib/services/MasterTableService";
import FilteredTableComponent from "../../Component/formcomponent/FilteredTableComponent";
import { ThemeContext } from "../../Component/Context/ThemeContext";
import Loader from "../../Component/formcomponent/Loader";

const EMPTY_FORM = {
  RegionID: "",
  Region: "",
  RegionMarathi: "",
  SeqNO: "",
  IsActive: true,
};

// ── helpers ──────────────────────────────────────────────────────────────────
const buildPayload = (form) => ({
  RegionID: Number(form.RegionID) || 0,
  Region: (form.Region ?? "").trim(),
  RegionMarathi: (form.RegionMarathi ?? "").trim(),
  SeqNO: form.SeqNO ? Number(form.SeqNO) : null,
  IsActive: form.IsActive === true || form.IsActive === 1,
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

export default function MasterRegion() {
  const { color } = useContext(ThemeContext);

  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentRegion, setCurrentRegion] = useState(EMPTY_FORM);

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
  const fetchRegions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await MasterTableService.getAllRegions();

      let rawData = [];
      if (Array.isArray(data)) {
        rawData = data;
      } else if (data?.Data) {
        rawData = data.Data;
      } else if (data?.data) {
        rawData = data.data;
      } else if (data?.result) {
        rawData = data.result;
      } else {
        rawData = [];
      }

      const mappedRegions = rawData.map((item) => ({
        RegionID: Number(item.RegionID ?? item.Id ?? 0),
        Region: item.Region ?? item.RegionName ?? item.Name ?? "",
        RegionMarathi: item.RegionMarathi ?? "",
        SeqNO: item.SeqNO ?? item.SeqNo ?? "",
        IsActive: item.IsActive === true || item.IsActive === 1 || item.isActive === true || item.isActive === 1,
      }));

      setRegions(mappedRegions);

    } catch (err) {
      showError(
        err?.response?.data?.Message ||
        err?.response?.data?.message ||
        err.message ||
        "Failed to load regions"
      );
      setRegions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRegions(); }, [fetchRegions]);
  useEffect(() => { setCurrentPage(1); }, [searchTerm, selectedFilter]);

  // ── NEXT ID (client-side derived) ────────────────────────────────────────
  const nextRegionId = useMemo(() => {
    if (!regions || regions.length === 0) return 1;
    const maxId = Math.max(...regions.map((r) => Number(r.RegionID) || 0));
    return maxId + 1;
  }, [regions]);

  // ── INSERT ────────────────────────────────────────────────────────────────
  const handleInsert = async (form) => {
    setActionLoading(true);
    try {
      const payload = buildPayload(form);
      const response = await MasterTableService.insertRegion(payload);
      showSuccess(
        response?.Data?.Message ||
        response?.message ||
        response?.data?.message ||
        "Region added successfully"
      );
      setIsPanelOpen(false);
      await fetchRegions();
    } catch (err) {
      showError(
        err?.response?.data?.Message ||
        err?.response?.data?.message ||
        err.message ||
        "Failed to add region"
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
      const data = await MasterTableService.updateRegion(payload);
      showSuccess(
        data?.Data?.Message ||
        data?.message ||
        data?.data?.message ||
        "Region updated successfully"
      );
      setIsPanelOpen(false);
      await fetchRegions();
    } catch (err) {
      showError(
        err?.response?.data?.Message ||
        err?.response?.data?.message ||
        err.message ||
        "Failed to update region"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ── DELETE ────────────────────────────────────────────────────────────────
  const handleDelete = async (regionID, regionName) => {
    if (!window.confirm(`Are you sure you want to delete "${regionName}"?`)) return;
    setActionLoading(true);
    try {
      const data = await MasterTableService.softDeleteRegion(regionID);
      showSuccess(data?.message || data?.Data?.Message || "Region deleted successfully");
      await fetchRegions();
    } catch (err) {
      showError(
        err?.response?.data?.Message ||
        err?.response?.data?.message ||
        "Failed to delete region"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ── TOGGLE STATUS ─────────────────────────────────────────────────────────
  const toggleStatusInline = async (item) => {
    const updated = { ...item, IsActive: !item.IsActive };
    setRegions((prev) =>
      prev.map((r) => (r.RegionID === item.RegionID ? updated : r))
    );
    try {
      const payload = buildPayload(updated);
      await MasterTableService.updateRegion(payload);
      showSuccess(`Status updated to ${updated.IsActive ? "Active" : "Inactive"}`);
    } catch (err) {
      setRegions((prev) =>
        prev.map((r) => (r.RegionID === item.RegionID ? item : r))
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
    if (!currentRegion.RegionID) { showError("Region ID is required"); return; }
    if (!currentRegion.Region?.trim()) { showError("Region Name is required"); return; }
    isEditing ? handleUpdate(currentRegion) : handleInsert(currentRegion);
  };

  const handleOpenPanel = (region = EMPTY_FORM, editMode = false) => {
    setCurrentRegion({
      ...region,
      RegionID: editMode ? region.RegionID : nextRegionId,
      IsActive: region.IsActive ?? true,
    });
    setIsEditing(editMode);
    setIsPanelOpen(true);
  };

  // ── FILTERING ─────────────────────────────────────────────────────────────
  const statusFilteredRegions = regions
    .filter((r) => {
      if (selectedFilter === "Active") return r.IsActive === true;
      if (selectedFilter === "Inactive") return r.IsActive === false;
      return true;
    })
    .filter((r) => {
      if (!searchTerm.trim()) return true;
      const q = searchTerm.trim().toLowerCase();
      return (
        String(r.RegionID).toLowerCase().includes(q) ||
        (r.Region && r.Region.toLowerCase().includes(q)) ||
        (r.RegionMarathi && r.RegionMarathi.toLowerCase().includes(q))
      );
    });

  const stats = {
    TotalCount: regions.length,
    ActiveCount: regions.filter((r) => r.IsActive === true).length,
    InactiveCount: regions.filter((r) => r.IsActive === false).length,
  };

  // ── TABLE COLUMNS FOR FilteredTableComponent ──────────────────────────────
  const columns = [
    {
      key: "RegionID",
      header: "Region ID",
      width: "90px",
      headerClassName: "text-center",
      className: "text-center font-mono",
    },
    { key: "Region", header: "Region Name", className: "font-medium" },
    { key: "RegionMarathi", header: "Region (Marathi)" },
    { key: "SeqNO", header: "Seq No", className: "text-center" },
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

  const renderRegionCell = (item, column) => {
    switch (column.key) {
      case "SeqNO":
        return item.SeqNO ? (
          <span className="font-mono px-2 py-1 rounded text-xs border bg-slate-100 border-slate-200 text-slate-600">
            {item.SeqNO}
          </span>
        ) : (
          <span className="text-slate-400">—</span>
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
              aria-label={`Edit ${item.Region}`}
              className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-violet-600 bg-violet-50 hover:bg-violet-600 hover:text-white transition-all active:scale-95"
            >
              <EditIcon />
            </button>
            <button
              type="button"
              onClick={() => handleDelete(item.RegionID, item.Region)}
              disabled={actionLoading}
              title="Delete"
              aria-label={`Delete ${item.Region}`}
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
        <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-70 px-6 py-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div
              className={`h-9 w-9 rounded-xl ${color} flex items-center justify-center font-bold shadow-md text-white`}
            >
              R
            </div>
            <h1 className="text-md font-bold tracking-tight text-slate-900">
              Master Region
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
                    Total Regions
                  </p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">
                    {stats.TotalCount.toLocaleString()}
                  </h3>
                </div>
                <span className="p-2 bg-slate-100 rounded-lg text-xl">🗺️</span>
              </div>
              <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
                <div>
                  <p className="text-xs text-emerald-600 font-medium">
                    Active Regions
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
                    Inactive Regions
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
                    onClick={() => {
                      setSelectedFilter(tab);
                      setCurrentPage(1);
                    }}
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
                    placeholder="🔍 Search regions..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
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
              data={statusFilteredRegions}
              columns={columns}
              renderCell={renderRegionCell}
              loading={loading}
              tableId="regions-table"
              emptyStateMessage="No regions found"
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
                        ? "✏️ Edit Region"
                        : "✨ Add New Region"}
                    </h3>
                    <p className="text-xs text-violet-100 mt-0.5">
                      {isEditing
                        ? "Update the region record below"
                        : "Fill in all fields to create a new region"}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsPanelOpen(false)}
                    className="opacity-80 hover:opacity-100 text-xl p-2 hover:bg-white/20 rounded-lg transition-all"
                  >✕</button>
                </div>

                <form
                  onSubmit={handleFormSubmit}
                  className="p-6 flex-1 overflow-y-auto"
                >
                  <div className="grid grid-cols-2 gap-4">
                    {/* Region ID */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Region ID
                        <span className="text-slate-400 font-normal ml-1">
                          {isEditing ? "(RO)" : "(auto)"}
                        </span>
                      </label>
                      <input
                        type="text"
                        value={currentRegion.RegionID}
                        disabled
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-mono bg-slate-50 text-slate-500 cursor-not-allowed"
                      />
                    </div>

                    {/* Region Name (English) */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Region Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={currentRegion.Region}
                        onChange={(e) => setCurrentRegion({ ...currentRegion, Region: e.target.value })}
                        placeholder="e.g., Mumbai, Pune, Nashik"
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all placeholder:text-slate-300"
                      />
                    </div>

                    {/* Region Name (Marathi) */}
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Region (Marathi)
                        <span className="text-slate-400 font-normal ml-1">(optional)</span>
                      </label>
                      <input
                        type="text"
                        value={currentRegion.RegionMarathi}
                        onChange={(e) => setCurrentRegion({ ...currentRegion, RegionMarathi: e.target.value })}
                        placeholder="e.g., मुंबई, पुणे"
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all placeholder:text-slate-300"
                      />
                    </div>

                    {/* Seq No */}
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Sequence No
                        <span className="text-slate-400 font-normal ml-1">(optional)</span>
                      </label>
                      <input
                        type="number"
                        value={currentRegion.SeqNO}
                        onChange={(e) => setCurrentRegion({ ...currentRegion, SeqNO: e.target.value })}
                        placeholder="Display order, e.g., 1, 2, 3"
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-mono text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all placeholder:text-slate-300"
                      />
                      <p className="text-xs text-slate-400 mt-1">Controls sort order in dropdowns and lists</p>
                    </div>

                    {/* IsActive Toggle */}
                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl col-span-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-semibold text-slate-800 block select-none">
                            Status
                          </label>
                          <span className="text-[11px] text-slate-500 block mt-0.5">
                            {currentRegion.IsActive
                              ? "Active & visible"
                              : "Disabled & hidden"}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setCurrentRegion({
                              ...currentRegion,
                              IsActive: !currentRegion.IsActive,
                            })
                          }
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 shrink-0 ${
                            currentRegion.IsActive
                              ? "bg-violet-600"
                              : "bg-slate-300"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                              currentRegion.IsActive
                                ? "translate-x-6"
                                : "translate-x-1"
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
                          ["ID", `#${currentRegion.RegionID}`],
                          ["Region Name", currentRegion.Region || "—"],
                          ["Marathi Name", currentRegion.RegionMarathi || "—"],
                        ].map(([label, val]) => (
                          <div
                            key={label}
                            className="flex justify-between text-sm py-1 border-b border-violet-100"
                          >
                            <span className="text-slate-500">{label}</span>
                            <span className="font-mono font-semibold text-slate-800 text-right max-w-[60%] truncate">
                              {val}
                            </span>
                          </div>
                        ))}
                        {currentRegion.SeqNO && (
                          <div className="flex justify-between text-sm py-1 border-b border-violet-100">
                            <span className="text-slate-500">Seq No</span>
                            <span className="font-mono font-semibold text-slate-800">
                              {currentRegion.SeqNO}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm py-1 col-span-2">
                          <span className="text-slate-500">Status</span>
                          <span
                            className={`font-semibold ${currentRegion.IsActive ? "text-emerald-600" : "text-rose-600"}`}
                          >
                            {currentRegion.IsActive ? "Active" : "Inactive"}
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
                    {isEditing ? "💾 Save Changes" : "➕ Add Region"}
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