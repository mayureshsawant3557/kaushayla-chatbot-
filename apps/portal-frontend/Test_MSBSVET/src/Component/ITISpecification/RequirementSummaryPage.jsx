import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useMemo,
  useCallback,
} from "react";
import agent from "../../lib/api/agent";
import Swal from "sweetalert2";
import { Search, RotateCcw, FileSpreadsheet } from "lucide-react";
import FilteredTableComponent from "../formcomponent/FilteredTableComponent";
import DropdownComponent from "../formcomponent/DropdownComponent";
import { ThemeContext } from "../Context/ThemeContext";
import { GetMasterTableList } from "../../Endpoints_All/Base/masterData";
import {
  GetRequirementSummaryDetails,
  GetAvailableFundForRequirements,
} from "../../Endpoints_All/ITISpecification/itiSpecification";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import LocationFilter from "../formcomponent/LocationFilterComponent";
import { useAuth } from "../../Hooks/AuthContext";

const FIXED_STATE_ID = "27";

const emptySummary = {
  TotalRequirements: 0,
  TotalInstitutes: 0,
  DPDC_TotalAllottedToInstitute_Sum: 0,
  PPP_BalanceAsOnDate_Sum: 0,
  StateFund_Total_Sum: 0,
  GrandTotal_Sum: 0,
  DPDCAvailableFund: null,
  PPPAvailableFund: null,
};

const initialFormData = {
  FinancialYearID: "",
  FinancialYear: "",
  StateID: FIXED_STATE_ID,
  RegionID: "",
  DistrictID: "",
  TalukaID: "",
  ReportStatus: "Submitted",
};

