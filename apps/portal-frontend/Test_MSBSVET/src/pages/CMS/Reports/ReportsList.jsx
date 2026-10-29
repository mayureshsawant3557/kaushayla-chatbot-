import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // ADD THIS
import { ThemeContext } from "../../../Component/Context/ThemeContext";
import { FaBars } from "react-icons/fa";
import { useLoading } from "../../../Hooks/useLoading";
import Loader from "../../../Component/formcomponent/Loader";
import agent from "../../../lib/api/agent";
import * as XLSX from "xlsx";
import {
  reportslist,
  generateReport,
} from "../../../Endpoints_All/CMS/academisthan";
import FilteredTableComponent from "../../../Component/formcomponent/FilteredTableComponent";

const ReportsList = () => {
  const { color } = useContext(ThemeContext);
  const navigate = useNavigate(); // ADD THIS
  const [reports, setReports] = useState([]);
  const { startLoading, stopLoading, isLoading } = useLoading();

  const extractReportID = (htmlString) => {
    const match = htmlString?.match(/ReportID=(\d+)/);
    return match ? parseInt(match[1], 10) : null;
  };

  const extractReportName = (htmlString) => {
    const match = htmlString?.match(/>([^<]+)<\/a>/);
    return match ? match[1] : htmlString;
  };

  const extractHref = (htmlString) => {
    const match = htmlString?.match(/href="([^"]+)"/);
    return match ? match[1] : null;
  };

  const fetchReports = async () => {
    try {
      startLoading();
      const response = await agent.get(reportslist);

      const tableData = response?.data?.Data?.Table || [];

      const normalized = tableData.map((item, index) => ({
        id: extractReportID(item.ReportName) ?? index,
        ReportID: extractReportID(item.ReportName),
        ReportName: extractReportName(item.ReportName),
        ReportHref: extractHref(item.ReportName),
      }));

      console.log('------------', normalized);
      

      setReports(normalized);
    } catch (error) {
      console.error("Export failed:", error);
  console.error("Response:", error?.response);
    } finally {
      stopLoading();
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // ADD THIS FUNCTION
  const handleViewReport = (reportId) => {
    if (!reportId) return;
    navigate(`/Reports/GenerateReport?ReportID=${reportId}`);
  };



const handleExport = async (reportId, reportName) => {
  if (!reportId) {
    return;
  }
  try {
    startLoading();

    // No responseType: "blob" anymore — we want JSON
    const response = await agent.get(`${generateReport}/${reportId}`);


    // Adjust this path based on your actual ApiResponse<DataSet> JSON shape
    const dataSet = response?.data?.Data;
    const tables = dataSet?.Table1 || dataSet?.Table || [];

    if (!tables || tables.length === 0) {
      console.warn("No data found to export");
      return;
    }

    // Build worksheet from JSON rows
    const worksheet = XLSX.utils.json_to_sheet(tables);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

    // Trigger download
    XLSX.writeFile(workbook, `${reportName || "Report_" + reportId}.xlsx`);
  } catch (error) {
    console.error("Export failed:", error);
  } finally {
    stopLoading();
  }
};

  const columns = [
    {
      key: "SrNo",
      header: "Sr.No",
      width: "60px",
      headerClassName: "text-center",
      className: "text-center",
      sortable: false,
      excludeFromExport: true,
    },
    {
      key: "ReportName",
      header: "Report Name",
      headerClassName: "text-left",
      className: "text-left",
    },
    {
      key: "Export",
      header: "Export",
      width: "130px",
      headerClassName: "text-center",
      className: "text-center",
      sortable: false,
      excludeFromExport: true,
    },
  ];

  const renderCell = (item, column, rowIndex) => {
    if (column.key === "SrNo") {
      return rowIndex + 1;
    }

    if (column.key === "ReportName") {
      // CHANGE THIS SECTION
      return (
        <button
          onClick={() => handleViewReport(item.ReportID)}
          className="text-blue-600 hover:text-blue-800 hover:underline font-medium cursor-pointer"
        >
          {item.ReportName}
        </button>
      );
    }

    if (column.key === "Export") {
      return (
        <button
          type="button"
          onClick={() => handleExport(item.ReportID, item.ReportName)}
          disabled={!item.ReportID}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-1 rounded text-xs"
        >
          Export To Excel
        </button>
      );
    }

    return undefined;
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="w-full p-4">
      <fieldset className="rounded-lg border border-gray-300 bg-white shadow-lg">
        <legend
          className={`flex ${color} items-center text-base font-semibold text-white border-2 border-gray-300 px-3 py-1.5 rounded-md ml-4`}
        >
          <FaBars className="mr-2 text-white" />
          Reports List
        </legend>

        <div className="p-4">
          <FilteredTableComponent
            data={reports}
            columns={columns}
            loading={isLoading}
            renderCell={renderCell}
            exportFileName="Reports_List"
            searchable={true}
            sortable={true}
            showExport={false}
            showPDF={false}
            maxHeight="500px"
            emptyStateMessage="No Reports Available"
          />

          <div className="mt-6 border-t pt-4 flex justify-center">
            <button
              type="button"
              className="bg-[#00c3f9] text-white px-6 py-2 rounded"
              onClick={() => window.history.back()}
            >
              Back
            </button>
          </div>
        </div>
      </fieldset>
    </div>
  );
};

export default ReportsList;