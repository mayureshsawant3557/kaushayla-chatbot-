import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";

import agent from "../../../lib/api/agent";
import Swal from "sweetalert2";
import FilteredTableComponent from "../../formcomponent/FilteredTableComponent";
import { ThemeContext } from "../../Context/ThemeContext";
import { useLoading } from "../../../Hooks/useLoading";
import {
    SaveInspectionUnitDetails,
    GetInspectionUnitDetails,
} from "../../../Endpoints_All/NewInstituteApprovalProcess/NewInstituteApprovalProcess";
import { GetInstituteIDByInstituteCode } from "../../../Endpoints_All/Base/Institute";
import { getIp } from "../../../Endpoints_All/Utils/fileUpload";

import { UpdateInstituteInspectionVerificationStatus } from "../../../Endpoints_All/Base/DVETO";
import { useInspectionLock } from "../../../Hooks/useInspectionLock";

import DocumentLink from "../../formcomponent/OpenDocumentComponent";
import RequiredTemplates from "../../formcomponent/RequiredTemplates";

import InspectionStatusComponent from "../../formcomponent/InspectionStatusComponent";
import { useAuth } from "../../../Hooks/AuthContext";

import { useNoticePopup } from "../../../Component/formcomponent/NoticePop";

// Common Architecture Imports
import InstituteFlowLayout from "../../../Component/InstituteFlow/InstituteFlowLayout";
import { usePagePermission } from "../../../Hooks/usePagePermission";
import { useInstituteFlow } from "../../../Hooks/useInstituteFlow";

