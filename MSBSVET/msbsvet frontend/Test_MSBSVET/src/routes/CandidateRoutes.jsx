// CandidateRoutes.jsx - Fixed imports and routing
import { Routes, Route } from "react-router-dom";
import PaddedLayout from "../Component/Context/ReactComponent";

// FIXED: Import the correct dashboard component
import CandidateDashboard from "../Component/Login/CandidateAndStaff/CandidateLogin";
// If you have a separate dashboard component, use that instead:
// import CandidateDashboard from "../Component/Dashboard/CandidateDashboard";

import Staff from "../Component/UserTypes/Staff";
import Address from "../Component/Login/CandidateAndStaff/Address";
import Parent from "../Component/Login/CandidateAndStaff/Parent";
import Category from "../Component/Login/CandidateAndStaff/Category";
import Qualification from "../Component/Login/CandidateAndStaff/Qualification";
import Training from "../Component/Login/CandidateAndStaff/Training";
import AdditionalDetails from "../Component/Login/CandidateAndStaff/AdditionalDetails";
import BankDetails from "../Component/Login/CandidateAndStaff/BankDetails";
import WorkExperience from "../Component/Login/CandidateAndStaff/WorkExperience";
import Verify from "../Component/Login/CandidateAndStaff/Verify";
import VerifyToUnlock from "../Component/Login/CandidateAndStaff/VerifyToUnlock";

//import PrintProfileForm from "../Component/Login/AplicationForm/PrintProfileForm";
import PrintProfileForm from "../Component/Login/CandidateAndStaff/Verify";
import MainCourseAdmissionApply from "../Component/Login/AplicationForm/MainCourseAdmissionApply";
import Apply from "../Component/Login/AplicationForm/ApplyComponent";
import FeeInfo from "../Component/Login/AplicationForm/FeeInfo";
import TransactionHistory from "../Component/Login/AplicationForm/TransactionHistory";
// import ChangePasswordForm from "../Component/Login/Miscellaneous/ChangePassword";
// import ChangeSecurityQuestion from "../Component/Login/Miscellaneous/ChangeSecurityQuestion";
import AcademisthanCertificate from "../Component/Academisthan/AcademisthanCertificate";
import Academisthan from "../Component/Academisthan/Academisthan";
// import ChangePassword from "../Component/Login/Miscellaneous/ChangePassword";
// import ChangeSecurityQuestion from "../Component/Login/Miscellaneous/ChangeSecurityQuestion";
import BCLSCertificate from "../Component/BCLS/BCLSCertificate";
import ResultAndCertificate from "../Component/Login/Exam/ResultAndCertificate";    //// new page addded todays
import AadhaarReverificationPage from "../Component/Login/CandidateAndStaff/AadhaarReverificationPage";
import AttendanceDashboard from "../Component/Login/CandidateAndStaff/AttendanceDashboard";
function CandidateRoutes({ userLoginId, isLoggedIn, onLoginStateChange }) {
  return (
    <Routes>
      {/* Main Dashboard - FIXED: Pass required props */}
      <Route
        path="dashboard"
        element={
          <PaddedLayout>
            <CandidateDashboard
              userLoginId={userLoginId}
              isLoggedIn={isLoggedIn}
              onLoginStateChange={onLoginStateChange}
            />
          </PaddedLayout>
        }
      />

      {/* Profile Management Routes */}
      <Route
        path="Primary"
        element={
          <PaddedLayout>
            <Staff />
          </PaddedLayout>
        }
      />
      <Route
        path="Address"
        element={
          <PaddedLayout>
            <Address />
          </PaddedLayout>
        }
      />
      <Route
        path="Parent"
        element={
          <PaddedLayout>
            <Parent />
          </PaddedLayout>
        }
      />
      <Route
        path="Category"
        element={
          <PaddedLayout>
            <Category />
          </PaddedLayout>
        }
      />
      <Route
        path="Qualification"
        element={
          <PaddedLayout>
            <Qualification />
          </PaddedLayout>
        }
      />
      <Route
        path="Training"
        element={
          <PaddedLayout>
            <Training />
          </PaddedLayout>
        }
      />
      <Route
        path="Additional"
        element={
          <PaddedLayout>
            <AdditionalDetails />
          </PaddedLayout>
        }
      />
      <Route
        path="Bank"
        element={
          <PaddedLayout>
            <BankDetails />
          </PaddedLayout>
        }
      />
      <Route
        path="WorkExperience"
        element={
          <PaddedLayout>
            <WorkExperience />
          </PaddedLayout>
        }
      />

      {/* Application Management Routes */}
      <Route
        path="LockApplicationForm"
        element={
          <PaddedLayout>
            <Verify />
          </PaddedLayout>
        }
      />
      <Route
        path="VerifyToUnlock"
        element={
          <PaddedLayout>
            <Verify />
          </PaddedLayout>
        }
      />
      <Route
        path="ApplicationForm"
        element={
          <PaddedLayout>
            <PrintProfileForm />
          </PaddedLayout>
        }
      />
      <Route
        path="ResultandCertificate"
        element={
          <PaddedLayout>
            <ResultAndCertificate/>
          </PaddedLayout>
        }
      />

      {/* Course Application Routes */}
      <Route
        path="MainCourseAdmissionApply"
        element={
          <PaddedLayout>
            <MainCourseAdmissionApply />
          </PaddedLayout>
        }
      />
      <Route
        path="CourseApply"
        element={
          <PaddedLayout>
            <Apply />
          </PaddedLayout>
        }
      />

      {/* Account Management Routes */}

      {/* Financial Routes */}
      <Route
        path="FeeInfo"
        element={
          <PaddedLayout>
            <FeeInfo />
          </PaddedLayout>
        }
      />
      <Route
        path="TransactionHistory"
        element={
          <PaddedLayout>
            <TransactionHistory />
          </PaddedLayout>
        }
      />
      {/* <Route path="ChangePassword" element={<PaddedLayout><ChangePasswordForm /></PaddedLayout>} /> */}
      {/* <Route
        path="ChangePassword"
        element={
          <PaddedLayout>
            <ChangePassword />
          </PaddedLayout>
        }
      /> */}
      {/* <Route
        path="ChangeSecurityQuestion"
        element={
          <PaddedLayout>
            <ChangeSecurityQuestion />
          </PaddedLayout>
        }
      /> */}
      <Route
        path="Academisthan"
        element={
          <PaddedLayout>
            <Academisthan />
          </PaddedLayout>
        }
      />
      <Route
        path="AcademisthanCertificate"
        element={
          <PaddedLayout>
            <AcademisthanCertificate />
          </PaddedLayout>
        }
      />
      {/* <Route path="BCLS" element={<PaddedLayout><BCLS/></PaddedLayout>} /> */}
      <Route
        path="BCLSCertificate"
        element={
          <PaddedLayout>
            <BCLSCertificate />
          </PaddedLayout>
        }
      />
      <Route
        path="AadhaarReverify"
        element={
          <PaddedLayout>
            <AadhaarReverificationPage  />
          </PaddedLayout>
        }
      />
      <Route
        path="AttendanceDashboard"
        element={
          <PaddedLayout>
            <AttendanceDashboard />
          </PaddedLayout>
        }
      />


    </Routes>
  );
}

export default CandidateRoutes;
