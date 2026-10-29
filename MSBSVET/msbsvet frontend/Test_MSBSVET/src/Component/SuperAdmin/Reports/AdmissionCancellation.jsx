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
  admissionApplicationStatus,
  getApplicationIDByApplicationIDDisplay,
  getReportingDetails
} from "../../../Endpoints_All/Admission/admission";
import { Printer, Search, RefreshCw, AlertCircle } from "lucide-react";
import ReactDOM from 'react-dom/client';
import PrintAdmissionCancellationLetter from "./PrintAdmissionCancellationLetter";
import { ThemeContext } from "../../Context/ThemeContext";
import { GetCandidateName } from "../../../Endpoints_All/Base/masterData";
import { useAuth } from "../../../Hooks/AuthContext";

const PrintAdmissionCancellationSlipPage = () => {
  const { startLoading, stopLoading } = useLoading();
  const { color } = useContext(ThemeContext);
  const { userInfo } = useAuth();
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
        await fetchCancellationList(instituteId);
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
  const fetchCandidateName = async (candidateID) => {
    try {
      const response = await agent.get(GetCandidateName, {
        params: {
          CandidateID: candidateID
        }
      });

      return response.data?.Data || "";
    } catch (error) {
      console.error(error);
      return "";
    }
  };

  const fetchCancellationList = async (id) => {
    try {
      startLoading();
      updateState({ errorMessage: "" });

      const response = await agent.get(reportingDetailsByInstitute, {
        params: {
          instituteID: id,
          roundID: 1,
          flag: "PrintAdmissionCancellationLetter"
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
          applicationID: item.ApplicationID,
          courseID: item.CourseID,
          roundID: item.RoundID || 1,
          candidateID: item.CandidateID || 0,
          collegeID: extractCollegeId(item.ProceedURL),
          collegeCode: item.CollegeCode || "",
          encryptedCandidateId: extractEncryptedCandidateId(item.ProceedURL),
          cancellationDate: item.CancellationDate || "",
          reportedDateTime: item.ReportedDateTime || "",
          itiRegistrationNo: item.ITIRegistrationNo || "",
          gender: item.Gender || "",
          dob: item.DOB || "",
          aadhaarNo: item.AadhaarNo || "",
          email: item.EmailID || "",
          photoPath: item.PhotoFilePath || "",
          signaturePath: item.SignFilePath || "",
          courseFee: item.CourseFee || "0",
          paidCourseFee: item.PaidCourseFee || "0",
          refundFee: item.RefundFee || "0"
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
      console.error("Error fetching cancellation list:", error);
      updateState({ errorMessage: "Failed to load cancellation list. Please try again." });
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
      console.error("Error fetching admission status:", error);
      return "Application Form Number Not Found.";
    }
  };

  const handleSearch = async () => {
    const { applicationNumber, searchResults } = state;

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

      const candidateID =
        await fetchCandidateIDByApplication(applicationID);

      const candidateName =
        await fetchCandidateName(candidateID);



      const response = await agent.get(getReportingDetails, {
        params: {
          candidateID,
          applicationID,
          encryptedApplicationID: applicationID.toString(),
          roundID: 1,

          // IMPORTANT
          reportingStatus: "C",

          userLoginID: userInfo.UserLoginID,

          // IMPORTANT
          flag: "PrintAdmissionCancellationLetter"
        }
      });

      const data = response.data?.Data || response.data;

      if (data && data.length > 0) {

        const transformedData = data.map((item, index) => ({
          id: index,

          applicationId: applicationNumber,

          applicationID: applicationID,

          candidateID: candidateID,

          candidateName: candidateName,

          collegeName: item.CollegeName || "",

          courseName: item.CourseName || "",

          courseCode: item.CourseCode || "",

          proceedUrl: item.ProceedURL || "",

          courseID: item.CourseID,

          collegeID: extractCollegeId(item.ProceedURL),

          cancellationDate:
            item.CancellationDate || ""
        }));

        updateState({
          filteredResults: transformedData,
          selectedApplication: applicationNumber,
          selectedCandidate: candidateName,
          errorMessage: ""
        });

      } else {

        const statusMessage =
          await getAdmissionStatusMessage(applicationNumber);

        updateState({
          errorMessage:
            statusMessage ||
            "This candidate is not cancelled in your college.",
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

  const fetchCancellationSummary = async (item) => {
    try {
      const userLoginId = userInfo?.UserLoginID || "";
      const candidateID = item.candidateID || await fetchCandidateIDByApplication(item.applicationID);
      const collegeID = item.collegeID || extractCollegeId(item.proceedUrl);

      const params = {
        CandidateID: candidateID,
        ApplicationID: item.applicationID,
        CourseID: item.courseID,
        CollegeID: collegeID,
        RoundID: item.roundID,
        UserLoginID: userLoginId,
        ReportingStatus: "C",
        Flag: "PrintAdmissionCancellationLetter"
      };

      const response = await agent.get(getAdmissionSummary, { params });
      const data = response.data?.Data || response.data;

      if (!data) {
        const courseDetails = await fetchCourseDetails(item.courseID);

        return {
          applicationId: item.applicationId || "",
          itiRegistrationNo: item.itiRegistrationNo || "",
          candidateName: item.candidateName || "",
          gender: item.gender || "",
          dob: item.dob || "",
          aadhaarNo: item.aadhaarNo || "",
          mobileNo: item.mobileNo || "",
          altMobileNo: "",
          email: item.email || "",
          photoPath: item.photoPath || "",
          signaturePath: item.signaturePath || "",
          admissionConfirmationDateTime: item.reportedDateTime || "",
          instituteCode: item.collegeCode || "",
          instituteName: item.collegeName || "",
          courseCode: item.courseCode || courseDetails.CourseCode || "",
          courseName: item.courseName || courseDetails.Course || "",
          courseApprovedBy: courseDetails.CourseApprover || "MAHARASHTRA STATE BOARD OF SKILL, VOCATIONAL EDUCATION AND TRAINING (MSBSVET)",
          sector: courseDetails.Sector || "",
          subSector: courseDetails.SubSector || "",
          courseType: courseDetails.CourseType || "",
          fullTimePartTime: courseDetails.FullTimePartTime || "",
          cancellationDateTime: item.cancellationDate || "",
          cancellationComments: "",
          courseFee: item.courseFee || "0",
          paidCourseFee: item.paidCourseFee || "0",
          refundAmount: item.refundFee || "0",
          documents: [],
          printedBy: userInfo?.UserName || userLoginId || "",
          cancelledBy: "Student"
        };
      }

      const primaryData = data.CandidatePrimarySummary || {};
      const allotmentData = data.AllotmentSummary || {};
      const documentsData = data.ListRequiredDocumentSummary || [];

      const courseId = allotmentData.CourseID || item.courseID;
      const courseDetails = await fetchCourseDetails(courseId);

      return {
        applicationId: primaryData.ApplicationID || item.applicationId || "",
        itiRegistrationNo: primaryData.ITIRegistrationNo || item.itiRegistrationNo || "",
        candidateName: [primaryData.FirstName, primaryData.MiddleName, primaryData.LastName]
          .filter(Boolean).join(" ").trim() || item.candidateName || "",
        gender: primaryData.Gender || item.gender || "",
        dob: primaryData.DOB || item.dob || "",
        aadhaarNo: primaryData.AadhaarNo || item.aadhaarNo || "",
        mobileNo: primaryData.MobileNo || item.mobileNo || "",
        altMobileNo: primaryData.AltMobileNo || "",
        email: primaryData.EMailID || item.email || "",
        photoPath: primaryData.PhotoFilePath || item.photoPath || "",
        signaturePath: primaryData.SignFilePath || item.signaturePath || "",
        admissionConfirmationDateTime: allotmentData.ReportedDateTime || item.reportedDateTime || "",
        instituteCode: allotmentData.AllottedChoiceCode || item.collegeCode || "",
        instituteName: allotmentData.AllottedCollege || item.collegeName || "",
        courseCode: courseDetails.CourseCode || item.courseCode || "",
        courseName: courseDetails.Course || item.courseName || "",
        courseApprovedBy: courseDetails.CourseApprover || "MAHARASHTRA STATE BOARD OF SKILL, VOCATIONAL EDUCATION AND TRAINING (MSBSVET)",
        sector: courseDetails.Sector || "",
        subSector: courseDetails.SubSector || "",
        courseType: courseDetails.CourseType || "",
        fullTimePartTime: courseDetails.FullTimePartTime || "",
        cancellationDateTime: allotmentData.CancelledDateTime || item.cancellationDate || "",
        cancellationComments: allotmentData.CancellationComments || "",
        courseFee: allotmentData.CourseFee || item.courseFee || "0",
        paidCourseFee: allotmentData.PaidCourseFee || item.paidCourseFee || "0",
        refundAmount: allotmentData.RefundFee || item.refundFee || "0",
        documents: Array.isArray(documentsData) ? documentsData.map((doc) => ({
          documentName: doc.DocumentName || "",
          verificationStatus: doc.InstituteVerificationStatus === 'Y' ? 'Verified' :
            (doc.InstituteVerificationStatus === 'N' ? 'Not Verified' : 'Not Applicable'),
          originalSubmitted: doc.IsOrignalDocumentSubmitted === 'Y' ? 'Yes' :
            (doc.IsOrignalDocumentSubmitted === 'N' ? 'No' : 'Not Applicable'),
          originalReturned: doc.IsOrignalSubmittedReturn === 'Y' ? 'Yes' :
            (doc.IsOrignalSubmittedReturn === 'N' ? 'No' : 'Not Applicable')
        })) : [],
        printedBy: userInfo?.UserName || userLoginId || "",
        cancelledBy: "Student"
      };
    } catch (error) {
      console.error("Error fetching cancellation summary:", error);
      return null;
    }
  };

  // Function to get print HTML - similar to CancelAdmissionDetails
  const getCancellationPrintHTML = async (printData) => {
    if (!printData) {
      console.error("No print data provided");
      return "<div>Error: No data available for printing</div>";
    }


    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '-9999px';
    document.body.appendChild(tempDiv);

    const root = ReactDOM.createRoot(tempDiv);
    root.render(<PrintAdmissionCancellationLetter data={printData} />);

    await new Promise(resolve => setTimeout(resolve, 100));

    const htmlContent = tempDiv.innerHTML;

    root.unmount();
    document.body.removeChild(tempDiv);

    return htmlContent;
  };

  const getAllStyles = () => {
    let styles = '';
    try {
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
        }
      }
    } catch (e) {
    }
    return styles;
  };

  const handlePrintWithWindow = async (printData, candidateName) => {
    const popupWidth = 1000;
    const popupHeight = 750;

    const left = (window.screen.width - popupWidth) / 2;
    const top = (window.screen.height - popupHeight) / 2;

    const printWindow = window.open(
      "",
      "PrintAdmissionCancellationLetter",
      `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );

    if (!printWindow) {
      alert("Popup blocked! Please allow popups for this website.");
      return false;
    }

    const printContent = await getCancellationPrintHTML(printData);
    const allStyles = getAllStyles();

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
          <head>
              <title>Admission Cancellation Letter - ${candidateName}</title>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <script src="https://cdn.tailwindcss.com"></script>
              <style>
                  ${allStyles}
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
                  .page-break {
                      page-break-before: always;
                  }
              </style>
          </head>
          <body style="margin: 0; padding: 20px; background: white;">
              <div class="print-container" style="max-width: 1200px; margin: 0 auto;">
                  ${printContent}
              </div>
              <script>
                  window.onload = function() {
                      setTimeout(function() {
                          window.print();
                      }, 500);
                  };
              <\/script>
          </body>
      </html>
    `);

    printWindow.document.close();
    return true;
  };

  const handlePrintClick = async (item) => {
    if (!item) {
      updateState({ errorMessage: "No item selected for printing" });
      return;
    }

    updateState({ loadingPrint: true });

    const summaryData = await fetchCancellationSummary(item);

    if (summaryData) {
      const success = await handlePrintWithWindow(summaryData, item.candidateName);
      if (!success) {
        updateState({ errorMessage: "Failed to open print window. Please check popup settings." });
      }
    } else {
      updateState({ errorMessage: "Failed to load cancellation details for printing" });
    }

    updateState({ loadingPrint: false });
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
          Print Cancellation Letter
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
            Print Admission Cancellation Slip
          </legend>

          {state.errorMessage && (
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
                      <span className="text-sm text-gray-600">Searched Application ID :</span>
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
                    {state.applicationNumber ? 'Search Results' : 'All Cancelled Admissions'}
                  </legend>

                  {state.hasSearched ? (
                    <FilteredTableComponent
                      data={state.filteredResults}
                      columns={columns}
                      renderCell={renderCell}
                      sortable={true}
                      searchable={true}
                      exportable={false}
                      showSearch={true}
                      tableId="admission-cancellation-table"
                      maxHeight="500px"
                      stickyHeader={true}
                      emptyStateMessage=""
                    />
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Enter an Application Form Number and click Search to view results
                    </div>
                  )}
                </fieldset>
              </div>
            )}
        </fieldset>
      </div>
    </div>
  );
};

export default PrintAdmissionCancellationSlipPage;