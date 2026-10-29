using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Net;
using System.Text;
using Portal.Data.Source;
using Portal.Entities;
using Newtonsoft.Json;
using Portal.Entities.MasterMgmt;


namespace Portal.Data
{
    public partial class Repository
    {
        public string SaveCourse(NewCourseEntity courseEntity, string CreatedBy, string CreatedByIPAddress)
        {
            var param = new Dictionary<string, object>();

            param.Add("@SectorID", courseEntity.SectorID);
            param.Add("@SubSectorID", courseEntity.SubSectorID);
            param.Add("@CourseApprovedByID", courseEntity.CourseApprovedByID);
            param.Add("@CourseCode", courseEntity.CourseCode);
            param.Add("@CourseName", courseEntity.CourseName);
            param.Add("@CourseNameDisplay", courseEntity.CourseNameDisplay);
            param.Add("@TrainingModeConventional", courseEntity.TrainingModeConventional);
            param.Add("@TrainingModeDualSystem", courseEntity.TrainingModeDualSystem);
            param.Add("@TrainingModeBlended", courseEntity.TrainingModeBlended);
            param.Add("@TrainingModeOnline", courseEntity.TrainingModeOnline);
            param.Add("@TrainingModeAllMode", courseEntity.TrainingModeAllMode);
            param.Add("@CourseCategoryID", courseEntity.CourseCategoryID);
            param.Add("@CourseTypeID", courseEntity.CourseTypeID);
            param.Add("@Duration", courseEntity.Duration);
            param.Add("@CourseDurationunit", courseEntity.CourseDurationunit);
            param.Add("@Hours", courseEntity.Hours);
            param.Add("@MaxBatchPerDay", courseEntity.MaxBatchPerDay);
            param.Add("@NSQFLevelID", courseEntity.NSQFLevelID);
            param.Add("@TrainingFeeID", courseEntity.TrainingFeeID);
            param.Add("@MinAge", courseEntity.MinAge);
            param.Add("@IntakePerUnit", courseEntity.IntakePerUnit);
            param.Add("@MinimumEntryQualificationEntity", GetXML(courseEntity.MinimumEntryQualificationEntity));
            param.Add("@BoardCoursesDuration", courseEntity.BoardCoursesDuration);
            param.Add("@BoardCoursesDurationUnitID ", courseEntity.BoardCoursesDurationUnitID);
            param.Add("@WorkshopFloorPreference", courseEntity.WorkshopFloorPreference);
            param.Add("@WorkshopSpaceRequired", courseEntity.WorkshopSpaceRequired);
            param.Add("@PowerType", courseEntity.PowerType);
            param.Add("@PowerInKW", courseEntity.PowerInKW);
            param.Add("@SeparateClassRoomRequired", courseEntity.SeparateClassRoomRequired);
            param.Add("@ClassRoomArea", courseEntity.ClassRoomArea);
            param.Add("@ClassUtilizationperweekinHours", courseEntity.ClassUtilizationperweekinHours);
            param.Add("@SeparateDrawingHallRequired", courseEntity.SeparateDrawingHallRequired);
            param.Add("@DrawingRoomArea", courseEntity.DrawingRoomArea);
            param.Add("@DrawingUtilizationperweekinHours", courseEntity.DrawingUtilizationperweekinHours);
            param.Add("@SeparateComputerLabRequired", courseEntity.SeparateComputerLabRequired);
            param.Add("@ComputerLabArea", courseEntity.ComputerLabArea);
            param.Add("@ComputerLabUtilizationperweekinHours", courseEntity.ComputerLabUtilizationperweekinHours);
            param.Add("@SeparateAgricultureLandRequired", courseEntity.SeparateAgricultureLandRequired);
            param.Add("@AgricultureLandArea", courseEntity.AgricultureLandArea);
            param.Add("@AgricultureLandUtilizationperweekinHours", courseEntity.AgricultureLandUtilizationperweekinHours);
            param.Add("@SeparateOpenGroundRequired", courseEntity.SeparateOpenGroundRequired);
            param.Add("@OpenGroundArea", courseEntity.OpenGroundArea);
            param.Add("@OpenGroundUtilizationperweekinHours", courseEntity.OpenGroundUtilizationperweekinHours);
            param.Add("@InspectionFees", courseEntity.InspectionFees);
            param.Add("@SecurityDeposit", courseEntity.SecurityDeposit);
            param.Add("@RenewalFees", courseEntity.RenewalFees);
            param.Add("@SyllabusVersion", courseEntity.SyllabusVersion);
            param.Add("@ModelCurriculumUrl", courseEntity.ModelCurriculumUrl);
            param.Add("@QualificationPackUrl", courseEntity.QualificationPackUrl);
            param.Add("@trainingInfrastructureEntities", GetXML(courseEntity.trainingInfrastructureEntities));
            param.Add("@CreatedBy", CreatedBy);
            param.Add("@CreatedByIPAddress", CreatedByIPAddress);

            param.Add("@TheoryDuration", courseEntity.TheoryDuration);
            param.Add("@PracticalDuration", courseEntity.PracticalDuration);
            param.Add("@OJTMandatoryDuration", courseEntity.OJTMandatoryDuration);
            param.Add("@OJTOptionalDuration", courseEntity.OJTOptionalDuration);
            param.Add("@TotalDuration", courseEntity.TotalDuration);
            param.Add("@TheoryBoardDuration", courseEntity.TheoryBoardDuration);
            param.Add("@TheoryBoardDurationunit", courseEntity.TheoryBoardDurationunit);

            param.Add("@PracticalBoardDuration", courseEntity.PracticalBoardDuration);
            param.Add("@PracticalBoardDurationunit", courseEntity.PracticalBoardDurationunit);
            param.Add("@OJTMandatoryBoardDuration", courseEntity.OJTMandatoryBoardDuration);
            param.Add("@OJTMandatoryBoardDurationunit", courseEntity.OJTMandatoryBoardDurationunit);
            param.Add("@OJTOptionalBoardDuration", courseEntity.OJTOptionalBoardDuration);
            param.Add("@OJTOptionalBoardDurationunit", courseEntity.OJTOptionalBoardDurationunit);
            param.Add("@TotalBoardDuration", courseEntity.TotalBoardDuration);
            param.Add("@TotalBoardDurationunit", courseEntity.TotalBoardDurationunit);

            param.Add("@BoardShare", courseEntity.BoardShare);
            param.Add("@SAIShare", courseEntity.SAIShare);
            param.Add("@ExamAssesmentFee", courseEntity.ExamAssesmentFee);
            param.Add("@ExamTypeID", courseEntity.ExamTypeID);
            param.Add("@ApprovalGroupID", courseEntity.ApprovalGroupID);
            param.Add("@AdmissionFees", courseEntity.AdmissionFees);
            return _dbAccess.ExecuteScalar("MasterMgmt_SaveCourseDetails", param).ToString();
        }
        public DataSet GetCourseByID(Int64 CourseID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@CourseID", CourseID);
            return _dbAccess.GetDataSet("MasterMgmt_GetCourseByID", param);
        }

        public DataTable GetTimeTableForEdit(Int64 CourseID, int ExaminationID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@CourseID", CourseID);
            param.Add("@ExaminationID", ExaminationID);
            return _dbAccess.GetDataTable("Base_GetTimeTableForEdit", param);
        }

        public string UpdateCourseDisplayAdmissionNewUnit(Int64 CourseID, string UpdateCol, string Value)
        {
            var param = new Dictionary<string, object>();
            param.Add("@CourseID", CourseID);
            param.Add("@UpdateCol", UpdateCol);
            param.Add("@Value", Value);
            return _dbAccess.ExecuteNonQuery("MasterMgmt_UpdateCourseDisplayAdmissionNewUnit", param).ToString();
        }

         
        
    }
}
