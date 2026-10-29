import { useState, useEffect, useContext } from "react";
import agent from "../../../lib/api/agent";
import DropdownComponent from "../../formcomponent/DropdownComponent";
import FormComponent from "../../formcomponent/FormComponent";
import { Edit, Trash2 } from "lucide-react";
import ProgressTracker from "../../Login/CandidateAndStaff/ProgressTracker";
import Swal from "sweetalert2";
import { useLoading } from "../../../Hooks/useLoading";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  GetStaffWorkExperienceList,
  SaveStaffWorkExperience,
  DeleteStaffWorkExperience,
} from "../../../Endpoints_All/Staff/workExperience";
import {
  GetCandidateWorkExperienceList,
  SaveCandidateWorkExperience,
  DeleteCandidateWorkExperience,
} from "../../../Endpoints_All/Candidate/workExperience";

import {
  GetStates,
  GetDistricts,
  GetTalukas,
  GetCities,
  GetPincodeData,
} from "../../../Endpoints_All/Base/location";
import { getDeviceIP } from "../../../utils/CommonHelper";
import { useAuth } from "../../../Hooks/AuthContext";
import { CheckCandidateURL } from "../../../Endpoints_All/Candidate/summary";
import { CheckStaffURL } from "../../../Endpoints_All/Staff/summary";
import { DateInput } from "../../formcomponent/DateInputComponent";
import { ThemeContext } from "../../../Component/Context/ThemeContext";
// **UNIFIED API ENDPOINTS CONFIGURATION**
const API_ENDPOINTS = {
  Candidate: {
    getList: GetCandidateWorkExperienceList,
    save: SaveCandidateWorkExperience,
    delete: DeleteCandidateWorkExperience,
    userTypeIDName: "CandidateID",
  },
  Staff: {
    getList: GetStaffWorkExperienceList,
    save: SaveStaffWorkExperience,
    delete: DeleteStaffWorkExperience,
    userTypeIDName: "StaffID",
  },
};

