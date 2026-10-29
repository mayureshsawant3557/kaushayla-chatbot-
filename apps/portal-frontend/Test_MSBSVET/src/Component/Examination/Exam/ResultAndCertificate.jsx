
import React, { useEffect, useState, useContext, useRef } from "react";
import agent from "../../../lib/api/agent";
import FilteredTableComponent from "../../formcomponent/FilteredTableComponent";
import DropdownComponent from "../../formcomponent/DropdownComponent";
import { ThemeContext } from "../../Context/ThemeContext";
import { FaFileAlt } from "react-icons/fa";
import { SwalHelper } from "../../../utils/swalHelper";

import {
  BulkStatementOfMarksPDFAPI,
  BulkCertificatePDFAPI,
  GenerateCertificatePDFZipAPI,
  GenerateResultPDFZipAPI,
  ResultInstituteWiseAPI,
  Getresultbatchwise,
  GetCourseByCollegeIDAPI,
  GetMasterCourseFilterAPI,
  GetInstituteIDByInstituteCode,
  batchprintresultcertificateAPI,
  GetInstituteListAPI,
  GetMasterCourseAPI,
  getDistrictIDByDistrictUser,   // ✅ imported
} from "../../../Endpoints_All/Examination/Exam";
import { useAuth } from "../../../Hooks/AuthContext";

