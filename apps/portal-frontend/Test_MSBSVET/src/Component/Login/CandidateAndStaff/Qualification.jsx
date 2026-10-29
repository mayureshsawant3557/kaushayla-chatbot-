import { useState, useEffect, useContext } from "react";
import agent from "../../../lib/api/agent";
import FormComponent from "../../formcomponent/FormComponent";
import UploadPdf from "../../formcomponent/UploadPdf";
import ProgressTracker from "./ProgressTracker";
import DropdownComponent from "../../formcomponent/DropdownComponent";
import FilteredTableComponent from "../../formcomponent/FilteredTableComponent";
import { useNavigate, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import { useLoading } from "../../../Hooks/useLoading";
import pdflogo from "../../../assets/pdf.png";

import {
  GetCandidateQualificationList,
  GetCandidateQualificationDetails,
  SaveCandidateQualification,
  DeleteCandidateQualification,
} from "../../../Endpoints_All/Candidate/qualification";

import {
  GetStaffQualificationList,
  GetStaffQualificationDetails,
  SaveStaffQualification,
  DeleteStaffQualification,
} from "../../../Endpoints_All/Staff/qualification";

import { GetMasterQualification } from "../../../Endpoints_All/Base/masterData";

import { getIpAndLocation } from "../../../pages/DeviceDetails";
import { all } from "axios";
import { useAuth } from "../../../Hooks/AuthContext";
import { ThemeContext } from "../../../Component/Context/ThemeContext";
import { CheckCandidateURL } from '../../../Endpoints_All/Candidate/summary';
import { CheckStaffURL } from '../../../Endpoints_All/Staff/summary';
import { getDeviceIP } from "../../../utils/CommonHelper";

const Qualification = () => {
  // State for qualification level
  const [qualificationLevel, setQualificationLevel] = useState("SSC and Above");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { userInfo } = useAuth();
  const userTypeID = userInfo?.UserTypeID;

  const candidateIdFromUrl = searchParams.get("candidateId");
  const applicationId = searchParams.get("applicationId");

  const isInstituteUser = userTypeID === 61;

  const effectiveUserId =
    isInstituteUser && candidateIdFromUrl
      ? candidateIdFromUrl
      : userInfo?.UserID;

  // State for form fields - SSC and Above
  const [qualificationRowID, setQualificationRowID] = useState(0);
  const [qualificationType, setQualificationType] = useState("");
  const [nameOfDegree, setNameOfDegree] = useState("");
  const [subjectBranchTrade, setSubjectBranchTrade] = useState("");
  const [boardUniversity, setBoardUniversity] = useState("");
  const [resultDate, setResultDate] = useState("");
  const [attempts, setAttempts] = useState("");
  const [marksObtained, setMarksObtained] = useState("");
  const [outOfMarks, setOutOfMarks] = useState("");
  const [courseDuration, setCourseDuration] = useState("");
  const [classGrade, setClassGrade] = useState("");
  const [mode, setMode] = useState("");
  const [certificate, setCertificate] = useState(null);
  const [certificatePath, setCertificatePath] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const [ipAddress, setIpAddress] = useState("");
  const { color } = useContext(ThemeContext);

  // State for Below SSC fields
  const [highestStandard, setHighestStandard] = useState("");
  const [yearOfAppearing, setYearOfAppearing] = useState("");
  const [belowSSCMarksObtained, setBelowSSCMarksObtained] = useState("");
  const [belowSSCOutOfMarks, setBelowSSCOutOfMarks] = useState("");
  const [belowSSCResult, setBelowSSCResult] = useState("");

  // State for qualifications list - Combined list for both SSC and Above & Below SSC
  const [qualificationsList, setQualificationsList] = useState([]);

  // State for master data options
  const [qualificationTypeOptions, setQualificationTypeOptions] = useState([]);
  const [highestStandardOptions, setHighestStandardOptions] = useState([]);
  const [yearOptions, setYearOptions] = useState([]);

  // Attempts dropdown options
  const attemptsOptions = [
    { value: "1", label: "1" },
    { value: "2", label: "2" },
    { value: "3", label: "3" },
  ];

  // Class/Grade dropdown options
  const classGradeOptions = [
    { value: "Distinction", label: "Distinction" },
    { value: "First Class", label: "First Class" },
    { value: "Second Class", label: "Second Class" },
    { value: "Pass Class", label: "Pass Class" },
    { value: "Fail", label: "Fail" },
  ];

  // Qualification type configuration based on the table
  const qualificationConfig = {
    "10th Standard": {
      defaultDegree: "SSC",
      defaultSubject: "General",
      subjectType: "text",
      boardUniversityType: "text",
      courseDuration: "12",
    },
    "11th Standard": {
      defaultDegree: "11th Standard",
      defaultSubject: "",
      subjectType: "dropdown",
      subjectOptions: [
        { value: "Science", label: "Science" },
        { value: "Arts", label: "Arts" },
        { value: "Commerce", label: "Commerce" },
        { value: "Vocational", label: "Vocational" },
      ],
      boardUniversityType: "text",
      courseDuration: "12",
    },
    "12th Standard": {
      defaultDegree: "HSC",
      defaultSubject: "",
      subjectType: "dropdown",
      subjectOptions: [
        { value: "Science", label: "Science" },
        { value: "Arts", label: "Arts" },
        { value: "Commerce", label: "Commerce" },
        { value: "Vocational", label: "Vocational" },
      ],
      boardUniversityType: "text",
      courseDuration: "12",
    },
    "ITI / NTC": {
      defaultDegree: "NATIONAL TRADE CERTIFICATE",
      defaultSubject: "",
      subjectType: "text",
      boardUniversityType: "fixed",
      boardUniversityValue: "DGT, NEW DELHI",
      courseDuration: "",
    },
    "Apprentice / NAC": {
      defaultDegree: "NATIONAL APPRENTICE CERTIFICATE",
      defaultSubject: "",
      subjectType: "text",
      boardUniversityType: "fixed",
      boardUniversityValue: "DGT, NEW DELHI",
      courseDuration: "",
    },
    "CTI/ CITS/ ATI": {
      defaultDegree: "",
      defaultSubject: "",
      subjectType: "text",
      boardUniversityType: "text",
      courseDuration: "",
    },
    Diploma: {
      defaultDegree: "",
      defaultSubject: "",
      subjectType: "text",
      boardUniversityType: "text",
      courseDuration: "",
    },
    "Advance Diploma": {
      defaultDegree: "",
      defaultSubject: "",
      subjectType: "text",
      boardUniversityType: "text",
      courseDuration: "",
    },
    Graduate: {
      defaultDegree: "",
      defaultSubject: "",
      subjectType: "text",
      boardUniversityType: "text",
      courseDuration: "",
    },
    "Post Graduate": {
      defaultDegree: "",
      defaultSubject: "",
      subjectType: "text",
      boardUniversityType: "text",
      courseDuration: "",
    },
    "Post Graduate Diploma": {
      defaultDegree: "",
      defaultSubject: "",
      subjectType: "text",
      boardUniversityType: "text",
      courseDuration: "",
    },
    Doctorate: {
      defaultDegree: "",
      defaultSubject: "",
      subjectType: "text",
      boardUniversityType: "text",
      courseDuration: "",
    },
    "MSBSVET Course": {
      defaultDegree: "",
      defaultSubject: "",
      subjectType: "text",
      boardUniversityType: "text",
      courseDuration: "",
    },
    "NCVET Course": {
      defaultDegree: "",
      defaultSubject: "",
      subjectType: "text",
      boardUniversityType: "text",
      courseDuration: "",
    },
    "MSCVT Course": {
      defaultDegree: "",
      defaultSubject: "",
      subjectType: "text",
      boardUniversityType: "text",
      courseDuration: "",
    },
  };

  // Helper function to get current config based on qualification type ID
  const getCurrentConfig = () => {
    if (qualificationType && qualificationTypeOptions.length > 0) {
      const qualificationLabel =
        qualificationTypeOptions.find((opt) => opt.value === qualificationType)
          ?.label || "";
      return qualificationConfig[qualificationLabel] || {};
    }
    return {};
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
    checkCandidateStaffURL();
  }, []);



  const currentConfig = getCurrentConfig();

  // State for errors and loading
  const [errors, setErrors] = useState({});

  // Initialize useLoading hook
  const { startLoading, stopLoading, isLoading } = useLoading();
  const [dataFetched, setDataFetched] = useState(false);

  const [hasSSCOrAbove, setHasSSCOrAbove] = useState(false);
  const [hasBelowSSC, setHasBelowSSC] = useState(false);

  const formType =
    isInstituteUser || candidateIdFromUrl
      ? "Candidate"
      : userTypeID === 91
        ? "Candidate"
        : "Staff";
  const userLoginID = userInfo?.UserLoginID;
  const userID = effectiveUserId;

  // Determine API endpoints based on form type
  const API_ENDPOINTS = {
    Candidate: {
      getList: GetCandidateQualificationList,
      getDetails: GetCandidateQualificationDetails,
      save: SaveCandidateQualification,
      delete: DeleteCandidateQualification,
      userTypeIDName: "CandidateID",
    },
    Staff: {
      getList: GetStaffQualificationList,
      getDetails: GetStaffQualificationDetails,
      save: SaveStaffQualification,
      delete: DeleteStaffQualification,
      userTypeIDName: "StaffID",
    },
  };

  const currentEndpoints = API_ENDPOINTS[formType] || API_ENDPOINTS.Candidate;

  // Fetch IP address on component mount
  //useEffect(() => {
  //    const fetchIPAddress = async () => {
  //        try {
  //            const response = await agent.get('https://api.ipify.org?format=json');
  //            setIpAddress(response.data.ip);
  //        } catch (error) {
  //            console.error('Error fetching IP address:', error);
  //            setIpAddress('0.0.0.0');
  //        }
  //    };
  //    fetchIPAddress();
  //}, []);

  // Generate year options (last 50 years)
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i <= 50; i++) {
      const year = currentYear - i;7
      years.push({ value: year.toString(), label: year.toString() });
    }
    setYearOptions(years);
  }, []);



  // Fetch qualification types on component mount
  useEffect(() => {
    const fetchQualificationTypes = async () => {
      startLoading();
      try {
        // Fetch qualification types from API
        const responseS = await agent.get(GetMasterQualification, {
          params: {
            CandidateID: userID,
            QualificationGroup: "S",
          },
        });

        if (
          responseS.data &&
          responseS.data.Status === "Success" &&
          Array.isArray(responseS.data.Data)
        ) {
          // Map with actual IDs from API response
          const qualificationTypes = responseS.data.Data.filter(
            (item) => item.Value !== "-1",
          ).map((item) => ({
            value: item.Value, // Actual QualificationID from API
            label: item.Text, // Display text like "10th Standard", "ITI / NTC"
          }));
          setQualificationTypeOptions(qualificationTypes);
        } else {
          console.error("Failed to fetch qualification types (S):", responseS);
        }

        // Second call for QualificationGroup 'B'
        const responseB = await agent.get(GetMasterQualification, {
          params: {
            CandidateID: userID,
            QualificationGroup: "B",
          },
        });

        if (
          responseB.data &&
          responseB.data.Status === "Success" &&
          Array.isArray(responseB.data.Data)
        ) {
          const optionsB = responseB.data.Data.filter(
            (item) => item.Value !== "-1",
          ).map((item) => ({
            value: item.Value, // Actual QualificationID from API
            label: item.Text,
          }));

          setHighestStandardOptions(optionsB);
        } else {
          console.error(
            "Failed to fetch highest standard options (B):",
            responseB,
          );
        }
      } catch (error) {
        console.error("Error fetching qualification types:", error);
      } finally {
        stopLoading();
      }
    };

    fetchQualificationTypes();
  }, [userID]);

  // Auto-fill fields based on qualification type selection
  useEffect(() => {
    if (qualificationType && qualificationTypeOptions.length > 0) {
      const qualificationLabel =
        qualificationTypeOptions.find((opt) => opt.value === qualificationType)
          ?.label || "";
      const config = qualificationConfig[qualificationLabel] || {};

      // Set default degree - always update when qualification type changes
      if (config.defaultDegree) {
        setNameOfDegree(config.defaultDegree);
      } else {
        if (!isEdit) {
          setNameOfDegree("");
        }
      }

      // Set default subject
      if (config.defaultSubject) {
        setSubjectBranchTrade(config.defaultSubject);
      } else if (!isEdit) {
        setSubjectBranchTrade("");
      }

      // Set board/university if fixed
      if (config.boardUniversityType === "fixed") {
        setBoardUniversity(config.boardUniversityValue);
      } else if (!isEdit) {
        setBoardUniversity("");
      }

      // Set course duration
      if (config.courseDuration) {
        setCourseDuration(config.courseDuration);
      } else if (!isEdit) {
        setCourseDuration("");
      }
    }
  }, [qualificationType, qualificationTypeOptions]);

  // Fetch qualification details on component mount
  useEffect(() => {
    if (!dataFetched && userID) {
      const fetchQualificationDetails = async () => {
        try {
          startLoading();

          let response;
          if (formType === "Candidate") {
            response = await agent.get(`${currentEndpoints.getList}${userID}`);
            // response = await agent.get(currentEndpoints.getList, {
            //     params: {
            //         CandidateID: userID
            //     }
            // });
          } else {
            response = await agent.get(currentEndpoints.getList, {
              params: {
                StaffID: userID,
              },
            });
          }

          const data = response.data.Data;



          if (
            data &&
            response.data.Status === "Success" &&
            Array.isArray(data)
          ) {
            // Combine all qualifications into one list
            const allQualifications = data.map((item) => ({
              id: item.QualificationRowID + Math.random().toString(),
              qualificationRowID: item.QualificationRowID,
              qualificationType: item.QualificationID?.toString() || "",
              qualificationName: item.Qualification || "",
              qualificationGroup: item.QualificationGroup || "S",
              nameOfDegree: item.Degree || "",
              subjectBranchTrade: item.Subject || "",
              boardUniversity: item.University || "",
              resultDate: formatDateForForm(item.ResultDate) || "",
              attempts: item.Attempts?.toString() || "",
              marksObtained:
                item.MarksObtainedStr || item.MarksObtained?.toString() || "",
              outOfMarks:
                item.MaximumMarksStr || item.MaximumMarks?.toString() || "",
              courseDuration: item.CourseDuration?.toString() || "",
              classGrade: item.Class || "",
              mode: item.Mode || "",
              certificatePath: item.CertificatePath,
              // Below SSC specific fields
              highestStandard: item.QualificationID?.toString() || "",
              //yearOfAppearing: item.AppearingYear?.toString() || item.AppearingYearsStr || '',
              yearOfAppearing: item.AppearingYearsStr || "",
            }));

            setQualificationsList(allQualifications);
            const hasSSCData = allQualifications.some(
              (q) => q.qualificationGroup === "S",
            );
            const hasBelowSSCData = allQualifications.some(
              (q) => q.qualificationGroup === "B",
            );

            setHasSSCOrAbove(hasSSCData);
            setHasBelowSSC(hasBelowSSCData);

            // Set initial qualification level based on data
            if (hasSSCData && hasBelowSSCData) {
              // If both exist, default to SSC and Above
              setQualificationLevel("SSC and Above");
            } else if (hasSSCData) {
              setQualificationLevel("SSC and Above");
            } else if (hasBelowSSCData) {
              setQualificationLevel("Below SSC");
            }
            setDataFetched(true);
          }
        } catch (error) {
          console.error("Error fetching qualification details:", error);
          setDataFetched(true);
        } finally {
          stopLoading();
        }
      };

      fetchQualificationDetails();
    }
  }, [userID, currentEndpoints, formType, userLoginID, dataFetched]);

  const shouldDisableRadioButton = (type) => {
    if (userTypeID === 95 && type === "Below SSC") {
      return true;
    }
    if (userTypeID === 91) {
      return false;
    }
    if (userTypeID === 61) {
      return false;
    }

    if (type === "SSC and Above") {
      return hasBelowSSC && !hasSSCOrAbove;
    }

    if (type === "Below SSC") {
      return hasSSCOrAbove && !hasBelowSSC;
    }

    return false;
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
      response = await agent.get(`${CheckCandidateURL}?candidateId=${userID}&pageCode=Qualification&userLoginId=${userLoginID}`);
    } else if (userTypeID == 95) {
      const payLoad = {
        staffID: userID,
        userLoginID: userLoginID,
        pageCode: 'Qualification',
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

  // Helper function to format date from API to form input format (YYYY-MM-DD)
  // const formatDateForForm = (dateString) => {
  //     if (!dateString) return '';
  //     try {
  //         const date = new Date(dateString);
  //         return date.toISOString().split('T')[0];
  //     } catch (error) {
  //         console.error('Error formatting date:', error);
  //         return '';
  //     }
  // };

  const formatDateForForm = (dateString) => {
    if (!dateString) return "";

    try {
      const date = new Date(dateString);

      // Handle timezone offset
      const timezoneOffset = date.getTimezoneOffset() * 60000; // offset in milliseconds
      const localDate = new Date(date.getTime() - timezoneOffset);

      return localDate.toISOString().split("T")[0];
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  };

  // Helper function to format date for display (DD/MM/YYYY)
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date for display:", error);
      return "";
    }
  };

  // Function to reset SSC and Above form fields
  const resetForm = () => {
    setQualificationRowID(0);
    setQualificationType("");
    setNameOfDegree("");
    setSubjectBranchTrade("");
    setBoardUniversity("");
    setResultDate("");
    setAttempts("");
    setMarksObtained("");
    setOutOfMarks("");
    setCourseDuration("");
    setClassGrade("");
    setMode("");
    setCertificate(null);
    setCertificatePath("");
    setErrors({});
    setIsEdit(false);
  };

  // Function to reset Below SSC form fields
  const resetBelowSSCForm = () => {
    setQualificationRowID(0);
    setHighestStandard("");
    setYearOfAppearing("");
    setBelowSSCMarksObtained("");
    setBelowSSCOutOfMarks("");
    setBelowSSCResult("");
    setCertificatePath("");
    setErrors({});
    setIsEdit(false);
  };

  // Function to handle form validation for SSC and Above
  const validateForm = () => {
    const newErrors = {};

    if (!qualificationType) newErrors.qualificationType = "Required";
    if (!nameOfDegree) newErrors.nameOfDegree = "Required";
    if (!subjectBranchTrade) newErrors.subjectBranchTrade = "Required";
    if (!boardUniversity) newErrors.boardUniversity = "Required";
    if (!resultDate) newErrors.resultDate = "Required";
    if (!attempts) newErrors.attempts = "Required";
    if (!marksObtained) newErrors.marksObtained = "Required";
    if (!outOfMarks) newErrors.outOfMarks = "Required";
    if (!courseDuration) newErrors.courseDuration = "Required";
    if (!classGrade) newErrors.classGrade = "Required";
    if (!mode) newErrors.mode = "Required";
    if (!isEdit && !certificate && !certificatePath)
      newErrors.certificate = "Required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Function to handle form validation for Below SSC
  const validateBelowSSCForm = () => {
    const newErrors = {};

    if (!highestStandard) newErrors.highestStandard = "Required";

    // Only validate additional fields if highestStandard is not "Illiterate" or "Basic Literate"
    if (highestStandard && highestStandard !== "1" && highestStandard !== "2") {
      if (!yearOfAppearing) newErrors.yearOfAppearing = "Required";
      if (!belowSSCMarksObtained) newErrors.belowSSCMarksObtained = "Required";
      if (!belowSSCOutOfMarks) newErrors.belowSSCOutOfMarks = "Required";
      if (!belowSSCResult) newErrors.belowSSCResult = "Required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Function to add or update qualification (SSC and Above)
  const handleAddQualification = async () => {
    if (validateForm()) {
      try {
        if (parseFloat(marksObtained) > parseFloat(outOfMarks)) {
          marksValidationPopup();
          return;
        }
        startLoading();

        // Create request data object matching the specified structure
        const requestData = {
          qualificationRowID: isEdit ? qualificationRowID : 0,
          staffID: formType === "Staff" ? userID : 0,
          candidateID: formType === "Candidate" ? userID : 0,
          qualificationID: parseInt(qualificationType) || 0,
          qualification: qualificationTypeOptions.find(opt => opt.value === qualificationType)?.label || '',
          qualificationGroup: 'S',
          degree: nameOfDegree,
          subject: subjectBranchTrade,
          university: boardUniversity,
          resultDate: resultDate ? new Date(resultDate).toISOString() : new Date().toISOString(),
          resultDateStr: resultDate ? new Date(resultDate).toLocaleDateString('en-GB') : '',
          appearingYear: resultDate ? new Date(resultDate).getFullYear() : new Date().getFullYear(),
          appearingYearsStr: resultDate ? new Date(resultDate).getFullYear().toString() : '',
          attempts: parseInt(attempts) || 0,
          marksObtained: parseFloat(marksObtained) || 0,
          marksObtainedStr: marksObtained,
          maximumMarks: parseFloat(outOfMarks) || 0,
          maximumMarksStr: outOfMarks,
          courseDuration: parseInt(courseDuration) || 0,
          class: classGrade,
          mode: mode,
          certificatePath: certificatePath || '',
          userLoginID: userLoginID,
          ipAddress: ipAddress || '',
          pageCode: 'Qualification'
        };


        const response = await agent.post(currentEndpoints.save, requestData);

        if (response.data && response.data.Status === "Success") {
          const qualificationTypeLabel =
            qualificationTypeOptions.find(
              (opt) => opt.value === qualificationType,
            )?.label || qualificationType;

          Swal.fire({
            title: "Success!",
            text: isEdit
              ? "Qualification updated successfully"
              : "Qualification added successfully",
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
          }).then(() => {
            // Refresh once so the list, hasSSCOrAbove/hasBelowSSC flags, and all
            // derived state are re-fetched fresh from the server instead of being
            // patched locally.
            window.location.reload();
          });

          if (isEdit) {
            setQualificationsList(
              qualificationsList.map((item) =>
                item.qualificationRowID === qualificationRowID
                  ? {
                    ...item,
                    qualificationType,
                    qualificationName: qualificationTypeLabel,
                    qualificationGroup: "S",
                    nameOfDegree,
                    subjectBranchTrade,
                    boardUniversity,
                    resultDate,
                    attempts,
                    marksObtained,
                    outOfMarks,
                    courseDuration,
                    classGrade,
                    mode,
                    certificatePath:
                      response.data.Data?.CertificatePath || certificatePath,
                  }
                  : item,
              ),
            );
          } else {
            const newQualification = {
              id:
                response.data.Data?.QualificationRowID || Date.now().toString(),
              qualificationRowID:
                response.data.Data?.QualificationRowID || Date.now().toString(),
              qualificationType,
              qualificationName: qualificationTypeLabel,
              qualificationGroup: "S",
              nameOfDegree,
              subjectBranchTrade,
              boardUniversity,
              resultDate,
              attempts,
              marksObtained,
              outOfMarks,
              courseDuration,
              classGrade,
              mode,
              certificatePath: response.data.Data?.CertificatePath,
            };
            setQualificationsList([...qualificationsList, newQualification]);
          }

          resetForm();
        } else {
          setErrors({
            form:
              response.data?.Message ||
              "An error occurred while saving qualification.",
          });
        }
      } catch (error) {
        console.error("Error saving qualification:", error);
        setErrors({
          form: "Failed to save qualification details. Please try again.",
        });
      } finally {
        stopLoading();
      }
    } else {
    }
  };

  // Function to add Below SSC qualification
  const handleAddBelowSSCQualification = async () => {
    if (validateBelowSSCForm()) {
      try {
        if (
          highestStandard !== "Illiterate" &&
          highestStandard !== "Basic Literate"
        ) {
          if (
            parseFloat(belowSSCMarksObtained) > parseFloat(belowSSCOutOfMarks)
          ) {
            marksValidationPopup();
            return;
          }
        }
        startLoading();
        const highestStandardOption = highestStandardOptions.find(
          (opt) =>
            opt.label === highestStandard || opt.value === highestStandard,
        );

        const isBasicOrIlliterate =
          highestStandard === "1" || highestStandard === "2";

        const requestData = {
          qualificationRowID: isEdit ? qualificationRowID : 0,
          staffID: formType === "Staff" ? userID : 0,
          candidateID: formType === "Candidate" ? userID : 0,
          qualificationID: highestStandardOption
            ? parseInt(highestStandardOption.value)
            : 0, // FIXED
          qualification: highestStandardOption
            ? highestStandardOption.label
            : highestStandard, // FIXED
          qualificationGroup: "B",
          degree: highestStandard || "",
          subject: "General",
          university: "Maharashtra State Board",
          resultDate: new Date().toISOString(),
          resultDateStr: "",
          appearingYear: isBasicOrIlliterate ? 0 : parseInt(yearOfAppearing),
          appearingYearsStr: isBasicOrIlliterate ? "" : yearOfAppearing,
          attempts: 1,
          marksObtained: isBasicOrIlliterate
            ? 0
            : parseFloat(belowSSCMarksObtained),
          marksObtainedStr: isBasicOrIlliterate ? "" : belowSSCMarksObtained,
          maximumMarks: isBasicOrIlliterate
            ? 0
            : parseFloat(belowSSCOutOfMarks),
          maximumMarksStr: isBasicOrIlliterate ? "" : belowSSCOutOfMarks,
          courseDuration: 12,
          class: isBasicOrIlliterate ? "" : belowSSCResult,
          mode: "Regular",
          certificatePath: certificatePath || "",
          userLoginID: userLoginID,
          ipAddress: ipAddress || "",
          pageCode: "Qualification",
        };

        const response = await agent.post(currentEndpoints.save, requestData);

        if (response.data && response.data.Status === "Success") {
          Swal.fire({
            title: "Success!",
            text: isEdit
              ? "Qualification updated successfully"
              : "Qualification added successfully",
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
          }).then(() => {
            window.location.reload();
          });

          const newQualification = {
            id: response.data.Data?.QualificationRowID || Date.now().toString(),
            qualificationRowID:
              response.data.Data?.QualificationRowID || Date.now().toString(),
            qualificationGroup: "B",
            //qualificationName: highestStandard,
            qualificationName:
              highestStandardOptions.find(
                (opt) => opt.value === highestStandard
              )?.label || highestStandard,
            nameOfDegree: highestStandard,
            subjectBranchTrade: "General",
            boardUniversity: "Maharashtra State Board",
            resultDate: "",
            attempts: "1",
            marksObtained: isBasicOrIlliterate ? "" : belowSSCMarksObtained,
            outOfMarks: isBasicOrIlliterate ? "" : belowSSCOutOfMarks,
            courseDuration: "12",
            classGrade: isBasicOrIlliterate ? "" : belowSSCResult,
            mode: "Regular",
            certificatePath:
              response.data.Data?.CertificatePath || certificatePath,
            highestStandard,
            yearOfAppearing: isBasicOrIlliterate ? "" : yearOfAppearing,
          };

          if (isEdit) {
            setQualificationsList(
              qualificationsList.map((item) =>
                item.qualificationRowID === qualificationRowID
                  ? newQualification
                  : item,
              ),
            );
          } else {
            setQualificationsList([...qualificationsList, newQualification]);
          }

          resetBelowSSCForm();
        } else {
          setErrors({
            belowSSCForm:
              response.data?.Message ||
              "An error occurred while saving qualification.",
          });
        }
      } catch (error) {
        console.error("Error adding Below SSC qualification:", error);
        setErrors({
          belowSSCForm:
            "Failed to save qualification details. Please try again.",
        });
      } finally {
        stopLoading();
      }
    }
  };

  // Function to handle Save & Next action - Just navigate to next page
  const handleSaveAndNext = () => {
    if (isInstituteUser && candidateIdFromUrl) {
      navigate(
        `/Candidate/LockApplicationForm?candidateId=${candidateIdFromUrl}&applicationId=${applicationId}`,
      );
    } else {
      navigate(`/${formType}/Training`);
    }
  };

  // Function to handle edit qualification
  const handleEditQualification = async (qualificationRowIDToEdit, item) => {
    try {

      startLoading();
      const qualification = qualificationsList.find(
        (q) => q.qualificationRowID === qualificationRowIDToEdit,
      );

      if (qualification) {
        setIsEdit(true);
        setQualificationRowID(qualification.qualificationRowID);

        // Check if it's Below SSC or SSC and Above
        if (qualification.qualificationGroup === "B") {
          setQualificationLevel("Below SSC");
          // setHighestStandard(
          //   qualification.highestStandard || qualification.nameOfDegree,
          // );
          setHighestStandard(
            qualification.qualificationType ||
            qualification.highestStandard ||
            "",
          );
          setYearOfAppearing(qualification.yearOfAppearing || "");
          setBelowSSCMarksObtained(qualification.marksObtained || "");
          setBelowSSCOutOfMarks(qualification.outOfMarks || "");
          setBelowSSCResult(qualification.classGrade || "");
          setCertificatePath(qualification.certificatePath || "");
        } else {
          setQualificationLevel("SSC and Above");

          // For detailed information, fetch from API
          let detailResponse;
          if (formType === "Candidate") {
            detailResponse = await agent.get(
              `${currentEndpoints.getDetails}${qualification.qualificationRowID}`,
            );
          } else {
            detailResponse = await agent.get(currentEndpoints.getDetails, {
              params: {
                QualificationRowID: qualification.qualificationRowID,
              },
            });
          }

          if (detailResponse.data && detailResponse.data.Status === "Success") {
            const detailData = detailResponse.data.Data;
            setQualificationType(
              detailData.QualificationID?.toString() ||
              qualification.qualificationType,
            );
            setNameOfDegree(detailData.Degree || qualification.nameOfDegree);
            setSubjectBranchTrade(
              detailData.Subject || qualification.subjectBranchTrade,
            );
            setBoardUniversity(
              detailData.University || qualification.boardUniversity,
            );
            setResultDate(
              formatDateForForm(detailData.ResultDate) ||
              qualification.resultDate,
            );
            setAttempts(
              detailData.Attempts?.toString() || qualification.attempts,
            );
            setMarksObtained(
              detailData.MarksObtainedStr ||
              detailData.MarksObtained?.toString() ||
              qualification.marksObtained,
            );
            setOutOfMarks(
              detailData.MaximumMarksStr ||
              detailData.MaximumMarks?.toString() ||
              qualification.outOfMarks,
            );
            setCourseDuration(
              detailData.CourseDuration?.toString() ||
              qualification.courseDuration,
            );
            setClassGrade(detailData.Class || qualification.classGrade);
            setMode(detailData.Mode || qualification.mode);
            setCertificatePath(
              detailData.CertificatePath || qualification.certificatePath,
            );
          } else {
            // Fallback to local data
            setQualificationType(qualification.qualificationType);
            setNameOfDegree(qualification.nameOfDegree);
            setSubjectBranchTrade(qualification.subjectBranchTrade);
            setBoardUniversity(qualification.boardUniversity);
            setResultDate(qualification.resultDate);
            setAttempts(qualification.attempts);
            setMarksObtained(qualification.marksObtained);
            setOutOfMarks(qualification.outOfMarks);
            setCourseDuration(qualification.courseDuration);
            setClassGrade(qualification.classGrade);
            setMode(qualification.mode);
            setCertificatePath(qualification.certificatePath);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching qualification details for edit:", error);
      setErrors({
        form: "Failed to load qualification details. Please try again.",
      });
    } finally {
      stopLoading();
    }
  };

  // Function to handle delete qualification with SweetAlert confirmation
  const handleDeleteQualification = async (qualificationRowIDToDelete) => {
    // Show confirmation dialog
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        startLoading();
        const qualification = qualificationsList.find(
          (q) => q.qualificationRowID === qualificationRowIDToDelete,
        );

        if (!qualification) {
          throw new Error("Qualification not found");
        }

        let response;
        if (formType === "Candidate") {
          const url = `${currentEndpoints.delete}${qualification.qualificationRowID}?candidateId=${userID}&userLoginId=${userLoginID}&pageCode=Qualification`;
          response = await agent.delete(url);
        } else {
          // For Staff, construct the full object with required fields
          const payload = {
            qualificationRowID: qualification.qualificationRowID,
            staffID: userID,
            qualificationID: parseInt(qualification.qualificationType) || 0,
            qualification: qualification.qualificationName || "",
            qualificationGroup: qualification.qualificationGroup || "S",
            degree: qualification.nameOfDegree || "",
            subject: qualification.subjectBranchTrade || "",
            university: qualification.boardUniversity || "",
            resultDate: qualification.resultDate
              ? new Date(qualification.resultDate).toISOString()
              : null,
            resultDateStr: qualification.resultDate || "",
            appearingYear: resultDate
              ? new Date(Date.parse(resultDate)).getFullYear()
              : new Date().getFullYear(),

            appearingYearsStr: "",
            attempts: parseInt(qualification.attempts) || 0,
            marksObtained: parseFloat(qualification.marksObtained) || 0,
            marksObtainedStr: qualification.marksObtained || "",
            maximumMarks: parseFloat(qualification.outOfMarks) || 0,
            maximumMarksStr: qualification.outOfMarks || "",
            courseDuration: parseInt(qualification.courseDuration) || 0,
            class: qualification.classGrade || "",
            mode: qualification.mode || "",
            certificatePath: qualification.certificatePath || "",
            userLoginID: userLoginID || "",
            ipAddress: ipAddress || "",
            pageCode: "Qualification",
          };

          response = await agent.post(currentEndpoints.delete, payload);
        }

        if (response.data && response.data.Status === "Success") {
          setQualificationsList(
            qualificationsList.filter(
              (q) => q.qualificationRowID !== qualificationRowIDToDelete,
            ),
          );

          Swal.fire({
            title: "Deleted!",
            text: "Your qualification has been deleted.",
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
          });
        } else {
          throw new Error(
            response.data?.Message || "Failed to delete qualification",
          );
        }
      } catch (error) {
        console.error("Error deleting qualification:", error);
        Swal.fire({
          title: "Error!",
          text: "Failed to delete qualification. Please try again.",
          icon: "error",
          confirmButtonText: "OK",
        });
      } finally {
        stopLoading();
      }
    }
  };

  const [disableFields, setDisableFields] = useState(false);

  const isBasicOrIlliterate = (value) => {
    if (value !== "1" && value !== "2") {
      setDisableFields(false);
    } else {
      setDisableFields(true);
    }
  };

  // Function to view certificate
  const handleViewCertificate = (path) => {
    if (path) {
      window.open(path, "_blank");
    }
  };

  const marksValidationPopup = () => {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Marks Obtained should be less than or equal to Maximum Marks.",
    });
  };

  // Columns for SSC and Above qualification list
  const sscColumns = [
    { key: "action", header: "Action", sortable: false, width: "80px" },
    { key: "qualificationName", header: "Qualification Type" },
    { key: "nameOfDegree", header: "Name Of Degree" },
    { key: "subjectBranchTrade", header: "Subject / Branch / Trade" },
    { key: "boardUniversity", header: "Board / University" },
    { key: "resultDate", header: "Result Date" },
    { key: "attempts", header: "Attempts" },
    { key: "marksObtained", header: "Marks Obtained" },
    { key: "outOfMarks", header: "Maximum Marks" },
    { key: "courseDuration", header: "Course Duration (In Months)" },
    { key: "classGrade", header: "Class / Grade" },
    { key: "mode", header: "Mode" },
    { key: "certificatePath", header: "Certificate", sortable: false },
  ];

  // Columns for Below SSC qualification list
  const belowSSCColumns = [
    { key: "action", header: "Action", sortable: false, width: "80px" },
    { key: "qualificationName", header: "Highest Standard Attended" },
    { key: "yearOfAppearing", header: "Year of Appearing" },
    { key: "marksObtained", header: "Marks Obtained" },
    { key: "outOfMarks", header: "Maximum Marks" },
    { key: "classGrade", header: "Result" },
    { key: "certificatePath", header: "Certificate", sortable: false },
  ];

  const renderQualificationCell = (item, column) => {
    if (column.key === "action") {
      return (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            className="text-green-600 hover:text-green-800"
            onClick={() => handleEditQualification(item.qualificationRowID, item)}
            title="Edit"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            type="button"
            className="text-red-600 hover:text-red-800"
            onClick={() => handleDeleteQualification(item.qualificationRowID)}
            title="Delete"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      );
    }

    if (column.key === "qualificationName") {
      return item.qualificationName || item.qualificationType;
    }

    if (column.key === "resultDate") {
      return formatDateForDisplay(item.resultDate);
    }

    if (column.key === "certificatePath") {
      return item.certificatePath ? (
        <button
          type="button"
          className="text-green-600 hover:text-green-800 flex items-center justify-center mx-auto"
          onClick={() => handleViewCertificate(item.certificatePath)}
          title="View Certificate"
        >
          <img src={pdflogo} alt="PDF" className="h-6 w-6 object-contain" />
        </button>
      ) : (
        <span className="text-gray-400">-</span>
      );
    }

    return undefined;
  };

  const displayedQualifications =
    qualificationLevel === "SSC and Above"
      ? qualificationsList.filter((q) => q.qualificationGroup !== "B")
      : qualificationsList.filter((q) => q.qualificationGroup === "B");

  return (
    <div className="mx-auto w-full rounded-lg bg-white p-6 shadow-md">
      <div>
        <ProgressTracker />
      </div>
      <fieldset className="mb-4 rounded-md border p-4">
        <legend
          className={`flex ${color} items-center text-base font-semibold text-white border-2 border-gray-300 px-3 py-1.5 rounded-md ml-4`}
        >
          Education Qualification
        </legend>

        <div className="mt-4">
          <div className="mb-6 flex justify-center">
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="qualificationLevel"
                  value="SSC and Above"
                  checked={qualificationLevel === "SSC and Above"}
                  onChange={() =>
                    !shouldDisableRadioButton("SSC and Above") &&
                    setQualificationLevel("SSC and Above")
                  }
                  className="h-4 w-4"
                  disabled={shouldDisableRadioButton("SSC and Above")}
                />
                <span className="text-gray-800">SSC and Above</span>
              </label>

              {userTypeID === 95 ? (
                <label className="flex items-center gap-2 opacity-50 cursor-not-allowed">
                  <input
                    type="radio"
                    name="qualificationLevel"
                    disabled
                    className="h-4 w-4"
                  />
                  <span className="text-gray-500">Below SSC</span>
                </label>
              ) : (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="qualificationLevel"
                    value="Below SSC"
                    checked={qualificationLevel === "Below SSC"}
                    onChange={() =>
                      !shouldDisableRadioButton("Below SSC") &&
                      setQualificationLevel("Below SSC")
                    }
                    className="h-4 w-4"
                    disabled={shouldDisableRadioButton("Below SSC")}
                  />
                  <span className="text-gray-800">Below SSC</span>
                </label>
              )}
            </div>
          </div>

          {qualificationLevel === "SSC and Above" && (
            <div className="mb-6">
              <div className="flex items-start mb-4">
                <div className="mr-4">
                  <p className="mt-1 text-sm text-gray-600">
                    Add SSC and Above Qualification
                  </p>
                </div>
              </div>

              {errors.form && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {errors.form}
                </div>
              )}

              <div className="grid grid-cols-3 gap-4 mt-4">
                <div>
                  <DropdownComponent
                    label="Qualification Type"
                    value={qualificationType}
                    onChange={(value) => setQualificationType(value)}
                    options={qualificationTypeOptions}
                    error={errors.qualificationType}
                    placeholder="Select Qualification Type"
                    required={true}
                  />
                </div>

                <div>
                  <label className="font-normal">
                    Name of Degree/Certificate{" "}
                    <span className="text-red-500">*</span>
                    {errors.nameOfDegree && (
                      <span className="ml-1 text-sm text-red-500">
                        {errors.nameOfDegree}
                      </span>
                    )}
                  </label>
                  <FormComponent
                    type="text"
                    name="nameOfDegree"
                    value={nameOfDegree}
                    onChange={(value) => {
                      if (/^[A-Za-z\s]*$/.test(value)) {
                        setNameOfDegree(value);
                      }
                    }}
                    placeholder="Enter name of degree"
                    disabled={currentConfig.defaultDegree ? true : false}
                  />
                </div>

                <div>
                  <label className="font-normal">
                    Subject/Branch/Trade <span className="text-red-500">*</span>
                    {errors.subjectBranchTrade && (
                      <span className="ml-1 text-sm text-red-500">
                        {errors.subjectBranchTrade}
                      </span>
                    )}
                  </label>

                  {currentConfig.subjectType === "dropdown" ? (
                    <DropdownComponent
                      value={subjectBranchTrade}
                      onChange={(value) => setSubjectBranchTrade(value)}
                      options={currentConfig.subjectOptions || []}
                      placeholder="Select Subject"
                    />
                  ) : (
                    <FormComponent
                      type="text"
                      name="subjectBranchTrade"
                      value={subjectBranchTrade}
                      onChange={(value) => {
                        if (/^[A-Za-z\s]*$/.test(value)) {
                          setSubjectBranchTrade(value);
                        }
                      }}
                      placeholder="Enter subject/branch/trade"
                      disabled={!!currentConfig.defaultSubject}
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="font-normal">
                    Board/University <span className="text-red-500">*</span>
                    {errors.boardUniversity && (
                      <span className="ml-1 text-sm text-red-500">
                        {errors.boardUniversity}
                      </span>
                    )}
                  </label>
                  <FormComponent
                    type="text"
                    name="boardUniversity"
                    value={boardUniversity}
                    onChange={(value) => {
                      if (/^[A-Za-z\s]*$/.test(value)) {
                        setBoardUniversity(value);
                      }
                    }}
                    placeholder="Enter board/university"
                    disabled={currentConfig.boardUniversityType === "fixed"}
                  />
                </div>

                <div>
                  <label className="font-normal">
                    Result Date <span className="text-red-500">*</span>
                    {errors.resultDate && (
                      <span className="ml-1 text-sm text-red-500">
                        {errors.resultDate}
                      </span>
                    )}
                  </label>
                  <FormComponent
                    type="date"
                    name="resultDate"
                    value={resultDate}
                    onChange={(value) => setResultDate(value)}
                  />
                </div>

                <div>
                  <DropdownComponent
                    label="Attempts"
                    value={attempts}
                    onChange={(value) => setAttempts(value)}
                    options={attemptsOptions}
                    error={errors.attempts}
                    placeholder="Select"
                    required={true}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="font-normal">
                    Marks Obtained <span className="text-red-500">*</span>
                    {errors.marksObtained && (
                      <span className="ml-1 text-sm text-red-500">
                        {errors.marksObtained}
                      </span>
                    )}
                  </label>
                  <FormComponent
                    type="text"
                    name="marksObtained"
                    value={marksObtained}
                    onChange={(value) => {
                      if (/^\d*$/.test(value)) {
                        setMarksObtained(value);
                      }
                    }}
                    placeholder="Enter marks obtained"
                  />
                </div>

                <div>
                  <label className="font-normal">
                    Maximum Marks <span className="text-red-500">*</span>
                    {errors.outOfMarks && (
                      <span className="ml-1 text-sm text-red-500">
                        {errors.outOfMarks}
                      </span>
                    )}
                  </label>
                  <FormComponent
                    type="text"
                    name="outOfMarks"
                    value={outOfMarks}
                    onChange={(value) => {
                      if (/^\d*$/.test(value)) {
                        setOutOfMarks(value);
                      }
                    }}
                    placeholder="Enter maximum marks"
                  />
                </div>

                <div>
                  <label className="font-normal">
                    Course Duration (in months){" "}
                    <span className="text-red-500">*</span>
                    {errors.courseDuration && (
                      <span className="ml-1 text-sm text-red-500">
                        {errors.courseDuration}
                      </span>
                    )}
                  </label>
                  <FormComponent
                    type="number"
                    name="courseDuration"
                    value={courseDuration}
                    onChange={(value) => setCourseDuration(value)}
                    placeholder="Enter course duration"
                    min="1"
                    disabled={currentConfig.courseDuration ? true : false}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-4">
                <div>
                  <DropdownComponent
                    label="Class / Grade"
                    value={classGrade}
                    onChange={(value) => setClassGrade(value)}
                    options={classGradeOptions}
                    error={errors.classGrade}
                    placeholder="Select"
                    required={true}
                  />
                </div>

                <div>
                  <DropdownComponent
                    label="Mode"
                    value={mode}
                    onChange={(value) => setMode(value)}
                    options={[
                      { value: "Regular", label: "Regular" },
                      { value: "Distance", label: "Distance" },
                      { value: "Online", label: "Online" },
                    ]}
                    error={errors.mode}
                    placeholder="Select Mode"
                    required={true}
                  />
                </div>

                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <span className="flex items-center gap-2">
                      Certificate <span className="text-red-600">*</span>
                      {errors.certificate && (
                        <span className="text-red-600">
                          {errors.certificate}
                        </span>
                      )}
                      {certificatePath && (
                        <span className="text-green-600">
                          Certificate Already Uploaded
                        </span>
                      )}
                    </span>
                  </label>
                  <UploadPdf
                    file={certificate?.fileName}
                    onFileChange={(fileData) => {
                      setCertificate({
                        filePath: fileData.filePath,
                        fileName: fileData.fileName,
                        uniqueFileName: fileData.uniqueFileName,
                        file: fileData.file,
                      });
                      setCertificatePath(fileData.filePath);
                    }}
                    buttonClassName="bg-cyan-500 hover:bg-cyan-600"
                    buttonText="Upload"
                    id="certificateUpload"
                    allowedFileTypes="pdf"
                    maxFileSize="5 MB"
                    required={true}
                    label="Upload Document to Validate Marks"
                    showLabel={false}
                    userTypeID={userTypeID}
                    userLoginID={userLoginID}
                    linkName="View Document"
                    uniquefilepath={certificatePath}
                  />
                </div>
              </div>

              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded mt-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> In case of CGPA, enter CGPA score out
                  of 10 in Marks Obtained and 10 in Maximum Marks.
                </p>
              </div>

              <div className="mt-8 flex justify-center space-x-4">
                <button
                  type="button"
                  className="rounded-md bg-red-500 px-4 py-2 text-white hover:bg-gray-300"
                  onClick={resetForm}
                >
                  Reset
                </button>
                <button
                  type="button"
                  className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                  onClick={handleAddQualification}
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : isEdit ? "Update" : "Add"}
                </button>
              </div>
            </div>
          )}

          {qualificationLevel === "Below SSC" && (
            <div className="mb-6">
              <div className="flex items-start mb-4">
                <div className="mr-4">
                  <p className="mt-1 text-sm text-gray-600">
                    Add Below SSC Qualification
                  </p>
                </div>
              </div>

              {errors.belowSSCForm && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {errors.belowSSCForm}
                </div>
              )}

              <div className="grid grid-cols-3 gap-4 mt-4">
                <div>
                  <DropdownComponent
                    label="Highest Standard Passed"
                    value={highestStandard}
                    onChange={(value) => {
                      setHighestStandard(value);
                      isBasicOrIlliterate(value);
                    }}
                    options={highestStandardOptions}
                    error={errors.highestStandard}
                    placeholder="Select Highest Standard"
                    required={true}
                  />
                </div>

                {!disableFields && (
                  <>
                    <div>
                      <DropdownComponent
                        label="Year of Appearing"
                        value={yearOfAppearing}
                        onChange={(value) => setYearOfAppearing(value)}
                        options={yearOptions}
                        error={errors.yearOfAppearing}
                        placeholder="Select Year"
                        required={true}
                      />
                    </div>

                    <div>
                      <label className="font-normal">
                        Marks Obtained <span className="text-red-500">*</span>
                        {errors.belowSSCMarksObtained && (
                          <span className="ml-1 text-sm text-red-500">
                            {errors.belowSSCMarksObtained}
                          </span>
                        )}
                      </label>
                      <FormComponent
                        type="text"
                        name="belowSSCMarksObtained"
                        value={belowSSCMarksObtained}
                        onChange={(value) => {
                          if (/^\d*$/.test(value)) {
                            setBelowSSCMarksObtained(value);
                          }
                        }}
                        placeholder="Enter marks obtained"
                      />
                    </div>
                  </>
                )}
              </div>

              {!disableFields && (
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className="font-normal">
                      Maximum Marks<span className="text-red-500">*</span>
                      {errors.belowSSCOutOfMarks && (
                        <span className="ml-1 text-sm text-red-500">
                          {errors.belowSSCOutOfMarks}
                        </span>
                      )}
                    </label>
                    <FormComponent
                      type="text"
                      name="belowSSCOutOfMarks"
                      value={belowSSCOutOfMarks}
                      onChange={(value) => {
                        if (/^\d*$/.test(value)) {
                          setBelowSSCOutOfMarks(value);
                        }
                      }}
                      placeholder="Enter maximum marks"
                    />
                  </div>

                  <div>
                    <DropdownComponent
                      label="Result"
                      value={belowSSCResult}
                      onChange={(value) => setBelowSSCResult(value)}
                      options={classGradeOptions}
                      error={errors.belowSSCResult}
                      placeholder="Select Result"
                      required={true}
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <span className="flex items-center gap-2">
                        Certificate
                        {errors.certificate && (
                          <span className="text-red-600">
                            {errors.certificate}
                          </span>
                        )}
                        {certificatePath && (
                          <span className="text-green-600">
                            Certificate Already Uploaded
                          </span>
                        )}
                      </span>
                    </label>
                    <UploadPdf
                      file={certificate?.fileName}
                      onFileChange={(fileData) => {
                        setCertificate({
                          filePath: fileData.filePath,
                          fileName: fileData.fileName,
                          uniqueFileName: fileData.uniqueFileName,
                          file: fileData.file,
                        });
                        setCertificatePath(fileData.filePath);
                      }}
                      buttonClassName="bg-cyan-500 hover:bg-cyan-600"
                      buttonText="Upload"
                      id="certificateUpload"
                      allowedFileTypes="pdf"
                      maxFileSize="5 MB"
                      required={false}
                      label="Upload Document to Validate Marks"
                      showLabel={false}
                      userTypeID={userTypeID}
                      userLoginID={userLoginID}
                      linkName="View Document"
                      uniquefilepath={certificatePath}
                    />
                  </div>
                </div>
              )}

              <div className="mt-8 flex justify-center space-x-4">
                <button
                  type="button"
                  className="rounded-md bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
                  onClick={resetBelowSSCForm}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                  onClick={handleAddBelowSSCQualification}
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : isEdit ? "Update" : "Add"}
                </button>
              </div>
            </div>
          )}

          {qualificationsList.length > 0 && (
            <div className="mt-6">
              <fieldset className="rounded-md border p-4">
                <legend
                  className={`flex ${color} items-center text-base font-semibold text-white border-2 border-gray-300 px-3 py-1.5 rounded-md ml-4`}
                >
                  Qualification List
                </legend>

                <div className="mt-4">
                  <FilteredTableComponent
                    data={displayedQualifications}
                    columns={
                      qualificationLevel === "SSC and Above"
                        ? sscColumns
                        : belowSSCColumns
                    }
                    renderCell={renderQualificationCell}
                    searchable={false}
                    sortable={false}
                    exportable={false}
                    showSearch={false}
                    showExport={false}
                    paginate={false}
                    stickyHeader={false}
                    tableId="qualification-list-table"
                    emptyStateMessage="No Data Found"
                    maxHeight="none"
                  />
                </div>
              </fieldset>

              {/* Save & Next Button - Only show when there are records */}
              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                  onClick={handleSaveAndNext}
                  disabled={isLoading}
                >
                  Save & Next
                </button>
              </div>
            </div>
          )}
        </div>
      </fieldset>
    </div>
  );
};

export default Qualification;