const WorkExperienceForm = () => {
  // **DYNAMIC USER TYPE DETECTION FROM SESSION STORAGE**
  const { userInfo } = useAuth();
  const userTypeID = Number(userInfo?.UserTypeID);
  const userLoginID = userInfo?.UserLoginID || "";
  const loggedInUserID = userInfo?.UserID || 0;


  const { startLoading, stopLoading, isLoading } = useLoading();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const applicationId = searchParams.get("applicationId");

  const candidateIdFromUrl = searchParams.get("candidateId");
  const userID = candidateIdFromUrl || loggedInUserID;

  // Determine formType based on userTypeID (91 = Candidate, others = Staff)
  const formType = candidateIdFromUrl
    ? "Candidate"
    : userTypeID === 91
      ? "Candidate"
      : "Staff";

  const isInstituteUser = userTypeID === 61;

  // **USE DYNAMIC ENDPOINTS BASED ON formType**
  const currentEndpoints = API_ENDPOINTS[formType] || API_ENDPOINTS.Staff;
  const userTypeIDName = currentEndpoints.userTypeIDName;

  const [workExperienceChoice, setWorkExperienceChoice] = useState(null);
  const [allApiRecords, setAllApiRecords] = useState([]); // Store all records from API
  const [previousWorkExperienceRowID, setPreviousWorkExperienceRowID] = useState(0);

  const [formData, setFormData] = useState({
    workExperienceRowID: 0,
    establishmentName: "",
    address: "",
    pincode: "",
    stateID: "",
    districtID: "",
    talukaID: "",
    cityID: "",
    otherCity: "",
    jobRole: "",
    fromDate: "",
    toDate: "",
    salaryPerMonth: "",
    sectorialExpertise: [],
  });

  const [errors, setErrors] = useState({});
  const [editingIndex, setEditingIndex] = useState(null);

  const [stateOptions, setStateOptions] = useState([]);
  const [districtOptions, setDistrictOptions] = useState([]);
  const [talukaOptions, setTalukaOptions] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);
  const { color } = useContext(ThemeContext);

  const [filteredDistricts, setFilteredDistricts] = useState([]);
  const [filteredTalukas, setFilteredTalukas] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);
  const [ipAddress, setIpAddress] = useState("");

  const [workExperienceList, setWorkExperienceList] = useState([]);

  const [loading, setLoading] = useState({
    states: false,
    districts: false,
    talukas: false,
    cities: false,
    pincodeLookup: false,
  });

  // **MAPPING FUNCTIONS FOR IsWorkExperience FIELD**
  const mapIsWorkExperienceFromAPI = (value) => {
    if (!value) return null;
    const strValue = value.toString().trim();
    if (strValue === "1") return "Yes";
    if (strValue === "-1") return "Skip";
    if (strValue === "0") return "No";
    return null;
  };

  const mapIsWorkExperienceToAPI = (value) => {
    if (!value) return "0";
    const valueUpper = value.toString().toUpperCase();
    if (valueUpper === "YES" || valueUpper.startsWith("Y")) return "1";
    if (valueUpper === "SKIP" || valueUpper.startsWith("S")) return "-1";
    if (valueUpper === "NO" || valueUpper.startsWith("N")) return "0";
    return "0";
  };

  // **INITIAL DATA FETCH**
  useEffect(() => {
    if (userID && formType) {
      fetchWorkExperiences();
      fetchStates();
      fetchAllDistricts();
      fetchAllTalukas();
      fetchAllCities();
      fetchIP();
      checkCandidateStaffURL();


    }
  }, [userID, formType]);

  const fetchIP = async () => {
    try {
      const ip = await getDeviceIP();
      setIpAddress(ip);
    } catch (err) {
      console.error("Failed to get IP:", err);
    }
  };

  // **FETCH WORK EXPERIENCES - DYNAMIC BASED ON formType**
  const fetchWorkExperiences = async () => {
    try {
      startLoading();

      let response;
      if (formType === "Candidate") {
        response = await agent.get(
          `${currentEndpoints.getList}?candidateId=${userID}`,
        );
      } else {
        response = await agent.get(currentEndpoints.getList, {
          params: { [userTypeIDName]: userID },
        });
      }

      const res = response.data;


      if (
        res.Status === "Success" &&
        Array.isArray(res.Data) &&
        res.Data.length > 0
      ) {
        setAllApiRecords(res.Data);

        const latestRecord = [...res.Data].sort(
          (a, b) =>
            Number(b.WorkExperienceRowID || 0) -
            Number(a.WorkExperienceRowID || 0)
        )[0];

        if (latestRecord) {
          setPreviousWorkExperienceRowID(
            Number(latestRecord.WorkExperienceRowID || 0)
          );

          setWorkExperienceChoice(
            mapIsWorkExperienceFromAPI(latestRecord.IsWorkExperience)
          );
        } else {
          setPreviousWorkExperienceRowID(0);
          setWorkExperienceChoice(null);
        }

        // Filter only "Yes" entries (IsWorkExperience === "1") for display
        const yesEntries = res.Data.filter(
          (d) => d.IsWorkExperience?.trim() === "1",
        );

        if (yesEntries.length > 0) {
          const list = yesEntries.map((d) => ({
            workExperienceRowID: d.WorkExperienceRowID || 0,
            establishmentName: d.EstablishmentName || "",
            address: d.Address || "",
            pincode: d.Pincode || "",
            stateID: d.StateID && d.StateID !== -1 ? d.StateID.toString() : "",
            stateLabel: d.State || "",
            districtID: d.DistrictID && d.DistrictID !== -1 ? d.DistrictID.toString() : "",
            districtLabel: d.District || "",
            talukaID: d.TalukaID && d.TalukaID !== -1 ? d.TalukaID.toString() : "",
            talukaLabel: d.Taluka || "",
            cityID: d.CityID && d.CityID !== -1 ? d.CityID.toString() : "",
            cityLabel: d.City || "",
            otherCity: d.OtherCity || "",
            jobRole: d.JobRole || "",
            // fromDate: d.FromDate ? d.FromDate.split("T")[0] : "",
            // toDate: d.ToDate ? d.ToDate.split("T")[0] : "",
            fromDate: d.FromDateStr || "",
            toDate: d.ToDateStr || "",
            salaryPerMonth: d.SalaryPerMonth ? d.SalaryPerMonth.toString() : "",
            sectorialExpertise: d.SectorialExpertise || [],
          }));

          setWorkExperienceList(list);
        } else {
          setWorkExperienceList([]);
        }
      } else {
        setAllApiRecords([]);
        setWorkExperienceList([]);
        setWorkExperienceChoice(null);
      }
    } catch (e) {
      console.error("Error fetching work experiences:", e);
      setAllApiRecords([]);
      setWorkExperienceList([]);
      setWorkExperienceChoice(null);
    } finally {
      stopLoading();
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
      debugger;
      response = await agent.get(`${CheckCandidateURL}?candidateId=${userID}&pageCode=WorkExperience&userLoginId=${userLoginID}`);
    } else if (userTypeID == 95) {
      debugger;
      const payLoad = {
        staffID: userID,
        userLoginID: userLoginID,
        pageCode: 'WorkExperience',
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

  // **LOCATION API CALLS**
  const fetchStates = async () => {
    setLoading((p) => ({ ...p, states: true }));
    try {
      const resp = await agent.get(GetStates);
      if (resp.data.Status === "Success") {
        setStateOptions(resp.data.Data.filter((x) => x.Value !== "-1"));
      }
    } catch (e) {
      console.error("Error fetching states", e);
    } finally {
      setLoading((p) => ({ ...p, states: false }));
    }
  };

  const fetchAllDistricts = async () => {
    setLoading((p) => ({ ...p, districts: true }));
    try {
      const resp = await agent.get(GetDistricts);
      if (resp.data.Status === "Success") {
        setDistrictOptions(resp.data.Data.filter((x) => x.Value !== "-1"));
      }
    } catch (e) {
      console.error("Error fetching districts", e);
    } finally {
      setLoading((p) => ({ ...p, districts: false }));
    }
  };

  const fetchAllTalukas = async () => {
    setLoading((p) => ({ ...p, talukas: true }));
    try {
      const resp = await agent.get(GetTalukas);
      if (resp.data.Status === "Success") {
        setTalukaOptions(resp.data.Data.filter((x) => x.Value !== "-1"));
      }
    } catch (e) {
      console.error("Error fetching talukas", e);
    } finally {
      setLoading((p) => ({ ...p, talukas: false }));
    }
  };

  const fetchAllCities = async () => {
    setLoading((p) => ({ ...p, cities: true }));
    try {
      const resp = await agent.get(GetCities);
      if (resp.data.Status === "Success") {
        setCityOptions(resp.data.Data.filter((x) => x.Value !== "-1"));
      }
    } catch (e) {
      console.error("Error fetching cities", e);
    } finally {
      setLoading((p) => ({ ...p, cities: false }));
    }
  };

  const lookupAddressByPincode = async (pincode) => {
    if (pincode.length !== 6 || !/^\d{6}$/.test(pincode)) return;

    setLoading((p) => ({ ...p, pincodeLookup: true }));

    try {
      const response = await agent.get(`${GetPincodeData}?Pincode=${pincode}`);

      if (response.data?.Status === "Success" && response.data.Data) {
        const pincodeData = response.data.Data;

        setFormData((prev) => ({
          ...prev,
          stateID: pincodeData.StateID ? pincodeData.StateID.toString() : "",
          districtID: pincodeData.DistrictID
            ? pincodeData.DistrictID.toString()
            : "",
          talukaID: pincodeData.TalukaID ? pincodeData.TalukaID.toString() : "",
          cityID: pincodeData.CityID ? pincodeData.CityID.toString() : "",
        }));

        if (pincodeData.StateID) {
          setFilteredDistricts(districtOptions.filter(d => d.Group === pincodeData.StateID.toString()));
        }
        if (pincodeData.DistrictID) {
          setFilteredTalukas(talukaOptions.filter(t => t.Group === pincodeData.DistrictID.toString()));
        }
        if (pincodeData.TalukaID) {
      setFilteredCities(cityOptions.filter((c) => c.Group === pincodeData.TalukaID.toString() || c.Text?.toLowerCase() === "other")
);
        }

      } else {
        Swal.fire({
          icon: 'warning',
          title: 'Pincode Not Found',
          text: 'Please manually select your address details',
          timer: 2000
        });
      }
    } catch (e) {
      console.error("Error looking up pincode:", e);
    } finally {
      setLoading((p) => ({ ...p, pincodeLookup: false }));
    }
  };

  // **FORM HANDLERS**
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }

    if (field === "pincode" && value?.length === 6 && /^\d{6}$/.test(value)) {
      lookupAddressByPincode(value);
    }
  };

  // **CASCADE FILTERING FOR LOCATION DROPDOWNS**
  useEffect(() => {
    if (formData.stateID) {
      const filtered = districtOptions.filter(
        (d) => d.Group === formData.stateID.toString(),
      );
      setFilteredDistricts(filtered);
      if (!filtered.some((x) => x.Value === formData.districtID)) {
        setFormData((p) => ({
          ...p,
          districtID: "",
          talukaID: "",
          cityID: "",
        }));
      }
    } else {
      setFilteredDistricts([]);
    }
  }, [formData.stateID, districtOptions]);

  useEffect(() => {
    if (formData.districtID) {
      const filtered = talukaOptions.filter(
        (t) => t.Group === formData.districtID.toString(),
      );
      setFilteredTalukas(filtered);
      if (!filtered.some((x) => x.Value === formData.talukaID)) {
        setFormData((p) => ({ ...p, talukaID: "", cityID: "" }));
      }
    } else {
      setFilteredTalukas([]);
    }
  }, [formData.districtID, talukaOptions]);

  useEffect(() => {
    if (formData.talukaID) {
      const filtered = cityOptions.filter(
        (c) =>
          c.Group === formData.talukaID.toString() ||
          c.Text?.toLowerCase() === "other"
      );

      setFilteredCities(filtered);

      if (
        formData.cityID &&
        !filtered.some((x) => x.Value === formData.cityID) &&
        formData.cityID !== "-1"
      ) {
        setFormData((p) => ({
          ...p,
          cityID: "",
          otherCity: "",
        }));
      }
    } else {
      setFilteredCities([]);
    }
  }, [formData.talukaID, cityOptions]);

  const formatOptions = (data) =>
    (data || []).map((x) => ({ value: x.Value, label: x.Text }));

  const formatCityOptions = (data) => {
    return (data || []).map((item) => ({
      value:
        item.Text?.toLowerCase() === "other"
          ? "-1"
          : item.Value,
      label: item.Text,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.establishmentName?.trim())
      newErrors.establishmentName = "Name of Establishment is required";
    if (!formData.address?.trim()) newErrors.address = "Address is required";
    if (!formData.pincode) {
      newErrors.pincode = "Pin Code is required";
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = "Pin Code must be 6 digits";
    }
    if (!formData.stateID) newErrors.stateID = "State is required";
    if (!formData.districtID) newErrors.districtID = "District is required";
    if (!formData.talukaID) newErrors.talukaID = "Taluka is required";
    if (formData.cityID === "-1" && !formData.otherCity?.trim()) {
      newErrors.otherCity = "City/Village is required";
    }
    if (!formData.jobRole?.trim()) newErrors.jobRole = "Job Role is required";
    if (!formData.fromDate) newErrors.fromDate = "From Date is required";
    if (!formData.toDate) newErrors.toDate = "To Date is required";
    if (!formData.salaryPerMonth)
      newErrors.salaryPerMonth = "Salary Per Month is required";

    // if (formData.fromDate && formData.toDate) {
    //     if (new Date(formData.fromDate) > new Date(formData.toDate)) {
    //         newErrors.toDate = "To Date cannot be earlier than From Date";
    //     }
    // }
    if (formData.fromDate && formData.toDate) {
      // Check if dates are in DD/MM/YYYY format
      const isDDMMYYYY = (dateStr) => dateStr.includes('/');

      let fromDateObj, toDateObj;

      if (isDDMMYYYY(formData.fromDate)) {
        // Parse DD/MM/YYYY format
        const [day, month, year] = formData.fromDate.split('/');
        fromDateObj = new Date(`${year}-${month}-${day}`);
      } else {
        fromDateObj = new Date(formData.fromDate);
      }

      if (isDDMMYYYY(formData.toDate)) {
        const [day, month, year] = formData.toDate.split('/');
        toDateObj = new Date(`${year}-${month}-${day}`);
      } else {
        toDateObj = new Date(formData.toDate);
      }

      // Check if dates are valid
      if (!isNaN(fromDateObj.getTime()) && !isNaN(toDateObj.getTime())) {
        if (fromDateObj > toDateObj) {
          newErrors.toDate = "To date must be after from date";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      workExperienceRowID: 0,
      establishmentName: "",
      address: "",
      pincode: "",
      stateID: "",
      districtID: "",
      talukaID: "",
      cityID: "",
      otherCity: "",
      jobRole: "",
      fromDate: "",
      toDate: "",
      salaryPerMonth: "",
      sectorialExpertise: [],
    });
    setErrors({});
    setFilteredDistricts([]);
    setFilteredTalukas([]);
    setFilteredCities([]);
    setEditingIndex(null);
  };

  // **DELETE EXISTING RECORD - DYNAMIC PAYLOAD BASED ON formType**
  // **DELETE EXISTING RECORD - DYNAMIC PAYLOAD AND METHOD BASED ON formType**
  const deleteExistingRecord = async (recordId) => {
    try {
      const basePayload = {
        workExperienceRowID: recordId,
        establishmentName: "string",
        fromDate: new Date().toISOString(),
        fromDateStr: "string",
        toDate: new Date().toISOString(),
        toDateStr: "string",
        salaryPerMonth: 0,
        jobRole: "string",
        address: "string",
        stateID: 0,
        state: "string",
        districtID: 0,
        district: "string",
        talukaID: 0,
        taluka: "string",
        cityID: 0,
        city: "string",
        otherCity: "string",
        pincode: "string",
        isPincodeCorrect: 0,
        userLoginID,
        ipAddress: "string",
        pageCode: "string",
        isWorkExperience: "0",
      };

      let deletePayload;
      let response;

      if (formType === "Candidate") {
        // Candidate uses DELETE method
        deletePayload = {
          ...basePayload,
          candidateID: parseInt(userID, 10),
        };

        response = await agent.delete(currentEndpoints.delete, {
          headers: {
            "Content-Type": "application/json",
            accept: "*/*",
          },
          data: deletePayload,
        });
      } else {
        // Staff uses POST method
        deletePayload = {
          ...basePayload,
          staffID: parseInt(userID, 10),
          sectorialExpertise: [
            {
              staffID: parseInt(userID, 10),
              sectorialExpertiseID: 0,
              sectorialExpertiseName: "string",
              userLoginID,
              ipAddress: "string",
              isSectorialExperience: "string",
            },
          ],
        };

        response = await agent.post(currentEndpoints.delete, deletePayload, {
          headers: {
            "Content-Type": "application/json",
            accept: "*/*",
          },
        });
      }

      return response.data;
    } catch (error) {
      console.error(`Error deleting ${formType} record ${recordId}:`, error);
      throw error;
    }
  };

  // **DELETE ALL EXISTING RECORDS - CALLED WHEN SWITCHING FROM YES TO NO/SKIP**
  const deleteAllExistingRecords = async () => {
    if (allApiRecords.length === 0) {
      return;
    }

    try {
      // Delete all records in parallel
      const deletePromises = allApiRecords.map((record) =>
        deleteExistingRecord(record.WorkExperienceRowID),
      );

      const results = await Promise.all(deletePromises);

      // Clear the stored API records
      setAllApiRecords([]);

      return results;
    } catch (error) {
      console.error("Error deleting all records:", error);
      throw error;
    }
  };

  // **DELETE SINGLE ROW FROM TABLE (NOT YET SAVED TO API)**
  const handleDeleteRow = (index) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This will remove the work experience from the list.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (!result.isConfirmed) return;

      const rowToDelete = workExperienceList[index];

      // If this row has a valid workExperienceRowID (exists in API), delete it from API
      if (
        rowToDelete.workExperienceRowID &&
        rowToDelete.workExperienceRowID > 0
      ) {
        Swal.fire({
          title: "Deleting...",
          text: "Please wait while we delete the record",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        deleteExistingRecord(rowToDelete.workExperienceRowID)
          .then(() => {
            // Remove from local state
            const updatedList = workExperienceList.filter(
              (_, i) => i !== index,
            );
            setWorkExperienceList(updatedList);

            // Remove from allApiRecords
            setAllApiRecords((prevRecords) =>
              prevRecords.filter(
                (r) =>
                  r.WorkExperienceRowID !== rowToDelete.workExperienceRowID,
              ),
            );

            if (editingIndex === index) resetForm();

            Swal.fire({
              icon: "success",
              title: "Deleted",
              text: "Work experience record deleted successfully.",
              timer: 1500,
            });
          })
          .catch((error) => {
            console.error("Error deleting record:", error);
            Swal.fire({
              icon: "error",
              title: "Error",
              text: "Failed to delete the record. Please try again.",
            });
          });
      } else {
        // If row doesn't exist in API yet, just remove from local state
        const updatedList = workExperienceList.filter((_, i) => i !== index);
        setWorkExperienceList(updatedList);

        if (editingIndex === index) resetForm();

        Swal.fire({
          icon: "success",
          title: "Deleted",
          text: "Work experience removed from list.",
          timer: 1500,
        });
      }
    });
  };

  // **HANDLE WORK EXPERIENCE CHOICE CHANGE WITH PROPER DELETION**
  const handleWorkExperienceChoiceChange = (choice) => {
    const hasExistingWorkExperience =
      workExperienceList.length > 0 ||
      allApiRecords.some(
        (record) => record?.IsWorkExperience?.toString().trim() === "1"
      );

    if (
      (choice === "No" || choice === "Skip") &&
      hasExistingWorkExperience
    ) {
      Swal.fire({
        icon: "warning",
        title: "Work Experience Exists",
        text: "Please delete all existing work experience details before selecting No or Skip.",
        confirmButtonText: "OK",
      });
      return;
    }

    if (choice === "No" || choice === "Skip") {
      resetForm();
      setWorkExperienceList([]);
    }

    setWorkExperienceChoice(choice);
  };
  // **HANDLE WORK EXPERIENCE CHOICE CHANGE**

  const handleAddExperience = () => {
    if (!validateForm()) return;

    const getLabel = (options, value) => {
      const opt = (options || []).find((o) => o.Value === value);
      return opt ? opt.Text : "";
    };

    const row = {
      ...formData,
      stateLabel: getLabel(stateOptions, formData.stateID),
      districtLabel: getLabel(districtOptions, formData.districtID),
      talukaLabel: getLabel(talukaOptions, formData.talukaID),
  cityLabel:
  formData.cityID === "-1"
    ? formData.otherCity
    : getLabel(cityOptions, formData.cityID),
    };

    if (editingIndex !== null) {
      const updatedList = [...workExperienceList];
      updatedList[editingIndex] = row;
      setWorkExperienceList(updatedList);
    } else {
      setWorkExperienceList([...workExperienceList, row]);
    }

    Swal.fire({
      icon: "success",
      title: editingIndex !== null ? "Updated" : "Added",
      text: "Work experience added to list. Click Save and Next to persist.",
      timer: 1500,
    });

    resetForm();
  };

  const handleEditRow = (index) => {
    const row = workExperienceList[index];
    setFormData({
      ...row,
      salaryPerMonth: row.salaryPerMonth ? row.salaryPerMonth.toString() : "",
    });

    if (row.stateID) {
      setFilteredDistricts(
        districtOptions.filter((d) => d.Group === row.stateID.toString()),
      );
    }
    if (row.districtID) {
      setFilteredTalukas(
        talukaOptions.filter((t) => t.Group === row.districtID.toString()),
      );
    }
    if (row.talukaID) {
      setFilteredCities(
        cityOptions.filter((c) => c.Group === row.talukaID.toString()),
      );
    }

    setEditingIndex(index);
  };

  //const handleDeleteRow = (index) => {
  //    Swal.fire({
  //        title: "Are you sure?",
  //        text: "This will remove the work experience from the list.",
  //        icon: "warning",
  //        showCancelButton: true,
  //        confirmButtonColor: "#3085d6",
  //        cancelButtonColor: "#d33",
  //        confirmButtonText: "Yes, delete it!",
  //    }).then((result) => {
  //        if (!result.isConfirmed) return;

  //        const updatedList = workExperienceList.filter((_, i) => i !== index);
  //        setWorkExperienceList(updatedList);

  //        if (editingIndex === index) resetForm();

  //        Swal.fire({
  //            icon: "success",
  //            title: "Deleted",
  //            text: "Work experience removed from list.",
  //            timer: 1500,
  //        });
  //    });
  //};

  // const formatDisplayDate = (d) => {
  //     if (!d) return "";
  //     const date = new Date(d);
  //     const dd = date.getDate().toString().padStart(2, "0");
  //     const mm = (date.getMonth() + 1).toString().padStart(2, "0");
  //     const yy = date.getFullYear();
  //     return `${dd}/${mm}/${yy}`;
  // };
  const parseDDMMYYYY = (val) => {
    if (!val) return null;
    const parts = val.split("/");
    if (parts.length !== 3) return null;
    const [dd, mm, yyyy] = parts.map(Number);
    if (!dd || !mm || !yyyy) return null;
    const d = new Date(yyyy, mm - 1, dd);
    return isNaN(d.getTime()) ? null : d;
  };

  const formatDisplayDate = (d) => {
    const date = parseDDMMYYYY(d);
    if (!date) return "";
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    return `${dd}/${mm}/${date.getFullYear()}`;
  };

  // **BUILD PAYLOAD FUNCTION - DYNAMIC BASED ON formType**
  const buildPayload = (row, isYesEntry = true) => {
    const getLabel = (options, value) => {
      const opt = (options || []).find((o) => o.Value === value);
      return opt ? opt.Text : "";
    };

    const basePayload = {
      // workExperienceRowID: isYesEntry && row?.workExperienceRowID && row.workExperienceRowID < 1000000000000
      //   ? row.workExperienceRowID
      //   : 0,
      workExperienceRowID:
        isYesEntry && row?.workExperienceRowID
          ? row.workExperienceRowID
          : !isYesEntry
            ? previousWorkExperienceRowID
            : 0,
      establishmentName: isYesEntry ? (row?.establishmentName || "") : "NA",
      fromDate: isYesEntry && row?.fromDate
        ? (parseDDMMYYYY(row.fromDate)?.toISOString() ?? new Date().toISOString())
        : new Date().toISOString(),
      fromDateStr: isYesEntry ? (row?.fromDate || "") : "NA",
      toDate: isYesEntry && row?.toDate
        ? (parseDDMMYYYY(row.toDate)?.toISOString() ?? new Date().toISOString())
        : new Date().toISOString(),
      toDateStr: isYesEntry ? (row?.toDate || "") : "NA",
      salaryPerMonth: isYesEntry ? parseInt(row?.salaryPerMonth || 0, 10) : 0,
      jobRole: isYesEntry ? (row?.jobRole || "") : "NA",
      address: isYesEntry ? (row?.address || "") : "NA",
      stateID: isYesEntry ? parseInt(row?.stateID || 0, 10) : -1,
      state: isYesEntry ? (row?.stateLabel || getLabel(stateOptions, row?.stateID)) : "NA",
      districtID: isYesEntry ? parseInt(row?.districtID || 0, 10) : -1,
      district: isYesEntry ? (row?.districtLabel || getLabel(districtOptions, row?.districtID)) : "NA",
      talukaID: isYesEntry ? parseInt(row?.talukaID || 0, 10) : -1,
      taluka: isYesEntry ? (row?.talukaLabel || getLabel(talukaOptions, row?.talukaID)) : "NA",
      cityID: isYesEntry ? parseInt(row?.cityID || 0, 10) : -1,
      city: isYesEntry ? (row?.cityLabel || getLabel(cityOptions, row?.cityID)) : "NA",
      otherCity: isYesEntry ? (row?.otherCity || "") : "NA",
      pincode: isYesEntry ? (row?.pincode || "") : "NA",
      isPincodeCorrect: isYesEntry ? 1 : 0,
      userLoginID,
      ipAddress: "1",
      pageCode: "WorkExperience",
      isWorkExperience: isYesEntry ? "1" : mapIsWorkExperienceToAPI(workExperienceChoice)
    };

    if (formType === "Candidate") {
      return {
        ...basePayload,
        candidateID: parseInt(userID, 10),
      };
    } else {
      return {
        ...basePayload,
        staffID: parseInt(userID, 10),
        sectorialExpertise:
          isYesEntry && row?.sectorialExpertise?.length > 0
            ? row.sectorialExpertise
            : [
              {
                staffID: parseInt(userID, 10),
                sectorialExpertiseID: isYesEntry ? 0 : -1,
                sectorialExpertiseName: "",
                userLoginID,
                ipAddress: ipAddress,
                isSectorialExperience: "0",
              },
            ],
      };
    }
  };

  // **SAVE AND NEXT - DYNAMIC BASED ON formType**
  const handleSaveAndNext = async () => {
    if (!workExperienceChoice) {
      Swal.fire({
        icon: "warning",
        title: "Selection Required",
        text: "Please select whether you have work experience or not.",
      });
      return;
    }

    if (workExperienceChoice === "Yes" && workExperienceList.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No Experience",
        text: "Please add at least one work experience row or select No/Skip.",
      });
      return;
    }

    try {
      startLoading();

      // Save No/Skip choice
      if (workExperienceChoice === "No" || workExperienceChoice === "Skip") {
        const payload = buildPayload(null, false);

        const resp = await agent.post(currentEndpoints.save, payload, {
          headers: { "Content-Type": "application/json" },
        });

        if (resp.data.Status === "Success") {
          Swal.fire({
            icon: "success",
            title: "Success",
            text: `Your selection "${workExperienceChoice}" has been saved.`,
            timer: 1500,
          }).then(() => {
            if (formType == "Staff") {
              navigate(`/${formType}/SectorialExpertise`);
            } else if (formType === "Candidate") {
              if (isInstituteUser && candidateIdFromUrl) {
                navigate(
                  `/Candidate/LockApplicationForm?candidateId=${candidateIdFromUrl}&applicationId=${applicationId}`,
                );
              } else {
                navigate(`/Candidate/LockApplicationForm`);
              }
            }
          });
        } else {
          throw new Error(resp.data.Message || "Failed to save");
        }

        stopLoading();
        return;
      }

      // Save Yes entries
      if (workExperienceChoice === "Yes" && workExperienceList.length > 0) {
        const savePromises = workExperienceList.map((row) => {
          const payload = buildPayload(row, true);
          return agent.post(currentEndpoints.save, payload, {
            headers: { "Content-Type": "application/json" },
          });
        });

        const responses = await Promise.all(savePromises);
        const allSuccess = responses.every(
          (res) => res.data.Status === "Success",
        );

        if (allSuccess) {
          Swal.fire({
            icon: "success",
            title: "Success",
            text: "All work experience records saved successfully.",
            timer: 1500,
          }).then(() => {
            if (formType == "Staff") {
              navigate(`/${formType}/SectorialExpertise`);
            }
            if (formType === "Candidate") {
              if (isInstituteUser && candidateIdFromUrl) {
                navigate(
                  `/Candidate/LockApplicationForm?candidateId=${candidateIdFromUrl}&applicationId=${applicationId}`,
                );
              } else {
                navigate(`/Candidate/LockApplicationForm`);
              }
            }
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Some work experience records failed to save. Please try again.",
          });
        }
      }
    } catch (e) {
      console.error("Error saving work experience", e);
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          e.response?.data?.Message ||
          e.message ||
          "Failed to save work experience",
      });
    } finally {
      stopLoading();
    }
  };

  // **RADIO BUTTON COMPONENT**
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
      <ProgressTracker />

      <fieldset className="mb-4 rounded-md border p-4">
        <legend
          className={`flex ${color} items-center text-base font-semibold text-white border-2 border-gray-300 px-3 py-1.5 rounded-md ml-4`}
        >
          Work Experience Details
        </legend>

        <div className="mt-4 mb-6">
          <label className="block text-center text-sm font-medium text-gray-700 mb-3">
            Do You Have Any Work Experience?{" "}
            <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center justify-center space-x-6">
            <RadioButton
              name="hasExperience"
              value="Yes"
              checked={workExperienceChoice === "Yes"}
              onChange={() => handleWorkExperienceChoiceChange("Yes")}
              label="Yes"
            />
            <RadioButton
              name="hasExperience"
              value="No"
              checked={workExperienceChoice === "No"}
              onChange={() => handleWorkExperienceChoiceChange("No")}
              label="No"
            />
            <RadioButton
              name="hasExperience"
              value="Skip"
              checked={workExperienceChoice === "Skip"}
              onChange={() => handleWorkExperienceChoiceChange("Skip")}
              label="Skip"
            />
          </div>
        </div>

        {workExperienceChoice === "Yes" && (
          <>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <FormComponent
                label="Name of Establishment"
                value={formData.establishmentName}
                onChange={(v) => handleChange("establishmentName", v)}
                error={errors.establishmentName}
                required
              />
              <FormComponent
                label="Address"
                value={formData.address}
                onChange={(v) => handleChange("address", v)}
                error={errors.address}
                required
              />
            </div>

            <div className="mt-4 grid grid-cols-4 gap-4">
              <div>
                <FormComponent
                  label="Pin Code"
                  value={formData.pincode}
                  onChange={(v) => {
                    if (/^\d*$/.test(v)) {
                      handleChange("pincode", v);
                    }
                  }}
                  error={errors.pincode}
                  required
                />
                {loading.pincodeLookup && (
                  <span className="text-xs text-blue-500">
                    Looking up address...
                  </span>
                )}
              </div>
              <DropdownComponent
                label="State"
                options={formatOptions(stateOptions)}
                value={formData.stateID}
                onChange={(v) => handleChange("stateID", v)}
                error={errors.stateID}
                required
                loading={loading.states}
              />
              <DropdownComponent
                label="District"
                options={formatOptions(filteredDistricts)}
                value={formData.districtID}
                onChange={(v) => handleChange("districtID", v)}
                error={errors.districtID}
                required
                loading={loading.districts}
                disabled={!formData.stateID}
              />
              <DropdownComponent
                label="Taluka"
                options={formatOptions(filteredTalukas)}
                value={formData.talukaID}
                onChange={(v) => handleChange("talukaID", v)}
                error={errors.talukaID}
                required
                loading={loading.talukas}
                disabled={!formData.districtID}
              />
            </div>

            <div className="mt-4 grid grid-cols-4 gap-4">
              <DropdownComponent
                label="City/Village"
                options={formatCityOptions(filteredCities)}
                value={formData.cityID}
                onChange={(v) => handleChange("cityID", v)}
                error={errors.cityID}
                required
                loading={loading.cities}
                disabled={!formData.talukaID}
              />
              {formData.cityID === "-1" && (
                <FormComponent
                  label="Specify Other City/Village"
                  value={formData.otherCity}
                  onChange={(v) => handleChange("otherCity", v)}
                  error={errors.otherCity}
                  required
                />
              )}
              <FormComponent
                label="Job Role"
                value={formData.jobRole}
                onChange={(v) => handleChange("jobRole", v)}
                error={errors.jobRole}
                required
              />
              {/* <FormComponent
                                label="From Date"
                                type="date"
                                value={formData.fromDate}
                                onChange={(v) => handleChange("fromDate", v)}
                                error={errors.fromDate}
                                required
                            />
                            <FormComponent
                                label="To Date"
                                type="date"
                                value={formData.toDate}
                                onChange={(v) => handleChange("toDate", v)}
                                error={errors.toDate}
                                required
                            /> */}

              <DateInput
                label="From Date"
                value={formData.fromDate}
                onChange={(v) => handleChange("fromDate", v)}
                required={true}
                maxDate={new Date()}
                error={errors.fromDate}
              />

              <DateInput
                label="To Date"
                value={formData.toDate}
                onChange={(v) => handleChange("toDate", v)}
                required={true}
                maxDate={new Date()}
                error={errors.toDate}
              />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <FormComponent
                label="Last Month Stipend/ Salary in Rs."
                type="number"
                value={formData.salaryPerMonth}
                onChange={(v) => handleChange("salaryPerMonth", v)}
                error={errors.salaryPerMonth}
                required
              />
            </div>

            <div className="mt-8 flex justify-center space-x-4">
              <button
                type="button"
                onClick={resetForm}
                className="rounded-md bg-gray-200 px-6 py-2 text-gray-700 hover:bg-gray-300 transition-colors"
              >
                {editingIndex !== null ? "Cancel" : "Reset"}
              </button>
              <button
                type="button"
                onClick={handleAddExperience}
                className="rounded-md bg-blue-500 px-6 py-2 text-white hover:bg-blue-600 transition-colors"
              >
                {editingIndex !== null ? "Update Experience" : "Add Experience"}
              </button>
            </div>
          </>
        )}
      </fieldset>

      {workExperienceChoice === "Yes" && workExperienceList.length > 0 && (
        <fieldset className="mb-4 rounded-md border p-4">
          <legend className="flex items-center gap-2 rounded-md border border-gray-400 bg-gray-500 px-4 py-2 text-lg font-semibold text-white">
            Work Experience List
          </legend>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 border-b text-center text-sm font-medium text-gray-700">
                    Action
                  </th>
                  <th className="py-2 px-4 border-b text-center text-sm font-medium text-gray-700">
                    Name of Establishment
                  </th>
                  <th className="py-2 px-4 border-b text-center text-sm font-medium text-gray-700">
                    Address
                  </th>
                  <th className="py-2 px-4 border-b text-center text-sm font-medium text-gray-700">
                    Pin Code
                  </th>
                  <th className="py-2 px-4 border-b text-center text-sm font-medium text-gray-700">
                    State
                  </th>
                  <th className="py-2 px-4 border-b text-center text-sm font-medium text-gray-700">
                    District
                  </th>
                  <th className="py-2 px-4 border-b text-center text-sm font-medium text-gray-700">
                    Taluka
                  </th>
                  <th className="py-2 px-4 border-b text-center text-sm font-medium text-gray-700">
                    City / Village
                  </th>
                  <th className="py-2 px-4 border-b text-center text-sm font-medium text-gray-700">
                    Job Role
                  </th>
                  <th className="py-2 px-4 border-b text-center text-sm font-medium text-gray-700">
                    From Date
                  </th>
                  <th className="py-2 px-4 border-b text-center text-sm font-medium text-gray-700">
                    To Date
                  </th>
                  <th className="py-2 px-4 border-b text-center text-sm font-medium text-gray-700">
                    Stipend/Salary Per Month in Rs.
                  </th>
                </tr>
              </thead>
              <tbody>
                {workExperienceList.map((row, idx) => (
                  <tr
                    key={idx}
                    className={`hover:bg-gray-50 ${editingIndex === idx ? "bg-blue-50" : ""}`}
                  >
                    <td className="py-2 px-4 border-b text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditRow(idx)}
                          className="text-blue-500 hover:text-blue-700"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRow(idx)}
                          className="text-red-500 hover:text-red-700"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      {row.establishmentName}
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      {row.address}
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      {row.pincode}
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      {row.stateLabel}
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      {row.districtLabel}
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      {row.talukaLabel}
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      {row.cityLabel}
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      {row.jobRole}
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      {formatDisplayDate(row.fromDate)}
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      {formatDisplayDate(row.toDate)}
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      {parseInt(row.salaryPerMonth || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </fieldset>
      )}

      <div className="mt-6 flex justify-center gap-4">
        <button
          type="button"
          onClick={handleSaveAndNext}
          className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 transition-colors"
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Save and Next"}
        </button>
      </div>
    </div>
  );
};

export default WorkExperienceForm;
