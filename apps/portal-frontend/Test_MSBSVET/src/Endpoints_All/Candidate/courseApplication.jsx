import { baseURL } from '../config/baseConfig';

export const GetAppliedMainCourse = `${baseURL}/api/CandidateApplyMainCourse/GetAppliedMainCourse`;
export const GetAppliedCourseByCandidateId = `${baseURL}/api/CandidateCourseApply/GetAppliedCourseByCandidateId`;
export const DeleteAppliedCourseByCandidateId = `${baseURL}/api/CandidateCourseApply/DeleteAppliedCourseByCandidateId`;
export const DeleteAppliedCourse = `${baseURL}/api/CandidateCourseApply/DeleteAppliedCourse`;
export const ApplyForCourse = `${baseURL}/api/CandidateCourseApply/ApplyForCourse`;
export const SaveAppliedMainCourse = `${baseURL}/api/CandidateApplyMainCourse/SaveAppliedMainCourse`;
export const GetAppliedCourses = `${baseURL}/api/CandidateCourseApply/GetAppliedCourses`;
export const GetMainCourseAppliedFor = `${baseURL}/api/CandidateApplyMainCourse/GetMainCourseAppliedFor`
export const GetAppliedCourseByCandidateIDApplicationId = `${baseURL}/api/CandidateCourseApply/GetAppliedCourseByCandidateIDApplicationId`;