const ResultAndCertificate = () => {
   const {userInfo} = useAuth();
  const loggedInUserID = userInfo?.UserID      || 0;
  const userLoginID    = userInfo?.UserLoginID || "";  // ✅ e.g. "DVETO02A"
  const typeId         = userInfo?.UserTypeID  || 0;

  const { color } = useContext(ThemeContext);
  const allExamRef = useRef([]);

  // ── State ─────────────────────────────────────────────────────────────────
  const [examTypeList,  setExamTypeList]  = useState([]);
  const [examList,      setExamList]      = useState([]);
  const [sessionList,   setSessionList]   = useState([]);
  const [districtList,  setDistrictList]  = useState([]);
  const [allInstitute,  setAllInstitute]  = useState([]);
  const [instituteList, setInstituteList] = useState([]);
  const [courseList,    setCourseList]    = useState([]);

  // ✅ Store districtId for DVETO — used in search
  const [dvetoDistrictId, setDvetoDistrictId] = useState(0);

  const [examTypeLoading,  setExamTypeLoading]  = useState(false);
  const [examLoading,      setExamLoading]      = useState(false);
  const [sessionLoading,   setSessionLoading]   = useState(false);
  const [districtLoading,  setDistrictLoading]  = useState(false);
  const [instituteLoading, setInstituteLoading] = useState(false);
  const [courseLoading,    setCourseLoading]    = useState(false);
  const [loading,          setLoading]          = useState(false);

  const [tableData,   setTableData]   = useState([]);
  const [tableKey,    setTableKey]    = useState(0);
  const [hasSearched, setHasSearched] = useState(false);

  const [dropdownErrors, setDropdownErrors] = useState({
    examTypeId:  false,
    session:     false,
    examination: false,
  });

  const [formData, setFormData] = useState({
    examType:          "",
    examTypeId:        "",
    session:           "",
    examination:       "",
    examinationYearId: "",
    district:          "",
    institute:         "",
    course:            "",
  });

  // ── Options ───────────────────────────────────────────────────────────────
  const examTypeOptions  = examTypeList.map((x) => ({ value: String(x.ExamTypeID), label: x.ExamType        }));
  const sessionOptions   = sessionList.map((x)  => ({ value: String(x.YearId),     label: x.YearDisplayName }));
  const examOptions      = examList.map((x)      => ({ value: String(x.ID),         label: x.ExaminationName }));
  const districtOptions  = districtList.map((d)  => ({ value: String(d.Value),      label: d.Text            }));
  const instituteOptions = instituteList.map((d) => ({ value: String(d.Value),      label: d.Text            }));
  const courseOptions    = courseList.map((c)    => ({ value: String(c.CourseID),   label: c.CourseName      }));

  // ── On Mount ──────────────────────────────────────────────────────────────
  useEffect(() => {
     loadExamType();
    
    loadSession();

    if (typeId === 61) {
      // ── Institute User UNCHANGED ──────────────────────────────────────
      loadInstituteUserCourses();
      loadInstituteUserExaminations();

    } else if (typeId === 14) {
      // ✅ DVETO — matches old ASPX LoadMaster for typeId 14
      // Step 1: get districtId → Step 2: filter institutes
      // Step 3: load courses → Step 4: load examinations
      loadDvetoOnMount();

    } else {
      // ── CMS Admin typeId 10 UNCHANGED ────────────────────────────────
      loadDistrict();
      loadInstitute();
      loadAllCourses();
      loadAllExaminations();
    }
  }, []);

  // ── DVETO Master Load (matches old ASPX LoadMaster typeId 14) ─────────────
  const loadDvetoOnMount = async () => {
    try {
      // ✅ Step 1: GetDistrictIDByDistrictUser(UserLoginID)
      const districtRes = await agent.get(getDistrictIDByDistrictUser, {
        params: { UserLoginID: userLoginID },
      });
      const districtId = districtRes?.data?.Data || 0;

      // ✅ Store districtId in state — used later in Search
      setDvetoDistrictId(districtId);

      // ✅ Step 2: GetMasterInstitute → filter by Group == districtId
      const instituteRes = await agent.get("/Base/GetMasterInstitute");
      const allInsts     = instituteRes?.data?.Data || [];
      setAllInstitute(allInsts);

      // filter + remove Select + insert ALL (Value=0)
      const filtered = allInsts.filter(
        (x) => String(x.Group) === String(districtId) && x.Value !== "-1"
      );
      filtered.unshift({ Text: "ALL", Value: "0", Group: String(districtId) });
      setInstituteList(filtered);

      // ✅ Step 3: GetMasterCourse(0,0)
      await loadDvetoCourses();

      // ✅ Step 4: GetExamination() all
      await loadAllExaminations();

    } catch (err) {
      console.error("❌ DVETO Mount Error:", err);
      setInstituteList([]);
    }
  };

  // ── DVETO Re-load institutes (used in Reset) ──────────────────────────────
  const reloadDvetoInstitutes = async () => {
    setInstituteLoading(true);
    try {
      // Use stored districtId if available, else re-fetch
      let districtId = dvetoDistrictId;

      if (!districtId) {
        const districtRes = await agent.get(getDistrictIDByDistrictUser, {
          params: { UserLoginID: userLoginID },
        });
        districtId = districtRes?.data?.Data || 0;
        setDvetoDistrictId(districtId);
      }

      const instituteRes = await agent.get("/Base/GetMasterInstitute");
      const allInsts     = instituteRes?.data?.Data || [];
      setAllInstitute(allInsts);

      const filtered = allInsts.filter(
        (x) => String(x.Group) === String(districtId) && x.Value !== "-1"
      );
      filtered.unshift({ Text: "ALL", Value: "0", Group: String(districtId) });
      setInstituteList(filtered);

    } catch {
      setInstituteList([]);
    } finally {
      setInstituteLoading(false);
    }
  };

  // ── DVETO Courses: GetMasterCourse(0,0) ──────────────────────────────────
  const loadDvetoCourses = async () => {
    setCourseLoading(true);
    try {
      const res  = await agent.get(GetMasterCourseAPI, {
        params: { SectorID: 0, CourseTypeID: 0 },
      });
      const data = res?.data?.Data || [];
      // filter Select, map to CourseID/CourseName, insert ALL
      const mapped = data
        .filter((x) => x.Value !== "-1")
        .map((x) => ({ CourseID: x.Value, CourseName: x.Text }));
      mapped.unshift({ CourseID: "0", CourseName: "ALL" });
      setCourseList(mapped);
    } catch {
      setCourseList([]);
    } finally {
      setCourseLoading(false);
    }
  };

  // ── Loaders UNCHANGED (typeId 10 & 61) ───────────────────────────────────
  const loadExamType = async () => {
    setExamTypeLoading(true);
    try {
      const res = await agent.get("/Base/GetExamType");
      setExamTypeList(res?.data?.Data || []);
    } finally {
      setExamTypeLoading(false);
    }
  };

  const loadSession = async () => {
    setSessionLoading(true);
    try {
      const res = await agent.get("/Base/GetAdmissionYear");
      setSessionList(res?.data?.Data || []);
    } finally {
      setSessionLoading(false);
    }
  };

  const loadDistrict = async () => {
    setDistrictLoading(true);
    try {
      const res = await agent.get("/Base/GetMasterRegionDistrict");
      setDistrictList(res?.data?.Data || []);
    } finally {
      setDistrictLoading(false);
    }
  };

  const loadInstitute = async () => {
    setInstituteLoading(true);
    try {
      const res = await agent.get("/Base/GetMasterInstitute");
      setAllInstitute(res?.data?.Data || []);
      setInstituteList(res?.data?.Data || []);
    } finally {
      setInstituteLoading(false);
    }
  };

  const loadInstituteUserExaminations = async () => {
    setExamLoading(true);
    try {
      const instituteCode = userInfo?.UserLoginID ;
      const instituteRes  = await agent.get("/Base/GetInstituteIDByInstituteCode", {
        params: { InstituteCode: instituteCode },
      });
      const collegeId = instituteRes?.data?.Data;
      const res = await agent.get("/Base/GetExamination", {
        params: { InstituteID: collegeId },
      });
      const data = res?.data?.Data || [];
      allExamRef.current = data;
      // setExamList(data);
      setExamList([]);
    } catch {
      allExamRef.current = [];
      setExamList([]);
    } finally {
      setExamLoading(false);
    }
  };

  const loadInstituteUserCourses = async () => {
    setCourseLoading(true);
    try {
      debugger;
      const instituteCode = userInfo?.UserLoginID ;
      const instituteRes  = await agent.get("/Base/GetInstituteIDByInstituteCode", {
        params: { InstituteCode: instituteCode },
      });
      const collegeId = instituteRes?.data?.Data;
      if (!collegeId) { setCourseList([]); return; }
      const courseRes = await agent.get("/Base/GetCourseByCollogeID", {
        params: { CollegeID: collegeId },
      });
      setCourseList(courseRes?.data?.Data || []);
    } catch {
      setCourseList([]);
    } finally {
      setCourseLoading(false);
    }
  };

  const loadAllCourses = async () => {
    setCourseLoading(true);
    try {
      const res = await agent.get(GetMasterCourseFilterAPI, {
        params: { courseType: 0, userLoginId: UserLoginID },
      });
      setCourseList(res?.data?.Data || []);
    } catch {
      setCourseList([]);
    } finally {
      setCourseLoading(false);
    }
  };

  const loadCoursesByInstitute = async (instituteId) => {
    setCourseLoading(true);
    try {
      const res = await agent.get("/Base/GetCourseByCollogeID", {
        params: { CollegeID: instituteId },
      });
      setCourseList(res?.data?.Data || []);
    } catch {
      setCourseList([]);
    } finally {
      setCourseLoading(false);
    }
  };

  const loadAllExaminations = async () => {
    setExamLoading(true);
    try {
      const res  = await agent.get("/Base/GetExamination");
      const data = res?.data?.Data || [];
      allExamRef.current = data;
      // ✅ Don't show all — wait for session selection to filter
      setExamList([]);
    } catch {
      allExamRef.current = [];
      setExamList([]);
    } finally {
      setExamLoading(false);
    }
  };

  // ✅ Filter exams by session — used for typeId 10 and 14
  // const filterExamsByYear = (yearId) => {
  //   if (!yearId) { setExamList([]); return; }
  //   const filtered = allExamRef.current.filter(
  //     (x) => String(x.ExaminatioYearID) === String(yearId)
  //   );
  //   setExamList(filtered);
  // };
//   const filterExamsByYear = (yearId) => {
//   console.log("SELECTED ADMISSION YEAR ID:", yearId);
//   console.log("ALL EXAM DATA:", allExamRef.current);

//   const filtered = allExamRef.current.filter(
//     (x) => String(x.ExaminatioYearID) === String(yearId)
//   );

//   console.log("FILTERED EXAM DATA:", filtered);

//   setExamList(filtered);
// };
// Show only examinations that belong to the selected Admission Session
const filterExamsByYear = (yearId) => {
  if (!yearId) {
    setExamList([]);
    return;
  }
  const filtered = allExamRef.current.filter(
    (x) => String(x.ExaminatioYearID) === String(yearId)
  );
  setExamList(filtered);
};

const handleSessionChange = (value) => {
  setDropdownErrors((p) => ({ ...p, session: false }));

  setFormData((p) => ({
    ...p,
    session: value,
    examination: "",
    examinationYearId: "",
  }));

  filterExamsByYear(value);   // applies to every user type
};
  // ── Handlers ──────────────────────────────────────────────────────────────
 const handleExamTypeChange = (value) => {
  setDropdownErrors((p) => ({ ...p, examTypeId: false }));

  const selected = examTypeList.find(
    (x) => String(x.ExamTypeID) === String(value)
  );

  setFormData((p) => ({
    ...p,
    examType: selected?.ExamType || "",
    examTypeId: value,
    examination: "",
    examinationYearId: "",
  }));

  if (formData.session) {
    filterExamsByYear(formData.session);
  }
};
  ///  Currently Apply Changes for  add filter of exmination for typeId 61  for institute user

  
  

  // UserType 61 → show only examinations for selected year
//   if (typeId === 61||typeId === 10) {
//   setExamList(allExamRef.current);
// }
   
  // Other users → show all examinations
 


  const handleExaminationChange = (value) => {
    setDropdownErrors((p) => ({ ...p, examination: false }));
    const selected = examList.find((x) => String(x.ID) === String(value));
    setFormData((p) => ({
      ...p,
      examination:       value,
      examinationYearId: selected?.ExaminatioYearID ? String(selected.ExaminatioYearID) : "",
    }));
  };

  const handleDistrictChange = (value) => {
    if (!value) {
      setInstituteList(allInstitute);
    } else {
      setInstituteList(allInstitute.filter((x) => String(x.Group) === String(value)));
    }
    setFormData((p) => ({ ...p, district: value, institute: "", course: "" }));
    loadAllCourses();
  };

  // ✅ Institute change — typeId 14: if institute > 0 load courses by institute
  //                                   if institute = 0 (ALL) reload GetMasterCourse(0,0)
  const handleInstituteChange = (value) => {
    setFormData((p) => ({ ...p, institute: value, course: "" }));
    if (value && value !== "0") {
      // Institute selected — load courses for that institute
      loadCoursesByInstitute(value);
    } else {
      // ALL selected
      if (typeId === 14) {
        loadDvetoCourses();     // ✅ GetMasterCourse(0,0)
      } else {
        loadAllCourses();
      }
    }
  };

  const handleCourseChange = (value) => {
    setFormData((p) => ({ ...p, course: value }));
  };

  // ── Search ────────────────────────────────────────────────────────────────
  const handleSearch = async () => {
    debugger;
    const errors = [];
    const newDropdownErrors = {
      examTypeId:  false,
      session:     false,
      examination: false,
    };

    if (!formData.examTypeId)  { errors.push("Please Select Exam Type.");         newDropdownErrors.examTypeId  = true; }
    if (!formData.session)     { errors.push("Please Select Admission Session."); newDropdownErrors.session     = true; }
    if (!formData.examination) { errors.push("Please Select Examination.");       newDropdownErrors.examination = true; }

    if (errors.length > 0) {
      setDropdownErrors(newDropdownErrors);
      SwalHelper.error("Validation Error", errors.join("<br/>"));
      return;
    }

    setDropdownErrors({ examTypeId: false, session: false, examination: false });

    try {
      setLoading(true);
      setHasSearched(false);
      SwalHelper.loading("Searching...", "Please wait while we fetch the results.");

      let res;

      if (typeId === 61) {
        debugger;
        // ── Institute User UNCHANGED ──────────────────────────────────────
        const instituteCode = userInfo?.UserLoginID ;
        const instituteRes  = await agent.get("/Base/GetInstituteIDByInstituteCode", {
          params: { InstituteCode: instituteCode },
        });
        const collegeId = instituteRes?.data?.Data || 0;

        const payload = {
          examinationId: Number(formData.examination),
          examTypeId:    Number(formData.examTypeId),
          userTypeId:    Number(typeId),
          instituteId:   Number(collegeId),
          courseId:      Number(formData.course || 0),
          districtId:    0,
          userLoginId:   instituteCode,
          isResultFresh: false,
        };


        res = await agent.get(Getresultbatchwise, { params: payload });

      } else if (typeId === 14) {
        // ✅ DVETO — send stored districtId
        // matches old ASPX BindGrid for typeId 14
        const payload = {
          examinationId: Number(formData.examination),
          examTypeId:    Number(formData.examTypeId),
          userTypeId:    14,
          instituteId:   Number(formData.institute || 0),   // 0 = ALL
          courseId:      Number(formData.course    || 0),   // 0 = ALL
          districtId:    Number(dvetoDistrictId),           // ✅ stored from mount
          userLoginId:   String(userLoginID),               // ✅ e.g. "DVETO02A"
          isResultFresh: "F",
        };

        res = await agent.get(Getresultbatchwise, { params: payload });

      } else {
        // ── CMS Admin typeId 10 UNCHANGED ────────────────────────────────
        const payload = {
          examinationId:     formData.examination,
          examTypeId:        formData.examTypeId,
          examinationYearId: formData.examinationYearId || null,
          instituteId:       formData.institute || null,
          districtId:        formData.district  || null,
          courseId:          formData.course    || null,
          userTypeId:        typeId,
          userLoginId:       loggedInUserID,
          isResultFresh:     false,
        };
        res = await agent.get(ResultInstituteWiseAPI, { params: payload });
      }

      SwalHelper.close();

      if (res.data?.StatusCode === 200) {
        const data = res.data?.Data || [];
        setTableData(data);
        setTableKey((k) => k + 1);
        setHasSearched(true);
        if (data.length === 0) {
          SwalHelper.info("No Records", "No records found for the selected criteria.");
        }
      } else {
        SwalHelper.error("Error", res.data?.Message || "No data found.");
        setTableData([]);
        setTableKey((k) => k + 1);
        setHasSearched(true);
      }
    } catch {
      SwalHelper.close();
      SwalHelper.error("Server Error", "Something went wrong. Please try again.");
      setTableData([]);
      setTableKey((k) => k + 1);
      setHasSearched(true);
    } finally {
      setLoading(false);
    }
  };

  // ── Reset ─────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setDropdownErrors({ examTypeId: false, session: false, examination: false });
    setFormData({
      examType:          "",
      examTypeId:        "",
      session:           "",
      examination:       "",
      examinationYearId: "",
      district:          "",
      institute:         "",
      course:            "",
    });
    setTableData([]);
    setHasSearched(false);

    if (typeId === 61) {
      // UNCHANGED
      loadInstituteUserCourses();
      loadInstituteUserExaminations();

    } else if (typeId === 14) {
      // ✅ DVETO reset — reload filtered institutes + courses + clear exams
      reloadDvetoInstitutes();
      loadDvetoCourses();
      setExamList([]);

    } else {
      // typeId 10 CMS UNCHANGED
      setExamList([]);
      setInstituteList(allInstitute);
      loadAllCourses();
    }
  };

  // ── Download UNCHANGED ────────────────────────────────────────────────────
  const handleDownload = async (item, docType, printType) => {
    try {
      SwalHelper.loading("Downloading...", "Please wait.");

      const isResultFresh = "F";
      let apiUrl  = "";
      let payload = {};

      if (
        (typeId === 61 || typeId === 14) &&
        printType === "System" &&
        (docType === "Result" || docType === "Certificate")
      ) {
        // ✅ typeId 61 and 14 — batchprintresultcertificateAPI
        // commandName decides RDLC:
        // "Result"      → StatementofMarksSystem.rdlc
        // "Certificate" → CertificateSystem.rdlc
        apiUrl  = batchprintresultcertificateAPI;
        payload = {
          examinationId: item.ExaminationID,
          batchId:       item.BatchID,
          isResultFresh,
          commandName:   docType,
          examTypeId:    Number(formData.examTypeId),
          userTypeId:    Number(typeId),
          instituteId:   Number(item.InstituteID || 0),
          courseId:      Number(item.CourseID    || 0),
          districtId:    Number(dvetoDistrictId  || 0), // ✅ stored districtId
          userLoginId:   String(userLoginID),
        };

      } else if (printType === "System" && docType === "Result") {
        apiUrl  = GenerateResultPDFZipAPI;
        payload = {
          examinationId: item.ExaminationID,
          instituteId:   item.InstituteID,
          isResultFresh,
          commandName:   "Result",
        };

      } else if (printType === "System" && docType === "Certificate") {
        apiUrl  = GenerateCertificatePDFZipAPI;
        payload = {
          examinationId: item.ExaminationID,
          instituteId:   item.InstituteID,
          isResultFresh,
          commandName:   "Certificate",
        };

      } else if (printType === "PrePrinted" && docType === "Result") {
        apiUrl  = BulkStatementOfMarksPDFAPI;
        payload = {
          examinationId: item.ExaminationID,
          instituteId:   item.InstituteID,
          isResultFresh,
          examTypeId:    Number(formData.examTypeId),
          userTypeId:    Number(typeId),
          courseId:      Number(formData.course   || 0),
          districtId:    Number(formData.district || 0),
          userLoginId:   String(loggedInUserID),
        };

      } else if (printType === "PrePrinted" && docType === "Certificate") {
        apiUrl  = BulkCertificatePDFAPI;
        payload = {
          examinationId: item.ExaminationID,
          instituteId:   item.InstituteID,
          isResultFresh,
        };

      } else {
        SwalHelper.close();
        SwalHelper.error("Error", "Invalid download type.");
        return;
      }

      const res = await agent.get(apiUrl, { params: payload, responseType: "blob" });

      const contentType = res.headers["content-type"] || "";
      if (
        contentType.includes("application/json") ||
        contentType.includes("application/problem+json")
      ) {
        const text = await res.data.text();
        SwalHelper.close();
        SwalHelper.error("Backend Error", text);
        return;
      }

      SwalHelper.close();

      const blob = new Blob([res.data], { type: contentType });
      const url  = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      let fileName      = "download";
      const disposition = res.headers["content-disposition"];
      if (disposition && disposition.includes("filename=")) {
        fileName = disposition.split("filename=")[1].replace(/"/g, "");
      } else {
        fileName = `${printType}_${docType}.${contentType.includes("zip") ? "zip" : "pdf"}`;
      }

      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

    } catch (err) {
      SwalHelper.close();
      try {
        const errResponse = err?.response;
        const status      = errResponse?.status;
        const errBlob     = errResponse?.data;

        if (errBlob instanceof Blob) {
          const errText = await errBlob.text();
          try {
            const errJson = JSON.parse(errText);
            const message = errJson?.Message || errJson?.message || errJson?.title || errText;
            SwalHelper.error(`Error ${status || ""}`, message);
          } catch {
            SwalHelper.error(`Error ${status || ""}`, errText || "Something went wrong.");
          }
        } else {
          SwalHelper.error(
            `Error ${status || ""}`,
            errResponse?.data?.Message || errResponse?.data?.message || "Something went wrong."
          );
        }
      } catch {
        SwalHelper.error("Download Error", "Failed to download. Please try again.");
      }
    }
  };

  // ── Render Cell UNCHANGED ─────────────────────────────────────────────────
  const renderCell = (item, column) => {
    const DownloadBtn = ({ label, onClick }) => (
      <div className="flex justify-center">
        <button
          type="button"
          onClick={onClick}
          className="bg-[#28a745] hover:bg-[#218838] text-white text-xs font-semibold px-3 py-1.5 rounded transition-colors duration-150 whitespace-nowrap"
        >
          {label}
        </button>
      </div>
    );

    const ErrorLabel = ({ text }) => (
      <span className="block text-center text-red-600 font-bold text-xs">{text}</span>
    );

    switch (column.key) {
      case "SystemResult":
        if (Number(item.DownloadRsult) > 0)
          return <ErrorLabel text="Result Not Declared" />;
        return <DownloadBtn label="Download Result" onClick={() => handleDownload(item, "Result", "System")} />;

      case "SystemCertificate":
        if (Number(item.DownloadCertificate) > 0)
          return <ErrorLabel text="No Certificate Generated" />;
        return <DownloadBtn label="Download Certificate" onClick={() => handleDownload(item, "Certificate", "System")} />;

      case "PrePrintedResult":
        if (Number(item.DownloadRsult) > 0)
          return <ErrorLabel text="Result Not Declared" />;
        return <DownloadBtn label="Download Result" onClick={() => handleDownload(item, "Result", "PrePrinted")} />;

      case "PrePrintedCertificate":
        if (Number(item.DownloadCertificate) > 0)
          return <ErrorLabel text="No Certificate Generated" />;
        return <DownloadBtn label="Download Certificate" onClick={() => handleDownload(item, "Certificate", "PrePrinted")} />;

      case "ResultHold": {
        const val = item.ResultHold;
        return (
          <span className="block text-center">
            {val !== null && val !== undefined && val !== "" ? val : 0}
          </span>
        );
      }

      default:
        return undefined;
    }
  };

  // ── Table Columns ─────────────────────────────────────────────────────────
  const tableColumns = [
    { key: "Institute", header: "Institute", width: "220px", headerClassName: "text-left" },

    // ✅ BatchID + Course for typeId 61 AND 14
    ...(typeId === 61 || typeId === 14 ? [
      { key: "BatchID", header: "Batch ID", width: "130px", headerClassName: "text-center" },
      { key: "Course",  header: "Course",   width: "180px", headerClassName: "text-left"   },
    ] : []),

    {
      key:             typeId === 61 || typeId === 14 ? "Examinee" : "Examinee1",
      header:          "Examinee",
      width:           "90px",
      headerClassName: "text-center",
    },
    { key: "Pass",              header: "Passed",             width: "70px",  headerClassName: "text-center" },
    { key: "Fail",              header: "Failed",             width: "70px",  headerClassName: "text-center" },
    { key: "ResultHold",        header: "Result Hold",        width: "100px", headerClassName: "text-center" },
    { key: "SystemResult",      header: "System Result",      width: "160px", headerClassName: "text-center" },
    { key: "SystemCertificate", header: "System Certificate", width: "175px", headerClassName: "text-center" },

    // ✅ PrePrinted only for typeId 10
    ...(typeId === 10 ? [
      { key: "PrePrintedResult",      header: "Pre Printed Result",      width: "160px", headerClassName: "text-center" },
      { key: "PrePrintedCertificate", header: "Pre Printed Certificate", width: "185px", headerClassName: "text-center" },
    ] : []),
  ];

  // ── JSX ───────────────────────────────────────────────────────────────────
  return (
    <div className="w-full p-4">
      <fieldset className="rounded-lg border border-gray-300 bg-white shadow-lg">
        <legend className={`flex ${color} items-center text-base font-semibold text-white border-2 border-gray-300 px-3 py-1.5 rounded-md ml-4`}>
          <FaFileAlt className="mr-2 text-white" />
          Result and Certificate
        </legend>

        <div className="px-4 pb-4 pt-3">

          {/* ── Row 1: Exam Type / Session / Examination — ALL users ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <DropdownComponent
              label="Exam Type"
              required
              options={examTypeOptions}
              value={formData.examTypeId}
              onChange={handleExamTypeChange}
              loading={examTypeLoading}
              error={dropdownErrors.examTypeId}
            />

            <DropdownComponent
              label="Admission Session"
              required
              options={sessionOptions}
              value={formData.session}
              onChange={handleSessionChange}
              loading={sessionLoading}
              error={dropdownErrors.session}
            />

            <div>
              <DropdownComponent
                label="Examination"
                required
                options={examOptions}
                value={formData.examination}
                onChange={handleExaminationChange}
                loading={examLoading}
                // disabled={typeId === 61 ? examLoading : (!formData.session || examLoading)}
                
                error={dropdownErrors.examination}
              />
             {!formData.session && !examLoading && (
                <p className="text-gray-400 text-xs mt-1">
                  Select Admission Session to load examinations.
                </p>
              )}
              {formData.session && !examLoading && examList.length === 0 && (
                <p className="text-red-500 text-xs mt-1">
                  No examinations found for the selected session.
                </p>
              )}
            </div>
          </div>

          <hr className="border-t border-gray-200 mb-4" />

          {/* ── typeId 61: Course only — UNCHANGED ── */}
          {typeId === 61 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <DropdownComponent
                label="Course (Optional)"
                options={courseOptions}
                value={formData.course}
                onChange={handleCourseChange}
                loading={courseLoading}
              />
            </div>
          )}

          {/* ✅ typeId 14 DVETO: Institute + Course — NO district dropdown ── */}
          {typeId === 14 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <DropdownComponent
                label="Institute (Optional)"
                options={instituteOptions}
                value={formData.institute}
                onChange={handleInstituteChange}
                loading={instituteLoading}
              />
              <DropdownComponent
                label="Course (Optional)"
                options={courseOptions}
                value={formData.course}
                onChange={handleCourseChange}
                loading={courseLoading}
              />
            </div>
          )}

          {/* ── typeId 10 CMS: District + Institute — UNCHANGED ── */}
          {typeId !== 61 && typeId !== 14 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <DropdownComponent
                label="District (Optional)"
                options={districtOptions}
                value={formData.district}
                onChange={handleDistrictChange}
                loading={districtLoading}
              />
              <DropdownComponent
                label="Institute (Optional)"
                options={instituteOptions}
                value={formData.institute}
                onChange={handleInstituteChange}
                loading={instituteLoading}
              />
            </div>
          )}

          {/* ── Buttons ── */}
          <div className="flex justify-center gap-3 mb-4">
            <button
              type="button"
              className="bg-[#28a745] text-white px-8 py-2 rounded font-semibold disabled:opacity-70 disabled:cursor-not-allowed min-w-[120px]"
              onClick={handleSearch}
              disabled={loading || examLoading}
            >
              {loading ? "Searching..." : "Search"}
            </button>

            <button
              type="button"
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-2 rounded font-semibold min-w-[120px]"
              onClick={handleReset}
            >
              Reset
            </button>
          </div>

          {/* ── Table ── */}
          {hasSearched && (
            <FilteredTableComponent
              key={tableKey}
              data={tableData}
              columns={tableColumns}
              renderCell={renderCell}
              title="Result and Certificate"
              exportFileName="ResultAndCertificate"
              tableId="result-certificate-table"
              maxHeight="450px"
              emptyStateMessage="No Data Found"
              emptyStateSubMessage="Please search using the filters above"
              showSearch={true}
              searchPosition="right"
              showExport={true}
              showExcelTemplate={false}
              showPDF={true}
            />
          )}

        </div>
      </fieldset>
    </div>
  );
};

export default ResultAndCertificate;