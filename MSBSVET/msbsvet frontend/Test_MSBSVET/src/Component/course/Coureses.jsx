import { useState, useEffect, useContext } from "react";
import { ThemeContext } from "../../Component/Context/ThemeContext";
import { Search, FileText } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import DropdownComponent from "../formcomponent/DropdownComponent";
import { baseURL } from "../../Endpoints_All/config/baseConfig";
import pdflogo from "../../assets/pdf.png";
import agent from "../../lib/api/agent";
import FilteredTableComponent from "../formcomponent/FilteredTableComponent";

const CourseSearch = () => {
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { color } = useContext(ThemeContext);

  const [sectors, setSectors] = useState([]);
  const [courseCategories, setCourseCategories] = useState([]);
  const [courses, setCourses] = useState([]);
  const [courseList, setCourseList] = useState([]);
  const navigate = useNavigate();

  // Selected values
  const [selectedSector, setSelectedSector] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");

  // Selected labels (for display in the table)
  const [selectedSectorName, setSelectedSectorName] = useState("");
  const [selectedCategoryName, setSelectedCategoryName] = useState("");

  // Loading states
  const [loadingSectors, setLoadingSectors] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingResults, setLoadingResults] = useState(false);

  // Track if initial query param processing is done
  const [initialParamProcessed, setInitialParamProcessed] = useState(false);

  // Base API URL
  const BASE_API_URL = baseURL;

  // Define columns for FilteredTableComponent with i18n
  const tableColumns = [
    {
      key: "sector",
      header: t("courseSearch.table.sector"),
      width: "200px",
      sortable: true,
    },
    {
      key: "category",
      header: t("courseSearch.table.courseCategory"),
      width: "200px",
      sortable: true,
    },
    {
      key: "name",
      header: t("courseSearch.table.courseName"),
      width: "300px",
      sortable: true,
    },
    {
      key: "duration",
      header: t("courseSearch.table.duration"),
      width: "100px",
      sortable: true,
    },
    {
      key: "modelCurriculum",
      header: t("courseSearch.table.modelCurriculum"),
      width: "120px",
      sortable: false,
    },
    {
      key: "qualificationPack",
      header: t("courseSearch.table.qualificationPack"),
      width: "120px",
      sortable: false,
    },
  ];

  // Filter columns that should have column-specific filters
  const filterableColumns = ["sector", "category", "duration"];

  // Parse plain text from HTML
  const extractTextFromHtml = (htmlString) => {
    if (!htmlString) return "";
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlString;
    const text = tempDiv.textContent || tempDiv.innerText || "";
    return text.trim();
  };

  const handleCourseCodeClick = (courseId, courseCode) => {
    if (!courseId) {
      return;
    }

    const popupWidth = 1000;
    const popupHeight = 700;
    const left = window.screenX + (window.outerWidth - popupWidth) / 2;
    const top = window.screenY + (window.outerHeight - popupHeight) / 2;

    window.open(
      `${window.location.origin}/react/CourseSummary?P1=${courseId}`,
      "CourseSummary",
      `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes`,
    );
  };

  // Split into name and code if matches "NAME (CODE)"
  const parseCourseFromHtml = (htmlString) => {
    const courseText = extractTextFromHtml(htmlString);
    const match = courseText.match(/^(.+?)\s*\(([^)]+)\)$/);
    if (match) {
      return { name: match[1].trim(), code: match[2].trim() };
    }
    return { name: courseText, code: "" };
  };

  const handlePdfView = (pdfUrl, title = "PDF Viewer") => {
    if (!pdfUrl) return;

    const popupWidth = 1000;
    const popupHeight = 700;

    const left = (window.screen.width - popupWidth) / 2;
    const top = (window.screen.height - popupHeight) / 2;

    const popup = window.open(
      pdfUrl,
      title,
      `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no,status=no`,
    );

    if (popup) {
      popup.focus();
    }
  };

  // Custom cell renderer for the table
  const customCellRenderer = (item, column, rowIndex) => {
    // Course Name column - make it clickable to navigate
    if (column.key === "name") {
      return (
        <span
          onClick={() => handleCourseCodeClick(item.id)}
          className="text-blue-600 cursor-pointer hover:underline"
        >
          {item.name}
          {item.code && ` (${item.code})`}
        </span>
      );
    }

    // Model Curriculum column - show PDF icon
    if (column.key === "modelCurriculum") {
      return item.modelCurriculum ? (
        <div className="flex justify-center items-center">
          <button
            onClick={() =>
              handlePdfView(
                item.modelCurriculum,
                t("courseSearch.buttons.downloadPdf"),
              )
            }
            className="transition-transform hover:scale-110 focus:outline-none"
            title={t("courseSearch.buttons.downloadPdf")}
          >
            <img src={pdflogo} alt="PDF" className="w-12 h-8 object-contain" />
          </button>
        </div>
      ) : (
        <div className="text-center text-gray-400">-</div>
      );
    }

    // Qualification Pack column - show PDF icon
    if (column.key === "qualificationPack") {
      return item.qualificationPack ? (
        <div className="flex justify-center items-center">
          <button
            onClick={() =>
              handlePdfView(
                item.qualificationPack,
                t("courseSearch.buttons.downloadQualificationPack"),
              )
            }
            className="transition-transform hover:scale-110 focus:outline-none"
            title={t("courseSearch.buttons.downloadQualificationPack")}
          >
            <img src={pdflogo} alt="PDF" className="w-12 h-8 object-contain" />
          </button>
        </div>
      ) : (
        <div className="text-center text-gray-400">-</div>
      );
    }

    // Default rendering
    const value = item[column.key];
    return value !== undefined && value !== null ? value : "N/A";
  };

  // Language switcher component
  const LanguageSwitcher = () => {
    const changeLanguage = (lng) => {
      i18n.changeLanguage(lng);
      localStorage.setItem("preferredLanguage", lng);
    };
  };

  // Fetch sectors on component mount
  useEffect(() => {
    fetchSectors();

    // Load saved language preference
    const savedLang = localStorage.getItem("preferredLanguage");
    if (savedLang && (savedLang === "en" || savedLang === "mr")) {
      i18n.changeLanguage(savedLang);
    }
  }, []);

  // Handle URL query parameters
  useEffect(() => {
    const sectorIdFromUrl = searchParams.get("P1");

    if (sectorIdFromUrl && sectors.length > 0 && !initialParamProcessed) {
      const matchingSector = sectors.find(
        (sector) => sector.value === sectorIdFromUrl,
      );

      if (matchingSector) {
        setSelectedSector(sectorIdFromUrl);
        setSelectedSectorName(matchingSector.label);
        setInitialParamProcessed(true);

        setTimeout(() => {
          handleAutoSearch(sectorIdFromUrl, matchingSector.label);
        }, 100);
      } else {
        setInitialParamProcessed(true);
      }
    } else if (!sectorIdFromUrl) {
      setInitialParamProcessed(true);
    }
  }, [searchParams, sectors, initialParamProcessed]);

  // Fetch course categories when sector is selected
  useEffect(() => {
    if (selectedSector && initialParamProcessed) {
      fetchCourseCategories();
      if (selectedCategory || selectedCourse) {
        setSelectedCategory("");
        setSelectedCategoryName("");
        setSelectedCourse("");
        setCourses([]);
      }
    } else if (!selectedSector && initialParamProcessed) {
      setCourseCategories([]);
      setCourses([]);
      setSelectedSectorName("");
    }
  }, [selectedSector, initialParamProcessed]);

  // Fetch courses when category is selected
  useEffect(() => {
    if (selectedCategory && initialParamProcessed) {
      fetchCourses();
      setSelectedCourse("");
    } else if (!selectedCategory && initialParamProcessed) {
      setCourses([]);
      setSelectedCategoryName("");
    }
  }, [selectedCategory, initialParamProcessed]);

  const fetchSectors = async () => {
    try {
      setLoadingSectors(true);
      const response = await agent.get(
        `${BASE_API_URL}/Base/GetMasterTableList?TableName=Master_Sector&DataValueField=Sector&DataTextField=SectorID&HasSelect=true`,
      );

      const formattedData = (response.data?.Data ?? [])
        .filter((sector) => sector.Value !== "Select" && sector.Text !== "-1")
        .map((sector) => ({
          value: sector.Text,
          label: sector.Value,
        }))
        .sort((a, b) => a.label.localeCompare(b.label));

      setSectors(formattedData);
    } catch (error) {
      setSectors([]);
    } finally {
      setLoadingSectors(false);
    }
  };

  const fetchCourseCategories = async () => {
    if (!selectedSector) return;

    try {
      setLoadingCategories(true);
      const response = await agent.get(
        `${BASE_API_URL}/Base/GetMasterCourseType`,
        {
          params: { sectorId: selectedSector },
        },
      );

      const formattedData = (response.data?.Data ?? [])
        .filter(
          (category) => category.Text !== "Select" && category.Value !== "-1",
        )
        .map((category) => ({
          value: category.Value,
          label: category.Text,
        }))
        .sort((a, b) => a.label.localeCompare(b.label));

      setCourseCategories(formattedData);
    } catch (error) {
      setCourseCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchCourses = async () => {
    if (!selectedCategory) return;

    try {
      setLoadingCourses(true);
      const response = await agent.get(`${BASE_API_URL}/Base/GetMasterCourse`, {
        params: {
          categoryId: selectedCategory,
          sectorId: selectedSector,
        },
      });

      const formattedData = (response.data?.Data ?? [])
        .filter((course) => course.Text !== "Select" && course.Value !== "-1")
        .map((course) => {
          const fullText = course.Text || "";
          const nameMatch = fullText.match(/(.+?)\s\[(.*?)\]/);
          return {
            value: course.Value,
            label: course.Text,
            name: nameMatch ? nameMatch[1].trim() : fullText,
            code: nameMatch ? nameMatch[2].trim() : "",
          };
        })
        .sort((a, b) => a.label.localeCompare(b.label));

      setCourses(formattedData);
    } catch (error) {
      setCourses([]);
    } finally {
      setLoadingCourses(false);
    }
  };

  const fetchAllCourses = async () => {
    try {
      setLoadingResults(true);

      // Check current URL path
      const isSTT = location.pathname.includes("/coursesSTT");

      // Decide API
      const apiUrl = isSTT
        ? `${BASE_API_URL}/Base/GetCoursesForAdmissionITISTT`
        : `${BASE_API_URL}/Base/GetCourseSearchForAdmission`;

      const response = await agent.get(apiUrl, {
        params: {
          SectorID: -1,
          CourseCategoryID: -1,
          CourseType: -1,
          EntryQualificationID: -1,
          CourseID: -1,
        },
      });

      const formattedCourseList = (response.data?.Data ?? []).map((item) => {
        const parsedCourse = parseCourseFromHtml(item.Course);

        return {
          id: item.CourseID,
          name: parsedCourse.name,
          code: parsedCourse.code,
          sector: item.Sector || "",
          category: item.CourseCategory || "",
          duration: item.Duration || "",
          modelCurriculum: item.ModelCurriculum || "",
          qualificationPack: item.QualificationPack || "",
        };
      });

      setCourseList(formattedCourseList);
    } catch (error) {
      setCourseList([]);
    } finally {
      setLoadingResults(false);
    }
  };

  // Auto search for URL parameter
  const handleAutoSearch = async (sectorId, sectorName) => {
    try {
      setLoadingResults(true);

      const params = {
        SectorID: sectorId,
        CourseCategoryID: -1,
        CourseType: -1,
        EntryQualificationID: -1,
        CourseID: -1,
      };

      const response = await agent.get(
        `${BASE_API_URL}/Base/GetCourseSearchForAdmission`,
        {
          params,
        },
      );

      const formattedCourseList = (response.data?.Data ?? []).map((item) => {
        const parsedCourse = parseCourseFromHtml(item.Course);
        return {
          id: item.CourseID,
          name: parsedCourse.name,
          code: parsedCourse.code,
          sector: item.Sector || sectorName || "",
          category: item.CourseCategory || "",
          duration: item.Duration || "",
          modelCurriculum: item.ModelCurriculum || "",
          qualificationPack: item.QualificationPack || "",
        };
      });

      setCourseList(formattedCourseList);
    } catch (error) {
      setCourseList([]);
    } finally {
      setLoadingResults(false);
    }
  };

  const handleSearch = async () => {
    if (!selectedSector && !selectedCategory && !selectedCourse) {
      fetchAllCourses();
      return;
    }

    try {
      setLoadingResults(true);

      const params = {
        SectorID: selectedSector || -1,
        CourseCategoryID: selectedCategory || -1,
        CourseType: selectedCourse || -1,
        EntryQualificationID: -1,
        CourseID: -1,
      };

      const response = await agent.get(
        `${BASE_API_URL}/Base/GetCourseSearchForAdmission`,
        {
          params,
        },
      );

      const formattedCourseList = (response.data?.Data ?? []).map((item) => {
        const parsedCourse = parseCourseFromHtml(item.Course);
        return {
          id: item.CourseID,
          name: parsedCourse.name,
          code: parsedCourse.code,
          sector: item.Sector || selectedSectorName || "",
          category: item.CourseCategory || selectedCategoryName || "",
          duration: item.Duration || "",
          modelCurriculum: item.ModelCurriculum || "",
          qualificationPack: item.QualificationPack || "",
        };
      });

      setCourseList(formattedCourseList);
    } catch (error) {
      setCourseList([]);
    } finally {
      setLoadingResults(false);
    }
  };

  const handleReset = () => {
    setSelectedSector("");
    setSelectedSectorName("");
    setSelectedCategory("");
    setSelectedCategoryName("");
    setSelectedCourse("");
    setCourseList([]);
    setCourseCategories([]);
    setCourses([]);

    setSearchParams({});
    setInitialParamProcessed(true);
  };

  const handleSectorChange = (value) => {
    setSelectedSector(value);

    const selectedSectorObj = sectors.find((sector) => sector.value === value);
    setSelectedSectorName(selectedSectorObj ? selectedSectorObj.label : "");

    setSelectedCategory("");
    setSelectedCategoryName("");
    setSelectedCourse("");
    setCourseCategories([]);
    setCourses([]);

    if (value) {
      setSearchParams({ P1: value });
    } else {
      setSearchParams({});
    }
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);

    const selectedCategoryObj = courseCategories.find(
      (category) => category.value === value,
    );
    setSelectedCategoryName(
      selectedCategoryObj ? selectedCategoryObj.label : "",
    );

    setSelectedCourse("");
    setCourses([]);
  };

  return (
    <div className="space-y-6 p-4">
      <LanguageSwitcher />

      <fieldset className="rounded border border-gray-300 p-4">
        <legend
          className={`rounded border border-gray-300 ${color} px-4 py-1 text-xl font-bold text-white`}
        >
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            {t("courseSearch.title")}
          </div>
        </legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <DropdownComponent
              label={t("courseSearch.filters.sector")}
              options={sectors}
              value={selectedSector}
              onChange={handleSectorChange}
              loading={loadingSectors}
              required={false}
            />
          </div>
          <div>
            <DropdownComponent
              label={t("courseSearch.filters.courseCategory")}
              options={courseCategories}
              value={selectedCategory}
              onChange={handleCategoryChange}
              loading={loadingCategories}
              disabled={!selectedSector}
              required={false}
            />
          </div>
          <div>
            <DropdownComponent
              label={t("courseSearch.filters.courseAndCode")}
              options={courses}
              value={selectedCourse}
              onChange={setSelectedCourse}
              loading={loadingCourses}
              disabled={!selectedCategory}
              required={false}
            />
          </div>
        </div>
        <div className="mt-4 flex flex-col justify-center gap-4 sm:flex-row">
          <button
            className="bg-green-600 text-white px-6 py-2 font-bold rounded-md hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSearch}
            disabled={loadingResults}
          >
            {loadingResults
              ? t("courseSearch.searching")
              : t("courseSearch.searchCourse")}
          </button>
          <button
            className="bg-red-600 text-white px-6 py-2 rounded-md font-bold hover:bg-red-700 transition-colors"
            onClick={handleReset}
          >
            {t("courseSearch.reset")}
          </button>
        </div>
      </fieldset>

      <fieldset className="rounded border border-gray-300 p-4">
        <legend
          className={`rounded border border-gray-300 ${color} px-4 py-1 text-xl font-bold text-white`}
        >
          {t("courseSearch.courseList")}{" "}
          {courseList.length > 0 &&
            `(${courseList.length} ${t("courseSearch.coursesFound")})`}
        </legend>

        <FilteredTableComponent
          data={courseList}
          columns={tableColumns}
          loading={loadingResults}
          filterColumns={filterableColumns}
          searchable={true}
          sortable={true}
          exportable={true}
          showExport={true}
          showExcel={true}
          showPDF={true}
          exportFileName="course_search_results"
          title={t("courseSearch.courseList")}
          renderCell={customCellRenderer}
          maxHeight="500px"
          stickyHeader={true}
          emptyStateMessage={t("courseSearch.noCoursesFound")}
          emptyStateSubMessage={t("courseSearch.adjustCriteria")}
        />
      </fieldset>
    </div>
  );
};

export default CourseSearch;
