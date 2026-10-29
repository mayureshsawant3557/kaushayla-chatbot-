
// import React, { useState, useContext, useEffect } from "react";
// import { ThemeContext } from "../../Context/ThemeContext";
// import { FaFileAlt } from "react-icons/fa";
// import { SwalHelper } from "../../../utils/swalHelper";
// import agent from "../../../lib/api/agent";
// import { useSearchParams,useNavigate } from "react-router-dom";
// import {
//   resultstatusbybatchidAPI, 
// } from "../../../Endpoints_All/Examination/Exam";
// import { useAuth } from "../../../Hooks/AuthContext";
// import FilteredTableComponent from "../../formcomponent/FilteredTableComponent";


// const InfoItem = ({ label, value }) => (
//   <div className="text-gray-700">
//     {label} <span className="font-semibold text-gray-900">{value ?? "-"}</span>
//   </div>
// );


// const parseAnchorHtml = (value) => {
//   if (typeof value !== "string" || !value.includes("<a")) return null;
//   const hrefMatch = value.match(/href\s*=\s*\\?"([^"\\]*)/i);
//   return hrefMatch?.[1] ? { href: hrefMatch[1] } : null;
// };

// // NEW: dynamically pulls ALL query params out of a backend-generated href
// // (however many there are, whatever they're named), so we reuse whatever
// // IDs the server already resolved instead of guessing field names that
// // don't exist on the row (e.g. row.EvaluationSubjectId).
// const parseQueryParamsFromHref = (href) => {
//   try {
//     const url = new URL(href, window.location.origin);
//     return Object.fromEntries(url.searchParams.entries());
//   } catch {
//     return {};
//   }
// };


// const downloadFileFromUrl = async (url, suggestedName) => {
//   try {
//     const response = await fetch(url);
//     if (!response.ok) throw new Error(`Request failed: ${response.status}`);
//     const blob = await response.blob();
//     const blobUrl = window.URL.createObjectURL(blob);

//     const link = document.createElement("a");
//     link.href = blobUrl;
//     link.download = suggestedName || "report.pdf";
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     window.URL.revokeObjectURL(blobUrl);
//   } catch (err) {
//     // console.error("[BatchResultStatus] Download failed, opening in new tab instead:", err);
//     window.open(url, "_blank", "noopener,noreferrer");
//   }
// };


// const filenameFromUrl = (url) => {
//   try {
//     const clean = url.split("?")[0];
//     let name = clean.substring(clean.lastIndexOf("/") + 1) || "report.pdf";

//     // Strip any trailing junk after the real extension (e.g. "report.pdf_" -> "report.pdf")
//     name = name.replace(/\.pdf[^.]*$/i, ".pdf");

//     // Fallback: if for some reason it still doesn't end in .pdf, force it
//     if (!/\.pdf$/i.test(name)) {
//       name = name.replace(/_+$/, "") + ".pdf";
//     }

//     return name;
//   } catch {
//     return "report.pdf";
//   }
// };


// const ReportCell = ({ value, mode }) => {
//   const parsed = parseAnchorHtml(value);

//   if (!parsed?.href) {
//     return <span className="text-gray-400 text-xs">Not Available</span>;
//   }

//   const label = mode === "view" ? "View" : "Download";
//   const onClick =
//     mode === "view"
//       ? () => window.open(parsed.href, "_blank", "noopener,noreferrer")
//       : () => downloadFileFromUrl(parsed.href, filenameFromUrl(parsed.href));

//   return (
//     <button
//       onClick={onClick}
//       className="inline-block bg-sky-400 hover:bg-sky-500 text-white text-xs font-semibold px-3 py-1.5 rounded shadow-sm transition-colors"
//     >
//       {label}
//     </button>
//   );
// };

// /* ------------------------------------------------------------------ */
// /* Main component                                                      */
// /* ------------------------------------------------------------------ */
// const BatchResultStatus = ({ batchId: batchIdProp }) => {
//   const { color } = useContext(ThemeContext);
//   const userInfo = useAuth();
//   const [searchParams] = useSearchParams();
//   const navigate = useNavigate();

 
//   const batchId = batchIdProp ?? searchParams.get("batchId");

//   const [batchInfo, setBatchInfo] = useState(null);
//   const [subjectResults, setSubjectResults] = useState([]);
//   const [loading, setLoading] = useState(false);

 
//   const handleViewCandidates = (row) => {
//     const parsed = parseAnchorHtml(row.ViewCandidateList);

