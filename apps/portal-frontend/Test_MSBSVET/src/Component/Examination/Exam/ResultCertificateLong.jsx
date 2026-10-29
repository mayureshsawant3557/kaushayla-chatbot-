
// import React, { useEffect, useState, useContext, useRef } from "react";
// import agent from "../../../lib/api/agent";
// import FilteredTableComponent from "../../formcomponent/FilteredTableComponent";
// import DropdownComponent from "../../formcomponent/DropdownComponent";
// import { ThemeContext } from "../../Context/ThemeContext";
// import { FaFileAlt } from "react-icons/fa";
// import { SwalHelper } from "../../../utils/swalHelper";

// import {
//   ResultInstituteWiseAPI,
//   GenerateResultPDFZipAPI,
//   GenerateCertificatePDFZipAPI,
//   BulkMarkPdflongAPI,
//   BulkCertificatePDFAPI,
//   BulkCertificatePdfLongAPI,
//   bulkstatementofmarkspdftableAPI,
// } from "../../../Endpoints_All/Examination/Exam";
// import { useAuth } from "../../../Hooks/AuthContext";

// const ResultCertificateLong = () => {
//   const { userInfo } = useAuth();

//   const loggedInUserID = userInfo?.UserID || 0;
//   const typeId = userInfo?.UserTypeID || 0;

//   const { color } = useContext(ThemeContext);
//   const allExamRef = useRef([]);

//   const [examTypeList, setExamTypeList] = useState([]);
//   const [examList, setExamList] = useState([]);
//   const [sessionList, setSessionList] = useState([]);
//   const [districtList, setDistrictList] = useState([]);
//   const [allInstitute, setAllInstitute] = useState([]);
//   const [instituteList, setInstituteList] = useState([]);

//   const [loading, setLoading] = useState(false);
//   const [tableData, setTableData] = useState([]);
//   const [tableKey, setTableKey] = useState(0);
//   const [hasSearched, setHasSearched] = useState(false);

//   const [formData, setFormData] = useState({
//     examTypeId: "",
//     session: "",
//     examination: "",
//     examinationYearId: "",
//     district: "",
//     institute: "",
//   });

//   useEffect(() => {
//     loadExamType();
//     loadSession();
//     loadDistrict();
//     loadInstitute();
//     loadAllExaminations();
//   }, []);

//   const loadExamType = async () => {
//     const res = await agent.get("/Base/GetExamType");
//     setExamTypeList(res?.data?.Data || []);
//   };

//   const loadSession = async () => {
//     const res = await agent.get("/Base/GetAdmissionYear");
//     setSessionList(res?.data?.Data || []);
//   };

//   const loadDistrict = async () => {
//     const res = await agent.get("/Base/GetMasterRegionDistrict");
//     setDistrictList(res?.data?.Data || []);
//   };

//   const loadInstitute = async () => {
//     const res = await agent.get("/Base/GetMasterInstitute");
//     setAllInstitute(res?.data?.Data || []);
//     setInstituteList(res?.data?.Data || []);
//   };

//   const loadAllExaminations = async () => {
//     const res = await agent.get("/Base/GetExamination");
//     allExamRef.current = res?.data?.Data || [];
//   };

//   const filterExamsByYear = (yearId) => {
//     const filtered = allExamRef.current.filter(
//       (x) => String(x.ExaminatioYearID) === String(yearId)
//     );
//     setExamList(filtered);
//   };

//   const handleSessionChange = (value) => {
//     setFormData((p) => ({ ...p, session: value, examination: "" }));
//     filterExamsByYear(value);
//   };

//   const handleExaminationChange = (value) => {
//     const selected = examList.find((x) => String(x.ID) === value);
//     setFormData((p) => ({
//       ...p,
//       examination: value,
//       examinationYearId: selected?.ExaminatioYearID || "",
//     }));
//   };

//   const handleDistrictChange = (value) => {
//     if (!value) setInstituteList(allInstitute);
//     else setInstituteList(allInstitute.filter((x) => String(x.Group) === value));
//     setFormData((p) => ({ ...p, district: value, institute: "" }));
//   };

