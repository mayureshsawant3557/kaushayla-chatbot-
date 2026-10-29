import React, { useState, useEffect, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import agent from "../../lib/api/agent";
import FilteredTableComponent from "../formcomponent/FilteredTableComponent";
import FormComponent from "../formcomponent/FormComponent";
import DropdownComponent from "../formcomponent/DropdownComponent";
import UploadPdf from "../formcomponent/UploadPdf";
import IconTooltip from '../../Component/formcomponent/TooltipComponent';
import { ThemeContext } from "../Context/ThemeContext";
import { useLoading } from "../../Hooks/useLoading";
import { GetCoursesWiseRequirementDetails } from "../../Endpoints_All/Institute/existinginstitute";
import { GetInstituteIDByInstituteCode } from "../../Endpoints_All/Base/Institute";
import { getIp } from "../../Endpoints_All/Utils/fileUpload";
import { GetTrainingEquipmentListDetails, UpdateTrainingEquipmentAvailability } from '../../Endpoints_All/Base/Institute';
import { useAuth } from "../../Hooks/AuthContext";



const REMARK_OPTIONS = [
    { id: 1, label: 'Available in Institute' },
    { id: 2, label: 'Available with MoU Partner' },
    { id: 3, label: 'Available with Allied Course' },
    { id: 4, label: 'Not Available' }

];

const CourseWiseRequirement = () => {
    const { color } = useContext(ThemeContext);
    const { startLoading, stopLoading, isLoading } = useLoading();
    const navigate = useNavigate();
    const { userInfo } = useAuth();
    const loginID = userInfo?.UserLoginID;
    const userTypeID = userInfo?.UserTypeID;
    const userLoginID = userInfo?.UserLoginID || "";

    const [instituteId, setInstituteId] = useState(null);
    const [courseData, setCourseData] = useState([]);
    const [ipAddress, setIpAddress] = useState("0.0.0.0");
    const [showEquipmentForm, setShowEquipmentForm] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [equipmentListData, setEquipmentListData] = useState([]);
    const [formData, setFormData] = useState({
        CourseID: "",
        CourseCode: "",
        CourseName: "",
        InspectionUnits: "",
        MaxRequiredTrainingSetup: "",
        PercentageAvailability: "",
        MOUApplicableStatus: "",
        DistanceBetweenInstituteAndMOU: "",
        MOUPath: "",
        MOUFileName: "",
        Photo1Path: "",
        Photo2Path: "",
        Photo3Path: "",
        Photo1FileName: "",
        Photo2FileName: "",
        Photo3FileName: ""
    });
    const [errors, setErrors] = useState({});
    const [isLocked, setIsLocked] = useState(false);

    const params = new URLSearchParams(window.location.search);
    const p1 = params.get("P1");

    // -------------------- Fetch IP --------------------
    const fetchIP = async () => {
        try {
            const response = await agent.get(getIp, {
                headers: { accept: "*/*" }
            });
            setIpAddress(response?.data?.ip || "0.0.0.0");
        } catch (error) {
            setIpAddress("0.0.0.0");
        }
    };

    // -------------------- Fetch Institute ID --------------------

    useEffect(() => {
        const fetchInstituteId = async () => {
            try {
                startLoading();
                const response = await agent.get(GetInstituteIDByInstituteCode, {
                    params: { InstituteCode: loginID }
                });
                if (response?.data?.Status === "Success") {
                    setInstituteId(response.data.Data);
                }
            } catch (error) {
            } finally {
                stopLoading();
            }
        };

        if ((userTypeID === 14 || userTypeID === 81) && p1) {
            setInstituteId(p1);
        } else if (loginID) {
            fetchInstituteId();
        }
        fetchIP();
    }, [loginID]);

    // -------------------- Fetch Table Data --------------------
    //useEffect(() => {
    const fetchInspectionUnitDetails = async () => {
        if (!instituteId) return;
        try {
            startLoading();
            const payload = {
                instituteId,
                userLoginID: "0",
                pageCode: "ExistingInstitute",
                itemId: "0",
                ipAddress: ipAddress
            };
            const response = await agent.post(GetCoursesWiseRequirementDetails, payload);
            if (response?.data?.Status === "Success") {
                const apiData = response?.data?.Data?.Table || [];
                const formattedData = apiData.map((item, index) => ({
                    id: index + 1,
                    sn: index + 1,
                    CourseID: item.CourseID,
                    CourseName: item.CourseName || "",
                    CourseType: item.CourseType || "",
                    CourseTypeID: item.CourseTypeID || "",
                    ApprovedUnits: item.ApprovedUnits || 0,
                    InspectionUnits: item.InspectionUnits ?? item.LOITotalUnits ?? item.ApprovedUnits ?? 0,
                    MaxBatchesPerDay: item.MaxBatchesPerDay || 0,
                    MaxTraningSetupRequired: item.MaxTraningSetupRequired ?? item.MaxiumTraningSetupRequired ?? 0,
                    AvailablePercentage: item.AvailablePercentage || "",
                    Avilable: item.Avilable || "",
                    Requiedaspernorms: item.Requiedaspernorms || "",
                    Dificiency: item.Dificiency || "",
                    MaxRequiredTrainingSetup: item.MaxTraningSetupRequired ?? item.MaxiumTraningSetupRequired ?? 0,
                    PercentageAvailability: item.AvailablePercentage
                }));
                setCourseData(formattedData);
            } else {
                setCourseData([]);
            }
        } catch (error) {
            setCourseData([]);
        } finally {
            stopLoading();
        }
    };
    //    fetchInspectionUnitDetails();
    //}, [instituteId]);

    useEffect(() => {
        fetchInspectionUnitDetails();
    }, [instituteId]);

    // -------------------- Fetch Equipment List Details --------------------
    const fetchEquipmentListDetails = async (courseID) => {
        try {
            startLoading();
            const response = await agent.post(GetTrainingEquipmentListDetails, {
                instituteId: instituteId,
                exitInstituteID: 0,
                userLoginID: userLoginID,
                pageCode: "Traning Page",
                itemId: courseID,
                ipAddress: ipAddress
            });
            if (response.data?.Status === "Success" && response.data?.Data?.lstTrainingEquipmentListEntity) {
                const formattedData = response.data.Data.lstTrainingEquipmentListEntity.map((item) => ({
                    ...item,
                    Remark: (item.Remark === -1 || item.Remark === null || item.Remark === undefined || item.Remark === 0) ? "" : item.Remark,
                    AvailableEquipments: item.AvailableEquipments || 0
                }));
                setEquipmentListData(formattedData);
            } else {
                setEquipmentListData([]);
            }
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Failed to fetch training equipment details."
            });
            setEquipmentListData([]);
        } finally {
            stopLoading();
        }
    };

    // -------------------- Fetch Existing Uploaded Data --------------------
    const fetchExistingUploadedData = async (course) => {
        try {
            const response = await agent.post(GetTrainingEquipmentListDetails, {
                instituteId: instituteId,
                exitInstituteID: 0,
                userLoginID: userLoginID,
                pageCode: "Traning Page",
                itemId: course.CourseID,
                ipAddress: ipAddress
            });
            if (response.data?.Status === "Success" && response.data?.Data) {
                const data = response.data.Data;
                const firstEquipment = data.lstTrainingEquipmentListEntity?.[0];
                const mouPath = firstEquipment?.MOUPath || firstEquipment?.mouPath || "";
                const mouFileName = mouPath ? mouPath.split("/").pop() : "";
                const DistanceBetweenInstituteAndMOU = firstEquipment?.DistanceBetweenInstituteAndMOU || "";
                const photos = data.lstEquipmentPhoto || [];
                const coursePhotos = photos.filter(photo =>
                    (photo.CourseID || photo.courseID) === course.CourseID
                );
                const sortedPhotos = coursePhotos.sort((a, b) =>
                    (a.srno || a.Srno || a.ID || 0) - (b.srno || b.Srno || b.ID || 0)
                );
                const photo1 = sortedPhotos[0] || {};
                const photo2 = sortedPhotos[1] || {};
                const photo3 = sortedPhotos[2] || {};
                const photo1Path = photo1.PhotoPath || photo1.photoPath || "";
                const photo2Path = photo2.PhotoPath || photo2.photoPath || "";
                const photo3Path = photo3.PhotoPath || photo3.photoPath || "";
                const photo1FileName = photo1Path ? photo1Path.split("/").pop() : "";
                const photo2FileName = photo2Path ? photo2Path.split("/").pop() : "";
                const photo3FileName = photo3Path ? photo3Path.split("/").pop() : "";

                const mouStatus = firstEquipment?.IsCourseMOU === 1 || firstEquipment?.isCourseMOU === 1 ? 'Yes' : 'No';
                setFormData(prev => ({
                    ...prev,
                    MOUApplicableStatus: mouStatus || prev.MOUApplicableStatus,
                    MOUPath: mouPath,
                    MOUFileName: mouFileName,
                    DistanceBetweenInstituteAndMOU: DistanceBetweenInstituteAndMOU || prev.DistanceBetweenInstituteAndMOU,
                    Photo1Path: photo1Path,
                    Photo2Path: photo2Path,
                    Photo3Path: photo3Path,
                    Photo1FileName: photo1FileName,
                    Photo2FileName: photo2FileName,
                    Photo3FileName: photo3FileName,
                    //mouStatus: mouStatus
                }));
            }
        } catch (error) {
        }
    };

    // -------------------- Handle Infrastructure Submit --------------------
    const handleInfrastructureSubmit = async (course) => {
        try {
            startLoading();
            setSelectedCourse(course);
            const freshFormData = {
                CourseID: course.CourseID,
                CourseCode: course.CourseCode || "",
                CourseName: course.CourseName || course.Course || "",
                InspectionUnits: course.InspectionUnits || 0,
                MaxRequiredTrainingSetup: course.MaxRequiredTrainingSetup || course.MaxTraningSetupRequired || 0,
                PercentageAvailability: course.PercentageAvailability || course.AvailablePercentage || "0",
                MOUApplicableStatus: "",
                DistanceBetweenInstituteAndMOU: "",
                MOUPath: "",
                MOUFileName: "",
                Photo1Path: "",
                Photo2Path: "",
                Photo3Path: "",
                Photo1FileName: "",
                Photo2FileName: "",
                Photo3FileName: ""
            };
            setFormData(freshFormData);
            setShowEquipmentForm(true);
            setErrors({});
            setEquipmentListData([]);
            await Promise.all([
                fetchEquipmentListDetails(course.CourseID),
                fetchExistingUploadedData(course)
            ]);
            setTimeout(() => {
                const formElement = document.getElementById("equipment-form-section");
                if (formElement) {
                    formElement.scrollIntoView({ behavior: "smooth", block: "start" });
                }
            }, 100);
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Failed to load form data. Please try again.",
                confirmButtonColor: "#d33"
            });
        } finally {
            stopLoading();
        }
    };

    // -------------------- Handle Form Change --------------------
    const handleChange = (name, value) => {
        if (name === "DistanceBetweenInstituteAndMOU") {
            if (value === "") {
                setFormData(prev => ({ ...prev, [name]: "" }));
                return;
            }
            const numValue = Number(value);
            if (isNaN(numValue) || numValue < 0) return;
            if (numValue > 15) {
                Swal.fire({
                    icon: "warning",
                    title: "Alert!",
                    text: "Distance between Institute and MoU Organization cannot be more than 15 KM",
                    confirmButtonText: "OK",
                    confirmButtonColor: "#3085d6"
                });
                return;
            }
        }
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }
    };

    const handleDropdownChange = (name, value) => {
        handleChange(name, value);
    };

    // -------------------- Handle File Upload --------------------
    const handleFileUpload = (fieldName, uploadData) => {
        let fileName = "";
        let filePath = "";
        if (typeof uploadData === "object" && uploadData !== null) {
            fileName = uploadData.fileName || uploadData.originalFileName || "";
            filePath = uploadData.filePath || uploadData.azureUrl || "";
        } else if (typeof uploadData === "string") {
            filePath = uploadData;
            fileName = uploadData.split("/").pop();
        }
        setFormData(prev => ({
            ...prev,
            [`${fieldName}FileName`]: fileName,
            [`${fieldName}Path`]: filePath
        }));
        const errorKey = `${fieldName}Path`;
        if (errors[errorKey]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[errorKey];
                return newErrors;
            });
        }
    };

    // -------------------- Handle Equipment Availability Change --------------------
    const handleEquipmentAvailabilityChange = (index, value) => {
        if (value !== "" && !/^\d+$/.test(value)) {
            return;
        }
        const updatedData = [...equipmentListData];
        const item = updatedData[index];
        item.AvailableEquipments = value === "" ? "" : Number(value);
        const availableQty = item.AvailableEquipments === "" ? 0 : item.AvailableEquipments;
        //const requiredQty = item.RequiredEquipmentForTotalUnits || 0;
        const requiredQty = item.RequiredEquipmentForTotalUnits || 0;
        const availability = availableQty - requiredQty;
        item.EquipmentStatus =
            availableQty >= 1 && availableQty >= requiredQty
                ? "Complete"
                : "Incomplete";
        setEquipmentListData(updatedData);
    };

    // -------------------- Handle Equipment Remark Change --------------------
    const handleEquipmentRemarkChange = (index, value) => {
        const updatedData = [...equipmentListData];
        updatedData[index].Remark = value === "" ? "" : parseInt(value);
        setEquipmentListData(updatedData);
    };

    // -------------------- Validate Form --------------------
    const validateForm = () => {
        const newErrors = {};
        let errorMessages = [];

        if (formData.MOUApplicableStatus === "Yes") {
            if (!formData.DistanceBetweenInstituteAndMOU) {
                const msg = "Distance is required when MoU is applicable";
                newErrors.DistanceBetweenInstituteAndMOU = msg;
                errorMessages.push(msg);
            } else {
                const distance = parseFloat(formData.DistanceBetweenInstituteAndMOU);
                if (isNaN(distance) || distance < 0 || distance > 15) {
                    const msg = "Distance must be between 0 and 15 KM";
                    newErrors.DistanceBetweenInstituteAndMOU = msg;
                    errorMessages.push(msg);
                }
            }
            if (!formData.MOUPath) {
                const msg = "MoU document is required";
                newErrors.MOUPath = msg;
                errorMessages.push(msg);
            }
        }

        if (!formData.Photo1Path) {
            const msg = "Training Equipment Photo 1 is required";
            newErrors.Photo1Path = msg;
            errorMessages.push(msg);
        }

        const missingRemarkSrNos = equipmentListData
            .map((item, index) => ({ srNo: index + 1, remark: item.Remark }))
            .filter(({ remark }) => !remark && remark !== 0)
            .map(({ srNo }) => srNo);

        if (missingRemarkSrNos.length > 0) {
            const msg = `Remark is required for Sr. No: ${missingRemarkSrNos.join(", ")}`;
            newErrors.EquipmentRemark = msg;
            errorMessages.push(msg);
        }

        setErrors(newErrors);

        if (errorMessages.length > 0) {
            Swal.fire({
                icon: "warning",
                title: "Please fix the following errors",
                html: errorMessages.map(e => `� ${e}`).join("<br/>"),
                confirmButtonColor: "#3085d6"
            });
            return false;
        }
        return true;
    };

    // -------------------- Save Equipment Details --------------------
    const saveEquipmentDetails = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            startLoading();
            const currentTimestamp = new Date().toISOString();

            const lstEquipmentPhoto = [];
            let srno = 1;

            if (formData.Photo1Path) {
                lstEquipmentPhoto.push({
                    id: 0,
                    instituteID: parseInt(instituteId) || 0,
                    srno: srno++,
                    courseID: parseInt(formData.CourseID) || 0,
                    photoPath: formData.Photo1Path || "",
                    isEditAllowed: true,
                    lastModifiedOn: currentTimestamp,
                    userLoginID: userLoginID || "",
                    ipAddress: ipAddress,
                    pageCode: "TRAINING_EQUIPMENT"
                });
            }

            if (formData.Photo2Path) {
                lstEquipmentPhoto.push({
                    id: 0,
                    instituteID: parseInt(instituteId) || 0,
                    srno: srno++,
                    courseID: parseInt(formData.CourseID) || 0,
                    photoPath: formData.Photo2Path || "",
                    isEditAllowed: true,
                    lastModifiedOn: currentTimestamp,
                    userLoginID: userLoginID || "",
                    ipAddress: ipAddress,
                    pageCode: "TRAINING_EQUIPMENT"
                });
            }

            if (formData.Photo3Path) {
                lstEquipmentPhoto.push({
                    id: 0,
                    instituteID: parseInt(instituteId) || 0,
                    srno: srno++,
                    courseID: parseInt(formData.CourseID) || 0,
                    photoPath: formData.Photo3Path || "",
                    isEditAllowed: true,
                    lastModifiedOn: currentTimestamp,
                    userLoginID: userLoginID || "",
                    ipAddress: ipAddress,
                    pageCode: "TRAINING_EQUIPMENT"
                });
            }

            const lstTrainingEquipmentListEntity = equipmentListData.map(item => ({
                instituteId: parseInt(instituteId) || 0,
                courseID: parseInt(formData.CourseID) || 0,
                courseCode: formData.CourseCode || "",
                course: formData.CourseName || "",
                equipmentId: parseInt(item.EquipmentId) || 0,
                equipmentName: item.EquipmentName || "",
                equipmentCategoryId: parseInt(item.EquipmentCategoryId) || 0,
                equipmentCategory: item.EquipmentCategory || "",
                utilizationRemarks: item.UtilizationRemarks || "",
                isDsrItem: Boolean(item.IsDsrItem),
                isMandatory: Boolean(item.IsMandatory),
                isAlliedCourseItem: Boolean(item.IsAlliedCourseItem),
                isMouItem: Boolean(item.IsMouItem),
                requiredPerUnit: parseFloat(item.RequiredPerUnit) || 0,
                requiredEquipmentForApprovedUnits: parseFloat(item.RequiredEquipmentForApprovedUnits) || 0,
                requiredEquipmentForProposedUnits: parseFloat(item.RequiredEquipmentForProposedUnits) || 0,
                requiredEquipmentForTotalUnits: parseFloat(item.RequiredEquipmentForTotalUnits) || 0,
                availableEquipments: parseFloat(item.AvailableEquipments) || 0,
                equipmentStatus: item.EquipmentStatus || "Incomplete",
                isEditAllowed: true,
                isDeleteAllowed: false,
                mouPath: formData.MOUPath || "",
                isCourseMOU: formData.MOUApplicableStatus === "Yes" ? 1 : 0,
                remark: item.Remark === "" || item.Remark === null || item.Remark === undefined ? -1 : parseInt(item.Remark),
                distanceBetweenInstituteAndMOU: parseFloat(formData.DistanceBetweenInstituteAndMOU) || 0,
                userLoginId: userLoginID || "",
                pageCode: "TRAINING_EQUIPMENT",
                ipAddress: ipAddress,
                lstEquipmentPhoto: []
            }));

            const payload = {
                lstTrainingEquipmentListEntity,
                lstEquipmentPhoto
            };

            if (!lstTrainingEquipmentListEntity || lstTrainingEquipmentListEntity.length === 0) {
                throw new Error("Equipment list cannot be empty. Please ensure equipment data is loaded.");
            }

            if (!lstEquipmentPhoto || lstEquipmentPhoto.length === 0) {
                throw new Error("At least one training equipment photo is required.");
            }

            const response = await agent.post(UpdateTrainingEquipmentAvailability, payload, {
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                }
            });

            if (response.data?.Status === "Success") {
                Swal.fire({
                    icon: "success",
                    title: "Success",
                    text: response.data.Message || "Training equipment details saved successfully.",
                    confirmButtonColor: "#28a745"
                });
                handleCloseForm();
                await fetchInspectionUnitDetails();
            } else {
                throw new Error(response.data?.Message || "Failed to save details");
            }
        } catch (error) {
            const errorMessage = error.response?.data?.Message || error.Message || "Something went wrong";
            Swal.fire({
                icon: "error",
                title: "Error",
                text: errorMessage,
                confirmButtonColor: "#d33"
            });
        } finally {
            stopLoading();
        }
    };

    // -------------------- Handle Close Form --------------------
    const handleCloseForm = () => {
        setShowEquipmentForm(false);
        setSelectedCourse(null);
        setEquipmentListData([]);
        setFormData({
            CourseID: "",
            CourseCode: "",
            CourseName: "",
            InspectionUnits: "",
            MaxRequiredTrainingSetup: "",
            PercentageAvailability: "",
            MOUApplicableStatus: "",
            DistanceBetweenInstituteAndMOU: "",
            MOUPath: "",
            MOUFileName: "",
            Photo1Path: "",
            Photo2Path: "",
            Photo3Path: "",
            Photo1FileName: "",
            Photo2FileName: "",
            Photo3FileName: ""
        });
        setErrors({});
    };

    // -------------------- Calculate Equipment Totals --------------------
    const calculateEquipmentTotals = useMemo(() => {
        if (!equipmentListData.length) {
            return { totalRequired: 0, totalAvailable: 0 };
        }
        return {
            totalRequired: equipmentListData.reduce((sum, item) => sum + (item.RequiredEquipmentForTotalUnits || 0), 0),
            totalAvailable: equipmentListData.reduce((sum, item) => sum + (item.AvailableEquipments || 0), 0)
        };
    }, [equipmentListData]);

    // -------------------- Calculate TS Percentage --------------------
    const calculateTSPercentage = useMemo(() => {
        if (!equipmentListData.length) return 0;
        const completeCount = equipmentListData.filter(item => item.EquipmentStatus === "Complete").length;
        const totalCount = equipmentListData.length;
        if (totalCount === 0) return 0;
        const percentage = (completeCount / totalCount) * 100;
        return parseFloat(percentage.toFixed(2));
    }, [equipmentListData]);

    // -------------------- Prepare Table Data --------------------
    const prepareTableData = () => {
        const totals = {
            ApprovedUnits: 0,
            InspectionUnits: 0,
            MaxBatchesPerDay: 0,
            MaxTraningSetupRequired: 0,
            AvailablePercentage: 0
        };
        courseData.forEach((item) => {
            totals.ApprovedUnits += Number(item.ApprovedUnits) || 0;
            totals.InspectionUnits += Number(item.InspectionUnits) || 0;
            totals.MaxBatchesPerDay += Number(item.MaxBatchesPerDay) || 0;
            totals.MaxTraningSetupRequired += Number(item.MaxTraningSetupRequired) || 0;
            totals.AvailablePercentage += Number(item.AvailablePercentage) || 0;
        });
        return [
            ...courseData,
            {
                sn: "",
                CourseName: "Total",
                CourseType: "",
                CourseTypeID: "",
                ApprovedUnits: totals.ApprovedUnits,
                InspectionUnits: totals.InspectionUnits,
                MaxBatchesPerDay: "",
                MaxTraningSetupRequired: totals.MaxTraningSetupRequired,

                Avilable: "",
                Requiedaspernorms: "",
                Dificiency: "",
                AvailablePercentage: totals.AvailablePercentage,

                rowClassName: "bg-gray-100 font-bold"
            }
        ];
    };

    // -------------------- Equipment List Columns --------------------
    const equipmentListColumns = [
        { key: "srNo", header: "S.N.", width: "80px", headerClassName: "text-center", className: "text-center" },
        { key: "EquipmentName", header: "Name of Item", width: "250px", headerClassName: "text-center", className: "text-left" },
        { key: "UtilizationRemarks", header: "Remark for Utilization", width: "200px", headerClassName: "text-center", className: "text-center" },
        { key: "IsMandatory", header: "Mandatory Item", width: "120px", headerClassName: "text-center", className: "text-center" },
        { key: "IsAlliedCourseItem", header: "Allied Course Item", width: "150px", headerClassName: "text-center", className: "text-center" },
        { key: "IsMouItem", header: "MoU Item", width: "120px", headerClassName: "text-center", className: "text-center" },
        { key: "RequiredPerUnit", header: "Per Setup Norm", width: "130px", headerClassName: "text-center", className: "text-center" },
        { key: "RequiredEquipmentForTotalUnits", header: "Required", width: "120px", headerClassName: "text-center", className: "text-center" },
        { key: "AvailableEquipments", header: "Available", width: "130px", headerClassName: "text-center", className: "text-center", type: "input", inputType: "number" },
        { key: "Availability", header: "Deficiency", width: "180px", headerClassName: "text-center", className: "text-center" },
        { key: "Remark", header: "Remark", width: "200px", headerClassName: "text-center", className: "text-center" },
        { key: "EquipmentStatus", header: "Status", width: "130px", headerClassName: "text-center", className: "text-center" }
    ];

    // -------------------- Table Columns --------------------
    const inspectionColumns = [
        { key: "sn", header: "S.N.", width: "70px", className: "text-center", headerClassName: "text-center bg-blue-100 font-semibold" },
        { key: "CourseName", header: "Course Name", width: "320px", className: "text-left", headerClassName: "text-left bg-blue-100 font-semibold" },
        { key: "ApprovedUnits", header: "Approved Units", width: "120px", className: "text-center", headerClassName: "text-center bg-blue-100 font-semibold" },
        { key: "MaxBatchesPerDay", header: "Max Batches/Day", width: "140px", className: "text-center", headerClassName: "text-center bg-blue-100 font-semibold" },
        { key: "MaxTraningSetupRequired", header: "Max Training Setups Required", width: "160px", className: "text-center", headerClassName: "text-center bg-blue-100 font-semibold" },
        { key: "Requiedaspernorms", header: "Required As Per Norms", width: "180px", className: "text-center", headerClassName: "text-center bg-blue-100 font-semibold" },
        { key: "Avilable", header: "Available", width: "120px", className: "text-center", headerClassName: "text-center bg-blue-100 font-semibold" },
        { key: "Dificiency", header: "Deficiency", width: "140px", className: "text-center", headerClassName: "text-center bg-blue-100 font-semibold" },

        { key: "AvailablePercentage", header: "Percentage Availability", width: "130px", className: "text-center", headerClassName: "text-center bg-blue-100 font-semibold" },
        { key: "InfrastructureDetails", header: "Infrastructure Details", width: "160px", className: "text-center", headerClassName: "text-center bg-blue-100 font-semibold" }
    ];

    // -------------------- Custom Cell Renderer for Table --------------------
    const renderCell = (item, column, rowIndex) => {
        if (column.key === 'sn') {
            return rowIndex + 1;
        }
        if (column.key === "InfrastructureDetails") {
            if (item.CourseName === "Total") {
                return null;
            }
            return (
                <button
                    type="button"
                    onClick={() => handleInfrastructureSubmit(item)}
                    className="px-3 py-1.5 bg-blue-500 text-white font-semibold rounded text-sm hover:bg-blue-600 transition-colors"
                >
                    Submit
                </button>
            );
        }
        if (column.key === "AvailablePercentage") {
            if (item.CourseName === "Total") {
                return null;
            }
            return `${Number(item[column.key] || 0)}%`;
        }
        return undefined;
    };

    // -------------------- Equipment List Table Data --------------------
    const equipmentListTableData = useMemo(() => {
        return equipmentListData.map((item, index) => ({
            ...item,
            srNo: index + 1
        }));
    }, [equipmentListData]);

    // -------------------- Render Equipment List Cell --------------------
    const renderEquipmentListCell = (item, column, rowIndex) => {
        if (column.key === "srNo") {
            return rowIndex + 1;
        }
        if (column.key === "IsMandatory" || column.key === "IsAlliedCourseItem" || column.key === "IsMouItem") {
            return item[column.key] ? "Yes" : "No";
        }
        if (column.key === "AvailableEquipments") {
            return (
                <input
                    type="number"
                    min="0"
                    step="1"
                    value={item.AvailableEquipments ?? ""}
                    onChange={(e) => handleEquipmentAvailabilityChange(rowIndex, e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-center text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            );
        }
        if (column.key === "Availability") {
            const availability = (Number(item.RequiredEquipmentForTotalUnits) - (Number(item.AvailableEquipments) || 0) || 0);
            return availability;
        }
        //if (column.key === "Remark") {
        //    return (
        //        <select
        //            value={item.Remark || ""}
        //            onChange={(e) => handleEquipmentRemarkChange(rowIndex, e.target.value)}
        //            className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
        //        >
        //            <option value="">Select</option>
        //            {REMARK_OPTIONS.map(option => (
        //                <option key={option.id} value={option.id}>
        //                    {option.label}
        //                </option>
        //            ))}
        //        </select>
        //    );
        //}
        if (column.key === 'Remark') {
            return (
                <select
                    value={item.Remark || ''}
                    onChange={(e) => handleEquipmentRemarkChange(rowIndex, e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isLocked} // (Number(item.IsMouItem) === 1 && formData.MOUApplicableStatus === 'Yes')

                >
                    <option value="">Select</option>



                    {
                        REMARK_OPTIONS
                            .filter(option =>
                                !(

                                    (Number(item.IsAlliedCourseItem) === 1 &&
                                        Number(item.IsMouItem) === 0 &&
                                        Number(item.AvailableEquipments) > 0 &&
                                        [4, 2].includes(option.id)) ||


                                    (Number(item.IsAlliedCourseItem) === 0 &&
                                        Number(item.IsMouItem) === 0 &&
                                        Number(item.AvailableEquipments) > 0 &&
                                        [2, 3, 4].includes(option.id)) ||


                                    (Number(item.IsAlliedCourseItem) === 1 &&
                                        Number(item.IsMouItem) === 1 &&
                                        Number(item.AvailableEquipments) > 0 &&
                                        option.id === 4) ||


                                    (Number(item.IsAlliedCourseItem) === 0 &&
                                        Number(item.IsMouItem) === 1 &&
                                        Number(item.AvailableEquipments) > 0 &&
                                        [3, 4].includes(option.id)) ||


                                    (Number(item.AvailableEquipments) === 0 &&
                                        [1, 2, 3].includes(option.id))
                                )
                            )
                            .map(option => (
                                <option key={option.id} value={option.id}>
                                    {option.label}
                                </option>
                            ))
                    }
                </select>
            );
        }
        if (column.key === "EquipmentStatus") {
            const statusColor = item.EquipmentStatus === "Complete" ? "text-green-600" : "text-red-600";
            return (
                <span className={`font-semibold text-xs ${statusColor}`}>
                    {item.EquipmentStatus}
                </span>
            );
        }
        return undefined;
    };

    // -------------------- Render Equipment List Footer --------------------
    const renderEquipmentListFooter = () => {
        const totals = calculateEquipmentTotals;
        const ts = calculateTSPercentage;
        return (
            <tr className="bg-gray-100 font-bold">
                <td colSpan={7} className="border border-gray-300 px-4 py-2 text-right">Totals</td>
                <td className="border border-gray-300 px-2 py-2 text-center">{totals.totalRequired}</td>
                <td className="border border-gray-300 px-2 py-2 text-center">{totals.totalAvailable}</td>
                <td className="border border-gray-300 px-2 py-2 text-center">{ts}%</td>
                <td className="border border-gray-300 px-2 py-2 text-center"></td>
                <td className="border border-gray-300 px-2 py-2 text-center"></td>
            </tr>
        );
    };

    // -------------------- Label With Tooltip Component --------------------
    const LabelWithTooltip = ({ label, tooltip, required }) => (
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <span>
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </span>
            {tooltip && (
                <IconTooltip
                    message={tooltip}
                    position="right"
                    width="w-80"
                />
            )}
        </label>
    );

    // -------------------- Loader --------------------
    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-white/60 flex items-center justify-center z-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#00c3f9]" />
            </div>
        );
    }

    return (
        <div className="p-6">
            <fieldset className="border border-gray-300 rounded px-4 pt-3 pb-2">
                <legend
                    className={`flex items-center gap-2 rounded-md border border-gray-300 ${color} px-4 py-2 text-xl font-bold text-white shadow-md`}
                >
                    Courses Wise Requirement
                </legend>

                <div className="mt-4">
                    <FilteredTableComponent
                        data={prepareTableData()}
                        columns={inspectionColumns}
                        filterColumns={[]}
                        customButtons={[]}
                        title=""
                        exportFileName="Course_Wise_Requirement"
                        tableId="course-wise-requirement"
                        searchable={false}
                        sortable={false}
                        showExcelTemplate={false}
                        exportable={false}
                        showSearch={false}
                        showExport={false}
                        className="mt-3"
                        maxHeight="550px"
                        stickyHeader={true}
                        readOnly={true}
                        rowClassName={(row) => row.rowClassName}
                        renderCell={renderCell}
                    />
                </div>
            </fieldset>

            {/* Equipment Form Section */}
            {showEquipmentForm && selectedCourse && (
                <div className="space-y-6 mt-6" id="equipment-form-section">
                    {/* Course Details Form */}
                    <fieldset className="border border-gray-300 rounded px-4 pt-3 pb-4">
                        <legend
                            className={`flex items-center gap-2 rounded-md border border-gray-300 ${color} px-4 py-2 text-xl font-bold text-white shadow-md`}
                        >
                            Course Details
                        </legend>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">
                                    Course
                                </label>
                                <FormComponent
                                    label=""
                                    value={formData.CourseName}
                                    onChange={() => { }}
                                    disabled={true}
                                    extraClass="bg-gray-100 cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">
                                    Approved Units
                                </label>
                                <FormComponent
                                    label=""
                                    value={formData.InspectionUnits}
                                    onChange={() => { }}
                                    disabled={true}
                                    extraClass="bg-gray-100 cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">
                                    Max Training Setups Required
                                </label>
                                <FormComponent
                                    label=""
                                    value={formData.MaxRequiredTrainingSetup}
                                    onChange={() => { }}
                                    disabled={true}
                                    extraClass="bg-gray-100 cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">
                                    Percentage Availability
                                </label>
                                <FormComponent
                                    label=""
                                    value={formData.PercentageAvailability}
                                    onChange={() => { }}
                                    disabled={true}
                                    extraClass="bg-gray-100 cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <LabelWithTooltip
                                    label="Do you have MoU"
                                    required={true}
                                    tooltip="Institute can enter into Memorandum of Undertaking (MoU) with other Training Institute / Industry / Organization for usage of certain Machine / Equipment which are not required frequently for training machine."
                                />
                                <DropdownComponent
                                    label=""
                                    name="MOUApplicableStatus"
                                    options={[
                                        { value: "Yes", label: "Yes" },
                                        { value: "No", label: "No" }
                                    ]}
                                    value={formData.MOUApplicableStatus}
                                    onChange={(value) => handleDropdownChange("MOUApplicableStatus", value)}
                                    error={errors.MOUApplicableStatus}
                                    required={false}
                                />
                            </div>

                            {formData.MOUApplicableStatus === "Yes" && (
                                <>
                                    <div>
                                        <LabelWithTooltip
                                            label="Distance between Institute and MoU Organization (KM)"
                                            required={true}
                                            tooltip="Enter distance in K.M. between Training Institute and Organization with whom MoU is entered for usage of certain Machine / Equipment which are not required frequently for training machine. Distance between Institute and MoU Organization cannot be more than 15 KM."
                                        />
                                        <FormComponent
                                            label=""
                                            type="number"
                                            value={formData.DistanceBetweenInstituteAndMOU}
                                            onChange={(value) => handleChange("DistanceBetweenInstituteAndMOU", value)}
                                            required={false}
                                            min={0}
                                            max={15}
                                            step={0.01}
                                        />
                                        {errors.DistanceBetweenInstituteAndMOU && (
                                            <span className="text-red-500 text-xs mt-1 block">
                                                {errors.DistanceBetweenInstituteAndMOU}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex flex-col">
                                        <label className="text-sm font-medium text-gray-700 mb-2">
                                            Upload MoU<span className="text-red-500">*</span>
                                        </label>
                                        <UploadPdf
                                            file={formData.MOUFileName}
                                            onFileChange={(uploadData) => handleFileUpload("MOU", uploadData)}
                                            buttonClassName="bg-[#00c3f9]"
                                            buttonText={"Upload"}
                                            showLabel={false}
                                            allowedFileTypes="pdf"
                                            maxFileSize="2 MB"
                                            required={true}
                                            userTypeId={userTypeID}
                                            userLoginID={userLoginID}
                                            linkName={formData.MOUPath ? "View MoU" : ""}
                                            uniquefilepath={formData.MOUPath}
                                            id="mouUpload"
                                        />
                                        {errors.MOUPath && (
                                            <span className="text-red-500 text-xs mt-1 block">
                                                {errors.MOUPath}
                                            </span>
                                        )}
                                    </div>
                                </>
                            )}

                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700 mb-2">
                                    Upload Training Equipment Photo 1<span className="text-red-500">*</span>
                                </label>
                                <UploadPdf
                                    file={formData.Photo1FileName}
                                    onFileChange={(uploadData) => handleFileUpload("Photo1", uploadData)}
                                    buttonClassName="bg-[#00c3f9]"
                                    buttonText={"Upload"}
                                    showLabel={false}
                                    allowedFileTypes="jpg, jpeg, png"
                                    maxFileSize="2 MB"
                                    required={true}
                                    userTypeId={userTypeID}
                                    userLoginID={userLoginID}
                                    linkName={formData.Photo1Path ? "View Photo 1" : ""}
                                    uniquefilepath={formData.Photo1Path}
                                    id="photo1Upload"
                                />
                                {errors.Photo1Path && (
                                    <span className="text-red-500 text-xs mt-1 block">
                                        {errors.Photo1Path}
                                    </span>
                                )}
                            </div>

                            {formData.Photo1Path && (
                                <div className="flex flex-col">
                                    <label className="text-sm font-medium text-gray-700 mb-2">
                                        Upload Training Equipment Photo 2
                                    </label>
                                    <UploadPdf
                                        file={formData.Photo2FileName}
                                        onFileChange={(uploadData) => handleFileUpload("Photo2", uploadData)}
                                        buttonClassName="bg-[#00c3f9]"
                                        buttonText={"Upload"}
                                        showLabel={false}
                                        allowedFileTypes="jpg, jpeg, png"
                                        maxFileSize="2 MB"
                                        required={false}
                                        userTypeId={userTypeID}
                                        userLoginID={userLoginID}
                                        linkName={formData.Photo2Path ? "View Photo 2" : ""}
                                        uniquefilepath={formData.Photo2Path}
                                        id="photo2Upload"
                                    />
                                </div>
                            )}

                            {formData.Photo1Path && formData.Photo2Path && (
                                <div className="flex flex-col">
                                    <label className="text-sm font-medium text-gray-700 mb-2">
                                        Upload Training Equipment Photo 3
                                    </label>
                                    <UploadPdf
                                        file={formData.Photo3FileName}
                                        onFileChange={(uploadData) => handleFileUpload("Photo3", uploadData)}
                                        buttonClassName="bg-[#00c3f9]"
                                        buttonText={"Upload"}
                                        showLabel={false}
                                        allowedFileTypes="jpg, jpeg, png"
                                        maxFileSize="2 MB"
                                        required={false}
                                        userTypeId={userTypeID}
                                        userLoginID={userLoginID}
                                        linkName={formData.Photo3Path ? "View Photo 3" : ""}
                                        uniquefilepath={formData.Photo3Path}
                                        id="photo3Upload"
                                    />
                                </div>
                            )}
                        </div>
                    </fieldset>

                    {/* Equipment List Table */}
                    <fieldset className="border border-gray-300 rounded px-4 pt-3 pb-4">
                        <legend
                            className={`flex items-center gap-2 rounded-md border border-gray-300 ${color} px-4 py-2 text-lg font-bold text-white shadow-md`}
                        >
                            Equipment List
                        </legend>

                        <div className="mt-4">
                            <FilteredTableComponent
                                data={equipmentListTableData}
                                columns={equipmentListColumns}
                                filterColumns={["EquipmentName", "EquipmentCategory"]}
                                searchable={true}
                                sortable={true}
                                exportable={false}
                                showSearch={false}
                                showExport={false}
                                showExcel={false}
                                showPDF={false}
                                showExcelTemplate={true}
                                maxHeight="500px"
                                stickyHeader={true}
                                renderCell={renderEquipmentListCell}
                                emptyStateMessage="No equipment data available"
                                emptyStateSubMessage="Equipment list will be populated based on course selection"
                                tableId="equipment-list-table"
                                customFooter={renderEquipmentListFooter()}
                            />
                        </div>

                        {/* Notes Section */}
                        <div className="mt-4 rounded-md border border-blue-200 bg-blue-50 p-4">
                            <p className="text-sm text-blue-700">
                                <span className="font-medium">Note:</span>
                            </p>
                            <ol className="list-decimal list-inside mt-1 space-y-1 text-sm text-blue-700">
                                <li>Negative Deficiency means adequate/excess</li>
                                <li>Positive Deficiency means shortage</li>
                            </ol>
                        </div>

                        {/*<div className="mt-4 rounded-md border border-red-200 bg-red-50 p-4">*/}
                        {/*    <p className="text-sm text-red-700">*/}
                        {/*        <span className="font-medium">Remark:</span>{" "}*/}
                        {/*        {calculateTSPercentage < 100 ? "Training Equipment availability is less than Required Norms." : "Training Equipment availability is as per Required Norms"}*/}
                        {/*    </p>*/}
                        {/*</div>*/}
                    </fieldset>

                    {/* Action Buttons for Form */}
                    <div className="flex justify-center pt-6 pb-6 border-t-2 border-gray-300">
                        <div className="flex gap-4">
                            <button
                                type="button"
                                className="px-6 py-3 bg-gray-600 text-white font-semibold rounded text-sm hover:bg-gray-700 transition-colors"
                                onClick={handleCloseForm}
                            >
                                Close
                            </button>
                            <button
                                type="button"
                                className="bg-[#28a745] hover:bg-[#218838] text-white px-6 py-3 rounded font-semibold text-sm transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                onClick={saveEquipmentDetails}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseWiseRequirement;