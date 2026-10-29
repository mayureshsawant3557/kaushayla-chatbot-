import { baseURL } from "../config/baseConfig";

// ---------- Master / Dropdown APIs ----------
export const GetMasterRegionDistrict = `${baseURL}/Base/GetMasterRegionDistrict`;
export const GetMasterInstitute = `${baseURL}/Base/GetMasterInstitute`;
export const GetMasterSector = `${baseURL}/Base/GetMasterSector`;
export const GetMasterCourse = `${baseURL}/Base/GetMasterCourse`; // params: SectorID, CourseTypeID, Flag
export const GetCourseByCollogeID = `${baseURL}/Base/GetCourseByCollogeID`; // param: instituteId (confirm query/path)
export const GetAdmissionYear = `${baseURL}/Base/GetAdmissionYear`;

// ---------- Success Story APIs ----------
export const GetAllSuccessStories = `${baseURL}/api/InstituteBase/GetAllSuccessStories`;
export const SearchSuccessStories = `${baseURL}/api/InstituteBase/SearchSuccessStories`; // params: districtId, sectorId, instituteId, courseId, publishStatus
export const GetSuccessStoryById = `${baseURL}/api/InstituteBase/GetSuccessStoryById`; // append /{id}
export const SaveSuccessStory = `${baseURL}/api/InstituteBase/SaveSuccessStory`;
export const DeleteSuccessStory = `${baseURL}/api/InstituteBase/DeleteSuccessStory`;

export const GetCandidateID = `${baseURL}/Base/GetCandidateID`;
export const GetSuccessStoryResult = `${baseURL}/api/InstituteBase/GetSuccessStoryResult`;
