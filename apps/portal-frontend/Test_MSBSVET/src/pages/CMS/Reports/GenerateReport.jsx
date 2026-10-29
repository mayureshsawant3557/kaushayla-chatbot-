import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaBars } from "react-icons/fa";

import { ThemeContext } from "../../../Component/Context/ThemeContext";
import { useLoading } from "../../../Hooks/useLoading";
import Loader from "../../../Component/formcomponent/Loader";
import FilteredTableComponent from "../../../Component/formcomponent/FilteredTableComponent";
import agent from "../../../lib/api/agent";
import { generateReport } from "../../../Endpoints_All/CMS/academisthan";
import { useAuth } from "../../../Hooks/AuthContext";

// ── Header map ───────────────────────────────────────────────────────────────
const headerMap = {
  CourseID: "Course ID",
  CourseCode: "Course Code",
  CourseName: "Course Name",
  CourseNameDisplay: "Course Name (Display)",
  OldCourseName: "Old Course Name",
  OldCourseCode: "Old Course Code",
  SectorId: "Sector ID",
  Sector: "Sector",
  SubSectorId: "Sub Sector ID",
  SubSector: "Sub Sector",
  CourseTypeId: "Course Type ID",
  CourseType: "Course Type",
  BatchSchedue: "Batch Schedule",
  Duration: "Duration",
  DurationUnit: "Duration Unit",
  MinQualification: "Min Qualification",
  MinQualificationId: "Min Qualification ID",
  MandatoryQualification: "Mandatory Qualification",
  MandatoryQualificationId: "Mandatory Qualification ID",
  MinAge: "Min Age",
  IntakePerUnit: "Intake Per Unit",
  NSQFLevel: "NSQF Level",
  NSQFLEVELNAme: "NSQF Level Name",
  TrainingFee: "Training Fee",
  AdmissionFees: "Admission Fees",
  InspectionFees: "Inspection Fees",
  SecurityDeposit: "Security Deposit",
  RenewalFees: "Renewal Fees",
  ExamAssesmentFee: "Exam Assessment Fee",
  WorkshopSpaceInSqlMtr: "Workshop Space (Sq.Mtr)",
  FloorPreference: "Floor Preference",
  SeparateClassRoom: "Separate Class Room",
  PowerInKW: "Power (KW)",
  PowerType: "Power Type",
  InfrastructureSheetIncluded: "Infrastructure Sheet",
  ComputerLabUtilizationInHoursPerWeek: "Computer Lab Hrs/Week",
  DrawingHallUtilizationInHoursPerWeek: "Drawing Hall Hrs/Week",
  ClassRoomUtilizationInHoursPerWeek: "Class Room Hrs/Week",
  ClassRoomArea: "Class Room Area",
  DrawingRoomArea: "Drawing Room Area",
  ComputerLabArea: "Computer Lab Area",
  AgricultureLandArea: "Agriculture Land Area",
  AgricultureLandUtilizationperweekinHours: "Agriculture Land Hrs/Week",
  OpenGroundArea: "Open Ground Area",
  OpenGroundUtilizationperweekinHours: "Open Ground Hrs/Week",
  SyllabusVersion: "Syllabus Version",
  ModelCurriculum: "Model Curriculum",
  QualificationPack: "Qualification Pack",
  VTI: "VTI",
  SAA: "SAA",
  SAIShare: "SAI Share",
  BoardShare: "Board Share",
  IsApproved: "Is Approved",
  ApprovedBy: "Approved By",
  CourseApprover: "Course Approver",
  ExamTypeID: "Exam Type ID",
  ExamType: "Exam Type",
  MinBathDays: "Min Batch Days",
  BoardCoursesDuration: "Board Duration",
  BoardCoursesDurationUnitID: "Board Duration Unit ID",
  SeparateDrawingHallRequired: "Drawing Hall Required",
  SeparateComputerLabRequired: "Computer Lab Required",
  SeparateAgricultureLandRequired: "Agriculture Land Required",
  SeparateOpenGroundRequired: "Open Ground Required",
  TrainingModeConventional: "Mode: Conventional",
  TrainingModeDualSystem: "Mode: Dual System",
  TrainingModeBlended: "Mode: Blended",
  TrainingModeOnline: "Mode: Online",
  TrainingModeAllMode: "Mode: All",
  CourseHours: "Course Hours",
  TheoryDuration: "Theory Duration",
  PracticalDuration: "Practical Duration",
  OJTMandatoryDuration: "OJT Mandatory",
  OJTOptionalDuration: "OJT Optional",
  TotalDuration: "Total Duration",
  TheoryBoardDuration: "Theory Board Duration",
  TheoryBoardDurationunit: "Theory Board Unit",
  OJTMandatoryBoardDuration: "OJT Mandatory Board",
  OJTMandatoryBoardDurationunit: "OJT Mandatory Board Unit",
  OJTOptionalBoardDuration: "OJT Optional Board",
  OJTOptionalBoardDurationunit: "OJT Optional Board Unit",
  TotalBoardDuration: "Total Board Duration",
  TotalBoardDurationunit: "Total Board Unit",
  PracticalBoardDuration: "Practical Board Duration",
  PracticalBoardDurationunit: "Practical Board Unit",
  ApprovalGroupID: "Approval Group ID",
  DisplayonPortal: "Display on Portal",
  NewUnitApplication: "New Unit Application",
  NewAdmission: "New Admission",
  ISISTITTT: "IS IT IS TTT",
};

