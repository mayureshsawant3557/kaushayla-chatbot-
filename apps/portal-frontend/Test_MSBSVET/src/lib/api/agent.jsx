import axios from "axios";
import Swal from "sweetalert2";
import { baseURL } from "../../Endpoints_All/config/baseConfig";
import {
  generateAesKey,
  aesEncrypt,
  rsaEncryptAesKey,
  aesDecrypt,
} from "./cryptoService";
import forge from "node-forge";
import {
  getAccessToken,
  isTokenExpired,
  getPublicKey,
  publicKeyReady,
} from "./authService";
import { refreshAccessToken } from "./refershTokenService";

const sleep = (delay) => {
  return new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
};
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

const hardLogout = () => {
  localStorage.clear();
  sessionStorage.clear();
  delete agent.defaults.headers.common.Authorization;

  Swal.close();
  sessionStorage.setItem("OPEN_LOGIN_POPUP", "true");
  // redirect to home
  //window.location.href = ASPXbaseURL;
  window.location.replace("/React/Public/Home");
};
const showHttpError = ({ status, data }) => {
  console.error("HTTP Error:", {
    status,
    message: data?.message,
  });
};

const agent = axios.create({
  baseURL,
  withCredentials: true,
});

const PUBLIC_APIS = [
  "/api/account/login",
  "/api/account/refresh-token",
  "/api/account/register",
  "/api/account/otp",
  "/api/security/public-key",
  "/Base/GetStaffID",
  "/api/StaffSummary/GetStaffSummary",
  "/api/OTP/send-mobile-otp",
  // FIX: added so a failed auto-login handoff (e.g. from RedirectAuthComponent)
  // is treated the same as the other public/auth endpoints above and does NOT
  // trigger hardLogout() on an already-anonymous session.
  "/api/account/auto-login",
];
const isPublicApi = (url = "") => {
  return PUBLIC_APIS.some((api) =>
    url.toLowerCase().includes(api.toLowerCase()),
  );
};

agent.interceptors.request.use(async (config) => {
  /* 🚫 Skip refresh-token endpoint */
  //if (config.url.includes("refresh-token")) {
  //    return config;
  //}
  if (config.data instanceof FormData) {
    return config;
  }

  //let token = localStorage.getItem("token");
  let token = getAccessToken();
  const isAutoLogin = config?.url?.includes("api/Account/auto-login");

  if (token == null && isAutoLogin) {
    token = config?.data?.jwtToken ?? null;
  }

  if (token && isTokenExpired(token)) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        token = await refreshAccessToken();

        processQueue(null, token);
      } catch (err) {
        processQueue(err, null);
        if (!isPublicApi(config.url)) {
          hardLogout();
        }
        throw err;
      } finally {
        isRefreshing = false;
      }
    }
  }
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  var publicKey = getPublicKey();
  if (!publicKey && config.data) {
    await publicKeyReady;
    publicKey = getPublicKey();
  }

  if (!publicKey || !config.data) {
    return config;
  }

  const { key, iv } = generateAesKey();

  config.__aesKey = key;
  config.__aesIv = iv;

  config.headers["X-Encrypted"] = "true";
  config.headers["X-Encrypted-Key"] = rsaEncryptAesKey(key, publicKey);
  config.headers["X-Encrypted-IV"] = forge.util.encode64(
    forge.util.createBuffer(iv).getBytes(),
  ); //rsaEncryptAesKey(iv, publicKey);

  config.headers["Content-Type"] = "application/json";
  /* ================= Encrypt body ================= */
  const json = JSON.stringify(config.data);

  const encryptedPayload = aesEncrypt(json, key, iv);

  config.data = {
    cipherText: encryptedPayload,
  };
  return config;
});

agent.interceptors.response.use(
  async (response) => {
    

    // if (response.headers["x-encrypted"] === "true") {
    //   const { cipherText } = response.data;

    //   const key = response.config.__aesKey;
    //   const iv = response.config.__aesIv;

    //   const decryptedJson = aesDecrypt(cipherText, key, iv);

    //   response.data = JSON.parse(decryptedJson);
    // }
    if (
  response.headers["x-encrypted"] === "true" &&
  response.data?.cipherText
)
{
    const { cipherText } = response.data;

    const key = response.config.__aesKey;
    const iv = response.config.__aesIv;

    const decryptedJson = aesDecrypt(cipherText, key, iv);

    response.data = JSON.parse(decryptedJson);
}

    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const response = error.response;
    if (originalRequest?.silent) {
      return Promise.resolve({
        data: response?.data, // NULL
        status: response?.status,
      });
    }

    if (!response) {
      await Swal.fire({
        icon: "error",
        title: "Network error",
        text: "Unable to reach server",
      });
      return Promise.reject({
        status: 0,
        message: "Network error",
      });
    }

    // if (response && response.headers?.["x-encrypted"] === "true") {
    //   const { cipherText } = response.data;

    //   const decrypted = aesDecrypt(
    //     cipherText,
    //     originalRequest.__aesKey,
    //     originalRequest.__aesIv,
    //   );

    //   try {
    //     response.data = JSON.parse(decrypted);
    //   } catch {
    //     response.data = { message: decrypted };
    //   }
    // }
    if (
    response &&
    response.headers?.["x-encrypted"] === "true" &&
    response.data?.cipherText
)
{
    const decrypted = aesDecrypt(
        response.data.cipherText,
        originalRequest.__aesKey,
        originalRequest.__aesIv
    );

    try {
        response.data = JSON.parse(decrypted);
    } catch {
        response.data = { message: decrypted };
    }
}
    
    if (response.status === 401) {
      if (!isPublicApi(originalRequest?.url)) {
        hardLogout();
      }
    } else {
      await showHttpError(response);
    }
    if (response?.data) {
      console.error("response.data", response.data);
      return Promise.reject({
        status: response.status,
        ...response.data,
      });
    }

    return Promise.reject(error);
  },
);

export default agent;