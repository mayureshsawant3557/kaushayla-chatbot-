
// import { useEffect, useState } from "react";
// import agent from "../../../lib/api/agent";
// import { GetExaminationListAPI,EvaluationCenterMappingAllAPI } from "../../../Endpoints_All/Examination/Exam";
// import FilteredTableComponent from "../../formcomponent/FilteredTableComponent";
// import DropdownSelectComponent from "../../formcomponent/DropdownSelectComponent";
// import { SwalHelper } from "../../../utils/swalHelper";
// import { FaFileAlt } from "react-icons/fa";
// import Loader from"../../formcomponent/Loader";

// const ExamCenterMappingStatus = () => {
  
//   const [examTypeList, setExamTypeList]   = useState([]);
//   const [sessionList, setSessionList]     = useState([]);
//   const [examList, setExamList]           = useState([]);
//   const [districtList, setDistrictList]   = useState([]);
//   const [allInstitute, setAllInstitute]   = useState([]);
//   const [instituteList, setInstituteList] = useState([]);

//   const [examType, setExamType]     = useState("");
//   const [examTypeId, setExamTypeId] = useState("");
//   const [session, setSession]       = useState("");
//   const [exam, setExam]             = useState("");
//   const [district, setDistrict]     = useState("");
//   const [institute, setInstitute]   = useState("");

  
//   const [errors, setErrors] = useState({});

  
//   const [tableData, setTableData] = useState([]);
//   const [loading, setLoading]     = useState(false);
//   const [showTable, setShowTable] = useState(false); // ✅ NEW STATE
//   const [stats, setStats]         = useState({
//     institute: 0,
//     examMapped: 0,
//     evalMapped: 0,
//   });

//   useEffect(() => {
//     loadExamType();
//     loadSession();
//     loadDistrict();
//     loadInstitute();
//   }, []);

//   const loadExamType = async () => {
//     const res = await agent.get("/Base/GetExamType");
//     setExamTypeList(
//       (res?.data?.Data || []).map((x) => ({
//         value: x.ExamType,
//         label: x.ExamType,
//         ExamTypeID: x.ExamTypeID,
//       }))
//     );
//   };

//   const loadSession = async () => {
//     const res = await agent.get("/Base/GetAdmissionYear");
//     setSessionList(
//       (res?.data?.Data || []).map((x) => ({
//         value: String(x.YearId),
//         label: x.YearDisplayName,
//       }))
//     );
//   };

//   const loadDistrict = async () => {
//     const res = await agent.get("/Base/GetMasterRegionDistrict");
//     setDistrictList(
//       (res?.data?.Data || []).map((d) => ({
//         value: String(d.Value),
//         label: d.Text,
//       }))
//     );
//   };

//   const loadInstitute = async () => {
//     const res = await agent.get("/Base/GetMasterInstitute");
//     const list = (res?.data?.Data || []).map((d) => ({
//       value: String(d.Value),
//       label: d.Text,
//       Group: String(d.Group),
//     }));
//     setAllInstitute(list);
//     setInstituteList(list);
//   };

//   const loadExaminationBySession = async (sessionId) => {
//     try {
//       const res = await agent.get(GetExaminationListAPI, {
//         params: { YearId: sessionId },
//       });
//       setExamList(
//         (res?.data?.Data || []).map((x) => ({
//           value: String(x.ID),
//           label: x.ExaminationName,
//         }))
//       );
//     } catch {
//       setExamList([]);
//     } finally {
//       setExam("");
//     }
//   };

//   const loadExaminationByInstitute = async (instituteId) => {
//     try {
//       const res = await agent.get("/Base/GetExaminationByInstitute", {
//         params: { InstituteID: instituteId },
//       });
//       setExamList(
//         (res?.data?.Data || []).map((x) => ({
//           value: String(x.ID),
//           label: x.ExaminationName,
//         }))
//       );
//     } catch {
//       setExamList([]);
//     }
//   };

//   const handleExamTypeChange = (value) => {
//     const selected = examTypeList.find((x) => x.value === value);
//     setExamType(value);
//     setExamTypeId(selected?.ExamTypeID || "");
//     setErrors((prev) => ({ ...prev, examType: false }));
//   };

//   const handleSessionChange = (value) => {
//     setSession(value);
//     setExam("");
//     setExamList([]);
//     if (value) {
//       loadExaminationBySession(value);
//     }
//   };

//   const handleExamChange = (value) => {
//     setExam(value);
//     setErrors((prev) => ({ ...prev, exam: false }));
//   };

