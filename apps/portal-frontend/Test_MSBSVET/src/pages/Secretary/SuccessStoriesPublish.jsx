import React, { useState, useEffect, useContext, useRef } from "react";
import agent from "../../lib/api/agent";
import Swal from "sweetalert2";
import { Search, RotateCcw, Users } from "lucide-react";
import FilteredTableComponent from "../../Component/formcomponent/FilteredTableComponent";
import UploadPdf from "../../Component/formcomponent/UploadPdf";
import FormComponent from "../../Component/formcomponent/FormComponent";
import DropdownComponent from "../../Component/formcomponent/DropdownComponent";
import { useLoading } from "../../Hooks/useLoading";
import { FiEdit, FiPlus } from "react-icons/fi";
import { FaTrash } from "react-icons/fa";
import {
  GetMasterRegionDistrict,
  GetMasterInstitute,
  GetMasterSector,
  GetMasterCourse,
  GetCourseByCollogeID,
  GetAdmissionYear,
  GetAllSuccessStories,
  SearchSuccessStories,
  GetSuccessStoryById,
  SaveSuccessStory,
  DeleteSuccessStory,
  GetCandidateID,
  GetSuccessStoryResult,
} from "../../Endpoints_All/Secretary/SuccessStory";
import { getIp } from "../../Endpoints_All/Utils/fileUpload";
import { ThemeContext } from "../../Component/Context/ThemeContext";
import { useAuth } from "../../Hooks/AuthContext";

// TODO: not yet wired to a real endpoint — replace when API is ready
// import { UploadSuccessStoryPhoto, UploadSuccessStoryDocument } from "../../Endpoints_All/Secretary/SuccessStory";

const emptyFormData = {
  id: 0,
  isProfile: "", // "1" = has Profile ID, "0" = manual entry
  candidateProfileID: "",
  candidateId: "", // internal ID resolved from GetCandidateID, needed for GetSuccessStoryResult
  firstName: "",
  middleName: "",
  lastName: "",
  candidateFullName: "",
  candidateMobileNo: "",
  courseID: "",
  courseName: "",
  instituteID: "",
  instituteName: "",
  passingYearID: "",
  passingYear: "",
  selectionYearID: "",
  selectionYear: "",
  presentDesignation: "",
  presentOrganization: "",
  photoPath: "",
  photoFileName: "",
  documentPath: "",
  documentFileName: "",
};

// Local fallback for Selection Year until a real endpoint is provided.
// TODO: replace with API call once endpoint is available.
const buildFallbackSelectionYears = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear; y >= 1970; y--) {
    years.push({ Value: y.toString(), Text: y.toString() });
  }
  return years;
};

