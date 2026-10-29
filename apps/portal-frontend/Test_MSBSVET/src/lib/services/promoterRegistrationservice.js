import agent from "../api/agent";
import { RegisterPromotorOrganisation } from "../../Endpoints_All/Registration/registration";
import { GetDashBoardDetails } from "../../Endpoints_All/PromotorOrg/promotorOrgEndPoints";
import {
    GetInstituteIDByInstituteCode,
    GetPromotingOrganisationIDByInstituteID,
    GetPromotingOrganisationDetails
} from "../../Endpoints_All/Base/Institute";

export const promoterRegistrationService = {
    register: async (payload) => {
        const response = await agent.post(
            RegisterPromotorOrganisation,
            payload,
            {
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                timeout: 30000,
            }
        );

        return response.data;
    },
    dashboardDetails: async (promotorUserID, options = {}) => {
        
        if (!promotorUserID) {
            throw new Error("promotorUserID is required");
        }

        const {
            tableName = "dev",
            statusParam = "R",
        } = options;

        const res = await agent.get(GetDashBoardDetails, {
            params: {
                tableName,
                promotingOrganisationId: promotorUserID,
                statusParam,
            },
        });

        return res.data;
    },
    getInstituteIDByInstituteCode: async (InstituteCode) => {
        if (!InstituteCode) {
            throw new Error("InstituteCode is required");
        }

        const res = await agent.get(GetInstituteIDByInstituteCode, {
            params: {
                InstituteCode
            }
        });

        return res.data?.Data;
    },
    getOrganisationIdByInstituteId: async (instituteId) => {
        if (!instituteId) throw new Error("InstituteId is required");

        const res = await agent.get(
            `${GetPromotingOrganisationIDByInstituteID}/${instituteId}`
        );

        return res.data?.Data;
    },
    GetPromotingOrganisationDetails: async (payload) => {
        const response = await agent.post(
            GetPromotingOrganisationDetails,
            payload,
            {
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                timeout: 30000,
            }
        );

        return response.data;
    },
};