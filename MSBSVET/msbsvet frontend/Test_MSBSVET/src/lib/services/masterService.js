// src/services/masterService.js
import {
    GetMasterPromoter,
    GetMasterPromoterType,
    GetMasterPromotingType,
} from "../../Endpoints_All/Base/masterData";
import agent from "../api/agent";

export const MasterService = {
    getPromoters: async () => (await agent.get(GetMasterPromoter)).data,
    getPromoterTypes: async (group = "") =>
        (await agent.get(GetMasterPromoterType, {
            params: { Group: group }
        })).data,
    getPromotingTypes: async () => (await agent.get(GetMasterPromotingType)).data
};