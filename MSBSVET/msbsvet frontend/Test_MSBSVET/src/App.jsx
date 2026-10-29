import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  BrowserRouter,
} from "react-router-dom";

// Loading Components
import { LoadingProvider } from "./Component/Context/LoadingProvider";
import { PaymentProvider } from "./Component/Context/PaymentContext";

import Loader from "./Component/formcomponent/Loader";
import { useLoading } from "./Hooks/useLoading";
import AdmissionRoutes from "./routes/AdmissionRoute";
import ExamRoutes from "./routes/ExamRoutes";
// Layout Components
import Header from "./Component/Home/Header";
import Footer from "./Component/Home/Footer";
import Navigation from "./Component/Home/Navigation";
import MaharashtraHeader from "./Component/Home/MaharashtraHeader";
import PaddedLayout from "./Component/Context/ReactComponent";
import { ThemeProvider } from "./Component/Context/ThemeContext";
import Chatbot from "./Component/Home/ChatbotComponent"; // Kept for rollback reference
import SmartVoiceAssistant from "./Component/Home/SmartVoiceAssistant";
//import StaffManagement from "./Component/Borad02/Verification/StaffManagement";
// Route Components
import HomePage from "./pages/HomePage";
import PublicRoutes from "./routes/PublicRoutes";

import AuthRoutes from "./routes/AuthRoutes";
import CandidateRoutes from "./routes/CandidateRoutes";
import StaffRoutes from "./routes/StaffRoutes";
import SuperAdminRoutes from "./routes/SuperAdminRoutes";
import InstituteRoutes from "./routes/InstituteRoutes";
import AssistanceRoutes from "./routes/AssistanceRoutes";
import BoardLoginRoutes from "./routes/boardLoginRoutes";
import DvethoRoutes from "./routes/DvethoRoutes";

import CandidateRegistrationForm from "./Component/UserTypes/Candidate";
import StaffRegistrationForm from "./Component/UserTypes/Staff";
// import InstituteRegistrationForm from "./Component/UserTypes/Institute";
// import SDIRegistrationPage from "./pages/Registrations/SDIRegistrationPage";
import SecurityQuestionRoutes from "./routes/SecurityQuestionRoutes";

//import ReportList from "./Component/SuperAdmin/Reports/ReportsList";

import SignedVerificationCertificate from "./Component/Examination/Certificate_Verification/SignedVerificationCertificate";

import CertificateVerificationByBoard from "./Component/Borad02/Verification/CertificateVerificationByBoard";

import AfterRegister from "./Component/AfterRegister";
import RedirectAuthComponent from "./Component/Home/RedirectAuthComponent";

// INSTITUTE ROUTES
import ProposedCourse from "./Component/ITIShortTermTraining/ProposedCourse";
import DurationandCourseFee from "./Component/ITIShortTermTraining/DurationandCourseFee";
import ShortTermBatchDetails from "./Component/ITIShortTermTraining/ShortTermBatchDetails";

import NewIstituteApprovalProcessRoutes from "./routes/NewnstituteApprovalProcess";

import PaymentHistory from "./Component/Examination/Exam/PaymentHistory";
import RejectedCandidateList from "./Component/SuperAdmin/Reports/RejectedCandidateList";
import ApprovedCandidateList from "./Component/SuperAdmin/Reports/ApprovedCandidateList";
import ApprovalRejectedCandidateList from "./Component/SuperAdmin/Reports/ApprovalRejectedCandidateList";
import ApprovalPendingCandidateList from "./Component/SuperAdmin/Reports/ApprovalPendingCandidateList";
import AdmittedCandidateList from "./Component/SuperAdmin/Reports/AdmittedCandidateList";
import InstituteManagementDetailsReport from "./Component/SuperAdmin/Reports/InstituteManagementDetailsReport";
import AdmissionRejectation from "./Component/SuperAdmin/Reports/AdmissionRejectation";
import Admissionconfirmation from "./Component/SuperAdmin/Reports/Admissionconfirmation";
import AdmissionCancellation from "./Component/SuperAdmin/Reports/AdmissionCancellation";
import STTBatchResultReport from "./Component/SuperAdmin/Reports/STTBatchResultReport";
import { AuthProvider, useAuth } from "./Hooks/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import PromotingOrganizationRegistrationShowInfo from "./pages/Registrations/PromotingOrganizationRegistrationShowInfo";
import SDIRegistrationPage from "./pages/Registrations/SDIRegistrationPage";
import PromotingOrganizationLoginRoutes from "./routes/promotingorganization";

