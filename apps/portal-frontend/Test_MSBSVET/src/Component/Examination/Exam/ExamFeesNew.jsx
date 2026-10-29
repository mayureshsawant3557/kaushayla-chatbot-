
import React, { useState, useContext, useEffect } from "react";
import { ThemeContext } from "../../Context/ThemeContext";
import { FaBars } from "react-icons/fa";
import agent from "../../../lib/api/agent";
import { useNavigate } from "react-router-dom";
import {
  GetCourseTypeAPI,
  GetExamTypeAPI,
  GetAllExamFeesAPI,
  GetExamFeesByIDAPI,
  SaveExamFeesAPI,
  GetInstituteIDByInstituteCodeAPI,
  GetBatchesForExamFeesAPI,
  GetCurrentAdmissionYearAPI,
} from "../../../Endpoints_All/Administration/admin";
import FilteredTableComponent from "../../formcomponent/FilteredTableComponent";
import { getDeviceIP } from "../../../utils/CommonHelper";
import { FiEdit } from "react-icons/fi";
import DropdownComponent from "../../formcomponent/DropdownComponent";
import { SwalHelper } from "../../../utils/swalHelper";
import FormComponent from "../../formcomponent/FormComponent";
import { useAuth } from "../../../Hooks/AuthContext";


/* ─────────────────────────────────────────────────────────── */
/*  BatchView — shown to UserTypeID === 61 (Institute users)  */
/* ─────────────────────────────────────────────────────────── */
const BatchView = ({ color }) => {
  const [batchData, setBatchData]         = useState([]);
  const [loading, setLoading]             = useState(false);
  const [instituteId, setInstituteId]     = useState(null);   // numeric ID (internal)
  const [instituteCode, setInstituteCode] = useState("");     // display code shown to user
  const [currentYear, setCurrentYear]     = useState(null);
  const navigate = useNavigate();
 const {userInfo} = useAuth();
  useEffect(() => { initBatchView(); }, []);


  const initBatchView = async () => {
    setLoading(true);
    try {
     
      const code = userInfo?.InstituteCode || userInfo?.UserLoginID || "";

      if (!code) {
        SwalHelper.error("Error", "Unable to get Institute Code.");
        return;
      }

      // Keep the original code for display
      setInstituteCode(code);

      // STEP 1 — resolve numeric InstituteID
      const instituteRes   = await agent.get(GetInstituteIDByInstituteCodeAPI, {
        params: { InstituteCode: code },
      });
      const fetchedId = instituteRes?.data?.Data;
      setInstituteId(fetchedId);

      if (!fetchedId) {
        SwalHelper.error("Error", "Institute ID not found.");
        return;
      }

      // STEP 2 — current admission year
      const yearRes  = await agent.get(GetCurrentAdmissionYearAPI);
      const yearData = yearRes?.data?.Data?.[0] || null;
      setCurrentYear(yearData);

      // STEP 3 — batch list
      await loadBatches(fetchedId);
    } catch (err) {
      console.error("BatchView init error:", err);
      SwalHelper.error("Error", "Failed to load batches.");
    } finally {
      setLoading(false);
    }
  };

  const loadBatches = async (id) => {
    try {
      const res     = await agent.get(GetBatchesForExamFeesAPI, { params: { instituteId: id } });
      const batches = res?.data?.Data || [];
      setBatchData(batches);
    } catch (err) {
      console.error("loadBatches error:", err);
    }
  };

  /* ── Table column definitions ── */
  const batchColumns = [
    { key: "srNo",           header: "Sr. No.",          width: "70px"  },
    { key: "BatchID",        header: "Batch ID",          width: "160px" },
    { key: "CourseName",     header: "Course Name",       className: "text-left" },
    { key: "ExamType",       header: "Exam Type"          },
    { key: "BatchStartDate", header: "Start Date"         },
    { key: "BatchEndDate",   header: "End Date"           },
    { key: "Admitted",       header: "Admitted"           },
    { key: "Approved",       header: "Approved"           },
    { key: "Examinee",       header: "Examinee"           },
    { key: "BatchStatus",    header: "Status"             },
  ];

  /* ── Cell renderer ── */
  const renderBatchCell = (item, column, index) => {
    switch (column.key) {
      case "srNo":
        return index + 1;

      case "BatchID": {
        const raw   = item.BatchID ?? item.batchId ?? item.batchID ?? "-";
        const match = String(raw).match(/>(.*?)<\/a>/);
        const id    = match ? match[1] : raw;
        return (
          <button
            type="button"
            onClick={() => navigate(`/Exam/details?batchId=${id}`)}
            className="bg-cyan-500 hover:bg-cyan-600 text-black font-medium px-3 py-1.5 rounded text-sm transition-colors"
          >
            {id}
          </button>
        );
      }

      case "CourseName":
        return item.CourseName ?? item.courseName ?? item.Course ?? item.course ?? "-";

      case "ExamType":
        return item.ExamType ?? item.examType ?? item.Exam_Type ?? "-";

      case "BatchStartDate": {
        const v = item.BatchStartDate ?? item.batchStartDate ?? item.StartDate ?? item.startDate;
        return v ? new Date(v).toLocaleDateString("en-GB") : "-";
      }

      case "BatchEndDate": {
        const v = item.BatchEndDate ?? item.batchEndDate ?? item.EndDate ?? item.endDate;
        return v ? new Date(v).toLocaleDateString("en-GB") : "-";
      }

      case "Admitted":
        return item.Admitted ?? item.admitted ?? item.TotalAdmitted ?? "0";

      case "Approved":
        return item.Approved ?? item.approved ?? item.TotalApproved ?? "0";

      case "Examinee":
        return item.Examinee ?? item.examinee ?? item.TotalExaminee ?? "0";

      case "BatchStatus": {
        const status = item.BatchStatus ?? item.batchStatus ?? item.Status ?? item.status ?? "-";
        const colorMap = {
          "Ready for Assessment": "bg-green-100 text-green-700 border border-green-200",
          "Re-Exam":              "bg-orange-100 text-orange-700 border border-orange-200",
          "Completed":            "bg-blue-100 text-blue-700 border border-blue-200",
          "Pending":              "bg-yellow-100 text-yellow-700 border border-yellow-200",
        };
        const cls = colorMap[status] ?? "bg-gray-100 text-gray-600 border border-gray-200";
        return (
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
            {status}
          </span>
        );
      }

      default:
        return item[column.key] ?? "-";
    }
  };

  return (
    <div className="w-full p-4">
      <fieldset className="border border-gray-300 rounded-lg bg-white shadow-sm">

        {/* Legend — NO year here */}
        <legend className={`flex items-center ${color} text-white px-4 py-2 rounded-md ml-4 text-sm font-semibold`}>
          <FaBars className="mr-2" />
          Batch List
        </legend>

        <div className="p-4">

          {/* Info bar — Institute Code (not ID) + Academic Year */}
          {(instituteCode || currentYear) && (
            <div className="flex flex-wrap items-center gap-3 mb-5 p-3 bg-gray-50 border border-gray-200 rounded-lg">

              {/* Institute Code pill */}
              {instituteCode && (
                <div className="flex items-center gap-2 bg-white border border-blue-200 rounded-md px-3 py-1.5 shadow-sm">
                  <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                    Institute Code
                  </span>
                  <span className="text-sm font-bold text-blue-700">{instituteCode}</span>
                </div>
              )}

              {/* Academic Year pill */}
              {currentYear && (
                <div className="flex items-center gap-2 bg-white border border-purple-200 rounded-md px-3 py-1.5 shadow-sm">
                  <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                    Academic Year
                  </span>
                  <span className="text-sm font-bold text-purple-700">
                    {currentYear.YearDisplayName}
                  </span>
                </div>
              )}

              {/* Batch count badge (shown once data loads) */}
              {!loading && batchData.length > 0 && (
                <div className="ml-auto flex items-center gap-2 bg-white border border-gray-200 rounded-md px-3 py-1.5 shadow-sm">
                  <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                    Total Batches
                  </span>
                  <span className="text-sm font-bold text-gray-700">{batchData.length}</span>
                </div>
              )}
            </div>
          )}

          {/* Table / loading / empty state */}
          {loading ? (
            <div className="flex justify-center items-center py-16 gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              <span className="text-gray-500 text-sm">Loading batches…</span>
            </div>
          ) : batchData.length === 0 ? (
            <div className="flex flex-col justify-center items-center py-16 gap-2 text-gray-400">
              <svg className="w-10 h-10 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 17v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v8m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-sm">No batches found for this institute.</p>
            </div>
          ) : (
            <FilteredTableComponent
              data={batchData}
              columns={batchColumns}
              filterColumns={["CourseName", "ExamType", "BatchStatus"]}
              searchable
              sortable
              exportable
              renderCell={renderBatchCell}
              title="Batch List"
              exportFileName="BatchList"
              showSearch
              showExcel
              showPDF
            />
          )}
        </div>
      </fieldset>
    </div>
  );
};


