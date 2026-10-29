import agent from "../api/agent";
  import { GetMasterTableList, GetCandidateID } from "../../Endpoints_All/Base/masterData";

  const GET_CATEGORY_API =
    `${GetMasterTableList}?TableName=Master_Category&DataValueField=CategoryID&DataTextField=Category&HasSelect=true`;
  
export const getMasterList = async () => {
  const response = await agent.get('/api/Master/GetMasterList'); 
  return response.data;
};
 
  const API = {
      // ─── State ───────────────────────────────────────────

    GetAllState: "/api/Master/GetMasterState",
    Insert: "/api/Master/InsertMasterState",
    Update: "/api/Master/UpdateMasterState",
    SoftDelete: (id) => `/api/Master/SoftDeleteMasterState/${id}`,


    // ─── District ─────────────────────────────────────────
    GetAllDistricts:    "/api/Master/GetMasterDistrictTable",
    InsertDistrict:     "/api/Master/InsertMasterDistrict",
    UpdateDistrict:     "/api/Master/UpdateMasterDistrict",
    SoftDeleteDistrict: (id) => `/api/Master/SoftDeleteMasterDistrict/${id}`,

    // ─── Taluka ───────────────────────────────────────────
    GetAllTalukas:    "/api/Master/GetMasterTalukaTable",
    InsertTaluka:     "/api/Master/InsertMasterTaluka",
    UpdateTaluka:     "/api/Master/UpdateMasterTaluka",
    SoftDeleteTaluka: (id) => `/api/Master/SoftDeleteMasterTaluka/${id}`,

    // ─── City ─────────────────────────────────────────────
    GetAllCities:   "/api/Master/GetMasterCity",
    GetCityStats:   "/api/Master/GetMasterCityStats",
    InsertCity:     "/api/Master/InsertMasterCity",
    UpdateCity:     "/api/Master/UpdateMasterCity",
    SoftDeleteCity: (id) => `/api/Master/SoftDeleteMasterCity/${id}`,

    // ─── Pincode ──────────────────────────────────────────
    GetAllPincodes:    "/api/Master/GetMasterPincode",
    GetPincodeStats:   "/api/Master/GetMasterPincodeStats",
    InsertPincode:     "/api/Master/InsertMasterPincode",
    UpdatePincode:     "/api/Master/UpdateMasterPincode",
    SoftDeletePincode: (id) => `/api/Master/SoftDeleteMasterPincode/${id}`,

    // ─── Region ───────────────────────────────────────────
    GetAllRegions:    "/api/Master/GetMasterRegion",
    InsertRegion:     "/api/Master/InsertMasterRegion",
    UpdateRegion:     "/api/Master/UpdateMasterRegion",
    SoftDeleteRegion: (id) => `/api/Master/SoftDeleteMasterRegion/${id}`,

    // ─── Caste ────────────────────────────────────────────
    GetAllCastes:    "/api/Master/GetAllMasterCaste",
    InsertCaste:     "/api/Master/InsertMasterCaste",
    UpdateCaste:     "/api/Master/UpdateMasterCaste",
    SoftDeleteCaste: (id) => `/api/Master/SoftDeleteMasterCaste/${id}`,

    // ─── Category ─────────────────────────────────────────
    GetAllCategories:   "/api/Master/GetMasterCasteCategory",
    InsertCategory:     "/api/Master/InsertMasterCategory",
    UpdateCategory:     "/api/Master/UpdateMasterCategory",
    SoftDeleteCategory: (id) => `/api/Master/SoftDeleteMasterCategory/${id}`,

    // ─── Disability ───────────────────────────────────────
    GetAllDisabilities:   "/api/Master/GetAllDisabilities",
    InsertDisability:     "/api/Master/InsertDisability",
    UpdateDisability:     "/api/Master/UpdateDisability",
    InsertAffiliationPageSoftDeleteDisability: (id) => `/api/Master/SoftDeleteDisability/${id}`,

    // ─── AcademicYear ─────────────────────────────────────
    GetAllAcademicYears:    "/api/Master/GetAllAcademicYears",
    InsertAcademicYear:     "/api/Master/InsertAcademicYear",
    UpdateAcademicYear:     "/api/Master/UpdateAcademicYear",
    SoftDeleteAcademicYear: (id) => `/api/Master/SoftDeleteAcademicYear/${id}`,

    // ─── Activity Status ──────────────────────────────────
    GetAllActivityStatuses:   "/api/Master/GetAllActivityStatuses",
    InsertActivityStatus:     "/api/Master/InsertActivityStatus",
    UpdateActivityStatus:     "/api/Master/UpdateActivityStatus",
    SoftDeleteActivityStatus: (id) => `/api/Master/SoftDeleteActivityStatus/${id}`,

    // ─── Affiliation Pages ────────────────────────────────
    GetAllAffiliationPages:    "/api/Master/GetMasterAffiliationPages",
    InsertAffiliationPage:     "/api/Master/InsertMasterAffiliationPage",
    UpdateAffiliationPage:     "/api/Master/UpdateMasterAffiliationPage",
    SoftDeleteAffiliationPage: (id) => `/api/Master/SoftDeleteMasterAffiliationPage/${id}`,

    // ─── Application Form Links ───────────────────────────
    GetAllApplicationFormLinks:    "/api/Master/GetMasterApplicationFormLinks",
    InsertApplicationFormLink:     "/api/Master/InsertMasterApplicationFormLink",
    UpdateApplicationFormLink:     "/api/Master/UpdateMasterApplicationFormLink",
    SoftDeleteApplicationFormLink: (id) => `/api/Master/SoftDeleteMasterApplicationFormLink/${id}`,

    // ─── Approval Group ───────────────────────────────────
    GetAllApprovalGroups:    "/api/Master/GetMasterApprovalGroups",
    InsertApprovalGroup:     "/api/Master/InsertMasterApprovalGroup",
    UpdateApprovalGroup:     "/api/Master/UpdateMasterApprovalGroup",
    SoftDeleteApprovalGroup: (id) => `/api/Master/SoftDeleteMasterApprovalGroup/${id}`,

    // ─── Approval Order ───────────────────────────────────
    GetAllApprovalOrders:    "/api/Master/GetMasterApprovalOrders",
    InsertApprovalOrder:     "/api/Master/InsertMasterApprovalOrder",
    UpdateApprovalOrder:     "/api/Master/UpdateMasterApprovalOrder",
    SoftDeleteApprovalOrder: (id) => `/api/Master/SoftDeleteMasterApprovalOrder/${id}`,

    // ─── Batch ────────────────────────────────────────────
    GetAllBatches:   "/api/Master/GetMasterBatches",
    InsertBatch:     "/api/Master/InsertMasterBatch",
    UpdateBatch:     "/api/Master/UpdateMasterBatch",
    SoftDeleteBatch: (id) => `/api/Master/SoftDeleteMasterBatch/${id}`,

    // ─── Country ──────────────────────────────────────────
    GetAllCountries:   "/api/Master/GetMasterCountries",
    InsertCountry:     "/api/Master/InsertMasterCountryNew",
    UpdateCountry:     "/api/Master/UpdateMasterCountry",
    SoftDeleteCountry: (id) => `/api/Master/SoftDeleteMasterCountry/${id}`,

    // ─── Sub-Sector ───────────────────────────────────────
    GetAllSubSectors:    "/api/Master/GetMasterSubSectors",
    InsertSubSector:     "/api/Master/InsertMasterSubSector",
    UpdateSubSector:     "/api/Master/UpdateMasterSubSector",
    SoftDeleteSubSector: (id) => `/api/Master/SoftDeleteMasterSubSector/${id}`,

    // ─── Subject Course ───────────────────────────────────
    GetAllSubjectCourses:    "/api/Master/GetMasterSubjectCourses",
    InsertSubjectCourse:     "/api/Master/InsertMasterSubjectCourse",
    UpdateSubjectCourse:     "/api/Master/UpdateMasterSubjectCourse",
    SoftDeleteSubjectCourse: (courseID, subjectCode) =>
      `/api/Master/SoftDeleteMasterSubjectCourse/${courseID}/${subjectCode}`,

    // ─── Language ─────────────────────────────────────────
    GetAllLanguages:    "/api/Master/GetMasterLanguages",
    InsertLanguage:     "/api/Master/InsertMasterLanguage",
    UpdateLanguage:     "/api/Master/UpdateMasterLanguage",
    SoftDeleteLanguage: (id) => `/api/Master/SoftDeleteMasterLanguage/${id}`,

    // ─── Designation ──────────────────────────────────────
    GetAllDesignations:    "/api/Master/GetMasterDesignations",
    InsertDesignation:     "/api/Master/InsertMasterDesignation",
    UpdateDesignation:     "/api/Master/UpdateMasterDesignation",
    SoftDeleteDesignation: (id) => `/api/Master/SoftDeleteMasterDesignation/${id}`,

    // ─── Course Type ──────────────────────────────────────
    GetAllCourseTypes:    "/api/Master/GetMasterCourseTypes",
    InsertCourseType:     "/api/Master/InsertMasterCourseType",
    UpdateCourseType:     "/api/Master/UpdateMasterCourseType",
    SoftDeleteCourseType: (id) => `/api/Master/SoftDeleteMasterCourseType/${id}`,

    // ─── Documents ────────────────────────────────────────
    GetAllDocuments:    "/api/Master/GetMasterDocuments",
    InsertDocument:     "/api/Master/InsertMasterDocument",
    UpdateDocument:     "/api/Master/UpdateMasterDocument",
    SoftDeleteDocument: (id) => `/api/Master/SoftDeleteMasterDocument/${id}`,

    // ─── Facility Group ───────────────────────────────────
    GetAllFacilityGroups:    "/api/Master/GetMasterFacilityGroups",
    InsertFacilityGroup:     "/api/Master/InsertMasterFacilityGroup",
    UpdateFacilityGroup:     "/api/Master/UpdateMasterFacilityGroup",
    SoftDeleteFacilityGroup: (id) => `/api/Master/SoftDeleteMasterFacilityGroup/${id}`,

    // ─── Blood Group ──────────────────────────────────────
    GetAllBloodGroups:    "/api/Master/GetMasterBloodGroups",
    InsertBloodGroup:     "/api/Master/InsertMasterBloodGroup",
    UpdateBloodGroup:     "/api/Master/UpdateMasterBloodGroup",
    SoftDeleteBloodGroup: (id) => `/api/Master/SoftDeleteMasterBloodGroup/${id}`,

    // ─── Gender ───────────────────────────────────────────
    GetAllGenders:    "/api/Master/GetMasterGenders",
    InsertGender:     "/api/Master/InsertMasterGender",
    UpdateGender:     "/api/Master/UpdateMasterGender",
    SoftDeleteGender: (id) => `/api/Master/SoftDeleteMasterGender/${id}`,

    // ─── Building Floor ───────────────────────────────────
    GetAllBuildingFloors:    "/api/Master/GetMasterBuildingFloors",
    InsertBuildingFloor:     "/api/Master/InsertMasterBuildingFloor",
    UpdateBuildingFloor:     "/api/Master/UpdateMasterBuildingFloor",
    SoftDeleteBuildingFloor: (id) => `/api/Master/SoftDeleteMasterBuildingFloor/${id}`,

    // ─── Building Name Type ───────────────────────────────
    GetAllBuildingNameTypes:    "/api/Master/GetMasterBuildingNameTypes",
    InsertBuildingNameType:     "/api/Master/InsertMasterBuildingNameType",
    UpdateBuildingNameType:     "/api/Master/UpdateMasterBuildingNameType",
    SoftDeleteBuildingNameType: (id) => `/api/Master/SoftDeleteMasterBuildingNameType/${id}`,

    // ─── Building Ownership Type ──────────────────────────
    GetAllBuildingOwnershipTypes:    "/api/Master/GetMasterBuildingOwnershipTypes",
    InsertBuildingOwnershipType:     "/api/Master/InsertMasterBuildingOwnershipType",
    UpdateBuildingOwnershipType:     "/api/Master/UpdateMasterBuildingOwnershipType",
    SoftDeleteBuildingOwnershipType: (id) => `/api/Master/SoftDeleteMasterBuildingOwnershipType/${id}`,

    // ─── Land Ownership Type ───────────────────────────────
    GetAllLandOwnershipTypes:    "/api/Master/GetMasterLandOwnershipTypes",
    InsertLandOwnershipType:     "/api/Master/InsertMasterLandOwnershipType",
    UpdateLandOwnershipType:     "/api/Master/UpdateMasterLandOwnershipType",
    SoftDeleteLandOwnershipType: (id) => `/api/Master/SoftDeleteMasterLandOwnershipType/${id}`,

    // ─── Building Status ──────────────────────────────────
    GetAllBuildingStatuses:   "/api/Master/GetMasterBuildingStatuses",
    InsertBuildingStatus:     "/api/Master/InsertMasterBuildingStatus",
    UpdateBuildingStatus:     "/api/Master/UpdateMasterBuildingStatus",
    SoftDeleteBuildingStatus: (id) => `/api/Master/SoftDeleteMasterBuildingStatus/${id}`,

    // ─── Building Usage Type ──────────────────────────────
    GetAllBuildingUsageTypes:    "/api/Master/GetMasterBuildingUsageTypes",
    InsertBuildingUsageType:     "/api/Master/InsertMasterBuildingUsageType",
    UpdateBuildingUsageType:     "/api/Master/UpdateMasterBuildingUsageType",
    SoftDeleteBuildingUsageType: (id) => `/api/Master/SoftDeleteMasterBuildingUsageType/${id}`,

    // ─── Constituency ─────────────────────────────────────
    GetAllConstituencies:   "/api/Master/GetMasterConstituencies",
    InsertConstituency:     "/api/Master/InsertMasterConstituency",
    UpdateConstituency:     "/api/Master/UpdateMasterConstituency",
    SoftDeleteConstituency: (id) => `/api/Master/SoftDeleteMasterConstituency/${id}`,

    // ─── Construction Type ────────────────────────────────
    GetAllConstructionTypes:    "/api/Master/GetMasterConstructionTypes",
    InsertConstructionType:     "/api/Master/InsertMasterConstructionType",
    UpdateConstructionType:     "/api/Master/UpdateMasterConstructionType",
    SoftDeleteConstructionType: (id) => `/api/Master/SoftDeleteMasterConstructionType/${id}`,

    // ─── Construction Year ────────────────────────────────
    GetAllConstructionYears:    "/api/Master/GetMasterConstructionYears",
    InsertConstructionYear:     "/api/Master/InsertMasterConstructionYear",
    UpdateConstructionYear:     "/api/Master/UpdateMasterConstructionYear",
    SoftDeleteConstructionYear: (id) => `/api/Master/SoftDeleteMasterConstructionYear/${id}`,

    // ─── Contact Us Type ──────────────────────────────────
    GetAllContactUsTypes:    "/api/Master/GetMasterContactUsTypes",
InsertContactUsType:     "/api/Master/InsertMasterContactUsType",
UpdateContactUsType:     "/api/Master/UpdateMasterContactUsType",
SoftDeleteContactUsType: (id) => `/api/Master/SoftDeleteMasterContactUsType/${id}`,

    // ─── Course Details ───────────────────────────────────
    GetAllCourseDetails:    "/api/Master/GetMasterCourseDetails",
    InsertCourseDetail:     "/api/Master/InsertMasterCourseDetail",
    UpdateCourseDetail:     "/api/Master/UpdateMasterCourseDetail",
    SoftDeleteCourseDetail: (collegeID, courseID, unitCode) => `/api/Master/SoftDeleteMasterCourseDetail/${collegeID}/${courseID}/${unitCode}`,

    // ─── Sector ───────────────────────────────────────────
    GetAllSectors:    "/api/Master/GetMasterSectors",
    InsertSector:     "/api/Master/InsertMasterSector",
    UpdateSector:     "/api/Master/UpdateMasterSector",
    SoftDeleteSector: (id) => `/api/Master/SoftDeleteMasterSector/${id}`,

    // ─── Title ──────────────────────────────────────────────
    GetAllTitles:    "/api/Master/GetMasterTitles",
    InsertTitle:     "/api/Master/InsertMasterTitle",
    UpdateTitle:     "/api/Master/UpdateMasterTitle",
    SoftDeleteTitle: (id) => `/api/Master/SoftDeleteMasterTitle/${id}`,

    // ─── Signature Authority ──────────────────────────────────
    GetAllSignatureAuthorities:    "/api/Master/GetMasterSignatureAuthorities",
    InsertSignatureAuthority:     "/api/Master/InsertMasterSignatureAuthority",
    UpdateSignatureAuthority:     "/api/Master/UpdateMasterSignatureAuthority",
    SoftDeleteSignatureAuthority: (id) => `/api/Master/SoftDeleteMasterSignatureAuthority/${id}`,
    UploadSignatureFile: "/api/Master/UploadSignatureFile",
    // ─── Floor Preference ──────────────────────────────────
    GetAllFloorPreferences:    "/api/Master/GetMasterFloorPreferences",
    InsertFloorPreference:     "/api/Master/InsertMasterFloorPreference",
    UpdateFloorPreference:     "/api/Master/UpdateMasterFloorPreference",
    SoftDeleteFloorPreference: (id) => `/api/Master/SoftDeleteMasterFloorPreference/${id}`,

    // ─── Grievance Category ────────────────────────────────
    GetAllGrievanceCategories:    "/api/Master/GetMasterGrievanceCategories",
    InsertGrievanceCategory:      "/api/Master/InsertMasterGrievanceCategory",
    UpdateGrievanceCategory:      "/api/Master/UpdateMasterGrievanceCategory",
    SoftDeleteGrievanceCategory:  (id) => `/api/Master/SoftDeleteMasterGrievanceCategory/${id}`,

    // ─── FAQ Category ──────────────────────────────────────
    GetAllFAQCategories:    "/api/Master/GetMasterFAQCategories",
    InsertFAQCategory:      "/api/Master/InsertMasterFAQCategory",
    UpdateFAQCategory:      "/api/Master/UpdateMasterFAQCategory",
    SoftDeleteFAQCategory:  (id) => `/api/Master/SoftDeleteMasterFAQCategory/${id}`,

    // ─── Facility Sub Group ───────────────────────────────
    GetAllFacilitySubGroups:    "/api/Master/GetMasterFacilitySubGroups",
    InsertFacilitySubGroup:     "/api/Master/InsertMasterFacilitySubGroup",
    UpdateFacilitySubGroup:     "/api/Master/UpdateMasterFacilitySubGroup",
    SoftDeleteFacilitySubGroup: (id) => `/api/Master/SoftDeleteMasterFacilitySubGroup/${id}`,

    // ─── Job Role ────────────────────────────────────────
    GetAllJobRoles:    "/api/Master/GetMasterJobRoles",
    InsertJobRole:     "/api/Master/InsertMasterJobRole",
    UpdateJobRole:     "/api/Master/UpdateMasterJobRole",
    SoftDeleteJobRole: (id) => `/api/Master/SoftDeleteMasterJobRole/${id}`,

    // ─── Location Category ──────────────────────────────
    GetAllLocationCategories:    "/api/Master/GetMasterLocationCategories",
    InsertLocationCategory:      "/api/Master/InsertMasterLocationCategory",
    UpdateLocationCategory:      "/api/Master/UpdateMasterLocationCategory",
    SoftDeleteLocationCategory:  (id) => `/api/Master/SoftDeleteMasterLocationCategory/${id}`,

    // ─── Month ──────────────────────────────────────────────
    GetAllMonths:    "/api/Master/GetMasterMonths",
    InsertMonth:     "/api/Master/InsertMasterMonth",
    UpdateMonth:     "/api/Master/UpdateMasterMonth",
    SoftDeleteMonth: (id) => `/api/Master/SoftDeleteMasterMonth/${id}`,

    // ─── Security Question ─────────────────────────────────
    GetAllSecurityQuestions:    "/api/Master/GetMasterSecurityQuestions",
    InsertSecurityQuestion:     "/api/Master/InsertMasterSecurityQuestion",
    UpdateSecurityQuestion:     "/api/Master/UpdateMasterSecurityQuestion",
    SoftDeleteSecurityQuestion: (id) => `/api/Master/SoftDeleteMasterSecurityQuestion/${id}`,

    // ─── Skill Trade ────────────────────────────────────────
    GetAllSkillTrades:    "/api/Master/GetMasterSkillTrades",
    InsertSkillTrade:     "/api/Master/InsertMasterSkillTrade",
    UpdateSkillTrade:     "/api/Master/UpdateMasterSkillTrade",
    SoftDeleteSkillTrade: (id) => `/api/Master/SoftDeleteMasterSkillTrade/${id}`,

    // ─── Qualification ──────────────────────────────────────
    GetAllQualifications:    "/api/Master/GetMasterQualifications",
    InsertQualification:     "/api/Master/InsertMasterQualification",
    UpdateQualification:     "/api/Master/UpdateMasterQualification",
    SoftDeleteQualification: (id) => `/api/Master/SoftDeleteMasterQualification/${id}`,

    // ─── Restricted Keyword ───────────────────────────────
    GetAllKeywords:    "/api/Master/GetMasterRestrictedKeywords",
    InsertKeyword:     "/api/Master/InsertMasterRestrictedKeyword",
    UpdateKeyword:     "/api/Master/UpdateMasterRestrictedKeyword",
    SoftDeleteKeyword: (id) => `/api/Master/SoftDeleteMasterRestrictedKeyword/${id}`,

    // ─── Shift ──────────────────────────────────────────────
    GetAllShifts:    "/api/Master/GetMasterShifts",
    InsertShift:     "/api/Master/InsertMasterShift",
    UpdateShift:     "/api/Master/UpdateMasterShift",
    SoftDeleteShift: (id) => `/api/Master/SoftDeleteMasterShift/${id}`,

    // ─── VC Application ────────────────────────────────────
    GetAllVCApplications: "/api/Master/GetMasterVCApplications",
    InsertVCApplication:  "/api/Master/InsertMasterVCApplication",
    UpdateVCApplication:  "/api/Master/UpdateMasterVCApplication",
    DeleteVCApplication:  (id) => `/api/Master/DeleteMasterVCApplication/${id}`,

    // ─── Type of Institute ─────────────────────────────────
    GetAllTypeofInstitutes:    "/api/Master/GetMasterTypeofInstitutes",
    InsertTypeofInstitute:     "/api/Master/InsertMasterTypeofInstitute",
    UpdateTypeofInstitute:     "/api/Master/UpdateMasterTypeofInstitute",
    SoftDeleteTypeofInstitute: (id) => `/api/Master/SoftDeleteMasterTypeofInstitute/${id}`,

    // ─── Training Remark for Utilization ───────────────────
    GetAllTrainingRemarkforUtilization:    "/api/Master/GetMasterTrainingRemarkforUtilization",
    InsertTrainingRemarkforUtilization:    "/api/Master/InsertMasterTrainingRemarkforUtilization",
    UpdateTrainingRemarkforUtilization:    "/api/Master/UpdateMasterTrainingRemarkforUtilization",
    SoftDeleteTrainingRemarkforUtilization: (id) => `/api/Master/SoftDeleteMasterTrainingRemarkforUtilization/${id}`,

    // ─── Training Fee Category ─────────────────────────────
    GetAllTrainingFeeCategories:   "/api/Master/GetMasterTrainingFeeCategories",
    InsertTrainingFeeCategory:     "/api/Master/InsertMasterTrainingFeeCategory",
    UpdateTrainingFeeCategory:     "/api/Master/UpdateMasterTrainingFeeCategory",
    SoftDeleteTrainingFeeCategory: (id) => `/api/Master/SoftDeleteMasterTrainingFeeCategory/${id}`,

    // ─── Training Equipment ────────────────────────────────
    GetAllTrainingEquipment:    "/api/Master/GetMasterTrainingEquipment",
    InsertTrainingEquipment:    "/api/Master/InsertMasterTrainingEquipment",
    UpdateTrainingEquipment:    "/api/Master/UpdateMasterTrainingEquipment",
    SoftDeleteTrainingEquipment: (id) => `/api/Master/SoftDeleteMasterTrainingEquipment/${id}`,

    // ─── Training Category ──────────────────────────────────
    GetAllTrainingCategories:    "/api/Master/GetMasterTrainingCategories",
    InsertTrainingCategory:      "/api/Master/InsertMasterTrainingCategory",
    UpdateTrainingCategory:      "/api/Master/UpdateMasterTrainingCategory",
    SoftDeleteTrainingCategory: (id) => `/api/Master/SoftDeleteMasterTrainingCategory/${id}`,

    // ─── Training Name of Item ─────────────────────────────
    GetAllTrainingNameOfItems:    "/api/Master/GetMasterTrainingNameOfItems",
    InsertTrainingNameOfItem:     "/api/Master/InsertMasterTrainingNameOfItem",
    UpdateTrainingNameOfItem:     "/api/Master/UpdateMasterTrainingNameOfItem",
    SoftDeleteTrainingNameOfItem: (id) => `/api/Master/SoftDeleteMasterTrainingNameOfItem/${id}`,

    // ─── Equipment Category ────────────────────────────────
    GetAllEquipmentCategories:   "/api/Master/GetMasterEquipmentCategories",
    InsertEquipmentCategory:     "/api/Master/InsertMasterEquipmentCategory",
    UpdateEquipmentCategory:     "/api/Master/UpdateMasterEquipmentCategory",
    SoftDeleteEquipmentCategory: (id) => `/api/Master/SoftDeleteMasterEquipmentCategory/${id}`,

    // ─── Sectorial Expertise ────────────────────────────────
    GetAllSectorialExpertise:    "/api/Master/GetMasterSectorialExpertise",
    InsertSectorialExpertise:    "/api/Master/InsertMasterSectorialExpertise",
    UpdateSectorialExpertise:    "/api/Master/UpdateMasterSectorialExpertise",
    SoftDeleteSectorialExpertise: (id) => `/api/Master/SoftDeleteMasterSectorialExpertise/${id}`,

    // ─── Subject ────────────────────────────────────────────
    GetAllSubjects:    "/api/Master/GetMasterSubjects",
    InsertSubject:     "/api/Master/InsertMasterSubject",
    UpdateSubject:     "/api/Master/UpdateMasterSubject",
    SoftDeleteSubject: (id) => `/api/Master/SoftDeleteMasterSubject/${id}`,

    // ─── Subject Type Exam ────────────────────────────────────
    GetAllSubjectTypeExams:    "/api/Master/GetMasterSubjectTypeExam",
    InsertSubjectTypeExam:     "/api/Master/InsertMasterSubjectTypeExam",
    UpdateSubjectTypeExam:     "/api/Master/UpdateMasterSubjectTypeExam",
    SoftDeleteSubjectTypeExam: (id) => `/api/Master/SoftDeleteMasterSubjectTypeExam/${id}`,

    // ─── Promoter Status ──────────────────────────────────────
    GetAllPromoterStatuses:    "/api/Master/GetMasterPromoterStatuses",
    InsertPromoterStatus:      "/api/Master/InsertMasterPromoterStatus",
    UpdatePromoterStatus:      "/api/Master/UpdateMasterPromoterStatus",
    SoftDeletePromoterStatus:  (id) => `/api/Master/SoftDeleteMasterPromoterStatus/${id}`,

    // ─── Promoter Type ────────────────────────────────────────
    GetAllPromoterTypes:    "/api/Master/GetMasterPromoterTypes",
    InsertPromoterType:     "/api/Master/InsertMasterPromoterType",
    UpdatePromoterType:     "/api/Master/UpdateMasterPromoterType",
    SoftDeletePromoterType: (id) => `/api/Master/SoftDeleteMasterPromoterType/${id}`,

    // ─── Promoting Type ───────────────────────────────────────
    GetAllPromotingTypes:    "/api/Master/GetMasterPromotingTypes",
    InsertPromotingType:     "/api/Master/InsertMasterPromotingType",
    UpdatePromotingType:     "/api/Master/UpdateMasterPromotingType",
    SoftDeletePromotingType: (id) => `/api/Master/SoftDeleteMasterPromotingType/${id}`,

    // ─── Notification Category ────────────────────────────────
    GetAllNotificationCategories:    "/api/Master/GetMasterNotificationCategories",
    InsertNotificationCategory:      "/api/Master/InsertMasterNotificationCategory",
    UpdateNotificationCategory:      "/api/Master/UpdateMasterNotificationCategory",
    SoftDeleteNotificationCategory:  (id) => `/api/Master/SoftDeleteMasterNotificationCategory/${id}`,

    // ─── Other Infra ────────────────────────────────────────
    GetAllOtherInfra:    "/api/Master/GetMasterOtherInfra",
    InsertOtherInfra:    "/api/Master/InsertMasterOtherInfra",
    UpdateOtherInfra:    "/api/Master/UpdateMasterOtherInfra",
    SoftDeleteOtherInfra: (id) => `/api/Master/SoftDeleteMasterOtherInfra/${id}`,

    // ─── Other Infra Options ───────────────────────────────
    GetAllOtherInfraOptions:     "/api/Master/GetMasterOtherInfraOptions",
    InsertOtherInfraOptions:     "/api/Master/InsertMasterOtherInfraOptions",
    UpdateOtherInfraOptions:     "/api/Master/UpdateMasterOtherInfraOptions",
    SoftDeleteOtherInfraOptions: (id) => `/api/Master/SoftDeleteMasterOtherInfraOptions/${id}`,

    // ─── User Type ──────────────────────────────────────────
    GetAllUserTypes:    "/api/Master/GetMasterUserTypes",
    InsertUserType:     "/api/Master/InsertMasterUserType",
    UpdateUserType:     "/api/Master/UpdateMasterUserType",
    SoftDeleteUserType: (id) => `/api/Master/SoftDeleteMasterUserType/${id}`,

    // ─── NSQF Level ───────────────────────────────────────
    GetAllNSQFLevels:    "/api/Master/GetMasterNSQFLevels",
    InsertNSQFLevel:     "/api/Master/InsertMasterNSQFLevel",
    UpdateNSQFLevel:     "/api/Master/UpdateMasterNSQFLevel",
    SoftDeleteNSQFLevel: (id) => `/api/Master/SoftDeleteMasterNSQFLevel/${id}`,

    // ─── Project Configuration ─────────────────────────────
    GetAllProjectConfigurations:    "/api/Master/GetMasterProjectConfigurations",
    InsertProjectConfiguration:     "/api/Master/InsertMasterProjectConfiguration",
    UpdateProjectConfiguration:     "/api/Master/UpdateMasterProjectConfiguration",
    SoftDeleteProjectConfiguration: (id) => `/api/Master/SoftDeleteMasterProjectConfiguration/${id}`,

    // ─── ITI Specification Category ────────────────────────
    GetAllITISpecificationCategories:    "/api/Master/GetMasterITISpecificationCategories",
    InsertITISpecificationCategory:      "/api/Master/InsertMasterITISpecificationCategory",
    UpdateITISpecificationCategory:      "/api/Master/UpdateMasterITISpecificationCategory",
    SoftDeleteITISpecificationCategory:  (id) => `/api/Master/SoftDeleteMasterITISpecificationCategory/${id}`,

    // ─── ITI Specification Group ────────────────────────
    GetAllITISpecificationGroups:    "/api/Master/GetMasterITISpecificationGroups",
    InsertITISpecificationGroup:     "/api/Master/InsertMasterITISpecificationGroup",
    UpdateITISpecificationGroup:     "/api/Master/UpdateMasterITISpecificationGroup",
    SoftDeleteITISpecificationGroup: (id) => `/api/Master/SoftDeleteMasterITISpecificationGroup/${id}`,

    // ─── ITI Specification Item ────────────────────────
    GetAllITISpecificationItems:    "/api/Master/GetMasterITISpecificationItems",
    InsertITISpecificationItem:     "/api/Master/InsertMasterITISpecificationItem",
    UpdateITISpecificationItem:     "/api/Master/UpdateMasterITISpecificationItem",
    SoftDeleteITISpecificationItem: (id) => `/api/Master/SoftDeleteMasterITISpecificationItem/${id}`,

    // ─── ITI Specification Name of Item As Per DGT ────────
    GetAllITISpecificationNameofItemAsperDGT:    "/api/Master/GetMasterITISpecificationNameofItemAsperDGT",
    InsertITISpecificationNameofItemAsperDGT:     "/api/Master/InsertMasterITISpecificationNameofItemAsperDGT",
    UpdateITISpecificationNameofItemAsperDGT:     "/api/Master/UpdateMasterITISpecificationNameofItemAsperDGT",
    SoftDeleteITISpecificationNameofItemAsperDGT: (id) => `/api/Master/SoftDeleteMasterITISpecificationNameofItemAsperDGT/${id}`,

    // ─── Item As Per DVET ──────────────────────────────────
    GetAllItemAsperDVETs:    "/api/Master/GetMasterItemAsperDVETs",
    InsertItemAsperDVET:     "/api/Master/InsertMasterItemAsperDVET",
    UpdateItemAsperDVET:     "/api/Master/UpdateMasterItemAsperDVET",
    SoftDeleteItemAsperDVET: (id) => `/api/Master/SoftDeleteMasterItemAsperDVET/${id}`,

    // ─── ITI Specification Sector ──────────────────────────
    GetAllITISpecificationSectors:    "/api/Master/GetMasterITISpecificationSectors",
    InsertITISpecificationSector:     "/api/Master/InsertMasterITISpecificationSector",
    UpdateITISpecificationSector:     "/api/Master/UpdateMasterITISpecificationSector",
    SoftDeleteITISpecificationSector: (id) => `/api/Master/SoftDeleteMasterITISpecificationSector/${id}`,

    // ─── ITI Specification Trade ───────────────────────────
    GetAllITISpecificationTrades:    "/api/Master/GetMasterITISpecificationTrades",
    InsertITISpecificationTrade:     "/api/Master/InsertMasterITISpecificationTrade",
    UpdateITISpecificationTrade:     "/api/Master/UpdateMasterITISpecificationTrade",
    SoftDeleteITISpecificationTrade: (id) => `/api/Master/SoftDeleteMasterITISpecificationTrade/${id}`,

    // ─── ITI Specification Usage ───────────────────────────
    GetAllITISpecificationUsages:    "/api/Master/GetMasterITISpecificationUsages",
    InsertITISpecificationUsage:     "/api/Master/InsertMasterITISpecificationUsage",
    UpdateITISpecificationUsage:     "/api/Master/UpdateMasterITISpecificationUsage",
    SoftDeleteITISpecificationUsage: (id) => `/api/Master/SoftDeleteMasterITISpecificationUsage/${id}`,

    // ─── ITI Specification (as per DGT) ────────────────────
    GetAllITISpecificationSpecificationAsperDGTs:    "/api/Master/GetMasterITISpecificationSpecificationAsperDGTs",
    InsertITISpecificationSpecificationAsperDGT:     "/api/Master/InsertMasterITISpecificationSpecificationAsperDGT",
    UpdateITISpecificationSpecificationAsperDGT:     "/api/Master/UpdateMasterITISpecificationSpecificationAsperDGT",
    SoftDeleteITISpecificationSpecificationAsperDGT: (id) => `/api/Master/SoftDeleteMasterITISpecificationSpecificationAsperDGT/${id}`,

    // ─── ITI Specification (Sector Wise) ───────────────────
    GetAllITISpecificationSectorWises:    "/api/Master/GetMasterITISpecificationSectorWise",
    InsertITISpecificationSectorWise:     "/api/Master/InsertMasterITISpecificationSectorWise",
    UpdateITISpecificationSectorWise:     "/api/Master/UpdateMasterITISpecificationSectorWise",
    SoftDeleteITISpecificationSectorWise: (id) => `/api/Master/SoftDeleteMasterITISpecificationSectorWise/${id}`,

    // ─── Ignore Words ─────────────────────────────────────
    GetAllIgnoreWords: "/api/Master/GetMasterIgnoreWordsList",
    InsertIgnoreWord:     "/api/Master/InsertMasterIgnoreWord",
    UpdateIgnoreWord:     "/api/Master/UpdateMasterIgnoreWord",
    SoftDeleteIgnoreWord: (id) => `/api/Master/SoftDeleteMasterIgnoreWord/${id}`,

    // ─── Financial Year ───────────────────────────────────
    GetAllFinancialYears:    "/api/Master/GetMasterFinancialYears",
    InsertFinancialYear:     "/api/Master/InsertMasterFinancialYear",
    UpdateFinancialYear:     "/api/Master/UpdateMasterFinancialYear",
    SoftDeleteFinancialYear: (id) => `/api/Master/SoftDeleteMasterFinancialYear/${id}`,
    SetCurrentFinancialYear: (id) => `/api/Master/SetCurrentFinancialYear/${id}`,

    // ─── User ───────────────────────────────────────────
    GetAllUsers:    "/api/Master/GetMasterUsers",
    InsertUser:     "/api/Master/InsertMasterUser",
    UpdateUser:     "/api/Master/UpdateMasterUser",
    SoftDeleteUser: (id) => `/api/Master/SoftDeleteMasterUser/${id}`,

    // ─── Batch Type ───────────────────────────────────────
    GetAllBatchTypes:    "/api/Master/GetMasterBatchTypes",
    InsertBatchType:     "/api/Master/InsertMasterBatchType",
    UpdateBatchType:     "/api/Master/UpdateMasterBatchType",
    SoftDeleteBatchType: (id) => `/api/Master/SoftDeleteMasterBatchType/${id}`,

    // ─── Batch Status ───────────────────────────────────────
    GetAllBatchStatuses:    "/api/Master/GetMasterBatchStatuses",
    InsertBatchStatus:      "/api/Master/InsertMasterBatchStatus",
    UpdateBatchStatus:      "/api/Master/UpdateMasterBatchStatus",
    SoftDeleteBatchStatus:  (id) => `/api/Master/SoftDeleteMasterBatchStatus/${id}`,

    // ─── Exam Type ────────────────────────────────────────
    GetAllExamTypes:    "/api/Master/GetMasterExamTypes",
    InsertExamType:     "/api/Master/InsertMasterExamType",
    UpdateExamType:     "/api/Master/UpdateMasterExamType",
    SoftDeleteExamType: (id) => `/api/Master/SoftDeleteMasterExamType/${id}`,

    // ─── Religion ─────────────────────────────────────────
    GetAllReligions:    "/api/Master/GetMasterReligions",
    InsertReligion:     "/api/Master/InsertMasterReligion",
    UpdateReligion:     "/api/Master/UpdateMasterReligion",
    SoftDeleteReligion: (id) => `/api/Master/SoftDeleteMasterReligion/${id}`,

    // ─── Success Stories ────────────────────────────────────
    GetAllSuccessStories:   "/api/Master/GetMasterSuccessStories",
    InsertSuccessStory:     "/api/Master/InsertMasterSuccessStory",
    UpdateSuccessStory:     "/api/Master/UpdateMasterSuccessStory",
    SoftDeleteSuccessStory: (id) => `/api/Master/SoftDeleteMasterSuccessStory/${id}`,

    // ─── Course Apshow inactive franchrization─────────────────────────────
    GetMasterCourseApprovers:       "/api/Master/GetMasterCourseApprovers",
    InsertMasterCourseApprover:     "/api/Master/InsertMasterCourseApprover",
    UpdateMasterCourseApprover:     "/api/Master/UpdateMasterCourseApprover",
    SoftDeleteMasterCourseApprover: (id) => `/api/Master/SoftDeleteMasterCourseApprover/${id}`,

    // ─── ITI Specification Item V2 ─────────────────────
    GetAllITISpecificationItemsV2:    "/api/Master/GetMasterITISpecificationItemsV2",
    InsertITISpecificationItemV2:     "/api/Master/InsertMasterITISpecificationItemV2",
    UpdateITISpecificationItemV2:     "/api/Master/UpdateMasterITISpecificationItemV2",
    SoftDeleteITISpecificationItemV2: (id) => `/api/Master/SoftDeleteMasterITISpecificationItemV2/${id}`,

    // ─── Institute Category ────────────────────────────────
    GetAllInstituteCategories:   "/api/Master/GetMasterInstituteCategories",
    InsertInstituteCategory:     "/api/Master/InsertMasterInstituteCategory",
    UpdateInstituteCategory:     "/api/Master/UpdateMasterInstituteCategory",
    SoftDeleteInstituteCategory: (id) => `/api/Master/SoftDeleteMasterInstituteCategory/${id}`,

    // ─── Institute Ownership ────────────────────────────────
    GetAllInstituteOwnerships:      "/api/Master/GetMasterInstituteOwnerships",
    GetNextSeqNoInstituteOwnership: "/api/Master/GetNextSeqNoInstituteOwnership",
    InsertInstituteOwnership:       "/api/Master/InsertMasterInstituteOwnership",
    UpdateInstituteOwnership:       "/api/Master/UpdateMasterInstituteOwnership",
    SoftDeleteInstituteOwnership:   (id) => `/api/Master/SoftDeleteMasterInstituteOwnership/${id}`,

    // ─── Infra Category ───────────────────────────────────
    GetAllInfraCategories:    "/api/Master/GetMasterInfraCategories",
    InsertInfraCategory:      "/api/Master/InsertMasterInfraCategory",
    UpdateInfraCategory:      "/api/Master/UpdateMasterInfraCategory",
    SoftDeleteInfraCategory:  (id) => `/api/Master/SoftDeleteMasterInfraCategory/${id}`,

    // ─── Infra Item ───────────────────────────────────────
    GetAllInfraItems:    "/api/Master/GetMasterInfraItems",
    InsertInfraItem:     "/api/Master/InsertMasterInfraItem",
    UpdateInfraItem:     "/api/Master/UpdateMasterInfraItem",
    SoftDeleteInfraItem: (id) => `/api/Master/SoftDeleteMasterInfraItem/${id}`,

    // ─── Training Equipment List ───────────────────────────
    GetAllTrainingEquipmentList:    "/api/Master/GetMasterTrainingEquipmentList",
    InsertTrainingEquipmentList:    "/api/Master/InsertMasterTrainingEquipmentList",
    UpdateTrainingEquipmentList:    "/api/Master/UpdateMasterTrainingEquipmentList",
    SoftDeleteTrainingEquipmentList: (id) => `/api/Master/SoftDeleteMasterTrainingEquipmentList/${id}`,
    GetAllCourses: "/Base/GetMasterCourse",

    // ─── OBWC Course ────────────────────────────────────────
    GetAllOBWCCourses:    "/api/Master/GetMasterOBWCCourses",
    InsertOBWCCourse:     "/api/Master/InsertMasterOBWCCourse",
    UpdateOBWCCourse:     "/api/Master/UpdateMasterOBWCCourse",
    SoftDeleteOBWCCourse: (id) => `/api/Master/SoftDeleteMasterOBWCCourse/${id}`,

    // ─── OBWC Institute ─────────────────────────────────────
    GetAllOBWCInstitutes:    "/api/Master/GetAllOBWCInstitutes",
    InsertOBWCInstitute:     "/api/Master/InsertOBWCInstitute",
    UpdateOBWCInstitute:     "/api/Master/UpdateOBWCInstitute",
    SoftDeleteOBWCInstitute: (id) => `/api/Master/SoftDeleteOBWCInstitute/${id}`,
  };


  export const MasterTableService = {

    // ─── State ───────────────────────────────────────────
getAll: async () => {
  const res = await agent.get(API.GetAllState);
  return res.data;
},

getAllStates: async () => {
  const res = await agent.get(API.GetAllState);
  return res.data;
},

insert: async (payload) => {
  const res = await agent.post(API.Insert, payload);
  return res.data;
},

update: async (payload) => {
  const res = await agent.post(API.Update, payload);
  return res.data;
},

softDelete: async (id) => {
  const res = await agent.post(API.SoftDelete(id));
  return res.data;
},
    // ─── District ─────────────────────────────────────────
    getAllDistricts: async () => {
      const res = await agent.get(API.GetAllDistricts);
      return res.data;
    },

    insertDistrict: async (payload) => {
      const res = await agent.post(API.InsertDistrict, {
        DistrictID:      payload.DistrictID,
        District:        payload.District,
        DistrictMarathi: payload.DistrictMarathi || null,
        StateID:         payload.StateID,
        RegionID:        payload.RegionID || 0,
        IsActive:        payload.IsActive,
        LoginID:         payload.LoginID || null,
      });
      return res.data;
    },

    updateDistrict: async (payload) => {
      const res = await agent.post(API.UpdateDistrict, {
        DistrictID:      payload.DistrictID,
        District:        payload.District,
        DistrictMarathi: payload.DistrictMarathi || null,
        StateID:         payload.StateID,
        RegionID:        payload.RegionID || 0,
        IsActive:        payload.IsActive,
        LoginID:         payload.LoginID || null,
      });
      return res.data;
    },

 softDeleteDistrict: async (id) => {
  const res = await agent.post(API.SoftDeleteDistrict(id));
  return res.data;
},

    // ─── Taluka ───────────────────────────────────────────
    getAllTalukas: async (pageNumber = 1, pageSize = 50, search = '') => {
      const params = new URLSearchParams({ pageNumber, pageSize });
      if (search) params.append('search', search);
      const res = await agent.get(`${API.GetAllTalukas}?${params}`);
      return res.data;
    },

    insertTaluka: async (payload) => {
      const res = await agent.post(API.InsertTaluka, {
        TalukaID:      payload.TalukaID,
        Taluka:        payload.Taluka,
        TalukaMarathi: payload.TalukaMarathi || null,
        DistrictID:    payload.DistrictID,
        IsActive:      payload.IsActive,
      });
      return res.data;
    },

    updateTaluka: async (payload) => {
      const res = await agent.post(API.UpdateTaluka, {
        TalukaID:      payload.TalukaID,
        Taluka:        payload.Taluka,
        TalukaMarathi: payload.TalukaMarathi || null,
        DistrictID:    payload.DistrictID,
        IsActive:      payload.IsActive,
      });
      return res.data;
    },

    softDeleteTaluka: async (id) => {
      const res = await agent.post(API.SoftDeleteTaluka(id));
      return res.data;
    },

 // ─── City ─────────────────────────────────────────────
getAllCities: async (pageNumber = 1, pageSize = 50, search = '', isActive = null, isRural = null) => {
  const params = new URLSearchParams({
    pageNumber: pageNumber.toString(),
    pageSize:   pageSize.toString(),
  });
  if (search && search.trim() !== '') params.append('search', search);
  if (isActive !== null) params.append('isActive', isActive.toString());
  if (isRural  !== null) params.append('rural', isRural.toString());
  const res = await agent.get(`${API.GetAllCities}?${params.toString()}`);
  return res.data;
},

getCityStats: async () => {
  const res = await agent.get(API.GetCityStats);
  return res.data;
},

insertCity: async (payload) => {
  const res = await agent.post(API.InsertCity, {
    CityID:      payload.CityID,
    City:        payload.City,
    CityMarathi: payload.CityMarathi || null,
    TalukaID:    payload.TalukaID,
    IsRural:     payload.IsRural,
    IsActive:    payload.IsActive,
  });
  return res.data;
},

updateCity: async (payload) => {
  const res = await agent.post(API.UpdateCity, {
    CityID:      payload.CityID,
    City:        payload.City,
    CityMarathi: payload.CityMarathi || null,
    TalukaID:    payload.TalukaID,
    IsRural:     payload.IsRural,
    IsActive:    payload.IsActive,
  });
  return res.data;
},

softDeleteCity: async (id) => {
  const res = await agent.post(API.SoftDeleteCity(id));
  return res.data;
},

    // ─── Pincode ──────────────────────────────────────────
    getAllPincodes: async (pageNumber = 1, pageSize = 50, search = '') => {
      const params = new URLSearchParams({ pageNumber, pageSize });
      if (search) params.append('search', search);
      const res = await agent.get(`${API.GetAllPincodes}?${params}`);
      return res.data;
    },

    getPincodeStats: async () => {
      const res = await agent.get(API.GetPincodeStats);
      return res.data;
    },

    insertPincode: async (payload) => {
      const res = await agent.post(API.InsertPincode, {
        Pincode:    payload.Pincode,
        PostOffice: payload.PostOffice,
        CityID:     Number(payload.CityID),
        IsActive:   payload.IsActive,
      });
      return res.data;
    },

    updatePincode: async (payload) => {
      const res = await agent.post(API.UpdatePincode, {
        PincodeID:  Number(payload.PincodeID),
        Pincode:    payload.Pincode,
        PostOffice: payload.PostOffice,
        CityID:     Number(payload.CityID),
        IsActive:   payload.IsActive,
      });
      return res.data;
    },

    softDeletePincode: async (id) => {
      const res = await agent.post(API.SoftDeletePincode(id));
      return res.data;
    },

    // ─── Region ───────────────────────────────────────────
    getAllRegions: async () => {
      const res = await agent.get(API.GetAllRegions);
      return res.data;
    },

    insertRegion: async (payload) => {
      const res = await agent.post(API.InsertRegion, {
        RegionID:      payload.RegionID,
        Region:        payload.Region,
        RegionMarathi: payload.RegionMarathi || null,
        SeqNO:         payload.SeqNO || 0,
        IsActive:      payload.IsActive,
      });
      return res.data;
    },

  
updateRegion: async (payload) => {
  const res = await agent.post(API.UpdateRegion, {
    RegionID:      payload.RegionID,
    Region:        payload.Region,
    RegionMarathi: payload.RegionMarathi || null,
    SeqNO:         payload.SeqNO || 0,
    IsActive:      payload.IsActive,
  });
  return res.data;
},

softDeleteRegion: async (id) => {
  const res = await agent.post(API.SoftDeleteRegion(id));
  return res.data;
},

    // ─── Caste ────────────────────────────────────────────
    getAllCastes: async () => {
      const res = await agent.get(API.GetAllCastes);
      return res.data;
    },

    insertCaste: async (payload) => {
      const res = await agent.post(API.InsertCaste, {
        NewCasteID:   payload.CasteID || 0,
        CasteSrNo:    payload.CasteSrNo,
        Caste:        payload.Caste,
        CategoryID:   payload.CategoryID,
        CategoryName: payload.CategoryName,
        IsSBC:        payload.IsSBC,
        IsActive:     payload.IsActive,
      });
      return res.data;
    },

   updateCaste: async (payload) => {
  const res = await agent.post(API.UpdateCaste, {   
    CasteID:      payload.CasteID,
    CasteSrNo:    payload.CasteSrNo,
    Caste:        payload.Caste,
    CategoryID:   payload.CategoryID,
    CategoryName: payload.CategoryName,
    IsSBC:        payload.IsSBC,
    IsActive:     payload.IsActive,
  });
  return res.data;
},

softDeleteCaste: async (id) => {
  const res = await agent.post(API.SoftDeleteCaste(id));   
  return res.data;
},    // ─── Category (dropdown helper) ───────────────────────
    getCategories: async () => {
      const response = await agent.get(GET_CATEGORY_API);
      return response.data;
    },

    // ─── Category (CRUD) ──────────────────────────────────
    getAllCategories: async () => {
      const res = await agent.get(API.GetAllCategories);
      return res.data;
    },

    insertCategory: async (payload) => {
      const res = await agent.post(API.InsertCategory, {
        categoryID:   payload.categoryID || 0,
        category:     payload.category,
        categoryCode: payload.categoryCode || null,
        seqNo:        payload.seqNo || 0,
        isActive:     payload.isActive,
      });
      return res.data;
    },

    updateCategory: async (payload) => {
  const res = await agent.post(API.UpdateCategory, {   
    categoryID:   payload.categoryID,
    category:     payload.category,
    categoryCode: payload.categoryCode || null,
    seqNo:        payload.seqNo || 0,
    isActive:     payload.isActive,
  });
  return res.data;
},

softDeleteCategory: async (id) => {
  const res = await agent.post(API.SoftDeleteCategory(id));  
  return res.data;
},
    // ─── Disability ───────────────────────────────────────
    getAllDisabilities: async () => {
      const res = await agent.get(API.GetAllDisabilities);
      return res.data;
    },

    insertDisability: async (payload) => {
      const res = await agent.post(API.InsertDisability, {
        Disability: payload.Disability,
        IsActive:   payload.IsActive,
      });
      return res.data;
    },

   updateDisability: async (payload) => {
  const res = await agent.post(API.UpdateDisability, {
    DisabilityID: payload.DisabilityID,
    Disability:   payload.Disability,
    IsActive:     payload.IsActive,
  });
  return res.data;
},

softDeleteDisability: async (id) => {
  const res = await agent.post(API.InsertAffiliationPageSoftDeleteDisability(id));
  return res.data;
},
  // ─── AcademicYear ─────────────────────────────────────
getAllAcademicYears: async () => {
  const res = await agent.get(API.GetAllAcademicYears);
  return res.data;
},

insertAcademicYear: async (payload) => {
  const res = await agent.post(API.InsertAcademicYear, {
    YearName:        payload.YearName,
    YearId:          payload.YearId,
    YearDisplayName: payload.YearDisplayName,
    isCurrent:       payload.isCurrent,
    isactive:        payload.isactive,
    IsForAdmission:  payload.IsForAdmission,
  });
  return res.data;
},


updateAcademicYear: async (payload) => {
  const res = await agent.post(API.UpdateAcademicYear, {
    YearId:          payload.YearId,
    YearName:        payload.YearName,
    YearDisplayName: payload.YearDisplayName,
    isCurrent:       payload.isCurrent,
    isactive:        payload.isactive,
    IsForAdmission:  payload.IsForAdmission,
  });
  return res.data;
},

softDeleteAcademicYear: async (id) => {
  const res = await agent.post(API.SoftDeleteAcademicYear(id));
  return res.data;
},

    // ─── Activity Status ──────────────────────────────────
    getAllActivityStatuses: async () => {
      const res = await agent.get(API.GetAllActivityStatuses);
      return res.data;
    },

    insertActivityStatus: async (payload) => {
      const res = await agent.post(API.InsertActivityStatus, {
        SeqNo:                 payload.SeqNo || 0,
        RegionID:              payload.RegionID || 0,
        ActivityName:          payload.ActivityName,
        ActivityDetails:       payload.ActivityDetails       || null,
        ActivityStartDateTime: payload.ActivityStartDateTime || null,
        ActivityEndDateTime:   payload.ActivityEndDateTime   || null,
        IsActive:              payload.IsActive,
        ModifiedBy:            payload.ModifiedBy            || null,
        ModifiedByIPAddress:   payload.ModifiedByIPAddress   || null,
      });
      return res.data;
    },

   updateActivityStatus: async (payload) => {
  const res = await agent.post(API.UpdateActivityStatus, {   // put → post
    SeqNo:                 payload.SeqNo,
    RegionID:              payload.RegionID || 0,
    ActivityName:          payload.ActivityName,
    ActivityDetails:       payload.ActivityDetails       || null,
    ActivityStartDateTime: payload.ActivityStartDateTime || null,
    ActivityEndDateTime:   payload.ActivityEndDateTime   || null,
    IsActive:              payload.IsActive,
    ModifiedBy:            payload.ModifiedBy            || null,
    ModifiedByIPAddress:   payload.ModifiedByIPAddress   || null,
  });
  return res.data;
},

softDeleteActivityStatus: async (id) => {
  const res = await agent.post(API.SoftDeleteActivityStatus(id));  // delete → post
  return res.data;
},

    // ─── Affiliation Pages ────────────────────────────────
    getAllAffiliationPages: async () => {
      const res = await agent.get(API.GetAllAffiliationPages);
      return res.data;
    },

    insertAffiliationPage: async (payload) => {
      const res = await agent.post(API.InsertAffiliationPage, {
        PageId:          Number(payload.PageId),
        PageName:        payload.PageName,
        PageUrl:         payload.PageUrl         ?? null,
        IsActive:        payload.IsActive,
        PageGrop:        payload.PageGrop        ?? null,
        PageCode:        payload.PageCode        ?? null,
        BGColur:         payload.BGColur         ?? null,
        AnchorTagTarget: payload.AnchorTagTarget ?? null,
        ReactPageUrl:    payload.ReactPageUrl    ?? null,
      });
      return res.data;
    },

   updateAffiliationPage: async (payload) => {
  const res = await agent.post(API.UpdateAffiliationPage, {   
    PageId:          Number(payload.PageId),
    PageName:        payload.PageName,
    PageUrl:         payload.PageUrl         ?? null,
    IsActive:        payload.IsActive,
    PageGrop:        payload.PageGrop        ?? null,
    PageCode:        payload.PageCode        ?? null,
    BGColur:         payload.BGColur         ?? null,
    AnchorTagTarget: payload.AnchorTagTarget ?? null,
    ReactPageUrl:    payload.ReactPageUrl    ?? null,
  });
  return res.data;
},

softDeleteAffiliationPage: async (id) => {
  const res = await agent.post(API.SoftDeleteAffiliationPage(id));   
  return res.data;
},

    // ─── Application Form Links ───────────────────────────
    getAllApplicationFormLinks: async () => {
      const res = await agent.get(API.GetAllApplicationFormLinks);
      return res.data;
    },

    insertApplicationFormLink: async (payload) => {
      const res = await agent.post(API.InsertApplicationFormLink, {
        LinkID:          Number(payload.LinkID),
        LinkType:        payload.LinkType,
        LinkName:        payload.LinkName,
        LinkDescription: payload.LinkDescription ?? null,
        LinkURL:         payload.LinkURL         ?? null,
        PageCode:        payload.PageCode        ?? null,
        IsActive:        payload.IsActive,
        LinkURLReact:    payload.LinkURLReact    ?? null,
      });
      return res.data;
    },

   updateApplicationFormLink: async (payload) => {
  const res = await agent.post(API.UpdateApplicationFormLink, {
    LinkID:          Number(payload.LinkID),
    LinkType:        payload.LinkType,
    LinkName:        payload.LinkName,
    LinkDescription: payload.LinkDescription ?? null,
    LinkURL:         payload.LinkURL         ?? null,
    PageCode:        payload.PageCode        ?? null,
    IsActive:        payload.IsActive,
    LinkURLReact:    payload.LinkURLReact    ?? null,
  });
  return res.data;
},

softDeleteApplicationFormLink: async (id) => {
  const res = await agent.post(API.SoftDeleteApplicationFormLink(id));  
  return res.data;
},

    // ─── Approval Group ───────────────────────────────────
    getAllApprovalGroups: async () => {
      const res = await agent.get(API.GetAllApprovalGroups);
      return res.data;
    },

    insertApprovalGroup: async (payload) => {
      const res = await agent.post(API.InsertApprovalGroup, {
        ID:                payload.ID || 0,
        ApprovalGroupName: payload.ApprovalGroupName,
        IsActive:          payload.IsActive,
      });
      return res.data;
    },

    updateApprovalGroup: async (payload) => {
  const res = await agent.post(API.UpdateApprovalGroup, {
    ID:                payload.ID,
    ApprovalGroupName: payload.ApprovalGroupName,
    IsActive:          payload.IsActive,
  });
  return res.data;
},

softDeleteApprovalGroup: async (id) => {
  const res = await agent.post(API.SoftDeleteApprovalGroup(id));
  return res.data;
},

    // ─── Approval Order ───────────────────────────────────
    getAllApprovalOrders: async () => {
      const res = await agent.get(API.GetAllApprovalOrders);
      return res.data;
    },

    insertApprovalOrder: async (payload) => {
      const res = await agent.post(API.InsertApprovalOrder, {
        ID:                  payload.ID,
        ApprovalOrderNo:     payload.ApprovalOrderNo,
        ApprovalOrderDate:   payload.ApprovalOrderDate   ?? null,
        ApprovalOrder:       payload.ApprovalOrder       ?? null,
        IsActive:            payload.IsActive,
        ApprovalOrderRemakr: payload.ApprovalOrderRemakr ?? null,
      });
      return res.data;
    },

    updateApprovalOrder: async (payload) => {
  const res = await agent.post(API.UpdateApprovalOrder, {   
    ID:                  payload.ID,
    ApprovalOrderNo:     payload.ApprovalOrderNo,
    ApprovalOrderDate:   payload.ApprovalOrderDate   ?? null,
    ApprovalOrder:       payload.ApprovalOrder       ?? null,
    IsActive:            payload.IsActive,
    ApprovalOrderRemakr: payload.ApprovalOrderRemakr ?? null,
  });
  return res.data;
},

softDeleteApprovalOrder: async (id) => {
  const res = await agent.post(API.SoftDeleteApprovalOrder(id)); 
  return res.data;
},
    // ─── Batch ────────────────────────────────────────────
    getAllBatches: async () => {
      const res = await agent.get(API.GetAllBatches);
      return res.data;
    },

    insertBatch: async (payload) => {
      const res = await agent.post(API.InsertBatch, {
        BatchID:          payload.BatchID,
        CollegeID:        payload.CollegeID        ?? null,
        CourseID:         payload.CourseID         ?? null,
        ShiftID:          payload.ShiftID          ?? null,
        UnitNo:           payload.UnitNo           ?? null,
        UnitID:           payload.UnitID           ?? null,
        BatchStartDate:   payload.BatchStartDate   ?? null,
        BatchEndDate:     payload.BatchEndDate     ?? null,
        AdmissionEndDate: payload.AdmissionEndDate ?? null,
        IsSystemCreated:  payload.IsSystemCreated  ?? 1,
        BatchStatus:      payload.BatchStatus      ?? 4,
        IsDeleted:        payload.IsDeleted        ?? 0,
        AdmissionYearID:  payload.AdmissionYearID  ?? null,
        BatchTypeID:      payload.BatchTypeID      ?? null,
        ExaminationID1:   payload.ExaminationID1   ?? null,
        ExaminationID2:   payload.ExaminationID2   ?? null,
        Intake:           payload.Intake           ?? null,
        // SchoolID:         payload.SchoolID         ?? null,
      });
      return res.data;
    },

   updateBatch: async (payload) => {
  const res = await agent.post(API.UpdateBatch, {   
    ID:               payload.ID,
    BatchID:          payload.BatchID,
    CollegeID:        payload.CollegeID        ?? null,
    CourseID:         payload.CourseID         ?? null,
    ShiftID:          payload.ShiftID          ?? null,
    UnitNo:           payload.UnitNo           ?? null,
    UnitID:           payload.UnitID           ?? null,
    BatchStartDate:   payload.BatchStartDate   ?? null,
    BatchEndDate:     payload.BatchEndDate     ?? null,
    AdmissionEndDate: payload.AdmissionEndDate ?? null,
    IsSystemCreated:  payload.IsSystemCreated  ?? 1,
    BatchStatus:      payload.BatchStatus      ?? 4,
    IsDeleted:        payload.IsDeleted        ?? 0,
    AdmissionYearID:  payload.AdmissionYearID  ?? null,
    BatchTypeID:      payload.BatchTypeID      ?? null,
    ExaminationID1:   payload.ExaminationID1   ?? null,
    ExaminationID2:   payload.ExaminationID2   ?? null,
    Intake:           payload.Intake           ?? null,
    // SchoolID:         payload.SchoolID         ?? null,
  });
  return res.data;
},

softDeleteBatch: async (id) => {
  const res = await agent.post(API.SoftDeleteBatch(id));   
  return res.data;
},
  
// ─── Country ──────────────────────────────────────────
getAllCountries: async () => {
  const res = await agent.get(API.GetAllCountries);
  return res.data;
},

insertCountry: async (payload) => {
  const res = await agent.post(API.InsertCountry, {
    CountryID: Number(payload.CountryID),
    Country: payload.Country,
    IsActive: payload.IsActive,
  });

  return res.data;
},

updateCountry: async (payload) => {
  const res = await agent.post(API.UpdateCountry, {   
    CountryID: Number(payload.CountryID),
    Country:   payload.Country,
    IsActive:  payload.IsActive,
  });
  return res.data;
},

softDeleteCountry: async (id) => {
  const res = await agent.post(API.SoftDeleteCountry(id));   
  return res.data;
},

    // ─── Sub-Sector ───────────────────────────────────────
    getAllSubSectors: async () => {
      const res = await agent.get(API.GetAllSubSectors);
      return res.data;
    },

    insertSubSector: async (payload) => {
      const res = await agent.post(API.InsertSubSector, {
        SubSector: payload.SubSector,
        SectorID:  payload.SectorID,
        IsActive:  payload.IsActive,
      });
      return res.data;
    },

    updateSubSector: async (payload) => {
      const res = await agent.post(API.UpdateSubSector, {
        SubSectorID: Number(payload.SubSectorID),
        SubSector:   payload.SubSector,
        SectorID:    Number(payload.SectorID),
        IsActive:    Boolean(payload.IsActive),
      });
      return res.data;
    },

    softDeleteSubSector: async (id) => {
      const res = await agent.post(API.SoftDeleteSubSector(id));
      return res.data;
    },

    // ─── Subject Course ───────────────────────────────────
    getAllSubjectCourses: async () => {
      const res = await agent.get(API.GetAllSubjectCourses);
      return res.data;
    },

    insertSubjectCourse: async (payload) => {
      const res = await agent.post(API.InsertSubjectCourse, {
        CourseID:    Number(payload.CourseID),
        CourseCode:  payload.CourseCode,
        SubjectName: payload.SubjectName,
        SubjectCode: payload.SubjectCode,
        SubjectType: payload.SubjectType,
      });
      return res.data;
    },

    updateSubjectCourse: async (payload) => {
      const res = await agent.post(API.UpdateSubjectCourse, {
        OldCourseID:    Number(payload.OldCourseID),
        OldSubjectCode: payload.OldSubjectCode,
        CourseID:       Number(payload.CourseID),
        CourseCode:     payload.CourseCode,
        SubjectName:    payload.SubjectName,
        SubjectCode:    payload.SubjectCode,
        SubjectType:    payload.SubjectType,
      });
      return res.data;
    },

    softDeleteSubjectCourse: async (courseID, subjectCode) => {
      const res = await agent.post(API.SoftDeleteSubjectCourse(courseID, subjectCode));
      return res.data;
    },

    // ─── Language ─────────────────────────────────────────
    getAllLanguages: async () => {
      const res = await agent.get(API.GetAllLanguages);
      return res.data;
    },

    insertLanguage: async (payload) => {
      const res = await agent.post(API.InsertLanguage, {
        Language:   payload.Language,
        IsActive:   payload.IsActive,
        LanguageID: Number(payload.LanguageID),
      });
      return res.data;
    },

    updateLanguage: async (payload) => {
      const res = await agent.post(API.UpdateLanguage, {
        LanguageID: Number(payload.LanguageID),
        Language:   payload.Language,
        IsActive:   payload.IsActive,
      });
      return res.data;
    },

    softDeleteLanguage: async (id) => {
      const res = await agent.post(API.SoftDeleteLanguage(id));
      return res.data;
    },

    // ─── Designation ──────────────────────────────────────
    getAllDesignations: async () => {
      const res = await agent.get(API.GetAllDesignations);
      return res.data;
    },

    insertDesignation: async (payload) => {
      const res = await agent.post(API.InsertDesignation, {
        DesignationId: Number(payload.DesignationId),
        Designation:   payload.Designation,
        IsActive:      Boolean(payload.IsActive),
      });
      return res.data;
    },

   updateDesignation: async (payload) => {
  const res = await agent.post(API.UpdateDesignation, {   
    DesignationId: Number(payload.DesignationId),
    Designation:   payload.Designation,
    IsActive:      Boolean(payload.IsActive),
  });
  return res.data;
},

softDeleteDesignation: async (id) => {
  const res = await agent.post(API.SoftDeleteDesignation(id));   
  return res.data;
},

    // ─── Course Type ──────────────────────────────────────
    getAllCourseTypes: async () => {
      const res = await agent.get(API.GetAllCourseTypes);
      return res.data;
    },

    insertCourseType: async (payload) => {
      const res = await agent.post(API.InsertCourseType, {
        CourseTypeID: Number(payload.CourseTypeID),
        CourseType:   payload.CourseType,
        IsActive:     Boolean(payload.IsActive),
      });
      return res.data;
    },

  updateCourseType: async (payload) => {
  const res = await agent.post(API.UpdateCourseType, {   
    CourseTypeID: Number(payload.CourseTypeID),
    CourseType:   payload.CourseType,
    IsActive:     Boolean(payload.IsActive),
  });
  return res.data;
},

softDeleteCourseType: async (id) => {
  const res = await agent.post(API.SoftDeleteCourseType(id));   
  return res.data;
},
    // ─── Documents ────────────────────────────────────────
    getAllDocuments: async () => {
      const res = await agent.get(API.GetAllDocuments);
      return res.data;
    },

    insertDocument: async (payload) => {
      const res = await agent.post(API.InsertDocument, {
        ID:                   Number(payload.ID),
        DocumentName:         payload.DocumentName,
        IsActive:             Boolean(payload.IsActive),
        IsDocumentCompulsory: Boolean(payload.IsDocumentCompulsory),
      });
      return res.data;
    },

   updateDocument: async (payload) => {
  const res = await agent.post(API.UpdateDocument, {   
    ID:                   Number(payload.ID),
    DocumentName:         payload.DocumentName,
    IsActive:             Boolean(payload.IsActive),
    IsDocumentCompulsory: Boolean(payload.IsDocumentCompulsory),
  });
  return res.data;
},

softDeleteDocument: async (id) => {
  const res = await agent.post(API.SoftDeleteDocument(id)); 
  return res.data;
},

   // ─── Facility Group ───────────────────────────────────
getAllFacilityGroups: async () => {
  const res = await agent.get(API.GetAllFacilityGroups);
  return res.data;
},

insertFacilityGroup: async (payload) => {
  const res = await agent.post(API.InsertFacilityGroup, {
    FacilityGroupId: Number(payload.FacilityGroupId),
    FacilityGroup:   payload.FacilityGroup,
    IsActive:        Boolean(payload.IsActive),
  });
  return res.data;
},

updateFacilityGroup: async (payload) => {
  const res = await agent.post(API.UpdateFacilityGroup, {
    FacilityGroupId: Number(payload.FacilityGroupId),
    FacilityGroup:   payload.FacilityGroup,
    IsActive:        Boolean(payload.IsActive),
  });
  return res.data;
},

softDeleteFacilityGroup: async (id) => {
  const res = await agent.post(API.SoftDeleteFacilityGroup(id));
  return res.data;
},
    // ─── Blood Group ──────────────────────────────────────
    getAllBloodGroups: async () => {
      const res = await agent.get(API.GetAllBloodGroups);
      return res.data;
    },

    insertBloodGroup: async (payload) => {
      const res = await agent.post(API.InsertBloodGroup, {
        BloodGroupId: Number(payload.BloodGroupId),
        BloodGroup:   payload.BloodGroup,
        IsActive:     Boolean(payload.IsActive),
      });
      return res.data;
    },

    updateBloodGroup: async (payload) => {
  const res = await agent.post(API.UpdateBloodGroup, {   
    BloodGroupId: Number(payload.BloodGroupId),
    BloodGroup:   payload.BloodGroup,
    IsActive:     Boolean(payload.IsActive),
  });
  return res.data;
},

softDeleteBloodGroup: async (id) => {
  const res = await agent.post(API.SoftDeleteBloodGroup(id));   
  return res.data;
},

    // ─── Gender ───────────────────────────────────────────
    getAllGenders: async () => {
      const res = await agent.get(API.GetAllGenders);
      return res.data;
    },

    insertGender: async (payload) => {
      const res = await agent.post(API.InsertGender, {
        GenderCode: payload.GenderCode,
        Gender:     payload.Gender,
        IsActive:   payload.IsActive,
      });
      return res.data;
    },

    updateGender: async (payload) => {
      const res = await agent.post(API.UpdateGender, {
        GenderCode: payload.GenderCode,
        Gender:     payload.Gender,
        IsActive:   payload.IsActive,
      });
      return res.data;
    },

    softDeleteGender: async (id) => {
      const res = await agent.post(API.SoftDeleteGender(id));
      return res.data;
    },

    // ─── Building Floor ───────────────────────────────────
    getAllBuildingFloors: async () => {
      const res = await agent.get(API.GetAllBuildingFloors);
      return res.data;
    },

    insertBuildingFloor: async (payload) => {
      const res = await agent.post(API.InsertBuildingFloor, {
        FloorId:   Number(payload.FloorId),
        FloorName: payload.FloorName,
        IsActive:  Boolean(payload.IsActive),
      });
      return res.data;
    },

   updateBuildingFloor: async (payload) => {
  const res = await agent.post(API.UpdateBuildingFloor, {  
    FloorId:   Number(payload.FloorId),
    FloorName: payload.FloorName,
    IsActive:  Boolean(payload.IsActive),
  });
  return res.data;
},

softDeleteBuildingFloor: async (id) => {
  const res = await agent.post(API.SoftDeleteBuildingFloor(id));
  return res.data;
},
    // ─── Building Name Type ───────────────────────────────
    getAllBuildingNameTypes: async () => {
      const res = await agent.get(API.GetAllBuildingNameTypes);
      return res.data;
    },

    insertBuildingNameType: async (payload) => {
      const res = await agent.post(API.InsertBuildingNameType, {
        BuildingNameTypeId: Number(payload.BuildingNameTypeId),
        BuildingNameType:   payload.BuildingNameType,
        IsActive:           Boolean(payload.IsActive),
      });
      return res.data;
    },

   updateBuildingNameType: async (payload) => {
  const res = await agent.post(API.UpdateBuildingNameType, {   
    BuildingNameTypeId: Number(payload.BuildingNameTypeId),
    BuildingNameType:   payload.BuildingNameType,
    IsActive:           Boolean(payload.IsActive),
  });
  return res.data;
},

softDeleteBuildingNameType: async (id) => {
  const res = await agent.post(API.SoftDeleteBuildingNameType(id));  
},

    // ─── Building Ownership Type ──────────────────────────
    getAllBuildingOwnershipTypes: async () => {
      const res = await agent.get(API.GetAllBuildingOwnershipTypes);
      return res.data;
    },

    insertBuildingOwnershipType: async (payload) => {
      const res = await agent.post(API.InsertBuildingOwnershipType, {
        OwnerShipTypeid: Number(payload.OwnerShipTypeid),
        OwnerShipType:   payload.OwnerShipType,
        IsActive:        Boolean(payload.IsActive),
      });
      return res.data;
    },

   updateBuildingOwnershipType: async (payload) => {
  const res = await agent.post(API.UpdateBuildingOwnershipType, {   
    OwnerShipTypeid: Number(payload.OwnerShipTypeid),
    OwnerShipType:   payload.OwnerShipType,
    IsActive:        Boolean(payload.IsActive),
  });
  return res.data;
},

softDeleteBuildingOwnershipType: async (id) => {
  const res = await agent.post(API.SoftDeleteBuildingOwnershipType(id));   
  return res.data;
},

    // ─── Land Ownership Type ───────────────────────────────
    getAllLandOwnershipTypes: async () => {
      const res = await agent.get(API.GetAllLandOwnershipTypes);
      return res.data;
    },

    insertLandOwnershipType: async (payload) => {
      const res = await agent.post(API.InsertLandOwnershipType, {
        OwnerShipTypeid: Number(payload.OwnerShipTypeid),
        OwnerShipType:   payload.OwnerShipType,
        IsActive:        Boolean(payload.IsActive),
      });
      return res.data;
    },

    updateLandOwnershipType: async (payload) => {
      const res = await agent.post(API.UpdateLandOwnershipType, {
        OwnerShipTypeid: Number(payload.OwnerShipTypeid),
        OwnerShipType:   payload.OwnerShipType,
        IsActive:        Boolean(payload.IsActive),
      });
      return res.data;
    },

    softDeleteLandOwnershipType: async (id) => {
      const res = await agent.post(API.SoftDeleteLandOwnershipType(id));
      return res.data;
    },

    // ─── Building Status ──────────────────────────────────
    getAllBuildingStatuses: async () => {
      const res = await agent.get(API.GetAllBuildingStatuses);
      return res.data;
    },

    insertBuildingStatus: async (payload) => {
      const res = await agent.post(API.InsertBuildingStatus, {
        BuildingStatusId: Number(payload.BuildingStatusId),
        BuildingStatus:   payload.BuildingStatus,
        IsActive:         Boolean(payload.IsActive),
      });
      return res.data;
    },

   updateBuildingStatus: async (payload) => {
  const res = await agent.post(API.UpdateBuildingStatus, {   
    BuildingStatusId: Number(payload.BuildingStatusId),
    BuildingStatus:   payload.BuildingStatus,
    IsActive:         Boolean(payload.IsActive),
  });
  return res.data;
},

softDeleteBuildingStatus: async (id) => {
  const res = await agent.post(API.SoftDeleteBuildingStatus(id));  
  return res.data;
},
    // ─── Building Usage Type ──────────────────────────────
    getAllBuildingUsageTypes: async () => {
      const res = await agent.get(API.GetAllBuildingUsageTypes);
      return res.data;
    },

  insertBuildingUsageType: async (payload) => {
  const res = await agent.post(API.InsertBuildingUsageType, {
    UsageTypeId: Number(payload.UsageTypeId),
    UsageType:   payload.UsageType,
    IsActive:    Boolean(payload.IsActive),
  });
  return res.data;
},

updateBuildingUsageType: async (payload) => {
  const res = await agent.post(API.UpdateBuildingUsageType, {
    UsageTypeId: Number(payload.UsageTypeId),
    UsageType:   payload.UsageType,
    IsActive:    Boolean(payload.IsActive),
  });
  return res.data;
},

softDeleteBuildingUsageType: async (id) => {
  const res = await agent.post(API.SoftDeleteBuildingUsageType(id));
  return res.data;
},
    // ─── Constituency ─────────────────────────────────────
    getAllConstituencies: async (pageNumber = 1, pageSize = 50, search = '') => {
      const params = new URLSearchParams({ pageNumber, pageSize });
      if (search) params.append('search', search);
      const res = await agent.get(`${API.GetAllConstituencies}?${params}`);
      return res.data;
    },

    insertConstituency: async (payload) => {
      const res = await agent.post(API.InsertConstituency, {
        ConstituencyID:      Number(payload.ConstituencyID),
        Constituency:        payload.Constituency,
        ConstituencyMarathi: payload.ConstituencyMarathi || null,
        DistrictID:          Number(payload.DistrictID),
        IsActive:            payload.IsActive,
      });
      return res.data;
    },

    updateConstituency: async (payload) => {
  const res = await agent.post(API.UpdateConstituency, {
    ConstituencyID:      Number(payload.ConstituencyID),
    Constituency:        payload.Constituency,
    ConstituencyMarathi: payload.ConstituencyMarathi || null,
    DistrictID:          Number(payload.DistrictID),
    IsActive:            payload.IsActive,
  });
  return res.data;
},

softDeleteConstituency: async (id) => {
  const res = await agent.post(API.SoftDeleteConstituency(id));
  return res.data;
},

    // ─── Construction Type ────────────────────────────────
    getAllConstructionTypes: async (search = '') => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      const qs = params.toString();
      const res = await agent.get(`${API.GetAllConstructionTypes}${qs ? `?${qs}` : ''}`);
      return res.data;
    },

    insertConstructionType: async (payload) => {
  const res = await agent.post(API.InsertConstructionType, {
    ConstructionType: payload.ConstructionType,
    IsActive:         payload.IsActive,
  });
  return res.data;
},

   updateConstructionType: async (payload) => {
  const res = await agent.post(API.UpdateConstructionType, {
    ConstructionTypeId: Number(payload.ConstructionTypeId),
    ConstructionType:   payload.ConstructionType,
    IsActive:           payload.IsActive,
  });
  return res.data;
},

