/* =============================================================================
   Module : STT -> Batch Result Report
   File   : src/Component/SuperAdmin/Reports/STTBatchResultReport/STTBatchCandidateDrawer.jsx
   Purpose: Drill-down slide-over. Lazily loads a batch's candidate result
            details (ExamSTT_BatchResultReport_GetBatchCandidates) only when a
            batch is opened. Uses FilteredTableComponent for search/sort/export.
   ============================================================================= */
import React, { useEffect, useMemo, useState } from "react";
import { X, Users, Printer, Truck, FileText, Download } from "lucide-react";
import agent from "../../../../lib/api/agent";
import {
    GetSTTBatchResultCandidates,
    GetSTTBatchSystemCertificate,
    GetSTTBatchPrePrintedCertificate,
    GetSTTBatchDispatchSlip,
    UpdateSTTBatchPrintedDate,
    UpdateSTTBatchDispatchDate,
} from "../../../../Endpoints_All/STT/sttBatchResultReport";
import { SwalHelper } from "../../../../utils/swalHelper";
import FilteredTableComponent from "../../../formcomponent/FilteredTableComponent";

const resultBadge = (status) => {
    const map = {
        Pass: "bg-green-100 text-green-700",
        Fail: "bg-red-100 text-red-700",
        Absent: "bg-amber-100 text-amber-700",
    };
    return map[status] || "bg-gray-100 text-gray-700";
};

// Normalise API dates ("2026-05-01T00:00:00") to the yyyy-MM-dd format
// expected by <input type="date"> value/min attributes.
const toDateInput = (d) => (d ? String(d).split("T")[0] : "");

