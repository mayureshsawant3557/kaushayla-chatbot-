using System;
using System.ComponentModel.DataAnnotations;

namespace Portal.Entities.Master
{

    public class MasterListEntity
    {
        public int ID { get; set; }
        public string MasterName { get; set; }
        public string MasterLink { get; set; }
        public bool IsActive { get; set; }
    }
    public class MasterStateEntity
    {
        public int StateID { get; set; }
        public string State { get; set; }
        public int CountryID { get; set; }
        public bool IsActive { get; set; }
    }

    public class DropdownEntity
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Code { get; set; }
        public bool IsActive { get; set; }
    }

    public class MasterDistrictEntity
    {
        public int DistrictID { get; set; }
        public string? District { get; set; }
        public string? DistrictMarathi { get; set; }
        public int StateID { get; set; }
        public int RegionID { get; set; }
        public bool IsActive { get; set; }
        public int? LoginID { get; set; }
    }

    public class MasterTalukaEntity
    {
        public int TalukaID { get; set; }
        public string Taluka { get; set; }
        public string? TalukaMarathi { get; set; }
        public int DistrictID { get; set; }
        public bool IsActive { get; set; }
    }
    public class MasterCityEntity
        {
            public int CityID { get; set; }
            public string? City { get; set; }
            public string? CityMarathi { get; set; }
            public int TalukaID { get; set; }
            public string? TalukaName { get; set; }
            public bool IsRural { get; set; }
            public bool IsActive { get; set; }
            public int TotalCount { get; set; }
            public string? CityTypeText { get; set; }  // NEW: Will contain "Rural" or "Urban"
        }
    public class MasterCityStatsEntity
    {
        public int TotalCount { get; set; }
        public int ActiveCount { get; set; }
        public int InactiveCount { get; set; }
        public int RuralCount { get; set; }
        public int UrbanCount { get; set; }
    }
    public class MasterRegionEntity
    {
        public int RegionID { get; set; }
        public string Region { get; set; }
        public string? RegionMarathi { get; set; }
        public int SeqNO { get; set; }
        public bool IsActive { get; set; }
    }
    public class MasterPincodeEntity
    {
        public int PincodeID { get; set; }
        public string Pincode { get; set; }
        public string PostOffice { get; set; }
        public int CityID { get; set; }
        public string? CityName { get; set; }
        public string? TalukaName { get; set; }
        public string? DistrictName { get; set; }
        public string? StateName { get; set; }
        public bool IsActive { get; set; }
        public int TotalCount { get; set; }
    }

    public class MasterPincodeStatsEntity
    {
        public int TotalCount { get; set; }
        public int ActiveCount { get; set; }
        public int InactiveCount { get; set; }
    }

    public class MasterCasteEntity
    {
        public int CasteID { get; set; }
        public string? Caste { get; set; }


        public int? CasteSrNo { get; set; }
        public int CategoryID { get; set; }
        public string? CategoryName { get; set; }
        public bool IsSBC { get; set; }
        public bool IsActive { get; set; }

    }

    public class MasterCategoryEntity
    {
        public int CategoryID { get; set; }
        public string Category { get; set; }
        public string CategoryCode { get; set; }
        public int? SeqNo { get; set; }
        public bool IsActive { get; set; }
    }

    public class MasterDisabilityEntity
    {
        public int DisabilityID { get; set; }
        public string Disability { get; set; }
        public bool IsActive { get; set; }
    }

    public class MasterAcademicYearEntity
    {
        public int YearId { get; set; }
        public string YearName { get; set; }
        public string YearDisplayName { get; set; }
        public bool isCurrent { get; set; }
        public bool isactive { get; set; }
        public bool IsForAdmission { get; set; }
    }
    public class MasterActivityStatusEntity
    {
        public int SeqNo { get; set; }
        public int RegionID { get; set; }
        public string ActivityName { get; set; }
        public string ActivityDetails { get; set; }
        public DateTime? ActivityStartDateTime { get; set; }
        public DateTime? ActivityEndDateTime { get; set; }
        public bool IsActive { get; set; }
        public DateTime? ModifiedDateTime { get; set; }
        public string? ModifiedBy { get; set; }              
        public string? ModifiedByIPAddress { get; set; }     
    }
    public class MasterAffiliationPageEntity
    {
        public int PageId { get; set; }
        public string PageName { get; set; }
        public string? PageUrl { get; set; }
        public bool IsActive { get; set; }
        public int? PageGrop { get; set; }
        public string? PageCode { get; set; }
        public string? BGColur { get; set; }
        public string? AnchorTagTarget { get; set; }
        public string? ReactPageUrl { get; set; }
    }
    public class MasterApplicationFormLinkEntity
    {
        public int LinkID { get; set; }
        public string LinkType { get; set; }
        public string LinkName { get; set; }
        public string? LinkDescription { get; set; }  
        public string? LinkURL { get; set; }             
        public string? PageCode { get; set; }            
        public bool IsActive { get; set; }
        public string? LinkURLReact { get; set; }       
    }

    public class Master_ApprovalGroupEntity
    {
        public int ID { get; set; }
        public string ApprovalGroupName { get; set; }
        public bool IsActive { get; set; }
    }

    public class MasterBatchEntity
    {
        public int ID { get; set; }
        public string BatchID { get; set; }
        public int? CollegeID { get; set; }
        public int? CourseID { get; set; }
        public int? ShiftID { get; set; }
        public int? UnitNo { get; set; }
        public long? UnitID { get; set; }
        public DateTime? BatchStartDate { get; set; }
        public DateTime? BatchEndDate { get; set; }
        public DateTime? AdmissionEndDate { get; set; }
        public int IsSystemCreated { get; set; }
        public int BatchStatus { get; set; }
        public int IsDeleted { get; set; }
        public int? AdmissionYearID { get; set; }
        public int? BatchTypeID { get; set; }
        public int? ExaminationID1 { get; set; }
        public int? ExaminationID2 { get; set; }
        public int? Intake { get; set; }
        //public int? SchoolID { get; set; }
    }

    public class MasterCountryEntity
    {
        public int CountryID { get; set; }
        public string Country { get; set; }
        public bool IsActive { get; set; }
    }

    public class MasterApprovalOrderEntity
    {
        public int ID { get; set; }
        public string ApprovalOrderNo { get; set; }
        public DateTime? ApprovalOrderDate { get; set; }
        public string ApprovalOrder { get; set; }   // URL
        public string ApprovalOrderRemakr { get; set; }
        public bool IsActive { get; set; }
    }

    public class MasterSubSectorEntity
    {
        public int SubSectorID { get; set; }
        public string SubSector { get; set; }
        public int SectorID { get; set; }
        public bool IsActive { get; set; }
    }

    public class MasterSubjectCourseEntity
    {
        public int SubjectCourseID { get; set; }
        public int CourseID { get; set; }
        public string CourseCode { get; set; }
        public string SubjectName { get; set; }
        public string SubjectCode { get; set; }
        public string SubjectType { get; set; }
        public bool IsActive { get; set; }
        public int? OldCourseID { get; set; }
        public string? OldSubjectCode { get; set; }
    }

    public class MasterLanguageEntity
    {
        public int LanguageID { get; set; }
        public string Language { get; set; }
        public bool IsActive { get; set; }
    }

    public class MasterDesignationEntity
    {
        public int DesignationId { get; set; }
        public string Designation { get; set; }
        public bool IsActive { get; set; }
    }

    public class MasterCourseTypeEntity
    {
        public int CourseTypeID { get; set; }
        public string CourseType { get; set; }
        public bool IsActive { get; set; }
    }

    public class MasterDocumentEntity
    {
        public int ID { get; set; }
        public string DocumentName { get; set; }
        public bool IsActive { get; set; }
        public bool IsDocumentCompulsory { get; set; }
    }

    public class MasterFacilityGroupEntity
    {
        public int FacilityGroupId { get; set; }
        public string FacilityGroup { get; set; }
        public bool IsActive { get; set; }
    }

    public class MasterBloodGroupEntity
    {
        public int BloodGroupId { get; set; }
        public string BloodGroup { get; set; }
        public bool IsActive { get; set; }
    }

    public class MasterGenderEntity
    {
        public string GenderCode { get; set; }
        public string Gender { get; set; }
        public bool IsActive { get; set; }
    }

    public class MasterBuildingFloorEntity
    {
        public int FloorId { get; set; }
        public string FloorName { get; set; }
        public bool IsActive { get; set; }
    }

    public class MasterBuildingNameTypeEntity
    {
        public int BuildingNameTypeId { get; set; }
        public string BuildingNameType { get; set; }
        public bool IsActive { get; set; }
    }

    public class MasterBuildingOwnershipTypeEntity
    {
        public int OwnerShipTypeid { get; set; }
        public string OwnerShipType { get; set; }
        public bool IsActive { get; set; }
    }

    public class MasterBuildingStatusEntity
    {
        public int BuildingStatusId { get; set; }
        public string BuildingStatus { get; set; }
        public bool IsActive { get; set; }
    }

    public class MasterBuildingUsageTypeEntity
    {
        public int UsageTypeId { get; set; }
        public string UsageType { get; set; }
        public bool IsActive { get; set; }
    }

    public class MasterConstituencyEntity
    {
        public int ConstituencyID { get; set; }

        public string? Constituency { get; set; }

        public string? ConstituencyMarathi { get; set; }

        public int DistrictID { get; set; }

        public string? StateName { get; set; }
        public string? DistrictName { get; set; }

        public bool IsActive { get; set; }
    }


    public class MasterConstructionTypeEntity
    {
        public int ConstructionTypeId { get; set; }
        public string ConstructionType { get; set; }
        public bool IsActive { get; set; }
    }

    public class MasterConstructionYearEntity
    {
        public int YearId { get; set; }
        public bool IsActive { get; set; }
    }

    public class MasterContactUsTypeEntity
    {
        public int ContactUsTypeID { get; set; }
        public string ContactUsType { get; set; }
        public bool IsActive { get; set; }
    }

    public class MasterCourseApproverEntity
    {
        public int CourseApproverID { get; set; }
        public string CourseApprover { get; set; }
        public bool IsActive { get; set; }
    }

    public class MasterSectorEntity
    {
        public int SectorID { get; set; }
        public string Sector { get; set; }
        public bool IsActive { get; set; }
    }
    public class MasterElectiveSubjectEntity
    {
        public int ID { get; set; }
        public string SubjectName { get; set; }
        public string SubjectType { get; set; }
        public int GroupID { get; set; }
        public int? CourseID { get; set; }
        public bool IsActive { get; set; }
        public string SubjectCode { get; set; }
    }

    public class MasterTitleEntity
    {
        public int TitleID { get; set; }
        public string Title { get; set; }
        public bool IsActive { get; set; }
    }
    public class MasterSignatureAuthorityEntity
    {
        public int ID { get; set; }
        public string SignatureType { get; set; }
        public string NameOfAuthority { get; set; }
        public string Designation { get; set; }
        public string SignaturePath { get; set; }
        public bool IsActive { get; set; }
        public bool IsCurrent { get; set; }
    }

    public class MasterFloorPreferenceEntity
    {
        public int FloorId { get; set; }
        public string FloorName { get; set; }
        public bool IsActive { get; set; }
    }

    public class MasterGrievanceCategoryEntity
    {
        public int GrievanceCategoryID { get; set; }
        public string GrievanceCategory { get; set; }
        public bool IsActive { get; set; }
    }

    public class MasterFAQCategoryEntity
    {
        public int FAQCategoryID { get; set; }
        public string FAQCategory { get; set; }
        public bool IsActive { get; set; }
    }

    public class MasterFacilitySubGroupEntity
    {
        public int SubFacilityGroupId { get; set; }
        public int FacilityGroupId { get; set; }
        public string SubFacilityGroup { get; set; }
        public int RequiredNumber { get; set; }
        public decimal RequiredSpace { get; set; }
        public bool HasMultiplyFactor { get; set; }
        public bool IsActive { get; set; }
    }

    public class MasterJobRoleEntity
    {
        public int ID { get; set; }
        public string JobRoleName { get; set; }
        public bool IsActive { get; set; }
    }

    public class MasterLocationCategoryEntity
    {
        public int LocationCategoryID { get; set; }
        public string LocationCategory { get; set; }
        public bool IsActive { get; set; }
    }

    public class MasterLandOwnershipTypeEntity
    {
        public int OwnerShipTypeid { get; set; }
        public string OwnerShipType { get; set; }
        public bool IsActive { get; set; }
    }

    public class MasterMonthEntity
    {
        public int MonthId { get; set; }
        public string MonthsName { get; set; }
        public bool IsActive { get; set; }
    }

    public class MasterSecurityQuestionEntity
    {
        public int SecurityQuestionID { get; set; }
        public string SecurityQuestion { get; set; }
        public bool IsActive { get; set; }
    }

    public class MasterSkillTradeEntity
    {
        public int ID { get; set; }
        public string TradeName { get; set; }
        public string? TradeCode { get; set; }
        public bool IsActive { get; set; }
    }

    public class MasterQualificationEntity
    {
        public int QualificationID { get; set; }
        public string Qualification { get; set; }
        public string QualificationGroup { get; set; }
        public int? SeqNO { get; set; }
        public bool IsActive { get; set; }
    }
    public class MasterRestrictedKeywordEntity
    {
        public int KeyWordID { get; set; }
        public string KeyWordName { get; set; }
        public bool IsActive { get; set; }
    }

    public class MasterShiftEntity
    {
        public int ShiftID { get; set; }
        public string Shift { get; set; }
        public bool IsActive { get; set; }
    }
    public class MasterVCApplicationEntity
    {
        public int? ID { get; set; }
        public string VCApplication { get; set; }
        public bool IsActive { get; set; }
    }
    public class MasterTypeofInstituteEntity
    {
        public int ID { get; set; }
        public string TypefInstitute { get; set; }
        public bool IsActive { get; set; }
        public int SeqNo { get; set; }
    }

    public class MasterTrainingRemarkforUtilizationEntity
    {
        public int ID { get; set; }
        public string RemarkforUtilization { get; set; }
        public bool IsActive { get; set; }
    }

    public class MasterTrainingFeeCategoryEntity
    {
        public int ID { get; set; }
        public string TrainingFeeCategory { get; set; }
        public bool IsActive { get; set; }
    }

    public class MasterTrainingEquipmentEntity
    {
        public int ID { get; set; }
        public string NameofItem { get; set; }
        public string? ItemCode { get; set; }
        public bool IsActive { get; set; }
    }

    public class MasterTrainingCategoryEntity
    {
        public int ID { get; set; }
        public string TrainingCategory { get; set; }
        public bool IsActive { get; set; }
    }

    public class MasterTrainingNameOfItemEntity
    {
        public int ID { get; set; }
        public string TrainingNameofItem { get; set; }
        public int TraningCategoryID { get; set; }
        public bool IsActive { get; set; }
    }
    public class MasterEquipmentCategoryEntity
    {
        public int EquipmentCategoryId { get; set; }
        public string EquipmentCategory { get; set; }
        public bool IsActive { get; set; }
    }

    public class MasterSectorialExpertiseEntity
    {
        public int SectorialExpertiseID { get; set; }
        public string SectorialExpertiseName { get; set; }
        public int? SeqNo { get; set; }
        public bool IsActive { get; set; }
    }

    public class SubjectTypeExamEntity
    {
        public int SubjectTypeExamID { get; set; }
        public string SubjectTypeExamName { get; set; }
        public bool IsActive { get; set; }
    }

    public class MasterPromoterStatusEntity
    {
        public int PromoterStatusID { get; set; }
        public string PromoterStatus { get; set; }
        public bool IsActive { get; set; }
    }

    public class MasterPromoterTypeEntity
    {
        public int PromoterTypeID { get; set; }
        public string PromoterType { get; set; }
        public string PromoterGroup { get; set; }
        public bool IsActive { get; set; }
    }

    public class MasterPromotingTypeEntity
    {
        public int PromotingTypeID { get; set; }
        public string PromotingType { get; set; }
        public string PromotingGroup { get; set; }
        public bool IsActive { get; set; }
    }

    public class MasterNotificationCategoryEntity
    {
        public int NotificationCategoryID { get; set; }
        public string NotificationCategory { get; set; }
        public bool IsActive { get; set; }
    }

    public class MasterOtherInfraEntity
    {
        public int OtherInfraId { get; set; }
        public string OtherInfra { get; set; }
        public bool IsActive { get; set; }
    }

    public class MasterOtherInfraOptionEntity
    {
        public int OtherInfraId { get; set; }
        public string OtherInfra { get; set; }
        public bool IsActive { get; set; }
    }

    public class MasterUserTypeEntity
    {
        public int UserTypeID { get; set; }
        public string UserType { get; set; }
        public string? UserTypeCode { get; set; }
        public string? UserInitial { get; set; }
        public string? DashboardURL { get; set; }
        public bool IsAdmin { get; set; }
        public bool IsMultipleLoginAllowed { get; set; }
        public bool IsActive { get; set; }
        public string? DashboardURLReact { get; set; }
    }

    public class MasterNSQFLevelEntity
    {
        public int ID { get; set; }
        public string NSQFLEVEL { get; set; }
        public bool IsActive { get; set; }
    }

    public class MasterProjectConfigurationEntity
    {
        public int SeqNo { get; set; }
        public int RegionID { get; set; }
        public string AppKey { get; set; }
        public string AppKeyDetails { get; set; }
        public string AppValue { get; set; }
        public string ControlRequired { get; set; }
        public int? ControlMaxValue { get; set; }
        public bool IsActive { get; set; }
        public DateTime? ModifiedDateTime { get; set; }
        public string? ModifiedBy { get; set; }
        public string? ModifiedByIPAddress { get; set; }
    }

    public class MasterITISpecificationCategoryEntity
    {
        public int ID { get; set; }
        public string CategoryName { get; set; }
        public bool IsActive { get; set; }
    }

    public class MasterITISpecificationGroupEntity
    {
        public int ID { get; set; }
        public string GroupName { get; set; }
        public bool IsActive { get; set; }
    }

    public class MasterITISpecificationItemEntity
    {
        public int ID { get; set; }
        public string NameofITem { get; set; }
        public string? ItemCode { get; set; }  
        public bool IsActive { get; set; }
    }

    public class MasterITISpecificationNameofItemAsperDGTEntity
    {
        public int ID { get; set; }
        public string ItemAsperDGT { get; set; }
        public bool IsActive { get; set; }
    }
   
    public class MasterSubjectEntity
    {
        public int SubjectId { get; set; }
        public string SubjectName { get; set; }
        public string SubjectCode { get; set; }
        public string SubjectType { get; set; }
        public int SubjectTypeID { get; set; }
        public bool IsActive { get; set; }
    }

    public class MasterItemAsperDVETEntity
    {
        public int ID { get; set; }
        public string ItemAsperDVET { get; set; }
        public bool IsActive { get; set; }
    }

    public class MasterITISpecificationSectorEntity
    {
        public int ID { get; set; }
        public string SectorName { get; set; }
        public string? SpecificationDocument { get; set; }   
        public bool IsActive { get; set; }
    }
    public class MasterITISpecificationTradeEntity
    {
        public int ID { get; set; }
        public string TradeName { get; set; }
        public string? TradeCode { get; set; }
        public string? SpecificationDocument { get; set; }
        public bool IsActive { get; set; }
    }

    public class MasterITISpecificationUsageEntity
    {
        public int ID { get; set; }
        public string Usage { get; set; }
        public bool IsActive { get; set; }
    }

    public class MasterITISpecificationSpecificationAsperDGTEntity
    {
        public int ID { get; set; }
        public string SpecificationDGT { get; set; }
        public bool IsActive { get; set; }
    }

    public class MasterITISpecificationSectorWiseEntity
    {
        public int ID { get; set; }
        public int ItemID { get; set; }
        public int GroupID { get; set; }
        public int SectorID { get; set; }
        public int CategoryID { get; set; }
        public decimal EstimatedPrice { get; set; }
        public bool IsActive { get; set; }
        public bool IsDocShow { get; set; }
    }

    public class MasterIgnoreWordEntity
    {
        public int ID { get; set; }
        public string WordsName { get; set; }
        public bool IsActive { get; set; }
        public string WordstoBeignored { get; set; }
    }

    public class MasterFinancialYearEntity
    {
        public int FinancialYearID { get; set; }
        public string FinancialYear { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public bool IsActive { get; set; }
        public bool IsCurrentFY { get; set; }
    }

    public class MasterUserEntity
    {
        public int UserID { get; set; }
        public int? UserTypeID { get; set; }
        public string UserLoginID { get; set; }
        public string? UserPassword { get; set; }
        public string UserName { get; set; }
        public string? UserMobileNo { get; set; }
        public string? UserEmailID { get; set; }
        public int? SecurityQuestionID { get; set; }
        public string? SecurityQuestionAnswer { get; set; }
        public string? LoggedInSessionID { get; set; }
        public DateTime? CurrentLoginDateTime { get; set; }
        public DateTime? LastLoginDateTime { get; set; }
        public bool IsNewRegistration { get; set; }
        public bool IsPasswordResetDone { get; set; }
        public bool IsActive { get; set; }
        public DateTime? ModifiedDateTime { get; set; }
        public string? ModifiedBy { get; set; }
        public string? ModifiedByIPAddress { get; set; }
        public bool IsAccountLock { get; set; }
        public int LoginAttempt { get; set; }
        public int? MsbsvetMtId { get; set; }
    }

    public class MasterBatchTypeEntity
    {
        public int ID { get; set; }
        public string BatchName { get; set; }
        public int AcademicYearID { get; set; }
        public bool IsActive { get; set; }
        public bool IsCurrent { get; set; }
        public bool? IsForAdmission { get; set; }
        public bool? IsForExamFee { get; set; }
        public bool? IsForExam { get; set; }
        public bool? IsForResult { get; set; }
    }

    public class MasterBatchStatusEntity
    {
        public int BatchStatusID { get; set; }
        public string BatchStatusName { get; set; }
        public bool IsActive { get; set; }
        public string BatchStatusDiscription { get; set; }
    }
    public class MasterExamTypeEntity
    {
        public int ExamTypeID { get; set; }
        public string ExamType { get; set; }
        public bool Isactive { get; set; }
    }
    public class MasterReligionEntity
    {
        public int ReligionID { get; set; }
        public string Religion { get; set; }
        public bool IsActive { get; set; }
    }
    public class MasterSuccessStoriesEntity
    {
        public int ID { get; set; }
        public string FirstName { get; set; }
        public string MiddleName { get; set; }
        public string LastName { get; set; }
        public string CandidateProfileID { get; set; }
        public string? PhotoPath { get; set; }
        public int? CourseID { get; set; }
        public int? InstituteID { get; set; }
        public int? PassingYearID { get; set; }
        public string? PresentDesignation { get; set; }
        public string? PresentOrganization { get; set; }
        public int? SelectionYearID { get; set; }
        public string? SelectionYear { get; set; }
        public bool IsPublished { get; set; }
        public bool IsProfile { get; set; }
        public string? DocumentPath { get; set; }
        public string? CandidateMobileNo { get; set; }
        public bool IsActive { get; set; }

        // Audit fields — set by the server, never required from the client
        public DateTime? CreatedDateTime { get; set; }
        public string? CreatedBy { get; set; }
        public string? CreatedByIPAddress { get; set; }
        public DateTime? ModifiedDateTime { get; set; }
        public string? ModifiedBy { get; set; }
        public string? ModifiedByIPAddress { get; set; }
    }

    public class MasterITISpecificationItemV2Entity
    {
        public int ID { get; set; }
        public string NameofITem { get; set; }
        public string ItemCode { get; set; }
        public bool IsActive { get; set; }
    }

    public class MasterInstituteCategoryEntity
    {
        public int CategoryID { get; set; }
        public string Category { get; set; }
        public string CategoryCode { get; set; }
        public int SeqNo { get; set; }
        public bool IsActive { get; set; }
    }

    public class MasterInstituteOwnershipEntity
    {
        public int OwnershipID { get; set; }
        public string OwnershipName { get; set; }
        public string OwnershipCode { get; set; }
        public int SeqNo { get; set; }
        public bool IsActive { get; set; }
    }

    public class MasterInfraCategoryEntity
    {
        public int InfraCategoryID { get; set; }
        public string InfraCategory { get; set; }
        public bool IsActive { get; set; }
    }

    public class MasterInfraItemEntity
    {
        public int InfraItemID { get; set; }
        public string InfraItem { get; set; }
        public int InfraCategoryID { get; set; }
        public bool IsActive { get; set; }
    }

    public class MasterTrainingEquipmentListEntity
    {
        public int EquipmentId { get; set; }
        public int CourseID { get; set; }
        public int ItemID { get; set; }
        public int EquipmentCategoryId { get; set; }
        public int UtilizationRemarksID { get; set; }
        public bool IsDsrItem { get; set; }
        public bool IsMouItem { get; set; }
        public bool IsMandatory { get; set; }
        public bool IsAlliedCourseItem { get; set; }
        public int RequiredPerUnit { get; set; }
        public bool IsActive { get; set; }
    }

    public class MasterOBWCCourseEntity
    {
        public int Id { get; set; }
        public string MBOCWPortalName { get; set; }
        public string CourseCode { get; set; }
        public string CourseName { get; set; }
        public string DurationinHours { get; set; }
        public string Sector { get; set; }
        public bool IsActive { get; set; }
    }

    public class MasterOBWCInstituteEntity
    {
        public int Id { get; set; }
        public string NameasperBOCWPortal { get; set; }
        public string InstituteCode { get; set; }
        public string TrainingPartner { get; set; }
        public string? Address { get; set; }             
        public string CityVillage { get; set; }
        public string? PinCode { get; set; }              
        public string? Taluka { get; set; }            
        public string District { get; set; }
        public string? Title { get; set; }             
        public string FirstName { get; set; }
        public string? MiddleName { get; set; }         
        public string LastName { get; set; }
        public string PrimaryMobileNumber { get; set; }
        public string? AlternativeMobileNumber { get; set; } 
        public string EMailID { get; set; }
        public bool IsActive { get; set; }
    }

}

  




