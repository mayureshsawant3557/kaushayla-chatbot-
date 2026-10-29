import React, { useState, useEffect, useCallback, useMemo, useContext } from "react";
import { MasterTableService } from "../../lib/services/MasterTableService";
import { ThemeContext } from "../../Component/Context/ThemeContext";
import Loader from "../../Component/formcomponent/Loader";
import FilteredTableComponent from "../../Component/formcomponent/FilteredTableComponent";

const EMPTY_FORM = {
  EquipmentId: "",
  CourseID: "",
  ItemID: "",
  EquipmentCategoryId: "",
  UtilizationRemarksID: "",
  IsDsrItem: false,
  IsMouItem: false,
  IsMandatory: false,
  IsAlliedCourseItem: false,
  RequiredPerUnit: 1,
  IsActive: true,
};

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// ── helpers ──────────────────────────────────────────────────────────────────
const buildPayload = (form) => ({
  EquipmentId: Number(form.EquipmentId) || 0,
  CourseID: form.CourseID?.toString().trim() || "",
  ItemID: form.ItemID?.toString().trim() || "",
  EquipmentCategoryId: form.EquipmentCategoryId?.toString().trim() || "",
  UtilizationRemarksID: form.UtilizationRemarksID?.toString().trim() || "",
  IsDsrItem: form.IsDsrItem === true || form.IsDsrItem === 1,
  IsMouItem: form.IsMouItem === true || form.IsMouItem === 1,
  IsMandatory: form.IsMandatory === true || form.IsMandatory === 1,
  IsAlliedCourseItem: form.IsAlliedCourseItem === true || form.IsAlliedCourseItem === 1,
  RequiredPerUnit: Number(form.RequiredPerUnit) || 1,
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

export default function MasterTrainingEquipmentList() {
  const { color } = useContext(ThemeContext);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [mandatoryFilter, setMandatoryFilter] = useState("All");
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState(EMPTY_FORM);

  // Dropdown option lists
  const [courseOptions, setCourseOptions] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [remarksOptions, setRemarksOptions] = useState([]);
  const [dropdownsLoading, setDropdownsLoading] = useState(false);

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

  const extractErrorMessage = (err, fallback) => {
    const data = err?.response?.data;
    if (data?.errors) {
      return Object.values(data.errors).flat().join(", ");
    }
    return data?.Message || data?.message || err?.message || fallback;
  };

  // ── FETCH ─────────────────────────────────────────────────────────────────
  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await MasterTableService.getAllTrainingEquipmentList();
      const raw = Array.isArray(data) ? data : (data?.Data ?? data?.data ?? []);
      setItems(
        raw
          .filter((item) => Number(item.EquipmentId ?? -1) > -1)
          .map((item) => ({
            EquipmentId: item.EquipmentId ?? item.EquipmentID,
            CourseID: item.CourseID ?? "",
            ItemID: item.ItemID ?? "",
            EquipmentCategoryId: item.EquipmentCategoryId ?? "",
            UtilizationRemarksID: item.UtilizationRemarksID ?? "",
            IsDsrItem: !!item.IsDsrItem,
            IsMouItem: !!item.IsMouItem,
            IsMandatory: !!item.IsMandatory,
            IsAlliedCourseItem: !!item.IsAlliedCourseItem,
            RequiredPerUnit: item.RequiredPerUnit ?? 1,
            IsActive: item.IsActive ?? true,
          }))
          .sort((a, b) => Number(a.EquipmentId) - Number(b.EquipmentId))
      );
    } catch (err) {
      showError(
        err?.response?.data?.Message ||
        err?.response?.data?.message ||
        "Failed to load training equipment list"
      );
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);
  useEffect(() => { setCurrentPage(1); }, [searchTerm, selectedFilter, mandatoryFilter]);

  // ── NEXT ID (client-side derived) ────────────────────────────────────────
  const nextEquipmentId = useMemo(() => {
    if (!items || items.length === 0) return 1;
    const maxId = Math.max(...items.map((i) => Number(i.EquipmentId) || 0));
    return maxId + 1;
  }, [items]);

  // ── FETCH DROPDOWNS ──────────────────────────────────────────────────────
  useEffect(() => {
    const fetchDropdowns = async () => {
      setDropdownsLoading(true);
      try {
        const [coursesRes, itemsRes, categoriesRes, remarksRes] = await Promise.allSettled([
          MasterTableService.getAllCourses(),
          MasterTableService.getAllTrainingNameOfItems(),
          MasterTableService.getAllEquipmentCategories(),
          MasterTableService.getAllTrainingRemarkforUtilization(),
        ]);

        const unwrap = (res) => (Array.isArray(res) ? res : (res?.Data ?? res?.data ?? []));

        if (coursesRes.status === "fulfilled") {
          setCourseOptions(
            unwrap(coursesRes.value)
              .filter((c) => String(c.Value) !== "-1")
              .map((c) => ({
                value: String(c.Value ?? c.CourseID ?? c.CourseId ?? c.ID),
                label: c.Text ?? c.CourseName ?? c.Course ?? `Course ${c.Value}`,
              }))
          );
        }

        if (itemsRes.status === "fulfilled") {
          setItemOptions(
            unwrap(itemsRes.value).map((i) => ({
              value: String(i.ID),
              label: i.TrainingNameofItem,
            }))
          );
        }

        if (categoriesRes.status === "fulfilled") {
          setCategoryOptions(
            unwrap(categoriesRes.value).map((c) => ({
              value: String(c.EquipmentCategoryId),
              label: c.EquipmentCategory,
            }))
          );
        }

        if (remarksRes.status === "fulfilled") {
          setRemarksOptions(
            unwrap(remarksRes.value).map((r) => ({
              value: String(r.ID),
              label: r.RemarkforUtilization,
            }))
          );
        }
      } catch (err) {
        showError("Failed to load dropdown options");
      } finally {
        setDropdownsLoading(false);
      }
    };

    fetchDropdowns();
  }, []);

  // ── INSERT ────────────────────────────────────────────────────────────────
  const handleInsert = async (form) => {
    setActionLoading(true);
    try {
      const payload = buildPayload(form);
      const response = await MasterTableService.insertTrainingEquipmentList(payload);
      showSuccess(
        response?.Data?.Message ||
        response?.message ||
        response?.data?.message ||
        "Equipment item added successfully"
      );
      setIsPanelOpen(false);
      await fetchItems();
    } catch (err) {
      showError(extractErrorMessage(err, "Failed to add equipment item"));
    } finally {
      setActionLoading(false);
    }
  };

  // ── UPDATE ────────────────────────────────────────────────────────────────
  const handleUpdate = async (form) => {
    setActionLoading(true);
    try {
      const payload = buildPayload(form);
      const data = await MasterTableService.updateTrainingEquipmentList(payload);
      showSuccess(
        data?.Data?.Message ||
        data?.message ||
        data?.data?.message ||
        "Equipment item updated successfully"
      );
      setIsPanelOpen(false);
      await fetchItems();
    } catch (err) {
      showError(extractErrorMessage(err, "Failed to update equipment item"));
    } finally {
      setActionLoading(false);
    }
  };

  // ── DELETE ────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm(`Are you sure you want to delete Equipment #${id}?`)) return;
    setActionLoading(true);
    try {
      const data = await MasterTableService.softDeleteTrainingEquipmentList(id);
      showSuccess(data?.message || data?.Data?.Message || "Equipment item deleted successfully");
      await fetchItems();
    } catch (err) {
      showError(
        err?.response?.data?.Message ||
        err?.response?.data?.message ||
        "Failed to delete equipment item"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ── TOGGLE STATUS ─────────────────────────────────────────────────────────
  const toggleStatusInline = async (item) => {
    const updated = { ...item, IsActive: !item.IsActive };
    setItems((prev) =>
      prev.map((i) => (i.EquipmentId === item.EquipmentId ? updated : i))
    );
    try {
      const payload = buildPayload(updated);
      await MasterTableService.updateTrainingEquipmentList(payload);
      showSuccess(`Status updated to ${updated.IsActive ? "Active" : "Inactive"}`);
    } catch (err) {
      setItems((prev) =>
        prev.map((i) => (i.EquipmentId === item.EquipmentId ? item : i))
      );
      showError(extractErrorMessage(err, "Failed to update status"));
    }
  };

  // ── FORM SUBMIT ───────────────────────────────────────────────────────────
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!currentItem.CourseID?.toString().trim()) {
      showError("Course ID is required");
      return;
    }
    if (!currentItem.ItemID?.toString().trim()) {
      showError("Item ID is required");
      return;
    }
    if (!currentItem.EquipmentCategoryId?.toString().trim()) {
      showError("Equipment Category ID is required");
      return;
    }
    if (!currentItem.UtilizationRemarksID?.toString().trim()) {
      showError("Utilization Remarks ID is required");
      return;
    }
    if (
      currentItem.RequiredPerUnit === "" ||
      currentItem.RequiredPerUnit === null ||
      Number(currentItem.RequiredPerUnit) <= 0
    ) {
      showError("Required Per Unit must be greater than 0");
      return;
    }
    isEditing ? handleUpdate(currentItem) : handleInsert(currentItem);
  };

  const handleOpenPanel = (item = EMPTY_FORM, editMode = false) => {
    setCurrentItem({
      ...item,
      EquipmentId: editMode ? item.EquipmentId : nextEquipmentId,
      IsActive: item.IsActive ?? true,
      IsDsrItem: item.IsDsrItem ?? false,
      IsMouItem: item.IsMouItem ?? false,
      IsMandatory: item.IsMandatory ?? false,
      IsAlliedCourseItem: item.IsAlliedCourseItem ?? false,
      RequiredPerUnit: item.RequiredPerUnit ?? 1,
    });
    setIsEditing(editMode);
    setIsPanelOpen(true);
  };

  // ── FILTERING ─────────────────────────────────────────────────────────────
  const filteredItems = items.filter((i) => {
    const matchStatus =
      selectedFilter === "All" ? true :
      selectedFilter === "Active" ? i.IsActive : !i.IsActive;

    const matchMandatory =
      mandatoryFilter === "All" ? true :
      mandatoryFilter === "Mandatory" ? i.IsMandatory : !i.IsMandatory;

    const term = searchTerm.trim().toLowerCase();
    const matchSearch = term
      ? [
          i.EquipmentId,
          i.CourseID,
          i.ItemID,
          i.EquipmentCategoryId,
          i.UtilizationRemarksID,
          i.IsMandatory ? "mandatory" : "",
          i.IsDsrItem ? "dsr" : "",
          i.IsMouItem ? "mou" : "",
          i.IsAlliedCourseItem ? "allied" : "",
          i.IsActive ? "active" : "inactive",
        ]
          .filter((v) => v !== null && v !== undefined)
          .some((v) => String(v).toLowerCase().includes(term))
      : true;

    return matchStatus && matchMandatory && matchSearch;
  });

  const stats = {
    TotalCount: items.length,
    ActiveCount: items.filter((i) => i.IsActive).length,
    InactiveCount: items.filter((i) => !i.IsActive).length,
    MandatoryCount: items.filter((i) => i.IsMandatory).length,
  };

  const BoolBadge = ({ value }) => (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
        value ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${value ? "bg-emerald-500" : "bg-slate-400"}`} />
      {value ? "Yes" : "No"}
    </span>
  );

  // ── TABLE COLUMNS FOR FilteredTableComponent ──────────────────────────────
  const columns = [
    {
      key: "EquipmentId",
      header: "Equipment Id",
      width: "90px",
      headerClassName: "text-left",
      className: "font-mono text-slate-600 font-medium",
    },
    {
      key: "CourseID",
      header: "Course ID",
      className: "font-mono",
    },
    {
      key: "ItemID",
      header: "Item ID",
      className: "font-mono text-slate-700",
    },
    {
      key: "EquipmentCategoryId",
      header: "Category Id",
      className: "font-mono",
    },
    {
      key: "UtilizationRemarksID",
      header: "Remarks ID",
      className: "font-mono text-xs text-slate-600",
    },
    {
      key: "IsDsrItem",
      header: "DSR",
      headerClassName: "text-center",
      className: "text-center",
      sortable: false,
    },
    {
      key: "IsMouItem",
      header: "MOU",
      headerClassName: "text-center",
      className: "text-center",
      sortable: false,
    },
    {
      key: "IsMandatory",
      header: "Mandatory",
      headerClassName: "text-center",
      className: "text-center",
      sortable: false,
    },
    {
      key: "IsAlliedCourseItem",
      header: "Allied",
      headerClassName: "text-center",
      className: "text-center",
      sortable: false,
    },
    {
      key: "RequiredPerUnit",
      header: "Req/Unit",
      headerClassName: "text-center",
      className: "text-center font-mono text-slate-700 text-xs",
      sortable: true,
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
      case "CourseID":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-mono font-medium">
            {item.CourseID || "—"}
          </span>
        );

      case "EquipmentCategoryId":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 text-[10px] font-medium">
            {item.EquipmentCategoryId || "—"}
          </span>
        );

      case "IsDsrItem":
        return <BoolBadge value={item.IsDsrItem} />;

      case "IsMouItem":
        return <BoolBadge value={item.IsMouItem} />;

      case "IsMandatory":
        return <BoolBadge value={item.IsMandatory} />;

      case "IsAlliedCourseItem":
        return <BoolBadge value={item.IsAlliedCourseItem} />;

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
              aria-label={`Edit Equipment #${item.EquipmentId}`}
              className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-violet-600 bg-violet-50 hover:bg-violet-600 hover:text-white transition-all active:scale-95"
            >
              <EditIcon />
            </button>
            <button
              type="button"
              onClick={() => handleDelete(item.EquipmentId)}
              disabled={actionLoading}
              title="Delete"
              aria-label={`Delete Equipment #${item.EquipmentId}`}
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
            <div className={`h-9 w-9 rounded-xl ${color} flex items-center justify-center font-bold shadow-md text-white`}>
              E
            </div>
            <h1 className="text-md font-bold tracking-tight text-slate-900">Master Training Equipment List</h1>
          </div>
        </header>

        <div className="flex flex-1 relative overflow-hidden">
          <main className="flex-1 p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full">
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
                <div>
                  <p className="text-xs text-slate-500 font-medium">Total Records</p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.TotalCount.toLocaleString()}</h3>
                </div>
                <span className="p-2 bg-slate-100 rounded-lg text-xl">📊</span>
              </div>
              <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
                <div>
                  <p className="text-xs text-emerald-600 font-medium">Active Items</p>
                  <h3 className="text-2xl font-bold text-emerald-600 mt-1">{stats.ActiveCount.toLocaleString()}</h3>
                </div>
                <span className="p-2 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold">● Live</span>
              </div>
              <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
                <div>
                  <p className="text-xs text-rose-600 font-medium">Disabled</p>
                  <h3 className="text-2xl font-bold text-rose-600 mt-1">{stats.InactiveCount.toLocaleString()}</h3>
                </div>
                <span className="p-2 bg-rose-50 text-rose-700 rounded-lg text-xs font-bold">○ Down</span>
              </div>
              <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
                <div>
                  <p className="text-xs text-violet-600 font-medium">Mandatory Items</p>
                  <h3 className="text-2xl font-bold text-violet-600 mt-1">{stats.MandatoryCount.toLocaleString()}</h3>
                </div>
                <span className="p-2 bg-violet-50 text-violet-700 rounded-lg text-xs font-bold">◆ Req</span>
              </div>
            </div>

            {/* Status Tabs + Back/Close buttons */}
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

            {/* Toolbar - Search + Add New Record */}
            <div className="flex items-center gap-3">
              <div className="flex-1 flex justify-center">
               {/* <div className="relative w-full max-w-sm">
                  <input
                    type="text"
                    placeholder="🔍 Search equipment..."
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
              tableId="training-equipment-table"
              emptyStateMessage="No training equipment records found"
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
                      {isEditing ? "✏️ Edit Equipment Item" : "✨ Add New Equipment Item"}
                    </h3>
                    <p className="text-xs text-violet-100 mt-0.5">
                      {isEditing ? "Update the equipment record below" : "Fill in all fields to create a new equipment record"}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsPanelOpen(false)}
                    className="opacity-80 hover:opacity-100 text-xl p-2 hover:bg-white/20 rounded-lg transition-all"
                  >✕</button>
                </div>

                <form onSubmit={handleFormSubmit} className="p-6 flex-1 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Equipment ID — auto-generated */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Equipment ID
                        <span className="text-slate-400 font-normal ml-1">
                          {isEditing ? "(RO)" : "(auto)"}
                        </span>
                      </label>
                      <input
                        type="text"
                        value={currentItem.EquipmentId}
                        disabled
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-mono bg-slate-50 text-slate-500 cursor-not-allowed"
                      />
                    </div>

                    {/* Required Per Unit */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Required Per Unit <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={currentItem.RequiredPerUnit}
                        onChange={(e) => setCurrentItem({ ...currentItem, RequiredPerUnit: e.target.value })}
                        placeholder="e.g., 1"
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all placeholder:text-slate-300"
                      />
                    </div>

                    {/* Course ID */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Course ID <span className="text-rose-500">*</span>
                      </label>
                      <select
                        required
                        value={currentItem.CourseID}
                        onChange={(e) => setCurrentItem({ ...currentItem, CourseID: e.target.value })}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 bg-white focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all"
                        disabled={dropdownsLoading}
                      >
                        <option value="">Select Course...</option>
                        {courseOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      {dropdownsLoading && <p className="text-[10px] text-slate-400 mt-1">Loading courses...</p>}
                    </div>

                    {/* Item ID */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Item ID <span className="text-rose-500">*</span>
                      </label>
                      <select
                        required
                        value={currentItem.ItemID}
                        onChange={(e) => setCurrentItem({ ...currentItem, ItemID: e.target.value })}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 bg-white focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all"
                        disabled={dropdownsLoading}
                      >
                        <option value="">Select Item...</option>
                        {itemOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      {dropdownsLoading && <p className="text-[10px] text-slate-400 mt-1">Loading items...</p>}
                    </div>

                    {/* Equipment Category ID */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Category ID <span className="text-rose-500">*</span>
                      </label>
                      <select
                        required
                        value={currentItem.EquipmentCategoryId}
                        onChange={(e) => setCurrentItem({ ...currentItem, EquipmentCategoryId: e.target.value })}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 bg-white focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all"
                        disabled={dropdownsLoading}
                      >
                        <option value="">Select Category...</option>
                        {categoryOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      {dropdownsLoading && <p className="text-[10px] text-slate-400 mt-1">Loading categories...</p>}
                    </div>

                    {/* Utilization Remarks ID */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Remarks ID <span className="text-rose-500">*</span>
                      </label>
                      <select
                        required
                        value={currentItem.UtilizationRemarksID}
                        onChange={(e) => setCurrentItem({ ...currentItem, UtilizationRemarksID: e.target.value })}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 bg-white focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all"
                        disabled={dropdownsLoading}
                      >
                        <option value="">Select Remark...</option>
                        {remarksOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      {dropdownsLoading && <p className="text-[10px] text-slate-400 mt-1">Loading remarks...</p>}
                    </div>

                    {/* Boolean Flags */}
                    <div className="col-span-2 pt-2 border-t border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Item Flags</p>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { key: "IsDsrItem", label: "DSR Item", color: "blue" },
                          { key: "IsMouItem", label: "MOU Item", color: "amber" },
                          { key: "IsMandatory", label: "Mandatory", color: "violet" },
                          { key: "IsAlliedCourseItem", label: "Allied Course Item", color: "green" },
                        ].map(({ key, label, color }) => (
                          <div key={key} className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                            <div className="flex items-center justify-between">
                              <div>
                                <label className="text-sm font-semibold text-slate-800 block select-none">{label}</label>
                                <span className="text-[11px] text-slate-500 block mt-0.5">
                                  {currentItem[key] ? "Enabled" : "Disabled"}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setCurrentItem({ ...currentItem, [key]: !currentItem[key] })}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-${color}-500 focus:ring-offset-2 shrink-0 ${
                                  currentItem[key] ? `bg-${color}-500` : "bg-slate-300"
                                }`}
                              >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                                  currentItem[key] ? "translate-x-6" : "translate-x-1"
                                }`} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Status Toggle */}
                    <div className="col-span-2 bg-slate-50 border border-slate-200 p-3 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-semibold text-slate-800 block select-none">Status</label>
                          <span className="text-[11px] text-slate-500 block mt-0.5">
                            {currentItem.IsActive ? "Active & visible" : "Disabled & hidden"}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCurrentItem({ ...currentItem, IsActive: !currentItem.IsActive })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 shrink-0 ${
                            currentItem.IsActive ? "bg-violet-600" : "bg-slate-300"
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                            currentItem.IsActive ? "translate-x-6" : "translate-x-1"
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
                          ["Equipment ID", `#${currentItem.EquipmentId}`],
                          ["Course ID", currentItem.CourseID || "—"],
                          ["Item ID", currentItem.ItemID || "—"],
                          ["Category ID", currentItem.EquipmentCategoryId || "—"],
                          ["Remarks ID", currentItem.UtilizationRemarksID || "—"],
                        ].map(([label, val]) => (
                          <div key={label} className="flex justify-between text-sm py-1 border-b border-violet-100">
                            <span className="text-slate-500">{label}</span>
                            <span className="font-mono font-semibold text-slate-800 text-right max-w-[60%] truncate">{val}</span>
                          </div>
                        ))}
                        <div className="flex justify-between text-sm py-1 border-b border-violet-100">
                          <span className="text-slate-500">Required Per Unit</span>
                          <span className="font-mono font-semibold text-slate-800">{currentItem.RequiredPerUnit || "—"}</span>
                        </div>
                        <div className="flex justify-between text-sm py-1 border-b border-violet-100">
                          <span className="text-slate-500">Mandatory</span>
                          <span className={`font-semibold ${currentItem.IsMandatory ? "text-emerald-600" : "text-slate-400"}`}>
                            {currentItem.IsMandatory ? "Yes" : "No"}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm py-1 col-span-2">
                          <span className="text-slate-500">Status</span>
                          <span className={`font-semibold ${currentItem.IsActive ? "text-emerald-600" : "text-rose-600"}`}>
                            {currentItem.IsActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button type="submit" className="hidden" aria-hidden="true" />
                </form>

                {/* Bottom action bar */}
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
                    {isEditing ? "💾 Save Changes" : "➕ Add Equipment"}
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