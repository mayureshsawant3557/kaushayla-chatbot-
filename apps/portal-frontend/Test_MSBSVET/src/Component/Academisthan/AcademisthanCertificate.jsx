import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../Hooks/AuthContext"
import { Search, Download, ChevronUp, ChevronDown, Award, FileText, AlertCircle, Loader2 } from "lucide-react";
import agent from "../../lib/api/agent";
// import {
//   GetAcademisthanCandidatePrintResultCertificate,
//   DownloadCertificatePdf,
// } from "../../Endpoints_All/Exam/academisthan"; // adjust to your actual endpoint paths
import { GetByCandidateIDCourseMappings, AcadmisthanCandidatePrintResultCertificateByCandidateID, GenerateCertificatepdf } from "../../Endpoints_All/Candidate/academisthan";

/* ─────────────────────────────────────────────
   TABLE COLUMNS CONFIG
───────────────────────────────────────────── */
const COLUMNS = [
  { key: "srNo", header: "Sr. No.", width: "7%", className: "text-center" },
  { key: "ApplicationIDDisplay", header: "Application ID", width: "14%", className: "text-left" },
  { key: "InstituteNameCode", header: "Institute", width: "24%", className: "text-left" },
  { key: "BatchID", header: "Batch ID", width: "14%", className: "text-left" },
  { key: "CourseNameCode", header: "Course Name", width: "27%", className: "text-left" },
  { key: "action", header: "Certificate", width: "14%", className: "text-center", sortable: false },
];

