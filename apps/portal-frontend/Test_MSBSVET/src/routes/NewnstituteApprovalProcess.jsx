import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

import PromotersDetails from '../Component/NewInstituteApprovalProcess/InstituteProfile/PromotersDetails';
import LOIGeneration from '../Component/NewInstituteApprovalProcess/InstituteProfile/LOIGeneration';
import InstitutePayment from '../Component/NewInstituteApprovalProcess/InstituteProfile/InstitutePayment';
//import PromotingOrganization from '../Component/NewInstituteApprovalProcess/InstituteProfile/PromotingOrganization';
//import ProposedCourse from '../Component/NewInstituteApprovalProcess/InstituteProfile/ProposedCourse';
import ProposedInstituteDetails from '../Component/NewInstituteApprovalProcess/InstituteProfile/ProposedInstituteDetails';
import ProposedCourse from '../Component/NewInstituteApprovalProcess/InstituteProfile/ProposedCourse';
import SelfDeclaration from '../Component/NewInstituteApprovalProcess/InstituteProfile/SelfDeclaration';
import PaddedLayout from "../Component/Context/ReactComponent";
//import DashboardTInstituteContent from "../Component/NewInstituteApprovalProcess/Dashboard/DashboardTInstitute";
import BuildingDetails from "../Component/NewInstituteApprovalProcess/InstituteProfile/BuildingDetails";
import UnitsForInspection from "../Component/NewInstituteApprovalProcess/InstituteProfile/UnitsForInspection";
import LandDetails from "../Component/NewInstituteApprovalProcess/InstituteProfile/LandDetails";
import WorkshopDetails from "../Component/NewInstituteApprovalProcess/InstituteProfile/WorkshopDetails";
import BankDetails from "../Component/NewInstituteApprovalProcess/InstituteProfile/BankDetails";
import PowerDetails from "../Component/NewInstituteApprovalProcess/InstituteProfile/PowerDetails";
import TrainingEquipmentDetails from "../Component/NewInstituteApprovalProcess/InstituteProfile/TrainingEquipmentDetails";
import CommonFacilityDetails from "../Component/NewInstituteApprovalProcess/InstituteProfile/CommonFacilityDetails";
import InspectionFee from "../Component/NewInstituteApprovalProcess/InstituteProfile/InspectionFee";
import InspectionRequestDetails from "../Component/NewInstituteApprovalProcess/InstituteProfile/InspectionRequestDetails";
import FeeInfo from "../Component/Login/AplicationForm/FeeInfo";
import InspectionCommittee from "../pages/DVETO/InspectionCommittee";
import agent from '../lib/api/agent';
import { GetInstituteIDByInstituteCode } from "../Endpoints_All/Institute/institute";
import { CheckLOIGenerated } from '/src/Endpoints_All/Institute/institute.jsx';
import { SwalHelper }  from '../utils/swalHelper'; 
import RecommendedUnits from "../pages/DVETO/RecommendedUnits";