const STTBatchCandidateDrawer = ({ batch, open, onClose, onBatchUpdated }) => {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Certificate print & dispatch activity
    const [printedOn, setPrintedOn] = useState("");
    const [dispatchedOn, setDispatchedOn] = useState("");
    const [savingPrinted, setSavingPrinted] = useState(false);
    const [savingDispatch, setSavingDispatch] = useState(false);
    const [printingSlip, setPrintingSlip] = useState(false);

    const assessmentDate = toDateInput(batch?.AssessmentDate);
    const isSubmitted = String(batch?.Status).trim().toLowerCase() === "submitted";

    // Certificate Print & Dispatch block is visible only to UserTypeID 10 & 11
    // (same gate as the certificate columns in the batch grid).
    const canManageCertificates = useMemo(() => {
        try {
            const info = JSON.parse(sessionStorage.getItem("userInfoAll")) || {};
            return [10, 11].includes(Number(info?.UserTypeID));
        } catch {
            return false;
        }
    }, []);

    useEffect(() => {
        if (!open) return;
        setPrintedOn(toDateInput(batch?.PrintedDate));
        setDispatchedOn(toDateInput(batch?.DispatchDate));
    }, [open, batch?.BatchID]);

    useEffect(() => {
        if (!open || !batch?.BatchID) return;

        let cancelled = false;
        const load = async () => {
            setLoading(true);
            setError("");
            setRows([]);
            try {
                // Lazy-loaded on open; pageSize 0 => all rows (client-side table).
                // GET with {batchId} route param (mirrors the existing STT pattern).
                const res = await agent.get(GetSTTBatchResultCandidates(batch.BatchID), {
                    params: {
                        searchText: "",
                        sortColumn: "CandidateName",
                        sortDirection: "ASC",
                        pageNumber: 1,
                        pageSize: 0,
                    },
                });
                if (cancelled) return;
                const data = res.data?.Data ?? res.data ?? {};
                const list = data.Table || [];
                setRows(
                    list.map((c, i) => ({
                        serialNumber: i + 1,
                        ApplicationID: c.ApplicationID ?? c.ApplicationId ?? "",
                        ApplicationIDDisplay: c.ApplicationIDDisplay || "N/A",
                        CandidateName: c.CandidateName || "N/A",
                        Grade: c.Grade || "-",
                        ResultStatus: c.ResultStatus || "-",
                        TotalTheory140: c.TotalTheory140 ?? "-",
                        TotalPractical310: c.TotalPractical310 ?? "-",
                        GrandTotal450: c.GrandTotal450 ?? "-",
                        Percentage: c.Percentage != null ? Number(c.Percentage).toFixed(2) : "-",
                    }))
                );
            } catch (err) {
                // agent interceptor rejects with a flat object: { status, ...responseData }
                if (!cancelled)
                    setError(
                        err?.Message ||
                            err?.title ||
                            err?.message ||
                            err?.response?.data?.Message ||
                            "Failed to load candidates."
                    );
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();
        return () => {
            cancelled = true;
        };
    }, [open, batch?.BatchID]);

    // ---- certificate print & dispatch activities ---------------------------
    const handleUpdatePrintedOn = async () => {
        if (!printedOn) {
            SwalHelper.warning("Printed On required", "Please select the Printed On date.");
            return;
        }
        if (assessmentDate && printedOn < assessmentDate) {
            SwalHelper.warning(
                "Invalid date",
                `Printed On date cannot be earlier than the Assessment Date (${assessmentDate.split("-").reverse().join("/")}).`
            );
            return;
        }
        setSavingPrinted(true);
        try {
            await agent.post(UpdateSTTBatchPrintedDate, {
                batchID: batch.BatchID,
                printedDate: printedOn,
            });
            onBatchUpdated?.({ BatchID: batch.BatchID, PrintedDate: printedOn });
            SwalHelper.success("Updated", "Printed On date saved successfully.");
        } catch (err) {
            SwalHelper.error("Update failed", err?.Message || err?.message || "Could not save the Printed On date.");
        } finally {
            setSavingPrinted(false);
        }
    };

    const handlePrintDispatchSlip = async () => {
        setPrintingSlip(true);
        try {
            const res = await agent.post(
                GetSTTBatchDispatchSlip,
                { batchID: batch.BatchID },
                { responseType: "blob" }
            );
            const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `Batch_${batch.BatchID}_DispatchSlip.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            SwalHelper.error("Print failed", err?.Message || err?.message || "Could not generate the dispatch slip.");
        } finally {
            setPrintingSlip(false);
        }
    };

    const handleUpdateDispatchedOn = async () => {
        if (!dispatchedOn) {
            SwalHelper.warning("Dispatched On required", "Please select the Dispatched On date.");
            return;
        }
        setSavingDispatch(true);
        try {
            await agent.post(UpdateSTTBatchDispatchDate, {
                batchID: batch.BatchID,
                dispatchDate: dispatchedOn,
            });
            onBatchUpdated?.({ BatchID: batch.BatchID, DispatchDate: dispatchedOn });
            SwalHelper.success("Updated", "Dispatched On date saved successfully.");
        } catch (err) {
            SwalHelper.error("Update failed", err?.Message || err?.message || "Could not save the Dispatched On date.");
        } finally {
            setSavingDispatch(false);
        }
    };

    // Per-candidate certificate download — system and pre-printed use separate
    // endpoints with the same request shape ({ batchID, applicationID }); each
    // renders its own RDLC template. With applicationID set, the server filters
    // to that candidate and responds with a single PDF (batch-wise = zip).
    const downloadCandidateCertificate = async (candidate, isPrePrinted = false) => {
        try {
            const res = await agent.post(
                isPrePrinted ? GetSTTBatchPrePrintedCertificate : GetSTTBatchSystemCertificate,
                {
                    batchID: batch.BatchID,
                    applicationID: candidate.ApplicationID || undefined,
                },
                { responseType: "blob" }
            );
            const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute(
                "download",
                `${isPrePrinted ? "PrePrinted_" : "System_"}Certificate_${candidate.ApplicationIDDisplay || candidate.ApplicationID}.pdf`
            );
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            SwalHelper.error("Download failed", err?.Message || err?.message || "Could not download the certificate.");
        }
    };

    const columns = [
        { key: "serialNumber", header: "Sr. No.", width: "60px", className: "text-center", headerClassName: "text-center", sortable: false, searchable: false },
        { key: "ApplicationIDDisplay", header: "Application No.", width: "130px", className: "text-left", headerClassName: "text-left", searchable: true },
        { key: "CandidateName", header: "Candidate Name", width: "200px", className: "text-left", headerClassName: "text-left", searchable: true },
        { key: "TotalTheory140", header: "Theory /140", width: "90px", className: "text-center", headerClassName: "text-center", searchable: false },
        { key: "TotalPractical310", header: "Practical /310", width: "100px", className: "text-center", headerClassName: "text-center", searchable: false },
        { key: "GrandTotal450", header: "Total /450", width: "90px", className: "text-center", headerClassName: "text-center", searchable: false },
        { key: "Percentage", header: "%", width: "70px", className: "text-center", headerClassName: "text-center", searchable: false },
        { key: "Grade", header: "Grade", width: "80px", className: "text-center", headerClassName: "text-center", searchable: true },
        { key: "ResultStatus", header: "Result", width: "90px", className: "text-center", headerClassName: "text-center", searchable: false },
        ...(canManageCertificates
            ? [
                  { key: "SystemCertificate", header: "System Certificate", width: "120px", className: "text-center", headerClassName: "text-center", sortable: false, searchable: false, excludeFromExport: true },
                  { key: "PrePrintedCertificate", header: "Pre Printed Certificate", width: "130px", className: "text-center", headerClassName: "text-center", sortable: false, searchable: false, excludeFromExport: true },
              ]
            : []),
    ];

    const renderCell = (item, column, rowIndex) => {
        if (column.key === "serialNumber") return item.serialNumber || rowIndex + 1;
        if (column.key === "ResultStatus")
            return (
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${resultBadge(item.ResultStatus)}`}>
                    {item.ResultStatus}
                </span>
            );
        // Certificate downloads are shown only for Submitted batches and Pass candidates.
        const canDownloadCertificate =
            isSubmitted && String(item.ResultStatus).trim().toLowerCase() === "pass";
        if (column.key === "SystemCertificate")
            return canDownloadCertificate ? (
                <button
                    onClick={() => downloadCandidateCertificate(item, false)}
                    title="Download system certificate"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700"
                >
                    <FileText className="h-3.5 w-3.5" />
                    Download
                </button>
            ) : (
                <span className="text-gray-400">-</span>
            );
        if (column.key === "PrePrintedCertificate")
            return canDownloadCertificate ? (
                <button
                    onClick={() => downloadCandidateCertificate(item, true)}
                    title="Download pre-printed certificate"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white text-xs font-medium rounded hover:bg-purple-700"
                >
                    <Download className="h-3.5 w-3.5" />
                    Download
                </button>
            ) : (
                <span className="text-gray-400">-</span>
            );
        return item[column.key];
    };

    const prepareExportData = (data) =>
        data.map((c) => ({
            "Sr. No.": c.serialNumber,
            "Application No.": c.ApplicationIDDisplay,
            "Candidate Name": c.CandidateName,
            "Theory /140": c.TotalTheory140,
            "Practical /310": c.TotalPractical310,
            "Total /450": c.GrandTotal450,
            "Percentage": c.Percentage,
            "Grade": c.Grade,
            "Result": c.ResultStatus,
        }));

    if (!open) return null;

    const title = batch ? `Batch #${batch.BatchID} — ${batch.InstituteName || ""}` : "Batch Candidates";

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* backdrop */}
            <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />

            {/* panel */}
            {/* Panel width scales up so all table columns (incl. certificate
                columns for UserTypeID 10/11) fit without horizontal scroll. */}
            <div
                className={`relative h-full w-full bg-gray-50 shadow-2xl flex flex-col animate-[slideIn_0.2s_ease-out] ${
                    canManageCertificates
                        ? "max-w-4xl lg:max-w-6xl xl:max-w-[1300px]"
                        : "max-w-4xl lg:max-w-5xl"
                }`}
            >
                <div className="flex items-start justify-between gap-4 px-5 py-4 bg-white border-b border-gray-200">
                    <div className="flex items-center gap-2 min-w-0">
                        <Users className="h-5 w-5 text-blue-600 flex-shrink-0" />
                        <div className="min-w-0">
                            <h3 className="text-base font-semibold text-gray-800 truncate">{title}</h3>
                            {batch && (
                                <p className="text-xs text-gray-500 truncate">
                                    {batch.CourseName} · {batch.District}, {batch.Region}
                                </p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                        aria-label="Close"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-auto p-4 lg:p-5">
                    {/* Certificate print & dispatch — actions apply once the batch result is Submitted */}
                    {canManageCertificates && (
                    <fieldset className="mb-4 rounded border border-gray-300 bg-white p-4">
                        <legend className="px-2 text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                            <Printer className="h-4 w-4 text-blue-600" />
                            Certificate Print &amp; Dispatch
                        </legend>

                        <p className="mb-3 text-sm font-semibold text-gray-700">
                            Assessment Date:{" "}
                            <span className="font-normal text-gray-800">
                                {assessmentDate ? assessmentDate.split("-").reverse().join("/") : "-"}
                            </span>
                        </p>

                        {!isSubmitted && (
                            <p className="mb-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
                                These actions are enabled only when the batch result status is <b>Submitted</b>.
                            </p>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* 1. Printed on */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">
                                    Printed on: <span className="text-red-600">*</span>
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="date"
                                        value={printedOn}
                                        min={assessmentDate || undefined}
                                        onChange={(e) => setPrintedOn(e.target.value)}
                                        disabled={!isSubmitted}
                                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    />
                                    <button
                                        onClick={handleUpdatePrintedOn}
                                        disabled={!isSubmitted || savingPrinted}
                                        className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed whitespace-nowrap"
                                    >
                                        {savingPrinted ? "Saving..." : "Update"}
                                    </button>
                                </div>
                                {assessmentDate && (
                                    <p className="mt-1 text-[11px] text-gray-500">
                                        Cannot be earlier than the Assessment Date
                                    </p>
                                )}
                            </div>

                            {/* 2. Print dispatch slip */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Print Dispatch Slip</label>
                                <button
                                    onClick={handlePrintDispatchSlip}
                                    disabled={!isSubmitted || printingSlip}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 text-white text-xs font-medium rounded hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                >
                                    <Printer className="h-3.5 w-3.5" />
                                    {printingSlip ? "Generating..." : "Print Dispatch Slip"}
                                </button>
                            </div>

                            {/* 3. Dispatched on */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">
                                    Dispatched on: <span className="text-red-600">*</span>
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="date"
                                        value={dispatchedOn}
                                        onChange={(e) => setDispatchedOn(e.target.value)}
                                        disabled={!isSubmitted}
                                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    />
                                    <button
                                        onClick={handleUpdateDispatchedOn}
                                        disabled={!isSubmitted || savingDispatch}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed whitespace-nowrap"
                                    >
                                        <Truck className="h-3.5 w-3.5" />
                                        {savingDispatch ? "Saving..." : "Update"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </fieldset>
                    )}

                    {loading && (
                        <div className="flex justify-center items-center py-16">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                            <span className="ml-3 text-gray-500">Loading candidates...</span>
                        </div>
                    )}

                    {!loading && error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {!loading && !error && (
                        <FilteredTableComponent
                            data={rows}
                            columns={columns}
                            renderCell={renderCell}
                            sortable
                            searchable
                            exportable
                            showExcel
                            showPDF
                            showExcelTemplate={false}
                            exportFileName={`STT_Batch_${batch?.BatchID}_Candidates_${new Date().toISOString().split("T")[0]}`}
                            exportData={prepareExportData(rows)}
                            tableId={`stt-batch-${batch?.BatchID}-candidates`}
                            maxHeight="calc(100vh - 220px)"
                            stickyHeader
                            emptyStateMessage="No candidates found for this batch"
                            emptyStateSubMessage="This batch may have no allotted candidates yet"
                        />
                    )}
                </div>
            </div>

            <style>{`@keyframes slideIn { from { transform: translateX(24px); opacity: .6 } to { transform: translateX(0); opacity: 1 } }`}</style>
        </div>
    );
};

export default STTBatchCandidateDrawer;
