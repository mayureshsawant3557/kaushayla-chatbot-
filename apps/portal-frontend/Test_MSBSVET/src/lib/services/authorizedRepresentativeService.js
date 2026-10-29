import { GetStaffID } from "../../Endpoints_All/Base/masterData";
import { GetStaffSummary } from "../../Endpoints_All/Staff/summary";
import agent from "../api/agent";

class AuthorizedRepresentativeService {
    async getByApplicationId(applicationId, signal) {

        const staffIdRes = await agent.get(
            `${GetStaffID}?ApplicationID=${applicationId}`,
            { signal }
        );

        if (staffIdRes?.data?.Status !== "Success") {
            throw new Error("PROFILE_NOT_FOUND");
        }

        const summaryRes = await agent.post(
            GetStaffSummary,
            {
                StaffID: staffIdRes.data.Data,
                UserLoginID: "",
                PageCode: "1",
                IPAddress: "127.0.0.1"
            },
            { signal }
        );

        if (
            summaryRes?.data?.Status !== "Success" ||
            !summaryRes?.data?.Data?.StaffPrimarySummary
        ) {
            throw new Error("PROFILE_NOT_FOUND");
        }

        return summaryRes.data.Data.StaffPrimarySummary;
    }
}

export const authorizedRepresentativeService =
    new AuthorizedRepresentativeService();