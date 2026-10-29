let accessToken = null;
//let refreshToken = null;
//let userInfo = null;
//let userInfoAll = null;
let publicKey = null;
let resolveKeyPromise;

const ACCESS_KEY = "access_token";

export const setAccessToken = (token) => {
    if (token) {
        sessionStorage.setItem(ACCESS_KEY, token);
    } else {
        sessionStorage.removeItem(ACCESS_KEY);
    }
};

export const getAccessToken = () => {
    return sessionStorage.getItem(ACCESS_KEY);
};

export const clearTokens = () => {
    sessionStorage.removeItem(ACCESS_KEY);
};

//export const setTokens = (access, refresh) => {
//    accessToken = access;
//    refreshToken = refresh;
//};

//export const setAccessToken = (token) => {
//    accessToken = token;
//};
//export const setRefreshToken = (token) => {
//    refreshToken = token;
//};

/*export const getAccessToken = () => accessToken;*/
//export const getRefreshToken = () => refreshToken;

//export const clearTokens = () => {
//    accessToken = null;
//    refreshToken = null;
//};

export const isAuthenticated = () => {
    return !!getAccessToken();
};

// export const isTokenExpired = (token, skewSeconds = 30) => {
//     if (!token) return true;
//     try {

//         const payload = JSON.parse(atob(token.split(".")[1]));
//         const now = Math.floor(Date.now() / 1000);
//         return payload.exp < (now + skewSeconds);
//     } catch {
//         return true;
//     }
// };


export const isTokenExpired = (token, skewSeconds = 30) => {
    if (!token) return true;

    try {
        const payload = token.split(".")[1]
            .replace(/-/g, "+")
            .replace(/_/g, "/");

        const data = JSON.parse(atob(payload.padEnd(payload.length + (4 - payload.length % 4) % 4, "=")));

        return !data.exp || data.exp <= Math.floor(Date.now() / 1000) + skewSeconds;
    } catch {
        return true;
    }
};

const PUBLIC_KEY = import.meta.env.VITE_PUBLIC_KEY ?? null;

export const publicKeyReady = Promise.resolve(PUBLIC_KEY);

export const getPublicKey = () => PUBLIC_KEY;

//export const publicKeyReady = new Promise(resolve => {
//    resolveKeyPromise = resolve;
//});

//export const setPublicKey = (key) => {
//    publicKey = key;
//    resolveKeyPromise(key);
//};

//export const getPublicKey = () => publicKey;

//export const clearPublicKey = () => {
//    publicKey = null;
//};

