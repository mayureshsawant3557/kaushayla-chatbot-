/* =============================================================================
   Module : STT -> Batch Result Report
   File   : src/Component/SuperAdmin/Reports/STTBatchResultReport/index.jsx
   Purpose: Container for the STT Batch Result report — role-aware filters, KPI
            cards, batch grid (search/sort/export) and lazy candidate drill-down.
            Follows the SuperAdmin/Reports conventions: fieldset/legend ${color}
            shell, useLoading(), agent, FilteredTableComponent, SwalHelper.
   ============================================================================= */
import React, { useContext, useMemo, useState } from "react";
import { GraduationCap, Eye, FileText, Download, Sheet } from "lucide-react";
import { ThemeContext } from "../../../Context/ThemeContext";
import { useLoading } from "../../../../Hooks/useLoading";
import agent from "../../../../lib/api/agent";
import {
    GetSTTBatchResultSummary,
    GetSTTBatchResultList,
    GetSTTBatchSystemCertificate,
    GetSTTBatchPrePrintedCertificate,
    GetSTTBatchResultSheet
} from "../../../../Endpoints_All/STT/sttBatchResultReport";
import FilteredTableComponent from "../../../formcomponent/FilteredTableComponent";
import STTBatchResultFilters from "./STTBatchResultFilters";
import STTBatchResultKpiCards from "./STTBatchResultKpiCards";
import STTBatchCandidateDrawer from "./STTBatchCandidateDrawer";

