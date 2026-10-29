import { Routes, Route } from "react-router-dom";
import InstituteRegistrationFeeInfo from "../Component/NewInstituteApprovalProcess/InstituteProfile/InstituteRegistrationFeeInfo";
import PaddedLayout from "../Component/Context/ReactComponent";

function FeeRoutes() {
  return (
    <Routes>
      <Route
        path="InstituteRegistrationFeeInfo"
        element={
          <PaddedLayout>
            <InstituteRegistrationFeeInfo />
          </PaddedLayout>
        }
      />

    </Routes>
  );
}

export default FeeRoutes;