//
import DashboardTInstituteContent from "./Component/NewInstituteApprovalProcess/Dashboard/DashboardTInstitute";
//TEST purpose
import DvethoDashboard from "./Component/DVETHO/Dashboard/DashboardComponent";
import RequirementSummaryPage from "./Component/ITISpecification/RequirementSummaryPage";
import UnlockRequirements from "./Component/DVETHO/Reports/RequirementsStatus";
import ApproveCandidate from "./Component/DVETHO/ApproveCandidate";

//fee
import InstOnlineReceipt from "./Component/Fee/InstOnlineReceipt";
import VerificationReceipt from "./Component/Fee/VerificationReceipt";
import InspectionApplication from "./Component/PrintApplicationForm/InspectionApplication";
import LOIApplicationPrintForm from "./Component/PrintApplicationForm/LOIApplicationPrintForm";
import InspectionReportForm from "./Component/PrintApplicationForm/InspectionReportForm";
import ExamCenterMapping from "./Component/DVETHO/ExamCenterMapping";
import EvaluationCenterMapping from "./Component/DVETHO/EvaluationCenterMapping";
import InstituteDtails from "./Component/PrintApplicationForm/InstituteDtails";
import InstituteRouteSelector from "./routes/InstituteRouteSelector";
import ApprovedCourseList from "./Component/SchoolStep/ApprovedCourseList";
import RegisterCandidates from "./Component/SchoolStep/RegisterCandidates";
import DVETOOfficerManagement from "./pages/DVETO/DVETOOfficerManagement";
import ROOfficerManagement from "./pages/RO/ROOfficerManagement";
import AdmissionCancelledCandidateListPage from "./Component/SuperAdmin/Reports/AdmissionCancelledCandidateList";
import Staff_PrintApplicationForm from "./Component/PrintApplicationForm/Staff_PrintApplicationForm";
import PromotingOrganization from "./Component/PrintApplicationForm/PrintPromotingOrganization";
import BulkOnlineReceipt from "./Component/Examination/Exam/BulkOnlineReceipt";
import ShortTermCourseRoutes from "./routes/ShortTermCourseRoute";
import MasterMgmtRoutes from "./routes/MasterMgmtRoutes";
import SeatingArrangementDetails from "./Component/PrintApplicationForm/SeatingArrangementDetails";
import AttendanceReportDetail from "./Component/PrintApplicationForm/AttendanceReportDetails";
import PrintLOI from "./Component/PrintApplicationForm/PrintLOI";

import InspectionVerificationByBoard from "./pages/Secretary/InspectionVerification";
import SecretaryRoutes from "./routes/SecretaryRoutes";
import CourseSummary from "./Component/PrintApplicationForm/CourseSummary";

import InstituteDash from "./pages/Secretary/InstituteDash";
import FeeRoutes from "./routes/FeeRoute";
import PasswordResetFlow from "./Component/signIn-trouble/AccountRecovery";
import ChangePasswordForm from "./Component/Login/Miscellaneous/ChangePassword";
import ChangeSecurityQuestion from "./Component/Login/Miscellaneous/ChangeSecurityQuestion";
import EditUserProfile from "./Component/Login/Miscellaneous/EditUserProfile";
import ReportsList from "./pages/CMS/Reports/ReportsList";
import GenerateReport from "./pages/CMS/Reports/GenerateReport";
import GreenRequirementsReportPage from "./pages/CMS/Reports/GreenRequirementsReportPage";
import PromotingOrganizationRegistration from "./pages/Registrations/PromotingOrganizationRegistration";
import ElectionDutyReport from "./pages/CMS/Administration/ElectionDutyReport";
import AttendanceDashboard from "./Component/Institute/Dashboard/AttandanceDashboard";
//import AttendanceRegularization from "./Component/Institute/Dashboard/AttendanceRegularisationApproval";
import RoRoutes from "./routes/RoRoutes";
import DVETRoutes from "./routes/DVETRoutes";
import PendingForApprovalCandidateListPage from "./Component/SuperAdmin/Reports/PendingForApprovalCandidateList";
import ReportGazet from "./pages/ReportGazet/ReportGazet";
import ITIPrincipalDetailsReport from "./Component/SuperAdmin/Reports/ITIPrincipalDetailsReport";
import StateFund from "../src/pages/DVETO/StateFund";
import ResultAndCertificateInstituteLong from "./pages/Obwc/ResultAndCertificateInstituteLong";
import MbocwBatchwiseResult from "./pages/Obwc/MbocwBatchwiseResult";
import VerificationReport from "./Component/PrintApplicationForm/VerificationReport";
import SecretaryDVETOInstituteStatusPage from "./pages/Secretary/SecretaryDVETOInstituteStatusPage";
import OnlineReceipt from "./Component/Fee/OnlineReceipt";