//     if (!parsed?.href) {
//       console.warn("[BatchResultStatus] No ViewCandidateList link found for row:", row);
//       SwalHelper.warning("Not Available", "Candidate list link is not available for this subject.");
//       return;
//     }

//     const params = parseQueryParamsFromHref(parsed.href);

//     if (Object.keys(params).length === 0) {
//       console.warn("[BatchResultStatus] Parsed params came back empty from href:", parsed.href);
//       SwalHelper.warning("Error", "Could not read candidate list link.");
//       return;
//     }

//     console.log("[BatchResultStatus] Dynamic params for this row:", params);

//     navigate(`/Exam/ResultStatusCandidateList?${new URLSearchParams(params).toString()}`);
//   };

//   const loadBatchResultStatus = async () => {
//     if (!batchId) {
//       console.warn("[BatchResultStatus] No batchId found in URL, skipping API call.");
//       return;
//     }

//     setLoading(true);

//     try {
//       const res = await agent.get(resultstatusbybatchidAPI, {
//         params: { BatchID: batchId },
//       });

//       const data = res?.data?.Data ?? {};

//       const info = data.BatchInfo ?? data.Table?.[0] ?? null;
//       const subjects = data.SubjectResults ?? data.Table1 ?? [];

//       setBatchInfo(info);
//       setSubjectResults(subjects);

//       if (subjects.length === 0) {
//         SwalHelper.warning("No Data", "No result data found for this batch.");
//       }
//     } catch (err) {
//       console.error("[BatchResultStatus] API error:", err);
//       SwalHelper.error("Error", "Failed to load result status. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadBatchResultStatus();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [batchId]);

//   /* ------------------------------------------------------------------ */
//   /* Table columns - mapped to the CONFIRMED Table1 field names:          */
//   /*   ExamDate, ExamTime, SubjectCodeName, ExamSubjectType,              */
//   /*   MaximumMarks, MinimumMarks, Pass, Failed, ResultHold, Absent,      */
//   /*   DownloadAttendanceReport, DownloadEvaluationReport,                */
//   /*   ViewCandidateList (raw <a href="..."> HTML strings)                */
//   /*                                                                       */
//   /* No `render` key on the three report columns - FilteredTableComponent */
//   /* uses a single renderCell prop instead (confirmed against              */
//   /* ResultStatus.jsx).                                                    */
//   /* ------------------------------------------------------------------ */
//   const columns = [
//     { key: "srNo", header: "Sr. No.", render: (_row, _col, index) => index + 1 },
//     { key: "ExamDate", header: "Date" },
//     { key: "ExamTime", header: "Timing" },
//     { key: "SubjectCodeName", header: "Subject" },
//     { key: "ExamSubjectType", header: "Subject Type" },
//     { key: "MaximumMarks", header: "Maximum Marks" },
//     { key: "MinimumMarks", header: "Passing Marks" },
//     { key: "DownloadAttendanceReport", header: "Attendance Report" },
//     { key: "DownloadEvaluationReport", header: "Evaluation Report" },
//     { key: "ViewCandidateList", header: "List of Candidates" },
//     { key: "Pass", header: "Passed" },
//     { key: "Failed", header: "Failed" },
//     { key: "ResultHold", header: "Result Hold" },
//     { key: "Absent", header: "Absent" },
//   ];

//   /* ------------------------------------------------------------------ */
//   /* Single cell renderer passed to FilteredTableComponent. Returns      */
//   /* undefined for any column we don't special-case, letting the table   */
//   /* fall back to its own default rendering.                              */
//   /* ------------------------------------------------------------------ */
//   const renderResultCell = (item, column) => {
//     if (column.key === "DownloadAttendanceReport" || column.key === "DownloadEvaluationReport") {
//       return <ReportCell value={item[column.key]} mode="download" />;
//     }
//     // if (column.key === "ViewCandidateList") {
//     //   return <ReportCell value={item[column.key]} mode="view" />;
//     // }
//     if (column.key === "ViewCandidateList") {
//   return (
//     <button
//       onClick={() => handleViewCandidates(item)}
//       className="inline-block bg-sky-400 hover:bg-sky-500 text-white text-xs font-semibold px-3 py-1.5 rounded shadow-sm transition-colors"
//     >
//       View
//     </button>
//   );
// }
//     return undefined;
//   };

