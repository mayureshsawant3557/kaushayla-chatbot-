// (file content updated - only allowedFileTypes props changed from arrays to comma-separated strings)

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import UploadPdf from "../../formcomponent/UploadPdf";
import FormComponent from "../../formcomponent/FormComponent";
import DropdownComponent from "../../formcomponent/DropdownComponent";
import { useLoading } from "../../../Hooks/useLoading";
import { GetInstituteIDByInstituteCode } from "../../../Endpoints_All/Base/Institute";
import {
  GetTrainingEquipmentDetails,
  GetTrainingEquipmentListDetails,
  UpdateTrainingEquipmentAvailability,
} from "../../../Endpoints_All/NewInstituteApprovalProcess/NewInstituteApprovalProcess.jsx";
import { getIp } from "../../../Endpoints_All/Utils/fileUpload";
import { ThemeContext } from "../../Context/ThemeContext";
import { FiInfo } from "react-icons/fi";
import FilteredTableComponent from "../../formcomponent/FilteredTableComponent";
import IconTooltip from "../../formcomponent/TooltipComponent";
import agent from "../../../lib/api/agent";
import { use } from "react";

import { useInspectionLock } from "../../../Hooks/useInspectionLock";
import DocumentLink from "../../formcomponent/OpenDocumentComponent";
import { UpdateInstituteInspectionVerificationStatus } from "../../../Endpoints_All/Base/DVETO";
import InspectionStatusComponent from "../../formcomponent/InspectionStatusComponent";
import { useAuth } from "../../../Hooks/AuthContext.jsx";

import InstituteFlowLayout from "../../../Component/InstituteFlow/InstituteFlowLayout";
import { usePagePermission } from "../../../Hooks/usePagePermission";
import { useInstituteFlow } from "../../../Hooks/useInstituteFlow";

