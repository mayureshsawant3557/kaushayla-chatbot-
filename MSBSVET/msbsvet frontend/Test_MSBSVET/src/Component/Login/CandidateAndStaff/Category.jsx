import { useState, useEffect, useContext } from "react";
import agent from "../../../lib/api/agent";
import Swal from "sweetalert2";
import FormComponent from "../../formcomponent/FormComponent";
import DropdownComponent from "../../formcomponent/DropdownComponent";
import UploadPdf from "../../formcomponent/UploadPdf";
import ProgressTracker from "./ProgressTracker";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  GetCandidateCategory,
  SaveCandidateCategory,
} from "../../../Endpoints_All/Candidate/category";

import {
  GetStaffCategory,
  SaveStaffCategory,
} from "../../../Endpoints_All/Staff/category";

import {
  GetMasterTableList,
  GetMasterCaste,
} from "../../../Endpoints_All/Base/masterData";
import { UploadFile } from "../../../Endpoints_All/Utils/fileUpload";
import { useLoading } from "../../../Hooks/useLoading";

import { getDeviceIP } from '../../../utils/CommonHelper';
import { useAuth } from '../../../Hooks/AuthContext';
import { CheckCandidateURL } from '../../../Endpoints_All/Candidate/summary';
import { CheckStaffURL } from '../../../Endpoints_All/Staff/summary';
import { ThemeContext } from "../../../Component/Context/ThemeContext";

// API endpoints
const ENDPOINTS = {
  Candidate: {
    get: GetCandidateCategory,
    save: SaveCandidateCategory,
    userTypeIDName: "CandidateID",
  },
  Staff: {
    get: GetStaffCategory,
    save: SaveStaffCategory,
    userTypeIDName: "StaffID",
  },
};