const SuccessStoriesPublish = () => {
  const { startLoading, stopLoading, isLoading } = useLoading();
  const { userInfo } = useAuth();
  const { color } = useContext(ThemeContext);
  const formRef = useRef(null);

  const [userLoginID, setUserLoginID] = useState(null);
  const [userTypeID, setUserTypeID] = useState(null);
  const [ipAddress, setIpAddress] = useState("0.0.0.0");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [stories, setStories] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Holds the raw rows returned by GetSuccessStoryResult for the currently
  // looked-up candidate. Needed because a candidate can be eligible under
  // multiple courses — selecting a course later must re-derive Passing Year
  // from these cached rows, exactly like the old ddlCourse_SelectedIndexChanged.
  const [profileLookupRows, setProfileLookupRows] = useState([]);

  const [dropdownOptions, setDropdownOptions] = useState({
    districts: [],
    sectors: [],
    institutes: [],
    coursesSearch: [],
    coursesForm: [],
    passingYears: [],
    selectionYears: [],
  });

  const [loading, setLoading] = useState({
    districts: false,
    sectors: false,
    institutes: false,
    coursesSearch: false,
    coursesForm: false,
    passingYears: false,
    selectionYears: false,
    profileLookup: false,
  });

  const [filters, setFilters] = useState({
    districtId: "-1",
    sectorId: "-1",
    instituteId: "-1",
    courseId: "-1",
    status: "-1",
  });

  const [formData, setFormData] = useState(emptyFormData);
  const [errors, setErrors] = useState({});

  const formatOptions = (data) => {
    if (!data || !Array.isArray(data)) return [];
    return data.map((item) => ({ value: item.Value, label: item.Text }));
  };

  // GetCourseByCollogeID returns { CourseID, CourseName, CourseCode } — different
  // shape than the other master dropdowns, so it gets its own formatter.
  const formatCourseOptions = (data) => {
    if (!data || !Array.isArray(data)) return [];
    return data.map((item) => ({
      value: item.CourseID?.toString(),
      label: item.CourseCode
        ? `${item.CourseName} (${item.CourseCode})`
        : item.CourseName,
    }));
  };

  // ---------- Init ----------
  const fetchUserDetails = async () => {
    try {
      const loginID = userInfo?.UserLoginID;
      const typeID = userInfo?.UserTypeID || localStorage.getItem("userTypeID");
      setUserLoginID(loginID);
      setUserTypeID(typeID);
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const fetchIP = async () => {
    try {
      const response = await agent.get(getIp, { headers: { accept: "*/*" } });
      setIpAddress(response.data?.ip || "0.0.0.0");
    } catch (error) {
      console.error("Error fetching IP:", error);
      setIpAddress("0.0.0.0");
    }
  };

  useEffect(() => {
    fetchUserDetails();
    fetchIP();
    fetchDistricts();
    fetchSectors();
    fetchInstitutes();
    fetchAllCourses();
    fetchPassingYears();
    // Selection Year: no API yet, using local fallback list
    setDropdownOptions((prev) => ({
      ...prev,
      selectionYears: buildFallbackSelectionYears(),
    }));
    fetchStories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- Dropdown fetchers ----------
  const fetchDistricts = async () => {
    try {
      setLoading((prev) => ({ ...prev, districts: true }));
      const res = await agent.get(GetMasterRegionDistrict);
      setDropdownOptions((prev) => ({
        ...prev,
        districts: res.data?.Data || res.data || [],
      }));
    } catch (error) {
      console.error("Error fetching districts:", error);
    } finally {
      setLoading((prev) => ({ ...prev, districts: false }));
    }
  };

  const fetchSectors = async () => {
    try {
      setLoading((prev) => ({ ...prev, sectors: true }));
      const res = await agent.get(GetMasterSector);
      setDropdownOptions((prev) => ({
        ...prev,
        sectors: res.data?.Data || res.data || [],
      }));
    } catch (error) {
      console.error("Error fetching sectors:", error);
    } finally {
      setLoading((prev) => ({ ...prev, sectors: false }));
    }
  };

  const fetchInstitutes = async () => {
    try {
      setLoading((prev) => ({ ...prev, institutes: true }));
      const res = await agent.get(GetMasterInstitute);
      // console.log("GetMasterInstitute response:", res.data);
      setDropdownOptions((prev) => ({
        ...prev,
        institutes: res.data?.Data || res.data || [],
      }));
    } catch (error) {
      console.error("Error fetching institutes:", error);
    } finally {
      setLoading((prev) => ({ ...prev, institutes: false }));
    }
  };

  // All courses, used for the search-panel Course dropdown (unfiltered by sector)
  const fetchAllCourses = async () => {
    try {
      setLoading((prev) => ({ ...prev, coursesSearch: true }));
      const res = await agent.get(
        `${GetMasterCourse}?SectorID=0&CourseTypeID=0&Flag=`,
      );
      setDropdownOptions((prev) => ({
        ...prev,
        coursesSearch: res.data?.Data || res.data || [],
      }));
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading((prev) => ({ ...prev, coursesSearch: false }));
    }
  };

  // Course dropdown filtered by sector, for the search panel
  const fetchCoursesBySector = async (sectorId) => {
    try {
      setLoading((prev) => ({ ...prev, coursesSearch: true }));
      const res = await agent.get(
        `${GetMasterCourse}?SectorID=${sectorId}&CourseTypeID=0&Flag=`,
      );
      setDropdownOptions((prev) => ({
        ...prev,
        coursesSearch: res.data?.Data || res.data || [],
      }));
    } catch (error) {
      console.error("Error fetching courses by sector:", error);
    } finally {
      setLoading((prev) => ({ ...prev, coursesSearch: false }));
    }
  };

  // Course dropdown for the Add/Edit form, filtered by selected Institute.
  // Returns the raw list so callers (e.g. profile lookup) can further filter it.
  const fetchCoursesByInstitute = async (instituteId) => {
    if (!instituteId || instituteId === "-1") {
      setDropdownOptions((prev) => ({ ...prev, coursesForm: [] }));
      return [];
    }
    try {
      setLoading((prev) => ({ ...prev, coursesForm: true }));
      // TODO: confirm whether GetCourseByCollogeID expects a query param or path param
      const res = await agent.get(
        `${GetCourseByCollogeID}?CollegeID=${instituteId}`,
      );
      // Shape confirmed: { Status, StatusCode, Message, Data: [{ CourseID, CourseName, CourseCode }] }
      const list = res.data?.Data || [];
      setDropdownOptions((prev) => ({ ...prev, coursesForm: list }));
      return list;
    } catch (error) {
      console.error("Error fetching courses by institute:", error);
      return [];
    } finally {
      setLoading((prev) => ({ ...prev, coursesForm: false }));
    }
  };

  const fetchPassingYears = async () => {
    try {
      setLoading((prev) => ({ ...prev, passingYears: true }));
      const res = await agent.get(GetAdmissionYear);
      setDropdownOptions((prev) => ({
        ...prev,
        passingYears: res.data?.Data || res.data || [],
      }));
    } catch (error) {
      console.error("Error fetching passing years:", error);
    } finally {
      setLoading((prev) => ({ ...prev, passingYears: false }));
    }
  };

  // ---------- Grid ----------
  const fetchStories = async () => {
    try {
      startLoading();
      const res = await agent.get(GetAllSuccessStories);
      setStories(res.data?.Data || res.data || []);
    } catch (error) {
      console.error("Error fetching success stories:", error);
      setStories([]);
    } finally {
      setHasSearched(true);
      stopLoading();
    }
  };

  const handleSearch = async () => {
    try {
      startLoading();
      const res = await agent.get(SearchSuccessStories, {
        params: {
          districtId: filters.districtId,
          sectorId: filters.sectorId,
          instituteId: filters.instituteId,
          courseId: filters.courseId,
          publishStatus: filters.status,
        },
      });
      setStories(res.data?.Data || res.data || []);
    } catch (error) {
      console.error("Error searching success stories:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.Message || "Error searching records.",
        confirmButtonColor: "#d33",
      });
    } finally {
      setHasSearched(true);
      stopLoading();
    }
  };

  const handleResetFilters = () => {
    setFilters({
      districtId: "-1",
      sectorId: "-1",
      instituteId: "-1",
      courseId: "-1",
      status: "-1",
    });
    fetchStories();
  };

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
    if (name === "sectorId") {
      fetchCoursesBySector(value);
    }
  };

  // ---------- Profile lookup (candidate autofill) ----------
  // Step 1: GET /Base/GetCandidateID?ApplicationID={profileNo} -> CandidateID
  // Step 2: GET /api/InstituteBase/GetSuccessStoryResult/{candidateId}/{instituteId} -> candidate rows
  // Replicates old txtProfileNo_TextChanged behaviour exactly, including the
  // multi-course case where Passing Year only auto-fills once a course is picked.
  const handleProfileNoLookup = async () => {
    if (
      !formData.candidateProfileID ||
      formData.candidateProfileID.length < 13
    ) {
      Swal.fire({
        icon: "warning",
        title: "Enter Valid Profile No",
        text: "Please enter a valid Candidate Profile ID.",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    if (!formData.instituteID || formData.instituteID === "-1") {
      Swal.fire({
        icon: "warning",
        title: "Select Institute First",
        text: "Please select an Institute before fetching candidate details.",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    try {
      setLoading((prev) => ({ ...prev, profileLookup: true }));

      // Step 1: resolve Profile No -> CandidateID
      const candidateRes = await agent.get(GetCandidateID, {
        params: { ApplicationID: formData.candidateProfileID },
      });
      const candidateId = candidateRes.data?.Data ?? candidateRes.data;

      if (!candidateId || candidateId <= 0) {
        Swal.fire({
          icon: "warning",
          title: "Invalid Profile No",
          text: "Enter Valid Candidate Profile No.",
          confirmButtonColor: "#3085d6",
        });
        return;
      }

      // Step 2: fetch candidate's success-story-eligible records for this institute
      const resultRes = await agent.get(
        `${GetSuccessStoryResult}/${candidateId}/${formData.instituteID}`,
      );
      const rows = resultRes.data?.Data || resultRes.data || [];

      if (!rows.length) {
        Swal.fire({
          icon: "info",
          title: "No Records Found",
          text: "No eligible course records found for this candidate at the selected institute.",
          confirmButtonColor: "#3085d6",
        });
        return;
      }

      setProfileLookupRows(rows);

      const first = rows[0];
      const eligibleCourseIds = rows.map((r) => r.CourseID?.toString());

      // Filter the institute's course list down to only the courses this candidate is eligible for
      const instituteCourses = await fetchCoursesByInstitute(
        formData.instituteID,
      );
      let filteredCourses = instituteCourses.filter((c) =>
        eligibleCourseIds.includes(c.CourseID?.toString()),
      );

      // Safety net: GetSuccessStoryResult is the source of truth for eligibility,
      // but GetCourseByCollogeID may not list every course (e.g. inactive/legacy
      // course mappings). For any eligible CourseID missing from the
      // institute-scoped list, resolve its name from the full master course list
      // (dropdownOptions.coursesSearch, {Value, Text} shape) so the dropdown never
      // renders a value with no matching label.
      const resolvedIds = filteredCourses.map((c) => c.CourseID?.toString());
      const missingIds = eligibleCourseIds.filter(
        (id) => !resolvedIds.includes(id),
      );

      if (missingIds.length > 0) {
        const fallbackCourses = missingIds.map((id) => {
          const master = dropdownOptions.coursesSearch.find(
            (c) => c.Value === id,
          );
          return {
            CourseID: parseInt(id),
            CourseName: master?.Text || `Course ID ${id}`,
            CourseCode: "",
          };
        });
        filteredCourses = [...filteredCourses, ...fallbackCourses];
      }

      setDropdownOptions((prev) => ({ ...prev, coursesForm: filteredCourses }));

      setFormData((prev) => ({
        ...prev,
        candidateId: candidateId,
        firstName: first.FirstName || "",
        middleName: first.MiddleName || "",
        lastName: first.LastName || "",
        candidateFullName: first.CandidateName || "",
        candidateMobileNo: first.MobileNo || "",
        photoPath: first.CandidatePhoto || "",
        // Single eligible course -> auto-select course + passing year, like the old page.
        // Multiple eligible courses -> leave blank, user must pick, which then fills Passing Year.
        courseID: rows.length === 1 ? first.CourseID?.toString() || "" : "",
        passingYearID:
          rows.length === 1 ? first.ExaminatioYearID?.toString() || "" : "",
      }));

      setErrors((prev) => ({
        ...prev,
        candidateProfileID: "",
        firstName: "",
        photoPath: "",
      }));
    } catch (error) {
      console.error("Error looking up candidate:", error);

      // A 404 / known "not found" response from the API is an expected outcome
      // (wrong Profile ID, or candidate not eligible at this institute) — not a
      // technical failure. Show it as a gentle notice rather than a hard error.
      const status = error.response?.status;
      const isNotFound =
        status === 404 ||
        error.response?.data?.Message?.toLowerCase().includes("not found");

      if (isNotFound) {
        Swal.fire({
          icon: "info",
          title: "No Matching Candidate",
          text: "We couldn't find a candidate with this Profile ID for the selected institute. Please double-check the Profile ID and Institute, then try again.",
          confirmButtonColor: "#3085d6",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Something Went Wrong",
          text:
            error.response?.data?.Message ||
            "We ran into a problem fetching candidate details. Please try again in a moment.",
          confirmButtonColor: "#d33",
        });
      }
    } finally {
      setLoading((prev) => ({ ...prev, profileLookup: false }));
    }
  };

  // ---------- Form handlers ----------
  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // When in Profile-ID mode with multiple eligible courses, selecting a course
  // must re-derive Passing Year from the cached lookup rows (no re-fetch needed).
  const handleCourseChange = (value) => {
    setFormData((prev) => ({ ...prev, courseID: value }));
    if (errors.courseID) setErrors((prev) => ({ ...prev, courseID: "" }));

    if (formData.isProfile === "1" && profileLookupRows.length > 1) {
      const matchingRow = profileLookupRows.find(
        (r) => r.CourseID?.toString() === value,
      );
      if (matchingRow) {
        setFormData((prev) => ({
          ...prev,
          courseID: value,
          passingYearID: matchingRow.ExaminatioYearID?.toString() || "",
        }));
      }
    }
  };

  const handleRadioChange = (value) => {
    setFormData((prev) => ({
      ...emptyFormData,
      id: prev.id,
      instituteID: prev.instituteID, // keep institute selection across the toggle
      isProfile: value,
    }));
    setProfileLookupRows([]);
    setErrors({});
  };

  const handleInstituteChange = (value) => {
    setFormData((prev) => ({ ...prev, instituteID: value, courseID: "" }));
    setProfileLookupRows([]);
    fetchCoursesByInstitute(value);
  };

  // TODO: photo upload not wired to an API yet
  const handlePhotoChange = (fileData) => {
    setFormData((prev) => ({
      ...prev,
      photoPath: fileData.filePath || fileData.uniqueFileName || "",
      photoFileName: fileData.fileName || "",
    }));
    setErrors((prev) => ({ ...prev, photoPath: "" }));
  };

  // TODO: document upload not wired to an API yet
  const handleDocumentChange = (fileData) => {
    setFormData((prev) => ({
      ...prev,
      documentPath: fileData.filePath || fileData.uniqueFileName || "",
      documentFileName: fileData.fileName || "",
    }));
    setErrors((prev) => ({ ...prev, documentPath: "" }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.isProfile) {
      newErrors.isProfile = "Please select Yes or No.";
    }

    if (formData.isProfile === "1") {
      if (!formData.candidateProfileID)
        newErrors.candidateProfileID = "Profile ID is required.";
    } else if (formData.isProfile === "0") {
      if (!formData.firstName) newErrors.firstName = "First Name is required.";
    }

    if (!formData.courseID || formData.courseID === "-1")
      newErrors.courseID = "Please select a Course.";
    if (!formData.instituteID || formData.instituteID === "-1")
      newErrors.instituteID = "Please select an Institute.";
    if (!formData.passingYearID || formData.passingYearID === "-1")
      newErrors.passingYearID = "Please select Passing Year.";
    if (!formData.selectionYearID || formData.selectionYearID === "-1")
      newErrors.selectionYearID = "Please select Selection Year.";
    if (!formData.presentDesignation)
      newErrors.presentDesignation = "Present Designation is required.";
    if (!formData.presentOrganization)
      newErrors.presentOrganization = "Present Organization is required.";
    if (!formData.photoPath) newErrors.photoPath = "Please upload a Photo.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildPayload = (isPublished) => {
    const selectedCourse = dropdownOptions.coursesForm.find(
      (c) => c.CourseID?.toString() === formData.courseID,
    );
    const selectedInstitute = dropdownOptions.institutes.find(
      (i) => i.Value === formData.instituteID,
    );
    const selectedPassingYear = dropdownOptions.passingYears.find(
      (y) => (y.YearId || y.Value) === formData.passingYearID,
    );
    const selectedSelectionYear = dropdownOptions.selectionYears.find(
      (y) => y.Value === formData.selectionYearID,
    );

    return {
      id: formData.id || 0,
      firstName: formData.firstName?.toUpperCase() || "",
      middleName: formData.middleName?.toUpperCase() || "",
      lastName: formData.lastName?.toUpperCase() || "",
      candidateFullName: formData.candidateFullName?.toUpperCase() || "",
      candidateProfileID: formData.candidateProfileID?.toUpperCase() || "",
      candidateMobileNo: formData.candidateMobileNo || "",
      photoPath: formData.photoPath || "",
      courseID: parseInt(formData.courseID) || 0,
      instituteID: parseInt(formData.instituteID) || 0,
      passingYearID: parseInt(formData.passingYearID) || 0,
      presentDesignation:
        formData.presentDesignation?.trim().toUpperCase() || "",
      presentOrganization:
        formData.presentOrganization?.trim().toUpperCase() || "",
      selectionYearID: parseInt(formData.selectionYearID) || 0,
      isPublished: isPublished,
      isActive: true,
      userLoginID: userLoginID || "",
      ipAddress: ipAddress,
      courseName: selectedCourse?.CourseName || "",
      courseCode: selectedCourse?.CourseCode || "",
      instituteCode: "",
      instituteName: selectedInstitute?.Text || "",
      passingYear: selectedPassingYear?.YearDisplayName || "",
      publishedStatus: isPublished ? "Published" : "Not Published",
      courseNameCode: selectedCourse
        ? selectedCourse.CourseCode
          ? `${selectedCourse.CourseName} (${selectedCourse.CourseCode})`
          : selectedCourse.CourseName
        : "",
      instituteNameCode: selectedInstitute?.Text || "",
      isProfileId: formData.isProfile,
      selectionYear: selectedSelectionYear?.Text || "",
      documentPath: formData.documentPath || "",
      isProfile: formData.isProfile,
    };
  };

  const saveStory = async (isPublished) => {
    if (!validateForm()) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Please fill all required fields correctly.",
        confirmButtonColor: "#d33",
      });
      return;
    }

    try {
      startLoading();
      const payload = buildPayload(isPublished);
      const res = await agent.post(SaveSuccessStory, payload, {
        headers: {
          "Content-Type": "application/json-patch+json",
          accept: "text/plain",
        },
      });

      if (res.data?.Status === "Success" || res.data === "Y") {
        await Swal.fire({
          icon: "success",
          title: "Success",
          text: isPublished
            ? "Candidate Published to Success Story!"
            : "Candidate saved. Waiting for Publish.",
          confirmButtonColor: "#3085d6",
        });
        setShowForm(false);
        resetForm();
        fetchStories();
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: res.data?.Message || "Error saving record.",
          confirmButtonColor: "#d33",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.Message || "Error saving record.",
        confirmButtonColor: "#d33",
      });
    } finally {
      stopLoading();
    }
  };

  const resetForm = () => {
    setFormData(emptyFormData);
    setErrors({});
    setEditingId(null);
    setProfileLookupRows([]);
  };

  const handleAddNew = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEdit = async (row) => {
    try {
      startLoading();
      const res = await agent.get(`${GetSuccessStoryById}/${row.ID || row.id}`);
      const entity = res.data?.Data || res.data;

      if (entity) {
        setFormData({
          id: entity.ID || entity.id,
          isProfile: entity.IsProfile || entity.isProfile || "",
          candidateProfileID: entity.CandidateProfileID || "",
          candidateId: "",
          firstName: entity.FirstName || "",
          middleName: entity.MiddleName || "",
          lastName: entity.LastName || "",
          candidateFullName: entity.CandidateFullName || entity.FirstName || "",
          candidateMobileNo: entity.CandidateMobileNo || "",
          courseID: entity.CourseID?.toString() || "",
          courseName: entity.CourseNameCode || "",
          instituteID: entity.InstituteID?.toString() || "",
          instituteName: entity.InstituteNameCode || "",
          passingYearID: entity.PassingYearID?.toString() || "",
          passingYear: entity.PassingYear || "",
          selectionYearID: entity.SelectionYearID?.toString() || "",
          selectionYear: entity.SelectionYear || "",
          presentDesignation: entity.PresentDesignation || "",
          presentOrganization: entity.PresentOrganization || "",
          photoPath: entity.PhotoPath || "",
          photoFileName: "",
          documentPath: entity.DocumentPath || "",
          documentFileName: "",
        });
        setEditingId(entity.ID || entity.id);
        fetchCoursesByInstitute(entity.InstituteID?.toString());
        setShowForm(true);

        setTimeout(() => {
    formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
    });
}, 100);
      }
    } catch (error) {
      console.error("Error loading record:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error loading record for edit.",
        confirmButtonColor: "#d33",
      });
    } finally {
      stopLoading();
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to retrieve this back.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      startLoading();
      const res = await agent.delete(
        `${DeleteSuccessStory}/${id}?userLoginId=${userLoginID}&ipAddress=${ipAddress}`,
      );

      if (res.data?.Status === "Success" || res.data === "Y") {
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Success Story deleted successfully.",
          confirmButtonColor: "#3085d6",
        });
        fetchStories();
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: res.data?.Message || "Error deleting record.",
          confirmButtonColor: "#d33",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.Message || "Error deleting record.",
        confirmButtonColor: "#d33",
      });
    } finally {
      stopLoading();
    }
  };

  // ---------- Grid columns ----------
  const columns = [
    {
      key: "actions",
      header: (
        <button
          type="button"
          onClick={handleAddNew}
          className="w-6 h-6 rounded flex items-center justify-center text-lg font-bold mx-auto bg-blue-500 hover:bg-blue-600 text-white"
          title="Add New Success Story"
        >
          <FiPlus size={16} />
        </button>
      ),
    
      className: "text-center",
      sortable: false,
      width: "90px",
    },
    {
      key: "PhotoPath",
      header: "Photo",
   
      className: "text-center",
      width: "90px",
      sortable: false,
    },
    {
      key: "CandidateFullName",
      header: "Name",
   
      className: "text-center",
      width: "150px",
      searchable: true,
      sortable: false,
    },
    {
      key: "CourseNameCode",
      header: "Course",
   
      className: "text-center",
      width: "180px",
      searchable: true,
      sortable: false,
    },
    {
      key: "InstituteNameCode",
      header: "Institute",
     
      className: "text-center",
      width: "200px",
      searchable: true,
      sortable: false,
    },
    {
      key: "PassingYear",
      header: "Passing Year",
      
      className: "text-center",
      width: "110px",
      sortable: false,
    },
    {
      key: "PresentDesignation",
      header: "Present Designation",
   
      className: "text-center",
      width: "150px",
      sortable: false,
    },
    {
      key: "SelectionYearID",
      header: "Selection Year",
     
      className: "text-center",
      width: "110px",
      sortable: false,
    },
    {
      key: "PublishedStatus",
      header: "Status",
      
      className: "text-center",
      width: "110px",
      sortable: false,
    },
  ];

  const renderCell = (row, column) => {
    if (column.key === "actions") {
      return (
        <div className="flex justify-center gap-3">
          <button
            onClick={() => handleEdit(row)}
            className="text-green-600 hover:text-green-800 transition"
            title="Edit"
          >
            <FiEdit size={18} />
          </button>
          <button
            onClick={() => handleDelete(row.ID || row.id)}
            className="text-red-600 hover:text-red-800 transition"
            title="Delete"
          >
            <FaTrash size={18} />
          </button>
        </div>
      );
    }

    if (column.key === "PhotoPath" && row.PhotoPath) {
      return (
        <img
          src={row.PhotoPath}
          alt="candidate"
          className="w-12 h-14 object-cover mx-auto rounded"
        />
      );
    }

    return row[column.key] ?? "";
  };

  return (
    <div className="container mx-auto p-6 max-w-full bg-gray-50 min-h-screen">
      <fieldset className="rounded border border-gray-300 p-4 mb-6">
        <legend
          className={`rounded border border-gray-300 ${color} px-4 py-1 text-xl font-bold text-white`}
        >
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Success Stories of Board
          </div>
        </legend>

        <div className="space-y-6">
          {/* Search Filters */}
          <fieldset className="border border-gray-300 rounded p-4 bg-gray-50">
            <legend className="text-base font-semibold text-gray-800 px-2 flex items-center gap-2">
              <Search className="w-4 h-4" />
              Search
            </legend>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-3">
              <DropdownComponent
                label="District"
                name="districtId"
                options={formatOptions(dropdownOptions.districts)}
                value={filters.districtId}
                onChange={(value) => handleFilterChange("districtId", value)}
                loading={loading.districts}
              />
              <DropdownComponent
                label="Sector"
                name="sectorId"
                options={formatOptions(dropdownOptions.sectors)}
                value={filters.sectorId}
                onChange={(value) => handleFilterChange("sectorId", value)}
                loading={loading.sectors}
              />
              <DropdownComponent
                label="Institute"
                name="instituteId"
                options={formatOptions(dropdownOptions.institutes)}
                value={filters.instituteId}
                onChange={(value) => handleFilterChange("instituteId", value)}
                loading={loading.institutes}
              />
              <DropdownComponent
                label="Course"
                name="courseId"
                options={formatOptions(dropdownOptions.coursesSearch)}
                value={filters.courseId}
                onChange={(value) => handleFilterChange("courseId", value)}
                loading={loading.coursesSearch}
              />
              <DropdownComponent
                label="Status"
                name="status"
                options={[
                  { value: "-1", label: " Select " },
                  { value: "1", label: "Published" },
                  { value: "0", label: "Not Published" },
                ]}
                value={filters.status}
                onChange={(value) => handleFilterChange("status", value)}
              />
            </div>

            <div className="flex justify-center gap-4 mt-6">
              <button
                type="button"
                onClick={handleSearch}
                disabled={isLoading}
                className={`flex items-center gap-2 ${color} text-white px-6 py-2 rounded hover:opacity-90 transition-opacity disabled:bg-gray-400 disabled:cursor-not-allowed min-w-[120px] justify-center`}
              >
                {isLoading ? (
                  "Loading..."
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Search
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleResetFilters}
                disabled={isLoading}
                className="flex items-center gap-2 bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed min-w-[120px] justify-center"
              >
                <RotateCcw className="w-5 h-5" />
                Reset
              </button>
            </div>
          </fieldset>

          {/* Grid */}
          {stories.length > 0 && (
            <fieldset className="border border-gray-300 rounded p-4 bg-gray-50">
                          <legend className={`rounded border border-gray-300 ${color} px-4 py-1 text-xl font-bold text-white`}>
                Success Stories List
              </legend>
              <div className="mt-3">
                <FilteredTableComponent
                  data={stories}
                  columns={columns}
                  filterColumns={[
                    "CandidateFullName",
                    "CourseNameCode",
                    "InstituteNameCode",
                  ]}
                  title=""
                  exportFileName="Success_Stories"
                  tableId="success-stories-table"
                  searchable={true}
                  sortable={true}
                  exportable={true}
                  showSearch={true}
                  showExport={true}
                  showExcel={true}
                  showPDF={true}
                  maxHeight="500px"
                  stickyHeader={true}
                  readOnly={false}
                  renderCell={renderCell}
                  emptyMessage="No data found"
                />
              </div>
            </fieldset>
          )}

          {/* Friendly empty state — mirrors the Institute Status page pattern */}
          {hasSearched && !isLoading && stories.length === 0 && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-bold text-yellow-800">
                No Success Stories Found
              </h3>
              <p className="text-yellow-700 mt-1">
                No records found for the selected search criteria. Try adjusting
                your filters, or add a new Success Story below.
              </p>
              <button
                type="button"
                onClick={handleAddNew}
                className={`mt-4 flex items-center gap-2 ${color} text-white px-4 py-2 rounded hover:opacity-90 transition-opacity`}
              >
                <FiPlus size={16} />
                Add New Success Story
              </button>
            </div>
          )}

          {/* Add / Edit Form */}
        {showForm && (
    <fieldset
        ref={formRef}
        className="border border-gray-300 rounded-lg p-6 bg-white shadow-lg"
    >
              <legend
                className={`flex items-center gap-2 rounded-md border border-gray-300 ${color} px-4 py-2 text-sm font-bold text-white shadow-md`}
              >
                {editingId ? "Edit Success Story" : "Add New Success Story"}
              </legend>

              {/* Institute must be picked first — the candidate lookup needs it */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                <DropdownComponent
                  label="Institute"
                  name="instituteID"
                  options={formatOptions(dropdownOptions.institutes)}
                  value={formData.instituteID}
                  onChange={handleInstituteChange}
                  error={errors.instituteID}
                  required={true}
                  loading={loading.institutes}
                />
              </div>

              {/* Profile ID Question */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Do you have Profile ID of Candidate{" "}
                  <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="isProfile"
                      value="1"
                      checked={formData.isProfile === "1"}
                      onChange={(e) => handleRadioChange(e.target.value)}
                    />
                    Yes
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="isProfile"
                      value="0"
                      checked={formData.isProfile === "0"}
                      onChange={(e) => handleRadioChange(e.target.value)}
                    />
                    No
                  </label>
                </div>
                {errors.isProfile && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.isProfile}
                  </p>
                )}
              </div>

              {formData.isProfile && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  {/* Profile No path */}
                  {formData.isProfile === "1" && (
                    <div className="md:col-span-2 flex gap-2 items-end">
                      <div className="flex-1">
                        <FormComponent
                          label="Profile ID of Candidate"
                          value={formData.candidateProfileID}
                          onChange={(value) =>
                            handleChange("candidateProfileID", value)
                          }
                          error={errors.candidateProfileID}
                          required={true}
                          maxLength={15}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleProfileNoLookup}
                        className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded text-sm h-10 disabled:opacity-60 mb-2"
                        disabled={loading.profileLookup}
                      >
                        {loading.profileLookup
                          ? "Fetching..."
                          : "Fetch Details"}
                      </button>
                    </div>
                  )}

                  {/* Manual name entry path */}
                  {formData.isProfile === "0" && (
                    <>
                      <FormComponent
                        label="First Name"
                        value={formData.firstName}
                        onChange={(value) => handleChange("firstName", value)}
                        error={errors.firstName}
                        required={true}
                        maxLength={50}
                      />
                      <FormComponent
                        label="Middle Name"
                        value={formData.middleName}
                        onChange={(value) => handleChange("middleName", value)}
                        maxLength={50}
                      />
                      <FormComponent
                        label="Last Name"
                        value={formData.lastName}
                        onChange={(value) => handleChange("lastName", value)}
                        maxLength={50}
                      />
                    </>
                  )}

                  {/* Read-only preview once candidate is resolved via Profile No */}
                  {formData.isProfile === "1" && formData.firstName && (
                    <div className="md:col-span-3 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded p-3">
                      Candidate:{" "}
                      <strong>
                        {formData.firstName} {formData.middleName}{" "}
                        {formData.lastName}
                      </strong>
                      {formData.candidateMobileNo && (
                        <> · Mobile: {formData.candidateMobileNo}</>
                      )}
                    </div>
                  )}

                  {/* Course */}
                  <DropdownComponent
                    label="Course"
                    name="courseID"
                    options={formatCourseOptions(dropdownOptions.coursesForm)}
                    value={formData.courseID}
                    onChange={handleCourseChange}
                    error={errors.courseID}
                    required={true}
                    loading={loading.coursesForm}
                  />

                  <DropdownComponent
                    label="Passing Year"
                    name="passingYearID"
                    options={dropdownOptions.passingYears.map((y) => ({
                      value: (y.YearId ?? y.Value)?.toString(),
                      label: y.YearDisplayName ?? y.Text,
                    }))}
                    value={formData.passingYearID}
                    onChange={(value) => handleChange("passingYearID", value)}
                    error={errors.passingYearID}
                    required={true}
                    loading={loading.passingYears}
                    // Auto-filled from candidate lookup when unambiguous — still editable
                  />

                  <DropdownComponent
                    label="Selection Year"
                    name="selectionYearID"
                    options={formatOptions(dropdownOptions.selectionYears)}
                    value={formData.selectionYearID}
                    onChange={(value) => handleChange("selectionYearID", value)}
                    error={errors.selectionYearID}
                    required={true}
                  />

                  <FormComponent
                    label="Present Designation"
                    value={formData.presentDesignation}
                    onChange={(value) =>
                      handleChange("presentDesignation", value)
                    }
                    error={errors.presentDesignation}
                    required={true}
                    maxLength={50}
                  />

                  <FormComponent
                    label="Present Organization"
                    value={formData.presentOrganization}
                    onChange={(value) =>
                      handleChange("presentOrganization", value)
                    }
                    error={errors.presentOrganization}
                    required={true}
                    maxLength={100}
                  />

                  <FormComponent
                    label="Candidate Mobile No"
                    value={formData.candidateMobileNo}
                    onChange={(value) =>
                      handleChange("candidateMobileNo", value)
                    }
                    type="tel"
                    maxLength={10}
                  />

                  {/* Uploads */}
                  <div>
                    <UploadPdf
                      file={formData.photoFileName || ""}
                      onFileChange={handlePhotoChange}
                      buttonClassName="bg-[#00c3f9]"
                      buttonText="Upload Photo"
                      label="Candidate Photo"
                      showLabel={true}
                      allowedFileTypes="jpg, jpeg"
                      maxFileSize="1 MB"
                      required={true}
                      userTypeId={userTypeID}
                      userLoginID={userLoginID}
                      linkName="View Photo"
                      uniquefilepath={formData.photoPath || ""}
                      id="photoUpload"
                    />
                    {errors.photoPath && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.photoPath}
                      </p>
                    )}
                  </div>

                  <div>
                    <UploadPdf
                      file={formData.documentFileName || ""}
                      onFileChange={handleDocumentChange}
                      buttonClassName="bg-[#00c3f9]"
                      buttonText="Upload Document"
                      label="Document Proof"
                      showLabel={true}
                      allowedFileTypes="jpg, jpeg, pdf"
                      maxFileSize="1 MB"
                      userTypeId={userTypeID}
                      userLoginID={userLoginID}
                      linkName="View Document"
                      uniquefilepath={formData.documentPath || ""}
                      id="documentUpload"
                    />
                  </div>
                </div>
              )}

              {/* Form Action Buttons */}
              <div className="flex justify-center gap-4 mt-8 pt-6 border-t-2 border-blue-300">
                <button
                  type="button"
                  onClick={() => saveStory(false)}
                  className="bg-[#28a745] hover:bg-[#218838] text-white px-6 py-2 rounded font-semibold text-sm transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : "Save and Close"}
                </button>
                <button
                  type="button"
                  onClick={() => saveStory(true)}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-semibold text-sm transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? "Publishing..." : "Save and Publish"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="px-8 py-2 bg-gray-600 text-white font-semibold rounded text-sm hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </fieldset>
          )}
        </div>
      </fieldset>
    </div>
  );
};

export default SuccessStoriesPublish;
