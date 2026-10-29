import React, { useState, useEffect, useCallback, useMemo, useContext } from "react";
import { MasterTableService } from "../../lib/services/MasterTableService";
import UploadPdf from "../../Component/formcomponent/UploadPdf";
import FilteredTableComponent from "../../Component/formcomponent/FilteredTableComponent";
import { ThemeContext } from "../../Component/Context/ThemeContext";
import Loader from "../../Component/formcomponent/Loader";

const EMPTY_FORM = {
  ID: "",
  SignatureType: "",
  NameOfAuthority: "",
  Designation: "",
  SignaturePath: "",
  IsActive: true,
  IsCurrent: true,
};

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "application/pdf"];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

// ── helpers ──────────────────────────────────────────────────────────────────
const unwrapObject = (val) => {
  if (!val || typeof val !== "object") return null;
  return val;
};

const findFirstString = (val, keys, seen = new Set()) => {
  if (val == null || typeof val !== "object") return typeof val === "string" ? val : "";
  if (seen.has(val)) return ""; // guard against circular refs
  seen.add(val);

  for (const k of Object.keys(val)) {
    if (keys.some((target) => target.toLowerCase() === k.toLowerCase())) {
      const v = val[k];
      if (typeof v === "string" && v.trim()) return v;
    }
  }
  for (const k of Object.keys(val)) {
    const v = val[k];
    if (v && typeof v === "object") {
      const found = findFirstString(v, keys, seen);
      if (found) return found;
    }
  }
  return "";
};

const extractApiMessage = (val) => {
  if (!val || typeof val !== "object") return "";
  return findFirstString(val, ["message", "Message", "error", "Error", "title", "Title"]) || "";
};

const buildPayload = (form, signaturePathOverride) => ({
  ID: Number(form.ID) || 0,
  SignatureType: (form.SignatureType ?? "").trim(),
  NameOfAuthority: (form.NameOfAuthority ?? "").trim(),
  Designation: (form.Designation ?? "").trim(),
  SignaturePath: signaturePathOverride ?? form.SignaturePath ?? "",
  IsActive: form.IsActive === true || form.IsActive === 1,
  IsCurrent: form.IsCurrent === true || form.IsCurrent === 1,
});

const field = (obj, name) => {
  if (obj == null) return undefined;
  if (obj[name] !== undefined) return obj[name];
  const lower = name.toLowerCase();
  const matchKey = Object.keys(obj).find((k) => k.toLowerCase() === lower);
  return matchKey ? obj[matchKey] : undefined;
};

const extractArrayFromResponse = (data) => {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== "object") return [];

  const wrapperKeys = ["Data", "data", "Result", "result", "Items", "items", "DataList", "dataList"];
  for (const key of wrapperKeys) {
    if (Array.isArray(data[key])) return data[key];
  }

  if (data.ID !== undefined) return [data];

  // one level of nesting
  for (const key of Object.keys(data)) {
    const nested = data[key];
    if (nested && typeof nested === "object") {
      for (const nestedKey of wrapperKeys) {
        if (Array.isArray(nested[nestedKey])) return nested[nestedKey];
      }
    }
  }

  // last resort: any array anywhere on the object
  for (const key of Object.keys(data)) {
    if (Array.isArray(data[key])) return data[key];
  }

  return [];
};

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

