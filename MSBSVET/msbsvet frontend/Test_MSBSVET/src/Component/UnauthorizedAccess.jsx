import React from 'react';
import { useNavigate } from 'react-router-dom';

function UnauthorizedAccess() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md mx-4">
                <div className="text-6xl mb-4">🚫</div>
                <h1 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h1>
                <p className="text-gray-600 mb-8">
                    You don't have permission to access this page.
                </p>
                <div className="space-y-4">
                    <button
                        onClick={() => navigate('/signin')}
                        className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Go to Sign In
                    </button>
                    <button
                        onClick={() => navigate(-1)}
                        className="w-full bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    );
}

export default UnauthorizedAccess;