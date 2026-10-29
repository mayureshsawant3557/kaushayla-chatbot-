using Portal.Entities.Master;
using Portal.Entities.Master;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Portal.Entities.Master.MasterBatchEntity;

namespace Portal.Business.Interface.Master
{
    public interface IMaster
    {
        #region Master List

        //DataTable GetMasterList();
        List<MasterListEntity> GetMasterList();

        #endregion

        #region
        // State Methods
        List<MasterStateEntity> GetMasterState();  // was List<DropdownEntity>
        bool InsertMasterState(MasterStateEntity entity);
        bool UpdateMasterState(MasterStateEntity entity);
        bool SoftDeleteMasterState(int StateID);
        #endregion

        #region
        List<MasterDistrictEntity> GetMasterDistricttable();
        bool InsertMasterDistrict(MasterDistrictEntity entity);
        bool UpdateMasterDistrict(MasterDistrictEntity entity);
        bool SoftDeleteMasterDistrict(int DistrictID);
        #endregion

        #region
        List<MasterTalukaEntity> GetMasterTalukatable();
        bool InsertMasterTaluka(MasterTalukaEntity entity);
        bool UpdateMasterTaluka(MasterTalukaEntity entity);
        bool SoftDeleteMasterTaluka(int TalukaID);
        #endregion

        #region City
        List<MasterCityEntity> GetMasterCity(int pageNumber, int pageSize, string search, bool? isActive = null, bool? isRural = null);
        MasterCityStatsEntity GetMasterCityStats();
        bool InsertMasterCity(MasterCityEntity entity);
        bool UpdateMasterCity(MasterCityEntity entity);
        bool SoftDeleteMasterCity(int CityID);

        #endregion

        #region
        // Pincode Methods
        List<MasterPincodeEntity> GetMasterPincode(int pageNumber, int pageSize, string search);
        bool InsertMasterPincode(MasterPincodeEntity entity);
        bool UpdateMasterPincode(MasterPincodeEntity entity);
        bool SoftDeleteMasterPincode(int PincodeID);
        MasterPincodeStatsEntity GetMasterPincodeStats();
        #endregion

        #region
        List<MasterRegionEntity> GetMasterRegion();
        bool InsertMasterRegion(MasterRegionEntity entity);
        bool UpdateMasterRegion(MasterRegionEntity entity);
        bool SoftDeleteMasterRegion(int RegionID);
        #endregion

        #region
        //List<MasterCasteEntity> GetMasterCaste();
        bool InsertMasterCaste(MasterCasteEntity entity);
        bool UpdateMasterCaste(MasterCasteEntity entity);
        (bool Success, string Message) SoftDeleteMasterCaste(int CasteID);

        List<MasterCasteEntity> GetAllMasterCaste();
        #endregion

        #region
        // Category Methods

        List<MasterCategoryEntity> GetMasterCasteCategory();
        bool InsertMasterCategory(MasterCategoryEntity entity);
        bool UpdateMasterCategory(MasterCategoryEntity entity);
        bool SoftDeleteMasterCategory(int CategoryID);
        #endregion

        #region

        List<MasterAcademicYearEntity> GetAllAcademicYears();
        bool InsertAcademicYear(MasterAcademicYearEntity entity);
        bool UpdateAcademicYear(MasterAcademicYearEntity entity);
        bool SoftDeleteAcademicYear(int YearId);
        #endregion

        #region
        List<MasterActivityStatusEntity> GetAllActivityStatuses();
        bool InsertActivityStatus(MasterActivityStatusEntity entity);
        bool UpdateActivityStatus(MasterActivityStatusEntity entity);
        bool SoftDeleteActivityStatus(int SeqNo, string ModifiedBy, string ModifiedByIPAddress);
        #endregion

        #region Disability Methods

        List<MasterDisabilityEntity> GetAllDisabilities();
        bool InsertDisability(MasterDisabilityEntity entity);
        bool UpdateDisability(MasterDisabilityEntity entity);
        bool SoftDeleteDisability(int DisabilityID);

        #endregion

        #region
        List<MasterAffiliationPageEntity> GetMasterAffiliationPages();
        bool InsertMasterAffiliationPage(MasterAffiliationPageEntity entity);
        bool UpdateMasterAffiliationPage(MasterAffiliationPageEntity entity);
        bool SoftDeleteMasterAffiliationPage(int PageId);
        #endregion

        #region
        List<MasterApplicationFormLinkEntity> GetMasterApplicationFormLinks();
        bool InsertMasterApplicationFormLink(MasterApplicationFormLinkEntity entity);
        bool UpdateMasterApplicationFormLink(MasterApplicationFormLinkEntity entity);
        bool SoftDeleteMasterApplicationFormLink(int LinkID);
        #endregion

