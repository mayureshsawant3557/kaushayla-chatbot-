using Microsoft.Exchange.WebServices.Data;
using Newtonsoft.Json;
using Portal.Entities;
using Portal.Entities.ElectionDuty;
using Portal.Entities.Institute;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Net.NetworkInformation;
using System.Text;
using System.Threading.Tasks;
//using System.Web.UI.WebControls;

namespace Portal.Data
{
    public partial class Repository
    {
        public DataSet SearchInstitute(InstituteSearchCriteriaEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@RegionID", entity.RegionID);
            param.Add("@DistrictID", entity.DistrictID);
            param.Add("@TalukaID", entity.TalukaID);
            param.Add("@SectorID", entity.SectorID);
            param.Add("@CourseTypeID", entity.CourseTypeID);
            param.Add("@CourseID", entity.CourseID);
            param.Add("@EntryQualificationID", entity.EntryQualificationID);
            param.Add("@ISForSTT", entity.ISForSTT);

            return _dbAccess.GetDataSet("Institute_SearchInstitute", param);
        }
        public DataSet SearchInstitutePublic(InstituteSearchCriteriaEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@RegionID", entity.RegionID);
            param.Add("@DistrictID", entity.DistrictID);
            param.Add("@TalukaID", entity.TalukaID);
            param.Add("@SectorID", entity.SectorID);
            param.Add("@CourseTypeID", entity.CourseTypeID);
            param.Add("@CourseID", entity.CourseID);
            param.Add("@EntryQualificationID", entity.EntryQualificationID);
            param.Add("@FullPartTime", entity.FullPartTime);
            param.Add("@InstituteID", entity.InstituteID);
            param.Add("@InstituteCode", entity.InstituteCode);

            return _dbAccess.GetDataSet("Institute_SearchInstitutePublic", param);
        }
        public DataSet SearchCourseDetails(InstituteSearchCriteriaEntity entity)
        {
            var param = new Dictionary<string, object>();
            param.Add("@SectorID", entity.SectorID);
            param.Add("@CourseTypeID", entity.CourseTypeID);
            param.Add("@CourseID", entity.CourseID);
            param.Add("@EntryQualificationID", entity.EntryQualificationID);
            param.Add("@FullPartTime", entity.FullPartTime);
            return _dbAccess.GetDataSet("Institute_SearchCourseDetails", param);
        }
        public DataSet GetInstituteDetails(Int64 InstituteID, Int64 CourseID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@InstituteID", InstituteID);
            param.Add("@CourseID", CourseID);

            return _dbAccess.GetDataSet("Institute_GetInstituteDetails", param);
        }
        public DataSet GetCourseDetails(Int64 CourseID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@CourseID", CourseID);

            return _dbAccess.GetDataSet("Institute_GetCourseDetails", param);
        }

        public string SaveProposedInstituteDetails(ProposedInstituteInfoEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@InstituteID", entity.InstituteID);
            param.Add("@InstituteName", entity.InstituteName);
            param.Add("@EstablishmentDate", entity.EstablishmentDate);
            param.Add("@InstituteAddress", entity.InstituteAddress);
            param.Add("@StateID", entity.StateID);
            param.Add("@DistrictID", entity.DistrictID);
            param.Add("@TalukaID", entity.TalukaID);
            param.Add("@CityID", entity.CityID);
            param.Add("@OtherCity", entity.OtherCity);
            param.Add("@PinCode", entity.PinCode);
            param.Add("@LocationCategoryID", entity.LocationCategoryID);
            param.Add("@STD", entity.STD);
            param.Add("@PhoneNo", entity.PhoneNo);
            param.Add("@EMailID", entity.EMailID);
            param.Add("@ResolutionPath", entity.ResolutionPath);
            param.Add("@Website", entity.Website);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);

            param.Add("@VTPRegistrationNumber", entity.VTPRegistrationNumber);
            param.Add("@VTPApprovalDate", entity.VTPApprovalDate);
            param.Add("@VTPApprovalLetterPath", entity.VTPApprovalLetterPath);

            param.Add("@SmartTPRegistrationNumber", entity.SmartTPRegistrationNumber);
            param.Add("@SmartTPApprovalDate", entity.SmartTPApprovalDate);
            param.Add("@SmartTPApprovalLetterPath", entity.SmartTPApprovalLetterPath);

            param.Add("@SmartTCRegistrationNumber", entity.SmartTCRegistrationNumber);
            param.Add("@SmartTCApprovalDate", entity.SmartTCApprovalDate);
            param.Add("@SmartTCApprovalLetterPath", entity.SmartTCApprovalLetterPath);

            param.Add("@MSBSVETRegistrationNumber", entity.MSBSVETRegistrationNumber);
            param.Add("@MSBSVETApprovalDate", entity.MSBSVETApprovalDate);
            param.Add("@MSBSVETApprovalLetterPath", entity.MSBSVETApprovalLetterPath);


            return _dbAccess.ExecuteScalar("Institute_SaveProposedInstituteDetails", param).ToString();
        }

        public string SaveCollegeDetails(InstituteInfoEntity entity)
        {
            var param = new Dictionary<string, object>();


            param.Add("@CollegeRegistrationNo", entity.InstituteCode);
            param.Add("@CollegeName", entity.InstituteName);
            param.Add("@CollegeEstablishmentDate", entity.EstablishmentDate);
            param.Add("@PromotingOrgType", entity.PromotingOrgTypeID);
            param.Add("@PromotingOrgOthers", entity.PromotingOrgOthers);
            param.Add("@AuthorizedPersonTitle", entity.AuthorizedPersonTitle);
            param.Add("@AuthorizedPersonFirstName", entity.AuthorizedPersonFirstName);
            param.Add("@AuthorizedPersonMiddleName", entity.AuthorizedPersonMiddleName);
            param.Add("@AuthorizedPersonLastName", entity.AuthorizedPersonLastName);
            param.Add("@AuthorizedPersonGender", entity.AuthorizedPersonGender);
            param.Add("@AuthorizedPersonDOB", entity.AuthorizedPersonDOB);
            param.Add("@AuthorizedPersonAadharNo", entity.AuthorizedPersonAadharNo);
            param.Add("@AuthorizedPersonAadharCardPath", entity.AuthorizedPersonAadharCardPath);
            param.Add("@AuthorizedPersonMobileNo1", entity.AuthorizedPersonMobileNo1);
            param.Add("@AuthorizedPersonMobileNo2", entity.AuthorizedPersonMobileNo2);
            param.Add("@AuthorizedPersonEmailId", String.IsNullOrEmpty(entity.AuthorizedPersonEmailId) ? "" : entity.AuthorizedPersonEmailId);
            param.Add("@AuthorizedPersonPhoto", entity.AuthorizedPersonPhoto);
            param.Add("@Password", entity.Password);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);
            param.Add("@CollegeStateID", entity.StateID);
            param.Add("@CollegeDistrictID", entity.DistrictID);
            param.Add("@CollegeTalukaID", entity.TalukaID);
            param.Add("@CollegeCity", entity.OtherCity);

