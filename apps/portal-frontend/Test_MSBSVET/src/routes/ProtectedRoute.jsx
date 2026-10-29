import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, isLoggedIn, requiredUserType, userType, loading }) {
    // Show loading state while checking authentication
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // Redirect to signin if not logged in
    if (!isLoggedIn) {
        return <Navigate to="/signin" replace />;
    }

    // Check user type authorization
    if (requiredUserType && userType !== requiredUserType) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
}

export default ProtectedRoute;