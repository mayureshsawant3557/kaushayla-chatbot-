using Microsoft.SqlServer.Server;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Runtime.ConstrainedExecution;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using System.Web;

namespace Portal.Entities.MasterMgmt
{
    public class NewCourseEntity
    {
        public List<TraningInfrastructureEntity> trainingInfrastructureEntities { get; set; }
        public Int64 CourseID { get; set; }
        public Int32 SectorID { get; set; }
        public string Sector { get; set; }
        public Int32 SubSectorID { get; set; }
        public string SubSector { get; set; }
        public Int32 CourseApprovedByID { get; set; }
        public string CourseApprovedBy { get; set; }
        public string CourseName { get; set; }
        public string CourseCode { get; set; }
        public Int16 TrainingModeConventional { get; set; }
        public Int16 TrainingModeDualSystem { get; set; }
        public Int16 TrainingModeBlended { get; set; }
        public Int16 TrainingModeOnline { get; set; }
        public Int16 TrainingModeAllMode { get; set; }
        public Int32 CourseCategoryID { get; set; }
        public Int32 CourseTypeID { get; set; }
        public string CourseType { get; set; }
        public string Duration { get; set; }
        public Int16 CourseDurationunit { get; set; }
        public string Hours { get; set; }
        public string MaxBatchPerDay { get; set; }
        public Int16 NSQFLevelID { get; set; }

        public Int16 TrainingFeeID { get; set; }
        public Int32 MinAge { get; set; }
        public Int32 IntakePerUnit { get; set; }

        public List<MinimumEntryQualificationEntity> MinimumEntryQualificationEntity { get; set; }

        public Int32 BoardCoursesDuration { get; set; }
        public Int16 BoardCoursesDurationUnitID { get; set; }
        public string BoardCoursesDurationUnit { get; set; }

        public Int32 WorkshopFloorPreference { get; set; }
        public Int32 WorkshopSpaceRequired { get; set; }
        public Int32 PowerType { get; set; }
        public decimal PowerInKW { get; set; }

        public Int32 SeparateClassRoomRequired { get; set; }
        public Int32 ClassRoomArea { get; set; }
        public Int32 ClassUtilizationperweekinHours { get; set; }

        public Int32 SeparateDrawingHallRequired { get; set; }
        public Int32 DrawingRoomArea { get; set; }
        public Int32 DrawingUtilizationperweekinHours { get; set; }

        public Int32 SeparateComputerLabRequired { get; set; }
        public Int32 ComputerLabArea { get; set; }
        public Int32 ComputerLabUtilizationperweekinHours { get; set; }

        public Int32 SeparateAgricultureLandRequired { get; set; }
        public Int32 AgricultureLandArea { get; set; }
        public Int32 AgricultureLandUtilizationperweekinHours { get; set; }

        public Int32 SeparateOpenGroundRequired { get; set; }
        public Int32 OpenGroundArea { get; set; }
        public Int32 OpenGroundUtilizationperweekinHours { get; set; }

        public decimal InspectionFees { get; set; }
        public decimal SecurityDeposit { get; set; }
        public decimal RenewalFees { get; set; }

        public DateTime SyllabusVersion { get; set; }
        public string SyllabusVersionDisplay { get; set; }
        public string ModelCurriculumUrl { get; set; }
        public string QualificationPackUrl { get; set; }

        public decimal TheoryDuration { get; set; }
        public decimal PracticalDuration { get; set; }
        public decimal OJTMandatoryDuration { get; set; }
        public decimal OJTOptionalDuration { get; set; }
        public decimal TotalDuration { get; set; }
        public decimal TheoryBoardDuration { get; set; }
        public int TheoryBoardDurationunit { get; set; }
        public string TheoryBoardDurationunitDisplay { get; set; }

        public decimal PracticalBoardDuration { get; set; }
        public int PracticalBoardDurationunit { get; set; }
        public string PracticalBoardDurationunitDisplay { get; set; }
        public decimal OJTMandatoryBoardDuration { get; set; }
        public int OJTMandatoryBoardDurationunit { get; set; }
        public string OJTMandatoryBoardDurationunitDisplay { get; set; }
        public decimal OJTOptionalBoardDuration { get; set; }
        public int OJTOptionalBoardDurationunit { get; set; }
        public string OJTOptionalBoardDurationunitDisplay  { get; set; }
        public decimal TotalBoardDuration { get; set; }
        public int TotalBoardDurationunit { get; set; }
        public string TotalBoardDurationunitDisplay { get; set; }

        public decimal BoardShare { get; set; }
        public decimal SAIShare { get; set; }
        public decimal ExamAssesmentFee { get; set; }
        public decimal AdmissionFees { get; set; }
        public int ExamTypeID { get; set; }

        public int ApprovalGroupID { get; set; }
        public string CourseNameDisplay { get; set; }

        public string CourseCategory { get; set; }
        public string NSQFLevel { get; set; }
        public string TrainingMode { get; set; }
        public string TrainingFeeCategory { get; set; }

        public string TheoryDurationDisplay { get; set; }
        public string PracticalDurationDisplay { get; set; }
        public string OJTOptionalDurationDisplay { get; set; }
        public string OJTMandatoryDurationDisplay { get; set; }
        public string TotalDurationDisplay { get; set; }
        public string WorkshopFloorPreferenceDisplay { get; set; }
        public string PowerTypeDisplay { get; set; }
        public string NewAdmission { get; set; }
        public string DisplayonPortal { get; set; }
        public string NewUnitApplication { get; set; }


    }
}