//   return (
//     <div className="w-full p-4">
//       <fieldset className="rounded-lg border border-gray-300 bg-white shadow-lg mb-6">
//         <legend
//           className={`flex ${color} items-center text-base font-semibold text-white px-3 py-1.5 rounded-md ml-4`}
//         >
//           <FaFileAlt className="mr-2" />
//           Result Status
//         </legend>

//         {/* Batch / course info block */}
//         <div className="px-5 pt-4 pb-5">
//           {loading && !batchInfo ? (
//             <div className="text-sm text-gray-500 py-4">Loading batch details...</div>
//           ) : !batchInfo ? (
//             <div className="text-sm text-gray-400 py-4">
//               No batch details found{batchId ? ` for Batch ID: ${batchId}` : ""}.
//             </div>
//           ) : (
//             <>
//               <div className="mb-2 text-[14px]">
//                 Course{" "}
//                 <span className="font-semibold text-gray-900">
//                   {batchInfo?.CourseCode} - {batchInfo?.CourseName}
//                 </span>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-1.5 mb-1.5 text-[14px]">
//                 <InfoItem label="Batch ID" value={batchInfo?.BatchID} />
//                 <InfoItem label="Batch Status" value={batchInfo?.BatchStatusName} />
//                 <InfoItem label="Exam Type" value={batchInfo?.ExamType} />
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-1.5 mb-1.5 text-[14px]">
//                 <InfoItem label="Batch Start Date" value={batchInfo?.BatchStartDate} />
//                 <InfoItem label="Batch End Date" value={batchInfo?.BatchEndDate} />
//                 <InfoItem label="Admission Last Date" value={batchInfo?.AdmissionLastDate} />
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-1.5 mb-1.5 text-[14px]">
//                 <InfoItem label="Admitted" value={batchInfo?.Admitted} />
//                 <InfoItem label="Approved" value={batchInfo?.Approved} />
//                 <InfoItem label="Examinee" value={batchInfo?.Examinee} />
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-1.5 mb-1.5 text-[14px]">
//                 <InfoItem label="Examination" value={batchInfo?.Examination} />
//                 <InfoItem label="Hall Ticket Issuance Date" value={batchInfo?.HallTicketIssuanceDate} />
//                 <InfoItem label="Exam Start Date" value={batchInfo?.ExamStartDate} />
//               </div>

//               <div className="mb-1.5 text-[14px]">
//                 Evaluation Center Theory{" "}
//                 <span className="font-semibold text-gray-900">{batchInfo?.TheoryCenter}</span>
//               </div>
//               <div className="mb-1.5 text-[14px]">
//                 Evaluation Center Practical{" "}
//                 <span className="font-semibold text-gray-900">{batchInfo?.PracticalCenter}</span>
//               </div>
//               {/* Old ASPX concatenates code + name for Training Institute */}
//               <div className="text-[14px]">
//                 Training Institute{" "}
//                 <span className="font-semibold text-gray-900">
//                   {batchInfo?.InstituteCenterCode} - {batchInfo?.InstituteCenter}
//                 </span>
//               </div>
//             </>
//           )}
//         </div>

//         <hr />

//         {/* Results table */}
//         <div className="px-5 py-5">
//           <FilteredTableComponent
//             data={subjectResults}
//             columns={columns}
//             filterColumns={["ExamSubjectType"]}
//             loading={loading}
//             searchable={true}
//             sortable={true}
//             exportable={true}
//             showSearch={true}
//             showExport={true}
//             showPDF={true}
//             showExcel={true}
//             renderCell={renderResultCell}
//             exportFileName="ResultStatus"
//             tableTitle="Result Status"
//             maxHeight="500px"
//             stickyHeader={true}
//             emptyStateMessage="No Data Found"
//             emptyStateSubMessage="Results for this batch are not available yet."
//           />
//         </div>
//       </fieldset>
//     </div>
//   );
// };

// export default BatchResultStatus;
import React, { useState, useContext, useEffect } from "react";
import { ThemeContext } from "../../Context/ThemeContext";
import { FaFileAlt } from "react-icons/fa";
import { SwalHelper } from "../../../utils/swalHelper";
import agent from "../../../lib/api/agent";
import { useSearchParams,useNavigate } from "react-router-dom";
import {
  resultstatusbybatchidAPI, 
} from "../../../Endpoints_All/Examination/Exam";
import { useAuth } from "../../../Hooks/AuthContext";
import FilteredTableComponent from "../../formcomponent/FilteredTableComponent";


