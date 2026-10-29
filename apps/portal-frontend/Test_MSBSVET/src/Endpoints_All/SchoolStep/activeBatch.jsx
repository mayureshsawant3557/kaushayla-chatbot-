import { baseURL } from '../config/baseConfig';

export const GetSTTSchoolUnitByInstitute = `${baseURL}/api/SchoolStep/GetSTTSchoolUnitByInstitute`;
export const GetSTTSchoolBatchesByInstitute = `${baseURL}/api/SchoolStep/GetSTTSchoolBatchesByInstitute`;
export const GetSTTSchoolBatchByBatchIDORUnitID = `${baseURL}/api/SchoolStep/GetSTTSchoolBatchByBatchIDORUnitID`;
export const InsertOrUpdateSTTSchoolBatchDetails = `${baseURL}/api/SchoolStep/InsertOrUpdateSTTSchoolBatchDetails`;
export const GetInstituteSchoolsWiseCourse = `${baseURL}/api/SchoolStep/GetInstituteSchoolsWiseCourse`;
export const GetSchoolsList = `${baseURL}/api/SchoolStep/GetSchoolsList`
export const GetCandidateListByBatchID = `${baseURL}/api/SchoolStep/GetCandidateListByBatchID`
export const ConfirmSchoolStepAdmission = `${baseURL}/api/SchoolStep/ConfirmSchoolStepAdmission`
export const GetSTTBatchByBatchIDORUnitIDForSchoolBatch = `${baseURL}/api/SchoolStep/GetSTTBatchByBatchIDORUnitIDForSchoolBatch`
export const GetVerifiedSchools = `${baseURL}/api/SchoolStep/GetVerifiedSchools`