import { setAccessToken, clearTokens } from "../api/authService";
import { baseURL } from '../../Endpoints_All/config/baseConfig';
import axios from "axios";

export const refreshAccessToken = async () => {
    //const refreshToken = getRefreshToken();
  
    //if (!refreshToken) throw new Error("No refresh token");

    try {
        const res = await axios.post(
            `${baseURL}/api/account/refresh-token`,
                 {},/* { refreshToken },*/
            { withCredentials: true }
        );
       /* console.log("Refresh token response:", res.data);*/
        //setTokens(
        //    res.data.AccessToken,
        //    res.data.RefreshToken
        //);
        setAccessToken(
            res.data.AccessToken
        );
        return res.data.AccessToken;
    } catch (err) {
        
        clearTokens();
        throw err;
    }
};