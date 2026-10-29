import React, { useEffect, useState } from "react";
import { useLoading } from "../../../Hooks/useLoading";
import agent from "../../../lib/api/agent";
import FilteredTableComponent from "../../formcomponent/FilteredTableComponent";
import { AlertCircle, RefreshCw } from "lucide-react";
import { GetInstituteIDByInstituteCode } from "../../../Endpoints_All/Base/Institute";
import { GetInstituteManagementDetailsReport } from "../../../Endpoints_All/Administration/admin";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import Swal from 'sweetalert2';
import { useAuth } from "../../../Hooks/AuthContext";

const InstituteManagementDetailsReport = () => {
  const { loading, startLoading, stopLoading } = useLoading();
  
 const {userInfo} = useAuth();


  const [state, setState] = useState({
    data: [],
    errorMessage: "",
    instituteId: ""
  });

  const updateState = (updates) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  useEffect(() => {
    getInstituteId();

    
  }, []);

  const getInstituteId = async () => {
    try {
      const userLoginId = userInfo?.UserLoginID;

      if (!userLoginId) {
        updateState({ errorMessage: "User login ID not found in session" });
        return;
      }

      const response = await agent.get(GetInstituteIDByInstituteCode, {
        params: { InstituteCode: userLoginId }
      });

      const instituteId = response.data?.Data;

      if (instituteId) {
        updateState({ instituteId });
        fetchReport(instituteId);
      } else {
        updateState({
          errorMessage: "Institute ID not found for logged in user"
        });
      }
    } catch (error) {
      console.error("Error getting institute ID:", error);
      updateState({
        errorMessage: "Failed to connect to server"
      });
    }
  };

  const fetchReport = async (instituteId) => {
    try {
      startLoading();
      updateState({ errorMessage: "" });

      const response = await agent.get(GetInstituteManagementDetailsReport,
        {
          params: {
            instituteID: instituteId
          }
        }
      );

      const responseData = response.data?.Data;

      if (responseData && responseData.Table && Array.isArray(responseData.Table) && responseData.Table.length > 0) {
        const tableData = responseData.Table;


        const transformedData = tableData.map((item, index) => {


          return {
            id: index + 1,
            srNo: index + 1,
            region: item.Region,
            district: item.District,
            taluka: item.Taluka,
            instituteName: item["Institute Name"] || item.CollegeName || "",
            instituteCode: item["Institute Code"] || item.CollegeRegistrationNo || "",
            courseCode: item.CourseCode,
            courseName: item["Course Name"] || item.CourseName || "",
            courseSector: item["Course Sector"] || item.CourseSector || "",
            batchId: item.BatchID,
            batchStartDate: item["Batch Start Date"] || item.BatchStartDate || "",
            batchEndDate: item["Batch End Date"] || item.BatchEndDate || "",
            batchStatus: item["Batch Status"] || item.BatchStatus || "",
            // Ensure admitted is treated as a number
            admitted: item.AdmittedCandidates !== undefined && item.AdmittedCandidates !== null
              ? Number(item.AdmittedCandidates)
              : 0,
            address: item["Institute Address"] || item.CollegeAddress || "",
            city: item["Institute City"] || item.InstituteCity || "",
            pincode: item.PinCode || item.CollegePincode || "",
            // Head of institute fields
            headProfileId: item.HeadOfInstProfileID,
            headName: item.HeadOfInstName,
            headMobile: item.HeadOfInstMobileNo,
            headEmail: item.HeadOfInstEMailID,
            // Admission coordinator fields
            coordinatorProfileId: item.AdmissionCoordinatorProfileID,
            coordinatorName: item.AdmissionCoordinatorName,
            coordinatorMobile: item.AdmissionCoordinatorMobileNo,
            coordinatorEmail: item.AdmissionCoordinatorEmail
          };
        });


        updateState({ data: transformedData });
      } else {
        updateState({
          data: [],
          errorMessage: "No institute management records found"
        });
      }
    } catch (error) {
      console.error(error);
      updateState({
        errorMessage: "Failed to load institute report"
      });
    } finally {
      stopLoading();
    }
  };

  const handleRefresh = () => {
    updateState({ errorMessage: "" });
    getInstituteId();
  };

  const handleExcelExport = () => {
    try {
      if (state.data.length === 0) {
        Swal.fire({ icon: 'warning', title: 'No Data', text: 'No data available to export.' });
        return;
      }

      const wb = XLSX.utils.book_new();
      // Calculate column spans correctly
      const totalCols = 25; // Total columns (0-24)

      // Create group headers array with empty strings for proper placement
      const groupHeaders = new Array(totalCols).fill("");

      // Set the group headers at their starting positions
      groupHeaders[0] = "Institute Details";
      groupHeaders[17] = "Head of Institute / Principal / Director";
      groupHeaders[21] = "Admission Coordinator";

      const columnHeaders = [
        "Sr",
        "Region",
        "District",
        "Taluka",
        "Institute Name",
        "Institute Code",
        "Course Code",
        "Course Name",
        "Course Sector",
        "Batch ID",
        "Batch Start Date",
        "Batch End Date",
        "Batch Status",
        "Admitted",
        "Address",
        "City/Village",
        "Pincode",
        "Profile ID",
        "Name",
        "Mobile No",
        "Email ID",
        "Profile ID",
        "Name",
        "Mobile No",
        "Email ID"
      ];

      const dataRows = state.data.map(item => [
        item.srNo,
        item.region || "",
        item.district || "",
        item.taluka || "",
        item.instituteName || "",
        item.instituteCode || "",
        item.courseCode || "",
        item.courseName || "",
        item.courseSector || "",
        item.batchId || "",
        item.batchStartDate || "",
        item.batchEndDate || "",
        item.batchStatus || "",
        item.admitted !== undefined && item.admitted !== null ? item.admitted : 0,
        item.address || "",
        item.city || "",
        item.pincode || "",
        item.headProfileId || "",
        item.headName || "",
        item.headMobile || "",
        item.headEmail || "",
        item.coordinatorProfileId || "",
        item.coordinatorName || "",
        item.coordinatorMobile || "",
        item.coordinatorEmail || ""
      ]);

      const wsData = [groupHeaders, columnHeaders, ...dataRows];
      const ws = XLSX.utils.aoa_to_sheet(wsData);

      // Define merges for group headers
      ws['!merges'] = [
        // Institute Details spans from column 0 to 16
        { s: { r: 0, c: 0 }, e: { r: 0, c: 16 } },
        // Head of Institute spans from column 17 to 20
        { s: { r: 0, c: 17 }, e: { r: 0, c: 20 } },
        // Admission Coordinator spans from column 21 to 24
        { s: { r: 0, c: 21 }, e: { r: 0, c: 24 } }
      ];

      // Set column widths
      ws['!cols'] = [
        { wch: 5 },   // Sr
        { wch: 10 },  // Region
        { wch: 10 },  // District
        { wch: 10 },  // Taluka
        { wch: 50 },  // Institute Name
        { wch: 15 },  // Institute Code
        { wch: 15 },  // Course Code
        { wch: 40 },  // Course Name
        { wch: 25 },  // Course Sector
        { wch: 15 },  // Batch ID
        { wch: 15 },  // Batch Start Date
        { wch: 15 },  // Batch End Date
        { wch: 15 },  // Batch Status
        { wch: 8 },   // Admitted
        { wch: 30 },  // Address
        { wch: 15 },  // City/Village
        { wch: 8 },   // Pincode
        { wch: 15 },  // Profile ID (Head)
        { wch: 25 },  // Name (Head)
        { wch: 15 },  // Mobile No (Head)
        { wch: 25 },  // Email ID (Head)
        { wch: 15 },  // Profile ID (Coordinator)
        { wch: 25 },  // Name (Coordinator)
        { wch: 15 },  // Mobile No (Coordinator)
        { wch: 25 }   // Email ID (Coordinator)
      ];

      // Style group headers (row 0)
      for (let C = 0; C < totalCols; C++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
        if (ws[cellAddress]) {
          ws[cellAddress].s = {
            font: { bold: true, sz: 12 },
            alignment: { horizontal: "center", vertical: "center" },
            fill: { fgColor: { rgb: "E9EEF3" } } // Light gray background for group headers
          };
        }
      }

      // Style column headers (row 1)
      for (let C = 0; C < columnHeaders.length; C++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 1, c: C });
        if (ws[cellAddress]) {
          ws[cellAddress].s = {
            font: { bold: true, sz: 11 },
            alignment: { horizontal: "center", vertical: "center" },
            fill: { fgColor: { rgb: "F8FAFC" } }
          };
        }
      }

      // Add borders to all cells
      const range = XLSX.utils.decode_range(ws['!ref']);
      for (let R = range.s.r; R <= range.e.r; R++) {
        for (let C = range.s.c; C <= range.e.c; C++) {
          const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
          if (!ws[cellAddress]) continue;

          if (!ws[cellAddress].s) {
            ws[cellAddress].s = {};
          }

          ws[cellAddress].s.border = {
            top: { style: 'thin', color: { rgb: 'D1D5DB' } },
            bottom: { style: 'thin', color: { rgb: 'D1D5DB' } },
            left: { style: 'thin', color: { rgb: 'D1D5DB' } },
            right: { style: 'thin', color: { rgb: 'D1D5DB' } }
          };
        }
      }

      XLSX.utils.book_append_sheet(wb, ws, "Institute Management Report");
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
      saveAs(blob, "InstituteManagementDetailsReport.xlsx");

    } catch (error) {
      console.error("Excel Export Error:", error);
      Swal.fire({
        icon: 'error',
        title: 'Export Failed',
        text: 'An error occurred while exporting to Excel.'
      });
    }
  };

  const formatMobile = (mobile) => {
    if (!mobile) return "—";
    const mobileStr = mobile.toString();
    return mobileStr;
  };

  const formatEmail = (email) => {
   return email || "—";
  };

  const columns = [
    { key: "srNo", header: "Sr", width: "50px", className: "text-center", headerClassName: "text-center font-bold", sortable: false },
    { key: "region", header: "Region", width: "90px", className: "text-left", headerClassName: "text-left font-bold" },
    { key: "district", header: "District", width: "110px", className: "text-left", headerClassName: "text-left font-bold" },
    { key: "taluka", header: "Taluka", width: "150px", className: "text-left", headerClassName: "text-left font-bold" },
    { key: "instituteName", header: "Institute Name", width: "300px", className: "text-left", headerClassName: "text-left font-bold" },
    { key: "instituteCode", header: "Institute Code", width: "140px", className: "text-left", headerClassName: "text-left font-bold" },
    { key: "courseCode", header: "Course Code", width: "130px", className: "text-left", headerClassName: "text-left font-bold" },
    { key: "courseName", header: "Course Name", width: "300px", className: "text-left", headerClassName: "text-left font-bold" },
    { key: "courseSector", header: "Course Sector", width: "200px", className: "text-left", headerClassName: "text-left font-bold" },
    { key: "batchId", header: "Batch ID", width: "140px", className: "text-left", headerClassName: "text-left font-bold" },
    { key: "batchStartDate", header: "Batch Start Date", width: "140px", className: "text-center", headerClassName: "text-center font-bold" },
    { key: "batchEndDate", header: "Batch End Date", width: "140px", className: "text-center", headerClassName: "text-center font-bold" },
    { key: "batchStatus", header: "Batch Status", width: "120px", className: "text-left", headerClassName: "text-left font-bold" },
    { key: "admitted", header: "Admitted", width: "90px", className: "text-center", headerClassName: "text-center font-bold" },
    { key: "address", header: "Address", width: "320px", className: "text-left", headerClassName: "text-left font-bold" },
    { key: "city", header: "City/Village", width: "80px", className: "text-left", headerClassName: "text-left font-bold" },
    { key: "pincode", header: "Pincode", width: "90px", className: "text-center", headerClassName: "text-center font-bold" },
    { key: "headProfileId", header: "Profile ID", width: "140px", className: "text-center", headerClassName: "text-center font-bold" },
    { key: "headName", header: "Name", width: "220px", className: "text-left", headerClassName: "text-left font-bold" },
    { key: "headMobile", header: "Mobile No", width: "150px", className: "text-center", headerClassName: "text-center font-bold" },
    { key: "headEmail", header: "Email ID", width: "120px", className: "text-left", headerClassName: "text-left font-bold" },
    { key: "coordinatorProfileId", header: "Profile ID", width: "140px", className: "text-center", headerClassName: "text-center font-bold" },
    { key: "coordinatorName", header: "Name", width: "220px", className: "text-left", headerClassName: "text-left font-bold" },
    { key: "coordinatorMobile", header: "Mobile No", width: "150px", className: "text-center", headerClassName: "text-center font-bold" },
    { key: "coordinatorEmail", header: "Email ID", width: "220px", className: "text-left", headerClassName: "text-left font-bold" }
  ];

  const groupedHeaders = [
    { title: "Institute Details", colSpan: 17 },
    { title: "Head of Institute / Principal / Director", colSpan: 4 },
    { title: "Admission Coordinator", colSpan: 4 }
  ];

  const filterableColumns = [
    'region', 'district', 'taluka', 'instituteName', 'instituteCode',
    'courseCode', 'courseName', 'courseSector', 'batchId', 'batchStatus',
    'city', 'pincode', 'headName', 'coordinatorName', 'admitted'
  ];

  const renderCell = (item, column, rowIndex) => {
    if (column.key === 'headMobile' || column.key === 'coordinatorMobile') {
      return formatMobile(item[column.key]);
    }
    if (column.key === 'headEmail' || column.key === 'coordinatorEmail') {
      const email = formatEmail(item[column.key]);
      return email !== "—" ? (
        <span title={item[column.key]}>
          {email}
        </span>
      ) : "—";
    }
    if (column.key === "admitted") {
      return item[column.key] ?? 0;
    }
    const value = item[column.key];
    return value && value !== "" ? value : "—";
  };

  return (
    <>


      <div className="p-4 lg:p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-xl shadow-md">
          <fieldset className="border border-gray-300 p-4 lg:p-6 overflow-visible relative">
            <legend className="rounded border border-gray-300 bg-gradient-to-r from-gray-700 to-gray-600 px-4 py-1.5 text-lg lg:text-xl font-bold text-white ml-4 shadow-sm">
              Institute Management Details Report
            </legend>

            {state.errorMessage && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                <AlertCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
                <span className="flex-1">{state.errorMessage}</span>
                <button
                  onClick={handleRefresh}
                  className="inline-flex items-center px-3 py-1 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200 transition-colors flex-shrink-0"
                >
                  <RefreshCw size={14} className="mr-1" />
                  Retry
                </button>
              </div>
            )}

            <div className="mt-2 w-full relative">
              <FilteredTableComponent
                loading={loading}
                filterColumns={filterableColumns}
                data={state.data}
                columns={columns}
                groupedHeaders={groupedHeaders}
                renderCell={renderCell}
                sortable={true}
                searchable={true}
                exportable={true}
                showSearch={true}
                showExcel={true}
                showPDF={false}
                exportFileName="InstituteManagementDetailsReport"
                tableId="institute-management-report"
                maxHeight="550px"
                stickyHeader={true}
                emptyStateMessage="No Data found"
                emptyStateSubMessage="Try refreshing or contact support if issue persists"
                downloadCSV={handleExcelExport}
              />
            </div>
          </fieldset>
        </div>

        <style jsx global>{`
        /* Only change: Make Institute Details header align to left */
        #institute-management-report thead tr:first-child th:first-child {
          text-align: left !important;
          padding-left: 620px !important;
        }

        /* Keep all other styles exactly as they were */
        fieldset{
          min-width:0;
          width:100%;
          overflow:visible!important;
        }

        /* container spacing */
        .p-4.lg\\:p-6.bg-gray-50.min-h-screen{
          padding-left:1rem!important;
        }

        @media (min-width:1024px){
          .p-4.lg\\:p-6.bg-gray-50.min-h-screen{
            padding-left:1.5rem!important;
          }
        }

        /* dropdown fixes */
        .filter-dropdown-container,
        .filter-menu,
        [class*="filter-dropdown"],
        [class*="dropdown-menu"]{
          z-index:9999!important;
          position:relative;
        }

        /* search box */
        .search-input-wrapper{
          position:relative;
        }

        .search-input-wrapper input{
          background:white;
          border:1px solid #d1d5db;
          border-radius:6px;
          padding:0.5rem 1rem 0.5rem 2.5rem;
        }

        .search-icon{
          position:absolute;
          left:0.75rem;
          top:50%;
          transform:translateY(-50%);
          color:#6b7280;
        }

        /* table container */
        .overflow-x-auto{
          overflow-x:auto;
          width:100%;
          border-radius:8px;
        }

        /* IMPORTANT: allow table to expand naturally */
        #institute-management-report{
          border-collapse:collapse;
          width:max-content;
          min-width:100%;
        }

        /* header */
        #institute-management-report th{
          background:#f8fafc;
          border-bottom:2px solid #e2e8f0;
          padding:12px 10px!important;
          font-weight:600;
          white-space:nowrap;
        }

        /* group headers - only change is above for first cell */
        #institute-management-report thead tr:first-child th{
          background:#e9eef3;
          font-weight:700;
          text-align:center;
        }

        /* cells */
        #institute-management-report td{
          padding:10px 10px!important;
          border-bottom:1px solid #e2e8f0;
        }

        #institute-management-report tbody tr:hover{
          background:#f1f5f9;
        }

        /* column widths */

        #institute-management-report th:nth-child(1),
        #institute-management-report td:nth-child(1){
        min-width:50px;
        }

        #institute-management-report th:nth-child(2),
        #institute-management-report td:nth-child(2){
        min-width:100px;
        }

        #institute-management-report th:nth-child(3),
        #institute-management-report td:nth-child(3){
        min-width:120px;
        }

        #institute-management-report th:nth-child(4),
        #institute-management-report td:nth-child(4){
        min-width:120px;
        }

        #institute-management-report th:nth-child(5),
        #institute-management-report td:nth-child(5){
        min-width:500px;
        white-space:normal;
        }

        #institute-management-report th:nth-child(6),
        #institute-management-report td:nth-child(6){
        min-width:150px;
        }

        #institute-management-report th:nth-child(7),
        #institute-management-report td:nth-child(7){
        min-width:150px;
        }

        #institute-management-report th:nth-child(8),
        #institute-management-report td:nth-child(8){
        min-width:320px;
        white-space:normal;
        }

        #institute-management-report th:nth-child(9),
        #institute-management-report td:nth-child(9){
        min-width:220px;
        }

        #institute-management-report th:nth-child(10),
        #institute-management-report td:nth-child(10){
        min-width:160px;
        }

        /* scrollbar */
        .overflow-x-auto::-webkit-scrollbar{
        height:8px;
        }

        .overflow-x-auto::-webkit-scrollbar-track{
        background:#f1f1f1;
        }

        .overflow-x-auto::-webkit-scrollbar-thumb{
        background:#cbd5e1;
        border-radius:4px;
        }

        /* print */
        @media print{

        table{
        width:100%;
        border-collapse:collapse;
        font-size:8pt;
        }

        th{
        background:#6b7280!important;
        color:white!important;
        font-weight:bold;
        border:1px solid #4b5563;
        }

        td{
        border:1px solid #ddd;
        }

        }

      `}</style>    </div>
    </>
  );
};

export default InstituteManagementDetailsReport;