const STTBatchResultReport = () => {
    const { color } = useContext(ThemeContext) || {};
    const { startLoading, stopLoading } = useLoading();

    const userInfo = useMemo(() => {
        try {
            return JSON.parse(sessionStorage.getItem("userInfoAll")) || {};
        } catch {
            return {};
        }
    }, []);

    const [summary, setSummary] = useState(null);
    const [batchRows, setBatchRows] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [searching, setSearching] = useState(false);
    const [error, setError] = useState("");

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState(null);

    const buildBody = (filters) => ({
        UserTypeID: Number(userInfo?.UserTypeID) || 0,
        UserLoginID: userInfo?.UserLoginID || "",
        AgencyId: filters.agencyId || 0,
        Status: filters.status || "",
        RegionID: filters.regionId || 0,
        DistrictID: filters.districtId || 0,
        TalukaID: filters.talukaId || 0,
        InstituteID: filters.instituteId || 0,
        CourseID: 0,
        // PageSize 0 -> return all rows; FilteredTableComponent handles paging/sort/search client-side.
        SearchText: "",
        SortColumn: "BatchID",
        SortDirection: "ASC",
        PageNumber: 1,
        PageSize: 0,
    });

    const handleSearch = async (filters) => {
        setSearching(true);
        startLoading();
        setError("");
        setShowResults(false);
        setSummary(null);
        setBatchRows([]);

        try {
            const body = buildBody(filters);
            const [summaryRes, listRes] = await Promise.all([
                agent.post(GetSTTBatchResultSummary, body),
                agent.post(GetSTTBatchResultList, body),
            ]);

            // Summary: ApiResponse<DataTable> -> Data = [ {...} ]
            const summaryData = summaryRes.data?.Data ?? summaryRes.data;
            const summaryRow = Array.isArray(summaryData) ? summaryData[0] : summaryData?.Table?.[0];
            setSummary(summaryRow || {});

            // List: ApiResponse<DataSet> -> Data = { Table: [rows], Table1: [{TotalRecords}] }
            const listData = listRes.data?.Data ?? listRes.data ?? {};
            const rows = (listData.Table || []).map((r, i) => ({
                serialNumber: i + 1,
                BatchID: r.BatchID,
                InstituteName: r.InstituteName || "N/A",
                InstituteCode: r.InstituteCode || "",
                CourseName: r.CourseName || "N/A",
                CourseCode: r.CourseCode || "",
                AgencyName: r.AgencyName || "N/A",
                Region: r.Region || "N/A",
                District: r.District || "N/A",
                Taluka: r.Taluka || "N/A",
                Status: r.Status || "N/A",
                TotalCandidates: r.TotalCandidates ?? 0,
                PassCount: r.PassCount ?? 0,
                FailCount: r.FailCount ?? 0,
                AbsentCount: r.AbsentCount ?? 0,
                AveragePercentage: r.AveragePercentage != null ? Number(r.AveragePercentage).toFixed(2) : "0.00",
                AssessmentDate: r.AssessmentDate ?? r.assessmentDate ?? "",
                PrintedDate: r.PrintedDate ?? r.printedDate ?? "",
                DispatchDate: r.DispatchDate ?? r.dispatchDate ?? r.dispatchdate ?? "",
            }));
            setBatchRows(rows);
            setShowResults(true);
        } catch (err) {
            // agent interceptor rejects with a flat object: { status, ...responseData }
            setError(
                err?.Message ||
                    err?.title ||
                    err?.message ||
                    err?.response?.data?.Message ||
                    "Failed to generate the report. Please try again."
            );
        } finally {
            setSearching(false);
            stopLoading();
        }
    };

    const openDrawer = (batch) => {
        setSelectedBatch(batch);
        setDrawerOpen(true);
    };

    const triggerBlobDownload = (data, mimeType, fileName) => {
        const url = window.URL.createObjectURL(new Blob([data], { type: mimeType }));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    };

    // System / pre-printed certificates use separate endpoints with the same
    // request shape ({ batchID }); each renders its own RDLC template.
    const downloadSystemCertificate = async (batch, isPrePrinted = false) => {
        try {
            startLoading();

            const response = await agent.post(
                isPrePrinted ? GetSTTBatchPrePrintedCertificate : GetSTTBatchSystemCertificate,
                {
                    batchID: batch.BatchID,
                },
                {
                    responseType: "blob",
                }
            );

            triggerBlobDownload(
                response.data,
                "application/zip",
                `Batch_${batch.BatchID}_${isPrePrinted ? "PrePrinted_" : ""}Certificates.zip`
            );
        } catch (error) {
            console.error("Certificate download failed:", error);
        } finally {
            stopLoading();
        }
    };

    const downloadResultSheet = async (batch) => {
        try {
            startLoading();

            const response = await agent.post(
                GetSTTBatchResultSheet,
                {
                    batchID: batch.BatchID,
                },
                {
                    responseType: "blob",
                }
            );

            triggerBlobDownload(
                response.data,
                "application/pdf",
                `Batch_${batch.BatchID}_ResultSheet.pdf`
            );
        } catch (error) {
            console.error("Result sheet download failed:", error);
        } finally {
            stopLoading();
        }
    };

    // Drawer saves (Printed On / Dispatched On) patch the grid row in place so
    // the Certificate Dispatch Date column stays in sync without a re-search.
    const handleBatchUpdated = (updatedBatch) => {
        setBatchRows((prev) =>
            prev.map((r) => (r.BatchID === updatedBatch.BatchID ? { ...r, ...updatedBatch } : r))
        );
        setSelectedBatch((prev) =>
            prev && prev.BatchID === updatedBatch.BatchID ? { ...prev, ...updatedBatch } : prev
        );
    };



    // ---- batch grid config --------------------------------------------------
    // Certificate print/dispatch columns are visible only to UserTypeID 10 & 11.
    const canSeeCertificateColumns = [10, 11].includes(Number(userInfo?.UserTypeID));

    const columns = [
        { key: "serialNumber", header: "Sr. No.", width: "60px", className: "text-center", headerClassName: "text-center", sortable: false, searchable: false },
        { key: "BatchID", header: "Batch ID", width: "90px", className: "text-center", headerClassName: "text-center", searchable: true },
        { key: "InstituteName", header: "Institute", width: "220px", className: "text-left", headerClassName: "text-left", searchable: true },
        { key: "CourseName", header: "Course", width: "180px", className: "text-left", headerClassName: "text-left", searchable: true },
        { key: "AgencyName", header: "Agency", width: "160px", className: "text-left", headerClassName: "text-left", searchable: true },
        { key: "Region", header: "Region", width: "120px", className: "text-left", headerClassName: "text-left", searchable: true },
        { key: "District", header: "District", width: "120px", className: "text-left", headerClassName: "text-left", searchable: true },
        { key: "Status", header: "Status", width: "110px", className: "text-center", headerClassName: "text-center", searchable: true },
        { key: "TotalCandidates", header: "Total", width: "70px", className: "text-center", headerClassName: "text-center" },
        { key: "PassCount", header: "Pass", width: "65px", className: "text-center", headerClassName: "text-center" },
        { key: "FailCount", header: "Fail", width: "65px", className: "text-center", headerClassName: "text-center" },
        { key: "AbsentCount", header: "Absent", width: "70px", className: "text-center", headerClassName: "text-center" },
        { key: "AveragePercentage", header: "Avg %", width: "75px", className: "text-center", headerClassName: "text-center" },
        { key: "action", header: "Candidates", width: "130px", className: "text-center", headerClassName: "text-center", sortable: false, searchable: false, excludeFromExport: true },
       // { key: "SystemCertificate", header: "System Certificate", width: "70px", className: "text-center", headerClassName: "text-center", sortable: false, searchable: false, excludeFromExport: true },
        ...(canSeeCertificateColumns
            ? [
                  { key: "PrePrintedCertificate", header: "Pre Printed Certificate", width: "130px", className: "text-center", headerClassName: "text-center", sortable: false, searchable: false, excludeFromExport: true },
                  { key: "ResultSheet", header: "Result Sheet", width: "120px", className: "text-center", headerClassName: "text-center", sortable: false, searchable: false, excludeFromExport: true },
                  { key: "DispatchDate", header: "Certificate Dispatch Date", width: "130px", className: "text-center", headerClassName: "text-center", sortable: false, searchable: false },
              ]
            : []),
    ];

    const filterableColumns = ["Region", "District", "Status", "CourseName"];

    const formatDate = (d) => {
        if (!d) return "-";
        const date = new Date(d);
        return isNaN(date.getTime()) ? "-" : date.toLocaleDateString("en-GB");
    };

    const isSubmitted = (item) => String(item?.Status).trim().toLowerCase() === "submitted";

    const renderCell = (item, column, rowIndex) => {
        if (column.key === "serialNumber") return item.serialNumber || rowIndex + 1;
        if (column.key === "BatchID")
            return (
                <button
                    onClick={() => openDrawer(item)}
                    className="text-blue-600 font-semibold hover:underline"
                    title="View candidate details"
                >
                    {item.BatchID}
                </button>
            );
        if (column.key === "action")
            return (
                <button
                    onClick={() => openDrawer(item)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700"
                >
                    <Eye className="h-3.5 w-3.5" />
                    View
                </button>
            );

        if (column.key === "SystemCertificate")
            return (
                <button
                    onClick={() => downloadSystemCertificate(item)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700"
                >
                    <FileText className="h-3.5 w-3.5" />
                    Download
                </button>
            );
        // Certificate/print actions are enabled only once the batch result is Submitted.
        if (column.key === "PrePrintedCertificate")
            return (
                <button
                    onClick={() => downloadSystemCertificate(item, true)}
                    disabled={!isSubmitted(item)}
                    title={isSubmitted(item) ? "Download pre-printed certificates" : "Available after result is Submitted"}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white text-xs font-medium rounded hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                    <Download className="h-3.5 w-3.5" />
                    Download
                </button>
            );
        if (column.key === "ResultSheet")
            return (
                <button
                    onClick={() => downloadResultSheet(item)}
                    disabled={!isSubmitted(item)}
                    title={isSubmitted(item) ? "Download result sheet" : "Available after result is Submitted"}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 text-white text-xs font-medium rounded hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                    <Sheet className="h-3.5 w-3.5" />
                    Download
                </button>
            );
        if (column.key === "DispatchDate") return formatDate(item.DispatchDate);
        if (column.key === "PassCount") return <span className="font-semibold text-green-600">{item.PassCount}</span>;
        if (column.key === "FailCount") return <span className="font-semibold text-red-600">{item.FailCount}</span>;
        if (column.key === "AbsentCount") return <span className="font-semibold text-amber-600">{item.AbsentCount}</span>;
        return item[column.key];
    };

    const prepareExportData = (data) =>
        data.map((r) => ({
            "Sr. No.": r.serialNumber,
            "Batch ID": r.BatchID,
            "Institute": r.InstituteName,
            "Institute Code": r.InstituteCode,
            "Course": r.CourseName,
            "Agency": r.AgencyName,
            "Region": r.Region,
            "District": r.District,
            "Taluka": r.Taluka,
            "Status": r.Status,
            "Total Candidates": r.TotalCandidates,
            "Pass": r.PassCount,
            "Fail": r.FailCount,
            "Absent": r.AbsentCount,
            "Average %": r.AveragePercentage,
            ...(canSeeCertificateColumns && {
                "Certificate Dispatch Date": r.DispatchDate ? new Date(r.DispatchDate).toLocaleDateString("en-GB") : "-",
            }),
        }));

    return (
        <div className="p-4 lg:p-6 bg-gray-50 min-h-screen">
            <fieldset className="mb-4 rounded-md border border-gray-300 p-4 lg:p-5 bg-white">
                <legend
                    className={`flex items-center gap-2 text-base font-semibold text-white border-2 border-gray-300 px-3 py-1.5 rounded-md ml-4 ${color || "bg-[#002060]"}`}
                >
                    <GraduationCap className="h-4 w-4" />
                    STT Batch Result Report
                </legend>

                <div className="space-y-5">
                    <STTBatchResultFilters onSearch={handleSearch} searching={searching} />

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {showResults && (
                        <>
                            <STTBatchResultKpiCards summary={summary} loading={searching} />

                            <fieldset className="rounded border border-gray-300 p-4 bg-white overflow-visible relative">
                                <legend className="rounded border border-gray-300 bg-gray-500 px-4 py-1 text-base lg:text-lg font-bold text-white ml-4">
                                    Batch Results ({batchRows.length} batch{batchRows.length !== 1 ? "es" : ""})
                                </legend>
                                <div className="mt-2 w-full relative" style={{ zIndex: 1 }}>
                                    <FilteredTableComponent
                                        data={batchRows}
                                        columns={columns}
                                        filterColumns={filterableColumns}
                                        renderCell={renderCell}
                                        sortable
                                        searchable
                                        exportable
                                        showExcel
                                        showPDF
                                        showExcelTemplate={false}
                                        exportFileName={`STT_Batch_Result_Report_${new Date().toISOString().split("T")[0]}`}
                                        exportData={prepareExportData(batchRows)}
                                        tableId="stt-batch-result-report-table"
                                        maxHeight="560px"
                                        stickyHeader
                                        emptyStateMessage="No batches match the selected filters"
                                        emptyStateSubMessage="Try widening your filter selection"
                                    />
                                </div>
                            </fieldset>
                        </>
                    )}

                    {!showResults && !searching && !error && (
                        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <p className="text-gray-500 text-lg">Select filters and click Search to generate the report</p>
                            <p className="text-gray-400 text-sm mt-2">KPIs and batch results will appear here</p>
                        </div>
                    )}
                </div>
            </fieldset>

            <STTBatchCandidateDrawer
                batch={selectedBatch}
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                onBatchUpdated={handleBatchUpdated}
            />
        </div>
    );
};

export default STTBatchResultReport;
