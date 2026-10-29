// AuthRoutes.jsx - Fixed routing logic
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PaddedLayout from '../Component/Context/ReactComponent';
import SignInPage from '../Component/Home/SignInPage';
import AccountRecovery from '../Component/signIn-trouble/AccountRecovery';
import AfterRegister from '../Component/AfterRegister';
import CandidateRegistrationForm from '../Component/UserTypes/Candidate';
import StaffRegistrationForm from '../Component/UserTypes/Staff';
import ProtectedRoute from './ProtectedRoute';
import UnauthorizedAccess from '../Component/UnauthorizedAccess';

function AuthRoutes({ isLoggedIn, onLoginStateChange, userType, loading }) {
    return (
        <Routes>
            {/* Sign In Route - FIXED */}
            <Route
                path="signin"
                element={
                    isLoggedIn ? (
                        // Redirect based on user type
                        userType === 'candidate' ? (
                            <Navigate to="/Candidate/dashboard" replace />
                        ) : userType === 'staff' ? (
                            <Navigate to="/Staff/dashboard" replace />
                        ) : (
                            <Navigate to="/" replace />
                        )
                    ) : (
                        <PaddedLayout>
                            <SignInPage onLoginStateChange={onLoginStateChange} />
                        </PaddedLayout>
                    )
                }
            />

            {/* Account Recovery */}
            <Route
                path="account-recovery"
                element={
                    <PaddedLayout>
                        <AccountRecovery />
                    </PaddedLayout>
                }
            />

            {/* After Registration */}
            <Route
                path="after-register"
                element={
                    <PaddedLayout>
                        <AfterRegister />
                    </PaddedLayout>
                }
            />

            {/* Registration Routes */}
            <Route
                path="candidate/register"
                element={
                    <PaddedLayout>
                        <CandidateRegistrationForm />
                    </PaddedLayout>
                }
            />

            <Route
                path="staff/register"
                element={
                    <PaddedLayout>
                        <StaffRegistrationForm />
                    </PaddedLayout>
                }
            />

            {/* Dashboard Route - FIXED: Remove circular redirect */}
            <Route
                path="dashboard"
                element={
                    <ProtectedRoute
                        isLoggedIn={isLoggedIn}
                        loading={loading}
                    >
                        {userType === 'candidate' ? (
                            <Navigate to="/Candidate/dashboard" replace />
                        ) : userType === 'staff' ? (
                            <Navigate to="/Staff/dashboard" replace />
                        ) : (
                            <Navigate to="/auth/signin" replace />
                        )}
                    </ProtectedRoute>
                }
            />

            {/* Unauthorized Access */}
            <Route
                path="unauthorized"
                element={
                    <PaddedLayout>
                        <UnauthorizedAccess />
                    </PaddedLayout>
                }
            />

            {/* Default Route */}
            <Route
                path="*"
                element={
                    <Navigate to={isLoggedIn ? "/auth/dashboard" : "/auth/signin"} replace />
                }
            />
        </Routes>
    );
}

export default AuthRoutes;