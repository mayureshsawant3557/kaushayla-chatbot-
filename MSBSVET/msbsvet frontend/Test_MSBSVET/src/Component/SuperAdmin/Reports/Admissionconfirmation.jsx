import React, { useState, useEffect, useContext } from "react";
import { useLoading } from "../../../Hooks/useLoading";
import agent from "../../../lib/api/agent";
import { GetInstituteIDByInstituteCode } from "../../../Endpoints_All/Base/Institute";
import FilteredTableComponent from "../../formcomponent/FilteredTableComponent";
import {
  reportingDetailsByInstitute,
  getAdmissionSummary,
  getCandidateIDByApplication,
  getCourseDetails,
  GetAdmissionApplicationStatus,
  getApplicationIDByApplicationIDDisplay,
  admissionApplicationStatus,
  getReportingDetails
} from "../../../Endpoints_All/Admission/admission";
import { Printer, Search, RefreshCw, AlertCircle } from "lucide-react";
import PrintAdmissionLetter from "./PrintAdmissionLetter";
import Swal from "sweetalert2";
import { ThemeContext } from "../../Context/ThemeContext";
import { GetCandidateName } from "../../../Endpoints_All/Base/masterData";
import { useAuth } from "../../../Hooks/AuthContext";

const PrintAdmissionConfirmationSlipPage = () => {
  const { startLoading, stopLoading } = useLoading();
  const { color } = useContext(ThemeContext);
   const {userInfo} = useAuth();
  const [state, setState] = useState({
    applicationNumber: "",
    searchResults: [],
    filteredResults: [],
    selectedApplication: null,
    selectedCandidate: null,
    errorMessage: "",
    loadingResults: false,
    showAdmissionList: false,
    instituteId: "",
    loadingPrint: false,
    hasSearched: false
  });

  const updateState = (updates) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  useEffect(() => {
    getInstituteId();
  
  }, []);

  const getInstituteId = async () => {
    try {
      const userLoginId = userInfo?.UserLoginID;

      if (!userLoginId) {
        updateState({ errorMessage: "User login ID not found in session" });
        return;
      }

      const response = await agent.get(GetInstituteIDByInstituteCode, {
        params: { InstituteCode: userLoginId }
      });

      const instituteId = response.data?.Data;

      if (instituteId) {
        updateState({ instituteId });
        await fetchAdmissionList(instituteId);
      } else {
        updateState({ errorMessage: "Institute ID not found for the logged in user" });
      }
    } catch (error) {
      console.error("Error getting institute ID:", error);
      updateState({ errorMessage: "Failed to connect to server. Please refresh the page." });
    }
  };

  const extractFromUrl = (proceedUrl, pattern) => {
    if (!proceedUrl) return null;
    const match = proceedUrl.match(pattern);
    return match?.[1] || null;
  };

  const extractEncryptedCandidateId = (proceedUrl) => {
    const id = extractFromUrl(proceedUrl, /P2=([^&]+)/);
    return id?.replace(/&lt;%/g, '').replace(/%&gt;/g, '') || null;
  };

  const extractCollegeId = (proceedUrl) => {
    const id = extractFromUrl(proceedUrl, /C2=(\d+)/);
    return id ? parseInt(id, 10) : null;
  };

  const fetchCandidateIDByApplication = async (applicationID) => {
    try {
      const response = await agent.get(getCandidateIDByApplication, {
        params: { ApplicationID: applicationID }
      });
      return response.data?.Data || 0;
    } catch (error) {
      console.error("Error fetching candidate ID:", error);
      return 0;
    }
  };

  const fetchAdmissionList = async (id) => {
    try {
      startLoading();
      updateState({ errorMessage: "" });

      const response = await agent.get(reportingDetailsByInstitute, {
        params: {
          instituteID: id,
          roundID: 1,
          flag: "PrintAdmissionLetter"
        }
      });

      const responseData = response.data?.Data || response.data;
 
      

      if (responseData?.length > 0) {
        const transformedData = responseData.map((item, index) => ({
          id: item.ApplicationID || index,
          applicationId: item.ApplicationIDDisplay || "N/A",
          candidateName: item.CandidateName || "N/A",
          collegeName: item.CollegeName || "N/A",
          courseName: item.CourseName || "N/A",
          courseCode: item.CourseCode || "N/A",
          district: item.District || "N/A",
          applicationDate: item.ApplicationDate || "N/A",
          mobileNo: item.MobileNo || "N/A",
          proceedUrl: item.ProceedURL || "",
           applicationID: item.ApplicationID || 0, 
          courseID: item.CourseID,
          roundID: item.RoundID || 1,
          candidateID: item.CandidateID || 0,
          collegeID: extractCollegeId(item.ProceedURL),
          collegeCode: item.CollegeCode || "",
          encryptedCandidateId: extractEncryptedCandidateId(item.ProceedURL),
          admissionDate: item.AdmissionDate || ""
        }));

        updateState({
          searchResults: transformedData,
          filteredResults: [],
          showAdmissionList: true,
          hasSearched: false
        });
      } else {
        updateState({
          showAdmissionList: true,
          searchResults: [],
          filteredResults: [],
          errorMessage: "",
          hasSearched: false
        });
      }
    } catch (error) {
      console.error("Error fetching admission list:", error);
      updateState({ errorMessage: "Failed to load admission list. Please try again." });
    } finally {
      stopLoading();
    }
  };

  const getApplicationID = async (applicationDisplayID) => {
    try {
      const response = await agent.get(
        getApplicationIDByApplicationIDDisplay,
        {
          params: {
            ApplicationIDDisplay: applicationDisplayID
          }
        }
      );

      return response.data?.Data || 0;
    } catch (error) {
      console.error("Error getting ApplicationID", error);
      return 0;
    }
  };

  const getAdmissionStatusMessage = async (applicationDisplayID) => {
    try {
      const applicationID = await getApplicationID(
        applicationDisplayID
      );

      if (!applicationID) {
        return "Application Form Number Not Found.";
      }

      const response = await agent.get(
        admissionApplicationStatus,
        {
          params: {
            ApplicationID: applicationID,
            CollegeID: state.instituteId,
            UserTypeID: userInfo?.UserTypeID
          }
        }
      );

      return response.data || "";
    } catch (error) {
      console.error(
        "Error fetching admission status:",
        error
      );

      return "Application Form Number Not Found.";
    }
  };

  const handleSearch = async () => {
    const { applicationNumber } = state;

    if (!applicationNumber.trim()) {
      updateState({
        filteredResults: [],
        selectedApplication: null,
        selectedCandidate: null,
        errorMessage: "Please enter Application Form Number",
        hasSearched: true
      });
      return;
    }

    updateState({
      loadingResults: true,
      errorMessage: "",
      hasSearched: true
    });

    try {
      const searchTerm = applicationNumber.trim().toLowerCase();

      const applicationID = await getApplicationID(applicationNumber);

      if (!applicationID) {
        updateState({
          errorMessage: "Application Form Number Not Found.",
          filteredResults: []
        });
        return;
      }

      const candidateID = await fetchCandidateIDByApplication(applicationID);
      const candidateName =
        await fetchCandidateName(candidateID);
      debugger;
      const response = await agent.get(getReportingDetails, {
        params: {
          candidateID,
          applicationID,
          encryptedApplicationID: applicationID.toString(),
          roundID: 1,
          reportingStatus: "Y",
          userLoginID: userInfo.UserLoginID,
          flag: "PrintAdmissionLetter"
        }
      });

      const data = response.data?.Data || response.data;
      

      if (data && data.length > 0) {
        const transformedData = data.map((item, index) => ({
          id: item.ApplicationID || index,
          applicationId: applicationNumber,
          candidateName: candidateName,
          collegeName: item.CollegeName,
          courseName: item.CourseName,
          courseCode: item.CourseCode,
          district: item.District,
          applicationDate: item.ApplicationDate,
          mobileNo: item.MobileNo,
          proceedUrl: item.ProceedURL,
          applicationID: applicationID,
          courseID: item.CourseID,
          collegeID: extractCollegeId(item.ProceedURL),
          admissionDate: item.AdmissionDate
        }));

        updateState({
          filteredResults: transformedData,
          selectedApplication:
            transformedData[0].applicationId,
          selectedCandidate:
            transformedData[0].candidateName,
          errorMessage: ""
        });
      }
      else {
        const statusMessage =
          await getAdmissionStatusMessage(applicationNumber);

        updateState({
          errorMessage:
            statusMessage ||
            "This candidate is not admitted in your college.",
          filteredResults: []
        });
      }

    } catch (error) {
      console.error(error);

      updateState({
        errorMessage: "Failed to search application",
        filteredResults: []
      });
    } finally {
      updateState({
        loadingResults: false
      });
    }
  };
  const fetchCandidateName = async (candidateID) => {
    try {
      const response = await agent.get(GetCandidateName, {
        params: {
          CandidateID: candidateID
        }
      });

      return response.data?.Data || "";
    } catch (error) {
      console.error("Error fetching candidate name:", error);
      return "";
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClearSearch = () => {
    updateState({
      applicationNumber: "",
      filteredResults: [],
      selectedApplication: null,
      selectedCandidate: null,
      errorMessage: "",
      hasSearched: false
    });
  };

  const fetchCourseDetails = async (courseId) => {
    if (!courseId) return {};
    try {
      const response = await agent.get(`/api/InstituteBase/GetCourseDetails/${courseId}`);
      return response.data?.Data || {};
    } catch (error) {
      console.error("Error fetching course details:", error);
      return {};
    }
  };

  const fetchAdmissionSummary = async (item) => {
    try {
      updateState({ loadingPrint: true });

      const userLoginId = userInfo?.UserLoginID || "";
      const candidateID = item.applicationID ? await fetchCandidateIDByApplication(item.applicationID) : 0;
      const collegeID = item.collegeID || extractCollegeId(item.proceedUrl);

      const params = {
        CandidateID: candidateID,
        ApplicationID: item.applicationID,
        CourseID: item.courseID,
        CollegeID: collegeID,
        RoundID: item.roundID,
        UserLoginID: userLoginId,
        ReportingStatus: "Y",
        Flag: "PrintAdmissionLetter"
      };

      const response = await agent.get(getAdmissionSummary, { params });
      const data = response.data?.Data || response.data;

      if (!data) return null;

      const primaryData = data.CandidatePrimarySummary || {};
      const allotmentData = data.AllotmentSummary || {};
      const documentsData = data.ListRequiredDocumentSummary || [];

      const courseId = allotmentData.CourseID || item.courseID;
      const courseDetails = await fetchCourseDetails(courseId);

      return {
        applicationId: primaryData.ApplicationID || item.applicationId || "",
        itiRegistrationNo: primaryData.ITIRegistrationNo || "",
        candidateName: [primaryData.FirstName, primaryData.MiddleName, primaryData.LastName]
          .filter(Boolean).join(" ").trim() || item.candidateName || "",
        gender: primaryData.Gender || "",
        dob: primaryData.DOB || "",
        aadhaarNo: primaryData.AadhaarNo || "",
        mobileNo: primaryData.MobileNo || item.mobileNo || "",
        altMobileNo: primaryData.AltMobileNo || "",
        email: primaryData.EMailID || "",
        photoPath: primaryData.PhotoFilePath || "",
        signaturePath: primaryData.SignFilePath || "",
        admissionDateTime: allotmentData.ReportedDateTime || allotmentData.AdmissionDate || item.admissionDate || "",
        instituteCode: allotmentData.AllottedChoiceCode || item.collegeCode || "",
        instituteName: allotmentData.AllottedCollege || item.collegeName || "",
        courseFee: allotmentData.CourseFee || "",
        paidCourseFee: allotmentData.PaidCourseFee || "",
        courseStartDate: allotmentData.CourseStartDate || "",
        courseCode: courseDetails.CourseCode || item.courseCode || "",
        courseName: courseDetails.Course || item.courseName || "",
        courseApprovedBy: courseDetails.CourseApprover || "",
        sector: courseDetails.Sector || "",
        subSector: courseDetails.SubSector || "",
        courseType: courseDetails.CourseType || "",
        fullTimePartTime: courseDetails.FullTimePartTime || "",
        duration: courseDetails.Duration && courseDetails.DurationUnit
          ? `${courseDetails.Duration} ${courseDetails.DurationUnit}` : "",
        minEntryQualification: courseDetails.MinimumEntryQualification || "",
        mandatoryCriteria: courseDetails.MandatoryCriteriaAtEntryQualification || "NA",
        minimumAge: courseDetails.MinimumAge?.toString() || "",
        intakePerUnit: courseDetails.IntakePerUnit?.toString() || allotmentData.Intake || "",
        nsqfLevel: courseDetails.NSQFLevel || "",
        trainingFeeCategory: courseDetails.TrainingFeeCategory?.toString() || "",
        documents: Array.isArray(documentsData) ? documentsData.map((doc) => ({
          documentName: doc.DocumentName || "",
          verificationStatus: doc.InstituteVerificationStatusDisplay || doc.InstituteVerificationStatus || "Pending",
          originalSubmitted: doc.IsOrignalSubmittedDisplay || doc.IsOrignalDocumentSubmitted || "No"
        })) : [],
        printedBy: userInfo?.UserName || userLoginId || "",
        printedOn: new Date().toLocaleString()
      };
    } catch (error) {
      console.error("Error fetching admission summary:", error);
      return null;
    } finally {
      updateState({ loadingPrint: false });
    }
  };

  // Function to get the complete HTML/CSS from PrintAdmissionLetter component
  const getPrintHTML = async (printData) => {
    // Create a temporary container
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '-9999px';
    document.body.appendChild(tempDiv);

    // Import ReactDOM and render the component
    const ReactDOM = await import('react-dom/client');
    const root = ReactDOM.createRoot(tempDiv);

    // Render the component
    root.render(<PrintAdmissionLetter data={printData} />);

    // Wait for render to complete
    await new Promise(resolve => setTimeout(resolve, 100));

    // Get the HTML content
    const htmlContent = tempDiv.innerHTML;

    // Clean up
    root.unmount();
    document.body.removeChild(tempDiv);

    return htmlContent;
  };

  // Function to extract all styles from the page
  const getAllStyles = () => {
    let styles = '';

    // Get all stylesheets
    const styleSheets = document.styleSheets;
    for (let i = 0; i < styleSheets.length; i++) {
      try {
        const rules = styleSheets[i].cssRules || styleSheets[i].rules;
        if (rules) {
          for (let j = 0; j < rules.length; j++) {
            styles += rules[j].cssText;
          }
        }
      } catch (e) {
        // CORS errors may occur, skip those stylesheets
      }
    }

    return styles;
  };

  // Handle print with window.open (preserving all styles)
  const handlePrintWithWindow = async (printData) => {
    const popupWidth = 1000;
    const popupHeight = 750;

    const left = (window.screen.width - popupWidth) / 2;
    const top = (window.screen.height - popupHeight) / 2;

    const printWindow = window.open(
      "",
      "PrintAdmissionLetter",
      `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );

    if (!printWindow) {
      Swal.fire("Popup Blocked", "Please allow popups for this website.", "warning");
      return false;
    }

    // Get the rendered HTML of the PrintAdmissionLetter component
    const printContent = await getPrintHTML(printData);

    // Get all styles from the parent page
    const allStyles = getAllStyles();

    // Write to the new window with all styles included
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Admission Confirmation Slip</title>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            /* Preserve all original styles */
            ${allStyles}
            
            /* Additional print-specific styles */
            @media print {
              body {
                margin: 0;
                padding: 20px;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .no-print {
                display: none !important;
              }
              button {
                display: none !important;
              }
            }
            
            /* Ensure proper page breaks */
            .page-break {
              page-break-before: always;
            }
            
            /* Preserve your original title sizes */
            h1, .text-3xl, .text-4xl, .text-5xl {
              font-size: inherit;
            }
          </style>
        </head>
        <body style="margin: 0; padding: 20px; background: white;">
          <div class="print-container" style="max-width: 1200px; margin: 0 auto;">
            ${printContent}
          </div>
          <script>
            // Auto-trigger print after content loads
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            };
            
            // Optional: Close after print (uncomment if needed)
            // window.onafterprint = function() {
            //   window.close();
            // };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
    return true;
  };

  const handlePrintClick = async (item) => {

    if (!item?.applicationID) {
      Swal.fire(
        "Validation",
        "Application Form Number Not Found",
        "warning"
      );
      return;
    }

    if (!item?.candidateID && !item?.applicationID) {
      Swal.fire(
        "Validation",
        "Candidate details not found",
        "warning"
      );
      return;
    }

    const summaryData = await fetchAdmissionSummary(item);

    if (!summaryData) {
      Swal.fire(
        "Validation",
        "This candidate is not admitted in your college.",
        "warning"
      );
      return;
    }

    const success = await handlePrintWithWindow(summaryData);

    if (!success) {
      updateState({
        errorMessage:
          "Failed to open print window. Please check popup settings."
      });
    }
  };

  const handleRefresh = () => {
    updateState({ errorMessage: "" });
    getInstituteId();
  };

  const renderCell = (item, column, rowIndex) => {
    if (column.key === 'serialNumber') return rowIndex + 1;
    if (column.key === 'action') {
      return (
      <button
                onClick={() => handlePrintClick(item)}
                disabled={state.loadingPrint}
                className="inline-flex items-center px-5 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors disabled:bg-blue-400 whitespace-nowrap"
                style={{ minWidth: '110px' }}
              >
                <Printer size={16} className="mr-1" />
          Print Confirmation Letter
        </button>
      );
    }
    return item[column.key] || "N/A";
  };

  const columns = [
    { key: 'serialNumber', header: 'Sr. No.', width: '60px', className: 'text-center', headerClassName: 'text-center', sortable: false },
    { key: 'applicationId', header: 'Application ID', width: '80px', className: 'text-left', headerClassName: 'text-left' },
    { key: 'candidateName', header: 'Candidate Name', width: '200px', className: 'text-left', headerClassName: 'text-left' },
    { key: 'collegeName', header: 'Institute Name', width: '300px', className: 'text-left', headerClassName: 'text-left' },
    { key: 'courseName', header: 'Course', width: '120px', className: 'text-left', headerClassName: 'text-left' },
    { key: 'courseCode', header: 'Course Code', width: '80px', className: 'text-center', headerClassName: 'text-center' },
    // { key: 'district', header: 'District', width: '120px', className: 'text-left', headerClassName: 'text-left' },
    // { key: 'applicationDate', header: 'Date of Application', width: '130px', className: 'text-center', headerClassName: 'text-center' },
    // { key: 'mobileNo', header: 'Mobile No', width: '120px', className: 'text-left', headerClassName: 'text-left' },
    { key: 'action', header: 'Print', width: '200px', className: 'text-center', headerClassName: 'text-center', sortable: false },

  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-xl shadow-md p-8">
        <fieldset className='mb-4 rounded-md border border-gray-300 p-4 bg-white'>
          <legend className={`flex items-center text-base font-semibold text-white border-2 border-gray-300 px-3 py-1.5 rounded-md ml-4 ${color}`}>
            Print Admission Confirmation Slip
          </legend>

          {state.errorMessage?.trim() && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
              <AlertCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
              <span className="flex-1">{state.errorMessage}</span>
              <button
                onClick={handleRefresh}
                className="inline-flex items-center px-3 py-1 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200 transition-colors flex-shrink-0"
              >
                <RefreshCw size={14} className="mr-1" />
                Retry
              </button>
            </div>
          )}

          <div className="flex flex-col items-center gap-4 mb-6 max-w-md mx-auto">
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search by Application Form Number
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={state.applicationNumber}
                  onChange={(e) => updateState({ applicationNumber: e.target.value })}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter application form number"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase"
                  style={{ textTransform: 'uppercase' }}
                  disabled={!state.instituteId && !state.errorMessage}
                />
                <button
                  onClick={handleSearch}
                  disabled={state.loadingResults || !state.instituteId}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400"
                  title="Search"
                >
                  <Search size={18} />
                </button>
                {state.applicationNumber && (
                  <button
                    onClick={handleClearSearch}
                    className="inline-flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    title="Clear Search"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
          {state.hasSearched &&
            state.filteredResults.length > 0 && (
              <div className="mt-6">
                {state.selectedApplication && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <span className="text-sm text-gray-600"> Application ID :</span>
                      <span className="ml-2 font-semibold text-gray-800">{state.selectedApplication}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Candidate Name :</span>
                      <span className="ml-2 font-semibold text-gray-800">{state.selectedCandidate}</span>
                    </div>
                  </div>
                )}

                <fieldset className='mb-4 rounded-md border border-gray-300 p-4 bg-white'>
                  <legend className={`flex items-center text-base font-semibold text-white border-2 border-gray-300 px-3 py-1.5 rounded-md ml-4 ${color}`}>
                    {state.applicationNumber ? 'Search Results' : 'All Admitted Students'}
                  </legend>

                  <FilteredTableComponent
                    data={state.filteredResults}
                    columns={columns}
                    renderCell={renderCell}
                    sortable={true}
                    searchable={true}
                    exportable={false}
                    showSearch={true}
                    tableId="admission-confirmation-table"
                    maxHeight="500px"
                    stickyHeader={true}
                    emptyStateMessage=""
                  />
                </fieldset>
              </div>
            )}
        </fieldset>
      </div>
    </div>
  );
};

export default PrintAdmissionConfirmationSlipPage;