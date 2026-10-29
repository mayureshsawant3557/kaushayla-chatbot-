import React, { useState, useEffect, useCallback, useMemo } from "react";
import { MasterTableService } from "../../lib/services/MasterTableService";

const EMPTY_FORM = {
  UserID: null,
  UserTypeID: "",
  UserLoginID: "",
  UserPassword: "",
  UserName: "",
  UserMobileNo: "",
  UserEmailID: "",
  SecurityQuestionID: "",
  SecurityQuestionAnswer: "",
  IsActive: true,
};

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// ── Helpers ───────────────────────────────────────────────────────────────────
const normalise = (raw) =>
  raw.map((item, i) => ({
    _rowKey: `row-${i}`,
    UserID: item.UserID != null ? Number(item.UserID) : null,
    UserTypeID: item.UserTypeID != null ? Number(item.UserTypeID) : null,
    UserLoginID: item.UserLoginID ?? "",
    UserPassword: item.UserPassword ?? "",
    UserName: item.UserName ?? "",
    UserMobileNo: item.UserMobileNo ?? "",
    UserEmailID: item.UserEmailID ?? "",
    SecurityQuestionID: item.SecurityQuestionID != null ? Number(item.SecurityQuestionID) : null,
    SecurityQuestionAnswer: item.SecurityQuestionAnswer ?? "",
    LoggedInSessionID: item.LoggedInSessionID ?? "",
    CurrentLoginDateTime: item.CurrentLoginDateTime ?? null,
    LastLoginDateTime: item.LastLoginDateTime ?? null,
    IsNewRegistration: item.IsNewRegistration === true || item.IsNewRegistration === 1,
    IsPasswordResetDone: item.IsPasswordResetDone === true || item.IsPasswordResetDone === 1,
    IsActive: item.IsActive === true || item.IsActive === 1,
    ModifiedDateTime: item.ModifiedDateTime ?? null,
    ModifiedBy: item.ModifiedBy ?? "",
    ModifiedByIPAddress: item.ModifiedByIPAddress ?? "",
    IsAccountLock: item.IsAccountLock === true || item.IsAccountLock === 1,
    LoginAttempt: item.LoginAttempt != null ? Number(item.LoginAttempt) : 0,
    FaceEnrolled: item.FaceEnrolled === true || item.FaceEnrolled === 1,
    FaceEncodingData: item.FaceEncodingData ?? "",
    MsbsvetMtId: item.MsbsvetMtId != null ? Number(item.MsbsvetMtId) : null,
  }));

const buildPayload = (form) => ({
  UserID: Number(form.UserID),
  UserTypeID: form.UserTypeID === "" ? null : Number(form.UserTypeID),
  UserLoginID: (form.UserLoginID ?? "").trim(),
  UserPassword: form.UserPassword ?? "",
  UserName: (form.UserName ?? "").trim(),
  UserMobileNo: (form.UserMobileNo ?? "").trim(),
  UserEmailID: (form.UserEmailID ?? "").trim(),
  SecurityQuestionID: form.SecurityQuestionID === "" ? null : Number(form.SecurityQuestionID),
  SecurityQuestionAnswer: (form.SecurityQuestionAnswer ?? "").trim(),
  IsActive: form.IsActive === true || form.IsActive === 1,
});

const maskPassword = (pwd) => (pwd ? "•".repeat(Math.min(String(pwd).length, 10)) : "—");

