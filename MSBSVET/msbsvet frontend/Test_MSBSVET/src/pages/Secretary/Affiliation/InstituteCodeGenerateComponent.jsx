import { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FilteredTableComponent from "../../../Component/formcomponent/FilteredTableComponent";
import InstituteDetailsCard from "../../../Component/formcomponent/InstituteDetailsCard";
import { ThemeContext } from "../../../Component/Context/ThemeContext";
import { useLoading } from "../../../Hooks/useLoading";
import agent from "../../../lib/api/agent";
import Swal from "sweetalert2";

import { getIp } from "../../../Endpoints_All/Utils/fileUpload";

import {
    GetInspectionUnitDetails, GenerateInstituteCode, GetInstituteCodeDetails
} from "../../../Endpoints_All/NewInstituteApprovalProcess/NewInstituteApprovalProcess";

function InstituteCodeGenerateComponent() {

    const location = useLocation();
    const navigate = useNavigate();

    const params = new URLSearchParams(location.search);

    const userLoginID = params.get("p1");
    const instituteID = params.get("p2");

    const { color } = useContext(ThemeContext);
    const { startLoading, stopLoading } = useLoading();

    const [ipAddress, setIpAddress] = useState("0.0.0.0");


    const [isNewInstitute, setIsNewInstitute] = useState(false);
    const [isNewCodeGenerated, setIsNewCodeGenerated] = useState(false);
    const [courseData, setCourseData] = useState([]);

    const [districtCode, setDistrictCode] = useState("");
    const [lastInstituteCode, setLastInstituteCode] = useState("");
    const [recommendedCode, setRecommendedCode] = useState("");

    useEffect(() => {
        const fetchData = async () => {

            if (!instituteID) return;

            try {

                startLoading();

                const [inspectionResponse, codeResponse] = await Promise.all([

                    // Course Details
                    agent.get(GetInspectionUnitDetails, {
                        params: {
                            instituteId: instituteID,
                            approvalIDFlag: -1,
                        },
                    }),

                    // Institute Code Details
                    agent.get(GetInstituteCodeDetails, {
                        params: {
                            instituteID: instituteID,
                        },
                    }),
                ]);

                //===========================
                // Course Grid
                //===========================
                if (inspectionResponse.data.Status === "Success") {

                    const tableData = inspectionResponse.data.Data.map((item, index) => ({
                        srNo: index + 1,
                        course:
                            item.CourseWithCourseCode ||
                            item.Course ||
                            "",
                        approvedUnits: item.ApprovedUnits,
                        recommendedUnits: item.RecommendedUnitsByBoard,
                        category: item.ApprovedCategory || "NA",
                    }));

                    setCourseData(tableData);
                }

                //===========================
                // Institute Code Details
                //===========================
                if (codeResponse.data.Status === "Success") {

                    const data = codeResponse.data.Data[0];

                    if (data) {

                        // Existing / New Institute
                        setIsNewInstitute(data.IsExistingInstitute === "No");

                        // Code Generated or not
                        setIsNewCodeGenerated(Number(data.IsNewCodeGenerated) === 1);

                        setDistrictCode(data.DistrictCode || "");
                        setLastInstituteCode(data.LastInstituteCodeInDistrict || "");
                        setRecommendedCode(data.InstituteCode || "");
                    }
                }

            } catch (error) {

                console.log(error);

            } finally {

                stopLoading();
            }
        };

        fetchData();
        fetchIP();

    }, [instituteID]);

    const fetchIP = async () => {
        try {
            const response = await agent.get(getIp, {
                headers: { accept: "*/*" },
            });
            if (response.data?.ip) {
                setIpAddress(response.data.ip);
            } else {
                setIpAddress("0.0.0.0");
            }
        } catch (error) {
            console.error("Error fetching IP:", error);
            setIpAddress("0.0.0.0");
        }
    };



    const verificationColumns = [

        {
            key: "SN",
            header: "S.N.",
            selector: row => row.srNo,
            center: true,
            width: "80px",
        },

        {
            key: "course",
            header: "course",
            selector: row => row.course,
            center: true,
        },

        {
            key: "approvedUnits",
            header: "Approved Units (A)",
            selector: row => row.approvedUnits,
            center: true,
        },

        {
            key: "recommendedUnits",
            header: "Board Recommended Units",
            selector: row => row.recommendedUnits,
            center: true,
        },

        {
            key: "category",
            header: "Approved Category",
            selector: row => row.category,
            center: true,
        },

    ];



    const renderCell = (column, row) => {

        if (typeof column.selector === "function") {

            return column.selector(row);

        }

        return row[column.key];

    };



    const handleGenerateCode = async () => {

        try {

            const response = await agent.post(
                `${GenerateInstituteCode}?instituteID=${instituteID}&msbvCollegeID=${recommendedCode}&IpAddress=${ipAddress}`
            );

            if (response.data.Status === "Success") {

                Swal.fire(
                    "Success",
                    response.data.Message,
                    "success"
                );

                // Hide Generate Button
                setIsNewCodeGenerated(true);

            } else {

                Swal.fire(
                    "Error",
                    response.data.Message,
                    "error"
                );
            }

        } catch (error) {

            Swal.fire(
                "Error",
                "Unable to generate institute code.",
                "error"
            );
        }
    };


    const handleClose = () => {

        navigate(-1);

    };




    return (
        <div className="p-4">

            <fieldset className="rounded border border-gray-300 p-4 bg-white shadow-sm">

                <legend
                    className={`rounded border border-gray-300 ${color} px-4 py-1 text-xl font-bold text-white`}
                >
                    Institute Code Generation
                </legend>

                <div className="mb-6">
                    <InstituteDetailsCard instituteCode={userLoginID} />
                </div>

                <FilteredTableComponent
                    data={courseData}
                    columns={verificationColumns}
                    searchable={false}
                    sortable={false}
                    exportable={false}
                    showSearch={false}
                    showExport={false}
                    renderCell={renderCell}
                    maxHeight="500px"
                    title="Verification Details"
                />

                <div className="mt-8 rounded-lg border bg-gray-50 p-6">

                    <div className="mb-6">

                        <label className="font-semibold text-lg">
                            Whether Existing Institute or New Institute
                        </label>

                        <div className="mt-3 flex gap-10">

                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    checked={!isNewInstitute}
                                    readOnly
                                    //onChange={() => setIsNewInstitute(false)}
                                />
                                <span>Existing Institute</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    checked={isNewInstitute}
                                    readOnly
                                   // onChange={() => setIsNewInstitute(true)}
                                />
                                <span>New Institute</span>
                            </label>

                        </div>

                    </div>

                    {isNewInstitute ? (

                        <>
                            <h3 className="text-lg font-semibold mb-6">
                                New Institute Code Generation
                            </h3>

                            <div className="grid grid-cols-3 gap-y-5 items-center">

                                <label className="font-medium">
                                    District Code
                                </label>

                                <div>{districtCode}</div>

                                <div></div>
                                
                                {isNewCodeGenerated == 0 && (
                                    <>
                                        <label className="font-medium">
                                            Last Institute Code
                                        </label>

                                        <div>{lastInstituteCode}</div>
                                        <div></div>
                                    </>
                                )}
                                
                                {!isNewCodeGenerated ? (
                                    <>
                                        <label className="font-medium">
                                            Recommended Code
                                        </label>
                                    </>
                                ) : (
                                    <>
                                        <label className="font-medium">
                                            New Institute Code
                                        </label>
                                    </>
                                )}
                                

                                <div className="flex items-center gap-3">

                                    <input
                                        type="text"
                                        value={recommendedCode}
                                        readOnly
                                        className="border rounded px-3 py-2 w-60 bg-white"
                                    />

                                    {!isNewCodeGenerated && (
                                        <button
                                            type="button"
                                            onClick={handleGenerateCode}
                                            className={`${color} text-white px-5 py-2 rounded hover:opacity-90`}
                                        >
                                            Generate Code
                                        </button>
                                    )}

                                </div>

                            </div>

                            

                        </>

                    ) : (

                        <>
                            <h3 className="text-lg font-semibold mb-6">
                                Existing Institute
                            </h3>

                            <div className="grid grid-cols-2 gap-y-5">

                                <label className="font-medium">
                                    District Code
                                </label>

                                <div>{districtCode}</div>

                                <label className="font-medium">
                                    Last Institute Code
                                </label>

                                <div>{lastInstituteCode}</div>

                                <label className="font-medium">
                                    Recommended Code
                                </label>

                                <div>{recommendedCode}</div>

                            </div>

                        </>

                    )}

                    <div className="flex justify-center mt-10">

                        <button
                            type="button"
                            onClick={handleClose}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-2 rounded"
                        >
                            Close
                        </button>

                    </div>

                </div>

            </fieldset>

        </div>
    );
}

export default InstituteCodeGenerateComponent;
