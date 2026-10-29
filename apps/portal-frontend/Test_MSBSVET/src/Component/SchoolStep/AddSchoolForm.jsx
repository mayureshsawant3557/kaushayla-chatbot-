import React, { useState, useEffect } from "react";
import { FiDownload, FiEye } from "react-icons/fi";
import { FileText } from "lucide-react";
import UploadPdf from "../formcomponent/UploadPdf";
import agent from "../../lib/api/agent";
import Swal from "sweetalert2";
import { useAuth } from "../../Hooks/AuthContext";
import { useLoading } from "../../Hooks/useLoading";
import { useNavigate } from "react-router-dom";
import {
  GetPincodeData,
  GetMasterDistrict,
  GetMasterTaluka,
  GetMasterCity,
} from "../../Endpoints_All/Base/location";
import { GetMasterTableList } from "../../Endpoints_All/Base/masterData";
import { GetInstituteIDByInstituteCode } from "../../Endpoints_All/Base/Institute";
import {
  InstituteSchoolAddSchool,
  UpdateSchool,
} from "../../Endpoints_All/SchoolStep/school";
import AddressSection from "../formcomponent/AddressSection";
import CoursesTable from "./CoursesTable";
import { getDeviceIP } from "../../utils/CommonHelper";

const GET_STATES_API = `${GetMasterTableList}?TableName=Master_State&DataValueField=StateID&DataTextField=State&HasSelect=true`;