// ── Component ─────────────────────────────────────────────────────────────────
export default function MasterUser() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [nextID, setNextID] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [securityQuestions, setSecurityQuestions] = useState([]);

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

  // ── FETCH: Users ─────────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await MasterTableService.getAllUsers();
      const raw = data?.Data ?? data?.data ?? (Array.isArray(data) ? data : []);
      const normalised = normalise(raw);
      setUsers(normalised);

      const ids = normalised
        .map((f) => f.UserID)
        .filter((id) => id != null && !isNaN(id) && id > 0);
      const next = ids.length > 0 ? Math.max(...ids) + 1 : 1;
      setNextID(next);
    } catch (err) {
      showError(err?.response?.data?.Message || err?.message || "Failed to load users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── FETCH: Security Questions ─────────────────────────────────────────────
  const fetchSecurityQuestions = useCallback(async () => {
    try {
      const data = await MasterTableService.getAllSecurityQuestions();
      const raw = data?.Data ?? data?.data ?? (Array.isArray(data) ? data : []);
      setSecurityQuestions(
        raw.map((q) => ({
          id: Number(q.SecurityQuestionID),
          text: q.SecurityQuestion ?? "",
        }))
      );
    } catch (err) {
      console.error("Failed to load security questions:", err);
      setSecurityQuestions([]);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchSecurityQuestions();
  }, [fetchSecurityQuestions]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedFilter]);

  // ── INSERT ────────────────────────────────────────────────────────────────
  const handleInsert = async (form) => {
    setActionLoading(true);
    try {
      const response = await MasterTableService.insertUser(buildPayload(form));
      showSuccess(response?.Data?.Message || response?.message || "User added successfully");
      setIsPanelOpen(false);
      await fetchUsers();
    } catch (err) {
      showError(err?.response?.data?.Message || err?.message || "Failed to add user");
    } finally {
      setActionLoading(false);
    }
  };

  // ── UPDATE ────────────────────────────────────────────────────────────────
  const handleUpdate = async (form) => {
    setActionLoading(true);
    try {
      const data = await MasterTableService.updateUser(buildPayload(form));
      showSuccess(data?.Data?.Message || data?.message || "User updated successfully");
      setIsPanelOpen(false);
      await fetchUsers();
    } catch (err) {
      showError(err?.response?.data?.Message || err?.message || "Failed to update user");
    } finally {
      setActionLoading(false);
    }
  };

  // ── DELETE ────────────────────────────────────────────────────────────────
  const handleDelete = async (item) => {
    if (item.UserID === -1) {
      showError('The "NA" system record cannot be deleted.');
      return;
    }
    if (!window.confirm(`Delete User ID ${item.UserID} (${item.UserName})?`)) return;

    setActionLoading(true);
    try {
      const data = await MasterTableService.softDeleteUser(Number(item.UserID));
      showSuccess(data?.message || data?.Data?.Message || "User deleted successfully");
      await fetchUsers();
    } catch (err) {
      showError(err?.response?.data?.Message || err?.message || "Failed to delete user");
    } finally {
      setActionLoading(false);
    }
  };

  // ── TOGGLE STATUS ─────────────────────────────────────────────────────────
  const toggleStatusInline = async (item) => {
    if (item.UserID === -1) {
      showError('The "NA" system record status cannot be changed.');
      return;
    }

    const updated = { ...item, IsActive: !item.IsActive };
    setUsers((prev) => prev.map((f) => (f._rowKey === item._rowKey ? updated : f)));

    try {
      await MasterTableService.updateUser(buildPayload(updated));
      showSuccess(`Status set to ${updated.IsActive ? "Active" : "Inactive"}`);
    } catch (err) {
      setUsers((prev) => prev.map((f) => (f._rowKey === item._rowKey ? item : f)));
      showError(err?.response?.data?.Message || err?.message || "Failed to update status");
    }
  };

  // ── FORM SUBMIT ───────────────────────────────────────────────────────────
  const handleFormSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!currentRecord.UserName?.trim()) errs.UserName = true;
    if (!currentRecord.UserEmailID?.trim()) errs.UserEmailID = true;
    if (!currentRecord.UserLoginID?.trim()) errs.UserLoginID = true;
    if (!isEditing && !currentRecord.UserPassword?.trim()) errs.UserPassword = true;

    setFormErrors(errs);
    if (Object.keys(errs).length > 0) {
      showError("Please fill all required fields");
      return;
    }

    isEditing ? handleUpdate(currentRecord) : handleInsert(currentRecord);
  };

  // ── Open panel ──────────────────────────────────────────────────────────────
  const handleOpenPanel = (record = EMPTY_FORM, editMode = false) => {
    setFormErrors({});
    setShowPassword(false);

    if (editMode) {
      setCurrentRecord({ ...record, IsActive: record.IsActive ?? true });
    } else {
      setCurrentRecord({ ...EMPTY_FORM, UserID: nextID });
    }

    setIsEditing(editMode);
    setIsPanelOpen(true);
  };

  const setField = (field) => (e) => {
    setCurrentRecord((p) => ({ ...p, [field]: e.target.value }));
  };

  // ── FILTERING ─────────────────────────────────────────────────────────────
  const filteredUsers = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return users.filter((f) => {
      const matchStatus =
        selectedFilter === "All"
          ? true
          : selectedFilter === "Active"
          ? f.IsActive
          : !f.IsActive;

      const matchSearch = searchTerm
        ? f.UserName.toLowerCase().includes(term) ||
          f.UserEmailID.toLowerCase().includes(term) ||
          f.UserLoginID.toLowerCase().includes(term) ||
          f.UserMobileNo.includes(searchTerm) ||
          String(f.UserID).includes(searchTerm)
        : true;

      return matchStatus && matchSearch;
    });
  }, [users, searchTerm, selectedFilter]);

  // ── PAGINATION ────────────────────────────────────────────────────────────
  const isFilterActive = searchTerm !== "" || selectedFilter !== "All";
  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const paginatedUsers = isFilterActive
    ? filteredUsers
    : filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const getPageNumbers = () => {
    const pages = [];
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, currentPage + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const stats = {
    Total: users.length,
    Active: users.filter((f) => f.IsActive).length,
    Inactive: users.filter((f) => !f.IsActive).length,
    Locked: users.filter((f) => f.IsAccountLock).length,
  };

  // ── RENDER ────────────────────────────────────────────────────────────────
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
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-blue-600 flex items-center justify-center font-bold shadow-md text-white">
            U
          </div>
          <h1 className="text-md font-bold tracking-tight text-slate-900">Master User</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => window.history.back()}
            title="Back"
            className="group flex items-center gap-2 pl-2 pr-4 py-2 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 text-xs font-semibold rounded-full transition-all shadow-sm hover:shadow-md active:scale-95"
          >
            <span className="h-6 w-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                <path d="M19 12H5" />
                <path d="M12 19l-7-7 7-7" />
              </svg>
            </span>
            Back
          </button>

          <button
            type="button"
            onClick={() => { window.location.href = "http://localhost:5173/react"; }}
            title="Close"
            className="group flex items-center gap-2 pl-2 pr-4 py-2 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-slate-700 text-xs font-semibold rounded-full transition-all shadow-sm hover:shadow-md active:scale-95"
          >
            <span className="h-6 w-6 flex items-center justify-center rounded-full bg-rose-100 text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                <path d="M18 6L6 18" />
                <path d="M6 6l12 12" />
              </svg>
            </span>
            Close
          </button>

          <button
            onClick={() => handleOpenPanel(EMPTY_FORM, false)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-xl active:scale-95 transition-all shadow-md"
          >
            + Add New Record
          </button>
        </div>
      </header>

      <div className="flex flex-1 relative overflow-hidden">
        <main className="flex-1 p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
              <div>
                <p className="text-xs text-slate-500 font-medium">Total Users</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.Total.toLocaleString()}</h3>
              </div>
              <span className="p-2 bg-slate-100 rounded-lg text-xl">👤</span>
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
              <div>
                <p className="text-xs text-emerald-600 font-medium">Active</p>
                <h3 className="text-2xl font-bold text-emerald-600 mt-1">{stats.Active.toLocaleString()}</h3>
              </div>
              <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold">● Live</span>
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
              <div>
                <p className="text-xs text-rose-500 font-medium">Inactive</p>
                <h3 className="text-2xl font-bold text-rose-500 mt-1">{stats.Inactive.toLocaleString()}</h3>
              </div>
              <span className="px-2 py-1 bg-rose-50 text-rose-600 rounded-lg text-xs font-bold">● Off</span>
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
              <div>
                <p className="text-xs text-amber-600 font-medium">Locked</p>
                <h3 className="text-2xl font-bold text-amber-600 mt-1">{stats.Locked.toLocaleString()}</h3>
              </div>
              <span className="p-2 bg-amber-50 rounded-lg text-xl">🔒</span>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="relative w-full md:w-72">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400 text-sm">🔍</span>
                <input
                  type="text"
                  placeholder="Search by name, email, login ID, mobile or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
                />
              </div>
              <div className="flex bg-slate-100 p-1 border border-slate-200 rounded-lg w-full md:w-auto ml-auto">
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

            {(searchTerm || selectedFilter !== "All") && (
              <div className="flex items-center gap-2 flex-wrap pt-1">
                <span className="text-xs text-slate-400">Filters:</span>
                {selectedFilter !== "All" && (
                  <span className="text-xs text-slate-500">
                    Showing <span className="font-semibold text-indigo-700">{selectedFilter} Records</span>
                  </span>
                )}
                {searchTerm && (
                  <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 text-xs font-medium px-2 py-0.5 rounded-full">
                    "{searchTerm}"
                    <button onClick={() => setSearchTerm("")} className="hover:text-slate-900 font-bold">✕</button>
                  </span>
                )}
                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full">
                    {filteredUsers.length} of {users.length} Total
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            {loading ? (
              <div className="p-16 text-center text-sm text-slate-400 tracking-widest animate-pulse">
                LOADING RECORDS...
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[1100px]">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                        <th className="py-3 px-4">User ID</th>
                        <th className="py-3 px-4">User Name</th>
                        <th className="py-3 px-4">Login ID</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4">Mobile</th>
                        <th className="py-3 px-4">User Type</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-center" style={{ minWidth: "200px" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {paginatedUsers.map((item) => {
                        const isSystemRecord = item.UserID === -1;
                        return (
                          <tr key={item._rowKey} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="py-3 px-4 font-mono text-slate-600 font-medium">{item.UserID}</td>
                            <td className="py-3 px-4 text-slate-800 font-medium">
                              {item.UserName}
                              {isSystemRecord && (
                                <span className="ml-2 text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full align-middle">
                                  SYSTEM
                                </span>
                              )}
                              {item.IsAccountLock && (
                                <span className="ml-2 text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full align-middle">
                                  🔒 LOCKED
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-slate-600 font-mono text-xs">{item.UserLoginID}</td>
                            <td className="py-3 px-4 text-slate-600 text-xs">{item.UserEmailID}</td>
                            <td className="py-3 px-4 text-slate-600 font-mono text-xs">{item.UserMobileNo}</td>
                            <td className="py-3 px-4 text-slate-600 font-mono text-xs">{item.UserTypeID ?? "—"}</td>
                            <td className="py-3 px-4">
                              <button
                                onClick={() => toggleStatusInline(item)}
                                disabled={actionLoading || isSystemRecord}
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium border text-xs transition-all active:scale-95 disabled:opacity-50 ${
                                  item.IsActive
                                    ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                                    : "bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100"
                                }`}
                              >
                                <span className={`h-1.5 w-1.5 rounded-full ${item.IsActive ? "bg-emerald-500" : "bg-rose-500"}`} />
                                {item.IsActive ? "Active" : "Inactive"}
                              </button>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleOpenPanel(item, true)}
                                  disabled={isSystemRecord}
                                  className="inline-flex items-center gap-1 text-indigo-600 hover:text-white bg-indigo-50 hover:bg-indigo-600 border border-indigo-200 hover:border-indigo-600 px-3 py-1.5 rounded-lg transition-all text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-indigo-50 disabled:hover:text-indigo-600"
                                >
                                  ✏️ Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(item)}
                                  disabled={actionLoading || isSystemRecord}
                                  className="inline-flex items-center gap-1 text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 hover:border-rose-600 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50 text-xs font-medium"
                                >
                                  🗑️ Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {paginatedUsers.length === 0 && (
                        <tr>
                          <td colSpan="8" className="py-12 text-center text-slate-400 text-sm">
                            No user records found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {filteredUsers.length > 0 && !isFilterActive && (
                  <div className="px-4 py-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>
                        Showing{" "}
                        <span className="font-semibold text-slate-700">
                          {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredUsers.length)}
                        </span>{" "}
                        of{" "}
                        <span className="font-semibold text-slate-700">{filteredUsers.length}</span>
                      </span>
                      <select
                        value={pageSize}
                        onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                        className="border border-slate-200 rounded-lg px-2 py-1 text-xs bg-white focus:outline-none focus:border-indigo-400"
                      >
                        {PAGE_SIZE_OPTIONS.map((s) => (
                          <option key={s} value={s}>{s} / page</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => goToPage(1)} disabled={currentPage === 1}
                        className="px-2 py-1 text-xs rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed">«</button>
                      <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}
                        className="px-2 py-1 text-xs rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed">‹</button>
                      {getPageNumbers().map((page) => (
                        <button key={page} onClick={() => goToPage(page)}
                          className={`px-3 py-1 text-xs rounded-lg border font-medium transition-all ${
                            page === currentPage
                              ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                              : "border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}>
                          {page}
                        </button>
                      ))}
                      <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}
                        className="px-2 py-1 text-xs rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed">›</button>
                      <button onClick={() => goToPage(totalPages)} disabled={currentPage === totalPages}
                        className="px-2 py-1 text-xs rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed">»</button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
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
              <div className="p-5 border-b border-slate-200 flex items-center justify-between shrink-0" style={{ backgroundColor: "#4F46E5" }}>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {isEditing ? "✏️ Edit User" : "✨ Add New User"}
                  </h3>
                  <p className="text-xs text-indigo-100 mt-0.5">
                    {isEditing ? "Update the user record below" : "Fill in all fields to create a new user"}
                  </p>
                </div>
                <button
                  onClick={() => setIsPanelOpen(false)}
                  className="text-white/80 hover:text-white text-xl p-2 hover:bg-white/20 rounded-lg transition-all"
                >✕</button>
              </div>

              <form onSubmit={handleFormSubmit} className="p-6 flex-1 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  {/* User ID */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      User ID
                      <span className="text-slate-400 font-normal ml-1">
                        {isEditing ? "(RO)" : "(auto)"}
                      </span>
                    </label>
                    <input
                      type="text"
                      value={currentRecord.UserID ?? ""}
                      disabled
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-mono bg-slate-50 text-slate-500 cursor-not-allowed"
                    />
                    {!isEditing && (
                      <p className="text-[11px] text-slate-400 mt-1">
                        Auto-assigned as <strong className="text-indigo-500">{nextID}</strong>
                      </p>
                    )}
                  </div>

                  {/* User Type ID */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      User Type ID
                    </label>
                    <input
                      type="number"
                      value={currentRecord.UserTypeID}
                      onChange={setField("UserTypeID")}
                      placeholder="e.g., 91"
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-300"
                    />
                  </div>

                  {/* User Name */}
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      User Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={currentRecord.UserName}
                      onChange={setField("UserName")}
                      placeholder="e.g., Ravi Kadam"
                      className={`w-full px-3 py-2.5 border rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-300 ${
                        formErrors.UserName ? "border-rose-400" : "border-slate-200 focus:border-indigo-500"
                      }`}
                    />
                  </div>

                  {/* Login ID */}
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      Login ID <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={currentRecord.UserLoginID}
                      onChange={setField("UserLoginID")}
                      placeholder="e.g., 202212C10007"
                      className={`w-full px-3 py-2.5 border rounded-lg text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-300 ${
                        formErrors.UserLoginID ? "border-rose-400" : "border-slate-200 focus:border-indigo-500"
                      }`}
                    />
                  </div>

                  {/* Password */}
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      Password {!isEditing && <span className="text-rose-500">*</span>}
                      {isEditing && (
                        <span className="text-slate-400 font-normal normal-case">(Leave blank to keep unchanged)</span>
                      )}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={currentRecord.UserPassword}
                        onChange={setField("UserPassword")}
                        placeholder={isEditing ? "••••••••" : "Enter password"}
                        className={`w-full px-3 py-2.5 pr-16 border rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-300 ${
                          formErrors.UserPassword ? "border-rose-400" : "border-slate-200 focus:border-indigo-500"
                        }`}
                        {...(!isEditing && { required: true })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-400 hover:text-indigo-600 px-2 py-1"
                      >
                        {showPassword ? "HIDE" : "SHOW"}
                      </button>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      Email ID <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={currentRecord.UserEmailID}
                      onChange={setField("UserEmailID")}
                      placeholder="e.g., ravi@example.com"
                      className={`w-full px-3 py-2.5 border rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-300 ${
                        formErrors.UserEmailID ? "border-rose-400" : "border-slate-200 focus:border-indigo-500"
                      }`}
                    />
                  </div>

                  {/* Mobile */}
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      Mobile No
                    </label>
                    <input
                      type="text"
                      value={currentRecord.UserMobileNo}
                      onChange={setField("UserMobileNo")}
                      placeholder="e.g., 9876543210"
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-mono text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-300"
                    />
                  </div>

                  {/* Security Question */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      Security Question
                    </label>
                    <select
                      value={currentRecord.SecurityQuestionID}
                      onChange={setField("SecurityQuestionID")}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                    >
                      <option value="">Select a question…</option>
                      {securityQuestions.map((q) => (
                        <option key={q.id} value={q.id}>{q.text}</option>
                      ))}
                    </select>
                  </div>

                  {/* Security Answer */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      Security Answer
                    </label>
                    <input
                      type="text"
                      value={currentRecord.SecurityQuestionAnswer}
                      onChange={setField("SecurityQuestionAnswer")}
                      placeholder="Answer"
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-300"
                    />
                  </div>

                  {/* IsActive Toggle */}
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
                        onClick={() => setCurrentRecord((p) => ({ ...p, IsActive: !p.IsActive }))}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shrink-0 ${
                          currentRecord.IsActive ? "bg-indigo-600" : "bg-slate-300"
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                          currentRecord.IsActive ? "translate-x-6" : "translate-x-1"
                        }`} />
                      </button>
                    </div>
                  </div>

                  {/* Record Preview */}
                  <div className="col-span-2 bg-gradient-to-br from-indigo-50 to-blue-100/50 border border-indigo-200 rounded-xl p-4">
                    <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <span>👁️</span> Record Preview
                    </p>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                      {[
                        ["User ID", isEditing ? `#${currentRecord.UserID}` : `#${nextID ?? "…"}`],
                        ["User Name", currentRecord.UserName || "—"],
                        ["Login ID", currentRecord.UserLoginID || "—"],
                        ["Email", currentRecord.UserEmailID || "—"],
                        ["Mobile", currentRecord.UserMobileNo || "—"],
                      ].map(([label, val]) => (
                        <div key={label} className="flex justify-between text-sm py-1 border-b border-indigo-100">
                          <span className="text-slate-500">{label}</span>
                          <span className="font-mono font-semibold text-slate-800 text-right max-w-[60%] truncate">{val}</span>
                        </div>
                      ))}
                      <div className="flex justify-between text-sm py-1 border-b border-indigo-100">
                        <span className="text-slate-500">Password</span>
                        <span className="font-mono font-semibold text-slate-800 text-right">{maskPassword(currentRecord.UserPassword)}</span>
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
                  className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-md transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {actionLoading && (
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  )}
                  {isEditing ? "💾 Save Changes" : "➕ Add User"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}