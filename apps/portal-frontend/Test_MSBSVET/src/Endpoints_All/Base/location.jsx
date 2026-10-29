import { baseURL } from "../config/baseConfig";

export const urlAllDistricts = `${baseURL}/region/districts`;
export const GetMasterRegion = `${baseURL}/Base/GetMasterRegion`;
export const GetMasterDistrict = `${baseURL}/Base/GetMasterDistrict`;
export const GetMasterTaluka = `${baseURL}/Base/GetMasterTaluka`;
export const GetMasterCity = `${baseURL}/Base/GetMasterCity`;
export const GetPincodeData = `${baseURL}/Base/GetPincodeData`;
export const GetStates = `${baseURL}/Base/GetMasterTableList?TableName=Master_State&DataValueField=StateID&DataTextField=State&HasSelect=true`;
export const GetDistricts = `${baseURL}/Base/GetMasterDistrict`;
export const GetTalukas = `${baseURL}/Base/GetMasterTaluka`;
export const GetCities = `${baseURL}/Base/GetMasterCity`;
export const GetUserRegionDistrictTaluka = `${baseURL}/Base/GetUserRegionDistrictTaluka`;
export const GetRegions = `${baseURL}/Base/GetMasterRegion`;
export const GetMasterRegionDistrict = `${baseURL}/Base/GetMasterRegionDistrict`;
export const GetMasterDistrictTalukas = `${baseURL}/Base/GetMasterDistrictTalukas`;