        #region ApprovalGroup
        List<Master_ApprovalGroupEntity> GetMaster_ApprovalGroups();
        bool InsertMasterApprovalGroup(Master_ApprovalGroupEntity entity);
        bool UpdateMasterApprovalGroup(Master_ApprovalGroupEntity entity);
        bool SoftDeleteMasterApprovalGroup(int ID);
        #endregion

        #region MasterBatch Methods
        List<MasterBatchEntity> GetMasterBatches();
        bool InsertMasterBatch(MasterBatchEntity entity);
        bool UpdateMasterBatch(MasterBatchEntity entity);
        bool SoftDeleteMasterBatch(int ID);
        #endregion

        #region Country Methods

        List<MasterCountryEntity> GetMasterCountries();

        int InsertMasterCountry(MasterCountryEntity entity);

        bool UpdateMasterCountry(MasterCountryEntity entity);

        bool SoftDeleteMasterCountry(int CountryID);

        #endregion

        #region ApprovalOrder Methods
        List<MasterApprovalOrderEntity> GetMasterApprovalOrders();
        bool InsertMasterApprovalOrder(MasterApprovalOrderEntity entity);
        bool UpdateMasterApprovalOrder(MasterApprovalOrderEntity entity);
        bool SoftDeleteMasterApprovalOrder(int ID);
        #endregion

        #region SubSector Methods
        List<MasterSubSectorEntity> GetMasterSubSectors();
        bool InsertMasterSubSector(MasterSubSectorEntity entity);
        bool UpdateMasterSubSector(MasterSubSectorEntity entity);
        bool SoftDeleteMasterSubSector(int SubSectorID);
        #endregion

        #region SubjectCourse Methods
        List<MasterSubjectCourseEntity> GetMasterSubjectCourses();
        bool InsertMasterSubjectCourse(MasterSubjectCourseEntity entity);
        bool UpdateMasterSubjectCourse(MasterSubjectCourseEntity entity);
        bool SoftDeleteMasterSubjectCourse(int CourseID, string SubjectCode);
        #endregion

        #region MasterLanguage Methods
        List<MasterLanguageEntity> GetMasterLanguages();
        bool InsertMasterLanguage(MasterLanguageEntity entity);
        bool UpdateMasterLanguage(MasterLanguageEntity entity);
        bool SoftDeleteMasterLanguage(int LanguageID);
        #endregion

        #region Designation
        List<MasterDesignationEntity> GetMasterDesignations();
        bool InsertMasterDesignation(MasterDesignationEntity entity);
        bool UpdateMasterDesignation(MasterDesignationEntity entity);
        bool SoftDeleteMasterDesignation(int DesignationId);
        #endregion

        #region CourseType Methods
        List<MasterCourseTypeEntity> GetMasterCourseTypes();
        bool InsertMasterCourseType(MasterCourseTypeEntity entity);
        bool UpdateMasterCourseType(MasterCourseTypeEntity entity);
        bool SoftDeleteMasterCourseType(int CourseTypeID);
        #endregion

        #region MasterDocuments Interface
        List<MasterDocumentEntity> GetMasterDocuments();
        bool InsertMasterDocument(MasterDocumentEntity entity);
        bool UpdateMasterDocument(MasterDocumentEntity entity);
        bool SoftDeleteMasterDocument(int ID);
        #endregion

        #region FacilityGroup Methods
        List<MasterFacilityGroupEntity> GetMasterFacilityGroups();
        bool InsertMasterFacilityGroup(MasterFacilityGroupEntity entity);
        bool UpdateMasterFacilityGroup(MasterFacilityGroupEntity entity);
        bool SoftDeleteMasterFacilityGroup(int FacilityGroupId);
        #endregion

        #region BloodGroup Methods

        List<MasterBloodGroupEntity> GetMasterBloodGroups();
        bool InsertMasterBloodGroup(MasterBloodGroupEntity entity);
        bool UpdateMasterBloodGroup(MasterBloodGroupEntity entity);
        bool SoftDeleteMasterBloodGroup(int BloodGroupId);

        #endregion

        #region MasterGender Methods
        List<MasterGenderEntity> GetMasterGenders();
        bool InsertMasterGender(MasterGenderEntity entity);
        bool UpdateMasterGender(MasterGenderEntity entity);
        bool SoftDeleteMasterGender(string GenderCode);
        #endregion

        #region BuildingFloor Methods

