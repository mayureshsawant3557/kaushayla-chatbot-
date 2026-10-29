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
  InfraItemID: "",
  InfraItem: "",
  InfraCategoryID: "",
  IsActive: true,
};

// ── helpers ──────────────────────────────────────────────────────────────────
const buildPayload = (form) => ({
  InfraItemID: Number(form.InfraItemID) || 0,
  InfraItem: (form.InfraItem ?? "").trim(),
  InfraCategoryID: Number(form.InfraCategoryID) || 0,
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

export default function MasterInfraItem() {
  const { color } = useContext(ThemeContext); // e.g. "bg-[#002060]" — drives the I avatar below

  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState(EMPTY_FORM);

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

  // ── FETCH CATEGORIES ─────────────────────────────────────────────────────
  const fetchCategories = useCallback(async () => {
    try {
      const data = await MasterTableService.getAllInfraCategories();
      const raw = data?.Data ?? data?.data ?? (Array.isArray(data) ? data : []);
      setCategories(
        raw
          .filter((c) => Number(c.InfraCategoryID ?? -2) > -1)
          .map((c) => ({
            InfraCategoryID: c.InfraCategoryID ?? c.InfraCategoryId,
            InfraCategory: c.InfraCategory ?? "",
            IsActive: c.IsActive ?? true,
          }))
          .sort((a, b) => a.InfraCategoryID - b.InfraCategoryID)
      );
    } catch (err) {
      showError(
        err?.response?.data?.Message ||
          err?.response?.data?.message ||
          "Failed to load infra categories"
      );
      setCategories([]);
    }
  }, []);

  // ── FETCH ITEMS ──────────────────────────────────────────────────────────
  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await MasterTableService.getAllInfraItems();
      const raw = data?.Data ?? data?.data ?? (Array.isArray(data) ? data : []);
      setItems(
        raw
          .filter((item) => Number(item.InfraItemID ?? -2) > -1)
          .map((item) => ({
            InfraItemID: item.InfraItemID ?? item.InfraItemId,
            InfraItem: item.InfraItem ?? "",
            InfraCategoryID: item.InfraCategoryID ?? item.InfraCategoryId,
            IsActive: item.IsActive ?? true,
          }))
          .sort((a, b) => a.InfraItemID - b.InfraItemID)
      );
    } catch (err) {
      showError(
        err?.response?.data?.Message ||
          err?.response?.data?.message ||
          "Failed to load infra items"
      );
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchItems();
  }, [fetchCategories, fetchItems]);

  // ── CATEGORY MAP ─────────────────────────────────────────────────────────
  const categoryMap = useMemo(() => {
    const map = {};
    categories.forEach((c) => {
      map[c.InfraCategoryID] = c.InfraCategory;
    });
    return map;
  }, [categories]);

  // ── NEXT ID (client-side derived) ──────────────────────────────────────
  const nextItemId = useMemo(() => {
    if (!items || items.length === 0) return 1;
    const maxId = Math.max(...items.map((i) => Number(i.InfraItemID) || 0));
    return maxId + 1;
  }, [items]);

  // ── INSERT ──────────────────────────────────────────────────────────────
  const handleInsert = async (form) => {
    setActionLoading(true);
    try {
      const payload = buildPayload(form);
      const response = await MasterTableService.insertInfraItem(payload);
      showSuccess(
        response?.Data?.Message ||
          response?.message ||
          response?.data?.message ||
          "Infra item added successfully"
      );
      setIsPanelOpen(false);
      await fetchItems();
    } catch (err) {
      showError(
        err?.response?.data?.Message ||
          err?.response?.data?.message ||
          err.message ||
          "Failed to add infra item"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ── UPDATE ──────────────────────────────────────────────────────────────
  const handleUpdate = async (form) => {
    setActionLoading(true);
    try {
      const payload = buildPayload(form);
      const data = await MasterTableService.updateInfraItem(payload);
      showSuccess(
        data?.Data?.Message ||
          data?.message ||
          data?.data?.message ||
          "Infra item updated successfully"
      );
      setIsPanelOpen(false);
      await fetchItems();
    } catch (err) {
      showError(
        err?.response?.data?.Message ||
          err?.response?.data?.message ||
          err.message ||
          "Failed to update infra item"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ── DELETE ──────────────────────────────────────────────────────────────
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    setActionLoading(true);
    try {
      const data = await MasterTableService.softDeleteInfraItem(id);
      showSuccess(data?.message || data?.Data?.Message || "Infra item deleted successfully");
      await fetchItems();
    } catch (err) {
      showError(
        err?.response?.data?.Message ||
          err?.response?.data?.message ||
          "Failed to delete infra item"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ── TOGGLE STATUS ──────────────────────────────────────────────────────
  const toggleStatusInline = async (item) => {
    const updated = { ...item, IsActive: !item.IsActive };
    setItems((prev) =>
      prev.map((i) => (i.InfraItemID === item.InfraItemID ? updated : i))
    );
    try {
      const payload = buildPayload(updated);
      await MasterTableService.updateInfraItem(payload);
      showSuccess(`Status updated to ${updated.IsActive ? "Active" : "Inactive"}`);
    } catch (err) {
      setItems((prev) =>
        prev.map((i) => (i.InfraItemID === item.InfraItemID ? item : i))
      );
      showError(
        err?.response?.data?.Message ||
          err?.response?.data?.message ||
          "Failed to update status"
      );
    }
  };

  // ── FORM SUBMIT ─────────────────────────────────────────────────────────
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!currentItem.InfraItem?.trim()) {
      showError("Infra Item name is required");
      return;
    }
    if (!currentItem.InfraCategoryID) {
      showError("Infra Category is required");
      return;
    }
    isEditing ? handleUpdate(currentItem) : handleInsert(currentItem);
  };

  const handleOpenPanel = (item = EMPTY_FORM, editMode = false) => {
    setCurrentItem({
      ...item,
      InfraItemID: editMode ? item.InfraItemID : nextItemId,
      IsActive: item.IsActive ?? true,
    });
    setIsEditing(editMode);
    setIsPanelOpen(true);
  };

  // ── STATUS TAB + CATEGORY + SEARCH FILTER (sort/pagination/export live inside FilteredTableComponent) ──
  const filteredItems = items
    .filter((i) => {
      if (selectedFilter === "Active") return i.IsActive;
      if (selectedFilter === "Inactive") return !i.IsActive;
      return true;
    })
    .filter((i) => {
      if (categoryFilter === "All") return true;
      return Number(i.InfraCategoryID) === Number(categoryFilter);
    })
    .filter((i) => {
      if (!searchTerm.trim()) return true;
      const term = searchTerm.trim().toLowerCase();
      return [
        i.InfraItemID,
        i.InfraItem,
        categoryMap[i.InfraCategoryID] || "",
        i.IsActive ? "active" : "inactive",
      ]
        .filter((v) => v !== null && v !== undefined)
        .some((v) => String(v).toLowerCase().includes(term));
    });

  const stats = {
    TotalCount: items.length,
    ActiveCount: items.filter((i) => i.IsActive).length,
    InactiveCount: items.filter((i) => !i.IsActive).length,
  };

  // ── TABLE COLUMNS FOR FilteredTableComponent ──────────────────────────────
  const columns = [
    {
      key: "InfraItemID",
      header: "ID",
      width: "90px",
      headerClassName: "text-center",
      className: "text-center font-mono",
    },
    { key: "InfraItem", header: "Infra Item", className: "font-medium" },
    { key: "InfraCategoryID", header: "Category", sortable: false },
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

  const renderItemCell = (item, column) => {
    switch (column.key) {
      case "InfraCategoryID":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
            {categoryMap[item.InfraCategoryID] || `#${item.InfraCategoryID}`}
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
              aria-label={`Edit ${item.InfraItem}`}
              className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-violet-600 bg-violet-50 hover:bg-violet-600 hover:text-white transition-all active:scale-95"
            >
              <EditIcon />
            </button>
            <button
              type="button"
              onClick={() => handleDelete(item.InfraItemID, item.InfraItem)}
              disabled={actionLoading}
              title="Delete"
              aria-label={`Delete ${item.InfraItem}`}
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

  // ── RENDER ──────────────────────────────────────────────────────────────
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
              I
            </div>
            <h1 className="text-md font-bold tracking-tight text-slate-900">
              Master Infra Item
            </h1>
          </div>
        </header>

        <div className="flex flex-1 relative overflow-hidden">
          <main className="flex-1 p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full">
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
                <div>
                  <p className="text-xs text-slate-500 font-medium">Total Items</p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">
                    {stats.TotalCount.toLocaleString()}
                  </h3>
                </div>
                <span className="p-2 bg-slate-100 rounded-lg text-xl">📦</span>
              </div>
              <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
                <div>
                  <p className="text-xs text-emerald-600 font-medium">Active Items</p>
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
                  <p className="text-xs text-rose-600 font-medium">Disabled</p>
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

            {/* Toolbar — Category filter, search, and Add New Record */}
            <div className="flex items-center gap-3">
              <div className="flex gap-2 shrink-0">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all"
                >
                  <option value="All">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.InfraCategoryID} value={c.InfraCategoryID}>
                      {c.InfraCategory}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1 flex justify-center">
                {/* <div className="relative w-full max-w-sm">
                  <input
                    type="text"
                    placeholder="🔍 Search infra items..."
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
              renderCell={renderItemCell}
              loading={loading}
              tableId="infra-items-table"
              emptyStateMessage="No infra items found"
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
                      {isEditing ? "✏️ Edit Infra Item" : "✨ Add New Infra Item"}
                    </h3>
                    <p className="text-xs text-violet-100 mt-0.5">
                      {isEditing
                        ? "Update the infra item record below"
                        : "Fill in all fields to create a new infra item"}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsPanelOpen(false)}
                    className="opacity-80 hover:opacity-100 text-xl p-2 hover:bg-white/20 rounded-lg transition-all"
                  >✕</button>
                </div>

                <form onSubmit={handleFormSubmit} className="p-6 flex-1 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4">

                    {/* ID */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        ID
                        <span className="text-slate-400 font-normal ml-1">
                          {isEditing ? "(RO)" : "(auto)"}
                        </span>
                      </label>
                      <input
                        type="text"
                        value={currentItem.InfraItemID}
                        disabled
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-mono bg-slate-50 text-slate-500 cursor-not-allowed"
                      />
                    </div>

                    {/* Infra Item Name */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Infra Item <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={currentItem.InfraItem}
                        onChange={(e) => setCurrentItem({ ...currentItem, InfraItem: e.target.value })}
                        placeholder="e.g., Dialysis Machine"
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all placeholder:text-slate-300"
                      />
                    </div>

                    {/* Category Dropdown */}
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Infra Category <span className="text-rose-500">*</span>
                      </label>
                      <select
                        required
                        value={currentItem.InfraCategoryID}
                        onChange={(e) => setCurrentItem({ ...currentItem, InfraCategoryID: e.target.value })}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all"
                      >
                        <option value="">Select a category…</option>
                        {categories.map((c) => (
                          <option key={c.InfraCategoryID} value={c.InfraCategoryID}>
                            {c.InfraCategory}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Status Toggle */}
                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl col-span-2">
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
                          ["ID", `#${currentItem.InfraItemID}`],
                          ["Infra Item", currentItem.InfraItem || "—"],
                          ["Category", categoryMap[currentItem.InfraCategoryID] || "—"],
                        ].map(([label, val]) => (
                          <div key={label} className="flex justify-between text-sm py-1 border-b border-violet-100">
                            <span className="text-slate-500">{label}</span>
                            <span className="font-mono font-semibold text-slate-800 text-right max-w-[60%] truncate">{val}</span>
                          </div>
                        ))}
                        <div className="flex justify-between text-sm py-1 col-span-2">
                          <span className="text-slate-500">Status</span>
                          <span className={`font-semibold ${currentItem.IsActive ? "text-emerald-600" : "text-rose-600"}`}>
                            {currentItem.IsActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Hidden submit for Enter key support */}
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
                    {isEditing ? "💾 Save Changes" : "➕ Add Infra Item"}
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