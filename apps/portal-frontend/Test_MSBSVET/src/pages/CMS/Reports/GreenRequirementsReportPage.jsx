

import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useMemo,
  useCallback,
} from "react";
import agent from "../../../lib/api/agent";
import Swal from "sweetalert2";
import { Search, RotateCcw, FileSpreadsheet, FileText, FileDown } from "lucide-react";
import FilteredTableComponent from "../../../Component/formcomponent/FilteredTableComponent";
import DropdownComponent from "../../../Component/formcomponent/DropdownComponent";
import { ThemeContext } from "../../../Component/Context/ThemeContext";
import { GetMasterTableList } from "../../../Endpoints_All/Base/masterData";
import LocationFilter from "../../../Component/formcomponent/LocationFilterComponent";
import { useAuth } from "../../../Hooks/AuthContext";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";

import autoTable from "jspdf-autotable";
import { btnGetGreenFieldReportData } from "../../../Endpoints_All/Examination/Exam";

const FIXED_STATE_ID = "27";

const initialFormData = {
  FinancialYearID: "",
  FinancialYear: "",
  StateID: FIXED_STATE_ID,
  RegionID: "",
  DistrictID: "",
  TalukaID: "",
};


const pick = (obj, keys) => {
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== null && obj[k] !== "") {
      return obj[k];
    }
  }
  return "";
};

const REGISTRATION_NO_KEYS = [
  "CollegeRegistrationNo",
  "collegeRegistrationNo",
  "RegistrationNo",
  "registrationNo",
  "RegistrationNumber",
  "registrationNumber",
  "CollegeRegistrationNumber",
  "collegeRegistrationNumber",
  "CollegeRegNo",
  "collegeRegNo",
  "RegNo",
  "regNo",
];

