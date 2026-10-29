import { baseURL } from "../config/baseConfig";

export const GetInstituteIDByInstituteCode = `${baseURL}/Base/GetInstituteIDByInstituteCode`;
export const batchesforattendance = `${baseURL}/api/Exam/batches-for-attendance`;
export const candidateforattendance = `${baseURL}/api/Exam/candidate-for-attendance`;
export const SubjectAttendanceByBatchID = `${baseURL}/api/Exam/attendance-subjects`;
export const AttendanceByBatchID = `${baseURL}/api/Exam/attendance`;
export const batchesforassessment = `${baseURL}/api/Exam/batches-for-assessment`;
export const batchesforhallticket = `${baseURL}/api/Exam/batches-for-hall-ticket`;
export const batchesforexamfees = `${baseURL}/api/Exam/batches-for-exam-fees`;
export const batchesforelectivesubjectassign = `${baseURL}/api/Exam/batches-for-elective-subject-assign`;
export const candidateforelectivesubjectassign = `${baseURL}/api/Exam/candidate-for-elective-assign`;
export const batchesforelectivesubjectassignprevious = `${baseURL}/api/Exam/batches-for-elective-subject-assign-previous`;

export const GetBacklogCandidateForElectiveAssignByBatchID = `${baseURL}/api/Exam/backlog-candidate-for-elective-assign`;
export const SaveElectiveSubjects = `${baseURL}/api/Exam/save-elective-subjects`;


export const GetExaminationListAPI =
  `${baseURL}/Base/GetExamination`;
  export const GetExaminationByInstitute =
  `${baseURL}/Base/GetExaminationByInstitute?`;
  export const InstitudePrintResultCertificateAPI =
  `${baseURL}/api/Exam/generate-certificate-pdf-zip`;
export const approvedresultcandidatelistAPI =
  `${baseURL}/api/Exam/approved-result-candidate-list`;
export const InstituteBulkPrintResultAPI =
  `${baseURL}/api/Exam/institute-bulk-print-result`;
  export const  SaveActivityStatusDetailsAPI =
  `${baseURL}api/ActivityStatus/SaveActivityStatusDetails`;

export const PrintResultCertificateBulkAPI =
  `${baseURL}/api/Exam/print-result-certificate-bulk`;
  export const EvaluationCenterMappingAllAPI =
  `${baseURL}/api/Exam/evaluation-center-mapping-all`;
  //export const GetEvaluationForUnlockAPI =
  //`${baseURL}/api/Administration/GetEvaluationForUnlock`;
  export const GetMasterInstituteForExamCerterAPI =
  "/Base/GetMasterInstituteForExamCerter";

export const GetMasterCourseFilterAPI =
  "/Base/GetMasterCourseFilter";
  export const GetAllExamFeesAPI =
  `${baseURL}/Administration/GetAllExamFees`;

export const GetCourseByCollegeIDAPI =
  "/Base/GetCourseByCollogeID";
  export const GetResultStatusAPI =
  "/api/Exam/result-status";

export const GetTimeTableSubjectAPI =
  "/Base/GetTimeTableSubject";

export const GetDistrictIDByDistrictUserAPI =
  "/Base/GetDistrictIDByDistrictUser";

export const GetDistrictListAPI =
  `${baseURL}/Base/GetMasterDistrict`;

export const GetInstituteListAPI =
  `${baseURL}/Base/GetMasterInstitute`;
  export const resultstatusbybatchidAPI ="/api/Exam/result-status-by-batch";

export const CandidateResultCertificateAPI =
  `${baseURL}/api/Exam/candidate-result-certificate`;

export const CandidatePrintResultCertificateAPI =
  `${baseURL}/api/Exam/candidate-print-result-certificate`;

export const ResultExamWiseAPI =
  `${baseURL}/api/Exam/result-exam-wise`;
  export const candidateprintresultPriCertificate =
  `${baseURL}/api/Exam/candidate-print-result`;

