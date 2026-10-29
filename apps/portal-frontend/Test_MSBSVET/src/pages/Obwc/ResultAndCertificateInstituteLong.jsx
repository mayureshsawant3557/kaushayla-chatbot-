import React, {
  useState,
  useEffect,
  useContext,
  useMemo,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import agent from "../../lib/api/agent";
import DropdownComponent from "../../Component/formcomponent/DropdownComponent";
import FilteredTableComponent from "../../Component/formcomponent/FilteredTableComponent";
import { ThemeContext } from "../../Component/Context/ThemeContext";
import { useLoading } from "../../Hooks/useLoading";
import {
  GetTraningPartnerOBWCResult,
  GetCourseOBWCResult,
  GetDistrictOBWCResult,
  GetBatchOBWCResult,
  GetBatchStatusOBWCResult,
  GetBatchTypeOBWCResult,
  GetTraningPartnerOBWCResultMasters,
  GetSearchResult,
  DownloadCertificate,
  DownloadPreCertificate,
  DownloadResultSheet,
} from "../../Endpoints_All/Obwc/Obwc";

// ---- static helpers/constants moved outside the component so they're
// never recreated on render ----

const formatOption = (arr) =>
  Array.isArray(arr)
    ? arr.map((i) => ({
        value: String(i.Value),
        label: i.Text,
      }))
    : [];

const SELECT_OPTION = { value: "-1", label: "Select" };

const formatCourseTable = (rows) => [
  SELECT_OPTION,
  ...(rows || []).map((r) => ({
    value: String(r.CourseID),
    label: r.CourseName,
  })),
];
const formatDistrictTable = (rows) => [
  SELECT_OPTION,
  ...(rows || []).map((r) => ({
    value: String(r.District),
    label: r.district_name,
  })),
];
const formatBatchCodeTable = (rows) => [
  SELECT_OPTION,
  ...(rows || []).map((r) => ({
    value: String(r.batch_code),
    label: r.batch_code,
  })),
];
const formatBatchStatusTable = (rows) => [
  SELECT_OPTION,
  ...(rows || []).map((r) => ({
    value: String(r.batch_status),
    label: r.batch_status,
  })),
];
const formatBatchTypeTable = (rows) => [
  SELECT_OPTION,
  ...(rows || []).map((r) => ({
    value: String(r.batch_type),
    label: r.batch_type,
  })),
];

const initialFormData = {
  TrainingPartnerID: "-1",
  CourseID: "-1",
  DistrictID: "-1",
  BatchCode: "-1",
  BatchStatus: "-1",
  BatchType: "-1",
};

const extractFileName = (headers, fallback) => {
  const disposition = headers?.["content-disposition"];
  if (disposition) {
    const match = disposition.match(/filename\*?=(?:UTF-8'')?["']?([^"';]+)/i);
    if (match?.[1]) return decodeURIComponent(match[1]);
  }
  return fallback;
};

const saveBlob = (blobData, headers, fallbackName) => {
  const filename = extractFileName(headers, fallbackName);
  const url = window.URL.createObjectURL(new Blob([blobData]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

const batchCodeLinkStyles = `
  .batch-code-link-wrap a {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-width: 110px;
    padding: 0.5rem 1rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: #fff;
    background-color: #2563eb;
    border-radius: 0.375rem;
    transition: background-color 0.2s;
    text-decoration: none;
  }
  .batch-code-link-wrap a:hover {
    background-color: #1d4ed8;
  }
`;

const actionBtnBase =
  "inline-flex items-center justify-center w-full min-w-[110px] px-4 py-2 " +
  "text-xs font-semibold text-white rounded-md transition-colors";

const staticColumns = [
  { key: "TrainingPartner", header: "TP Name" },
  { key: "District", header: "Site District" },
  { key: "CourseName", header: "Course" },
  { key: "BatchCodeURL", header: "Batch Code" },
  { key: "batch_status", header: "Batch Status" },
  { key: "Enrolled", header: "Enrolled" },
  { key: "Appeared", header: "Appeared" },
  { key: "Passed", header: "Passed" },
  { key: "SystemCertificate", header: "System Certificate" },
  { key: "PrePrintedCertificate", header: "Pre Printed Certificate" },
  { key: "ResultSheet", header: "Result Sheet" },
  { key: "DispatchDateTime", header: "Certificate Dispatch Date" },
];

const ResultAndCertificateInstituteLong = () => {
  const { color } = useContext(ThemeContext);
  const { startLoading, stopLoading, isLoading } = useLoading();
  const navigate = useNavigate();

  const [trainingPartners, setTrainingPartners] = useState([]);
  const [courses, setCourses] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [batchCodes, setBatchCodes] = useState([]);
  const [batchStatuses, setBatchStatuses] = useState([]);
  const [batchTypes, setBatchTypes] = useState([]);

  const [formData, setFormData] = useState(initialFormData);
  const [tableData, setTableData] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAll = useCallback(async () => {
    startLoading();
    try {
      const [tp, course, district, batch, status, type] = await Promise.all([
        agent.get(GetTraningPartnerOBWCResult),
        agent.get(GetCourseOBWCResult),
        agent.get(GetDistrictOBWCResult),
        agent.get(GetBatchOBWCResult),
        agent.get(GetBatchStatusOBWCResult),
        agent.get(GetBatchTypeOBWCResult),
      ]);

      setTrainingPartners(formatOption(tp?.data?.Data));
      setCourses(formatOption(course?.data?.Data));
      setDistricts(formatOption(district?.data?.Data));
      setBatchCodes(formatOption(batch?.data?.Data));
      setBatchStatuses(formatOption(status?.data?.Data));
      setBatchTypes(formatOption(type?.data?.Data));
    } finally {
      stopLoading();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMastersFor = useCallback(
    async (trainingPartnerID, courseID, districtID, batchStatus) => {
      const params = new URLSearchParams({
        InstituteID: trainingPartnerID || "-1",
        CourseID: courseID || "-1",
        District: districtID || "-1",
        batch_status: batchStatus || "-1",
      });
      const res = await agent.get(
        `${GetTraningPartnerOBWCResultMasters}?${params}`,
      );
      return res?.data?.Data ?? {};
    },
    [],
  );

  const handleTrainingPartnerChange = useCallback(
    async (value) => {
      setFormData({ ...initialFormData, TrainingPartnerID: value });
      setTableData([]);
      setHasSearched(false);

      if (value === "-1") return;

      startLoading();
      try {
        const ds = await loadMastersFor(value, -1, "", "");
        setCourses(formatCourseTable(ds?.Table1));
        setDistricts(formatDistrictTable(ds?.Table2));
        setBatchCodes(formatBatchCodeTable(ds?.Table3));
        setBatchStatuses(formatBatchStatusTable(ds?.Table4));
        setBatchTypes(formatBatchTypeTable(ds?.Table5));
      } finally {
        stopLoading();
      }
    },
    [loadMastersFor],
  );

  const handleCourseChange = useCallback(
    async (value) => {
      setFormData((p) => ({
        ...p,
        CourseID: value,
        DistrictID: "-1",
        BatchCode: "-1",
        BatchStatus: "-1",
        BatchType: "-1",
      }));
      setTableData([]);
      setHasSearched(false);

      if (value === "-1") return;

      startLoading();
      try {
        const ds = await loadMastersFor(
          formData.TrainingPartnerID,
          value,
          "",
          "",
        );
        setDistricts(formatDistrictTable(ds?.Table2));
        setBatchCodes(formatBatchCodeTable(ds?.Table3));
        setBatchStatuses(formatBatchStatusTable(ds?.Table4));
        setBatchTypes(formatBatchTypeTable(ds?.Table5));
      } finally {
        stopLoading();
      }
    },
    [loadMastersFor, formData.TrainingPartnerID],
  );

  const handleDistrictChange = useCallback(
    async (value) => {
      setFormData((p) => ({
        ...p,
        DistrictID: value,
        BatchCode: "-1",
        BatchStatus: "-1",
        BatchType: "-1",
      }));
      setTableData([]);
      setHasSearched(false);

      if (value === "-1") return;

      startLoading();
      try {
        const ds = await loadMastersFor(
          formData.TrainingPartnerID,
          formData.CourseID,
          value,
          "",
        );
        setBatchCodes(formatBatchCodeTable(ds?.Table3));
        setBatchStatuses(formatBatchStatusTable(ds?.Table4));
        setBatchTypes(formatBatchTypeTable(ds?.Table5));
      } finally {
        stopLoading();
      }
    },
    [loadMastersFor, formData.TrainingPartnerID, formData.CourseID],
  );

  const handleBatchStatusChange = useCallback(
    async (value) => {
      setFormData((p) => ({ ...p, BatchStatus: value, BatchType: "-1" }));
      setTableData([]);
      setHasSearched(false);

      if (value === "-1") return;

      startLoading();
      try {
        const ds = await loadMastersFor(
          formData.TrainingPartnerID,
          formData.CourseID,
          formData.DistrictID,
          value,
        );
        setBatchTypes(formatBatchTypeTable(ds?.Table5));
      } finally {
        stopLoading();
      }
    },
    [
      loadMastersFor,
      formData.TrainingPartnerID,
      formData.CourseID,
      formData.DistrictID,
    ],
  );

  const handleChange = useCallback((name, value) => {
    setFormData((p) => ({ ...p, [name]: value }));
    setTableData([]);
  }, []);

  const handleSearch = useCallback(async () => {
    startLoading();
    setHasSearched(true);

    const params = new URLSearchParams({
      InstituteID: formData.TrainingPartnerID,
      CoureseID: formData.CourseID,
      District: formData.DistrictID,
      batch_id: formData.BatchCode,
      batch_status: formData.BatchStatus,
      batch_type: formData.BatchType,
    });

    try {
      const res = await agent.get(`${GetSearchResult}?${params}`);
      setTableData(res?.data?.Data || []);
    } finally {
      stopLoading();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  const handleReset = useCallback(() => {
    setFormData(initialFormData);
    setTableData([]);
    setHasSearched(false);
    loadAll();
  }, [loadAll]);

  const handleCertificate = useCallback(async (row) => {
    startLoading();
    try {
      const params = new URLSearchParams({
        BatchID: row.batch_id,
        SiteID: row.site_id,
        CandidateID: row.InstituteID,
        BatchType: row.batch_type,
      });
      const res = await agent.get(`${DownloadCertificate}?${params}`, {
        responseType: "blob",
      });
      saveBlob(res.data, res.headers, `${row.batch_code}_Certificate.zip`);
    } catch (err) {
      console.error("Certificate download failed:", err);
      alert("Failed to download certificate.");
    } finally {
      stopLoading();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePreCertificate = useCallback(async (row) => {
    startLoading();
    try {
      const params = new URLSearchParams({
        BatchID: row.batch_id,
        SiteID: row.site_id,
        CandidateID: row.InstituteID,
        BatchType: row.batch_type,
      });
      const res = await agent.get(`${DownloadPreCertificate}?${params}`, {
        responseType: "blob",
      });
      saveBlob(res.data, res.headers, `${row.batch_code}_PreCertificate.pdf`);
    } catch (err) {
      console.error("Pre-certificate download failed:", err);
      alert("Failed to download pre-printed certificate.");
    } finally {
      stopLoading();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleResultSheet = useCallback(async (row) => {
    startLoading();
    try {
      const params = new URLSearchParams({ BatchCode: row.batch_code });
      const res = await agent.get(`${DownloadResultSheet}?${params}`, {
        responseType: "blob",
      });
      saveBlob(res.data, res.headers, `${row.batch_code}_ResultSheet.pdf`);
    } catch (err) {
      console.error("Result sheet download failed:", err);
      alert("Failed to download result sheet.");
    } finally {
      stopLoading();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderCell = useCallback(
    (row, column) => {
      if (column.key === "BatchCodeURL") {
        const fixedHtml = (row.BatchCodeURL || "").replace(/\.aspx/i, "");

        return (
          <span
            className="batch-code-link-wrap"
            dangerouslySetInnerHTML={{ __html: fixedHtml }}
            onClick={(e) => {
              const anchor = e.target.closest("a");
              if (!anchor) return;
              e.preventDefault();

              const href = anchor.getAttribute("href") || "";
              const [pathPart, queryPart] = href.split("?");
              navigate({
                pathname: `/Obwc/${pathPart}`,
                search: queryPart ? `?${queryPart}` : "",
              });
            }}
          />
        );
      }

      if (column.key === "SystemCertificate") {
        return row.IsCertificateGenerated === "Y" ? (
          <button
            className={`${actionBtnBase} bg-green-600 hover:bg-green-700`}
            onClick={() => handleCertificate(row)}
          >
            Certificate
          </button>
        ) : null;
      }

      if (column.key === "PrePrintedCertificate") {
        return row.IsCertificateGenerated === "Y" ? (
          <button
            className={`${actionBtnBase} bg-green-600 hover:bg-green-700`}
            onClick={() => handlePreCertificate(row)}
          >
            Certificate
          </button>
        ) : null;
      }

      if (column.key === "ResultSheet") {
        return (
          <button
            className={`${actionBtnBase} bg-green-600 hover:bg-green-700`}
            onClick={() => handleResultSheet(row)}
          >
            Result Sheet
          </button>
        );
      }

      return <span>{row[column.key] ?? "-"}</span>;
    },
    [navigate, handleCertificate, handlePreCertificate, handleResultSheet],
  );

  // columns array never changes at runtime, so a single stable reference
  // (defined outside the component) is used directly - no need for useMemo
  const columns = staticColumns;

  return (
    <div className="p-4">
      <style>{batchCodeLinkStyles}</style>
      <fieldset className="rounded border p-4 mb-6 bg-white shadow-sm">
        <legend className={`rounded ${color} px-4 py-1 text-xl text-white`}>
          <Search className="inline mr-2" />
          Result and Certificate OBWC
        </legend>

        <div className="grid grid-cols-2 gap-6 mt-6">
          <div className="space-y-4">
            <DropdownComponent
              label="Training Partner"
              options={trainingPartners}
              value={formData.TrainingPartnerID}
              onChange={handleTrainingPartnerChange}
            />
            <DropdownComponent
              label="District"
              options={districts}
              value={formData.DistrictID}
              onChange={handleDistrictChange}
            />
            <DropdownComponent
              label="Batch Status"
              options={batchStatuses}
              value={formData.BatchStatus}
              onChange={handleBatchStatusChange}
            />
          </div>

          <div className="space-y-4">
            <DropdownComponent
              label="Course"
              options={courses}
              value={formData.CourseID}
              onChange={handleCourseChange}
            />
            <DropdownComponent
              label="Batch Code"
              options={batchCodes}
              value={formData.BatchCode}
              onChange={(v) => handleChange("BatchCode", v)}
            />
            <DropdownComponent
              label="Batch Type"
              options={batchTypes}
              value={formData.BatchType}
              onChange={(v) => handleChange("BatchType", v)}
            />
          </div>
        </div>

        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={handleSearch}
            className={`px-6 py-2 text-white bg-green-600 rounded`}
          >
            {isLoading ? "Searching..." : "Search Institute"}
          </button>
          <button
            onClick={handleReset}
            className="px-6 py-2 text-white bg-red-500 rounded"
          >
            Reset
          </button>
        </div>
      </fieldset>

      {hasSearched && (
        <fieldset className="rounded border p-4 bg-white shadow-sm">
          <legend className={`rounded ${color} px-4 py-1 text-white`}>
            Result Status
          </legend>

          <FilteredTableComponent
            data={tableData}
            columns={columns}
            renderCell={renderCell}
            loading={isLoading}
            searchable
            exportable
          />
        </fieldset>
      )}
    </div>
  );
};

export default ResultAndCertificateInstituteLong;
