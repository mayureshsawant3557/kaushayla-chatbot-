

import React, { useState, useEffect, useContext } from "react";
import { FaFileAlt } from "react-icons/fa";
import agent from "../../../../lib/api/agent";

import DropdownComponent from "../../../../Component/formcomponent/DropdownComponent";
import FilteredTableComponent from "../../../../Component/formcomponent/FilteredTableComponent";
import { SwalHelper } from "../../../../utils/swalHelper";
import Loader from "../../../../Component/formcomponent/Loader";
import { ThemeContext } from "../../../Context/ThemeContext";
import { useNavigate } from "react-router-dom";
import {
  MasterSectorAPI,
  CourseTypeAPI,
  MasterEntryQualificationAPI,
  MasterCourseFilterAPI,  // ✅ FIXED — removed MasterCourseAPI
  CourseSearchAPI,
  MasterCourseAPI,
} from "../../../../Endpoints_All/Administration/admin";

const SearchCourse = () => {
  const { color } = useContext(ThemeContext);

  // ── State ──────────────────────────────────────────────────────────────────
  const [sectors, setSectors]                         = useState([]);
  const [courseCategories, setCourseCategories]       = useState([]);
  const [entryQualifications, setEntryQualifications] = useState([]);
  const [coursesAndCodes, setCoursesAndCodes]         = useState([]);
  const [tableData, setTableData]                     = useState([]);
  const [loading, setLoading]                         = useState(false);
  const [searchDone, setSearchDone]                   = useState(false);

  const [fetchingCategories,     setFetchingCategories]     = useState(false);
  const [fetchingQualifications, setFetchingQualifications] = useState(false);
  const [fetchingCodes,          setFetchingCodes]          = useState(false);
const navigate = useNavigate();
  // ── Modal state for Document preview ──────────────────────────────────────
  const [docModal, setDocModal] = useState({ open: false, title: "", url: "" });

  const [formData, setFormData] = useState({
    SectorID:             "",
    CourseCategoryID:     "",
    CourseType:           "",
    EntryQualificationID: "",
    CourseID:             "",
  });

  // ── Option maps ────────────────────────────────────────────────────────────
  const sectorOptions = sectors.map((s) => ({
    value: String(s.Value),
    label: s.Text,
  }));

  const courseCategoryOptions = courseCategories.map((c) => ({
    value: String(c.CourseTypeID),
    label: c.CourseType,
  }));

  // ── Course Type: HARDCODED (matches legacy LoadMaster) ─────────────────────
  const courseTypeOptions = [
    { value: "PART TIME", label: "PART TIME" },
    { value: "FULL TIME", label: "FULL TIME" },
  ];

  const entryQualificationOptions = entryQualifications.map((q) => ({
    value: String(q.Value),
    label: q.Text,
  }));

  const courseAndCodeOptions = coursesAndCodes
  .filter(c => c.Value !== "-1") // remove "Select"
  .map(c => ({
    value: c.Value,   // no need String()
    label: c.Text,
  }));

  // ── Load ALL master data on mount (matches legacy LoadMaster()) ────────────
  useEffect(() => {

    // 1a. Sectors
    const fetchSectors = async () => {
      try {
        const res  = await agent.get(MasterSectorAPI);
        const data = res?.data?.Data || res?.data || [];
        setSectors(data.filter((s) => s.Value !== "-1"));
      } catch (err) {
        SwalHelper.error("Error", "Failed to load sectors.");
      }
    };

    // 1b. Course Categories — no params (matches legacy GetCourseType())
    const fetchCategories = async () => {
      setFetchingCategories(true);
      try {
        const res  = await agent.get(CourseTypeAPI);
        const data = res?.data?.Data || res?.data || [];
        setCourseCategories(data.filter((c) => String(c.CourseTypeID) !== "-1"));
      } catch (err) {
        SwalHelper.error("Error", "Failed to load course categories.");
      } finally {
        setFetchingCategories(false);
      }
    };

    // 1c. Entry Qualifications — no params (matches legacy GetMasterEntryQualification())
    const fetchQualifications = async () => {
      setFetchingQualifications(true);
      try {
        const res  = await agent.get(MasterEntryQualificationAPI);
        const data = res?.data?.Data || res?.data || [];
        setEntryQualifications(data.filter((q) => q.Value !== "-1"));
      } catch (err) {
        SwalHelper.error("Error", "Failed to load entry qualifications.");
      } finally {
        setFetchingQualifications(false);
      }
    };

    
    const fetchCourses = async () => {
  setFetchingCodes(true);
  try {
    const res = await agent.get( MasterCourseAPI, {
      params: { SectorID: 0, CourseTypeID: 0 }, // ✅ CourseTypeID not CourseCategoryID
    });
    const data = res?.data?.Data || res?.data || [];
    // ✅ filter out the "Select" / "-1" entry
    setCoursesAndCodes(data.filter((c) => c.Value !== "-1"));
  } catch (err) {
    setCoursesAndCodes([]);
  } finally {
    setFetchingCodes(false);
  }
};
   
    Promise.all([
      fetchSectors(),
      fetchCategories(),
      fetchQualifications(),
      fetchCourses(),
    ]);
  }, []); // ← runs once on mount only

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // ── Search Courses ─────────────────────────────────────────────────────────
  // ✅ FIXED: build params conditionally, skip -1 values, handle 404 as empty
  // const handleSearch = async () => {
  //   const params = {};

  //   if (formData.SectorID)
  //     params.SectorID = Number(formData.SectorID);

  //   if (formData.CourseCategoryID)
  //     params.CourseCategoryID = Number(formData.CourseCategoryID);

  //   if (formData.CourseType)
  //     params.CourseType = formData.CourseType;

  //   if (formData.EntryQualificationID && formData.EntryQualificationID !== "-1")
  //     params.EntryQualificationID = Number(formData.EntryQualificationID);

  //   if (formData.CourseID && formData.CourseID !== "-1")
  //     params.CourseID = Number(formData.CourseID);


  //   setLoading(true);
  //   setSearchDone(false);
  //   SwalHelper.loading("Searching...", "Fetching course list.");

  //   try {
  //     const res = await agent.get(CourseSearchAPI, { params });

  //     SwalHelper.close();
  //     const data = res?.data?.Data || res?.data || [];
  //     setTableData(data);
  //     setSearchDone(true);

  //     if (data.length === 0) {
  //       console.warn("⚠️ [5] Search returned 0 results.");
  //       SwalHelper.info("No Records", "No courses found for the selected filters.");
  //     }
  //   } catch (err) {
  //     console.error("❌ [5] Search Courses failed :", err);
  //     SwalHelper.close();

  //     // ✅ FIXED: API returns 404 when no results — treat as empty, NOT as error
  //     const statusCode = err?.response?.data?.StatusCode
  //                     || err?.response?.status
  //                     || err?.status
  //                     || err?.StatusCode;
  //     const message    = err?.response?.data?.Message
  //                     || err?.message
  //                     || "";

  //     if (
  //       statusCode === 404 ||
  //       message?.toLowerCase().includes("no course search results")
  //     ) {
  //       // No results — show empty table with info, not error popup
  //       setTableData([]);
  //       setSearchDone(true);
  //       SwalHelper.info("No Records", "No courses found for the selected filters.");
  //     } else {
  //       SwalHelper.error("Error", "Failed to fetch courses. Please try again.");
  //     }
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSearch = async () => {
  const params = {
    SectorID: formData.SectorID ? Number(formData.SectorID) : -1,
    CourseCategoryID: formData.CourseCategoryID ? Number(formData.CourseCategoryID) : -1,
    CourseType: formData.CourseType ? formData.CourseType : "-1",
    EntryQualificationID:
      formData.EntryQualificationID && formData.EntryQualificationID !== "-1"
        ? Number(formData.EntryQualificationID)
        : -1,
    CourseID:
      formData.CourseID && formData.CourseID !== "-1"
        ? Number(formData.CourseID)
        : -1,
  };


  try {
    const res = await agent.get(CourseSearchAPI, { params });

    const data = res?.data?.Data || [];

    setTableData(data);
    setSearchDone(true);

    if (data.length === 0) {
      SwalHelper.info("No Records", "No courses found.");
    }

  } catch (err) {

    
    if (err?.response?.status === 404) {
      setTableData([]);
      setSearchDone(true);
      SwalHelper.info("No Records", "No courses found.");
    } else {
      SwalHelper.error("Error", "Failed to fetch courses");
    }
  }
};


  const handleClear = () => {
    setFormData({
      SectorID: "", CourseCategoryID: "", CourseType: "",
      EntryQualificationID: "", CourseID: "",
    });
    setTableData([]);
    setSearchDone(false);
    
  };

  
  const tableColumns = [
    { key: "_srNo",              header: "Sr. No.",              width: "60px",  headerClassName: "text-center" },
    { key: "Sector",             header: "Sector",               width: "130px", headerClassName: "text-center" },
    { key: "CourseCategory",     header: "Course Category",      width: "150px", headerClassName: "text-center" },
    { key: "Course",             header: "Course",               width: "220px", headerClassName: "text-center" },
    { key: "Duration",           header: "Duration",             width: "90px",  headerClassName: "text-center" },
    { key: "ModelCurriculum",    header: "Model Curriculum",     width: "120px", headerClassName: "text-center" },
    { key: "QualificationPack",  header: "Qualification Pack",   width: "130px", headerClassName: "text-center" },
    { key: "DisplayonPortal",    header: "Display on Portal",    width: "130px", headerClassName: "text-center" },
    { key: "NewUnitApplication", header: "New Unit Application", width: "140px", headerClassName: "text-center" },
    { key: "NewAdmission",       header: "New Admission",        width: "120px", headerClassName: "text-center" },
  ];


 const getYesNo = (val) => {
  if (!val) return "No";
  const v = val.toString().trim().toUpperCase();
  return v === "Y" || v === "YES" ? "Yes" : "No";
};
const renderCell = (item, column, rowIndex) => {
  if (column.key === "DisplayonPortal") {
  return (
    <select
      className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
      value={item.DisplayonPortal === "Y" ? "Yes" : "No"}
      onChange={(e) => {
        const value = e.target.value === "Yes" ? "Y" : "N";


        // TODO: API call here
      }}
    >
      <option value="Yes">Yes</option>
      <option value="No">No</option>
    </select>
  );
}
if (column.key === "NewUnitApplication") {
  return (
    <select
      className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
      value={item.NewUnitApplication === "Y" ? "Yes" : "No"}
      onChange={(e) => {
        const value = e.target.value === "Yes" ? "Y" : "N";


        // TODO: API call here
      }}
    >
      <option value="Yes">Yes</option>
      <option value="No">No</option>
    </select>
  );
}
if (column.key === "NewAdmission") {
  return (
    <select
      className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
      value={item.NewAdmission === "Y" ? "Yes" : "No"}
      onChange={(e) => {
        const value = e.target.value === "Yes" ? "Y" : "N";


        // TODO: API call here
      }}
    >
      <option value="Yes">Yes</option>
      <option value="No">No</option>
    </select>
  );
  if (column.key === "DisplayonPortal") {
  const selectedValue =
    item.DisplayonPortal === "Y" || item.DisplayonPortal === "Yes"
      ? "Yes"
      : "No";

  return (
    <select
      className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
      value={selectedValue}
      onChange={(e) => {
        const value = e.target.value === "Yes" ? "Y" : "N";


        // TODO: API call
      }}
    >
      <option value="Yes">Yes</option>
      <option value="No">No</option>
    </select>
  );
}
}

  // Sr. No.
  if (column.key === "_srNo") {
    return <span className="block text-center">{rowIndex + 1}.</span>;
  }

  
  if (column.key === "Course") {
    const html = item.Course || "";

    // extract URL
    const urlMatch = html.match(/href\s*=\s*["']([^"']+)["']/i);
    const url = urlMatch ? urlMatch[1] : "#";

    // extract text
    const textMatch = html.match(/>(.*?)<\/a>/i);
    const text = textMatch ? textMatch[1] : html;

    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline block text-left"
      >
        {text}
      </a>
    );
  }

  // Duration — plain text
  if (column.key === "Duration") {
    return <span className="text-left block">{item.Duration ?? "-"}</span>;
  }

  // Model Curriculum — magnifier icon, opens modal iframe
  // if (column.key === "ModelCurriculum") {
  //   return item.ModelCurriculum ? (
  //     <div className="flex justify-center">
  //       <button
  //         type="button"
  //         title="View Model Curriculum"
  //         onClick={() =>
  //           setDocModal({
  //             open: true,
  //             title: `${item.Course ?? ""} - Model Curriculum`,
  //             url: item.ModelCurriculum,
  //           })
  //         }
  //       >
  //         <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-700 hover:text-blue-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
  //           <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
  //         </svg>
  //       </button>
  //     </div>
  //   ) : null;
  // }
  if (column.key === "ModelCurriculum") {
  return item.ModelCurriculum ? (
    <div className="flex justify-center">
      <button
        type="button"
        title="View Model Curriculum"
        onClick={() =>
          setDocModal({
            open: true,
            title: `${item.Course ?? ""} - Model Curriculum`,
            url: item.ModelCurriculum,
          })
        }
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 text-red-600 hover:text-red-800"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M6 2a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6H6zm7 1.5L18.5 9H13V3.5zM8 13h2a2 2 0 010 4H8v-4zm2 1H9v2h1a1 1 0 000-2zm3-1h3v1h-2v1h2v1h-2v2h-1v-5zm4 0h1.5a1.5 1.5 0 010 3H17v2h-1v-5z" />
        </svg>
      </button>
    </div>
  ) : null;
}
if (column.key === "QualificationPack") {
  return item.QualificationPack ? (
    <div className="flex justify-center">
      <button
        type="button"
        title="View Qualification Pack"
        onClick={() =>
          setDocModal({
            open: true,
            title: `${item.Course ?? ""} - Qualification Pack`,
            url: item.QualificationPack,
          })
        }
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 text-red-600 hover:text-red-800"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M6 2a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6H6zm7 1.5L18.5 9H13V3.5zM8 13h2a2 2 0 010 4H8v-4zm2 1H9v2h1a1 1 0 000-2zm3-1h3v1h-2v1h2v1h-2v2h-1v-5zm4 0h1.5a1.5 1.5 0 010 3H17v2h-1v-5z" />
        </svg>
      </button>
    </div>
  ) : null;
}

};
  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="w-full p-4">
      <fieldset className="rounded-lg border border-gray-300 bg-white shadow-lg">

        <legend
          className={`flex ${color} items-center text-base font-semibold text-white border-2 border-gray-300 px-3 py-1.5 rounded-md ml-4`}
        >
          <FaFileAlt className="mr-2 text-white" />
          Search Course
        </legend>

        <div className="px-4 pb-4 pt-3">

          {/* Add New Course button */}
          {/* TODO: replace onClick with → navigate("/your-add-course-route") */}
          <div className="flex justify-center mb-5">
            <button
              type="button"
              className="bg-yellow-400 hover:bg-yellow-500 text-white font-semibold px-6 py-2 rounded"
              onClick={() => {
                 navigate("/MasterMgmt/NewCourse");
              }}
            >
              Add New Course
            </button>
          </div>

          {/* Row 1: Sector | Course Category | Course Type */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <DropdownComponent
              label="Sector"
              options={sectorOptions}
              value={formData.SectorID}
              onChange={(val) => handleChange("SectorID", val)}
              loading={false}
            />
            <DropdownComponent
              label="Course Category"
              options={courseCategoryOptions}
              value={formData.CourseCategoryID}
              onChange={(val) => handleChange("CourseCategoryID", val)}
              loading={fetchingCategories}
            />
            <DropdownComponent
              label="Course Type"
              options={courseTypeOptions}
              value={formData.CourseType}
              onChange={(val) => handleChange("CourseType", val)}
              loading={false}
            />
          </div>

          {/* Row 2: Entry Qualification | Course and Code */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <DropdownComponent
              label="Entry Qualification"
              options={entryQualificationOptions}
              value={formData.EntryQualificationID}
              onChange={(val) => handleChange("EntryQualificationID", val)}
              loading={fetchingQualifications}
            />
            <DropdownComponent
              label="Course and Code"
              options={courseAndCodeOptions}
              value={formData.CourseID}
              onChange={(val) => handleChange("CourseID", val)}
              loading={fetchingCodes}
            />
          </div>

          {/* Search + Clear buttons */}
          <div className="flex justify-center gap-3 mb-6">
            <button
              type="button"
              className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-2 rounded font-semibold disabled:opacity-70"
              onClick={handleSearch}
              disabled={loading}
            >
              {loading ? "Searching..." : "Search"}
            </button>
            <button
              type="button"
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-2 rounded font-semibold"
              onClick={handleClear}
            >
              Clear
            </button>
          </div>

          {/* Results Table */}
          {searchDone && (
            <FilteredTableComponent
              key={tableData.length}
              data={tableData}
              columns={tableColumns}
              renderCell={renderCell}
              title="Course List"
              exportFileName="CourseList"
              tableId="search-course-table"
              maxHeight="450px"
              emptyStateMessage="No courses found"
              emptyStateSubMessage="Try different filters"
              showSearch={true}
              searchPosition="right"
              showExport={true}
              showExcelTemplate={false}
              showPDF={true}
            />
          )}

          {loading && <Loader />}

        </div>
      </fieldset>

      {/* ── Document Preview Modal ── */}
      {docModal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={() => setDocModal({ open: false, title: "", url: "" })}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-[98vw] max-w-7xl flex flex-col"
            style={{ height: "90vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <h6 className="text-sm font-semibold text-gray-800">{docModal.title}</h6>
              <button
                type="button"
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1 rounded"
                onClick={() => setDocModal({ open: false, title: "", url: "" })}
              >
                X
              </button>
            </div>
            <div className="flex-1 overflow-auto p-2">
              <iframe
                src={docModal.url}
                title={docModal.title}
                style={{ width: "100%", height: "100%", border: "none" }}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SearchCourse;