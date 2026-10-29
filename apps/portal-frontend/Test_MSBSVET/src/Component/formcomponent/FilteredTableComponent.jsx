import { useState, useEffect, useRef, useContext } from "react";
import {
  Search,
  Download,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ThemeContext } from "../../Component/Context/ThemeContext";

const PAGINATE_MIN_ROWS = 10;

const FilteredTableComponent = ({
  data = [],
  columns = [],
  loading = false,
  filterColumns = [],
  searchable = true,
  sortable = true,
  exportable = true,
  onRowChange = null,
  customButtons = [],
  className = "",
  title = "",
  showSearch = true,
  searchPosition = "right", // 'left' or 'right'
  showExport = true,
  showExcelTemplate = false,
  exportFileName = "data_export",
  onExportFilter = null,
  renderCell = null,
  tableId = "filtered-table",
  maxHeight = "400px",
  stickyHeader = true,
  downloadCSV = null,
  downloadPDF = null,
  downloadTemplate = null,
  showExcel = true,
  showPDF = true,
  emptyStateMessage = "No Data Found",
  emptyStateSubMessage = "",
  customFooter = null,
  showCheckbox = false,
  onSelectionChange = null,
  isRowSelectable = null,
  // New prop for grouped headers
  groupedHeaders = [],
  selectedRowsExternal = null,
  tableTitle = "",
  // Pagination
  paginate = true,
  rowsPerPageOptions = [10, 20, 50, 100],
  defaultRowsPerPage = 20,
  minTableWidth = "100%",
}) => {
  const { color } = useContext(ThemeContext);
  const [selectedRows, setSelectedRows] = useState([]);
  const [filteredData, setFilteredData] = useState(data);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [columnFilters, setColumnFilters] = useState({});
  const [hoveredFilter, setHoveredFilter] = useState(null);
  const tableRef = useRef();
  const filterTimeoutRef = useRef({});
  const [filterSearchText, setFilterSearchText] = useState({});

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);

  useEffect(() => {
    applyFilters();
  }, [data, searchTerm, sortConfig, columnFilters]);

  useEffect(() => {
    if (selectedRowsExternal !== null) {
      setSelectedRows(selectedRowsExternal);
    }
  }, [selectedRowsExternal]);

  // Reset to page 1 whenever the underlying result set or page size changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredData.length, rowsPerPage, searchTerm, columnFilters, sortConfig]);

  const handleFilterMouseEnter = (columnKey) => {
    if (filterTimeoutRef.current[columnKey]) {
      clearTimeout(filterTimeoutRef.current[columnKey]);
    }
    filterTimeoutRef.current[columnKey] = setTimeout(() => {
      setHoveredFilter(columnKey);
    }, 10);
  };

  const handleSelectAll = (checked) => {
    const selectableIndices = filteredData
      .map((item, i) => ({ item, i }))
      .filter(({ item }) => !isRowSelectable || isRowSelectable(item))
      .map(({ i }) => i);
    const newSelected = checked ? selectableIndices : [];
    setSelectedRows(newSelected);
    onSelectionChange?.(checked ? newSelected.map((i) => filteredData[i]) : []);
  };

  const handleSelectRow = (rowIndex, checked) => {
    const newSelected = checked
      ? [...selectedRows, rowIndex]
      : selectedRows.filter((i) => i !== rowIndex);
    setSelectedRows(newSelected);
    onSelectionChange?.(newSelected.map((i) => filteredData[i]));
  };

  const handleFilterMouseLeave = (columnKey) => {
    if (filterTimeoutRef.current[columnKey]) {
      clearTimeout(filterTimeoutRef.current[columnKey]);
    }
    filterTimeoutRef.current[columnKey] = setTimeout(() => {
      setHoveredFilter(null);
    }, 200);
  };

  const handleDropdownMouseEnter = (columnKey) => {
    if (filterTimeoutRef.current[columnKey]) {
      clearTimeout(filterTimeoutRef.current[columnKey]);
    }
    setHoveredFilter(columnKey);
  };

  const applyFilters = () => {
    let filtered = [...data];

    if (searchTerm && searchable) {
      filtered = filtered.filter((item) =>
        Object.values(item).some((value) =>
          value?.toString().toLowerCase().includes(searchTerm.toLowerCase()),
        ),
      );
    }

    Object.keys(columnFilters).forEach((columnKey) => {
      const filterValue = columnFilters[columnKey];
      if (filterValue && filterValue.length > 0) {
        filtered = filtered.filter((item) =>
          filterValue.includes(item[columnKey]),
        );
      }
    });

    if (sortConfig.key && sortable) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    setFilteredData(filtered);
  };

  const handleSort = (columnKey) => {
    if (!sortable) return;
    setSortConfig((prevConfig) => ({
      key: columnKey,
      direction:
        prevConfig.key === columnKey && prevConfig.direction === "asc"
          ? "desc"
          : "asc",
    }));
  };

  const handleColumnFilter = (columnKey, value, checked) => {
    setColumnFilters((prev) => {
      const currentFilters = prev[columnKey] || [];
      const newFilters = checked
        ? [...currentFilters, value]
        : currentFilters.filter((item) => item !== value);
      return { ...prev, [columnKey]: newFilters };
    });
  };

  const getUniqueColumnValues = (columnKey) => {
    return [...new Set(data.map((item) => item[columnKey]).filter(Boolean))];
  };

  const renderCellContent = (item, column, rowIndex) => {
    const value = item[column.key];

    // Dynamic Serial Number
    const headerStr =
      typeof column.header === "string" ? column.header.toLowerCase() : "";
    if (
      column.key?.toLowerCase() === "sn" ||
      column.key?.toLowerCase() === "serialno" ||
      column.key?.toLowerCase() === "srno" ||
      headerStr === "s.n." ||
      headerStr === "sr.no" ||
      headerStr === "sr no"
    ) {
      // rowIndex is now the row's true position in the full filtered
      // list (see globalIndex below), so numbering stays correct
      // across pages instead of restarting at 1 on every page.
      return rowIndex + 1;
    }

    // Custom renderer
    if (renderCell && typeof renderCell === "function") {
      const customContent = renderCell(item, column, rowIndex);
      if (customContent !== undefined) return customContent;
    }

    if (column.type === "input") {
      return (
        <input
          type={column.inputType || "text"}
          min={column.min || 0}
          step={column.step || 1}
          value={value || ""}
          onChange={(e) => {
            if (onRowChange && typeof onRowChange === "function") {
              onRowChange(item.id || rowIndex, column.key, e.target.value);
            }
          }}
          className={`w-full px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-1 focus:ring-green-500 ${
            column.className || ""
          }`}
          placeholder={column.placeholder || "0"}
        />
      );
    }

    if (column.type === "link") {
      return (
        <a
          href={column.linkUrl ? column.linkUrl(item) : item[column.key]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 hover:underline"
        >
          {value}
        </a>
      );
    }

    if (column.type === "currency") {
      return typeof value === "number" ? value.toLocaleString() : value;
    }

    return value;
  };

  const defaultDownloadExcel = () => {
    try {
      if (filteredData.length === 0) {
        Swal.fire({
          icon: "warning",
          title: "No Data",
          text: "No data available to export.",
        });
        return;
      }

      const REMARK_MAP = {
        1: "Available in Institute",
        2: "Available with MoU Partner",
        3: "Available with Allied Course",
      };

      const exportColumns = columns.filter((c) => !c.excludeFromExport);
      const headers = exportColumns.map((c) => c.header);
      const keys = exportColumns.map((c) => c.key);

      const rows = filteredData.map((row) =>
        keys.map((key) => {
          // Special computed columns
          if (key === "Availability") {
            const availableQty = Number(row.AvailableEquipments) || 0;
            const requiredQty = Number(row.RequiredEquipmentForTotalUnits) || 0;
            return availableQty - requiredQty;
          }
          if (key === "Remark") {
            const r = row.Remark;
            if (r === "" || r === -1 || r === undefined || r === null)
              return "";
            return REMARK_MAP[r] || r;
          }

          const val = row[key];
          if (val === true) return "YES";
          if (val === false) return "NO";
          return val !== undefined && val !== null ? val : "";
        }),
      );

      const worksheetData = tableTitle
        ? [[tableTitle], [], headers, ...rows]
        : [headers, ...rows];
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

      if (tableTitle) {
        worksheet["!merges"] = [
          {
            s: { r: 0, c: 0 },
            e: { r: 0, c: headers.length - 1 },
          },
        ];
      }
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const blob = new Blob([excelBuffer], {
        type: "application/octet-stream",
      });
      saveAs(blob, `${exportFileName || "data_export"}.xlsx`);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Export Failed",
        text: "An error occurred while exporting to Excel.",
      });
    }
  };

  const defaultDownloadPDF = () => {
    try {
      if (filteredData.length === 0) {
        Swal.fire({
          icon: "warning",
          title: "No Data",
          text: "No data available to export.",
        });
        return;
      }

      const doc = new jsPDF("l", "mm", "a4");

      const pdfTitle = tableTitle || title;

      if (pdfTitle) {
        doc.setFontSize(16);
        doc.text(pdfTitle, 14, 15);
      }

      const exportColumns = columns.filter((c) => !c.excludeFromExport);
      const headers = [exportColumns.map((c) => c.header)];
      const keys = exportColumns.map((c) => c.key);
      const rows = filteredData.map((row) =>
        keys.map((key) => {
          const value = row[key];
          if (value === null || value === undefined) return "";
          if (typeof value === "object") return JSON.stringify(value);
          return String(value);
        }),
      );

      autoTable(doc, {
        head: headers,
        body: rows,
        startY: pdfTitle ? 22 : 15,
        theme: "grid",
        styles: {
          fontSize: 7,
          cellPadding: 1,
          overflow: "linebreak",
          cellWidth: "wrap",
        },
        headStyles: {
          fillColor: [66, 139, 202],
          textColor: 255,
          fontStyle: "bold",
        },
        margin: { top: 15 },
        didDrawPage: function (data) {
          const pageCount = doc.internal.getNumberOfPages();
          doc.setFontSize(8);
          doc.text(
            `Page ${data.pageNumber} of ${pageCount}`,
            doc.internal.pageSize.getWidth() / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: "center" },
          );
        },
      });

      doc.save(`${exportFileName || "data_export"}.pdf`);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Export Failed",
        text: `An error occurred while exporting to PDF: ${error.message}`,
      });
    }
  };

  const defaultDownloadTemplate = () => {
    try {
      const REMARK_MAP = {
        1: "Available in Institute",
        2: "Available with MoU Partner",
        3: "Available with Allied Course",
      };

      const exportColumns = columns.filter((c) => !c.excludeFromExport);
      const headers = exportColumns.map((c) => c.header);
      const keys = exportColumns.map((c) => c.key);

      const rows = data.map((row) =>
        keys.map((key) => {
          // Compute availability if requested in template
          if (key === "Availability") {
            const availableQty = Number(row.AvailableEquipments) || 0;
            const requiredQty = Number(row.RequiredEquipmentForTotalUnits) || 0;
            return availableQty - requiredQty;
          }
          if (key === "Remark") {
            const r = row.Remark;
            if (r === "" || r === -1 || r === undefined || r === null)
              return "";
            return REMARK_MAP[r] || r;
          }

          const value = row[key];

          if (value === true) return "YES";
          if (value === false) return "NO";

          return value !== undefined && value !== null ? value : "";
        }),
      );
      const worksheetData = [headers, ...rows];
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const blob = new Blob([excelBuffer], {
        type: "application/octet-stream",
      });
      saveAs(blob, `${exportFileName || "data_export"}_template.xlsx`);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Export Failed",
        text: "An error occurred while exporting template.",
      });
    }
  };

  const handleExcelClick = () => {
    if (downloadCSV && typeof downloadCSV === "function") {
      downloadCSV();
    } else {
      defaultDownloadExcel();
    }
  };

  const handlePDFClick = () => {
    if (downloadPDF && typeof downloadPDF === "function") {
      downloadPDF();
    } else {
      defaultDownloadPDF();
    }
  };

  const handleTemplateClick = () => {
    if (downloadTemplate && typeof downloadTemplate === "function") {
      downloadTemplate();
    } else {
      defaultDownloadTemplate();
    }
  };

  // --- Pagination derived values ---
  const totalRows = filteredData.length;
  // Only paginate when there's more than PAGINATE_MIN_ROWS rows.
  // With 10 or fewer rows everything renders on a single "page"
  // and the pager bar is hidden entirely.
  const shouldPaginate = paginate && totalRows > PAGINATE_MIN_ROWS;
  const totalPages = shouldPaginate
    ? Math.max(1, Math.ceil(totalRows / rowsPerPage))
    : 1;
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = shouldPaginate ? (safePage - 1) * rowsPerPage : 0;
  const endIdx = shouldPaginate
    ? Math.min(startIdx + rowsPerPage, totalRows)
    : totalRows;
  const pageData = shouldPaginate
    ? filteredData.slice(startIdx, endIdx)
    : filteredData;

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  return (
    <div className={`filtered-table-component ${className}`}>
      {/* Table Title */}
      {tableTitle && (
        <div
          style={{
            borderLeft: "4px solid #1e40af",
            background: "#e3effe",
            borderRadius: "0 8px 8px 0",
            padding: "12px 18px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <i
            className="ti ti-table"
            style={{ fontSize: 20, color: "#2563eb" }}
          />
          <div>
            <p
              style={{
                margin: 0,
                fontSize: 14,
                fontWeight: 600,
                color: "#111827",
              }}
            >
              {tableTitle}
            </p>
          </div>
        </div>
      )}

      {/* Header Controls */}
      <div className="mb-4 flex gap-4 items-center justify-between flex-wrap">
        {/* Custom Buttons */}
        {customButtons && customButtons.length > 0 && (
          <div className="flex items-center space-x-2">
            {customButtons.map((button, index) => (
              <button
                key={index}
                onClick={button.onClick}
                className={
                  button.className ||
                  "px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 transition"
                }
              >
                {button.label}
              </button>
            ))}
          </div>
        )}

        {/* optionally render search on left */}
        {searchPosition === "left" && showSearch && searchable && (
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
            />
          </div>
        )}

        {showExport && exportable && (
          <div className="flex items-center space-x-2">
            <div className="flex border rounded-md overflow-hidden">
              {showExcel && (
                <button
                  onClick={handleExcelClick}
                  className="bg-green-600 text-white px-3 py-1 text-sm font-semibold hover:bg-green-700 transition-colors"
                >
                  Excel
                </button>
              )}
              {showPDF && (
                <button
                  onClick={handlePDFClick}
                  className="bg-sky-700 text-white px-3 py-1 text-sm font-semibold hover:bg-sky-800 transition-colors"
                >
                  PDF
                </button>
              )}
            </div>
          </div>
        )}

        {showExcelTemplate && (
          <button
            onClick={handleTemplateClick}
            className="flex items-center bg-yellow-200 font-semibold px-3 py-1 border border-yellow-300 rounded-md hover:bg-yellow-300 transition"
          >
            <Download className="w-4 h-4 mr-1 text-yellow-600" />
            Download Excel Template
          </button>
        )}

        {searchPosition === "right" && showSearch && searchable && (
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0f1f4d] focus:border-[#0f1f4d] w-64"
            />
          </div>
        )}
      </div>

      {/* change*/}
      {loading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      )}

      {/*change */}
      {!loading && (
        <div className="border border-gray-200 rounded-lg  shadow-sm">
                  <div className="overflow-auto" style={{
                      maxHeight: maxHeight,
                      overflowX: "auto",
                      overflowY: "auto",
                  }}>
            <table
              ref={tableRef}
              id={tableId}
              className="min-w-full border-collapse text-sm"
              style={{ tableLayout: "fixed", minWidth: minTableWidth, }}
            >
              <thead
                className={`${color} ${stickyHeader ? "sticky top-0 z-5" : ""}`}
              >
                {/* Grouped Headers - All in one row */}
                {groupedHeaders && groupedHeaders.length > 0 && (
                  <tr>
                    {groupedHeaders.map((group, index) => {
                      // Handle both formats
                      if (group.columns) {
                        // New format with columns array - flatten it
                        return group.columns.map((col, colIndex) => (
                          <th
                            key={`group-${index}-${colIndex}`}
                            colSpan={col.colSpan || 1}
                            className={`border border-gray-300/30 px-2 py-2 text-center font-bold text-white ${col.className || ""}`}
                          >
                            {col.header}
                          </th>
                        ));
                      } else {
                        // Old simple format with title and colSpan
                        return (
                          <th
                            key={`group-${index}`}
                            colSpan={group.colSpan || 1}
                            className={`border border-gray-300/30 px-2 py-2 text-center font-bold text-white ${group.className || ""}`}
                          >
                            {group.title || group.header}
                          </th>
                        );
                      }
                    })}
                  </tr>
                )}

                {/* Main Headers */}
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className={`border-b border-gray-300/30 px-2 py-2 text-white font-semibold ${
                        column.headerClassName || "text-center"
                      } relative`}
                      style={{ width: column.width || "auto" }}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={
                            sortable && column.sortable !== false
                              ? "cursor-pointer hover:text-blue-200 flex-1"
                              : "flex-1"
                          }
                          onClick={() =>
                            column.sortable !== false && handleSort(column.key)
                          }
                        >
                          {column.header}
                        </span>

                        <div className="flex items-center gap-1">
                          {sortable && column.sortable !== false && (
                            <div className="flex flex-col">
                              <ChevronUp
                                className={`w-3 h-3 cursor-pointer ${
                                  sortConfig.key === column.key &&
                                  sortConfig.direction === "asc"
                                    ? "text-blue-200"
                                    : "text-gray-300"
                                }`}
                                onClick={() => handleSort(column.key)}
                              />
                              <ChevronDown
                                className={`w-3 h-3 cursor-pointer -mt-1 ${
                                  sortConfig.key === column.key &&
                                  sortConfig.direction === "desc"
                                    ? "text-blue-200"
                                    : "text-gray-300"
                                }`}
                                onClick={() => handleSort(column.key)}
                              />
                            </div>
                          )}

                          {filterColumns.includes(column.key) && (
                            <div
                              onMouseEnter={() =>
                                handleFilterMouseEnter(column.key)
                              }
                              onMouseLeave={() =>
                                handleFilterMouseLeave(column.key)
                              }
                              className="relative"
                            >
                              <button className="text-white hover:text-blue-200">
                                <Search className="w-3 h-3" />
                              </button>

                              {hoveredFilter === column.key && (
                                <div
                                  onMouseEnter={() =>
                                    handleDropdownMouseEnter(column.key)
                                  }
                                  onMouseLeave={() =>
                                    handleFilterMouseLeave(column.key)
                                  }
                                  className="absolute z-10 mt-1 w-48 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto left-0"
                                >
                                  <div className="p-1 border-b border-gray-200">
                                    <input
                                      type="text"
                                      placeholder="Search..."
                                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800"
                                      value={filterSearchText[column.key] || ""}
                                      onChange={(e) =>
                                        setFilterSearchText((prev) => ({
                                          ...prev,
                                          [column.key]: e.target.value,
                                        }))
                                      }
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                  </div>

                                  {getUniqueColumnValues(column.key)
                                    .filter((value) => {
                                      const term = (
                                        filterSearchText[column.key] || ""
                                      ).toLowerCase();
                                      if (!term) return true;
                                      return value
                                        ?.toString()
                                        .toLowerCase()
                                        .includes(term);
                                    })
                                    .map((value) => (
                                      <label
                                        key={value}
                                        className="flex items-center px-2 py-1 hover:bg-gray-100 cursor-pointer"
                                      >
                                        <input
                                          type="checkbox"
                                          checked={(
                                            columnFilters[column.key] || []
                                          ).includes(value)}
                                          onChange={(e) =>
                                            handleColumnFilter(
                                              column.key,
                                              value,
                                              e.target.checked,
                                            )
                                          }
                                          className="mr-2"
                                        />
                                        <span className="text-xs text-left text-gray-800">
                                          {value}
                                        </span>
                                      </label>
                                    ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </th>
                  ))}

                  {showCheckbox && (
                    <th
                      className="border-b border-gray-300/30 px-2 py-2 text-center"
                      style={{ width: "40px" }}
                    >
                      <input
                        type="checkbox"
                        checked={(() => {
                          const selectableIndices = filteredData
                            .map((item, i) => ({ item, i }))
                            .filter(
                              ({ item }) =>
                                !isRowSelectable || isRowSelectable(item),
                            )
                            .map(({ i }) => i);

                          return (
                            selectableIndices.length > 0 &&
                            selectableIndices.every((i) =>
                              selectedRows.includes(i),
                            )
                          );
                        })()}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="cursor-pointer"
                      />
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {pageData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length + (showCheckbox ? 1 : 0)}
                      className="border-b border-gray-100 px-4 py-8 text-center"
                    >
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <p className="text-base font-medium mb-1">
                          {emptyStateMessage}
                        </p>
                        {emptyStateSubMessage && (
                          <p className="text-sm text-gray-400">
                            {emptyStateSubMessage}
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  pageData.map((item, rowIndex) => {
                    // True position of this row within the full
                    // filtered list (not just the current page).
                    // Fixes S.No. resetting per page and keeps
                    // checkbox selection pointed at the right row.
                    const globalIndex = startIdx + rowIndex;

                    return (
                      <tr
                        key={item.id || globalIndex}
                        className={`${rowIndex % 2 === 0 ? "bg-white" : "bg-indigo-50"} hover:bg-blue-100 transition-colors`}
                      >
                        {columns.map((column) => (
                          <td
                            key={column.key}
                            className={`border-b border-gray-100 px-2 py-2 ${
                              column.className || ""
                            }`}
                            style={{ width: column.width || "auto" }}
                          >
                            {renderCellContent(item, column, globalIndex)}
                          </td>
                        ))}
                        {showCheckbox && (
                          <td
                            className="border-b border-gray-100 px-2 py-2 text-center"
                            style={{ width: "40px" }}
                          >
                            {!isRowSelectable || isRowSelectable(item) ? (
                              <input
                                type="checkbox"
                                checked={selectedRows.includes(globalIndex)}
                                onChange={(e) =>
                                  handleSelectRow(globalIndex, e.target.checked)
                                }
                                className="cursor-pointer"
                              />
                            ) : (
                              <input
                                type="checkbox"
                                disabled
                                className="cursor-not-allowed opacity-30"
                              />
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
                {/*table footer */}
                {customFooter && <>{customFooter}</>}
              </tbody>
            </table>
          </div>

          {/* Pagination Bar */}
          {shouldPaginate && (
            <div className="flex items-center justify-end gap-4 px-4 py-2 border-t border-gray-200 bg-white text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span>Items per page:</span>
                <select
                  value={rowsPerPage}
                  onChange={handleRowsPerPageChange}
                  className="border border-gray-300 rounded px-1.5 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {rowsPerPageOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <span>
                {totalRows === 0 ? 0 : startIdx + 1}–{endIdx} of {totalRows}
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => goToPage(safePage - 1)}
                  disabled={safePage <= 1}
                  className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => goToPage(safePage + 1)}
                  disabled={safePage >= totalPages}
                  className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Data Info */}
      <div className="mt-4 text-sm text-gray-600">
        Showing {totalRows === 0 ? 0 : startIdx + 1}
        {shouldPaginate ? `–${endIdx}` : ""} of {data.length} entries
        {searchTerm && ` (filtered by: "${searchTerm}")`}
      </div>
    </div>
  );
};

export default FilteredTableComponent;