//function NewIstituteApprovalProcessRoutes() {
//    return (
//        <Routes>
//            {/*<Route path="/dashboard" element={<DashboardTInstitute />} />*/}
//            {/*<Route path="dashboard" element={<PaddedLayout><DashboardTInstituteContent /></PaddedLayout>} />*/}
//            <Route path="PromotersDetails" element={<PaddedLayout><PromotersDetails /></PaddedLayout>} />
//            <Route path="LOIGeneration" element={<PaddedLayout><LOIGeneration /></PaddedLayout>} />
//            <Route path="InstitutePayment" element={<PaddedLayout><InstitutePayment /></PaddedLayout>} />
//            {/*<Route path="ExamFees" element={<PaddedLayout><PromotingOrganization /></PaddedLayout>} />*/}
//            <Route path="PromotingOrganization" element={<PaddedLayout><PromotingOrganization /></PaddedLayout>} />
//            <Route path="ProposedInstituteDetails" element={<PaddedLayout><ProposedInstituteDetails /></PaddedLayout>} />
//            <Route path="SelfDeclaration" element={<PaddedLayout><SelfDeclaration /></PaddedLayout>} />
//            <Route path="BuildingDetails" element={<PaddedLayout><BuildingDetails /></PaddedLayout>} />
//            <Route path="UnitsForInspection" element={<PaddedLayout><UnitsForInspection /></PaddedLayout>} />
//            <Route path="LandDetails" element={<PaddedLayout><LandDetails /></PaddedLayout>} />
//            <Route path="WorkshopDetails" element={<PaddedLayout><WorkshopDetails /></PaddedLayout>} />
//            <Route path="InstituteBank" element={<PaddedLayout><BankDetails /></PaddedLayout>} />
//            <Route path="PowerDetails" element={<PaddedLayout><PowerDetails /></PaddedLayout>} />
//            <Route path="TrainingEquipmentDetails" element={<PaddedLayout><TrainingEquipmentDetails /></PaddedLayout>} />
//            <Route path="CommonFacilityDetails" element={<PaddedLayout><CommonFacilityDetails /></PaddedLayout>} />
//            <Route path="InspectionFee" element={<PaddedLayout><InspectionFee /></PaddedLayout>} />
//            <Route path="InspectionRequest" element={<PaddedLayout><InspectionRequestDetails /></PaddedLayout>} />
//            <Route path="FeeInfo" element={<PaddedLayout><FeeInfo /></PaddedLayout>} />

//        </Routes>
//    );
//}

//export default NewIstituteApprovalProcessRoutes;


//  const LOIProtectedRoutes = ({ userLoginId }) => {
//     const navigate = useNavigate();
//     const location = useLocation();
//     const [isLOIGenerated, setIsLOIGenerated] = useState(null); 

//     useEffect(() => {
//         const checkLOI = async () => {
//             if (!userLoginId) {
//                 setIsLOIGenerated(0);
//                 return;
//             }

//             try {
//                 console.log("Fetching Institute ID for UserLoginID:", userLoginId);
//                 const resInstitute = await agent.get(
//                     `${GetInstituteIDByInstituteCode}?InstituteCode=${userLoginId}`
//                 );

//                 if (resInstitute.data?.Data) {
//                     const instID = resInstitute.data.Data;
//                     console.log("Institute ID set to:", instID);

                    
//                     const payload = {
//                         instituteId: instID,
//                         exitInstituteID: 0,
//                         UserLoginID: userLoginId,

//                         PageCode: "LOIProtectedRoutes",

//                         itemId: 0,
//                         IPAddress: "1"
 
//                     };
//                     const resLOI = await agent.post(CheckLOIGenerated, payload);
//                     console.log("LOI Check response:", resLOI);
//                     const loiStatus = resLOI.data?.Data || 0; 

//                     setIsLOIGenerated(loiStatus);
//                     if (loiStatus === 0) { // before -->> loiStatus === 0
//                         SwalHelper.warning(
//                             "Alert",
//                             "LOI not generated. Please generate LOI first."
//                         ).then((result) => {
//                             if (result.isConfirmed) {
//                                 navigate("/tinstitute/dashboard", { replace: true });
//                             }
//                         });
//                     }

//                 } else {
//                     console.warn("Institute not found for UserLoginID:", userLoginId);
//                     setIsLOIGenerated(0);
//                     SwalHelper.warning("Error", "LOI not generated. Redirecting to dashboard.")
//                         .then(() => {
//                             navigate("/tinstitute/dashboard", { replace: true });


//                         });
//                 }
//             } catch (error) {
//                 console.error("Error fetching LOI status:", error);
//                 setIsLOIGenerated(0);
//                 SwalHelper.warning("Error", "LOI not generated. Redirecting to dashboard.")
//                     .then(() => {
//                         navigate("/tinstitute/dashboard", { replace: true });


//                     });
//             }
//         };

//         checkLOI();
//     }, [userLoginId, navigate]);