        List<MasterBuildingFloorEntity> GetMasterBuildingFloor();
        bool InsertMasterBuildingFloor(MasterBuildingFloorEntity entity);
        bool UpdateMasterBuildingFloor(MasterBuildingFloorEntity entity);
        bool SoftDeleteMasterBuildingFloor(int FloorId);

        #endregion

        #region BuildingNameType Methods
        List<MasterBuildingNameTypeEntity> GetMasterBuildingNameTypes();
        bool InsertMasterBuildingNameType(MasterBuildingNameTypeEntity entity);
        bool UpdateMasterBuildingNameType(MasterBuildingNameTypeEntity entity);
        bool SoftDeleteMasterBuildingNameType(int BuildingNameTypeId);
        #endregion

        #region BuildingOwnershipType Methods

        List<MasterBuildingOwnershipTypeEntity> GetMasterBuildingOwnershipTypes();
        bool InsertMasterBuildingOwnershipType(MasterBuildingOwnershipTypeEntity entity);
        bool UpdateMasterBuildingOwnershipType(MasterBuildingOwnershipTypeEntity entity);
        bool SoftDeleteMasterBuildingOwnershipType(int OwnerShipTypeid);

        #endregion

        #region BuildingStatus Methods

        List<MasterBuildingStatusEntity> GetMasterBuildingStatuses();
        bool InsertMasterBuildingStatus(MasterBuildingStatusEntity entity);
        bool UpdateMasterBuildingStatus(MasterBuildingStatusEntity entity);
        bool SoftDeleteMasterBuildingStatus(int BuildingStatusId);

        #endregion

        #region BuildingUsageType Methods
        List<MasterBuildingUsageTypeEntity> GetMasterBuildingUsageTypes();
        bool InsertMasterBuildingUsageType(MasterBuildingUsageTypeEntity entity);
        bool UpdateMasterBuildingUsageType(MasterBuildingUsageTypeEntity entity);
        bool SoftDeleteMasterBuildingUsageType(int UsageTypeId);
        #endregion

        #region Constituency Methods
        List<MasterConstituencyEntity> GetMasterConstituencies();
        bool InsertMasterConstituency(MasterConstituencyEntity entity);
        bool UpdateMasterConstituency(MasterConstituencyEntity entity);
        bool SoftDeleteMasterConstituency(int ConstituencyID);
        #endregion

        #region
        List<MasterConstructionTypeEntity> GetMasterConstructionTypes();
        bool InsertMasterConstructionType(MasterConstructionTypeEntity entity);
        bool UpdateMasterConstructionType(MasterConstructionTypeEntity entity);
        bool SoftDeleteMasterConstructionType(int ConstructionTypeId);
        #endregion

        #region ConstructionYear Interface
        List<MasterConstructionYearEntity> GetMasterConstructionYears();
        bool InsertMasterConstructionYear(MasterConstructionYearEntity entity);
        bool UpdateMasterConstructionYear(MasterConstructionYearEntity entity);
        bool SoftDeleteMasterConstructionYear(int YearId);
        #endregion

        #region
        List<MasterContactUsTypeEntity> GetMasterContactUsTypes();
        bool InsertMasterContactUsType(MasterContactUsTypeEntity entity);
        bool UpdateMasterContactUsType(MasterContactUsTypeEntity entity);
        bool SoftDeleteMasterContactUsType(int ContactUsTypeID);
        #endregion

        #region
        List<MasterCourseApproverEntity> GetMasterCourseApprovers();
        bool InsertMasterCourseApprover(MasterCourseApproverEntity entity);
        bool UpdateMasterCourseApprover(MasterCourseApproverEntity entity);
        bool SoftDeleteMasterCourseApprover(int CourseApproverID);
        #endregion

        #region Sector
        List<MasterSectorEntity> GetMasterSectors();
        bool InsertMasterSector(MasterSectorEntity entity);
        bool UpdateMasterSector(MasterSectorEntity entity);
        bool SoftDeleteMasterSector(int SectorID);
        #endregion

        #region
        List<MasterElectiveSubjectEntity> GetMasterElectiveSubjects();
        bool InsertMasterElectiveSubject(MasterElectiveSubjectEntity entity);
        bool UpdateMasterElectiveSubject(MasterElectiveSubjectEntity entity);
        bool SoftDeleteMasterElectiveSubject(int ID);
        #endregion

        #region MasterTitle Interface Methods

        List<MasterTitleEntity> GetMasterTitles();
        bool InsertMasterTitle(MasterTitleEntity entity);
        bool UpdateMasterTitle(MasterTitleEntity entity);
        bool SoftDeleteMasterTitle(int TitleID);

