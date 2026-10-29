import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import agent from "../../../lib/api/agent";
import Swal from "sweetalert2";
import { ThemeContext } from "../../Context/ThemeContext";
import { useLoading } from "../../../Hooks/useLoading";
import { getIp } from "../../../Endpoints_All/Utils/fileUpload";
import {
  GetRequiredLandDetails,
  GetLandDetails,
  SaveLandDetails,
} from "../../../Endpoints_All/NewInstituteApprovalProcess/NewInstituteApprovalProcess";
import { GetInstituteIDByInstituteCode } from "../../../Endpoints_All/Base/Institute";
import { GetMasterTableList } from "../../../Endpoints_All/Base/masterData";
import FilteredTableComponent from "../../formcomponent/FilteredTableComponent";
import FormComponent from "../../formcomponent/FormComponent";
import DropdownComponent from "../../formcomponent/DropdownComponent";
import UploadPdf from "../../formcomponent/UploadPdf";
import { DateInput } from "../../formcomponent/DateInputComponent";
import { FiInfo, FiEye, FiEdit, FiX } from "react-icons/fi";

import { UpdateInstituteInspectionVerificationStatus } from "../../../Endpoints_All/Base/DVETO";
import InspectionStatusComponent from "../../formcomponent/InspectionStatusComponent";
import { useInspectionLock } from "../../../Hooks/useInspectionLock";
import DocumentLink from "../../formcomponent/OpenDocumentComponent";
import { useAuth } from "../../../Hooks/AuthContext";

import InstituteFlowLayout from "../../../Component/InstituteFlow/InstituteFlowLayout";
import { usePagePermission } from "../../../Hooks/usePagePermission";
import { useInstituteFlow } from "../../../Hooks/useInstituteFlow";