const TrainingEquipmentDetails = () => {
  const { color } = React.useContext(ThemeContext);
    const { startLoading, isLoading , stopLoading } = useLoading();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const p1 = searchParams.get("P1");
    const p2 = searchParams.get("P2");

    const { goNext, goBack, handleClose } = useInstituteFlow(
        "TrainingEquipmentDetails",
        p1,
        p2
    );

    const {
        // userTypeID,
        isViewer,
        canEdit,
        canSave,
    } = usePagePermission();

  // State Management
  const [userLoginID, setUserLoginID] = useState("");
  const [userTypeID, setUserTypeID] = useState(""); // actual value from session
  const [instituteID, setInstituteID] = useState(null);
  const [ipAddress, setIpAddress] = useState("");
  const [trainingEquipmentData, setTrainingEquipmentData] = useState([]);
  const [equipmentListData, setEquipmentListData] = useState([]);
  const [showEquipmentForm, setShowEquipmentForm] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [errors, setErrors] = useState({});
  const [traningRemark, setTrainingRemark] = useState();
  const { userInfo } = useAuth();

  //LOCKED
  const { isLocked, eligibilityData } = useInspectionLock(
    instituteID,
    userLoginID,
    "TrainingEquipmentDetails",
  );
  const [inspectionStatus, setInspectionStatus] = useState({
    status: "",
    remark: "",
  });

  // Form Data State
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
    Photo3FileName: "",
  });

  // Constants
  const REMARK_OPTIONS = [
    { id: 1, label: "Available in Institute" },
    { id: 2, label: "Available with MoU Partner" },
    { id: 3, label: "Available with Allied Course" },
    { id: 4, label: "Not Available" },
  ];
  const inspectionref = useRef();

  useEffect(() => {
  window.scrollTo(0, 0);
}, []);

  // Initialize on Component Mount
  useEffect(() => {
    fetchUserAndInstituteDetails();
    fetchIP();
  }, []);

  useEffect(() => {
      if (instituteID) {
         

      fetchTrainingEquipmentDetails();
    }
  }, [instituteID]);

  // Fetch User and Institute Details
  const fetchUserAndInstituteDetails = async () => {
    try {
      const loginID = userInfo?.UserLoginID;
      const typeID =
        userInfo?.UserTypeID || localStorage.getItem("userTypeID") || "1";
      setUserLoginID(loginID);
      setUserTypeID(typeID);
      // DVETO dashboard case
        if (typeID === 14 || (typeID === 81 && p1) || (typeID === 501 && p1)) {
        setInstituteID(p1);
        return;
      }
      const resInstitute = await agent.get(
        `${GetInstituteIDByInstituteCode}?InstituteCode=${loginID}`,
      );

      if (resInstitute.data?.Data) {
        setInstituteID(resInstitute.data.Data);
      }
    } catch (error) {
      console.error("Error fetching user and institute details:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch user details. Please try again.",
      });
    }
  };

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

  // Fetch Training Equipment Details
  //const fetchTrainingEquipmentDetails = async () => {
  //    try {
  //        startLoading();
  //        const response = await agent.post(GetTrainingEquipmentDetails, {
  //            instituteId: instituteID,
  //            exitInstituteID: 0,
  //            userLoginID: userLoginID,
  //            pageCode: 'TRAINING_EQUIPMENT',
  //            itemId: 0,
  //            ipAddress: ipAddress
  //        });
  //        console.log(response);
  //        if (response.data?.Status === 'Success' && response.data?.Data) {
  //            // 🔹 Extract list
  //            setTrainingEquipmentData(response.data.Data.Items || []);

  //            // 🔹 Extract remark
  //            setTrainingRemark(
  //                response.data.Data.TrainingEquipmentRemark || ''
  //            );
  //        } else {
  //            setTrainingEquipmentData([]);
  //        }
  //    } catch (error) {
  //        console.error('Error fetching training equipment details:', error);
  //        Swal.fire({
  //            icon: 'error',
  //            title: 'Error',
  //            text: 'Failed to fetch training equipment details.'
  //        });
  //    } finally {
  //        stopLoading();
  //    }
  //};
  // Replace the existing fetchTrainingEquipmentDetails function with this normalized version
  const fetchTrainingEquipmentDetails = async () => {
    try {
      startLoading();
      const response = await agent.post(GetTrainingEquipmentDetails, {
        instituteId: instituteID,
        exitInstituteID: 0,
        userLoginID: userLoginID,
        pageCode: "TRAINING_EQUIPMENT",
        itemId: 0,
        ipAddress: ipAddress,
      });

      if (response.data?.Status === "Success" && response.data?.Data) {
        const data = response.data.Data || {};

        // Normalize items to ensure primitive values for table rendering

        const items = Array.isArray(data.Items)
          ? data.Items.map((it) => ({
              ...it,
              // keep a pure string for CourseName (used for form value)
              CourseName: it.CourseCodeName || it.Course || it.CourseName || "",
              // CourseDisplay is used only for table rendering and may contain the DocumentLink component
              CourseDisplay: it.ModelCurriculum ? (
                <DocumentLink
                  documentUrl={it.ModelCurriculum}
                  itemName={it.CourseCodeName || it.Course || "Course"}
                  label={it.CourseCodeName || it.Course || it.CourseName || ""}
                />
              ) : (
                it.CourseCodeName || it.Course || it.CourseName || ""
              ),
              InspectionUnits:
                it.InspectionUnits === null || it.InspectionUnits === undefined
                  ? 0
                  : Number(it.InspectionUnits) || 0,
              MaxRequiredTrainingSetup:
                it.MaxRequiredTrainingSetup === null ||
                it.MaxRequiredTrainingSetup === undefined
                  ? 0
                  : Number(it.MaxRequiredTrainingSetup) || 0,
              PercentageAvailability:
                it.PercentageAvailability === null ||
                it.PercentageAvailability === undefined
                  ? 0
                  : Number(it.PercentageAvailability) || 0,
            }))
          : [];

        setTrainingEquipmentData(items);

        setTrainingRemark(response.data.Data.TrainingEquipmentRemark);
      } else {
        setTrainingEquipmentData([]);
        setTrainingRemark("");
      }
    } catch (error) {
      console.error("Error fetching training equipment details:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch training equipment details.",
      });
    } finally {
      stopLoading();
    }
  };

  const trainingEquipmentTableData = useMemo(() => {
    return trainingEquipmentData.map((item, index) => ({
      ...item,
      srNo: index + 1,
      // Use CourseDisplay for the table cell (may be component). Keep CourseName as the stable string for forms.
      Course: item.CourseDisplay || item.Course || item.CourseName || "",
      InspectionUnits:
        item.InspectionUnits === null || item.InspectionUnits === undefined
          ? 0
          : Number(item.InspectionUnits) || 0,
      MaxRequiredTrainingSetup:
        item.MaxRequiredTrainingSetup === null ||
        item.MaxRequiredTrainingSetup === undefined
          ? 0
          : Number(item.MaxRequiredTrainingSetup) || 0,
      PercentageAvailability:
        item.PercentageAvailability === null ||
        item.PercentageAvailability === undefined
          ? 0
          : Number(item.PercentageAvailability) || 0,
    }));
  }, [trainingEquipmentData]);

  // Fetch Equipment List Details
  const fetchEquipmentListDetails = async (courseID) => {
    try {
      startLoading();
      const response = await agent.post(GetTrainingEquipmentListDetails, {
        instituteId: instituteID,
        exitInstituteID: 0,
        userLoginID: userLoginID,
        pageCode: "Traning Page",
        itemId: courseID,
        ipAddress: ipAddress,
      });

      if (
        response.data?.Status === "Success" &&
        response.data?.Data?.lstTrainingEquipmentListEntity
      ) {
        const formattedData =
          response.data.Data.lstTrainingEquipmentListEntity.map((item) => ({
            ...item,
            Remark:
              item.Remark === -1 ||
              item.Remark === null ||
              item.Remark === undefined ||
              item.Remark === 0
                ? ""
                : item.Remark,
            AvailableEquipments: item.AvailableEquipments || 0,
          }));
        setEquipmentListData(formattedData);
      } else {
        setEquipmentListData([]);
      }
    } catch (error) {
      console.error("Error fetching equipment list details:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch training equipment details.",
      });
      setEquipmentListData([]);
    } finally {
      stopLoading();
    }
  };

  // Handle Infrastructure Submit
  const handleInfrastructureSubmit = async (course) => {
    try {
      setSelectedCourse(course);

      const freshFormData = {
        CourseID: course.CourseID,
        CourseCode: course.CourseCode,
        CourseName:
          course.CourseName || course.Course || course.CourseCodeName || "",

        InspectionUnits: course.InspectionUnits,
        MaxRequiredTrainingSetup: course.MaxRequiredTrainingSetup,
        PercentageAvailability: course.PercentageAvailability,
        MOUApplicableStatus: "",
        DistanceBetweenInstituteAndMOU: "",
        MOUPath: "",
        MOUFileName: "",
        Photo1Path: "",
        Photo2Path: "",
        Photo3Path: "",
        Photo1FileName: "",
        Photo2FileName: "",
        Photo3FileName: "",
      };

      setFormData(freshFormData);
      setShowEquipmentForm(true);
      setErrors({});
      setEquipmentListData([]);

      await Promise.all([
        fetchEquipmentListDetails(course.CourseID),
        fetchExistingUploadedData(course),
      ]);

      setTimeout(() => {
        const formElement = document.getElementById("equipment-form-section");
        if (formElement) {
          formElement.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    } catch (error) {
      console.error("Error in handleInfrastructureSubmit:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load form data. Please try again.",
        confirmButtonColor: "#d33",
      });
    }
  };

  // Fetch Existing Uploaded Data
  const fetchExistingUploadedData = async (course) => {
    try {
      const response = await agent.post(GetTrainingEquipmentListDetails, {
        instituteId: instituteID,
        exitInstituteID: 0,
        userLoginID: userLoginID,
        pageCode: "Traning Page",
        itemId: course.CourseID,
        ipAddress: ipAddress,
      });
      if (response.data?.Status === "Success" && response.data?.Data) {
        const data = response.data.Data;
        const firstEquipment = data.lstTrainingEquipmentListEntity?.[0];
        const mouPath =
          firstEquipment?.MOUPath || firstEquipment?.mouPath || "";
        const mouFileName = mouPath ? mouPath.split("/").pop() : "";
        const DistanceBetweenInstituteAndMOU =
          firstEquipment?.DistanceBetweenInstituteAndMOU || "";

        const photos = data.lstEquipmentPhoto || [];
        const coursePhotos = photos.filter(
          (photo) => (photo.CourseID || photo.courseID) === course.CourseID,
        );

        const sortedPhotos = coursePhotos.sort(
          (a, b) =>
            (a.srno || a.Srno || a.ID || 0) - (b.srno || b.Srno || b.ID || 0),
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

        const mouStatus =
          firstEquipment?.IsCourseMOU === 1 || firstEquipment?.isCourseMOU === 1
            ? "Yes"
            : "No";

        setFormData((prev) => ({
          ...prev,
          MOUApplicableStatus: mouStatus || prev.MOUApplicableStatus,
          MOUPath: mouPath,
          MOUFileName: mouFileName,
          DistanceBetweenInstituteAndMOU:
            DistanceBetweenInstituteAndMOU ||
            prev.DistanceBetweenInstituteAndMOU,
          Photo1Path: photo1Path,
          Photo2Path: photo2Path,
          Photo3Path: photo3Path,
          Photo1FileName: photo1FileName,
          Photo2FileName: photo2FileName,
          Photo3FileName: photo3FileName,
        }));
      }
    } catch (error) {
      console.error("Error fetching existing uploaded data:", error);
    }
  };

  // Handle Form Change
  const handleChange = (name, value) => {
    if (name === "DistanceBetweenInstituteAndMOU") {
      if (value === "") {
        setFormData((prev) => ({ ...prev, [name]: "" }));
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
          confirmButtonColor: "#3085d6",
        });
        return;
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Handle Dropdown Change
  const handleDropdownChange = (name, value) => {
    handleChange(name, value);
  };

  // Handle File Upload
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

    setFormData((prev) => ({
      ...prev,
      [`${fieldName}FileName`]: fileName,
      [`${fieldName}Path`]: filePath,
    }));

    const errorKey = `${fieldName}Path`;
    if (errors[errorKey]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  // Handle Equipment Availability Change
  const handleEquipmentAvailabilityChange = (index, value) => {
    if (value !== "" && !/^\d+$/.test(value)) {
      return;
    }

    const updatedData = [...equipmentListData];
    const item = updatedData[index];

    item.AvailableEquipments = value === "" ? "" : Number(value);

    const availableQty =
      item.AvailableEquipments === "" ? 0 : item.AvailableEquipments;
    const requiredQty = item.RequiredEquipmentForTotalUnits || 0;
    // const availability = availableQty - requiredQty;
    const availability = requiredQty - availableQty;

    item.EquipmentStatus = availability >= 0 ? "Complete" : "Incomplete";

    setEquipmentListData(updatedData);
  };

  // Handle Equipment Remark Change
  const handleEquipmentRemarkChange = (index, value) => {
    const updatedData = [...equipmentListData];
    updatedData[index].Remark = value === "" ? "" : parseInt(value);
    setEquipmentListData(updatedData);
  };

  // Validate Form
  //const validateForm = () => {
  //    const newErrors = {};

  //    if (formData.MOUApplicableStatus === 'Yes') {
  //        if (!formData.DistanceBetweenInstituteAndMOU || formData.DistanceBetweenInstituteAndMOU === '') {
  //            newErrors.DistanceBetweenInstituteAndMOU = 'Distance is required when MoU is applicable';
  //        } else {
  //            const distance = parseFloat(formData.DistanceBetweenInstituteAndMOU);
  //            if (isNaN(distance) || distance < 0 || distance > 15) {
  //                newErrors.DistanceBetweenInstituteAndMOU = 'Distance must be between 0 and 15 KM';
  //            }
  //        }

  //        if (!formData.MOUPath || formData.MOUPath === '') {
  //            newErrors.MOUPath = 'MoU document is required';
  //        }
  //    }

  //    if (!formData.Photo1Path || formData.Photo1Path === '') {
  //        newErrors.Photo1Path = 'Training Equipment Photo 1 is required';
  //    }

  //    // ✅ NEW: Validate Remark for each equipment row
  //    const missingRemarkSrNos = equipmentListData
  //        .map((item, index) => ({ srNo: index + 1, remark: item.Remark }))
  //        .filter(({ remark }) => remark === '' || remark === null || remark === undefined)
  //        .map(({ srNo }) => srNo);

  //    if (missingRemarkSrNos.length > 0) {
  //        newErrors.EquipmentRemark = `Remark is required for Sr. No: ${missingRemarkSrNos.join(', ')}`;
  //    }
  //      setErrors(newErrors);

  //    // ✅ NEW: Show Swal with remark row numbers if any missing
  //    if (newErrors.EquipmentRemark) {
  //        Swal.fire({
  //            icon: 'warning',
  //            title: 'Remark Required',
  //            text: newErrors.EquipmentRemark,
  //            confirmButtonColor: '#3085d6'
  //        });
  //        return false;
  //    }

  //    return Object.keys(newErrors).length === 0;

  //    //return Object.keys(newErrors).length === 0;
  //};

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

    // Equipment Remark validation
    const missingRemarkSrNos = equipmentListData
      .map((item, index) => ({ srNo: index + 1, remark: item.Remark }))
      .filter(({ remark }) => !remark)
      .map(({ srNo }) => srNo);

    if (missingRemarkSrNos.length > 0) {
      const msg = `Remark is required for Sr. No: ${missingRemarkSrNos.join(", ")}`;
      newErrors.EquipmentRemark = msg;
      errorMessages.push(msg);
    }

    // show error below inputs
    setErrors(newErrors);

    // show swal popup
    if (errorMessages.length > 0) {
      Swal.fire({
        icon: "warning",
        title: "Please fix the following errors",
        html: errorMessages.map((e) => `• ${e}`).join("<br/>"),
        confirmButtonColor: "#3085d6",
      });

      return false;
    }

    return true;
  };
  // Save Equipment Details
  const saveEquipmentDetails = async () => {
    if (!validateForm()) {
      //Swal.fire({
      //    icon: 'warning',
      //    title: 'Validation Error',
      //    text: 'Please fill all required fields correctly.',
      //    confirmButtonColor: '#3085d6'

      //});
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
          instituteID: parseInt(instituteID) || 0,
          srno: srno++,
          courseID: parseInt(formData.CourseID) || 0,
          photoPath: formData.Photo1Path || "",
          isEditAllowed: true,
          lastModifiedOn: currentTimestamp,
          userLoginID: userLoginID || "",
          ipAddress: ipAddress,
          pageCode: "TRAINING_EQUIPMENT",
        });
      }

      if (formData.Photo2Path) {
        lstEquipmentPhoto.push({
          id: 0,
          instituteID: parseInt(instituteID) || 0,
          srno: srno++,
          courseID: parseInt(formData.CourseID) || 0,
          photoPath: formData.Photo2Path || "",
          isEditAllowed: true,
          lastModifiedOn: currentTimestamp,
          userLoginID: userLoginID || "",
          ipAddress: ipAddress,
          pageCode: "TRAINING_EQUIPMENT",
        });
      }

      if (formData.Photo3Path) {
        lstEquipmentPhoto.push({
          id: 0,
          instituteID: parseInt(instituteID) || 0,
          srno: srno++,
          courseID: parseInt(formData.CourseID) || 0,
          photoPath: formData.Photo3Path || "",
          isEditAllowed: true,
          lastModifiedOn: currentTimestamp,
          userLoginID: userLoginID || "",
          ipAddress: ipAddress,
          pageCode: "TRAINING_EQUIPMENT",
        });
      }

      const lstTrainingEquipmentListEntity = equipmentListData.map((item) => ({
        instituteId: parseInt(instituteID) || 0,
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
        requiredEquipmentForApprovedUnits:
          parseFloat(item.RequiredEquipmentForApprovedUnits) || 0,
        requiredEquipmentForProposedUnits:
          parseFloat(item.RequiredEquipmentForProposedUnits) || 0,
        requiredEquipmentForTotalUnits:
          parseFloat(item.RequiredEquipmentForTotalUnits) || 0,
        availableEquipments: parseFloat(item.AvailableEquipments) || 0,
        equipmentStatus: item.EquipmentStatus || "Incomplete",
        isEditAllowed: true,
        isDeleteAllowed: false,
        mouPath: formData.MOUPath || "",
        isCourseMOU: formData.MOUApplicableStatus === "Yes" ? 1 : 0,
        remark:
          item.Remark === "" ||
          item.Remark === null ||
          item.Remark === undefined
            ? -1
            : parseInt(item.Remark),
        distanceBetweenInstituteAndMOU:
          parseFloat(formData.DistanceBetweenInstituteAndMOU) || 0,
        userLoginId: userLoginID || "",
        pageCode: "TRAINING_EQUIPMENT",
        ipAddress: ipAddress,
        lstEquipmentPhoto: [],
      }));

      const payload = {
        lstTrainingEquipmentListEntity,
        lstEquipmentPhoto,
      };

      if (
        !lstTrainingEquipmentListEntity ||
        lstTrainingEquipmentListEntity.length === 0
      ) {
        throw new Error(
          "Equipment list cannot be empty. Please ensure equipment data is loaded.",
        );
      }

      if (!lstEquipmentPhoto || lstEquipmentPhoto.length === 0) {
        throw new Error("At least one training equipment photo is required.");
      }

      const response = await agent.post(
        UpdateTrainingEquipmentAvailability,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        },
      );

      if (response.data?.Status === "Success") {
        Swal.fire({
          icon: "success",
          title: "Success",
          text:
            response.data.Message ||
            "Training equipment details saved successfully.",
          confirmButtonColor: "#28a745",
        });

        await fetchTrainingEquipmentDetails();
        handleCloseForm();
      } else {
        throw new Error(response.data?.Message || "Failed to save details");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.Message ||
        error.Message ||
        "Something went wrong";

      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
        confirmButtonColor: "#d33",
      });
    } finally {
      stopLoading();
    }
  };

  const handleAdminSubmit = async () => {
    const isvalid = inspectionref.current?.validate();

    if (!isvalid) {
      return;
    }

    // 🔐 VALIDATION
    if (!inspectionStatus.status) {
      Swal.fire("Validation", "Please select status", "warning");
      return;
    }

    if (inspectionStatus.status === "R" && !inspectionStatus.remark) {
      Swal.fire(
        "Validation",
        "Remark is required when status is Rejected",
        "warning",
      );
      return;
    }

    // 🔒 LOCK FLOW
    if (isLocked) {
        // navigate(`/Institute/CommonFacilityDetails?P1=${p1}&P2=${p2}`);
        goNext();
      return;
      }

      if (isViewer || !canSave) {
          goNext();
          return;
      }

    try {
      startLoading();

      try {
        //startLoading();

        const currentTimestamp = new Date().toISOString();

        const lstEquipmentPhoto = [];
        let srno = 1;

        if (formData.Photo1Path) {
          lstEquipmentPhoto.push({
            id: 0,
            instituteID: parseInt(instituteID) || 0,
            srno: srno++,
            courseID: parseInt(formData.CourseID) || 0,
            photoPath: formData.Photo1Path || "",
            isEditAllowed: true,
            lastModifiedOn: currentTimestamp,
            userLoginID: userLoginID || "",
            ipAddress: ipAddress,
            pageCode: "TRAINING_EQUIPMENT",
          });
        }

        if (formData.Photo2Path) {
          lstEquipmentPhoto.push({
            id: 0,
            instituteID: parseInt(instituteID) || 0,
            srno: srno++,
            courseID: parseInt(formData.CourseID) || 0,
            photoPath: formData.Photo2Path || "",
            isEditAllowed: true,
            lastModifiedOn: currentTimestamp,
            userLoginID: userLoginID || "",
            ipAddress: ipAddress,
            pageCode: "TRAINING_EQUIPMENT",
          });
        }

        if (formData.Photo3Path) {
          lstEquipmentPhoto.push({
            id: 0,
            instituteID: parseInt(instituteID) || 0,
            srno: srno++,
            courseID: parseInt(formData.CourseID) || 0,
            photoPath: formData.Photo3Path || "",
            isEditAllowed: true,
            lastModifiedOn: currentTimestamp,
            userLoginID: userLoginID || "",
            ipAddress: ipAddress,
            pageCode: "TRAINING_EQUIPMENT",
          });
        }

        const lstTrainingEquipmentListEntity = equipmentListData.map(
          (item) => ({
            instituteId: parseInt(instituteID) || 0,
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
            requiredEquipmentForApprovedUnits:
              parseFloat(item.RequiredEquipmentForApprovedUnits) || 0,
            requiredEquipmentForProposedUnits:
              parseFloat(item.RequiredEquipmentForProposedUnits) || 0,
            requiredEquipmentForTotalUnits:
              parseFloat(item.RequiredEquipmentForTotalUnits) || 0,
            availableEquipments: parseFloat(item.AvailableEquipments) || 0,
            equipmentStatus: item.EquipmentStatus || "Incomplete",
            isEditAllowed: true,
            isDeleteAllowed: false,
            mouPath: formData.MOUPath || "",
            isCourseMOU: formData.MOUApplicableStatus === "Yes" ? 1 : 0,
            remark:
              item.Remark === "" ||
              item.Remark === null ||
              item.Remark === undefined
                ? -1
                : parseInt(item.Remark),
            distanceBetweenInstituteAndMOU:
              parseFloat(formData.DistanceBetweenInstituteAndMOU) || 0,
            userLoginId: userLoginID || "",
            pageCode: "TRAINING_EQUIPMENT",
            ipAddress: ipAddress,
            lstEquipmentPhoto: [],
          }),
        );

        const payload = {
          lstTrainingEquipmentListEntity,
          lstEquipmentPhoto,
        };

        if (
          !lstTrainingEquipmentListEntity ||
          lstTrainingEquipmentListEntity.length === 0
        ) {
          throw new Error(
            "Equipment list cannot be empty. Please ensure equipment data is loaded.",
          );
        }

        if (!lstEquipmentPhoto || lstEquipmentPhoto.length === 0) {
          throw new Error("At least one training equipment photo is required.");
        }

        const response = await agent.post(
          UpdateTrainingEquipmentAvailability,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          },
        );

        if (response.data?.Status === "Success") {
          // Swal.fire({
          //     icon: 'success',
          //     title: 'Success',
          //     text: response.data.Message || 'Training equipment details saved successfully.',
          //     confirmButtonColor: '#28a745'
          // });

          await fetchTrainingEquipmentDetails();
          handleCloseForm();
        } else {
          throw new Error(response.data?.Message || "Failed to save details");
        }
      } catch (error) {
        const errorMessage =
          error.response?.data?.Message ||
          error.Message ||
          "Something went wrong";

        Swal.fire({
          icon: "error",
          title: "Error",
          text: errorMessage,
          confirmButtonColor: "#d33",
        });
      }
      //finally {
      //     stopLoading();
      // }

      // 👉 ONLY ADMIN API
      const statusPayload = {
        InstituteID: instituteID,
        PageCode: "TrainingEquipment",
        Status: inspectionStatus.status,
        Remark: inspectionStatus.remark || "",
        CreatedBy: userLoginID,
        IpAddress: ipAddress,
        userTypeID: userTypeID,
      };

      const res = await agent.post(
        UpdateInstituteInspectionVerificationStatus,
        statusPayload,
        { headers: { "Content-Type": "application/json" } },
      );

      if (res.data?.Status !== "Success") {
        throw new Error(res.data?.Message || "Status update failed");
      }

      await Swal.fire({
        icon: "success",
        title: "Success",
        text: "Training Equipment verified successfully",
        confirmButtonText: "OK",
      });

        goNext();
        await fetchTrainingEquipmentDetails();
        handleCloseForm();

      //navigate(`/Institute/CommonFacilityDetails?P1=${p1}&P2=${p2}`);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.Message || "Something went wrong",
      });
    } finally {
      stopLoading();
    }
  };
  // Handle Close Form
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
      Photo3FileName: "",
    });
    setErrors({});
  };

  // Calculate Equipment Totals
  const calculateEquipmentTotals = useMemo(() => {
    if (!equipmentListData.length) {
      return { totalRequired: 0, totalAvailable: 0 };
    }

    return {
      totalRequired: equipmentListData.reduce(
        (sum, item) => sum + (item.RequiredEquipmentForTotalUnits || 0),
        0,
      ),
      totalAvailable: equipmentListData.reduce(
        (sum, item) => sum + (item.AvailableEquipments || 0),
        0,
      ),
    };
  }, [equipmentListData]);

  // Calculate TS Percentage
  const calculateTSPercentage = useMemo(() => {
    if (!equipmentListData.length) return 0;

    const completeCount = equipmentListData.filter(
      (item) => item.EquipmentStatus === "Complete",
    ).length;
    const totalCount = equipmentListData.length;

    if (totalCount === 0) return 0;

    const percentage = (completeCount / totalCount) * 100;
    return parseFloat(percentage.toFixed(2));
  }, [equipmentListData]);

  // Calculate Average Percentage Availability
  const calculateAveragePercentageAvailability = useMemo(() => {
    if (!trainingEquipmentData.length) return 0;

    const total = trainingEquipmentData.reduce(
      (sum, item) => sum + (Number(item.PercentageAvailability) || 0),
      0,
    );
    return parseFloat((total / trainingEquipmentData.length).toFixed(2));
  }, [trainingEquipmentData]);

  // Calculate Total Inspection Units
  const calculateTotalInspectionUnits = useMemo(() => {
    if (!trainingEquipmentData.length) return 0;
    return trainingEquipmentData.reduce(
      (sum, item) => sum + (Number(item.InspectionUnits) || 0),
      0,
    );
  }, [trainingEquipmentData]);

  // Label with shared TooltipComponent
  const LabelWithTooltip = ({ label, tooltip, required }) => (
    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
      <span>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </span>
      {tooltip && (
        <IconTooltip message={tooltip} position="right" width="w-80" />
      )}
    </label>
  );

  // Define Training Equipment Columns for FilteredTableComponent
  const trainingEquipmentColumns = [
    {
      key: "srNo",
      header: "S.N.",
      width: "20px",
      headerClassName: "text-center",
      className: "text-center",
      sortable: false,
    },
    {
      key: "Course",
      header: "Course",
      width: "550px",
      headerClassName: "text-center",
      className: "text-left",
      sortable: true,
    },
    {
      key: "InspectionUnits",
      header: "Inspection Units",
      width: "100px",
      headerClassName: "text-center",
      className: "text-center",
      sortable: true,
    },
    {
      key: "MaxRequiredTrainingSetup",
      header: "Max Training Setups Required",
      width: "130px",
      headerClassName: "text-center",
      className: "text-center",
      sortable: true,
    },
    {
      key: "InfrastructureDetails",
      header: "Infrastructure Details",
      width: "200px",
      headerClassName: "text-center",
      className: "text-center",
      sortable: false,
    },
    {
      key: "PercentageAvailability",
      header: "Percentage Availability",
      width: "150px",
      headerClassName: "text-center",
      className: "text-center",
      sortable: true,
    },
  ];

  // Define Equipment List Columns for FilteredTableComponent
  const equipmentListColumns = [
    {
      key: "srNo",
      header: "S.N.",
      width: "80px",
      headerClassName: "text-center",
      className: "text-center",
    },
    {
      key: "EquipmentName",
      header: "Name of Item",
      width: "250px",
      headerClassName: "text-center",
      className: "text-left",
    },
    {
      key: "UtilizationRemarks",
      header: "Remark for Utilization",
      width: "200px",
      headerClassName: "text-center",
      className: "text-center",
    },
    {
      key: "IsMandatory",
      header: "Mandatory Item",
      width: "120px",
      headerClassName: "text-center",
      className: "text-center",
    },
    {
      key: "IsAlliedCourseItem",
      header: "Allied Course Item",
      width: "150px",
      headerClassName: "text-center",
      className: "text-center",
    },
    {
      key: "IsMouItem",
      header: "MoU Item",
      width: "120px",
      headerClassName: "text-center",
      className: "text-center",
    },
    {
      key: "RequiredPerUnit",
      header: "Per Setup Norm",
      width: "130px",
      headerClassName: "text-center",
      className: "text-center",
    },
    {
      key: "RequiredEquipmentForTotalUnits",
      header: "Required",
      width: "120px",
      headerClassName: "text-center",
      className: "text-center",
    },
    {
      key: "AvailableEquipments",
      header: "Available",
      width: "130px",
      headerClassName: "text-center",
      className: "text-center",
      type: "input",
      inputType: "number",
    },
    {
      key: "Availability",
      header: "Dificiency",
      width: "180px",
      headerClassName: "text-center",
      className: "text-center",
    },
    {
      key: "Remark",
      header: "Remark",
      width: "200px",
      headerClassName: "text-center",
      className: "text-center",
    },
    {
      key: "EquipmentStatus",
      header: "Status",
      width: "130px",
      headerClassName: "text-center",
      className: "text-center",
    },
  ];

  // Custom Cell Renderer for Training Equipment Table
  const renderTrainingEquipmentCell = (item, column, rowIndex) => {
    if (column.key === "srNo") {
      return rowIndex + 1;
    }

    if (column.key === "InfrastructureDetails") {
      return (
        <button
          type="button"
          onClick={() => handleInfrastructureSubmit(item)}
          className="px-4 py-2 bg-blue-500 text-white font-semibold rounded text-sm hover:bg-blue-600 transition-colors"
        >
          Submit
        </button>
      );
    }

    if (column.key === "PercentageAvailability") {
      return `${Number(item[column.key] || 0)}%`;
    }

    return undefined;
  };

  // Custom Cell Renderer for Equipment List Table
  const renderEquipmentListCell = (item, column, rowIndex) => {
    if (column.key === "srNo") {
      return rowIndex + 1;
    }

    if (
      column.key === "IsMandatory" ||
      column.key === "IsAlliedCourseItem" ||
      column.key === "IsMouItem"
    ) {
      return item[column.key] ? "Yes" : "No";
    }

    if (column.key === "AvailableEquipments") {
      return (
        <input
          type="number"
          min="0"
          step="1"
          value={item.AvailableEquipments ?? ""}
          onChange={(e) =>
            handleEquipmentAvailabilityChange(rowIndex, e.target.value)
          }
          className="w-full px-2 py-1 border border-gray-300 rounded text-center text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLocked}
        />
      );
    }

    if (column.key === "Availability") {
      const availability =
        (Number(item.AvailableEquipments) || 0) -
        (Number(item.RequiredEquipmentForTotalUnits) || 0);
      return availability;
    }

    if (column.key === "Remark") {
      return (
        <select
          value={item.Remark || ""}
          onChange={(e) =>
            handleEquipmentRemarkChange(rowIndex, e.target.value)
          }
          className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLocked} // (Number(item.IsMouItem) === 1 && formData.MOUApplicableStatus === 'Yes')
        >
          <option value="">Select</option>

          {REMARK_OPTIONS.filter(
            (option) =>
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
              ),
          ).map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    if (column.key === "EquipmentStatus") {
      const statusColor =
        item.EquipmentStatus === "Complete" ? "text-green-600" : "text-red-600";
      return (
        <span className={`font-semibold text-xs ${statusColor}`}>
          {item.EquipmentStatus}
        </span>
      );
    }

    return undefined;
  };

  // Prepare Equipment List Data with srNo
  const equipmentListTableData = useMemo(() => {
    return equipmentListData.map((item, index) => ({
      ...item,
      srNo: index + 1,
    }));
  }, [equipmentListData]);

  // Footer renderers
  const renderTrainingEquipmentFooter = () => {
    const avgPercentage = calculateAveragePercentageAvailability;
    const totalInspection = calculateTotalInspectionUnits;
    return (
      <>
        <tr className="bg-gray-100 font-bold">
          <td
            colSpan={2}
            className="border border-gray-300 px-4 py-2 text-left"
          >
            Totals
          </td>
          <td className="border border-gray-300 px-2 py-2 text-center">
            {totalInspection}
          </td>
          <td className="border border-gray-300 px-2 py-2 text-center"></td>
          <td className="border border-gray-300 px-2 py-2 text-center"></td>
          <td className="border border-gray-300 px-2 py-2 text-center">
            {avgPercentage}%
          </td>
        </tr>
      </>
    );
  };

  const renderEquipmentListFooter = () => {
    // equipmentListColumns length = 12
    const totals = calculateEquipmentTotals;
    const ts = calculateTSPercentage;
    return (
      <>
        <tr className="bg-gray-100 font-bold">
          <td
            colSpan={7}
            className="border border-gray-300 px-4 py-2 text-right"
          >
            Totals
          </td>
          <td className="border border-gray-300 px-2 py-2 text-center">
            {totals.totalRequired}
          </td>
          <td className="border border-gray-300 px-2 py-2 text-center">
            {totals.totalAvailable}
          </td>
          <td className="border border-gray-300 px-2 py-2 text-center">
            {ts}%
          </td>
          <td className="border border-gray-300 px-2 py-2 text-center"></td>
          <td className="border border-gray-300 px-2 py-2 text-center"></td>
        </tr>
      </>
    );
    };

    // added to handle separte case for layout button and form submit button
    const updateVerificationStatus = async () => {

        const isValid = inspectionref.current?.validate();

        if (!isValid) {
            return false;
        }

        if (!inspectionStatus.status) {
            Swal.fire(
                "Validation",
                "Please select status",
                "warning"
            );
            return false;
        }

        if (
            inspectionStatus.status === "R" &&
            !inspectionStatus.remark
        ) {
            Swal.fire(
                "Validation",
                "Remark is required when status is Rejected",
                "warning"
            );
            return false;
        }

        const statusPayload = {
            InstituteID: instituteID,
            PageCode: "TrainingEquipment",
            Status: inspectionStatus.status,
            Remark: inspectionStatus.remark || "",
            CreatedBy: userLoginID,
            IpAddress: ipAddress,
            userTypeID: userTypeID,
        };

        const res = await agent.post(
            UpdateInstituteInspectionVerificationStatus,
            statusPayload,
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        if (res.data?.Status !== "Success") {
            throw new Error(
                res.data?.Message || "Status update failed"
            );
        }
        await Swal.fire({
            icon: "success",
            title: "Success",
            text: "Training Equipment verified successfully",
            confirmButtonText: "OK",
        });

        return true;
    };

    const handleSave = async () => {

        // Layout button → only navigation
        if (!showEquipmentForm) {

            // For 14 / 81 → update verification status
            if (userTypeID === 14 || userTypeID === 81) {

                const statusUpdated = await updateVerificationStatus();

                if (!statusUpdated) {
                    return;
                }

                goNext();
                return;
            }

            // Other users → only navigation
            goNext();
            return;
        }

        // Form is open
        if (userTypeID === 64) {
            await saveEquipmentDetails();
            return;
        }

        if (userTypeID === 14 || userTypeID === 81) {
            await handleAdminSubmit();
            return;
        }

        goNext();
    };

    return (

        <InstituteFlowLayout
            currentPageCode="TrainingEquipmentDetails"
            p1={p1}
            p2={p2}
            onSave={handleSave}
            isSaveLoading={isLoading}
            isLocked={isLocked}
            title="Training Equipment Details"
            color={color}
            showFlowActions={!showEquipmentForm}
        >
   

        <div className="mt-4">
          <FilteredTableComponent
            data={trainingEquipmentTableData}
            columns={trainingEquipmentColumns}
            filterColumns={["Course"]}
            searchable={true}
            sortable={true}
            exportable={false}
            showSearch={false}
            showExport={false}
            maxHeight="500px"
            stickyHeader={true}
            renderCell={renderTrainingEquipmentCell}
            customFooter={renderTrainingEquipmentFooter()}
            emptyStateMessage="No training equipment data available"
            emptyStateSubMessage="Please ensure courses are configured in the system"
            tableId="training-equipment-table"
          />
        </div>

        {/* Notes Section */}
        <div className="mt-4 rounded-md border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm text-blue-700">
            <span className="font-medium">Note:</span>
          </p>
          <ol className="list-decimal list-inside mt-1 space-y-1 text-sm text-blue-700">
            <li>
              Submit Infrastructure Details for all i.e. existing and proposed
              courses.
            </li>
            <li>Percentage Availability for all courses should be 100%</li>
          </ol>
        </div>
        <div className="mt-4 mb-2 rounded-md border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">
            <span className="font-medium">Remark:</span>
          </p>
          <p className="text-sm text-red-700 mt-1">{traningRemark}</p>
            </div>

            {/* Equipment Form Section - Shows below table when Submit is clicked */}
            {showEquipmentForm && selectedCourse && (
                <div className="space-y-6" id="equipment-form-section">
                    {/* Course Details Form */}
                    <fieldset className="border border-gray-300 rounded px-4 pt-3 pb-4">
                        <legend
                            className={`flex items-center gap-2 rounded-md border border-gray-300 ${color} px-4 py-2 text-xl  mt-2 font-bold text-white shadow-md`}
                        >
                            Course Details
                        </legend>

                        <div className="grid-cols-3">
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
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                            {/* Course Name - Non-editable */}

                            {/* Inspection Units - Non-editable */}
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">
                                    Inspection Units
                                </label>
                                <FormComponent
                                    label=""
                                    value={formData.InspectionUnits}
                                    onChange={() => { }}
                                    disabled={true}
                                    extraClass="bg-gray-100 cursor-not-allowed"
                                />
                            </div>

                            {/* Max Training Setups Required - Non-editable */}
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

                            {/* Percentage Availability - Non-editable */}
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

                            {/* Do you have MoU with Tooltip */}
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
                                        { value: "No", label: "No" },
                                    ]}
                                    value={formData.MOUApplicableStatus}
                                    onChange={(value) =>
                                        handleDropdownChange("MOUApplicableStatus", value)
                                    }
                                    error={errors.MOUApplicableStatus}
                                    required={false}
                                    disabled={isLocked}
                                />
                            </div>

                            {/* Distance between Institute and MoU Organization with Tooltip */}
                            {formData.MOUApplicableStatus === "Yes" && (
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
                                        onChange={(value) =>
                                            handleChange("DistanceBetweenInstituteAndMOU", value)
                                        }
                                        required={false}
                                        min={0}
                                        max={15}
                                        step={0.01}
                                        disabled={isLocked}
                                    />
                                    {errors.DistanceBetweenInstituteAndMOU && (
                                        <span className="text-red-500 text-xs mt-1 block">
                                            {errors.DistanceBetweenInstituteAndMOU}
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Upload MoU */}
                            {formData.MOUApplicableStatus === "Yes" && (
                                <div className="flex flex-col">
                                    <label className="text-sm font-medium text-gray-700 mb-2">
                                        Upload MoU<span className="text-red-500">*</span>
                                    </label>
                                    <UploadPdf
                                        file={formData.MOUFileName}
                                        onFileChange={(uploadData) =>
                                            handleFileUpload("MOU", uploadData)
                                        }
                                        buttonClassName="bg-[#00c3f9]"
                                        buttonText={"Upload"}
                                        showLabel={false}
                                        allowedFileTypes="pdf"
                                        maxFileSize="2 MB"
                                        required={true}
                                        userTypeId={userTypeID}
                                        userLoginID={userLoginID}
                                        linkName={formData.MOUPath ? `View MoU` : ""}
                                        uniquefilepath={formData.MOUPath}
                                        id="mouUpload"
                                        disabled={isLocked}
                                    />
                                    {errors.MOUPath && (
                                        <span className="text-red-500 text-xs mt-1 block">
                                            {errors.MOUPath}
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Training Equipment Photos - Conditional Rendering */}
                            {/* Photo 1 - Always show */}
                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700 mb-2">
                                    Upload Training Equipment Photo 1
                                    <span className="text-red-500">*</span>
                                </label>
                                <UploadPdf
                                    file={formData.Photo1FileName}
                                    onFileChange={(uploadData) =>
                                        handleFileUpload("Photo1", uploadData)
                                    }
                                    buttonClassName="bg-[#00c3f9]"
                                    buttonText={"Upload"}
                                    showLabel={false}
                                    allowedFileTypes="jpg, jpeg, png"
                                    maxFileSize="2 MB"
                                    required={true}
                                    userTypeId={userTypeID}
                                    userLoginID={userLoginID}
                                    linkName={formData.Photo1Path ? `View Photo 1` : ""}
                                    uniquefilepath={formData.Photo1Path}
                                    id="photo1Upload"
                                    disabled={isLocked}
                                />
                                {errors.Photo1Path && (
                                    <span className="text-red-500 text-xs mt-1 block">
                                        {errors.Photo1Path}
                                    </span>
                                )}
                            </div>

                            {/* Photo 2 - Only show if Photo 1 is uploaded */}
                            {formData.Photo1Path && (
                                <div className="flex flex-col">
                                    <label className="text-sm font-medium text-gray-700 mb-2">
                                        Upload Training Equipment Photo 2
                                    </label>
                                    <UploadPdf
                                        file={formData.Photo2FileName}
                                        onFileChange={(uploadData) =>
                                            handleFileUpload("Photo2", uploadData)
                                        }
                                        buttonClassName="bg-[#00c3f9]"
                                        buttonText={"Upload"}
                                        showLabel={false}
                                        allowedFileTypes="jpg, jpeg, png"
                                        maxFileSize="2 MB"
                                        required={false}
                                        userTypeId={userTypeID}
                                        userLoginID={userLoginID}
                                        linkName={formData.Photo2Path ? `View Photo 2` : ""}
                                        uniquefilepath={formData.Photo2Path}
                                        id="photo2Upload"
                                        disabled={isLocked}
                                    />
                                </div>
                            )}

                            {/* Photo 3 - Only show if Photo 2 is uploaded */}
                            {formData.Photo1Path && formData.Photo2Path && (
                                <div className="flex flex-col">
                                    <label className="text-sm font-medium text-gray-700 mb-2">
                                        Upload Training Equipment Photo 3
                                    </label>
                                    <UploadPdf
                                        file={formData.Photo3FileName}
                                        onFileChange={(uploadData) =>
                                            handleFileUpload("Photo3", uploadData)
                                        }
                                        buttonClassName="bg-[#00c3f9]"
                                        buttonText={"Upload"}
                                        showLabel={false}
                                        allowedFileTypes="jpg, jpeg, png"
                                        maxFileSize="2 MB"
                                        required={false}
                                        userTypeId={userTypeID}
                                        userLoginID={userLoginID}
                                        linkName={formData.Photo3Path ? `View Photo 3` : ""}
                                        uniquefilepath={formData.Photo3Path}
                                        id="photo3Upload"
                                        disabled={isLocked}
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
                                onRowChange={handleEquipmentAvailabilityChange}
                                emptyStateMessage="No equipment data available"
                                emptyStateSubMessage="Equipment list will be populated based on course selection"
                                tableId="equipment-list-table"
                                customFooter={renderEquipmentListFooter()}
                                readonly={isLocked}
                            />
                        </div>

                        {/* Notes Section */}
                        <div className="mt-4 rounded-md border border-blue-200 bg-blue-50 p-4">
                            <p className="text-sm text-blue-700">
                                <span className="font-medium">Note:</span>
                            </p>
                            <ol className="list-decimal list-inside mt-1 space-y-1 text-sm text-blue-700">
                                {/*<li>Negative Training Equipment Availability means shortage</li>*/}
                                {/*<li>Positive Training Equipment Availability means adequate/excess</li>*/}
                                <li>Negative Deficiency means adequate/excess</li>
                                <li>Positive Deficiency means shortage</li>
                            </ol>
                        </div>

                        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-4">
                            <p className="text-sm text-red-700">
                                <span className="font-medium">Remark:</span>{" "}
                                {calculateTSPercentage < 100
                                    ? "Training Equipment availability is less than Required Norms."
                                    : "Training Equipment availability is as per Required Norms"}
                            </p>
                        </div>


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
                    </fieldset>
                </div>

            )}

        {/*{userTypeID === 14 && (*/}
        {/*    <div className="mt-6">*/}
        {/*        <InspectionStatusComponent*/}
        {/*            instituteId={instituteID}*/}
        {/*            pageCode="TrainingEquipmentDetails"*/}
        {/*            onChange={(data) => setInspectionStatus(data)}*/}
        {/*        />*/}
        {/*    </div>*/}
        {/*)}*/}
            {(((userTypeID === 81 || isViewer )&&
          ["S"].includes(eligibilityData?.InspectionStatus)) ||
          ["V", "W"].includes(eligibilityData?.VerificationStatus)) && (
          <InspectionStatusComponent
            // ref={inspectionref}
            instituteId={instituteID}
            pageCode="TrainingEquipmentDetails"
            // onChange={(data) => setInspectionStatus(data)}
            //readOnly={userTypeID !== 14}
            readOnly={
              eligibilityData?.InspectionStatus === "S" && userTypeID === 81
            }
            TypeID="14"
            // userName="By Dveto"
            mode="view"
          />
        )}

        {(userTypeID === 14 ||
          ((userTypeID == 64 || userTypeID === 81) &&
            ["I", "S", "WD", "W"].includes(
              eligibilityData?.InspectionStatus,
            )) ||
          ["V", "W"].includes(eligibilityData?.VerificationStatus)) && (
          <InspectionStatusComponent
            ref={inspectionref}
            instituteId={instituteID}
            pageCode="TrainingEquipmentDetails"
            onChange={(data) => setInspectionStatus(data)}
            //readOnly={userTypeID !== 14}
            //readOnly={eligibilityData?.InspectionStatus === 'S' && userTypeID ==14}
            readOnly={
              (userTypeID === 14 &&
                eligibilityData?.InspectionStatus === "S") ||
              (userTypeID === 81 && eligibilityData?.VerificationStatus === "V")
            }
          />
        )}

            {(userTypeID === 14 || isViewer) &&
          ["S", "WD"].includes(eligibilityData?.InspectionStatus) && (
            <InspectionStatusComponent
              //    ref={inspectionref}
              instituteId={instituteID}
              pageCode="TrainingEquipmentDetails"
              //   onChange={(data) => setInspectionStatus(data)}
              //readOnly={userTypeID !== 14}
              readOnly={
                eligibilityData?.InspectionStatus === "S" && userTypeID === 14
              }
              TypeID="81"
              //userName="By Board"
              mode="view"
            />
          )}
        {/* Action Buttons - Only show when form is NOT open */}
       
      
      
        
    </InstituteFlowLayout >
  );
};

export default TrainingEquipmentDetails;