        #endregion

        #region SignatureAuthority
        List<MasterSignatureAuthorityEntity> GetMasterSignatureAuthorities();
        int InsertMasterSignatureAuthority(MasterSignatureAuthorityEntity entity);
        bool UpdateMasterSignatureAuthority(MasterSignatureAuthorityEntity entity);
        bool SoftDeleteMasterSignatureAuthority(int ID);
        #endregion

        #region FloorPreference

        List<MasterFloorPreferenceEntity> GetMasterFloorPreferences();
        bool InsertMasterFloorPreference(MasterFloorPreferenceEntity entity);
        bool UpdateMasterFloorPreference(MasterFloorPreferenceEntity entity);
        bool SoftDeleteMasterFloorPreference(int FloorId);

        #endregion

        #region GrievanceCategory
        List<MasterGrievanceCategoryEntity> GetMasterGrievanceCategories();
        bool InsertMasterGrievanceCategory(MasterGrievanceCategoryEntity entity);
        bool UpdateMasterGrievanceCategory(MasterGrievanceCategoryEntity entity);
        bool SoftDeleteMasterGrievanceCategory(int GrievanceCategoryID);
        #endregion

        #region
        List<MasterFAQCategoryEntity> GetMasterFAQCategories();
        bool InsertMasterFAQCategory(MasterFAQCategoryEntity entity);
        bool UpdateMasterFAQCategory(MasterFAQCategoryEntity entity);
        bool SoftDeleteMasterFAQCategory(int FAQCategoryID);
        #endregion

        #region FacilitySubGroup

        List<MasterFacilitySubGroupEntity> GetMasterFacilitySubGroups();
        bool InsertMasterFacilitySubGroup(MasterFacilitySubGroupEntity entity);
        bool UpdateMasterFacilitySubGroup(MasterFacilitySubGroupEntity entity);
        bool SoftDeleteMasterFacilitySubGroup(int SubFacilityGroupId);

        #endregion

        #region JobRole Interface Members
        List<MasterJobRoleEntity> GetMasterJobRoles();
        bool InsertMasterJobRole(MasterJobRoleEntity entity);
        bool UpdateMasterJobRole(MasterJobRoleEntity entity);
        bool SoftDeleteMasterJobRole(int ID);
        #endregion

        #region LocationCategory Methods
        List<MasterLocationCategoryEntity> GetMasterLocationCategories();
        bool InsertMasterLocationCategory(MasterLocationCategoryEntity entity);
        bool UpdateMasterLocationCategory(MasterLocationCategoryEntity entity);
        bool SoftDeleteMasterLocationCategory(int LocationCategoryID);
        #endregion

        #region LandOwnershipType Methods
        List<MasterLandOwnershipTypeEntity> GetMasterLandOwnershipTypes();
        bool InsertMasterLandOwnershipType(MasterLandOwnershipTypeEntity entity);
        bool UpdateMasterLandOwnershipType(MasterLandOwnershipTypeEntity entity);
        bool SoftDeleteMasterLandOwnershipType(int OwnerShipTypeid);
        #endregion

        #region
        List<MasterMonthEntity> GetMasterMonths();
        bool InsertMasterMonth(MasterMonthEntity entity);
        bool UpdateMasterMonth(MasterMonthEntity entity);
        bool SoftDeleteMasterMonth(int MonthId);
        #endregion

        #region SecurityQuestion
        List<MasterSecurityQuestionEntity> GetMasterSecurityQuestions();
        bool InsertMasterSecurityQuestion(MasterSecurityQuestionEntity entity);
        bool UpdateMasterSecurityQuestion(MasterSecurityQuestionEntity entity);
        bool SoftDeleteMasterSecurityQuestion(int SecurityQuestionID);
        #endregion

        #region SkillTrade
        List<MasterSkillTradeEntity> GetMasterSkillTrades();
        bool InsertMasterSkillTrade(MasterSkillTradeEntity entity);
        bool UpdateMasterSkillTrade(MasterSkillTradeEntity entity);
        bool SoftDeleteMasterSkillTrade(int ID);
        #endregion

        #region
        List<MasterQualificationEntity> GetMasterQualifications();
        bool InsertMasterQualification(MasterQualificationEntity entity);
        bool UpdateMasterQualification(MasterQualificationEntity entity);
        bool SoftDeleteMasterQualification(int QualificationID);
        #endregion

        #region

