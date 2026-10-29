import { Routes, Route } from "react-router-dom";
import MandatoryTaskPopup from "../Component/formcomponent/MandatoryTaskPopup";
import AttendanceReportDetails from "../Component/Examination/Exam/AttendanceReportDetails";
import ReadyforAssessment from "../Component/Examination/Exam/ReadyforAssessment";
import ElectiveSubjectAssign from "../Component/Examination/Exam/ElectiveSubjectAssign";
import ElectiveSubjectAssignBacklog from "../Component/Examination/Exam/ElectiveSubjectAssignBacklog";
import ExamFees from "../Component/Examination/Exam/ExamFeesNew";
import HallTicket from "../Component/Examination/Exam/HallTicket";
import CorrectedResultAndCertificate from "../Component/Examination/Exam/CorrectedResultAndCertificate";
import EvaluationReport from "../Component/Examination/Exam/EvaluationReport";
import SeatingArrangement from "../Component/Examination/Exam/SeatingArrangement";
import ResultAndCertificate from "../Component/Examination/Exam/ResultAndCertificate";
import ExamEvaluationCenterMappingStatus from "../Component/Examination/Exam/ExamEvaluationCenterMappingStatus";

import ExamCenterMapping from "../Component/DVETHO/ExamCenterMapping";
import EvaluationCenterMapping from "../Component/DVETHO/EvaluationCenterMapping";

import PaddedLayout from "../Component/Context/ReactComponent";
import CenturyResultAndStatusPrinting from "../Component/Examination/Exam/CenturyResultAndStatusPrinting";
import ResultStatusShow from "../Component/Examination/Exam/ResultStatusShow";
import ResultStatusShowDetails from "../Component/Examination/Exam/ResultStatusShowDetails";
import ResultStatusCandidateList from "../Component/Examination/Exam/ResultStatusCandidateList";
import ResultAndCertificateInstitute from "../Component/Examination/Exam/ResultAndCertificate";
import EvaluationCenterMappingStatus from "../pages/CMS/Exam/EvaluationCenterMappingStatus";
import ResultAndCertificateInstituteLong from "../Component/Examination/Exam/ResultCertificateLong";
import ResultAndCertificateCorrectionResults from "../Component/Examination/Exam/CorrectedResultAndCertificate";
import ResultAndCertificateInstituteTable from "../pages/CMS/Exam/ResultAndCertificateInstituteTable";
import AcademisthanResultStatus from "../pages/CMS/Exam/AcadmisthanResultStatus";
import BCLSMarkCertificateReady from "../Component/Examination/Exam/BCLSMarkCertificateReady";
import ResultCorrection from "../Component/Examination/Exam/ResultCorrection";
import ResultCorrectionForApproval from "../Component/Examination/Exam/ResultCorrectionForApproval";
import ExamFeesDetails from "../Component/Examination/Exam/ExamFeesDetails";
import SelectedCandidatesForPayment from "../Component/Examination/Exam/SelectedCandidateListForPayment";
import FeeInfo from "../Component/Login/AplicationForm/FeeInfo";

import AttendanceReport from "../Component/Examination/Exam/AttendanceReport";
import BclsResult from "../Component/Examination/Exam/BclsResult";
import STTAssessmentMarksPage from "../pages/STT/STTAssessmentMarksPage";
import AssessmentCourseMapping from "../Component/Examination/Exam/AssessmentCourseMapping";
import AddExamination from "../pages/AddExamination";
import PublishResult from "../pages/CMS/Exam/PublishResult";