const GreenRequirementsReportPage = () => {
  const { color } = useContext(ThemeContext);
  const { userInfo } = useAuth();
  const loginID = userInfo?.UserLoginID;

  const [resetKey, setResetKey] = useState(0);
  const [formData, setFormData] = useState(initialFormData);
  const [financialYears, setFinancialYears] = useState([]);
  const [loading, setLoading] = useState({ financialYears: false, data: false });
  const [rows, setRows] = useState([]);
  const [errors, setErrors] = useState({});
  const [hasSearched, setHasSearched] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const userTypeID = Number(userInfo?.UserTypeID);

  const formDataRef = useRef(formData);
  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  const fyReadyRef = useRef(null);
  const locationReadyRef = useRef(null);

 
  const GetUserRegionDistrictTaluka = "/Base/GetUserRegionDistrictTaluka";

  // Which levels auto-select & lock, per UserTypeID:
  //   UserTypeID 13 -> Region locked only (District & Taluka selectable)
  //   UserTypeID 14 -> Region + District locked (Taluka selectable only)
  // Any other UserTypeID -> no lock, all three stay fully open.
  const LOCKED_JURISDICTION_LEVELS_BY_USERTYPE = {
    13: ["RegionID"],
    14: ["RegionID", "DistrictID"],
  };
  const lockedLevels = LOCKED_JURISDICTION_LEVELS_BY_USERTYPE[userTypeID] || [];

  const [userJurisdiction, setUserJurisdiction] = useState(null);

  const fetchUserJurisdiction = useCallback(async () => {
    if (!loginID) return;
    try {
      const response = await agent.get(GetUserRegionDistrictTaluka, {
        params: { userLoginID: loginID },
      });
      if (response.data?.Status === "Success" && response.data.Data?.length > 0) {
        setUserJurisdiction(response.data.Data[0]);
      } else {
        
        setUserJurisdiction(null);
      }
    } catch (error) {
      console.error("Error loading user jurisdiction:", error);
      setUserJurisdiction(null);
    }
    
  }, [loginID]);

  useEffect(() => {
    fetchUserJurisdiction();
  }, [fetchUserJurisdiction]);

  const lockedLocation = useMemo(() => {
    if (!userJurisdiction) return { RegionID: "", DistrictID: "", TalukaID: "" };
    return {
      RegionID: lockedLevels.includes("RegionID") ? userJurisdiction.RegionID ?? "" : "",
      DistrictID: lockedLevels.includes("DistrictID") ? userJurisdiction.DistrictID ?? "" : "",
      TalukaID: lockedLevels.includes("TalukaID") ? userJurisdiction.TalukaID ?? "" : "",
    };
    
  }, [userJurisdiction, userTypeID]);

  const hasLockedRegion = !!lockedLocation.RegionID;
  const hasLockedDistrict = !!lockedLocation.DistrictID;

  
  const getDefaultFormData = useCallback(
    () => ({
      ...initialFormData,
      RegionID: lockedLocation.RegionID || initialFormData.RegionID,
      DistrictID: lockedLocation.DistrictID || initialFormData.DistrictID,
      TalukaID: lockedLocation.TalukaID || initialFormData.TalukaID,
    }),
    [lockedLocation],
  );

  // Apply the locked jurisdiction once it's fetched.
  useEffect(() => {
    if (!userJurisdiction) return;
    setFormData((prev) => ({
      ...prev,
      RegionID: lockedLocation.RegionID || prev.RegionID,
      DistrictID: lockedLocation.DistrictID || prev.DistrictID,
      TalukaID: lockedLocation.TalukaID || prev.TalukaID,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userJurisdiction, lockedLocation]);

  // ─── On mount ───────────────────────────────────────────────
  useEffect(() => {
    fetchFinancialYears();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Financial Year dropdown (same API/logic as original page) ─
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
        const fyData = response.data.Data.filter((item) => item.Text !== "Select");
        setFinancialYears(fyData);

        if (fyData.length > 0) {
          const current = fyData[0];
          setFormData((prev) => ({
            ...prev,
            FinancialYearID: current.Value,
            FinancialYear: current.Text,
          }));
          fyReadyRef.current = current;
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
  };

  
  const handleLocationReady = useCallback(({ RegionID, DistrictID, TalukaID }) => {
    locationReadyRef.current = { RegionID, DistrictID, TalukaID };
  }, []);

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

  
  const fetchReportData = async ({ FinancialYearID, StateID, RegionID, DistrictID, TalukaID }) => {
    if (!FinancialYearID) {
      Swal.fire({ icon: "warning", title: "Required Field", text: "Please select a Financial Year" });
      return;
    }

    setLoading((prev) => ({ ...prev, data: true }));
    setHasSearched(true);

    try {
      const params = {
        FinancialYearID: Number(FinancialYearID) || 0,
        StateID: StateID || FIXED_STATE_ID,
        RegionID: RegionID && Number(RegionID) !== 0 ? Number(RegionID) : -1,
        DistrictID: DistrictID && Number(DistrictID) !== 0 ? Number(DistrictID) : -1,
        TalukaID: TalukaID && Number(TalukaID) !== 0 ? Number(TalukaID) : -1,
        UserTypeID: Number(userInfo?.UserTypeID) || 0,
        UserLoginID: loginID || "",
      };

      const res = await agent.get(btnGetGreenFieldReportData, {
        params,
      });

      if (res.data?.Status === "Success" && res.data.Data?.length > 0) {
        
        console.log(
          "GreenField Report - RAW row keys:",
          Object.keys(res.data.Data[0]),
        );
        console.log("GreenField Report - RAW first row:", res.data.Data[0]);

        const mapped = res.data.Data.map((item) => ({
          CollegeID: pick(item, ["CollegeID", "collegeID"]),
          RegistrationNo: pick(item, REGISTRATION_NO_KEYS),
           Taluka: pick(item, ["Taluka", "taluka"]),
          District: pick(item, ["District", "district"]),
          CollegeName: pick(item, ["CollegeName", "collegeName"]),
          CourseName: pick(item, ["CourseName", "courseName"]),
          ApprovedUnit: Number(pick(item, ["ApprovedUnit", "approvedUnit"]) || 0) || 0,
          ProposedUnit: Number(pick(item, ["ProposedUnit", "proposedUnit"]) || 0) || 0,
          RequiredTrainingSetups: Number(pick(item, ["RequiredTrainingSetups", "requiredTrainingSetups"]) || 0) || 0,
          
         
          
        }));

        console.log("GreenField Report - Mapped Rows:");
        console.table(mapped);

        setRows(mapped);
      } else {
        console.log("GreenField Report - No data returned:", res.data?.Message);
        setRows([]);
      }
    } catch (error) {
      console.error("GreenField Report - API Error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `Error loading report data: ${error.message}`,
      });
      setRows([]);
    } finally {
      setLoading((prev) => ({ ...prev, data: false }));
    }
  };

  const handleSearch = useCallback(() => {
    const fd = formDataRef.current;
    fetchReportData({
      FinancialYearID: fd.FinancialYearID,
      StateID: fd.StateID,
      RegionID: fd.RegionID,
      DistrictID: fd.DistrictID,
      TalukaID: fd.TalukaID,
    });
  }, []);

  const handleReset = useCallback(async () => {
    fyReadyRef.current = null;
    locationReadyRef.current = null;
    // Reset re-locks the jurisdiction (RO/District login) instead of
    // clearing it back to "Select Region".
    setFormData(getDefaultFormData());
    setRows([]);
    setErrors({});
    setHasSearched(false);
    setSearchTerm("");
    setResetKey((prev) => prev + 1);
    await fetchFinancialYears();
  }, [getDefaultFormData]);

  // ─── Client-side search filter over fetched rows ───────────────
  const filteredRows = useMemo(() => {
    if (!rows.length) return [];
    if (!searchTerm.trim()) return rows;
    const term = searchTerm.toLowerCase();
    return rows.filter(
      (item) =>
        item.RegistrationNo?.toString().toLowerCase().includes(term) ||
        item.CollegeName?.toLowerCase().includes(term) ||
        item.CourseName?.toLowerCase().includes(term),
    );
  }, [rows, searchTerm]);

  
  const tableColumns = [
  {
    key: "RegistrationNo",
    header: "Registration No",
    headerClassName: "text-center",
    className: "text-center",
    width: "150px",
  },
  {
    key: "District",
    header: "District",
    headerClassName: "text-left",
    className: "text-left",
    width: "180px",
  },
  {
    key: "Taluka",
    header: "Taluka",
    headerClassName: "text-left",
    className: "text-left",
    width: "180px",
  },
  {
    key: "CollegeName",
    header: "College Name",
    headerClassName: "text-left",
    className: "text-left",
    width: "350px",
  },
  {
    key: "CourseName",
    header: "Course Name",
    headerClassName: "text-left",
    className: "text-left",
    width: "300px",
  },
  {
    key: "ApprovedUnit",
    header: "Approved Unit",
    headerClassName:"text-center font-bold",
    className: "text-center",
    width: "130px",
    render: (item) =>
      (Number(item.ApprovedUnit) || 0).toLocaleString("en-IN"),
  },
  {
    key: "ProposedUnit",
    header: "Proposed Unit",
    headerClassName:  "text-center font-bold",
    className: "text-center",
    width: "130px",
    render: (item) =>
      (Number(item.ProposedUnit) || 0).toLocaleString("en-IN"),
  },
  {
    key: "RequiredTrainingSetups",
    header: "Required TrainingSetups Unit",
    headerClassName: "text-center font-bold",
    className: "text-center",
    width: "130px",
    render: (item) =>
      (Number(item.RequiredTrainingSetups) || 0).toLocaleString("en-IN"),
  },
];

  // ─── EXPORT: Excel — exports filteredRows (ALL matching rows, not a page) ──
//   const downloadExcel = useCallback(() => {
//     if (!filteredRows.length) {
//       Swal.fire({ title: "No Data", text: "No data available to export.", icon: "warning" });
//       return;
//     }
//     try {
//       // const exportData = filteredRows.map((item, index) => ({
//       //   "Sr. No.": index + 1,
//       //   "Registration No": item.RegistrationNo || "",
//       //   "College Name": item.CollegeName || "",
//       //    "Taluka": item.Taluka || "",
//       //   "District": item.District || "",
//       //   "Course Name": item.CourseName || "",
//       //   "Approved Unit": item.ApprovedUnit || 0,
//       //   "Proposed Unit": item.ProposedUnit || 0,
       
//       // }));
//       const exportData = filteredRows.map((item, index) => ({
//   "Sr. No.": index + 1,
//   "Registration No": item.RegistrationNo || "",
//   "District": item.District || "",
//   "Taluka": item.Taluka || "",
//   "College Name": item.CollegeName || "",
//   "Course Name": item.CourseName || "",
//   "Approved Unit": item.ApprovedUnit || 0,
//   "Proposed Unit": item.ProposedUnit || 0,
// }));

//       // const ws = XLSX.utils.json_to_sheet(exportData);
//       // ws["!cols"] = [
//       //   { wch: 8 },
//       //   { wch: 18 },
//       //   { wch: 20 },
//       //   { wch: 20 },
//       //   { wch: 40 },
//       //   { wch: 35 },
//       //   { wch: 15 },
//       //   { wch: 15 },
        
//       // ];
//       ws["!cols"] = [
//   { wch: 8 },   // Sr. No.
//   { wch: 18 },  // Registration No
//   { wch: 20 },  // District
//   { wch: 20 },  // Taluka
//   { wch: 40 },  // College Name
//   { wch: 35 },  // Course Name
//   { wch: 15 },  // Approved Unit
//   { wch: 15 },  // Proposed Unit
// ];
//       const wb = XLSX.utils.book_new();
//       XLSX.utils.book_append_sheet(wb, ws, "Report");
//       XLSX.writeFile(
//         wb,
//         `Course_ApprovedProposed_Unit_${formData.FinancialYear || "Export"}_${new Date().toISOString().split("T")[0]}.xlsx`,
//       );
//     } catch (error) {
//       console.error("Excel export error:", error);
//       Swal.fire({ title: "Export Failed", text: "An error occurred while exporting to Excel.", icon: "error" });
//     }
//   }, [filteredRows, formData.FinancialYear]);
const downloadExcel = useCallback(() => {
  if (!filteredRows || filteredRows.length === 0) {
    Swal.fire({
      title: "No Data",
      text: "No data available to export.",
      icon: "warning",
    });
    return;
  }

  try {
    // Prepare Excel data
    const exportData = filteredRows.map((item, index) => ({
      "Sr. No.": index + 1,
      "Registration No": item?.RegistrationNo ?? "",
      "District": item?.District ?? "",
      "Taluka": item?.Taluka ?? "",
      "College Name": item?.CollegeName ?? "",
      "Course Name": item?.CourseName ?? "",
      "Approved Unit": Number(item?.ApprovedUnit) || 0,
      "Proposed Unit": Number(item?.ProposedUnit) || 0,
      "Required Training Setups": item?.RequiredTrainingSetups ?? "",
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Excel column widths
    ws["!cols"] = [
      { wch: 8 },   // Sr. No.
      { wch: 20 },  // Registration No
      { wch: 20 },  // District
      { wch: 20 },  // Taluka
      { wch: 45 },  // College Name
      { wch: 40 },  // Course Name
      { wch: 18 },  // Approved Unit
      { wch: 18 },  // Proposed Unit
      { wch: 25 },  // Required Training Setups
    ];

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Add worksheet
    XLSX.utils.book_append_sheet(wb, ws, "Report");

    // Generate filename
    const financialYear =
      formData?.FinancialYear || "Export";

    const date =
      new Date().toISOString().split("T")[0];

    const fileName =
      `Course_ApprovedProposed_Unit_${financialYear}_${date}.xlsx`;

    // Download Excel
    XLSX.writeFile(wb, fileName);

  } catch (error) {
    console.error("Excel export error:", error);

    Swal.fire({
      title: "Export Failed",
      text: `Excel export failed: ${
        error?.message || "Unknown error"
      }`,
      icon: "error",
    });
  }
}, [filteredRows, formData.FinancialYear]);

  // ─── EXPORT: PDF — exports filteredRows (ALL matching rows, not a page) ────
  // const downloadPDF = useCallback(() => {
  //   if (!filteredRows.length) {
  //     Swal.fire({ title: "No Data", text: "No data available to export.", icon: "warning" });
  //     return;
  //   }
  //   try {
  //     const doc = new jsPDF("landscape", "mm", "a4");
  //     doc.setFontSize(16);
  //     doc.text(`Course Approved / Proposed Unit Report - ${formData.FinancialYear || ""}`, 14, 15);
  //     doc.setFontSize(10);
  //     doc.text(`Generated on: ${new Date().toLocaleString("en-IN")}`, 14, 22);
  //     doc.text(`Total Records: ${filteredRows.length}`, 14, 28);

  //     autoTable(doc, {
  //       startY: 34,
  //       head: [["Sr.", "Reg. No", "College Name", "Course Name", "Approved Unit", "Proposed Unit", "Taluka", "District"]],
  //       body: filteredRows.map((item, i) => [
  //         i + 1,
  //         item.RegistrationNo || "",
  //         item.CollegeName || "",
  //         item.CourseName || "",
  //         item.ApprovedUnit || 0,
  //         item.ProposedUnit || 0,
  //         item.Taluka || "",
  //         item.District || "",
  //       ]),
  //       styles: { fontSize: 9, cellPadding: 2 },
  //       headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: "bold" },
  //       columnStyles: {
  //         0: { cellWidth: 12 },
  //         1: { cellWidth: 25 },
  //         2: { cellWidth: 80 },
  //         3: { cellWidth: 80 },
  //         4: { cellWidth: 30, halign: "center" },
  //         5: { cellWidth: 30, halign: "center" },
  //         6: { cellWidth: 40 },
  //         7: { cellWidth: 40 },
  //       },
  //       didDrawPage: () => {
  //         doc.setFontSize(8);
  //         doc.text(
  //           `Page ${doc.internal.getNumberOfPages()}`,
  //           doc.internal.pageSize.width / 2,
  //           doc.internal.pageSize.height - 10,
  //           { align: "center" },
  //         );
  //       },
  //     });

  //     doc.save(
  //       `Course_ApprovedProposed_Unit_${formData.FinancialYear || "Export"}_${new Date().toISOString().split("T")[0]}.pdf`,
  //     );
  //   } catch (error) {
  //     console.error("PDF export error:", error);
  //     // Show the real error message too, so the next failure (if any) is
  //     // diagnosable from the alert alone, not just devtools.
  //     Swal.fire({
  //       title: "Export Failed",
  //       text: `An error occurred while exporting to PDF. ${error?.message || ""}`,
  //       icon: "error",
  //     });
  //   }
  // }, [filteredRows, formData.FinancialYear]);
  // ─── EXPORT: PDF — exports filteredRows (ALL matching rows) ────
const downloadPDF = useCallback(() => {
  if (!filteredRows.length) {
    Swal.fire({
      title: "No Data",
      text: "No data available to export.",
      icon: "warning",
    });
    return;
  }

  try {
    const doc = new jsPDF("landscape", "mm", "a4");

    // ─────────────────────────────────────────────
    // REPORT TITLE
    // ─────────────────────────────────────────────
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");

    doc.text(
      `Course Approved / Proposed Unit Report - ${
        formData.FinancialYear || ""
      }`,
      14,
      15
    );

    // Generated Date
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    doc.text(
      `Generated on: ${new Date().toLocaleString("en-IN")}`,
      14,
      22
    );

    // Total Records
    doc.text(
      `Total Records: ${filteredRows.length}`,
      14,
      28
    );

    // ─────────────────────────────────────────────
    // TABLE
    // ─────────────────────────────────────────────
    autoTable(doc, {
      startY: 34,

      // head: [[
      //   "Sr.",
      //   "Reg. No",
      //   "College Name",
      //   "Course Name",
      //   "Approved Unit",
      //   "Proposed Unit",
      //   "Taluka",
      //   "District",
      // ]],

      // body: filteredRows.map((item, index) => [
      //   index + 1,
      //   item.RegistrationNo || "",
      //   item.CollegeName || "",
      //   item.CourseName || "",
      //   item.ApprovedUnit ?? 0,
      //   item.ProposedUnit ?? 0,
      //   item.Taluka || "",
      //   item.District || "",
      // ]),
      head: [[
  "Sr.",
  "Reg. No",
  "District",
  "Taluka",
  "College Name",
  "Course Name",
  "Approved Unit",
  "Proposed Unit",
  "Required Training Setups"
]],

body: filteredRows.map((item, index) => [
  index + 1,
  item.RegistrationNo || "",
  item.District || "",
  item.Taluka || "",
  item.CollegeName || "",
  item.CourseName || "",
  item.ApprovedUnit ?? 0,
  item.ProposedUnit ?? 0,
  item.RequiredTrainingSetups || 0,
]),

      // ─────────────────────────────────────────
      // GENERAL TABLE STYLE
      // ─────────────────────────────────────────
      styles: {
        font: "helvetica",
        fontSize: 8,
        cellPadding: 2,
        overflow: "linebreak",
        valign: "middle",
      },

      // ─────────────────────────────────────────
      // HEADER STYLE
      // ─────────────────────────────────────────
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: "bold",
        fontSize: 8,
        halign: "center",
        valign: "middle",
      },

      // ─────────────────────────────────────────
      // COLUMN WIDTHS
      // Total ≈ 270mm
      // A4 Landscape usable width ≈ 277mm
      // ─────────────────────────────────────────
      // columnStyles: {
      //   // Sr.
      //   0: {
      //     cellWidth: 10,
      //     halign: "center",
      //   },

      //   // Registration No
      //   1: {
      //     cellWidth: 25,
      //   },

      //   // College Name
      //   2: {
      //     cellWidth: 58,
      //   },

      //   // Course Name
      //   3: {
      //     cellWidth: 65,
      //   },

      //   // Approved Unit
      //   4: {
      //     cellWidth: 25,
      //     halign: "center",
      //   },

      //   // Proposed Unit
      //   5: {
      //     cellWidth: 25,
      //     halign: "center",
      //   },

      //   // Taluka
      //   6: {
      //     cellWidth: 31,
      //   },

      //   // District
      //   7: {
      //     cellWidth: 31,
      //   },
      // },
      columnStyles: {
  // Sr.
  0: {
    cellWidth: 10,
    halign: "center",
  },

  // Registration No
  1: {
    cellWidth: 25,
  },

  // District
  2: {
    cellWidth: 30,
  },

  // Taluka
  3: {
    cellWidth: 30,
  },

  // College Name
  4: {
    cellWidth: 55,
  },

  // Course Name
  5: {
    cellWidth: 65,
  },

  // Approved Unit
  6: {
    cellWidth: 25,
    halign: "center",
  },

  // Proposed Unit
  7: {
    cellWidth: 25,
    halign: "center",
  },
},

      // ─────────────────────────────────────────
      // PAGE FOOTER
      // ─────────────────────────────────────────
      didDrawPage: () => {
        const pageNumber = doc.internal.getNumberOfPages();

        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");

        doc.text(
          `Page ${pageNumber}`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 8,
          {
            align: "center",
          }
        );
      },

      // ─────────────────────────────────────────
      // MARGINS
      // ─────────────────────────────────────────
      margin: {
        left: 14,
        right: 14,
        top: 34,
        bottom: 15,
      },
    });

    // ─────────────────────────────────────────────
    // DOWNLOAD PDF
    // ─────────────────────────────────────────────
    doc.save(
      `Course_ApprovedProposed_Unit_${
        formData.FinancialYear || "Export"
      }_${new Date().toISOString().split("T")[0]}.pdf`
    );

  } catch (error) {
    console.error("PDF export error:", error);

    Swal.fire({
      title: "Export Failed",
      text: `An error occurred while exporting to PDF. ${
        error?.message || ""
      }`,
      icon: "error",
    });
  }
}, [filteredRows, formData.FinancialYear]);

  // ─── EXPORT: Word (.doc) — exports filteredRows (ALL matching rows) ────────
  const downloadWord = useCallback(() => {
    if (!filteredRows.length) {
      Swal.fire({ title: "No Data", text: "No data available to export.", icon: "warning" });
      return;
    }
    try {
      const tableRows = filteredRows
        .map(
          (item, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${item.RegistrationNo || ""}</td>
            <td>${item.CollegeName || ""}</td>
            <td>${item.CourseName || ""}</td>
            <td style="text-align:center;">${item.ApprovedUnit || 0}</td>
            <td style="text-align:center;">${item.ProposedUnit || 0}</td>
          </tr>`,
        )
        .join("");

      const html = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head><meta charset="utf-8"><title>Report</title></head>
        <body>
          <h2>Course Approved / Proposed Unit Report - ${formData.FinancialYear || ""}</h2>
          <p>Generated on: ${new Date().toLocaleString("en-IN")}</p>
          <p>Total Records: ${filteredRows.length}</p>
          <table border="1" cellspacing="0" cellpadding="4" style="border-collapse:collapse;width:100%;font-family:Arial;font-size:12px;">
            <thead>
              <tr style="background-color:#2980b9;color:#ffffff;">
                <th>Sr.</th>
                <th>Registration No</th>
                <th>College Name</th>
                <th>Course Name</th>
                <th>Approved Unit</th>
                <th>Proposed Unit</th>
              </tr>
            </thead>
            <tbody>${tableRows}</tbody>
          </table>
        </body>
        </html>`;

      const blob = new Blob(["\ufeff", html], { type: "application/msword" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Course_ApprovedProposed_Unit_${formData.FinancialYear || "Export"}_${new Date().toISOString().split("T")[0]}.doc`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Word export error:", error);
      Swal.fire({ title: "Export Failed", text: "An error occurred while exporting to Word.", icon: "error" });
    }
  }, [filteredRows, formData.FinancialYear]);

  // ─── Render ────────────────────────────────────────────────────
  return (
    <div className="space-y-6 p-4">
      {/* Filter Section */}
      <fieldset className="rounded border border-gray-300 p-4">
        <legend className={`rounded border border-gray-300 ${color} px-4 py-1 text-xl font-bold text-white`}>
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search Report
          </div>
        </legend>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <DropdownComponent
            label="Financial Year"
            name="FinancialYearID"
            options={financialYears.map((fy) => ({ value: fy.Value, label: fy.Text }))}
            value={formData.FinancialYearID?.toString()}
            onChange={(value) => handleDropdownChange("FinancialYearID", value)}
            error={errors.FinancialYearID}
            required={true}
            loading={loading.financialYears}
          />

          <div className="lg:col-span-3">
            {/* Region/District are fixed per UserTypeID from
                GetUserRegionDistrictTaluka:
                  UserTypeID 13 -> Region locked, District & Taluka open
                  UserTypeID 14 -> Region + District locked, Taluka open
                Other UserTypeIDs -> nothing locked (unchanged behavior).
                NOTE: `disabledRegion` / `disabledDistrict` PROP NAMES are
                still a best guess — confirm against
                LocationFilterComponent's actual props for disabling a
                single field, and adjust if a field renders as editable
                despite formData being pre-filled correctly. */}
            <LocationFilter
              key={resetKey}
              value={{
                RegionID: formData.RegionID,
                DistrictID: formData.DistrictID,
                TalukaID: formData.TalukaID,
              }}
              stateID={formData.StateID}
              userTypeID={userTypeID}
              loginID={loginID}
              disabledRegion={hasLockedRegion}
              disabledDistrict={hasLockedDistrict}
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
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
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

      {/* Data Table */}
      {rows.length > 0 && (
        <fieldset className="rounded border border-gray-300 p-4">
          <legend className={`rounded border border-gray-300 ${color} px-4 py-1 text-xl font-bold text-white`}>
            Course Approved / Proposed Unit Report
          </legend>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
            <input
              type="text"
              placeholder="Search by Registration No, College, Course..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="flex gap-2">
              <button
                onClick={downloadExcel}
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-4 py-2 rounded-md shadow-sm hover:shadow-md transition-all font-semibold text-sm"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Excel
              </button>
              {/* <button
                onClick={downloadPDF}
                className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white px-4 py-2 rounded-md shadow-sm hover:shadow-md transition-all font-semibold text-sm"
              >
                <FileDown className="w-4 h-4" />
                PDF
              </button> */}
              {/* <button
                onClick={downloadWord}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-md shadow-sm hover:shadow-md transition-all font-semibold text-sm"
              >
                <FileText className="w-4 h-4" />
                Word
              </button> */}
            </div>
          </div>

          <div className="mb-2 text-sm font-semibold text-gray-600">
            Total Records: {filteredRows.length}
          </div>

          <FilteredTableComponent
            data={filteredRows}
            columns={tableColumns}
            filterColumns={["CollegeName", "RegistrationNo", "CourseName"]}
            title={`Course Approved / Proposed Unit Report - Financial Year ${formData.FinancialYear}`}
            exportFileName={`Course_ApprovedProposed_Unit_${formData.FinancialYear}`}
            tableId="course-approved-proposed-unit-table"
            searchable={false}
            sortable={true}
            exportable={true}
            showSearch={false}
            showPDF={false}
            showExport={false}
            className="mt-2"
            downloadCSV={downloadExcel}
            downloadPDF={downloadPDF}
            maxHeight="500px"
            stickyHeader={true}
            readOnly={true}
            paginated={true}
            pageSize={25}
          />
        </fieldset>
      )}

      {/* No Data Message */}
      {hasSearched && !loading.data && rows.length === 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <svg className="w-8 h-8 text-yellow-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <h3 className="text-lg font-bold text-yellow-800">No Records Found</h3>
              <p className="text-yellow-700 mt-1">No records found for the selected criteria.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GreenRequirementsReportPage;