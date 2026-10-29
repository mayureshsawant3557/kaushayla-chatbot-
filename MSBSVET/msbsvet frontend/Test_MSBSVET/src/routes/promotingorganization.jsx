import { Route, Routes } from "react-router-dom";
import PaddedLayout from "../Component/Context/ReactComponent";
import PromotingOrganizations from "../Component/Institute/PromotingOrgnisation/PromotingOrganization";
import PromotingOrganizationDashboard from "../Component/Dashboard/PromotingOrganizationDashboard";
import Promoters from "../Component/Institute/PromotingOrgnisation/Promoters";
import AssociatedInstitutes from "../Component/Institute/PromotingOrgnisation/AssociatedInstitutes";
import PromotingOrganizationSummary from "../Component/Institute/PromotingOrgnisation/PromotingOrganizationSummary";

function PromotingOrganizationLoginRoutes({ userLoginId, isLoggedIn, onLoginStateChange }) {

    return (
       <Routes>
            <Route
                path="dashboard"
                element={
                    <PaddedLayout>
                        <PromotingOrganizationDashboard
                            userLoginId={userLoginId}
                          
                            isLoggedIn={isLoggedIn}
                            onLoginStateChange={onLoginStateChange}
                        />
                       
                    </PaddedLayout>
                }
            />
            if
            <Route path="profile" element={<PaddedLayout><PromotingOrganizations /></PaddedLayout>} />
            <Route path="PromotersDetails" element={<PaddedLayout><Promoters /></PaddedLayout>} />
            <Route path="AssociatedInstitutes" element={<PaddedLayout><AssociatedInstitutes /></PaddedLayout>} />
            <Route path="Summary" element={<PaddedLayout><PromotingOrganizationSummary /></PaddedLayout>} />
        </Routes> 
       
    );
}

export default PromotingOrganizationLoginRoutes;