const basename = "/React";
const queryClient = new QueryClient();
function Layout({ children, isLoggedIn, userLoginId }) {
  return (
    <>
      <Header />
      <MaharashtraHeader isLoggedIn={isLoggedIn} userLoginId={userLoginId} />
      <Navigation />
      <SmartVoiceAssistant />
      <main>{children}</main>
      <Footer />
    </>
  );
}

function AppContent() {
  const {
    isLoggedIn,
    userLoginId,
    userType,
    userInfo,
    loading,
    login,
    logout,
  } = useAuth();

  const handleLoginStateChange = (profileId, type, fullUserInfo) => {
    if (profileId && type) {
      login(profileId, type, fullUserInfo);
    } else {
      logout();
    }
  };
  const superAdminRouteElement = (
    <ProtectedRoute
      isLoggedIn={isLoggedIn}
      userType={userType}
      allowedTypes={["superadmin", "cms", "mantralaya", "director"]}
    >
      <SuperAdminRoutes
        userLoginId={userLoginId}
        isLoggedIn={isLoggedIn}
        onLoginStateChange={handleLoginStateChange}
      />
    </ProtectedRoute>
  );

  if (loading) {
    return <Loader />;
  }

  // added for hide layout , fee module
  const pathsToHideLayout = [
    "/InstOnlineReceipt",
    "/InspectionApplication",
    "/InspectionReportForm",
    "/InstituteDetailsPrint",
    "/StaffPrintApplicationForm",
    "/PromotingOrganizationPrint",
    "/BulkOnlineReceipt",
    "/OnlineReceipt",
    "/VerificationReceipt",
    "/LOIApplicationPrintForm",
    "/AttendanceReportDetail",
    "/SeatingArrangementDetails",
    "/PrintLOI",
    "/CourseSummary",
    "/VerificationReport",
  ];

  const isHideLayoutPage = pathsToHideLayout.some((path) =>
    location.pathname.includes(path),
  );

  return (
    <>
      <Routes>
        {/* Auth redirect route - outside Layout */}
        <Route
          path="/RedirectAuthComponent"
          element={<RedirectAuthComponent />}
        />
        {/*fee*/}
        <Route
          path="/StaffPrintApplicationForm"
          element={<Staff_PrintApplicationForm />}
        />
        <Route path="/InstOnlineReceipt/*" element={<InstOnlineReceipt />} />
        <Route path="/BulkOnlineReceipt/*" element={<BulkOnlineReceipt />} />
        <Route path="/OnlineReceipt/*" element={<OnlineReceipt/>}/>
        <Route
          path="/VerificationReceipt/*"
          element={<VerificationReceipt />}
        />
        <Route
          path="/InspectionApplication"
          element={<InspectionApplication />}
        />
        <Route
          path="/LOIApplicationPrintForm"
          element={<LOIApplicationPrintForm />}
        />
        <Route
          path="/InspectionReportForm"
          element={<InspectionReportForm />}
        />
        <Route path="/VerificationReport" element={<VerificationReport />} />
        <Route path="/InstituteDetailsPrint" element={<InstituteDtails />} />
        <Route
          path="/PromotingOrganizationPrint"
          element={<PromotingOrganization />}
        />
        <Route
          path="/PromotingOrganizationPrint"
          element={<PromotingOrganization />}
        />
        <Route
          path="/AttendanceReportDetail"
          element={<AttendanceReportDetail />}
        />
        <Route
          path="/SeatingArrangementDetails"
          element={<SeatingArrangementDetails />}
        />
        <Route path="/PrintLOI" element={<PrintLOI />} />
        <Route path="/CourseSummary" element={<CourseSummary />} />
      </Routes>

      {!isHideLayoutPage && (
        <Layout isLoggedIn={isLoggedIn} userLoginId={userLoginId}>
          <Routes>
            {/* Home Route */}
            <Route
              path="/"
              element={
                <HomePage
                  isLoggedIn={isLoggedIn}
                  onLoginStateChange={handleLoginStateChange}
                />
              }
            />
            {/* Public Routes */}
            <Route
              path="/Public/*"
              element={
                <PublicRoutes
                  isLoggedIn={isLoggedIn}
                  onLoginStateChange={handleLoginStateChange}
                />
              }
            />
            {/* About Routes */}
            {/*<Route path="/about/*" element={<AboutRoutes />} />*/}
            {/*ENABLE this path while use board routes for home page not while use board dashbaord*/}
            {/*<Route path="/board/*" element={<AboutRoutes />} />*/}
            {/* Authentication Routes */}
            {/*<Route*/}
            {/*    path="/auth/*"*/}
            {/*    element={*/}
            {/*        <AuthRoutes*/}
            {/*            isLoggedIn={isLoggedIn}*/}
            {/*            userType={userType}*/}
            {/*            loading={loading}*/}
            {/*            onLoginStateChange={handleLoginStateChange}*/}
            {/*        />*/}
            {/*    }*/}
            {/*/>*/}
            {/*TEST*/}

            {/* DVETHO Routes for DashBoardMenu*/}
            <Route
              path="/Admission/CandidateListPendingForDvetOApproval"
              element={
                <PaddedLayout>
                  <ApproveCandidate />
                </PaddedLayout>
              }
            />

            <Route path="/InstituteDash" element={<InstituteDash />} />
            {/* <Route
                      path="/Exam/ExamCenterMapping" 
                        element={
                            <PaddedLayout>
                                <ExamCenterMapping/>
                            </PaddedLayout>
                        }
                      />
                      <Route
                      path="/Exam/EvaluationCenterMapping" 
                        element={
                            <PaddedLayout>
                                <EvaluationCenterMapping/>
                            </PaddedLayout>
                        }
                      /> */}
            <Route
              path="/Dashboard/ElectionDutyReport"
              element={<ElectionDutyReport />}
            />
            <Route
              path="/Institute/AttendanceReport"
              element={
                <PaddedLayout>
                  <AttendanceDashboard />
                </PaddedLayout>
              }
            />
            {/*<Route
              path="/Institute/AttendanceRegularization"
              element={
                <PaddedLayout>
                  <AttendanceRegularization/>
                </PaddedLayout>
              }
            />  */}
            <Route
              path="/Dashboard/RequirementSummary"
              element={<RequirementSummaryPage />}
            />
            <Route
              path="/Dashboard/RequirementUnlock"
              element={<UnlockRequirements />}
            />
            <Route
              path="/Dashboard/DashboardDVET"
              element={<DvethoDashboard />}
            />
            {/* by-pass routes test */}
            <Route
              path="/ShortTermCourse/ProposedCourse"
              element={<ProposedCourse />}
            />
            <Route
              path="/ShortTermCourse/DurationandCourseFee"
              element={<DurationandCourseFee />}
            />
            <Route
              path="ShortTermCourse/ShortTermBatchDetails"
              element={<ShortTermBatchDetails />}
            />
            <Route
              path="/Fee/TransactionHistory"
              element={
                <PaddedLayout>
                  <PaymentHistory />
                </PaddedLayout>
              }
            />
            <Route
              path="/Reports/ReportGazette"
              element={
                <ProtectedRoute
                  isLoggedIn={isLoggedIn}
                  userType={userType}
                  allowedTypes={["institute", "district", "cms"]}
                >
                  <PaddedLayout>
                    <ReportGazet />
                  </PaddedLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/Reports/RejectedCandidateList"
              element={
                <PaddedLayout>
                  <RejectedCandidateList />
                </PaddedLayout>
              }
            />
            <Route
              path="/Reports/STTBatchResultReport"
              element={
                <PaddedLayout>
                  <STTBatchResultReport />
                </PaddedLayout>
              }
            />
            <Route
              path="/Reports/SecretaryDVETOInstituteStatusPage"
              element={
                <PaddedLayout>
                  <SecretaryDVETOInstituteStatusPage />
                </PaddedLayout>
              }
            />
            <Route
              path="/Reports/ReportsList"
              element={
                <PaddedLayout>
                  <ReportsList />
                </PaddedLayout>
              }
            />
            <Route
              path="/Reports/GreenRequirementsReport"
              element={
                <ProtectedRoute
                  isLoggedIn={isLoggedIn}
                  userType={userType}
                  allowedTypes={["ro", "district", "cms", "mantralaya"]}
                >
                  <PaddedLayout>
                    <GreenRequirementsReportPage />
                  </PaddedLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/Reports/GenerateReport"
              element={
                <PaddedLayout>
                  <GenerateReport />
                </PaddedLayout>
              }
            />
            <Route
              path="/Reports/ITIPrincipalDetailsReport"
              element={
                <PaddedLayout>
                  <ITIPrincipalDetailsReport />
                </PaddedLayout>
              }
            />
            <Route
              path="/Reports/ApprovedCandidateList"
              element={
                <PaddedLayout>
                  <ApprovedCandidateList />
                </PaddedLayout>
              }
            />
            <Route
              path="/DVET/StateFund"
              element={
                <PaddedLayout>
                  <StateFund />
                </PaddedLayout>
              }
            />

            <Route
              path="/Reports/PendingForApprovalCandidateList"
              element={
                <PaddedLayout>
                  <PendingForApprovalCandidateListPage />
                </PaddedLayout>
              }
            />
            <Route
              path="/Reports/ApprovalRejectedCandidateList"
              element={
                <PaddedLayout>
                  <ApprovalRejectedCandidateList />
                </PaddedLayout>
              }
            />
            <Route
              path="/Reports/ApprovalPendingCandidateList"
              element={
                <PaddedLayout>
                  <ApprovalPendingCandidateList />
                </PaddedLayout>
              }
            />

            <Route
              path="/:userType/change-security-question"
              element={<ChangeSecurityQuestion />}
            />
            <Route
              path="/Reports/CancelledCandidateList"
              element={
                <PaddedLayout>
                  <AdmissionCancelledCandidateListPage />
                </PaddedLayout>
              }
            />
            <Route
              path="/Reports/institute-management-details"
              element={
                <PaddedLayout>
                  <InstituteManagementDetailsReport />
                </PaddedLayout>
              }
            />
            <Route
              path="/Reports/CancelledCandidateList"
              element={
                <PaddedLayout>
                  <AdmissionCancelledCandidateListPage />
                </PaddedLayout>
              }
            />

            {/*added for inspection by board */}
            {/*<Route path="/SDILOI/InspectionVerification" element={<PaddedLayout><InspectionVerificationByBoard /></PaddedLayout>} />*/}
            <Route
              path="/Reports/AdmittedCandidateList"
              element={
                <PaddedLayout>
                  <AdmittedCandidateList />
                </PaddedLayout>
              }
            />

            <Route
              path="/Obwc/ResultAndCertificateInstituteLong"
              element={
                <PaddedLayout>
                  <ResultAndCertificateInstituteLong />
                </PaddedLayout>
              }
            />

            <Route
              path="/Obwc/MbocwBatchwiseResult"
              element={
                <PaddedLayout>
                  <MbocwBatchwiseResult />
                </PaddedLayout>
              }
            />

            <Route
              path="/tinstitute/dashboard"
              element={
                <PaddedLayout>
                  <DashboardTInstituteContent />
                </PaddedLayout>
              }
            />
            {/* Legacy auth redirects */}
            <Route
              path="/signin"
              element={<Navigate to="/auth/signin" replace />}
            />
            <Route
              path="/AccountRecovery"
              // element={<Navigate to="/auth/account-recovery" replace />}
              element={
                <PaddedLayout>
                  <PasswordResetFlow />
                </PaddedLayout>
              }
            />
            {/* <Route
                            path="/account-recovery"
                            element={<Navigate to="/auth/account-recovery" replace />}
                        /> */}
            {/* FIXED: Legacy route redirects */}
            <Route
              path="/CandidateLogin"
              element={<Navigate to="/Candidate/dashboard" replace />}
            />

            <Route
              path="/StaffLogin"
              element={<Navigate to="/Staff/dashboard" replace />}
            />

            <Route
              path="/RO/ROOfficeManagementDetails"
              element={<ROOfficerManagement />}
            />

            <Route
              path="/Candidate/*"
              element={
                <ProtectedRoute
                  isLoggedIn={isLoggedIn}
                  userType={userType}
                  allowedTypes={["candidate", "institute", "cms", "superadmin"]} // allow institute and cms to access candidate routes for management purposes
                >
                  <CandidateRoutes
                    userLoginId={userLoginId}
                    isLoggedIn={isLoggedIn}
                    onLoginStateChange={handleLoginStateChange}
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/RO/*"
              element={
                <ProtectedRoute
                  isLoggedIn={isLoggedIn}
                  userType={userType}
                  allowedTypes={["ro", "", "", ""]}
                >
                  <RoRoutes
                    userLoginId={userLoginId}
                    isLoggedIn={isLoggedIn}
                    onLoginStateChange={handleLoginStateChange}
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/DVET/*"
              element={
                <ProtectedRoute
                  isLoggedIn={isLoggedIn}
                  userType={userType}
                  allowedTypes={["dvet", "", "", ""]}
                >
                  <DVETRoutes
                    userLoginId={userLoginId}
                    isLoggedIn={isLoggedIn}
                    onLoginStateChange={handleLoginStateChange}
                  />
                </ProtectedRoute>
              }
            />

            <Route
              path="Candidate/ChangePassword"
              element={
                <PaddedLayout>
                  <ChangePasswordForm />
                </PaddedLayout>
              }
            />
            <Route
              path="Candidate/ChangeSecurityQuestion"
              element={
                <PaddedLayout>
                  <ChangeSecurityQuestion />
                </PaddedLayout>
              }
            />

            <Route
              path="Administration/EditUserProfile"
              element={
                <PaddedLayout>
                  <EditUserProfile />
                </PaddedLayout>
              }
            />
            {/*<Route*/}
            {/*    path="/Candidate/*"*/}
            {/*    element={*/}
            {/*        <CandidateRoutes*/}
            {/*            userLoginId={userLoginId}*/}
            {/*            isLoggedIn={isLoggedIn}*/}
            {/*            onLoginStateChange={handleLoginStateChange}*/}
            {/*        />*/}
            {/*    }*/}
            {/*/>*/}
            <Route
              path="/Staff/*"
              element={
                <ProtectedRoute
                  isLoggedIn={isLoggedIn}
                  userType={userType}
                  allowedTypes={["staff", "board", "sc"]}
                >
                  <StaffRoutes
                    userLoginId={userLoginId}
                    isLoggedIn={isLoggedIn}
                    onLoginStateChange={handleLoginStateChange}
                  />
                </ProtectedRoute>
              }
            />
            {/* <Route
                            path="/MasterMgmt/*"
                            element={
                                <ProtectedRoute
                                    isLoggedIn={isLoggedIn}
                                    userType={userType}
                                    allowedTypes={["staff", "board","cms"]}
                                >
                                    <MasterMgmt
                                        userLoginId={userLoginId}
                                        isLoggedIn={isLoggedIn}
                                        onLoginStateChange={handleLoginStateChange}
                                    />
                                </ProtectedRoute>
                            }
                        /> */}
            {/*test */}
            {/*<Route*/}
            {/*    path="/institute/*"*/}
            {/*    element={*/}
            {/*        <ProtectedRoute*/}
            {/*            isLoggedIn={isLoggedIn}*/}
            {/*            userType={userType}*/}
            {/*            allowedTypes={['institute', 'institutetempary']}*/}
            {/*        >*/}
            {/*            <InstituteRouteSelector*/}
            {/*                userType={userType}*/}
            {/*                userLoginId={userLoginId}*/}
            {/*                isLoggedIn={isLoggedIn}*/}
            {/*                onLoginStateChange={handleLoginStateChange}*/}
            {/*            />*/}
            {/*            <NewIstituteApprovalProcessRoutes*/}
            {/*                userLoginId={userLoginId}*/}
            {/*                isLoggedIn={isLoggedIn}*/}
            {/*                onLoginStateChange={handleLoginStateChange}*/}
            {/*            />*/}
            {/*        </ProtectedRoute>*/}
            {/*    }*/}
            {/*/>*/}
            <Route
              path="/institute/*"
              element={
                <ProtectedRoute
                  isLoggedIn={isLoggedIn}
                  userType={userType}
                  allowedTypes={[
                    "institute",
                    "institutetempary",
                    "district",
                    "sc",
                    "gb",
                  ]} //'institutetempary'
                >
                  <InstituteRoutes
                    userLoginId={userLoginId}
                    isLoggedIn={isLoggedIn}
                    onLoginStateChange={handleLoginStateChange}
                  />
                  <NewIstituteApprovalProcessRoutes
                    userLoginId={userLoginId}
                    isLoggedIn={isLoggedIn}
                    onLoginStateChange={handleLoginStateChange}
                    userType={userType}
                  />
                </ProtectedRoute>
              }
            />
            {/*<Route*/}
            {/*    path="/institute/*"*/}
            {/*    element={*/}
            {/*        <ProtectedRoute*/}
            {/*            isLoggedIn={isLoggedIn}*/}
            {/*            userType={userType}*/}
            {/*            allowedTypes={['institutetempary']}*/}
            {/*        >*/}
            {/*            <NewIstituteApprovalProcessRoutes*/}
            {/*                userLoginId={userLoginId}*/}
            {/*                isLoggedIn={isLoggedIn}*/}
            {/*                onLoginStateChange={handleLoginStateChange}*/}
            {/*            />*/}
            {/*        </ProtectedRoute>*/}
            {/*    }*/}
            {/*/>*/}
            {/*<Route*/}
            {/*    path="/institute/*"*/}
            {/*    element={*/}
            {/*            <InstituteRoutes*/}
            {/*                userLoginId={userLoginId}*/}
            {/*                isLoggedIn={isLoggedIn}*/}
            {/*                onLoginStateChange={handleLoginStateChange}*/}
            {/*            />*/}
            {/*    }*/}
            {/*/>*/}
            <Route
              path="/board/*"
              element={
                <ProtectedRoute
                  isLoggedIn={isLoggedIn}
                  userType={userType}
                  allowedTypes={["board"]}
                >
                  <BoardLoginRoutes
                    userLoginId={userLoginId}
                    isLoggedIn={isLoggedIn}
                    onLoginStateChange={handleLoginStateChange}
                  />
                </ProtectedRoute>
              }
            />

            {/*/Dashboard/DashboardDVET*/}
            <Route
              path="/DVETO/*"
              element={
                <ProtectedRoute
                  isLoggedIn={isLoggedIn}
                  userType={userType}
                  allowedTypes={[
                    "dvetho",
                    "district",
                    "sc",
                    "institute",
                    "ro",
                    "gb",
                  ]}
                >
                  <DvethoRoutes
                    userLoginId={userLoginId}
                    isLoggedIn={isLoggedIn}
                    onLoginStateChange={handleLoginStateChange}
                  />
                </ProtectedRoute>
              }
            />

            <Route
              path="/RO/*"
              element={
                <ProtectedRoute
                  isLoggedIn={isLoggedIn}
                  userType={userType}
                  allowedTypes={["dvetho", "district", "sc", "institute", "ro"]}
                >
                  <DvethoRoutes
                    userLoginId={userLoginId}
                    isLoggedIn={isLoggedIn}
                    onLoginStateChange={handleLoginStateChange}
                  />
                </ProtectedRoute>
              }
            />

            <Route
              path="/SDILOI/*"
              element={
                <ProtectedRoute
                  isLoggedIn={isLoggedIn}
                  userType={userType}
                  allowedTypes={[
                    "dvetho",
                    "district",
                    "sc",
                    "promotingorganization",
                    "staff",
                    "gb",
                  ]}
                >
                  <SecretaryRoutes
                    userLoginId={userLoginId}
                    isLoggedIn={isLoggedIn}
                    onLoginStateChange={handleLoginStateChange}
                  />
                </ProtectedRoute>
              }
            />

            {/*<Route path="/board/dashboard" element={<BoardDashBoard />} />*/}
            <Route path="/SuperAdmin/*" element={superAdminRouteElement} />
            <Route
              path="/ShortTermCourse/*"
              element={<ShortTermCourseRoutes />}
            />
            {/* <Route path="/MasterMgmt/*" element={<MasterMgmtRoutes />} /> */}
            <Route
              path="/ShortTermCourse/*"
              element={<ShortTermCourseRoutes />}
            />
            <Route path="/MasterMgmt/*" element={<MasterMgmtRoutes />} />
            <Route path="/Administration/*" element={superAdminRouteElement} />
            {/* <Route path="/Reports/ReportsList" element={<ReportsList />} /> */}
            <Route path="Menu/*" element={superAdminRouteElement} />
            {/* <Route path="/Admission/*" element={<AdmissionRoutes />} /> */}
            <Route
              path="/Admission/*"
              element={
                <AdmissionRoutes
                  userLoginId={userLoginId}
                  userType={userType}
                />
              }
            />
            <Route
              path="/Exam/*"
              element={
                <ExamRoutes userLoginId={userLoginId} userType={userType} />
              }
            />
            <Route path="/Fee/*" element={<FeeRoutes />} />
            <Route
              path="/Account/*"
              element={
                <ProtectedRoute
                  isLoggedIn={isLoggedIn}
                  userType={userType}
                  allowedTypes={[
                    "staff",
                    "candidate",
                    "superadmin",
                    "institute",
                  ]}
                >
                  <SecurityQuestionRoutes
                    userLoginId={userLoginId}
                    isLoggedIn={isLoggedIn}
                    onLoginStateChange={handleLoginStateChange}
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/verification-certificate"
              element={<SignedVerificationCertificate />}
            />
            {/* <Route
                path="ShortTermCourse/CourseTrainingFee"
                element={<PaddedLayout><TrainingFees /></PaddedLayout>}
            /> */}
            {/*CertificateVerificationByBoard*/}
            <Route
              path="/Exam/CertificateVerification"
              element={<CertificateVerificationByBoard />}
            />
            {/* Registration Routes */}
            <Route
              path="/candidate/register"
              element={<CandidateRegistrationForm />}
            />
            <Route path="/staff/register" element={<StaffRegistrationForm />} />
            <Route
              path="/institute/register"
              element={<SDIRegistrationPage />}
            />
            <Route path="/after-register" element={<AfterRegister />} />
            <Route
              path="/after-promoting-register"
              element={<PromotingOrganizationRegistrationShowInfo />}
            />
            <Route
              path="/Registration/PromotingOrganizationRegistration"
              element={<PromotingOrganizationRegistration />}
            />

            {/* Other Routes */}
            {/*<Route path="/institute/*" element={<InstituteRoutes />} />*/}
            <Route path="/assistance/*" element={<AssistanceRoutes />} />
            {/* More legacy redirects */}
            {/*<Route path="/Candidate" element={<Navigate to="/Candidate/dashboard" replace />} />*/}
            {/*<Route path="/Staff" element={<Navigate to="/Staff/dashboard" replace />} />*/}
            {/*<Route path="/assitance" element={<Navigate to="/assistance" replace />} />*/}
            {/*<Route path="/unauthorized" element={<Navigate to="/auth/unauthorized" replace />} />*/}

            {/*fee*/}

            <Route
              path="/promotingorganization/*"
              element={
                <ProtectedRoute
                  isLoggedIn={isLoggedIn}
                  userType={userType}
                  allowedTypes={["promotingorganization", "sc"]}
                >
                  <PromotingOrganizationLoginRoutes
                    userLoginId={userLoginId}
                    isLoggedIn={isLoggedIn}
                    onLoginStateChange={handleLoginStateChange}
                  />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Layout>
      )}
    </>
  );
}

// Protected Route Component
function ProtectedRoute({ children, isLoggedIn, userType, allowedTypes }) {
  const location = useLocation();

  // Check if coming from auth redirect
  if (location.state?.fromAuth) {
    // Give time for session to propagate
    return children;
  }

  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  if (allowedTypes && !allowedTypes.includes(userType?.toLowerCase())) {
    return <Navigate to="/" replace />;
  }

  return children;
}

//function ProtectedRoute({ children, isLoggedIn, userType, allowedTypes }) {
//    const location = useLocation();

//    console.log("ProtectedRoute check:", {
//        isLoggedIn,
//        userType,
//        allowedTypes,
//        path: location.pathname
//    });

//    // 1. Wait until userType is available (CRITICAL FIX)
//    if (!userType) {
//        return <div className="p-6 text-center">Loading session...</div>;
//    }

//    // 2. Check login
//    if (!isLoggedIn) {
//        console.log("Not logged in, redirecting to signin");
//        return <Navigate to="/" replace />;
//    }
//    debugger;
//    if (allowedTypes && !allowedTypes.includes(userType?.toLowerCase())) {
//        console.log("User type not allowed, redirecting to unauthorized");
//        return <Navigate to="/" replace />;
//    }

//    // 4. All good
//    return children;
//}

// Loading Wrapper
function LoaderWrapper() {
  const { loading } = useLoading();
  return loading ? <Loader /> : null;
}

// Main App Component
function App() {
  return (
    <div className="App">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider>
            <PaymentProvider>
              <BrowserRouter basename={basename}>
                <LoadingProvider>
                  <LoaderWrapper />
                  <AppContent />
                </LoadingProvider>
              </BrowserRouter>
            </PaymentProvider>
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </div>
  );
}

export default App;
