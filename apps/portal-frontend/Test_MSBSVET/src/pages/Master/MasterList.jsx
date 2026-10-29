import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  ChevronsUpDown,
  Database,
  LayoutGrid,
  X,
  Inbox,
} from "lucide-react";
import { getMasterList } from "../../lib/services/MasterTableService";
import { ThemeContext } from "../../Component/Context/ThemeContext";

const COLUMNS = 3;

const MasterList = () => {
  const { color } = useContext(ThemeContext);
  const [masters, setMasters] = useState([]);
  const [filteredMasters, setFilteredMasters] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMasters();
  }, []);

  const fetchMasters = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getMasterList();
      const data = res?.Data || res?.data || [];
      setMasters(data);
      setFilteredMasters(data);
    } catch (err) {
      console.error("MasterList fetch error:", err);
      setError("Failed to load master list.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (!term.trim()) {
      setFilteredMasters(masters);
      return;
    }
    const filtered = masters.filter((m) =>
      (m.MasterName || m.masterName || "")
        .toLowerCase()
        .includes(term.toLowerCase()),
    );
    setFilteredMasters(filtered);
  };

  const clearSearch = () => handleSearch({ target: { value: "" } });

  const rows = [];
  for (let i = 0; i < filteredMasters.length; i += COLUMNS) {
    rows.push(filteredMasters.slice(i, i + COLUMNS));
  }

  // ---------- Loading skeleton ----------
  if (loading) {
    return (
      <div className="border rounded-xl shadow-sm bg-white p-4 animate-pulse">
        <div className="h-10 w-40 bg-slate-200 rounded-md mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="h-16 bg-slate-100 rounded-lg" />
          <div className="h-16 bg-slate-100 rounded-lg" />
        </div>
        <div className="h-9 w-64 bg-slate-100 rounded-md mb-4" />
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-9 bg-slate-100 rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  // ---------- Error state ----------
  if (error) {
    return (
      <div className="border border-red-200 rounded-xl shadow-sm bg-red-50 p-6 text-center">
        <p className="text-red-600 font-medium mb-3">{error}</p>
        <button
          onClick={fetchMasters}
          className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-md hover:bg-red-700 transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="border rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 bg-white p-4">
      {/* Header - now themed via ThemeContext */}
      <button
        className={`flex items-center gap-2 ${color} text-white px-4 py-2.5 rounded-lg font-semibold mb-4 shadow-sm hover:shadow-md hover:opacity-90 transition-all`}
      >
        <LayoutGrid className="h-4 w-4" />
        Master List
      </button>

      {/* Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-3 border rounded-lg p-4 bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-colors duration-200">
          <div className={`p-2.5 ${color} rounded-md shadow-sm`}>
            <Database className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium tracking-wide uppercase">
              Total Tables
            </p>
            <p className="text-2xl font-bold text-gray-800">{masters.length}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 border rounded-lg p-4 bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-colors duration-200">
          <div className={`p-2.5 ${color} rounded-md shadow-sm`}>
            <Search className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium tracking-wide uppercase">
              Showing
            </p>
            <p className="text-2xl font-bold text-gray-800">
              {filteredMasters.length}
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-xs mb-4">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search masters..."
          value={searchTerm}
          onChange={handleSearch}
          className="w-full pl-9 pr-8 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
        />
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Table wrapper — border on outside, scroll inside */}
      {filteredMasters.length === 0 ? (
        <div className="border rounded-lg py-14 flex flex-col items-center justify-center text-center bg-slate-50">
          <div className="p-3 bg-slate-200 rounded-full mb-3">
            <Inbox className="h-6 w-6 text-slate-500" />
          </div>
          <p className="text-gray-700 font-medium mb-1">No masters found</p>
          <p className="text-gray-400 text-sm mb-3">
            Try a different search term.
          </p>
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="text-blue-600 hover:underline font-medium text-sm"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden shadow-sm">
          <div className="max-h-[400px] overflow-y-auto">
            <table className="w-full border-collapse text-sm table-fixed">
              <thead className="sticky top-0 z-10">
                <tr className={color}>
                  {Array.from({ length: COLUMNS }).map((_, idx) => (
                    <React.Fragment key={idx}>
                      <th className="text-left px-3 py-3 font-semibold border-b border-r border-white/20 w-14 text-white/90">
                        Sr.No
                      </th>
                      <th
                        className={`text-left px-3 py-3 font-semibold border-b border-white/20 text-white ${idx < COLUMNS - 1 ? "border-r" : ""}`}
                      >
                        <span className="flex items-center gap-1">
                          Master name
                          {idx === 0 && (
                            <ChevronsUpDown className="h-3 w-3 text-white/70" />
                          )}
                        </span>
                      </th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIdx) => (
                  <tr
                    key={rowIdx}
                    className={`transition-colors duration-150 hover:bg-blue-50 ${
                      rowIdx % 2 === 0 ? "bg-white" : "bg-gray-50/70"
                    }`}
                  >
                    {Array.from({ length: COLUMNS }).map((_, colIdx) => {
                      const master = row[colIdx];
                      const srNo = rowIdx * COLUMNS + colIdx + 1;
                      return (
                        <React.Fragment key={colIdx}>
                          <td className="px-3 py-2.5 border-b border-r text-gray-400 font-medium">
                            {master ? srNo : ""}
                          </td>
                          <td
                            className={`px-3 py-2.5 border-b ${colIdx < COLUMNS - 1 ? "border-r" : ""}`}
                          >
                            {master && (
                              <Link
                                to={master.MasterLink || master.masterLink}
                                className="text-blue-600 font-medium hover:text-blue-800 hover:underline transition-colors"
                              >
                                {master.MasterName || master.masterName}
                              </Link>
                            )}
                          </td>
                        </React.Fragment>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Footer summary */}
      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
        <span>
          Showing{" "}
          <span className="font-semibold text-gray-700">
            {filteredMasters.length}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-gray-700">{masters.length}</span>{" "}
          tables
        </span>
        {searchTerm && filteredMasters.length > 0 && (
          <button
            onClick={clearSearch}
            className="text-blue-600 hover:underline font-medium"
          >
            Clear search
          </button>
        )}
      </div>
    </div>
  );
};

export default MasterList;