        List<MasterRestrictedKeywordEntity> GetMasterRestrictedKeywords();
        bool InsertMasterRestrictedKeyword(MasterRestrictedKeywordEntity entity);
        bool UpdateMasterRestrictedKeyword(MasterRestrictedKeywordEntity entity);
        bool SoftDeleteMasterRestrictedKeyword(int KeyWordID);

        #endregion

        #region Master_Shift
        List<MasterShiftEntity> GetMasterShifts();
        bool InsertMasterShift(MasterShiftEntity entity);
        bool UpdateMasterShift(MasterShiftEntity entity);
        bool SoftDeleteMasterShift(int ShiftID);
        #endregion

        #region VCApplication
        List<MasterVCApplicationEntity> GetMasterVCApplications();

        int InsertMasterVCApplication(MasterVCApplicationEntity entity);
        bool UpdateMasterVCApplication(MasterVCApplicationEntity entity);
        bool DeleteMasterVCApplication(int ID);
        #endregion

        #region
        List<MasterTypeofInstituteEntity> GetMasterTypeofInstitutes();
        bool InsertMasterTypeofInstitute(MasterTypeofInstituteEntity entity);
        bool UpdateMasterTypeofInstitute(MasterTypeofInstituteEntity entity);
        bool SoftDeleteMasterTypeofInstitute(int ID);
        #endregion

        #region
        List<MasterTrainingRemarkforUtilizationEntity> GetMasterTrainingRemarkforUtilization();
        int GetNextTrainingRemarkforUtilizationID();
        bool InsertMasterTrainingRemarkforUtilization(MasterTrainingRemarkforUtilizationEntity entity);
        bool UpdateMasterTrainingRemarkforUtilization(MasterTrainingRemarkforUtilizationEntity entity);
        bool SoftDeleteMasterTrainingRemarkforUtilization(int ID);
        #endregion

        #region TrainingEquipment

        List<MasterTrainingEquipmentEntity> GetMasterTrainingEquipment();
        bool InsertMasterTrainingEquipment(MasterTrainingEquipmentEntity entity);
        bool UpdateMasterTrainingEquipment(MasterTrainingEquipmentEntity entity);
        bool SoftDeleteMasterTrainingEquipment(int ID);

        #endregion

        #region TrainingFeeCategory

        List<MasterTrainingFeeCategoryEntity> GetMasterTrainingFeeCategories();
        int InsertMasterTrainingFeeCategory(MasterTrainingFeeCategoryEntity entity);
        bool UpdateMasterTrainingFeeCategory(MasterTrainingFeeCategoryEntity entity);
        bool SoftDeleteMasterTrainingFeeCategory(int ID);

        #endregion

        #region TrainingCategory
        List<MasterTrainingCategoryEntity> GetMasterTrainingCategories();
        bool InsertMasterTrainingCategory(MasterTrainingCategoryEntity entity);
        bool UpdateMasterTrainingCategory(MasterTrainingCategoryEntity entity);
        bool SoftDeleteMasterTrainingCategory(int ID);
        #endregion

        #region TrainingNameOfItem
        List<MasterTrainingNameOfItemEntity> GetMasterTrainingNameOfItems();
        int InsertMasterTrainingNameOfItem(MasterTrainingNameOfItemEntity entity);
        bool UpdateMasterTrainingNameOfItem(MasterTrainingNameOfItemEntity entity);
        bool SoftDeleteMasterTrainingNameOfItem(int ID);
        #endregion

        #region EquipmentCategory
        List<MasterEquipmentCategoryEntity> GetMasterEquipmentCategories();
        bool InsertMasterEquipmentCategory(MasterEquipmentCategoryEntity entity);
        bool UpdateMasterEquipmentCategory(MasterEquipmentCategoryEntity entity);
        bool SoftDeleteMasterEquipmentCategory(int EquipmentCategoryId);
        #endregion

        #region SectorialExpertise
        List<MasterSectorialExpertiseEntity> GetMasterSectorialExpertise();
        bool InsertMasterSectorialExpertise(MasterSectorialExpertiseEntity entity);
        bool UpdateMasterSectorialExpertise(MasterSectorialExpertiseEntity entity);
        bool SoftDeleteMasterSectorialExpertise(int SectorialExpertiseID);
        #endregion

        #region SubjectTypeExam

        List<SubjectTypeExamEntity> GetMasterSubjectTypeExam();
        bool InsertMasterSubjectTypeExam(SubjectTypeExamEntity entity);
        bool UpdateMasterSubjectTypeExam(SubjectTypeExamEntity entity);
        bool SoftDeleteMasterSubjectTypeExam(int SubjectTypeExamID);

        #endregion

