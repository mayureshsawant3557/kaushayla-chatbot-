import { baseURL } from "../config/baseConfig";

export const GetNotificationList = `${baseURL}/api/ManageNotification/GetNotificationList`;
export const GetNotificationListForDisplay = `${baseURL}/api/ManageNotification/GetNotificationListForDisplay`;
export const SaveNotification = `${baseURL}/api/ManageNotification/SaveNotification`;
export const DeleteNotification = `${baseURL}/api/ManageNotification/DeleteNotification`;
export const ProjectConfiguration = `${baseURL}/api/ProjectConfiguration`;
export const GetTableViewList = `${baseURL}/api/Report/GetTableViewList`;
export const GetColumnList = `${baseURL}/api/Report/GetColumnList`;
export const GetReportList = `${baseURL}/api/Report/GetReportList`;
export const GetReport = `${baseURL}/api/Report/GetReport`;
export const SaveReport = `${baseURL}/api/Report/SaveReport`;
export const DeleteReport = `${baseURL}/api/Report/DeleteReport`;
export const GetUsersList = `${baseURL}/api/UserManagement/GetUsersList`;
export const SaveUser = `${baseURL}/api/UserManagement/SaveUser`;
export const ActivateOrDeactivateUser = `${baseURL}/api/UserManagement/ActivateOrDeactivateUser`;
export const ActivityStatus = `${baseURL}/api/ActivityStatus`;

export const ExecuteReport = `${baseURL}/api/Report/ExecuteReport`;

export const ApprovedPendingCandidateList = `${baseURL}/api/ReportByInstitute/candidate-list`;
export const GetCollegeById = `${baseURL}/api/Admission/courses-by-college`;
//export const GetEvaluationForUnlockAPI =
  //`${baseURL}/api/Administration/GetEvaluationForUnlock`;
  export const GetEvaluationForUnlockAPI = "/api/Administration/GetEvaluationForUnlock";
  
export const GetCourseTypeAPI =
  `${baseURL}/Base/GetCourseType`;
  

export const GetExamTypeAPI =
  `${baseURL}/Base/GetExamType`;
  export const GetAllExamFeesAPI =
  `${baseURL}/api/Administration/GetAllExamFees`;

export const GetExamFeesByIDAPI =
  `${baseURL}/api/Administration/GetExamFeesByID/`;


export const SaveExamFeesAPI =
  `${baseURL}/api/Administration/SaveExamFees`;
   export const GetEvaluationForUnlock =
  `${baseURL}/api/Administration/GetEvaluationForUnlock`;
  export const UpdateEvaluationMarksUnlock =
  `${baseURL}/api/Administration/UpdateEvaluationMarksUnlock`;
  ///     new page endpoints for  batch transfer 
  export const GetMasterInstitute =
  `${baseURL}/Base/GetMasterInstitute`;

export const GetCourseByCollegeID =
  `${baseURL}/Base/GetCourseByCollogeID`;

export const GetInstituteCourseBatches =
  `${baseURL}/api/Administration/GetInstituteCourseBatches`;

export const GetBatchWiseAdmittedCandidate =
  `${baseURL}/api/Administration/GetBatchWiseAdmittedCandidate`;

export const TransferBatch =
  `${baseURL}/api/Administration/TransferBatch`;
///  endpoint of  Search courses in examination 
export const MasterSectorAPI =
  `${baseURL}/Base/GetMasterSector`;
  export const CourseTypeAPI =
  `${baseURL}/Base/GetCourseType`;
 export const MasterEntryQualificationAPI =
  `${baseURL}/Base/GetMasterEntryQualification`; 
  export const MasterCourseTypeAPI =
  `${baseURL}/Base/GetMasterCourseType`;
  export const MasterCourseFilterAPI =
  `${baseURL}/Base/GetMasterCourseFilter`;
  export const CourseSearchAPI =
  `${baseURL}/Base/GetCourseSearch`;
  export const MasterCourseAPI =
  `${baseURL}/Base/GetMasterCourse`;
  ///....................................................../// New Courses Page API 
  
// export const MasterSectorapi =
//   `${baseURL}/Base/GetMasterSector`;

// export const MasterSubSectorAPI =
//   `${baseURL}/Base/GetMasterSubSector`;

// export const MasterCourseCategoryAPI =
//   `${baseURL}/Base/GetCourseType`;

// export const MasterExamTypeAPI =
//   `${baseURL}/Base/GetExamType`;

// export const MasterTableListAPI =
//   `${baseURL}/Base/GetMasterTableList`;
  
 export const GetMasterSectorapi       = `${baseURL}/Base/GetMasterSector`;
export const GetMasterSubSectorAPI    = `${baseURL}/Base/GetMasterSubSector`;
export const GetCourse       = `${baseURL}/Base/GetCourseType`;
 export const GetExamType          = `${baseURL}/Base/GetExamType`;
 export const GetMasterTableListAPI    = `${baseURL}/Base/GetMasterTableList`;
 export const SaveCourseapi       = `${baseURL}/CourseDetails/SaveCourse`;





export const GetInstituteManagementDetailsReport = `${baseURL}/api/ReportByInstitute/step-coordinators-list`;
export const GetContactOfficeList = `${baseURL}/api/Administration/GetContactOfficeList`;
export const SendGrievance = '/api/Grievance/SendGrievance'; 
export const CheckGrievanceStatus = '/api/Grievance/CheckGrievanceStatus';
////----------------------------------------update mobile page-----------------//
export const getMobileNoDuplicateAPI  = `${baseURL}/api/Registration/IsMobileNoDuplicate`;
export const getUserLoginIdsByNameAPI  = `${baseURL}/api/Account/userLoginIdsByName`;
export const updateMobileNumberAPI     = `${baseURL}/api/Account/updateMobileNumber`;
export const resetPasswordAPI          = `${baseURL}/api/Account/resetPassword`;
//export const SendGrievance = "/api/Grievance/SendGrievance";
//export const CheckGrievanceStatus = "/api/Grievance/CheckGrievanceStatus";

export const GetUserTypes = `${baseURL}/Base/GetMasterTableList`;

export const GetEMailSMS = `${baseURL}/Base/GetEMailSMS`;
// /src/Endpoints_All/Administration/admin.jsx

export const GetInstituteIDByInstituteCodeAPI = "/Base/GetInstituteIDByInstituteCode";///Examfees Institute login endpoints api

export const GetBatchesForExamFeesAPI = "/api/Exam/batches-for-exam-fees";//Examfees institute

export const GetCurrentAdmissionYearAPI = "/Base/GetCurrentAdmissionYear";//Examfees institute

export const GetGazetteReportData = "/api/ReportByInstitute/GetReportGazette";

export const GetCandidatePhotoDetails = `${baseURL}/api/Administration/GetCandidatePhotoDetails`;
export const UpdateFixedOrientationImage = `${baseURL}/api/Administration/UpdateFixedOrientationIssueImage`;
