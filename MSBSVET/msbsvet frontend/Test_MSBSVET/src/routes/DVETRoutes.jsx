




// SuperAdminRoutes.jsx - Routes for SuperAdmin users
import { Routes, Route } from "react-router-dom";
import PaddedLayout from "../Component/Context/ReactComponent";
import DashboardComponent from "../Component/DVETHO/Dashboard/DashboardComponent";



import ElectionDuty from "../pages/DVETO/ElectionDuty";
import SelfRequirementDVET from "../Component/ITISpecification/TradeRequirements_new"
import OfficeProfile from "../pages/DVETO/OfficeProfile";
import DPDC_2203 from "../pages/DVETO/DPDC_2203";
import DPDC_2230 from "../pages/DVETO/DPDC_2230";

function DVETRoutes({ userLoginId, isLoggedIn, onLoginStateChange }) {
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
                path="ElectionDuty"
                element={
                    <PaddedLayout>
                        <ElectionDuty />
                    </PaddedLayout>
                }
            />

            <Route
                path="SelfRequirementDVET"
                element={
                    <PaddedLayout>
                        <SelfRequirementDVET />
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

           
            



        </Routes>
    );
}

export default DVETRoutes;