        #region PromoterStatus

        List<MasterPromoterStatusEntity> GetMasterPromoterStatuses();
        bool InsertMasterPromoterStatus(MasterPromoterStatusEntity entity);
        bool UpdateMasterPromoterStatus(MasterPromoterStatusEntity entity);
        bool SoftDeleteMasterPromoterStatus(int PromoterStatusID);

        #endregion

        #region PromoterType
        List<MasterPromoterTypeEntity> GetMasterPromoterTypes();
        bool InsertMasterPromoterType(MasterPromoterTypeEntity entity);
        bool UpdateMasterPromoterType(MasterPromoterTypeEntity entity);
        bool SoftDeleteMasterPromoterType(int PromoterTypeID);
        #endregion

        #region PromotingType
        List<MasterPromotingTypeEntity> GetMasterPromotingTypes();
        bool InsertMasterPromotingType(MasterPromotingTypeEntity entity);
        bool UpdateMasterPromotingType(MasterPromotingTypeEntity entity);
        bool SoftDeleteMasterPromotingType(int PromotingTypeID);
        #endregion

        #region NotificationCategory Methods
        List<MasterNotificationCategoryEntity> GetMasterNotificationCategories();
        bool InsertMasterNotificationCategory(MasterNotificationCategoryEntity entity);
        bool UpdateMasterNotificationCategory(MasterNotificationCategoryEntity entity);
        bool SoftDeleteMasterNotificationCategory(int NotificationCategoryID);
        #endregion

        #region MasterOtherInfra
        List<MasterOtherInfraEntity> GetMasterOtherInfra();
        bool InsertMasterOtherInfra(MasterOtherInfraEntity entity);
        bool UpdateMasterOtherInfra(MasterOtherInfraEntity entity);
        bool SoftDeleteMasterOtherInfra(int OtherInfraId);
        #endregion

        #region OtherInfra
        List<MasterOtherInfraOptionEntity> GetMasterOtherInfraOptions();
        bool InsertMasterOtherInfraOptions(MasterOtherInfraOptionEntity entity);
        bool UpdateMasterOtherInfraOptions(MasterOtherInfraOptionEntity entity);
        bool SoftDeleteMasterOtherInfraOptions(int OtherInfraId);
        #endregion

        #region UserType

        List<MasterUserTypeEntity> GetMasterUserTypes();
        bool InsertMasterUserType(MasterUserTypeEntity entity);
        bool UpdateMasterUserType(MasterUserTypeEntity entity);
        bool SoftDeleteMasterUserType(int UserTypeID);

        #endregion

        #region INSQFLevel

        List<MasterNSQFLevelEntity> GetMasterNSQFLevels();
        int InsertMasterNSQFLevel(MasterNSQFLevelEntity entity);
        bool UpdateMasterNSQFLevel(MasterNSQFLevelEntity entity);
        bool SoftDeleteMasterNSQFLevel(int ID);

        #endregion

        #region ProjectConfiguration Interface Members

        List<MasterProjectConfigurationEntity> GetMasterProjectConfigurations();
        bool InsertMasterProjectConfiguration(MasterProjectConfigurationEntity entity);
        bool UpdateMasterProjectConfiguration(MasterProjectConfigurationEntity entity);
        bool SoftDeleteMasterProjectConfiguration(int SeqNo);

        #endregion

        #region ITISpecificationCategory
        List<MasterITISpecificationCategoryEntity> GetMasterITISpecificationCategories();
        bool InsertMasterITISpecificationCategory(MasterITISpecificationCategoryEntity entity);
        bool UpdateMasterITISpecificationCategory(MasterITISpecificationCategoryEntity entity);
        bool SoftDeleteMasterITISpecificationCategory(int ID);
        #endregion

        #region ITISpecificationGroup
        List<MasterITISpecificationGroupEntity> GetMasterITISpecificationGroups();
        bool InsertMasterITISpecificationGroup(MasterITISpecificationGroupEntity entity);
        bool UpdateMasterITISpecificationGroup(MasterITISpecificationGroupEntity entity);
        bool SoftDeleteMasterITISpecificationGroup(int ID);
        #endregion

        #region ITISpecificationItem Methods

        List<MasterITISpecificationItemEntity> GetMasterITISpecificationItems();
        bool InsertMasterITISpecificationItem(MasterITISpecificationItemEntity entity);
        bool UpdateMasterITISpecificationItem(MasterITISpecificationItemEntity entity);
        bool SoftDeleteMasterITISpecificationItem(int ID);

        #endregion

