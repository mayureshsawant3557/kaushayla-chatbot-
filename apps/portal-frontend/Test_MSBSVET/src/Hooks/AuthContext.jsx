import { createContext, useContext, useState, useEffect } from "react";
import agent from "../lib/api/agent";
import { setAccessToken, getAccessToken, isTokenExpired, clearTokens } from "../lib/api/authService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userLoginId, setUserLoginId] = useState('');
    const [userType, setUserType] = useState('');
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load session on mount
    useEffect(() => {
        try {
            const storedUserInfo = JSON.parse(sessionStorage.getItem("userInfo") || "{}");
            const storedUserInfoAll = JSON.parse(sessionStorage.getItem("userInfoAll") || "{}");
            //const token = localStorage.getItem("token");
            //const refreshToken = localStorage.getItem("refreshToken");
            const token = getAccessToken();

            if (storedUserInfo?.isLoggedIn && token && !isTokenExpired(token)) {
                setIsLoggedIn(true);
                setUserLoginId(storedUserInfo.profileId || "");
                setUserType(storedUserInfo.userType || "");
                setUserInfo(storedUserInfoAll);
                //localStorage.setItem("token", token);
                setAccessToken(token);
                //localStorage.setItem("refreshToken", refreshToken);
                agent.defaults.headers.common.Authorization = `Bearer ${token}`;
            }
        } catch {
        }
        setLoading(false);
    }, []);

    // login
    const login = (profileId, type, fullUserInfo) => {
        setIsLoggedIn(true);
        setUserLoginId(profileId);
        setUserType(type);
        setUserInfo(fullUserInfo);

        sessionStorage.setItem(
            "userInfo",
            JSON.stringify({
                isLoggedIn: true,
                profileId,
                userType: type,
            })
        );

        sessionStorage.setItem("userInfoAll", JSON.stringify(fullUserInfo));
        //setAccessToken(fullUserInfo.AccessToken);
        //setTokens(
        //    fullUserInfo.AccessToken,
        //    fullUserInfo.RefreshToken.Token
        //);
        setAccessToken(
            fullUserInfo.AccessToken
        );
        //localStorage.setItem("token", "tkn-" + Date.now());
        //localStorage.setItem("token", fullUserInfo.AccessToken);
        //localStorage.setItem("refreshToken", fullUserInfo.RefreshToken.Token);
        agent.defaults.headers.common.Authorization = `Bearer ${fullUserInfo.AccessToken}`;
    };

    // logout
    const logout = () => {
        setIsLoggedIn(false);
        setUserLoginId("");
        setUserType("");
        setUserInfo(null);

        sessionStorage.clear();
        localStorage.clear();
        //setAccessToken(null);
        clearTokens();

        delete agent.defaults.headers.common.Authorization;

    };

    return (
        <AuthContext.Provider value={{
            isLoggedIn,
            userLoginId,
            userType,
            userInfo,
            loading,
            login,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);



}










