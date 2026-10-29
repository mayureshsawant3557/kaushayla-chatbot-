import agent from "../api/agent";
import { GetPincodeData, GetMasterDistrict, GetMasterTaluka, GetMasterCity, GetRegions, GetUserRegionDistrictTaluka, GetMasterRegionDistrict, GetMasterDistrictTalukas } from "../../Endpoints_All/Base/location";
import { GetMasterTableList } from "../../Endpoints_All/Base/masterData";

const GET_STATES_API = `${GetMasterTableList}?TableName=Master_State&DataValueField=StateID&DataTextField=State&HasSelect=true`;

export const AddressService = {
    getStates: async () => {
        const res = await agent.get(GET_STATES_API);
        return res.data;
    },
    
   


    getDistricts: async () => {
        const res = await agent.get(GetMasterDistrict);
        return res.data;
    },

    getTalukas: async () => {
        const res = await agent.get(GetMasterTaluka);
        return res.data;
    },

    getCities: async () => {
        const res = await agent.get(GetMasterCity);
        return res.data;
    },
    getRegions: async () => {
        const res = await agent.get(GetRegions);
        return res.data;
    },


    getRegionDistricts: async (regionId = -1) => {
        const res = await agent.get(`${GetMasterRegionDistrict}?RegionID=${regionId}`);
        return res.data;
    },
    getDistrictTalukas: async (districtID = -1) => {
        const res = await agent.get(`${GetMasterDistrictTalukas}?RegionID=${districtID}`);
        return res.data;
    },
    getPincodeDetails: async (pincode) => {
        const res = await agent.get(`${GetPincodeData}?Pincode=${pincode}`);
        return res.data;
    },
     

    getUserRegionDistrictTaluka: async (userLoginID) => {
        const res = await agent.get(`${GetUserRegionDistrictTaluka}?userLoginID=${userLoginID}`);
        return res.data;
    },
};