        #region
        List<MasterITISpecificationNameofItemAsperDGTEntity> GetMasterITISpecificationNameofItemAsperDGT();
        bool InsertMasterITISpecificationNameofItemAsperDGT(MasterITISpecificationNameofItemAsperDGTEntity entity);
        bool UpdateMasterITISpecificationNameofItemAsperDGT(MasterITISpecificationNameofItemAsperDGTEntity entity);
        bool SoftDeleteMasterITISpecificationNameofItemAsperDGT(int ID);
        #endregion

        #region MasterSubject

        List<MasterSubjectEntity> GetMasterSubjects();
        bool InsertMasterSubject(MasterSubjectEntity entity);
        bool UpdateMasterSubject(MasterSubjectEntity entity);
        bool SoftDeleteMasterSubject(int SubjectId);

        #endregion

        #region ItemAsperDVET Interface

        List<MasterItemAsperDVETEntity> GetMasterItemAsperDVETs();
        bool InsertMasterItemAsperDVET(MasterItemAsperDVETEntity entity);
        bool UpdateMasterItemAsperDVET(MasterItemAsperDVETEntity entity);
        bool SoftDeleteMasterItemAsperDVET(int ID);

        #endregion

        #region
        List<MasterITISpecificationSectorEntity> GetMasterITISpecificationSectors();
        bool InsertMasterITISpecificationSector(MasterITISpecificationSectorEntity entity);
        bool UpdateMasterITISpecificationSector(MasterITISpecificationSectorEntity entity);
        bool SoftDeleteMasterITISpecificationSector(int ID);
        #endregion

        #region
        List<MasterITISpecificationTradeEntity> GetMasterITISpecificationTrades();
        bool InsertMasterITISpecificationTrade(MasterITISpecificationTradeEntity entity);
        bool UpdateMasterITISpecificationTrade(MasterITISpecificationTradeEntity entity);
        bool SoftDeleteMasterITISpecificationTrade(int ID);
        #endregion

        #region ITISpecificationUsage
        List<MasterITISpecificationUsageEntity> GetMasterITISpecificationUsages();
        bool InsertMasterITISpecificationUsage(MasterITISpecificationUsageEntity entity);
        bool UpdateMasterITISpecificationUsage(MasterITISpecificationUsageEntity entity);
        bool SoftDeleteMasterITISpecificationUsage(int ID);
        #endregion

        #region ITISpecificationSpecificationAsperDGT

        List<MasterITISpecificationSpecificationAsperDGTEntity> GetMasterITISpecificationSpecificationAsperDGTs();
        bool InsertMasterITISpecificationSpecificationAsperDGT(MasterITISpecificationSpecificationAsperDGTEntity entity);
        bool UpdateMasterITISpecificationSpecificationAsperDGT(MasterITISpecificationSpecificationAsperDGTEntity entity);
        bool SoftDeleteMasterITISpecificationSpecificationAsperDGT(int ID);

        #endregion

        #region ITISpecificationSectorWise

        List<MasterITISpecificationSectorWiseEntity> GetMasterITISpecificationSectorWise();
        bool InsertMasterITISpecificationSectorWise(MasterITISpecificationSectorWiseEntity entity);
        bool UpdateMasterITISpecificationSectorWise(MasterITISpecificationSectorWiseEntity entity);
        bool SoftDeleteMasterITISpecificationSectorWise(int ID);

        #endregion

        #region
        List<MasterIgnoreWordEntity> GetMasterIgnoreWordsList();
        bool InsertMasterIgnoreWord(MasterIgnoreWordEntity entity);
        bool UpdateMasterIgnoreWord(MasterIgnoreWordEntity entity);
        bool SoftDeleteMasterIgnoreWord(int ID);

        #endregion

        #region
        List<MasterFinancialYearEntity> GetMasterFinancialYears();
        bool InsertMasterFinancialYear(MasterFinancialYearEntity entity);
        bool UpdateMasterFinancialYear(MasterFinancialYearEntity entity);
        bool SoftDeleteMasterFinancialYear(int FinancialYearID);
        bool SetCurrentFinancialYear(int FinancialYearID);
        #endregion

        #region User

        List<MasterUserEntity> GetMasterUsers();
        bool InsertMasterUser(MasterUserEntity entity);
        bool UpdateMasterUser(MasterUserEntity entity);
        bool SoftDeleteMasterUser(int UserID);

        #endregion

        #region BatchType Interface Methods

        List<MasterBatchTypeEntity> GetMasterBatchTypes();
        bool InsertMasterBatchType(MasterBatchTypeEntity entity);
        bool UpdateMasterBatchType(MasterBatchTypeEntity entity);
        bool SoftDeleteMasterBatchType(int ID);