/* ─────────────────────────────────────────────────────── */
/*  ExamFeesView — shown to UserTypeID === 10 (Admin)    */
/* ─────────────────────────────────────────────────────── */
const ExamFeesView = ({ color }) => {
  const [courseTypeList, setCourseTypeList] = useState([]);
  const [examTypeList, setExamTypeList] = useState([]);
  const [gridData, setGridData] = useState([]);
  const [selectedData, setSelectedData] = useState(null);
  const [search, setSearch] = useState("");
  const { userInfo } = useAuth();
 

  const courseTypeOptions = courseTypeList.map((x) => ({ label: x.CourseType,  value: x.CourseTypeID }));
  const examTypeOptions   = examTypeList.map((x)    => ({ label: x.ExamType,   value: x.ExamTypeID   }));

  useEffect(() => {
    
    loadMaster();
    loadGrid();
  }, []);

  const loadMaster = async () => {
    try {
      const [courseRes, examRes] = await Promise.all([
        agent.get(GetCourseTypeAPI),
        agent.get(GetExamTypeAPI),
      ]);
      setCourseTypeList(courseRes?.data?.Data || []);
      setExamTypeList(examRes?.data?.Data || []);
    } catch (err) {
      console.error("[ExamFeesView] loadMaster Error:", err);
    }
  };

  const loadGrid = async () => {
    try {
      const res = await agent.get(GetAllExamFeesAPI);
      setGridData(res?.data?.Data || res?.data || []);
    } catch (err) {
      console.error("[ExamFeesView] loadGrid Error:", err);
    }
  };

  const columns = [
    { key: "srNo",               header: "Sr.No.",             width: "60px"  },
    { key: "CourseType",         header: "Course Type",         className: "text-left" },
    { key: "ExamType",           header: "Exam Type"            },
    { key: "BoardFees",          header: "Board Fees"           },
    { key: "AssessmentFees",     header: "Assessment Fees"      },
    { key: "ExamFees",           header: "Exam Fees"            },
    { key: "ImplementationDate", header: "Implementation Date"  },
    { key: "action",             header: "Edit", sortable: false },
  ];

  const handleEdit = async (id) => {
    try {
      const res  = await agent.get(GetExamFeesByIDAPI + id);
      const data = Array.isArray(res.data) ? res.data[0] : res.data;
      if (data) {
        setSelectedData({
          id:                 data.ID,
          courseTypeID:       data.CourseTypeID,
          examTypeID:         data.ExamTypeID,
          boardFees:          data.BoardFees,
          assessmentFees:     data.AssessmentFees,
          examFees:           data.ExamFees,
          implementationDate: data.ImplementationDate,
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err) {
      console.error("[ExamFeesView] handleEdit Error:", err);
    }
  };

  const handleUpdate = async () => {
    try {
      const { courseTypeID, examTypeID, boardFees, assessmentFees, examFees, implementationDate } = selectedData;

      if (Number(boardFees) + Number(assessmentFees) !== Number(examFees)) {
        SwalHelper.error("Validation", "Board Fees + Assessment Fees must equal Exam Fees.");
        return;
      }

      const ipAddress = await getDeviceIP();

      const formatDate = (date) => {
        const d   = new Date(date);
        const pad = (n) => n.toString().padStart(2, "0");
        return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
      };

      const payload = {
        courseTypeID:       Number(courseTypeID),
        examTypeID:         Number(examTypeID),
        boardFees:          Number(boardFees),
        assessmentFees:     Number(assessmentFees),
        examFees:           Number(examFees),
        implementationDate: formatDate(implementationDate),
        userLoginID:        userInfo?.UserLoginID || "admin",
        ipAddress:          ipAddress || "127.0.0.1",
      };

      const res = await agent.post(SaveExamFeesAPI, payload);
      if (res.data?.message === "Y") {
        SwalHelper.success("Success", "Saved successfully.");
        setSelectedData(null);
        loadGrid();
      } else {
        SwalHelper.error("Error", res.data?.message || "Save failed.");
      }
    } catch (err) {
      console.error("[ExamFeesView] handleUpdate Error:", err);
    }
  };

  const handleCancel = () => {
    setSelectedData(null);
    loadGrid();
  };

  const renderCell = (item, column, index) => {
    if (column.key === "srNo") return index + 1;
    if (column.key === "ImplementationDate") {
      return item.ImplementationDate
        ? new Date(item.ImplementationDate).toLocaleDateString("en-GB")
        : "";
    }
    if (column.key === "action") {
      return (
        <button
          onClick={() => handleEdit(item.ID)}
          className="text-blue-600 hover:text-blue-800 p-1 transition-colors"
          title="Edit"
        >
          <FiEdit size={18} />
        </button>
      );
    }
    return item[column.key];
  };

  return (
    <div className="w-full p-4">
      <fieldset className="border border-gray-300 rounded-lg bg-white shadow-sm">
        <legend className={`flex items-center ${color} text-white px-4 py-2 rounded-md ml-4 text-sm font-semibold`}>
          <FaBars className="mr-2" />
          Exam Fees
        </legend>

        <div className="p-4">
          {selectedData && (
            <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">Edit Exam Fees</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <DropdownComponent
                  label="Course Type"
                  options={courseTypeOptions}
                  value={selectedData.courseTypeID}
                  onChange={(val) => setSelectedData({ ...selectedData, courseTypeID: Number(val) })}
                  required
                />
                <DropdownComponent
                  label="Exam Type"
                  options={examTypeOptions}
                  value={selectedData.examTypeID}
                  onChange={(val) => setSelectedData({ ...selectedData, examTypeID: Number(val) })}
                  required
                />
                <FormComponent
                  label="Implementation Date"
                  type="datetime-local"
                  value={
                    selectedData.implementationDate
                      ? new Date(selectedData.implementationDate).toISOString().slice(0, 16)
                      : ""
                  }
                  onChange={(val) => setSelectedData({ ...selectedData, implementationDate: val })}
                  required
                />
                <FormComponent
                  label="Board Fees"
                  type="number"
                  value={selectedData.boardFees}
                  onChange={(val) => {
                    const board = Number(val);
                    setSelectedData({
                      ...selectedData,
                      boardFees: board,
                      examFees:  board + Number(selectedData.assessmentFees || 0),
                    });
                  }}
                  required
                />
                <FormComponent
                  label="Assessment Fees"
                  type="number"
                  value={selectedData.assessmentFees}
                  onChange={(val) => {
                    const assessment = Number(val);
                    setSelectedData({
                      ...selectedData,
                      assessmentFees: assessment,
                      examFees:       Number(selectedData.boardFees || 0) + assessment,
                    });
                  }}
                  required
                />
                <FormComponent
                  label="Exam Fees (auto)"
                  type="number"
                  value={selectedData.examFees}
                  disabled
                />
              </div>
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleUpdate}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded transition-colors text-sm font-medium"
                >
                  Update
                </button>
                <button
                  onClick={handleCancel}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <FilteredTableComponent
            data={gridData}
            columns={columns}
            filterColumns={["CourseType", "ExamType"]}
            searchable
            sortable
            exportable
            renderCell={renderCell}
            title="Exam Fees List"
            exportFileName="ExamFees"
            showSearch
            showExcel
            showPDF
          />
        </div>
      </fieldset>
    </div>
  );
};


/* ─────────────────────────────────── */
/*  Root — routes by UserTypeID       */
/* ─────────────────────────────────── */
const ExamFees = () => {
  const { color }   = useContext(ThemeContext);
   const {userInfo} = useAuth();
  const userTypeID  = Number(userInfo?.UserTypeID || 0);

  if (userTypeID === 10)  return <ExamFeesView color={color} />;
  if (userTypeID === 61)  return <BatchView    color={color} />;

  return (
    <div className="w-full p-4">
      <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 px-4 py-3 rounded-lg">
        <p className="font-semibold text-sm">Access Denied</p>
        <p className="text-xs mt-1">
          Unknown user type: <strong>{userTypeID || "not found"}</strong>
        </p>
      </div>
    </div>
  );
};

export default ExamFees;