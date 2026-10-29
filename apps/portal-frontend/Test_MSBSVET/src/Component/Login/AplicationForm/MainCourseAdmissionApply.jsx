import { useState, useEffect, useContext } from "react";
import {
  FileText,
  Unlock,
  DollarSign,
  Clock,
  User,
  CreditCard,
  X,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import agent from "../../../lib/api/agent";
import DropdownComponent from "../../formcomponent/DropdownComponent";
import { sha256 } from 'js-sha256';
import { baseURL } from '../../../Endpoints_All/config/baseConfig';
import { GetAppliedMainCourse, GetMainCourseAppliedFor, SaveAppliedMainCourse } from '../../../Endpoints_All/Candidate/courseApplication';
import {
  GetCurrentAdmissionYearForApplication,
  GetApplicationIDByApplicationIDDisplay
} from '../../../Endpoints_All/Admission/admission';
import { GetMasterMainCourse } from '../../../Endpoints_All/Base/masterData';
import Candidate_PrintApplicationForm from '../../PrintApplicationForm/Candidate_PrintApplicationForm';
import Swal from 'sweetalert2';
import ReactDOM from 'react-dom/client';
import { getDeviceIP } from '../../../utils/CommonHelper';
import { useAuth } from '../../../Hooks/AuthContext';
import { getAdmissionSummary, getReportingDetails } from '../../../Endpoints_All/Admission/admission';
import PrintAdmissionLetter from '../../SuperAdmin/Reports/PrintAdmissionLetter'; // adjust path to wherever it actually lives
import Loader from '../../formcomponent/Loader';
import PrintApplicationForm from '../../PrintApplicationForm/PrintApplicationForm';
import { ThemeContext } from "../../Context/ThemeContext";
import PrintAdmissionCancellationLetter from "../../SuperAdmin/Reports/PrintAdmissionCancellationLetter";
import PrintAdmissionRejectionLetter from "../../SuperAdmin/Reports/PrintAdmissionRejectionLetter";

const TrainingApplicationSystem = () => {
  const { color } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [admissionSession, setAdmissionSession] = useState("");
  const [admissionSessions, setAdmissionSessions] = useState([]);
  const [courseCategories, setCourseCategories] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [admissionSessionsLoading, setAdmissionSessionsLoading] =
    useState(false);
  const [ipAddress, setIpAddress] = useState("0.0.0.0");




  const [showApplicationTypeModal, setShowApplicationTypeModal] = useState(false);
  const [selectedApplicationType, setSelectedApplicationType] = useState(null);


  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState('');

  const { userInfo } = useAuth();
  const candidateId = userInfo?.UserLoginID;
  const userID = userInfo?.UserID;


  const api = agent.create({
    baseURL: baseURL,
    headers: {
      'Content-Type': 'application/json',
    }
  });

  // Show alert message for few seconds
  const showAlert = (message, type = "error") => {
    setAlertMessage(message);
    setAlertType(type);
    setTimeout(() => {
      setAlertMessage(null);
      setAlertType("");
    }, 5000); // Hide after 5 seconds
  };

  useEffect(() => {
    fetchIP();
  }, []);



  const fetchIP = async () => {
    try {
      const ip = await getDeviceIP();
      setIpAddress(ip);
    } catch (err) {
      console.error("Failed to get IP:", err);
    }
  };

  // Fetch admission years/sessions
  const fetchAdmissionSessions = async () => {
    try {
      setAdmissionSessionsLoading(true);
      const response = await api.get(GetCurrentAdmissionYearForApplication);

      let admissionData = response.data;

      if (admissionData.Data && Array.isArray(admissionData.Data)) {
        admissionData = admissionData.Data;
      } else if (!Array.isArray(admissionData)) {
        if (admissionData.data && Array.isArray(admissionData.data)) {
          admissionData = admissionData.data;
        } else if (
          admissionData.result &&
          Array.isArray(admissionData.result)
        ) {
          admissionData = admissionData.result;
        } else if (admissionData.items && Array.isArray(admissionData.items)) {
          admissionData = admissionData.items;
        } else {
          console.error(
            "API response is not in expected format:",
            admissionData,
          );
          setAdmissionSessions([]);
          return;
        }
      }

      const transformedSessions = admissionData.map((session) => ({
        label:
          session.YearDisplayName ||
          session.yearDisplayName ||
          session.YearName ||
          session.yearName ||
          session.displayName ||
          session.name,
        value:
          session.YearId ||
          session.yearId ||
          session.id ||
          session.YearName ||
          session.yearName,
      }));

      setAdmissionSessions(transformedSessions);

      // Set current session as default
      const currentSession = admissionData.find(
        (session) => session.isCurrent === true || session.isactive === true,
      );
      if (currentSession && !admissionSession) {
        const sessionValue =
          currentSession.YearId ||
          currentSession.yearId ||
          currentSession.id ||
          currentSession.YearName ||
          currentSession.yearName;
        setAdmissionSession(sessionValue);
      }
    } catch (error) {
      console.error("Error fetching admission sessions:", error);
      showAlert(
        "Error fetching admission sessions. Please try again.",
        "error",
      );
      setAdmissionSessions([]);
    } finally {
      setAdmissionSessionsLoading(false);
    }
  };

  // Fetch course categories
  const fetchCourseCategories = async () => {
    try {
      setCoursesLoading(true);
      const response = await api.get(GetMasterMainCourse);

      let courseData = response.data;

      if (courseData.Data && Array.isArray(courseData.Data)) {
        courseData = courseData.Data;
      } else if (!Array.isArray(courseData)) {
        if (courseData.data && Array.isArray(courseData.data)) {
          courseData = courseData.data;
        } else if (courseData.result && Array.isArray(courseData.result)) {
          courseData = courseData.result;
        } else if (courseData.items && Array.isArray(courseData.items)) {
          courseData = courseData.items;
        } else {
          console.error("API response is not in expected format:", courseData);
          setCourseCategories([]);
          return;
        }
      }

      const transformedOptions = courseData.map((course) => ({
        label:
          course.MainCourseName ||
          course.mainCourseName ||
          course.name ||
          course.courseName ||
          course.title ||
          course.CourseName ||
          course.CourseTitle,
        value:
          course.MainCourseId ||
          course.mainCourseId ||
          course.id ||
          course.courseId ||
          course.CourseId ||
          course.ID,
      }));

      setCourseCategories(transformedOptions);

      // ALWAYS Set first course as default
      if (transformedOptions.length > 0) {
        setSelectedCourse(transformedOptions[0].value);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      showAlert("Error fetching courses. Please try again.", "error");
      setCourseCategories([]);
    } finally {
      setCoursesLoading(false);
    }
  };

  // to print form for candidate 
  const handlePrintProfile = (applicationIdDisplay) => {

    const candidateID = userInfo?.UserID;
    const userLoginID = userInfo?.UserLoginID;

    if (!candidateID) {
      Swal.fire("Error", "Candidate ID not found", "error");
      return;
    }

    const printWindow = window.open(
      "",
      "_blank",
      "width=1200,height=800,left=100,top=100",
    );

    if (!printWindow) {
      Swal.fire("Error", "Please allow pop-ups for this website", "error");
      return;
    }

    printWindow.document.write(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${applicationIdDisplay}- Application Form</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet">
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
                <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@100;200;300;400;500;600;700;800;900&display=swap" rel="stylesheet">
                <style>
                    body { font-family: 'Poppins', sans-serif; margin: 0; padding: 0; }
                    #root { width: 100%; }
                    /* Staff_PrintApplicationForm.css */

body {
    line-height: normal;
}

.staff-print-application-form {
    font-family: 'Poppins', sans-serif;
    padding: 20px;
    background-color: #fff;
}

.application-form {
    width: 100%;
    font-size: 12px;
    border: 1px solid #c5d3d3;
    margin-bottom: 0px;
}

    .application-form th {
        background-color: #f0f1f4;
        border: 1px solid #c5d3d3;
        font-weight: 600;
        color: #000;
        padding: 0.25rem;
    }

    .application-form td {
        border: 1px solid #c5d3d3;
        vertical-align: middle;
        color: #000;
        padding: 0.25rem;
    }

.table {
    margin: 0px;
}

    .table th {
        padding: 0.25rem;
    }

    .table td {
        padding: 0.25rem;
    }

.GridView {
    margin: 0px;
    width: 100%;
}

    .GridView th {
        border: 1px solid #eeeeee;
        padding: 3px;
        font-size: 12px;
        font-weight: 500;
        vertical-align: middle;
        background-color: #f0f1f4;
    }

    .GridView td {
        border: 1px solid #eeeeee;
        padding: 3px;
        font-size: 12px;
    }

.sub-title {
    font-size: 12px;
}

.main-title {
    font-size: 14px;
}

.main-title1 {
    font-size: 18px;
    font-weight: 600;
}

.labelFont {
    font-weight: 600 !important;
}

.text-lg {
    font-size: 16px;
}

.empty-data {
    text-align: center;
    padding: 20px;
    font-size: 14px;
    font-weight: 600;
    color: #666;
}

/* Action Buttons */
.action-buttons {
    display: flex;
    justify-content: center;
    gap: 15px;
    margin-bottom: 20px;
    padding: 15px;
    background-color: #f8f9fa;
    border-radius: 8px;
}

    .action-buttons .btn {
        padding: 10px 20px;
        font-size: 14px;
        font-weight: 500;
        border-radius: 6px;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: all 0.3s ease;
    }

        .action-buttons .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }

    .action-buttons .btn-secondary {
        background-color: #6c757d;
        border-color: #6c757d;
        color: #fff;
    }

    .action-buttons .btn-primary {
        background-color: #0d6efd;
        border-color: #0d6efd;
        color: #fff;
    }

    .action-buttons .btn-danger {
        background-color: #dc3545;
        border-color: #dc3545;
        color: #fff;
    }

/* Loading and Error States */
.loading-container,
.error-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 400px;
    padding: 20px;
}

    .error-container .alert {
        max-width: 600px;
        width: 100%;
    }

/* Print Styles */
@media print {
    .no-print {
        display: none !important;
    }

    .staff-print-application-form {
        padding: 0;
    }

    body {
        margin: 0;
        padding: 0;
    }

    .application-form {
        page-break-inside: avoid;
    }

    table {
        page-break-inside: auto;
    }

    tr {
        page-break-inside: avoid;
        page-break-after: auto;
    }
}
.sub-title {
    font-size: 12px;
}.main-title {
    font-size: 14px;
}.main-title1 {
    font-size: 18px;
}
.logo-image {
    width: 90px;
}
.india-logo {
    width: 60px;
}
.me-3 {
    margin-right: 1rem !important;
}
/* Responsive adjustments */
@media screen and (max-width: 768px) {
    .application-form {
        font-size: 10px;
    }

    .action-buttons {
        flex-direction: column;
    }

        .action-buttons .btn {
            width: 100%;
            justify-content: center;
        }
}

                </style>
            </head>
           <body>
                <div id="root">Loading...</div>
            </body>
            </html>
        `);

    printWindow.document.close();

    printWindow.onload = () => {
      const container = printWindow.document.getElementById("root");
      const root = ReactDOM.createRoot(container);

      const handleReadyToPrint = () => {
        setTimeout(() => {
          printWindow.focus();
          printWindow.print();
        }, 300);
      };

      root.render(
        <PrintApplicationForm
          candidateID={candidateID}
          userLoginID={userLoginID}
          pageCode="CANDIDATE_PRINT"
          onReadyToPrint={handleReadyToPrint}
          applicationIdDisplay={applicationIdDisplay}
        />
      );
    };
  };

  // Fetch applied courses
  const fetchAppliedCourses = async () => {
    try {
      setLoading(true);

      const response = await agent.get(
        `${GetAppliedMainCourse}?candidateId=${userID}`,
      );
      const data = await response.data;

      const applicationsData = data.Data;


      const transformedApplications = applicationsData.map(app => ({
        id: app.ApplicationID,
        applicationId: app.ApplicationIDDisplay,
        applicationIdDisplay: app.ApplicationIDDisplay,
        courseCategory: app.MainCourseName,
        LastModifiedOn: app.LastModifiedOn || "N/A",
        amount: parseFloat(app.AmountPaid || 0),
        PaymentDate: app.PaymentDate || "N/A",
        status: app.PaymentStatus || "Unknown",
        isUnlocked: app.IsUnlock === 1,
        isLocked: app.IsLock === 1,
        isFeePaid: app.IsFeePaid === 1,
        isApplied: app.IsApplied === 1,
        mainCourseId: app.MainCourseID,
        candidateId: app.CandidateID,
        admissionYearId: app.AdmissionYearID,
        optionsLink: app.OptionsLink || "",
        transactionUrl: app.ResponseUrl || '---',
        isAdmittd: app.IsAdmitted || 0,
        reportingStatus: app.ReportingStatus || "",
      }));

      setApplications(transformedApplications);
    } catch (error) {
      console.error("Error fetching applied courses:", error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  // Open modal when Apply Course is clicked
  const handleApplyCourseClick = () => {
    if (!selectedCourse) {
      showAlert("Please select a course category", "error");
      return;
    }

    if (!admissionSession) {
      showAlert("Please select an admission session", "error");
      return;
    }

    // Reset selection and show modal
    setSelectedApplicationType(null);
    setShowApplicationTypeModal(true);
  };

  // Submit application after type selection
  const submitApplication = async () => {
    if (selectedApplicationType === null) {
      showAlert("Please select an application type", "error");
      return;
    }

    try {
      setLoading(true);
      setShowApplicationTypeModal(false);

      const selectedCourseObj = courseCategories.find(
        (course) => course.value === selectedCourse,
      );
      const mainCourseName = selectedCourseObj ? selectedCourseObj.label : "";

      const applicationData = {
        candidateID: userID,
        mainCourseID: parseInt(selectedCourse),
        mainCourseName: mainCourseName,
        admissionYearID: parseInt(admissionSession),
        applicationID: 0,
        profileID: userInfo.UserLoginID,
        isUnlock: 0,
        isLock: 0,
        isApplied: 0,
        isFeePaid: 0,
        isAdmittd: 0,
        amountPaid: "",
        applicationIDDisplay: "",
        paymentStatus: "",
        paymentDate: "",
        responseUrl: "",
        isExpire: 0,
        reportingStatus: "",
        lastModifiedOn: new Date().toISOString(),
        isSTT: selectedApplicationType, // 1 for Regular, 2 for STT
        optionsLink: "",
        userLoginID: userInfo.UserLoginID,
        ipAddress: ipAddress,
        pageCode: "1",
      };

      const response = await agent.post(SaveAppliedMainCourse, applicationData);

      // Check for error response
      if (response.data.Status === "Error") {
        showAlert(
          response.data.Message ||
          "Error submitting application. Please try again.",
          "error",
        );
        setSelectedApplicationType(null);
        return;
      }

      // Success - no alert shown
      if (response.data.Status === "Success" || response.data.Data) {
        await fetchAppliedCourses();
        // Reset course to first option
        if (courseCategories.length > 0) {
          setSelectedCourse(courseCategories[0].value);
        }
        setSelectedApplicationType(null);
      }
    } catch (error) {
      console.error("Error applying for course:", error);

      // Check if error response has message
      if (
        error.response &&
        error.response.data &&
        error.response.data.Message
      ) {
        showAlert(error.response.data.Message, "error");
      } else {
        showAlert("Error submitting application. Please try again.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  // Navigate to Apply component
  const navigateToApply = (application) => {

    navigate('/Candidate/CourseApply', {
      state: {
        applicationIdDisplay: application.applicationIdDisplay, applicationId: application.id, admissionYearID: application.admissionYearId,
        from: 'training-application'
      }
    });
  };

  const navigateToPrintAdmissionSlip = async (application) => {
    if (!application?.id) {
      Swal.fire('Validation', 'Application Form Number Not Found', 'warning');
      return;
    }


    try {
      setLoading(true);

      const candidateID = application.candidateId;
      const applicationID = application.id;

      // Pull the reporting/allotment record for this application to get CourseID/CollegeID/RoundID
      const reportingResponse = await agent.get(getReportingDetails, {
        params: {
          candidateID,
          applicationID,
          encryptedApplicationID: applicationID.toString(),
          roundID: 1,
          reportingStatus: 'Y',
          userLoginID: userInfo?.UserLoginID,
          flag: 'PrintAdmissionLetter'
        }
      });


      const reportingData = reportingResponse.data?.Data || reportingResponse.data;
      const reportingItem = Array.isArray(reportingData) ? reportingData[0] : reportingData;

      if (!reportingItem) {
        Swal.fire('Validation', 'This candidate is not admitted in your college.', 'warning');
        return;
      }

      const summaryData = await fetchAdmissionSummary({
        applicationID,
        candidateID,
        courseID: reportingItem.CourseID,
        collegeID: extractCollegeId(reportingItem.ProceedURL),
        roundID: reportingItem.RoundID || 1,
        applicationId: application.applicationIdDisplay,
        mobileNo: reportingItem.MobileNo,
        collegeCode: reportingItem.CollegeCode,
        collegeName: reportingItem.CollegeName,
        courseCode: reportingItem.CourseCode,
        courseName: reportingItem.CourseName,
        admissionDate: reportingItem.AdmissionDate
      }, 'PrintAdmissionSlip');

      if (!summaryData) {
        Swal.fire('Validation', 'This candidate is not admitted in your college.', 'warning');
        return;
      }

      const success = await handlePrintWithWindow(summaryData);

      if (!success) {
        showAlert('Failed to open print window. Please check popup settings.', 'error');
      }
    } catch (error) {
      console.error('Error printing admission slip:', error);
      showAlert('Failed to print admission confirmation letter.', 'error');
    } finally {
      setLoading(false);
    }
  };
  const navigateToPrintRejectionSlip = async (application) => {
    if (!application?.id) {
      Swal.fire('Validation', 'Application Form Number Not Found', 'warning');
      return;
    }



    try {
      setLoading(true);

      const candidateID = application.candidateId;
      const applicationID = application.id;

      // Pull the reporting/allotment record for this application to get CourseID/CollegeID/RoundID
      const reportingResponse = await agent.get(getReportingDetails, {
        params: {
          candidateID,
          applicationID,
          encryptedApplicationID: applicationID.toString(),
          roundID: 1,
          reportingStatus: 'R',
          userLoginID: userInfo?.UserLoginID,
          flag: 'PrintAdmissionRejectionLetter'
        }
      });


      const reportingData = reportingResponse.data?.Data || reportingResponse.data;
      const reportingItem = Array.isArray(reportingData) ? reportingData[0] : reportingData;



      if (!reportingItem) {
        Swal.fire('Validation', 'This candidate is not admitted in your college.', 'warning');
        return;
      }

      const summaryData = await fetchAdmissionSummary({
        applicationID,
        candidateID,
        courseID: reportingItem.CourseID,
        collegeID: extractCollegeId(reportingItem.ProceedURL),
        roundID: reportingItem.RoundID || 1,
        applicationId: application.applicationIdDisplay,
        mobileNo: reportingItem.MobileNo,
        collegeCode: reportingItem.CollegeCode,
        collegeName: reportingItem.CollegeName,
        courseCode: reportingItem.CourseCode,
        courseName: reportingItem.CourseName,
        admissionDate: reportingItem.AdmissionDate,
        rejectionReason: reportingItem.ReasonForRejection,
        rejectionDateTime: reportingItem.RejectedDateTime,
        rejectionComments: reportingItem.RejectionComments,
      }, 'PrintRejectionSlip');



      // if (!summaryData) {
      //   Swal.fire('Validation', 'This candidate is not admitted in your college.', 'warning');
      //   return;
      // }

      const success = await handlePrintAdmissionRejectionWithWindow(summaryData);

      if (!success) {
        showAlert('Failed to open print window. Please check popup settings.', 'error');
      }
    } catch (error) {
      console.error('Error printing admission slip:', error);
      showAlert('Failed to print admission confirmation letter.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const navigateToPrintCancellationSlip = async (application) => {
    if (!application?.id) {
      Swal.fire('Validation', 'Application Form Number Not Found', 'warning');
      return;
    }



    try {
      setLoading(true);

      const candidateID = application.candidateId;
      const applicationID = application.id;

      // Pull the reporting/allotment record for this application to get CourseID/CollegeID/RoundID
      const reportingResponse = await agent.get(getReportingDetails, {
        params: {
          candidateID,
          applicationID,
          encryptedApplicationID: applicationID.toString(),
          roundID: 1,
          reportingStatus: 'C',
          userLoginID: userInfo?.UserLoginID,
          flag: 'PrintAdmissionCancellationLetter'
        }
      });
      const reportingData = reportingResponse.data?.Data || reportingResponse.data;
      const reportingItem = Array.isArray(reportingData) ? reportingData[0] : reportingData;

      const summaryData = await fetchAdmissionSummary({
        applicationID,
        candidateID,
        courseID: reportingItem?.CourseID,
        collegeID: extractCollegeId(reportingItem.ProceedURL),
        roundID: reportingItem.RoundID || 1,
        applicationId: application.applicationIdDisplay,
        mobileNo: reportingItem.MobileNo,
        collegeCode: reportingItem.CollegeCode,
        collegeName: reportingItem.CollegeName,
        courseCode: reportingItem.CourseCode,
        courseName: reportingItem.CourseName,
        admissionDate: reportingItem.AdmissionDate,
        cancellationComments: reportingItem.CancellationComments,
        cancellationDateTime: reportingItem.CancelledDateTime,
      });



      // if (!summaryData) {
      //   Swal.fire('Validation', 'This candidate is not admitted in your college.', 'warning');
      //   return;
      // }

      const success = await handlePrintAdmissionCancellationWithWindow(summaryData);

      if (!success) {
        showAlert('Failed to open print window. Please check popup settings.', 'error');
      }
    } catch (error) {
      console.error('Error printing admission slip:', error);
      showAlert('Failed to print admission confirmation letter.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatDateOnly = (dateTime) => {

    if (!dateTime) return "N/A";
    return dateTime.split(" ")[0];
  };

  // Simple navigation function
  const navigateToUnlock = (application) => {
    navigate("/Candidate/VerifyToUnlock", {
      state: { application },
    });
  };

  // Navigate to Pay Fees component
  const navigateToPayFees = async (application) => {
    try {
      // const response = await fetch(`${GetApplicationIDByApplicationIDDisplay}?ApplicationIDDisplay=${application.applicationIdDisplay}`);
      // const json = await response.json();
      const response = await agent.get(GetApplicationIDByApplicationIDDisplay, {
        params: {
          ApplicationIDDisplay: application.applicationIdDisplay,
        },
      });

      if (response.data?.Status === "Success" && response.data?.Data) {
        const applicationID = response.data.Data.ApplicationID || response.data.Data;
        const A1 = applicationID;
        const A2 = sha256(applicationID.toString());
        let PhaseId;
        const isForSTT = await agent.get(`${GetMainCourseAppliedFor}?applicationID=${response?.data?.Data}`);
        if (isForSTT.data?.Data === 2 && isForSTT.data?.Status === "Success") {
          PhaseId = 6;
        } else {
          PhaseId = 1;
        }
        navigate(`/Candidate/FeeInfo?PhaseId=${PhaseId}&A1=${A1}&A2=${A2}`, {
          state: {
            candidateId: application.candidateId,
            from: 'training-application'
          }
        });
      } else {
        console.error('Failed to fetch Application ID.');
      }
    } catch (error) {
      console.error('Error fetching Application ID:', error);
    }
  };

  // Get status button based on fee payment status
  const getStatusButton = (app) => {

    if (app.reportingStatus === 'Admitted') {
      return (
        <span
          className=" text-red-500 px-3 py-1 rounded text-xs font-bold transition-colors flex items-center gap-1"
        >
          Admitted
        </span>
      );
    }
    if (app.reportingStatus === 'Rejected') {
      return (
        <span
          className=" text-red-500 px-3 py-1 rounded text-xs font-bold transition-colors flex items-center gap-1"
        >
          Rejected
        </span>
      );
    }
    if (app.reportingStatus === 'Cancelled') {
      return (
        <span
          className=" text-red-500 px-3 py-1 rounded text-xs font-bold transition-colors flex items-center gap-1"
        >
          Cancelled
        </span>
      );
    }
    if (app.isFeePaid) {
      return (
        <button
          onClick={() => navigateToApply(app)}
          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1"
        >
          {app.optionsLink}
        </button>
      );
    } else {
      return (
        <button
          onClick={() => navigateToPayFees(app)}
          className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1"
        >
          <CreditCard className="h-3 w-3" />
          Pay Fees
        </button>
      );
    }
  };

  // Get status text
  //const getStatusText = (app) => {
  //    if (app.isFeePaid) {
  //        return (
  //            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
  //                Fee Paid
  //            </span>
  //        );
  //    } else {
  //        return (
  //            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
  //                Payment Pending
  //            </span>
  //        );
  //    }
  //};

  useEffect(() => {
    const initializeData = async () => {
      await fetchAdmissionSessions();
      await fetchCourseCategories();
      if (candidateId) {
        await fetchAppliedCourses();
      }
    };

    initializeData();
  }, [candidateId]);


  const handleNavigateToReceipt = (url) => {
    if (!url) {
      return;
    }


    const hrefMatch = url.match(/href=["']?([^"'\s>]+)["']?/i);
    const href = hrefMatch ? hrefMatch[1] : null;

    if (!href) {
      return;
    }

    const idMatch = href.match(/TransactionID=([^&]+)/i);
    const transactionId = idMatch ? idMatch[1] : null;

    const popupWidth = 1000
    const popupHeight = 750
    const left = (window.screen.width - popupWidth) / 2
    const top = (window.screen.height - popupHeight) / 2
    window.open(
      `${window.location.origin}/React/BulkOnlineReceipt?TransactionID=${transactionId}`,
      'BulkOnlineReceipt',
      `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes`
    )
  };

  const extractFromUrl = (proceedUrl, pattern) => {
    if (!proceedUrl) return null;
    const match = proceedUrl.match(pattern);
    return match?.[1] || null;
  };

  const extractCollegeId = (proceedUrl) => {
    const id = extractFromUrl(proceedUrl, /C2=(\d+)/);
    return id ? parseInt(id, 10) : null;
  };

  const fetchCourseDetails = async (courseId) => {
    if (!courseId) return {};
    try {
      const response = await agent.get(`/api/InstituteBase/GetCourseDetails/${courseId}`);
      return response.data?.Data || {};
    } catch (error) {
      console.error('Error fetching course details:', error);
      return {};
    }
  };

  const fetchAdmissionSummary = async (item, isFor) => {
    try {
      let params;
      if (isFor == 'PrintAdmissionSlip') {
        params = {
          CandidateID: item.candidateID,
          ApplicationID: item.applicationID,
          CourseID: item.courseID,
          CollegeID: item.collegeID,
          RoundID: item.roundID,
          UserLoginID: userInfo?.UserLoginID || '',
          ReportingStatus: 'Y',
          Flag: 'PrintAdmissionLetter'
        };
      } else if (isFor == 'PrintRejectionSlip') {
        params = {
          CandidateID: item.candidateID,
          ApplicationID: item.applicationID,
          CourseID: item.courseID,
          CollegeID: item.collegeID,
          RoundID: item.roundID,
          UserLoginID: userInfo?.UserLoginID || '',
          ReportingStatus: 'R',
          Flag: 'PrintAdmissionRejectionLetter'
        };
      } else {
        params = {
          CandidateID: item.candidateID,
          ApplicationID: item.applicationID,
          CourseID: item.courseID,
          CollegeID: item.collegeID,
          RoundID: item.roundID,
          UserLoginID: userInfo?.UserLoginID || '',
          ReportingStatus: 'C',
          Flag: 'PrintAdmissionCancellationLetter'
        };
      }

      const response = await agent.get(getAdmissionSummary, { params });
      const data = response.data?.Data || response.data;


      if (!data) return null;

      const primaryData = data.CandidatePrimarySummary || {};
      const allotmentData = data.AllotmentSummary || {};
      const documentsData = data.ListRequiredDocumentSummary || [];

      const courseId = allotmentData.CourseID || item.courseID;
      const courseDetails = await fetchCourseDetails(courseId);

      return {
        applicationId: primaryData.ApplicationID || item.applicationId || '',
        itiRegistrationNo: primaryData.ITIRegistrationNo || '',
        candidateName: [primaryData.FirstName, primaryData.MiddleName, primaryData.LastName]
          .filter(Boolean).join(' ').trim() || item.candidateName || '',
        gender: primaryData.Gender || '',
        dob: primaryData.DOB || '',
        aadhaarNo: primaryData.AadhaarNo || '',
        mobileNo: primaryData.MobileNo || item.mobileNo || '',
        altMobileNo: primaryData.AltMobileNo || '',
        email: primaryData.EMailID || '',
        photoPath: primaryData.PhotoFilePath || '',
        signaturePath: primaryData.SignFilePath || '',
        admissionDateTime: allotmentData.ReportedDateTime || allotmentData.AdmissionDate || item.admissionDate || '',
        instituteCode: allotmentData.AllottedChoiceCode || item.collegeCode || '',
        instituteName: allotmentData.AllottedCollege || item.collegeName || '',
        courseFee: allotmentData.CourseFee || '',
        paidCourseFee: allotmentData.PaidCourseFee || '',
        refundAmount: allotmentData.RefundFee || '',
        courseStartDate: allotmentData.CourseStartDate || '',
        courseCode: courseDetails.CourseCode || item.courseCode || '',
        courseName: courseDetails.Course || item.courseName || '',
        courseApprovedBy: courseDetails.CourseApprover || '',
        sector: courseDetails.Sector || '',
        subSector: courseDetails.SubSector || '',
        courseType: courseDetails.CourseType || '',
        fullTimePartTime: courseDetails.FullTimePartTime || '',
        duration: courseDetails.Duration && courseDetails.DurationUnit
          ? `${courseDetails.Duration} ${courseDetails.DurationUnit}` : '',
        minEntryQualification: courseDetails.MinimumEntryQualification || '',
        mandatoryCriteria: courseDetails.MandatoryCriteriaAtEntryQualification || 'NA',
        minimumAge: courseDetails.MinimumAge?.toString() || '',
        intakePerUnit: courseDetails.IntakePerUnit?.toString() || allotmentData.Intake || '',
        nsqfLevel: courseDetails.NSQFLevel || '',
        trainingFeeCategory: courseDetails.TrainingFeeCategory?.toString() || '',
        documents: Array.isArray(documentsData) ? documentsData.map((doc) => ({
          documentName: doc.DocumentName || '',
          verificationStatus: doc.InstituteVerificationStatusDisplay || doc.InstituteVerificationStatus || 'Pending',
          originalSubmitted: doc.IsOrignalSubmittedDisplay || doc.IsOrignalDocumentSubmitted || 'No'
        })) : [],
        printedBy: userInfo?.UserName || userInfo?.UserLoginID || '',
        printedOn: new Date().toLocaleString(),
        userTypeId: userInfo?.UserTypeID || 0,
        rejectionComments: allotmentData?.RejectionComments,
        rejectionReason: allotmentData?.ReasonForRejection,
        cancellationComments: allotmentData?.CancellationComments,
        cancellationDateTime: allotmentData?.CancelledDateTime,
      };
    } catch (error) {
      console.error('Error fetching admission summary:', error);
      return null;
    }
  };

  const getPrintHTML = async (printData) => {
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '-9999px';
    document.body.appendChild(tempDiv);

    const root = ReactDOM.createRoot(tempDiv);
    root.render(<PrintAdmissionLetter data={printData} />);

    await new Promise(resolve => setTimeout(resolve, 100));

    const htmlContent = tempDiv.innerHTML;

    root.unmount();
    document.body.removeChild(tempDiv);

    return htmlContent;
  };

  const getPrintHTMLForRejection = async (printData) => {
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '-9999px';
    document.body.appendChild(tempDiv);

    const root = ReactDOM.createRoot(tempDiv);
    root.render(<PrintAdmissionRejectionLetter data={printData} />);

    await new Promise(resolve => setTimeout(resolve, 100));

    const htmlContent = tempDiv.innerHTML;

    root.unmount();
    document.body.removeChild(tempDiv);

    return htmlContent;
  };

  // For Cancellation Letter
  const getPrintHTMLForCancellation = async (printData) => {
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
  2.

  const getAllStyles = () => {
    let styles = '';
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

  const handlePrintWithWindow = async (printData) => {
    const popupWidth = 1000;
    const popupHeight = 750;
    const left = (window.screen.width - popupWidth) / 2;
    const top = (window.screen.height - popupHeight) / 2;

    const printWindow = window.open(
      '',
      'PrintAdmissionLetter',
      `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );

    if (!printWindow) {
      Swal.fire('Popup Blocked', 'Please allow popups for this website.', 'warning');
      return false;
    }

    const printContent = await getPrintHTML(printData);
    const allStyles = getAllStyles();

    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Admission Confirmation Slip</title>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
              ${allStyles}
              @media print {
                body { margin: 0; padding: 20px; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                .no-print { display: none !important; }
                button { display: none !important; }
              }
              .page-break { page-break-before: always; }
              h1, .text-3xl, .text-4xl, .text-5xl { font-size: inherit; }
            </style>
          </head>
          <body style="margin: 0; padding: 20px; background: white;">
            <div class="print-container" style="max-width: 1200px; margin: 0 auto;">
              ${printContent}
            </div>
            <script>
              window.onload = function() {
                setTimeout(function() { window.print(); }, 500);
              };
            </script>
          </body>
        </html>
    `);

    printWindow.document.close();
    return true;
  };
  const handlePrintAdmissionRejectionWithWindow = async (printData) => {
    const popupWidth = 1000;
    const popupHeight = 750;
    const left = (window.screen.width - popupWidth) / 2;
    const top = (window.screen.height - popupHeight) / 2;

    const printWindow = window.open(
      '',
      'PrintAdmissionRejectionLetter',
      `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );

    if (!printWindow) {
      Swal.fire('Popup Blocked', 'Please allow popups for this website.', 'warning');
      return false;
    }

    const printContent = await getPrintHTMLForRejection(printData);
    const allStyles = getAllStyles();

    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Admission Rejection Slip</title>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
              ${allStyles}
              @media print {
                body { margin: 0; padding: 20px; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                .no-print { display: none !important; }
                button { display: none !important; }
              }
              .page-break { page-break-before: always; }
              h1, .text-3xl, .text-4xl, .text-5xl { font-size: inherit; }
            </style>
          </head>
          <body style="margin: 0; padding: 20px; background: white;">
            <div class="print-container" style="max-width: 1200px; margin: 0 auto;">
              ${printContent}
            </div>
            <script>
              window.onload = function() {
                setTimeout(function() { window.print(); }, 500);
              };
            </script>
          </body>
        </html>
    `);

    printWindow.document.close();
    return true;
  };
  const handlePrintAdmissionCancellationWithWindow = async (printData) => {
    const popupWidth = 1000;
    const popupHeight = 750;
    const left = (window.screen.width - popupWidth) / 2;
    const top = (window.screen.height - popupHeight) / 2;

    const printWindow = window.open(
      '',
      'PrintAdmissionCancellationLetter',
      `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );

    if (!printWindow) {
      Swal.fire('Popup Blocked', 'Please allow popups for this website.', 'warning');
      return false;
    }

    const printContent = await getPrintHTMLForCancellation(printData);
    const allStyles = getAllStyles();

    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Admission Cancellation Slip</title>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
              ${allStyles}
              @media print {
                body { margin: 0; padding: 20px; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                .no-print { display: none !important; }
                button { display: none !important; }
              }
              .page-break { page-break-before: always; }
              h1, .text-3xl, .text-4xl, .text-5xl { font-size: inherit; }
            </style>
          </head>
          <body style="margin: 0; padding: 20px; background: white;">
            <div class="print-container" style="max-width: 1200px; margin: 0 auto;">
              ${printContent}
            </div>
            <script>
              window.onload = function() {
                setTimeout(function() { window.print(); }, 500);
              };
            </script>
          </body>
        </html>
    `);

    printWindow.document.close();
    return true;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-full mx-auto space-y-8">

        {/* Application Type Selection Modal */}
        {showApplicationTypeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              {/* Modal Header */}
              <div className="bg-blue-900 text-white px-6 py-4 rounded-t-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  <h2 className="text-lg font-semibold">Application Form</h2>
                </div>
                <button
                  onClick={() => setShowApplicationTypeModal(false)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Select Application Type:
                </label>

                <div className="space-y-3">
                  {/* Regular Board Course Option - isSTT = 1 */}
                  <label
                    className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    style={{
                      borderColor:
                        selectedApplicationType === 1 ? "#1e40af" : "#d1d5db",
                      backgroundColor:
                        selectedApplicationType === 1 ? "#eff6ff" : "white",
                    }}
                  >
                    <input
                      type="radio"
                      name="applicationType"
                      value="1"
                      checked={selectedApplicationType === 1}
                      onChange={() => setSelectedApplicationType(1)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-900">
                      Regular Board Course
                    </span>
                  </label>

                  {/* ITI Short Term Training Option - isSTT = 2 */}
                  <label
                    className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    style={{
                      borderColor:
                        selectedApplicationType === 2 ? "#1e40af" : "#d1d5db",
                      backgroundColor:
                        selectedApplicationType === 2 ? "#eff6ff" : "white",
                    }}
                  >
                    <input
                      type="radio"
                      name="applicationType"
                      value="2"
                      checked={selectedApplicationType === 2}
                      onChange={() => setSelectedApplicationType(2)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-900">
                      ITI Short Term Training
                    </span>
                  </label>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end gap-3">
                <button
                  onClick={() => setShowApplicationTypeModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={submitApplication}
                  disabled={selectedApplicationType === null || loading}
                  className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Application
                </button>
              </div>
            </div>
          </div>
        )}

        {alertMessage && (
          <div
            className={`rounded-lg p-4 flex items-center gap-3 shadow-md ${alertType === "error"
              ? "bg-red-50 border border-red-200"
              : "bg-green-50 border border-green-200"
              }`}
          >
            <AlertCircle
              className={`h-5 w-5 ${alertType === "error" ? "text-red-600" : "text-green-600"}`}
            />
            <p
              className={`text-sm font-medium ${alertType === "error" ? "text-red-800" : "text-green-800"}`}
            >
              {alertMessage}
            </p>
          </div>
        )}

        {/* Application for Training Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div
            className={`${color} text-white px-4 py-2 rounded-t-md -mx-6 -mt-6 mb-6`}
          >
            <h2 className="text-lg font-semibold">Application for Training</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <DropdownComponent
                label="Admission Session"
                options={admissionSessions}
                value={admissionSession}
                onChange={(value) => setAdmissionSession(value)}
                required={true}
                loading={admissionSessionsLoading}
                disabled={admissionSessionsLoading}
              />
            </div>

            <div>
              <DropdownComponent
                label="Course Category"
                options={courseCategories}
                value={selectedCourse}
                onChange={(value) => setSelectedCourse(value)}
                required={true}
                loading={coursesLoading}
                disabled={coursesLoading}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <button
              onClick={handleApplyCourseClick}
              disabled={loading || coursesLoading || admissionSessionsLoading}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4   border-b-2 border-white"></div>
                  Processing...
                </>
              ) : (
                <>

                  Apply Course
                </>
              )}
            </button>
          </div>
        </div>

        {/* Alert Message - Shows above the table */}


        {/* Application Forms List */}
        <div className="bg-white rounded-lg shadow-md">
          <div className={`${color} text-white px-4 py-2 rounded-t-md`}>
            <h2 className="text-lg font-semibold">Application Form/s</h2>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                {/* <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div> */}
                {/* <span className="ml-2 text-gray-600">Loading applications...</span> */}
                <Loader />
              </div>
            ) : !Array.isArray(applications) || applications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No applications found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">Sr. No.</th>
                      <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">Application ID</th>
                      <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">Course Category</th>
                      <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">Last Updated on</th>
                      <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">Application Form Fee</th>
                      <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">Payment Date</th>
                      <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">Unlock</th>
                      <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
                      <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">Report</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app, index) => (
                      <tr key={app.id} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2 text-sm">{index + 1}.</td>
                        <td className="border border-gray-300 px-4 py-2 text-sm">
                          <button
                            onClick={() => handlePrintProfile(app.applicationIdDisplay)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-md font-medium text-xs hover:bg-green-700 transition-colors"
                            title="Print Application"
                          >
                            <FileText size={14} />
                            {app.applicationIdDisplay}
                          </button>
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-sm">{app.courseCategory}</td>
                        <td className="border border-gray-300 px-4 py-2 text-sm">
                          <div className="flex items-center gap-1">
                            {app.LastModifiedOn}
                          </div>
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-sm">
                          <div className="flex items-center gap-1">
                            {app.amount.toFixed(2)}
                          </div>
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-sm">
                          {formatDateOnly(app.PaymentDate)}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          <button
                            onClick={() => navigateToUnlock(app)}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1"
                          >
                            <Unlock className="h-3 w-3" />
                            Unlock Profile
                          </button>
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {getStatusButton(app)}
                        </td>
                        {app.isFeePaid && app.reportingStatus == 'Admitted' ? (
                          <td className="border border-gray-300 px-4 py-2">
                            <button
                              onClick={() => navigateToPrintAdmissionSlip(app)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1"
                            >
                              Admission Slip
                            </button>
                          </td>
                        ) : app.isFeePaid && app.reportingStatus == 'Rejected' ? (
                          <td className="border border-gray-300 px-4 py-2 text-sm text-gray-500">
                            <button
                              onClick={() => navigateToPrintRejectionSlip(app)}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1"
                            >
                              Rejection Slip
                            </button>
                          </td>
                        ) : app.isFeePaid && app.reportingStatus == 'Cancelled' ? (
                          <td className="border border-gray-300 px-4 py-2 text-sm text-gray-500">
                            <button
                              onClick={() => navigateToPrintCancellationSlip(app)}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1"
                            >
                              Cancellation Slip
                            </button>
                          </td>
                        ) : (
                          app.isFeePaid && (
                            <td className="border border-gray-300 px-4 py-2 text-sm text-gray-500">
                              <button
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1"
                                onClick={() => { handleNavigateToReceipt(app.transactionUrl) }}
                              >
                                <FileText className="h-3 w-3" />
                                Print Slip
                              </button>
                            </td>
                          )
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingApplicationSystem;
