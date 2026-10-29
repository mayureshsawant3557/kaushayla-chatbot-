import { GetInstiuteInfo } from '../../Endpoints_All/Base/Institute';
import agent from '../api/agent';

export const getInstituteDetails = async (InstituteID) => {
    if (!InstituteID) throw new Error("InstituteID is required");
    debugger;
    const res = await agent.get(
        `${GetInstiuteInfo}?InstituteID=${InstituteID}`
    );
    return res.data;
};