export default function MasterSignatureAuthority() {
  const { color } = useContext(ThemeContext);

  const [authorities, setAuthorities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAuthority, setCurrentAuthority] = useState(EMPTY_FORM);

  // ── Document upload state ──
  const [signatureFile, setSignatureFile] = useState(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewType, setPreviewType] = useState(null);

  // Current logged-in user — read once so it can be reused (auth check +
  // passed into UploadPdf for its Azure folder path/filename), same pattern
  // as SelfDeclaration.jsx's useAuth().userInfo.
  const currentUser = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem("userInfoAll") || "null");
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!currentUser || Number(currentUser.UserTypeID) !== 11) {
      window.location.href = "http://localhost:5173/react";
    }
  }, [currentUser]);

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
  const fetchAuthorities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await MasterTableService.getAllSignatureAuthorities();
      const raw = extractArrayFromResponse(data);

      const mapped = raw.map((item) => ({
        ID: field(item, "ID") ?? "",
        SignatureType: field(item, "SignatureType") ?? "",
        NameOfAuthority: field(item, "NameOfAuthority") ?? "",
        Designation: field(item, "Designation") ?? "",
        SignaturePath: field(item, "SignaturePath") ?? "",
        IsActive: field(item, "IsActive") ?? true,
        IsCurrent: field(item, "IsCurrent") ?? true,
      }));

      setAuthorities(mapped);
    } catch (err) {
      console.error("Error fetching authorities:", err);
      showError(
        err?.response?.data?.Message ||
        err?.response?.data?.message ||
        "Failed to load signature authorities"
      );
      setAuthorities([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAuthorities(); }, [fetchAuthorities]);
  useEffect(() => { }, [searchTerm, selectedFilter]);

  // ── NEXT ID ───────────────────────────────────────────────────────────────
  const nextId = useMemo(() => {
    if (!authorities || authorities.length === 0) return 1;
    const maxId = Math.max(...authorities.map((t) => Number(t.ID) || 0));
    return maxId + 1;
  }, [authorities]);

  // ── UPLOAD ────────────────────────────────────────────────────────────────
  const handleSignatureFileUpload = async (fileData) => {
    setUploadingDoc(true);
    try {
      const path = fileData?.filePath;
      if (!path) {
        throw new Error("Upload succeeded but no file path was returned.");
      }
      setSignatureFile(fileData?.file || null);
      setCurrentAuthority((p) => ({ ...p, SignaturePath: path }));
      showSuccess("Signature document uploaded successfully.");
    } catch (err) {
      showError(err?.message || "Failed to upload signature document.");
    } finally {
      setUploadingDoc(false);
    }
  };

  const previewDocument = () => {
    if (signatureFile) {
      const url = URL.createObjectURL(signatureFile);
      setPreviewUrl(url);
      setPreviewType(signatureFile.type);
    } else if (currentAuthority.SignaturePath) {
      setPreviewUrl(currentAuthority.SignaturePath);
      setPreviewType(
        currentAuthority.SignaturePath.toLowerCase().endsWith(".pdf") ? "application/pdf" : "image"
      );
    }
  };

  const previewExistingFile = (path) => {
    if (!path) return;
    setPreviewUrl(path);
    setPreviewType(path.toLowerCase().endsWith(".pdf") ? "application/pdf" : "image");
  };

  const closePreview = () => {
    if (previewUrl && signatureFile) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPreviewType(null);
  };

  const removeDocument = () => {
    setSignatureFile(null);
    setCurrentAuthority((p) => ({ ...p, SignaturePath: "" }));
  };

  // ── INSERT ────────────────────────────────────────────────────────────────
  const handleInsert = async (form) => {
    setActionLoading(true);
    try {
      const payload = buildPayload(form);
      const response = await MasterTableService.insertSignatureAuthority(payload);
      showSuccess(
        response?.Data?.Message ||
        response?.message ||
        response?.data?.message ||
        "Signature authority added successfully"
      );
      setIsPanelOpen(false);
      await fetchAuthorities();
    } catch (err) {
      showError(extractErrorMessage(err, "Failed to add signature authority"));
    } finally {
      setActionLoading(false);
    }
  };

  // ── UPDATE ────────────────────────────────────────────────────────────────
  const handleUpdate = async (form) => {
    setActionLoading(true);
    try {
      const payload = buildPayload(form);
      const data = await MasterTableService.updateSignatureAuthority(payload);
      showSuccess(
        data?.Data?.Message ||
        data?.message ||
        data?.data?.message ||
        "Signature authority updated successfully"
      );
      setIsPanelOpen(false);
      await fetchAuthorities();
    } catch (err) {
      showError(extractErrorMessage(err, "Failed to update signature authority"));
    } finally {
      setActionLoading(false);
    }
  };

  // ── DELETE ────────────────────────────────────────────────────────────────
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" (ID #${id})?`)) return;
    setActionLoading(true);
    try {
      const data = await MasterTableService.softDeleteSignatureAuthority(id);
      showSuccess(data?.message || data?.Data?.Message || "Signature authority deleted successfully");
      await fetchAuthorities();
    } catch (err) {
      showError(
        err?.response?.data?.Message ||
        err?.response?.data?.message ||
        "Failed to delete signature authority"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ── TOGGLE STATUS ─────────────────────────────────────────────────────────
  const toggleStatusInline = async (item) => {
    const updated = { ...item, IsActive: !item.IsActive };
    setAuthorities((prev) =>
      prev.map((s) => (s.ID === item.ID ? updated : s))
    );
    try {
      const payload = buildPayload(updated);
      await MasterTableService.updateSignatureAuthority(payload);
      showSuccess(`Status updated to ${updated.IsActive ? "Active" : "Inactive"}`);
      await fetchAuthorities(); // refresh to get latest data
    } catch (err) {
      setAuthorities((prev) =>
        prev.map((s) => (s.ID === item.ID ? item : s))
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
    if (!currentAuthority.NameOfAuthority?.trim()) {
      showError("Name of Authority is required");
      return;
    }
    if (!currentAuthority.SignatureType?.trim()) {
      showError("Signature Type is required");
      return;
    }
    if (!currentAuthority.SignaturePath?.trim()) {
      showError("Signature document is required");
      return;
    }
    isEditing ? handleUpdate(currentAuthority) : handleInsert(currentAuthority);
  };

  const handleOpenPanel = (authority = EMPTY_FORM, editMode = false) => {
    setSignatureFile(null);
    setCurrentAuthority({
      ...authority,
      ID: editMode ? authority.ID : nextId,
      IsActive: authority.IsActive ?? true,
      IsCurrent: authority.IsCurrent ?? true,
    });
    setIsEditing(editMode);
    setIsPanelOpen(true);
  };

  // ── FILTERING - SHOW ALL RECORDS BY DEFAULT ─────────────────────────────
  const filteredAuthorities = authorities.filter((s) => {
    if (selectedFilter === "Active" && !s.IsActive) return false;
    if (selectedFilter === "Inactive" && s.IsActive) return false;

    const term = searchTerm.trim().toLowerCase();
    if (term) {
      const searchable = [
        String(s.ID || ""),
        s.NameOfAuthority || "",
        s.Designation || "",
        s.SignatureType || "",
        s.IsActive ? "active" : "inactive",
        s.IsCurrent ? "current" : "",
      ].filter(Boolean).join(" ").toLowerCase();

      if (!searchable.includes(term)) return false;
    }

    return true;
  });

  const stats = {
    TotalCount: authorities.length,
    ActiveCount: authorities.filter((s) => s.IsActive).length,
    InactiveCount: authorities.filter((s) => !s.IsActive).length,
  };

  // ── TABLE COLUMNS FOR FilteredTableComponent ──────────────────────────────
  const columns = [
    {
      key: "ID",
      header: "ID",
      width: "90px",
      headerClassName: "text-center",
      className: "text-center font-mono",
    },
    {
      key: "SignatureType",
      header: "Type",
      headerClassName: "text-center",
      className: "text-center",
      sortable: false,
    },
    { key: "NameOfAuthority", header: "Name of Authority", className: "font-medium" },
    { key: "Designation", header: "Designation" },
    {
      key: "SignaturePath",
      header: "Document",
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
      key: "IsCurrent",
      header: "Current",
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

  const renderAuthorityCell = (item, column) => {
    switch (column.key) {
      case "SignatureType":
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
            item.SignatureType === "C"
              ? "bg-blue-50 text-blue-700 border border-blue-200"
              : item.SignatureType === "S"
              ? "bg-purple-50 text-purple-700 border border-purple-200"
              : "bg-gray-50 text-gray-600 border border-gray-200"
          }`}>
            {item.SignatureType || "—"}
          </span>
        );

      case "SignaturePath":
        return item.SignaturePath ? (
          <button
            onClick={() => previewExistingFile(item.SignaturePath)}
            className="inline-flex items-center gap-1.5 text-violet-600 hover:text-violet-800 text-xs font-medium"
          >
            📄 View
          </button>
        ) : (
          <span className="text-xs text-slate-400">No file</span>
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

      case "IsCurrent":
        return item.IsCurrent ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 border border-blue-200 text-blue-700">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" /> Yes
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 border border-slate-200 text-slate-500">
            No
          </span>
        );

      case "actions":
        return (
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <button
              type="button"
              onClick={() => handleOpenPanel(item, true)}
              title="Edit"
              aria-label={`Edit ${item.NameOfAuthority}`}
              className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-violet-600 bg-violet-50 hover:bg-violet-600 hover:text-white transition-all active:scale-95"
            >
              <EditIcon />
            </button>
            <button
              type="button"
              onClick={() => handleDelete(item.ID, item.NameOfAuthority)}
              disabled={actionLoading}
              title="Delete"
              aria-label={`Delete ${item.NameOfAuthority}`}
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

  // ── RENDER (layout matches MasterRegion.jsx) ───────────────────────────────
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
              Master Signature Authority
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
                    Total Registered
                  </p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">
                    {stats.TotalCount.toLocaleString()}
                  </h3>
                </div>
                <span className="p-2 bg-slate-100 rounded-lg text-xl">📊</span>
              </div>
              <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
                <div>
                  <p className="text-xs text-emerald-600 font-medium">
                    Active Authorities
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
                    Inactive Authorities
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
                  className="flex items-center gap-2 pl-2 pr-2 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-full transition-all active:scale-95 shadow-sm"
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
              <div className="flex-1 flex justify-center">
                {/* <div className="relative w-full max-w-sm">
                  <input
                    type="text"
                    placeholder="🔍 Search by ID, Name, Designation..."
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
              data={filteredAuthorities}
              columns={columns}
              renderCell={renderAuthorityCell}
              loading={loading}
              tableId="signature-authorities-table"
              emptyStateMessage="No signature authorities found"
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
                      {isEditing ? "✏️ Edit Signature Authority" : "✨ Add New Signature Authority"}
                    </h3>
                    <p className="text-xs text-violet-100 mt-0.5">
                      {isEditing ? "Update the record below" : "Fill in all fields to create a new record"}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsPanelOpen(false)}
                    className="opacity-80 hover:opacity-100 text-xl p-2 hover:bg-white/20 rounded-lg transition-all"
                  >✕</button>
                </div>

                <form onSubmit={handleFormSubmit} className="p-6 flex-1 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4">

                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        ID
                        <span className="text-slate-400 font-normal ml-1">
                          {isEditing ? "(RO)" : "(auto)"}
                        </span>
                      </label>
                      <input
                        type="text"
                        value={currentAuthority.ID}
                        disabled
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-mono bg-slate-50 text-slate-500 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Signature Type <span className="text-rose-500">*</span>
                      </label>
                      <select
                        required
                        value={currentAuthority.SignatureType}
                        onChange={(e) => setCurrentAuthority({ ...currentAuthority, SignatureType: e.target.value })}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all bg-white"
                      >
                        <option value="">Select type</option>
                        <option value="C">C — Chairman/Director</option>
                        <option value="S">S — Secretary</option>
                      </select>
                    </div>

                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Name of Authority <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={currentAuthority.NameOfAuthority}
                        onChange={(e) => setCurrentAuthority({ ...currentAuthority, NameOfAuthority: e.target.value })}
                        placeholder="e.g., Yogesh Suresh Patil"
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all placeholder:text-slate-300"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Designation <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={currentAuthority.Designation}
                        onChange={(e) => setCurrentAuthority({ ...currentAuthority, Designation: e.target.value })}
                        placeholder="e.g., DIRECTOR, SECRETARY"
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all placeholder:text-slate-300"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Signature Document <span className="text-rose-500">*</span>
                      </label>

                      <div className="flex items-center gap-3">
                        <UploadPdf
                          file={
                            signatureFile
                              ? { file: signatureFile, filePath: currentAuthority.SignaturePath }
                              : currentAuthority.SignaturePath
                              ? { filePath: currentAuthority.SignaturePath }
                              : null
                          }
                          onFileChange={handleSignatureFileUpload}
                          buttonClassName="bg-violet-600 hover:bg-violet-700"
                          buttonText={uploadingDoc ? "Uploading..." : "Upload Document"}
                          id="signatureDocument"
                          allowedFileTypes="pdf, jpg, jpeg, png"
                          maxFileSize="5 MB"
                          required={true}
                          label="Signature Document"
                          showLabel={false}
                          uniquefilepath={currentAuthority.SignaturePath}
                          tooltip="Upload Signature Document (PNG/JPG/PDF, Max 5MB)"
                          tooltipPosition="right"
                        />

                        {currentAuthority.SignaturePath && (
                          <>
                            <button type="button" onClick={previewDocument} className="text-violet-600 hover:text-purple-600" title="Preview">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                            </button>
                            <button type="button" onClick={removeDocument} className="text-rose-500 hover:text-rose-700" title="Remove">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                            </button>
                          </>
                        )}
                      </div>

                      {signatureFile && (
                        <p className="text-xs text-slate-500 mt-1 truncate max-w-full">📄 {signatureFile.name}</p>
                      )}

                      <p className="text-[11px] text-slate-400 mt-1">Allowed: PNG, JPG, PDF · Max {(MAX_SIZE / (1024 * 1024)).toFixed(0)} MB</p>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-semibold text-slate-800 block select-none">Status</label>
                          <span className="text-[11px] text-slate-500 block mt-0.5">
                            {currentAuthority.IsActive ? "Active & visible" : "Disabled & hidden"}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCurrentAuthority({ ...currentAuthority, IsActive: !currentAuthority.IsActive })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 shrink-0 ${
                            currentAuthority.IsActive ? "bg-violet-600" : "bg-slate-300"
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                            currentAuthority.IsActive ? "translate-x-6" : "translate-x-1"
                          }`} />
                        </button>
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-semibold text-slate-800 block select-none">Current</label>
                          <span className="text-[11px] text-slate-500 block mt-0.5">
                            {currentAuthority.IsCurrent
                              ? "This is the current signatory for its type"
                              : "This is a past/inactive signatory"}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCurrentAuthority({ ...currentAuthority, IsCurrent: !currentAuthority.IsCurrent })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shrink-0 ${
                            currentAuthority.IsCurrent ? "bg-blue-600" : "bg-slate-300"
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                            currentAuthority.IsCurrent ? "translate-x-6" : "translate-x-1"
                          }`} />
                        </button>
                      </div>
                    </div>

                    <div className="col-span-2 bg-gradient-to-br from-violet-50 to-purple-100/50 border border-violet-200 rounded-xl p-4">
                      <p className="text-[10px] font-bold text-violet-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <span>👁️</span> Record Preview
                      </p>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                        {[
                          ["ID", `#${currentAuthority.ID}`],
                          ["Type", currentAuthority.SignatureType || "—"],
                          ["Name", currentAuthority.NameOfAuthority || "—"],
                          ["Designation", currentAuthority.Designation || "—"],
                        ].map(([label, val]) => (
                          <div key={label} className="flex justify-between text-sm py-1 border-b border-violet-100">
                            <span className="text-slate-500">{label}</span>
                            <span className="font-mono font-semibold text-slate-800 text-right max-w-[60%] truncate">{val}</span>
                          </div>
                        ))}
                        <div className="flex justify-between text-sm py-1 border-b border-violet-100">
                          <span className="text-slate-500">Document</span>
                          <span className="font-mono font-semibold text-slate-800">
                            {currentAuthority.SignaturePath ? "✅ Attached" : "—"}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm py-1 border-b border-violet-100">
                          <span className="text-slate-500">Current</span>
                          <span className={`font-semibold ${currentAuthority.IsCurrent ? "text-blue-600" : "text-slate-400"}`}>
                            {currentAuthority.IsCurrent ? "Yes" : "No"}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm py-1 col-span-2">
                          <span className="text-slate-500">Status</span>
                          <span className={`font-semibold ${currentAuthority.IsActive ? "text-emerald-600" : "text-rose-600"}`}>
                            {currentAuthority.IsActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>
                    </div>

                  </div>

                  <button type="submit" className="hidden" aria-hidden="true" />
                </form>

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

      {previewUrl && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[9998]">
          <div className="relative h-[80vh] w-full max-w-4xl rounded-lg bg-white shadow-lg">
            <button
              className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-800 z-10"
              onClick={closePreview}
            >
              &times;
            </button>
            {previewType === "application/pdf" ? (
              <iframe src={previewUrl} title="Document Preview" className="h-full w-full rounded-b-lg" allowFullScreen />
            ) : (
              <img src={previewUrl} alt="Preview" className="h-full w-full object-contain rounded-b-lg" />
            )}
          </div>
        </div>
      )}
    </>
  );
}