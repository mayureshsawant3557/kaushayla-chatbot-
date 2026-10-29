import { useState, useEffect, useRef, useContext } from "react";
import agent from "../../../lib/api/agent";
import Swal from "sweetalert2";
import ProgressTracker from "./ProgressTracker";
import { useNavigate } from "react-router-dom";
//import { getIpAndLocation } from "../../../pages/DeviceDetails";
import {
    SaveSectorialExpertise,
    GetStaffSectorialExpertiseList
} from '../../../Endpoints_All/Staff/workExperience';
import { getIp } from '../../../Endpoints_All/Utils/fileUpload';
import { useAuth } from '../../../Hooks/AuthContext';
import { ThemeContext } from "../../../Component/Context/ThemeContext";
import { CheckStaffURL } from '../../../Endpoints_All/Staff/summary';
import { CheckCandidateURL } from '../../../Endpoints_All/Candidate/summary';
 const SectorialExpertise = () => {
    // Use useRef to track if initial fetch has been done
    const initialFetchDone = useRef(false);
    const {userInfo} = useAuth();
    const userLoginID = userInfo?.UserLoginID;
    const staffID = userInfo?.UserID;
    const userTypeID = userInfo?.UserTypeID;
    const formType = userTypeID === 91 ? 'Candidate' : 'Staff';
    const navigate = useNavigate();

  // Master list of all sectorial expertise with IDs
const sectorialExpertiseList = [
  { id: 1, name: "AGRICULTURE SECTOR" },
  { id: 2, name: "APPAREL MADE-UPS AND HOME FURNISHING SECTOR" },
  { id: 3, name: "AUTOMOTIVE SECTOR" },
  { id: 4, name: "BEAUTY AND WELLNESS SECTOR" },
  { id: 5, name: "BFSI SECTOR" },
  { id: 6, name: "CAPITAL GOODS SECTOR" },
  { id: 7, name: "CONSTRUCTION SECTOR" },
  { id: 8, name: "ELECTRONICS SECTOR" },
  { id: 9, name: "FURNITURE AND FITTINGS SECTOR" },
  { id: 10, name: "HEALTHCARE SECTOR" },
  {
    id: 11,
    name: "INSTRUMENTATION, AUTOMATION, SURVEILLANCE AND COMMUNICATION SECTOR",
  },
  { id: 12, name: "IT-ITES SECTOR" },
  { id: 13, name: "LEATHER SECTOR" },
  { id: 14, name: "MANAGEMENT, ENTREPRENEURSHIP AND PROFESSIONAL SECTOR" },
  { id: 15, name: "MEDIA, ENTERTAINMENT AND ART SECTOR" },
  { id: 16, name: "POWER SECTOR" },
  { id: 17, name: "PRINTING AND PACKAGING SECTOR" },
  { id: 18, name: "RUBBER, CHEMICAL AND PETROCHEMICAL SECTOR" },
  {
    id: 19,
    name: "SPORTS, PHYSICAL EDUCATION, FITNESS AND LEISURE SECTOR",
  },
  { id: 20, name: "TEXTILE SECTOR" },
  { id: 21, name: "TOURISM AND HOSPITALITY SECTOR" },
  { id: 22, name: "WATER MANAGEMENT & PLUMBING SECTOR" },
  { id: 23, name: "AEROSPACE AND AVIATION SECTOR" },
  { id: 24, name: "FOOD INDUSTRY SECTOR" },
  { id: 25, name: "DOMESTIC WORKERS SECTOR" },
  { id: 26, name: "GEM AND JEWELLERY SECTOR" },
  { id: 27, name: "GREEN JOBS SECTOR" },
  { id: 28, name: "HANDICRAFTS AND CARPET SECTOR" },
  { id: 29, name: "HYDROCARBON SECTOR" },
  { id: 30, name: "INFRASTRUCTURE EQUIPMENT SECTOR" },
  { id: 31, name: "IRON AND STEEL SECTOR" },
  { id: 32, name: "LIFE SCIENCE SECTOR" },
  { id: 33, name: "LOGISTICS SECTOR" },
  { id: 34, name: "MINING SECTOR" },
  { id: 35, name: "PAINTS AND COATINGS SECTOR" },
  { id: 36, name: "PERSONS WITH DISABILITY SECTOR" },
  { id: 37, name: "RETAIL SECTOR" },
  { id: 38, name: "TELECOM SECTOR" },
  { id: 39, name: "CROSS SECTORAL" },
];

  // State variables
  const [hasSectorialExperience, setHasSectorialExperience] = useState(null);
  const [selectedSectors, setSelectedSectors] = useState([]);
  const [preservedSectors, setPreservedSectors] = useState([]);
  const [ipAddress, setIpAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { color } = useContext(ThemeContext);

  // API endpoints
  const SAVE_SECTORIAL_EXPERTISE_URL = SaveSectorialExpertise;
  const GET_STAFF_SECTORIAL_EXPERTISE_URL = GetStaffSectorialExpertiseList;

  // ✅ Helper function to map IsSectorialExperience from API to UI
  const mapIsSectorialExperienceFromAPI = (value) => {
    if (!value) return null;
    const strValue = value.toString().trim();

    if (strValue === "1") return "Yes";
    if (strValue === "-1") return "Skip";
    if (strValue === "0" || strValue === "0 ") return "No";

    return null;
  };

  // ✅ Helper function to map IsSectorialExperience from UI to API
  const mapIsSectorialExperienceToAPI = (value) => {
    if (!value) return "0";

    const valueUpper = value.toString().toUpperCase();

    if (valueUpper === "YES" || valueUpper.startsWith("Y")) return "1";
    if (valueUpper === "SKIP" || valueUpper.startsWith("S")) return "-1";
    if (valueUpper === "NO" || valueUpper.startsWith("N")) return "0";

    return "0";
  };

  // ✅ Fetch user's IP address using getIpAndLocation
  useEffect(() => {
    const fetchIP = async () => {
      try {
        const response = await agent.get(getIp);
        setIpAddress(response.data.ip || "0");
      } catch (error) {
        console.error("Error fetching IP:", error);
        setIpAddress("0");
      }
    };

    fetchIP();
  }, []);

  // Fetch existing sectorial expertise on component mount
  useEffect(() => {
    let isMounted = true;

    const fetchExistingSectors = async () => {
      if (!isMounted || initialFetchDone.current || !staffID) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const response = await agent.get(GET_STAFF_SECTORIAL_EXPERTISE_URL, {
          params: {
            StaffID: staffID,
          },
        });


        if (
          response.data.Status === "Success" &&
          Array.isArray(response.data.Data) &&
          response.data.Data.length > 0
        ) {
          const firstItem = response.data.Data[0];

          // ✅ Map the IsSectorialExperience value
          const mapped = mapIsSectorialExperienceFromAPI(
            firstItem.IsSectorialExperience,
          );
          setHasSectorialExperience(mapped);

          // Extract selected sector IDs (only if IsSectorialExperience is Yes/1)
          if (mapped === "Yes") {
            const selectedIds = response.data.Data.filter(
              (item) => item.SectorialExpertiseID > 0,
            ).map((item) => item.SectorialExpertiseID);
            setSelectedSectors(selectedIds);
            setPreservedSectors(selectedIds);
          }
        } else {
          // First-time user or no data - set to null, no error
          setHasSectorialExperience(null);
        }

        initialFetchDone.current = true;
      } catch (error) {
        // Gracefully handle errors - don't show error to user for first-time access
        setHasSectorialExperience(null);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (staffID && !initialFetchDone.current) {
      fetchExistingSectors();
    }

        return () => {
            isMounted = false;
        };
    }, [staffID]);
    useEffect(() => {
        checkCandidateStaffURL();
    }, [staffID, userLoginID, userTypeID]);

    const checkCandidateStaffURL = async () => {
            if(!staffID){
                return;
            }
            let response;
            if(userInfo?.UserTypeID==91){
                debugger;
                response = await agent.get(`${CheckCandidateURL}?candidateId=${userInfo.UserID}&pageCode=SectorialExpertise&userLoginId=${userLoginID}`);
            } else if(userInfo?.UserTypeID==95){ 
                debugger;
                const payLoad = {
                    staffID: staffID,
                    userLoginID: userLoginID,
                    pageCode: 'SectorialExpertise',
                    ipAddress: ipAddress

                }
                response = await agent.post(CheckStaffURL, payLoad);
            }
            
            let IsRightURL;
            let RightURL;
            if(response?.data?.Status=='Success' && response?.data?.Data){
                IsRightURL = response?.data?.Data?.IsRightURL;
                RightURL = response?.data?.Data?.RightURL;
            }
            if(!IsRightURL){
                navigate(RightURL);
            }
        }

  // Show success alert
  const showSuccessAlert = (message) => {
    Swal.fire({
      title: "Success!",
      text: message,
      icon: "success",
      confirmButtonColor: "#3085d6",
      timer: 1500,
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

  // Handle radio button change with data preservation
  const handleExperienceChange = (value) => {
    const previousChoice = hasSectorialExperience;

    // If user had sectors selected and is switching away from "Yes"
    if (
      previousChoice === "Yes" &&
      value !== "Yes" &&
      selectedSectors.length > 0
    ) {
      setPreservedSectors(selectedSectors);
    }

    // If switching back to "Yes", restore preserved data
    if (
      value === "Yes" &&
      previousChoice !== "Yes" &&
      preservedSectors.length > 0
    ) {
      setSelectedSectors(preservedSectors);
    }

    // If switching to "No" or "Skip", clear the list
    if (value === "No" || value === "Skip") {
      setSelectedSectors([]);
    }

    setHasSectorialExperience(value);
  };

  // Handle sector selection
  const handleSectorChange = (sectorId) => {
    setSelectedSectors((prev) => {
      if (prev.includes(sectorId)) {
        return prev.filter((id) => id !== sectorId);
      } else {
        return [...prev, sectorId];
      }
    });
  };

  // ✅ Optimized Save sectorial expertise
  const handleSave = async () => {
    if (!staffID || !userLoginID) {
      showErrorAlert("Missing required user information. Please log in again.");
      return;
    }

    if (!hasSectorialExperience) {
      showErrorAlert(
        "Please select whether you have sectorial expertise or not.",
      );
      return;
    }

    if (hasSectorialExperience === "Yes" && selectedSectors.length === 0) {
      showErrorAlert(
        "Please select at least one sectorial expertise or choose No/Skip.",
      );
      return;
    }

    try {
      setSaving(true);

      // ✅ Use correct API mapping: 1 for Yes, 0 for No, -1 for Skip
      const isSectorialExpAPI = mapIsSectorialExperienceToAPI(
        hasSectorialExperience,
      );

      let requestBody;

      if (hasSectorialExperience === "Yes") {
        // For Yes: send array with selected sectors
        requestBody = selectedSectors.map((sectorId) => {
          const sector = sectorialExpertiseList.find((s) => s.id === sectorId);
          return {
            StaffID: parseInt(staffID),
            SectorialExpertiseID: sectorId,
            SectorialExpertiseName: sector?.name || "",
            UserLoginID: userLoginID,
            IPAddress: ipAddress || "1",
            IsSectorialExperience: isSectorialExpAPI, // ✅ "1" for Yes
          };
        });
      } else {
        // For No/Skip: send single object with empty/0 values
        requestBody = [
          {
            StaffID: parseInt(staffID),
            SectorialExpertiseID: 0,
            SectorialExpertiseName: "",
            UserLoginID: userLoginID,
            IPAddress: ipAddress || "1",
            IsSectorialExperience: isSectorialExpAPI, // ✅ "0" for No, "-1" for Skip
          },
        ];
      }

      // ✅ Optimized: Make the API call
      const response = await agent.post(
        `${SAVE_SECTORIAL_EXPERTISE_URL}?StaffID=${staffID}&UserLoginID=${userLoginID}&IPAddress=${ipAddress || "0"}`,
        requestBody,
        {
          headers: {
            "Content-Type": "application/json",
            accept: "*/*",
          },
        },
      );

      if (response.data.Status === "Success") {
        showSuccessAlert("Sectorial expertise saved successfully!");
        // Navigate to next page after short delay
        setTimeout(() => {
          navigate(`/${formType}/LockApplicationForm`);
        }, 1500);
      } else {
        showErrorAlert(
          "Error saving sectorial expertise: " +
            (response.data.Message || "Unknown error"),
        );
      }
    } catch (error) {
      console.error("Error saving sectorial expertise:", error);
      showErrorAlert(
        "Error saving sectorial expertise: " +
          (error.response?.data?.Message || error.message),
      );
    } finally {
      setSaving(false);
    }
  };

  // Reset selections
  const handleReset = () => {
    showConfirmAlert("Are you sure you want to reset all selections?", () => {
      setSelectedSectors([]);
    });
  };

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

  if (loading) {
    return (
      <div className="mx-auto w-full rounded-lg bg-white p-6 shadow-md">
        <div className="flex justify-center items-center h-32">
          <div className="text-gray-600">Loading sectorial expertise...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full rounded-lg bg-white p-6 shadow-md">
      <div>
        <ProgressTracker />
      </div>
      <fieldset className="mb-4 rounded-md border p-4">
        <legend
          className={`flex ${color} items-center text-base font-semibold text-white border-2 border-gray-300 px-3 py-1.5 rounded-md ml-4`}
        >
          Sectorial Expertise
        </legend>

        {/* Radio Button Selection */}
        <div className="mt-4 mb-6">
          <div className="text-center mb-4">
            <p className="font-normal mb-3">
              <strong>Do You Have Sectorial Expertise?</strong>{" "}
              <span className="text-red-500">*</span>
            </p>
            <div className="flex justify-center space-x-6">
              <RadioButton
                name="hasSectorialExperience"
                value="Yes"
                checked={hasSectorialExperience === "Yes"}
                onChange={() => handleExperienceChange("Yes")}
                label="Yes"
              />
              <RadioButton
                name="hasSectorialExperience"
                value="No"
                checked={hasSectorialExperience === "No"}
                onChange={() => handleExperienceChange("No")}
                label="No"
              />
              <RadioButton
                name="hasSectorialExperience"
                value="Skip"
                checked={hasSectorialExperience === "Skip"}
                onChange={() => handleExperienceChange("Skip")}
                label="Skip"
              />
            </div>
          </div>
        </div>

        {/* Show checkbox list only when "Yes" is selected */}
        {hasSectorialExperience === "Yes" && (
          <div className="mt-4">
            <div className="grid grid-cols-1 gap-2">
              {sectorialExpertiseList.map((sector) => (
                <div key={sector.id} className="flex items-center">
                  <span className="mr-2 text-sm text-gray-600 w-8">
                    {sector.id}.
                  </span>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedSectors.includes(sector.id)}
                      onChange={() => handleSectorChange(sector.id)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                      disabled={saving}
                    />
                    <span className="text-sm text-gray-700 font-normal">
                      {sector.name}
                    </span>
                  </label>
                </div>
              ))}
            </div>

            {/* Display selected sectors count */}
            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600">
                Selected Sectors:{" "}
                <span className="font-semibold">{selectedSectors.length}</span>{" "}
                of {sectorialExpertiseList.length}
              </p>
              {selectedSectors.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500 mb-1">Selected:</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedSectors.map((sectorId) => {
                      const sector = sectorialExpertiseList.find(
                        (s) => s.id === sectorId,
                      );
                      return (
                        <span
                          key={sectorId}
                          className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                        >
                          {sector?.name}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons for Yes selection */}
            <div className="mt-6 flex justify-center space-x-4">
              <button
                onClick={handleReset}
                disabled={saving}
                className="rounded-md bg-red-500 px-4 py-2 text-white hover:bg-gray-300 disabled:cursor-not-allowed disabled:bg-gray-300 flex items-center"
              >
                Reset
              </button>
              <button
                onClick={() =>
                  setSelectedSectors(sectorialExpertiseList.map((s) => s.id))
                }
                disabled={saving}
                className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-300 flex items-center"
              >
                Select All
              </button>
            </div>
          </div>
        )}
      </fieldset>

      {/* Save & Next Button - Always visible */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={handleSave}
          disabled={saving || !hasSectorialExperience}
          className="rounded-md bg-green-600 px-6 py-2 text-white hover:bg-green-600 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {saving ? "Saving..." : "Save & Next"}
        </button>
      </div>
    </div>
  );
};

export default SectorialExpertise;