//   const handleSearch = async () => {
//     if (!formData.examTypeId || !formData.session || !formData.examination) {
//       SwalHelper.error("Validation Error", "Please fill required fields");
//       return;
//     }

//     try {
//       setLoading(true);
//       SwalHelper.loading("Searching...", "Please wait...");

//       // ✅ Default values from form (for UserType 10)
//       let finalInstituteId = formData.institute || 0;
//       let finalDistrictId = formData.district || 0;

//       // ✅ UserType 61 — call GetInstituteIDByInstituteCode first
//       // API returns { Data: 10001 } for "MSB010007"
//       if (typeId === 61) {
//         const instituteRes = await agent.get(
//           "/Base/GetInstituteIDByInstituteCode",
//           {
//             params: { InstituteCode: userLoginId }, // "MSB010007"
//           }
//         );

//         finalInstituteId = instituteRes?.data?.Data || 0; // 10001
//         finalDistrictId = 0;
//       }

//       // ✅ Now call main result API with resolved values
//       const res = await agent.get(ResultInstituteWiseAPI, {
//         params: {
//           examinationId: formData.examination,
//           examTypeId: formData.examTypeId,
//           examinationYearId: formData.examinationYearId || null,
//           instituteId: finalInstituteId, // 10001 for type 61, selected for type 10
//           districtId: finalDistrictId,   // 0 for type 61, selected for type 10
//           userTypeId: typeId,
//           userLoginId: userInfo?.UserLoginID || "", // "MSB010007" for type 61, "" for type 10
//           isResultFresh: false,
//         },
//       });
//       Console.log("ResultInstituteWiseAPI response:", res);
//       Console.log("ResultInstituteWiseAPI response:", res.data);

//       SwalHelper.close();

//       if (res.data?.StatusCode === 200) {
//         setTableData(res.data.Data || []);
//         setTableKey((k) => k + 1);
//         setHasSearched(true);
//       }
//     } catch (err) {
//       SwalHelper.close();
//       SwalHelper.error("Error", "API failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDownload = async (item, docType, printType) => {
//     try {
//       SwalHelper.loading("Downloading...", "Please wait.");

//       const isResultFresh = "F";
//       let apiUrl = "";
//       let payload = {};

//       if (printType === "System" && docType === "Result") {
//         apiUrl = GenerateResultPDFZipAPI;
//         payload = {
//           examinationId: item.ExaminationID,
//           instituteId: item.InstituteID,
//           isResultFresh,
//           commandName: "Result",
//         };
//       } else if (printType === "System" && docType === "Certificate") {
//         apiUrl = GenerateCertificatePDFZipAPI;
//         payload = {
//           examinationId: item.ExaminationID,
//           instituteId: item.InstituteID,
//           isResultFresh,
//           commandName: "Certificate",
//         };
//       } else if (printType === "PrePrinted" && docType === "Result") {
//         apiUrl = bulkstatementofmarkspdftableAPI;
//         payload = {
//           examinationId: item.ExaminationID,
//           instituteId: item.InstituteID,
//           isResultFresh: "F",
//         };
//       } else if (printType === "PrePrinted" && docType === "Certificate") {
//         apiUrl = BulkCertificatePdfLongAPI;
//         payload = {
//           examinationId: item.ExaminationID,
//           instituteId: item.InstituteID,
//           isResultFresh,
//         };
//       } else {
//         SwalHelper.close();
//         SwalHelper.error("Error", "Invalid download type.");
//         return;
//       }

//       const res = await agent.get(apiUrl, {
//         params: payload,
//         responseType: "blob",
//       });

//       const contentType = res.headers["content-type"] || "";
//       if (contentType.includes("application/json")) {
//         const text = await res.data.text();
       
//         SwalHelper.close();
//         SwalHelper.error("Backend Error", text);
//         return;
//       }

//       SwalHelper.close();

//       const blob = new Blob([res.data], { type: contentType });
//       const url = window.URL.createObjectURL(blob);
//       const link = document.createElement("a");

//       let fileName = "download";
//       const disposition = res.headers["content-disposition"];
//       if (disposition && disposition.includes("filename=")) {
//         fileName = disposition.split("filename=")[1].replace(/"/g, "");
//       } else {
//         fileName = `${printType}_${docType}.${
//           contentType.includes("zip") ? "zip" : "pdf"
//         }`;
//       }

