import React, { useState, useEffect, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { MasterTableService } from "../../lib/services/MasterTableService";
import DropdownComponent from "../../Component/formcomponent/DropdownComponent";
import Loader from "../../Component/formcomponent/Loader";
import FilteredTableComponent from "../../Component/formcomponent/FilteredTableComponent";
import { ThemeContext } from "../../Component/Context/ThemeContext";

const pick = (obj, ...keys) => {
  if (!obj) return undefined;
  for (const key of keys) {
    if (obj[key] !== undefined) return obj[key];
    const lower = key.charAt(0).toLowerCase() + key.slice(1);
    if (obj[lower] !== undefined) return obj[lower];
  }
  return undefined;
};

const EMPTY_FORM = {
  CityID: "",
  City: "",
  CityMarathi: "",
  TalukaID: "",
  IsRural: false,
  IsActive: true,
};

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// Map a filter tab name to the isActive / isRural params the backend expects
const filterToParams = (filter) => ({
  isActive: filter === "Active" ? true : filter === "Inactive" ? false : null,
  isRural: filter === "Rural" ? true : filter === "Urban" ? false : null,
});

// ── small inline icons ─
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

export default function MasterCity() {
  const { color } = useContext(ThemeContext);

  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalCount, setTotalCount] = useState(0);

  // Stats from API
  const [stats, setStats] = useState({
    TotalCount: 0,
    ActiveCount: 0,
    InactiveCount: 0,
    RuralCount: 0,
    UrbanCount: 0
  });

  // Authoritative "next available City ID", sourced from the backend
  // (max CityID across the WHOLE table, not just the currently loaded page)
  const [nextCityId, setNextCityId] = useState(1);

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCity, setCurrentCity] = useState(EMPTY_FORM);

  // Master data for cascading dropdowns
  const [allStates, setAllStates] = useState([]);
  const [allDistricts, setAllDistricts] = useState([]);
  const [allTalukas, setAllTalukas] = useState([]);
  const [masterLoading, setMasterLoading] = useState(false);

  // Cascade selections
  const [selectedStateID, setSelectedStateID] = useState("");
  const [selectedDistrictID, setSelectedDistrictID] = useState("");

  const navigate = useNavigate();

  const showSuccess = (msg) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(null), 3000); };
  const showError = (msg) => { setError(msg); setTimeout(() => setError(null), 4000); };

  // Auth guard
  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem("userInfoAll"));
    if (!user || Number(user.UserTypeID) !== 11) {
      window.location.href = "http://localhost:5173/react";
    }
  }, []);

  // Fetch the true max CityID from the backend (whole table, not just loaded page).
  // Falls back gracefully if the backend hasn't added MaxCityID to the stats payload yet.
  const fetchNextCityId = useCallback(async () => {
    try {
      const res = await MasterTableService.getCityStats();
      const data = pick(res, "Data") ?? res ?? {};
      const maxId = pick(data, "MaxCityID");
      if (maxId !== undefined && maxId !== null) {
        setNextCityId(Number(maxId) + 1);
      }
      // If MaxCityID isn't present, keep whatever value we already have
      // rather than silently trusting a partial/paged dataset.
    } catch (err) {
      console.error("Failed to fetch next City ID:", err);
    }
  }, []);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await MasterTableService.getCityStats();
      const data = pick(res, "Data") ?? res ?? {};
      setStats({
        TotalCount: pick(data, "TotalCount") ?? 0,
        ActiveCount: pick(data, "ActiveCount") ?? 0,
        InactiveCount: pick(data, "InactiveCount") ?? 0,
        RuralCount: pick(data, "RuralCount") ?? 0,
        UrbanCount: pick(data, "UrbanCount") ?? 0,
      });

      const maxId = pick(data, "MaxCityID");
      if (maxId !== undefined && maxId !== null) {
        setNextCityId(Number(maxId) + 1);
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  }, []);

  // Fetch cities with pagination + server-side filter (isActive / isRural)
  const fetchCities = useCallback(async (page = 1, search = "", filter = "All") => {
    setLoading(true);
    setError(null);

    const { isActive, isRural } = filterToParams(filter);

    try {
      const res = await MasterTableService.getAllCities(page, pageSize, search, isActive, isRural);
      const raw = Array.isArray(res) ? res : (pick(res, "Data") ?? []);

      const total = raw.length > 0 ? (pick(raw[0], "TotalCount") ?? raw.length) : 0;
      setTotalCount(total);

      setCities(raw.map(item => ({
        CityID: pick(item, "CityID", "Id"),
        City: pick(item, "City") ?? "",
        CityMarathi: pick(item, "CityMarathi") ?? "",
        TalukaID: pick(item, "TalukaID") ?? "",
        TalukaName: pick(item, "TalukaName") ?? "",
        IsRural: pick(item, "IsRural") ?? false,
        IsActive: pick(item, "IsActive") ?? true,
      })));

    } catch (err) {
      showError(err?.response?.data?.message || 'Failed to load cities');
      setCities([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  // Fetch master data once on mount
  useEffect(() => {
    const fetchMasterData = async () => {
      setMasterLoading(true);
      try {
        const [statesRes, districtsRes, talukasRes] = await Promise.all([
          MasterTableService.getAllStates(),
          MasterTableService.getAllDistricts(),
          MasterTableService.getAllTalukas(1, 10000),
        ]);

        const rawStates = Array.isArray(statesRes) ? statesRes : (pick(statesRes, "Data") ?? []);
        const rawDistricts = Array.isArray(districtsRes) ? districtsRes : (pick(districtsRes, "Data") ?? []);
        const rawTalukas = Array.isArray(talukasRes) ? talukasRes : (pick(talukasRes, "Data") ?? []);

        setAllStates(rawStates);
        setAllDistricts(rawDistricts);
        setAllTalukas(rawTalukas);
      } catch {
        // silent
      } finally {
        setMasterLoading(false);
      }
    };
    fetchMasterData();
    fetchStats();
    fetchCities(1, "", "All");
  }, [fetchStats, fetchCities]);

  // Handle search with debounce (keeps current filter)
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchCities(1, searchTerm, selectedFilter);
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, fetchCities]);

  // Handle page change (keeps current search + filter)
  useEffect(() => {
    if (currentPage !== 1 || searchTerm === "") {
      fetchCities(currentPage, searchTerm, selectedFilter);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, fetchCities, searchTerm]);

  // Handle filter tab change — refetch from backend instead of filtering client-side
  const handleFilterChange = (tab) => {
    setSelectedFilter(tab);
    setCurrentPage(1);
    fetchCities(1, searchTerm, tab);
  };

  // Derived filtered options
  const stateOptions = allStates.map((s) => ({
    value: String(pick(s, "StateID")),
    label: pick(s, "State", "StateName") ?? "",
  }));

  const districtOptions = allDistricts
    .filter((d) => String(pick(d, "StateID")) === String(selectedStateID))
    .map((d) => ({ value: String(pick(d, "DistrictID")), label: pick(d, "District") ?? "" }));

  const talukaOptions = allTalukas
    .filter((t) => String(pick(t, "DistrictID")) === String(selectedDistrictID))
    .map((t) => ({ value: String(pick(t, "TalukaID")), label: pick(t, "Taluka") ?? "" }));

  // CRUD operations
  const handleInsert = async (payload) => {
    setActionLoading(true);

    try {
      const insertPayload = {
        CityID: Number(payload.CityID),
        City: String(payload.City).trim(),
        CityMarathi: payload.CityMarathi ? String(payload.CityMarathi).trim() : null,
        TalukaID: Number(payload.TalukaID),
        IsRural: Boolean(payload.IsRural),
        IsActive: Boolean(payload.IsActive),
      };

      const response = await MasterTableService.insertCity(insertPayload);

      showSuccess(pick(response, "Message") || response?.message || 'City added successfully');
      setIsPanelOpen(false);
      await fetchStats();
      await fetchCities(currentPage, searchTerm, selectedFilter);

    } catch (err) {
      let errorMessage = 'Failed to add city';
      const serverMsg =
        err?.response?.data?.Message ||
        err?.response?.data?.message ||
        (typeof err?.response?.data === 'string' ? err.response.data : null);

      // Duplicate CityID (race condition / stale next-ID) — refresh the ID and
      // tell the user clearly, rather than showing a generic backend message.
      if (serverMsg && /insert city/i.test(serverMsg)) {
        errorMessage = 'That City ID was just taken by another record. Please try saving again.';
        await fetchNextCityId();
      } else if (err?.response?.data) {
        const errorData = err.response.data;
        if (errorData.Message) {
          errorMessage = errorData.Message;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }

        if (errorData.Data && typeof errorData.Data === 'object') {
          const validationErrors = Object.values(errorData.Data).filter(v => v);
          if (validationErrors.length > 0) {
            errorMessage = validationErrors.join(', ');
          }
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      showError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async (payload) => {
    setActionLoading(true);

    try {
      const updatePayload = {
        CityID: Number(payload.CityID),
        City: String(payload.City).trim(),
        CityMarathi: payload.CityMarathi ? String(payload.CityMarathi).trim() : null,
        TalukaID: Number(payload.TalukaID),
        IsRural: Boolean(payload.IsRural),
        IsActive: Boolean(payload.IsActive),
      };

      const data = await MasterTableService.updateCity(updatePayload);

      showSuccess(pick(data, "Message") || data?.message || 'City updated successfully');
      setIsPanelOpen(false);
      await fetchStats();
      await fetchCities(currentPage, searchTerm, selectedFilter);

    } catch (err) {
      showError(err?.response?.data?.message || 'Failed to update city');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (cityID, cityName) => {
    if (!window.confirm(`Are you sure you want to delete "${cityName}"?`)) return;

    setActionLoading(true);

    try {
      const data = await MasterTableService.softDeleteCity(cityID);

      showSuccess(pick(data, "Message") || data?.message || 'City deleted successfully');
      await fetchStats();
      await fetchCities(currentPage, searchTerm, selectedFilter);

    } catch (err) {
      showError(err?.response?.data?.message || 'Failed to delete city');
    } finally {
      setActionLoading(false);
    }
  };

  const toggleStatusInline = async (item) => {
    const updated = { ...item, IsActive: !item.IsActive };

    setCities(prev =>
      prev.map(c => c.CityID === item.CityID ? updated : c)
    );

    try {
      await MasterTableService.updateCity({
        CityID: Number(updated.CityID),
        City: String(updated.City).trim(),
        CityMarathi: updated.CityMarathi ? String(updated.CityMarathi).trim() : null,
        TalukaID: Number(updated.TalukaID),
        IsRural: Boolean(updated.IsRural),
        IsActive: Boolean(updated.IsActive),
      });

      showSuccess(`Status updated to ${updated.IsActive ? 'Active' : 'Inactive'}`);
      await fetchStats();

    } catch (err) {
      setCities(prev =>
        prev.map(c => c.CityID === item.CityID ? item : c)
      );

      showError(err?.response?.data?.message || 'Failed to update status');
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (!currentCity.CityID || Number(currentCity.CityID) <= 0) {
      showError('Valid City ID is required');
      return;
    }

    if (!currentCity.City || !String(currentCity.City).trim()) {
      showError('City Name is required');
      return;
    }

    if (!selectedStateID) {
      showError('Please select a State');
      return;
    }

    if (!selectedDistrictID) {
      showError('Please select a District');
      return;
    }

    if (!currentCity.TalukaID || Number(currentCity.TalukaID) <= 0) {
      showError('Please select a Taluka');
      return;
    }

    const selectedTaluka = talukaOptions.find(t => t.value === String(currentCity.TalukaID));
    if (!selectedTaluka) {
      showError('Selected Taluka is not valid for the chosen District');
      return;
    }

    isEditing ? handleUpdate(currentCity) : handleInsert(currentCity);
  };

  const handleOpenPanel = async (city = EMPTY_FORM, editMode = false) => {
    setSelectedStateID("");
    setSelectedDistrictID("");

    // For new records, re-sync the next ID with the backend right before opening,
    // so it reflects the true table-wide max (not just whatever page is loaded),
    // and stays fresh even if another admin inserted a city moments ago.
    let idForNewRecord = nextCityId;
    if (!editMode) {
      try {
        const res = await MasterTableService.getCityStats();
        const data = pick(res, "Data") ?? res ?? {};
        const maxId = pick(data, "MaxCityID");
        if (maxId !== undefined && maxId !== null) {
          idForNewRecord = Number(maxId) + 1;
          setNextCityId(idForNewRecord);
        }
      } catch {
        // Keep last known nextCityId as a best-effort fallback
      }
    }

    if (editMode && city.TalukaID) {
      const taluka = allTalukas.find(t => String(pick(t, "TalukaID")) === String(city.TalukaID));
      if (taluka) {
        const districtID = pick(taluka, "DistrictID");
        const district = allDistricts.find(d => String(pick(d, "DistrictID")) === String(districtID));
        const stateID = district ? pick(district, "StateID") : "";

        setSelectedDistrictID(districtID ? String(districtID) : "");
        setSelectedStateID(stateID ? String(stateID) : "");
      }
    }

    setCurrentCity({
      ...city,
      CityID: editMode ? city.CityID : idForNewRecord,
      IsActive: city.IsActive !== undefined ? city.IsActive : true,
      IsRural: city.IsRural !== undefined ? city.IsRural : false,
      City: city.City || "",
      CityMarathi: city.CityMarathi || "",
      TalukaID: city.TalukaID || "",
    });
    setIsEditing(editMode);
    setIsPanelOpen(true);
  };

  // Client-side search across ALL visible columns
  const filteredCities = cities.filter((c) => {
    const matchStatus =
      selectedFilter === "All" ? true :
      selectedFilter === "Active" ? c.IsActive : !c.IsActive;

    const term = searchTerm.trim().toLowerCase();
    const matchSearch = term
      ? [
          c.CityID,
          c.City,
          c.CityMarathi,
          c.TalukaName,
          c.IsRural ? "rural" : "urban",
          c.IsActive ? "active" : "inactive",
        ]
          .filter((v) => v !== null && v !== undefined)
          .some((v) => String(v).toLowerCase().includes(term))
      : true;

    return matchStatus && matchSearch;
  });

  const isFilterActive = searchTerm !== "" || selectedFilter !== "All";
  const totalPages = Math.ceil(filteredCities.length / pageSize);
  const paginatedCities = isFilterActive
    ? filteredCities
    : filteredCities.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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

  const selectedStateLabel = stateOptions.find((s) => s.value === selectedStateID)?.label || "";
  const selectedDistrictLabel = districtOptions.find((d) => d.value === selectedDistrictID)?.label || "";
  const selectedTalukaLabel = talukaOptions.find((t) => t.value === String(currentCity.TalukaID))?.label || "";

  // ── TABLE COLUMNS FOR FilteredTableComponent ──────────────────────────────
  const columns = [
    {
      key: "CityID",
      header: "City ID",
      width: "90px",
      headerClassName: "text-center",
      className: "text-center font-mono",
    },
    { key: "City", header: "City Name", className: "font-medium" },
    { key: "CityMarathi", header: "City (Marathi)" },
    { key: "TalukaName", header: "Taluka" },
    {
      key: "IsRural",
      header: "Type",
      headerClassName: "text-center",
      className: "text-center",
      sortable: false,
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

  const renderCityCell = (item, column) => {
    switch (column.key) {
      case "IsRural":
        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-medium border text-xs ${item.IsRural ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
            {item.IsRural ? '🌾 Rural' : '🏙️ Urban'}
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
              aria-label={`Edit ${item.City}`}
              className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-violet-600 bg-violet-50 hover:bg-violet-600 hover:text-white transition-all active:scale-95"
            >
              <EditIcon />
            </button>
            <button
              type="button"
              onClick={() => handleDelete(item.CityID, item.City)}
              disabled={actionLoading}
              title="Delete"
              aria-label={`Delete ${item.City}`}
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
              C
            </div>
            <h1 className="text-md font-bold tracking-tight text-slate-900">
              Master City
            </h1>
          </div>
        </header>

        <div className="flex flex-1 relative overflow-hidden">
          <main className="flex-1 p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full">
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
              <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
                <div>
                  <p className="text-xs text-slate-500 font-medium">Total Registered</p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.TotalCount.toLocaleString()}</h3>
                </div>
                <span className="p-2 bg-slate-100 rounded-lg text-xl">📊</span>
              </div>
              <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
                <div>
                  <p className="text-xs text-emerald-600 font-medium">Active Cities</p>
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
                  <p className="text-xs text-amber-600 font-medium">Rural Cities</p>
                  <h3 className="text-2xl font-bold text-amber-600 mt-1">{stats.RuralCount.toLocaleString()}</h3>
                </div>
                <span className="p-2 bg-amber-50 text-amber-700 rounded-lg text-xs font-bold">🌾 Rural</span>
              </div>
              <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
                <div>
                  <p className="text-xs text-blue-600 font-medium">Urban Cities</p>
                  <h3 className="text-2xl font-bold text-blue-600 mt-1">{stats.UrbanCount.toLocaleString()}</h3>
                </div>
                <span className="p-2 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold">🏙️ Urban</span>
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
                {['All', 'Active', 'Inactive', 'Rural', 'Urban'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => handleFilterChange(tab)}
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
                    placeholder="🔍 Search by ID, City, Taluka..."
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
              data={filteredCities}
              columns={columns}
              renderCell={renderCityCell}
              loading={loading}
              tableId="cities-table"
              emptyStateMessage="No cities found"
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
                      {isEditing ? "✏️ Edit City" : "✨ Add New City"}
                    </h3>
                    <p className="text-xs text-violet-100 mt-0.5">
                      {isEditing ? "Update the city record below" : "Fill in all fields to create a new city"}
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
                    {/* City ID */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        City ID
                        <span className="text-slate-400 font-normal ml-1">
                          {isEditing ? "(RO)" : "(auto)"}
                        </span>
                      </label>
                      <input
                        type="text"
                        value={currentCity.CityID}
                        disabled
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-mono bg-slate-50 text-slate-500 cursor-not-allowed"
                      />
                    </div>

                    {/* City Name */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        City Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={currentCity.City}
                        onChange={(e) => setCurrentCity({ ...currentCity, City: e.target.value })}
                        placeholder="e.g., Pune, Nashik"
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all placeholder:text-slate-300"
                      />
                    </div>

                    {/* City Marathi */}
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        City Name (Marathi)
                      </label>
                      <input
                        type="text"
                        value={currentCity.CityMarathi}
                        onChange={(e) => setCurrentCity({ ...currentCity, CityMarathi: e.target.value })}
                        placeholder="e.g., पुणे, नाशिक"
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all placeholder:text-slate-300"
                      />
                    </div>

                    {/* State */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        State <span className="text-rose-500">*</span>
                      </label>
                      <DropdownComponent
                        options={stateOptions}
                        value={selectedStateID}
                        onChange={(val) => {
                          setSelectedStateID(val);
                          setSelectedDistrictID("");
                          setCurrentCity((prev) => ({ ...prev, TalukaID: "" }));
                        }}
                        loading={masterLoading}
                      />
                      {!selectedStateID && <p className="text-[11px] text-slate-400 mt-1">Select a state first</p>}
                    </div>

                    {/* District */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        District <span className="text-rose-500">*</span>
                      </label>
                      <DropdownComponent
                        options={districtOptions}
                        value={selectedDistrictID}
                        onChange={(val) => {
                          setSelectedDistrictID(val);
                          setCurrentCity((prev) => ({ ...prev, TalukaID: "" }));
                        }}
                        disabled={!selectedStateID}
                        loading={masterLoading}
                      />
                      {!selectedStateID && <p className="text-[11px] text-slate-400 mt-1">↑ Select a state first</p>}
                    </div>

                    {/* Taluka */}
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Taluka <span className="text-rose-500">*</span>
                      </label>
                      <DropdownComponent
                        options={talukaOptions}
                        value={String(currentCity.TalukaID ?? "")}
                        onChange={(val) => {
                          setCurrentCity({ ...currentCity, TalukaID: val });
                        }}
                        disabled={!selectedDistrictID}
                        loading={masterLoading}
                      />
                      {!selectedDistrictID && <p className="text-[11px] text-slate-400 mt-1">↑ Select a district first</p>}
                    </div>

                    {/* IsRural Toggle */}
                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-semibold text-slate-800 block select-none">City Type</label>
                          <span className="text-[11px] text-slate-500 block mt-0.5">
                            {currentCity.IsRural ? "Rural area" : "Urban area"}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCurrentCity({ ...currentCity, IsRural: !currentCity.IsRural })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 shrink-0 ${
                            currentCity.IsRural ? "bg-amber-500" : "bg-blue-500"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                              currentCity.IsRural ? "translate-x-6" : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* IsActive Toggle */}
                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-semibold text-slate-800 block select-none">Status</label>
                          <span className="text-[11px] text-slate-500 block mt-0.5">
                            {currentCity.IsActive ? "Active & visible" : "Disabled & hidden"}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCurrentCity({ ...currentCity, IsActive: !currentCity.IsActive })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 shrink-0 ${
                            currentCity.IsActive ? "bg-violet-600" : "bg-slate-300"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                              currentCity.IsActive ? "translate-x-6" : "translate-x-1"
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
                          ["ID", `#${currentCity.CityID}`],
                          ["City Name", currentCity.City || "—"],
                          ["Marathi Name", currentCity.CityMarathi || "—"],
                          ["State", selectedStateLabel || "—"],
                          ["District", selectedDistrictLabel || "—"],
                          ["Taluka", selectedTalukaLabel || "—"],
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
                        <div className="flex justify-between text-sm py-1 border-b border-violet-100">
                          <span className="text-slate-500">Type</span>
                          <span
                            className={`font-semibold ${currentCity.IsRural ? 'text-amber-600' : 'text-blue-600'}`}
                          >
                            {currentCity.IsRural ? 'Rural' : 'Urban'}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm py-1 col-span-2">
                          <span className="text-slate-500">Status</span>
                          <span
                            className={`font-semibold ${currentCity.IsActive ? 'text-emerald-600' : 'text-rose-600'}`}
                          >
                            {currentCity.IsActive ? 'Active' : 'Inactive'}
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
                    {isEditing ? "💾 Save Changes" : "➕ Add City"}
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