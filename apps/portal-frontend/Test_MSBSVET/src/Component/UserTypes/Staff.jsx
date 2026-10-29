import { useState, useRef, useEffect, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import FormComponent from "../formcomponent/FormComponent";
import FormComponent2 from "../formcomponent/FormComponent";
import DropdownComponent from "../formcomponent/DropdownComponent";
import SecurityQuestion from "../formcomponent/SecurityQuestion";
import CaptchaComponent from "../formcomponent/CaptchaComponent";
import { MdOutlinePersonAdd } from "react-icons/md";
import Swal from "sweetalert2";
import { AiOutlineCheckCircle } from "react-icons/ai";
import ProgressTracker from "../Login/CandidateAndStaff/ProgressTracker";
import { StaffRegistration } from "../../Endpoints_All/Registration/registration";
import {
  SaveStaffPrimary,
  GetStaffPrimary,
} from "../../Endpoints_All/Staff/primary";
import {
  GetCandidatePrimary,
  SaveCandidatePrimary,
} from "../../Endpoints_All/Candidate/primary";
import {
  verify_otp,
  send_otp,
  resend_otp,
  save_otp_status,
  check_duplicate_mobile,
  IsStaffAlreadyRegisteredUsingThisMobileNo,
} from "../../Endpoints_All/OTP/otp";
import {
  aadhaarVerification,
  getGender,
  IsCandidateAadharNoDuplicate,
  IsStaffAadharNoDuplicate,
} from "../../Endpoints_All/Base/masterData";
import { useLoading } from "../../Hooks/useLoading";
import UploadPhoto from "../formcomponent/UploadPhoto";
import UploadPdf from "../formcomponent/UploadPdf";
import { DateInput } from "../formcomponent/DateInputComponent";
import agent from "../../lib/api/agent";
import axios from "axios";
import publicAgent from "../../lib/api/publicAgent";
import AadhaarVerificationModal from "../formcomponent/AadhaarVerificationPopup";
import VerifiedIcon from "../../assets/VerifiedIcon.jpg";
import { getDeviceIP } from "../../utils/CommonHelper";
import { useAuth } from "../../Hooks/AuthContext";
import { ThemeContext } from "../../Component/Context/ThemeContext";
import Captcha from "../base/Captcha";
import SampleAadhaarCard from "../../assets/SampleAadhaarCard.png"

const Staff = () => {
  // Initial form state - moved to a constant for reuse in reset
  const initialFormState = {
    firstName: "",
    middleName: "",
    lastName: "",
    dob: "",
    gender: "",
    email: "",
    aadhaarNo: "",
    primaryMobile: "",
    secondaryMobile: "",
    itiRegistered: "",
    registrationNumber: "",
    dobFile: "",
    PhotoFilePath: "",
    SignFilePath: "",
    DOBFilePath: "",
    AadhaarFilePath: "",
  };
  const navigate = useNavigate();
  const { userInfo } = useAuth();
  const { color } = useContext(ThemeContext);
  const [profileData, setProfileData] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [genderOptions, setGenderOptions] = useState([]);
  const [isVerified, setIsVerified] = useState(false);
  const [errors, setErrors] = useState({});
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const SecurityQuestionRef = useRef(null);
  const CaptchaRef = useRef();
  const [userData, setUserData] = useState({
    profileId: null,
    isLoggedIn: false,
  });
  const [isStaff, setIsStaff] = useState(false);
  const [isCandidate, setIsCandidate] = useState(false);
  // Initialize useLoading hook
  const [otpLoading, setOtpLoading] = useState(false);
  const [currentOtp, setCurrentOtp] = useState(null);
  const [otpAttempts, setOtpAttempts] = useState(0);
  const { startLoading, stopLoading, isLoading } = useLoading();
  const [resendCooldown, setResendCooldown] = useState(0);
  const [ipAddress, setIpAddress] = useState("");

  const [isAadhaarDuplicate, setIsAadhaarDuplicate] = useState(false);
  const [checkingAadhaar, setCheckingAadhaar] = useState(false);
  const [isAadhaarVerified, setIsAadhaarVerified] = useState(false);
  const [aadhaarVerifying, setAadhaarVerifying] = useState(false);
  const [showAadhaarModal, setShowAadhaarModal] = useState(false);
  const [verifiedMobile, setVerifiedMobile] = useState("");
  const [searchParams] = useSearchParams();
  const applicationId = searchParams.get("applicationId");

  const candidateIdFromUrl = searchParams.get("candidateId");

  // Role mapping for easier maintenance
  const [roleMapping] = useState({
    1: "Head of Institute",
    2: "Trainer",
    3: "Assessor",
    4: "Subject Expert",
    11: "Office Staff",
    12: "Management",
  });
  const effectiveCandidateId =
    Number(userInfo?.UserTypeID) === 61
      ? candidateIdFromUrl
      : userInfo?.UserID;
  const userTypeID = userInfo?.UserTypeID;
  const userType =
    userTypeID === 91 || userTypeID === 61 ? "Candidate" : "Staff";

  const isInstituteUser = Number(userInfo?.UserTypeID) === 61;

  const disableAadhaarFields = (isInstituteUser && isAadhaarVerified) || isAadhaarVerified;

  const disableMobileField = isVerified && !isInstituteUser;

  useEffect(() => {
    fetchIP();
  }, []);

  // Safe AI Assistant Autofill event listener for Staff Registration
  useEffect(() => {
    const handleAutofill = (e) => {
      if (e && e.detail) {
        const d = e.detail;
        setFormData((prev) => ({
          ...prev,
          ...(d.firstName && { firstName: d.firstName }),
          ...(d.middleName && { middleName: d.middleName }),
          ...(d.lastName && { lastName: d.lastName }),
          ...(d.email && { email: d.email }),
          ...(d.primaryMobile && { primaryMobile: d.primaryMobile }),
          ...(d.secondaryMobile && { secondaryMobile: d.secondaryMobile }),
          ...(d.dob && { dob: d.dob }),
          ...(d.gender && { gender: d.gender }),
        }));
        setErrors((prev) => {
          const next = { ...prev };
          if (d.firstName) delete next.firstName;
          if (d.middleName) delete next.middleName;
          if (d.lastName) delete next.lastName;
          if (d.email) delete next.email;
          if (d.primaryMobile) delete next.primaryMobile;
          if (d.secondaryMobile) delete next.secondaryMobile;
          if (d.dob) delete next.dob;
          if (d.gender) delete next.gender;
          return next;
        });
      }
    };
    window.addEventListener("msbsvet:autofill", handleAutofill);
    return () => window.removeEventListener("msbsvet:autofill", handleAutofill);
  }, []);

  useEffect(() => {
    agent
      .get(getGender)
      .then((response) => {
        // Convert API response to match the DropdownComponent format
        const formattedGenders = response.data.map((g) => ({
          value: g.GenderCode, // API field for gender code
          label: g.Gender, // API field for gender name
        }));
        setGenderOptions(formattedGenders);
      })
      .catch((error) => {
        console.error("Error fetching genders:", error);
        // Use a default set of gender options if API fails
      });
  }, []);

  // OTP Configuration
  const OTP_CONFIG = {
    MAX_ATTEMPTS: 3,
    RESEND_COOLDOWN: 60, // 60 seconds
    OTP_EXPIRY: 300, // 5 minutes
    MAX_RESEND_ATTEMPTS: 5,
  };

  //check for localStorage
  useEffect(() => {
    if (!userInfo?.UserLoginID || !userInfo?.IsLoginAllowed) return;

    try {
      setUserData({
        profileId: userInfo?.UserLoginID,
        isLoggedIn: userInfo?.IsLoginAllowed
      });

      if (Number(userInfo?.UserTypeID) === 61 && candidateIdFromUrl) {
        setIsCandidate(true);
        fetchProfileDataForCandidate(candidateIdFromUrl);
      } else if (
        userInfo?.UserLoginID.includes("S") &&
        userInfo?.UserLoginID.length === 13
      ) {
        setIsStaff(true);
        fetchProfileData(userInfo.UserLoginID);
      } else if (userInfo?.UserLoginID.includes("C")) {
        setIsCandidate(true);
        fetchProfileDataForCandidate(userInfo.UserLoginID);
      } else if (candidateIdFromUrl) {
        setIsCandidate(true);
        fetchProfileDataForCandidate(candidateIdFromUrl);
      }
    } catch (err) {
      console.error("Error loading profile data:", err);
    }
  }, [userInfo, candidateIdFromUrl]);

  const fetchIP = async () => {
    try {
      const ip = await getDeviceIP();
      setIpAddress(ip);
    } catch (error) {
      console.error("Error fetching IP:", error);
    }
  };

  // Fetch staff data
  const fetchProfileData = async (profileId) => {
    try {
      const staffId = profileId?.slice(-6);
      const requestBody = {
        StaffID: parseInt(staffId, 10) || 0,
        UserLoginID: "string",
        PageCode: "Primary",
        IPAddress: ipAddress,
      };
      const response = await agent.post(GetStaffPrimary, requestBody, {
        headers: { "Content-Type": "application/json" },
      });

      const staffData = response.data.Data;


      if (!staffData) {
        console.error("No data returned from API");
        return;
      }

      // Create a mapping from role names to IDs
      const roleNameToIdMap = {
        "Head of Institute": 1,
        Trainer: 2,
        Assessor: 3,
        "Subject Expert": 4,
        "Office Staff": 11,
        Management: 12,
      };

      // Convert job role data to proper format - store full objects
      const jobRoles =
        staffData.ListJobRole?.map((role) => {
          const roleId = role.ID || roleNameToIdMap[role.JobRoleName];
          return {
            ID: Number(roleId),
            JobRoleName: role.JobRoleName || roleMapping[roleId],
          };
        }).filter((role) => role.ID && role.JobRoleName) || [];

      // Update profile data in state
      setProfileData({
        ...staffData,
        jobRoles: jobRoles,
      });

      // Update form data with the job roles as objects
      setFormData((prevState) => ({
        ...prevState,
        jobRoles: jobRoles, // Store as array of objects
        DOBFilePath: staffData.DOBFilePath || "",
        AadhaarFilePath: staffData.AadhaarFilePath || "",
        PhotoFilePath: staffData.PhotoFilePath || "",
        SignFilePath: staffData.SignFilePath || "",
      }));
    } catch (err) { }
  };

  const handleAadhaarFormSync = (verifiedData) => {
    // Lock main form with verified values
    setFormData((prev) => ({
      ...prev,
      firstName: verifiedData.firstName,
      middleName: verifiedData.middleName,
      lastName: verifiedData.lastName,
      dob: verifiedData.dob, // "DD/MM/YYYY"
      gender: verifiedData.gender, // "M" | "F" | "T"
      aadhaarNo: verifiedData.aadhaarNo,
    }));
    setIsAadhaarVerified(true);
    setShowAadhaarModal(false);
  };

  // FOR CANDIDATE
  const fetchProfileDataForCandidate = async (profileId) => {
    try {
      let candidateId;
      if (profileId.length >= 13) {
        // candidateId = profileId?.slice(-6);
        if (userInfo?.UserTypeID == 91) {
          candidateId = userInfo?.UserID;
        }
      } else {
        candidateId = profileId;
      }

      const response = await agent.get(
        `${GetCandidatePrimary}?candidateId=${candidateId}`,
      );
      const candidateData = response.data.Data;
      if (!candidateData) {
        console.error("No data returned from API");
        return;
      }

      // Update profile data in state
      setProfileData({
        ...candidateData,
      });

      // Also update form data with the job roles
      setFormData((prevState) => ({
        ...prevState,
        DOBFilePath: candidateData.DOBFilePath || "",
        AadhaarFilePath: candidateData.AadhaarFilePath || "",
        PhotoFilePath: candidateData.PhotoFilePath || "",
        SignFilePath: candidateData.SignFilePath || "",
      }));
    } catch (err) { }
  };

  // Simple parsing for any format to YYYY-MM-DD for input
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";

    // If it's in ISO format with T (from API)
    if (dateString.includes("T")) {
      return dateString.split("T")[0]; // Just return the date part
    }

    // If it's in DD/MM/YYYY format
    if (dateString.includes("/")) {
      const [day, month, year] = dateString.split("/");
      return `${year}-${month}-${day}`;
    }

    return dateString; // Return as-is if it's neither format
  };

  const formatDateToDDMMYYYY = (dateString) => {
    if (!dateString) return "";

    if (dateString.includes("/")) {
      const [dd, mm, yyyy] = dateString.split("/").map(Number);
      const date = new Date(yyyy, mm - 1, dd);
      if (
        date.getFullYear() === yyyy &&
        date.getMonth() === mm - 1 &&
        date.getDate() === dd
      ) {
        return dateString;
      }
    }

    // Fallback for other formats
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Update formData when profileData changes
  useEffect(() => {
    if (profileData) {
      setFormData((prevState) => ({
        ...prevState,
        firstName: profileData.FirstName || "",
        middleName: profileData.MiddleName || "",
        lastName: profileData.LastName || "",
        dob: formatDateToDDMMYYYY(profileData.DOB) || "", // Formatted DOB is now directly set
        gender: profileData.GenderCode || "",
        email: profileData.EMailID || "",
        primaryMobile: profileData.MobileNo || "",
        secondaryMobile: profileData.AltMobileNo || "",
        aadhaarNo: profileData.AadhaarNo || "",
        userLoginID: profileData.UserLoginID || "",
        jobRoles: profileData.ListJobRole || [] // Update job roles in formData

      }));
      setIsAadhaarVerified(
        profileData?.IsAadhaarVerified === true ||
        profileData?.IsAadhaarVerified === 1 ||
        profileData?.IsAadhaarVerified === "1" ||
        profileData?.IsAddhareVerify === true ||
        profileData?.IsAddhareVerify === 1 ||
        profileData?.IsAddhareVerify === "1"
      );

      if (profileData.MobileNo) {
        setIsVerified(true);
      }
    }
  }, [profileData]); // Only runs when profileData updates

  const handleJobRoleChange = (e) => {
    const { value, checked } = e.target;
    const roleId = Number(value);
    const roleName = roleMapping[roleId];

    setFormData((prevState) => {
      const currentRoles = prevState.jobRoles || [];

      if (checked) {
        // Add role as an object
        return {
          ...prevState,
          jobRoles: [...currentRoles, { ID: roleId, JobRoleName: roleName }],
        };
      } else {
        // Remove role by ID
        return {
          ...prevState,
          jobRoles: currentRoles.filter((role) => {
            const id = typeof role === "object" ? role.ID : role;
            return id !== roleId;
          }),
        };
      }
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prevState) => {
      if (type === "checkbox" && name === "jobRole") {
        const updatedRoles = checked
          ? [...(prevState.jobRoles ?? []), value] // Ensure jobRoles exists
          : (prevState.jobRoles ?? []).filter((role) => role !== value);

        return { ...prevState, jobRoles: updatedRoles };
      }
      return { ...prevState, [name]: value };
    });

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }));
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData(initialFormState);
    setIsVerified(false);
    setErrors({});
    setCaptchaVerified(false);
    if (SecurityQuestionRef.current) {
      SecurityQuestionRef.current.resetForm(); // Change this line - use resetForm instead of reset
    }
    if (CaptchaRef.current) {
      CaptchaRef.current.refresh(); // Changed from reset to resetCaptcha
    }
  };

  // Form Validation
  // Enhanced validation function that maintains your existing structure
  const validateForm = () => {
    let newErrors = {};

    // Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required.";
    }

    // Date of birth validation
    if (!formData.dob) {
      newErrors.dob = "Date of birth is required.";
    }

    // Gender validation
    if (!formData.gender) {
      newErrors.gender = "Gender selection is required.";
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required.";
    } else if (
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)
    ) {
      newErrors.email = "Enter a valid email address.";
    }

    // Aadhaar number validation
    if (!formData.aadhaarNo) {
      newErrors.aadhaarNo = "Aadhaar number is required.";
    } else if (!/^\d{12}$/.test(formData.aadhaarNo)) {
      newErrors.aadhaarNo = "Aadhaar number must be exactly 12 digits.";
    }
    if (!isAadhaarVerified) {
      newErrors.aadhaarNo = "Please verify Aadhaar number.";
    }

    // Mobile number validation
    if (!formData.primaryMobile || formData.primaryMobile.length !== 10) {
      newErrors.primaryMobile = "Please enter a valid 10-digit mobile number.";
    }

    // Mobile verification check
    if (!isVerified && (userTypeID != 91 && userTypeID != 61 && userTypeID != 95)) {
      newErrors.primaryMobile = "Please verify your mobile number.";
    }

    // Secondary mobile validation (if provided)
    if (formData.secondaryMobile && formData.secondaryMobile.length !== 10) {
      newErrors.secondaryMobile =
        "Please enter a valid 10-digit mobile number.";
    }

    // Photo validation
    if (!formData.PhotoFilePath) {
      newErrors.PhotoFilePath = "Photo is required.";
    }

    // Signature validation
    if (!formData.SignFilePath) {
      newErrors.SignFilePath = "Signature is required.";
    }

    // Aadhaar upload validation
    if (!formData.AadhaarFilePath) {
      newErrors.AadhaarFilePath = "Aadhaar card upload is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  /// Modified handleSubmit function to better handle validation results
  const handleSubmit = async (e) => {
    e.preventDefault();

    // First validate the form fields
    const isFormValid = validateForm();

    // Then validate security question component
    const isSecurityValid = SecurityQuestionRef.current?.validateSecurity();
    const securityDetails = SecurityQuestionRef.current?.getSecurityDetails();

    // Finally validate captcha
    const captchaIsValid = await CaptchaRef.current?.validate();
    setCaptchaVerified(captchaIsValid);

    if (!captchaIsValid) {
      setErrors((prev) => ({
        ...prev,
        captcha: "Please complete the CAPTCHA verification.",
      }));
      setTimeout(() => {
        CaptchaRef.current?.refresh();
      }, 1000);
    }

    // If any validation fails, show error message and return
    if (!isFormValid || !isSecurityValid || !captchaIsValid) {
      // Get all error messages for display
      //const errorMessages = Object.values(errors).filter(Boolean);

      // Display validation errors
      Swal.fire({
        title: "Validation Error",
        text: "Please check the form and fill in all required fields correctly.",
        icon: "error",
        confirmButtonText: "OK",
      });

      return;
    }

    // Get candidate ID if available
    const candidateId = userData.profileId
      ? parseInt(userData.profileId.replace(/\D/g, ""))
      : 0;
    //const candidateId = parseInt(userInfo.UserID);

    // Prepare data for API submission
    const submissionData = {
      entity: formData.entity || "Staff",
      ITIRegistrationNo:
        formData.itiRegistered === "yes" ? formData.registrationNumber : "",
      FirstName: formData.firstName,
      MiddleName: formData.middleName,
      LastName: formData.lastName,
      GenderCode: formData.gender,
      AadhaarNo: formData.aadhaarNo,

      // Change the date format to ISO format (YYYY-MM-DD)
      DOB: formData.dob.includes("-")
        ? formData.dob // If it's already in YYYY-MM-DD format, keep it
        : formData.dob.split("/").reverse().join("-"), // If it's in DD/MM/YYYY format, convert to YYYY-MM-DD

      MobileNo: formData.primaryMobile,
      AltMobileNo: formData.secondaryMobile || "",
      EMailID: formData.email,
      SecurityQuestionID: userData.isLoggedIn
        ? 0
        : securityDetails.securityQuestionId,
      SecurityQuestionAnswer: userData.isLoggedIn
        ? ""
        : securityDetails.securityAnswer,
      Password: userData.isLoggedIn ? "" : securityDetails.password,
      UserLoginID: "",
      IPAddress: ipAddress,
      PageCode: "primary",
      IsAdmissionDataFetch: 0,

      ListJobRole: (formData.jobRoles || []).map((role) => {
        const roleId = typeof role === "object" ? role.ID : parseInt(role);
        return {
          ID: roleId,
          CandidateID: parseInt(candidateId),
          JobRoleName: roleMapping[roleId] || (typeof role === "object" ? role.JobRoleName : `Role ${role}`),
        };
      }),

      JobRole: (formData.jobRoles || [])
        .map((role) => (typeof role === "object" ? role.JobRoleName : roleMapping[parseInt(role)]))
        .join(", "),

      DOBFilePath: formData.DOBFilePath, // Correct Azure URL string
      AadhaarFilePath: formData.AadhaarFilePath, // Correct Azure URL string
      PhotoFilePath: formData.PhotoFilePath, // Correct Azure URL string
      SignFilePath: formData.SignFilePath,
      IsAddhareVerify: isAadhaarVerified ? 1 : 0,
    };

    try {
      // Show loading state
      Swal.fire({
        title: "Submitting...",
        text: "Please wait while we process your registration",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // API call to submit data
      const response = await agent.post(StaffRegistration, submissionData, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        timeout: 30000, // 30 seconds timeout
      });

      // Close loading dialog
      Swal.close();

      if (
        response.data.success ||
        response.status === 200 ||
        response.status === 201
      ) {
        Swal.fire({
          title: "Registration Successful!",
          text: "Your details have been submitted successfully.",
          icon: "success",
          confirmButtonText: "OK",
        }).then((result) => {
          if (result.isConfirmed) {
            // Reset form
            resetForm();
            if (SecurityQuestionRef.current) {
              SecurityQuestionRef.current.resetForm();
            }

            // Navigate to AfterRegister page with profileId
            navigate("/after-register", {
              state: { profileId: response.data.Data },
            });
          }
        });
      }
    } catch (error) {
      // Add this to see more details about the error
      if (error.response) {
      }

      Swal.fire({
        title: "Submission Error",
        text:
          error.response?.data?.message ||
          "Failed to submit. Please try again later.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const handleSave = () => {
    // Check user type and call appropriate save method
    if (userTypeID == 91 || userTypeID == 61) {
      handleSaveForCandidate();
    } else if (userTypeID == 95) {
      handleSaveForStaff();
    }
  };
  const checkAadhaarVerified = async (candidateId, candidateData) => {
    try {
      const payload = {
        CandidateId: candidateId, // was: candidateId
        FirstName: candidateData.firstName,
        FatherName: candidateData.middleName || "",
        LastName: candidateData.lastName, // was: lastName
        Dob: candidateData.dob,
        Gender: candidateData.gender,
        AadhaarNo: candidateData.aadhaarNo,
        UserLoginId: candidateData.userLoginID || "",
      };

      const response = await publicAgent.post(aadhaarVerification, payload);
      return response.data;
    } catch (error) { }
  };
  const checkAadharDuplicate = async (aadhaarNo, staffId) => {
    try {
      const response = await agent.get(
        `${IsStaffAadharNoDuplicate}?AadharNo=${aadhaarNo}&StaffID=${0}`,
      );

      const data = response.data?.Data;
      if (!Array.isArray(data) || data.length === 0) {
        return { isDuplicate: false };
      }
      const hasDuplicate = data.find(
        (item) =>
          item &&
          Object.values(item).some(
            (value) => value !== null && value !== undefined && value !== "",
          ),
      );
      if (!hasDuplicate) {
        return { isDuplicate: false };
      }

      return {
        isDuplicate: true,
        details: hasDuplicate,
      };
    } catch (error) {
      return {
        isDuplicate: false,
        details: null,
      };
    }
  };

  const checkCandidateAadharDuplicate = async (aadhaarNo, candidateId) => {
    try {
      const response = await agent.get(IsCandidateAadharNoDuplicate, {
        params: {
          AadharNo: aadhaarNo,
          CandidateID: candidateId,
        },
      });
      const data = response.data?.Data;
      if (!Array.isArray(data) || data.length === 0) {
        return { isDuplicate: false };
      }
      const hasDuplicate = data.find(
        (item) =>
          item &&
          Object.values(item).some(
            (value) => value !== null && value !== undefined && value !== "",
          ),
      );
      if (!hasDuplicate) {
        setIsAadhaarDuplicate(false);
        return { isDuplicate: false };
      } else {
        setIsAadhaarDuplicate(true);
      }

      return {
        isDuplicate: true,
        details: hasDuplicate,
      };
    } catch (error) {
      return {
        isDuplicate: false,
        details: null,
      };
    }
  };

  const isAadharValid = (aadhaar) => {
    const regex = /^[2-9]{1}[0-9]{3}\s[0-9]{4}\s[0-9]{4}$|^[2-9]{1}[0-9]{11}$/;
    return regex.test(aadhaar);
  };

  // for staff only
  const handleSaveForStaff = async () => {
    // First validate the form fields
    const isFormValid = validateForm();
    if (isAadhaarDuplicate) {
      return;
    }

    // If any validation fails, show error message and return
    if (!isFormValid) {
      Swal.fire({
        title: "Validation Error",
        text: "Please check the form and fill in all required fields correctly.",
        icon: "error",
        confirmButtonText: "OK",
      });

      return;
    }

    const userApplicationId = userData.profileId;
    const staffId = userInfo?.UserID;
    const userLoginID = userInfo?.UserLoginID;

    // Extract numeric staff ID from the full staff ID string (last 6 digits)
    const numericStaffId = parseInt(staffId?.toString().slice(-6)) || 0;

    // Clean and normalize job roles - filter out invalid entries
    const cleanJobRoles = (formData.jobRoles || [])
      .map((role) => {
        // If it's already a valid object with proper data
        if (
          typeof role === "object" &&
          role !== null &&
          role.ID &&
          role.JobRoleName
        ) {
          return {
            ID: parseInt(role.ID),
            CandidateID: numericStaffId,
            JobRoleName: role.JobRoleName,
          };
        }

        // If it's a numeric ID (from checkbox selection)
        if (
          typeof role === "number" ||
          (typeof role === "string" && !isNaN(parseInt(role)))
        ) {
          const roleId = parseInt(role);
          const roleName = roleMapping[roleId];

          if (roleName) {
            return {
              ID: roleId,
              CandidateID: numericStaffId,
              JobRoleName: roleName,
            };
          }
        }

        // Invalid entry - return null to filter out
        return null;
      })
      .filter((role) => role !== null); // Remove all null/invalid entries

    const formatDOBForAPI = (dob) => {
      if (!dob || !dob.includes("/")) return dob;

      const [dd, mm, yyyy] = dob.split("/").map(Number);
      const date = new Date(yyyy, mm - 1, dd);

      if (
        date.getFullYear() !== yyyy ||
        date.getMonth() !== mm - 1 ||
        date.getDate() !== dd
      ) {
        return dob;
      }

      return `${yyyy}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
    };

    // Prepare data for API submission
    const submissionData = {
      entity: "Staff", // REQUIRED FIELD - was missing
      StaffID: staffId,
      ITIRegistrationNo:
        formData.itiRegistered === "yes" ? formData.registrationNumber : "",
      FirstName: formData.firstName,
      MiddleName: formData.middleName,
      LastName: formData.lastName,
      AadhaarFilePath: formData.AadhaarFilePath || "",
      PhotoFilePath: formData.PhotoFilePath || "",
      SignFilePath: formData.SignFilePath || "",
      GenderCode: formData.gender,
      DOB: formatDOBForAPI(formData.dob),

      DOBFilePath: formData.DOBFilePath || "",
      AadhaarNo: formData.aadhaarNo,
      MobileNo: formData.primaryMobile,
      AltMobileNo: formData.secondaryMobile || "",
      EMailID: formData.email,
      UserLoginID: userLoginID,
      IPAddress: ipAddress || '',
      PageCode: "Primary",

      ListJobRole: cleanJobRoles,

      // Create comma-separated job role names (no trailing commas)
      JobRole: cleanJobRoles.map((role) => role.JobRoleName).join(", "),

      SteppID: 0,

      // Verification-related fields
      IsFirstNameVerify: "",
      IsMiddleNameVerify: "",
      IsLastNameVerify: "",
      IsPhotoFilePathVerify: "",
      IsSignFilePathVerify: "",
      IsGenderCodeVerify: "",
      IsDOBVerify: "",
      IsDOBFilePathVerify: "",
      IsAadhaarNoVerify: "",
      IsAadhaarFilePathVerify: "",

      // Verification remark fields
      FirstNameVerifyRemark: "",
      MiddleNameVerifyRemark: "",
      LastNameVerifyRemark: "",
      PhotoFilePathVerifyRemark: "",
      SignFilePathVerifyRemark: "",
      GenderCodeVerifyRemark: "",
      DOBVerifyRemark: "",
      DOBFilePathVerifyRemark: "",
      AadhaarNoVerifyRemark: "",
      AadhaarFilePathVerifyRemark: "",

      // Additional fields
      RejectCnt: "",
      VerifyCnt: "",
      IsAddhareVerify: isAadhaarVerified ? 1 : 0,
    };


    try {
      // Show loading state
      Swal.fire({
        title: "Saving...",
        text: "Please wait while we update your information",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // API call to submit data
      const response = await agent.post(SaveStaffPrimary, submissionData, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        timeout: 30000,
      });

      // Close loading dialog
      Swal.close();

      if (
        response.data.success ||
        response.status === 200 ||
        response.status === 201
      ) {
        Swal.fire({
          title: "Update Successful!",
          text: "Your information has been updated successfully.",
          icon: "success",
          confirmButtonText: "OK",
        }).then((result) => {
          if (result.isConfirmed) {
            if (userTypeID === 61) {
              navigate(
                `/Candidate/LockApplicationForm?candidateId=${effectiveCandidateId}&applicationId=${applicationId}`,
              );
            } else {
              navigate(`/${userType}/Address`);
            }
            if (SecurityQuestionRef.current && !userData.isLoggedIn) {
              SecurityQuestionRef.current.resetForm();
            }
          }
        });
      }
    } catch (error) {
      // Add detailed error logging
      if (error.response) {
        // Log specific validation errors
        if (error.response.data?.errors) {
          // Show detailed error message
          const errorMessages = Object.entries(error.response.data.errors)
            .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
            .join("\n");

          Swal.fire({
            title: "Validation Error",
            html: `<pre style="text-align: left; font-size: 12px;">${errorMessages}</pre>`,
            icon: "error",
            confirmButtonText: "OK",
          });
          return;
        }
      }

      Swal.fire({
        title: "Update Error",
        text:
          error.response?.data?.message ||
          error.response?.data?.title ||
          "Failed to update. Please try again later.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const validateAadhaarFields = () => {
    let messages = [];

    if (!formData.firstName?.trim()) {
      messages.push("Please Enter First Name.");
    }

    // if (!formData.middleName?.trim()) {
    //   messages.push("Please Enter Middle/Father/Husband Name.");
    // }

    // if (!formData.lastName?.trim()) {
    //   messages.push("Please Enter Last Name.");
    // }

    if (!formData.dob) {
      messages.push("Please Enter Date of Birth.");
    }

    if (!formData.gender) {
      messages.push("Please Select Gender.");
    }

    // if (!formData.AadhaarFilePath) {
    //   messages.push("Please Upload Aadhaar");
    // }

    if (messages.length > 0) {
      Swal.fire({
        title: "Warning",
        html: `
        <div style="text-align:center; color:red;">
            ${messages.map((msg) => `<div style="margin:8px 0;">• ${msg}</div>`).join("")}
        </div>
    `,
        icon: "warning",
        confirmButtonText: "OK",
        confirmButtonColor: "#7367F0",
      });
      return false;
    }

    return true;
  };

  // for candidate  call save candidate primary
  const handleSaveForCandidate = async () => {
    // First validate the form fields
    const isFormValid = validateForm();
    // If any validation fails, show error message and return
    if (!isFormValid) {
      Swal.fire({
        title: "Validation Error",
        text: "Please check the form and fill in all required fields correctly.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    const formatDOBForAPI = (dob) => {
      if (!dob || !dob.includes("/")) return dob;

      const [dd, mm, yyyy] = dob.split("/").map(Number);
      const date = new Date(yyyy, mm - 1, dd);

      if (
        date.getFullYear() !== yyyy ||
        date.getMonth() !== mm - 1 ||
        date.getDate() !== dd
      ) {
        return dob;
      }

      return `${yyyy}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
    };

    const candidateId =
      userTypeID == 61 ? effectiveCandidateId : userInfo?.UserID;
    const userLoginID = userInfo?.UserLoginID;
    const checkAadhaarVerification = await checkAadhaarVerified(
      candidateId,
      formData,
    );

    // Prepare data for API submission
    const submissionData = {
      CandidateID: candidateId, // Set to 0 for new candidate or use existing ID if updating
      ITIRegistrationNo:
        formData.itiRegistered === "yes" ? formData.registrationNumber : "",
      FirstName: formData.firstName,
      MiddleName: formData.middleName,
      LastName: formData.lastName,
      PhotoFilePath: formData.PhotoFilePath || "", // Azure URL for photo
      SignFilePath: formData.SignFilePath || "", // Azure URL for signature
      GenderCode: formData.gender,
      DOB: formatDOBForAPI(formData.dob),

      DOBFilePath: formData.DOBFilePath || "",
      AadhaarNo: formData.aadhaarNo,
      AadhaarFilePath: formData.AadhaarFilePath || "",
      MobileNo: formData.primaryMobile,
      AltMobileNo: formData.secondaryMobile || "",
      EMailID: formData.email,
      UserLoginID: userLoginID,
      IPAddress: ipAddress || "",
      PageCode: "Primary",
      IsAadhaarVerified: !isAadhaarDuplicate,
    };

    try {
      // Show loading state
      Swal.fire({
        title: "Saving...",
        text: "Please wait while we save your information",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      // API call to submit data
      const response = await agent.post(SaveCandidatePrimary, submissionData, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        timeout: 30000, // 30 seconds timeout
      });
      // Close loading dialog
      Swal.close();
      // Check for successful response
      if (
        response.data.CandidateID ||
        response.status === 200 ||
        response.status === 201
      ) {
        Swal.fire({
          title: "Save Successful!",
          text: "Your information has been saved successfully.",
          icon: "success",
          confirmButtonText: "OK",
        }).then((result) => {
          if (result.isConfirmed) {
            // Optional: Reset form or navigate
            if (SecurityQuestionRef.current) {
              SecurityQuestionRef.current.resetForm();
            }
            if (userTypeID === 61) {
              navigate(
                `/Candidate/LockApplicationForm?candidateId=${effectiveCandidateId}&applicationId=${applicationId}`,
              );
            } else {
              navigate(`/${userType}/Address`);
            }
          }
        });
        // Optionally store the returned CandidateID
        return response.data.CandidateID;
      }
    } catch (error) {
      // Detailed error logging
      if (error.response) {
      }
      Swal.fire({
        title: "Save Error",
        text:
          error.response?.data?.message ||
          "Failed to save. Please try again later.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return null;
    }
  };

  const handleVerifyClick = async () => {
    startLoading();

    try {
      let isDuplicate = false;

      const userTypeId = userInfo?.UserTypeID;

      // Candidate
      if (userTypeId === 91) {
        const duplicateCheckResponse = await agent.post(
          check_duplicate_mobile,
          { MobileNo: formData.primaryMobile },
        );

        isDuplicate = duplicateCheckResponse.data?.isDuplicate;
      }

      // Staff
      else {
        const numericId =
          parseInt(userInfo?.UserID?.toString()?.slice(-6)) || 0;

        const duplicateCheckResponse = await publicAgent.get(
          `${IsStaffAlreadyRegisteredUsingThisMobileNo}?StaffID=${numericId}&MobileNo=${formData.primaryMobile}`,
        );

        isDuplicate = duplicateCheckResponse.data?.Data;
      }

      if (isDuplicate) {
        stopLoading();

        Swal.fire({
          title: "Mobile Number Already Registered",
          text: "This mobile number is already registered.",
          icon: "warning",
        });

        return;
      }

      // Send OTP
      const response = await agent.post(send_otp, {
        MobileNo: formData.primaryMobile,
      });

      if (response.data.success) {
        const otp = response.data.otp || response.data.OTP;
        setCurrentOtp(otp);
        setOtpAttempts(0);
        showOTPDialog(otp);
      }
    } catch (error) {
      Swal.fire({
        title: "OTP Error",
        text:
          error.response?.data?.message ||
          "Failed to send OTP. Please try again.",
        icon: "error",
      });
    } finally {
      stopLoading();
    }
  };

  // Enhanced OTP dialog with better UX
  const showOTPDialog = (otp) => {
    Swal.fire({
      title: "OTP Verification",
      html: `
        <div style="text-align: left; margin-bottom: 20px;">
            <div style="background-color: #d1fae5; padding: 10px; border-radius: 5px; color: #065f46;">
                OTP has been sent to Mobile No. ******${formData.primaryMobile.slice(-4)}.
            </div>
            
        </div>
        <input type="text" id="otp-input" class="swal2-input" placeholder="Enter 4-digit OTP" maxlength="4" style="text-align: center; font-size: 18px; letter-spacing: 2px;" />
        <div id="otp-error" style="color: #dc2626; font-size: 14px; margin-top: 10px; display: none;"></div>
        <div style="margin-top: 15px; font-size: 14px; color: #6b7280;">
            Attempts remaining: <span id="attempts-remaining">${OTP_CONFIG.MAX_ATTEMPTS}</span>
        </div>
    `,
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: "Verify OTP",
      denyButtonText:
        resendCooldown > 0 ? `Resend OTP (${resendCooldown}s)` : "Resend OTP",
      cancelButtonText: "Close",
      allowOutsideClick: false,
      didOpen: () => {
        const input = document.getElementById("otp-input");
        input.focus();

        // Auto-format OTP input
        input.addEventListener("input", (e) => {
          e.target.value = e.target.value.replace(/\D/g, "");
        });
      },
      preConfirm: async () => {
        const enteredOtp = document.getElementById("otp-input").value;
        const errorDiv = document.getElementById("otp-error");
        const attemptsSpan = document.getElementById("attempts-remaining");

        if (!enteredOtp) {
          errorDiv.textContent = "Please enter the OTP.";
          errorDiv.style.display = "block";
          return false;
        }

        if (enteredOtp.length !== 4) {
          errorDiv.textContent = "OTP must be 4 digits.";
          errorDiv.style.display = "block";
          return false;
        }

        try {
          const verifyResponse = await agent.post(
            verify_otp,
            {
              MobileNo: formData.primaryMobile,
              OTP: enteredOtp,
            },
            {
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              timeout: 15000,
            },
          );

          if (verifyResponse.data.success) {
            await saveOTPVerificationStatus(
              formData.primaryMobile,
              enteredOtp,
              true,
            );
            setIsVerified(true);
            setCurrentOtp(null);
            setOtpAttempts(0);

            Swal.fire({
              title: "Verified ✅",
              text: "Mobile number verified successfully!",
              icon: "success",
              timer: 2000,
              showConfirmButton: false,
            });
            return true;
          } else {
            throw new Error(verifyResponse.data.message || "Invalid OTP");
          }
        } catch (error) {
          const newAttempts = otpAttempts + 1;
          setOtpAttempts(newAttempts);

          await saveOTPVerificationStatus(
            formData.primaryMobile,
            enteredOtp,
            false,
          );

          if (newAttempts >= OTP_CONFIG.MAX_ATTEMPTS) {
            errorDiv.textContent =
              "Maximum attempts exceeded. Please request a new OTP.";
            errorDiv.style.display = "block";
            return false;
          }

          const remainingAttempts = OTP_CONFIG.MAX_ATTEMPTS - newAttempts;
          attemptsSpan.textContent = remainingAttempts;

          if (error.response?.data?.message?.includes("expired")) {
            errorDiv.textContent = "OTP has expired. Please request a new OTP.";
          } else {
            errorDiv.textContent = `Invalid OTP. `;
          }
          errorDiv.style.display = "block";
          return false;
        }
      },
    }).then((result) => {
      if (result.isDenied && resendCooldown === 0) {
        handleResendOTP();
      } else if (result.isDenied && resendCooldown > 0) {
        Swal.fire({
          title: "Please Wait",
          text: `Please wait ${resendCooldown} seconds before requesting another OTP.`,
          icon: "info",
        });
      }
    });
  };

  // Enhanced OTP resend function
  const handleResendOTP = async () => {
    if (resendCooldown > 0) {
      Swal.fire({
        title: "Please Wait",
        text: `Please wait ${resendCooldown} seconds before requesting another OTP.`,
        icon: "info",
      });
      return;
    }

    try {
      Swal.fire({
        title: "Resending OTP",
        text: "Please wait...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const response = await agent.post(
        resend_otp,
        {
          MobileNo: formData.primaryMobile,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          timeout: 15000,
        },
      );

      Swal.close();

      if (response.data.success) {
        const newOtp = response.data.otp || response.data.OTP;
        setCurrentOtp(newOtp);
        setOtpAttempts(0);
        setResendCooldown(OTP_CONFIG.RESEND_COOLDOWN);

        showOTPDialog(newOtp);
      } else {
        throw new Error(response.data.message || "Failed to resend OTP");
      }
    } catch (error) {
      Swal.fire({
        title: "Resend Failed",
        text:
          error.response?.data?.message ||
          "Failed to resend OTP. Please try again.",
        icon: "error",
      });
    }
  };

  // Enhanced OTP verification status saving
  const saveOTPVerificationStatus = async (mobileNo, otp, isVerified) => {
    try {
      const response = await agent.post(
        save_otp_status,
        {
          MobileNo: mobileNo,
          Purpose: "VerifyCandidateMobileNo",
          OTP: otp,
          IsOTPVerified: isVerified,
        },
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          timeout: 10000,
        },
      );
      return response.data;
    } catch (error) {
      return null;
    }
  };
  const handleAadhaarVerify = async () => {
    if (!formData.aadhaarNo || formData.aadhaarNo.length !== 12) {
      Swal.fire({
        title: "Invalid Aadhaar",
        text: "Please enter a valid 12-digit Aadhaar number.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    const candidateId = userInfo?.UserID;

    setAadhaarVerifying(true);
    try {
      const result = await checkAadhaarVerified(candidateId, formData);

      if (result?.isAadhaarVerified) {
        setIsAadhaarVerified(true);
        Swal.fire({
          title: "Aadhaar Verified ✅",
          text: "Your Aadhaar has been verified successfully.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        setIsAadhaarVerified(false);
        Swal.fire({
          title: "Verification Failed",
          text:
            result?.message ||
            "Aadhaar verification failed. Please check your details.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "Something went wrong during Aadhaar verification. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setAadhaarVerifying(false);
    }
  };

  const handleCaptchaValidation = (name, validationError) => {
    setCaptchaVerified(!validationError);
    setErrors((prev) => ({
      ...prev,
      captcha: validationError || "",
    }));
  };

  const canShowAadhaarVerify =
    formData.aadhaarNo?.length === 12 &&
    !isAadhaarDuplicate &&
    !disableAadhaarFields;

  return (
    <div className="mx-auto w-full rounded-lg bg-white p-3 sm:p-6 shadow-md">
      {/* Security Question Component - Only shown for new registrations */}
      {userData.isLoggedIn && (
        <div className="overflow-x-auto">
          <ProgressTracker />
        </div>
      )}
      <fieldset className="mb-4 rounded-md border p-3 sm:p-4">
        <legend
          className={`flex ${color} items-center text-sm sm:text-base font-semibold text-white border-2 border-gray-300 px-3 py-1.5 rounded-md ml-2 sm:ml-4`}
        >
          <MdOutlinePersonAdd className="text-xl shrink-0" />{" "}
          <span className="ml-1">
            {userData.isLoggedIn ? "Primary Information" : "Registration Details"}
          </span>
        </legend>

        <form onSubmit={handleSubmit} className="mt-4">
          <div className="flex items-start">
            <div className="mr-4">
              <p className="mt-1 text-sm text-gray-600">Primary Details</p>
            </div>
          </div>

          {/* Main content: fields column + photo/signature column.
              Stacks to a single column on small screens; becomes a
              two-column layout from the lg breakpoint up, using normal
              document flow instead of absolute positioning so nothing
              overlaps at any width. */}
          <div className="mt-2 flex flex-col-reverse lg:flex-row lg:items-start lg:gap-6">
            {/* Fields column */}
            <div className="flex-1 min-w-0">
              {/* Names row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* First Name */}
                <div>
                  <label className="font-normal text-sm">
                    First Name <span className="text-red-500">*</span>
                    {errors.firstName && (
                      <span className="ml-1 text-sm text-red-500">
                        {" "}
                        {errors.firstName}
                      </span>
                    )}
                  </label>
                  <FormComponent
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    disabled={disableAadhaarFields}
                    onChange={(value) => {
                      if (/^[A-Za-z\s]*$/.test(value)) {
                        handleChange({
                          target: {
                            name: "firstName",
                            value: value.toUpperCase(),
                          },
                        });
                      }
                    }}
                  />
                </div>

                {/* Middle Name */}
                <div>
                  <label className="font-normal text-sm">
                    Middle/ Father/ Husband Name
                  </label>
                  <FormComponent
                    type="text"
                    name="middleName"
                    value={formData.middleName}
                    disabled={disableAadhaarFields}
                    onChange={(value) => {
                      if (/^[A-Za-z\s]*$/.test(value)) {
                        // ONLY characters allowed
                        handleChange({
                          target: {
                            name: "middleName",
                            value: value.toUpperCase(),
                          },
                        });
                      }
                    }}
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label className="font-normal text-sm">Last Name</label>
                  <FormComponent
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    disabled={disableAadhaarFields}
                    onChange={(value) => {
                      if (/^[A-Za-z\s]*$/.test(value)) {
                        handleChange({
                          target: { name: "lastName", value: value.toUpperCase() },
                        });
                      }
                    }}
                  />
                </div>
              </div>
              <div className="mt-2">
                <label className="font-normal text-sm">
                  Name As Per Aadhaar
                </label>
                <div className="mt-1 w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                  {[formData.firstName, formData.middleName, formData.lastName]
                    .filter(name => name && name.trim())
                    .join(' ') || '—'}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Date of Birth */}
                <div>
                  <label className="font-normal text-sm">
                    Date of Birth (DD/MM/YYYY){" "}
                    <span className="text-red-500">*</span>
                    {errors.dob && (
                      <span className="ml-1 text-sm  text-red-500">
                        {errors.dob}
                      </span>
                    )}
                  </label>

                  <DateInput
                    label=""
                    value={formData.dob}
                    disabled={disableAadhaarFields}
                    onChange={(value) =>
                      handleChange({ target: { name: "dob", value } })
                    }
                    required
                    minDate={new Date(1900, 0, 1)}
                    maxDate={new Date()}
                  />
                </div>
                <div>
                  <DropdownComponent
                    label="Gender"
                    options={genderOptions}
                    value={formData.gender}
                    disabled={disableAadhaarFields}
                    onChange={(value) =>
                      handleChange({ target: { name: "gender", value } })
                    }
                    required={true}
                    loading={false}
                    error={errors.gender}
                  />
                </div>

                <div>
                  <label className="font-normal text-sm">
                    Aadhar Number <span className="text-red-500">*</span>
                    {errors.aadhaarNo && (
                      <span className="ml-1 text-sm text-red-500">
                        {errors.aadhaarNo}
                      </span>
                    )}
                  </label>

                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <FormComponent
                        type="text"
                        name="aadhaarNo"
                        value={formData.aadhaarNo}
                        maxLength="12"
                        disabled={disableAadhaarFields}
                        onChange={async (value) => {
                          if (/^[0-9]*$/.test(value) && value.length <= 12) {
                            handleChange({ target: { name: "aadhaarNo", value } });
                          }
                          if (isAadhaarVerified) setIsAadhaarVerified(false);
                          if (value.length < 12) { setIsAadhaarDuplicate(false); return; }
                          if (value.length === 12) {
                            if (!isAadharValid(value)) {
                              Swal.fire({ title: "Invalid Aadhaar", text: "Please enter a valid 12-digit Aadhaar number.", icon: "error" });
                              handleChange({ target: { name: "aadhaarNo", value: "" } });
                              return;
                            }
                            const uType = userInfo?.UserTypeID === 95 ? "Staff" : userInfo?.UserTypeID === 91 ? "Candidate" : null;
                            const userId = userInfo?.UserID;
                            const numericId = parseInt(userId?.toString().slice(-6)) || 0;
                            setCheckingAadhaar(true);
                            let result = { isDuplicate: false };
                            if (uType === "Candidate") result = await checkCandidateAadharDuplicate(value, numericId);
                            else result = await checkAadharDuplicate(value, numericId);
                            setCheckingAadhaar(false);
                            setIsAadhaarDuplicate(result?.isDuplicate || false);
                            if (result.isDuplicate) {
                              const profileId = result.details?.ApplicationID || result.details?.StaffID || "";
                              const name = result.details?.CandidateName || result.details?.StaffName || "";
                              Swal.fire({
                                title: "Warning",
                                html: `<div style="text-align:center">
                              <p>This Aadhaar is already registered.</p>
                              <p>Profile ID: ${profileId}</p><p>Name: ${name}</p>
                            </div>`,
                                icon: "warning",
                              });
                              handleChange({
                                target: { name: "aadhaarNo", value: "" },
                              });
                            }
                          }
                        }}
                      />
                    </div>
                    {isAadhaarVerified ? (
                      <img
                        src={VerifiedIcon}
                        alt="Verified"
                        className="mt-1 h-12 w-auto shrink-0"
                      />
                    ) : canShowAadhaarVerify ? (
                      <button
                        type="button"
                        className="mt-1 px-3 py-2 rounded text-sm font-medium bg-red-500 hover:bg-red-600 text-white shrink-0 whitespace-nowrap"
                        onClick={() => {
                          if (!validateAadhaarFields()) return;

                          // NEW — confirmation popup before opening the verification modal
                          Swal.fire({
                            title: "Before You Proceed",

                            html: `
                                  <div style="
                                    text-align:left;
                                    font-size:14px;
                                    line-height:1.5;
                                    color:#555;
                                  ">

                                  <!-- Aadhaar Sample Image -->
                                  <div style="
                                    text-align:center;
                                    margin:0 auto 16px;
                                  ">
                                    <img
                                      src="${SampleAadhaarCard}"
                                      alt="Sample Aadhaar Card"
                                      style="
                                        width:100%;
                                        max-width:350px;
                                        height:auto;
                                        display:block;
                                        margin:0 auto;
                                        border:1px solid #e2e2e2;
                                        border-radius:8px;
                                      "
                                    />
                                  </div>

                                  <!-- Instructions -->
                                  <div style="
                                    background:#f7f7ff;
                                    border:1px solid #e2e2f5;
                                    border-radius:8px;
                                    padding:12px 15px;
                                    max-width:420px;
                                    margin:0 auto;
                                    box-sizing:border-box;
                                  ">

                                  <div style="margin-bottom:6px;">
                                    Please make sure the details you enter next
                                    <strong style="color:#7367F0;">
                                      exactly match your latest Aadhaar card
                                    </strong>
                                    — including:
                                  </div>

                                  <div style="
                                    display:flex;
                                    gap:18px;
                                    flex-wrap:wrap;
                                    margin:7px 0;
                                    font-weight:500;
                                  ">
                                    <span>• Name</span>
                                    <span>• Date of Birth</span>
                                    <span>• Gender</span>
                                  </div>

                                  <div style="
                                    color:#dc3545;
                                    font-size:13px;
                                    margin-top:7px;
                                    font-weight:500;
                                  ">
                                    ⚠ Mismatched details will cause the verification to fail.
                                  </div>

                                </div>

                              </div>
                            `,

                            showCancelButton: true,
                            confirmButtonText: "Yes, Proceed",
                            cancelButtonText: "Cancel",
                            confirmButtonColor: "#7367F0",
                            cancelButtonColor: "#6c757d",
                            width: "650px",
                            padding: "25px",
                            customClass: {
                              popup: "swal2-popup"
                            }

                          }).then((result) => {
                            if (result.isConfirmed) {
                              setShowAadhaarModal(true);
                            }
                          });
                        }}
                      >
                        Verify
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">


                {/* Upload Aadhar Card */}
                <div>
                  <UploadPdf
                    file={formData.AadhaarFilePath}
                    onFileChange={(fileData) => {
                      setFormData((prev) => ({
                        ...prev,
                        AadhaarFilePath: fileData.filePath,
                        aadhaarFileName: fileData.fileName,
                        aadhaarUniqueFileName: fileData.uniqueFileName,
                      }));
                      setErrors((prev) => ({ ...prev, AadhaarFilePath: "" }));
                    }}
                    buttonClassName="bg-[#00c3f9]"
                    buttonText="Upload"
                    id="aadharUpload"
                    allowedFileTypes="pdf, jpg, jpeg"
                    maxFileSize="2 MB"
                    required={true}
                    label="Upload Aadhar Card"
                    showLabel={true}
                    userTypeId={userTypeID || ""}
                    userLoginID={userInfo?.UserLoginID || ""}
                    linkName="View Aadhar Card"
                    uniquefilepath={formData.AadhaarFilePath || ""}
                  />
                  {errors.AadhaarFilePath && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.AadhaarFilePath}
                    </p>
                  )}
                </div>
              </div>
              {(!userData.isLoggedIn || isStaff) && (
                <div className="mt-6 mb-6">
                  <label className="font-normal text-sm">Job Role</label>
                  <div className="flex flex-wrap gap-4 mt-2 border rounded-md p-4">
                    {[
                      { id: 1, label: "Head of Institute" },
                      { id: 2, label: "Trainer" },
                      { id: 3, label: "Assessor" },
                      { id: 4, label: "Subject Expert" },
                      { id: 11, label: "Office Staff" },
                      { id: 12, label: "Management" },
                    ].map((job) => (
                      <div key={job.id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`job-${job.id}`}
                          name="jobRole"
                          value={job.id}
                          className="mr-2 w-5 h-5 shrink-0"
                          onChange={handleJobRoleChange}
                          checked={
                            Array.isArray(formData.jobRoles) &&
                            formData.jobRoles.some((role) =>
                              typeof role === "object"
                                ? role.ID === job.id
                                : Number(role) === job.id,
                            )
                          }
                        />
                        <label htmlFor={`job-${job.id}`} className="cursor-pointer">
                          {job.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Primary Mobile Number */}
                <div>
                  <label className="mb-1 block text-sm font-normal ">
                    Primary Mobile Number{" "}
                    <span className="text-lg text-red-500">*</span>
                    {errors.primaryMobile && (
                      <span className="ml-2 text-sm text-red-500">
                        {errors.primaryMobile}
                      </span>
                    )}
                  </label>

                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <FormComponent
                        type="text"
                        name="primaryMobile"
                        value={formData.primaryMobile}
                        className="rounded-r-none"
                        onChange={(value) => {
                          if (/^[0-9]*$/.test(value) && value.length <= 10) {
                            handleChange({
                              target: {
                                name: "primaryMobile",
                                value,
                              },
                            });

                            if (value === verifiedMobile) {
                              setIsVerified(true);
                            } else {
                              setIsVerified(false);
                            }
                          }
                        }}
                      />
                    </div>

                    {formData.primaryMobile.length === 10 &&
                      (isVerified ||
                        ((userTypeID === 61 || userTypeID == 91 || userTypeID == 95) &&
                          profileData?.MobileNo === formData.primaryMobile) ? (
                        <img
                          src={VerifiedIcon}
                          alt="Verified"
                          className="mt-1 h-12 w-auto shrink-0"
                        />
                      ) : (
                        <button
                          type="button"
                          className="mt-1 px-3 py-2 rounded text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white whitespace-nowrap shrink-0"
                          onClick={handleVerifyClick}
                        >
                          Verify
                        </button>
                      ))}
                  </div>
                </div>

                {/* Secondary Mobile Number */}
                <div>
                  <label className="mb-1 block text-sm font-normal ">
                    Secondary Mobile Number
                    <span className="text-lg text-red-500"></span>
                    {errors.secondaryMobile && (
                      <span className="ml-2 text-sm text-red-500">
                        {errors.secondaryMobile}
                      </span>
                    )}
                  </label>
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <FormComponent
                        type="text"
                        name="secondaryMobile"
                        value={formData.secondaryMobile}
                        onChange={(value) => {
                          if (/^[0-9]*$/.test(value) && value.length <= 10) {
                            handleChange({
                              target: { name: "secondaryMobile", value },
                            });
                          }
                        }}
                        maxLength="10"
                      />
                    </div>
                  </div>
                </div>
                {/* E-Mail ID */}
                <div>
                  <label className="mb-1 block text-sm font-normal ">
                    E-Mail ID <span className="text-lg text-red-500">*</span>
                    {errors.email && (
                      <span className="ml-1 text-sm text-red-500">
                        {errors.email}
                      </span>
                    )}
                  </label>

                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        placeholder="Enter email address"
                        onChange={(e) =>
                          handleChange({
                            target: { name: "email", value: e.target.value },
                          })
                        }
                        className={`mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1
                ${errors.email
                            ? "border-red-500 focus:ring-red-500"
                            : "border-black focus:ring-black"
                          }`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Photo & Signature column - normal document flow so it never
                overlaps other fields; stacks above the form fields on
                mobile/tablet and sits beside them from lg upward. */}
            <div className="mb-6 lg:mb-0 flex w-full flex-row flex-wrap justify-center gap-4 lg:w-64 lg:shrink-0 lg:flex-col">
              {/* Photo Preview */}
              <div className="flex flex-col items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl shadow-sm w-full max-w-[220px] lg:max-w-none">
                <div
                  className={`w-32 h-40 rounded-lg overflow-hidden flex items-center justify-center
            ${formData.photoUrl || formData.PhotoFilePath
                      ? "border border-gray-300 bg-white shadow-md"
                      : "border-2 border-dashed border-gray-300 bg-gray-100"
                    }`}
                >
                  {formData.photoUrl || formData.PhotoFilePath ? (
                    <img
                      src={formData.photoUrl || formData.PhotoFilePath}
                      alt="Candidate"
                      className="w-full h-full object-cover object-center"
                    />
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-10 w-10 text-gray-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M3 16.5V7.5A2.25 2.25 0 015.25 5.25h13.5A2.25 2.25 0 0121 7.5v9a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 16.5zm0 0l5.03-5.03a2.25 2.25 0 013.18 0L15 15.19m-6-6l1.72-1.72a2.25 2.25 0 013.18 0L21 14.25M15 9.75h.008v.008H15V9.75z"
                      />
                    </svg>
                  )}
                </div>

                <label className="text-sm font-medium text-gray-700 text-center">
                  Upload Photo <span className="text-red-500">*</span>
                </label>

                <UploadPdf
                  file={formData.photoFileName || ""}
                  onFileChange={(fileData) => {
                    setFormData((prev) => ({
                      ...prev,
                      PhotoFilePath: fileData.filePath,
                      photoFileName: fileData.fileName,
                      photoUniqueFileName: fileData.uniqueFileName,
                      photoUrl: fileData.filePath,
                      photoFile: fileData.file,
                    }));
                    setErrors((prev) => ({ ...prev, PhotoFilePath: "" }));
                  }}
                  buttonClassName="bg-[#00c3f9] hover:bg-[#0099cc] transition-colors duration-200 shadow-sm"
                  buttonText="Upload"
                  allowedFileTypes="jpg, jpeg, png"
                  maxFileSize="1 MB"
                  required={true}
                  label=""
                  showLabel={false}
                  userTypeId={userTypeID}
                  userLoginID={userInfo?.UserLoginID}
                  linkName=""
                  uniquefilepath={formData.PhotoFilePath || ""}
                  id="photoUpload"
                />

                {errors.PhotoFilePath && (
                  <p className="text-xs text-red-500 text-center">{errors.PhotoFilePath}</p>
                )}
              </div>

              {/* Signature Preview */}
              <div className="flex flex-col items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl shadow-sm w-full max-w-[220px] lg:max-w-none">
                <div
                  className={`w-44 h-20 max-w-full rounded-lg overflow-hidden flex items-center justify-center
            ${formData.signatureUrl || formData.SignFilePath
                      ? "border border-gray-300 bg-white shadow-md"
                      : "border-2 border-dashed border-gray-300 bg-gray-100"
                    }`}
                >
                  {formData.signatureUrl || formData.SignFilePath ? (
                    <img
                      src={formData.signatureUrl || formData.SignFilePath}
                      alt="Signature"
                      className="w-full h-full object-contain object-center p-1"
                    />
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-gray-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828H9V13z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M3 19h18"
                      />
                    </svg>
                  )}
                </div>

                <label className="text-sm font-medium text-gray-700 text-center">
                  Upload Signature <span className="text-red-500">*</span>
                </label>

                <UploadPdf
                  file={formData.signatureFileName || ""}
                  onFileChange={(fileData) => {
                    setFormData((prev) => ({
                      ...prev,
                      SignFilePath: fileData.filePath,
                      signatureFileName: fileData.fileName,
                      signatureUniqueFileName: fileData.uniqueFileName,
                      signatureUrl: fileData.filePath,
                      signFile: fileData.file,
                    }));
                    setErrors((prev) => ({ ...prev, SignFilePath: "" }));
                  }}
                  buttonClassName="bg-[#00c3f9] hover:bg-[#0099cc] transition-colors duration-200 shadow-sm"
                  buttonText="Upload"
                  allowedFileTypes="jpg, jpeg, png"
                  maxFileSize="500 KB"
                  required={true}
                  label=""
                  showLabel={false}
                  userTypeId={userTypeID}
                  userLoginID={userInfo?.UserLoginID}
                  linkName=""
                  uniquefilepath={formData.SignFilePath || ""}
                  id="signatureUpload"
                />

                {errors.SignFilePath && (
                  <p className="text-xs text-red-500 text-center">{errors.SignFilePath}</p>
                )}
              </div>
            </div>
          </div>

          {/* Security Question Component - Only shown for new registrations */}
          {!userData.isLoggedIn && (
            <div className="mt-8">
              <SecurityQuestion ref={SecurityQuestionRef} />
            </div>
          )}

          {/* Captcha Component - Only shown for new registrations */}
          {!userData.isLoggedIn && (
            <div className="w-full max-w-md mx-auto px-2">
              <div className="mt-4 flex flex-col items-center justify-center">
                <Captcha
                  ref={CaptchaRef}
                  name="captcha"
                  label=""
                  type="alphanumeric"
                  difficulty="easy"
                  required
                  clearable
                  enableVoice
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      captcha: value,
                    }))
                  }
                  onValidationChange={handleCaptchaValidation}
                />
              </div>
            </div>
          )}

          {/* Button Group */}
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {!userData.isLoggedIn ? (
              <>
                <button
                  type="button"
                  className="rounded-md bg-red-20 px-4 py-2 text-gray-700 hover:bg-gray-300"
                  onClick={resetForm}
                >
                  Reset
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                >
                  Register
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="rounded-md bg-red-500 px-4 py-2 text-white hover:bg-gray-300"
                  onClick={resetForm}
                >
                  Reset
                </button>
                <button
                  type="button"
                  className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-600"
                  onClick={handleSave}
                >
                  Save & Next
                </button>
              </>
            )}
            <AadhaarVerificationModal
              isOpen={showAadhaarModal}
              onClose={() => setShowAadhaarModal(false)}
              onVerified={handleAadhaarFormSync}
              onFormSync={handleAadhaarFormSync}
              apiEndpoint={aadhaarVerification}
              formData={{
                firstName: formData.firstName,
                middleName: formData.middleName,
                lastName: formData.lastName,
                dob: formData.dob,
                gender: formData.gender,
                aadhaarNo: formData.aadhaarNo,
                candidateId: userInfo?.UserID,
                userLoginID: userInfo?.UserLoginID,
              }}
            />
          </div>
        </form>
      </fieldset>
    </div>
  );
};

export default Staff;