const widthMap = {
  CourseID: "90px",
  CourseCode: "120px",
  CourseName: "240px",
  CourseNameDisplay: "200px",
  OldCourseName: "180px",
  OldCourseCode: "140px",
  SectorId: "85px",
  Sector: "140px",
  SubSectorId: "100px",
  SubSector: "150px",
  CourseTypeId: "100px",
  CourseType: "140px",
  BatchSchedue: "130px",
  Duration: "90px",
  DurationUnit: "120px",
  MinQualification: "160px",
  MinQualificationId: "110px",
  MandatoryQualification: "180px",
  MandatoryQualificationId: "130px",
  MinAge: "80px",
  IntakePerUnit: "110px",
  NSQFLevel: "110px",
  NSQFLEVELNAme: "160px",
  TrainingFee: "120px",
  AdmissionFees: "130px",
  InspectionFees: "130px",
  SecurityDeposit: "140px",
  RenewalFees: "120px",
  ExamAssesmentFee: "150px",
  WorkshopSpaceInSqlMtr: "170px",
  FloorPreference: "135px",
  SeparateClassRoom: "150px",
  PowerInKW: "100px",
  PowerType: "120px",
  InfrastructureSheetIncluded: "150px",
  ComputerLabUtilizationInHoursPerWeek: "180px",
  DrawingHallUtilizationInHoursPerWeek: "180px",
  ClassRoomUtilizationInHoursPerWeek: "175px",
  ClassRoomArea: "135px",
  DrawingRoomArea: "140px",
  ComputerLabArea: "140px",
  AgricultureLandArea: "155px",
  AgricultureLandUtilizationperweekinHours: "185px",
  OpenGroundArea: "135px",
  OpenGroundUtilizationperweekinHours: "175px",
  SyllabusVersion: "135px",
  ModelCurriculum: "85px",
  QualificationPack: "90px",
  VTI: "70px",
  SAA: "70px",
  SAIShare: "100px",
  BoardShare: "105px",
  IsApproved: "105px",
  ApprovedBy: "145px",
  CourseApprover: "200px",
  ExamTypeID: "105px",
  ExamType: "135px",
  MinBathDays: "115px",
  BoardCoursesDuration: "150px",
  BoardCoursesDurationUnitID: "155px",
  SeparateDrawingHallRequired: "165px",
  SeparateComputerLabRequired: "170px",
  SeparateAgricultureLandRequired: "185px",
  SeparateOpenGroundRequired: "165px",
  TrainingModeConventional: "155px",
  TrainingModeDualSystem: "155px",
  TrainingModeBlended: "140px",
  TrainingModeOnline: "140px",
  TrainingModeAllMode: "130px",
  CourseHours: "120px",
  TheoryDuration: "140px",
  PracticalDuration: "150px",
  OJTMandatoryDuration: "150px",
  OJTOptionalDuration: "145px",
  TotalDuration: "130px",
  TheoryBoardDuration: "165px",
  TheoryBoardDurationunit: "160px",
  OJTMandatoryBoardDuration: "175px",
  OJTMandatoryBoardDurationunit: "185px",
  OJTOptionalBoardDuration: "170px",
  OJTOptionalBoardDurationunit: "180px",
  TotalBoardDuration: "165px",
  TotalBoardDurationunit: "160px",
  PracticalBoardDuration: "175px",
  PracticalBoardDurationunit: "175px",
  ApprovalGroupID: "145px",
  DisplayonPortal: "145px",
  NewUnitApplication: "165px",
  NewAdmission: "130px",
};

