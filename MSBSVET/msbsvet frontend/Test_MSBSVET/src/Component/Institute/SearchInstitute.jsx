import { useState, useEffect, useContext } from "react";
import { Search } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { ThemeContext } from "../../Component/Context/ThemeContext";
import MockDropdownComponent from "../formcomponent/DropdownComponent";
import {
  GetInstituteDetails,
  SearchInstitutePublic,
  GetCourseDetails,
} from "../../Endpoints_All/Institute/institute";

import { baseURL } from "../../Endpoints_All/config/baseConfig";
import agent from "../../lib/api/agent";
import { GetInstituteIDByInstituteCode } from "../../Endpoints_All/Base/Institute";
import FilteredTableComponent from "../formcomponent/FilteredTableComponent";

// ─── Course Details Modal (by InstituteCode + CourseCode) ───────────────────
const CourseDetailsModal = ({ isOpen, onClose, instituteCode, courseCode }) => {
  const { t } = useTranslation();
  const [courseDetails, setCourseDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchCourseDetails = async () => {
    if (!instituteCode || !courseCode) return;

    try {
      setLoading(true);
      setError(null);
      const instituteResponse = await agent.get(GetInstituteIDByInstituteCode, {
        params: { InstituteCode: instituteCode },
      });

      const instituteJson = instituteResponse.data;

      if (instituteJson?.Status !== "Success" || !instituteJson?.Data) {
        throw new Error(t("instituteSearch.failedToFetchInstituteId"));
      }

      const instituteId = instituteJson.Data;

      const detailsResponse = await agent.get(
        `${GetInstituteDetails}/${instituteId}/${courseCode}`,
      );

      const detailsJson = detailsResponse.data;

      if (detailsJson?.Status === "Success" && detailsJson?.Data) {
        setCourseDetails(detailsJson.Data);
      } else {
        throw new Error(t("instituteSearch.failedToFetchCourseDetails"));
      }
    } catch (err) {
      setError(
        err.response?.data?.Message ||
          err.response?.data?.message ||
          err.message,
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && instituteCode && courseCode) {
      setCourseDetails(null);
      setError(null);
      fetchCourseDetails();
    }
  }, [isOpen, instituteCode, courseCode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="bg-blue-900 text-white px-6 py-4 rounded-t-lg">
          <h2 className="text-xl font-semibold">
            {t("instituteSearch.modals.instituteCourseDetails")}
          </h2>
        </div>
        <div className="p-6">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">
                {t("instituteSearch.modals.loadingCourseDetails")}
              </span>
            </div>
          )}
          {error && (
            <div className="text-red-600 text-center py-4">
              {t("instituteSearch.modals.error")}: {error}
            </div>
          )}
          {courseDetails && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {[
                  [
                    t("instituteSearch.modals.fields.instituteName"),
                    "InstituteName",
                  ],
                  [
                    t("instituteSearch.modals.fields.instituteAddress"),
                    "InstituteAddress",
                  ],
                  [t("instituteSearch.modals.fields.city"), "City"],
                  [t("instituteSearch.modals.fields.pinCode"), "PinCode"],
                  [t("instituteSearch.modals.fields.taluka"), "Taluka"],
                  [t("instituteSearch.modals.fields.district"), "District"],
                  [t("instituteSearch.modals.fields.region"), "Region"],
                  [t("instituteSearch.modals.fields.state"), "State"],
                ].map(([label, key]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700">
                      {label}:
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {courseDetails[key] || "N/A"}
                    </p>
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                {[
                  [t("instituteSearch.modals.fields.phoneNo"), "PhoneNo"],
                  [t("instituteSearch.modals.fields.faxNo"), "FaxNo"],
                  [t("instituteSearch.modals.fields.emailId"), "EmailID"],
                  [t("instituteSearch.modals.fields.webSite"), "WebSite"],
                  [t("instituteSearch.modals.fields.courseName"), "CourseName"],
                  [t("instituteSearch.modals.fields.duration"), "Duration"],
                  [
                    t("instituteSearch.modals.fields.fullTimePartTime"),
                    "FullTimePartTime",
                  ],
                ].map(([label, key]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700">
                      {label}:
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {courseDetails[key] || "N/A"}
                    </p>
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t("instituteSearch.modals.fields.courseCode")}:
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {courseDetails.CourseCode || courseCode}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {t("instituteSearch.buttons.close")}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Course Modal (by CourseID) ─────────────────────────────────────────────
const CourseModal = ({ isOpen, onClose, courseId }) => {
  const { t } = useTranslation();
  const [courseDetails, setCourseDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCourseDetails = async () => {
    if (!courseId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await agent.get(`${GetCourseDetails}/${courseId}`);

      const detailsJson = response.data;

      if (detailsJson?.Status === "Success" && detailsJson?.Data) {
        setCourseDetails(detailsJson.Data);
      } else {
        throw new Error("Failed to fetch course details");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && courseId) {
      setCourseDetails(null);
      setError(null);
      fetchCourseDetails();
    }
  }, [isOpen, courseId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="bg-blue-900 text-white px-6 py-4 rounded-t-lg">
          <h2 className="text-xl font-semibold">
            {t("instituteSearch.modals.courseDetails")}
          </h2>
        </div>
        <div className="p-6">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">
                {t("instituteSearch.modals.loadingCourseDetails")}
              </span>
            </div>
          )}
          {error && (
            <div className="text-red-600 text-center py-4">
              {t("instituteSearch.modals.error")}: {error}
            </div>
          )}
          {courseDetails && (
            <div className="space-y-4">
              {[
                [
                  t("instituteSearch.modals.fields.courseApprovedBy"),
                  "CourseApprovedBy",
                ],
                [t("instituteSearch.modals.fields.sector"), "Sector"],
                [t("instituteSearch.modals.fields.courseType"), "CourseType"],
                [t("instituteSearch.modals.fields.courseCode"), "CourseCode"],
                [t("instituteSearch.modals.fields.course"), "Course"],
                [t("instituteSearch.modals.fields.duration"), "Duration"],
              ].map(([label, key]) => (
                <div className="flex" key={key}>
                  <div className="w-1/3">
                    <label className="block text-sm font-medium text-gray-700">
                      {label} :
                    </label>
                  </div>
                  <div className="w-2/3">
                    <p className="text-sm text-gray-900">
                      {courseDetails[key] || "N/A"}
                    </p>
                  </div>
                </div>
              ))}

              <div className="grid grid-cols-2 gap-8 mt-6">
                <div className="space-y-4">
                  {[
                    [
                      t(
                        "instituteSearch.modals.fields.minimumEntryQualification",
                      ),
                      "MinimumEntryQualification",
                    ],
                    [
                      t("instituteSearch.modals.fields.minimumAge"),
                      "MinimumAge",
                    ],
                    [t("instituteSearch.modals.fields.nsqfLevel"), "NSQFLevel"],
                    [
                      t("instituteSearch.modals.fields.fullTimePartTime"),
                      "FullTimePartTime",
                    ],
                  ].map(([label, key]) => (
                    <div className="flex" key={key}>
                      <div className="w-2/3">
                        <label className="block text-sm font-medium text-gray-700">
                          {label} :
                        </label>
                      </div>
                      <div className="w-1/3">
                        <p className="text-sm text-gray-900">
                          {courseDetails[key] || "N/A"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  {[
                    [
                      t("instituteSearch.modals.fields.mandatoryCriteria"),
                      "MandatoryCriteriaAtEntryQualification",
                    ],
                    [
                      t("instituteSearch.modals.fields.intakePerUnit"),
                      "IntakePerUnit",
                    ],
                    [
                      t("instituteSearch.modals.fields.trainingFeeCategory"),
                      "TrainingFeeCategory",
                    ],
                  ].map(([label, key]) => (
                    <div className="flex" key={key}>
                      <div className="w-2/3">
                        <label className="block text-sm font-medium text-gray-700">
                          {label} :
                        </label>
                      </div>
                      <div className="w-1/3">
                        <p className="text-sm text-gray-900">
                          {courseDetails[key] || "N/A"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors"
          >
            {t("instituteSearch.buttons.close")}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
const InstituteSearchForm = () => {
  const { t, i18n } = useTranslation();
  const [urlSearchParams, setUrlSearchParams] = useSearchParams();
  const { color } = useContext(ThemeContext);

  const [initialParamProcessed, setInitialParamProcessed] = useState(false);
  const [formData, setFormData] = useState({
    regionID: "0",
    districtID: "0",
    talukaID: "0",
    sectorID: "0",
    courseTypeID: "0",
    entryQualificationID: "0",
    courseID: "0",
    instituteID: "0",
    instituteCode: "",
    fullPartTime: "",
  });

  const [dropdownOptions, setDropdownOptions] = useState({
    region: [{ value: "0", label: "All" }],
    district: [{ value: "0", label: "All" }],
    taluka: [{ value: "0", label: "All" }],
    sector: [{ value: "0", label: "All" }],
    courseType: [{ value: "0", label: "All" }],
    entryQualification: [{ value: "0", label: "All" }],
    course: [{ value: "0", label: "All" }],
    institute: [{ value: "0", label: "All" }],
    fullPartTime: [
      { value: "", label: "All" },
      { value: "FULL TIME", label: t("instituteSearch.badges.fullTime") },
      { value: "PART TIME", label: t("instituteSearch.badges.partTime") },
    ],
  });

  const [loading, setLoading] = useState({
    region: false,
    district: false,
    taluka: false,
    sector: false,
    courseType: false,
    entryQualification: false,
    course: false,
    institute: false,
  });

  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [errors, setErrors] = useState({});

  const [instituteModalOpen, setInstituteModalOpen] = useState(false);
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [selectedInstituteCode, setSelectedInstituteCode] = useState("");
  const [selectedCourseCode, setSelectedCourseCode] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  const API_BASE = baseURL;

  // Load saved language preference
  useEffect(() => {
    const savedLang = localStorage.getItem("preferredLanguage");
    if (savedLang && (savedLang === "en" || savedLang === "mr")) {
      i18n.changeLanguage(savedLang);
    }
  }, []);

  // Update fullPartTime options when language changes
  useEffect(() => {
    setDropdownOptions((prev) => ({
      ...prev,
      fullPartTime: [
        { value: "", label: "All" },
        { value: "FULL TIME", label: t("instituteSearch.badges.fullTime") },
        { value: "PART TIME", label: t("instituteSearch.badges.partTime") },
      ],
    }));
  }, [i18n.language]);

  // Define columns for FilteredTableComponent with i18n
  const tableColumns = [
    {
      key: "Region",
      header: t("instituteSearch.table.region"),
      width: "120px",
      sortable: true,
    },
    {
      key: "District",
      header: t("instituteSearch.table.district"),
      width: "120px",
      sortable: true,
    },
    {
      key: "InstituteCode",
      header: t("instituteSearch.table.instituteCode"),
      width: "150px",
      sortable: true,
    },
    {
      key: "InstituteName",
      header: t("instituteSearch.table.instituteName"),
      width: "250px",
      sortable: true,
    },
    {
      key: "CourseCode",
      header: t("instituteSearch.table.courseCode"),
      width: "120px",
      sortable: true,
    },
    {
      key: "Course",
      header: t("instituteSearch.table.course"),
      width: "250px",
      sortable: true,
    },
    {
      key: "FullTimePartTime",
      header: t("instituteSearch.table.fullPartTime"),
      width: "120px",
      sortable: true,
    },
    {
      key: "TotalIntake",
      header: t("instituteSearch.table.totalIntake"),
      width: "100px",
      sortable: true,
    },
  ];

  // Filter columns that should have column-specific filters
  const filterableColumns = ["Region", "District", "FullTimePartTime"];

  const handleInstituteCodeClick = async (instituteCode, courseCode) => {
    if (!instituteCode) return;

    try {
      const response = await agent.get(GetInstituteIDByInstituteCode, {
        params: { InstituteCode: instituteCode },
      });

      const result = response.data;

      if (result?.Status !== "Success" || !result?.Data) {
        alert(t("instituteSearch.invalidInstituteCode"));
        return;
      }

      const instituteId = result.Data;

      const popupWidth = 1000;
      const popupHeight = 700;
      const left = window.screenX + (window.outerWidth - popupWidth) / 2;
      const top = window.screenY + (window.outerHeight - popupHeight) / 2;

      window.open(
        `${window.location.origin}/React/InstituteDetailsPrint?instituteId=${instituteId}&courseCode=0`,
        "InstituteDetailsPrint",
        `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes`,
      );
    } catch (error) {
      alert(t("instituteSearch.failedToFetchInstituteId"));
    }
  };

  const handleCourseCodeClick = (courseId, courseCode) => {
    if (courseId) {
      setSelectedCourseId(courseId);
      setCourseModalOpen(true);
    } else {
    }
  };

  // Custom cell renderer for the table
  const customCellRenderer = (item, column, rowIndex) => {
    // Institute Code column - make it clickable
    if (column.key === "InstituteCode") {
      return (
        <button
          onClick={() =>
            handleInstituteCodeClick(item.InstituteCode, item.CourseCode)
          }
          className="text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
        >
          {item.InstituteCode || "N/A"}
        </button>
      );
    }

    // Course Code column - make it clickable
    if (column.key === "CourseCode") {
      return (
        <button
          onClick={() => handleCourseCodeClick(item.CourseID, item.CourseCode)}
          className="text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
        >
          {item.CourseCode || "N/A"}
        </button>
      );
    }

    // FullTimePartTime column - add badge styling
    if (column.key === "FullTimePartTime") {
      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
            item.FullTimePartTime === "Full Time" ||
            item.FullTimePartTime === "FULL TIME"
              ? "bg-green-100 text-green-800"
              : item.FullTimePartTime === "PART TIME"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-gray-100 text-gray-700"
          }`}
        >
          {item.FullTimePartTime === "Full Time" ||
          item.FullTimePartTime === "FULL TIME"
            ? t("instituteSearch.badges.fullTime")
            : item.FullTimePartTime === "PART TIME"
              ? t("instituteSearch.badges.partTime")
              : item.FullTimePartTime || "N/A"}
        </span>
      );
    }

    // Default rendering
    const value = item[column.key];
    return value !== undefined && value !== null ? value : "N/A";
  };

  const fetchDropdownData = async (endpoint, key) => {
    try {
      setLoading((prev) => ({ ...prev, [key]: true }));
      const response = await fetch(`${API_BASE}/Base/${endpoint}`);
      const json = await response.json();
      const items = Array.isArray(json?.Data) ? json.Data : [];
      const transformedData = [
        { value: "0", label: "All" },
        ...items
          .filter((item) => item.Group !== "-1")
          .map((item) => ({ value: item.Value, label: item.Text })),
      ];
      setDropdownOptions((prev) => ({ ...prev, [key]: transformedData }));
    } catch (error) {
    } finally {
      setLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  const toNumber = (val) => {
    const num = parseInt(val);
    return isNaN(num) ? 0 : num;
  };

  const buildSearchBody = (data) => ({
    RegionID: toNumber(data.regionID),
    DistrictID: toNumber(data.districtID),
    TalukaID: toNumber(data.talukaID),
    SectorID: toNumber(data.sectorID),
    CourseTypeID: toNumber(data.courseTypeID),
    CourseID: toNumber(data.courseID),
    EntryQualificationID: toNumber(data.entryQualificationID),
    FullPartTime: data.fullPartTime || "",
    InstituteCode: data.instituteCode || "",
    InstituteID: toNumber(data.instituteID),
    IsForSTT: 0,
  });

  const handleSearch = async () => {
    try {
      setSearching(true);
      setHasSearched(true);

      const searchBody = buildSearchBody(formData);

      const response = await agent.post(SearchInstitutePublic, searchBody);

      const result = response.data;
      const dataArray = Array.isArray(result?.Data)
        ? result.Data
        : Array.isArray(result)
          ? result
          : result
            ? [result]
            : [];

      setSearchResults(dataArray);
    } catch (error) {
      setSearchResults([]);
      alert(t("instituteSearch.errorOccurred"));
    } finally {
      setSearching(false);
    }
  };

  const handleAutoSearch = async (searchFormData) => {
    try {
      setSearching(true);
      setHasSearched(true);

      const searchBody = buildSearchBody(searchFormData);

      const response = await agent.post(SearchInstitutePublic, searchBody);

      const result = response.data;
      const dataArray = Array.isArray(result?.Data)
        ? result.Data
        : Array.isArray(result)
          ? result
          : result
            ? [result]
            : [];

      setSearchResults(dataArray);
    } catch (error) {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    fetchDropdownData("GetMasterRegion", "region");
    fetchDropdownData("GetMasterDistrict", "district");
    fetchDropdownData("GetMasterTaluka", "taluka");
    fetchDropdownData("GetMasterSector", "sector");
    fetchDropdownData("GetMasterCourseType", "courseType");
    fetchDropdownData("GetMasterEntryQualification", "entryQualification");
    fetchDropdownData("GetMasterCourse", "course");
    fetchDropdownData("GetMasterInstitute", "institute");
  }, []);

  useEffect(() => {
    const regionIdFromUrl = urlSearchParams.get("P1");
    const districtIdFromUrl = urlSearchParams.get("P2");

    if ((regionIdFromUrl || districtIdFromUrl) && !initialParamProcessed) {
      const updatedFormData = { ...formData };
      let shouldAutoSearch = false;

      if (regionIdFromUrl) {
        updatedFormData.regionID = regionIdFromUrl;
        shouldAutoSearch = true;
      }
      if (districtIdFromUrl) {
        updatedFormData.districtID = districtIdFromUrl;
        shouldAutoSearch = true;
      }

      setFormData(updatedFormData);
      setInitialParamProcessed(true);

      if (shouldAutoSearch) {
        setTimeout(() => handleAutoSearch(updatedFormData), 500);
      }
    } else if (!regionIdFromUrl && !districtIdFromUrl) {
      setInitialParamProcessed(true);
    }
  }, [
    urlSearchParams,
    dropdownOptions.region,
    dropdownOptions.district,
    initialParamProcessed,
  ]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (field === "regionID" || field === "districtID") {
      const newParams = new URLSearchParams(urlSearchParams);
      if (field === "regionID") {
        value && value !== "0"
          ? newParams.set("P1", value)
          : newParams.delete("P1");
      }
      if (field === "districtID") {
        value && value !== "0"
          ? newParams.set("P2", value)
          : newParams.delete("P2");
      }
      setUrlSearchParams(newParams);
    }

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: false }));
    }
  };

  const handleReset = () => {
    setFormData({
      regionID: "0",
      districtID: "0",
      talukaID: "0",
      sectorID: "0",
      courseTypeID: "0",
      entryQualificationID: "0",
      courseID: "0",
      instituteID: "0",
      instituteCode: "",
      fullPartTime: "",
    });
    setSearchResults([]);
    setHasSearched(false);
    setErrors({});
    setUrlSearchParams({});
    setInitialParamProcessed(true);
  };

  // Get loading text for dropdowns
  const getLoadingText = (key) => {
    const loadingKeyMap = {
      region: "region",
      district: "district",
      taluka: "taluka",
      sector: "sector",
      courseType: "courseType",
      entryQualification: "entryQualification",
      course: "course",
      institute: "institute",
    };
    return t(`instituteSearch.loading.${loadingKeyMap[key] || key}`);
  };

  return (
    <div className="max-w-full mx-auto p-3 sm:p-6 bg-white-100 min-h-screen">
      {/* ── Institute + Course Details Modal ── */}
      <CourseDetailsModal
        isOpen={instituteModalOpen}
        onClose={() => setInstituteModalOpen(false)}
        instituteCode={selectedInstituteCode}
        courseCode={selectedCourseCode}
      />

      {/* ── Course-only Modal ── */}
      <CourseModal
        isOpen={courseModalOpen}
        onClose={() => setCourseModalOpen(false)}
        courseId={selectedCourseId}
      />

      {/* No records alert */}
      {hasSearched && searchResults.length === 0 && !searching && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4 text-sm">
          {t("instituteSearch.noRecordsFound")}
        </div>
      )}

      {/* ── Search Form ── */}
      <fieldset className="rounded border border-gray-300 p-4 mb-5">
        <legend
          className={`rounded border border-gray-300 ${color} px-4 py-1 text-xl font-bold text-white`}
        >
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            {t("instituteSearch.title")}
          </div>
        </legend>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("instituteSearch.filters.instituteCode")}
            </label>
            <input
              type="text"
              value={formData.instituteCode}
              onChange={(e) => handleChange("instituteCode", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={t("instituteSearch.placeholders.enterInstituteCode")}
            />
          </div>

          {[
            [
              t("instituteSearch.filters.instituteName"),
              "instituteID",
              "institute",
            ],
            [t("instituteSearch.filters.region"), "regionID", "region"],
            [t("instituteSearch.filters.district"), "districtID", "district"],
            [t("instituteSearch.filters.taluka"), "talukaID", "taluka"],
            [t("instituteSearch.filters.sector"), "sectorID", "sector"],
            [
              t("instituteSearch.filters.courseType"),
              "courseTypeID",
              "courseType",
            ],
            [t("instituteSearch.filters.course"), "courseID", "course"],
            [
              t("instituteSearch.filters.entryQualification"),
              "entryQualificationID",
              "entryQualification",
            ],
            [
              t("instituteSearch.filters.fullPartTime"),
              "fullPartTime",
              "fullPartTime",
            ],
          ].map(([label, field, optionKey]) => (
            <div key={field}>
              <MockDropdownComponent
                label={label}
                value={formData[field]}
                onChange={(value) => handleChange(field, value)}
                options={dropdownOptions[optionKey]}
                error={errors[field]}
                loading={loading[optionKey] || false}
                loadingText={getLoadingText(optionKey)}
                className="w-full text-sm"
              />
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-col justify-center gap-4 sm:flex-row">
          <button
            onClick={handleSearch}
            disabled={searching}
            className="w-full font-bold sm:w-auto px-6 py-2 bg-green-600 text-white rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {searching ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                {t("instituteSearch.searching")}
              </>
            ) : (
              t("instituteSearch.buttons.searchInstitute")
            )}
          </button>
          <button
            onClick={handleReset}
            className="w-full font-bold sm:w-auto px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            {t("instituteSearch.buttons.reset")}
          </button>
        </div>
      </fieldset>

      {/* ── Results Table using FilteredTableComponent ── */}
      <fieldset className="rounded border border-gray-300 p-4">
        <legend
          className={`rounded border border-gray-300 ${color} px-4 py-1 text-xl font-bold text-white`}
        >
          {t("instituteSearch.instituteList")}
        </legend>

        <FilteredTableComponent
          data={searchResults}
          columns={tableColumns}
          loading={searching}
          filterColumns={filterableColumns}
          searchable={true}
          sortable={true}
          exportable={true}
          showExport={true}
          showExcel={true}
          showPDF={true}
          exportFileName="institute_search_results"
          title={t("instituteSearch.instituteList")}
          renderCell={customCellRenderer}
          maxHeight="500px"
          stickyHeader={true}
          emptyStateMessage={t("instituteSearch.noRecordsFound")}
          emptyStateSubMessage={t("instituteSearch.adjustCriteria")}
        />
      </fieldset>
    </div>
  );
};

export default InstituteSearchForm;
