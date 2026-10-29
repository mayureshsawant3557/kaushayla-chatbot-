// SuperAdminRoutes.jsx - Routes for SuperAdmin users
import { Routes, Route } from "react-router-dom";
import PaddedLayout from "../Component/Context/ReactComponent";
import DashboardComponent from "../Component/DVETHO/Dashboard/DashboardComponent";
import RequirementSummaryPage from "../Component/ITISpecification/RequirementSummaryPage";

import InspectionReport from "../pages/DVETO/InspectionReport";
import InspectionVerificationByBoard from "../pages/Secretary/InspectionVerification";
import PromotingOrganizationSearch from "../pages/Secretary/PromotingOrganizationSearch";
import StaffManagementSearch from "../pages/Secretary/StaffManagementSearch";
import SkillDevelopmentSearch from "../pages/Secretary/SkillDevelopmentSearch";
import InstituteSearch from "../pages/Secretary/InstituteSearch";
import GovtProposal from "../pages/Secretary/Affiliation/GovtProposal";
import GreenChannel from "../pages/Secretary/Affiliation/GreenChannel";
import InstituteCode from "../pages/Secretary/Affiliation/InstituteCode";
import Approval from "../pages/Secretary/Affiliation/Approval";
import Approveorder from "../pages/Secretary/Affiliation/Approveorder";
import InstituteCodeGenerateComponent from "../pages/Secretary/Affiliation/InstituteCodeGenerateComponent";
import ApprovalCourseSummary from "../pages/Secretary/Affiliation/ApprovalCourse";

function SecretaryRoutes({ userLoginId, isLoggedIn, onLoginStateChange }) {
  return (
    <Routes>
      {/* Main Dashboard */}

      <Route
        path="Dashboard"
        element={
          <PaddedLayout>
            <DashboardComponent
              userLoginId={userLoginId}
              isLoggedIn={isLoggedIn}
              onLoginStateChange={onLoginStateChange}
            />
          </PaddedLayout>
        }
      />

      <Route
        path="InspectionVerification"
        element={
          <PaddedLayout>
            <InspectionVerificationByBoard />
          </PaddedLayout>
        }
      />
      <Route
        path="GovtProposal"
        element={
          <PaddedLayout>
            <GovtProposal />
          </PaddedLayout>
        }
      />
      <Route
        path="GreenChannel"
        element={
          <PaddedLayout>
            <GreenChannel />
          </PaddedLayout>
        }
      />
      <Route
        path="InstituteCode"
        element={
          <PaddedLayout>
            <InstituteCode />
          </PaddedLayout>
        }
      />
      <Route
        path="Approval"
        element={
          <PaddedLayout>
            <Approval />
          </PaddedLayout>
        }
      />
      <Route
        path="Approveorder"
        element={
          <PaddedLayout>
            <Approveorder />
          </PaddedLayout>
        }
      />
      <Route
        path="InstituteCodeGenerate"
        element={
          <PaddedLayout>
            <InstituteCodeGenerateComponent />
          </PaddedLayout>
        }
      />

      <Route
        path="InspectionReport"
        element={
          <PaddedLayout>
            <InspectionReport />
          </PaddedLayout>
        }
      />
      <Route
        path="PromotingOrganizationSearch"
        element={
          <PaddedLayout>
            <PromotingOrganizationSearch />
          </PaddedLayout>
        }
      />

      <Route
        path="StaffManagementSearch"
        element={
          <PaddedLayout>
            <StaffManagementSearch />
          </PaddedLayout>
        }
      />

      <Route
        path="SkillDevelopmentSearch"
        element={
          <PaddedLayout>
            <SkillDevelopmentSearch />
          </PaddedLayout>
        }
      />

      {/*<Route path="InspectionReport" element={<PaddedLayout><InspectionReport /></PaddedLayout>} />*/}
      <Route
        path="InstituteSearch"
        element={
          <PaddedLayout>
            <InstituteSearch />
          </PaddedLayout>
        }
      />

      <Route
        path="ApprovalCourseSummary"
        element={
          <PaddedLayout>
            <ApprovalCourseSummary />
          </PaddedLayout>
        }
      />
    </Routes>
  );
}

export default SecretaryRoutes;