//   const handleDistrictChange = (value) => {
//     setDistrict(value);
//     setInstitute("");
//     if (!value) {
//       setInstituteList(allInstitute);
//     } else {
//       setInstituteList(
//         allInstitute.filter((x) => x.Group === String(value))
//       );
//     }
//   };

//   const handleInstituteChange = (value) => {
//     setInstitute(value);
//     if (value) {
//       loadExaminationByInstitute(value);
//     } else {
//       if (session) {
//         loadExaminationBySession(session);
//       }
//     }
//   };

//   // ✅ NEW: Reset handler
//   const handleReset = () => {
//     setExamType("");
//     setExamTypeId("");
//     setSession("");
//     setExam("");
//     setDistrict("");
//     setInstitute("");
//     setExamList([]);
//     setInstituteList(allInstitute);
//     setErrors({});
//     setTableData([]);
//     setShowTable(false); // ✅ hide table on reset
//     setStats({
//       institute: 0,
//       examMapped: 0,
//       evalMapped: 0,
//     });
//   };

//   const handleSearch = async () => {
//     const newErrors = {};
//     if (!examType) newErrors.examType = true;
//     if (!exam) newErrors.exam = true;

//     if (Object.keys(newErrors).length > 0) {
//       setErrors(newErrors);
//       const msgs = [];
//       if (newErrors.examType) msgs.push("<li>Please Select Exam Type.</li>");
//       if (newErrors.exam) msgs.push("<li>Please Select Examination.</li>");
//       Swal.fire({
//         icon: "warning",
//         title: "Validation Error",
//         html: `<ul style="text-align:left">${msgs.join("")}</ul>`,
//       });
//       return;
//     }

//     setErrors({});
//     setLoading(true);

//     try {
//       const res = await agent.get(EvaluationCenterMappingAllAPI, {
//         params: {
//           examType: examTypeId || 0,
//           districtId: district || 0,
//           examinationId: exam || 0,
//           instituteId: institute || 0,
//         },
//       });

//       const apiData = res?.data?.Data;
//       const table = apiData?.Table || [];
//       const statsData = apiData?.Table1?.[0] || {};

//       setTableData(Array.isArray(table) ? table : []);
//       setStats({
//         institute: statsData?.ExamCenterInstitute || 0,
//         examMapped: statsData?.ExamCenterPer || 0,
//         evalMapped: statsData?.EvalutionCenterPer || 0,
//       });
//       setShowTable(true); // ✅ show table after successful search
//     } catch (error) {
//        //console.log(error);
//       setTableData([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const tableColumns = [
//     { key: "InstituteDistrict",   header: "District",               width: "9%"  },
//     { key: "InstituteCode",       header: "Institute Code",          width: "10%" },
//     { key: "InstituteName",       header: "Institute Name",          width: "20%" },
//     { key: "Examinee",            header: "Examinee",                width: "8%"  },
//     { key: "EvalutionExam",       header: "Exam",                    width: "8%"  },
//     { key: "ExamCenterCode",      header: "Exam Center Code",        width: "10%" },
//     { key: "ExamCenterName",      header: "Exam Center Name",        width: "12%" },
//     { key: "EvalutionCenterCode", header: "Evaluation Center Code",  width: "11%" },
//     { key: "EvalutionCenterName", header: "Evaluation Center Name",  width: "12%" },
//   ];

//   return (
//     <div className="bg-gray-100 min-h-screen p-6">

//       {/* ✅ Loader — shows as full-screen overlay while Search API is running */}
//       {loading && <Loader />}

//       <div className="bg-[#7b879d] text-white px-5 py-3 rounded-md inline-flex items-center gap-2 font-semibold text-base mb-5 shadow">
//         <span className="text-lg">☰</span>
//         Exam and Evaluation Center Mapping Status
//       </div>

//       {/* ✅ NEW: fieldset + legend wrapping the white card */}
//       <fieldset className="bg-white rounded-lg shadow p-6 border-2 border-gray-300">
//         <legend className="ml-4 px-3 py-1 flex items-center gap-2 bg-white text-gray-700 font-semibold text-sm border-2 border-gray-300 rounded-md shadow-sm">
//           <FaFileAlt className="text-blue-600 text-base" />
//           Filters
//         </legend>

//         {/* Row 1 — 3 columns (unchanged) */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">

//           <DropdownSelectComponent
//             label="Exam Type"
//             required
//             options={examTypeList}
//             value={examType}
//             onChange={handleExamTypeChange}
//             error={errors.examType}
//           />

//           <DropdownSelectComponent
//             label="Admission Session"
//             required
//             options={sessionList}
//             value={session}
//             onChange={handleSessionChange}
//           />