//       link.href = url;
//       link.download = fileName;
//       document.body.appendChild(link);
//       link.click();
//       link.remove();
//       window.URL.revokeObjectURL(url);
//     } catch (err) {
//       SwalHelper.close();
//       SwalHelper.error("Download Error", "Failed to download. Please try again.");
//     }
//   };

//   const renderCell = (item, column) => {
//     const DownloadBtn = ({ label, onClick }) => (
//       <div className="flex justify-center">
//         <button
//           type="button"
//           onClick={onClick}
//           className="bg-[#28a745] hover:bg-[#218838] text-white text-xs font-semibold px-3 py-1.5 rounded transition-colors duration-150 whitespace-nowrap"
//         >
//           {label}
//         </button>
//       </div>
//     );

//     const ErrorLabel = ({ text }) => (
//       <span className="block text-center text-red-600 font-bold text-xs">
//         {text}
//       </span>
//     );

//     switch (column.key) {
//       case "SystemResult":
//         if (Number(item.DownloadRsult) > 0)
//           return <ErrorLabel text="Result Not Declared" />;
//         return (
//           <DownloadBtn
//             label="Download Result"
//             onClick={() => handleDownload(item, "Result", "System")}
//           />
//         );

//       case "SystemCertificate":
//         if (Number(item.DownloadCertificate) > 0)
//           return <ErrorLabel text="No Certificate Generated" />;
//         return (
//           <DownloadBtn
//             label="Download Certificate"
//             onClick={() => handleDownload(item, "Certificate", "System")}
//           />
//         );

//       case "PrePrintedResult":
//         if (Number(item.DownloadRsult) > 0)
//           return <ErrorLabel text="Result Not Declared" />;
//         return (
//           <DownloadBtn
//             label="Download Result"
//             onClick={() => handleDownload(item, "Result", "PrePrinted")}
//           />
//         );

//       case "PrePrintedCertificate":
//         if (Number(item.DownloadCertificate) > 0)
//           return <ErrorLabel text="No Certificate Generated" />;
//         return (
//           <DownloadBtn
//             label="Download Certificate"
//             onClick={() => handleDownload(item, "Certificate", "PrePrinted")}
//           />
//         );

//       default:
//         return undefined;
//     }
//   };

//   const handleReset = () => {
//     setFormData({
//       examTypeId: "",
//       session: "",
//       examination: "",
//       examinationYearId: "",
//       district: "",
//       institute: "",
//     });
//     setExamList([]);
//     setInstituteList(allInstitute);
//     setTableData([]);
//     setHasSearched(false);
//   };

//   // ✅ UserType 10 → All 4 columns
//   // ✅ UserType 61 → Only System Result + System Certificate
//   const tableColumns =
//     typeId === 61
//       ? [
//           { key: "Institute", header: "Institute" },
//           { key: "Examinee1", header: "Examinee" },
//           { key: "Pass", header: "Passed" },
//           { key: "Fail", header: "Failed" },
//           { key: "SystemResult", header: "System Result", width: "160px", headerClassName: "text-center" },
//           { key: "SystemCertificate", header: "System Certificate", width: "160px", headerClassName: "text-center" },
//         ]
//       : [
//           { key: "Institute", header: "Institute" },
//           { key: "Examinee1", header: "Examinee" },
//           { key: "Pass", header: "Passed" },
//           { key: "Fail", header: "Failed" },
//           { key: "SystemResult", header: "System Result", width: "160px", headerClassName: "text-center" },
//           { key: "SystemCertificate", header: "System Certificate", width: "160px", headerClassName: "text-center" },
//           { key: "PrePrintedResult", header: "Pre Printed Result", width: "160px", headerClassName: "text-center" },
//           { key: "PrePrintedCertificate", header: "Pre Printed Certificate", width: "185px", headerClassName: "text-center" },
//         ];

//   const examTypeOptions = examTypeList.map((x) => ({
//     value: String(x.ExamTypeID),
//     label: x.ExamType,
//   }));

