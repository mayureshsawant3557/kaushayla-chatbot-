import agent from "../api/agent"
import agentPublic from "../api/publicAgent"
import { userDetailsAPI } from '../../Endpoints_All/Account/userManagement'
import { autoLogin, AccountLogin } from "../../Endpoints_All/Account/authentication";

export const AccountService = {
    getUserDetails: async (userTypeId, userLoginId) => {
        const res = await agent.get(`${userDetailsAPI}?userTypeId=${userTypeId}&userLoginId=${userLoginId}`)
        if (Array.isArray(res.data)) {
            return res.data[0] ?? null;
        }

        return res.data;
    },
    loginApi : async (payload) => {
        const res = await agentPublic.post(AccountLogin, payload);
        return res.data;
    }
}