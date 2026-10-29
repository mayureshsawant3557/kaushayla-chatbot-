import { useState, useEffect, useMemo, useContext, useCallback, lazy, Suspense } from "react";
import agent from "../../../lib/api/agent";
import { Printer, Download } from "lucide-react";
import { SwalHelper } from "../../../utils/swalHelper";
import { ThemeContext } from "../../Context/ThemeContext";
import { getDeviceIP } from "../../../utils/CommonHelper";
import { FaFileAlt } from "react-icons/fa";
import {
  certificatelist,
  btnPrintSelectedSystemClick,
  bclsprintresultcertificate,
  btnPrintAllClick,
  markCertificatePrinted,
} from "../../../Endpoints_All/Examination/Exam";
import { useAuth } from "../../../Hooks/AuthContext";

// ─── Lazy load heavy table component ─────────────────────────────────────────
const FilteredTableComponent = lazy(() =>
  import("../../formcomponent/FilteredTableComponent")
);

const PAGE_SIZE = 10;

// ─── helpers ──────────────────────────────────────────────────────────────────

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return isNaN(d)
    ? dateStr
    : d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
};

const downloadResponseFile = (response, defaultFileName) => {
  const contentType =
    response.headers["content-type"] || "application/octet-stream";
  let fileName = defaultFileName;
  const disposition = response.headers["content-disposition"];
  if (disposition) {
    const match = disposition.match(/filename="?([^"]+)"?/);
    if (match?.[1]) fileName = match[1];
  }
  const blob = new Blob([response.data], { type: contentType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

const parseBlobError = async (blobData) => {
  try {
    const text = await blobData.text();
    const parsed = JSON.parse(text);
    return parsed?.Message ?? parsed?.message ?? "Something went wrong.";
  } catch {
    return "Something went wrong.";
  }
};

// ─── Skeleton loader ──────────────────────────────────────────────────────────

const SkeletonLoader = () => (
  <div className="animate-pulse space-y-2 py-4">
    <div className="h-8 bg-gray-200 rounded w-full mb-3" />
    {[...Array(8)].map((_, i) => (
      <div key={i} className="h-10 bg-gray-100 rounded w-full" />
    ))}
  </div>
);

// ─── Pagination ───────────────────────────────────────────────────────────────

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const getPages = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      const around = new Set([1, 2, totalPages - 1, totalPages]);
      for (
        let i = Math.max(1, currentPage - 1);
        i <= Math.min(totalPages, currentPage + 1);
        i++
      ) {
        around.add(i);
      }
      const sorted = [...around].sort((a, b) => a - b);
      sorted.forEach((p, idx) => {
        pages.push(p);
        const next = sorted[idx + 1];
        if (next && next - p > 1) pages.push("...");
      });
    }
    return pages;
  };

  const btnBase =
    "min-w-[36px] h-[36px] px-3 flex items-center justify-center rounded border text-sm font-medium transition-colors select-none";
  const activeCls = "bg-[#007bff] text-white border-[#007bff]";
  const normalCls = "bg-white text-gray-700 border-gray-300 hover:bg-gray-100";
  const disabledCls = "bg-white text-gray-400 border-gray-200 cursor-not-allowed";

  return (
    <div className="flex items-center justify-end gap-1 mt-3 flex-wrap">
      <button
        className={`${btnBase} ${currentPage === 1 ? disabledCls : normalCls}`}
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
      </button>

      {getPages().map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} className="px-1 text-gray-500 text-sm">
            ...
          </span>
        ) : (
          <button
            key={p}
            className={`${btnBase} ${currentPage === p ? activeCls : normalCls}`}
            onClick={() => onPageChange(p)}
          >
            {p}
          </button>
        )
      )}

      <button
        className={`${btnBase} ${currentPage === totalPages ? disabledCls : normalCls}`}
        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </div>
  );
};

// ─── Tab Button ───────────────────────────────────────────────────────────────

