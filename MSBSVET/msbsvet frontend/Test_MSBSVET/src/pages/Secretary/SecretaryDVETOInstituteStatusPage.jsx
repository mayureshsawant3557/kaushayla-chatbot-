import React, {
    useState,
    useEffect,
    useContext,
    useRef,
    useMemo,
    useCallback,
} from "react";
import {
    FaBuilding,
    FaHourglassHalf,
    FaTimesCircle,
    FaCheckCircle,
} from "react-icons/fa";
import agent from "../../lib/api/agent";
import Swal from "sweetalert2";
import { Search, RotateCcw, FileSpreadsheet } from "lucide-react";
import FilteredTableComponent from "../../Component/formcomponent/FilteredTableComponent";
import DropdownComponent from "../../Component/formcomponent/DropdownComponent";
import { ThemeContext } from "../../Component/Context/ThemeContext";
import LocationFilter from "../../Component/formcomponent/LocationFilterComponent";
import { useAuth } from "../../Hooks/AuthContext";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { GetSecretaryDVETOInstituteStatus } from "../../Endpoints_All/NewInstituteApprovalProcess/NewInstituteApprovalProcess";
import verified from "../../assets/VerifiedIcon.jpg";
import rejected from "../../assets/NotVerifiedIcon.jpg";
import pending from "../../assets/QuestionMark.png";
import { AddressService } from "../../lib/services/addressService";

const USER_TYPE_SECRETARY = 81;
const USER_TYPE_DVETO = 14;

// UI label -> SP's actual FormStatus code
const FORM_STATUS_OPTIONS = [
    { value: "A", label: "All" },
    { value: "N", label: "Pending" },
    { value: "P", label: "Rejected" },
    { value: "R", label: "Verified" },
];

const STATUS_ICON_MAP = {
    Verified: { src: verified, alt: "Verified" },
    Rejected: { src: rejected, alt: "Rejected" },
    Pending: { src: pending, alt: "Pending" },
    "In Progress": { src: pending, alt: "In Progress" },
    VerifiedButNotLockedProfile: { src: verified, alt: "Verified But Not Locked" },
};

const initialFormData = {
    RegionID: "",
    DistrictID: "",
    TalukaID: "",
    FormStatus: "A",
    InstituteID: "",
};

const emptySummary = {
    District: "",
    TotalInstitutes: 0,
    BoardPendingCount: 0,
    BoardRejectedCount: 0,
    BoardVerifiedCount: 0,
    BoardVerifiedButNotLockedCount: 0,
    DVETOPendingCount: 0,
    DVETORejectedCount: 0,
    DVETOVerifiedCount: 0,
    DVETOVerifiedButNotLockedCount: 0,
};