//   const sessionOptions = sessionList.map((x) => ({
//     value: String(x.YearId),
//     label: x.YearDisplayName,
//   }));

//   const examOptions = examList.map((x) => ({
//     value: String(x.ID),
//     label: x.ExaminationName,
//   }));

//   const districtOptions = districtList.map((d) => ({
//     value: String(d.Value),
//     label: d.Text,
//   }));

//   const instituteOptions = instituteList.map((d) => ({
//     value: String(d.Value),
//     label: d.Text,
//   }));

//   return (
//     <div className="w-full p-4">
//       <fieldset className="rounded-lg border bg-white shadow-lg">
//         <legend className={`flex ${color} text-white px-3 py-1 rounded`}>
//           <FaFileAlt className="mr-2" />
//           Result and Certificate
//         </legend>

//         <div className="p-4">

//           {/* Row 1: Exam Type, Session, Examination — same for both */}
//           <div className="grid md:grid-cols-3 gap-4 mb-4">
//             <DropdownComponent
//               label="Exam Type"
//               options={examTypeOptions}
//               value={formData.examTypeId}
//               onChange={(v) => setFormData((p) => ({ ...p, examTypeId: v }))}
//             />
//             <DropdownComponent
//               label="Session"
//               options={sessionOptions}
//               value={formData.session}
//               onChange={handleSessionChange}
//             />
//             <DropdownComponent
//               label="Examination"
//               options={examOptions}
//               value={formData.examination}
//               onChange={handleExaminationChange}
//             />
//           </div>

//           {/* ✅ Row 2: District + Institute — ONLY for UserType 10 */}
//           {typeId !== 61 && (
//             <div className="grid md:grid-cols-2 gap-4 mb-4">
//               <DropdownComponent
//                 label="District"
//                 options={districtOptions}
//                 value={formData.district}
//                 onChange={handleDistrictChange}
//               />
//               <DropdownComponent
//                 label="Institute"
//                 options={instituteOptions}
//                 value={formData.institute}
//                 onChange={(v) => setFormData((p) => ({ ...p, institute: v }))}
//               />
//             </div>
//           )}

//           <div className="flex justify-center gap-3 mb-4">
//             <button
//               onClick={handleSearch}
//               className="px-6 py-2 rounded text-white bg-green-600 hover:bg-green-700 min-w-[100px]"
//             >
//               {loading ? "Searching..." : "Search"}
//             </button>
//             <button
//               onClick={handleReset}
//               className="px-6 py-2 rounded text-white bg-red-600 hover:bg-red-700 min-w-[100px]"
//             >
//               Reset
//             </button>
//           </div>

//           {hasSearched && (
//             <FilteredTableComponent
//               key={tableKey}
//               data={tableData}
//               columns={tableColumns}
//               renderCell={renderCell}
//             />
//           )}
//         </div>
//       </fieldset>
//     </div>
//   );
// };

// export default ResultCertificateLong;
import React, { useEffect, useState, useContext, useRef } from "react";
import agent from "../../../lib/api/agent";
import FilteredTableComponent from "../../formcomponent/FilteredTableComponent";
import DropdownComponent from "../../formcomponent/DropdownComponent";
import { ThemeContext } from "../../Context/ThemeContext";
import { FaFileAlt } from "react-icons/fa";
import { SwalHelper } from "../../../utils/swalHelper";

import {
  ResultInstituteWiseAPI,
  GenerateResultPDFZipAPI,
  GenerateCertificatePDFZipAPI,
  BulkMarkPdflongAPI,
  BulkCertificatePDFAPI,
  BulkCertificatePdfLongAPI,
  bulkstatementofmarkspdftableAPI,
} from "../../../Endpoints_All/Examination/Exam";
import { useAuth } from "../../../Hooks/AuthContext";

