import { Routes, Route } from "react-router-dom";
import { useLocation } from "react-router-dom";
import CheckApplicationID from "../Component/Admission/CheckApplicationID";
import CandidateListPendingForApproval from "../Component/Admission/CandidateListPendingForApproval";
import CandidateListRejectedbyDveto from "../Component/Admission/CandidateListRejectedbyDveto";
import PaddedLayout from "../Component/Context/ReactComponent";
import AdmissionRejectation from "../Component/SuperAdmin/Reports/AdmissionRejectation";
import Admissionconfirmation from "../Component/SuperAdmin/Reports/Admissionconfirmation";
import AdmissionCancellation from "../Component/SuperAdmin/Reports/AdmissionCancellation";
import PrintAdmissionLetter from "../Component/SuperAdmin/Reports/PrintAdmissionLetter";
import ConfirmAdmissionDetails from "../Component/Admission/ConfirmAdmissionDetails";
import CancelAdmissionDetails from "../Component/Admission/CancelAdmissionDetails";
import BatchTransferNew from "../Component/CMS/Dashboard/Admission/BatchTransferNew";
import TrainingFees from "../Component/CMS/Dashboard/Admission/TrainingFees";
import MandatoryTaskPopup from "../Component/formcomponent/MandatoryTaskPopup";
//import TrainingFees from "../Component/CMS/Dashboard/Admission/TrainingFees";

function CheckApplicationRouter() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const flag = queryParams.get("Flag");

  switch (flag) {
    case "PrintRejectionAdmissionLetter":
      return <AdmissionRejectation />;
    case "PrintAdmissionLetter":
      return <Admissionconfirmation />;
    case "PrintAdmissionCancellationLetter":
      return <AdmissionCancellation />;
    default:
      return <CheckApplicationID />;
  }
}

function AdmissionRoutes({ userLoginId, userType }) {
  return (
    <>
      {userType?.toLowerCase() === "institute" && (
        <MandatoryTaskPopup userLoginId={userLoginId} userTypeId={userType} />
      )}
      <Routes>
        <Route
          path="CandidateListPendingForApproval"
          element={
            <PaddedLayout>
              <CandidateListPendingForApproval />
            </PaddedLayout>
          }
        />
        <Route
          path="CandidateListRejectedbyDveto"
          element={
            <PaddedLayout>
              <CandidateListRejectedbyDveto />
            </PaddedLayout>
          }
        />
        <Route
          path="BatchTransfer"
          element={
            <PaddedLayout>
              <BatchTransferNew />
            </PaddedLayout>
          }
        />
        <Route
          path="ShortTermCourse/CourseTrainingFee"
          element={
            <PaddedLayout>
              <TrainingFees />
            </PaddedLayout>
          }
        />
        <Route
          path="CheckApplicationID"
          element={
            <PaddedLayout>
              <CheckApplicationRouter />
            </PaddedLayout>
          }
        />
        <Route
          path="PrintAdmissionLetter"
          element={
            <PaddedLayout>
              <PrintAdmissionLetter />
            </PaddedLayout>
          }
        />

        {/* <Route path="/confirm-admission-details" element={<ConfirmAdmissionDetails />} /> */}
        <Route
          path="confirm-admission-details"
          element={<ConfirmAdmissionDetails />}
        />
        <Route
          path="cancel-admission-details"
          element={<CancelAdmissionDetails />}
        />
      </Routes>
    </>
  );
}

export default AdmissionRoutes;