//           <DropdownSelectComponent
//             label="Examination"
//             required
//             options={examList}
//             value={exam}
//             onChange={handleExamChange}
//             error={errors.exam}
//           />

//         </div>

//         <hr className="border-gray-200 mb-5" />

//         {/* ✅ Row 2 — changed to 2 columns */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-end mb-6">

//           <DropdownSelectComponent
//             label="District"
//             options={[{ value: "", label: "All" }, ...districtList]}
//             value={district}
//             onChange={handleDistrictChange}
//           />

//           <DropdownSelectComponent
//             label="Institute"
//             options={[{ value: "", label: "ALL" }, ...instituteList]}
//             value={institute}
//             onChange={handleInstituteChange}
//           />

//         </div>

//         {/* ✅ Search + Reset buttons — centered, Reset is red */}
//         <div className="flex items-center justify-center gap-4 mb-6">
//           <button
//             onClick={handleSearch}
//             disabled={loading}
//             className="bg-green-600 hover:bg-green-700 text-white font-semibold px-10 py-[9px] rounded shadow transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
//           >
//             Search
//           </button>

//           <button
//             onClick={handleReset}
//             className="bg-red-600 hover:bg-red-700 text-white font-semibold px-10 py-[9px] rounded shadow transition-colors"
//           >
//             Reset
//           </button>
//         </div>

//         {/* Stats bar — shown only when table is visible */}
//         {showTable && (
//           <div className="flex flex-wrap justify-between items-center gap-4 mb-5">

//             <div className="text-lg font-medium text-gray-700 flex items-center gap-2">
//               Institute :
//               <span className="bg-yellow-400 text-black font-bold px-4 py-0.5 rounded-full text-base">
//                 {stats.institute}
//               </span>
//             </div>

//             <div className="text-lg font-medium text-gray-700 flex items-center gap-2">
//               Exam Center Mapped Percentage :
//               <span className="bg-blue-600 text-white font-bold px-4 py-0.5 rounded-full text-base">
//                 {stats.examMapped}
//               </span>
//             </div>

//             <div className="text-lg font-medium text-gray-700 flex items-center gap-2">
//               Evaluation Center Mapped Percentage :
//               <span className="bg-cyan-500 text-black font-bold px-4 py-0.5 rounded-full text-base">
//                 {stats.evalMapped}
//               </span>
//             </div>

//           </div>
//         )}

//         {/* ✅ Table shown only after Search */}
//         {showTable && (
//           <FilteredTableComponent
//             data={tableData}
//             columns={tableColumns}
//             title="Exam Center Mapping Status"
//             exportFileName="ExamCenterMappingStatus"
//             tableId="exam-center-mapping-table"
//             maxHeight="450px"
//             emptyStateMessage="No Data Found"
//             emptyStateSubMessage="Please search using the filters above"
//             showSearch={true}
//             searchPosition="right"
//             showExport={true}
//             showExcelTemplate={false}
//             showPDF={true}
//             sortable={true}
//             searchable={true}
//             stickyHeader={true}
//           />
//         )}

//       </fieldset>

//     </div>
//   );
// };


import { useEffect, useState } from "react";
import agent from "../../../lib/api/agent";
import { GetExaminationListAPI,EvaluationCenterMappingAllAPI } from "../../../Endpoints_All/Examination/Exam";
import FilteredTableComponent from "../../formcomponent/FilteredTableComponent";
import DropdownSelectComponent from "../../formcomponent/DropdownSelectComponent";
import { SwalHelper } from "../../../utils/swalHelper";
import { FaFileAlt } from "react-icons/fa"; 
import Loader from"../../formcomponent/Loader";

