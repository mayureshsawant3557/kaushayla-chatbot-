import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import agent from '../../lib/api/agent';
import { useContext } from "react";
import { ThemeContext } from "../Context/ThemeContext";
import { FileText } from "lucide-react";
import FilteredTableComponent from "../formcomponent/FilteredTableComponent";
import DropdownComponent from "../formcomponent/DropdownComponent";
import { getIp } from "../../Endpoints_All/Utils/fileUpload";
import { useAuth } from "../../Hooks/AuthContext";

import Swal from 'sweetalert2';

import { AdmissionAPI } from "../../Endpoints_All/Admission/admission"
import { GetAdmissionYear, GetInstituteIDByInstituteCode } from '../../Endpoints_All/Institute/institute';
import { GetCourseByCollogeID } from '../../Endpoints_All/Base/masterData';
import { GetCollegeById } from '../../Endpoints_All/Administration/admin';
const CandidateListPendingForApproval = () => {
    const [searchParams] = useSearchParams();

    // State variables
    const [loading, setLoading] = useState(false);
    const [admissionYear, setAdmissionYear] = useState('');
    const [course, setCourse] = useState('1');
    const { color } = useContext(ThemeContext);

    const { userInfo } = useAuth();
    const user = userInfo;

    // Data states
    const [admissionYears, setAdmissionYears] = useState([]);
    const [courses, setCourses] = useState([]);
    const [candidateData, setCandidateData] = useState([]);
    const [selectedCandidates, setSelectedCandidates] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [ipAddress, setIpAddress] = useState("0.0.0.0");


    // UI states
    const [showExportButton, setShowExportButton] = useState(false);
    const [showSubmitButton, setShowSubmitButton] = useState(false);

    const [selectAll, setSelectAll] = useState(false);

    // API base URL
    const API_BASE_URL = AdmissionAPI;


    const isRowSelectable = (item) => {
        return (
            item.CurrentStatus === "Admitted" ||
            item.CurrentStatus === "Sent to DVETO"
        );
    };
    const handleSelectionChange = (selectedRows) => {
        setSelectedCandidates(
            selectedRows.map(row => row.CandidateID)
        );
    };
    // Load master data (courses and admission years)
    const loadMasters = useCallback(async () => {

        try {
            setLoading(true);

            const instituteIDResponse = await agent.get(
                GetInstituteIDByInstituteCode,
                {
                    params: {
                        InstituteCode: user.UserLoginID
                    }
                }
            );

            const instituteID = instituteIDResponse.data.Data;



            const response = await agent.get(GetAdmissionYear);

            const years =
                response.data?.Data ||
                response.data?.Table ||
                response.data ||
                [];

            setAdmissionYears(years);

            if (years.length > 0) {
                const yearId = years[0].YearId.toString();

                setAdmissionYear(yearId);

                await loadCourses(instituteID, yearId);
            }

        } catch (error) {
            // await agent.post(`${API_BASE_URL}/LogException`, {
            //     exception: error.message,
            //     source: 'LoadMasters',
            //     method: 'loadMasters'
            // });
            Swal.fire('Error', 'Failed to load master data', 'error');
        } finally {
            setLoading(false);
        }
    }, [user.UserLoginID]);

    const loadCourses = async (instituteID, admissionYearID) => {
        if (!admissionYearID) {
            setCourses([]);
            return;
        }

        const response = await agent.get(
            `${GetCollegeById}/${instituteID}/${admissionYearID}`
        );

        const responseData = response.data;

        const rawCourses =
            Array.isArray(responseData)
                ? responseData
                : Array.isArray(responseData?.Data)
                    ? responseData.Data
                    : [];

        setCourses([
            { CourseID: "1", CourseName: "ALL" },
            ...rawCourses
        ]);
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

    useEffect(() => {
        fetchIP();
    }, []);

    useEffect(() => {


        if (user.UserLoginID) {

            loadMasters();
        }
    }, [user, loadMasters]);
    // Get candidate list pending for DVETO approval
    const getCandidateListPendingForApprovalForDVETO = useCallback(async () => {
        try {
            setLoading(true);

            if (!admissionYear) return;

            // Step 1: Get Institute ID by Institute Code
            const instituteIDResponse = await agent.get(
                GetInstituteIDByInstituteCode,
                {
                    params: {
                        InstituteCode: user.UserLoginID
                    }
                }
            );


            const instituteID =
                instituteIDResponse.data?.Data ??
                instituteIDResponse.data;
            const pendingCandidatesResponse = await agent.get(
                "/api/Admission/pending-candidates-devto",
                {
                    params: {
                        courseID: Number(course),
                        collegeID: Number(instituteID),
                        admissionYearID: Number(admissionYear)
                    }
                }
            );



            const candidatesData =
                pendingCandidatesResponse.data?.Data ||
                pendingCandidatesResponse.data ||
                [];

            const transformedData = candidatesData.map((item, index) => ({
                id: item.CandidateID || index,
                serialNumber: index + 1,
                CandidateID: item.CandidateID,
                ApplicationID: item.ApplicationID,
                ApplicationIDDisplay: item.ApplicationIDDisplay,
                CandidateName: item.CandidateName,
                CourseName: item.CourseName,
                CurrentStatus: item.CurrentStatus,
                CourseID: item.CourseID,
                CollegeID: item.CollegeID
            }));

            setCandidateData(transformedData);
            if (transformedData.length === 0) {
                setShowResults(false);
            } else {
                setShowResults(true);
            }


            // Update UI states based on data availability
            if (candidatesData.length > 0) {
                setShowExportButton(true);
                setShowSubmitButton(true);
            } else {
                setShowExportButton(false);
                setShowSubmitButton(false);
                Swal.fire('Info', 'No Candidate Pending for DVETO Approval.', 'info');
            }

            // Reset selection states
            setSelectedCandidates([]);
            setSelectAll(false);

        } catch (error) {
            // await agent.post(`${API_BASE_URL}/LogException`, {
            //     exception: error.message,
            //     source: 'GetCandidateListPendingForApprovalForDVETO',
            //     method: 'getCandidateListPendingForApprovalForDVETO'
            // });
            Swal.fire('Error', 'Failed to load candidate list', 'error');
        } finally {
            setLoading(false);
        }
    }, [course, admissionYear, user.UserLoginID]);

    // Submit selected candidates to DVETO
    const handleSubmit = async () => {
        try {
            if (selectedCandidates.length === 0) {
                Swal.fire('Validation Error', 'Please select atleast one candidate to send for DVETO Approval.', 'warning');
                return;
            }

            setLoading(true);

            // Build selected candidates XML string
            let selectedCandidatesList = '<SelectedCandidates>';
            selectedCandidates.forEach(candidateId => {
                const candidate = candidateData.find(c => c.CandidateID === candidateId);
                if (candidate) {
                    selectedCandidatesList += `<Candidate><ApplicationID>${candidate.ApplicationID}</ApplicationID><CourseID>${candidate.CourseID}</CourseID><CollegeID>${candidate.CollegeID}</CollegeID></Candidate>`;
                }
            });
            selectedCandidatesList += '</SelectedCandidates>';



            const saveResponse = await agent.post(
                "/api/Admission/save-candidate-devto-status",
                {
                    XmlDoc: selectedCandidatesList,
                    UserLoginID: user.UserLoginID,
                    IPAddress: ipAddress
                }
            );


            const returnValue = saveResponse.data?.message;

            if (saveResponse.data?.message === "Y") {
                await getCandidateListPendingForApprovalForDVETO();
                Swal.fire(
                    "Success",
                    "Selected Candidates Send for DVETO Approvals.",
                    "success"
                );
            } else {
                Swal.fire('Error', returnValue, 'error');
            }

        } catch (error) {
            // await agent.post(`${API_BASE_URL}/LogException`, {
            //     exception: error.message,
            //     source: 'btnSubmit_Click',
            //     method: 'handleSubmit'
            // });
            Swal.fire('Error', 'Failed to submit candidates', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Recall selected candidates from DVETO
    const handleRecall = async () => {
        try {
            // Filter only candidates with "Sent to DVETO" status
            const recallableCandidates = selectedCandidates.filter(candidateId => {
                const candidate = candidateData.find(c => c.CandidateID === candidateId);
                return candidate && candidate.CurrentStatus === 'Sent to DVETO';
            });

            if (recallableCandidates.length === 0) {
                Swal.fire('Validation Error', "Please Select Atleast One Candidate to Recall Having Status 'Sent to DVETO'.", 'warning');
                return;
            }

            setLoading(true);

            // Build selected candidates XML string for recall
            let selectedCandidatesList = '<SelectedCandidates>';
            recallableCandidates.forEach(candidateId => {
                const candidate = candidateData.find(c => c.CandidateID === candidateId);
                if (candidate) {
                    selectedCandidatesList += `<Candidate><ApplicationID>${candidate.ApplicationID}</ApplicationID><CourseID>${candidate.CourseID}</CourseID><CollegeID>${candidate.CollegeID}</CollegeID></Candidate>`;
                }
            });
            selectedCandidatesList += '</SelectedCandidates>';

            // Get user host address

            const recallResponse = await agent.post(
                "/api/Admission/save-candidate-devto-status-recall",
                {
                    XmlDoc: selectedCandidatesList,
                    UserLoginID: user.UserLoginID,
                    IPAddress: ipAddress
                }
            );


            const returnValue = recallResponse.data;

            if (recallResponse.data?.message === "Y") {
                await getCandidateListPendingForApprovalForDVETO();
                Swal.fire(
                    "Success",
                    "Selected Candidates Recall from DVETO Approvals.",
                    "success"
                );
            } else {
                Swal.fire('Error', returnValue, 'error');
            }

        } catch (error) {
            // await agent.post(`${API_BASE_URL}/LogException`, {
            //     exception: error.message,
            //     source: 'btnRecall_Click',
            //     method: 'handleRecall'
            // });
            Swal.fire('Error', 'Failed to recall candidates', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Handle course selection change
    const handleCourseChange = async (selectedCourseId) => {
        setCourse(selectedCourseId);
        // This will trigger getCandidateListPendingForApprovalForDVETO via useEffect
    };

    // Handle admission year change
    const handleAdmissionYearChange = async (selectedYear) => {
        setAdmissionYear(selectedYear);
        setCourse("1");

        const instituteIDResponse = await agent.get(
            GetInstituteIDByInstituteCode,
            {
                params: {
                    InstituteCode: user.UserLoginID
                }
            }
        );

        const instituteID = instituteIDResponse.data.Data;

        await loadCourses(instituteID, selectedYear);
    };

    const handleReset = async () => {
        setShowResults(false);
        setCandidateData([]);
        setSelectedCandidates([]);
        setSelectAll(false);
        setShowSubmitButton(false);
        setShowExportButton(false);
        setCourse("1");

        try {
            const instituteIDResponse = await agent.get(
                GetInstituteIDByInstituteCode,
                {
                    params: {
                        InstituteCode: user.UserLoginID
                    }
                }
            );

            const instituteID = instituteIDResponse.data.Data;

            const response = await agent.get(GetAdmissionYear);

            const years =
                response.data?.Data ||
                response.data?.Table ||
                response.data ||
                [];

            setAdmissionYears(years);

            if (years.length > 0) {
                const yearId = years[0].YearId.toString();
                setAdmissionYear(yearId);
                await loadCourses(instituteID, yearId);
            }
        } catch (error) {
            Swal.fire("Error", "Failed to reset filters", "error");
        }
    };

    // Handle individual candidate selection
    const handleCandidateSelect = (candidateId, isChecked) => {
        if (isChecked) {
            setSelectedCandidates(prev => [...prev, candidateId]);
        } else {
            setSelectedCandidates(prev => prev.filter(id => id !== candidateId));
            setSelectAll(false);
        }
    };

    // Handle select all checkbox
    const handleSelectAll = (isChecked) => {
        setSelectAll(isChecked);
        if (isChecked) {
            // Select only candidates that can be selected (Admitted or Sent to DVETO status)
            const selectableIds = candidateData
                .filter(candidate => candidate.CurrentStatus === 'Admitted' || candidate.CurrentStatus === 'Sent to DVETO')
                .map(candidate => candidate.CandidateID);
            setSelectedCandidates(selectableIds);
        } else {
            setSelectedCandidates([]);
        }
    };

    const handleSearch = async () => {
        if (!admissionYear) {
            Swal.fire(
                "Validation Error",
                "Please select Admission Session",
                "warning"
            );
            return;
        }

        await getCandidateListPendingForApprovalForDVETO();

    };




    // Initialize component
    useEffect(() => {
        if (user.UserLoginID) {
            loadMasters();
        }
    }, [user.UserLoginID, loadMasters]);

    // // Load candidate data when course or admission year changes
    // useEffect(() => {
    //     if (course && admissionYear && user.UserLoginID) {
    //         getCandidateListPendingForApprovalForDVETO();
    //     }
    // }, [course, admissionYear, user.UserLoginID, getCandidateListPendingForApprovalForDVETO]);

    const renderCell = (item, column, rowIndex) => {

        if (column.key === "statusSelection") {

            if (
                item.CurrentStatus === "Approved by DVETO" ||
                item.CurrentStatus === "Rejected by DVETO"
            ) {
                return (
                    <span className="text-red-600 font-medium">
                        {item.CurrentStatus}
                    </span>
                );
            }

            return null;
        }

        if (column.key === "serialNumber") {
            return rowIndex + 1;
        }

        if (column.key === "ApplicationIDDisplay") {
            return (
                <a
                    href={`../Candidate/PrintApplicationForm.aspx?P1=${item.CandidateID}&P2=${item.CandidateID}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                >
                    {item.ApplicationIDDisplay}
                </a>
            );
        }

        return item[column.key];
    };

    const searchableColumns = [
        "ApplicationIDDisplay",
        "CandidateName",
        "CourseName",
        "CurrentStatus"
    ];
    const tableColumns = [
        {
            key: "statusSelection",
            header: "",
            width: "120px",
            sortable: false,
            searchable: false,
        },
        {
            key: "serialNumber",
            header: "Sr. No.",
            width: "80px",
        },
        {
            key: "ApplicationIDDisplay",
            header: "Application No.",
            width: "180px",
        },
        {
            key: "CandidateName",
            header: "Candidate Name",
            width: "300px",
        },
        {
            key: "CourseName",
            header: "Course Name",
            width: "250px",
        },
        {
            key: "CurrentStatus",
            header: "Action/Approval Status",
            width: "220px",
        }
    ];

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
                DVETO Approval Status
              </legend>
            </fieldset>

            <div className="p-6">
              {/* Filter Section */}
              <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
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
                  </div>
                  <div>
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
                  className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-gray-600"
                >
                  Reset
                </button>
              </div>
              {!showResults && !loading && (
                <div className="mt-6 text-center py-12 bg-white rounded-lg border border-gray-200">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500 text-lg">
                    Click Search to view candidates pending for DVETO approval
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    Select Admission Session and Course, then click Search
                  </p>
                </div>
              )}

              {/* Candidate List Table */}
              {showResults && candidateData.length > 0 && (
                <fieldset className="rounded-md border border-gray-300 p-4 bg-white">
                  <legend
                    className={`flex items-center text-base font-semibold text-white border-2 border-gray-300 px-3 py-1.5 rounded-md ml-4 ${color}`}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Candidate List Pending For DVETO Approval (
                    {candidateData.length})
                  </legend>

                  <div
                    className="mt-3 w-full"
                    style={{
                      minWidth: "100%",
                    }}
                  >
                    <FilteredTableComponent
                      data={candidateData}
                      columns={tableColumns}
                      renderCell={renderCell}
                      showCheckbox={true}
                      isRowSelectable={isRowSelectable}
                      onSelectionChange={handleSelectionChange}
                      sortable={true}
                      searchable={true}
                      exportable={true}
                      showExcel={true}
                      showPDF={false}
                      maxHeight="600px"
                    />
                  </div>
                </fieldset>
              )}

              {/* Action Buttons */}
              {showSubmitButton && (
                <div className="text-center pt-4 pb-4 space-x-4">
                  <button
                    onClick={handleSubmit}
                    disabled={loading || selectedCandidates.length === 0}
                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    {loading ? "Processing..." : "Send to DVETO"}
                  </button>
                  <button
                    onClick={handleRecall}
                    disabled={loading || selectedCandidates.length === 0}
                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    {loading ? "Processing..." : "Recall from DVETO"}
                  </button>
                </div>
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

export default CandidateListPendingForApproval;

// import agent from '../../lib/api/agent';
// import { AccountPassword, generateToken } from '../../Endpoints_All/Account/authentication';
// import { ASPXbaseURL } from '../../Endpoints_All/Config/baseConfig';
// import { getAccessToken } from '../../lib/api/authService';

// const CandidateListPendingForApproval = () => {
//     const [status, setStatus] = useState('Initializing...');
//     const [error, setError] = useState(null);

//     useEffect(() => {
//         const handleRedirect = async () => {
//             try {
//                 //// Step 1: Get user info from sessionStorage
//                 //setStatus('Retrieving user information...');
//                 //const userInfoAll = JSON.parse(sessionStorage.getItem("userInfoAll")) || {};
//                 //const userID = userInfoAll.UserID;
//                 //const userLoginID = userInfoAll.UserLoginID;

//                 //if (!userID || !userLoginID) {
//                 //    throw new Error('User information not found in session storage');
//                 //}

//                 //// Step 2: Get password from API
//                 //setStatus('Fetching user credentials...');
//                 //const passwordResponse = await agent.get(
//                 //    `${AccountPassword}/${userID}`
//                 //);
//                 //const password = passwordResponse.data?.Password;

//                 //if (!password) {
//                 //    throw new Error('Failed to retrieve password');
//                 //}

//                 //// Step 3: Generate token
//                 //setStatus('Generating authentication token...');
//                 //const tokenResponse = await agent.get(
//                 //    generateToken,
//                 //    {
//                 //        params: {
//                 //            userLoginId: userLoginID,
//                 //            password: password
//                 //        }
//                 //    }
//                 //);

//                 //const token = tokenResponse.data.token || tokenResponse.data;
//                 const token = getAccessToken();
//                 if (!token) {
//                     throw new Error('Failed to generate token');
//                 }

//                 // Step 4: Redirect to the target URL with token
//                 setStatus('Redirecting to application...');
//                 const targetUrl = `${ASPXbaseURL}/Admission/CandidateListPendingForApproval.aspx?token=${token}`;

//                 // Redirect to the URL with token as query parameter
//                 window.location.href = targetUrl;

//             } catch (err) {
//                 setError(err.message || 'An error occurred during redirect');
//                 setStatus('Error occurred');
//             }
//         };

//         handleRedirect();
//     }, []); // Empty dependency array ensures this runs once on mount

//     return (
//         <div style={styles.container}>
//             <div style={styles.card}>
//                 <div style={styles.spinner}></div>
//                 <h2 style={styles.title}>Redirecting...</h2>
//                 <p style={styles.status}>{status}</p>
//                 {error && (
//                     <div style={styles.errorContainer}>
//                         <p style={styles.errorText}>Error: {error}</p>
//                         <button
//                             style={styles.retryButton}
//                             onClick={() => window.location.reload()}
//                         >
//                             Retry
//                         </button>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// // Inline styles for the redirect page
// const styles = {
//     container: {
//         display: 'flex',
//         justifyContent: 'center',
//         alignItems: 'center',
//         minHeight: '100vh',
//         backgroundColor: '#f5f5f5',
//         fontFamily: 'Arial, sans-serif'
//     },
//     card: {
//         backgroundColor: 'white',
//         padding: '40px',
//         borderRadius: '8px',
//         boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
//         textAlign: 'center',
//         maxWidth: '400px',
//         width: '100%'
//     },
//     spinner: {
//         border: '4px solid #f3f3f3',
//         borderTop: '4px solid #3498db',
//         borderRadius: '50%',
//         width: '50px',
//         height: '50px',
//         animation: 'spin 1s linear infinite',
//         margin: '0 auto 20px'
//     },
//     title: {
//         color: '#333',
//         marginBottom: '10px',
//         fontSize: '24px'
//     },
//     status: {
//         color: '#666',
//         fontSize: '16px',
//         marginTop: '10px'
//     },
//     errorContainer: {
//         marginTop: '20px',
//         padding: '15px',
//         backgroundColor: '#fee',
//         borderRadius: '4px'
//     },
//     errorText: {
//         color: '#c33',
//         margin: '0 0 10px 0'
//     },
//     retryButton: {
//         backgroundColor: '#3498db',
//         color: 'white',
//         border: 'none',
//         padding: '10px 20px',
//         borderRadius: '4px',
//         cursor: 'pointer',
//         fontSize: '14px',
//         transition: 'background-color 0.3s'
//     }
// };

// // Add CSS for spinner animation
// const styleSheet = document.createElement("style");
// styleSheet.textContent = `
//     @keyframes spin {
//         0% { transform: rotate(0deg); }
//         100% { transform: rotate(360deg); }
//     }
// `;
// document.head.appendChild(styleSheet);

// export default CandidateListPendingForApproval;