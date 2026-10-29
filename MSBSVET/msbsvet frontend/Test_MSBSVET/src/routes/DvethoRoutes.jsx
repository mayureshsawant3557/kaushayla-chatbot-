// SuperAdminRoutes.jsx - Routes for SuperAdmin users
import { Routes, Route } from "react-router-dom";
import PaddedLayout from "../Component/Context/ReactComponent";
import DashboardComponent from "../Component/DVETHO/Dashboard/DashboardComponent";
import RequirementSummaryPage from "../Component/ITISpecification/RequirementSummaryPage";
import RequirementUnlock from "../Component/DVETHO/Reports/RequirementsStatus";
import DVETOOfficerManagement from "../pages/DVETO/DVETOOfficerManagement";
import SDIScheduleInspection from "../pages/DVETO/SDIScheduleInspection";
import SDIScheduleInspectionForm from "../pages/DVETO/SDIScheduleInspectionForm";
// import OfficeProfile from "../Component/DVETO/OfficeProfile/OfficeProfile";
import OfficeProfile from "../pages/DVETO/OfficeProfile";
import ApproveCandidate from "../Component/DVETHO/ApproveCandidate";
import ExamCenterMapping from "../Component/DVETHO/ExamCenterMapping";
import EvaluationCenterMapping from "../Component/DVETHO/EvaluationCenterMapping";
import InspectionCommittee from "../pages/DVETO/InspectionCommittee";
import Inspection from "../pages/DVETO/Inspection";
import InspectionReport from "../pages/DVETO/InspectionReport";
import OngoingInspectionForDveto from "../pages/DVETO/ongoingInspectionForDveto";
import DPDCFundAllocation from "../pages/DVETO/DPDCFundAllocation";
import DPDC_2203 from "../pages/DVETO/DPDC_2203";
import DPDC_2230 from "../pages/DVETO/DPDC_2230";
import ElectionDuty from "../pages/DVETO/ElectionDuty";
import SelfRequirementDO from "../pages/DVETO/TradeRequirements_new";

function DvethoRoutes({ userLoginId, isLoggedIn, onLoginStateChange }) {
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
        path="RequirementSummary"
        element={
          <PaddedLayout>
            <RequirementSummaryPage />
          </PaddedLayout>
        }
      />
      <Route
        path="RequirementUnlock"
        element={
          <PaddedLayout>
            <RequirementUnlock />
          </PaddedLayout>
        }
      />
      <Route
        path="OfficeProfile"
        element={
          <PaddedLayout>
            <OfficeProfile />
          </PaddedLayout>
        }
      />

      <Route
        path="ElectionDuty"
        element={
          <PaddedLayout>
            <ElectionDuty />
          </PaddedLayout>
        }
      />

      <Route
        path="InspectionCommittee"
        element={
          <PaddedLayout>
            <InspectionCommittee />
          </PaddedLayout>
        }
      />

      <Route
        path="CandidateListPendingForDvetOApproval"
        element={
          <PaddedLayout>
            <ApproveCandidate />
          </PaddedLayout>
        }
      />
      <Route
        path="ExamCenterMapping"
        element={
          <PaddedLayout>
            <ExamCenterMapping />
          </PaddedLayout>
        }
      />
      <Route
        path="EvaluationCenterMapping"
        element={
          <PaddedLayout>
            <EvaluationCenterMapping />
          </PaddedLayout>
        }
      />
      <Route
        path="RequirementSummary"
        element={
          <PaddedLayout>
            <RequirementSummaryPage />
          </PaddedLayout>
        }
      />
      <Route
        path="RequirementUnlock"
        element={
          <PaddedLayout>
            <RequirementUnlock />
          </PaddedLayout>
        }
          />
          
      {/* DVETO Officer Management Route */}
      <Route
        path="DVETOOfficerManagement"
        element={
          <PaddedLayout>
            <DVETOOfficerManagement />
          </PaddedLayout>
        }
      />
      <Route
        path="ScheduleInspection"
        element={
          <PaddedLayout>
            <SDIScheduleInspection />
          </PaddedLayout>
        }
      />
      <Route
        path="SDIScheduleInspectionForm"
        element={
          <PaddedLayout>
            <SDIScheduleInspectionForm />
          </PaddedLayout>
        }
      />
      <Route
        path="Inspection"
        element={
          <PaddedLayout>
            <Inspection />
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
        path="OngoingInspection"
        element={
          <PaddedLayout>
            <OngoingInspectionForDveto />
          </PaddedLayout>
        }
      />
      <Route
        path="DPDCFunds"
        element={
          <PaddedLayout>
            <DPDCFundAllocation />
          </PaddedLayout>
        }
      />
      <Route
        path="DPDCFundsGTHS"
        element={
          <PaddedLayout>
            <DPDC_2203 />
          </PaddedLayout>
        }
      />
      <Route
        path="DPDCFundsGITI"
        element={
          <PaddedLayout>
            <DPDC_2230 />
          </PaddedLayout>
        }
          />
          <Route
              path="SelfRequirementDO"
              element={
                  <PaddedLayout>
                      <SelfRequirementDO />
                  </PaddedLayout>
              }
          />
    </Routes>
  );
}

export default DvethoRoutes;