softDeleteConstructionType: async (id) => {
  const res = await agent.post(API.SoftDeleteConstructionType(id));
  return res.data;
},

    // ─── Construction Year ────────────────────────────────
    getAllConstructionYears: async (search = '') => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      const qs = params.toString();
      const res = await agent.get(`${API.GetAllConstructionYears}${qs ? `?${qs}` : ''}`);
      return res.data;
    },

    insertConstructionYear: async (payload) => {
  const res = await agent.post(API.InsertConstructionYear, {
    YearId:   Number(payload.YearId),
    IsActive: payload.IsActive,
  });
  return res.data;
},

updateConstructionYear: async (payload) => {
  const res = await agent.post(API.UpdateConstructionYear, {
    YearId:   Number(payload.YearId),
    IsActive: payload.IsActive,
  });
  return res.data;
},

softDeleteConstructionYear: async (id) => {
  const res = await agent.post(API.SoftDeleteConstructionYear(id));
  return res.data;
},

    // ─── Contact Us Type ──────────────────────────────────

getAllConstructionYears: async (search = '') => {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  const qs = params.toString();
  const res = await agent.get(`${API.GetAllConstructionYears}${qs ? `?${qs}` : ''}`);
  return res.data;
},

insertConstructionYear: async (payload) => {
  const res = await agent.post(API.InsertConstructionYear, {
    YearId: Number(payload.YearId),
    IsActive: Boolean(payload.IsActive)
  });
  return res.data;
},