const InfoItem = ({ label, value }) => (
  <div className="text-gray-700">
    {label} <span className="font-semibold text-gray-900">{value ?? "-"}</span>
  </div>
);


const parseAnchorHtml = (value) => {
  if (typeof value !== "string" || !value.includes("<a")) return null;
  const hrefMatch = value.match(/href\s*=\s*\\?"([^"\\]*)/i);
  return hrefMatch?.[1] ? { href: hrefMatch[1] } : null;
};

const parseQueryParamsFromHref = (href) => {
  try {
    const url = new URL(href, window.location.origin);
    return Object.fromEntries(url.searchParams.entries());
  } catch {
    return {};
  }
};


const downloadFileFromUrl = async (url, suggestedName) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Request failed: ${response.status}`);
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = suggestedName || "report.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (err) {
    window.open(url, "_blank", "noopener,noreferrer");
  }
};


const filenameFromUrl = (url) => {
  try {
    const clean = url.split("?")[0];
    let name = clean.substring(clean.lastIndexOf("/") + 1) || "report.pdf";

    name = name.replace(/\.pdf[^.]*$/i, ".pdf");

    if (!/\.pdf$/i.test(name)) {
      name = name.replace(/_+$/, "") + ".pdf";
    }

    return name;
  } catch {
    return "report.pdf";
  }
};


const ReportCell = ({ value, mode }) => {
  const parsed = parseAnchorHtml(value);

  if (!parsed?.href) {
    return <span className="text-gray-400 text-xs">Not Available</span>;
  }

  const label = mode === "view" ? "View" : "Download";
  const onClick =
    mode === "view"
      ? () => window.open(parsed.href, "_blank", "noopener,noreferrer")
      : () => downloadFileFromUrl(parsed.href, filenameFromUrl(parsed.href));

  return (
    <button
      onClick={onClick}
      className="inline-block bg-sky-400 hover:bg-sky-500 text-white text-xs font-semibold px-3 py-1.5 rounded shadow-sm transition-colors"
    >
      {label}
    </button>
  );
};

const BatchResultStatus = ({ batchId: batchIdProp }) => {
  const { color } = useContext(ThemeContext);
  const userInfo = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

 
  const batchId = batchIdProp ?? searchParams.get("batchId");

  const [batchInfo, setBatchInfo] = useState(null);
  const [subjectResults, setSubjectResults] = useState([]);
  const [loading, setLoading] = useState(false);

 
  const handleViewCandidates = (row) => {
    const parsed = parseAnchorHtml(row.ViewCandidateList);

    if (!parsed?.href) {
      SwalHelper.warning("Not Available", "Candidate list link is not available for this subject.");
      return;
    }

    const params = parseQueryParamsFromHref(parsed.href);

    if (Object.keys(params).length === 0) {
      SwalHelper.warning("Error", "Could not read candidate list link.");
      return;
    }

    navigate(`/Exam/ResultStatusCandidateList?${new URLSearchParams(params).toString()}`);
  };

  const loadBatchResultStatus = async () => {
    if (!batchId) {
      return;
    }

    setLoading(true);

    try {
      const res = await agent.get(resultstatusbybatchidAPI, {
        params: { BatchID: batchId },
      });

      const data = res?.data?.Data ?? {};

      const info = data.BatchInfo ?? data.Table?.[0] ?? null;
      const subjects = data.SubjectResults ?? data.Table1 ?? [];

      setBatchInfo(info);
      setSubjectResults(subjects);

      if (subjects.length === 0) {
        SwalHelper.warning("No Data", "No result data found for this batch.");
      }
    } catch (err) {
      SwalHelper.error("Error", "Failed to load result status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBatchResultStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batchId]);

  const columns = [
    { key: "srNo", header: "Sr. No.", render: (_row, _col, index) => index + 1 },
    { key: "ExamDate", header: "Date" },
    { key: "ExamTime", header: "Timing" },
    { key: "SubjectCodeName", header: "Subject" },
    { key: "ExamSubjectType", header: "Subject Type" },
    { key: "MaximumMarks", header: "Maximum Marks" },
    { key: "MinimumMarks", header: "Passing Marks" },
    { key: "DownloadAttendanceReport", header: "Attendance Report" },
    { key: "DownloadEvaluationReport", header: "Evaluation Report" },
    { key: "ViewCandidateList", header: "List of Candidates" },
    { key: "Pass", header: "Passed" },
    { key: "Failed", header: "Failed" },
    { key: "ResultHold", header: "Result Hold" },
    { key: "Absent", header: "Absent" },
  ];

  const renderResultCell = (item, column) => {
    if (column.key === "DownloadAttendanceReport" || column.key === "DownloadEvaluationReport") {
      return <ReportCell value={item[column.key]} mode="download" />;
    }
    if (column.key === "ViewCandidateList") {
  return (
    <button
      onClick={() => handleViewCandidates(item)}
      className="inline-block bg-sky-400 hover:bg-sky-500 text-white text-xs font-semibold px-3 py-1.5 rounded shadow-sm transition-colors"
    >
      View
    </button>
  );
}
    return undefined;
  };

  return (
    <div className="w-full p-4">
      <fieldset className="rounded-lg border border-gray-300 bg-white shadow-lg mb-6">
        <legend
          className={`flex ${color} items-center text-base font-semibold text-white px-3 py-1.5 rounded-md ml-4`}
        >
          <FaFileAlt className="mr-2" />
          Result Status
        </legend>

        <div className="px-5 pt-4 pb-5">
          {loading && !batchInfo ? (
            <div className="text-sm text-gray-500 py-4">Loading batch details...</div>
          ) : !batchInfo ? (
            <div className="text-sm text-gray-400 py-4">
              No batch details found{batchId ? ` for Batch ID: ${batchId}` : ""}.
            </div>
          ) : (
            <>
              <div className="mb-2 text-[14px]">
                Course{" "}
                <span className="font-semibold text-gray-900">
                  {batchInfo?.CourseCode} - {batchInfo?.CourseName}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-1.5 mb-1.5 text-[14px]">
                <InfoItem label="Batch ID" value={batchInfo?.BatchID} />
                <InfoItem label="Batch Status" value={batchInfo?.BatchStatusName} />
                <InfoItem label="Exam Type" value={batchInfo?.ExamType} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-1.5 mb-1.5 text-[14px]">
                <InfoItem label="Batch Start Date" value={batchInfo?.BatchStartDate} />
                <InfoItem label="Batch End Date" value={batchInfo?.BatchEndDate} />
                <InfoItem label="Admission Last Date" value={batchInfo?.AdmissionLastDate} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-1.5 mb-1.5 text-[14px]">
                <InfoItem label="Admitted" value={batchInfo?.Admitted} />
                <InfoItem label="Approved" value={batchInfo?.Approved} />
                <InfoItem label="Examinee" value={batchInfo?.Examinee} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-1.5 mb-1.5 text-[14px]">
                <InfoItem label="Examination" value={batchInfo?.Examination} />
                <InfoItem label="Hall Ticket Issuance Date" value={batchInfo?.HallTicketIssuanceDate} />
                <InfoItem label="Exam Start Date" value={batchInfo?.ExamStartDate} />
              </div>

              <div className="mb-1.5 text-[14px]">
                Evaluation Center Theory{" "}
                <span className="font-semibold text-gray-900">{batchInfo?.TheoryCenter}</span>
              </div>
              <div className="mb-1.5 text-[14px]">
                Evaluation Center Practical{" "}
                <span className="font-semibold text-gray-900">{batchInfo?.PracticalCenter}</span>
              </div>
              <div className="text-[14px]">
                Training Institute{" "}
                <span className="font-semibold text-gray-900">
                  {batchInfo?.InstituteCenterCode} - {batchInfo?.InstituteCenter}
                </span>
              </div>
            </>
          )}
        </div>

        <hr />

        <div className="px-5 py-5">
          <FilteredTableComponent
            data={subjectResults}
            columns={columns}
            filterColumns={["ExamSubjectType"]}
            loading={loading}
            searchable={true}
            sortable={true}
            exportable={true}
            showSearch={true}
            showExport={true}
            showPDF={true}
            showExcel={true}
            renderCell={renderResultCell}
            exportFileName="ResultStatus"
            tableTitle="Result Status"
            maxHeight="500px"
            stickyHeader={true}
            emptyStateMessage="No Data Found"
            emptyStateSubMessage="Results for this batch are not available yet."
          />
        </div>
      </fieldset>
    </div>
  );
};

export default BatchResultStatus;