//     if (isLOIGenerated === null) {
//         return <div></div>; 
//     }

//     if (isLOIGenerated === 0) {
//         return null; 
//     }

//     // Protected routes
//     return (
//         <Routes>
//             <Route path="BuildingDetails" element={<PaddedLayout><BuildingDetails /></PaddedLayout>} />
//             <Route path="UnitsForInspection" element={<PaddedLayout><UnitsForInspection /></PaddedLayout>} />
//             <Route path="LandDetails" element={<PaddedLayout><LandDetails /></PaddedLayout>} />
//             <Route path="WorkshopDetails" element={<PaddedLayout><WorkshopDetails /></PaddedLayout>} />
//             <Route path="InstituteBank" element={<PaddedLayout><BankDetails /></PaddedLayout>} />
//             <Route path="PowerDetails" element={<PaddedLayout><PowerDetails /></PaddedLayout>} />
//             <Route path="TrainingEquipmentDetails" element={<PaddedLayout><TrainingEquipmentDetails /></PaddedLayout>} />
//             <Route path="CommonFacilityDetails" element={<PaddedLayout><CommonFacilityDetails /></PaddedLayout>} />
//             <Route path="InspectionFee" element={<PaddedLayout><InspectionFee /></PaddedLayout>} />
//             <Route path="InspectionRequest" element={<PaddedLayout><InspectionRequestDetails /></PaddedLayout>} />
//             <Route path="FeeInfo" element={<PaddedLayout><FeeInfo /></PaddedLayout>} />
//             {/*<Route path="*" element={<div>Access Denied</div>} /> */}{/* Catch-all for protected paths */}
//             <Route path="InspectionCommittee" element={<PaddedLayout><InspectionCommittee/></PaddedLayout>} /> 
//         </Routes>
//     );
// };

const LOIProtectedRoutes = ({ userLoginId, children }) => {
    const navigate = useNavigate();
    const [isLOIGenerated, setIsLOIGenerated] = useState(null);

    useEffect(() => {
        const checkLOI = async () => {
            if (!userLoginId) {
                setIsLOIGenerated(0);
                return;
            }

            try {
                const resInstitute = await agent.get(
                    `${GetInstituteIDByInstituteCode}?InstituteCode=${userLoginId}`
                );

                if (resInstitute.data?.Data) {
                    const instID = resInstitute.data.Data;

                    const payload = {
                        instituteId: instID,
                        exitInstituteID: 0,
                        UserLoginID: userLoginId,
                        PageCode: "LOIProtectedRoutes",
                        itemId: 0,
                        IPAddress: "1"
                    };

                    const resLOI = await agent.post(CheckLOIGenerated, payload);
                    const loiStatus = resLOI.data?.Data || 0;
                    setIsLOIGenerated(loiStatus);

                    if (loiStatus === 0) {
                        SwalHelper.warning("Alert", "LOI not generated. Please generate LOI first.")
                            .then((result) => {
                                if (result.isConfirmed) {
                                    navigate("/tinstitute/dashboard", { replace: true });
                                }
                            });
                    }
                } else {
                    setIsLOIGenerated(0);
                    SwalHelper.warning("Error", "LOI not generated. Redirecting to dashboard.")
                        .then(() => navigate("/tinstitute/dashboard", { replace: true }));
                }
            } catch (error) {
                setIsLOIGenerated(0);
                SwalHelper.warning("Error", "LOI not generated. Redirecting to dashboard.")
                    .then(() => navigate("/tinstitute/dashboard", { replace: true }));
            }
        };

        checkLOI();
    }, [userLoginId, navigate]);

    if (isLOIGenerated === null) return <div></div>;
    if (isLOIGenerated === 0) return null;

    return children;
};

// export function NewIstituteApprovalProcessRoutes({ userLoginId, isLoggedIn, onLoginStateChange, userType }) {
//     const showLOICheck = userType === 'InstituteTempary';
    
    

//     return (
//         <Routes>
           