const RequirementSummaryPage = () => {
  const { color } = useContext(ThemeContext);
  const { userInfo } = useAuth();
  const loginID = userInfo?.UserLoginID;

  // ─── State with Pagination ───────────────────────────────────────────────
  const [resetKey, setResetKey] = useState(0);
  const [formData, setFormData] = useState(initialFormData);
  const [financialYears, setFinancialYears] = useState([]);
  const [loading, setLoading] = useState({
    financialYears: false,
    data: false,
  });
  const [requirements, setRequirements] = useState([]);
  const [summary, setSummary] = useState(emptySummary);
  const [errors, setErrors] = useState({});
  const [hasSearched, setHasSearched] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(100); // Limit to 100 rows per page
  const [searchTerm, setSearchTerm] = useState("");

  // ─── Refs ─────────────────────────────────────────────────────────────────
  const formDataRef = useRef(formData);
  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  const fyReadyRef = useRef(null);
  const locationReadyRef = useRef(null);

  // ─── On mount ─────────────────────────────────────────────────────────────
  useEffect(() => {
    initializePage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initializePage = async () => {
    await fetchFinancialYears();
  };

  // ─── Fetch Financial Years (optimized) ────────────────────────────────────
  const fetchFinancialYears = async () => {
    setLoading((prev) => ({ ...prev, financialYears: true }));
    try {
      const response = await agent.get(GetMasterTableList, {
        params: {
          TableName: "Master_FinancialYear",
          DataValueField: "FinancialYearID",
          DataTextField: "FinancialYear",
          HasSelect: true,
          ParentField: "IsCurrentFY",
          ParentFieldValue: 1,
        },
      });

      if (response.data?.Status === "Success") {
        const fyData = response.data.Data.filter(
          (item) => item.Text !== "Select",
        );
        setFinancialYears(fyData);

        if (fyData.length > 0) {
          const current = fyData[0];
          setFormData((prev) => ({
            ...prev,
            FinancialYearID: current.Value,
            FinancialYear: current.Text,
          }));
          fyReadyRef.current = current;

          if (locationReadyRef.current) {
            const loc = locationReadyRef.current;
            await fetchRequirementSummary({
              financialYear: current.Text,
              financialYearId: current.Value,
              reportStatus: "Submitted",
              stateId: FIXED_STATE_ID,
              districtId: loc.DistrictID || "",
              talukaId: loc.TalukaID || "",
              regionID: loc.RegionID || "",
            });
          }
          return current;
        }
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `Error loading financial years: ${error.message}`,
      });
    } finally {
      setLoading((prev) => ({ ...prev, financialYears: false }));
    }
    return null;
  };

  // ─── Location Ready Handler (optimized with useCallback) ──────────────────
  const handleLocationReady = useCallback(
    async ({ RegionID, DistrictID, TalukaID }) => {
      locationReadyRef.current = { RegionID, DistrictID, TalukaID };
      const fy = fyReadyRef.current;
      if (!fy) return;

      await fetchRequirementSummary({
        financialYear: fy.Text,
        financialYearId: fy.Value,
        reportStatus: "Submitted",
        stateId: FIXED_STATE_ID,
        districtId: DistrictID || "",
        talukaId: TalukaID || "",
        regionID: RegionID || "",
      });
    },
    [],
  );

  // ─── Core API Call (with pagination support) ──────────────────────────────
  const fetchRequirementSummary = async ({
    financialYear,
    financialYearId,
    reportStatus,
    stateId,
    districtId,
    talukaId,
    regionID,
  }) => {
    if (!financialYear || !financialYearId) {
      Swal.fire({
        icon: "warning",
        title: "Required Field",
        text: "Please select a Financial Year",
      });
      return;
    }

    setLoading((prev) => ({ ...prev, data: true }));
    setHasSearched(true);
    setCurrentPage(1); // Reset to first page

    try {
      const params = {
        financialYear,
        stateId: stateId || 0,
        districtId: districtId || 0,
        talukaId: talukaId || 0,
        Status: reportStatus || "Submitted",
        regionID: regionID || 0,
      };

      const fundParams = {
        FinancialYearID: Number(financialYearId) || 0,
        RegionID: regionID && Number(regionID) !== 0 ? Number(regionID) : -1,
        DistrictID:
          districtId && Number(districtId) !== 0 ? Number(districtId) : -1,
        TalukaID: talukaId && Number(talukaId) !== 0 ? Number(talukaId) : -1,
        CollegeID: -1,
      };

      // Fetch requirement summary and available funds in parallel
      const [response, fundResponse] = await Promise.all([
        agent.get(GetRequirementSummaryDetails, {
          params,
          timeout: 300000, // 30s timeout
        }),
        agent
          .get(GetAvailableFundForRequirements, {
            params: fundParams,
            timeout: 300000,
          })
          .catch((err) => {
            console.error("Error loading available funds:", err);
            return { data: { Status: "Failed", Data: null } };
          }),
      ]);

      if (response.data?.Status === "Success") {
        const data = response.data.Data;

        let dpdcAvailable = null;
        let pppAvailable = null;

        if (fundResponse.data?.Status === "Success") {
          const fundData = fundResponse.data.Data;
          const fundItem = Array.isArray(fundData) ? fundData[0] : fundData;
          if (fundItem) {
            dpdcAvailable = Number(
              fundItem.DPDCAvailableFund ??
                fundItem.dpdcAvailableFund ??
                fundItem.DpdcAvailableFund ??
                0,
            );
            pppAvailable = Number(
              fundItem.PPPAvailableFund ??
                fundItem.pppAvailableFund ??
                fundItem.PppAvailableFund ??
                0,
            );
          }
        }

        if (data.Requirements?.length > 0) {
          // Normalize once, not on every render
          const normalized = data.Requirements.map((item) => {
            const required =
              Number(
                item.RequiredAsPerNorms ??
                  item.requiredAsPerNorms ??
                  item.Required ??
                  0,
              ) || 0;
            const available =
              Number(
                item.Available ?? item.available ?? item.AvailableQty ?? 0,
              ) || 0;
            return {
              ...item,
              requiredAsPerNorms: required,
              available,
              deficiency: Math.max(0, required - available),
            };
          });

          setRequirements(normalized);
          setSummary({
            ...(data.Summary ?? emptySummary),
            DPDCAvailableFund: dpdcAvailable,
            PPPAvailableFund: pppAvailable,
          });
        } else {
          clearResults();
        }
      } else {
        clearResults();
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `Error loading requirement summary: ${error.message}`,
      });
      clearResults();
    } finally {
      setLoading((prev) => ({ ...prev, data: false }));
    }
  };

  const clearResults = useCallback(() => {
    setRequirements([]);
    setSummary(emptySummary);
    setCurrentPage(1);
  }, []);

  // ─── MEMOIZED: Filtered Data (CRITICAL FIX) ───────────────────────────────
  const filteredRequirements = useMemo(() => {
    if (!requirements.length) return [];

    if (!searchTerm.trim()) return requirements;

    const term = searchTerm.toLowerCase();
    return requirements.filter(
      (item) =>
        item.CollegeName?.toLowerCase().includes(term) ||
        item.CollegeID?.toLowerCase().includes(term) ||
        item.ItemName?.toLowerCase().includes(term) ||
        item.ItemCode?.toLowerCase().includes(term) ||
        item.SectorName?.toLowerCase().includes(term) ||
        item.CategoryName?.toLowerCase().includes(term),
    );
  }, [requirements, searchTerm]);

  // ─── MEMOIZED: Paginated Data (CRITICAL FIX) ──────────────────────────────
  const paginatedRequirements = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredRequirements.slice(startIndex, endIndex);
  }, [filteredRequirements, currentPage, rowsPerPage]);

  // ─── MEMOIZED: Total Pages ────────────────────────────────────────────────
  const totalPages = useMemo(() => {
    return Math.ceil(filteredRequirements.length / rowsPerPage);
  }, [filteredRequirements, rowsPerPage]);

  // ─── CALLBACK: Dropdown Change ────────────────────────────────────────────
  const handleDropdownChange = useCallback(
    (name, value) => {
      if (name === "FinancialYearID") {
        const selectedFY = financialYears.find((fy) => fy.Value == value);
        setFormData((prev) => ({
          ...prev,
          FinancialYearID: value,
          FinancialYear: selectedFY ? selectedFY.Text : "",
        }));
      } else {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
      if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    },
    [financialYears, errors],
  );

  // ─── CALLBACK: Search Handler ─────────────────────────────────────────────
  const handleSearch = useCallback(() => {
    const fd = formDataRef.current;
    fetchRequirementSummary({
      financialYear: fd.FinancialYear,
      financialYearId: fd.FinancialYearID,
      reportStatus: fd.ReportStatus,
      stateId: fd.StateID,
      districtId: fd.DistrictID,
      talukaId: fd.TalukaID,
      regionID: fd.RegionID,
    });
  }, []);

  // ─── CALLBACK: Reset Handler ──────────────────────────────────────────────
  const handleReset = useCallback(async () => {
    fyReadyRef.current = null;
    locationReadyRef.current = null;
    setFormData(initialFormData);
    clearResults();
    setErrors({});
    setHasSearched(false);
    setResetKey((prev) => prev + 1);
    setSearchTerm("");
    await fetchFinancialYears();
  }, [clearResults]);

  // ─── CALLBACK: Search Term Change ─────────────────────────────────────────
  const handleSearchTermChange = useCallback((value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, []);

  // ─── CALLBACK: Page Change ────────────────────────────────────────────────
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  // ─── CALLBACK: Rows Per Page Change ───────────────────────────────────────
  const handleRowsPerPageChange = useCallback((value) => {
    setRowsPerPage(value);
    setCurrentPage(1);
  }, []);

  // ─── Document Viewer (unchanged) ──────────────────────────────────────────
  const handleDocumentDownload = (documentUrl, itemName) => {
    if (!documentUrl?.trim()) {
      Swal.fire({
        title: "Document Not Available",
        text: "No specification document available for this item.",
        icon: "warning",
      });
      return;
    }
    try {
      const popupWidth = 800,
        popupHeight = 600;
      const left = (window.screen.width - popupWidth) / 2;
      const top = (window.screen.height - popupHeight) / 2;
      const popup = window.open(
        "",
        `${itemName}_PDF_Viewer`,
        `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no,status=no`,
      );
      if (popup) {
        popup.document.write(
          `<html><head><title>${itemName}</title></head><body style="margin:0;overflow:hidden;"><iframe src="${documentUrl}" frameborder="0" style="border:none;width:100vw;height:100vh;"></iframe></body></html>`,
        );
        popup.document.close();
        popup.focus();
      } else {
        Swal.fire({
          title: "Popup Blocked",
          text: "Please allow popups for this website.",
          icon: "error",
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error Opening Document",
        text: "There was an error opening the document.",
        icon: "error",
      });
    }
  };

  // ─── EXPORT: Only export current page (optimized) ─────────────────────────
  const downloadExcel = useCallback(() => {
    if (!paginatedRequirements.length) {
      Swal.fire({
        title: "No Data",
        text: "No data available to export.",
        icon: "warning",
      });
      return;
    }
    try {
      // Export only current page (not all data)
      const exportData = paginatedRequirements.map((item, index) => ({
        "Sr. No.": index + 1,
        "Registration No": item.CollegeID || "",
        "College Name": item.CollegeName || "",
        District: item.CollegeDistrictID || "",
        Taluka: item.CollegeTalukaID || "",
        "Item Code": item.ItemCode || "",
        "Name of Item": item.ItemName || "",
        Sector: item.SectorName || "",
        Category: item.CategoryName || "",
        "Estimated Price": item.EstimatedPrice
          ? item.EstimatedPrice.toLocaleString("en-IN", {
              maximumFractionDigits: 2,
            })
          : "0",
        "Required as per Norms": item.requiredAsPerNorms || 0,
        Available: item.available || 0,
        Deficiency: item.deficiency || 0,
        "District Fund": item.DistrictFund || 0,
        "PPP Fund": item.PPP || 0,
        "State Fund": item.StateFund || 0,
        Total: item.Total || 0,
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      ws["!cols"] = [
        { wch: 8 },
        { wch: 15 },
        { wch: 40 },
        { wch: 15 },
        { wch: 15 },
        { wch: 12 },
        { wch: 35 },
        { wch: 15 },
        { wch: 15 },
        { wch: 18 },
        { wch: 15 },
        { wch: 12 },
        { wch: 12 },
        { wch: 15 },
        { wch: 12 },
        { wch: 15 },
        { wch: 12 },
      ];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Requirements");
      XLSX.writeFile(
        wb,
        `Requirement_Summary_${formData.FinancialYear || "Export"}_${new Date().toISOString().split("T")[0]}_Page${currentPage}.xlsx`,
      );
      Swal.fire({
        title: "Success!",
        text: `Excel file downloaded (Page ${currentPage} of ${totalPages}).`,
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        title: "Export Failed",
        text: "An error occurred while exporting to Excel.",
        icon: "error",
      });
    }
  }, [paginatedRequirements, formData.FinancialYear, currentPage, totalPages]);
  //ADDED FOR COMPLETE EXCEL
  const downloadCompleteExcel = useCallback(() => {
    if (!requirements.length) {
      Swal.fire({
        title: "No Data",
        text: "No data available to export.",
        icon: "warning",
      });
      return;
    }
    try {
      const exportData = requirements.map((item, index) => ({
        "Sr. No.": index + 1,
        "Registration No": item.CollegeID || "",
        "College Name": item.CollegeName || "",
        District: item.CollegeDistrictID || "",
        Taluka: item.CollegeTalukaID || "",
        "Item Code": item.ItemCode || "",
        "Name of Item": item.ItemName || "",
        Sector: item.SectorName || "",
        Category: item.CategoryName || "",
        "Estimated Price": item.EstimatedPrice
          ? item.EstimatedPrice.toLocaleString("en-IN", {
              maximumFractionDigits: 2,
            })
          : "0",
        "Required as per Norms": item.requiredAsPerNorms || 0,
        Available: item.available || 0,
        Deficiency: item.deficiency || 0,
        "District Fund": item.DistrictFund || 0,
        "PPP Fund": item.PPP || 0,
        "State Fund": item.StateFund || 0,
        Total: item.Total || 0,
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      ws["!cols"] = [
        { wch: 8 },
        { wch: 15 },
        { wch: 40 },
        { wch: 15 },
        { wch: 15 },
        { wch: 12 },
        { wch: 35 },
        { wch: 15 },
        { wch: 15 },
        { wch: 18 },
        { wch: 15 },
        { wch: 12 },
        { wch: 12 },
        { wch: 15 },
        { wch: 12 },
        { wch: 15 },
        { wch: 12 },
      ];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "All Requirements");
      XLSX.writeFile(
        wb,
        `Requirement_Summary_Complete_${formData.FinancialYear || "Export"}_${new Date().toISOString().split("T")[0]}.xlsx`,
      );
      Swal.fire({
        title: "Success!",
        text: `Complete Excel file downloaded containing ${requirements.length} rows.`,
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        title: "Export Failed",
        text: "An error occurred while exporting complete data to Excel.",
        icon: "error",
      });
    }
  }, [requirements, formData.FinancialYear]);

  const downloadPDF = useCallback(() => {
    if (!paginatedRequirements.length) {
      Swal.fire({
        title: "No Data",
        text: "No data available to export.",
        icon: "warning",
      });
      return;
    }
    try {
      const doc = new jsPDF("landscape", "mm", "a4");
      doc.setFontSize(16);
      doc.text(
        `Requirement Summary - ${formData.FinancialYear || ""} (Page ${currentPage})`,
        14,
        15,
      );
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString("en-IN")}`, 14, 22);
      doc.text(`Total Requirements: ${summary.TotalRequirements}`, 14, 28);
      doc.text(`Total Institutes: ${summary.TotalInstitutes}`, 80, 28);

      doc.autoTable({
        startY: 35,
        head: [
          [
            "Sr.",
            "Reg. No",
            "College Name",
            "Item Code",
            "Item Name",
            "Sector",
            "Category",
            "Est. Price",
            "District",
            "PPP",
            "State",
            "Total",
          ],
        ],
        body: paginatedRequirements.map((item, i) => [
          i + 1,
          item.CollegeID || "",
          item.CollegeName || "",
          item.ItemCode || "",
          item.ItemName || "",
          item.SectorName || "",
          item.CategoryName || "",
          item.EstimatedPrice?.toLocaleString("en-IN", {
            maximumFractionDigits: 2,
          }) || "0",
          item.DistrictFund || 0,
          item.PPP || 0,
          item.StateFund || 0,
          item.Total || 0,
        ]),
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: "bold",
        },
        columnStyles: {
          0: { cellWidth: 10 },
          1: { cellWidth: 20 },
          2: { cellWidth: 50 },
          3: { cellWidth: 18 },
          4: { cellWidth: 45 },
          5: { cellWidth: 20 },
          6: { cellWidth: 20 },
          7: { cellWidth: 25, halign: "right" },
          8: { cellWidth: 18, halign: "center" },
          9: { cellWidth: 15, halign: "center" },
          10: { cellWidth: 18, halign: "center" },
          11: { cellWidth: 18, halign: "center" },
        },
        didDrawPage: (data) => {
          doc.setFontSize(8);
          doc.text(
            `Page ${doc.internal.getNumberOfPages()}`,
            doc.internal.pageSize.width / 2,
            doc.internal.pageSize.height - 10,
            { align: "center" },
          );
        },
      });

      doc.save(
        `Requirement_Summary_${formData.FinancialYear || "Export"}_${new Date().toISOString().split("T")[0]}_Page${currentPage}.pdf`,
      );
      Swal.fire({
        title: "Success!",
        text: `PDF file downloaded (Page ${currentPage} of ${totalPages}).`,
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        title: "Export Failed",
        text: "An error occurred while exporting to PDF.",
        icon: "error",
      });
    }
  }, [
    paginatedRequirements,
    formData.FinancialYear,
    summary,
    currentPage,
    totalPages,
  ]);

  // ─── Table Columns (unchanged) ────────────────────────────────────────────
  const tableColumns = [
    {
      key: "CollegeID",
      header: "Registration No",
      headerClassName: "text-center",
      className: "text-center",
      width: "130px",
    },
    {
      key: "CollegeName",
      header: "College Name",
      headerClassName: "text-left",
      className: "text-left",
      width: "400px",
    },
    {
      key: "ItemCode",
      header: "Item Code",
      headerClassName: "text-center",
      className: "text-center",
      width: "110px",
    },
    {
      key: "ItemName",
      header: "Name of Item",
      headerClassName: "text-left",
      className: "text-left",
      width: "350px",
    },
    {
      key: "SectorName",
      header: "Sector",
      headerClassName: "text-center",
      className: "text-center",
      width: "140px",
      render: (item) => {
        const hasDoc = item.SpecificationDocument?.trim();
        return (
          <div className="text-center w-full">
            {hasDoc ? (
              <button
                onClick={() =>
                  handleDocumentDownload(
                    item.SpecificationDocument,
                    item.SectorName,
                  )
                }
                className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-colors"
                title="Click to view specification document"
              >
                {item.SectorName}
              </button>
            ) : (
              <span
                className="text-gray-700"
                title="No specification document available"
              >
                {item.SectorName}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "CategoryName",
      header: "Category",
      headerClassName: "text-center",
      className: "text-center",
      width: "150px",
    },
    {
      key: "EstimatedPrice",
      header: "Estimated Price",
      headerClassName: "text-right",
      className: "text-right",
      width: "130px",
      render: (item) =>
        `₹${item.EstimatedPrice?.toLocaleString("en-IN", { maximumFractionDigits: 2 }) || "0"}`,
    },
    {
      key: "requiredAsPerNorms",
      header: "Required as per Norms",
      className: "text-center",
      width: "120px",
      render: (item) =>
        (Number(item.requiredAsPerNorms) || 0).toLocaleString("en-IN"),
    },
    {
      key: "available",
      header: "Available",
      className: "text-center",
      width: "110px",
      render: (item) => (Number(item.available) || 0).toLocaleString("en-IN"),
    },
    {
      key: "deficiency",
      header: "Deficiency",
      className: "text-center",
      width: "110px",
      render: (item) => (Number(item.deficiency) || 0).toLocaleString("en-IN"),
    },
    {
      key: "DistrictFund",
      header: "District Fund",
      headerClassName: "text-center bg-pink-200 text-pink-900 font-bold",
      className: "text-center",
      width: "110px",
    },
    {
      key: "PPP",
      header: "PPP Fund",
      headerClassName: "text-center bg-yellow-200 text-yellow-900 font-bold",
      className: "text-center",
      width: "90px",
    },
    {
      key: "StateFund",
      header: "State Fund",
      headerClassName: "text-center bg-green-200 text-green-900 font-bold",
      className: "text-center",
      width: "110px",
    },
    {
      key: "Total",
      header: "Total",
      headerClassName: "text-center bg-purple-100 text-purple-900 font-bold",
      className: "text-center font-semibold",
      width: "100px",
    },
  ];

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 p-4">
      {/* Filter Section */}
      <fieldset className="rounded border border-gray-300 p-4">
        <legend
          className={`rounded border border-gray-300 ${color} px-4 py-1 text-xl font-bold text-white`}
        >
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search Requirement
          </div>
        </legend>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <DropdownComponent
            label="Financial Year"
            name="FinancialYearID"
            options={financialYears.map((fy) => ({
              value: fy.Value,
              label: fy.Text,
            }))}
            value={formData.FinancialYearID?.toString()}
            onChange={(value) => handleDropdownChange("FinancialYearID", value)}
            error={errors.FinancialYearID}
            required={true}
            loading={loading.financialYears}
          />

          <DropdownComponent
            label="Report Status"
            name="ReportStatus"
            options={[{ value: "Submitted", label: "Submitted" }]}
            value={formData.ReportStatus}
            onChange={(value) => handleDropdownChange("ReportStatus", value)}
            required={true}
          />

          <div className="lg:col-span-2">
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
        </div>

        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={handleSearch}
            disabled={loading.data || !formData.FinancialYearID}
            className={`flex items-center gap-2 ${color} text-white px-6 py-2 rounded hover:opacity-90 transition-opacity disabled:bg-gray-400 disabled:cursor-not-allowed min-w-[120px] justify-center`}
          >
            {loading.data ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Loading...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Search
              </>
            )}
          </button>

          <button
            onClick={handleReset}
            disabled={loading.data}
            className="flex items-center gap-2 bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed min-w-[120px] justify-center"
          >
            <RotateCcw className="w-5 h-5" />
            Reset
          </button>
        </div>
      </fieldset>

      {/* Summary Cards - FIXED: Proper JSX conditional */}
      {requirements.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {/* Total Institutes */}
          <div className="bg-green-50 border-l-4 border-green-500 rounded-lg shadow-md p-4 hover:shadow-lg transition-all h-full">
            <h3 className="font-bold text-green-800 text-xl mb-4">
              Total Summary
            </h3>

            <div className="mb-4">
              <p className="text-gray-600 text-sm">Total Institutes</p>
              <p className="text-3xl font-bold text-green-800">
                {summary.TotalInstitutes}
              </p>
            </div>

            <div>
              <p className="text-gray-600 text-sm">Total Requirements</p>
              <p className="text-3xl font-bold text-blue-800">
                {summary.TotalRequirements}
              </p>
            </div>
          </div>

          {/* District Fund */}
          <div className="bg-pink-50 border-l-4 border-pink-500 rounded-lg shadow-md p-4 hover:shadow-lg transition-all h-full">
            <h3 className="font-bold text-pink-800 text-xl mb-3">
              District Fund
            </h3>

            <div className="border-t border-pink-200 pt-3 space-y-3">
              <div>
                <p className="text-gray-600 text-sm">Required Fund</p>
                <span className="inline-block mt-1 bg-pink-200 text-pink-800 font-semibold px-3 py-1 rounded-md break-all">
                  ₹
                  {summary.DPDC_TotalAllottedToInstitute_Sum?.toLocaleString(
                    "en-IN",
                  )}
                </span>
              </div>

              <div>
                <p className="text-gray-600 text-sm">Available Fund</p>
                <span className="inline-block mt-1 bg-pink-300 text-pink-900 font-semibold px-3 py-1 rounded-md break-all">
                  ₹{summary.DPDCAvailableFund?.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          {/* PPP Fund */}
          <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg shadow-md p-4 hover:shadow-lg transition-all h-full">
            <h3 className="font-bold text-yellow-800 text-xl mb-3">PPP Fund</h3>

            <div className="border-t border-yellow-200 pt-3 space-y-3">
              <div>
                <p className="text-gray-600 text-sm">Required Fund</p>
                <span className="inline-block mt-1 bg-yellow-200 text-yellow-800 font-semibold px-3 py-1 rounded-md break-all">
                  ₹{summary.PPP_BalanceAsOnDate_Sum?.toLocaleString("en-IN")}
                </span>
              </div>

              <div>
                <p className="text-gray-600 text-sm">Available Fund</p>
                <span className="inline-block mt-1 bg-yellow-300 text-yellow-900 font-semibold px-3 py-1 rounded-md break-all">
                  ₹{summary.PPPAvailableFund?.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          {/* State Fund */}
          <div className="bg-teal-50 border-l-4 border-teal-500 rounded-lg shadow-md p-4 hover:shadow-lg transition-all h-full">
            <h3 className="font-bold text-teal-800 text-xl mb-3">State Fund</h3>

            <div className="border-t border-teal-200 pt-3 space-y-3">
              <div>
                <p className="text-gray-600 text-sm">Required Fund</p>
                <span className="inline-block mt-1 bg-teal-200 text-teal-800 font-semibold px-3 py-1 rounded-md break-all">
                  ₹{summary.StateFund_Total_Sum?.toLocaleString("en-IN") || 0}
                </span>
              </div>

              <div>
                <p className="text-gray-600 text-sm">Available Fund</p>
                <span className="inline-block mt-1 bg-teal-300 text-teal-900 font-semibold px-3 py-1 rounded-md break-all">
                  ₹{summary.StateAvailableFund?.toLocaleString("en-IN") || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Grand Total */}
          <div className="bg-purple-50 border-l-4 border-purple-500 rounded-lg shadow-md p-4 hover:shadow-lg transition-all h-full">
            <h3 className="font-bold text-purple-800 text-xl mb-3">
              Grand Total
            </h3>

            <div className="border-t border-purple-200 pt-3">
              <p className="text-gray-600 text-sm">Required Fund</p>
              <span className="inline-block mt-1 bg-purple-200 text-purple-800 font-semibold px-3 py-1 rounded-md break-all">
                ₹{summary.GrandTotal_Sum?.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Data Table with Pagination - FIXED: Proper JSX conditional */}
      {requirements.length > 0 && (
        <fieldset className="rounded border border-gray-300 p-4">
          <legend
            className={`rounded border border-gray-300 ${color} px-4 py-1 text-xl font-bold text-white`}
          >
            Requirement Summary
          </legend>

          {/* Search Bar */}
          <div className="col-md-4 mb-4">
            <input
              type="text"
              placeholder="Search by College Name, Item, Sector..."
              value={searchTerm}
              onChange={(e) => handleSearchTermChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {requirements.length > 0 && (
              <div className="flex justify-between items-center bg-white p-3 ">
                <button
                  onClick={downloadCompleteExcel}
                  className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-4 py-2 rounded-md shadow-sm hover:shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all duration-150 font-semibold text-sm cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-100" />
                  Download Complete Excel
                </button>
              </div>
            )}
          </div>

          <FilteredTableComponent
            data={paginatedRequirements}
            columns={tableColumns}
            filterColumns={[
              "SectorName",
              "CategoryName",
              "ItemName",
              "CollegeName",
              "CollegeID",
            ]}
            title={`Requirement Summary - Financial Year ${formData.FinancialYear}`}
            exportFileName={`Requirement_Summary_${formData.FinancialYear}`}
            tableId="requirement-summary-table"
            searchable={false}
            sortable={true}
            exportable={true}
            showSearch={false}
            showPDF={false}
            showExport={false}
            className="mt-4"
            downloadCSV={downloadExcel}
            downloadPDF={downloadPDF}
            maxHeight="500px"
            stickyHeader={true}
            readOnly={true}
          />

          {/* Pagination Controls */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-300">
            <div className="flex items-center gap-4">
              <span className="text-gray-600">
                Showing {paginatedRequirements.length} of{" "}
                {filteredRequirements.length} rows (Page {currentPage} of{" "}
                {totalPages})
              </span>
              <select
                value={rowsPerPage}
                onChange={(e) =>
                  handleRowsPerPageChange(Number(e.target.value))
                }
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
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-gray-200 rounded disabled:bg-gray-100 disabled:cursor-not-allowed hover:bg-gray-300"
              >
                Previous
              </button>
              <span className="px-3 py-1 bg-blue-100 rounded text-blue-800">
                {currentPage}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="px-3 py-1 bg-gray-200 rounded disabled:bg-gray-100 disabled:cursor-not-allowed hover:bg-gray-300"
              >
                Next
              </button>
            </div>
          </div>
        </fieldset>
      )}

      {/* No Data Message - FIXED: Proper JSX conditional */}
      {hasSearched && !loading.data && requirements.length === 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <svg
              className="w-8 h-8 text-yellow-600 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <h3 className="text-lg font-bold text-yellow-800">
                No Requirements Found
              </h3>
              <p className="text-yellow-700 mt-1">
                No requirements found for the selected criteria.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequirementSummaryPage;
