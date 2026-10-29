

import React, { useEffect, useState, useContext } from "react";
import agent from "../../../lib/api/agent";
import DropdownComponent from "../../formcomponent/DropdownComponent";
import FilteredTableComponent from "../../formcomponent/FilteredTableComponent";
import { ThemeContext } from "../../Context/ThemeContext";
import { SwalHelper } from "../../../utils/swalHelper";
import { FaFileAlt } from "react-icons/fa";

import {
  approvedresultcandidatelistAPI,
  GetInstituteListAPI,
  InstitudePrintResultCertificateAPI,
 
  candidateprintresultPriCertificate,
  GenerateResultPDFZipAPI,
  generatesystemresultpdf,
  GenerateSystemCertificatePdfAPI,
  GeneratePreprintedResultPdfAPI,
} from "../../../Endpoints_All/Examination/Exam";

const ApprovedResultCandidateList = () => {
  const { color } = useContext(ThemeContext);

  const [examTypeList, setExamTypeList] = useState([]);
  const [examList, setExamList] = useState([]);
  const [instituteList, setInstituteList] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState([]);

  const [formData, setFormData] = useState({
    examTypeId: "",
    examinationId: "",
    instituteId: "",
  });

  useEffect(() => {
    loadExamType();
    loadInstitute();
  }, []);

  const loadExamType = async () => {
    try {
      const res = await agent.get("/Base/GetExamType");
      setExamTypeList(res?.data?.Data || []);
    } catch {}
  };

  const loadInstitute = async () => {
    try {
      const res = await agent.get(GetInstituteListAPI);
      console.log("Institute API response:", res?.data);
      setInstituteList(res?.data?.Data || []);
    } catch(err) {
    console.error("Institute API error:", err)}
  };

  const loadExaminationByExamType = async (examTypeId) => {
    try {
      const res = await agent.get("/Base/GetExamination", {
        params: { ExamID: examTypeId },
      });
      setExamList(res?.data?.Data || []);
    } catch {
      setExamList([]);
    }
  };

  const handleExamType = (val) => {
    setFormData((p) => ({ ...p, examTypeId: val, examinationId: "" }));
    loadExaminationByExamType(val);
  };

  const handleInstitute = (val) => {
    setFormData((p) => ({ ...p, instituteId: val }));
  };

  const handleSearch = async () => {
    if (!formData.examTypeId || !formData.examinationId) {
      SwalHelper.error("Error", "Select Exam Type and Examination");
      return;
    }

    setShowTable(true);
    setTableData([]); // clear old data
    try {
      setLoading(true);
      const res = await agent.get(approvedresultcandidatelistAPI, {
        params: {
          examTypeId: formData.examTypeId,
          examinationId: formData.examinationId,
          instituteId: formData.instituteId || null,
        },
      });

      if (res?.data?.StatusCode === 200) {
        setTableData(res.data.Data || []);
      } else {
        SwalHelper.error("Error", res?.data?.Message || "No data found");
        setTableData([]);
      }
    } catch {
      SwalHelper.error("Error", "Failed to load data");
      setTableData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({ examTypeId: "", examinationId: "", instituteId: "" });
    setExamList([]);
    setTableData([]);
    setShowTable(false);
  };

  // ✅ FIX: handleDownload now saves the file with the CORRECT extension.
  // Previously every download was hardcoded to ".zip", even when the
  // "System" endpoints returned a single raw PDF file, which corrupted
  // the download (Windows tried to open a PDF as a zip archive).
  const handleDownload = async (item, docType, printType) => {
    try {
      SwalHelper.loading("Downloading...", "Please wait...");

      const isResultFresh =
        item.IsResultFresh === true ||
        item.IsResultFresh === "T" ||
        item.IsResultFresh === 1 ||
        item.IsResultFresh === "1"
          ? "yes"
          : "no";

      let apiUrl = "";
      let payload = {};

      if (printType === "System" && docType === "Result") {
        apiUrl = generatesystemresultpdf;

        payload = {
          examinationId: item.ExaminationID,
          applicationId: item.ApplicationID,
           isResultFresh: item.IsResultFresh,
        };
      } else if (printType === "System" && docType === "Certificate") {
        // System Certificate API
        apiUrl = GenerateSystemCertificatePdfAPI;

        payload = {
          examinationId: item.ExaminationID,
          instituteId: item.InstituteID,
          applicationId: item.ApplicationID,
          isResultFresh: item.IsResultFresh,
        };
      } else if (printType === "PrePrinted" && docType === "Result") {
    apiUrl = GeneratePreprintedResultPdfAPI;
    //console.log("PrePrinted Result API URL:", apiUrl);
   

    payload = {
        examinationId: item.ExaminationID,
        applicationId: item.ApplicationID,
        isResultFresh: item.IsResultFresh,
        resCertificate: "R",
    };
}

       else if (printType === "PrePrinted" && docType === "Certificate") {
        apiUrl = candidateprintresultPriCertificate;

        payload = {
        examinationId: item.ExaminationID,
        applicationId: item.ApplicationID,
        isResultFresh: item.IsResultFresh,
        resCertificate: "C",
        };
      }

      // const res = await agent.get(apiUrl, {
      //   params: payload,
      //   responseType: "blob",
      // });
      const res = await agent.get(apiUrl, {
  params: payload,
  responseType: "blob",
});

console.log("PrePrinted Result response:", {
  contentType: res.headers["content-type"],
  size: res.data.size,
  payload,
});

      SwalHelper.close();

      const contentType = res.headers["content-type"] || "application/pdf";

      const blob = new Blob([res.data], { type: contentType });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // ✅ Determine correct file extension instead of hardcoding ".zip".
      // "System" endpoints (generatesystemresultpdf / InstitudePrintResultCertificateAPI)
      // return a single PDF for one candidate.
      // "PrePrinted" endpoints return a bulk ZIP of multiple PDFs.
      let ext = "zip";
      if (printType === "System") {
        ext = "pdf";
      } else if (contentType.includes("pdf")) {
        ext = "pdf";
      } else if (contentType.includes("zip")) {
        ext = "zip";
      }

      link.download = `${printType}_${docType}.${ext}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

    } catch {
      SwalHelper.close();
      SwalHelper.error("Error", "Download failed");
    }
  };

  const examTypeOptions = examTypeList.map((x) => ({
    value: String(x.ExamTypeID),
    label: x.ExamType,
  }));

  const examOptions = examList.map((x) => ({
    value: String(x.ID),
    label: x.ExaminationName,
  }));

  const instituteOptions = instituteList.map((x) => ({
    value: String(x.Value),
    label: x.Text,
  }));

  const columns = [
    { key: "SrNo", header: "Sr. No." },
    { key: "ApplicationIDDisplay", header: "Application ID" },
    { key: "CandidateName", header: "Candidate Name" },
    { key: "InstituteNameCode", header: "Institute Name Code" },
    { key: "CourseNameCode", header: "Course Name Code" },
    { key: "ExaminationName", header: "Examination Name" },
    { key: "SystemResult", header: "System Result" },
    { key: "SystemCertificate", header: "System Certificate" },
    { key: "PreResult", header: "Pre Printed Result" },
    { key: "PreCertificate", header: "Pre Printed Certificate" },
  ];

  const enrichedData = tableData.map((row, i) => ({ ...row, SrNo: i + 1 }));

  const renderCell = (item, column) => {
    const button = (text, onClick) => (
      <button
        onClick={onClick}
        className="bg-green-600 text-white px-2 py-1 text-xs rounded"
      >
        {text}
      </button>
    );

    const error = (text) => (
      <span className="text-red-600 text-xs font-bold">{text}</span>
    );

    switch (column.key) {
      case "SystemResult":
        return Number(item.DownloadRsult) > 0
          ? error("Result Not Declared")
          : button("Download Result", () =>
              handleDownload(item, "Result", "System")
            );

      case "SystemCertificate":
        return Number(item.DownloadCertificate) > 0
          ? error("No Certificate Generated")
          : button("Download Certificate", () =>
              handleDownload(item, "Certificate", "System")
            );

      case "PreResult":
        return Number(item.DownloadRsult) > 0
          ? error("Result Not Declared")
          : button("Download Result", () =>
              handleDownload(item, "Result", "PrePrinted")
            );

      case "PreCertificate":
        return Number(item.DownloadCertificate) > 0
          ? error("No Certificate Generated")
          : button("Download Certificate", () =>
              handleDownload(item, "Certificate", "PrePrinted")
            );

      default:
        return item[column.key] ?? "-";
    }
  };

  return (
    <div className="w-full p-4">
      <fieldset className="border rounded shadow bg-white">
        <legend
          className={`${color} text-white px-3 py-1 rounded ml-3 flex justify-items gap-2`}
        >
          <FaFileAlt className="mt-1" /> Result & Certificate Correction
        </legend>

        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
              value={formData.examinationId}
              onChange={(v) =>
                setFormData((p) => ({ ...p, examinationId: v }))
              }
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <DropdownComponent
              label="Institute"
              options={instituteOptions}
              value={formData.instituteId}
              onChange={handleInstitute}
            />
          </div>

          <div className="flex justify-center gap-3 mb-4">
            <button
              onClick={handleSearch}
              className="bg-green-600 text-white px-8 py-2 rounded border"
            >
              {loading ? "Searching..." : "Search"}
            </button>
            <button
              onClick={handleReset}
              className="bg-red-600 text-white px-8 py-2 rounded border"
            >
              Reset
            </button>
          </div>

          {showTable && (
            <FilteredTableComponent
              data={enrichedData}
              columns={columns}
              renderCell={renderCell}
              emptyStateMessage="Data Loading..."
            />
          )}
        </div>
      </fieldset>
    </div>
  );
};

export default ApprovedResultCandidateList;