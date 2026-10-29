import FilteredTableComponent from '../../Component/formcomponent/FilteredTableComponent'
import { useEffect, useState } from 'react';
import FormComponent from '../formcomponent/FormComponent';
import Button from '../base/Button';
import DropdownComponent from '../formcomponent/DropdownComponent';
import agent from '../../lib/api/agent'
import { GetSTTSchoolUnitByInstitute, GetSTTSchoolBatchesByInstitute, GetSTTSchoolBatchByBatchIDORUnitID, InsertOrUpdateSTTSchoolBatchDetails, GetInstituteSchoolsWiseCourse, GetSchoolsList, GetCandidateListByBatchID, GetSTTBatchByBatchIDORUnitIDForSchoolBatch, GetVerifiedSchools } from '../../Endpoints_All/SchoolStep/activeBatch'
import { GetInstituteIDByInstituteCode } from '../../Endpoints_All/Base/Institute';
import AdmittedCandidates from './AdmittedCandidates';
import { SwalHelper } from '../../utils/swalHelper';
import Swal from 'sweetalert2';
import { duration } from '@mui/material';
import { getDeviceIP } from "../../utils/CommonHelper";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Hooks/AuthContext';

const column = [
    { header: "Sr. No.", key: "srNo", width: "60px", className: "text-center", headerClassName: "text-center" },
    { header: "Course Name", key: "courseName", width: "600px", className: "text-center" },
    { header: "Shift", key: "shift", width: "60px", className: "text-center" },
    { header: "Unit No", key: "unitNo", width: "60px", className: "text-center" },
    { header: "Unit ID", key: "unitID", width: "60px", className: "text-center" },
    { header: "Recent Batch Status", key: "recentBatchStatus", width: "140px", className: "text-center" }
]
const batchColumn = [
    { header: "Sr. No.", key: "srNo", width: "80px", className: "text-center", headerClassName: "text-center" },
    { header: "Location", key: "location", width: "140px", className: "text-center", headerClassName: "text-center" },
    { header: "Batch ID", key: "batchId", width: "140", className: "text-center" },
    { header: "Batch Start Date", key: "batchStartDate", width: "140", className: "text-center" },
    { header: "Batch End Date", key: "batchEndDate", width: "140", className: "text-center" },
    { header: "Intake", key: "intake", width: "100px", className: "text-center" },
    { header: "Admitted", key: "admitted", width: "100px", className: "text-center" },
    { header: "Pass", key: "pass", width: "100px", className: "text-center" },
    { header: "Fail", key: "fail", width: "100px", className: "text-center" },
    { header: "Batch Status", key: "batchStatus", width: "160px", className: "text-center" },
    { header: "Action", key: "action", width: "140px", className: "text-center" },
]
const ActiveBatch = () => {

    const navigate = useNavigate();
    const { userInfo } = useAuth();

    const [schoolsList, setSchoolsList] = useState([]);
    const [selectedSchoolId, setSelectedSchoolId] = useState("");
    const [isCreatingNewBatch, setIsCreatingNewBatch] = useState(false);
    const [schoolCourseData, setSchoolCourseData] = useState([]);
    const [ipAddress, setIPAddress] = useState("");
    const [unitData, setUnitData] = useState([]);
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [batchData, setBatchData] = useState([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [createdBy, setCreatedBy] = useState("");
    const [collegeID, setCollegeID] = useState(0);
    const [createBatchForm, setCreateBatchForm] = useState({
        batchStatus: "Created",
        perDayTrainingHours: "",
        batchStartDate: "",
        batchEndDate: "",
        batchReservation: "",
        instructorType: "",
        scheme: "",
        applicableFees: "",
        intake: "",
        admitted: 0,
        passed: 0,
        failed: 0,
        absent: 0,
    });
    const [isViewingBatch, setIsViewingBatch] = useState(false);


    // const fetchUnitDetails = async (unitID) => {
    //     const unit = unitMasterData.find(item => item.unitID === unitID);

    //     setSelectedUnit(unit);
    //     setBatchData(batchMasterData[unitID] || []);
    //     setShowCreateForm(false);
    // };

    // const fetchCourses = async () => {
    //     const payload = {
    //         instituteId: 10001,
    //         userLoginID: "admin",
    //         pageCode: "STSC",
    //         itemId: 0
    //     };
    //     const response = await agent.post('https://localhost:44321/api/GetShortTermSchoolStepCourseUnitDetails', payload)
    //     console.log(response);

    // }
    // useEffect(()=>{
    //     fetchCourses();
    // },[])
    useEffect(() => {
        const loadIP = async () => {
            const ip = await getDeviceIP();
            setIPAddress(ip);
        };

        loadIP();
        const loadUnits = async () => {
            try {
                const instituteCode = userInfo?.UserLoginID || userInfo?.UserLoginID;
                const resInstitute = await agent.get(
                    `${GetInstituteIDByInstituteCode}?InstituteCode=${instituteCode}`
                );
                setCreatedBy(instituteCode);

                const instituteId = resInstitute.data.Data;



                const response = await agent.post(
                    `${GetSTTSchoolUnitByInstitute}?InstituteID=${instituteId}`
                );

                const apiData = response.data.Data.Table;


                const formattedUnits = apiData.map((item, index) => ({
                    srNo: index + 1,
                    courseName: item.CourseName,
                    courseCode: item.CourseCode,
                    shift: item.ShiftID,
                    unitNo: item.UnitNo,
                    unitID: item.UnitCode,
                    duration: item.DurationCal,
                    courseId: item.CourseID,
                    // courseType: item.CourseType,
                    fees: item.CourseFee,
                    admissionEndDate: formatDateForInput(item.AdmissionEndDate),
                    recentBatchStatus: item.UnitStatus || "Active",
                }));


                setUnitData(formattedUnits);

            } catch (error) {
                console.error(error);
            }
        };

        loadUnits();

        
    }, []);

    useEffect(() => {
        if (!selectedUnit?.unitID) return;

        const fetchSchoolWiseCourse = async () => {
            try {
                const instituteCode = userInfo?.UserLoginID || userInfo?.UserLoginID;
                const resInstitute = await agent.get(
                    `${GetInstituteIDByInstituteCode}?InstituteCode=${instituteCode}`
                );

                const instituteId = resInstitute.data.Data;
                setCollegeID(instituteId);

                const response = await agent.post(
                    `${GetInstituteSchoolsWiseCourse}?schoolId=${instituteId}`
                );

                const tableData = response?.data?.Data;

                if (tableData) {
                    setSchoolCourseData(tableData);
                }

            } catch (error) {
                console.error("Error fetching school wise course:", error);
            }
        };

        fetchSchoolWiseCourse();

    }, [selectedUnit]);

    useEffect(() => {
        if (!selectedUnit?.unitID) return;
        const fetchSchoolList = async () => {
            try {
                const instituteCode = userInfo?.UserLoginID || "";
                const resInstitute = await agent.get(
                    `${GetInstituteIDByInstituteCode}?InstituteCode=${instituteCode}`
                );
                const instituteId = resInstitute.data.Data;


                const response = await agent.get(
                    `${GetVerifiedSchools}?instituteId=${instituteId}`
                );
                // const response = await agent.get(
                //     `${GetSchoolsList}?instituteId=${instituteId}&filterStatus=Active`
                // );


                const tableData = response?.data?.Table;

                if (tableData && tableData.length > 0) {
                    const formatted = tableData.map(item => ({
                        label: item.SchoolName || item.SchoolCode,
                        value: Number(item.SchoolID)
                    }));
                    setSchoolsList(formatted);
                }
            } catch (error) {
                console.error("Error fetching school list:", error);
            }
        };
        fetchSchoolList();
    }, [selectedUnit]);


    // const viewBatch = async (id) => {
    //     if (!id) {
    //         console.error('Id is null or undefined')
    //         return;
    //     }
    //     const found = batchData.find(item => item.batchId === id)
    //     if (!found) {
    //         console.warn("Batch not found");
    //     }

    //     console.log('foundddddddddddd', found);


    //     setIsViewingBatch(true);
    //     setSelectedSchoolId(found.schoolId || "");
    //     setCreateBatchForm({
    //         batchStatus: found.batchStatus || "Created",
    //         perDayTrainingHours: found.perDayTrainingHours || "",
    //         batchStartDate: found.batchStartDate || "",
    //         batchEndDate: found.batchEndDate || "",
    //         batchReservation: found.batchReservation === 0 ? "General"
    //             : found.batchReservation === 1 ? "Women"
    //                 : found.batchReservation === 2 ? "PWD" : "",
    //         instructorType: found.instructorType || "",
    //         scheme: found.scheme || "",
    //         applicableFees: found.applicableFees || "",
    //         intake: found.intake || 0,
    //         admitted: found.admitted || 0,
    //         passed: found.pass || 0,
    //         failed: found.fail || 0,
    //         absent: found.absent || 0,
    //         batchId: found.batchId,
    //         admissionEndDate: found.admissionEndDate || "",
    //         location: found.location || "",
    //         schoolId: selectedSchoolId || "",



    //     });
    //     setIsCreatingNewBatch(false);

    //     setShowCreateForm(true);

    // }
    // const fetchBatchByUnit = async (unitID) => {
    //     try {
    //         const selected = unitData.find(u => u.unitID === unitID);
    //         setSelectedUnit(selected);

    //         //     const templateResponse = await agent.post(
    //         //     `${GetSTTSchoolBatchByBatchIDORUnitID}?UnitID=${unitID}&BatchID=0`
    //         // );
    //         // const templateData = templateResponse.data.Data.Table;

    //         // if (templateData && templateData.length > 0) {
    //         //     const template = templateData[0];
    //         //     setSelectedUnit(prev => ({
    //         //         ...prev,
    //         //         duration: template.DurationCal,
    //         //         courseType: template.CourseType,
    //         //         fees: template.CourseFee,
    //         //         courseId: template.CourseID,
    //         //         nextBatchId: template.BatchID,  // store suggested next BatchID
    //         //     }));
    //         // }

    //         // Separately fetch ALL existing batches for this unit
    //         const batchesResponse = await agent.post(
    //             `${GetSTTSchoolBatchesByInstitute}?UnitID=${unitID}`
    //         );
    //         console.log('All existing batches:>>>>>>>>>>>>>>>>>>>>>>', batchesResponse.data);

    //         const unitTable = batchesResponse.data?.Data?.Table || [];
    //         const batchTable = batchesResponse.data?.Data?.Table1 || [];
    //         console.log('++++++++++++++++++++++++', batchData);

    //         const unitInfo = unitTable.find(u => u.UnitCode == unitID) || unitTable[0];

    //         if (unitInfo) {
    //             setSelectedUnit(prev => ({
    //                 ...prev,
    //                 courseType: unitInfo.CourseType,
    //                 courseId: unitInfo.CourseID,
    //                 intake: unitInfo.Intake,
    //                 duration: parseInt(unitInfo.Duration) || prev.duration,
    //             }));
    //         }

    //         if (!batchTable || batchTable.length === 0) {
    //             setBatchData([]);
    //             return;
    //         }

    //         const formattedBatch = batchTable.map((item, index) => ({
    //             srNo: index + 1,
    //             location: item.LocationName || "",
    //             batchId: item.BatchID,
    //             batchStartDate: formatDateForInput(item.BatchStartDate),
    //             batchEndDate: formatDateForInput(item.BatchEndDate),
    //             intake: item.Intake,
    //             admitted: item.Admitted,
    //             pass: item.Pass,
    //             fail: item.Fail,
    //             batchStatus: item.BatchStatus,
    //             perDayTrainingHours: item.PerDayTrainingHours || "",
    //             batchReservation: item.BatchReservation === 0 ? "General"
    //                 : item.BatchReservation === 1 ? "Women"
    //                     : item.BatchReservation === 2 ? "PWD" : "",
    //             instructorType: item.InstructorType || "",
    //             scheme: item.Scheme || "",
    //             applicableFees: item.ApplicableFees || "",
    //             admissionEndDate: formatDateForInput(item.AdmissionEndDate),
    //             schoolId: item.SchoolID || ""
    //         }));
    //         console.log('formated----Batch---->>>>', batchTable);


    //         setBatchData(formattedBatch);

    //     } catch (error) {
    //         console.error(error);
    //     }
    // };

    // Accept schoolId as second parameter
    const viewBatch = async (id, schoolId) => {
        if (!id) return;
        try {
            const response = await agent.post(
                `${GetSTTBatchByBatchIDORUnitIDForSchoolBatch}?UnitID=0&BatchID=${id}`
            );
            const fullBatch = response.data?.Data?.Table?.[0];
            if (!fullBatch) return;

            setIsViewingBatch(true);
            setSelectedSchoolId(Number(schoolId));
            setCreateBatchForm({
                batchStatus: fullBatch.BatchStatus || "Created",
                perDayTrainingHours: fullBatch.PerDayHours || "",
                batchStartDate: formatDateForInput(fullBatch.BatchStartDate),
                batchEndDate: formatDateForInput(fullBatch.BatchEndDate),
                batchReservation: fullBatch.BatchReservation === 0 ? "General"
                    : fullBatch.BatchReservation === 1 ? "Women"
                        : fullBatch.BatchReservation === 2 ? "PWD" : "",
                instructorType: fullBatch.InstructorType === 0 ? "Internal"
                    : fullBatch.InstructorType === 1 ? "External" : "",
                scheme: fullBatch.SchemeID === 2 ? "Government" : "Self-finance",
                applicableFees: fullBatch.ApplicableFee || "",
                intake: fullBatch.Intake || 0,
                admitted: fullBatch.Admitted || 0,
                passed: fullBatch.Pass || 0,
                failed: fullBatch.Fail || 0,
                absent: fullBatch.Absent || 0,
                batchId: fullBatch.BatchID,
                admissionEndDate: formatDateForInput(fullBatch.AdmissionEndDate),
                location: fullBatch.LocationName || "",
                minBatchDays: fullBatch.MinDays || "",
            });
            setIsCreatingNewBatch(false);
            setShowCreateForm(true);
        } catch (error) {
            console.error("Error fetching batch details:", error);
        }
    };
    const fetchBatchByUnit = async (unitID) => {
        try {
            const selected = unitData.find(u => u.unitID === unitID);
            setSelectedUnit(selected);

            // get unit info and next BatchID
            const templateResponse = await agent.post(
                `${GetSTTBatchByBatchIDORUnitIDForSchoolBatch}?UnitID=${unitID}&BatchID=0`
            );
            const templateTable = templateResponse.data?.Data?.Table || [];
            const unitInfo = templateTable[0];

            if (unitInfo) {
                setSelectedUnit(prev => ({
                    ...prev,
                    courseType: unitInfo.CourseType,
                    courseId: unitInfo.CourseID,
                    intake: unitInfo.Intake,
                    duration: unitInfo.DurationCal || parseInt(unitInfo.Duration) || prev.duration,
                    fees: unitInfo.CourseFee || prev.fees,
                }));
            }

            // Get batch list - limited fields 
            const batchesResponse = await agent.post(
                `${GetSTTSchoolBatchesByInstitute}?UnitID=${unitID}`
            );
            const batchTable = batchesResponse.data?.Data?.Table1 || [];

            if (!batchTable || batchTable.length === 0) {
                setBatchData([]);
                return;
            }

            // Format only available fields for table display
            const formattedBatch = batchTable.map((item, index) => ({
                srNo: index + 1,
                location: item.LocationName || "",
                batchId: item.BatchID,
                batchStartDate: formatDateForInput(item.BatchStartDate),
                batchEndDate: formatDateForInput(item.BatchEndDate),
                intake: item.Intake,
                admitted: item.Admitted,
                pass: item.Pass,
                fail: item.Fail,
                batchStatus: item.BatchStatus,
                schoolId: item.SchoolID || "",
            }));


            setBatchData(formattedBatch);

        } catch (error) {
            console.error(error);
        }
    };
    const formatDateForInput = (dateStr) => {
        if (!dateStr) return "";

        const cleanDate = dateStr.replace(/-/g, "/");

        const parts = cleanDate.split("/");

        if (parts.length !== 3) return "";

        const [day, month, year] = parts;

        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    };

    const handleSaveBatch = async () => {
        try {

            if (!createBatchForm.location) {
            Swal.fire({ icon: "warning", title: "Validation", text: "Please select a location." });
            return;
        }
        if (!selectedSchoolId) {
            Swal.fire({ icon: "warning", title: "Validation", text: "Please select a school." });
            return;
        }
        if (!createBatchForm.perDayTrainingHours || Number(createBatchForm.perDayTrainingHours) <= 0) {
            Swal.fire({ icon: "warning", title: "Validation", text: "Per Day Training Hours must be greater than 0." });
            return;
        }
        if (Number(createBatchForm.perDayTrainingHours) > 24) {
            Swal.fire({ icon: "warning", title: "Validation", text: "Per Day Training Hours cannot exceed 24." });
            return;
        }
        if (!createBatchForm.batchStartDate) {
            Swal.fire({ icon: "warning", title: "Validation", text: "Please select a Batch Start Date." });
            return;
        }
        if (!createBatchForm.batchEndDate) {
            Swal.fire({ icon: "warning", title: "Validation", text: "Please select a Batch End Date." });
            return;
        }
        if (new Date(createBatchForm.batchEndDate) < new Date(createBatchForm.batchStartDate)) {
            Swal.fire({ icon: "warning", title: "Validation", text: "Batch End Date cannot be before Batch Start Date." });
            return;
        }
        if (!createBatchForm.batchReservation) {
            Swal.fire({ icon: "warning", title: "Validation", text: "Please select a Batch Reservation type." });
            return;
        }
        if (!createBatchForm.scheme) {
            Swal.fire({ icon: "warning", title: "Validation", text: "Please select a Scheme." });
            return;
        }
        if (createBatchForm.applicableFees === "" || createBatchForm.applicableFees === null) {
            Swal.fire({ icon: "warning", title: "Validation", text: "Please enter Applicable Course Fees." });
            return;
        }
        if (Number(createBatchForm.applicableFees) > Number(selectedUnit?.fees || 0)) {
            const confirm = await Swal.fire({
                icon: "question",
                title: "Fees Warning",
                text: "Applicable Fees exceed the norm fees. Do you want to continue?",
                showCancelButton: true,
                confirmButtonText: "Yes",
                cancelButtonText: "No"
            });
            if (!confirm.isConfirmed) return;
        }

            let batchIdToUse = createBatchForm?.batchId;

            if (!batchIdToUse || batchIdToUse === 0) {
                const templateResponse = await agent.post(
                    `${GetSTTBatchByBatchIDORUnitIDForSchoolBatch}?UnitID=${selectedUnit?.unitID}&BatchID=0`
                );
                const templateData = templateResponse.data?.Data?.Table;
                if (templateData && templateData.length > 0) {
                    batchIdToUse = templateData[0].BatchID; // next suggested BatchID
                }
            }

            if (!selectedSchoolId) {
                Swal.fire({ icon: "warning", title: "Warning", text: "Please select a school." });
                return;
            }
            const payload = {
                batchId: Number(batchIdToUse) || 0,
                batchStatus: createBatchForm.batchStatus || "Created",
                course: selectedUnit?.courseName || "",
                shift: Number(selectedUnit?.shift || 0),
                unit: Number(selectedUnit?.unitNo || 0),
                unitId: selectedUnit?.unitID || "",
                courseType: selectedUnit?.courseType || "",
                duration: Number(selectedUnit?.duration || 0),
                perDayHours: Number(createBatchForm?.perDayTrainingHours || 0),
                minBatchDays: Number(createBatchForm?.minBatchDays || 0),
                batchStartDate: createBatchForm?.batchStartDate
                    ? new Date(createBatchForm.batchStartDate).toISOString()
                    : null,
                batchEndDate: createBatchForm?.batchEndDate
                    ? new Date(createBatchForm.batchEndDate).toISOString()
                    : null,
                admissionLastDate: createBatchForm?.admissionEndDate
                    ? new Date(createBatchForm.admissionEndDate).toISOString()
                    : null,
                batchReservation: createBatchForm?.batchReservation === "General" ? 0
                    : createBatchForm?.batchReservation === "Women" ? 1
                        : createBatchForm?.batchReservation === "PWD" ? 2 : 0,
                instructorType: createBatchForm?.instructorType === "Internal" ? 0
                    : createBatchForm?.instructorType === "External" ? 1 : 0,
                normFees: Number(selectedUnit?.fees || 0),
                applicableFees: Number(createBatchForm?.applicableFees || 0),
                intake: Number(createBatchForm?.intake || 0),
                admitted: Number(createBatchForm?.admitted || 0),
                vacant: Number(createBatchForm?.intake || 0) - Number(createBatchForm?.admitted || 0),
                passed: Number(createBatchForm?.passed || 0),
                failed: Number(createBatchForm?.failed || 0),
                absent: Number(createBatchForm?.absent || 0),
                createdBy: createdBy,
                createdIpAddress: ipAddress,
                collegeID: collegeID,
                courseID: selectedUnit?.courseId || 0,
                schemeID: createBatchForm?.scheme === "Government" ? 2 : 1,
                schoolID: Number(selectedSchoolId) || 0,
            };

            const response = await agent.post(InsertOrUpdateSTTSchoolBatchDetails, payload);

            const responseData = response.data?.Data;

            if (responseData === "N") {
                Swal.fire({ icon: "error", title: "Error", text: "Batch could not be saved." });
                return;
            }

            // Only set batchId if it's an actual number
            const batchesResponse = await agent.post(
                `${GetSTTSchoolBatchesByInstitute}?UnitID=${selectedUnit?.unitID}`
            );

            const unitTable = batchesResponse.data?.Data?.Table || [];
            const batchTable = batchesResponse.data?.Data?.Table1 || [];  // Table1 not Table

            const unitInfo = unitTable.find(u => u.UnitCode == selectedUnit?.unitID) || unitTable[0];
            if (unitInfo) {
                setSelectedUnit(prev => ({
                    ...prev,
                    courseType: unitInfo.CourseType,
                    courseId: unitInfo.CourseID,
                    intake: unitInfo.Intake,
                    duration: parseInt(unitInfo.Duration) || prev.duration,
                }));
            }

            if (batchTable && batchTable.length > 0) {
                const formattedBatch = batchTable.map((item, index) => ({
                    srNo: index + 1,
                    location: item.LocationName || "",
                    batchId: item.BatchID,
                    batchStartDate: formatDateForInput(item.BatchStartDate),
                    batchEndDate: formatDateForInput(item.BatchEndDate),
                    intake: item.Intake,
                    admitted: item.Admitted,
                    pass: item.Pass,
                    fail: item.Fail,
                    batchStatus: item.BatchStatus,
                    perDayTrainingHours: item.PerDayTrainingHours || "",
                    batchReservation: item.BatchReservation === 0 ? "General"
                        : item.BatchReservation === 1 ? "Women"
                            : item.BatchReservation === 2 ? "PWD" : "",
                    instructorType: item.InstructorType || "",
                    scheme: item.Scheme || "",
                    applicableFees: item.ApplicableFees || "",
                    admissionEndDate: formatDateForInput(item.AdmissionEndDate),
                    schoolId: item.SchoolID || ""
                }));

                setBatchData(formattedBatch);  // table updates immediately

                const savedBatch = formattedBatch.find(b => b.batchId == batchIdToUse)
                    || formattedBatch[formattedBatch.length - 1];

                setCreateBatchForm(prev => ({
                    ...prev,
                    batchId: savedBatch.batchId
                }));
            }

            Swal.fire({ icon: "success", title: "Success", text: "Batch saved successfully." });

        } catch (error) {
            console.error("Save error:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Error while saving batch."
            });
        }
    };


    return (
        <div className="mx-auto w-full rounded-lg bg-white p-6 shadow-md">
            <fieldset className="mb-4 rounded-md border p-4">
                <legend className="flex items-center gap-2 rounded-md border border-gray-400 bg-gray-500 px-4 py-2 text-lg font-semibold text-white">
                    Batches
                </legend>
                <FilteredTableComponent
                    className='pl-6 pr-6'
                    data={unitData}
                    columns={column}
                    searchable={true}
                    showExport={false}
                    showExcelTemplate={false}
                    showPDF={false}
                    sortable={true}
                    renderCell={(item, column) => {
                        if (column.key === "unitID") {
                            return (
                                <span
                                    className="text-blue-600 font-bold cursor-pointer hover:underline"
                                    // onClick={() => setSelectedUnit(item)}
                                    onClick={() => fetchBatchByUnit(item.unitID)}
                                >
                                    {item.unitID}
                                </span>
                            )
                        }
                    }}
                />
            </fieldset>
            {selectedUnit && (
                <>
                    <fieldset className="mb-4 rounded-md border p-4">
                        <legend className="flex items-center gap-2 rounded-md border border-gray-400 bg-gray-500 px-4 py-2 text-lg font-semibold text-white">
                            Create Batch
                        </legend>
                        <div></div>
                        <div className='flex mb-3'>
                            <label className="w-64 rounded-l-lg bg-blue-200 px-6 py-3 text-right">
                                Course
                            </label><span className='flex-grow rounded-r-lg border px-6 py-3'> <b>{selectedUnit.courseName}</b></span>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">


                            <div className="space-y-4">


                                <div className='flex'>
                                    <label className="w-64 rounded-l-lg bg-blue-200 px-6 py-3 text-right">
                                        Duration
                                    </label><span className='flex-grow rounded-r-lg border px-6 py-3'> <b>{selectedUnit?.duration}</b></span>
                                </div>


                                <div className='flex'>
                                    <label className="w-64 rounded-l-lg bg-blue-200 px-6 py-3 text-right">
                                        Shift
                                    </label><span className='flex-grow rounded-r-lg border px-6 py-3'> <b>{selectedUnit.shift}</b></span>
                                </div>

                            </div>
                            <div className="space-y-4">


                                <div className="flex">

                                    <label className="w-64 rounded-l-lg bg-blue-200 px-6 py-3 text-right">
                                        Course Type
                                    </label><span className='flex-grow rounded-r-lg border px-6 py-3'> <b>{selectedUnit?.courseType}</b></span>
                                </div>

                                <div className='flex'>


                                    <label className="w-64 rounded-l-lg bg-blue-200 px-6 py-3 text-right">
                                        Unit No
                                    </label><span className='flex-grow rounded-r-lg border px-6 py-3'> <b>{selectedUnit.unitNo}</b></span>
                                </div>
                            </div>
                        </div>
                        <FilteredTableComponent
                            className='pl-6 pr-6'
                            data={batchData}
                            columns={batchColumn}
                            searchable={false}
                            showExport={false}
                            showExcelTemplate={false}
                            showPDF={false}
                            sortable={false}
                            renderCell={(item, column) => {
                                if (column.key === "action") {
                                    return (
                                        <span className="text-blue-600 font-bold cursor-pointer hover:underline"
                                            onClick={() => viewBatch(item.batchId, item.schoolId)}>View Batch</span>
                                    )
                                }
                            }}
                        />
                        <hr className="my-4 border-gray-300" />
                        <div className='flex justify-end gap-3 mb-4 p-4'>
                            <Button
                                variant="success"
                                size="sm"
                                onClick={() => {
                                    setIsCreatingNewBatch(true);   // flag new batch creation
                                    setIsViewingBatch(false);       // not viewing, creating
                                    setCreateBatchForm({            // reset form for new batch
                                        batchStatus: "Created",
                                        perDayTrainingHours: "",
                                        batchStartDate: "",
                                        batchEndDate: "",
                                        batchReservation: "",
                                        instructorType: "",
                                        scheme: "Self-finance",
                                        applicableFees: "",
                                        intake: "",
                                        admitted: 0,
                                        passed: 0,
                                        failed: 0,
                                        absent: 0,
                                    });
                                    setSelectedSchoolId("");
                                    setShowCreateForm(true);
                                }}
                            >
                                Create Batch
                            </Button>

                            <Button
                                variant="danger"
                                size="sm"
                                onClick={() => {
                                    setSelectedUnit(null)
                                    setShowCreateForm(false);
                                 } }
                            >
                                Cancel
                            </Button>
                        </div>
                    </fieldset>
                </>
            )}
            {showCreateForm && (
                <>
                    <fieldset className="mb-4 rounded-md border p-4">
                        <legend className="flex items-center gap-2 rounded-md border border-gray-400 bg-gray-500 px-4 py-2 text-lg font-semibold text-white">
                            Batch Detail
                        </legend>

                        <div className='grid grid-cols-1 mt-4'>
                            <FormComponent
                                label="Course (Course Code)"
                                value={`${selectedUnit?.courseName}`}
                                disabled
                            />
                        </div>
                        <div className='grid grid-cols-1 mt-4'>
                            <DropdownComponent
                                label="Location"
                                options={[{ label: "Shirpur", value: "Shirpur" }]}
                                value={createBatchForm?.location || selectedUnit?.location || ""}
                                onChange={(value) => setCreateBatchForm({ ...createBatchForm, location: value })}
                                disabled={isViewingBatch || !isCreatingNewBatch}
                            />
                        </div>
                        <div className='grid grid-cols-1 mt-4'>
                            <DropdownComponent
                                label="School"
                                options={schoolsList.length > 0
                                    ? schoolsList
                                    : [{ label: "No schools available", value: "" }]
                                }
                                value={selectedSchoolId}
                                onChange={(value) => setSelectedSchoolId(value)}
                                disabled={isViewingBatch || !isCreatingNewBatch}
                            />
                        </div>

                        <div className="grid grid-cols-4 gap-4 mt-4">
                            <FormComponent
                                label="Batch Status"
                                value={createBatchForm.batchStatus}
                                disabled
                            />

                            <FormComponent
                                label="Shift"
                                value={selectedUnit?.shift}
                                disabled
                            />

                            <FormComponent
                                label="Unit"
                                value={selectedUnit?.unitNo}
                                disabled
                            />

                            <FormComponent
                                label="Unit ID"
                                value={selectedUnit?.unitID}
                                disabled
                            />
                            <FormComponent
                                label="Batch ID"
                                value={createBatchForm?.batchId || ""}
                                disabled
                            />

                            <FormComponent
                                label="Course Type"
                                value={selectedUnit?.courseType}
                                disabled
                            />

                            <FormComponent
                                label="Duration"
                                value={selectedUnit?.duration ? `${selectedUnit.duration} HOUR` : ""}
                                disabled
                            />


                            <FormComponent
                                label="Per Day Training (Hours)"
                                type="number"
                                value={createBatchForm?.perDayTrainingHours}
                                onChange={(value) => {
                                    const perDay = parseFloat(value) || 0;
                                    const duration = parseFloat(selectedUnit?.duration) || 0;
                                    const minDays = perDay > 0 ? Math.ceil(duration / perDay) : 0;

                                    let newEndDate = createBatchForm.batchStartDate;
                                    if (minDays > 0 && createBatchForm.batchStartDate) {
                                        const start = new Date(createBatchForm.batchStartDate);
                                        start.setDate(start.getDate() + minDays);
                                        newEndDate = start.toISOString().split("T")[0];
                                    }

                                    setCreateBatchForm({
                                        ...createBatchForm,
                                        perDayTrainingHours: value,
                                        minBatchDays: minDays,
                                        batchEndDate: newEndDate
                                    });
                                }}
                                disabled={isViewingBatch}
                            />

                            <FormComponent
                                label="Minimum Batch Days"
                                type="number"
                                value={createBatchForm?.minBatchDays || ""}
                                disabled
                            />

                            <FormComponent
                                label="Batch Start Date"
                                type="date"
                                value={createBatchForm?.batchStartDate || ""}
                                min={new Date().toISOString().split("T")[0]}
                                onChange={(value) => {
                                    const minDays = parseFloat(createBatchForm.minBatchDays) || 0;
                                    let newEndDate = value;
                                    if (minDays > 0 && value) {
                                        const start = new Date(value);
                                        start.setDate(start.getDate() + minDays);
                                        newEndDate = start.toISOString().split("T")[0];
                                    }

                                    setCreateBatchForm({
                                        ...createBatchForm,
                                        batchStartDate: value,
                                        admissionEndDate: value,
                                        batchEndDate: newEndDate
                                    });
                                }}
                                disabled={isViewingBatch}
                            />

                            <FormComponent
                                label="Batch End Date"
                                type="date"
                                value={createBatchForm.batchEndDate || ""}
                                min={(() => {
                                    if (createBatchForm.batchStartDate && createBatchForm.minBatchDays) {
                                        const start = new Date(createBatchForm.batchStartDate);
                                        start.setDate(start.getDate() + Number(createBatchForm.minBatchDays));
                                        return start.toISOString().split("T")[0];
                                    }
                                    return createBatchForm.batchStartDate || "";
                                })()}
                                onChange={(value) => {
                                    setCreateBatchForm({
                                        ...createBatchForm,
                                        batchEndDate: value
                                    })
                                }}
                                disabled={isViewingBatch}
                            />

                            <FormComponent
                                label="Admission Last Date"
                                type="date"
                                value={createBatchForm?.admissionEndDate || ""}
                                disabled
                            />

                        </div>
                        <div className='grid grid-cols-4 gap-4 mt-4'>
                            <DropdownComponent
                                label="Batch Reservation"
                                options={[
                                    { label: "General", value: "General" },
                                    { label: "Women", value: "Women" },
                                    { label: "PWD", value: "PWD" },
                                ]}
                                value={createBatchForm?.batchReservation}
                                onChange={(value) => {
                                    setCreateBatchForm({
                                        ...createBatchForm,
                                        batchReservation: value
                                    })
                                }}
                                disabled={isViewingBatch}
                            />

                            <DropdownComponent
                                label="Instructor Type"
                                options={[
                                    { label: "Select", value: "" },
                                    { label: "Internal", value: "Internal" },
                                    { label: "External", value: "External" }
                                ]}
                                value={createBatchForm?.instructorType}
                                onChange={(value) => {
                                    setCreateBatchForm({
                                        ...createBatchForm,
                                        instructorType: value
                                    })
                                }}
                                disabled={true}
                            />

                            <DropdownComponent
                                label="Scheme"
                                options={[
                                    { label: "Self-finance", value: "Self-finance" },
                                    { label: "Government", value: "Government" }
                                ]}
                                value={createBatchForm?.scheme || "Self-finance"}
                                onChange={(value) => {
                                    setCreateBatchForm({
                                        ...createBatchForm,
                                        scheme: value
                                    })
                                }}
                                disabled={isViewingBatch}
                            />
                        </div>
                        <div className='grid grid-cols-4 gap-4 mt-4'>
                            <FormComponent
                                label="Course Fees as per Norms"
                                value={selectedUnit?.fees || 0}
                                disabled
                            />

                            <FormComponent
                                label="Applicable Course Fees"
                                type="number"
                                value={createBatchForm?.applicableFees}
                                onChange={(value) => {
                                    setCreateBatchForm({
                                        ...createBatchForm,
                                        applicableFees: value
                                    })
                                }}
                                disabled={isViewingBatch}
                            />
                        </div>
                        <div className='grid grid-cols-3 gap-4 mt-4'>
                            <FormComponent
                                label="Intake"
                                type="number"
                                value={createBatchForm?.intake || 0}
                                disabled
                            />

                            <FormComponent
                                label="Admitted"
                                type="number"
                                value={createBatchForm.admitted || 0}
                                disabled
                            />

                            <FormComponent
                                label="Vacant"
                                type="number"
                                value={(createBatchForm.intake || 0) - (createBatchForm.admitted || 0)}
                                disabled
                            />

                            <FormComponent
                                label="Passed"
                                type="number"
                                value={createBatchForm?.passed || 0}
                                disabled
                            />

                            <FormComponent
                                label="Failed"
                                type="number"
                                value={createBatchForm?.failed || 0}
                                disabled
                            />

                            <FormComponent
                                label="Absent"
                                type="number"
                                value={createBatchForm?.absent || 0}
                                disabled
                            />

                        </div>
                        {!isViewingBatch && (
                            <>
                                <hr className="my-6 border-gray-300" />

                                <div className="flex justify-start gap-3">
                                    <Button variant="secondary" size="sm" onClick={() => navigate('/institute/dashboard')}>Back</Button>
                                    <Button variant="success" size="sm" onClick={handleSaveBatch}>Save</Button>
                                    <Button variant="warning" size="sm" onClick={() => setShowCreateForm(false)}>Close</Button>
                                </div>
                            </>
                        )}
                    </fieldset>
                    {createBatchForm?.batchId && (
                        <AdmittedCandidates batchId={createBatchForm.batchId} />
                    )}
                </>
            )}

        </div>
    )
}

export default ActiveBatch;