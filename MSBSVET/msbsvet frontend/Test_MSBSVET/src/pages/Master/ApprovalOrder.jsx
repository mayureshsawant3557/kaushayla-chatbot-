import React, { useState, useEffect, useCallback, useContext } from "react";
import Swal from "sweetalert2";
import { FaUpload, FaEye, FaTrash } from "react-icons/fa";
import { MasterTableService } from "../../lib/services/MasterTableService";
import FilteredTableComponent from "../../Component/formcomponent/FilteredTableComponent";
import { ThemeContext } from "../../Component/Context/ThemeContext";

const EMPTY_FORM = {
  ID:                  null,
  ApprovalOrderNo:     "",
  ApprovalOrderDate:   "",
  ApprovalOrder:       "",
  ApprovalOrderRemakr: "",
  IsActive:            true,
};

// Document upload constraints for the "Approval Order" file
const ALLOWED_DOC_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const MAX_DOC_SIZE      = 5 * 1024 * 1024; // 5 MB

// ── small inline icons (kept dependency-free, consistent with Back/Close icons) ─
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

// ── Helpers ───────────────────────────────────────────────────────────────────

const toDateInput = (val) => {
  if (!val) return "";
  const d = new Date(val);
  if (isNaN(d)) return "";
  return d.toISOString().split("T")[0];
};

const normalise = (raw) =>
  raw.map((item, i) => ({
    _rowKey:             `row-${i}`,
    ID:                  item.ID != null ? Number(item.ID) : null,
    ApprovalOrderNo:     item.ApprovalOrderNo     ?? "",
    ApprovalOrderDate:   toDateInput(item.ApprovalOrderDate),
    ApprovalOrder:       item.ApprovalOrder        ?? "",
    ApprovalOrderRemakr: item.ApprovalOrderRemakr  ?? "",
    IsActive:            item.IsActive === true || item.IsActive === 1,
  }));

// Always include ID — same fix as Country bug
const buildPayload = (form) => ({
  ID:                  Number(form.ID),
  ApprovalOrderNo:     (form.ApprovalOrderNo    ?? "").trim(),
  ApprovalOrderDate:   form.ApprovalOrderDate   || null,
  ApprovalOrder:       (form.ApprovalOrder       ?? "").trim(),
  ApprovalOrderRemakr: (form.ApprovalOrderRemakr ?? "").trim(),
  IsActive:            form.IsActive === true || form.IsActive === 1,
});

