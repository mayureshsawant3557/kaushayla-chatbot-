import React, { useContext, useState, useEffect } from "react";
import { ThemeContext } from "../../Context/ThemeContext";
import FilteredTableComponent from "../../formcomponent/FilteredTableComponent";
import { FaBook } from "react-icons/fa";
import { useAuth } from "../../../Hooks/AuthContext";
import agent from "../../../lib/api/agent";
import Swal from "sweetalert2";
import { useLoading } from "../../../Hooks/useLoading";
import { GetInstituteIDByInstituteCode } from "../../../Endpoints_All/Base/Institute";
import { GetProposedCourseUnitDetailsForNationalTrade } from "../../../Endpoints_All/Institute/existinginstitute";
import { useNavigate } from "react-router-dom";
import { getDeviceIP } from "../../../utils/CommonHelper";

const Courses = () => {
    const { color } = useContext(ThemeContext);
    const { userInfo } = useAuth();
    const { startLoading, stopLoading, isLoading } = useLoading();
    const navigate = useNavigate();

    const [coursesData, setCoursesData] = useState([]);
    const [groupedCourses, setGroupedCourses] = useState([]);
     const [ipAddress, setIpAddress] = useState("0.0.0.0");

    // Updated Columns
    const tableColumns = [
        {
            key: "serialNo",
            header: "S.N.",
           // sortable: true,
            width: "70px",
            headerClassName: "text-center",
            className: "text-center",
            sortable: false,
        },
        //{
        //    key: "courseType",
        //    header: "Course Type",
        //    width: "320px"
        //},
        {
            key: "courseName",
            header: "Course Name",
           // sortable: true,
            width: "280px"
        },
        {
            key: "unitNo",
            header: "Unit No",
           
            width: "90px",
            headerClassName: "text-center",
            className: "text-center"
        },
        {
            key: "shift",
            header: "Shift",
           
            width: "90px",
            headerClassName: "text-center",
            className: "text-center"
        },
        {
            key: "unitID",
            header: "Unit ID",
           // sortable: true,
            width: "100px",
            headerClassName: "text-center",
            className: "text-center"
        },
        {
            key: "unitCategory",
            header: "Unit Category",
           // sortable: true,
            width: "280px",
            headerClassName: "text-center",
            className: "text-center"
        },
        {
            key: "intake",
            header: "Intake",
           // sortable: true,
            width: "100px",
            headerClassName: "text-center",
            className: "text-center"
        },
        {
            key: "durationInSem",
            header: "Duration",
            
            width: "100px",
            headerClassName: "text-center",
            className: "text-center"
        },
        {
            key: "isppp",
            header: "Is PPP",
            
            width: "100px",
            headerClassName: "text-center",
            className: "text-center"
        },
        {
            key: "isdst",
            header: "Is DST",
            
            width: "100px",
            headerClassName: "text-center",
            className: "text-center"
        },
        {
            key: "lastAdmissionYear",
            header: "Last Admission",
           // sortable: true,
            width: "100px",
            headerClassName: "text-center",
            className: "text-center"
        },
        {
            key: "nextAdmissionYear",
            header: "Next Admission",
           // sortable: true,
            width: "100px",
            headerClassName: "text-center",
            className: "text-center"
        },
        //{
        //    key: "approvalFlag",
        //    header: "Approval",
        //    sortable: true,
        //    width: "130px",
        //    headerClassName: "text-center",
        //    className: "text-center"
        //},
        //{
        //    key: "permanantClosed",
        //    header: "Permanent Closed",
        //    sortable: true,
        //    width: "160px",
        //    headerClassName: "text-center",
        //    className: "text-center"
        //}
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

            const instituteCode = userInfo?.UserLoginID;

            // Step 1: Get Institute ID
            const resInstitute = await agent.get(
                `${GetInstituteIDByInstituteCode}?InstituteCode=${instituteCode}`
            );

            if (!resInstitute?.data?.Data) {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Institute not found."
                });
                return;
            }

            const instituteId = resInstitute.data.Data;

            // Step 2: Fetch Course Details
            const payload = {
                instituteId,
                userLoginID: "0",
                pageCode: "ExistingInstitute",
                itemId: "0",
                ipAddress: ipAddress
            };

            const response = await agent.post(
                GetProposedCourseUnitDetailsForNationalTrade,
                payload
            );
            //console.log("Course Details Response:", response);

            const list = response?.data?.Data?.Table || [];

            if (list.length > 0) {
                const transformedData = list.map((item, index) => ({
                    id: item.ID || index,
                    serialNo: index + 1,

                    courseType: item.CourseType || "",
                    courseName: item.CourseName || "",

                    unitNo: item.UnitNo || "",
                    shift: item.ShiftID,//getShiftName(item.ShiftID)
                    unitID: item.UnitID || "",
                    unitCategory : item.UnitCategory,

                    intake: item.Intake || "",
                    durationInSem: item.DurationInSem || "",

                    lastAdmissionYear: item.LastAdmissionYear || "",
                    nextAdmissionYear: item.NextAdmissionYear || "",
                    isppp: item.ISPPP,
                    isdst: item.ISPPP,

                    approvalFlag: item.ApprovalFlag || "-",
                    permanantClosed: item.PermanantClosed || "NO",

                    _original: item
                }));

                setCoursesData(transformedData);

                // Group By CourseTypeID
                const groupedData = Object.values(
                    transformedData.reduce((acc, item) => {
                        const key = item._original.CourseTypeID;

                        if (!acc[key]) {
                            acc[key] = {
                                courseTypeId: key,
                                courseTypeName: item.courseType,
                                data: []
                            };
                        }

                        acc[key].data.push(item);

                        return acc;
                    }, {})
                );

                const courseTypeOrder = [
                    "NATIONAL TRADE CERTIFICATE",
                    "STATE TRADE CERTIFICATE",
                    "BIFOCAL",
                    "CERTIFICATE COURSE",
                    "DIPLOMA COURSE",
                    "ADVANCE DIPLOMA"
                ];

                groupedData.sort((a, b) => {
                    const indexA = courseTypeOrder.indexOf(
                        a.courseTypeName?.toUpperCase()
                    );

                    const indexB = courseTypeOrder.indexOf(
                        b.courseTypeName?.toUpperCase()
                    );

                    return indexA - indexB;
                });

                setGroupedCourses(groupedData);
            } else {
                setCoursesData([]);
            }
        } catch (error) {

            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Failed to load course details."
            });
        } finally {
            stopLoading();
        }
    };

    

    const renderCell = (row, column) => {
        if (column.key === "serialNo") {
            return (
                <span className="text-xs font-semibold">
                    {row.serialNo}
                </span>
            );
        }

        if (column.key === "isppp") {
            return (
                <span className="px-2 py-1 rounded text-xs">
                    {row.isppp}
                </span>
            );
        }

        if (column.key === "isdst") {
            return (
                <span className="px-2 py-1 rounded text-xs">
                    {row.isdst}
                </span>
            ); 
        }

        return (
            <span className="text-xs">
                {row[column.key] || "-"}
            </span>
        );
    };

    //const downloadCSV = () => {
    //    if (coursesData.length === 0) {
    //        Swal.fire({
    //            icon: "warning",
    //            title: "No Data",
    //            text: "No records available."
    //        });
    //        return;
    //    }

    //    const headers = tableColumns.map((x) => x.header).join(",");

    //    const rows = coursesData
    //        .map((row) =>
    //            tableColumns
    //                .map((col) => `"${row[col.key] || ""}"`)
    //                .join(",")
    //        )
    //        .join("\n");

    //    const csv = `${headers}\n${rows}`;

    //    const blob = new Blob([csv], {
    //        type: "text/csv;charset=utf-8;"
    //    });

    //    const url = URL.createObjectURL(blob);

    //    const a = document.createElement("a");
    //    a.href = url;
    //    a.download = "Courses.csv";
    //    a.click();

    //    URL.revokeObjectURL(url);
    //};

    //const handleBack = () => {
    //    window.history.back();
    //};

    //const handleSaveNext = () => {
    //    navigate("/institute/dashboard");
    //};


    const handleClose = () => {
        navigate("/institute/dashboard");
};


    if (isLoading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-white/60 z-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#00c3f9]" />
            </div>
        );
    }

    return (
        <div className="w-full p-4">
            <fieldset className="rounded-lg border border-gray-300 bg-white shadow-lg">
                <legend
                    className={`flex ${color} items-center text-base font-semibold text-white border px-3 py-1.5 rounded-md ml-4`}
                >
                    <FaBook className="mr-2" />
                    Course/ Trade
                </legend>

                <div className="p-4">
                    {groupedCourses.map((group, index) => (
                        <div key={group.courseTypeId} className="mb-8">
                            <FilteredTableComponent
                                data={group.data}
                                columns={tableColumns}
                                filterColumns={[
                                    "courseName",
                                    "courseType",
                                    "unitCategory",
                                    "unitID",
                                    "shift",
                                    "intake",
                                    "durationInSem",
                                    "lastAdmissionYear",
                                    "nextAdmissionYear"
                                ]}
                                searchable={true}
                                sortable={true}
                                showSearch={true}
                                showExport={true}
                                exportable={true}
                                stickyHeader={true}
                                maxHeight="500px"
                                renderCell={renderCell}
                                downloadCSV={true}
                                exportFileName={group.courseTypeName}
                                tableTitle={`COURSE CATEGORY :  ${group.courseTypeName}`}
                            />
                        </div>
                    ))}


                    <div className="flex justify-center gap-4 mt-4">
                        <button
                            type="button"
                            className="bg-[#00c3f9] hover:bg-[#00a8d6] text-white px-6 py-2 rounded font-semibold text-sm"
                            onClick={handleClose}
                        >
                            close
                        </button>
                        </div>
                    {/*<div className="flex justify-center gap-4 mt-4">*/}
                    {/*    <button*/}
                    {/*        type="button"*/}
                    {/*        className="bg-[#00c3f9] hover:bg-[#00a8d6] text-white px-6 py-2 rounded font-semibold text-sm"*/}
                    {/*        onClick={handleBack}*/}
                    {/*    >*/}
                    {/*        Back*/}
                    {/*    </button>*/}

                    {/*    <button*/}
                    {/*        type="button"*/}
                    {/*        className="bg-[#28a745] hover:bg-[#218838] text-white px-6 py-2 rounded font-semibold text-sm"*/}
                    {/*        onClick={handleSaveNext}*/}
                    {/*    >*/}
                    {/*        Save and Next*/}
                    {/*    </button>*/}
                    {/*</div>*/}
                </div>
            </fieldset>
        </div>
    );
};

export default Courses;