import { useState, useEffect, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";

// Lucide React Icons
import { Users, Handshake } from "lucide-react";
import { useLoading } from "../../../Hooks/useLoading";
// Custom Components
import FormComponent from "../../formcomponent/FormComponent";
import ProgressTracker from "./ProgressTracker";
import {
  GetCandidateParent,
  SaveCandidateParent,
} from "../../../Endpoints_All/Candidate/parent";

import {
  GetStaffParent,
  SaveStaffParent,
} from "../../../Endpoints_All/Staff/parent";

import agent from '../../../lib/api/agent';
import { getDeviceIP } from '../../../utils/CommonHelper';
import { useAuth } from '../../../Hooks/AuthContext';
import { CheckCandidateURL } from '../../../Endpoints_All/Candidate/summary';
import { CheckStaffURL } from '../../../Endpoints_All/Staff/summary';
import { ThemeContext } from "../../../Component/Context/ThemeContext";
const ParentGuardianForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const candidateIdFromUrl = searchParams.get("candidateId");
  const { userInfo } = useAuth();

  const isInstituteUser = userInfo?.UserTypeID === 61;

  const effectiveUserId = candidateIdFromUrl || userInfo?.UserID;
  const userTypeID = userInfo?.UserTypeID;

  const formType =
    isInstituteUser || candidateIdFromUrl
      ? "Candidate"
      : userTypeID === 91
        ? "Candidate"
        : "Staff";

  const API_ENDPOINTS = {
    Candidate: {
      get: GetCandidateParent,
      save: SaveCandidateParent,
      userTypeIDName: "CandidateID",
    },
    Staff: {
      get: GetStaffParent,
      save: SaveStaffParent,
      userTypeIDName: "StaffID",
    },
  };
  const { color } = useContext(ThemeContext);
  const currentEndpoints = API_ENDPOINTS[formType];

  const userLoginID = userInfo?.UserLoginID;
  const effectiveCandidateId =
    userInfo?.UserTypeID === 61 ? candidateIdFromUrl : userInfo?.UserID;
  const userID = effectiveUserId;
  const applicationId = searchParams.get("applicationId");

  const { startLoading, stopLoading } = useLoading();

  const [formData, setFormData] = useState({
    [currentEndpoints.userTypeIDName]: userID || 0,
    IsOrphan: 0,
    FatherTitle: "Mr",
    FatherFirstName: "",
    FatherMiddleName: "",
    FatherLastName: "",
    MotherTitle: "Ms",
    MotherFirstName: "",
    MotherMiddleName: "",
    MotherLastName: "",
    MaritalStatus: "No",
    SpouseTitle: "",
    SpouseFirstName: "",
    SpouseMiddleName: "",
    SpouseLastName: "",
    UserLoginID: userLoginID || "",
    IPAddress: "",
    PageCode: "Parent",
  });

  const [errors, setErrors] = useState({});

  const [ipAddress, setIpAddress] = useState("");

  // Safe AI Assistant Autofill event listener for Parent/Guardian
  useEffect(() => {
    const handleAutofill = (e) => {
      if (!e || !e.detail) return;
      const d = e.detail;

      let fatherFirst = d.FatherFirstName || d.fatherFirstName;
      let fatherMiddle = d.FatherMiddleName || d.fatherMiddleName;
      let fatherLast = d.FatherLastName || d.fatherLastName;

      if (d.fatherName && !fatherFirst) {
        const parts = d.fatherName.trim().split(/\s+/);
        fatherFirst = parts[0];
        if (parts.length === 2) fatherLast = parts[1];
        else if (parts.length > 2) {
          fatherMiddle = parts[1];
          fatherLast = parts.slice(2).join(' ');
        }
      }

      let motherFirst = d.MotherFirstName || d.motherFirstName;
      let motherMiddle = d.MotherMiddleName || d.motherMiddleName;
      let motherLast = d.MotherLastName || d.motherLastName;

      if (d.motherName && !motherFirst) {
        const parts = d.motherName.trim().split(/\s+/);
        motherFirst = parts[0];
        if (parts.length === 2) motherLast = parts[1];
        else if (parts.length > 2) {
          motherMiddle = parts[1];
          motherLast = parts.slice(2).join(' ');
        }
      }

      setFormData((prev) => ({
        ...prev,
        ...(fatherFirst && { FatherFirstName: fatherFirst }),
        ...(fatherMiddle && { FatherMiddleName: fatherMiddle }),
        ...(fatherLast && { FatherLastName: fatherLast }),
        ...(motherFirst && { MotherFirstName: motherFirst }),
        ...(motherMiddle && { MotherMiddleName: motherMiddle }),
        ...(motherLast && { MotherLastName: motherLast }),
        ...(d.MaritalStatus && { MaritalStatus: d.MaritalStatus }),
        ...(d.maritalStatus && { MaritalStatus: d.maritalStatus }),
      }));

      setErrors((prev) => {
        const next = { ...prev };
        if (fatherFirst) delete next.FatherFirstName;
        if (fatherLast) delete next.FatherLastName;
        if (motherFirst) delete next.MotherFirstName;
        if (motherLast) delete next.MotherLastName;
        return next;
      });
    };

    window.addEventListener("msbsvet:autofill", handleAutofill);
    return () => window.removeEventListener("msbsvet:autofill", handleAutofill);
  }, []);

  // ✅ Helper function to map MaritalStatus from API (1/0/-1 or 'Y'/'N'/'S') to UI ('Yes'/'No'/'Skip')
  const mapMaritalStatusFromAPI = (status) => {
    if (status === null || status === undefined) return "No";

    // Handle numeric values
    const numVal = status;
    // const numVal = typeof status === 'number' ? status : parseInt(status, 10);

    if (numVal) {
      if (numVal === 'M') return 'Yes';
      else if (numVal === 'N') return 'No';
      else if (numVal === 'S') return 'Skip';
    }
    // if (!isNaN(numVal)) {
    //     if (numVal === 1) return 'Yes';
    //     else if (numVal === 0) return 'No';
    //     else if (numVal === -1) return 'Skip';
    // }

    // Handle text values for backward compatibility
    const statusStr = status.toString().trim();

    // Check for single character values
    if (statusStr === 'Y' || statusStr === 'M') return 'Yes';
    else if (statusStr === 'N' || statusStr === 'N') return 'No';
    else if (statusStr === 'S' || statusStr === 'S' || statusStr === '-') return 'Skip';

    // Check for full words
    const statusUpper = statusStr.toUpperCase();
    if (statusUpper.startsWith("Y")) return "Yes";
    else if (statusUpper.startsWith("S")) return "Skip";
    else if (statusUpper.startsWith("N")) return "No";

    return "No"; // Default
  };

  useEffect(() => {
    const fetchIP = async () => {
      try {
        const ip = await getDeviceIP();
        setIpAddress(ip);
      } catch (err) {
        console.error("Failed to get IP:", err);
      }
    };

    fetchIP();

  }, []);
  // ✅ Helper function to map MaritalStatus from UI ('Yes'/'No'/'Skip') to API (1/0/-1)
  const mapMaritalStatusToAPI = (status) => {
    if (!status) return "N";

    const statusUpper = status.toString().toUpperCase();

    if (statusUpper.startsWith('Y')) {
      return "M";  // Send string "1" for Yes
    } else if (statusUpper.startsWith('S')) {
      return "S"; // Send string "-1" for Skip
    } else if (statusUpper.startsWith('N')) {
      return "U";  // Send string "0" for No
    }

    return "N"; // Default
  };






  // ✅ Helper function to map IsOrphan from API to UI
  const mapIsOrphanFromAPI = (value) => {
    // Handle numeric: 1 = Yes (Orphan), 0 = No (Not Orphan)
    const numVal = typeof value === "number" ? value : parseInt(value, 10);

    if (!isNaN(numVal)) {
      return numVal === 1 ? 1 : 0;
    }

    // Handle text: "1", "Y", "Yes" = 1 (Orphan)
    if (
      value === "1" ||
      value === true ||
      value?.toString().toUpperCase().startsWith("Y")
    ) {
      return 1;
    }

    // Default to 0 (No - Not Orphan)
    return 0;
  };

  // Redirect if no userID is available
  useEffect(() => {
    if (!userID) {
      navigate('/signin', {
        state: {
          message: `Please sign in to access your ${formType} profile`
        }
      });
      return;
    }


    if (ipAddress) {
      fetchParentData();
    }
    checkCandidateStaffURL()
  }, [userID, ipAddress, navigate, formType]);

  const checkCandidateStaffURL = async () => {
    if (!userID) {
      return;
    }
    if (isInstituteUser) {
      return;
    }

    let response;
    if (userTypeID == 91) {
      response = await agent.get(`${CheckCandidateURL}?candidateId=${userID}&pageCode=Parent&userLoginId=${userLoginID}`);
    } else if (userTypeID == 95) {
      const payLoad = {
        staffID: userID,
        userLoginID: userLoginID,
        pageCode: 'Parent',
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

  // Fetch parent data from API
  const fetchParentData = async () => {
    try {
      startLoading();

      let response;

      if (currentEndpoints.userTypeIDName === "CandidateID") {
        response = await agent.get(currentEndpoints.get, {
          params: {
            [currentEndpoints.userTypeIDName]: userID,
            UserLoginID: userLoginID,
            PageCode: "Parent",
            IPAddress: ipAddress,
          },
        });
      } else {
        response = await agent.post(currentEndpoints.get, {
          [currentEndpoints.userTypeIDName]: userID,
          UserLoginID: userLoginID,
          PageCode: "Parent",
          IPAddress: ipAddress,
        });
      }

      if (response.data.Status === "Success") {
        const data = response.data.Data;

        setFormData({
          [currentEndpoints.userTypeIDName]: userID || 0,
          IsOrphan: mapIsOrphanFromAPI(data.IsOrphan),
          FatherTitle: data.FatherTitle || "Mr",
          FatherFirstName: data.FatherFirstName || "",
          FatherMiddleName: data.FatherMiddleName || "",
          FatherLastName: data.FatherLastName || "",
          MotherTitle: data.MotherTitle || "Ms",
          MotherFirstName: data.MotherFirstName || "",
          MotherMiddleName: data.MotherMiddleName || "",
          MotherLastName: data.MotherLastName || "",
          MaritalStatus: mapMaritalStatusFromAPI(data.MaritalStatus),
          SpouseTitle:
            data.SpouseTitle && data.SpouseTitle !== "-1"
              ? data.SpouseTitle
              : "",
          SpouseFirstName: data.SpouseFirstName || "",
          SpouseMiddleName: data.SpouseMiddleName || "",
          SpouseLastName: data.SpouseLastName || "",
          UserLoginID: userLoginID || "",
          IPAddress: ipAddress,
          PageCode: "Parent",
        });
      } else {
        // Don't show error for first-time users
      }
    } catch (error) {
      // Don't show error for first-time users
    } finally {
      stopLoading();
    }
  };

  const handleChange = (field, value) => {
    if (field === "isOrphan") {
      setFormData((prev) => ({
        ...prev,
        IsOrphan: value === "Yes" ? 1 : 0,
        ...(value === "Yes" && {
          FatherTitle: "Mr",
          FatherFirstName: "",
          FatherMiddleName: "",
          FatherLastName: "",
          MotherTitle: "Ms",
          MotherFirstName: "",
          MotherMiddleName: "",
          MotherLastName: "",
        }),
      }));
    } else if (field === "maritalStatus") {
      setFormData((prev) => ({
        ...prev,
        MaritalStatus: value,
        ...(value !== "Yes" && {
          SpouseTitle: "",
          SpouseFirstName: "",
          SpouseMiddleName: "",
          SpouseLastName: "",
        }),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (formData.IsOrphan === 0) {
      if (!formData.FatherTitle) newErrors.FatherTitle = "Required";
      if (!formData.FatherFirstName?.trim())
        newErrors.FatherFirstName = "Required";
      if (!formData.MotherTitle) newErrors.MotherTitle = "Required";
      if (!formData.MotherFirstName?.trim())
        newErrors.MotherFirstName = "Required";
    }

    if (formData.MaritalStatus === "Yes") {
      if (!formData.SpouseTitle) newErrors.SpouseTitle = "Required";
      if (!formData.SpouseFirstName?.trim())
        newErrors.SpouseFirstName = "Required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validate()) {
      try {
        startLoading();

        const requestBody = {
          [currentEndpoints.userTypeIDName]: userID,
          IsOrphan: formData.IsOrphan,
          FatherTitle: formData.IsOrphan === 0 ? formData.FatherTitle : '',
          FatherFirstName: formData.IsOrphan === 0 ? formData.FatherFirstName : '',
          FatherMiddleName: formData.IsOrphan === 0 ? formData.FatherMiddleName : '',
          FatherLastName: formData.IsOrphan === 0 ? formData.FatherLastName : '',
          MotherTitle: formData.IsOrphan === 0 ? formData.MotherTitle : '',
          MotherFirstName: formData.IsOrphan === 0 ? formData.MotherFirstName : '',
          MotherMiddleName: formData.IsOrphan === 0 ? formData.MotherMiddleName : '',
          MotherLastName: formData.IsOrphan === 0 ? formData.MotherLastName : '',
          MaritalStatus: mapMaritalStatusToAPI(formData.MaritalStatus),
          SpouseTitle: formData.MaritalStatus === 'Yes' ? formData.SpouseTitle : '',
          SpouseFirstName: formData.MaritalStatus === 'Yes' ? formData.SpouseFirstName : '',
          SpouseMiddleName: formData.MaritalStatus === 'Yes' ? formData.SpouseMiddleName : '',
          SpouseLastName: formData.MaritalStatus === 'Yes' ? formData.SpouseLastName : '',
          UserLoginID: userLoginID,
          IPAddress: ipAddress,
          PageCode: 'Parent'
        };

        const response = await agent.post(
          currentEndpoints.save,
          requestBody
        );

        if (response.data.Status === "Success") {
          Swal.fire({
            icon: "success",
            title: "Success!",
            text: `${formType.charAt(0).toUpperCase() + formType.slice(1)} parent details saved successfully.`,
            confirmButtonText: "Continue",
          }).then((result) => {
            if (isInstituteUser && candidateIdFromUrl) {
              navigate(
                `/Candidate/LockApplicationForm?candidateId=${effectiveCandidateId}&applicationId=${applicationId}`,
              );
            } else {
              navigate(`/${formType}/Category`);
            }
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Error saving data: " + response.data.Message,
          });
        }
      } catch (error) {
        console.error("Error submitting form:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error submitting form: " + error.message,
        });
      } finally {
        stopLoading();
      }
    }
  };

  const handleReset = () => {
    setFormData({
      [currentEndpoints.userTypeIDName]: userID || 0,
      IsOrphan: 0,
      FatherTitle: "Mr",
      FatherFirstName: "",
      FatherMiddleName: "",
      FatherLastName: "",
      MotherTitle: "Ms",
      MotherFirstName: "",
      MotherMiddleName: "",
      MotherLastName: "",
      MaritalStatus: "No",
      SpouseTitle: "",
      SpouseFirstName: "",
      SpouseMiddleName: "",
      SpouseLastName: "",
      UserLoginID: userLoginID || "",
      IPAddress: ipAddress,
      PageCode: "Parent",
    });
    setErrors({});
  };

  // Title options for dropdowns
  const titleOptions = [
    { value: "Mr", label: "Mr" },
    { value: "Mrs", label: "Mrs" },
    { value: "Ms", label: "Ms" },
    { value: "Dr", label: "Dr" },
  ];

  const fatherTitleOptions = [
    { value: "Mr", label: "Mr" },
    { value: "Dr", label: "Dr" },
  ];

  const motherTitleOptions = [
    { value: "Ms", label: "Ms" },
    { value: "Mrs", label: "Mrs" },
    { value: "Dr", label: "Dr" },
  ];

  // Custom Radio Button Component
  const RadioButton = ({ name, value, checked, onChange, label }) => {
    return (
      <label className="flex cursor-pointer items-center">
        <div className="relative">
          <input
            type="radio"
            name={name}
            checked={checked}
            onChange={onChange}
            className="sr-only"
          />
          <div
            className={`w-5 h-5 border-2 rounded-full ${checked ? "border-sky-500" : "border-gray-300"} flex items-center justify-center`}
          >
            {checked && <div className="h-3 w-3 rounded-full bg-sky-500"></div>}
          </div>
        </div>
        <span className="ml-2">{label}</span>
      </label>
    );
  };

  return (
    <div className="mx-auto w-full rounded-lg bg-white p-6 shadow-md">
      <div>
        <ProgressTracker />
      </div>
      <fieldset className="mb-4 rounded-md border p-4">
        <legend
          className={`flex ${color} items-center text-base font-semibold text-white border-2 border-gray-300 px-3 py-1.5 rounded-md ml-4`}
        >
          <Users className="mr-2" size={18} />
          Parent / Guardian Details
        </legend>

        <div className="mb-6 mt-4 flex items-center justify-center gap-4">
          <label className="font-normal">
            {/*<strong>Orphan {formType}</strong> <span className="text-red-500">*</span>*/}
            <strong>Are you Orphan </strong>{" "}
            <span className="text-red-500">*</span>
          </label>
          <div className="inline-flex gap-6">
            <RadioButton
              name="isOrphan"
              value="Yes"
              checked={formData.IsOrphan === 1}
              onChange={() => handleChange("isOrphan", "Yes")}
              label="Yes"
            />
            <RadioButton
              name="isOrphan"
              value="No"
              checked={formData.IsOrphan === 0}
              onChange={() => handleChange("isOrphan", "No")}
              label="No"
            />
          </div>
        </div>

        {formData.IsOrphan === 0 && (
          <>
            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
              <FormComponent
                label={<strong>Father's Title</strong>}
                isSelect={true}
                options={fatherTitleOptions}
                value={formData.FatherTitle}
                onChange={(value) => handleChange("FatherTitle", value)}
                error={errors.FatherTitle}
                required={true}
                extraClass="font-medium"
              />
              <FormComponent
                label={<strong>Father's First Name</strong>}
                value={formData.FatherFirstName}
                onChange={(value) => {
                  if (/^[A-Za-z\s]*$/.test(value)) {
                    handleChange("FatherFirstName", value);
                  }
                }}
                error={errors.FatherFirstName}
                required={true}
                extraClass="font-medium"
              />
              <FormComponent
                label={<strong>Father's Middle/ Father/ Husband Name</strong>}
                value={formData.FatherMiddleName}
                onChange={(value) => {
                  if (/^[A-Za-z\s]*$/.test(value)) {
                    handleChange("FatherMiddleName", value);
                  }
                }}
                extraClass="font-medium"
              />
              <FormComponent
                label={<strong>Father's Last/ Surname</strong>}
                value={formData.FatherLastName}
                onChange={(value) => {
                  if (/^[A-Za-z\s]*$/.test(value)) {
                    handleChange("FatherLastName", value);
                  }
                }}
                extraClass="font-medium"
              />
            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
              <FormComponent
                label={<strong>Mother's Title</strong>}
                isSelect={true}
                options={motherTitleOptions}
                value={formData.MotherTitle}
                onChange={(value) => handleChange("MotherTitle", value)}
                error={errors.MotherTitle}
                required={true}
                extraClass="font-medium"
              />
              <FormComponent
                label={<strong>Mother's First Name</strong>}
                value={formData.MotherFirstName}
                onChange={(value) => {
                  if (/^[A-Za-z\s]*$/.test(value)) {
                    handleChange("MotherFirstName", value);
                  }
                }}
                error={errors.MotherFirstName}
                required={true}
                extraClass="font-medium"
              />
              <FormComponent
                label={<strong>Mother's Middle/ Father/ Husband Name</strong>}
                value={formData.MotherMiddleName}
                onChange={(value) => {
                  if (/^[A-Za-z\s]*$/.test(value)) {
                    handleChange("MotherMiddleName", value);
                  }
                }}
                extraClass="font-medium"
              />
              <FormComponent
                label={<strong>Mother's Last/ Surname</strong>}
                value={formData.MotherLastName}
                onChange={(value) => {
                  if (/^[A-Za-z\s]*$/.test(value)) {
                    handleChange("MotherLastName", value);
                  }
                }}
                extraClass="font-medium"
              />
            </div>
          </>
        )}
      </fieldset>
      {userTypeID === 95 && (
        <fieldset className="mb-4 rounded-md border p-4">
          <legend
            className={`flex ${color} items-center text-base font-semibold text-white border-2 border-gray-300 px-3 py-1.5 rounded-md ml-4`}
          >
            <Handshake className="mr-2" size={18} />
            Marital Status Details
          </legend>

          <div className="mb-6 mt-4 flex items-center justify-center gap-4">
            <label className="font-normal">
              <strong>Marital Status</strong>{" "}
              <span className="text-red-500">*</span>
            </label>
            <div className="inline-flex gap-6">
              <RadioButton
                name="maritalStatus"
                value="Skip"
                checked={formData.MaritalStatus === "Skip"}
                onChange={() => handleChange("maritalStatus", "Skip")}
                label="Skip"
              />
              <RadioButton
                name="maritalStatus"
                value="Yes"
                checked={formData.MaritalStatus === "Yes"}
                onChange={() => handleChange("maritalStatus", "Yes")}
                label="Yes"
              />
              <RadioButton
                name="maritalStatus"
                value="No"
                checked={formData.MaritalStatus === "No"}
                onChange={() => handleChange("maritalStatus", "No")}
                label="No"
              />
            </div>
          </div>

          {formData.MaritalStatus === "Yes" && (
            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
              <FormComponent
                label={<strong>Spouse's Title</strong>}
                isSelect={true}
                options={titleOptions}
                value={formData.SpouseTitle}
                onChange={(value) => handleChange("SpouseTitle", value)}
                error={errors.SpouseTitle}
                required={true}
                extraClass="font-medium"
              />
              <FormComponent
                label={<strong>Spouse's First Name</strong>}
                value={formData.SpouseFirstName}
                onChange={(value) => {
                  if (/^[A-Za-z\s]*$/.test(value)) {
                    handleChange("SpouseFirstName", value);
                  }
                }}
                error={errors.SpouseFirstName}
                required={true}
                extraClass="font-medium"
              />
              <FormComponent
                label={<strong>Spouse's Middle/ Father/ Husband Name</strong>}
                value={formData.SpouseMiddleName}
                onChange={(value) => {
                  if (/^[A-Za-z\s]*$/.test(value)) {
                    handleChange("SpouseMiddleName", value);
                  }
                }}
                extraClass="font-medium"
              />
              <FormComponent
                label={<strong>Spouse's Last/ Surname</strong>}
                value={formData.SpouseLastName}
                onChange={(value) => {
                  if (/^[A-Za-z\s]*$/.test(value)) {
                    handleChange("SpouseLastName", value);
                  }
                }}
                extraClass="font-medium"
              />
            </div>
          )}
        </fieldset>
      )}

      <div className="mt-8 flex justify-center space-x-4">
        <button
          onClick={handleReset}
          className="rounded-md bg-red-500 px-4 py-2 text-white hover:bg-gray-300"
        >
          Reset
        </button>
        <button
          onClick={handleSubmit}
          className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-600"
        >
          Save & Next
        </button>
      </div>
    </div>
  );
};

export default ParentGuardianForm;
