import { baseURL } from "../config/baseConfig";

export const GetElectionDutyList = `${baseURL}/api/InstituteBase/GetElectionDutyList`;
export const GetConstituencyByDistrict = `${baseURL}/api/InstituteBase/GetConstituencyByDistrict`;
export const SaveElectionDutyStaff = `${baseURL}/api/InstituteBase/SaveElectionDutyStaff`;
export const UpdateElectionDutyDeputation = `${baseURL}/api/InstituteBase/UpdateElectionDutyDeputation`;
export const DeleteElectionDutyStaff = `${baseURL}/api/InstituteBase/DeleteElectionDutyStaff`;
export const DeleteElectionDutyDeputation = `${baseURL}/api/InstituteBase/DeleteElectionDutyDeputation`;
export const getDistrict = `${baseURL}/Base/GetMasterDistrict`;
