import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useContext,
} from "react";
import { MasterTableService } from "../../lib/services/MasterTableService";
import FilteredTableComponent from "../../Component/formcomponent/FilteredTableComponent";
import { ThemeContext } from "../../Component/Context/ThemeContext";
import Loader from "../../Component/formcomponent/Loader";

const EMPTY_FORM = {
  Id: "",
  NameasperBOCWPortal: "",
  InstituteCode: "",
  TrainingPartner: "",
  Address: "",
  CityVillage: "",
  PinCode: "",
  Taluka: "",
  District: "",
  Title: "Mr.",
  FirstName: "",
  MiddleName: "",
  LastName: "",
  PrimaryMobileNumber: "",
  AlternativeMobileNumber: "",
  EMailID: "",
  IsActive: true,
};

// ── helpers ──────────────────────────────────────────────────────────────────
const buildPayload = (form) => ({
  Id: Number(form.Id) || 0,
  NameasperBOCWPortal: (form.NameasperBOCWPortal ?? "").trim(),
  InstituteCode: (form.InstituteCode ?? "").trim(),
  TrainingPartner: (form.TrainingPartner ?? "").trim(),
  Address: (form.Address ?? "").trim(),
  CityVillage: (form.CityVillage ?? "").trim(),
  PinCode: (form.PinCode ?? "").trim(),
  Taluka: (form.Taluka ?? "").trim(),
  District: (form.District ?? "").trim(),
  Title: (form.Title ?? "Mr.").trim(),
  FirstName: (form.FirstName ?? "").trim(),
  MiddleName: (form.MiddleName ?? "").trim(),
  LastName: (form.LastName ?? "").trim(),
  PrimaryMobileNumber: (form.PrimaryMobileNumber ?? "").trim(),
  AlternativeMobileNumber: (form.AlternativeMobileNumber ?? "").trim(),
  EMailID: (form.EMailID ?? "").trim(),
  IsActive: form.IsActive === true || form.IsActive === 1,
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
    stroke="#94a3b8"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

export default function MasterOBWCInstituteList() {
  const { color } = useContext(ThemeContext); // e.g. "bg-[#002060]" — drives the I avatar + accents below

  const [institutes, setInstitutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [districtFilter, setDistrictFilter] = useState("All");
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentInstitute, setCurrentInstitute] = useState(EMPTY_FORM);

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
  const fetchInstitutes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await MasterTableService.getAllOBWCInstitutes();
      const raw = data?.Data ?? data?.data ?? (Array.isArray(data) ? data : []);
      setInstitutes(
        raw
          .filter((item) => Number(item.Id ?? -2) > -1)
          .map((item) => ({
            Id: item.Id ?? item.ID,
            NameasperBOCWPortal: item.NameasperBOCWPortal ?? "",
            InstituteCode: item.InstituteCode ?? "",
            TrainingPartner: item.TrainingPartner ?? "",
            Address: item.Address ?? "",
            CityVillage: item.CityVillage ?? "",
            PinCode: item.PinCode ?? "",
            Taluka: item.Taluka ?? "",
            District: item.District ?? "",
            Title: item.Title ?? "Mr.",
            FirstName: item.FirstName ?? "",
            MiddleName: item.MiddleName ?? "",
            LastName: item.LastName ?? "",
            PrimaryMobileNumber: item.PrimaryMobileNumber ?? "",
            AlternativeMobileNumber: item.AlternativeMobileNumber ?? "",
            EMailID: item.EMailID ?? "",
            IsActive: item.IsActive === true || item.IsActive === 1,
            ContactPerson: [item.Title ?? "Mr.", item.FirstName ?? "", item.LastName ?? ""]
              .filter(Boolean)
              .join(" "),
          }))
      );
    } catch (err) {
      showError(
        err?.response?.data?.Message ||
        err?.response?.data?.message ||
        "Failed to load OBWC institutes"
      );
      setInstitutes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchInstitutes(); }, [fetchInstitutes]);

  // ── NEXT ID (client-side derived, no new API) ───────────────────────────────
  const nextInstituteId = useMemo(() => {
    if (!institutes || institutes.length === 0) return 1;
    const maxId = Math.max(...institutes.map((i) => Number(i.Id) || 0));
    return maxId + 1;
  }, [institutes]);

  // ── DISTRICTS (for filter dropdown) ──────────────────────────────────────
  const districts = useMemo(() => {
    const set = new Set(institutes.map((o) => (o.District || "").trim()).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [institutes]);

  // ── INSERT ────────────────────────────────────────────────────────────────
  const handleInsert = async (form) => {
    setActionLoading(true);
    try {
      const payload = buildPayload(form);
      const response = await MasterTableService.insertOBWCInstitute(payload);
      showSuccess(
        response?.Data?.Message ||
        response?.message ||
        response?.data?.message ||
        "OBWC institute added successfully"
      );
      setIsPanelOpen(false);
      await fetchInstitutes();
    } catch (err) {
      showError(
        err?.response?.data?.Message ||
        err?.response?.data?.message ||
        err.message ||
        "Failed to add OBWC institute"
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
      const data = await MasterTableService.updateOBWCInstitute(payload);
      showSuccess(
        data?.Data?.Message ||
        data?.message ||
        data?.data?.message ||
        "OBWC institute updated successfully"
      );
      setIsPanelOpen(false);
      await fetchInstitutes();
    } catch (err) {
      showError(
        err?.response?.data?.Message ||
        err?.response?.data?.message ||
        err.message ||
        "Failed to update OBWC institute"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ── DELETE ────────────────────────────────────────────────────────────────
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    setActionLoading(true);
    try {
      const data = await MasterTableService.softDeleteOBWCInstitute(id);
      showSuccess(data?.message || data?.Data?.Message || "OBWC institute deleted successfully");
      await fetchInstitutes();
    } catch (err) {
      showError(
        err?.response?.data?.Message ||
        err?.response?.data?.message ||
        "Failed to delete OBWC institute"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ── TOGGLE STATUS ─────────────────────────────────────────────────────────
  const toggleStatusInline = async (item) => {
    const updated = { ...item, IsActive: !item.IsActive };
    setInstitutes((prev) =>
      prev.map((i) => (i.Id === item.Id ? updated : i))
    );
    try {
      const payload = buildPayload(updated);
      await MasterTableService.updateOBWCInstitute(payload);
      showSuccess(`Status updated to ${updated.IsActive ? "Active" : "Inactive"}`);
    } catch (err) {
      setInstitutes((prev) =>
        prev.map((i) => (i.Id === item.Id ? item : i))
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
    if (!currentInstitute.NameasperBOCWPortal?.trim()) { showError("Name as per BOCW Portal is required"); return; }
    if (!currentInstitute.InstituteCode?.trim()) { showError("Institute Code is required"); return; }
    if (!currentInstitute.TrainingPartner?.trim()) { showError("Training Partner is required"); return; }
    if (!currentInstitute.CityVillage?.trim()) { showError("City / Village is required"); return; }
    if (!currentInstitute.District?.trim()) { showError("District is required"); return; }
    if (!currentInstitute.FirstName?.trim()) { showError("First Name is required"); return; }
    if (!currentInstitute.LastName?.trim()) { showError("Last Name is required"); return; }
    if (!currentInstitute.PrimaryMobileNumber?.toString().trim()) { showError("Primary Mobile Number is required"); return; }
    if (!currentInstitute.EMailID?.trim()) { showError("Email ID is required"); return; }
    isEditing ? handleUpdate(currentInstitute) : handleInsert(currentInstitute);
  };

  const handleOpenPanel = (institute = EMPTY_FORM, editMode = false) => {
    setCurrentInstitute({
      ...institute,
      Id: editMode ? institute.Id : nextInstituteId,
      IsActive: institute.IsActive ?? true,
    });
    setIsEditing(editMode);
    setIsPanelOpen(true);
  };

  // ── FILTERING (status tab + district + search — sort/pagination/export live inside FilteredTableComponent) ──
  const filteredInstitutes = institutes.filter((i) => {
    const matchStatus =
      selectedFilter === "All" ? true :
      selectedFilter === "Active" ? i.IsActive : !i.IsActive;

    const matchDistrict =
      districtFilter === "All" || (i.District || "").trim() === districtFilter;

    const term = searchTerm.trim().toLowerCase();
    const matchSearch = term
      ? [
          i.Id,
          i.NameasperBOCWPortal,
          i.InstituteCode,
          i.TrainingPartner,
          i.CityVillage,
          i.District,
          i.EMailID,
          i.PrimaryMobileNumber,
          i.ContactPerson,
          i.IsActive ? "active" : "inactive",
        ]
          .filter((v) => v !== null && v !== undefined)
          .some((v) => String(v).toLowerCase().includes(term))
      : true;

    return matchStatus && matchDistrict && matchSearch;
  });

  const stats = {
    TotalCount: institutes.length,
    ActiveCount: institutes.filter((i) => i.IsActive).length,
    InactiveCount: institutes.filter((i) => !i.IsActive).length,
    DistrictCount: districts.length,
  };

  // ── TABLE COLUMNS FOR FilteredTableComponent ──────────────────────────────
  const columns = [
    {
      key: "Id",
      header: "ID",
      width: "70px",
      headerClassName: "text-left",
      className: "font-mono text-slate-600 font-medium",
    },
    { key: "NameasperBOCWPortal", header: "Name (BOCW Portal)", className: "font-medium text-slate-800" },
    { key: "InstituteCode", header: "Institute Code", sortable: false },
    { key: "TrainingPartner", header: "Training Partner" },
    { key: "CityVillage", header: "City/Village" },
    { key: "District", header: "District", sortable: false },
    { key: "ContactPerson", header: "Contact Person", sortable: false },
    { key: "PrimaryMobileNumber", header: "Mobile", className: "font-mono text-xs text-slate-500" },
    { key: "EMailID", header: "Email", className: "text-xs text-slate-500" },
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

  const renderInstituteCell = (item, column) => {
    switch (column.key) {
      case "InstituteCode":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-mono font-medium">
            {item.InstituteCode || "—"}
          </span>
        );

      case "District":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 text-[10px] font-medium">
            {item.District || "—"}
          </span>
        );

      case "ContactPerson":
        return [item.Title, item.FirstName, item.LastName].filter(Boolean).join(" ") || "—";

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
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap justify-end">
            <button
              type="button"
              onClick={() => handleOpenPanel(item, true)}
              title="Edit"
              aria-label={`Edit ${item.NameasperBOCWPortal}`}
              className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-violet-600 bg-violet-50 hover:bg-violet-600 hover:text-white transition-all active:scale-95"
            >
              <EditIcon />
            </button>
            <button
              type="button"
              onClick={() => handleDelete(item.Id, item.NameasperBOCWPortal)}
              disabled={actionLoading}
              title="Delete"
              aria-label={`Delete ${item.NameasperBOCWPortal}`}
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
              I
            </div>
            <h1 className="text-md font-bold tracking-tight text-slate-900">
              Master OBWC Institute List
            </h1>
          </div>
        </header>

        <div className="flex flex-1 relative overflow-hidden">
          <main className="flex-1 p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full">

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
                <div>
                  <p className="text-xs text-slate-500 font-medium">Total Institutes</p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.TotalCount.toLocaleString()}</h3>
                </div>
                <span className="p-2 bg-slate-100 rounded-lg text-xl">🏫</span>
              </div>
              <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
                <div>
                  <p className="text-xs text-emerald-600 font-medium">Active Institutes</p>
                  <h3 className="text-2xl font-bold text-emerald-600 mt-1">{stats.ActiveCount.toLocaleString()}</h3>
                </div>
                <span className="p-2 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold">● Live</span>
              </div>
              <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
                <div>
                  <p className="text-xs text-rose-600 font-medium">Inactive Institutes</p>
                  <h3 className="text-2xl font-bold text-rose-600 mt-1">{stats.InactiveCount.toLocaleString()}</h3>
                </div>
                <span className="p-2 bg-rose-50 text-rose-700 rounded-lg text-xs font-bold">○ Down</span>
              </div>
              <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
                <div>
                  <p className="text-xs text-violet-600 font-medium">Districts</p>
                  <h3 className="text-2xl font-bold text-violet-600 mt-1">{stats.DistrictCount.toLocaleString()}</h3>
                </div>
                <span className="p-2 bg-violet-50 text-violet-700 rounded-lg text-xs font-bold">◆ Grp</span>
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

            {/* Toolbar — District filter, search, and Add New Record */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex gap-2 shrink-0">
                <select
                  value={districtFilter}
                  onChange={(e) => setDistrictFilter(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
                >
                  <option value="All">All Districts</option>
                  {districts.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="flex-1 flex justify-center">
                {/* <div className="relative w-full max-w-sm">
                  <input
                    type="text"
                    placeholder="🔍 Search by name, code, partner, city..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
                  />
                  <SearchIcon />
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
              data={filteredInstitutes}
              columns={columns}
              renderCell={renderInstituteCell}
              loading={loading}
              tableId="obwc-institutes-table"
              emptyStateMessage="No OBWC institutes found"
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
                      {isEditing ? "✏️ Edit OBWC Institute" : "✨ Add New OBWC Institute"}
                    </h3>
                    <p className="text-xs text-violet-100 mt-0.5">
                      {isEditing ? "Update the institute record below" : "Fill in all fields to create a new institute"}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsPanelOpen(false)}
                    className="opacity-80 hover:opacity-100 text-xl p-2 hover:bg-white/20 rounded-lg transition-all"
                  >✕</button>
                </div>

                <form
                  onSubmit={handleFormSubmit}
                  onKeyDown={(e) => {
                    // Prevent Enter key inside inputs from implicitly submitting
                    // (and closing) the form while the user is still filling it in.
                    // Multi-line fields (textarea) keep their normal Enter behavior.
                    if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") {
                      e.preventDefault();
                    }
                  }}
                  className="p-6 flex-1 overflow-y-auto"
                >
                  <div className="grid grid-cols-2 gap-4">

                    {/* ID — always visible, read-only */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        ID
                        <span className="text-slate-400 font-normal ml-1">
                          {isEditing ? "(RO)" : "(auto)"}
                        </span>
                      </label>
                      <input
                        type="text"
                        value={currentInstitute.Id}
                        disabled
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-mono bg-slate-50 text-slate-500 cursor-not-allowed"
                      />
                    </div>

                    {/* Institute Code */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Institute Code <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={currentInstitute.InstituteCode}
                        onChange={(e) => setCurrentInstitute({ ...currentInstitute, InstituteCode: e.target.value })}
                        placeholder="e.g., MBOCW01"
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-mono text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all placeholder:text-slate-300"
                      />
                    </div>

                    {/* Name as per BOCW Portal */}
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Name as per BOCW Portal <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={currentInstitute.NameasperBOCWPortal}
                        onChange={(e) => setCurrentInstitute({ ...currentInstitute, NameasperBOCWPortal: e.target.value })}
                        placeholder="e.g., M/s Indus Edu Train Pvt Ltd"
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all placeholder:text-slate-300"
                      />
                    </div>

                    {/* Training Partner */}
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Training Partner <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={currentInstitute.TrainingPartner}
                        onChange={(e) => setCurrentInstitute({ ...currentInstitute, TrainingPartner: e.target.value })}
                        placeholder="e.g., INDUS EDU TRAIN PRIVATE LIMITED"
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all placeholder:text-slate-300"
                      />
                    </div>

                    {/* Address */}
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Address
                      </label>
                      <textarea
                        rows={3}
                        value={currentInstitute.Address}
                        onChange={(e) => setCurrentInstitute({ ...currentInstitute, Address: e.target.value })}
                        placeholder="e.g., Office No. 304, 3rd Floor, Chintamani Classique..."
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all placeholder:text-slate-300 resize-none"
                      />
                    </div>

                    {/* City/Village + Pin Code */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        City / Village <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={currentInstitute.CityVillage}
                        onChange={(e) => setCurrentInstitute({ ...currentInstitute, CityVillage: e.target.value })}
                        placeholder="e.g., Goregaon (East)"
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all placeholder:text-slate-300"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Pin Code
                      </label>
                      <input
                        type="text"
                        value={currentInstitute.PinCode}
                        onChange={(e) => setCurrentInstitute({ ...currentInstitute, PinCode: e.target.value })}
                        placeholder="e.g., 400063"
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-mono text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all placeholder:text-slate-300"
                      />
                    </div>

                    {/* Taluka + District */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Taluka
                      </label>
                      <input
                        type="text"
                        value={currentInstitute.Taluka}
                        onChange={(e) => setCurrentInstitute({ ...currentInstitute, Taluka: e.target.value })}
                        placeholder="e.g., Andheri"
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all placeholder:text-slate-300"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        District <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        list="district-suggestions"
                        value={currentInstitute.District}
                        onChange={(e) => setCurrentInstitute({ ...currentInstitute, District: e.target.value })}
                        placeholder="e.g., Mumbai"
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all placeholder:text-slate-300"
                      />
                      <datalist id="district-suggestions">
                        {districts.map((d) => (
                          <option key={d} value={d} />
                        ))}
                      </datalist>
                    </div>

                    {/* Contact Person Section */}
                    <div className="col-span-2 pt-2 border-t border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                        Contact Person
                      </p>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                            Title
                          </label>
                          <select
                            value={currentInstitute.Title}
                            onChange={(e) => setCurrentInstitute({ ...currentInstitute, Title: e.target.value })}
                            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all"
                          >
                            <option value="Mr.">Mr.</option>
                            <option value="Ms.">Ms.</option>
                            <option value="Mrs.">Mrs.</option>
                            <option value="Dr.">Dr.</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                            First Name <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={currentInstitute.FirstName}
                            onChange={(e) => setCurrentInstitute({ ...currentInstitute, FirstName: e.target.value })}
                            placeholder="e.g., Shubham"
                            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all placeholder:text-slate-300"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                            Middle Name
                          </label>
                          <input
                            type="text"
                            value={currentInstitute.MiddleName}
                            onChange={(e) => setCurrentInstitute({ ...currentInstitute, MiddleName: e.target.value })}
                            placeholder="e.g., Kumar"
                            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all placeholder:text-slate-300"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3 mt-3">
                        <div className="col-span-3">
                          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                            Last Name <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={currentInstitute.LastName}
                            onChange={(e) => setCurrentInstitute({ ...currentInstitute, LastName: e.target.value })}
                            placeholder="e.g., Dubey"
                            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all placeholder:text-slate-300"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Mobile numbers */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Primary Mobile <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={currentInstitute.PrimaryMobileNumber}
                        onChange={(e) => setCurrentInstitute({ ...currentInstitute, PrimaryMobileNumber: e.target.value })}
                        placeholder="e.g., 8887623556"
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-mono text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all placeholder:text-slate-300"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Alternative Mobile
                      </label>
                      <input
                        type="tel"
                        value={currentInstitute.AlternativeMobileNumber}
                        onChange={(e) => setCurrentInstitute({ ...currentInstitute, AlternativeMobileNumber: e.target.value })}
                        placeholder="e.g., 7318402242"
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-mono text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all placeholder:text-slate-300"
                      />
                    </div>

                    {/* Email */}
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Email ID <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={currentInstitute.EMailID}
                        onChange={(e) => setCurrentInstitute({ ...currentInstitute, EMailID: e.target.value })}
                        placeholder="e.g., shubham.dubey@indusedutrain.com"
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all placeholder:text-slate-300"
                      />
                    </div>

                    {/* IsActive Toggle */}
                    <div className="col-span-2 bg-slate-50 border border-slate-200 p-3 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-semibold text-slate-800 block select-none">Status</label>
                          <span className="text-[11px] text-slate-500 block mt-0.5">
                            {currentInstitute.IsActive ? "Institute is active & visible" : "Institute is disabled & hidden"}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCurrentInstitute({ ...currentInstitute, IsActive: !currentInstitute.IsActive })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 shrink-0 ${
                            currentInstitute.IsActive ? "bg-violet-600" : "bg-slate-300"
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                            currentInstitute.IsActive ? "translate-x-6" : "translate-x-1"
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
                          ["ID", `#${currentInstitute.Id}`],
                          ["Name (BOCW)", currentInstitute.NameasperBOCWPortal || "—"],
                          ["Institute Code", currentInstitute.InstituteCode || "—"],
                          ["Training Partner", currentInstitute.TrainingPartner || "—"],
                          ["City/Village", currentInstitute.CityVillage || "—"],
                          ["District", currentInstitute.District || "—"],
                        ].map(([label, val]) => (
                          <div key={label} className="flex justify-between text-sm py-1 border-b border-violet-100">
                            <span className="text-slate-500">{label}</span>
                            <span className="font-mono font-semibold text-slate-800 text-right max-w-[60%] truncate">{val}</span>
                          </div>
                        ))}
                        <div className="flex justify-between text-sm py-1 border-b border-violet-100">
                          <span className="text-slate-500">Contact</span>
                          <span className="font-semibold text-slate-800">
                            {[currentInstitute.Title, currentInstitute.FirstName, currentInstitute.LastName].filter(Boolean).join(" ") || "—"}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm py-1 border-b border-violet-100">
                          <span className="text-slate-500">Mobile</span>
                          <span className="font-mono font-semibold text-slate-800">{currentInstitute.PrimaryMobileNumber || "—"}</span>
                        </div>
                        <div className="flex justify-between text-sm py-1 border-b border-violet-100">
                          <span className="text-slate-500">Email</span>
                          <span className="font-semibold text-slate-800 text-right max-w-[60%] truncate">{currentInstitute.EMailID || "—"}</span>
                        </div>
                        <div className="flex justify-between text-sm py-1 col-span-2">
                          <span className="text-slate-500">Status</span>
                          <span className={`font-semibold ${currentInstitute.IsActive ? "text-emerald-600" : "text-rose-600"}`}>
                            {currentInstitute.IsActive ? "Active" : "Inactive"}
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
                    {isEditing ? "💾 Save Changes" : "➕ Add Institute"}
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