const formatHeader = (key) => {
  if (headerMap[key]) return headerMap[key];
  return key
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/([a-z\d])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();
};

const getWidth = (key) => widthMap[key] || "110px";

const GenerateReport = () => {
  const { color } = useContext(ThemeContext);
  const [searchParams] = useSearchParams();
  const reportId = searchParams.get("ReportID");
  const navigate = useNavigate();
    const { startLoading, stopLoading, isLoading } = useLoading();
    const { userInfo } = useAuth();
    const typeID =
        userInfo?.UserTypeID || "1";

  const [reportHeader, setReportHeader] = useState("");
  const [reportData, setReportData]     = useState([]);
  const [error, setError]               = useState(null);
  const [pageLoading, setPageLoading]   = useState(true);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchReport = async () => {
    try {
      setPageLoading(true);
        const { data } = await agent.get(`${generateReport}/${reportId}/${typeID}`);
      const report = data?.Data;
      setReportHeader(report?.Table?.[0]?.ReportHeader ?? "Report");
        setReportData(report?.Table1 ?? []);


    } catch (err) {
      setError(err?.response?.data?.message || "Failed to fetch report");
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    if (reportId) fetchReport();
  }, [reportId]);

  // ── Columns ────────────────────────────────────────────────────────────────
  const columns = useMemo(() => {
    if (!reportData?.length) return [];
    return Object.keys(reportData[0]).map((key) => ({
      key,
      header: formatHeader(key),
      sortable: true,
      width: getWidth(key),
      className: "text-left",
      headerClassName: "text-left font-bold",
    }));
  }, [reportData]);

  // ── filterableColumns ──────────────────────────────────────────────────────
  const filterableColumns = useMemo(
    () => columns.filter((c) => c.key !== "SrNo").map((c) => c.key),
    [columns]
  );

  // ── renderCell ─────────────────────────────────────────────────────────────
  const renderCell = useCallback((item, column) => {
    if (typeof item[column.key] === "object")
      return JSON.stringify(item[column.key]);

    const value =
      item[column.key] !== undefined && item[column.key] !== null
        ? item[column.key]
        : "—";

    return (
      <span
        title={String(value)}
        style={{
          display: "block",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          maxWidth: getWidth(column.key),
        }}
      >
        {value}
      </span>
    );
  }, []);

  // ── Excel export ───────────────────────────────────────────────────────────
  const exportExcel = async () => {
    try {
      startLoading();
      const response = await agent.get(`${generateReport}/${reportId}`, {
        responseType: "blob",
        params: { export: "excel" },
      });
      const contentDisposition = response.headers?.["content-disposition"];
      let filename = `${reportHeader}.xlsx`;
      if (contentDisposition) {
        const match = contentDisposition.match(
          /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
        );
        if (match?.[1]) filename = match[1].replace(/['"]/g, "");
      }
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to export report");
    } finally {
      stopLoading();
    }
  };

  if (pageLoading) return <Loader />;

  return (
    <div className="p-4 lg:p-6 bg-gray-50 min-h-screen">
      {isLoading && <Loader />}

      <div className="bg-white rounded-xl shadow-md">
        <fieldset className="border border-gray-300 rounded mb-6 px-4 pt-3 pb-1">
          <legend
            className={`flex items-center gap-2 rounded-md border border-gray-300 ${color} px-4 py-2 text-xl font-bold text-white shadow-md`}
          >
            <FaBars size={22} className="stroke-[2.5]" />
            <span>{reportHeader}</span>
          </legend>
          {/* Printed On */}
          <div className="text-xs text-gray-500 mb-3">
            Printed On :{" "}
            {new Date().toLocaleDateString("en-GB")} {new Date().toLocaleTimeString()}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
              {error}
            </div>
          )}

          {/* Large dataset info banner
          {reportData.length > 1000 && (
            <div className="mb-3 px-3 py-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700 flex items-center gap-2">
              <span>⚡</span>
              <span>
                <strong>{reportData.length.toLocaleString()}</strong> records loaded.
                Use column search icon (🔍) to filter by specific values, or the search box to search globally.
              </span>
            </div>
          )} */}

          <div>
            <FilteredTableComponent
              data={reportData}
              columns={columns}
              filterColumns={filterableColumns}
              renderCell={renderCell}
              loading={isLoading}
              sortable={false}
              searchable={true}
              exportable={true}
              showExcelTemplate={false}
              tableId="generate-report-table"
              maxHeight="550px"
              stickyHeader={true}
              emptyStateMessage={error || "No Records Found"}
              emptyStateSubMessage="Try adjusting your search or filters"
              showSearch={true}
              searchPosition="right"
              showExport={true}
              showExcel={true}
              showPDF={false}
              tableTitle={reportHeader}
            />
          </div>

          {/* Back button */}
          <div className="flex justify-center mt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 transition-colors text-sm"
            >
              Back
            </button>
          </div>
        </fieldset>
      </div>

      <style jsx global>{`
        fieldset {
          min-width: 0;
          width: 100%;
        }

        .p-4.lg\\:p-6.bg-gray-50.min-h-screen {
          padding-left: 1rem !important;
        }

        @media (min-width: 1024px) {
          .p-4.lg\\:p-6.bg-gray-50.min-h-screen {
            padding-left: 1.5rem !important;
          }
        }

        /* ── FILTER DROPDOWN FIX ── */

        /* Outer border wrapper */
        .filtered-table-component > .border.border-gray-300.rounded-lg {
          overflow: visible !important;
          position: relative !important;
        }

        // /* Scroll container: only x scrolls, y visible so dropdown is NOT clipped */
        // .filtered-table-component > .border.border-gray-300.rounded-lg > .overflow-auto {
        //   overflow-x: auto !important;
        //   overflow-y: visible !important;
        // }

        /* Table + thead overflow visible */
        .filtered-table-component,
        .filtered-table-component table,
        .filtered-table-component thead,
        .filtered-table-component th {
          overflow: visible !important;
        }

        /* Sticky header */
        #generate-report-table thead {
          position: sticky !important;
          top: 0 !important;
          z-index: 30 !important;
        }
        #generate-report-table th {
          z-index: 30 !important;
        }

        /* Filter dropdown — above all table rows */
        .filtered-table-component th .relative > div:last-child,
        .filtered-table-component th .absolute,
        .filtered-table-component [class*="dropdown"],
        .filtered-table-component .filter-dropdown {
          position: absolute !important;
          z-index: 99999 !important;
        }

        #generate-report-table th {
          // background: #1e70c3;
          border-bottom: 2px solid #e2e8f0;
          padding: 6px 6px !important;
          font-weight: 600;
          font-size: 12px;
          vertical-align: middle;
          overflow: visible !important;
          position: relative !important;
          white-space: normal !important;
        }

        /* Flex row inside each th: label shrinks, arrows never shrink */
        #generate-report-table th > div {
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          gap: 4px !important;
          flex-wrap: nowrap !important;
        }

        /* Header label: truncate if too long but leave room for arrows */
        #generate-report-table th > div > span:first-child {
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          white-space: nowrap !important;
          flex: 1 1 0 !important;
          min-width: 0 !important;
        }

        /* Arrow container: never shrink, always visible */
        #generate-report-table th > div > div {
          flex: 0 0 auto !important;
          display: flex !important;
          align-items: center !important;
          gap: 2px !important;
        }

        /* Chevron icons: always show, pointer cursor */
        #generate-report-table th svg {
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
          cursor: pointer !important;
          flex-shrink: 0 !important;
        }

        #generate-report-table td {
          padding: 0 8px !important;
          border-bottom: 1px solid #e2e8f0;
          font-size: 12px;
          vertical-align: middle;
          height: 34px !important;
          max-height: 34px !important;
          overflow: hidden !important;
          white-space: nowrap !important;
          text-overflow: ellipsis !important;
        }

        /* Scroll: x scrolls normally, y visible so dropdowns escape */
        .overflow-x-auto {
          overflow-x: auto !important;
        }
        .overflow-y-auto {
          overflow-y: visible !important;
        }

        /* Search input */
        .search-input-wrapper { margin-left: auto !important; }
        .search-input-wrapper input {
          background: white;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          padding: 0.5rem 1rem 0.5rem 2.5rem;
        }
        .search-input-wrapper input:hover  { border-color: #10b981; }
        .search-input-wrapper input:focus  {
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
          outline: none;
        }

        @media print {
          table { width: 100%; border-collapse: collapse; font-size: 8pt; }
          th {
            background: #6b7280 !important;
            color: white !important;
            font-weight: bold;
            border: 1px solid #4b5563;
          }
          td { border: 1px solid #ddd; }
        }
          .filter-dropdown,
.filtered-table-component th .absolute {
  max-height: 250px !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
}   
      `}</style>
    </div>
  );
};

export default GenerateReport;