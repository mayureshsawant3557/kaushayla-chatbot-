import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import agent from "../../../lib/api/agent";
import Swal from "sweetalert2";
import FilteredTableComponent from "../../formcomponent/FilteredTableComponent";
import UploadPdf from "../../formcomponent/UploadPdf";
import { DateInput } from "../../formcomponent/DateInputComponent";
import FormComponent from "../../formcomponent/FormComponent";
import DropdownComponent from "../../formcomponent/DropdownComponent";
import { useLoading } from "../../../Hooks/useLoading";
import { FiInfo, FiEye, FiEdit, FiX, FiPlus } from "react-icons/fi";
import { FaTrash } from "react-icons/fa";
import {
  GetBuildingDetails,
  DeleteBuildingDetails,
  SaveBuildingDetails,
  GetBuildingSpaceasperNormsAnalysis,
  GetBuildingSpaceasperNorms,
} from "../../../Endpoints_All/NewInstituteApprovalProcess/NewInstituteApprovalProcess";
import { GetInstituteIDByInstituteCode } from "../../../Endpoints_All/Base/Institute";
import { GetMasterTableList } from "../../../Endpoints_All/Base/masterData";
import { getIp } from "../../../Endpoints_All/Utils/fileUpload";
import pdflogo from "../../../assets/pdf.png";
import { ThemeContext } from "../../Context/ThemeContext";
import IconTooltip from "../../formcomponent/TooltipComponent";
import { UpdateInstituteInspectionVerificationStatus } from "../../../Endpoints_All/Base/DVETO";
import InspectionStatusComponent from "../../formcomponent/InspectionStatusComponent";
import { useInspectionLock } from "../../../Hooks/useInspectionLock";
import DocumentLink from "../../formcomponent/OpenDocumentComponent";
import { useAuth } from "../../../Hooks/AuthContext";

import InstituteFlowLayout from "../../../Component/InstituteFlow/InstituteFlowLayout";
import { usePagePermission } from "../../../Hooks/usePagePermission";
import { useInstituteFlow } from "../../../Hooks/useInstituteFlow";

