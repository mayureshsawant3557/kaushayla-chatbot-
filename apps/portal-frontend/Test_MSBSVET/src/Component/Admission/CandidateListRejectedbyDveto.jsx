import React, { useState, useEffect, useCallback, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import Swal from "sweetalert2";
import { AdmissionAPI } from "../../Endpoints_All/Admission/admission";
import { GetInstituteIDByInstituteCode } from "../../Endpoints_All/Institute/institute";
import {
  GetCourseByCollogeID,
  GetAdmissionYear,
} from "../../Endpoints_All/Base/masterData";
import agent from "../../lib/api/agent";
import FilteredTableComponent from "../formcomponent/FilteredTableComponent";
import { ThemeContext } from "../Context/ThemeContext";
import DropdownComponent from "../formcomponent/DropdownComponent";
import { FileText } from "lucide-react";
import { GetCollegeById } from "../../Endpoints_All/Administration/admin";
import { getIp } from "../../Endpoints_All/Utils/fileUpload";
import { useAuth } from "../../Hooks/AuthContext";

const CandidateListRejectedbyDveto = () => {
  const [searchParams] = useSearchParams();

  // State variables
  const [loading, setLoading] = useState(false);
  const [ipAddress, setIpAddress] = useState("0.0.0.0");
  const [admissionYear, setAdmissionYear] = useState("");
  const [course, setCourse] = useState("1");
  const { color } = useContext(ThemeContext);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();

  // Data states
  const [admissionYears, setAdmissionYears] = useState([]);
  const [courses, setCourses] = useState([]);
  const [rejectedCandidates, setRejectedCandidates] = useState([]);

  const { userInfo } = useAuth();
  const user = userInfo;

  // API base URL
  const API_BASE_URL = AdmissionAPI;

  const tableColumns = [
    {
      key: "serialNumber",
      header: "Sr. No.",
      width: "80px",
    },
    {
      key: "Edit",
      header: "Application Form",
      width: "140px",
    },
    {
      key: "Resend",
      header: "Resend for Verification",
      width: "180px",
    },
    {
      key: "ApplicationIDDisplay",
      header: "Application No.",
      width: "220px",
    },
    {
      key: "CandidateName",
      header: "Candidate Name",
      width: "350px",
    },
    {
      key: "CourseName",
      header: "Course Stream",
      width: "300px",
    },
    {
      key: "YearDisplayName",
      header: "Admission Year",
      width: "150px",
    },
    {
      key: "CurrentStatus",
      header: "Status",
      width: "120px",
    },
    {
      key: "DVETReason",
      header: "DVETO Reason",
      width: "250px",
    },
  ];

  useEffect(() => {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}, []);

  const renderCell = (item, column, rowIndex) => {
    if (column.key === "serialNumber") {
      return rowIndex + 1;
    }

    if (column.key === "Edit") {
      return (
        <div className="flex justify-center items-center w-full">
          <button
            onClick={() =>
              handleEdit(
                item.CandidateID,
                item.ApplicationID,
                item.CollegeID,
                item.CourseID,
              )
            }
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            Edit
          </button>
        </div>
      );
    }
    if (column.key === "Resend") {
      return (
        <button
          onClick={() =>
            handleResend(
              item.CandidateID,
              item.ApplicationID,
              item.CollegeID,
              item.CourseID,
            )
          }
          className="px-2 py-2 bg-blue-600 text-white rounded whitespace-nowrap min-w-[250px]"
        >
          Resend for DVETO Verification
        </button>
      );
    }

    if (column.key === "ApplicationIDDisplay") {
      return <span>{item.ApplicationIDDisplay}</span>;
    }
    return item[column.key];
  };

  const handleReset = async () => {
     setAdmissionYear("");
    setCourse("1");
    setCourses([]);
    setRejectedCandidates([]);
    setShowResults(false);

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    try {
      const instituteIDResponse = await agent.get(
        GetInstituteIDByInstituteCode,
        {
          params: {
            InstituteCode: user.UserLoginID,
          },
        },
      );

      const instituteID =
        instituteIDResponse.data?.Data ?? instituteIDResponse.data;

      const yearsResponse = await agent.get(GetAdmissionYear);

      const years =
        yearsResponse.data?.Data ||
        yearsResponse.data?.Table ||
        yearsResponse.data ||
        [];

      setAdmissionYears(years);

      setAdmissionYear("");
      setCourses([]);
    } catch (error) {
      Swal.fire("Error", "Failed to reset filters", "error");
    }
  };

  const fetchIP = async () => {
    try {
      const response = await agent.get(getIp, {
        headers: {
          accept: "*/*",
        },
      });

      if (response.data?.ip) {
        setIpAddress(response.data.ip);
      } else {
        setIpAddress("0.0.0.0");
      }
    } catch (error) {
      setIpAddress("0.0.0.0");
    }
  };

  const loadMasters = useCallback(async () => {
    try {
      setLoading(true);

      const instituteIDResponse = await agent.get(
        GetInstituteIDByInstituteCode,
        {
          params: {
            InstituteCode: user.UserLoginID,
          },
        },
      );

      const instituteID =
        instituteIDResponse.data?.Data ?? instituteIDResponse.data;

      // Admission Years
      const yearsResponse = await agent.get(GetAdmissionYear);

      const years = yearsResponse.data?.Data || yearsResponse.data || [];

      setAdmissionYears(years);

      setAdmissionYear("");
      setCourses([]);
    } catch (error) {
      Swal.fire("Error", "Failed to load master data", "error");
    } finally {
      setLoading(false);
    }
  }, [user?.UserLoginID]);

  const loadCourses = async (instituteID, admissionYearID) => {
    if (!admissionYearID) {
      setCourses([]);
      return;
    }

    const response = await agent.get(
      `${GetCollegeById}/${instituteID}/${admissionYearID}`,
    );

    const rawCourses = response.data?.Data || response.data || [];

    setCourses([
      {
        CourseID: "1",
        CourseName: "ALL",
      },
      ...rawCourses,
    ]);
  };

const getRejectedCandidatebyDEVTO = useCallback(async () => {
  try {
    setLoading(true);

    const instituteIDResponse = await agent.get(
      GetInstituteIDByInstituteCode,
      {
        params: {
          InstituteCode: user.UserLoginID,
        },
      }
    );

    const collegeID =
      instituteIDResponse.data?.Data ?? instituteIDResponse.data;

    let candidatesData = [];

    if (admissionYear) {
      const response = await agent.get(
        "/api/Admission/rejected-candidates-devto",
        {
          params: {
            courseID: Number(course || 1),
            collegeID: Number(collegeID),
            admissionYearID: Number(admissionYear),
          },
        }
      );

      candidatesData = response.data?.Data || response.data || [];
    } else {
      const yearRequests = admissionYears.map((year) =>
        agent.get(
          "/api/Admission/rejected-candidates-devto",
          {
            params: {
              courseID: Number(course || 1),
              collegeID: Number(collegeID),
              admissionYearID: Number(year.YearId),
            },
          }
        )
      );

      const responses = await Promise.all(yearRequests);

      candidatesData = responses.flatMap(
        (response) => response.data?.Data || response.data || []
      );
    }

    setRejectedCandidates(candidatesData);
    setShowResults(true);

    if (candidatesData.length === 0) {
      Swal.fire(
        "Info",
        "No Candidate Rejected by DVETO.",
        "info"
      );
    }
  } catch (error) {
    console.error(error);
    Swal.fire(
      "Error",
      "Failed to load rejected candidates",
      "error"
    );
  } finally {
    setLoading(false);
  }
}, [course, admissionYear, admissionYears, user?.UserLoginID]);

  // Handle course selection change
  const handleCourseChange = async (selectedCourseId) => {
    setCourse(selectedCourseId);
    // This will trigger getRejectedCandidatebyDEVTO via useEffect
  };

  // Handle admission year change
  const handleAdmissionYearChange = async (selectedYear) => {
    setAdmissionYear(selectedYear);
    setCourse("1");

    const instituteIDResponse = await agent.get(GetInstituteIDByInstituteCode, {
      params: {
        InstituteCode: user.UserLoginID,
      },
    });

    const instituteID =
      instituteIDResponse.data?.Data ?? instituteIDResponse.data;

    await loadCourses(instituteID, selectedYear);
  };

  const handleEdit = (candidateId, applicationId, collegeId, courseId) => {
    navigate(
      `/Candidate/LockApplicationForm?candidateId=${candidateId}&applicationId=${applicationId}`,
    );
  };

  // Handle Resend button click
  const handleResend = async (
    candidateId,
    applicationId,
    collegeId,
    courseId,
  ) => {
    try {
      setLoading(true);

      let selectedCandidatesList = "<SelectedCandidates>";

      selectedCandidatesList += `
            <Candidate>
                <ApplicationID>${applicationId}</ApplicationID>
                <CourseID>${courseId}</CourseID>
                <CollegeID>${collegeId}</CollegeID>
            </Candidate>`;

      selectedCandidatesList += "</SelectedCandidates>";

      const response = await agent.post(
        "/api/Admission/save-candidate-devto-status",
        {
          XmlDoc: selectedCandidatesList,
          UserLoginID: user.UserLoginID,
          IPAddress: ipAddress,
        },
      );

      const returnValue = response.data?.message;

      if (returnValue === "Y") {
        await getRejectedCandidatebyDEVTO();

        Swal.fire(
          "Success",
          "Selected Candidate Sent for DVETO Approval.",
          "success",
        );
      } else {
        Swal.fire(
          "Error",
          returnValue || "Failed to resend candidate.",
          "error",
        );
      }
    } catch (error) {
      Swal.fire("Error", "Failed to resend candidate", "error");
    } finally {
      setLoading(false);
    }
  };
  const handleSearch = async () => {
  await getRejectedCandidatebyDEVTO();
};

  // Initialize component
  useEffect(() => {
    fetchIP();
    if (user.UserLoginID) {
      loadMasters();
    }
  }, [user.UserLoginID, loadMasters]);

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-visible">
          {/* Header */}
          <fieldset className="mb-4 p-0 bg-transparent border-0">
            <legend
              className={`flex items-center text-base font-semibold text-white border-2 border-gray-300 px-3 py-1.5 rounded-md ml-4 ${color}`}
            >
              <FileText className="w-4 h-4 mr-2" />
              DVETO Rejected Candidates
            </legend>
          </fieldset>

          <div className="p-6">
            {/* Filter Section */}
            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DropdownComponent
                  label="Admission Session"
                  value={admissionYear}
                  onChange={handleAdmissionYearChange}
                  options={admissionYears.map((year) => ({
                    value: year.YearId,
                    label: year.YearDisplayName,
                  }))}
                  placeholder="Select Admission Session"
                />

                <DropdownComponent
                  label="Course Name"
                  value={course}
                  onChange={handleCourseChange}
                  options={courses.map((item) => ({
                    value: item.CourseID,
                    label: item.CourseName,
                  }))}
                  placeholder="Select Course"
                />
              </div>
            </div>

            <div className="flex justify-center mt-4 gap-3">
              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-8 py-2.5 bg-green-600 text-white rounded-md hover:bg-green-700 "
              >
                {loading ? "Searching..." : "Search"}
              </button>

              <button
                onClick={handleReset}
                disabled={loading}
                className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-500"
              >
                Reset
              </button>
            </div>
            {!showResults && !loading && (
              <div className="mt-6 text-center py-12 bg-white rounded-lg border border-gray-200">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />

                <p className="text-gray-500 text-lg">
                  Click Search to view candidates rejected by DVETO
                </p>

                <p className="text-gray-400 text-sm mt-2">
                  Select Admission Session and Course, then click Search
                </p>
              </div>
            )}

            {showResults && rejectedCandidates.length > 0 && (
              <fieldset className="rounded-md border border-gray-300 p-4 bg-white">
                <legend
                  className={`flex items-center text-base font-semibold text-white border-2 border-gray-300 px-3 py-1.5 rounded-md ml-4 ${color}`}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Candidate List Rejected By DVETO ({rejectedCandidates.length})
                </legend>

                <FilteredTableComponent
                  data={rejectedCandidates.map((item, index) => ({
                    ...item,
                    serialNumber: index + 1,
                  }))}
                  columns={tableColumns}
                  renderCell={renderCell}
                  sortable={true}
                  searchable={true}
                  exportable={true}
                  showExcel={true}
                  showPDF={false}
                  maxHeight="600px"
                />
              </fieldset>
            )}

            {/* Loading State */}
            {loading && (
              <div className="text-center py-8">
                <p className="text-gray-500">Loading...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateListRejectedbyDveto;