export const ResultInstituteWiseAPI =
  `${baseURL}/api/Exam/result-institute-wise`;

export const BatchPrintResultCertificateAPI =
  `${baseURL}/api/Exam/batch-print-result-certificate`;


  export const GetActivityStatusList =
    `${baseURL}/api/ActivityStatus/GetActivityStatusList`;

    export const SaveActivityStatusDetails =
    `${baseURL}/api/ActivityStatus/SaveActivityStatusDetails`;

    //......................................................................  Result and certificate page  add for easy understanding  /////
    export const BulkStatementOfMarksPDFAPI =
  `${baseURL}/api/Exam/bulk-statement-of-marks-pdf`;

export const BulkCertificatePDFAPI =
  `${baseURL}/api/Exam/bulk-certificate-pdf`;

export const GenerateCertificatePDFZipAPI =
  `${baseURL}/api/Exam/generate-certificate-pdf-zip`;

export const GenerateResultPDFZipAPI =
  `${baseURL}/api/Exam/generate-result-pdf-zip`;
  /// this endpoint create for corrected result certificate page for genrate system result for perticular candidate
  export const generatesystemresultpdf =
  `${baseURL}/api/Exam/generate-system-result-pdf`;
  /// this endpoint create for corrected result certificate page for genrate system certificate for perticular candidate
  export const GenerateSystemCertificatePdfAPI =
  `${baseURL}/api/Exam/generate-system-certificate-pdf`;
  /// this endpoint created for corrected result certificate page for priprient result and certificate for perticular candidate
  export const GeneratePreprintedResultPdfAPI =
  `${baseURL}/api/Exam/generate-preprinted-result-pdf`;
  //.................................................................. Result and cer long////
  export const BulkMarkPdflongAPI =
  `${baseURL}/api/Exam/bulk-statement-of-marks-pdf-long`;
  export const BulkCertificatePdfLongAPI =
  `${baseURL}/api/Exam/bulk-certificate-pdf-long`;
   export const bulkstatementofmarkspdftableAPI =
  `${baseURL}/api/Exam/bulk-statement-of-marks-pdf-table`;




  //test century page comment for understanding... 
   export const instituteresultpdfzip =
  `${baseURL}/api/Exam/institute-result-pdf-zip`;
   export const institutecertificatepdfzip =
  `${baseURL}/api/Exam/institute-certificate-pdf-zip`;
    export const institutepreresultpdf =
  `${baseURL}/api/Exam/institute-pre-result-pdf`;
  export const instituteprecertificatepdf =
  `${baseURL}/api/Exam/institute-pre-certificate-pdf`;
    export const GetBCLSPendingCandidates = `${baseURL}/api/Exam/GetBCLSPendingCandidates`;
export const UpdateSingleCandidateResultDate = `${baseURL}/api/Exam/UpdateSingleCandidateResultDate`;
export const UpdateMultipleCandidatesResultDate = `${baseURL}/api/Exam/UpdateMultipleCandidatesResultDate`;
export const CandidateForExamFees = `${baseURL}/api/Exam/candidate-for-exam-fees`;

export const getExamCenterExamination = `${baseURL}/api/Exam/exam-center-examination`;
export const getExamCenterMapping = `${baseURL}/api/Exam/exam-center-mapping`;
export const getExamCenterMappingByCollege = `${baseURL}/api/Exam/exam-center-mapping-by-college`;
export const saveExamCenters = `${baseURL}/api/Exam/save-exam-centers`;
export const candidateForEvaluationMarksReportDownload = `${baseURL}/api/Exam/candidate-for-evaluation-marks-report-download`;

export const getEvaluationCenterExamination = `${baseURL}/api/Exam/evolution-center-examination`;
export const getEvaluationCenterMapping = `${baseURL}/api/Exam/evaluation-center-mapping`;
export const getEvaluationCenterMappingByCollege = `${baseURL}/api/Exam/evaluation-center-mapping-by-college`;
export const saveEvaluationCenters = `${baseURL}/api/Exam/save-evaluation-centers`;

