import { useState, useEffect, useMemo, useRef, useContext } from "react";
import agent from "../../../lib/api/agent";
import { Trash2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ProgressTracker from "./ProgressTracker";
import DropdownComponent from "../../formcomponent/DropdownComponent";
import FilteredTableComponent from "../../formcomponent/FilteredTableComponent";
import Swal from "sweetalert2";
import { useLoading } from "../../../Hooks/useLoading";
import { GetMasterTableList } from "../../../Endpoints_All/Base/masterData";
import {
  GetCandidateAdditional,
  SaveCandidateAdditional,
  SaveCandidateLanguage,
  GetCandidateLanguageList,
  DeleteCandidateLanguage
} from '../../../Endpoints_All/Candidate/additional';

import {
  GetStaffAdditional,
  SaveStaffAdditional,
  SaveStaffLanguage,
  GetStaffLanguageList,
  DeleteStaffLanguage,
} from "../../../Endpoints_All/Staff/additional";

import {
  GetBlood_Groups,
  GetLanguages
} from '../../../Endpoints_All/Base/masterData';
import { getDeviceIP } from '../../../utils/CommonHelper';
import { useAuth } from '../../../hooks/AuthContext';
import { CheckCandidateURL } from '../../../Endpoints_All/Candidate/summary';
import { CheckStaffURL } from '../../../Endpoints_All/Staff/summary';
import { ThemeContext } from "../../../Component/Context/ThemeContext";





const AdditionalDetails = () => {
  // Use useRef to track if initial fetch has been done
  const initialFetchDone = useRef(false);
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const candidateIdFromUrl = searchParams.get("candidateId");
  const applicationId = searchParams.get("applicationId");

  const { userInfo } = useAuth();

  const userTypeID = Number(userInfo?.UserTypeID);
  const userLoginID = userInfo?.UserLoginID;
  const loggedInUserID = userInfo?.UserID;
  const [ipAddress, setIpAddress] = useState("");

  // UserTypeID 61 = Institute/Staff viewing candidate
  const isInstituteUser = userTypeID === 61;

  const formType =
    isInstituteUser || candidateIdFromUrl || userTypeID === 91
      ? "Candidate"
      : "Staff";

  const userID = isInstituteUser
    ? candidateIdFromUrl
    : candidateIdFromUrl || loggedInUserID;
  const API_ENDPOINTS = useMemo(
    () => ({
      Candidate: {
        get: GetCandidateAdditional,
        save: SaveCandidateAdditional,
        saveLanguage: SaveCandidateLanguage,
        getLanguage: GetCandidateLanguageList,
        userTypeIDName: "CandidateID",
      },
      Staff: {
        get: GetStaffAdditional,
        save: SaveStaffAdditional,
        saveLanguage: SaveStaffLanguage,
        getLanguage: GetStaffLanguageList,
        userTypeIDName: "StaffID",
      },
    }),
    [],
  ); // Empty dependency array - create once

  const currentEndpoints = useMemo(
    () => API_ENDPOINTS[formType],
    [formType, API_ENDPOINTS],
  );

  const GET_MasterLanguage_API = `${GetMasterTableList}?TableName=Master_Language&DataValueField=LanguageID&DataTextField=Language&HasSelect=true`;
  // State variables
  const [bloodGroups, setBloodGroups] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [formData, setFormData] = useState({
    [currentEndpoints.userTypeIDName]: userID || 0,
    BloodGroupID: "0",
    MotherTongueID: "0",
    UserLoginID: userLoginID || "",
    IPAddress: ipAddress,
    PageCode: "Additional",
  });
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [languageAbilities, setLanguageAbilities] = useState({
    read: false,
    write: false,
    speak: false,
  });
  const [userLanguages, setUserLanguages] = useState([]);
  const [errors, setErrors] = useState({});
  const [addingLanguage, setAddingLanguage] = useState(false);
  const { color } = useContext(ThemeContext);

  // Initialize useLoading hook
  const { startLoading, stopLoading } = useLoading();

  // Transformed data for dropdown component
  const bloodGroupOptions = useMemo(
    () =>
      bloodGroups.map((group) => ({
        value: String(group.BloodGroupID),
        label: group.BloodGroup,
      })),
    [bloodGroups],
  );

  const languageOptions = useMemo(
    () =>
      languages.map((language) => ({
        value: String(language.Value),
        label: language.Text,
      })),
    [languages],
  );

  // Columns for the Languages Known FilteredTableComponent
  const languageColumns = useMemo(
    () => [
      {
        key: "action",
        header: "Action",
        width: "70px",
        sortable: false,
        headerClassName: "text-center",
        className: "text-center",
      },
      {
        key: "languageName",
        header: "Language",
        headerClassName: "text-left",
        className: "text-left",
      },
      {
        key: "canRead",
        header: "Read",
        headerClassName: "text-center",
        className: "text-center",
      },
      {
        key: "canWrite",
        header: "Write",
        headerClassName: "text-center",
        className: "text-center",
      },
      {
        key: "canSpeak",
        header: "Speak",
        headerClassName: "text-center",
        className: "text-center",
      },
    ],
    [],
  );

  const renderLanguageCell = (item, column) => {
    if (column.key === "action") {
      return (
        <button
          onClick={() => handleRemoveLanguage(item.id)}
          className="text-red-600 hover:text-red-800"
        >
          <Trash2 size={16} />
        </button>
      );
    }
    if (column.key === "canRead") return item.canRead ? "Yes" : "No";
    if (column.key === "canWrite") return item.canWrite ? "Yes" : "No";
    if (column.key === "canSpeak") return item.canSpeak ? "Yes" : "No";
    return undefined;
  };

  useEffect(() => {
    fetchIP();
    checkCandidateStaffURL();
  }, []);

  // Fetch initial data
  useEffect(() => {
    // Create a flag to track if the component is still mounted
    let isMounted = true;

    const fetchInitialData = async () => {
      // Skip if we've already fetched or if component is unmounted
      if (!isMounted || initialFetchDone.current) {
        return;
      }

      try {
        startLoading();

        await Promise.all([
          fetchBloodGroups(),
          fetchLanguages(),
          fetchUserData(),
          fetchUserLanguages(),
        ]);

        // Mark initial fetch as done
        initialFetchDone.current = true;
      } finally {
        if (isMounted) {
          stopLoading();
        }
      }
    };

    // Only fetch data if userID exists and we haven't fetched yet
    if (userID && !initialFetchDone.current) {
      fetchInitialData();
    }

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [userID]); // Only depend on userID

  const fetchIP = async () => {
    try {
      const ip = await getDeviceIP();
      setIpAddress(ip);
    } catch (err) {
      console.error("Failed to get IP:", err);
      setIpAddress('');
    }
  };

  const checkCandidateStaffURL = async () => {
    if (!userID) {
      return;
    }
    if (userTypeID === 61) {
      return;
    }
    let response;
    if (userTypeID == 91) {
      response = await agent.get(`${CheckCandidateURL}?candidateId=${userID}&pageCode=Additional&userLoginId=${userLoginID}`);
    } else if (userTypeID == 95) {
      const payLoad = {
        staffID: userID,
        userLoginID: userLoginID,
        pageCode: 'Additional',
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


  // Fetch blood groups with cancellation token
  const fetchBloodGroups = async () => {
    const controller = new AbortController();
    const signal = controller.signal;

    try {
      const response = await agent.get(GetBlood_Groups, { signal });
      if (response.data.Status === "Success") {
        setBloodGroups(response.data.Data || []);
      } else {
        showErrorAlert("Failed to fetch blood groups: " + response.data.Message);
      }

    } catch (error) {
      // if (!agent.isCancel(error)) {
      //     throw error;
      // }
      console.error(error)
    }

    return () => {
      controller.abort();
    };
  };

  // Fetch languages with cancellation token
  const fetchLanguages = async () => {
    const controller = new AbortController();
    //const signal = controller.signal;

    try {
      try {
        const response = await agent.get(GET_MasterLanguage_API);
        if (response.data.Status === "Success") {
          const langData = response.data.Data.filter(item => item.Value !== "-1");
          setLanguages(langData);
        }
      } catch (error) {
        console.error("Error fetching states:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: `Error loading states: ${error.message}`
        });
      }
    } catch (error) {
      // if (!agent.isCancel(error)) {
      //     throw error;
      // }
      console.error(error)
    }

    return () => {
      controller.abort();
    };
  };

  // Fetch user's existing languages with cancellation token
  // Fetch user's existing languages
  const fetchUserLanguages = async () => {
    const controller = new AbortController();
    const signal = controller.signal;

    try {
      const params = {
        [currentEndpoints.userTypeIDName.toLowerCase()]: userID,
        UserLoginID: userLoginID,
        PageCode: "Additional",
        IPAddress: ipAddress,
      };


      const response = await agent.get(currentEndpoints.getLanguage, {
        params,
        signal,
      });


      if (response.data.Status === "Success" && Array.isArray(response.data.Data)) {
        const mappedLanguages = response.data.Data.map(lang => ({
          id: lang.LanguageRowID,
          languageRowID: lang.LanguageRowID,
          languageId: lang.LanguageID,
          languageName: lang.Language,
          canRead: lang.Read === 1,
          canWrite: lang.Write === 1,
          canSpeak: lang.Speak === 1
        }));
        setUserLanguages(mappedLanguages);
      } else if (response.data.Status === "Success" && !Array.isArray(response.data.Data)) {
        setUserLanguages([]);
      } else {
        if (response.data.Status !== "Success") {
        }
      }
    } catch (error) {
      console.error('Error fetching languages:', error);
    }

    return () => {
      controller.abort();
    };
  };

  // Fetch user data with cancellation token
  const fetchUserData = async () => {
    const controller = new AbortController();
    const signal = controller.signal;

    try {
      let response;

      if (formType === "Candidate") {
        const params = {
          [currentEndpoints.userTypeIDName.toLowerCase()]: userID,
          UserLoginID: userLoginID,
          PageCode: "Additional",
          IPAddress: ipAddress,
        };
        response = await agent.get(currentEndpoints.get, { params, signal });
      } else {
        const data = {
          [currentEndpoints.userTypeIDName]: userID,
          UserLoginID: userLoginID,
          PageCode: "Additional",
          IPAddress: ipAddress,
        };
        response = await agent.post(currentEndpoints.get, data, { signal });
      }

      if (response.data.Status === "Success") {
        const data = response.data.Data || {};

        // Set default values from the API response - using functional update to avoid stale state
        setFormData(prev => ({
          ...prev,
          [currentEndpoints.userTypeIDName]: userID || 0,
          BloodGroupID: String(data.BloodGroupID || "0"),
          MotherTongueID: String(data.MotherTongueID || "0"),
          UserLoginID: userLoginID || '',
          IPAddress: ipAddress,
          PageCode: 'Additional'
        }));
      }
      //else {
      //    showErrorAlert(`Failed to fetch ${formType} additional data: ${response.data.Message}`);
      //}
    } catch (error) {
      // if (!agent.isCancel(error)) {
      //     //showErrorAlert(`Error fetching ${formType} additional data: ${error.message}`);
      //     throw error;
      // }
      //showErrorAlert('Error fetching user data: ' + error.message);
      console.error(error)
    }

    return () => {
      controller.abort();
    };
  };

  // Show success alert
  const showSuccessAlert = (message) => {
    Swal.fire({
      title: "Success!",
      text: message,
      icon: "success",
      confirmButtonColor: "#3085d6",
    });
  };

  // Show error alert
  const showErrorAlert = (message) => {
    Swal.fire({
      title: "Error!",
      text: message,
      icon: "error",
      confirmButtonColor: "#d33",
    });
  };

  // Show confirmation alert
  const showConfirmAlert = (message, callback) => {
    Swal.fire({
      title: "Are you sure?",
      text: message,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, continue!",
    }).then((result) => {
      if (result.isConfirmed) {
        callback();
      }
    });
  };

  // Handle form changes
  const handleChange = (field, value) => {
    // setFormData(prev => ({
    //     ...prev,
    //     [field]: value
    // }));
    if (field === "BloodGroupID" || field === "MotherTongueID") {
      setFormData((prev) => ({
        ...prev,
        [field]: String(value || "0"), // Convert to string
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

  // Handle language selection
  const handleLanguageChange = (value) => {
    setSelectedLanguage(value);
  };

  // Handle language ability checkboxes
  const handleAbilityChange = (ability) => {
    setLanguageAbilities((prev) => ({
      ...prev,
      [ability]: !prev[ability],
    }));
  };

  // Add selected language
  // Add selected language
  const handleAddLanguage = async () => {
    if (!selectedLanguage) {
      setErrors((prev) => ({
        ...prev,
        selectedLanguage: "Please select a language",
      }));
      return;
    }

    if (!languageAbilities.read && !languageAbilities.write && !languageAbilities.speak) {
      setErrors((prev) => ({
        ...prev,
        abilities: "Please select at least one ability",
      }));
      return;
    }

    const language = languages.find(
      (lang) => lang.Value.toString() === selectedLanguage.toString(),
    );

    if (language) {
      try {
        setAddingLanguage(true);
        setErrors((prev) => ({ ...prev, selectedLanguage: "", abilities: "" }));

        // Check if language already exists
        const existingLang = userLanguages.find(
          (lang) => lang.languageId.toString() === language.Value.toString(),
        );

        if (existingLang) {
          showErrorAlert("This language is already added. Please select a different language.");
          setAddingLanguage(false);
          return;
        }

        const languagePayload = {
          LanguageRowID: 0,
          [currentEndpoints.userTypeIDName]: userID,
          LanguageID: language.Value,
          Language: language.Text,
          Read: languageAbilities.read ? 1 : 0,
          ReadStr: languageAbilities.read ? "Yes" : "No",
          Write: languageAbilities.write ? 1 : 0,
          WriteStr: languageAbilities.write ? "Yes" : "No",
          Speak: languageAbilities.speak ? 1 : 0,
          SpeakStr: languageAbilities.speak ? "Yes" : "No",
          UserLoginID: userLoginID,
          IPAddress: ipAddress,
          PageCode: "Additional",
        };

        const response = await agent.post(currentEndpoints.saveLanguage, languagePayload);

        if (response.data.Status === "Success") {

          // Try different possible response structures
          let languageRowID = 0;
          if (response.data.Data?.LanguageRowID) {
            languageRowID = response.data.Data.LanguageRowID;
          } else if (response.data.Data && typeof response.data.Data === 'object') {
            // If Data is the language object itself
            languageRowID = response.data.Data.LanguageRowID || 0;
          } else if (typeof response.data.Data === 'number') {
            // If Data is just the ID
            languageRowID = response.data.Data;
          }

          // If we still don't have an ID, we need to refetch the languages list
          if (!languageRowID || languageRowID === 0) {
            // Refetch to get the correct ID
            await fetchUserLanguages();
            showSuccessAlert("Language added successfully");
            setSelectedLanguage("");
            setLanguageAbilities({ read: false, write: false, speak: false });
            setAddingLanguage(false);
            return;
          }

          const newLanguage = {
            id: languageRowID,
            languageRowID: languageRowID,
            languageId: language.Value,
            languageName: language.Text,
            canRead: languageAbilities.read,
            canWrite: languageAbilities.write,
            canSpeak: languageAbilities.speak,
          };

          setUserLanguages((prev) => [...prev, newLanguage]);

          setSelectedLanguage("");
          setLanguageAbilities({ read: false, write: false, speak: false });

          showSuccessAlert("Language added successfully");
        } else {
          showErrorAlert("Error adding language: " + response.data.Message);
        }
      } catch (error) {
        console.error('Add language error:', error);
        showErrorAlert("Error adding language: " + error.message);
      } finally {
        setAddingLanguage(false);
      }
    }
  };

  const handleRemoveLanguage = async (id) => {
    const languageToRemove = userLanguages.find((lang) => lang.id === id);

    if (languageToRemove) {
      showConfirmAlert("Are you sure you want to remove this language?", async () => {
        try {

          // Determine the correct LanguageRowID
          let languageRowID = languageToRemove.languageRowID || languageToRemove.id;

          // Check if it's a temporary ID (string with hyphen)
          if (typeof languageRowID === 'string' && languageRowID.includes('-')) {
            // Temporary ID - just remove from local state
            setUserLanguages(prev => prev.filter(lang => lang.id !== id));
            showSuccessAlert("Language removed from list");
            return;
          }

          // Convert to number if string
          if (typeof languageRowID === 'string') {
            languageRowID = parseInt(languageRowID, 10);
          }

          // If no valid ID, remove from local state only
          if (!languageRowID || isNaN(languageRowID) || languageRowID <= 0) {
            setUserLanguages(prev => prev.filter(lang => lang.id !== id));
            showSuccessAlert("Language removed from list");
            return;
          }

          const payload = {
            LanguageRowID: languageRowID,
            [currentEndpoints.userTypeIDName]: userID || 0,
            LanguageID: languageToRemove.languageId || 0,
            Language: languageToRemove.languageName || "",
            Read: languageToRemove.canRead ? 1 : 0,
            ReadStr: languageToRemove.canRead ? "Yes" : "No",
            Write: languageToRemove.canWrite ? 1 : 0,
            WriteStr: languageToRemove.canWrite ? "Yes" : "No",
            Speak: languageToRemove.canSpeak ? 1 : 0,
            SpeakStr: languageToRemove.canSpeak ? "Yes" : "No",
            UserLoginID: userLoginID || "",
            IPAddress: ipAddress || "ipAddress",
            PageCode: "Additional"
          };


          let response;
          if (userTypeID === 95) {
            response = await agent.post(DeleteStaffLanguage, payload);
          } else {
            response = await agent.post(DeleteCandidateLanguage, payload);
          }

          // Check if deletion was successful
          if (response.data.Status === "Success") {
            setUserLanguages(prev => prev.filter(lang => lang.id !== id));
            showSuccessAlert("Language removed successfully");
          } else if (response.data.Data === 'Y' || response.data.Data === true) {
            setUserLanguages(prev => prev.filter(lang => lang.id !== id));
            showSuccessAlert("Language removed successfully");
          } else {
            // If the API returns a different success indicator, check for it
            const isSuccess = response.data.success === true ||
              response.data.isSuccess === true ||
              response.data.Data === 1;

            if (isSuccess) {
              setUserLanguages(prev => prev.filter(lang => lang.id !== id));
              showSuccessAlert("Language removed successfully");
            } else {
              throw new Error(response.data?.Message || response.data?.message || 'Failed to delete language');
            }
          }
        } catch (error) {
          console.error('Delete error:', error);
          if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
          }
          const errorMessage = error.response?.data?.message || error.message || 'Failed to delete language';
          showErrorAlert('Error removing language: ' + errorMessage);
        }
      });
    }
  };

  // Add this function to refetch languages from the server
  const refetchLanguages = async () => {
    try {
      const params = {
        [currentEndpoints.userTypeIDName.toLowerCase()]: userID,
        UserLoginID: userLoginID,
        PageCode: "Additional",
        IPAddress: ipAddress,
      };

      const response = await agent.get(currentEndpoints.getLanguage, { params });

      if (response.data.Status === "Success" && Array.isArray(response.data.Data)) {
        const mappedLanguages = response.data.Data.map(lang => ({
          id: lang.LanguageRowID,
          languageRowID: lang.LanguageRowID,
          languageId: lang.LanguageID,
          languageName: lang.Language,
          canRead: lang.Read === 1,
          canWrite: lang.Write === 1,
          canSpeak: lang.Speak === 1
        }));
        setUserLanguages(mappedLanguages);
      } else {
        setUserLanguages([]);
      }
    } catch (error) {
      console.error('Error refetching languages:', error);
    }
  };

  // Form validation
  const validate = () => {
    const newErrors = {};

    if (!formData.BloodGroupID || formData.BloodGroupID === "0") {
      newErrors.BloodGroupID = true;
    }

    if (!formData.MotherTongueID || formData.MotherTongueID === "0") {
      newErrors.MotherTongueID = true;
    }

    if (userLanguages.length === 0) {
      newErrors.languages = true;
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // Save form data
  const handleSubmit = async () => {
    if (validate()) {
      try {
        const requestBody = {
          ...formData,
        };

        const response = await agent.post(currentEndpoints.save, requestBody);
        if (response.data.Status === "Success") {
          showSuccessAlert(
            `${formType} additional details saved successfully.`,
          );

          const isInstituteUser = userTypeID === 61;

          if (isInstituteUser && candidateIdFromUrl) {
            navigate(
              `/Candidate/LockApplicationForm?candidateId=${candidateIdFromUrl}&applicationId=${applicationId}`,
            );
          } else {
            navigate(`/${formType}/Bank`);
          }
        } else {
          showErrorAlert("Error saving data: " + response.data.Message);
        }
      } catch (error) {
        showErrorAlert("Error submitting form: " + error.message);
      }
    }
  };

  // Reset form data
  const handleReset = () => {
    showConfirmAlert("Are you sure you want to reset the form?", () => {

        setErrors({});

        setFormData({
            [currentEndpoints.userTypeIDName]: userID || 0,
            BloodGroupID: "0",
            MotherTongueID: "0",
            UserLoginID: userLoginID || "",
            IPAddress: ipAddress,
            PageCode: "Additional",
        });
        setSelectedLanguage("");
        setLanguageAbilities({
            read: false,
            write: false,
            speak: false,
        });
    });
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
          Additional Details
        </legend>

        <div className="mt-4">
          <div className="flex items-start">
            <div className="mr-4">
              <p className="mt-1 text-sm text-gray-600">Ancillary Details</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mt-4">
            {/* Blood Group */}
            <div>
              <DropdownComponent
                label="Blood Group"
                options={bloodGroupOptions}
                value={String(formData.BloodGroupID)}
                onChange={(value) => handleChange("BloodGroupID", value)}
                error={!!errors.BloodGroupID}
                required={true}
                disabled={false}
              />

              {errors.BloodGroupID && (
                <span className="text-sm text-red-500">
                  Blood Group is required
                </span>
              )}
            </div>

            {/* Mother Tongue */}
            <div>
              <DropdownComponent
                label="Mother Tongue"
                options={languageOptions}
                value={String(formData.MotherTongueID)}
                onChange={(value) => handleChange("MotherTongueID", value)}
                error={!!errors.MotherTongueID}
                required={true}
                disabled={false}
              />

              {errors.MotherTongueID && (
                <span className="text-sm text-red-500">
                  Mother Tongue is required
                </span>
              )}
            </div>
          </div>

          {/* Languages Known - Full width row */}
          <div className="mt-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="w-full md:w-1/2">
                <DropdownComponent
                  label="Languages Known"
                  options={languageOptions}
                  value={selectedLanguage}
                  onChange={handleLanguageChange}
                  error={!!errors.selectedLanguage || !!errors.languages}
                  required={true}
                  disabled={false}
                />

                {errors.selectedLanguage && (
                  <span className="text-sm text-red-500">
                    {errors.selectedLanguage}
                  </span>
                )}

                {errors.languages && (
                  <span className="text-sm text-red-500">
                    At least one language is required
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={languageAbilities.read}
                    onChange={() => handleAbilityChange("read")}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-normal">Read</span>
                </label>

                <label className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={languageAbilities.write}
                    onChange={() => handleAbilityChange("write")}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-normal">Write</span>
                </label>

                <label className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={languageAbilities.speak}
                    onChange={() => handleAbilityChange("speak")}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-normal">Speak</span>
                </label>

                <button
                  onClick={handleAddLanguage}
                  disabled={
                    !selectedLanguage ||
                    (!languageAbilities.read &&
                      !languageAbilities.write &&
                      !languageAbilities.speak) ||
                    addingLanguage
                  }
                  className="rounded-md bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  {addingLanguage ? "Adding..." : "Add"}
                </button>
              </div>
            </div>
            {errors.abilities && (
              <div className="mt-1 text-sm text-red-500">
                {errors.abilities}
              </div>
            )}
            {errors.languages && (
              <div className="mt-1 text-sm text-red-500">
                {errors.languages}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex justify-center space-x-4">
            <button
              onClick={handleReset}
              className="rounded-md bg-red-500 px-4 py-2 text-white hover:bg-gray-300 flex items-center"
            >
              Reset
            </button>
            <button
              onClick={handleSubmit}
              className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 flex items-center"
            >
              Save & Next
            </button>
          </div>

          {/* Languages Table */}
          <div className="mt-4">
            <FilteredTableComponent
              data={userLanguages}
              columns={languageColumns}
              renderCell={renderLanguageCell}
              searchable={false}
              sortable={false}
              exportable={false}
              showSearch={false}
              showExport={false}
              paginate={false}
              stickyHeader={false}
              tableId="languages-known-table"
              emptyStateMessage="No languages added"
              emptyStateSubMessage=""
              maxHeight="none"
            />
          </div>
        </div>
      </fieldset>
    </div>
  );
};

export default AdditionalDetails;