const SecretaryDVETOInstituteStatusPage = () => {
    const { color } = useContext(ThemeContext);
    const { userInfo } = useAuth();

    const userTypeID = Number(userInfo?.UserTypeID);
    const userID = userInfo?.UserID;
    const isDveto = userTypeID === USER_TYPE_DVETO;

    const [resetKey, setResetKey] = useState(0);
    const [formData, setFormData] = useState(initialFormData);
    const [rows, setRows] = useState([]);
    const [summaryRows, setSummaryRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(100);

    const formDataRef = useRef(formData);
    useEffect(() => {
        formDataRef.current = formData;
    }, [formData]);
    const locationReadyRef = useRef(null);

    // ─── Fetch table data (respects FormStatus filter) ───────────────────────
    const fetchInstituteStatus = useCallback(
        async ({ RegionID, DistrictID, TalukaID, FormStatus, InstituteID }) => {
            setLoading(true);
            setHasSearched(true);
            setCurrentPage(1);

            try {
                const params = {
                    RegionID: RegionID ? Number(RegionID) : -1,
                    DistrictID: DistrictID ? Number(DistrictID) : -1,
                    TalukaID: TalukaID ? Number(TalukaID) : -1,
                    FormStatus: FormStatus || "A",
                    InstituteID: InstituteID ? Number(InstituteID) : -1,
                    ResultTypeID: -1,
                    userID: isDveto ? userID : -1,
                };

                const response = await agent.get(GetSecretaryDVETOInstituteStatus, {
                    params,
                    timeout: 300000,
                });

                if (response.data?.Status === "Success") {
                    const data = response.data.Data || [];
                    setRows(data);
                } else {
                    setRows([]);
                }
            } catch (error) {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: `Error loading institute status: ${error.message}`,
                });
                setRows([]);
            } finally {
                setLoading(false);
            }
        },
        [isDveto, userID],
    );

    // ─── Fetch summary card totals (ALWAYS FormStatus='A', ignores table filter) ──
    const fetchSummaryTotals = useCallback(
        async ({ RegionID, DistrictID, TalukaID, InstituteID }) => {
            try {
                const params = {
                    RegionID: RegionID ? Number(RegionID) : -1,
                    DistrictID: DistrictID ? Number(DistrictID) : -1,
                    TalukaID: TalukaID ? Number(TalukaID) : -1,
                    FormStatus: "A",
                    InstituteID: InstituteID ? Number(InstituteID) : -1,
                    ResultTypeID: -1,
                    userID: isDveto ? userID : -1,
                };

                const response = await agent.get(GetSecretaryDVETOInstituteStatus, {
                    params,
                    timeout: 300000,
                });

                if (response.data?.Status === "Success") {
                    setSummaryRows(response.data.Data || []);
                } else {
                    setSummaryRows([]);
                }
            } catch (error) {
                setSummaryRows([]);
            }
        },
        [isDveto, userID],
    );

    // ─── Handlers ──────────────────────────────────────────────────────────
    const handleDropdownChange = useCallback((name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    }, []);

    const handleSearch = useCallback(() => {
        fetchInstituteStatus(formDataRef.current);
        fetchSummaryTotals(formDataRef.current);
    }, [fetchInstituteStatus, fetchSummaryTotals]);

    const handleReset = useCallback(() => {
        setFormData(initialFormData);
        setSearchTerm("");
        setResetKey((prev) => prev + 1);
        fetchInstituteStatus(initialFormData);
        fetchSummaryTotals(initialFormData);
    }, [fetchInstituteStatus, fetchSummaryTotals]);

    // ─── Client-side text filter (institute name / profile id) ───────────────
    const filteredRows = useMemo(() => {
        if (!searchTerm.trim()) return rows;
        const term = searchTerm.toLowerCase();
        return rows.filter(
            (item) =>
                item.InstituteName?.toLowerCase().includes(term) ||
                item.ProfileID?.toString().toLowerCase().includes(term) ||
                item.District?.toLowerCase().includes(term) ||
                item.Taluka?.toLowerCase().includes(term),
        );
    }, [rows, searchTerm]);

    const paginatedRows = useMemo(() => {
        const start = (currentPage - 1) * rowsPerPage;
        return filteredRows.slice(start, start + rowsPerPage);
    }, [filteredRows, currentPage, rowsPerPage]);

    const totalPages = useMemo(
        () => Math.ceil(filteredRows.length / rowsPerPage),
        [filteredRows, rowsPerPage],
    );

    const handleLocationReady = useCallback(
        async (resolvedFromFilter) => {
            let finalLocation = resolvedFromFilter;

            if (isDveto) {
                try {
                    const resolved = await AddressService.getUserRegionDistrictTaluka(
                        userInfo?.UserLoginID,
                    );

                    const first = resolved?.Data?.[0];
                    const regionID = first?.RegionID?.toString() || "";
                    const districtID = first?.DistrictID?.toString() || "";

                    finalLocation = {
                        RegionID: regionID,
                        DistrictID: districtID,
                        TalukaID: "",
                    };
                } catch (error) {
                    console.error("Failed to resolve DVETO region/district:", error);
                }
            }

            locationReadyRef.current = finalLocation;

            const updated = {
                ...formDataRef.current,
                RegionID: finalLocation.RegionID || "",
                DistrictID: finalLocation.DistrictID || "",
                TalukaID: finalLocation.TalukaID || "",
            };
            setFormData(updated);
            await fetchInstituteStatus(updated);
            await fetchSummaryTotals(updated);
        },
        [fetchInstituteStatus, fetchSummaryTotals, isDveto, userInfo],
    );

    // ─── Derived summary from summaryRows (independent of table's FormStatus) ──
    const summary = useMemo(() => {
        if (!summaryRows.length) return emptySummary;

        const byDistrict = new Map();
        summaryRows.forEach((r) => {
            if (!byDistrict.has(r.District)) {
                byDistrict.set(r.District, {
                    Total: r.TotalInstitutes || 0,
                    BoardPending: r.BoardPendingCount || 0,
                    BoardRejected: r.BoardRejectedCount || 0,
                    BoardVerified: r.BoardVerifiedCount || 0,
                    BoardVerifiedButNotLocked: r.BoardVerifiedButNotLockedCount || 0,
                    DVETOPending: r.DVETOPendingCount || 0,
                    DVETORejected: r.DVETORejectedCount || 0,
                    DVETOVerified: r.DVETOVerifiedCount || 0,
                    DVETOVerifiedButNotLocked: r.DVETOVerifiedButNotLockedCount || 0,
                });
            }
        });

        const totals = Array.from(byDistrict.values()).reduce(
            (acc, d) => ({
                Total: acc.Total + d.Total,
                BoardPending: acc.BoardPending + d.BoardPending,
                BoardRejected: acc.BoardRejected + d.BoardRejected,
                BoardVerified: acc.BoardVerified + d.BoardVerified,
                BoardVerifiedButNotLocked:
                    acc.BoardVerifiedButNotLocked + d.BoardVerifiedButNotLocked,
                DVETOPending: acc.DVETOPending + d.DVETOPending,
                DVETORejected: acc.DVETORejected + d.DVETORejected,
                DVETOVerified: acc.DVETOVerified + d.DVETOVerified,
                DVETOVerifiedButNotLocked:
                    acc.DVETOVerifiedButNotLocked + d.DVETOVerifiedButNotLocked,
            }),
            {
                Total: 0,
                BoardPending: 0,
                BoardRejected: 0,
                BoardVerified: 0,
                BoardVerifiedButNotLocked: 0,
                DVETOPending: 0,
                DVETORejected: 0,
                DVETOVerified: 0,
                DVETOVerifiedButNotLocked: 0,
            },
        );

        const districtLabel =
            byDistrict.size === 1
                ? Array.from(byDistrict.keys())[0]
                : `${byDistrict.size} Districts`;

        return {
            District: districtLabel,
            TotalInstitutes: totals.Total,
            BoardPendingCount: totals.BoardPending,
            BoardRejectedCount: totals.BoardRejected,
            BoardVerifiedCount: totals.BoardVerified,
            BoardVerifiedButNotLockedCount: totals.BoardVerifiedButNotLocked,
            DVETOPendingCount: totals.DVETOPending,
            DVETORejectedCount: totals.DVETORejected,
            DVETOVerifiedCount: totals.DVETOVerified,
            DVETOVerifiedButNotLockedCount: totals.DVETOVerifiedButNotLocked,
        };
    }, [summaryRows]);

    // ─── Export (Excel / PDF) ──────────────────────────────────────────────
    const buildExportRows = (source) =>
        source.map((item, index) => ({
            "Sr. No.": index + 1,
            Region: item.Region || "",
            District: item.District || "",
            "Profile ID": item.ProfileID || "",
            "Institute Name": item.InstituteName || "",
            "Inspection Request Date Range":
                item.InstituteInspectionRequestStartDate ||
                    item.InstituteInspectionRequestEndDate
                    ? `${item.InstituteInspectionRequestStartDate || "-"} To ${item.InstituteInspectionRequestEndDate || "-"}`
                    : "",
            "Inspection Report Submission Date By Institute":
                item.InstituteInspectionReportSubmissionDate || "",
            "DVETO Inspection Scheduled Date": item.DVETOVerificationStartDate || "",
            "Inspection Submitted Date by DVETO": item.DVETOVerificationEndDate || "",
            "Signed Report Submission Date By DVETO":
                item.SignedInspectionReportSubmissionDateBYDVETO || "",
            "Board Verification Submitted Date":
                item.BoardVerificationSubmittedDate || "",
            "DVETO Status": item.DVETOStatus || "",
            "Board Status": item.BoardStatus || "",
        }));

    const downloadExcel = useCallback(
        (complete = false) => {
            const source = complete ? rows : paginatedRows;
            if (!source.length) {
                Swal.fire({
                    title: "No Data",
                    text: "No data available to export.",
                    icon: "warning",
                });
                return;
            }
            const ws = XLSX.utils.json_to_sheet(buildExportRows(source));
            ws["!cols"] = [
                { wch: 8 },
                { wch: 15 },
                { wch: 15 },
                { wch: 15 },
                { wch: 40 },
                { wch: 30 },
                { wch: 32 },
                { wch: 24 },
                { wch: 26 },
                { wch: 28 },
                { wch: 26 },
                { wch: 15 },
                { wch: 15 },
            ];
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Institute Status");
            XLSX.writeFile(
                wb,
                `Institute_Status_${complete ? "Complete" : "Page" + currentPage}_${new Date().toISOString().split("T")[0]}.xlsx`,
            );
            Swal.fire({
                title: "Success!",
                text: "Excel file downloaded.",
                icon: "success",
                timer: 1500,
                showConfirmButton: false,
            });
        },
        [rows, paginatedRows, currentPage],
    );

    const downloadPDF = useCallback(() => {
        if (!paginatedRows.length) {
            Swal.fire({
                title: "No Data",
                text: "No data available to export.",
                icon: "warning",
            });
            return;
        }
        const doc = new jsPDF("landscape", "mm", "a4");
        doc.setFontSize(16);
        doc.text(
            `Institute Inspection Status ${summary.District ? "- " + summary.District : ""}`,
            14,
            15,
        );
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleString("en-IN")}`, 14, 22);
        doc.text(
            `Board -> Pending: ${summary.BoardPendingCount}  Rejected: ${summary.BoardRejectedCount}  Verified: ${summary.BoardVerifiedCount}  Verified(Not Locked): ${summary.BoardVerifiedButNotLockedCount}`,
            14,
            28,
        );
        doc.text(
            `DVETO -> Pending: ${summary.DVETOPendingCount}  Rejected: ${summary.DVETORejectedCount}  Verified: ${summary.DVETOVerifiedCount}  Verified(Not Locked): ${summary.DVETOVerifiedButNotLockedCount}`,
            14,
            34,
        );

        doc.autoTable({
            startY: 40,
            head: [
                [
                    "Sr.",
                    "Region",
                    "District",
                    "Profile ID",
                    "Institute Name",
                    "Inspection Request Date Range",
                    "Inspection Report Submission Date By Institute",
                    "DVETO Inspection Scheduled Date",
                    "Inspection Submitted Date by DVETO",
                    "Signed Report Submission Date By DVETO",
                    "Board Verification Submitted Date",
                    "DVETO Status",
                    "Board Status",
                ],
            ],
            body: paginatedRows.map((item, i) => [
                i + 1,
                item.Region || "",
                item.District || "",
                item.ProfileID || "",
                item.InstituteName || "",
                `${item.InstituteInspectionRequestStartDate || "-"} To ${item.InstituteInspectionRequestEndDate || "-"}`,
                item.InstituteInspectionReportSubmissionDate || "",
                item.DVETOVerificationStartDate || "",
                item.DVETOVerificationEndDate || "",
                item.SignedInspectionReportSubmissionDateBYDVETO || "",
                item.BoardVerificationSubmittedDate || "",
                item.DVETOStatus || "",
                item.BoardStatus || "",
            ]),
            styles: { fontSize: 6.5, cellPadding: 1.5 },
            headStyles: {
                fillColor: [41, 128, 185],
                textColor: 255,
                fontStyle: "bold",
            },
        });

        doc.save(
            `Institute_Status_Page${currentPage}_${new Date().toISOString().split("T")[0]}.pdf`,
        );
        Swal.fire({
            title: "Success!",
            text: "PDF file downloaded.",
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
        });
    }, [paginatedRows, summary, currentPage]);

    // ─── Table columns ─────────────────────────────────────────────────────
    const tableColumns = [
        {
            key: "Region",
            header: "Region",
            headerClassName: `text-center ${color}`,
            className: "text-center",
            width: "110px",
        },
        {
            key: "District",
            header: "District",
            headerClassName: `text-center ${color}`,
            className: "text-center",
            width: "120px",
        },
        {
            key: "ProfileID",
            header: "Profile ID",
            headerClassName: "text-center",
            className: "text-center",
            width: "120px",
        },
        {
            key: "InstituteName",
            header: "Institute Name",
            headerClassName: "text-left",
            className: "text-left",
            width: "240px",
        },
        {
            key: "InspectionRequestDateRange",
            header: "Inspection Request Date Range",
            headerClassName: "text-center",
            className: "text-center",
            width: "200px",
        },
        {
            key: "InstituteInspectionReportSubmissionDate",
            header: "Inspection Report Submission Date By Institute",
            headerClassName: "text-center",
            className: "text-center",
            width: "180px",
        },
        {
            key: "DVETOVerificationStartDate",
            header: "DVETO Inspection Scheduled Date",
            headerClassName: "text-center",
            className: "text-center",
            width: "150px",
        },
        {
            key: "DVETOVerificationEndDate",
            header: "Inspection Submitted Date by DVETO",
            headerClassName: "text-center",
            className: "text-center",
            width: "160px",
        },
        // {
        //     key: "SignedInspectionReportSubmissionDateBYDVETO",
        //     header: "Signed Report Submission Date By DVETO",
        //     headerClassName: "text-center",
        //     className: "text-center",
        //     width: "170px",
        // },
        {
            key: "BoardVerificationSubmittedDate",
            header: "Board Verification Submitted Date",
            headerClassName: "text-center",
            className: "text-center",
            width: "160px",
        },
        {
            key: "DVETOStatus",
            header: "DVETO Status",
            headerClassName: "text-center",
            className: "text-center",
            width: "120px",
        },
        {
            key: "BoardStatus",
            header: "Board Status",
            headerClassName: "text-center",
            className: "text-center",
            width: "120px",
        },
    ];

    // ─── renderCell ────────────────────────────────────────────────────────
    const renderStatusIcon = (status) => {
        const icon = STATUS_ICON_MAP[status];
        return (
            <div className="flex items-center justify-center">
                {icon ? (
                    <img
                        src={icon.src}
                        alt={icon.alt}
                        title={status}
                        className="w-8 h-8 mx-auto object-contain"
                    />
                ) : (
                    <span className="text-gray-400 text-xs">-</span>
                )}
            </div>
        );
    };

    const renderCell = (row, column) => {
        if (column.key === "DVETOStatus") {
            return renderStatusIcon(row.DVETOStatus);
        }
        if (column.key === "BoardStatus") {
            return renderStatusIcon(row.BoardStatus);
        }
        if (column.key === "InspectionRequestDateRange") {
            const start = row.InstituteInspectionRequestStartDate;
            const end = row.InstituteInspectionRequestEndDate;
            if (!start && !end) return <span>-</span>;
            return (
                <span>
                    {start || "-"} To {end || "-"}
                </span>
            );
        }

        return <span>{row[column.key] ?? "-"}</span>;
    };

    // ─── Render ────────────────────────────────────────────────────────────
    return (
        <div className="space-y-6 p-4">
            <fieldset className="rounded border border-gray-300 p-4">
                <legend
                    className={`rounded border border-gray-300 ${color} px-4 py-1 text-xl font-bold text-white`}
                >
                    <div className="flex items-center gap-2">
                        <Search className="w-5 h-5" />
                        Institute Inspection Status{" "}
                        {isDveto && summary.District ? `- ${summary.District}` : ""}
                    </div>
                </legend>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                    <div className="lg:col-span-3">
                        <LocationFilter
                            key={resetKey}
                            value={{
                                RegionID: formData.RegionID,
                                DistrictID: formData.DistrictID,
                                TalukaID: formData.TalukaID,
                            }}
                            onChange={(locationData) => {
                                setFormData((prev) => ({ ...prev, ...locationData }));
                            }}
                            onReady={handleLocationReady}
                            layoutClass="grid grid-cols-3 gap-4"
                        />
                    </div>

                    <DropdownComponent
                        label="Status"
                        name="FormStatus"
                        options={FORM_STATUS_OPTIONS.map((o) => ({
                            value: o.value,
                            label: o.label,
                        }))}
                        value={formData.FormStatus}
                        onChange={(value) => handleDropdownChange("FormStatus", value)}
                    />
                </div>

                <div className="flex justify-center gap-4 mt-6">
                    <button
                        onClick={handleSearch}
                        disabled={loading}
                        className={`flex items-center gap-2 ${color} text-white px-6 py-2 rounded hover:opacity-90 transition-opacity disabled:bg-gray-400 disabled:cursor-not-allowed min-w-[120px] justify-center`}
                    >
                        {loading ? (
                            "Loading..."
                        ) : (
                            <>
                                <Search className="w-5 h-5" />
                                Search
                            </>
                        )}
                    </button>

                    <button
                        onClick={handleReset}
                        disabled={loading}
                        className="flex items-center gap-2 bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed min-w-[120px] justify-center"
                    >
                        <RotateCcw className="w-5 h-5" />
                        Reset
                    </button>
                </div>
            </fieldset>

            {/* Summary Cards — DVETO stage and Board stage, always full totals regardless of table filter */}
            {summaryRows.length > 0 && (
                <div className="space-y-3">
                    <div>
                        <p className="text-sm font-semibold text-gray-500 mb-1">
                            DVETO Stage {summary.District ? `(${summary.District})` : ""}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                            <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg shadow-md p-4 flex items-center justify-between transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
                                <div>
                                    <p className="text-gray-600 text-sm">Total Institutes</p>
                                    <p className="text-3xl font-bold text-blue-800">
                                        {summary.TotalInstitutes}
                                    </p>
                                </div>
                                <div className="bg-blue-100 text-blue-600 rounded-full p-2.5">
                                    <FaBuilding size={22} />
                                </div>
                            </div>
                            <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg shadow-md p-4 flex items-center justify-between transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
                                <div>
                                    <p className="text-gray-600 text-sm">Inspection Pending</p>
                                    <p className="text-3xl font-bold text-yellow-800">
                                        {summary.DVETOPendingCount}
                                    </p>
                                </div>
                                <div className="bg-yellow-100 text-yellow-600 rounded-full p-2.5">
                                    <FaHourglassHalf size={22} />
                                </div>
                            </div>
                            <div className="bg-red-50 border-l-4 border-red-500 rounded-lg shadow-md p-4 flex items-center justify-between transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
                                <div>
                                    <p className="text-gray-600 text-sm">Inspection Rejected</p>
                                    <p className="text-3xl font-bold text-red-800">
                                        {summary.DVETORejectedCount}
                                    </p>
                                </div>
                                <div className="bg-red-100 text-red-600 rounded-full p-2.5">
                                    <FaTimesCircle size={22} />
                                </div>
                            </div>
                            <div className="bg-teal-50 border-l-4 border-teal-500 rounded-lg shadow-md p-4 flex items-center justify-between transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
                                <div>
                                    <p className="text-gray-600 text-sm">Inspection Verified But Not Submitted to Board</p>
                                    <p className="text-3xl font-bold text-teal-800">
                                        {summary.DVETOVerifiedButNotLockedCount}
                                    </p>
                                </div>
                                <div className="bg-teal-100 text-teal-600 rounded-full p-2.5">
                                    <FaCheckCircle size={22} />
                                </div>
                            </div>
                            <div className="bg-green-50 border-l-4 border-green-500 rounded-lg shadow-md p-4 flex items-center justify-between transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
                                <div>
                                    <p className="text-gray-600 text-sm">Inspection Verified And Submitted to Board</p>
                                    <p className="text-3xl font-bold text-green-800">
                                        {summary.DVETOVerifiedCount}
                                    </p>
                                </div>
                                <div className="bg-green-100 text-green-600 rounded-full p-2.5">
                                    <FaCheckCircle size={22} />
                                </div>
                            </div>
                            
                        </div>
                    </div>

                    <div>
                        <p className="text-sm font-semibold text-gray-500 mb-1">
                            Board Stage {summary.District ? `(${summary.District})` : ""}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                            <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg shadow-md p-4 flex items-center justify-between transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
                                <div>
                                    <p className="text-gray-600 text-sm">Total Institutes</p>
                                    <p className="text-3xl font-bold text-blue-800">
                                        {summary.TotalInstitutes}
                                    </p>
                                </div>
                                <div className="bg-blue-100 text-blue-600 rounded-full p-2.5">
                                    <FaBuilding size={22} />
                                </div>
                            </div>
                            <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg shadow-md p-4 flex items-center justify-between transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
                                <div>
                                    <p className="text-gray-600 text-sm">Inspection Pending</p>
                                    <p className="text-3xl font-bold text-yellow-800">
                                        {summary.BoardPendingCount}
                                    </p>
                                </div>
                                <div className="bg-yellow-100 text-yellow-600 rounded-full p-2.5">
                                    <FaHourglassHalf size={22} />
                                </div>
                            </div>
                            <div className="bg-red-50 border-l-4 border-red-500 rounded-lg shadow-md p-4 flex items-center justify-between transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
                                <div>
                                    <p className="text-gray-600 text-sm">Inspection Rejected</p>
                                    <p className="text-3xl font-bold text-red-800">
                                        {summary.BoardRejectedCount}
                                    </p>
                                </div>
                                <div className="bg-red-100 text-red-600 rounded-full p-2.5">
                                    <FaTimesCircle size={22} />
                                </div>
                            </div>

                            <div className="bg-teal-50 border-l-4 border-teal-500 rounded-lg shadow-md p-4 flex items-center justify-between transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
                                <div>
                                    <p className="text-gray-600 text-sm">Inspection Verified But Not Locked</p>
                                    <p className="text-3xl font-bold text-teal-800">
                                        {summary.BoardVerifiedButNotLockedCount}
                                    </p>
                                </div>
                                <div className="bg-teal-100 text-teal-600 rounded-full p-2.5">
                                    <FaCheckCircle size={22} />
                                </div>
                            </div>
                            <div className="bg-green-50 border-l-4 border-green-500 rounded-lg shadow-md p-4 flex items-center justify-between transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
                                <div>
                                    <p className="text-gray-600 text-sm">
                                        Inspection Verified And Locked
                                    </p>
                                    <p className="text-3xl font-bold text-green-800">
                                        {summary.BoardVerifiedCount}
                                    </p>
                                </div>
                                <div className="bg-green-100 text-green-600 rounded-full p-2.5">
                                    <FaCheckCircle size={22} />
                                </div>
                            </div>
                           
                        </div>
                    </div>
                </div>
            )}

            {/* Data Table */}
            {rows.length > 0 && (
                <fieldset className="rounded border border-gray-300 p-4">
                    <legend
                        className={`rounded border border-gray-300 ${color} px-4 py-1 text-xl font-bold text-white`}
                    >
                        Institute List
                    </legend>

                    <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="relative w-full md:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search.."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0">
                            <button
                                onClick={() => downloadExcel(true)}
                                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-4 py-2 rounded-md shadow-sm hover:shadow-md transition-all text-sm font-semibold whitespace-nowrap"
                            >
                                <FileSpreadsheet className="w-4 h-4" />
                                Excel (All)
                            </button>
                        </div>
                    </div>
                    <FilteredTableComponent
                        data={paginatedRows}
                        columns={tableColumns}
                        renderCell={renderCell}
                        filterColumns={["InstituteName", "District", "ProfileID"]}
                        title="Institute Inspection Status"
                        exportFileName="Institute_Status"
                        tableId="secretary-dveto-institute-status-table"
                        searchable={false}
                        sortable={true}
                        exportable={true}
                        showSearch={false}
                        showPDF={false}
                        showExport={false}
                        className="mt-4"
                        downloadCSV={() => downloadExcel(false)}
                        downloadPDF={downloadPDF}
                        maxHeight="500px"
                        stickyHeader={true}
                        readOnly={true}
                    />

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-300">
                        <div className="flex items-center gap-4">
                            <span className="text-gray-600">
                                Showing {paginatedRows.length} of {filteredRows.length} rows
                                (Page {currentPage} of {totalPages})
                            </span>
                            <select
                                value={rowsPerPage}
                                onChange={(e) => {
                                    setRowsPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value={50}>50 rows</option>
                                <option value={100}>100 rows</option>
                                <option value={200}>200 rows</option>
                                <option value={500}>500 rows</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage((p) => p - 1)}
                                disabled={currentPage === 1}
                                className="px-3 py-1 bg-gray-200 rounded disabled:bg-gray-100 disabled:cursor-not-allowed hover:bg-gray-300"
                            >
                                Previous
                            </button>
                            <span className="px-3 py-1 bg-blue-100 rounded text-blue-800">
                                {currentPage}
                            </span>
                            <button
                                onClick={() => setCurrentPage((p) => p + 1)}
                                disabled={currentPage >= totalPages}
                                className="px-3 py-1 bg-gray-200 rounded disabled:bg-gray-100 disabled:cursor-not-allowed hover:bg-gray-300"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </fieldset>
            )}

            {hasSearched && !loading && rows.length === 0 && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-bold text-yellow-800">
                        No Institutes Found
                    </h3>
                    <p className="text-yellow-700 mt-1">
                        No institute data found for the selected criteria.
                    </p>
                </div>
            )}
        </div>
    );
};

export default SecretaryDVETOInstituteStatusPage;