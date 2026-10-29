import { useContext, useEffect, useRef, useState } from "react";
import FilteredTableComponent from "../formcomponent/FilteredTableComponent";
import { ThemeContext } from "../Context/ThemeContext";
import agent from "../../lib/api/agent";
import { GetInstituteIDByInstituteCode } from "../../Endpoints_All/Base/Institute";
import { useAuth } from "../../Hooks/AuthContext";
import { GETBatchDetails, GetBatchDetailsByInstitute, GetNewBatchDetails, GetUnitByInstitute, SaveBatchDetails, UpdateBatchDetails } from "../../Endpoints_All/Admission/admission";
import DropdownComponent from "../formcomponent/DropdownComponent";
import FormComponent from "../formcomponent/FormComponent";
import { FaEdit, FaTrash } from "react-icons/fa";
import Button from "../base/Button"
import { useNavigate } from "react-router-dom";
import { DateInput } from "../formcomponent/DateInputComponent";
import Swal from "sweetalert2";
import Loader from "../base/Loader";

const column = [
    { header: "Sr. No.", key: "srNo", width: "60px", className: "text-center", headerClassName: "text-center" },
    { header: "Course Name", key: "CourseName", width: "600px", className: "text-center" },
    { header: "Shift", key: "ShiftID", width: "60px", className: "text-center" },
    { header: "Unit No", key: "UnitNo", width: "60px", className: "text-center" },
    { header: "Unit Code", key: "UnitCode", width: "60px", className: "text-center" },
    { header: "Unit Status", key: "UnitStatus", width: "120px", className: "text-center" },
    { header: "Action", key: "Action", width: "100px", className: "text-center" }
]
const batchColumn = [
    { header: "Sr. No.", key: "srNo", width: "60px", className: "text-center", headerClassName: "text-center" },
    { header: "Batch ID", key: "BatchID", width: "120px", className: "text-center" },
    { header: "Course Name", key: "CourseName", width: "600px", className: "text-center" },
    { header: "Exam Type", key: "ExamType", width: "60px", className: "text-center" },
    { header: "Unit Code", key: "UnitID", width: "60px", className: "text-center" },
    { header: "Intake", key: "Intake", width: "60px", className: "text-center" },
    { header: "Admitted", key: "Admitted", width: "60px", className: "text-center" },
    { header: "Vacant", key: "Vacant", width: "60px", className: "text-center" },
    { header: "Batch Month", key: "BatchName", width: "60px", className: "text-center" },
    { header: "Approve Status", key: "Approved", width: "60px", className: "text-center" },
]
const selectedCourseBatchDetailsColumn = [
    { header: "Sr. No.", key: "srNo", width: "60px", className: "text-center", headerClassName: "text-center" },
    { header: "Batch ID", key: "BatchID", width: "120px", className: "text-center" },
    { header: "Batch Start Date", key: "BatchStartDate", width: "120px", className: "text-center" },
    { header: "Batch End Date", key: "BatchEndDate", width: "120px", className: "text-center" },
    { header: "Admission Last Date", key: "AdmissionEndDate", width: "140px", className: "text-center" },
    { header: "Intake", key: "Intake", width: "60px", className: "text-center" },
    { header: "Admitted", key: "Admitted", width: "60px", className: "text-center" },
    { header: "Vacant", key: "Vacant", width: "60px", className: "text-center" },
    { header: "Pass", key: "Pass", width: "60px", className: "text-center" },
    { header: "Fail", key: "Fail", width: "60px", className: "text-center" },
    { header: "Batch Status", key: "BatchStatusName", width: "140px", className: "text-center" },
    { header: "Action", key: "Action", width: "60px", className: "text-center" },
]
const BatchDetails = () => {
    const { color } = useContext(ThemeContext);
    const { userInfo } = useAuth();
    const navigate = useNavigate();

    const [instituteID, setInstituteID] = useState(null);
    const [courseData, setCourseData] = useState([]);
    const [batchWiseCourseData, setBatchWiseCourseData] = useState([]);
    const [showCourseBatchDetailsPopup, setShowCourseBatchDetailsPopup] = useState(false);
    const [selectedCourseID, setSelectedCourseID] = useState(null);
    const [selectedCourseBatchDetails, setSelectedCourseBatchDetails] = useState([]);
    const [showEditBatchDetailsPopup, setShowEditBatchDetailsPopup] = useState(false);
    const [dataForEditBatchDetails, setDataForEditBatchDetails] = useState([]);
    const [batchEndDate, setBatchEndDate] = useState("");

    const [showCreateBatchPopup, setShowCreateBatchPopup] = useState(false);
    const [createBatchData, setCreateBatchData] = useState(null);

    const [createBatchStartDate, setCreateBatchStartDate] = useState("");
    const [createBatchEndDate, setCreateBatchEndDate] = useState("");
    const [createAdmissionEndDate, setCreateAdmissionEndDate] = useState("");

    const [createBatchErrors, setCreateBatchErrors] = useState({});
    const [isCreatingBatch, setIsCreatingBatch] = useState(false);
    const [createBatchMessage, setCreateBatchMessage] = useState("");
    const createBatchRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchBatchDetails();
    }, []);

    const getCreateBatchDateLimits = (startDate, minTrainingDays, minLastDays) => {
        if (!startDate) {
            return {
                batchEndMax: null,
                admissionEndMax: null
            };
        }

        const [day, month, year] = startDate.split("/").map(Number);

        const start = new Date(year, month - 1, day);

        const batchEndMax = new Date(start);
        batchEndMax.setDate(
            batchEndMax.getDate() + Number(minTrainingDays || 0)
        );

        const admissionEndMax = new Date(start);
        admissionEndMax.setDate(
            admissionEndMax.getDate() + Number(minLastDays || 0)
        );

        return {
            batchEndMax,
            admissionEndMax
        };
    };

    const parseDDMMYYYY = (dateStr) => {
        if (!dateStr || typeof dateStr !== "string") {
            return null;
        }

        const parts = dateStr.trim().split("/");

        if (parts.length !== 3) {
            return null;
        }

        const day = Number(parts[0]);
        const month = Number(parts[1]);
        const year = Number(parts[2]);

        if (
            !Number.isInteger(day) ||
            !Number.isInteger(month) ||
            !Number.isInteger(year)
        ) {
            return null;
        }
        if (
            day < 1 ||
            day > 31 ||
            month < 1 ||
            month > 12 ||
            year < 1900
        ) {
            return null;
        }

        const date = new Date(year, month - 1, day);

        if (
            date.getFullYear() !== year ||
            date.getMonth() !== month - 1 ||
            date.getDate() !== day
        ) {
            return null;
        }

        date.setHours(0, 0, 0, 0);

        return date;
    };

    const validateCreateBatch = () => {
        const errors = {};

        const startDate = parseDDMMYYYY(createBatchStartDate);
        const endDate = parseDDMMYYYY(createBatchEndDate);
        const admissionEndDate = parseDDMMYYYY(createAdmissionEndDate);


        if (!createBatchStartDate?.trim()) {
            errors.startDate = "Please Enter Batch Start Date.";
        } else if (!startDate) {
            errors.startDate = "Please Select Proper Batch Start Date.";
        }

        if (!createBatchEndDate?.trim()) {
            errors.endDate = "Please Enter Batch End Date.";
        } else if (!endDate) {
            errors.endDate = "Please Select Proper Batch End Date.";
        }

        if (!createAdmissionEndDate?.trim()) {
            errors.admissionEndDate = "Please Enter Admission Last Date.";
        } else if (!admissionEndDate) {
            errors.admissionEndDate =
                "Please Select Proper Last Date Of Admission.";
        }

        // Stop if required/date-format validation failed
        if (Object.keys(errors).length > 0) {
            setCreateBatchErrors(errors);
            return false;
        }
        if (startDate.getTime() >= admissionEndDate.getTime()) {
            errors.startDate =
                "Batch Start Date must be before Admission Last Date.";
        }
        if (endDate.getTime() <= admissionEndDate.getTime()) {
            errors.endDate = "Batch End Date must be after Admission Last Date.";
        }

        if (endDate.getTime() <= startDate.getTime()) {
            errors.endDate = "Batch End Date must be after Batch Start Date.";
        }

        const { batchEndMax, admissionEndMax } =
            getCreateBatchDateLimits(
                createBatchStartDate,
                createBatchData?.MinBathDays,
                createBatchData?.MinLastDays
            );

        if (batchEndMax && endDate.getTime() > batchEndMax.getTime()) {
            errors.endDate =
                "Please Select Proper Batch End Date.";
        }

        if (
            admissionEndMax &&
            admissionEndDate.getTime() > admissionEndMax.getTime()
        ) {
            errors.admissionEndDate =
                "Please Select Proper Last Date Of Admission.";
        }

        setCreateBatchErrors(errors);

        return Object.keys(errors).length === 0;
    };
    const handleCreateBatch = async () => {

        setCreateBatchErrors({});

        const isValid = validateCreateBatch();

        if (!isValid) {
            return;
        }

        if (!createBatchData) {
            alert("Batch details are not available.");
            return;
        }

        const batchStartDateISO = convertToISO(createBatchStartDate);
        const batchEndDateISO = convertToISO(createBatchEndDate);
        const admissionEndDateISO = convertToISO(createAdmissionEndDate);

        if (!batchStartDateISO) {
            setCreateBatchErrors({
                startDate: "Please Select Proper Batch Start Date."
            });
            return;
        }

        if (!batchEndDateISO) {
            setCreateBatchErrors({
                endDate: "Please Select Proper Batch End Date."
            });
            return;
        }

        if (!admissionEndDateISO) {
            setCreateBatchErrors({
                admissionEndDate:
                    "Please Select Proper Last Date Of Admission."
            });
            return;
        }


        const payload = {
            instituteID:
                createBatchData?.InstituteID ||
                createBatchData?.CollegeID ||
                instituteID ||
                0,

            instituteCode:
                createBatchData?.InstituteCode ||
                userInfo?.UserLoginID ||
                "",

            instituteName:
                createBatchData?.InstituteName ||
                "",

            courseID:
                createBatchData?.CourseID ||
                0,

            course:
                createBatchData?.CourseName ||
                "",

            courseCode:
                createBatchData?.CourseCode ||
                "",

            partFullTime:
                createBatchData?.BatchSchedue ||
                "",

            shiftID:
                createBatchData?.ShiftID ||
                0,

            shift:
                createBatchData?.ShiftID?.toString() ||
                "",

            unitNo:
                createBatchData?.UnitNo ||
                0,

            unitCode:
                createBatchData?.UnitID ||
                createBatchData?.UnitCode ||
                0,

            batchID:
                createBatchData?.BatchID ||
                0,

            batchStatus:
                createBatchData?.BatchStatusName ||
                createBatchData?.BatchStatus ||
                "",

            batchStartDate: batchStartDateISO,

            batchEndDate: batchEndDateISO,

            admissionEndDate: admissionEndDateISO,

            ipAddress: "",

            userLoginID:
                userInfo?.UserLoginID ||
                "",

            pageCode: "BatchDetails"
        };

        try {

            setIsCreatingBatch(true);

            const response = await agent.post(
                `${SaveBatchDetails}`,
                payload
            );

            console.log("Save Batch Response:", response);

            const returnValue = response?.data?.Data;

            if (response?.data?.StatusCode === 200) {

                if (returnValue === "Y") {

                    await Swal.fire({
                        icon: "success",
                        title: "Success",
                        text: "Batch created successfully!",
                        confirmButtonText: "OK"
                    });

                    setShowCreateBatchPopup(false);
                    setCreateBatchData(null);

                    setCreateBatchStartDate("");
                    setCreateBatchEndDate("");
                    setCreateAdmissionEndDate("");

                    setCreateBatchErrors({});

                    await fetchBatchDetails();

                } else {

                    setCreateBatchMessage(
                        returnValue ||
                        response?.data?.Message ||
                        "Unable to create batch."
                    );
                }

            } else {

                // DON'T use alert here
                setCreateBatchMessage(
                    response?.data?.Message ||
                    "Unable to create batch."
                );
            }
            console.error(
                "Error while creating batch:",
                error
            );

            alert(
                error?.response?.data?.Message ||
                "An error occurred while creating batch."
            );

        } finally {

            setIsCreatingBatch(false);
        }
    };

    const fetchBatchDetails = async () => {
        setIsLoading(true);

        try {
            const getInstId = await agent.get(
                `${GetInstituteIDByInstituteCode}?InstituteCode=${userInfo?.UserLoginID}`
            );

            if (
                !getInstId?.data?.Data ||
                getInstId?.data?.StatusCode !== 200
            ) {
                return;
            }

            const instituteId = getInstId.data.Data;

            setInstituteID(instituteId);

            const response = await agent.get(
                `${GetUnitByInstitute}?instituteID=${instituteId}`
            );

            setCourseData(
                response?.data?.Data?.Table || []
            );

            const batchdDetailsResponse = await agent.get(
                `${GetBatchDetailsByInstitute}?instituteId=${instituteId}`
            );

            setBatchWiseCourseData(
                batchdDetailsResponse?.data?.Data || []
            );

        } catch (error) {
            console.error("Error while fetching batch details:", error);
        } finally {
            setIsLoading(false);
        }
    };
    const tableData = courseData.map((item, index) => ({
        ...item,
        srNo: index + 1,
    }))

    const batchWiseTableData = batchWiseCourseData.map((item, index) => ({
        ...item,
        srNo: index + 1,
    }))
    const openViewBatchPopup = async (CourseID, ShiftID, UnitNo, courseData) => {
        if (!CourseID) return;

        const response = await agent.get(`${GETBatchDetails}?instituteId=${instituteID}&courseId=${CourseID}&shiftId=${ShiftID}&unitNo=${UnitNo}`);

        if (response?.data?.Data && response?.data?.Data?.Table.length > 0) {
            setSelectedCourseBatchDetails(response.data.Data.Table || []);
        }

        setShowCourseBatchDetailsPopup(true);
        setSelectedCourseID(CourseID);
    }

    const openCreateBatchPopup = async (item) => {
        if (!item) return;

        try {
            const instituteId = item?.CollegeID || instituteID;
            const courseId = item?.CourseID;
            const shiftId = item?.ShiftID;
            const unitNo = item?.UnitNo;

            if (!instituteId || !courseId || !shiftId || !unitNo) {
                alert("Required batch details are missing.");
                return;
            }

            const response = await agent.get(
                `${GetNewBatchDetails}?InstituteID=${instituteId}&CourseID=${courseId}&ShiftID=${shiftId}&UnitNo=${unitNo}`
            );

            console.log("GetNewBatchDetails Response:", response);

            if (response?.data?.StatusCode !== 200) {
                alert(
                    response?.data?.Message ||
                    "Unable to get batch details."
                );
                return;
            }

            const responseData = response?.data?.Data;

            // Handle Data.Table response
            const batchData =
                responseData?.Table?.length > 0
                    ? responseData.Table[0]
                    : Array.isArray(responseData)
                        ? responseData[0]
                        : responseData;

            if (!batchData) {
                alert("No batch details found.");
                return;
            }
            setCreateBatchData({
                ...batchData,

                // Preserve values from clicked row
                InstituteID: instituteId,
                CollegeID: instituteId,
                CourseID: courseId,
                ShiftID: shiftId,
                UnitNo: unitNo
            });

            // Set dates returned by API
            setCreateBatchStartDate(
                formatDateForInput(batchData?.BatchStartDate)
            );

            setCreateBatchEndDate(
                formatDateForInput(batchData?.BatchEndDate)
            );

            setCreateAdmissionEndDate(
                formatDateForInput(batchData?.AdmissionEndDate)
            );

            setShowEditBatchDetailsPopup(false);
            setShowCourseBatchDetailsPopup(false);

            setCreateBatchMessage("");

            setShowCreateBatchPopup(true);

            setTimeout(() => {
                window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                });
            }, 100);

        } catch (error) {
            console.error(
                "Error while opening Create Batch:",
                error
            );

            alert(
                error?.response?.data?.Message ||
                "Unable to load Create Batch details."
            );
        }
    };
    const openEditBatchDetails = (item) => {
        if (!item) return;
        setDataForEditBatchDetails(item);

        setShowEditBatchDetailsPopup(true);
    }
    const selectedCourseBatchDetailsData = selectedCourseBatchDetails.map((item, index) => ({
        ...item,
        srNo: index + 1,
    }))

    const handleEditBatchDetails = async (batchData) => {
        if (!batchData) {
            return;
        }
        const batchEndISO = convertToISO(batchEndDate);
        if (!batchEndISO) {
            alert("Please enter a valid Batch End Date.");
            return;
        }


        const payload = {
            courseID: batchData?.CourseID || 0,
            instituteID: instituteID || 0,
            instituteCode: userInfo?.UserLoginID || "",
            courseCode: batchData?.CourseCode || "",
            partFullTime: batchData?.BatchSchedue || "",
            shiftID: batchData?.ShiftID || 0,
            unitNo: batchData?.UnitNo || 0,
            shift: batchData?.ShiftID?.toString() || "",
            admissionSessionID: batchData?.AdmissionSessionID || 0,
            unitCode: batchData?.UnitID || 0,
            batchID: batchData?.BatchID || 0,
            batchStatusID: batchData?.BatchStatusID || 0,
            batchStatus: batchData?.BatchStatusName || "",
            course: batchData?.CourseName || "",
            instituteName: batchData?.InstituteName || "",
            intake: batchData?.Intake || 0,
            userLoginID: userInfo?.UserLoginID || "",
            ipAddress: "",
            pageCode: "",
            isDeleted: false,
            isSystemCreated: false,
            batchStartDate: convertToISO(formatDateForInput(batchData?.BatchStartDate))
                ?? new Date().toISOString(),
            batchEndDate: batchEndISO,
            admissionEndDate: convertToISO(formatDateForInput(batchData?.AdmissionEndDate))
                ?? new Date().toISOString(),
        };


        try {
            const response = await agent.put(`${UpdateBatchDetails}`, payload);

            if (response?.data?.StatusCode === 200) {
                alert("Batch details updated successfully!");
                setShowEditBatchDetailsPopup(false);
                setShowCourseBatchDetailsPopup(false);
                setDataForEditBatchDetails([]);
                setSelectedCourseBatchDetails([]);
                setBatchEndDate("");
                fetchBatchDetails();
            } else {
                alert(response?.data?.Message || "Update failed.");
            }
        } catch (error) {
            alert("An error occurred while updating.");
        }

    }

    const formatDateForInput = (dateStr) => {
        if (!dateStr) return "";

        // Already in dd/MM/yyyy format
        if (typeof dateStr === "string" && dateStr.includes("/")) {
            const parts = dateStr.split("/");

            if (
                parts.length === 3 &&
                parts[0] &&
                parts[1] &&
                parts[2]
            ) {
                return `${parts[0]}/${parts[1]}/${parts[2]}`;
            }
        }

        // dd.MM.yyyy format
        if (typeof dateStr === "string" && dateStr.includes(".")) {
            const parts = dateStr.split(".");

            if (
                parts.length === 3 &&
                parts[0] &&
                parts[1] &&
                parts[2]
            ) {
                return `${parts[0]}/${parts[1]}/${parts[2]}`;
            }
        }

        // ISO date from API
        if (typeof dateStr === "string" && dateStr.includes("T")) {
            const date = new Date(dateStr);

            if (!isNaN(date.getTime())) {
                const day = String(date.getDate()).padStart(2, "0");
                const month = String(date.getMonth() + 1).padStart(2, "0");
                const year = date.getFullYear();

                return `${day}/${month}/${year}`;
            }
        }

        return "";
    };

    const isSameOrBefore = (date1, date2) => {
        if (!date1 || !date2) return false;

        return date1.getTime() <= date2.getTime();
    };

    const isBefore = (date1, date2) => {
        if (!date1 || !date2) return false;

        return date1.getTime() < date2.getTime();
    };

    const isAfter = (date1, date2) => {
        if (!date1 || !date2) return false;

        return date1.getTime() > date2.getTime();
    };

    const convertToISO = (dateStr) => {
        if (!dateStr) return null;

        const parts = dateStr.split("/");

        if (parts.length !== 3) {
            return null;
        }

        const day = Number(parts[0]);
        const month = Number(parts[1]);
        const year = Number(parts[2]);

        if (
            !Number.isInteger(day) ||
            !Number.isInteger(month) ||
            !Number.isInteger(year) ||
            day < 1 ||
            month < 1 ||
            month > 12 ||
            year < 1900
        ) {
            return null;
        }

        const date = new Date(year, month - 1, day);

        // Prevent invalid dates such as 31/02/2026
        if (
            date.getFullYear() !== year ||
            date.getMonth() !== month - 1 ||
            date.getDate() !== day
        ) {
            return null;
        }

        return date.toISOString();
    };

    return (
        <div className="mx-auto w-full rounded-lg bg-white p-6 shadow-md">
            {createBatchMessage && (
                <div className="mb-5 rounded-md bg-red-100 px-3 py-3">
                    <label className="text-red-700 text-sm font-medium">
                        {createBatchMessage}
                    </label>
                </div>
            )}
            <fieldset className="mb-4 rounded-md border p-4">
                <legend className={`flex ${color} items-center text-base font-semibold text-white border-2 border-gray-300 px-3 py-1.5 rounded-md ml-4`}>
                    Batch Details
                </legend>
                {/* ================= CREATE BATCH ================= */}
                {showCreateBatchPopup && createBatchData && (
                    <fieldset ref={createBatchRef} className="mb-4 rounded-md border border-gray-300 px-3 py-2 shadow-sm">

                        <legend
                            className={`flex ${color} items-center text-sm font-semibold text-white border border-gray-300 px-2.5 py-1 rounded-md ml-3`}
                        >
                            Create Batch
                        </legend>


                        <div className="pb-2">

                            {/* Course */}
                            <div className="grid grid-cols-4 mt-2">
                                <div className="col-span-1">
                                    <label>Course</label>
                                </div>

                                <div className="col-span-3">
                                    <span className="font-semibold">
                                        {createBatchData?.CourseName || ""}
                                    </span>
                                </div>
                            </div>


                            {/* Course Code / Course Type */}
                            <div className="grid grid-cols-4 gap-4 mt-4">

                                <div className="col-span-1">
                                    <label>Course Code</label>
                                </div>

                                <div className="col-span-1">
                                    <span className="font-semibold">
                                        {createBatchData?.CourseCode || ""}
                                    </span>
                                </div>

                                <div className="col-span-1">
                                    <label>Course Type</label>
                                </div>

                                <div className="col-span-1">
                                    <span className="font-semibold">
                                        {createBatchData?.CourseType || ""}
                                    </span>
                                </div>

                            </div>


                            {/* Duration / Full Time */}
                            <div className="grid grid-cols-4 gap-4 mt-4">

                                <div className="col-span-1">
                                    <label>Duration</label>
                                </div>

                                <div className="col-span-1">
                                    <span className="font-semibold">
                                        {createBatchData?.DurationFull ||
                                            createBatchData?.Duration ||
                                            ""}
                                    </span>
                                </div>

                                <div className="col-span-1">
                                    <label>Full Time/ Part Time</label>
                                </div>

                                <div className="col-span-1">
                                    <span className="font-semibold">
                                        {createBatchData?.BatchSchedue || ""}
                                    </span>
                                </div>

                            </div>


                            {/* Shift / Unit No */}
                            <div className="grid grid-cols-4 gap-4 mt-4">

                                <div className="col-span-1">
                                    <label>Shift</label>
                                </div>

                                <div className="col-span-1">
                                    <span className="font-semibold">
                                        {createBatchData?.ShiftID || ""}
                                    </span>
                                </div>

                                <div className="col-span-1">
                                    <label>Unit No</label>
                                </div>

                                <div className="col-span-1">
                                    <span className="font-semibold">
                                        {createBatchData?.UnitNo || ""}
                                    </span>
                                </div>

                            </div>


                            {/* Unit Code / Batch ID */}
                            <div className="grid grid-cols-4 gap-4 mt-4">

                                <div className="col-span-1">
                                    <label>Unit Code</label>
                                </div>

                                <div className="col-span-1">
                                    <span className="font-semibold">
                                        {createBatchData?.UnitID ||
                                            createBatchData?.UnitCode ||
                                            ""}
                                    </span>
                                </div>

                                <div className="col-span-1">
                                    <label>Batch ID</label>
                                </div>

                                <div className="col-span-1">
                                    <span className="font-semibold">
                                        {createBatchData?.BatchID || ""}
                                    </span>
                                </div>

                            </div>


                            {/* Exam Type / Minimum Training Days */}
                            <div className="grid grid-cols-4 gap-4 mt-4">

                                <div className="col-span-1">
                                    <label>Exam Type</label>
                                </div>

                                <div className="col-span-1">
                                    <span className="font-semibold">
                                        {createBatchData?.ExamType || ""}
                                    </span>
                                </div>

                                <div className="col-span-1">
                                    <label>Minimum Training Days</label>
                                </div>

                                <div className="col-span-1">
                                    <span className="font-semibold">
                                        {createBatchData?.MinBathDays || ""}
                                    </span>
                                </div>

                            </div>


                            <hr className="my-5 border-gray-200" />


                            {/* Dates */}
                            <div className="grid grid-cols-3 gap-4">

                                {/* Batch Start Date */}
                                <div>
                                    <DateInput
                                        label="Batch Start Date"
                                        value={createBatchStartDate}
                                        onChange={(value) => {
                                            setCreateBatchStartDate(value);

                                            setCreateBatchErrors((prev) => ({
                                                ...prev,
                                                startDate: ""
                                            }));
                                        }}
                                    />

                                    {createBatchErrors.startDate && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {createBatchErrors.startDate}
                                        </p>
                                    )}
                                </div>


                                {/* Batch End Date */}
                                <div>
                                    <DateInput
                                        label="Batch End Date"
                                        value={createBatchEndDate}
                                        onChange={(value) => {
                                            setCreateBatchEndDate(value);

                                            setCreateBatchErrors((prev) => ({
                                                ...prev,
                                                endDate: ""
                                            }));
                                        }}
                                    />

                                    {createBatchErrors.endDate && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {createBatchErrors.endDate}
                                        </p>
                                    )}
                                </div>


                                {/* Admission Last Date */}
                                <div>
                                    <DateInput
                                        label="Last Date of Admission"
                                        value={createAdmissionEndDate}
                                        onChange={(value) => {
                                            setCreateAdmissionEndDate(value);

                                            setCreateBatchErrors((prev) => ({
                                                ...prev,
                                                admissionEndDate: ""
                                            }));
                                        }}
                                    />

                                    {createBatchErrors.admissionEndDate && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {createBatchErrors.admissionEndDate}
                                        </p>
                                    )}
                                </div>

                            </div>


                            {/* Buttons */}
                            <div className="flex justify-end gap-3 mt-5">

                                <Button
                                    variant="success"
                                    onClick={handleCreateBatch}
                                    disabled={isCreatingBatch}
                                >
                                    {isCreatingBatch ? "Creating..." : "Create Batch"}
                                </Button>

                                <Button
                                    variant="danger"
                                    onClick={() => {
                                        setShowCreateBatchPopup(false);
                                        setCreateBatchData(null);

                                        setCreateBatchStartDate("");
                                        setCreateBatchEndDate("");
                                        setCreateAdmissionEndDate("");

                                        setCreateBatchErrors({});
                                        setIsCreatingBatch(false);
                                    }}
                                >
                                    Cancel
                                </Button>

                            </div>

                        </div>

                    </fieldset>
                )}
                {isLoading ? (
                        <Loader /> 
                ) : !showCourseBatchDetailsPopup ? (
                    <>
                        <FilteredTableComponent
                            className='pl-6 pr-6'
                            data={tableData ?? []}
                            columns={column}
                            searchable={true}
                            showExport={false}
                            showExcelTemplate={false}
                            showPDF={false}
                            sortable={true}
                            renderCell={(item, column) => {
                                if (column.key === "Action") {
                                    return (
                                        <span
                                            className="text-blue-600 font-bold cursor-pointer hover:underline"
                                            onClick={() => {
                                                if (item?.BatchStatus === "View Batch") {
                                                    openViewBatchPopup(
                                                        item?.CourseID,
                                                        item?.ShiftID,
                                                        item?.UnitNo,
                                                        item
                                                    );
                                                }
                                                else if (item?.BatchStatus === "Create Batch") {
                                                    openCreateBatchPopup(item);
                                                }
                                            }}
                                        >
                                            {item?.BatchStatus}
                                        </span>
                                    );
                                }

                                return item?.[column.key];
                            }}
                        />
                        <FilteredTableComponent
                            className='pl-6 pr-6'
                            data={batchWiseTableData ?? []}
                            columns={batchColumn}
                            searchable={true}
                            showExport={false}
                            showExcelTemplate={false}
                            showPDF={false}
                            sortable={true}
                        />
                    </>
                ) :
                    <>
                        <div className="pb-8">
                            <div className='grid grid-cols-4 mt-4'>
                                <div className="col-span-1">
                                    <label htmlFor="course">Course </label>
                                </div>
                                <div className="col-span-3">
                                    <span className="font-semibold">{selectedCourseBatchDetails?.[0]?.CourseName || ''}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-4 gap-4 mt-4">
                                <div className="col-span-1">
                                    <label htmlFor="course">Course Code </label>
                                </div>
                                <div className="col-span-1">
                                    <span className="font-semibold">{selectedCourseBatchDetails?.[0]?.CourseCode || ''}</span>
                                </div>

                                <div className="col-span-1">
                                    <label htmlFor="course">Course Type </label>
                                </div>
                                <div className="col-span-1">
                                    <span className="font-semibold">{selectedCourseBatchDetails?.[0]?.CourseType || ''}</span>
                                </div>

                                <div className="col-span-1">
                                    <label htmlFor="course">Duration </label>
                                </div>

                                <div className="col-span-1">
                                    <span className="font-semibold">{selectedCourseBatchDetails?.[0]?.Duration || ''}</span>
                                </div>

                                <div className="col-span-1">
                                    <label htmlFor="course">Full Time/ Part Time </label>
                                </div>
                                <div className="col-span-1">
                                    <span className="font-semibold">{selectedCourseBatchDetails?.[0]?.BatchSchedue || ''}</span>
                                </div>

                                <div className="col-span-1">
                                    <label htmlFor="course">Exam Type </label>
                                </div>
                                <div className="col-span-1">
                                    <span className="font-semibold">{selectedCourseBatchDetails?.[0]?.ExamType || ''}</span>
                                </div>

                                <div className="col-span-1">
                                    <label htmlFor="course">
                                        Minimum Training Days </label>
                                </div>
                                <div className="col-span-1">
                                    <span className="font-semibold">{selectedCourseBatchDetails?.[0]?.MinBathDays || ''}</span>
                                </div>
                            </div>
                        </div>
                        <hr className="border border-gray-100" />
                        <FilteredTableComponent
                            className='pt-3'
                            data={selectedCourseBatchDetailsData ?? []}
                            columns={selectedCourseBatchDetailsColumn}
                            searchable={true}
                            showExport={false}
                            showExcelTemplate={false}
                            showPDF={false}
                            sortable={true}
                            renderCell={(item, column) => {
                                if (column.key === "Action") {
                                    return (
                                        <div className="flex items-center justify-center gap-3">
                                            <button
                                                title="Edit"
                                                className="p-1.5 rounded-md text-blue-600 hover:bg-blue-100 transition-colors duration-150 cursor-pointer"
                                                onClick={() => openEditBatchDetails(item)}
                                            >
                                                <FaEdit size={16} />
                                            </button>
                                            <button
                                                title="Delete"
                                                className="p-1.5 rounded-md text-red-500 hover:bg-red-100 transition-colors duration-150 cursor-pointer"
                                                onClick={() => {
                                                }
                                                }
                                            >
                                                <FaTrash size={16} />
                                            </button>
                                        </div>
                                    )
                                }
                            }}
                        />
                    </>
                }
            </fieldset>

            {showEditBatchDetailsPopup && (
                <>
                    <fieldset className="mb-4 rounded-md border p-4">
                        <legend className={`flex ${color} items-center text-base font-semibold text-white border-2 border-gray-300 px-3 py-1.5 rounded-md ml-4`}>
                            Edit Batch Details
                        </legend>
                        <div className="pb-5">
                            <div className='grid grid-cols-4 mt-4'>
                                <div className="col-span-1">
                                    <label htmlFor="course">Course </label>
                                </div>
                                <div className="col-span-3">
                                    <span className="font-semibold">{dataForEditBatchDetails?.CourseName || ''}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-4 gap-4 mt-4">
                                <div className="col-span-1">
                                    <label htmlFor="course">Course Code </label>
                                </div>
                                <div className="col-span-1">
                                    <span className="font-semibold">{dataForEditBatchDetails?.CourseCode || ''}</span>
                                </div>

                                <div className="col-span-1">
                                    <label htmlFor="course">Course Type </label>
                                </div>
                                <div className="col-span-1">
                                    <span className="font-semibold">{dataForEditBatchDetails?.CourseType || ''}</span>
                                </div>

                                <div className="col-span-1">
                                    <label htmlFor="course">Duration </label>
                                </div>
                                <div className="col-span-1">
                                    <span className="font-semibold">{dataForEditBatchDetails?.Duration || ''}</span>
                                </div>

                                <div className="col-span-1">
                                    <label htmlFor="course">Full Time/ Part Time </label>
                                </div>
                                <div className="col-span-1">
                                    <span className="font-semibold">{dataForEditBatchDetails?.BatchSchedue || ''}</span>
                                </div>

                                <div className="col-span-1">
                                    <label htmlFor="ShiftID">
                                        shift </label>
                                </div>
                                <div className="col-span-1">
                                    <span className="font-semibold">{dataForEditBatchDetails?.ShiftID || ''}</span>
                                </div>

                                <div className="col-span-1">
                                    <label htmlFor="ShiftID">
                                        Unit No </label>
                                </div>
                                <div className="col-span-1">
                                    <span className="font-semibold">{dataForEditBatchDetails?.UnitNo || ''}</span>
                                </div>

                                <div className="col-span-1">
                                    <label htmlFor="ShiftID">
                                        Unit Code </label>
                                </div>
                                <div className="col-span-1">
                                    <span className="font-semibold">{dataForEditBatchDetails?.UnitID || ''}</span>
                                </div>

                                <div className="col-span-1">
                                    <label htmlFor="ShiftID">
                                        Batch ID </label>
                                </div>
                                <div className="col-span-1">
                                    <span className="font-semibold">{dataForEditBatchDetails?.BatchID || ''}</span>
                                </div>

                                <div className="col-span-1">
                                    <label htmlFor="course">Exam Type </label>
                                </div>
                                <div className="col-span-1">
                                    <span className="font-semibold">{dataForEditBatchDetails?.ExamType || ''}</span>
                                </div>

                                <div className="col-span-1">
                                    <label htmlFor="course">
                                        Minimum Training Days </label>
                                </div>
                                <div className="col-span-1">
                                    <span className="font-semibold">{dataForEditBatchDetails?.MinBathDays || ''}</span>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <DateInput
                                label="Batch Start Date"
                                value={formatDateForInput(dataForEditBatchDetails?.BatchStartDate)}
                            />

                            {/* <FormComponent
                                label="Batch End Date"
                                type="date"
                                value={batchEndDate}
                                onChange={(e) => setBatchEndDate(e.target.value)}
                            /> */}
                            <DateInput
                                label="Batch End Date"
                                value={batchEndDate}
                                onChange={(val) => setBatchEndDate(val)}
                            />
                            {/* <FormComponent
                                label="Admission Last Date"
                                type="date"
                                value={formatDateForInput(dataForEditBatchDetails?.AdmissionEndDate)}
                                disabled
                            /> */}
                            <DateInput
                                label="Admission Last Date"
                                value={formatDateForInput(dataForEditBatchDetails?.AdmissionEndDate)}
                            />

                        </div>
                        <div className='flex justify-center gap-3 mt-6 mb-4'>
                            <Button variant='success' onClick={() => {
                                handleEditBatchDetails(dataForEditBatchDetails);
                            }}>
                                Update
                            </Button>
                            <Button variant='danger' onClick={() => {
                                setShowEditBatchDetailsPopup(false);
                                setShowCourseBatchDetailsPopup(false);
                                setDataForEditBatchDetails([]);
                                setSelectedCourseBatchDetails([]);

                            }}>
                                Cancel
                            </Button>
                        </div>

                    </fieldset>
                </>
            )}
        </div>
    )
}
export default BatchDetails;