const TabButton = ({ label, count, active, onClick, countColor }) => (
  <button
    onClick={onClick}
    className={`relative flex items-center gap-2 px-5 py-2.5 text-sm font-semibold transition-all duration-200 border-b-2 focus:outline-none whitespace-nowrap ${active
        ? "border-[#007bff] text-[#007bff] bg-blue-50"
        : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
      }`}
  >
    {label}
    {count !== undefined && (
      <span
        className={`inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full text-xs font-bold ${active ? countColor.active : countColor.inactive
          }`}
      >
        {count}
      </span>
    )}
  </button>
);

// ─── Main component ───────────────────────────────────────────────────────────

const AcadmisthanResultStatus = () => {
  const { color } = useContext(ThemeContext);

  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [printedPage, setPrintedPage] = useState(1);
  const [instituteId, setInstituteId] = useState(0);
  const [courseId, setCourseId] = useState(0);
  const [activeTab, setActiveTab] = useState("pending");

  // ─── Parse sessionStorage once ───────────────────────────────────────────
  // const userInfoAll = useMemo(() => {
  //   try {
  //     return JSON.parse(sessionStorage.getItem("userInfoAll") || "{}");
  //   } catch {
  //     return {};
  //   }
  // }, []);

   const {userInfo} = useAuth();
   const user = userInfo;

  // ─── Split data in one pass ───────────────────────────────────────────────
  const { pendingData, printedData } = useMemo(() => {
    const pending = [];
    const printed = [];
    for (const r of tableData) {
      r.printed ? printed.push(r) : pending.push(r);
    }
    return { pendingData: pending, printedData: printed };
  }, [tableData]);

  // ─── Paged slices ─────────────────────────────────────────────────────────
  const totalPendingPages = Math.ceil(pendingData.length / PAGE_SIZE);
  const totalPrintedPages = Math.ceil(printedData.length / PAGE_SIZE);

  const pagedPending = useMemo(
    () => pendingData.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [pendingData, currentPage]
  );

  const pagedPrinted = useMemo(
    () => printedData.slice((printedPage - 1) * PAGE_SIZE, printedPage * PAGE_SIZE),
    [printedData, printedPage]
  );

  const activePagedData = activeTab === "pending" ? pagedPending : pagedPrinted;

  // ─── Select helpers ───────────────────────────────────────────────────────
  const allPageSelected =
    pagedPending.length > 0 &&
    pagedPending.every((r) => selectedIds.has(r.id));

  const toggleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (pagedPending.every((r) => prev.has(r.id))) {
        pagedPending.forEach((r) => next.delete(r.id));
      } else {
        pagedPending.forEach((r) => next.add(r.id));
      }
      return next;
    });
  }, [pagedPending]);

  const toggleRow = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const selectedItems = useMemo(
    () => pendingData.filter((r) => selectedIds.has(r.id)),
    [pendingData, selectedIds]
  );

  // ─── Fetch ────────────────────────────────────────────────────────────────
  const fetchCertificateList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let instId = userInfo?.InstituteID ?? 0;
      if (Array.isArray(instId)) instId = instId[0];
      instId = Number(instId);
      const crsId = 0;

      const res = await agent.get(certificatelist, {
        params: { instituteId: instId, courseId: crsId },
      });

      const statusCode = res?.data?.StatusCode ?? res?.data?.statusCode;
      const rawData = res?.data?.Data ?? res?.data?.data ?? [];

      if (statusCode === 200) {
        const mapped = rawData.map((item, index) => ({
          id: item.ID ?? item.CertificateId ?? index,
          certId: item.ID ?? item.CertificateId,
          appId: item.ApplicationIDDisplay ?? item.ApplicationId ?? "",
          candidateId: item.ProfileNo ?? item.CandidateIDDisplay ?? item.CandidateID ?? "",
          name: item.CandidateName ?? item.StudentName ?? "",
          course: item.CourseNameCode ?? item.CourseName ?? "",
          institute: item.InstituteNameCode ?? item.InstituteName ?? "",
          issueDate: formatDate(item.ResultDate ?? item.IssueDate),
          createdDate: formatDate(item.CreatedDateTime ?? item.CreatedDate),
          printed: !!(item.IsPrinted ?? item.Isprinted ?? 0),
        }));

        setTableData(mapped);
        setInstituteId(instId);
        setCourseId(crsId);
      } else {
        setError(res?.data?.Message ?? res?.data?.message ?? "No data found.");
        setTableData([]);
      }
    } catch (err) {
      setError("Failed to load data. Please try again.");
      setTableData([]);
    } finally {
      setLoading(false);
    }
  }, [userInfo]);

  useEffect(() => {
    fetchCertificateList();
   
    
  }, [fetchCertificateList]);

  // ─── Mark Printed ─────────────────────────────────────────────────────────
  const handleMarkPrinted = useCallback(async (id) => {
    try {
      SwalHelper.loading("Updating...", "Please wait.");
      const ipAddress = await getDeviceIP();
      const payload = {
        certificateId: id,
        printedBy: userInfo?.UserName || "",
        printedIpAddress: ipAddress || "",
      };
      const res = await agent.post(markCertificatePrinted, payload, {
        headers: { "Content-Type": "application/json" },
      });
      const result = res?.data?.Data ?? res?.data?.data ?? res?.data;
      if (result === "Y" || res?.data?.StatusCode === 200) {
        setTableData((prev) =>
          prev.map((r) =>
            r.id === id ? { ...r, printed: true, printedOn: new Date().toISOString() } : r
          )
        );
        SwalHelper.success("Done", `Certificate ID ${id} marked as printed.`);
      } else {
        SwalHelper.error("Failed", "Could not mark as printed.");
      }
    } catch (err) {
      SwalHelper.error("Error", "Failed to mark certificate as printed.");
    } finally {
      SwalHelper.close();
    }
  }, [userInfo]);

  // ─── Re-download ──────────────────────────────────────────────────────────
  const handleReDownload = useCallback(async (certId) => {
    const payload = {
      ExaminationId: 0,
      IsResultFresh: "F",
      CertificateIds: [Number(certId)],
    };
    try {
      SwalHelper.loading("Downloading...", "Please wait.");
      const res = await agent.post(bclsprintresultcertificate, payload, {
        responseType: "blob",
        headers: { "Content-Type": "application/json" },
      });
      SwalHelper.close();
      downloadResponseFile(res, `Certificate_${certId}.pdf`);
    } catch (err) {
      SwalHelper.close();
      if (err?.response?.data instanceof Blob) {
        const msg = await parseBlobError(err.response.data);
        alert(msg || "Failed to re-download certificate.");
      } else {
        alert("Failed to re-download certificate.");
      }
    }
  }, []);

  // ─── Print Selected ───────────────────────────────────────────────────────
  const handlePrintSelected = useCallback(async () => {
    const certificateIds = selectedItems.map((x) => Number(x.certId));
    if (certificateIds.length === 0) { alert("No rows selected."); return; }
    const payload = { ExaminationId: 0, IsResultFresh: "F", CertificateIds: certificateIds };
    try {
      SwalHelper.loading("Downloading...", "Please wait.");
      const res = await agent.post(bclsprintresultcertificate, payload, {
        responseType: "blob",
        headers: { "Content-Type": "application/json" },
      });
      let fileName = certificateIds.length === 1 ? "Certificate.pdf" : "Certificates.zip";
      const disposition = res.headers["content-disposition"];
      if (disposition) {
        const match = disposition.match(/filename="?([^"]+)"?/);
        if (match?.[1]) fileName = match[1];
      }
      SwalHelper.close();
      downloadResponseFile(res, fileName);
    } catch (err) {
      SwalHelper.close();
      if (err?.response?.data instanceof Blob) {
        const msg = await parseBlobError(err.response.data);
        alert(msg || "Failed to print selected certificates.");
      } else {
        alert("Failed to print selected certificates.");
      }
    }
  }, [selectedItems]);

  // ─── Print All ────────────────────────────────────────────────────────────
  const handlePrintAll = useCallback(async () => {
    if (tableData.length === 0) { alert("No certificates to print."); return; }
    setSelectedIds(new Set(tableData.map((x) => x.id)));
    const allCertIds = tableData.map((x) => Number(x.certId));
    const payload = {
      InstituteId: instituteId,
      CourseId: courseId,
      ExaminationId: 0,
      IsResultFresh: "F",
      CertificateIds: allCertIds,
    };
    try {
      SwalHelper.loading("Downloading...", "Please wait.");
      const res = await agent.post(btnPrintAllClick, payload, {
        responseType: "blob",
        headers: { "Content-Type": "application/json" },
      });
      let fileName = `AllCertificates_${allCertIds.length}.zip`;
      const disposition = res.headers["content-disposition"];
      if (disposition) {
        const match = disposition.match(/filename="?([^"]+)"?/);
        if (match?.[1]) fileName = match[1];
      }
      SwalHelper.close();
      downloadResponseFile(res, fileName);
    } catch (err) {
      SwalHelper.close();
      if (err?.response?.data instanceof Blob) {
        const text = await err.response.data.text();
        alert(text || "Failed to download certificates.");
      } else {
        alert("Failed to print all certificates.");
      }
    }
  }, [tableData, instituteId, courseId]);

  // ─── Print Selected System ────────────────────────────────────────────────
  const handlePrintSelectedSystem = useCallback(async () => {
    const certificateIds = selectedItems.map((x) => Number(x.certId));
    if (!certificateIds.length) { alert("Please select at least one certificate."); return; }
    const payload = { ExaminationId: 0, IsResultFresh: "F", CertificateIds: certificateIds };
    try {
      SwalHelper.loading("Downloading...", "Please wait.");
      const res = await agent.post(btnPrintSelectedSystemClick, payload, {
        responseType: "blob",
        headers: { "Content-Type": "application/json" },
      });
      let fileName = "Certificates.zip";
      const disposition = res.headers["content-disposition"];
      if (disposition) {
        const match = disposition.match(/filename="?([^"]+)"?/);
        if (match?.[1]) fileName = match[1];
      }
      SwalHelper.close();
      downloadResponseFile(res, fileName);
    } catch (err) {
      SwalHelper.close();
      if (err?.response?.data instanceof Blob) {
        const text = await err.response.data.text();
        alert(text || "Failed to download certificate.");
      } else {
        alert("Failed to print selected system certificates.");
      }
    }
  }, [selectedItems]);

  // ─── Columns — memoized to prevent FilteredTableComponent re-renders ──────
  const pendingColumns = useMemo(() => [
    {
      key: "_select",
      header: (
        <div className="flex flex-col items-center gap-1">
          <input
            type="checkbox"
            checked={allPageSelected}
            onChange={toggleSelectAll}
            className="cursor-pointer"
          />
          <span className="text-xs font-semibold">Select</span>
        </div>
      ),
      width: "60px",
      headerClassName: "text-center",
      sortable: false,
      excludeFromExport: true,
    },
    { key: "certId", header: "Certificate ID", width: "110px", headerClassName: "text-center", className: "text-center font-medium text-gray-800" },
    { key: "appId", header: "Application ID", width: "160px", headerClassName: "text-left", className: "text-gray-700 whitespace-nowrap" },
    { key: "candidateId", header: "Candidate ID", width: "140px", headerClassName: "text-left", className: "text-gray-700 whitespace-nowrap" },
    { key: "name", header: "Student Name", width: "220px", headerClassName: "text-left", className: "text-gray-700" },
    { key: "course", header: "Course", width: "260px", headerClassName: "text-left", className: "text-gray-700 leading-snug" },
    { key: "institute", header: "Institute", width: "300px", headerClassName: "text-left", className: "text-gray-700 leading-snug" },
    { key: "issueDate", header: "Issue Date", width: "120px", headerClassName: "text-center", className: "text-center text-gray-700 whitespace-nowrap" },
    { key: "createdDate", header: "Created Date", width: "120px", headerClassName: "text-center", className: "text-center text-gray-700 whitespace-nowrap" },
    { key: "actions", header: "Actions", width: "160px", headerClassName: "text-center", className: "text-center overflow-hidden", sortable: false, excludeFromExport: true },
  ], [allPageSelected, toggleSelectAll]);

  const printedColumns = useMemo(() => [
    { key: "certId", header: "Certificate ID", width: "110px", headerClassName: "text-center", className: "text-center font-medium text-gray-800" },
    { key: "appId", header: "Application ID", width: "160px", headerClassName: "text-left", className: "text-gray-700 whitespace-nowrap" },
    { key: "candidateId", header: "Candidate ID", width: "140px", headerClassName: "text-left", className: "text-gray-700 whitespace-nowrap" },
    { key: "name", header: "Student Name", width: "220px", headerClassName: "text-left", className: "text-gray-700" },
    { key: "course", header: "Course", width: "260px", headerClassName: "text-left", className: "text-gray-700 leading-snug" },
    { key: "institute", header: "Institute", width: "300px", headerClassName: "text-left", className: "text-gray-700 leading-snug" },
    { key: "issueDate", header: "Issue Date", width: "120px", headerClassName: "text-center", className: "text-center text-gray-700 whitespace-nowrap" },
    { key: "createdDate", header: "Created Date", width: "120px", headerClassName: "text-center", className: "text-center text-gray-700 whitespace-nowrap" },
    { key: "actions", header: "Actions", width: "180px", headerClassName: "text-center", className: "text-center overflow-hidden", sortable: false, excludeFromExport: true },
  ], []);

  // ─── renderCell — memoized, called for every cell ─────────────────────────
  const renderCell = useCallback((item, column) => {
    if (column.key === "_select") {
      return (
        <div className="flex justify-center">
          <input
            type="checkbox"
            checked={selectedIds.has(item.id)}
            onChange={() => toggleRow(item.id)}
            className="cursor-pointer"
          />
        </div>
      );
    }

    if (column.key === "actions") {
      if (activeTab === "printed") {
        return (
          <div className="flex justify-center items-center gap-2">
            <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-300 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Printed
            </span>
            <button
              onClick={() => handleReDownload(item.certId)}
              title={`Re-download certificate #${item.certId}`}
              className="inline-flex items-center gap-1.5 text-white text-xs font-semibold px-3 py-1.5 rounded-full
                bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700
                shadow-sm hover:shadow-blue-300 transition-all duration-200 ease-in-out
                border border-blue-400 whitespace-nowrap"
            >
              <Download size={12} />
              Re-download
            </button>
          </div>
        );
      }

      return (
        <div className="flex justify-center">
          {item.printed ? (
            <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-500 border border-gray-300 text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap">
              <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Printed
            </span>
          ) : (
            <button
              onClick={() => handleMarkPrinted(item.id)}
              className="inline-flex items-center gap-1.5 text-white text-xs font-semibold px-3 py-1.5 rounded-full
                bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700
                shadow-md hover:shadow-green-300 transition-all duration-200 ease-in-out
                border border-green-400 whitespace-nowrap"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6v-8z" />
              </svg>
              Mark Printed
            </button>
          )}
        </div>
      );
    }

    return undefined;
  }, [selectedIds, activeTab, toggleRow, handleMarkPrinted, handleReDownload]);

  // ─── render ───────────────────────────────────────────────────────────────
  return (
    <div className="w-full p-4">
      <fieldset className="rounded-lg border border-gray-300 bg-white shadow-lg">
        <legend
          className={`flex ${color} items-center text-base font-semibold text-white border-2 border-gray-300 px-3 py-1.5 rounded-md ml-4`}
        >
          <FaFileAlt className="mr-2 text-white" />
          BCLS Result Status
        </legend>

        <div className="px-4 pb-4 pt-3">

          {/* ── Skeleton Loader ── */}
          {loading && <SkeletonLoader />}

          {/* ── Error ── */}
          {!loading && error && (
            <div className="flex flex-col justify-center items-center py-10 gap-3">
              <p className="text-red-500 text-sm font-medium">{error}</p>
              <button
                onClick={fetchCertificateList}
                className="text-sm bg-gray-700 text-white px-4 py-1.5 rounded hover:bg-gray-800 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* ── Tabs ── */}
              <div className="flex border-b border-gray-200 mb-4">
                <TabButton
                  label="Pending"
                  count={pendingData.length}
                  active={activeTab === "pending"}
                  onClick={() => { setActiveTab("pending"); setCurrentPage(1); }}
                  countColor={{ active: "bg-blue-100 text-blue-700", inactive: "bg-gray-100 text-gray-500" }}
                />
                <TabButton
                  label="Printed"
                  count={printedData.length}
                  active={activeTab === "printed"}
                  onClick={() => { setActiveTab("printed"); setPrintedPage(1); }}
                  countColor={{ active: "bg-green-100 text-green-700", inactive: "bg-gray-100 text-gray-500" }}
                />
              </div>

              {/* ── Table with Suspense fallback ── */}
              <Suspense fallback={<SkeletonLoader />}>
                <FilteredTableComponent
                  data={activePagedData}
                  columns={activeTab === "pending" ? pendingColumns : printedColumns}
                  renderCell={renderCell}
                  title="BCLS Result Status"
                  exportFileName="BCLSResultStatus"
                  tableId="bcls-result-table"
                  maxHeight="600px"
                  emptyStateMessage={activeTab === "pending" ? "No Pending Certificates" : "No Printed Certificates"}
                  emptyStateSubMessage={activeTab === "pending" ? "All certificates have been printed" : "Mark a certificate as printed to see it here"}
                  showSearch={true}
                  searchPosition="right"
                  showExport={true}
                  showExcel={true}
                  showPDF={true}
                  showExcelTemplate={false}
                  showCheckbox={false}
                />
              </Suspense>

              {/* ── Pagination ── */}
              {activeTab === "pending" ? (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPendingPages}
                  onPageChange={(p) => setCurrentPage(p)}
                />
              ) : (
                <Pagination
                  currentPage={printedPage}
                  totalPages={totalPrintedPages}
                  onPageChange={(p) => setPrintedPage(p)}
                />
              )}

              {/* ── Action Buttons — Pending tab only ── */}
              {activeTab === "pending" && (
                <div className="flex items-center gap-3 flex-wrap mt-4 border-t pt-4">
                  <button
                    onClick={handlePrintSelected}
                    disabled={selectedItems.length === 0}
                    className={`flex items-center gap-1.5 text-white text-sm font-semibold px-4 py-2 rounded transition-colors ${selectedItems.length === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-[#28a745] hover:bg-[#218838]"
                      }`}
                  >
                    <Printer size={14} />
                    Print Selected
                  </button>

                  <button
                    onClick={handlePrintAll}
                    disabled={tableData.length === 0}
                    className={`flex items-center gap-1.5 text-white text-sm font-semibold px-4 py-2 rounded transition-colors ${tableData.length === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-[#007bff] hover:bg-[#0069d9]"
                      }`}
                  >
                    <Printer size={14} />
                    Print All
                  </button>

                  <button
                    onClick={handlePrintSelectedSystem}
                    disabled={selectedItems.length === 0}
                    className={`flex items-center gap-1.5 text-white text-sm font-semibold px-4 py-2 rounded transition-colors ${selectedItems.length === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-[#ffc107] hover:bg-[#e0a800]"
                      }`}
                  >
                    <Printer size={14} />
                    Print Selected System
                  </button>

                  {selectedItems.length > 0 && (
                    <span className="text-sm text-gray-500 ml-2">
                      {selectedItems.length} row(s) selected
                    </span>
                  )}
                </div>
              )}

              {/* ── Printed tab info bar ── */}
              {activeTab === "printed" && printedData.length > 0 && (
                <div className="flex items-center gap-2 mt-4 border-t pt-4">
                  <span className="inline-flex items-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full font-medium">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {printedData.length} certificate{printedData.length !== 1 ? "s" : ""} printed
                  </span>
                  <span className="text-xs text-gray-400">
                    Use Re-download to get the certificate file again by ID
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </fieldset>
    </div>
  );
};

export default AcadmisthanResultStatus;