function ExamRoutes({ userLoginId, userTypeId }) {
  return (
    <>
      <MandatoryTaskPopup userLoginId={userLoginId} userTypeId={userTypeId} />

      <Routes>
        <Route
          path="ReadyforAssessment"
          element={
            <PaddedLayout>
              <ReadyforAssessment />
            </PaddedLayout>
          }
        />
        <Route
          path="ElectiveSubjectAssign"
          element={
            <PaddedLayout>
              <ElectiveSubjectAssign />
            </PaddedLayout>
          }
        />
        <Route
          path="BCLSResultStatus"
          element={
            <PaddedLayout>
              <BclsResult />
            </PaddedLayout>
          }
        />
        <Route
          path="ElectiveSubjectAssignBacklog"
          element={
            <PaddedLayout>
              <ElectiveSubjectAssignBacklog />
            </PaddedLayout>
          }
        />
        <Route
          path="ExamFees/"
          element={
            <PaddedLayout>
              <ExamFees />
            </PaddedLayout>
          }
        />
        <Route
          path="ResultStatusShowDetails"
          element={
            <PaddedLayout>
              <ResultStatusShowDetails />
            </PaddedLayout>
          }
        />
        <Route
          path="ResultStatusCandidateList"
          element={
            <PaddedLayout>
              <ResultStatusCandidateList />
            </PaddedLayout>
          }
        />
        <Route
          path="details/"
          element={
            <PaddedLayout>
              <ExamFeesDetails />
            </PaddedLayout>
          }
        />
        <Route
          path="selectedCandidates/"
          element={
            <PaddedLayout>
              <SelectedCandidatesForPayment />
            </PaddedLayout>
          }
        />
        <Route
          path="ResultANdCertificateInstituteLong"
          element={
            <PaddedLayout>
              <ResultAndCertificateInstituteLong />
            </PaddedLayout>
          }
        />
        <Route
          path="ResultAndCertificateInstituteTable"
          element={
            <PaddedLayout>
              <CorrectedResultAndCertificate />
            </PaddedLayout>
          }
        />
        <Route
          path="FeeInfo"
          element={
            <PaddedLayout>
              <FeeInfo />
            </PaddedLayout>
          }
        />
        <Route
          path="HallTicket"
          element={
            <PaddedLayout>
              <HallTicket />
            </PaddedLayout>
          }
        />
        <Route
          path="AttendanceReport"
          element={
            <PaddedLayout>
              <AttendanceReport />
            </PaddedLayout>
          }
        />
        <Route
          path="EvaluationReport"
          element={
            <PaddedLayout>
              <EvaluationReport />
            </PaddedLayout>
          }
        />
        <Route
          path="ResultAndCertificate"
          element={
            <PaddedLayout>
              <ResultAndCertificate />
            </PaddedLayout>
          }
        />
        <Route
          path="SeatingArrangement"
          element={
            <PaddedLayout>
              <SeatingArrangement />
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
          path="ResultStatus"
          element={
            <PaddedLayout>
              <ResultStatusShow />
            </PaddedLayout>
          }
        />
        <Route
          path="ResultCorrection"
          element={
            <PaddedLayout>
              <ResultCorrection />
            </PaddedLayout>
          }
        />
        <Route
          path="ResultAndCertificateCorrectionResults"
          element={
            <PaddedLayout>
              <ResultAndCertificateCorrectionResults />
            </PaddedLayout>
          }
        />
        <Route
          path="ResultAndCertificateInstitute"
          element={
            <PaddedLayout>
              <ResultAndCertificateInstitute />
            </PaddedLayout>
          }
        />
        <Route
          path="EvaluationCenterMappingStatus"
          element={
            <PaddedLayout>
              <ExamEvaluationCenterMappingStatus />
            </PaddedLayout>
          }
        />
        <Route
          path="AcademisthanResultStatus"
          element={
            <PaddedLayout>
              <AcademisthanResultStatus />
            </PaddedLayout>
          }
        />
        <Route
          path="BCLSMarkCertificateReady"
          element={
            <PaddedLayout>
              <BCLSMarkCertificateReady />
            </PaddedLayout>
          }
        />
        <Route
          path="ResultCorrectionForApproval"
          element={
            <PaddedLayout>
              <ResultCorrectionForApproval />
            </PaddedLayout>
          }
        />

        {/* STT Assessment Marks Entry */}
        <Route
          path="STTAssessmentMarks"
          element={
            <PaddedLayout>
              <STTAssessmentMarksPage />
            </PaddedLayout>
          }
        />
        <Route
          path="AssessmentCourseMapping"
          element={
            <PaddedLayout>
              <AssessmentCourseMapping />
            </PaddedLayout>
          }
        />
        <Route path="AddExamination" element={<AddExamination />} />
        <Route
          path="PublishResult"
          element={
            <PaddedLayout>
              <PublishResult />
            </PaddedLayout>
          }
        />
      </Routes>
    </>
  );
}

export default ExamRoutes;