const AddSchoolForm = ({
  onClose,
  onSave,
  initialData = {},
  isEdit = false,
  onSubmitRef,
  mouStatus,
  onStatusChange,
}) => {
  const { userInfo } = useAuth();
  const navigate = useNavigate();
  const { startLoading, stopLoading, isLoading } = useLoading();

  const [formData, setFormData] = useState({
    udiseNo: "",
    schoolName: "",
    InstituteAddress: "",
    PinCode: "",
    StateID: "",
    DistrictID: "",
    TalukaID: "",
    CityID: "",
    OtherCity: "",
    dateOfMoU: "",
    expiryOfMoU: "",
    mouCopy: null,
    mouCopyPath: "",
    mouFileName: "",
    ...initialData,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState({
    states: false,
    districts: false,
    talukas: false,
    cities: false,
  });
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [talukas, setTalukas] = useState([]);
  const [cities, setCities] = useState([]);
  const [showOtherCity, setShowOtherCity] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [instituteID, setInstituteID] = useState(null);
  const [userLoginID, setUserLoginID] = useState("");
  const [ipAddress, setIpAddress] = useState("");
  const [verificationStatus, setVerificationStatus] = useState(
    isEdit ? mouStatus || "draft" : "draft",
  );

  const isLocked =
    verificationStatus === "pending_verification" ||
    verificationStatus === "verified";
  // const isLocked = initialData?.VerificationStatus === "P";
  useEffect(() => {
    if (isEdit && initialData && initialData.SchoolID && states.length > 0) {
      // ✅ Set Form Data
      setFormData((prev) => ({
        ...prev,
        udiseNo: initialData.UDISENo || "",
        schoolName: initialData.SchoolName || "",
        InstituteAddress: initialData.Address || "",
        PinCode: initialData.PinCode?.toString() || "",
        StateID: initialData.StateID?.toString() || "",
        DistrictID: initialData.DistrictID?.toString() || "",
        TalukaID: initialData.TalukaID?.toString() || "",
        CityID: initialData.CityID?.toString() || "",
        OtherCity: initialData.OtherCity || "",
        dateOfMoU: initialData.MoUDate ? initialData.MoUDate.split("T")[0] : "",
        expiryOfMoU: initialData.MoUExpiry
          ? initialData.MoUExpiry.split("T")[0]
          : "",
        mouCopyPath: initialData.MoUFilePath || "",
        mouFileName: initialData.MoUFileName || "",
      }));

      // ✅ Sync Verification Status Properly
      if (initialData?.VerificationStatus === "P") {
        setVerificationStatus("pending_verification");
      } else if (initialData?.VerificationStatus === "V") {
        setVerificationStatus("verified");
      } else if (initialData?.VerificationStatus === "R") {
        setVerificationStatus("rejected");
      } else {
        setVerificationStatus("draft");
      }
    }
  }, [initialData, isEdit, states]);

  useEffect(() => {
    const initializeComponent = async () => {
      await fetchUserAndInstituteDetails();
      // await fetchIP();
      await fetchStates();
    };
    initializeComponent();
  }, []);

  // Fetch districts when State changes
  useEffect(() => {
    if (formData.StateID) {
      getDistricts(formData.StateID);
    } else {
      setDistricts([]);
      setTalukas([]);
      setCities([]);
    }
  }, [formData.StateID]);

  // Fetch talukas when District changes
  useEffect(() => {
    if (formData.DistrictID) {
      getTalukas(formData.DistrictID);
    } else {
      setTalukas([]);
      setCities([]);
    }
  }, [formData.DistrictID]);

  // Fetch cities when Taluka changes
  useEffect(() => {
    if (formData.TalukaID) {
      getCities(formData.TalukaID);
    } else {
      setCities([]);
    }
  }, [formData.TalukaID]);

  useEffect(() => {
    if (onSubmitRef) {
      onSubmitRef.current = handleSubmit;
    }
  }, [onSubmitRef, formData, errors]);

  useEffect(() => {
    if (isEdit && mouStatus) {
      setVerificationStatus(mouStatus);
    }
  }, [mouStatus, isEdit]);

   useEffect(() =>{
        fetchIP();
    },[]);

  // Fetch user and institute details
  const fetchUserAndInstituteDetails = async () => {
    try {
    
      const loginID = userInfo?.UserLoginID || userInfo?.UserLoginID;
      setUserLoginID(loginID);

      const instituteResponse = await agent.get(
        `${GetInstituteIDByInstituteCode}?InstituteCode=${loginID}`,
      );

      if (instituteResponse.data?.Data) {
        setInstituteID(instituteResponse.data.Data);
      }
    } catch (error) {
      console.error("Error fetching institute details:", error);
    }
  };

  // // FetchIP Address
  // const fetchIP = async () => {
  //     try {
  //         const response = await agent.get('https://api.ipify.org?format=json');
  //         if (response.data?.ip) {
  //             setIpAddress(response.data.ip);
  //         }
  //     } catch (error) {
  //         console.error('Error fetching IP:', error);
  //         setIpAddress("0.0.0.0");
  //     }
  // };

   const fetchIP = async () => {
        try {
            const ip = await getDeviceIP();
            setIpAddress(ip);
        } catch (err) {
            console.error("Failed to get IP:", err);
        }
        };

  const fetchStates = async () => {
    setLoading((prev) => ({ ...prev, states: true }));
    try {
      const response = await agent.get(GET_STATES_API);
      if (response.data.Status === "Success") {
        const stateData = response.data.Data.filter(
          (item) => item.Value !== "-1",
        );
        setStates(stateData);
      }
    } catch (error) {
      console.error("Error fetching states:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load states. Please refresh the page.",
        timer: 3000,
        showConfirmButton: false,
      });
    } finally {
      setLoading((prev) => ({ ...prev, states: false }));
    }
  };

  const getDistricts = async (stateId) => {
    setLoading((prev) => ({ ...prev, districts: true }));
    try {
      const response = await agent.get(GetMasterDistrict);
      if (response.data.Status === "Success") {
        const filtered = response.data.Data.filter(
          (item) => item.Group == stateId,
        );
        setDistricts(filtered);
      }
    } catch (error) {
      console.error("Error fetching districts:", error);
    } finally {
      setLoading((prev) => ({ ...prev, districts: false }));
    }
  };

  const getTalukas = async (districtId) => {
    setLoading((prev) => ({ ...prev, talukas: true }));
    try {
      const response = await agent.get(GetMasterTaluka);
      if (response.data.Status === "Success") {
        const filtered = response.data.Data.filter(
          (item) => item.Value !== "-1" && item.Group == districtId,
        );
        setTalukas(filtered);
      }
    } catch (error) {
      console.error("Error fetching talukas:", error);
    } finally {
      setLoading((prev) => ({ ...prev, talukas: false }));
    }
  };

  const getCities = async (talukaId) => {
    setLoading((prev) => ({ ...prev, cities: true }));
    try {
      const response = await agent.get(GetMasterCity);
      if (response.data.Status === "Success") {
        const allCities = response.data.Data.filter(
          (item) => item.Value !== "-1" && item.Group == talukaId,
        );
        const citiesWithOther = [
          ...allCities,
          { Value: "9999999", Text: "Other", Group: talukaId },
        ];
        setCities(citiesWithOther);
      }
    } catch (error) {
      console.error("Error fetching cities:", error);
    } finally {
      setLoading((prev) => ({ ...prev, cities: false }));
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const handlePincodeChange = async (field, value) => {
    try {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (value.length !== 6) return;

      setLoading((prev) => ({
        ...prev,
        districts: true,
        talukas: true,
        cities: true,
      }));

      const response = await agent.get(`${GetPincodeData}?Pincode=${value}`);
      const data = response.data.Data;

      if (data.StateID) {
        setFormData((prev) => ({ ...prev, StateID: data.StateID.toString() }));
        await getDistricts(data.StateID);
      }

      if (data.DistrictID) {
        setFormData((prev) => ({
          ...prev,
          DistrictID: data.DistrictID.toString(),
        }));
        await getTalukas(data.DistrictID);
      }

      if (data.TalukaID) {
        setFormData((prev) => ({
          ...prev,
          TalukaID: data.TalukaID.toString(),
        }));
        await getCities(data.TalukaID);
      }

      if (data.CityID) {
        setFormData((prev) => ({ ...prev, CityID: data.CityID.toString() }));
        setShowOtherCity(data.CityID.toString() === "9999999");
      }
    } catch (error) {
      console.error("Error fetching pincode data:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Invalid pincode or service unavailable",
        timer: 2000,
        showConfirmButton: false,
      });
    } finally {
      setLoading((prev) => ({
        ...prev,
        districts: false,
        talukas: false,
        cities: false,
      }));
    }
  };

  const handleStateChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      StateID: value,
      DistrictID: "",
      TalukaID: "",
      CityID: "",
      OtherCity: "",
    }));
    setShowOtherCity(false);
  };

  const handleDistrictChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      DistrictID: value,
      TalukaID: "",
      CityID: "",
      OtherCity: "",
    }));
    setShowOtherCity(false);
  };

  const handleTalukaChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      TalukaID: value,
      CityID: "",
      OtherCity: "",
    }));
    setShowOtherCity(false);
  };

  const handleCityChange = (value) => {
    setFormData((prev) => ({ ...prev, CityID: value }));
    setShowOtherCity(value === "9999999");
    if (value !== "9999999") {
      setFormData((prev) => ({ ...prev, OtherCity: "" }));
    }
  };

  const handleMouUpload = (fileData) => {
    setFormData((prev) => ({
      ...prev,
      mouCopy: fileData.file,
      mouCopyPath: fileData.filePath || fileData.azureUrl || "",
      mouFileName: fileData.fileName || "",
    }));
    Swal.fire({
      icon: "success",
      title: "Success",
      text: "MoU document uploaded successfully!",
      timer: 2000,
      showConfirmButton: false,
    });
  };

  const handleViewDocument = () => {
    if (formData.mouCopyPath) {
      window.open(formData.mouCopyPath, "_blank");
    } else {
      Swal.fire({
        icon: "warning",
        title: "No Document",
        text: "No MoU document uploaded yet.",
        timer: 2000,
        showConfirmButton: false,
      });
    }
  };

  const handleDownloadFormat = () => {
    Swal.fire({
      icon: "info",
      title: "Download",
      text: "Downloading MoU format...",
      timer: 2000,
      showConfirmButton: false,
    });
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = {
      udiseNo: "UDISE No. is required",
      schoolName: "School name is required",
      InstituteAddress: "Address is required",
      PinCode: "Pin code is required",
      StateID: "State is required",
      DistrictID: "District is required",
      TalukaID: "Taluka is required",
      CityID: "City is required",
      dateOfMoU: "Date of MoU is required",
      expiryOfMoU: "Expiry of MoU is required",
    };

    Object.entries(requiredFields).forEach(([field, message]) => {
      if (!formData[field]) newErrors[field] = message;
    });

    if (formData.udiseNo && !/^\d{11}$/.test(formData.udiseNo)) {
      newErrors.udiseNo = "UDISE No. must be 11 digits";
    }

    if (formData.PinCode && !/^\d{6}$/.test(formData.PinCode)) {
      newErrors.PinCode = "Pin code must be 6 digits";
    }

    if (formData.CityID === "9999999" && !formData.OtherCity) {
      newErrors.OtherCity = "Please enter city/village name";
    }

    // if (formData.dateOfMoU && formData.expiryOfMoU) {
    //   const startDate = new Date(formData.dateOfMoU);
    //   const endDate = new Date(formData.expiryOfMoU);

    //   if (endDate < startDate) {
    //     newErrors.expiryOfMoU =
    //       "Expiry of MoU cannot be earlier than Date of MoU";
    //   }
    // }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (courses = []) => {
    if (!validateForm()) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Please fill all required fields correctly",
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    if (!instituteID) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Institute ID not found. Please refresh the page.",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    setIsSubmitting(true);
    startLoading();

    try {
      Swal.fire({
        title: "Saving...",
        text: "Please wait",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // Determine village value
      let villageValue = "";
      if (formData.CityID === "9999999") {
        villageValue = formData.OtherCity || "";
      } else {
        const selectedCity = cities.find((c) => c.Value === formData.CityID);
        villageValue = selectedCity?.Text || "";
      }

      const payload = {
        schoolID: isEdit ? initialData.SchoolID : 0,
        instituteId: instituteID,

        udiseNo: formData.udiseNo || "",
        schoolName: formData.schoolName || "",

        address: formData.InstituteAddress || "",
        pinCode: formData.PinCode ? parseInt(formData.PinCode) : 0,

        cityId: parseInt(formData.CityID) || 0,
        otherCity:
          formData.CityID === "9999999" ? formData.OtherCity || "" : "",
        village: villageValue || "",
        talukaId: parseInt(formData.TalukaID) || 0,
        districtId: parseInt(formData.DistrictID) || 0,

        moUDate: formData.dateOfMoU ? `${formData.dateOfMoU}T00:00:00` : null,
        moUExpiry: formData.expiryOfMoU
          ? `${formData.expiryOfMoU}T00:00:00`
          : null,

        moUFilePath: formData.mouCopyPath || "",
        moUFileName: formData.mouFileName || "",

        selectedCourses: courses.length
          ? courses
              .map((c) => c.course)
              .filter(Boolean)
              .join(",")
          : "",

        createdBy: instituteID,
        modifiedBy: instituteID,
        ipAddress: ipAddress || "0.0.0.0",
      };

      let response;

      if (isEdit) {
        payload.SchoolID = initialData.SchoolID;
        response = await agent.post(UpdateSchool, payload);
      } else {
        response = await agent.post(InstituteSchoolAddSchool, payload);
      }

      if (response.data?.Status === "Success") {
        await Swal.fire({
          icon: "success",
          title: "Success",
          text: isEdit
            ? "School updated successfully!"
            : "School added successfully!",
          timer: 2000,
          showConfirmButton: false,
        });

        if (onSave) {
          onSave(formData);
        }

        if (onClose) {
          onClose();
        } else {
          navigate("/institute/SchoolStep");
        }
      } else {
        throw new Error(response.data?.Message || "Failed to add school");
      }
    } catch (error) {
      console.error("Add School Error:", error);

      if (error.response) {
        console.error("Error Response Data:", error.response.data);

        if (error.response.data?.errors) {
          console.error("Validation Errors:", error.response.data.errors);

          const errorMessages = Object.entries(error.response.data.errors)
            .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
            .join("\n");

          Swal.fire({
            icon: "error",
            title: "Validation Error",
            text: errorMessages,
            confirmButtonColor: "#3085d6",
          });
          return;
        }

        if (
          error.response.data?.Message?.includes("UDISE Number already exists")
        ) {
          setErrors((prev) => ({
            ...prev,
            udiseNo:
              "This UDISE number is already registered. Please use a different UDISE number.",
          }));

          Swal.fire({
            icon: "error",
            title: "Duplicate UDISE Number",
            text: "This UDISE number is already registered in the system.",
            confirmButtonColor: "#3085d6",
          });
        } else {
          Swal.fire({
            icon: "error",
            title: `Error ${error.response.status}`,
            text:
              error.response.data?.Message ||
              error.response.data?.title ||
              "Failed to add school",
            confirmButtonColor: "#3085d6",
          });
        }
      } else if (error.request) {
        Swal.fire({
          icon: "error",
          title: "Network Error",
          text: "No response received from server. Please check your connection.",
          confirmButtonColor: "#3085d6",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "Failed to add school",
          confirmButtonColor: "#3085d6",
        });
      }
    } finally {
      setIsSubmitting(false);
      stopLoading();
    }
  };
  const isFieldEditable = () => !isLocked;

  const today = new Date().toISOString().split("T")[0];

  const uiMouStatus = formData.expiryOfMoU
    ? formData.expiryOfMoU >= today
      ? "Active"
      : "Expired"
    : "";

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/60 z-50 h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-8">
      <div className="inline-flex items-center bg-[#6b7280] text-white px-4 py-3 rounded-lg mb-8 text-base font-semibold">
        <FileText size={20} className="mr-2" />{" "}
        {isEdit ? "Edit School Details" : "Add School Details"}
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Verification Status:
          </label>

          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${
              verificationStatus === "verified"
                ? "bg-green-100 text-green-800 border-green-200"
                : verificationStatus === "pending_verification"
                  ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                  : verificationStatus === "rejected"
                    ? "bg-red-100 text-red-800 border-red-200"
                    : "bg-gray-100 text-gray-800 border-gray-200"
            }`}
          >
            {verificationStatus === "verified"
              ? "Verified"
              : verificationStatus === "pending_verification"
                ? "Pending"
                : verificationStatus === "rejected"
                  ? "Rejected"
                  : "Initiated"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            UDISE No. <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            disabled={isLocked}
            value={formData.udiseNo}
            onChange={(e) => handleInputChange("udiseNo", e.target.value)}
            placeholder="Enter 11-digit UDISE No."
            maxLength="11"
            className={`w-full p-2.5 border ${errors.udiseNo ? "border-red-500" : "border-gray-300"} rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
          />
          {errors.udiseNo && (
            <p className="text-red-500 text-xs mt-1">{errors.udiseNo}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            School <span className="text-red-500">*</span>
          </label>
          <input
            disabled={isLocked}
            type="text"
            value={formData.schoolName}
            onChange={(e) => handleInputChange("schoolName", e.target.value)}
            placeholder="Enter school name"
            className={`w-full p-2.5 border ${errors.schoolName ? "border-red-500" : "border-gray-300"} rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
          />
          {errors.schoolName && (
            <p className="text-red-500 text-xs mt-1">{errors.schoolName}</p>
          )}
        </div>
      </div>

      <div className="mb-8">
        <AddressSection
          formData={formData}
          errors={errors}
          loading={loading}
          states={states}
          districts={districts}
          talukas={talukas}
          cities={cities}
          onFieldChange={handleInputChange}
          onPincodeChange={handlePincodeChange}
          onStateChange={handleStateChange}
          onDistrictChange={handleDistrictChange}
          onTalukaChange={handleTalukaChange}
          onCityChange={handleCityChange}
          showOtherCity={showOtherCity}
          otherCityValue={formData.OtherCity}
          onOtherCityChange={(value) => handleInputChange("OtherCity", value)}
          isFieldEditable={isFieldEditable}
          addressLabel="Address of Institute"
          showAllFields={true}
        />
      </div>

      <div className="mb-6">
        <div className="grid grid-cols-3 border border-gray-300 rounded-md overflow-hidden">
          <div className="bg-gray-100 px-4 py-3 text-sm font-medium text-gray-700 border-r border-gray-300">
            Date of MoU
          </div>
          <div className="bg-gray-100 px-4 py-3 text-sm font-medium text-gray-700 border-r border-gray-300">
            Expiry of MoU
          </div>
          <div className="bg-gray-100 px-4 py-3 text-sm font-medium text-gray-700">
            Upload MoU Copy
          </div>

          <div className="p-4 border-r border-gray-300">
            <input
              type="date"
              value={formData.dateOfMoU}
              disabled={isLocked}
              onChange={(e) => handleInputChange("dateOfMoU", e.target.value)}
              className={`w-full p-2 border ${errors.dateOfMoU ? "border-red-500" : "border-gray-300"} rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500`}
            />
            {errors.dateOfMoU && (
              <p className="text-red-500 text-xs mt-1">{errors.dateOfMoU}</p>
            )}

            {formData.expiryOfMoU && (
              <div className="mt-2">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    uiMouStatus === "Active"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  MoU Status: {uiMouStatus}
                </span>
              </div>
            )}
          </div>

          <div className="p-4 border-r border-gray-300">
            <input
              type="date"
              disabled={isLocked}
              min={today}
              value={formData.expiryOfMoU}
              onChange={(e) => handleInputChange("expiryOfMoU", e.target.value)}
              className={`w-full p-2 border ${errors.expiryOfMoU ? "border-red-500" : "border-gray-300"} rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500`}
            />
            {errors.expiryOfMoU && (
              <p className="text-red-500 text-xs mt-1">{errors.expiryOfMoU}</p>
            )}
          </div>

          <div className="p-4 flex items-center gap-2">
            <UploadPdf
              disabled={isLocked}
              file={formData.mouFileName || ""}
              onFileChange={handleMouUpload}
              buttonClassName="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
              buttonText="Upload Document"
              allowedFileTypes="pdf, doc, docx, jpg, jpeg, png"
              maxFileSize="2 MB"
              userTypeId={userInfo?.UserTypeID}
              userLoginID={userInfo?.UserLoginID}
              linkName=""
              showLabel={false}
              uniquefilepath={formData.mouCopyPath || ""}
              id="mouUpload"
            />
            <button
              disabled={isLocked}
              onClick={handleViewDocument}
              className="p-2.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md border border-gray-300"
              title="View Document"
            >
              <FiEye size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <button
          disabled={isLocked}
          onClick={handleDownloadFormat}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          <FiDownload size={16} />
          <span>Download MoU Format</span>
        </button>
      </div>
      <div className="mt-10">
        <CoursesTable
          schoolId={initialData?.SchoolID}
          initialCourses={initialData?.courses || []}
          mouStatus={verificationStatus}
          onStatusChange={(status) => {
            setVerificationStatus(status);
            if (onStatusChange) onStatusChange(status);
          }}
          onClose={onClose}
          onSave={async (courses) => {
            await handleSubmit(courses);
          }}
        />
      </div>

      {/* <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || isLoading}
          className="px-6 py-2.5 bg-blue-600 text-white font-medium text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Saving..." : "Save School Details"}
        </button>
        <button
          type="button"
          onClick={onClose || (() => navigate("/institute/SchoolStep"))}
          disabled={isSubmitting}
          className="px-6 py-2.5 bg-gray-100 text-gray-700 font-medium text-sm rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
      </div> */}
    </div>
  );
};

export default AddSchoolForm;
