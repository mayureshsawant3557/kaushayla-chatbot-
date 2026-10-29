using Portal.Entities;
using Portal.Entities.Base;
using Portal.Entities.ElectionDuty;
using Portal.Entities.Institute;
using Portal.Entities.ITISpecification;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Business.Interface.Institute
{
    public interface IInstituteBase
    {
        List<InstituteListEntity> SearchInstitute(InstituteSearchCriteriaEntity entity);
        List<InstituteListEntity> SearchInstitutePublic(InstituteSearchCriteriaEntity entity);
        List<CourseInfoEntity> SearchCourseDetails(InstituteSearchCriteriaEntity entity);

        InstituteInfoEntity GetInstituteDetails(long InstituteID, long CourseID);

        CourseInfoEntity GetCourseDetails(long CourseID);
        string SaveProposedInstituteDetails(ProposedInstituteInfoEntity entity);

        string SaveCollegeDetails(InstituteInfoEntity entity);
        string SaveCourseDetails(CourseInfoEntity entity);
        DataTable GetAgricultureOpenGroudCourse(long InstituteID);

        DataTable GetSuccessStoryResult(Int64 CandidateID, Int64 InstituteID);
        string SaveSuccessStory(SucessStoryEntity entity);
        string DeleteSuccessStoryByID(Int64 ID, string UserLoginID, string @IPAddress);
        SucessStoryEntity GetSuccessStoryByID(Int64 ID);
        List<SucessStoryEntity> GetSuccessStoryByInstituteID(Int64 InstituteID);
        List<SucessStoryEntity> GetPublishedSuccessStory();
        List<SucessStoryEntity> GetAllSuccessStory();
        List<SucessStoryEntity> SearchSuccessStory(Int32 DistrictID, Int32 SectorID, Int64 InstituteID, Int64 CoureseID, Int16 PublishStatus);


        //DataTable GetDPDCDetailsByCollegeRegNo(string CollegeRegistrationNo);
        DataTable GetDPDCDetailsByCollegeRegNo(string CollegeRegistrationNo);
        string SaveDPDCFundData(DPDCFundEntity entity);
        List<InstituteManagementDetailsEntity> GetInstituteManagementDetails(long instituteID);
        string SaveInstituteManagementDetails(InstituteManagementDetailsEntity entity);
        string DeleteInstituteManagementDetails(InstituteManagementDetailsEntity entity);
        DataTable GetInstituteProfileStatus(Int64 InstituteID);

        // Builiding
        List<BuildingDetailsEntity> GetBuildingDetails(Int64 InstituteID, Int64 BuildingId = 0);
        string SaveBuildingDetails(BuildingDetailsEntity entity);
        string DeleteBuildingDetails(Int64 InstituteID, Int64 BuildingId, string UserLoginID, string IPAddress);

         List<BuildingSpaceNormsEntity> GetBuildingSpaceasperNorms(long instituteID);
         List<BuildingSpaceAnalysisEntity> GetBuildingSpaceasperNormsAnalysis(long instituteID);

        //Land 
        List<LandDetailsEntity> GetLandDetails(Int64 InstituteID, Int64 LandId = 0);
        string SaveLandDetails(LandDetailsEntity entity);
        string DeleteLandDetails(Int64 InstituteID, Int64 LandId, string UserLoginID, string IPAddress);
        List<RequiredLandDetailsEntity> GetRequiredLandDetails(Int64 InstituteID, string userLoginId);

        // LOI
        string SaveLOIStatus(SaveLOIStatus entity);
        bool IsLOIGenerated(InstituteInputEntity entity);
        DataTable GetBuildingCourse(Int64 InstituteID);

        DataTable GetSelfDeclarationPath(InstituteInputEntity entity);
        InstituteStatusEntity GetProposedInstituteStatus(Int64 InstituteID);


        // Proposed Course details 
        List<ProposedCourseUnitDetailsEntity> GetProposedCourseUnitRequirementDetails(Int64 InstituteID, Int64 CourseId, string UserLoginID);
        DataSet GetCourseUnitDetailsForApprovalByCoureseID(InstituteInputEntity entity);
        DataSet GetProposedCourseUnitDetails(InstituteInputEntity en);
        string SaveProposedCourseUnitDetails(ProposedCourseUnitDetailsEntity entity);
        string DeleteProposedCourseUnitDetails(ProposedCourseUnitDetailsEntity entity);

        //inspection unit details
        List<InspectionUnitDetailsEntity> GetInspectionUnitDetails(long InstituteId, int? ApprovalIDFlag);

        DataTable UpdateProposedCourseUnitDetailsForInspectionUnits(
        long instituteId,
        string proposedCourseXml,
        string createdBy,
        string ipAddress);


        // Workshop

        List<WorkshopEntity> GetWorkshopDetails(InstituteInputEntity entity);
        string SaveWorkshopDetails(WorkshopEntity entity);
        string SaveWorkshopPhotoPath(WorkshopEntity entity);
        string DeleteWorkshopPhotoPath(WorkshopEntity entity);
        WorkshopSpaceRemarkEntity GetWorkshopSpaceRemark(long instituteId);


        // Common Facility

        CommonFacilityEntity GetMasterSubFacilityGroup(Int64 InstituteID);
        DataSet GetCommonFacilityCourseDetails(Int64 InstituteID);
        string SaveFacilityDetails(CommonSubFacilityEntity entity);

        string SaveCommonPhotoPath(WorkshopEntity entity);
        string DeleteCommonPhotoPath(WorkshopEntity entity);

        // new common facility
        List<SubFacilityEntity> GetSubFacilityDetails(SubFacilityInputEntity entity);
        string SaveSubFacilityDetail(SubFacilitySaveEntity entity);
        string SaveSubFacilityDetails(SubFacilityBulkSaveEntity entity);
        string DeleteSubFacilityDetail(SubFacilityDeleteEntity entity);

        // other infra 
        OtherInfraEntity GetOtherInfraDetails(Int64 InstituteID);
        string SaveOtherInfraPhotoPath(OtherInfraEntity entity);
        string SaveOtherInfraDetails(OtherInfraEntity entity);

        // Bank List
        List<InstituteBankEntity> GetInstituteBank(Int64 InstituteID);
        string SaveInstituteBank(InstituteBankEntity entity);

        string DeleteInstituteBank(InstituteBankEntity entity);
        //  Power Details 

        PowerInfoEntity GetPowerDetails(InstituteInputEntity entity);
        string SavePowerDetails(PowerInfoSaveRequest entity);

        // Training Equipment
        // List<TrainingEquipmentStatusEntity> GetTrainingEquipmentDetails(InstituteInputEntity inputEntity);
        TrainingEquipmentStatusResponse GetTrainingEquipmentDetails(InstituteInputEntity inputEntity);
        TraningEquiplemntEntity GetTrainingEquipmentListDetails(InstituteInputEntity inputEntity);
        string UpdateTrainingEquipmentAvailability(List<TrainingEquipmentListEntity> lstTrainingEquipmentList, List<TraningEquipmentPhotoEntity> lstPhoto, string PageCode);


        /// Inspection  fee 
        List<InspectionFeeEntity> GetInspectionFeeList(InstituteInputEntity inputEntity);

        // Inspection Request

        DataSet GetInstituteInspectionAgencyList(InstituteInputEntity entity);
        DataSet GetInstituteInspectionDateRange(InstituteInputEntity entity);
       
        //string SaveInstituteInspectionDateRange(InstituteInputEntity entity, string startDate, string endDate, string submissionDate,string DelayRemark, string InspectionScheduledDateByDVETO, string ActualInspectionDateByDVETO, string DelayRemarkForActual);
        string SaveInstituteInspectionDateRange(SaveInspectionDateRangeRequest entity);
        string SaveSelfDeclarationPath(SaveSelfDeclarationRequest entity);


        InspectionEligibilityEntity CheckInspectionEligibility(InstituteInput entity);
        InspectionOperationResult RequestInspection(InspectionRequestEntity entity);
        InspectionOperationResult WithdrawInspection(InspectionRequestEntity entity);
        InspectionOperationResult SubmitInspectionRequest(InspectionRequestEntity entity);
        InspectionOperationResult WithdrawInspectionRequest(InspectionRequestEntity entity);

        // requirement funding summary
        RequirementInstitutionFundingResponse GetRequirementInstitutionFundingDetails(
        string financialYear,
        int? stateID,
        int? districtID,
        int? talukaID,
        string Status,
        int? RegionID
    );
        DataTable GetInstitute_PromoterTypeByInstituteID(long instituteId, int managementType);
        // dashboard for LOI approved institutes
        DataSet GetInstituteDashboard(long? instituteId, string instituteCode);

        // temp dashboard 
        DataSet GetTempInstituteDashboard(long tempInstituteId);
        //LOI generated checks 

        //Search SDI Inspection


        DataTable SearchSDIInspection(Int32 DistrictID, Int32 TalukaID, Int32 RegionID, string FormStatus, Int64 InstituteID, Int64 userID);

        DataTable SearchInstituteSDIInspection(int DistrictID, int TalukaID, int RegionID, string FormStatus, long InstituteID, long userID);
        DataTable DVETOSubmittedInstituteSDIInspection(int DistrictID, int TalukaID, int RegionID, string FormStatus, long InstituteID, long userID);
        DataTable SecretaryInstituteSDIInspection(int DistrictID, int TalukaID, int RegionID, string FormStatus, long InstituteID, long userID, int ResultTypeID);

        DataTable SecretaryInstituteSDIAffiliatio(int DistrictID, int TalukaID, int RegionID, string FormStatus, long InstituteID, long userID, int ResultTypeID);
        DataSet GetShortTermApprovedCourseUnitDetails(InstituteInputEntity entity);

        DataTable GetShortTermApprovedCourseFees(InstituteInputEntity entity);
        // STT
        DataSet GetSTTCourseUnitDetailsForApprovalByCoureseID(InstituteInputEntity entity);
        string SaveShortTermProposedCourseUnitDetails(ProposedCourseUnitDetailsEntity entity);

        string DeleteShortTermProposedCourseUnitDetails(ProposedCourseUnitDetailsEntity entity);
        DataSet GetShortTermProposedCourseUnitDetails(InstituteInputEntity entity);

        string SaveCourseTrainingFee(string actionType, int? id, string trainingFeeID,
                                 decimal? withPlacement, decimal? withoutPlacement,
                                 string userName, string userIpAddress);

        // Inspection  page 
        DataTable GetInstituteInspectionDash(long instituteId, string pageCode, int UserTypeID);

        string UpdateInstituteInspectionVerificationStatus(InspectionVerificationEntity entity);

        // secretary LOI

        DataTable SearchInstitutes(Int32 DistrictID, Int32 TalukaID, Int32 RegionID, string FormStatus, Int64 InstituteID);
        DataTable SearchSDILOI(Int32 DistrictID, Int32 TalukaID, Int32 RegionID, string FormStatus, Int64 InstituteID);

        DataTable GetProposedCourseofGroupCourseApprovalGroupWise(Int32 ApprovalGroupID);




        DataSet GetInstituteDash(Int64 InstituteID, string InstituteCode);
        string UpdateInstituteVerificationStatus(Int64 InstituteID, string Remark, string Status, string Pagecode, string CreatedBy, string IpAddress);
        string UpdateProposedCourseUnitDetails(Int64 InstituteID,  string ProposedCourseXml, string CreatedBy, string IpAddress);
        DataSet GetUnitByInstitute(Int64 InstituteID);
        DataTable GetBatchDetailsByInstitute(Int64 InstituteID);
        DataSet GETBatchDetails(Int64 InstituteID, Int64 CourseID, int ShiftID, int UnitNo);
        string UpdateBatchDetails(BatchDetailsEntity entity);
        bool IsCourseEligibleForApplication(Int64 CourseID);




        // Election Duty  RO
        List<ElectionDutyListEntity> GetElectionDutyList(int UserID);
        List<ElectionDutyListEntity> Report_GetElectionDutyList(

             int RegionID,
            int DistrictID,
           int TalukaID,
            int StaffID);



            
        List<ConstituencyEntity> GetConstituencyByDistrict(int districtID);
        string SaveElectionDutyStaff(ElectionDutyStaffEntity entity);
        string UpdateElectionDutyDeputation(ElectionDutyDeputationEntity entity);
        string DeleteElectionDutyStaff(DeleteElectionDutyStaffEntity entity);
        string DeleteElectionDutyDeputation(DeleteElectionDutyDeputationEntity entity);


        //SECURITY FEE 
        DataTable Institute_GetCourseInspectionFeeDetails(int  InstituteID,int CourseID ,int ApprovalID);
        DataTable Institute_GetCourseSecurityFeeDetails(int  InstituteID);

        // verification eligibility for inspetion
        VerificationEligibilityEntity CheckVerificationEligibility(InstituteInput entity);

        InspectionOperationResult RequestVerification(InspectionRequestEntity entity);

        InspectionOperationResult WithdrawVerification(InspectionRequestEntity entity);

        string SDI_GenerateInstituteCode(Int64 InstituteID, string MSBVCollegeID, string IpAddress);

        DataTable SDI_GetInstituteCodeDetails(int InstituteID);

        DataTable SecretaryDVETOInstituteStatus(int DistrictID, int TalukaID, int RegionID, string FormStatus, long InstituteID, int ResultTypeID, long userID = -1);


        
        List<ApprovalOrderSummaryEntity> GetApprovalOrdersByYear(int Year);
        List<CourseApprovalOrderDetailEntity> SaveCourseApprovalOrder(SaveCourseApprovalOrderEntity entity);
        List<CourseDetailsWithApprovalOrderEntity> GetCourseDetailsWithApprovalOrder(long CollegeID, string IpAddress);


        // green requirement for institute
        string SaveGreenFieldRequirement(GreenFieldRequirementEntity entity);

        DataSet GetGreenFieldRequirement(InstituteInputEntityForGreen entity);

        // green requirement lock facility 
        string SaveStatusGreenRequirementAsync(StatusGreenRequirementRequest request);
        string UnlockStatusGreenRequirementAsync(StatusGreenRequirementRequest request);

        DataTable GetStatusGreenRequirementAsync(InstituteInputEntityForGreen entity);

        //bulk 
        string SaveGreenFieldRequirementBulk(
    GreenFieldRequirementBulkEntity entity);

        // institute renewal fee details 
        DataTable GetCourseRenewalDetails(int CollegeID);





        DataTable GetNewBatchDetails( Int64 InstituteID,Int64 CourseID,int ShiftID,int UnitNo);
        string SaveBatchDetails(BatchDetailsEntity entity);

    }
}