/* ─────────────────────────────────────────────
   INNER TABLE COMPONENT  (mirrors FilteredTableComponent)
───────────────────────────────────────────── */
const CertificateTable = ({ data, onDownload, downloadingId }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [filteredData, setFilteredData] = useState(data);

  useEffect(() => {
    let result = [...data];
    if (searchTerm.trim()) {
      result = result.filter((row) =>
        Object.values(row).some((v) =>
          v?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    if (sortConfig.key) {
      result.sort((a, b) => {
        const av = a[sortConfig.key], bv = b[sortConfig.key];
        if (av < bv) return sortConfig.direction === "asc" ? -1 : 1;
        if (av > bv) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    setFilteredData(result);
  }, [data, searchTerm, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Search Bar */}
      <div className="flex justify-end">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search records..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-md border border-gray-200 shadow-sm" style={{ maxHeight: "420px" }}>
        <table className="min-w-full border-collapse text-sm" style={{ tableLayout: "fixed" }}>
          <thead className="sticky top-0 z-10 bg-gray-100">
            <tr>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  style={{ width: col.width }}
                  className="border border-gray-300 px-3 py-2 text-center font-semibold text-gray-700 select-none"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span
                      className={col.sortable !== false ? "cursor-pointer hover:text-blue-600" : ""}
                      onClick={() => col.sortable !== false && handleSort(col.key)}
                    >
                      {col.header}
                    </span>
                    {col.sortable !== false && (
                      <div className="flex flex-col">
                        <ChevronUp
                          className={`w-3 h-3 -mb-0.5 ${sortConfig.key === col.key && sortConfig.direction === "asc" ? "text-blue-600" : "text-gray-400"}`}
                          onClick={() => handleSort(col.key)}
                        />
                        <ChevronDown
                          className={`w-3 h-3 ${sortConfig.key === col.key && sortConfig.direction === "desc" ? "text-blue-600" : "text-gray-400"}`}
                          onClick={() => handleSort(col.key)}
                        />
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length} className="border border-gray-200 px-4 py-10 text-center text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <AlertCircle className="w-6 h-6 text-gray-400" />
                    <span className="font-medium">No Certificate Found!</span>
                  </div>
                </td>
              </tr>
            ) : (
              filteredData.map((row, idx) => (
                <tr key={row.ApplicationID || idx} className="hover:bg-blue-50 transition-colors">
                  {COLUMNS.map((col) => {
                    if (col.key === "srNo") {
                      return (
                        <td key={col.key} style={{ width: col.width }} className={`border border-gray-200 px-3 py-2 ${col.className}`}>
                          {idx + 1}.
                        </td>
                      );
                    }
                    if (col.key === "action") {
                      const isDownloading = downloadingId === `${row.CandidateID};${row.ApplicationID}`;
                      return (
                        <td key={col.key} style={{ width: col.width }} className={`border border-gray-200 px-3 py-2 ${col.className}`}>
                          <button
                            onClick={() => onDownload(row.CandidateID, row.ApplicationID)}
                            disabled={isDownloading}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded text-white transition-colors
                              ${isDownloading
                                ? "bg-green-400 cursor-not-allowed"
                                : "bg-green-600 hover:bg-green-700 active:bg-green-800"}`}
                          >
                            {isDownloading ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Download className="w-3.5 h-3.5" />
                            )}
                            {isDownloading ? "Downloading…" : "Download Certificate"}
                          </button>
                        </td>
                      );
                    }
                    return (
                      <td key={col.key} style={{ width: col.width }} className={`border border-gray-200 px-3 py-2 ${col.className}`}>
                        {row[col.key] ?? "—"}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer info */}
      <p className="text-xs text-gray-500">
        Showing {filteredData.length} of {data.length} entr{data.length !== 1 ? "ies" : "y"}
        {searchTerm && ` (filtered by: "${searchTerm}")`}
      </p>
    </div>
  );
};

/* ─────────────────────────────────────────────
   MAIN PAGE COMPONENT
───────────────────────────────────────────── */
const AcademisthanCertificate = () => {

  const { userInfo } = useAuth();
  const UserID = userInfo?.UserID;
  const [tableData, setTableData] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloadingId, setDownloadingId] = useState(null); // "CandidateID;ApplicationID"

  /* ── Fetch certificate list on mount ── */
  useEffect(() => {
    fetchCertificates();
  
  }, []);

  const fetchCertificates = async () => {
    setPageLoading(true);
    setError("");
    try {
      const res = await agent.get(`${AcadmisthanCandidatePrintResultCertificateByCandidateID}?candidateID=${UserID}`);
      
      if (res.data?.Status === "Success" && res.data?.Data?.length > 0) {
        setTableData(res.data.Data);
      } else {
        setError("No Certificate Found!");
      }
    } catch (err) {
      setError("Failed to load certificate data. Please try again.");
    } finally {
      setPageLoading(false);
    }
  };

  /* ── Download a single certificate PDF ── */
  const handleDownloadCertificate = async (candidateId, applicationId) => {
    const key = `${candidateId};${applicationId}`;
    if (downloadingId) return; // prevent double-click
    setDownloadingId(key);
    try {
      const res = await agent.get(
        `${GenerateCertificatepdf}?candidateId=${candidateId}&applicationId=${applicationId}`,
        { responseType: "blob" }
      );
      if (res.data?.type === "application/json") {
      const text = await res.data.text();
      alert("Certificate not available: " + text);
      return;
    }
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Certificate_${applicationId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Certificate download failed. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  };

  /* ─────────────── RENDER ─────────────── */
  return (
    <div className="row form-container">
      <div className="col-md-12">
        <fieldset>
          {/* Legend / Page Header */}
          <legend>
            <Award className="inline-block me-1 align-middle" size={16} />
            <span>Certificate</span>
          </legend>

          <div className="p-3">
            {/* Loading State */}
            {pageLoading && (
              <div className="flex items-center justify-center py-16 text-gray-500 gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                <span className="text-sm">Loading certificates…</span>
              </div>
            )}

            {/* Error / Empty State */}
            {!pageLoading && error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-md px-4 py-3 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Data Table */}
            {!pageLoading && !error && (
              <CertificateTable
                data={tableData}
                onDownload={handleDownloadCertificate}
                downloadingId={downloadingId}
              />
            )}
          </div>
        </fieldset>
      </div>
    </div>
  );
};

export default AcademisthanCertificate;









// import { useState, useEffect } from "react";
// import {
//   Search,
//   Download,
//   ChevronUp,
//   ChevronDown,
//   Award,
//   AlertCircle,
//   Loader2,
// } from "lucide-react";

// /* ─────────────────────────────────────────────
//    MOCK DATA  (replace with real API response)
// ───────────────────────────────────────────── */
// const MOCK_DATA = [
//   {
//     CandidateID: 1,
//     ApplicationID: 1001,
//     ApplicationIDDisplay: "APP-2024-1001",
//     InstituteNameCode: "Delhi Public School (DPS001)",
//     BatchID: "BATCH-24A",
//     CourseNameCode: "Computer Science - Grade 10 (CS10)",
//   },
//   {
//     CandidateID: 2,
//     ApplicationID: 1002,
//     ApplicationIDDisplay: "APP-2024-1002",
//     InstituteNameCode: "Mumbai Central Institute (MCI002)",
//     BatchID: "BATCH-24B",
//     CourseNameCode: "Mathematics Advanced (MATH-ADV)",
//   },
//   {
//     CandidateID: 3,
//     ApplicationID: 1003,
//     ApplicationIDDisplay: "APP-2024-1003",
//     InstituteNameCode: "Bangalore Tech Academy (BTA003)",
//     BatchID: "BATCH-23C",
//     CourseNameCode: "Physics Honours (PHY-HON)",
//   },
//   {
//     CandidateID: 4,
//     ApplicationID: 1004,
//     ApplicationIDDisplay: "APP-2024-1004",
//     InstituteNameCode: "Kolkata Science College (KSC004)",
//     BatchID: "BATCH-24A",
//     CourseNameCode: "Chemistry Intermediate (CHEM-INT)",
//   },
//   {
//     CandidateID: 5,
//     ApplicationID: 1005,
//     ApplicationIDDisplay: "APP-2024-1005",
//     InstituteNameCode: "Hyderabad Academy of Sciences (HAS005)",
//     BatchID: "BATCH-24C",
//     CourseNameCode: "Biology Foundation (BIO-FOUN)",
//   },
//   {
//     CandidateID: 6,
//     ApplicationID: 1006,
//     ApplicationIDDisplay: "APP-2024-1006",
//     InstituteNameCode: "Pune Excellence Institute (PEI006)",
//     BatchID: "BATCH-23B",
//     CourseNameCode: "English Literature (ENG-LIT)",
//   },
//   {
//     CandidateID: 7,
//     ApplicationID: 1007,
//     ApplicationIDDisplay: "APP-2024-1007",
//     InstituteNameCode: "Chennai Learning Hub (CLH007)",
//     BatchID: "BATCH-24D",
//     CourseNameCode: "History & Civics (HIST-CIV)",
//   },
// ];

// /* ─────────────────────────────────────────────
//    TABLE COLUMNS CONFIG
// ───────────────────────────────────────────── */
// const COLUMNS = [
//   { key: "srNo",                header: "Sr. No.",        width: "7%",  className: "text-center", sortable: false },
//   { key: "ApplicationIDDisplay", header: "Application ID", width: "14%", className: "text-left" },
//   { key: "InstituteNameCode",   header: "Institute",      width: "24%", className: "text-left" },
//   { key: "BatchID",             header: "Batch ID",       width: "13%", className: "text-left" },
//   { key: "CourseNameCode",      header: "Course Name",    width: "28%", className: "text-left" },
//   { key: "action",              header: "Certificate",    width: "14%", className: "text-center", sortable: false },
// ];

// /* ─────────────────────────────────────────────
//    CERTIFICATE TABLE COMPONENT
// ───────────────────────────────────────────── */
// const CertificateTable = ({ data, onDownload, downloadingId }) => {
//   const [searchTerm, setSearchTerm]     = useState("");
//   const [sortConfig, setSortConfig]     = useState({ key: null, direction: "asc" });
//   const [filteredData, setFilteredData] = useState(data);

//   useEffect(() => {
//     let result = [...data];

//     if (searchTerm.trim()) {
//       result = result.filter((row) =>
//         Object.values(row).some((v) =>
//           v?.toString().toLowerCase().includes(searchTerm.toLowerCase())
//         )
//       );
//     }

//     if (sortConfig.key) {
//       result.sort((a, b) => {
//         const av = a[sortConfig.key];
//         const bv = b[sortConfig.key];
//         if (av < bv) return sortConfig.direction === "asc" ? -1 : 1;
//         if (av > bv) return sortConfig.direction === "asc" ?  1 : -1;
//         return 0;
//       });
//     }

//     setFilteredData(result);
//   }, [data, searchTerm, sortConfig]);

//   const handleSort = (key) => {
//     setSortConfig((prev) => ({
//       key,
//       direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
//     }));
//   };

//   return (
//     <div className="flex flex-col gap-3">
//       {/* Search Bar */}
//       <div className="flex justify-end">
//         <div className="relative w-64">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
//           <input
//             type="text"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             placeholder="Search records..."
//             className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
//           />
//         </div>
//       </div>

//       {/* Table */}
//       <div
//         className="overflow-x-auto rounded-md border border-gray-200 shadow-sm"
//         style={{ maxHeight: "420px" }}
//       >
//         <table
//           className="min-w-full border-collapse text-sm"
//           style={{ tableLayout: "fixed" }}
//         >
//           <thead className="sticky top-0 z-10 bg-gray-100">
//             <tr>
//               {COLUMNS.map((col) => (
//                 <th
//                   key={col.key}
//                   style={{ width: col.width }}
//                   className="border border-gray-300 px-3 py-2 text-center font-semibold text-gray-700 select-none"
//                 >
//                   <div className="flex items-center justify-center gap-1">
//                     <span
//                       className={
//                         col.sortable !== false
//                           ? "cursor-pointer hover:text-blue-600"
//                           : ""
//                       }
//                       onClick={() =>
//                         col.sortable !== false && handleSort(col.key)
//                       }
//                     >
//                       {col.header}
//                     </span>
//                     {col.sortable !== false && (
//                       <div className="flex flex-col">
//                         <ChevronUp
//                           className={`w-3 h-3 -mb-0.5 ${
//                             sortConfig.key === col.key &&
//                             sortConfig.direction === "asc"
//                               ? "text-blue-600"
//                               : "text-gray-400"
//                           }`}
//                           onClick={() => handleSort(col.key)}
//                         />
//                         <ChevronDown
//                           className={`w-3 h-3 ${
//                             sortConfig.key === col.key &&
//                             sortConfig.direction === "desc"
//                               ? "text-blue-600"
//                               : "text-gray-400"
//                           }`}
//                           onClick={() => handleSort(col.key)}
//                         />
//                       </div>
//                     )}
//                   </div>
//                 </th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {filteredData.length === 0 ? (
//               <tr>
//                 <td
//                   colSpan={COLUMNS.length}
//                   className="border border-gray-200 px-4 py-10 text-center text-gray-500"
//                 >
//                   <div className="flex flex-col items-center gap-2">
//                     <AlertCircle className="w-6 h-6 text-gray-400" />
//                     <span className="font-medium">No Certificate Found!</span>
//                   </div>
//                 </td>
//               </tr>
//             ) : (
//               filteredData.map((row, idx) => (
//                 <tr
//                   key={row.ApplicationID || idx}
//                   className="hover:bg-blue-50 transition-colors"
//                 >
//                   {COLUMNS.map((col) => {
//                     if (col.key === "srNo") {
//                       return (
//                         <td
//                           key={col.key}
//                           style={{ width: col.width }}
//                           className={`border border-gray-200 px-3 py-2 ${col.className}`}
//                         >
//                           {idx + 1}.
//                         </td>
//                       );
//                     }

//                     if (col.key === "action") {
//                       const isDownloading =
//                         downloadingId ===
//                         `${row.CandidateID};${row.ApplicationID}`;
//                       return (
//                         <td
//                           key={col.key}
//                           style={{ width: col.width }}
//                           className={`border border-gray-200 px-3 py-2 ${col.className}`}
//                         >
//                           <button
//                             onClick={() =>
//                               onDownload(row.CandidateID, row.ApplicationID)
//                             }
//                             disabled={isDownloading}
//                             className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded text-white transition-colors
//                               ${
//                                 isDownloading
//                                   ? "bg-green-400 cursor-not-allowed"
//                                   : "bg-green-600 hover:bg-green-700 active:bg-green-800"
//                               }`}
//                           >
//                             {isDownloading ? (
//                               <Loader2 className="w-3.5 h-3.5 animate-spin" />
//                             ) : (
//                               <Download className="w-3.5 h-3.5" />
//                             )}
//                             {isDownloading ? "Downloading…" : "Download Certificate"}
//                           </button>
//                         </td>
//                       );
//                     }

//                     return (
//                       <td
//                         key={col.key}
//                         style={{ width: col.width }}
//                         className={`border border-gray-200 px-3 py-2 ${col.className}`}
//                       >
//                         {row[col.key] ?? "—"}
//                       </td>
//                     );
//                   })}
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* Footer */}
//       <p className="text-xs text-gray-500">
//         Showing {filteredData.length} of {data.length} entr
//         {data.length !== 1 ? "ies" : "y"}
//         {searchTerm && ` (filtered by: "${searchTerm}")`}
//       </p>
//     </div>
//   );
// };

// /* ─────────────────────────────────────────────
//    MAIN PAGE COMPONENT
// ───────────────────────────────────────────── */
// const AcademisthanCertificate = () => {
//   const [tableData, setTableData]           = useState([]);
//   const [pageLoading, setPageLoading]       = useState(true);
//   const [error, setError]                   = useState("");
//   const [downloadingId, setDownloadingId]   = useState(null);

//   /* ── Simulate fetch on mount ── */
//   useEffect(() => {
//     // Simulate a short network delay
//     const timer = setTimeout(() => {
//       if (MOCK_DATA.length > 0) {
//         setTableData(MOCK_DATA);
//       } else {
//         setError("No Certificate Found!");
//       }
//       setPageLoading(false);
//     }, 800);

//     return () => clearTimeout(timer);
//   }, []);

//   /* ── Simulate certificate download ── */
//   const handleDownloadCertificate = (candidateId, applicationId) => {
//     const key = `${candidateId};${applicationId}`;
//     if (downloadingId) return; // prevent double-click
//     setDownloadingId(key);

//     // Simulate a 2-second download delay
//     setTimeout(() => {
//       // In real usage, the blob download logic goes here
//       setDownloadingId(null);
//     }, 2000);
//   };

//   /* ─────────────── RENDER ─────────────── */
//   return (
//     <div className="row form-container">
//       <div className="col-md-12">
//         <fieldset>
//           <legend>
//             <Award className="inline-block me-1 align-middle" size={16} />
//             <span>Certificate</span>
//           </legend>

//           <div className="p-3">
//             {/* Loading State */}
//             {pageLoading && (
//               <div className="flex items-center justify-center py-16 text-gray-500 gap-3">
//                 <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
//                 <span className="text-sm">Loading certificates…</span>
//               </div>
//             )}

//             {/* Error / Empty State */}
//             {!pageLoading && error && (
//               <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-md px-4 py-3 text-sm">
//                 <AlertCircle className="w-4 h-4 flex-shrink-0" />
//                 <span>{error}</span>
//               </div>
//             )}

//             {/* Data Table */}
//             {!pageLoading && !error && (
//               <CertificateTable
//                 data={tableData}
//                 onDownload={handleDownloadCertificate}
//                 downloadingId={downloadingId}
//               />
//             )}
//           </div>
//         </fieldset>
//       </div>
//     </div>
//   );
// };

// export default AcademisthanCertificate;