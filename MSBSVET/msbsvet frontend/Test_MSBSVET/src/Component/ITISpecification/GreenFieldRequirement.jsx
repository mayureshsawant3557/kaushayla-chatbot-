import { useState, useEffect, useMemo, useContext } from "react";

import Swal from "sweetalert2";
import agent from "../../lib/api/agent";
import { useAuth } from "../../Hooks/AuthContext";
import DropdownComponent from "../formcomponent/DropdownComponent";
import FilteredTableComponent from "../formcomponent/FilteredTableComponent";
import OTPService from "../formcomponent/OTPService";
import { ThemeContext } from "../Context/ThemeContext";
import {  GetIsActivityValid } from "../../Endpoints_All/Base/masterData";
import useGreenFieldRequirementLock  from "../../Hooks/useGreenFieldRequirementLock";
import { useLoading } from "../../Hooks/useLoading";

import {
    GetInstituteIDByInstituteCode,
    GetCurrentFinancialYear,
    GetGreenFieldRequirement,
    SaveGreenFieldRequirement,
    SaveStatusGreenRequirement,
    SaveGreenFieldRequirementBulk,
    //GetStatusGreenRequirement
} from "../../Endpoints_All/Base/Institute";

import { GetInstituteAndManagementMobile } from
    "../../Endpoints_All/ITISpecification/itiSpecification";

import { getIp } from "../../Endpoints_All/Utils/fileUpload";

/* ================= COURSES ================= */

const greenFieldCourses = [
    { CourseID: 2634, CourseCode: "DGT/400", CourseName: "ADDITIVE MANUFACTURING TECHNICIAN (3D PRINTING)" },
    { CourseID: 2825, CourseCode: "DGT/3002", CourseName: "INDUSTRIAL ROBOTICS AND DIGITAL MANUFACTURING TECHNICIAN" },
    { CourseID: 2635, CourseCode: "DGT/2005", CourseName: "IOT TECHNICIAN (SMART AGRICULTURE)" },
    { CourseID: 2614, CourseCode: "DGT/965", CourseName: "IOT TECHNICIAN (SMART CITY)" },
    { CourseID: 2636, CourseCode: "DGT/2006", CourseName: "IOT TECHNICIAN (SMART HEALTHCARE)" },
    { CourseID: 2621, CourseCode: "DGT/442", CourseName: "ELECTRICIAN" },
    { CourseID: 2623, CourseCode: "DGT/592", CourseName: "WIREMAN" },
    { CourseID: 2637, CourseCode: "DGT/561", CourseName: "SOLAR TECHNICIAN (ELECTRICAL)" },
    { CourseID: 2591, CourseCode: "DGT/990", CourseName: "ARCHITECTURAL DRAUGHTSMAN" },
    { CourseID: 2593, CourseCode: "DGT/991", CourseName: "DRAUGHTSMAN CIVIL" },
    { CourseID: 2569, CourseCode: "DGT/439", CourseName: "DRAUGHTSMAN MECHANICAL" },
    { CourseID: 2597, CourseCode: "DGT/970", CourseName: "SURVEYOR" },
    { CourseID: 2594, CourseCode: "DGT/481", CourseName: "INTERIOR DESIGN AND DECORATION" },
    { CourseID: 2610, CourseCode: "DGT/418", CourseName: "COMPUTER HARDWARE AND NETWORK MAINTENANCE" },
    { CourseID: 2611, CourseCode: "DGT/421", CourseName: "COMPUTER OPERATOR AND PROGRAMMING ASSISTANT" },
    { CourseID: 2612, CourseCode: "DGT/431", CourseName: "DESKTOP PUBLISHING OPERATOR" },
    { CourseID: 2615, CourseCode: "DGT/530", CourseName: "MULTIMEDIA, ANIMATION AND SPECIAL EFFECTS" },
    { CourseID: 2613, CourseCode: "DGT/474", CourseName: "INFORMATION AND COMMUNICATION TECHNOLOGY SYSTEM MAINTENANCE" },
    { CourseID: 2583, CourseCode: "DGT/969", CourseName: "WELDER" },
    { CourseID: 2584, CourseCode: "DGT/992", CourseName: "WELDER (GMAW AND GTAW)" },
    { CourseID: 2553, CourseCode: "DGT/440", CourseName: "DRESS MAKING" },
    { CourseID: 2555, CourseCode: "DGT/554", CourseName: "SEWING TECHNOLOGY (CUTTING AND SEWING)" },
    { CourseID: 2554, CourseCode: "DGT/449", CourseName: "FASHION DESIGN AND TECHNOLOGY" },
    { CourseID: 2556, CourseCode: "DGT/568", CourseName: "SURFACE ORNAMENTATION TECHNIQUES (EMBROIDERY)" },
    { CourseID: 2566, CourseCode: "DGT/409", CourseName: "COSMETOLOGY (HAIR AND SKIN CARE)" },
    { CourseID: 2630, CourseCode: "DGT/461", CourseName: "FRONT OFFICE ASSISTANT" },
    { CourseID: 2561, CourseCode: "DGT/515", CourseName: "MECHANIC DIESEL" },
    { CourseID: 2562, CourseCode: "DGT/502", CourseName: "MECHANIC MOTOR VEHICLE" },
    { CourseID: 2633, CourseCode: "DGT/1002", CourseName: "MECHANIC ELECTRIC VEHICLE" },
    { CourseID: 2599, CourseCode: "DGT/446", CourseName: "ELECTRONICS MECHANIC" },
    { CourseID: 2578, CourseCode: "DGT/570", CourseName: "TECHNICIAN MECHATRONICS" },
    { CourseID: 2570, CourseCode: "DGT/453", CourseName: "FITTER" },
    { CourseID: 2620, CourseCode: "DGT/543", CourseName: "PLUMBER" },
    { CourseID: 2567, CourseCode: "DGT/998", CourseName: "REFRIGERATION AND AIR CONDITIONER TECHNICIAN" },
];