export const getDistrictIDByDistrictUser = `${baseURL}/Base/GetDistrictIDByDistrictUser`;
export const getCurrentAdmissionYear = `${baseURL}/Base/GetCurrentAdmissionYear`;
export const getMasterInstituteForExamCenter = `${baseURL}/Base/GetMasterInstituteForExamCerter`;
export const getInstituteInfo = `${baseURL}/Base/GetInstiuteInfo`;
export const getExaminationDetails = `${baseURL}/Base/GetExaminationDetails`;
export const GetCandidateForEvaluationMarksAPI =
  "/api/Exam/candidate-for-evaluation-marks";


export const GetElectiveSubjects = `${baseURL}/Base/GetElectiveSubjects`;   
export const Getresultbatchwise =
  `${baseURL}/api/Exam/result-batch-wise`;
  export const batchprintresultcertificateAPI = `${baseURL}/api/Exam/batch-print-result-certificate`;//bclc
  export const certificatelist = `${baseURL}/api/Exam/certificate-list`;   //bclc 
  export const btnPrintSelectedClick = `${baseURL}/api/Exam/btnPrintSelected_Click`;      ///   BCLC API ENdpoints used both or mutiple ids for print selected
  export const bclsprintresultcertificate = `${baseURL}/api/Exam/bcls-print-result-certificate`; // this api used for single pdf for first 
  export const btnPrintSelectedSystemClick = `${baseURL}/api/Exam/print-selected-system`;////  bcls api endpoint 
  export const btnPrintAllClick = `${baseURL}/api/Exam/btnPrintAll_Click`; 
  export const markCertificatePrinted = 
  "/api/Exam/mark-certificate-printed";///bcls api endpoint
//   export const GetInstituteIDByInstituteCodeAPI = "/Base/GetInstituteIDByInstituteCode";  //// Endpoint for Examfees institute login page
//   export const GetBatchesForExamFeesAPI = "/api/Exam/batches-for-exam-fees";

// export const GetCurrentAdmissionYearAPI = "/Base/GetCurrentAdmissionYear";
// Add these to your Endpoints_All/Examination/Exam.js file

//export const GetDistrictIDByDistrictUserAPI = `${baseURL}/Base/GetDistrictIDByDistrictUser`;///  new endpoint created for dvto login
export const GetMasterCourseAPI = `${baseURL}/Base/GetMasterCourse`;/// new endpoint for dvto login 
export const GetSTTInstituteCourseActiveBatches =
  "/api/STT/institute-course-active-batches"; ////     this endpoint created for new cmadmin page for add institute wise course wise filter for active batches for stt assessment marks page
export const GetCMSAdminAssessmentCourses =
  "/api/STT/assessment-courses"; // this endpoint created for new cmsadmin page for add institute wise course wise filtr for active batches for stt assessment marks page and course wise subjects for stt assessment marks page
  export const GetSTTBatchAgencies =
  "/api/STT/BatchAgencies";  
  export const btnGetGreenFieldReportData = `${baseURL}/api/ReportByInstitute/GetGreenFieldReportData`;
  export const savebatchagencymapping =
  "/api/STT/save-batch-agency-mapping"; 
  export const AgenciesForReassign =
  "/api/STT/AgenciesForReassign";  
  export const GetCMSAdminCourseSubjects =
  "/api/STT/course-subjects"; 
                               // this endpoint created for new cmsadmin page for add institute wise course wise filtr for active batches for stt assessment marks page and course wise subjects for stt assessment marks page


export const GetExaminationRemainedToPublishResult = '/api/CMSExam/GetExaminationRemainedToPublishResult';
export const PublishExamsResult = `${baseURL}/api/CMSExam/PublishExamsResult`;                           