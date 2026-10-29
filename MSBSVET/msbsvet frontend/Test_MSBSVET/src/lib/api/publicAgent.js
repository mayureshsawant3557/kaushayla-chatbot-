import axios from "axios";
import forge from "node-forge";
import { baseURL } from "../../Endpoints_All/config/baseConfig";
import {
    generateAesKey,
    aesEncrypt,
    aesDecrypt,
    rsaEncryptAesKey
} from "./cryptoService";
import { SwalHelper } from "../../utils/swalHelper";
import { getPublicKey } from "../api/authService";   

const publicAgent = axios.create({
    baseURL,
    withCredentials: true
});

publicAgent.interceptors.request.use(config => {

    //delete config.headers.Authorization;

    const publicKey = getPublicKey();

    // No encryption needed
    if (!publicKey || !config.data) {
        return config;
    }

    const { key, iv } = generateAesKey();

    config.__aesKey = key;
    config.__aesIv = iv;

    config.headers["X-Encrypted"] = "true";
    config.headers["X-Encrypted-Key"] = rsaEncryptAesKey(key, publicKey);
    config.headers["X-Encrypted-IV"] =
        forge.util.encode64(forge.util.createBuffer(iv).getBytes());

    config.headers["Content-Type"] = "application/json";

    const json = JSON.stringify(config.data);
    config.data = {
        cipherText: aesEncrypt(json, key, iv)
    };

    return config;
});

/* ================= RESPONSE ================= */
publicAgent.interceptors.response.use(
    response => {

        if (response.headers["x-encrypted"] === "true") {
            const { cipherText } = response.data;
            const decrypted = aesDecrypt(
                cipherText,
                response.config.__aesKey,
                response.config.__aesIv
            );

            response.data = JSON.parse(decrypted);
        }

        return response;
    },
    async error => {
        const originalRequest = error.config;
        const response = error.response;
        
        if (originalRequest?.silent) {
            return Promise.resolve({
                data: null,
                status: response?.status
            });
        }

        if (!response) {
            await SwalHelper.error({
                icon: "error",
                title: "Network error",
                text: "Unable to reach server"
            });
            return Promise.reject({
                status: 0,
                message: "Network error"
            });
        }

        if (
            response &&
            response.headers?.["x-encrypted"] === "true"
        ) {
            const { cipherText } = response.data;

            const decrypted = aesDecrypt(
                cipherText,
                originalRequest.__aesKey,
                originalRequest.__aesIv
            );

            try {
                response.data = JSON.parse(decrypted);
            } catch {
                response.data = { message: decrypted };
            }
        }
        
        //SwalHelper.error(
        //    "Request Failed",
        //    response.data?.message || "Something went wrong"
        //);
        if (response?.data) {
            return Promise.reject({
                status: response.status,
                ...response.data
            });
        }

        return Promise.reject(error);
    }
);

export default publicAgent;