/* ================= TRAINING SETUPS CALCULATION ================= */

const getTrainingSetups = (y) =>
    Math.ceil((Number(y) || 0) / 2);

/* ================= LOCK HOOK ================= */

// const useGreenFieldRequirementLock = (isSubmitted) => {
//     return {
//         isLocked: Boolean(
//             isSubmitted === true ||
//             isSubmitted === 1 ||
//             String(isSubmitted).toLowerCase() === "true"
//         ),
//     };
// };

/* ================= COMPONENT ================= */

const GreenFieldRequirement = () => {

    const { userInfo } = useAuth();

    const [instituteId, setInstituteId] = useState(null);
    const [financialYearOptions, setFinancialYearOptions] = useState([]);
    const [selectedFinancialYear, setSelectedFinancialYear] = useState("");
    const [rows, setRows] = useState([]);

    const [userMobile, setUserMobile] = useState("");
    const [ipAddress, setIpAddress] = useState("");

    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isDeclared, setIsDeclared] = useState(false);

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);


    const { startLoading, stopLoading, isLoading } = useLoading();

    const {
        isLocked,
        formStatus,
        checkingStatus,
        refreshStatus
    } = useGreenFieldRequirementLock(
        instituteId,
        selectedFinancialYear
    );

    const { color } = useContext(ThemeContext);

    const [isActivityValid, setIsActivityValid] = useState(0);
    const [checkingApis, setCheckingApis] = useState(false);

    const [originalRows, setOriginalRows] = useState([]);


    /* ================= IP ================= */

    useEffect(() => {
        const getIP = async () => {
            try {
                const res = await agent.get(getIp);
                setIpAddress(
                    res?.ip ||
                    res?.data?.ip ||
                    ""
                );
            } catch (e) {
                console.error(e);
            }
        };

        getIP();
    }, []);

    /* ================= INSTITUTE ================= */

    useEffect(() => {

        if (!userInfo?.UserLoginID) return;

        const getInstitute = async () => {
            try {

                const res = await agent.get(
                    GetInstituteIDByInstituteCode,
                    {
                        params: {
                            InstituteCode:
                                userInfo.UserLoginID,
                        },
                    }
                );

                setInstituteId(
                    res?.data?.Data ??
                    res?.data?.InstituteID ??
                    null
                );

            } catch (e) {
                console.error(e);
            }
        };

        getInstitute();

    }, [userInfo?.UserLoginID]);

    /* ================= FINANCIAL YEAR ================= */

    useEffect(() => {

        const getFinancialYear = async () => {

            try {

                const res = await agent.get(
                    GetCurrentFinancialYear
                );

                const data =
                    res?.data?.Data ||
                    res?.data ||
                    [];

                const list =
                    Array.isArray(data)
                        ? data
                        : [data];

                const options = list.map(x => ({
                    value:
                        x.YearId ??
                        x.YearId,
                    label:
                        x.YearName ??
                        x.YearDisplayName ??
                        x.Name,
                }));

                setFinancialYearOptions(options);

                if (options.length)
                    setSelectedFinancialYear(
                        options[0].value
                    );

            } catch (e) {
                console.error(e);
            }
        };

        getFinancialYear();
        checkActivityValid();

    }, []);

    /* ================= MOBILE ================= */

    useEffect(() => {

        if (!instituteId) return;

        const getMobile = async () => {
            try {
                if (!instituteId) {
                    Swal.fire({
                        title: "Institute ID Not Found",
                        text: "Unable to find institute ID. Please try again.",
                        icon: "error",
                    });
                    return;
                }

                const url = `${GetInstituteAndManagementMobile}/${instituteId}/2`;

                const mobileResponse = await agent.get(url, {
                    headers: {
                        accept: "*/*",
                        "Content-Type": "application/json",
                    },
                });

                let mobileNo = "";

                if (
                    mobileResponse.data &&
                    mobileResponse.data.Status === "Success" &&
                    mobileResponse.data.Data?.length > 0
                ) {
                    mobileNo =
                        mobileResponse.data.Data[0].MobileNo || "";
                }

                if (!mobileNo) {
                    Swal.fire({
                        title: "Mobile Number Not Found",
                        text: "No mobile number found for management. Please update your profile.",
                        icon: "error",
                    });
                    return;
                }

                setUserMobile(mobileNo);

            } catch (error) {
                console.error("Error fetching mobile number:", error);

                Swal.fire({
                    title: "Error",
                    text: "Failed to fetch mobile number.",
                    icon: "error",
                });
            }
        };

        getMobile();

    }, [instituteId]);

    /* ================= GET DATA ================= */

    const getGreenFieldRequirement = async () => {
        if (!instituteId || !selectedFinancialYear) return;

        setFetching(true);
        startLoading();

        try {
            const res = await agent.post(GetGreenFieldRequirement, {
                InstituteId: instituteId,
                FinancialYearID: selectedFinancialYear,
            });

            console.log("Green Field API Response:", res?.data);

            // API returns Data.Table
            const data = Array.isArray(res?.data?.Data?.Table)
                ? res.data.Data.Table
                : [];

            // Create lookup using CourseID
            const dataMap = new Map(
                data.map((item) => [
                    Number(item.CourseID),
                    item,
                ])
            );

            // Always display all master courses
            const result = greenFieldCourses.map((course, index) => {
                const old = dataMap.get(Number(course.CourseID));

                return {
                    serialNumber: index + 1,

                    // API value if course exists
                    ID: old?.ID ?? null,

                    CourseID: course.CourseID,

                    CourseName: course.CourseName,

                    // Show API ApprovedUnit if available
                    ApprovedUnit: Number(
                        old?.ApprovedUnit ?? 0
                    ),

                    // Show API ProposedUnit if available
                    ProposedUnitForGreenReq: Number(
                        old?.ProposedUnitForGreenReq ?? 0
                    ),

                    RequiredTrainingSetups:
                        getTrainingSetups(
                            Number(
                                old?.ProposedUnitForGreenReq ?? 0
                            )
                        ),
                };
            });

            console.log("Final Green Field Rows:", result);

            setRows(result);
            setOriginalRows(result.map(r => ({ ...r })));

            // Submission status
            setIsSubmitted(
                res?.data?.IsSubmitted ??
                data?.[0]?.IsSubmitted ??
                false
            );

        } catch (error) {
            console.error(
                "Error fetching Green Field Requirement:",
                error
            );

            Swal.fire({
                icon: "error",
                title: "Error",
                text:
                    error?.response?.data?.Message ||
                    "Failed to fetch Green Field Requirement.",
            });
        } finally {
            setFetching(false);
            stopLoading();
        }
    };

    useEffect(() => {
        getGreenFieldRequirement();
    }, [
        instituteId,
        selectedFinancialYear,
    ]);

    const checkActivityValid = async () => {
        setCheckingApis(true);

        try {
            const response = await agent.get(
                `${GetIsActivityValid}?ActivityName=TradeRequirementsSubmit`
            );

            if (
                response?.data?.Status === "Success" &&
                response?.data?.Data?.length > 0
            ) {
                setIsActivityValid(
                    response.data.Data[0].IsValid
                );
            } else {
                setIsActivityValid(0);
            }

        } catch (error) {
            console.error(
                "Error checking activity validity:",
                error
            );

            setIsActivityValid(0);

        } finally {
            setCheckingApis(false);
        }
    };

    /* ================= CHANGE PROPOSED UNIT ================= */

    const changeProposedUnit = (
        courseId,
        value
    ) => {

        if (isLocked) return;

        const y =
            value === ""
                ? ""
                : Math.max(0, Number(value));

        setRows(old =>
            old.map(row =>
                Number(row.CourseID) ===
                    Number(courseId)
                    ? {
                        ...row,
                        ProposedUnitForGreenReq: y,
                        RequiredTrainingSetups:
                            getTrainingSetups(y),
                    }
                    : row
            )
        );
    };

    const changeApprovedUnit = (
        courseId,
        value
    ) => {

        if (isLocked) return;

        const y =
            value === ""
                ? ""
                : Math.max(0, Number(value));

        setRows(old =>
            old.map(row =>
                Number(row.CourseID) ===
                    Number(courseId)
                    ? {
                        ...row,
                        ApprovedUnit: y,
                    }
                    : row
            )
        );
    };

    /* ================= TABLE COLUMNS ================= */

    const columns = useMemo(() => [
        {
            key: "serialNumber",
            header: "S.N.",
            width: "60px",
            className: "text-center",
            headerClassName: "text-center",
            sortable: false,
        },
        {
            key: "CourseName",
            header: "Course Name",
            width: "300px",
        },
        {
            key: "ApprovedUnit",
            header: "Approved Units",
            width: "130px",
            type: "custom",
            className: "text-center",
            headerClassName: "text-center",
        },
        {
            key: "ProposedUnitForGreenReq",
            header: (
                <div className="text-center">
                    Units Proposed
                    <br />
                    for Green Field
                    <br />
                    Requirement
                </div>
            ),
            type: "custom",
            width: "180px",
            className: "text-center",
            headerClassName: "text-center",
            sortable: false,
        },
        {
            key: "RequiredTrainingSetups",
            header: (
                <div className="text-center">
                    Required
                    <br />
                    Training
                    <br />
                    Setups
                </div>
            ),
            type: "custom",
            width: "150px",
            className: "text-center",
            headerClassName: "text-center",
            sortable: false,
        },
    ], [isLocked]);

    /* ================= RENDER CELL ================= */

    const renderCell = (item, column) => {
        if (column.key === "ApprovedUnit") {
            return (
                <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={item.ApprovedUnit}
                    disabled={isLocked}
                    
                    onChange={(e) => {
                        if (e.target.value >= 0) {
                            changeApprovedUnit(item.CourseID, e.target.value);
                        }
                    }}
                    className="w-24 rounded border border-gray-300 px-2 py-1 text-center disabled:bg-gray-100"
                />
            );
        }
        if (
            column.key ===
            "ProposedUnitForGreenReq"
        ) {
            return (
                <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={
                        item.ProposedUnitForGreenReq
                    }
                    disabled={isLocked}
                    onChange={e =>
                        changeProposedUnit(
                            item.CourseID,
                            e.target.value
                        )
                    }
                    className="w-24 rounded border border-gray-300 px-2 py-1 text-center disabled:bg-gray-100"
                />
            );
        }

        if (
            column.key ===
            "RequiredTrainingSetups"
        ) {
            return (
                <span className="font-semibold">
                    {getTrainingSetups(
                        item.ProposedUnitForGreenReq
                    )}
                </span>
            );
        }

        return item[column.key];
    };

    /* ================= SAVE ================= */

    // const saveRequirements = async () => {

    //     if (isLocked) return false;

    //     setLoading(true);

    //     try {

    //         for (const row of rows) {

    //             const res = await agent.post(
    //                 SaveGreenFieldRequirement,
    //                 {
    //                     InstituteID: instituteId,
    //                     CourseID: row.CourseID,
    //                     FinancialYearID: selectedFinancialYear,
    //                     ApprovedUnit:
    //                         Number(row.ApprovedUnit) || 0,
    //                     ProposedUnitForGreenReq:
    //                         Number(row.ProposedUnitForGreenReq) || 0,
    //                     UserLoginID:
    //                         userInfo?.UserLoginID,
    //                     IPAddress: ipAddress,
    //                 }
    //             );

    //             if (
    //                 String(
    //                     res?.data?.Data ??
    //                     res?.data?.IsOk
    //                 ).toUpperCase() === "N"
    //             ) {
    //                 throw new Error("Save failed.");
    //             }
    //         }

    //         await getGreenFieldRequirement();

    //         ONE success Swal
    //         await Swal.fire({
    //             title: "Success!",
    //             text: "Green Field Requirement saved successfully.",
    //             icon: "success",
    //             timer: 3000,
    //             showConfirmButton: false,
    //         });

    //         return true;

    //     } catch (e) {

    //         ONE error Swal
    //         await Swal.fire({
    //             title: "Failed!",
    //             text: e?.message || "Unable to save data.",
    //             icon: "error",
    //             timer: 3000,
    //             showConfirmButton: false,
    //         });

    //         return false;

    //     } finally {
    //         setLoading(false);
    //     }
    // };

    /* ================= SAVE ================= */

    // old work fine issu at 23/09/2026

    // const saveRequirements = async () => {

    //     if (isLocked) return false;

    //     setLoading(true);
    //     startLoading();

    //     try {
    //         // ✅ Filter only rows that have been modified
    //         // const modifiedRows = rows.filter((row, index) => {
    //         //     const original = originalRows[index];
    //         //     if (!original) return false;

    //         //     Check if ApprovedUnit or ProposedUnitForGreenReq changed
    //         //     return (
    //         //         row.ApprovedUnit !== original.ApprovedUnit ||
    //         //         row.ProposedUnitForGreenReq !== original.ProposedUnitForGreenReq
    //         //     );
    //         // });


    //         // If no changes, show message and return
    //         // if (modifiedRows.length === 0) {
    //         //     await Swal.fire({
    //         //         title: "No Changes",
    //         //         text: "No data has been modified to save.",
    //         //         icon: "info",
    //         //         timer: 2000,
    //         //         showConfirmButton: false,
    //         //     });
    //         //     return true;
    //         // }

    //         const hasZeroValue = rows.some(
    //             (row) =>
    //                 Number(row.ApprovedUnit || 0) === 0 ||
    //                 Number(row.ProposedUnitForGreenReq || 0) === 0
    //         );

    //         if (hasZeroValue) {

    //             const confirm = await Swal.fire({
    //                 title: "Confirm Submission",
    //                 text:
    //                     'You are submitting “NIL” information for Green Field Requirement. Are you sure you want to submit “NIL” information?',
    //                 icon: "warning",
    //                 showCancelButton: true,
    //                 confirmButtonText: "Yes, Continue",
    //                 cancelButtonText: "Review",
    //                 reverseButtons: true,
    //             });

    //             // User clicked Review / Cancel
    //             if (!confirm.isConfirmed) {
    //                 return false;
    //             }
    //         }
    //         // ✅ Save only modified rows
    //         //  for (const row of rows) {

    //         //     const res = await agent.post(
    //         //         SaveGreenFieldRequirement,
    //         //         {
    //         //             InstituteID: instituteId,
    //         //             CourseID: row.CourseID,
    //         //             FinancialYearID: selectedFinancialYear,
    //         //             ApprovedUnit:
    //         //                 Number(row.ApprovedUnit) || 0,
    //         //             ProposedUnitForGreenReq:
    //         //                 Number(row.ProposedUnitForGreenReq) || 0,
    //         //             UserLoginID:
    //         //                 userInfo?.UserLoginID,
    //         //             IPAddress: ipAddress,
    //         //         }
    //         //     );

    //         //     if (
    //         //         String(
    //         //             res?.data?.Data ??
    //         //             res?.data?.IsOk
    //         //         ).toUpperCase() === "N"
    //         //     ) {
    //         //         throw new Error("Save failed.");
    //         //     }
    //         // }

    //         const savePromises = rows.map((row) =>
    //             agent.post(
    //                 SaveGreenFieldRequirement,
    //                 {
    //                     InstituteID: instituteId,
    //                     CourseID: row.CourseID,
    //                     FinancialYearID: selectedFinancialYear,
    //                     ApprovedUnit: Number(row.ApprovedUnit) || 0,
    //                     ProposedUnitForGreenReq:
    //                         Number(row.ProposedUnitForGreenReq) || 0,
    //                     UserLoginID: userInfo?.UserLoginID,
    //                     IPAddress: ipAddress,
    //                 }
    //             )
    //         );

    //         const responses = await Promise.all(savePromises);

    //         for (const res of responses) {
    //             if (
    //                 String(
    //                     res?.data?.Data ??
    //                     res?.data?.IsOk
    //                 ).toUpperCase() === "N"
    //             ) {
    //                 throw new Error("Save failed.");
    //             }
    //         }

    //         // ✅ Refresh data and update originalRows
    //         await getGreenFieldRequirement();

    //         await Swal.fire({
    //             title: "Success!",
    //             text: `All record(s) saved successfully.`,
    //             icon: "success",
    //             timer: 3000,
    //             showConfirmButton: false,
    //         });

    //         return true;

    //     } catch (e) {

    //         await Swal.fire({
    //             title: "Failed!",
    //             text: e?.message || "Unable to save data.",
    //             icon: "error",
    //             timer: 3000,
    //             showConfirmButton: false,
    //         });

    //         return false;

    //     } finally {
    //         setLoading(false);
    //         stopLoading();
    //     }
    // };

    // const submitRequirements = async () => {

    //     if (isLocked) return false;

    //     setLoading(true);
    //     startLoading();

    //     try {

    //         if (!instituteId || !selectedFinancialYear) {
    //             await Swal.fire({
    //                 title: "Required!",
    //                 text: "Institute and Financial Year are required.",
    //                 icon: "warning",
    //                 timer: 2500,
    //                 showConfirmButton: false,
    //             });

    //             return false;
    //         }

    //         // const modifiedRows = rows.filter((row, index) => {
    //         //     const original = originalRows[index];
    //         //     if (!original) return false;

    //         //    Check if ApprovedUnit or ProposedUnitForGreenReq changed
    //         //     return (
    //         //         row.ApprovedUnit !== original.ApprovedUnit ||
    //         //         row.ProposedUnitForGreenReq !== original.ProposedUnitForGreenReq
    //         //     );
    //         // });


    //         //If no changes, show message and return
    //         // if (modifiedRows.length === 0) {
    //         //     await Swal.fire({
    //         //         title: "No Changes",
    //         //         text: "No data has been modified to save.",
    //         //         icon: "info",
    //         //         timer: 2000,
    //         //         showConfirmButton: false,
    //         //     });
    //         //     return true;
    //         // }

    //        // ✅ Save only modified rows
    //         // for (const row of rows) {

    //         //     const res = await agent.post(
    //         //         SaveGreenFieldRequirement,
    //         //         {
    //         //             InstituteID: instituteId,
    //         //             CourseID: row.CourseID,
    //         //             FinancialYearID: selectedFinancialYear,
    //         //             ApprovedUnit:
    //         //                 Number(row.ApprovedUnit) || 0,
    //         //             ProposedUnitForGreenReq:
    //         //                 Number(row.ProposedUnitForGreenReq) || 0,
    //         //             UserLoginID:
    //         //                 userInfo?.UserLoginID,
    //         //             IPAddress: ipAddress,
    //         //         }
    //         //     );

    //         //     if (
    //         //         String(
    //         //             res?.data?.Data ??
    //         //             res?.data?.IsOk
    //         //         ).toUpperCase() === "N"
    //         //     ) {
    //         //         throw new Error("Save failed.");
    //         //     }
    //         // }
    //         const savePromises = rows.map((row) =>
    //             agent.post(
    //                 SaveGreenFieldRequirement,
    //                 {
    //                     InstituteID: instituteId,
    //                     CourseID: row.CourseID,
    //                     FinancialYearID: selectedFinancialYear,
    //                     ApprovedUnit: Number(row.ApprovedUnit) || 0,
    //                     ProposedUnitForGreenReq:
    //                         Number(row.ProposedUnitForGreenReq) || 0,
    //                     UserLoginID: userInfo?.UserLoginID,
    //                     IPAddress: ipAddress,
    //                 }
    //             )
    //         );

    //         const responses = await Promise.all(savePromises);

    //         for (const res of responses) {
    //             if (
    //                 String(
    //                     res?.data?.Data ??
    //                     res?.data?.IsOk
    //                 ).toUpperCase() === "N"
    //             ) {
    //                 throw new Error("Save failed.");
    //             }
    //         }

    //       //  Confirmation before submit


    //         //Save / update form status
    //         const resp = await agent.post(
    //             SaveStatusGreenRequirement,
    //             {
    //                 instituteID: instituteId,
    //                 yearID: selectedFinancialYear,
    //                 userLoginID: userInfo?.UserLoginID,
    //                 ipAddress: ipAddress,
    //                 formStatus: "S",
    //             }
    //         );

    //         const result =
    //             resp?.data?.Data ??
    //             resp?.data?.IsOk ??
    //             resp?.data;

    //         if (
    //             String(result).toUpperCase() === "N" ||
    //             result === 0 ||
    //             result === false
    //         ) {
    //             throw new Error(
    //                 resp?.data?.Message ||
    //                 "Unable to submit Green Field Requirement."
    //             );
    //         }

    //         //Refresh status/data

    //         await getGreenFieldRequirement();
    //         window.location.reload();

    //         await Swal.fire({
    //             title: "Submitted!",
    //             text: "Green Field Requirement submitted successfully.",
    //             icon: "success",
    //             timer: 3000,
    //             showConfirmButton: false,
    //         });

    //         return true;

    //     } catch (e) {

    //         await Swal.fire({
    //             title: "Failed!",
    //             text:
    //                 e?.response?.data?.Message ||
    //                 e?.message ||
    //                 "Unable to submit Green Field Requirement.",
    //             icon: "error",
    //             timer: 3000,
    //             showConfirmButton: false,
    //         });

    //         return false;

    //     } finally {
    //         setLoading(false);
    //         stopLoading();
    //     }
    // };

    //new try

    const saveRequirements = async () => {
        if (isLocked) return false;

        setLoading(true);
        startLoading();

        try {
            if (!instituteId || !selectedFinancialYear) {
                await Swal.fire({
                    title: "Required!",
                    text: "Institute and Financial Year are required.",
                    icon: "warning",
                    timer: 2500,
                    showConfirmButton: false,
                });

                return false;
            }

            const hasZeroValue = rows.some(
                (row) =>
                    Number(row.ApprovedUnit || 0) === 0 ||
                    Number(row.ProposedUnitForGreenReq || 0) === 0
            );

            if (hasZeroValue) {
                const confirm = await Swal.fire({
                    title: "Confirm Submission",
                    text:
                        'You are submitting “NIL” information for Green Field Requirement. Are you sure you want to submit “NIL” information?',
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonText: "Yes, Continue",
                    cancelButtonText: "Review",
                    reverseButtons: true,
                });

                if (!confirm.isConfirmed) {
                    return false;
                }
            }

            const request = {
                InstituteID: instituteId,
                FinancialYearID: selectedFinancialYear,
                UserLoginID: userInfo?.UserLoginID,
                IPAddress: ipAddress,

                Rows: rows.map((row) => ({
                    CourseID: row.CourseID,
                    ApprovedUnit: Number(row.ApprovedUnit) || 0,
                    ProposedUnitForGreenReq:
                        Number(row.ProposedUnitForGreenReq) || 0,
                })),
            };

            const res = await agent.post(
                SaveGreenFieldRequirementBulk,
                request
            );

            const result =
                res?.data?.Data ??
                res?.data?.IsOk ??
                res?.data;

            if (
                String(result).toUpperCase() === "N" ||
                result === 0 ||
                result === false
            ) {
                throw new Error(
                    res?.data?.Message ||
                    "Unable to save Green Field Requirement."
                );
            }

            await getGreenFieldRequirement();

            await Swal.fire({
                title: "Success!",
                text: "All record(s) saved successfully.",
                icon: "success",
                timer: 3000,
                showConfirmButton: false,
            });

            return true;

        } catch (e) {
            await Swal.fire({
                title: "Failed!",
                text:
                    e?.response?.data?.Message ||
                    e?.message ||
                    "Unable to save data.",
                icon: "error",
                timer: 3000,
                showConfirmButton: false,
            });

            return false;

        } finally {
            setLoading(false);
            stopLoading();
        }
    };


    const submitRequirements = async () => {
        if (isLocked) return false;

        setLoading(true);
        startLoading();

        try {
            if (!instituteId || !selectedFinancialYear) {
                await Swal.fire({
                    title: "Required!",
                    text: "Institute and Financial Year are required.",
                    icon: "warning",
                    timer: 2500,
                    showConfirmButton: false,
                });

                return false;
            }

            // const hasZeroValue = rows.some(
            //     (row) =>
            //         Number(row.ApprovedUnit || 0) === 0 ||
            //         Number(row.ProposedUnitForGreenReq || 0) === 0
            // );

            // if (hasZeroValue) {
            //     const confirm = await Swal.fire({
            //         title: "Confirm Submission",
            //         text:
            //             'You are submitting “NIL” information for Green Field Requirement. Are you sure you want to submit “NIL” information?',
            //         icon: "warning",
            //         showCancelButton: true,
            //         confirmButtonText: "Yes, Continue",
            //         cancelButtonText: "Review",
            //         reverseButtons: true,
            //     });

            //     if (!confirm.isConfirmed) {
            //         return false;
            //     }
            // }

            // ✅ Save all rows in ONE API call
            const request = {
                InstituteID: instituteId,
                FinancialYearID: selectedFinancialYear,
                UserLoginID: userInfo?.UserLoginID,
                IPAddress: ipAddress,

                Rows: rows.map((row) => ({
                    CourseID: row.CourseID,
                    ApprovedUnit: Number(row.ApprovedUnit) || 0,
                    ProposedUnitForGreenReq:
                        Number(row.ProposedUnitForGreenReq) || 0,
                })),
            };

            const saveResponse = await agent.post(
                SaveGreenFieldRequirementBulk,
                request
            );

            const saveResult =
                saveResponse?.data?.Data ??
                saveResponse?.data?.IsOk ??
                saveResponse?.data;

            if (
                String(saveResult).toUpperCase() === "N" ||
                saveResult === 0 ||
                saveResult === false
            ) {
                throw new Error(
                    saveResponse?.data?.Message ||
                    "Unable to save Green Field Requirement."
                );
            }

            // ✅ Save / update form status
            const resp = await agent.post(
                SaveStatusGreenRequirement,
                {
                    instituteID: instituteId,
                    yearID: selectedFinancialYear,
                    userLoginID: userInfo?.UserLoginID,
                    ipAddress: ipAddress,
                    formStatus: "S",
                }
            );

            const result =
                resp?.data?.Data ??
                resp?.data?.IsOk ??
                resp?.data;

            if (
                String(result).toUpperCase() === "N" ||
                result === 0 ||
                result === false
            ) {
                throw new Error(
                    resp?.data?.Message ||
                    "Unable to submit Green Field Requirement."
                );
            }

            await getGreenFieldRequirement();

            await Swal.fire({
                title: "Submitted!",
                text: "Green Field Requirement submitted successfully.",
                icon: "success",
                timer: 3000,
                showConfirmButton: false,
            });

            window.location.reload();

            return true;

        } catch (e) {
            await Swal.fire({
                title: "Failed!",
                text:
                    e?.response?.data?.Message ||
                    e?.message ||
                    "Unable to submit Green Field Requirement.",
                icon: "error",
                timer: 3000,
                showConfirmButton: false,
            });

            return false;

        } finally {
            setLoading(false);
            stopLoading();
        }
    };


    /* ================= OTP ================= */

    const otpService = OTPService({

        mobileNo: userMobile,

        purpose:
            "SubmitGreenFieldRequirement",

        isVerifyRequired: true,

        messege:
            "Information once submitted cannot be edited. Please verify the information before submission.",

        isDuplicateCheck: false,

        onSuccess: async () => {

            const saved =
                await submitRequirements();

            if (!saved) return;

            setIsSubmitted(true);

            Swal.fire(
                "Submitted",
                "Green Field Requirement submitted successfully.",
                "success"
            );
            
        },

        onError: error => {
            Swal.fire(
                "Verification Failed",
                error?.message ||
                "OTP verification failed.",
                "error"
            );
           
        },

        onCancel: () => { },
       
    });

    /* ================= SUBMIT ================= */

    const handleSubmit = async () => {

        if (isLocked) return;

        if (!isDeclared) {
            Swal.fire(
                "Declaration Required",
                "Please accept the declaration.",
                "warning"
            );
            return;
        }

        // Check whether all values are zero / NIL
        const hasZeroValue = rows.some(
            (row) =>
                Number(row.ApprovedUnit || 0) === 0 ||
                Number(row.ProposedUnitForGreenReq || 0) === 0
        );

        if (hasZeroValue) {

            const confirm = await Swal.fire({
                title: "Confirm Submission",
                text:
                    'You are submitting “NIL” information for Green Field Requirement. Are you sure you want to submit “NIL” information?',
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes, Continue",
                cancelButtonText: "Review",
                reverseButtons: true,
            });

            // User clicked Review / Cancel
            if (!confirm.isConfirmed) {
                return false;
            }
        }

        // const confirm = await Swal.fire({
        //     title: "Confirm Submission",
        //     text:
        //         "Once submitted, information cannot be edited.",
        //     icon: "warning",
        //     showCancelButton: true,
        //     confirmButtonText: "Yes, Continue",
        //     cancelButtonText: "Review",
        // });

        // if (!confirm.isConfirmed)
        //     return;
        startLoading();
        await otpService.sendOTP();
        stopLoading();
    };

    /* ================= UI ================= */

    return (
        <div className="p-4 md:p-6">

            <fieldset className="border border-gray-300 rounded px-4 pt-3 pb-2">
                {isLocked && (
                    <div className="mb-4 rounded border-l-4 border-yellow-500 bg-yellow-100 p-4 text-yellow-700">
                        This data has been submitted and is in
                        <strong> View Only Mode</strong>.
                    </div>
                )}



                <legend
                    className={`rounded border border-gray-300 ${color} px-4 py-1 text-xl font-bold text-white`}
                >
                    <div className="flex items-center gap-2">
                        Green Field Requirement
                    </div>
                </legend>

                <div className="mb-5 rounded-lg border bg-white p-4">
                    <DropdownComponent
                        label="Financial Year"
                        options={financialYearOptions}
                        value={selectedFinancialYear}
                        onChange={setSelectedFinancialYear}
                        required
                        disabled={isLocked}
                        loading={fetching}
                        error=""
                    />
                </div>

                <div className="mt-5 rounded-md border border-blue-200 bg-blue-50 p-4 mb-5">

                    <p className="text-sm font-medium text-blue-700">
                        Note:
                    </p>

                    <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-blue-700">
                        <li>Green Field Requirement is the requirement of entire Trade Infrastructure. It is to plan to procure all items required for the trade including machines, tools, equipments, furniture, etc.</li>
                        <li>Thus, only consumable shall be required to be procured at institute level during training.</li>
                        <li>This approach facilitates to immediately apply for affiliation once all trade infrastructure is made available to institute.</li>
                        <li>Curriculum as published on CSTARI website are referred to finalize BoQ.</li>
                        <li>The infrastructure BoQ is as per DGT curriculum reviewed by trade experts. Where ever required additional/ upgraded items are proposed, work bench/ test bench/ trainer are preferred over individual items and unnecessary/ obsolete items are also removed.</li>
                        <li>The included standard items are readily available in the market and are as per training requirement i.e. in line with learning outcome specified in the curriculum.</li>
                        <li>Institute is required to propose Units for Green Field Requirement for the below mentioned Trades only. Total Training Setups shall be calculated on basis of 2 Units in a Shift.</li>
                        
                    </ol>

                </div>

                <div className="border border-gray-300">

                    <FilteredTableComponent
                        data={rows}
                        columns={columns}
                        searchable={false}
                        showExport={false}
                        showExcelTemplate={false}
                        showPDF={false}
                        sortable={true}
                        showCheckbox={false}
                        tableId="green-field-requirement-table"
                        maxHeight="500px"
                        stickyHeader={true}
                        renderCell={renderCell}
                        emptyMessage={
                            fetching
                                ? "Loading..."
                                : "No course data available"
                        }
                        tableTitle={"COURSE CATEGORY : NATIONAL TRADE CERTIFICATE"}
                    />

                </div>

                {/* DECLARATION */}

                <div className="mt-5 rounded border bg-white p-4">

                    <label className="flex gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={isDeclared}
                            disabled={isLocked}
                            onChange={e =>
                                setIsDeclared(
                                    e.target.checked
                                )
                            }
                        />

                        <span>
                            I hereby declare that the above
                            information is true and correct to
                            the best of my knowledge.
                        </span>
                    </label>

                    <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-gray-700">
                        <li>Instructor Post is sanctioned for the above Units/ shall be provided through Institute Management Committee (IMC) under PPP Scheme.</li>
                        <li>Required constructed/ built-up space is available for the proposed course/ trade/ units.</li>
                        <li>The demand has been proposed for sanctioned affiliated and to be affiliated CTS units.</li>
                        <li>The demand covers 652 units sanctioned vide Government of Maharashtra resolution dated 22.06.2023.</li>
                        <li>The institute has planned to create common facilities as CNC Lab, Computer Lab, Drawing Hall, Library, Class Room, Store Room, Office, Conference Room, Seminar Hall, etc. for optimum utilization of resources.</li>
                        <li>The demand is placed after utilization of existing available training infrastructure.</li>
                    </ol>

                </div>

                <div className="mt-5 rounded-md border border-blue-200 bg-blue-50 p-4">

                    <p className="text-sm font-medium text-blue-700">
                        Note:
                    </p>

                    <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-blue-700">
                        <li>Click on "Lock Requirement" button to Submit Information to Regional Office and Head Office.</li>
                        <li>OTP confirmation on Head of Institute/Principal/Director Primary Mobile Number is required.</li>
                        <li>Information once submitted shall not be available for editing.</li>
                        <li>Contact DVET (desk 07) to unlock information and resubmission.</li>
                    </ol>

                </div>
            </fieldset>

            {/* BUTTONS */}

            <div className="mt-5 flex justify-center gap-4">

                <button
                    onClick={saveRequirements}
                    disabled={
                        isLocked ||
                        loading ||
                        fetching
                    }
                    className="rounded bg-blue-600 px-6 py-2 font-bold text-white disabled:opacity-50"
                >
                    {loading ? "Saving..." : "Save"}
                </button>

                <button
                    onClick={handleSubmit}
                    disabled={
                        isLocked ||
                        loading ||
                        fetching ||
                        !isDeclared ||
                        rows.length === 0 ||
                        !isActivityValid
                    }
                    className="rounded bg-blue-600 px-6 py-2 font-bold text-white disabled:opacity-50"
                    title={
                        !isDeclared
                            ? "Please accept the declaration"
                            : !isActivityValid
                            ? "Please ensure all activity requirements are met"
                            : ""
                    }
                >
                    {loading
                        ? "Processing..."
                        : "Lock Requirement"}
                </button>

            </div>

        </div>
    );
};

export default GreenFieldRequirement;