const ExamCenterMappingStatus = () => {
  
  const [examTypeList, setExamTypeList]   = useState([]);
  const [sessionList, setSessionList]     = useState([]);
  const [examList, setExamList]           = useState([]);
  const [districtList, setDistrictList]   = useState([]);
  const [allInstitute, setAllInstitute]   = useState([]);
  const [instituteList, setInstituteList] = useState([]);

  const [examType, setExamType]     = useState("");
  const [examTypeId, setExamTypeId] = useState("");
  const [session, setSession]       = useState("");
  const [exam, setExam]             = useState("");
  const [district, setDistrict]     = useState("");
  const [institute, setInstitute]   = useState("");

  
  const [errors, setErrors] = useState({});

  
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading]     = useState(false);
  const [showTable, setShowTable] = useState(false); 
  const [stats, setStats]         = useState({
    institute: 0,
    examMapped: 0,
    evalMapped: 0,
  });

  useEffect(() => {
    loadExamType();
    loadSession();
    loadDistrict();
    loadInstitute();
  }, []);

  const loadExamType = async () => {
    const res = await agent.get("/Base/GetExamType");
    setExamTypeList(
      (res?.data?.Data || []).map((x) => ({
        value: x.ExamType,
        label: x.ExamType,
        ExamTypeID: x.ExamTypeID,
      }))
    );
  };

  const loadSession = async () => {
    const res = await agent.get("/Base/GetAdmissionYear");
    setSessionList(
      (res?.data?.Data || []).map((x) => ({
        value: String(x.YearId),
        label: x.YearDisplayName,
      }))
    );
  };

  const loadDistrict = async () => {
    const res = await agent.get("/Base/GetMasterRegionDistrict");
    setDistrictList(
      (res?.data?.Data || []).map((d) => ({
        value: String(d.Value),
        label: d.Text,
      }))
    );
  };

  const loadInstitute = async () => {
    const res = await agent.get("/Base/GetMasterInstitute");
    const list = (res?.data?.Data || []).map((d) => ({
      value: String(d.Value),
      label: d.Text,
      Group: String(d.Group),
    }));
    setAllInstitute(list);
    setInstituteList(list);
  };

  const loadExaminationBySession = async (sessionId) => {
    try {
      const res = await agent.get(GetExaminationListAPI, {
        params: { YearId: sessionId },
      });
      setExamList(
        (res?.data?.Data || []).map((x) => ({
          value: String(x.ID),
          label: x.ExaminationName,
        }))
      );
    } catch {
      setExamList([]);
    } finally {
      setExam("");
    }
  };

  const loadExaminationByInstitute = async (instituteId) => {
    try {
      const res = await agent.get("/Base/GetExaminationByInstitute", {
        params: { InstituteID: instituteId },
      });
      setExamList(
        (res?.data?.Data || []).map((x) => ({
          value: String(x.ID),
          label: x.ExaminationName,
        }))
      );
    } catch {
      setExamList([]);
    }
  };

  const handleExamTypeChange = (value) => {
    const selected = examTypeList.find((x) => x.value === value);
    setExamType(value);
    setExamTypeId(selected?.ExamTypeID || "");
    setErrors((prev) => ({ ...prev, examType: false }));
  };

  const handleSessionChange = (value) => {
    setSession(value);
    setExam("");
    setExamList([]);
    if (value) {
      loadExaminationBySession(value);
    }
  };

  const handleExamChange = (value) => {
    setExam(value);
    setErrors((prev) => ({ ...prev, exam: false }));
  };

  const handleDistrictChange = (value) => {
    setDistrict(value);
    setInstitute("");
    if (!value) {
      setInstituteList(allInstitute);
    } else {
      setInstituteList(
        allInstitute.filter((x) => x.Group === String(value))
      );
    }
  };

  const handleInstituteChange = (value) => {
    setInstitute(value);
    if (value) {
      loadExaminationByInstitute(value);
    } else {
      if (session) {
        loadExaminationBySession(session);
      }
    }
  };

  
  const handleReset = () => {
    setExamType("");
    setExamTypeId("");
    setSession("");
    setExam("");
    setDistrict("");
    setInstitute("");
    setExamList([]);
    setInstituteList(allInstitute);
    setErrors({});
    setTableData([]);
    setShowTable(false); 
    setStats({
      institute: 0,
      examMapped: 0,
      evalMapped: 0,
    });
  };

  const handleSearch = async () => {
    const newErrors = {};
    if (!examType) newErrors.examType = true;
    if (!exam) newErrors.exam = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const msgs = [];
      if (newErrors.examType) msgs.push("<li>Please Select Exam Type.</li>");
      if (newErrors.exam) msgs.push("<li>Please Select Examination.</li>");
      SwalHelper.warning(`<ul style="text-align:left">${msgs.join("")}</ul>`, "Validation Error");
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const res = await agent.get(EvaluationCenterMappingAllAPI, {
        params: {
          examType: examTypeId || 0,
          districtId: district || 0,
          examinationId: exam || 0,
          instituteId: institute || 0,
        },
      });

      const apiData = res?.data?.Data;
      const table = apiData?.Table || [];
      const statsData = apiData?.Table1?.[0] || {};

      setTableData(Array.isArray(table) ? table : []);
      setStats({
        institute: statsData?.ExamCenterInstitute || 0,
        examMapped: statsData?.ExamCenterPer || 0,
        evalMapped: statsData?.EvalutionCenterPer || 0,
      });
      setShowTable(true); 
    } catch (error) {
       //console.log(error);
      setTableData([]);
    } finally {
      setLoading(false);
    }
  };

  const tableColumns = [
    { key: "InstituteDistrict",   header: "District",               width: "9%"  },
    { key: "InstituteCode",       header: "Institute Code",          width: "10%" },
    { key: "InstituteName",       header: "Institute Name",          width: "20%" },
    { key: "Examinee",            header: "Examinee",                width: "8%"  },
    { key: "EvalutionExam",       header: "Exam",                    width: "8%"  },
    { key: "ExamCenterCode",      header: "Exam Center Code",        width: "10%" },
    { key: "ExamCenterName",      header: "Exam Center Name",        width: "12%" },
    { key: "EvalutionCenterCode", header: "Evaluation Center Code",  width: "11%" },
    { key: "EvalutionCenterName", header: "Evaluation Center Name",  width: "12%" },
  ];

  return (
    <div className="bg-gray-100 min-h-screen p-6">

      
      {loading && <Loader />}

      {/* <div className="bg-[#7b879d] text-white px-5 py-3 rounded-md inline-flex items-center gap-2 font-semibold text-base mb-5 shadow">
        <span className="text-lg">☰</span>
        Exam and Evaluation Center Mapping Status
      </div> */}

      
      <fieldset className="bg-white rounded-lg shadow p-5 border border-gray-200">
        <legend className="ml-0 px-4 py-2 flex items-center gap-2 bg-[#1e2a4a] text-white font-semibold text-sm rounded-md shadow">
          <FaFileAlt className="text-white text-base" />
          Exam and Evaluation Center Mapping Status
        </legend>

       
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">

          <DropdownSelectComponent
            label="Exam Type"
            required
            options={examTypeList}
            value={examType}
            onChange={handleExamTypeChange}
            error={errors.examType}
          />

          <DropdownSelectComponent
            label="Admission Session"
            required
            options={sessionList}
            value={session}
            onChange={handleSessionChange}
          />

          <DropdownSelectComponent
            label="Examination"
            required
            options={examList}
            value={exam}
            onChange={handleExamChange}
            error={errors.exam}
          />

        </div>

        <hr className="border-gray-200 mb-5" />

        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-end mb-6">

          <DropdownSelectComponent
            label="District"
            options={[{ value: "", label: "All" }, ...districtList]}
            value={district}
            onChange={handleDistrictChange}
          />

          <DropdownSelectComponent
            label="Institute"
            options={[{ value: "", label: "ALL" }, ...instituteList]}
            value={institute}
            onChange={handleInstituteChange}
          />

        </div>

        
        <div className="flex items-center justify-center gap-4 mb-6">
          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-10 py-[9px] rounded shadow transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            Search
          </button>

          <button
            onClick={handleReset}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-10 py-[9px] rounded shadow transition-colors"
          >
            Reset
          </button>
        </div>

      
        {showTable && (
          <div className="flex flex-wrap justify-between items-center gap-4 mb-5">

            <div className="text-lg font-medium text-gray-700 flex items-center gap-2">
              Institute :
              <span className="bg-yellow-400 text-black font-bold px-4 py-0.5 rounded-full text-base">
                {stats.institute}
              </span>
            </div>

            <div className="text-lg font-medium text-gray-700 flex items-center gap-2">
              Exam Center Mapped Percentage :
              <span className="bg-blue-600 text-white font-bold px-4 py-0.5 rounded-full text-base">
                {stats.examMapped}
              </span>
            </div>

            <div className="text-lg font-medium text-gray-700 flex items-center gap-2">
              Evaluation Center Mapped Percentage :
              <span className="bg-cyan-500 text-black font-bold px-4 py-0.5 rounded-full text-base">
                {stats.evalMapped}
              </span>
            </div>

          </div>
        )}

        
        {showTable && (
          <FilteredTableComponent
            data={tableData}
            columns={tableColumns}
            title="Exam Center Mapping Status"
            exportFileName="ExamCenterMappingStatus"
            tableId="exam-center-mapping-table"
            maxHeight="450px"
            emptyStateMessage="No Data Found"
            emptyStateSubMessage="Please search using the filters above"
            showSearch={true}
            searchPosition="right"
            showExport={true}
            showExcelTemplate={false}
            showPDF={true}
            sortable={true}
            searchable={true}
            stickyHeader={true}
          />
        )}

      </fieldset>

    </div>
  );
};

export default ExamCenterMappingStatus;