const CategoryDetailsForm = () => {
  const { color } = useContext(ThemeContext);
  const { userInfo } = useAuth();
  const userTypeID = userInfo?.UserTypeID;
  const userLoginID = userInfo?.UserLoginID;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { startLoading, stopLoading, isLoading } = useLoading();

  const candidateIdFromUrl = searchParams.get("candidateId");
  const applicationId = searchParams.get("applicationId");
  const isInstituteUser = userTypeID === 61;

  const effectiveUserId =
    isInstituteUser && candidateIdFromUrl
      ? candidateIdFromUrl
      : userInfo?.UserID;

  const userType =
    isInstituteUser || candidateIdFromUrl
      ? "Candidate"
      : userTypeID === 91
        ? "Candidate"
        : "Staff";

  const currentEndpoints = ENDPOINTS[userType];

  const userID = effectiveUserId;

  const [ipAddress, setIpAddress] = useState("");

  const navigateWithCandidateId = (path) => {
    if (isInstituteUser && candidateIdFromUrl) {
      navigate(`${path}?candidateId=${candidateIdFromUrl}`);
    } else {
      navigate(path);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for form fields
  const [formData, setFormData] = useState({
    [currentEndpoints.userTypeIDName]: userID || 0,
    nationalityID: 77,
    isMHDomiciled: 1, // 1 for Yes, 0 for No, 2 for Not Applicable
    religionID: '',
    categoryID: '',
    casteID: '',
    isBelongToNCL: 0,
    isBelongToPWD: 0, // 1 for Yes, 0 for No
    disabilityPercentage: '',
    disabilityID: '',
    disabilityType: '',
    uniqueDisabilityIDNo: '',
    UserLoginID: userLoginID || '',
    IPAddress: ipAddress,
    PageCode: "Category"
  });

  // State for dropdown options
  const [dropdownOptions, setDropdownOptions] = useState({
    religion: [],
    category: [],
    caste: [],
    disability: [],
  });

  useEffect(() => {
    const fetchIP = async () => {
      try {
        const ip = await getDeviceIP();
        setIpAddress(ip);
      } catch (err) {
        console.error("Failed to get IP:", err);
        setIpAddress('');
      }
    };
    fetchIP();
    checkCandidateStaffURL();

  }, []);

  // Safe AI Assistant Autofill event listener for Category & Reservation
  useEffect(() => {
    const handleAutofill = (e) => {
      if (!e || !e.detail) return;
      const d = e.detail;

      setFormData((prev) => ({
        ...prev,
        ...(d.categoryID && { categoryID: d.categoryID }),
        ...(d.category && { categoryID: d.category }),
        ...(d.casteID && { casteID: d.casteID }),
        ...(d.isBelongToNCL !== undefined && { isBelongToNCL: d.isBelongToNCL }),
        ...(d.isBelongToPWD !== undefined && { isBelongToPWD: d.isBelongToPWD }),
        ...(d.isMHDomiciled !== undefined && { isMHDomiciled: d.isMHDomiciled }),
      }));
    };

    window.addEventListener("msbsvet:autofill", handleAutofill);
    return () => window.removeEventListener("msbsvet:autofill", handleAutofill);
  }, []);



  // State for uploaded files
  const [files, setFiles] = useState({
    leavingCertificatePath: null,
    domicileCertificatePath: null,
    casteCertificatePath: null,
    nclCertificatePath: null,
    pwdCertificatePath: null,
  });

  // State for file paths (for viewing)
  const [filePaths, setFilePaths] = useState({
    leavingCertificatePath: "",
    domicileCertificatePath: "",
    casteCertificatePath: "",
    nclCertificatePath: "",
    pwdCertificatePath: "",
  });

  // State for filtered caste options
  const [filteredCasteOptions, setFilteredCasteOptions] = useState([]);

  // State for validation errors
  const [errors, setErrors] = useState({});

  // State for form submission status

  // Function to fetch all required data in parallel
  const fetchAllData = async () => {
    if (!userID) return;

    startLoading();

    try {
      // Define all API calls
      const apiCalls = [
        // Religion data
        agent.get(GetMasterTableList, {
          params: {
            TableName: "Master_Religion",
            DataValueField: "ReligionID",
            DataTextField: "Religion",
            HasSelect: true,
            orderByText: "ReligionID",
          },
        }),

        // Category data
        agent.get(GetMasterTableList, {
          params: {
            TableName: "Master_Category",
            DataValueField: "CategoryID",
            DataTextField: "Category",
            HasSelect: true,
            orderByText: "SeqNo",
          },
        }),

        // Caste data
        agent.get(GetMasterCaste),

        // Disability data
        agent.get(GetMasterTableList, {
          params: {
            TableName: "Master_Disability",
            DataValueField: "DisabilityID",
            DataTextField: "Disability",
            HasSelect: true,
            orderByText: "DisabilityID",
          },
        }),

        // User category data
        userType === "Staff"
          ? agent.post(currentEndpoints.get, {
            StaffID: userID,
            UserLoginID: userLoginID,
            PageCode: "Category",
            IPAddress: ipAddress,
          })
          : agent.get(currentEndpoints.get, {
            params: {
              CandidateID: userID,
              UserLoginID: userLoginID,
              PageCode: "Category",
              IPAddress: ipAddress,
            },
          }),
      ];

      // Execute all API calls in parallel
      const [
        religionResponse,
        categoryResponse,
        casteResponse,
        disabilityResponse,
        userDataResponse,
      ] = await Promise.all(apiCalls);

      // Process dropdown options
      if (religionResponse.data.Status === "Success") {
        const options = religionResponse.data.Data.map((item) => ({
          value: item.Value,
          label: item.Text,
        }));
        setDropdownOptions((prev) => ({ ...prev, religion: options }));
      }

      if (categoryResponse.data.Status === "Success") {
        const options = categoryResponse.data.Data.map((item) => ({
          value: item.Value,
          label: item.Text,
        }));
        setDropdownOptions((prev) => ({ ...prev, category: options }));
      }

      if (casteResponse.data.Status === "Success") {
        const options = casteResponse.data.Data.map((item) => ({
          value: item.Value,
          label: item.Text,
          categoryId: item.Group, // Assuming Group is the CategoryID
        }));
        setDropdownOptions((prev) => ({ ...prev, caste: options }));
      }

      if (disabilityResponse.data.Status === 'Success') {

        const options = disabilityResponse.data.Data.map(item => ({
          value: item.Value,
          label: item.Text
        }));
        setDropdownOptions(prev => ({ ...prev, disability: options }));
      }

      // Process user data
      if (userDataResponse.data.Status === 'Success') {
        const userData = userDataResponse.data.Data;


        // Update form data
        setFormData((prev) => ({
          ...prev,
          nationalityID: userData.NationalityID,
          isMHDomiciled: userData.IsMHDomiciled,
          religionID:
            userData.ReligionID === -1 ? "" : userData.ReligionID.toString(),
          categoryID:
            userData.CategoryID === -1 ? "" : userData.CategoryID.toString(),
          casteID: userData.CasteID === -1 ? "" : userData.CasteID.toString(),
          isBelongToNCL: userData.IsBelongToNCL,
          isBelongToPWD: userData.IsBelongToPWD,
          disabilityPercentage:
            userData.DisabilityPercentage === -1
              ? ""
              : userData.DisabilityPercentage.toString(),
          disabilityID:
            userData.DisabilityID === -1
              ? ""
              : userData.DisabilityID.toString(),
          disabilityType: userData.DisabilityType || "",
          uniqueDisabilityIDNo: userData.UniqueDisabilityIDNo || "",
        }));

        // Update file paths
        setFilePaths({
          leavingCertificatePath: userData.LeavingCertificatePath || "",
          domicileCertificatePath: userData.DomicileCertificatePath || "",
          casteCertificatePath: userData.CasteCertificatePath || "",
          nclCertificatePath: userData.NCLCertificatePath || "",
          pwdCertificatePath: userData.PWDCertificatePath || "",
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `Error loading data: ${error.message}`,
      });
    } finally {
      stopLoading();
    }
  };

  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  useEffect(() => {
    if (!initialDataLoaded && userID && ipAddress) {
      fetchAllData();
      setInitialDataLoaded(true);
    }
  }, [userID, ipAddress, initialDataLoaded]);

  // Filter caste options when category changes
  useEffect(() => {
    if (formData.categoryID && dropdownOptions.caste.length > 0) {
      const filtered = dropdownOptions.caste.filter(
        (caste) => caste.categoryId === formData.categoryID,
      );
      setFilteredCasteOptions(filtered);
    } else {
      setFilteredCasteOptions([]);
    }
  }, [formData.categoryID, dropdownOptions.caste]);

  // Clear related fields when category changes
  useEffect(() => {
    if (formData.categoryID) {
      // Clear caste when category changes
      setFormData((prev) => ({
        ...prev,
        casteID: "",
      }));

      // Clear NCL fields when category changes
      if (formData.categoryID !== "2") {
        setFormData((prev) => ({
          ...prev,
          isBelongToNCL: 0,
        }));
      }
    }
  }, [formData.categoryID]);

  // Clear PWD related fields when PWD selection changes
  useEffect(() => {
    if (formData.isBelongToPWD === 0) {
      setFormData((prev) => ({
        ...prev,
        disabilityPercentage: "",
        disabilityID: "",
        disabilityType: "",
        uniqueDisabilityIDNo: "",
      }));
      // Clear PWD certificate file
      setFiles((prev) => ({
        ...prev,
        pwdCertificatePath: null,
      }));
      setFilePaths((prev) => ({
        ...prev,
        pwdCertificatePath: "",
      }));
    }
  }, [formData.isBelongToPWD]);

  // Clear domicile certificate when domicile selection changes
  useEffect(() => {
    if (formData.isMHDomiciled !== 1) {
      setFiles((prev) => ({
        ...prev,
        domicileCertificatePath: null,
      }));
      setFilePaths((prev) => ({
        ...prev,
        domicileCertificatePath: "",
      }));
    }
  }, [formData.isMHDomiciled]);

  // Clear NCL certificate when NCL selection changes
  useEffect(() => {
    if (formData.isBelongToNCL !== 1) {
      setFiles((prev) => ({
        ...prev,
        nclCertificatePath: null,
      }));
      setFilePaths((prev) => ({
        ...prev,
        nclCertificatePath: "",
      }));
    }
  }, [formData.isBelongToNCL]);

  // Clear caste certificate when category changes
  useEffect(() => {
    if (
      !formData.categoryID ||
      !["2", "3", "4", "5", "6"].includes(formData.categoryID)
    ) {
      setFiles((prev) => ({
        ...prev,
        casteCertificatePath: null,
      }));
      setFilePaths((prev) => ({
        ...prev,
        casteCertificatePath: "",
      }));
    }
  }, [formData.categoryID]);

  // Handle form field changes
  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear validation error when field is updated
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  // Updated handleFileChange function to work with UploadPdf component
  const handleFileChange = (fieldName, fileData) => {
    // fileData comes from UploadPdf with: { filePath, fileName, uniqueFileName, file }
    setFiles((prev) => ({
      ...prev,
      [fieldName]: fileData.filePath, // Store the Azure blob URL
    }));

    // Also update filePaths state to reflect the current uploaded file
    setFilePaths((prev) => ({
      ...prev,
      [fieldName]: fileData.filePath,
    }));

    // Clear any existing errors for this field
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: null }));
    }
  };

  const checkCandidateStaffURL = async () => {
    if (!userID) {
      return;
    }
    if (isInstituteUser) {
      return;
    }
    let response;
    if (userTypeID == 91) {
      debugger;
      response = await agent.get(`${CheckCandidateURL}?candidateId=${userID}&pageCode=Category&userLoginId=${userLoginID}`);
    } else if (userTypeID == 95) {
      const payLoad = {
        staffID: userID,
        userLoginID: userLoginID,
        pageCode: 'Category',
        ipAddress: ipAddress

      }
      response = await agent.post(CheckStaffURL, payLoad);
    }

    let IsRightURL;
    let RightURL;
    if (response?.data?.Status == 'Success' && response?.data?.Data) {
      IsRightURL = response?.data?.Data?.IsRightURL;
      RightURL = response?.data?.Data?.RightURL;
    }
    if (IsRightURL === false && RightURL) {
      navigate(RightURL);
    }
  }

  // Enhanced form validation
  const validateForm = () => {
    const newErrors = {};

    // Basic required fields validation
    if (!formData.religionID || formData.religionID === "") {
      newErrors.religionID = "Religion is required";
    }

    if (!formData.categoryID || formData.categoryID === "") {
      newErrors.categoryID = "Caste Category is required";
    }

    //// Validate caste for specific categories if caste options are available
    //if (formData.categoryID && filteredCasteOptions.length > 0) {

    //    newErrors.casteID = 'Caste is required for selected category';
    //}

    // Validate domicile selection
    if (
      formData.isMHDomiciled === null ||
      formData.isMHDomiciled === undefined
    ) {
      newErrors.isMHDomiciled = "Maharashtra Domicile selection is required";
    }

    // Validate domicile certificate if Maharashtra domiciled is Yes
    // if (formData.isMHDomiciled === 1) {
    //   if (
    //     !files.domicileCertificatePath &&
    //     !filePaths.domicileCertificatePath
    //   ) {
    //     newErrors.domicileCertificatePath =
    //       "Domicile Certificate is required when you are Maharashtra domiciled";
    //   }
    // }

    // Validate leaving certificate (always required)
    if (!files.leavingCertificatePath && !filePaths.leavingCertificatePath) {
      newErrors.leavingCertificatePath = "Leaving Certificate is required";
    }

    // Validate caste certificate for specific categories
    // if (
    //   formData.categoryID &&
    //   ["2", "3", "4", "5", "6"].includes(formData.categoryID)
    // ) {
    //   if (!files.casteCertificatePath && !filePaths.casteCertificatePath) {
    //     newErrors.casteCertificatePath =
    //       "Caste Certificate is required for selected category";
    //   }
    // }

    // Validate NCL fields for OBC category
    if (formData.categoryID === "2") {
      if (
        formData.isBelongToNCL === null ||
        formData.isBelongToNCL === undefined
      ) {
        newErrors.isBelongToNCL = "NCL selection is required for OBC category";
      }

      // Validate NCL certificate if NCL is selected
      // if (formData.isBelongToNCL === 1) {
      //   if (!files.nclCertificatePath && !filePaths.nclCertificatePath) {
      //     newErrors.nclCertificatePath =
      //       "NCL Certificate is required when you belong to NCL";
      //   }
      // }
    }

    // Validate PWD selection
    if (
      formData.isBelongToPWD === null ||
      formData.isBelongToPWD === undefined
    ) {
      newErrors.isBelongToPWD = "PWD selection is required";
    }

    // Validate disability fields if PWD is selected
    if (formData.isBelongToPWD === 1) {
      if (
        !formData.disabilityPercentage ||
        formData.disabilityPercentage === ""
      ) {
        newErrors.disabilityPercentage = "Disability Percentage is required";
      }

      if (!formData.disabilityID || formData.disabilityID === "") {
        newErrors.disabilityID = "Disability Category is required";
      }

      if (!formData.disabilityType || formData.disabilityType.trim() === "") {
        newErrors.disabilityType = "Disability Type is required";
      }

      if (
        !formData.uniqueDisabilityIDNo ||
        formData.uniqueDisabilityIDNo.trim() === ""
      ) {
        newErrors.uniqueDisabilityIDNo =
          "Unique Disability ID Number is required";
      }

      if (!files.pwdCertificatePath && !filePaths.pwdCertificatePath) {
        newErrors.pwdCertificatePath = "Disability Certificate is required";
      }

      // Validate disability percentage format
      if (
        formData.disabilityPercentage &&
        !["40", "51", "61", "71", "81", "91"].includes(
          formData.disabilityPercentage,
        )
      ) {
        newErrors.disabilityPercentage =
          "Please select a valid disability percentage range";
      }

      // Validate disability ID number format (basic validation)
      if (
        formData.uniqueDisabilityIDNo &&
        formData.uniqueDisabilityIDNo.trim().length < 5
      ) {
        newErrors.uniqueDisabilityIDNo =
          "Disability ID Number should be at least 5 characters";
      }
    }

    setErrors(newErrors);

    // Scroll to first error if errors exist
    if (Object.keys(newErrors).length > 0) {
      setTimeout(() => {
        // Try to scroll to the first error field
        const firstErrorField = Object.keys(newErrors)[0];
        const errorElement = document.querySelector(
          `[name="${firstErrorField}"], #${firstErrorField}`,
        );
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
          errorElement.focus();
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }, 100);
    }

    return Object.keys(newErrors).length === 0;
  };

  // Function to upload files and get paths - optimized to upload in parallel
  const uploadFiles = async () => {
    const uploadedPaths = {};
    const uploadPromises = [];

    // Create array of file upload promises
    for (const [key, file] of Object.entries(files)) {
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("userID", userID);
        formData.append("fileType", key);

        // Push promise to array for parallel execution
        uploadPromises.push(
          agent
            .post(UploadFile, formData)
            .then((response) => {
              if (response.data.Status === "Success") {
                uploadedPaths[key] = response.data.Data.FilePath;
              }
              return { key, path: response.data.Data.FilePath };
            })
            .catch((error) => {
              console.error(`Error uploading ${key}:`, error);
              return { key, error };
            }),
        );
      }
    }

    // Wait for all uploads to complete in parallel
    if (uploadPromises.length > 0) {
      const results = await Promise.all(uploadPromises);

      // Process results
      results.forEach((result) => {
        if (!result.error && result.path) {
          uploadedPaths[result.key] = result.path;
        }
      });
    }

    return uploadedPaths;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Please correct all validation errors before submitting.",
        confirmButtonText: "OK",
      });
      return;
    }

    startLoading();
    setIsSubmitting(true);

    try {
      // Upload files first
      const uploadedPaths = await uploadFiles();

      // Prepare submit data
      const submitData = {
        [currentEndpoints.userTypeIDName]: parseInt(userID),
        NationalityID: parseInt(formData.nationalityID) || 77,

        // ✅ Leaving Certificate - Always required
        LeavingCertificatePath:
          uploadedPaths.leavingCertificatePath ||
          filePaths.leavingCertificatePath ||
          "",

        // ✅ MH Domicile
        IsMHDomiciled: formData.isMHDomiciled ? 1 : 0,
        DomicileCertificatePath: formData.isMHDomiciled
          ? uploadedPaths.domicileCertificatePath ||
          filePaths.domicileCertificatePath ||
          ""
          : "",

        // ✅ Religion
        ReligionID: parseInt(formData.religionID) || 1,

        // ✅ Category & Caste
        CategoryID: parseInt(formData.categoryID) || 1,
        CasteID:
          formData.categoryID && parseInt(formData.categoryID) !== 1
            ? formData.casteID
              ? parseInt(formData.casteID)
              : -1
            : -1,
        CasteCertificatePath:
          formData.categoryID && parseInt(formData.categoryID) !== 1
            ? uploadedPaths.casteCertificatePath ||
            filePaths.casteCertificatePath ||
            ""
            : "",

        // ✅ NCL
        IsBelongToNCL: formData.isBelongToNCL ? 1 : 0,
        NCLCertificatePath: formData.isBelongToNCL
          ? uploadedPaths.nclCertificatePath ||
          filePaths.nclCertificatePath ||
          ""
          : "",

        // ✅ PWD - FIX HERE
        IsBelongToPWD: formData.isBelongToPWD ? 1 : 0,
        DisabilityPercentage: formData.isBelongToPWD
          ? formData.disabilityPercentage
            ? parseInt(formData.disabilityPercentage)
            : 0
          : 0,
        DisabilityID: formData.isBelongToPWD
          ? formData.disabilityID
            ? parseInt(formData.disabilityID)
            : -1
          : -1, // ✅ Changed from 0 to -1
        DisabilityType: formData.isBelongToPWD
          ? formData.disabilityType || ""
          : "",
        UniqueDisabilityIDNo: formData.isBelongToPWD
          ? formData.uniqueDisabilityIDNo || ""
          : "",
        PWDCertificatePath: formData.isBelongToPWD
          ? uploadedPaths.pwdCertificatePath ||
          filePaths.pwdCertificatePath ||
          ""
          : "",

        UserLoginID: userLoginID,
        IPAddress: ipAddress,
        PageCode: "Category"
      };



      // Call the appropriate API based on user type
      const response = await agent.post(currentEndpoints.save, submitData);

      if (response.data.Status === "Success") {
        // Show success message
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: `${userType} category details saved successfully.`,
          confirmButtonText: "Continue",
        }).then((result) => {
          if (result.isConfirmed) {
            if (isInstituteUser && candidateIdFromUrl) {
              navigate(
                `/Candidate/LockApplicationForm?candidateId=${effectiveUserId}&applicationId=${applicationId}`,
              );
            } else {
              navigate(`/${userType}/Qualification`);
            }
          }
        });

        // Update file paths with uploaded ones
        setFilePaths((prev) => ({
          ...prev,
          ...uploadedPaths,
        }));

        // Clear file states as they're now uploaded
        setFiles({
          leavingCertificatePath: null,
          domicileCertificatePath: null,
          casteCertificatePath: null,
          nclCertificatePath: null,
          pwdCertificatePath: null,
        });
      } else {
        // Show error message
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response.data.Message || "Failed to save category details.",
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);

      // Show error message
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while saving the data. Please try again.",
      });
    } finally {
      stopLoading();
      setIsSubmitting(false);
    }
  };

  // Reset form
 const handleReset = () => {
    Swal.fire({
        title: "Reset Form?",
        text: "This will reset all changes. Are you sure?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, reset it!",
    }).then((result) => {
        if (result.isConfirmed) {

            // Clear validation errors
            setErrors({});

            // Reset ALL form fields
            setFormData({
                [currentEndpoints.userTypeIDName]: userID || 0,
                nationalityID: 77,
                isMHDomiciled: null,
                religionID: "",
                categoryID: "",
                casteID: "",
                isBelongToNCL: null,
                isBelongToPWD: null,
                disabilityPercentage: "",
                disabilityID: "",
                disabilityType: "",
                uniqueDisabilityIDNo: "",
                UserLoginID: userLoginID || "",
                IPAddress: ipAddress,
                PageCode: "Category",
            });

            // Clear files
            setFiles({
                leavingCertificatePath: null,
                domicileCertificatePath: null,
                casteCertificatePath: null,
                nclCertificatePath: null,
                pwdCertificatePath: null,
            });

            // Clear displayed file paths
            setFilePaths({
                leavingCertificatePath: "",
                domicileCertificatePath: "",
                casteCertificatePath: "",
                nclCertificatePath: "",
                pwdCertificatePath: "",
            });

            // Clear filtered caste
            setFilteredCasteOptions([]);

            Swal.fire(
                "Reset!",
                "Form has been reset.",
                "success"
            );
        }
    });
};

  // Options for disability percentage dropdown
  const disabilityPercentageOptions = [
    { value: "40", label: "40-50%" },
    { value: "51", label: "51-60%" },
    { value: "61", label: "61-70%" },
    { value: "71", label: "71-80%" },
    { value: "81", label: "81-90%" },
    { value: "91", label: "91-100%" },
  ];

  return (
    <div className="mx-auto w-full rounded-lg bg-white p-6 shadow-md">
      <div>
        <ProgressTracker />
      </div>

      <fieldset className="mb-4 rounded-md border p-4">
        <legend
          className={`flex ${color} items-center text-base font-semibold text-white border-2 border-gray-300 px-3 py-1.5 rounded-md ml-4`}
        >
          Category Details
        </legend>

        <form onSubmit={handleSubmit} className="mt-4">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Nationality - Disabled field */}
            <FormComponent
              label="Nationality"
              value="India"
              onChange={() => { }}
              error={errors.nationalityID}
              required={true}
              disabled={true}
            />

            {/* Upload Leaving Certificate */}
            <div>
              <label className="font-normal">
                Upload Leaving Certificate{" "}
                <span className="text-red-500">*</span>
              </label>
              <UploadPdf
                file={files.leavingCertificateFileName || ""}
                onFileChange={(fileData) =>
                  handleFileChange("leavingCertificatePath", fileData)
                }
                buttonText="Upload"
                buttonClassName="bg-[#00c3f9]"
                label="Upload Leaving Certificate"
                required={true}
                showLabel={false}
                  allowedFileTypes="pdf, jpg, png"
                maxFileSize="5 MB"
                userTypeId={userTypeID}
                userLoginID={userLoginID}
                linkName="View Leaving Certificate"
                uniquefilepath={filePaths.leavingCertificatePath || ""}
                id="leavingCertificateUpload"
              />
              {errors.leavingCertificatePath && (
                <span className="ml-1 text-sm text-red-500">
                  {errors.leavingCertificatePath}
                </span>
              )}
            </div>

            {/* Maharashtra Domiciled */}
            <fieldset>
              <legend className="font-normal">
                Are you Maharashtra Domiciled?{" "}
                <span className="text-red-500">*</span>
              </legend>
              <div className="mt-2 flex items-center gap-6">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="isMHDomiciled"
                    value="1"
                    checked={formData.isMHDomiciled === 1}
                    onChange={() => handleChange("isMHDomiciled", 1)}
                    className="mr-2 w-5 h-5"
                  />
                  Yes
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="isMHDomiciled"
                    value="0"
                    checked={formData.isMHDomiciled === 0}
                    onChange={() => handleChange("isMHDomiciled", 0)}
                    className="mr-2 w-5 h-5"
                  />
                  No
                </label>
                {/*<label className="flex items-center">*/}
                {/*    <input*/}
                {/*        type="radio"*/}
                {/*        name="isMHDomiciled"*/}
                {/*        value="2"*/}
                {/*        checked={formData.isMHDomiciled === 2}*/}
                {/*        onChange={() => handleChange('isMHDomiciled', 2)}*/}
                {/*        className="mr-2 w-5 h-5"*/}
                {/*    />*/}
                {/*    Not Applicable*/}
                {/*</label>*/}
              </div>
              {errors.isMHDomiciled && (
                <span className="ml-1 text-sm text-red-500">
                  {errors.isMHDomiciled}
                </span>
              )}
            </fieldset>

            {/* Upload Domicile Certificate - Show only if Maharashtra Domiciled is Yes */}
            {formData.isMHDomiciled === 1 && (
              <div>
                <label className="font-normal">
                  Upload Domicile Certificate{" "}
                  {/* <span className="text-red-500">*</span> */}
                </label>
                <UploadPdf
                  file={files.domicileCertificateFileName || ""}
                  onFileChange={(fileData) =>
                    handleFileChange("domicileCertificatePath", fileData)
                  }
                  buttonText="Upload"
                  buttonClassName="bg-[#00c3f9]"
                  label="Upload Domicile Certificate"
                  //required={true}
                  showLabel={false}
                   allowedFileTypes="pdf, jpg, png"
                  maxFileSize="5 MB"
                  userTypeId={userTypeID}
                  userLoginID={userLoginID}
                  linkName="View Domicile Certificate"
                  uniquefilepath={filePaths.domicileCertificatePath || ""}
                  id="domicileCertificateUpload"
                />
                {/* {errors.domicileCertificatePath && (
                  <span className="ml-1 text-sm text-red-500">
                    {errors.domicileCertificatePath}
                  </span>
                )} */}
              </div>
            )}

            {/* Religion */}
            <DropdownComponent
              label="Religion"
              value={formData.religionID}
              onChange={(value) => handleChange("religionID", value)}
              options={dropdownOptions.religion}
              error={errors.religionID}
              required={true}
              placeholder="-- Select Religion --"
            />

            {/* Caste Category */}
            <DropdownComponent
              label="Caste Category"
              value={formData.categoryID}
              onChange={(value) => handleChange("categoryID", value)}
              options={dropdownOptions.category}
              error={errors.categoryID}
              required={true}
              placeholder="-- Select Caste Category --"
            />

            {/* Upload Caste Certificate - Show only for specific categories */}
            {formData.categoryID &&
              ["2", "3", "4", "5", "6"].includes(formData.categoryID) && (
                <div>
                  <label className="font-normal">
                    Upload Caste Certificate{" "}
                    {/* <span className="text-red-500">*</span> */}
                  </label>
                  <UploadPdf
                    file={files.casteCertificateFileName || ""}
                    onFileChange={(fileData) =>
                      handleFileChange("casteCertificatePath", fileData)
                    }
                    buttonText="Upload"
                    buttonClassName="bg-[#00c3f9]"
                    label="Upload Caste Certificate"
                    //required={true}
                    showLabel={false}
                    allowedFileTypes="pdf"
                    maxFileSize="5 MB"
                    userTypeId={userTypeID}
                    userLoginID={userLoginID}
                    linkName="View Caste Certificate"
                    uniquefilepath={filePaths.casteCertificatePath || ""}
                    id="casteCertificateUpload"
                  />
                  {errors.casteCertificatePath && (
                    <span className="ml-1 text-sm text-red-500">
                      {errors.casteCertificatePath}
                    </span>
                  )}
                </div>
              )}

            {/* NCL Section - Show only for OBC category (CategoryID = 2) */}
            {formData.categoryID === "2" && (
              <>
                <fieldset>
                  <legend className="font-normal">
                    Do you belong to Non-Creamy Layer (NCL)?{" "}
                    <span className="text-red-500">*</span>
                  </legend>
                  <div className="mt-2 flex items-center gap-6">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="isBelongToNCL"
                        value="1"
                        checked={formData.isBelongToNCL === 1}
                        onChange={() => handleChange("isBelongToNCL", 1)}
                        className="mr-2 w-5 h-5"
                      />
                      Yes
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="isBelongToNCL"
                        value="0"
                        checked={formData.isBelongToNCL === 0}
                        onChange={() => handleChange("isBelongToNCL", 0)}
                        className="mr-2 w-5 h-5"
                      />
                      No
                    </label>
                  </div>
                  {errors.isBelongToNCL && (
                    <span className="ml-1 text-sm text-red-500">
                      {errors.isBelongToNCL}
                    </span>
                  )}
                </fieldset>

                {/* Upload NCL Certificate - Show only if NCL is Yes */}
                {formData.isBelongToNCL === 1 && (
                  <div>
                    <label className="font-normal">
                      Upload NCL Certificate{" "}
                      {/* <span className="text-red-500">*</span> */}
                    </label>
                    <UploadPdf
                      file={files.nclCertificateFileName || ""}
                      onFileChange={(fileData) =>
                        handleFileChange("nclCertificatePath", fileData)
                      }
                      buttonText="Upload"
                      buttonClassName="bg-[#00c3f9]"
                      label="Upload NCL Certificate"
                      //required={true}
                      showLabel={false}
                      allowedFileTypes="pdf"
                      maxFileSize="5 MB"
                      userTypeId={userTypeID}
                      userLoginID={userLoginID}
                      linkName="View NCL Certificate"
                      uniquefilepath={filePaths.nclCertificatePath || ""}
                      id="nclCertificateUpload"
                    />
                    {errors.nclCertificatePath && (
                      <span className="ml-1 text-sm text-red-500">
                        {errors.nclCertificatePath}
                      </span>
                    )}
                  </div>
                )}
              </>
            )}

            {/* PWD Section */}
            <div className="md:col-span-2 flex justify-center">
              <fieldset className="w-full max-w-xl">
                <div className="flex flex-col items-center">
                  <legend className="mb-2 font-normal text-center">
                    Do you belong to Person with Disability (PWD) Category?{" "}
                    <span className="text-red-500">*</span>
                  </legend>

                  <div className="flex items-center justify-center gap-8">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="isBelongToPWD"
                        value="1"
                        checked={formData.isBelongToPWD === 1}
                        onChange={() => handleChange("isBelongToPWD", 1)}
                        className="mr-2 h-5 w-5"
                      />
                      Yes
                    </label>

                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="isBelongToPWD"
                        value="0"
                        checked={formData.isBelongToPWD === 0}
                        onChange={() => handleChange("isBelongToPWD", 0)}
                        className="mr-2 h-5 w-5"
                      />
                      No
                    </label>
                  </div>

                  {errors.isBelongToPWD && (
                    <p className="mt-1 text-sm text-red-500 text-center">
                      {errors.isBelongToPWD}
                    </p>
                  )}
                </div>
              </fieldset>
            </div>

            {/* PWD Details - Show only if PWD is Yes */}
            {formData.isBelongToPWD === 1 && (
              <>
                {/* Disability Percentage */}
                <DropdownComponent
                  label="Disability Percentage"
                  value={formData.disabilityPercentage}
                  onChange={(value) =>
                    handleChange("disabilityPercentage", value)
                  }
                  options={disabilityPercentageOptions}
                  error={errors.disabilityPercentage}
                  required={true}
                  placeholder="-- Select Disability Percentage --"
                />

                {/* Disability Category */}
                <DropdownComponent
                  label="Disability Category"
                  value={formData.disabilityID}
                  onChange={(value) => handleChange("disabilityID", value)}
                  options={dropdownOptions.disability}
                  error={errors.disabilityID}
                  required={true}
                  placeholder="-- Select Disability Category --"
                />

                {/* Disability Type */}
                <FormComponent
                  label="Disability Type"
                  value={formData.disabilityType}
                  onChange={(value) => handleChange("disabilityType", value)}
                  error={errors.disabilityType}
                  required={true}
                  placeholder="Enter disability type"
                />

                {/* Unique Disability ID Number */}
                <FormComponent
                  label="Unique Disability ID Number"
                  value={formData.uniqueDisabilityIDNo}
                  onChange={(value) =>
                    handleChange("uniqueDisabilityIDNo", value)
                  }
                  error={errors.uniqueDisabilityIDNo}
                  required={true}
                  placeholder="Enter unique disability ID number"
                />

                {/* Upload PWD Certificate */}
                <div>
                  <label className="font-normal">
                    Upload Disability Certificate{" "}
                    <span className="text-red-500">*</span>
                    {errors.pwdCertificatePath && (
                      <span className="ml-1 text-sm text-red-500">
                        {errors.pwdCertificatePath}
                      </span>
                    )}
                  </label>
                  <UploadPdf
                    file={files.pwdCertificateFileName || ""}
                    onFileChange={(fileData) =>
                      handleFileChange("pwdCertificatePath", fileData)
                    }
                    buttonText="Upload"
                    buttonClassName="bg-[#00c3f9]"
                    label="Upload Disability Certificate"
                    required={true}
                    showLabel={false}
                    allowedFileTypes="pdf"
                    maxFileSize="5 MB"
                    userTypeId={userTypeID}
                    userLoginID={userLoginID}
                    linkName="View Disability Certificate"
                    uniquefilepath={filePaths.pwdCertificatePath || ""}
                    id="pwdCertificateUpload"
                  />
                </div>
              </>
            )}
          </div>

          {/* Form Actions */}
          <div className="mt-8 flex justify-center gap-4">
            <button
              type="button"
              onClick={handleReset}
              disabled={isLoading || isSubmitting}
              className="rounded-md bg-red-500 px-4 py-2 text-white hover:bg-gray-300"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={isLoading || isSubmitting}
              className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-600"
            >
              {isSubmitting ? "Saving..." : "Save & Next"}
            </button>
          </div>
        </form>
      </fieldset>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="rounded-lg bg-white p-6 text-center">
            <div className="mb-4">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            </div>
            <p className="text-lg font-medium">Loading...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryDetailsForm;