updateConstructionYear: async (payload) => {
  // Try PUT first, if 405 then try POST
  try {
    const res = await agent.put(API.UpdateConstructionYear, {
      YearId: Number(payload.YearId),
      IsActive: Boolean(payload.IsActive)
    });
    return res.data;
  } catch (error) {
    // If PUT fails with 405, try POST
    if (error.response?.status === 405) {
      const res = await agent.post(API.UpdateConstructionYear, {
        YearId: Number(payload.YearId),
        IsActive: Boolean(payload.IsActive)
      });
      return res.data;
    }
    throw error;
  }
},

softDeleteConstructionYear: async (id) => {
  // If the API expects ID in URL
  const res = await agent.delete(API.SoftDeleteConstructionYear(id));
  return res.data;
},
    // ─── Course Approver ────────────────────────────────────
    getAllCourseApprovers: async () => {
      const res = await agent.get(API.GetMasterCourseApprovers);
      return res.data;
    },

    insertCourseApprover: async (payload) => {
      const res = await agent.post(API.InsertMasterCourseApprover, {
        CourseApprover: payload.CourseApprover,
        IsActive:       payload.IsActive,
      });
      return res.data;
    },

    updateCourseApprover: async (payload) => {
      const res = await agent.post(API.UpdateMasterCourseApprover, {
        CourseApproverID: Number(payload.CourseApproverID),
        CourseApprover:   payload.CourseApprover,
        IsActive:         payload.IsActive,
      });
      return res.data;
    },

    softDeleteCourseApprover: async (CourseApproverID) => {
      const res = await agent.post(API.SoftDeleteMasterCourseApprover(CourseApproverID));
      return res.data;
    },

