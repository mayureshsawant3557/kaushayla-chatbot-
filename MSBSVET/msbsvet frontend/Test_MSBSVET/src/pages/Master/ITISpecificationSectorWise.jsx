import React, { useState, useEffect, useCallback, useMemo, useContext } from "react";
import { MasterTableService } from "../../lib/services/MasterTableService";
import DropdownComponent from "../../Component/formcomponent/DropdownComponent";
import FilteredTableComponent from "../../Component/formcomponent/FilteredTableComponent";
import { ThemeContext } from "../../Component/Context/ThemeContext";
import Loader from "../../Component/formcomponent/Loader";

const EMPTY_FORM = {
  ID: "",
  ItemID: "",
  GroupID: "",
  SectorID: "",
  CategoryID: "",
  EstimatedPrice: "",
  IsActive: true,
  IsDocShow: false,
};

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const toNum = (v) => (v === "" || v === null || v === undefined ? null : Number(v));

const normalise = (raw) =>
  raw.map((item, i) => ({
    _rowKey: `row-${i}`,
    ID: item.ID != null ? Number(item.ID) : null,
    ItemID: item.ItemID != null ? Number(item.ItemID) : null,
    GroupID: item.GroupID != null ? Number(item.GroupID) : null,
    SectorID: item.SectorID != null ? Number(item.SectorID) : null,
    CategoryID: item.CategoryID != null ? Number(item.CategoryID) : null,
    EstimatedPrice: item.EstimatedPrice != null ? Number(item.EstimatedPrice) : 0,
    IsActive: item.IsActive === true || item.IsActive === 1 || item.isactive === true || item.isactive === 1,
    IsDocShow: item.IsDocShow === true || item.IsDocShow === 1 || item.isdocshow === true || item.isdocshow === 1,
  }));

const normaliseOptions = (raw, nameFields) =>
  (raw || []).map((r) => {
    const id = r.ID ?? r.id;
    const label = nameFields.map((f) => r[f]).find((v) => v !== undefined && v !== null) ?? `#${id}`;
    return { value: String(id), label: String(label) };
  });

const getNextPreviewID = (items) => {
  if (!items || items.length === 0) return 1;
  const maxID = Math.max(...items.map((c) => Number(c.ID) || 0));
  return maxID + 1;
};

const formatCurrency = (val) => {
  const n = Number(val) || 0;
  return n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
};

const buildPayload = (form, isEditing) => {
  const payload = {
    ItemID: toNum(form.ItemID),
    GroupID: toNum(form.GroupID),
    SectorID: toNum(form.SectorID),
    CategoryID: toNum(form.CategoryID),
    EstimatedPrice: toNum(form.EstimatedPrice) ?? 0,
    IsActive: form.IsActive === true || form.IsActive === 1,
    IsDocShow: form.IsDocShow === true || form.IsDocShow === 1,
  };
  if (isEditing) {
    payload.ID = Number(form.ID);
  }
  return payload;
};

// ── Icons ──────────────────────────────────────────────────────────────────
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

