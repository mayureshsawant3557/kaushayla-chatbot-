import { baseURL } from '../config/baseConfig';



export const GetCourseByID = `${baseURL}/api/CourseDetails/GetCourseByID`;

export const SaveCourse = `${baseURL}/api/CourseDetails/SaveCourse`;

export const GetTimeTableForEdit = `${baseURL}/api/CourseDetails/GetTimeTableForEdit`;

export const UpdateCourseDisplayAdmissionNewUnit =
    `${baseURL}/api/CourseDetails/UpdateCourseDisplayAdmissionNewUnit`;