// StaffRoutes.jsx - Fixed imports and routing
import { Routes, Route } from "react-router-dom";
import PaddedLayout from "../Component/Context/ReactComponent";

import StaffDashboard from "../Component/Login/CandidateAndStaff/CandidateLogin";


import Staff from "../Component/UserTypes/Staff";
import Address from "../Component/Login/CandidateAndStaff/Address";
import Parent from "../Component/Login/CandidateAndStaff/Parent";
import Category from "../Component/Login/CandidateAndStaff/Category";
import Qualification from "../Component/Login/CandidateAndStaff/Qualification";
import Training from "../Component/Login/CandidateAndStaff/Training";
import AdditionalDetails from "../Component/Login/CandidateAndStaff/AdditionalDetails";
import BankDetails from "../Component/Login/CandidateAndStaff/BankDetails";
import WorkExperience from "../Component/Login/CandidateAndStaff/WorkExperience";
import SectorialExpertise from "../Component/Login/CandidateAndStaff/SectorialExpertise";
import Verify from "../Component/Login/CandidateAndStaff/Verify";
import StaffManagement from "../Component/Borad02/Verification/StaffManagement";
import StaffVerification from "../pages/Secretary/StaffVerification";
import AadhaarReverificationPage from "../Component/Login/CandidateAndStaff/AadhaarReverificationPage";
import AttendanceDashboard from "../Component/Login/CandidateAndStaff/AttendanceDashboard";
function StaffRoutes({ userLoginId, isLoggedIn, onLoginStateChange }) {
    return (
        <Routes>
            {/* Main Dashboard - FIXED: Use proper staff dashboard component */}
            <Route
                path="dashboard"
                element={
                    <PaddedLayout>
                        <StaffDashboard
                            userLoginId={userLoginId}
                            isLoggedIn={isLoggedIn}
                            onLoginStateChange={onLoginStateChange}
                        />
                    </PaddedLayout>
                }
            />

            {/* Profile Management Routes */}
            <Route path="Primary" element={<PaddedLayout><Staff /></PaddedLayout>} />
            <Route path="Address" element={<PaddedLayout><Address /></PaddedLayout>} />
            <Route path="Parent" element={<PaddedLayout><Parent /></PaddedLayout>} />
            <Route path="Category" element={<PaddedLayout><Category /></PaddedLayout>} />
            <Route path="Qualification" element={<PaddedLayout><Qualification /></PaddedLayout>} />
            <Route path="Training" element={<PaddedLayout><Training /></PaddedLayout>} />
            <Route path="Additional" element={<PaddedLayout><AdditionalDetails /></PaddedLayout>} />
            <Route path="Bank" element={<PaddedLayout><BankDetails /></PaddedLayout>} />
            <Route path="WorkExperience" element={<PaddedLayout><WorkExperience /></PaddedLayout>} />

            {/* Staff-specific Routes */}
            <Route path="SectorialExpertise" element={<PaddedLayout><SectorialExpertise /></PaddedLayout>} />
            <Route path="LockApplicationForm" element={<PaddedLayout><Verify /></PaddedLayout>} />
            <Route path="StaffManagementSearch" element={<PaddedLayout><StaffManagement /></PaddedLayout>} />
            <Route path="StaffVerification" element={<PaddedLayout>< StaffVerification /></PaddedLayout>} />
            <Route path="AttendanceDashboard" element={<PaddedLayout>< AttendanceDashboard /></PaddedLayout>} />
            <Route
                path="AadhaarReverify"
                element={
                    <PaddedLayout>
                        <AadhaarReverificationPage />
                    </PaddedLayout>
                }
            />
        </Routes>
    );
}

export default StaffRoutes;