import React, { useState, useEffect, useContext } from "react";
import { useSearchParams } from "react-router-dom";
import { Printer, FileDown } from "lucide-react";
import * as XLSX from "xlsx";
import { useAuth } from "../../Hooks/AuthContext";
import { getDeviceIP } from "../../utils/CommonHelper";
import agent from "../../lib/api/agent";
import { ThemeContext } from "../../Component/Context/ThemeContext";
import { useLoading } from "../../Hooks/useLoading";
import { DateInput } from "../../Component/formcomponent/DateInputComponent";
import FilteredTableComponent from "../../Component/formcomponent/FilteredTableComponent";
import { SwalHelper } from "../../utils/SwalHelper";
import {
  GetResultByBatchID,
  UpdateBatchDate,
  GetResultByBatchIDExport,
  DownloadPreCertificate,
  DownloadDispatchSlip,
  DownloadCertificateSingle,
} from "../../Endpoints_All/Obwc/Obwc";

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

const infoField = (label, value) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
      {label}
    </span>
    <span className="text-sm text-slate-800">{value || "-"}</span>
  </div>
);

const MbocwBatchwiseResult = () => {
  const { color } = useContext(ThemeContext);
  const { startLoading, stopLoading, isLoading } = useLoading();
  const [searchParams] = useSearchParams();
  const { userLoginId } = useAuth();
  const BatchID = searchParams.get("P1") || "";
  const BatchType = searchParams.get("P2") || "";
  const [deviceIP, setDeviceIP] = useState("");

  const isViewOnly = false;

  const [batchInfo, setBatchInfo] = useState(null);
  const [candidates, setCandidates] = useState([]);

  const [assessmentDate, setAssessmentDate] = useState("");
  const [printedOn, setPrintedOn] = useState("");
  const [dispatchedOn, setDispatchedOn] = useState("");

  useEffect(() => {
    getDeviceIP().then(setDeviceIP);
  }, []);
  useEffect(() => {
    if (BatchID) loadBatch();
  }, [BatchID, BatchType]);

  const loadBatch = async () => {
    startLoading();
    try {
      const params = new URLSearchParams({ BatchID, BatchType });
      const res = await agent.get(`${GetResultByBatchID}?${params}`);
      const list = res?.data?.Data || [];
      setCandidates(list);
      setBatchInfo(list[0] || null);
      setAssessmentDate(list[0]?.AssessmentDate || "");
      setPrintedOn(list[0]?.PrintDateTime || "");
      setDispatchedOn(list[0]?.DispatchDateTime || "");
    } finally {
      stopLoading();
    }
  };

  const toISODate = (ddmmyyyy) => {
    if (!ddmmyyyy) return "";
    const [dd, mm, yyyy] = ddmmyyyy.split("/");
    if (!dd || !mm || !yyyy) return "";
    return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
  };

  const saveDate = async (type, value, successMsg) => {
    if (!value) return;
    startLoading();
    try {
      const params = new URLSearchParams({
        BatchID,
        Types: type,
        SelectedDate: toISODate(value),
        CreatedBy: userLoginId || "",
        CreatedByIPAddress: deviceIP || "",
        BatchType,
      });
      await agent.post(`${UpdateBatchDate}?${params}`);
      SwalHelper.success("Success", successMsg);
      loadBatch();
    } catch (err) {
      console.error("Update date failed:", err);
      const apiErrors = err?.response?.data?.errors;
      const message = apiErrors
        ? Object.values(apiErrors).flat().join("<br/>")
        : "Failed to update date.";
      SwalHelper.error("Update Failed", message);
    } finally {
      stopLoading();
    }
  };
  const handleGenerateCertificate = () =>
    saveDate("A", assessmentDate, "Assessment date updated successfully.");
  const handleUpdatePrintedOn = () =>
    saveDate("P", printedOn, "Printed-on date updated successfully.");
  const handleUpdateDispatchOn = () =>
    saveDate("D", dispatchedOn, "Dispatched-on date updated successfully.");

  const handlePrintDispatchSlip = async () => {
    if (candidates.length === 0) {
      SwalHelper.warning(
        "No Data",
        "No candidate data available to print a dispatch slip.",
      );
      return;
    }
    startLoading();
    try {
      const firstCandidate = candidates[0];
      const params = new URLSearchParams({
        BatchID,
        SiteID: firstCandidate.site_id || "",
        CandidateID: firstCandidate.registration_no || "",
        BatchType,
      });
      const res = await agent.get(`${DownloadDispatchSlip}?${params}`, {
        responseType: "blob",
      });
      saveBlob(res.data, res.headers, `${BatchID}_DispatchSlip.pdf`);
    } catch (err) {
      console.error("Dispatch slip download failed:", err);
      let message = "Failed to download dispatch slip.";
      const errData = err?.response?.data;
      if (errData instanceof Blob) {
        try {
          const text = await errData.text();
          const parsed = JSON.parse(text);
          message = parsed?.message || parsed?.title || message;
        } catch {
          // not JSON, keep generic message
        }
      }
      SwalHelper.error("Download Failed", message);
    } finally {
      stopLoading();
    }
  };

  const handleExportToExcel = async () => {
    startLoading();
    try {
      const params = new URLSearchParams({ BatchID, BatchType });
      const res = await agent.get(`${GetResultByBatchIDExport}?${params}`);
      const data = res?.data?.Data || [];

      if (data.length === 0) {
        SwalHelper.warning("No Data", "There is no data available to export.");
        return;
      }

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Result");

      XLSX.writeFile(workbook, `${BatchID}_BatchResult.xlsx`);
    } catch (err) {
      console.error("Export failed:", err);
      SwalHelper.error("Export Failed", "Failed to export.");
    } finally {
      stopLoading();
    }
  };

  const handleCertificate = async (row) => {
    startLoading();
    try {
      const params = new URLSearchParams({
        BatchID: row.batch_id,
        SiteID: row.site_id,
        CandidateID: row.registration_no,
        BatchType: row.batch_type,
      });
      const res = await agent.get(`${DownloadCertificateSingle}?${params}`, {
        responseType: "blob",
      });
      saveBlob(res.data, res.headers, `${row.registration_no}_Certificate.pdf`);
    } catch (err) {
      console.error("Certificate download failed:", err);
      let message = "Failed to download certificate.";
      const errData = err?.response?.data;
      if (errData instanceof Blob) {
        try {
          const text = await errData.text();
          const parsed = JSON.parse(text);
          message = parsed?.message || parsed?.title || message;
        } catch {
          // not JSON, keep generic message
        }
      }
      SwalHelper.error("Download Failed", message);
    } finally {
      stopLoading();
    }
  };

  const handlePreCertificate = async (row) => {
    startLoading();
    try {
      const params = new URLSearchParams({
        BatchID: row.batch_id,
        SiteID: row.site_id,
        CandidateID: row.registration_no,
        BatchType: row.batch_type,
      });
      const res = await agent.get(`${DownloadPreCertificate}?${params}`, {
        responseType: "blob",
      });
      saveBlob(
        res.data,
        res.headers,
        `${row.registration_no}_PreCertificate.pdf`,
      );
    } catch (err) {
      console.error("Pre-certificate download failed:", err);
      SwalHelper.error(
        "Download Failed",
        "Failed to download pre-printed certificate.",
      );
    } finally {
      stopLoading();
    }
  };

  const actionBtnClass =
    "inline-flex items-center justify-center whitespace-nowrap w-full min-w-[140px] px-4 py-2 " +
    "text-xs font-semibold text-white bg-green-600 hover:bg-green-700 " +
    "rounded-md transition-colors";

  // ---- FilteredTableComponent setup ----

  const renderCell = (row, column) => {
    if (column.key === "SystemCertificate") {
      return (
        <button
          className={actionBtnClass}
          onClick={() => handleCertificate(row)}
        >
          Download Certificate
        </button>
      );
    }

    if (column.key === "PrePrintedCertificate") {
      return row.IsCertificateGenerated === "Y" ? (
        <button
          className={actionBtnClass}
          onClick={() => handlePreCertificate(row)}
        >
          Download Certificate
        </button>
      ) : null;
    }

    return <span>{row[column.key] ?? "-"}</span>;
  };

  const columns = [
    { key: "batch_code", header: "Batch Code" },
    { key: "fullname_worker", header: "Candidate Name" },
    { key: "registration_no", header: "Registration No." },
    { key: "attendance", header: "Attendance" },
    { key: "total_marks", header: "Total Marks" },
    { key: "acquired_marks", header: "Acquired Marks" },
    { key: "percentage_of_worker", header: "Percentage" },
    { key: "result_of_worker", header: "Result" },
    { key: "SystemCertificate", header: "System Certificate" },
    ...(!isViewOnly
      ? [{ key: "PrePrintedCertificate", header: "Pre Printed Certificate" }]
      : []),
  ];

  return (
    <div className="p-4">
      <fieldset className="rounded border p-4 mb-6 bg-white shadow-sm">
        <legend className={`rounded ${color} px-4 py-1 text-xl text-white`}>
          Batch Details
        </legend>

        {/* ---- batch / site info ---- */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          {infoField(
            "Name of Institute",
            batchInfo &&
              `${batchInfo.TrainingPartner?.toUpperCase() || ""} (${
                batchInfo.InstituteCode?.toUpperCase() || ""
              })`,
          )}
          {infoField("Site Id", batchInfo?.site_id)}
          {infoField("Site", batchInfo?.SiteName)}
          {infoField("Address", batchInfo?.SiteAddress)}
          {infoField("City/Village", batchInfo?.SiteCityVillage)}
          {infoField("Pin Code", batchInfo?.SitePinCode)}
          {infoField("Taluka", batchInfo?.SiteTaluka)}
          {infoField("District", batchInfo?.SiteDistrict)}
          {infoField("Batch Code", batchInfo?.batch_code)}
          {infoField("Course", batchInfo?.CourseName)}
          {infoField("Enrolled", candidates.length)}
          {infoField("Appeared", candidates.length)}
          {infoField(
            "Passed",
            candidates.filter((c) => c.result_of_worker === "Passed").length,
          )}
          {infoField("Batch Status", batchInfo?.batch_status)}
        </div>

        <hr className="my-6" />

        <div className="text-sm font-semibold text-slate-700 mb-4">
          Certificate Dispatch Details
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex flex-col gap-3">
              <DateInput
                label="Assessment Date"
                required
                value={assessmentDate}
                onChange={setAssessmentDate}
                disabled={isViewOnly}
              />
              {!isViewOnly && (
                <button
                  onClick={handleGenerateCertificate}
                  className="px-5 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors"
                >
                  Generate Certificate
                </button>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <DateInput
                label="Printed on"
                required
                value={printedOn}
                onChange={setPrintedOn}
                disabled={isViewOnly}
              />
              {!isViewOnly && (
                <button
                  onClick={handleUpdatePrintedOn}
                  className="px-5 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors"
                >
                  Update Printed On
                </button>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <DateInput
                label="Dispatched on"
                required
                value={dispatchedOn}
                onChange={setDispatchedOn}
                disabled={isViewOnly}
              />
              {!isViewOnly && (
                <button
                  onClick={handleUpdateDispatchOn}
                  className="px-5 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors"
                >
                  Update Dispatch On
                </button>
              )}
            </div>
          </div>
        </div>

        {!isViewOnly && (
          <div className="flex flex-wrap justify-center items-center gap-3 mt-8 pt-5 border-t border-slate-100">
            <button
              onClick={handlePrintDispatchSlip}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-md transition-colors"
            >
              <Printer size={16} />
              Print Dispatch Slip
            </button>

            <button
              onClick={handleExportToExcel}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors"
            >
              <FileDown size={16} />
              Export To Excel
            </button>
          </div>
        )}
      </fieldset>

      <fieldset className="rounded border p-4 bg-white shadow-sm">
        <legend className={`rounded ${color} px-4 py-1 text-white`}>
          Result Status
        </legend>

        <FilteredTableComponent
          data={candidates}
          columns={columns}
          renderCell={renderCell}
          loading={isLoading}
          searchable
          exportable
        />
      </fieldset>
    </div>
  );
};

export default MbocwBatchwiseResult;
