

// SuperAdminRoutes.jsx - Routes for SuperAdmin users
import { Routes, Route } from "react-router-dom";
import PaddedLayout from "../Component/Context/ReactComponent";
import DashboardComponent from "../Component/DVETHO/Dashboard/DashboardComponent";


import OfficeProfile from "../pages/DVETO/OfficeProfile";

import ElectionDuty from "../pages/DVETO/ElectionDuty";
import ROOfficerManagement from "../pages/RO/ROOfficerManagement";
import ElectionDutyReport from "../pages/CMS/Administration/ElectionDutyReport";
import SelfRequirementRo from "../pages/DVETO/TradeRequirements_new"
function RoRoutes({ userLoginId, isLoggedIn, onLoginStateChange }) {
    return (
        <Routes>
          
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
                path="ROOfficeManagementDetails"
                element={
                    <PaddedLayout>
                        <ROOfficerManagement />
                    </PaddedLayout>
                }
            />
            <Route
                path="ElectionReport"
                element={
                    <PaddedLayout>
                        <ElectionDutyReport />
                    </PaddedLayout>
                }
            />
            <Route
                path="SelfRequirementRO"
                element={
                    <PaddedLayout>
                        <SelfRequirementRo />
                    </PaddedLayout>
                }
            />
            
            
            
        </Routes>
    );
}

export default RoRoutes;