// ─── Contact Us Type ────────────────────────────────────
getAllContactUsTypes: async () => {
  const res = await agent.get(API.GetAllContactUsTypes);
  return res.data;
},

insertContactUsType: async (payload) => {
  const res = await agent.post(API.InsertContactUsType, {
    ContactUsType: payload.ContactUsType,
    IsActive:      payload.IsActive,
  });
  return res.data;
},

updateContactUsType: async (payload) => {
  const res = await agent.post(API.UpdateContactUsType, {
    ContactUsTypeID: Number(payload.ContactUsTypeID),
    ContactUsType:   payload.ContactUsType,
    IsActive:        Boolean(payload.IsActive),
  });
  return res.data;
},

softDeleteContactUsType: async (id) => {
  const res = await agent.post(API.SoftDeleteContactUsType(id));
  return res.data;
},
    // ─── Course Details ───────────────────────────────────
    getAllCourseDetails: async () => {
      const res = await agent.get(API.GetAllCourseDetails);
      return res.data;
    },

    insertCourseDetail: async (payload) => {
      const res = await agent.post(API.InsertCourseDetail, {
        CollegeID:           Number(payload.CollegeID),
        CourseID:            Number(payload.CourseID),
        UnitCode:            payload.UnitCode,
        ShiftId:             Number(payload.ShiftId),
        UnitNo:              Number(payload.UnitNo),
        Intake:              Number(payload.Intake),
        AffilationDate:      payload.AffilationDate      || null,
        AffiliationValidity: payload.AffiliationValidity || null,
        IsActive:            payload.IsActive,
        ExamTypeID:          payload.ExamTypeID  != null && payload.ExamTypeID  !== "" ? Number(payload.ExamTypeID)  : null,
        MinBathDays:         payload.MinBathDays != null && payload.MinBathDays !== "" ? Number(payload.MinBathDays) : null,
        GRNumber:            payload.GRNumber || null,
        GRDate:              payload.GRDate   || null,
      });
      return res.data;
    },

    updateCourseDetail: async (payload) => {
      const res = await agent.put(API.UpdateCourseDetail, {
        CollegeID:           Number(payload.CollegeID),
        CourseID:            Number(payload.CourseID),
        UnitCode:            payload.UnitCode,
        ShiftId:             Number(payload.ShiftId),
        UnitNo:              Number(payload.UnitNo),
        Intake:              Number(payload.Intake),
        AffilationDate:      payload.AffilationDate      || null,
        AffiliationValidity: payload.AffiliationValidity || null,
        IsActive:            payload.IsActive,
        ExamTypeID:          payload.ExamTypeID  != null && payload.ExamTypeID  !== "" ? Number(payload.ExamTypeID)  : null,
        MinBathDays:         payload.MinBathDays != null && payload.MinBathDays !== "" ? Number(payload.MinBathDays) : null,
        GRNumber:            payload.GRNumber || null,
        GRDate:              payload.GRDate   || null,
      });
      return res.data;
    },

    softDeleteCourseDetail: async (collegeID, courseID, unitCode) => {
      const res = await agent.delete(API.SoftDeleteCourseDetail(collegeID, courseID, unitCode));
      return res.data;
    },

    // ─── Sector ───────────────────────────────────────────
    getAllSectors: async () => {
      const res = await agent.get(API.GetAllSectors);
      return res.data;
    },

    insertSector: async (payload) => {
      const res = await agent.post(API.InsertSector, {
        SectorID: payload.SectorID || 0,
        Sector:   payload.Sector,
        IsActive: payload.IsActive,
      });
      return res.data;
    },

    updateSector: async (payload) => {
      const res = await agent.post(API.UpdateSector, {
        SectorID: Number(payload.SectorID),
        Sector:   payload.Sector,
        IsActive: payload.IsActive,
      });
      return res.data;
    },

    softDeleteSector: async (id) => {
      const res = await agent.post(API.SoftDeleteSector(id));
      return res.data;
    },

    // ─── Title ──────────────────────────────────────────────
    getAllTitles: async () => {
      const res = await agent.get(API.GetAllTitles);
      return res.data;
    },

    insertTitle: async (payload) => {
      const res = await agent.post(API.InsertTitle, {
        TitleID:  Number(payload.TitleID),
        Title:    payload.Title,
        IsActive: payload.IsActive,
      });
      return res.data;
    },

    updateTitle: async (payload) => {
      const res = await agent.post(API.UpdateTitle, {
        TitleID:  Number(payload.TitleID),
        Title:    payload.Title,
        IsActive: payload.IsActive,
      });
      return res.data;
    },

    softDeleteTitle: async (id) => {
      const res = await agent.post(API.SoftDeleteTitle(id));
      return res.data;
    },

    // ─── Signature Authority ──────────────────────────────────
    getAllSignatureAuthorities: async () => {
      const res = await agent.get(API.GetAllSignatureAuthorities);
      return res.data;
    },

    insertSignatureAuthority: async (payload) => {
      const res = await agent.post(API.InsertSignatureAuthority, {
        ID:              Number(payload.ID),
        SignatureType:   payload.SignatureType,
        NameOfAuthority: payload.NameOfAuthority,
        Designation:     payload.Designation,
        SignaturePath:   payload.SignaturePath ?? null,
        IsActive:        payload.IsActive,
        IsCurrent:       payload.IsCurrent,
      });
      return res.data;
    },

    updateSignatureAuthority: async (payload) => {
      const res = await agent.post(API.UpdateSignatureAuthority, {
        ID:              Number(payload.ID),
        SignatureType:   payload.SignatureType,
        NameOfAuthority: payload.NameOfAuthority,
        Designation:     payload.Designation,
        SignaturePath:   payload.SignaturePath ?? null,
        IsActive:        payload.IsActive,
        IsCurrent:       payload.IsCurrent,
      });
      return res.data;
    },

    softDeleteSignatureAuthority: async (id) => {
      const res = await agent.post(API.SoftDeleteSignatureAuthority(id));
      return res.data;
    },

   uploadSignatureFile: async (formData) => {
  const res = await agent.post(API.UploadSignatureFile, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
},

    // ─── Floor Preference ──────────────────────────────────
    getAllFloorPreferences: async () => {
      const res = await agent.get(API.GetAllFloorPreferences);
      return res.data;
    },

    insertFloorPreference: async (payload) => {
      const res = await agent.post(API.InsertFloorPreference, {
        FloorId:   Number(payload.FloorId),
        FloorName: payload.FloorName,
        IsActive:  Boolean(payload.IsActive),
      });
      return res.data;
    },

    updateFloorPreference: async (payload) => {
      const res = await agent.post(API.UpdateFloorPreference, {
        FloorId:   Number(payload.FloorId),
        FloorName: payload.FloorName,
        IsActive:  Boolean(payload.IsActive),
      });
      return res.data;
    },

    softDeleteFloorPreference: async (id) => {
      const res = await agent.post(API.SoftDeleteFloorPreference(id));
      return res.data;
    },

    // ─── Grievance Category ────────────────────────────────
    getAllGrievanceCategories: async () => {
      const res = await agent.get(API.GetAllGrievanceCategories);
      return res.data;
    },

    insertGrievanceCategory: async (payload) => {
      const res = await agent.post(API.InsertGrievanceCategory, {
        GrievanceCategoryID: Number(payload.GrievanceCategoryID),
        GrievanceCategory:   payload.GrievanceCategory,
        IsActive:            Boolean(payload.IsActive),
      });
      return res.data;
    },

    updateGrievanceCategory: async (payload) => {
      const res = await agent.post(API.UpdateGrievanceCategory, {
        GrievanceCategoryID: Number(payload.GrievanceCategoryID),
        GrievanceCategory:   payload.GrievanceCategory,
        IsActive:            Boolean(payload.IsActive),
      });
      return res.data;
    },

    softDeleteGrievanceCategory: async (id) => {
      const res = await agent.post(API.SoftDeleteGrievanceCategory(id));
      return res.data;
    },

    // ─── FAQ Category ──────────────────────────────────────
    getAllFAQCategories: async () => {
      const res = await agent.get(API.GetAllFAQCategories);
      return res.data;
    },

    insertFAQCategory: async (payload) => {
      const res = await agent.post(API.InsertFAQCategory, {
        FAQCategoryID: Number(payload.FAQCategoryID),
        FAQCategory:   payload.FAQCategory,
        IsActive:      Boolean(payload.IsActive),
      });
      return res.data;
    },

    updateFAQCategory: async (payload) => {
      const res = await agent.post(API.UpdateFAQCategory, {
        FAQCategoryID: Number(payload.FAQCategoryID),
        FAQCategory:   payload.FAQCategory,
        IsActive:      Boolean(payload.IsActive),
      });
      return res.data;
    },

    softDeleteFAQCategory: async (id) => {
      const res = await agent.post(API.SoftDeleteFAQCategory(id));
      return res.data;
    },

    // ─── Facility Sub Group ───────────────────────────────
    getAllFacilitySubGroups: async () => {
      const res = await agent.get(API.GetAllFacilitySubGroups);
      return res.data; 
    },

    insertFacilitySubGroup: async (payload) => {
      const res = await agent.post(API.InsertFacilitySubGroup, {
        SubFacilityGroupId: Number(payload.SubFacilityGroupId) || 0,
        FacilityGroupId:    Number(payload.FacilityGroupId),
        SubFacilityGroup:   (payload.SubFacilityGroup ?? "").trim(),
        RequiredNumber:     payload.RequiredNumber != null && payload.RequiredNumber !== ""
                              ? Number(payload.RequiredNumber) : 0,
        RequiredSpace:      payload.RequiredSpace != null && payload.RequiredSpace !== ""
                              ? Number(payload.RequiredSpace) : 0,
        HasMultiplyFactor:  Boolean(payload.HasMultiplyFactor),
        IsActive:           Boolean(payload.IsActive),
      });
      return res.data;
    },

    updateFacilitySubGroup: async (payload) => {
      const res = await agent.post(API.UpdateFacilitySubGroup, {
        SubFacilityGroupId: Number(payload.SubFacilityGroupId),
        FacilityGroupId:    Number(payload.FacilityGroupId),
        SubFacilityGroup:   (payload.SubFacilityGroup ?? "").trim(),
        RequiredNumber:     payload.RequiredNumber != null && payload.RequiredNumber !== ""
                              ? Number(payload.RequiredNumber) : 0,
        RequiredSpace:      payload.RequiredSpace != null && payload.RequiredSpace !== ""
                              ? Number(payload.RequiredSpace) : 0,
        HasMultiplyFactor:  Boolean(payload.HasMultiplyFactor),
        IsActive:           Boolean(payload.IsActive),
      });
      return res.data;
    },

    softDeleteFacilitySubGroup: async (id) => {
      const res = await agent.post(API.SoftDeleteFacilitySubGroup(id));
      return res.data;
    },

    // ─── Job Role ────────────────────────────────────────
    getAllJobRoles: async () => {
      const res = await agent.get(API.GetAllJobRoles);
      return res.data;
    },

    insertJobRole: async (payload) => {
      const res = await agent.post(API.InsertJobRole, {
        ID:          Number(payload.ID),
        JobRoleName: payload.JobRoleName,
        IsActive:    payload.IsActive !== undefined ? payload.IsActive : true,
      });
      return res.data;
    },

    updateJobRole: async (payload) => {
      const res = await agent.post(API.UpdateJobRole, {
        ID:          Number(payload.ID),
        JobRoleName: payload.JobRoleName,
        IsActive:    payload.IsActive,
      });
      return res.data;
    },

    softDeleteJobRole: async (id) => {
      const res = await agent.post(API.SoftDeleteJobRole(id));
      return res.data;
    },

    // ─── Location Category ──────────────────────────────
    getAllLocationCategories: async () => {
      const res = await agent.get(API.GetAllLocationCategories);
      return res.data;
    },

    insertLocationCategory: async (payload) => {
      const res = await agent.post(API.InsertLocationCategory, {
        LocationCategoryID: Number(payload.LocationCategoryID),
        LocationCategory:   payload.LocationCategory,
        IsActive:           payload.IsActive !== undefined ? payload.IsActive : true,
      });
      return res.data;
    },

    updateLocationCategory: async (payload) => {
      const res = await agent.post(API.UpdateLocationCategory, {
        LocationCategoryID: Number(payload.LocationCategoryID),
        LocationCategory:   payload.LocationCategory,
        IsActive:           payload.IsActive,
      });
      return res.data;
    },

    softDeleteLocationCategory: async (id) => {
      const res = await agent.post(API.SoftDeleteLocationCategory(id));
      return res.data;
    },

    // ─── Month ──────────────────────────────────────────────
    getAllMonths: async () => {
      const res = await agent.get(API.GetAllMonths);
      return res.data;
    },

    insertMonth: async (payload) => {
      const res = await agent.post(API.InsertMonth, {
        MonthId:    Number(payload.MonthId),
        MonthsName: payload.MonthsName,
        IsActive:   payload.IsActive,
      });
      return res.data;
    },

    updateMonth: async (payload) => {
      const res = await agent.post(API.UpdateMonth, {
        MonthId:    Number(payload.MonthId),
        MonthsName: payload.MonthsName,
        IsActive:   payload.IsActive,
      });
      return res.data;
    },

    softDeleteMonth: async (id) => {
      const res = await agent.post(API.SoftDeleteMonth(id));
      return res.data;
    },

    // ─── Security Question ─────────────────────────────────
    getAllSecurityQuestions: async () => {
      const res = await agent.get(API.GetAllSecurityQuestions);
      return res.data;
    },

    insertSecurityQuestion: async (payload) => {
      const res = await agent.post(API.InsertSecurityQuestion, {
        SecurityQuestionID: Number(payload.SecurityQuestionID),
        SecurityQuestion:   payload.SecurityQuestion,
        IsActive:           payload.IsActive,
      });
      return res.data;
    },

    updateSecurityQuestion: async (payload) => {
      const res = await agent.put(API.UpdateSecurityQuestion, {
        SecurityQuestionID: Number(payload.SecurityQuestionID),
        SecurityQuestion:   payload.SecurityQuestion,
        IsActive:           payload.IsActive,
      });
      return res.data;
    },

    softDeleteSecurityQuestion: async (id) => {
      const res = await agent.delete(API.SoftDeleteSecurityQuestion(id));
      return res.data;
    },

    // ─── Skill Trade ────────────────────────────────────────
    getAllSkillTrades: async () => {
      const res = await agent.get(API.GetAllSkillTrades);
      return res.data;
    },

    insertSkillTrade: async (payload) => {
      const res = await agent.post(API.InsertSkillTrade, {
        ID:        Number(payload.ID),
        TradeName: payload.TradeName,
        TradeCode: payload.TradeCode || null,
        IsActive:  payload.IsActive,
      });
      return res.data;
    },

    updateSkillTrade: async (payload) => {
      const res = await agent.post(API.UpdateSkillTrade, {
        ID:        Number(payload.ID),
        TradeName: payload.TradeName,
        TradeCode: payload.TradeCode || null,
        IsActive:  payload.IsActive,
      });
      return res.data;
    },

    softDeleteSkillTrade: async (id) => {
      const res = await agent.post(API.SoftDeleteSkillTrade(id));
      return res.data;
    },

    // ─── Qualification ──────────────────────────────────────
    getAllQualifications: async () => {
      const res = await agent.get(API.GetAllQualifications);
      return res.data;
    },

    insertQualification: async (payload) => {
      const res = await agent.post(API.InsertQualification, {
        QualificationID:    Number(payload.QualificationID),
        Qualification:      payload.Qualification,
        QualificationGroup: payload.QualificationGroup || null,
        SeqNO:              payload.SeqNO != null && payload.SeqNO !== "" ? Number(payload.SeqNO) : null,
        IsActive:           payload.IsActive,
      });
      return res.data;
    },

    updateQualification: async (payload) => {
      const res = await agent.post(API.UpdateQualification, {
        QualificationID:    Number(payload.QualificationID),
        Qualification:      payload.Qualification,
        QualificationGroup: payload.QualificationGroup || null,
        SeqNO:              payload.SeqNO != null && payload.SeqNO !== "" ? Number(payload.SeqNO) : null,
        IsActive:           payload.IsActive,
      });
      return res.data;
    },

    softDeleteQualification: async (id) => {
      const res = await agent.post(API.SoftDeleteQualification(id));
      return res.data;
    },

    // ─── Restricted Keyword ───────────────────────────────
    getAllKeywords: async () => {
      const res = await agent.get(API.GetAllKeywords);
      return res.data;
    },

    insertKeyword: async (payload) => {
      const res = await agent.post(API.InsertKeyword, {
        KeyWordID:   Number(payload.KeyWordID),
        KeyWordName: payload.KeyWordName,
        IsActive:    payload.IsActive,
      });
      return res.data;
    },

    updateKeyword: async (payload) => {
      const res = await agent.post(API.UpdateKeyword, {
        KeyWordID:   Number(payload.KeyWordID),
        KeyWordName: payload.KeyWordName,
        IsActive:    payload.IsActive,
      });
      return res.data;
    },

    softDeleteKeyword: async (id) => {
      const res = await agent.post(API.SoftDeleteKeyword(id));
      return res.data;
    },

    // ─── Shift ──────────────────────────────────────────────
    getAllShifts: async () => {
      const res = await agent.get(API.GetAllShifts);
      return res.data;
    },

    insertShift: async (payload) => {
      const res = await agent.post(API.InsertShift, {
        ShiftID:  Number(payload.ShiftID),
        Shift:    payload.Shift,
        IsActive: payload.IsActive,
      });
      return res.data;
    },

    updateShift: async (payload) => {
      const res = await agent.post(API.UpdateShift, {
        ShiftID:  Number(payload.ShiftID),
        Shift:    payload.Shift,
        IsActive: payload.IsActive,
      });
      return res.data;
    },

    softDeleteShift: async (id) => {
      const res = await agent.post(API.SoftDeleteShift(id));
      return res.data;
    },

    // ─── VC Application ────────────────────────────────────
    getAllVCApplications: async () => {
      const res = await agent.get(API.GetAllVCApplications);
      return res.data;
    },

    insertVCApplication: async (payload) => {
      const res = await agent.post(API.InsertVCApplication, {
        VCApplication: payload.VCApplication,
      });
      return res.data;
    },

    updateVCApplication: async (payload) => {
      const res = await agent.post(API.UpdateVCApplication, {
        ID:            Number(payload.ID),
        VCApplication: payload.VCApplication,
        IsActive:      Boolean(payload.IsActive),
      });
      return res.data;
    },

    deleteVCApplication: async (id) => {
      const res = await agent.post(API.DeleteVCApplication(id));
      return res.data;
    },

    // ─── Type of Institute ─────────────────────────────────
    getAllTypeofInstitute: async () => {
      const res = await agent.get(API.GetAllTypeofInstitutes);
      return res.data;
    },

    insertTypeofInstitute: async (payload) => {
      const res = await agent.post(API.InsertTypeofInstitute, {
        TypefInstitute: payload.TypefInstitute,
        IsActive:       payload.IsActive !== undefined ? payload.IsActive : true,
        SeqNo:          payload.SeqNo != null && payload.SeqNo !== "" ? Number(payload.SeqNo) : null,
      });
      return res.data;
    },

    updateTypeofInstitute: async (payload) => {
      const res = await agent.post(API.UpdateTypeofInstitute, {
        ID:             Number(payload.ID),
        TypefInstitute: payload.TypefInstitute,
        IsActive:       Boolean(payload.IsActive),
        SeqNo:          payload.SeqNo != null && payload.SeqNo !== "" ? Number(payload.SeqNo) : null,
      });
      return res.data;
    },

    softDeleteTypeofInstitute: async (id) => {
      const res = await agent.post(API.SoftDeleteTypeofInstitute(id));
      return res.data;
    },

    // ─── Training Remark for Utilization ───────────────────
    getAllTrainingRemarkforUtilization: async () => {
      const res = await agent.get(API.GetAllTrainingRemarkforUtilization);
      return res.data;
    },

    insertTrainingRemarkforUtilization: async (payload) => {
      // Don't send ID for insert - let DB generate it
      const res = await agent.post(API.InsertTrainingRemarkforUtilization, {
        RemarkforUtilization: payload.RemarkforUtilization,
        IsActive:             payload.IsActive !== undefined ? payload.IsActive : true,
      });
      return res.data;
    },
updateTrainingRemarkforUtilization: async (payload) => {
  const res = await agent.post(API.UpdateTrainingRemarkforUtilization, {
    ID:                   Number(payload.ID),
    RemarkforUtilization: payload.RemarkforUtilization,
    IsActive:             Boolean(payload.IsActive),
  });
  return res.data;
},

softDeleteTrainingRemarkforUtilization: async (id) => {
  const res = await agent.post(API.SoftDeleteTrainingRemarkforUtilization(id));
  return res.data;
},

    // ─── Training Fee Category ─────────────────────────────
    getAllTrainingFeeCategory: async () => {
      const res = await agent.get(API.GetAllTrainingFeeCategories);
      return res.data;
    },

    insertTrainingFeeCategory: async (payload) => {
      const res = await agent.post(API.InsertTrainingFeeCategory, {
        ID:                  Number(payload.ID),
        TrainingFeeCategory: payload.TrainingFeeCategory,
        IsActive:            payload.IsActive !== undefined ? payload.IsActive : true,
      });
      return res.data;
    },

    updateTrainingFeeCategory: async (payload) => {
      const res = await agent.post(API.UpdateTrainingFeeCategory, {
        ID:                  Number(payload.ID),
        TrainingFeeCategory: payload.TrainingFeeCategory,
        IsActive:            Boolean(payload.IsActive),
      });
      return res.data;
    },

    softDeleteTrainingFeeCategory: async (id) => {
      const res = await agent.post(API.SoftDeleteTrainingFeeCategory(id));
      return res.data;
    },

    // ─── Training Equipment ────────────────────────────────
    getAllTrainingEquipment: async () => {
      const res = await agent.get(API.GetAllTrainingEquipment);
      return res.data;
    },

    insertTrainingEquipment: async (payload) => {
       const res = await agent.post(API.InsertTrainingEquipment, {
        NameofItem: payload.NameofItem,
        ItemCode:   payload.ItemCode || null,
        IsActive:   payload.IsActive !== undefined ? payload.IsActive : true,
      });
      return res.data;
    },

    updateTrainingEquipment: async (payload) => {
      const res = await agent.post(API.UpdateTrainingEquipment, {
        ID:         Number(payload.ID),
        NameofItem: payload.NameofItem,
        ItemCode:   payload.ItemCode || null,
        IsActive:   Boolean(payload.IsActive),
      });
      return res.data;
    },

    softDeleteTrainingEquipment: async (id) => {
      const res = await agent.post(API.SoftDeleteTrainingEquipment(id));
      return res.data;
    },

    // ─── Training Category ──────────────────────────────────
    getAllTrainingCategories: async () => {
      const res = await agent.get(API.GetAllTrainingCategories);
      return res.data;
    },

    insertTrainingCategory: async (payload) => {
      const res = await agent.post(API.InsertTrainingCategory, {
        TrainingCategory: payload.TrainingCategory,
        IsActive:         payload.IsActive !== undefined ? payload.IsActive : true,
      });
      return res.data;
    },

    updateTrainingCategory: async (payload) => {
      // ID is required for update
      const res = await agent.post(API.UpdateTrainingCategory, {
        ID:               Number(payload.ID),
        TrainingCategory: payload.TrainingCategory,
        IsActive:         Boolean(payload.IsActive),
      });
      return res.data;
    },

    softDeleteTrainingCategory: async (id) => {
      const res = await agent.post(API.SoftDeleteTrainingCategory(id));
      return res.data;
    },

    // ─── Training Name of Item ─────────────────────────────
    getAllTrainingNameOfItems: async () => {
      const res = await agent.get(API.GetAllTrainingNameOfItems);
      return res.data;
    },

    insertTrainingNameOfItem: async (payload) => {
      // IDENTITY PK - never send ID, DB assigns it
      const res = await agent.post(API.InsertTrainingNameOfItem, {
        TrainingNameofItem: payload.TrainingNameofItem,
        // TraningCategoryID:  Number(payload.TraningCategoryID),
        IsActive:           payload.IsActive !== undefined ? payload.IsActive : true,
      });
      return res.data;
    },

    updateTrainingNameOfItem: async (payload) => {
      // ID is required for update
      const res = await agent.post(API.UpdateTrainingNameOfItem, {
        ID:                 Number(payload.ID),
        TrainingNameofItem: payload.TrainingNameofItem,
        // TraningCategoryID:  Number(payload.TraningCategoryID),
        IsActive:           Boolean(payload.IsActive),
      });
      return res.data;
    },

    softDeleteTrainingNameOfItem: async (id) => {
      const res = await agent.post(API.SoftDeleteTrainingNameOfItem(id));
      return res.data;
    },

    // ─── Equipment Category ────────────────────────────────
    getAllEquipmentCategories: async () => {
      const res = await agent.get(API.GetAllEquipmentCategories);
      return res.data;
    },

    insertEquipmentCategory: async (payload) => {
      // ID supplied by caller (frontend-computed max(existing)+1) — not DB-assigned
      const res = await agent.post(API.InsertEquipmentCategory, {
        EquipmentCategoryId: Number(payload.EquipmentCategoryId),
        EquipmentCategory:   payload.EquipmentCategory,
        IsActive:            payload.IsActive !== undefined ? payload.IsActive : true,
      });
      return res.data;
    },

    updateEquipmentCategory: async (payload) => {
      // ID is required for update
      const res = await agent.post(API.UpdateEquipmentCategory, {
        EquipmentCategoryId: Number(payload.EquipmentCategoryId),
        EquipmentCategory:   payload.EquipmentCategory,
        IsActive:            Boolean(payload.IsActive),
      });
      return res.data;
    },

    softDeleteEquipmentCategory: async (id) => {
      const res = await agent.post(API.SoftDeleteEquipmentCategory(id));
      return res.data;
    },

    // ─── Sectorial Expertise ────────────────────────────────
    getAllSectorialExpertise: async () => {
      const res = await agent.get(API.GetAllSectorialExpertise);
      return res.data;
    },

    insertSectorialExpertise: async (payload) => {
      // IDENTITY PK - never send SectorialExpertiseID, DB assigns it
      const res = await agent.post(API.InsertSectorialExpertise, {
        SectorialExpertiseName: payload.SectorialExpertiseName,
        SeqNo:                  payload.SeqNo != null && payload.SeqNo !== "" ? Number(payload.SeqNo) : null,
        IsActive:                payload.IsActive !== undefined ? payload.IsActive : true,
      });
      return res.data;
    },

    updateSectorialExpertise: async (payload) => {
      // SectorialExpertiseID is required for update
      const res = await agent.post(API.UpdateSectorialExpertise, {
        SectorialExpertiseID:   Number(payload.SectorialExpertiseID),
        SectorialExpertiseName: payload.SectorialExpertiseName,
        SeqNo:                  payload.SeqNo != null && payload.SeqNo !== "" ? Number(payload.SeqNo) : null,
        IsActive:                Boolean(payload.IsActive),
      });
      return res.data;
    },

    softDeleteSectorialExpertise: async (id) => {
      const res = await agent.post(API.SoftDeleteSectorialExpertise(id));
      return res.data;
    },

    // ─── Subject ────────────────────────────────────────────
    getAllSubjects: async () => {
      const res = await agent.get(API.GetAllSubjects);
      return res.data;
    },

    insertSubject: async (payload) => {
      const res = await agent.post(API.InsertSubject, {
        SubjectName:   payload.SubjectName,
        SubjectCode:   payload.SubjectCode,
        SubjectType:   payload.SubjectType   || null,
        SubjectTypeID: Number(payload.SubjectTypeID),
        IsActive:      payload.IsActive !== undefined ? payload.IsActive : true,
      });
      return res.data;
    },

    updateSubject: async (payload) => {
      const res = await agent.post(API.UpdateSubject, {
        SubjectId:     Number(payload.SubjectId),
        SubjectName:   payload.SubjectName,
        SubjectCode:   payload.SubjectCode,
        SubjectType:   payload.SubjectType   || null,
        SubjectTypeID: Number(payload.SubjectTypeID),
        IsActive:      Boolean(payload.IsActive),
      });
      return res.data;
    },

    softDeleteSubject: async (id) => {
      const res = await agent.post(API.SoftDeleteSubject(id));
      return res.data;
    },

    // ─── Subject Type Exam ────────────────────────────────────
    getAllSubjectTypeExams: async () => {
      const res = await agent.get(API.GetAllSubjectTypeExams);
      return res.data;
    },

    insertSubjectTypeExam: async (payload) => {
      const res = await agent.post(API.InsertSubjectTypeExam, {
        SubjectTypeExamName: payload.SubjectTypeExamName,
        IsActive:            payload.IsActive !== undefined ? payload.IsActive : true,
      });
      return res.data;
    },

    updateSubjectTypeExam: async (payload) => {
      const res = await agent.put(API.UpdateSubjectTypeExam, {
        SubjectTypeExamID:   Number(payload.SubjectTypeExamID),
        SubjectTypeExamName: payload.SubjectTypeExamName,
        IsActive:            Boolean(payload.IsActive),
      });
      return res.data;
    },

    softDeleteSubjectTypeExam: async (id) => {
      const res = await agent.delete(API.SoftDeleteSubjectTypeExam(id));
      return res.data;
    },

    // ─── Promoter Status ──────────────────────────────────────
    getAllPromoterStatuses: async () => {
      const res = await agent.get(API.GetAllPromoterStatuses);
      return res.data;
    },

    insertPromoterStatus: async (payload) => {
      const res = await agent.post(API.InsertPromoterStatus, {
        PromoterStatusID: Number(payload.PromoterStatusID),
        PromoterStatus:   payload.PromoterStatus,
        IsActive:         payload.IsActive !== undefined ? payload.IsActive : true,
      });
      return res.data;
    },

    updatePromoterStatus: async (payload) => {
      const res = await agent.post(API.UpdatePromoterStatus, {
        PromoterStatusID: Number(payload.PromoterStatusID),
        PromoterStatus:   payload.PromoterStatus,
        IsActive:         Boolean(payload.IsActive),
      });
      return res.data;
    },

    softDeletePromoterStatus: async (id) => {
      const res = await agent.post(API.SoftDeletePromoterStatus(id));
      return res.data;
    },

    // ─── Promoter Type ────────────────────────────────────────
    getAllPromoterTypes: async () => {
      const res = await agent.get(API.GetAllPromoterTypes);
      return res.data;
    },

    insertPromoterType: async (payload) => {
      const res = await agent.post(API.InsertPromoterType, {
        PromoterTypeID: Number(payload.PromoterTypeID),
        PromoterType:   payload.PromoterType,
        PromoterGroup:  payload.PromoterGroup ?? null,
        IsActive:       payload.IsActive !== undefined ? payload.IsActive : true,
      });
      return res.data;
    },

    updatePromoterType: async (payload) => {
      const res = await agent.post(API.UpdatePromoterType, {
        PromoterTypeID: Number(payload.PromoterTypeID),
        PromoterType:   payload.PromoterType,
        PromoterGroup:  payload.PromoterGroup ?? null,
        IsActive:       Boolean(payload.IsActive),
      });
      return res.data;
    },

    softDeletePromoterType: async (id) => {
      const res = await agent.post(API.SoftDeletePromoterType(id));
      return res.data;
    },

    // ─── Promoting Type ───────────────────────────────────────
    getAllPromotingTypes: async () => {
      const res = await agent.get(API.GetAllPromotingTypes);
      return res.data;
    },

    insertPromotingType: async (payload) => {
      const res = await agent.post(API.InsertPromotingType, {
        PromotingTypeID: Number(payload.PromotingTypeID),
        PromotingType:   payload.PromotingType,
        PromotingGroup:  payload.PromotingGroup ?? null,
        IsActive:        payload.IsActive !== undefined ? payload.IsActive : true,
      });
      return res.data;
    },

    updatePromotingType: async (payload) => {
      // PromotingTypeID is required for update
      const res = await agent.post(API.UpdatePromotingType, {
        PromotingTypeID: Number(payload.PromotingTypeID),
        PromotingType:   payload.PromotingType,
        PromotingGroup:  payload.PromotingGroup ?? null,
        IsActive:        Boolean(payload.IsActive),
      });
      return res.data;
    },

    softDeletePromotingType: async (id) => {
      const res = await agent.post(API.SoftDeletePromotingType(id));
      return res.data;
    },

    // ─── Notification Category ────────────────────────────────
    getAllNotificationCategories: async () => {
      const res = await agent.get(API.GetAllNotificationCategories);
      return res.data;
    },

    insertNotificationCategory: async (payload) => {
      const res = await agent.post(API.InsertNotificationCategory, {
        NotificationCategoryID: Number(payload.NotificationCategoryID),
        NotificationCategory:   payload.NotificationCategory,
        IsActive:               payload.IsActive !== undefined ? payload.IsActive : true,
      });
      return res.data;
    },

    updateNotificationCategory: async (payload) => {
      const res = await agent.post(API.UpdateNotificationCategory, {
        NotificationCategoryID: Number(payload.NotificationCategoryID),
        NotificationCategory:   payload.NotificationCategory,
        IsActive:               Boolean(payload.IsActive),
      });
      return res.data;
    },

    softDeleteNotificationCategory: async (id) => {
      const res = await agent.post(API.SoftDeleteNotificationCategory(id));
      return res.data;
    },

    // ─── Other Infra ────────────────────────────────────────
    getAllOtherInfra: async () => {
      const res = await agent.get(API.GetAllOtherInfra);
      return res.data;
    },

    insertOtherInfra: async (payload) => {
      // ID supplied by caller (frontend-computed max(existing)+1) — not DB-assigned
      const res = await agent.post(API.InsertOtherInfra, {
        OtherInfraId: Number(payload.OtherInfraId),
        OtherInfra:   payload.OtherInfra,
        IsActive:     payload.IsActive !== undefined ? payload.IsActive : true,
      });
      return res.data;
    },

    updateOtherInfra: async (payload) => {
      const res = await agent.post(API.UpdateOtherInfra, {
        OtherInfraId: Number(payload.OtherInfraId),
        OtherInfra:   payload.OtherInfra,
        IsActive:     Boolean(payload.IsActive),
      });
      return res.data;
    },

    softDeleteOtherInfra: async (id) => {
      const res = await agent.post(API.SoftDeleteOtherInfra(id));
      return res.data;
    },

    // ─── Other Infra Options ───────────────────────────────
    getAllOtherInfraOptions: async () => {
      const res = await agent.get(API.GetAllOtherInfraOptions);
      return res.data;
    },

    insertOtherInfraOptions: async (payload) => {
      const res = await agent.post(API.InsertOtherInfraOptions, {
        OtherInfraId: Number(payload.OtherInfraId),
        OtherInfra:   payload.OtherInfra,
        IsActive:     payload.IsActive !== undefined ? payload.IsActive : true,
      });
      return res.data;
    },

    updateOtherInfraOptions: async (payload) => {
      const res = await agent.post(API.UpdateOtherInfraOptions, {
        OtherInfraId: Number(payload.OtherInfraId),
        OtherInfra:   payload.OtherInfra,
        IsActive:     Boolean(payload.IsActive),
      });
      return res.data;
    },

    softDeleteOtherInfraOptions: async (id) => {
      const res = await agent.post(API.SoftDeleteOtherInfraOptions(id));
      return res.data;
    },

    // ─── User Type ──────────────────────────────────────────
    getAllUserTypes: async () => {
      const res = await agent.get(API.GetAllUserTypes);
      return res.data;
    },

    insertUserType: async (payload) => {
      // UserTypeID is NOT identity — caller supplies it (see backend SP)
      const res = await agent.post(API.InsertUserType, {
        UserTypeID:             Number(payload.UserTypeID),
        UserType:               payload.UserType,
        UserTypeCode:           payload.UserTypeCode      ?? null,
        UserInitial:            payload.UserInitial       ?? null,
        DashboardURL:           payload.DashboardURL      ?? null,
        IsAdmin:                Boolean(payload.IsAdmin),
        IsMultipleLoginAllowed: Boolean(payload.IsMultipleLoginAllowed),
        IsActive:               payload.IsActive !== undefined ? payload.IsActive : true,
        DashboardURLReact:      payload.DashboardURLReact ?? null,
      });
      return res.data;
    },

    updateUserType: async (payload) => {
      const res = await agent.post(API.UpdateUserType, {
        UserTypeID:             Number(payload.UserTypeID),
        UserType:               payload.UserType,
        UserTypeCode:           payload.UserTypeCode      ?? null,
        UserInitial:            payload.UserInitial       ?? null,
        DashboardURL:           payload.DashboardURL      ?? null,
        IsAdmin:                Boolean(payload.IsAdmin),
        IsMultipleLoginAllowed: Boolean(payload.IsMultipleLoginAllowed),
        IsActive:               Boolean(payload.IsActive),
        DashboardURLReact:      payload.DashboardURLReact ?? null,
      });
      return res.data;
    },

    softDeleteUserType: async (id) => {
      const res = await agent.post(API.SoftDeleteUserType(id));
      return res.data;
    },

    // ─── NSQF Level ───────────────────────────────────────
    getAllNSQFLevels: async () => {
      const res = await agent.get(API.GetAllNSQFLevels);
      return res.data;
    },

    insertNSQFLevel: async (payload) => {
      // ID is a plain sequential column — never send it, backend computes next available ID
      const res = await agent.post(API.InsertNSQFLevel, {
        NSQFLEVEL: payload.NSQFLEVEL,
        IsActive:  payload.IsActive !== undefined ? payload.IsActive : true,
      });
      return res.data;
    },

    updateNSQFLevel: async (payload) => {
      const res = await agent.put(API.UpdateNSQFLevel, {
        ID:        Number(payload.ID),
        NSQFLEVEL: payload.NSQFLEVEL,
        IsActive:  Boolean(payload.IsActive),
      });
      return res.data;
    },

    softDeleteNSQFLevel: async (id) => {
      const res = await agent.delete(API.SoftDeleteNSQFLevel(id));
      return res.data;
    },

    // ─── Project Configuration ─────────────────────────────
    getAllProjectConfigurations: async () => {
      const res = await agent.get(API.GetAllProjectConfigurations);
      return res.data;
    },

    insertProjectConfiguration: async (payload) => {
      const res = await agent.post(API.InsertProjectConfiguration, {
        SeqNo:               payload.SeqNo || 0,
        RegionID:            payload.RegionID || 0,
        AppKey:              payload.AppKey,
        AppKeyDetails:       payload.AppKeyDetails,
        AppValue:            payload.AppValue ?? null,
        ControlRequired:     payload.ControlRequired,
        ControlMaxValue:     payload.ControlMaxValue != null && payload.ControlMaxValue !== ""
                                ? Number(payload.ControlMaxValue) : null,
        IsActive:            payload.IsActive !== undefined ? payload.IsActive : true,
        ModifiedBy:          payload.ModifiedBy          || null,
        ModifiedByIPAddress: payload.ModifiedByIPAddress || null,
      });
      return res.data;
    },

    updateProjectConfiguration: async (payload) => {
      const res = await agent.post(API.UpdateProjectConfiguration, {
        SeqNo:               payload.SeqNo,
        RegionID:            payload.RegionID || 0,
        AppKey:              payload.AppKey,
        AppKeyDetails:       payload.AppKeyDetails,
        AppValue:            payload.AppValue ?? null,
        ControlRequired:     payload.ControlRequired,
        ControlMaxValue:     payload.ControlMaxValue != null && payload.ControlMaxValue !== ""
                                ? Number(payload.ControlMaxValue) : null,
        IsActive:            payload.IsActive,
        ModifiedBy:          payload.ModifiedBy          || null,
        ModifiedByIPAddress: payload.ModifiedByIPAddress || null,
      });
      return res.data;
    },

    softDeleteProjectConfiguration: async (id) => {
      const res = await agent.post(API.SoftDeleteProjectConfiguration(id));
      return res.data;
    },

    // ─── ITI Specification Category ────────────────────────
    getAllITISpecificationCategories: async () => {
      const res = await agent.get(API.GetAllITISpecificationCategories);
      return res.data;
    },

    insertITISpecificationCategory: async (payload) => {
      // ID = IDENTITY column — never send it, DB assigns via SCOPE_IDENTITY()
      const res = await agent.post(API.InsertITISpecificationCategory, {
        CategoryName: payload.CategoryName,
        IsActive:     payload.IsActive !== undefined ? payload.IsActive : true,
      });
      return res.data;
    },

    updateITISpecificationCategory: async (payload) => {
      const res = await agent.post(API.UpdateITISpecificationCategory, {
        ID:           Number(payload.ID),
        CategoryName: payload.CategoryName,
        IsActive:     Boolean(payload.IsActive),
      });
      return res.data;
    },

    softDeleteITISpecificationCategory: async (id) => {
      const res = await agent.post(API.SoftDeleteITISpecificationCategory(id));
      return res.data;
    },

    // ─── ITI Specification Group ────────────────────────
    getAllITISpecificationGroups: async () => {
      const res = await agent.get(API.GetAllITISpecificationGroups);
      return res.data;
    },

    insertITISpecificationGroup: async (payload) => {
      // ID = IDENTITY column — never send it, DB assigns via SCOPE_IDENTITY()
      const res = await agent.post(API.InsertITISpecificationGroup, {
        GroupName: payload.GroupName,
        IsActive:  payload.IsActive !== undefined ? payload.IsActive : true,
      });
      return res.data;
    },

    updateITISpecificationGroup: async (payload) => {
      const res = await agent.post(API.UpdateITISpecificationGroup, {
        ID:        Number(payload.ID),
        GroupName: payload.GroupName,
        IsActive:  Boolean(payload.IsActive),
      });
      return res.data;
    },

    softDeleteITISpecificationGroup: async (id) => {
      const res = await agent.post(API.SoftDeleteITISpecificationGroup(id));
      return res.data;
    },

    // ─── ITI Specification Item ────────────────────────
    getAllITISpecificationItems: async () => {
      const res = await agent.get(API.GetAllITISpecificationItems);
      return res.data;
    },

    insertITISpecificationItem: async (payload) => {
      const res = await agent.post(API.InsertITISpecificationItem, {
        NameofITem: payload.NameofITem,
        ItemCode:   payload.ItemCode || null,
        IsActive:   payload.IsActive !== undefined ? payload.IsActive : true,
      });
      return res.data;
    },

    updateITISpecificationItem: async (payload) => {
      const res = await agent.post(API.UpdateITISpecificationItem, {
        ID:         Number(payload.ID),
        NameofITem: payload.NameofITem,
        ItemCode:   payload.ItemCode || null,
        IsActive:   Boolean(payload.IsActive),
      });
      return res.data;
    },

    softDeleteITISpecificationItem: async (id) => {
      const res = await agent.post(API.SoftDeleteITISpecificationItem(id));
      return res.data;
    },

    // ─── ITI Specification Name of Item As Per DGT ────────
    getAllITISpecificationNameofItemAsperDGT: async () => {
      const res = await agent.get(API.GetAllITISpecificationNameofItemAsperDGT);
      return res.data;
    },

    insertITISpecificationNameofItemAsperDGT: async (payload) => {
      const res = await agent.post(API.InsertITISpecificationNameofItemAsperDGT, {
        ItemAsperDGT: (payload.ItemAsperDGT ?? "").trim(),
        IsActive:     payload.IsActive !== undefined ? payload.IsActive : true,
      });
      return res.data;
    },

    updateITISpecificationNameofItemAsperDGT: async (payload) => {
      const res = await agent.post(API.UpdateITISpecificationNameofItemAsperDGT, {
        ID:           Number(payload.ID),
        ItemAsperDGT: (payload.ItemAsperDGT ?? "").trim(),
        IsActive:     Boolean(payload.IsActive),
      });
      return res.data;
    },

    softDeleteITISpecificationNameofItemAsperDGT: async (id) => {
      const res = await agent.post(API.SoftDeleteITISpecificationNameofItemAsperDGT(id));
      return res.data;
    },

    // ─── Item As Per DVET ────────────────────────────────
    getAllItemAsperDVETs: async () => {
      const res = await agent.get(API.GetAllItemAsperDVETs);
      return res.data;
    },

    insertItemAsperDVET: async (payload) => {
      const res = await agent.post(API.InsertItemAsperDVET, {
        ID:            Number(payload.ID),
        ItemAsperDVET: (payload.ItemAsperDVET ?? "").trim(),
        IsActive:      payload.IsActive !== undefined ? payload.IsActive : true,
      });
      return res.data;
    },

    updateItemAsperDVET: async (payload) => {
      const res = await agent.post(API.UpdateItemAsperDVET, {
        ID:            Number(payload.ID),
        ItemAsperDVET: (payload.ItemAsperDVET ?? "").trim(),
        IsActive:      Boolean(payload.IsActive),
      });
      return res.data;
    },

    softDeleteItemAsperDVET: async (id) => {
      const res = await agent.post(API.SoftDeleteItemAsperDVET(id));
      return res.data;
    },

    // ─── ITI Specification Sector ──────────────────────────
    getAllITISpecificationSectors: async () => {
      const res = await agent.get(API.GetAllITISpecificationSectors);
      return res.data;
    },

    insertITISpecificationSector: async (payload) => {
      const res = await agent.post(API.InsertITISpecificationSector, {
        SectorName:            (payload.SectorName ?? "").trim(),
        SpecificationDocument: (payload.SpecificationDocument ?? "").trim() || null,
        IsActive:              payload.IsActive !== undefined ? payload.IsActive : true,
      });
      return res.data;
    },

   updateITISpecificationSector: async (payload) => {
  const res = await agent.post(API.UpdateITISpecificationSector, {  
    ID:                    Number(payload.ID),
    SectorName:            (payload.SectorName ?? "").trim(),
    SpecificationDocument: (payload.SpecificationDocument ?? "").trim() || null,
    IsActive:              Boolean(payload.IsActive),
  });
  return res.data;
},

softDeleteITISpecificationSector: async (id) => {
  const res = await agent.post(API.SoftDeleteITISpecificationSector(id));   
  return res.data;
},

    // ─── ITI Specification Trade ───────────────────────────
    getAllITISpecificationTrades: async () => {
      const res = await agent.get(API.GetAllITISpecificationTrades);
      return res.data;
    },

    insertITISpecificationTrade: async (payload) => {
      const res = await agent.post(API.InsertITISpecificationTrade, {
        TradeName:             (payload.TradeName ?? "").trim(),
        TradeCode:             (payload.TradeCode ?? "").trim() || null,
        SpecificationDocument: (payload.SpecificationDocument ?? "").trim() || null,
        IsActive:              payload.IsActive !== undefined ? payload.IsActive : true,
      });
      return res.data;
    },

    updateITISpecificationTrade: async (payload) => {
      const res = await agent.post(API.UpdateITISpecificationTrade, {
        ID:                    Number(payload.ID),
        TradeName:             (payload.TradeName ?? "").trim(),
        TradeCode:             (payload.TradeCode ?? "").trim() || null,
        SpecificationDocument: (payload.SpecificationDocument ?? "").trim() || null,
        IsActive:              Boolean(payload.IsActive),
      });
      return res.data;
    },

    softDeleteITISpecificationTrade: async (id) => {
      const res = await agent.post(API.SoftDeleteITISpecificationTrade(id));
      return res.data;
    },

    // ─── ITI Specification Usage ───────────────────────────
    getAllITISpecificationUsages: async () => {
      const res = await agent.get(API.GetAllITISpecificationUsages);
      return res.data;
    },

    insertITISpecificationUsage: async (payload) => {
      // ID is IDENTITY on the backend — never send it, DB assigns via SCOPE_IDENTITY()
      const res = await agent.post(API.InsertITISpecificationUsage, {
        Usage:    (payload.Usage ?? "").trim(),
        IsActive: payload.IsActive !== undefined ? payload.IsActive : true,
      });
      return res.data;
    },

    updateITISpecificationUsage: async (payload) => {
      const res = await agent.post(API.UpdateITISpecificationUsage, {
        ID:       Number(payload.ID),
        Usage:    (payload.Usage ?? "").trim(),
        IsActive: Boolean(payload.IsActive),
      });
      return res.data;
    },

    softDeleteITISpecificationUsage: async (id) => {
      const res = await agent.post(API.SoftDeleteITISpecificationUsage(id));
      return res.data;
    },

    // ─── ITI Specification (as per DGT) ────────────────────
    getAllITISpecificationSpecificationAsperDGTs: async () => {
      const res = await agent.get(API.GetAllITISpecificationSpecificationAsperDGTs);
      return res.data;
    },

    insertITISpecificationSpecificationAsperDGT: async (payload) => {
      // ID is IDENTITY on the backend — never send it, DB assigns via SCOPE_IDENTITY()
      const res = await agent.post(API.InsertITISpecificationSpecificationAsperDGT, {
        SpecificationDGT: (payload.SpecificationDGT ?? "").trim(),
        IsActive:         payload.IsActive !== undefined ? payload.IsActive : true,
      });
      return res.data;
    },

    updateITISpecificationSpecificationAsperDGT: async (payload) => {
      const res = await agent.post(API.UpdateITISpecificationSpecificationAsperDGT, {
        ID:               Number(payload.ID),
        SpecificationDGT: (payload.SpecificationDGT ?? "").trim(),
        IsActive:         Boolean(payload.IsActive),
      });
      return res.data;
    },

    softDeleteITISpecificationSpecificationAsperDGT: async (id) => {
      const res = await agent.post(API.SoftDeleteITISpecificationSpecificationAsperDGT(id));
      return res.data;
    },

    // ─── ITI Specification (Sector Wise) ───────────────────
    getAllITISpecificationSectorWises: async () => {
      const res = await agent.get(API.GetAllITISpecificationSectorWises);
      return res.data;
    },

    insertITISpecificationSectorWise: async (payload) => {
      // ID is IDENTITY on the backend — never send it, DB assigns via SCOPE_IDENTITY()
      const res = await agent.post(API.InsertITISpecificationSectorWise, {
        ItemID:         Number(payload.ItemID),
        GroupID:        Number(payload.GroupID),
        SectorID:       Number(payload.SectorID),
        CategoryID:     Number(payload.CategoryID),
        EstimatedPrice: Number(payload.EstimatedPrice) || 0,
        IsActive:       payload.IsActive !== undefined ? payload.IsActive : true,
        IsDocShow:      Boolean(payload.IsDocShow),
      });
      return res.data;
    },

    updateITISpecificationSectorWise: async (payload) => {
      const res = await agent.post(API.UpdateITISpecificationSectorWise, {
        ID:             Number(payload.ID),
        ItemID:         Number(payload.ItemID),
        GroupID:        Number(payload.GroupID),
        SectorID:       Number(payload.SectorID),
        CategoryID:     Number(payload.CategoryID),
        EstimatedPrice: Number(payload.EstimatedPrice) || 0,
        IsActive:       Boolean(payload.IsActive),
        IsDocShow:      Boolean(payload.IsDocShow),
      });
      return res.data;
    },

    softDeleteITISpecificationSectorWise: async (id) => {
      const res = await agent.post(API.SoftDeleteITISpecificationSectorWise(id));
      return res.data;
    },

    // ─── Ignore Words ─────────────────────────────────────
    getAllIgnoreWords: async () => {
      const res = await agent.get(API.GetAllIgnoreWords);
      return res.data;
    },

    insertIgnoreWord: async (payload) => {
  const res = await agent.post(API.InsertIgnoreWord, {
    WordsName:        payload.WordsName,
    IsActive:         payload.IsActive !== undefined ? payload.IsActive : true,
    WordstoBeignored: payload.WordstoBeignored ?? null,
  });
  return res.data;
},

    updateIgnoreWord: async (payload) => {
  const res = await agent.post(API.UpdateIgnoreWord, {
    ID:               Number(payload.ID),
    WordsName:        payload.WordsName,
    IsActive:         Boolean(payload.IsActive),
    WordstoBeignored: payload.WordstoBeignored ?? null,
  });
  return res.data;
},

    softDeleteIgnoreWord: async (id) => {
      const res = await agent.post(API.SoftDeleteIgnoreWord(id));
      return res.data;
    },

    // ─── Financial Year ───────────────────────────────────
    getAllFinancialYears: async () => {
      const res = await agent.get(API.GetAllFinancialYears);
      return res.data;
    },

    insertFinancialYear: async (payload) => {
      const res = await agent.post(API.InsertFinancialYear, {
        FinancialYear: payload.FinancialYear,
        StartDate:     payload.StartDate || null,
        EndDate:       payload.EndDate   || null,
        IsActive:      Boolean(payload.IsActive),
        IsCurrentFY:   Boolean(payload.IsCurrentFY),
      });
      return res.data;
    },

    updateFinancialYear: async (payload) => {
      const res = await agent.post(API.UpdateFinancialYear, {
        FinancialYearID: Number(payload.FinancialYearID),
        FinancialYear:   payload.FinancialYear,
        StartDate:       payload.StartDate || null,
        EndDate:         payload.EndDate   || null,
        IsActive:        Boolean(payload.IsActive),
        IsCurrentFY:     Boolean(payload.IsCurrentFY),
      });
      return res.data;
    },

    softDeleteFinancialYear: async (id) => {
      const res = await agent.post(API.SoftDeleteFinancialYear(id));
      return res.data;
    },

    setCurrentFinancialYear: async (id) => {
      const res = await agent.post(API.SetCurrentFinancialYear(id));
      return res.data;
    },

    // ─── User ───────────────────────────────────────────
    getAllUsers: async () => {
      const res = await agent.get(API.GetAllUsers);
      return res.data;
    },

    insertUser: async (payload) => {
      const res = await agent.post(API.InsertUser, {
        UserID:                 Number(payload.UserID),
        UserTypeID:             payload.UserTypeID === "" || payload.UserTypeID == null ? null : Number(payload.UserTypeID),
        UserLoginID:            (payload.UserLoginID ?? "").trim(),
        UserPassword:           payload.UserPassword ?? "",
        UserName:               (payload.UserName ?? "").trim(),
        UserMobileNo:           (payload.UserMobileNo ?? "").trim(),
        UserEmailID:            (payload.UserEmailID ?? "").trim(),
        SecurityQuestionID:     payload.SecurityQuestionID === "" || payload.SecurityQuestionID == null ? null : Number(payload.SecurityQuestionID),
        SecurityQuestionAnswer: (payload.SecurityQuestionAnswer ?? "").trim(),
        IsActive:               payload.IsActive !== undefined ? Boolean(payload.IsActive) : true,
        ModifiedBy:             payload.ModifiedBy || null,
        ModifiedByIPAddress:    payload.ModifiedByIPAddress || null,
        LoggedInSessionID:      payload.LoggedInSessionID || null,
        FaceEncodingData:       payload.FaceEncodingData || null,
      });
      return res.data;
    },

    updateUser: async (payload) => {
      const res = await agent.post(API.UpdateUser, {
        UserID:                 Number(payload.UserID),
        UserTypeID:             payload.UserTypeID === "" || payload.UserTypeID == null ? null : Number(payload.UserTypeID),
        UserLoginID:            (payload.UserLoginID ?? "").trim(),
        UserPassword:           payload.UserPassword ?? "",   // blank = SP keeps old password unchanged
        UserName:               (payload.UserName ?? "").trim(),
        UserMobileNo:           (payload.UserMobileNo ?? "").trim(),
        UserEmailID:            (payload.UserEmailID ?? "").trim(),
        SecurityQuestionID:     payload.SecurityQuestionID === "" || payload.SecurityQuestionID == null ? null : Number(payload.SecurityQuestionID),
        SecurityQuestionAnswer: (payload.SecurityQuestionAnswer ?? "").trim(),
        IsActive:               Boolean(payload.IsActive),
      });
      return res.data;
    },

    softDeleteUser: async (id) => {
      const res = await agent.post(API.SoftDeleteUser(id));
      return res.data;
    },

    // ─── Batch Type ───────────────────────────────────────
    getAllBatchTypes: async () => {
      const res = await agent.get(API.GetAllBatchTypes);
      return res.data;
    },
insertBatchType: async (payload) => {
      const res = await agent.post(API.InsertBatchType, {
        ID:             Number(payload.ID),
        BatchName:      (payload.BatchName ?? "").trim(),
        AcademicYearID: payload.AcademicYearID === "" || payload.AcademicYearID == null
                          ? null : Number(payload.AcademicYearID),
        IsActive:       payload.IsActive !== undefined ? Boolean(payload.IsActive) : true,
        IsCurrent:      Boolean(payload.IsCurrent),
        IsForAdmission: payload.IsForAdmission ?? null,
        IsForExamFee:   payload.IsForExamFee   ?? null,
        IsForExam:      payload.IsForExam      ?? null,
        IsForResult:    payload.IsForResult    ?? null,
      });
      return res.data;
    },

    updateBatchType: async (payload) => {
      const res = await agent.post(API.UpdateBatchType, {
        ID:             Number(payload.ID),
        BatchName:      (payload.BatchName ?? "").trim(),
        AcademicYearID: payload.AcademicYearID === "" || payload.AcademicYearID == null
                          ? null : Number(payload.AcademicYearID),
        IsActive:       Boolean(payload.IsActive),
        IsCurrent:      Boolean(payload.IsCurrent),
        IsForAdmission: payload.IsForAdmission ?? null,
        IsForExamFee:   payload.IsForExamFee   ?? null,
        IsForExam:      payload.IsForExam      ?? null,
        IsForResult:    payload.IsForResult    ?? null,
      });
      return res.data;
    },


    softDeleteBatchType: async (id) => {
      const res = await agent.post(API.SoftDeleteBatchType(id));
      return res.data;
    },

    // ─── Batch Status ───────────────────────────────────────
    getAllBatchStatuses: async () => {
      const res = await agent.get(API.GetAllBatchStatuses);
      return res.data;
    },

    insertBatchStatus: async (payload) => {
  const res = await agent.post(API.InsertBatchStatus, {
    BatchStatusID:          Number(payload.BatchStatusID),
    BatchStatusName:        (payload.BatchStatusName ?? "").trim(),
    IsActive:               payload.IsActive !== undefined ? Boolean(payload.IsActive) : true,
    BatchStatusDiscription: (payload.BatchStatusDiscription ?? "").trim() || null,
  });
  return res.data;
},

updateBatchStatus: async (payload) => {
  const res = await agent.post(API.UpdateBatchStatus, {   // put → post
    BatchStatusID:          Number(payload.BatchStatusID),
    BatchStatusName:        (payload.BatchStatusName ?? "").trim(),
    IsActive:               Boolean(payload.IsActive),
    BatchStatusDiscription: (payload.BatchStatusDiscription ?? "").trim() || null,
  });
  return res.data;
},

softDeleteBatchStatus: async (id) => {
  const res = await agent.post(API.SoftDeleteBatchStatus(id));  // delete → post
  return res.data;
},

    // ─── Exam Type ────────────────────────────────────────
    getAllExamTypes: async () => {
      const res = await agent.get(API.GetAllExamTypes);
      return res.data;
    },

  insertExamType: async (payload) => {
  const res = await agent.post(API.InsertExamType, {
    ExamTypeID: Number(payload.ExamTypeID),
    ExamType:   (payload.ExamType ?? "").trim(),
    Isactive:   payload.IsActive !== undefined ? Boolean(payload.IsActive) : true,
  });
  return res.data;
},

updateExamType: async (payload) => {
  const res = await agent.post(API.UpdateExamType, {
    ExamTypeID: Number(payload.ExamTypeID),
    ExamType:   (payload.ExamType ?? "").trim(),
    Isactive:   Boolean(payload.Isactive), // ← was payload.IsActive
  });
  console.log("updateExamType res.data:", res.data);
  return res.data;
},
softDeleteExamType: async (id) => {
  const res = await agent.post(API.SoftDeleteExamType(id));
  return res.data;
},

    // ─── Religion ─────────────────────────────────────────
    getAllReligions: async () => {
      const res = await agent.get(API.GetAllReligions);
      return res.data;
    },

    insertReligion: async (payload) => {
      // ReligionID is a plain INT column (NOT IDENTITY) — caller must supply it
      // (component computes max(existing)+1), same pattern as insertExamType.
      const res = await agent.post(API.InsertReligion, {
        ReligionID: Number(payload.ReligionID),
        Religion:   (payload.Religion ?? "").trim(),
        IsActive:   payload.IsActive !== undefined ? Boolean(payload.IsActive) : true,
      });
      return res.data;
    },

    updateReligion: async (payload) => {
      const res = await agent.post(API.UpdateReligion, {
        ReligionID: Number(payload.ReligionID),
        Religion:   (payload.Religion ?? "").trim(),
        IsActive:   Boolean(payload.IsActive),
      });
      return res.data;
    },

    softDeleteReligion: async (id) => {
      const res = await agent.post(API.SoftDeleteReligion(id));
      return res.data;
    },

    // ─── Success Stories ────────────────────────────────────
    getAllSuccessStories: async () => {
      const res = await agent.get(API.GetAllSuccessStories);
      return res.data;
    },

    insertSuccessStory: async (payload) => {
      // ID is IDENTITY on the backend — never send it, DB assigns via SCOPE_IDENTITY()
      const res = await agent.post(API.InsertSuccessStory, {
        FirstName:            (payload.FirstName ?? "").trim(),
        MiddleName:           (payload.MiddleName ?? "").trim(),
        LastName:             (payload.LastName ?? "").trim(),
        CandidateProfileID:   (payload.CandidateProfileID ?? "").trim(),
        PhotoPath:            (payload.PhotoPath ?? "").trim() || null,
        CourseID:             payload.CourseID === "" || payload.CourseID == null ? null : Number(payload.CourseID),
        InstituteID:          payload.InstituteID === "" || payload.InstituteID == null ? null : Number(payload.InstituteID),
        PassingYearID:        payload.PassingYearID === "" || payload.PassingYearID == null ? null : Number(payload.PassingYearID),
        PresentDesignation:   (payload.PresentDesignation ?? "").trim() || null,
        PresentOrganization:  (payload.PresentOrganization ?? "").trim() || null,
        SelectionYearID:      payload.SelectionYearID === "" || payload.SelectionYearID == null ? null : Number(payload.SelectionYearID),
        SelectionYear:        (payload.SelectionYear ?? "").trim() || null,
        IsPublished:          Boolean(payload.IsPublished),
        IsProfile:            Boolean(payload.IsProfile),
        DocumentPath:         (payload.DocumentPath ?? "").trim() || null,
        CandidateMobileNo:    (payload.CandidateMobileNo ?? "").trim() || null,
        IsActive:             payload.IsActive !== undefined ? Boolean(payload.IsActive) : true,
      });
      return res.data;
    },

    updateSuccessStory: async (payload) => {
      const res = await agent.post(API.UpdateSuccessStory, {
        ID:                   Number(payload.ID),
        FirstName:            (payload.FirstName ?? "").trim(),
        MiddleName:           (payload.MiddleName ?? "").trim(),
        LastName:             (payload.LastName ?? "").trim(),
        CandidateProfileID:   (payload.CandidateProfileID ?? "").trim(),
        PhotoPath:            (payload.PhotoPath ?? "").trim() || null,
        CourseID:             payload.CourseID === "" || payload.CourseID == null ? null : Number(payload.CourseID),
        InstituteID:          payload.InstituteID === "" || payload.InstituteID == null ? null : Number(payload.InstituteID),
        PassingYearID:        payload.PassingYearID === "" || payload.PassingYearID == null ? null : Number(payload.PassingYearID),
        PresentDesignation:   (payload.PresentDesignation ?? "").trim() || null,
        PresentOrganization:  (payload.PresentOrganization ?? "").trim() || null,
        SelectionYearID:      payload.SelectionYearID === "" || payload.SelectionYearID == null ? null : Number(payload.SelectionYearID),
        SelectionYear:        (payload.SelectionYear ?? "").trim() || null,
        IsPublished:          Boolean(payload.IsPublished),
        IsProfile:            Boolean(payload.IsProfile),
        DocumentPath:         (payload.DocumentPath ?? "").trim() || null,
        CandidateMobileNo:    (payload.CandidateMobileNo ?? "").trim() || null,
        IsActive:             Boolean(payload.IsActive),
      });
      return res.data;
    },

    softDeleteSuccessStory: async (id) => {
      const res = await agent.post(API.SoftDeleteSuccessStory(id));
      return res.data;
    },

    // ─── ITI Specification Item V2 ─────────────────────
    getAllITISpecificationItemsV2: async () => {
      const res = await agent.get(API.GetAllITISpecificationItemsV2);
      return res.data;
    },

    insertITISpecificationItemV2: async (payload) => {
      const res = await agent.post(API.InsertITISpecificationItemV2, {
        NameofITem: payload.NameofITem,
        ItemCode:   payload.ItemCode || null,
        IsActive:   payload.IsActive !== undefined ? payload.IsActive : true,
      });
      return res.data;
    },

    updateITISpecificationItemV2: async (payload) => {
      const res = await agent.post(API.UpdateITISpecificationItemV2, {
        ID:         Number(payload.ID),
        NameofITem: payload.NameofITem,
        ItemCode:   payload.ItemCode || null,
        IsActive:   Boolean(payload.IsActive),
      });
      return res.data;
    },

    softDeleteITISpecificationItemV2: async (id) => {
      const res = await agent.post(API.SoftDeleteITISpecificationItemV2(id));
      return res.data;
    },

    // ─── Institute Category ────────────────────────────────
    getAllInstituteCategories: async () => {
      const res = await agent.get(API.GetAllInstituteCategories);
      return res.data;
    },

    insertInstituteCategory: async (payload) => {
      // CategoryID intentionally omitted — it's an IDENTITY column,
      // the database auto-generates it. Sending it (even 0/null) causes:
      // "Cannot insert explicit value for identity column ... IDENTITY_INSERT is OFF"
      const res = await agent.post(API.InsertInstituteCategory, {
        Category:     (payload.Category ?? "").trim(),
        CategoryCode: (payload.CategoryCode ?? "").trim() || null,
        SeqNo:        Number(payload.SeqNo) || 0,
        IsActive:     payload.IsActive !== undefined ? Boolean(payload.IsActive) : true,
      });
      return res.data;
    },

    updateInstituteCategory: async (payload) => {
      const res = await agent.post(API.UpdateInstituteCategory, {
        CategoryID:   Number(payload.CategoryID),
        Category:     (payload.Category ?? "").trim(),
        CategoryCode: (payload.CategoryCode ?? "").trim() || null,
        SeqNo:        Number(payload.SeqNo) || 0,
        IsActive:     Boolean(payload.IsActive),
      });
      return res.data;
    },

    softDeleteInstituteCategory: async (id) => {
      const res = await agent.post(API.SoftDeleteInstituteCategory(id));
      return res.data;
    },

    // ─── Institute Ownership ────────────────────────────────
    getAllInstituteOwnerships: async () => {
      const res = await agent.get(API.GetAllInstituteOwnerships);
      return res.data;
    },

    // Fetches the next SeqNo (display-order column) from the backend.
    // NOTE: OwnershipID itself is IDENTITY — this is NOT used to pre-fill the PK,
    // only the SeqNo field. Call on flyout mount for ADD mode only (see component).
    getNextSeqNoInstituteOwnership: async () => {
      const res = await agent.get(API.GetNextSeqNoInstituteOwnership);
      return res.data; // ApiResponse wrapper -> res.Data holds the plain int
    },

    insertInstituteOwnership: async (payload) => {
      // OwnershipID intentionally omitted — IDENTITY column, DB assigns via SCOPE_IDENTITY()
      const res = await agent.post(API.InsertInstituteOwnership, {
        OwnershipName: (payload.OwnershipName ?? "").trim(),
        OwnershipCode: (payload.OwnershipCode ?? "").trim(),
        SeqNo:         Number(payload.SeqNo) || 0,
        IsActive:      payload.IsActive !== undefined ? Boolean(payload.IsActive) : true,
      });
      return res.data;
    },

    updateInstituteOwnership: async (payload) => {
      const res = await agent.post(API.UpdateInstituteOwnership, {
        OwnershipID:   Number(payload.OwnershipID),
        OwnershipName: (payload.OwnershipName ?? "").trim(),
        OwnershipCode: (payload.OwnershipCode ?? "").trim(),
        SeqNo:         Number(payload.SeqNo) || 0,
        IsActive:      Boolean(payload.IsActive),
      });
      return res.data;
    },

    softDeleteInstituteOwnership: async (id) => {
      const res = await agent.post(API.SoftDeleteInstituteOwnership(id));
      return res.data;
    },

    // ─── Infra Category ────────────────────────────────────
    getAllInfraCategories: async () => {
      const res = await agent.get(API.GetAllInfraCategories);
      return res.data;
    },

    insertInfraCategory: async (payload) => {
     
      const res = await agent.post(API.InsertInfraCategory, {
        InfraCategoryID: Number(payload.InfraCategoryID),
        InfraCategory:   (payload.InfraCategory ?? "").trim(),
        IsActive:        payload.IsActive !== undefined ? Boolean(payload.IsActive) : true,
      });
      return res.data;
    },

    updateInfraCategory: async (payload) => {
      const res = await agent.post(API.UpdateInfraCategory, {
        InfraCategoryID: Number(payload.InfraCategoryID),
        InfraCategory:   (payload.InfraCategory ?? "").trim(),
        IsActive:        Boolean(payload.IsActive),
      });
      return res.data;
    },

    softDeleteInfraCategory: async (id) => {
      const res = await agent.post(API.SoftDeleteInfraCategory(id));
      return res.data;
    },

    // ─── Infra Item ───────────────────────────────────────
    getAllInfraItems: async () => {
      const res = await agent.get(API.GetAllInfraItems);
      return res.data;
    },

    insertInfraItem: async (payload) => {
      const res = await agent.post(API.InsertInfraItem, payload);
      return res.data;
    },

    updateInfraItem: async (payload) => {
      const res = await agent.post(API.UpdateInfraItem, payload);
      return res.data;
    },

    softDeleteInfraItem: async (id) => {
      const res = await agent.post(API.SoftDeleteInfraItem(id));
      return res.data;
    },

    // ─── Training Equipment List ───────────────────────────
    getAllTrainingEquipmentList: async () => {
      const res = await agent.get(API.GetAllTrainingEquipmentList);
      return res.data;
    },

    insertTrainingEquipmentList: async (payload) => {
      // EquipmentId is NOT identity — caller supplies it (frontend-computed max(existing)+1),
      // same pattern as InfraItem / ExamType.
      const res = await agent.post(API.InsertTrainingEquipmentList, {
        EquipmentId:          Number(payload.EquipmentId),
        CourseID:             Number(payload.CourseID),
        ItemID:               Number(payload.ItemID),
        EquipmentCategoryId:  Number(payload.EquipmentCategoryId),
        UtilizationRemarksID: Number(payload.UtilizationRemarksID),
        IsDsrItem:            Boolean(payload.IsDsrItem),
        IsMouItem:            Boolean(payload.IsMouItem),
        IsMandatory:          Boolean(payload.IsMandatory),
        IsAlliedCourseItem:   Boolean(payload.IsAlliedCourseItem),
        RequiredPerUnit:      Number(payload.RequiredPerUnit),
        IsActive:             payload.IsActive !== undefined ? Boolean(payload.IsActive) : true,
      });
      return res.data;
    },

    updateTrainingEquipmentList: async (payload) => {
      const res = await agent.post(API.UpdateTrainingEquipmentList, {
        EquipmentId:          Number(payload.EquipmentId),
        CourseID:             Number(payload.CourseID),
        ItemID:               Number(payload.ItemID),
        EquipmentCategoryId:  Number(payload.EquipmentCategoryId),
        UtilizationRemarksID: Number(payload.UtilizationRemarksID),
        IsDsrItem:            Boolean(payload.IsDsrItem),
        IsMouItem:            Boolean(payload.IsMouItem),
        IsMandatory:          Boolean(payload.IsMandatory),
        IsAlliedCourseItem:   Boolean(payload.IsAlliedCourseItem),
        RequiredPerUnit:      Number(payload.RequiredPerUnit),
        IsActive:             Boolean(payload.IsActive),
      });
      return res.data;
    },

    softDeleteTrainingEquipmentList: async (id) => {
      const res = await agent.post(API.SoftDeleteTrainingEquipmentList(id));
      return res.data;
    },

    // ─── Course (lookup only) ──────────────────────────────
    getAllCourses: async () => {
      const res = await agent.get(API.GetAllCourses); // GET /Base/GetMasterCourse
      return res.data;
    },

    // ─── OBWC Course ────────────────────────────────────────
    getAllOBWCCourses: async () => {
      const res = await agent.get(API.GetAllOBWCCourses);
      return res.data;
    },
  insertOBWCCourse: async (payload) => {
      // Id is IDENTITY on the backend — never send it, DB assigns via SCOPE_IDENTITY()
      const res = await agent.post(API.InsertOBWCCourse, {
        MBOCWPortalName: (payload.MBOCWPortalName ?? "").trim(),
        CourseCode:      (payload.CourseCode ?? "").trim(),
        CourseName:      (payload.CourseName ?? "").trim(),
        DurationinHours: (payload.DurationinHours ?? "").trim(),
        Sector:          (payload.Sector ?? "").trim(),
        IsActive:        payload.IsActive !== undefined ? Boolean(payload.IsActive) : true,
      });
      return res.data;
    },

    updateOBWCCourse: async (payload) => {
      const res = await agent.post(API.UpdateOBWCCourse, {
        Id:               Number(payload.Id),
        MBOCWPortalName:  (payload.MBOCWPortalName ?? "").trim(),
        CourseCode:       (payload.CourseCode ?? "").trim(),
        CourseName:       (payload.CourseName ?? "").trim(),
        DurationinHours:  (payload.DurationinHours ?? "").trim(),
        Sector:           (payload.Sector ?? "").trim(),
        IsActive:         Boolean(payload.IsActive),
      });
      return res.data;
    },

    softDeleteOBWCCourse: async (id) => {
      const res = await agent.post(API.SoftDeleteOBWCCourse(id));
      return res.data;
    },

    // ─── OBWC Institute ─────────────────────────────────────
    getAllOBWCInstitutes: async () => {
      const res = await agent.get(API.GetAllOBWCInstitutes);
      return res.data;
    },

    insertOBWCInstitute: async (payload) => {
      // Id is IDENTITY on the backend — never send it, DB assigns via SCOPE_IDENTITY()
      const res = await agent.post(API.InsertOBWCInstitute, {
        NameasperBOCWPortal:     (payload.NameasperBOCWPortal ?? "").trim(),
        InstituteCode:           (payload.InstituteCode ?? "").trim(),
        TrainingPartner:         (payload.TrainingPartner ?? "").trim(),
        Address:                 (payload.Address ?? "").trim() || null,
        CityVillage:             (payload.CityVillage ?? "").trim(),
        PinCode:                 (payload.PinCode ?? "").trim() || null,
        Taluka:                  (payload.Taluka ?? "").trim() || null,
        District:                (payload.District ?? "").trim(),
        Title:                   (payload.Title ?? "").trim() || null,
        FirstName:               (payload.FirstName ?? "").trim(),
        MiddleName:              (payload.MiddleName ?? "").trim() || null,
        LastName:                (payload.LastName ?? "").trim(),
        PrimaryMobileNumber:     (payload.PrimaryMobileNumber ?? "").trim(),
        AlternativeMobileNumber: (payload.AlternativeMobileNumber ?? "").trim() || null,
        EMailID:                 (payload.EMailID ?? "").trim(),
        IsActive:                payload.IsActive !== undefined ? Boolean(payload.IsActive) : true,
      });
      return res.data;
    },

    updateOBWCInstitute: async (payload) => {
      const res = await agent.post(API.UpdateOBWCInstitute, {
        Id:                      Number(payload.Id),
        NameasperBOCWPortal:     (payload.NameasperBOCWPortal ?? "").trim(),
        InstituteCode:           (payload.InstituteCode ?? "").trim(),
        TrainingPartner:         (payload.TrainingPartner ?? "").trim(),
        Address:                 (payload.Address ?? "").trim() || null,
        CityVillage:             (payload.CityVillage ?? "").trim(),
        PinCode:                 (payload.PinCode ?? "").trim() || null,
        Taluka:                  (payload.Taluka ?? "").trim() || null,
        District:                (payload.District ?? "").trim(),
        Title:                   (payload.Title ?? "").trim() || null,
        FirstName:               (payload.FirstName ?? "").trim(),
        MiddleName:              (payload.MiddleName ?? "").trim() || null,
        LastName:                (payload.LastName ?? "").trim(),
        PrimaryMobileNumber:     (payload.PrimaryMobileNumber ?? "").trim(),
        AlternativeMobileNumber: (payload.AlternativeMobileNumber ?? "").trim() || null,
        EMailID:                 (payload.EMailID ?? "").trim(),
        IsActive:                Boolean(payload.IsActive),
      });
      return res.data;
    },

    softDeleteOBWCInstitute: async (id) => {
      const res = await agent.post  (API.SoftDeleteOBWCInstitute(id));
      return res.data;
    },
  };