const ResultCertificateLong = () => {
  const { userInfo } = useAuth();

  const loggedInUserID = userInfo?.UserID || 0;
  const typeId = userInfo?.UserTypeID || 0;

  const { color } = useContext(ThemeContext);
  const allExamRef = useRef([]);

  const [examTypeList, setExamTypeList] = useState([]);
  const [examList, setExamList] = useState([]);
  const [sessionList, setSessionList] = useState([]);
  const [districtList, setDistrictList] = useState([]);
  const [allInstitute, setAllInstitute] = useState([]);
  const [instituteList, setInstituteList] = useState([]);

  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [tableKey, setTableKey] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);

  const [formData, setFormData] = useState({
    examTypeId: "",
    session: "",
    examination: "",
    examinationYearId: "",
    district: "",
    institute: "",
  });

  useEffect(() => {
    loadExamType();
    loadSession();
    loadDistrict();
    loadInstitute();
    loadAllExaminations();
  }, []);

  const loadExamType = async () => {
    const res = await agent.get("/Base/GetExamType");
    setExamTypeList(res?.data?.Data || []);
  };

  const loadSession = async () => {
    const res = await agent.get("/Base/GetAdmissionYear");
    setSessionList(res?.data?.Data || []);
  };

  const loadDistrict = async () => {
    const res = await agent.get("/Base/GetMasterRegionDistrict");
    setDistrictList(res?.data?.Data || []);
  };

  const loadInstitute = async () => {
    const res = await agent.get("/Base/GetMasterInstitute");
    setAllInstitute(res?.data?.Data || []);
    setInstituteList(res?.data?.Data || []);
  };

  const loadAllExaminations = async () => {
    const res = await agent.get("/Base/GetExamination");
    allExamRef.current = res?.data?.Data || [];
  };

  const filterExamsByYear = (yearId) => {
    const filtered = allExamRef.current.filter(
      (x) => String(x.ExaminatioYearID) === String(yearId)
    );
    setExamList(filtered);
  };

  const handleSessionChange = (value) => {
    setFormData((p) => ({ ...p, session: value, examination: "" }));
    filterExamsByYear(value);
  };

  const handleExaminationChange = (value) => {
    const selected = examList.find((x) => String(x.ID) === value);
    setFormData((p) => ({
      ...p,
      examination: value,
      examinationYearId: selected?.ExaminatioYearID || "",
    }));
  };

  const handleDistrictChange = (value) => {
    if (!value) setInstituteList(allInstitute);
    else setInstituteList(allInstitute.filter((x) => String(x.Group) === value));
    setFormData((p) => ({ ...p, district: value, institute: "" }));
  };

  const handleSearch = async () => {
    if (!formData.examTypeId || !formData.session || !formData.examination) {
      SwalHelper.error("Validation Error", "Please fill required fields");
      return;
    }

    try {
      setLoading(true);
      SwalHelper.loading("Searching...", "Please wait...");

      // ✅ Default values from form (for UserType 10)
      let finalInstituteId = formData.institute || 0;
      let finalDistrictId = formData.district || 0;

      // ✅ UserType 61 — call GetInstituteIDByInstituteCode first
      // API returns { Data: 10001 } for "MSB010007"
      if (typeId === 61) {
        // FIX: was referencing an undefined `userLoginId` variable.
        // The institute code must come from the logged-in user's info.
        const instituteCode = userInfo?.UserLoginID;

        const instituteRes = await agent.get(
          "/Base/GetInstituteIDByInstituteCode",
          {
            params: { InstituteCode: instituteCode }, // e.g. "MSB010007"
          }
        );

        finalInstituteId = instituteRes?.data?.Data || 0; // e.g. 10001
        finalDistrictId = 0;
      }

      // ✅ Now call main result API with resolved values
      const res = await agent.get(ResultInstituteWiseAPI, {
        params: {
          examinationId: formData.examination,
          examTypeId: formData.examTypeId,
          examinationYearId: formData.examinationYearId || null,
          instituteId: finalInstituteId, // 10001 for type 61, selected for type 10
          districtId: finalDistrictId,   // 0 for type 61, selected for type 10
          userTypeId: typeId,
          userLoginId: userInfo?.UserLoginID || "", // "MSB010007" for type 61, "" for type 10
          isResultFresh: false,
        },
      });

      // FIX: was `Console.log` (capital C) which does not exist in JS.
      // That threw a ReferenceError right after a successful call, which
      // was silently caught below — so setTableData() never ran and the
      // UI never updated even though the API returned 200 with data.
      console.log("ResultInstituteWiseAPI response:", res);
      console.log("ResultInstituteWiseAPI response:", res.data);

      SwalHelper.close();

      // FIX: coerce StatusCode to Number in case backend sends it as a string,
      // and surface an error message instead of failing silently when it
      // doesn't match, so future issues are visible instead of "just blank".
      if (Number(res.data?.StatusCode) === 200) {
        setTableData(res.data?.Data || []);
        setTableKey((k) => k + 1);
        setHasSearched(true);
      } else {
        setTableData([]);
        setHasSearched(true);
        SwalHelper.error("Error", res.data?.Message || "No data returned");
      }
    } catch (err) {
      SwalHelper.close();
      console.log("handleSearch error:", err);
      SwalHelper.error("Error", "API failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (item, docType, printType) => {
    try {
      SwalHelper.loading("Downloading...", "Please wait.");

      const isResultFresh = "F";
      let apiUrl = "";
      let payload = {};

      if (printType === "System" && docType === "Result") {
        apiUrl = GenerateResultPDFZipAPI;
        payload = {
          examinationId: item.ExaminationID,
          instituteId: item.InstituteID,
          isResultFresh,
          commandName: "Result",
        };
      } else if (printType === "System" && docType === "Certificate") {
        apiUrl = GenerateCertificatePDFZipAPI;
        payload = {
          examinationId: item.ExaminationID,
          instituteId: item.InstituteID,
          isResultFresh,
          commandName: "Certificate",
        };
      } else if (printType === "PrePrinted" && docType === "Result") {
        apiUrl = bulkstatementofmarkspdftableAPI;
        payload = {
          examinationId: item.ExaminationID,
          instituteId: item.InstituteID,
          isResultFresh: "F",
        };
      } else if (printType === "PrePrinted" && docType === "Certificate") {
        apiUrl = BulkCertificatePdfLongAPI;
        payload = {
          examinationId: item.ExaminationID,
          instituteId: item.InstituteID,
          isResultFresh,
        };
      } else {
        SwalHelper.close();
        SwalHelper.error("Error", "Invalid download type.");
        return;
      }

      const res = await agent.get(apiUrl, {
        params: payload,
        responseType: "blob",
      });

      const contentType = res.headers["content-type"] || "";
      if (contentType.includes("application/json")) {
        const text = await res.data.text();

        SwalHelper.close();
        SwalHelper.error("Backend Error", text);
        return;
      }

      SwalHelper.close();

      const blob = new Blob([res.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      let fileName = "download";
      const disposition = res.headers["content-disposition"];
      if (disposition && disposition.includes("filename=")) {
        fileName = disposition.split("filename=")[1].replace(/"/g, "");
      } else {
        fileName = `${printType}_${docType}.${
          contentType.includes("zip") ? "zip" : "pdf"
        }`;
      }

      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      SwalHelper.close();
      SwalHelper.error("Download Error", "Failed to download. Please try again.");
    }
  };

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
      <span className="block text-center text-red-600 font-bold text-xs">
        {text}
      </span>
    );

    switch (column.key) {
      case "SystemResult":
        if (Number(item.DownloadRsult) > 0)
          return <ErrorLabel text="Result Not Declared" />;
        return (
          <DownloadBtn
            label="Download Result"
            onClick={() => handleDownload(item, "Result", "System")}
          />
        );

      case "SystemCertificate":
        if (Number(item.DownloadCertificate) > 0)
          return <ErrorLabel text="No Certificate Generated" />;
        return (
          <DownloadBtn
            label="Download Certificate"
            onClick={() => handleDownload(item, "Certificate", "System")}
          />
        );

      case "PrePrintedResult":
        if (Number(item.DownloadRsult) > 0)
          return <ErrorLabel text="Result Not Declared" />;
        return (
          <DownloadBtn
            label="Download Result"
            onClick={() => handleDownload(item, "Result", "PrePrinted")}
          />
        );

      case "PrePrintedCertificate":
        if (Number(item.DownloadCertificate) > 0)
          return <ErrorLabel text="No Certificate Generated" />;
        return (
          <DownloadBtn
            label="Download Certificate"
            onClick={() => handleDownload(item, "Certificate", "PrePrinted")}
          />
        );

      default:
        return undefined;
    }
  };

  const handleReset = () => {
    setFormData({
      examTypeId: "",
      session: "",
      examination: "",
      examinationYearId: "",
      district: "",
      institute: "",
    });
    setExamList([]);
    setInstituteList(allInstitute);
    setTableData([]);
    setHasSearched(false);
  };

  // ✅ UserType 10 → All 4 columns
  // ✅ UserType 61 → Only System Result + System Certificate
  const tableColumns =
    typeId === 61
      ? [
          { key: "Institute", header: "Institute" },
          { key: "Examinee1", header: "Examinee" },
          { key: "Pass", header: "Passed" },
          { key: "Fail", header: "Failed" },
          { key: "SystemResult", header: "System Result", width: "160px", headerClassName: "text-center" },
          { key: "SystemCertificate", header: "System Certificate", width: "160px", headerClassName: "text-center" },
        ]
      : [
          { key: "Institute", header: "Institute" },
          { key: "Examinee1", header: "Examinee" },
          { key: "Pass", header: "Passed" },
          { key: "Fail", header: "Failed" },
          { key: "SystemResult", header: "System Result", width: "160px", headerClassName: "text-center" },
          { key: "SystemCertificate", header: "System Certificate", width: "160px", headerClassName: "text-center" },
          { key: "PrePrintedResult", header: "Pre Printed Result", width: "160px", headerClassName: "text-center" },
          { key: "PrePrintedCertificate", header: "Pre Printed Certificate", width: "185px", headerClassName: "text-center" },
        ];

  const examTypeOptions = examTypeList.map((x) => ({
    value: String(x.ExamTypeID),
    label: x.ExamType,
  }));

  const sessionOptions = sessionList.map((x) => ({
    value: String(x.YearId),
    label: x.YearDisplayName,
  }));

  const examOptions = examList.map((x) => ({
    value: String(x.ID),
    label: x.ExaminationName,
  }));

  const districtOptions = districtList.map((d) => ({
    value: String(d.Value),
    label: d.Text,
  }));

  const instituteOptions = instituteList.map((d) => ({
    value: String(d.Value),
    label: d.Text,
  }));

  return (
    <div className="w-full p-4">
      <fieldset className="rounded-lg border bg-white shadow-lg">
        <legend className={`flex ${color} text-white px-3 py-1 rounded`}>
          <FaFileAlt className="mr-2" />
          Result and Certificate
        </legend>

        <div className="p-4">

          {/* Row 1: Exam Type, Session, Examination — same for both */}
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <DropdownComponent
              label="Exam Type"
              options={examTypeOptions}
              value={formData.examTypeId}
              required 
              onChange={(v) => setFormData((p) => ({ ...p, examTypeId: v }))}
            />
            <DropdownComponent
              label="Session"
              options={sessionOptions}
              value={formData.session}
              required 
              onChange={handleSessionChange}
            />
            <DropdownComponent
              label="Examination"
              options={examOptions}
              value={formData.examination}
              required 
              onChange={handleExaminationChange}
            />
          </div>

          {/* ✅ Row 2: District + Institute — ONLY for UserType 10 */}
          {typeId !== 61 && (
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <DropdownComponent
                label="District"
                options={districtOptions}
                value={formData.district}
                onChange={handleDistrictChange}
              />
              <DropdownComponent
                label="Institute"
                options={instituteOptions}
                value={formData.institute}
                onChange={(v) => setFormData((p) => ({ ...p, institute: v }))}
              />
            </div>
          )}

          <div className="flex justify-center gap-3 mb-4">
            <button
              onClick={handleSearch}
              className="px-6 py-2 rounded text-white bg-green-600 hover:bg-green-700 min-w-[100px]"
            >
              {loading ? "Searching..." : "Search"}
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-2 rounded text-white bg-red-600 hover:bg-red-700 min-w-[100px]"
            >
              Reset
            </button>
          </div>

          {hasSearched && (
            <FilteredTableComponent
              key={tableKey}
              data={tableData}
              columns={tableColumns}
              renderCell={renderCell}
            />
          )}
        </div>
      </fieldset>
    </div>
  );
};

export default ResultCertificateLong;