const BuildingDetails = () => {
  const { startLoading, stopLoading, isLoading } = useLoading();
  const [userLoginID, setUserLoginID] = useState(null);
  const [userTypeID, setUserTypeID] = useState(null);
  const [instituteID, setInstituteID] = useState(null);
  const [ipAddress, setIpAddress] = useState("0.0.0.0");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [buildings, setBuildings] = useState([]);
  const [editingBuildingId, setEditingBuildingId] = useState(null);
  const [requiredSpaceData, setRequiredSpaceData] = useState([]);
  const [spaceAnalysisData, setSpaceAnalysisData] = useState([]);
  const [spaceAnalysisRemark, setSpaceAnalysisRemark] = useState("");
  const { color } = useContext(ThemeContext);
  const editBuildingRef = useRef(null);
  const navigate = useNavigate();
  const { userInfo } = useAuth();
  const [inspectionStatus, setInspectionStatus] = useState({
    status: "",
    remark: "",
  });
  //DVETO
  const [searchParams] = useSearchParams();
  const p1 = searchParams.get("P1");
  const p2 = searchParams.get("P2");


    const { goNext, goBack, handleClose } = useInstituteFlow(
        "BuildingDetails",
        p1,
        p2
    );

  const inspectionref = useRef();

  // Inspection Lock
  const { isLocked, eligibilityData } = useInspectionLock(
    instituteID,
    userLoginID,
    "BuildingDetails",
    );

    const {
        // userTypeID,
        isViewer,
        canEdit,
        canSave,
    } = usePagePermission();

  // Dropdown Options State
  const [dropdownOptions, setDropdownOptions] = useState({
    buildingName: [],
    constructionStatus: [],
    ownership: [],
    constructionType: [],
    floors: [],
    constructionYear: [],
    usageType: [],
  });

  const [loading, setLoading] = useState({
    buildingName: false,
    constructionStatus: false,
    ownership: false,
    constructionType: false,
    floors: false,
    constructionYear: false,
    usageType: false,
  });

  const [formData, setFormData] = useState({
    BuildingID: 0,
    BuildingNameTypeId: "",
    BuildingNameType: "",
    OwnerShipTypeid: "",
    OwnerShipType: "",
    BuildingStatusId: "",
    BuildingStatus: "",
    ConstructionTypeId: "",
    ConstructionType: "",
    UsageTypeId: "",
    UsageType: "",
    FloorId: "",
    FloorName: "",
    ConstructionYearId: "",
    ConstructionYear: "",
    RoadWidth: "",
    GroundFloorArea: "",
    OtherFloorArea: "",
    TotalFloorArea: "",
    CelingHeight: "",
    LeaseDate: "",
    LeaseExpiryDate: "",
    Building712FilePath: "",
    Building712FileName: "",
    LeaseFilePath: "",
    LeaseFileName: "",
    FloorPlanFilePath: "",
    FloorPlanFileName: "",
    GoogleMapPath: "",
    RoadDocPath: "",
    RoadDocFileName: "",
    BuildingPhotoPath: "",
    BuildingPhotoFileName: "",
    BuildingOtherUsestatusId: "",
    BuildingOtherUsestatus: "",
    BuildingOtherUsestatusText: "",
    IsBuildingReady: false,
    IsDedicated: "",
    HasApproachRoad: false,
    Latitude: "",
    Longitude: "",
  });

  const [latLongInput, setLatLongInput] = useState("");
  const [errors, setErrors] = useState({});
  const [fieldsDisabled, setFieldsDisabled] = useState(false);

  // Format options helper
  const formatOptions = (data) => {
    if (!data || !Array.isArray(data)) return [];
    return data.map((item) => ({
      value: item.Value,
      label: item.Text,
    }));
  };

  // Fetch User and Institute Details
  const fetchUserAndInstituteDetails = async () => {
    try {
      const loginID = userInfo?.UserLoginID;
      const typeID =
        userInfo?.UserTypeID || localStorage.getItem("userTypeID") || "1";
      setUserLoginID(loginID);
      setUserTypeID(typeID);
      // DVETO / Admin user
      if (typeID === 14 || (typeID === 81 && p1)  || (typeID === 501 && p2)) {
        setInstituteID(p1);

        return;
      }

      const resInstitute = await agent.get(
        `${GetInstituteIDByInstituteCode}?InstituteCode=${loginID}`,
      );

      if (resInstitute.data?.Data) {
        const instID = resInstitute.data.Data;
        setInstituteID(instID);
      } else {
        console.warn("Institute not found for UserLoginID:", loginID);
      }
    } catch (error) {
      console.error("Error fetching user and institute details:", error);
    }
  };

  // Fetch IP Address
  const fetchIP = async () => {
    try {
      const response = await agent.get(getIp, {
        headers: {
          accept: "*/*",
        },
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

  // Fetch Required Space Data
  const fetchRequiredSpaceData = async () => {
    if (!instituteID) return;

    try {
      startLoading();
      const response = await agent.get(
        `${GetBuildingSpaceasperNorms}?InstituteID=${instituteID}`,
      );

      if (response.data?.Status === "Success" && response.data?.Data) {
        const formattedData = response.data.Data.map((item, index) => ({
          id: index + 1,
          sn: index + 1,
          course: item.ModelCurriculum ? (
            <DocumentLink
              documentUrl={item.ModelCurriculum}
              itemName={item.CourseNameCode || "Course"}
              label={item.CourseNameCode || ""}
            />
          ) : (
            item.CourseNameCode || ""
          ),
          InspectionUnits: item.InspectionUnits || 0,
          MaxTraningSetupRequired: item.MaxTraningSetupRequired || 0,
          totalUnits: item.LOITotalUnits || 0,
          perUnitNorm: item.PerUnitNorms || 0,
          floorPreference:
            item.FloorPreference === 99 ? "Any Floor" : "Ground Floor",
          areaGroundFloor: item.AreaOnGroundFloor?.toFixed(2) || "0.00",
          areaOtherFloor: item.AreaonOtherthanGroundFloor?.toFixed(2) || "0.00",
        }));
        setRequiredSpaceData(formattedData);
      } else {
        setRequiredSpaceData([]);
      }
    } catch (error) {
      console.error("Error fetching required space data:", error);
      setRequiredSpaceData([]);
    } finally {
      stopLoading();
    }
  };

  // Fetch Space Analysis Data
  const fetchSpaceAnalysisData = async () => {
    if (!instituteID) return;

    try {
      const response = await agent.get(
        `${GetBuildingSpaceasperNormsAnalysis}?InstituteID=${instituteID}`,
      );

      if (response.data?.Status === "Success" && response.data?.Data) {
        const analysisData = response.data.Data;

        const formattedData = analysisData.map((item, index) => {
          let rowClassName = "bg-white";
          if (item.Title === "Required Space as per Norms") {
            rowClassName = "bg-yellow-50";
          } else if (item.Title === "Available Space") {
            rowClassName = "bg-green-50";
          } else if (item.Title === "Space Availability") {
            rowClassName =
              item.GroundFloorArea < 0 ? "bg-red-100" : "bg-green-100";
          }

          return {
            id: index + 1,
            label: item.Title,
            groundFloor: item.GroundFloorArea?.toFixed(2) || "0.00",
            anyFloor: item.OtherFloorArea?.toFixed(2) || "0.00",
            total: item.TotalFloorArea?.toFixed(2) || "0.00",
            rowClassName: rowClassName,
            remark: item.Remark || "",
          };
        });

        setSpaceAnalysisData(formattedData);

        const spaceAvailability = analysisData.find(
          (item) => item.Title === "Space Availability",
        );
        if (spaceAvailability && spaceAvailability.Remark) {
          setSpaceAnalysisRemark(spaceAvailability.Remark);
        }
      } else {
        setSpaceAnalysisData([]);
        setSpaceAnalysisRemark("");
      }
    } catch (error) {
      console.error("Error fetching space analysis data:", error);
      setSpaceAnalysisData([]);
      setSpaceAnalysisRemark("");
    }
  };

  // Fetch Dropdown Data
  const fetchDropdownData = async (
    tableName,
    valueField,
    textField,
    stateKey,
  ) => {
    try {
      setLoading((prev) => ({ ...prev, [stateKey]: true }));
      const response = await agent.get(
        `${GetMasterTableList}?TableName=${tableName}&DataValueField=${valueField}&DataTextField=${textField}&HasSelect=true&orderByText=${valueField}`,
      );

      if (response.data?.Data) {
        let filteredData = response.data.Data.filter(
          (item) => item.Value !== "-1",
        );

        if (tableName === "Master_ConstructionYear") {
          filteredData = filteredData.sort(
            (a, b) => Number(b.Value) - Number(a.Value),
          );
        }

        setDropdownOptions((prev) => ({
          ...prev,
          [stateKey]: filteredData,
        }));
      }
    } catch (error) {
      console.error(`Error fetching ${stateKey}:`, error);
    } finally {
      setLoading((prev) => ({ ...prev, [stateKey]: false }));
    }
  };

  // Fetch Building Details
  const fetchBuildingDetails = async () => {
    if (!instituteID) return;

    try {
      startLoading();
      const response = await agent.get(
        `${GetBuildingDetails}?InstituteID=${instituteID}&BuildingId=0`,
      );
      if (response.data?.Data) {
        setBuildings(response.data.Data);
      }
      if (response.data.Message == "No building details found.") {
        setBuildings([]);
      }
    } catch (error) {
      console.error("Error fetching building details:", error);
    } finally {
      stopLoading();
    }
  };

  useEffect(() => {
  window.scrollTo(0, 0);
}, []);

  // Initialize data on mount
  useEffect(() => {
    fetchUserAndInstituteDetails();
    fetchIP();
  }, []);

  // Fetch dropdowns when component mounts
  useEffect(() => {
    fetchDropdownData(
      "Master_BuildingNameType",
      "BuildingNameTypeId",
      "BuildingNameType",
      "buildingName",
    );
    fetchDropdownData(
      "Master_BuildingStatus",
      "BuildingStatusId",
      "BuildingStatus",
      "constructionStatus",
    );
    fetchDropdownData(
      "Master_BuildingOwnershipType",
      "OwnerShipTypeid",
      "OwnerShipType",
      "ownership",
    );
    fetchDropdownData(
      "Master_ConstructionType",
      "ConstructionTypeId",
      "ConstructionType",
      "constructionType",
    );
    fetchDropdownData("Master_BuildingFloor", "FloorId", "FloorName", "floors");
    fetchDropdownData(
      "Master_ConstructionYear",
      "YearId",
      "YearId",
      "constructionYear",
    );
    fetchDropdownData(
      "Master_BuildingUsageType",
      "UsageTypeId",
      "UsageType",
      "usageType",
    );
  }, []);

  // Fetch buildings, required space, and analysis when instituteID is available
  useEffect(() => {
    if (instituteID) {
      fetchBuildingDetails();
      fetchRequiredSpaceData();
      fetchSpaceAnalysisData();
    }
  }, [instituteID, userLoginID, ipAddress]);

  // Refresh analysis data
  const refreshAnalysisData = () => {
    fetchSpaceAnalysisData();
  };

  // Auto-calculate total area
  useEffect(() => {
    const gf = parseFloat(formData.GroundFloorArea) || 0;
    const of = parseFloat(formData.OtherFloorArea) || 0;
    const total = gf + of;
    setFormData((prev) => ({
      ...prev,
      TotalFloorArea: total > 0 ? total.toFixed(2) : "",
    }));
  }, [formData.GroundFloorArea, formData.OtherFloorArea]);

  // Calculate totals for Required Space table
  const requiredSpaceTotals = {
    totalGroundFloorArea: requiredSpaceData
      .reduce((sum, item) => sum + parseFloat(item.areaGroundFloor || 0), 0)
      .toFixed(2),
    totalOtherFloorArea: requiredSpaceData
      .reduce((sum, item) => sum + parseFloat(item.areaOtherFloor || 0), 0)
      .toFixed(2),
  };

  // Calculate totals for Available Space table
  const availableSpaceTotals = {
    totalGroundFloorArea: buildings
      .reduce((sum, b) => sum + (parseFloat(b.GroundFloorArea) || 0), 0)
      .toFixed(2),
    totalOtherFloorArea: buildings
      .reduce((sum, b) => sum + (parseFloat(b.OtherFloorArea) || 0), 0)
      .toFixed(2),
    totalArea: buildings
      .reduce((sum, b) => sum + (parseFloat(b.TotalFloorArea) || 0), 0)
      .toFixed(2),
  };

  // Handle dropdown change
  const handleDropdownChange = (name, value) => {
    const selectedOption = dropdownOptions[name]?.find(
      (opt) => opt.Value === value,
    );

    let updates = {
      [name]: value,
    };

    if (name === "buildingName") {
      updates.BuildingNameTypeId = value;
      updates.BuildingNameType = selectedOption?.Text || "";
    } else if (name === "constructionStatus") {
      updates.BuildingStatusId = value;
      updates.BuildingStatus = selectedOption?.Text || "";
    } else if (name === "ownership") {
      updates.OwnerShipTypeid = value;
      updates.OwnerShipType = selectedOption?.Text || "";

      if (selectedOption?.Text === "Rented") {
        updates.Building712FilePath = "";
        updates.Building712FileName = "";
      } else if (selectedOption?.Text === "Owned") {
        updates.LeaseDate = "";
        updates.LeaseExpiryDate = "";
        updates.LeaseFilePath = "";
        updates.LeaseFileName = "";
      }
    } else if (name === "constructionType") {
      updates.ConstructionTypeId = value;
      updates.ConstructionType = selectedOption?.Text || "";
    } else if (name === "floors") {
      updates.FloorId = value;
      updates.FloorName = selectedOption?.Text || "";
    } else if (name === "constructionYear") {
      updates.ConstructionYearId = value;
      updates.ConstructionYear = selectedOption?.Text || "";
    } else if (name === "usageType") {
      updates.UsageTypeId = value;
      updates.UsageType = selectedOption?.Text || "";
    } else if (name === "isDedicated") {
      updates.IsDedicated = value;
      if (value === "Yes" || value === "1" || value === 1) {
        updates.BuildingOtherUsestatusId = -1;
        updates.BuildingOtherUsestatus = "";
        updates.BuildingOtherUsestatusText = "";
      }
    } else if (name === "otherUsage") {
      updates.UsageTypeId = value;
      updates.BuildingOtherUsestatusId = value;
      updates.BuildingOtherUsestatus = selectedOption?.Text || "";
      updates.UsageType = selectedOption?.Text || "";
      if (selectedOption?.Text !== "Other") {
        updates.BuildingOtherUsestatusText = "";
      }
    }

    setFormData((prev) => ({ ...prev, ...updates }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Handle input change
  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const parseDate = (dateString) => {
    const [day, month, year] = dateString.split("/");
    return new Date(year, month - 1, day);
  };

  // Validate lease dates
  const validateLeaseExpiry = (leaseDate, expiryDate) => {
    if (!leaseDate || !expiryDate) return null;

    const lease = parseDate(leaseDate);
    const expiry = parseDate(expiryDate);

    //const lease = new Date(leaseDate);
    //const expiry = new Date(expiryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const fiveYearsFromLease = new Date(lease);
    fiveYearsFromLease.setFullYear(fiveYearsFromLease.getFullYear() + 5);

    const fourYearsFromToday = new Date(today);
    fourYearsFromToday.setFullYear(fourYearsFromToday.getFullYear() + 4);

    const errors = [];

    //if (expiry < fiveYearsFromLease && expiry < fourYearsFromToday ) {
    //    errors.push('Expiry of Lease must be 5 years from Date of Lease and 4 years from today');
    //}
    if (expiry < fiveYearsFromLease) {
      errors.push("Expiry of Lease must be 5 years from Date of Lease");
    }

    if (expiry < fourYearsFromToday) {
      errors.push("Expiry of Lease must be 4 years from today");
    }

    return errors.length > 0 ? errors.join(" and ") : null;
  };

  // Handle expiry date change
  const handleExpiryDateChange = (value) => {
    handleChange("LeaseExpiryDate", value);

    if (formData.LeaseDate && value) {
      const validationError = validateLeaseExpiry(formData.LeaseDate, value);
      if (validationError) {
        setTimeout(() => {
          Swal.fire({
            icon: "warning",
            title: "Expiry of Lease Validation",
            html: `<div style="text-align: left;">
                            <p><strong>(i)</strong> ${validationError}</p>
                            <p style="margin-top: 10px;">Please select a valid expiry date.</p>
                        </div>`,
            confirmButtonText: "OK",
            confirmButtonColor: "#3085d6",
          });
        }, 100);
        setErrors((prev) => ({ ...prev, LeaseExpiryDate: validationError }));
      } else {
        setErrors((prev) => ({ ...prev, LeaseExpiryDate: "" }));
      }
    }
  };

  // File upload handlers
  const handleOwnershipDocChange = (fileData) => {
    setFormData((prev) => ({
      ...prev,
      Building712FilePath: fileData.filePath || fileData.uniqueFileName || "",
      Building712FileName: fileData.fileName || "",
    }));
    setErrors((prev) => ({ ...prev, Building712FilePath: "" }));
  };

  const handleLeaseDocChange = (fileData) => {
    setFormData((prev) => ({
      ...prev,
      LeaseFilePath: fileData.filePath || fileData.uniqueFileName || "",
      LeaseFileName: fileData.fileName || "",
    }));
    setErrors((prev) => ({ ...prev, LeaseFilePath: "" }));
  };

  const handleFloorPlanChange = (fileData) => {
    setFormData((prev) => ({
      ...prev,
      FloorPlanFilePath: fileData.filePath || fileData.uniqueFileName || "",
      FloorPlanFileName: fileData.fileName || "",
    }));
    setErrors((prev) => ({ ...prev, FloorPlanFilePath: "" }));
  };

  const handleBuildingPhotoChange = (fileData) => {
    setFormData((prev) => ({
      ...prev,
      BuildingPhotoPath: fileData.filePath || fileData.uniqueFileName || "",
      BuildingPhotoFileName: fileData.fileName || "",
    }));
    setErrors((prev) => ({ ...prev, BuildingPhotoPath: "" }));
  };

  const handleRoadPhotoChange = (fileData) => {
    setFormData((prev) => ({
      ...prev,
      RoadDocPath: fileData.filePath || fileData.uniqueFileName || "",
      RoadDocFileName: fileData.fileName || "",
    }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.BuildingNameTypeId)
      newErrors.buildingName = "Building Name is required";
    if (!formData.BuildingStatusId)
      newErrors.constructionStatus = "Construction Status is required";
    if (!formData.OwnerShipTypeid)
      newErrors.ownership = "Ownership is required";

    if (formData.OwnerShipType === "Rented") {
      if (!formData.LeaseDate)
        newErrors.LeaseDate = "Date of Lease is required";
      if (!formData.LeaseExpiryDate)
        newErrors.LeaseExpiryDate = "Expiry of Lease is required";
      if (!formData.LeaseFilePath)
        newErrors.LeaseFilePath = "Lease Document is required";

      const leaseValidation = validateLeaseExpiry(
        formData.LeaseDate,
        formData.LeaseExpiryDate,
      );
      if (leaseValidation) {
        newErrors.LeaseExpiryDate = leaseValidation;
      }
    }

    if (formData.OwnerShipType === "Owned") {
      if (!formData.Building712FilePath)
        newErrors.Building712FilePath = "Ownership Document is required";
    }

    if (!formData.IsDedicated) newErrors.isDedicated = "This field is required";

    //if (formData.IsDedicated === 'No' || formData.IsDedicated === '0' || formData.IsDedicated === 0) {
    //    if (!formData.BuildingOtherUsestatusId) newErrors.otherUsage = 'Other Usage is required';
    //    if (formData.BuildingOtherUsestatusId == 99 && !formData.BuildingOtherUsestatusText?.trim()) {
    //        newErrors.otherUsageSpecify = 'Please specify other usage';
    //    }
    //}

    if (
      formData.IsDedicated === "No" ||
      formData.IsDedicated === "0" ||
      formData.IsDedicated === 0
    ) {
      const otherUsageId =
        formData.BuildingOtherUsestatusId || formData.UsageTypeId;
      if (!otherUsageId || otherUsageId === "-1" || otherUsageId === -1) {
        newErrors.otherUsage = "Other Usage is required";
      }

      if (
        (formData.BuildingOtherUsestatusId == 99 ||
          formData.UsageTypeId == 99) &&
        !formData.BuildingOtherUsestatusText?.trim()
      ) {
        newErrors.otherUsageSpecify = "Please specify other usage";
      }
    }

    if (!formData.ConstructionType)
      newErrors.constructionType = "Construction Type is required";
    if (!formData.ConstructionYearId)
      newErrors.constructionYear = "Construction Year is required";
    if (formData.FloorId < 0) newErrors.floors = "Floors is required";

    if (!formData.GroundFloorArea || parseFloat(formData.GroundFloorArea) < 0) {
      newErrors.GroundFloorArea = "Area on Ground Floor is required";
    }

    if (
      formData.OtherFloorArea === "" ||
      parseFloat(formData.OtherFloorArea) < 0
    ) {
      newErrors.OtherFloorArea = "Area on Other Floor is required";
    }

    if (!formData.CelingHeight || parseFloat(formData.CelingHeight) <= 0) {
      newErrors.CelingHeight = "Average Height is required";
    }

    if (!formData.RoadWidth || parseFloat(formData.RoadWidth) <= 0) {
      newErrors.RoadWidth = "Approachable Road Front is required";
    }

    if (!formData.FloorPlanFilePath)
      newErrors.FloorPlanFilePath = "Floor Plan is required";
    if (!formData.BuildingPhotoPath)
      newErrors.BuildingPhotoPath = "Building Photo is required";
    if (!formData.RoadDocPath)
      newErrors.RoadDocPath = "Road Front Photo is required";

    if (!formData.Latitude || !formData.Longitude) {
      newErrors.LatitudeLongitude = "Latitude and Longitude are required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save building
  const handleSaveBuilding = async () => {
    if (!validateForm()) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Please fill all required fields correctly",
        confirmButtonColor: "#d33",
      });
      return;
    }

    try {
      startLoading();

      const payload = {
        instituteID: parseInt(instituteID) || 0,
        instituteCode: userLoginID || "",
        buildingID: parseInt(formData.BuildingID) || 0,
        buildingNameTypeId: parseInt(formData.BuildingNameTypeId) || 0,
        buildingNameType: formData.BuildingNameType || "",
        ownerShipTypeid: parseInt(formData.OwnerShipTypeid) || 0,
        ownerShipType: formData.OwnerShipType || "",
        buildingStatusId: parseInt(formData.BuildingStatusId) || 0,
        buildingStatus: formData.BuildingStatus || "",
        constructionTypeId: parseInt(formData.ConstructionTypeId) || 0,
        constructionType: formData.ConstructionType || "",
        usageTypeId: -1,
        usageType: formData.UsageType?.toString() || "",
        floorId: parseInt(formData.FloorId) || 0,
        floorName: formData.FloorName || "",
        constructionYearId: parseInt(formData.ConstructionYearId) || 0,
        constructionYear: formData.ConstructionYear?.toString() || "",
        roadWidth: parseFloat(formData.RoadWidth) || 0,
        groundFloorArea: parseFloat(formData.GroundFloorArea) || 0,
        otherFloorArea: parseFloat(formData.OtherFloorArea) || 0,
        totalFloorArea: parseFloat(formData.TotalFloorArea) || 0,
        celingHeight: parseFloat(formData.CelingHeight) || 0,
        leaseDate: formData.LeaseDate || "",
        leaseExpiryDate: formData.LeaseExpiryDate || "",
        building712FilePath: formData.Building712FilePath || "",
        leaseFilePath: formData.LeaseFilePath || "",
        floorPlanFilePath: formData.FloorPlanFilePath || "",
        googleMapPath: `${formData.Latitude},${formData.Longitude}`,
        roadDocPath: formData.RoadDocPath || "",
        buildingPhotoPath: formData.BuildingPhotoPath || "",
        latitude: parseFloat(formData.Latitude) || 0,
        longitude: parseFloat(formData.Longitude) || 0,

        buildingOtherUsestatusId:
          parseInt(formData.BuildingOtherUsestatusId) || -1,
        buildingOtherUsestatus: formData.BuildingOtherUsestatus || "",

        buildingOtherUsestatusText: formData.BuildingOtherUsestatusText || "",
        isBuildingReady:
          formData.IsBuildingReady === true ||
          formData.IsBuildingReady === 1 ||
          formData.IsBuildingReady === "1",
        isDedicated:
          formData.IsDedicated === "Yes" ||
          formData.IsDedicated === true ||
          formData.IsDedicated === 1 ||
          formData.IsDedicated === "1",
        hasApproachRoad:
          formData.HasApproachRoad === true ||
          formData.HasApproachRoad === 1 ||
          formData.HasApproachRoad === "1",
        isActive: true,
        userLoginID: userLoginID || "",
        ipAddress: ipAddress,
        pageCode: "BuildingDetails",
        isEditAllowed: true,
        isDeleteAllowed: true,
      };

      const response = await agent.post(SaveBuildingDetails, payload, {
        headers: {
          "Content-Type": "application/json-patch+json",
          accept: "text/plain",
        },
      });

      if (response.data?.Status === "Success") {
        await Swal.fire({
          icon: "success",
          title: "Success",
          text: editingBuildingId
            ? "Building updated successfully!"
            : "Building added successfully!",
          confirmButtonColor: "#3085d6",
        });

        //navigate("/Institute/LandDetails");

        setShowAddForm(false);
        resetForm();
        await fetchBuildingDetails();
        await fetchRequiredSpaceData();
        await fetchSpaceAnalysisData();
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text:
            "Error saving building: " +
            (response.data?.Message || "Unknown error"),
          confirmButtonColor: "#d33",
        });
      }
    } catch (error) {
      const apiMessage =
        error.response?.data?.Message || "Error saving building.";

      Swal.fire({
        icon: "error",
        title: "Error",
        text: apiMessage,
        confirmButtonColor: "#d33",
      });
    } finally {
      stopLoading();
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      BuildingID: 0,
      BuildingNameTypeId: "",
      BuildingNameType: "",
      OwnerShipTypeid: "",
      OwnerShipType: "",
      BuildingStatusId: "",
      BuildingStatus: "",
      ConstructionTypeId: "",
      ConstructionType: "",
      UsageTypeId: "",
      UsageType: "",
      FloorId: "",
      FloorName: "",
      ConstructionYearId: "",
      ConstructionYear: "",
      RoadWidth: "",
      GroundFloorArea: "",
      OtherFloorArea: "",
      TotalFloorArea: "",
      CelingHeight: "",
      LeaseDate: "",
      LeaseExpiryDate: "",
      Building712FilePath: "",
      Building712FileName: "",
      LeaseFilePath: "",
      LeaseFileName: "",
      FloorPlanFilePath: "",
      FloorPlanFileName: "",
      GoogleMapPath: "",
      RoadDocPath: "",
      RoadDocFileName: "",
      BuildingPhotoPath: "",
      BuildingPhotoFileName: "",
      BuildingOtherUsestatusId: "",
      BuildingOtherUsestatus: "",
      BuildingOtherUsestatusText: "",
      IsBuildingReady: false,
      IsDedicated: "",
      HasApproachRoad: false,
      Latitude: "",
      Longitude: "",
    });
    setLatLongInput("");
    setErrors({});
    setEditingBuildingId(null);
    setFieldsDisabled(false);
  };

  // View building
  const handleViewBuilding = (building) => {
    setSelectedBuilding(building);
    setShowViewModal(true);
  };

  useEffect(() => {
    if (showAddForm && editBuildingRef.current) {
      editBuildingRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [showAddForm]);

  // Edit building
  const handleEditBuilding = (building) => {
    setFormData({
      BuildingID: building.BuildingID,
      BuildingNameTypeId: building.BuildingNameTypeId,
      BuildingNameType: building.BuildingNameType,
      OwnerShipTypeid: building.OwnerShipTypeid,
      OwnerShipType: building.OwnerShipType,
      BuildingStatusId: building.BuildingStatusId,
      BuildingStatus: building.BuildingStatus,
      ConstructionTypeId: building.ConstructionTypeId,
      ConstructionType: building.ConstructionType,
      UsageTypeId: building.UsageTypeId || "",
      UsageType: building.UsageType || "",
      FloorId: building.FloorId,
      FloorName: building.FloorName,
      ConstructionYearId: building.ConstructionYearId,
      ConstructionYear: building.ConstructionYear,
      RoadWidth: building.RoadWidth,
      GroundFloorArea: building.GroundFloorArea,
      OtherFloorArea: building.OtherFloorArea,
      TotalFloorArea: building.TotalFloorArea,
      CelingHeight: building.CelingHeight,
      LeaseDate: building.LeaseDate,
      LeaseExpiryDate: building.LeaseExpiryDate,
      Building712FilePath: building.Building712FilePath,
      Building712FileName: "",
      LeaseFilePath: building.LeaseFilePath,
      LeaseFileName: "",
      FloorPlanFilePath: building.FloorPlanFilePath,
      FloorPlanFileName: "",
      GoogleMapPath: building.GoogleMapPath,
      RoadDocPath: building.RoadDocPath,
      RoadDocFileName: "",
      BuildingPhotoPath: building.BuildingPhotoPath,
      BuildingPhotoFileName: "",
      BuildingOtherUsestatusId: building.BuildingOtherUsestatusId,
      BuildingOtherUsestatus: building.BuildingOtherUsestatus,
      BuildingOtherUsestatusText: building.BuildingOtherUsestatusText,
      IsBuildingReady: building.IsBuildingReady,
      IsDedicated: building.IsDedicated ? "Yes" : "No",
      HasApproachRoad: building.HasApproachRoad,
      Latitude: building.Latitude || "",
      Longitude: building.Longitude || "",
    });

    const lat = building.Latitude || "";
    const lng = building.Longitude || "";
    setLatLongInput(lat && lng ? `${lat},${lng}` : "");

    setEditingBuildingId(building.BuildingID);
    setShowAddForm(true);
    //window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  // Delete building
  const handleDeleteBuilding = async (buildingId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      startLoading();
      const response = await agent.post(
        `${DeleteBuildingDetails}?InstituteID=${instituteID}&BuildingId=${buildingId}&UserLoginID=${userLoginID}&IPAddress=${ipAddress}`,
        {
          headers: {
            "Content-Type": "application/json-patch+json",
            accept: "text/plain",
          },
        },
      );

      if (response.data?.Status === "Success") {
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Building deleted successfully!",
          confirmButtonColor: "#3085d6",
        });
        await fetchBuildingDetails();
        await refreshAnalysisData();
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error deleting building: " + response.data?.Message,
          confirmButtonColor: "#d33",
        });
      }
    } catch (error) {
      console.error("Error deleting building:", error);

      const apiMessage =
        error?.response?.data?.Message ||
        "Error deleting building. Please try again.";

      Swal.fire({
        icon: "error",
        title: "Error",
        text: apiMessage,
        confirmButtonColor: "#d33",
      });
    } finally {
      stopLoading();
    }
  };

  // Open document in popup
  const openDocumentPopup = (documentUrl, itemName) => {
    if (!documentUrl) {
      Swal.fire({
        title: "No Document",
        text: "No document available to view.",
        icon: "info",
      });
      return;
    }

    const popupWidth = 900;
    const popupHeight = 700;
    const left = (window.screen.width - popupWidth) / 2;
    const top = (window.screen.height - popupHeight) / 2;

    const popup = window.open(
      "",
      `${itemName}_PDF_Viewer`,
      `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no,status=no`,
    );

    if (popup) {
      popup.document.write(`
                <html>
                    <head>
                        <title>${itemName} Document Viewer</title>
                        <style>
                            body { margin: 0; overflow: hidden; }
                            iframe { border: none; width: 100vw; height: 100vh; }
                        </style>
                    </head>
                    <body>
                        <iframe src="${documentUrl}" frameborder="0"></iframe>
                    </body>
                </html>
            `);
      popup.document.close();
      popup.focus();
    } else {
      Swal.fire({
        title: "Popup Blocked",
        text: "Please allow popups for this website to view the PDF.",
        icon: "error",
      });
    }
  };

  // Required Space Columns with proper configuration
  const requiredSpaceColumns = [
    {
      key: "sn",
      header: "S.N.",
     
      className: "text-center",
      width: "20px",
      sortable: false,
    },
    {
      key: "course",
      header: "Course",
   
      width: "350px",
      searchable: true,
      sortable: false,
    },
    {
      key: "InspectionUnits",
      header: "Inspection Units",
      
      className: "text-center",
      width: "80px",
      sortable: false,
    },
    {
      key: "MaxTraningSetupRequired",
      header: "Max Training Setup Required",
     
      className: "text-center",
      width: "120px",
      sortable: false,
    },
    {
      key: "perUnitNorm",
      header: "Per Unit Norm (Sq.M.)",
      
      className: "text-center",
      width: "100px",
      sortable: false,
    },
    {
      key: "floorPreference",
      header: "Floor Preference",
     
      className: "text-center",
      width: "130px",
      sortable: false,
    },
    {
      key: "areaGroundFloor",
      header: "Area on Ground Floor (Sq.M.)",
     
      className: "text-center font-semibold",
      width: "120px",
      sortable: false,
    },
    {
      key: "areaOtherFloor",
      header: "Area on other than Ground Floor (Sq.M.)",
     
      className: "text-center font-semibold",
      width: "150px",
      sortable: false,
    },
  ];

  // Available Space Columns with custom action button
  const availableSpaceColumns = [
    {
      key: "actions",
      header: (
        <button
          type="button"
          onClick={() => {
            setEditingBuildingId(null);
            resetForm();
            setShowAddForm(true);
          }}
          disabled={isLocked}
          className={`w-6 h-6 rounded flex items-center justify-center text-lg font-bold mx-auto
                ${
                  fieldsDisabled
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
          title="Add New Building"
        >
          +
        </button>
      ),
      
      className: "text-center",
      sortable: false,
      width: "120px",
    },

    {
      key: "BuildingNameType",
      header: "Building Name",
      
      className: "text-center",
      width: "150px",
      searchable: true,
      sortable: false,
    },
    {
      key: "OwnerShipType",
      header: "Ownership",
      
      className: "text-center",
      width: "140px",
      sortable: false,
    },
    {
      key: "FloorName",
      header: "Floors",
      
      className: "text-center",
      width: "110px",
      sortable: false,
    },
    {
      key: "GroundFloorArea",
      header: "Area on Ground Floor (Sq.M.)",
      
      className: "text-center",
      width: "180px",
      sortable: false,
    },
    {
      key: "OtherFloorArea",
      header: "Area on other than Ground Floor (Sq.M.)",
      
      className: "text-center",
      width: "220px",
      sortable: false,
    },
    {
      key: "TotalFloorArea",
      header: "Total Area (Sq.M.)",
     
      className: "text-center",
      width: "150px",
      sortable: false,
    },
    {
      key: "FloorPlanFilePath",
      header: "Floor Plan",
     
      className: "text-center",
      width: "120px",
      sortable: false,
    },
    {
      key: "BuildingPhotoPath",
      header: "Building Photo",
  
      className: "text-center",
      width: "130px",
      sortable: false,
    },
  ];

  // Format data for Available Space table
  const availableSpaceData = buildings.map((building, index) => ({
    ...building,
    id: building.BuildingID,
    srNo: index + 1,
  }));

  // Custom cell renderer for Available Space
  const renderAvailableSpaceCell = (row, column) => {
    if (column.key === "actions") {
      return (
        <div className="flex justify-center gap-3">
          <button
            onClick={() => handleViewBuilding(row)}
            className="text-blue-600 hover:text-blue-800 transition"
            title="View Building"
          >
            <FiEye size={20} />
          </button>

          <button
            onClick={() => handleEditBuilding(row)}
            className="text-green-600 hover:text-green-800 transition"
            title="Edit Building"
            disabled={!row.IsEditAllowed || isLocked}
          >
            <FiEdit size={20} />
          </button>

          <button
            onClick={() => handleDeleteBuilding(row.BuildingID)}
            className="text-red-600 hover:text-red-800 transition"
            title="Delete Building"
            disabled={!row.IsDeleteAllowed || isLocked} //&& isLocked
          >
            <FaTrash size={20} />
          </button>
        </div>
      );
    }

    if (
      column.key === "GroundFloorArea" ||
      column.key === "OtherFloorArea" ||
      column.key === "TotalFloorArea"
    ) {
      return row[column.key] ? parseFloat(row[column.key]).toFixed(2) : "0.00";
    }

    if (
      (column.key === "FloorPlanFilePath" && row.FloorPlanFilePath) ||
      (column.key === "BuildingPhotoPath" && row.BuildingPhotoPath)
    ) {
      const filePath =
        column.key === "FloorPlanFilePath"
          ? row.FloorPlanFilePath
          : row.BuildingPhotoPath;

      const itemName =
        column.key === "FloorPlanFilePath" ? "Floor Plan" : "Building Photo";

      return (
        <button
          onClick={() => openDocumentPopup(filePath, itemName)}
          className="inline-flex items-center"
          title={`View ${itemName}`}
        >
          <img
            src={pdflogo}
            alt="View PDF"
            className="w-12 h-8 object-contain cursor-pointer hover:opacity-80"
          />
        </button>
      );
    }

    return row[column.key] || "";
  };

  // Space Analysis Columns
  const spaceAnalysisColumns = [
    {
      key: "label",
      header: "",
      
      className: "font-semibold",
      width: "300px",
      sortable: false,
    },
    {
      key: "groundFloor",
      header: "Ground Floor (Sq.M.)",
      
      className: "text-center font-mono",
      width: "200px",
      sortable: false,
    },
    {
      key: "anyFloor",
      header: "Any Floor (Sq.M.)",
      
      className: "text-center font-mono",
      width: "200px",
      sortable: false,
    },
    {
      key: "total",
      header: "Total (Sq.M.)",
      
      className: "text-center font-mono",
      width: "200px",
      sortable: false,
    },
  ];

  // Determine if ground floor is sufficient
  const isGroundFloorSufficient =
    spaceAnalysisData.find((item) => item.label === "Space Availability")
      ?.groundFloor >= 0;

  // Custom footer renderer for Required Space table
  const renderRequiredSpaceFooter = () => (
    <tr className="bg-blue-100 font-bold">
      <td colSpan="6" className="border border-gray-300 p-2 text-right pr-4">
        Required Space:
      </td>
      <td className="border border-gray-300 p-2 text-center text-blue-700">
        {requiredSpaceTotals.totalGroundFloorArea}
      </td>
      <td className="border border-gray-300 p-2 text-center text-blue-700">
        {requiredSpaceTotals.totalOtherFloorArea}
      </td>
    </tr>
  );

  // Custom footer renderer for Available Space table
  const renderAvailableSpaceFooter = () => (
    <tr className="bg-green-100 font-bold">
      <td colSpan="4" className="border border-gray-300 p-2 text-right pr-4">
        Total:
      </td>
      <td className="border border-gray-300 p-2 text-center text-green-700">
        {availableSpaceTotals.totalGroundFloorArea}
      </td>
      <td className="border border-gray-300 p-2 text-center text-green-700">
        {availableSpaceTotals.totalOtherFloorArea}
      </td>
      <td className="border border-gray-300 p-2 text-center text-green-700">
        {availableSpaceTotals.totalArea}
      </td>
      <td colSpan="2" className="border border-gray-300 p-2"></td>
    </tr>
  );

  const handleSaveAndNext = async () => {
    if (userTypeID === 14 || userTypeID === 81) {
      const isvalid = inspectionref.current?.validate();

      if (!isvalid) {
        return;
      }

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
    }

    if (isLocked) {
      if (userTypeID === 14 || userTypeID === 81) {
        navigate(`/Institute/LandDetails?P1=${p1}&P2=${p2}`);
      } else {
        navigate("/Institute/LandDetails");
      }
      return;
    }

    try {
      if (userTypeID === 14 || userTypeID === 81) {
        const statusPayload = {
          InstituteID: instituteID,
          PageCode: "Building",
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
      }

      await Swal.fire({
        icon: "success",
        title: "Success",
        text: "Saved successfully",
        confirmButtonText: "OK",
      });

      if (userTypeID === 14 || userTypeID === 81) {
        navigate(`/Institute/LandDetails?P1=${p1}&P2=${p2}`);
      } else {
        navigate("/Institute/LandDetails");
      }
    } catch (err) {
      Swal.fire("Error", err.Message, "error");
    }
  };
    const handleSave = async () => {

        if (!showAddForm) {

            // For 14 / 81 → update verification status
            if (userTypeID === 14 || userTypeID === 81) {

                const statusUpdated = await handleSaveAndNext();

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

        if (userTypeID === 14 || userTypeID === 81) {
            await handleSaveAndNext();
        } else if (userTypeID === 64) {
            await handleSaveBuilding();
        } else {
            goNext();
        }
    };
    return (

        <InstituteFlowLayout
            currentPageCode="BuildingDetails"
            p1={p1}
            p2={p2}
            onSave={handleSave}
            isSaveLoading={isLoading}
            isLocked={isLocked}
            title="Building Details"
            color={color}
            showFlowActions={!showAddForm}

        >
    
      
     
        

        <div className="space-y-6">
          {/* Required Space as per Norms */}
          <fieldset className="border border-gray-300 rounded p-4 bg-gray-50">
            <legend className="text-base font-semibold text-gray-800 px-2">
              Required Space as per Norms
            </legend>

            <div className="mt-3">
              <FilteredTableComponent
                data={requiredSpaceData}
                columns={requiredSpaceColumns}
                filterColumns={["course"]}
                customButtons={[]}
                title=""
                exportFileName="Required_Space_as_per_Norms"
                tableId="required-space-table"
                searchable={true}
                sortable={true}
                showExcelTemplate={false}
                exportable={false}
                showSearch={false}
                showExcel={false}
                showPDF={false}
                showExport={false}
                maxHeight="500px"
                stickyHeader={true}
                readOnly={isLocked}
                customFooter={renderRequiredSpaceFooter()}
                emptyMessage="No course data available"
              />
            </div>
          </fieldset>

          {/* Available Space Section */}
          <fieldset className="border border-gray-300 rounded p-4 bg-gray-50">
            <legend className="text-base font-semibold text-gray-800 px-2">
              Available Space
            </legend>

            <div className="mt-3">
              <FilteredTableComponent
                data={availableSpaceData}
                columns={availableSpaceColumns}
                filterColumns={["BuildingNameType", "OwnerShipType"]}
                customButtons={[]}
                title=""
                exportFileName="Available_Space"
                tableId="available-space-table"
                searchable={false}
                sortable={true}
                showExcelTemplate={false}
                exportable={true}
                showSearch={true}
                showExport={false}
                showExcel={false}
                showPDF={false}
                maxHeight="500px"
                stickyHeader={true}
                readOnly={false}
                renderCell={renderAvailableSpaceCell}
                customFooter={renderAvailableSpaceFooter()}
                emptyMessage="No buildings added yet"
              />
            </div>
          </fieldset>

          {/* Building Space Norms Analysis */}
          <fieldset className="border border-gray-300 rounded p-4 bg-gray-50">
            <legend className="text-base font-semibold text-gray-800 px-2">
              Building Space Norms Analysis
            </legend>

            <FilteredTableComponent
              data={spaceAnalysisData}
              columns={spaceAnalysisColumns}
              filterColumns={[]}
              customButtons={[]}
              title=""
              exportFileName="Space_Analysis"
              tableId="space-analysis-table"
              searchable={false}
              sortable={false}
              showExcelTemplate={false}
              exportable={true}
              showSearch={false}
              showExport={false}
              className="mt-3"
              maxHeight="400px"
              stickyHeader={false}
              readOnly={true}
              rowClassName={(row) => row.rowClassName}
            />

            <div className="mt-4 rounded-md border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm text-blue-700">
                <span className="font-medium">Note:</span>
                <ol className="list-decimal list-inside mt-1 space-y-1">
                  <li>Negative Space Availability means shortage</li>
                  <li>Positive Space Availability means adequate/ excess</li>
                </ol>
              </p>
            </div>
            {spaceAnalysisRemark && (
              <div
                className={`mt-4 rounded-md border p-4 ${
                  isGroundFloorSufficient
                    ? "border-red-200 bg-red-50 text-red-700"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                <p className="text-sm">
                  <span className="font-medium">Remark:</span>
                  <span
                    className="ml-1"
                    style={{
                      whiteSpace: "pre-line",
                      display: "block",
                      marginTop: "2px",
                    }}
                  >
                    {spaceAnalysisRemark}
                  </span>
                </p>
              </div>
            )}

            {/*{userTypeID === 14 && (*/}
            {/*    <InspectionStatusComponent*/}
            {/*        instituteId={instituteID}*/}
            {/*        pageCode="BuildingDetails"*/}
            {/*        onChange={(data) => setInspectionStatus(data)}*/}
            {/*    />*/}
            {/*)}*/}
                    {(((userTypeID === 81 || isViewer) &&
              ["S"].includes(eligibilityData?.InspectionStatus)) ||
              ["V", "W"].includes(eligibilityData?.VerificationStatus)) && (
              <InspectionStatusComponent
                // ref={inspectionref}
                instituteId={instituteID}
                pageCode="BuildingDetails"
                // onChange={(data) => setInspectionStatus(data)}
                //readOnly={userTypeID !== 14}
                readOnly={
                  eligibilityData?.InspectionStatus === "S" && userTypeID === 81
                }
                TypeID="14"
                //userName="By DVETO"
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
                pageCode="BuildingDetails"
                onChange={(data) => setInspectionStatus(data)}
                //readOnly={userTypeID !== 14}
                //readOnly={eligibilityData?.InspectionStatus === 'S' && userTypeID === 14}
                readOnly={
                  (userTypeID === 14 &&
                    eligibilityData?.InspectionStatus === "S") ||
                  (userTypeID === 81 &&
                    eligibilityData?.VerificationStatus === "V")
                }
                TypeID={userTypeID}
                //userName={userTypeID === 14 ? "By Board" : userTypeID === 81 ? "By DVETO" : "By Institute"}
              />
            )}

                    {(userTypeID === 14  || isViewer )&&
              ["S", "WD"].includes(eligibilityData?.InspectionStatus) && (
                <InspectionStatusComponent
                  //ref={inspectionref}
                  instituteId={instituteID}
                  pageCode="BuildingDetails"
                  //onChange={(data) => setInspectionStatus(data)}
                  //readOnly={userTypeID !== 14}
                  readOnly={
                    eligibilityData?.InspectionStatus === "S" &&
                    userTypeID === 14
                  }
                  TypeID="81"
                  //userName="By Board"
                  mode="view"
                />
              )}

            {/* Main Action Buttons 
            {!showAddForm && (
              <div className="flex justify-center gap-8 mt-8 pt-12 border-t-2 border-gray-300">
                {userTypeID == 64 && (
                  <>
                    <button
                      type="button"
                      className="px-4 py-3 bg-cyan-500 text-white font-semibold rounded text-sm hover:bg-cyan-600 transition-colors"
                      onClick={() => navigate("/Institute/UnitsForInspection")}
                    >
                      Back
                    </button>

                    <button
                      type="button"
                      className="bg-[#28a745] hover:bg-[#218838] text-white px-4 py-2 rounded font-semibold text-sm transition-colors"
                      onClick={handleSaveAndNext}
                      disabled={isLoading}
                    >
                      {isLoading
                        ? "Saving..."
                        : isLocked
                          ? "Next"
                          : "Save and Next"}
                    </button>

                    <button
                      type="button"
                      className="px-4 py-3 bg-gray-600 text-white font-semibold rounded text-sm hover:bg-gray-700 transition-colors"
                      onClick={() => navigate("/tinstitute/dashboard")}
                    >
                      Close
                    </button>
                  </>
                )}

                {(userTypeID === 14 || userTypeID === 81) && (
                  <>
                    <button
                      type="button"
                      className="px-4 py-3 bg-cyan-500 text-white font-semibold rounded text-sm hover:bg-cyan-600 transition-colors"
                      onClick={() =>
                        navigate(
                          `/Institute/UnitsForInspection?P1=${p1}&P2=${p2}`,
                        )
                      }
                    >
                      Back
                    </button>

                    {isLocked ? (
                      <button
                        className="bg-green-600 px-6 py-2 text-white rounded"
                        onClick={() =>
                          navigate(`/Institute/LandDetails?P1=${p1}&P2=${p2}`)
                        }
                      >
                        Save and Next
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="bg-[#28a745] hover:bg-[#218838] text-white px-4 py-2 rounded font-semibold text-sm transition-colors"
                        onClick={handleSaveAndNext}
                        disabled={isLoading}
                      >
                        {isLoading ? "Saving..." : "Save and Next"}
                      </button>
                    )}

                    <button
                      type="button"
                      className="px-4 py-3 bg-gray-600 text-white font-semibold rounded text-sm hover:bg-gray-700 transition-colors"
                      onClick={() => {
                        if(userTypeID==14){
                            navigate(`/DVETO/InspectionReport?p1=${p2}&p2=${p1}`);
                        } else {
                            navigate(`/DVETO/InspectionReport?p1=${p2}&p2=${p1}`);
                        }
                    }}
                    >
                      Close
                    </button>
                  </>
                )}
              </div>
            )}  */}
          </fieldset>

          {/* Add Building Form */}
          {showAddForm && (
            <fieldset
              ref={editBuildingRef}
              className="border border-gray-300 rounded-lg p-6 bg-white shadow-lg"
            >
              <legend
                className={`flex items-center gap-2 rounded-md border border-gray-300 ${color} px-4 py-2 text-sm font-bold text-white shadow-md`}
              >
                {editingBuildingId ? "Edit Building" : "Add New Building"}
              </legend>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                {/* Building Name */}
                <DropdownComponent
                  label="Building Name"
                  name="buildingName"
                  options={formatOptions(dropdownOptions.buildingName)}
                  value={formData.BuildingNameTypeId?.toString()}
                  onChange={(value) =>
                    handleDropdownChange("buildingName", value)
                  }
                  error={errors.buildingName}
                  required={true}
                  loading={loading.buildingName}
                />

                {/* Construction Status */}
                <DropdownComponent
                  label="Construction Status"
                  name="constructionStatus"
                  options={formatOptions(dropdownOptions.constructionStatus)}
                  value={formData.BuildingStatusId?.toString()}
                  onChange={(value) =>
                    handleDropdownChange("constructionStatus", value)
                  }
                  error={errors.constructionStatus}
                  required={true}
                  loading={loading.constructionStatus}
                />

                {/* Ownership */}
                <DropdownComponent
                  label="Ownership"
                  name="ownership"
                  options={formatOptions(dropdownOptions.ownership)}
                  value={formData.OwnerShipTypeid?.toString()}
                  onChange={(value) => handleDropdownChange("ownership", value)}
                  error={errors.ownership}
                  required={true}
                  loading={loading.ownership}
                />

                {/* Lease Fields - Show if Rented */}
                {formData.OwnerShipType === "Rented" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Lease <span className="text-red-500">*</span>
                      </label>
                      <DateInput
                        value={formData.LeaseDate}
                        onChange={(val) => handleChange("LeaseDate", val)}
                        minDate={new Date(1900, 0, 1)}
                        maxDate={new Date()}
                      />
                      {errors.LeaseDate && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.LeaseDate}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expiry of Lease <span className="text-red-500">*</span>
                        <div className="group relative inline-block ml-1">
                          <FiInfo
                            className="text-blue-500 cursor-help inline"
                            size={16}
                          />
                          <div className="invisible group-hover:visible absolute z-50 w-80 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-2xl -top-2 left-6 border border-gray-700">
                            Expiry of Lease must be 5 years from Date of Lease
                            and 4 years from today
                          </div>
                        </div>
                      </label>
                      <DateInput
                        value={formData.LeaseExpiryDate}
                        onChange={handleExpiryDateChange}
                        minDate={
                          formData.LeaseDate
                            ? new Date(formData.LeaseDate)
                            : new Date()
                        }
                      />
                      {errors.LeaseExpiryDate && (
                        <p className="text-red-500 text-xs mt-1 font-medium">
                          {errors.LeaseExpiryDate}
                        </p>
                      )}
                    </div>

                    <div>
                      <UploadPdf
                        file={formData.LeaseFileName || ""}
                        onFileChange={handleLeaseDocChange}
                        buttonClassName="bg-[#00c3f9]"
                        buttonText="Upload"
                        label="Upload Lease Document"
                        showLabel={true}
                        allowedFileTypes="jpg, jpeg, png, pdf"
                        maxFileSize="6 MB"
                        required={true}
                        userTypeId={userTypeID}
                        userLoginID={userLoginID}
                        linkName="View Lease Document"
                        uniquefilepath={formData.LeaseFilePath || ""}
                        id="leaseDocUpload"
                        tooltip="The Lease Document must be registered document with respective Sub Registrar office."
                        tooltipPosition="right"
                      />
                      {errors.LeaseFilePath && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.LeaseFilePath}
                        </p>
                      )}
                    </div>
                  </>
                )}

                {/* Ownership Document - Show if Owned */}
                {formData.OwnerShipType === "Owned" && (
                  <div className="md:col-span-3">
                    <UploadPdf
                      file={formData.Building712FileName || ""}
                      onFileChange={handleOwnershipDocChange}
                      buttonClassName="bg-[#00c3f9]"
                      buttonText="Upload"
                      label="Upload Ownership Document (7/12 / Property Card / Other)"
                      showLabel={true}
                      allowedFileTypes="jpg, jpeg, png, pdf"
                      maxFileSize="6 MB"
                      required={true}
                      userTypeId={userTypeID}
                      userLoginID={userLoginID}
                      linkName="View Ownership Document"
                      uniquefilepath={formData.Building712FilePath || ""}
                      id="ownershipDocUpload"
                      tooltip="Upload ownership document as 7/12 / City Survey / Property Card / other relevant document to authenticate the ownership of the building. The Ownership should be in the name of Proposed Skill Development Institute or Promoting Organization only. If the ownership is in the name of any person, then it has to be leased out in the name of Proposed Skill Development Institute or Promoting Organization."
                      tooltipPosition="right"
                      width="w-80"
                    />
                    {errors.Building712FilePath && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.Building712FilePath}
                      </p>
                    )}
                  </div>
                )}

                {/* Whether Building is Dedicated */}
                <DropdownComponent
                  label="Whether Building is Dedicated for Proposed Institute"
                  name="isDedicated"
                  options={[
                    { value: "Yes", label: "Yes" },
                    { value: "No", label: "No" },
                  ]}
                  value={formData.IsDedicated}
                  onChange={(value) =>
                    handleDropdownChange("isDedicated", value)
                  }
                  error={errors.isDedicated}
                  required={true}
                />

                {/* Other Usage Fields - Show if Not Dedicated */}

                {(formData.IsDedicated === "No" ||
                  formData.IsDedicated === "0" ||
                  formData.IsDedicated === 0) && (
                  <>
                    <DropdownComponent
                      label="Other Usage of Shared Building"
                      name="otherUsage"
                      options={formatOptions(dropdownOptions.usageType)}
                      value={formData.UsageTypeId?.toString()}
                      //value={formData.BuildingOtherUsestatusId?.toString() || formData.UsageTypeId?.toString()}
                      onChange={(value) =>
                        handleDropdownChange("otherUsage", value)
                      }
                      error={errors.otherUsage}
                      required={true}
                      loading={loading.usageType}
                    />

                    {formData.BuildingOtherUsestatusId?.toString() === "99" && (
                      <FormComponent
                        label="If Other Usage, then Specify"
                        value={formData.BuildingOtherUsestatusText}
                        onChange={(value) =>
                          handleChange("BuildingOtherUsestatusText", value)
                        }
                        error={errors.otherUsageSpecify}
                        required={true}
                        extraClass="font-medium"
                      />
                    )}
                  </>
                )}

                {/* Construction Type */}
                <DropdownComponent
                  label="Construction Type"
                  name="constructionType"
                  options={formatOptions(dropdownOptions.constructionType)}
                  value={formData.ConstructionTypeId?.toString()}
                  onChange={(value) =>
                    handleDropdownChange("constructionType", value)
                  }
                  error={errors.constructionType}
                  required={true}
                  loading={loading.constructionType}
                />

                {/* Construction Year */}
                <DropdownComponent
                  label="Construction Year"
                  name="constructionYear"
                  options={formatOptions(dropdownOptions.constructionYear)}
                  value={formData.ConstructionYearId?.toString()}
                  onChange={(value) =>
                    handleDropdownChange("constructionYear", value)
                  }
                  error={errors.constructionYear}
                  required={true}
                  loading={loading.constructionYear}
                />

                {/* Floors */}
                <DropdownComponent
                  label="Floors"
                  name="floors"
                  options={formatOptions(dropdownOptions.floors)}
                  value={formData.FloorId?.toString()}
                  onChange={(value) => handleDropdownChange("floors", value)}
                  error={errors.floors}
                  required={true}
                  loading={loading.floors}
                />

                {/* Ground Floor Area */}
                <FormComponent
                  label="Area on Ground Floor (Sq.M.)"
                  value={formData.GroundFloorArea}
                  onChange={(value) => handleChange("GroundFloorArea", value)}
                  error={errors.GroundFloorArea}
                  required={true}
                  extraClass="font-medium"
                  type="number"
                  tooltip="Enter area available for the institute on ground floor in selected Building"
                  tooltipPosition="right"
                  autoUpperCase={false}
                />

                {/* Other Floor Area */}

                <FormComponent
                  label="Area other than Ground Floor (Sq.M.)"
                  value={formData.OtherFloorArea}
                  onChange={(value) => handleChange("OtherFloorArea", value)}
                  error={errors.OtherFloorArea}
                  required={true}
                  extraClass="font-medium"
                  type="number"
                  tooltip="Enter area available for the institute other than on ground floor in selected Building"
                  tooltipPosition="right"
                  autoUpperCase={false}
                />

                {/* Total Area (Auto-calculated) */}
                <FormComponent
                  label="Total Area for Institute (Sq.M.)"
                  value={formData.TotalFloorArea}
                  onChange={() => {}}
                  required={false}
                  extraClass="font-medium"
                  disabled={true}
                  autoUpperCase={false}
                />

                {/* Ceiling Height */}
                <FormComponent
                  label="Average Height between Ceiling and Flooring in Meters"
                  value={formData.CelingHeight}
                  onChange={(value) => handleChange("CelingHeight", value)}
                  error={errors.CelingHeight}
                  required={true}
                  extraClass="font-medium"
                  type="number"
                  autoUpperCase={false}
                />

                {/* Road Width */}
                <FormComponent
                  label="Approachable Road Front in Meter"
                  value={formData.RoadWidth}
                  onChange={(value) => handleChange("RoadWidth", value)}
                  error={errors.RoadWidth}
                  required={true}
                  extraClass="font-medium"
                  type="number"
                  autoUpperCase={false}
                />

                {/* File Uploads */}
                <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Floor Plan */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">
                        Upload Floor Plan{" "}
                        <span className="text-red-500">*</span>
                      </span>
                      <IconTooltip
                        message="Upload Floor Plan demarcating existing and proposed Courses/ Units and Common Facilities."
                        position="right"
                        width="w-64"
                      />
                      {errors.FloorPlanFilePath && (
                        <span className="text-red-500 text-md">
                          {errors.FloorPlanFilePath}
                        </span>
                      )}
                    </div>
                    <UploadPdf
                      file={formData.FloorPlanFileName || ""}
                      onFileChange={handleFloorPlanChange}
                      buttonClassName="bg-[#00c3f9]"
                      buttonText="Upload"
                      showLabel={false}
                      allowedFileTypes="jpg, jpeg, png, pdf"
                      maxFileSize="2 MB"
                      required={true}
                      userTypeId={userTypeID}
                      userLoginID={userLoginID}
                      linkName="View Floor Plan"
                      uniquefilepath={formData.FloorPlanFilePath || ""}
                      id="floorPlanUpload"
                    />
                  </div>

                  {/* Building Photo */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">
                        Upload Building Photo{" "}
                        <span className="text-red-500">*</span>
                      </span>
                      <IconTooltip
                        message="Photo should be front/ side facing covering entire building."
                        position="right"
                        width="w-64"
                      />
                      {errors.BuildingPhotoPath && (
                        <span className="text-red-500 text-md">
                          {errors.BuildingPhotoPath}
                        </span>
                      )}
                    </div>
                    <UploadPdf
                      file={formData.BuildingPhotoFileName || ""}
                      onFileChange={handleBuildingPhotoChange}
                      buttonClassName="bg-[#00c3f9]"
                      buttonText="Upload"
                      showLabel={false}
                      allowedFileTypes="jpg, jpeg, png, pdf"
                      maxFileSize="2 MB"
                      required={true}
                      userTypeId={userTypeID}
                      userLoginID={userLoginID}
                      linkName="View Building Photo"
                      uniquefilepath={formData.BuildingPhotoPath || ""}
                      id="buildingPhotoUpload"
                    />
                  </div>

                  {/* Road Photo */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">
                        Upload Photo of Road Front{" "}
                        <span className="text-red-500">*</span>
                      </span>
                      <IconTooltip
                        message="Upload photo of the approach road to the building.Both road and building should be seen in the photo."
                        position="right"
                        width="w-64"
                      />
                      {errors.RoadDocPath && (
                        <span className="text-red-500 text-md">
                          {errors.RoadDocPath}
                        </span>
                      )}
                    </div>

                    <UploadPdf
                      file={formData.RoadDocFileName || ""}
                      onFileChange={handleRoadPhotoChange}
                      buttonClassName="bg-[#00c3f9]"
                      buttonText="Upload"
                      showLabel={false}
                      allowedFileTypes="jpg, jpeg, png, pdf"
                      maxFileSize="2 MB"
                      required={true}
                      userTypeId={userTypeID}
                      userLoginID={userLoginID}
                      linkName="View Road Photo"
                      uniquefilepath={formData.RoadDocPath || ""}
                      id="roadPhotoUpload"
                    />
                  </div>
                </div>

                {/* Latitude Longitude Section */}
                <div className="md:col-span-3">
                  <div className="grid grid-cols-12 gap-4 mb-4">
                    <div className="col-span-12 md:col-span-5">
                      <div className="h-[360px] flex flex-col gap-3">
                        <FormComponent
                          label="Latitude, Longitude"
                          name="LatitudeLongitude"
                          value={latLongInput?.toString()}
                          onChange={(value) => {
                            const cleanedValue = value.replace(
                              /[^0-9.,-]/g,
                              "",
                            );
                            setLatLongInput(cleanedValue);

                            const [lat, lng] = cleanedValue.split(",");
                            setFormData((prev) => ({
                              ...prev,
                              Latitude: parseFloat(lat?.trim()) || null,
                              Longitude: parseFloat(lng?.trim()) || null,
                            }));

                            setErrors((prev) => ({
                              ...prev,
                              LatitudeLongitude: "",
                            }));
                          }}
                          required
                          error={errors.LatitudeLongitude}
                          disabled={fieldsDisabled}
                          autoUpperCase={false}
                        />

                        <div className="flex-1 bg-gray-50 border border-gray-300 rounded p-3 text-xs overflow-y-auto">
                          <h4 className="font-semibold mb-2 sticky top-0 bg-gray-50">
                            Instructions
                          </h4>
                          <ul className="list-disc ml-5 space-y-2">
                            <li>
                              <a
                                href="https://www.google.com/maps"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 underline"
                              >
                                Click Here
                              </a>{" "}
                              to open Google Maps
                            </li>
                            <li>
                              Click on Google Map to precisely locate your
                              institute and then right click
                            </li>
                            <li>Click Latitude, Longitude shown on map</li>
                            <li>Paste the copied value</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="col-span-12 md:col-span-7">
                      <div className="h-[360px] border border-gray-300 rounded overflow-hidden bg-white">
                        {formData.Latitude && formData.Longitude ? (
                          <iframe
                            title="Google Map"
                            className="w-full h-full"
                            frameBorder="0"
                            src={`https://www.google.com/maps?q=${formData.Latitude},${formData.Longitude}&z=15&output=embed`}
                            allowFullScreen
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                            Map will appear here after entering Latitude &
                            Longitude
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex justify-center gap-4 mt-8 pt-6 border-t-2 border-blue-300">
                <button
                  type="button"
                  onClick={handleSaveBuilding}
                  className="bg-[#28a745] hover:bg-[#218838] text-white px-6 py-2 rounded font-semibold text-sm transition-colors"
                  disabled={isLoading}
                >
                  {editingBuildingId ? "Update Building" : "Add Building"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    resetForm();
                  }}
                  className="px-8 py-3 bg-red-600 text-white font-semibold rounded text-sm hover:bg-red-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </fieldset>
          )}
        </div>
      

      {/* View Building Modal */}
      {showViewModal && selectedBuilding && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-blue-900 text-white p-4 flex justify-between items-center z-10">
              <h2 className="text-2xl font-bold">View Building Details</h2>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedBuilding(null);
                }}
                className="text-white hover:text-red-300 transition bg-red-600 rounded-full p-1"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="font-semibold text-gray-800">
                    Name Of Building:
                  </p>
                  <p className="text-gray-600">
                    {selectedBuilding.BuildingNameType}
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">
                    Construction Status:
                  </p>
                  <p className="text-gray-600">
                    {selectedBuilding.BuildingStatus}
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">
                    Building Ownership:
                  </p>
                  <p className="text-gray-600">
                    {selectedBuilding.OwnerShipType}
                  </p>
                </div>

                {selectedBuilding.OwnerShipType === "Owned" &&
                  selectedBuilding.Building712FilePath && (
                    <div>
                      <button
                        onClick={() =>
                          openDocumentPopup(
                            selectedBuilding.Building712FilePath,
                            "Ownership Document",
                          )
                        }
                        className="text-blue-600 hover:underline cursor-pointer"
                      >
                        View 7/12 document / Property Card / Other relevant
                        document
                      </button>
                    </div>
                  )}

                {selectedBuilding.OwnerShipType === "Rented" && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <p className="font-semibold text-gray-800">
                          Date of Lease
                        </p>
                        <p className="text-gray-600">
                          {selectedBuilding.LeaseDate}
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">
                          Expiry of Lease
                        </p>
                        <p className="text-gray-600">
                          {selectedBuilding.LeaseExpiryDate}
                        </p>
                      </div>
                    </div>
                    {selectedBuilding.LeaseFilePath && (
                      <div>
                        <button
                          onClick={() =>
                            openDocumentPopup(
                              selectedBuilding.LeaseFilePath,
                              "Lease Document",
                            )
                          }
                          className="text-blue-600 hover:underline cursor-pointer"
                        >
                          View Lease Document
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="font-semibold text-gray-800">
                    Type of Construction:
                  </p>
                  <p className="text-gray-600">
                    {selectedBuilding.ConstructionType}
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">
                    Number of Floors:
                  </p>
                  <p className="text-gray-600">{selectedBuilding.FloorName}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold text-gray-800">
                    Year of Construction:
                  </p>
                  <p className="text-gray-600">
                    {selectedBuilding.ConstructionYear}
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">
                    Ceiling Height (m):
                  </p>
                  <p className="text-gray-600">
                    {selectedBuilding.CelingHeight}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="font-semibold text-gray-800">
                    Ground Floor Area (Sq.M.):
                  </p>
                  <p className="text-gray-600">
                    {parseFloat(selectedBuilding.GroundFloorArea).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">
                    Other Floor Area (Sq.M.):
                  </p>
                  <p className="text-gray-600">
                    {parseFloat(selectedBuilding.OtherFloorArea).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold text-gray-800">
                    Total Area (Sq.M.):
                  </p>
                  <p className="text-gray-600">
                    {parseFloat(selectedBuilding.TotalFloorArea).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Road Width (m):</p>
                  <p className="text-gray-600">{selectedBuilding.RoadWidth}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                {selectedBuilding.FloorPlanFilePath && (
                  <div>
                    <button
                      onClick={() =>
                        openDocumentPopup(
                          selectedBuilding.FloorPlanFilePath,
                          "Floor Plan",
                        )
                      }
                      className="text-blue-600 hover:underline cursor-pointer"
                    >
                      View Floor Plan
                    </button>
                  </div>
                )}
                {selectedBuilding.BuildingPhotoPath && (
                  <div>
                    <button
                      onClick={() =>
                        openDocumentPopup(
                          selectedBuilding.BuildingPhotoPath,
                          "Building Photo",
                        )
                      }
                      className="text-blue-600 hover:underline cursor-pointer"
                    >
                      View Building Photo
                    </button>
                  </div>
                )}
                {selectedBuilding.RoadDocPath && (
                  <div>
                    <button
                      onClick={() =>
                        openDocumentPopup(
                          selectedBuilding.RoadDocPath,
                          "Road Photo",
                        )
                      }
                      className="text-blue-600 hover:underline cursor-pointer"
                    >
                      View Road Photo
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
           
        </InstituteFlowLayout>
  );
};

export default BuildingDetails;
