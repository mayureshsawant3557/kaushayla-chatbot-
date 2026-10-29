
import React, { useContext, useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ThemeContext } from "../../Context/ThemeContext";
import { FaFileAlt, FaArrowLeft, FaDownload } from "react-icons/fa";
import { SwalHelper } from "../../../utils/swalHelper";
import agent from "../../../lib/api/agent";
import {
  GetCandidateForEvaluationMarksAPI,
  candidateForEvaluationMarksReportDownload,
} from "../../../Endpoints_All/Examination/Exam";
import FilteredTableComponent from "../../formcomponent/FilteredTableComponent";


const InfoItem = ({ label, value }) => (
  <div className="text-gray-700">
    {label} <span className="font-semibold text-gray-900">{value ?? "-"}</span>
  </div>
);

const resolveReportLink = (value, fallbackLabel = "View") => {
  if (!value || typeof value !== "string") return null;
  const trimmed = value.trim();

  if (trimmed.includes("<a")) {
    const hrefMatch = trimmed.match(/href\s*=\s*\\?"([^"\\]*)/i);
    const textMatch = trimmed.match(/>([^<]*)<\/a>/i);
    return hrefMatch?.[1]
      ? { href: hrefMatch[1], label: textMatch?.[1]?.trim() || fallbackLabel }
      : null;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return { href: trimmed, label: fallbackLabel };
  }

  return null;
};