            return _dbAccess.ExecuteScalar("Institute_SaveCollegeDetails", param).ToString();
        }
        public string SaveCourseDetails(CourseInfoEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@CourseCode", entity.CourseCode);
            param.Add("@CourseName", entity.Course);
            param.Add("@SectorId", entity.SectorID);
            param.Add("@SubSectorId", entity.SubSectorID);
            param.Add("@CourseTypeId", entity.CourseTypeID);
            param.Add("@BatchSchedue", entity.FullTimePartTime);
            param.Add("@Duration", entity.Duration);
            param.Add("@DurationUnit", entity.DurationUnit);
            param.Add("@MinQualification", entity.MinimumEntryQualification);
            param.Add("@MinQualificationId", entity.MinimumEntryQualificationID);
            param.Add("@MandatorQualification", entity.MandatoryCriteriaAtEntryQualification);
            param.Add("@MandatorQualificationId", entity.MandatoryCriteriaAtEntryQualificationID);
            param.Add("@MinAge", entity.MinimumAge);
            param.Add("@IntakePerUnit", entity.IntakePerUnit);
            param.Add("@IsApproved", entity.IsApproved);
            param.Add("@ApprovedBy", entity.CourseApproverID);
            param.Add("@ModelCurriculumPath", entity.ModelCurriculumPath);
            param.Add("@QualificationPackPath", entity.QualificationPackPath);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);


            return _dbAccess.ExecuteScalar("Institute_SaveCourseDetails", param).ToString();
        }

        public string SaveProposedCourseDetails(CourseInfoEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@InstituteId", entity.InstituteId);
            param.Add("@CourseID", entity.CourseID);
            param.Add("@CourseApproverID", entity.CourseApproverID);
            param.Add("@SectorId", entity.SectorID);
            //param.Add("@SubSectorId", entity.SubSectorID);
            param.Add("@CourseCode", entity.CourseCode);
            param.Add("@CourseName", entity.Course);
            param.Add("@CourseTypeId", entity.CourseTypeID);
            param.Add("@CourseTimingTypeId", entity.CourseTimingTypeId);
            param.Add("@Duration", entity.Duration);
            param.Add("@DurationUnitId", entity.DurationUnitId);
            param.Add("@NoOfUnit", entity.NoOfUnit);
            param.Add("@IntakePerUnit", entity.IntakePerUnit);
            param.Add("@WorkShopSpace", entity.WorkShopSpace);
            param.Add("@FloorId", entity.FloorId);
            param.Add("@PowerPerUnit", entity.PowerPerUnit);
            param.Add("@MaxBatchPerDay", entity.MaxBatchPerDay);
            param.Add("@AgricultureLand", entity.AgricultureLand);
            param.Add("@OpenGround", entity.OpenGround);
            param.Add("@IsSeparateClassRoomRequired", entity.IsSeparateClassRoomRequired);
            param.Add("@ClassRoomUtilization", entity.ClassRoomUtilization);
            param.Add("@IsSeparateDrawingHallRequired", entity.IsSeparateDrawingHallRequired);
            param.Add("@DrawingHallUtilization", entity.DrawingHallUtilization);
            param.Add("@IsSeparateComputerLabRequired", entity.IsSeparateComputerLabRequired);
            param.Add("@ComputerLabUtilization", entity.ComputerLabUtilization);

            param.Add("@MinQualificationId", entity.MinimumEntryQualificationID);
            param.Add("@MandatorQualificationId", entity.MandatoryCriteriaAtEntryQualificationID);
            param.Add("@MinAge", entity.MinimumAge);
            param.Add("@ModelCurriculumPath", entity.ModelCurriculumPath);
            param.Add("@QualificationPackPath", entity.QualificationPackPath);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);

            return _dbAccess.ExecuteScalar("Institute_SaveProposedCourseDetails", param).ToString();
        }

        public string SaveCourseUnitDetails(CourseDetailsEntity entity)
        {
            var param = new Dictionary<string, object>();
            param.Add("@InstituteID", entity.InstituteID);
            param.Add("@CourseID", entity.CourseID);
            param.Add("@ShiftID", entity.ShiftID);
            param.Add("@UnitNo", entity.UnitNo);
            param.Add("@Intake", entity.Intake);
            param.Add("@UnitCode", entity.UnitCode);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);


            return _dbAccess.ExecuteScalar("Institute_SaveCourseUnitDetails", param).ToString();
        }
        public DataSet GetCourseUnitDetails(Int64 InstituteID, Int64 CourseID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@InstituteID", InstituteID);
            param.Add("@CourseID", CourseID);

            return _dbAccess.GetDataSet("Institute_GetCourseUnitDetails", param);
        }
        public DataSet GetCourseUnitDetailsByShiftUnit(Int64 InstituteID, Int64 CourseID, int ShiftID, int UnitNo)
        {
            var param = new Dictionary<string, object>();

            param.Add("@InstituteID", InstituteID);
            param.Add("@CourseID", CourseID);
            param.Add("@ShiftID", ShiftID);
            param.Add("@UnitNo", UnitNo);

            return _dbAccess.GetDataSet("Institute_GetCourseUnitDetailsByShiftUnit", param);
        }
        public string DeleteCourseUnitDetails(Int64 InstituteID, Int64 CourseID, int ShiftID, int UnitNo, string UserLoginID, string IPAddress)
        {
            var param = new Dictionary<string, object>();

            param.Add("@InstituteID", InstituteID);
            param.Add("@CourseID", CourseID);
            param.Add("@ShiftID", ShiftID);
            param.Add("@UnitNo", UnitNo);
            param.Add("@UserLoginID", UserLoginID);
            param.Add("@IPAddress", IPAddress);

            return _dbAccess.ExecuteScalar("Institute_DeleteCourseUnitDetails", param).ToString();
        }

        public DataSet GETBatchDetailsByCollege(Int64 InstituteID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@CollegeID", InstituteID);

            return _dbAccess.GetDataSet("Institute_GETBatchDetailsByCollege", param);
        }
        public DataSet GetUnitByInstitute(Int64 InstituteID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@CollegeID", InstituteID);

            return _dbAccess.GetDataSet("Institute_GetUnitByInstitute", param);
        }
        public DataSet GETBatchDetails(Int64 InstituteID, Int64 CourseID, int ShiftID, int UnitNo)
        {
            var param = new Dictionary<string, object>();

            param.Add("@InstituteID", InstituteID);
            param.Add("@CourseID", CourseID);
            param.Add("@ShiftID", ShiftID);
            param.Add("@UnitNo", UnitNo);

            return _dbAccess.GetDataSet("Institute_GETBatchDetails", param);
        }
        public DataTable GetNewBatchDetails(Int64 InstituteID, Int64 CourseID, int ShiftID, int UnitNo)
        {
            var param = new Dictionary<string, object>();

            param.Add("@InstituteID", InstituteID);
            param.Add("@CourseID", CourseID);
            param.Add("@ShiftID", ShiftID);
            param.Add("@UnitNo", UnitNo);

            return _dbAccess.GetDataTable("Institute_GetNewBatchDetails", param);
        }
        public string SaveBatchDetails(BatchDetailsEntity entity)
        {
            var param = new Dictionary<string, object>();
            param.Add("@CollegeID", entity.InstituteID);
            param.Add("@CourseID", entity.CourseID);
            param.Add("@ShiftID", entity.ShiftID);
            param.Add("@UnitNo", entity.UnitNo);
            param.Add("@UnitID", entity.UnitCode);
            param.Add("@BatchID", entity.BatchID);
            param.Add("@BatchStartDate", entity.BatchStartDate);
            param.Add("@BatchEndDate", entity.BatchEndDate);
            param.Add("@AdmissionEndDate", entity.AdmissionEndDate);
            param.Add("@IsSystemCreated", entity.IsSystemCreated);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);

            return _dbAccess.ExecuteScalar("Institute_SaveBatchDetails", param).ToString();
        }
        public DataTable GETBatchDetailsByBatchID(Int64 BatchID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@BatchID", BatchID);

            return _dbAccess.GetDataTable("Institute_GETBatchDetailsByBatchID", param);
        }
        public string DeleteBatchDetailsByBatchID(Int64 BatchID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@BatchID", BatchID);

            return _dbAccess.ExecuteScalar("Institute_DeleteBatchDetailsByBatchID", param).ToString();
        }
        public string UpdateBatchDetails(BatchDetailsEntity entity)
        {
            var param = new Dictionary<string, object>();
            param.Add("@BatchID", entity.BatchID);
            param.Add("@BatchEndDate", entity.BatchEndDate);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);

            return _dbAccess.ExecuteScalar("Institute_UpdateBatchDetails", param).ToString();
        }

        public DataSet GetCourseUnitDetailsForApprovalByCoureseID(InstituteInputEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@InstituteID", entity.InstituteId);
            param.Add("@ExitInstituteID", entity.ExitInstituteID);
            //param.Add("@UserLoginID", entity.UserLoginID);
            //param.Add("@PageCode", entity.PageCode);
            param.Add("@CourseID", entity.ItemId);

            return _dbAccess.GetDataSet("Institute_GetCourseUnitDetailsForApprovalByCoureseID", param);
        }

        // Proposed Course of New Institute
        public DataSet GetProposedCourseUnitRequirementDetails(Int64 InstituteID, Int64 CourseId, string UserLoginID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@InstituteID", InstituteID);
            param.Add("@UserLoginID", UserLoginID);
            param.Add("@CourseID", CourseId);

            return _dbAccess.GetDataSet("Institute_GetProposedCourseUnitRequirementDetails", param);
        }

        public DataSet GetProposedCourseUnitDetails(InstituteInputEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@InstituteID", entity.InstituteId);
            param.Add("@ExitInstituteID", entity.ExitInstituteID);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@PageCode", entity.PageCode);
            param.Add("@CourseID", entity.ItemId);

            return _dbAccess.GetDataSet("Institute_GetProposedCourseUnitDetails", param);
        }
        //public DataSet GetShortTermProposedCourseUnitDetails(InstituteInputEntity entity)
        //{
        //    var param = new Dictionary<string, object>();

        //    param.Add("@InstituteID", entity.InstituteId);
        //    param.Add("@ExitInstituteID", entity.ExitInstituteID);
        //    param.Add("@UserLoginID", entity.UserLoginID);
        //    param.Add("@PageCode", entity.PageCode);
        //    param.Add("@CourseID", entity.ItemId);

        //    return _dbAccess.GetDataSet("Institute_GetShortTermProposedCourseUnitDetails", param);
        //}
        public string SaveProposedCourseUnitDetails(ProposedCourseUnitDetailsEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@InstituteID", entity.InstituteId);
            param.Add("@CourseId", entity.CourseId);
            param.Add("@ProposedUnits", entity.ProposedUnits);
            param.Add("@ApprovedUnits", entity.ApprovedUnits);
            param.Add("@TotalUnits", entity.TotalUnits);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);

            return _dbAccess.ExecuteScalar("Institute_SaveProposedCourseUnitDetails", param).ToString();
        }
        public string SaveShortTermProposedCourseUnitDetails(ProposedCourseUnitDetailsEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@InstituteID", entity.InstituteId);
            param.Add("@CourseId", entity.CourseId);
            param.Add("@ProposedUnits", entity.ProposedUnits);
            param.Add("@ApprovedUnits", entity.ApprovedUnits);
            param.Add("@TotalUnits", entity.TotalUnits);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);

            return _dbAccess.ExecuteScalar("Institute_SaveShortTermProposedCourseUnitDetails", param).ToString();
        }
        public string DeleteShortTermProposedCourseUnitDetails(ProposedCourseUnitDetailsEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@InstituteID", entity.InstituteId);
            param.Add("@CourseId", entity.CourseId);
            //param.Add("@ProposedUnits", entity.ProposedUnits);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);

            return _dbAccess.ExecuteScalar("Institute_DeleteShortTermProposedCourseUnitDetails", param).ToString();
        }
        public string DeleteProposedCourseUnitDetails(ProposedCourseUnitDetailsEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@InstituteID", entity.InstituteId);
            param.Add("@CourseId", entity.CourseId);
            //param.Add("@ProposedUnits", entity.ProposedUnits);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);

            return _dbAccess.ExecuteScalar("Institute_DeleteProposedCourseUnitDetails", param).ToString();
        }



        // Building Details
        public DataSet GetBuildingDetails(Int64 InstituteID, Int64 BuildingId = 0)
        {
            var param = new Dictionary<string, object>();

            param.Add("@InstituteID", InstituteID);
            param.Add("@BuildingId", BuildingId);

            return _dbAccess.GetDataSet("Institute_GetBuildingDetails", param);
        }
        public string SaveBuildingDetails(BuildingDetailsEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@InstituteID", entity.InstituteID);
            param.Add("@BuildingId", entity.BuildingID);
            param.Add("@BuildingNameTypeId", entity.BuildingNameTypeId);
            param.Add("@BuildingStatusId", entity.BuildingStatusId);
            param.Add("@OwnerShipTypeid", entity.OwnerShipTypeid);
            param.Add("@LeaseDate", entity.LeaseDate);
            param.Add("@LeaseExpiryDate", entity.LeaseExpiryDate);
            param.Add("@LeaseFilePath", entity.LeaseFilePath);
            param.Add("@Building712FilePath", entity.Building712FilePath);
            param.Add("@IsDedicated", entity.IsDedicated);
            param.Add("@BuildingOtherUsestatusId", entity.BuildingOtherUsestatusId);
            param.Add("@BuildingOtherUsestatusText", entity.BuildingOtherUsestatusText);
            param.Add("@HasApproachRoad", entity.HasApproachRoad);
            param.Add("@RoadWidth", entity.RoadWidth);
            param.Add("@RoadDocPath", entity.RoadDocPath);
            param.Add("@ConstructionTypeId", entity.ConstructionTypeId);
            param.Add("@ConstructionYearId", entity.ConstructionYearId);
            param.Add("@GroundFloorArea", entity.GroundFloorArea);
            param.Add("@OtherFloorArea", entity.OtherFloorArea);
            param.Add("@CelingHeight", entity.CelingHeight);
            param.Add("@FloorId", entity.FloorId);
            //param.Add("@UsageTypeId", entity.UsageTypeId);
            param.Add("@FloorPlanFilePath", entity.FloorPlanFilePath);
            param.Add("@GoogleMapPath", entity.GoogleMapPath);
            param.Add("@BuildingPhotoPath", entity.BuildingPhotoPath);
            param.Add("@Latitude", entity.Latitude);
            param.Add("@Longitude", entity.Longitude);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);


            return _dbAccess.ExecuteScalar("Institute_SaveBuildingDetails", param).ToString();
        }

        public string DeleteBuildingDetails(Int64 InstituteID, Int64 BuildingId, string UserLoginID, string IPAddress)
        {
            var param = new Dictionary<string, object>();

            param.Add("@InstituteID", InstituteID);
            param.Add("@BuildingId", BuildingId);
            param.Add("@UserLoginID", UserLoginID);
            param.Add("@IPAddress", IPAddress);

            return _dbAccess.ExecuteScalar("Institute_DeleteBuildingDetails", param).ToString();
        }
        public DataSet GetBuildingSpaceasperNorms(long instituteID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@InstituteID", instituteID);
            return _dbAccess.GetDataSet("Institute_GetBuildingSpaceasperNorms", param);
        }

        public DataSet GetBuildingSpaceasperNormsAnalysis(long instituteID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@InstituteID", instituteID);
            return _dbAccess.GetDataSet("Institute_GetBuildingSpaceasperNormsAnalysis", param);
        }



        // Land

        public DataSet GetRequiredLandDetails(Int64 InstituteID, string userLoginId)
        {
            var param = new Dictionary<string, object>();

            param.Add("@InstituteID", InstituteID);
            param.Add("@UserLoginId", userLoginId);

            return _dbAccess.GetDataSet("Institute_GetRequiredLandDetails", param);
        }

        public DataSet GetLandDetails(Int64 InstituteID, Int64 LandId = 0)
        {
            var param = new Dictionary<string, object>();

            param.Add("@InstituteID", InstituteID);
            param.Add("@LandId", LandId);

            return _dbAccess.GetDataSet("Institute_GetLandDetails", param);
        }
        public string SaveLandDetails(LandDetailsEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@InstituteID", entity.InstituteID);
            param.Add("@LandId", entity.LandID);
            param.Add("@OwnerShipTypeid", entity.OwnerShipTypeid);
            param.Add("@LeaseDate", entity.LeaseDate);
            param.Add("@LeaseExpiryDate", entity.LeaseExpiryDate);
            param.Add("@LeaseFilePath", entity.LeaseFilePath);
            param.Add("@Land712FilePath", entity.Land712FilePath);
            param.Add("@GoogleMapPath", entity.GoogleMapPath);
            param.Add("@LandPhotoPath", entity.LandPhotoPath);
            param.Add("@AvailableLandArea", entity.AvailableLandArea);
            param.Add("@RequiredLandArea", entity.RequiredAgriLand);
            param.Add("@LandType", entity.LandType);
            param.Add("@DistanceToInstitute", entity.DistanceToInstitute);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);
            param.Add("@Latitude", entity.Latitude);
            param.Add("@Longitude", entity.Longitude);

            return _dbAccess.ExecuteScalar("Institute_SaveLandDetails", param).ToString();
        }

        public string DeleteLandDetails(Int64 InstituteID, Int64 LandId, string UserLoginID, string IPAddress)
        {
            var param = new Dictionary<string, object>();

            param.Add("@InstituteID", InstituteID);
            param.Add("@LandId", LandId);
            param.Add("@UserLoginID", UserLoginID);
            param.Add("@IPAddress", IPAddress);

            return _dbAccess.ExecuteScalar("Institute_DeleteLandDetails", param).ToString();
        }


        //Workshop

        public DataSet GetWorkshopDetails(InstituteInputEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@InstituteID", entity.InstituteId);
            param.Add("@UserLoginId", entity.UserLoginID);
            param.Add("@PageCode", entity.PageCode);
            param.Add("@WorkShopId", entity.ItemId);
            param.Add("@ApprovalIDFlag", entity.ApprovalIDFlag);

            return _dbAccess.GetDataSet("Institute_GetWorkshopDetails", param);
        }
        public string SaveWorkshopDetails(WorkshopEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@InstituteId", entity.InstituteId);
            param.Add("@WorkshopXML", entity.Workshopxml);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);
            param.Add("@PageCode", entity.PageCode);

            return _dbAccess.ExecuteScalar("Institute_SaveWorkshopDetails", param).ToString();
        }
        public string SaveWorkshopPhotoPath(WorkshopEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@InstituteId", entity.InstituteId);
            param.Add("@CourseId", entity.CourseID);
            param.Add("@WorkshopId", entity.WorkshopId);
            param.Add("@WorkshopPhotoPath", entity.WorkshopPhotoPath);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);

            return _dbAccess.ExecuteScalar("Institute_SaveWorkshopPhotoPath", param).ToString();
        }
        public string DeleteWorkshopPhotoPath(WorkshopEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@InstituteId", entity.InstituteId);
            param.Add("@WorkshopId", entity.WorkshopId);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);
            param.Add("@PageCode", entity.PageCode);

            return _dbAccess.ExecuteScalar("Institute_DeleteWorkshopPhotoPath", param).ToString();
        }

        public DataSet GetWorkshopSpaceRemark(long instituteId)
        {
            var param = new Dictionary<string, object>();
            param.Add("@InstituteId", instituteId);

            return _dbAccess.GetDataSet("Institute_GetWorkshopSpaceRemark", param);
        }


        // Common Facility

        public DataSet GetMasterSubFacilityGroup(Int64 InstituteID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@InstituteID", InstituteID);

            return _dbAccess.GetDataSet("Institute_GetMasterSubFacilityGroup", param);
        }
        public DataSet GetCommonFacilityCourseDetails(Int64 InstituteID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@InstituteID", InstituteID);

            return _dbAccess.GetDataSet("Institute_GetCommonFacilityCourseDetails", param);
        }

        public string SaveFacilityDetails(CommonSubFacilityEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@InstituteId", entity.InstituteId);
            param.Add("@FacilityXml", entity.FacilityXml);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);
            param.Add("@TrainingEquipmentPhoto", entity.TrainingEquipmentPhoto);

            return _dbAccess.ExecuteScalar("Institute_SaveFacilityDetails", param).ToString();
        }

        public string SaveCommonPhotoPath(WorkshopEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@InstituteId", entity.InstituteId);
            param.Add("@CourseId", entity.CourseID);
            param.Add("@WorkshopId", entity.WorkshopId);
            param.Add("@WorkshopPhotoPath", entity.WorkshopPhotoPath);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);

            return _dbAccess.ExecuteScalar("Institute_SaveCommonPhotoPath", param).ToString();
        }
        public string DeleteCommonPhotoPath(WorkshopEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@InstituteId", entity.InstituteId);
            param.Add("@WorkshopId", entity.WorkshopId);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);
            param.Add("@PageCode", entity.PageCode);

            return _dbAccess.ExecuteScalar("Institute_DeleteCommonPhotoPath", param).ToString();
        }

        // new common facility details 
        public DataSet GetSubFacilityDetails(SubFacilityInputEntity entity)
        {
            var param = new Dictionary<string, object>();
            param.Add("@InstituteId", entity.InstituteId);

            return _dbAccess.GetDataSet("Institute_GetSubFacilityDetails", param);
        }

        public string SaveSubFacilityDetail(SubFacilitySaveEntity entity)
        {
            var param = new Dictionary<string, object>();
            param.Add("@Id", entity.Id == 0 ? (object)DBNull.Value : entity.Id);
            param.Add("@InstituteId", entity.InstituteId);
            param.Add("@SubFacilityGroupId", entity.SubFacilityGroupId);
            param.Add("@AvailableSpace", entity.AvailableSpace ?? (object)DBNull.Value);
            param.Add("@PhotoPath", string.IsNullOrEmpty(entity.PhotoPath) ? (object)DBNull.Value : entity.PhotoPath);
            param.Add("@UserId", entity.UserLoginID);
            param.Add("@UserIPAddress", entity.UserIPAddress);

            return _dbAccess.ExecuteScalar("Institute_SaveSubFacilityDetail_Single", param).ToString();
        }

        public string SaveSubFacilityDetails(SubFacilityBulkSaveEntity entity)
        {
            var param = new Dictionary<string, object>();
            param.Add("@InstituteId", entity.InstituteId);
            param.Add("@SubFacilityGroupId", entity.SubFacilityGroupId);

            // Convert list to JSON
            string jsonData = JsonConvert.SerializeObject(entity.FacilityData);
            param.Add("@FacilityData", jsonData);

            param.Add("@UserId", entity.UserLoginID);
            param.Add("@UserIPAddress", entity.UserIPAddress);

            return _dbAccess.ExecuteScalar("Institute_SaveSubFacilityDetails", param).ToString();
        }

        public string DeleteSubFacilityDetail(SubFacilityDeleteEntity entity)
        {
            var param = new Dictionary<string, object>();
            param.Add("@Id", entity.Id);
            param.Add("@InstituteId", entity.InstituteId);
            param.Add("@UserLoginId", entity.UserLoginID);
            param.Add("@UserIPAddress", entity.UserIPAddress);

            return _dbAccess.ExecuteScalar("Institute_DeleteSubFacilityDetail", param).ToString();
        }



        // Other Infra Details

        public DataSet GetOtherInfraDetails(Int64 InstituteID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@InstituteID", InstituteID);
            param.Add("@UserLoginId", InstituteID);

            return _dbAccess.GetDataSet("Institute_GetOtherInfraDetails", param);
        }

        public DataSet GetMasterOtherInfraDetails()
        {
            var param = new Dictionary<string, object>();

            return _dbAccess.GetDataSet("Base_GetMasterOtherInfraDetails", param);
        }
        public string SaveOtherInfraPhotoPath(OtherInfraEntity entity)
        {
            var param = new Dictionary<string, object>();

            //param.Add("@InstituteId", entity.InstituteId);
            //param.Add("@OtherInfraId", entity.OtherInfraId);
            //param.Add("@OtherInfraPhotoPath", entity.OtherInfraPhotoPath);
            //param.Add("@UserLoginID", entity.UserLoginID);
            //param.Add("@IPAddress", entity.IPAddress);

            return _dbAccess.ExecuteScalar("Institute_SaveOtherInfraPhotoPath", param).ToString();
        }
        public string SaveOtherInfraDetails(OtherInfraEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@InstituteId", entity.InstituteId);
            param.Add("@SourceofWaterSupplyID", entity.SourceofWaterSupplyID);
            param.Add("@IsWaterSupply", entity.IsWaterSupply);
            param.Add("@OtherSourceofWaterSupply", entity.OtherSourceofWaterSupply);
            param.Add("@WaterSupplyPhoto", entity.WaterSupplyPhoto);
            param.Add("@IsDisplayBoard", entity.IsDisplayBoard);
            param.Add("@IsBoardasperNorms", entity.IsBoardasperNorms);
            param.Add("@BoardPhoto", entity.BoardPhoto);
            param.Add("@InternetConnectivity", entity.InternetConnectivity);  // added 
            param.Add("@CctvAvailable", entity.CctvAvailable);  // added 
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);

            return _dbAccess.ExecuteScalar("Institute_SaveOtherInfraDetails", param).ToString();
        }

        // Institute Bank Details
        public DataTable GetInstituteBank(Int64 InstituteId)
        {
            var param = new Dictionary<string, object>();
            param.Add("@InstituteId", InstituteId);
            return _dbAccess.GetDataTable("Institute_GetBank", param);
        }


        public string SaveInstituteBank(InstituteBankEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@BankRowId", entity.BankRowId);
            param.Add("@InstituteID", entity.InstituteID);
            param.Add("@AccountType", entity.AccountType);
            param.Add("@AccountNo", entity.AccountNo);
            param.Add("@AccountHolderName", entity.AccountHolderName);
            param.Add("@IFSCCode", entity.IFSCCode);
            param.Add("@BankName", entity.BankName);
            param.Add("@BranchName", entity.BranchName);
            param.Add("@CancelChequePath", entity.CancelChequePath);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);
            param.Add("@PageCode", entity.PageCode);

            return _dbAccess.ExecuteScalar("Institute_SaveBank", param).ToString();
        }

        public string DeleteInstituteBank(InstituteBankEntity entity)
        {
            var param = new Dictionary<string, object>();
            param.Add("@BankRowId", entity.BankRowId);
            param.Add("@InstituteID", entity.InstituteID);
            param.Add("@IPAddress", entity.IPAddress);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@PageCode", entity.PageCode);

            return _dbAccess.ExecuteScalar("Institute_DeleteInstituteBank", param).ToString();
        }

        /// Power Details

        public DataSet GetPowerDetails(InstituteInputEntity entity)
        {
            var param = new Dictionary<string, object>();
            param.Add("@InstituteID", entity.InstituteId);
            param.Add("@UserLoginId", entity.UserLoginID);
            param.Add("@PageCode", entity.PageCode);

            return _dbAccess.GetDataSet("Institute_GetPowerDetails", param);
        }
        public string SavePowerDetails(PowerInfoSaveRequest entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@InstituteID", entity.InstituteId);
            param.Add("@AvailablePower", entity.AvailablePower);
            param.Add("@AvailablePhase", entity.AvailablePhase);
            param.Add("@ElectricityBillPath", entity.ElectricityBillPath);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);
            param.Add("@PageCode", entity.PageCode);
            param.Add("@IsMeterConnectionPromotingOrganization", entity.IsMeterConnectionPromotingOrganization);
            param.Add("@IsMeterConnectionProposedInstitute", entity.IsMeterConnectionProposedInstitute);
            param.Add("@MeterNOCfromOwner", entity.MeterNOCfromOwner);

            param.Add("@RequiredPower", entity.RequiredPower);
            param.Add("@PowerAvailability", entity.PowerAvailability);
            param.Add("@RequiredSupplyType", entity.RequiredSupplyType);
            param.Add("@SupplyTypeVariation", entity.SupplyTypeVariation);




            return _dbAccess.ExecuteScalar("Institute_SavePowerDetails", param).ToString();

        }

        public DataTable GetCoursewiseSubjectDetails(Int64 InstituteId, string userLoginId)
        {
            var param = new Dictionary<string, object>();
            param.Add("@InstituteId", InstituteId);
            param.Add("@UserLoginId", userLoginId);

            return _dbAccess.GetDataTable("Institute_GetCoursewiseSubjectDetails", param);
        }
        public DataTable GetCourseSubjectwiseStaffMappingDetails(Int64 InstituteId, string userLoginId)
        {
            var param = new Dictionary<string, object>();
            param.Add("@InstituteId", InstituteId);
            param.Add("@UserLoginId", userLoginId);

            return _dbAccess.GetDataTable("Institute_GetCourseSubjectwiseStaffMappingDetails", param);
        }
        public string SaveCourseSubjectwiseStaffMappingDetails(CourseSubjectwiseStaffEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@InstituteID", entity.InstituteId);
            param.Add("@CourseId", entity.CourseID);
            param.Add("@SubjectId", entity.SubjectId);
            param.Add("@ShiftId", entity.ShiftId);
            param.Add("@UnitNo", entity.UnitNo);
            param.Add("@StaffProfileId", entity.StaffProfileId);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);
            param.Add("@PageCode", entity.PageCode);

            return _dbAccess.ExecuteScalar("Institute_SaveCourseSubjectwiseStaffMappingDetails", param).ToString();

        }
        public string DeleteCourseSubjectwiseStaffMappingDetails(CourseSubjectwiseStaffEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@InstituteID", entity.InstituteId);
            param.Add("@CourseSubjectwiseStaffMappingId", entity.CourseSubjectwiseStaffMappingId);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);
            param.Add("@PageCode", entity.PageCode);

            return _dbAccess.ExecuteScalar("Institute_DeleteCourseSubjectwiseStaffMappingDetails", param).ToString();

        }



        // Training Equipment

        public DataSet GetTrainingEquipmentDetails(InstituteInputEntity entity)
        {
            var param = new Dictionary<string, object>();
            param.Add("@InstituteID", entity.InstituteId);
            param.Add("@UserLoginId", entity.UserLoginID);
            param.Add("@PageCode", entity.PageCode);
            param.Add("@ItemId", entity.ItemId);
            param.Add("@ApprovalIDFlag", entity.ApprovalIDFlag);

            return _dbAccess.GetDataSet("Institute_GetTrainingEquipmentDetails", param);
        }

        public DataSet GetTrainingEquipmentListDetails(InstituteInputEntity entity)
        {
            var param = new Dictionary<string, object>();
            param.Add("@InstituteID", entity.InstituteId);
            param.Add("@UserLoginId", entity.UserLoginID);
            param.Add("@PageCode", entity.PageCode);
            param.Add("@CourseId", Convert.ToInt64(entity.ItemId));
            return _dbAccess.GetDataSet("Institute_GetTrainingEquipmentListDetails", param);
        }


        public string UpdateTrainingEquipmentAvailability(List<TrainingEquipmentListEntity> lstTrainingEquipmentList, List<TraningEquipmentPhotoEntity> lstPhoto, string PageCode)
        {
            var param = new Dictionary<string, object>();
            param.Add("@EquipmentDetails", GetXML(lstTrainingEquipmentList));
            param.Add("@TrainingEquipmentPhoto", GetXML(lstPhoto));
            param.Add("@PageCode", PageCode);

            return _dbAccess.ExecuteScalar("Institute_UpdateTrainingEquipmentAvailability", param).ToString();
        }

        // Inspection Fee

        public DataSet GetInspectionFeeList(InstituteInputEntity entity)
        {
            var param = new Dictionary<string, object>();
            param.Add("@InstituteID", entity.InstituteId);
            param.Add("@UserLoginId", entity.UserLoginID);
            param.Add("@PageCode", entity.PageCode);
            param.Add("@CourseId", Convert.ToInt64(entity.ItemId));

            return _dbAccess.GetDataSet("Institute_GetInspectionFeeList", param);
        }


        // Inspection Request

        public DataSet GetInstituteInspectionAgencyList(InstituteInputEntity entity)
        {
            var param = new Dictionary<string, object>();
            param.Add("@InstituteID", entity.InstituteId);
            param.Add("@UserLoginId", entity.UserLoginID);
            param.Add("@PageCode", entity.PageCode);

            return _dbAccess.GetDataSet("Institute_GetInstituteInspectionAgencyList", param);
        }

        public DataSet GetInstituteInspectionDateRange(InstituteInputEntity entity)
        {
            var param = new Dictionary<string, object>();
            param.Add("@InstituteId", entity.InstituteId);
            param.Add("@UserLoginId", entity.UserLoginID);
            param.Add("@PageCode", entity.PageCode);

            return _dbAccess.GetDataSet("Institute_GetInstituteInspectionDateRange", param);
        }
        //public string SaveInstituteInspectionDateRange(InstituteInputEntity entity, string startDate, string endDate, string submissionDate , string DelayRemark, string InspectionScheduledDateByDVETO, string DelayRemarkForActual, string ActualInspectionDateByDVETO)
        public string SaveInstituteInspectionDateRange(SaveInspectionDateRangeRequest entity)
        {
            var param = new Dictionary<string, object>();
            param.Add("@InstituteId", entity.Entity.InstituteId);
            param.Add("@UserLoginId", entity.Entity.UserLoginID);
            param.Add("@PageCode", entity.Entity.PageCode);
            //param.Add("@StartDate", entity.StartDate);
            //param.Add("@EndDate", entity.EndDate);
            param.Add("@StartDate",
        string.IsNullOrWhiteSpace(entity.StartDate)
        ? (object)DBNull.Value
        : entity.StartDate);

            param.Add("@EndDate",
                string.IsNullOrWhiteSpace(entity.EndDate)
                ? (object)DBNull.Value
                : entity.EndDate);

            param.Add("@SubmissionDate", entity.SubmissionDate ?? (object)DBNull.Value);  // Handle null
            param.Add("@DelayRemark", entity.DelayRemark ?? (object)DBNull.Value);  // Handle null
            param.Add("@InspectionScheduledDateByDVETO", entity.InspectionScheduledDateByDVETO ?? (object)DBNull.Value);  // Handle null
            param.Add("@ActualInspectionDateByDVETO", entity.ActualInspectionDateByDVETO ?? (object)DBNull.Value);  // Handle null
            param.Add("@DelayRemarkForActual", entity.DelayRemarkForActual ?? (object)DBNull.Value);  // Handle null
            param.Add("@InspectionReportSubmissionDate", entity.InspectionReportSubmissionDate ?? (object)DBNull.Value);  // Handle null
            param.Add("@SignedInspectionReportSubmissionDate", entity.SignedInspectionReportSubmissionDate ?? (object)DBNull.Value);  // Handle null

            return _dbAccess.ExecuteScalar("Institute_SaveInstituteInspectionDateRange", param).ToString();
        }







        // Self Declaration

        public string SaveSelfDeclarationPath(SaveSelfDeclarationRequest entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@InstituteId", entity.InstituteId);
            param.Add("@SelfDeclarationPath", entity.SelfDeclarationPath);
            param.Add("@PageCode", entity.PageCode);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);

            return _dbAccess.ExecuteScalar("Institute_SaveSelfDeclarationPath", param).ToString();
        }
        public DataTable GetSelfDeclarationPath(InstituteInputEntity entity)
        {
            var param = new Dictionary<string, object>();
            param.Add("@InstituteID", entity.InstituteId);
            param.Add("@UserLoginId", entity.UserLoginID);
            param.Add("@PageCode", entity.PageCode);

            return _dbAccess.GetDataTable("Institute_GetSelfDeclarationPath", param);
        }

        public DataTable GetProposedInstituteStatus(Int64 InstituteID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@InstituteID", InstituteID);
            return _dbAccess.GetDataTable("Institute_GetSDILInstituteStatus", param);

        }

        // LOI
        public string SaveLOIStatus(SaveLOIStatus entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@InstituteId", entity.InstituteId);
            param.Add("@LOIStatusCode", entity.ItemId);
            param.Add("@PageCode", entity.PageCode);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);

            return _dbAccess.ExecuteScalar("Institute_SaveLOIStatus", param).ToString();
        }
        public bool IsLOIGenerated(InstituteInputEntity entity)
        {
            var param = new Dictionary<string, object>();
            param.Add("@InstituteID", entity.InstituteId);
            param.Add("@UserLoginId", entity.UserLoginID);
            param.Add("@PageCode", entity.PageCode);

            return Convert.ToBoolean(_dbAccess.ExecuteScalar("Institute_IsLOIGenerated", param));
        }


        public DataTable GetBuildingCourse(Int64 InstituteID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@InstituteID", InstituteID);
            return _dbAccess.GetDataTable("Institute_BuildingCourse", param);
        }
        public DataTable GetAgricultureOpenGroudCourse(Int64 InstituteID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@InstituteID", InstituteID);
            return _dbAccess.GetDataTable("Institute_GetAgricultureOpenGroudCourse", param);
        }

        public DataTable GetSuccessStoryResult(Int64 CandidateID, Int64 InstituteID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@CandidateID", CandidateID); param.Add("@InstituteID", InstituteID);
            return _dbAccess.GetDataTable("Instituet_GetSuccessStoryResult", param);
        }
        public string DeleteSuccessStoryByID(Int64 ID, string UserLoginID, string @IPAddress)
        {
            var param = new Dictionary<string, object>();
            param.Add("@ID", ID);
            param.Add("@UserLoginID", UserLoginID);
            param.Add("@IPAddress", IPAddress);

            return _dbAccess.ExecuteScalar("Institute_DeleteSuccessStoryByID", param).ToString();
        }
        public string SaveSuccessStory(SucessStoryEntity entity)
        {
            var param = new Dictionary<string, object>();
            param.Add("@ID", entity.ID);
            param.Add("@IsProfile", entity.IsProfile);
            param.Add("@FirstName", entity.FirstName);
            param.Add("@MiddleName", entity.MiddleName);
            param.Add("@LAstName", entity.LastName);
            param.Add("@CandidateProfileID", entity.CandidateProfileID);
            param.Add("@PhotoPath", entity.PhotoPath);
            param.Add("@CourseID", entity.CourseID);
            param.Add("@InstituteID", entity.InstituteID);
            param.Add("@PassingYearID", entity.PassingYearID);
            param.Add("@PresentDesignation", entity.PresentDesignation);
            param.Add("@PresentOrganization", entity.PresentOrganization);
            param.Add("@SelectionYearID", entity.SelectionYearID);
            param.Add("@SelectionYear", entity.SelectionYear);
            param.Add("@DocumentPath", entity.DocumentPath);
            param.Add("@IsPublished", entity.IsPublished);
            param.Add("@IsActive", entity.IsActive);
            param.Add("@CandidateMobileNo", entity.CandidateMobileNo);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);

            return _dbAccess.ExecuteScalar("Institute_SaveSuccessStory", param).ToString();

        }
        public DataTable GetSuccessStoryByID(Int64 ID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@ID", ID);
            return _dbAccess.GetDataTable("Institute_GetSuccessStoryByID", param);

        }
        public DataTable GetSuccessStoryByInstituteID(Int64 InstituteID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@InstituteID", InstituteID);
            return _dbAccess.GetDataTable("Institute_GetSuccessStoryByInstituteID", param);

        }
        public DataTable GetPublishedSuccessStory()
        {
            return _dbAccess.GetDataTable("Institute_GetPublishedSuccessStory");
        }
        public DataTable GetAllSuccessStory()
        {

            return _dbAccess.GetDataTable("Institute_GetAllSuccessStory");

        }

        public DataTable SearchSuccessStory(Int32 DistrictID, Int32 SectorID, Int64 InstituteID, Int64 CoureseID, Int16 PublishStatus)
        {

            var param = new Dictionary<string, object>();
            param.Add("@DistrictID", DistrictID);
            param.Add("@SectorID", SectorID);
            param.Add("@InstituteID", InstituteID);
            param.Add("@courseID", CoureseID);
            param.Add("@PublishStatus", PublishStatus);
            return _dbAccess.GetDataTable("Institute_SearchSuccessStory", param);

        }

        //    public DataTable GetDPDCDetailsByCollegeRegNo(string CollegeRegistrationNo)
        //    {
        //        var param = new Dictionary<string, object>
        //{
        //       { "@CollegeRegistrationNo", CollegeRegistrationNo }
        //};

        //        return _dbAccess.GetDataTable("Institute_GetDPDCDetails", param);
        //    }

        public DataTable GetDPDCDetailsByCollegeRegNo(string CollegeRegistrationNo)
        {
            var param = new Dictionary<string, object>
        {
            { "@CollegeRegistrationNo", CollegeRegistrationNo }
        };

            return _dbAccess.GetDataTable("Institute_GetDPDCDetails", param);
        }


        public string SaveDPDCFundData(DPDCFundEntity entity)
        {
            var param = new Dictionary<string, object>
        {
            { "@CollegeRegistrationNo", entity.CollegeRegistrationNo },
            { "@FinancialYearID", entity.FinancialYearID },
            { "@Allotted_2203_Institute", entity.Allotted_2203_Institute },
            { "@Allotted_2230_Institute", entity.Allotted_2230_Institute },
            { "@CreatedBy", entity.UserLoginID },
            { "@CreatedByIPAddress", entity.IPAddress }
        };

            var result = _dbAccess.GetDataTable("Institute_SaveUpdateDPDCFund", param);

            if (result != null && result.Rows.Count > 0)
            {
                return result.Rows[0]["Action"].ToString();
            }

            return "Error";
        }

        public List<InstituteManagementDetailsEntity> GetInstituteManagementDetails(long instituteID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@InstituteID", instituteID);

            DataTable dt = _dbAccess.GetDataTable("Institute_GetInstituteManagementDetails", param);

            List<InstituteManagementDetailsEntity> list = new List<InstituteManagementDetailsEntity>();

            if (dt != null && dt.Rows.Count > 0)
            {
                foreach (DataRow row in dt.Rows)
                {
                    list.Add(new InstituteManagementDetailsEntity
                    {
                        ID = Convert.ToInt64(row["ID"]),
                        InstituteID = Convert.ToInt64(row["InstituteID"]),
                        StaffID = Convert.ToInt64(row["StaffID"]),
                        ManagementType = Convert.ToInt32(row["ManagementType"]),
                        Title = row["Title"].ToString(),
                        FirstName = row["FirstName"].ToString(),
                        MiddleName = row["MiddleName"].ToString(),
                        LastName = row["LastName"].ToString(),
                        MobileNo = row["MobileNo"].ToString(),
                        Gender = row["Gender"].ToString(),
                        DOB = row["DOB"].ToString(),
                        ProfileID = row["ProfileID"].ToString(),
                        CollegeRegistrationNo = row["CollegeRegistrationNo"].ToString(),
                        CollegeName = row["CollegeName"].ToString(),
                        Status = row["Status"].ToString()
                    });
                }
            }

            return list;
        }
        public string DeleteInstituteManagementDetails(InstituteManagementDetailsEntity entity)
        {
            var param = new Dictionary<string, object>();
            param.Add("@InstituteID", entity.InstituteID);
            param.Add("@ID", entity.ID);
            param.Add("@ManagementType", entity.ManagementType);
            param.Add("@User", entity.CreateBy);
            param.Add("@UserIpAddress", entity.IPAddress);

            string result = _dbAccess.ExecuteScalar("Institute_DeleteInstituteManagementDetails", param).ToString();
            return result;
        }
        public string SaveInstituteManagementDetails(InstituteManagementDetailsEntity entity)
        {
            var param = new Dictionary<string, object>();
            param.Add("@InstituteID", entity.InstituteID);
            param.Add("@StaffID", entity.StaffID);
            param.Add("@ManagementType", entity.ManagementType);
            param.Add("@User", entity.CreateBy);
            param.Add("@UserIpAddress", entity.IPAddress);

            string result = _dbAccess.ExecuteScalar("Institute_InsertInstituteManagementDetails", param).ToString();
            return result;
            if (result != null && result.ToString() != "Y")
            {
                return "Y";
            }
            else
            {
                return "N";
            }
        }
        public DataTable GetInstituteProfileStatus(Int64 InstituteID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@InstituteID", InstituteID);

            return _dbAccess.GetDataTable("usp_GetInstituteProfileStatus", param);
        }


        // Inspection Units
        public DataSet GetInspectionUnitDetails_ExistingInstitute(long InstituteId, int? approvalIDFlag)
        {
            var param = new Dictionary<string, object>();
            param.Add("@InstituteId", InstituteId);
            param.Add("@ApprovalIDFlag", approvalIDFlag);
            return _dbAccess.GetDataSet("Institute_GetProposedCourseUnitDetailsForInspectionUnits", param);
        }

        public DataTable UpdateProposedCourseUnitDetailsForInspectionUnits(long instituteId, string proposedCourseXml, string createdBy, string ipAddress)
        {
            var param = new Dictionary<string, object>();
            param.Add("@InstituteID", instituteId);
            param.Add("@ProposedCourse", proposedCourseXml);
            param.Add("@CreatedBy", createdBy);
            param.Add("@IpAddress", ipAddress);

            return _dbAccess.GetDataTable("Institute_UpdateProposedCourseUnitDetailsForInspectionUnits", param);
        }

        //requirement institution funding summary

        public DataSet GetRequirementInstitutionFundingDetails(string financialYear, int? stateID, int? districtID, int? talukaID, string Status, int? RegionID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@FinancialYear", string.IsNullOrEmpty(financialYear) ? DBNull.Value : (object)financialYear);
            param.Add("@StateID", stateID.HasValue ? (object)stateID.Value : DBNull.Value);
            param.Add("@DistrictID", districtID.HasValue ? (object)districtID.Value : DBNull.Value);
            param.Add("@TalukaID", talukaID.HasValue ? (object)talukaID.Value : DBNull.Value);
            param.Add("@Status", string.IsNullOrEmpty(Status) ? DBNull.Value : (object)Status);
            param.Add("@RegionID", RegionID.HasValue ? (object)RegionID.Value : DBNull.Value);



            return _dbAccess.GetDataSet("usp_GetInstitutionFundingDetails_AllInstitutes", param);
        }



        //inspection request 
        public DataTable CheckInspectionEligibility(InstituteInput entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity), "Institute input cannot be null");

            var param = new Dictionary<string, object>
            {
                { "@InstituteId", entity.InstituteID },
                { "@UserLoginId", entity.UserLoginID ?? (object)DBNull.Value }
            };

            return _dbAccess.GetDataTable("Institute_CheckInspectionEligibility", param);
        }


        public DataTable RequestInspection(InspectionRequestEntity entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity), "Request entity cannot be null");

            var param = new Dictionary<string, object>
            {
                { "@InstituteId", entity.InstituteID },
                { "@UserLoginId", entity.UserLoginID ?? (object)DBNull.Value },
                { "@IPAddress", entity.IPAddress ?? (object)DBNull.Value },
                { "@Remarks", entity.Remarks ?? (object)DBNull.Value }
            };

            return _dbAccess.GetDataTable("Institute_RequestInspection", param);
        }


        public DataTable WithdrawInspection(InspectionRequestEntity entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity), "Withdraw entity cannot be null");

            var param = new Dictionary<string, object>
            {
                { "@InstituteId", entity.InstituteID },
                { "@UserLoginId", entity.UserLoginID ?? (object)DBNull.Value },
                { "@IPAddress", entity.IPAddress ?? (object)DBNull.Value },
                { "@WithdrawReason", entity.Remarks ?? (object)DBNull.Value }
            };

            return _dbAccess.GetDataTable("Institute_WithdrawInspection ", param);
        }


        public DataTable SubmitInspectionRequest(InspectionRequestEntity entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity), "Submit entity cannot be null");

            var param = new Dictionary<string, object>
            {
                { "@InstituteId", entity.InstituteID },
                { "@UserLoginId", entity.UserLoginID ?? (object)DBNull.Value },
                { "@IPAddress", entity.IPAddress ?? (object)DBNull.Value },
                { "@Remarks", entity.Remarks ?? (object)DBNull.Value }
            };

            return _dbAccess.GetDataTable("DVETO_SubmitInspectionRequest", param);
        }
        public DataTable WithdrawInspectionRequest(InspectionRequestEntity entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity), "Submit entity cannot be null");

            var param = new Dictionary<string, object>
            {
                { "@InstituteId", entity.InstituteID },
                { "@UserLoginId", entity.UserLoginID ?? (object)DBNull.Value },
                { "@IPAddress", entity.IPAddress ?? (object)DBNull.Value },
                { "@Remarks", entity.Remarks ?? (object)DBNull.Value }
            };

            return _dbAccess.GetDataTable("DVETO_WithdrawInspectionRequest", param);
        }

        //promoter type details 
        public DataTable GetInstitute_PromoterTypeByInstituteID(long instituteId, int managementType)
        {
            var param = new Dictionary<string, object>();
            param.Add("@InstituteID", instituteId);
            param.Add("@PromoterTypeID", managementType);

            return _dbAccess.GetDataTable("Institute_GetInstitute_PromoterTypeByInstituteID", param);
        }

        // dashboard for LOI approved institutes
        public DataSet GetInstituteDashboard(long? instituteId, string instituteCode)
        {
            var param = new Dictionary<string, object>();

            param.Add("@InstituteId", instituteId.HasValue ? (object)instituteId.Value : DBNull.Value);
            param.Add("@InstituteCode", !string.IsNullOrEmpty(instituteCode) ? (object)instituteCode : DBNull.Value);

            return _dbAccess.GetDataSet("InstituteSDI_GetInstituteDash", param);
        }

        // temp institute dashboard 
        public DataSet GetTempInstituteDashboard(long tempInstituteId)
        {
            var param = new Dictionary<string, object>();

            param.Add("@TempInstituteId", tempInstituteId);

            return _dbAccess.GetDataSet("Dashboard_GetTempInstituteDashBoard", param);
        }

        //Search SDI Inspection 
        public DataTable SearchSDIInspection(Int32 DistrictID, Int32 TalukaID, Int32 RegionID, string FormStatus, Int64 InstituteID, Int64 userID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@DistrictID", DistrictID);
            param.Add("@TalukaID", TalukaID);
            param.Add("@RegionID", RegionID);
            param.Add("@FormStatus", FormStatus);
            param.Add("@InstituteID", InstituteID);
            param.Add("@userID", userID);

            return _dbAccess.GetDataTable("InstituteSDI_ScheduleInspection", param);
        }


        public DataTable SearchInstituteSDIInspection(int DistrictID, int TalukaID, int RegionID, string FormStatus, long InstituteID, long userID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@DistrictID", DistrictID);
            param.Add("@TalukaID", TalukaID);
            param.Add("@RegionID", RegionID);
            param.Add("@FormStatus", FormStatus);
            param.Add("@InstituteID", InstituteID);
            param.Add("@userID", userID);


            return _dbAccess.GetDataTable("InstituteSDI_Inspection", param);
        }
        public DataTable SecretaryInstituteSDIInspection(int DistrictID, int TalukaID, int RegionID, string FormStatus, long InstituteID, long userID, int ResultTypeID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@DistrictID", DistrictID);
            param.Add("@TalukaID", TalukaID);
            param.Add("@RegionID", RegionID);
            param.Add("@FormStatus", FormStatus);
            param.Add("@InstituteID", InstituteID);
            param.Add("@userID", userID);
            param.Add("@ResultTypeID", ResultTypeID);



            return _dbAccess.GetDataTable("Secretary_InstituteSDI_Inspection", param);
        }

        public DataTable SecretaryInstituteSDIAffiliatio(int DistrictID, int TalukaID, int RegionID, string FormStatus, long InstituteID, long userID, int ResultTypeID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@DistrictID", DistrictID);
            param.Add("@TalukaID", TalukaID);
            param.Add("@RegionID", RegionID);
            param.Add("@FormStatus", FormStatus);
            param.Add("@InstituteID", InstituteID);
            param.Add("@userID", userID);
            param.Add("@ResultTypeID", ResultTypeID);


            return _dbAccess.GetDataTable("Secretary_InstituteAffiliation_Dashboard", param);
        }


        public DataTable DVETOSubmittedInstituteSDIInspection(int DistrictID, int TalukaID, int RegionID, string FormStatus, long InstituteID, long userID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@DistrictID", DistrictID);
            param.Add("@TalukaID", TalukaID);
            param.Add("@RegionID", RegionID);
            param.Add("@FormStatus", FormStatus);
            param.Add("@InstituteID", InstituteID);
            param.Add("@userID", userID);


            return _dbAccess.GetDataTable("DVETO_Submitted_InstituteSDI_Inspection", param);
        }
        public DataSet GetShortTermApprovedCourseUnitDetails(InstituteInputEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@InstituteID", entity.InstituteId);
            param.Add("@ExitInstituteID", entity.ExitInstituteID);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@PageCode", entity.PageCode);
            param.Add("@CourseID", entity.ItemId);

            return _dbAccess.GetDataSet("Institute_GetShortTermApprovedCourseUnitDetails", param);
        }


        public DataSet GetSTTCourseUnitDetailsForApprovalByCoureseID(InstituteInputEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@InstituteID", entity.InstituteId);
            param.Add("@ExitInstituteID", entity.ExitInstituteID);
            //param.Add("@UserLoginID", entity.UserLoginID);
            //param.Add("@PageCode", entity.PageCode);
            param.Add("@CourseID", entity.ItemId);

            return _dbAccess.GetDataSet("STT_Institute_GetCourseUnitDetailsForApprovalByCoureseID", param);
        }

        //public string SaveShortTermProposedCourseUnitDetails(ProposedCourseUnitDetailsEntity entity)
        //{
        //    var param = new Dictionary<string, object>();

        //    param.Add("@InstituteID", entity.InstituteId);
        //    param.Add("@CourseId", entity.CourseId);
        //    param.Add("@ProposedUnits", entity.ProposedUnits);
        //    param.Add("@ApprovedUnits", entity.ApprovedUnits);
        //    param.Add("@TotalUnits", entity.TotalUnits);
        //    param.Add("@UserLoginID", entity.UserLoginID);
        //    param.Add("@IPAddress", entity.IPAddress);

        //    return _dbAccess.ExecuteScalar("Institute_SaveShortTermProposedCourseUnitDetails", param).ToString();
        //}

        public DataSet GetShortTermProposedCourseUnitDetails(InstituteInputEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@InstituteID", entity.InstituteId);
            param.Add("@ExitInstituteID", entity.ExitInstituteID);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@PageCode", entity.PageCode);
            param.Add("@CourseID", entity.ItemId);

            return _dbAccess.GetDataSet("Institute_GetShortTermProposedCourseUnitDetails", param);
        }


        public DataTable GetShortTermApprovedCourseFees(InstituteInputEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@InstituteID", entity.InstituteId);
            param.Add("@ExitInstituteID", entity.ExitInstituteID);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@PageCode", entity.PageCode);
            param.Add("@CourseID", entity.ItemId);

            return _dbAccess.GetDataTable("Institute_GetShortTermApprovedCourseFees", param);
        }




        //inspection page 
        public DataTable GetInstituteInspectionDash(long instituteId, string pageCode, int UserTypeID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@InstituteId", instituteId);
            param.Add("@PageCode", pageCode);
            param.Add("@UserTypeID", UserTypeID);


            return _dbAccess.GetDataTable("Inspection_GetInstituteDash", param);
        }

        public string UpdateInstituteInspectionVerificationStatus(InspectionVerificationEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@InstituteID", entity.InstituteID);
            param.Add("@Remark", entity.Remark);
            param.Add("@Status", entity.Status);
            param.Add("@PageCode", entity.PageCode);
            param.Add("@CreatedBy", entity.CreatedBy);
            param.Add("@IpAddress", entity.IpAddress);
            param.Add("@UserTypeID", entity.UserTypeID);

            return _dbAccess.ExecuteScalar(
                "Inspection_UpdateInstituteVerificationStatus",
                param
            ).ToString();
        }


        public DataTable SearchInstitutes(Int32 DistrictID, Int32 TalukaID, Int32 RegionID, string FormStatus, Int64 InstituteID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@DistrictID", DistrictID);
            param.Add("@TalukaID", TalukaID);
            param.Add("@RegionID", RegionID);
            param.Add("@FormStatus", FormStatus);
            param.Add("@InstituteID", InstituteID);

            return _dbAccess.GetDataTable("InstituteVerification_SearchInstitutes", param);
        }
        public DataTable SearchSDILOI(Int32 DistrictID, Int32 TalukaID, Int32 RegionID, string FormStatus, Int64 InstituteID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@DistrictID", DistrictID);
            param.Add("@TalukaID", TalukaID);
            param.Add("@RegionID", RegionID);
            param.Add("@FormStatus", FormStatus);
            param.Add("@InstituteID", InstituteID);

            return _dbAccess.GetDataTable("InstituteSDI_SearchSDILOIInstitute", param);
        }
        public DataTable GetProposedCourseofGroupCourseApprovalGroupWise(Int32 ApprovalGroupID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@ApprovalGroupID", ApprovalGroupID);
            return _dbAccess.GetDataTable("Institute_GetProposedCourseofGroupCourseApprovalGroupWise", param);

        }
        public string SaveCourseTrainingFee(string actionType, int? id, string trainingFeeID,
                               decimal? withPlacement, decimal? withoutPlacement,
                               string userName, string userIpAddress)
        {
            var param = new Dictionary<string, object>();
            param.Add("@ActionType", actionType);
            param.Add("@ID", (object)id ?? DBNull.Value);
            param.Add("@TrainingFeeID", trainingFeeID ?? (object)DBNull.Value);
            param.Add("@WithPlacement", withPlacement ?? (object)DBNull.Value);
            param.Add("@WithoutPlacement", withoutPlacement ?? (object)DBNull.Value);
            param.Add("@UserName", userName ?? (object)DBNull.Value);
            param.Add("@UserIpAddress", userIpAddress ?? (object)DBNull.Value);

            return _dbAccess.ExecuteScalar("sp_STT_SaveCourseTrainingFee", param).ToString();
        }





        public DataSet GetInstituteDash(Int64 InstituteID, string InstituteCode)
        {
            var param = new Dictionary<string, object>();
            param.Add("@InstituteId", InstituteID);
            param.Add("@InstituteCode", InstituteCode);
            return _dbAccess.GetDataSet("InstituteSDI_GetInstituteDash", param);
        }

        public string UpdateInstituteVerificationStatus(Int64 InstituteID, string Remark, string Status, string Pagecode, string CreatedBy, string IpAddress)
        {
            var param = new Dictionary<string, object>();

            param.Add("@InstituteID", InstituteID);
            param.Add("@Remark", Remark);
            param.Add("@Status", Status);
            param.Add("@Pagecode", Pagecode);
            param.Add("@CreatedBy", CreatedBy);
            param.Add("@IpAddress", IpAddress);

            return _dbAccess.ExecuteScalar("Institute_UpdateInstituteVerificationStatus", param).ToString();
        }
        public string UpdateProposedCourseUnitDetails(Int64 InstituteID, string ProposedCourseXml, string CreatedBy, string IpAddress)
        {
            var param = new Dictionary<string, object>();

            param.Add("@InstituteID", InstituteID);
            param.Add("@ProposedCourse", ProposedCourseXml);
            param.Add("@CreatedBy", CreatedBy);
            param.Add("@IpAddress", IpAddress);

            return _dbAccess.ExecuteScalar("Institute_UpdateProposedCourseUnitDetails", param).ToString();
        }

        public DataTable GetBatchDetailsByInstitute(Int64 InstituteID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@CollegeID", InstituteID);
            return _dbAccess.GetDataTable("Institute_GetBatchDetailsByInstitute", param);

        }
        public bool IsCourseEligibleForApplication(Int64 CourseID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@CourseId", CourseID);
            return Convert.ToBoolean(_dbAccess.ExecuteScalar("Institute_IsCourseEligibleForApplication", param));
        }





        // ── Election Duty ─────────────────────────────────────

        // ── Get Election Duty List ────────────────────────────
        public DataSet GetElectionDutyList(int UserID)
        {
            var param = new Dictionary<string, object>
            {
                { "@UserID", UserID }
            };
            return _dbAccess.GetDataSet("SP_Get_ElectionDutyList", param
               );
        }

        // ── Get Constituencies by District ───────────────────
        public DataSet GetConstituencyByDistrict(int districtID)
        {
            var param = new Dictionary<string, object>
            {
                { "@DistrictID", districtID }
            };
            return _dbAccess.GetDataSet("SP_Get_ConstituencyByDistrict", param);
        }

        // ── Save Staff + Deputations ──────────────────────────
        // SP returns: DataTable with Status, Message, ElectionDutyStaffID
        public string SaveElectionDutyStaff(ElectionDutyStaffEntity entity)
        {
            // Build XML: <Deputations>
            //   <Dep From="yyyy-MM-dd" To="yyyy-MM-dd"
            //        DistrictID="1" ConstituencyID="1" Nature="Full Time"/>
            // </Deputations>
            var xml = new StringBuilder("<Deputations>");
            foreach (var dep in entity.Deputations)
            {
                string from = ConvertToSqlDate(dep.DeputationFrom);
                string to = ConvertToSqlDate(dep.DeputationTo);
                xml.Append($"<Dep From=\"{from}\"  " +
                            $"{(!string.IsNullOrWhiteSpace(to) ? $"To=\"{to}\" " : "")}" +
                            $"DistrictID=\"{dep.DistrictID}\" " +
                            $"ConstituencyID=\"{dep.ConstituencyID}\" " +
                            $"Nature=\"{dep.NatureOfDeputation}\" />");
            }
            xml.Append("</Deputations>");

            var param = new Dictionary<string, object>
            {
                 { "@UserID",        entity.UserID     },
                { "@StaffID",        entity.StaffID     },
                { "@Designation",    entity.Designation },
                { "@DeputationsXML", xml.ToString()     },
                { "@CreatedBy",      entity.CreatedBy   },
                { "@IPAddress",      entity.IPAddress   }
            };

            DataTable dt = _dbAccess.GetDataTable("SP_Save_ElectionDutyStaff", param);

            if (dt != null && dt.Rows.Count > 0)
            {
                string status = dt.Rows[0]["Status"]?.ToString();
                string message = dt.Rows[0]["Message"]?.ToString();
                return status == "Success" ? "Success" : message;
            }

            return "Error";
        }

        // ── Update single Deputation ──────────────────────────
        // SP returns: DataTable with Status, Message
        public string UpdateElectionDutyDeputation(ElectionDutyDeputationEntity entity)
        {
            var param = new Dictionary<string, object>
            {
                { "@DeputationID",       entity.DeputationID                     },
                { "@DeputationFrom",     ConvertToSqlDate(entity.DeputationFrom) },
                { "@DeputationTo",       ConvertToSqlDate(entity.DeputationTo)   },
                { "@DistrictID",         entity.DistrictID                       },
                { "@ConstituencyID",     entity.ConstituencyID                   },
                { "@NatureOfDeputation", entity.NatureOfDeputation                },
                { "@ModifiedBy",         entity.ModifiedBy                       },
                { "@IPAddress",          entity.IPAddress                        }
            };

            DataTable dt = _dbAccess.GetDataTable("SP_Update_ElectionDutyDeputation", param);

            if (dt != null && dt.Rows.Count > 0)
            {
                string status = dt.Rows[0]["Status"]?.ToString();
                string message = dt.Rows[0]["Message"]?.ToString();
                return status == "Success" ? "Success" : message;
            }

            return "Error";
        }

        // ── Delete Staff + all Deputations ───────────────────
        // SP returns: DataTable with Status, Message
        public string DeleteElectionDutyStaff(DeleteElectionDutyStaffEntity entity)
        {
            var param = new Dictionary<string, object>
            {
                { "@ElectionDutyStaffID", entity.ElectionDutyStaffID },
                { "@DeletedBy",           entity.DeletedBy           },
                { "@IPAddress",           entity.IPAddress           }
            };

            DataTable dt = _dbAccess.GetDataTable("SP_Delete_ElectionDutyStaff", param);

            if (dt != null && dt.Rows.Count > 0)
            {
                string status = dt.Rows[0]["Status"]?.ToString();
                string message = dt.Rows[0]["Message"]?.ToString();
                return status == "Success" ? "Success" : message;
            }

            return "Error";
        }

        // ── Delete single Deputation ──────────────────────────
        // SP returns: DataTable with Status, Message
        public string DeleteElectionDutyDeputation(DeleteElectionDutyDeputationEntity entity)
        {
            var param = new Dictionary<string, object>
            {
                { "@DeputationID", entity.DeputationID },
                { "@DeletedBy",    entity.DeletedBy    },
                { "@IPAddress",    entity.IPAddress    }
            };

            DataTable dt = _dbAccess.GetDataTable("SP_Delete_ElectionDutyDeputation", param);

            if (dt != null && dt.Rows.Count > 0)
            {
                string status = dt.Rows[0]["Status"]?.ToString();
                string message = dt.Rows[0]["Message"]?.ToString();
                return status == "Success" ? "Success" : message;
            }

            return "Error";
        }

        // ── Helper: convert dd/mm/yyyy → yyyy-MM-dd ──────────
        private string ConvertToSqlDate(string ddmmyyyy)
        {
            if (string.IsNullOrWhiteSpace(ddmmyyyy)) return null;
            var parts = ddmmyyyy.Split('/');
            if (parts.Length == 3)
                return $"{parts[2]}-{parts[1]}-{parts[0]}";
            return ddmmyyyy; // already in correct format
        }



        //REPORT 
        public DataSet Report_GetElectionDutyList(
            int RegionID,
            int DistrictID
          , int TalukaID,
            int StaffID)
        {
            var param = new Dictionary<string, object>
            {
                { "@RegionID", RegionID   },
                { "@DistrictID", DistrictID },
                { "@TalukaID", TalukaID   },
                { "@StaffID", StaffID   }
            };
            return _dbAccess.GetDataSet("SP_Get_ElectionDutyReport", param
               );
        }

        public DataTable Institute_GetCourseInspectionFeeDetails(int InstituteID, int CourseID, int ApprovalID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@InstituteID", InstituteID);
            param.Add("@CourseID", CourseID);
            param.Add("@ApprovalID", ApprovalID);
            return _dbAccess.GetDataTable("Institute_GetCourseInspectionFeeDetails", param);

        }
        public DataTable Institute_GetCourseSecurityFeeDetails(int InstituteID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@InstituteID", InstituteID);
            //param.Add("@CourseID", CourseID);
            //param.Add("@ApprovalID", ApprovalID);
            return _dbAccess.GetDataTable("Institute_GetCourseSecurityFeeDetails", param);

        }




        //verification by board 
        public DataTable CheckVerificationEligibility(InstituteInput entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity), "Institute input cannot be null");

            var param = new Dictionary<string, object>
    {
        { "@InstituteId", entity.InstituteID }
    };

            return _dbAccess.GetDataTable("Secretary_CheckVerificationEligibility", param);
        }

        public DataTable RequestVerification(InspectionRequestEntity entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity), "Request entity cannot be null");

            var param = new Dictionary<string, object>
    {
        { "@InstituteId", entity.InstituteID },
        { "@UserLoginId", entity.UserLoginID ?? (object)DBNull.Value },
        { "@IPAddress", entity.IPAddress ?? (object)DBNull.Value },
        { "@Remarks", entity.Remarks ?? (object)DBNull.Value }
    };

            return _dbAccess.GetDataTable("Secretary_SubmitVerificationRequest", param);
        }

        public DataTable WithdrawVerification(InspectionRequestEntity entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity), "Withdraw entity cannot be null");

            var param = new Dictionary<string, object>
    {
        { "@InstituteId", entity.InstituteID },
        { "@UserLoginId", entity.UserLoginID ?? (object)DBNull.Value },
        { "@IPAddress", entity.IPAddress ?? (object)DBNull.Value },
        { "@Remarks", entity.Remarks ?? (object)DBNull.Value }
    };

            return _dbAccess.GetDataTable("Secretary_WithdrawVerificationRequest", param);
        }


        public string SDI_GenerateInstituteCode(Int64 InstituteID, string MSBVCollegeID, string IpAddress)
        {
            var param = new Dictionary<string, object>();

            param.Add("@InstituteID", InstituteID);
            param.Add("@MSBVCollegeID", MSBVCollegeID);
            param.Add("@IpAddress", IpAddress);

            DataTable dt = _dbAccess.GetDataTable("SDI_GenerateInstituteCode", param);

            if (dt != null && dt.Rows.Count > 0)
            {
                //int status = Convert.ToInt32(dt.Rows[0]["Status"]);
                string status = dt.Rows[0]["Status"]?.ToString();
                string message = dt.Rows[0]["Message"]?.ToString();

                // Success
                if (status == "Y" || status == "1")
                {
                    return "Y";
                }

                // Return SP error message
                return message;
            }

            return "Data has not been saved. Please try again.";

            //return _dbAccess.ExecuteScalar("SDI_GenerateInstituteCode", param).ToString();
        }

        public DataTable SDI_GetInstituteCodeDetails(int InstituteID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@InstituteID", InstituteID);
            //param.Add("@CourseID", CourseID);
            // param.Add("@ApprovalID", ApprovalID);
            return _dbAccess.GetDataTable("SDI_GetInstituteCodeDetails", param);

        }



        public DataTable SecretaryDVETOInstituteStatus(int DistrictID, int TalukaID, int RegionID, string FormStatus, long InstituteID, int ResultTypeID, long userID = -1)
        {
            var param = new Dictionary<string, object>();

            param.Add("@DistrictID", DistrictID);
            param.Add("@TalukaID", TalukaID);
            param.Add("@RegionID", RegionID);
            param.Add("@FormStatus", FormStatus);
            param.Add("@InstituteID", InstituteID);
            param.Add("@ResultTypeID", ResultTypeID);
            param.Add("@userID", userID);

            return _dbAccess.GetDataTable("Secretary_DVETO_InstituteStatusReport", param);
        }



        public DataSet GetApprovalOrdersByYear(int Year)
        {
            var param = new Dictionary<string, object>();
            param.Add("@Year", Year);

            return _dbAccess.GetDataSet("usp_GetApprovalOrdersByYear", param);
        }

        public DataSet SaveCourseApprovalOrder(SaveCourseApprovalOrderEntity entity)
        {
            var param = new Dictionary<string, object>();
            param.Add("@CollegeID", entity.CollegeID);
            param.Add("@CourseID", entity.CourseID);
            param.Add("@ApprovalOrderID", entity.ApprovalOrderID);
            param.Add("@EffectiveDate", entity.EffectiveDate);
            param.Add("@UnitCode", entity.UnitCode);

            return _dbAccess.GetDataSet("usp_SaveCourseApprovalOrder", param);
        }

        public DataSet GetCourseDetailsWithApprovalOrder(long CollegeID, string IpAddress)
        {
            var param = new Dictionary<string, object>();
            param.Add("@CollegeID", CollegeID);
            param.Add("@IpAddress", IpAddress);

            _dbAccess.ExecuteNonQuery(
        "usp_GenerateCourseUnitDetails",
        param
    );

            return _dbAccess.GetDataSet("usp_GetCourseDetailsWithApprovalOrder", param);
        }

        //
        public string SaveGreenFieldRequirement(
    GreenFieldRequirementEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@InstituteID", entity.InstituteID);
            param.Add("@CourseID", entity.CourseID);
            param.Add("@FinancialYearID", entity.FinancialYearID);
            param.Add("@ProposedUnitForGreenReq",
                entity.ProposedUnitForGreenReq);
            param.Add("@ApprovedUnit", entity.ApprovedUnit);
            param.Add("@UserLoginId", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);

            return _dbAccess
                .ExecuteScalar(
                    "Institute_SaveGreenFieldRequirement",
                    param)
                .ToString();
        }

        public DataSet GetGreenFieldRequirement(
    InstituteInputEntityForGreen entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@InstituteID", entity.InstituteId);
            param.Add("@FinancialYearID", entity.FinancialYearID);

            return _dbAccess.GetDataSet(
                "Institute_GetGreenFieldRequirement",
                param);
        }

        public string SaveStatusGreenRequirement(
    StatusGreenRequirementRequest entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@InstituteID", entity.InstituteID);
            param.Add("@YearID", entity.YearID);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);
            param.Add("@FormStatus", entity.FormStatus);

            return _dbAccess
                .ExecuteScalar(
                    "Institute_SaveStatusGreenRequirement",
                    param)
                .ToString();
        }


        public DataTable GetStatusGreenRequirement(
            InstituteInputEntityForGreen entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@InstituteID", entity.InstituteId);
            param.Add("@YearID", entity.FinancialYearID);

            return _dbAccess.GetDataTable(
                "Institute_GetStatusGreenRequirement",
                param);
        }
        public string UnlockStatusGreenRequirement(
    StatusGreenRequirementRequest entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@InstituteID", entity.InstituteID);
            param.Add("@YearID", entity.YearID);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);
            // param.Add("@FormStatus", entity.FormStatus);

            return _dbAccess
                .ExecuteScalar(
                    "Institute_UnlockStatusGreenRequirement",
                    param)
                .ToString();
        }


        public string SaveGreenFieldRequirementBulk(
        GreenFieldRequirementBulkEntity entity)
        {
            var table = new DataTable();

            table.Columns.Add(
                "CourseID",
                typeof(long));

            table.Columns.Add(
                "ApprovedUnit",
                typeof(int));

            table.Columns.Add(
                "ProposedUnitForGreenReq",
                typeof(int));

            foreach (var row in entity.Rows)
            {
                table.Rows.Add(
                    row.CourseID,
                    row.ApprovedUnit,
                    row.ProposedUnitForGreenReq
                );
            }

            var param = new Dictionary<string, object>();

            param.Add(
                "@InstituteID",
                entity.InstituteID);

            param.Add(
                "@FinancialYearID",
                entity.FinancialYearID);

            param.Add(
                "@UserLoginId",
                entity.UserLoginID);

            param.Add(
                "@IPAddress",
                entity.IPAddress);

            param.Add(
                "@Rows",
                table);

            return _dbAccess
                .ExecuteScalar(
                    "Institute_SaveGreenFieldRequirementBulk",
                    param)
                ?.ToString() ?? "N";
        }


        public DataTable GetCourseRenewalDetails(int CollegeID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@CollegeID", CollegeID);
            //param.Add("@CourseID", CourseID);
            // param.Add("@ApprovalID", ApprovalID);
            return _dbAccess.GetDataTable("Institute_GetCourseRenewalDetails", param);

        }
    }
}
