import React, { useState, useEffect, useCallback, useMemo, useContext } from "react";
import { MasterTableService } from "../../lib/services/MasterTableService";
import FilteredTableComponent from "../../Component/formcomponent/FilteredTableComponent";
import { ThemeContext } from "../../Component/Context/ThemeContext";
import Loader from "../../Component/formcomponent/Loader";

const EMPTY_FORM = {
  PincodeID: "",
  Pincode: "",
  PostOffice: "",
  CityID: "",
  IsActive: true,
};

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
const CITY_FETCH_PAGE_SIZE = 60000;

// ── small inline icons ──────────────────────────────────────────────────
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

export default function MasterPincode() {
  const { color } = useContext(ThemeContext); // e.g. "bg-[#002060]"

  const [pincodes, setPincodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const [stats, setStats] = useState({
    TotalCount: 0,
    ActiveCount: 0,
    InactiveCount: 0,
  });

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPincode, setCurrentPincode] = useState(EMPTY_FORM);

  // Master data
  const [allStates, setAllStates] = useState([]);
  const [allDistricts, setAllDistricts] = useState([]);
  const [allTalukas, setAllTalukas] = useState([]);
  const [allCities, setAllCities] = useState([]);
  const [masterLoading, setMasterLoading] = useState(false);

  // Cascade selections
  const [selectedStateID, setSelectedStateID] = useState("");
  const [selectedDistrictID, setSelectedDistrictID] = useState("");
  const [selectedTalukaID, setSelectedTalukaID] = useState("");

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

  const formatID = (id) => {
    const num = Number(id);
    if (!id || isNaN(num) || num <= 0) return "—";
    return `${num}`;
  };

  // ── FETCH ─────────────────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    try {
      const res = await MasterTableService.getPincodeStats();
      const data = res?.Data ?? res?.data ?? res ?? {};
      setStats({
        TotalCount: data.TotalCount ?? 0,
        ActiveCount: data.ActiveCount ?? 0,
        InactiveCount: data.InactiveCount ?? 0,
      });
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  }, []);

  const fetchPincodes = useCallback(async (page = 1, search = "") => {
    setLoading(true);
    setError(null);
    try {
      const data = await MasterTableService.getAllPincodes(page, 10000, search);
      const raw = Array.isArray(data) ? data : (data?.Data ?? data?.data ?? []);
      
      const mappedPincodes = raw.map((item) => ({
        PincodeID:    item.PincodeID ?? item.Id,
        Pincode:      item.Pincode ?? "",
        PostOffice:   item.PostOffice ?? "",
        CityID:       String(item.CityID ?? ""),
        CityName:     item.CityName ?? "",
        TalukaName:   item.TalukaName ?? "",
        DistrictName: item.DistrictName ?? "",
        StateName:    item.StateName ?? "",
        TalukaID:     String(item.TalukaID ?? ""),
        DistrictID:   String(item.DistrictID ?? ""),
        StateID:      String(item.StateID ?? ""),
        IsActive:     item.IsActive ?? true,
      }));

      setPincodes(mappedPincodes);
      
      const activeCount = mappedPincodes.filter(p => p.IsActive).length;
      const inactiveCount = mappedPincodes.filter(p => !p.IsActive).length;
      setStats({
        TotalCount: mappedPincodes.length,
        ActiveCount: activeCount,
        InactiveCount: inactiveCount,
      });
    } catch (err) {
      showError(err?.response?.data?.message || "Failed to load pincodes");
      setPincodes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch master data on mount
  useEffect(() => {
    const fetchMasterData = async () => {
      setMasterLoading(true);
      try {
        const [statesRes, districtsRes, talukasRes, citiesRes] = await Promise.all([
          MasterTableService.getAllStates(),
          MasterTableService.getAllDistricts(),
          MasterTableService.getAllTalukas(1, 10000),
          MasterTableService.getAllCities(1, CITY_FETCH_PAGE_SIZE),
        ]);

        const rawStates    = Array.isArray(statesRes)    ? statesRes    : (statesRes?.Data    ?? statesRes?.data    ?? []);
        const rawDistricts = Array.isArray(districtsRes) ? districtsRes : (districtsRes?.Data ?? districtsRes?.data ?? []);
        const rawTalukas   = Array.isArray(talukasRes)   ? talukasRes   : (talukasRes?.Data   ?? talukasRes?.data   ?? []);
        const rawCities    = Array.isArray(citiesRes)    ? citiesRes    : (citiesRes?.Data    ?? citiesRes?.data    ?? []);

        setAllStates(rawStates);
        setAllDistricts(rawDistricts);
        setAllTalukas(rawTalukas);
        setAllCities(rawCities);

        if (rawCities.length > 0) {
          const expectedTotal = rawCities[0]?.TotalCount;
          if (expectedTotal && rawCities.length < expectedTotal) {
            console.warn(
              `City list incomplete: loaded ${rawCities.length} of ${expectedTotal}. ` +
              `Increase CITY_FETCH_PAGE_SIZE in MasterPincode.jsx.`
            );
          }
        }
      } catch {
        // silent
      } finally {
        setMasterLoading(false);
      }
    };
    fetchMasterData();
    fetchStats();
    fetchPincodes(1, "");
  }, [fetchStats, fetchPincodes]);

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchPincodes(1, searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, fetchPincodes]);

  // Page change
  useEffect(() => {
    if (currentPage !== 1 || searchTerm === "") {
      fetchPincodes(currentPage, searchTerm);
    }
  }, [currentPage, fetchPincodes, searchTerm]);

  // ── Derived dropdown options ──────────────────────────────────────────────
  const stateOptions = allStates.map((s) => ({
    value: String(s.StateID),
    label: s.State ?? s.StateName ?? "",
  }));

  const districtOptions = allDistricts
    .filter((d) => String(d.StateID) === String(selectedStateID))
    .map((d) => ({ value: String(d.DistrictID), label: d.District ?? "" }));

  const talukaOptions = allTalukas
    .filter((t) => String(t.DistrictID) === String(selectedDistrictID))
    .map((t) => ({ value: String(t.TalukaID), label: t.Taluka ?? "" }));

  const cityOptions = allCities
    .filter((c) => String(c.TalukaID) === String(selectedTalukaID))
    .map((c) => ({ value: String(c.CityID), label: c.City ?? "" }));

  // ── CRUD ──────────────────────────────────────────────────────────────────
  const handleInsert = async (payload) => {
    setActionLoading(true);
    try {
      const response = await MasterTableService.insertPincode({
        Pincode:    payload.Pincode,
        PostOffice: payload.PostOffice,
        CityID:     Number(payload.CityID),
        IsActive:   payload.IsActive,
      });
      showSuccess(response?.message || response?.data?.message || "Pincode added successfully");
      setIsPanelOpen(false);
      await fetchStats();
      await fetchPincodes(currentPage, searchTerm);
    } catch (err) {
      showError(
        err?.response?.data?.Message ||
        err?.response?.data?.message ||
        err.message ||
        "Failed to add pincode"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async (payload) => {
    setActionLoading(true);
    try {
      const data = await MasterTableService.updatePincode({
        PincodeID:  Number(payload.PincodeID),
        Pincode:    payload.Pincode,
        PostOffice: payload.PostOffice,
        CityID:     Number(payload.CityID),
        IsActive:   payload.IsActive,
      });
      showSuccess(data?.message || data?.data?.message || "Pincode updated successfully");
      setIsPanelOpen(false);
      await fetchStats();
      await fetchPincodes(currentPage, searchTerm);
    } catch (err) {
      showError(err?.response?.data?.message || "Failed to update pincode");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (pincodeID) => {
    if (!window.confirm(`Are you sure you want to delete Pincode ${pincodeID}?`)) return;
    setActionLoading(true);
    try {
      const data = await MasterTableService.softDeletePincode(pincodeID);
      showSuccess(data?.message || "Pincode deleted successfully");
      await fetchStats();
      await fetchPincodes(currentPage, searchTerm);
    } catch (err) {
      showError(err?.response?.data?.message || "Failed to delete pincode");
    } finally {
      setActionLoading(false);
    }
  };

  const toggleStatusInline = async (item) => {
    const updated = { ...item, IsActive: !item.IsActive };
    setPincodes((prev) => prev.map((p) => (p.PincodeID === item.PincodeID ? updated : p)));
    try {
      await MasterTableService.updatePincode({
        PincodeID:  Number(updated.PincodeID),
        Pincode:    updated.Pincode,
        PostOffice: updated.PostOffice,
        CityID:     Number(updated.CityID),
        IsActive:   updated.IsActive,
      });
      showSuccess(`Status updated to ${updated.IsActive ? "Active" : "Inactive"}`);
      await fetchStats();
    } catch (err) {
      setPincodes((prev) => prev.map((p) => (p.PincodeID === item.PincodeID ? item : p)));
      showError(err?.response?.data?.message || "Failed to update status");
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!currentPincode.Pincode)    { showError("Pincode is required");     return; }
    if (!currentPincode.PostOffice) { showError("Post Office is required"); return; }
    if (!selectedStateID)           { showError("State is required");       return; }
    if (!selectedDistrictID)        { showError("District is required");    return; }
    if (!selectedTalukaID)          { showError("Taluka is required");      return; }
    if (!currentPincode.CityID)     { showError("City is required");        return; }
    isEditing ? handleUpdate(currentPincode) : handleInsert(currentPincode);
  };

  // ── Open panel with autofill for edit ────────────────────────────────────
  const handleOpenPanel = (pincode = EMPTY_FORM, editMode = false) => {
    setCurrentPincode({
      ...pincode,
      CityID: String(pincode.CityID ?? ""),
    });
    setIsEditing(editMode);

    if (editMode && pincode.PincodeID) {
      let stateID    = String(pincode.StateID    ?? "");
      let districtID = String(pincode.DistrictID ?? "");
      let talukaID   = String(pincode.TalukaID   ?? "");

      if (!stateID && pincode.StateName) {
        const found = allStates.find(
          (s) => (s.State ?? s.StateName ?? "").trim() === pincode.StateName.trim()
        );
        stateID = found ? String(found.StateID) : "";
      }

      if (!districtID && pincode.DistrictName) {
        const found = allDistricts.find(
          (d) => (d.District ?? "").trim() === pincode.DistrictName.trim()
        );
        districtID = found ? String(found.DistrictID) : "";
      }

      if (!talukaID && pincode.TalukaName) {
        const found = allTalukas.find(
          (t) => (t.Taluka ?? "").trim() === pincode.TalukaName.trim()
        );
        talukaID = found ? String(found.TalukaID) : "";
      }

      const lookupCityID = String(pincode.CityID ?? "");
      if (lookupCityID) {
        const matchCount = allCities.filter((c) => String(c.TalukaID) === talukaID).length;
        if (matchCount === 0) {
          const cityRecord = allCities.find((c) => String(c.CityID) === lookupCityID);
          if (cityRecord) {
            const correctTalukaID = String(cityRecord.TalukaID);
            talukaID = correctTalukaID;

            const talukaRecord = allTalukas.find((t) => String(t.TalukaID) === correctTalukaID);
            if (talukaRecord) {
              districtID = String(talukaRecord.DistrictID);
              const districtRecord = allDistricts.find((d) => String(d.DistrictID) === districtID);
              if (districtRecord) {
                stateID = String(districtRecord.StateID);
              }
            }
          }
        }
      }

      setSelectedStateID(stateID);
      setSelectedDistrictID(districtID);
      setSelectedTalukaID(talukaID);
    } else {
      setSelectedStateID("");
      setSelectedDistrictID("");
      setSelectedTalukaID("");
    }

    setIsPanelOpen(true);
  };

  // ── FILTERING ─────────────────────────────────────────────────────────────
  const filteredPincodes = pincodes.filter((p) => {
    const matchStatus =
      selectedFilter === "All"    ? true :
      selectedFilter === "Active" ? p.IsActive : !p.IsActive;

    const term = searchTerm.trim().toLowerCase();
    const matchSearch = term
      ? [
          p.PincodeID,
          p.Pincode,
          p.PostOffice,
          p.CityName,
          p.TalukaName,
          p.DistrictName,
          p.StateName,
          p.IsActive ? "active" : "inactive",
        ]
          .filter((v) => v !== null && v !== undefined)
          .some((v) => String(v).toLowerCase().includes(term))
      : true;

    return matchStatus && matchSearch;
  });

  // ── TABLE COLUMNS FOR FilteredTableComponent ──────────────────────────────
  const columns = [
    {
      key: "PincodeID",
      header: "ID",
      width: "90px",
      headerClassName: "text-center",
      className: "text-center font-mono",
    },
    { key: "Pincode", header: "Pincode", className: "font-mono" },
    { key: "PostOffice", header: "Post Office" },
    { key: "CityName", header: "City" },
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

  const renderPincodeCell = (item, column) => {
    switch (column.key) {
      case "CityName":
        return (
          <span className={`font-mono px-2 py-1 rounded text-xs ${
            !item.IsActive 
              ? 'bg-slate-100 border border-slate-200 text-slate-500' 
              : 'bg-sky-50 border border-sky-200 text-sky-700'
          }`}>
            {item.CityName || `CID-${item.CityID}`}
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
              onClick={() => {
                if (masterLoading) { showError("Please wait, loading master data..."); return; }
                handleOpenPanel(item, true);
              }}
              title="Edit"
              aria-label={`Edit ${item.Pincode}`}
              className={`h-8 w-8 inline-flex items-center justify-center rounded-lg text-violet-600 bg-violet-50 hover:bg-violet-600 hover:text-white transition-all active:scale-95 ${
                !item.IsActive ? 'opacity-60' : ''
              }`}
            >
              <EditIcon />
            </button>
            <button
              type="button"
              onClick={() => handleDelete(item.PincodeID)}
              disabled={actionLoading}
              title="Delete"
              aria-label={`Delete ${item.Pincode}`}
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
              P
            </div>
            <h1 className="text-md font-bold tracking-tight text-slate-900">
              Master Pincode
            </h1>
          </div>
        </header>

        <div className="flex flex-1 relative overflow-hidden">
          <main className="flex-1 p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full">

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
                <div>
                  <p className="text-xs text-slate-500 font-medium">Total Registered</p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.TotalCount.toLocaleString()}</h3>
                </div>
                <span className="p-2 bg-slate-100 rounded-lg text-xl">📊</span>
              </div>
              <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
                <div>
                  <p className="text-xs text-emerald-600 font-medium">Active Pincodes</p>
                  <h3 className="text-2xl font-bold text-emerald-600 mt-1">{stats.ActiveCount.toLocaleString()}</h3>
                </div>
                <span className="p-2 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold">● Live</span>
              </div>
              <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
                <div>
                  <p className="text-xs text-rose-600 font-medium">Disabled Elements</p>
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
                    placeholder="🔍 Search pincodes..."
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
              data={filteredPincodes}
              columns={columns}
              renderCell={renderPincodeCell}
              loading={loading}
              tableId="pincodes-table"
              emptyStateMessage="No pincodes found"
              emptyStateSubMessage="Try adjusting your search or filters"
            />
          </main>

          {/* ── Modal Panel ── */}
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
                      {isEditing ? "✏️ Edit Pincode" : "✨ Add New Pincode"}
                    </h3>
                    <p className="text-xs text-white/80 mt-0.5">
                      {isEditing ? "Update the pincode record below" : "Fill in all fields to create a new pincode"}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsPanelOpen(false)}
                    className="opacity-80 hover:opacity-100 text-xl p-2 hover:bg-white/20 rounded-lg transition-all"
                  >✕</button>
                </div>

                <form onSubmit={handleFormSubmit} className="p-6 flex-1 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Pincode ID (edit only) */}
                    {isEditing && (
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                          Pincode ID
                          <span className="text-slate-400 font-normal ml-1">(RO)</span>
                        </label>
                        <input
                          type="text"
                          value={formatID(currentPincode.PincodeID)}
                          disabled
                          className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-mono bg-slate-50 text-slate-500 cursor-not-allowed"
                        />
                      </div>
                    )}

                    {/* Pincode */}
                    <div className={isEditing ? "" : "col-span-2"}>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Pincode <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={currentPincode.Pincode}
                        onChange={(e) => setCurrentPincode({ ...currentPincode, Pincode: e.target.value })}
                        placeholder="e.g., 442406"
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-mono text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all placeholder:text-slate-300"
                      />
                    </div>

                    {/* Post Office */}
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Post Office <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={currentPincode.PostOffice}
                        onChange={(e) => setCurrentPincode({ ...currentPincode, PostOffice: e.target.value })}
                        placeholder="e.g., Chandrapur Ord Fact S.O"
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all placeholder:text-slate-300"
                      />
                    </div>

                    {/* State */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        State <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={selectedStateID}
                        onChange={(e) => {
                          setSelectedStateID(e.target.value);
                          setSelectedDistrictID("");
                          setSelectedTalukaID("");
                          setCurrentPincode((prev) => ({ ...prev, CityID: "" }));
                        }}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all bg-white"
                        disabled={masterLoading}
                      >
                        <option value="">Select State</option>
                        {stateOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* District */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        District <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={selectedDistrictID}
                        onChange={(e) => {
                          setSelectedDistrictID(e.target.value);
                          setSelectedTalukaID("");
                          setCurrentPincode((prev) => ({ ...prev, CityID: "" }));
                        }}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all bg-white"
                        disabled={!selectedStateID || masterLoading}
                      >
                        <option value="">Select District</option>
                        {districtOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      {!selectedStateID && (
                        <p className="text-[11px] text-slate-400 mt-1">↑ Select a state first</p>
                      )}
                    </div>

                    {/* Taluka */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Taluka <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={selectedTalukaID}
                        onChange={(e) => {
                          setSelectedTalukaID(e.target.value);
                          setCurrentPincode((prev) => ({ ...prev, CityID: "" }));
                        }}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all bg-white"
                        disabled={!selectedDistrictID || masterLoading}
                      >
                        <option value="">Select Taluka</option>
                        {talukaOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      {!selectedDistrictID && (
                        <p className="text-[11px] text-slate-400 mt-1">↑ Select a district first</p>
                      )}
                    </div>

                    {/* City */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        City <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={String(currentPincode.CityID ?? "")}
                        onChange={(e) => setCurrentPincode({ ...currentPincode, CityID: e.target.value })}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all bg-white"
                        disabled={!selectedTalukaID || masterLoading}
                      >
                        <option value="">Select City</option>
                        {cityOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      {!selectedTalukaID && (
                        <p className="text-[11px] text-slate-400 mt-1">↑ Select a taluka first</p>
                      )}
                      {selectedTalukaID && cityOptions.length === 0 && !masterLoading && (
                        <p className="text-[11px] text-rose-400 mt-1">No cities found for this taluka.</p>
                      )}
                    </div>

                    {/* Status Toggle */}
                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl col-span-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-semibold text-slate-800 block select-none">Status</label>
                          <span className="text-[11px] text-slate-500 block mt-0.5">
                            {currentPincode.IsActive ? "Active & visible" : "Disabled & hidden"}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCurrentPincode({ ...currentPincode, IsActive: !currentPincode.IsActive })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 shrink-0 ${
                            currentPincode.IsActive ? "bg-violet-600" : "bg-slate-300"
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                            currentPincode.IsActive ? "translate-x-6" : "translate-x-1"
                          }`} />
                        </button>
                      </div>
                      <div className="mt-2">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 ${
                          currentPincode.IsActive ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${currentPincode.IsActive ? "bg-emerald-500" : "bg-rose-500"}`} />
                          {currentPincode.IsActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>

                    {/* Record Preview */}
                    <div className="col-span-2 bg-gradient-to-br from-violet-50 to-purple-100/50 border border-violet-200 rounded-xl p-4">
                      <p className="text-[10px] font-bold text-violet-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <span>👁️</span> Record Preview
                      </p>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                        {[
                          ["ID", isEditing ? formatID(currentPincode.PincodeID) : "Auto-generated"],
                          ["Pincode", currentPincode.Pincode || "—"],
                          ["Post Office", currentPincode.PostOffice || "—"],
                        ].map(([label, val]) => (
                          <div key={label} className="flex justify-between text-sm py-1 border-b border-violet-100">
                            <span className="text-slate-500">{label}</span>
                            <span className="font-mono font-semibold text-slate-800 text-right max-w-[60%] truncate">{val}</span>
                          </div>
                        ))}
                        <div className="flex justify-between text-sm py-1 border-b border-violet-100">
                          <span className="text-slate-500">State</span>
                          <span className="font-mono font-semibold text-slate-800 text-right max-w-[60%] truncate">
                            {stateOptions.find((s) => s.value === selectedStateID)?.label || "—"}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm py-1 border-b border-violet-100">
                          <span className="text-slate-500">District</span>
                          <span className="font-mono font-semibold text-slate-800 text-right max-w-[60%] truncate">
                            {districtOptions.find((d) => d.value === selectedDistrictID)?.label || "—"}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm py-1 border-b border-violet-100">
                          <span className="text-slate-500">Taluka</span>
                          <span className="font-mono font-semibold text-slate-800 text-right max-w-[60%] truncate">
                            {talukaOptions.find((t) => t.value === selectedTalukaID)?.label || "—"}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm py-1 border-b border-violet-100">
                          <span className="text-slate-500">City</span>
                          <span className="font-mono font-semibold text-slate-800 text-right max-w-[60%] truncate">
                            {cityOptions.find((c) => c.value === String(currentPincode.CityID))?.label || "—"}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm py-1 col-span-2">
                          <span className="text-slate-500">Status</span>
                          <span className={`font-semibold ${currentPincode.IsActive ? "text-emerald-600" : "text-rose-600"}`}>
                            {currentPincode.IsActive ? "Active" : "Inactive"}
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
                    {isEditing ? "💾 Save Changes" : "➕ Add Pincode"}
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