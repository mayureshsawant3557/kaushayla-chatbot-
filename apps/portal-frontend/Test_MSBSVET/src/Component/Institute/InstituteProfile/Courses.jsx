import React, { useContext, useState, useEffect } from "react";
import { ThemeContext } from "../../Context/ThemeContext";
import FilteredTableComponent from "../../formcomponent/FilteredTableComponent";
import { FaBook } from "react-icons/fa";
import { useAuth } from "../../../Hooks/AuthContext";
import agent from '../../../lib/api/agent';
import Swal from "sweetalert2";
import { useLoading } from "../../../Hooks/useLoading";
import { GetInstituteIDByInstituteCode } from "../../../Endpoints_All/Base/Institute";
import { useNavigate } from "react-router-dom";
import { getDeviceIP } from "../../../utils/CommonHelper";

const Courses = () => {
    const { color } = useContext(ThemeContext);
    const { userInfo } = useAuth();
    const { startLoading, stopLoading, isLoading } = useLoading();
    const navigate = useNavigate();
    const [coursesData, setCoursesData] = useState([]);
     const [ipAddress, setIpAddress] = useState("0.0.0.0");

    // Table columns configuration matching FilteredTableComponent structure
    const tableColumns = [
        {
            key: "serialNo",
            header: "S.N.",
            sortable: true,
            width: "60px",
            headerClassName: "text-center",
            className: "text-center"
        },
        {
            key: "sector",
            header: "Sector",
            sortable: true,
            width: "200px",
            headerClassName: "text-left",
            className: "text-left"
        },
        {
            key: "courseType",
            header: "Course Type",
            sortable: true,
            width: "150px",
            headerClassName: "text-left",
            className: "text-left"
        },
        {
            key: "course",
            header: "Course",
            sortable: true,
            width: "350px",
            headerClassName: "text-left",
            className: "text-left"
        },
        {
            key: "approvedUnits",
            header: "Approved Units",
            sortable: true,
            width: "150px",
            headerClassName: "text-center",
            className: "text-center"
        },
        {
            key: "unitNo",
            header: "Unit No.",
            sortable: true,
            width: "100px",
            headerClassName: "text-center",
            className: "text-center"
        },
        {
            key: "shift",
            header: "Shift",
            sortable: true,
            width: "100px",
            headerClassName: "text-center",
            className: "text-center"
        },
        {
            key: "firstApproval",
            header: "First Approval",
            sortable: true,
            width: "150px",
            headerClassName: "text-center",
            className: "text-center"
        },
        {
            key: "renewalUpto",
            header: "Renewal Upto",
            sortable: true,
            width: "150px",
            headerClassName: "text-center",
            className: "text-center"
        },
        {
            key: "inspectionFee",
            header: "Inspection Fee",
            sortable: true,
            width: "130px",
            headerClassName: "text-center",
            className: "text-center"
        }
    ];

    useEffect(() => {
        fetchCoursesData();
        fetchIP();
        // eslint-disable-next-line
    }, []);

     const fetchIP = async () => {
        try {
            const ip = await getDeviceIP();
            setIpAddress(ip);
        } catch (err) {
        }
        };

    const fetchCoursesData = async () => {
        startLoading();
        try {
            // Step 1: Get Institute ID
            const instituteCode = userInfo?.UserLoginID;

            const resInstitute = await agent.get(
                `${GetInstituteIDByInstituteCode}?InstituteCode=${instituteCode}`
            );

            if (!resInstitute.data?.Data) {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Institute not found.",
                    confirmButtonColor: "#d33"
                });
                return;
            }

            const instituteId = resInstitute.data.Data;

            // Step 2: Fetch Proposed Course Unit Details
            const payload = {
                instituteId: instituteId,
                userLoginID: "0",
                pageCode: "ExistingInstitute",
                itemId: "0",
                ipAddress: ipAddress
            };

            const response = await agent.post(
                "https://localhost:44321/api/ExistingInstitute/GetProposedCourseUnitDetails",
                payload
            );

            if (response?.data?.Status === "Success" &&
                response.data?.Data?.Table &&
                response.data.Data.Table.length > 0) {

                // Transform API data to match table structure
                const transformedData = response.data.Data.Table.map((course, index) => ({
                    id: course.CourseID || index,
                    serialNo: index + 1,
                    sector: course.Sector || "",
                    courseType: course.CourseType || "",
                    course: course.CourseWithCourseCode || `<${course.CourseCode}> - <${course.Course}>`,
                    courseCode: course.CourseCode,
                    courseName: course.Course,
                    courseId: course.CourseID,
                    approvedUnits: course.ApprovedUnits || "",
                    unitNo: course.UnitNo || "",
                    shift: getShiftName(course.ShiftId),
                    shiftId: course.ShiftId,
                    firstApproval: course.FirstApproval ? formatDate(course.FirstApproval) : "",
                    renewalUpto: course.RenewalUpto ? formatDate(course.RenewalUpto) : "",
                    inspectionFee: course.InspectionFee || "",
                    isEditAllowed: course.IsEditAllowed || false,
                    isDeleteAllowed: course.IsDeleteAllowed || false,
                    isViewAllowed: course.IsViewAllowed || 0,
                    // Keep original data for reference
                    _original: course
                }));

                setCoursesData(transformedData);
            } else {
                // No courses found
                setCoursesData([]);
                Swal.fire({
                    icon: "info",
                    title: "No Courses Found",
                    text: "No proposed course unit details found for this institute.",
                    confirmButtonColor: "#3085d6"
                });
            }
        } catch (error) {
            setCoursesData([]);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Failed to fetch courses data. Please try again.",
                confirmButtonColor: "#d33"
            });
        } finally {
            stopLoading();
        }
    };

    const getShiftName = (shiftId) => {
        const shifts = {
            "1": "Morning",
            "2": "Afternoon",
            "3": "Evening",
            "4": "Night"
        };
        return shifts[shiftId?.toString()] || shiftId || "";
    };

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    // Custom cell renderer for special columns
    const renderCell = (row, column) => {
        if (column.key === "serialNo") {
            return <span className="text-xs font-medium">{row.serialNo}</span>;
        }

        if (column.key === "course") {
            return (
                <div className="text-xs">
                    <span>{row.course}</span>
                </div>
            );
        }

        if (column.key === "inspectionFee") {
            const status = row.inspectionFee;
            let statusClass = "bg-gray-100 text-gray-700";

            if (status === "Expired") {
                statusClass = "bg-red-100 text-red-700";
            } else if (status === "Paid") {
                statusClass = "bg-green-100 text-green-700";
            } else if (status === "Pending") {
                statusClass = "bg-yellow-100 text-yellow-700";
            }

            return (
                <div className="flex justify-center">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusClass}`}>
                        {status || "-"}
                    </span>
                </div>
            );
        }

        // Default rendering for other columns
        const value = row[column.key];
        return <span className="text-xs">{value || "-"}</span>;
    };

    // Export filter - only export visible/filtered data
    const exportFilter = (data) => {
        return data;
    };

    // Custom CSV Download handler
    const downloadCSV = () => {
        try {
            if (coursesData.length === 0) {
                Swal.fire({
                    icon: "warning",
                    title: "No Data",
                    text: "No data available to export.",
                    confirmButtonColor: "#3085d6"
                });
                return;
            }

            const headers = tableColumns.map((col) => col.header).join(",");
            const rows = coursesData
                .map((row) =>
                    tableColumns
                        .map((col) => {
                            if (col.key === "course") {
                                return `"${row.course}"`;
                            }
                            const value = row[col.key];
                            return `"${value !== null && value !== undefined ? value : ""}"`;
                        })
                        .join(",")
                )
                .join("\n");

            const csv = `${headers}\n${rows}`;
            const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `Courses_${userInfo?.InstituteID || "Institute"}_${new Date().getTime()}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Export Failed",
                text: "An error occurred while exporting to CSV.",
                confirmButtonColor: "#d33"
            });
        }
    };

    // Excel Template Download handler
    const downloadExcelTemplate = () => {
        Swal.fire({
            icon: "info",
            title: "Template Download",
            text: "This is a read-only view. Template download is not applicable.",
            confirmButtonColor: "#3085d6"
        });
    };

    const handleBack = () => {
        window.history.back();
    };

    const handleSaveNext = () => {
        navigate("/institute/dashboard");
    };

    if (isLoading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-white/60 z-50 h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#00c3f9]" />
            </div>
        );
    }

    return (
        <div className="w-full p-4">
            <fieldset className="rounded-lg border border-gray-300 bg-white shadow-lg">
                <legend
                    className={`flex ${color} items-center text-base font-semibold text-white border-2 border-gray-300 px-3 py-1.5 rounded-md ml-4`}
                >
                    <FaBook className="mr-2 text-white" />
                    Courses
                </legend>

                <div className="px-4 pb-3 pt-3">
                    {/* Filtered Table Component */}
                    <FilteredTableComponent
                        data={coursesData}
                        columns={tableColumns}
                        filterColumns={["sector", "courseType", "course", "shift"]}
                        onRowChange={null}
                        customButtons={[]}
                        title=""
                        exportFileName={`Courses_${userInfo?.InstituteID || "Institute"}`}
                        onExportFilter={exportFilter}
                        tableId="courses-table"
                        searchable={true}
                        sortable={true}
                        showExcelTemplate={false}
                        exportable={true}
                        showSearch={true}
                        showExport={true}
                        className="mt-2"
                        downloadCSV={downloadCSV}
                        downloadPDF={null} // Let FilteredTableComponent handle PDF
                        downloadTemplate={downloadExcelTemplate}
                        renderCell={renderCell}
                        maxHeight="500px"
                        stickyHeader={true}
                    />

                    {/* Action Buttons - Centered */}
                    <div className="flex justify-center items-center gap-4 mt-3">
                        <button
                            type="button"
                            className="bg-[#00c3f9] hover:bg-[#00a8d6] text-white px-6 py-2 rounded font-semibold text-sm"
                            onClick={handleBack}
                        >
                            Back
                        </button>
                        <button
                            type="button"
                            className="bg-[#28a745] hover:bg-[#218838] text-white px-6 py-2 rounded font-semibold text-sm"
                            onClick={handleSaveNext}
                        >
                            Save and Next
                        </button>
                        {/*<button*/}
                        {/*    type="button"*/}
                        {/*    className="bg-[#28a745] hover:bg-[#218838] text-white px-6 py-2 rounded font-semibold text-sm"*/}
                        {/*    onClick={handleClose}*/}
                        {/*>*/}
                        {/*    Close*/}
                        {/*</button>*/}
                    </div>
                </div>
            </fieldset>
        </div>
    );
};

export default Courses;