const LandDetails = () => {
  const { color } = useContext(ThemeContext);
  const { startLoading, stopLoading, isLoading } = useLoading();
  const formRef = useRef(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const p1 = searchParams.get("P1");
  const p2 = searchParams.get("P2");
  const [ipAddress, setIpAddress] = useState("");
  const [instituteID, setInstituteID] = useState(null);
  const [requiredLandData, setRequiredLandData] = useState([]);
  const [availableLandData, setAvailableLandData] = useState([]);
  const [ownershipOptions, setOwnershipOptions] = useState([]);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [currentEditLand, setCurrentEditLand] = useState(null);
  const [viewData, setViewData] = useState(null);
  const [inspectionStatus, setInspectionStatus] = useState({
    status: "",
    remark: "",
  });
  const [formData, setFormData] = useState({
    LandID: 0,
    LandType: "",
    LandTypeCode: "",
    AvailableLandArea: "",
    RequiredLandArea: 0,
    Variation: 0,
    OwnerShipTypeid: -1,
    LeaseDate: "",
    LeaseExpiryDate: "",
    Land712FilePath: "",
    LeaseFilePath: "",
    DistanceToInstitute: "",
    LandPhotoPath: "",
    Latitude: "",
    Longitude: "",
    IsActive: true,
  });

  const [errors, setErrors] = useState({});
  const [latLongInput, setLatLongInput] = useState("");
  const { userInfo } = useAuth();
  const loginID = userInfo?.UserLoginID;
  const userTypeID = userInfo?.UserTypeID;
    const instituteCode = loginID;


    const { goNext, goBack, handleClose } = useInstituteFlow(
        "Land",
        p1,
        p2
    );

    const {
        // userTypeID,
        isViewer,
        canEdit,
        canSave,
    } = usePagePermission();

  //  lock
  const { isLocked, eligibilityData } = useInspectionLock(
    instituteID,
    loginID,
    "Land",
  );
  const inspectionref = useRef();

  useEffect(() => {
  window.scrollTo(0, 0);
}, []);

  useEffect(() => {
    fetchIP();
    fetchInstituteID();
  }, []);

  useEffect(() => {
    if (instituteID) {
      fetchRequiredLandDetails();
      fetchAvailableLandDetails();
      fetchOwnershipOptions();
    }
  }, [instituteID]);

  useEffect(() => {
    if (showEditForm && formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [showEditForm]);

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

  const fetchInstituteID = async () => {
    try {
      // DVETO / Admin
      if (userTypeID === 14 || (userTypeID === 81 && p1) || (userTypeID === 501 && p2)) {
        setInstituteID(p1);
        return;
      }
      startLoading();
      const response = await agent.get(GetInstituteIDByInstituteCode, {
        params: { InstituteCode: instituteCode },
      });
      if (response.data.Status === "Success") {
        setInstituteID(response.data.Data);
      }
    } catch (error) {
      console.error("Error fetching Institute ID:", error);
      Swal.fire("Error", "Failed to fetch Institute ID", "error");
    } finally {
      stopLoading();
    }
  };

  const fetchRequiredLandDetails = async () => {
    try {
      startLoading();
      const response = await agent.get(GetRequiredLandDetails, {
        params: {
          InstituteID: instituteID,
          userLoginId: loginID,
        },
      });

      if (response.data.Status === "Success") {
        const data = response.data.Data;
        setRequiredLandData(data);
      }
    } catch (error) {
      console.error("Error fetching required land details:", error);
      Swal.fire("Error", "Failed to fetch required land details", "error");
    } finally {
      stopLoading();
    }
  };

  const fetchAvailableLandDetails = async () => {
    try {
      startLoading();
      const response = await agent.get(GetLandDetails, {
        params: { InstituteID: instituteID },
      });

      if (response.data.Status === "Success") {
        setAvailableLandData(response.data.Data);
      }
    } catch (error) {
      console.error("Error fetching available land details:", error);
      Swal.fire("Error", "Failed to fetch available land details", "error");
    } finally {
      stopLoading();
    }
  };

  const fetchOwnershipOptions = async () => {
    try {
      const response = await agent.get(GetMasterTableList, {
        params: {
          TableName: "Master_LandOwnershipType",
          DataValueField: "OwnerShipTypeid",
          DataTextField: "OwnerShipType",
          HasSelect: true,
          orderByText: "OwnerShipType",
        },
      });

      if (response.data.Status === "Success") {
        setOwnershipOptions(response.data.Data);
      }
    } catch (error) {
      console.error("Error fetching ownership options:", error);
    }
  };

  // Calculate Required Land Table
  const calculateRequiredLandTableData = () => {
    if (!requiredLandData || requiredLandData.length === 0) {
      return { tableData: [], maxAL: 0, maxOG: 0 };
    }

    const tableData = requiredLandData.map((item, index) => ({
      sn: index + 1,
      course: item.ModelCurriculum ? (
        <DocumentLink
          documentUrl={item.ModelCurriculum}
          itemName={item.CourseCode_Course || "Course"}
          label={item.CourseCode_Course || ""}
        />
      ) : (
        item.CourseCode_Course || ""
      ),

      //item.CourseCode_Course || '',
      inspectionUnits: item.InspectionUnits || 0,
      agricultureLand: (item.AgricultureLandArea || 0).toFixed(2),
      openGround: (item.OpenGroundArea || 0).toFixed(2),
    }));

    const maxAL = Math.max(
      ...requiredLandData.map((item) => item.AgricultureLandArea || 0),
      0,
    );
    const maxOG = Math.max(
      ...requiredLandData.map((item) => item.OpenGroundArea || 0),
      0,
    );

    tableData.push({
      sn: "",
      course: "Total",
      inspectionUnits: "",
      agricultureLand: maxAL.toFixed(2),
      openGround: maxOG.toFixed(2),
      rowClassName: "bg-gray-100 font-bold",
    });

    return { tableData, maxAL, maxOG };
  };

  const {
    tableData: requiredLandTableData,
    maxAL,
    maxOG,
  } = calculateRequiredLandTableData();

  const requiredLandColumns = [
    {
      key: "sn",
      header: "S.N.",
     
      className: "text-center",
      width: "20px",
    },
    {
      key: "course",
      header: "Course",
    
      className: "text-left",
      width: "600px",
    },
    {
      key: "inspectionUnits",
      header: "Inspection Units",
     
      className: "text-center",
      width: "100px",
    },
    {
      key: "agricultureLand",
      header: "Agriculture Land (Sq.M)",
     
      className: "text-center font-mono",
      width: "100px",
    },
    {
      key: "openGround",
      header: "Open Ground (Sq.M.)",
      
      className: "text-center font-mono",
      width: "100px",
    },
  ];

  // Available Land Table Data
  const calculateAvailableLandTableData = () => {
    const tableData = [];

    // Agriculture Land
    const agriLandFromAPI = availableLandData.find(
      (item) => item.LandTypeCode === "A",
    );
    const availableAL = agriLandFromAPI?.AvailableLandArea || 0;
    const requiredAL = agriLandFromAPI?.RequiredLandArea || 0;
    const variationAL = agriLandFromAPI?.Variation || 0;

    tableData.push({
      sn: 1,
      landType: "Agriculture Land",
      available: availableAL.toFixed(2),
      required: requiredAL.toFixed(2),
      variation: variationAL.toFixed(2),
      ownership: agriLandFromAPI?.OwnerShipType || "",
      landData: agriLandFromAPI,
      hasData: agriLandFromAPI && availableAL > 0,
      landID: agriLandFromAPI?.LandID || 19,
      landTypeName: "Agriculture Land",
      landTypeCode: "A",
      requiredLand: requiredAL,
      availableLand: availableAL,
      variationValue: variationAL,
    });

    // Open Ground
    const openGroundFromAPI = availableLandData.find(
      (item) => item.LandTypeCode === "O",
    );
    const availableOG = openGroundFromAPI?.AvailableLandArea || 0;
    const requiredOG = openGroundFromAPI?.RequiredLandArea || 0;
    const variationOG = openGroundFromAPI?.Variation || 0;

    tableData.push({
      sn: 2,
      landType: "Open Ground",
      available: availableOG.toFixed(2),
      required: requiredOG.toFixed(2),
      variation: variationOG.toFixed(2),
      ownership: openGroundFromAPI?.OwnerShipType || "",
      landData: openGroundFromAPI,
      hasData: openGroundFromAPI && availableOG > 0,
      landID: openGroundFromAPI?.LandID || 20,
      landTypeName: "Open Ground",
      landTypeCode: "O",
      requiredLand: requiredOG,
      availableLand: availableOG,
      variationValue: variationOG,
    });

    return { tableData, variationAL, variationOG };
  };

  const {
    tableData: availableLandTableData,
    variationAL,
    variationOG,
  } = calculateAvailableLandTableData();

  // Available Land Columns for FilteredTableComponent
  const availableLandColumns = [
    {
      key: "sn",
      header: "S.N.",
     
      className: "text-center",
      width: "80px",
    },
    {
      key: "landType",
      header: "Land Type",
     
      className: "text-left font-semibold",
      width: "200px",
    },
    {
      key: "available",
      header: "Available (Sq.M.)",
     
      className: "text-center font-mono",
      width: "150px",
    },
    {
      key: "required",
      header: "Required (Sq.M.)",
      
      className: "text-center font-mono",
      width: "150px",
    },
    {
      key: "variation",
      header: "Variation (Sq.M.)",
      
      className: "text-center font-mono",
      width: "150px",
    },
    {
      key: "ownership",
      header: "Ownership",
     
      className: "text-center",
      width: "150px",
    },
    {
      key: "actions",
      header: "Action",
      
      className: "text-center",
      width: "120px",
    },
  ];
  // To HIDE Action buttons conditionally
  const shouldShowActions = (row) => {
    const available = Number(row.available ?? 0);
    const required = Number(row.required ?? 0);
    const variation = Number(row.variation ?? 0);

    return available >= 0 && required > 0; //&& variation > 0;
  };

  // Render Cell Function for Available Land Table
  const renderAvailableLandCell = (row, column) => {
    // Handle Actions Column

    if (column.key === "actions") {
      if (!shouldShowActions(row)) {
        return null; // or <span>-</span>
      }
      return (
        <div className="flex justify-center gap-3">
          <button
            onClick={() => handleView(row)}
            className="text-blue-600 hover:text-blue-800 transition-colors"
            title="View"
            disabled={!row.hasData}
          >
            <FiEye size={20} />
          </button>
          <button
            onClick={() => handleEdit(row)}
            className="text-green-600 hover:text-green-800 transition-colors"
            title={row.hasData ? "Edit" : "Add"}
            disabled={isLocked}
          >
            <FiEdit size={20} />
          </button>
        </div>
      );
    }

    // Handle Numeric Columns with 2 decimal places
    if (
      column.key === "available" ||
      column.key === "required" ||
      column.key === "variation"
    ) {
      return row[column.key] ? parseFloat(row[column.key]).toFixed(2) : "0.00";
    }

    // Default: return the cell value
    return row[column.key] || "";
  };

  // Generate Remark
  const generateRemark = () => {
    const agriLand = availableLandData.find(
      (item) => item.LandTypeCode === "A",
    );
    const openGround = availableLandData.find(
      (item) => item.LandTypeCode === "O",
    );

    const agriVariation = agriLand?.Variation || 0;
    const ogVariation = openGround?.Variation || 0;
    const agriRequired = agriLand?.RequiredLandArea || 0;
    const ogRequired = openGround?.RequiredLandArea || 0;

    //if (agriRequired === 0 && ogRequired === 0) {
    //    return 'No land requirements defined';
    //}

    //if (agriRequired > 0 && ogRequired === 0) {
    //    if (agriVariation < 0) {
    //        return 'Available Agriculture Land is less than required Agriculture Land';
    //    }
    //    return 'Available Agriculture Land is as per Required Norms';
    //}

    //if (agriRequired === 0 && ogRequired > 0) {
    //    if (ogVariation < 0) {
    //        return 'Available Open Ground is less than required Open Ground';
    //    }
    //    return 'Available Open Ground is as per Required Norms';
    //}

    if (agriVariation < 0 && ogVariation < 0) {
      return "Available Agriculture Land and Open Ground are less than required";
    } else if (agriVariation < 0) {
      return "Available Agriculture Land is less than required Agriculture Land";
    } else if (ogVariation < 0) {
      return "Available Open Ground is less than required Open Ground";
    } else {
      return "Available Agriculture Land and Open Ground are as per Required Norms";
    }
  };

  const handleEdit = (row) => {
    const { landData, landTypeName, requiredLand, landID, landTypeCode } = row;

    if (landData && landData.AvailableLandArea > 0) {
      setFormData({
        LandID: landData.LandID,
        LandType: landData.LandType,
        LandTypeCode: landData.LandTypeCode,
        AvailableLandArea: landData.AvailableLandArea.toString(),
        RequiredLandArea: landData.RequiredLandArea,
        Variation: landData.Variation,
        OwnerShipTypeid: landData.OwnerShipTypeid || -1,
        LeaseDate: landData.LeaseDate || "",
        LeaseExpiryDate: landData.LeaseExpiryDate || "",
        Land712FilePath: landData.Land712FilePath || "",
        LeaseFilePath: landData.LeaseFilePath || "",
        DistanceToInstitute: landData.DistanceToInstitute.toString(),
        LandPhotoPath: landData.LandPhotoPath || "",
        Latitude: landData.Latitude || "",
        Longitude: landData.Longitude || "",
        IsActive: true,
      });

      setLatLongInput(`${landData.Latitude || ""},${landData.Longitude || ""}`);
    } else {
      setFormData({
        LandID: landID,
        LandType: landTypeName,
        LandTypeCode: landTypeCode,
        AvailableLandArea: "",
        RequiredLandArea: requiredLand,
        Variation: (-requiredLand).toFixed(2),
        OwnerShipTypeid: -1,
        LeaseDate: "",
        LeaseExpiryDate: "",
        Land712FilePath: "",
        LeaseFilePath: "",
        DistanceToInstitute: "",
        LandPhotoPath: "",
        Latitude: "",
        Longitude: "",
        IsActive: true,
      });

      setLatLongInput("");
    }

    setCurrentEditLand(landTypeName);
    setErrors({});
    setShowEditForm(true);
  };

  const handleView = (row) => {
    if (row.landData && row.landData.AvailableLandArea > 0) {
      setViewData(row.landData);
      setShowViewModal(true);
    }
  };

  const handleCancelEdit = () => {
    setShowEditForm(false);
    setCurrentEditLand(null);
    setFormData({
      LandID: 0,
      LandType: "",
      LandTypeCode: "",
      AvailableLandArea: "",
      RequiredLandArea: 0,
      Variation: 0,
      OwnerShipTypeid: -1,
      LeaseDate: "",
      LeaseExpiryDate: "",
      Land712FilePath: "",
      LeaseFilePath: "",
      DistanceToInstitute: "",
      LandPhotoPath: "",
      Latitude: "",
      Longitude: "",
      IsActive: true,
    });
    setErrors({});
    setLatLongInput("");
  };

  const handleChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      if (field === "AvailableLandArea") {
        const available = parseFloat(value) || 0;
        const required = parseFloat(updated.RequiredLandArea) || 0;
        updated.Variation = (available - required).toFixed(2);
      }

      return updated;
    });

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };
  const parseDate = (dateString) => {
    const [day, month, year] = dateString.split("/");
    return new Date(year, month - 1, day);
  };

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

    if (expiry < fiveYearsFromLease) {
      errors.push("Expiry of Agreement must be 5 years from Date of Agreement");
    }

    if (expiry < fourYearsFromToday) {
      errors.push("Expiry of Agreement must be 4 years from today");
    }

    return errors.length > 0 ? errors.join(" and ") : null;
  };
  const handleExpiryDateChange = (value) => {
    handleChange("LeaseExpiryDate", value);

    if (formData.LeaseDate && value) {
      const validationError = validateLeaseExpiry(formData.LeaseDate, value);
      if (validationError) {
        setTimeout(() => {
          Swal.fire({
            icon: "warning",
            title: "Expiry of Agreement Validation",
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

  const handleDropdownChange = (name, value) => {
    setFormData((prev) => ({ ...prev, OwnerShipTypeid: parseInt(value) }));

    if (errors.OwnerShipTypeid) {
      setErrors((prev) => ({ ...prev, OwnerShipTypeid: "" }));
    }
  };

  const handleFileChange = (field) => (fileData) => {
    let filePath = "";

    if (typeof fileData === "string") {
      filePath = fileData;
    } else if (fileData && typeof fileData === "object") {
      filePath = fileData.filePath || fileData.azureUrl || "";
    }

    setFormData((prev) => ({ ...prev, [field]: filePath }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const isAgriLand =
      formData.LandTypeCode === "A" ||
      currentEditLand?.toLowerCase().includes("agri");

    if (
      !formData.AvailableLandArea ||
      parseFloat(formData.AvailableLandArea) < 0
    ) {
      newErrors.AvailableLandArea = `Available ${currentEditLand} is required`;
    }

    if (isAgriLand) {
      if (!formData.OwnerShipTypeid || formData.OwnerShipTypeid === -1) {
        newErrors.OwnerShipTypeid = "Ownership is required";
      } else if (formData.OwnerShipTypeid === 2) {
        if (!formData.LeaseDate) {
          newErrors.LeaseDate = "Date of Agreement is required";
        }
        if (!formData.LeaseExpiryDate) {
          newErrors.LeaseExpiryDate = "Expiry of Agreement is required";
        }

        // Validate expiry date only if both dates are provided
        if (formData.LeaseDate && formData.LeaseExpiryDate) {
          const leaseDate = new Date(formData.LeaseDate);
          const expiryDate = new Date(formData.LeaseExpiryDate);
          const today = new Date();

          // Set time to midnight for accurate day comparison
          leaseDate.setHours(0, 0, 0, 0);
          expiryDate.setHours(0, 0, 0, 0);
          today.setHours(0, 0, 0, 0);

          // Calculate years difference
          const yearsDiffFromLease =
            (expiryDate - leaseDate) / (365.25 * 24 * 60 * 60 * 1000);
          const yearsDiffFromToday =
            (expiryDate - today) / (365.25 * 24 * 60 * 60 * 1000);

          // Check if expiry date is before lease date
          if (expiryDate <= leaseDate) {
            newErrors.LeaseExpiryDate =
              "Expiry date must be after Date of Agreement";
            Swal.fire({
              icon: "error",
              title: "Invalid Date",
              text: "Expiry of Agreement must be after Date of Agreement",
              confirmButtonColor: "#3085d6",
            });
          }
          // Check if expiry date is less than 5 years from lease date
          else if (yearsDiffFromLease < 5) {
            newErrors.LeaseExpiryDate =
              "Expiry must be minimum 5 years from Date of Agreement";
            Swal.fire({
              icon: "warning",
              title: "Invalid Agreement Period",
              text: "Expiry of Agreement must be minimum 5 years from Date of Agreement",
              confirmButtonColor: "#3085d6",
            });
          }
          // Check if expiry date is less than 4 years from today
          else if (yearsDiffFromToday < 4) {
            newErrors.LeaseExpiryDate =
              "Expiry must be minimum 4 years from today";
            Swal.fire({
              icon: "warning",
              title: "Insufficient Validity Period",
              text: "Expiry of Agreement must be minimum 4 years from today",
              confirmButtonColor: "#3085d6",
            });
          }
        }

        if (!formData.LeaseFilePath) {
          newErrors.LeaseFilePath = "Agreement Document is required";
        }
      } else if (formData.OwnerShipTypeid === 1) {
        if (!formData.Land712FilePath) {
          newErrors.Land712FilePath = "Ownership Document is required";
        }
      }
    }

    if (
      !formData.DistanceToInstitute ||
      parseFloat(formData.DistanceToInstitute) < 0
    ) {
      newErrors.DistanceToInstitute = "Distance is required";
    }

    if (!formData.LandPhotoPath) {
      newErrors.LandPhotoPath = `${currentEditLand} Photo is required`;
    }

    if (!formData.Latitude || !formData.Longitude) {
      newErrors.LatitudeLongitude = "Latitude and Longitude are required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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
        navigate(`/Institute/WorkshopDetails?P1=${p1}&P2=${p2}`);
      } else {
        navigate("/Institute/WorkshopDetails");
      }
      return;
    }

    try {
      startLoading();

      // 👉 ONLY ADMIN CALLS THIS API
      if (userTypeID === 14 || userTypeID === 81) {
        const statusPayload = {
          InstituteID: instituteID,
          PageCode: "Land",
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
            headers: { "Content-Type": "application/json" },
          },
        );

        if (statusRes.data?.Status !== "Success") {
          throw new Error(
            statusRes.data?.Message || "Failed to update verification status",
          );
        }
      }

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Land details saved successfully",
        confirmButtonText: "OK",
      }).then(() => {
        if (userTypeID === 14 || userTypeID === 81) {
          navigate(`/Institute/WorkshopDetails?P1=${p1}&P2=${p2}`);
        } else {
          navigate("/Institute/WorkshopDetails");
        }
      });
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
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      startLoading();

      const payload = {
        instituteID: instituteID,
        instituteCode: instituteCode,
        landID: formData.LandID,
        landType: formData.LandTypeCode,
        landTypeCode: formData.LandTypeCode,
        requiredAgriLand:
          formData.LandTypeCode === "A" ? formData.RequiredLandArea : 0,
        requiredOpenGroundLand:
          formData.LandTypeCode === "O" ? formData.RequiredLandArea : 0,
        requiredLandArea: formData.RequiredLandArea,
        availableLandArea: parseFloat(formData.AvailableLandArea),
        variation: parseFloat(formData.Variation),
        distanceToInstitute: parseFloat(formData.DistanceToInstitute),
        ownerShipTypeid: formData.OwnerShipTypeid,
        ownerShipType:
          ownershipOptions.find(
            (opt) => opt.Value === formData.OwnerShipTypeid.toString(),
          )?.Text || "",
        leaseDate: formData.LeaseDate || "",
        leaseExpiryDate: formData.LeaseExpiryDate || "",
        land712FilePath: formData.Land712FilePath || "",
        leaseFilePath: formData.LeaseFilePath || "",
        googleMapPath: `https://www.google.com/maps?q=${formData.Latitude},${formData.Longitude}`,
        landPhotoPath: formData.LandPhotoPath || "",
        isActive: formData.IsActive,
        userLoginID: loginID.toString(),
        ipAddress: ipAddress,
        pageCode: "LAND_DETAILS",
        isEditAllowed: true,
        isDeleteAllowed: true,
        latitude: formData.Latitude,
        longitude: formData.Longitude,
      };

      const response = await agent.post(SaveLandDetails, payload);

      if (response.data.Status === "Success") {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Land details saved successfully",
          timer: 2000,
        });

        handleCancelEdit();
        fetchAvailableLandDetails();
      } else {
        Swal.fire(
          "Error",
          response.data.Message || "Failed to save land details",
          "error",
        );
      }
    } catch (error) {
      // catch (error) {
      //    console.error('Error saving land details:', error);
      //    Swal.fire('Error', 'Failed to save land details', 'error');
      //}
      console.error("Error saving building:", error);
      console.error("Error response:", error.response?.data);

      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.response?.data?.Message ||
          error.message ||
          "Failed to save land details",
        confirmButtonColor: "#d33",
      });
    } finally {
      stopLoading();
    }
    };
    const Mulitihandle = async () => {

        if (!showEditForm) {

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
            await handleSave();
        } else {
            goNext();
        }
    };

  const formatOptions = (options) => {
    return options.map((opt) => ({
      label: opt.Text,
      value: opt.Value,
    }));
  };

  const isAgricultureLand =
    formData.LandTypeCode === "A" ||
    currentEditLand?.toLowerCase().includes("agri");

    return (

        <InstituteFlowLayout
            currentPageCode="Land"
            p1={p1}
            p2={p2}
            onSave={Mulitihandle}
            isSaveLoading={isLoading}
            isLocked={isLocked}
            title="Land Details"
            color={color}
            showFlowActions={!showEditForm}

        >
    
        

        {/* Required Land as per Norms */}
        <fieldset className="border border-gray-300 rounded p-4 bg-gray-50 mt-4">
          <legend className="text-base font-semibold text-gray-800 px-2">
            Required Land as per Norms
          </legend>

          <FilteredTableComponent
            data={requiredLandTableData}
            columns={requiredLandColumns}
            filterColumns={[]}
            customButtons={[]}
            title=""
            exportFileName="Required_Land_Details"
            tableId="required-land-table"
            searchable={false}
            sortable={false}
            showExcelTemplate={false}
            exportable={false}
            showSearch={false}
            showExport={false}
            className="mt-3"
            maxHeight="400px"
            stickyHeader={false}
            readOnly={isLocked}
            rowClassName={(row) => row.rowClassName}
          />
        </fieldset>

        {/* Available Land - Using FilteredTableComponent with renderCell */}
        <fieldset className="border border-gray-300 rounded p-4 bg-gray-50 mt-6">
          <legend className="text-base font-semibold text-gray-800 px-2">
            Available Land
          </legend>

          <FilteredTableComponent
            data={availableLandTableData}
            columns={availableLandColumns}
            filterColumns={["", ""]}
            customButtons={[]}
            title=""
            exportFileName="Available_Land_Details"
            tableId="available-land-table"
            searchable={false}
            sortable={false}
            showExcelTemplate={false}
            exportable={false}
            showSearch={true}
            showExport={false}
            className="mt-3"
            maxHeight="400px"
            stickyHeader={false}
            readOnly={false}
            renderCell={renderAvailableLandCell}
          />
        </fieldset>

        {/* Note */}
        <div className="mt-4 rounded-md border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm text-blue-700">
            <span className="font-medium">Note:</span>
          </p>
          <ol className="list-decimal list-inside mt-1 space-y-1 text-sm text-blue-700">
            <li>Negative Variation means shortage</li>
            <li>Positive Variation means adequate/excess</li>
          </ol>
        </div>

        {/* Remark */}
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">
            <span className="font-medium">Remark:</span>
          </p>
          <p className="text-sm text-red-700 mt-1">{generateRemark()}</p>
        </div>

            {showEditForm && (
                <fieldset
                    ref={formRef}
                    className="border border-gray-300 rounded mb-6 px-4 pt-3 pb-6 bg-white shadow-lg"
                >
                    <legend
                        className={`flex items-center justify-between gap-2 rounded-md border border-gray-300 ${color} px-4 py-2 text-xl font-bold text-white shadow-md `}
                    >
                        <span>{currentEditLand} &gt; Edit</span>
                        {/*<button*/}
                        {/*    onClick={handleCancelEdit}*/}
                        {/*    className="text-white hover:text-red-300 transition bg-red-600 rounded-full p-1"*/}
                        {/*    title="Cancel"*/}
                        {/*>*/}
                        {/*    <FiX size={24} />*/}
                        {/*</button>*/}
                    </legend>

                    <fieldset className="border border-gray-300 rounded p-4 mt-4">
                        <legend className="text-base font-semibold text-gray-800 px-2">
                            {currentEditLand} Details
                        </legend>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            <div>
                                <FormComponent
                                    label="Select Land Type"
                                    value={formData.LandType}
                                    onChange={() => { }}
                                    disabled={true}
                                    required={true}
                                />
                            </div>

                            <div>
                                <FormComponent
                                    label={`Available ${currentEditLand} (Sq.M.)`}
                                    value={formData.AvailableLandArea}
                                    onChange={(value) => {
                                        const regex = /^\d*\.?\d{0,2}$/;
                                        if (regex.test(value) || value === "") {
                                            handleChange("AvailableLandArea", value);
                                        }
                                    }}
                                    error={errors.AvailableLandArea}
                                    required={true}
                                    type="text"
                                    placeholder="Enter upto 2 decimal"
                                />
                            </div>

                            <div>
                                <FormComponent
                                    label={`Required ${currentEditLand} (Sq.M.)`}
                                    value={formData.RequiredLandArea.toFixed(2)}
                                    onChange={() => { }}
                                    disabled={true}
                                    required={true}
                                />
                            </div>

                            <div>
                                <FormComponent
                                    label={`Variation in ${currentEditLand} (Sq.M.)`}
                                    value={formData.Variation}
                                    onChange={() => { }}
                                    disabled={true}
                                    required={true}
                                    tooltip="Variation in Negative means shortage and Variation in Positive means excess"
                                />
                            </div>

                            {isAgricultureLand && (
                                <div>
                                    <DropdownComponent
                                        label="Ownership"
                                        name="ownership"
                                        options={formatOptions(ownershipOptions)}
                                        value={formData.OwnerShipTypeid?.toString()}
                                        onChange={(value) =>
                                            handleDropdownChange("ownership", value)
                                        }
                                        error={errors.OwnerShipTypeid}
                                        required={true}
                                    />
                                </div>
                            )}

                            {!isAgricultureLand && (
                                <div>
                                    <FormComponent
                                        label="Ownership"
                                        value="Not Applicable"
                                        onChange={() => { }}
                                        disabled={true}
                                        required={true}
                                    />
                                </div>
                            )}

                            {isAgricultureLand && formData.OwnerShipTypeid === 2 && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Date of Agreement <span className="text-red-500">*</span>
                                        </label>
                                        <DateInput
                                            value={formData.LeaseDate}
                                            onChange={(val) => handleChange("LeaseDate", val)}
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
                                            Expiry of Agreement{" "}
                                            <span className="text-red-500">*</span>
                                            <div className="group relative inline-block ml-1">
                                                <FiInfo
                                                    className="text-blue-500 cursor-help inline"
                                                    size={16}
                                                />
                                                <div className="invisible group-hover:visible absolute z-50 w-80 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-2xl -top-2 left-6 border border-gray-700">
                                                    Expiry of Agreement must be minimum 5 years from Date
                                                    of Agreement and minimum 4 years from today
                                                </div>
                                            </div>
                                        </label>
                                        <DateInput
                                            value={formData.LeaseExpiryDate}
                                            //onChange={(val) => handleChange('LeaseExpiryDate', val)}
                                            onChange={handleExpiryDateChange}
                                            // minDate={new Date()}
                                            minDate={
                                                formData.LeaseDate
                                                    ? new Date(formData.LeaseDate)
                                                    : new Date()
                                            }

                                        //tooltip="Expiry of Agreement must be minimum 5 years from Date of Agreement and minimum 4 years from today"
                                        />
                                        {errors.LeaseExpiryDate && (
                                            <p className="text-red-500 text-xs mt-1">
                                                {errors.LeaseExpiryDate}
                                            </p>
                                        )}
                                    </div>

                                    <div className="md:col-span-3">
                                        <UploadPdf
                                            file={formData.LeaseFilePath || ""}
                                            onFileChange={handleFileChange("LeaseFilePath")}
                                            buttonClassName="bg-[#00c3f9]"
                                            buttonText="Upload"
                                            label="Upload Agreement Document"
                                            showLabel={true}
                                            allowedFileTypes="jpg, jpeg, png, pdf"
                                            maxFileSize="2 MB"
                                            required={true}
                                            userTypeId={userTypeID}
                                            userLoginID={loginID}
                                            linkName="View Agreement Document"
                                            uniquefilepath={formData.LeaseFilePath || ""}
                                            id="agreementDocUpload"
                                            tooltip="The Agreement must be made on Rs.100 non-judicial stamp paper between the Owner of Agriculture Land and Proposed Institute for usage of Agriculture Land for Training Purpose."
                                        />
                                        {errors.LeaseFilePath && (
                                            <p className="text-red-500 text-xs mt-1">
                                                {errors.LeaseFilePath}
                                            </p>
                                        )}
                                    </div>
                                </>
                            )}

                            {isAgricultureLand && formData.OwnerShipTypeid === 1 && (
                                <div className="md:col-span-3">
                                    <UploadPdf
                                        file={formData.Land712FilePath || ""}
                                        onFileChange={handleFileChange("Land712FilePath")}
                                        buttonClassName="bg-[#00c3f9]"
                                        buttonText="Upload"
                                        label="Upload Ownership Document (7/12 / Property Card / Other)"
                                        showLabel={true}
                                        allowedFileTypes="jpg, jpeg, png, pdf"
                                        maxFileSize="2 MB"
                                        required={true}
                                        userTypeId={userTypeID}
                                        userLoginID={loginID}
                                        linkName="View Ownership Document"
                                        uniquefilepath={formData.Land712FilePath || ""}
                                        id="ownershipDocUpload"
                                        tooltip="Upload ownership document to authenticate the ownership. The Ownership should be in the name of Proposed Skill Development Institute or Promoting Organization only."
                                    />
                                    {errors.Land712FilePath && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.Land712FilePath}
                                        </p>
                                    )}
                                </div>
                            )}

                            <div>
                                <FormComponent
                                    label={`Distance between Institute and ${currentEditLand} (K.M.)`}
                                    value={formData.DistanceToInstitute}
                                    onChange={(value) => {
                                        const regex = /^\d*\.?\d{0,2}$/;
                                        if (regex.test(value) || value === "") {
                                            handleChange("DistanceToInstitute", value);
                                        }
                                        if (value > 15) {
                                            handleChange("DistanceToInstitute", "");
                                            Swal.fire({
                                                icon: "warning",
                                                title: "Alert!",
                                                text: `Distance between Institute and ${currentEditLand} cannot be more than 15 KM`,
                                                confirmButtonText: "OK",
                                                confirmButtonColor: "#3085d6",
                                            });
                                            return;
                                        }
                                    }}
                                    error={errors.DistanceToInstitute}
                                    required={true}
                                    type="text"
                                    placeholder="Enter upto 15 (2 decimals)"
                                    tooltip="Enter distance in K.M. between Training Institute and Agriculture Land/ Open Ground. Distance between Institute and Agriculture Land/ Open Ground cannot be more than 15 K.M."
                                    tooltipPosition="right"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <UploadPdf
                                    file={formData.LandPhotoPath || ""}
                                    onFileChange={handleFileChange("LandPhotoPath")}
                                    buttonClassName="bg-[#00c3f9]"
                                    buttonText="Upload"
                                    label={`Upload ${currentEditLand} Photo`}
                                    showLabel={true}
                                    allowedFileTypes="jpg, jpeg, png"
                                    maxFileSize="2 MB"
                                    required={true}
                                    userTypeId={userTypeID}
                                    userLoginID={loginID}
                                    linkName="View Photo"
                                    uniquefilepath={formData.LandPhotoPath || ""}
                                    id="landPhotoUpload"
                                    tooltip={`Upload ${currentEditLand} Photo with clear view of available land`}
                                />
                                {errors.LandPhotoPath && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.LandPhotoPath}
                                    </p>
                                )}
                            </div>

                            <div className="md:col-span-3">
                                <div className="grid grid-cols-12 gap-4 mb-4">
                                    <div className="col-span-12 md:col-span-5">
                                        <div className="h-[360px] flex flex-col gap-3">
                                            <FormComponent
                                                label="Latitude, Longitude"
                                                name="LatitudeLongitude"
                                                value={latLongInput?.toString()}
                                                onChange={(value) => {
                                                    const cleanedValue = value.replace(/[^0-9.,-]/g, "");
                                                    setLatLongInput(cleanedValue);

                                                    const [lat, lng] = cleanedValue.split(",");
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        Latitude: lat?.trim() || "",
                                                        Longitude: lng?.trim() || "",
                                                    }));

                                                    setErrors((prev) => ({
                                                        ...prev,
                                                        LatitudeLongitude: "",
                                                    }));
                                                }}
                                                required
                                                error={errors.LatitudeLongitude}
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
                    </fieldset>

                    <div className="flex justify-center gap-3 mt-6">
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={isLoading}
                            className="bg-[#28a745] hover:bg-[#218838] text-white px-6 py-2 rounded font-semibold text-sm transition-colors disabled:opacity-50"
                        >
                            {isLoading ? "Saving..." : "Save"}
                        </button>
                        <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="px-6 py-2 bg-gray-600 text-white font-semibold rounded text-sm hover:bg-gray-700 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </fieldset>
            )}

        {/*{userTypeID === 14 && (*/}
        {/*    <InspectionStatusComponent*/}
        {/*        instituteId={instituteID}*/}
        {/*        pageCode="Land"*/}
        {/*        onChange={(data) => setInspectionStatus(data)}*/}
        {/*    />*/}
        {/*)}*/}

        {((userTypeID === 81 &&
          ["S"].includes(eligibilityData?.InspectionStatus)) ||
          ["V", "W"].includes(eligibilityData?.VerificationStatus)) && (
          <InspectionStatusComponent
            // ref={inspectionref}
            instituteId={instituteID}
            pageCode="Land"
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
            pageCode="Land"
            onChange={(data) => setInspectionStatus(data)}
            //readOnly={userTypeID !== 14}
            //readOnly={eligibilityData?.InspectionStatus === 'S' && userTypeID === 14}
            readOnly={
              (userTypeID === 14 &&
                eligibilityData?.InspectionStatus === "S") ||
              (userTypeID === 81 && eligibilityData?.VerificationStatus === "V")
            }
          />
        )}

        {userTypeID === 14 &&
          ["S", "WD"].includes(eligibilityData?.InspectionStatus) && (
            <InspectionStatusComponent
              //ref={inspectionref}
              instituteId={instituteID}
              pageCode="Land"
              // onChange={(data) => setInspectionStatus(data)}
              //readOnly={userTypeID !== 14}
              readOnly={
                eligibilityData?.InspectionStatus === "S" && userTypeID === 14
              }
              TypeID="81"
              //userName="By Board"
              mode="view"
            />
          )}

        
      

    

      {/* View Modal */}
      {showViewModal && viewData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div
              className={`${color} text-white px-6 py-4 rounded-t-lg flex justify-between items-center`}
            >
              <h2 className="text-xl font-bold">
                View {viewData.LandType} Details
              </h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-white hover:text-red-300 transition bg-red-600 rounded-full p-1"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="border-b pb-2">
                  <p className="text-xs text-gray-500">Land Type</p>
                  <p className="font-semibold">{viewData.LandType}</p>
                </div>
                <div className="border-b pb-2">
                  <p className="text-xs text-gray-500">
                    Available Land (Sq.M.)
                  </p>
                  <p className="font-semibold">
                    {viewData.AvailableLandArea?.toFixed(2)}
                  </p>
                </div>
                <div className="border-b pb-2">
                  <p className="text-xs text-gray-500">Required Land (Sq.M.)</p>
                  <p className="font-semibold">
                    {viewData.RequiredLandArea?.toFixed(2)}
                  </p>
                </div>
                <div className="border-b pb-2">
                  <p className="text-xs text-gray-500">Variation (Sq.M.)</p>
                  <p className="font-semibold">
                    {viewData.Variation?.toFixed(2)}
                  </p>
                </div>
                <div className="border-b pb-2">
                  <p className="text-xs text-gray-500">Ownership</p>
                  <p className="font-semibold">
                    {viewData.OwnerShipType || "N/A"}
                  </p>
                </div>
                <div className="border-b pb-2">
                  <p className="text-xs text-gray-500">Distance (K.M.)</p>
                  <p className="font-semibold">
                    {viewData.DistanceToInstitute?.toFixed(2)}
                  </p>
                </div>
                {viewData.LeaseDate && (
                  <div className="border-b pb-2">
                    <p className="text-xs text-gray-500">Date of Agreement</p>
                    <p className="font-semibold">{viewData.LeaseDate}</p>
                  </div>
                )}
                {viewData.LeaseExpiryDate && (
                  <div className="border-b pb-2">
                    <p className="text-xs text-gray-500">Expiry of Agreement</p>
                    <p className="font-semibold">{viewData.LeaseExpiryDate}</p>
                  </div>
                )}
                <div className="border-b pb-2 col-span-2">
                  <p className="text-xs text-gray-500">Location</p>
                  <p className="font-semibold">
                    {viewData.Latitude}, {viewData.Longitude}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
        </InstituteFlowLayout>
  );
};

export default LandDetails;