//             <Route path="PromotersDetails" element={<PaddedLayout><PromotersDetails /></PaddedLayout>} />
//             <Route path="LOIGeneration" element={<PaddedLayout><LOIGeneration /></PaddedLayout>} />
//             <Route path="InstitutePayment" element={<PaddedLayout><InstitutePayment /></PaddedLayout>} />
//             {/*<Route path="PromotingOrganization" element={<PaddedLayout><PromotingOrganization /></PaddedLayout>} />*/}
//             <Route path="ProposedInstituteDetails" element={<PaddedLayout><ProposedInstituteDetails /></PaddedLayout>} />
//             <Route path="SelfDeclaration" element={<PaddedLayout><SelfDeclaration /></PaddedLayout>} />
//             <Route path="ProposedCourse" element={<PaddedLayout><ProposedCourse /></PaddedLayout>} />

            
//             {!showLOICheck ? (
//                 <Route path="*" element={<LOIProtectedRoutes userLoginId={userLoginId} />} />
//             ) : (
//                 <>
                   
//                     <Route path="BuildingDetails" element={<PaddedLayout><BuildingDetails /></PaddedLayout>} />
//                     <Route path="UnitsForInspection" element={<PaddedLayout><UnitsForInspection /></PaddedLayout>} />
//                     <Route path="LandDetails" element={<PaddedLayout><LandDetails /></PaddedLayout>} />
//                     <Route path="WorkshopDetails" element={<PaddedLayout><WorkshopDetails /></PaddedLayout>} />
//                     <Route path="InstituteBank" element={<PaddedLayout><BankDetails /></PaddedLayout>} />
//                     <Route path="PowerDetails" element={<PaddedLayout><PowerDetails /></PaddedLayout>} />
//                     <Route path="TrainingEquipmentDetails" element={<PaddedLayout><TrainingEquipmentDetails /></PaddedLayout>} />
//                     <Route path="CommonFacilityDetails" element={<PaddedLayout><CommonFacilityDetails /></PaddedLayout>} />
//                     <Route path="InspectionFee" element={<PaddedLayout><InspectionFee /></PaddedLayout>} />
//                     <Route path="InspectionRequest" element={<PaddedLayout><InspectionRequestDetails /></PaddedLayout>} />
//                         <Route path="FeeInfo" element={<PaddedLayout><FeeInfo /></PaddedLayout>} />
//                         <Route path="InspectionCommittee" element={<PaddedLayout><InspectionCommittee /></PaddedLayout>} />
//                         <Route path="RecommendedUnits" element={<PaddedLayout><RecommendedUnits/></PaddedLayout>} />
//                 </>
//             )}
//         </Routes>
//     );
// }