        #endregion

        #region
        List<MasterBatchStatusEntity> GetMasterBatchStatuses();
        bool InsertMasterBatchStatus(MasterBatchStatusEntity entity);
        bool UpdateMasterBatchStatus(MasterBatchStatusEntity entity);
        bool SoftDeleteMasterBatchStatus(int BatchStatusID);
        #endregion

        #region ExamType

        List<MasterExamTypeEntity> GetMasterExamTypes();
        bool InsertMasterExamType(MasterExamTypeEntity entity);
        bool UpdateMasterExamType(MasterExamTypeEntity entity);
        bool SoftDeleteMasterExamType(int ExamTypeID);

        #endregion

        #region Religion

        List<MasterReligionEntity> GetMasterReligions();
        bool InsertMasterReligion(MasterReligionEntity entity);
        bool UpdateMasterReligion(MasterReligionEntity entity);
        bool SoftDeleteMasterReligion(int ReligionID);

        #endregion

        #region SuccessStories

        List<MasterSuccessStoriesEntity> GetMasterSuccessStories();
        int InsertMasterSuccessStory(MasterSuccessStoriesEntity entity);   // returns new ID (SCOPE_IDENTITY), 0 on failure
        bool UpdateMasterSuccessStory(MasterSuccessStoriesEntity entity);
        bool SoftDeleteMasterSuccessStory(int ID);

        #endregion

        #region ITISpecificationItemV2

        List<MasterITISpecificationItemV2Entity> GetMasterITISpecificationItemsV2();
        bool InsertMasterITISpecificationItemV2(MasterITISpecificationItemV2Entity entity);
        bool UpdateMasterITISpecificationItemV2(MasterITISpecificationItemV2Entity entity);
        bool SoftDeleteMasterITISpecificationItemV2(int ID);

        #endregion

        #region InstituteCategory

            List<MasterInstituteCategoryEntity> GetMasterInstituteCategories();
            bool InsertMasterInstituteCategory(MasterInstituteCategoryEntity entity);
            bool UpdateMasterInstituteCategory(MasterInstituteCategoryEntity entity);
            bool SoftDeleteMasterInstituteCategory(int CategoryID);

        #endregion

        #region InstituteOwnership

        List<MasterInstituteOwnershipEntity> GetMasterInstituteOwnerships();
        int GetNextSeqNoInstituteOwnership();
        bool InsertMasterInstituteOwnership(MasterInstituteOwnershipEntity entity);
        bool UpdateMasterInstituteOwnership(MasterInstituteOwnershipEntity entity);
        bool SoftDeleteMasterInstituteOwnership(int OwnershipID);

        #endregion

        #region InfraCategory

        List<MasterInfraCategoryEntity> GetMasterInfraCategories();
        bool InsertMasterInfraCategory(MasterInfraCategoryEntity entity);
        bool UpdateMasterInfraCategory(MasterInfraCategoryEntity entity);
        bool SoftDeleteMasterInfraCategory(int InfraCategoryID);

        #endregion

        #region InfraItem

        List<MasterInfraItemEntity> GetMasterInfraItems();
        bool InsertMasterInfraItem(MasterInfraItemEntity entity);
        bool UpdateMasterInfraItem(MasterInfraItemEntity entity);
        bool SoftDeleteMasterInfraItem(int InfraItemID);

        #endregion

        #region TrainingEquipmentList

        List<MasterTrainingEquipmentListEntity> GetMasterTrainingEquipmentList();
        bool InsertMasterTrainingEquipmentList(MasterTrainingEquipmentListEntity entity);
        bool UpdateMasterTrainingEquipmentList(MasterTrainingEquipmentListEntity entity);
        bool SoftDeleteMasterTrainingEquipmentList(int EquipmentId);

        #endregion

        #region OBWCCourse

        List<MasterOBWCCourseEntity> GetMasterOBWCCourses();
        bool InsertMasterOBWCCourse(MasterOBWCCourseEntity entity);
        bool UpdateMasterOBWCCourse(MasterOBWCCourseEntity entity);
        bool SoftDeleteMasterOBWCCourse(int Id);

        #endregion

        #region OBWCInstitute

        List<MasterOBWCInstituteEntity> GetAllOBWCInstitutes();
        bool InsertOBWCInstitute(MasterOBWCInstituteEntity entity);
        bool UpdateOBWCInstitute(MasterOBWCInstituteEntity entity);
        bool SoftDeleteOBWCInstitute(int Id);

        #endregion


    }
}
