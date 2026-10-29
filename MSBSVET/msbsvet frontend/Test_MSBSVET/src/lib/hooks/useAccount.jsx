import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import agent from "../api/agent";
import { autoLogin } from "../../Endpoints_All/Account/authentication";
import { useAuth } from "../../Hooks/AuthContext";
import { setAccessToken } from "../api/authService";
import { AccountService } from "../services/accountService";

//const detectUserType = (dashboardPath = "") => {
//    const dp = dashboardPath.toLowerCase();

//    if (dp.includes("superadmin")) return "superadmin";
//    if (dp.includes("staff")) return "staff";
//    if (dp.includes("cms")) return "CMS";
//    if (dp.includes("institute")) return "institute";
//    if (dp.includes("board")) return "board";
//    return "candidate";
//};

const normalizeRedirectUrl = (url = "/") => {
    let cleaned = url
        .replace(/^(\.+\/)+/, "")
        .replace(/^\/+/, "/")
        .replace(/\/+/g, "/");

    return cleaned.startsWith("/") ? cleaned : `/${cleaned}`;
};

export const useAccount = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const autoLoginMutation = useMutation({
        retry: false,

        mutationFn: async (jwtToken) => {
            const res = await agent.post(autoLogin, { jwtToken });
            return res.data;
        },

        onSuccess: async ({ user, redirectUrl }) => {
            
            if (!user || !user.AccessToken) {
                throw new Error("Invalid auto-login response");
            }
            
            //localStorage.setItem("token", user.AccessToken);
            //setAccessToken(user.AccessToken);
            //setTokens(
            //    user.AccessToken,
            //    user.RefreshToken?.Token
            //);
            setAccessToken(
                user.AccessToken
            );

            //await loadPublicKey();

            //const userType = detectUserType(user.DashBoardPathReact);
            const userType = user.UserTypeCode;

            // App-level auth
            login(user.UserLoginID, userType, user);
            
            navigate(normalizeRedirectUrl(redirectUrl), {
                replace: true,
                state: { fromAuth: true }
            });
        },

        //onError: async (error) => {
        //    await Swal.fire({
        //        icon: "error",
        //        title: "Auto-login failed",
        //        text:
        //            error?.response?.data?.ErrorMessage ||
        //            error?.message ||
        //            "Server error"
        //    });

        //    navigate("/");
        //}
    });

    //const autoLoginMutation = useMutation({
    //    retry: false,

    //    mutationFn: async (jwtToken) => {
    //        const res = await agent.post(autoLogin, { jwtToken });

    //        if (!res.data.IsLoginAllowed) {
    //            throw new Error(res.data.ErrorMessage || "Login not allowed");
    //        }

    //        if (!res.data.AccessToken) {
    //            throw new Error("Access token missing");
    //        }

    //        return res.data;
    //    }

    //});
    const loginMutation = useMutation({
        retry: false,

        mutationFn: async ({ userLoginID, userPassword }) => {

            const data = await AccountService.loginApi({
                UserLoginID: userLoginID,
                UserPassword: userPassword,
                BrowserInfo: {
                    URL: window.location.href,
                    BrowserName: navigator.appName,
                    BrowserVersion: navigator.appVersion,
                    UserAgent: navigator.userAgent,
                    UserHostAddress: "",
                    UserHostName: ""
                }
            });

            if (!data.IsLoginAllowed) {
                throw new Error(data.ErrorMessage || "Login not allowed");
            }

            if (!data.AccessToken) {
                throw new Error("Access token missing");
            }

            if (!data.IsMultipleLoginAllowed && data.LastLoggedInSessionID > 0) {
                const error = new Error("User already logged in elsewhere");
                error.code = "MULTIPLE_LOGIN";
                error.payload = data;
                throw error;
            }

            return data;
        }


        // added for testing https cookies setup 
        //mutationFn: async ({ userLoginID, userPassword }) => {

        //    const data = await AccountService.loginApi({
        //        UserLoginID: userLoginID,
        //        UserPassword: userPassword,
        //        BrowserInfo: {
        //            URL: window.location.href,
        //            BrowserName: navigator.appName,
        //            BrowserVersion: navigator.appVersion,
        //            UserAgent: navigator.userAgent,
        //            UserHostAddress: "",
        //            UserHostName: ""
        //        }
        //    });

        //    if (!data) {
        //        throw new Error("Login failed");
        //    }

        //    return data;
        //}
    });

    return {
        autoLogin: autoLoginMutation.mutate,
        isAutoLoginLoading: autoLoginMutation.isPending,

        isLoginLoading: loginMutation.isPending,
        loginProcess: loginMutation.mutate, 
        data: loginMutation.data,
        error: loginMutation.error,
        isError: loginMutation.isError,
        isLoading: loginMutation.isPending,
        isSuccess: loginMutation.isSuccess
    };
};