export function NewIstituteApprovalProcessRoutes({ userLoginId, isLoggedIn, onLoginStateChange, userType }) {
    const showLOICheck = userType === 'InstituteTempary';

    return (
        <Routes>
            {/* Public routes - no LOI check needed */}
            <Route path="PromotersDetails" element={<PaddedLayout><PromotersDetails /></PaddedLayout>} />
            <Route path="LOIGeneration" element={<PaddedLayout><LOIGeneration /></PaddedLayout>} />
            <Route path="InstitutePayment" element={<PaddedLayout><InstitutePayment /></PaddedLayout>} />
            <Route path="ProposedInstituteDetails" element={<PaddedLayout><ProposedInstituteDetails /></PaddedLayout>} />
            <Route path="SelfDeclaration" element={<PaddedLayout><SelfDeclaration /></PaddedLayout>} />
            <Route path="ProposedCourse" element={<PaddedLayout><ProposedCourse /></PaddedLayout>} />

            {/* LOI Protected routes */}
            {showLOICheck ? (
                <>
                    <Route path="BuildingDetails" element={<LOIProtectedRoutes userLoginId={userLoginId}><PaddedLayout><BuildingDetails /></PaddedLayout></LOIProtectedRoutes>} />
                    <Route path="UnitsForInspection" element={<LOIProtectedRoutes userLoginId={userLoginId}><PaddedLayout><UnitsForInspection /></PaddedLayout></LOIProtectedRoutes>} />
                    <Route path="LandDetails" element={<LOIProtectedRoutes userLoginId={userLoginId}><PaddedLayout><LandDetails /></PaddedLayout></LOIProtectedRoutes>} />
                    <Route path="WorkshopDetails" element={<LOIProtectedRoutes userLoginId={userLoginId}><PaddedLayout><WorkshopDetails /></PaddedLayout></LOIProtectedRoutes>} />
                    <Route path="InstituteBank" element={<LOIProtectedRoutes userLoginId={userLoginId}><PaddedLayout><BankDetails /></PaddedLayout></LOIProtectedRoutes>} />
                    <Route path="PowerDetails" element={<LOIProtectedRoutes userLoginId={userLoginId}><PaddedLayout><PowerDetails /></PaddedLayout></LOIProtectedRoutes>} />
                    <Route path="TrainingEquipmentDetails" element={<LOIProtectedRoutes userLoginId={userLoginId}><PaddedLayout><TrainingEquipmentDetails /></PaddedLayout></LOIProtectedRoutes>} />
                    <Route path="CommonFacilityDetails" element={<LOIProtectedRoutes userLoginId={userLoginId}><PaddedLayout><CommonFacilityDetails /></PaddedLayout></LOIProtectedRoutes>} />
                    <Route path="InspectionFee" element={<LOIProtectedRoutes userLoginId={userLoginId}><PaddedLayout><InspectionFee /></PaddedLayout></LOIProtectedRoutes>} />
                    <Route path="InspectionRequest" element={<LOIProtectedRoutes userLoginId={userLoginId}><PaddedLayout><InspectionRequestDetails /></PaddedLayout></LOIProtectedRoutes>} />
                    <Route path="FeeInfo" element={<LOIProtectedRoutes userLoginId={userLoginId}><PaddedLayout><FeeInfo /></PaddedLayout></LOIProtectedRoutes>} />
                    <Route path="InspectionCommittee" element={<LOIProtectedRoutes userLoginId={userLoginId}><PaddedLayout><InspectionCommittee /></PaddedLayout></LOIProtectedRoutes>} />
                </>
            ) : (
                <>
                    <Route path="BuildingDetails" element={<PaddedLayout><BuildingDetails /></PaddedLayout>} />
                    <Route path="UnitsForInspection" element={<PaddedLayout><UnitsForInspection /></PaddedLayout>} />
                    <Route path="LandDetails" element={<PaddedLayout><LandDetails /></PaddedLayout>} />
                    <Route path="WorkshopDetails" element={<PaddedLayout><WorkshopDetails /></PaddedLayout>} />
                    <Route path="InstituteBank" element={<PaddedLayout><BankDetails /></PaddedLayout>} />
                    <Route path="PowerDetails" element={<PaddedLayout><PowerDetails /></PaddedLayout>} />
                    <Route path="TrainingEquipmentDetails" element={<PaddedLayout><TrainingEquipmentDetails /></PaddedLayout>} />
                    <Route path="CommonFacilityDetails" element={<PaddedLayout><CommonFacilityDetails /></PaddedLayout>} />
                    <Route path="InspectionFee" element={<PaddedLayout><InspectionFee /></PaddedLayout>} />
                    <Route path="InspectionRequest" element={<PaddedLayout><InspectionRequestDetails /></PaddedLayout>} />
                    <Route path="FeeInfo" element={<PaddedLayout><FeeInfo /></PaddedLayout>} />
                    <Route path="InspectionCommittee" element={<PaddedLayout><InspectionCommittee /></PaddedLayout>} />
                    <Route path="RecommendedUnits" element={<PaddedLayout><RecommendedUnits /></PaddedLayout>} />
                </>
            )}
        </Routes>
    );
}


export default NewIstituteApprovalProcessRoutes;