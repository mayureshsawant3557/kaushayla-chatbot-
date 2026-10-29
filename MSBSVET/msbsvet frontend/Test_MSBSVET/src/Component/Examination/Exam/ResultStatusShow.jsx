
import React, { useState, useContext, useEffect, useRef } from "react";
import { ThemeContext } from "../../Context/ThemeContext";
import { FaFileAlt } from "react-icons/fa";
import { SwalHelper } from "../../../utils/swalHelper";
import agent from "../../../lib/api/agent";
import { useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import {
  GetResultStatusAPI,
  GetMasterInstituteForExamCerterAPI,
  GetCourseByCollegeIDAPI,
  GetTimeTableSubjectAPI,
  GetExaminationListAPI,
} from "../../../Endpoints_All/Examination/Exam";
import { Search } from "lucide-react";
import { useAuth } from "../../../Hooks/AuthContext";
import FilteredTableComponent from "../../formcomponent/FilteredTableComponent";

/* ------------------------------------------------------------------ */
/* DropdownComponent - unchanged                                       */
/* ------------------------------------------------------------------ */
const DropdownComponent = ({
  label,
  options = [],
  value,
  onChange,
  error,
  required,
  disabled,
  loading,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  const selectedOption = options.find((o) => String(o.value) === String(value));
  const displayValue = selectedOption ? selectedOption.label : "";

  const filteredOptions = options.filter((o) =>
    o.label?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
    setSearchTerm("");
  };

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen((prev) => !prev);
      if (isOpen) setSearchTerm("");
    }
  };

  return (
    <div className="flex flex-col relative" ref={dropdownRef}>
      <label className="mb-1 text-[13px] font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
        {error && (
          <span className="ml-2 text-xs text-red-500">{label} is required</span>
        )}
      </label>

      <div
        onClick={toggleDropdown}
        className={`w-full px-3 h-[42px] border rounded-md flex justify-between items-center text-[14px]
          ${disabled ? "bg-gray-100 cursor-not-allowed text-gray-400" : "bg-white cursor-pointer"}
          ${error ? "border-red-500" : "border-gray-300"}`}
      >
        <span className={`truncate ${!selectedOption ? "text-gray-400" : "text-gray-700"}`}>
          {loading ? "Loading..." : displayValue || "Select"}
        </span>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 top-full mt-1 overflow-y-auto">
          <div className="sticky top-0 p-2 bg-white border-b border-gray-200 flex items-center">
            <Search className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Search ${label?.toLowerCase() || ""}...`}
              className="w-full p-1 outline-none text-sm"
              autoFocus
            />
          </div>

          {loading ? (
            <div className="p-3 text-center text-gray-500 text-sm">Loading...</div>
          ) : filteredOptions.length > 0 ? (
            <ul>
              {filteredOptions.map((option, idx) => (
                <li
                  key={idx}
                  onClick={() => handleSelect(option.value)}
                  className={`px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer
                    ${String(option.value) === String(value)
                      ? "bg-blue-50 text-blue-600 font-medium"
                      : ""}`}
                >
                  {option.label}
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-3 text-center text-gray-500 text-sm">No results found</div>
          )}
        </div>
      )}
    </div>
  );
};

const SUBJECT_TYPE_OPTIONS = [
  { value: "0", label: "ALL" },
  { value: "1", label: "FORMATIVE" },
  { value: "3", label: "THEORY" },
  { value: "2", label: "PRACTICAL" },
];

const MARKS_STATUS_OPTIONS = [
  { value: "ALL", label: "ALL" },
  { value: "1", label: "Submitted" },
  { value: "2", label: "Pending" },
];

const extractList = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.Table)) return data.Table;
  if (Array.isArray(data.Table1)) return data.Table1;
  return [];
};

/* ------------------------------------------------------------------ */
/* Helpers for mapping the raw API row -> table columns                */
/* ------------------------------------------------------------------ */

// Technical/ID columns the API returns that we don't want shown as
// separate columns in the grid (they're only needed for lookups).
const HIDDEN_KEYS = [
  "CollegeID",
  "CourseID",
  "SubjectTypeID",
  "ExamTypeID",
  "ExaminationID",
  "SubjectID",
  "EvaluationCenterID",
  "ID",
];

// Friendly header overrides for known fields. Anything not listed here
// falls back to an auto "CamelCase -> Title Case" conversion, so this
// keeps working even if the API adds/renames a field.
const HEADER_OVERRIDES = {
  Institute: "Institute",
  BatchID: "Batch ID",
  EvaluationCenter: "Evaluation Center",
  Course: "Course",
  Subject: "Subject",
  SubjectType: "Subject Type",
  ExamDate: "Exam Date",
  Examinee: "Examinee",
  SubmitMarks: "Submit Marks",
  SubmissionDate: "Submission Date",
  Passed: "Passed",
  Failed: "Failed",
  ResultHold: "Result Hold",
};

const toHeaderLabel = (key) =>
  HEADER_OVERRIDES[key] ||
  key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim();

// The API sometimes returns a full <a class="btn ..." href="...">TEXT</a>
// string inside a cell (e.g. BatchID). Parse it out so we can render a
// real, safe link instead of dumping the raw HTML as text.
const parseAnchorHtml = (value) => {
  if (typeof value !== "string" || !value.includes("<a")) return null;
  const match = value.match(/href\s*=\s*"([^"]*)"[^>]*>([^<]*)<\/a>/i);
  if (!match) return null;
  return { href: match[1], text: match[2] };
};

const ResultStatus = () => {
  const { color } = useContext(ThemeContext);
  const userInfo = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
const batchId = searchParams.get("batchId");

  const [examTypeList, setExamTypeList] = useState([]);
  const [examList, setExamList] = useState([]);
  const [instituteList, setInstituteList] = useState([]);
  const [evaluationCenterList, setEvaluationCenterList] = useState([]);
  const [courseList, setCourseList] = useState([]);
  const [subjectList, setSubjectList] = useState([]);
  const [resultData, setResultData] = useState([]);

  const [loading, setLoading] = useState(false);
  const [examLoading, setExamLoading] = useState(false);
  const [subjectLoading, setSubjectLoading] = useState(false);
  const [courseLoading, setCourseLoading] = useState(false);

  // Controls whether the table section is shown at all. We only want
  // it to appear after the user has actually clicked Search.
  const [hasSearched, setHasSearched] = useState(false);

  const [formData, setFormData] = useState({
    examTypeId: "",
    examination: "",
    marksSubmissionStatus: "ALL",
    institute: "ALL",
    evaluationCenter: "ALL",
    course: "All",
    subject: "All",
    subjectType: "0",
  });

  const set = (key) => (val) => setFormData((p) => ({ ...p, [key]: val }));

  useEffect(() => {
    loadExamType();
    loadInstitute();
    loadEvaluationCenter();
  }, []);

  const loadExamType = async () => {
    try {
      const res = await agent.get("/Base/GetExamType");
      setExamTypeList(extractList(res?.data?.Data));
    } catch (err) {
      console.error("ExamType failed:", err);
      setExamTypeList([]);
    }
  };

  const loadInstitute = async () => {
    try {
      const res = await agent.get(GetMasterInstituteForExamCerterAPI);
      setInstituteList(extractList(res?.data?.Data));
    } catch {
      setInstituteList([]);
    }
  };

  const loadEvaluationCenter = async () => {
    try {
      const res = await agent.get(GetMasterInstituteForExamCerterAPI);
      setEvaluationCenterList(extractList(res?.data?.Data));
    } catch {
      setEvaluationCenterList([]);
    }
  };

  const loadExaminationByExamType = async (id) => {
    if (!id) {
      setExamList([]);
      return;
    }
    setExamLoading(true);
    try {
      const res = await agent.get(GetExaminationListAPI, {
        params: { ExamID: id },
      });
      const list = extractList(res?.data?.Data);
      setExamList(list);
    } catch (err) {
      setExamList([]);
    } finally {
      setExamLoading(false);
    }
  };

  const handleExamType = (val) => {
    setFormData((p) => ({
      ...p,
      examTypeId: val,
      examination: "",
      subject: "All",
    }));
    setExamList([]);
    setSubjectList([]);
    loadExaminationByExamType(val);
  };

  const handleExaminationChange = async (val) => {
    setFormData((p) => ({ ...p, examination: val, subject: "All" }));
    if (!val) {
      setSubjectList([]);
      return;
    }
    setSubjectLoading(true);
    try {
      const res = await agent.get(GetTimeTableSubjectAPI, {
        params: { ExaminationID: val },
      });
      setSubjectList(extractList(res?.data?.Data));
    } catch (err) {
      setSubjectList([]);
    } finally {
      setSubjectLoading(false);
    }
  };

  const handleInstituteChange = async (val) => {
    setFormData((p) => ({ ...p, institute: val, course: "All" }));
    setCourseLoading(true);
    try {
      const res = await agent.get(GetCourseByCollegeIDAPI, {
        params: { CollegeID: val === "ALL" ? 0 : val },
      });
      setCourseList(extractList(res?.data?.Data));
    } catch (err) {
      setCourseList([]);
    } finally {
      setCourseLoading(false);
    }
  };

  const handleSearch = async () => {
    const errors = [];
    if (!formData.examTypeId) errors.push("Please Select Exam Type.");
    if (!formData.examination) errors.push("Please Select Examination.");
    if (errors.length > 0) {
      SwalHelper.error("Validation Error", errors.join("<br/>"));
      return;
    }
    setLoading(true);
    setHasSearched(true);
    try {
      const params = {
        userTypeId: 10,
        examTypeId: formData.examTypeId,
        examinationId: formData.examination,
        marksSubmissionStatus:
          formData.marksSubmissionStatus === "ALL" ? 0 : formData.marksSubmissionStatus,
        instituteId: formData.institute === "ALL" ? 0 : formData.institute,
        evaluationCenterId: formData.evaluationCenter === "ALL" ? 0 : formData.evaluationCenter,
        courseId: formData.course === "All" ? 0 : formData.course,
        subjectCode: formData.subject === "All" ? 0 : formData.subject,
        subjectTypeId: formData.subjectType,
        userLoginId: userInfo?.userLoginId,
      };
      const res = await agent.get(GetResultStatusAPI, { params });
      const tableData = extractList(res?.data?.Data);
      setResultData(tableData);
      if (tableData.length === 0) {
        SwalHelper.warning("No Data", "No records found for the selected criteria.");
      }
    } catch (err) {
      SwalHelper.error("Error", "Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      examTypeId: "",
      examination: "",
      marksSubmissionStatus: "ALL",
      institute: "ALL",
      evaluationCenter: "ALL",
      course: "All",
      subject: "All",
      subjectType: "0",
    });
    setExamList([]);
    setSubjectList([]);
    setCourseList([]);
    setResultData([]);
    setHasSearched(false);
  };

  const examTypeOptions = [
    { value: "", label: "Select" },
    ...examTypeList.map((x) => ({
      value: String(x.ExamTypeID),
      label: x.ExamType,
    })),
  ];

  const examOptions = [
    { value: "", label: "Select" },
    ...examList.map((x) => ({
      value: String(x.ExaminationID ?? x.ID ?? x.ExamID ?? ""),
      label: x.ExaminationName
        ? `${x.ExaminationName}${x.YearDisplayName ? ` (${x.YearDisplayName})` : ""}`
        : (x.ExamName ?? ""),
    })),
  ];

  const instituteOptions = [
    { value: "ALL", label: "ALL" },
    ...instituteList.map((x) => ({ value: String(x.Value), label: x.Text })),
  ];

  const evaluationCenterOptions = [
    { value: "ALL", label: "ALL" },
    ...evaluationCenterList.map((x) => ({ value: String(x.Value), label: x.Text })),
  ];

  const courseOptions = [
    { value: "All", label: "All" },
    ...courseList.map((x) => ({ value: String(x.CourseID), label: x.CourseName })),
  ];

  const subjectOptions = [
    { value: "All", label: "All" },
    ...subjectList.map((x) => ({ value: x.SubjectCode, label: x.SubjectCodeName })),
  ];

  /* ---------------------------------------------------------------- */
  /* Build columns dynamically from whatever the API actually returns, */
  /* hide raw ID columns, and give every column a friendly header.     */
  /* ---------------------------------------------------------------- */
  const resultColumns = React.useMemo(() => {
    if (resultData.length === 0) return [];
    return Object.keys(resultData[0])
      .filter((key) => !HIDDEN_KEYS.includes(key))
      .map((key) => ({
        key,
        header: toHeaderLabel(key),
      }));
  }, [resultData]);

  // FilteredTableComponent calls this for every cell. Returning
  // `undefined` tells it to fall back to its own default rendering,
  // so we only need to special-case the anchor/HTML fields (BatchID
  // etc.) coming back from the API.
  // const renderResultCell = (item, column) => {
  //   const value = item[column.key];
  //   const parsed = parseAnchorHtml(value);
  //   if (parsed) {
  //     return (
  //       <a
  //         href={parsed.href}
  //         target="_blank"
  //         rel="noopener noreferrer"
  //         className="inline-block bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold px-2 py-1 rounded"
  //       >
  //         {parsed.text}
  //       </a>
  //     );
  //   }
  //   if (typeof value === "boolean") return value ? "YES" : "NO";
  //   return undefined;
  // };
  // FilteredTableComponent calls this for every cell. Returning
  // `undefined` tells it to fall back to its own default rendering,
  // so we only need to special-case the anchor/HTML fields (BatchID
  // etc.) coming back from the API.
  const renderResultCell = (item, column) => {
    const value = item[column.key];

    // BatchID -> same pattern as renderBatchCell: extract the id from
    // the raw <a>...</a> HTML the API sends, then navigate on click.
    if (column.key === "BatchID") {
      const raw   = item.BatchID ?? item.batchId ?? item.batchID ?? "-";
      const match = String(raw).match(/>(.*?)<\/a>/);
      const id    = match ? match[1] : raw;
      return (
        <button
          type="button"
          onClick={() => navigate(`/Exam/ResultStatusShowDetails?batchId=${id}`)}
          className="bg-cyan-500 hover:bg-cyan-600 text-black font-medium px-3 py-1.5 rounded text-sm transition-colors"
        >
          {id}
        </button>
      );
    }

    const parsed = parseAnchorHtml(value);
    if (parsed) {
      return (
        <a
          href={parsed.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold px-2 py-1 rounded"
        >
          {parsed.text}
        </a>
      );
    }
    if (typeof value === "boolean") return value ? "YES" : "NO";
    return undefined;
  };
  return (
    <div className="w-full p-4">
      <fieldset className="rounded-lg border border-gray-300 bg-white shadow-lg mb-6">
        <legend className={`flex ${color} items-center text-base font-semibold text-white px-3 py-1.5 rounded-md ml-4`}>
          <FaFileAlt className="mr-2" />
          Result Status
        </legend>

        <div className="px-5 pt-4 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
            <DropdownComponent
              label="Exam Type"
              required
              options={examTypeOptions}
              value={formData.examTypeId}
              onChange={handleExamType}
            />
            <DropdownComponent
              label="Examination"
              required
              options={examOptions}
              value={formData.examination}
              onChange={handleExaminationChange}
              loading={examLoading}
            />
          </div>

          <hr className="mb-4" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <DropdownComponent
              label="Marks Submission Status"
              options={MARKS_STATUS_OPTIONS}
              value={formData.marksSubmissionStatus}
              onChange={set("marksSubmissionStatus")}
            />
            <DropdownComponent
              label="Institute"
              options={instituteOptions}
              value={formData.institute}
              onChange={handleInstituteChange}
            />
            <DropdownComponent
              label="Evaluation Center"
              options={evaluationCenterOptions}
              value={formData.evaluationCenter}
              onChange={set("evaluationCenter")}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <DropdownComponent
              label="Course"
              options={courseOptions}
              value={formData.course}
              onChange={set("course")}
              loading={courseLoading}
            />
            <DropdownComponent
              label="Subject"
              options={subjectOptions}
              value={formData.subject}
              onChange={set("subject")}
              loading={subjectLoading}
            />
            <DropdownComponent
              label="Subject Type"
              options={SUBJECT_TYPE_OPTIONS}
              value={formData.subjectType}
              onChange={set("subjectType")}
            />
          </div>

          <div className="flex justify-center gap-3">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white px-10 py-2 rounded transition-colors font-medium"
            >
              {loading ? "Searching..." : "Search"}
            </button>
            <button
              onClick={handleReset}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white px-10 py-2 rounded transition-colors font-medium"
            >
              Reset
            </button>
          </div>
        </div>
      </fieldset>

      {/* Table only appears once the user has clicked Search */}
      {hasSearched && (
        <FilteredTableComponent
          data={resultData}
          columns={[{ key: "sn", header: "Sr. No." }, ...resultColumns]}
          filterColumns={resultColumns.map((col) => col.key)}
          loading={loading}
          searchable={true}
          sortable={true}
          exportable={true}
          showSearch={true}
          showExport={true}
          showPDF={true}
          showExcel={true}
          renderCell={renderResultCell}
          exportFileName="ResultStatus"
          tableTitle="Result Status"
          maxHeight="450px"
          stickyHeader={true}
          emptyStateMessage="No Data Found"
          emptyStateSubMessage="Try changing your search filters."
        />
      )}
    </div>
  );
};

export default ResultStatus;