// ── Component ─────────────────────────────────────────────────────────────────
export default function MasterApprovalOrder() {
  const { color } = useContext(ThemeContext); // drives the AO avatar + primary buttons below

  const [orders, setOrders]               = useState([]);
  const [loading, setLoading]             = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [error, setError]                 = useState(null);
  const [successMsg, setSuccessMsg]       = useState(null);
  const [nextID, setNextID]               = useState(null); // ← auto ID

  const [isPanelOpen, setIsPanelOpen]     = useState(false);
  const [isEditing, setIsEditing]         = useState(false);
  const [currentRecord, setCurrentRecord] = useState(EMPTY_FORM);

  // ── Document upload state ───────────────────────────────────────────────
  const [orderFile, setOrderFile]       = useState(null);   // File object for a newly-picked upload
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [previewUrl, setPreviewUrl]     = useState(null);
  const [previewType, setPreviewType]   = useState(null);

  const showSuccess = (msg) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(null), 3000); };
  const showError   = (msg) => { setError(msg);      setTimeout(() => setError(null),      4000); };

  // ── FETCH ─────────────────────────────────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await MasterTableService.getAllApprovalOrders();
      const raw  = data?.Data ?? data?.data ?? (Array.isArray(data) ? data : []);
      const normalised = normalise(raw);
      setOrders(normalised);

      // ── Auto-compute next ID (max + 1) ──────────────────────────────────
      const ids  = normalised.map((o) => o.ID).filter((id) => id != null && !isNaN(id));
      const next = ids.length > 0 ? Math.max(...ids) + 1 : 1;
      setNextID(next);
    } catch (err) {
      showError(err?.response?.data?.Message || err?.message || "Failed to load approval orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // ── INSERT ────────────────────────────────────────────────────────────────
  const handleInsert = async (form) => {
    setActionLoading(true);
    try {
      const response = await MasterTableService.insertApprovalOrder(buildPayload(form));
      showSuccess(response?.Data?.Message || response?.message || "Approval order added successfully");
      setIsPanelOpen(false);
      await fetchOrders();
    } catch (err) {
      showError(err?.response?.data?.Message || err?.message || "Failed to add approval order");
    } finally { setActionLoading(false); }
  };

  // ── UPDATE ────────────────────────────────────────────────────────────────
  const handleUpdate = async (form) => {
    setActionLoading(true);
    try {
      const data = await MasterTableService.updateApprovalOrder(buildPayload(form));
      showSuccess(data?.Data?.Message || data?.message || "Approval order updated successfully");
      setIsPanelOpen(false);
      await fetchOrders();
    } catch (err) {
      showError(err?.response?.data?.Message || err?.message || "Failed to update approval order");
    } finally { setActionLoading(false); }
  };

  // ── DELETE ────────────────────────────────────────────────────────────────
  const handleDelete = async (id, orderNo) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      html: `You are about to delete approval order <strong>"${orderNo}"</strong> (ID: ${id}).<br />This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return;

    setActionLoading(true);
    try {
      const data = await MasterTableService.softDeleteApprovalOrder(Number(id));
      showSuccess(data?.message || data?.Data?.Message || "Approval order deleted successfully");
      await fetchOrders();
    } catch (err) {
      showError(err?.response?.data?.Message || err?.message || "Failed to delete approval order");
    } finally { setActionLoading(false); }
  };

  // ── TOGGLE STATUS ─────────────────────────────────────────────────────────
  const toggleStatusInline = async (item) => {
    const updated = { ...item, IsActive: !item.IsActive };
    setOrders((prev) => prev.map((o) => (o._rowKey === item._rowKey ? updated : o)));
    try {
      await MasterTableService.updateApprovalOrder(buildPayload(updated));
      showSuccess(`Status set to ${updated.IsActive ? "Active" : "Inactive"}`);
    } catch (err) {
      setOrders((prev) => prev.map((o) => (o._rowKey === item._rowKey ? item : o)));
      showError(err?.response?.data?.Message || err?.message || "Failed to update status");
    }
  };

  // ── DOCUMENT UPLOAD ──────────────────────────────────────────────────────
  // TODO: wire this to your real upload endpoint. It should upload `file`
  // and resolve with the hosted URL that gets saved into ApprovalOrder
  // (e.g. MasterTableService.uploadApprovalDocument). Right now it just
  // creates a temporary local blob URL so the UI is fully wired end to end.
  const uploadFileToServer = async (file) => {
    // const formData = new FormData();
    // formData.append("file", file);
    // const res = await MasterTableService.uploadApprovalDocument(formData);
    // return res?.Data?.Url;
    return URL.createObjectURL(file);
  };

  const handleDocumentUpload = () => {
    Swal.fire({
      title: "<strong>Upload Approval Order Document</strong>",
      html: `
        <div style="padding:15px;border-radius:10px;border:1px solid #ddd;box-shadow:0px 2px 10px rgba(0,0,0,0.1);background:#fff;text-align:center;">
          <div style="margin-bottom:10px;text-align:left;">
            <p><span style="font-size:18px;">📁</span> <strong>Allowed File Types:</strong> PDF, JPG, PNG</p>
            <p><span style="font-size:18px;">📝</span> <strong>Max File Size:</strong> ${(MAX_DOC_SIZE / (1024 * 1024)).toFixed(2)} MB</p>
          </div>
          <label for="orderFileInput" style="font-weight:bold;display:block;margin-bottom:8px;">
            📤 Select File to Upload <span style="color:red;">*</span>
          </label>
          <div style="display:flex;justify-content:center;">
            <input type="file" id="orderFileInput" class="swal2-input"
              accept="${ALLOWED_DOC_TYPES.join(",")}"
              style="display:block;width:80%;padding:8px;border:1px solid #ccc;border-radius:5px;margin-bottom:10px;"/>
          </div>
          <p id="orderFileError" style="color:red;font-size:14px;margin-top:5px;"></p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Upload",
      allowOutsideClick: false,
      preConfirm: async () => {
        const fileInput    = document.getElementById("orderFileInput");
        const file         = fileInput.files[0];
        const errorMessage = document.getElementById("orderFileError");

        if (!file) {
          errorMessage.textContent = "⚠️ Please select a file!";
          return false;
        }
        if (!ALLOWED_DOC_TYPES.includes(file.type)) {
          errorMessage.textContent = "⚠️ Invalid file type! Allowed: PDF, JPG, PNG";
          return false;
        }
        if (file.size > MAX_DOC_SIZE) {
          errorMessage.textContent = `⚠️ File too large! Max: ${(MAX_DOC_SIZE / (1024 * 1024)).toFixed(2)} MB`;
          return false;
        }

        try {
          setUploadingDoc(true);
          const url = await uploadFileToServer(file);
          setOrderFile(file);
          setCurrentRecord((p) => ({ ...p, ApprovalOrder: url }));
        } catch (err) {
          errorMessage.textContent = "⚠️ Upload failed. Please try again.";
          return false;
        } finally {
          setUploadingDoc(false);
        }
      }
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          icon: "success",
          title: "Document Uploaded!",
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  };

  const previewDocument = () => {
    if (orderFile) {
      const url = URL.createObjectURL(orderFile);
      setPreviewUrl(url);
      setPreviewType(orderFile.type);
    } else if (currentRecord.ApprovalOrder) {
      setPreviewUrl(currentRecord.ApprovalOrder);
      setPreviewType(
        currentRecord.ApprovalOrder.toLowerCase().endsWith(".pdf") ? "application/pdf" : "image"
      );
    }
  };

  const closeDocPreview = () => {
    if (previewUrl && orderFile) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPreviewType(null);
  };

  const removeDocument = () => {
    setOrderFile(null);
    setCurrentRecord((p) => ({ ...p, ApprovalOrder: "" }));
  };

  // ── FORM SUBMIT ───────────────────────────────────────────────────────────
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!currentRecord.ApprovalOrderNo?.trim()) { showError("Approval Order No is required");   return; }
    if (!currentRecord.ApprovalOrderDate)        { showError("Approval Order Date is required"); return; }
    if (!currentRecord.ApprovalOrder?.trim())    { showError("Approval Order document is required"); return; }
    isEditing ? handleUpdate(currentRecord) : handleInsert(currentRecord);
  };

  // ── Open panel — auto-inject nextID for Add mode ──────────────────────────
  const handleOpenPanel = (record = EMPTY_FORM, editMode = false) => {
    setOrderFile(null);
    if (editMode) {
      setCurrentRecord({ ...record, IsActive: record.IsActive ?? true });
    } else {
      setCurrentRecord({ ...EMPTY_FORM, ID: nextID, IsActive: true });
    }
    setIsEditing(editMode);
    setIsPanelOpen(true);
  };

  const set = (field) => (e) => setCurrentRecord((p) => ({ ...p, [field]: e.target.value }));

  // ── STATUS TAB FILTER (search/sort/pagination/export live inside FilteredTableComponent) ──
  const statusFilteredOrders = orders.filter((o) => {
    if (selectedFilter === "Active") return o.IsActive;
    if (selectedFilter === "Inactive") return !o.IsActive;
    return true;
  });

  const stats = {
    TotalCount:    orders.length,
    ActiveCount:   orders.filter((o) =>  o.IsActive).length,
    InactiveCount: orders.filter((o) => !o.IsActive).length,
  };

  // ── TABLE COLUMNS FOR FilteredTableComponent ──────────────────────────────
  const columns = [
    { key: "ID", header: "ID", width: "70px", headerClassName: "text-center", className: "text-center font-mono" },
    { key: "ApprovalOrderNo", header: "Order No", className: "font-medium" },
    { key: "ApprovalOrderDate", header: "Order Date" },
    { key: "ApprovalOrder", header: "Document", sortable: false },
    { key: "ApprovalOrderRemakr", header: "Remark" },
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

  const renderOrderCell = (item, column) => {
    switch (column.key) {
      case "ApprovalOrderDate":
        return item.ApprovalOrderDate || "—";

      case "ApprovalOrder":
        return item.ApprovalOrder ? (
          <a
            href={item.ApprovalOrder}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:underline text-xs truncate inline-flex items-center max-w-[220px]"
            title={item.ApprovalOrder}
          >
            📄 View Document
          </a>
        ) : (
          <span className="text-slate-400 text-xs">—</span>
        );

      case "ApprovalOrderRemakr":
        return item.ApprovalOrderRemakr || <span className="text-slate-300">—</span>;

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
              aria-label={`Edit ${item.ApprovalOrderNo}`}
              className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-violet-600 bg-violet-50 hover:bg-violet-600 hover:text-white transition-all active:scale-95"
            >
              <EditIcon />
            </button>
            <button
              type="button"
              onClick={() => handleDelete(item.ID, item.ApprovalOrderNo)}
              disabled={actionLoading}
              title="Delete"
              aria-label={`Delete ${item.ApprovalOrderNo}`}
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
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased flex flex-col">

      {/* Toasts */}
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
            AO
          </div>
          <h1 className="text-md font-bold tracking-tight text-slate-900">Master Approval Orders</h1>
        </div>
      </header>

      <div className="flex flex-1 relative overflow-hidden">
        <main className="flex-1 p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full">

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
              <div>
                <p className="text-xs text-slate-500 font-medium">Total Orders</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.TotalCount.toLocaleString()}</h3>
              </div>
              <span className="p-2 bg-slate-100 rounded-lg text-xl">📋</span>
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

          {/* Toolbar — Add New Record (search lives inside FilteredTableComponent) */}
          <div className="flex items-center gap-3">
            <div className="flex-1" />
            <button
              onClick={() => handleOpenPanel(EMPTY_FORM, false)}
              className={`shrink-0 ${color} text-white text-xs font-semibold px-4 py-2 rounded-xl active:scale-95 transition-all shadow-md whitespace-nowrap hover:opacity-90`}
            >
              + Add New Record
            </button>
          </div>

          {/* Table */}
          <FilteredTableComponent
            data={statusFilteredOrders}
            columns={columns}
            renderCell={renderOrderCell}
            loading={loading}
            tableId="approval-orders-table"
            emptyStateMessage="No approval order records found"
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
                    {isEditing ? "✏️ Edit Approval Order" : "✨ Add New Approval Order"}
                  </h3>
                  <p className="text-xs text-white/80 mt-0.5">
                    {isEditing ? "Update the record below" : "Fill in the fields to create a new order"}
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
                      ID <span className="text-slate-400 font-normal ml-1">{isEditing ? "(RO)" : "(auto)"}</span>
                    </label>
                    <input
                      type="number"
                      value={currentRecord.ID ?? ""}
                      disabled
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-mono bg-slate-50 text-slate-500 cursor-not-allowed"
                    />
                  </div>

                  {/* Approval Order No */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      Approval Order No <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={currentRecord.ApprovalOrderNo}
                      onChange={set("ApprovalOrderNo")}
                      placeholder="e.g., 2024/09/9989"
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all placeholder:text-slate-300"
                    />
                  </div>

                  {/* Approval Order Date */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      Approval Order Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={currentRecord.ApprovalOrderDate}
                      onChange={set("ApprovalOrderDate")}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all"
                    />
                  </div>

                  {/* Approval Order Document (upload) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      Approval Order Document <span className="text-rose-500">*</span>
                    </label>

                    {!currentRecord.ApprovalOrder ? (
                      <button
                        type="button"
                        onClick={handleDocumentUpload}
                        disabled={uploadingDoc}
                        className="w-full flex items-center justify-center gap-2 px-3 py-3 border-2 border-dashed border-slate-300 rounded-lg text-sm text-slate-500 hover:border-violet-400 hover:text-violet-600 transition-all disabled:opacity-50"
                      >
                        <FaUpload /> {uploadingDoc ? "Uploading..." : "Upload Document"}
                      </button>
                    ) : (
                      <div className="flex items-center justify-between gap-2 px-3 py-2.5 border border-slate-200 rounded-lg bg-slate-50">
                        <span className="text-xs text-slate-600 truncate max-w-[180px]">
                          📄 {orderFile ? orderFile.name : "Uploaded document"}
                        </span>
                        <div className="flex items-center gap-3 shrink-0">
                          <button type="button" onClick={previewDocument} className="text-violet-600 hover:text-purple-600" title="Preview">
                            <FaEye size={16} />
                          </button>
                          <button type="button" onClick={handleDocumentUpload} className="text-violet-600 hover:text-green-600" title="Replace">
                            <FaUpload size={16} />
                          </button>
                          <button type="button" onClick={removeDocument} className="text-rose-500 hover:text-rose-700" title="Remove">
                            <FaTrash size={16} />
                          </button>
                        </div>
                      </div>
                    )}
                    <p className="text-[11px] text-slate-400 mt-1">Allowed: PDF, JPG, PNG · Max {(MAX_DOC_SIZE / (1024 * 1024)).toFixed(0)} MB</p>
                  </div>

                  {/* Remark */}
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      Remark
                    </label>
                    <textarea
                      rows={2}
                      value={currentRecord.ApprovalOrderRemakr}
                      onChange={set("ApprovalOrderRemakr")}
                      placeholder="Optional remark..."
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all placeholder:text-slate-300 resize-none"
                    />
                  </div>

                  {/* IsActive Toggle */}
                  <div className="col-span-2 bg-slate-50 border border-slate-200 p-3 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-semibold text-slate-800 block select-none">Status</label>
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                          {currentRecord.IsActive ? "Order is active and visible" : "Order is disabled and hidden"}
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
                        ["ID",         isEditing ? `#${currentRecord.ID}` : `#${nextID ?? "…"}`],
                        ["Order No",   currentRecord.ApprovalOrderNo || "—"],
                        ["Date",       currentRecord.ApprovalOrderDate || "—"],
                        ["Document",   currentRecord.ApprovalOrder ? "Attached ✓" : "—"],
                      ].map(([label, val]) => (
                        <div key={label} className="flex justify-between text-sm py-1 border-b border-violet-100">
                          <span className="text-slate-500">{label}</span>
                          <span className="font-mono font-semibold text-slate-800 text-right max-w-[60%] truncate">{val}</span>
                        </div>
                      ))}
                      <div className="flex justify-between text-sm py-1 border-b border-violet-100">
                        <span className="text-slate-500">Remark</span>
                        <span className="font-mono font-semibold text-slate-800 text-right max-w-[60%] truncate">
                          {currentRecord.ApprovalOrderRemakr || "—"}
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

                {/* Hidden submit for Enter key support */}
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
                  {isEditing ? "💾 Save Changes" : "➕ Add Order"}
                </button>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* Document Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[9999]">
          <div className="relative h-[80vh] w-full max-w-4xl rounded-lg bg-white shadow-lg">
            <button
              className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-800"
              onClick={closeDocPreview}
            >
              &times;
            </button>
            {previewType === "application/pdf" ? (
              <iframe src={previewUrl} title="Document Preview" className="h-full w-full rounded-b-lg" allowFullScreen />
            ) : (
              <img src={previewUrl} alt="Preview" className="max-h-full max-w-full mx-auto rounded-b-lg" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}