const ReportLink = ({ value, label }) => {
  const parsed = resolveReportLink(value, label);
  if (!parsed?.href) {
    return <span className="text-gray-400 text-xs">Not Available</span>;
  }
  return (
    <a
      href={parsed.href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sky-600 hover:text-sky-800 underline text-[13px]"
    >
      {parsed.label}
    </a>
  );
};


const PrintEvaluationButton = ({ value }) => {
  const parsed = resolveReportLink(value, "Print Evaluation Report");
  if (!parsed?.href) return <span className="text-gray-400 text-xs">-</span>;
  return (
    <button
      onClick={() => window.open(parsed.href, "_blank", "noopener,noreferrer")}
      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded shadow-sm transition-colors"
    >
      Print Evaluation Report
    </button>
  );
};
const ResultStatusCandidateList = ({
  batchId: batchIdProp,
  subjectType: subjectTypeProp,
  subjectCode: subjectCodeProp,
  evaluationSubjectId: evaluationSubjectIdProp,
} = {}) => {
  const { color } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();


  const batchId = batchIdProp ?? searchParams.get("batchId") ?? searchParams.get("P1");
  const subjectType = subjectTypeProp ?? searchParams.get("subjectType") ?? searchParams.get("P2");
  const subjectCode = subjectCodeProp ?? searchParams.get("subjectCode") ?? searchParams.get("P3");

  const evaluationSubjectId =
    evaluationSubjectIdProp ??
    searchParams.get("evaluationSubjectId") ??
    searchParams.get("P4") ??
    "0";

  const [header, setHeader] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);


  const loadCandidateList = async () => {
    if (!batchId || !subjectType || !subjectCode) {
      SwalHelper.warning("Missing Information", "Required details are missing to load candidates.");
      return;
    }

    setLoading(true);
    try {
      const requestParams = {
        BatchID: batchId,
        ExamSubjectType: subjectType,
        SubjectCode: subjectCode,
        EvalutionSubjectID: evaluationSubjectId,
      };

      const res = await agent.get(GetCandidateForEvaluationMarksAPI, {
        params: requestParams,
      });

      const data = res?.data?.Data ?? {};


      const headerInfo = data.HeaderInfo ?? data.Table?.[0] ?? null;
      const subjectInfo = data.SubjectInfo ?? data.Table1?.[0] ?? null;
      const candidateRows = data.CandidateList ?? data.Table2 ?? [];

     
      const mergedHeader =
        headerInfo || subjectInfo ? { ...(headerInfo || {}), ...(subjectInfo || {}) } : null;

      setHeader(mergedHeader);
      setCandidates(candidateRows);

      if (candidateRows.length === 0) {
        SwalHelper.warning("No Data", "No candidates found for this subject.");
      }
    } catch (err) {
      SwalHelper.error("Error", "Failed to load candidate list. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    if (!batchId || !subjectType || !subjectCode) {
      SwalHelper.warning("Missing Information", "Required details are missing to download the report.");
      return;
    }

    setDownloading(true);
    try {
      const requestParams = {
        batchId: batchId,
        examSubjectType: subjectType,
        subjectCode: subjectCode,
        evaluationSubjectId: evaluationSubjectId,
      };

      const res = await agent.get(candidateForEvaluationMarksReportDownload, {
        params: requestParams,
        responseType: "blob",
      });

      const contentType = res?.headers?.["content-type"] || "application/octet-stream";
      const blob = new Blob([res.data], { type: contentType });

      const disposition = res?.headers?.["content-disposition"] || "";
      const filenameMatch = disposition.match(/filename\*?=(?:UTF-8''|")?([^";\n]+)"?/i);
      const fileName = filenameMatch?.[1]
        ? decodeURIComponent(filenameMatch[1])
        : `EvaluationMarksReport_${batchId}_${subjectCode}.pdf`;

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      SwalHelper.error("Error", "Failed to download the evaluation marks report. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    loadCandidateList();

  }, [batchId, subjectType, subjectCode, evaluationSubjectId]);


  const columns = [
    { key: "srNo", header: "Sr. No.", render: (_row, _col, index) => index + 1 },
    { key: "ApplicationIDDisplay", header: "ApplicationID" },
    { key: "CandidateName", header: "Candidate Name" },
    { key: "CandidateStatus", header: "Status" },
    { key: "Attendance", header: "Attendance" },
    { key: "ObtainedMarks", header: "Obtained Marks" },
    { key: "Result", header: "Result" },
    { key: "Remark", header: "Remark" },
    { key: "PrintEvaluationReport", header: "Evaluation Report" },
  ];

  const renderCandidateCell = (item, column) => {
    if (column.key === "PrintEvaluationReport") {
      return <PrintEvaluationButton value={item[column.key]} />;
    }
    return undefined;
  };

  return (
    <div className="w-full p-4">
      <fieldset className="rounded-lg border border-gray-300 bg-white shadow-lg mb-6">
        <div className="flex items-center justify-between pr-4">
          <legend
            className={`flex ${color} items-center text-base font-semibold text-white px-3 py-1.5 rounded-md ml-4`}
          >
            <FaFileAlt className="mr-2" />
            List of Candidates
          </legend>
          <div className="flex items-center gap-4">
            <button
              onClick={handleDownloadReport}
              disabled={downloading}
              className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-semibold px-3 py-1.5 rounded shadow-sm transition-colors"
            >
              <FaDownload />
              {downloading ? "Downloading..." : "Download Report"}
            </button>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-gray-900"
            >
              <FaArrowLeft /> Back
            </button>
          </div>
        </div>


        <div className="px-5 pt-4 pb-5">
          {loading && !header ? (
            <div className="text-sm text-gray-500 py-4">Loading details...</div>
          ) : !header ? (
            <div className="text-sm text-gray-400 py-4">
              No details found for this subject.
            </div>
          ) : (
            <>
              <div className="mb-2 text-[14px]">
                Course{" "}
                <span className="font-semibold text-gray-900">
                  {header?.CourseCode ?? "-"} - {header?.CourseName}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-1.5 mb-1.5 text-[14px]">
                <InfoItem label="Batch ID" value={header?.BatchID ?? batchId} />
                <InfoItem label="Batch Status" value={header?.BatchStatusName} />
                <InfoItem label="Exam Type" value={header?.ExamType} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-1.5 mb-1.5 text-[14px]">
                <InfoItem label="Batch Start Date" value={header?.BatchStartDate} />
                <InfoItem label="Batch End Date" value={header?.BatchEndDate} />
                <InfoItem label="Admission Last Date" value={header?.AdmissionLastDate} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-1.5 mb-1.5 text-[14px]">
                <InfoItem label="Admitted" value={header?.Admitted} />
                <InfoItem label="Approved" value={header?.Approved} />
                <InfoItem label="Examinee" value={header?.Examinee} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-1.5 mb-1.5 text-[14px]">
                <InfoItem label="Examination" value={header?.Examination} />
                <InfoItem label="Hall Ticket Issuance Date" value={header?.HallTicketIssuanceDate} />
                <InfoItem label="Exam Start Date" value={header?.ExamStartDate} />
              </div>

              <div className="mb-1.5 text-[14px]">
                Evaluation Center{" "}
                <span className="font-semibold text-gray-900">
                  {header?.TheoryCenter ?? header?.PracticalCenter ?? "-"}
                </span>
              </div>
              <div className="mb-3 text-[14px]">
                Training Institute{" "}
                <span className="font-semibold text-gray-900">
                  {header?.InstituteCenterCode} - {header?.InstituteCenter}
                </span>
              </div>

              <hr className="my-3" />

              <div className="mb-2 text-[14px]">
                Subject{" "}
                <span className="font-semibold text-gray-900">
                  {header?.SubjectCode ?? subjectCode} - {header?.SubjectName}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-1.5 mb-1.5 text-[14px]">
                <InfoItem label="Subject Type" value={header?.SubjectType ?? subjectType} />
                <InfoItem label="Date" value={header?.ExamDate} />
                <InfoItem label="Time" value={header?.ExamTime} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-1.5 mb-3 text-[14px]">
                <InfoItem label="Maximum Marks" value={header?.MaximumMarks} />
                <InfoItem label="Passing Marks" value={header?.MinimumMarks} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-1.5 text-[14px]">
                <div>
                  Attendance Report{" "}
                  <ReportLink value={header?.AttendanceReportPath} label="Attendance Report" />
                </div>
                <div>
                  Evaluation Report{" "}
                  <ReportLink value={header?.EvaluationReportPath} label="Evaluation Report" />
                </div>
              </div>
            </>
          )}
        </div>

        <hr />

 
        <div className="px-5 py-5">
          <FilteredTableComponent
            data={candidates}
            columns={columns}
            loading={loading}
            searchable={true}
            sortable={true}
            exportable={true}
            showSearch={true}
            showExport={true}
            showPDF={true}
            showExcel={true}
            renderCell={renderCandidateCell}
            exportFileName="CandidateList"
            tableTitle="List of Candidates"
            maxHeight="500px"
            stickyHeader={true}
            emptyStateMessage="No Data Found"
            emptyStateSubMessage="No candidates found for this subject."
          />
        </div>
      </fieldset>
    </div>
  );
};

export default ResultStatusCandidateList;