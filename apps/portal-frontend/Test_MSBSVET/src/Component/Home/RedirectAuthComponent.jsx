//import { useEffect, useState } from "react";
//import { useNavigate, useLocation } from "react-router-dom";
//import Swal from "sweetalert2";
//import { useAuth } from "../../Hooks/AuthContext";
//import { useAccount } from "../../lib/hooks/useAccount.jsx";

//const RedirectAuthComponent = () => {
//    const [isLoading, setIsLoading] = useState(true);
//    const navigate = useNavigate();
//    const location = useLocation();
//    const { login } =  useAuth();
//    const { autoAccountLogin } = useAccount();

//    useEffect(() => {
//        async function performAutoLogin() {
//            const params = new URLSearchParams(location.search);
//            const token = params.get("token");

//            if (!token) {
//                setIsLoading(false);
//                await Swal.fire({
//                    icon: "error",
//                    title: "Token Missing",
//                    text: "No token found in URL to perform auto-login.",
//                });
//                navigate('/');
//                return;
//            }
//            2
//            try {
//                const { user, redirectUrl } = await autoAccountLogin(token);

//                if (user && redirectUrl) {
//                    const userData = user;

//                    console.log("User Data:", userData);

//                    // Detect user type from dashboard path
//                    let userType = "candidate";
//                    if (userData.DashBoardPathReact) {
//                        const dp = userData.DashBoardPathReact.toLowerCase();
//                        if (dp.includes("superadmin")) userType = "superadmin";
//                        else if (dp.includes("staff")) userType = "staff";
//                        else if (dp.includes("cms")) userType = "CMS";
//                        else if (dp.includes("institute")) userType = "institute";
//                        else if (dp.includes("board")) userType = "board";
//                        else if (dp.includes("candidate")) userType = "candidate";
//                    }

//                    console.log("Detected User Type:", userType);

//                    // Use the login function from useAuth hook
//                    login(userData.UserLoginID, userType, userData);

//                    // Store JWT token for future reference
//                    localStorage.setItem('jwt_token', token);

//                    // IMPORTANT: Wait for session to be set
//                    await new Promise(resolve => setTimeout(resolve, 500));

//                    // Handle redirect URL
//                    let redirectTo = redirectUrl;

//                    console.log("Original redirectTo:", redirectTo);

//                    // Clean up the redirect URL
//                    redirectTo = redirectTo
//                        .replace(/^(\.+\/)+/, '')
//                        .replace(/^\/+/, '/')
//                        .replace(/\/+/g, '/');

//                    if (!redirectTo.startsWith('/')) {
//                        redirectTo = '/' + redirectTo;
//                    }

//                    console.log("Cleaned redirectTo:", redirectTo);
//                    console.log("Session Storage userInfo:", sessionStorage.getItem('userInfo'));
//                    console.log("Local Storage token:", localStorage.getItem('token'));

//                    // Set loading to false
//                    setIsLoading(false);

//                    // Navigate with state to force re-check
//                    console.log("Navigating to:", redirectTo);
//                    navigate(redirectTo, {
//                        replace: true,
//                        state: { fromAuth: true }
//                    });

//                } else {
//                    setIsLoading(false);
//                    console.error("Invalid response structure:", user);
//                    await Swal.fire({
//                        icon: "error",
//                        title: "Auto-login failed",
//                        text: "Invalid response from server",
//                    });
//                    navigate("/");
//                }
//            } catch (error) {
//                setIsLoading(false);
//                console.error("Auto-login error:", error);
//                await Swal.fire({
//                    icon: "error",
//                    title: "Auto-login failed",
//                    text: error.response?.data?.ErrorMessage || error.message || "Server error",
//                });
//                navigate("/");
//            }
//        }

//        performAutoLogin();
//    }, [location.search, navigate, login]);

//    if (!isLoading) {
//        return null;
//    }

//    return (
//        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
//            <div className="bg-white p-6 rounded shadow-md text-center">
//                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//                <div className="text-lg font-semibold text-gray-700">Authenticating...</div>
//                <div className="text-sm text-gray-500 mt-2">Setting up your session...</div>
//            </div>
//        </div>
//    );
//};

//export default RedirectAuthComponent;

import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useAccount } from "../../lib/hooks/useAccount";

const RedirectAuthComponent = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { autoLogin, isLoading } = useAccount();

    useEffect(() => {
        const token = new URLSearchParams(location.search).get("token");
        
        if (!token) {
            Swal.fire({
                icon: "error",
                title: "Token Missing",
                text: "No token found in URL."
            }).then(() => navigate("/"));
            return;
        }

        autoLogin(token);
    }, [location.search]);

    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded shadow-md text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <div className="text-lg font-semibold text-gray-700">
                    Authenticating...
                </div>
                <div className="text-sm text-gray-500 mt-2">
                    Setting up your session...
                </div>
            </div>
        </div>
    );
};

export default RedirectAuthComponent;