export default function ITISpecificationSectorWise() {
  const { color } = useContext(ThemeContext);

  const [items, setItems] = useState([]);
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
  const [currentRecord, setCurrentRecord] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});

  const [categoryOptions, setCategoryOptions] = useState([]);
  const [groupOptions, setGroupOptions] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  const [sectorOptions, setSectorOptions] = useState([]);
  const [lookupsLoading, setLookupsLoading] = useState(false);

  // ── helpers ──────────────────────────────────────────────────────────────────
  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };
  const showError = (msg) => {
    setError(msg);
    setTimeout(() => setError(null), 4000);
  };

  // ── FETCH ─────────────────────────────────────────────────────────────────
  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await MasterTableService.getAllITISpecificationSectorWises();
      const raw = data?.Data ?? data?.data ?? (Array.isArray(data) ? data : []);
      setItems(normalise(raw));
    } catch (err) {
      showError(err?.response?.data?.Message || err?.message || "Failed to load specification records");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLookups = useCallback(async () => {
    setLookupsLoading(true);
    try {
      const [catRes, groupRes, itemRes, sectorRes] = await Promise.all([
        MasterTableService.getAllITISpecificationCategories(),
        MasterTableService.getAllITISpecificationGroups(),
        MasterTableService.getAllITISpecificationItems(),
        MasterTableService.getAllITISpecificationSectors(),
      ]);

      const unwrap = (res) => res?.Data ?? res?.data ?? (Array.isArray(res) ? res : []);

      setCategoryOptions(normaliseOptions(unwrap(catRes), ["CategoryName", "Category"]));
      setGroupOptions(normaliseOptions(unwrap(groupRes), ["GroupName", "Group"]));
      setItemOptions(normaliseOptions(unwrap(itemRes), ["NameofITem", "NameOfItem", "ItemName"]));
      setSectorOptions(normaliseOptions(unwrap(sectorRes), ["SectorName", "Sector"]));
    } catch (err) {
      showError(err?.response?.data?.Message || err?.message || "Failed to load dropdown lists");
    } finally {
      setLookupsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
    fetchLookups();
  }, [fetchItems, fetchLookups]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedFilter]);

  // ── NEXT ID ───────────────────────────────────────────────────────────────
  const nextPreviewID = useMemo(() => {
    if (!items || items.length === 0) return 1;
    const maxID = Math.max(...items.map((c) => Number(c.ID) || 0));
    return maxID + 1;
  }, [items]);

  // ── INSERT ────────────────────────────────────────────────────────────────
  const handleInsert = async (form) => {
    setActionLoading(true);
    try {
      const payload = buildPayload(form, false);
      const response = await MasterTableService.insertITISpecificationSectorWise(payload);
      showSuccess(response?.Data?.Message || response?.message || "Specification added successfully");
      setIsPanelOpen(false);
      await fetchItems();
    } catch (err) {
      showError(err?.response?.data?.Message || err?.message || "Failed to add specification");
    } finally {
      setActionLoading(false);
    }
  };

  // ── UPDATE ────────────────────────────────────────────────────────────────
  const handleUpdate = async (form) => {
    setActionLoading(true);
    try {
      const data = await MasterTableService.updateITISpecificationSectorWise(buildPayload(form, true));
      showSuccess(data?.Data?.Message || data?.message || "Specification updated successfully");
      setIsPanelOpen(false);
      await fetchItems();
    } catch (err) {
      showError(err?.response?.data?.Message || err?.message || "Failed to update specification");
    } finally {
      setActionLoading(false);
    }
  };

  // ── DELETE ────────────────────────────────────────────────────────────────
  const handleDelete = async (item) => {
    if (!window.confirm(`Delete Specification ID ${item.ID}?`)) return;
    setActionLoading(true);
    try {
      const data = await MasterTableService.softDeleteITISpecificationSectorWise(Number(item.ID));
      showSuccess(data?.message || data?.Data?.Message || "Specification deleted successfully");
      await fetchItems();
    } catch (err) {
      showError(err?.response?.data?.Message || err?.message || "Failed to delete specification");
    } finally {
      setActionLoading(false);
    }
  };

  // ── TOGGLE STATUS ─────────────────────────────────────────────────────────
  const toggleStatusInline = async (item) => {
    const updated = { ...item, IsActive: !item.IsActive };
    setItems((prev) => prev.map((f) => (f._rowKey === item._rowKey ? updated : f)));
    try {
      await MasterTableService.updateITISpecificationSectorWise(buildPayload(updated, true));
      showSuccess(`Status set to ${updated.IsActive ? "Active" : "Inactive"}`);
    } catch (err) {
      setItems((prev) => prev.map((f) => (f._rowKey === item._rowKey ? item : f)));
      showError(err?.response?.data?.Message || err?.message || "Failed to update status");
    }
  };

  const toggleDocShowInline = async (item) => {
    const updated = { ...item, IsDocShow: !item.IsDocShow };
    setItems((prev) => prev.map((f) => (f._rowKey === item._rowKey ? updated : f)));
    try {
      await MasterTableService.updateITISpecificationSectorWise(buildPayload(updated, true));
      showSuccess(`Doc Show set to ${updated.IsDocShow ? "Yes" : "No"}`);
    } catch (err) {
      setItems((prev) => prev.map((f) => (f._rowKey === item._rowKey ? item : f)));
      showError(err?.response?.data?.Message || err?.message || "Failed to update Doc Show");
    }
  };

  // ── LABEL LOOKUPS ─────────────────────────────────────────────────────────
  const labelFor = (options, id) => {
    if (id === null || id === undefined || id === "") return null;
    const match = options.find((o) => o.value === String(id));
    return match ? match.label : null;
  };
  
  const getCategoryLabel = (id) => labelFor(categoryOptions, id);
  const getGroupLabel = (id) => labelFor(groupOptions, id);
  const getItemLabel = (id) => labelFor(itemOptions, id);
  const getSectorLabel = (id) => labelFor(sectorOptions, id);

  // ── FORM SUBMIT ───────────────────────────────────────────────────────────
  const handleFormSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (currentRecord.ItemID === "" || currentRecord.ItemID === null) errs.ItemID = true;
    if (currentRecord.GroupID === "" || currentRecord.GroupID === null) errs.GroupID = true;
    if (currentRecord.SectorID === "" || currentRecord.SectorID === null) errs.SectorID = true;
    if (currentRecord.CategoryID === "" || currentRecord.CategoryID === null) errs.CategoryID = true;
    if (currentRecord.EstimatedPrice === "" || currentRecord.EstimatedPrice === null) errs.EstimatedPrice = true;
    setFormErrors(errs);
    if (Object.keys(errs).length > 0) {
      showError("Please fill all required fields");
      return;
    }
    isEditing ? handleUpdate(currentRecord) : handleInsert(currentRecord);
  };

  const handleOpenPanel = (record = EMPTY_FORM, editMode = false) => {
    setFormErrors({});
    if (editMode) {
      setCurrentRecord({
        ...record,
        ItemID: record.ItemID != null ? String(record.ItemID) : "",
        GroupID: record.GroupID != null ? String(record.GroupID) : "",
        SectorID: record.SectorID != null ? String(record.SectorID) : "",
        CategoryID: record.CategoryID != null ? String(record.CategoryID) : "",
        IsActive: record.IsActive ?? true,
        IsDocShow: record.IsDocShow ?? false,
      });
    } else {
      setCurrentRecord({
        ...EMPTY_FORM,
        ID: nextPreviewID,
      });
    }
    setIsEditing(editMode);
    setIsPanelOpen(true);
  };

  const set = (field) => (e) => setCurrentRecord((p) => ({ ...p, [field]: e.target.value }));
  const setDropdown = (field) => (val) => setCurrentRecord((p) => ({ ...p, [field]: val }));

  // ── FILTERING ─────────────────────────────────────────────────────────────
  const filteredItems = items.filter((f) => {
    const matchStatus =
      selectedFilter === "All" ? true : selectedFilter === "Active" ? f.IsActive : !f.IsActive;
    
    const itemLabel = getItemLabel(f.ItemID);
    const groupLabel = getGroupLabel(f.GroupID);
    const sectorLabel = getSectorLabel(f.SectorID);
    const categoryLabel = getCategoryLabel(f.CategoryID);
    
    const haystack = [
      String(f.ID),
      String(f.ItemID),
      String(f.GroupID),
      String(f.SectorID),
      String(f.CategoryID),
      itemLabel || "",
      groupLabel || "",
      sectorLabel || "",
      categoryLabel || "",
    ]
      .join(" ")
      .toLowerCase();
    const matchSearch = searchTerm ? haystack.includes(searchTerm.toLowerCase()) : true;
    return matchStatus && matchSearch;
  });

  // ── SORTED ITEMS ─────────────────────────────────────────────────────────
  const sortedItems = [...filteredItems].sort((a, b) => (a.ID ?? 0) - (b.ID ?? 0));

  const stats = {
    Total: items.length,
    Active: items.filter((f) => f.IsActive).length,
    Inactive: items.filter((f) => !f.IsActive).length,
    DocShown: items.filter((f) => f.IsDocShow).length,
  };

  // ── TABLE COLUMNS ──────────────────────────────────────────────────────────
  const columns = [
    {
      key: "ID",
      header: "ID",
      width: "80px",
      headerClassName: "text-center",
      className: "text-center font-mono",
    },
    {
      key: "ItemID",
      header: "Item",
      className: "font-medium",
      width: "250px",
    },
    {
      key: "GroupID",
      header: "Group",
      width: "150px",
    },
    {
      key: "SectorID",
      header: "Sector",
      width: "150px",
    },
    {
      key: "CategoryID",
      header: "Category",
      width: "150px",
    },
    {
      key: "EstimatedPrice",
      header: "Est. Price",
      headerClassName: "text-right",
      className: "text-right font-mono",
      width: "120px",
    },
    {
      key: "IsDocShow",
      header: "Doc Show",
      headerClassName: "text-center",
      className: "text-center",
      sortable: false,
      width: "100px",
    },
    {
      key: "IsActive",
      header: "Status",
      sortable: false,
      width: "120px",
    },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "text-right",
      className: "text-right",
      sortable: false,
      excludeFromExport: true,
      width: "100px",
    },
  ];

  const renderCell = (item, column) => {
    switch (column.key) {
      case "ID":
        return <span className="font-mono text-slate-600 font-medium">{item.ID}</span>;
case "ItemID": {
  const label = getItemLabel(item.ItemID);
  return (
    <div className="font-medium text-slate-800">{label || `Item #${item.ItemID}`}</div>
  );
}

case "GroupID": {
  const label = getGroupLabel(item.GroupID);
  return (
    <div className="font-medium text-slate-700">{label || `Group #${item.GroupID}`}</div>
  );
}

case "SectorID": {
  const label = getSectorLabel(item.SectorID);
  return (
    <div className="font-medium text-slate-700">{label || `Sector #${item.SectorID}`}</div>
  );
}

      case "CategoryID": {
        const label = getCategoryLabel(item.CategoryID);
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-100">
            {label || `Category #${item.CategoryID}`}
          </span>
        );
      }

      case "EstimatedPrice":
        return <span className="font-mono text-slate-800 font-medium">₹{formatCurrency(item.EstimatedPrice)}</span>;

      case "IsDocShow":
        return (
          <button
            onClick={() => toggleDocShowInline(item)}
            disabled={actionLoading}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium border text-xs transition-all active:scale-95 disabled:opacity-50 ${
              item.IsDocShow
                ? "bg-sky-50 border-sky-200 text-sky-700 hover:bg-sky-100"
                : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${item.IsDocShow ? "bg-sky-500" : "bg-slate-400"}`} />
            {item.IsDocShow ? "Yes" : "No"}
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
              aria-label={`Edit specification ${item.ID}`}
              className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-violet-600 bg-violet-50 hover:bg-violet-600 hover:text-white transition-all active:scale-95"
            >
              <EditIcon />
            </button>
            <button
              type="button"
              onClick={() => handleDelete(item)}
              disabled={actionLoading}
              title="Delete"
              aria-label={`Delete specification ${item.ID}`}
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
              S
            </div>
            <h1 className="text-md font-bold tracking-tight text-slate-900">
              ITI Specification (Sector Wise)
            </h1>
          </div>
        </header>

        <div className="flex flex-1 relative overflow-hidden">
          <main className="flex-1 p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full">
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
                <div>
                  <p className="text-xs text-slate-500 font-medium">Total Records</p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.Total.toLocaleString()}</h3>
                </div>
                <span className="p-2 bg-slate-100 rounded-lg text-xl">📊</span>
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
                <span className="p-2 bg-rose-50 text-rose-700 rounded-lg text-xs font-bold">○ Off</span>
              </div>
              <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
                <div>
                  <p className="text-xs text-sky-600 font-medium">Doc Shown</p>
                  <h3 className="text-2xl font-bold text-sky-600 mt-1">{stats.DocShown.toLocaleString()}</h3>
                </div>
                <span className="p-2 bg-sky-50 text-sky-700 rounded-lg text-xs font-bold">📄</span>
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

            {/* Toolbar — Search and Add New Record */}
            <div className="flex items-center gap-3">
              <div className="flex-1 flex justify-center">
                {/* <div className="relative w-full max-w-sm">
                  <input
                    type="text"
                    placeholder="🔍 Search specifications..."
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
              data={sortedItems}
              columns={columns}
              renderCell={renderCell}
              loading={loading}
              tableId="iti-specification-table"
              emptyStateMessage="No specification records found"
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
                      {isEditing ? "✏️ Edit Specification" : "✨ Add New Specification"}
                    </h3>
                    <p className="text-xs text-violet-100 mt-0.5">
                      {isEditing ? "Update the specification record below" : "Fill in all fields to create a new specification"}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsPanelOpen(false)}
                    className="opacity-80 hover:opacity-100 text-xl p-2 hover:bg-white/20 rounded-lg transition-all"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleFormSubmit} className="p-6 flex-1 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4">
                    {/* ID - Always visible, read-only */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        ID
                        <span className="text-slate-400 font-normal ml-1">
                          {isEditing ? "(RO)" : "(auto)"}
                        </span>
                      </label>
                      <input
                        type="text"
                        value={currentRecord.ID ?? ""}
                        disabled
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-mono bg-slate-50 text-slate-500 cursor-not-allowed"
                      />
                    </div>

                    {/* Estimated Price */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Est. Price <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={currentRecord.EstimatedPrice}
                          onChange={set("EstimatedPrice")}
                          placeholder="0.00"
                          className={`w-full pl-7 pr-3 py-2.5 border rounded-lg text-sm text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all placeholder:text-slate-300 ${
                            formErrors.EstimatedPrice ? "border-rose-400" : "border-slate-200"
                          }`}
                        />
                      </div>
                    </div>

                    {/* Dropdowns - Item, Group, Sector, Category */}
                    <div className="col-span-2 grid grid-cols-2 gap-4">
                      <DropdownComponent
                        label="Item"
                        options={itemOptions}
                        value={currentRecord.ItemID}
                        onChange={setDropdown("ItemID")}
                        error={formErrors.ItemID}
                        required
                        loading={lookupsLoading}
                      />
                      <DropdownComponent
                        label="Group"
                        options={groupOptions}
                        value={currentRecord.GroupID}
                        onChange={setDropdown("GroupID")}
                        error={formErrors.GroupID}
                        required
                        loading={lookupsLoading}
                      />
                      <DropdownComponent
                        label="Sector"
                        options={sectorOptions}
                        value={currentRecord.SectorID}
                        onChange={setDropdown("SectorID")}
                        error={formErrors.SectorID}
                        required
                        loading={lookupsLoading}
                      />
                      <DropdownComponent
                        label="Category"
                        options={categoryOptions}
                        value={currentRecord.CategoryID}
                        onChange={setDropdown("CategoryID")}
                        error={formErrors.CategoryID}
                        required
                        loading={lookupsLoading}
                      />
                    </div>

                    {/* IsActive Toggle */}
                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-semibold text-slate-800 block select-none">Status</label>
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
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                              currentRecord.IsActive ? "translate-x-6" : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* IsDocShow Toggle */}
                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-semibold text-slate-800 block select-none">Doc Show</label>
                          <span className="text-[11px] text-slate-500 block mt-0.5">
                            {currentRecord.IsDocShow ? "Document visible" : "Document hidden"}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCurrentRecord((p) => ({ ...p, IsDocShow: !p.IsDocShow }))}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 shrink-0 ${
                            currentRecord.IsDocShow ? "bg-sky-600" : "bg-slate-300"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                              currentRecord.IsDocShow ? "translate-x-6" : "translate-x-1"
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
                          ["ID", `#${currentRecord.ID ?? "Auto"}`],
                          ["Item", currentRecord.ItemID ? (labelFor(itemOptions, currentRecord.ItemID) || `Item #${currentRecord.ItemID}`) : "—"],
                          ["Group", currentRecord.GroupID ? (labelFor(groupOptions, currentRecord.GroupID) || `Group #${currentRecord.GroupID}`) : "—"],
                          ["Sector", currentRecord.SectorID ? (labelFor(sectorOptions, currentRecord.SectorID) || `Sector #${currentRecord.SectorID}`) : "—"],
                          ["Category", currentRecord.CategoryID ? (labelFor(categoryOptions, currentRecord.CategoryID) || `Category #${currentRecord.CategoryID}`) : "—"],
                        ].map(([label, val]) => (
                          <div key={label} className="flex justify-between text-sm py-1 border-b border-violet-100">
                            <span className="text-slate-500">{label}</span>
                            <span className="font-mono font-semibold text-slate-800 text-right max-w-[60%] truncate">{val}</span>
                          </div>
                        ))}
                        <div className="flex justify-between text-sm py-1 border-b border-violet-100">
                          <span className="text-slate-500">Est. Price</span>
                          <span className="font-mono font-semibold text-slate-800">
                            ₹{formatCurrency(currentRecord.EstimatedPrice)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm py-1">
                          <span className="text-slate-500">Status</span>
                          <span className={`font-semibold ${currentRecord.IsActive ? "text-emerald-600" : "text-rose-600"}`}>
                            {currentRecord.IsActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm py-1">
                          <span className="text-slate-500">Doc Show</span>
                          <span className={`font-semibold ${currentRecord.IsDocShow ? "text-sky-600" : "text-slate-500"}`}>
                            {currentRecord.IsDocShow ? "Yes" : "No"}
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
                    {isEditing ? "💾 Save Changes" : "➕ Add Specification"}
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