const UnitsForInspection = () => {
    const { color } = useContext(ThemeContext);
    const { startLoading, stopLoading, isLoading } = useLoading();
    const { userInfo } = useAuth();
    const loginID = userInfo?.UserLoginID;

    // Centralized Permissions
    const {
        userTypeID,
        isViewer,
        canEdit,
        canSave,
    } = usePagePermission();

    const { showNoticePopup } = useNoticePopup();
    const [instituteId, setInstituteId] = useState(null);
    const [courseData, setCourseData] = useState([]);
    const [ipAddress, setIpAddress] = useState("0.0.0.0");
    const [inspectionStatus, setInspectionStatus] = useState({
        status: "",
        remark: "",
    });

    const params = new URLSearchParams(window.location.search);
    const p1 = params.get("P1");
    const p2 = params.get("P2");

    // Centralized Navigation Flow
    const { goNext, goBack, handleClose } = useInstituteFlow(
        "UnitsForInspection",
        p1,
        p2
    );

    // Workflow Lock State
    const { isLocked, eligibilityData } = useInspectionLock(
        instituteId,
        loginID,
        "UnitsForInspection"
    );

    // Added for validation over inspection status
    const inspectionref = useRef();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        showNoticePopup({
            title: "सूचना",
            icon: null,
            width: 1200,
            content: [
                {
                    text: "1. संस्था एका वेळी १ युनिटमध्ये ३० विद्यार्थ्यांची फक्त १ बॅच चालवू शकते.",
                },
                {
                    text: "2. संस्था एकाच प्रशिक्षण पायाभूत सुविधांचा (Training Infrastructure) वापर करून वेगवेगळ्या युनिट्सच्या अनेक बॅचेस शिफ्टमध्ये चालवू शकते.",
                },
                {
                    text: "3. प्रतिदिन कमाल बॅचेस (Max. batches per day): शिफ्टमध्ये प्रतिदिन चालविता येणाऱ्या अनेक युनिट्सच्या बॅचेसची कमाल संख्या दर्शविते.",
                },
                {
                    text: "4. आवश्यक कमाल प्रशिक्षण सेटअप्स (Max Training setups required): शिफ्टमध्ये अनेक बॅचेस चालविण्यासाठी संस्थेत आवश्यक असलेल्या प्रशिक्षण सेटअप्सची कमाल संख्या दर्शविते.",
                },
                {
                    text: "5. उदाहरणार्थ:",
                },
                {
                    text: "a) पूर्णवेळ पदविका अभ्यासक्रमांसाठी (Full Time Diploma Course), संस्था २ शिफ्टमध्ये दररोज ७ तासांप्रमाणे २ युनिट्सच्या कमाल २ बॅचेस चालवू शकते आणि त्यासाठी फक्त १ प्रशिक्षण सेटअप आवश्यक असेल. तिसऱ्या युनिटच्या तिसऱ्या बॅचसाठी अतिरिक्त प्रशिक्षण सेटअप आवश्यक असून, ३ युनिट्सच्या ३ बॅचेससाठी एकूण २ प्रशिक्षण सेटअप्स लागतील.",
                    className: "ml-3",
                },
                {
                    text: "b) अर्धवेळ / अल्पमुदत प्रमाणपत्र अभ्यासक्रमासाठी (Part Time / Short Term Certificate Course), संस्था प्रतिदिन प्रशिक्षण तासांनुसार अनेक युनिट्सच्या ४ ते ८ बॅचेस प्रतिदिन चालवू शकते आणि त्यासाठी फक्त १ प्रशिक्षण सेटअप आवश्यक असेल.",
                    className: "ml-3",
                },

                {
                    text: "6. सर्व प्रशिक्षण पायाभूत सुविधांची गणना निरिक्षण युनिट्सच्या (Inspection Units) आधारे केली जाईल.",
                },
                {
                    text: "7. संस्थेने उपलब्ध प्रशिक्षण सेटअप्सनुसार निरिक्षण युनिट्स (Inspection Units) नमूद करणे आवश्यक आहे.",
                },
                {
                    text: "8. सदर वेब पेजवरील तक्त्यात दर्शविलेले निरिक्षण शुल्क व सुरक्षा अनामत रक्कम (Security Deposit) केवळ नव्याने प्रस्तावित युनिट्सच्या (newly Proposed Units) आधारे गणना केलेली आहे.",
                },
            ],
            confirmText: "OK",
        });
    }, [showNoticePopup]);

    // Fetch IP Address
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

    // Fetch Institute ID
    useEffect(() => {
        const fetchInstituteId = async () => {
            try {
                startLoading();
                const response = await agent.get(GetInstituteIDByInstituteCode, {
                    params: { InstituteCode: loginID },
                });
                if (response.data.Status === "Success") {
                    setInstituteId(response.data.Data);
                }
            } catch (error) {
                console.error("Error fetching Institute ID:", error);
            } finally {
                stopLoading();
            }
        };

        if (userTypeID === 14 || userTypeID === 501 || (userTypeID === 81 && p1)) {
            setInstituteId(p1);
        } else if (loginID) {
            fetchInstituteId();
        }

        fetchIP();
    }, [loginID, userTypeID, p1]);

    // Fetch Inspection Unit Details
    useEffect(() => {
        const fetchInspectionUnitDetails = async () => {
            if (!instituteId) return;

            try {
                startLoading();
                const response = await agent.get(GetInspectionUnitDetails, {
                    params: { instituteId: instituteId },
                });

                if (response.data.Status === "Success") {
                    const data = response.data.Data.map((item) => ({
                        ...item,
                        InspectionUnits: item.InspectionUnits ?? item.LOITotalUnits,
                        MaxTraningSetupRequired: item.MaxTraningSetupRequired,
                    }));
                    setCourseData(data);
                }
            } catch (error) {
                console.error("Error fetching Inspection Unit Details:", error);
            } finally {
                stopLoading();
            }
        };

        fetchInspectionUnitDetails();
    }, [instituteId]);

    // Handle Inspection Units Change
    const handleInspectionUnitsChange = (value, rowIndex) => {
        if (isViewer || isLocked || !canEdit) return;

        const updatedData = [...courseData];

        if (value === "" || value === null || value === undefined) {
            updatedData[rowIndex].InspectionUnits = "";
            updatedData[rowIndex].MaxTraningSetupRequired = 0;
            setCourseData(updatedData);
            return;
        }

        const inspectionUnits = parseInt(value);
        const LOITotalUnits = updatedData[rowIndex].LOITotalUnits;
        const approvedUnits = updatedData[rowIndex].ApprovedUnits;

        if (isNaN(inspectionUnits) || inspectionUnits < 0) {
            return;
        }

        if (inspectionUnits > LOITotalUnits) {
            Swal.fire({
                icon: "warning",
                title: "Alert!",
                text: "Inspection Units cannot be more than Total Units",
                confirmButtonText: "OK",
            });
            return;
        }

        if (inspectionUnits < approvedUnits) {
            Swal.fire({
                icon: "warning",
                title: "Alert!",
                text: "Inspection Units cannot be less than already Approved Units",
                confirmButtonText: "OK",
            });
            return;
        }

        updatedData[rowIndex].InspectionUnits = inspectionUnits;
        updatedData[rowIndex].MaxTraningSetupRequired = Math.ceil(
            inspectionUnits / updatedData[rowIndex].MaxBatchesPerDay,
        );

        setCourseData(updatedData);
    };

    // Calculate Totals
    const calculateTotals = () => {
        const totals = {
            ApprovedUnits: 0,
            LOIProposedUnits: 0,
            LOITotalUnits: 0,
            InspectionUnits: 0,
            MaxTraningSetupRequired: 0,
        };

        courseData.forEach((course) => {
            totals.ApprovedUnits += course.ApprovedUnits || 0;
            totals.LOIProposedUnits += course.LOIProposedUnits || 0;
            totals.LOITotalUnits += course.LOITotalUnits || 0;
            totals.InspectionUnits +=
                (course.InspectionUnits === ""
                    ? 0
                    : parseInt(course.InspectionUnits)) || 0;
            totals.MaxTraningSetupRequired += course.MaxTraningSetupRequired || 0;
        });

        return totals;
    };

    // Prepare Table Data
    const prepareTableData = () => {
        const totals = calculateTotals();

        const dataRows = courseData.map((course, index) => ({
            sn: index + 1,
            course: course.ModelCurriculum ? (
                <DocumentLink
                    documentUrl={course.ModelCurriculum}
                    itemName={course.Course || "Course"}
                    label={course.CourseWithCourseCode || course.Course}
                />
            ) : (
                course.CourseWithCourseCode || course.Course
            ),
            approvedUnits: course.ApprovedUnits,
            loiUnits: course.LOIProposedUnits,
            totalUnits: course.LOITotalUnits,
            inspectionUnits: (
                <div className="flex items-center justify-center">
                    <input
                        type="number"
                        value={course.InspectionUnits === "" ? "" : course.InspectionUnits}
                        onChange={(e) => handleInspectionUnitsChange(e.target.value, index)}
                        className="w-24 px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min={course.ApprovedUnits}
                        max={course.LOITotalUnits}
                        disabled={isLocked || !canEdit || isViewer}
                    />
                </div>
            ),
            maxBatchesPerDay: course.MaxBatchesPerDay,
            maxSetups: course.MaxTraningSetupRequired,
            rowClassName: "",
        }));

        dataRows.push({
            sn: "",
            course: <strong>Total</strong>,
            approvedUnits: <strong>{totals.ApprovedUnits}</strong>,
            loiUnits: <strong>{totals.LOIProposedUnits}</strong>,
            totalUnits: <strong>{totals.LOITotalUnits}</strong>,
            inspectionUnits: <strong>{totals.InspectionUnits}</strong>,
            maxBatchesPerDay: "",
            maxSetups: <strong>{totals.MaxTraningSetupRequired}</strong>,
            rowClassName: "bg-gray-100 font-bold",
        });

        return dataRows;
    };

    const inspectionColumns = [
        { key: "sn", header: "S.N.", className: "text-center", width: "20px" },
        { key: "course", header: "Course", className: "text-left", width: "600px" },
        { key: "approvedUnits", header: "Approved Units (A)", className: "text-center", width: "100px" },
        { key: "loiUnits", header: "LoI Units (B)", className: "text-center", width: "80px" },
        { key: "totalUnits", header: "Total Units (C = A + B)", className: "text-center", width: "100px" },
        {
            key: "inspectionUnits",
            header: (
                <span>
                    Inspection Units <span className="text-red-500">*</span>
                </span>
            ),
            className: "text-center",
            width: "130px",
        },
        { key: "maxBatchesPerDay", header: "Max. batches per day", className: "text-center", width: "110px" },
        { key: "maxSetups", header: "Max Training setups required", className: "text-center", width: "130px" },
    ];

    // Validate Before Save
    const validateData = () => {
        for (let i = 0; i < courseData.length; i++) {
            const course = courseData[i];
            const inspectionUnits = parseInt(course.InspectionUnits);

            if (isNaN(inspectionUnits)) {
                Swal.fire({
                    icon: "warning",
                    title: "Validation Error",
                    text: `Please enter valid Inspection Units for ${course.Course}`,
                    confirmButtonText: "OK",
                });
                return false;
            }

            if (inspectionUnits > course.LOITotalUnits) {
                Swal.fire({
                    icon: "warning",
                    title: "Validation Error",
                    text: `Inspection Units cannot be more than Total Units (${course.TotalUnits}) for ${course.Course}`,
                    confirmButtonText: "OK",
                });
                return false;
            }

            if (inspectionUnits < course.ApprovedUnits) {
                Swal.fire({
                    icon: "warning",
                    title: "Validation Error",
                    text: `Inspection Units cannot be less than Approved Units (${course.ApprovedUnits}) for ${course.Course}`,
                    confirmButtonText: "OK",
                });
                return false;
            }
        }
        return true;
    };

    // Centralized Save / Navigation Handler
    const handleSave = async () => {
        // 501 / View Only / Locked users do not perform save calls
        if (isViewer || !canSave) {
            goNext();
            return;
        }

        if (userTypeID === 14 || userTypeID === 81) {
            const isvalid = inspectionref.current?.validate();
            if (!isvalid) return;

            if (!inspectionStatus.status) {
                Swal.fire("Validation", "Please select status", "warning");
                return;
            }

            if (inspectionStatus.status === "R" && !inspectionStatus.remark) {
                Swal.fire("Validation", "Remark is required when status is Rejected", "warning");
                return;
            }
        }

        if (isLocked) {
            goNext();
            return;
        }

        if (!validateData()) return;

        try {
            startLoading();

            const proposedCourses = courseData.map((course) => ({
                instituteId: instituteId,
                courseId: course.CourseID,
                proposedUnits: course.ProposedUnits || 0,
                approvedUnits: course.ApprovedUnits || 0,
                totalUnits: course.TotalUnits || 0,
                loiProposedUnits: course.LOIProposedUnits || 0,
                loiTotalUnits: course.LOITotalUnits || 0,
                securityDeposit: course.SecurityDeposit || 0,
                inspectionFee: course.InspectionFee || 0,
                inspectionUnits: parseInt(course.InspectionUnits) || 0,
                maxBatchesPerDay: course.MaxBatchesPerDay || 0,
                maxTraningSetupRequired: course.MaxTraningSetupRequired || 0,
                recommendedUnits: parseInt(course.RecommendedUnits) || 0,
                recommendedUnitsByBoard: parseInt(course.RecommendedUnitsByBoard) || 0,
                approvedCategory: course.ApprovedCategory || "",
                approvedCategoryID: parseInt(course.ApprovedCategoryID) || 0,
            }));

            const saveRes = await agent.post(SaveInspectionUnitDetails, {
                instituteID: instituteId,
                proposedCourses,
                createdBy: loginID,
                ipAddress: ipAddress,
            });

            if (saveRes.data.Status !== "Success") {
                throw new Error(saveRes.data.Message || "Failed to save units");
            }

            if (userTypeID === 14 || userTypeID === 81) {
                const statusPayload = {
                    InstituteID: instituteId,
                    PageCode: "UnitsForInspection",
                    Status: inspectionStatus.status,
                    Remark: inspectionStatus.remark || "",
                    CreatedBy: loginID,
                    IpAddress: ipAddress,
                    userTypeID: userTypeID,
                };
                const statusRes = await agent.post(
                    UpdateInstituteInspectionVerificationStatus,
                    statusPayload,
                    {
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                );

                if (statusRes.data?.Status !== "Success") {
                    throw new Error(
                        statusRes.data?.Message || "Failed to update verification status"
                    );
                }
            }

            Swal.fire({
                icon: "success",
                title: "Success",
                text: "Data saved successfully",
                confirmButtonText: "OK",
            }).then(() => {
                goNext();
            });
        } catch (error) {
            console.error("Error:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: error.Message || "Something went wrong",
            });
        } finally {
            stopLoading();
        }
    };

    return (
        <InstituteFlowLayout
            currentPageCode="UnitsForInspection"
            p1={p1}
            p2={p2}
            onSave={handleSave}
            isSaveLoading={isLoading}
            isLocked={isLocked}
            title="Units for Inspection"
            color={color}
        >
            <div className="mt-4">
                <FilteredTableComponent
                    data={prepareTableData()}
                    columns={inspectionColumns}
                    filterColumns={[]}
                    customButtons={[]}
                    title=""
                    exportFileName="Units_For_Inspection"
                    tableId="inspection-units-table"
                    searchable={false}
                    sortable={false}
                    showExcelTemplate={false}
                    exportable={false}
                    showSearch={false}
                    showExport={false}
                    className="mt-3"
                    maxHeight="500px"
                    stickyHeader={true}
                    readOnly={isLocked || !canEdit || isViewer}
                    rowClassName={(row) => row.rowClassName}
                />
            </div>

            <div className="mt-4 rounded-md border border-blue-200 bg-blue-50 p-4 mb-2">
                <p className="text-sm text-blue-700">
                    <span className="font-medium">Note:</span>
                </p>
                <ol className="list-decimal list-inside mt-1 space-y-1 text-sm text-blue-700">
                    <li>Total Units = Approved Units + LoI Units</li>
                    <li>
                        Inspection Units cannot be less than Approved Units and cannot be
                        more than Total Units i.e. Approved Units + LoI Units.
                    </li>
                    <li>
                        For Existing Units both Approved Units and LoI units shall be
                        inspected.
                    </li>
                    <li>
                        However, Inspection Fees and Security Deposit shall be calculated
                        only for New Units i.e. Inspection Units - Approved Units
                    </li>
                </ol>
            </div>

            <RequiredTemplates />

            <div className="mt-4 rounded-md border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm text-blue-700">
                    <span className="font-medium">Note:</span>
                </p>
                <ol className="list-decimal list-inside mt-1 space-y-1 text-sm text-blue-700">
                    <li>
                        Institute can run only 1 Batch of 30 students in 1 Unit at a time.
                    </li>
                    <li>
                        Institute can run multiple batches of different Units in shifts
                        with the same training infrastructure.
                    </li>
                    <li>
                        Max. batches per day: Indicates maximum number of batches of
                        multiple Units in shifts per day.
                    </li>
                    <li>
                        Max Training setups required: Indicates the maximum number of
                        training setups required in institute to run multiple batches in
                        shifts.
                    </li>
                    <li>
                        For example:
                        <ol className="list-[lower-alpha] list-inside ml-4 mt-1 space-y-1">
                            <li>
                                For a Full Time Diploma Course, the Institute can run a
                                maximum of 2 batches of 2 Units for 7 hours per day in 2
                                shifts and shall require only 1 training setup. For the 3rd
                                batch of the 3rd Unit, an additional training setup is
                                required, making a total of 2 training setups for 3 batches of
                                3 Units.
                            </li>
                            <li>
                                For a Part Time / Short Term Certificate Course, the Institute
                                can run 4 to 8 batches per day of multiple Units depending on
                                per-day training hours and shall require only 1 training
                                setup.
                            </li>
                        </ol>
                    </li>
                    <li>
                        All training infrastructure shall be calculated based on the
                        Inspection Units.
                    </li>
                    <li>
                        Institute has to enter Inspection Units depending upon the
                        available training setups.
                    </li>
                    <li>
                        Inspection Fees and Security Deposit displayed in the above table
                        is calculated based on newly Proposed Units only.
                    </li>
                </ol>
            </div>

            {/* Board Status Component (View mode for Board & 501 Viewers) */}
            {(((userTypeID === 81 || isViewer) &&
                ["S"].includes(eligibilityData?.InspectionStatus)) ||
                ["V", "W"].includes(eligibilityData?.VerificationStatus)) && (
                    <InspectionStatusComponent
                        instituteId={instituteId}
                        pageCode="UnitsForInspection"
                        readOnly={
                            isViewer || (eligibilityData?.InspectionStatus === "S" && userTypeID === 81)
                        }
                        TypeID="14"
                        mode="view"
                    />
                )}

            {/* Primary Inspection Verification Component */}
            {(userTypeID === 14 || 
                ((userTypeID === 64 || userTypeID === 81) &&
                    ["I", "S", "WD", "W"].includes(
                        eligibilityData?.InspectionStatus
                    )) ||
                ["V", "W"].includes(eligibilityData?.VerificationStatus)) && (
                    <InspectionStatusComponent
                        ref={inspectionref}
                        instituteId={instituteId}
                        pageCode="UnitsForInspection"
                        onChange={(data) => setInspectionStatus(data)}
                        readOnly={
                            isViewer ||
                            (userTypeID === 14 && eligibilityData?.InspectionStatus === "S") ||
                            (userTypeID === 81 && eligibilityData?.VerificationStatus === "V")
                        }
                        TypeID={userTypeID}
                    />
                )}

            {/* DVETO Remark Component over Board */}
            {(userTypeID === 14 || isViewer) &&
                ["S", "WD"].includes(eligibilityData?.InspectionStatus) && (
                    <InspectionStatusComponent
                        instituteId={instituteId}
                        pageCode="UnitsForInspection"
                        readOnly={
                            isViewer || (eligibilityData?.InspectionStatus === "S" && userTypeID === 14)
                        }
                        TypeID="81"
                        mode="view"
                    />
                )}
        </InstituteFlowLayout>
    );
};

export default UnitsForInspection;
