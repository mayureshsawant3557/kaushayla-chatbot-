import React, { useState, useContext, useEffect } from "react";
import { ThemeContext } from "../../Context/ThemeContext";
import agent from "../../../lib/api/agent";
import FilteredTableComponent from "../../formcomponent/FilteredTableComponent";
import { FaFileAlt } from "react-icons/fa";
import { SwalHelper } from "../../../utils/swalHelper";
import {
  GetEvaluationForUnlock,
  UpdateEvaluationMarksUnlock,
} from "../../../Endpoints_All/Administration/admin";
import { useAuth } from "../../../Hooks/AuthContext";
import { getDeviceIP } from "../../../utils/CommonHelper";

const EvaluationStatus = () => {
  const { color } = useContext(ThemeContext);
  const { userInfo } = useAuth();

  const userLoginID = userInfo?.UserLoginID || 0;
  const userTypeID = userInfo?.UserTypeID || 0;

  const [batchID, setBatchID] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const [subjectType, setSubjectType] = useState("-1");

  const [showSearchPanel, setShowSearchPanel] = useState(true);

  const [hdnBatchID, setHdnBatchID] = useState(0);
  const [hdnSubjectCode, setHdnSubjectCode] = useState("");
  const [hdnSubjectType, setHdnSubjectType] = useState("");

  const [lblBatchID, setLblBatchID] = useState("");
  const [lblCourse, setLblCourse] = useState("");
  const [lblSubject, setLblSubject] = useState("");
  const [lblInstitute, setLblInstitute] = useState("");
  const [lblSubmissionStatus, setLblSubmissionStatus] = useState("");
  const [lblSubmittedDate, setLblSubmittedDate] = useState("");

  const [loading, setLoading] = useState(false);
  const [unlockLoading, setUnlockLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [ipAddress, setIpAddress] = useState("");

  const subjectTypeOptions = [
    { value: "-1", label: "-- Select --" },
    { value: "PRACTICAL", label: "PRACTICAL" },
    { value: "THEORY", label: "THEORY" },
    { value: "FORMATIVE", label: "FORMATIVE" },
  ];

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
  };

  const clearMessage = () => {
    setMessage("");
    setMessageType("");
  };



  //const ipAddress =  await getDeviceIP();
  const fetchIP = async () => {
    try {
      const ip = await getDeviceIP();

      setIpAddress(ip);
    } catch (err) {
    }
  };

  useEffect(() => {
    fetchIP();
  }, [])


  const clear = () => {
    setLblBatchID("");
    setLblCourse("");
    setLblSubject("");
    setLblInstitute("");
    setLblSubmissionStatus("");
    setLblSubmittedDate("");
    setHdnBatchID(0);
    setHdnSubjectCode("");
    setHdnSubjectType("");
    setBatchID("");
    setSubjectCode("");
    setSubjectType("-1");
    setShowSearchPanel(true);
  };

  const handleSearch = async () => {
    clearMessage();

    if (!batchID.trim() || !subjectCode.trim() || subjectType === "-1") {
      return;
    }

    const parsedBatchID = parseInt(batchID.trim(), 10);
    if (isNaN(parsedBatchID)) {
      showMessage("BatchID must be a valid number.", "danger");
      return;
    }

    try {
      setLoading(true);

      const res = await agent.get(
        `${GetEvaluationForUnlock}?batchID=${parsedBatchID}&subjectCode=${subjectCode.trim()}&subjectType=${subjectType}`
      );


      const result = res?.data;

      if (!result || (Array.isArray(result) && result.length === 0)) {
        showMessage("No Records Found !!.", "danger");
        return;
      }

      const row = Array.isArray(result) ? result[0] : result;

      if (!row) {
        showMessage("No Records Found !!.", "danger");
        return;
      }

      setHdnBatchID(parsedBatchID);
      setHdnSubjectCode(subjectCode.trim());
      setHdnSubjectType(subjectType);

      setLblBatchID(row.BatchID ?? row.batchID ?? "");
      setLblCourse(row.CourseDetails ?? row.courseDetails ?? row.CourseCode ?? row.courseCode ?? "");
      setLblSubject(row.SubjectDetails ?? row.subjectDetails ?? row.Subject ?? row.subject ?? "");
      setLblInstitute(row.InstituteDetails ?? row.instituteDetails ?? row.Institute ?? row.institute ?? "");
      setLblSubmissionStatus(row.SubmissionStatus ?? row.submissionStatus ?? "");
      setLblSubmittedDate(row.SubmittedDateTime ?? row.submittedDateTime ?? row.SubmissionDate ?? row.submissionDate ?? "");

      setShowSearchPanel(false);

    } catch (error) {
      showMessage(
        error?.response?.data?.message ?? error?.message ?? "Something went wrong. Please try again.",
        "danger"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = async () => {
    try {
      setUnlockLoading(true);

      if (!userInfo) {
        SwalHelper.error("Error", "User information not found.");
        return;
      }


      const res = await agent.post(UpdateEvaluationMarksUnlock, {
        batchID: hdnBatchID,
        subjectCode: hdnSubjectCode,
        userLoginID: userLoginID,
        ipAddress: ipAddress,
        subjectType: hdnSubjectType,
      });

      const returnValue = res?.data?.Data ?? res?.data ?? "";

      if (
        returnValue === "Y" ||
        returnValue?.toString().toUpperCase() === "Y" ||
        res?.data?.success === true
      ) {
        clear();
        showMessage("Unlocked Successfully.", "success");
      } else {
        showMessage(
          typeof returnValue === "string" && returnValue
            ? returnValue
            : "Failed to unlock. Please try again.",
          "danger"
        );
      }
    } catch (error) {
      showMessage(
        error?.response?.data?.message ??
        error?.message ??
        "Failed to unlock. Please try again.",
        "danger"
      );
    } finally {
      setUnlockLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    if (!status) return "bg-gray-200 text-gray-700";
    if (status.trim().toLowerCase() === "submitted") {
      return "bg-green-600 text-white";
    }
    return "bg-red-600 text-white";
  };

  const getAlertStyle = (type) => {
    switch (type) {
      case "success": return "bg-green-100 border border-green-400 text-green-800";
      case "danger": return "bg-red-100 border border-red-400 text-red-800";
      case "info": return "bg-blue-100 border border-blue-400 text-blue-800";
      default: return "";
    }
  };

  return (
    <div className="w-full p-4">

      {/* ── ONLY CHANGE: fieldset + legend wrapper ── */}
      <fieldset className="rounded-lg border border-gray-300 bg-white shadow-lg">

        <legend className={`flex ${color} items-center text-white px-3 py-1.5 rounded-md ml-4`}>
          <FaFileAlt className="mr-2" />
          Manage Evaluation Batch Subject Unlock
        </legend>

        <div className="px-4 pb-4 pt-3">

          {/* Alert Message */}
          {message && (
            <div className={`px-4 py-3 rounded mb-4 text-sm font-medium ${getAlertStyle(messageType)}`}>
              {message}
            </div>
          )}

          {/* Search Panel */}
          {showSearchPanel && (
            <div className="bg-white p-6 rounded-lg shadow mb-5">
              <h2 className="text-xl font-semibold mb-6">
                Evaluation Submission Status
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">

                <div>
                  <label className="block text-sm font-medium mb-1">
                    BatchID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={batchID}
                    placeholder="Enter BatchID"
                    onChange={(e) => setBatchID(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Subject Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={subjectCode}
                    placeholder="Enter Subject Code"
                    onChange={(e) => setSubjectCode(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Subject Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={subjectType}
                    onChange={(e) => setSubjectType(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-slate-400"
                  >
                    {subjectTypeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

              </div>

              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="bg-[#28a745] hover:bg-green-700 disabled:opacity-70 text-white px-8 py-2 rounded transition-colors"
                >
                  {loading ? "Searching..." : "Search"}
                </button>

                <button
                  onClick={clear}
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-700 disabled:opacity-70 text-white px-6 py-2 rounded transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          {/* Details Panel */}
          {!showSearchPanel && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-6">
                Evaluation Batch Subject Details
              </h2>

              <div className="space-y-4">

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Batch ID</label>
                  <div className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-800">
                    {lblBatchID || "—"}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Course Code</label>
                  <div className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-800">
                    {lblCourse || "—"}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Subject</label>
                  <div className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-800">
                    {lblSubject || "—"}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Institute</label>
                  <div className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-800">
                    {lblInstitute || "—"}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Submission Status
                    </label>
                    <div className={`w-full rounded px-3 py-2 font-semibold text-center ${getStatusStyle(lblSubmissionStatus)}`}>
                      {lblSubmissionStatus || "—"}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Submission Date
                    </label>
                    <div className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-800">
                      {lblSubmittedDate || "—"}
                    </div>
                  </div>

                </div>
              </div>

              <div className="flex justify-center space-x-4 mt-6">
                <button
                  onClick={handleUnlock}
                  disabled={unlockLoading}
                  className="bg-[#28a745] hover:bg-green-700 disabled:opacity-70 text-white px-8 py-2 rounded transition-colors"
                >
                  {unlockLoading ? "Unlocking..." : "Un Lock"}
                </button>

                <button
                  onClick={clear}
                  disabled={unlockLoading}
                  className="bg-red-600 hover:bg-red-700 disabled:opacity-70 text-white px-6 py-2 rounded transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          )}

        </div>
      </fieldset>
    </div>
  );
};

export default EvaluationStatus;